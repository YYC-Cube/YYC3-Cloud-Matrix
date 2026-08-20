/**
 * @file: SlowQueryMonitor.ts
 * @description: SlowQueryMonitor.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import type { SlowQueryAlert, QueryResult, DatabaseConfig } from "./types";

export interface SlowQueryRecord {
  id: string;
  query: string;
  executionTime: number;
  threshold: number;
  timestamp: number;
  database: string;
  rowsAffected: number;
  errorMessage?: string;
  stackTrace?: string;
}

export interface MonitorConfig {
  enabled: boolean;
  threshold: number;
  maxRecords: number;
  retentionPeriod: number;
  enableAlerts: boolean;
  alertChannels: AlertChannel[];
  aggregationWindow: number;
}

export interface AlertChannel {
  type: "email" | "webhook" | "slack" | "console";
  config: Record<string, unknown>;
}

export interface SlowQueryStats {
  totalQueries: number;
  slowQueries: number;
  slowQueryRate: number;
  avgExecutionTime: number;
  maxExecutionTime: number;
  topSlowQueries: SlowQueryRecord[];
}

export class SlowQueryMonitor {
  private slowQueries: Map<string, SlowQueryRecord> = new Map();
  private queryHistory: Array<{ query: string; executionTime: number; timestamp: number }> = [];
  private config: MonitorConfig;
  private connection: unknown;
  private dbConfig: DatabaseConfig;
  private alertCallbacks: Map<string, (alert: SlowQueryAlert) => void> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(connection: unknown, dbConfig: DatabaseConfig, config: Partial<MonitorConfig> = {}) {
    this.connection = connection;
    this.dbConfig = dbConfig;
    this.config = {
      enabled: true,
      threshold: 1000,
      maxRecords: 1000,
      retentionPeriod: 24 * 60 * 60 * 1000,
      enableAlerts: true,
      alertChannels: [],
      aggregationWindow: 60 * 1000,
      ...config,
    };

    this.startCleanup();
  }

  /**
   * 监控查询
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async monitorQuery<T = any>(
    query: string,
    executeFn: () => Promise<QueryResult<T>>
  ): Promise<QueryResult<T>> {
    if (!this.config.enabled) {
      return executeFn();
    }

    const startTime = Date.now();
    const queryId = this.generateQueryId(query);

    try {
      const result = await executeFn();
      const executionTime = Date.now() - startTime;

      this.recordQuery(queryId, query, executionTime, result.rowCount || 0);

      if (executionTime > this.config.threshold) {
        await this.handleSlowQuery(queryId, query, executionTime, result.rowCount || 0);
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.recordQuery(queryId, query, executionTime, 0, error instanceof Error ? error.message : String(error));

      if (executionTime > this.config.threshold) {
        await this.handleSlowQuery(
          queryId,
          query,
          executionTime,
          0,
          error instanceof Error ? error.message : String(error)
        );
      }

      throw error;
    }
  }

  /**
   * 记录查询
   */
  private recordQuery(
    queryId: string,
    query: string,
    executionTime: number,
    _rowsAffected: number,
    _errorMessage?: string
  ): void {
    this.queryHistory.push({
      query,
      executionTime,
      timestamp: Date.now(),
    });

    if (this.queryHistory.length > this.config.maxRecords * 2) {
      this.queryHistory = this.queryHistory.slice(-this.config.maxRecords);
    }
  }

  /**
   * 处理慢查询
   */
  private async handleSlowQuery(
    queryId: string,
    query: string,
    executionTime: number,
    rowsAffected: number,
    errorMessage?: string
  ): Promise<void> {
    const record: SlowQueryRecord = {
      id: queryId,
      query,
      executionTime,
      threshold: this.config.threshold,
      timestamp: Date.now(),
      database: this.dbConfig.database,
      rowsAffected,
      errorMessage,
    };

    this.slowQueries.set(queryId, record);

    if (this.slowQueries.size > this.config.maxRecords) {
      this.evictOldestRecord();
    }

    if (this.config.enableAlerts) {
      await this.sendAlert(record);
    }
  }

  /**
   * 发送告警
   */
  private async sendAlert(record: SlowQueryRecord): Promise<void> {
    const alert: SlowQueryAlert = {
      query: record.query,
      executionTime: record.executionTime,
      threshold: record.threshold,
      timestamp: record.timestamp,
      database: record.database,
    };

    for (const channel of this.config.alertChannels) {
      try {
        await this.sendAlertToChannel(alert, channel);
      } catch (error) {
        console.error(`Failed to send alert to ${channel.type}:`, error);
      }
    }

    for (const callback of this.alertCallbacks.values()) {
      try {
        callback(alert);
      } catch (error) {
        console.error("Alert callback error:", error);
      }
    }
  }

  /**
   * 发送告警到指定渠道
   */
  private async sendAlertToChannel(alert: SlowQueryAlert, channel: AlertChannel): Promise<void> {
    switch (channel.type) {
      case "console":
        console.warn("Slow Query Alert:", alert);
        break;

      case "webhook":
        await fetch(channel.config.url as string, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alert),
        });
        break;

      case "slack":
        await fetch(channel.config.webhookUrl as string, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Slow Query Detected (${alert.executionTime}ms > ${alert.threshold}ms)`,
            attachments: [
              {
                text: alert.query,
                color: "warning",
              },
            ],
          }),
        });
        break;

      case "email":
        console.info("Email alert not implemented");
        break;
    }
  }

  /**
   * 获取慢查询记录
   */
  public getSlowQueries(options: {
    limit?: number;
    since?: number;
    minExecutionTime?: number;
  } = {}): SlowQueryRecord[] {
    let records = Array.from(this.slowQueries.values());

    const { since, minExecutionTime, limit } = options;

    if (since !== undefined) {
      records = records.filter((r) => r.timestamp >= since);
    }

    if (minExecutionTime !== undefined) {
      records = records.filter((r) => r.executionTime >= minExecutionTime);
    }

    records.sort((a, b) => b.executionTime - a.executionTime);

    if (limit !== undefined) {
      records = records.slice(0, limit);
    }

    return records;
  }

  /**
   * 获取统计信息
   */
  public getStats(windowMs?: number): SlowQueryStats {
    const now = Date.now();
    const relevantHistory = windowMs
      ? this.queryHistory.filter((q) => now - q.timestamp <= windowMs)
      : this.queryHistory;

    const totalQueries = relevantHistory.length;
    const slowQueryRecords = Array.from(this.slowQueries.values());
    const slowQueries = windowMs
      ? slowQueryRecords.filter((r) => now - r.timestamp <= windowMs)
      : slowQueryRecords;

    const avgExecutionTime =
      totalQueries > 0
        ? relevantHistory.reduce((sum, q) => sum + q.executionTime, 0) / totalQueries
        : 0;

    const maxExecutionTime =
      relevantHistory.length > 0
        ? Math.max(...relevantHistory.map((q) => q.executionTime))
        : 0;

    return {
      totalQueries,
      slowQueries: slowQueries.length,
      slowQueryRate: totalQueries > 0 ? slowQueries.length / totalQueries : 0,
      avgExecutionTime,
      maxExecutionTime,
      topSlowQueries: slowQueryRecords
        .sort((a, b) => b.executionTime - a.executionTime)
        .slice(0, 10),
    };
  }

  /**
   * 添加告警回调
   */
  public onAlert(id: string, callback: (alert: SlowQueryAlert) => void): void {
    this.alertCallbacks.set(id, callback);
  }

  /**
   * 移除告警回调
   */
  public offAlert(id: string): void {
    this.alertCallbacks.delete(id);
  }

  /**
   * 清除慢查询记录
   */
  public clearSlowQueries(): void {
    this.slowQueries.clear();
  }

  /**
   * 清除历史记录
   */
  public clearHistory(): void {
    this.queryHistory = [];
    this.slowQueries.clear();
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  public getConfig(): MonitorConfig {
    return { ...this.config };
  }

  /**
   * 销毁监控器
   */
  public destroy(): void {
    this.stopCleanup();
    this.clearHistory();
    this.alertCallbacks.clear();
  }

  /**
   * 驱逐最旧的记录
   */
  private evictOldestRecord(): void {
    let oldestId: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [id, record] of this.slowQueries) {
      if (record.timestamp < oldestTimestamp) {
        oldestTimestamp = record.timestamp;
        oldestId = id;
      }
    }

    if (oldestId) {
      this.slowQueries.delete(oldestId);
    }
  }

  /**
   * 生成查询 ID
   */
  private generateQueryId(query: string): string {
    const hash = this.hashQuery(query);
    return `${hash}_${Date.now()}`;
  }

  /**
   * 哈希查询
   */
  private hashQuery(query: string): string {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 启动清理定时器
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      return;
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupOldRecords();
    }, 60 * 1000);
  }

  /**
   * 停止清理定时器
   */
  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 清理旧记录
   */
  private cleanupOldRecords(): void {
    const now = Date.now();
    const cutoffTime = now - this.config.retentionPeriod;

    for (const [id, record] of this.slowQueries.entries()) {
      if (record.timestamp < cutoffTime) {
        this.slowQueries.delete(id);
      }
    }

    this.queryHistory = this.queryHistory.filter((q) => q.timestamp >= cutoffTime);
  }
}
