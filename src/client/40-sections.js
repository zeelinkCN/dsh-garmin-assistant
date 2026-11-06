    function Skel({ h: height = 60 }) {
      return h('div', { className: 'gp-skel', style: { height } })
    }

    /** KPI 卡里居中的骨架，高度与对应图形一致，切换时不跳动 */
    function KpiSkel({ height = 80 }) {
      return h('div', { className: 'viz' },
        h('div', { style: { width: '100%' } }, h(Skel, { h: height })))
    }

    /* ---------------------------------------------------------------- *
     * AI 教练
     * 只在点击时调模型（一次调用 = 一次对话额度），结果留在组件 state 里
     * ---------------------------------------------------------------- */
    const COACH_CODE_ZH = {
      RATE_LIMIT: '模型限流，稍后再试',
      ACCOUNT_QUOTA: '账号额度不足',
      ACCOUNT_SIGN_IN_REQUIRED: 'Harness 账号需要重新登录',
      ACCOUNT_TOKEN_INVALID: 'Harness 账号令牌失效，请重新登录',
      AUTH: '模型凭证无效，请重新登录',
      LLM_UNAVAILABLE: '未配置模型',
      GARMIN_UNAUTHENTICATED: 'Garmin 未登录',
      TIMEOUT: '模型响应超时',
      TRANSPORT: '网络异常，连不上模型服务',
      SOCKS: '网络代理异常',
      EMPTY_RESPONSE: '模型没有返回正文',
      CONTEXT_WINDOW_EXCEEDED: '数据超出模型上下文',
      INVALID_REQUEST: '请求参数不合法',
      NETWORK: '连不上面板后端',
      INTERNAL: '服务端内部错误',
    }

    /* 行内 markdown-lite：**粗体** 与 `代码`（其余原样） */
    function coachInline(text, keyBase) {
      const parts = []
      const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
      let last = 0
      let seq = 0
      let m
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push(text.slice(last, m.index))
        const token = m[0]
        parts.push(token.startsWith('**')
          ? h('b', { key: `${keyBase}-b${seq++}` }, token.slice(2, -2))
          : h('code', { key: `${keyBase}-c${seq++}` }, token.slice(1, -1)))
        last = m.index + token.length
      }
      if (last < text.length) parts.push(text.slice(last))
      return parts
    }

    /* 行级 markdown-lite：## 标题 / 「」整行标题 / - 列表 / 1. 有序列表 / 空行留白 */
    function coachLines(text) {
      const nodes = []
      String(text || '').split(/\r?\n/).forEach((raw, i) => {
        const line = raw.trim()
        if (!line) { nodes.push(h('div', { key: i, className: 'gp-coach-gap' })); return }

        const heading =
          /^#{1,4}\s*(.+?)\s*#*$/.exec(line) ||
          /^\*\*([^*]+)\*\*$/.exec(line) ||
          /^[「【](.+?)[」】]$/.exec(line)
        if (heading) {
          nodes.push(h('div', { key: i, className: 'gp-coach-h' }, ...coachInline(heading[1], i)))
          return
        }

        const bullet = /^[-*•·]\s+(.+)$/.exec(line)
        if (bullet) {
          nodes.push(h('div', { key: i, className: 'gp-coach-li' },
            h('i', null, '•'), h('span', null, ...coachInline(bullet[1], i))))
          return
        }

        const ordered = /^(\d{1,2})[.、)]\s+(.+)$/.exec(line)
        if (ordered) {
          nodes.push(h('div', { key: i, className: 'gp-coach-li' },
            h('i', null, `${ordered[1]}.`), h('span', null, ...coachInline(ordered[2], i))))
          return
        }

        // 「训练建议：xxx」这类短标签行，把冒号前加粗
        const labelled = /^([^：:]{2,6})[：:]\s*(.+)$/.exec(line)
        if (labelled) {
          nodes.push(h('div', { key: i, className: 'gp-coach-p' },
            h('b', null, labelled[1]), '：', ...coachInline(labelled[2], i)))
          return
        }

        nodes.push(h('div', { key: i, className: 'gp-coach-p' }, ...coachInline(line, i)))
      })
      return nodes
    }

    /* AI 健康：教练 / 管家双角色。两个角色的结果分别缓存，切换 tab 不重新请求 */
    const STEWARD_CODE_ZH = {
      RATE_LIMIT: '模型限流，稍后再试',
      ACCOUNT_QUOTA: '账号额度不足',
      ACCOUNT_SIGN_IN_REQUIRED: 'Harness 账号需要重新登录',
      LLM_UNAVAILABLE: '当前 Harness 未配置可用模型',
      TIMEOUT: '分析超时，请重试',
    }
    const VERDICT_ZH = { keep: '保持即可', watch: '可以留意', attention: '需要关注' }
    const VERDICT_IDS = ['keep', 'watch', 'attention']
    const emptyRole = () => ({ phase: 'idle', result: null, error: null })

    function emptyStatus() {
      return {
        coach: { loading: true, available: null, model: null },
        steward: { loading: true, available: null, model: null },
      }
    }

    function coachStamp(result) {
      const generated = result?.generatedAt ? new Date(result.generatedAt) : null
      return generated && !Number.isNaN(generated.getTime())
        ? generated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
        : '—'
    }

    /**
     * 双角色状态放在 Page（而不是卡片）里，这样隐藏/显示区块不会丢缓存，
     * 但 enabled=false 时两个 status 请求都不会发出。
     */
    function useCoachRoles({ date, enabled, version }) {
      const [tab, setTab] = React.useState('coach') // coach | steward
      const [coach, setCoach] = React.useState(emptyRole)
      const [steward, setSteward] = React.useState(emptyRole)
      const [status, setStatus] = React.useState(emptyStatus)
      const [copied, setCopied] = React.useState(null) // role id | null
      const copyTimer = React.useRef(null)
      const statusLoaded = React.useRef(false)

      React.useEffect(() => () => {
        if (copyTimer.current) clearTimeout(copyTimer.current)
      }, [])

      /* 可用性只查一次（两个 status 都很便宜，不产生模型调用） */
      React.useEffect(() => {
        if (!enabled || statusLoaded.current) return undefined
        const controller = new AbortController()
        let cancelled = false
        const grab = (path) =>
          fetch(`${API}/${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
            .then((r) => r.json())
            .then((d) => ({ available: d?.available === true, model: d?.model ?? null }))
            .catch(() => ({ available: false, model: null }))
        Promise.all([grab('coach/status'), grab('steward/status')]).then(([c, s]) => {
          if (cancelled) return
          statusLoaded.current = true
          setStatus({ coach: { loading: false, ...c }, steward: { loading: false, ...s } })
        })
        return () => { cancelled = true; controller.abort() }
      }, [enabled])

      /* 刷新（version）或切换回看日期时清空两个角色的缓存结果：
         旧结果只对生成那天有意义，跨天不该继续挂着 */
      React.useEffect(() => {
        setCoach(emptyRole())
        setSteward(emptyRole())
        setCopied(null)
      }, [version, date])

      const run = React.useCallback((role, force) => {
        const setRole = role === 'coach' ? setCoach : setSteward
        const path = role === 'coach' ? 'coach' : 'steward'
        setRole((s) => ({ ...s, phase: 'loading', error: null }))
        setCopied(null)
        fetch(`${API}/${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force: !!force, ...(date ? { date } : {}) }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.status === 'ok' && data.text) {
              setRole({ phase: 'ok', result: data, error: null })
              if (data.model) {
                setStatus((s) => ({ ...s, [role]: { ...s[role], loading: false, available: true, model: data.model } }))
              }
              return
            }
            setRole({
              phase: 'error',
              result: null,
              error: {
                code: data?.code || 'INTERNAL',
                message: data?.message || '',
                retryAfterMs: data?.retryAfterMs,
              },
            })
          })
          .catch((err) => {
            setRole({ phase: 'error', result: null, error: { code: 'NETWORK', message: String(err?.message || err) } })
          })
      }, [date])

      const copy = React.useCallback((role) => {
        const text = (role === 'coach' ? coach : steward).result?.text
        if (!text) return
        copyText(text).then((ok) => {
          if (!ok) return
          setCopied(role)
          if (copyTimer.current) clearTimeout(copyTimer.current)
          copyTimer.current = setTimeout(() => setCopied(null), 1800)
        })
      }, [coach, steward])

      return { tab, setTab, coach, steward, status, copied, run, copy }
    }

    const COACH_ROLE_LABEL = { coach: 'AI 教练', steward: 'AI 健康管家' }

    /** 角色分段切换：只渲染当前可见的角色（卡片被隐藏时对应 tab 一并消失） */
    function CoachTabs({ roles, tab, setTab }) {
      return h('div', { className: 'gp-seg', role: 'tablist', 'aria-label': 'AI 建议角色' },
        roles.map((role) => h('button', {
          key: role,
          type: 'button',
          role: 'tab',
          'aria-selected': tab === role,
          className: `gp-seg-btn${tab === role ? ' on' : ''}`,
          'data-gp-tab': role,
          onClick: () => setTab(role),
        }, COACH_ROLE_LABEL[role] || role)))
    }

    /**
     * 角色卡片。普通模式由 tab 切换；编辑态用 pinned 固定角色、隐藏 tab
     * （角色 tab 在板块级单独渲染，所以隐藏角色卡片时 tab 会一起消失）。
     */
    function CoachCard({
      api, roles = ['coach', 'steward'], pinned = null, showTabs = true,
      date = null, reviewing = false,
    }) {
      const { tab, setTab, coach, steward, status, copied, run, copy } = api
      const enabledRoles = Array.isArray(roles) ? roles : ['coach', 'steward']
      if (!enabledRoles.length) return null
      const role = pinned && enabledRoles.includes(pinned)
        ? pinned
        : enabledRoles.includes(tab) ? tab : enabledRoles[0]
      const roleState = role === 'coach' ? coach : steward
      const roleStatus = status[role] || {}
      const verdict = role === 'steward' && roleState.phase === 'ok' && VERDICT_IDS.includes(roleState.result?.verdict)
        ? roleState.result.verdict
        : null
      const cardCls = `gp-card gp-coach${verdict ? ` verdict-${verdict}` : ''}`
      const stamp = coachStamp(roleState.result)
      /* 回看时把建议自己覆盖的那天写进页脚（结果里带 date 就用它，否则用当前选中日） */
      const adviceDay = dayPart(roleState.result?.date) || (reviewing ? dayPart(date) : null)
      const model = roleState.result?.model || roleStatus.model

      let body
      if (roleState.phase === 'loading') {
        body = h('div', null,
          h('div', { className: 'gp-coach-skel' },
            h('div', { className: 'gp-skel', style: { height: 13, width: '58%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '94%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '88%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '72%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '84%' } })),
          h('div', { className: 'gp-coach-muted', style: { marginTop: 10 } },
            role === 'coach' ? '教练正在看你的数据…（约 5–10 秒）' : '管家正在看你的数据…（约 5–10 秒）'))
      } else if (roleState.phase === 'error') {
        const err = roleState.error || {}
        let friendly
        if (role === 'coach') {
          friendly = COACH_CODE_ZH[err.code] || err.message || '教练暂时不可用'
        } else {
          const secs = err.retryAfterMs ? Math.max(1, Math.ceil(err.retryAfterMs / 1000)) : null
          friendly = err.code === 'RATE_LIMIT'
            ? `模型限流，稍后再试${secs ? `（${secs} 秒后）` : ''}`
            : STEWARD_CODE_ZH[err.code] || err.message || '管家暂时不可用'
        }
        const known = role === 'coach' ? COACH_CODE_ZH[err.code] : STEWARD_CODE_ZH[err.code]
        // 已知错误码已经翻译过；只有原始 message 明显更详细时才再显示一行
        const rawText = err.message && err.message !== friendly &&
          (known ? err.message.length > friendly.length + 6 : true)
          ? err.message
          : null
        body = h('div', null,
          h('div', { className: 'gp-coach-err' },
            h('b', null, friendly),
            rawText ? h('span', { className: 'gp-coach-muted' }, rawText) : null),
          h('div', { className: 'gp-coach-actions' },
            err.retryAfterMs
              ? h('span', { className: 'gp-coach-muted' },
                  `建议 ${Math.max(1, Math.ceil(err.retryAfterMs / 1000))} 秒后重试`)
              : null,
            h('button', { className: 'gp-btn', onClick: () => run(role, true) }, '重试')))
      } else if (roleState.phase === 'ok' && roleState.result?.text) {
        const isSteward = role === 'steward'
        body = h('div', null,
          isSteward && verdict
            ? h('div', { className: `gp-verdict ${verdict}` },
                h('span', { className: 'tag' }, VERDICT_ZH[verdict]),
                h('span', null, '今日健康结论'))
            : null,
          h('div', { className: 'gp-coach-body' }, ...coachLines(roleState.result.text)),
          h('div', {
            className: 'gp-coach-foot',
            'data-gp-advice-date': adviceDay || '',
          },
            h('span', null, `模型 ${model || '—'} · 生成于 ${stamp}`),
            adviceDay && reviewing
              ? h('span', { className: 'gp-advice-day', 'data-gp-advice-based': '1' },
                  `基于 ${shortDay(adviceDay)}`)
              : null,
            h('span', { className: 'sp' },
              isSteward
                ? h('button', { className: 'gp-btn', onClick: () => copy('steward') },
                    copied === 'steward' ? '已复制' : '复制')
                : null,
              h('button', { className: 'gp-btn', onClick: () => run(role, true) }, '重新分析'),
              isSteward
                ? null
                : h('button', { className: 'gp-btn', onClick: () => copy('coach') },
                    copied === 'coach' ? '已复制' : '复制建议'))))
      } else {
        body = h('div', null,
          h('div', { className: 'gp-coach-pitch' },
            role === 'coach'
              ? '让教练结合今天的准备度、负荷和睡眠，给出可执行的训练与恢复建议。'
              : '让管家看看睡眠、HRV、压力与 Body Battery，给出今天的生活与恢复提醒。'),
          roleStatus.available === false
            ? h('div', { className: 'gp-coach-muted', style: { marginTop: 9 } },
                role === 'coach'
                  ? '当前 Harness 未配置可用模型，教练暂不可用'
                  : '当前 Harness 未配置可用模型，管家暂不可用')
            : h('div', { className: 'gp-coach-actions' },
                h('button', { className: 'gp-btn primary', onClick: () => run(role, false) },
                  role === 'coach' ? '让教练分析今天' : '让管家看看今天'),
                h('span', { className: 'gp-coach-muted' },
                  '只在点击时调用模型，约消耗一次对话额度')))
      }

      return h('div', {
        className: cardCls,
        'data-gp-role': role,
        'data-gp-coach-role': role,
        'data-gp-verdict': verdict || '',
      },
        showTabs
          ? h('div', { className: 'gp-coach-hd' },
              h(CoachTabs, { roles: enabledRoles, tab: role, setTab }))
          : h('div', { className: 'gp-coach-hd' },
              h('b', { className: 'gp-coach-role' }, COACH_ROLE_LABEL[role] || role)),
        body,
        h('div', { className: 'gp-coach-disclaim' }, 'AI 建议仅供参考，不构成医疗建议'))
    }

    /* ---------------------------------------------------------------- *
     * AI 营养建议：点击才调模型，结果留在组件 state，刷新（version）清空
     * ---------------------------------------------------------------- */
    const NUTRITION_CODE_ZH = {
      RATE_LIMIT: '模型限流，稍后再试',
      ACCOUNT_QUOTA: '账号额度不足',
      ACCOUNT_SIGN_IN_REQUIRED: 'Harness 账号需要重新登录',
      ACCOUNT_TOKEN_INVALID: 'Harness 账号令牌失效，请重新登录',
      LLM_UNAVAILABLE: '当前 Harness 未配置可用模型',
      TIMEOUT: '生成超时，请重试',
      TRANSPORT: '网络异常，连不上模型服务',
      EMPTY_RESPONSE: '模型没有返回正文',
      INVALID_REQUEST: '请求参数不合法',
      NETWORK: '连不上面板后端',
    }

    function intakeText(nutrition) {
      if (!nutrition || typeof nutrition !== 'object') return null
      const parts = []
      const cal = numOf(nutrition.calories)
      if (cal !== null) parts.push(`${fmt(cal)} kcal`)
      const protein = numOf(nutrition.protein_g, nutrition.protein)
      if (protein !== null) parts.push(`蛋白 ${fmt(protein)} g`)
      const carbs = numOf(nutrition.carbs_g, nutrition.carbs)
      if (carbs !== null) parts.push(`碳水 ${fmt(carbs)} g`)
      return parts.length ? `今日已记录 ${parts.join(' · ')}` : null
    }

    function NutritionCard({ nutrition, version, date, reviewing = false, showToast, ...rest }) {
      const status = useJson('nutrition/advice/status', true, version)
      const [advice, setAdvice] = React.useState({ phase: 'idle', result: null, error: null })
      const [copied, setCopied] = React.useState(false)
      const copyTimer = React.useRef(null)
      const alive = React.useRef(true)
      const seq = React.useRef(0)

      React.useEffect(() => () => {
        alive.current = false
        if (copyTimer.current) clearTimeout(copyTimer.current)
      }, [])

      /* 刷新数据（version bump）或切换回看日期时清空缓存结果，丢弃仍在飞行中的旧请求 */
      React.useEffect(() => {
        seq.current += 1
        setAdvice({ phase: 'idle', result: null, error: null })
        setCopied(false)
      }, [version, date])

      const run = React.useCallback((force) => {
        const mine = ++seq.current
        setAdvice({ phase: 'loading', result: null, error: null })
        setCopied(false)
        const payload = { force: !!force }
        if (date) payload.date = date
        fetch(`${API}/nutrition/advice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((r) => r.json())
          .then((data) => {
            if (!alive.current || mine !== seq.current) return
            if (data?.status === 'ok' && data.text) {
              setAdvice({ phase: 'ok', result: data, error: null })
              return
            }
            setAdvice({
              phase: 'error',
              result: null,
              error: {
                code: data?.code || 'INTERNAL',
                message: data?.message || '',
                retryAfterMs: data?.retryAfterMs,
              },
            })
          })
          .catch((err) => {
            if (!alive.current || mine !== seq.current) return
            setAdvice({
              phase: 'error',
              result: null,
              error: { code: 'NETWORK', message: String(err?.message ?? err) },
            })
          })
      }, [date])

      const copy = React.useCallback(() => {
        const text = advice.result?.text
        if (!text) return
        copyText(text).then((ok) => {
          if (!ok || !alive.current) return
          setCopied(true)
          if (copyTimer.current) clearTimeout(copyTimer.current)
          copyTimer.current = setTimeout(() => setCopied(false), 1800)
          showToast?.('营养建议已复制', 'ok')
        })
      }, [advice, showToast])

      const intake = intakeText(nutrition)
      const model = advice.result?.model || status.data?.model || null
      /* 回看时页脚标注建议覆盖的那一天 */
      const adviceDay = dayPart(advice.result?.date) || (reviewing ? dayPart(date) : null)

      let body
      if (advice.phase === 'loading') {
        body = h('div', { 'data-gp-nutri-state': 'loading' },
          h('div', { className: 'gp-nutri-skel' },
            h('div', { className: 'gp-skel', style: { height: 12, width: '56%' } }),
            h('div', { className: 'gp-skel', style: { height: 10, width: '94%' } }),
            h('div', { className: 'gp-skel', style: { height: 10, width: '88%' } }),
            h('div', { className: 'gp-skel', style: { height: 10, width: '76%' } }),
            h('div', { className: 'gp-skel', style: { height: 10, width: '84%' } })),
          h('div', { className: 'gp-nutri-muted' }, '营养师正在计算…（约 5–10 秒）'))
      } else if (advice.phase === 'error') {
        const err = advice.error || {}
        const secs = err.retryAfterMs ? Math.max(1, Math.ceil(err.retryAfterMs / 1000)) : null
        const friendly = err.code === 'RATE_LIMIT'
          ? `模型限流，稍后再试${secs ? `（${secs} 秒后）` : ''}`
          : NUTRITION_CODE_ZH[err.code] || err.message || '营养建议暂时不可用'
        const known = NUTRITION_CODE_ZH[err.code]
        const rawText = err.message && err.message !== friendly &&
          (known ? err.message.length > friendly.length + 6 : true)
          ? err.message
          : null
        body = h('div', { 'data-gp-nutri-state': 'error' },
          h('div', { className: 'gp-coach-err' },
            h('b', null, friendly),
            rawText ? h('span', { className: 'gp-coach-muted' }, rawText) : null),
          h('div', { className: 'gp-nutri-actions' },
            h('button', { className: 'gp-btn', type: 'button', onClick: () => run(true) }, '重试')))
      } else if (advice.phase === 'ok' && advice.result?.text) {
        body = h('div', { 'data-gp-nutri-state': 'ok' },
          intake ? h('div', { className: 'gp-nutri-intake' }, intake) : null,
          h('div', { className: 'gp-coach-body' }, ...coachLines(advice.result.text)),
          h('div', {
            className: 'gp-nutri-foot',
            'data-gp-advice-date': adviceDay || '',
          },
            h('span', null, `模型 ${model || '—'} · 生成于 ${coachStamp(advice.result)}`),
            adviceDay && reviewing
              ? h('span', { className: 'gp-advice-day', 'data-gp-advice-based': '1' },
                  `基于 ${shortDay(adviceDay)}`)
              : null,
            h('span', { className: 'sp' },
              h('button', {
                className: 'gp-btn', type: 'button', 'data-gp-nutri-regen': '1',
                onClick: () => run(true),
              }, '重新生成'),
              h('button', {
                className: 'gp-btn', type: 'button', 'data-gp-nutri-copy': '1', onClick: copy,
              }, copied ? '已复制' : '复制'))))
      } else {
        const unavailable = status.data?.available === false
        body = h('div', { 'data-gp-nutri-state': 'idle' },
          h('div', { className: 'gp-nutri-pitch' }, '根据今天的训练与体重，让 AI 给出热量/蛋白/碳水建议'),
          intake ? h('div', { className: 'gp-nutri-intake' }, intake) : null,
          status.loading
            ? h('div', { className: 'gp-nutri-muted' }, '正在检查模型…')
            : unavailable
              ? h('div', { className: 'gp-nutri-muted' }, '当前 Harness 未配置可用模型')
              : h('div', { className: 'gp-nutri-actions' },
                  h('button', {
                    className: 'gp-btn primary',
                    type: 'button',
                    'data-gp-nutri-run': '1',
                    onClick: () => run(false),
                  }, '让 AI 给饮食建议'),
                  h('span', { className: 'gp-nutri-muted', style: { marginTop: 0 } },
                    '只在点击时调用模型，约消耗一次对话额度')))
      }

      return h('div', { className: 'gp-card gp-nutri gp-span', ...rest },
        h('h3', null, 'AI 营养建议'),
        body)
    }

    /* ---------------------------------------------------------------- *
     * 活动平铺卡片 + 月度分布
     * ---------------------------------------------------------------- */
    const OUTDOOR_RE = /bik|cycl|bike|run|hik|walk|swim|row|kayak|ski|snow|golf|骑|跑|走|徒步|泳|划/i

    /** 只有可能带 GPS 的户外活动才去拉轨迹（室内/力量/距离为 0 直接跳过） */
    function gpsCandidate(a) {
      if (!a || typeof a !== 'object') return false
      if (a.has_gps === true || a.hasGps === true || a.has_track === true || a.track === true) return true
      if (a.has_gps === false || a.hasGps === false) return false
      const type = String(firstOf(a.type, a.activity_type, '') ?? '')
      // 室内 / 力量 / 瑜伽等不可能有 GPS，直接跳过（不浪费一次轨迹请求）
      if (/indoor|virtual|treadmill|strength|weight|yoga|pilates|meditation/i.test(type)) return false
      const distance = numOf(a.distance_meters, a.distanceMeters) || 0
      return distance > 0 && OUTDOOR_RE.test(type)
    }

    const activityDay = (a) => dayPart(firstOf(a?.start_time, a?.startTimeLocal, a?.start_time_local,
      a?.startTimeGmt, a?.start_time_gmt))
    const activityType = (a) => String(firstOf(a?.type, a?.activity_type, a?.sport, '') ?? '')

    /** 近 30 天、最多 12 条；返回值按时间倒序 */
    function recentActivityTiles(data, today) {
      const list = Array.isArray(data?.activities) ? data.activities : []
      const todayDay = dayPart(today) || isoDay(new Date())
      const cutoff = shiftDay(todayDay, -30)
      return list
        .filter((a) => a && activityDay(a))
        .filter((a) => {
          const day = activityDay(a)
          return day >= cutoff && day <= todayDay
        })
        .sort((a, b) => String(activityDay(b)).localeCompare(String(activityDay(a))))
        .slice(0, 12)
    }

    function ActivityTile({ activity, track, onOpen }) {
      const id = activity.id
      const day = activityDay(activity)
      const time = timePart(firstOf(activity.start_time, activity.startTimeLocal, activity.start_time_local))
      const type = activityType(activity)
      const icon = sportIconKey(type)
      const distanceM = numOf(activity.distance_meters, activity.distanceMeters)
      const calories = numOf(activity.calories)
      const avgHr = numOf(activity.avg_hr_bpm, activity.averageHR)

      let media
      if (track?.status === 'loading') {
        media = h('div', { className: 'gp-tile-thumb sk', 'data-gp-tile-track': 'loading' })
      } else if (track?.status === 'ok' && track.points) {
        media = h('div', { className: 'gp-tile-thumb', 'data-gp-tile-track': 'ok' },
          h('svg', {
            viewBox: '0 0 120 64', role: 'img', 'aria-label': '活动轨迹缩略图',
          },
            h('polyline', {
              points: track.points,
              fill: 'none',
              stroke: 'var(--gp-green)',
              strokeWidth: 1.6,
              strokeLinejoin: 'round',
              strokeLinecap: 'round',
            })))
      } else {
        media = h('div', { className: 'gp-tile-fb', 'data-gp-tile-track': track?.status || 'none' },
          h('div', { className: 'cal' }, fmt(calories), h('small', null, calories !== null ? 'kcal' : '')),
          h('div', { className: 'hr' }, avgHr !== null ? `${fmt(avgHr)} bpm` : '心率 —'),
          h('div', { className: 'nt' }, '无轨迹'))
      }

      return h('div', {
        className: 'gp-tile',
        role: 'button',
        tabIndex: 0,
        title: activity.name || '活动',
        'data-gp-tile': String(id),
        'data-sport': type,
        'data-icon': icon,
        onClick: () => onOpen?.(id),
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen?.(id)
          }
        },
      },
        h('div', { className: 'gp-tile-hd' },
          h('span', { className: 'gp-tile-ic' }, h(SportIcon, { type })),
          h('span', null, shortDay(day)),
          time ? h('span', { style: { color: 'var(--gp-t3)' } }, time) : null),
        h('div', { className: 'gp-tile-name' }, activity.name || `活动 ${id}`),
        media,
        h('div', { className: 'gp-tile-ft' },
          h('span', null, distanceM !== null && distanceM > 0
            ? `${fmt(distanceM / 1000, 1)} km`
            : '—'),
          h('span', { 'aria-hidden': true }, '·'),
          h('span', null, clock(activity.duration_seconds)),
          h('span', { className: 'ty' }, SPORT_ZH[type] || type || '运动')))
    }

    function ActivityTilesCard({ tiles, total, loading, advanced, tracks, onOpen, ...rest }) {
      let body
      if (loading && !tiles.length) {
        body = h('div', { className: 'gp-tiles' },
          Array.from({ length: 6 }, (_, i) => h('div', { key: i, className: 'gp-tile' },
            h('div', { className: 'gp-skel', style: { height: 14, width: '62%' } }),
            h('div', { className: 'gp-skel', style: { height: 64, marginTop: 5 } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '80%', marginTop: 4 } }))))
      } else if (!tiles.length) {
        body = h('div', { className: 'gp-empty', style: { margin: '4px 2px' } },
          h('b', null, '近 30 天没有活动记录'))
      } else {
        body = h('div', { className: 'gp-tiles' }, tiles.map((a) => h(ActivityTile, {
          key: a.id,
          activity: a,
          track: advanced && gpsCandidate(a) ? tracks[String(a.id)] : null,
          onOpen,
        })))
      }
      return h('div', { className: 'gp-card gp-tiles-wrap', 'data-gp-tiles': '1', ...rest },
        body,
        h('div', { className: 'gp-tiles-foot' },
          h('span', null, `近 30 天 · ${tiles.length} 场`),
          total > tiles.length
            ? h('span', { className: 'sp' },
                h('a', {
                  className: 'gp-btn',
                  href: 'https://connect.garmin.com/modern/activities',
                  target: '_blank',
                  rel: 'noreferrer',
                  'data-gp-act-all': '1',
                }, '查看全部'))
            : null))
    }

    function heatBucket(load, max) {
      if (!load || !max || load <= 0) return 0
      const ratio = load / Math.max(1, max)
      if (ratio > 0.8) return 5
      if (ratio > 0.55) return 4
      if (ratio > 0.3) return 3
      if (ratio > 0.1) return 2
      return 1
    }

    const HEAT_COLORS = [
      null,
      'color-mix(in srgb, var(--gp-green) 20%, transparent)',
      'color-mix(in srgb, var(--gp-green) 46%, transparent)',
      'color-mix(in srgb, var(--gp-amber) 58%, transparent)',
      'color-mix(in srgb, var(--gp-amber) 78%, var(--gp-red))',
      'var(--gp-red)',
    ]

    function MonthHeatCard({ calendar, loading, error, monthKey, note = null, ...rest }) {
      const days = Array.isArray(calendar?.days) ? calendar.days : []
      const byDay = {}
      for (const row of days) {
        const key = dayPart(row?.date)
        if (key) byDay[key] = row
      }
      const grid = monthGrid(monthKey)
      const maxLoad = numOf(calendar?.maxDayLoad)
        ?? Math.max(0, ...days.map((row) => numOf(row?.load) ?? 0))
      const counts = days.reduce((sum, row) => sum + (numOf(row?.count) ?? 0), 0)
      const totals = calendar?.totals && typeof calendar.totals === 'object'
        ? calendar.totals
        : { count: counts }
      const byType = Array.isArray(calendar?.byType) ? calendar.byType : []

      let body
      if (loading && !calendar) {
        body = h('div', { className: 'gp-heat-grid' },
          Array.from({ length: 14 }, (_, i) => h('div', {
            key: i, className: 'gp-heat-cell', style: { opacity: 0.4 },
          })))
      } else if (error) {
        body = h('div', { className: 'gp-heat-empty' }, '本月分布暂不可用')
      } else if (!counts) {
        body = h('div', { className: 'gp-heat-empty' }, '本月还没有活动记录')
      } else {
        const cells = []
        for (let i = 0; i < grid.firstDow; i++) {
          cells.push(h('div', { key: `e${i}`, className: 'gp-heat-cell empty' }))
        }
        for (let d = 1; d <= grid.days; d++) {
          const day = `${monthKey}-${pad2(d)}`
          const row = byDay[day]
          const count = numOf(row?.count) ?? 0
          const load = numOf(row?.load) ?? 0
          const bucket = heatBucket(load, maxLoad)
          const title = count > 0
            ? `${shortDay(day)} · ${fmt(count)} 次 · ${fmt(numOf(row?.distanceKm) ?? 0, 1)} km · ${fmt(numOf(row?.durationMin) ?? 0)} 分钟`
            : `${shortDay(day)} · 无运动`
          cells.push(h('div', {
            key: day,
            className: `gp-heat-cell${bucket ? ` b${bucket}` : ''}`,
            title,
            'data-gp-heat-day': day,
            'data-gp-heat-bucket': String(bucket),
          }, String(d)))
        }
        body = h(React.Fragment, null,
          h('div', { className: 'gp-heat-week' },
            ['一', '二', '三', '四', '五', '六', '日'].map((wd) =>
              h('div', { key: wd, className: 'gp-heat-wd' }, wd))),
          h('div', { className: 'gp-heat-grid' }, ...cells),
          h('div', { className: 'gp-heat-legend' },
            h('span', null, '少'),
            HEAT_COLORS.slice(1).map((color, i) => h('i', {
              key: i, style: { background: color, width: 10, height: 10 },
            })),
            h('span', null, '多')),
          h('div', { className: 'gp-heat-tot' },
            `${fmt(numOf(totals.count) ?? counts)} 次 · ${fmt(numOf(totals.distanceKm) ?? 0, 1)} km · ${fmt(numOf(totals.durationMin) ?? 0)} 分钟`),
          byType.length
            ? h('div', { className: 'gp-heat-types' }, byType.map((row, i) => h('span', {
                key: `${row?.type ?? 'x'}-${i}`,
                className: 'gp-heat-chip',
              }, `${SPORT_ZH[row?.type] || row?.type || '其他'} ${fmt(numOf(row?.count) ?? 0)} · ${fmt(numOf(row?.distanceKm) ?? 0)} km`)))
            : null)
      }

      return h('div', { className: 'gp-card gp-heat', 'data-gp-heat': '1', ...rest },
        h('div', { className: 'gp-heat-hd' },
          h('b', null, '本月运动分布'),
          h('span', { className: 'sp' }, monthLabel(monthKey)),
          note ? h('span', { className: 'gp-heat-note' }, note) : null),
        body)
    }

    /* ---------------------------------------------------------------- *
     * B 类：训练计划（本周课表 / Garmin Coach / 目标）
     * ---------------------------------------------------------------- */
    function PlanWeekCard({ data, loading, showToast = null, ...rest }) {
      const today = isoDay(new Date())
      const week = data?.week || null
      const workouts = Array.isArray(data?.workouts) ? data.workouts : []
      const links = planLinks(data)
      const coachRows = Array.isArray(data?.coach?.workouts) ? data.coach.workouts : []
      const start = planWeekStart(week)
      const end = firstOf(dayPart(week?.end), start ? shiftDay(start, 6) : null)
      const days = start
        ? Array.from({ length: 7 }, (_, i) => {
            const date = shiftDay(start, i)
            const found = planWorkoutAt(workouts, date)
            return {
              date,
              weekday: WEEKDAYS_ZH[i],
              workout: found ? found.workout : null,
              count: found ? found.count : 0,
            }
          })
        : []
      const [pop, setPop] = React.useState(null)
      const closeDetail = React.useCallback(() => setPop(null), [])

      const copyDetail = (day, message) => {
        const workout = day?.workout
        if (!workout) return
        copyText(planDetailText(day, workout, links, planSourceOf(workout, coachRows)))
          .then((ok) => {
            showToast?.(ok ? message : '复制失败：请手动复制', ok ? 'ok' : 'err')
          })
      }

      const copyWeek = () => {
        copyText(planWeekText(days)).then((ok) => {
          showToast?.(ok ? '已复制本周课表' : '复制失败：请手动复制', ok ? 'ok' : 'err')
        })
      }
      const copyWeekPrompt = () => {
        copyText(PLAN_AI_WEEK_PROMPT).then((ok) => {
          showToast?.(ok ? '已复制一周安排提示，去「AI 教练」提问' : '复制失败：请手动复制',
            ok ? 'ok' : 'err')
        })
      }

      const openDetail = (day, el) => {
        if (!day?.workout) return
        const width = 272
        const height = 236
        const rect = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null
        let left = 16
        let top = 120
        if (rect) {
          left = rect.left + rect.width / 2 - width / 2
          top = rect.bottom + 6
          if (top + height > window.innerHeight - 8) {
            top = Math.max(8, rect.top - height - 6)
          }
        }
        left = Math.max(8, Math.min(left, window.innerWidth - width - 8))
        setPop({ date: day.date, left, top })
      }

      const popDay = pop ? days.find((day) => day.date === pop.date) : null
      const popWorkout = popDay ? popDay.workout : null
      const emptyWeek = !!data && !loading && days.length === 7
        && days.every((day) => !day.workout)

      let body
      if (loading && !data) {
        body = h(Skel, { h: 110 })
      } else if (!data) {
        body = h('div', { className: 'gp-deep-muted' }, '课表加载失败，稍后重试')
      } else {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-plan-week' }, days.map((day) => {
            const workout = day.workout
            const isToday = day.date === today
            const cls = [
              'gp-plan-day',
              isToday ? 'is-today' : '',
              workout ? '' : 'is-rest',
              workout?.completed ? 'is-done' : '',
            ].filter(Boolean).join(' ')
            return h('div', {
              key: day.date,
              className: cls,
              role: workout ? 'button' : undefined,
              tabIndex: workout ? 0 : undefined,
              title: workout
                ? `${planWorkoutName(workout)} · ${planDurationText(workout.durationMin) || '时长未标注'} · 左键详情 · 右键复制`
                : '休息',
              'data-gp-plan-day': day.date,
              'data-gp-plan-today': isToday ? '1' : undefined,
              'data-gp-plan-rest': workout ? undefined : '1',
              'data-gp-plan-done': workout?.completed ? '1' : undefined,
              'data-gp-plan-workout-id': workout?.workoutId != null
                ? String(workout.workoutId)
                : undefined,
              onClick: workout ? (e) => openDetail(day, e.currentTarget) : undefined,
              onContextMenu: workout
                ? (e) => {
                    e.preventDefault()
                    copyDetail(day, `已复制：${planWorkoutName(workout)}`)
                  }
                : undefined,
              onKeyDown: workout
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openDetail(day, e.currentTarget)
                    }
                  }
                : undefined,
            },
              workout
                ? h('button', {
                    type: 'button',
                    className: 'gp-plan-copy',
                    'aria-label': '复制训练详情',
                    title: '复制训练详情',
                    'data-gp-plan-copy-detail': day.date,
                    onClick: (e) => {
                      e.stopPropagation()
                      closeDetail()
                      copyDetail(day, `已复制：${planWorkoutName(workout)}`)
                    },
                  }, '⧉')
                : null,
              h('div', { className: 'gp-plan-wd' },
                day.weekday,
                isToday ? h('span', { style: { color: 'var(--gp-blue)' } }, '今天') : null),
              h('div', { className: 'gp-plan-date' }, shortDay(day.date)),
              workout
                ? h('div', { className: 'gp-plan-ic' }, h(SportIcon, { type: workout.type, size: 14 }))
                : null,
              workout
                ? h('div', { className: 'gp-plan-name' }, planWorkoutName(workout))
                : h('div', { className: 'gp-plan-rest' }, '休息'),
              workout
                ? h('div', { className: 'gp-plan-meta' },
                    planDurationText(workout.durationMin) || '—',
                    day.count > 1 ? ` · +${day.count - 1}` : '',
                    workout.completed ? h('span', { className: 'gp-plan-check' }, '✓') : null)
                : null)
          })),
          emptyWeek
            ? h('div', { className: 'gp-plan-empty', 'data-gp-plan-empty-week': '1' },
                h('div', { className: 'gp-plan-empty-t' }, '本周没有训练安排'),
                h('div', { className: 'gp-plan-empty-a' },
                  h('a', {
                    className: 'gp-btn',
                    href: links.calendar,
                    target: '_blank',
                    rel: 'noreferrer',
                    'data-gp-plan-empty-calendar': '1',
                  }, '在 Garmin 安排训练'),
                  h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    'data-gp-plan-empty-ai': '1',
                    onClick: copyWeekPrompt,
                  }, '让 AI 帮我安排一周')))
            : null,
          h('div', { className: 'gp-plan-foot' },
            h('span', null,
              `${start ? `${shortDay(start)} – ${shortDay(end)} · ` : ''}只读`),
            h('span', { className: 'sp' },
              h('a', {
                className: 'gp-plan-hdlink',
                href: links.calendar,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-edit-link': '1',
              }, '编辑请到 Garmin Connect'),
              h('a', {
                className: 'gp-plan-hdlink',
                href: links.workouts,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-library': '1',
              }, '课库 ↗'))))
      }

      return h('div', {
        className: 'gp-card gp-span gp-plan-week-card',
        'data-gp-plan-week': '1',
        ...rest,
      },
        h('h3', { className: 'gp-plan-hd' },
          '本周课表',
          h('span', { className: 'sp' },
            h('a', {
              className: 'gp-plan-hdlink',
              href: links.calendar,
              target: '_blank',
              rel: 'noreferrer',
              title: '在 Garmin Connect 打开训练日历',
              'data-gp-plan-calendar': '1',
            }, '在 Garmin 打开'),
            h('button', {
              type: 'button',
              className: 'gp-plan-hdlink',
              title: '复制本周 7 天课表',
              'data-gp-plan-copy-week': '1',
              onClick: copyWeek,
            }, '复制整周课表'))),
        body,
        pop && popWorkout
          ? h(PlanDetailPopover, {
              key: `pop-${pop.date}`,
              day: popDay,
              workout: popWorkout,
              source: planSourceOf(popWorkout, coachRows),
              links,
              pos: { left: pop.left, top: pop.top },
              showToast,
              onClose: closeDetail,
            })
          : null)
    }

    function PlanCoachCard({ data, loading, ...rest }) {
      const coach = data?.coach && typeof data.coach === 'object' ? data.coach : null
      const workouts = Array.isArray(coach?.workouts) ? coach.workouts.slice() : []
      const planName = firstOf(coach?.planName, coach?.name)
      const hasCoach = !!(coach && (planName || workouts.length))
      const links = planLinks(data)
      const totalMin = workouts.reduce((sum, row) => sum + (numOf(row?.durationMin) ?? 0), 0)
      const rows = workouts
        .slice()
        .sort((a, b) => String(firstOf(a?.date, '')).localeCompare(String(firstOf(b?.date, ''))))
        .slice(0, 3)

      let body
      if (loading && !data) {
        body = h(Skel, { h: 70 })
      } else if (!hasCoach) {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-plan-empty', 'data-gp-plan-coach-empty': '1' },
            h('div', { className: 'gp-plan-empty-t' }, '未启用 Garmin Coach 计划'),
            h('div', { className: 'gp-plan-empty-a' },
              h('a', {
                className: 'gp-btn',
                href: links.coach,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-coach-open': '1',
              }, '去开启'))),
          h('div', { className: 'gp-plan-ro' },
            h('span', null, '只读 · 编辑请到 Garmin Connect'),
            h('span', { className: 'sp' },
              h('a', {
                href: links.coach,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-coach-manage': '1',
              }, 'Garmin Coach ↗'))))
      } else {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-plan-coach-name' }, String(planName || 'Garmin Coach 计划')),
          h('div', { className: 'gp-plan-coach-sum' },
            `本周 ${workouts.length} 节`,
            totalMin > 0 ? ` · 共 ${planDurationText(totalMin)}` : ''),
          rows.length
            ? h('div', { style: { marginTop: 7 } }, rows.map((row, i) => h('div', {
                key: `${firstOf(row?.id, i)}-${i}`,
                className: 'gp-plan-coach-row',
              },
                h('span', { className: 'd' }, shortDay(firstOf(row?.date))),
                h('span', { className: 'n' }, planWorkoutName(row)),
                h('span', { className: 't' }, planDurationText(row?.durationMin) || ''))))
            : null,
          h('div', { className: 'gp-plan-ro' },
            h('span', null, '只读 · 编辑请到 Garmin Connect'),
            h('span', { className: 'sp' },
              h('a', {
                href: links.coach,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-coach-manage': '1',
              }, '管理计划 ↗'))))
      }

      return h('div', {
        className: 'gp-card',
        'data-gp-plan-coach': '1',
        ...rest,
      },
        h('h3', null, 'Garmin Coach'),
        body)
    }

    function PlanGoalsCard({ data, loading, ...rest }) {
      const goals = (Array.isArray(data?.goals) ? data.goals : [])
        .filter((row) => row && typeof row === 'object')
      const links = planLinks(data)
      let body
      if (loading && !data) {
        body = h(Skel, { h: 70 })
      } else if (!goals.length) {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-plan-empty', 'data-gp-plan-goals-empty': '1' },
            h('div', { className: 'gp-plan-empty-t' }, '没有进行中的目标'),
            h('div', { className: 'gp-plan-empty-a' },
              h('a', {
                className: 'gp-btn',
                href: links.goals,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-goals-open': '1',
              }, '去设置目标'))),
          h('div', { className: 'gp-plan-ro' },
            h('span', null, '只读 · 编辑请到 Garmin Connect'),
            h('span', { className: 'sp' },
              h('a', {
                href: links.goals,
                target: '_blank',
                rel: 'noreferrer',
                'data-gp-plan-goals-manage': '1',
              }, '目标设置 ↗'))))
      } else {
        body = h(React.Fragment, null, goals.map((goal, i) => {
          const type = firstOf(goal?.type, goal?.kind, '')
          const target = numOf(goal?.target)
          const current = numOf(goal?.current) ?? 0
          const pct = target !== null && target > 0 ? clampPct((current / target) * 100) : 0
          const remain = target !== null ? Math.max(0, target - current) : null
          const unit = goalUnitText(type)
          const period = firstOf(goal?.period, goal?.range)
          const endDate = dayPart(goal?.endDate)
          return h('div', {
            key: `${type || 'goal'}-${i}`,
            className: 'gp-plan-goal',
            'data-gp-plan-goal': String(type || 'goal'),
            'data-gp-plan-goal-pct': String(pct),
          },
            h('div', { className: 'hd' },
              h('b', null, goalTypeText(type), period ? ` · ${period}` : ''),
              h('span', { className: 'sp' },
                `${goalNumber(current) ?? '—'} / ${target !== null ? goalNumber(target) : '—'}${unit ? ` ${unit}` : ''}`)),
            h('div', { className: 'bar' },
              h('i', {
                style: {
                  width: `${pct}%`,
                  background: pct >= 100 ? 'var(--gp-green)' : 'var(--gp-blue)',
                },
              })),
            h('div', { className: 'ft' },
              remain === null ? '目标值未标注'
                : remain <= 0 ? '已达成'
                  : `还差 ${goalNumber(remain)}${unit ? ` ${unit}` : ''}`,
              endDate ? ` · ${endDate} 截止` : ''))
        }),
        h('div', { className: 'gp-plan-ro' },
          h('span', null, '只读 · 编辑请到 Garmin Connect'),
          h('span', { className: 'sp' },
            h('a', {
              href: links.goals,
              target: '_blank',
              rel: 'noreferrer',
              'data-gp-plan-goals-manage': '1',
            }, '目标设置 ↗'))))
      }

      return h('div', {
        className: 'gp-card',
        'data-gp-plan-goals': '1',
        ...rest,
      },
        h('h3', null, '目标'),
        body)
    }

    /* ---------------------------------------------------------------- *
     * B 类：女性健康（周期 / 孕期）
     * ---------------------------------------------------------------- */
    function WomensCycleCard({ data, loading, ...rest }) {
      const cycle = data?.status === 'ok' && data.cycle && typeof data.cycle === 'object'
        ? data.cycle
        : null
      const phase = firstOf(cycle?.phase)
      const lastStart = dayPart(cycle?.lastStartDate)
      const nextStart = dayPart(cycle?.predictedNextStart)
      const length = numOf(cycle?.cycleLengthDays)

      let body
      if (loading && !data) {
        body = h(Skel, { h: 80 })
      } else if (!cycle) {
        body = h('div', { className: 'gp-wm-muted', 'data-gp-wm-empty': '1' }, '未记录')
      } else {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-wm-phase' }, phase ? String(phase) : '未记录'),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '上次开始'),
            h('b', null, lastStart || '未记录')),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '平均周期'),
            h('b', null, length !== null ? `${fmt(length)} 天` : '未记录')),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '当前阶段'),
            h('b', null, phase ? String(phase) : '未记录')),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '预测下次'),
            h('b', null, nextStart || '未记录')))
      }

      return h('div', {
        className: 'gp-card',
        'data-gp-womens-cycle': '1',
        ...rest,
      },
        h('h3', null, '周期'),
        body)
    }

    function WomensPregnancyCard({ data, loading, ...rest }) {
      const pregnancy = data?.status === 'ok' && data.pregnancy && typeof data.pregnancy === 'object'
        ? data.pregnancy
        : null
      const week = numOf(pregnancy?.week)
      const dueDate = dayPart(pregnancy?.dueDate)

      let body
      if (loading && !data) {
        body = h(Skel, { h: 70 })
      } else if (!pregnancy) {
        body = h('div', { className: 'gp-wm-muted', 'data-gp-wm-preg-empty': '1' }, '未记录')
      } else {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-wm-preg' },
            h('span', { className: 'big' }, week !== null ? fmt(week) : '—'),
            h('small', null, '周')),
          h('div', { className: 'gp-wm-row' },
            h('span', { className: 'lb' }, '预产期'),
            h('b', null, dueDate || '未记录')))
      }

      return h('div', {
        className: 'gp-card',
        'data-gp-womens-pregnancy': '1',
        ...rest,
      },
        h('h3', null, '孕期'),
        body)
    }

    /** 一个可拖拽的区块槽：编辑态套虚线框，左上 ⠿ 手柄、右上 × 隐藏 */
    function SectionSlot({
      id, label, node, editing, index, draggingId,
      onDragStart, onDragOver, onDrop, onDragEnd, onRemove,
    }) {
      const dragging = editing && draggingId === id
      return h('div', {
        className: `gp-slot${editing ? ' is-editing' : ''}${dragging ? ' is-dragging' : ''}`,
        'data-gp-slot': id,
        'data-gp-slot-index': index,
        draggable: editing ? true : undefined,
        onDragStart: editing ? (e) => onDragStart(e, id) : undefined,
        onDragOver: editing ? (e) => onDragOver(e, index) : undefined,
        onDrop: editing ? (e) => onDrop(e, index) : undefined,
        onDragEnd: editing ? onDragEnd : undefined,
      },
        editing
          ? h('div', { className: 'gp-slot-tools' },
              h('span', { className: 'gp-slot-handle', title: '拖动排序', 'aria-hidden': true }, '⠿'),
              h('span', { className: 'gp-slot-label', title: label }, label),
              h('button', {
                type: 'button',
                className: 'gp-slot-remove',
                title: `隐藏「${label}」`,
                'aria-label': `隐藏 ${label}`,
                'data-gp-remove': id,
                onClick: () => onRemove(id),
              }, '×'))
          : null,
        h('div', {
          className: 'gp-slot-body',
          /* 编辑态内容不可点：pointer-events 拦不住 dispatchEvent，捕获阶段再兜一层 */
          onClickCapture: editing ? lockSlotContent : undefined,
          onKeyDownCapture: editing ? lockSlotContent : undefined,
        }, node))
    }

    /**
     * 一个可拖拽的卡片槽：比区块槽更细的虚线框，左上 ⠿、右上 ×。
     * 卡片只能在所属板块内拖拽（sectionId 作为拖拽作用域）。
     */
    function CardSlot({
      sectionId, id, label, node, index, draggingId,
      onDragStart, onDragOver, onDrop, onDragEnd, onRemove,
    }) {
      const dragging = draggingId === id
      return h('div', {
        className: `gp-card-slot is-editing${dragging ? ' is-dragging' : ''}`,
        'data-gp-card-slot': `${sectionId}:${id}`,
        'data-gp-card-section': sectionId,
        'data-gp-card': id,
        'data-gp-card-index': index,
        draggable: true,
        onDragStart: (e) => onDragStart(e, sectionId, id),
        onDragOver: (e) => onDragOver(e, sectionId, index),
        onDrop: (e) => onDrop(e, sectionId, index),
        onDragEnd,
      },
        h('div', { className: 'gp-card-tools' },
          h('span', { className: 'gp-card-handle', title: '拖动排序', 'aria-hidden': true }, '⠿'),
          h('span', { className: 'gp-card-label', title: label }, label),
          h('button', {
            type: 'button',
            className: 'gp-card-remove',
            title: `隐藏「${label}」`,
            'aria-label': `隐藏 ${label}`,
            'data-gp-card-remove': id,
            'data-gp-card-section': sectionId,
            onClick: () => onRemove(sectionId, id),
          }, '×')),
        h('div', {
          className: 'gp-card-slot-body',
          onClickCapture: lockSlotContent,
          onKeyDownCapture: lockSlotContent,
        }, node))
    }

    /** 卡片拖拽中的插入占位：与拖动源同高，顶边 3px 插入线 */
    function CardGhost({ height, onDragOver, onDrop }) {
      return h('div', {
        className: 'gp-card-ghost',
        'data-gp-card-ghost': '1',
        style: height ? { height: `${height}px` } : undefined,
        onDragOver,
        onDrop,
      },
        h('div', { className: 'gp-card-insert', 'aria-hidden': true }),
        h('span', { className: 'gp-card-ghost-text' }, '放到这里'))
    }

    /**
     * 一个板块的卡片区：非编辑态直接渲染卡片（无额外包装）；
     * 编辑态每张卡包 CardSlot，拖拽时插入等高占位，末尾渲染隐藏卡片的 ＋ 添加 chip。
     */
    function CardGrid({
      sectionId, className, cards, nodes, editing, drag,
      onDragStart, onDragOver, onDrop, onDragEnd, onRemove, onAdd,
    }) {
      const visible = cards.filter((card) => card.visible !== false)
      const hidden = cards.filter((card) => card.visible === false)
      const cap = sectionId === 'kpi' ? 5
        : sectionId === 'body' || sectionId === 'extras' || sectionId === 'advanced' ? 3
          : sectionId === 'load' ? 2 : 0
      /* 全隐藏时保持默认列数，让隐藏卡片 chip 也能成行排列 */
      const cls = cap && visible.length
        ? `${className} n${Math.min(visible.length, cap)}`
        : className
      const children = []
      visible.forEach((card, index) => {
        const ghost = editing && drag.id && drag.sectionId === sectionId && drag.at === index
        if (ghost) {
          children.push(h(CardGhost, {
            key: `cghost-${sectionId}-${index}`,
            height: drag.height,
            onDragOver: (e) => onDragOver(e, sectionId),
            onDrop: (e) => onDrop(e, sectionId, index),
          }))
        }
        const node = nodes[card.id] || h('div', { className: 'gp-empty' }, '这张卡片暂不可用')
        if (editing) {
          children.push(h(CardSlot, {
            key: card.id,
            sectionId,
            id: card.id,
            label: cardLabel(sectionId, card.id),
            node,
            index,
            draggingId: drag.sectionId === sectionId ? drag.id : null,
            onDragStart,
            onDragOver,
            onDrop,
            onDragEnd,
            onRemove,
          }))
        } else {
          children.push(React.cloneElement(node, {
            key: card.id,
            'data-gp-card-id': card.id,
            'data-gp-card-section': sectionId,
          }))
        }
      })
      if (editing && drag.id && drag.sectionId === sectionId && drag.at === visible.length) {
        children.push(h(CardGhost, {
          key: `cghost-${sectionId}-end`,
          height: drag.height,
          onDragOver: (e) => onDragOver(e, sectionId),
          onDrop: (e) => onDrop(e, sectionId, visible.length),
        }))
      }
      if (!visible.length) {
        children.push(h('div', { key: 'cards-empty', className: 'gp-cards-empty' }, '本板块的卡片都已隐藏'))
      }
      if (editing && hidden.length) {
        children.push(h('div', { key: 'card-addrow', className: 'gp-card-addrow' },
          hidden.map((card) => {
            const label = cardLabel(sectionId, card.id)
            return h('button', {
              key: card.id,
              type: 'button',
              className: 'gp-card-add',
              draggable: false,
              'data-gp-card-add': card.id,
              'data-gp-card-section': sectionId,
              title: `添加 ${label}`,
              onDragStart: (e) => e.stopPropagation(),
              onClick: () => onAdd(sectionId, card.id),
            },
              h('span', { className: 'plus', 'aria-hidden': true }, '＋'),
              h('span', { className: 'lb' }, label))
          })))
      }
      return h('div', { className: cls, 'data-gp-cards': sectionId }, ...children)
    }

    /** 拖拽中的插入占位：与拖动源同高，顶边画 3px 插入线 */
    function SlotGhost({ height, onDragOver, onDrop }) {
      return h('div', {
        className: 'gp-slot-ghost',
        'data-gp-ghost': '1',
        style: height ? { height: `${height}px` } : undefined,
        onDragOver,
        onDrop,
      },
        h('div', { className: 'gp-slot-insert', 'aria-hidden': true }),
        h('span', { className: 'gp-slot-ghost-text' }, '放到这里'))
    }

    /** 编辑态底部：隐藏区块的虚线添加框，点击追加到可见顺序末尾 */
    function AddZone({ hidden, onAdd, onDragOver, onDrop }) {
      return h('div', { className: 'gp-addzone', 'data-gp-addzone': '1', onDragOver, onDrop },
        h('div', { className: 'gp-addzone-hd' },
          h('b', null, '添加区块'),
          h('span', { className: 'cnt' }, hidden.length ? `${hidden.length} 个隐藏` : '')),
        hidden.length
          ? h('div', { className: 'gp-addbox-row' }, hidden.map((item) =>
              h('button', {
                key: item.id,
                type: 'button',
                className: 'gp-addbox',
                'data-gp-add': item.id,
                title: `添加 ${item.label}`,
                onClick: () => onAdd(item.id),
              },
                h('span', { className: 'plus', 'aria-hidden': true }, '＋'),
                h('span', { className: 'lb' }, item.label))))
          : h('div', { className: 'gp-addzone-empty' }, '所有区块都已显示'))
    }

    /** 编辑态浮动工具条：重看引导 / 恢复默认 / 完成 */
    function EditBar({ onReset, onDone, onOnboard }) {
      return h('div', {
        className: 'gp-editbar',
        role: 'toolbar',
        'aria-label': '个性化编辑',
        'data-gp-editbar': '1',
      },
        h('span', { className: 'gp-editbar-hint' }, '拖动区块 / 卡片排序 · 点 × 隐藏 · Esc 退出'),
        h('span', { className: 'sp', 'aria-hidden': true }),
        h('button', {
          type: 'button', className: 'gp-btn', 'data-gp-onboard-open': 'editbar', onClick: onOnboard,
        }, '重看新手引导'),
        h('button', {
          type: 'button', className: 'gp-btn', 'data-gp-reset': '1', onClick: onReset,
        }, '恢复默认'),
        h('button', {
          type: 'button', className: 'gp-btn primary', 'data-gp-edit-done': '1', onClick: onDone,
        }, '✓ 完成'))
    }

