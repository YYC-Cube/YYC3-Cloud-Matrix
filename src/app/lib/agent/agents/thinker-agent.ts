/**
 * @file: thinker-agent.ts
 * @description: 语枢·万物 Agent · 数据洞察与深度分析
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent],[thinker]
 */

import { AIAgent } from "../agent-base";
import type { AgentTask, AgentStep } from "../agent-types";

export class ThinkerAgent extends AIAgent {
  constructor() {
    super({
      agentId: "thinker",
      displayName: "语枢·万物",
      capabilities: ["data-analysis"],
      systemPrompt: "你是语枢·万物，YYC³ 系统的「哲学家」与「分析师」。你擅长从数据中提炼深刻洞察，发现隐藏模式。",
      maxConcurrentTasks: 2,
    });
  }

  protected async think(task: AgentTask): Promise<void> {
    this.addContext("system", `分析请求: ${task.description}`);
  }

  protected planSteps(task: AgentTask): AgentStep[] {
    return [
      {
        id: `${task.id}-analyze`,
        toolName: "data_analyze",
        args: { dataType: "node", targetId: task.description },
        status: "pending",
        assigneeId: this.agentId,
      },
      {
        id: `${task.id}-insight`,
        toolName: "insight_generate",
        args: { analysisData: { description: task.description } },
        status: "pending",
        assigneeId: this.agentId,
      },
    ];
  }

  protected async report(_task: AgentTask, steps: AgentStep[]): Promise<unknown> {
    const analysis = steps.find((s) => s.toolName === "data_analyze")?.result;
    const insight = steps.find((s) => s.toolName === "insight_generate")?.result;
    this.addContext("assistant", `分析完成，已生成洞察建议`);
    return { analysis, insight };
  }
}
