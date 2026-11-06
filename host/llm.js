/**
 * 佳明面板 · Host 半 / AI 教练 · 健康管家 · 营养助手
 *
 * LLM 上下文压缩、提示词、模型选择、流式调用与错误码映射。
 */

import { join } from 'node:path'

import { log, cache, cached, shiftDate, numOrNull, avgInt, round, activityDateOf } from './config.js'
import { snapshotFor, sleepFor, activitiesFor, loadFor, extrasFor, nutritionIntakeFor } from './official.js'
import { safeTool } from './mcp.js'

/* ------------------------------------------------------------------ *
 * AI 教练：一次 LLM 调用，把当天数据翻译成可执行的训练建议
 *
 * 设计要点：
 *  - llm / agentDefaultModel 不写进 inject：缺服务时插件仍要能激活，运行时再取
 *  - 绝不自动调用：只有 Client 点击才跑（每次都花 token）
 *  - 结果按日期缓存 30 分钟；同一时刻只允许一个在飞请求，双击也只扣一次
 *  - @deepseek-ai/dsh-llm 用动态 import 惰性加载，解析不到就走零依赖兜底累积
 * ------------------------------------------------------------------ */
export const COACH_TTL_MS = 30 * 60 * 1000

export const COACH_MAX_TOKENS = 3200

export const COACH_TIMEOUT_MS = 90_000

export const COACH_SYSTEM = [
  '你是用户专属的 AI 健康与运动教练，只基于给定的 Garmin 数据回答。',
  '',
  '输出结构固定为五节，顺序不变，每节 1-3 句：',
  '## 今日结论',
  '## 训练建议',
  '## 恢复建议',
  '## 风险提醒',
  '## 明日安排',
  '',
  '要求：',
  '1. 每条建议都给具体数字（心率区间 bpm、时长分钟、强度/配速/功率），不要泛泛而谈。',
  '2. 不编造数据：上下文里没有的指标直接写「未记录」，不要推测。',
  '3. 训练建议要能直接执行：项目 + 时长 + 目标心率区间，并说明依据（准备度 / ACWR / 睡眠）。',
  '4. 准备度低、ACWR > 1.5 或睡眠明显不足时，先给恢复方案，再谈训练。',
  '5. 中文输出，用 markdown 小标题和短列表，全文控制在 500 字以内。',
].join('\n')

export const COACH_CODE_MESSAGE = {
  AUTH: 'Harness 的模型凭证无效，请重新登录',
  ACCOUNT_SIGN_IN_REQUIRED: 'Harness 账号需要重新登录',
  ACCOUNT_TOKEN_INVALID: 'Harness 账号令牌已失效，请重新登录',
  ACCOUNT_QUOTA: '模型账号额度不足',
  RATE_LIMIT: '模型限流，请稍后再试',
  SOCKS: '网络代理异常，连不上模型服务',
  TIMEOUT: '模型响应超时，请重试',
  TRANSPORT: '网络异常，连不上模型服务',
  EMPTY_RESPONSE: '模型没有返回正文，请重试',
  CONTEXT_WINDOW_EXCEEDED: '数据超出模型上下文窗口，请重试',
  INVALID_REQUEST: '模型请求参数不合法',
  LLM_UNAVAILABLE: '当前 Harness 没有可用的 LLM 服务',
  GARMIN_UNAUTHENTICATED: 'Garmin 未登录，先在面板完成登录',
}

export function coachError(code, message, retryAfterMs) {
  const err = new Error(message || COACH_CODE_MESSAGE[code] || '教练调用失败')
  err.code = code
  if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) err.retryAfterMs = Math.round(retryAfterMs)
  return err
}

/**
 * 惰性加载 BlockAssembler。
 * 宿主 loader 若解析不到 @deepseek-ai/dsh-llm，返回 null，由 streamCoach 走兜底累积。
 * @returns {Promise<Function|null>}
 */
export let assemblerCtorPromise = null

export function loadBlockAssembler() {
  if (!assemblerCtorPromise) {
    assemblerCtorPromise = import('@deepseek-ai/dsh-llm')
      .then((mod) => (typeof mod?.BlockAssembler === 'function' ? mod.BlockAssembler : null))
      .catch((err) => {
        log('BlockAssembler 不可用，改用零依赖累积：', String(err?.message ?? err))
        return null
      })
  }
  return assemblerCtorPromise
}

/** 递归去掉 null / undefined / ''，让上下文 JSON 更省 token（保留 0 与 false） */
export function stripEmpty(value) {
  if (Array.isArray(value)) {
    return value.map(stripEmpty).filter((v) => v !== null && v !== undefined)
  }
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      const next = stripEmpty(v)
      if (next === null || next === undefined || next === '') continue
      if (Array.isArray(next) && next.length === 0) continue
      if (next && typeof next === 'object' && !Array.isArray(next) && Object.keys(next).length === 0) continue
      out[k] = next
    }
    return out
  }
  return value
}

/**
 * 复用面板已有分发器（同一数据源、同一 date、同一缓存键），不另开取数路径。
 * @returns {Promise<{snapshot:any, sleep:any, load:any, activities:any}>}
 */
