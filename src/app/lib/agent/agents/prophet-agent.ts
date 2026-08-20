/**
 * @file: prophet-agent.ts
 * @description: 预见·先知 Agent · 趋势预测与风险预警
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent],[prophet]
 */

import { AIAgent } from "../agent-base";
import type { AgentTask, AgentStep } from "../agent-types";

export class ProphetAgent extends AIAgent {
  constructor() {
    super({
      agentId: "prophet",
      displayName: "预见·先知",
      capabilities: ["prediction"],
      systemPrompt: "你是预见·先知，YYC³ 系统的「预言家」。你分析历史数据预测未来趋势，提前预警潜在风险。",
      maxConcurrentTasks: 2,
    });
  }

  protected async think(task: AgentTask): Promise<void> {
    this.addContext("system", `预测请求: ${task.description}`);
  }

  protected planSteps(task: AgentTask): AgentStep[] {
    return [
      {
        id: `${task.id}-predict`,
        toolName: "trend_predict",
        args: { metric: task.description, horizon: "24h" },
        status: "pending",
        assigneeId: this.agentId,
      },
      {
        id: `${task.id}-anomaly`,
        toolName: "anomaly_detect",
        args: { metric: task.description },
        status: "pending",
        assigneeId: this.agentId,
      },
    ];
  }

  protected async report(_task: AgentTask, steps: AgentStep[]): Promise<unknown> {
    const prediction = steps.find((s) => s.toolName === "trend_predict")?.result;
    const anomaly = steps.find((s) => s.toolName === "anomaly_detect")?.result;
    this.addContext("assistant", `预测完成，异常检测结果已生成`);
    return { prediction, anomaly };
  }
}
