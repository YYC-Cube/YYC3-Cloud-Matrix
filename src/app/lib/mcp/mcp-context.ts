/**
 * @file: mcp-context.ts
 * @description: YYC³ MCP 上下文管理器 · Agent 上下文窗口与持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[mcp],[context]
 *
 * @brief: 管理 8 位 AI 成员的上下文窗口，支持摘要压缩与持久化
 *
 * @details:
 * - per-Agent 上下文窗口管理
 * - 自动截断: 超过 maxTokens 时保留 system + 最近对话
 * - 摘要压缩: 将历史消息压缩为摘要 (可选)
 * - localStorage 持久化 (Phase 2E 迁移到 IndexedDB)
 * - 与 MCP Server 集成
 */

import type { MCPContext, MCPContextMessage, MCPContextRole } from "./mcp-types";

// ============================================================
// 常量
// ============================================================

const STORAGE_KEY_PREFIX = "yyc3_mcp_ctx_";
const DEFAULT_MAX_TOKENS = 4096;
const MAX_MESSAGES_BEFORE_TRUNCATE = 100;
const SYSTEM_ROLE: MCPContextRole = "system";

// ============================================================
// 上下文管理器
// ============================================================

export class MCPContextManager {
  private contexts = new Map<string, MCPContext>();

  /** 获取或创建 Agent 上下文 */
  getOrCreate(agentId: string, maxTokens = DEFAULT_MAX_TOKENS): MCPContext {
    let ctx = this.contexts.get(agentId);
    if (!ctx) {
      // 尝试从 localStorage 恢复
      ctx = this.loadFromStorage(agentId) ?? {
        agentId,
        messages: [],
        maxTokens,
      };
      this.contexts.set(agentId, ctx);
    }
    return ctx;
  }

  /** 添加消息到上下文 */
  addMessage(
    agentId: string,
    role: MCPContextRole,
    content: string,
    toolCallId?: string,
  ): void {
    const ctx = this.getOrCreate(agentId);
    const msg: MCPContextMessage = {
      role,
      content,
      timestamp: Date.now(),
      toolCallId,
    };
    ctx.messages.push(msg);

    // 自动截断
    this.truncateIfNeeded(ctx);

    // 持久化
    this.saveToStorage(ctx);
  }

  /** 获取上下文消息 (可选限制条数) */
  getMessages(agentId: string, limit?: number): MCPContextMessage[] {
    const ctx = this.contexts.get(agentId);
    if (!ctx) {return [];}
    if (limit && ctx.messages.length > limit) {
      // 保留 system 消息 + 最近的 limit 条
      const systemMsgs = ctx.messages.filter((m) => m.role === SYSTEM_ROLE);
      const nonSystem = ctx.messages.filter((m) => m.role !== SYSTEM_ROLE);
      return [...systemMsgs, ...nonSystem.slice(-limit)];
    }
    return ctx.messages;
  }

  /** 获取完整上下文 */
  getContext(agentId: string): MCPContext | undefined {
    return this.contexts.get(agentId);
  }

  /** 清除 Agent 上下文 */
  clearContext(agentId: string): void {
    const ctx = this.contexts.get(agentId);
    if (ctx) {
      ctx.messages = [];
      this.saveToStorage(ctx);
    }
  }

  /** 注入 system prompt */
  setSystemPrompt(agentId: string, prompt: string): void {
    const ctx = this.getOrCreate(agentId);
    // 移除已有 system 消息
    ctx.messages = ctx.messages.filter((m) => m.role !== SYSTEM_ROLE);
    // 插入到最前面
    ctx.messages.unshift({
      role: SYSTEM_ROLE,
      content: prompt,
      timestamp: Date.now(),
    });
    this.saveToStorage(ctx);
  }

  /** 获取上下文统计信息 */
  getStats(agentId: string): { messageCount: number; estimatedTokens: number; oldestTimestamp: number | null } {
    const ctx = this.contexts.get(agentId);
    if (!ctx || ctx.messages.length === 0) {
      return { messageCount: 0, estimatedTokens: 0, oldestTimestamp: null };
    }
    return {
      messageCount: ctx.messages.length,
      estimatedTokens: this.estimateTokens(ctx),
      oldestTimestamp: ctx.messages[0]?.timestamp ?? null,
    };
  }

  /** 获取所有已注册 Agent ID */
  getRegisteredAgentIds(): string[] {
    return Array.from(this.contexts.keys());
  }

  // ========== 内部方法 ==========

  /** 自动截断 */
  private truncateIfNeeded(ctx: MCPContext): void {
    if (ctx.messages.length <= MAX_MESSAGES_BEFORE_TRUNCATE) {
      return;
    }

    const estimatedTokens = this.estimateTokens(ctx);
    if (estimatedTokens <= ctx.maxTokens) {
      return;
    }

    // 保留 system 消息 + 最近的对话
    const systemMsgs = ctx.messages.filter((m) => m.role === SYSTEM_ROLE);
    const nonSystemMsgs = ctx.messages.filter((m) => m.role !== SYSTEM_ROLE);

    // 计算需要保留的非 system 消息数量
    const avgTokensPerMsg = estimatedTokens / ctx.messages.length;
    const systemTokens = systemMsgs.reduce((sum, m) => sum + this.tokenCount(m.content), 0);
    const budgetForNonSystem = ctx.maxTokens - systemTokens;
    const keepCount = Math.max(10, Math.floor(budgetForNonSystem / avgTokensPerMsg));

    ctx.messages = [
      ...systemMsgs,
      ...nonSystemMsgs.slice(-keepCount),
    ];
  }

  /** 粗略 token 估算 (1 字 ≈ 0.5 token, 中文略多) */
  private estimateTokens(ctx: MCPContext): number {
    return ctx.messages.reduce((sum, m) => sum + this.tokenCount(m.content), 0);
  }

  private tokenCount(text: string): number {
    // 简化估算: ASCII 1字≈0.25token, CJK 1字≈1.5token
    let tokens = 0;
    for (const ch of text) {
      tokens += ch.charCodeAt(0) > 0x7f ? 1.5 : 0.25;
    }
    return Math.ceil(tokens);
  }

  /** localStorage 持久化 */
  private saveToStorage(ctx: MCPContext): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${ctx.agentId}`;
      localStorage.setItem(key, JSON.stringify({
        agentId: ctx.agentId,
        messages: ctx.messages.slice(-50), // 最多保存 50 条
        maxTokens: ctx.maxTokens,
        savedAt: Date.now(),
      }));
    } catch { /* ignore */ }
  }

  /** 从 localStorage 加载 */
  private loadFromStorage(agentId: string): MCPContext | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${agentId}`);
      if (!raw) {return null;}
      const parsed = JSON.parse(raw);
      return {
        agentId: parsed.agentId,
        messages: parsed.messages ?? [],
        maxTokens: parsed.maxTokens ?? DEFAULT_MAX_TOKENS,
      };
    } catch {
      return null;
    }
  }
}

// ============================================================
// 单例
// ============================================================

let _manager: MCPContextManager | null = null;

export function getMCPContextManager(): MCPContextManager {
  if (!_manager) {
    _manager = new MCPContextManager();
  }
  return _manager;
}

export function resetMCPContextManager(): void {
  _manager = null;
}
