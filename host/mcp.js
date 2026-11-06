/**
 * 佳明面板 · Host 半 / 高级模式（garmin-mcp）
 *
 * 极简 MCP stdio 客户端、safeTool / cleanToolData、设备与活动详情、
 * 轨迹与 FIT 解析、训练负荷等高级模式构建器。
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inflateRawSync } from 'node:zlib'

import { CALL_TIMEOUT_MS, log, today, shiftDate, DAY_MIN, numOrNull, round, activityDateOf } from './config.js'

/* ------------------------------------------------------------------ *
 * 极简 MCP stdio 客户端（JSON-RPC over newline-delimited stdio）
 * ------------------------------------------------------------------ */
export class GarminMcp {
  constructor(bin) {
    this.bin = bin
    this.proc = null
    this.buffer = ''
    this.nextId = 1
    this.pending = new Map()
    this.starting = null
    this.alive = false
    this.stderrTail = ''
  }

  async ensure() {
    if (this.alive) return
    if (!this.starting) {
      this.starting = this.#start().finally(() => { this.starting = null })
    }
    await this.starting
  }

  async #start() {
    if (!existsSync(this.bin)) throw new Error(`找不到 garmin-mcp：${this.bin}`)
    const proc = spawn(this.bin, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    })
    this.proc = proc
    this.buffer = ''
    this.stderrTail = ''

    proc.stdout.setEncoding('utf8')
    proc.stdout.on('data', (chunk) => this.#onData(chunk))
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', (chunk) => {
      this.stderrTail = (this.stderrTail + chunk).slice(-6000)
    })
    proc.on('exit', (code) => {
      this.alive = false
      this.proc = null
      const err = new Error(`garmin-mcp 退出（code ${code}）`)
      for (const [, entry] of this.pending) entry.reject(err)
      this.pending.clear()
    })

    await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'garmin-panel', version: '0.1.0' },
    })
    this.notify('notifications/initialized', {})
    this.alive = true
    log('MCP 已连接', this.bin)
  }

  #onData(chunk) {
    this.buffer += chunk
    let idx
    while ((idx = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, idx).trim()
      this.buffer = this.buffer.slice(idx + 1)
      if (!line) continue
      let msg
      try { msg = JSON.parse(line) } catch { continue }
      if (msg.id == null) continue
      const entry = this.pending.get(msg.id)
      if (!entry) continue
      this.pending.delete(msg.id)
      if (msg.error) entry.reject(new Error(msg.error.message || 'MCP error'))
      else entry.resolve(msg.result)
    }
  }

  #write(obj) {
    if (!this.proc || !this.proc.stdin.writable) throw new Error('garmin-mcp 未运行')
    this.proc.stdin.write(JSON.stringify(obj) + '\n')
  }

  notify(method, params) {
    try { this.#write({ jsonrpc: '2.0', method, params }) } catch { /* ignore */ }
  }

  request(method, params) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`MCP 调用超时：${method}`))
      }, CALL_TIMEOUT_MS)
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timer); resolve(v) },
        reject: (e) => { clearTimeout(timer); reject(e) },
      })
      try { this.#write({ jsonrpc: '2.0', id, method, params }) }
      catch (err) { clearTimeout(timer); this.pending.delete(id); reject(err) }
    })
  }

  /** 调用一个 Garmin MCP 工具，返回解析后的 JSON（或原始文本） */
  async tool(name, args = {}) {
    await this.ensure()
    const result = await this.request('tools/call', { name, arguments: args })
    const blocks = Array.isArray(result?.content) ? result.content : []
    const text = blocks.filter((b) => b?.type === 'text').map((b) => b.text).join('\n').trim()
    if (result?.isError) throw new Error(text || `${name} 调用失败`)
    if (!text) return null
    try { return JSON.parse(text) } catch { return { text } }
  }

  stop() {
    try { this.proc?.kill() } catch { /* ignore */ }
    this.proc = null
    this.alive = false
  }
}

export async function safeTool(mcp, name, args) {
  try {
    return { ok: true, data: await mcp.tool(name, args) }
  } catch (err) {
    return { ok: false, error: String(err?.message ?? err), name }
  }
}

export const isAuthError = (msg) => /garmin-mcp-auth|Garmin login failed|登录|token/i.test(msg || '')

/* ------------------------------------------------------------------ *
 * 设备工具
 * ------------------------------------------------------------------ */
// 设备类别：码表 / 手表 / 其他（按设备名匹配）
export const DEVICE_KIND_BIKE = /Edge|码表/i

export const DEVICE_KIND_WATCH = /Instinct|Fenix|Forerunner|Venu|Epix|Vivo|Lily|MARQ|Quatix|Approach/i

export function deviceKind(deviceName) {
  const name = String(deviceName ?? '')
  if (DEVICE_KIND_BIKE.test(name)) return 'bike'
  if (DEVICE_KIND_WATCH.test(name)) return 'watch'
  return 'other'
}

/**
 * 把各种时间戳统一成 ISO 字符串，失败返回 null。
 * 兼容：epoch 秒/毫秒、ISO 字符串、Garmin 的本地时间 "YYYY-MM-DD HH:MM:SS"。
 */
