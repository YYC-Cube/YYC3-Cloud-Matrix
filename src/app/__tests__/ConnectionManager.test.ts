/**
 * @file: ConnectionManager.test.ts
 * @description: ConnectionManager.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { connectionManager } from "../../database/ConnectionManager";
import type { DatabaseConfig, ConnectionPoolConfig } from "../../database/types";

describe("ConnectionManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    connectionManager.setTestMode(true);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await connectionManager.closeAllConnections();
    vi.clearAllTimers();
    connectionManager.setTestMode(false);
  });

  describe("createConnection", () => {
    it("should create a new connection", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      const connection = await connectionManager.createConnection(
        "test-conn-1",
        "Test Connection",
        config
      );

      expect(connection).toBeDefined();
      expect(connection.id).toBe("test-conn-1");
      expect(connection.name).toBe("Test Connection");
      expect(connection.status).toBe("connected");
      expect(connection.connectedAt).toBeDefined();
    });

    it("should create connection with pool config", async () => {
      const config: DatabaseConfig = {
        type: "mysql",
        host: "localhost",
        port: 3306,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      const poolConfig: ConnectionPoolConfig = {
        minConnections: 2,
        maxConnections: 10,
        acquireTimeout: 30000,
        idleTimeout: 300000,
        maxLifetime: 3600000,
      };

      const connection = await connectionManager.createConnection(
        "test-conn-2",
        "MySQL Connection",
        config,
        poolConfig
      );

      expect(connection).toBeDefined();
      expect(connection.status).toBe("connected");

      const poolStats = connectionManager.getPoolStats("test-conn-2");
      expect(poolStats).toBeDefined();
      expect(poolStats?.totalConnections).toBe(10);
    });
  });

  describe("closeConnection", () => {
    it("should close an existing connection", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      await connectionManager.createConnection(
        "test-conn-close",
        "Close Connection",
        config
      );

      await connectionManager.closeConnection("test-conn-close");

      const connection = connectionManager.getConnection("test-conn-close");
      expect(connection).toBeUndefined();
    });

    it("should throw error for non-existent connection", async () => {
      await expect(
        connectionManager.closeConnection("non-existent")
      ).rejects.toThrow("Connection non-existent not found");
    });
  });

  describe("getConnection", () => {
    it("should return connection info", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      await connectionManager.createConnection(
        "test-conn-get",
        "Get Connection",
        config
      );

      const connection = connectionManager.getConnection("test-conn-get");

      expect(connection).toBeDefined();
      expect(connection?.id).toBe("test-conn-get");
    });

    it("should return undefined for non-existent connection", () => {
      const connection = connectionManager.getConnection("non-existent");
      expect(connection).toBeUndefined();
    });
  });

  describe("getAllConnections", () => {
    it("should return all connections", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      await connectionManager.createConnection("conn-1", "Connection 1", config);
      await connectionManager.createConnection("conn-2", "Connection 2", config);
      await connectionManager.createConnection("conn-3", "Connection 3", config);

      const connections = connectionManager.getAllConnections();

      expect(connections).toHaveLength(3);
      expect(connections.map((c) => c.id)).toEqual(
        expect.arrayContaining(["conn-1", "conn-2", "conn-3"])
      );
    });
  });

  describe("getConnectionStatus", () => {
    it("should return connection status", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      await connectionManager.createConnection(
        "test-conn-status",
        "Status Connection",
        config
      );

      const status = connectionManager.getConnectionStatus("test-conn-status");

      expect(status).toBe("connected");
    });

    it("should return disconnected for non-existent connection", () => {
      const status = connectionManager.getConnectionStatus("non-existent");
      expect(status).toBe("disconnected");
    });
  });

  describe("getPoolStats", () => {
    it("should return pool statistics", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      const poolConfig: ConnectionPoolConfig = {
        minConnections: 2,
        maxConnections: 10,
        acquireTimeout: 30000,
        idleTimeout: 300000,
        maxLifetime: 3600000,
      };

      await connectionManager.createConnection(
        "test-conn-pool",
        "Pool Connection",
        config,
        poolConfig
      );

      const stats = connectionManager.getPoolStats("test-conn-pool");

      expect(stats).toBeDefined();
      expect(stats?.totalConnections).toBe(10);
      expect(stats?.activeConnections).toBeGreaterThanOrEqual(0);
      expect(stats?.idleConnections).toBeGreaterThanOrEqual(0);
      expect(stats?.waitingRequests).toBeGreaterThanOrEqual(0);
    });

    it("should return null for connection without pool", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      await connectionManager.createConnection(
        "test-conn-no-pool",
        "No Pool Connection",
        config
      );

      const stats = connectionManager.getPoolStats("test-conn-no-pool");

      expect(stats).toBeNull();
    });
  });

  describe("updatePoolConfig", () => {
    it("should update pool configuration", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      const poolConfig: ConnectionPoolConfig = {
        minConnections: 2,
        maxConnections: 10,
        acquireTimeout: 30000,
        idleTimeout: 300000,
        maxLifetime: 3600000,
      };

      await connectionManager.createConnection(
        "test-conn-update-pool",
        "Update Pool Connection",
        config,
        poolConfig
      );

      connectionManager.updatePoolConfig("test-conn-update-pool", {
        maxConnections: 20,
      });

      const updatedConfig = connectionManager.getPoolConfig("test-conn-update-pool");

      expect(updatedConfig).toBeDefined();
      expect(updatedConfig?.maxConnections).toBe(20);
    });
  });

  describe("getConnectionStats", () => {
    it("should return connection statistics", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      await connectionManager.createConnection("conn-1", "Connection 1", config);
      await connectionManager.createConnection("conn-2", "Connection 2", config);

      const stats = connectionManager.getConnectionStats();

      expect(stats).toBeDefined();
      expect(stats.total).toBe(2);
      expect(stats.connected).toBe(2);
      expect(stats.error).toBe(0);
      expect(stats.reconnecting).toBe(0);
    });
  });

  describe("closeAllConnections", () => {
    it("should close all connections", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "testdb",
        username: "testuser",
        password: "testpass",
      };

      await connectionManager.createConnection("conn-1", "Connection 1", config);
      await connectionManager.createConnection("conn-2", "Connection 2", config);
      await connectionManager.createConnection("conn-3", "Connection 3", config);

      await connectionManager.closeAllConnections();

      const connections = connectionManager.getAllConnections();

      expect(connections).toHaveLength(0);
    });
  });
});
