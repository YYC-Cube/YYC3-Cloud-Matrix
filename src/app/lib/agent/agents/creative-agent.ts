/**
 * @file: creative-agent.ts
 * @description: 创想·灵韵 Agent · 创意生成与设计辅助
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent],[creative]
 */

import { AIAgent } from "../agent-base";
import type { AgentTask, AgentStep } from "../agent-types";

export class CreativeAgent extends AIAgent {
  constructor() {
    super({
      agentId: "creative",
      displayName: "创想·灵韵",
      capabilities: ["creative"],
      systemPrompt: "你是创想·灵韵，YYC³ 系统的「创意引擎」与「设计助手」。你负责创意生成、内容创作和设计优化。",
      maxConcurrentTasks: 3,
    });
  }

  protected async think(task: AgentTask): Promise<void> {
    this.addContext("system", `创意请求: ${task.description}`);
  }

  protected planSteps(task: AgentTask): AgentStep[] {
    const desc = task.description.toLowerCase();
    const isDesign = /设计|配色|UI|UX|界面/.test(desc);

    if (isDesign) {
      return [
        {
          id: `${task.id}-design`,
          toolName: "design_suggest",
          args: { elementType: task.description, context: "YYC³ 智能矩阵" },
          status: "pending",
          assigneeId: this.agentId,
        },
      ];
    }

    return [
      {
        id: `${task.id}-creative`,
        toolName: "creative_generate",
        args: { prompt: task.description, style: "professional", format: "markdown" },
        status: "pending",
        assigneeId: this.agentId,
      },
    ];
  }

  protected async report(_task: AgentTask, steps: AgentStep[]): Promise<unknown> {
    const result = steps[0]?.result;
    this.addContext("assistant", `创意内容已生成`);
    return { creative: result };
  }
}