export function toIso(value) {
  if (value == null || value === '') return null
  if (typeof value === 'number' || /^\d{10,13}$/.test(String(value).trim())) {
    const n = Number(value)
    const ms = n < 1e12 ? n * 1000 : n // 10 位按秒、13 位按毫秒
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  const text = String(value).trim()
  // 不带时区的 "YYYY-MM-DD HH:MM[:SS]"：Garmin 给的是本地时间，按本地时区解析
  const local = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(text)
  if (local) {
    const d = new Date(
      Number(local[1]),
      Number(local[2]) - 1,
      Number(local[3]),
      Number(local[4]),
      Number(local[5]),
      Number(local[6] ?? 0),
    )
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  const d = new Date(text)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** MCP 工具“无数据”时会返回纯文本（客户端包成 { text }），这里统一判空 */
export function asRecord(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const keys = Object.keys(data)
  if (!keys.length) return null
  if (keys.length === 1 && typeof data.text === 'string') return null
  return data
}

/** 从 /garmin-panel/api/devices/<id> 的末尾取出数字 id */
export function deviceIdFromPath(url) {
  const raw = /\/devices\/([^/]+)\/?$/.exec(url.pathname)?.[1]
  if (!raw || !/^\d+$/.test(raw)) throw new Error(`无效的设备 ID：${raw ?? url.pathname}`)
  const id = Number(raw)
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error(`无效的设备 ID：${raw}`)
  return id
}

/* ------------------------------------------------------------------ *
 * 活动详情 / 离线轨迹
 * ------------------------------------------------------------------ */
export const TRACK_DIR = join(tmpdir(), 'garmin-panel-track')

export const TRACK_MAX_POINTS = 400

export const ACTIVITY_TTL_MS = 60 * 60 * 1000

/** 从 /garmin-panel/api/activities/<id> 或 .../<id>/track 里取出活动 id */
export function activityFromPath(url) {
  const match = /\/activities\/([^/]+)(?:\/(track))?\/?$/.exec(url.pathname)
  if (!match) throw new Error(`无效的活动路径：${url.pathname}`)
  const raw = match[1]
  if (!/^\d+$/.test(raw)) throw new Error(`无效的活动 ID：${raw}`)
  const id = Number(raw)
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error(`无效的活动 ID：${raw}`)
  return { id, track: match[2] === 'track' }
}

/**
 * 心率/功率分区：MCP 返回 [{zoneNumber, secsInZone, zoneLowBoundary}]，
 * 统一成 [{zone, seconds, low, high}]（high 取下一区下界 - 1，Z5 无上界）。
 */
export function normalizeZones(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.zones)
      ? data.zones
      : Array.isArray(data?.timeInZones)
        ? data.timeInZones
        : []
  const rows = list
    .map((z) => ({
      zone: Number(z?.zoneNumber ?? z?.zone ?? z?.zone_number),
      seconds: Number(z?.secsInZone ?? z?.seconds ?? z?.secs_in_zone ?? z?.duration),
      low: Number.isFinite(Number(z?.zoneLowBoundary ?? z?.low ?? z?.lowBoundary))
        ? Number(z?.zoneLowBoundary ?? z?.low ?? z?.lowBoundary)
        : null,
    }))
    .filter((z) => Number.isFinite(z.zone) && z.zone > 0)
    .sort((a, b) => a.zone - b.zone)
  if (!rows.length) return null
  return rows.map((z, i) => ({
    zone: z.zone,
    seconds: Number.isFinite(z.seconds) ? Math.round(z.seconds) : 0,
    low: z.low,
    high: rows[i + 1]?.low != null ? rows[i + 1].low - 1 : null,
  }))
}

export const LAP_FIELDS = [
  'lap_number',
  'distance_meters',
  'duration_seconds',
  'avg_speed_mps',
  'avg_hr_bpm',
  'max_hr_bpm',
  'elevation_gain_meters',
]

/** 圈数据只保留面板要展示的字段，避免整包透传（活动可能有几十圈） */
export function pickLaps(data) {
  const list = Array.isArray(data?.laps) ? data.laps : Array.isArray(data) ? data : []
  if (!list.length) return null
  return {
    laps: list.map((lap) => {
      const out = {}
      for (const key of LAP_FIELDS) {
        const value = lap?.[key]
        out[key] = typeof value === 'number' && isFinite(value) ? value : null
      }
      return out
    }),
  }
}

/** get_activity_gear 直接返回数组；只留展示需要的字段 */
export function gearChips(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.gear) ? data.gear : []
  const chips = list
    .map((g) => ({
      uuid: g?.uuid ?? null,
      name: g?.displayName ?? g?.gearModelName ?? g?.customMakeModel ?? null,
      model: g?.customMakeModel ?? g?.gearModelName ?? null,
      type: g?.gearTypeName ?? null,
    }))
    .filter((g) => typeof g.name === 'string' && g.name)
  return chips.length ? chips : null
}

/** 力量训练判定：MCP type / 官方 typeKey 都可能出现 */
export function isStrengthActivity(summary) {
  const type = String(summary?.type ?? summary?.activity_type ?? summary?.activityType ?? '')
  return /strength|weight|力量/i.test(type)
}

/**
 * A 类活动详情字段（官方 / MCP 两套 summary 命名都能取）。
 * 只补新增键，原有字段不动；缺数据一律 null。
 */
export function activityDetailExtras(summary, effect) {
  if (!summary || typeof summary !== 'object') return null
  const s = summary
  const e = effect && typeof effect === 'object' ? effect : {}
  return {
    max_speed_mps: numOrNull(s.max_speed_mps ?? s.maxSpeedMps),
    elevation_min_meters: numOrNull(
      s.elevation_min_meters ?? s.min_elevation_meters ?? s.elevationMinMeters,
    ),
    elevation_max_meters: numOrNull(
      s.elevation_max_meters ?? s.max_elevation_meters ?? s.elevationMaxMeters,
    ),
    aerobic_label: s.aerobic_label ?? s.aerobicLabel
      ?? s.training_effect_label ?? s.trainingEffectLabel
      ?? e.training_effect_label ?? e.aerobic_label ?? null,
    anaerobic_label: s.anaerobic_label ?? s.anaerobicLabel
      ?? s.anaerobic_training_effect_message ?? s.anaerobicTrainingEffectMessage
      ?? e.anaerobic_label ?? null,
    device_manufacturer: s.device_manufacturer ?? s.deviceManufacturer ?? s.manufacturer ?? null,
    training_load: numOrNull(s.training_load ?? s.trainingLoad ?? e.training_load),
  }
}

/**
 * get_activity_exercise_sets → [{set, exercise, reps, weightKg, durationSec}]
 * Garmin 的 weight 单位是克（-1 表示无负重），REST 组不展示。
 */
export function mapExerciseSets(data) {
  const list = Array.isArray(data?.exerciseSets)
    ? data.exerciseSets
    : Array.isArray(data)
      ? data
      : []
  const sets = []
  for (const row of list) {
    if (!row || typeof row !== 'object') continue
    if (String(row.setType ?? '').toUpperCase() === 'REST') continue
    const first = Array.isArray(row.exercises) ? row.exercises[0] : null
    const category = typeof first?.category === 'string' ? first.category : null
    const name = typeof first?.name === 'string' && first.name
      ? first.name
      : category && !/^UNKNOWN$/i.test(category)
        ? category
        : null
    const weight = numOrNull(row.weight)
    const duration = numOrNull(row.duration)
    sets.push({
      set: sets.length + 1,
      exercise: name,
      reps: numOrNull(row.repetitionCount ?? row.reps),
      weightKg: weight != null && weight >= 0 ? round(weight / 1000, 3) : null,
      durationSec: duration != null ? Math.round(duration) : null,
    })
  }
  return sets.length ? sets : null
}

/** 单活动详情：7 个工具并行，单个失败只让对应字段为 null */
export async function buildActivityDetail(mcp, id) {
  const [summary, splits, hr, power, weather, gear, effect] = await Promise.all([
    safeTool(mcp, 'get_activity', { activity_id: id }),
    safeTool(mcp, 'get_activity_splits', { activity_id: id }),
    safeTool(mcp, 'get_activity_hr_in_timezones', { activity_id: id }),
    safeTool(mcp, 'get_activity_power_in_timezones', { activity_id: id }),
    safeTool(mcp, 'get_activity_weather', { activity_id: id }),
    safeTool(mcp, 'get_activity_gear', { activity_id: id }),
    safeTool(mcp, 'get_training_effect', { activity_id: id }),
  ])
  const summaryRecord = summary.ok ? asRecord(summary.data) : null
  const effectRecord = effect.ok ? asRecord(effect.data) : null
  // 力量训练才补动作组（多一次 MCP 调用，其他运动不付这个成本）
  const setsResult = isStrengthActivity(summaryRecord)
    ? await safeTool(mcp, 'get_activity_exercise_sets', { activity_id: id })
    : null
  return {
    id,
    summary: summaryRecord
      ? { ...summaryRecord, ...activityDetailExtras(summaryRecord, effectRecord) }
      : null,
    splits: splits.ok ? pickLaps(splits.data) : null,
    hrZones: hr.ok ? normalizeZones(hr.data) : null,
    powerZones: power.ok ? normalizeZones(power.data) : null,
    weather: weather.ok ? asRecord(weather.data) : null,
    gear: gear.ok ? gearChips(gear.data) : null,
    effect: effectRecord,
    exerciseSets: setsResult?.ok ? mapExerciseSets(setsResult.data) : null,
  }
}

export const EARTH_RADIUS_M = 6_371_000

export const toRadians = (deg) => (deg * Math.PI) / 180

export function haversineMeters(a, b) {
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** 正则解析 GPX 的 <trkpt>（不引入 XML 依赖；lat/lon 属性顺序随意） */
export function parseGpxPoints(xml) {
  const points = []
  const re = /<trkpt\b([^>]*?)(?:\/>|>([\s\S]*?)<\/trkpt>)/g
  let match
  while ((match = re.exec(xml)) !== null) {
    const attrs = match[1] || ''
    const body = match[2] || ''
    const latRaw = /(?:^|\s)lat\s*=\s*["']\s*([-\d.]+)\s*["']/i.exec(attrs)?.[1]
    const lonRaw = /(?:^|\s)lon\s*=\s*["']\s*([-\d.]+)\s*["']/i.exec(attrs)?.[1]
    const lat = Number(latRaw)
    const lon = Number(lonRaw)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue
    const eleRaw = /<ele>\s*([-\d.]+)\s*<\/ele>/i.exec(body)?.[1]
    const ele = Number(eleRaw)
    const last = points[points.length - 1]
    if (last && last.lat === lat && last.lon === lon) continue // 暂停时常见重复点
    points.push({ lat, lon, ele: Number.isFinite(ele) ? ele : null })
  }
  return points
}

/** 均匀抽稀到最多 max 个点，保留首尾 */
export function decimatePoints(points, max) {
  if (points.length <= max) return points
  const kept = []
  for (let i = 0; i < max; i++) {
    kept.push(points[Math.round((i * (points.length - 1)) / (max - 1))])
  }
  return kept
}

/** 把 GPX 点转成前端要的紧凑轨迹（经纬度保留 5 位、累计距离、抽稀） */
export function buildTrackPayload(points) {
  if (!points.length) return { status: 'no_track' }
  let distance = 0
  const measured = points.map((point, index) => {
    if (index > 0) distance += haversineMeters(points[index - 1], point)
    return { ...point, d: distance }
  })
  const kept = decimatePoints(measured, TRACK_MAX_POINTS)
  const out = kept.map((point) => [round(point.lat, 5), round(point.lon, 5)])
  const lats = out.map((point) => point[0])
  const lons = out.map((point) => point[1])
  const elevation = kept
    .filter((point) => point.ele != null)
    .map((point) => ({ d: round(point.d, 1), e: round(point.ele, 1) }))
  return {
    status: 'ok',
    points: out,
    elevation,
    stats: {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
      distanceM: Math.round(kept[kept.length - 1].d),
    },
  }
}

/** 下载 GPX 并解析；没有文件/没有坐标都算 no_track（面板不显示错误） */
export async function buildActivityTrack(mcp, id) {
  try {
    mkdirSync(TRACK_DIR, { recursive: true })
  } catch { /* 目录不可用时下载工具自己会失败，走 no_track */ }
  const downloaded = await safeTool(mcp, 'download_activity_file', {
    activity_id: id,
    format: 'gpx',
    output_dir: TRACK_DIR,
  })
  if (!downloaded.ok) return { status: 'no_track' }
  const info = downloaded.data
  if (!info || typeof info !== 'object' || Array.isArray(info)) return { status: 'no_track' }
  if (info.status === 'needs_setup') return { status: 'no_track' }
  // 实际返回字段是 file_path；其余别名兜一下不同版本
  const file = [info.file_path, info.path, info.file, info.output_path, info.outputPath, info.filename]
    .find((value) => typeof value === 'string' && value)
  if (!file || !existsSync(file)) return { status: 'no_track' }
  let xml = ''
  try {
    xml = readFileSync(file, 'utf8')
  } catch {
    return { status: 'no_track' }
  }
  return buildTrackPayload(parseGpxPoints(xml))
}

/* ------------------------------------------------------------------ *
 * FIT 原始曲线：纯 Node 解压 ZIP + 解析 FIT record/session
 *
 *  - 官方 Personal API 的 /download-service/files/activity/<id> 直接返回 ZIP，
 *    里面是 <id>_ACTIVITY.fit；这里用 zlib.inflateRawSync 手写最小 ZIP 读取，
 *    默认走中央目录（大小可靠），没有中央目录时回退本地文件头。
 *  - FIT record 字段编号：253=timestamp、3=heart_rate、4=cadence、5=distance(×100)、
 *    6=speed(×1000)、73=enhanced_speed(×1000)、2=altitude(÷5-500)、
 *    78=enhanced_altitude(÷5-500)、7=power、13=temperature。
 *  - session 消息（global 18）给官方口径的 timer/距离/心率/功率，优先于逐点统计。
 *  - 任何失败都降级成 { status:'unavailable' }，绝不抛给路由。
 * ------------------------------------------------------------------ */
export const FIT_MAX_RECORDS = 200_000

export const STREAM_MAX_SAMPLES = 300

export const STREAM_TTL_MS = 60 * 60 * 1000

export const ZIP_EOCD_SIG = 0x06054b50

export const ZIP_CENTRAL_SIG = 0x02014b50

export const ZIP_LOCAL_SIG = 0x04034b50

/** FIT base type 字节的低 5 位 → 字节宽度（0x84=uint16、0x86=uint32…，高位是端序标记） */
export const FIT_BASE_WIDTH = [1, 1, 1, 2, 2, 4, 4, 1, 4, 8, 1, 2, 4, 1, 8, 8, 8]

export function findZipEocd(buffer) {
  const min = Math.max(0, buffer.length - 65_557) // EOCD 最长 22 + 65535 注释
  for (let i = buffer.length - 22; i >= min; i--) {
    if (buffer.readUInt32LE(i) === ZIP_EOCD_SIG) return i
  }
  return -1
}

export function inflateZipEntry(buffer, method, start, size) {
  const raw = buffer.subarray(start, start + size)
  if (method === 0) return raw
  if (method !== 8) throw new Error(`不支持的 ZIP 压缩方式：${method}`)
  return inflateRawSync(raw, { maxOutputLength: 32 * 1024 * 1024 })
}

/** 极简 ZIP 读取（stored/deflate）→ [{ name, data }] */
export function unzipEntries(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 30) throw new Error('ZIP 文件过短')
  const entries = []
  const eocd = findZipEocd(buffer)
  if (eocd >= 0) {
    const count = buffer.readUInt16LE(eocd + 10)
    const directoryOffset = buffer.readUInt32LE(eocd + 16)
    let offset = directoryOffset
    for (let i = 0; i < count && offset + 46 <= buffer.length; i++) {
      if (buffer.readUInt32LE(offset) !== ZIP_CENTRAL_SIG) break
      const method = buffer.readUInt16LE(offset + 10)
      const compSize = buffer.readUInt32LE(offset + 20)
      const nameLen = buffer.readUInt16LE(offset + 28)
      const extraLen = buffer.readUInt16LE(offset + 30)
      const commentLen = buffer.readUInt16LE(offset + 32)
      const localOffset = buffer.readUInt32LE(offset + 42)
      const name = buffer.subarray(offset + 46, offset + 46 + nameLen).toString('utf8')
      if (
        !name.endsWith('/')
        && localOffset + 30 <= buffer.length
        && buffer.readUInt32LE(localOffset) === ZIP_LOCAL_SIG
      ) {
        const localNameLen = buffer.readUInt16LE(localOffset + 26)
        const localExtraLen = buffer.readUInt16LE(localOffset + 28)
        const dataStart = localOffset + 30 + localNameLen + localExtraLen
        const size = compSize || Math.max(0, buffer.length - dataStart)
        try {
          entries.push({ name, data: inflateZipEntry(buffer, method, dataStart, size) })
        } catch {
          // 单个条目损坏不影响其它条目（真正的 FIT 解析失败会走 MCP 兜底）
        }
      }
      offset += 46 + nameLen + extraLen + commentLen
    }
    if (entries.length) return entries
  }
  // 回退：顺序读本地文件头（data descriptor 场景尺寸未知，用剩余长度兜底）
  let offset = 0
  while (offset + 30 <= buffer.length && buffer.readUInt32LE(offset) === ZIP_LOCAL_SIG) {
    const flags = buffer.readUInt16LE(offset + 6)
    const method = buffer.readUInt16LE(offset + 8)
    const compSize = buffer.readUInt32LE(offset + 18)
    const nameLen = buffer.readUInt16LE(offset + 26)
    const extraLen = buffer.readUInt16LE(offset + 28)
    const name = buffer.subarray(offset + 30, offset + 30 + nameLen).toString('utf8')
    const dataStart = offset + 30 + nameLen + extraLen
    const size = compSize || Math.max(0, buffer.length - dataStart)
    entries.push({ name, data: inflateZipEntry(buffer, method, dataStart, size) })
    if (flags & 0x08) break
    offset = dataStart + size
  }
  return entries
}

/** 读一个 FIT 字段（只处理数值型；字符串/数组返回 null，但仍按 size 前进） */
export function readFitField(buffer, offset, size, baseByte, little, end) {
  const base = baseByte & 0x1f
  const width = FIT_BASE_WIDTH[base] ?? size
  if (width <= 0 || offset + width > end) throw new Error('FIT 字段被截断')
  switch (base) {
    case 0x00:
    case 0x02:
    case 0x0a:
    case 0x0d:
      return buffer.readUInt8(offset)
    case 0x01:
      return buffer.readInt8(offset)
    case 0x03:
      return little ? buffer.readInt16LE(offset) : buffer.readInt16BE(offset)
    case 0x04:
    case 0x0b:
      return little ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset)
    case 0x05:
      return little ? buffer.readInt32LE(offset) : buffer.readInt32BE(offset)
    case 0x06:
    case 0x0c:
      return little ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset)
    case 0x08:
      return little ? buffer.readFloatLE(offset) : buffer.readFloatBE(offset)
    case 0x09:
      return little ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset)
    case 0x0e:
      return Number(little ? buffer.readBigInt64LE(offset) : buffer.readBigInt64BE(offset))
    case 0x0f:
    case 0x10:
      return Number(little ? buffer.readBigUInt64LE(offset) : buffer.readBigUInt64BE(offset))
    default:
      return null
  }
}

