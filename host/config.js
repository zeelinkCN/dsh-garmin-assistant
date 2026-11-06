/**
 * 佳明面板 · Host 半 / 配置与共享工具
 *
 * 路由前缀、令牌/密钥路径、安装器、TTL 缓存、数据源探测、日期解析与
 * 少量跨模块共用的小工具。本模块不依赖任何其他 host 模块，是依赖图的根。
 */

import { existsSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const ROUTE = '/garmin-panel/api'

// Windows 上 uv 安装的 console script 带 .exe 后缀；路径同样在 ~/.local/bin
export const IS_WIN = process.platform === 'win32'

export const BIN_DIR = join(homedir(), '.local', 'bin')

export const DEFAULT_BIN = join(BIN_DIR, IS_WIN ? 'garmin-mcp.exe' : 'garmin-mcp')

export const DEFAULT_AUTH_BIN = join(BIN_DIR, IS_WIN ? 'garmin-mcp-auth.exe' : 'garmin-mcp-auth')

export const UV_BIN = join(BIN_DIR, IS_WIN ? 'uv.exe' : 'uv')

/** 兼容不同平台的 uv 可执行文件位置（Windows 必须带 .exe） */
export function resolveUvBin() {
  const candidates = [UV_BIN, join(BIN_DIR, 'uv'), join(BIN_DIR, 'uv.exe')]
  return candidates.find((candidate) => existsSync(candidate)) ?? UV_BIN
}

export const TOKEN_FILE = join(homedir(), '.garminconnect', 'garmin_tokens.json')

export const KEY_FILE = join(homedir(), '.garmin-personal-key')

export const CALL_TIMEOUT_MS = 45_000

export const STALE_AFTER_MS = 30 * 60 * 1000

export const log = (...args) => console.log('[garmin-panel]', ...args)

/* ------------------------------------------------------------------ *
 * 缓存：TTL + in-flight 去重
 * ------------------------------------------------------------------ */
export const cache = new Map()

export async function cached(key, ttlMs, fn) {
  const hit = cache.get(key)
  const now = Date.now()
  if (hit?.inflight) return { data: await hit.inflight, cached: true, at: hit.at }
  if (hit && now - hit.at < ttlMs) return { data: hit.data, cached: true, at: hit.at }
  const p = fn()
  cache.set(key, { at: hit?.at ?? 0, data: hit?.data, inflight: p })
  try {
    const data = await p
    cache.set(key, { at: Date.now(), data, inflight: null })
    return { data, cached: false, at: Date.now() }
  } catch (err) {
    if (hit?.data !== undefined) cache.set(key, { at: hit.at, data: hit.data, inflight: null })
    else cache.delete(key)
    throw err
  }
}

/** 高级模式：garmin-mcp 已安装 + SSO 令牌存在（每次请求现查，成本极低） */
export function advancedOn() {
  return existsSync(DEFAULT_BIN) && existsSync(TOKEN_FILE)
}

/** 当前数据源：官方密钥优先，其次 garmin-mcp/SSO，最后无 */
export function dataSource() {
  const hasKey = existsSync(KEY_FILE)
  const advanced = advancedOn()
  const mode = hasKey ? 'official' : advanced ? 'sso' : 'none'
  const label = hasKey ? (advanced ? 'official+sso' : 'official') : advanced ? 'sso' : 'none'
  return { hasKey, advanced, mode, label }
}

/* ------------------------------------------------------------------ *
 * 日期工具（本地时区）
 * ------------------------------------------------------------------ */
export const pad = (n) => String(n).padStart(2, '0')

export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

export function weekRange(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const dow = (dt.getDay() + 6) % 7 // 周一 = 0
  return { start: shiftDate(dateStr, -dow), end: shiftDate(dateStr, 6 - dow) }
}

/** 允许的最早日期：官方 API 仍保留历史，但更早的数据没有意义 */
export const DAY_MIN = '2010-01-01'

/** 严格校验 "YYYY-MM-DD"（真实存在的日历日）；非法返回 null */
export function validDay(raw) {
  if (typeof raw !== 'string') return null
  const text = raw.trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  // 用 setFullYear 而不是 new Date(y, …)：后者会把 0-99 年当成 1900+year
  const dt = new Date(0)
  dt.setFullYear(year, month - 1, day)
  dt.setHours(0, 0, 0, 0)
  if (dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== day) return null
  return text
}

/**
 * 解析可选 ?date= / body.date 的锚点：
 *  - 合法 YYYY-MM-DD → 原样返回
 *  - 缺失或非法 → 今天
 *  - 未来日期 → 今天（面板只看已经发生的日子）
 *  - 早于 2010-01-01 → 夹到 2010-01-01（官方仍保留历史）
 * 返回值永远是本地时区的 "YYYY-MM-DD"，可直接用于缓存键。
 */
export function resolveDay(raw) {
  const day = validDay(raw)
  const now = today()
  if (!day) return now
  if (day > now) return now
  if (day < DAY_MIN) return DAY_MIN
  return day
}

export const numOrNull = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null)

/** 官方接口的可选字段：失败降级为 null，不让整包失败 */
export async function optionalOfficial(fn) {
  try { return await fn() } catch { return null }
}

/** 百分比：总量缺失返回 null（total=0 也算缺） */
export function percentOf(part, total) {
  return typeof part === 'number' && Number.isFinite(part) && total > 0
    ? round((part / total) * 100, 1)
    : null
}

/** 均值：忽略 null，四舍五入到整数 */
export function avgInt(values) {
  const list = values.filter((v) => typeof v === 'number' && Number.isFinite(v))
  return list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : null
}

/** 活动开始时间 → YYYY-MM-DD（官方 "2026-11-05 07:00:00" 与 MCP 的 ISO 都能取） */
export function activityDateOf(value) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value ?? '').trim())
  return match ? match[1] : null
}

export const round = (n, d = 1) =>
  typeof n === 'number' && isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : null

/* ------------------------------------------------------------------ *
 * 账号状态：把「官方密钥 / SSO 令牌 / 高级模式」合成一份可读的授权体检
 *
 *  - keyValid 复用 setup/status 的 60 秒缓存校验，轮询不重复换令牌
 *  - tokenUpdatedAt 取 ~/.garminconnect/garmin_tokens.json 的 mtime
 *  - tokenExpiresEstimate = mtime + 180 天：Garmin 没有公开 SSO 令牌的
 *    真实过期时间，这是**估算值**，只用于「快到期了」的提前提醒
 * ------------------------------------------------------------------ */
export const TOKEN_EXPIRY_ESTIMATE_DAYS = 180

export const SSO_TOKEN_WARN_DAYS = 150

export function fileMtimeMs(path) {
  try {
    return statSync(path).mtimeMs
  } catch {
    return null
  }
}
