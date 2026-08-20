/**
 * @file: patrol-types.ts
 * @description: 巡查模式类型 — 巡查项 + 结果 + 计划
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[patrol]
 */

/** 巡查运行状态 */
export type PatrolStatus = "idle" | "running" | "completed" | "failed";

/** 巡查项状态 */
export type CheckStatus = "pass" | "warning" | "critical" | "skipped";

/** 自动巡查间隔 (分钟) */
export type PatrolInterval = 5 | 10 | 15 | 30 | 60;

/** 巡查检查项 */
export interface PatrolCheckItem {
  id: string;
  category: string;
  label: string;
  status: CheckStatus;
  value: string;
  threshold?: string;
  detail?: string;
}

/** 巡查结果 */
export interface PatrolResult {
  id: string;
  timestamp: number;
  duration: number;
  status: PatrolStatus;
  healthScore: number;
  totalChecks: number;
  passCount: number;
  warningCount: number;
  criticalCount: number;
  skippedCount: number;
  checks: PatrolCheckItem[];
  triggeredBy: "manual" | "auto" | "scheduled";
}

/** 巡查计划 */
export interface PatrolSchedule {
  enabled: boolean;
  interval: PatrolInterval;
  lastRun: number | null;
  nextRun: number | null;
}
