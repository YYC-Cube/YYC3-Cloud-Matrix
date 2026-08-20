/**
 * @file: types.ts
 * @description: types.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

export type DatabaseType = "postgresql" | "mysql" | "sqlite" | "redis" | "mongodb" | "custom";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error" | "reconnecting" | "testing";

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  connectionTimeout?: number;
  maxRetries?: number;
}

export interface ConnectionInfo {
  id: string;
  name: string;
  config: DatabaseConfig;
  status: ConnectionStatus;
  connectedAt?: number;
  lastError?: string;
  retryCount: number;
  healthCheckInterval?: number;
  connection?: unknown;
}

export interface ConnectionPoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
}

export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
}

export interface HealthCheckResult {
  isHealthy: boolean;
  latency: number;
  error?: string;
  checkedAt: number;
}

export interface QueryField {
  name: string;
  tableID?: number;
  columnID?: number;
  dataTypeID?: number;
  dataTypeSize?: number;
}

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  fields?: QueryField[];
  executionTime: number;
}

export interface QueryOptions {
  timeout?: number;
  cache?: boolean;
  analyze?: boolean;
}

export interface SlowQueryAlert {
  query: string;
  executionTime: number;
  threshold: number;
  timestamp: number;
  database: string;
}

export interface IndexInfo {
  name: string;
  tableName: string;
  columns: string[];
  unique: boolean;
  size: number;
  usage: number;
}

export interface ExecutionPlan {
  id?: number;
  operation?: string;
  rows?: number;
  cost?: number;
  [key: string]: unknown;
}

export interface QueryAnalysis {
  query: string;
  executionPlan: ExecutionPlan;
  estimatedCost: number;
  suggestedIndexes: IndexInfo[];
  optimizations: string[];
}

export interface ConnectionEvent {
  type: "connected" | "disconnected" | "error" | "reconnecting";
  connection: ConnectionInfo;
  timestamp: number;
}

export interface IndexRecommendation {
  tableName: string;
  columns: string[];
  reason: string;
  estimatedBenefit: number;
  type: "btree" | "hash" | "gin" | "gist";
  unique?: boolean;
}

export interface IndexUsageStats {
  indexName: string;
  tableName: string;
  scans: number;
  tuplesRead: number;
  tuplesFetched: number;
  lastUsed: number;
  size: number;
}

export type QueryParams = unknown[];