export async function buildCoachContext(src, personal, mcp, date) {
  const ns = src.label
  const [snapshot, sleep, load, activities] = await Promise.all([
    cached(`snapshot:${ns}:${date}`, 10 * 60 * 1000, () => snapshotFor(src, personal, mcp, date)),
    cached(`sleep:${ns}:${date}:7`, 20 * 60 * 1000, () => sleepFor(src, personal, mcp, date, 7)),
    cached(`load:${ns}:${date}:30`, 20 * 60 * 1000, () => loadFor(src, mcp, date, 30)),
    cached(`activities:${ns}:${date}:6`, 10 * 60 * 1000, () => activitiesFor(src, personal, mcp, 6, date)),
  ])
  return {
    snapshot: snapshot.data,
    sleep: sleep.data,
    load: load.data,
    activities: activities.data,
  }
}

/**
 * 压缩成给模型看的上下文：砍掉大数组，只留最近 7 晚 / 14 天 / 3 条活动。
 * 顶层键：date / kpi / today / recovery / sleep / load / balance / vo2max / race / activities
 */
export function compactCoachContext(date, snapshot, sleep, load, activities) {
  const nights = (sleep?.nights ?? []).slice(-7).map((n) => ({
    date: n.date,
    score: n.score,
    hours: n.hours,
    deep: n.deep,
    rem: n.rem,
    hrv: n.hrv,
    rhr: n.rhr,
  }))
  const series = (load?.series ?? []).slice(-14).map((d) => ({
    date: d.date,
    atl: d.atl,
    ctl: d.ctl,
    tsb: d.tsb,
    acwr: d.acwr,
  }))
  const acts = (activities?.activities ?? []).slice(0, 3).map((a) => ({
    date: String(a.start_time ?? '').slice(0, 16),
    name: a.name,
    type: a.activity_type ?? a.type ?? null,
    distanceKm: round((a.distance_meters ?? 0) / 1000, 2),
    durationMin: round((a.duration_seconds ?? 0) / 60, 0),
    avgHr: a.avg_hr_bpm,
    maxHr: a.max_hr_bpm,
    elevationM: a.elevation_gain_meters,
    calories: a.calories,
  }))
  return stripEmpty({
    date,
    kpi: snapshot?.kpi,
    today: snapshot?.today,
    recovery: snapshot?.recovery,
    sleep: { avgScore: sleep?.avgScore, avgHours: sleep?.avgHours, nights },
    load: { current: load?.current, series },
    balance: load?.balance,
    vo2max: load?.vo2max,
    race: load?.race,
    activities: acts,
  })
}

/** system + user 提示词；上下文过长时先丢活动、再丢负荷序列 */
export function coachPrompts(date, context) {
  let payload = context
  let json = JSON.stringify(payload)
  if (json.length > 16_000) {
    payload = { ...payload, activities: [] }
    json = JSON.stringify(payload)
  }
  if (json.length > 16_000) {
    payload = { ...payload, load: { current: payload.load?.current ?? null } }
    json = JSON.stringify(payload)
  }
  const user = [
    `日期：${date}`,
    '以下是这台设备的 Garmin 数据（JSON；缺失字段即「未记录」）：',
    '```json',
    json,
    '```',
    '请严格按五节结构输出，给具体数字，不要编造。',
  ].join('\n')
  return { system: COACH_SYSTEM, user }
}

/**
 * 消费一次流式调用，只取 text 块（reasoningEffort 可能是 high，前面会有 reasoning 块）。
 * @returns {Promise<{text:string, finish:any, usage:{input:number, output:number}}>}
 */
export async function streamCoach(llm, request) {
  const BlockAssembler = await loadBlockAssembler()
  if (BlockAssembler) {
    const assembler = new BlockAssembler()
    for await (const chunk of llm.stream(request)) assembler.push(chunk)
    const text = assembler
      .blocks()
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()
    const usage = assembler.usage ?? null
    return {
      text,
      finish: assembler.finish,
      usage: { input: usage?.inputTokens ?? 0, output: usage?.outputTokens ?? 0 },
    }
  }
  // 零依赖兜底：直接按 chunk 类型累积（terminal finish 不会抛，必须自己看）
  let text = ''
  let finish = { kind: 'stop' }
  let usage = null
  for await (const chunk of llm.stream(request)) {
    if (chunk?.type === 'text-delta') text += chunk.text ?? ''
    else if (chunk?.type === 'finish') finish = chunk.reason ?? finish
    else if (chunk?.type === 'usage') usage = chunk.usage ?? null
  }
  return {
    text: text.trim(),
    finish,
    usage: { input: usage?.inputTokens ?? 0, output: usage?.outputTokens ?? 0 },
  }
}

/** 读取默认模型选择；服务未就绪/配置残缺时返回 null，不抛 */
export function coachSelection(ctx) {
  try {
    return ctx.get?.('agentDefaultModel')?.currentSelection?.() ?? null
  } catch {
    return null
  }
}

