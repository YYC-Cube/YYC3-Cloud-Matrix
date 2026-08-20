/**
 * @file: master-agent.ts
 * @description: 格物·宗师 Agent · 代码审查与架构分析
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent],[master]
 */

import { AIAgent } from "../agent-base";
import type { AgentTask, AgentStep } from "../agent-types";

export class MasterAgent extends AIAgent {
  constructor() {
    super({
      agentId: "master",
      displayName: "格物·宗师",
      capabilities: ["code-review"],
      systemPrompt: "你是格物·宗师，YYC³ 系统的「质量官」与「进化导师」。你审视代码质量，推动架构持续进化。",
      maxConcurrentTasks: 2,
    });
  }

  protected async think(task: AgentTask): Promise<void> {
    this.addContext("system", `审查请求: ${task.description}`);
  }

  protected planSteps(task: AgentTask): AgentStep[] {
    const desc = task.description.toLowerCase();
    const isArch = /架构|设计|scalab|reliab|perform/.test(desc);

    if (isArch) {
      return [
        {
          id: `${task.id}-arch`,
          toolName: "architecture_analyze",
          args: { component: task.description, aspect: "scalability" },
          status: "pending",
          assigneeId: this.agentId,
        },
      ];
    }

    return [
      {
        id: `${task.id}-review`,
        toolName: "code_review",
        args: { code: task.description, language: "typescript", focus: "quality" },
        status: "pending",
        assigneeId: this.agentId,
      },
    ];
  }

  protected async report(_task: AgentTask, steps: AgentStep[]): Promise<unknown> {
    const review = steps[0]?.result;
    this.addContext("assistant", `审查完成，建议已生成`);
    return { review };
  }
}
