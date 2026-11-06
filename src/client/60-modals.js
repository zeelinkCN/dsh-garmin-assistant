    /* ---------------------------------------------------------------- *
     * 登录界面
     * ---------------------------------------------------------------- */
    /**
     * 邮箱 / 密码 / 区域 / MFA 表单本身。
     * LoginView（整页登录）和进阶解锁卡片共用同一套逻辑，只是外壳不同。
     */
    function Credentials({ compact = false, onSuccess }) {
      const [email, setEmail] = React.useState('')
      const [password, setPassword] = React.useState('')
      const [region, setRegion] = React.useState('intl')
      const [code, setCode] = React.useState('')
      const [phase, setPhase] = React.useState('form')
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [note, setNote] = React.useState(null)

      const apply = (r) => {
        setBusy(false)
        if (!r) { setError('登录请求失败'); return }
        if (r.state === 'mfa') {
          setPhase('mfa')
          setNote('Garmin 需要两步验证码，验证码已发送到你的邮箱/手机。')
          return
        }
        if (r.state === 'ok') {
          setNote('登录成功，正在重连 Garmin…')
          onSuccess?.()
          return
        }
        if (r.state === 'failed') setError(r.error || '登录失败')
        else setNote('正在连接 Garmin…')
      }

      const post = async (path, body) => {
        setBusy(true)
        setError(null)
        try {
          const res = await fetch(`${API}/${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          apply(await res.json())
        } catch (err) {
          setBusy(false)
          setError(String(err))
        }
      }

      const fields = phase === 'form'
        ? [
            h('label', { key: 'email', className: 'gp-field' },
              h('span', null, 'Garmin 邮箱'),
              h('input', {
                className: 'gp-input', type: 'email', value: email, autoComplete: 'username',
                placeholder: 'you@example.com',
                onChange: (e) => setEmail(e.target.value),
              })),
            h('label', { key: 'pass', className: 'gp-field' },
              h('span', null, '密码'),
              h('input', {
                className: 'gp-input', type: 'password', value: password, autoComplete: 'current-password',
                placeholder: '••••••••',
                onChange: (e) => setPassword(e.target.value),
                onKeyDown: (e) => { if (e.key === 'Enter' && !busy) post('login', { email, password, region }) },
              })),
            h('label', { key: 'region', className: 'gp-field' },
              h('span', null, '账号区域'),
              h('select', {
                className: 'gp-input', value: region,
                onChange: (e) => setRegion(e.target.value),
              },
                h('option', { value: 'intl' }, '国际版 (garmin.com)'),
                h('option', { value: 'cn' }, '中国版 (garmin.cn)'))),
            h('div', { key: 'act', className: 'gp-auth-actions' },
              h('button', {
                className: 'gp-btn primary', disabled: busy,
                onClick: () => post('login', { email, password, region }),
              }, busy ? '登录中…' : '登录'),
              compact
                ? null
                : h('span', { className: 'gp-mini' }, '开启两步验证的话，下一步会让你填验证码')),
          ]
        : [
            h('label', { key: 'code', className: 'gp-field' },
              h('span', null, '两步验证码'),
              h('input', {
                className: 'gp-input', value: code, inputMode: 'numeric', placeholder: '6 位数字',
                onChange: (e) => setCode(e.target.value),
                onKeyDown: (e) => { if (e.key === 'Enter' && !busy) post('login/mfa', { code }) },
              })),
            h('div', { key: 'act', className: 'gp-auth-actions' },
              h('button', {
                className: 'gp-btn primary', disabled: busy,
                onClick: () => post('login/mfa', { code }),
              }, busy ? '验证中…' : '提交验证码'),
              h('button', {
                className: 'gp-btn', disabled: busy,
                onClick: () => { setPhase('form'); setCode(''); setError(null); setNote(null) },
              }, '返回')),
          ]

      return h('form', {
        className: `gp-form${compact ? ' gp-form-compact' : ''}`,
        onSubmit: (e) => e.preventDefault(),
      },
        ...fields,
        note ? h('div', { className: 'gp-mini' }, note) : null,
        error ? h('div', { className: 'gp-err' }, error) : null)
    }

    function LoginView({ onAuthed }) {
      return h('div', { className: 'gp-auth gp-card' },
        h('div', { className: 'gp-auth-head' },
          h('div', { className: 'gp-auth-title' }, '登录 Garmin'),
          h('div', { className: 'gp-mini' },
            '面板需要你的 Garmin 账号授权。凭据只在本地换取令牌（存 ~/.garminconnect），不会上传或保存密码。')),
        h(Credentials, { onSuccess: onAuthed }),
        h('div', { className: 'gp-auth-foot' },
          '登录后可解锁训练负荷、训练准备度、装备与训练计划等进阶数据。'))
    }

    /* ---------------------------------------------------------------- *
     * 进阶解锁：setup/install → 轮询日志 → 账号登录（MFA）→ 刷新
     * 状态放在 Page 里，所有解锁卡片共用同一个 flow，避免重复安装/轮询
     * ---------------------------------------------------------------- */
    const UNLOCK_REASON = '训练负荷（CTL/ATL/ACWR）、训练准备度、VO₂max 趋势、比赛预测、装备、训练计划——这些 Garmin 官方 Personal API 不提供，需要 Garmin 账号密码登录。'
    const UNLOCK_POLL_MS = 1200
    const UNLOCK_MAX_POLLS = 150

    function useUnlockFlow(onUnlocked) {
      const [phase, setPhase] = React.useState('idle') // idle | installing | login | failed | ok
      const [lines, setLines] = React.useState([])
      const [error, setError] = React.useState(null)
      // 哪个卡片发起了流程：只有它展开进度/登录表单，其余卡片显示一行状态
      const [owner, setOwner] = React.useState(null)
      const timer = React.useRef(null)
      const alive = React.useRef(true)
      const polls = React.useRef(0)
      const doneRef = React.useRef(onUnlocked)
      doneRef.current = onUnlocked

      const stop = React.useCallback(() => {
        if (timer.current) { clearTimeout(timer.current); timer.current = null }
      }, [])

      React.useEffect(() => () => { alive.current = false; stop() }, [stop])

      const poll = React.useCallback(async () => {
        if (!alive.current) return
        polls.current += 1
        try {
          const data = await fetchJson('setup/install/log')
          if (!alive.current) return
          const nextLines = Array.isArray(data?.lines) ? data.lines : null
          if (nextLines) setLines(nextLines)
          if (data?.failed) {
            const marked = [...(nextLines || [])]
              .reverse()
              .find((line) => /^[✗×x]\s/.test(String(line).trim()))
            stop()
            setPhase('failed')
            setError(String(data.error || data.message || marked || '组件准备失败，请重试'))
            return
          }
          if (data?.done) {
            stop()
            setPhase('login')
            return
          }
          if (polls.current >= UNLOCK_MAX_POLLS) {
            stop()
            setPhase('failed')
            setError('等待组件准备超时，请重试')
            return
          }
          stop()
          timer.current = setTimeout(() => { void poll() }, UNLOCK_POLL_MS)
        } catch (err) {
          if (!alive.current) return
          stop()
          setPhase('failed')
          setError(String(err?.message ?? err))
        }
      }, [stop])

      const start = React.useCallback(async (ownerId = 'card') => {
        stop()
        polls.current = 0
        setOwner(ownerId)
        setPhase('installing')
        setLines([])
        setError(null)
        try {
          const data = await postJson('setup/install')
          if (!alive.current) return
          if (data && data.started === false) {
            setPhase('failed')
            setError(String(data.error || '无法开始准备组件'))
            return
          }
          void poll()
        } catch (err) {
          if (!alive.current) return
          setPhase('failed')
          setError(String(err?.message ?? err))
        }
      }, [poll, stop])

      const reset = React.useCallback(() => {
        stop()
        setPhase('idle')
        setOwner(null)
        setLines([])
        setError(null)
      }, [stop])

      const succeed = React.useCallback(() => {
        stop()
        setPhase('ok')
        doneRef.current?.()
        timer.current = setTimeout(() => {
          if (alive.current) { setPhase('idle'); setOwner(null); setLines([]); setError(null) }
        }, 3200)
      }, [stop])

      return { phase, lines, error, owner, start, reset, succeed }
    }

    /**
     * 一块「解锁进阶数据」卡片；安装中显示只读日志，完成后原地变成登录表单。
     * head=false + reason=null 时只保留流程本体，供新手引导第 3 步嵌进自己的卡片。
     */
    function UnlockCard({
      flow, id = 'card', compact = false, bare = false, className = '', hint = null,
      showHead = true, reason = UNLOCK_REASON, onStart = null, startLabel = '自动准备并登录',
    }) {
      if (!flow) return null
      const cls = ['gp-unlock']
      if (compact) cls.push('compact')
      if (bare) cls.push('bare')
      if (className) cls.push(className)
      const shell = cls.join(' ')
      const { phase } = flow
      const active = !flow.owner || flow.owner === id
      const begin = () => {
        onStart?.()
        flow.start(id)
      }

      if (phase === 'ok') {
        return h('div', { className: shell },
          hint ? h('div', { className: 'gp-unlock-muted' }, hint) : null,
          h('div', { className: 'gp-hintline' },
            h('span', { className: 'gp-dot' }),
            h('span', null, '已解锁进阶数据，正在刷新…')))
      }

      const head = showHead
        ? h('div', { className: 'gp-unlock-hd' },
            h('span', { className: 'gp-unlock-ic', 'aria-hidden': true }, '🔓'),
            h('b', null, '解锁进阶数据'),
            compact ? null : h('span', { className: 'gp-unlock-tag' }, '需要账号登录'))
        : null

      let body
      if (phase !== 'idle' && !active) {
        body = h(React.Fragment, null,
          reason ? h('div', { className: 'gp-unlock-copy' }, reason) : null,
          phase === 'failed'
            ? h('div', { className: 'gp-unlock-muted' }, '组件准备失败')
            : h('div', { className: 'gp-hintline' },
                h('span', { className: 'gp-spin', 'aria-hidden': true }),
                h('span', null, phase === 'login' ? '等待登录完成…' : '正在准备组件…')))
      } else if (phase === 'installing') {
        const tail = flow.lines.slice(-8)
        body = h(React.Fragment, null,
          h('div', { className: 'gp-hintline', role: 'status', 'aria-live': 'polite' },
            h('span', { className: 'gp-spin', 'aria-hidden': true }),
            h('span', null, '正在下载组件…')),
          h('div', {
            className: 'gp-log',
            role: 'log',
            'aria-live': 'polite',
            'aria-label': '组件准备日志',
            'data-gp-install-log': '1',
          },
            tail.length
              ? tail.map((line, i) => h('div', { key: i, className: 'gp-log-line' }, String(line)))
              : h('div', { className: 'gp-log-line' }, '等待日志…')),
          h('div', { className: 'gp-unlock-muted' },
            '准备完成后会在这里显示登录表单，全程不需要命令行。'))
      } else if (phase === 'failed') {
        const tail = flow.lines.slice(-4)
        body = h(React.Fragment, null,
          h('div', { className: 'gp-unlock-err' }, flow.error || '准备失败，请重试'),
          tail.length
            ? h('div', { className: 'gp-log' },
                tail.map((line, i) => h('div', { key: i, className: 'gp-log-line' }, String(line))))
            : null,
          h('div', { className: 'gp-unlock-actions' },
            h('button', {
              className: 'gp-btn primary',
              'data-gp-unlock-retry': id,
              onClick: begin,
            }, '重试'),
            h('button', { className: 'gp-btn', onClick: () => flow.reset() }, '取消')))
      } else if (phase === 'login') {
        body = h(React.Fragment, null,
          h('div', { className: 'gp-unlock-muted' }, '组件已就绪，用 Garmin 账号登录即可解锁。'),
          h(Credentials, { compact: true, onSuccess: flow.succeed }))
      } else {
        body = h(React.Fragment, null,
          hint ? h('div', { className: 'gp-unlock-muted' }, hint) : null,
          reason ? h('div', { className: 'gp-unlock-copy' }, reason) : null,
          h('div', { className: 'gp-unlock-actions' },
            h('button', {
              className: 'gp-btn primary',
              'data-gp-unlock-start': id,
              onClick: begin,
            }, startLabel),
            compact ? null : h('span', { className: 'gp-unlock-muted' }, '全程在面板内完成')))
      }

      return h('div', { className: shell }, head, body)
    }

    /* ---------------------------------------------------------------- *
     * 首次连接引导：获取只读 Key → 粘贴验证 → 可选解锁进阶数据
     * 整页首屏与「重看新手引导」浮层共用同一个组件，互不重置 Key / 模式
     * ---------------------------------------------------------------- */
    const ONBOARD_FLAG = 'garmin-panel-onboarded-v1'
    const API_TOKEN_URL = 'https://connect.garmin.com/app/settings/personalApiToken'
    const GARMIN_LOGIN_URL = 'https://connect.garmin.com'

    function markOnboarded() {
      try { localStorage.setItem(ONBOARD_FLAG, '1') } catch { /* 隐私模式：只影响记忆 */ }
    }
    function readOnboarded() {
      try { return localStorage.getItem(ONBOARD_FLAG) === '1' } catch { return false }
    }

    /** 第 1 步：去哪里拿 Key（含可展开的分步帮助） */
    function OnboardStep1({ open, onToggle }) {
      const helpId = 'gp-onb-help'
      const steps = [
        ['在打开的页面登录 Garmin 账号'],
        ['右上角头像 → 设置（Settings）→ 找到 Personal API'],
        [h('span', null,
          '点「创建」并选择有效期（', h('code', null, '30/90/180/365'), ' 天，建议 365）')],
        [h('span', null, h('b', null, 'Key 只显示一次'), '——先复制，再关闭页面')],
        ['回到这里粘贴'],
      ]
      return h('section', { className: 'gp-onb-step gp-onb-step1', 'data-gp-onb-step': '1' },
        h('div', { className: 'gp-onb-step-hd' },
          h('span', { className: 'gp-onb-n', 'aria-hidden': true }, '1'),
          h('h2', { className: 'gp-onb-step-title' }, '获取只读 Key'),
          h('span', { className: 'gp-onb-tag' }, '免费')),
        h('p', { className: 'gp-onb-copy' },
          'Garmin 有一个官方的只读接口（Personal API），可以生成一串 Key，用来读取你的运动和健康数据。'),
        h('div', { className: 'gp-onb-actions' },
          h('a', {
            className: 'gp-btn primary gp-onb-link',
            href: API_TOKEN_URL,
            target: '_blank',
            rel: 'noreferrer',
            'data-gp-api-link': '1',
          }, '打开 Garmin Personal API 页面', h('span', { 'aria-hidden': true }, '↗')),
          h('a', {
            className: 'gp-btn gp-onb-link sub',
            href: GARMIN_LOGIN_URL,
            target: '_blank',
            rel: 'noreferrer',
            'data-gp-login-link': '1',
          }, '还没登录 Garmin？')),
        h('button', {
          type: 'button',
          className: 'gp-onb-help-toggle',
          'aria-expanded': open,
          'aria-controls': helpId,
          'data-gp-help-toggle': '1',
          onClick: onToggle,
        },
          '不知道怎么找？看步骤',
          h('span', { className: `caret${open ? ' up' : ''}`, 'aria-hidden': true }, '▾')),
        open
          ? h('div', { className: 'gp-onb-help', id: helpId, 'data-gp-help-panel': '1' },
              h('ol', null,
                steps.map(([content], i) => h('li', { key: i },
                  h('span', { className: 'n', 'aria-hidden': true }, String(i + 1)),
                  h('span', null, content)))),
              h('div', { className: 'note' }, 'Key 只读、不能改数据；过期后重新生成即可。'))
          : null)
    }

    /** 第 2 步：粘贴并验证（真正的 form submit，错误/成功都有 aria-live） */
    function OnboardStep2({ value, onChange, onSubmit, busy, saved, error, inputRef }) {
      return h('section', { className: 'gp-onb-step gp-onb-step2', 'data-gp-onb-step': '2' },
        h('div', { className: 'gp-onb-step-hd' },
          h('span', { className: 'gp-onb-n', 'aria-hidden': true }, '2'),
          h('h2', { className: 'gp-onb-step-title' }, '粘贴并验证'),
          saved ? h('span', { className: 'gp-onb-tag on' }, '已验证') : null),
        h('p', { className: 'gp-onb-copy' }, '把刚才复制的 Key 粘贴到这里，验证通过后就会开始同步。'),
        h('form', {
          className: 'gp-onb-keyrow',
          onSubmit,
          'data-gp-key-form': '1',
          noValidate: true,
        },
          h('input', {
            ref: inputRef,
            className: 'gp-input',
            type: 'password',
            value,
            placeholder: '粘贴 Key',
            autoComplete: 'off',
            spellCheck: false,
            'aria-label': 'Garmin Personal API Key',
            'data-gp-key-input': '1',
            disabled: saved,
            onChange,
          }),
          h('button', {
            className: 'gp-btn primary',
            type: 'submit',
            disabled: busy || saved || !String(value).trim(),
            'data-gp-key-submit': '1',
          }, saved ? '已验证' : busy ? '验证中…' : '验证并保存')),
        error
          ? h('div', {
              className: 'gp-onb-alert',
              role: 'alert',
              'aria-live': 'assertive',
              'data-gp-key-error': '1',
            },
              h('span', null, error),
              h('a', { href: API_TOKEN_URL, target: '_blank', rel: 'noreferrer' }, '重新生成 Key ↗'))
          : null,
        saved
          ? h('div', {
              className: 'gp-onb-ok',
              role: 'status',
              'aria-live': 'polite',
              'data-gp-key-success': '1',
            },
              h('span', { className: 'gp-spin', 'aria-hidden': true }),
              h('span', null, '✓ 已验证，正在加载你的数据…'))
          : null,
        h('div', { className: 'gp-onb-privacy' }, '只存本机（600 权限）、只读、不上传、不进仓库'))
    }

    /** 第 3 步：可选，复用账号登录流程（安装日志 / 登录表单都由 UnlockCard 提供） */
    function OnboardStep3({ flow, open, onStart, onSkip, showSkip }) {
      return h('section', {
        className: 'gp-onb-step gp-onb-step3',
        'data-gp-onb-step': '3',
        'data-gp-advanced': open ? '1' : '0',
      },
        h('div', { className: 'gp-onb-step-hd' },
          h('span', { className: 'gp-onb-n', 'aria-hidden': true }, '3'),
          h('h2', { className: 'gp-onb-step-title' }, '可选：解锁进阶数据'),
          h('span', { className: 'gp-onb-tag' }, open ? '进行中' : '可选')),
        h('p', { className: 'gp-onb-copy' },
          '想要训练负荷、训练准备度、VO₂max 趋势、比赛预测？这些 Garmin 官方 API 不提供，需要 Garmin 账号密码登录一次。'),
        h(UnlockCard, {
          flow,
          id: 'onboarding',
          bare: true,
          showHead: false,
          reason: null,
          onStart,
        }),
        h(AdvancedKeysPanel, { variant: 'onboarding', collapsible: true }),
        showSkip
          ? h('div', { className: 'gp-onb-step3-foot' },
              h('button', {
                type: 'button',
                className: 'gp-onb-skip',
                'data-gp-onboard-skip': '1',
                onClick: onSkip,
              }, '先跳过'),
              h('span', { className: 'gp-onb-copy' },
                '以后在首页的解锁卡片里也能随时开启。'))
          : null)
    }

    /**
     * 新手引导本体。preview=true 时是浮层（从仪表盘「重看新手引导」打开），
     * 只读本地状态，不会重置已保存的 Key 或连接模式。
     */
    function Onboarding({
      flow, preview = false, alreadyConnected = false, onSaved, onDismiss, onClose,
    }) {
      const [stage, setStage] = React.useState('intro') // intro | advanced | done
      const [key, setKey] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [saved, setSaved] = React.useState(false)
      const [help, setHelp] = React.useState(false)
      const inputRef = React.useRef(null)
      const timer = React.useRef(null)
      const alive = React.useRef(true)

      React.useEffect(() => () => {
        alive.current = false
        if (timer.current) clearTimeout(timer.current)
      }, [])

      /* 浮层：Esc 关闭（不写任何持久状态） */
      React.useEffect(() => {
        if (!preview) return undefined
        const onKeyDown = (e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            onClose?.()
          }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [preview, onClose])

      const submit = async (e) => {
        e.preventDefault()
        const value = key.trim()
        if (!value || busy || saved) return
        setBusy(true)
        setError(null)
        try {
          const data = await postJson('setup/key', { key: value })
          if (!alive.current) return
          if (data && data.ok) {
            setSaved(true)
            setStage('done')
            setBusy(false)
            markOnboarded()
            // 先让成功提示停留一下，再刷新页面数据（不整页 reload）
            timer.current = setTimeout(() => { if (alive.current) onSaved?.() }, 900)
            return
          }
          setBusy(false)
          setError(String(data?.error || 'Key 验证失败，请检查后重试'))
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => inputRef.current?.focus?.())
          }
        } catch (err) {
          if (!alive.current) return
          setBusy(false)
          setError(`保存失败：${String(err?.message ?? err)}`)
        }
      }

      const dismiss = () => {
        markOnboarded()
        // 刚保存成功就点「已了解」时，别丢掉那次 version bump：先刷新再收尾
        if (saved) onSaved?.()
        if (preview) onClose?.()
        else onDismiss?.()
      }

      const startAdvanced = () => setStage('advanced')

      const card = h('div', {
        className: 'gp-onb-card',
        'data-gp-onb-card': preview ? 'preview' : 'page',
        role: preview ? 'dialog' : undefined,
        'aria-modal': preview ? 'true' : undefined,
        'aria-label': preview ? '新手引导' : undefined,
      },
        h('header', { className: 'gp-onb-hd' },
          h('div', { className: 'gp-onb-mark', 'aria-hidden': true }, '⌚'),
          h('div', { className: 'gp-onb-hd-main' },
            h('h1', { className: 'gp-onb-title' }, '连接你的 Garmin'),
            h('p', { className: 'gp-onb-sub' }, '三步开始，只读、免费、数据只存本机')),
          preview
            ? h('button', {
                type: 'button',
                className: 'gp-onb-close',
                'aria-label': '关闭新手引导',
                'data-gp-onb-close': '1',
                onClick: () => onClose?.(),
              }, '关闭')
            : null),
        h('div', { className: 'gp-onb-grid' },
          h(OnboardStep1, { open: help, onToggle: () => setHelp((v) => !v) }),
          h(OnboardStep2, {
            value: key,
            onChange: (e) => {
              setKey(e.target.value)
              if (error) setError(null)
            },
            onSubmit: submit,
            busy,
            saved,
            error,
            inputRef,
          }),
          h(OnboardStep3, {
            flow,
            open: stage === 'advanced',
            onStart: startAdvanced,
            onSkip: dismiss,
            showSkip: !preview,
          })),
        h('div', { className: 'gp-onb-foot' },
          h('span', null, preview
            ? '只是重看一遍：已有的 Key 和登录状态不会改变。'
            : '之后可以在首页底部重新打开这份引导。'),
          h('span', { className: 'sp', 'aria-hidden': true }),
          saved || alreadyConnected
            ? h('button', {
                type: 'button',
                className: 'gp-btn primary',
                'data-gp-onb-done': '1',
                onClick: dismiss,
              }, '已了解，开始使用')
            : null))

      return preview
        ? h('div', { className: 'gp-onb-overlay', 'data-gp-onb-overlay': '1' }, card)
        : h('div', { className: 'gp-onb-page', 'data-gp-onb-page': '1' }, card)
    }

    /* ---------------------------------------------------------------- *
     * 账号设置弹窗（数据源 / Key / 账号登录 / 组件 / 操作）
     * ---------------------------------------------------------------- */
    const ACCOUNT_REASON_ZH = {
      key_invalid: 'Personal API Key 无效或已过期',
      key_expired: 'Personal API Key 已过期',
      key_missing: '尚未配置 Personal API Key',
      sso_missing: '尚未登录 Garmin 账号',
      sso_expired: 'Garmin 账号令牌已过期',
      token_expiring: '账号令牌临近过期',
      mcp_missing: '高级模式组件未安装',
      unauth: 'Garmin 授权可能已过期',
    }
    const REASON_ALIASES = {
      keyInvalid: 'key_invalid', keyExpired: 'key_expired', keyMissing: 'key_missing',
      ssoMissing: 'sso_missing', ssoExpired: 'sso_expired', tokenExpiring: 'token_expiring',
      mcpMissing: 'mcp_missing', unauthenticated: 'unauth',
    }

    function reasonText(reason) {
      const raw = String(reason ?? '').trim()
      if (!raw) return ''
      const key = REASON_ALIASES[raw] || raw.toLowerCase().replace(/[-\s]/g, '_')
      return ACCOUNT_REASON_ZH[key] || raw
    }

    /** 到期描述：支持剩余天数、时间戳、ISO 日期；缺省按 180 天令牌寿命推算 */
    function expiryText(expire, ageDays) {
      if (typeof expire === 'number' && isFinite(expire)) {
        if (expire > 1e9) {
          const ms = expire < 1e12 ? expire * 1000 : expire
          const day = dayPart(new Date(ms).toISOString())
          return day ? `预计 ${day} 过期` : null
        }
        return `预计 ${Math.max(0, Math.round(expire))} 天后过期`
      }
      const day = dayPart(expire)
      if (day) {
        const ms = Date.parse(`${day}T12:00:00`)
        if (isFinite(ms)) {
          return `预计 ${Math.max(0, Math.ceil((ms - Date.now()) / 86400000))} 天后过期`
        }
      }
      if (typeof ageDays === 'number' && isFinite(ageDays)) {
        return `预计 ${Math.max(0, 180 - Math.round(ageDays))} 天后过期`
      }
      return null
    }

    function AccountModal({ account, setup, advanced, flow, onClose, onReload, refresh, showToast, gender = null, onGenderSave = null, onRoadbookChanged = null }) {
      const [keyOpen, setKeyOpen] = React.useState(false)
      const [key, setKey] = React.useState('')
      const [keyBusy, setKeyBusy] = React.useState(false)
      const [keyError, setKeyError] = React.useState(null)
      const [revalBusy, setRevalBusy] = React.useState(false)
      const [revalError, setRevalError] = React.useState(null)
      const [loginOpen, setLoginOpen] = React.useState(false)
      const [loginDone, setLoginDone] = React.useState(false)
      const [genderDraft, setGenderDraft] = React.useState(gender === 'female' || gender === 'male' ? gender : 'none')
      const [genderNote, setGenderNote] = React.useState(null)
      const alive = React.useRef(true)
      const keyInput = React.useRef(null)

      React.useEffect(() => () => { alive.current = false }, [])

      React.useEffect(() => {
        const onKeyDown = (e) => {
          if (e.key === 'Escape') { e.preventDefault(); onClose?.() }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [onClose])

      React.useEffect(() => {
        if (!keyOpen) return undefined
        const timer = setTimeout(() => keyInput.current?.focus?.(), 40)
        return () => clearTimeout(timer)
      }, [keyOpen])

      const hasKey = typeof account?.hasKey === 'boolean' ? account.hasKey
        : typeof setup?.hasKey === 'boolean' ? setup.hasKey : null
      const keyValid = typeof account?.keyValid === 'boolean' ? account.keyValid
        : typeof setup?.keyValid === 'boolean' ? setup.keyValid : null
      const ssoAuthed = typeof account?.ssoAuthed === 'boolean' ? account.ssoAuthed
        : typeof setup?.ssoAuthed === 'boolean' ? setup.ssoAuthed : null
      const mcpInstalled = typeof account?.mcpInstalled === 'boolean' ? account.mcpInstalled
        : typeof setup?.mcpInstalled === 'boolean' ? setup.mcpInstalled : null
      const isAdvanced = typeof account?.advanced === 'boolean' ? account.advanced : advanced === true
      const reasons = Array.isArray(account?.reasons) ? account.reasons.map(reasonText).filter(Boolean) : []
      const keyUpdated = firstOf(account?.keyUpdatedAt, account?.keyUpdated, account?.keySetAt)
      const tokenUpdated = firstOf(account?.tokenUpdatedAt, account?.tokenUpdated)
      const tokenAge = numOf(account?.tokenAgeDays)
      const expire = account?.tokenExpiresEstimate

      const keyText = keyValid === true ? '有效'
        : keyValid === false ? '无效'
          : hasKey === true ? '未验证' : '未配置'
      const keyDot = keyValid === true ? '' : keyValid === false ? ' bad' : hasKey ? ' warn' : ' warn'

      let ssoText = '未登录'
      if (ssoAuthed === true) ssoText = '有效'
      else if (reasons.some((r) => r.includes('过期'))) ssoText = '过期'
      const ssoDot = ssoAuthed === true ? '' : ssoAuthed === false && !isAdvanced ? ' warn' : ' bad'

      const expireLabel = expiryText(expire, tokenAge)
      const tokenWarn = isAdvanced && tokenAge !== null && tokenAge > 150
      const expireDays = (() => {
        if (typeof expire === 'number' && expire > 0 && expire <= 400) return Math.round(expire)
        if (typeof expire === 'string') {
          const day = dayPart(expire)
          if (day) {
            const ms = Date.parse(`${day}T12:00:00`)
            if (isFinite(ms)) return Math.round((ms - Date.now()) / 86400000)
          }
        }
        if (tokenAge !== null) return 180 - Math.round(tokenAge)
        return null
      })()
      const expireSoon = isAdvanced && expireDays !== null && expireDays <= 30

      const submitKey = async (e) => {
        e.preventDefault()
        const value = key.trim()
        if (!value || keyBusy) return
        setKeyBusy(true)
        setKeyError(null)
        try {
          const data = await postJson('setup/key', { key: value })
          if (!alive.current) return
          setKeyBusy(false)
          if (data && data.ok) {
            setKey('')
            setKeyOpen(false)
            showToast?.('Key 已验证并保存', 'ok')
            onReload?.()
            return
          }
          setKeyError(String(data?.error || 'Key 验证失败，请检查后重试'))
        } catch (err) {
          if (!alive.current) return
          setKeyBusy(false)
          setKeyError(`保存失败：${String(err?.message ?? err)}`)
        }
      }

      const revalidate = async () => {
        if (revalBusy) return
        setRevalBusy(true)
        setRevalError(null)
        try {
          const data = await postJson('account/revalidate-key')
          if (!alive.current) return
          setRevalBusy(false)
          if (data && data.ok) {
            showToast?.('Key 验证通过', 'ok')
            onReload?.()
            return
          }
          setRevalError(String(data?.error || 'Key 仍然无效，请重新粘贴'))
        } catch (err) {
          if (!alive.current) return
          setRevalBusy(false)
          setRevalError(`验证失败：${String(err?.message ?? err)}`)
        }
      }

      /* 组件状态：直接复用解锁流程（安装 / 轮询 / 失败），但只保留紧凑日志 */
      const installActive = !!(flow && flow.owner === 'account' && flow.phase !== 'idle')
      let installBlock
      if (!installActive) {
        installBlock = h('div', { className: 'gp-acct-actions' },
          h('button', {
            className: 'gp-btn',
            type: 'button',
            'data-gp-acct-install': '1',
            disabled: !flow,
            onClick: () => flow?.start('account'),
          }, mcpInstalled ? '重新准备' : '准备组件'))
      } else if (flow.phase === 'installing') {
        const tail = flow.lines.slice(-4)
        installBlock = h(React.Fragment, null,
          h('div', { className: 'gp-hintline', role: 'status', 'aria-live': 'polite' },
            h('span', { className: 'gp-spin', 'aria-hidden': true }),
            h('span', null, '正在准备组件…')),
          h('div', { className: 'gp-log gp-acct-log', role: 'log', 'aria-label': '组件准备日志' },
            tail.length
              ? tail.map((line, i) => h('div', { key: i, className: 'gp-log-line' }, String(line)))
              : h('div', { className: 'gp-log-line' }, '等待日志…')),
          h('div', { className: 'gp-acct-actions' },
            h('button', { className: 'gp-btn', type: 'button', onClick: () => flow.reset() }, '取消')))
      } else if (flow.phase === 'failed') {
        installBlock = h(React.Fragment, null,
          h('div', { className: 'gp-acct-err' }, flow.error || '组件准备失败，请重试'),
          h('div', { className: 'gp-acct-actions' },
            h('button', { className: 'gp-btn primary', type: 'button', onClick: () => flow.start('account') }, '重试'),
            h('button', { className: 'gp-btn', type: 'button', onClick: () => flow.reset() }, '取消')))
      } else if (flow.phase === 'login') {
        installBlock = h(React.Fragment, null,
          h('div', { className: 'gp-acct-sub' }, '组件已就绪，请用下方「重新登录 Garmin 账号」完成登录。'),
          h('div', { className: 'gp-acct-actions' },
            h('button', { className: 'gp-btn', type: 'button', onClick: () => flow.reset() }, '取消')))
      } else {
        installBlock = h('div', { className: 'gp-hintline' },
          h('span', { className: 'gp-dot' }),
          h('span', null, '组件已就绪'))
      }

      const row = (id, label, ...children) => h('div', {
        className: 'gp-acct-row',
        'data-gp-acct-row': id,
      },
        h('div', { className: 'gp-acct-lab' }, label),
        h('div', { className: 'gp-acct-val' }, ...children))

      return h(React.Fragment, null,
        h('div', { className: 'gp-acct-backdrop', onClick: onClose, 'aria-hidden': true }),
        h('div', {
          className: 'gp-acct',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': '账号设置',
          'data-gp-account-modal': '1',
        },
          h('div', { className: 'gp-acct-hd' },
            h('b', null, '账号设置'),
            h('div', { className: 'sp' },
              h('button', {
                className: 'gp-icon-btn',
                type: 'button',
                title: '关闭',
                'aria-label': '关闭账号设置',
                'data-gp-account-close': '1',
                onClick: onClose,
              }, '✕'))),

          h('div', { className: 'gp-acct-body' },
            row('source', '数据来源',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${hasKey === true || ssoAuthed === true ? '' : ' warn'}` }),
                h('b', null, 'Garmin 官方 Personal API'),
                isAdvanced ? h('span', { className: 'gp-pill' }, '账号登录') : null),
              h('div', { className: 'gp-acct-sub' },
                isAdvanced ? '官方只读数据 + 账号登录的进阶数据' : '官方只读数据（免费）'),
              reasons.length
                ? h('div', { className: 'gp-acct-sub' }, `检查项：${reasons.join(' · ')}`)
                : null),

            row('gender', '性别',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${genderDraft === 'none' ? ' warn' : ''}` }),
                h('b', null, genderDraft === 'female' ? '女' : genderDraft === 'male' ? '男' : '未设置')),
              h('div', { className: 'gp-acct-sub' },
                '女性健康区块只在性别为「女」时出现；未设置则不显示，也不会请求女性健康数据。'),
              h('div', {
                className: 'gp-acct-actions',
                'data-gp-acct-gender-options': '1',
                role: 'group',
                'aria-label': '性别',
              }, [['none', '未设置'], ['female', '女'], ['male', '男']].map(([value, label]) => h('button', {
                key: value,
                type: 'button',
                className: `gp-btn${genderDraft === value ? ' primary' : ''}`,
                'data-gp-acct-gender': value,
                'aria-pressed': genderDraft === value,
                onClick: () => { setGenderDraft(value); setGenderNote(null) },
              }, label))),
              h('div', { className: 'gp-acct-actions' },
                h('button', {
                  className: 'gp-btn primary',
                  type: 'button',
                  'data-gp-acct-gender-save': '1',
                  onClick: () => {
                    onGenderSave?.(genderDraft)
                    setGenderNote(genderDraft === 'none'
                      ? '已设为未设置，正在刷新…'
                      : '性别已保存，正在刷新…')
                  },
                }, '保存性别')),
              genderNote ? h('div', { className: 'gp-acct-note' }, genderNote) : null),

            row('key', 'Personal API Key',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${keyDot}` }),
                h('b', null, keyText),
                keyUpdated
                  ? h('span', { className: 'gp-acct-sub' }, `更新于 ${stampText(keyUpdated)}`)
                  : null),
              h('div', { className: 'gp-acct-sub' },
                hasKey === false
                  ? '尚未保存 Key，粘贴后即可读取官方数据。'
                  : '只读、只存本机；失效后重新生成并粘贴即可。'),
              revalError ? h('div', { className: 'gp-acct-err', role: 'alert' }, revalError) : null,
              keyError
                ? h('div', { className: 'gp-acct-err', role: 'alert' },
                    keyError,
                    h('div', { style: { marginTop: 4 } },
                      h('a', {
                        href: API_TOKEN_URL,
                        target: '_blank',
                        rel: 'noreferrer',
                        style: { color: 'inherit', textDecoration: 'underline' },
                      }, '重新生成 Key ↗')))
                : null,
              keyOpen
                ? h('form', { className: 'gp-acct-keyform', onSubmit: submitKey, noValidate: true },
                    h('input', {
                      ref: keyInput,
                      className: 'gp-input',
                      type: 'password',
                      value: key,
                      placeholder: '粘贴新的 Personal API Key',
                      autoComplete: 'off',
                      spellCheck: false,
                      'aria-label': 'Garmin Personal API Key',
                      'data-gp-acct-key-input': '1',
                      disabled: keyBusy,
                      onChange: (e) => {
                        setKey(e.target.value)
                        if (keyError) setKeyError(null)
                      },
                    }),
                    h('button', {
                      className: 'gp-btn primary',
                      type: 'submit',
                      disabled: keyBusy || !key.trim(),
                      'data-gp-acct-key-submit': '1',
                    }, keyBusy ? '验证中…' : '验证并保存'),
                    h('button', {
                      className: 'gp-btn',
                      type: 'button',
                      onClick: () => { setKeyOpen(false); setKey(''); setKeyError(null) },
                    }, '取消'))
                : null,
              h('div', { className: 'gp-acct-actions' },
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  'data-gp-acct-key-open': '1',
                  onClick: () => { setKeyOpen((v) => !v); setKeyError(null) },
                }, keyOpen ? '收起 Key 表单' : '重新粘贴 Key'),
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  disabled: revalBusy || hasKey === false,
                  'data-gp-acct-revalidate': '1',
                  onClick: revalidate,
                }, revalBusy ? '验证中…' : '重新验证'))),

            row('sso', '账号登录（进阶）',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${ssoDot}` }),
                h('b', null, ssoText),
                isAdvanced ? null : h('span', { className: 'gp-pill' }, '未启用')),
              h('div', { className: 'gp-acct-sub' },
                tokenUpdated
                  ? `令牌更新于 ${stampText(tokenUpdated)}${expireLabel ? ` · ${expireLabel}` : ''}`
                  : isAdvanced
                    ? '尚未登录 Garmin 账号，进阶数据暂不可用。'
                    : '进阶数据（训练负荷 / 阈值 / 耐受度）需要账号登录。'),
              tokenWarn || expireSoon
                ? h('div', { className: 'gp-acct-warn', 'data-gp-acct-token-warn': '1' },
                    tokenWarn
                      ? `令牌已 ${Math.round(tokenAge)} 天未更新，约 180 天后过期，建议重新登录 Garmin 账号。`
                      : `令牌将在 ${Math.max(0, Math.round(expireDays))} 天后过期，建议重新登录 Garmin 账号。`)
                : null,
              loginDone ? h('div', { className: 'gp-acct-note' }, '登录成功，正在刷新数据…') : null,
              loginOpen
                ? h('div', { 'data-gp-acct-login-form': '1' },
                    h(Credentials, {
                      compact: true,
                      onSuccess: () => {
                        setLoginDone(true)
                        flow?.succeed?.()
                        onReload?.()
                      },
                    }))
                : null),

            row('mcp', '组件状态',
              h('div', { className: 'gp-acct-main' },
                h('span', { className: `gp-dot${mcpInstalled === true ? '' : mcpInstalled === false ? ' bad' : ' warn'}` }),
                h('b', null, mcpInstalled === true ? '已安装' : mcpInstalled === false ? '未安装' : '未知')),
              h('div', { className: 'gp-acct-sub' },
                '进阶数据依赖本机的 garmin-mcp 组件，准备过程全程在面板内完成。'),
              installBlock),

            h('div', {
              className: 'gp-acct-sec',
              'data-gp-acct-sec': 'advanced-keys',
            },
              h('div', { className: 'gp-acct-sec-hd' },
                h('b', null, '高级功能 Key（可选）'),
                h('span', { className: 'gp-acct-sub' },
                  '路线规划 / 行者导入；不配置不影响基础数据')),
              h(AdvancedKeysPanel, {
                variant: 'account',
                onChanged: onRoadbookChanged,
                showToast,
              })),

            row('actions', '操作',
              h('div', { className: 'gp-acct-actions' },
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  'data-gp-acct-login': '1',
                  onClick: () => { setLoginOpen((v) => !v); setLoginDone(false) },
                }, loginOpen ? '收起登录表单' : '重新登录 Garmin 账号'),
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  'data-gp-acct-refresh': '1',
                  onClick: () => { refresh?.(); showToast?.('正在刷新数据…', 'ok') },
                }, '刷新数据'),
                h('button', {
                  className: 'gp-btn',
                  type: 'button',
                  'data-gp-acct-close': '1',
                  onClick: onClose,
                }, '关闭')))),
          h('div', { className: 'gp-acct-ft' },
            '凭据只存本机（~/.garminconnect，600 权限），不上传、不进仓库。')))
    }

    /* ---------------------------------------------------------------- *
     * 设备查看器（顶栏弹层）
     * ---------------------------------------------------------------- */
    function useDeviceDetail(id, version) {
      const [state, setState] = React.useState({ id: null, loading: false })
      React.useEffect(() => {
        if (!id) return undefined
        let cancelled = false
        setState({ id, loading: true })
        fetch(`${API}/devices/${encodeURIComponent(id)}`, { headers: { Accept: 'application/json' } })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((data) => { if (!cancelled) setState({ id, loading: false, data }) })
          .catch((error) => { if (!cancelled) setState({ id, loading: false, error: String(error) }) })
        return () => { cancelled = true }
      }, [id, version])
      return state
    }

    function DeviceDetail({ device, state }) {
      if (!state || state.loading) return h('div', { className: 'gp-dev-note' }, '加载中…')
      if (state.error) return h('div', { className: 'gp-dev-note' }, '设备数据暂不可用')
      const data = state.data
      if (!data || typeof data !== 'object') return h('div', { className: 'gp-dev-note' }, '无详情数据')
      const s = data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings) ? data.settings : {}
      const rows = []
      const model = firstOf(s.model, s.part_number, s.partNumber, data.model, device?.model)
      if (model) rows.push(['型号', String(model)])
      const serial = firstOf(s.serial_number, s.serialNumber, data.serial, device?.serial)
      if (serial) rows.push(['序列号', String(serial)])
      const firmware = firstOf(s.software_version, s.softwareVersion, s.firmware_version, s.firmwareVersion,
        s.firmware?.version, s.version)
      if (firmware) rows.push(['固件', String(firmware)])
      const solar = solarText(data.solar)
      if (solar) rows.push(['太阳能', solar])
      const alarms = alarmCount(data.alarms)
      if (alarms !== null) rows.push(['闹钟', `${alarms} 个`])
      if (!rows.length) return h('div', { className: 'gp-dev-note' }, '无详情数据')
      return h('div', { className: 'gp-dev-detail' },
        rows.map(([k, v]) => h('div', { key: k, className: 'gp-dev-kv' },
          h('span', null, k), h('b', null, v))))
    }

    function DevicePopover({ list, loading, error, latest, version, onRefresh, onClose, anchorRef }) {
      const [openId, setOpenId] = React.useState(null)
      const boxRef = React.useRef(null)
      const raw = useDeviceDetail(openId, version)
      const detail = raw.id === openId ? raw : { id: openId, loading: true }

      React.useEffect(() => {
        const onPointerDown = (e) => {
          if (boxRef.current && boxRef.current.contains(e.target)) return
          if (anchorRef?.current && anchorRef.current.contains(e.target)) return
          onClose()
        }
        const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKeyDown)
        }
      }, [onClose, anchorRef])

      const latestName = latest?.name || null
      let body
      if (error || (!loading && !list)) {
        body = h('div', { className: 'gp-dev-note', style: { padding: '10px 4px' } }, '设备数据暂不可用')
      } else if (!list) {
        body = h('div', { className: 'gp-dev-note', style: { padding: '10px 4px' } }, '加载中…')
      } else if (!list.length) {
        body = h('div', { className: 'gp-dev-note', style: { padding: '10px 4px' } }, '没有登记设备')
      } else {
        body = h('div', { className: 'gp-dev-body' }, list.map((d, i) => {
          const id = String(firstOf(d.id, d.device_id, i))
          const isOpen = openId === id
          const fromLatest = latest && String(latest.id) === id ? latest.at : null
          const when = syncText(firstOf(d.lastSync, d.last_sync, fromLatest)) || '同步时间未知'
          return h('div', { key: id, className: `gp-dev-row${isOpen ? ' open' : ''}` },
            h('div', { className: 'gp-dev-head' },
              h('div', { className: 'gp-dev-main' },
                h('div', { className: 'gp-dev-name' }, firstOf(d.name, d.deviceName, `设备 ${id}`)),
                h('div', { className: 'gp-dev-tags' },
                  h('span', { className: 'gp-tag' }, deviceChip(d)),
                  d.isPrimary ? h('span', { className: 'gp-pill g' }, '主设备') : null)),
              h('div', { className: 'gp-dev-meta' },
                h('span', { className: 't' }, when),
                h('button', {
                  className: 'gp-dev-toggle',
                  onClick: () => setOpenId(isOpen ? null : id),
                  'aria-expanded': isOpen,
                }, '详情', h('span', { className: `caret${isOpen ? ' up' : ''}` }, '▾')))),
            isOpen ? h(DeviceDetail, { device: d, state: detail }) : null)
        }))
      }

      return h('div', { className: 'gp-dev-pop', ref: boxRef, role: 'dialog', 'aria-label': '我的 Garmin 设备' },
        h('div', { className: 'gp-dev-hd' },
          h('b', null, '我的 Garmin 设备'),
          list ? h('span', { className: 'cnt' }, `${list.length} 台`) : null,
          h('div', { className: 'sp' },
            h('button', {
              className: 'gp-icon-btn', onClick: onRefresh, title: '刷新设备', 'aria-label': '刷新设备',
            }, '↻'))),
        body,
        latestName
          ? h('div', { className: 'gp-dev-foot' },
              h('span', null, '最近同步'),
              h('span', { style: { marginLeft: 'auto', color: 'var(--gp-t2)' } }, latestName))
          : null)
    }

    /** 力量训练组次：兼容 reps / repetitionCount、weight / weight_kg 等写法 */
    function normalizeExerciseSets(raw) {
      const rows = Array.isArray(raw) ? raw : []
      return rows.map((row, i) => {
        if (!row || typeof row !== 'object') return null
        const name = firstOf(row.exercise, row.exerciseName, row.name, row.category,
          row.exercise_name, row.activity)
        const reps = numOf(row.reps, row.repetitionCount, row.repetitions, row.rep_count)
        const weight = numOf(row.weight_kg, row.weightKg, row.weight, row.weight_lb)
        const seconds = numOf(row.duration_seconds, row.durationSec, row.duration, row.seconds)
        if (!name && reps === null && seconds === null && weight === null) return null
        return {
          key: `${i}-${String(firstOf(row.set, i + 1))}`,
          set: numOf(row.set, row.set_index, row.setNumber, row.index, i + 1),
          name: name ? String(name) : '—',
          reps,
          weight,
          seconds,
        }
      }).filter(Boolean)
    }

    function ActivityDrawer({ id, onClose, showToast, flow, gated, version = 0 }) {
      const detail = useJson(`activities/${encodeURIComponent(id)}`, true, version)
      const track = useJson(`activities/${encodeURIComponent(id)}/track`, true, version)
      const trackPoints = React.useMemo(
        () => (Array.isArray(track.data?.points) ? track.data.points : []),
        [track.data],
      )
      // 活动轨迹来自 /activities/:id/track（WGS-84），底图请求用 coord=wgs84
      const [mapRef, mapWidth] = useElementWidth()
      const mapScale = mapWidth > 0 ? Math.min(2, 1600 / mapWidth) : 2
      const basemap = useStaticMap(trackPoints, {
        coord: 'wgs84',
        kind: 'activity',
        width: mapWidth > 0 ? Math.max(160, Math.round(mapWidth * mapScale)) : 720,
        height: mapWidth > 0 ? Math.max(120, Math.round(220 * mapScale)) : 360,
        enabled: mapWidth > 0,
      })
      const [zoomUrl, setZoomUrl] = React.useState(null)
      const [copied, setCopied] = React.useState(false)
      const copyTimer = React.useRef(null)

      React.useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current) }, [])

      // Escape 先关地图浮层，再关抽屉；监听器随抽屉卸载移除
      React.useEffect(() => {
        const onKeyDown = (e) => {
          if (e.key !== 'Escape') return
          if (zoomUrl) setZoomUrl(null)
          else onClose()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [onClose, zoomUrl])

      const link = `https://connect.garmin.com/modern/activity/${id}`
      const copyLink = React.useCallback(async () => {
        const ok = await copyText(link)
        if (ok) {
          setCopied(true)
          if (copyTimer.current) clearTimeout(copyTimer.current)
          copyTimer.current = setTimeout(() => setCopied(false), 1800)
        }
        showToast?.(ok ? '活动链接已复制到剪贴板' : '复制失败：请手动复制链接', ok ? 'ok' : 'err')
      }, [link, showToast])

      const data = detail.data && typeof detail.data === 'object' ? detail.data : null
      const summary = data?.summary && typeof data.summary === 'object' ? data.summary : null
      const s = summary ?? {}
      const detailError = detail.error || (data?.status === 'error' ? data.message || '加载失败' : null)
      const loading = detail.loading
      // 官方 API 模式下详情/轨迹会明确返回 advanced_required
      const detailAdvanced = data?.status === 'advanced_required'
      const trackAdvanced = track.data?.status === 'advanced_required'

      const sport = String(firstOf(s.type, s.activity_type, '') ?? '')
      const isBike = /bik|cycl|bike|骑行/i.test(sport)
      const isFoot = /run|walk|hik|trail|treadmill|hike|跑|走|徒步/i.test(sport)
      const speed = numOf(s.avg_speed_mps)
      const aerobic = numOf(data?.effect?.aerobic_effect, s.training_effect)
      const anaerobic = numOf(data?.effect?.anaerobic_effect, s.anaerobic_training_effect)
      const distanceM = numOf(s.distance_meters)
      const distanceKm = distanceM !== null ? distanceM / 1000 : null
      const when = whenText(firstOf(s.start_time_local, s.start_time_gmt))

      /* A 类详情字段：全部可能缺席，缺了就不占位 */
      const trainingLoad = numOf(firstOf(s.training_load, s.trainingLoad,
        data?.training_load, data?.trainingLoad))
      const maxSpeed = numOf(firstOf(s.max_speed_mps, s.maxSpeedMps,
        data?.max_speed_mps, data?.maxSpeedMps))
      const elevMin = numOf(firstOf(s.elevation_min_meters, s.elevationMinMeters,
        data?.elevation_min_meters, data?.elevationMinMeters))
      const elevMax = numOf(firstOf(s.elevation_max_meters, s.elevationMaxMeters,
        data?.elevation_max_meters, data?.elevationMaxMeters))
      const aerobicLabel = firstOf(s.aerobic_label, s.aerobicLabel,
        data?.aerobic_label, data?.aerobicLabel, data?.effect?.aerobic_label)
      const anaerobicLabel = firstOf(s.anaerobic_label, s.anaerobicLabel,
        data?.anaerobic_label, data?.anaerobicLabel, data?.effect?.anaerobic_label)
      const manufacturer = firstOf(s.device_manufacturer, s.deviceManufacturer,
        s.manufacturer, data?.device_manufacturer, data?.deviceManufacturer,
        data?.device?.manufacturer)
      const sets = normalizeExerciseSets(firstOf(data?.exerciseSets, data?.exercise_sets,
        s.exerciseSets, s.exercise_sets))

      const kpis = [
        { k: '距离', v: fmt(distanceKm, 2), u: distanceKm !== null ? 'km' : '' },
        { k: '用时', v: clock(s.duration_seconds) },
        { k: '移动用时', v: clock(s.moving_duration_seconds) },
        isBike || !isFoot
          ? { k: '均速', v: speedText(speed) ?? '—' }
          : { k: '配速', v: paceText(speed) ?? '—' },
        { k: '爬升', v: fmt(s.elevation_gain_meters, 0), u: numOf(s.elevation_gain_meters) !== null ? 'm' : '' },
        { k: '卡路里', v: fmt(s.calories), u: numOf(s.calories) !== null ? 'kcal' : '' },
        { k: '平均心率', v: fmt(s.avg_hr_bpm), u: numOf(s.avg_hr_bpm) !== null ? 'bpm' : '' },
        { k: '最大心率', v: fmt(s.max_hr_bpm), u: numOf(s.max_hr_bpm) !== null ? 'bpm' : '' },
        {
          k: '训练效果',
          v: aerobic !== null || anaerobic !== null
            ? `${fmt(aerobic, 1)} / ${fmt(anaerobic, 1)}`
            : '—',
          u: aerobic !== null || anaerobic !== null ? '有氧/无氧' : '',
        },
      ]
      if (trainingLoad !== null) kpis.push({ k: '训练负荷', v: fmt(trainingLoad) })
      if (maxSpeed !== null) kpis.push({ k: '最大速度', v: speedText(maxSpeed) ?? '—' })
      if (elevMin !== null || elevMax !== null) {
        kpis.push({
          k: '海拔区间',
          v: elevMin !== null && elevMax !== null
            ? `${fmt(elevMin, 0)}–${fmt(elevMax, 0)}`
            : fmt(elevMin !== null ? elevMin : elevMax, 0),
          u: 'm',
        })
      }

      /* 文字评级 + 设备厂商：有才显示，不占位 */
      const infoChips = []
      if (aerobicLabel) infoChips.push(String(aerobicLabel))
      if (anaerobicLabel) infoChips.push(String(anaerobicLabel))
      if (manufacturer) infoChips.push(String(manufacturer))

      /* 轨迹 */
      let trackBlock
      if (track.loading) {
        trackBlock = h('div', null,
          h(Skel, { h: 220 }),
          h('div', { style: { marginTop: 8 } }, h(Skel, { h: 70 })))
      } else if (
        track.error ||
        !track.data ||
        track.data.status === 'error' ||
        track.data.status !== 'ok' ||
        !Array.isArray(track.data.points) ||
        track.data.points.length < 2
      ) {
        trackBlock = h('div', { className: 'gp-detail-empty' }, '该活动没有 GPS 轨迹（室内或无定位记录）')
      } else {
        const stats = track.data.stats ?? {}
        const elevation = Array.isArray(track.data.elevation) ? track.data.elevation : []
        const elevValues = elevation
          .map((row) => (Number.isFinite(row?.e) ? row.e : null))
          .filter((v) => v !== null)
        const minE = elevValues.length ? Math.min(...elevValues) : null
        const maxE = elevValues.length ? Math.max(...elevValues) : null
        trackBlock = h('div', { className: 'gp-detail-track' },
          h(TrackMap, {
            points: track.data.points,
            basemap,
            wrapRef: mapRef,
            onZoom: (url) => setZoomUrl(url),
          }),
          h(ElevationChart, { rows: elevation }),
          h('div', { className: 'gp-detail-cap' },
            h('span', null, basemap.url ? '轨迹地图 · 高德' : '离线轨迹 · 无底图'),
            basemap.configured && basemap.unavailable
              ? h('span', { className: 'gp-map-unavailable' }, '底图不可用')
              : null,
            stats.distanceM != null ? h('span', null, `轨迹 ${fmt(stats.distanceM / 1000, 2)} km`) : null,
            minE !== null && maxE !== null
              ? h('span', null, `海拔 ${fmt(minE, 0)}–${fmt(maxE, 0)} m`)
              : null))
      }

      const laps = Array.isArray(data?.splits?.laps) ? data.splits.laps : []
      const hrZones = Array.isArray(data?.hrZones) ? data.hrZones : []
      const powerZones = Array.isArray(data?.powerZones) ? data.powerZones : []
      const weather = data?.weather && typeof data.weather === 'object' ? data.weather : null
      const gear = Array.isArray(data?.gear) ? data.gear : []

      const chips = []
      if (weather) {
        const temp = numOf(weather.temperature)
        if (temp !== null) {
          chips.push(`${fmt(temp, 1)}${weather.temperature_unit ? `°${weather.temperature_unit}` : '°'}`)
        }
        if (weather.weather_description) chips.push(String(weather.weather_description))
        const humidity = numOf(weather.humidity_percent)
        if (humidity !== null) chips.push(`湿度 ${fmt(humidity, 0)}%`)
        const wind = numOf(weather.wind_speed)
        if (wind !== null) chips.push(`风 ${fmt(wind, 0)} ${weather.wind_speed_unit || 'km/h'}`)
      }
      for (const g of gear) {
        if (g?.name) chips.push(String(g.name))
      }

      // 官方 API 模式下这些区块要么明确 advanced_required，要么整块为空
      const hasAdvanced =
        laps.length > 0 || hrZones.length > 0 || powerZones.length > 0 || !!weather || chips.length > 0 ||
        infoChips.length > 0 || sets.length > 0 ||
        (track.data?.status === 'ok' && Array.isArray(track.data.points) && track.data.points.length >= 2)
      const lockAdvanced = detailAdvanced || trackAdvanced ||
        (!!gated && !loading && !track.loading && !hasAdvanced)

      return h(React.Fragment, null,
        h('div', { className: 'gp-detail-backdrop', onClick: onClose, 'aria-hidden': true }),
        h('div', {
          className: 'gp-detail',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': '活动详情',
          'data-gp-detail': '1',
        },
          h('div', { className: 'gp-detail-hd' },
            h('div', { style: { minWidth: 0 } },
              h('div', { className: 'gp-detail-title' },
                summary?.name || `活动 ${id}`),
              h('div', { className: 'gp-detail-sub' },
                when || (loading ? '加载中…' : ''),
                sport ? `${when ? ' · ' : ''}${SPORT_ZH[sport] || sport}` : '')),
            h('button', {
              className: 'gp-detail-close',
              onClick: onClose,
              title: '关闭',
              'aria-label': '关闭',
            }, '✕')),

          h('div', { className: 'gp-detail-body' },
            detailError
              ? h('div', { className: 'gp-err' }, `活动详情加载失败：${detailError}`)
              : null,

            loading && !data
              ? h('div', { className: 'gp-detail-kpis' },
                  Array.from({ length: 9 }, (_, i) => h('div', { key: i, className: 'gp-detail-kpi' },
                    h(Skel, { h: 34 }))))
              : h('div', { className: 'gp-detail-kpis' }, kpis.map((item) => h('div', {
                  key: item.k,
                  className: 'gp-detail-kpi',
                },
                  h('div', { className: 'k' }, item.k),
                  h('div', { className: 'v' }, item.v, item.u ? h('small', null, item.u) : null)))),

            infoChips.length
              ? h('div', {
                  className: 'gp-detail-chips gp-detail-info',
                  'data-gp-detail-info': '1',
                }, infoChips.map((chip, i) => h('span', {
                  key: `${chip}-${i}`,
                  className: 'gp-detail-chip',
                }, chip)))
              : null,

            sets.length
              ? h('div', null,
                  h('div', { className: 'gp-detail-sec' },
                    h('h4', null, '组次'),
                    h('span', { className: 'sp' }, `${sets.length} 组`)),
                  h('div', { className: 'gp-detail-sets', 'data-gp-drawer-sets': String(sets.length) },
                    h('table', { className: 'gp-table' },
                      h('thead', null, h('tr', null,
                        ['组', '动作', '次数', '重量'].map((t) => h('th', { key: t }, t)))),
                      h('tbody', null, sets.map((row) => h('tr', { key: row.key },
                        h('td', { className: 'n' }, fmt(row.set)),
                        h('td', { className: 'gp-tname' }, row.name),
                        h('td', { className: 'n' }, row.reps !== null ? `${fmt(row.reps)} 次` : '—'),
                        h('td', { className: 'n' },
                          row.weight !== null ? `${fmt(row.weight, 1)} kg` : '—')))))))
              : null,

            lockAdvanced
              ? h('div', { className: 'gp-detail-lock' },
                  h('div', { className: 'gp-detail-lock-hint' },
                    '分段、心率 / 功率区间、天气与轨迹来自 Garmin 账号登录，官方 Personal API 不提供。'),
                  h(UnlockCard, { flow, id: 'drawer', compact: true }))
              : h(React.Fragment, null,
                  h('div', { className: 'gp-detail-sec' }, h('h4', null, '轨迹')),
                  trackBlock,

                  h('div', { className: 'gp-detail-sec' }, h('h4', null, '分段'),
                    h('span', { className: 'sp' }, laps.length ? `${laps.length} 圈` : '')),
                  laps.length
                    ? h('div', { className: 'gp-detail-splits' },
                        h('table', { className: 'gp-table' },
                          h('thead', null, h('tr', null,
                            ['圈', '距离', '用时', isBike || !isFoot ? '均速' : '配速', '均心', '爬升'].map((t) =>
                              h('th', { key: t }, t)))),
                          h('tbody', null, laps.map((lap, i) => h('tr', { key: lap.lap_number ?? i },
                            h('td', { className: 'n' }, fmt(lap.lap_number ?? i + 1)),
                            h('td', { className: 'n' },
                              lap.distance_meters != null ? `${fmt(lap.distance_meters / 1000, 2)} km` : '—'),
                            h('td', { className: 'n' }, clock(lap.duration_seconds)),
                            h('td', { className: 'n' },
                              (isBike || !isFoot ? speedText(lap.avg_speed_mps) : paceText(lap.avg_speed_mps)) || '—'),
                            h('td', { className: 'n' }, fmt(lap.avg_hr_bpm)),
                            h('td', { className: 'n' },
                              lap.elevation_gain_meters != null ? `${fmt(lap.elevation_gain_meters, 0)} m` : '—'))))))
                    : h('div', { className: 'gp-detail-empty' }, '没有分段数据'),

                  hrZones.length || powerZones.length
                    ? h('div', null,
                        h('div', { className: 'gp-detail-sec' },
                          h('h4', null, '心率区间'),
                          h('span', { className: 'sp' }, 'bpm')),
                        hrZones.length
                          ? h(ZoneBars, { zones: hrZones, unit: 'bpm' })
                          : h('div', { className: 'gp-detail-empty' }, '没有心率区间数据'),
                        powerZones.length
                          ? h('div', { style: { marginTop: 14 } },
                              h('div', { className: 'gp-detail-sec' },
                                h('h4', null, '功率区间'),
                                h('span', { className: 'sp' }, 'W')),
                              h(ZoneBars, { zones: powerZones, unit: 'W' }))
                          : null)
                    : null,

                  chips.length
                    ? h('div', null,
                        h('div', { className: 'gp-detail-sec' }, h('h4', null, '天气 · 装备')),
                        h('div', { className: 'gp-detail-chips' },
                          chips.map((chip, i) => h('span', { key: `${chip}-${i}`, className: 'gp-detail-chip' }, chip))))
                    : null),

            /* FIT 曲线永远可点：官方模式下会明确返回 advanced_required */
            h(FitCurves, { id, flow }),
            h(DeepAnalysis, { id, flow })),

          h('div', { className: 'gp-detail-foot' },
            h('a', {
              className: 'gp-btn primary gp-detail-link',
              href: link,
              target: '_blank',
              rel: 'noreferrer',
            }, '在 Garmin Connect 打开'),
            h('div', { className: 'sp' },
              h('button', { className: 'gp-btn', onClick: copyLink }, copied ? '已复制' : '复制链接'),
              h('button', { className: 'gp-btn', onClick: onClose }, '关闭')))),

        zoomUrl
          ? h(React.Fragment, null,
              h('div', {
                className: 'gp-map-zoom-backdrop',
                onClick: () => setZoomUrl(null),
                'aria-hidden': true,
              }),
              h('div', {
                className: 'gp-map-zoom-modal',
                role: 'dialog',
                'aria-modal': 'true',
                'aria-label': '活动轨迹地图',
                'data-gp-map-modal': '1',
              },
                h('div', { className: 'gp-map-zoom-hd' },
                  h('div', { className: 'tt' }, '活动轨迹地图'),
                  h('button', {
                    className: 'gp-detail-close',
                    onClick: () => setZoomUrl(null),
                    title: '关闭',
                    'aria-label': '关闭',
                  }, '✕')),
                h('div', { className: 'gp-map-zoom-body' },
                  h('img', {
                    className: 'gp-map-zoom-img',
                    src: zoomUrl,
                    alt: '活动轨迹地图',
                    'data-gp-map-modal-img': '1',
                  }),
                  h('a', {
                    className: 'gp-map-attr gp-map-attr-lg',
                    href: 'https://www.amap.com/',
                    target: '_blank',
                    rel: 'noreferrer noopener',
                    title: '高德地图',
                    'data-gp-map-attribution': '1',
                  }, '高德地图'))))
          : null)
    }

    function PlanDetailPopover({
      day, workout, source, links, pos, showToast = null, onClose,
    }) {
      const ref = React.useRef(null)
      React.useEffect(() => {
        const node = ref.current
        try { node?.focus?.({ preventScroll: true }) } catch { /* ignore */ }
        const onKey = (e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            onClose?.()
          }
        }
        const onDown = (e) => {
          const box = ref.current
          if (!box) return
          const target = e.target
          if (box.contains(target)) return
          if (target && target.closest && target.closest('[data-gp-plan-day]')) return
          onClose?.()
        }
        const onScroll = () => onClose?.()
        document.addEventListener('keydown', onKey, true)
        document.addEventListener('pointerdown', onDown, true)
        window.addEventListener('scroll', onScroll, true)
        return () => {
          document.removeEventListener('keydown', onKey, true)
          document.removeEventListener('pointerdown', onDown, true)
          window.removeEventListener('scroll', onScroll, true)
        }
      }, [onClose])

      const copy = (text, message) => copyText(text).then((ok) => {
        showToast?.(ok ? message : '复制失败：请手动复制', ok ? 'ok' : 'err')
        return ok
      })
      const href = planWorkoutHref(workout, links)
      const duration = planDurationText(workout.durationMin)
      const distance = planDistanceText(workout.distanceM)

      return h('div', {
        ref,
        tabIndex: -1,
        role: 'dialog',
        'aria-label': '训练详情',
        className: 'gp-plan-pop',
        style: { left: `${pos.left}px`, top: `${pos.top}px` },
        'data-gp-plan-pop': '1',
        'data-gp-plan-pop-date': day.date,
        onContextMenu: (e) => e.preventDefault(),
      },
        h('div', { className: 'gp-plan-pop-hd' },
          h('span', { className: 'gp-plan-pop-ic' },
            h(SportIcon, { type: workout.type, size: 15 })),
          h('div', { className: 'gp-plan-pop-tt' },
            h('b', null, planWorkoutName(workout)),
            h('span', null, `${planSportText(workout)} · ${day.date} ${day.weekday}`))),
        h('div', { className: 'gp-plan-pop-kv' },
          h('span', { className: 'k' }, '时长'),
          h('span', { className: 'v' }, duration || '未标注'),
          h('span', { className: 'k' }, '距离'),
          h('span', { className: 'v' }, distance || '未标注'),
          h('span', { className: 'k' }, '完成状态'),
          h('span', { className: `v${workout.completed ? ' done' : ''}` },
            workout.completed ? '已完成' : '未完成'),
          h('span', { className: 'k' }, '来源'),
          h('span', { className: 'v' }, source)),
        h('div', { className: 'gp-plan-pop-acts' },
          h('button', {
            type: 'button',
            className: 'gp-btn primary',
            'data-gp-plan-pop-copy': '1',
            onClick: () => copy(
              planDetailText(day, workout, links, source),
              '已复制',
            ),
          }, '复制详情'),
          h('button', {
            type: 'button',
            className: 'gp-btn',
            'data-gp-plan-pop-ai': '1',
            onClick: () => copy(planAiPrompt(day, workout), '已复制，去 AI 教练提问'),
          }, '问 AI 教练'),
          h('a', {
            className: 'gp-btn link',
            href,
            target: '_blank',
            rel: 'noreferrer',
            'data-gp-plan-pop-open': workout.workoutId != null ? 'workout' : 'calendar',
            'data-gp-plan-open-workout': workout.workoutId != null
              ? String(workout.workoutId)
              : undefined,
            title: workout.workoutId != null
              ? '在 Garmin Connect 打开这节课'
              : '用 Garmin Connect 训练日历安排这节课',
          }, '在 Garmin 打开'),
          h('span', { className: 'sp' }),
          h('button', {
            type: 'button',
            className: 'gp-btn',
            'data-gp-plan-pop-close': '1',
            onClick: () => onClose?.(),
          }, '关闭')))
    }

    /* ---------------- 路书高级 Key（高德 / 行者，可选） ---------------- */
    const AMAP_KEY_URL = 'https://console.amap.com'
    const XINGZHE_KEY_URL = 'https://www.imxingzhe.com/home/#/settings/api'
    const XZ_AUTH_TIMEOUT_SEC = 90
    const XZ_AUTH_POLL_MS = 2000

    /** 后端错误（英文 code / 中文文案）→ 给用户看的中文；未知英文附在兜底文案后 */
    function keysErrorText(value, fallback = '操作失败，请稍后重试') {
      if (value === null || value === undefined) return fallback
      const raw = typeof value === 'string'
        ? value
        : String(value.message || value.error || value.code || '')
      const text = raw.trim()
      if (!text) return fallback
      const table = {
        invalid_key: 'Key 无效，请确认已复制完整且类型正确',
        amap_invalid: '高德 Key 无效，请确认服务平台选择的是「Web服务」',
        amap_key_invalid: '高德 Key 无效，请确认服务平台选择的是「Web服务」',
        amap_quota: '高德 Key 配额不足或权限受限，请到控制台检查',
        quota_exceeded: '请求配额已用尽，请到服务商控制台检查额度',
        missing_key: '请先填写 Key',
        missing_client: '请填写行者应用 ID 和 Secret',
        invalid_client: '行者应用 ID 或 Secret 不正确',
        network_error: '网络连接失败，请检查网络后重试',
        timeout: '请求超时，请稍后重试',
        unauthorized: '授权状态已失效，请重新授权',
        forbidden: '没有访问该接口的权限，请检查 Key 的服务平台与权限',
        not_configured: '尚未配置',
      }
      const key = text.toLowerCase()
      if (table[key]) return table[key]
      if (/[\u4e00-\u9fa5]/.test(text)) return text
      if (/timeout|timed out/i.test(text)) return table.timeout
      if (/network|failed to fetch|load failed|econnrefused|enotfound/i.test(text)) return table.network_error
      if (/quota|rate.?limit|too many/i.test(text)) return table.quota_exceeded
      if (/missing|required|empty/i.test(text)) return table.missing_key
      if (/not.?configured|unconfigured/i.test(text)) return table.not_configured
      if (/invalid.*(key|amap)|amap.*invalid/i.test(text)) return table.amap_invalid
      if (/invalid.*(client|secret|app)|xingzhe.*(invalid|auth)/i.test(text)) return table.invalid_client
      if (/unauthor|forbidden|401|403/i.test(text)) return table.unauthorized
      return `${fallback}（${text}）`
    }

    /** DELETE JSON：返回 body；非 2xx / status:error 抛出可翻译错误 */
    async function rbDelete(path, signal) {
      const res = await fetch(`${RB}/${path}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        signal,
      })
      let data = null
      try { data = await res.json() } catch { data = null }
      if (!res.ok) throw new Error(keysErrorText(data?.error, `HTTP ${res.status}`))
      if (data && data.status && data.status !== 'ok') {
        throw new Error(keysErrorText(data.error, '删除失败，请稍后重试'))
      }
      return data
    }

    /**
     * 高级功能 Key（可选）：高德 Web服务 Key + 行者应用 ID / Secret。
     * variant='onboarding' 时折叠展示；variant='account' 时完整状态 + 行内表单。
     * 只读 GET /roadbook/keys；保存 / 清除后重新 GET 并通知父级刷新路书状态。
     */
    function AdvancedKeysPanel({
      variant = 'account',
      collapsible = false,
      onChanged = null,
      showToast = null,
    }) {
      const isOnb = variant === 'onboarding'
      const [open, setOpen] = React.useState(!collapsible)
      const [version, setVersion] = React.useState(0)
      const enabled = !collapsible || open
      const res = useRbResource('keys', version, enabled)
      const keysData = res.data && typeof res.data === 'object' ? res.data : {}
      const amap = keysData.amap && typeof keysData.amap === 'object' ? keysData.amap : {}
      const xz = keysData.xingzhe && typeof keysData.xingzhe === 'object' ? keysData.xingzhe : {}
      const pending = enabled && !res.data && !res.error
      const loadError = enabled && !res.data
        ? res.error
        : keysData.status && keysData.status !== 'ok'
          ? keysErrorText(keysData.error, '读取配置失败')
          : null

      const [amapValue, setAmapValue] = React.useState('')
      const [amapBusy, setAmapBusy] = React.useState(false)
      const [amapError, setAmapError] = React.useState('')
      const [amapSaved, setAmapSaved] = React.useState(false)
      const [xzId, setXzId] = React.useState('')
      const [xzSecret, setXzSecret] = React.useState('')
      const [xzBusy, setXzBusy] = React.useState(false)
      const [xzError, setXzError] = React.useState('')
      const [xzSaved, setXzSaved] = React.useState(false)
      const [clearBusy, setClearBusy] = React.useState('')
      const [auth, setAuth] = React.useState({ phase: 'idle', waited: 0, error: '' })
      const alive = React.useRef(true)
      const amapAbort = React.useRef(null)
      const xzAbort = React.useRef(null)
      const clearAbort = React.useRef(null)
      const authAbort = React.useRef(null)
      const pollAbort = React.useRef(null)
      const pollTimer = React.useRef(null)
      const pollBusy = React.useRef(false)

      const stopPoll = () => {
        if (pollTimer.current) {
          clearInterval(pollTimer.current)
          pollTimer.current = null
        }
        pollBusy.current = false
      }

      React.useEffect(() => () => {
        alive.current = false
        stopPoll()
        amapAbort.current?.abort()
        xzAbort.current?.abort()
        clearAbort.current?.abort()
        authAbort.current?.abort()
        pollAbort.current?.abort()
      }, [])

      const notifyChanged = () => {
        setVersion((v) => v + 1)
        if (onChanged) onChanged()
      }

      const saveAmap = async (e) => {
        e?.preventDefault?.()
        const value = amapValue.trim()
        if (!value || amapBusy) return
        setAmapBusy(true)
        setAmapError('')
        setAmapSaved(false)
        amapAbort.current?.abort()
        const controller = new AbortController()
        amapAbort.current = controller
        try {
          const body = await rbPost('keys', { amap: value }, controller.signal)
          if (!alive.current) return
          if (!body) throw new Error('服务未返回结果')
          if (body.status && body.status !== 'ok') {
            throw new Error(keysErrorText(body.error, '保存失败，请稍后重试'))
          }
          const result = body.amap && typeof body.amap === 'object' ? body.amap : {}
          notifyChanged()
          if (result.valid === false || result.saved === false) {
            setAmapError(keysErrorText(result.error, 'Key 验证未通过'))
            return
          }
          setAmapValue('')
          setAmapSaved(true)
          showToast?.('高德 Key 已保存并验证通过', 'ok')
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setAmapError(keysErrorText(err?.message, '保存失败，请稍后重试'))
        } finally {
          if (alive.current) setAmapBusy(false)
        }
      }

      const clearAmap = async () => {
        if (clearBusy) return
        setClearBusy('amap')
        setAmapError('')
        setAmapSaved(false)
        clearAbort.current?.abort()
        const controller = new AbortController()
        clearAbort.current = controller
        try {
          const body = await rbDelete('keys/amap', controller.signal)
          if (!alive.current) return
          if (body && body.status && body.status !== 'ok') {
            throw new Error(keysErrorText(body.error, '清除失败，请稍后重试'))
          }
          setAmapValue('')
          notifyChanged()
          showToast?.('已清除高德 Key', 'ok')
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setAmapError(keysErrorText(err?.message, '清除失败，请稍后重试'))
        } finally {
          if (alive.current) setClearBusy('')
        }
      }

      const saveXingzhe = async (e) => {
        e?.preventDefault?.()
        if (xzBusy) return
        const clientId = xzId.trim()
        const secret = xzSecret.trim()
        if (!clientId && !secret) {
          setXzError('请填写行者应用 ID 或 Secret')
          return
        }
        const payload = {}
        if (clientId) payload.xingzheClientId = clientId
        if (secret) payload.xingzheClientSecret = secret
        setXzBusy(true)
        setXzError('')
        setXzSaved(false)
        xzAbort.current?.abort()
        const controller = new AbortController()
        xzAbort.current = controller
        try {
          const body = await rbPost('keys', payload, controller.signal)
          if (!alive.current) return
          if (!body) throw new Error('服务未返回结果')
          if (body.status && body.status !== 'ok') {
            throw new Error(keysErrorText(body.error, '保存失败，请稍后重试'))
          }
          const result = body.xingzhe && typeof body.xingzhe === 'object' ? body.xingzhe : {}
          notifyChanged()
          if (result.error || result.saved === false) {
            setXzError(keysErrorText(result.error, '保存失败，请稍后重试'))
            return
          }
          if (result.configured === false) {
            setXzError('保存未生效，请同时填写应用 ID 和 Secret')
            return
          }
          setXzId('')
          setXzSecret('')
          setXzSaved(true)
          showToast?.('行者应用信息已保存', 'ok')
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setXzError(keysErrorText(err?.message, '保存失败，请稍后重试'))
        } finally {
          if (alive.current) setXzBusy(false)
        }
      }

      const clearXingzhe = async () => {
        if (clearBusy) return
        setClearBusy('xingzhe')
        setXzError('')
        setXzSaved(false)
        clearAbort.current?.abort()
        const controller = new AbortController()
        clearAbort.current = controller
        try {
          const body = await rbDelete('keys/xingzhe', controller.signal)
          if (!alive.current) return
          if (body && body.status && body.status !== 'ok') {
            throw new Error(keysErrorText(body.error, '清除失败，请稍后重试'))
          }
          setXzId('')
          setXzSecret('')
          notifyChanged()
          showToast?.('已清除行者应用信息', 'ok')
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setXzError(keysErrorText(err?.message, '清除失败，请稍后重试'))
        } finally {
          if (alive.current) setClearBusy('')
        }
      }

      const authorize = async () => {
        if (auth.phase === 'starting' || auth.phase === 'waiting') return
        if (!xz.configured) {
          setAuth({ phase: 'error', waited: 0, error: '先保存行者应用 ID 和 Secret，再授权' })
          return
        }
        stopPoll()
        setAuth({ phase: 'starting', waited: 0, error: '' })
        authAbort.current?.abort()
        const controller = new AbortController()
        authAbort.current = controller
        try {
          const response = await fetch(`${RB}/auth-url`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          })
          const body = await response.json().catch(() => null)
          if (!body || !body.url) {
            throw new Error(keysErrorText(body?.message || body?.error, '未能获取行者授权链接'))
          }
          try { window.open(body.url, '_blank') } catch { /* 弹窗被拦截时仍继续轮询 */ }
          if (!alive.current) return
          setAuth({ phase: 'waiting', waited: 0, error: '' })
          let ticks = 0
          pollTimer.current = setInterval(async () => {
            if (!alive.current || pollBusy.current) return
            pollBusy.current = true
            ticks += 1
            try {
              pollAbort.current?.abort()
              const pollController = new AbortController()
              pollAbort.current = pollController
              const response2 = await fetch(`${RB}/auth-status`, {
                headers: { Accept: 'application/json' },
                signal: pollController.signal,
              })
              const status = await response2.json().catch(() => null)
              if (!alive.current) return
              if (status && status.authorized) {
                stopPoll()
                setAuth({ phase: 'ok', waited: ticks * 2, error: '' })
                notifyChanged()
                showToast?.('行者账号已授权', 'ok')
                return
              }
              if (ticks * (XZ_AUTH_POLL_MS / 1000) >= XZ_AUTH_TIMEOUT_SEC) {
                stopPoll()
                setAuth({
                  phase: 'error',
                  waited: ticks * 2,
                  error: `等待授权超时（${XZ_AUTH_TIMEOUT_SEC} 秒），请重试`,
                })
                return
              }
              setAuth({ phase: 'waiting', waited: ticks * 2, error: '' })
            } catch (err) {
              if (err?.name !== 'AbortError' && alive.current) {
                setAuth({ phase: 'waiting', waited: ticks * 2, error: '' })
              }
            } finally {
              pollBusy.current = false
            }
          }, XZ_AUTH_POLL_MS)
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setAuth({ phase: 'error', waited: 0, error: keysErrorText(err?.message, '未能打开行者授权页面') })
        }
      }

      const amapStatus = (() => {
        if (pending) return { cls: '', text: '…' }
        if (!amap.configured) return { cls: '', text: '未配置' }
        if (amap.valid === true) return { cls: 'g', text: '有效' }
        if (amap.valid === false) {
          return { cls: 'r', text: `无效：${keysErrorText(amap.error, '验证未通过')}` }
        }
        return { cls: 'a', text: '已保存' }
      })()
      const xzStatus = pending
        ? { cls: '', text: '…' }
        : xz.configured ? { cls: 'g', text: '已配置' } : { cls: '', text: '未配置' }
      const authText = pending
        ? '…'
        : xz.authorized ? '已授权' : '未授权'
      const authReady = xz.configured === true

      const amapBlock = h('div', { className: 'gp-keys-sec', 'data-gp-keys-amap': '1' },
        h('div', { className: 'gp-keys-hd' },
          h('b', null, '高德 Web服务 Key'),
          h('span', {
            className: `gp-key-pill${amapStatus.cls ? ` ${amapStatus.cls}` : ''}`,
            'data-gp-amap-status': amapStatus.cls || 'off',
          }, amapStatus.text)),
        amap.masked
          ? h('div', { className: 'gp-keys-masked', 'data-gp-amap-masked': '1' }, `已保存：${amap.masked}`)
          : null,
        h('form', { className: 'gp-keys-form', onSubmit: saveAmap, noValidate: true },
          h('input', {
            className: 'gp-input',
            type: 'password',
            value: amapValue,
            placeholder: '32 位 Web服务 Key',
            autoComplete: 'off',
            spellCheck: false,
            'aria-label': '高德 Web服务 Key',
            'data-gp-amap-key-input': '1',
            disabled: amapBusy || clearBusy === 'amap',
            onChange: (e) => {
              setAmapValue(e.target.value)
              setAmapError('')
              setAmapSaved(false)
            },
          }),
          h('button', {
            className: 'gp-btn primary',
            type: 'submit',
            disabled: amapBusy || !amapValue.trim(),
            'data-gp-amap-save': '1',
          }, amapBusy ? '验证中…' : '保存并验证'),
          amap.configured
            ? h('button', {
                className: 'gp-btn',
                type: 'button',
                disabled: !!clearBusy || amapBusy,
                'data-gp-amap-clear': '1',
                onClick: clearAmap,
              }, clearBusy === 'amap' ? '清除中…' : '清除')
            : null),
        h('div', { className: 'gp-keys-links' },
          h('a', { href: AMAP_KEY_URL, target: '_blank', rel: 'noreferrer' }, '获取高德 Key ↗')),
        isOnb
          ? h('div', { className: 'gp-keys-note' }, '创建应用 → 添加 Key → 服务平台选「Web服务」')
          : null,
        amapError
          ? h('div', {
              className: 'gp-keys-err',
              role: 'alert',
              'aria-live': 'assertive',
              'data-gp-amap-error': '1',
            }, amapError)
          : null,
        amapSaved
          ? h('div', {
              className: 'gp-keys-ok',
              role: 'status',
              'aria-live': 'polite',
              'data-gp-amap-ok': '1',
            }, '已保存并验证通过')
          : null)

      const xzBlock = h('div', { className: 'gp-keys-sec', 'data-gp-keys-xingzhe': '1' },
        h('div', { className: 'gp-keys-hd' },
          h('b', null, '行者应用'),
          h('span', {
            className: `gp-key-pill${xzStatus.cls ? ` ${xzStatus.cls}` : ''}`,
            'data-gp-xz-status': xzStatus.cls || 'off',
          }, xzStatus.text)),
        xz.clientIdMasked
          ? h('div', { className: 'gp-keys-masked', 'data-gp-xz-masked': '1' },
              `应用 ID：${xz.clientIdMasked}`)
          : null,
        h('div', { className: 'gp-keys-auth' },
          h('span', null, '授权状态：'),
          h('span', {
            className: `gp-key-pill${xz.authorized ? ' g' : xz.configured ? ' a' : ''}`,
            'data-gp-xz-auth-state': xz.authorized ? 'ok' : xz.configured ? 'pending' : 'off',
          }, authText),
          h('button', {
            className: 'gp-btn',
            type: 'button',
            disabled: !authReady || auth.phase === 'starting' || auth.phase === 'waiting',
            'data-gp-xz-auth': '1',
            onClick: authorize,
          }, auth.phase === 'waiting'
            ? '等待授权…'
            : auth.phase === 'starting' ? '正在打开…' : '授权行者'),
          xz.expiresAt
            ? h('span', { className: 'gp-keys-note' },
                `有效期至 ${stampText(xz.expiresAt) || String(xz.expiresAt)}`)
            : null),
        auth.phase === 'waiting'
          ? h('div', {
              className: 'gp-keys-note',
              role: 'status',
              'aria-live': 'polite',
              'data-gp-xz-auth-wait': '1',
            }, `已打开授权页面，等待授权…（${auth.waited} / ${XZ_AUTH_TIMEOUT_SEC} 秒）`)
          : null,
        auth.error
          ? h('div', {
              className: 'gp-keys-err',
              role: 'alert',
              'data-gp-xz-auth-error': '1',
            }, auth.error)
          : null,
        h('form', { className: 'gp-keys-form', onSubmit: saveXingzhe, noValidate: true },
          h('input', {
            className: 'gp-input',
            type: 'text',
            value: xzId,
            placeholder: '行者应用 ID（Client ID）',
            autoComplete: 'off',
            spellCheck: false,
            'aria-label': '行者应用 ID',
            'data-gp-xz-id-input': '1',
            disabled: xzBusy || clearBusy === 'xingzhe',
            onChange: (e) => {
              setXzId(e.target.value)
              setXzError('')
              setXzSaved(false)
            },
          }),
          h('input', {
            className: 'gp-input',
            type: 'password',
            value: xzSecret,
            placeholder: '行者应用 Secret',
            autoComplete: 'off',
            spellCheck: false,
            'aria-label': '行者应用 Secret',
            'data-gp-xz-secret-input': '1',
            disabled: xzBusy || clearBusy === 'xingzhe',
            onChange: (e) => {
              setXzSecret(e.target.value)
              setXzError('')
              setXzSaved(false)
            },
          }),
          h('button', {
            className: 'gp-btn primary',
            type: 'submit',
            disabled: xzBusy || (!xzId.trim() && !xzSecret.trim()),
            'data-gp-xz-save': '1',
          }, xzBusy ? '保存中…' : '保存'),
          xz.configured
            ? h('button', {
                className: 'gp-btn',
                type: 'button',
                disabled: !!clearBusy || xzBusy,
                'data-gp-xz-clear': '1',
                onClick: clearXingzhe,
              }, clearBusy === 'xingzhe' ? '清除中…' : '清除')
            : null),
        h('div', { className: 'gp-keys-links' },
          h('a', { href: XINGZHE_KEY_URL, target: '_blank', rel: 'noreferrer' }, '打开行者 API 设置 ↗')),
        isOnb
          ? h('div', { className: 'gp-keys-note' }, '保存后可在「路书工坊 → 导入」里点授权')
          : null,
        xzError
          ? h('div', {
              className: 'gp-keys-err',
              role: 'alert',
              'aria-live': 'assertive',
              'data-gp-xz-error': '1',
            }, xzError)
          : null,
        xzSaved
          ? h('div', {
              className: 'gp-keys-ok',
              role: 'status',
              'aria-live': 'polite',
              'data-gp-xz-ok': '1',
            }, '已保存')
          : null)

      const body = h(React.Fragment, null,
        loadError
          ? h('div', {
              className: 'gp-keys-err',
              role: 'alert',
              'data-gp-keys-load-error': '1',
            },
              `配置读取失败：${loadError}`,
              h('button', {
                className: 'gp-btn',
                type: 'button',
                style: { marginLeft: 8 },
                onClick: () => setVersion((v) => v + 1),
              }, '重试'))
          : null,
        amapBlock,
        xzBlock,
        isOnb
          ? h('div', { className: 'gp-keys-actions' },
              h('button', {
                className: 'gp-btn',
                type: 'button',
                'data-gp-onb-keys-later': '1',
                onClick: () => setOpen(false),
              }, '以后再说'),
              h('span', { className: 'gp-keys-note' },
                '不配置也不影响基础数据，之后可在「账号设置」里随时补上。'))
          : null)

      if (!collapsible) {
        return h('div', { className: 'gp-keys', 'data-gp-keys-panel': variant }, body)
      }
      return h('div', { className: 'gp-onb-keys', 'data-gp-onb-keys': open ? '1' : '0' },
        h('button', {
          type: 'button',
          className: 'gp-onb-keys-toggle',
          'aria-expanded': open,
          'aria-controls': 'gp-onb-keys-body',
          'data-gp-onb-keys-toggle': '1',
          onClick: () => setOpen((v) => !v),
        },
          h('span', { className: `caret${open ? ' up' : ''}`, 'aria-hidden': true }, '▸'),
          h('span', null, '路线规划（可选）'),
          h('span', { className: 'gp-onb-tag' }, open ? '可跳过' : '可选')),
        open
          ? h('div', { className: 'gp-keys', id: 'gp-onb-keys-body' }, body)
          : null)
    }

