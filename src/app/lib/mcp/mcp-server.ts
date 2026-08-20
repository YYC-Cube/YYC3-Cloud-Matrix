/**
 * @file: mcp-server.ts
 * @description: YYC³ MCP Server · 浏览器端本地 MCP 服务
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[mcp],[server]
 *
 * @brief: 浏览器端 MCP Server，管理 Agent 注册、工具调用、上下文
 *
 * @details:
 * - 8 位 AI 成员作为 MCP Agent 注册
 * - 工具注册/验证/执行
 * - 上下文窗口管理
 * - 统一事件分发 (替代 DataBus + MusicEventBus 的部分职责)
 * - 单例模式: getMCPServer() / resetMCPServer()
 */

import type {
  MCPAgentConfig,
  MCPTool,
  MCPToolResult,
  MCPToolExecutor,
  MCPContext,
  MCPContextMessage,
  MCPContextRole,
  MCPRequest,
  MCPResponse,
  MCPEventType,
  MCPCallEvent,
  MCPResultEvent,
} from "./mcp-types";
import { MCP_ERROR_CODES } from "./mcp-types";

// ============================================================
// 简易 EventEmitter (零外部依赖)
// ============================================================

type EventHandler = (...args: unknown[]) => void;

class SimpleEmitter {
  private listeners = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  protected emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((h) => {
      try { h(...args); } catch { /* ignore */ }
    });
  }
}

// ============================================================
// MCP Server
// ============================================================

export class YYC3MCPServer extends SimpleEmitter {
  private agents = new Map<string, MCPAgentConfig>();
  private toolExecutors = new Map<string, MCPToolExecutor>();
  private contexts = new Map<string, MCPContext>();
  private requestCounter = 0;

  // ========== Agent 管理 ==========

  /** 注册 Agent */
  registerAgent(config: MCPAgentConfig): void {
    this.agents.set(config.agentId, config);

    // 注册 Agent 的所有工具
    for (const tool of config.tools) {
      // 工具名加上 Agent 前缀避免冲突: {agentId}.{toolName}
      const fullName = `${config.agentId}.${tool.name}`;
      if (!this.toolExecutors.has(fullName)) {
        // 默认执行器: 返回 "未实现" 提示
        this.toolExecutors.set(fullName, this.createDefaultExecutor(tool));
      }
    }

    // 初始化上下文
    if (!this.contexts.has(config.agentId)) {
      this.contexts.set(config.agentId, {
        agentId: config.agentId,
        messages: [],
        maxTokens: 4096,
      });
    }

    this.emit("agent:registered" as MCPEventType, config);
  }

  /** 注销 Agent */
  unregisterAgent(agentId: string): boolean {
    const deleted = this.agents.delete(agentId);
    if (deleted) {
      // 清理该 Agent 的工具执行器
      for (const key of this.toolExecutors.keys()) {
        if (key.startsWith(`${agentId}.`)) {
          this.toolExecutors.delete(key);
        }
      }
      this.contexts.delete(agentId);
      this.emit("agent:unregistered" as MCPEventType, { agentId });
    }
    return deleted;
  }

  /** 获取 Agent 配置 */
  getAgent(agentId: string): MCPAgentConfig | undefined {
    return this.agents.get(agentId);
  }

  /** 获取所有已注册 Agent */
  getAllAgents(): MCPAgentConfig[] {
    return Array.from(this.agents.values());
  }

  // ========== 工具管理 ==========

  /** 注册工具执行器 (覆盖默认) */
  registerToolExecutor(agentId: string, toolName: string, executor: MCPToolExecutor): void {
    const fullName = `${agentId}.${toolName}`;
    this.toolExecutors.set(fullName, executor);
  }

  /** 获取 Agent 的所有工具 */
  getAgentTools(agentId: string): MCPTool[] {
    return this.agents.get(agentId)?.tools ?? [];
  }

  /** 获取所有工具 (跨 Agent) */
  getAllTools(): Array<MCPTool & { agentId: string }> {
    const result: Array<MCPTool & { agentId: string }> = [];
    for (const [agentId, config] of this.agents) {
      for (const tool of config.tools) {
        result.push({ ...tool, agentId });
      }
    }
    return result;
  }

