/**
 * 佳明面板 · Host 半 / 插件装配
 *
 * 创建 MCP 客户端、Personal API 客户端、安装器与登录流程，
 * 在 ctx.effect 中注册 HTTP 路由（host/routes.js）并管理销毁。
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

import { BIN_DIR, DEFAULT_AUTH_BIN, DEFAULT_BIN, IS_WIN, STALE_AFTER_MS, UV_BIN, advancedOn, cache, log, resolveDay, resolveUvBin } from './config.js'
import { GarminMcp } from './mcp.js'
import { PersonalApi } from './official.js'
import { createRoadbook } from './roadbook.js'
import { createRoutes } from './routes.js'

/* ------------------------------------------------------------------ *
 * 高级模式安装器：uv 缺失先装 uv，再 uv tool install garmin-mcp
 * 同一时刻只跑一个安装；stdout/stderr 按行进环形缓冲（≤200 行）
 * ------------------------------------------------------------------ */
export class InstallRunner {
  constructor({ uvBin = UV_BIN, onDone } = {}) {
    this.uvBin = uvBin
    this.onDone = onDone
    this.running = false
    this.done = false
    this.failed = false
    this.lines = []
    this.child = null
  }

  snapshot() {
    return { running: this.running, done: this.done, failed: this.failed, lines: this.lines.slice(-200) }
  }

  start() {
    if (this.running) return false
    this.running = true
    this.done = false
    this.failed = false
    this.lines = []
    log('开始安装高级模式（uv tool install garmin-mcp）')
    this.#run()
      .then(() => this.#push('✓ 安装完成'))
      .catch((err) => {
        this.failed = true
        this.#push(`✗ ${String(err?.message ?? err)}`)
      })
      .finally(() => {
        this.running = false
        this.done = true
        log(this.failed ? '高级模式安装失败' : '高级模式安装完成')
        try { this.onDone?.(this.failed) } catch (err) {
          log('安装完成回调失败：', String(err?.message ?? err))
        }
      })
    return true
  }

  #push(text) {
    const clean = String(text).replace(/\u001b\[[0-9;]*m/g, '').replace(/\r/g, '')
    for (const raw of clean.split('\n')) {
      const line = raw.trimEnd()
      if (!line.trim()) continue
      this.lines.push(line)
      if (this.lines.length > 200) this.lines.splice(0, this.lines.length - 200)
    }
  }

  #spawn(cmd, args) {
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        PATH: [
          join(homedir(), '.local', 'bin'),
          join(homedir(), '.cargo', 'bin'),
          process.env.PATH ?? '',
        ].filter(Boolean).join(':'),
      }
      let proc
      try {
        proc = spawn(cmd, args, { env, stdio: ['ignore', 'pipe', 'pipe'] })
      } catch (err) {
        reject(err)
        return
      }
      this.child = proc
      for (const stream of [proc.stdout, proc.stderr]) {
        stream?.setEncoding('utf8')
        let buffer = ''
        stream?.on('data', (chunk) => {
          buffer += chunk
          let index
          while ((index = buffer.indexOf('\n')) >= 0) {
            this.#push(buffer.slice(0, index))
            buffer = buffer.slice(index + 1)
          }
          if (buffer.length > 4000) {
            this.#push(buffer)
            buffer = ''
          }
        })
        stream?.on('end', () => {
          if (buffer) {
            this.#push(buffer)
            buffer = ''
          }
        })
      }
      proc.on('error', reject)
      proc.on('exit', (code) => {
        this.child = null
        resolve(code ?? 1)
      })
    })
  }

  async #run() {
    if (!existsSync(this.uvBin)) {
      this.#push(IS_WIN
        ? '未找到 uv，正在通过 astral.sh 安装（PowerShell）…'
        : '未找到 uv，正在通过 astral.sh 安装…')
      const code = IS_WIN
        ? await this.#spawn('powershell', [
            '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
            'irm https://astral.sh/uv/install.ps1 | iex',
          ])
        : await this.#spawn('sh', ['-c', 'curl -LsSf https://astral.sh/uv/install.sh | sh'])
      if (code !== 0) throw new Error(`uv 安装失败（退出码 ${code}）`)
      this.uvBin = resolveUvBin()
      if (!existsSync(this.uvBin)) throw new Error(`uv 安装后仍找不到：${this.uvBin}`)
    } else {
      this.#push(`已找到 uv：${this.uvBin}`)
    }
    this.#push('开始安装 garmin-mcp（uv tool install）…')
    const code = await this.#spawn(this.uvBin, [
      'tool', 'install', '--python', '3.12', 'git+https://github.com/Taxuspt/garmin_mcp',
    ])
    if (code !== 0) throw new Error(`garmin-mcp 安装失败（退出码 ${code}）`)
    if (!existsSync(DEFAULT_BIN)) {
      this.#push(`提示：${DEFAULT_BIN} 尚未出现，可能需要重新打开终端或检查 uv 的 bin 目录（${BIN_DIR}）`)
    }
  }
}

