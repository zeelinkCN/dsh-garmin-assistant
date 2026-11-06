#!/usr/bin/env node
/**
 * 语法校验：对每个片段跑 `node --check`。
 *
 * client.js 是一个完整的模块加载器外壳，拆分后：
 *   - 00-header.js 只有 factory 的开括号（末尾未闭合）
 *   - 70-app.js    只有 factory 的闭括号（开头未闭合）
 * 这两个片段单独看必然不是完整程序，所以校验时把它们放回拼接上下文：
 * 每个片段都被拼进「头 + 片段 + 尾」的临时文件再交给 node --check，
 * 片段的字节本身不做任何改写。生成的 client.js 另有完整校验。
 *
 * 用法：node scripts/check-fragments.mjs
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const SRC_DIR = join(ROOT, 'src', 'client')
const OUT_FILE = join(ROOT, 'client.js')
const HEADER_FILE = '00-header.js'
const TAIL_FILE = '70-app.js'

const fragments = readdirSync(SRC_DIR).filter((name) => name.endsWith('.js')).sort()
const header = readFileSync(join(SRC_DIR, HEADER_FILE), 'utf8')
const tail = readFileSync(join(SRC_DIR, TAIL_FILE), 'utf8')
const work = mkdtempSync(join(tmpdir(), 'gp-fragments-'))
let failed = 0

const check = (label, path) => {
  const res = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' })
  if (res.status === 0) {
    console.log(`  ✓ ${label}`)
    return true
  }
  failed++
  console.log(`  ✗ ${label}\n${res.stderr.trim().split('\n').slice(0, 4).join('\n')}`)
  return false
}

console.log('[check-fragments] standalone node --check（片段自身语法）')
for (const name of fragments) {
  const path = join(SRC_DIR, name)
  const res = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' })
  const boundary = name === HEADER_FILE || name === TAIL_FILE
  if (res.status === 0) console.log(`  ✓ ${name}`)
  else if (boundary) console.log(`  · ${name}（作用域边界片段，单独校验必然不闭合，见下）`)
  else check(name, path)
}

console.log('[check-fragments] contextual node --check（头 + 片段 + 尾）')
for (const name of fragments) {
  const body = readFileSync(join(SRC_DIR, name), 'utf8')
  const prefix = name === HEADER_FILE ? '' : header
  const suffix = name === TAIL_FILE ? '' : tail
  const path = join(work, `check-${name}`)
  writeFileSync(path, prefix + body + suffix)
  check(name, path)
}

console.log('[check-fragments] 产物 node --check（client.js 完整程序）')
check('client.js', OUT_FILE)

rmSync(work, { recursive: true, force: true })
if (failed) {
  console.error(`[check-fragments] ${failed} failed`)
  process.exit(1)
}
console.log('[check-fragments] all ok')