/** 真正调模型的那一步；失败一律抛带 code 的错误（不写缓存） */
export async function generateCoach(ctx, src, personal, mcp, date) {
  const llm = ctx.get?.('llm')
  const selection = coachSelection(ctx)
  if (!llm || typeof llm.stream !== 'function') {
    throw coachError('LLM_UNAVAILABLE', COACH_CODE_MESSAGE.LLM_UNAVAILABLE)
  }
  if (!selection?.provider || !selection?.model) {
    throw coachError('LLM_UNAVAILABLE', 'Harness 还没有选择默认模型')
  }

  const built = await buildCoachContext(src, personal, mcp, date)
  if (built.snapshot?.status === 'unauthenticated') {
    throw coachError('GARMIN_UNAUTHENTICATED', COACH_CODE_MESSAGE.GARMIN_UNAUTHENTICATED)
  }
  const context = compactCoachContext(date, built.snapshot, built.sleep, built.load, built.activities)
  const prompts = coachPrompts(date, context)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), COACH_TIMEOUT_MS)
  let result
  try {
    result = await streamCoach(llm, {
      provider: selection.provider,
      model: selection.model,
      ...(selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort }),
      system: prompts.system,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompts.user }] }],
      maxTokens: COACH_MAX_TOKENS,
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) throw coachError('TIMEOUT', '模型响应超时（90 秒），请重试')
    const code = err?.code && COACH_CODE_MESSAGE[err.code] ? err.code : 'TRANSPORT'
    throw coachError(code, String(err?.message ?? err))
  } finally {
    clearTimeout(timer)
  }

  const finish = result.finish ?? { kind: 'stop' }
  if (finish.kind === 'error' || finish.kind === 'aborted') {
    const failure = finish.failure ?? {}
    const timedOut = finish.kind === 'aborted' && controller.signal.aborted
    const code = timedOut ? 'TIMEOUT' : (failure.code || (finish.kind === 'aborted' ? 'ABORTED' : 'LLM_ERROR'))
    const friendly = COACH_CODE_MESSAGE[code]
    const detail = failure.message
    const message = friendly
      ? (detail && detail !== friendly ? `${friendly}（${detail}）` : friendly)
      : (detail || '模型调用失败')
    throw coachError(code, message, failure.providerRetryAfterMs)
  }
  if (!result.text) {
    throw coachError(
      'EMPTY_RESPONSE',
      finish.kind === 'max-tokens'
        ? '模型只输出到推理部分就被截断，请重试'
        : COACH_CODE_MESSAGE.EMPTY_RESPONSE,
    )
  }
  if (finish.kind === 'max-tokens') log('教练输出被 max-tokens 截断：', date)

  return {
    status: 'ok',
    date,
    generatedAt: new Date().toISOString(),
    model: selection.model,
    text: result.text,
    usage: result.usage,
  }
}

/** 同一日期一把锁：并发点击共用同一次生成，不会双扣 token */
export const coachInflight = new Map()

export function coachResult(ctx, src, personal, mcp, date, force) {
  const key = `coach:${src.label}:${date}`
  const running = coachInflight.get(key)
  if (running) return running
  if (force) cache.delete(key) // force 才绕过 30 分钟缓存
  const p = cached(key, COACH_TTL_MS, () => generateCoach(ctx, src, personal, mcp, date))
  coachInflight.set(key, p)
  const clear = () => { if (coachInflight.get(key) === p) coachInflight.delete(key) }
  p.then(clear, clear)
  return p
}

/* ------------------------------------------------------------------ *
 * AI 健康管家：只做健康解读，不做训练处方
 *
 * 与教练共用同一套取数分发器、缓存、错误码与流式消费；区别在：
 *  - 上下文只保留健康指标（睡眠 / HRV / 静息心率 / 压力 / 血氧 / 体重 / 饮食）
 *  - 输出以 VERDICT: keep|watch|attention 开头（解析后从正文剥离）
 *  - 缓存键带数据源 label，官方 ↔ 高级模式切换不会串用旧上下文
 *  - 系统提示明确「不是医生」：不诊断、不用药，持续异常才建议就医
 * ------------------------------------------------------------------ */
export const STEWARD_TTL_MS = 30 * 60 * 1000

export const STEWARD_MAX_TOKENS = 3200

export const STEWARD_TIMEOUT_MS = 90_000

export const STEWARD_VERDICTS = new Set(['keep', 'watch', 'attention'])

export const STEWARD_SYSTEM = [
  '你是用户专属的 AI 健康管家，不是医生。只基于给定的 Garmin 数据与常识给建议，不编造数据，不做诊断。',
  '',
  '输出严格按下面结构，每段 1-3 句，中文，具体到数字：',
  'VERDICT: keep | watch | attention',
  '## 今日健康结论',
  '## 睡眠与恢复',
  '## 压力与情绪',
  '## 生活方式提醒（非训练：饮水、久坐、用眼、咖啡因、酒精、作息、饮食结构）',
  '## 需要留意',
  '## 保持即可',
  '',
  '规则：',
  '- 若各项指标都在个人基线内，VERDICT 必须为 keep，且「保持即可」段落明确写「今天各项指标正常，保持即可」，不要硬凑建议。',
  '- 只在数据支持时才提风险；轻微波动用「可以留意」而不是警告。',
  '- 持续异常（如静息心率连续多日偏高、HRV 连续下滑、血氧持续偏低）时 VERDICT=attention，并建议「如有不适请咨询医生」——必须包含免责说明，不得给出诊断或用药建议。',
  '- 不评价训练计划（那是 AI 教练的职责），只在与恢复相关时提一句。',
  '- 缺失的指标直接说「未记录」。',
].join('\n')

