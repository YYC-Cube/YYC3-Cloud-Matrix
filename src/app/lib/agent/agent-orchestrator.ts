/**
 * @file: agent-orchestrator.ts
 * @description: YYC³ Agent 编排器 · 任务分解、分配、多 Agent 协作
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent],[orchestrator]
 *
 * @brief: 统一编排 8 位 Agent，负责任务分解、分配、协调、冲突解决
 */

import { AIAgent } from "./agent-base";
import { getMCPContextManager } from "../mcp/mcp-context";
import type {
  AgentTask,
  AgentStatus,
  TaskPriority,
  TaskDecomposition,
  AgentSelection,
  AgentMessage,
  AgentCollaboration,
} from "./agent-types";

// ============================================================
// 编排器
// ============================================================

export class AgentOrchestrator {
  private agents = new Map<string, AIAgent>();
  private tasks = new Map<string, AgentTask>();
  private collaborations = new Map<string, AgentCollaboration>();
  private messageQueue: AgentMessage[] = [];
  private taskCounter = 0;

  // ========== Agent 管理 ==========

  /** 注册 Agent */
  registerAgent(agent: AIAgent): void {
    this.agents.set(agent.agentId, agent);
  }

  /** 注销 Agent */
  unregisterAgent(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  /** 获取所有 Agent */
  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  /** 获取所有 Agent 状态 */
  getAllStatuses(): AgentStatus[] {
    return this.getAllAgents().map((a) => a.getStatus());
  }

  /** 获取空闲 Agent */
  getIdleAgents(): AIAgent[] {
    return this.getAllAgents().filter((a) => a.state === "idle");
  }

  // ========== 任务提交 ==========

  /** 提交任务 (自动分解 + 分配) */
  async submitTask(
    description: string,
    priority: TaskPriority = "normal",
    preferredAgent?: string,
  ): Promise<AgentTask> {
    const taskId = `task-${++this.taskCounter}-${Date.now()}`;

    const task: AgentTask = {
      id: taskId,
      description,
      priority,
      status: "pending",
      assigneeId: null,
      steps: [],
      dependencies: [],
      createdAt: Date.now(),
    };

    // 选择 Agent
    const assignee = preferredAgent
      ? this.agents.get(preferredAgent)
      : await this.selectBestAgent(task);

    if (!assignee) {
      task.status = "failed";
      task.error = "无可用 Agent";
      this.tasks.set(taskId, task);
      return task;
    }

    task.assigneeId = assignee.agentId;
    task.status = "assigned";

    // 执行任务
    const result = await assignee.execute(task);
    this.tasks.set(taskId, result);
    return result;
  }

  /** 提交复合任务 (多 Agent 协作) */
  async submitCollaborativeTask(
    description: string,
    _priority: TaskPriority = "normal",
  ): Promise<AgentTask[]> {
    const decomposition = this.decomposeTask(description);
    const results: AgentTask[] = [];

    // 按依赖顺序执行
    for (const subtaskDef of decomposition.subtasks) {
      const subtask = await this.submitTask(
        subtaskDef.description,
        subtaskDef.priority,
        subtaskDef.suggestedAssignee,
      );
      results.push(subtask);

      // 如果子任务失败，停止后续
      if (subtask.status === "failed") {
        break;
      }
    }

    return results;
  }

  // ========== 任务查询 ==========

  /** 获取任务 */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /** 获取所有任务 */
  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  /** 获取 Agent 的任务 */
  getAgentTasks(agentId: string): AgentTask[] {
    return this.getAllTasks().filter((t) => t.assigneeId === agentId);
  }

  // ========== Agent 选择 ==========

  /** 选择最佳 Agent */
  private async selectBestAgent(task: AgentTask): Promise<AIAgent | undefined> {
    const candidates = this.getIdleAgents();
    if (candidates.length === 0) {return undefined;}

    // 对每个候选 Agent 计算匹配度
    const scored: AgentSelection[] = candidates.map((agent) => {
      const score = this.computeScore(agent, task);
      return { agentId: agent.agentId, score, reason: `匹配度: ${(score * 100).toFixed(0)}%` };
    });

    // 按分数降序
    scored.sort((a, b) => b.score - a.score);
    return this.agents.get(scored[0].agentId);
  }

  /** 计算匹配分数 */
  private computeScore(agent: AIAgent, task: AgentTask): number {
    const desc = task.description.toLowerCase();
    const caps = agent.config.capabilities;
    let score = 0;

    // 关键词匹配
    const keywordMap: Record<string, string[]> = {
      nlu: ["意图", "理解", "解析", "路由", "nlu", "intent"],
      "data-analysis": ["分析", "数据", "洞察", "统计", "analyze"],
      prediction: ["预测", "趋势", "预报", "predict", "trend"],
      recommendation: ["推荐", "建议", "优化", "recommend"],
      orchestration: ["编排", "调度", "协调", "全局", "orchestrate"],
      security: ["安全", "威胁", "扫描", "检测", "security"],
      "code-review": ["代码", "架构", "审查", "质量", "code"],
      creative: ["创意", "设计", "生成", "文案", "creative"],
    };

    for (const cap of caps) {
      const keywords = keywordMap[cap] ?? [];
      for (const kw of keywords) {
        if (desc.includes(kw)) {
          score += 0.3;
        }
      }
    }

    // 基础分 (防止零分)
    score += 0.1;

    return Math.min(1, score);
  }

  // ========== 任务分解 ==========

  /** 将复杂任务分解为子任务 */
  decomposeTask(description: string): TaskDecomposition {
    const taskId = `decomp-${Date.now()}`;
    const desc = description.toLowerCase();

    // 基于关键词的简单分解规则
    const subtasks: TaskDecomposition["subtasks"] = [];

    // 检测是否需要多 Agent
    const needsAnalysis = /分析|洞察|数据/.test(desc);
    const needsPrediction = /预测|趋势|未来/.test(desc);
    const needsSecurity = /安全|威胁|漏洞/.test(desc);
    const needsCode = /代码|架构|质量/.test(desc);
    const needsCreative = /创意|设计|文案/.test(desc);

    if (needsAnalysis) {
      subtasks.push({
        description: `数据分析: ${description}`,
        suggestedAssignee: "thinker",
        priority: "high",
        dependencies: [],
      });
    }

    if (needsPrediction) {
      subtasks.push({
        description: `趋势预测: ${description}`,
        suggestedAssignee: "prophet",
        priority: "high",
        dependencies: needsAnalysis ? [subtasks[subtasks.length - 1]?.description ?? ""] : [],
      });
    }

    if (needsSecurity) {
      subtasks.push({
        description: `安全扫描: ${description}`,
        suggestedAssignee: "sentinel",
        priority: "critical",
        dependencies: [],
      });
    }

    if (needsCode) {
      subtasks.push({
        description: `代码审查: ${description}`,
        suggestedAssignee: "master",
        priority: "high",
        dependencies: [],
      });
    }

    if (needsCreative) {
      subtasks.push({
        description: `创意生成: ${description}`,
        suggestedAssignee: "creative",
        priority: "normal",
        dependencies: [],
      });
    }

    // 如果没有匹配到任何规则，交给 MetaOracle 编排
    if (subtasks.length === 0) {
      subtasks.push({
        description,
        suggestedAssignee: "meta-oracle",
        priority: "normal",
        dependencies: [],
      });
    }

    return { taskId, subtasks };
  }

  // ========== Agent 间通信 ==========

  /** 发送消息 */
  sendMessage(message: AgentMessage): void {
    this.messageQueue.push(message);

    const ctxMgr = getMCPContextManager();
    if (message.to === "*") {
      // 广播
      for (const agent of this.agents.values()) {
        if (agent.agentId !== message.from) {
          ctxMgr.addMessage(agent.agentId, "system", `[来自 ${message.from}] ${message.content}`);
        }
      }
    } else {
      // 定向
      ctxMgr.addMessage(message.to, "system", `[来自 ${message.from}] ${message.content}`);
    }
  }

  /** 获取消息队列 */
  getMessages(): AgentMessage[] {
    return [...this.messageQueue];
  }
}

// ============================================================
// 单例
// ============================================================

let _orchestrator: AgentOrchestrator | null = null;

export function getAgentOrchestrator(): AgentOrchestrator {
  if (!_orchestrator) {
    _orchestrator = new AgentOrchestrator();
  }
  return _orchestrator;
}

export function resetAgentOrchestrator(): void {
  _orchestrator = null;
}