/** 解析 FIT → { records: 全局 20 的字段表数组, session: 全局 18 的第一条 } */
export function parseFit(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 14) throw new Error('FIT 文件过短')
  const headerSize = buffer.readUInt8(0)
  if (headerSize !== 12 && headerSize !== 14) throw new Error('FIT 头部长度无效')
  if (buffer.subarray(8, 12).toString('ascii') !== '.FIT') throw new Error('FIT 签名缺失')
  const dataSize = buffer.readUInt32LE(4)
  if (!(dataSize > 0)) throw new Error('FIT 数据段为空')
  const end = headerSize + dataSize
  if (end > buffer.length) throw new Error('FIT 数据段被截断')
  const defs = new Map()
  const records = []
  let session = null
  let offset = headerSize
  let lastTimestamp = null
  while (offset < end) {
    if (records.length > FIT_MAX_RECORDS) throw new Error('FIT record 数量异常')
    const header = buffer.readUInt8(offset)
    offset += 1
    let localType = 0
    let compressed = false
    let timeOffset = 0
    if (header & 0x80) {
      // 压缩时间戳头：后 5 位是时间偏移
      localType = (header >> 5) & 0x03
      timeOffset = header & 0x1f
      compressed = true
    } else {
      localType = header & 0x0f
      if (header & 0x40) {
        // 定义消息
        if (offset + 5 > end) throw new Error('FIT 定义消息被截断')
        offset += 1 // reserved
        const architecture = buffer.readUInt8(offset)
        offset += 1
        const little = architecture === 0
        const globalNum = little ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset)
        offset += 2
        const fieldCount = buffer.readUInt8(offset)
        offset += 1
        const fields = []
        for (let i = 0; i < fieldCount; i++) {
          if (offset + 3 > end) throw new Error('FIT 字段定义被截断')
          fields.push({
            num: buffer.readUInt8(offset),
            size: buffer.readUInt8(offset + 1),
            base: buffer.readUInt8(offset + 2),
          })
          offset += 3
        }
        if (header & 0x20) {
          if (offset + 1 > end) throw new Error('FIT 开发者字段被截断')
          const devCount = buffer.readUInt8(offset)
          offset += 1 + devCount * 3
          if (offset > end) throw new Error('FIT 开发者字段被截断')
        }
        defs.set(localType, { globalNum, little, fields })
        continue
      }
    }
    const definition = defs.get(localType)
    if (!definition) throw new Error('FIT 数据消息缺少定义')
    const values = {}
    for (const field of definition.fields) {
      values[field.num] = readFitField(
        buffer,
        offset,
        field.size,
        field.base,
        definition.little,
        end,
      )
      offset += field.size
      if (offset > end) throw new Error('FIT 数据消息被截断')
    }
    if (compressed) {
      if (lastTimestamp == null) continue
      let timestamp = (lastTimestamp & ~0x1f) + timeOffset
      if ((lastTimestamp & 0x1f) > timeOffset) timestamp += 0x20
      values[253] = timestamp
    }
    if (typeof values[253] === 'number') lastTimestamp = values[253]
    if (definition.globalNum === 20) records.push(values)
    else if (definition.globalNum === 18 && !session) session = values
  }
  return { records, session }
}

