/**
 * @file: alert-rules-types.ts
 * @description: 智能告警规则类型 — 阈值 + 升级 + 事件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[alert],[rules]
 */

/** 告警严重级别 (规则引擎) — RF-005: 补充 'error' 级别，与 BaseSeverity 对齐 */
export type AlertSeverity = "info" | "warning" | "error" | "critical";

/** 告警指标类型 */
export type AlertMetric = "cpu" | "gpu" | "memory" | "latency" | "disk" | "network" | "error_rate" | "throughput";

/** 告警比较条件 */
export type AlertCondition = "gt" | "lt" | "gte" | "lte" | "eq" | "neq";

/** 升级等级 */
export type EscalationLevel = 1 | 2 | 3;

/** 告警阈值配置 */
export interface AlertThreshold {
  metric: AlertMetric;
  condition: AlertCondition;
  value: number;
  unit: string;
  duration: number;
}

/** 升级策略 */
export interface EscalationPolicy {
  level: EscalationLevel;
  delayMinutes: number;
  notifyChannels: string[];
  autoAction?: string;
}

/** 告警规则 */
export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  severity: AlertSeverity;
  thresholds: AlertThreshold[];
  aggregation: {
    enabled: boolean;
    windowMinutes: number;
    maxGroupSize: number;
  };
  deduplication: {
    enabled: boolean;
    cooldownMinutes: number;
  };
  escalation: EscalationPolicy[];
  targets: string[];
  createdAt: number;
  lastTriggered: number | null;
  triggerCount: number;
}

/** 告警事件 */
export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  metric: AlertMetric;
  currentValue: number;
  threshold: number;
  nodeId: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  escalationLevel: EscalationLevel;
}

/** 告警规则 Hook 选项 */
export interface AlertRulesOptions {
  liveNodes?: { id: string; gpu: number; mem: number; temp: number; status: string }[];
  liveLatency?: number;
}
