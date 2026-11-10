/**
 * @file: useDbData.ts
 * @description: YYC³ 真实数据库数据 Hook — 从 DB Proxy 获取集群/节点/告警数据
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: deprecated
 * @tags: [hooks],[database]
 *
 * @deprecated 2026-11-10 数据 API 架构审核（kimi）：
 * 零生产消费者（grep -r "useDbData" src/app --include="*.tsx" = 仅测试），
 * 依赖的 family-db-bridge（DB Proxy localhost:3299）服务端不存在于本仓库，
 * 属死链路。真实节点/告警数据请使用 useWebSocketData（yyc3-agent WS 通道）。
 * 计划：确认无隐藏依赖后物理删除。
 */

import { useCallback, useEffect, useState } from "react";
import {
  fetchNodeStatus,
  fetchPerformanceMetrics,
  fetchAlerts,
  fetchDashboardStats,
  type DbNodeStatus,
  type DbPerformanceMetric,
  type DbAlert,
  type DbDashboardStats,
} from "../lib/family-db-bridge";

interface DbDataState {
  nodes: DbNodeStatus[];
  metrics: DbPerformanceMetric[];
  alerts: DbAlert[];
  stats: DbDashboardStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useDbData(autoRefresh = 30000): DbDataState {
  const [nodes, setNodes] = useState<DbNodeStatus[]>([]);
  const [metrics, setMetrics] = useState<DbPerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<DbAlert[]>([]);
  const [stats, setStats] = useState<DbDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [n, m, a, s] = await Promise.all([
        fetchNodeStatus(),
        fetchPerformanceMetrics(),
        fetchAlerts(),
        fetchDashboardStats(),
      ]);
      setNodes(n);
      setMetrics(m);
      setAlerts(a);
      setStats(s);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch DB data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (autoRefresh > 0) {
      const timer = setInterval(refresh, autoRefresh);
      return () => clearInterval(timer);
    }
  }, [refresh, autoRefresh]);

  return { nodes, metrics, alerts, stats, loading, error, lastUpdated, refresh };
}
