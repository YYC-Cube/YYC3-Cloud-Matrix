/**
 * @file: useDbData.ts
 * @description: YYC³ 真实数据库数据 Hook — 从 DB Proxy 获取集群/节点/告警数据
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [hooks],[database]
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
