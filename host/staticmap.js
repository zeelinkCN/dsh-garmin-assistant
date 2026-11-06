/**
 * 佳明面板 · Host 半 / 高德静态地图
 *
 * 活动轨迹与路书预览的底图：把 [lat,lng] 轨迹点简化到 ≤100 点，做 WGS84→GCJ-02
 * 纠偏，算出中心点与「刚好装下 bbox」的整数 zoom，向高德静态地图 v3 取一张 PNG，
 * 以 data URL 返回给面板。
 *
 * 约定（与前缀 /roadbook 一致）：
 *  - 高德 Web服务 Key 只在本机 ~/.amap-web-key 读取，不写日志、不出现在响应里；
 *    错误信息只带官方 info/infocode 或 HTTP 状态码。
 *  - 任何失败都不抛异常：缺失 Key / 高德报错 / 网络故障统一降级为
 *    { status: 'unavailable', message }，面板据此回退到 SVG 轨迹图。
 *  - 只缓存成功结果（10 分钟），失败允许立刻重试。
 *
 * 高德静态地图实测（见 garmin-panel-selftest/staticmap.mjs 与真实调用验证）：
 *  - paths=weight,color,transparency,fillcolor,fillTransparency:lng,lat;lng,lat…
 *    weight ∈ [2,15]，transparency ∈ [0,1]，fillcolor 为空时是折线而非多边形。
 *  - markers=size,color,label:lng,lat;lng,lat|size,color,label:lng,lat…
 *    多组标注用 | 分隔（重复 markers= 参数只有第一组生效）。
 *  - zoom z 时世界宽度是 512·2^z 像素（**不是** 256·2^z）：zoom 10 下 0.1°
 *    经度实测 146 px，zoom 14 下 0.01° 实测 233 px，与 512·2^z 吻合。
 */
import { createHash } from 'node:crypto'

import { cache, cached, log } from './config.js'
import {
  ROADBOOK_AMAP_FILE,
  ROADBOOK_AMAP_KEY_CHECK_TTL_MS,
  amapKeyCacheKey,
  amapKeyFrom,
  probeAmapKey,
} from './roadbook.js'

/** 静态地图 v3 服务地址（不含参数） */
export const AMAP_STATICMAP_API = 'https://restapi.amap.com/v3/staticmap'

/** 高德静态地图的 zoom z 对应 512·2^z 像素的世界宽度（实测校准） */
export const AMAP_WORLD_TILE = 512

/** 单次请求超时：15 秒（静态地图比 geocode 略慢，但远不到 45 秒） */
export const STATICMAP_TIMEOUT_MS = 15_000

/** 成功结果缓存 10 分钟（失败不缓存） */
export const STATICMAP_TTL_MS = 10 * 60 * 1000

/** 缓存条目上限，避免面板反复缩放把内存撑大（每条 base64 约 50–250 KB） */
export const STATICMAP_CACHE_MAX = 32

/** 输入点数上限：超出后先均匀抽稀，再走 DP 简化到 100 */
export const STATICMAP_MAX_INPUT = 5000

/** 折线点数上限（高德单条 paths 的坐标点建议 ≤100） */
export const STATICMAP_MAX_PATH_POINTS = 100

/** data URL 体积上限：约 1.5 MB base64 */
export const STATICMAP_MAX_BASE64 = 1_500_000

export const STATICMAP_MIN_EDGE = 200

export const STATICMAP_MAX_EDGE = 1024

export const STATICMAP_DEFAULT_WIDTH = 640

export const STATICMAP_DEFAULT_HEIGHT = 360

/** bbox 只用画布的 92%：留出边距，避免起终点标注图标被裁掉 */
export const STATICMAP_FIT_RATIO = 0.92

export const STATICMAP_MIN_WEIGHT = 2

export const STATICMAP_MAX_WEIGHT = 15

export const STATICMAP_DEFAULT_WEIGHT = 4

export const STATICMAP_DEFAULT_COLOR = '#1E88E5'

export const STATICMAP_START_COLOR = '0x00AA00'

export const STATICMAP_END_COLOR = '0xFF0000'

export const STATICMAP_MISSING_KEY = '未配置高德 Web服务 Key'

export const STATICMAP_NETWORK_ERROR = '地图服务暂不可用'

