    /* ---------------------------------------------------------------- *
     * 工具函数
     * ---------------------------------------------------------------- */
    const fmt = (n, d = 0) =>
      typeof n === 'number' && isFinite(n)
        ? n.toLocaleString('zh-CN', { maximumFractionDigits: d, minimumFractionDigits: d })
        : '—'
    const hours = (sec) => (typeof sec === 'number' ? (sec / 3600).toFixed(1) : '—')
    const clock = (sec) => {
      if (typeof sec !== 'number') return '—'
      const s = Math.round(sec)
      const hh = Math.floor(s / 3600)
      const mm = Math.floor((s % 3600) / 60)
      return hh ? `${hh}h${String(mm).padStart(2, '0')}m` : `${mm}m`
    }
    const clampPct = (v) => Math.max(0, Math.min(100, Math.round(v)))
    const pillClass = (v) => (v >= 70 ? 'g' : v >= 40 ? 'a' : 'r')
    const LEVEL_ZH = {
      PRIME: '极佳', HIGH: '良好', MODERATE: '中等', LOW: '偏低', POOR: '差',
      GOOD: '好', FAIR: '一般', EXCELLENT: '优秀',
    }

    const RECORD_ZH = {
      'Longest Run': '最长跑步',
      'Longest Ride': '最长骑行',
      'Most Elevation Gain Cycling': '单次最大爬升',
      'Most Elevation Gain': '单次最大爬升',
      'Fastest 100K Cycling': '最快 100K',
      'Fastest 40K Cycling': '最快 40K',
      'Most Steps Day': '单日最多步数',
      'Most Steps Week': '单周最多步数',
      'Most Steps Month': '单月最多步数',
      'Longest Daily Goal Streak': '最长日目标连续',
      'Longest Weekly Goal Streak': '最长周目标连续',
      'Fastest 400m Pool Swim': '最快 400m 泳池',
      'Fastest 800m Pool Swim': '最快 800m 泳池',
    }
    const recordZh = (name) => {
      if (RECORD_ZH[name]) return RECORD_ZH[name]
      if (/^Unknown/.test(name)) return '其他记录'
      return name
    }
    const deviceKind = (name = '') => {
      if (/Edge|Garmin Edge|码表/i.test(name)) return '码表'
      if (/Instinct|Fenix|Forerunner|Venu|Epix|Vivo|Lily|MARQ|手表/i.test(name)) return '手表'
      if (/Index|Scale|S2|体重秤/i.test(name)) return '体重秤'
      return '设备'
    }

    /* 设备接口里的 kind 可能是英文枚举，也可能没给（退回按名字猜） */
    const KIND_ZH = {
      watch: '手表', smartwatch: '手表', fitness: '手表', wearable: '手表',
      edge: '码表', cycling: '码表', bike: '码表', computer: '码表', bike_computer: '码表',
      scale: '体重秤', index: '体重秤', sensor: '传感器',
    }
    const deviceChip = (d) => KIND_ZH[String(d?.kind || '').toLowerCase()] || deviceKind(d?.name || '')
    const firstOf = (...vals) => {
      for (const v of vals) if (v !== undefined && v !== null && v !== '') return v
      return null
    }
    const numOf = (...vals) => {
      for (const v of vals) {
        const n = typeof v === 'string' ? Number(v) : v
        if (typeof n === 'number' && isFinite(n)) return n
      }
      return null
    }

    /* ---------------- v3 小工具：日期 / 月份 / 轨迹 / 运动图标 ---------------- */
    const pad2 = (n) => String(n).padStart(2, '0')
    const isoDay = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

    /** 取 YYYY-MM-DD 部分；兼容 ISO、'YYYY-MM-DD HH:mm:ss' 与空值 */
    function dayPart(value) {
      const text = String(value ?? '').trim()
      const m = /^(\d{4}-\d{2}-\d{2})/.exec(text)
      return m ? m[1] : null
    }
    /** 取 HH:mm 部分；兼容 'YYYY-MM-DD HH:mm:ss' 与 ISO */
    function timePart(value) {
      const text = String(value ?? '').trim()
      const m = /[T ](\d{2}):(\d{2})/.exec(text)
      return m ? `${m[1]}:${m[2]}` : null
    }
    /** 日期加减（按本地中午计算，避开夏令时/时区抖动） */
    function shiftDay(day, delta) {
      const base = dayPart(day)
      if (!base) return null
      const [y, m, d] = base.split('-').map(Number)
      const dt = new Date(y, m - 1, d, 12, 0, 0, 0)
      dt.setDate(dt.getDate() + delta)
      return isoDay(dt)
    }
    function shortDay(day) {
      const base = dayPart(day)
      return base ? base.slice(5, 10) : '—'
    }

    /* ---------------- 回看窗口：最近 30 天（今天 − 29 … 今天） ---------------- */
    const REVIEW_SPAN = 30

    /** 本机今天的 ISO 日（用户 locale 的日界线，与后端 date= 语义一致） */
    function todayIso() {
      return isoDay(new Date())
    }

    /** 'YYYY-MM-DD' → '周四'（周一为一周起点） */
    function dayWeekday(day) {
      const base = dayPart(day)
      if (!base) return ''
      const [y, m, d] = base.split('-').map(Number)
      const dt = new Date(y, m - 1, d, 12, 0, 0, 0)
      if (Number.isNaN(dt.getTime())) return ''
      return WEEKDAYS_ZH[(dt.getDay() + 6) % 7] || ''
    }

    /** 'YYYY-MM-DD' → '11-05 周四' */
    function dayText(day) {
      const base = dayPart(day)
      if (!base) return '—'
      return `${shortDay(base)} ${dayWeekday(base)}`
    }

    /** 回看窗口内最早的日期（今天 − 29） */
    function reviewMinDay(today) {
      return shiftDay(dayPart(today) || todayIso(), -(REVIEW_SPAN - 1))
    }

    /** 把任意日期夹到 [今天−29, 今天]：未来与超窗日期永不可选 */
    function clampReviewDay(day, today) {
      const base = dayPart(day)
      if (!base) return dayPart(today) || todayIso()
      const hi = dayPart(today) || todayIso()
      const lo = reviewMinDay(hi)
      if (base > hi) return hi
      if (base < lo) return lo
      return base
    }

    /** 最近 30 天（今天在最前，便于弹层从上往下读） */
    function reviewDayOptions(today) {
      const hi = dayPart(today) || todayIso()
      const out = []
      for (let i = 0; i < REVIEW_SPAN; i++) {
        const day = shiftDay(hi, -i)
        if (!day) break
        out.push(day)
      }
      return out
    }

    /** 月份键 ±N 个月，用于「本月无活动时回退到最近有活动的月份」 */
    function shiftMonthKey(monthKey, delta) {
      const m = /^(\d{4})-(\d{2})$/.exec(String(monthKey ?? ''))
      if (!m) return monthKey
      const d = new Date(Number(m[1]), Number(m[2]) - 1 + delta, 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }

    function monthLabel(monthKey) {
      const m = /^(\d{4})-(\d{2})$/.exec(String(monthKey ?? ''))
      return m ? `${m[1]} 年 ${Number(m[2])} 月` : String(monthKey ?? '')
    }
    /** 令牌/密钥时间：ISO 或秒/毫秒时间戳 → 'YYYY-MM-DD HH:mm' */
    function stampText(value) {
      if (value === null || value === undefined || value === '') return null
      let ms = NaN
      if (typeof value === 'number') ms = value < 1e12 ? value * 1000 : value
      else {
        const text = String(value).trim()
        if (/^\d+$/.test(text)) {
          const n = Number(text)
          ms = n < 1e12 ? n * 1000 : n
        } else ms = Date.parse(text)
      }
      if (!isFinite(ms)) return String(value)
      const d = new Date(ms)
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
    }
    /** 从若干候选字段里找第一个非空日期 */
    function dateOf(...vals) {
      for (const v of vals) {
        const day = dayPart(v)
        if (day) return day
      }
      return null
    }

    /* 运动类型 → 图标（内联 SVG，18px） */
    function sportIconKey(type) {
      const t = String(type ?? '').toLowerCase()
      if (/bik|cycl|bike|骑行/.test(t)) return 'bike'
      if (/run|treadmill|跑/.test(t)) return 'run'
      if (/swim|泳/.test(t)) return 'swim'
      if (/strength|weight|力量/.test(t)) return 'strength'
      if (/kayak|row|canoe|paddle|划/.test(t)) return 'paddle'
      if (/walk|步/.test(t)) return 'walk'
      if (/hik|hike|mount|徒步|登山/.test(t)) return 'hike'
      return 'dot'
    }

    function SportIcon({ type, size = 18 }) {
      const key = sportIconKey(type)
      const common = {
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.7,
        strokeLinecap: 'round', strokeLinejoin: 'round',
      }
      let paths
      if (key === 'bike') {
        paths = [
          h('circle', { key: 'a', cx: 5.6, cy: 17, r: 3.5, ...common }),
          h('circle', { key: 'b', cx: 18.4, cy: 17, r: 3.5, ...common }),
          h('path', { key: 'c', d: 'M5.6 17 9.4 8.6h4.4L18.4 17M9.9 8.6h4.3M8.2 12.7h6.5', ...common }),
        ]
      } else if (key === 'run') {
        paths = [
          h('path', {
            key: 'a',
            d: 'M3.4 16.9c0-1.7.8-2.8 2.2-3.9l2-1.5 1.3 1.7 2.4-.7-.4-2 2.7-.7 1.7 3.3c1.2.4 3.1.8 4.1 1.7.8.7 1 2.2.2 3H4.8c-.9 0-1.4-.4-1.4-.9Z',
            ...common,
          }),
          h('path', { key: 'b', d: 'M3.4 16.9v2.2h17.9', ...common }),
          h('path', { key: 'c', d: 'M8.7 11.2l1.5 2.1', ...common }),
        ]
      } else if (key === 'swim') {
        paths = [9, 13.4, 17.8].map((y, i) => h('path', {
          key: `w${i}`,
          d: `M2 ${y}c1.7 0 1.7-1.7 3.4-1.7S7.1 ${y} 8.8 ${y}s1.7-1.7 3.4-1.7S13.9 ${y} 15.6 ${y}s1.7-1.7 3.4-1.7S20.7 ${y} 22 ${y}`,
          ...common,
        }))
      } else if (key === 'strength') {
        paths = [
          h('path', { key: 'a', d: 'M7 8.4v7.2M4.4 9.7v4.6M17 8.4v7.2M19.6 9.7v4.6M7 12h10', ...common }),
        ]
      } else if (key === 'paddle') {
        paths = [
          h('path', { key: 'a', d: 'M12 21V9', ...common }),
          h('path', { key: 'b', d: 'M12 9C9.4 7.5 8 5.1 8.9 3.2c2.1-.9 3.8 1.2 3.1 5.8Z', ...common }),
          h('path', { key: 'c', d: 'M12 9c2.6-1.5 4-3.9 3.1-5.8-2.1-.9-3.8 1.2-3.1 5.8Z', ...common }),
        ]
      } else if (key === 'walk') {
        paths = [
          h('circle', { key: 'a', cx: 13.4, cy: 4.4, r: 1.9, ...common }),
          h('path', { key: 'b', d: 'M12.9 8.2c-.4 2-1.2 3.3-2.5 4.6l-2.3 2.2M13.2 8.2c1.1 1.7 2.1 2.7 3.1 4.3M10.4 13.4 9 20.6M14.9 12.5l2.2 8.1', ...common }),
        ]
      } else if (key === 'hike') {
        paths = [
          h('path', { key: 'a', d: 'M2.6 19.4 9.2 6.8l4 6.9 2.4-3.3 5.8 9Z', ...common }),
          h('path', { key: 'b', d: 'M7.4 11.2l1.8 1.7 1.7-1.7', ...common }),
        ]
      } else {
        paths = [h('circle', { key: 'a', cx: 12, cy: 12, r: 4.2, className: 'fill', fill: 'currentColor' })]
      }
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': true,
      }, ...paths)
    }

    /** 轨迹点归一化到 120×64（留 6px 内边距，经度按中纬度余弦压缩，Y 翻转北上） */
    function trackThumbPoints(points, W = 120, H = 64, PAD = 6) {
      const rows = (Array.isArray(points) ? points : [])
        .map((p) => (Array.isArray(p)
          ? [numOf(p[0]), numOf(p[1])]
          : [numOf(p?.lat, p?.latitude), numOf(p?.lon, p?.lng, p?.longitude)]))
        .filter(([la, lo]) => la !== null && lo !== null)
      if (rows.length < 2) return null
      const lats = rows.map((r) => r[0])
      const lons = rows.map((r) => r[1])
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
      return rows
        .map(([lat, lon]) => {
          const x = padX + (lon - minLon) * kx * scale
          const y = H - padY - (lat - minLat) * scale
          return `${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')
    }

    /** 当月网格：Mon 起 7 列，返回天数与前置空格数 */
    function monthGrid(monthKey) {
      const m = /^(\d{4})-(\d{2})$/.exec(String(monthKey ?? ''))
      const now = new Date()
      const y = m ? Number(m[1]) : now.getFullYear()
      const mo = m ? Number(m[2]) : now.getMonth() + 1
      const days = new Date(y, mo, 0).getDate()
      const firstDow = (new Date(y, mo - 1, 1).getDay() + 6) % 7
      return { year: y, month: mo, days, firstDow }
    }

    const TRAINING_STATUS_ZH = {
      PRODUCTIVE: '高效训练', PEAKING: '巅峰状态', MAINTAINING: '保持状态',
      RECOVERY: '恢复中', STRAINED: '负荷偏高', UNPRODUCTIVE: '低效训练',
      OVERREACHING: '过度训练', DETRAINING: '状态下滑', NO_STATUS: '暂无状态',
      BALANCED: '平衡',
    }
    const HEAT_TREND_ZH = {
      ACCLIMATIZED: '已适应', UNACCLIMATIZED: '未适应', DECAYING: '适应消退', NONE: '无数据',
    }
    const ACWR_ZH = {
      OPTIMAL: '适宜', LOW: '偏低', HIGH: '偏高', VERY_LOW: '过低', VERY_HIGH: '过高',
      UNDERTRAINING: '训练不足', OVERREACHING: '过度训练', 'OPTIMAL RANGE': '适宜',
    }
    const acwrText = (v) => (v ? ACWR_ZH[String(v).toUpperCase()] || String(v) : '')

    /** 把 {score|value|...} 或纯数字统一成 {score, level} */
    function scoreEntry(value) {
      const n = numOf(value)
      if (n !== null) return { score: n, level: null }
      if (!value || typeof value !== 'object') return null
      const score = numOf(value.score, value.value, value.endurance_score, value.enduranceScore,
        value.hill_score, value.hillScore, value.overall)
      if (score === null) return null
      return {
        score,
        level: firstOf(value.level, value.classification, value.status, value.label),
      }
    }

    /** 周/日序列取最后一条 */
    function latestRow(value) {
      if (Array.isArray(value)) return value.length ? value[value.length - 1] : null
      if (!value || typeof value !== 'object') return null
      for (const key of ['weekly', 'daily', 'series', 'trend', 'data', 'rows', 'periods']) {
        if (Array.isArray(value[key]) && value[key].length) return value[key][value[key].length - 1]
      }
      return value
    }

    /* 上次同步：接口可能给 ISO 字符串 / 秒 / 毫秒，统一成「3 分钟前」或「上次同步 20:12」 */
    function syncText(value) {
      if (value === null || value === undefined || value === '') return null
      const pad = (n) => String(n).padStart(2, '0')
      let ms = NaN
      if (typeof value === 'number') {
        ms = value < 1e12 ? value * 1000 : value
      } else if (typeof value === 'string') {
        const text = value.trim()
        if (/^\d+$/.test(text)) {
          const n = Number(text)
          ms = n < 1e12 ? n * 1000 : n
        } else {
          ms = Date.parse(text)
          if (Number.isNaN(ms)) return text
        }
      }
      if (!isFinite(ms)) return null
      const diff = Date.now() - ms
      if (diff < 60e3) return '刚刚'
      if (diff < 3600e3) return `${Math.floor(diff / 60e3)} 分钟前`
      if (diff < 86400e3) return `${Math.floor(diff / 3600e3)} 小时前`
      const d = new Date(ms)
      if (diff < 7 * 86400e3) return `上次同步 ${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
      return `上次同步 ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }

    /* 太阳能 / 闹钟这两个接口的返回形状比较宽松，这里都兜一下 */
    function solarText(solar) {
      if (!solar || typeof solar !== 'object') return null
      const list = Array.isArray(solar)
        ? solar
        : Array.isArray(solar.solar_data) ? solar.solar_data
          : Array.isArray(solar.data) ? solar.data : null
      const row = list ? list[list.length - 1] : solar
      if (!row || typeof row !== 'object' || Array.isArray(row)) return null
      const intensity = numOf(row.solar_utilization_max_pct, row.solar_utilization_avg_pct,
        row.solarIntensityMaxPct, row.solarIntensityAvgPct, row.intensity)
      const charge = numOf(row.activity_time_gained_minutes, row.chargeTimeMinutes,
        row.solar_charge_time_minutes, row.minutes_gained)
      const parts = []
      if (intensity !== null) parts.push(`强度 ${fmt(intensity, intensity < 10 ? 1 : 0)}%`)
      if (charge !== null) parts.push(`充电 +${fmt(charge, charge < 10 ? 1 : 0)} 分钟`)
      return parts.length ? parts.join(' · ') : null
    }
    function alarmCount(alarms) {
      if (alarms === null || alarms === undefined) return null
      if (Array.isArray(alarms)) return alarms.length
      if (typeof alarms === 'object') {
        if (Array.isArray(alarms.alarms)) return alarms.alarms.length
        if (typeof alarms.count === 'number') return alarms.count
      }
      return null
    }

    /** 统一剪贴板：优先 async API，失败退回 execCommand，返回是否成功 */
    function copyText(text) {
      return new Promise((resolve) => {
        const fallback = () => {
          try {
            const ta = document.createElement('textarea')
            ta.value = text
            ta.style.position = 'fixed'
            ta.style.top = '-1000px'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.focus()
            ta.select()
            const ok = document.execCommand('copy')
            ta.remove()
            resolve(!!ok)
          } catch {
            resolve(false)
          }
        }
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(() => resolve(true)).catch(fallback)
        } else fallback()
      })
    }

    /* ---------------- v6 小工具：性别 / 训练计划 / 目标 ---------------- */
    const GENDER_STORAGE_KEY = 'garmin-panel-gender-v1'
    const GENDER_VALUES = ['female', 'male']
    /** 'female' | 'male' 存本地；'none' 只作为本次会话的「未设置」哨兵，不写 localStorage */
    function normalizeGender(value) {
      const text = String(value ?? '').trim().toLowerCase()
      return GENDER_VALUES.includes(text) ? text : null
    }
    function readStoredGender() {
      try { return normalizeGender(localStorage.getItem(GENDER_STORAGE_KEY)) } catch { return null }
    }
    function writeStoredGender(value) {
      const next = normalizeGender(value)
      try {
        if (next) localStorage.setItem(GENDER_STORAGE_KEY, next)
        else localStorage.removeItem(GENDER_STORAGE_KEY)
      } catch { /* 隐私模式：只影响记忆 */ }
      return next
    }

    const WEEKDAYS_ZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    /** 周一起算的周一日期；无法解析时返回 null */
    function mondayOf(day) {
      const base = dayPart(day)
      if (!base) return null
      const [y, m, d] = base.split('-').map(Number)
      const dt = new Date(y, m - 1, d, 12, 0, 0, 0)
      const dow = (dt.getDay() + 6) % 7
      dt.setDate(dt.getDate() - dow)
      return isoDay(dt)
    }
    function planWeekStart(week) {
      return mondayOf(week?.start) || mondayOf(isoDay(new Date()))
    }
    function planWorkoutAt(workouts, date) {
      const rows = (Array.isArray(workouts) ? workouts : [])
        .filter((row) => row && dayPart(row.date) === date)
      return rows.length ? { workout: rows[0], count: rows.length } : null
    }
    function planDurationText(minutes) {
      const min = numOf(minutes)
      if (min === null || min <= 0) return ''
      if (min < 60) return `${Math.round(min)} 分钟`
      const hh = Math.floor(min / 60)
      const mm = Math.round(min % 60)
      return mm ? `${hh}h${pad2(mm)}m` : `${hh}h`
    }
    function planWorkoutName(workout) {
      return String(firstOf(workout?.name, workout?.title, '未命名课程'))
    }

    /* 训练计划只读：编辑 / 排课都回 Garmin Connect，这里只拼深链 */
    const GARMIN_WEB_INTL = 'https://connect.garmin.com'
    const GARMIN_WEB_CN = 'https://connect.garmin.cn'
    function planLinks(data) {
      const region = String(data?.region ?? data?.garminRegion ?? '').trim().toLowerCase()
      const base = region === 'cn' ? GARMIN_WEB_CN : GARMIN_WEB_INTL
      return {
        base,
        calendar: `${base}/modern/calendar`,
        workouts: `${base}/modern/workouts`,
        coach: `${base}/modern/coach`,
        goals: `${base}/modern/goals`,
        workout: (id) => `${base}/modern/workout/${encodeURIComponent(String(id))}`,
      }
    }
    function planWorkoutHref(workout, links) {
      return workout?.workoutId != null && workout.workoutId !== ''
        ? links.workout(workout.workoutId)
        : links.calendar
    }
    function planDistanceText(meters) {
      const m = numOf(meters)
      if (m === null || m <= 0) return ''
      if (m >= 1000) {
        const km = m / 1000
        return `${fmt(km, Number.isInteger(km) ? 0 : 1)} km`
      }
      return `${fmt(Math.round(m))} m`
    }
    /** 来源：Coach 显式标记优先；排课与 Coach 重叠时按 Coach 算（id → 日期 + 名称） */
    function planSourceOf(workout, coachRows) {
      const raw = String(workout?.source ?? '').trim().toLowerCase()
      if (raw === 'coach' || raw === 'garmin_coach' || raw === 'garmin coach') return 'Garmin Coach'
      const rows = Array.isArray(coachRows) ? coachRows : []
      const day = dayPart(workout?.date)
      const name = planWorkoutName(workout)
      const hit = rows.some((row) => {
        if (workout?.workoutId != null && row?.workoutId != null) {
          return String(row.workoutId) === String(workout.workoutId)
        }
        return dayPart(row?.date) === day && planWorkoutName(row) === name
      })
      return hit ? 'Garmin Coach' : '已排课'
    }
    function planSportText(workout) {
      const type = String(workout?.type ?? '').trim()
      if (!type) return '运动'
      return SPORT_ZH[type] || type
    }
    /** 复制详情：单节课 3 行（名称 / 日期·类型·时长·距离·来源 / Garmin 链接） */
    function planDetailText(day, workout, links, source) {
      if (!day || !workout) return ''
      const meta = [
        `${day.date} ${day.weekday}`,
        planSportText(workout),
        `时长 ${planDurationText(workout.durationMin) || '未标注'}`,
        `距离 ${planDistanceText(workout.distanceM) || '未标注'}`,
        `来源 ${source || '已排课'}`,
      ]
      const done = workout.completed ? ' [已完成]' : ''
      return [
        planWorkoutName(workout),
        meta.join(' · ') + done,
        planWorkoutHref(workout, links),
      ].join('\n')
    }
    /** 问 AI 教练：固定句式，课程名 / 日期 / 时长 */
    function planAiPrompt(day, workout) {
      return `帮我看下这节课：${planWorkoutName(workout)}（${day.date}，${planDurationText(workout.durationMin) || '时长未标注'}）`
    }
    /** 复制整周：固定 7 行，无课写「休息」 */
    function planWeekText(days) {
      return (Array.isArray(days) ? days : []).map((day) => {
        const workout = day?.workout
        if (!workout) return `${day?.weekday || ''} ${shortDay(day?.date)} · 休息`.trim()
        const bits = [planWorkoutName(workout)]
        const duration = planDurationText(workout.durationMin)
        if (duration) bits.push(duration)
        const distance = planDistanceText(workout.distanceM)
        if (distance) bits.push(distance)
        const done = workout.completed ? ' [已完成]' : ''
        return `${day.weekday} ${shortDay(day.date)} · ${bits.join(' · ')}${done}`
      }).join('\n')
    }
    const PLAN_AI_WEEK_PROMPT = '我本周想安排骑行训练，请根据我的负荷给出一周计划'

    const GOAL_TYPE_ZH = {
      distance: '距离', duration: '时长', time: '时长', steps: '步数',
      calories: '卡路里', weight: '体重', workouts: '训练次数', count: '次数',
    }
    function goalTypeText(type) {
      const key = String(type ?? '').trim().toLowerCase()
      if (!key) return '目标'
      return GOAL_TYPE_ZH[key] || String(type)
    }
    function goalUnitText(type) {
      const key = String(type ?? '').trim().toLowerCase()
      if (/distance|骑|跑|swim|cycl|bike/.test(key)) return 'km'
      if (/duration|time|时长/.test(key)) return '分钟'
      if (/steps|步/.test(key)) return '步'
      if (/calorie|卡/.test(key)) return 'kcal'
      if (/weight|体重/.test(key)) return 'kg'
      return ''
    }
    function goalNumber(value) {
      const n = numOf(value)
      return n === null ? null : fmt(n, Number.isInteger(n) ? 0 : 1)
    }

    /** 生成给 AI 的简报文本（也是复制的内容） */
    /** 抽屉用：按需取 JSON，卸载/换路径时 abort；enabled=false 时完全不动 */
    function useJson(path, enabled = true, version = 0) {
      const [state, setState] = React.useState({ loading: !!enabled })
      React.useEffect(() => {
        if (!enabled || !path) return undefined
        const controller = new AbortController()
        let active = true
        setState({ loading: true })
        fetch(`${API}/${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((data) => {
            if (active) setState({ loading: false, data })
          })
          .catch((err) => {
            if (!active || err?.name === 'AbortError') return
            setState({ loading: false, error: String(err?.message ?? err) })
          })
        return () => {
          active = false
          controller.abort()
        }
      }, [path, enabled, version])
      return state
    }

    /**
     * 活动缩略轨迹：只对候选活动懒加载，并发 ≤ 3，按 id 记忆化。
     * version 变化会丢弃旧缓存（刷新即重取）；enabled=false 完全不发请求。
     */
    function useActivityTracks(ids, enabled, version, concurrency = 3) {
      const store = React.useRef({ version, map: {} })
      if (store.current.version !== version) store.current = { version, map: {} }
      const [, bump] = React.useReducer((n) => n + 1, 0)
      const key = (Array.isArray(ids) ? ids : []).join(',')

      React.useEffect(() => {
        if (!enabled) return undefined
        const list = key ? key.split(',') : []
        const map = store.current.map
        const pending = list.filter((id) => !map[id])
        if (!pending.length) return undefined
        let active = true
        let cursor = 0
        let inflight = 0
        const controllers = new Set()

        const pump = () => {
          if (!active) return
          while (inflight < concurrency && cursor < pending.length) {
            const id = pending[cursor++]
            if (map[id]) continue
            map[id] = { status: 'loading' }
            inflight += 1
            const controller = new AbortController()
            controllers.add(controller)
            fetch(`${API}/activities/${encodeURIComponent(id)}/track`, {
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            })
              .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
              .then((data) => {
                if (!active) return
                if (data?.status === 'ok') {
                  const points = trackThumbPoints(data.points)
                  map[id] = points ? { status: 'ok', points } : { status: 'no_track' }
                } else {
                  map[id] = { status: data?.status || 'no_track' }
                }
              })
              .catch((err) => {
                if (active) map[id] = { status: 'error', error: String(err?.message ?? err) }
              })
              .finally(() => {
                controllers.delete(controller)
                inflight -= 1
                if (active) { bump(); pump() }
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
          for (const id of pending) {
            if (map[id]?.status === 'loading') delete map[id]
          }
        }
      }, [key, enabled, version, concurrency])

      return store.current.map
    }

    /**
     * 区块级资源加载：enabled=false 时完全不发请求（隐藏区块不浪费一次 Garmin 调用）。
     * 重新显示（enabled 变 true）会重新拉取；过期响应用 cancelled 丢弃。
     */
    function useResource(path, version, enabled = true) {
      const [state, setState] = React.useState({ loading: !!enabled })
      React.useEffect(() => {
        if (!enabled || !path) {
          setState({ loading: false })
          return undefined
        }
        const controller = new AbortController()
        let cancelled = false
        setState((s) => (s.data ? { ...s, loading: true } : { loading: true }))
        fetch(`${API}/${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((data) => { if (!cancelled) setState({ loading: false, data }) })
          .catch((err) => {
            if (cancelled || err?.name === 'AbortError') return
            setState({ loading: false, error: String(err?.message ?? err) })
          })
        return () => {
          cancelled = true
          controller.abort()
        }
      }, [path, version, enabled])
      return state
    }

    /** POST JSON：返回解析后的 body；网络/HTTP 失败抛出 */
    async function postJson(path, body, signal) {
      const res = await fetch(`${API}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
        signal,
      })
      let data = null
      try { data = await res.json() } catch { data = null }
      if (!res.ok && !data) throw new Error(`HTTP ${res.status}`)
      return data
    }

    /** GET JSON：非 2xx 直接抛错，交给调用方显示 */
    async function fetchJson(path, signal) {
      const res = await fetch(`${API}/${path}`, {
        headers: { Accept: 'application/json' },
        signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    }

    /* ---------------------------------------------------------------- *
     * 静态底图（高德）
     * - 全局只探测一次 /staticmap/status；老 host 没有该端点时回退到
     *   /roadbook/status 的 amapConfigured / amapKeyValid。
     * - 结果按「首/末点 + 点数 + bbox + 尺寸 + coord/kind」缓存在模块级 Map，
     *   同一组轨迹在抽屉关闭重开、标签来回切换时不会重复打接口（配额友好）。
     * - 请求可取消：最后一个消费组件卸载时 abort，并清掉 inflight。
     * ---------------------------------------------------------------- */
    const STATIC_MAP_STATUS = {
      configured: false,
      valid: false,
      known: false,
      loading: true,
    }
    let staticMapStatusPromise = null
    const staticMapStatusListeners = new Set()

    const staticMapStatusSnapshot = () => ({ ...STATIC_MAP_STATUS })

    function staticMapStatusApply(next) {
      Object.assign(STATIC_MAP_STATUS, next)
      const snapshot = staticMapStatusSnapshot()
      for (const listener of staticMapStatusListeners) {
        try { listener(snapshot) } catch { /* ignore */ }
      }
    }

    /** 只发一次状态探测；失败静默降级（未知 → 不启用底图） */
    function loadStaticMapStatus() {
      if (staticMapStatusPromise) return staticMapStatusPromise
      staticMapStatusPromise = (async () => {
        let next = null
        try {
          const res = await fetch(`${API}/staticmap/status`, {
            headers: { Accept: 'application/json' },
          })
          if (res.ok) {
            const data = await res.json()
            if (data && typeof data === 'object') {
              next = {
                configured: !!data.configured,
                valid: data.valid !== false,
                known: true,
                loading: false,
              }
            }
          }
        } catch { /* 老 host 无此端点 → 走 /roadbook/status */ }
        if (!next) {
          try {
            const res = await fetch(`${API}/roadbook/status`, {
              headers: { Accept: 'application/json' },
            })
            if (res.ok) {
              const data = await res.json()
              if (data && typeof data === 'object') {
                next = {
                  configured: !!data.amapConfigured,
                  valid: data.amapKeyValid !== false,
                  known: true,
                  loading: false,
                }
              }
            }
          } catch { /* 静默降级 */ }
        }
        staticMapStatusApply(next || {
          configured: false, valid: false, known: false, loading: false,
        })
        return staticMapStatusSnapshot()
      })()
      return staticMapStatusPromise
    }

    function useStaticMapStatus() {
      const [state, setState] = React.useState(staticMapStatusSnapshot)
      React.useEffect(() => {
        let active = true
        const listener = (next) => { if (active) setState(next) }
        staticMapStatusListeners.add(listener)
        loadStaticMapStatus().then((next) => { if (active) setState(next) })
        return () => {
          active = false
          staticMapStatusListeners.delete(listener)
        }
      }, [])
      return state
    }

    /** [lat,lng] / {lat,lon|lng} → [lat,lng]；非法点丢弃 */
    function staticMapLatLng(point) {
      if (Array.isArray(point)) {
        const lat = numOf(point[0])
        const lng = numOf(point[1])
        return lat !== null && lng !== null ? [lat, lng] : null
      }
      if (point && typeof point === 'object') {
        const lat = numOf(point.lat, point.latitude)
        const lng = numOf(point.lng, point.lon, point.longitude)
        return lat !== null && lng !== null ? [lat, lng] : null
      }
      return null
    }
    const staticMapPoints = (points) => (Array.isArray(points) ? points : [])
      .map(staticMapLatLng)
      .filter(Boolean)

    function staticMapOptions(options) {
      const opts = options && typeof options === 'object' ? options : {}
      const rawW = numOf(opts.width)
      const rawH = numOf(opts.height)
      return {
        coord: opts.coord === 'gcj02' ? 'gcj02' : 'wgs84',
        width: Math.max(160, Math.min(1600, Math.round(rawW === null ? 720 : rawW))),
        height: Math.max(120, Math.min(1200, Math.round(rawH === null ? 360 : rawH))),
        kind: opts.kind === 'route' ? 'route' : 'activity',
        color: opts.color ? String(opts.color) : null,
        weight: numOf(opts.weight),
        enabled: opts.enabled !== false,
      }
    }

    /** 便宜的缓存键：首/末点 + 点数 + bbox + 尺寸 + coord/kind */
    function staticMapKey(rows, opts) {
      let minLat = Infinity
      let minLng = Infinity
      let maxLat = -Infinity
      let maxLng = -Infinity
      for (const [lat, lng] of rows) {
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
      }
      const round = (n) => Math.round(n * 1e5) / 1e5
      const first = rows[0]
      const last = rows[rows.length - 1]
      return [
        opts.coord,
        opts.kind,
        `${opts.width}x${opts.height}`,
        opts.color || '',
        opts.weight === null ? '' : String(opts.weight),
        rows.length,
        round(first[0]), round(first[1]),
        round(last[0]), round(last[1]),
        round(minLat), round(minLng), round(maxLat), round(maxLng),
      ].join('|')
    }

    function staticMapBody(rows, opts) {
      const body = {
        points: rows,
        coord: opts.coord,
        width: opts.width,
        height: opts.height,
        kind: opts.kind,
      }
      if (opts.color) body.color = opts.color
      if (opts.weight !== null) body.weight = opts.weight
      return body
    }

    /** 统一响应：ok → {url}；unavailable → 静默降级；其余 → 错误 */
    function staticMapResult(data) {
      if (data && data.status === 'ok'
        && typeof data.dataUrl === 'string' && data.dataUrl.startsWith('data:image/')) {
        return { status: 'ok', url: data.dataUrl, source: data.source || 'amap' }
      }
      if (data && data.status === 'unavailable') {
        return { status: 'unavailable', message: String(data.message || '底图不可用') }
      }
      return {
        status: 'error',
        error: String((data && (data.message || data.error)) || '底图加载失败'),
      }
    }

    const STATIC_MAP_CACHE = new Map()
    const STATIC_MAP_INFLIGHT = new Map()

    /** 量容器宽度：静态图按容器等比请求，避免 object-fit 裁掉轨迹 */
    function useElementWidth() {
      const [width, setWidth] = React.useState(0)
      const cleanupRef = React.useRef(null)
      const setRef = React.useCallback((node) => {
        if (cleanupRef.current) {
          cleanupRef.current()
          cleanupRef.current = null
        }
        if (!node) {
          setWidth(0)
          return
        }
        const read = () => {
          const next = Math.round(node.getBoundingClientRect().width)
          setWidth((prev) => (prev === next ? prev : next))
        }
        read()
        if (typeof ResizeObserver === 'function') {
          const observer = new ResizeObserver(read)
          observer.observe(node)
          cleanupRef.current = () => observer.disconnect()
        } else {
          window.addEventListener('resize', read)
          cleanupRef.current = () => window.removeEventListener('resize', read)
        }
      }, [])
      React.useEffect(() => () => {
        if (cleanupRef.current) cleanupRef.current()
      }, [])
      return [setRef, width]
    }

    /**
     * 取缓存 / 共享 inflight。返回 { result } 或 { entry }；
     * entry.refs 记录消费组件数，最后一个卸载且未完成时 abort。
     */
    function staticMapEntry(key, rows, opts) {
      const cached = STATIC_MAP_CACHE.get(key)
      if (cached) return { result: cached, entry: null }
      let entry = STATIC_MAP_INFLIGHT.get(key)
      if (!entry) {
        const controller = new AbortController()
        entry = { controller, refs: 0, settled: false, promise: null }
        entry.promise = fetch(`${API}/staticmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(staticMapBody(rows, opts)),
          signal: controller.signal,
        })
          .then((res) => res.json().catch(() => null).then((data) => ({ res, data })))
          .then(({ res, data }) => {
            if (!res.ok && !data) throw new Error(`HTTP ${res.status}`)
            const result = staticMapResult(data)
            if (result.status === 'ok' || result.status === 'unavailable') {
              STATIC_MAP_CACHE.set(key, result)
            }
            return result
          })
          .finally(() => {
            entry.settled = true
            STATIC_MAP_INFLIGHT.delete(key)
          })
        STATIC_MAP_INFLIGHT.set(key, entry)
      }
      entry.refs += 1
      return { result: null, entry }
    }

    function staticMapStateOf(result) {
      if (result.status === 'ok') {
        return {
          url: result.url,
          loading: false,
          error: null,
          unavailable: false,
          configured: true,
          valid: true,
          source: result.source || 'amap',
        }
      }
      if (result.status === 'unavailable') {
        return {
          url: null,
          loading: false,
          error: null,
          unavailable: true,
          configured: true,
          valid: true,
          message: result.message,
        }
      }
      return {
        url: null,
        loading: false,
        error: result.error || '底图加载失败',
        unavailable: false,
        configured: true,
        valid: true,
      }
    }

    /**
     * useStaticMap(points, options) → { url, loading, error, unavailable, ... }
     * options: { coord: 'wgs84'|'gcj02', kind: 'activity'|'route', width, height,
     *            color?, weight?, enabled? }
     * 只有 configured && valid && points.length >= 2 时才发请求。
     */
    function useStaticMap(points, options = {}) {
      const status = useStaticMapStatus()
      const rows = staticMapPoints(points)
      const opts = staticMapOptions(options)
      const active = opts.enabled && status.configured && status.valid && rows.length >= 2
      const key = active ? staticMapKey(rows, opts) : ''
      const inactive = () => ({
        url: null,
        loading: false,
        error: null,
        unavailable: !!status.known && (!status.configured || !status.valid),
        configured: !!status.configured,
        valid: !!status.valid,
      })
      const [state, setState] = React.useState(() => {
        if (!active) return inactive()
        const cached = STATIC_MAP_CACHE.get(key)
        if (cached) return staticMapStateOf(cached)
        return {
          url: null,
          loading: true,
          error: null,
          unavailable: false,
          configured: true,
          valid: true,
        }
      })

      React.useEffect(() => {
        if (!active) {
          setState(inactive())
          return undefined
        }
        const cached = STATIC_MAP_CACHE.get(key)
        if (cached) {
          setState(staticMapStateOf(cached))
          return undefined
        }
        const { entry } = staticMapEntry(key, rows, opts)
        let mounted = true
        setState((prev) => (prev.url ? prev : {
          url: null,
          loading: true,
          error: null,
          unavailable: false,
          configured: true,
          valid: true,
        }))
        entry.promise
          .then((result) => {
            if (mounted) setState(staticMapStateOf(result))
          })
          .catch((err) => {
            if (!mounted || err?.name === 'AbortError') return
            setState({
              url: null,
              loading: false,
              error: String(err?.message ?? err),
              unavailable: false,
              configured: true,
              valid: true,
            })
          })
        return () => {
          mounted = false
          entry.refs -= 1
          if (entry.refs <= 0 && !entry.settled) {
            try { entry.controller.abort() } catch { /* ignore */ }
            STATIC_MAP_INFLIGHT.delete(key)
          }
        }
        // key/active 已编码坐标、尺寸、kind 与状态，无需把对象放进依赖
      }, [key, active])

      return state
    }

    /* ---------------------------------------------------------------- *
     * 个性化布局：区块级 + 卡片级（localStorage 持久化）
     * v2: [{ id, visible, cards: [{ id, visible }] }]，数组顺序 = 渲染顺序
     * ---------------------------------------------------------------- */
    const LAYOUT_STORAGE_KEY = 'garmin-panel-layout-v2'
    const LEGACY_LAYOUT_STORAGE_KEY = 'garmin-panel-layout-v1'
    const SECTION_DEFS = [
      { id: 'kpi', label: '今日状态', hint: '准备度 · 睡眠 · 恢复' },
      { id: 'body', label: '今天身体（含恢复）', hint: '步数 · 心率 · 压力' },
      { id: 'sleep', label: '睡眠 · 近 7 晚', hint: '近 7 晚' },
      { id: 'womens', label: '女性健康', hint: '周期 · 孕期' },
      { id: 'trends', label: '健康趋势', hint: '最近 7 天 / 30 天' },
      { id: 'load', label: '训练负荷', hint: '趋势 · 平衡 · 能力' },
      { id: 'advanced', label: '进阶数据', hint: '训练状态 · 阈值 · 耐受 · 体能年龄' },
      { id: 'coach', label: 'AI 健康 · 今日建议', hint: '教练与管家' },
      { id: 'plan', label: '训练计划', hint: '本周课表 · 目标 · 只读' },
      { id: 'activities', label: '最近活动', hint: '近 30 天 · 月度分布' },
      { id: 'extras', label: '计划 · 装备 · 身体', hint: '本周安排 · 装备 · 体重' },
      { id: 'records', label: '个人记录', hint: '最佳成绩' },
    ]
    /* 多卡板块的卡片清单：id + 中文名；顺序即默认渲染顺序 */
    const CARD_DEFS = {
      kpi: [
        { id: 'readiness', label: '训练准备度' },
        { id: 'sleep', label: '睡眠评分' },
        { id: 'battery', label: 'Body Battery' },
        { id: 'rhr', label: '静息心率' },
        { id: 'intensity', label: '本周强度分钟' },
      ],
      body: [
        { id: 'steps', label: '步数' },
        { id: 'calories', label: '能量消耗' },
        { id: 'stress', label: '压力' },
        { id: 'hr', label: '心率' },
        { id: 'breath', label: '呼吸 / 血氧' },
        { id: 'hydration', label: '水分' },
        { id: 'recovery', label: '恢复' },
      ],
      womens: [
        { id: 'cycle', label: '周期' },
        { id: 'pregnancy', label: '孕期' },
      ],
      trends: [
        { id: 'rhr', label: '静息心率' },
        { id: 'hrv', label: 'HRV' },
        { id: 'sleep', label: '睡眠' },
        { id: 'steps', label: '步数' },
        { id: 'stress', label: '压力' },
        { id: 'battery', label: 'Body Battery' },
        { id: 'respiration', label: '呼吸' },
        { id: 'spo2', label: '血氧' },
        { id: 'intensity', label: '强度分钟' },
        { id: 'weight', label: '体重' },
      ],
      load: [
        { id: 'trend', label: '负荷趋势' },
        { id: 'balance', label: '负荷平衡' },
        { id: 'ability', label: '能力' },
        { id: 'insight', label: '今日提醒' },
      ],
      advanced: [
        { id: 'status', label: '训练状态' },
        { id: 'thresholds', label: '阈值' },
        { id: 'tolerance', label: '跑步耐受度' },
        { id: 'endurance', label: '耐力 / 爬坡' },
        { id: 'acclimation', label: '热适应 / 海拔' },
        { id: 'fitnessAge', label: '体能年龄' },
        { id: 'hrzones', label: '心率区间' },
      ],
      extras: [
        { id: 'plan', label: '本周安排' },
        { id: 'gear', label: '装备' },
        { id: 'devices', label: '设备' },
        { id: 'bodycomp', label: '身体成分' },
        { id: 'nutrition', label: 'AI 营养建议' },
      ],
      coach: [
        { id: 'coach', label: 'AI 教练' },
        { id: 'steward', label: 'AI 健康管家' },
      ],
      plan: [
        { id: 'week', label: '本周课表' },
        { id: 'coach', label: 'Garmin Coach' },
        { id: 'goals', label: '目标' },
      ],
      activities: [
        { id: 'list', label: '活动列表' },
        { id: 'month', label: '月度分布' },
      ],
    }
    const CARD_META = Object.keys(CARD_DEFS).reduce((acc, sectionId) => {
      acc[sectionId] = CARD_DEFS[sectionId].reduce((map, card) => { map[card.id] = card; return map }, {})
      return acc
    }, {})
    const SECTION_META = SECTION_DEFS.reduce((acc, s) => { acc[s.id] = s; return acc }, {})
    const SECTION_IDS = SECTION_DEFS.map((s) => s.id)
    const cardsFor = (sectionId) => CARD_DEFS[sectionId] || []
    const defaultCards = (sectionId) => cardsFor(sectionId).map((card) => ({ id: card.id, visible: true }))
    const cardLabel = (sectionId, cardId) => CARD_META[sectionId]?.[cardId]?.label || cardId
    /* 新用户 / 恢复默认只铺稳定区块；plan / womens 由 Page 在可用时按默认顺序补进来 */
    const BASE_SECTION_IDS = SECTION_DEFS.map((s) => s.id)
      .filter((id) => id !== 'plan' && id !== 'womens')
    const defaultLayout = () => BASE_SECTION_IDS.map((id) => ({
      id,
      visible: true,
      cards: defaultCards(id),
    }))

    /** 单板块的卡片数组清洗：未知/重复丢弃，缺失的按默认顺序补在末尾（visible=true） */
    function sanitizeCards(sectionId, rawCards) {
      const defs = cardsFor(sectionId)
      if (!defs.length) return []
      const known = new Set(defs.map((card) => card.id))
      const seen = new Set()
      const out = []
      if (Array.isArray(rawCards)) {
        for (const row of rawCards) {
          const id = row && typeof row.id === 'string' ? row.id : null
          if (!id || !known.has(id) || seen.has(id)) continue
          seen.add(id)
          out.push({ id, visible: row.visible !== false })
        }
      }
      for (const def of defs) {
        if (!seen.has(def.id)) out.push({ id: def.id, visible: true })
      }
      return out
    }

    /**
     * 读取 v2；v2 不存在时回退 v1（旧布局只有区块，卡片补默认值）。
     * 未知/重复区块丢弃，缺失的按默认顺序补在末尾；坏 JSON 直接退回默认。
     */
    function readLayout2() {
      const fallback = defaultLayout()
      let raw = null
      try {
        raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
        if (!raw) raw = localStorage.getItem(LEGACY_LAYOUT_STORAGE_KEY)
      } catch { return fallback }
      if (!raw) return fallback
      let parsed
      try { parsed = JSON.parse(raw) } catch { return fallback }
      if (!Array.isArray(parsed)) return fallback
      const seen = new Set()
      const out = []
      for (const row of parsed) {
        const id = row && typeof row.id === 'string' ? row.id : null
        if (!id || seen.has(id) || !SECTION_META[id]) continue
        seen.add(id)
        out.push({
          id,
          visible: row.visible !== false,
          cards: sanitizeCards(id, row.cards),
        })
      }
      for (const id of BASE_SECTION_IDS) {
        if (!seen.has(id)) {
          out.push({ id, visible: true, cards: defaultCards(id) })
        }
      }
      return out.length ? out : fallback
    }

    function writeLayout2(layout) {
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout.map((row) => ({
          id: row.id,
          visible: row.visible !== false,
          cards: (Array.isArray(row.cards) ? row.cards : []).map((card) => ({
            id: card.id,
            visible: card.visible !== false,
          })),
        }))))
      } catch { /* 隐私模式/配额满：只影响记忆，不影响当前会话 */ }
    }

    /** 恢复默认时同时清掉 v1，避免以后误以为旧布局还在 */
    function clearLegacyLayout() {
      try { localStorage.removeItem(LEGACY_LAYOUT_STORAGE_KEY) } catch { /* ignore */ }
    }

    const sectionRowOf = (layout, sectionId) => layout.find((row) => row.id === sectionId)

    /** 读取某板块的卡片顺序；数据损坏时回退默认顺序 */
    function cardsOf(layout, sectionId) {
      const row = sectionRowOf(layout, sectionId)
      return row && Array.isArray(row.cards) && row.cards.length ? row.cards : defaultCards(sectionId)
    }

    /**
     * 纯函数：隐藏 / 追加 / 拖拽排序（区块级）。
     * 行对象整体搬移，cards 字段保持不变。
     */
    function hideInLayout(layout, id) {
      if (!SECTION_META[id]) return layout
      const index = layout.findIndex((row) => row.id === id)
      if (index < 0 || layout[index].visible === false) return layout
      const next = layout.slice()
      next[index] = { ...layout[index], visible: false }
      return next
    }

    /** 追加到可见顺序末尾：把行移到完整数组末尾并置为可见 */
    function appendToLayout(layout, id) {
      if (!SECTION_META[id]) return layout
      const row = sectionRowOf(layout, id)
      if (!row) return layout
      return [...layout.filter((item) => item.id !== id), { ...row, visible: true }]
    }

    /**
     * 新区块按默认顺序插入：放在默认顺序里它后面第一个已有区块之前。
     * 用于 plan / womens 这类「条件可用」的区块迁移，避免一律追加到末尾。
     */
    function insertSectionByDefault(layout, id) {
      if (!SECTION_META[id] || sectionRowOf(layout, id)) return layout
      const defIndex = SECTION_IDS.indexOf(id)
      const at = layout.findIndex((row) => SECTION_IDS.indexOf(row.id) > defIndex)
      const next = layout.slice()
      next.splice(at < 0 ? next.length : at, 0, {
        id,
        visible: true,
        cards: defaultCards(id),
      })
      return next
    }

    /**
     * 把 id 移到可见序列的 at 位置（0..visibleCount，表示插到第 at 个可见区块之前）。
     * 隐藏区块在完整数组里的相对位置尽量保持不动：锚点取目标可见区块在完整数组中的下标。
     */
    function reorderLayout(layout, id, at) {
      const visibleRows = layout.filter((row) => row.visible !== false)
      const fromVisible = visibleRows.findIndex((row) => row.id === id)
      if (fromVisible < 0 || !Number.isFinite(at)) return layout
      let target = Math.max(0, Math.min(at, visibleRows.length))
      if (fromVisible < target) target -= 1
      if (target === fromVisible) return layout
      const fromIndex = layout.findIndex((row) => row.id === id)
      const anchorId = at < visibleRows.length ? visibleRows[at].id : null
      const anchorIndex = anchorId ? layout.findIndex((row) => row.id === anchorId) : layout.length
      const next = layout.slice()
      const [row] = next.splice(fromIndex, 1)
      next.splice(fromIndex < anchorIndex ? anchorIndex - 1 : anchorIndex, 0, row)
      return next
    }

    /** 对某板块的 cards 数组做不可变更新；mutate 返回 null 表示无变化 */
    function updateCards(layout, sectionId, mutate) {
      if (!CARD_META[sectionId]) return layout
      const index = layout.findIndex((row) => row.id === sectionId)
      if (index < 0) return layout
      const row = layout[index]
      const cards = cardsOf(layout, sectionId)
      const nextCards = mutate(cards.slice())
      if (!nextCards) return layout
      const next = layout.slice()
      next[index] = { ...row, cards: nextCards }
      return next
    }

    /** 隐藏某张卡片：只改 visible，数组位置不变 */
    function hideCard(layout, sectionId, cardId) {
      if (!CARD_META[sectionId]?.[cardId]) return layout
      return updateCards(layout, sectionId, (cards) => {
        const index = cards.findIndex((card) => card.id === cardId)
        if (index < 0 || cards[index].visible === false) return null
        cards[index] = { ...cards[index], visible: false }
        return cards
      })
    }

    /** 显示某张卡片：移到可见顺序末尾并置为可见 */
    function showCard(layout, sectionId, cardId) {
      if (!CARD_META[sectionId]?.[cardId]) return layout
      return updateCards(layout, sectionId, (cards) => {
        const index = cards.findIndex((card) => card.id === cardId)
        if (index < 0) return null
        if (cards[index].visible !== false && index === cards.length - 1) return null
        const [row] = cards.splice(index, 1)
        cards.push({ ...row, visible: true })
        return cards
      })
    }

    /**
     * 在同一板块内移动卡片：fromVisibleIdx / toVisibleIdx 都是「可见卡片序列」的下标，
     * toVisibleIdx 是插入位置（0..visibleCount）。隐藏卡片的相对位置尽量保持不动。
     */
    function moveCard(layout, sectionId, fromVisibleIdx, toVisibleIdx) {
      if (!CARD_META[sectionId]) return layout
      return updateCards(layout, sectionId, (cards) => {
        const visible = cards.filter((card) => card.visible !== false)
        if (!Number.isFinite(fromVisibleIdx) || fromVisibleIdx < 0 || fromVisibleIdx >= visible.length) {
          return null
        }
        if (!Number.isFinite(toVisibleIdx)) return null
        let target = Math.max(0, Math.min(toVisibleIdx, visible.length))
        if (fromVisibleIdx < target) target -= 1
        if (target === fromVisibleIdx) return null
        const fromId = visible[fromVisibleIdx].id
        const anchorId = toVisibleIdx < visible.length ? visible[toVisibleIdx].id : null
        const fromIndex = cards.findIndex((card) => card.id === fromId)
        const anchorIndex = anchorId ? cards.findIndex((card) => card.id === anchorId) : cards.length
        const [row] = cards.splice(fromIndex, 1)
        cards.splice(fromIndex < anchorIndex ? anchorIndex - 1 : anchorIndex, 0, row)
        return cards
      })
    }

    /** 编辑态内容锁：卡片工具（⠿ / ×）必须放行，其余点击一律拦掉 */
    function lockSlotContent(e) {
      const target = e.target
      if (target && typeof target.closest === 'function'
        && (target.closest('.gp-card-tools') || target.closest('.gp-card-add'))) return
      e.preventDefault()
      e.stopPropagation()
    }

