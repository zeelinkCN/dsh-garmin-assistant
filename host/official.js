/**
 * 佳明面板 · Host 半 / 官方 Personal API
 *
 * Personal API 客户端（本地 ApiKey → 24h Bearer）、官方数据映射器与
 * 构建器（快照 / 睡眠 / 趋势 / 活动 / extras / Body Battery / 女性健康 /
 * 活动详情），以及官方与高级模式之间的取数分发器。
 */

import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs'

import { DEFAULT_BIN, TOKEN_FILE, KEY_FILE, log, cached, pad, today, shiftDate, weekRange, numOrNull, optionalOfficial, percentOf, avgInt, round, activityDateOf, fileMtimeMs, TOKEN_EXPIRY_ESTIMATE_DAYS, SSO_TOKEN_WARN_DAYS } from './config.js'
import { safeTool, asRecord, buildActivityDetail, decimatePoints, buildActivityTrack, buildSnapshot, buildSleep, buildLoad, buildDevices, fetchActivities, buildDeviceDetail, firstString, firstNumber, firstDate, genderFromProfile, nameFromProfile, unitSystemFromProfile } from './mcp.js'

/* ------------------------------------------------------------------ *
 * 官方 Personal API 客户端（默认数据源）
 *
 *  - 密钥文件 ~/.garmin-personal-key（0600），只在本地读取
 *  - 先用 ApiKey 换 Bearer JWT（24h），内存缓存到 exp-60s / 23h
 *  - GET 401 自动清缓存重换一次令牌
 *  - 任何日志与响应都不包含密钥或令牌
 * ------------------------------------------------------------------ */
export const PERSONAL_BASE = 'https://personal.connectapi.garmin.com'

export const PERSONAL_TIMEOUT_MS = 20_000

export const PERSONAL_TOKEN_PATH = '/personalapitoken-service/personal-api/personal-api-key/token'

/** JWT payload 里的 exp（毫秒）；解析失败返回 null */
export function jwtExpiryMs(token) {
  const payload = String(token).split('.')[1]
  if (!payload) return null
  try {
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const exp = JSON.parse(json)?.exp
    return Number.isFinite(exp) ? exp * 1000 : null
  } catch {
    return null
  }
}

export class PersonalApi {
  constructor({ keyFile = KEY_FILE, baseUrl = PERSONAL_BASE, timeoutMs = PERSONAL_TIMEOUT_MS } = {}) {
    this.keyFile = keyFile
    this.baseUrl = baseUrl
    this.timeoutMs = timeoutMs
    this.token = null
    this.expiresAt = 0
  }

  /** 有密钥文件就尝试官方数据源（真正校验在 setup/status） */
  get configured() {
    return existsSync(this.keyFile)
  }

  #readKey() {
    if (!existsSync(this.keyFile)) {
      const err = new Error('未配置 Personal API 密钥')
      err.code = 'NO_KEY'
      throw err
    }
    const key = readFileSync(this.keyFile, 'utf8').trim()
    if (!key) {
      const err = new Error('Personal API 密钥文件为空')
      err.code = 'NO_KEY'
      throw err
    }
    return key
  }

  /** 用 ApiKey 换 Bearer 令牌；错误只保留状态码，不携带密钥或响应体 */
  async #exchange(key) {
    let res
    try {
      res = await fetch(`${this.baseUrl}${PERSONAL_TOKEN_PATH}`, {
        method: 'POST',
        headers: { Authorization: `ApiKey ${key}`, Accept: '*/*' },
        signal: AbortSignal.timeout(this.timeoutMs),
      })
    } catch (err) {
      const timeout = err?.name === 'TimeoutError' || err?.name === 'AbortError'
      const wrapped = new Error(timeout ? '令牌交换超时（20 秒）' : '无法连接 Garmin Personal API')
      wrapped.cause = err
      throw wrapped
    }
    const text = await res.text().catch(() => '')
    if (!res.ok) {
      const err = new Error(`Personal API 令牌交换失败（HTTP ${res.status}）`)
      err.status = res.status
      throw err
    }
    const token = text.trim()
    if (!token || /\s/.test(token)) {
      const err = new Error('Personal API 返回的令牌格式不正确')
      err.status = 502
      throw err
    }
    return token
  }

  #adopt(token) {
    const now = Date.now()
    const exp = jwtExpiryMs(token)
    const cap = now + 23 * 60 * 60 * 1000
    // 到期前 60 秒失效；令牌本身就快过期时不缓存，下次直接重换
    const expiry = exp ? Math.min(exp - 60_000, cap) : cap
    this.token = token
    this.expiresAt = Math.max(expiry, now)
  }

  /** 取缓存令牌；缺失或临近过期时重新交换 */
  async bearer() {
    if (this.token && Date.now() < this.expiresAt) return this.token
    const token = await this.#exchange(this.#readKey())
    this.#adopt(token)
    return token
  }

  /** 用候选密钥试换令牌（setup/key 校验用），成功后就地缓存 */
  async probe(candidate) {
    const token = await this.#exchange(String(candidate).trim())
    this.#adopt(token)
    return token
  }

  async #getJson(path) {
    const token = await this.bearer()
    let res
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(this.timeoutMs),
      })
    } catch (err) {
      const timeout = err?.name === 'TimeoutError' || err?.name === 'AbortError'
      throw new Error(
        timeout
          ? `Personal API 超时：${path.split('?')[0]}`
          : `无法连接 Personal API：${path.split('?')[0]}`,
      )
    }
    if (res.status === 401) {
      const err = new Error(`Personal API 未授权：${path.split('?')[0]}`)
      err.status = 401
      throw err
    }
    if (!res.ok) {
      const err = new Error(`Personal API HTTP ${res.status}：${path.split('?')[0]}`)
      err.status = res.status
      throw err
    }
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`Personal API 返回非 JSON：${path.split('?')[0]}`)
    }
  }

  /** GET JSON；401 时清缓存重换令牌再试一次 */
  async getJson(path) {
    try {
      return await this.#getJson(path)
    } catch (err) {
      if (err?.status !== 401) throw err
      this.reset()
      return this.#getJson(path)
    }
  }

  /** GET 原始字节（FIT ZIP 下载用）；错误同样只带状态码，不带响应体 */
  async #getBytes(path) {
    const token = await this.bearer()
    let res
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/zip, application/octet-stream, */*' },
        signal: AbortSignal.timeout(this.timeoutMs),
      })
    } catch (err) {
      const timeout = err?.name === 'TimeoutError' || err?.name === 'AbortError'
      throw new Error(
        timeout
          ? `Personal API 超时：${path.split('?')[0]}`
          : `无法连接 Personal API：${path.split('?')[0]}`,
      )
    }
    if (res.status === 401) {
      const err = new Error(`Personal API 未授权：${path.split('?')[0]}`)
      err.status = 401
      throw err
    }
    if (!res.ok) {
      const err = new Error(`Personal API HTTP ${res.status}：${path.split('?')[0]}`)
      err.status = res.status
      throw err
    }
    return Buffer.from(await res.arrayBuffer())
  }

  /** GET 原始字节；401 时清缓存重换令牌再试一次 */
  async getBytes(path) {
    try {
      return await this.#getBytes(path)
    } catch (err) {
      if (err?.status !== 401) throw err
      this.reset()
      return this.#getBytes(path)
    }
  }

  reset() {
    this.token = null
    this.expiresAt = 0
  }
}

/** 密钥写入：0600；已存在的文件 chmod 兜底（mode 只在新建时生效） */
export function writePersonalKey(key) {
  writeFileSync(KEY_FILE, `${String(key).trim()}\n`, { mode: 0o600 })
  try { chmodSync(KEY_FILE, 0o600) } catch { /* 忽略 chmod 失败 */ }
}

/** 密钥校验错误 → 面板可读文案（绝不回显密钥） */
export function describeKeyError(err) {
  const status = err?.status
  if (status === 401 || status === 403) return '密钥无效或已失效，请到 Garmin Connect 重新生成 Personal API Key'
  if (status) return `Garmin 返回 HTTP ${status}，请稍后重试`
  if (/超时/.test(String(err?.message ?? ''))) return '连接 Garmin 超时，请检查网络后重试'
  return '无法连接 Garmin，请检查网络或密钥是否正确'
}

/** setup/status 的密钥校验做 60 秒缓存，避免轮询时反复换令牌 */
let keyCheckAt = 0

let keyCheckValid = false

export async function validatePersonalKey(personal, { force = false } = {}) {
  if (!force && Date.now() - keyCheckAt < 60_000) return keyCheckValid
  try {
    await personal.bearer()
    keyCheckValid = true
  } catch (err) {
    log('Personal API 密钥校验失败：', err?.status ? `HTTP ${err.status}` : String(err?.message ?? err))
    keyCheckValid = false
  }
  keyCheckAt = Date.now()
  return keyCheckValid
}

/* ------------------------------------------------------------------ *
 * Body Battery 当日曲线（官方 wellness-service）
 *
 * 真实响应：数组，每天一个 { date, charged, drained,
 * bodyBatteryValuesArray: [[epochMs, level], …],
 * bodyBatteryValueDescriptorDTOList: [{…Key:'timestamp'}, {…Key:'bodyBatteryLevel'}] }
 * 数组时间戳是真实 epoch（本地时区渲染即墙钟），通常一天只有几个采样点。
 * ------------------------------------------------------------------ */
export const BODY_BATTERY_TTL_MS = 10 * 60 * 1000

export const BODY_BATTERY_MAX_POINTS = 200