/** 高德错误码 → 中文提示（不含 Key，也不回显官方原文以外的内容） */
export const AMAP_ERROR_MESSAGES = {
  INVALID_USER_KEY: '高德 Key 无效，请检查 ~/.amap-web-key',
  USERKEY_PLAT_NOMATCH: '这是 JS API Key，需要「Web服务」类型的 Key',
  INVALID_USER_SCODE: '高德 Key 校验失败，请检查 Key 类型',
  USER_KEY_RECYCLED: '高德 Key 已失效，请重新申请',
  DAILY_QUERY_OVER_LIMIT: '高德今日配额已用完',
  CUQPS_HAS_EXCEEDED_THE_LIMIT: '高德请求过于频繁，请稍后重试',
  INSUFFICIENT_PRIVILEGES: '高德 Key 权限不足',
  SERVICE_NOT_AVAILABLE: '高德服务暂时不可用',
  INVALID_PARAMS: '高德拒绝了请求参数',
  UNKNOWN_ERROR: '高德拒绝了请求参数',
}

/* ------------------------------------------------------------------ *
 * 坐标纠偏：WGS84 → GCJ-02
 *
 * 高德底图是 GCJ-02（火星坐标），GPX / 活动轨迹是 WGS84，直接画会偏 300–600 m。
 * 这是公开的标准算法（克拉索夫斯基椭球 + 5 次三角函数扰动），国内误差约 1–2 m。
 * ------------------------------------------------------------------ */
const GCJ_PI = Math.PI

const GCJ_A = 6378245.0

const GCJ_EE = 0.00669342162296594323

/** 中国大陆粗略范围之外不做偏移（与高德官方行为一致） */
export function outOfChina(lng, lat) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
}

