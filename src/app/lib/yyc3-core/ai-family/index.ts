/**
 * @file: AI Family 入口
 * @description: 导出AI Family核心组件
 * @module @family-pai/core/ai-family
 * @author: YanYuCloudCube Team

 * @updated: 2026-04-30
 * @version: v1.0.0
 * @created: 2026-04-30
 * @status: active
 * @tags: [ai-family],[agent] */

export { AIFamilyManager } from './manager.js'
export { BaseAgent } from './base-agent.js'
export { AgentLayers } from './agent-layers.js'
export { AgentCollaboration } from './agent-collaboration.js'
export { AgentRouter } from './agent-router.js'
export { AgentQualityGates } from './agent-quality-gates.js'

export {
  MetaOracleAgent,
  SentinelAgent,
  MasterAgent,
  CreativeAgent,
  NavigatorAgent,
  ThinkerAgent,
  ProphetAgent,
  BoleroAgent,
} from './agents.js'

export { getAllAgentDefinitions } from './definitions.js'

export type {
  AgentRole,
  AgentTask,
  TaskContext,
  TaskResult,
  TaskPriority,
  AgentCapability,
  AgentStatus,
  CollaborationTask,
  AgentRecommendation,
} from './types.js'

export type {
  AgentLayer,
  LayerConfig,
  ThreeLayerArchitectureConfig,
  ArchitectureEvents,
} from './agent-layers.js'

export type {
  CollaborationMessageType,
  CollaborationMessage,
  CollaborationSession,
  CollaborationStrategy,
  CollaborationConfig,
  CollaborationEvents,
} from './agent-collaboration.js'

export type {
  RoutingStrategy,
  RoutingDecision,
  AgentLoad,
  RoutingRule,
  RouterConfig,
} from './agent-router.js'

export type {
  AgentQualityGateType,
  AgentQualityRule,
  AgentQualityContext,
  AgentQualityResult,
  AgentQualityReport,
  AgentQualityGatesConfig,
} from './agent-quality-gates.js'