/** FIT record 字段表 → 归一化样本（时间戳保持 FIT epoch 秒） */
export function normalizeFitRecords(records) {
  const validHr = (value) => (value == null || value === 255 || value === 0 ? null : value)
  const out = []
  for (const row of records) {
    if (!row || typeof row !== 'object') continue
    const distance = numOrNull(row[5])
    const speed = numOrNull(row[73]) ?? numOrNull(row[6])
    const altitude = numOrNull(row[78]) ?? numOrNull(row[2])
    out.push({
      ts: numOrNull(row[253]),
      hr: validHr(numOrNull(row[3])),
      power: numOrNull(row[7]),
      cadence: numOrNull(row[4]),
      speed: speed != null ? speed / 1000 : null,
      alt: altitude != null ? altitude / 5 - 500 : null,
      distance: distance != null ? distance / 100 : null,
      temp: numOrNull(row[13]),
    })
  }
  return out
}

/** session 消息 → 官方口径统计（无效哨兵值 0xFFFFFFFF / 0xFFFF / 255 → null） */
export function fitSessionStats(session) {
  if (!session || typeof session !== 'object') return null
  const num = (field, invalid) => {
    const value = numOrNull(session[field])
    return value != null && value !== invalid ? value : null
  }
  return {
    durationSec: (() => {
      const timer = num(8, 0xffffffff)
      return timer != null && timer > 0 ? Math.round(timer / 1000) : null
    })(),
    distanceM: (() => {
      const distance = num(9, 0xffffffff)
      return distance != null && distance > 0 ? Math.round(distance / 100) : null
    })(),
    avgHr: (() => {
      const value = num(16, 0xffff)
      return value != null && value > 0 && value < 255 ? value : null
    })(),
    maxHr: (() => {
      const value = num(17, 0xffff)
      return value != null && value > 0 && value < 255 ? value : null
    })(),
    avgPower: (() => {
      const value = num(20, 0xffff)
      return value != null && value > 0 && value < 65535 ? value : null
    })(),
    maxPower: (() => {
      const value = num(21, 0xffff)
      return value != null && value > 0 && value < 65535 ? value : null
    })(),
  }
}

/**
 * 归一化样本 → 面板曲线负载：t 为相对首点的秒数、d 为累计米，
 * stats 优先用 session，channels 只列真有数据的通道。
 */
export function buildStreamPayload(rawRecords, session) {
  const rows = (Array.isArray(rawRecords) ? rawRecords : []).filter(
    (row) => row && typeof row === 'object',
  )
  if (!rows.length) throw new Error('FIT 没有 record 数据')
  const firstTimestamp = rows.find((row) => numOrNull(row.ts) != null)?.ts ?? null
  const samples = []
  let lastT = -1
  let accumulated = 0
  for (const row of rows) {
    let t = numOrNull(row.ts) != null && firstTimestamp != null
      ? Math.max(0, Math.round(row.ts - firstTimestamp))
      : lastT + 1
    if (t < lastT) t = lastT // 时间戳回退时保持单调
    const speed = numOrNull(row.speed)
    let distance = numOrNull(row.distance)
    if (distance == null && speed != null) {
      // 没有 distance 字段时按速度积分出累计距离
      accumulated += speed * (lastT < 0 ? 0 : Math.max(0, t - lastT))
      distance = accumulated
    } else if (distance != null) {
      accumulated = distance
    }
    lastT = t
    samples.push({
      t,
      d: distance != null ? round(distance, 1) : null,
      hr: numOrNull(row.hr),
      power: numOrNull(row.power),
      cadence: numOrNull(row.cadence),
      speed: speed != null ? round(speed, 1) : null,
      alt: numOrNull(row.alt) != null ? round(row.alt, 1) : null,
      temp: numOrNull(row.temp) != null ? round(row.temp, 1) : null,
    })
  }
  const hours = samples.map((row) => row.hr).filter((value) => value != null)
  const powers = samples.map((row) => row.power).filter((value) => value != null)
  const last = samples[samples.length - 1]
  const sessionStats = fitSessionStats(session)
  const stats = {
    durationSec: sessionStats?.durationSec ?? last.t,
    distanceM: sessionStats?.distanceM ?? (last.d != null ? Math.round(last.d) : null),
    maxHr: sessionStats?.maxHr ?? (hours.length ? Math.max(...hours) : null),
    avgHr: sessionStats?.avgHr
      ?? (hours.length ? Math.round(hours.reduce((sum, value) => sum + value, 0) / hours.length) : null),
    maxPower: sessionStats?.maxPower ?? (powers.length ? Math.max(...powers) : null),
    avgPower: sessionStats?.avgPower
      ?? (powers.length ? Math.round(powers.reduce((sum, value) => sum + value, 0) / powers.length) : null),
  }
  const channels = []
  for (const key of ['hr', 'power', 'cadence', 'speed', 'alt', 'temp']) {
    if (samples.some((row) => row[key] != null)) channels.push(key)
  }
  if (samples.some((row) => row.d != null)) channels.push('distance')
  return {
    status: 'ok',
    samples: decimatePoints(samples, STREAM_MAX_SAMPLES),
    stats,
    channels,
  }
}

/** 下载官方原始 FIT（ZIP）；直接返回原始 FIT 的账号也能解析 */
export async function fetchActivityFit(personal, id) {
  const buffer = await personal.getBytes(`/download-service/files/activity/${id}`)
  if (!buffer || buffer.length < 100) throw new Error('FIT 文件为空')
  return buffer
}

/** 原始响应 → { records, session }：ZIP 就找 .fit 条目，裸 FIT 直接解析 */
export function parseActivityFitBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 100) throw new Error('FIT 文件过小')
  let fit = buffer
  if (buffer.length >= 4 && buffer.readUInt32LE(0) === ZIP_LOCAL_SIG) {
    const entries = unzipEntries(buffer)
    const entry = entries.find((item) => /\.fit$/i.test(item.name)) ?? entries[0]
    if (!entry) throw new Error('ZIP 中没有文件')
    fit = entry.data
  }
  return parseFit(fit)
}

