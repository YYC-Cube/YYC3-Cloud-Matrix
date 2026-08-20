/**
 * @file: storage.ts
 * @description: storage.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import type { DatabaseConfig } from "../../database/types";

export type StorageType = "localStorage" | "database";

export interface StorageConfig {
  type: StorageType;
  database?: DatabaseConfig;
  syncInterval: number;
  autoSync: boolean;
  offlineMode: boolean;
  conflictResolution: "local" | "remote" | "merge";
}

export interface StorageStatus {
  connected: boolean;
  syncing: boolean;
  lastSync: number | null;
  pendingChanges: number;
  error?: string;
}

export interface OfflineQueueItem {
  type: string;
  data: unknown;
  timestamp?: number;
}

export interface SyncData {
  models?: unknown[];
  agents?: unknown[];
  nodes?: unknown[];
  [key: string]: unknown;
}

export interface StorageEvent {
  type: "syncStart" | "syncComplete" | "syncError" | "offline" | "online" | "offlineOperationAdded" | "offlineQueueProcessed";
  data?: SyncData | OfflineQueueItem | unknown;
  error?: string;
}

/** IndexedDB store 名称
 *  RF-004: 新增 store 时需同步更新 yyc3-storage.ts 中的 ALL_STORES 常量数组
 */
export type StoreName =
  | "alertRules"
  | "alertEvents"
  | "patrolHistory"
  | "loopHistory"
  | "operationTemplates"
  | "operationLogs"
  | "diagnosisHistory"
  | "reports"
  | "errorLog"
  | "dashboardSnapshots"
  | "fileVersions"
  | "dbConnections"
  | "queryHistory"
  | "committedChanges"
  | "agent_memories"
  | "agent_tasks"
  | "mcp_contexts"
  | "inference_cache"
  | "family_messages"
  | "family_activities"
  | "family_memories"
  | "family_broadcasts"
  | "music_library"
  | "comm_stations";

/** 存储变更事件 (BroadcastChannel) */
export interface StorageChangeEvent {
  store: StoreName;
  action: string;
  key: string;
  timestamp: number;
}
