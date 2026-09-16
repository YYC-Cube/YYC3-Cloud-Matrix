/**
 * @file: ConnectionMonitorPanel.tsx
 * @description: ConnectionMonitorPanel.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  List,
  RefreshCw,
  Server,
  XCircle,
  Zap,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { connectionManager } from "../../../database/ConnectionManager";
import type { ConnectionInfo, HealthCheckResult, PoolStats } from "../../../database/types";
import { ViewContext } from "../../lib/view-context";
import { useDbConnSlice } from "../../store/slices/db-conn-slice";
import { GlassCard } from "../shared/GlassCard";

interface ConnectionMonitorProps {
  connectionId?: string;
  refreshInterval?: number;
}

export function ConnectionMonitorPanel({
  connectionId: propConnectionId,
  refreshInterval = 5000,
}: ConnectionMonitorProps) {
  const view = useContext(ViewContext);
  const _isMobile = view?.isMobile ?? false;

  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(propConnectionId || null);
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult | null>(null);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showList, setShowList] = useState(!propConnectionId);

  useEffect(() => {
    const refreshData = async () => {
      const conn = connectionManager.getConnection(selectedConnectionId || "");
      if (conn) {
        setConnection(conn);

        const health = await connectionManager.healthCheck(selectedConnectionId || "");
        setHealthCheck(health);

        const pool = connectionManager.getPoolStats(selectedConnectionId || "");
        setPoolStats(pool);
      }
    };

    refreshData();

    const timer = setInterval(refreshData, refreshInterval);
    return () => clearInterval(timer);
  }, [selectedConnectionId, refreshInterval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const conn = connectionManager.getConnection(selectedConnectionId || "");
      if (conn) {
        const health = await connectionManager.healthCheck(selectedConnectionId || "");
        setHealthCheck(health);

        const pool = connectionManager.getPoolStats(selectedConnectionId || "");
        setPoolStats(pool);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-[#00ff88]";
      case "connecting":
      case "reconnecting":
        return "text-[#ffdd00]";
      case "error":
        return "text-[#ff3366]";
      default:
        return "text-[rgba(0,212,255,0.4)]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="w-5 h-5" />;
      case "connecting":
      case "reconnecting":
        return <RefreshCw className="w-5 h-5 animate-spin" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const { connections } = useDbConnSlice();

  if (!selectedConnectionId && showList) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(51,103,145,0.15)] flex items-center justify-center">
              <Database className="w-5 h-5 text-[#336791]" />
            </div>
            <div>
              <h3 className="text-[#e0f0ff] font-semibold text-lg">连接监控</h3>
              <p className="text-[rgba(0,212,255,0.5)] text-sm">选择一个连接进行监控</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {connections.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-16 h-16 text-[rgba(0,212,255,0.3)] mx-auto mb-4" />
              <p className="text-[rgba(0,212,255,0.5)]">暂无连接</p>
              <p className="text-[rgba(0,212,255,0.3)] text-sm mt-2">请先在数据库连接管理中添加连接</p>
            </div>
          ) : (
            connections.map((conn) => (
              <button
                key={conn.id}
                onClick={() => setSelectedConnectionId(conn.id)}
                className="w-full p-4 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(0,180,255,0.1)] hover:border-[rgba(0,180,255,0.3)] hover:bg-[rgba(0,100,150,0.1)] transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-[#336791]" />
                    <div>
                      <div className="text-[#e0f0ff] font-medium">{conn.name}</div>
                      <div className="text-[rgba(0,212,255,0.5)] text-sm">
                        {conn.type.toUpperCase()} · {conn.host}:{conn.port}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${getStatusColor(conn.status)}`}>
                    {getStatusIcon(conn.status)}
                    <span className="text-sm font-medium">{conn.status.toUpperCase()}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </GlassCard>
    );
  }

  if (!connection) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Server className="w-12 h-12 text-[rgba(0,212,255,0.3)] mx-auto mb-3" />
            <p className="text-[rgba(0,212,255,0.5)]">连接不存在</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[rgba(51,103,145,0.15)] flex items-center justify-center">
              <Database className="w-6 h-6 text-[#336791]" />
            </div>
            <div>
              <h3 className="text-[#e0f0ff] font-semibold text-lg">{connection.name}</h3>
              <p className="text-[rgba(0,212,255,0.5)] text-sm">
                {connection.config.type.toUpperCase()} · {connection.config.host || "localhost"}:{connection.config.port || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedConnectionId(null);
                setShowList(true);
              }}
              className="p-2 rounded-lg bg-[rgba(0,100,150,0.1)] border border-[rgba(0,180,255,0.15)] hover:bg-[rgba(0,140,200,0.2)] transition-all"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-[rgba(0,100,150,0.1)] border border-[rgba(0,180,255,0.15)] hover:bg-[rgba(0,140,200,0.2)] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(0,180,255,0.1)]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
              <span className="text-[rgba(0,212,255,0.6)] text-sm">连接状态</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(connection.status)}
              <span className={`font-semibold ${getStatusColor(connection.status)}`}>
                {connection.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(0,180,255,0.1)]">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
              <span className="text-[rgba(0,212,255,0.6)] text-sm">连接时长</span>
            </div>
            <div className="text-[#e0f0ff] font-semibold text-lg">
              {connection.connectedAt
                ? `${Math.floor((Date.now() - connection.connectedAt) / 1000 / 60)}m`
                : "-"}
            </div>
          </div>
        </div>
      </GlassCard>

      {healthCheck && (
        <GlassCard className="p-6">
          <h4 className="text-[#e0f0ff] font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            健康检查
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(0,180,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
                <span className="text-[rgba(0,212,255,0.6)] text-sm">延迟</span>
              </div>
              <div className={`font-semibold text-lg ${healthCheck.isHealthy ? "text-[#00ff88]" : "text-[#ff3366]"}`}>
                {healthCheck.latency}ms
              </div>
            </div>

            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(0,180,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
                <span className="text-[rgba(0,212,255,0.6)] text-sm">状态</span>
              </div>
              <div className={`font-semibold text-lg ${healthCheck.isHealthy ? "text-[#00ff88]" : "text-[#ff3366]"}`}>
                {healthCheck.isHealthy ? "健康" : "异常"}
              </div>
            </div>

            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(0,180,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
                <span className="text-[rgba(0,212,255,0.6)] text-sm">检查时间</span>
              </div>
              <div className="text-[#e0f0ff] font-semibold text-lg">
                {new Date(healthCheck.checkedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {healthCheck.error && (
            <div className="mt-4 bg-[rgba(255,51,54,0.1)] rounded-xl p-4 border border-[rgba(255,51,54,0.3)]">
              <div className="flex items-center gap-2 text-[#ff3366]">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">{healthCheck.error}</span>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {poolStats && (
        <GlassCard className="p-6">
          <h4 className="text-[#e0f0ff] font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            连接池统计
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(0,180,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
                <span className="text-[rgba(0,212,255,0.6)] text-sm">总连接</span>
              </div>
              <div className="text-[#e0f0ff] font-semibold text-lg">
                {poolStats.totalConnections}
              </div>
            </div>

            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(0,180,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
                <span className="text-[rgba(0,212,255,0.6)] text-sm">活跃</span>
              </div>
              <div className="text-[#00ff88] font-semibold text-lg">
                {poolStats.activeConnections}
              </div>
            </div>

            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(0,180,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
                <span className="text-[rgba(0,212,255,0.6)] text-sm">空闲</span>
              </div>
              <div className="text-[rgba(0,212,255,0.7)] font-semibold text-lg">
                {poolStats.idleConnections}
              </div>
            </div>

            <div className="bg-[rgba(0,0,0,0.2)] rounded-xl p-4 border border-[rgba(0,180,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[rgba(0,212,255,0.6)]" />
                <span className="text-[rgba(0,212,255,0.6)] text-sm">等待</span>
              </div>
              <div className="text-[#ffdd00] font-semibold text-lg">
                {poolStats.waitingRequests}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {connection.lastError && (
        <GlassCard className="p-4 bg-[rgba(255,51,54,0.1)] border border-[rgba(255,51,54,0.3)]">
          <div className="flex items-center gap-2 text-[#ff3366]">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">最后错误: {connection.lastError}</span>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
