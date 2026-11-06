# 发布流程（v1.5.1 之后约定）

从 **v1.6.0** 起使用标准的 `commit → tag → release` 流程，**不再 force push**。

## 开发源

- 插件源码在 `~/Documents/deepseek-harness/default-workspace/garmin-panel/`
  - `src/client/*.js` 是客户端源码，`client.js` 是构建产物（`node scripts/build-client.mjs`）
  - `host/*.js` 是 Host 模块，`index.js` 是入口
- 本仓库是**发布产物**，不要直接手改 `client.js` / `host/` / `src/`（会被同步覆盖）

## 一次发布

```bash
# 1. 在插件源码目录构建并跑测试
cd ~/Documents/deepseek-harness/default-workspace/garmin-panel
node scripts/build-client.mjs
node scripts/build-client.mjs --check
#（在 garmin-panel-selftest 跑 Client/Host 全套）

# 2. 同步到本仓库并写入版本号（semver）
cd ~/Documents/deepseek-harness/default-workspace/dsh-garmin-assistant
node scripts/sync-plugin.mjs 1.6.0

# 3. 检查 diff 后提交（正常 commit，不 force）
git status
git add -A
git commit -m "feat: v1.6.0 — <一句话>"
git push origin main

# 4. 打 tag 并推送
git tag v1.6.0
git push origin v1.6.0

# 5. 创建 GitHub Release
gh release create v1.6.0 \
  --title "v1.6.0 — <标题>" \
  --notes-file /tmp/release-notes.md
```

## 版本约定

- **patch**：修 bug、文案、样式
- **minor**：新功能（向后兼容）
- **major**：破坏性变更（配置格式、安装方式）

## 注意

- 发布前必须确认：Client 12 套 / Host 11 套测试全绿，`node --check` 通过
- `README.md` 与截图由 `sync-plugin.mjs` 从工作区复制，先改工作区版本再同步
- 插件管理器的安装方式：profile `package.json` 的 `dependencies` + `dsh.profile.bundles`，配合 `cordis.patch.yml` 的 id config 覆盖