function transformLat(x, y) {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += ((20.0 * Math.sin(6.0 * x * GCJ_PI) + 20.0 * Math.sin(2.0 * x * GCJ_PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(y * GCJ_PI) + 40.0 * Math.sin((y / 3.0) * GCJ_PI)) * 2.0) / 3.0
  ret += ((160.0 * Math.sin((y / 12.0) * GCJ_PI) + 320 * Math.sin((y * GCJ_PI) / 30.0)) * 2.0) / 3.0
  return ret
}

function transformLng(x, y) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += ((20.0 * Math.sin(6.0 * x * GCJ_PI) + 20.0 * Math.sin(2.0 * x * GCJ_PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(x * GCJ_PI) + 40.0 * Math.sin((x / 3.0) * GCJ_PI)) * 2.0) / 3.0
  ret += ((150.0 * Math.sin((x / 12.0) * GCJ_PI) + 300.0 * Math.sin((x / 30.0) * GCJ_PI)) * 2.0) / 3.0
  return ret
}

/**
 * WGS84 → GCJ-02。
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @returns {[number, number]} [lng, lat]（GCJ-02）；境外原样返回
 */
export function wgs84ToGcj02(lng, lat) {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return [lng, lat]
  if (outOfChina(lng, lat)) return [lng, lat]
  let dLat = transformLat(lng - 105.0, lat - 35.0)
  let dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * GCJ_PI
  let magic = Math.sin(radLat)
  magic = 1 - GCJ_EE * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / (((GCJ_A * (1 - GCJ_EE)) / (magic * sqrtMagic)) * GCJ_PI)
  dLng = (dLng * 180.0) / ((GCJ_A / sqrtMagic) * Math.cos(radLat) * GCJ_PI)
  return [lng + dLng, lat + dLat]
}

/* ------------------------------------------------------------------ *
 * 轨迹简化
 * ------------------------------------------------------------------ */
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const round6 = (value) =>
  Number.isFinite(value) ? Math.round(value * 1e6) / 1e6 : null

/** 均匀抽稀：保留首尾，索引按等距取整（保证点数正好 ≤ max） */
export function decimatePoints(points, maxPoints) {
  const source = Array.isArray(points) ? points : []
  const n = source.length
  if (n <= maxPoints) return source.slice()
  if (maxPoints <= 1) return source.slice(0, 1)
  const out = []
  for (let i = 0; i < maxPoints; i++) {
    out.push(source[Math.round((i * (n - 1)) / (maxPoints - 1))])
  }
  out[0] = source[0]
  out[maxPoints - 1] = source[n - 1]
  return out
}

/** 点到线段的垂距平方（在经纬度上按中心纬度做 cos 缩放，近似等距） */
function segmentDistanceSq(point, start, end, cosLat) {
  const px = (point.lng - start.lng) * cosLat
  const py = point.lat - start.lat
  const ex = (end.lng - start.lng) * cosLat
  const ey = end.lat - start.lat
  const lengthSq = ex * ex + ey * ey
  if (lengthSq <= 1e-18) return px * px + py * py
  let t = (px * ex + py * ey) / lengthSq
  t = clamp(t, 0, 1)
  const dx = px - ex * t
  const dy = py - ey * t
  return dx * dx + dy * dy
}

function douglasPeucker(points, epsilon) {
  const n = points.length
  if (n <= 2) return points.slice()
  const cosLat = Math.cos((points[0].lat * Math.PI) / 180)
  const keep = new Uint8Array(n)
  keep[0] = 1
  keep[n - 1] = 1
  const epsilonSq = epsilon * epsilon
  const stack = [[0, n - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()
    let farthest = -1
    let farthestSq = 0
    for (let i = first + 1; i < last; i++) {
      const distSq = segmentDistanceSq(points[i], points[first], points[last], cosLat)
      if (distSq > farthestSq) {
        farthestSq = distSq
        farthest = i
      }
    }
    if (farthest > 0 && farthestSq > epsilonSq) {
      keep[farthest] = 1
      stack.push([first, farthest], [farthest, last])
    }
  }
  const out = []
  for (let i = 0; i < n; i++) if (keep[i]) out.push(points[i])
  return out
}

/**
 * 轨迹简化：Douglas–Peucker 自适应 epsilon，仍超过上限时退化为均匀抽稀。
 * 首尾点一定保留，返回值长度 ≤ maxPoints。
 */
export function simplifyPoints(points, maxPoints = STATICMAP_MAX_PATH_POINTS) {
  const source = Array.isArray(points) ? points : []
  if (source.length <= maxPoints) return source.slice()
  if (maxPoints <= 2) return decimatePoints(source, maxPoints)
  let south = Infinity
  let north = -Infinity
  let west = Infinity
  let east = -Infinity
  for (const point of source) {
    south = Math.min(south, point.lat)
    north = Math.max(north, point.lat)
    west = Math.min(west, point.lng)
    east = Math.max(east, point.lng)
  }
  const span = Math.hypot(north - south, east - west)
  let epsilon = Math.max(span / 256, 1e-7)
  let out = douglasPeucker(source, epsilon)
  for (let guard = 0; out.length > maxPoints && guard < 40; guard++) {
    epsilon *= 1.6
    out = douglasPeucker(source, epsilon)
  }
  if (out.length <= maxPoints) return out
  return decimatePoints(source, maxPoints)
}

/* ------------------------------------------------------------------ *
 * Web-Mercator：中心点与 zoom
 * ------------------------------------------------------------------ */
const MAX_MERCATOR_LAT = 85.0511287798

/** 归一化墨卡托 y（0 = 北边界，1 = 南边界） */
export function mercatorY(lat) {
  const rad = (clamp(lat, -MAX_MERCATOR_LAT, MAX_MERCATOR_LAT) * Math.PI) / 180
  return (1 - Math.log(Math.tan(Math.PI / 4 + rad / 2)) / Math.PI) / 2
}

/** 归一化墨卡托 y 的逆变换 */
export function inverseMercatorY(y) {
  return (2 * Math.atan(Math.exp(Math.PI * (1 - 2 * clamp(y, 0, 1)))) - Math.PI / 2) * (180 / Math.PI)
}

/** 归一化墨卡托 x（0 = 西边界，1 = 东边界） */
export const mercatorX = (lng) => (lng + 180) / 360

/**
 * 计算地图视野。
 *
 * Amap 静态地图 zoom z 的世界宽度是 512·2^z 像素（真实调用校准），
 * 所以某 zoom 下 bbox 的像素跨度 = 归一化跨度 × 512·2^z。
 * 取「bbox 仍能装进 92% 画布」的最大 zoom（1..17）。
 *
 * 中心纬度取墨卡托 y 的中点反向换算，保证 bbox 在竖直方向真正居中
 * （低 zoom 下经纬度中点与墨卡托中点会差几十像素）。
 */
export function computeView(points, width, height) {
  let south = Infinity
  let north = -Infinity
  let west = Infinity
  let east = -Infinity
  for (const point of points) {
    if (point.lat < south) south = point.lat
    if (point.lat > north) north = point.lat
    if (point.lng < west) west = point.lng
    if (point.lng > east) east = point.lng
  }
  const centerLng = (west + east) / 2
  const centerLat = inverseMercatorY((mercatorY(north) + mercatorY(south)) / 2)
  const spanX = mercatorX(east) - mercatorX(west)
  const spanY = mercatorY(south) - mercatorY(north)
  const limitX = width * STATICMAP_FIT_RATIO
  const limitY = height * STATICMAP_FIT_RATIO
  let zoom = 1
  for (let z = 17; z >= 1; z--) {
    const world = AMAP_WORLD_TILE * 2 ** z
    if (spanX * world <= limitX && spanY * world <= limitY) {
      zoom = z
      break
    }
  }
  return {
    center: [round6(centerLng), round6(centerLat)],
    zoom,
    bounds: {
      south: round6(south),
      west: round6(west),
      north: round6(north),
      east: round6(east),
    },
  }
}

/* ------------------------------------------------------------------ *
 * 请求准备
 * ------------------------------------------------------------------ */
export function normalizeColor(raw) {
  const text = String(raw ?? '').trim()
  const match = /^#?([0-9a-fA-F]{6})$/.exec(text) ?? /^0x([0-9a-fA-F]{6})$/.exec(text)
  const hex = match ? match[1] : STATICMAP_DEFAULT_COLOR.slice(1)
  return `0x${hex.toUpperCase()}`
}

function resolveSize(body) {
  const rawWidth = Number(body?.width)
  const rawHeight = Number(body?.height)
  const hasWidth = Number.isFinite(rawWidth) && rawWidth > 0
  const hasHeight = Number.isFinite(rawHeight) && rawHeight > 0
  const ratio = STATICMAP_DEFAULT_WIDTH / STATICMAP_DEFAULT_HEIGHT
  let width
  let height
  if (hasWidth && hasHeight) {
    width = rawWidth
    height = rawHeight
  } else if (hasWidth) {
    width = rawWidth
    height = Math.round(rawWidth / ratio)
  } else if (hasHeight) {
    height = rawHeight
    width = Math.round(rawHeight * ratio)
  } else {
    width = STATICMAP_DEFAULT_WIDTH
    height = STATICMAP_DEFAULT_HEIGHT
  }
  return {
    width: Math.round(clamp(width, STATICMAP_MIN_EDGE, STATICMAP_MAX_EDGE)),
    height: Math.round(clamp(height, STATICMAP_MIN_EDGE, STATICMAP_MAX_EDGE)),
  }
}

/** 校验并清洗坐标：非有限值/越界点直接跳过，少于 2 点视为客户端错误 */
export function normalizePoints(raw) {
  if (!Array.isArray(raw)) return { error: 'points 需要是 [lat,lng] 数组' }
  const list = []
  for (const item of raw) {
    if (!Array.isArray(item) || item.length < 2) continue
    const lat = Number(item[0])
    const lng = Number(item[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    if (lat < -MAX_MERCATOR_LAT || lat > MAX_MERCATOR_LAT) continue
    if (lng < -180 || lng > 180) continue
    list.push({ lat, lng })
  }
  if (list.length < 2) return { error: '至少需要 2 个有效坐标点（[lat,lng]）' }
  return { points: list.length > STATICMAP_MAX_INPUT ? decimatePoints(list, STATICMAP_MAX_INPUT) : list }
}

/**
 * 把请求体整理成一次高德请求所需的全部参数。
 * 坐标统一转成 GCJ-02 的 {lat,lng}（高德底图坐标系），并完成简化与视野计算。
 */
export function prepareStaticMap(body = {}) {
  const { points, error } = normalizePoints(body?.points)
  if (error) return { error }
  const coord = body?.coord === 'gcj02' ? 'gcj02' : 'wgs84'
  const converted = points.map((point) => {
    if (coord !== 'wgs84') return { lat: point.lat, lng: point.lng }
    const [lng, lat] = wgs84ToGcj02(point.lng, point.lat)
    return { lat, lng }
  })
  const pathPoints = simplifyPoints(converted, STATICMAP_MAX_PATH_POINTS)
  const { width, height } = resolveSize(body)
  const view = computeView(pathPoints, width, height)
  const weight = Math.round(
    clamp(
      Number.isFinite(Number(body?.weight)) && Number(body?.weight) > 0
        ? Number(body.weight)
        : STATICMAP_DEFAULT_WEIGHT,
      STATICMAP_MIN_WEIGHT,
      STATICMAP_MAX_WEIGHT,
    ),
  )
  return {
    coord,
    kind: body?.kind === 'route' ? 'route' : 'activity',
    color: normalizeColor(body?.color),
    weight,
    width,
    height,
    points: pathPoints,
    center: view.center,
    zoom: view.zoom,
    bounds: view.bounds,
    simplified: pathPoints.length,
  }
}

/* ------------------------------------------------------------------ *
 * URL 构造
 * ------------------------------------------------------------------ */
const coordText = (point) => `${Number(point.lng).toFixed(6)},${Number(point.lat).toFixed(6)}`

/**
 * 构造高德静态地图 URL（含 key，调用方绝不能把返回值写进日志/响应）。
 * paths: weight,color,transparency,fillcolor,fillTransparency:坐标点
 * markers: 两组用 | 分隔（重复 markers 参数只有第一组生效）
 */
export function buildStaticMapUrl({ key, center, zoom, width, height, points, color, weight }) {
  const url = new URL(AMAP_STATICMAP_API)
  url.searchParams.set('location', `${round6(center[0]).toFixed(6)},${round6(center[1]).toFixed(6)}`)
  url.searchParams.set('zoom', String(zoom))
  url.searchParams.set('size', `${width}*${height}`)
  url.searchParams.set('scale', '1')
  url.searchParams.set('paths', `${weight},${color},1,,:${points.map(coordText).join(';')}`)
  url.searchParams.set(
    'markers',
    `mid,${STATICMAP_START_COLOR},A:${coordText(points[0])}|mid,${STATICMAP_END_COLOR},B:${coordText(points[points.length - 1])}`,
  )
  url.searchParams.set('key', key)
  return url.toString()
}

/** 只保留可读的官方错误码，避免把任何 32 位十六进制串（潜在的 Key）带出去 */
function sanitizeAmapDetail(text) {
  const clean = String(text ?? '')
    .replace(/[0-9a-fA-F]{32}/g, '***')
    .replace(/[^\w\u4e00-\u9fa5 .:/-]/g, '')
    .trim()
    .slice(0, 120)
  return clean
}

/** 高德错误响应 → 中文提示（永不包含 Key） */
export function describeAmapFailure(text, status = 0) {
  let info = ''
  let infocode = ''
  try {
    const data = JSON.parse(String(text ?? ''))
    info = String(data?.info ?? '')
    infocode = String(data?.infocode ?? '')
  } catch {
    /* 非 JSON：只能按 HTTP 状态码说 */
  }
  const needle = `${info} ${infocode}`
  for (const [code, message] of Object.entries(AMAP_ERROR_MESSAGES)) {
    if (needle.includes(code)) return message
  }
  if (status === 429) return '高德请求过于频繁，请稍后重试'
  if (status >= 500) return `高德服务暂时不可用（HTTP ${status}）`
  if (status >= 400) return `高德静态地图请求失败（HTTP ${status}）`
  const detail = sanitizeAmapDetail(info || infocode)
  if (!detail) return STATICMAP_NETWORK_ERROR
  if (/^[A-Za-z0-9_]+$/.test(detail)) return `高德静态地图返回错误：${detail}`
  return STATICMAP_NETWORK_ERROR
}

/** 失败统一用这个异常类型，外层映射成 { status: 'unavailable' } */
export class StaticMapError extends Error {
  constructor(message, code = 'UNAVAILABLE') {
    super(message)
    this.name = 'StaticMapError'
    this.code = code
  }
}

async function fetchStaticMapPng({ key, center, zoom, width, height, points, color, weight }) {
  const url = buildStaticMapUrl({ key, center, zoom, width, height, points, color, weight })
  let res
  try {
    res = await fetch(url, {
      headers: { Accept: 'image/png,image/*;q=0.9,*/*;q=0.8' },
      signal: AbortSignal.timeout(STATICMAP_TIMEOUT_MS),
    })
  } catch {
    throw new StaticMapError(STATICMAP_NETWORK_ERROR, 'network')
  }
  const contentType = String(res?.headers?.get?.('content-type') ?? '').toLowerCase()
  if (!res.ok || contentType.includes('json') || contentType.includes('text')) {
    let text = ''
    try {
      text = await res.text()
    } catch {
      text = ''
    }
    throw new StaticMapError(describeAmapFailure(text, res?.status ?? 0), 'amap')
  }
  let buffer
  try {
    buffer = Buffer.from(await res.arrayBuffer())
  } catch {
    throw new StaticMapError(STATICMAP_NETWORK_ERROR, 'network')
  }
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  if (!isPng) {
    // HTTP 200 但内容不是 PNG：高德把错误写成了 JSON
    throw new StaticMapError(
      describeAmapFailure(buffer.toString('utf8', 0, Math.min(buffer.length, 2000)), 200),
      'format',
    )
  }
  const base64 = buffer.toString('base64')
  if (base64.length > STATICMAP_MAX_BASE64) {
    throw new StaticMapError('地图图片过大，请缩小请求尺寸', 'too-large')
  }
  return base64
}

/* ------------------------------------------------------------------ *
 * 缓存
 * ------------------------------------------------------------------ */
const CACHE_PREFIX = 'staticmap:'

/** 只清自己的键，顺便把条目数压回上限（Map 保持插入顺序） */
export function trimStaticMapCache(max = STATICMAP_CACHE_MAX) {
  const keys = []
  for (const key of cache.keys()) {
    if (typeof key === 'string' && key.startsWith(CACHE_PREFIX)) keys.push(key)
  }
  while (keys.length > max) cache.delete(keys.shift())
}

/** 缓存键：sha256(简化后的坐标 + 尺寸 + 颜色 + 粗细 + kind + coord + zoom) */
export function staticMapCacheKey(prepared) {
  const digest = createHash('sha256')
    .update(
      JSON.stringify({
        p: prepared.points.map((point) => [round6(point.lat), round6(point.lng)]),
        w: prepared.width,
        h: prepared.height,
        c: prepared.color,
        k: prepared.kind,
        coord: prepared.coord,
        weight: prepared.weight,
        z: prepared.zoom,
      }),
    )
    .digest('hex')
  return `${CACHE_PREFIX}${digest}`
}

/* ------------------------------------------------------------------ *
 * 对外接口
 * ------------------------------------------------------------------ */

/** 高德 Key 是否可用：复用路书工坊的体检缓存（10 分钟，按 Key 哈希） */
export async function staticMapStatus() {
  const key = amapKeyFrom(ROADBOOK_AMAP_FILE)
  if (!key) return { configured: false, valid: false }
  try {
    const { data } = await cached(amapKeyCacheKey(key), ROADBOOK_AMAP_KEY_CHECK_TTL_MS, () =>
      probeAmapKey(key),
    )
    return { configured: true, valid: data?.valid === true }
  } catch {
    return { configured: true, valid: false }
  }
}

/**
 * POST /garmin-panel/api/staticmap 的实现。
 * 永不抛异常，也永不返回 Key。
 */
export async function staticMapResult(body = {}, options = {}) {
  const key = amapKeyFrom(ROADBOOK_AMAP_FILE)
  if (!key) return { status: 'unavailable', message: STATICMAP_MISSING_KEY }

  const prepared = prepareStaticMap(body)
  if (prepared.error) return { status: 'error', message: prepared.error }

  const cacheKey = staticMapCacheKey(prepared)
  const force = options?.force === true || body?.force === true
  if (force) cache.delete(cacheKey)

  try {
    const { data } = await cached(cacheKey, STATICMAP_TTL_MS, async () => {
      const base64 = await fetchStaticMapPng({ key, ...prepared })
      return {
        status: 'ok',
        dataUrl: `data:image/png;base64,${base64}`,
        center: prepared.center,
        zoom: prepared.zoom,
        bounds: prepared.bounds,
        points: prepared.simplified,
        source: 'amap',
      }
    })
    trimStaticMapCache()
    return data
  } catch (err) {
    const message =
      err instanceof StaticMapError ? err.message : STATICMAP_NETWORK_ERROR
    log('静态地图：', message)
    return { status: 'unavailable', message }
  }
}

/** 读取请求体（默认 2 MB；5000 个坐标点约 120 KB，readJson 的 100 KB 不够用） */
export function readStaticMapBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let raw = ''
    let settled = false
    const finish = (fn, value) => {
      if (settled) return
      settled = true
      fn(value)
    }
    req.setEncoding?.('utf8')
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > maxBytes) {
        finish(reject, new Error('请求体过大'))
        try { req.destroy?.() } catch { /* 已断开 */ }
      }
    })
    req.on('end', () => {
      try {
        finish(resolve, raw ? JSON.parse(raw) : {})
      } catch (err) {
        finish(reject, new Error(`JSON 解析失败：${err.message}`))
      }
    })
    req.on('error', (err) => finish(reject, err))
  })
}