/**
 * 解析正文开头的 `VERDICT: keep|watch|attention`：
 *  - 只看第一个非空行，允许行首空白、大小写混写、整行或冒号两侧的 markdown `**`
 *  - 必须整行匹配，正文中间的 VERDICT 不动
 *  - 被识别为 VERDICT 行就剥离；值非法时仍剥离该行、按 watch 处理
 *  - 没有 VERDICT 行 → watch（保守），正文不动
 * @returns {{verdict:'keep'|'watch'|'attention', text:string}}
 */
export function parseStewardVerdict(raw) {
  const original = String(raw ?? '')
  const lines = original.split(/\r?\n/)
  let index = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) { index = i; break }
  }
  if (index < 0) return { verdict: 'watch', text: '' }
  const match = /^\s*(?:\*\*)?\s*VERDICT\s*:\s*(?:\*\*)?\s*([A-Za-z]+)\s*(?:\*\*)?\s*$/i.exec(lines[index])
  if (!match) return { verdict: 'watch', text: original.trim() }
  const value = match[1].toLowerCase()
  return {
    verdict: STEWARD_VERDICTS.has(value) ? value : 'watch',
    text: lines.slice(index + 1).join('\n').trim(),
  }
}

/**
 * 营养摄入只存在于 MCP（官方个人网关没有）：近 7 天里“记过餐”的日均值。
 * 任何形状差异/工具缺失都返回 null，绝不因为饮食数据把整次分析拖挂。
 * @returns {Promise<{calories?:number, protein_g?:number, logged_days_7d:number}|null>}
 */
export async function nutritionFor(mcp, date) {
  const start = shiftDate(date, -6)
  const result = await safeTool(mcp, 'get_nutrition_summary_between_dates', {
    start_date: start,
    end_date: date,
  })
  if (!result.ok) return null
  const payload = result.data
  const days = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.days)
      ? payload.days
      : Array.isArray(payload?.summaries)
        ? payload.summaries
        : Array.isArray(payload?.data)
          ? payload.data
          : []
  if (!days.length) return null
  const rows = days.map((d) => ({
    calories: numOrNull(d?.calories),
    protein: numOrNull(d?.protein_g) ?? numOrNull(d?.protein),
    items: numOrNull(d?.item_count),
  }))
  const hasItemCounts = rows.some((d) => d.items != null)
  const logged = hasItemCounts
    ? rows.filter((d) => d.items > 0)
    : rows.filter((d) => d.calories != null && d.calories > 0)
  if (!logged.length) return null
  const calorieDays = logged.filter((d) => d.calories != null)
  const proteinDays = logged.filter((d) => d.protein != null)
  const mean = (list, key) => (list.length ? list.reduce((sum, d) => sum + d[key], 0) / list.length : null)
  const calories = mean(calorieDays, 'calories')
  const protein = mean(proteinDays, 'protein')
  if (calories == null && protein == null) return null
  return {
    calories: calories == null ? null : Math.round(calories),
    protein_g: round(protein, 1),
    logged_days_7d: logged.length,
  }
}

/**
 * 复用面板分发器（同源、同 date、同缓存键），只额外取一次 MCP 饮食数据。
 * @returns {Promise<{snapshot:any, sleep:any, load:any, extras:any, nutrition:any}>}
 */
export async function buildStewardContext(src, personal, mcp, date) {
  const ns = src.label
  const [snapshot, sleep, load, extras, nutrition] = await Promise.all([
    cached(`snapshot:${ns}:${date}`, 10 * 60 * 1000, () => snapshotFor(src, personal, mcp, date)),
    cached(`sleep:${ns}:${date}:7`, 20 * 60 * 1000, () => sleepFor(src, personal, mcp, date, 7)),
    cached(`load:${ns}:${date}:30`, 20 * 60 * 1000, () => loadFor(src, mcp, date, 30)),
    cached(`extras:${ns}:${date}`, 60 * 60 * 1000, () => extrasFor(src, personal, mcp, date)),
    src.advanced
      ? cached(`nutrition:${ns}:${date}`, 20 * 60 * 1000, () => nutritionFor(mcp, date))
      : Promise.resolve({ data: null }),
  ])
  return {
    snapshot: snapshot.data,
    sleep: sleep.data,
    load: load.data,
    extras: extras.data,
    nutrition: nutrition.data,
  }
}

/** 体重：最新读数 + 近 30 天首尾变化（只有单点读数时趋势为 null） */
export function weightTrend(weighIns, date) {
  const rows = (Array.isArray(weighIns) ? weighIns : [])
    .filter((w) => typeof w?.weight_kg === 'number' && Number.isFinite(w.weight_kg))
  if (!rows.length) return null
  const latest = rows[rows.length - 1]
  const cutoff = shiftDate(date, -30)
  const windowed = rows.filter((w) => typeof w.date === 'string' && w.date >= cutoff && w.date <= date)
  return {
    latest_kg: round(latest.weight_kg, 2),
    trend_30d: windowed.length >= 2
      ? round(windowed[windowed.length - 1].weight_kg - windowed[0].weight_kg, 2)
      : null,
  }
}

