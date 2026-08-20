/**
 * @file: family-db-bridge.ts
 * @description: YYC³ AI Family 数据库桥接 — 通过 DB Proxy (localhost:3299) 查询本机 PostgreSQL
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [lib],[database],[ai-family]
 */

export interface DbNodeStatus {
  id: number;
  node_name: string;
  node_type: string;
  status: string;
  ip_address: string;
  port: number;
  gpu_utilization: number | null;
  memory_utilization: number | null;
  temperature: number | null;
  queue_depth: number;
  model: string;
  last_heartbeat: string | null;
}

export interface DbPerformanceMetric {
  id: number;
  qps: number | null;
  latency: number | null;
  throughput: number | null;
  token_throughput: number | null;
  storage_usage: number | null;
  active_nodes: number | null;
  recorded_at: string;
}

export interface DbAlert {
  id: number;
  level: string;
  message: string;
  source: string | null;
  node_id: number | null;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface DbDashboardStats {
  totalNodes: number;
  activeNodes: number;
  warningNodes: number;
  inactiveNodes: number;
  unresolvedAlerts: number;
  avg_latency: number;
  avg_qps: number;
  last_recorded: string;
}

const DB_BASE = "/api/v1/db";

async function dbGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${DB_BASE}${path}`);
    if (!res.ok) { return null; }
    return await res.json() as T;
  } catch {
    return null;
  }
}

export async function fetchNodeStatus(): Promise<DbNodeStatus[]> {
  return (await dbGet<DbNodeStatus[]>("/nodes")) || [];
}

export async function fetchPerformanceMetrics(): Promise<DbPerformanceMetric[]> {
  return (await dbGet<DbPerformanceMetric[]>("/metrics")) || [];
}

export async function fetchAlerts(): Promise<DbAlert[]> {
  return (await dbGet<DbAlert[]>("/alerts")) || [];
}

export async function fetchDashboardStats(): Promise<DbDashboardStats | null> {
  return dbGet<DbDashboardStats>("/stats");
}
