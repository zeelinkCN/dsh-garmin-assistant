# client.js 源码片段

DSH 浏览器端只加载一个 `client.js`，且它必须是自包含的
`window.__ModuleLoader__.load({ id, factory(require) { ... } })`。
所以这里采用**拼接式拆分**：片段之间没有 `import` / `export`，它们共享同一个
`factory` 函数作用域，按文件名排序拼接后就是完整的 `client.js`。

`client.js` 是构建产物，**不要直接编辑**（文件头有生成标记）。
改代码请改 `src/client/*.js`，然后重新构建。

## 片段顺序（= 执行顺序）

| 文件 | 内容 | 原始行号 |
| --- | --- | --- |
| `00-header.js` | 加载器外壳、`require('react')`、`h` / `PANEL` / `API`（factory 开括号） | 1–8 |
| `10-styles.js` | `CSS` 模板字符串（全部样式） | 9–1347 |
| `20-utils.js` | 日期 / 数字 / 格式化 / 计划与目标 / 性别 / 请求 hook；布局 v2 定义与持久化 | 1348–2082 + 6428–6747 |
| `30-charts.js` | 全部内联 SVG：KPI 图形、趋势卡、睡眠规律、Body Battery、FIT 曲线、深度分析 | 2716–3100 + 4156–4794 + 5903–6427 |
| `40-sections.js` | 骨架屏、AI 教练 / 营养、活动平铺与月度热力、训练计划 / 女性健康卡片、区块与卡片槽位 | 2083–2092 + 3101–3617 + 5117–5350 + 5456–5902 + 6748–6977 |
| `50-workshop.js` | 路书工坊：rb 工具、缩略图 hook、轨迹预览、导入 / 规划 / 我的路书 / 外壳 | 6978–7132 + 7707–9005 |
| `60-modals.js` | 登录、解锁卡、新手引导、账号设置、设备浮层、活动抽屉、计划详情浮层、高级 Key 面板 | 2093–2715 + 3618–4155 + 4795–5116 + 5351–5455 + 7133–7706 |
| `70-app.js` | `DateNav`、`Page`（含顶栏、区块内联渲染）、`PanelIcon`、`inject` / `apply`（factory 闭括号） | 9006–11091 |

“原始行号”指拆分前那一版 `client.js` 的行区间，便于对照；多个区间表示该片段由
若干段原文按顺序拼成。片段内容是原文件的**逐行原样切片**，拆分过程中没有改写代码。

## 构建与校验

```bash
node scripts/build-client.mjs            # 生成 client.js
node scripts/build-client.mjs --check    # 校验 client.js 与片段是否一致（CI 用）
node scripts/check-fragments.mjs         # 对每个片段跑 node --check（含产物）
```

`00-header.js` 与 `70-app.js` 分别只有 factory 的开 / 闭括号，单独拿去
`node --check` 必然报“未闭合”，这是作用域边界片段的正常现象；
`check-fragments.mjs` 会把它们放回「头 + 片段 + 尾」的上下文里再校验，
其余片段可直接单独校验。

## 维护规则

1. 不要加 `import` / `export`，也不要包 IIFE——所有片段共享同一个作用域。
2. 文件名前缀决定拼接顺序；新代码请追加到所属片段的**末尾**，或新建一个序号更大的片段。
3. 拼接顺序即执行顺序：`const` / `let` 的顶层声明存在 TDZ 限制，若新代码在**加载时**
   就要读另一个片段的绑定，必须把依赖方放在被依赖方之后（函数声明会提升，不受此限）。
4. 改完必须重新构建并跑 `garmin-panel-selftest/client/` 下的验收脚本。