/** 一天的 bodyBatteryValuesArray → [{ t:"HH:MM", level }]（升序） */
export function bodyBatterySeries(day) {
  const rows = Array.isArray(day?.bodyBatteryValuesArray) ? day.bodyBatteryValuesArray : []
  const descriptors = Array.isArray(day?.bodyBatteryValueDescriptorDTOList)
    ? day.bodyBatteryValueDescriptorDTOList
    : []
  const descriptorIndex = (pattern, fallback) => {
    const found = descriptors.findIndex((item) =>
      pattern.test(String(item?.bodyBatteryValueDescriptorKey ?? '')),
    )
    return found >= 0 ? found : fallback
  }
  const tsIndex = descriptorIndex(/timestamp/i, 0)
  const levelIndex = descriptorIndex(/level/i, 1)
  const points = []
  for (const row of rows) {
    let rawTs = null
    let rawLevel = null
    if (Array.isArray(row)) {
      rawTs = row[tsIndex] ?? row[0]
      rawLevel = row[levelIndex] ?? row[1]
    } else if (row && typeof row === 'object') {
      rawTs = row.timestamp ?? row.time ?? row.t ?? row.startTimestamp ?? row.timestampGMT
      rawLevel = row.bodyBatteryLevel ?? row.level ?? row.value ?? row.batteryLevel
    }
    const ms = typeof rawTs === 'number' ? (rawTs < 1e11 ? rawTs * 1000 : rawTs) : Number(rawTs)
    const level = numOrNull(rawLevel)
    const t = localClockOfEpoch(ms)
    if (t == null || level == null) continue
    points.push({ ms, t, level })
  }
  points.sort((a, b) => a.ms - b.ms)
  return points.map(({ t, level }) => ({ t, level }))
}

/** 官方 Body Battery 响应 → 面板 JSON（ok / no_series） */
export function mapBodyBattery(payload, date) {
  const days = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.bodyBatteryValuesArray)
      ? [payload]
      : []
  const day = days.find((row) => row?.date === date) ?? null
  if (!day) return { status: 'no_series', date }
  const series = bodyBatterySeries(day)
  if (!series.length) return { status: 'no_series', date }
  const levels = series.map((point) => point.level)
  return {
    status: 'ok',
    date: day.date ?? date,
    series: decimatePoints(series, BODY_BATTERY_MAX_POINTS),
    charged: numOrNull(day.charged),
    drained: numOrNull(day.drained),
    highest: Math.max(...levels),
    lowest: Math.min(...levels),
  }
}

export async function bodyBatteryFor(src, personal, date) {
  if (!src.hasKey) {
    return { status: 'no_series', date, message: 'Body Battery 曲线需要 Personal API 密钥' }
  }
  // 请求失败直接抛给 route（→ status:'error'），避免把临时故障当成
  // no_series 缓存 10 分钟；真正“当天没有曲线”才返回 no_series。
  const payload = await personal.getJson(
    `/wellness-service/wellness/bodyBattery/reports/daily?startDate=${date}&endDate=${date}`,
  )
  return mapBodyBattery(payload, date)
}

/**
 * 高级模式 extras 的取数（官方 extras 失败/未配置密钥时的兜底）。
 * 放在 official.js 是因为它复用下面的 bodyCompSummary；若放进 mcp.js
 * 会形成 mcp → official → mcp 的循环依赖。
 */
export async function buildExtras(mcp, date) {
  const week = weekRange(date)
  const [sched, gear, devices, records, weigh, goals] = await Promise.all([
    safeTool(mcp, 'get_scheduled_workouts', { start_date: week.start, end_date: week.end }),
    safeTool(mcp, 'get_gear', { include_stats: false }),
    safeTool(mcp, 'get_devices', {}),
    safeTool(mcp, 'get_personal_record', {}),
    safeTool(mcp, 'get_weigh_ins', { start_date: shiftDate(date, -60), end_date: date }),
    safeTool(mcp, 'get_goals', { goal_type: 'active' }),
  ])
  const weighRows = weigh.ok
    ? Array.isArray(weigh.data)
      ? weigh.data
      : Array.isArray(weigh.data?.measurements)
        ? weigh.data.measurements
        : []
    : []
  return {
    date,
    week,
    workouts: sched.ok && typeof sched.data?.count === 'number' ? sched.data : null,
    gear: gear.ok ? gear.data?.gear ?? [] : [],
    devices: devices.ok ? devices.data ?? [] : [],
    records: records.ok && Array.isArray(records.data) ? records.data.slice(0, 8) : [],
    weighIns: weighRows.slice(-12),
    bodyComp: bodyCompSummary(weighRows.slice(-12)),
    goals: goals.ok ? goals.data : null,
  }
}

/* ------------------------------------------------------------------ *
 * 官方 Personal API → 面板 JSON 映射
 *
 * 原则：字段名与 garmin-mcp 版本保持一致（Client 半边只认这套形状）；
 *      官方网关没有的数据保持 null / 空数组，并标 advanced=false。
 * 官方网关不提供的接口（训练状态/准备度/VO2max/赛事预测/装备/排课/
 * 分段/区间/天气）一律不请求，只在高级模式经 garmin-mcp 补。
 * ------------------------------------------------------------------ */
export const DAILY_WINDOW_DAYS = 8

export const WEIGHT_WINDOW_DAYS = 60

/* ------------------------------------------------------------------ *
 * “A 类”展示字段的小工具：本地墙钟 / 圆周均值 / HRV 详情
 * ------------------------------------------------------------------ */

/**
 * Garmin 的 *TimestampLocal 是「本地墙钟」编码的毫秒数：按 UTC 渲染出来
 * 正好是当地时间（例如 2026-10-31 00:40 → UTC 00:40）。因此数字用
 * getUTCHours 取时分；已经是 "…T00:40:00" 的字符串则直接截取时分。
 */
export function garminLocalClock(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    // 13 位是毫秒（Garmin 常用）；10 位按秒兜底
    const d = new Date(value < 1e11 ? value * 1000 : value)
    if (Number.isNaN(d.getTime())) return null
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
  }
  const text = String(value ?? '').trim()
  if (!text) return null
  const match = /(?:^|[T ])(\d{1,2}):(\d{2})(?::\d{2})?/.exec(text)
  if (match) return `${pad(Number(match[1]))}:${match[2]}`
  return null
}

/** 真实 epoch（毫秒或秒）→ 本地时区的 "HH:MM"（Body Battery 用） */
export function localClockOfEpoch(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  const d = new Date(n < 1e11 ? n * 1000 : n)
  if (Number.isNaN(d.getTime())) return null
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** "HH:MM" → 当日分钟数；非法返回 null */
export function clockMinutes(hhmm) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm ?? '').trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

