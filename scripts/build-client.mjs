#!/usr/bin/env node
/**
 * 构建 client.js：把 src/client/*.js 片段按文件名顺序拼成单文件。
 *
 * client.js 是 DSH 浏览器模块加载器消费的产物，必须是自包含的一段
 * `window.__ModuleLoader__.load({ id, factory(require) { ... } })`。
 * 因此片段采用「同一 factory 作用域内的拼接式拆分」：
 *   00-header.js   加载器外壳 + require + 顶层常量（factory 开括号在这里）
 *   10-styles.js   CSS 模板字符串
 *   20-utils.js    日期 / 格式化 / 布局持久化 / 请求等纯函数
 *   30-charts.js   全部内联 SVG 图形组件
 *   40-sections.js 板块与卡片组件（含骨架屏、布局槽位）
 *   50-workshop.js 路书工坊
 *   60-modals.js   登录 / 解锁 / 引导 / 账号 / 抽屉 / 弹层
 *   70-app.js      DateNav、Page、面板图标与 inject/apply 导出（factory 闭括号在这里）
 *
 * 片段之间没有 import/export：它们共享同一个函数作用域，声明顺序即执行顺序。
 * 因此拼接结果与拆分前的 client.js 等价（只换了位置，没有改写代码）。
 *
 * 用法：
 *   node scripts/build-client.mjs            # 生成 client.js
 *   node scripts/build-client.mjs --check    # 只校验 client.js 是否与片段一致（CI 用）
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const SRC_DIR = join(ROOT, 'src', 'client')
const OUT_FILE = join(ROOT, 'client.js')
const HEADER = '/* AUTO-GENERATED from src/client/*.js — do not edit directly */'

/** 片段文件名即排序依据（00 → 70），只取 .js */
const fragments = readdirSync(SRC_DIR)
  .filter((name) => name.endsWith('.js'))
  .sort()

if (!fragments.length) {
  console.error(`[build-client] no fragments in ${SRC_DIR}`)
  process.exit(1)
}

const bodies = new Map(fragments.map((name) => [name, readFileSync(join(SRC_DIR, name), 'utf8')]))

/* 拼接式拆分的前提：每个片段以换行结尾，否则会把下一片段的第一行接到注释/语句后面 */
for (const [name, text] of bodies) {
  if (!text.endsWith('\n')) {
    console.error(`[build-client] fragment must end with a newline: ${name}`)
    process.exit(1)
  }
}

/* 加载器契约：首片段开 factory，末片段闭 factory + load() */
const first = bodies.get(fragments[0])
const last = bodies.get(fragments[fragments.length - 1])
if (!first.startsWith('window.__ModuleLoader__.load({')) {
  console.error(`[build-client] ${fragments[0]} must start with window.__ModuleLoader__.load({`)
  process.exit(1)
}
if (!last.trimEnd().endsWith('})')) {
  console.error(`[build-client] ${fragments[fragments.length - 1]} must close the loader with })`)
  process.exit(1)
}

const body = fragments.map((name) => bodies.get(name)).join('')

const output = `${HEADER}\n${body}`

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(OUT_FILE, 'utf8')
  } catch {
    console.error('[build-client] client.js missing — run `node scripts/build-client.mjs`')
    process.exit(1)
  }
  if (current !== output) {
    console.error('[build-client] client.js is stale — run `node scripts/build-client.mjs`')
    process.exit(1)
  }
  console.log(`[build-client] up to date (${fragments.length} fragments)`)
  process.exit(0)
}

writeFileSync(OUT_FILE, output)

const lines = output.split('\n').length - 1
console.log(`[build-client] ${fragments.length} fragments -> client.js (${lines} lines)`)
for (const name of fragments) {
  const n = bodyOf(name).split('\n').length - 1
  console.log(`  ${name.padEnd(16)} ${String(n).padStart(6)} lines`)
}

function bodyOf(name) {
  return readFileSync(join(SRC_DIR, name), 'utf8')
}
