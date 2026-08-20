/**
 * @file: diagnostic-types.ts
 * @description: AI 辅助诊断类型 — 模式检测 + 异常 + 预测
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[diagnostic]
 */

/** 诊断状态 */
export type DiagnosticStatus = "idle" | "analyzing" | "complete" | "error";

/** 模式类型 */
export type PatternType = "recurring" | "gradual" | "spike" | "correlation" | "seasonal";

/** 置信度等级 */
export type ConfidenceLevel = "high" | "medium" | "low";

/** 操作优先级 */
export type ActionPriority = "urgent" | "recommended" | "optional";

/** 诊断检测模式 */
export interface DiagnosticPattern {
  id: string;
  type: PatternType;
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  affectedNodes: string[];
  detectedAt: number;
  dataPoints: number[];
  metric: string;
  /** RF-005: 使用 BaseSeverity 子集 */
  severity: "critical" | "warning" | "error" | "info";
}

/** 异常记录 */
export interface AnomalyRecord {
  id: string;
  timestamp: number;
  nodeId: string;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  rootCause: string;
  relatedPatternId?: string;
}

/** AI 建议操作 */
export interface SuggestedAction {
  id: string;
  priority: ActionPriority;
  title: string;
  description: string;
  estimatedImpact: string;
  confidence: ConfidenceLevel;
  steps: string[];
  autoExecutable: boolean;
  relatedPatternId: string;
}

/** 预测性预报 */
export interface PredictiveForecast {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  trend: "up" | "down" | "stable";
  riskLevel: "safe" | "warning" | "danger";
  explanation: string;
}

/** 诊断会话 */
export interface DiagnosticSession {
  id: string;
  startedAt: number;
  completedAt: number | null;
  status: DiagnosticStatus;
  patterns: DiagnosticPattern[];
  anomalies: AnomalyRecord[];
  actions: SuggestedAction[];
  forecasts: PredictiveForecast[];
  summary: string;
}

/** WebSocket 节点快照 (诊断用) */
export interface WsNodeSnapshot {
  id: string;
  gpu: number;
  mem: number;
  temp: number;
  status: string;
}

/** 诊断选项 */
export interface DiagnosticsOptions {
  liveNodes?: WsNodeSnapshot[];
  liveQPS?: number;
  liveLatency?: number;
}

/** 诊断历史条目 */
export interface DiagnosticHistoryEntry {
  id: string;
  time: number;
  patterns: number;
  actions: number;
}

/** 诊断视图类型 */
export type DiagnosticView = "patterns" | "anomalies" | "actions" | "forecasts";
