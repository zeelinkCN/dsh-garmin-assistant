/**
 * 佳明面板 · Host 半（入口）
 *
 * 实际实现按职责拆在 host/*.js：
 *  - config.js   常量 / 路径 / 缓存 / 日期 / 小工具
 *  - official.js 官方 Personal API 客户端与构建器
 *  - mcp.js      高级模式 MCP 客户端与构建器
 *  - llm.js      AI 教练 / 健康管家 / 营养助手
 *  - roadbook.js 路书工坊
 *  - routes.js   HTTP 路由表
 *  - plugin.js   apply 装配
 */
import { createPlugin } from './host/plugin.js'

export const name = 'garmin-panel'
export const inject = ['webServer']

export function apply(ctx, config = {}) {
  return createPlugin(ctx, config)
}
