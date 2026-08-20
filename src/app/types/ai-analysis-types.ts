/**
 * @file: ai-analysis-types.ts
 * @description: AI 辅助决策类型 — 异常模式检测 + 推荐
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[ai-analysis]
 */

/** 异常模式类型 */
export type AnomalyPatternType =
  | "latency_spike"
  | "memory_pressure"
  | "gpu_overheat"
  | "throughput_drop"
  | "error_burst"
  | "storage_near_full";

/** 异常模式严重级别 */
export type PatternSeverity = "low" | "medium" | "high" | "critical";

/** 检测到的异常模式 */
export interface DetectedPattern {
  id: string;
  type: AnomalyPatternType;
  severity: PatternSeverity;
  title: string;
  description: string;
  source: string;
  metric: string;
  detectedAt: number;
  occurrences: number;
  trend: "rising" | "stable" | "declining";
}

/** AI 推荐操作 */
export interface AIRecommendation {
  id: string;
  patternId: string;
  action: string;
  description: string;
  impact: "low" | "medium" | "high";
  confidence: number;
  autoExecutable: boolean;
  applied?: boolean;
}

/** AI 分析结果 */
export interface AIAnalysisResult {
  patterns: DetectedPattern[];
  recommendations: AIRecommendation[];
  overallHealth: number;
  analysisTime: number;
  lastAnalyzedAt: number;
}
