/**
 * @file: database-types.ts
 * @description: 数据库管理 + SQL 模板 + 内联编辑表格类型
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[database]
 */

/** 数据库类型 */
export type DatabaseType = "postgresql" | "mysql" | "sqlite" | "redis" | "mongodb" | "custom";

/** 数据库连接状态 */
export type DBConnectionStatus = "disconnected" | "connecting" | "connected" | "error" | "testing" | "reconnecting";

/** 数据库连接配置 */
export interface DBConnection {
  id: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  /** 加密存储, 前端仅做 mask 展示 */
  password: string;
  status: DBConnectionStatus;
  lastConnected?: number | null;
  lastTestAt?: number;
  createdAt?: number;
  color?: string;
  options?: string;
}

/** 数据库表信息 */
export interface DBTable {
  name: string;
  schema: string;
  rowCount: number;
  sizeBytes: number;
  columns: DBColumn[];
}

/** 数据库列定义 */
export interface DBColumn {
  name: string;
  dataType: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  defaultValue: string | null;
}

/** SQL 查询结果 */
export interface QueryResult {
  id: string;
  sql: string;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
  executedAt: number;
  error?: string;
}

/** 数据库备份记录 */
export interface DBBackup {
  id: string;
  connectionId: string;
  connectionName: string;
  type: DatabaseType;
  fileName: string;
  sizeBytes: number;
  createdAt: number;
  status: "completed" | "failed" | "in_progress";
}

/** SQL 快速模板 */
export interface SQLTemplate {
  id: string;
  label: string;
  sql: string;
  dbType: DatabaseType | "all";
  category: string;
}

/** 变更操作类型 */
export type ChangeType = "update" | "delete";

/** 单元格编辑变更记录 */
export interface EditableCellChange {
  rowIndex: number;
  column: string;
  oldValue: unknown;
  newValue: string;
  type: ChangeType;
  sql?: string;
  rollbackSQL?: string;
}

/** 已提交的变更记录 (用于 Undo, IndexedDB 持久化) */
export interface CommittedChange {
  id: string;
  tableName: string;
  changes: EditableCellChange[];
  committedAt: number;
  rolledBack: boolean;
  rolledBackIndices?: number[];
}

// ============================================================
// 桥接映射函数 — UI 层 ↔ 基础设施层
// 参考 node-types.ts 的 toNodeData() 设计模式
// ============================================================

import type {
  ConnectionInfo,
  ConnectionStatus as InfraConnectionStatus
} from "../../database/types";

export function toConnectionInfo(conn: DBConnection): ConnectionInfo {
  return {
    id: conn.id,
    name: conn.name,
    config: {
      type: conn.type,
      host: conn.host,
      port: conn.port,
      database: conn.database,
      username: conn.username,
      password: conn.password,
    },
    status: conn.status as InfraConnectionStatus,
    connectedAt: conn.lastConnected ?? undefined,
    retryCount: 0,
  };
}

export function toDBConnection(info: ConnectionInfo, overrides?: Partial<DBConnection>): DBConnection {
  return {
    id: info.id,
    name: info.name,
    type: info.config.type,
    host: info.config.host,
    port: info.config.port,
    database: info.config.database,
    username: info.config.username,
    password: info.config.password,
    status: info.status as DBConnectionStatus,
    lastConnected: info.connectedAt ?? null,
    ...overrides,
  };
}
