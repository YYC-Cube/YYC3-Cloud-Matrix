/**
 * @file: ConnectionPool.ts
 * @description: ConnectionPool.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import type {
  ConnectionPoolConfig,
  PoolStats,
  ConnectionStatus,
} from "./types";

interface PooledConnection {
  id: string;
  createdAt: number;
  lastUsed: number;
  inUse: boolean;
  status: ConnectionStatus;
}

export class ConnectionPool {
  private connections: PooledConnection[] = [];
  private waitingQueue: Array<(connection: PooledConnection) => void> = [];
  private config: ConnectionPoolConfig;
  private connectionIdCounter = 0;

  constructor(config: ConnectionPoolConfig) {
    this.config = config;
    this.initializePool();
  }

  /**
   * 初始化连接池
   */
  private async initializePool(): Promise<void> {
    const promises = [];

    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection());
    }

    await Promise.all(promises);
  }

  /**
   * 创建新连接
   */
  private async createConnection(): Promise<PooledConnection> {
    const connection: PooledConnection = {
      id: `pool-${this.connectionIdCounter++}`,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      inUse: false,
      status: "connected",
    };

    this.connections.push(connection);
    return connection;
  }

  /**
   * 获取连接
   */
  public async acquire(): Promise<PooledConnection> {
    const idleConnection = this.connections.find((c) => !c.inUse && c.status === "connected");

    if (idleConnection) {
      idleConnection.inUse = true;
      idleConnection.lastUsed = Date.now();
      return idleConnection;
    }

    if (this.connections.length < this.config.maxConnections) {
      const newConnection = await this.createConnection();
      newConnection.inUse = true;
      newConnection.lastUsed = Date.now();
      return newConnection;
    }

    return new Promise((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }

  /**
   * 释放连接
   */
  public release(connection: PooledConnection): void {
    if (!connection.inUse) {
      return;
    }

    connection.inUse = false;
    connection.lastUsed = Date.now();

    if (this.waitingQueue.length > 0) {
      const nextRequest = this.waitingQueue.shift();
      if (nextRequest) {
        connection.inUse = true;
        connection.lastUsed = Date.now();
        nextRequest(connection);
      }
    }

    this.cleanupIdleConnections();
  }

  /**
   * 清理空闲连接
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();
    const idleConnections = this.connections.filter(
      (c) => !c.inUse && now - c.lastUsed > this.config.idleTimeout
    );

    if (this.connections.length - idleConnections.length >= this.config.minConnections) {
      idleConnections.forEach((c) => {
        const index = this.connections.indexOf(c);
        if (index > -1) {
          this.connections.splice(index, 1);
        }
      });
    }
  }

  /**
   * 清理过期连接
   */
  public cleanupExpiredConnections(): void {
    const now = Date.now();
    const expiredConnections = this.connections.filter(
      (c) => now - c.createdAt > this.config.maxLifetime
    );

    expiredConnections.forEach((c) => {
      if (!c.inUse) {
        const index = this.connections.indexOf(c);
        if (index > -1) {
          this.connections.splice(index, 1);
        }
      }
    });

    this.ensureMinConnections();
  }

  /**
   * 确保最小连接数
   */
  private async ensureMinConnections(): Promise<void> {
    const activeConnections = this.connections.filter((c) => c.status === "connected");

    if (activeConnections.length < this.config.minConnections) {
      const missing = this.config.minConnections - activeConnections.length;
      const promises = [];

      for (let i = 0; i < missing; i++) {
        promises.push(this.createConnection());
      }

      await Promise.all(promises);
    }
  }

  /**
   * 获取连接池统计
   */
  public getStats(): PoolStats {
    return {
      totalConnections: this.connections.length,
      activeConnections: this.connections.filter((c) => c.inUse).length,
      idleConnections: this.connections.filter((c) => !c.inUse).length,
      waitingRequests: this.waitingQueue.length,
    };
  }

  /**
   * 更新连接池配置
   */
  public updateConfig(config: Partial<ConnectionPoolConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取连接池配置
   */
  public getConfig(): ConnectionPoolConfig {
    return { ...this.config };
  }

  /**
   * 关闭所有连接
   */
  public async closeAll(): Promise<void> {
    this.waitingQueue = [];

    const promises = this.connections.map((c) => this.closeConnection(c));
    await Promise.all(promises);

    this.connections = [];
  }

  /**
   * 关闭单个连接
   */
  private async closeConnection(connection: PooledConnection): Promise<void> {
    connection.status = "disconnected";
    connection.inUse = false;
  }

  /**
   * 获取所有连接
   */
  public getAllConnections(): PooledConnection[] {
    return [...this.connections];
  }

  /**
   * 获取活跃连接数
   */
  public getActiveConnectionCount(): number {
    return this.connections.filter((c) => c.inUse).length;
  }

  /**
   * 获取空闲连接数
   */
  public getIdleConnectionCount(): number {
    return this.connections.filter((c) => !c.inUse).length;
  }

  /**
   * 获取等待请求数
   */
  public getWaitingRequestCount(): number {
    return this.waitingQueue.length;
  }
}
