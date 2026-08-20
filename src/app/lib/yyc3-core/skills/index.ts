/**
 * @file: 技能系统入口
 * @description: 导出技能管理器和核心技能
 * @module @family-pai/core/skills
 * @author: YanYuCloudCube Team

 * @updated: 2026-04-30
 * @version: v1.0.0
 * @created: 2026-04-30
 * @status: active
 * @tags: [skills] */

export { SkillManager } from './manager.js'
export { SkillRecommender } from './skill-recommender.js'
export { SkillLearner } from './skill-learner.js'
export { SkillComposer } from './skill-composer.js'
export { SkillQualityGates } from './skill-quality-gates.js'
export { ReasoningSkill, GenerationSkill, AnalysisSkill } from './builtin.js'

export type { 
  SkillDefinition, 
  ExecutionContext, 
  SkillExecutionResult,
  SkillRegistryItem,
  SkillHandler,
  SkillCategory,
} from './types.js'

export type {
  SkillRecommendation,
  RecommendationContext,
  SkillExecutionHistory,
  UserPreferences,
} from './skill-recommender.js'

export type {
  LearningData,
  UserFeedback,
  SkillOptimization,
  LearningModel,
  PerformanceMetrics,
} from './skill-learner.js'

export type {
  CompositionMode,
  CompositionStep,
  CompositionDefinition,
  CompositionResult,
} from './skill-composer.js'

export type {
  QualityGateType,
  QualityGateRule,
  QualityCheckContext,
  QualityCheckResult,
  QualityGateReport,
} from './skill-quality-gates.js'
