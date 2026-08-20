/**
 * @file: sync-types.ts
 * @description: 后台同步队列类型
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[sync]
 */

/** 同步项类型 */
export type SyncItemType = "config_update" | "audit_log" | "user_action";

/** 同步队列项 */
export interface SyncItem {
  id: string;
  type: SyncItemType;
  payload: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

/** 同步队列统计 */
export interface SyncQueueStats {
  total: number;
  pending: number;
  retrying: number;
  oldestTimestamp: number | null;
}

/** 同步处理结果 */
export interface SyncProcessResult {
  success: number;
  failed: number;
}
