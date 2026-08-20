/**
 * @file: MCP 客户端入口
 * @description: 导出 MCP 客户端和传输层实现
 * @module @family-pai/core/mcp
 * @author: YanYuCloudCube Team

 * @updated: 2026-04-30
 * @version: v1.0.0
 * @created: 2026-04-30
 * @status: active
 * @tags: [mcp] */

export { MCPClient } from './client.js'
export { StdioTransport, HTTPTransport } from './transport.js'
export type { MCPTransport, MCPMessage, MCPTool, MCPResource } from './types.js'
