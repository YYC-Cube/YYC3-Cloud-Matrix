/**
 * @file: agent-base.ts
 * @description: YYC³ Agent 基类 · 状态机驱动 + MCP 工具调用
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent]
 *
 * @brief: AIAgent 抽象基类，定义 think → act → report 生命周期
 */

import { getMCPServer } from "../mcp/mcp-server";
import { getMCPContextManager } from "../mcp/mcp-context";
import type { AgentConfig, AgentState, AgentStatus, AgentTask, AgentStep } from "./agent-types";
import type { MCPToolResult } from "../mcp/mcp-types";

// ============================================================
// Agent 基类
// ============================================================

export abstract class AIAgent {
  readonly config: AgentConfig;
  private _state: AgentState = "idle";
  private _currentTaskId: string | null = null;
  private _completedTasks = 0;
  private _errorCount = 0;
  private _lastActiveAt = 0;
  private abortController: AbortController | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  // ========== 属性 ==========

  get agentId(): string { return this.config.agentId; }
  get displayName(): string { return this.config.displayName; }
  get state(): AgentState { return this._state; }
  get currentTaskId(): string | null { return this._currentTaskId; }

  /** 状态快照 */
  getStatus(): AgentStatus {
    return {
      agentId: this.agentId,
      state: this._state,
      currentTaskId: this._currentTaskId,
      completedTasks: this._completedTasks,
      lastActiveAt: this._lastActiveAt,
      errorCount: this._errorCount,
    };
  }

  // ========== 生命周期 ==========

  /** 执行任务 */
  async execute(task: AgentTask): Promise<AgentTask> {
    if (this._state !== "idle") {
      return { ...task, status: "failed", error: `Agent ${this.agentId} busy (state: ${this._state})` };
    }

    this._currentTaskId = task.id;
    this._state = "thinking";
    this._lastActiveAt = Date.now();
    this.abortController = new AbortController();

    try {
      // 1. Think: 分析任务
      this._state = "thinking";
      await this.think(task);

      // 2. Act: 执行步骤
      this._state = "executing";
      const steps = task.steps.length > 0 ? task.steps : this.planSteps(task);

      for (const step of steps) {
        if (this.abortController.signal.aborted) {
          return { ...task, status: "cancelled" };
        }

        step.status = "running";
        step.startedAt = Date.now();

        try {
          const result = await this.act(step.toolName, step.args);
          step.result = result;
          step.status = "done";
        } catch (err: unknown) {
          step.result = (err as Error).message;
          step.status = "failed";
          this._errorCount++;
        }

        step.completedAt = Date.now();
      }

      // 3. Report
      this._state = "reporting";
      const report = await this.report(task, steps);

      this._completedTasks++;
      this._lastActiveAt = Date.now();

      return {
        ...task,
        status: "completed",
        steps,
        result: report,
        completedAt: Date.now(),
      };
    } catch (err: unknown) {
      this._errorCount++;
      return {
        ...task,
        status: "failed",
        error: (err as Error).message,
        completedAt: Date.now(),
      };
    } finally {
      this._state = "idle";
      this._currentTaskId = null;
      this.abortController = null;
    }
  }

  /** 中止当前任务 */
  abort(): void {
    this.abortController?.abort();
  }

  // ========== 抽象方法 (子类实现) ==========

  /** 分析任务，注入上下文 */
  protected abstract think(task: AgentTask): Promise<void>;

  /** 将任务分解为执行步骤 (默认实现) */
  protected planSteps(task: AgentTask): AgentStep[] {
    return [{
      id: `${task.id}-step-1`,
      toolName: "default",
      args: { description: task.description },
      status: "pending",
    }];
  }

  /** 汇报任务结果 */
  protected abstract report(task: AgentTask, steps: AgentStep[]): Promise<unknown>;

  // ========== 工具调用 ==========

  /** 调用 MCP 工具 */
  protected async act(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const server = getMCPServer();
    return server.callTool(this.agentId, toolName, args);
  }

  /** 注入消息到上下文 */
  protected addContext(role: "user" | "system" | "assistant", content: string): void {
    const ctxMgr = getMCPContextManager();
    ctxMgr.addMessage(this.agentId, role, content);
  }

  /** 获取上下文 */
  protected getContext() {
    const ctxMgr = getMCPContextManager();
    return ctxMgr.getMessages(this.agentId);
  }
}