/**
 * 健康视角的上下文：只留模型需要的指标，去掉活动数组/训练负荷序列。
 * 顶层键：date / sleep_last_7_nights / sleep_avg / hrv / resting_hr / body_battery /
 *        stress / respiration / spo2 / weight / nutrition / readiness / training_hint / missing
 */
export function compactStewardContext(date, snapshot, sleep, load, extras, nutrition, advanced) {
  const nights = (sleep?.nights ?? []).slice(-7).map((n) => ({
    date: n.date,
    score: n.score,
    hours: n.hours,
    deep_pct: n.deep,
    rem_pct: n.rem,
    hrv: n.hrv,
    rhr: n.rhr,
  }))

  const hrvLastNight = numOrNull(snapshot?.kpi?.sleep?.hrv)
  const hrvWeekly = numOrNull(snapshot?.recovery?.hrvWeekly)
  const hrvDelta = hrvLastNight != null && hrvWeekly != null
    ? round(hrvLastNight - hrvWeekly, 1)
    : null
  // 有 Garmin 自己的状态就用；只有 SSO 数据时按与周均值的差临时归一
  const hrvStatus = typeof snapshot?.recovery?.hrvStatus === 'string'
    ? snapshot.recovery.hrvStatus
    : hrvDelta == null
      ? null
      : hrvDelta >= 5
        ? 'above'
        : hrvDelta <= -5
          ? 'below'
          : 'balanced'

  const rhrToday = numOrNull(snapshot?.kpi?.rhr?.value)
  const rhrAvg7 = numOrNull(snapshot?.kpi?.rhr?.avg7)
  const rhrDelta = rhrToday != null && rhrAvg7 != null ? round(rhrToday - rhrAvg7, 1) : null

  const battery = snapshot?.kpi?.bodyBattery ?? {}
  const bodyBattery = {
    current: numOrNull(battery.current),
    charged: numOrNull(battery.charged),
    drained: numOrNull(battery.drained),
    high: numOrNull(battery.highest),
    low: numOrNull(battery.lowest),
  }
  const stress = {
    avg: numOrNull(snapshot?.today?.stress?.avg),
    max: numOrNull(snapshot?.today?.stress?.max),
    qualifier: snapshot?.today?.stress?.qualifier ?? null,
  }
  const respiration = { avg: numOrNull(snapshot?.today?.respiration?.avg) }
  const spo2 = snapshot?.today?.spo2
    ? { avg: numOrNull(snapshot.today.spo2.avg), low: numOrNull(snapshot.today.spo2.low) }
    : null
  const weight = weightTrend(extras?.weighIns, date)

  const ready = advanced ? snapshot?.kpi?.readiness : null
  const readiness = ready
    ? {
        score: numOrNull(ready.score),
        level: ready.level ?? null,
        factors: Object.fromEntries((snapshot?.recovery?.factors ?? []).filter(([, v]) => typeof v === 'number')),
      }
    : null
  const currentLoad = load?.current
  const trainingHint = advanced && currentLoad
    ? {
        acwr: numOrNull(currentLoad.acwr),
        tsb: numOrNull(currentLoad.tsb),
        status: currentLoad.acwrStatus ?? currentLoad.status ?? null,
      }
    : null

  const missing = []
  if (!nights.length) missing.push('sleep')
  if (hrvLastNight == null && hrvWeekly == null) missing.push('hrv')
  if (rhrToday == null) missing.push('resting_hr')
  if (Object.values(bodyBattery).every((v) => v == null)) missing.push('body_battery')
  if (stress.avg == null && stress.max == null) missing.push('stress')
  if (respiration.avg == null) missing.push('respiration')
  if (!spo2) missing.push('spo2')
  if (!weight) missing.push('weight')
  if (!nutrition) missing.push('nutrition')
  if (advanced && !readiness) missing.push('readiness')
  if (advanced && !trainingHint) missing.push('training_hint')

  const context = stripEmpty({
    date,
    sleep_last_7_nights: nights,
    sleep_avg: {
      score: sleep?.avgScore,
      hours: sleep?.avgHours,
      hrv: avgInt(nights.map((n) => n.hrv)),
    },
    hrv: { last_night: hrvLastNight, weekly_avg: hrvWeekly, delta: hrvDelta, status: hrvStatus },
    resting_hr: { today: rhrToday, avg_7d: rhrAvg7, delta: rhrDelta },
    body_battery: bodyBattery,
    stress,
    respiration,
    spo2,
    weight,
    nutrition,
    readiness,
    training_hint: trainingHint,
  })
  // missing 即使是空数组也要保留，模型才知道「没有缺失」
  context.missing = missing
  return context
}

export function stewardPrompts(date, context) {
  const user = [
    `日期：${date}`,
    '以下是这台设备的 Garmin 健康数据（JSON；缺失字段即「未记录」）：',
    '```json',
    JSON.stringify(context),
    '```',
    '请先单独一行输出 VERDICT: keep | watch | attention，再按固定结构分段，给具体数字，不要编造。',
  ].join('\n')
  return { system: STEWARD_SYSTEM, user }
}

