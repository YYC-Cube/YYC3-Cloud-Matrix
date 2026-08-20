/**
 * @file: AI Family 类型定义
 * @description: 定义 AI Family 智能体系统的核心类型
 * @module @family-pai/core/ai-family
 * @author: YanYuCloudCube Team

 * @updated: 2026-04-30
 * @version: v1.0.0
 * @created: 2026-04-30
 * @status: active
 * @tags: [ai-family],[agent] */

import type { ChatMessage } from '../types.js'

/**
 * 智能体角色类型
 */
export type AgentRole = 
  | 'meta-oracle'    // 元启·天枢 - 总指挥
  | 'sentinel'       // 智云·守护 - 安全官
  | 'master'         // 格物·宗师 - 质量官
  | 'creative'       // 创想·灵韵 - 创意官
  | 'navigator'      // 言启·千行 - 导航员
  | 'thinker'        // 语枢·万物 - 思考者
  | 'prophet'        // 预见·先知 - 预言家
  | 'bolero'         // 知遇·伯乐 - 推荐官
  | 'commander'      // 指挥官
  | 'coder'          // 代码专家
  | 'multimodal'     // 多模态专家
  | 'predictor'      // 预测专家
  | 'matcher'        // 匹配专家
  | 'security'       // 安全专家
  | 'quality'        // 质量专家

/**
 * 智能体状态
 */
export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline'

/**
 * 推理类型
 */
export type ReasoningType = 
  | 'planning'       // 规划推理
  | 'logical'        // 逻辑推理
  | 'probabilistic'  // 概率推理
  | 'creative'       // 创意推理
  | 'analytical'     // 分析推理
  | 'predictive'     // 预测推理
  | 'evaluative'     // 评估推理

/**
 * 智能体能力定义
 */
export interface AgentCapability {
  name: string
  description: string
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
}

/**
 * 智能体定义
 */
export interface AgentDefinition {
  id: AgentRole
  name: string
  displayName: string
  emoji: string
  role: string
  description: string
  reasoningTypes: ReasoningType[]
  capabilities: AgentCapability[]
  systemPrompt: string
  priority: number
  maxConcurrentTasks: number
}

/**
 * 智能体状态信息
 */
export interface AgentState {
  status: AgentStatus
  currentTask?: string
  lastActiveTime?: Date
  totalTasksCompleted: number
  averageResponseTime: number
  errorCount: number
}

/**
 * 任务优先级
 */
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

/**
 * 任务状态
 */
export type TaskStatus = 
  | 'pending'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

/**
 * 智能体任务
 */
export interface AgentTask {
  id: string
  type: string
  priority: TaskPriority
  input: unknown
  context: TaskContext
  assignedAgent?: AgentRole
  status: TaskStatus
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  result?: unknown
  error?: string
}

/**
 * 任务上下文
 */
export interface TaskContext {
  sessionId: string
  userId?: string
  conversationHistory: ChatMessage[]
  metadata: Record<string, unknown>
  parentTaskId?: string
}

/**
 * 任务结果
 */
export interface TaskResult {
  success: boolean
  output?: unknown
  data?: unknown
  error?: string
  duration: number
  tokens?: {
    input: number
    output: number
  }
  recommendations?: AgentRecommendation[]
  metadata?: Record<string, unknown>
  agentId?: AgentRole
}

/**
 * 智能体推荐
 */
export interface AgentRecommendation {
  agentId: AgentRole
  confidence: number
  reason: string
}

/**
 * 协同模式
 */
export type CollaborationMode = 
  | 'sequential'     // 顺序执行
  | 'parallel'       // 并行执行
  | 'hierarchical'   // 层级执行
  | 'consensus'      // 共识决策

/**
 * 协同任务
 */
export interface CollaborationTask {
  id: string
  mode: CollaborationMode
  agents: AgentRole[]
  participants?: AgentRole[]
  leader?: AgentRole
  tasks: AgentTask[]
  subtasks?: AgentTask[]
  aggregationStrategy?: 'first' | 'best' | 'merge' | 'vote'
  timeout?: number
}

/**
 * 智能体事件
 */
export interface AgentEvent {
  type: 'task_started' | 'task_completed' | 'task_failed' | 'status_changed' | 'error'
  agentId: AgentRole
  taskId?: string
  data?: unknown
  timestamp: Date
}
