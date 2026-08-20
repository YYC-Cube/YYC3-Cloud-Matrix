/**
 * @file: index.ts
 * @description: YYC³ Agent 模块入口 · 注册所有内置 Agent
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[agent]
 */

export { AIAgent } from "./agent-base";
export { AgentOrchestrator, getAgentOrchestrator, resetAgentOrchestrator } from "./agent-orchestrator";
export { NavigatorAgent } from "./agents/navigator-agent";
export { ThinkerAgent } from "./agents/thinker-agent";
export { ProphetAgent } from "./agents/prophet-agent";
export { BoleroAgent } from "./agents/bolero-agent";
export { MetaOracleAgent } from "./agents/meta-oracle-agent";
export { SentinelAgent } from "./agents/sentinel-agent";
export { MasterAgent } from "./agents/master-agent";
export { CreativeAgent } from "./agents/creative-agent";

import { getAgentOrchestrator } from "./agent-orchestrator";
import { NavigatorAgent } from "./agents/navigator-agent";
import { ThinkerAgent } from "./agents/thinker-agent";
import { ProphetAgent } from "./agents/prophet-agent";
import { BoleroAgent } from "./agents/bolero-agent";
import { MetaOracleAgent } from "./agents/meta-oracle-agent";
import { SentinelAgent } from "./agents/sentinel-agent";
import { MasterAgent } from "./agents/master-agent";
import { CreativeAgent } from "./agents/creative-agent";

/** 注册所有内置 Agent 到编排器 */
export function registerBuiltinAgents(): void {
  const orchestrator = getAgentOrchestrator();
  orchestrator.registerAgent(new NavigatorAgent());
  orchestrator.registerAgent(new ThinkerAgent());
  orchestrator.registerAgent(new ProphetAgent());
  orchestrator.registerAgent(new BoleroAgent());
  orchestrator.registerAgent(new MetaOracleAgent());
  orchestrator.registerAgent(new SentinelAgent());
  orchestrator.registerAgent(new MasterAgent());
  orchestrator.registerAgent(new CreativeAgent());
}
