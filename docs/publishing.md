# 佳明助手 · 发布与分发说明

> 目标：让别人也能在他们自己的 DeepSeek Harness 里装上这个插件。

## 0. 先分清「什么要跟着插件走、什么必须各自准备」

| 东西 | 谁提供 | 说明 |
|---|---|---|
| 插件本体 `@local/garmin-panel` | 你发布 | Host（Node）+ Client（浏览器）+ 图标/语言包，约 60 KB |
| `garmin-mcp`（MCP 服务端） | 各用户自己装 | `uv tool install --python 3.12 "git+https://github.com/Taxuspt/garmin_mcp"`，约 1 分钟 |
| Garmin 账号授权 | 各用户自己登录 | 面板内已有登录界面；令牌存各自 `~/.garminconnect`，约 6 个月有效 |
| DeepSeek Harness | 各用户自己装 | 需要 0.2.x（有 `ctx.webServer` 与 client 热加载），桌面版即可 |

> 插件本身**不含**任何凭据、令牌、Garmin 数据；也不依赖你的账号。

## 1. 发布前的包准备

当前目录 `garmin-panel/` 已经是合法 bundle，但 `@local` 作用域不能发布到 npm。发布时改两处：

```bash
cd garmin-panel
# 1) 改成你自己的 npm 作用域/包名（示例：@yourname/garmin-panel 或 dsh-garmin-panel）
node -e "const f='package.json',p=require('./'+f);p.name='dsh-garmin-panel';p.private=false;p.version='0.1.0';require('fs').writeFileSync(f,JSON.stringify(p,null,2)+'\n')"
# 2) 插件内没有对包名的硬编码，改完不需要改代码
grep -n "@local/garmin-panel" client.js || echo "client.js 无硬编码包名（OK）"
```

`package.json` 里这几个字段是 DSH 识别的关键，发布前别丢：

```jsonc
{
  "name": "dsh-garmin-panel",
  "type": "module",
  "exports": {
    ".": "./index.js",          // Host 半：Cordis 插件入口
    "./client": "./client.js",  // Client 半：浏览器模块（免构建，原样服务）
    "./package.json": "./package.json",
    "./locale/*.json": "./locale/*.json",
    "./icon": "./icon.svg"
  },
  "files": ["index.js", "client.js", "cordis.patch.yml", "locale/*.json", "icon.svg"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },   // 安装时插入的 loader 行
    "client": { "platform": "web", "immediately": true, "inject": ["@deepseek-ai/dsh-client-ui-layout", "@deepseek-ai/dsh-client-ui-sidebar"] }
  }
}
```

注意：`client.js` 必须是**已构建好的浏览器产物**，格式为
`window.__ModuleLoader__.load({ id: '<package.json 的 name>', factory(require){...} })`，
只能 `require` React 等内置模块。DSH 不会在安装时帮你打包。

## 2. 发布渠道（选一个或都做）

### 渠道 A：npm（推荐，用户一条命令）

```bash
npm login
npm publish --access public

# 用户侧（在自己的机器上）：
dsh plugin --profile desktop add dsh-garmin-panel
# 或在 Harness 的 设置 → 插件 里安装这个包
```

首次安装后，插件会出现在：
- 左侧栏 → **佳明助手**（全页面板）
- 设置 → 插件 → 有独立的标题/描述/图标

### 渠道 B：GitHub 仓库 + 本地路径安装

```bash
git clone https://github.com/<you>/dsh-garmin-panel
dsh plugin --profile desktop add /path/to/dsh-garmin-panel
```

### 渠道 C：极简手工安装（不需要 pnpm，适合内测）

```bash
# 1) 放进 profile 的 node_modules
D=~/.dsh/profiles/desktop/node_modules/@local
mkdir -p "$D" && ln -sfn /path/to/garmin-panel "$D/garmin-panel"
# 2) 在 profile patch 末尾追加一行
cat >> ~/.dsh/profiles/desktop/cordis.patch.yml <<'YAML'

- insert:
    - id: garmin-panel
      name: '@local/garmin-panel'
YAML
```

保存即热加载，**不用重启 App**；Host 代码改动才需要重启一次。

## 3. 用户侧的安装向导（可以直接贴进 README）

```bash
# 0. 前置：DeepSeek Harness 桌面版（0.2.x）
# 1. 装 MCP 服务端
curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install --python 3.12 "git+https://github.com/Taxuspt/garmin_mcp"
# 2. 装插件
dsh plugin --profile desktop add dsh-garmin-panel
# 3. 打开 Harness → 左侧栏「佳明助手」→ 在面板里直接输入 Garmin 邮箱/密码登录
#    （中国区账号在选择「中国版 garmin.cn」）
```

登录后首次加载约 2–4 秒（要拉 MCP），之后有缓存。

## 4. 隐私与安全（写进 README 的承诺）

- 密码只在本机通过管道传给 `garmin-mcp-auth` 进程，**不落盘、不上传、不写日志**。
- 授权结果是 Garmin OAuth 令牌，存在 `~/.garminconnect`（权限 0700/0600），约 6 个月有效；过期后面板会提示重新登录。
- 面板只调用**只读**的 Garmin 工具（`get_*`）；不提供改名、排课、删除、上传等写操作。
- 插件的 HTTP 路由跑在 DSH 本机 loopback 服务上，同源访问；不额外开端口。
- 插件不含遥测、不含第三方请求；AI 教练使用的是用户自己在 Harness 里配置的模型。

## 5. 兼容性与已知限制

| 限制 | 说明 |
|---|---|
| Host 代码改动 | 需要重启 App（Client 改动热更新，500ms 轮询） |
| `garmin-mcp` 版本 | 工具名会随上游变化；面板只依赖 12 个稳定只读工具，升级前请用 `mcp__garmin__*` 抽查 |
| 慢接口 | FIT 深度分析 30–60s，面板 v1 不自动触发（在对话里用） |
| 数据缺口 | 无称重/无睡眠记录的日期显示空态，不补 0 |
| 多账号 | 一个面板对应一个 `~/.garminconnect`；多账号需要多实例 + `GARMINTOKENS` 分隔 |

## 6. 版本记录建议

- `0.1.x`：面板 v1（KPI/今日/恢复/睡眠/负荷/活动/记录）+ 登录 + 设备列表
- `0.2.0`：AI 教练（分析 + 建议）
- `0.3.0`：可配置卡片、右栏常驻模式
- 每次改动 `package.json` 的 `version`；Host/Client 协议不变时小版本递增即可

## 7. 发布检查清单

- [ ] `node --check index.js && node --check client.js`
- [ ] `package.json` 的 `name` 不是 `@local/*`，`private` 为 `false`
- [ ] `exports["./client"]` 存在且文件是 `window.__ModuleLoader__.load({id: <name>})` 格式
- [ ] `files` 里包含 index/client/patch/locale/icon
- [ ] 图标为方形、≤256 KiB、原创或可再分发
- [ ] 在**干净**的 DSH_HOME 或另一台机器实测一次安装 + 登录
- [ ] README 里写清：需要自己装 `garmin-mcp`、自己登录、令牌有效期
- [ ] 没有把任何 token/个人数据打进包里：`grep -r "garminconnect\|GARMIN_PASSWORD\|token" --include=*.js .` 只应出现在路径字符串和注释里
