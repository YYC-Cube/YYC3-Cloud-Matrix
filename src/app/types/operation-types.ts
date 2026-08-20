/**
 * @file: operation-types.ts
 * @description: 操作中心类型 — 分类 + 模板 + 日志
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[operation]
 */

/** 操作分类 */
export type OperationCategoryType =
  | "node"
  | "model"
  | "task"
  | "system"
  | "custom";

/** 操作分类元信息 */
export interface OperationCategoryMeta {
  key: OperationCategoryType;
  label: string;
  icon: string;
  color: string;
}

/** 操作状态 */
export type OperationStatus = "pending" | "running" | "success" | "failed" | "cancelled";

/** 操作项 */
export interface OperationItem {
  id: string;
  category: OperationCategoryType;
  label: string;
  description: string;
  icon: string;
  status: OperationStatus;
  dangerous?: boolean;
}

/** 操作模板 */
export interface OperationTemplateItem {
  id: string;
  name: string;
  description: string;
  category: OperationCategoryType;
  steps: string[];
  createdAt: number;
  lastUsed?: number;
}

/** 操作日志条目 */
export interface OperationLogEntry {
  id: string;
  timestamp: number;
  category: OperationCategoryType;
  action: string;
  user: string;
  status: OperationStatus;
  detail?: string;
  duration?: number;
}

/** 操作日志筛选 */
export type LogFilterType = "all" | "byCategory" | "byUser" | "search";
