/**
 * @file: ConnectionManager.ts
 * @description: ConnectionManager.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import type {
  DatabaseConfig,
  ConnectionInfo,
  ConnectionStatus,
  HealthCheckResult,
  ConnectionPoolConfig,
  PoolStats,
  ConnectionEvent,
} from "./types";

export class ConnectionManager {
  private connections: Map<string, ConnectionInfo> = new Map();
  private poolConfigs: Map<string, ConnectionPoolConfig> = new Map();
  private healthCheckTimers: Map<string, NodeJS.Timeout> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, Array<(event: ConnectionEvent) => void>> = new Map();

  private static instance: ConnectionManager;
  private testMode = false;

  private constructor() {}

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  public setTestMode(enabled: boolean): void {
    this.testMode = enabled;
  }

  /**
   * 创建数据库连接
   */
  public async createConnection(
    id: string,
    name: string,
    config: DatabaseConfig,
    poolConfig?: ConnectionPoolConfig
  ): Promise<ConnectionInfo> {
    const connectionInfo: ConnectionInfo = {
      id,
      name,
      config,
      status: "connecting",
      retryCount: 0,
    };

    this.connections.set(id, connectionInfo);

    if (poolConfig) {
      this.poolConfigs.set(id, poolConfig);
    }

    try {
      await this.establishConnection(id, config);
      connectionInfo.status = "connected";
      connectionInfo.connectedAt = Date.now();

      this.startHealthCheck(id);
      this.emitConnectionEvent("connected", connectionInfo);

      return connectionInfo;
    } catch (error) {
      connectionInfo.status = "error";
      connectionInfo.lastError = error instanceof Error ? error.message : String(error);

      this.emitConnectionEvent("error", connectionInfo);
      throw error;
    }
  }

  /**
   * 建立实际连接（模拟实现）
   */
  private async establishConnection(
    id: string,
    config: DatabaseConfig
  ): Promise<void> {
    if (this.testMode) {
      return;
    }

    const timeout = config.connectionTimeout || 10000;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Connection timeout after ${timeout}ms`));
      }, timeout);

      const connectTimer = setTimeout(() => {
        clearTimeout(timer);
        resolve();
      }, 500 + Math.random() * 1000);

      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).__VITEST__) {
        const _w = window as unknown as Record<string, unknown>;
        (_w.__VITEST_TIMERS__ as NodeJS.Timeout[]) = (_w.__VITEST_TIMERS__ as NodeJS.Timeout[]) || [];
        (_w.__VITEST_TIMERS__ as NodeJS.Timeout[]).push(connectTimer);
      }
    });
  }

  /**
   * 关闭连接
   */
  public async closeConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error(`Connection ${id} not found`);
    }

    this.stopHealthCheck(id);
    this.stopReconnect(id);

    connection.status = "disconnected";
    this.connections.delete(id);
    this.poolConfigs.delete(id);

    this.emitConnectionEvent("disconnected", connection);
  }

  /**
   * 获取连接信息
   */
  public getConnection(id: string): ConnectionInfo | undefined {
    return this.connections.get(id);
  }

  /**
   * 获取所有连接
   */
  public getAllConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values());
  }

  /**
   * 检查连接状态
   */
  public getConnectionStatus(id: string): ConnectionStatus {
    const connection = this.connections.get(id);
    return connection?.status || "disconnected";
  }

  /**
   * 执行健康检查
   */
  public async healthCheck(id: string): Promise<HealthCheckResult> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error(`Connection ${id} not found`);
    }

    const startTime = Date.now();

    try {
      await this.pingConnection(id);

      const latency = Date.now() - startTime;

      return {
        isHealthy: true,
        latency,
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        isHealthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        checkedAt: Date.now(),
      };
    }
  }

  /**
   * Ping 连接（模拟实现）
   */
  private async pingConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error(`Connection ${id} not found`);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Ping timeout"));
      }, 5000);

      setTimeout(() => {
        clearTimeout(timer);
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error("Connection lost"));
        }
      }, 50 + Math.random() * 200);
    });
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(id: string): void {
    const connection = this.connections.get(id);
    if (!connection) {return;}

    const interval = connection.healthCheckInterval || 30000;

    const timer = setInterval(async () => {
      const result = await this.healthCheck(id);

      if (!result.isHealthy) {
        await this.handleConnectionError(id, result.error);
      }
    }, interval);

    this.healthCheckTimers.set(id, timer);
  }

  /**
   * 停止健康检查
   */
  private stopHealthCheck(id: string): void {
    const timer = this.healthCheckTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.healthCheckTimers.delete(id);
    }
  }

  /**
   * 处理连接错误
   */
  private async handleConnectionError(id: string, error?: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {return;}

    connection.status = "error";
    connection.lastError = error || "Unknown error";
    connection.retryCount++;

    this.emitConnectionEvent("error", connection);

    const maxRetries = connection.config.maxRetries || 3;

    if (connection.retryCount <= maxRetries) {
      await this.reconnect(id);
    } else {
      this.stopReconnect(id);
      this.emitConnectionEvent("failed", connection);
    }
  }

  /**
   * 重新连接
   */
  private async reconnect(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {return;}

    connection.status = "reconnecting";

    const delay = Math.min(1000 * Math.pow(2, connection.retryCount), 30000);

    const timer = setTimeout(async () => {
      try {
        await this.establishConnection(id, connection.config);
        connection.status = "connected";
        connection.retryCount = 0;
        connection.lastError = undefined;

        this.emitConnectionEvent("reconnected", connection);
      } catch (error) {
        connection.status = "error";
        connection.lastError = error instanceof Error ? error.message : String(error);
        await this.handleConnectionError(id, connection.lastError);
      }
    }, delay);

    this.reconnectTimers.set(id, timer);
  }

  /**
   * 停止重连
   */
  private stopReconnect(id: string): void {
    const timer = this.reconnectTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(id);
    }
  }

  /**
   * 获取连接池统计
   */
  public getPoolStats(id: string): PoolStats | null {
    const poolConfig = this.poolConfigs.get(id);
    if (!poolConfig) {return null;}

    const connection = this.connections.get(id);
    if (!connection) {return null;}

    return {
      totalConnections: poolConfig.maxConnections,
      activeConnections: Math.floor(Math.random() * poolConfig.maxConnections),
      idleConnections: Math.floor(Math.random() * poolConfig.maxConnections),
      waitingRequests: Math.floor(Math.random() * 5),
    };
  }

  /**
   * 更新连接池配置
   */
  public updatePoolConfig(
    id: string,
    config: Partial<ConnectionPoolConfig>
  ): void {
    const existing = this.poolConfigs.get(id);
    if (existing) {
      this.poolConfigs.set(id, { ...existing, ...config });
    }
  }

  /**
   * 获取连接池配置
   */
  public getPoolConfig(id: string): ConnectionPoolConfig | undefined {
    return this.poolConfigs.get(id);
  }

  /**
   * 发射连接事件
   */
  private emitConnectionEvent(
    event: "connected" | "disconnected" | "error" | "reconnected" | "failed",
    connection: ConnectionInfo
  ): void {
    const customEvent = new CustomEvent(`db-connection-${event}`, {
      detail: connection,
    });
    window.dispatchEvent(customEvent);
  }

  /**
   * 添加连接事件监听器
   */
  public onConnectionEvent(
    event: "connected" | "disconnected" | "error" | "reconnected" | "failed",
    callback: (connection: ConnectionInfo) => void
  ): () => void {
    const handler = (e: Event) => {
      callback((e as CustomEvent).detail);
    };

    window.addEventListener(`db-connection-${event}`, handler);

    return () => {
      window.removeEventListener(`db-connection-${event}`, handler);
    };
  }

  /**
   * 关闭所有连接
   */
  public async closeAllConnections(): Promise<void> {
    const connectionIds = Array.from(this.connections.keys());

    await Promise.all(
      connectionIds.map((id) => this.closeConnection(id))
    );
  }

  /**
   * 获取连接统计
   */
  public getConnectionStats(): {
    total: number;
    connected: number;
    error: number;
    reconnecting: number;
  } {
    const connections = Array.from(this.connections.values());

    return {
      total: connections.length,
      connected: connections.filter((c) => c.status === "connected").length,
      error: connections.filter((c) => c.status === "error").length,
      reconnecting: connections.filter((c) => c.status === "reconnecting").length,
    };
  }
}

export const connectionManager = ConnectionManager.getInstance();
