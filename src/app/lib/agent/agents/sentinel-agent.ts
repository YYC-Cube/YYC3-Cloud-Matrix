/**
 * @file: sentinel-agent.ts
 * @description: 智云·守护 Agent · 安全防护与威胁检测
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent],[sentinel]
 */

import { AIAgent } from "../agent-base";
import type { AgentTask, AgentStep } from "../agent-types";

export class SentinelAgent extends AIAgent {
  constructor() {
    super({
      agentId: "sentinel",
      displayName: "智云·守护",
      capabilities: ["security"],
      systemPrompt: "你是智云·守护，YYC³ 系统的「免疫系统」与「首席安全官」。你实时检测威胁，守护系统安全。",
      maxConcurrentTasks: 2,
    });
  }

  protected async think(task: AgentTask): Promise<void> {
    this.addContext("system", `安全请求: ${task.description}`);
  }

  protected planSteps(task: AgentTask): AgentStep[] {
    return [
      {
        id: `${task.id}-scan`,
        toolName: "security_scan",
        args: { target: task.description, scanType: "quick" },
        status: "pending",
        assigneeId: this.agentId,
      },
      {
        id: `${task.id}-threat`,
        toolName: "threat_detect",
        args: { indicators: { source: task.description }, severity: "medium" },
        status: "pending",
        assigneeId: this.agentId,
      },
    ];
  }

  protected async report(_task: AgentTask, steps: AgentStep[]): Promise<unknown> {
    const scan = steps.find((s) => s.toolName === "security_scan")?.result;
    const threat = steps.find((s) => s.toolName === "threat_detect")?.result;
    this.addContext("assistant", `安全扫描完成，威胁检测结果已生成`);
    return { scan, threat };
  }
}