/** MCP get_activity_fit_messages 兜底：按消息页拉 record（每页最多 5000 条） */
export async function fetchFitMessages(mcp, id) {
  const messages = []
  let offset = 0
  for (let page = 0; page < 8; page++) {
    const result = await safeTool(mcp, 'get_activity_fit_messages', {
      activity_id: id,
      message_types: ['record'],
      include_records: true,
      message_offset: offset,
      message_limit: 5000,
    })
    if (!result.ok) throw new Error(result.error)
    const data = result.data
    const list = Array.isArray(data?.messages) ? data.messages : []
    messages.push(...list)
    offset += list.length
    if (!list.length) break
    const total = numOrNull(data?.pagination?.total_eligible_count)
    if (total == null || offset >= total) break
  }
  return messages
}

/** MCP messages（fitparse 已换算成 SI 单位）→ 归一化样本 */
export function fitRecordsFromMessages(messages) {
  const out = []
  for (const message of Array.isArray(messages) ? messages : []) {
    if (String(message?.type ?? '').toLowerCase() !== 'record') continue
    const fields = Array.isArray(message.fields) ? message.fields : []
    const value = (name) => {
      const field = fields.find((item) => String(item?.name ?? '').toLowerCase() === name)
      return numOrNull(field?.value)
    }
    const hr = value('heart_rate')
    out.push({
      ts: value('timestamp'),
      hr: hr != null && hr !== 255 && hr !== 0 ? hr : null,
      power: value('power'),
      cadence: value('cadence'),
      speed: value('enhanced_speed') ?? value('speed'),
      alt: value('enhanced_altitude') ?? value('altitude'),
      distance: value('distance'),
      temp: value('temperature'),
    })
  }
  return out
}

/**
 * 活动 FIT 曲线：高级模式专用。官方 FIT 下载优先（一次 HTTP + 本地解析），
 * 没有官方密钥时回退 MCP；任何失败都只返回 unavailable。
 */
export async function activityStreamsFor(src, personal, mcp, id) {
  if (!src.advanced) {
    return {
      status: 'advanced_required',
      message: 'FIT 原始曲线需要高级模式（garmin-mcp + Garmin 账号登录）',
    }
  }
  try {
    if (src.hasKey) {
      try {
        const parsed = parseActivityFitBuffer(await fetchActivityFit(personal, id))
        return buildStreamPayload(normalizeFitRecords(parsed.records), parsed.session)
      } catch (err) {
        log('官方 FIT 解析失败，尝试 MCP：', String(err?.message ?? err))
      }
    }
    const records = fitRecordsFromMessages(await fetchFitMessages(mcp, id))
    return buildStreamPayload(records, null)
  } catch (err) {
    return { status: 'unavailable', message: String(err?.message ?? err) }
  }
}

/* ------------------------------------------------------------------ *
 * 各区块的数据装配
 * ------------------------------------------------------------------ */
export async function buildSnapshot(mcp, date) {
  const checks = await Promise.all([
    safeTool(mcp, 'get_stats', { date }),
    safeTool(mcp, 'get_sleep_summary', { date }),
    safeTool(mcp, 'get_training_readiness', { date }),
    safeTool(mcp, 'get_weekly_intensity_minutes', { end_date: date, weeks: 4 }),
    safeTool(mcp, 'get_heart_rates_summary', { date }),
    safeTool(mcp, 'get_respiration_summary', { date }),
    safeTool(mcp, 'get_spo2_data', { date }),
    safeTool(mcp, 'get_hydration_data', { date }),
  ])
  const authError = checks.find((c) => !c.ok && isAuthError(c.error))
  if (authError && checks.every((c) => !c.ok)) {
    return { status: 'unauthenticated', date, message: authError.error }
  }
  const [stats, sleep, readiness, intensity, hr, resp, spo2, hydration] = checks.map((c) =>
    c.ok ? c.data : null,
  )
  const r = Array.isArray(readiness) ? readiness[0] : readiness
  const week = intensity?.weekly_data?.[0] ?? null
  const s = stats ?? {}
  const sl = sleep ?? {}
  return {
    status: 'ok',
    date,
    updatedAt: new Date().toISOString(),
    kpi: {
      readiness: r
        ? { score: r.score, level: r.level, feedback: r.feedback }
        : null,
      sleep: sleep
        ? {
            score: sl.sleep_score,
            qualifier: sl.sleep_score_qualifier,
            hours: sl.sleep_hours,
            deepPct: sl.deep_sleep_percent,
            remPct: sl.rem_sleep_percent,
            hrv: sl.avg_overnight_hrv,
            rhr: sl.resting_heart_rate_bpm,
          }
        : null,
      bodyBattery: {
        current: s.body_battery_current,
        charged: s.body_battery_charged,
        drained: s.body_battery_drained,
        highest: s.body_battery_highest,
        lowest: s.body_battery_lowest,
      },
      rhr: {
        value: s.resting_heart_rate_bpm,
        avg7: s.last_7_days_avg_resting_hr,
        min: s.min_heart_rate_bpm,
        max: s.max_heart_rate_bpm,
      },
      intensity: week
        ? {
            total: week.total_minutes,
            goal: week.weekly_goal,
            moderate: week.moderate_minutes,
            vigorous: week.vigorous_minutes,
          }
        : null,
    },
    today: {
      steps: { value: s.total_steps, goal: s.daily_step_goal, distanceM: s.distance_meters },
      floors: s.floors_ascended,
      calories: { total: s.total_calories, active: s.active_calories, rest: s.bmr_calories },
      stress: { avg: s.avg_stress_level, max: s.max_stress_level, qualifier: s.stress_qualifier },
      hr: hr
        ? {
            rest: hr.resting_heart_rate_bpm,
            avg: hr.avg_heart_rate_bpm,
            max: hr.max_heart_rate_bpm,
            points: hr.data_points_count,
          }
        : null,
      respiration: {
        avg:
          resp?.avg_waking_respiration_rate ??
          resp?.avgRespirationRate ??
          s.avg_waking_respiration ??
          null,
      },
      spo2: spo2 && (spo2.averageSpo2 != null || spo2.avgSpo2 != null)
        ? { avg: spo2.averageSpo2 ?? spo2.avgSpo2, low: spo2.lowestSpo2 ?? null }
        : null,
      hydration: hydration ? { ml: hydration.valueInML, goal: hydration.goalInML } : null,
    },
    recovery: {
      factors: r
        ? [
            ['睡眠', r.sleep_factor_percent],
            ['HRV', r.hrv_factor_percent],
            ['恢复', r.recovery_factor_percent],
            ['负荷', r.training_load_factor_percent],
            ['压力史', r.stress_history_factor_percent],
            ['睡眠史', r.sleep_history_factor_percent],
          ].filter(([, v]) => typeof v === 'number')
        : [],
      recoveryHours: r?.recovery_time_hours ?? null,
      hrvWeekly: r?.hrv_weekly_avg ?? null,
    },
  }
}

export async function buildSleep(mcp, date, days) {
  const start = shiftDate(date, -(days - 1))
  const data = await mcp.tool('get_sleep_summary_range', { start_date: start, end_date: date })
  const nights = (data?.nights ?? []).map((n) => ({
    date: n.date,
    score: n.sleep_score,
    hours: n.sleep_hours,
    deep: n.deep_sleep_percent,
    light: n.light_sleep_percent,
    rem: n.rem_sleep_percent,
    awakeSec: n.awake_seconds,
    hrv: n.avg_overnight_hrv,
    rhr: n.resting_heart_rate_bpm,
  }))
  const withScore = nights.filter((n) => typeof n.score === 'number')
  return {
    date,
    start, end: date, nights,
    avgScore: withScore.length
      ? Math.round(withScore.reduce((a, n) => a + n.score, 0) / withScore.length)
      : null,
    avgHours: nights.length
      ? Math.round((nights.reduce((a, n) => a + (n.hours ?? 0), 0) / nights.length) * 100) / 100
      : null,
  }
}