  /** 调用工具 */
  async callTool(agentId: string, toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const fullName = `${agentId}.${toolName}`;
    const executor = this.toolExecutors.get(fullName);

    if (!executor) {
      const errorResult: MCPToolResult = {
        id: `tool-${++this.requestCounter}`,
        content: [{ type: "text", text: `工具 "${fullName}" 未注册` }],
        isError: true,
      };
      return errorResult;
    }

    // 参数校验
    const agent = this.agents.get(agentId);
    const toolDef = agent?.tools.find((t) => t.name === toolName);
    if (toolDef) {
      const validation = this.validateArgs(toolDef, args);
      if (!validation.valid) {
        return {
          id: `tool-${++this.requestCounter}`,
          content: [{ type: "text", text: `参数校验失败: ${validation.errors.join(", ")}` }],
          isError: true,
        };
      }
    }

    const callEvent: MCPCallEvent = { agentId, toolName, arguments: args };
    this.emit("tool:called" as MCPEventType, callEvent);

    try {
      const context = this.contexts.get(agentId) ?? {
        agentId,
        messages: [],
        maxTokens: 4096,
      };
      const result = await executor(args, context);

      const resultEvent: MCPResultEvent = { agentId, toolName, result };
      this.emit("tool:result" as MCPEventType, resultEvent);

      return result;
    } catch (err: unknown) {
      const errorResult: MCPToolResult = {
        id: `tool-${++this.requestCounter}`,
        content: [{ type: "text", text: `工具执行错误: ${(err as Error).message}` }],
        isError: true,
      };

      this.emit("tool:error" as MCPEventType, {
        agentId,
        toolName,
        error: err as Error,
      });

      return errorResult;
    }
  }

  // ========== 上下文管理 ==========

  /** 添加上下文消息 */
  addContextMessage(agentId: string, role: MCPContextRole, content: string, toolCallId?: string): void {
    const ctx = this.contexts.get(agentId);
    if (!ctx) {return;}

    const msg: MCPContextMessage = {
      role,
      content,
      timestamp: Date.now(),
      toolCallId,
    };
    ctx.messages.push(msg);

    // 自动截断: 保留最近的上下文
    const maxMessages = Math.floor(ctx.maxTokens / 50); // 粗略估算
    if (ctx.messages.length > maxMessages) {
      // 保留第一条 system 消息 + 最近的对话
      const systemMsg = ctx.messages.find((m) => m.role === "system");
      ctx.messages = [
        ...(systemMsg ? [systemMsg] : []),
        ...ctx.messages.slice(-maxMessages + 1),
      ];
    }

    this.emit("context:updated" as MCPEventType, { agentId });
  }

  /** 获取上下文 */
  getContext(agentId: string): MCPContextMessage[] {
    return this.contexts.get(agentId)?.messages ?? [];
  }

  /** 清除上下文 */
  clearContext(agentId: string): void {
    const ctx = this.contexts.get(agentId);
    if (ctx) {
      ctx.messages = [];
      this.emit("context:updated" as MCPEventType, { agentId });
    }
  }

  // ========== JSON-RPC 2.0 处理 ==========

  /** 处理 JSON-RPC 请求 */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { id, method, params } = request;

    try {
      let result: unknown;

      switch (method) {
        case "tools/list": {
          const agentId = params?.agentId as string | undefined;
          result = agentId ? this.getAgentTools(agentId) : this.getAllTools();
          break;
        }
        case "tools/call": {
          const { agentId, toolName, arguments: args } = params as {
            agentId: string;
            toolName: string;
            arguments: Record<string, unknown>;
          };
          result = await this.callTool(agentId, toolName, args);
          break;
        }
        case "agents/list": {
          result = this.getAllAgents();
          break;
        }
        case "context/get": {
          const { agentId: aid } = params as { agentId: string };
          result = this.getContext(aid);
          break;
        }
        case "context/add": {
          const { agentId: aid, role, content } = params as {
            agentId: string;
            role: MCPContextRole;
            content: string;
          };
          this.addContextMessage(aid, role, content);
          result = { ok: true };
          break;
        }
        case "context/clear": {
          const { agentId: aid } = params as { agentId: string };
          this.clearContext(aid);
          result = { ok: true };
          break;
        }
        default: {
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: MCP_ERROR_CODES.METHOD_NOT_FOUND,
              message: `Method "${method}" not found`,
            },
          };
        }
      }

      return { jsonrpc: "2.0", id, result };
    } catch (err: unknown) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: MCP_ERROR_CODES.INTERNAL_ERROR,
          message: (err as Error).message,
        },
      };
    }
  }

  // ========== 内部方法 ==========

  private validateArgs(tool: MCPTool, args: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const schema = tool.inputSchema;

    if (schema.required) {
      for (const req of schema.required) {
        if (!(req in args)) {
          errors.push(`缺少必填参数: ${req}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private createDefaultExecutor(tool: MCPTool): MCPToolExecutor {
    return async (args: Record<string, unknown>, _context: MCPContext) => {
      return {
        id: `tool-${++this.requestCounter}`,
        content: [{
          type: "text",
          text: `工具 "${tool.name}" 已注册但尚未实现执行器。参数: ${JSON.stringify(args)}`,
        }],
      };
    };
  }
}

// ============================================================
// 单例
// ============================================================

let _server: YYC3MCPServer | null = null;

export function getMCPServer(): YYC3MCPServer {
  if (!_server) {
    _server = new YYC3MCPServer();
  }
  return _server;
}

export function resetMCPServer(): void {
  _server = null;
}