/** 真正调模型的那一步；失败一律抛带 code 的错误（不写缓存） */
export async function generateSteward(ctx, src, personal, mcp, date) {
  const llm = ctx.get?.('llm')
  const selection = coachSelection(ctx)
  if (!llm || typeof llm.stream !== 'function') {
    throw coachError('LLM_UNAVAILABLE', COACH_CODE_MESSAGE.LLM_UNAVAILABLE)
  }
  if (!selection?.provider || !selection?.model) {
    throw coachError('LLM_UNAVAILABLE', 'Harness 还没有选择默认模型')
  }

  const built = await buildStewardContext(src, personal, mcp, date)
  if (built.snapshot?.status === 'unauthenticated') {
    throw coachError('GARMIN_UNAUTHENTICATED', COACH_CODE_MESSAGE.GARMIN_UNAUTHENTICATED)
  }
  const context = compactStewardContext(
    date,
    built.snapshot,
    built.sleep,
    built.load,
    built.extras,
    built.nutrition,
    !!src.advanced,
  )
  const prompts = stewardPrompts(date, context)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), STEWARD_TIMEOUT_MS)
  let result
  try {
    result = await streamCoach(llm, {
      provider: selection.provider,
      model: selection.model,
      ...(selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort }),
      system: prompts.system,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompts.user }] }],
      maxTokens: STEWARD_MAX_TOKENS,
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) throw coachError('TIMEOUT', '模型响应超时（90 秒），请重试')
    const code = err?.code && COACH_CODE_MESSAGE[err.code] ? err.code : 'TRANSPORT'
    const friendly = COACH_CODE_MESSAGE[code]
    const detail = String(err?.message ?? err)
    const message = friendly && detail !== friendly ? `${friendly}（${detail}）` : (friendly || detail)
    throw coachError(code, message, err?.providerRetryAfterMs ?? err?.retryAfterMs)
  } finally {
    clearTimeout(timer)
  }

  const finish = result.finish ?? { kind: 'stop' }
  if (finish.kind === 'error' || finish.kind === 'aborted') {
    const failure = finish.failure ?? {}
    const timedOut = finish.kind === 'aborted' && controller.signal.aborted
    const code = timedOut ? 'TIMEOUT' : (failure.code || (finish.kind === 'aborted' ? 'ABORTED' : 'LLM_ERROR'))
    const friendly = COACH_CODE_MESSAGE[code]
    const detail = failure.message
    const message = friendly
      ? (detail && detail !== friendly ? `${friendly}（${detail}）` : friendly)
      : (detail || '模型调用失败')
    throw coachError(code, message, failure.providerRetryAfterMs)
  }
  if (!result.text) {
    throw coachError(
      'EMPTY_RESPONSE',
      finish.kind === 'max-tokens'
        ? '模型只输出到推理部分就被截断，请重试'
        : COACH_CODE_MESSAGE.EMPTY_RESPONSE,
    )
  }
  const parsed = parseStewardVerdict(result.text)
  if (!parsed.text) throw coachError('EMPTY_RESPONSE', COACH_CODE_MESSAGE.EMPTY_RESPONSE)
  if (finish.kind === 'max-tokens') log('健康管家输出被 max-tokens 截断：', date)

  return {
    status: 'ok',
    date,
    generatedAt: new Date().toISOString(),
    model: selection.model,
    text: parsed.text,
    verdict: parsed.verdict,
    usage: result.usage,
  }
}

/** 同一数据源 + 日期一把锁：并发请求共用同一次生成，不会双扣 token */
export const stewardInflight = new Map()

export function stewardResult(ctx, src, personal, mcp, date, force) {
  const key = `steward:${src.label}:${date}`
  const running = stewardInflight.get(key)
  if (running) return running
  if (force) cache.delete(key) // force 才绕过 30 分钟缓存
  const p = cached(key, STEWARD_TTL_MS, () => generateSteward(ctx, src, personal, mcp, date))
  stewardInflight.set(key, p)
  const clear = () => { if (stewardInflight.get(key) === p) stewardInflight.delete(key) }
  p.then(clear, clear)
  return p
}

/* ------------------------------------------------------------------ *
 * AI 营养助手：把训练量 / 体重 / 睡眠 / 已有摄入翻译成可执行的饮食建议
 *
 *  - 用户没有 Garmin 营养订阅，官方饮食日志通常为空；空数据不报错，只写「未记录」
 *  - 上下文复用既有分发器（snapshotFor / activitiesFor / loadFor / extrasFor），
 *    只额外读一次官方 /nutrition-service/food/logs/<date>（失败按未记录处理）
 *  - 与教练/管家共用 provider/model 选择、错误码映射与流式消费
 *  - 结果按「数据源 label + 日期」缓存 6 小时；force 绕过；同键并发去重
 * ------------------------------------------------------------------ */
export const NUTRITION_ADVICE_TTL_MS = 6 * 60 * 60 * 1000

export const NUTRITION_MAX_TOKENS = 2600

export const NUTRITION_TIMEOUT_MS = 90_000

export const NUTRITION_LOG_TTL_MS = 30 * 60 * 1000

