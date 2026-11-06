/**
 * 佳明面板 · Host 半 / HTTP 路由
 *
 * 路由描述符列表：路径、方法无关的只读聚合、TTL 缓存键、错误降级。
 * 由 host/plugin.js 在 ctx.effect 内调用并注册到 ctx.webServer。
 */
import { existsSync } from 'node:fs'

import { DEFAULT_BIN, KEY_FILE, ROUTE, TOKEN_FILE, cache, cached, dataSource, log, resolveDay, today, weekRange } from './config.js'
import { BODY_BATTERY_TTL_MS, CALENDAR_TTL_MS, PROFILE_TTL_MS, TRENDS_TTL_MS, WOMENS_TTL_MS, activitiesFor, activityDetailFor, activityTrackFor, bodyBatteryFor, buildAccountState, buildOfficialTrends, buildProfile, buildWomens, calendarFor, describeKeyError, deviceDetailFor, devicesFor, extrasFor, loadFor, markKeyCheck, monthRange, parseTrendDays, resetKeyCheck, sleepFor, snapshotFor, validatePersonalKey, writePersonalKey } from './official.js'
import { ACTIVITY_TTL_MS, ANALYSIS_TTL_MS, PLAN_TTL_MS, STREAM_TTL_MS, activityAnalysisFor, activityFromPath, activityStreamsFor, deviceIdFromPath, planFor } from './mcp.js'
import { coachResult, coachSelection, nutritionResult, stewardResult } from './llm.js'
import { readStaticMapBody, staticMapResult, staticMapStatus } from './staticmap.js'