/** MCP 工具在失败时可能返回 {text: '错误...'}；这类对象不是数据，统一视为 null */
export function cleanToolData(data) {
  if (data === null || data === undefined) return null
  if (typeof data !== 'object') return data
  const keys = Object.keys(data)
  if (keys.length === 0) return null
  if (keys.length === 1 && keys[0] === 'text') return null
  if (typeof data.status === 'string' && data.status === 'error') return null
  return data
}

export async function buildLoad(mcp, date, days) {
  const start = shiftDate(date, -(days - 1))
  const [trend, balance, vo2, ftp, lthr, race, tolerance, toleranceTrend, endurance, hill, acclimation] = await Promise.all([
    safeTool(mcp, 'get_training_load_trend', { start_date: start, end_date: date }),
    safeTool(mcp, 'get_training_load_balance', { date }),
    safeTool(mcp, 'get_vo2max_trend', { start_date: shiftDate(date, -29), end_date: date }),
    safeTool(mcp, 'get_cycling_ftp', {}),
    safeTool(mcp, 'get_lactate_threshold', {}),
    safeTool(mcp, 'get_race_predictions', {}),
    safeTool(mcp, 'get_running_tolerance', { date }),
    safeTool(mcp, 'get_running_tolerance_trend', { start_date: shiftDate(date, -27), end_date: date, aggregation: 'weekly' }),
    safeTool(mcp, 'get_endurance_score', { start_date: shiftDate(date, -29), end_date: date }),
    safeTool(mcp, 'get_hill_score', { start_date: shiftDate(date, -29), end_date: date }),
    safeTool(mcp, 'get_acclimation', { date }),
  ])
  const rows = (trend.ok ? trend.data?.trend : []) ?? []
  const last = rows[rows.length - 1] ?? null
  return {
    date,
    series: rows
      .filter((d) => d.date >= shiftDate(date, -13))
      .map((d) => ({ date: d.date, atl: d.atl, ctl: d.ctl, tsb: d.tsb, acwr: d.acwr })),
    current: last
      ? {
          atl: last.atl, ctl: last.ctl, tsb: last.tsb, acwr: last.acwr,
          acwrStatus: last.acwr_status, acwrPercent: last.acwr_percent,
          status: last.training_status, vo2max: last.vo2_max,
        }
      : null,
    balance: balance.ok ? cleanToolData(balance.data) : null,
    vo2max: (() => {
      const cleaned = vo2.ok ? cleanToolData(vo2.data) : null
      if (!cleaned || typeof cleaned.latest_vo2_max !== 'number') return null
      return { latest: cleaned.latest_vo2_max, change: cleaned.change, sport: cleaned.sport }
    })(),
    ftp: (() => {
      const cleaned = ftp.ok ? cleanToolData(ftp.data) : null
      return cleaned && typeof cleaned.functional_threshold_power_watts === 'number' ? cleaned : null
    })(),
    lactate: (() => {
      const cleaned = lthr.ok ? cleanToolData(lthr.data) : null
      return cleaned && typeof cleaned.functional_threshold_power_watts === 'number' ? cleaned : null
    })(),
    race: (() => {
      const cleaned = race.ok ? cleanToolData(race.data) : null
      const preds = cleaned?.predictions
      return preds && typeof preds === 'object' && Object.keys(preds).length ? preds : null
    })(),
    // 进阶补充：跑步耐受度 / 耐力 / 爬坡 / 热适应（官方 API 没有，仅 SSO 模式）
    tolerance: tolerance.ok ? cleanToolData(tolerance.data) : null,
    toleranceTrend: toleranceTrend.ok ? cleanToolData(toleranceTrend.data) : null,
    endurance: endurance.ok ? cleanToolData(endurance.data) : null,
    hill: hill.ok ? cleanToolData(hill.data) : null,
    acclimation: acclimation.ok ? cleanToolData(acclimation.data) : null,
  }
}

/* ------------------------------------------------------------------ *
 * 设备列表 / 设备详情
 * ------------------------------------------------------------------ */
export async function buildDevices(mcp) {
  // 三个工具互相独立，单个失败不影响其余字段
  const [list, primary, lastUsed] = await Promise.all([
    safeTool(mcp, 'get_devices', {}),
    safeTool(mcp, 'get_primary_training_device', {}),
    safeTool(mcp, 'get_device_last_used', {}),
  ])
  const raw = list.ok && Array.isArray(list.data) ? list.data : []
  const primaryToolId = primary.ok ? primary.data?.primary_device_id ?? null : null
  const lastUsedId = lastUsed.ok ? lastUsed.data?.user_device_id ?? null : null
  const lastUsedName = lastUsed.ok ? lastUsed.data?.device_name ?? null : null
  const lastUsedAt = lastUsed.ok ? toIso(lastUsed.data?.last_upload_time) : null

  // 主训练设备：优先 primary training device，退化为 get_devices 的 is_primary，再退化为最近使用
  const deviceIdOf = (d) => d.device_id ?? d.deviceId ?? null
  const deviceNameOf = (d) => d.device_name ?? d.displayName ?? null
  let primaryId = primaryToolId
  if (primaryId == null) {
    const flagged = raw.find((d) => (d.is_primary ?? d.primaryDevice) === true)
    if (flagged) primaryId = deviceIdOf(flagged)
  }
  if (primaryId == null && lastUsedId != null && raw.some((d) => deviceIdOf(d) === lastUsedId)) {
    primaryId = lastUsedId
  }

  const devices = raw.map((d) => {
    const id = deviceIdOf(d)
    const name = deviceNameOf(d)
    const matchedLastUsed =
      (lastUsedId != null && id === lastUsedId) ||
      (lastUsedName != null && name === lastUsedName)
    // get_devices 若返回同步时间则优先，否则用“最近使用设备”的上传时间
    const sync = toIso(d.last_sync_time ?? d.lastSyncTime) ?? (matchedLastUsed ? lastUsedAt : null)
    return {
      id,
      name,
      model: d.model ?? d.partNumber ?? null,
      serial: d.serial_number ?? d.serialNumber ?? null,
      kind: deviceKind(name),
      isPrimary: primaryId != null && id === primaryId,
      lastSync: sync,
    }
  })

  const latestDevice =
    devices.find((d) => lastUsedId != null && d.id === lastUsedId) ??
    devices.find((d) => lastUsedName != null && d.name === lastUsedName) ??
    null

  return {
    updatedAt: new Date().toISOString(),
    devices,
    latest: {
      id: latestDevice?.id ?? lastUsedId ?? null,
      name: latestDevice?.name ?? lastUsedName ?? null,
      at: lastUsedAt ?? latestDevice?.lastSync ?? null,
    },
  }
}

export async function buildDeviceDetail(mcp, id) {
  const [settings, solar, alarms] = await Promise.all([
    safeTool(mcp, 'get_device_settings', { device_id: id }),
    safeTool(mcp, 'get_device_solar_data', { device_id: id, date: today() }),
    safeTool(mcp, 'get_device_alarms', {}),
  ])

  const settingsData = settings.ok ? asRecord(settings.data) : null
  const solarData = solar.ok ? asRecord(solar.data) : null
  const solarDays = Array.isArray(solarData?.solar_data) ? solarData.solar_data : []
  const alarmList = alarms.ok && Array.isArray(alarms.data?.alarms) ? alarms.data.alarms : null

  return {
    id,
    settings: settingsData,
    solar: solarDays.length ? { device_id: solarData.device_id ?? id, solar_data: solarDays } : null,
    alarms: alarmList,
  }
}

/** 截至某天的最新活动（与官方 buildOfficialActivities 同样 newest-first） */
export async function fetchActivities(mcp, limit, date) {
  const list = await mcp.tool('get_activities_by_date', {
    start_date: DAY_MIN,
    end_date: date,
    page: 0,
    page_size: limit,
  })
  return {
    date,
    activities: list?.activities ?? [],
    count: list?.count ?? 0,
    hasMore: !!list?.has_more,
  }
}

/* ------------------------------------------------------------------ *
 * “B 类”路由：训练计划 / 个人档案 / 女性健康 / 单活动深度分析
 *
 *  - 计划、分析：高级模式（garmin-mcp）专用；未开启返回 advanced_required
 *  - 档案、女性健康：官方 Personal API 优先，MCP 只补官方网关没有的字段
 *  - 每个外部调用都走 safeTool / optionalOfficial，缺数据只让对应块为 null
 *  - 真实字段名来自 2026-11 对 garmin-mcp 与 Personal API 的实测：
 *      get_scheduled_workouts → { count, scheduled_workouts: [...] }
 *      get_garmin_coach_workouts → { plans, training_plans, workouts: [...] }
 *      get_goals → 数组，或 { goals }
 *      get_activity_fit_data → { session, climbs?, power_duration_curve?,
 *                                shift_summary, shifts }
 *      官方 /userprofile-service/userprofile/settings 只有 displayName
 *      （UUID）与 measurementSystem，没有 gender；gender 来自 MCP
 *      get_user_profile 的 userData.gender，姓名来自 get_full_name。
 * ------------------------------------------------------------------ */
