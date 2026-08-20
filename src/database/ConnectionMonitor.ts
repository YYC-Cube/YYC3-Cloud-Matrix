/**
 * @file: ConnectionMonitor.ts
 * @description: ConnectionMonitor.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import type {
  HealthCheckResult,
  PoolStats,
} from "./types";

export interface ConnectionMetrics {
  connectionId: string;
  queryCount: number;
  successCount: number;
  errorCount: number;
  totalLatency: number;
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
  lastQueryTime: number;
  uptime: number;
}

export interface MonitorConfig {
  alertThresholds: {
    errorRate: number;
    avgLatency: number;
    maxLatency: number;
  };
  metricsRetention: number;
  enableAlerts: boolean;
}

export class ConnectionMonitor {
  private metrics: Map<string, ConnectionMetrics> = new Map();
  private healthHistory: Map<string, HealthCheckResult[]> = new Map();
  private poolHistory: Map<string, PoolStats[]> = new Map();
  private config: MonitorConfig;
  private alertCallbacks: Map<string, (alert: Alert) => void> = new Map();

  constructor(config?: Partial<MonitorConfig>) {
    this.config = {
      alertThresholds: {
        errorRate: 0.1,
        avgLatency: 500,
        maxLatency: 2000,
      },
      metricsRetention: 3600000,
      enableAlerts: true,
      ...config,
    };
  }

  /**
   * 记录查询指标
   */
  public recordQuery(
    connectionId: string,
    latency: number,
    success: boolean
  ): void {
    let metrics = this.metrics.get(connectionId);

    if (!metrics) {
      metrics = {
        connectionId,
        queryCount: 0,
        successCount: 0,
        errorCount: 0,
        totalLatency: 0,
        avgLatency: 0,
        maxLatency: 0,
        minLatency: Infinity,
        lastQueryTime: Date.now(),
        uptime: Date.now(),
      };
      this.metrics.set(connectionId, metrics);
    }

    metrics.queryCount++;
    metrics.totalLatency += latency;
    metrics.avgLatency = metrics.totalLatency / metrics.queryCount;
    metrics.maxLatency = Math.max(metrics.maxLatency, latency);
    metrics.minLatency = Math.min(metrics.minLatency, latency);
    metrics.lastQueryTime = Date.now();

    if (success) {
      metrics.successCount++;
    } else {
      metrics.errorCount++;
    }

    this.checkAlerts(connectionId, metrics);
  }

  /**
   * 记录健康检查结果
   */
  public recordHealthCheck(
    connectionId: string,
    result: HealthCheckResult
  ): void {
    let history = this.healthHistory.get(connectionId);

    if (!history) {
      history = [];
      this.healthHistory.set(connectionId, history);
    }

    history.push(result);

    const retentionLimit = Math.floor(this.config.metricsRetention / 30000);
    if (history.length > retentionLimit) {
      history.shift();
    }
  }

  /**
   * 记录连接池统计
   */
  public recordPoolStats(
    connectionId: string,
    stats: PoolStats
  ): void {
    let history = this.poolHistory.get(connectionId);

    if (!history) {
      history = [];
      this.poolHistory.set(connectionId, history);
    }

    history.push(stats);

    const retentionLimit = Math.floor(this.config.metricsRetention / 30000);
    if (history.length > retentionLimit) {
      history.shift();
    }
  }

  /**
   * 获取连接指标
   */
  public getMetrics(connectionId: string): ConnectionMetrics | undefined {
    return this.metrics.get(connectionId);
  }

  /**
   * 获取所有连接指标
   */
  public getAllMetrics(): ConnectionMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * 获取健康检查历史
   */
  public getHealthHistory(
    connectionId: string,
    limit?: number
  ): HealthCheckResult[] {
    const history = this.healthHistory.get(connectionId);
    if (!history) {return [];}

    if (limit) {
      return history.slice(-limit);
    }

    return [...history];
  }

  /**
   * 获取连接池历史
   */
  public getPoolHistory(
    connectionId: string,
    limit?: number
  ): PoolStats[] {
    const history = this.poolHistory.get(connectionId);
    if (!history) {return [];}

    if (limit) {
      return history.slice(-limit);
    }

    return [...history];
  }

  /**
   * 检查告警
   */
  private checkAlerts(
    connectionId: string,
    metrics: ConnectionMetrics
  ): void {
    if (!this.config.enableAlerts) {return;}

    const errorRate = metrics.errorCount / metrics.queryCount;

    if (errorRate > this.config.alertThresholds.errorRate) {
      this.triggerAlert(connectionId, {
        type: "high_error_rate",
        severity: "warning",
        message: `Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold ${(this.config.alertThresholds.errorRate * 100).toFixed(2)}%`,
        value: errorRate,
        threshold: this.config.alertThresholds.errorRate,
        timestamp: Date.now(),
      });
    }

    if (metrics.avgLatency > this.config.alertThresholds.avgLatency) {
      this.triggerAlert(connectionId, {
        type: "high_latency",
        severity: "warning",
        message: `Average latency ${metrics.avgLatency.toFixed(2)}ms exceeds threshold ${this.config.alertThresholds.avgLatency}ms`,
        value: metrics.avgLatency,
        threshold: this.config.alertThresholds.avgLatency,
        timestamp: Date.now(),
      });
    }

    if (metrics.maxLatency > this.config.alertThresholds.maxLatency) {
      this.triggerAlert(connectionId, {
        type: "max_latency_exceeded",
        severity: "critical",
        message: `Maximum latency ${metrics.maxLatency}ms exceeds threshold ${this.config.alertThresholds.maxLatency}ms`,
        value: metrics.maxLatency,
        threshold: this.config.alertThresholds.maxLatency,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 触发告警
   */
  private triggerAlert(connectionId: string, alert: Alert): void {
    const callback = this.alertCallbacks.get(connectionId);
    if (callback) {
      callback(alert);
    }

    const customEvent = new CustomEvent("db-alert", {
      detail: { connectionId, alert },
    });
    window.dispatchEvent(customEvent);
  }

  /**
   * 添加告警回调
   */
  public onAlert(
    connectionId: string,
    callback: (alert: Alert) => void
  ): () => void {
    this.alertCallbacks.set(connectionId, callback);

    return () => {
      this.alertCallbacks.delete(connectionId);
    };
  }

  /**
   * 清除连接指标
   */
  public clearMetrics(connectionId: string): void {
    this.metrics.delete(connectionId);
    this.healthHistory.delete(connectionId);
    this.poolHistory.delete(connectionId);
  }

  /**
   * 清除所有指标
   */
  public clearAllMetrics(): void {
    this.metrics.clear();
    this.healthHistory.clear();
    this.poolHistory.clear();
  }

  /**
   * 获取监控摘要
   */
  public getSummary(): {
    totalConnections: number;
    totalQueries: number;
    totalErrors: number;
    avgLatency: number;
    uptime: number;
  } {
    const allMetrics = this.getAllMetrics();

    const totalQueries = allMetrics.reduce((sum, m) => sum + m.queryCount, 0);
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const totalLatency = allMetrics.reduce((sum, m) => sum + m.totalLatency, 0);
    const avgLatency = totalQueries > 0 ? totalLatency / totalQueries : 0;
    const uptime = allMetrics.length > 0 ? Date.now() - allMetrics[0].uptime : 0;

    return {
      totalConnections: allMetrics.length,
      totalQueries,
      totalErrors,
      avgLatency,
      uptime,
    };
  }

  /**
   * 更新监控配置
   */
  public updateConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取监控配置
   */
  public getConfig(): MonitorConfig {
    return { ...this.config };
  }
}

export interface Alert {
  type: "high_error_rate" | "high_latency" | "max_latency_exceeded";
  severity: "info" | "warning" | "critical";
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}