export function createRoutes({ ctx, mcp, personal, installer, loginFlow, startLogin, roadbook, json, readJson, dateOf }) {
  const route = (path, handler, kind = 'exact') => ({
    kind,
    path: `${ROUTE}/${path}`,
    handler: async (req, res) => {
      try {
        const url = new URL(req.url ?? '/', 'http://127.0.0.1')
        const out = await handler(url, req)
        json(res, 200, out)
      } catch (err) {
        const message = String(err?.message ?? err)
        log('请求失败：', message)
        json(res, 200, { status: 'error', message })
      }
    },
  })

  return [
      ...roadbook.routes,

      route('status', async () => {
        const src = dataSource()
        return {
          status: 'ok',
          // 有官方密钥或 SSO 令牌任一即视为已连接（官方模式下不再要求 SSO）
          authed: src.hasKey || existsSync(TOKEN_FILE),
          ssoAuthed: existsSync(TOKEN_FILE),
          mcp: mcp.alive ? 'connected' : src.advanced ? 'starting' : 'disabled',
          tokenPath: TOKEN_FILE,
          hasKey: src.hasKey,
          mode: src.mode,
          source: src.mode,
          advanced: src.advanced,
        }
      }),

      // 高德静态地图：活动轨迹 / 路书预览的底图
      //   POST /garmin-panel/api/staticmap
      // 缺 Key / 高德报错 / 网络故障都降级为 { status: 'unavailable' }，面板回退到 SVG 轨迹。
      route('staticmap', async (url, req) => {
        if (req.method && String(req.method).toUpperCase() !== 'POST') {
          return { status: 'error', message: '请用 POST 提交坐标' }
        }
        let body
        try {
          body = await readStaticMapBody(req)
        } catch (err) {
          return { status: 'error', message: String(err?.message ?? err) }
        }
        return staticMapResult(body, { force: url.searchParams.get('force') === '1' })
      }),

      // 静态地图配置体检：{ configured, valid }（复用路书工坊的 Key 体检缓存）
      route('staticmap/status', async () => staticMapStatus()),

      route('snapshot', async (url) => {
        const date = dateOf(url)
        const src = dataSource()
        const { data } = await cached(`snapshot:${src.label}:${date}`, 10 * 60 * 1000, () =>
          snapshotFor(src, personal, mcp, date),
        )
        return data
      }),

      route('sleep', async (url) => {
        const days = Math.min(30, Math.max(3, Number(url.searchParams.get('days') || 7)))
        const date = dateOf(url)
        const src = dataSource()
        const { data } = await cached(`sleep:${src.label}:${date}:${days}`, 20 * 60 * 1000, () =>
          sleepFor(src, personal, mcp, date, days),
        )
        return data
      }),

      // 健康趋势：官方日汇总 + HRV + 睡眠 + 体重逐日对齐（只走官方源，无 MCP 兜底）
      route('trends', async (url) => {
        const days = parseTrendDays(url.searchParams.get('days'))
        const date = dateOf(url)
        const src = dataSource()
        const { data } = await cached(`trends:${src.label}:${date}:${days}`, TRENDS_TTL_MS, () =>
          buildOfficialTrends(personal, date, days),
        )
        return data
      }),

      // Body Battery 当日曲线：GET /garmin-panel/api/body-battery?date=YYYY-MM-DD
      // 默认日期今天；10 分钟缓存（同一天多次挂载只打一次官方接口）。
      route('body-battery', async (url) => {
        const date = dateOf(url)
        const src = dataSource()
        const { data } = await cached(
          `bodybattery:${src.label}:${date}`,
          BODY_BATTERY_TTL_MS,
          () => bodyBatteryFor(src, personal, date),
        )
        return data
      }),

      // 训练计划（B 类，高级模式）：本周排课 + Garmin Coach + 活跃目标
      route('plan', async () => {
        const src = dataSource()
        const week = weekRange(today())
        const { data } = await cached(`plan:${src.label}:${week.start}`, PLAN_TTL_MS, () =>
          planFor(src, mcp, week),
        )
        return data
      }),

      // 个人档案（B 类）：官方 settings + MCP 补 gender/name
      route('profile', async () => {
        const src = dataSource()
        const { data } = await cached(`profile:${src.label}`, PROFILE_TTL_MS, () =>
          buildProfile(src, personal, mcp),
        )
        return data
      }),

      // 女性健康（B 类）：经期概览（官方）+ 孕期摘要（MCP）
      route('womens', async (url) => {
        const date = dateOf(url)
        const src = dataSource()
        const { data } = await cached(`womens:${src.label}:${date}`, WOMENS_TTL_MS, () =>
          buildWomens(src, personal, mcp, date),
        )
        return data
      }),

      route('load', async (url) => {
        const days = Math.min(90, Math.max(7, Number(url.searchParams.get('days') || 30)))
        const date = dateOf(url)
        const src = dataSource()
        const { data } = await cached(`load:${src.label}:${date}:${days}`, 20 * 60 * 1000, () =>
          loadFor(src, mcp, date, days),
        )
        return data
      }),

      route('activities', async (url) => {
        const limit = Math.min(20, Math.max(1, Number(url.searchParams.get('limit') || 8)))
        const date = dateOf(url)
        const src = dataSource()
        const { data } = await cached(`activities:${src.label}:${date}:${limit}`, 10 * 60 * 1000, () =>
          activitiesFor(src, personal, mcp, limit, date),
        )
        return data
      }),

      // 活动日历（按月聚合）：必须注册在下面的 'activities' 前缀路由之前，
      // 否则 /activities/calendar 会先被前缀路由吃掉、被当成活动 ID 解析。
      route('activities/calendar', async (url) => {
        const src = dataSource()
        const range = monthRange(url.searchParams.get('month'))
        const { data } = await cached(`calendar:${src.label}:${range.month}`, CALENDAR_TTL_MS, () =>
          calendarFor(src, personal, mcp, range.month),
        )
        return data
      }),

      // 单活动详情 / 离线轨迹 / FIT 曲线：
      //   /garmin-panel/api/activities/<id>
      //   /garmin-panel/api/activities/<id>/track
      //   /garmin-panel/api/activities/<id>/streams
      // 注意：DSH webServer 的前缀路由是“最长前缀优先”，同一个 `activities`
      // 前缀只能注册一次（重复会抛错），所以 /streams、/analysis 必须在这个
      // 前缀处理器里先分流，不能另注册一个同前缀路由（那样会抢走详情/轨迹）。
      route(
        'activities',
        async (url) => {
          const src = dataSource()
          // 单活动深度分析（B 类，高级模式）：
          //   /garmin-panel/api/activities/<id>/analysis
          const analysisMatch = /\/activities\/([^/]+)\/analysis\/?$/.exec(url.pathname)
          if (analysisMatch) {
            const raw = analysisMatch[1]
            if (!/^\d+$/.test(raw)) throw new Error(`无效的活动 ID：${raw}`)
            const analysisId = Number(raw)
            if (!Number.isSafeInteger(analysisId) || analysisId <= 0) {
              throw new Error(`无效的活动 ID：${raw}`)
            }
            const { data } = await cached(
              `activity:analysis:${src.label}:${analysisId}`,
              ANALYSIS_TTL_MS,
              () => activityAnalysisFor(src, mcp, analysisId),
            )
            return data
          }
          const streamMatch = /\/activities\/([^/]+)\/streams\/?$/.exec(url.pathname)
          if (streamMatch) {
            const raw = streamMatch[1]
            if (!/^\d+$/.test(raw)) throw new Error(`无效的活动 ID：${raw}`)
            const streamId = Number(raw)
            if (!Number.isSafeInteger(streamId) || streamId <= 0) {
              throw new Error(`无效的活动 ID：${raw}`)
            }
            const { data } = await cached(
              `activity:streams:${src.label}:${streamId}`,
              STREAM_TTL_MS,
              () => activityStreamsFor(src, personal, mcp, streamId),
            )
            return data
          }
          const { id, track } = activityFromPath(url)
          if (track) {
            const { data } = await cached(`activity:track:${src.label}:${id}`, ACTIVITY_TTL_MS, () =>
              activityTrackFor(src, mcp, id),
            )
            return data
          }
          const { data } = await cached(`activity:detail:${src.label}:${id}`, ACTIVITY_TTL_MS, () =>
            activityDetailFor(src, personal, mcp, id),
          )
          return data
        },
        'prefix',
      ),

      route('extras', async (url) => {
        const date = dateOf(url)
        const src = dataSource()
        const { data } = await cached(`extras:${src.label}:${date}`, 60 * 60 * 1000, () =>
          extrasFor(src, personal, mcp, date),
        )
        return data
      }),

      // 设备列表（精确路由，优先于下面的前缀路由）
      route('devices', async () => {
        const src = dataSource()
        const { data } = await cached(`devices:${src.label}`, 5 * 60 * 1000, () => devicesFor(src, mcp))
        return data
      }),

      // 单设备详情：/garmin-panel/api/devices/<id>
      // 注意前缀不能带结尾斜杠——webServer 的前缀匹配只认 `${prefix}/` 开头，
      // 带斜杠时会变成 `//`，反而匹配不到 /devices/<id>。
      route(
        'devices',
        async (url) => {
          const id = deviceIdFromPath(url)
          const src = dataSource()
          const { data } = await cached(`devices:detail:${src.label}:${id}`, 5 * 60 * 1000, () =>
            deviceDetailFor(src, mcp, id),
          )
          return data
        },
        'prefix',
      ),

      // 数据源状态：官方密钥 / 高级模式是否就绪（不含任何密钥）
      route('setup/status', async () => {
        const hasKey = existsSync(KEY_FILE)
        const mcpInstalled = existsSync(DEFAULT_BIN)
        const ssoAuthed = existsSync(TOKEN_FILE)
        const keyValid = hasKey ? await validatePersonalKey(personal) : false
        const advanced = mcpInstalled && ssoAuthed
        const mode = hasKey && keyValid ? 'official' : advanced ? 'sso' : 'none'
        return { hasKey, keyValid, mcpInstalled, ssoAuthed, mode, advanced }
      }),

      // 写入官方 Personal API 密钥：先校验换令牌，再 0600 落盘，最后清缓存
      route('setup/key', async (url, req) => {
        if (req.method && req.method !== 'POST') return { ok: false, error: '请用 POST 提交密钥' }
        let body
        try {
          body = await readJson(req)
        } catch (err) {
          return { ok: false, error: String(err?.message ?? err) }
        }
        const key = typeof body?.key === 'string' ? body.key.trim() : ''
        if (!key) return { ok: false, error: '密钥不能为空' }
        if (key.length < 16 || key.length > 512 || /\s/.test(key)) {
          return { ok: false, error: '密钥格式不正确（应为 Garmin 生成的单行 API Key）' }
        }
        try {
          await personal.probe(key)
        } catch (err) {
          log('Personal API 密钥校验失败：', err?.status ? `HTTP ${err.status}` : String(err?.name ?? 'error'))
          return { ok: false, error: describeKeyError(err) }
        }
        try {
          writePersonalKey(key)
        } catch (err) {
          personal.reset()
          return { ok: false, error: `写入密钥文件失败：${String(err?.message ?? err)}` }
        }
        personal.reset()
        markKeyCheck(true)
        cache.clear()
        return { ok: true, mode: 'official', source: 'official' }
      }),

      // 安装高级模式（幂等）：uv 缺失先装 uv，再 uv tool install garmin-mcp
      route('setup/install', async (url, req) => {
        if (req.method && req.method !== 'POST') {
          return { started: false, error: '请用 POST 开始安装' }
        }
        installer.start()
        return { started: true }
      }),

      route('setup/install/log', async () => installer.snapshot()),

      // 高级模式登录别名（Client 仍可用 /login）
      route('setup/advanced/login', startLogin),

      // 有任一数据源（官方密钥或 SSO 令牌）就算已连接；官方模式不再强制 SSO
      route('login/status', async () => {
        const src = dataSource()
        return {
          ...loginFlow.snapshot(),
          authed: src.hasKey || existsSync(TOKEN_FILE),
          ssoAuthed: existsSync(TOKEN_FILE),
          hasKey: src.hasKey,
          mode: src.mode,
          advanced: src.advanced,
        }
      }),

      // AI 教练：可用性探针（只查服务，不触发模型调用）
      route('coach/status', async () => {
        const llm = ctx.get?.('llm')
        const selection = coachSelection(ctx)
        const src = dataSource()
        return {
          available:
            !!llm && typeof llm.stream === 'function' && !!selection?.provider && !!selection?.model,
          model: selection?.model ?? null,
          mode: src.mode,
          advanced: src.advanced,
        }
      }),

      // AI 教练：点一次跑一次；同一天结果缓存 30 分钟，force 绕过
      route('coach', async (url, req) => {
        const body = await readJson(req).catch(() => ({}))
        const date = resolveDay(typeof body?.date === 'string' ? body.date : url.searchParams.get('date'))
        const src = dataSource()
        try {
          const { data } = await coachResult(ctx, src, personal, mcp, date, body?.force === true)
          return data
        } catch (err) {
          const code = err?.code || 'INTERNAL'
          const payload = { status: 'error', code, message: String(err?.message ?? err) }
          if (Number.isFinite(err?.retryAfterMs)) payload.retryAfterMs = Math.round(err.retryAfterMs)
          log('教练调用失败：', code, payload.message)
          return payload
        }
      }),

      // AI 健康管家：可用性探针（只查服务，不触发模型调用）
      route('steward/status', async () => {
        const llm = ctx.get?.('llm')
        const selection = coachSelection(ctx)
        return {
          available:
            !!llm && typeof llm.stream === 'function' && !!selection?.provider && !!selection?.model,
          model: selection?.model ?? null,
        }
      }),

      // AI 健康管家：健康视角只读分析；同一天结果缓存 30 分钟，force 绕过
      route('steward', async (url, req) => {
        const body = await readJson(req).catch(() => ({}))
        const date = resolveDay(typeof body?.date === 'string' ? body.date : url.searchParams.get('date'))
        const src = dataSource()
        try {
          const { data } = await stewardResult(ctx, src, personal, mcp, date, body?.force === true)
          return data
        } catch (err) {
          const code = err?.code || 'INTERNAL'
          const payload = { status: 'error', code, message: String(err?.message ?? err) }
          if (Number.isFinite(err?.retryAfterMs)) payload.retryAfterMs = Math.round(err.retryAfterMs)
          log('健康管家调用失败：', code, payload.message)
          return payload
        }
      }),

      // AI 营养助手：可用性探针（只查服务，不触发模型调用）
      route('nutrition/advice/status', async () => {
        const llm = ctx.get?.('llm')
        const selection = coachSelection(ctx)
        return {
          available:
            !!llm && typeof llm.stream === 'function' && !!selection?.provider && !!selection?.model,
          model: selection?.model ?? null,
        }
      }),

      // AI 营养助手：点一次跑一次；同一天结果缓存 6 小时，force 绕过
      route('nutrition/advice', async (url, req) => {
        const body = await readJson(req).catch(() => ({}))
        const date = resolveDay(typeof body?.date === 'string' ? body.date : url.searchParams.get('date'))
        const src = dataSource()
        try {
          const { data } = await nutritionResult(ctx, src, personal, mcp, date, body?.force === true)
          return data
        } catch (err) {
          const code = err?.code || 'INTERNAL'
          const payload = { status: 'error', code, message: String(err?.message ?? err) }
          if (Number.isFinite(err?.retryAfterMs)) payload.retryAfterMs = Math.round(err.retryAfterMs)
          log('营养建议调用失败：', code, payload.message)
          return payload
        }
      }),

      // 账号设置：一次性给出官方密钥 / SSO 令牌 / 高级模式的体检结果
      route('account', async () => buildAccountState(personal)),

      // 账号设置：强制重换一次 Personal API 令牌（不写盘、不改任何 Garmin 数据）
      route('account/revalidate-key', async (url, req) => {
        if (req.method && req.method !== 'POST') return { ok: false, error: '请用 POST 重新校验密钥' }
        if (!existsSync(KEY_FILE)) {
          markKeyCheck(false)
          return { ok: false, error: '未配置 Personal API 密钥' }
        }
        personal.reset()
        try {
          await personal.bearer()
          markKeyCheck(true)
          return { ok: true }
        } catch (err) {
          log('Personal API 密钥重新校验失败：', err?.status ? `HTTP ${err.status}` : String(err?.name ?? 'error'))
          markKeyCheck(false)
          return { ok: false, error: describeKeyError(err) }
        }
      }),

      route('login', startLogin),

      route('login/mfa', async (url, req) => {
        const body = await readJson(req)
        return loginFlow.submitMfa(body.code)
      }),

      route('refresh', async () => {
        cache.clear()
        personal.reset()
        resetKeyCheck()
        return { status: 'ok', cleared: true, mode: dataSource().mode }
      }),
  ]
}