export const PLAN_TTL_MS = 20 * 60 * 1000

export const ANALYSIS_TTL_MS = 60 * 60 * 1000

// 与 garmin-mcp 的 power_duration_curve 标签一致，顺序即展示顺序
export const PDC_LABELS = ['5s', '30s', '1min', '5min', '10min', '20min', '60min']

export const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** MCP 工具“无数据”时返回纯文本，客户端包成 { text }；取出列表型载荷 */
export function toolRows(data, keys) {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key]
  }
  return []
}

/** 第一个非空字符串（档案字段别名很多，逐个兜） */
export function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

/** 第一个合法数字（同上） */
export function firstNumber(...values) {
  for (const value of values) {
    const number = numOrNull(value)
    if (number != null) return number
  }
  return null
}

/** 第一个合法日期（统一成 YYYY-MM-DD） */
export function firstDate(...values) {
  for (const value of values) {
    const date = activityDateOf(value)
    if (date) return date
  }
  return null
}

/** Garmin 的性别枚举/字符串 → 'male' | 'female' | null（未知不猜） */
export function normalizeGender(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    // 部分老接口用 genderId：1=男、2=女
    if (value === 1) return 'male'
    if (value === 2) return 'female'
    return null
  }
  if (typeof value !== 'string') return null
  const text = value.trim().toLowerCase()
  if (!text) return null
  if (text === 'male' || text === 'm' || text === 'man' || text === '1') return 'male'
  if (text === 'female' || text === 'f' || text === 'woman' || text === '2') return 'female'
  return null
}

/**
 * 档案里的 gender：官方 settings / MCP get_user_profile / 不同版本命名都覆盖。
 * 实测官方网关没有该字段，所以 /profile 与 /womens 共用这个 helper + 同一份缓存。
 */
export function genderFromProfile(record) {
  if (!record || typeof record !== 'object') return null
  const candidates = [
    record.gender,
    record.genderId,
    record.genderKey,
    record.userProfile?.gender,
    record.userProfile?.genderId,
    record.userData?.gender,
    record.userData?.genderId,
    record.profile?.gender,
  ]
  for (const value of candidates) {
    const gender = normalizeGender(value)
    if (gender) return gender
  }
  return null
}

/** 档案里的姓名；displayName 是 UUID 时不算姓名（实测账号就是 UUID） */
export function nameFromProfile(record) {
  if (!record || typeof record !== 'object') return null
  const candidates = [
    record.fullName,
    record.full_name,
    record.userProfile?.fullName,
    record.userProfile?.full_name,
    record.userData?.fullName,
    record.userData?.full_name,
    record.displayName,
    record.display_name,
  ]
  for (const value of candidates) {
    if (typeof value !== 'string') continue
    const name = value.trim()
    if (!name || UUID_LIKE.test(name)) continue
    return name
  }
  return null
}

