/**
 * @file: family-db-bridge.ts
 * @description: YYC³ AI Family 数据库桥接 — 通过 DB Proxy (localhost:3299) 查询本机 PostgreSQL
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: deprecated
 * @tags: [lib],[database],[ai-family]
 *
 * @deprecated 2026-11-10 数据 API 架构审核（kimi）：
 * 本模块依赖外部 DB Proxy 服务（localhost:3299 → 本机 PostgreSQL），
 * 该服务不存在于本仓库（deploy/ 仅有 :3118 server.mjs 与 :3113 yyc3-agent），
 * 属悬空依赖。唯一消费者 useDbData 无任何生产页面引用（grep 验证 = 0），
 * 且「本地 PostgreSQL + 外部代理进程」与《YYC³ 数据本地化与安全隔离核心设计》
 * 的「纯前端 localStorage/IndexedDB 无后端」原则冲突。
 * 保留文件仅供历史参考；新代码请走 yyc3-agent WS 通道或本地持久化域。
 * 计划：确认无隐藏依赖后物理删除本文件与 useDbData.ts。
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
