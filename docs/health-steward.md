# AI 健康管家 · 设计说明

> 面板里与「AI 教练」并行的第二个按钮。教练回答"今天怎么练"，健康管家回答"身体怎么样、生活上要注意什么"。

## 1. 两个角色的分工

| | AI 教练 | AI 健康管家 |
|---|---|---|
| 关注 | 训练负荷、强度分布、恢复窗口、今天练什么 | 睡眠、HRV、静息心率、压力、Body Battery、呼吸/血氧、体重与营养、生活习惯 |
| 输出 | 训练建议（区间/时长）、恢复安排、风险提醒 | 健康结论、睡眠与恢复、压力与情绪、生活方式提醒、需要留意（含就医提示） |
| 语气 | 教练式，直接给处方 | 管家式，温和、可执行、不制造焦虑 |
| 数据 | 负荷趋势、ACWR、VO2max、活动 | 近 7 晚睡眠、HRV/基线、RHR/基线、压力、BB、呼吸、SpO2、体重、营养、准备度因子 |

## 2. 交互

AI 教练卡片头部加一个分段切换（两个按钮并行）：

```
┌ AI 健康 · 今日建议 ──────────────────────────┐
│  [ AI 教练 ]  [ AI 健康管家 ]        ↻ 重新分析 │
├──────────────────────────────────────────────┤
│  (当前选中角色的内容 / 或 CTA)                  │
└──────────────────────────────────────────────┘
```

- 默认态：CTA `让教练分析今天`（教练）/ `让管家看看今天`（管家）
- 点击才调用（不自动烧 token）；每个角色各自缓存 30 分钟，切回来不重算
- 结果区：标题 + 结构化的几段文本；底部 `模型 deepseek-flash · 生成于 21:12` + `复制`
- 「保持即可」：当所有指标正常时，结论必须明确写「今天各项指标正常，保持即可」，而不是硬凑建议

## 3. Host 端点

`POST /garmin-panel/api/steward`（与 `/coach` 同构）

```json
{ "date": "2026-11-05", "force": false }
→ { "status":"ok", "date":"…", "generatedAt":"ISO", "model":"deepseek-flash",
    "text":"…markdown…", "usage":{"input":0,"output":0}, "verdict":"keep|watch|attention" }
→ { "status":"error", "code":"RATE_LIMIT", "message":"…", "retryAfterMs":1234 }
```

- `GET /garmin-panel/api/steward/status` → `{ available, model }`
- `verdict`：由模型在文本里输出固定首行 `VERDICT: keep|watch|attention`，host 解析后剥离该行，交给客户端上色（keep=绿 / watch=琥珀 / attention=红）
- 缓存 key `steward:<date>`，30 分钟；`force:true` 绕过；in-flight 去重

## 4. 上下文（给模型的数据）

```json
{
  "date": "2026-11-05",
  "sleep_last_7_nights": [{ "date","score","hours","deep_pct","rem_pct","hrv","rhr" }],
  "sleep_avg": { "score": 80.6, "hours": 7.55, "hrv": 46 },
  "hrv": { "last_night": 53, "weekly_avg": 46, "delta": 7 },
  "resting_hr": { "today": 46, "avg_7d": 50, "delta": -4 },
  "readiness": { "score": 67, "level": "MODERATE", "factors": { "sleep":86,"hrv":98,"recovery":99,"load":63,"stress":69,"sleep_history":67 } },
  "body_battery": { "current": 36, "charged": 74, "drained": 60, "high": 94, "low": 20 },
  "stress": { "avg": 29, "max": 87, "qualifier": "BALANCED" },
  "respiration": { "avg": 13.0 },
  "spo2": { "avg": 96, "low": 91 } | null,
  "weight": { "latest_kg": 65.0, "trend_30d": -0.3 } | null,
  "nutrition": { "calories": 0, "protein_g": 0, "logged_days_7d": 0 } | null,
  "training_load_hint": { "acwr": 1.6, "tsb": -154, "status": "PRODUCTIVE" },
  "missing": ["spo2", "weight", "nutrition"]
}
```

> 数据缺口写进 `missing`，让模型明确说「未记录」，不要编造。

## 5. System prompt（健康管家）

```
你是用户专属的 AI 健康管家，不是医生。只基于给定的 Garmin 数据与常识给建议，不编造数据，不做诊断。
输出严格按下面结构，每段 1–3 句，中文，具体到数字：

VERDICT: keep | watch | attention
## 今日健康结论
## 睡眠与恢复
## 压力与情绪
## 生活方式提醒（非训练：饮水、久坐、用眼、咖啡因、酒精、作息、饮食结构）
## 需要留意
## 保持即可

规则：
- 若各项指标都在个人基线内，VERDICT 必须为 keep，且「保持即可」段落明确写「今天各项指标正常，保持即可」，不要硬凑建议。
- 只在数据支持时才提风险；轻微波动用「可以留意」而不是警告。
- 涉及持续异常（如静息心率连续多日偏高、HRV 连续下滑、血氧持续偏低）时，VERDICT=attention，并建议「如有不适请咨询医生」——必须包含免责声明，不得给出诊断或用药建议。
- 不评价训练计划（那是 AI 教练的职责），只在与恢复相关时提一句。
- 缺失的指标直接说「未记录」。
```

## 6. 客户端 UI

- 卡片标题从「AI 教练 · 今日建议」改为「AI 健康 · 今日建议」，头部两个分段按钮
- 选中态用 `--gp-blue` 描边；两个角色结果分别缓存在组件 state（`coachResult` / `stewardResult`），切换不丢
- verdict 颜色条：卡片左侧 3px 竖条（keep 绿 / watch 琥珀 / attention 红）
- 文本渲染沿用现有 markdown-lite（## 标题、- 列表）
- 错误提示复用现有映射（限流/额度/未登录/未配置模型）
- 免责声明：卡片底部小字「AI 建议仅供参考，不构成医疗建议」

## 7. 验收

- [ ] 两个按钮都能独立触发、独立缓存、互不覆盖
- [ ] 正常数据下输出含「保持即可」且 VERDICT=keep
- [ ] 人为构造异常（如 HRV 连续下降）时 VERDICT=watch/attention 且带「咨询医生」措辞
- [ ] 未配置模型 / 限流时有中文提示，不白屏
- [ ] 切换角色不重新请求（缓存命中）