/** 单位制：官方 settings 用 measurementSystem，旧接口可能叫 unitSystem */
export function unitSystemFromProfile(record) {
  if (!record || typeof record !== 'object') return null
  const candidates = [
    record.unitSystem,
    record.unit_system,
    record.measurementSystem,
    record.userProfile?.measurementSystem,
    record.userProfile?.unitSystem,
    record.userData?.measurementSystem,
    record.userData?.unitSystem,
  ]
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

/** 计划里的运动类型：MCP 用 sport / workoutType，兼容官方 typeKey */
export function workoutTypeOf(row) {
  return firstString(
    row?.sport,
    row?.type,
    row?.workoutType,
    row?.sportType?.sportTypeKey,
    row?.activityType?.typeKey,
  )
}

/** 秒 → 分钟（整数；缺失或非正数返回 null） */
export function durationMinutesOf(value) {
  const seconds = numOrNull(value)
  return seconds != null && seconds > 0 ? Math.round(seconds / 60) : null
}

/** 米 → 整数米（缺失或非正数返回 null） */
export function distanceMetersOf(value) {
  const meters = numOrNull(value)
  return meters != null && meters > 0 ? Math.round(meters) : null
}

/** 排课工作：get_scheduled_workouts 的 scheduled_workouts / workouts 都能吃 */
export function mapScheduledWorkouts(data) {
  const rows = toolRows(data, ['scheduled_workouts', 'scheduledWorkouts', 'workouts'])
  return rows.map((row, index) => {
    if (!row || typeof row !== 'object') return null
    const workoutId = numOrNull(row.workout_id ?? row.workoutId)
    const scheduledId = numOrNull(row.scheduled_workout_id ?? row.scheduledWorkoutId)
    const id = scheduledId != null
      ? `sched:${scheduledId}`
      : workoutId != null
        ? `workout:${workoutId}`
        : `sched:${index}`
    return {
      id,
      date: activityDateOf(row.date ?? row.scheduleDate ?? row.calendarDate),
      name: firstString(row.name, row.workoutName),
      type: workoutTypeOf(row),
      durationMin: durationMinutesOf(
        row.estimated_duration_seconds ?? row.estimatedDurationInSecs ?? row.durationSeconds,
      ),
      distanceM: distanceMetersOf(
        row.estimated_distance_meters ?? row.estimatedDistanceInMeters,
      ),
      completed: row.completed === true
        || row.is_completed === true
        || row.associatedActivityId != null,
      workoutId,
      source: 'scheduled',
    }
  }).filter(Boolean)
}

/** Garmin Coach 课表：{ plans, training_plans, workouts } → { planName, workouts } */
export function mapCoachPlan(data) {
  if (!data || typeof data !== 'object') return null
  const rows = toolRows(data, ['workouts'])
  const planNames = Array.isArray(data.training_plans)
    ? data.training_plans.filter((name) => typeof name === 'string' && name.trim())
    : []
  const plans = Array.isArray(data.plans) ? data.plans : []
  const planName = firstString(planNames[0], plans[0]?.name)
  const workouts = rows.map((row) => {
    if (!row || typeof row !== 'object') return null
    return {
      date: activityDateOf(row.date ?? row.scheduleDate ?? row.calendarDate),
      name: firstString(row.name, row.workoutName),
      type: workoutTypeOf(row),
      durationMin: durationMinutesOf(
        row.estimated_duration_seconds ?? row.estimatedDurationInSecs ?? row.durationSeconds,
      ),
      completed: row.completed === true
        || row.is_completed === true
        || row.associatedActivityId != null,
      source: 'coach',
    }
  }).filter(Boolean)
  if (!planName && !workouts.length) return null
  return { planName, workouts }
}

/** Garmin 目标周期 → 面板用的 week/month/year */
export function normalizeGoalPeriod(value) {
  const text = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (!text) return null
  if (text === 'monthly') return 'month'
  if (text === 'weekly') return 'week'
  if (text === 'yearly' || text === 'annual') return 'year'
  if (text === 'daily') return 'day'
  return text
}

/**
 * 目标：Connect 新版扁平字段优先，兼容 python-garminconnect 的旧字段。
 * 距离统一换成 km、时长换成分钟，数字对面板更友好（type 已说明单位）。
 */
export function mapGoal(row) {
  if (!row || typeof row !== 'object') return null
  const targetDistance = numOrNull(row.target_distance_meters ?? row.targetDistanceMeters)
  const progressDistance = numOrNull(row.progress_distance_meters ?? row.progressDistanceMeters)
  const targetDuration = numOrNull(row.target_duration_seconds ?? row.targetDurationSeconds)
  const progressDuration = numOrNull(row.progress_duration_seconds ?? row.progressDurationSeconds)
  const targetCalories = numOrNull(row.target_calories ?? row.targetCalories)
  const progressCalories = numOrNull(row.progress_calories ?? row.progressCalories)
  const targetActivities = numOrNull(row.target_activities ?? row.targetActivities)
  const progressActivities = numOrNull(row.progress_activities ?? row.progressActivities)
  const rawType = String(row.goalType ?? row.type ?? '').trim().toLowerCase()
  const legacyTarget = numOrNull(row.goalValue ?? row.targetValue)
  const legacyCurrent = numOrNull(row.currentValue ?? row.progressValue)

  let type = rawType || null
  let target = null
  let current = null
  if (targetDistance != null || rawType === 'distance') {
    type = 'distance'
    target = targetDistance != null ? round(targetDistance / 1000, 1) : legacyTarget
    current = progressDistance != null ? round(progressDistance / 1000, 1) : legacyCurrent
  } else if (targetDuration != null || rawType === 'duration') {
    type = 'duration'
    target = targetDuration != null ? Math.round(targetDuration / 60) : legacyTarget
    current = progressDuration != null ? Math.round(progressDuration / 60) : legacyCurrent
  } else if (targetCalories != null || rawType === 'calories') {
    type = 'calories'
    target = targetCalories ?? legacyTarget
    current = progressCalories ?? legacyCurrent
  } else if (targetActivities != null || rawType === 'activities') {
    type = 'activities'
    target = targetActivities ?? legacyTarget
    current = progressActivities ?? legacyCurrent
  } else {
    target = legacyTarget
    current = legacyCurrent
  }
  if (!type && target == null) return null
  return {
    type,
    target,
    current,
    period: normalizeGoalPeriod(row.period),
    endDate: activityDateOf(row.end_date ?? row.endDate),
  }
}

export function mapGoals(payload) {
  const rows = toolRows(payload, ['goals', 'items', 'data'])
  const goals = rows.map(mapGoal).filter(Boolean)
  return goals.length ? goals : null
}

/**
 * 训练计划：本周排课 + Garmin Coach + 活跃目标。
 * 三个 MCP 工具并行；任何一个失败都只让对应块为空（空数组 / null）。
 */
export async function buildPlan(src, mcp, week) {
  const date = today()
  const [scheduled, coach, goals] = await Promise.all([
    safeTool(mcp, 'get_scheduled_workouts', { start_date: week.start, end_date: week.end }),
    safeTool(mcp, 'get_garmin_coach_workouts', { calendar_date: date }),
    safeTool(mcp, 'get_goals', { goal_type: 'active' }),
  ])
  return {
    status: 'ok',
    source: src.label,
    advanced: true,
    week,
    workouts: scheduled.ok ? mapScheduledWorkouts(scheduled.data) : [],
    coach: coach.ok ? mapCoachPlan(coach.data) : null,
    goals: goals.ok ? mapGoals(goals.data) : null,
  }
}

export async function planFor(src, mcp, week) {
  if (!src.advanced) {
    return { status: 'advanced_required', source: src.label, advanced: false }
  }
  return buildPlan(src, mcp, week)
}

/* ---------------- 单活动深度分析 ---------------- */

/** 功率曲线 → { durations: [{ label, watts }] }；只保留 >0 的时长 */
export function powerCurveDurations(curve) {
  if (!curve) return null
  if (Array.isArray(curve)) {
    const durations = curve.map((row) => {
      if (!row || typeof row !== 'object') return null
      const watts = numOrNull(row.watts ?? row.power ?? row.value)
      const label = firstString(row.label, row.duration, row.duration_label)
      return label && watts != null && watts > 0 ? { label, watts } : null
    }).filter(Boolean)
    return durations.length ? { durations } : null
  }
  if (typeof curve !== 'object') return null
  const durations = PDC_LABELS.map((label) => {
    const watts = numOrNull(curve[label])
    return watts != null && watts > 0 ? { label, watts } : null
  }).filter(Boolean)
  return durations.length ? { durations } : null
}

/** get_power_duration_curve 是“赛季最佳”，只取属于本活动的时长 */
export function powerCurveFromSeasonBests(payload, activityId) {
  const record = asRecord(payload)
  const bests = asRecord(record?.season_bests ?? record?.seasonBests)
  if (!bests) return null
  const durations = PDC_LABELS.map((label) => {
    const entry = asRecord(bests[label])
    if (!entry) return null
    const owner = entry.activity_id ?? entry.activityId
    if (owner == null || String(owner) !== String(activityId)) return null
    const watts = numOrNull(entry.watts ?? entry.power)
    return watts != null && watts > 0 ? { label, watts } : null
  }).filter(Boolean)
  return durations.length ? { durations } : null
}

/** 爬坡：工具给 distance_m / elevation_gain_m / vam_m_per_hr / avg_w_per_kg */
export function mapClimbs(data) {
  const rows = Array.isArray(data?.climbs) ? data.climbs : []
  const climbs = rows.map((row) => {
    if (!row || typeof row !== 'object') return null
    const category = row.category ?? row.climb_category ?? row.climbCategory ?? row.cat ?? null
    const distance = numOrNull(row.distance_m ?? row.distanceM)
    const gain = numOrNull(row.elevation_gain_m ?? row.elevationGainM)
    const vam = numOrNull(row.vam_m_per_hr ?? row.vam ?? row.vamMperHr)
    const wpkg = numOrNull(row.avg_w_per_kg ?? row.wpkg ?? row.w_per_kg ?? row.wattsPerKg)
    return {
      category: category == null ? null : String(category),
      distanceM: distance != null ? Math.round(distance) : null,
      elevationGainM: gain != null ? round(gain, 1) : null,
      vam: vam != null ? Math.round(vam) : null,
      wpkg: wpkg != null ? round(wpkg, 2) : null,
    }
  }).filter(Boolean)
  return climbs.length ? climbs : null
}

/** 电子变速：total_shifts=0 视为没有 DI2 数据（工具会附 note） */
export function mapShifts(data) {
  const summary = asRecord(data?.shift_summary ?? data?.shiftSummary)
  if (!summary) return null
  const total = numOrNull(summary.total_shifts ?? summary.totalShifts ?? summary.total)
  if (total == null || total <= 0) return null
  const count = (value) => {
    const number = numOrNull(value)
    return number != null && number >= 0 ? number : 0
  }
  return {
    total,
    proactive: count(summary.proactive_shifts ?? summary.proactiveShifts ?? summary.proactive),
    reactive: count(summary.reactive_shifts ?? summary.reactiveShifts ?? summary.reactive),
    coasting: count(summary.coasting_shifts ?? summary.coastingShifts ?? summary.coasting),
    spunOut: count(summary.spun_out_shifts ?? summary.spunOutShifts ?? summary.spunOut),
  }
}

/** 心率漂移嵌在 session.hr_drift 里，字段是 hr_drift_pct */
export function mapHrDrift(session) {
  const drift = asRecord(session?.hr_drift ?? session?.hrDrift)
  const percent = numOrNull(drift?.hr_drift_pct ?? drift?.hrDriftPct ?? drift?.percent)
  return percent != null ? { percent: round(percent, 1) } : null
}

/**
 * 活动深度分析：FIT 一次下载（get_activity_fit_data）拿功率曲线/爬坡/漂移/变速。
 * 没有功率曲线时才可能补一次 get_power_duration_curve（会重新下载 FIT）；
 * 两次 MCP 调用各自受 CALL_TIMEOUT_MS 约束，不会无限挂起。
 */
export async function buildActivityAnalysis(src, mcp, id) {
  const fit = await safeTool(mcp, 'get_activity_fit_data', { activity_id: id })
  const data = fit.ok ? asRecord(fit.data) : null
  const session = asRecord(data?.session)

  let powerCurve = data
    ? powerCurveDurations(data.power_duration_curve ?? data.powerDurationCurve ?? data.pdc)
    : null
  const sessionHasPower = [
    session?.avg_power_w,
    session?.normalized_power_w,
    session?.max_power_w,
  ].some((value) => numOrNull(value) != null)
  if (!powerCurve && (!data || sessionHasPower)) {
    const pdc = await safeTool(mcp, 'get_power_duration_curve', {
      num_activities: 1,
      activity_type: 'cycling',
    })
    if (pdc.ok) powerCurve = powerCurveFromSeasonBests(pdc.data, id)
  }

  const climbs = data ? mapClimbs(data) : null
  const hrDrift = session ? mapHrDrift(session) : null
  const shifts = data ? mapShifts(data) : null

  const out = {
    status: 'ok',
    source: src.label,
    advanced: true,
    powerCurve,
    climbs,
    hrDrift,
    shifts,
  }
  if (!powerCurve && !climbs && !hrDrift && !shifts) {
    out.reason = '该活动没有功率计/电子变速数据'
  }
  return out
}

export async function activityAnalysisFor(src, mcp, id) {
  if (!src.advanced) return { status: 'advanced_required' }
  return buildActivityAnalysis(src, mcp, id)
}
