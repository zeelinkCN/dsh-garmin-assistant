#!/usr/bin/env node
/**
 * 把本地插件源码（默认 ~/Documents/deepseek-harness/default-workspace/garmin-panel）
 * 同步进本仓库工作区，用于「正常 commit → tag → release」发布流程。
 *
 * 用法：
 *   node scripts/sync-plugin.mjs 1.6.0            # 同步并写入新版本号
 *   node scripts/sync-plugin.mjs 1.6.0 --src /path/to/garmin-panel
 *
 * 只做复制与少量发布元数据替换，不改插件源码：
 *   - package.json：name/version/private/license/description/repository/keywords
 *   - client.js：模块 id `@local/garmin-panel` → `dsh-garmin-assistant`
 *   - README.md：取工作区的 `佳明助手-README-v3.md`
 *   - docs/：复制发布用截图
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = dirname(dirname(fileURLToPath(import.meta.url)))
const args = process.argv.slice(2)
const version = args.find((a) => /^\d+\.\d+\.\d+$/.test(a))
const srcFlag = args.indexOf('--src')
const src = srcFlag >= 0 ? args[srcFlag + 1] : join(
  homedir(), 'Documents', 'deepseek-harness', 'default-workspace', 'garmin-panel',
)
const workspace = dirname(src)

if (!version) {
  console.error('用法: node scripts/sync-plugin.mjs <x.y.z> [--src <plugin-dir>]')
  process.exit(1)
}
if (!existsSync(join(src, 'index.js')) || !existsSync(join(src, 'client.js'))) {
  console.error(`找不到插件源码: ${src}`)
  process.exit(1)
}

const PUBLISH_FILES = ['index.js', 'client.js', 'icon.svg', 'cordis.patch.yml']
const PUBLISH_DIRS = ['host', 'src', 'locale']

/* 1. 直接复制发布文件/目录 */
for (const file of PUBLISH_FILES) {
  cpSync(join(src, file), join(repo, file))
}
for (const dir of PUBLISH_DIRS) {
  cpSync(join(src, dir), join(repo, dir), { recursive: true })
}
mkdirSync(join(repo, 'scripts'), { recursive: true })
for (const file of ['build-client.mjs', 'check-fragments.mjs']) {
  cpSync(join(src, 'scripts', file), join(repo, 'scripts', file))
}

/* 1b. 发布用 patch：模块名改为仓库包名 */
const patchPath = join(repo, 'cordis.patch.yml')
writeFileSync(
  patchPath,
  readFileSync(patchPath, 'utf8').replaceAll('@local/garmin-panel', 'dsh-garmin-assistant'),
)

/* 2. package.json 发布元数据 */
const pluginPkg = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8'))
const repoPkgPath = join(repo, 'package.json')
const repoPkg = existsSync(repoPkgPath) ? JSON.parse(readFileSync(repoPkgPath, 'utf8')) : {}
const nextPkg = {
  ...pluginPkg,
  name: 'dsh-garmin-assistant',
  version,
  private: false,
  license: 'MIT',
  description:
    'Garmin Assistant (佳明助手) — DeepSeek Harness desktop plugin: official Garmin Personal API dashboard, sleep/HRV, activity tiles with offline tracks, monthly heatmap, AI coach / health steward / nutrition, account settings, card-level personalization.',
  repository: {
    type: 'git',
    url: 'git+https://github.com/zeelinkCN/dsh-garmin-assistant.git',
  },
  keywords: ['deepseek-harness', 'dsh-plugin', 'garmin', 'health', 'fitness'],
}
// 保留仓库中已有的 scripts（例如本同步脚本不会写进 package.json 的 argv），合并而不是覆盖
nextPkg.scripts = { 'build:client': 'node scripts/build-client.mjs' }
writeFileSync(repoPkgPath, JSON.stringify(nextPkg, null, 2) + '\n')

/* 3. client.js 模块 id */
const clientPath = join(repo, 'client.js')
writeFileSync(
  clientPath,
  readFileSync(clientPath, 'utf8').replace("id: '@local/garmin-panel'", "id: 'dsh-garmin-assistant'"),
)

/* 4. README 与截图 */
const readmeSrc = join(workspace, '佳明助手-README-v3.md')
if (existsSync(readmeSrc)) cpSync(readmeSrc, join(repo, 'README.md'))

const shotsSrc = join(workspace, 'garmin-panel-selftest', 'client', 'shots')
const shotMap = {
  'q6-dashboard-dark.png': 'screenshot-dashboard.png',
  'q1-kpi-dark.png': 'screenshot-kpi.png',
  'c1-edit-cards.png': 'screenshot-personalize.png',
  'o1-intro-1280.png': 'screenshot-onboarding.png',
  'a1-steward-keep.png': 'screenshot-steward.png',
  'q8-device-popover.png': 'screenshot-devices.png',
  't1-trends-7.png': 'screenshot-trends.png',
  'a1-hr-zones.png': 'screenshot-hr-zones.png',
  'a5-drawer-fit.png': 'screenshot-fit-curves.png',
  'b1-plan.png': 'screenshot-plan.png',
  'b2-womens-female.png': 'screenshot-womens.png',
  'b4-drawer-deep.png': 'screenshot-analysis.png',
  'b1b-plan-pop.png': 'screenshot-plan-detail.png',
  'rv2-review.png': 'screenshot-review.png',
  'rv3-calendar.png': 'screenshot-calendar.png',
  'rb4-mine-populated.png': 'screenshot-routes.png',
  'rb10-ai-candidates.png': 'screenshot-route-ai.png',
  'rb3-xingzhe-preview.png': 'screenshot-xingzhe.png',
  'rb13-ai-candidates.png': 'screenshot-route-ai.png',
  'rb6-rename-inline.png': 'screenshot-route-edit.png',
  'rb15-mine-highlight.png': 'screenshot-route-saved.png',
  'md2-idle-multi.png': 'screenshot-multi-idle.png',
  'md4-result.png': 'screenshot-multi-result.png',
  'md9-mine-group.png': 'screenshot-trip-group.png',
  'md5-day-elevation.png': 'screenshot-elevation.png',
  'bm1-drawer-basemap.png': 'screenshot-basemap.png',
}
mkdirSync(join(repo, 'docs'), { recursive: true })
for (const [from, to] of Object.entries(shotMap)) {
  const source = join(shotsSrc, from)
  if (existsSync(source)) cpSync(source, join(repo, 'docs', to))
}

console.log(`同步完成: ${src} → ${repo} (v${version})`)
for (const file of PUBLISH_FILES) console.log(`  ${file}`)
for (const dir of PUBLISH_DIRS) console.log(`  ${dir}/`)
console.log('   README.md / docs/*.png / package.json / client.js(id)')
