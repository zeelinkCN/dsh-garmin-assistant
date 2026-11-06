    /* ---------------------------------------------------------------- *
     * 小组件
     * ---------------------------------------------------------------- */
    function Row({ lab, val, pct, color }) {
      return h('div', { className: 'gp-row' },
        h('span', { className: 'lab' }, lab),
        h('span', { className: 'val' }, val),
        h('div', { className: 'gp-bar' },
          h('i', { style: { width: `${clampPct(pct)}%`, background: color || 'var(--gp-blue)' } })))
    }

    function Spark({ points, color }) {
      const max = Math.max(1, ...points)
      const min = Math.min(...points)
      const span = Math.max(1e-6, max - min)
      const W = 56, H = 24
      const pts = points
        .map((v, i) => `${(i / Math.max(1, points.length - 1)) * W},${H - ((v - min) / span) * (H - 4) - 2}`)
        .join(' ')
      return h('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: { display: 'block' } },
        h('polyline', { points: pts, fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' }))
    }

    function StepsRing({ value, goal }) {
      const pct = goal ? clampPct((value / goal) * 100) : 0
      const R = 33, C = 2 * Math.PI * R
      return h('svg', { width: 88, height: 88, viewBox: '0 0 88 88' },
        h('circle', { cx: 44, cy: 44, r: R, fill: 'none', stroke: 'var(--gp-card2)', strokeWidth: 7 }),
        h('circle', {
          cx: 44, cy: 44, r: R, fill: 'none', stroke: 'var(--gp-green)', strokeWidth: 7,
          strokeLinecap: 'round', strokeDasharray: C, strokeDashoffset: C * (1 - pct / 100),
          transform: 'rotate(-90 44 44)',
        }),
        h('text', { x: 44, y: 42, textAnchor: 'middle', fontSize: 14, fontWeight: 700, fill: 'var(--gp-t1)' }, fmt(value)),
        h('text', { x: 44, y: 55, textAnchor: 'middle', fontSize: 8.5, fill: 'var(--gp-t3)' }, `/ ${fmt(goal)} 步`))
    }

    function SleepChart({ data }) {
      if (!data || !data.nights || !data.nights.length) {
        return h('div', { className: 'gp-empty' }, h('b', null, '最近没有睡眠记录'), ' — Garmin 未同步到睡眠数据')
      }
      const nights = data.nights
      const W = 940, H = 170, padL = 26, padB = 36, padT = 10
      const bw = (W - padL - 6) / nights.length
      const maxH = 9
      const y = (v) => padT + (H - padT - padB) * (1 - v / maxH)
      const bars = nights.map((n, i) => {
        const total = (n.deep || 0) + (n.light || 0) + (n.rem || 0) + (n.awakeSec || 0) / 36
        if (!total) return null
        const scale = (H - padT - padB) / Math.max(total, 1)
        const x = padL + i * bw + bw * 0.22
        const w = bw * 0.56
        let top = H - padB
        const segs = [
          ['var(--gp-green)', (n.deep || 0) * scale],
          ['var(--gp-blue)', (n.light || 0) * scale],
          ['var(--gp-violet)', (n.rem || 0) * scale],
          ['var(--gp-t3)', ((n.awakeSec || 0) / 3600) * scale],
        ]
        return h('g', { key: n.date },
          ...segs.map(([c, hh], k) => {
            if (!hh) return null
            top -= hh
            return h('rect', { key: k, x, y: top, width: w, height: Math.max(1, hh), fill: c, rx: 1.5 })
          }),
          h('text', { x: x + w / 2, y: H - 20, textAnchor: 'middle', fontSize: 9, fill: 'var(--gp-t3)' }, n.date.slice(5)),
          h('text', { x: x + w / 2, y: H - 9, textAnchor: 'middle', fontSize: 9, fill: 'var(--gp-t3)' },
            typeof n.hours === 'number' ? `${n.hours.toFixed(1)}h` : ''),
          typeof n.score === 'number'
            ? h('text', { x: x + w / 2, y: y(n.hours || 0) - 6, textAnchor: 'middle', fontSize: 9, fill: 'var(--gp-green)' }, n.score)
            : null)
      })
      const scoreLine = nights
        .map((n, i) => (typeof n.hours === 'number'
          ? `${padL + i * bw + bw / 2},${y(n.hours)}`
          : null))
        .filter(Boolean)
        .join(' ')
      return h('div', null,
        h('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, preserveAspectRatio: 'none' },
          [0, 3, 6, 9].map((v) => h('g', { key: v },
            h('line', { x1: padL, x2: W - 6, y1: y(v), y2: y(v), stroke: 'var(--gp-line2)' }),
            h('text', { x: 2, y: y(v) + 3, fontSize: 9, fill: 'var(--gp-t3)' }, `${v}h`))),
          scoreLine ? h('polyline', { points: scoreLine, fill: 'none', stroke: 'var(--gp-green)', strokeWidth: 1.4, strokeDasharray: '4 3' }) : null,
          bars),
        h('div', { className: 'gp-mini', style: { display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' } },
          h('span', null, '■ 深睡'), h('span', { style: { color: 'var(--gp-t3)' } }, '■ 浅睡'),
          h('span', { style: { color: 'var(--gp-violet)' } }, '■ REM'),
          h('span', null,
            `均分 ${fmt(data.avgScore)} · 均时长 ${data.avgHours ?? '—'}h`)))
    }

    function LoadChart({ data }) {
      if (!data || !data.series || !data.series.length) {
        return h('div', { className: 'gp-empty' }, h('b', null, '没有训练负荷数据'))
      }
      const series = data.series
      const W = 940, H = 180, padL = 30, padB = 26, padT = 10
      const maxV = Math.max(100, ...series.map((d) => Math.max(d.atl || 0, d.ctl || 0)))
      const x = (i) => padL + (i / Math.max(1, series.length - 1)) * (W - padL - 8)
      const y = (v) => padT + (H - padT - padB) * (1 - (v || 0) / maxV)
      const line = (key) => series.map((d, i) => `${x(i)},${y(d[key])}`).join(' ')
      return h('div', null,
        h('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, preserveAspectRatio: 'none' },
          [0, 0.5, 1].map((f) => h('g', { key: f },
            h('line', { x1: padL, x2: W - 8, y1: y(maxV * f), y2: y(maxV * f), stroke: 'var(--gp-line2)' }),
            h('text', { x: 2, y: y(maxV * f) + 3, fontSize: 9, fill: 'var(--gp-t3)' }, Math.round(maxV * f)))),
          h('polyline', { points: line('ctl'), fill: 'none', stroke: 'var(--gp-violet)', strokeWidth: 2 }),
          h('polyline', { points: line('atl'), fill: 'none', stroke: 'var(--gp-blue)', strokeWidth: 2 }),
          h('text', { x: padL, y: H - 6, fontSize: 9, fill: 'var(--gp-t3)' }, series[0].date.slice(5)),
          h('text', { x: W - 8, y: H - 6, fontSize: 9, fill: 'var(--gp-t3)', textAnchor: 'end' },
            series[series.length - 1].date.slice(5))),
        h('div', { className: 'gp-mini', style: { display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' } },
          h('span', { style: { color: 'var(--gp-blue)' } },
            `● ATL ${fmt(data.current?.atl)}`),
          h('span', { style: { color: 'var(--gp-violet)' } },
            `● CTL ${fmt(data.current?.ctl)}`),
          h('span', { style: { color: 'var(--gp-red)' } },
            `● TSB ${fmt(data.current?.tsb)}`),
          h('span', { style: { marginLeft: 'auto' } },
            `ACWR ${fmt(data.current?.acwr, 1)} ${data.current?.acwrStatus || ''}`)))
    }

    /* ---------------------------------------------------------------- *
     * 今日状态：5 张图形化 KPI
     * 图形主导、数字补充；全部内联 SVG，颜色取自 --gp-* token
     * ---------------------------------------------------------------- */
    const scoreColor = (v) =>
      (v >= 70 ? 'var(--gp-green)' : v >= 40 ? 'var(--gp-amber)' : 'var(--gp-red)')

    /** 极坐标 → SVG 坐标（0° 在右，顺时针，与 SVG 的 y 轴向下一致） */
    function polar(cx, cy, r, deg) {
      const a = (deg * Math.PI) / 180
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
    }

    /** 从 fromDeg 顺时针画到 toDeg 的圆弧路径 */
    function arcPath(cx, cy, r, fromDeg, toDeg) {
      const [x0, y0] = polar(cx, cy, r, fromDeg)
      const [x1, y1] = polar(cx, cy, r, toDeg)
      const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0
      return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
    }

    /** 训练准备度：270° 弧形仪表（轨道 + 分值弧 + 中心分数 + 等级） */
    function ReadinessGauge({ score, level }) {
      const n = numOf(score)
      const has = n !== null
      const value = has ? clampPct(n) : 0
      const color = has ? scoreColor(value) : 'var(--gp-t3)'
      const cx = 50
      const cy = 52
      const r = 38
      const START = 135
      const SWEEP = 270
      const ticks = [0, 25, 50, 75, 100].map((t) => {
        const deg = START + (SWEEP * t) / 100
        const [x1, y1] = polar(cx, cy, r + 7, deg)
        const [x2, y2] = polar(cx, cy, r + 11, deg)
        return h('line', {
          key: `t${t}`, x1, y1, x2, y2,
          stroke: 'var(--gp-line)', strokeWidth: 1.4, strokeLinecap: 'round',
        })
      })
      return h('svg', {
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'xMidYMid meet',
        role: 'img',
        'aria-label': has ? `训练准备度 ${value} 分` : '训练准备度暂无数据',
        style: { height: 88, width: '100%' },
      },
        h('path', {
          d: arcPath(cx, cy, r, START, START + SWEEP),
          fill: 'none', stroke: 'var(--gp-card2)', strokeWidth: 9, strokeLinecap: 'round',
        }),
        has && value > 0
          ? h('path', {
              d: arcPath(cx, cy, r, START, START + (SWEEP * value) / 100),
              fill: 'none', stroke: color, strokeWidth: 9, strokeLinecap: 'round',
            })
          : null,
        ticks,
        h('text', {
          x: cx, y: cy + 8, textAnchor: 'middle', fontSize: 27, fontWeight: 700,
          fill: has ? 'var(--gp-t1)' : 'var(--gp-t3)',
          style: { fontVariantNumeric: 'tabular-nums' },
        }, has ? fmt(value) : '—'),
        h('text', {
          x: cx, y: cy + 23, textAnchor: 'middle', fontSize: 10.5,
          fill: has ? color : 'var(--gp-t3)', letterSpacing: 0.3,
        }, has ? (LEVEL_ZH[level] || String(level || '')) : ''))
    }

    /** 睡眠评分：外圈评分环 + 内侧三段细弧（深睡 / REM / 其余） */
    function SleepDonut({ score, qualifier, deepPct, remPct }) {
      const n = numOf(score)
      const has = n !== null
      const pct = has ? clampPct(n) : 0
      const R = 40
      const C = 2 * Math.PI * R
      const deep = Math.min(100, Math.max(0, numOf(deepPct) ?? 0))
      const rem = Math.min(100 - deep, Math.max(0, numOf(remPct) ?? 0))
      const segs = []
      let cursor = -90
      const push = (share, color, key) => {
        const span = Math.min(Math.max(0, share), 100) * 3.6
        if (span <= 0.01) return
        segs.push(h('path', {
          key, d: arcPath(50, 50, 28, cursor, cursor + span),
          fill: 'none', stroke: color, strokeWidth: 3.4,
        }))
        cursor += span
      }
      push(deep, 'var(--gp-green)', 'deep')
      push(rem, 'var(--gp-violet)', 'rem')
      push(100 - deep - rem, 'color-mix(in srgb, var(--gp-t3) 42%, transparent)', 'rest')
      return h('svg', {
        viewBox: '0 0 100 100', preserveAspectRatio: 'xMidYMid meet', role: 'img',
        'aria-label': has
          ? `睡眠评分 ${pct} 分，深睡 ${fmt(deep)}%，REM ${fmt(rem)}%`
          : '睡眠评分暂无数据',
        style: { height: 78, width: '100%' },
      },
        h('title', null, '外圈：睡眠评分（0-100）；内圈：深睡 / REM / 其余 占比'),
        h('circle', { cx: 50, cy: 50, r: R, fill: 'none', stroke: 'var(--gp-card2)', strokeWidth: 7 }),
        has && pct > 0
          ? h('circle', {
              cx: 50, cy: 50, r: R, fill: 'none', stroke: scoreColor(pct), strokeWidth: 7,
              strokeLinecap: 'round', strokeDasharray: C, strokeDashoffset: C * (1 - pct / 100),
              transform: 'rotate(-90 50 50)',
            })
          : null,
        segs,
        h('text', {
          x: 50, y: 50, textAnchor: 'middle', dominantBaseline: 'middle',
          fontSize: 21, fontWeight: 700, fill: has ? 'var(--gp-t1)' : 'var(--gp-t3)',
          style: { fontVariantNumeric: 'tabular-nums' },
        }, has ? fmt(pct) : '—'),
        h('text', {
          x: 50, y: 65, textAnchor: 'middle', fontSize: 9,
          fill: has ? scoreColor(pct) : 'var(--gp-t3)',
        }, has ? (LEVEL_ZH[qualifier] || String(qualifier || '')) : ''))
    }

    /** Body Battery：电池外形，填充宽度 = 当前电量；旁边是充 / 耗数字 */
    function BatteryGauge({ current, charged, drained, height = 62 }) {
      const v = numOf(current)
      const has = v !== null
      const pct = has ? clampPct(v) : 0
      const color = has
        ? (v >= 60 ? 'var(--gp-green)' : v >= 30 ? 'var(--gp-amber)' : 'var(--gp-red)')
        : 'var(--gp-t3)'
      const innerX = 10.5
      const innerY = 18.5
      const innerW = 103
      const innerH = 35
      const charge = numOf(charged)
      const drain = numOf(drained)
      return h(React.Fragment, null,
        h('svg', {
          viewBox: '0 0 140 72', preserveAspectRatio: 'xMidYMid meet', role: 'img',
          'aria-label': has ? `Body Battery ${pct} / 100` : 'Body Battery 暂无数据',
          style: { height, width: '100%', minWidth: 0, flex: '1 1 auto' },
        },
          h('rect', {
            x: 6, y: 14, width: 112, height: 44, rx: 10,
            fill: 'none', stroke: 'var(--gp-line)', strokeWidth: 1.6,
          }),
          h('rect', { x: 119.5, y: 28, width: 6, height: 16, rx: 2.5, fill: 'var(--gp-line)' }),
          has && pct > 0
            ? h('rect', {
                x: innerX, y: innerY, width: (innerW * pct) / 100, height: innerH,
                rx: 6, fill: color, opacity: 0.9,
              })
            : null,
          [0, 25, 50, 75, 100].map((t) => h('line', {
            key: `t${t}`,
            x1: innerX + (innerW * t) / 100, x2: innerX + (innerW * t) / 100,
            y1: 61.5, y2: 65.5,
            stroke: 'var(--gp-line)', strokeWidth: 1.2, strokeLinecap: 'round',
          })),
          h('text', {
            x: 62, y: 41, textAnchor: 'middle', dominantBaseline: 'middle',
            fontSize: 16, fontWeight: 700, fill: has ? 'var(--gp-t1)' : 'var(--gp-t3)',
            style: { fontVariantNumeric: 'tabular-nums' },
          }, has ? fmt(pct) : '—')),
        h('div', { className: 'bat-side' },
          charge !== null ? h('span', { className: 'up' }, `充 +${fmt(charge)}`) : null,
          drain !== null ? h('span', { className: 'dn' }, `耗 −${fmt(drain)}`) : null))
    }

    /** 静息心率相对 7 日均值的变化：更低更好，等值显示持平 */
    function rhrDelta(value, avg7) {
      const now = numOf(value)
      const avg = numOf(avg7)
      if (now === null || avg === null) return null
      const diff = now - avg
      if (!diff) return h('span', { className: 'delta flat' }, '持平')
      const good = diff < 0
      return h('span', { className: `delta ${good ? 'good' : 'bad'}` },
        `${good ? '↓' : '↑'}${fmt(Math.abs(diff))}`)
    }

    /** 静息心率：近 8 天迷你折线 + 今天高亮 + 7 日均基准线 */
    function RhrTrend({ value, avg7, series }) {
      const now = numOf(value)
      const avg = numOf(avg7)
      const pts = (Array.isArray(series) ? series : [])
        .map((row) => ({ v: numOf(row?.value) }))
        .filter((row) => row.v !== null)
      const W = 190
      const H = 46
      const PAD = 7
      if (!pts.length) {
        return h('svg', {
          viewBox: `0 0 ${W} ${H}`, 'aria-hidden': true,
          style: { height: H, width: '100%' },
        }, h('line', {
          x1: PAD, x2: W - PAD, y1: H / 2, y2: H / 2,
          stroke: 'var(--gp-line2)', strokeDasharray: '3 3',
        }))
      }
      const values = pts.map((row) => row.v)
      const lo = Math.min(...values, avg ?? Infinity) - 1.5
      const hi = Math.max(...values, avg ?? -Infinity) + 1.5
      const span = Math.max(1, hi - lo)
      const px = (i) => PAD + (i / Math.max(1, pts.length - 1)) * (W - PAD * 2)
      const py = (v) => PAD + (1 - (v - lo) / span) * (H - PAD * 2)
      const color = now === null || avg === null
        ? 'var(--gp-blue)'
        : now <= avg ? 'var(--gp-green)' : now <= avg + 3 ? 'var(--gp-amber)' : 'var(--gp-red)'
      const last = pts[pts.length - 1]
      return h('svg', {
        viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', role: 'img',
        'aria-label': `近 ${pts.length} 天静息心率趋势：今天 ${fmt(now)} bpm，7 日均值 ${fmt(avg)}`,
        style: { height: H, width: '100%', overflow: 'visible' },
      },
        h('title', null, '折线：近 8 天静息心率；虚线：7 日均值；高亮圆点：今天'),
        avg !== null
          ? h('line', {
              x1: PAD, x2: W - PAD, y1: py(avg), y2: py(avg),
              stroke: 'var(--gp-line)', strokeDasharray: '3 3',
            })
          : null,
        h('polyline', {
          points: pts.map((row, i) => `${px(i)},${py(row.v)}`).join(' '),
          fill: 'none', stroke: color, strokeWidth: 1.8,
          strokeLinejoin: 'round', strokeLinecap: 'round',
        }),
        h('circle', { cx: px(pts.length - 1), cy: py(last.v), r: 6.5, fill: color, opacity: 0.16 }),
        h('circle', { cx: px(pts.length - 1), cy: py(last.v), r: 3.2, fill: color }))
    }

    /** 本周强度分钟：朝 150 分钟目标推进的圆环 */
    function IntensityRing({ total, goal }) {
      const n = numOf(total)
      const has = n !== null
      const g = numOf(goal) || 150
      const pct = clampPct(((n ?? 0) / g) * 100)
      const R = 40
      const C = 2 * Math.PI * R
      const color = pct >= 100 ? 'var(--gp-green)' : 'var(--gp-amber)'
      return h('svg', {
        viewBox: '0 0 100 100', preserveAspectRatio: 'xMidYMid meet', role: 'img',
        'aria-label': has ? `本周强度分钟 ${fmt(n)} / ${fmt(g)}` : '本周强度分钟暂无数据',
        style: { height: 78, width: '100%' },
      },
        h('circle', { cx: 50, cy: 50, r: R, fill: 'none', stroke: 'var(--gp-card2)', strokeWidth: 8 }),
        has && pct > 0
          ? h('circle', {
              cx: 50, cy: 50, r: R, fill: 'none', stroke: color, strokeWidth: 8,
              strokeLinecap: 'round', strokeDasharray: C, strokeDashoffset: C * (1 - pct / 100),
              transform: 'rotate(-90 50 50)',
            })
          : null,
        h('text', {
          x: 50, y: 50, textAnchor: 'middle', dominantBaseline: 'middle',
          fontSize: 22, fontWeight: 700, fill: has ? 'var(--gp-t1)' : 'var(--gp-t3)',
          style: { fontVariantNumeric: 'tabular-nums' },
        }, has ? fmt(n) : '—'),
        h('text', {
          x: 50, y: 64, textAnchor: 'middle', fontSize: 8.5, fill: 'var(--gp-t3)',
        }, `/ ${fmt(g)} 分钟`))
    }

    /* ---------------------------------------------------------------- *
     * 活动详情抽屉
     * 数据按需拉取；组件卸载即丢弃，不引入全局状态
     * ---------------------------------------------------------------- */
    const SPORT_ZH = {
      road_biking: '公路骑行', cycling: '骑行', mountain_biking: '山地骑行',
      gravel_cycling: '砾石骑行', indoor_cycling: '室内骑行', virtual_ride: '虚拟骑行',
      running: '跑步', trail_running: '越野跑', treadmill_running: '跑步机', track_running: '场地跑',
      walking: '步行', hiking: '徒步', lap_swimming: '泳池游泳', open_water_swimming: '公开水域游泳',
      strength_training: '力量训练', yoga: '瑜伽', pilates: '普拉提', meditation: '冥想',
      rowing: '划船', kayaking: '皮划艇', canoeing: '独木舟', paddleboarding: '桨板',
      skiing: '滑雪', snowboarding: '单板滑雪', golf: '高尔夫',
    }
    const ZONE_COLORS = ['var(--gp-green)', 'var(--gp-blue)', 'var(--gp-violet)', 'var(--gp-amber)', 'var(--gp-red)']

    const zoneTime = (sec) => {
      if (typeof sec !== 'number' || !isFinite(sec)) return '—'
      const total = Math.max(0, Math.round(sec))
      const hh = Math.floor(total / 3600)
      const mm = Math.floor((total % 3600) / 60)
      const ss = total % 60
      return hh
        ? `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
        : `${mm}:${String(ss).padStart(2, '0')}`
    }
    const paceText = (mps) => {
      if (typeof mps !== 'number' || !isFinite(mps) || mps <= 0.2) return null
      const total = Math.round(1000 / mps)
      return `${Math.floor(total / 60)}'${String(total % 60).padStart(2, '0')}"/km`
    }
    const speedText = (mps) =>
      typeof mps === 'number' && isFinite(mps) ? `${fmt(mps * 3.6, 1)} km/h` : null
    const whenText = (value) => {
      const text = String(value ?? '')
      if (!text) return ''
      return text.replace('T', ' ').slice(0, 16)
    }

    /**
     * 活动轨迹地图：有底图时显示静态地图（后端把轨迹画在图上），
     * 加载中 / 不可用时退回原来的离线 SVG 轨迹。
     * basemap 由 ActivityDrawer 的 useStaticMap 提供；onZoom 打开 720px 浮层。
     */
    function TrackMap({ points, basemap = null, onZoom = null, wrapRef = null }) {
      const [failedUrl, setFailedUrl] = React.useState(null)
      const map = basemap && typeof basemap === 'object' ? basemap : null
      const url = map && map.url && map.url !== failedUrl ? map.url : null
      if (!Array.isArray(points) || points.length < 2) return null
      const W = 560
      const H = 220
      const PAD = 12
      const lats = points.map((p) => p[0])
      const lons = points.map((p) => p[1])
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLon = Math.min(...lons)
      const maxLon = Math.max(...lons)
      const midLat = (minLat + maxLat) / 2
      // 经度按中纬度余弦压缩，避免高纬度轨迹被拉宽
      const kx = Math.max(1e-6, Math.cos((midLat * Math.PI) / 180))
      const spanX = Math.max(1e-9, (maxLon - minLon) * kx)
      const spanY = Math.max(1e-9, maxLat - minLat)
      const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY)
      const padX = (W - spanX * scale) / 2
      const padY = (H - spanY * scale) / 2
      const px = (lon) => padX + (lon - minLon) * kx * scale
      const py = (lat) => H - padY - (lat - minLat) * scale // Y 翻转：北上
      const pts = points
        .map((p) => `${px(p[1]).toFixed(1)},${py(p[0]).toFixed(1)}`)
        .join(' ')
      return h('div', { className: 'gp-detail-mapwrap', 'data-gp-map-wrap': '1', ref: wrapRef || undefined },
        url
          ? h('img', {
              className: 'gp-detail-map gp-detail-map-img',
              src: url,
              alt: '活动轨迹地图',
              draggable: false,
              'data-gp-basemap': '1',
              onError: () => setFailedUrl(url),
            })
          : h('svg', {
              className: 'gp-detail-map',
              viewBox: `0 0 ${W} ${H}`,
              preserveAspectRatio: 'xMidYMid meet',
              role: 'img',
              'aria-label': '离线轨迹（无底图）',
            }, h('polyline', {
              points: pts,
              fill: 'none',
              stroke: 'var(--gp-green)',
              strokeWidth: 2,
              strokeLinejoin: 'round',
              strokeLinecap: 'round',
            })),
        url && onZoom
          ? h('button', {
              type: 'button',
              className: 'gp-map-zoom',
              title: '放大地图',
              'data-gp-map-zoom': '1',
              onClick: () => onZoom(url),
            }, '放大')
          : null,
        url
          ? h('a', {
              className: 'gp-map-attr',
              href: 'https://www.amap.com/',
              target: '_blank',
              rel: 'noreferrer noopener',
              title: '高德地图',
              'data-gp-map-attribution': '1',
              onClick: (event) => event.stopPropagation(),
            }, '高德地图')
          : null)
    }

    /** 海拔序列归一化：[{d,e}] / [e…] / [{distanceM,elevationM}]；d 单位米 */
    function elevRowsOf(rows, totalDistanceM = null) {
      const list = Array.isArray(rows) ? rows : []
      const out = []
      list.forEach((row, index) => {
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
      const span = Math.max(1, out.length - 1)
      const total = numOf(totalDistanceM)
      const fallback = total !== null && total > 0 ? total : span
      return out.map((r) => ({
        d: allD ? r.d : (r.i / span) * fallback,
        e: r.e,
      }))
    }

    /** 大剖面降采样（只影响绘制/悬停，统计仍用原始序列） */
    function elevSample(rows, max = 320) {
      if (rows.length <= max) return rows
      const step = rows.length / max
      const out = []
      for (let i = 0; i < max; i++) out.push(rows[Math.floor(i * step)])
      out.push(rows[rows.length - 1])
      return out
    }

    /**
     * 海拔剖面（TrackPreview / ActivityDrawer 共用）：
     * 面积 + 折线 + 左侧海拔轴（m）+ 底部距离轴（km）+ 爬升 / 最大坡度，
     * 鼠标或触摸悬停显示十字线与「12.4 km · 356 m」提示。
     * `rows` 支持 [{d,e}] / [e…] / [{distanceM,elevationM}]。
     */
    function ElevationProfile({
      rows,
      distanceM = null,
      height = 64,
      showStats = true,
      className = '',
      label = '海拔剖面',
    }) {
      const data = React.useMemo(() => elevRowsOf(rows, distanceM), [rows, distanceM])
      const [hover, setHover] = React.useState(null)
      const plotRef = React.useRef(null)
      const W = 240
      const H = 64
      const PAD = 3
      if (data.length < 2) return null
      const maxD = Math.max(1e-9, ...data.map((r) => r.d))
      const minE = Math.min(...data.map((r) => r.e))
      const maxE = Math.max(...data.map((r) => r.e))
      const spanE = Math.max(1e-6, maxE - minE)
      const px = (d) => PAD + (Math.max(0, Math.min(maxD, d)) / maxD) * (W - PAD * 2)
      const py = (e) => H - PAD - ((e - minE) / spanE) * (H - PAD * 2)

      let gain = 0
      let slope = null
      for (let i = 1; i < data.length; i++) {
        const dDelta = data[i].d - data[i - 1].d
        const eDelta = data[i].e - data[i - 1].e
        if (eDelta > 0) gain += eDelta
        if (dDelta >= 20 && eDelta > 0) {
          const pct = (eDelta / dDelta) * 100
          if (slope === null || pct > slope) slope = pct
        }
      }
      gain = Math.round(gain)
      const slopeRounded = slope === null ? null : Math.round(slope * 10) / 10

      const draw = elevSample(data)
      const pts = draw.map((r) => [px(r.d), py(r.e)])
      let line = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
      for (let i = 1; i < pts.length; i++) {
        line += `L${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`
      }
      const area = `${line}L${(W - PAD).toFixed(1)} ${(H - PAD).toFixed(1)}L${PAD.toFixed(1)} ${(H - PAD).toFixed(1)}Z`
      const totalText = maxD >= 1000 ? `${fmt(maxD / 1000, 1)} km` : `${Math.round(maxD)} m`
      const minText = `${Math.round(minE)} m`
      const maxText = `${Math.round(maxE)} m`
      const tipText = hover
        ? `${fmt(hover.d / 1000, 1)} km · ${Math.round(hover.e)} m`
        : ''
      const summary = `${label}：0–${totalText}，海拔 ${Math.round(minE)}–${Math.round(maxE)} m，累计爬升 ${gain} m${slopeRounded === null ? '' : `，最大坡度 ${slopeRounded}%`}`

      const locate = (event) => {
        const rect = plotRef.current && plotRef.current.getBoundingClientRect
          ? plotRef.current.getBoundingClientRect()
          : null
        if (!rect || !(rect.width > 0)) return null
        const frac = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
        const target = frac * maxD
        let best = draw[0]
        let delta = Math.abs(best.d - target)
        for (let i = 1; i < draw.length; i++) {
          const next = Math.abs(draw[i].d - target)
          if (next < delta) { best = draw[i]; delta = next }
        }
        return { d: best.d, e: best.e }
      }
      const onMove = (event) => {
        const point = locate(event)
        if (point) setHover(point)
      }
      const clearHover = () => setHover(null)

      return h('div', {
        className: `gp-elev${className ? ` ${className}` : ''}`,
        'data-gp-elev-chart': '1',
        'data-gp-elev-hover': hover ? `${Math.round(hover.d)},${Math.round(hover.e)}` : undefined,
      },
        h('div', { className: 'gp-elev-main' },
          h('div', { className: 'gp-elev-yaxis', 'aria-hidden': true },
            h('span', { className: 'gp-elev-y', 'data-gp-elev-y': 'max' }, maxText),
            h('span', { className: 'gp-elev-y', 'data-gp-elev-y': 'min' }, minText)),
          h('div', {
            className: 'gp-elev-plot',
            ref: plotRef,
            onPointerMove: onMove,
            onPointerDown: onMove,
            onPointerLeave: clearHover,
            onPointerCancel: clearHover,
            'data-gp-elev-plot': '1',
          },
            h('svg', {
              viewBox: `0 0 ${W} ${H}`,
              preserveAspectRatio: 'none',
              style: { display: 'block', width: '100%', height: `${height}px` },
              'data-gp-elev-svg': '1',
              role: 'img',
              'aria-label': summary,
            },
              h('title', null, summary),
              h('path', { d: area, fill: 'color-mix(in srgb, var(--gp-blue) 24%, transparent)' }),
              h('path', { d: line, fill: 'none', stroke: 'var(--gp-blue)', strokeWidth: 1.4 }),
              hover
                ? h('line', {
                    x1: px(hover.d).toFixed(1), y1: 0,
                    x2: px(hover.d).toFixed(1), y2: H,
                    stroke: 'var(--gp-t3)', strokeWidth: 1,
                    strokeDasharray: '2 2', vectorEffect: 'non-scaling-stroke',
                    'data-gp-elev-crosshair': '1',
                  })
                : null,
              hover
                ? h('circle', {
                    cx: px(hover.d).toFixed(1),
                    cy: py(hover.e).toFixed(1),
                    r: 2.4,
                    fill: 'var(--gp-blue)',
                    stroke: 'var(--gp-card)',
                    strokeWidth: 1,
                  })
                : null),
            hover
              ? h('div', {
                  className: 'gp-elev-tip',
                  style: { left: `${Math.max(10, Math.min(90, (px(hover.d) / W) * 100))}%` },
                  'data-gp-elev-tip': '1',
                }, tipText)
              : null)),
        h('div', { className: 'gp-elev-xaxis', 'aria-hidden': true },
          h('span', { 'data-gp-elev-x': '0' }, '0'),
          h('span', { 'data-gp-elev-x': 'total' }, totalText)),
        showStats
          ? h('div', { className: 'gp-elev-stats', 'data-gp-elev-stats': '1' },
              h('span', null, '爬升 ', h('b', null, `${gain} m`)),
              slopeRounded === null
                ? null
                : h('span', { 'data-gp-elev-slope': '1' }, '最大坡度 ', h('b', null, `${slopeRounded}%`)))
          : null)
    }

    function ElevationChart({ rows }) {
      return h(ElevationProfile, {
        rows,
        height: 80,
        className: 'gp-detail-elev',
        label: '活动海拔',
      })
    }

    function ZoneBars({ zones, unit }) {
      const max = Math.max(1, ...zones.map((z) => z.seconds))
      return h('div', { className: 'gp-detail-zones' }, zones.map((z) => h('div', {
        key: z.zone,
        className: 'gp-detail-zone',
      },
        h('span', { className: 'z' }, `Z${z.zone}`),
        h('div', { className: 'bar' },
          h('i', {
            style: {
              width: `${clampPct((z.seconds / max) * 100)}%`,
              background: ZONE_COLORS[(z.zone - 1) % ZONE_COLORS.length],
            },
          })),
        h('span', { className: 't' }, zoneTime(z.seconds)),
        h('span', { className: 'r' },
          z.low != null
            ? `${fmt(z.low, 0)}${z.high != null ? `–${fmt(z.high, 0)}` : '+'} ${unit}`
            : ''))))
    }

    /* ---------------------------------------------------------------- *
     * FIT 曲线：点击后才解析（慢），通道叠加、各自归一化后共用时间轴
     * ---------------------------------------------------------------- */
    const FIT_CHANNELS = [
      { key: 'hr', label: '心率', color: 'var(--gp-red)', value: (s) => numOf(s?.hr, s?.heart_rate, s?.heartRate) },
      { key: 'power', label: '功率', color: 'var(--gp-violet)', value: (s) => numOf(s?.power, s?.watts) },
      { key: 'cadence', label: '踏频', color: 'var(--gp-amber)', value: (s) => numOf(s?.cadence, s?.cad) },
      { key: 'speed', label: '速度', color: 'var(--gp-blue)', value: (s) => numOf(s?.speed, s?.velocity) },
      { key: 'alt', label: '海拔', color: 'var(--gp-green)', value: (s) => numOf(s?.alt, s?.altitude, s?.elevation) },
      { key: 'temp', label: '温度', color: '#e8734a', value: (s) => numOf(s?.temp, s?.temperature) },
    ]
    const FIT_CHANNEL_ALIASES = {
      hr: 'hr', heart_rate: 'hr', heartrate: 'hr', heart: 'hr', 心率: 'hr',
      power: 'power', watts: 'power', 功率: 'power',
      cadence: 'cadence', cad: 'cadence', 踏频: 'cadence', 步频: 'cadence',
      speed: 'speed', velocity: 'speed', 速度: 'speed',
      alt: 'alt', altitude: 'alt', elevation: 'alt', 海拔: 'alt',
      temp: 'temp', temperature: 'temp', 温度: 'temp',
    }
    const fitChannelKeyOf = (raw) => {
      const name = String(firstOf(raw?.key, raw?.name, raw?.channel, raw) ?? '').trim().toLowerCase()
      return FIT_CHANNEL_ALIASES[name] || null
    }
    const fitChannelDef = (key) => FIT_CHANNELS.find((row) => row.key === key) || null

    /** 可用通道 = 后端 channels ∩ 该通道确有数值；完全没有声明时按数据推断 */
    function fitChannelsOf(payload, samples) {
      const declared = Array.isArray(payload?.channels) ? payload.channels : []
      const keys = []
      for (const raw of declared) {
        const key = fitChannelKeyOf(raw)
        if (key && !keys.includes(key)) keys.push(key)
      }
      const candidates = keys.length ? keys : FIT_CHANNELS.map((row) => row.key)
      return candidates.filter((key) => {
        const def = fitChannelDef(key)
        return !!def && samples.some((row) => def.value(row) !== null)
      })
    }

    /** 原始样本可能上万条：等距抽稀到 ≤ max，最后一点必留 */
    function fitDownsample(samples, max = 240) {
      const rows = Array.isArray(samples) ? samples.filter((row) => row && typeof row === 'object') : []
      if (rows.length <= max) return rows
      const step = rows.length / max
      const out = []
      for (let i = 0; i < max; i++) out.push(rows[Math.floor(i * step)])
      out.push(rows[rows.length - 1])
      return out
    }

    function fitTimeText(sample) {
      const direct = firstOf(sample?.t, sample?.time)
      if (typeof direct === 'string' && direct) return direct.replace('T', ' ').slice(-8)
      const sec = numOf(direct, sample?.elapsed, sample?.seconds)
      if (sec === null) return ''
      const total = Math.max(0, Math.round(sec))
      const hh = Math.floor(total / 3600)
      const mm = Math.floor((total % 3600) / 60)
      const ss = total % 60
      return hh ? `${hh}:${pad2(mm)}:${pad2(ss)}` : `${mm}:${pad2(ss)}`
    }

    /** 多通道折线：每条线按自身 min–max 归一化，X 为样本序号（= 时间） */
    function FitChart({ samples, active }) {
      const W = 560
      const H = 160
      const PADX = 6
      const PADY = 8
      const rows = Array.isArray(samples) ? samples : []
      const n = rows.length
      const x = (i) => (n <= 1 ? W / 2 : PADX + (i / (n - 1)) * (W - PADX * 2))
      const defs = (Array.isArray(active) ? active : [])
        .map(fitChannelDef)
        .filter(Boolean)
      const series = defs.map((def) => {
        const values = rows.map((row) => def.value(row))
        const finite = values.filter((v) => v !== null)
        if (!finite.length) return { def, values: null }
        let lo = Math.min(...finite)
        let hi = Math.max(...finite)
        if (hi <= lo) { hi = lo + 1; lo -= 1 }
        const y = (v) => PADY + (1 - (v - lo) / (hi - lo)) * (H - PADY * 2)
        const segments = []
        let current = []
        values.forEach((v, i) => {
          if (v === null) {
            if (current.length) segments.push(current)
            current = []
            return
          }
          current.push([x(i), y(v)])
        })
        if (current.length) segments.push(current)
        return {
          def,
          min: Math.min(...finite),
          max: Math.max(...finite),
          segments,
        }
      }).filter((row) => row.segments && row.segments.length)

      return h(React.Fragment, null,
        h('svg', {
          className: 'gp-fit-chart',
          viewBox: `0 0 ${W} ${H}`,
          preserveAspectRatio: 'none',
          role: 'img',
          'data-gp-fit-chart': '1',
          'data-gp-fit-series-count': String(series.length),
          'aria-label': `FIT 曲线：${defs.map((def) => def.label).join(' / ') || '未选择通道'}`,
        },
          h('line', {
            x1: PADX, x2: W - PADX, y1: PADY, y2: PADY,
            stroke: 'var(--gp-line2)',
          }),
          h('line', {
            x1: PADX, x2: W - PADX, y1: H - PADY, y2: H - PADY,
            stroke: 'var(--gp-line2)',
          }),
          series.map((row) => row.segments.map((seg, i) => h('polyline', {
            key: `${row.def.key}-${i}`,
            'data-gp-fit-series': row.def.key,
            points: seg.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' '),
            fill: 'none',
            stroke: row.def.color,
            strokeWidth: 1.6,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          })))),
        h('div', { className: 'gp-fit-legend' },
          series.map((row) => h('span', { key: row.def.key },
            h('i', { style: { background: row.def.color } }),
            `${row.def.label} ${fmt(row.min)}–${fmt(row.max)}`)),
          h('span', { style: { marginLeft: 'auto' } },
            `${fitTimeText(rows[0])} → ${fitTimeText(rows[n - 1])}`)))
    }

    /**
     * 抽屉里的「FIT 曲线」折叠块：默认收起，点「加载曲线」才解析，
     * 每次点击/重试都是一次独立请求，卸载时中断。
     */
    function FitCurves({ id, flow }) {
      const [open, setOpen] = React.useState(false)
      const [state, setState] = React.useState({ phase: 'idle' })
      const [active, setActive] = React.useState(null)
      const abortRef = React.useRef(null)
      const aliveRef = React.useRef(true)

      React.useEffect(() => () => {
        aliveRef.current = false
        try { abortRef.current?.abort() } catch { /* ignore */ }
      }, [])

      const load = React.useCallback(() => {
        if (abortRef.current) { try { abortRef.current.abort() } catch { /* ignore */ } }
        const controller = new AbortController()
        abortRef.current = controller
        setState({ phase: 'loading' })
        fetchJson(`activities/${encodeURIComponent(id)}/streams`, controller.signal)
          .then((data) => {
            if (!aliveRef.current || controller.signal.aborted) return
            if (data?.status === 'ok' && Array.isArray(data.samples) && data.samples.length) {
              const samples = fitDownsample(data.samples)
              const channels = fitChannelsOf(data, samples)
              const defaults = ['hr', 'alt'].filter((key) => channels.includes(key))
              const initial = defaults.length ? defaults : channels.slice(0, 1)
              setActive(initial)
              setState({ phase: 'ok', samples, channels, stats: data.stats || null })
            } else if (data?.status === 'advanced_required') {
              setState({ phase: 'advanced_required' })
            } else {
              setState({
                phase: 'unavailable',
                message: String(firstOf(data?.message, '这条活动没有可用的 FIT 曲线数据')),
              })
            }
          })
          .catch((err) => {
            if (!aliveRef.current || controller.signal.aborted) return
            if (err?.name === 'AbortError') return
            setState({
              phase: 'unavailable',
              message: `FIT 曲线加载失败：${String(err?.message ?? err)}`,
            })
          })
      }, [id])

      const toggleChannel = (key) => {
        setActive((prev) => {
          const list = Array.isArray(prev) ? prev : []
          if (list.includes(key)) {
            if (list.length === 1) return list
            return list.filter((item) => item !== key)
          }
          return FIT_CHANNELS.map((row) => row.key).filter((k) => list.includes(k) || k === key)
        })
      }

      let body = null
      if (state.phase === 'loading') {
        body = h('div', { className: 'gp-fit-muted', 'data-gp-fit-state': 'loading' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { className: 'gp-spin', 'aria-hidden': true }),
            h('span', null, '正在解析 FIT…（约 5–15 秒）')),
          h('div', { style: { marginTop: 6 } }, '原始采样点较多，解析完成后会缓存这次结果。'))
      } else if (state.phase === 'ok') {
        const channels = Array.isArray(state.channels) ? state.channels : []
        const activeList = (Array.isArray(active) ? active : []).filter((key) => channels.includes(key))
        body = h('div', { 'data-gp-fit-state': 'ok', style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { className: 'gp-fit-chips' }, channels.map((key) => {
            const def = fitChannelDef(key)
            if (!def) return null
            const on = activeList.includes(key)
            return h('button', {
              key,
              type: 'button',
              className: `gp-fit-chip${on ? ' on' : ''}`,
              'data-gp-fit-toggle': key,
              'aria-pressed': on,
              title: `${on ? '隐藏' : '显示'}${def.label}`,
              onClick: () => toggleChannel(key),
            }, def.label)
          })),
          activeList.length
            ? h(FitChart, { samples: state.samples, active: activeList })
            : h('div', { className: 'gp-fit-muted' }, '至少选择一个通道'))
      } else if (state.phase === 'advanced_required') {
        body = h('div', { 'data-gp-fit-state': 'advanced_required', style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { className: 'gp-fit-muted' }, h('b', null, '需要进阶模式'), '：FIT 原始曲线来自 Garmin 账号登录，官方 Personal API 不提供。'),
          h(UnlockCard, { flow, id: 'fit', compact: true, hint: 'FIT 曲线' }))
      } else if (state.phase === 'unavailable') {
        body = h('div', { 'data-gp-fit-state': 'unavailable', style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { className: 'gp-fit-muted' }, state.message || '暂无 FIT 曲线'),
          h('div', { className: 'gp-fit-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn',
              'data-gp-fit-retry': '1',
              onClick: load,
            }, '重试')))
      } else {
        body = h('div', { 'data-gp-fit-state': 'idle', style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { className: 'gp-fit-muted' }, '把原始 FIT 采样点画成曲线（心率 / 功率 / 踏频 / 速度 / 海拔 / 温度）。解析较慢，约 5–15 秒，需要时再点。'),
          h('div', { className: 'gp-fit-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              'data-gp-fit-load': '1',
              onClick: load,
            }, '加载曲线')))
      }

      return h('div', { className: 'gp-fit', 'data-gp-fit-block': '1' },
        h('div', { className: 'gp-fit-hd' },
          h('b', null, 'FIT 曲线'),
          h('button', {
            type: 'button',
            className: 'gp-fit-toggle',
            'data-gp-fit-collapse': '1',
            'aria-expanded': open,
            onClick: () => setOpen((value) => !value),
          },
            open ? '收起' : '展开',
            h('span', { className: `caret${open ? ' up' : ''}`, 'aria-hidden': true }, '▾'))),
        open ? h('div', { className: 'gp-fit-body', 'data-gp-fit-body': '1' }, body) : null)
    }

    /* ---------------------------------------------------------------- *
     * 活动详情「深度分析」：默认收起，点「加载分析」才请求 analysis
     * ---------------------------------------------------------------- */
    const ANALYSIS_DURATION_LABELS = {
      5: '5s', 30: '30s', 60: '1m', 300: '5m', 600: '10m', 1200: '20m', 3600: '60m',
    }
    function analysisDurationLabel(sec) {
      const n = numOf(sec)
      if (n === null) return null
      return ANALYSIS_DURATION_LABELS[n] || (n >= 60 ? `${Math.round(n / 60)}m` : `${Math.round(n)}s`)
    }
    /** 兼容 {label,watts} 与 {sec,watts} 两种时长写法 */
    function pdcRowsOf(powerCurve) {
      const list = Array.isArray(powerCurve?.durations) ? powerCurve.durations : []
      return list.map((raw, i) => {
        const sec = numOf(raw?.sec)
        const watts = numOf(raw?.watts, raw?.power, raw?.value)
        const label = firstOf(raw?.label, analysisDurationLabel(sec), `#${i + 1}`)
        return { key: `${i}-${label}`, label: String(label), watts }
      }).filter((row) => row.watts !== null)
    }
    function driftRating(percent) {
      const value = numOf(percent)
      if (value === null) return null
      if (value < 5) return { text: '良好', cls: 'g' }
      if (value <= 10) return { text: '可接受', cls: 'a' }
      return { text: '偏高', cls: 'r' }
    }
    const SHIFT_ROWS = [
      { key: 'proactive', label: '主动变速', en: 'proactive', color: 'var(--gp-green)' },
      { key: 'reactive', label: '被动变速', en: 'reactive', color: 'var(--gp-amber)' },
      { key: 'coasting', label: '滑行', en: 'coasting', color: 'var(--gp-blue)' },
      { key: 'spunnedOut', label: '空转', en: 'spun out', color: 'var(--gp-red)' },
    ]
    function shiftValueOf(shifts, key) {
      if (!shifts || typeof shifts !== 'object') return null
      if (key === 'spunnedOut') return numOf(shifts.spunnedOut, shifts.spunOut, shifts.spun_out)
      return numOf(shifts[key])
    }

    function DeepAnalysis({ id, flow }) {
      const [open, setOpen] = React.useState(false)
      const [state, setState] = React.useState({ phase: 'idle' })
      const abortRef = React.useRef(null)
      const aliveRef = React.useRef(true)

      React.useEffect(() => () => {
        aliveRef.current = false
        try { abortRef.current?.abort() } catch { /* ignore */ }
      }, [])

      const load = React.useCallback(() => {
        if (abortRef.current) { try { abortRef.current.abort() } catch { /* ignore */ } }
        const controller = new AbortController()
        abortRef.current = controller
        setState({ phase: 'loading' })
        fetchJson(`activities/${encodeURIComponent(id)}/analysis`, controller.signal)
          .then((data) => {
            if (!aliveRef.current || controller.signal.aborted) return
            if (data?.status === 'ok') {
              setState({ phase: 'ok', data })
            } else if (data?.status === 'advanced_required') {
              setState({ phase: 'advanced_required' })
            } else {
              setState({
                phase: 'unavailable',
                message: String(firstOf(data?.message, '这条活动没有可用的深度分析')),
              })
            }
          })
          .catch((err) => {
            if (!aliveRef.current || controller.signal.aborted || err?.name === 'AbortError') return
            setState({
              phase: 'unavailable',
              message: `深度分析加载失败：${String(err?.message ?? err)}`,
            })
          })
      }, [id])

      let body = null
      if (state.phase === 'loading') {
        body = h('div', { className: 'gp-deep-muted', 'data-gp-deep-state': 'loading' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { className: 'gp-spin', 'aria-hidden': true }),
            h('span', null, '正在分析…（约 10–30 秒）')),
          h('div', { style: { marginTop: 6 } }, '正在解析功率曲线、爬坡、心率漂移与电子变速。'))
      } else if (state.phase === 'ok') {
        const data = state.data && typeof state.data === 'object' ? state.data : {}
        const pdc = pdcRowsOf(data.powerCurve)
        const maxWatts = pdc.reduce((max, row) => Math.max(max, row.watts), 0)
        const climbs = Array.isArray(data.climbs) ? data.climbs : []
        const drift = numOf(data.hrDrift?.percent)
        const rating = driftRating(drift)
        const shifts = data.shifts && typeof data.shifts === 'object' ? data.shifts : null
        const shiftSum = SHIFT_ROWS.reduce((sum, row) => sum + (shiftValueOf(shifts, row.key) ?? 0), 0)
        const shiftTotal = numOf(shifts?.total) ?? (shifts ? shiftSum : null)

        body = h('div', {
          'data-gp-deep-state': 'ok',
          style: { display: 'flex', flexDirection: 'column', gap: 0 },
        },
          h('div', { className: 'gp-deep-sec', 'data-gp-deep-pdc': '1' },
            h('div', { className: 'gp-deep-h' }, '功率曲线（PDC）',
              h('span', { className: 'sp' }, pdc.length ? `${pdc.length} 个时长` : '')),
            pdc.length
              ? h('div', { className: 'gp-pdc', 'data-gp-pdc-count': String(pdc.length) },
                  pdc.map((row) => h('div', {
                    key: row.key,
                    className: 'gp-pdc-row',
                    'data-gp-pdc-bar': row.label,
                    'data-gp-pdc-watts': String(row.watts),
                  },
                    h('span', { className: 'lb' }, row.label),
                    h('div', { className: 'bar' },
                      h('i', {
                        style: {
                          width: `${maxWatts > 0 ? Math.max(4, (row.watts / maxWatts) * 100) : 0}%`,
                        },
                      })),
                    h('span', { className: 'v' }, `${fmt(row.watts)} W`))))
              : h('div', { className: 'gp-deep-muted', 'data-gp-deep-pdc-empty': '1' },
                  '无功率数据（需要功率计）')),

          h('div', {
            className: 'gp-deep-sec',
            'data-gp-deep-climbs': String(climbs.length),
          },
            h('div', { className: 'gp-deep-h' }, '爬坡',
              h('span', { className: 'sp' }, climbs.length ? `${climbs.length} 段` : '')),
            climbs.length
              ? h('div', { className: 'gp-climbs' }, climbs.map((row, i) => h('div', {
                  key: `${firstOf(row?.category, 'climb')}-${i}`,
                  className: 'gp-climb',
                  'data-gp-climb': String(firstOf(row?.category, '')),
                },
                  h('span', { className: 'cat' }, String(firstOf(row?.category, '—'))),
                  h('span', { className: 'm' },
                    `${fmt((numOf(row?.distanceM) ?? 0) / 1000, 2)} km`),
                  h('span', { className: 'x' }, `↑ ${fmt(row?.elevationGainM)} m`),
                  h('span', { className: 'x' }, `VAM ${fmt(row?.vam)}`),
                  h('span', { className: 'x wpkg' }, `${fmt(row?.wpkg, 2)} W/kg`))))
              : h('div', { className: 'gp-deep-muted' }, '未记录爬坡')),

          h('div', { className: 'gp-deep-sec', 'data-gp-deep-drift': '1' },
            h('div', { className: 'gp-deep-h' }, '心率漂移'),
            drift === null
              ? h('div', { className: 'gp-deep-muted' }, '无心率漂移数据')
              : h('div', {
                  className: 'gp-drift',
                  'data-gp-drift-percent': String(drift),
                },
                  h('span', { className: 'big' }, `${fmt(drift, 1)}%`),
                  rating
                    ? h('span', {
                        className: `gp-pill ${rating.cls}`,
                        'data-gp-drift-rating': rating.text,
                      }, rating.text)
                    : null,
                  h('div', { className: 'note' }, '<5% 良好 · 5–10% 可接受 · >10% 偏高'))),

          h('div', {
            className: 'gp-deep-sec',
            'data-gp-deep-shifts': '1',
            'data-gp-shift-total': shiftTotal === null ? '' : String(shiftTotal),
          },
            h('div', { className: 'gp-deep-h' }, '变速质量',
              h('span', { className: 'sp' },
                shiftTotal !== null ? `共 ${fmt(shiftTotal)} 次` : 'Di2 / eTap')),
            shifts
              ? h('div', { className: 'gp-shifts' }, SHIFT_ROWS.map((row) => {
                  const value = shiftValueOf(shifts, row.key)
                  const pct = shiftTotal && shiftTotal > 0 && value !== null
                    ? (value / shiftTotal) * 100
                    : 0
                  return h('div', {
                    key: row.key,
                    className: 'gp-shift-row',
                    'data-gp-shift-row': row.key,
                    title: `${row.label} · ${row.en}`,
                  },
                    h('span', { className: 'lb', title: row.en }, row.label),
                    h('div', { className: 'bar' },
                      h('i', {
                        style: {
                          width: `${Math.max(0, Math.min(100, pct))}%`,
                          background: row.color,
                        },
                      })),
                    h('span', { className: 'v' }, value !== null ? fmt(value) : '—'))
                }))
              : h('div', { className: 'gp-deep-muted', 'data-gp-shift-empty': '1' },
                  '未检测到电子变速数据')))
      } else if (state.phase === 'advanced_required') {
        body = h('div', {
          'data-gp-deep-state': 'advanced_required',
          style: { display: 'flex', flexDirection: 'column', gap: 8 },
        },
          h('div', { className: 'gp-deep-muted' },
            h('b', null, '需要进阶模式'),
            '：深度分析来自 Garmin 账号登录，官方 Personal API 不提供。'),
          h(UnlockCard, { flow, id: 'deep', compact: true, hint: '深度分析' }))
      } else if (state.phase === 'unavailable') {
        body = h('div', {
          'data-gp-deep-state': 'unavailable',
          style: { display: 'flex', flexDirection: 'column', gap: 8 },
        },
          h('div', { className: 'gp-deep-muted' }, state.message || '暂无深度分析'),
          h('div', { className: 'gp-fit-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn',
              'data-gp-deep-retry': '1',
              onClick: load,
            }, '重试')))
      } else {
        body = h('div', {
          'data-gp-deep-state': 'idle',
          style: { display: 'flex', flexDirection: 'column', gap: 8 },
        },
          h('div', { className: 'gp-deep-muted' },
            '功率曲线、爬坡、心率漂移与电子变速（Di2 / eTap）来自原始 FIT 分析，约 10–30 秒，需要时再点。'),
          h('div', { className: 'gp-fit-actions' },
            h('button', {
              type: 'button',
              className: 'gp-btn primary',
              'data-gp-deep-load': '1',
              onClick: load,
            }, '加载分析（约 10–30 秒）')))
      }

      return h('div', { className: 'gp-fit gp-deep', 'data-gp-deep-block': '1' },
        h('div', { className: 'gp-fit-hd' },
          h('b', null, '深度分析'),
          h('button', {
            type: 'button',
            className: 'gp-fit-toggle',
            'data-gp-deep-collapse': '1',
            'aria-expanded': open,
            onClick: () => setOpen((value) => !value),
          },
            open ? '收起' : '展开',
            h('span', { className: `caret${open ? ' up' : ''}`, 'aria-hidden': true }, '▾'))),
        open ? h('div', { className: 'gp-fit-body', 'data-gp-deep-body': '1' }, body) : null)
    }

    /* ---------------------------------------------------------------- *
     * 健康趋势：7 / 30 天折线 · 柱状 · Body Battery 区间带
     * 纯内联 SVG；空值不画 0（折线按连续非空段拆分，柱状直接跳过），
     * 只有首尾日期标在 X 轴下方，Y 轴自动缩放并画 1–2 条网格线。
     * ---------------------------------------------------------------- */
    const TRENDS_RANGE_KEY = 'garmin-panel-trends-range-v1'
    const TRENDS_DAYS = [7, 30]
    const TREND_W = 300
    const TREND_H = 62
    const TREND_PADX = 3
    const TREND_TOPY = 5
    const TREND_BOTY = 3

    function readTrendsRange() {
      try {
        return Number(localStorage.getItem(TRENDS_RANGE_KEY)) === 30 ? 30 : 7
      } catch { return 7 }
    }

    function trendRowsOf(data) {
      const list = Array.isArray(data?.series) ? data.series : []
      return list.filter((row) => row && dayPart(row.date))
    }

    /** pick(row) → number|null；NaN / 非数字一律当空值（缺口），绝不当 0 */
    function trendValue(row, pick) {
      if (!row || typeof pick !== 'function') return null
      const v = pick(row)
      return typeof v === 'number' && isFinite(v) ? v : null
    }

    function trendLast(rows, pick) {
      for (let i = rows.length - 1; i >= 0; i--) {
        const v = trendValue(rows[i], pick)
        if (v !== null) return v
      }
      return null
    }

    function trendAvg(rows, pick) {
      const vals = rows.map((row) => trendValue(row, pick)).filter((v) => v !== null)
      return vals.length ? vals.reduce((sum, v) => sum + v, 0) / vals.length : null
    }

    function trendMin(rows, pick) {
      const vals = rows.map((row) => trendValue(row, pick)).filter((v) => v !== null)
      return vals.length ? Math.min(...vals) : null
    }

    function trendDelta(diff, goodWhen, digits = 0, unit = '') {
      if (diff === null || !isFinite(diff)) return null
      if (Math.abs(diff) < (digits > 0 ? 0.05 : 0.5)) {
        return h('span', { className: 'gp-trend-delta flat' }, '持平')
      }
      const good = goodWhen === 'up' ? diff > 0 : goodWhen === 'down' ? diff < 0 : null
      const cls = good === null ? 'flat' : good ? 'good' : 'bad'
      return h('span', { className: `gp-trend-delta ${cls}` },
        `${diff > 0 ? '↑' : '↓'}${fmt(Math.abs(diff), digits)}${unit}`)
    }

    /**
     * 一张趋势卡：标题行（名称 + 最新值 pill）、72px 图表区、页脚（均值/变化）。
     */
    function TrendCard({ id, label, color, pill, footer, chart, loading, footerClass = '', ...rest }) {
      return h('div', { className: 'gp-card gp-trend', 'data-gp-trend': id, ...rest },
        h('div', { className: 'gp-trend-hd' },
          h('span', { className: 'gp-trend-lb' }, label),
          h('span', {
            className: 'gp-pill gp-trend-pill',
            style: { color, borderColor: `color-mix(in srgb, ${color} 42%, transparent)` },
            'data-gp-trend-latest': id,
          }, pill)),
        loading
          ? h('div', { className: 'gp-trend-chart' }, h(Skel, { h: 62 }))
          : chart,
        h('div', { className: `gp-trend-ft${footerClass ? ` ${footerClass}` : ''}`, 'data-gp-trend-foot': id }, footer))
    }

    /**
     * 折线 / 柱状 / 区间带。空值：折线拆成多段（单点画圆），柱状跳过，
     * 所以绝不把 null 画到底线（0）上。
     */
    function TrendChart({
      id, label, rows, pick, color, avg = null, kind = 'line',
      barsPick = null, barsColor = null, bandPick = null, rangeDays = 7, emptyText = null,
    }) {
      const values = rows.map((row) => trendValue(row, pick))
      const finite = values.filter((v) => v !== null)
      const missing = !rows.length || (kind === 'bar' ? finite.length === 0 : finite.length < 2)
      if (missing) {
        return h('div', {
          className: 'gp-trend-empty',
          'data-gp-trend-empty': id,
        }, emptyText || `近 ${rangeDays} 天未记录`)
      }

      const innerW = TREND_W - TREND_PADX * 2
      const innerH = TREND_H - TREND_TOPY - TREND_BOTY
      const n = rows.length
      const x = (i) => (n === 1 ? TREND_W / 2 : TREND_PADX + (i / (n - 1)) * innerW)

      /* Y 轴自动缩放：折线把均值也算进范围，柱状从 0 起 */
      let lo
      let hi
      if (kind === 'bar') {
        lo = 0
        hi = Math.max(1, ...finite)
      } else if (kind === 'band') {
        const mins = []
        const maxs = []
        for (const row of rows) {
          const band = bandPick ? bandPick(row) : null
          const mn = numOf(band?.min)
          const mx = numOf(band?.max)
          if (mn !== null) mins.push(mn)
          if (mx !== null) maxs.push(mx)
        }
        lo = Math.min(...mins, ...finite)
        hi = Math.max(...maxs, ...finite)
      } else {
        lo = Math.min(...finite, avg ?? Infinity)
        hi = Math.max(...finite, avg ?? -Infinity)
      }
      if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1 }
      if (hi <= lo) hi = lo + 1
      if (kind === 'bar') {
        hi *= 1.08
      } else {
        const pad = (hi - lo) * 0.14 || 1
        lo = Math.max(0, lo - pad)
        hi += pad
      }
      const y = (v) => TREND_TOPY + (1 - (v - lo) / (hi - lo)) * innerH

      /* 连续非空段 → 折线；null 是段边界（不画 0） */
      const segments = []
      let current = []
      values.forEach((v, i) => {
        if (v === null) {
          if (current.length) segments.push(current)
          current = []
          return
        }
        current.push([x(i), y(v)])
      })
      if (current.length) segments.push(current)

      const lineNodes = segments.map((seg, i) => (seg.length === 1
        ? h('circle', {
            key: `seg${i}`, cx: seg[0][0], cy: seg[0][1], r: 1.7, fill: color,
          })
        : h('polyline', {
            key: `seg${i}`,
            points: seg.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' '),
            fill: 'none',
            stroke: color,
            strokeWidth: 1.8,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          })))

      /* 柱状（步数 / 强度 / 睡眠时长格状小柱） */
      const bars = barsPick ? rows.map((row) => trendValue(row, barsPick)) : values
      const barFinite = bars.filter((v) => v !== null)
      const barMax = Math.max(1, ...barFinite)
      const bw = Math.max(2, Math.min(9, (innerW / Math.max(1, n)) * 0.55))
      const barHeight = barsPick ? innerH * 0.42 : innerH
      const barNodes = bars.map((v, i) => {
        if (v === null) return null
        const height = Math.max(1.4, (Math.max(0, v) / barMax) * barHeight)
        return h('rect', {
          key: `bar${i}`,
          x: x(i) - bw / 2,
          y: TREND_H - TREND_BOTY - height,
          width: bw,
          height,
          rx: 1.2,
          fill: barsColor || color,
          opacity: barsPick ? 0.5 : 0.85,
        })
      })

      /* Body Battery：每日 min–max 区间带 */
      let bandNodes = []
      if (kind === 'band') {
        const bandSegs = []
        let band = []
        rows.forEach((row, i) => {
          const raw = bandPick ? bandPick(row) : null
          const mn = numOf(raw?.min)
          const mx = numOf(raw?.max)
          if (mn === null || mx === null) {
            if (band.length) bandSegs.push(band)
            band = []
            return
          }
          band.push({ x: x(i), min: mn, max: mx })
        })
        if (band.length) bandSegs.push(band)
        bandNodes = bandSegs.map((seg, i) => {
          const top = seg.map((p) => `${p.x.toFixed(1)},${y(p.max).toFixed(1)}`)
          const bottom = seg.slice().reverse().map((p) => `${p.x.toFixed(1)},${y(p.min).toFixed(1)}`)
          return h('polygon', {
            key: `band${i}`,
            points: [...top, ...bottom].join(' '),
            fill: color,
            opacity: 0.16,
          })
        })
      }

      const nulls = values.filter((v) => v === null).length
      const zeros = finite.filter((v) => v === 0).length
      const avgLine = kind === 'line' && typeof avg === 'number' && isFinite(avg)
        ? h('line', {
            x1: TREND_PADX,
            x2: TREND_W - TREND_PADX,
            y1: y(avg),
            y2: y(avg),
            stroke: 'var(--gp-line)',
            strokeDasharray: '3 3',
          })
        : null

      return h('div', {
        className: 'gp-trend-chart',
        'data-gp-trend-chart': id,
        'data-gp-trend-nulls': String(nulls),
        'data-gp-trend-drawn': String(finite.length),
        'data-gp-trend-segments': String(kind === 'bar' ? 0 : segments.length),
        'data-gp-trend-zeros': String(zeros),
        title: `X 轴：${rows[0].date} → ${rows[rows.length - 1].date}`,
      },
        h('svg', {
          viewBox: `0 0 ${TREND_W} ${TREND_H}`,
          preserveAspectRatio: 'none',
          role: 'img',
          'aria-label': `${label} 近 ${rangeDays} 天趋势`,
          style: { height: TREND_H },
        },
          /* 2 条网格线：上界 + 下界（柱状的下界即 0 基线） */
          h('line', {
            x1: TREND_PADX, x2: TREND_W - TREND_PADX, y1: y(hi), y2: y(hi),
            stroke: 'var(--gp-line2)',
          }),
          h('line', {
            x1: TREND_PADX, x2: TREND_W - TREND_PADX, y1: y(lo), y2: y(lo),
            stroke: 'var(--gp-line2)',
          }),
          avgLine,
          bandNodes,
          kind === 'bar' || barsPick ? barNodes : null,
          kind === 'bar' ? null : lineNodes),
        h('div', { className: 'gp-trend-x' },
          h('span', null, shortDay(rows[0].date)),
          h('span', null, shortDay(rows[rows.length - 1].date))))
    }

    /* ---------------------------------------------------------------- *
     * A 类展示：HRV 详情 / 心率区间 / 睡眠规律 / Body Battery 曲线
     * 全部对缺失字段容忍：拿不到就显示「未获取 / 未记录」，绝不抛错
     * ---------------------------------------------------------------- */
    /** "HH:MM" → 分钟；wrap=true 时把中午之前的时间算到次日（入睡时间用） */
    function clockMinutesOf(value, wrap = false) {
      const m = /^(\d{1,2}):(\d{2})/.exec(String(value ?? '').trim())
      if (!m) return null
      const mins = Number(m[1]) * 60 + Number(m[2])
      if (!isFinite(mins) || mins < 0 || mins > 24 * 60) return null
      return wrap && mins < 12 * 60 ? mins + 24 * 60 : mins
    }
    function minutesClock(value) {
      const n = numOf(value)
      if (n === null) return null
      const mins = ((Math.round(n) % 1440) + 1440) % 1440
      return `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`
    }

    /**
     * snapshot 里的 HRV 详情：顶层 snapshot.hrv 优先，其次 kpi.sleep 的扁平键。
     * 字段名在不同后端版本里不一致，这里全部做别名兼容。
     */
    function hrvDetailOf(snap) {
      const top = snap?.hrv && typeof snap.hrv === 'object' ? snap.hrv : {}
      const kpiSleep = snap?.kpi?.sleep && typeof snap.kpi.sleep === 'object' ? snap.kpi.sleep : {}
      const low = numOf(top.baselineBalancedLow, top.baselineLow, top.baselineLowUpper,
        top.balancedLow, kpiSleep.baselineBalancedLow, kpiSleep.baselineLowUpper,
        kpiSleep.baselineLow)
      const high = numOf(top.baselineBalancedHigh, top.baselineHigh, top.baselineUpper,
        top.balancedHigh, kpiSleep.baselineBalancedHigh, kpiSleep.baselineHigh)
      const peak = numOf(top.lastNight5MinHigh, top.lastNightMax, top.lastNightHigh,
        kpiSleep.lastNight5MinHigh, kpiSleep.lastNightMax)
      const statusRaw = firstOf(top.status, top.hrvStatus, top.baselineStatus,
        kpiSleep.hrvStatus, kpiSleep.status)
      const status = statusRaw ? String(statusRaw).toUpperCase() : null
      if (low === null && high === null && peak === null && !status) return null
      return { low, high, peak, status }
    }

    function hrvDetailText(info) {
      if (!info) return null
      const parts = []
      if (info.low !== null && info.high !== null) {
        parts.push(`基线 ${fmt(info.low)}–${fmt(info.high)} ms`)
      } else if (info.low !== null) parts.push(`基线下限 ${fmt(info.low)} ms`)
      else if (info.high !== null) parts.push(`基线上限 ${fmt(info.high)} ms`)
      if (info.peak !== null) parts.push(`昨夜最高 ${fmt(info.peak)} ms`)
      if (info.status) parts.push(info.status)
      return parts.length ? parts.join(' · ') : null
    }

    /** extras.hrZones 里挑 DEFAULT / running 档；没有 zones 的档位直接跳过 */
    function pickHrZoneProfile(list) {
      const rows = Array.isArray(list) ? list.filter((row) => row
        && typeof row === 'object'
        && Array.isArray(row.zones)
        && row.zones.length) : []
      if (!rows.length) return null
      const sportOf = (row) => String(firstOf(row.sport, row.activityType, row.profile, '')
        ?? '').toUpperCase()
      return rows.find((row) => sportOf(row) === 'DEFAULT' || sportOf(row) === 'GENERIC')
        || rows.find((row) => sportOf(row) === 'RUNNING' || sportOf(row) === 'RUN')
        || rows[0]
    }

    /** 心率区间行：zone / low / high，缺 zone 号时按数组下标补 */
    function hrZoneRowsOf(profile) {
      const zones = Array.isArray(profile?.zones) ? profile.zones : []
      return zones.map((row, i) => ({
        zone: numOf(row?.zone, row?.zoneNumber, row?.index, i + 1) ?? i + 1,
        low: numOf(row?.low, row?.lowBpm, row?.min, row?.from),
        high: numOf(row?.high, row?.highBpm, row?.max, row?.to),
      })).filter((row) => row.low !== null || row.high !== null)
    }

    /**
     * 睡眠规律性：7 晚入睡 / 起床均值 + 波动分钟 + 每晚入睡点。
     * 优先用后端 averages（同一份 /trends 已经算好），缺失时从逐晚字段现算。
     */
    function sleepRegularityOf(rows, averages) {
      const list = Array.isArray(rows) ? rows.filter((row) => row && dayPart(row.date)) : []
      const beds = []
      for (const row of list) {
        const bed = clockMinutesOf(firstOf(row.sleepStartLocal, row.sleep_start_local,
          row.bedtimeLocal), true)
        const wake = clockMinutesOf(firstOf(row.sleepEndLocal, row.sleep_end_local,
          row.wakeLocal))
        beds.push({ date: dayPart(row.date), mins: bed, wake })
      }
      const bedValues = beds.map((row) => row.mins).filter((v) => v !== null)
      const wakeValues = beds.map((row) => row.wake).filter((v) => v !== null)
      const mean = (values) => (values.length
        ? values.reduce((sum, v) => sum + v, 0) / values.length
        : null)
      const bedMean = mean(bedValues)
      const wakeMean = mean(wakeValues)
      const bedAvg = clockMinutesOf(averages?.bedtimeAvg, true) ?? bedMean
      const wakeAvg = clockMinutesOf(averages?.wakeAvg) ?? wakeMean
      let variability = numOf(averages?.bedtimeVariabilityMin)
      if (variability === null && bedValues.length > 1 && bedMean !== null) {
        const mad = bedValues.reduce((sum, v) => sum + Math.abs(v - bedMean), 0) / bedValues.length
        variability = Math.round(mad)
      }
      const dots = beds.filter((row) => row.mins !== null)
      return {
        bedAvg,
        wakeAvg,
        variability: variability !== null ? Math.max(0, Math.round(variability)) : null,
        dots,
        nights: list.length,
      }
    }

    /** 睡眠规律性：紧凑卡片（7 晚图下方），一行文字 + 入睡点阵 */
    function SleepRegularity({ rows, averages, loading, nights }) {
      const info = sleepRegularityOf(rows, averages)
      const hasAny = info.bedAvg !== null || info.wakeAvg !== null || info.dots.length > 0
      if (loading && !hasAny) {
        return h('div', { className: 'gp-sleep-reg', 'data-gp-sleep-reg': '1' },
          h('div', { className: 'hd' }, h('b', null, '睡眠规律性')),
          h(Skel, { h: 34 }))
      }
      if (!hasAny) {
        return h('div', { className: 'gp-sleep-reg', 'data-gp-sleep-reg': 'empty' },
          h('div', { className: 'hd' }, h('b', null, '睡眠规律性')),
          h('div', { className: 'muted' }, '未获取到睡眠规律数据'))
      }
      const bedText = info.bedAvg !== null ? minutesClock(info.bedAvg) : '—'
      const wakeText = info.wakeAvg !== null ? minutesClock(info.wakeAvg) : '—'
      const varText = info.variability !== null ? `±${fmt(info.variability)} 分钟` : '—'
      const line = `平均入睡 ${bedText} · 平均起床 ${wakeText} · 波动 ${varText}`
      return h('div', { className: 'gp-sleep-reg', 'data-gp-sleep-reg': '1' },
        h('div', { className: 'hd' },
          h('b', null, '睡眠规律性'),
          h('span', { className: 'sp' }, `${info.nights || info.dots.length || nights || 0} 晚 · 入睡时间`)),
        h('div', { className: 'txt', 'data-gp-sleep-reg-text': line },
          '平均入睡 ', h('b', null, bedText),
          ' · 平均起床 ', h('b', null, wakeText),
          ' · 波动 ', h('b', null, varText)),
        h(SleepRegularityDots, { dots: info.dots }))
    }

    /** 每晚入睡时间点：X = 第几晚，Y = 入睡时刻（越晚越靠下），虚线为均值 */
    function SleepRegularityDots({ dots }) {
      const list = Array.isArray(dots) ? dots : []
      if (!list.length) return null
      const W = 300
      const H = 34
      const PADX = 6
      const PADY = 5
      const values = list.map((row) => row.mins)
      let lo = Math.min(...values)
      let hi = Math.max(...values)
      if (hi - lo < 1) { lo -= 30; hi += 30 }
      const span = Math.max(1, hi - lo)
      const x = (i) => (list.length === 1 ? W / 2 : PADX + (i / (list.length - 1)) * (W - PADX * 2))
      const y = (v) => PADY + (1 - (v - lo) / span) * (H - PADY * 2)
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length
      return h('svg', {
        className: 'dots',
        viewBox: `0 0 ${W} ${H}`,
        preserveAspectRatio: 'none',
        role: 'img',
        'aria-label': `近 ${list.length} 晚入睡时间点`,
        'data-gp-sleep-dots': String(list.length),
        'data-gp-sleep-bed-avg': minutesClock(avg) || '',
      },
        h('title', null, list.map((row) => `${row.date} ${minutesClock(row.mins)}`).join(' · ')),
        h('line', {
          x1: PADX, x2: W - PADX, y1: y(avg), y2: y(avg),
          stroke: 'var(--gp-line)', strokeDasharray: '3 3',
        }),
        list.map((row, i) => h('circle', {
          key: `${row.date}-${i}`,
          cx: x(i), cy: y(row.mins), r: 2.6,
          fill: 'var(--gp-blue)',
        })))
    }

    /**
     * Body Battery 当日曲线：日级 sparkline（约 40px）。
     * 只有电池 KPI 卡挂载时才请求（懒加载）；no_series / 失败时什么都不画，
     * 让外层保留原本的电池图形，不弹错误。
     */
    function BodyBatterySpark({ enabled = true, date = null, version = 0 }) {
      const [state, setState] = React.useState({ phase: 'idle' })
      React.useEffect(() => {
        if (!enabled) return undefined
        const day = dayPart(date) || isoDay(new Date())
        let active = true
        let controller = new AbortController()
        setState({ phase: 'loading' })
        fetch(`${API}/body-battery?date=${encodeURIComponent(day)}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((data) => {
            if (!active) return
            const series = Array.isArray(data?.series) ? data.series : []
            const points = series
              .map((row) => ({ t: String(firstOf(row?.t, row?.time, '') ?? ''), level: numOf(row?.level) }))
              .filter((row) => row.level !== null)
            if (data?.status === 'ok' && points.length > 1) {
              setState({
                phase: 'ok',
                points,
                charged: numOf(data?.charged),
                drained: numOf(data?.drained),
                highest: numOf(data?.highest),
                lowest: numOf(data?.lowest),
              })
            } else {
              setState({ phase: 'empty' })
            }
          })
          .catch((err) => {
            if (!active || err?.name === 'AbortError') return
            setState({ phase: 'empty' })
          })
        return () => { active = false; controller.abort() }
      }, [enabled, date, version])

      if (state.phase !== 'ok') return null
      const pts = state.points
      const W = 300
      const H = 40
      const PADX = 3
      const PADY = 4
      const x = (i) => (pts.length === 1 ? W / 2 : PADX + (i / (pts.length - 1)) * (W - PADX * 2))
      const y = (v) => PADY + (1 - Math.max(0, Math.min(100, v)) / 100) * (H - PADY * 2)
      const line = pts.map((row, i) => `${x(i).toFixed(1)},${y(row.level).toFixed(1)}`).join(' ')
      const area = `M${PADX} ${H - PADY}L${line.split(' ').join('L')}L${W - PADX} ${H - PADY}Z`
      const rangeText = state.highest !== null && state.lowest !== null
        ? `Body Battery 曲线 · 最高 ${fmt(state.highest)} · 最低 ${fmt(state.lowest)}`
        : 'Body Battery 曲线'
      return h('div', {
        className: 'gp-bbspark',
        'data-gp-bbspark': '1',
        'data-gp-bbspark-points': String(pts.length),
        title: rangeText,
      },
        h('svg', {
          viewBox: `0 0 ${W} ${H}`,
          preserveAspectRatio: 'none',
          role: 'img',
          'aria-label': rangeText,
        },
          h('path', {
            d: area,
            fill: 'color-mix(in srgb, var(--gp-green) 16%, transparent)',
            stroke: 'none',
          }),
          h('polyline', {
            points: line,
            fill: 'none',
            stroke: 'var(--gp-green)',
            strokeWidth: 1.6,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          })))
    }

