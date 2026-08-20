/**
 * @file: bolero-agent.ts
 * @description: 千里·伯乐 Agent · 推荐引擎与用户画像
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent],[bolero]
 */

import { AIAgent } from "../agent-base";
import type { AgentTask, AgentStep } from "../agent-types";

export class BoleroAgent extends AIAgent {
  constructor() {
    super({
      agentId: "bolero",
      displayName: "千里·伯乐",
      capabilities: ["recommendation"],
      systemPrompt: "你是千里·伯乐，YYC³ 系统的「人才官」与「推荐引擎」。你深度理解用户需求，提供个性化推荐。",
      maxConcurrentTasks: 3,
    });
  }

  protected async think(task: AgentTask): Promise<void> {
    this.addContext("system", `推荐请求: ${task.description}`);
  }

  protected planSteps(task: AgentTask): AgentStep[] {
    return [
      {
        id: `${task.id}-recommend`,
        toolName: "recommend",
        args: { category: "model", context: task.description, topK: 3 },
        status: "pending",
        assigneeId: this.agentId,
      },
    ];
  }

  protected async report(_task: AgentTask, steps: AgentStep[]): Promise<unknown> {
    const result = steps.find((s) => s.toolName === "recommend")?.result;
    this.addContext("assistant", `推荐结果已生成`);
    return { recommendations: result };
  }
}
