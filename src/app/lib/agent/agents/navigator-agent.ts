/**
 * @file: navigator-agent.ts
 * @description: 言启·千行 Agent · 意图理解与语义路由
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent],[navigator]
 */

import { AIAgent } from "../agent-base";
import type { AgentTask, AgentStep } from "../agent-types";

export class NavigatorAgent extends AIAgent {
  constructor() {
    super({
      agentId: "navigator",
      displayName: "言启·千行",
      capabilities: ["nlu"],
      systemPrompt: "你是言启·千行，YYC³ 系统的「耳朵」与「翻译官」。你擅长理解用户意图、提取关键实体、将请求路由到最合适的团队成员。",
      maxConcurrentTasks: 3,
    });
  }

  protected async think(task: AgentTask): Promise<void> {
    this.addContext("system", `新任务: ${task.description}`);
  }

  protected planSteps(task: AgentTask): AgentStep[] {
    return [
      {
        id: `${task.id}-parse`,
        toolName: "intent_parse",
        args: { text: task.description, context: JSON.stringify(this.getContext().slice(-5)) },
        status: "pending",
        assigneeId: this.agentId,
      },
      {
        id: `${task.id}-route`,
        toolName: "route_query",
        args: { intent: task.description },
        status: "pending",
        assigneeId: this.agentId,
      },
    ];
  }

  protected async report(_task: AgentTask, steps: AgentStep[]): Promise<unknown> {
    const parseResult = steps.find((s) => s.toolName === "intent_parse")?.result;
    const routeResult = steps.find((s) => s.toolName === "route_query")?.result;
    this.addContext("assistant", `意图解析完成: ${JSON.stringify(parseResult)}`);
    return { parsed: parseResult, routed: routeResult };
  }
}
