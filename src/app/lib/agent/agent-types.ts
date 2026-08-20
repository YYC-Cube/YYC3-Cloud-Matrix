/**
 * @file: agent-types.ts
 * @description: YYC³ Agent 编排类型定义 · 8 位 AI 成员可编排 Agent
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent],[types]
 *
 * @brief: Agent 编排核心类型 — 状态、任务、计划、协作
 */

// ============================================================
// Agent 状态
// ============================================================

/** Agent 运行状态 */
export type AgentState =
  | "idle"        // 空闲，等待任务
  | "thinking"    // 正在推理
  | "executing"   // 正在执行工具
  | "waiting"     // 等待其他 Agent 完成
  | "reporting"   // 汇报结果
  | "error";      // 出错

/** Agent 能力标签 */
export type AgentCapability =
  | "nlu"           // 自然语言理解
  | "data-analysis" // 数据分析
  | "prediction"    // 预测
  | "recommendation" // 推荐
  | "orchestration" // 编排
  | "security"      // 安全
  | "code-review"   // 代码审查
  | "creative";     // 创意

/** Agent 配置 */
export interface AgentConfig {
  agentId: string;
  displayName: string;
  capabilities: AgentCapability[];
  systemPrompt: string;
  maxConcurrentTasks: number;
}

/** Agent 状态快照 */
export interface AgentStatus {
  agentId: string;
  state: AgentState;
  currentTaskId: string | null;
  completedTasks: number;
  lastActiveAt: number;
  errorCount: number;
}

// ============================================================
// 任务系统
// ============================================================

/** 任务优先级 */
export type TaskPriority = "critical" | "high" | "normal" | "low";

/** 任务状态 */
export type TaskStatus =
  | "pending"      // 等待分配
  | "assigned"     // 已分配
  | "in_progress"  // 执行中
  | "completed"    // 已完成
  | "failed"       // 失败
  | "cancelled";   // 已取消

/** 单步执行 */
export interface AgentStep {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "running" | "done" | "failed";
  assigneeId?: string;    // 执行者 Agent ID
  startedAt?: number;
  completedAt?: number;
}

/** 任务定义 */
export interface AgentTask {
  id: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string | null;   // 主负责 Agent
  steps: AgentStep[];
  dependencies: string[];      // 依赖其他任务 ID
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: unknown;
  error?: string;
}

/** 执行计划 */
export interface AgentPlan {
  id: string;
  taskId: string;
  steps: AgentStep[];
  orchestratorId: string;     // 编排者 Agent ID
  createdAt: number;
}

// ============================================================
// Agent 间通信
// ============================================================

/** Agent 间消息类型 */
export type AgentMessageType =
  | "task_request"    // 请求执行任务
  | "task_result"     // 返回任务结果
  | "task_delegate"   // 委派任务给其他 Agent
  | "context_share"   // 共享上下文
  | "query"           // 查询其他 Agent
  | "response"        // 响应查询
  | "notification";   // 通知

/** Agent 间消息 */
export interface AgentMessage {
  id: string;
  from: string;
  to: string | "*";       // "*" = 广播
  type: AgentMessageType;
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/** 协作组 */
export interface AgentCollaboration {
  id: string;
  members: string[];       // Agent IDs
  sharedContext: Record<string, unknown>;
  goal: string;
  status: "active" | "completed" | "failed";
  createdAt: number;
}

// ============================================================
// 编排决策
// ============================================================

/** 任务分解结果 */
export interface TaskDecomposition {
  taskId: string;
  subtasks: Array<{
    description: string;
    suggestedAssignee: string;
    priority: TaskPriority;
    dependencies: string[];
  }>;
}

/** Agent 选择理由 */
export interface AgentSelection {
  agentId: string;
  score: number;          // 0-1 匹配度
  reason: string;
}