export function createPlugin(ctx, config = {}) {
  const mcp = new GarminMcp(config.mcpBin || DEFAULT_BIN)
  const personal = new PersonalApi()
  const installer = new InstallRunner({
    uvBin: config.uvBin || UV_BIN,
    onDone: () => {
      // 安装完成后重新探测高级模式，并清掉旧缓存
      cache.clear()
      mcp.stop()
      mcp.ensure().catch((err) => log('安装后重连失败：', String(err?.message ?? err)))
    },
  })

  ctx.effect(() => {
    // 官方模式不需要 MCP，只有高级模式才预热；失败不阻塞插件激活
    if (advancedOn()) {
      mcp.ensure().catch((err) => log('预热失败：', String(err?.message ?? err)))
    }
    return () => mcp.stop()
  }, 'garmin-panel: mcp')

  const json = (res, code, payload) => {
    const body = JSON.stringify(payload)
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(body)
  }

  const readJson = (req) =>
    new Promise((resolve, reject) => {
      let raw = ''
      req.setEncoding('utf8')
      req.on('data', (chunk) => {
        raw += chunk
        if (raw.length > 100_000) {
          req.destroy()
          reject(new Error('请求体过大'))
        }
      })
      req.on('end', () => {
        try { resolve(raw ? JSON.parse(raw) : {}) } catch (err) { reject(new Error(`JSON 解析失败：${err.message}`)) }
      })
      req.on('error', reject)
    })


  /* ---------------- Garmin 登录（面板内完成认证） ---------------- */
  class LoginFlow {
    constructor({ bin, onSuccess }) {
      this.bin = bin
      this.onSuccess = onSuccess
      this.state = 'idle'
      this.error = null
      this.proc = null
      this.buffer = ''
      this.settle = null
    }

    snapshot() {
      return { state: this.state, error: this.error }
    }

    start({ email, password, region }) {
      if (!email || !password) return Promise.resolve({ state: 'failed', error: '请填写邮箱和密码' })
      try { this.proc?.kill() } catch { /* ignore */ }
      this.buffer = ''
      this.error = null
      this.#emit('starting')
      const args = region === 'cn' ? ['--is-cn'] : []
      const proc = spawn(this.bin, args, {
        env: { ...process.env, GARMIN_EMAIL: email, GARMIN_PASSWORD: password },
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      this.proc = proc
      const onData = (chunk) => {
        this.buffer = (this.buffer + chunk).slice(-8000)
        if (/Enter MFA code/i.test(this.buffer) && this.state === 'starting') {
          this.state = 'mfa'
          return
        }
        if (/SUCCESS:|Authentication successful|Existing tokens are valid/.test(this.buffer)) {
          this.#done(true)
        } else if (/✗ Authentication failed|Too many requests|Network error|Authentication request failed/i.test(this.buffer)) {
          this.#done(false)
        }
      }
      proc.stdout.setEncoding('utf8')
      proc.stderr.setEncoding('utf8')
      proc.stdout.on('data', onData)
      proc.stderr.on('data', onData)
      proc.on('error', (err) => this.#done(false, String(err?.message ?? err)))
      proc.on('exit', (code) => {
        if (this.proc !== proc) return
        this.proc = null
        if (this.state === 'mfa') return
        this.#done(code === 0 && /SUCCESS:|Authentication successful|Existing tokens are valid/.test(this.buffer))
      })
      return this.#wait(120_000)
    }

    submitMfa(code) {
      if (this.state !== 'mfa' || !this.proc) {
        return Promise.resolve({ state: 'failed', error: '当前没有等待 MFA 验证码' })
      }
      try {
        this.proc.stdin.write(String(code).trim() + '\n')
      } catch (err) {
        return Promise.resolve({ state: 'failed', error: String(err?.message ?? err) })
      }
      this.state = 'verifying'
      return this.#wait(120_000)
    }

    #emit(state) {
      this.state = state
      const settle = this.settle
      this.settle = null
      settle?.(this.snapshot())
    }

    #done(ok, err = null) {
      if (this.state === 'ok' || this.state === 'failed') return
      if (ok) {
        this.state = 'ok'
        this.error = null
        try { this.onSuccess?.() } catch (e) { log('登录后重连失败：', String(e?.message ?? e)) }
      } else {
        const line = this.buffer
          .split(/[\r\n]+/)
          .filter((l) => /✗|Error|Invalid|failed|MFA/i.test(l))
          .slice(-1)[0]
        this.state = 'failed'
        this.error = err || line || '登录失败'
      }
      const settle = this.settle
      this.settle = null
      settle?.(this.snapshot())
    }

    #wait(ms) {
      if (this.state === 'ok' || this.state === 'failed') return Promise.resolve(this.snapshot())
      return new Promise((resolve) => {
        const timer = setTimeout(() => this.#done(false, '登录超时（网络或 Garmin 响应慢）'), ms)
        this.settle = (snap) => {
          clearTimeout(timer)
          resolve(snap)
        }
      })
    }
  }

  const loginFlow = new LoginFlow({
    bin: config.authBin || DEFAULT_AUTH_BIN,
    onSuccess: () => {
      cache.clear()
      mcp.stop()
      mcp.ensure().catch((err) => log('登录后重连失败：', String(err?.message ?? err)))
    },
  })

  const dateOf = (url) => resolveDay(url.searchParams.get('date'))

  /** 高级模式登录（保留原 login 流程，另给 /setup/advanced/login 别名） */
  const startLogin = async (url, req) => {
    const body = await readJson(req)
    return loginFlow.start({
      email: String(body.email || '').trim(),
      password: String(body.password || ''),
      region: body.region === 'cn' ? 'cn' : 'intl',
    })
  }

  // 路书工坊：行者 GPX / 高德骑行规划 / GPX 导入（独立路由组，失败不影响其余路由）
  const roadbook = createRoadbook({ ctx, config, json })

  ctx.effect(() => {
    const disposers = createRoutes({ ctx, mcp, personal, installer, loginFlow, startLogin, roadbook, json, readJson, dateOf })
      .map((r) => ctx.webServer.register(r))
    // 关闭可能还挂着的 8765 OAuth 回调服务
    disposers.push(() => roadbook.dispose())
    return () => disposers.forEach((dispose) => dispose())
  }, 'garmin-panel: routes')

  // 兜底：缓存超过 30 分钟由 TTL 控制；这里仅暴露常量给诊断
  void STALE_AFTER_MS
}