export const NUTRITION_SYSTEM = [
  '你是用户的 AI 营养助手，不是医生。基于训练量、体重、睡眠与现有摄入数据，给出可执行的饮食建议，不编造数据，缺失就写「未记录」。输出固定结构：## 今日热量与宏量（给出具体 kcal 与蛋白/碳水/脂肪克数，蛋白按体重 1.6-2.0 g/kg 估算并说明依据） ## 训练前后补给 ## 饮水 ## 注意事项（列出 2-3 条可执行习惯；末尾固定一行「以上建议仅供参考，不构成医疗建议」）',
  '',
  '补充规则：',
  '1. 严格按上面的四节顺序输出，用 markdown 小标题，全文控制在 350 字以内。',
  '2. 每节都给具体数字（kcal、克数、毫升、小时、分钟），不要泛泛而谈。',
  '3. 上下文里没有的数据直接写「未记录」，绝不推测或编造体重、摄入与训练量。',
  '4. 蛋白质总量按体重 1.6-2.0 g/kg 估算，并写明用的是哪个体重与计算依据；没有体重时说明无法估算，只给区间思路。',
  '5. 不做疾病诊断、不开药、不推荐补剂品牌；有慢性病或身体不适时只提醒咨询医生或注册营养师。',
  '6. 最后一行的免责声明必须原文保留：「以上建议仅供参考，不构成医疗建议」。',
].join('\n')

/**
 * 复用面板分发器（同源、同 date、同缓存键），只额外取一次官方饮食日志。
 * @returns {Promise<{snapshot:any, activities:any, load:any, extras:any, intake:any}>}
 */
export async function buildNutritionContext(src, personal, mcp, date) {
  const ns = src.label
  const [snapshot, activities, load, extras, intake] = await Promise.all([
    cached(`snapshot:${ns}:${date}`, 10 * 60 * 1000, () => snapshotFor(src, personal, mcp, date)),
    cached(`activities:${ns}:${date}:6`, 10 * 60 * 1000, () => activitiesFor(src, personal, mcp, 6, date)),
    cached(`load:${ns}:${date}:30`, 20 * 60 * 1000, () => loadFor(src, mcp, date, 30)),
    cached(`extras:${ns}:${date}`, 60 * 60 * 1000, () => extrasFor(src, personal, mcp, date)),
    cached(`nutrition-log:${ns}:${date}`, NUTRITION_LOG_TTL_MS, () => nutritionIntakeFor(src, personal, date)),
  ])
  return {
    snapshot: snapshot.data,
    activities: activities.data,
    load: load.data,
    extras: extras.data,
    intake: intake.data,
  }
}

/** 最近一次带体成分字段的体重记录（官方 / MCP 的 weighIns 同形） */
export function bodyCompositionOf(weighIns) {
  const rows = (Array.isArray(weighIns) ? weighIns : []).filter((w) => w && (
    typeof w.body_fat_percent === 'number'
    || typeof w.muscle_mass_kg === 'number'
    || typeof w.bone_mass_kg === 'number'
    || typeof w.body_water_percent === 'number'
    || typeof w.bmi === 'number'
  ))
  if (!rows.length) return null
  const latest = rows[rows.length - 1]
  const compact = stripEmpty({
    date: latest.date ?? null,
    body_fat_percent: round(numOrNull(latest.body_fat_percent), 1),
    muscle_mass_kg: round(numOrNull(latest.muscle_mass_kg), 2),
    bone_mass_kg: round(numOrNull(latest.bone_mass_kg), 2),
    body_water_percent: round(numOrNull(latest.body_water_percent), 1),
    bmi: round(numOrNull(latest.bmi), 1),
  })
  return Object.keys(compact).length ? compact : null
}

/**
 * 营养视角的上下文：训练量 + 身体数据 + 已有摄入。
 * 顶层键：date / training / training_load / sleep / body_battery / resting_hr /
 *        intensity_minutes / weight / body_composition / intake / missing
 */
export function compactNutritionContext(date, snapshot, activities, load, extras, intake, advanced) {
  const training = (activities?.activities ?? [])
    .filter((a) => activityDateOf(a?.start_time) === date)
    .map((a) => ({
      name: a?.name ?? null,
      type: a?.activity_type ?? a?.type ?? null,
      durationMin: round((numOrNull(a?.duration_seconds) ?? 0) / 60, 0),
      distanceKm: round((numOrNull(a?.distance_meters) ?? 0) / 1000, 2),
      avgHr: numOrNull(a?.avg_hr_bpm),
      maxHr: numOrNull(a?.max_hr_bpm),
    }))

  const sleep = snapshot?.kpi?.sleep
  const battery = snapshot?.kpi?.bodyBattery ?? {}
  const hours = sleep?.hours
  const weight = weightTrend(extras?.weighIns, date)
  const composition = bodyCompositionOf(extras?.weighIns)
  const current = advanced ? load?.current : null
  const trainingLoad = current
    ? {
        ctl: numOrNull(current.ctl),
        atl: numOrNull(current.atl),
        acwr: numOrNull(current.acwr),
        status: current.acwrStatus ?? current.status ?? null,
      }
    : null
  const intensity = snapshot?.kpi?.intensity

  const missing = []
  if (hours == null) missing.push('sleep')
  if (!weight) missing.push('weight')
  if (!intake) missing.push('intake')
  if (!training.length) missing.push('training')
  if (!composition) missing.push('body_composition')
  if (advanced && !trainingLoad) missing.push('training_load')

  const context = stripEmpty({
    date,
    training,
    training_load: trainingLoad,
    sleep: {
      hours: numOrNull(hours),
      score: numOrNull(sleep?.score),
      hrv: numOrNull(sleep?.hrv),
      qualifier: sleep?.qualifier ?? null,
    },
    body_battery: {
      current: numOrNull(battery.current),
      charged: numOrNull(battery.charged),
      drained: numOrNull(battery.drained),
      highest: numOrNull(battery.highest),
      lowest: numOrNull(battery.lowest),
    },
    resting_hr: {
      today: numOrNull(snapshot?.kpi?.rhr?.value),
      avg_7d: numOrNull(snapshot?.kpi?.rhr?.avg7),
    },
    intensity_minutes: intensity
      ? {
          total: numOrNull(intensity.total),
          goal: numOrNull(intensity.goal),
          moderate: numOrNull(intensity.moderate),
          vigorous: numOrNull(intensity.vigorous),
        }
      : null,
    weight,
    body_composition: composition,
    intake,
  })
  // missing 即使是空数组也要保留，模型才知道「没有缺失」
  context.missing = missing
  return context
}