/** 当日分钟数 → "HH:MM"（自动按 24h 环绕） */
export function clockFromMinutes(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  const mins = ((Math.round(n) % 1440) + 1440) % 1440
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`
}

/** 入睡/起床时间的圆周均值（跨午夜也正确），输入是当日分钟数 */
export function circularClockMean(values) {
  const list = values.filter((v) => typeof v === 'number' && Number.isFinite(v))
  if (!list.length) return null
  let sx = 0
  let sy = 0
  for (const minutes of list) {
    const angle = (minutes / 1440) * 2 * Math.PI
    sx += Math.cos(angle)
    sy += Math.sin(angle)
  }
  const angle = Math.atan2(sy / list.length, sx / list.length)
  const normalized = angle < 0 ? angle + 2 * Math.PI : angle
  return clockFromMinutes((normalized / (2 * Math.PI)) * 1440)
}

/** 圆周标准差（分钟，1 位小数）：单点/完全一致为 0，无样本为 null */
export function circularClockStdMinutes(values) {
  const list = values.filter((v) => typeof v === 'number' && Number.isFinite(v))
  if (!list.length) return null
  let sx = 0
  let sy = 0
  for (const minutes of list) {
    const angle = (minutes / 1440) * 2 * Math.PI
    sx += Math.cos(angle)
    sy += Math.sin(angle)
  }
  const r = Math.min(1, Math.hypot(sx / list.length, sy / list.length))
  if (!(r > 0)) return null
  return round(Math.sqrt(-2 * Math.log(r)) * (1440 / (2 * Math.PI)), 1)
}

/**
 * HRV 详情（官方 /hrv-service/hrv/... 的 hrvSummary）→ 面板字段。
 * Garmin 基线：lowUpper / balancedLow / balancedUpper，加昨夜 5 分钟最高。
 */
export function mapHrvDetail(summary) {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) return null
  const baseline = summary.baseline ?? {}
  const status = typeof summary.status === 'string' ? summary.status : null
  const detail = {
    status,
    hrvStatus: status,
    baselineLowUpper: numOrNull(
      baseline.lowUpper ?? summary.baselineLowUpper ?? summary.baselineLow,
    ),
    baselineBalancedLow: numOrNull(
      baseline.balancedLow ?? summary.baselineBalancedLow ?? summary.baselineLow,
    ),
    baselineBalancedHigh: numOrNull(
      baseline.balancedUpper ?? summary.baselineBalancedHigh ?? summary.baselineHigh,
    ),
    lastNight5MinHigh: numOrNull(summary.lastNight5MinHigh ?? summary.lastNightHigh),
    lastNightAvg: numOrNull(summary.lastNightAvg),
    weeklyAvg: numOrNull(summary.weeklyAvg),
  }
  return Object.values(detail).some((value) => value != null) ? detail : null
}

/** 睡眠 DTO → 面板 nights 项（官方不给过夜 HRV/静息心率，保持 null） */
export function mapOfficialSleepNight(dto) {
  if (!dto || typeof dto !== 'object' || Array.isArray(dto)) return null
  const total = numOrNull(dto.sleepTimeSeconds)
  return {
    date: dto.calendarDate ?? null,
    score: numOrNull(dto?.sleepScores?.overall?.value) ?? numOrNull(dto.sleepScore),
    qualifier: dto?.sleepScores?.overall?.qualifierKey ?? null,
    hours: total != null ? round(total / 3600, 2) : null,
    deep: percentOf(dto.deepSleepSeconds, total),
    light: percentOf(dto.lightSleepSeconds, total),
    rem: percentOf(dto.remSleepSeconds, total),
    awakeSec: numOrNull(dto.awakeSleepSeconds ?? dto.awakeSeconds),
    // A 类补充：入睡/起床墙钟、夜醒次数、睡眠压力（真实字段见下，别名兜底）
    sleepStartLocal: garminLocalClock(
      dto.sleepStartTimestampLocal ?? dto.startTimestampLocal ?? dto.sleepStartLocal,
    ),
    sleepEndLocal: garminLocalClock(
      dto.sleepEndTimestampLocal ?? dto.endTimestampLocal ?? dto.sleepEndLocal,
    ),
    awakeCount: numOrNull(dto.awakeCount ?? dto.awakeCountValue ?? dto.awakeEvents),
    sleepStress: numOrNull(dto.avgSleepStress ?? dto.averageSleepStress ?? dto.sleepStress),
    hrv: null,
    rhr: null,
  }
}

/** dailySleep 单日对象 / dailySleepSummariesByDate 数组都能取 */
export function firstSleepDto(payload) {
  if (Array.isArray(payload)) return payload[0] ?? null
  if (Array.isArray(payload?.sleepSummaries)) return payload.sleepSummaries[0] ?? null
  return payload && typeof payload === 'object' ? payload : null
}

export async function buildOfficialSleep(personal, date, days) {
  const start = shiftDate(date, -(days - 1))
  const payload = await personal.getJson(
    `/sleep-service/sleep/dailySleepSummariesByDate?startDate=${start}&endDate=${date}`,
  )
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.sleepSummaries)
      ? payload.sleepSummaries
      : []
  const nights = list
    .filter((dto) => typeof dto?.calendarDate === 'string' && dto.calendarDate >= start && dto.calendarDate <= date)
    .sort((a, b) => a.calendarDate.localeCompare(b.calendarDate))
    .map(mapOfficialSleepNight)
    .filter(Boolean)
  const withScore = nights.filter((n) => typeof n.score === 'number')
  return {
    date,
    start,
    end: date,
    nights,
    avgScore: withScore.length
      ? Math.round(withScore.reduce((a, n) => a + n.score, 0) / withScore.length)
      : null,
    avgHours: nights.length
      ? Math.round((nights.reduce((a, n) => a + (n.hours ?? 0), 0) / nights.length) * 100) / 100
      : null,
  }
}

/* ------------------------------------------------------------------ *
 * 健康趋势（GET /garmin-panel/api/trends?days=7|30）
 *
 *  - 只走官方 Personal API（默认数据源），不做 MCP 兜底
 *  - 4 个接口并行：日汇总（必需）+ HRV / 睡眠 / 体重（optionalOfficial）
 *  - 日汇总整体失败时直接抛给 route 包装器 → { status:'error', message }（Client 显示重试）
 *  - series 每天一行、按日期升序：没有日汇总的那天 hasData=false，指标一律 null（不补 0）
 *  - averages 只对非空值求均值并保留 1 位小数；missing 是被“全空”的顶层指标
 * ------------------------------------------------------------------ */
export const TRENDS_TTL_MS = 15 * 60 * 1000

export const TREND_DAYS_MIN = 7

export const TREND_DAYS_MAX = 30

/** missing 候选键：与 series 的顶层指标同名（体重是 weightKg，不是 weight） */
export const TREND_MISSING_KEYS = [
  'steps',
  'rhr',
  'stress',
  'bodyBattery',
  'respiration',
  'spo2',
  'intensity',
  'sleepScore',
  'hrv',
  'weightKg',
]

/** averages 只统计这几个数值指标（bodyBattery / spo2 / intensity / weightKg 不参与） */
export const TREND_AVERAGE_KEYS = ['rhr', 'hrv', 'stress', 'steps', 'sleepScore', 'sleepHours', 'respiration']

/** ?days 解析：缺省/非法 → 7，截断取整后夹在 7..30（3 → 7，7.9 → 7，45 → 30） */
export function parseTrendDays(raw) {
  const text = raw == null ? '' : String(raw).trim()
  if (!text) return 7
  const value = Number(text)
  if (!Number.isFinite(value)) return 7
  return Math.min(TREND_DAYS_MAX, Math.max(TREND_DAYS_MIN, Math.trunc(value)))
}

/** pulseOx 形状随账号/固件不同：数字或 { value }，键名也有多种别名 */
export function officialSpo2(row) {
  const ox = row?.pulseOx ?? row?.spo2 ?? null
  if (!ox || typeof ox !== 'object') return null
  const pick = (value) =>
    typeof value === 'number' && Number.isFinite(value) ? value : numOrNull(value?.value)
  return (
    pick(ox.averageSpO2)
    ?? pick(ox.averageSpO2Value)
    ?? pick(ox.latestSpO2)
    ?? pick(ox.latestSpo2)
    ?? pick(ox.avgSpO2)
    ?? null
  )
}

/** 当日强度分钟：与 snapshot 的周汇总一致，剧烈分钟按 Garmin 规则双倍计入 */
export function officialIntensity(row) {
  const moderate = numOrNull(row?.intensityMinutes?.moderate)
  const vigorous = numOrNull(row?.intensityMinutes?.vigorous)
  if (moderate == null && vigorous == null) return null
  return (moderate ?? 0) + 2 * (vigorous ?? 0)
}

/** 日汇总 [{calendarDate, …}] → Map<date, row>（只保留窗口内、日期合法的行） */
export function trendDailyByDate(payload, start, end) {
  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : []
  const out = new Map()
  for (const row of rows) {
    const date = row?.calendarDate
    if (typeof date !== 'string' || date < start || date > end) continue
    out.set(date, row)
  }
  return out
}

/** /hrv-service/hrv/daily/<start>/<end> → Map<date, lastNightAvg> */
export function trendHrvByDate(payload) {
  const list = Array.isArray(payload?.hrvSummaries)
    ? payload.hrvSummaries
    : Array.isArray(payload)
      ? payload
      : []
  const out = new Map()
  for (const row of list) {
    const date = row?.calendarDate
    if (typeof date !== 'string') continue
    const value = numOrNull(row?.lastNightAvg)
    if (value == null) continue
    out.set(date, value)
  }
  return out
}

/** dailySleepSummariesByDate → Map<date, { sleepScore, sleepHours, 入睡/起床/夜醒/睡眠压力 }> */
export function trendSleepByDate(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.sleepSummaries)
      ? payload.sleepSummaries
      : []
  const out = new Map()
  for (const dto of list) {
    const date = dto?.calendarDate
    if (typeof date !== 'string') continue
    const seconds = numOrNull(dto?.sleepTimeSeconds)
    out.set(date, {
      sleepScore: numOrNull(dto?.sleepScores?.overall?.value) ?? numOrNull(dto?.sleepScore),
      sleepHours: seconds != null ? round(seconds / 3600, 2) : null,
      // 真实字段：sleepStartTimestampLocal / sleepEndTimestampLocal（本地墙钟毫秒）
      sleepStartLocal: garminLocalClock(
        dto?.sleepStartTimestampLocal ?? dto?.startTimestampLocal ?? dto?.sleepStartLocal,
      ),
      sleepEndLocal: garminLocalClock(
        dto?.sleepEndTimestampLocal ?? dto?.endTimestampLocal ?? dto?.sleepEndLocal,
      ),
      awakeSec: numOrNull(dto?.awakeSleepSeconds ?? dto?.awakeSeconds),
      awakeCount: numOrNull(dto?.awakeCount ?? dto?.awakeCountValue ?? dto?.awakeEvents),
      sleepStress: numOrNull(dto?.avgSleepStress ?? dto?.averageSleepStress ?? dto?.sleepStress),
    })
  }
  return out
}

/** 体重区间 → Map<date, kg>（Garmin 单位是克；同一天多条取最后一条） */
export function trendWeightByDate(payload, start, end) {
  const days = Array.isArray(payload?.dailyWeightSummaries) ? payload.dailyWeightSummaries : []
  const out = new Map()
  for (const day of days) {
    const entries = []
    // allWeightMetrics 先入、latestWeight 后入：同一天以 latestWeight 为准，
    // 缺失 latestWeight 时回退到当天最后一条体测记录。
    if (Array.isArray(day?.allWeightMetrics)) entries.push(...day.allWeightMetrics)
    if (day?.latestWeight && typeof day.latestWeight === 'object') entries.push(day.latestWeight)
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue
      const date = typeof entry.calendarDate === 'string' ? entry.calendarDate : day?.summaryDate
      const grams = numOrNull(entry.weight)
      if (typeof date !== 'string' || date < start || date > end || grams == null) continue
      out.set(date, round(grams / 1000, 3))
    }
  }
  return out
}

/** 逐日对齐成 series；每天一行，缺失指标为 null（绝不补 0） */
export function trendSeries(start, days, daily, hrv, sleep, weight) {
  const series = []
  for (let i = 0; i < days; i++) {
    const date = shiftDate(start, i)
    const row = daily.get(date) ?? null
    const night = sleep.get(date) ?? null
    const battery = row?.bodyBattery ?? null
    const batteryValues = battery
      ? [numOrNull(battery.minValue), numOrNull(battery.maxValue), numOrNull(battery.latestValue)]
      : []
    series.push({
      date,
      steps: numOrNull(row?.movement?.steps?.value),
      rhr: numOrNull(row?.heartRate?.restingValue),
      stress: numOrNull(row?.stress?.avgLevel),
      // 三项都为空时整块给 null，避免出现 { min:null, max:null, latest:null }
      bodyBattery: batteryValues.some((value) => value != null)
        ? { min: batteryValues[0], max: batteryValues[1], latest: batteryValues[2] }
        : null,
      respiration: numOrNull(row?.respiration?.avgValue),
      spo2: officialSpo2(row),
      intensity: officialIntensity(row),
      sleepScore: night?.sleepScore ?? null,
      sleepHours: night?.sleepHours ?? null,
      // A 类睡眠细节：入睡/起床墙钟（"HH:MM"）、夜醒、睡眠压力
      sleepStartLocal: night?.sleepStartLocal ?? null,
      sleepEndLocal: night?.sleepEndLocal ?? null,
      awakeSec: night?.awakeSec ?? null,
      awakeCount: night?.awakeCount ?? null,
      sleepStress: night?.sleepStress ?? null,
      hrv: hrv.get(date) ?? null,
      weightKg: weight.get(date) ?? null,
      // hasData 只看“当天有没有日汇总”；睡眠/HRV 有值也不会把它翻成 true
      hasData: row != null,
    })
  }
  return series
}

/** 均值只算非空值并保留 1 位小数；没有样本返回 null（调用方据此省略该键） */
export function trendAverage(series, key) {
  const values = series
    .map((row) => row[key])
    .filter((value) => typeof value === 'number' && Number.isFinite(value))
  if (!values.length) return null
  return round(values.reduce((sum, value) => sum + value, 0) / values.length, 1)
}

export async function buildOfficialTrends(personal, date, days) {
  const end = date
  const start = shiftDate(end, -(days - 1))
  const [dailyPayload, hrvPayload, sleepPayload, weightPayload] = await Promise.all([
    // 日汇总是主数据：整体失败就直接抛，由 route 包装成 status:'error'
    personal.getJson(`/usersummary-service/v2/dailysummaries?startDate=${start}&endDate=${end}`),
    optionalOfficial(() => personal.getJson(`/hrv-service/hrv/daily/${start}/${end}`)),
    optionalOfficial(
      () => personal.getJson(`/sleep-service/sleep/dailySleepSummariesByDate?startDate=${start}&endDate=${end}`),
    ),
    optionalOfficial(() => personal.getJson(`/weight-service/weight/range/${start}/${end}?includeAll=true`)),
  ])
  const series = trendSeries(
    start,
    days,
    trendDailyByDate(dailyPayload, start, end),
    trendHrvByDate(hrvPayload),
    trendSleepByDate(sleepPayload),
    trendWeightByDate(weightPayload, start, end),
  )
  const averages = {}
  for (const key of TREND_AVERAGE_KEYS) {
    const value = trendAverage(series, key)
    if (value != null) averages[key] = value
  }
  // 睡眠规律性：入睡/起床用圆周均值（跨午夜正确），波动用圆周标准差（分钟）
  const bedtimes = series
    .map((row) => clockMinutes(row.sleepStartLocal))
    .filter((value) => value != null)
  const wakeTimes = series
    .map((row) => clockMinutes(row.sleepEndLocal))
    .filter((value) => value != null)
  const bedtimeAvg = circularClockMean(bedtimes)
  const wakeAvg = circularClockMean(wakeTimes)
  const bedtimeVariabilityMin = circularClockStdMinutes(bedtimes)
  if (bedtimeAvg != null) averages.bedtimeAvg = bedtimeAvg
  if (wakeAvg != null) averages.wakeAvg = wakeAvg
  if (bedtimeVariabilityMin != null) averages.bedtimeVariabilityMin = bedtimeVariabilityMin
  const missing = TREND_MISSING_KEYS.filter((key) => series.every((row) => row[key] == null))
  // 区间内最近一晚的 HRV 详情（基线 / 昨夜最高）；没有 HRV 时不加这个键
  const hrvDetail = latestHrvDetail(hrvPayload)
  return {
    status: 'ok',
    source: 'official',
    date: end,
    days,
    range: { start, end },
    series,
    averages,
    missing,
    ...(hrvDetail ? { hrv: hrvDetail } : {}),
  }
}

/** HRV 区间响应里日期最新的一条 → mapHrvDetail（没有数据返回 null） */
export function latestHrvDetail(payload) {
  const list = Array.isArray(payload?.hrvSummaries)
    ? payload.hrvSummaries
    : Array.isArray(payload)
      ? payload
      : []
  let latest = null
  for (const row of list) {
    if (!row || typeof row !== 'object') continue
    if (typeof row.calendarDate !== 'string') continue
    if (!latest || row.calendarDate > latest.calendarDate) latest = row
  }
  return latest ? mapHrvDetail(latest) : null
}

/** 活动列表项 → 与 garmin-mcp.get_activities 完全同名 */
export function mapOfficialActivity(row) {
  return {
    id: numOrNull(row?.activityId),
    name: row?.activityName ?? null,
    type: row?.activityType?.typeKey ?? null,
    event_type: row?.eventType?.typeKey ?? null,
    start_time: row?.startTimeLocal ?? null,
    distance_meters: numOrNull(row?.distance),
    duration_seconds: numOrNull(row?.duration),
    moving_duration_seconds: numOrNull(row?.movingDuration),
    calories: numOrNull(row?.calories),
    avg_hr_bpm: numOrNull(row?.averageHR),
    max_hr_bpm: numOrNull(row?.maxHR),
    elevation_gain_meters: numOrNull(row?.elevationGain),
    elevation_loss_meters: numOrNull(row?.elevationLoss),
    owner_display_name: row?.ownerDisplayName ?? null,
  }
}

export async function buildOfficialActivities(personal, limit, date) {
  const payload = await personal.getJson(
    `/activitylist-service/activities/search/activities?start=0&limit=${limit}&endDate=${date}`,
  )
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.activities) ? payload.activities : []
  return {
    date,
    start: 0,
    limit,
    count: list.length,
    has_more: list.length >= limit,
    hasMore: list.length >= limit,
    next_start: list.length,
    activities: list.map(mapOfficialActivity),
  }
}

/** 体重区间 → 面板 weighIns（Garmin 的 weight 单位是克） */
export function mapOfficialWeighIns(payload) {
  const days = Array.isArray(payload?.dailyWeightSummaries) ? payload.dailyWeightSummaries : []
  const kg = (grams) => (grams != null ? round(grams / 1000, 3) : null)
  const rows = []
  for (const day of days) {
    const entries = Array.isArray(day?.allWeightMetrics) && day.allWeightMetrics.length
      ? day.allWeightMetrics
      : [day?.latestWeight].filter(Boolean)
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue
      rows.push({
        date: entry.calendarDate ?? day?.summaryDate ?? null,
        weight_kg: kg(numOrNull(entry.weight)),
        bmi: numOrNull(entry.bmi),
        body_fat_percent: numOrNull(entry.bodyFat),
        body_water_percent: numOrNull(entry.bodyWater),
        bone_mass_kg: kg(numOrNull(entry.boneMass)),
        muscle_mass_kg: kg(numOrNull(entry.muscleMass)),
        visceral_fat: numOrNull(entry.visceralFat),
        metabolic_age: numOrNull(entry.metabolicAge),
        source_type: entry.sourceType ?? null,
      })
    }
  }
  return rows.sort((a, b) => String(a.date ?? '').localeCompare(String(b.date ?? ''))).slice(-12)
}

/**
 * 最近一次体成分汇总（extras.bodyComp）：每个字段取“最新非空值”，
 * date 取最近一条带体成分指标的记录日期（只有体重时退回最后一条称重）。
 * 同时兼容官方 weighIns（bone_mass_kg）与 MCP 的 grams 字段。
 */
export function bodyCompSummary(weighIns) {
  const rows = (Array.isArray(weighIns) ? weighIns : []).filter(
    (row) => row && typeof row === 'object' && typeof row.date === 'string',
  )
  if (!rows.length) return null
  const gramsToKg = (value) => {
    const n = numOrNull(value)
    return n != null ? round(n / 1000, 3) : null
  }
  const valueOf = (row, key) => {
    switch (key) {
      case 'weight_kg':
        return numOrNull(row.weight_kg) ?? gramsToKg(row.weight_grams)
      case 'bmi':
        return numOrNull(row.bmi)
      case 'body_fat_percent':
        return numOrNull(row.body_fat_percent) ?? numOrNull(row.bodyFat)
      case 'body_water_percent':
        return numOrNull(row.body_water_percent) ?? numOrNull(row.bodyWater)
      case 'bone_mass_kg':
        return numOrNull(row.bone_mass_kg) ?? gramsToKg(row.bone_mass_grams)
      case 'muscle_mass_kg':
        return numOrNull(row.muscle_mass_kg) ?? gramsToKg(row.muscle_mass_grams)
      default:
        return null
    }
  }
  const metricKeys = [
    'bmi',
    'body_fat_percent',
    'body_water_percent',
    'bone_mass_kg',
    'muscle_mass_kg',
  ]
  const sorted = rows.slice().sort((a, b) => a.date.localeCompare(b.date))
  let anchor = null
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (metricKeys.some((key) => valueOf(sorted[i], key) != null)) {
      anchor = sorted[i]
      break
    }
  }
  if (!anchor) anchor = sorted[sorted.length - 1]
  const summary = { date: anchor.date }
  for (const key of ['weight_kg', ...metricKeys]) {
    let value = null
    for (let i = sorted.length - 1; i >= 0; i--) {
      const candidate = valueOf(sorted[i], key)
      if (candidate != null) {
        value = candidate
        break
      }
    }
    summary[key] = value
  }
  return Object.values(summary).some((value, index) => index > 0 && value != null) ? summary : null
}

export function mapOfficialFitnessAge(data) {
  if (!data || typeof data !== 'object') return null
  return {
    years: round(numOrNull(data.fitnessAge), 1),
    chronologicalAge: numOrNull(data.chronologicalAge),
    achievableFitnessAge: round(numOrNull(data.achievableFitnessAge), 1),
    previousFitnessAge: round(numOrNull(data.previousFitnessAge), 1),
    lastUpdated: data.lastUpdated ?? null,
    components: data.components ?? null,
  }
}

/** 心率分区：Z5 上界取最大心率，其余取下一区下界 - 1 */
export function mapOfficialHrZones(payload) {
  const list = Array.isArray(payload) ? payload : []
  return list.map((row) => {
    const floors = [row?.zone1Floor, row?.zone2Floor, row?.zone3Floor, row?.zone4Floor, row?.zone5Floor]
      .map(numOrNull)
    const maxHr = numOrNull(row?.maxHeartRateUsed)
    return {
      sport: row?.sport ?? null,
      method: row?.trainingMethod ?? null,
      maxHr,
      restingHr: numOrNull(row?.restingHeartRateUsed),
      lactateThresholdHr: numOrNull(row?.lactateThresholdHeartRateUsed),
      zones: floors.map((low, index) => ({
        zone: index + 1,
        low,
        high: index < floors.length - 1
          ? (floors[index + 1] != null ? floors[index + 1] - 1 : null)
          : maxHr,
      })),
    }
  })
}

/** 活动详情 summaryDTO → 与 garmin-mcp.get_activity 完全同名 */
export async function buildOfficialActivityDetail(personal, id) {
  const data = await personal.getJson(`/activity-service/activity/${id}`)
  const s = data?.summaryDTO ?? {}
  const meta = data?.metadataDTO ?? {}
  const summary = {
    id: numOrNull(data?.activityId) ?? id,
    name: data?.activityName ?? null,
    type: data?.activityTypeDTO?.typeKey ?? null,
    event_type: data?.eventTypeDTO?.typeKey ?? null,
    parent_type: numOrNull(data?.activityTypeDTO?.parentTypeId),
    start_time_local: s.startTimeLocal ?? null,
    start_time_gmt: s.startTimeGMT ?? null,
    duration_seconds: numOrNull(s.duration),
    moving_duration_seconds: numOrNull(s.movingDuration),
    elapsed_duration_seconds: numOrNull(s.elapsedDuration),
    distance_meters: numOrNull(s.distance),
    avg_speed_mps: numOrNull(s.averageSpeed),
    max_speed_mps: numOrNull(s.maxSpeed),
    avg_hr_bpm: numOrNull(s.averageHR),
    max_hr_bpm: numOrNull(s.maxHR),
    min_hr_bpm: numOrNull(s.minHR),
    calories: numOrNull(s.calories),
    bmr_calories: numOrNull(s.bmrCalories),
    training_effect: numOrNull(s.trainingEffect),
    anaerobic_training_effect: numOrNull(s.anaerobicTrainingEffect),
    training_effect_label: s.trainingEffectLabel ?? null,
    training_load: numOrNull(s.activityTrainingLoad),
    moderate_intensity_minutes: numOrNull(s.moderateIntensityMinutes),
    vigorous_intensity_minutes: numOrNull(s.vigorousIntensityMinutes),
    elevation_gain_meters: numOrNull(s.elevationGain),
    elevation_loss_meters: numOrNull(s.elevationLoss),
    max_elevation_meters: numOrNull(s.maxElevation),
    min_elevation_meters: numOrNull(s.minElevation),
    // A 类新增（与 MCP 路径同名）：海拔区间 / 训练效果文案
    elevation_min_meters: numOrNull(s.minElevation),
    elevation_max_meters: numOrNull(s.maxElevation),
    aerobic_label: s.trainingEffectLabel ?? s.aerobicTrainingEffectMessage ?? null,
    anaerobic_label: s.anaerobicTrainingEffectMessage ?? null,
    lap_count: numOrNull(meta.lapCount),
    has_splits: false,
    device_manufacturer: meta.manufacturer ?? null,
  }
  return {
    id,
    summary,
    // 官方个人网关没有分段/心率区间/功率区间/天气/装备，保持 null（Client 会显示“没有数据”）
    splits: null,
    hrZones: null,
    powerZones: null,
    weather: null,
    gear: null,
    // 训练效果可以直接从 summaryDTO 得到
    effect: {
      aerobic_effect: numOrNull(s.trainingEffect),
      anaerobic_effect: numOrNull(s.anaerobicTrainingEffect),
    },
    // 动作组只有高级模式（MCP）才有；官方模式保持 null
    exerciseSets: null,
  }
}

/** 日汇总 + 睡眠 + HRV → 面板 snapshot（高级模式再并入准备度/恢复因子） */
export async function buildOfficialSnapshot(personal, mcp, date, advanced) {
  const start = shiftDate(date, -(DAILY_WINDOW_DAYS - 1))
  const [daily, sleepPayload, hrvData, spo2Data, readinessResult] = await Promise.all([
    personal.getJson(`/usersummary-service/v2/dailysummaries?startDate=${start}&endDate=${date}`),
    optionalOfficial(() => personal.getJson(`/sleep-service/sleep/dailySleep?date=${date}`)),
    optionalOfficial(() => personal.getJson(`/hrv-service/hrv/${date}`)),
    optionalOfficial(() => personal.getJson(`/wellness-service/wellness/daily/spo2acclimation/${date}`)),
    advanced ? safeTool(mcp, 'get_training_readiness', { date }) : Promise.resolve({ ok: false }),
  ])
  const rows = Array.isArray(daily?.data) ? daily.data : []
  const record = rows.find((row) => row?.calendarDate === date) ?? {}
  const ready = readinessResult.ok
    ? (Array.isArray(readinessResult.data) ? readinessResult.data[0] : readinessResult.data)
    : null
  const sleepNight = mapOfficialSleepNight(firstSleepDto(sleepPayload))
  const hrv = hrvData?.hrvSummary ?? null
  const hrvDetail = mapHrvDetail(hrv)
  const movement = record.movement ?? {}
  const calories = record.calories ?? {}
  const heartRate = record.heartRate ?? {}
  const stress = record.stress ?? {}
  const battery = record.bodyBattery ?? {}
  const respiration = record.respiration ?? {}
  const hydration = record.hydration ?? {}
  // 本周强度分钟：官方只有日汇总，按周累加（剧烈分钟按 Garmin 规则双倍计入）
  const week = weekRange(date)
  const weekRows = rows.filter((row) => row?.calendarDate >= week.start && row?.calendarDate <= date)
  const moderate = weekRows.reduce((sum, row) => sum + (numOrNull(row?.intensityMinutes?.moderate) ?? 0), 0)
  const vigorous = weekRows.reduce((sum, row) => sum + (numOrNull(row?.intensityMinutes?.vigorous) ?? 0), 0)
  const weekGoal = numOrNull(record.intensityMinutes?.goal)
    ?? numOrNull(weekRows[weekRows.length - 1]?.intensityMinutes?.goal)
  const rhrAvg7 = avgInt(
    rows
      .filter((row) => row?.calendarDate < date)
      .slice(-7)
      .map((row) => numOrNull(row?.heartRate?.restingValue)),
  )
  const rhrSeries = rows
    .filter((row) => row?.calendarDate <= date)
    .slice(-8)
    .map((row) => ({ date: row?.calendarDate ?? null, value: numOrNull(row?.heartRate?.restingValue) }))
    .filter((point) => typeof point.value === 'number')
  const pulseOx = record.pulseOx ?? {}
  const spo2Avg = numOrNull(spo2Data?.averageSpO2)
    ?? numOrNull(spo2Data?.latestSpO2)
    ?? numOrNull(pulseOx.averageSpO2)
    ?? numOrNull(pulseOx.latestSpO2)
  const factors = ready
    ? [
        ['睡眠', ready.sleep_factor_percent],
        ['HRV', ready.hrv_factor_percent],
        ['恢复', ready.recovery_factor_percent],
        ['负荷', ready.training_load_factor_percent],
        ['压力史', ready.stress_history_factor_percent],
        ['睡眠史', ready.sleep_history_factor_percent],
      ].filter(([, value]) => typeof value === 'number')
    : []
  return {
    status: 'ok',
    date,
    updatedAt: new Date().toISOString(),
    kpi: {
      // 官方网关没有训练准备度，只有高级模式（MCP）才有
      readiness: ready ? { score: ready.score, level: ready.level, feedback: ready.feedback } : null,
      sleep: sleepNight
        ? {
            score: sleepNight.score,
            qualifier: sleepNight.qualifier,
            hours: sleepNight.hours,
            deepPct: sleepNight.deep,
            remPct: sleepNight.rem,
            hrv: numOrNull(hrv?.lastNightAvg),
            rhr: numOrNull(heartRate.restingValue),
            // A 类 HRV 详情（新增键，不改原有键）：状态 + 基线 + 昨夜 5 分钟最高
            hrvStatus: hrvDetail?.hrvStatus ?? null,
            baselineLowUpper: hrvDetail?.baselineLowUpper ?? null,
            baselineBalancedLow: hrvDetail?.baselineBalancedLow ?? null,
            baselineBalancedHigh: hrvDetail?.baselineBalancedHigh ?? null,
            lastNight5MinHigh: hrvDetail?.lastNight5MinHigh ?? null,
          }
        : null,
      bodyBattery: {
        current: numOrNull(battery.latestValue),
        charged: numOrNull(battery.chargedValue),
        drained: numOrNull(battery.drainedValue),
        highest: numOrNull(battery.maxValue),
        lowest: numOrNull(battery.minValue),
      },
      rhr: {
        value: numOrNull(heartRate.restingValue),
        avg7: rhrAvg7,
        min: numOrNull(heartRate.minValue),
        max: numOrNull(heartRate.maxValue),
        // 近 8 天静息心率序列（含今天），供前端画迷你趋势
        series: rhrSeries,
      },
      intensity: {
        total: moderate + 2 * vigorous,
        goal: weekGoal,
        moderate,
        vigorous,
      },
    },
    today: {
      steps: {
        value: numOrNull(movement.steps?.value),
        goal: numOrNull(movement.steps?.goal),
        distanceM: numOrNull(movement.steps?.distanceInMeters),
      },
      floors: numOrNull(movement.floorsAscended?.value),
      calories: {
        total: numOrNull(calories.burnedTotal),
        active: numOrNull(calories.burnedActive),
        rest: numOrNull(calories.burnedResting),
      },
      stress: {
        avg: numOrNull(stress.avgLevel),
        max: numOrNull(stress.maxLevel),
        qualifier: typeof stress.qualifier === 'string' ? stress.qualifier.toUpperCase() : null,
      },
      // 官方日汇总只有最低/最高/静息，没有全天平均与采样点数
      hr: {
        rest: numOrNull(heartRate.restingValue),
        avg: null,
        max: numOrNull(heartRate.maxValue),
        points: null,
      },
      respiration: { avg: numOrNull(respiration.avgValue) },
      spo2: spo2Avg != null
        ? { avg: spo2Avg, low: numOrNull(spo2Data?.lowestSpO2) ?? numOrNull(pulseOx.lowestSpO2) }
        : null,
      hydration: numOrNull(hydration.consumedInMl) != null
        ? { ml: numOrNull(hydration.consumedInMl), goal: numOrNull(hydration.goalInMl) }
        : null,
    },
    recovery: {
      factors,
      recoveryHours: ready?.recovery_time_hours ?? null,
      hrvWeekly: numOrNull(hrv?.weeklyAvg),
      // Garmin 的 HRV 状态（BALANCED / UNBALANCED / LOW），健康管家直接用
      hrvStatus: typeof hrv?.status === 'string' ? hrv.status : null,
    },
    // HRV 详情独立成对象（Client 优先读这里，缺失时退回 kpi.sleep 的同名字段）
    hrv: hrvDetail,
    source: advanced ? 'official+sso' : 'official',
    advanced,
  }
}

/** 官方 extras：体重/健身年龄/心率分区；高级模式再并入装备/设备/排课/记录/目标 */
export async function buildOfficialExtras(personal, mcp, date, advanced) {
  const week = weekRange(date)
  const from = shiftDate(date, -WEIGHT_WINDOW_DAYS)
  const [weightPayload, fitnessData, zonesData, mcpData] = await Promise.all([
    optionalOfficial(() => personal.getJson(`/weight-service/weight/range/${from}/${date}?includeAll=true`)),
    optionalOfficial(() => personal.getJson(`/fitnessage-service/fitnessage/v2/${date}`)),
    optionalOfficial(() => personal.getJson('/biometric-service/heartRateZones/v2')),
    advanced ? buildExtras(mcp, date) : Promise.resolve(null),
  ])
  const weighIns = mapOfficialWeighIns(weightPayload)
  return {
    date,
    week,
    workouts: mcpData?.workouts ?? null,
    gear: mcpData?.gear ?? [],
    devices: mcpData?.devices ?? [],
    records: mcpData?.records ?? [],
    weighIns,
    // 体成分：最近一次非空测量（体重 + BMI/体脂/体水/骨量/肌肉量）
    bodyComp: bodyCompSummary(weighIns),
    goals: mcpData?.goals ?? null,
    fitnessAge: mapOfficialFitnessAge(fitnessData),
    hrZones: mapOfficialHrZones(zonesData),
  }
}

/* ------------------------------------------------------------------ *
 * 数据源分发：官方优先，高级模式补齐；官方失败时按配置降级
 * ------------------------------------------------------------------ */
export async function snapshotFor(src, personal, mcp, date) {
  if (src.hasKey) {
    try {
      return await buildOfficialSnapshot(personal, mcp, date, src.advanced)
    } catch (err) {
      log('官方 snapshot 失败：', String(err?.message ?? err))
      if (!src.advanced) {
        return {
          status: 'unauthenticated',
          date,
          message: 'Personal API 密钥无效或已过期，请重新设置密钥，或改用 Garmin 账号登录（高级模式）',
          source: 'official',
          advanced: false,
        }
      }
    }
  }
  if (src.advanced) return { ...(await buildSnapshot(mcp, date)), source: 'sso', advanced: true }
  return {
    status: 'unauthenticated',
    date,
    message: '尚未配置任何 Garmin 数据源，请先设置 Personal API 密钥',
    source: 'none',
    advanced: false,
  }
}

export async function sleepFor(src, personal, mcp, date, days) {
  if (src.hasKey) {
    try {
      const data = await buildOfficialSleep(personal, date, days)
      return { ...data, source: src.advanced ? 'official+sso' : 'official', advanced: src.advanced }
    } catch (err) {
      log('官方 sleep 失败：', String(err?.message ?? err))
    }
  }
  if (src.advanced) return { ...(await buildSleep(mcp, date, days)), source: 'sso', advanced: true }
  return {
    date,
    start: shiftDate(date, -(days - 1)),
    end: date,
    nights: [],
    avgScore: null,
    avgHours: null,
    status: 'unauthenticated',
    message: '睡眠数据需要 Personal API 密钥或 Garmin 账号登录',
    source: 'none',
    advanced: false,
  }
}

export async function activitiesFor(src, personal, mcp, limit, date) {
  if (src.hasKey) {
    try {
      const data = await buildOfficialActivities(personal, limit, date)
      return { ...data, source: src.advanced ? 'official+sso' : 'official', advanced: src.advanced }
    } catch (err) {
      log('官方 activities 失败：', String(err?.message ?? err))
    }
  }
  if (src.advanced) {
    return { ...(await fetchActivities(mcp, limit, date)), source: 'sso', advanced: true }
  }
  return {
    date,
    start: 0,
    limit,
    count: 0,
    has_more: false,
    hasMore: false,
    next_start: 0,
    activities: [],
    source: 'none',
    advanced: false,
  }
}

export async function loadFor(src, mcp, date, days) {
  if (!src.advanced) {
    return {
      date,
      status: 'advanced_required',
      message: '训练负荷/准备度/VO₂max 只有高级模式（garmin-mcp + Garmin 账号登录）可用',
      source: src.hasKey ? 'official' : 'none',
      advanced: false,
    }
  }
  return { ...(await buildLoad(mcp, date, days)), source: 'sso', advanced: true }
}

export async function extrasFor(src, personal, mcp, date) {
  if (src.hasKey) {
    try {
      const data = await buildOfficialExtras(personal, mcp, date, src.advanced)
      return { ...data, source: src.advanced ? 'official+sso' : 'official', advanced: src.advanced }
    } catch (err) {
      log('官方 extras 失败：', String(err?.message ?? err))
    }
  }
  if (src.advanced) return { ...(await buildExtras(mcp, date)), source: 'sso', advanced: true }
  return {
    date,
    week: weekRange(date),
    workouts: null,
    gear: [],
    devices: [],
    records: [],
    weighIns: [],
    bodyComp: null,
    goals: null,
    fitnessAge: null,
    hrZones: [],
    status: 'advanced_required',
    source: 'none',
    advanced: false,
  }
}

/** 活动详情里“官方 / MCP 谁有就用谁”的 A 类字段 */
export const ACTIVITY_DETAIL_EXTRA_KEYS = [
  'max_speed_mps',
  'elevation_min_meters',
  'elevation_max_meters',
  'aerobic_label',
  'anaerobic_label',
  'device_manufacturer',
  'training_load',
]

export async function activityDetailFor(src, personal, mcp, id) {
  // 高级模式下保留原有 MCP 详情（含分段/区间/天气/装备）；
  // 并行取一次官方详情，只为补齐 MCP 没有的训练效果文案（如 anaerobic_label）。
  if (src.advanced) {
    const [detail, official] = await Promise.all([
      buildActivityDetail(mcp, id),
      src.hasKey
        ? optionalOfficial(() => buildOfficialActivityDetail(personal, id))
        : Promise.resolve(null),
    ])
    if (detail.summary && official?.summary) {
      for (const key of ACTIVITY_DETAIL_EXTRA_KEYS) {
        if (detail.summary[key] == null) detail.summary[key] = official.summary[key] ?? null
      }
    }
    return { ...detail, source: 'sso', advanced: true }
  }
  if (src.hasKey) {
    try {
      return { ...(await buildOfficialActivityDetail(personal, id)), source: 'official', advanced: false }
    } catch (err) {
      log('官方活动详情失败：', String(err?.message ?? err))
      return {
        id,
        summary: null,
        splits: null,
        hrZones: null,
        powerZones: null,
        weather: null,
        gear: null,
        effect: null,
        exerciseSets: null,
        status: 'error',
        message: String(err?.message ?? err),
        source: 'official',
        advanced: false,
      }
    }
  }
  return {
    id,
    summary: null,
    exerciseSets: null,
    status: 'advanced_required',
    message: '活动详情需要 Personal API 密钥或 Garmin 账号登录',
    source: 'none',
    advanced: false,
  }
}

export async function activityTrackFor(src, mcp, id) {
  if (src.advanced) return { ...(await buildActivityTrack(mcp, id)), source: 'sso', advanced: true }
  return {
    status: 'advanced_required',
    message: '轨迹解析暂时需要高级模式（后续版本会支持官方 FIT 文件）',
    source: src.hasKey ? 'official' : 'none',
    advanced: false,
  }
}

export async function devicesFor(src, mcp) {
  if (src.advanced) return { ...(await buildDevices(mcp)), source: 'sso', advanced: true }
  return {
    updatedAt: new Date().toISOString(),
    devices: [],
    latest: { id: null, name: null, at: null },
    status: 'advanced_required',
    source: src.hasKey ? 'official' : 'none',
    advanced: false,
  }
}

export async function deviceDetailFor(src, mcp, id) {
  if (src.advanced) return { ...(await buildDeviceDetail(mcp, id)), source: 'sso', advanced: true }
  return {
    id,
    settings: null,
    solar: null,
    alarms: null,
    status: 'advanced_required',
    source: src.hasKey ? 'official' : 'none',
    advanced: false,
  }
}

/* ------------------------------------------------------------------ *
 * 活动日历：按月聚合训练量（“活动日历”卡片）
 *
 *  - 官方优先：/activitylist-service/activities/search/activities?...&startDate&endDate
 *  - 官方失败且开启高级模式时，回退 garmin-mcp.get_activities_by_date
 *  - 「负荷」是本面板的**代理指标**，不是 Garmin Training Load：
 *        load = 分钟数 × 强度系数
 *        系数按平均心率分档：<120 bpm → 1.0，<150 bpm → 1.5，≥150 bpm → 2.0；
 *        没有心率数据 → 1.2
 *    只能做同月内的相对比较，不能与 Garmin 的 training load / EPOC 数值对照。
 *  - 只输出有活动的日期；distanceKm / durationMin / load 统一保留 1 位小数
 * ------------------------------------------------------------------ */
export const CALENDAR_TTL_MS = 15 * 60 * 1000

export const CALENDAR_LIMIT = 200

/** 解析 "YYYY-MM"；缺省或非法时回落到当月。返回该月首末日期 */
export function monthRange(month) {
  const raw = typeof month === 'string' ? month.trim() : ''
  const text = /^\d{4}-(0[1-9]|1[0-2])$/.test(raw) ? raw : today().slice(0, 7)
  const [year, mon] = text.split('-').map(Number)
  return {
    month: text,
    first: `${text}-01`,
    // new Date(y, m, 0) = 第 m 个月的最后一天（m 从 1 开始）
    last: `${text}-${pad(new Date(year, mon, 0).getDate())}`,
  }
}

/** 负荷代理系数（见本节注释；不是 Garmin Training Load） */
export function loadFactorFor(avgHr) {
  if (avgHr == null) return 1.2
  if (avgHr < 120) return 1
  if (avgHr < 150) return 1.5
  return 2
}

/** 官方 / MCP 的活动行 → 日历只需要 4 个字段 */
export function normalizeCalendarActivity(row) {
  return {
    date: activityDateOf(row?.start_time ?? row?.startTimeLocal ?? row?.date),
    type: row?.type ?? row?.activity_type ?? row?.activityType?.typeKey ?? null,
    distance_meters: numOrNull(row?.distance_meters) ?? numOrNull(row?.distance),
    duration_seconds: numOrNull(row?.duration_seconds) ?? numOrNull(row?.duration),
    avg_hr_bpm: numOrNull(row?.avg_hr_bpm) ?? numOrNull(row?.averageHR),
  }
}

/** 汇总：按日 / 按运动类型 / 月总计 / 单日最高负荷（先累加再统一四舍五入） */
export function aggregateCalendar(rows) {
  const days = new Map()
  const types = new Map()
  const totals = { count: 0, distanceKm: 0, durationMin: 0, load: 0 }
  for (const row of rows) {
    if (!row?.date) continue
    const distanceKm = (numOrNull(row.distance_meters) ?? 0) / 1000
    const durationMin = (numOrNull(row.duration_seconds) ?? 0) / 60
    const load = durationMin * loadFactorFor(numOrNull(row.avg_hr_bpm))
    totals.count += 1
    totals.distanceKm += distanceKm
    totals.durationMin += durationMin
    totals.load += load
    const day = days.get(row.date) ?? { date: row.date, count: 0, distanceKm: 0, durationMin: 0, load: 0 }
    day.count += 1
    day.distanceKm += distanceKm
    day.durationMin += durationMin
    day.load += load
    days.set(row.date, day)
    const type = row.type || 'unknown'
    const bucket = types.get(type) ?? { type, count: 0, distanceKm: 0, durationMin: 0 }
    bucket.count += 1
    bucket.distanceKm += distanceKm
    bucket.durationMin += durationMin
    types.set(type, bucket)
  }
  const dayList = [...days.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date,
      count: d.count,
      distanceKm: round(d.distanceKm, 1),
      durationMin: round(d.durationMin, 1),
      load: round(d.load, 1),
    }))
  const typeList = [...types.values()]
    .sort((a, b) => b.count - a.count || b.distanceKm - a.distanceKm || a.type.localeCompare(b.type))
    .map((t) => ({
      type: t.type,
      count: t.count,
      distanceKm: round(t.distanceKm, 1),
      durationMin: round(t.durationMin, 1),
    }))
  return {
    days: dayList,
    byType: typeList,
    totals: {
      count: totals.count,
      distanceKm: round(totals.distanceKm, 1),
      durationMin: round(totals.durationMin, 1),
      load: round(totals.load, 1),
    },
    // 与 days[].load 同一精度，前端可直接画柱状图
    maxDayLoad: dayList.length ? Math.max(...dayList.map((d) => d.load)) : 0,
  }
}

/** 官方请求里的日期窗口也要按本地时区过滤一次（网关偶尔返回窗口外的活动） */
export function calendarRowsFor(payload, range) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.activities)
      ? payload.activities
      : []
  return list
    .map(normalizeCalendarActivity)
    .filter((row) => row.date && row.date >= range.first && row.date <= range.last)
}

export async function calendarFor(src, personal, mcp, month) {
  const range = monthRange(month)
  if (src.hasKey) {
    try {
      const payload = await personal.getJson(
        `/activitylist-service/activities/search/activities?start=0&limit=${CALENDAR_LIMIT}`
          + `&startDate=${range.first}&endDate=${range.last}`,
      )
      return {
        month: range.month,
        source: src.advanced ? 'official+sso' : 'official',
        ...aggregateCalendar(calendarRowsFor(payload, range)),
      }
    } catch (err) {
      log('官方活动日历失败：', String(err?.message ?? err))
    }
  }
  if (src.advanced) {
    const result = await safeTool(mcp, 'get_activities_by_date', {
      start_date: range.first,
      end_date: range.last,
      page: 0,
      page_size: CALENDAR_LIMIT,
    })
    if (!result.ok) throw new Error(`活动日历获取失败：${result.error}`)
    return {
      month: range.month,
      source: 'sso',
      ...aggregateCalendar(calendarRowsFor(result.data, range)),
    }
  }
  throw new Error('活动日历需要 Personal API 密钥或 Garmin 账号登录')
}

/**
 * 官方饮食日志 → 面板需要的摄入总量。
 * 响应形状没有被 Garmin 文档固定，这里对常见容器名与字段别名都做兼容；
 * 没有可用数据就返回 null（=「未记录」），绝不因为饮食数据拖挂整次生成。
 */
export function mapNutritionLog(payload) {
  if (!payload) return null
  let list = []
  if (Array.isArray(payload)) list = payload
  else if (Array.isArray(payload.foodLogs)) list = payload.foodLogs
  else if (Array.isArray(payload.logs)) list = payload.logs
  else if (Array.isArray(payload.items)) list = payload.items
  else if (Array.isArray(payload.foodLogEntries)) list = payload.foodLogEntries
  else if (Array.isArray(payload.entries)) list = payload.entries
  if (!list.length) return null
  const pick = (obj, keys) => {
    for (const key of keys) {
      const value = numOrNull(obj?.[key])
      if (value != null) return value
    }
    return null
  }
  const sum = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const seen = { calories: false, protein: false, carbs: false, fat: false }
  for (const entry of list) {
    const values = {
      calories: pick(entry, ['calories', 'totalCalories', 'energyKcal', 'kcal']),
      protein: pick(entry, ['protein', 'protein_g', 'proteinGrams', 'totalProtein']),
      carbs: pick(entry, ['carbs', 'carbohydrates', 'carbs_g', 'totalCarbs']),
      fat: pick(entry, ['fat', 'fat_g', 'totalFat']),
    }
    for (const key of Object.keys(values)) {
      if (values[key] == null) continue
      sum[key] += values[key]
      seen[key] = true
    }
  }
  if (!seen.calories && !seen.protein && !seen.carbs && !seen.fat) return null
  return {
    calories: seen.calories ? Math.round(sum.calories) : null,
    protein_g: seen.protein ? round(sum.protein, 1) : null,
    carbs_g: seen.carbs ? round(sum.carbs, 1) : null,
    fat_g: seen.fat ? round(sum.fat, 1) : null,
    items: list.length,
  }
}

/** 当天官方饮食日志；没有密钥/接口失败/空数据都返回 null */
export async function nutritionIntakeFor(src, personal, date) {
  if (!src.hasKey) return null
  try {
    return mapNutritionLog(await personal.getJson(`/nutrition-service/food/logs/${date}`))
  } catch (err) {
    log('官方饮食日志不可用（按未记录处理）：', String(err?.message ?? err))
    return null
  }
}

export async function buildAccountState(personal) {
  const hasKey = existsSync(KEY_FILE)
  const mcpInstalled = existsSync(DEFAULT_BIN)
  const ssoAuthed = existsSync(TOKEN_FILE)
  const advanced = mcpInstalled && ssoAuthed
  const keyValid = hasKey ? await validatePersonalKey(personal) : false
  const mode = hasKey && keyValid ? 'official' : advanced ? 'sso' : 'none'

  const tokenMtime = ssoAuthed ? fileMtimeMs(TOKEN_FILE) : null
  const tokenUpdatedAt = tokenMtime == null ? null : new Date(tokenMtime).toISOString()
  // 整天的年龄；文件系统 mtime 精度可能让刚写入的文件略晚于 Date.now()，负数按 0
  const tokenAgeDays = tokenMtime == null
    ? null
    : Math.max(0, Math.floor((Date.now() - tokenMtime) / 86_400_000))
  const tokenExpiresEstimate = tokenMtime == null
    ? null
    : new Date(tokenMtime + TOKEN_EXPIRY_ESTIMATE_DAYS * 86_400_000).toISOString()

  const reasons = []
  if (!hasKey) reasons.push('未配置 Personal API 密钥')
  else if (!keyValid) reasons.push('Personal API 密钥无效或已失效，请重新生成')
  if (ssoAuthed && tokenAgeDays != null && tokenAgeDays > SSO_TOKEN_WARN_DAYS) {
    reasons.push(`Garmin 登录令牌已 ${tokenAgeDays} 天未更新（超过 ${SSO_TOKEN_WARN_DAYS} 天），建议重新登录`)
  }
  if (mode === 'none') reasons.push('尚未连接任何 Garmin 数据源')
  // 「想要高级模式」= 有 SSO 令牌，或者官方密钥缺失/失效（只能靠 SSO 兜底）
  const wantsAdvanced = ssoAuthed || !hasKey || !keyValid
  if (wantsAdvanced && !mcpInstalled) {
    reasons.push('高级模式未安装（缺少 garmin-mcp），官方数据受限时无法降级')
  }

  return {
    mode,
    advanced,
    hasKey,
    keyValid,
    ssoAuthed,
    mcpInstalled,
    tokenUpdatedAt,
    tokenAgeDays,
    tokenExpiresEstimate,
    needsAttention: reasons.length > 0,
    reasons,
  }
}

export const PROFILE_TTL_MS = 6 * 60 * 60 * 1000

export const WOMENS_TTL_MS = 30 * 60 * 1000

/**
 * 个人档案：官方 settings 必查；gender/name 官方没有时再用 MCP 补缺口。
 * 官方字段缺失不会让整包失败（status 始终 ok）。
 */
export async function buildProfile(src, personal, mcp) {
  const settings = src.hasKey
    ? await optionalOfficial(() => personal.getJson('/userprofile-service/userprofile/settings'))
    : null
  const record = asRecord(settings)
  let gender = genderFromProfile(record)
  let name = nameFromProfile(record)
  let unitSystem = unitSystemFromProfile(record)

  const needProfile = gender == null || unitSystem == null
  const needName = name == null
  if (src.advanced && (needProfile || needName)) {
    const [profileTool, nameTool] = await Promise.all([
      needProfile ? safeTool(mcp, 'get_user_profile', {}) : Promise.resolve(null),
      needName ? safeTool(mcp, 'get_full_name', {}) : Promise.resolve(null),
    ])
    const mcpProfile = profileTool?.ok ? asRecord(profileTool.data) : null
    const mcpName = nameTool?.ok ? asRecord(nameTool.data) : null
    gender = gender ?? genderFromProfile(mcpProfile)
    unitSystem = unitSystem ?? unitSystemFromProfile(mcpProfile)
    name = name ?? firstString(mcpName?.full_name, mcpName?.fullName)
  }

  return { status: 'ok', gender, name, unitSystem, source: src.label }
}

/* ---------------- 女性健康 ---------------- */

/** 月经记录可能是对象，也可能是数组；取与查询日期匹配的一条（否则最后一条） */
export function menstrualRecords(payload, date) {
  if (Array.isArray(payload)) {
    const list = payload.filter((item) => item && typeof item === 'object')
    if (!list.length) return []
    const exact = list.find((item) =>
      [item.calendarDate, item.date, item.summaryDate]
        .some((value) => activityDateOf(value) === date),
    )
    return [exact ?? list[list.length - 1]]
  }
  const record = asRecord(payload)
  return record ? [record] : []
}

/** 把 dayView / cycle / summary 之类的嵌套对象摊平，字段不在两层命名里丢 */
export function flattenMenstrual(record) {
  if (!record || typeof record !== 'object') return {}
  let flat = {}
  for (const key of ['dayView', 'cycleSummary', 'summary', 'cycle']) {
    const nested = asRecord(record[key])
    if (nested) flat = { ...flat, ...nested }
  }
  return { ...flat, ...record }
}

/** 阶段可能是字符串，也可能是 { name } / { cyclePhase } 对象 */
export function phaseOf(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    const record = asRecord(value)
    if (record) {
      const name = firstString(
        record.name,
        record.cyclePhase,
        record.phaseName,
        record.key,
        record.type,
      )
      if (name) return name
    }
  }
  return null
}

/**
 * 经期概览：summary/<date> 与 dayview/<date> 合并。
 * 字段名按实测接口与常见版本兜底（cyclePhase / name、lastCycleStartDate…）。
 */
export function mapMenstrualCycle(summaryPayload, dayviewPayload, date) {
  const records = [
    ...menstrualRecords(dayviewPayload, date),
    ...menstrualRecords(summaryPayload, date),
  ].map(flattenMenstrual)
  if (!records.length) return null
  const pick = (fn) => {
    for (const record of records) {
      const value = fn(record)
      if (value != null) return value
    }
    return null
  }
  const lastStartDate = pick((record) => firstDate(
    record.lastStartDate,
    record.lastCycleStartDate,
    record.cycleStartDate,
    record.currentCycleStartDate,
    record.lastPeriodStartDate,
    record.startDate,
  ))
  const cycleLengthDays = pick((record) => firstNumber(
    record.cycleLengthDays,
    record.cycleLength,
    record.averageCycleLength,
    record.avgCycleLength,
    record.cycleLengthInDays,
  ))
  const phase = pick((record) => phaseOf(
    record.phase,
    record.cyclePhase,
    record.phaseName,
    record.cyclePhaseName,
    record.phaseType,
  ))
  const predictedNextStart = pick((record) => firstDate(
    record.predictedNextStart,
    record.predictedCycleStartDate,
    record.nextCycleStartDate,
    record.predictedNextCycleStart,
    record.nextPeriodStartDate,
    record.nextStartDate,
  ))
  if (!lastStartDate && cycleLengthDays == null && !phase && !predictedNextStart) return null
  return { lastStartDate, cycleLengthDays, phase, predictedNextStart }
}

/** 孕期摘要：MCP get_pregnancy_summary 的对象 → { dueDate, week }（缺一即 null） */
export function mapPregnancy(payload) {
  const record = asRecord(payload)
  if (!record) return null
  const dueDate = firstDate(
    record.dueDate,
    record.due_date,
    record.estimatedDueDate,
    record.expectedDueDate,
    record.deliveryDate,
  )
  const week = firstNumber(
    record.week,
    record.currentWeek,
    record.pregnancyWeek,
    record.weekNumber,
    record.gestationalWeek,
    record.currentPregnancyWeek,
  )
  if (!dueDate && week == null) return null
  return { dueDate, week: week != null ? Math.round(week) : null }
}

/**
 * 女性健康：cycle 走官方经期接口（404/204/空都算无数据），
 * pregnancy 走 MCP；男性档案直接跳过这两个数据源，返回全 null。
 */
export async function buildWomens(src, personal, mcp, date) {
  const { data: profile } = await cached(
    `profile:${src.label}`,
    PROFILE_TTL_MS,
    () => buildProfile(src, personal, mcp),
  )
  const gender = profile?.gender ?? null

  let cycle = null
  if (src.hasKey && gender !== 'male') {
    const [summary, dayview] = await Promise.all([
      optionalOfficial(() => personal.getJson(`/periodichealth-service/menstrualcycle/summary/${date}`)),
      optionalOfficial(() => personal.getJson(`/periodichealth-service/menstrualcycle/dayview/${date}`)),
    ])
    cycle = mapMenstrualCycle(summary, dayview, date)
  }

  let pregnancy = null
  if (src.advanced && gender !== 'male') {
    const result = await safeTool(mcp, 'get_pregnancy_summary', {})
    if (result.ok) pregnancy = mapPregnancy(result.data)
  }

  return { status: 'ok', source: src.label, gender, cycle, pregnancy }
}

/** 路由层只通过这两个函数更新密钥校验缓存，避免对 import 绑定赋值 */
export function markKeyCheck(valid) {
  keyCheckAt = Date.now()
  keyCheckValid = valid
}

export function resetKeyCheck() {
  keyCheckAt = 0
}
