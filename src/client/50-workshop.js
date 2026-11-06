    /* ---------------------------------------------------------------- *
     * v7：路书工坊（Route Workshop）
     * 次级页面：我的路书 / 导入（行者 / GPX）/ AI 规划
     * ---------------------------------------------------------------- */
    const RB = `${API}/roadbook`
    const RB_TABS = [
      { id: 'mine', label: '我的路书' },
      { id: 'import', label: '导入' },
      { id: 'plan', label: 'AI 规划' },
    ]
    const RB_SOURCE = {
      xingzhe: { label: '行者', cls: 'xz' },
      amap: { label: '高德', cls: 'amap' },
      ai: { label: 'AI', cls: 'ai' },
      gpx: { label: 'GPX', cls: 'gpx' },
    }
    const rbSource = (source) => {
      const key = String(source ?? '').toLowerCase()
      return RB_SOURCE[key] || { label: String(source || '未知'), cls: 'other' }
    }
    const rbKm = (m) =>
      typeof m === 'number' && isFinite(m) ? `${fmt(m / 1000, m >= 100000 ? 0 : 1)} km` : '—'
    const rbMeter = (m) =>
      typeof m === 'number' && isFinite(m) ? `${fmt(m)} m` : '—'
    const rbPointCount = (n) =>
      typeof n === 'number' && isFinite(n) ? `${fmt(n)} 点` : '—'
    const rbDay = (value) => dateOf(value) || stampText(value) || '—'
    const rbErrorText = (data, fallback = '请求失败') => {
      if (!data) return fallback
      const msg = data.message || data.error || fallback
      return data.code ? `${data.code}：${String(msg)}` : String(msg)
    }

    /** 轨迹点统一成 {lat, lon}；数组 / 对象 / 字符串数字都兼容，非法点直接丢弃 */
    function rbPoints(points) {
      const rows = (Array.isArray(points) ? points : [])
        .map((p) => {
          if (Array.isArray(p)) {
            const lat = numOf(p[0])
            const lon = numOf(p[1])
            return lat !== null && lon !== null ? { lat, lon } : null
          }
          const lat = numOf(p?.lat, p?.latitude)
          const lon = numOf(p?.lon, p?.lng, p?.longitude)
          return lat !== null && lon !== null ? { lat, lon } : null
        })
        .filter(Boolean)
      return rows.length >= 2 ? rows : []
    }

    /** 海拔序列 → [{d, e}]；支持 [e…] / [{d,e}] / [{distanceM,elevationM}]；d 单位米 */
    function rbElevationRows(elevation, pointCount = 0, totalDistanceM = null) {
      const rows = Array.isArray(elevation) ? elevation : []
      const out = []
      rows.forEach((row, index) => {
        let d = null
        let e = null
        if (Array.isArray(row)) {
          d = numOf(row[0])
          e = numOf(row[1])
        } else if (typeof row === 'number' || typeof row === 'string') {
          e = numOf(row)
        } else if (row && typeof row === 'object') {
          e = numOf(row.e, row.ele, row.elevationM, row.elevation, row.alt, row.altitude)
          d = numOf(row.d, row.distanceM, row.dist, row.distance)
        }
        if (e === null) return
        out.push({ i: index, d, e })
      })
      if (out.length < 2) return []
      const allD = out.every((r) => r.d !== null)
      const span = Math.max(1, pointCount - 1)
      const total = numOf(totalDistanceM)
      const fallbackTotal = total !== null && total > 0 ? total : 1000
      return out.map((r) => ({
        d: allD ? r.d : (pointCount > 1 ? (r.i / span) * fallbackTotal : r.i),
        e: r.e,
      }))
    }
    function rbElevGain(rows) {
      let out = 0
      for (let i = 1; i < rows.length; i++) {
        const delta = rows[i].e - rows[i - 1].e
        if (delta > 0) out += delta
      }
      return Math.round(out)
    }

    /** 大轨迹降采样：保留首尾，SVG polyline 不至于塞入上千个点 */
    function rbDownsample(rows, max = 240) {
      if (!Array.isArray(rows) || rows.length <= max) return rows
      const step = rows.length / max
      const out = []
      for (let i = 0; i < max; i++) out.push(rows[Math.floor(i * step)])
      out.push(rows[rows.length - 1])
      return out
    }

    /** 高德候选地点坐标 → "lng,lat" */
    function rbLocale(location) {
      if (Array.isArray(location)) {
        const lng = numOf(location[0])
        const lat = numOf(location[1])
        return lng !== null && lat !== null ? `${lng},${lat}` : null
      }
      if (location && typeof location === 'object') {
        const lng = numOf(location.lng, location.lon, location.longitude)
        const lat = numOf(location.lat, location.latitude)
        return lng !== null && lat !== null ? `${lng},${lat}` : null
      }
      const text = String(location ?? '').trim()
      return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(text) ? text.replace(/\s+/g, '') : null
    }

    /**
     * 路书 JSON 资源：path 为 /roadbook 之后的路径。
     * enabled=false 不发请求；version 变化重取；卸载/切页 abort。
     */
    function useRbResource(path, version = 0, enabled = true) {
      const [state, setState] = React.useState({ loading: !!enabled })
      React.useEffect(() => {
        if (!enabled || !path) {
          setState({ loading: false })
          return undefined
        }
        const controller = new AbortController()
        let active = true
        setState((prev) => (prev.data ? { ...prev, loading: true } : { loading: true }))
        fetch(`${RB}/${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
          .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
          .then((data) => { if (active) setState({ loading: false, data }) })
          .catch((err) => {
            if (!active || err?.name === 'AbortError') return
            setState({ loading: false, error: String(err?.message ?? err) })
          })
        return () => {
          active = false
          controller.abort()
        }
      }, [path, version, enabled])
      return state
    }

    /** 统一 JSON 请求：返回 body（含 status:error），网络错误抛出；signal 可取消 */
    async function rbRequest(method, path, body, signal) {
      const res = await fetch(`${RB}/${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body ?? {}),
        signal,
      })
      let data = null
      try { data = await res.json() } catch { data = null }
      if (!res.ok && !data) throw new Error(`HTTP ${res.status}`)
      return data
    }
    const rbPost = (path, body, signal) => rbRequest('POST', path, body, signal)
    const rbPatch = (path, body, signal) => rbRequest('PATCH', path, body, signal)

    /** AI 规划的进度阶段（时间驱动，最后一步停在「估算海拔」） */
    const RB_AI_STAGES = ['解析条件', '搜索地点', '规划路线', '估算海拔']
    /** 多日行程的阶段（时间驱动，最后一步停在「估算海拔」） */
    const RB_AI_MULTI_STAGES = ['解析需求', '联网参考', '规划每日路线', '估算海拔']
    const RB_MULTI_MIN_DAYS = 2
    const RB_MULTI_MAX_DAYS = 15
    /**
     * 多日行程的失败码 → 面板文案。
     * 后端 /roadbook/ai-plan-multi 的错误码：INVALID_JSON（模型没返回 JSON）、
     * INVALID_ITINERARY（天数 / 地名排不通）、PLANNING_FAILED（每天都没排出路线）、
     * LLM_UNAVAILABLE（模型未就绪）；AI_UNAVAILABLE 是旧 mock / 网关的兼容别名。
     */
    const RB_MULTI_ERRORS = {
      INVALID_ITINERARY: {
        title: '行程需求需要调整',
        message: 'AI 没能按你的天数排出一份合理的多日行程。',
        hint: '试试把天数改成 2–15 之间的其他值，或在需求里写清每天的里程区间、想去的城市与路段，再生成一次。',
      },
      INVALID_JSON: {
        title: 'AI 返回的行程格式不正确',
        message: '模型这次没有返回可解析的行程 JSON，点「重试」通常就能恢复。',
        hint: '连续失败时把需求写短一点：先写天数，再写每天里程和想经过的城市 / 路段。',
      },
      PLANNING_FAILED: {
        title: '没能排出可骑行的路线',
        message: '这次所有天都没有规划出可用的路线，通常是地名太泛或路网缺失。',
        hint: '换一组更常见的地名（起点 / 终点，例如「海口」「文昌」），或把天数、总里程放宽一点再试。',
      },
      LLM_UNAVAILABLE: {
        title: 'AI 规划暂不可用',
        message: 'AI 服务暂时不可用（模型未就绪或调用失败）。',
        hint: '稍后再点「重试」，或改回「单日」用「高级选项」手动规划路线。',
        unavailable: true,
      },
    }
    /** 失败码归一：大小写、AI_UNAVAILABLE → LLM_UNAVAILABLE */
    const rbMultiErrorKey = (code) => {
      const key = String(code || '').toUpperCase()
      return key === 'AI_UNAVAILABLE' ? 'LLM_UNAVAILABLE' : key
    }
    /** diagnostics.dayErrors 的单天序号（后端可能给 1 基 day，也可能给 0 基 dayIndex） */
    const rbDiagDayNo = (item, index) => {
      const day = numOf(item?.day)
      if (day !== null && day >= 1) return Math.round(day)
      const dayIndex = numOf(item?.dayIndex)
      return dayIndex !== null ? Math.round(dayIndex) + 1 : index + 1
    }
    const rbDiagRows = (diagnostics) => {
      const list = diagnostics && Array.isArray(diagnostics.dayErrors) ? diagnostics.dayErrors : []
      return list.slice(0, 30)
    }
    const rbDayNumber = (value, fallback = 0) => {
      const n = numOf(value)
      return n === null ? fallback : Math.max(0, Math.round(n))
    }
    const rbTripDays = (trip) => (trip && Array.isArray(trip.days) ? trip.days : [])
    const rbDayOk = (day) => String(day?.status || 'ok') !== 'error'
    const rbDayError = (day) => String(day?.status || '') === 'error'
      ? String(day?.message || day?.error || '这一天的路线生成失败')
      : ''
    const rbDiffSummary = (days) => {
      const counts = { easy: 0, medium: 0, hard: 0 }
      days.forEach((day) => {
        const diff = rbDifficulty(day?.difficulty)
        if (diff) counts[diff.key] += 1
      })
      const parts = []
      if (counts.easy) parts.push(`轻松 ${counts.easy}`)
      if (counts.medium) parts.push(`适中 ${counts.medium}`)
      if (counts.hard) parts.push(`较难 ${counts.hard}`)
      return parts.length ? parts.join(' · ') : ''
    }
    const rbTripTotals = (trip) => {
      const days = rbTripDays(trip).filter(rbDayOk)
      let distanceM = 0
      let gainM = 0
      let durationSec = 0
      days.forEach((day) => {
        const d = numOf(day?.distanceM)
        const g = numOf(day?.elevationGainM)
        const t = numOf(day?.durationSec)
        if (d !== null) distanceM += d
        if (g !== null) gainM += g
        if (t !== null) durationSec += t
      })
      const totalD = numOf(trip?.totalDistanceM)
      const totalG = numOf(trip?.totalElevationGainM)
      return {
        distanceM: totalD !== null ? totalD : distanceM,
        gainM: totalG !== null ? totalG : gainM,
        durationSec,
        dayCount: rbTripDays(trip).length,
        difficulty: rbDiffSummary(days),
      }
    }
    const rbDayTitle = (day, index) => {
      const name = String(day?.name || '').trim()
      return name || `第 ${index + 1} 天`
    }
    const rbDayRouteText = (day) => {
      const from = String(day?.from || '').trim()
      const to = String(day?.to || '').trim()
      if (from && to) return `${from} → ${to}`
      return from || to || ''
    }
    const rbTripSourceLinks = (trip) => (trip && Array.isArray(trip.sources) ? trip.sources : [])
      .filter((item) => item && (item.title || item.url))
      .slice(0, 5)
    const RB_DIFFICULTY = {
      easy: { key: 'easy', label: '轻松' },
      medium: { key: 'medium', label: '适中' },
      hard: { key: 'hard', label: '较难' },
    }
    const rbDifficulty = (value) => {
      const key = String(value ?? '').toLowerCase()
      if (RB_DIFFICULTY[key]) return RB_DIFFICULTY[key]
      if (!key) return null
      if (/轻|易|easy/.test(key)) return RB_DIFFICULTY.easy
      if (/中|medium|moderate/.test(key)) return RB_DIFFICULTY.medium
      if (/难|hard|difficult/.test(key)) return RB_DIFFICULTY.hard
      return null
    }
    const rbShape = (loop) => (loop ? '环线' : '点对点')
    const rbPlaceText = (place) => {
      if (!place) return ''
      const name = String(place.name ?? '').trim()
      const address = String(place.address ?? '').trim()
      if (name && address) return `${name}（${address}）`
      return name || address
    }
    const rbAlternatives = (place) => (Array.isArray(place?.alternatives) ? place.alternatives : [])
      .filter((alt) => alt && (typeof alt === 'string' || alt.name || alt.address || alt.location))
      .slice(0, 3)

    /**
     * 卡片缩略图：列表接口只有 meta，按需拉详情（并发 3，按 id 记忆化）。
     * 失败静默降级为「无缩略图」，不影响卡片本身。
     */
    function useRbThumbs(routes, version = 0, enabled = true) {
      const [map, setMap] = React.useState({})
      const key = (Array.isArray(routes) ? routes : []).map((r) => r?.id).filter(Boolean).join(',')
      React.useEffect(() => {
        if (!enabled) {
          setMap({})
          return undefined
        }
        const ids = key ? key.split(',').slice(0, 12) : []
        if (!ids.length) {
          setMap({})
          return undefined
        }
        let active = true
        const store = {}
        const controllers = new Set()
        let cursor = 0
        let inflight = 0
        const commit = () => { if (active) setMap({ ...store }) }
        const pump = () => {
          if (!active) return
          while (inflight < 3 && cursor < ids.length) {
            const id = ids[cursor++]
            inflight += 1
            const controller = new AbortController()
            controllers.add(controller)
            fetch(`${RB}/routes/${encodeURIComponent(id)}`, {
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            })
              .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
              .then((data) => {
                if (!active) return
                const route = data?.route || data
                const pts = rbPoints(route?.points)
                store[id] = pts.length
                  ? {
                      points: pts,
                      elevation: route?.elevation,
                      distanceM: route?.distanceM,
                      elevationGainM: route?.elevationGainM,
                    }
                  : null
              })
              .catch(() => { if (active) store[id] = null })
              .finally(() => {
                controllers.delete(controller)
                inflight -= 1
                commit()
                pump()
              })
          }
        }
        pump()
        return () => {
          active = false
          for (const controller of controllers) {
            try { controller.abort() } catch { /* ignore */ }
          }
          controllers.clear()
        }
      }, [key, version, enabled])
      return map
    }

    /**
     * 共享轨迹预览：有底图时用高德静态图（路线已画在图上），否则退回归一化 SVG；
     * 下面固定 64px 海拔面积图 + 距离/爬升标签。points 为空或非法时渲染占位，不抛错。
     * compact 只画小轨迹（卡片缩略图不请求底图，省配额）。
     */
    function TrackPreview({
      points,
      elevation = null,
      distanceM = null,
      elevationGainM = null,
      height = 190,
      compact = false,
      emptyText = '暂无轨迹数据',
      basemap = true,
      showElevation = true,
    }) {
      const allRows = rbPoints(points)
      const mapRows = rbDownsample(allRows, 700)
      const W = 240
      const PAD = 6
      const H = compact ? 52 : Math.max(160, Math.min(220, Number(height) || 190))
      const [mapRef, mapWidth] = useElementWidth()
      const mapScale = mapWidth > 0 ? Math.min(2, 1600 / mapWidth) : 2
      const map = useStaticMap(mapRows, {
        coord: 'gcj02',
        kind: 'route',
        width: mapWidth > 0 ? Math.max(160, Math.round(mapWidth * mapScale)) : 720,
        height: mapWidth > 0 ? Math.max(120, Math.round(H * mapScale)) : 360,
        enabled: !compact && basemap !== false && mapWidth > 0,
      })
      const [failedUrl, setFailedUrl] = React.useState(null)
      if (!allRows.length) {
        return h('div', {
          className: `gp-rb-track${compact ? ' is-compact' : ''} is-empty`,
          'data-gp-track-empty': '1',
        }, compact ? null : h('div', { className: 'gp-rb-track-empty' }, emptyText))
      }
      const rows = compact ? rbDownsample(allRows, 120) : mapRows
      const lats = rows.map((r) => r.lat)
      const lons = rows.map((r) => r.lon)
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLon = Math.min(...lons)
      const maxLon = Math.max(...lons)
      const midLat = (minLat + maxLat) / 2
      const kx = Math.max(1e-6, Math.cos((midLat * Math.PI) / 180))
      const spanX = Math.max(1e-9, (maxLon - minLon) * kx)
      const spanY = Math.max(1e-9, maxLat - minLat)
      const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY)
      const padX = (W - spanX * scale) / 2
      const padY = (H - spanY * scale) / 2
      const coords = rows.map((r) => [
        padX + (r.lon - minLon) * kx * scale,
        H - padY - (r.lat - minLat) * scale,
      ])
      const line = coords.map((c) => `${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(' ')
      const start = coords[0]
      const end = coords[coords.length - 1]
      const mapUrl = !compact && map.url && map.url !== failedUrl ? map.url : null
      const elevRows = rbElevationRows(elevation, allRows.length, numOf(distanceM))
      const explicitGain = numOf(elevationGainM)
      const gain = explicitGain !== null
        ? explicitGain
        : (elevRows.length ? rbElevGain(elevRows) : null)

      const elevChart = elevRows.length >= 2
        ? h(ElevationProfile, {
            rows: elevRows,
            distanceM: numOf(distanceM),
            height: 64,
          })
        : null

      const trackSvg = h('svg', {
        className: 'gp-rb-track-svg',
        viewBox: `0 0 ${W} ${H}`,
        preserveAspectRatio: 'xMidYMid meet',
        style: { height: `${H}px` },
        role: 'img',
        'data-gp-track': '1',
        'aria-label': compact ? '路线缩略图' : '路线轨迹',
      },
        h('polyline', {
          points: line,
          fill: 'none',
          stroke: 'var(--gp-blue)',
          strokeWidth: compact ? 2.4 : 2,
          strokeLinejoin: 'round',
          strokeLinecap: 'round',
        }),
        h('circle', {
          cx: start[0].toFixed(1), cy: start[1].toFixed(1),
          r: compact ? 2.6 : 3.2, fill: 'var(--gp-green)', stroke: 'none',
        }),
        h('circle', {
          cx: end[0].toFixed(1), cy: end[1].toFixed(1),
          r: compact ? 2.6 : 3.2, fill: 'var(--gp-red)', stroke: 'none',
        }))

      return h('div', {
        className: `gp-rb-track${compact ? ' is-compact' : ''}`,
        'data-gp-track': '1',
      },
        compact
          ? trackSvg
          : h('div', {
              className: 'gp-rb-track-map',
              style: { height: `${H}px` },
              ref: mapRef,
              'data-gp-track-map': mapUrl ? 'basemap' : 'svg',
            },
              mapUrl
                ? h('img', {
                    className: 'gp-rb-track-img',
                    src: mapUrl,
                    alt: '路线地图',
                    draggable: false,
                    'data-gp-basemap': '1',
                    onError: () => setFailedUrl(mapUrl),
                  })
                : trackSvg,
              mapUrl
                ? h('a', {
                    className: 'gp-map-attr',
                    href: 'https://www.amap.com/',
                    target: '_blank',
                    rel: 'noreferrer noopener',
                    title: '高德地图',
                    'data-gp-map-attribution': '1',
                    onClick: (event) => event.stopPropagation(),
                  }, '高德地图')
                : null,
              !mapUrl && map.loading
                ? h('div', {
                    className: 'gp-map-shimmer',
                    'data-gp-map-loading': '1',
                    'aria-hidden': true,
                  })
                : null),
        compact || !showElevation ? null : h('div', {
          className: 'gp-rb-track-elev',
          'data-gp-elev': elevRows.length ? '1' : '0',
        },
          elevChart || h('div', { className: 'gp-rb-track-elev-empty' }, '暂无海拔数据')),
        compact ? null : h('div', { className: 'gp-rb-track-meta' },
          h('span', null, '距离 ', h('b', null, rbKm(numOf(distanceM)))),
          h('span', null, '爬升 ', h('b', null, gain === null ? '—' : rbMeter(gain))),
          h('span', null, rbPointCount(allRows.length))))
    }

    /** 保存 / 导出后的佳明导入指引（折叠；不做任何设备控制） */
    function GarminGuide({ open = false }) {
      return h('details', {
        className: 'gp-rb-garmin',
        'data-gp-garmin-guide': '1',
        open: open || undefined,
      },
        h('summary', null, '如何导入佳明'),
        h('div', { className: 'gp-rb-garmin-body' },
          h('ol', null,
            h('li', null, '打开 Garmin Connect → 训练与计划 → 课程 → 导入。'),
            h('li', null, '选择刚下载或导出的 GPX 文件，保存为课程。'),
            h('li', null, '在码表 / 手表同步课程后即可导航。')),
          h('a', {
            href: 'https://connect.garmin.com/app/courses/import',
            target: '_blank',
            rel: 'noreferrer noopener',
          }, 'https://connect.garmin.com/app/courses/import'),
          h('div', { className: 'gp-rb-hint' },
            '国内账号请用 connect.garmin.cn 的同一入口（登录后进入「课程 → 导入」）。'),
          h('div', { className: 'sep' }),
          h('div', null,
            'USB 文件方式：把 GPX 复制到 Garmin/NewFiles/ 后断开设备，部分设备会自动导入。'),
          h('div', { className: 'gp-rb-hint' },
            '注意：部分设备导入课程时会忽略 GPX 里的海拔，海拔可能显示为 0。'),
          h('div', { className: 'gp-rb-hint' },
            '也可以先下载 GPX，再在 Garmin Connect 网页端按上面的入口手动导入。')))
    }

    /* ---------------------------- 我的路书 ---------------------------- */
    /** PATCH 单条路书：{name?|description?} → route；status 非 ok 时抛出可读错误 */
    async function rbPatchRoute(id, patch, signal) {
      const data = await rbPatch(`routes/${encodeURIComponent(id)}`, patch, signal)
      if (data?.status === 'not_found') throw new Error('路书不存在或已被删除')
      if (data?.status !== 'ok') throw new Error(rbErrorText(data, '保存失败'))
      return data.route || {}
    }

    function RouteMineTab({ version, onRefresh, onGoTab, showToast, highlightId = null }) {
      const list = useRbResource('routes', version)
      const baseRoutes = Array.isArray(list.data?.routes) ? list.data.routes : []
      const [openId, setOpenId] = React.useState(null)
      const [confirmId, setConfirmId] = React.useState(null)
      const [menuId, setMenuId] = React.useState(null)
      const [edit, setEdit] = React.useState(null)
      const [overlay, setOverlay] = React.useState({})
      const [deleting, setDeleting] = React.useState(false)
      const [copyingId, setCopyingId] = React.useState(null)
      /* 行程分组：折叠、删除二次确认、删除后本地立即隐藏 */
      const [collapsedTrips, setCollapsedTrips] = React.useState({})
      const [tripConfirm, setTripConfirm] = React.useState(null)
      const [tripDeleting, setTripDeleting] = React.useState(null)
      const [removedTrips, setRemovedTrips] = React.useState([])
      const deleteAbort = React.useRef(null)
      const editAbort = React.useRef(null)
      const copyAbort = React.useRef(null)
      const tripAbort = React.useRef(null)
      React.useEffect(() => () => {
        deleteAbort.current?.abort()
        editAbort.current?.abort()
        copyAbort.current?.abort()
        tripAbort.current?.abort()
      }, [])
      const thumbs = useRbThumbs(baseRoutes, version)
      const detail = useRbResource(
        openId ? `routes/${encodeURIComponent(openId)}` : '',
        version,
        !!openId,
      )

      /* 本地覆盖层：PATCH / 复制成功后立即反映到卡片，再等列表重取回来 */
      const routes = baseRoutes
        .map((route) => (overlay[route.id] ? { ...route, ...overlay[route.id] } : route))
        .filter((route) => !route.tripId || removedTrips.indexOf(String(route.tripId)) < 0)
      const ordered = highlightId
        ? [...routes].sort((a, b) => {
            if (String(a.id) === String(highlightId)) return -1
            if (String(b.id) === String(highlightId)) return 1
            return 0
          })
        : routes

      /* 行程分组：同一 tripId 的路线收进一个分组，按 dayIndex 升序；零散路线保持原顺序 */
      const groups = (() => {
        const out = []
        const byTrip = new Map()
        ordered.forEach((route) => {
          const tripId = route.tripId ? String(route.tripId) : ''
          if (!tripId) {
            out.push({ kind: 'route', route, key: `route-${route.id}` })
            return
          }
          let group = byTrip.get(tripId)
          if (!group) {
            group = {
              kind: 'trip',
              tripId,
              title: String(route.tripTitle || '未命名行程'),
              routes: [],
              key: `trip-${tripId}`,
            }
            byTrip.set(tripId, group)
            out.push(group)
          } else if (!route.tripTitle && group.title === '未命名行程') {
            group.title = String(route.tripTitle)
          }
          group.routes.push(route)
        })
        out.forEach((item) => {
          if (item.kind !== 'trip') return
          item.routes.sort((a, b) => rbDayNumber(a.dayIndex, 0) - rbDayNumber(b.dayIndex, 0))
          item.distanceM = item.routes.reduce((sum, route) => {
            const value = numOf(route.distanceM)
            return value === null ? sum : sum + value
          }, 0)
          item.collapsed = !!collapsedTrips[item.tripId]
        })
        return out
      })()

      /* 菜单点开时点外面关闭（RMB / 触屏都走 pointerdown）；不用 click，避免和菜单项竞争 */
      React.useEffect(() => {
        if (!menuId) return undefined
        const onDown = (event) => {
          const node = event?.target
          if (node && typeof node.closest === 'function'
            && node.closest('[data-gp-rb-menu], [data-gp-rb-menu-btn]')) return
          setMenuId(null)
        }
        document.addEventListener('pointerdown', onDown, true)
        return () => document.removeEventListener('pointerdown', onDown, true)
      }, [menuId])

      const remove = async (id) => {
        if (deleting) return
        setDeleting(true)
        deleteAbort.current?.abort()
        const controller = new AbortController()
        deleteAbort.current = controller
        try {
          const res = await fetch(`${RB}/routes/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            signal: controller.signal,
          })
          const data = await res.json().catch(() => null)
          if (!res.ok || (data && data.status && data.status !== 'ok')) {
            throw new Error(rbErrorText(data, `删除失败（HTTP ${res.status}）`))
          }
          if (openId === id) setOpenId(null)
          setConfirmId(null)
          setMenuId(null)
          setOverlay((prev) => {
            if (!Object.prototype.hasOwnProperty.call(prev, id)) return prev
            const next = { ...prev }
            delete next[id]
            return next
          })
          showToast?.('路书已删除')
          onRefresh?.()
        } catch (err) {
          if (err?.name !== 'AbortError') showToast?.(`删除失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setDeleting(false)
        }
      }

      /** 删除整个行程：DELETE /roadbook/trips/:tripId；先本地隐藏，再刷新列表 */
      const removeTrip = async (group) => {
        if (tripDeleting) return
        setTripDeleting(group.tripId)
        tripAbort.current?.abort()
        const controller = new AbortController()
        tripAbort.current = controller
        try {
          const data = await rbRequest('DELETE', `trips/${encodeURIComponent(group.tripId)}`, undefined, controller.signal)
          if (!data || data.status !== 'ok') throw new Error(rbErrorText(data, '删除行程失败'))
          setRemovedTrips((prev) => (prev.indexOf(group.tripId) >= 0 ? prev : [...prev, group.tripId]))
          setTripConfirm(null)
          const openRoute = openId ? routes.find((route) => String(route.id) === String(openId)) : null
          if (openRoute && String(openRoute.tripId || '') === group.tripId) setOpenId(null)
          showToast?.('行程已删除')
          onRefresh?.()
        } catch (err) {
          if (err?.name !== 'AbortError') showToast?.(`删除行程失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setTripDeleting(null)
        }
      }

      const beginEdit = (route, mode) => {
        setMenuId(null)
        setConfirmId(null)
        editAbort.current?.abort()
        setEdit({
          id: route.id,
          mode,
          value: mode === 'name' ? String(route.name || '') : String(route.description || ''),
          saving: false,
          error: '',
        })
      }

      const cancelEdit = () => {
        if (edit?.saving) return
        editAbort.current?.abort()
        setEdit(null)
      }

      const saveEdit = async () => {
        if (!edit || edit.saving) return
        const isName = edit.mode === 'name'
        const value = String(edit.value ?? '').trim()
        if (isName && !value) {
          setEdit((prev) => (prev ? { ...prev, error: '名称不能为空' } : prev))
          return
        }
        if (isName && value.length > 80) {
          setEdit((prev) => (prev ? { ...prev, error: '名称最多 80 个字符' } : prev))
          return
        }
        if (!isName && String(edit.value ?? '').length > 500) {
          setEdit((prev) => (prev ? { ...prev, error: '描述最多 500 个字符' } : prev))
          return
        }
        const id = edit.id
        const field = isName ? 'name' : 'description'
        const snapshot = overlay[id]
        editAbort.current?.abort()
        const controller = new AbortController()
        editAbort.current = controller
        /* 乐观更新：先改卡片，失败再回滚，保证「保存后名字立刻变」 */
        setOverlay((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: isName ? value : edit.value } }))
        setEdit((prev) => (prev ? { ...prev, saving: true, error: '' } : prev))
        try {
          const route = await rbPatchRoute(id, isName ? { name: value } : { description: value }, controller.signal)
          const serverValue = isName
            ? (route.name === undefined ? value : route.name)
            : (route.description === undefined ? value : route.description)
          setOverlay((prev) => ({
            ...prev,
            [id]: {
              ...(prev[id] || {}),
              [field]: serverValue,
              updatedAt: route.updatedAt || new Date().toISOString(),
            },
          }))
          setEdit(null)
          showToast?.(isName ? '已重命名' : '描述已保存')
          onRefresh?.()
        } catch (err) {
          if (err?.name === 'AbortError') return
          setOverlay((prev) => {
            if (snapshot === undefined) {
              const next = { ...prev }
              delete next[id]
              return next
            }
            return { ...prev, [id]: snapshot }
          })
          setEdit((prev) => (prev ? { ...prev, saving: false, error: String(err?.message ?? err) } : prev))
        }
      }

      const copyRoute = async (route) => {
        if (copyingId) return
        setMenuId(null)
        copyAbort.current?.abort()
        const controller = new AbortController()
        copyAbort.current = controller
        setCopyingId(route.id)
        try {
          const detailRes = await fetch(`${RB}/routes/${encodeURIComponent(route.id)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          })
          if (!detailRes.ok) throw new Error(`HTTP ${detailRes.status}`)
          const detailData = await detailRes.json().catch(() => null)
          const full = detailData?.route || detailData || {}
          const pts = rbPoints(full.points)
          if (pts.length < 2) throw new Error('原路书没有可复制的轨迹点')
          const data = await rbPost('save', {
            name: `${route.name || '未命名路书'} 副本`,
            source: route.source || 'gpx',
            points: pts,
            elevation: full.elevation,
            distanceM: full.distanceM ?? route.distanceM,
            durationSec: full.durationSec,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '复制失败'))
          showToast?.('已复制路线')
          onRefresh?.()
        } catch (err) {
          if (err?.name !== 'AbortError') showToast?.(`复制失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setCopyingId(null)
        }
      }

      const exportLink = (route) => h('a', {
        className: 'gp-btn',
        href: `${RB}/routes/${encodeURIComponent(route.id)}/gpx`,
        download: `${route.name || route.id}.gpx`,
        title: '导出 GPX',
        'data-gp-rb-export': String(route.id),
        onClick: () => showToast?.('GPX 下载已开始'),
      }, '导出 GPX')

      const editBox = (route) => {
        if (!edit || String(edit.id) !== String(route.id)) return null
        const isName = edit.mode === 'name'
        return h('div', {
          className: 'gp-rb-editbox',
          'data-gp-rb-edit': isName ? 'name' : 'desc',
          'data-gp-rb-edit-id': String(route.id),
        },
          isName
            ? h('input', {
                className: 'gp-rb-input',
                value: edit.value,
                placeholder: '路书名称（最多 80 字）',
                maxLength: 80,
                spellCheck: false,
                autoFocus: true,
                onChange: (event) => {
                  const value = event.target.value
                  setEdit((prev) => (prev ? { ...prev, value } : prev))
                },
                onKeyDown: (event) => {
                  if (event.key === 'Enter') { event.preventDefault(); saveEdit() }
                  if (event.key === 'Escape') cancelEdit()
                },
                'data-gp-rb-rename-input': String(route.id),
              })
            : h('textarea', {
                className: 'gp-rb-textarea',
                value: edit.value,
                placeholder: '补一句路线说明，例如「沿湖多，适合晨骑」（最多 500 字）',
                maxLength: 500,
                autoFocus: true,
                onChange: (event) => {
                  const value = event.target.value
                  setEdit((prev) => (prev ? { ...prev, value } : prev))
                },
                'data-gp-rb-desc-input': String(route.id),
              }),
          h('div', { className: 'gp-rb-editbox-row' },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              onClick: saveEdit,
              disabled: edit.saving,
              'data-gp-rb-edit-save': String(route.id),
            }, edit.saving ? '保存中…' : '保存'),
            h('button', {
              type: 'button',
              className: 'gp-btn',
              onClick: cancelEdit,
              disabled: edit.saving,
              'data-gp-rb-edit-cancel': String(route.id),
            }, '取消'),
            isName
              ? null
              : h('span', { className: 'gp-rb-hint gp-rb-count' },
                  `${String(edit.value || '').length}/500`)),
          edit.error
            ? h('div', { className: 'gp-rb-error', 'data-gp-rb-edit-error': '1' }, edit.error)
            : null)
      }

      const menuItem = (label, attrs, onClick, cls = '') => h('button', {
        type: 'button',
        role: 'menuitem',
        className: `gp-rb-menu-item${cls ? ` ${cls}` : ''}`,
        onClick,
        ...attrs,
      }, label)

      const card = (route) => {
        const src = rbSource(route.source)
        const open = openId === route.id
        const thumb = thumbs[route.id]
        const isNew = highlightId !== null && String(highlightId) === String(route.id)
        const description = String(route.description || '').trim()
        const updated = timePart(stampText(route.updatedAt))
        const editing = edit && String(edit.id) === String(route.id)
        return h('div', {
          className: `gp-rb-card${open ? ' is-open' : ''}${isNew ? ' is-new' : ''}`,
          key: route.id,
          'data-gp-rb-route': String(route.id),
          'data-gp-rb-new': isNew ? '1' : undefined,
        },
          h('div', { className: 'gp-rb-ch' },
            route.tripId && numOf(route.dayIndex) !== null
              ? h('span', {
                  className: 'gp-rb-daybadge',
                  'data-gp-rb-daybadge': String(route.id),
                }, `D${rbDayNumber(route.dayIndex, 0) + 1}`)
              : null,
            h('div', { className: 'gp-rb-name', title: route.name }, route.name || '未命名路书'),
            h('span', { className: `gp-rb-chip ${src.cls}` }, src.label),
            isNew ? h('span', { className: 'gp-rb-newtag', 'data-gp-rb-newtag': '1' }, '刚刚保存') : null),
          editBox(route),
          !(editing && edit.mode === 'desc') && description
            ? h('div', {
                className: 'gp-rb-desc',
                title: description,
                'data-gp-rb-desc': String(route.id),
              }, description)
            : null,
          h('div', { className: 'gp-rb-meta' },
            h('span', null, '距离 ', h('b', null, rbKm(numOf(route.distanceM)))),
            h('span', null, '爬升 ', h('b', null, rbMeter(numOf(route.elevationGainM)))),
            h('span', null, '点数 ', h('b', null, rbPointCount(numOf(route.pointCount)))),
            h('span', null, '保存 ', h('b', null, rbDay(route.createdAt))),
            updated
              ? h('span', {
                  className: 'gp-rb-updated',
                  title: `更新于 ${updated}`,
                  'data-gp-rb-updated': String(route.id),
                }, '更新于 ', h('b', null, updated))
              : null),
          thumb?.points
            ? h('div', { className: 'gp-rb-thumb' },
                h(TrackPreview, {
                  compact: true,
                  points: thumb.points,
                  distanceM: thumb.distanceM,
                  elevationGainM: thumb.elevationGainM,
                }))
            : null,
          open
            ? h('div', { className: 'gp-rb-expand', 'data-gp-rb-preview': String(route.id) },
                detail.loading
                  ? h('div', { className: 'gp-rb-loading' },
                      h('i', { className: 'gp-rb-spin', 'aria-hidden': true }),
                      '正在加载路线…')
                  : detail.error
                    ? h('div', { className: 'gp-rb-error' }, `预览失败：${detail.error}`)
                    : detail.data?.status === 'not_found'
                      ? h('div', { className: 'gp-rb-error' }, '路书不存在或已被删除')
                      : detail.data?.status === 'error'
                        ? h('div', { className: 'gp-rb-error' }, rbErrorText(detail.data, '路书读取失败'))
                        : h('div', null,
                        h(TrackPreview, {
                          points: detail.data?.points,
                          elevation: detail.data?.elevation,
                          distanceM: detail.data?.distanceM ?? route.distanceM,
                          elevationGainM: detail.data?.elevationGainM ?? route.elevationGainM,
                          height: 210,
                        }),
                        h('div', { className: 'gp-rb-hint' },
                          `来源 ${src.label} · 保存于 ${rbDay(route.createdAt)}`)))
            : null,
          h('div', { className: 'gp-rb-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn',
              onClick: () => { setMenuId(null); setOpenId(open ? null : route.id) },
              'data-gp-rb-preview-toggle': String(route.id),
            }, open ? '收起' : '预览'),
            exportLink(route),
            h('div', { className: 'gp-rb-menu-wrap' },
              h('button', {
                type: 'button',
                className: 'gp-btn gp-rb-more',
                title: '更多操作',
                'aria-label': '更多操作',
                'aria-expanded': menuId === route.id ? 'true' : 'false',
                onClick: () => setMenuId(menuId === route.id ? null : route.id),
                'data-gp-rb-menu-btn': String(route.id),
              }, '⋮'),
              menuId === route.id
                ? h('div', { className: 'gp-rb-menu', role: 'menu', 'data-gp-rb-menu': String(route.id) },
                    menuItem('重命名', { 'data-gp-rb-rename': String(route.id) }, () => beginEdit(route, 'name')),
                    menuItem('编辑描述', { 'data-gp-rb-edit-desc': String(route.id) }, () => beginEdit(route, 'desc')),
                    menuItem(
                      copyingId === route.id ? '复制中…' : '复制路线',
                      { 'data-gp-rb-copy': String(route.id), disabled: copyingId === route.id },
                      () => copyRoute(route),
                    ),
                    menuItem('删除', { 'data-gp-rb-delete': String(route.id) }, () => {
                      setMenuId(null)
                      setConfirmId(route.id)
                    }, 'danger'))
                : null)),
          confirmId === route.id
            ? h('div', { className: 'gp-rb-confirm', 'data-gp-rb-confirm': String(route.id) },
                h('span', null, `删除「${route.name || '未命名路书'}」？`),
                h('button', {
                  type: 'button',
                  className: 'gp-btn',
                  onClick: () => setConfirmId(null),
                  disabled: deleting,
                }, '取消'),
                h('button', {
                  type: 'button',
                  className: 'gp-btn danger',
                  onClick: () => remove(route.id),
                  disabled: deleting,
                  'data-gp-rb-delete-yes': String(route.id),
                }, deleting ? '删除中…' : '删除'))
            : null)
      }

      const tripSection = (group) => {
        const collapsed = !!group.collapsed
        const confirming = tripConfirm === group.tripId
        const deletingTrip = tripDeleting === group.tripId
        const dayCount = group.routes.length
        return h('section', {
          className: 'gp-rb-tripgroup',
          key: group.key,
          'data-gp-rb-trip-group': group.tripId,
        },
          h('div', { className: 'gp-rb-tripgroup-hd' },
            h('button', {
              type: 'button',
              className: 'gp-rb-tripgroup-toggle',
              'aria-expanded': collapsed ? 'false' : 'true',
              'data-gp-rb-group-toggle': group.tripId,
              onClick: () => setCollapsedTrips((prev) => ({ ...prev, [group.tripId]: !collapsed })),
            },
              h('span', { className: 'gp-rb-triparrow', 'aria-hidden': true }, collapsed ? '▸' : '▾'),
              h('span', {
                className: 'gp-rb-tripgroup-title',
                title: group.title,
                'data-gp-rb-group-title': group.tripId,
              }, group.title),
              h('span', {
                className: 'gp-rb-tripgroup-meta',
                'data-gp-rb-group-meta': group.tripId,
              }, `${dayCount} 天 · 总里程 ${rbKm(group.distanceM)}`)),
            h('button', {
              type: 'button',
              className: 'gp-btn gp-rb-tripgroup-del',
              'data-gp-rb-group-delete': group.tripId,
              onClick: () => setTripConfirm(confirming ? null : group.tripId),
            }, '删除行程')),
          confirming
            ? h('div', { className: 'gp-rb-confirm', 'data-gp-rb-group-confirm': group.tripId },
                h('span', null, `删除「${group.title}」整个行程？${dayCount} 天路线一并删除。`),
                h('button', {
                  type: 'button',
                  className: 'gp-btn',
                  onClick: () => setTripConfirm(null),
                  disabled: deletingTrip,
                }, '取消'),
                h('button', {
                  type: 'button',
                  className: 'gp-btn danger',
                  onClick: () => removeTrip(group),
                  disabled: deletingTrip,
                  'data-gp-rb-group-delete-yes': group.tripId,
                }, deletingTrip ? '删除中…' : '删除'))
            : null,
          collapsed
            ? null
            : h('div', {
                className: 'gp-rb-grid gp-rb-tripgroup-grid',
                'data-gp-rb-trip-grid': group.tripId,
              }, group.routes.map(card)))
      }

      let body = null
      if (list.loading && !list.data) {
        body = h('div', { className: 'gp-rb-grid', 'data-gp-rb-list-loading': '1' },
          [0, 1, 2].map((i) => h('div', { className: 'gp-rb-skel', key: i },
            h('div', { className: 'gp-skel', style: { height: 15, width: '58%' } }),
            h('div', { className: 'gp-skel', style: { height: 11, width: '82%' } }),
            h('div', { className: 'gp-skel', style: { height: 58 } }))))
      } else if (list.error) {
        body = h('div', { className: 'gp-rb-error' },
          `路书列表加载失败：${list.error}`,
          h('button', {
            type: 'button',
            className: 'gp-btn',
            style: { marginLeft: 10 },
            onClick: () => onRefresh?.(),
          }, '重试'))
      } else if (!routes.length) {
        body = h('div', { className: 'gp-rb-empty', 'data-gp-rb-empty': '1' },
          h('div', { className: 'gp-rb-empty-ic', 'aria-hidden': true },
            h('svg', { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none' },
              h('path', {
                d: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z',
                stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round',
              }),
              h('circle', { cx: 9, cy: 11, r: 1.5, fill: 'currentColor' }))),
          h('div', { className: 'big' }, '还没有保存的路书'),
          h('div', null, '从行者导入、上传 GPX，或让 AI 规划一条骑行路线。'),
          h('div', { className: 'gp-rb-actions', style: { marginTop: 6, justifyContent: 'center' } },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              onClick: () => onGoTab?.('import'),
              'data-gp-rb-empty-import': '1',
            }, '去导入'),
            h('button', {
              type: 'button',
              className: 'gp-btn',
              onClick: () => onGoTab?.('plan'),
              'data-gp-rb-empty-plan': '1',
            }, 'AI 规划')))
      } else {
        const blocks = []
        let run = []
        const flush = () => {
          if (!run.length) return
          blocks.push(h('div', {
            className: 'gp-rb-grid',
            key: `rb-grid-${blocks.length}`,
            'data-gp-rb-grid': '1',
          }, run))
          run = []
        }
        groups.forEach((item) => {
          if (item.kind === 'trip') {
            flush()
            blocks.push(tripSection(item))
            return
          }
          run.push(card(item.route))
        })
        flush()
        body = h('div', null, blocks, h(GarminGuide, {}))
      }

      const hint = routes.length
        ? `${routes.length} 条 · 点击预览展开轨迹与海拔${highlightId !== null ? ' · 新保存的路书已置顶' : ''}`
        : '保存后在这里管理'

      return h('div', { className: 'gp-rb-tabpanel', 'data-gp-rb-panel': 'mine' },
        h('div', { className: 'gp-rb-sechead' },
          h('h2', null, '我的路书'),
          h('span', { className: 'hint' }, hint)),
        body)
    }

    /* ------------------------------ 导入 ------------------------------ */
    function RouteImportTab({ status, onSaved, onStatus, showToast, onGoTab, onGoPlan, onOpenSettings = null }) {
      const [num, setNum] = React.useState('')
      const [xPhase, setXPhase] = React.useState('idle')
      const [xRoute, setXRoute] = React.useState(null)
      const [xError, setXError] = React.useState('')
      const [auth, setAuth] = React.useState({ phase: 'idle', error: '', waited: 0 })
      const [gpx, setGpx] = React.useState({ phase: 'idle', name: '', size: 0, error: '', route: null })
      const xingzheReady = status?.data ? !!status.data.xingzheConfigured : true
      const xAbort = React.useRef(null)
      const authAbort = React.useRef(null)
      const saveAbort = React.useRef(null)
      const importAbort = React.useRef(null)
      const pollAbort = React.useRef(null)
      const pollTimer = React.useRef(null)
      const pollBusy = React.useRef(false)
      const alive = React.useRef(true)
      const fileRef = React.useRef(null)

      React.useEffect(() => () => {
        alive.current = false
        if (pollTimer.current) {
          clearInterval(pollTimer.current)
          pollTimer.current = null
        }
        xAbort.current?.abort()
        authAbort.current?.abort()
        saveAbort.current?.abort()
        importAbort.current?.abort()
        pollAbort.current?.abort()
      }, [])

      const stopPoll = () => {
        if (pollTimer.current) {
          clearInterval(pollTimer.current)
          pollTimer.current = null
        }
      }

      const loadXingzhe = async (raw) => {
        const text = String(raw ?? '').trim()
        const id = (/\d{3,}/.exec(text) || [])[0]
        if (!id) {
          setXPhase('error')
          setXError('请输入路书编号或链接，例如 #850821')
          return
        }
        xAbort.current?.abort()
        const controller = new AbortController()
        xAbort.current = controller
        setXPhase('loading')
        setXError('')
        setXRoute(null)
        try {
          const res = await fetch(`${RB}/xingzhe/${encodeURIComponent(id)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          })
          const data = await res.json().catch(() => null)
          if (!alive.current) return
          if (data?.status === 'ok') {
            setXRoute(data)
            setXPhase('preview')
            return
          }
          if (data?.status === 'auth_required') {
            setXPhase('auth')
            setAuth({ phase: 'idle', error: '', waited: 0 })
            return
          }
          if (data?.status === 'not_found') {
            setXPhase('error')
            setXError(`未找到路书 #${id}，请检查编号`)
            return
          }
          setXPhase('error')
          setXError(rbErrorText(data, `获取失败（HTTP ${res.status}）`))
        } catch (err) {
          if (err?.name === 'AbortError' || !alive.current) return
          setXPhase('error')
          setXError(String(err?.message ?? err))
        }
      }

      const authorize = async () => {
        stopPoll()
        const target = num
        setAuth({ phase: 'starting', error: '', waited: 0 })
        authAbort.current?.abort()
        const authController = new AbortController()
        authAbort.current = authController
        try {
          const res = await fetch(`${RB}/auth-url`, {
            headers: { Accept: 'application/json' },
            signal: authController.signal,
          })
          const data = await res.json().catch(() => null)
          if (!data?.url) throw new Error(data?.message || '未能获取行者授权链接')
          try { window.open(data.url, '_blank') } catch { /* 弹窗被拦截时仍继续轮询 */ }
          if (!alive.current) return
          setAuth({ phase: 'waiting', error: '', waited: 0 })
          let ticks = 0
          pollTimer.current = setInterval(async () => {
            if (!alive.current) return
            if (pollBusy.current) return
            pollBusy.current = true
            ticks += 1
            try {
              pollAbort.current?.abort()
              const pollController = new AbortController()
              pollAbort.current = pollController
              const r = await fetch(`${RB}/auth-status`, {
                headers: { Accept: 'application/json' },
                signal: pollController.signal,
              })
              const st = await r.json().catch(() => null)
              if (!alive.current) return
              if (st?.authorized) {
                stopPoll()
                setAuth({ phase: 'ok', error: '', waited: ticks * 2 })
                onStatus?.()
                loadXingzhe(target)
                return
              }
              if (st?.error) {
                stopPoll()
                setAuth({ phase: 'error', error: String(st.error), waited: ticks * 2 })
                return
              }
              if (ticks >= 45) {
                stopPoll()
                setAuth({
                  phase: 'timeout',
                  error: '授权超时，请确认行者 App 内已完成授权后重试',
                  waited: 90,
                })
                return
              }
              setAuth({ phase: 'waiting', error: '', waited: ticks * 2 })
            } catch {
              if (!alive.current) return
              if (ticks >= 45) {
                stopPoll()
                setAuth({ phase: 'timeout', error: '授权超时，请稍后重试', waited: 90 })
              }
            } finally {
              pollBusy.current = false
            }
          }, 2000)
        } catch (err) {
          if (err?.name === 'AbortError') return
          setAuth({ phase: 'error', error: String(err?.message ?? err), waited: 0 })
        }
      }

      const saveXingzhe = async () => {
        if (!xRoute) return
        setXPhase('saving')
        setXError('')
        saveAbort.current?.abort()
        const controller = new AbortController()
        saveAbort.current = controller
        try {
          const data = await rbPost('import', {
            source: 'xingzhe',
            id: xRoute.id,
            name: xRoute.name,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '保存失败'))
          setXPhase('saved')
          onSaved?.()
          showToast?.('已保存为我的路书')
        } catch (err) {
          if (err?.name === 'AbortError') return
          setXPhase('preview')
          setXError(String(err?.message ?? err))
          showToast?.(`保存失败：${String(err?.message ?? err)}`, 'err')
        }
      }

      const onFile = (event) => {
        const input = event?.target
        const file = input?.files?.[0]
        if (!file) return
        const name = String(file.name || 'route.gpx').replace(/\.gpx$/i, '')
        setGpx({ phase: 'reading', name, size: file.size, error: '', route: null })
        const reader = new FileReader()
        reader.onerror = () => {
          if (alive.current) setGpx({ phase: 'error', name, size: file.size, error: '文件读取失败', route: null })
        }
        reader.onload = async () => {
          const text = String(reader.result || '')
          if (!alive.current) return
          if (!/<gpx[\s>]/i.test(text)) {
            setGpx({
              phase: 'error',
              name,
              size: file.size,
              error: '不是有效的 GPX 文件（缺少 <gpx> 根节点）',
              route: null,
            })
            return
          }
          setGpx((prev) => ({ ...prev, phase: 'saving' }))
          importAbort.current?.abort()
          const importController = new AbortController()
          importAbort.current = importController
          try {
            const data = await rbPost('import', { source: 'gpx', name, gpx: text }, importController.signal)
            if (data?.status !== 'ok') throw new Error(rbErrorText(data, '导入失败'))
            if (!alive.current) return
            /* 导入接口只回 meta，预览用的轨迹/海拔再取一次完整路书（失败不影响导入成功） */
            let savedRoute = data.route || null
            if (savedRoute?.id) {
              try {
                const detailRes = await fetch(`${RB}/routes/${encodeURIComponent(savedRoute.id)}`, {
                  headers: { Accept: 'application/json' },
                  signal: importController.signal,
                })
                if (detailRes.ok) {
                  const detail = await detailRes.json().catch(() => null)
                  const full = detail?.route || detail
                  if (full && typeof full === 'object') savedRoute = { ...savedRoute, ...full }
                }
              } catch { /* 预览失败时保留 meta */ }
            }
            if (!alive.current) return
            setGpx({ phase: 'saved', name, size: file.size, error: '', route: savedRoute })
            onSaved?.()
            showToast?.('GPX 已导入')
          } catch (err) {
            if (!alive.current || err?.name === 'AbortError') return
            setGpx({ phase: 'error', name, size: file.size, error: String(err?.message ?? err), route: null })
          }
        }
        reader.readAsText(file)
        try { input.value = '' } catch { /* ignore */ }
      }

      const xzPreview = xRoute
        ? h('div', { className: 'gp-rb-xz-preview', 'data-gp-rb-xz-preview': '1' },
            h('div', { className: 'gp-rb-ch' },
              h('div', { className: 'gp-rb-name', title: xRoute.name }, xRoute.name || '行者路书'),
              h('span', { className: 'gp-rb-chip xz' }, '行者')),
            h(TrackPreview, {
              points: xRoute.points,
              elevation: xRoute.elevation,
              distanceM: xRoute.distanceM,
              elevationGainM: xRoute.elevationGainM,
              height: 190,
            }),
            h('div', { className: 'gp-rb-meta' },
              h('span', null, '距离 ', h('b', null, rbKm(numOf(xRoute.distanceM)))),
              h('span', null, '爬升 ', h('b', null, rbMeter(numOf(xRoute.elevationGainM)))),
              h('span', null, '点数 ', h('b', null, rbPointCount(numOf(xRoute.points?.length)))),
              h('span', null, '编号 ', h('b', null, `#${xRoute.id}`))),
            xError ? h('div', { className: 'gp-rb-error' }, xError) : null,
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn primary',
                onClick: saveXingzhe,
                disabled: xPhase === 'saving' || xPhase === 'saved',
                'data-gp-rb-xz-save': '1',
              }, xPhase === 'saved' ? '已保存' : xPhase === 'saving' ? '保存中…' : '保存为我的路书'),
              xPhase === 'saved'
                ? h('span', { className: 'gp-rb-ok', 'data-gp-rb-xz-saved': '1' }, '✓ 已加入我的路书')
                : null),
            xPhase === 'saved' ? h(GarminGuide, { open: true }) : null)
        : null

      const authPanel = h('div', { className: 'gp-rb-auth', 'data-gp-rb-auth': '1' },
        h('div', { className: 'gp-rb-auth-hd' },
          h('span', { className: 'tt' }, '需要授权行者账号'),
          auth.phase === 'ok' ? h('span', { className: 'gp-rb-chip gpx' }, '已授权') : null),
        h('div', { className: 'gp-rb-note' },
          auth.phase === 'waiting'
            ? `已打开授权页面，等待授权…（已等待 ${auth.waited} 秒）`
            : auth.phase === 'ok'
              ? '授权完成，正在重新获取路书…'
              : '行者路书需要行者账号授权后才能读取。点击下方按钮，在打开的页面完成授权。'),
        auth.error ? h('div', { className: 'gp-rb-error' }, auth.error) : null,
        h('button', {
          type: 'button',
          className: 'gp-btn primary',
          onClick: authorize,
          disabled: auth.phase === 'starting' || auth.phase === 'waiting' || !xingzheReady,
          'data-gp-rb-auth-btn': '1',
        }, auth.phase === 'waiting'
          ? '等待授权…'
          : auth.phase === 'starting' ? '正在打开…' : '授权行者'),
        auth.phase === 'waiting'
          ? h('div', { className: 'gp-rb-hint' }, '每 2 秒检查一次授权状态，最多等待 90 秒。')
          : null)

      const gpxSaved = gpx.route
        ? h('div', { className: 'gp-rb-xz-preview', 'data-gp-rb-gpx-preview': '1' },
            h('div', { className: 'gp-rb-ch' },
              h('div', { className: 'gp-rb-name' }, gpx.route.name || gpx.name || 'GPX 路书'),
              h('span', { className: 'gp-rb-chip gpx' }, 'GPX')),
            h(TrackPreview, {
              points: gpx.route.points,
              elevation: gpx.route.elevation,
              distanceM: gpx.route.distanceM,
              elevationGainM: gpx.route.elevationGainM,
              height: 170,
            }),
            h('div', { className: 'gp-rb-meta' },
              h('span', null, '距离 ', h('b', null, rbKm(numOf(gpx.route.distanceM)))),
              h('span', null, '爬升 ', h('b', null, rbMeter(numOf(gpx.route.elevationGainM)))),
              h('span', null, '点数 ', h('b', null, rbPointCount(numOf(gpx.route.pointCount)))),
              h('span', null, '保存 ', h('b', null, rbDay(gpx.route.createdAt)))),
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn',
                onClick: () => onGoTab?.('mine'),
              }, '查看我的路书')),
            h(GarminGuide, { open: true }))
        : null

      return h('div', { className: 'gp-rb-tabpanel', 'data-gp-rb-panel': 'import' },
        h('div', { className: 'gp-rb-sechead' },
          h('h2', null, '导入路书'),
          h('span', { className: 'hint' }, '行者编号直连或上传 GPX 文件')),
        h('div', { className: 'gp-rb-grid2' },
          h('section', { className: 'gp-rb-sec', 'data-gp-rb-xingzhe': '1' },
            h('h3', null, '行者路书'),
            h('label', { className: 'gp-rb-field' },
              h('span', { className: 'gp-rb-lab' }, '路书编号或链接'),
              h('div', { className: 'gp-rb-inline' },
                h('input', {
                  className: 'gp-rb-input',
                  value: num,
                  placeholder: '#850821 / 链接',
                  spellCheck: false,
                  onChange: (e) => setNum(e.target.value),
                  onKeyDown: (e) => { if (e.key === 'Enter') loadXingzhe(num) },
                  'data-gp-rb-xz-input': '1',
                }),
                h('button', {
                  type: 'button',
                  className: 'gp-btn primary',
                  onClick: () => loadXingzhe(num),
                  disabled: xPhase === 'loading' || xPhase === 'saving' || !xingzheReady,
                  'data-gp-rb-xz-fetch': '1',
                }, xPhase === 'loading' ? '获取中…' : '获取'))),
            xingzheReady
              ? null
              : h('div', { className: 'gp-rb-muted gp-rb-setup', 'data-gp-rb-xingzhe-missing': '1' },
                  h('span', null, '未配置行者应用，暂时只能导入 GPX。'),
                  h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    onClick: () => onOpenSettings?.(),
                    'data-gp-rb-xz-settings': '1',
                  }, '去设置')),
            xPhase === 'idle'
              ? h('div', { className: 'gp-rb-hint' }, '输入行者 App 里路书的编号或分享链接，抓取轨迹后保存。')
              : null,
            xPhase === 'loading'
              ? h('div', { className: 'gp-rb-loading', 'data-gp-rb-xz-loading': '1' },
                  h('i', { className: 'gp-rb-spin', 'aria-hidden': true }),
                  '正在获取行者路书…')
              : null,
            xError && xPhase !== 'preview' && xPhase !== 'saving'
              ? h('div', { className: 'gp-rb-error', 'data-gp-rb-xz-error': '1' }, xError)
              : null,
            (xPhase === 'preview' || xPhase === 'saving' || xPhase === 'saved') ? xzPreview : null,
            xPhase === 'auth' ? authPanel : null),
          h('section', { className: 'gp-rb-sec', 'data-gp-rb-gpx': '1' },
            h('h3', null, 'GPX 文件'),
            h('div', { className: 'gp-rb-note' },
              '从行者 App 或其他工具导出 GPX 后，在本地选择文件即可导入。'),
            h('input', {
              type: 'file',
              accept: '.gpx,application/gpx+xml',
              ref: fileRef,
              className: 'gp-rb-file',
              onChange: onFile,
              'data-gp-rb-gpx-input': '1',
            }),
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn',
                onClick: () => fileRef.current?.click(),
                'data-gp-rb-gpx-pick': '1',
              }, '选择 GPX 文件'),
              gpx.name
                ? h('span', { className: 'gp-rb-hint' },
                    `${gpx.name}${gpx.size ? ` · ${Math.max(1, Math.round(gpx.size / 1024))} KB` : ''}`)
                : null),
            gpx.phase === 'reading' || gpx.phase === 'saving'
              ? h('div', { className: 'gp-rb-loading', 'data-gp-rb-gpx-loading': '1' },
                  h('i', { className: 'gp-rb-spin', 'aria-hidden': true }),
                  gpx.phase === 'reading' ? '正在读取文件…' : '正在解析并导入 GPX…')
              : null,
            gpx.error
              ? h('div', { className: 'gp-rb-error', 'data-gp-rb-gpx-error': '1' }, `导入失败：${gpx.error}`)
              : null,
            gpxSaved)),
        h('section', { className: 'gp-rb-sec gp-rb-sec-plain' },
          h('h3', null, '说明'),
          h('ol', { className: 'gp-rb-steps' },
            h('li', null, '打开行者 App → 路书详情 → 下载 GPX。'),
            h('li', null, '把 GPX 保存到手机或电脑。'),
            h('li', null, '回到本页「GPX 文件」选择文件导入。')),
          h('p', { className: 'gp-rb-note' },
            '实验性能力：编号直连依赖行者服务端的登录会话，是否可用由后端决定，前端不提供开关。请仅导入自己有权使用或已获授权的路书轨迹。'),
          onGoPlan
            ? h('button', {
                type: 'button',
                className: 'gp-rb-linkbtn',
                onClick: onGoPlan,
              }, '没有现成路书？让 AI 规划一条 →')
            : null))
    }

    /* ----------------------------- AI 规划 ----------------------------- */
    function RoutePlanTab({ status, onSaved, showToast, onOpenSettings = null }) {
      const amapConfigured = !!status?.data?.amapConfigured
      const amapValid = status?.data?.amapKeyValid !== false
      const amapReady = amapConfigured && amapValid
      const amapKnown = !!status?.data
      const aiAvailable = status?.data?.aiAvailable !== false && status?.data?.aiConfigured !== false
      const [prompt, setPrompt] = React.useState('')
      const [ai, setAi] = React.useState({ phase: 'idle', stage: -1, elapsed: 0, error: '', unavailable: false })
      const [result, setResult] = React.useState(null)
      const [resolved, setResolved] = React.useState(null)
      const [candidates, setCandidates] = React.useState([])
      const [expandedId, setExpandedId] = React.useState(null)
      const [savedIds, setSavedIds] = React.useState([])
      const [savingId, setSavingId] = React.useState(null)
      const [altFor, setAltFor] = React.useState(null)
      const [advancedOpen, setAdvancedOpen] = React.useState(false)
      const [fields, setFields] = React.useState({
        origin: '',
        destination: '',
        loop: false,
        targetDistanceKm: '',
        elevationTargetM: '',
        city: '',
      })
      const [via, setVia] = React.useState([])
      const [planPhase, setPlanPhase] = React.useState('idle')
      const [planError, setPlanError] = React.useState('')
      const [ambiguous, setAmbiguous] = React.useState(null)
      /* 多日行程：模式 / 参数 / 结果 / 分天展开与保存状态 */
      const [mode, setMode] = React.useState('single')
      const [tripDaysInput, setTripDaysInput] = React.useState(3)
      const [tripDistanceKm, setTripDistanceKm] = React.useState('')
      const [useWeb, setUseWeb] = React.useState(true)
      const [multiAi, setMultiAi] = React.useState({
        phase: 'idle', stage: -1, elapsed: 0, error: '', hint: '', detail: '',
        code: '', title: '', unavailable: false, diagnostics: null,
      })
      const [trip, setTrip] = React.useState(null)
      const [dayOpen, setDayOpen] = React.useState({})
      const [daySaving, setDaySaving] = React.useState(null)
      const [savedDayIds, setSavedDayIds] = React.useState([])
      const [dayRetrying, setDayRetrying] = React.useState(null)
      const [tripSaving, setTripSaving] = React.useState(false)
      const [tripSaved, setTripSaved] = React.useState(false)
      const [tripError, setTripError] = React.useState('')
      const aiAbort = React.useRef(null)
      const multiAbort = React.useRef(null)
      const tripSaveAbort = React.useRef(null)
      const daySaveAbort = React.useRef(null)
      const retryAbort = React.useRef(null)
      const multiStageTimer = React.useRef(null)
      const multiTickTimer = React.useRef(null)
      const multiStartedAt = React.useRef(0)
      const planAbort = React.useRef(null)
      const saveAbort = React.useRef(null)
      const stageTimer = React.useRef(null)
      const tickTimer = React.useRef(null)
      const startedAt = React.useRef(0)

      const clearTimers = React.useCallback(() => {
        if (stageTimer.current) {
          clearInterval(stageTimer.current)
          stageTimer.current = null
        }
        if (tickTimer.current) {
          clearInterval(tickTimer.current)
          tickTimer.current = null
        }
        if (multiStageTimer.current) {
          clearInterval(multiStageTimer.current)
          multiStageTimer.current = null
        }
        if (multiTickTimer.current) {
          clearInterval(multiTickTimer.current)
          multiTickTimer.current = null
        }
      }, [])

      React.useEffect(() => () => {
        clearTimers()
        aiAbort.current?.abort()
        multiAbort.current?.abort()
        tripSaveAbort.current?.abort()
        daySaveAbort.current?.abort()
        retryAbort.current?.abort()
        planAbort.current?.abort()
        saveAbort.current?.abort()
      }, [clearTimers])

      const elapsedNow = () => Math.max(0, Math.round((Date.now() - startedAt.current) / 1000))
      const elapsedMulti = () => Math.max(0, Math.round((Date.now() - multiStartedAt.current) / 1000))
      const setField = (key, value) => setFields((prev) => ({ ...prev, [key]: value }))

      /** AI 解析结果回填高级表单，让「换地点 / 手动微调」有据可依 */
      const syncFields = (parsed) => {
        const next = {
          origin: parsed.origin ? String(parsed.origin) : '',
          destination: parsed.destination ? String(parsed.destination) : '',
          loop: !!parsed.loop,
          targetDistanceKm: parsed.targetDistanceKm === null || parsed.targetDistanceKm === undefined
            ? '' : String(parsed.targetDistanceKm),
          elevationTargetM: parsed.elevationTargetM === null || parsed.elevationTargetM === undefined
            ? '' : String(parsed.elevationTargetM),
          city: parsed.city ? String(parsed.city) : '',
        }
        setFields(next)
        setVia(Array.isArray(parsed.viaPoints) ? parsed.viaPoints.map((value) => String(value)) : [])
        return next
      }

      const startTimers = () => {
        clearTimers()
        startedAt.current = Date.now()
        setAi({ phase: 'running', stage: 0, elapsed: 0, error: '', unavailable: false })
        stageTimer.current = setInterval(() => {
          setAi((prev) => (prev.phase === 'running'
            ? { ...prev, stage: Math.min(RB_AI_STAGES.length - 1, prev.stage + 1) }
            : prev))
        }, 1200)
        tickTimer.current = setInterval(() => {
          setAi((prev) => (prev.phase === 'running' ? { ...prev, elapsed: elapsedNow() } : prev))
        }, 400)
      }

      const startMultiTimers = () => {
        clearTimers()
        multiStartedAt.current = Date.now()
        setMultiAi({
          phase: 'running', stage: 0, elapsed: 0, error: '', hint: '', detail: '',
          code: '', title: '', unavailable: false, diagnostics: null,
        })
        multiStageTimer.current = setInterval(() => {
          setMultiAi((prev) => (prev.phase === 'running'
            ? { ...prev, stage: Math.min(RB_AI_MULTI_STAGES.length - 1, prev.stage + 1) }
            : prev))
        }, 1400)
        multiTickTimer.current = setInterval(() => {
          setMultiAi((prev) => (prev.phase === 'running' ? { ...prev, elapsed: elapsedMulti() } : prev))
        }, 400)
      }

      const resetTrip = () => {
        setTrip(null)
        setDayOpen({})
        setSavedDayIds([])
        setDaySaving(null)
        setDayRetrying(null)
        setTripSaving(false)
        setTripSaved(false)
        setTripError('')
      }

      /**
       * 失败响应 → 面板文案：按 code 取友好标题 / 说明 / 建议，
       * diagnostics.dayErrors 原样带进 state，供错误框里的「按天诊断」展开。
       */
      const multiErrorOf = (data, err) => {
        const code = String(data?.code || err?.code || '')
        const key = rbMultiErrorKey(code)
        const preset = RB_MULTI_ERRORS[key] || null
        const raw = String(data?.message || err?.message || (preset ? preset.message : '行程规划失败'))
        const diagnostics = data?.diagnostics || err?.diagnostics || null
        return {
          code: key || code,
          title: preset ? preset.title : '行程生成失败',
          /* INVALID_ITINERARY 保留「行程需求需要调整」前缀，但没返回 message 时只给友好文案 */
          message: key === 'INVALID_ITINERARY'
            ? `行程需求需要调整：${raw}`
            : preset ? preset.message : raw,
          /* 其它失败码把后端原文降级到「后端返回：…」，INVALID_ITINERARY 已在正文里 */
          detail: preset && key !== 'INVALID_ITINERARY' ? raw : '',
          hint: preset?.hint || '',
          unavailable: !!preset?.unavailable || /^(AI|LLM)_UNAVAILABLE$/.test(key) || !aiAvailable,
          diagnostics,
        }
      }

      /** 多日行程：一次 /ai-plan-multi；force 用于「换一批」 */
      const runMulti = async (force = false) => {
        const text = prompt.trim()
        if (!text) {
          setMultiAi({
            phase: 'error', stage: -1, elapsed: 0, code: '', title: '', detail: '',
            unavailable: false, hint: '', diagnostics: null,
            error: '先写一句行程需求，例如「环海南岛 8 天，人均每天 70–90 km，想走东线经典路段」',
          })
          return
        }
        if (!amapReady) return
        multiAbort.current?.abort()
        const controller = new AbortController()
        multiAbort.current = controller
        resetTrip()
        startMultiTimers()
        const dayCount = Math.max(
          RB_MULTI_MIN_DAYS,
          Math.min(RB_MULTI_MAX_DAYS, rbDayNumber(tripDaysInput, 3)),
        )
        const body = { prompt: text, days: dayCount, useWeb: !!useWeb }
        const totalKm = numOf(tripDistanceKm)
        if (totalKm !== null && totalKm > 0) body.totalDistanceKm = totalKm
        if (force) body.force = true
        try {
          const data = await rbPost('ai-plan-multi', body, controller.signal)
          if (data?.status !== 'ok') {
            const info = multiErrorOf(data, null)
            const error = new Error(info.message)
            error.code = info.code
            error.title = info.title
            error.detail = info.detail
            error.hint = info.hint
            error.unavailable = info.unavailable
            error.diagnostics = info.diagnostics
            error.info = info
            throw error
          }
          const tripData = data?.trip || {}
          const days = (Array.isArray(tripData.days) ? tripData.days : []).map((day, index) => ({
            ...day,
            dayIndex: day?.dayIndex === undefined ? index : rbDayNumber(day.dayIndex, index),
          }))
          if (!days.length) throw new Error('AI 没有返回可用的每日路线，请调整天数或需求后再试')
          const elapsed = elapsedMulti()
          clearTimers()
          setTrip({
            ...tripData,
            days,
            usedWeb: !!data.usedWeb,
            sources: Array.isArray(data.sources) ? data.sources : [],
          })
          setMultiAi({
            phase: 'done', stage: RB_AI_MULTI_STAGES.length - 1, elapsed,
            error: '', hint: '', detail: '', code: '', title: '', unavailable: false, diagnostics: null,
          })
        } catch (err) {
          if (err?.name === 'AbortError') return
          const elapsed = elapsedMulti()
          const info = err?.info || multiErrorOf(null, err)
          clearTimers()
          setMultiAi({
            phase: 'error', stage: -1, elapsed,
            error: info.message,
            title: info.title,
            detail: info.detail,
            hint: info.hint,
            code: info.code,
            unavailable: info.unavailable,
            diagnostics: info.diagnostics,
          })
        }
      }

      /** 保存多日行程中的一天：沿用 /roadbook/save，标题带上 D1/D2 前缀 */
      const saveDay = async (day, index) => {
        if (daySaving !== null) return
        const pts = rbPoints(day?.points)
        if (pts.length < 2) {
          showToast?.('这一天的路线还没有轨迹点，无法保存', 'err')
          return
        }
        const title = rbDayTitle(day, index)
        daySaveAbort.current?.abort()
        const controller = new AbortController()
        daySaveAbort.current = controller
        setDaySaving(index)
        setTripError('')
        try {
          const data = await rbPost('save', {
            name: `${String(trip?.title || '多日行程')} D${index + 1} ${title}`,
            description: String(day?.note || ''),
            source: 'ai',
            points: pts,
            elevation: day?.elevation,
            distanceM: numOf(day?.distanceM),
            durationSec: numOf(day?.durationSec),
            /* 行程上下文：后端在没有合法 tripId 时会落回独立路书，但字段照传，
               方便已绑定 tripId 的场景（或后续版本）直接归组 */
            tripTitle: String(trip?.title || ''),
            dayIndex: index,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '保存失败'))
          setSavedDayIds((prev) => (prev.indexOf(index) >= 0 ? prev : [...prev, index]))
          showToast?.('已保存这一天')
        } catch (err) {
          if (err?.name === 'AbortError') return
          setTripError(String(err?.message ?? err))
          showToast?.(`保存失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setDaySaving(null)
        }
      }

      /** 保存整个行程：POST /roadbook/trips/save，成功后由外壳切到「我的路书」 */
      const saveTrip = async () => {
        if (!trip || tripSaving) return
        const payload = []
        rbTripDays(trip).forEach((day, index) => {
          if (!rbDayOk(day)) return
          const pts = rbPoints(day.points)
          if (pts.length < 2) return
          payload.push({
            dayIndex: index,
            name: rbDayTitle(day, index),
            from: String(day.from || ''),
            to: String(day.to || ''),
            note: String(day.note || ''),
            points: pts,
            elevation: day.elevation,
            distanceM: numOf(day.distanceM),
            durationSec: numOf(day.durationSec),
          })
        })
        if (!payload.length) {
          setTripError('没有可保存的每日路线，请先重新生成或单独重试失败的天')
          return
        }
        tripSaveAbort.current?.abort()
        const controller = new AbortController()
        tripSaveAbort.current = controller
        setTripSaving(true)
        setTripError('')
        try {
          const data = await rbPost('trips/save', {
            title: String(trip.title || '多日骑行行程'),
            days: payload,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '行程保存失败'))
          setTripSaved(true)
          showToast?.(`行程已保存（${payload.length} 天）`)
          onSaved?.(Array.isArray(data.routes) && data.routes[0] ? data.routes[0] : { id: null })
        } catch (err) {
          if (err?.name === 'AbortError') return
          setTripError(String(err?.message ?? err))
          showToast?.(`保存失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setTripSaving(false)
        }
      }

      /** 失败的天单独重试：用这一天的 from→to 调 /ai-plan，再用候选覆盖当天 */
      const retryDay = async (day, index) => {
        if (dayRetrying !== null) return
        const from = String(day?.from || '').trim()
        const to = String(day?.to || '').trim()
        const km = numOf(day?.distanceM)
        const text = [
          from && to ? `${from} → ${to}` : (from || to || `第 ${index + 1} 天`),
          `第 ${index + 1} 天`,
          km !== null ? `约 ${Math.round(km / 1000)} km` : '',
          '请生成一条可骑行的路线',
        ].filter(Boolean).join('，')
        retryAbort.current?.abort()
        const controller = new AbortController()
        retryAbort.current = controller
        setDayRetrying(index)
        setTripError('')
        try {
          const data = await rbPost('ai-plan', { prompt: text }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '重新生成失败'))
          const cand = (Array.isArray(data.candidates) ? data.candidates : [])
            .find((item) => rbPoints(item?.points).length >= 2)
          if (!cand) throw new Error('没有生成可用的路线，请稍后再试')
          setTrip((prev) => {
            if (!prev) return prev
            const days = prev.days.map((item, i) => (i === index ? {
              ...item,
              status: 'ok',
              name: cand.name || item.name,
              summary: cand.summary || item.summary,
              difficulty: cand.difficulty || item.difficulty,
              difficultyReason: cand.difficultyReason || item.difficultyReason,
              distanceM: cand.distanceM ?? item.distanceM,
              durationSec: cand.durationSec ?? item.durationSec,
              elevationGainM: cand.elevationGainM ?? item.elevationGainM,
              elevationEstimated: cand.elevationEstimated ?? item.elevationEstimated,
              points: cand.points,
              elevation: cand.elevation,
            } : item))
            /* 单天重试后重算行程合计，避免头部仍显示旧的总里程 / 总爬升 */
            let sumDistance = 0
            let sumGain = 0
            days.forEach((item) => {
              if (!rbDayOk(item)) return
              const d = numOf(item.distanceM)
              const g = numOf(item.elevationGainM)
              if (d !== null) sumDistance += d
              if (g !== null) sumGain += g
            })
            return {
              ...prev,
              days,
              totalDistanceM: numOf(prev.totalDistanceM) !== null ? sumDistance : prev.totalDistanceM,
              totalElevationGainM: numOf(prev.totalElevationGainM) !== null ? sumGain : prev.totalElevationGainM,
            }
          })
          setDayOpen((prev) => ({ ...prev, [index]: true }))
          setSavedDayIds((prev) => prev.filter((i) => i !== index))
          showToast?.('已重新生成这一天')
        } catch (err) {
          if (err?.name === 'AbortError') return
          setTripError(String(err?.message ?? err))
        } finally {
          setDayRetrying(null)
        }
      }

      /** 一句话生成：只打一次 /ai-plan；force 用于「换一批」 */
      const runAi = async (force = false) => {
        const text = prompt.trim()
        if (!text) {
          setAi({
            phase: 'error',
            stage: -1,
            elapsed: 0,
            error: '先写一句规划需求，例如「周末从四明湖出发，60–80 km 环线，爬升 800 m 左右」',
            unavailable: false,
          })
          return
        }
        if (!amapReady) return
        aiAbort.current?.abort()
        const controller = new AbortController()
        aiAbort.current = controller
        setResult(null)
        setResolved(null)
        setCandidates([])
        setExpandedId(null)
        setAltFor(null)
        setAmbiguous(null)
        setPlanError('')
        setPlanPhase('idle')
        setSavedIds([])
        startTimers()
        try {
          const body = force ? { prompt: text, force: true } : { prompt: text }
          const data = await rbPost('ai-plan', body, controller.signal)
          if (data?.status !== 'ok') {
            const error = new Error(rbErrorText(data, 'AI 规划失败'))
            error.code = String(data?.code || '')
            throw error
          }
          const list = (Array.isArray(data.candidates) ? data.candidates : []).slice(0, 3)
          const parsed = data.parsed || {}
          syncFields(parsed)
          const elapsed = elapsedNow()
          clearTimers()
          setResult({ ...data, candidates: list })
          setResolved(data.resolved || null)
          setCandidates(list)
          setExpandedId(list[0]?.tempId ?? null)
          setAi({ phase: 'done', stage: RB_AI_STAGES.length - 1, elapsed, error: '', unavailable: false })
          if (!list.length) showToast?.('没有生成候选路线，补充距离或地点再试', 'err')
        } catch (err) {
          if (err?.name === 'AbortError') return
          const elapsed = elapsedNow()
          clearTimers()
          setAi({
            phase: 'error',
            stage: -1,
            elapsed,
            error: String(err?.message ?? err),
            /* host 的真实错误码是 LLM_UNAVAILABLE；AI_UNAVAILABLE 兼容旧 mock/网关 */
            unavailable: !aiAvailable || /^(AI|LLM)_UNAVAILABLE$/.test(String(err?.code || '')),
          })
        }
      }

      /** 手动规划：高级选项与「换地点」共用；返回 {status} 供调用方判断 */
      const runPlan = async (override = null, viaOverride = null, options = {}) => {
        if (!amapReady) return { status: 'off' }
        const merged = override ? { ...fields, ...override } : fields
        const origin = String(merged.origin || '').trim()
        const destination = String(merged.destination || '').trim()
        const viaList = Array.isArray(viaOverride) ? viaOverride : via
        const body = {
          origin,
          destination,
          loop: !!merged.loop,
          viaPoints: viaList.map((value) => String(value).trim()).filter(Boolean),
          targetDistanceKm: numOf(merged.targetDistanceKm),
          elevationTargetM: numOf(merged.elevationTargetM),
          city: String(merged.city || '').trim(),
        }
        if (options.autoPick) body.autoPick = true
        if (!origin || (!destination && !body.loop)) {
          setPlanPhase('error')
          setPlanError(!origin
            ? '请填写起点（也可以先用一句话生成）'
            : '请填写终点，或勾选环线')
          return { status: 'invalid' }
        }
        planAbort.current?.abort()
        const controller = new AbortController()
        planAbort.current = controller
        setPlanPhase('loading')
        setPlanError('')
        setAmbiguous(null)
        try {
          const data = await rbPost('plan', body, controller.signal)
          if (data?.status === 'ambiguous') {
            const list = Array.isArray(data.candidates) ? data.candidates : []
            const place = String(data.place || '')
            const backendField = typeof data.field === 'string' ? data.field : ''
            const field = /^(origin|destination|viaPoints\[\d+\])$/.test(backendField)
              ? backendField
              : (place && place === body.destination ? 'destination' : 'origin')
            setAmbiguous({ place, field, candidates: list })
            setPlanPhase('ambiguous')
            return { status: 'ambiguous', data }
          }
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '规划失败'))
          const list = Array.isArray(data.candidates) ? data.candidates : []
          setCandidates(list)
          setExpandedId(list[0]?.tempId ?? null)
          setSavedIds([])
          setPlanPhase(list.length ? 'candidates' : 'empty')
          return { status: 'ok', data, candidates: list }
        } catch (err) {
          if (err?.name === 'AbortError') return { status: 'aborted' }
          setPlanPhase('error')
          setPlanError(String(err?.message ?? err))
          return { status: 'error', error: err }
        }
      }

      const pickAmbiguous = (candidate) => {
        if (!ambiguous) return
        const loc = rbLocale(candidate?.location)
        if (!loc) {
          setPlanError('该地点没有坐标，请换一个候选')
          return
        }
        setPlanError('')
        const viaMatch = /^viaPoints\[(\d+)\]$/.exec(ambiguous.field)
        if (viaMatch) {
          const index = Number(viaMatch[1])
          const nextVia = via.map((value, i) => (i === index ? loc : value))
          setVia(nextVia)
          setAmbiguous(null)
          runPlan(null, nextVia)
          return
        }
        const key = ambiguous.field === 'destination' ? 'destination' : 'origin'
        const override = { [key]: loc }
        setFields((prev) => ({ ...prev, ...override }))
        setAmbiguous(null)
        runPlan(override)
      }

      /** 换地点：按选中的候选坐标重跑 /plan（传 "lng,lat"），并回写 resolved 展示 */
      const pickAlternative = async (field, alt) => {
        const loc = rbLocale(alt?.location ?? alt)
        if (!loc) {
          setPlanError('该地点没有坐标，请换一个候选')
          return
        }
        setAltFor(null)
        setPlanError('')
        const key = field === 'origin' ? 'origin' : field === 'destination' ? 'destination' : null
        const viaMatch = /^via-(\d+)$/.exec(field)
        const override = key ? { [key]: loc } : null
        let viaOverride = null
        if (viaMatch) {
          const index = Number(viaMatch[1])
          viaOverride = via.map((value, i) => (i === index ? loc : value))
          setVia(viaOverride)
        }
        if (override) setFields((prev) => ({ ...prev, ...override }))
        const res = await runPlan(override, viaOverride, { autoPick: true })
        if (res.status !== 'ok') return
        const place = {
          name: alt?.name || alt?.title || loc,
          address: alt?.address || '',
          location: loc,
        }
        setResolved((prev) => {
          if (!prev) return prev
          if (key) {
            return {
              ...prev,
              [key]: { ...(prev[key] || {}), ...place, alternatives: rbAlternatives(prev[key]) },
            }
          }
          if (viaMatch) {
            const index = Number(viaMatch[1])
            const viaList = Array.isArray(prev.via) ? prev.via.slice() : []
            viaList[index] = { ...(viaList[index] || {}), ...place }
            return { ...prev, via: viaList }
          }
          return prev
        })
        showToast?.('已按新地点重新规划')
      }

      const saveCandidate = async (candidate) => {
        if (!candidate || savingId) return
        saveAbort.current?.abort()
        const controller = new AbortController()
        saveAbort.current = controller
        const tempId = candidate.tempId
        setSavingId(tempId)
        setPlanError('')
        try {
          const data = await rbPost('save', {
            name: candidate.name,
            description: candidate.description || '',
            source: 'ai',
            points: candidate.points,
            elevation: candidate.elevation,
            distanceM: candidate.distanceM,
            durationSec: candidate.durationSec,
          }, controller.signal)
          if (data?.status !== 'ok') throw new Error(rbErrorText(data, '保存失败'))
          setSavedIds((prev) => (prev.indexOf(tempId) >= 0 ? prev : [...prev, tempId]))
          showToast?.('已保存到我的路书')
          onSaved?.(data.route || { name: candidate.name })
        } catch (err) {
          if (err?.name === 'AbortError') return
          setPlanError(String(err?.message ?? err))
          showToast?.(`保存失败：${String(err?.message ?? err)}`, 'err')
        } finally {
          setSavingId(null)
        }
      }

      /* ------------------------------ 渲染 ------------------------------ */

      const progressBox = (ai.phase === 'running' || ai.phase === 'done')
        ? h('div', {
            className: `gp-rb-stages${ai.phase === 'done' ? ' is-done' : ''}`,
            'data-gp-rb-ai-progress': '1',
            'data-gp-rb-ai-phase': ai.phase,
          },
            h('div', { className: 'gp-rb-stages-hd' },
              h('span', { className: 'tt' }, ai.phase === 'done' ? '路书已生成' : '正在生成路书…'),
              h('span', { className: 'gp-rb-stages-elapsed', 'data-gp-rb-ai-elapsed': '1' },
                `已用 ${ai.elapsed} 秒`)),
            h('div', { className: 'gp-rb-stages-list' },
              RB_AI_STAGES.map((label, index) => h('span', {
                key: label,
                className: `gp-rb-stage${ai.phase === 'done' || index < ai.stage
                  ? ' is-done'
                  : index === ai.stage ? ' is-on' : ''}`,
                'data-gp-rb-ai-stage': index,
                'data-gp-rb-ai-stage-on': index === ai.stage && ai.phase === 'running' ? '1' : '0',
              }, label))))
        : null

      const aiErrorBox = ai.phase === 'error'
        ? h('div', { className: 'gp-rb-aierr', 'data-gp-rb-ai-error': '1' },
            h('div', { className: 'gp-rb-aierr-tt' }, '生成失败'),
            h('div', { className: 'gp-rb-aierr-msg' }, ai.error || 'AI 规划失败'),
            ai.unavailable
              ? h('div', { className: 'gp-rb-muted', 'data-gp-rb-ai-unavailable': '1' },
                  'AI 规划暂不可用，可展开下方「高级选项」手动生成路线。')
              : null,
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn primary',
                onClick: () => runAi(false),
                'data-gp-rb-ai-retry': '1',
              }, '重试'),
              ai.unavailable
                ? h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    onClick: () => setAdvancedOpen(true),
                    'data-gp-rb-ai-manual': '1',
                  }, '手动规划')
                : null))
        : null

      /* ---------------- 多日行程：进度 / 错误 / 结果 ---------------- */

      const multiProgressBox = (multiAi.phase === 'running' || multiAi.phase === 'done')
        ? h('div', {
            className: `gp-rb-stages${multiAi.phase === 'done' ? ' is-done' : ''}`,
            'data-gp-rb-multi-progress': '1',
            'data-gp-rb-multi-phase': multiAi.phase,
          },
            h('div', { className: 'gp-rb-stages-hd' },
              h('span', { className: 'tt' },
                multiAi.phase === 'done' ? '行程已生成' : `正在规划 ${rbDayNumber(tripDaysInput, 3)} 天行程…`),
              h('span', { className: 'gp-rb-stages-elapsed', 'data-gp-rb-multi-elapsed': '1' },
                `已用 ${multiAi.elapsed} 秒`)),
            h('div', { className: 'gp-rb-stages-list' },
              RB_AI_MULTI_STAGES.map((label, index) => h('span', {
                key: label,
                className: `gp-rb-stage${multiAi.phase === 'done' || index < multiAi.stage
                  ? ' is-done'
                  : index === multiAi.stage ? ' is-on' : ''}`,
                'data-gp-rb-multi-stage': index,
                'data-gp-rb-multi-stage-on': index === multiAi.stage && multiAi.phase === 'running' ? '1' : '0',
              }, label))))
        : null

      const diagDays = rbDiagRows(multiAi.diagnostics)

      const multiErrorBox = multiAi.phase === 'error'
        ? h('div', {
            className: 'gp-rb-aierr',
            'data-gp-rb-multi-error': '1',
            'data-gp-rb-multi-code': multiAi.code || '',
          },
            h('div', { className: 'gp-rb-aierr-tt', 'data-gp-rb-multi-title': '1' },
              multiAi.title || (multiAi.code === 'INVALID_ITINERARY' ? '行程需求需要调整' : '行程生成失败')),
            h('div', { className: 'gp-rb-aierr-msg' }, multiAi.error || 'AI 行程规划失败'),
            multiAi.detail
              ? h('div', { className: 'gp-rb-muted gp-rb-diagdetail', 'data-gp-rb-multi-detail': '1' },
                  `后端返回：${multiAi.detail}`)
              : null,
            multiAi.hint
              ? h('div', { className: 'gp-rb-muted', 'data-gp-rb-multi-hint': '1' }, multiAi.hint)
              : null,
            diagDays.length
              ? h('details', { className: 'gp-rb-diag', 'data-gp-rb-multi-diag': '1' },
                  h('summary', { 'data-gp-rb-multi-diag-toggle': '1' },
                    `按天诊断（${diagDays.length} 天失败）`),
                  h('div', { className: 'gp-rb-diag-body' },
                    diagDays.map((item, index) => h('div', {
                      key: `multi-diag-${index}`,
                      className: 'gp-rb-diag-row',
                      'data-gp-rb-multi-diag-row': String(index),
                    },
                      h('b', null, `第 ${rbDiagDayNo(item, index)} 天`),
                      h('span', { className: 'code' }, String(item?.code || 'PLANNING_FAILED')),
                      h('span', { className: 'msg' },
                        String(item?.message || item?.error || '路线规划失败'))))))
              : null,
            multiAi.unavailable
              ? h('div', { className: 'gp-rb-muted', 'data-gp-rb-multi-unavailable': '1' },
                  '当前环境 AI 规划未就绪（默认模型未选择或调用受限），「高级选项」手动规划仍然可用。')
              : null,
            h('div', { className: 'gp-rb-actions' },
              h('button', {
                type: 'button',
                className: 'gp-btn primary',
                onClick: () => runMulti(false),
                'data-gp-rb-multi-retry': '1',
              }, '重试'),
              h('button', {
                type: 'button',
                className: 'gp-btn',
                onClick: () => setMode('single'),
                'data-gp-rb-multi-single': '1',
              }, '改回单日')))
        : null

      const tripDayList = rbTripDays(trip)
      const tripTotals = trip ? rbTripTotals(trip) : null

      const dayCard = (day, index) => {
        const open = !!dayOpen[index]
        const failed = rbDayError(day)
        const diff = rbDifficulty(day?.difficulty)
        const saved = savedDayIds.indexOf(index) >= 0
        const fromTo = rbDayRouteText(day)
        const distance = numOf(day?.distanceM)
        const gain = numOf(day?.elevationGainM)
        const duration = numOf(day?.durationSec)
        const note = String(day?.note || '').trim()
        return h('article', {
          className: `gp-rb-day${failed ? ' is-error' : ''}${open ? ' is-open' : ''}`,
          key: `trip-day-${index}`,
          'data-gp-rb-day': String(index),
          'data-gp-rb-day-index': String(index),
          'data-gp-rb-day-status': failed ? 'error' : 'ok',
        },
          h('div', { className: 'gp-rb-day-hd' },
            h('span', { className: 'gp-rb-daybadge', 'data-gp-rb-day-badge': '1' }, `D${index + 1}`),
            h('div', { className: 'gp-rb-day-title', title: rbDayTitle(day, index) },
              rbDayTitle(day, index)),
            diff
              ? h('span', {
                  className: `gp-rb-diff ${diff.key}`,
                  title: day?.difficultyReason || diff.label,
                  'data-gp-rb-day-diff': diff.key,
                }, diff.label)
              : null),
          fromTo
            ? h('div', { className: 'gp-rb-day-route', 'data-gp-rb-day-route': '1' }, fromTo)
            : null,
          h('div', { className: 'gp-rb-day-meta' },
            h('span', null, '距离 ', h('b', null, rbKm(distance))),
            h('span', null, '爬升 ', h('b', null, gain === null ? '—' : rbMeter(gain))),
            h('span', null, '用时 ', h('b', null, duration === null ? '—' : clock(duration))),
            day?.elevationEstimated
              ? h('span', { className: 'gp-rb-chipv warn', 'data-gp-rb-day-estimated': '1' }, '估算海拔')
              : null),
          note
            ? h('div', { className: 'gp-rb-day-note', title: note, 'data-gp-rb-day-note': '1' }, note)
            : null,
          failed
            ? h('div', { className: 'gp-rb-day-err', 'data-gp-rb-day-error': '1' },
                h('div', null, rbDayError(day)),
                h('div', { className: 'gp-rb-actions' },
                  h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    onClick: () => retryDay(day, index),
                    disabled: dayRetrying === index,
                    'data-gp-rb-day-retry': String(index),
                  }, dayRetrying === index ? '重试中…' : '单独重试'),
                  h('span', { className: 'gp-rb-hint' },
                    fromTo ? `按 ${fromTo} 重新生成` : '重新生成这一天的路线')))
            : null,
          open
            ? h('div', { className: 'gp-rb-day-track', 'data-gp-rb-day-track': String(index) },
                h(TrackPreview, {
                  points: day?.points,
                  elevation: day?.elevation,
                  distanceM: day?.distanceM,
                  elevationGainM: day?.elevationGainM,
                  height: 170,
                }))
            : null,
          h('div', { className: 'gp-rb-day-foot' },
            h('button', {
              type: 'button',
              className: 'gp-rb-linkbtn',
              'aria-expanded': open ? 'true' : 'false',
              onClick: () => setDayOpen((prev) => ({ ...prev, [index]: !open })),
              'data-gp-rb-day-expand': String(index),
            }, open ? '收起地图与海拔' : '展开地图与海拔'),
            h('span', { className: 'sp' }),
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              onClick: () => saveDay(day, index),
              disabled: saved || daySaving === index || failed,
              'data-gp-rb-day-save': String(index),
            }, saved ? '已保存' : daySaving === index ? '保存中…' : '保存这一天')))
      }

      const tripResultBox = (mode === 'multi' && trip)
        ? h('section', {
            className: 'gp-rb-tripresult',
            'data-gp-rb-trip': '1',
            'data-gp-rb-trip-days': String(tripDayList.length),
            'data-gp-rb-trip-usedweb': trip.usedWeb ? '1' : '0',
          },
            h('div', { className: 'gp-rb-trip-hd' },
              h('div', { className: 'gp-rb-trip-titlewrap' },
                h('h3', { className: 'gp-rb-trip-title', 'data-gp-rb-trip-title': '1' },
                  String(trip.title || '多日骑行行程')),
                h('div', { className: 'gp-rb-trip-meta', 'data-gp-rb-trip-meta': '1' },
                  `${tripTotals.dayCount} 天 · 总里程 ${rbKm(tripTotals.distanceM)} · 总爬升 ${rbMeter(tripTotals.gainM)}`
                  + (tripTotals.difficulty ? ` · 难度 ${tripTotals.difficulty}` : ''))),
              h('div', { className: 'gp-rb-actions' },
                h('button', {
                  type: 'button',
                  className: 'gp-btn',
                  onClick: () => runMulti(true),
                  disabled: multiAi.phase === 'running',
                  'data-gp-rb-trip-more': '1',
                }, '换一批'),
                h('button', {
                  type: 'button',
                  className: 'gp-btn primary',
                  onClick: saveTrip,
                  disabled: tripSaving || tripSaved,
                  'data-gp-rb-trip-save': '1',
                }, tripSaved ? '已保存' : tripSaving ? '保存中…' : '保存整个行程'))),
            trip.usedWeb
              ? (() => {
                  const sources = rbTripSourceLinks(trip)
                  return sources.length
                    ? h('div', { className: 'gp-rb-sources', 'data-gp-rb-sources': '1' },
                        h('span', { className: 'gp-rb-sources-lab' }, '参考来源'),
                        sources.map((item, index) => h('a', {
                          key: `trip-source-${index}`,
                          className: 'gp-rb-source',
                          href: String(item.url || '#'),
                          target: '_blank',
                          rel: 'noreferrer',
                          title: String(item.title || item.url || '参考来源'),
                          'data-gp-rb-source': String(index),
                        }, String(item.title || item.url || '参考来源'))))
                    : null
                })()
              : h('div', { className: 'gp-rb-muted', 'data-gp-rb-noweb': '1' },
                  '未使用联网参考（AI 知识+地图规划）'),
            h('div', { className: 'gp-rb-trip-overview', 'data-gp-rb-trip-overview': '1' },
              h(TrackPreview, {
                points: Array.isArray(trip.overviewPoints) && trip.overviewPoints.length
                  ? trip.overviewPoints
                  : tripDayList.reduce((acc, day) => acc.concat(rbPoints(day?.points)), []),
                distanceM: tripTotals.distanceM,
                elevationGainM: tripTotals.gainM,
                showElevation: false,
                height: 210,
              })),
            h('div', { className: 'gp-rb-days', 'data-gp-rb-days': '1' },
              tripDayList.map((day, index) => dayCard(day, index))),
            trip.engine
              ? h('div', { className: 'gp-rb-hint gp-rb-trip-foot', 'data-gp-rb-trip-engine': '1' },
                  `生成引擎 ${trip.engine}`)
              : null,
            tripError
              ? h('div', { className: 'gp-rb-error', 'data-gp-rb-trip-error': '1' }, tripError)
              : null)
        : null

      const promptPlaceholder = mode === 'multi'
        ? '例：环海南岛 8 天，人均每天 70–90 km，想走东线经典路段'
        : '例：周末从四明湖出发，60–80 km 环线，爬升 800 m 左右，想走湖边和古镇，体能中等'

      const promptHero = h('section', { className: 'gp-rb-aihero', 'data-gp-rb-aihero': '1' },
        h('div', { className: 'gp-rb-aihero-hd' },
          h('h2', null, mode === 'multi' ? '一句话生成多日骑行行程' : '一句话生成成熟路书'),
          h('span', { className: 'gp-rb-hint' },
            amapReady
              ? (mode === 'multi'
                  ? '写清天数、每天里程与想走的区域，AI 会按天排路线并估算海拔'
                  : '描述场景、距离和想走的地方，AI 会挑地点、排路线、估海拔')
              : '配置高德 Key 后才能生成路线')),
        h('div', { className: 'gp-rb-modeseg', 'data-gp-rb-mode': '1', role: 'group', 'aria-label': '规划模式' },
          h('button', {
            type: 'button',
            className: `gp-rb-modebtn${mode === 'single' ? ' on' : ''}`,
            'aria-pressed': mode === 'single' ? 'true' : 'false',
            'data-gp-rb-mode-btn': 'single',
            onClick: () => setMode('single'),
          }, '单日'),
          h('button', {
            type: 'button',
            className: `gp-rb-modebtn${mode === 'multi' ? ' on' : ''}`,
            'aria-pressed': mode === 'multi' ? 'true' : 'false',
            'data-gp-rb-mode-btn': 'multi',
            onClick: () => setMode('multi'),
          }, '多日')),
        mode === 'multi'
          ? h('div', { className: 'gp-rb-multirow', 'data-gp-rb-multirow': '1' },
              h('label', { className: 'gp-rb-field gp-rb-daysfield' },
                h('span', { className: 'gp-rb-lab' }, '天数'),
                h('select', {
                  className: 'gp-rb-input gp-rb-select',
                  value: String(tripDaysInput),
                  onChange: (event) => setTripDaysInput(rbDayNumber(event.target.value, 3)),
                  'data-gp-rb-days': '1',
                }, Array.from({ length: RB_MULTI_MAX_DAYS - RB_MULTI_MIN_DAYS + 1 }, (_, i) => RB_MULTI_MIN_DAYS + i)
                  .map((value) => h('option', { key: value, value: String(value) }, `${value} 天`)))),
              h('label', { className: 'gp-rb-field' },
                h('span', { className: 'gp-rb-lab' }, '总里程 km（可选）'),
                h('input', {
                  className: 'gp-rb-input',
                  type: 'number',
                  min: 0,
                  value: tripDistanceKm,
                  placeholder: '例如 600',
                  spellCheck: false,
                  onChange: (event) => setTripDistanceKm(event.target.value),
                  'data-gp-rb-total-distance': '1',
                })),
              h('label', { className: 'gp-rb-check gp-rb-useweb' },
                h('input', {
                  type: 'checkbox',
                  checked: !!useWeb,
                  onChange: (event) => setUseWeb(event.target.checked),
                  'data-gp-rb-useweb': '1',
                }),
                '联网参考经典路线'))
          : null,
        h('textarea', {
          className: 'gp-rb-textarea gp-rb-prompt',
          value: prompt,
          placeholder: promptPlaceholder,
          maxLength: 2000,
          spellCheck: false,
          onChange: (event) => setPrompt(event.target.value),
          'data-gp-rb-prompt': '1',
        }),
        h('div', { className: 'gp-rb-actions' },
          h('button', {
            type: 'button',
            className: 'gp-btn primary gp-rb-generate',
            onClick: () => (mode === 'multi' ? runMulti(false) : runAi(false)),
            disabled: !amapReady || !aiAvailable
              || (mode === 'multi' ? multiAi.phase === 'running' : ai.phase === 'running'),
            title: !amapReady ? '未配置高德 Web服务 Key' : !aiAvailable ? 'AI 规划暂不可用'
              : mode === 'multi' ? '生成多日行程' : '生成路书',
            'data-gp-rb-ai-generate': '1',
          }, mode === 'multi'
            ? (multiAi.phase === 'running' ? '生成中…' : '生成行程')
            : (ai.phase === 'running' ? '生成中…' : '生成路书')),
          h('button', {
            type: 'button',
            className: 'gp-btn',
            onClick: () => (mode === 'multi' ? runMulti(true) : runAi(true)),
            disabled: !amapReady || !aiAvailable
              || (mode === 'multi' ? multiAi.phase === 'running' : ai.phase === 'running'),
            'data-gp-rb-ai-more': '1',
          }, '换一批'),
          h('span', { className: 'gp-rb-hint' },
            mode === 'multi' ? '一次生成 2–15 天行程，可换一批重来' : '一次生成 2–3 条候选，可换一批重来')),
        !aiAvailable
          ? h('div', { className: 'gp-rb-muted', 'data-gp-rb-ai-off': '1' },
              'AI 规划暂不可用，可展开下方「高级选项」手动生成路线。')
          : null,
        amapKnown && !amapReady
          ? h('div', { className: 'gp-rb-muted gp-rb-setup', 'data-gp-rb-amap-missing': '1' },
              h('span', null, !amapConfigured
                ? '未配置高德 Web服务 Key，暂时无法 AI 规划。'
                : `高德 Key 无效：${keysErrorText(status.data.amapKeyError, '请重新设置')}`),
              h('button', {
                type: 'button',
                className: 'gp-btn',
                onClick: () => onOpenSettings?.(),
                'data-gp-rb-amap-settings': '1',
              }, '去设置'))
          : null,
        mode === 'multi' ? multiProgressBox : progressBox,
        mode === 'multi' ? multiErrorBox : aiErrorBox)

      const placeNode = (label, key, place) => {
        const alts = rbAlternatives(place)
        return h('div', { className: 'gp-rb-place', key },
          h('span', { className: 'k' }, `${label}：`),
          h('span', { className: 'v', title: place?.address || '' }, rbPlaceText(place) || '待定'),
          alts.length
            ? h('button', {
                type: 'button',
                className: 'gp-rb-linkbtn',
                'aria-expanded': altFor === key ? 'true' : 'false',
                'data-gp-rb-swap': key,
                onClick: () => setAltFor(altFor === key ? null : key),
                disabled: planPhase === 'loading',
              }, altFor === key ? '收起' : '换地点')
            : null)
      }

      const altBox = (key, place) => {
        if (altFor !== key) return null
        const alts = rbAlternatives(place)
        if (!alts.length) return null
        return h('div', { className: 'gp-rb-alt', 'data-gp-rb-alt': key, key },
          h('div', { className: 'gp-rb-alt-hd' }, `「${place?.name || '地点'}」的其他匹配`),
          alts.map((alt, index) => h('button', {
            type: 'button',
            className: 'gp-rb-alt-item',
            key: index,
            'data-gp-rb-alt-item': String(index),
            disabled: planPhase === 'loading',
            onClick: () => pickAlternative(key, alt),
          },
            h('b', null, alt?.name || alt?.title || `备选 ${index + 1}`),
            alt?.address ? h('span', null, alt.address) : null)))
      }

      const viaList = resolved && Array.isArray(resolved.via) ? resolved.via : []
      const loop = !!(result?.parsed?.loop ?? fields.loop)
      const destinationPlace = resolved && resolved.destination
        ? resolved.destination
        : (loop ? { name: '同起点（环线）', address: '' } : null)
      const resolvedBox = resolved
        ? h('div', { className: 'gp-rb-resolved', 'data-gp-rb-resolved': '1' },
            h('div', { className: 'gp-rb-resolved-line', 'data-gp-rb-resolved-line': '1' },
              placeNode('起点', 'origin', resolved.origin),
              h('span', { className: 'dot', 'aria-hidden': true }, '·'),
              placeNode('终点', 'destination', destinationPlace)),
            viaList.length
              ? h('div', { className: 'gp-rb-resolved-line' },
                  viaList.map((place, index) => placeNode(`途经 ${index + 1}`, `via-${index}`, place)))
              : null,
            altBox('origin', resolved.origin),
            altBox('destination', resolved.destination),
            viaList.map((place, index) => altBox(`via-${index}`, place)))
        : null

      const candidateCard = (candidate, index) => {
        const id = candidate.tempId ?? `cand_${index}`
        const diff = rbDifficulty(candidate.difficulty)
        const open = expandedId === id
        const saved = savedIds.indexOf(id) >= 0
        const loop = !!(result?.parsed?.loop ?? fields.loop)
        const summary = [
          rbShape(loop),
          rbKm(numOf(candidate.distanceM)),
          `爬升 ${rbMeter(numOf(candidate.elevationGainM))}`,
          clock(numOf(candidate.durationSec)),
        ]
        return h('article', {
          className: 'gp-rb-aicand',
          key: id,
          'data-gp-rb-cand': String(id),
          'data-gp-rb-cand-diff': diff?.key || '',
        },
          h('div', { className: 'gp-rb-aicand-hd' },
            h('div', { className: 'nm', title: candidate.name }, candidate.name || `候选路线 ${index + 1}`),
            diff
              ? h('span', {
                  className: `gp-rb-diff ${diff.key}`,
                  title: candidate.difficultyReason || diff.label,
                  'data-gp-rb-diff-pill': diff.key,
                }, diff.label)
              : null),
          h('div', { className: 'gp-rb-aicand-sum', 'data-gp-rb-cand-sum': '1' }, summary.join(' · ')),
          candidate.description
            ? h('div', { className: 'gp-rb-aicand-desc', title: candidate.description }, candidate.description)
            : null,
          candidate.elevationEstimated
            ? h('div', { className: 'gp-rb-aicand-badges' },
                h('span', { className: 'gp-rb-chipv warn', 'data-gp-rb-estimated': '1' }, '估算'))
            : null,
          open
            ? h('div', { className: 'gp-rb-aicand-track', 'data-gp-rb-cand-track': String(id) },
                h(TrackPreview, {
                  points: candidate.points,
                  elevation: candidate.elevation,
                  distanceM: candidate.distanceM,
                  elevationGainM: candidate.elevationGainM,
                  height: 180,
                }))
            : null,
          h('div', { className: 'gp-rb-aicand-foot' },
            h('button', {
              type: 'button',
              className: 'gp-rb-linkbtn',
              'aria-expanded': open ? 'true' : 'false',
              'data-gp-rb-cand-expand': String(id),
              onClick: () => setExpandedId(open ? null : id),
            }, open ? '收起轨迹与海拔' : '展开轨迹与海拔'),
            h('span', { className: 'sp' }),
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              'data-gp-rb-cand-save': String(id),
              disabled: saved || savingId === id,
              onClick: () => saveCandidate(candidate),
            }, saved ? '已保存' : savingId === id ? '保存中…' : '保存为路书')))
      }

      const ambigBox = ambiguous
        ? h('div', { className: 'gp-rb-ambig', 'data-gp-rb-ambiguous': '1' },
            h('div', { className: 'gp-rb-ambig-hd' }, `「${ambiguous.place}」有多个匹配地点`),
            h('div', { className: 'gp-rb-cands' },
              (ambiguous.candidates || []).map((candidate, index) => h('button', {
                type: 'button',
                key: `${candidate.name}-${index}`,
                className: 'gp-rb-cand',
                onClick: () => pickAmbiguous(candidate),
                'data-gp-rb-ambig-cand': String(index),
              },
                h('div', { className: 'top' },
                  h('div', { className: 'nm' }, candidate.name || `候选地点 ${index + 1}`)),
                h('div', { className: 'sub' }, candidate.address || '')))))
        : null

      const resultsBox = (mode === 'single' && (resolved || candidates.length || ambiguous || planError))
        ? h('div', { className: 'gp-rb-results', 'data-gp-rb-results': '1' },
            resolvedBox,
            ambigBox,
            candidates.length
              ? h('section', { className: 'gp-rb-sec' },
                  h('div', { className: 'gp-rb-results-hd' },
                    h('h3', null, `候选路线（${candidates.length}）`),
                    h('span', { className: 'gp-rb-hint' },
                      result?.engine ? `生成引擎 ${result.engine}` : '来自高德规划')),
                  h('div', { className: 'gp-rb-aicands', 'data-gp-rb-cands': '1' },
                    candidates.map(candidateCard)))
              : null,
            planError
              ? h('div', { className: 'gp-rb-error', 'data-gp-rb-plan-error': '1' }, planError)
              : null)
        : null

      const idleBox = (mode === 'single'
        ? (ai.phase === 'idle' && !resolved && !candidates.length && !ambiguous && !planError)
        : (multiAi.phase === 'idle' && !trip))
        ? h('div', { className: 'gp-rb-placeholder', 'data-gp-rb-placeholder': '1' },
            h('div', { className: 'gp-rb-empty-ic', 'aria-hidden': true },
              h('svg', { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none' },
                h('path', {
                  d: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z',
                  stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round',
                }),
                h('circle', { cx: 9, cy: 11, r: 1.5, fill: 'currentColor' }))),
            h('div', { className: 'big' },
              mode === 'multi' ? '生成后在这里预览整段行程' : '生成后在这里预览候选路线'),
            h('div', { className: 'gp-rb-hint' },
              mode === 'multi'
                ? '设定天数 → 生成每日路线 → 逐天预览海拔，或一次保存整个行程。'
                : '写一句需求 → 生成 2–3 条成熟路书 → 选一条保存到我的路书。'))
        : null

      const input = (key, placeholder, extra = null) => h('input', {
        className: 'gp-rb-input',
        value: fields[key],
        placeholder,
        spellCheck: false,
        onChange: (event) => setField(key, event.target.value),
        ...(extra || {}),
      })

      const field = (label, node, extraClass = '') => h('label', {
        className: `gp-rb-field${extraClass ? ` ${extraClass}` : ''}`,
      },
        h('span', { className: 'gp-rb-lab' }, label),
        node)

      const advanced = h('details', {
        className: 'gp-rb-adv',
        'data-gp-rb-advanced': '1',
        open: advancedOpen || undefined,
        onToggle: (event) => setAdvancedOpen(!!event.currentTarget.open),
      },
        h('summary', { 'data-gp-rb-advanced-toggle': '1' }, '高级选项'),
        h('div', { className: 'gp-rb-adv-body' },
          h('p', { className: 'gp-rb-note' },
            '手动指定起点 / 终点 / 途经点，适合已有明确坐标或想微调距离、爬升时使用。'),
          h('div', { className: 'gp-rb-form-grid' },
            field('起点', input('origin', '例如 四明湖', { 'data-gp-rb-origin': '1' })),
            field('终点', input('destination', '例如 四明山', { 'data-gp-rb-destination': '1' })),
            h('div', { className: 'gp-rb-field full' },
              h('span', { className: 'gp-rb-lab' }, '途经点（可增删）'),
              h('div', { className: 'gp-rb-via' },
                via.map((value, index) => h('div', { className: 'gp-rb-inline', key: index },
                  h('input', {
                    className: 'gp-rb-input',
                    value,
                    placeholder: '途经点（可选）',
                    onChange: (event) => setVia((prev) => prev.map((v, i) => (i === index ? event.target.value : v))),
                    'data-gp-rb-via': String(index),
                  }),
                  h('button', {
                    type: 'button',
                    className: 'gp-btn',
                    onClick: () => setVia((prev) => prev.filter((_, i) => i !== index)),
                    'aria-label': '删除途经点',
                  }, '－'))),
                h('button', {
                  type: 'button',
                  className: 'gp-btn',
                  onClick: () => setVia((prev) => [...prev, '']),
                  'data-gp-rb-via-add': '1',
                }, '＋ 添加途经点'))),
            h('label', { className: 'gp-rb-check full' },
              h('input', {
                type: 'checkbox',
                checked: !!fields.loop,
                onChange: (event) => setField('loop', event.target.checked),
                'data-gp-rb-loop': '1',
              }),
              '环线（起点即终点）'),
            field('目标距离（km）', input('targetDistanceKm', '例如 60', {
              type: 'number', min: 0, 'data-gp-rb-distance': '1',
            })),
            field('目标爬升（m）', input('elevationTargetM', '例如 800', {
              type: 'number', min: 0, 'data-gp-rb-elevation': '1',
            })),
            field('城市', input('city', '例如 宁波', { 'data-gp-rb-city': '1' }), 'full')),
          h('div', { className: 'gp-rb-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              onClick: () => runPlan(),
              disabled: !amapReady || planPhase === 'loading' || planPhase === 'saving',
              title: amapReady ? '按上面的条件生成路线' : '未配置高德 Web服务 Key',
              'data-gp-rb-plan': '1',
            }, planPhase === 'loading' ? '规划中…' : '生成路线'),
            h('span', { className: 'gp-rb-hint' }, '未勾选环线时必须填写终点。')),
          planPhase === 'loading'
            ? h('div', { className: 'gp-rb-plan-loading', 'data-gp-rb-plan-loading': '1' },
                h('i', { className: 'gp-rb-spin big', 'aria-hidden': true }),
                h('b', null, '正在规划骑行路线…（约 5–15 秒）'),
                h('span', { className: 'gp-rb-hint' }, '正在向高德请求候选路线并计算海拔。'))
            : null))

      return h('div', { className: 'gp-rb-tabpanel', 'data-gp-rb-panel': 'plan' },
        h('div', { className: 'gp-rb-sechead' },
          h('h2', null, 'AI 规划'),
          h('span', { className: 'hint' }, '一句话描述目的地与强度，生成可直接保存的骑行路书')),
        h('div', { className: 'gp-rb-ai' },
          promptHero,
          idleBox,
          mode === 'multi' ? tripResultBox : resultsBox,
          advanced))
    }

    /* --------------------------- 路书工坊外壳 --------------------------- */
    function RouteWorkshop({ showToast, statusVersion = 0, onOpenSettings = null }) {
      const [tab, setTab] = React.useState('mine')
      const [version, setVersion] = React.useState(0)
      const [highlightId, setHighlightId] = React.useState(null)
      const status = useRbResource('status', `${version}:${statusVersion}`)
      const bump = React.useCallback(() => setVersion((value) => value + 1), [])
      const info = status.data || {}
      const pending = !status.data && status.loading
      const svcClass = (ok, warn) => (ok ? 'ok' : warn ? 'warn' : 'off')
      const amapValid = info.amapKeyValid !== false
      const amapText = !info.amapConfigured ? '未配置' : amapValid ? '已配置' : 'Key 无效'

      /* 规划保存 → 重取列表 + 切到「我的路书」并高亮新卡片 */
      const goMine = React.useCallback((route) => {
        setVersion((value) => value + 1)
        setHighlightId(route?.id !== undefined && route?.id !== null ? String(route.id) : null)
        setTab('mine')
        const root = document.querySelector('.gp-root')
        if (root) root.scrollTop = 0
      }, [])

      const switchTab = (id) => {
        setHighlightId(null)
        setTab(id)
        const root = document.querySelector('.gp-root')
        if (root) root.scrollTop = 0
      }

      return h('div', { className: 'gp-rb', 'data-gp-rb': '1' },
        h('div', { className: 'gp-rb-lead' },
          h('h1', null, '路线规划、导入与保存'),
          h('p', null, '把行者路书、GPX 或 AI 规划的骑行路线收进一处，导出后导入佳明。'),
          h('div', { className: 'gp-rb-svc' },
            h('span', { className: 'sv' }, '行者 ',
              h('b', {
                className: svcClass(info.xingzheConfigured && info.xingzheAuthorized, info.xingzheConfigured && !info.xingzheAuthorized),
              }, pending ? '…' : !info.xingzheConfigured ? '未配置' : info.xingzheAuthorized ? '已授权' : '未授权')),
            h('span', { className: 'sv' }, '高德 ',
              h('b', { className: svcClass(amapValid && info.amapConfigured, !amapValid && info.amapConfigured) },
                pending ? '…' : amapText)),
            h('span', { className: 'sv' }, '已存 ',
              h('b', null, pending ? '…' : typeof info.routeCount === 'number' ? String(info.routeCount) : '—'),
              ' 条'))),
        status.error
          ? h('div', { className: 'gp-rb-error', 'data-gp-rb-status-error': '1' },
              `服务状态获取失败：${status.error}`)
          : null,
        h('div', { className: 'gp-rb-tabs', role: 'tablist', 'aria-label': '路书工坊标签' },
          RB_TABS.map((item) => h('button', {
            key: item.id,
            type: 'button',
            role: 'tab',
            'aria-selected': tab === item.id,
            className: `gp-rb-tab${tab === item.id ? ' on' : ''}`,
            'data-gp-rb-tab': item.id,
            onClick: () => switchTab(item.id),
          }, item.label))),
        h('div', { className: 'gp-rb-panel' },
          tab === 'mine'
            ? h(RouteMineTab, {
                version,
                onRefresh: bump,
                onGoTab: switchTab,
                showToast,
                highlightId,
              })
            : tab === 'import'
              ? h(RouteImportTab, {
                  status,
                  onSaved: bump,
                  showToast,
                  onGoTab: switchTab,
                  onGoPlan: () => switchTab('plan'),
                  onStatus: bump,
                  onOpenSettings,
                })
              : h(RoutePlanTab, { status, onSaved: goMine, showToast, onOpenSettings })))
    }