export function nutritionPrompts(date, context) {
  const user = [
    `日期：${date}`,
    '以下是这台设备的 Garmin 数据（JSON；缺失字段即「未记录」）：',
    '```json',
    JSON.stringify(context),
    '```',
    '请严格按四节结构输出，给具体 kcal / 克数 / 毫升，不要编造，结尾保留免责声明。',
  ].join('\n')
  return { system: NUTRITION_SYSTEM, user }
}

/** 真正调模型的那一步；失败一律抛带 code 的错误（不写缓存） */
export async function generateNutrition(ctx, src, personal, mcp, date) {
  const llm = ctx.get?.('llm')
  const selection = coachSelection(ctx)
  if (!llm || typeof llm.stream !== 'function') {
    throw coachError('LLM_UNAVAILABLE', COACH_CODE_MESSAGE.LLM_UNAVAILABLE)
  }
  if (!selection?.provider || !selection?.model) {
    throw coachError('LLM_UNAVAILABLE', 'Harness 还没有选择默认模型')
  }

  const built = await buildNutritionContext(src, personal, mcp, date)
  if (built.snapshot?.status === 'unauthenticated') {
    throw coachError('GARMIN_UNAUTHENTICATED', COACH_CODE_MESSAGE.GARMIN_UNAUTHENTICATED)
  }
  const context = compactNutritionContext(
    date,
    built.snapshot,
    built.activities,
    built.load,
    built.extras,
    built.intake,
    !!src.advanced,
  )
  const prompts = nutritionPrompts(date, context)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), NUTRITION_TIMEOUT_MS)
  let result
  try {
    result = await streamCoach(llm, {
      provider: selection.provider,
      model: selection.model,
      ...(selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort }),
      system: prompts.system,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompts.user }] }],
      maxTokens: NUTRITION_MAX_TOKENS,
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) throw coachError('TIMEOUT', '模型响应超时（90 秒），请重试')
    const code = err?.code && COACH_CODE_MESSAGE[err.code] ? err.code : 'TRANSPORT'
    const friendly = COACH_CODE_MESSAGE[code]
    const detail = String(err?.message ?? err)
    const message = friendly && detail !== friendly ? `${friendly}（${detail}）` : (friendly || detail)
    throw coachError(code, message, err?.providerRetryAfterMs ?? err?.retryAfterMs)
  } finally {
    clearTimeout(timer)
  }

  const finish = result.finish ?? { kind: 'stop' }
  if (finish.kind === 'error' || finish.kind === 'aborted') {
    const failure = finish.failure ?? {}
    const timedOut = finish.kind === 'aborted' && controller.signal.aborted
    const code = timedOut ? 'TIMEOUT' : (failure.code || (finish.kind === 'aborted' ? 'ABORTED' : 'LLM_ERROR'))
    const friendly = COACH_CODE_MESSAGE[code]
    const detail = failure.message
    const message = friendly
      ? (detail && detail !== friendly ? `${friendly}（${detail}）` : friendly)
      : (detail || '模型调用失败')
    throw coachError(code, message, failure.providerRetryAfterMs)
  }
  if (!result.text) {
    throw coachError(
      'EMPTY_RESPONSE',
      finish.kind === 'max-tokens'
        ? '模型只输出到推理部分就被截断，请重试'
        : COACH_CODE_MESSAGE.EMPTY_RESPONSE,
    )
  }
  if (finish.kind === 'max-tokens') log('营养建议输出被 max-tokens 截断：', date)

  return {
    status: 'ok',
    date,
    generatedAt: new Date().toISOString(),
    model: selection.model,
    text: result.text,
    usage: result.usage,
  }
}

/** 同一数据源 + 日期一把锁：并发请求共用同一次生成，不会双扣 token */
export const nutritionInflight = new Map()

export function nutritionResult(ctx, src, personal, mcp, date, force) {
  const key = `nutrition-advice:${src.label}:${date}`
  const running = nutritionInflight.get(key)
  if (running) return running
  if (force) cache.delete(key) // force 才绕过 6 小时缓存
  const p = cached(key, NUTRITION_ADVICE_TTL_MS, () => generateNutrition(ctx, src, personal, mcp, date))
  nutritionInflight.set(key, p)
  const clear = () => { if (nutritionInflight.get(key) === p) nutritionInflight.delete(key) }
  p.then(clear, clear)
  return p
}
