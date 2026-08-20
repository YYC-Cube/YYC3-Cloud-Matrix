/**
 * @file: error-types.ts
 * @description: 错误处理类型 — 分类 + 统计
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[error]
 */

import type { BaseSeverity } from "./common-types";

/** 错误分类 */
export type ErrorCategory =
  | "NETWORK"
  | "PARSE"
  | "AUTH"
  | "RUNTIME"
  | "VALIDATION"
  | "STORAGE"
  | "UNKNOWN";

/** 错误严重级别 — RF-005: BaseSeverity 别名 */
export type ErrorSeverity = BaseSeverity;

/** 应用级错误 */
export interface AppError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  detail?: string;
  source?: string;
  stack?: string;
  timestamp: number;
  resolved: boolean;
  userAction?: string;
}

/** 错误统计 */
export interface ErrorStats {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  unresolvedCount: number;
  lastErrorTime: number | null;
}
