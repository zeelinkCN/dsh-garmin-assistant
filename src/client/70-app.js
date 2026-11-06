    /* ---------------------------------------------------------------- *
     * 回看 · 顶栏日期导航
     *   ‹ 11-05 周四 ›  [今天]  [回看 11-05]
     * 只负责「选哪一天」：日级接口由 Page 拼进 path，其它请求完全不动。
     * ---------------------------------------------------------------- */
    function DateNav({ selectedDate, todayDate, keyboardEnabled = true, onPick, onToday }) {
      const [open, setOpen] = React.useState(false)
      const rootRef = React.useRef(null)
      const day = dayPart(selectedDate) || dayPart(todayDate) || todayIso()
      const today = dayPart(todayDate) || todayIso()
      const minDay = reviewMinDay(today)
      const reviewing = day !== today
      const canPrev = !!minDay && day > minDay
      const canNext = day < today
      const options = reviewDayOptions(today)

      /* 打开弹层时点外面关闭；Esc 与「选择某一项」的关闭在键盘/点击里处理 */
      React.useEffect(() => {
        if (!open) return undefined
        const onPointerDown = (e) => {
          const root = rootRef.current
          if (root && e?.target && root.contains(e.target)) return
          setOpen(false)
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
      }, [open])

      /* 键盘：[ / ] 前天 / 后一天，Esc 关闭弹层。输入框内一律忽略 */
      React.useEffect(() => {
        if (!keyboardEnabled) return undefined
        const onKeyDown = (e) => {
          if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
          const target = e.target
          const tag = String(target?.tagName || '').toLowerCase()
          if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return
          if (e.key === '[') {
            e.preventDefault()
            if (canPrev) onPick(shiftDay(day, -1))
          } else if (e.key === ']') {
            e.preventDefault()
            if (canNext) onPick(shiftDay(day, 1))
          } else if (e.key === 'Escape' && open) {
            e.preventDefault()
            setOpen(false)
          }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [keyboardEnabled, open, canPrev, canNext, day, onPick])

      return h('div', {
        className: `gp-datenav${reviewing ? ' is-review' : ''}`,
        'data-gp-datenav': '1',
        'data-gp-date-selected': day,
        'data-gp-date-today': today,
        'data-gp-date-min': minDay || '',
        'data-gp-date-reviewing': reviewing ? '1' : '0',
        role: 'group',
        'aria-label': '回看日期导航',
        ref: rootRef,
      },
        h('button', {
          type: 'button',
          className: 'gp-dn-btn',
          'data-gp-date-prev': '1',
          'aria-label': '前一天',
          title: canPrev ? '前一天（快捷键 [）' : `最多回看 ${REVIEW_SPAN} 天`,
          disabled: !canPrev,
          onClick: () => { if (canPrev) onPick(shiftDay(day, -1)) },
        }, '‹'),
        h('button', {
          type: 'button',
          className: `gp-dn-label${open ? ' on' : ''}`,
          'data-gp-date-label': '1',
          'aria-haspopup': 'listbox',
          'aria-expanded': open,
          'aria-label': `当前日期 ${dayText(day)}，点击选择最近 ${REVIEW_SPAN} 天`,
          title: `选择日期（最近 ${REVIEW_SPAN} 天）`,
          onClick: () => setOpen((v) => !v),
        },
          h('b', null, shortDay(day)),
          h('span', { className: 'w' }, dayWeekday(day))),
        h('button', {
          type: 'button',
          className: 'gp-dn-btn',
          'data-gp-date-next': '1',
          'aria-label': '后一天',
          title: canNext ? '后一天（快捷键 ]）' : '已经是今天',
          disabled: !canNext,
          onClick: () => { if (canNext) onPick(shiftDay(day, 1)) },
        }, '›'),
        reviewing
          ? h('button', {
              type: 'button',
              className: 'gp-btn gp-dn-today',
              'data-gp-date-today-btn': '1',
              'aria-label': '回到今天',
              title: '回到今天',
              onClick: () => { setOpen(false); onToday() },
            }, '今天')
          : null,
        reviewing
          ? h('span', {
              className: 'gp-dn-chip',
              'data-gp-date-chip': '1',
              title: '正在回看历史数据',
            }, `回看 ${shortDay(day)}`)
          : null,
        open
          ? h('div', {
              className: 'gp-dn-pop',
              'data-gp-date-pop': '1',
              role: 'listbox',
              'aria-label': `最近 ${REVIEW_SPAN} 天`,
            },
              h('div', { className: 'gp-dn-pop-hd', 'data-gp-date-pop-hd': '1' },
                `最近 ${REVIEW_SPAN} 天（${shortDay(minDay)} → ${shortDay(today)}）`),
              options.map((option) => {
                const isToday = option === today
                const isSelected = option === day
                return h('button', {
                  key: option,
                  type: 'button',
                  role: 'option',
                  'aria-selected': isSelected,
                  className: `gp-dn-opt${isSelected ? ' on' : ''}${isToday ? ' today' : ''}`,
                  'data-gp-date-option': option,
                  'data-gp-date-option-today': isToday ? '1' : '0',
                  'data-gp-date-option-selected': isSelected ? '1' : '0',
                  onClick: () => { setOpen(false); onPick(option) },
                },
                  h('span', { className: 'w' }, dayWeekday(option)),
                  h('span', { className: 'd' }, isToday ? `今天 · ${shortDay(option)}` : shortDay(option)),
                  isSelected ? h('span', { className: 'ck', 'aria-hidden': true }, '✓') : null)
              }))
          : null)
    }

    /* ---------------------------------------------------------------- *
     * 页面
     * ---------------------------------------------------------------- */
    function Page() {
      const [version, setVersion] = React.useState(0)
      const [refreshing, setRefreshing] = React.useState(false)
      const [deviceOpen, setDeviceOpen] = React.useState(false)
      const [deviceVersion, setDeviceVersion] = React.useState(0)
      const [detailId, setDetailId] = React.useState(null)
      const [toast, setToast] = React.useState(null)
      const [layout, setLayout] = React.useState(readLayout2)
      const [editing, setEditing] = React.useState(false)
      const [onboarded, setOnboarded] = React.useState(readOnboarded)
      const [onboardPreview, setOnboardPreview] = React.useState(false)
      const [accountOpen, setAccountOpen] = React.useState(false)
      const [workshopOpen, setWorkshopOpen] = React.useState(false)
      /* 路书服务状态版本：账号设置里保存/清除高级 Key 后 bump，工坊重挂载时取新状态 */
      const [roadbookVersion, setRoadbookVersion] = React.useState(0)
      /* 性别偏好：null = 跟随 /profile；'none' = 用户明确未设置（压过 profile） */
      const [gender, setGender] = React.useState(readStoredGender)
      const [bannerDismissed, setBannerDismissed] = React.useState(false)
      const [drag, setDrag] = React.useState({ id: null, at: null, height: 0 })
      const [cardDrag, setCardDrag] = React.useState({
        sectionId: null, id: null, at: null, height: 0,
      })
      /* 健康趋势的时间范围：7 / 30 天，独立持久化（只影响 /trends 一次请求） */
      const [trendsRange, setTrendsRange] = React.useState(readTrendsRange)
      /* 回看：selectedDate 默认本机今天；只影响日级接口的 path（不改 version） */
      const [todayDate, setTodayDate] = React.useState(todayIso)
      const [selectedDate, setSelectedDate] = React.useState(todayIso)
      const [reviewBannerHidden, setReviewBannerHidden] = React.useState(false)
      const toastTimer = React.useRef(null)
      const deviceAnchor = React.useRef(null)
      const layoutBtn = React.useRef(null)
      const dragIdRef = React.useRef(null)
      const dragAtRef = React.useRef(null)
      const cardDragRef = React.useRef({ sectionId: null, id: null, at: null })

      /* 当前布局 → { id: visible }，同时作为 useResource 的 enabled 开关 */
      const visible = React.useMemo(() => {
        const out = {}
        for (const row of layout) out[row.id] = row.visible !== false
        return out
      }, [layout])

      React.useEffect(() => { writeLayout2(layout) }, [layout])

      /* 趋势范围写回 localStorage：刷新后保持 7 / 30 天 */
      React.useEffect(() => {
        try { localStorage.setItem(TRENDS_RANGE_KEY, String(trendsRange)) } catch { /* ignore */ }
      }, [trendsRange])

      const changeTrendsRange = React.useCallback((days) => {
        setTrendsRange(days === 30 ? 30 : 7)
      }, [])

      /* ---------------- 回看：选日期 / 回到今天 ---------------- */
      const reviewing = selectedDate !== todayDate

      /* 任何入口（箭头 / 弹层 / 快捷键 / 横幅）都走这里：夹到 30 天窗口内，
         并顺手刷新「今天」——页面跨过午夜后箭头边界依然正确 */
      const pickDate = React.useCallback((day) => {
        const now = todayIso()
        const next = clampReviewDay(day, now)
        setTodayDate(now)
        setSelectedDate((cur) => (cur === next ? cur : next))
        setReviewBannerHidden(false)
      }, [])

      const goToday = React.useCallback(() => {
        const now = todayIso()
        setTodayDate(now)
        setSelectedDate(now)
        setReviewBannerHidden(false)
      }, [])

      /* 日期一变，横幅重新出现（隐藏只针对当次回看） */
      React.useEffect(() => { setReviewBannerHidden(false) }, [selectedDate])

      /* 日级接口共用的 query：只有这些接口跟随 selectedDate */
      const dateQuery = `date=${encodeURIComponent(selectedDate)}`

      /* 布局改动立即写回 localStorage（无独立保存步骤） */
      const applyLayout = React.useCallback((next) => {
        if (!next) return
        setLayout(next)
        writeLayout2(next)
      }, [])

      const removeSection = React.useCallback((id) => {
        const next = hideInLayout(layout, id)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const addSection = React.useCallback((id) => {
        const next = appendToLayout(layout, id)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const removeCard = React.useCallback((sectionId, cardId) => {
        const next = hideCard(layout, sectionId, cardId)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const addCard = React.useCallback((sectionId, cardId) => {
        const next = showCard(layout, sectionId, cardId)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const clearCardDrag = React.useCallback(() => {
        cardDragRef.current = { sectionId: null, id: null, at: null }
        setCardDrag({ sectionId: null, id: null, at: null, height: 0 })
      }, [])

      const clearDrag = React.useCallback(() => {
        dragIdRef.current = null
        dragAtRef.current = null
        setDrag({ id: null, at: null, height: 0 })
      }, [])

      const exitEdit = React.useCallback(() => {
        clearDrag()
        clearCardDrag()
        setEditing(false)
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => layoutBtn.current?.focus?.())
        }
      }, [clearDrag, clearCardDrag])

      const toggleEditing = React.useCallback(() => {
        if (editing) { exitEdit(); return }
        /* 编辑态下抽屉/设备浮层会挡操作，进入前先收起 */
        setDeviceOpen(false)
        setDetailId(null)
        clearDrag()
        clearCardDrag()
        setEditing(true)
      }, [editing, exitEdit, clearDrag, clearCardDrag])

      /* Esc 退出编辑 */
      React.useEffect(() => {
        if (!editing) return undefined
        const onKeyDown = (e) => {
          if (e.key !== 'Escape') return
          e.preventDefault()
          exitEdit()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [editing, exitEdit])

      const beginDrag = React.useCallback((e, id) => {
        if (!editing || cardDragRef.current.id) return
        dragIdRef.current = id
        dragAtRef.current = null
        let height = 0
        try { height = Math.round(e.currentTarget.getBoundingClientRect().height) } catch { height = 0 }
        setDrag({ id, at: null, height: height > 0 ? height : 0 })
        try {
          const dt = e.dataTransfer
          if (dt) {
            dt.effectAllowed = 'move'
            dt.setData('text/plain', id)
            dt.setData('application/x-gp-section', id)
          }
        } catch { /* 个别环境不允许写自定义 MIME */ }
      }, [editing])

      const overSlot = React.useCallback((e, index) => {
        if (cardDragRef.current.id || !dragIdRef.current) return
        e.preventDefault()
        try { if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' } catch { /* ignore */ }
        const rect = e.currentTarget.getBoundingClientRect()
        const at = e.clientY > rect.top + rect.height / 2 ? index + 1 : index
        if (dragAtRef.current !== at) {
          dragAtRef.current = at
          setDrag((d) => (d.id ? { ...d, at } : d))
        }
      }, [])

      const overGhost = React.useCallback((e) => {
        if (cardDragRef.current.id || !dragIdRef.current) return
        e.preventDefault()
        try { if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' } catch { /* ignore */ }
      }, [])

      const dropAt = React.useCallback((e, at) => {
        if (cardDragRef.current.id) return
        e.preventDefault()
        const id = dragIdRef.current
        const target = at !== null && at !== undefined ? at : dragAtRef.current
        dragIdRef.current = null
        dragAtRef.current = null
        setDrag({ id: null, at: null, height: 0 })
        if (!id || target === null || target === undefined) return
        const next = reorderLayout(layout, id, target)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout])

      const dropSlot = React.useCallback((e, index) => {
        if (cardDragRef.current.id) return
        if (dragAtRef.current === null) {
          const rect = e.currentTarget.getBoundingClientRect()
          dragAtRef.current = e.clientY > rect.top + rect.height / 2 ? index + 1 : index
        }
        dropAt(e, dragAtRef.current)
      }, [dropAt])

      const endDrag = React.useCallback(() => { clearDrag() }, [clearDrag])

      /* ---- 卡片拖拽：作用域限定在 sectionId 内，拖到别的板块不生效 ---- */
      const beginCardDrag = React.useCallback((e, sectionId, cardId) => {
        if (!editing) return
        /* 卡片在区块槽内部：必须阻止 dragstart 冒泡，否则会同时触发区块拖拽 */
        e.stopPropagation()
        const cards = cardsOf(layout, sectionId)
        const fromVisible = cards.filter((card) => card.visible !== false)
          .findIndex((card) => card.id === cardId)
        if (fromVisible < 0) return
        let height = 0
        try { height = Math.round(e.currentTarget.getBoundingClientRect().height) } catch { height = 0 }
        cardDragRef.current = { sectionId, id: cardId, at: null }
        dragIdRef.current = null
        dragAtRef.current = null
        setDrag({ id: null, at: null, height: 0 })
        setCardDrag({ sectionId, id: cardId, at: null, height: height > 0 ? height : 0 })
        try {
          const dt = e.dataTransfer
          if (dt) {
            dt.effectAllowed = 'move'
            dt.setData('text/plain', `${sectionId}:${cardId}`)
            dt.setData('application/x-gp-card', `${sectionId}:${cardId}`)
          }
        } catch { /* 个别环境不允许写自定义 MIME */ }
      }, [editing, layout])

      const overCardSlot = React.useCallback((e, sectionId, index) => {
        const current = cardDragRef.current
        if (!current.id || current.sectionId !== sectionId) return
        e.preventDefault()
        e.stopPropagation()
        try { if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' } catch { /* ignore */ }
        if (index === undefined || index === null) return
        const rect = e.currentTarget.getBoundingClientRect()
        const at = e.clientY > rect.top + rect.height / 2 ? index + 1 : index
        if (current.at !== at) {
          current.at = at
          setCardDrag((d) => (d.id ? { ...d, at } : d))
        }
      }, [])

      const dropCard = React.useCallback((e, sectionId, at) => {
        const current = cardDragRef.current
        if (!current.id || current.sectionId !== sectionId) return
        e.preventDefault()
        e.stopPropagation()
        const target = at !== null && at !== undefined ? at : current.at
        const cardId = current.id
        clearCardDrag()
        if (target === null || target === undefined) return
        const visibleCards = cardsOf(layout, sectionId).filter((card) => card.visible !== false)
        const fromVisible = visibleCards.findIndex((card) => card.id === cardId)
        if (fromVisible < 0) return
        const next = moveCard(layout, sectionId, fromVisible, target)
        if (next !== layout) applyLayout(next)
      }, [layout, applyLayout, clearCardDrag])

      const endCardDrag = React.useCallback(() => { clearCardDrag() }, [clearCardDrag])

      const show = (id) => visible[id] !== false

      /* 连接状态决定首屏：none → 向导；official 且未进阶 → 解锁卡片 */
      const setup = useResource('setup/status', version)
      const setupData = setup.data && typeof setup.data === 'object' ? setup.data : null
      const setupMode = typeof setupData?.mode === 'string' ? setupData.mode : null
      const advanced = setupData?.advanced === true
      const gated = setupMode === 'official' && !advanced

      /* 性别：本地有值就不再请求 /profile；未设置时用 /profile 兜底。
         'none' 表示用户明确选择「未设置」，此时不再回退 profile。 */
      const profileRes = useResource('profile', version, gender === null)
      const profileGender = normalizeGender(profileRes.data?.gender)
      const effectiveGender = gender === 'none'
        ? null
        : (gender === 'female' || gender === 'male' ? gender : profileGender)
      /* 区块可用性：plan 仅进阶模式；womens 仅女性。不可用时既不渲染，也不出现在个性化列表里 */
      const sectionAvailable = (id) => {
        if (id === 'plan') return advanced === true
        if (id === 'womens') return effectiveGender === 'female'
        return true
      }

      /* 迁移：可用但布局里还没有的新区块（plan / womens）按默认顺序补成可见行 */
      const missingSections = React.useMemo(() => {
        const ids = []
        if (advanced && !sectionRowOf(layout, 'plan')) ids.push('plan')
        if (effectiveGender === 'female' && !sectionRowOf(layout, 'womens')) ids.push('womens')
        return ids
      }, [advanced, effectiveGender, layout])
      React.useEffect(() => {
        if (!missingSections.length) return
        let next = layout
        for (const id of missingSections) next = insertSectionByDefault(next, id)
        if (next !== layout) applyLayout(next)
      }, [missingSections, layout, applyLayout])

      /* 恢复默认：稳定区块 + 当前可用的 plan / womens（同步写回，避免先闪一下） */
      const resetLayout = React.useCallback(() => {
        let next = defaultLayout()
        if (advanced) next = insertSectionByDefault(next, 'plan')
        if (effectiveGender === 'female') next = insertSectionByDefault(next, 'womens')
        applyLayout(next)
        clearLegacyLayout()
      }, [applyLayout, advanced, effectiveGender])

      /* 账号状态：顶栏提醒点与账号设置弹窗共用（服务端 /account 可能暂不可用，回退 setup/status） */
      const accountRes = useResource('account', version)
      const accountData = accountRes.data && typeof accountRes.data === 'object' ? accountRes.data : null

      const coachVisible = show('coach')
      /* 卡片级可见性：AI 板块的两个角色可以各自隐藏；两个都藏起来就不发 status 请求 */
      const coachCards = cardsOf(layout, 'coach')
      const coachRoles = coachCards
        .filter((card) => card.visible !== false)
        .map((card) => card.id)
      const coachRolesKey = coachRoles.join(',')
      const coachRoleVisible = coachRoles.length > 0

      /* 活动板块拆成「列表 / 月度分布」两张卡，任一张可见才发请求 */
      const activityCards = cardsOf(layout, 'activities')
      const activityCardVisible = (id) =>
        activityCards.some((card) => card.id === id && card.visible !== false)
      const activityListVisible = activityCardVisible('list')
      const activityMonthVisible = activityCardVisible('month')
      const activitiesVisible = show('activities') && (activityListVisible || activityMonthVisible)

      /* 进阶数据只在账号登录（advanced）时参与渲染与请求 */
      const advancedVisible = advanced && show('advanced')

      /* 隐藏的区块不发请求；snapshot 被 kpi/body 共用，extras 被 extras/records/advanced 共用。
         只有日级接口带 date=selectedDate：日期变化 = path 变化 → 仅这些资源重取。 */
      const snapshot = useResource(`snapshot?${dateQuery}`, version, show('kpi') || show('body'))
      const sleep = useResource(`sleep?days=7&${dateQuery}`, version, show('sleep'))
      /* 健康趋势：区块隐藏或 10 张卡全隐藏时不发请求；7/30 天只改这一个接口 */
      const trendCardVisible = cardsOf(layout, 'trends').some((card) => card.visible !== false)
      const trendsVisible = show('trends') && trendCardVisible
      const trendsRes = useResource(`trends?days=${trendsRange}&${dateQuery}`, version, trendsVisible)
      /* 睡眠规律性：趋势区块可见就复用它（30 天取最后 7 行，避免重复请求），
         否则由睡眠区块自己拉一次 trends?days=7 */
      const sleepRegularityOwn = useResource(`trends?days=7&${dateQuery}`, version,
        show('sleep') && !trendsVisible)
      const sleepRegularityData = trendsVisible ? trendsRes.data : sleepRegularityOwn.data
      const sleepRegularityRows = trendRowsOf(sleepRegularityData).slice(-7)
      const sleepRegularityLoading = trendsVisible
        ? trendsRes.loading && !trendsRes.data
        : sleepRegularityOwn.loading && !sleepRegularityOwn.data
      const load = useResource(`load?days=30&${dateQuery}`, version, show('load') || advancedVisible)
      const activities = useResource(`activities?limit=20&${dateQuery}`, version, activitiesVisible)
      /* 训练计划：仅进阶模式 + 区块可见 + 至少一张卡可见时才请求 */
      const planCards = cardsOf(layout, 'plan')
      const planCardVisible = planCards.some((card) => card.visible !== false)
      const planVisible = advanced && show('plan') && planCardVisible
      const plan = useResource('plan', version, planVisible)
      const extras = useResource(`extras?${dateQuery}`, version,
        show('extras') || show('records') || advancedVisible)
      const auth = useResource('login/status', version)
      const devices = useResource('devices', `${version}:${deviceVersion}`)
      const deviceList = Array.isArray(devices.data?.devices) ? devices.data.devices : null

      /* 月度分布：月份跟随快照日期（没有快照就用本机今天） */
      const snapshotDay = firstOf(dayPart(snapshot.data?.date), isoDay(new Date()))
      const monthKey = snapshotDay.slice(0, 7)
      /* 女性健康：仅 female + 区块/卡片可见时请求。
         日期跟快照走；快照未就绪前不发请求，避免 date 从「本机今天」跳变导致重复请求 */
      const womensCards = cardsOf(layout, 'womens')
      const womensCardVisible = womensCards.some((card) => card.visible !== false)
      const womensDay = dayPart(snapshot.data?.date) || (snapshot.loading ? null : isoDay(new Date()))
      const womensPath = womensDay ? `womens?date=${womensDay}` : null
      const womensOn = effectiveGender === 'female' && show('womens') && womensCardVisible && !!womensPath
      const womens = useResource(womensPath, version, womensOn)
      const monthVisibleNow = show('activities') && activityMonthVisible
      const calendar = useResource(`activities/calendar?month=${monthKey}`, version, monthVisibleNow)
      // 本月还没有活动时，自动回退到最近有活动的上一个月（最多回退 2 个月）
      const primaryEmpty = !calendar.loading && !calendar.error && (calendar.data?.totals?.count ?? 0) === 0
      const prevMonthKey = shiftMonthKey(monthKey, -1)
      const calendarPrev = useResource(
        `activities/calendar?month=${prevMonthKey}`,
        version,
        monthVisibleNow && primaryEmpty,
      )
      const prevHasData = (calendarPrev.data?.totals?.count ?? 0) > 0
      const previousTwoKey = shiftMonthKey(monthKey, -2)
      const calendarPrevTwo = useResource(
        `activities/calendar?month=${previousTwoKey}`,
        version,
        monthVisibleNow && primaryEmpty && !calendarPrev.loading && !prevHasData,
      )
      const prevTwoHasData = (calendarPrevTwo.data?.totals?.count ?? 0) > 0
      const displayCalendar = prevHasData
        ? calendarPrev.data
        : (prevTwoHasData ? calendarPrevTwo.data : calendar.data)
      const displayMonthKey = prevHasData
        ? prevMonthKey
        : (prevTwoHasData ? previousTwoKey : monthKey)
      const displayCalendarLoading = calendar.loading
        || (primaryEmpty && (calendarPrev.loading || (!prevHasData && calendarPrevTwo.loading)))
      const calendarNote = displayMonthKey !== monthKey ? '本月暂无活动 · 显示最近有活动的月份' : null

      /* 活动平铺：近 30 天最多 12 条；只有户外候选才懒加载轨迹（并发 ≤ 3） */
      const tileList = React.useMemo(
        () => recentActivityTiles(activities.data, snapshotDay),
        [activities.data, snapshotDay],
      )
      const trackIds = React.useMemo(
        () => (advanced ? tileList.filter(gpsCandidate).map((a) => String(a.id)) : []),
        [tileList, advanced],
      )
      const tracks = useActivityTracks(
        trackIds,
        advanced && show('activities') && activityListVisible,
        version,
      )

      const reload = React.useCallback(() => setVersion((v) => v + 1), [])
      const unlock = useUnlockFlow(reload)

      /* 新手引导：首次整页 / 仪表盘重看浮层；两条路径都不动已保存的 Key */
      const finishOnboarding = React.useCallback(() => {
        markOnboarded()
        setOnboarded(true)
      }, [])
      const keySaved = React.useCallback(() => {
        markOnboarded()
        setOnboarded(true)
        // 关键：version bump 让 setup/status 与所有资源重新拉取，
        // 官方模式（mode:'official'）下仪表盘会直接替换向导，无需整页刷新。
        reload()
      }, [reload])
      const openOnboarding = React.useCallback(() => {
        setDeviceOpen(false)
        setDetailId(null)
        if (editing) exitEdit()
        setOnboardPreview(true)
      }, [editing, exitEdit])
      const bumpRoadbook = React.useCallback(() => setRoadbookVersion((v) => v + 1), [])
      /* 路书工坊「去设置」：关掉整页工坊，直接打开账号设置里的高级 Key 区块 */
      const openAccountFromWorkshop = React.useCallback(() => {
        setWorkshopOpen(false)
        setAccountOpen(true)
      }, [])

      /* 两个 AI 角色的结果放在 Page 层，隐藏/显示区块不丢缓存，切换 tab 不重算。
         生成时把 selectedDate 作为 {date} 传给后端：回看就分析那一天。 */
      const coachApi = useCoachRoles({
        date: selectedDate,
        enabled: coachVisible && coachRoleVisible,
        version,
      })

      /* 当前激活角色被隐藏时，自动切到剩下的那个；两个都隐藏则交给「全部隐藏」提示 */
      React.useEffect(() => {
        if (!coachRoles.length) return
        if (!coachRoles.includes(coachApi.tab)) coachApi.setTab(coachRoles[0])
      }, [coachRolesKey, coachApi.tab, coachApi.setTab])

      const refresh = React.useCallback(() => {
        setRefreshing(true)
        fetch(`${API}/refresh`, { method: 'POST' })
          .catch(() => {})
          .finally(() => { setRefreshing(false); setVersion((v) => v + 1) })
      }, [])

      const showToast = React.useCallback((msg, kind = 'ok') => {
        setToast({ msg, kind })
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 2600)
      }, [])
      React.useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

      /* 性别保存：写 localStorage → 立即重算可见性（无需整页刷新）→ 版本 bump 重取数据 */
      const saveGender = React.useCallback((value) => {
        const next = writeStoredGender(value)
        /* 未设置：清空本地偏好，本次会话立即隐藏；下次加载回退 /profile */
        setGender(next || 'none')
        showToast(next ? '性别已保存，正在刷新…' : '已设为未设置，女性健康区块已隐藏', 'ok')
        reload()
      }, [reload, showToast])

      const snap = snapshot.data
      const unauth =
        (snap && snap.status === 'unauthenticated') || (auth.data && auth.data.authed === false)
      const kpi = snap?.kpi ?? {}
      const today = snap?.today ?? {}
      const recovery = snap?.recovery ?? {}

      /* 账号视图：/account 优先，缺失字段回退 setup/status（老后端也能显示大部分状态） */
      const acct = {
        mode: accountData?.mode ?? setupMode,
        advanced: typeof accountData?.advanced === 'boolean' ? accountData.advanced : advanced,
        hasKey: typeof accountData?.hasKey === 'boolean' ? accountData.hasKey
          : typeof setupData?.hasKey === 'boolean' ? setupData.hasKey : null,
        keyValid: typeof accountData?.keyValid === 'boolean' ? accountData.keyValid
          : typeof setupData?.keyValid === 'boolean' ? setupData.keyValid : null,
        ssoAuthed: typeof accountData?.ssoAuthed === 'boolean' ? accountData.ssoAuthed
          : typeof setupData?.ssoAuthed === 'boolean' ? setupData.ssoAuthed : null,
        mcpInstalled: typeof accountData?.mcpInstalled === 'boolean' ? accountData.mcpInstalled
          : typeof setupData?.mcpInstalled === 'boolean' ? setupData.mcpInstalled : null,
        keyUpdatedAt: firstOf(accountData?.keyUpdatedAt, accountData?.keyUpdatedAtMs),
        tokenUpdatedAt: firstOf(accountData?.tokenUpdatedAt, accountData?.tokenUpdated),
        tokenAgeDays: numOf(accountData?.tokenAgeDays),
        tokenExpiresEstimate: accountData?.tokenExpiresEstimate ?? null,
        reasons: Array.isArray(accountData?.reasons) ? accountData.reasons : [],
        needsAttention: accountData?.needsAttention === true,
      }
      /* 任一区块返回 unauthenticated / 已配置的 Key 失效 → 顶部琥珀横幅（授权问题） */
      const sectionUnauth = [snapshot.data, sleep.data, activities.data, extras.data, load.data]
        .some((row) => row && row.status === 'unauthenticated')
      const keyBroken = acct.keyValid === false && acct.hasKey === true
      const authBroken = unauth || sectionUnauth || keyBroken
      /* 顶栏提醒点更宽：后端 needsAttention 还包含「没配 Key」「组件未装」等可优化项 */
      const needsAttention = acct.needsAttention || authBroken

      const insights = []
      if (load.data?.current) {
        const c = load.data.current
        if (c.acwr > 1.5) insights.push(['warn', '负荷偏高', `ACWR ${c.acwr}（${c.acwrStatus}），急性负荷 ${c.atl} 远高于慢性 ${c.ctl}，TSB ${c.tsb}。建议减量并补 Z2 有氧。`])
        else if (c.acwr < 0.8) insights.push(['warn', '负荷偏低', `ACWR ${c.acwr}，近期训练量不足，可逐步加量。`])
      }
      if (kpi.sleep && kpi.sleep.score >= 80) insights.push(['good', '睡眠良好', `昨夜 ${kpi.sleep.hours}h / ${kpi.sleep.score} 分，深睡 ${kpi.sleep.deepPct}%，HRV ${kpi.sleep.hrv}ms。`])
      if (kpi.rhr && kpi.rhr.avg7 && kpi.rhr.value <= kpi.rhr.avg7 - 5) insights.push(['good', '静息心率走低', `今日 ${kpi.rhr.value} bpm，比 7 日均值 ${kpi.rhr.avg7} 低 ${kpi.rhr.avg7 - kpi.rhr.value}，恢复信号好。`])
      if (kpi.intensity && kpi.intensity.total < kpi.intensity.goal * 0.5) insights.push(['bad', '强度分钟落后', `本周 ${kpi.intensity.total}/${kpi.intensity.goal} 分钟，进度偏慢。`])

      /* setup/status 返回之前只显示居中骨架，绝不先闪一下空仪表盘 */
      if (!setupData && !setup.error) {
        return h('div', { className: 'gp-root' },
          h('style', null, CSS),
          h('div', { className: 'gp-boot' },
            h('div', { className: 'gp-spin', 'aria-hidden': true }),
            h('div', { className: 'gp-boot-text' }, '正在读取连接状态…')))
      }

      /* 没 Key 也没登录：整页引导（点过「先跳过」后不再挡路） */
      if (setupMode === 'none' && !onboarded) {
        return h('div', { className: 'gp-root' },
          h('style', null, CSS),
          h(Onboarding, {
            flow: unlock,
            onSaved: keySaved,
            onDismiss: finishOnboarding,
          }))
      }

      const loadLocked = gated || load.data?.status === 'advanced_required'

      /* 每个区块独立成节点，按 layout 顺序渲染；隐藏的区块根本不会挂载 */
      const section = (id, ...children) =>
        h('div', { key: id, className: 'gp-section', 'data-gp-section': id }, ...children)

      const sectionNodes = {}
      const cardNodes = { kpi: {}, body: {}, womens: {}, trends: {}, load: {}, advanced: {}, extras: {}, coach: {}, plan: {}, activities: {} }
      /* 回看时给区块标题补日期锚点：当日类「· 11-05」，区间类「· 截至 11-05」。
         今天（默认）完全不加，标题文案保持原样。 */
      const reviewDay = reviewing ? shortDay(selectedDate) : null
      const dayTitle = (text, kind = 'day') => (reviewDay
        ? h(React.Fragment, null, text,
            h('span', {
              className: 'gp-sec-day',
              'data-gp-sec-day': '1',
              'data-gp-sec-anchor': kind,
            }, kind === 'until' ? ` · 截至 ${reviewDay}` : ` · ${reviewDay}`))
        : text)
      /* 一个板块的卡片区：顺序 / 显隐来自 layout，nodes 是按 id 建好的卡片元素 */
      const gridFor = (id, className) => h(CardGrid, {
        sectionId: id,
        className,
        cards: cardsOf(layout, id),
        nodes: cardNodes[id],
        editing,
        drag: cardDrag,
        onDragStart: beginCardDrag,
        onDragOver: overCardSlot,
        onDrop: dropCard,
        onDragEnd: endCardDrag,
        onRemove: removeCard,
        onAdd: addCard,
      })

      /* 1 训练准备度：270° 弧形仪表 */
      cardNodes.kpi.readiness = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'readiness' },
            h('div', { className: 'k' }, '训练准备度'),
            snapshot.loading
              ? h(KpiSkel, { height: 88 })
              : h('div', { className: 'viz' },
                  h(ReadinessGauge, {
                    score: kpi.readiness?.score,
                    level: kpi.readiness?.level,
                  })),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : kpi.readiness
                  ? (kpi.readiness.feedback || '按今天的状态安排强度')
                  : gated ? '账号登录后显示' : '暂无数据'))

      /* 2 睡眠评分：评分环 + 深睡 / REM / 其余三段内弧 */
      cardNodes.kpi.sleep = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'sleep' },
            h('div', { className: 'k' }, '睡眠评分'),
            snapshot.loading
              ? h(KpiSkel, { height: 78 })
              : h('div', { className: 'viz' },
                  h(SleepDonut, {
                    score: kpi.sleep?.score,
                    qualifier: kpi.sleep?.qualifier,
                    deepPct: kpi.sleep?.deepPct,
                    remPct: kpi.sleep?.remPct,
                  })),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : kpi.sleep
                  ? [
                      h('b', { key: 'h' }, typeof kpi.sleep.hours === 'number'
                        ? clock(kpi.sleep.hours * 3600)
                        : '—'),
                      numOf(kpi.sleep.deepPct) !== null
                        ? h('span', { key: 'd', className: 'lg dg' }, `深睡 ${fmt(kpi.sleep.deepPct)}%`)
                        : null,
                      numOf(kpi.sleep.remPct) !== null
                        ? h('span', { key: 'r', className: 'lg dv' }, `REM ${fmt(kpi.sleep.remPct)}%`)
                        : null,
                      numOf(kpi.sleep.deepPct) !== null && numOf(kpi.sleep.remPct) !== null
                        ? h('span', { key: 'o', className: 'lg dm' },
                            `其余 ${fmt(Math.max(0, 100 - kpi.sleep.deepPct - kpi.sleep.remPct))}%`)
                        : null,
                    ]
                  : '—'))

      /* 3 Body Battery：电池外形 + 充 / 耗数字 + 当日迷你曲线（懒加载） */
      cardNodes.kpi.battery = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'battery' },
            h('div', { className: 'k' }, 'Body Battery'),
            snapshot.loading
              ? h(KpiSkel, { height: 62 })
              : h('div', { className: 'viz' },
                  h(BatteryGauge, {
                    current: kpi.bodyBattery?.current,
                    charged: kpi.bodyBattery?.charged,
                    drained: kpi.bodyBattery?.drained,
                    /* 有当日曲线时电池图形收窄，整卡高度仍保持在 KPI 行高内 */
                    height: 42,
                  })),
            snapshot.loading
              ? null
              : h(BodyBatterySpark, { enabled: show('kpi'), date: selectedDate, version }),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : kpi.bodyBattery?.highest != null
                  ? `今日峰值 ${fmt(kpi.bodyBattery.highest)}`
                  : '满电 100'))

      /* 4 静息心率：今日 vs 7 日均值的迷你柱状对比 */
      cardNodes.kpi.rhr = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'rhr' },
            h('div', { className: 'k' },
              '静息心率',
              h('svg', {
                viewBox: '0 0 26 12', width: 26, height: 12, 'aria-hidden': true,
                style: { marginLeft: 6, opacity: 0.7 },
              }, h('path', {
                d: 'M0 6h4l2-4 3 8 2-5 2 3h3l2-4 2 8 2-6h2',
                fill: 'none', stroke: 'var(--gp-red)', strokeWidth: 1.5,
                strokeLinejoin: 'round', strokeLinecap: 'round',
              }))),
            snapshot.loading
              ? h(KpiSkel, { height: 82 })
              : h('div', { className: 'viz col' },
                  h('div', { className: 'rhr-row' },
                    h('span', { className: 'num' }, fmt(kpi.rhr?.value),
                      h('small', null, 'bpm')),
                    rhrDelta(kpi.rhr?.value, kpi.rhr?.avg7)),
                  h(RhrTrend, {
                    value: kpi.rhr?.value,
                    avg7: kpi.rhr?.avg7,
                    series: kpi.rhr?.series,
                  })),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : kpi.rhr?.avg7 && kpi.rhr?.value != null
                  ? (kpi.rhr.value === kpi.rhr.avg7
                    ? `与 7 日均值持平（${fmt(kpi.rhr.avg7)}）`
                    : `比 7 日均值（${fmt(kpi.rhr.avg7)}）${kpi.rhr.value < kpi.rhr.avg7 ? '低' : '高'} ${fmt(Math.abs(kpi.rhr.value - kpi.rhr.avg7))} bpm`)
                  : kpi.rhr?.avg7 ? `7 日均值 ${fmt(kpi.rhr.avg7)}` : '—'))

      /* 5 本周强度分钟：朝 150 分钟目标推进的圆环 */
      cardNodes.kpi.intensity = h('div', { className: 'gp-card gp-kpi', 'data-gp-kpi': 'intensity' },
            h('div', { className: 'k' }, '本周强度分钟'),
            snapshot.loading
              ? h(KpiSkel, { height: 78 })
              : h('div', { className: 'viz' },
                  h(IntensityRing, {
                    total: kpi.intensity?.total,
                    goal: kpi.intensity?.goal,
                  })),
            h('div', { className: 'sub' },
              snapshot.loading
                ? ''
                : typeof kpi.intensity?.total !== 'number'
                  ? '—'
                  : kpi.intensity.total >= (kpi.intensity.goal || 150)
                    ? '已达成本周目标'
                    : `还差 ${fmt((kpi.intensity.goal || 150) - kpi.intensity.total)} 分钟`))

      sectionNodes.kpi = section('kpi',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('今日状态')),
          h('span', { className: 'hint' }, '能不能练 · 恢复够不够'),
          h('span', { className: 'sp' }, snap?.date ?? '')),
        gridFor('kpi', 'gp-kpis'))

      /* 今天身体：7 张卡在 3 列网格里重排，恢复卡不再单独占右侧 */
      cardNodes.body.steps = h('div', { className: 'gp-card' },
              h('h3', null, '步数'),
              today.steps
                ? h('div', { style: { display: 'flex', gap: 12, alignItems: 'center' } },
                    h(StepsRing, { value: today.steps.value, goal: today.steps.goal }),
                    h('div', { className: 'gp-mini' },
                      h('div', null, '距离 ', h('b', null, `${((today.steps.distanceM || 0) / 1000).toFixed(2)} km`)),
                      h('div', { style: { marginTop: 4 } }, '楼层 ', h('b', null, fmt(today.floors, 1)))))
                : h(Skel, { h: 76 }))

      cardNodes.body.calories = h('div', { className: 'gp-card' },
              h('h3', null, '能量消耗'),
              today.calories
                ? h('div', null,
                    h('div', { className: 'v', style: { fontSize: 24, fontWeight: 700 } },
                      fmt(today.calories.total), h('small', { style: { fontSize: 12, color: 'var(--gp-t3)', marginLeft: 4 } }, 'kcal')),
                    h('div', { className: 'gp-mini', style: { marginTop: 8 } },
                      `活动 ${fmt(today.calories.active)} · 静息 ${fmt(today.calories.rest)}`))
                : h(Skel, { h: 60 }))

      cardNodes.body.stress = h('div', { className: 'gp-card' },
              h('h3', null, '压力'),
              today.stress
                ? h('div', null,
                    h('div', { style: { display: 'flex', gap: 8, alignItems: 'baseline' } },
                      h('div', { style: { fontSize: 24, fontWeight: 700 } }, fmt(today.stress.avg)),
                      h('span', { className: 'gp-pill g' }, today.stress.qualifier || '')),
                    h('div', { className: 'gp-mini', style: { marginTop: 6 } }, `峰值 ${fmt(today.stress.max)}`))
                : h(Skel, { h: 60 }))

      cardNodes.body.hr = h('div', { className: 'gp-card' },
              h('h3', null, '心率'),
              today.hr
                ? h('div', null,
                    h(Row, { lab: '静息', val: fmt(today.hr.rest), pct: 15, color: 'var(--gp-green)' }),
                    h(Row, { lab: '平均', val: fmt(today.hr.avg), pct: 35, color: 'var(--gp-blue)' }),
                    h(Row, { lab: '最高', val: fmt(today.hr.max), pct: 70, color: 'var(--gp-red)' }))
                : h(Skel, { h: 60 }))

      cardNodes.body.breath = h('div', { className: 'gp-card' },
              h('h3', null, '呼吸 / 血氧'),
              h('div', null,
                today.respiration?.avg
                  ? h(Row, { lab: '呼吸', val: `${today.respiration.avg}/min`, pct: 60, color: 'var(--gp-violet)' })
                  : h('div', { className: 'gp-mini' }, '呼吸数据暂无'),
                today.spo2
                  ? h(Row, { lab: '血氧', val: `${today.spo2.avg}%`, pct: today.spo2.avg, color: 'var(--gp-blue)' })
                  : h('div', { className: 'gp-empty', style: { marginTop: 8, padding: '7px 9px' } },
                      h('b', null, 'SpO₂'), ' 设备今日未记录')))

      cardNodes.body.hydration = h('div', { className: 'gp-card' },
              h('h3', null, '水分'),
              h('div', { style: { fontSize: 24, fontWeight: 700 } },
                fmt(today.hydration?.ml),
                h('small', { style: { fontSize: 12, color: 'var(--gp-t3)', marginLeft: 4 } },
                  `/ ${fmt(today.hydration?.goal)} ml`)),
              h('div', { className: 'gp-bar', style: { marginTop: 8 } },
                h('i', {
                  style: {
                    width: `${clampPct(((today.hydration?.ml || 0) / (today.hydration?.goal || 2500)) * 100)}%`,
                    background: 'var(--gp-blue)',
                  },
                })))

      /* 恢复（训练准备度来自账号登录） */
      cardNodes.body.recovery = gated
            ? h(UnlockCard, { flow: unlock, id: 'recovery', compact: true, hint: '恢复准备度' })
            : h('div', { className: 'gp-card' },
                h('h3', null, '恢复'),
                h('div', { style: { display: 'flex', gap: 8, alignItems: 'baseline' } },
                  h('div', { style: { fontSize: 26, fontWeight: 700 } }, fmt(kpi.readiness?.score)),
                  kpi.readiness
                    ? h('span', { className: `gp-pill ${pillClass(kpi.readiness.score)}` },
                        LEVEL_ZH[kpi.readiness.level] || kpi.readiness.level)
                    : null),
                h('div', { className: 'gp-mini', style: { margin: '4px 0 10px' } },
                  recovery.recoveryHours != null ? `恢复时间 ${recovery.recoveryHours}h` : ''),
                (recovery.factors || []).map(([lab, val], i) =>
                  h(Row, { key: i, lab, val: `${val}%`, pct: val, color: val >= 70 ? 'var(--gp-green)' : val >= 40 ? 'var(--gp-amber)' : 'var(--gp-red)' })),
                h('div', { style: { display: 'flex', gap: 14, marginTop: 12, borderTop: '1px solid var(--gp-line2)', paddingTop: 9 } },
                  h('div', null, h('div', { className: 'gp-mini' }, 'HRV 周均'),
                    h('div', { style: { fontSize: 16, fontWeight: 650 } }, fmt(recovery.hrvWeekly), h('small', { style: { fontSize: 10, color: 'var(--gp-t3)' } }, ' ms'))),
                  h('div', null, h('div', { className: 'gp-mini' }, '恢复倒计时'),
                    h('div', { style: { fontSize: 16, fontWeight: 650 } }, fmt(recovery.recoveryHours), h('small', { style: { fontSize: 10, color: 'var(--gp-t3)' } }, ' h')))))

      sectionNodes.body = section('body',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('今天身体'))),
        gridFor('body', 'gp-grid gp-g3'))

      sectionNodes.sleep = section('sleep',
        h('div', { className: 'gp-sec' }, h('h2', null, '睡眠 · 近 7 晚'),
          reviewDay
            ? h('span', { className: 'hint', 'data-gp-sleep-anchor': '1' },
                `截至 ${reviewDay}`)
            : null,
          h('span', { className: 'sp' }, sleep.data ? `均分 ${fmt(sleep.data.avgScore)}` : '')),
        h('div', { className: 'gp-card' },
          h('h3', null, '每晚阶段与评分'),
          sleep.loading ? h(Skel, { h: 150 }) : h(SleepChart, { data: sleep.data })),
        /* 睡眠规律性：复用 /trends 的 7 晚字段（趋势不可见时自己拉一次） */
        h(SleepRegularity, {
          rows: sleepRegularityRows,
          averages: sleepRegularityData?.averages,
          loading: sleepRegularityLoading,
          nights: Array.isArray(sleep.data?.nights) ? sleep.data.nights.length : null,
        }))

      /* ---------------- 女性健康（仅 female 时挂载） ---------------- */
      const womensData = womens.data && typeof womens.data === 'object' ? womens.data : null
      const womensLoading = (snapshot.loading || womens.loading) && !womensData
      cardNodes.womens.cycle = h(WomensCycleCard, { data: womensData, loading: womensLoading })
      cardNodes.womens.pregnancy = h(WomensPregnancyCard, { data: womensData, loading: womensLoading })
      sectionNodes.womens = effectiveGender === 'female'
        ? section('womens',
            h('div', { className: 'gp-sec', 'data-gp-womens': '1' },
              h('h2', null, '女性健康'),
              h('span', { className: 'hint' }, '周期 · 孕期')),
            gridFor('womens', 'gp-grid gp-g2'))
        : null

      /* ---------------- 健康趋势：10 张紧凑图表卡（7 / 30 天） ---------------- */
      const trendRows = trendRowsOf(trendsRes.data)
      const trendDays = trendsRange
      const trendLoading = trendsRes.loading && !trendsRes.data
      const trendPick = (key) => (row) => numOf(row?.[key])
      const trendAverageOf = (key) => {
        const fromApi = numOf(trendsRes.data?.averages?.[key])
        return fromApi !== null ? fromApi : trendAvg(trendRows, trendPick(key))
      }

      const trendRhrLast = trendLast(trendRows, trendPick('rhr'))
      const trendRhrAvg = trendAverageOf('rhr')
      const trendHrvLast = trendLast(trendRows, trendPick('hrv'))
      const trendHrvAvg = trendAverageOf('hrv')
      const trendSleepScoreLast = trendLast(trendRows, trendPick('sleepScore'))
      const trendSleepScoreAvg = trendAverageOf('sleepScore')
      const trendSleepHoursAvg = trendAverageOf('sleepHours')
      const trendStepsLast = trendLast(trendRows, trendPick('steps'))
      const trendStepsAvg = trendAverageOf('steps')
      const trendStressLast = trendLast(trendRows, trendPick('stress'))
      const trendStressAvg = trendAverageOf('stress')
      const trendRespLast = trendLast(trendRows, trendPick('respiration'))
      const trendRespAvg = trendAverageOf('respiration')
      const trendSpo2Last = trendLast(trendRows, trendPick('spo2'))
      const trendSpo2Min = trendMin(trendRows, trendPick('spo2'))
      const trendBatteryPick = (row) => numOf(row?.bodyBattery?.latest)
      const trendBatteryLast = trendLast(trendRows, trendBatteryPick)
      const trendBatteryBands = trendRows
        .map((row) => row?.bodyBattery)
        .filter((band) => band && numOf(band.min) !== null && numOf(band.max) !== null)
      const trendBatteryMin = trendBatteryBands.length
        ? Math.min(...trendBatteryBands.map((band) => numOf(band.min)))
        : null
      const trendBatteryMax = trendBatteryBands.length
        ? Math.max(...trendBatteryBands.map((band) => numOf(band.max)))
        : null
      const trendIntensityPick = trendPick('intensity')
      const trendIntensityLast = trendLast(trendRows, trendIntensityPick)
      const trendIntensityWeekVals = trendRows.slice(-7)
        .map((row) => trendValue(row, trendIntensityPick))
        .filter((v) => v !== null)
      const trendIntensityWeek = trendIntensityWeekVals.length
        ? trendIntensityWeekVals.reduce((sum, v) => sum + v, 0)
        : null
      const trendIntensityAvg = trendAverageOf('intensity')
      const trendWeightPick = trendPick('weightKg')
      const trendWeightLast = trendLast(trendRows, trendWeightPick)
      const trendWeightFirst = (() => {
        for (const row of trendRows) {
          const v = trendValue(row, trendWeightPick)
          if (v !== null) return v
        }
        return null
      })()
      const trendWeightDelta = trendWeightLast !== null && trendWeightFirst !== null
        ? trendWeightLast - trendWeightFirst
        : null

      cardNodes.trends.rhr = h(TrendCard, {
        id: 'rhr',
        label: '静息心率',
        color: 'var(--gp-red)',
        pill: trendRhrLast !== null ? `${fmt(trendRhrLast)} bpm` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'rhr', label: '静息心率', rows: trendRows, pick: trendPick('rhr'),
          color: 'var(--gp-red)', avg: trendRhrAvg, rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, trendRhrAvg !== null ? `均值 ${fmt(trendRhrAvg)} bpm` : '均值 —'),
          trendDelta(
            trendRhrLast !== null && trendRhrAvg !== null ? trendRhrLast - trendRhrAvg : null,
            'down', 0, '')),
      })

      /* HRV 详情（基线 / 昨夜峰值 / 状态）：snapshot 有就显示，缺了只保留原页脚 */
      const hrvInfo = hrvDetailOf(snap)
      const hrvNote = hrvDetailText(hrvInfo)

      cardNodes.trends.hrv = h(TrendCard, {
        id: 'hrv',
        label: 'HRV',
        color: 'var(--gp-violet)',
        pill: trendHrvLast !== null ? `${fmt(trendHrvLast)} ms` : '—',
        loading: trendLoading,
        footerClass: hrvNote ? 'wrap' : '',
        title: hrvNote || undefined,
        chart: h(TrendChart, {
          id: 'hrv', label: 'HRV', rows: trendRows, pick: trendPick('hrv'),
          color: 'var(--gp-violet)', avg: trendHrvAvg, rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, trendHrvAvg !== null ? `均值 ${fmt(trendHrvAvg)} ms` : '均值 —'),
          trendDelta(
            trendHrvLast !== null && trendHrvAvg !== null ? trendHrvLast - trendHrvAvg : null,
            'up', 0, ' ms'),
          hrvNote
            ? h('span', {
                className: 'gp-trend-note',
                'data-gp-trend-hrv-detail': '1',
              }, hrvNote)
            : null),
      })

      cardNodes.trends.sleep = h(TrendCard, {
        id: 'sleep',
        label: '睡眠',
        color: 'var(--gp-green)',
        pill: trendSleepScoreLast !== null ? `${fmt(trendSleepScoreLast)} 分` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'sleep', label: '睡眠', rows: trendRows,
          pick: trendPick('sleepScore'),
          barsPick: trendPick('sleepHours'),
          barsColor: 'var(--gp-blue)',
          color: 'var(--gp-green)',
          rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `均分 ${trendSleepScoreAvg !== null ? fmt(trendSleepScoreAvg, 1) : '—'}`),
          h('span', null,
            `均时长 ${trendSleepHoursAvg !== null ? `${fmt(trendSleepHoursAvg, 1)}h` : '—'}`)),
      })

      cardNodes.trends.steps = h(TrendCard, {
        id: 'steps',
        label: '步数',
        color: 'var(--gp-blue)',
        pill: trendStepsLast !== null ? fmt(trendStepsLast) : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'steps', label: '步数', rows: trendRows, pick: trendPick('steps'),
          color: 'var(--gp-blue)', kind: 'bar', rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `日均 ${trendStepsAvg !== null ? fmt(trendStepsAvg) : '—'} 步`)),
      })

      cardNodes.trends.stress = h(TrendCard, {
        id: 'stress',
        label: '压力',
        color: 'var(--gp-amber)',
        pill: trendStressLast !== null ? fmt(trendStressLast) : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'stress', label: '压力', rows: trendRows, pick: trendPick('stress'),
          color: 'var(--gp-amber)', avg: trendStressAvg, rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `均值 ${trendStressAvg !== null ? fmt(trendStressAvg) : '—'}`),
          trendDelta(
            trendStressLast !== null && trendStressAvg !== null ? trendStressLast - trendStressAvg : null,
            'down', 0, '')),
      })

      cardNodes.trends.battery = h(TrendCard, {
        id: 'battery',
        label: 'Body Battery',
        color: 'var(--gp-green)',
        pill: trendBatteryLast !== null ? fmt(trendBatteryLast) : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'battery', label: 'Body Battery', rows: trendRows,
          pick: trendBatteryPick,
          bandPick: (row) => row?.bodyBattery,
          color: 'var(--gp-green)', kind: 'band', rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `当前 ${trendBatteryLast !== null ? fmt(trendBatteryLast) : '—'}`),
          trendBatteryMin !== null && trendBatteryMax !== null
            ? h('span', null, `区间 ${fmt(trendBatteryMin)}–${fmt(trendBatteryMax)}`)
            : null),
      })

      cardNodes.trends.respiration = h(TrendCard, {
        id: 'respiration',
        label: '呼吸',
        color: 'var(--gp-violet)',
        pill: trendRespLast !== null ? fmt(trendRespLast, 1) : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'respiration', label: '呼吸', rows: trendRows, pick: trendPick('respiration'),
          color: 'var(--gp-violet)', avg: trendRespAvg, rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null,
            `均值 ${trendRespAvg !== null ? fmt(trendRespAvg, 1) : '—'} 次/分`)),
      })

      cardNodes.trends.spo2 = h(TrendCard, {
        id: 'spo2',
        label: '血氧',
        color: 'var(--gp-blue)',
        pill: trendSpo2Last !== null ? `${fmt(trendSpo2Last)}%` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'spo2', label: '血氧', rows: trendRows, pick: trendPick('spo2'),
          color: 'var(--gp-blue)', avg: trendAvg(trendRows, trendPick('spo2')),
          rangeDays: trendDays, emptyText: '设备未记录',
        }),
        footer: h(React.Fragment, null,
          h('span', null, `最低 ${trendSpo2Min !== null ? `${fmt(trendSpo2Min)}%` : '—'}`)),
      })

      cardNodes.trends.intensity = h(TrendCard, {
        id: 'intensity',
        label: '强度分钟',
        color: 'var(--gp-amber)',
        pill: trendIntensityLast !== null ? `${fmt(trendIntensityLast)} 分钟` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'intensity', label: '强度分钟', rows: trendRows,
          pick: trendIntensityPick, color: 'var(--gp-amber)', kind: 'bar',
          rangeDays: trendDays,
        }),
        footer: h(React.Fragment, null,
          h('span', null, `周合计 ${trendIntensityWeek !== null ? fmt(trendIntensityWeek) : '—'} 分钟`),
          h('span', null, `日均 ${trendIntensityAvg !== null ? fmt(trendIntensityAvg) : '—'} 分钟`)),
      })

      cardNodes.trends.weight = h(TrendCard, {
        id: 'weight',
        label: '体重',
        color: 'var(--gp-violet)',
        pill: trendWeightLast !== null ? `${fmt(trendWeightLast, 1)} kg` : '—',
        loading: trendLoading,
        chart: h(TrendChart, {
          id: 'weight', label: '体重', rows: trendRows, pick: trendWeightPick,
          color: 'var(--gp-violet)', rangeDays: trendDays, emptyText: '未称重',
        }),
        footer: h(React.Fragment, null,
          h('span', null,
            trendWeightLast !== null ? `最新 ${fmt(trendWeightLast, 1)} kg` : '未称重'),
          trendDelta(trendWeightDelta, null, 1, ' kg')),
      })

      sectionNodes.trends = section('trends',
        h('div', { className: 'gp-sec', 'data-gp-trends': '1' },
          h('h2', null, '健康趋势'),
          h('span', { className: 'hint', 'data-gp-trends-hint': '1' },
            reviewDay ? `截至 ${reviewDay} · 最近 7 天 / 30 天` : '最近 7 天 / 30 天'),
          h('div', { className: 'gp-sec-tools' },
            h('div', {
              className: 'gp-seg', role: 'tablist', 'aria-label': '健康趋势时间范围',
            }, TRENDS_DAYS.map((days) => h('button', {
              key: days,
              type: 'button',
              role: 'tab',
              'aria-selected': trendsRange === days,
              className: `gp-seg-btn${trendsRange === days ? ' on' : ''}`,
              'data-gp-trends-range': String(days),
              onClick: () => changeTrendsRange(days),
            }, `${days} 天`))))),
        gridFor('trends', 'gp-trends'))

      /* 训练负荷：趋势 / 平衡 / 能力 / 今日提醒 四张卡，可在 2 列网格里重排 */
      cardNodes.load.trend = loadLocked
        ? h(UnlockCard, { flow: unlock, id: 'load' })
        : h('div', { className: 'gp-card' },
            h('h3', null, '急性 / 慢性负荷（近 14 天）'),
            load.loading ? h(Skel, { h: 150 }) : h(LoadChart, { data: load.data }))

      cardNodes.load.balance = loadLocked
        ? h('div', { className: 'gp-card' },
            h('h3', null, '负荷平衡'),
            h('div', { className: 'gp-empty' }, h('b', null, '账号登录后显示'), '负荷平衡与 ACWR'))
        : h('div', { className: 'gp-card' },
            h('h3', null, '负荷平衡'),
            load.data?.balance
              ? h('div', null,
                  h('div', { style: { fontSize: 22, fontWeight: 700, marginBottom: 2 } },
                    fmt(load.data.current?.acwr, 1),
                    h('small', { style: { fontSize: 11, color: 'var(--gp-t3)', marginLeft: 6 } }, load.data.current?.acwrStatus)),
                  h('div', { className: 'gp-mini', style: { marginBottom: 10 } },
                    load.data.balance.feedback || ''),
                  (() => {
                    const bal = load.data.balance
                    const keys = ['aerobic_low', 'aerobic_high', 'anaerobic']
                    const scale = Math.max(
                      100,
                      ...keys.map((k) => Math.max((bal[k]?.load || 0) * 1.05, (bal[k]?.target_max || 0) * 1.2)),
                    )
                    return keys.map((key) => {
                      const b = bal[key]
                      if (!b) return null
                      const label = { aerobic_low: '有氧低', aerobic_high: '有氧高', anaerobic: '无氧' }[key]
                      return h(Row, {
                        key, lab: label, val: fmt(b.load),
                        pct: (b.load / scale) * 100,
                        color: b.status === 'within' ? 'var(--gp-green)' : 'var(--gp-amber)',
                      })
                    })
                  })(),
                  h('div', { className: 'gp-mini', style: { marginTop: 10, lineHeight: 1.6 } },
                    '目标：有氧低 137–301 · 有氧高 164–328 · 无氧 0–164'))
              : h(Skel, { h: 110 }))

      /* 能力（VO₂max / 阈值 / 比赛预测都需要账号登录），合成一张卡 */
      cardNodes.load.ability = gated
        ? h(UnlockCard, { flow: unlock, id: 'ability', hint: 'VO₂max · 阈值 · 比赛预测' })
        : h('div', { className: 'gp-card' },
            h('h3', null, '能力'),
            h('div', { className: 'gp-mini' },
              h('div', null, 'VO₂max ', h('b', null, fmt(load.data?.vo2max?.latest, 1)),
                ' · 30 天变化 ', h('b', null, fmt(load.data?.vo2max?.change, 1))),
              h('div', { style: { marginTop: 6 } },
                `骑行 FTP ${fmt(load.data?.ftp?.functional_threshold_power_watts)} W`),
              h('div', { style: { marginTop: 4 } },
                `跑步阈值 ${fmt(load.data?.lactate?.functional_threshold_power_watts)} W · ${fmt(load.data?.lactate?.power_to_weight, 2)} W/kg`),
              h('div', { style: { marginTop: 8, borderTop: '1px solid var(--gp-line2)', paddingTop: 7 } },
                load.data?.race
                  ? ['5K', '10K', 'half_marathon', 'marathon'].map((key) =>
                      h('div', { key, style: { display: 'flex', justifyContent: 'space-between', marginTop: 2 } },
                        h('span', null, key === 'half_marathon' ? '半马' : key === 'marathon' ? '全马' : key),
                        h('b', null, load.data.race[key]?.time ?? '—')))
                  : '比赛预测暂无数据')))

      cardNodes.load.insight = h('div', { className: 'gp-card' },
        h('h3', null, '值得注意'),
        insights.length
          ? insights.slice(0, 3).map(([kind, title, text], i) =>
              h('div', { key: i, className: `gp-insight ${kind}` },
                h('div', { className: 'ic' }, kind === 'good' ? '✓' : kind === 'bad' ? '!' : '·'),
                h('div', null, h('b', null, title), '：', text)))
          : h('div', { className: 'gp-mini' }, '数据齐全后自动生成'))

      sectionNodes.load = section('load',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('训练负荷', 'until')),
          h('span', { className: 'hint' }, '急性/慢性 · ACWR · 强度分布')),
        gridFor('load', 'gp-grid gp-g2'))

      /* ---------------- 进阶数据（仅 advanced 模式渲染） ---------------- */
      const advEmpty = (text = '未记录') => h('div', { className: 'gp-adv-empty' }, text)
      const advBar = (label, value, max, color) => h('div', { className: 'barrow', key: label },
        h('span', { className: 'lb' }, label),
        h('div', { className: 'bar' },
          h('i', {
            style: {
              width: `${clampPct(max > 0 ? ((numOf(value) ?? 0) / max) * 100 : 0)}%`,
              background: color,
            },
          })),
        h('span', { className: 'v' }, fmt(value, typeof value === 'number' && !Number.isInteger(value) ? 2 : 0)))
      const advCard = (id, title, extra, ...children) => h('div', {
        className: 'gp-card gp-adv',
        'data-gp-adv': id,
      },
        h('div', { className: 'k' }, title, extra ? h('span', { className: 'sp' }, extra) : null),
        ...children)
      const advSkel = h(Skel, { h: 62 })
      const advLoading = load.loading || extras.loading

      const advCurrent = load.data?.current ?? null
      const advCtl = numOf(advCurrent?.ctl)
      const advAtl = numOf(advCurrent?.atl)
      const advTsb = numOf(advCurrent?.tsb)
      const advAcwr = numOf(advCurrent?.acwr)
      const advMaxLoad = Math.max(1, advCtl ?? 0, advAtl ?? 0)
      cardNodes.advanced.status = advCard('status', '训练状态',
        advCurrent?.acwrStatus ? acwrText(advCurrent.acwrStatus) : null,
        load.loading && !load.data
          ? advSkel
          : advCurrent
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  TRAINING_STATUS_ZH[advCurrent.status] || advCurrent.status || '—',
                  h('small', null, advAcwr !== null ? `ACWR ${fmt(advAcwr, 2)}` : '')),
                h('div', { className: 'bars' },
                  advBar('CTL', advCtl, advMaxLoad, 'var(--gp-violet)'),
                  advBar('ATL', advAtl, advMaxLoad, 'var(--gp-blue)'),
                  advBar('TSB', Math.abs(advTsb ?? 0), advMaxLoad, (advTsb ?? 0) < 0 ? 'var(--gp-amber)' : 'var(--gp-green)')),
                h('div', { className: 'mini' },
                  `急性 ${fmt(advAtl)} · 慢性 ${fmt(advCtl)} · TSB ${fmt(advTsb)}`,
                  advCurrent.acwrStatus ? ` · ${acwrText(advCurrent.acwrStatus)}` : ''))
            : advEmpty(loadLocked ? '账号登录后显示' : '未记录'))

      const advFtp = load.data?.ftp
      const advLactate = load.data?.lactate
      const ftpWatts = numOf(advFtp?.functional_threshold_power_watts, advFtp?.ftp)
      const ltWatts = numOf(advLactate?.functional_threshold_power_watts,
        advLactate?.lactate_threshold_power_watts)
      const ltWkg = numOf(advLactate?.power_to_weight, advLactate?.w_per_kg)
      const thresholdDay = dateOf(advFtp?.date, advFtp?.beginDate, advFtp?.begin_date,
        advLactate?.date, advLactate?.beginDate, load.data?.thresholds?.date)
      const thresholdStale = load.data?.thresholds?.stale === true
        || advFtp?.stale === true || advLactate?.stale === true
        || (thresholdDay ? thresholdDay < shiftDay(snapshotDay, -30) : false)
      cardNodes.advanced.thresholds = advCard('thresholds', '阈值',
        thresholdStale ? '可能过期' : thresholdDay ? shortDay(thresholdDay) : null,
        load.loading && !load.data
          ? advSkel
          : ftpWatts !== null || ltWatts !== null
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  ftpWatts !== null ? fmt(ftpWatts) : '—',
                  h('small', null, ftpWatts !== null ? 'W FTP' : 'FTP')),
                h('div', { className: 'mini' },
                  `乳酸阈 ${ltWatts !== null ? `${fmt(ltWatts)} W` : '—'}`,
                  ltWkg !== null ? ` · ${fmt(ltWkg, 2)} W/kg` : ''),
                h('div', { className: 'mini' },
                  thresholdDay ? `数据日期 ${thresholdDay}` : '数据日期未标注'),
                thresholdStale
                  ? h('span', {
                      className: 'gp-pill a',
                      style: { alignSelf: 'flex-start', marginTop: 2 },
                    }, '阈值可能已过期')
                  : null)
            : advEmpty())

      const tolRaw = firstOf(load.data?.tolerance, load.data?.runningTolerance, load.data?.toleranceTrend)
      const tolNum = numOf(tolRaw)
      const tol = tolNum !== null ? { tolerance_km: tolNum } : latestRow(tolRaw)
      const tolKm = numOf(tol?.tolerance_km, tol?.toleranceKm, tol?.tolerance)
      const tolAcute = numOf(tol?.acute_load_km, tol?.acuteLoadKm, tol?.acute_load)
      const tolRatio = numOf(tol?.load_ratio, tol?.loadRatio, tol?.ratio)
      cardNodes.advanced.tolerance = advCard('tolerance', '跑步耐受度',
        tolRatio !== null ? `负荷比 ${fmt(tolRatio, 2)}` : null,
        load.loading && !load.data
          ? advSkel
          : tolKm !== null
            ? h(React.Fragment, null,
                h('div', { className: 'big' }, fmt(tolKm, 1), h('small', null, 'km 可承受')),
                h('div', { className: 'bars' },
                  advBar('负荷', tolRatio !== null ? tolRatio : (tolAcute ?? 0),
                    tolRatio !== null ? 1.5 : Math.max(1, tolAcute ?? 0),
                    tolRatio !== null && tolRatio > 1.2 ? 'var(--gp-amber)' : 'var(--gp-green)')),
                h('div', { className: 'mini' },
                  `急性负荷 ${tolAcute !== null ? `${fmt(tolAcute, 1)} km` : '—'}`))
            : advEmpty())

      const enduranceRaw = firstOf(load.data?.endurance, load.data?.enduranceScore,
        extras.data?.endurance, extras.data?.enduranceScore)
      const hillRaw = firstOf(load.data?.hill, load.data?.hillScore, load.data?.hill_score,
        extras.data?.hill, extras.data?.hillScore)
      const endurance = scoreEntry(enduranceRaw)
      const hill = scoreEntry(hillRaw)
      cardNodes.advanced.endurance = advCard('endurance', '耐力 / 爬坡',
        (endurance?.level || hill?.level)
          ? (LEVEL_ZH[endurance?.level] || LEVEL_ZH[hill?.level]
            || endurance?.level || hill?.level)
          : null,
        advLoading && !load.data && !extras.data
          ? advSkel
          : endurance || hill
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  fmt(endurance?.score ?? hill?.score),
                  h('small', null, endurance ? '耐力分' : '爬坡分')),
                h('div', { className: 'mini' },
                  `耐力 ${fmt(endurance?.score)} · 爬坡 ${fmt(hill?.score)}`),
                h('div', { className: 'bars' },
                  advBar('耐力', endurance?.score ?? 0, 100, 'var(--gp-green)'),
                  advBar('爬坡', hill?.score ?? 0, 100, 'var(--gp-amber)')))
            : advEmpty())

      const accliRaw = firstOf(load.data?.acclimation, extras.data?.acclimation,
        extras.data?.heatAcclimation)
      const heatPct = numOf(accliRaw?.heat_acclimation_percent, accliRaw?.heatAcclimationPercent,
        accliRaw?.heat, accliRaw?.percent)
      const heatTrend = firstOf(accliRaw?.heat_trend, accliRaw?.heatTrend, accliRaw?.trend)
      const altitudePct = numOf(accliRaw?.altitude_acclimation_percent,
        accliRaw?.altitudeAcclimationPercent, accliRaw?.altitude)
      cardNodes.advanced.acclimation = advCard('acclimation', '热适应 / 海拔',
        typeof heatTrend === 'string'
          ? (HEAT_TREND_ZH[heatTrend.toUpperCase()] || heatTrend)
          : null,
        advLoading && !load.data && !extras.data
          ? advSkel
          : heatPct !== null || altitudePct !== null
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  fmt(heatPct), h('small', null, '% 热适应')),
                h('div', { className: 'bars' },
                  advBar('热', heatPct ?? 0, 100, 'var(--gp-amber)'),
                  advBar('海拔', altitudePct ?? 0, 100, 'var(--gp-blue)')),
                h('div', { className: 'mini' },
                  altitudePct !== null ? `海拔适应 ${fmt(altitudePct)}%` : '海拔适应未记录'))
            : advEmpty())

      const fitnessAge = extras.data?.fitnessAge
      const fitYears = numOf(fitnessAge?.years, fitnessAge?.fitnessAge)
      const fitChrono = numOf(fitnessAge?.chronologicalAge)
      const fitAchievable = numOf(fitnessAge?.achievableFitnessAge)
      const fitDelta = fitYears !== null && fitChrono !== null ? fitYears - fitChrono : null
      cardNodes.advanced.fitnessAge = advCard('fitnessAge', '体能年龄',
        fitnessAge?.lastUpdated ? shortDay(fitnessAge.lastUpdated) : null,
        extras.loading && !extras.data
          ? advSkel
          : fitYears !== null
            ? h(React.Fragment, null,
                h('div', { className: 'big' },
                  fmt(fitYears, 1), h('small', null, '岁')),
                fitDelta !== null
                  ? h('span', {
                      className: `gp-pill ${fitDelta <= 0 ? 'g' : 'a'}`,
                      style: { alignSelf: 'flex-start' },
                    }, fitDelta <= 0 ? `比实际年轻 ${fmt(Math.abs(fitDelta), 1)} 岁`
                      : `比实际年长 ${fmt(fitDelta, 1)} 岁`)
                  : null,
                h('div', { className: 'mini' },
                  `实际 ${fitChrono !== null ? `${fmt(fitChrono)} 岁` : '—'}`,
                  fitAchievable !== null ? ` · 可达 ${fmt(fitAchievable, 1)} 岁` : ''))
            : advEmpty())

      cardNodes.advanced.hrzones = (() => {
        const profile = pickHrZoneProfile(extras.data?.hrZones)
        const rows = hrZoneRowsOf(profile)
        const declaredMax = numOf(profile?.maxHr, profile?.max_hr, profile?.maxHeartRate)
        const zoneCeil = rows.length
          ? Math.max(0, ...rows.map((row) => numOf(row.high, row.low) ?? 0))
          : 0
        const scaleMax = declaredMax !== null && declaredMax > 0
          ? declaredMax
          : (zoneCeil > 0 ? zoneCeil : null)
        return advCard('hrzones', '心率区间',
          declaredMax !== null
            ? `最大心率 ${fmt(declaredMax)} bpm`
            : profile?.method ? String(profile.method) : null,
          extras.loading && !extras.data
            ? advSkel
            : rows.length
              ? h('div', {
                  className: 'gp-hrz',
                  'data-gp-hr-zones': String(rows.length),
                }, rows.map((row, i) => {
                  const base = scaleMax || 1
                  const low = row.low !== null ? row.low : 0
                  const high = row.high !== null ? row.high : base
                  const left = Math.max(0, Math.min(100, (low / base) * 100))
                  const width = Math.max(4, Math.min(100 - left, ((high - low) / base) * 100))
                  return h('div', {
                    key: `z${row.zone}`,
                    className: 'gp-hrz-row',
                    'data-gp-hr-zone': `Z${row.zone}`,
                  },
                    h('span', { className: 'z' }, `Z${row.zone}`),
                    h('div', { className: 'bar' },
                      h('i', {
                        style: {
                          marginLeft: `${left.toFixed(1)}%`,
                          width: `${width.toFixed(1)}%`,
                          background: ZONE_COLORS[i % ZONE_COLORS.length],
                        },
                      })),
                    h('span', { className: 'r' },
                      row.low !== null && row.high !== null
                        ? `${fmt(row.low)}–${fmt(row.high)} bpm`
                        : row.low !== null
                          ? `${fmt(row.low)}+ bpm`
                          : row.high !== null ? `≤${fmt(row.high)} bpm` : '—'))
                }))
              : advEmpty('未获取到心率区间'))
      })()

      sectionNodes.advanced = advanced
        ? section('advanced',
            h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('进阶数据', 'until')),
              h('span', { className: 'hint' }, '训练状态 · 阈值 · 耐受 · 体能年龄'),
              h('span', { className: 'sp' }, snap?.date ?? '')),
            gridFor('advanced', 'gp-grid gp-g3'))
        : null

      /* AI 角色卡片：编辑态每张卡固定一个角色，普通态由 tab 切换 */
      cardNodes.coach.coach = h(CoachCard, {
        api: coachApi, roles: coachRoles, pinned: 'coach', showTabs: false,
        date: selectedDate, reviewing,
      })
      cardNodes.coach.steward = h(CoachCard, {
        api: coachApi, roles: coachRoles, pinned: 'steward', showTabs: false,
        date: selectedDate, reviewing,
      })

      sectionNodes.coach = section('coach',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('AI 健康 · 今日建议')),
          h('span', { className: 'hint', 'data-gp-coach-hint': '1' },
            reviewDay ? `基于 ${reviewDay} 数据 · 手动触发` : '基于今日数据 · 手动触发'),
          h('span', { className: 'sp' }, snap?.date ?? '')),
        editing
          ? h(React.Fragment, null,
              coachRoles.length
                ? h('div', { key: 'tabs', className: 'gp-coach-hd gp-coach-hd-outer' },
                    h(CoachTabs, {
                      roles: coachRoles,
                      tab: coachRoles.includes(coachApi.tab) ? coachApi.tab : coachRoles[0],
                      setTab: coachApi.setTab,
                    }))
                : null,
              gridFor('coach', 'gp-grid gp-coach-cards'))
          : coachRoles.length
            ? h(CoachCard, {
                api: coachApi, roles: coachRoles, date: selectedDate, reviewing,
              })
            : h('div', { className: 'gp-cards-empty' }, '本板块的卡片都已隐藏'))

      /* 活动：平铺卡片（list）+ 月度分布（month），两张卡可各自隐藏 */
      const activityTotal = Math.max(
        numOf(activities.data?.count) ?? 0,
        Array.isArray(activities.data?.activities) ? activities.data.activities.length : 0,
      )
      cardNodes.activities.list = h(ActivityTilesCard, {
        tiles: tileList,
        total: activityTotal,
        loading: activities.loading,
        advanced,
        tracks,
        onOpen: (id) => setDetailId(id),
      })
      cardNodes.activities.month = h(MonthHeatCard, {
        calendar: displayCalendar,
        loading: displayCalendarLoading,
        error: calendar.error || null,
        monthKey: displayMonthKey,
        note: calendarNote,
      })

      /* ---------------- 训练计划（仅 advanced 时挂载） ---------------- */
      const planData = plan.data && typeof plan.data === 'object' ? plan.data : null
      const planLoading = plan.loading && !planData
      const planLocked = planData?.status === 'advanced_required'
      cardNodes.plan.week = h(PlanWeekCard, { data: planData, loading: planLoading, showToast })
      cardNodes.plan.coach = h(PlanCoachCard, { data: planData, loading: planLoading })
      cardNodes.plan.goals = h(PlanGoalsCard, { data: planData, loading: planLoading })
      sectionNodes.plan = advanced
        ? section('plan',
            h('div', { className: 'gp-sec', 'data-gp-plan': '1' },
              h('h2', null, '训练计划'),
              h('span', { className: 'hint' }, '本周课表 · 目标 · 只读，编辑请到 Garmin Connect')),
            planLocked
              ? h('div', { className: 'gp-card', 'data-gp-plan-lock': '1' },
                  h('div', { className: 'gp-deep-muted' },
                    h('b', null, '需要进阶模式'),
                    '：训练计划来自 Garmin 账号登录，官方 Personal API 不提供。'),
                  h('div', { className: 'gp-deep-muted', 'data-gp-plan-lock-note': '1' },
                    '训练计划需要进阶模式（Garmin 登录），或直接在 Garmin Connect 查看'),
                  h(UnlockCard, { flow: unlock, id: 'plan-section', compact: true, hint: '训练计划' }))
              : gridFor('plan', 'gp-grid gp-g2'))
        : null

      sectionNodes.activities = section('activities',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('最近活动', 'until')),
          h('span', { className: 'hint' }, '近 30 天 · 月度分布'),
          h('span', { className: 'sp' }, activities.data ? `共 ${fmt(activityTotal)} 条` : '')),
        gridFor('activities', 'gp-grid gp-act-grid'))

      /* 计划 · 装备 · 身体：5 张卡，身体成分合并体重 / 体脂 / 肌肉量 */
      const weighRows = Array.isArray(extras.data?.weighIns)
        ? extras.data.weighIns.filter((w) => w && typeof w.weight_kg === 'number')
        : []
      const latestWeigh = weighRows.length ? weighRows[weighRows.length - 1] : null
      const earliestWeigh = weighRows.length ? weighRows[0] : null
      const weightDelta = latestWeigh && earliestWeigh && weighRows.length > 1
        ? latestWeigh.weight_kg - earliestWeigh.weight_kg
        : null
      const nutrition = extras.data?.nutrition || null

      cardNodes.extras.plan = gated
        ? h(UnlockCard, { flow: unlock, id: 'plan', hint: '本周安排 · 装备' })
        : h('div', { className: 'gp-card' },
            h('h3', null, '本周安排'),
            extras.loading
              ? h(Skel, { h: 60 })
              : extras.data?.workouts && typeof extras.data.workouts.count === 'number'
                ? h('div', { className: 'gp-mini' },
                    `共 ${extras.data.workouts.count} 个已排课 · ${extras.data.week.start} → ${extras.data.week.end}`)
                : h('div', { className: 'gp-empty' }, h('b', null, '本周无排课')))

      cardNodes.extras.gear = h('div', { className: 'gp-card' },
        h('h3', null, '装备'),
        extras.loading
          ? h(Skel, { h: 60 })
          : extras.data?.gear?.length
            ? extras.data.gear.map((g) =>
                h('div', { key: g.uuid, style: { display: 'flex', justifyContent: 'space-between', marginTop: 4 } },
                  h('span', { className: 'gp-mini' }, g.full_name || g.name),
                  h('b', null, g.max_distance_km ? `${fmt(g.max_distance_km, 1)} km` : '')))
            : h('div', { className: 'gp-empty' }, h('b', null, gated ? '账号登录后显示装备' : '没有登记装备')))

      cardNodes.extras.devices = h('div', { className: 'gp-card' },
        h('h3', null, '设备'),
        extras.loading
          ? h(Skel, { h: 60 })
          : extras.data?.devices?.length
            ? extras.data.devices.map((d) =>
                h('div', { key: d.device_id, style: { display: 'flex', justifyContent: 'space-between', marginTop: 4 } },
                  h('span', { className: 'gp-mini' }, d.device_name),
                  h('span', { className: 'gp-tag' }, deviceKind(d.device_name))))
            : gated
              ? h('div', { className: 'gp-empty' }, h('b', null, '账号登录后显示设备'))
              : h('div', { className: 'gp-empty' }, h('b', null, '没有设备')))

      /* 身体成分：/extras 的 bodyComp 优先，缺失时退回最近一次称重；
         五项指标固定成 3 列网格，缺值显示「未记录」而不是消失 */
      const bodyCompRaw = extras.data?.bodyComp && typeof extras.data.bodyComp === 'object'
        ? extras.data.bodyComp
        : null
      const bcomp = bodyCompRaw || latestWeigh
      const bcompWeight = numOf(bcomp?.weight_kg, bcomp?.weightKg)
      const bcompMetrics = [
        { key: 'fat', label: '体脂率', value: numOf(bcomp?.body_fat_percent, bcomp?.bodyFatPercent), unit: '%' },
        { key: 'muscle', label: '肌肉量', value: numOf(bcomp?.muscle_mass_kg, bcomp?.muscleMassKg), unit: 'kg' },
        { key: 'bone', label: '骨量', value: numOf(bcomp?.bone_mass_kg, bcomp?.boneMassKg), unit: 'kg' },
        { key: 'water', label: '体水分', value: numOf(bcomp?.body_water_percent, bcomp?.bodyWaterPercent), unit: '%' },
        { key: 'bmi', label: 'BMI', value: numOf(bcomp?.bmi), unit: '' },
      ]
      const bcompDay = dateOf(bcomp?.date, bcomp?.measuredAt, bcomp?.measured_at)

      cardNodes.extras.bodycomp = h('div', { className: 'gp-card', 'data-gp-bodycomp-card': '1' },
        h('h3', null, '身体成分'),
        extras.loading && !extras.data
          ? h(Skel, { h: 60 })
          : bcomp
            ? h('div', null,
                h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 6 } },
                  h('div', { style: { fontSize: 24, fontWeight: 700 } }, fmt(bcompWeight, 1)),
                  h('small', { style: { fontSize: 11, color: 'var(--gp-t3)' } }, 'kg'),
                  weightDelta !== null
                    ? h('span', {
                        className: `delta ${weightDelta < 0 ? 'good' : weightDelta > 0 ? 'bad' : 'flat'}`,
                        style: { fontSize: 10.5, fontWeight: 650 },
                      }, `${weightDelta < 0 ? '↓' : weightDelta > 0 ? '↑' : ''}${fmt(Math.abs(weightDelta), 1)}`)
                    : null),
                h('div', { className: 'gp-bcomp' }, bcompMetrics.map((metric) => h('div', {
                  key: metric.key,
                  className: 'cell',
                  'data-gp-bcomp': metric.key,
                },
                  h('div', { className: 'lb' }, metric.label),
                  metric.value !== null
                    ? h('div', { className: 'vl' },
                        fmt(metric.value, 1),
                        metric.unit ? h('small', null, metric.unit) : null)
                    : h('div', { className: 'vl none' }, '未记录')))),
                h('div', { className: 'gp-bcomp-foot' },
                  bcompDay ? `记录于 ${bcompDay}` : '未记录测量日期',
                  weighRows.length > 1 ? ` · 共 ${weighRows.length} 次称重` : ''))
            : h('div', { className: 'gp-empty' }, h('b', null, '暂无体重记录')))

      cardNodes.extras.nutrition = h(NutritionCard, {
        nutrition,
        version,
        date: selectedDate,
        reviewing,
        showToast,
      })

      sectionNodes.extras = section('extras',
        h('div', { className: 'gp-sec' }, h('h2', null, dayTitle('计划 · 装备 · 身体'))),
        gridFor('extras', 'gp-grid gp-g3 gp-grid-top'))

      sectionNodes.records = section('records',
        h('div', { className: 'gp-sec' }, h('h2', null, '个人记录')),
        h('div', { className: 'gp-card', style: { padding: '4px 8px 8px' } },
          extras.loading
            ? h(Skel, { h: 100 })
            : extras.data?.records?.length
              ? h('table', { className: 'gp-table' },
                  h('thead', null, h('tr', null, ['项目', '成绩', '日期'].map((t) => h('th', { key: t }, t)))),
                  h('tbody', null, extras.data.records.map((r, i) =>
                    h('tr', { key: i },
                      h('td', { className: 'gp-tname' }, recordZh(r.record_type)),
                      h('td', { className: 'n' }, r.value),
                      h('td', { className: 'n' }, r.date)))))
              : h('div', { className: 'gp-empty' }, h('b', null, '没有个人记录'))))

      /* 按 layout 顺序组装区块描述：{ id, label, node }，隐藏的不挂载、不请求 */
      const sections = layout.flatMap((row) => {
        const node = sectionNodes[row.id]
        if (row.visible === false || !node || !sectionAvailable(row.id)) return []
        const meta = SECTION_META[row.id] || { id: row.id, label: row.id, hint: '' }
        return [{ id: row.id, label: meta.label, hint: meta.hint || '', node }]
      })

      const hiddenSections = layout
        .filter((row) => row.visible === false && sectionNodes[row.id] && sectionAvailable(row.id))
        .map((row) => {
          const meta = SECTION_META[row.id] || { id: row.id, label: row.id }
          return { id: row.id, label: meta.label }
        })

      /* 拖拽时在插入位置渲染等高的虚线占位；drop 后立即写回布局 */
      const slots = []
      sections.forEach((item, index) => {
        if (editing && drag.id && drag.at === index) {
          slots.push(h(SlotGhost, {
            key: `ghost-${index}`,
            height: drag.height,
            onDragOver: overGhost,
            onDrop: (e) => dropAt(e, index),
          }))
        }
        slots.push(h(SectionSlot, {
          key: item.id,
          id: item.id,
          label: item.label,
          node: item.node,
          editing,
          index,
          draggingId: drag.id,
          onDragStart: beginDrag,
          onDragOver: overSlot,
          onDrop: dropSlot,
          onDragEnd: endDrag,
          onRemove: removeSection,
        }))
      })
      if (editing && drag.id && drag.at === sections.length) {
        slots.push(h(SlotGhost, {
          key: 'ghost-end',
          height: drag.height,
          onDragOver: overGhost,
          onDrop: (e) => dropAt(e, sections.length),
        }))
      }

      /* 拖到底部添加区也视为「放到最后」 */
      const overTail = (e) => {
        if (!dragIdRef.current) return
        e.preventDefault()
        if (dragAtRef.current !== sections.length) {
          dragAtRef.current = sections.length
          setDrag((d) => (d.id ? { ...d, at: sections.length } : d))
        }
      }
      const dropTail = (e) => dropAt(e, sections.length)

      /* 路书工坊：整页次级视图，仪表盘整棵卸载（不保留隐藏 DOM） */
      if (workshopOpen) {
        return h('div', { className: 'gp-root', 'data-gp-workshop': '1' },
          h('style', null, CSS),
          h('div', { className: 'gp-wrap' },
            h('div', { className: 'gp-top' },
              h('div', { className: 'gp-title' },
                '路书工坊',
                h('span', { className: 'gp-badge' }, 'ROUTE WORKSHOP')),
              h('div', { className: 'gp-right' },
                h('button', {
                  type: 'button',
                  className: 'gp-btn gp-rb-back',
                  onClick: () => setWorkshopOpen(false),
                  'data-gp-workshop-back': '1',
                }, '← 返回面板'))),
            h(RouteWorkshop, {
              showToast,
              statusVersion: roadbookVersion,
              onOpenSettings: openAccountFromWorkshop,
            })),
          toast ? h('div', { className: `gp-toast is-workshop ${toast.kind}` }, toast.msg) : null)
      }

      return h('div', { className: `gp-root${editing ? ' is-editing' : ''}` },
        h('style', null, CSS),
        h('div', { className: 'gp-wrap' },
          /* 顶栏 */
          h('div', { className: 'gp-top' },
            h('div', { className: 'gp-title' }, '佳明助手', h('span', { className: 'gp-badge' }, 'GARMIN ASSISTANT')),
            /* 回看日期导航：只在仪表盘顶栏，路书工坊整页不渲染 */
            h(DateNav, {
              selectedDate,
              todayDate,
              onPick: pickDate,
              onToday: goToday,
              keyboardEnabled: detailId == null && !accountOpen && !onboardPreview && !deviceOpen,
            }),
            h('div', { className: 'gp-right' },
              h('span', { className: 'gp-status' },
                h('span', { className: `gp-dot${unauth ? ' bad' : needsAttention ? ' warn' : ''}` }),
                unauth ? '未认证' : needsAttention ? '需检查' : snapshot.loading ? '同步中' : '已连接'),
              gated
                ? null
                : h('div', { className: 'gp-dev-anchor', ref: deviceAnchor },
                    h('button', {
                      className: `gp-btn dev${deviceOpen ? ' on' : ''}`,
                      onClick: () => setDeviceOpen((v) => !v),
                      title: 'Garmin 设备',
                      'aria-haspopup': 'dialog',
                      'aria-expanded': deviceOpen,
                    },
                      h('span', { 'aria-hidden': true }, '⌚'),
                      '设备',
                      deviceList ? h('span', { className: 'n' }, String(deviceList.length)) : null),
                    deviceOpen
                      ? h(DevicePopover, {
                          list: deviceList,
                          loading: devices.loading,
                          error: devices.error,
                          latest: devices.data?.latest,
                          version: deviceVersion,
                          anchorRef: deviceAnchor,
                          onRefresh: () => setDeviceVersion((v) => v + 1),
                          onClose: () => setDeviceOpen(false),
                        })
                      : null),
              h('button', { className: 'gp-btn', onClick: refresh }, refreshing ? '刷新中…' : '↻ 刷新'),
              h('button', {
                type: 'button',
                className: 'gp-btn gp-rb-entry',
                onClick: () => setWorkshopOpen(true),
                title: '路书工坊',
                'data-gp-workshop-open': '1',
              },
                h('svg', {
                  width: 13,
                  height: 13,
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  'aria-hidden': true,
                },
                  h('path', {
                    d: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z',
                    stroke: 'currentColor',
                    strokeWidth: 1.6,
                    strokeLinejoin: 'round',
                  }),
                  h('path', {
                    d: 'M9 4v14M15 6v14',
                    stroke: 'currentColor',
                    strokeWidth: 1.2,
                    opacity: 0.55,
                  })),
                '路书工坊'),
              h('button', {
                className: 'gp-btn gp-account-btn',
                onClick: () => setAccountOpen(true),
                title: needsAttention ? '账号设置 · 有需要检查的项目' : '账号设置',
                'aria-haspopup': 'dialog',
                'aria-expanded': accountOpen,
                'data-gp-account-open': '1',
              },
                h('span', { 'aria-hidden': true }, '⚙'),
                '账号设置',
                needsAttention
                  ? h('span', {
                      className: 'adot',
                      title: '有需要检查的项目',
                      'data-gp-account-dot': '1',
                    })
                  : null),
              h('button', {
                ref: layoutBtn,
                className: `gp-btn${editing ? ' on' : ''}`,
                onClick: toggleEditing,
                title: editing ? '完成个性化' : '个性化布局',
                'aria-pressed': editing,
                'data-gp-edit-toggle': editing ? 'done' : 'edit',
              }, editing ? '✓ 完成' : '⚙ 个性化'))),

          /* 回看横幅：贴在顶栏下方，可关闭；「回到今天」把所有日级数据恢复成实时值 */
          reviewing && !reviewBannerHidden
            ? h('div', {
                className: 'gp-banner gp-review-banner',
                role: 'status',
                'data-gp-review-banner': '1',
                'data-gp-review-date': selectedDate,
              },
                h('span', { className: 'ic', 'aria-hidden': true }, '↺'),
                h('span', { className: 'txt', 'data-gp-review-text': '1' },
                  `正在回看 ${shortDay(selectedDate)}（${dayWeekday(selectedDate)}）的数据`),
                h('span', { className: 'sp' },
                  h('span', { className: 'dot', 'aria-hidden': true }, '·'),
                  h('button', {
                    className: 'gp-btn',
                    type: 'button',
                    'data-gp-review-reset': '1',
                    onClick: goToday,
                  }, '回到今天'),
                  h('button', {
                    className: 'x',
                    type: 'button',
                    title: '关闭提示',
                    'aria-label': '关闭回看提示',
                    'data-gp-review-dismiss': '1',
                    onClick: () => setReviewBannerHidden(true),
                  }, '✕')))
            : null,

          toast ? h('div', { className: `gp-toast ${toast.kind}` }, toast.msg) : null,
          snapshot.error ? h('div', { className: 'gp-err' }, `数据加载失败：${snapshot.error}`) : null,
          authBroken && !bannerDismissed
            ? h('div', {
                className: 'gp-banner',
                role: 'status',
                'data-gp-auth-banner': '1',
              },
                h('span', { className: 'ic', 'aria-hidden': true }, '!'),
                h('span', null, 'Garmin 授权可能已过期'),
                h('span', { className: 'sp' },
                  h('button', {
                    className: 'gp-btn',
                    type: 'button',
                    'data-gp-banner-open': '1',
                    onClick: () => setAccountOpen(true),
                  }, '打开账号设置'),
                  h('button', {
                    className: 'x',
                    type: 'button',
                    title: '关闭提醒',
                    'aria-label': '关闭提醒',
                    'data-gp-banner-close': '1',
                    onClick: () => setBannerDismissed(true),
                  }, '✕')))
            : null,
          unauth && gated && snap?.message
            ? h('div', { className: 'gp-empty', style: { marginTop: 8 } },
                h('b', null, '官方数据暂不可用'), '：', snap.message)
            : null,

          unauth && !gated ? h(LoginView, { onAuthed: refresh }) : null,
          ...slots,

          editing
            ? h(AddZone, {
                hidden: hiddenSections,
                onAdd: addSection,
                onDragOver: overTail,
                onDrop: dropTail,
              })
            : null,

          /* 页脚：任何时候都能重看新手引导（只预览，不动已保存的连接） */
          h('div', { className: 'gp-foot' },
            h('span', null, 'Garmin Connect 同步'),
            h('span', null, '只读面板 · 写操作请在对话里完成'),
            h('button', {
              type: 'button',
              className: 'gp-foot-link',
              'data-gp-onboard-open': 'footer',
              onClick: openOnboarding,
            }, '重看新手引导'),
            h('span', null, `更新于 ${snap?.updatedAt ? new Date(snap.updatedAt).toLocaleTimeString('zh-CN') : '—'}`))),
        editing
          ? h(EditBar, { onReset: resetLayout, onDone: exitEdit, onOnboard: openOnboarding })
          : null,
        detailId != null
          ? h(ActivityDrawer, {
              key: detailId,
              id: detailId,
              onClose: () => setDetailId(null),
              showToast,
              flow: unlock,
              gated,
              version,
            })
          : null,
        onboardPreview
          ? h(Onboarding, {
              flow: unlock,
              preview: true,
              alreadyConnected: setupMode !== 'none' || onboarded,
              onClose: () => setOnboardPreview(false),
              onSaved: keySaved,
            })
          : null,
        accountOpen
          ? h(AccountModal, {
              account: acct,
              setup: setupData,
              advanced,
              flow: unlock,
              gender: effectiveGender,
              onGenderSave: saveGender,
              onClose: () => setAccountOpen(false),
              onReload: reload,
              refresh,
              showToast,
              onRoadbookChanged: bumpRoadbook,
            })
          : null)
    }


    function PanelIcon(props) {
      const size = props?.size || 18
      return h('svg', { viewBox: '0 0 64 64', width: size, height: size, 'aria-hidden': true },
        h('defs', null,
          h('clipPath', { id: 'gp-ic-round' },
            h('rect', { x: 0, y: 0, width: 64, height: 64, rx: 14 }))),
        h('g', { clipPath: 'url(#gp-ic-round)' },
          h('rect', { width: 64, height: 64, fill: '#3b3b3b' }),
          h('path', { d: 'M0 0H64V7.4L0 27.2Z', fill: '#4ea8e8' }),
          h('g', { transform: 'translate(0 24.44) rotate(-17) scale(1.25 1)' },
            h('text', {
              x: 5.65, y: 0, fontFamily: 'Helvetica,Arial,sans-serif',
              fontSize: 8.3, fontWeight: 800, letterSpacing: 0.6, fill: '#3b3b3b',
            }, 'GARMIN'),
            h('text', {
              x: 42.41, y: 0.8, fontFamily: 'Helvetica,Arial,sans-serif',
              fontSize: 1.7, fontWeight: 700, fill: '#3b3b3b',
            }, '®')),
          h('circle', { cx: 31.9, cy: 41, r: 14.6, fill: 'none', stroke: '#4ea8e8', strokeWidth: 5.2 }),
          h('rect', { x: 13, y: 39.15, width: 7.6, height: 3.9, fill: '#3b3b3b' }),
          h('rect', { x: 43, y: 35.5, width: 21, height: 11.25, fill: '#3b3b3b' })))
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(
          () => ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL }, Page)),
          'garmin-panel: page',
        )
        ctx.effect(
          () => ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register({ name: 'sidebar.panellist', id: PANEL, order: 20, label: () => '佳明助手' }, PanelIcon)),
          'garmin-panel: sidebar entry',
        )
      },
    }
  },
})
