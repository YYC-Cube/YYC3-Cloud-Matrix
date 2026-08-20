/**
 * @file: mcp-types.ts
 * @description: YYC³ MCP 协议类型定义 · 浏览器端适配
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[mcp],[types]
 *
 * @brief: Model Context Protocol 类型定义，适配浏览器端使用
 *
 * @details:
 * - MCP 工具定义与调用
 * - MCP 资源与上下文
 * - Agent 注册配置
 * - JSON-RPC 2.0 消息格式
 */

// ============================================================
// 工具系统
// ============================================================

/** MCP 工具参数属性 */
export interface MCPToolProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  enum?: string[];
  default?: unknown;
}

/** MCP 工具定义 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, MCPToolProperty>;
    required?: string[];
  };
}

/** MCP 工具调用请求 */
export interface MCPToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** MCP 内容块 */
export interface MCPContent {
  type: "text" | "image" | "resource";
  text?: string;
  data?: string;
  mimeType?: string;
}

/** MCP 工具调用结果 */
export interface MCPToolResult {
  id: string;
  content: MCPContent[];
  isError?: boolean;
}

/** 工具执行器函数 */
export type MCPToolExecutor = (args: Record<string, unknown>, context: MCPContext) => Promise<MCPToolResult>;

// ============================================================
// 资源系统
// ============================================================

/** MCP 资源定义 */
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// ============================================================
// Agent 注册
// ============================================================

/** MCP Agent 能力声明 */
export interface MCPCapability {
  tools?: boolean;
  resources?: boolean;
  prompts?: boolean;
  streaming?: boolean;
}

/** MCP Agent 配置 */
export interface MCPAgentConfig {
  agentId: string;
  displayName: string;
  capabilities: MCPCapability;
  tools: MCPTool[];
  systemPrompt?: string;
  description?: string;
}

// ============================================================
// 上下文管理
// ============================================================

/** 上下文消息角色 */
export type MCPContextRole = "system" | "user" | "assistant" | "tool";

/** 上下文消息 */
export interface MCPContextMessage {
  role: MCPContextRole;
  content: string;
  timestamp: number;
  toolCallId?: string;
}

/** Agent 运行上下文 */
export interface MCPContext {
  agentId: string;
  messages: MCPContextMessage[];
  maxTokens: number;
  metadata?: Record<string, unknown>;
}

// ============================================================
// JSON-RPC 2.0
// ============================================================

export interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

export const MCP_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

// ============================================================
// 事件系统
// ============================================================

export type MCPEventType =
  | "agent:registered"
  | "agent:unregistered"
  | "tool:called"
  | "tool:result"
  | "tool:error"
  | "context:updated";

export interface MCPCallEvent {
  agentId: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

export interface MCPResultEvent {
  agentId: string;
  toolName: string;
  result: MCPToolResult;
}

export interface MCPErrorEvent {
  agentId: string;
  toolName: string;
  error: Error;
}
