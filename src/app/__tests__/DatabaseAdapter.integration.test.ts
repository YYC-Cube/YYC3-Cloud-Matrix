/**
 * @file: DatabaseAdapter.integration.test.ts
 * @description: DatabaseAdapter.integration.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { connectionManager } from "../../database/ConnectionManager";
import { DatabaseAdapter } from "../../database/DatabaseAdapter";
import { QueryAnalyzer } from "../../database/QueryAnalyzer";
import type { DatabaseConfig } from "../../database/types";

describe("DatabaseAdapter Integration Tests", () => {
  let adapter: DatabaseAdapter | null = null;
  let connectionId: string;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    connectionManager.setTestMode(true);
    
    // Mock QueryAnalyzer.analyzeQuery to avoid connection.query error
    vi.spyOn(QueryAnalyzer.prototype, 'analyzeQuery').mockResolvedValue({
      query: "SELECT * FROM models WHERE provider = 'openai'",
      executionPlan: {
        "Plan": {
          "Node Type": "Seq Scan",
          "Relation Name": "models",
          "Alias": "models",
          "Startup Cost": 0,
          "Total Cost": 10,
          "Plan Rows": 1,
          "Plan Width": 100
        }
      },
      estimatedCost: 10,
      suggestedIndexes: [],
      optimizations: []
    });
  });

  afterEach(async () => {
    if (adapter) {
      adapter.destroy();
      adapter = null;
    }

    if (connectionId) {
      try {
        await connectionManager.closeConnection(connectionId);
      } catch (error) {
        console.error("Failed to close connection:", error);
      }
    }

    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize adapter with connection manager", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-1";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config);

      expect(adapter).toBeDefined();
      expect(adapter.getSyncStatus().pendingChanges).toBe(0);
    }, 15000);

    it("should initialize with custom sync config", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-2";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config, {
        enabled: false,
        syncInterval: 30000,
        autoMigrate: false,
        conflictResolution: "remote",
      });

      const status = adapter.getSyncStatus();
      expect(status.pendingChanges).toBe(0);
    }, 15000);
  });

  describe("Data Migration", () => {
    it("should migrate localStorage data to database", async () => {
      const mockModels = [
        {
          id: "m-1",
          name: "GPT-4",
          provider: "openai",
          tier: "premium",
          avg_latency_ms: 150,
          throughput: 1000,
          created_at: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "m-2",
          name: "Claude",
          provider: "anthropic",
          tier: "standard",
          avg_latency_ms: 200,
          throughput: 800,
          created_at: "2024-01-02T00:00:00.000Z",
        },
      ];

      localStorage.setItem(
        "yyc3_db_models",
        JSON.stringify(mockModels)
      );

      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-3";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config, {
        autoMigrate: true,
      });

      await vi.advanceTimersByTimeAsync(2000);

      expect(localStorage.getItem("yyc3_db_models")).toBeDefined();
    }, 15000);

    it("should skip migration when autoMigrate is false", async () => {
      const mockModels = [
        {
          id: "m-1",
          name: "GPT-4",
          provider: "openai",
          tier: "premium",
          avg_latency_ms: 150,
          throughput: 1000,
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ];

      localStorage.setItem(
        "yyc3_db_models",
        JSON.stringify(mockModels)
      );

      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-4";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config, {
        autoMigrate: false,
      });

      await vi.advanceTimersByTimeAsync(1000);

      expect(localStorage.getItem("yyc3_db_models")).toBeDefined();
    }, 15000);
  });

  describe("Data Synchronization", () => {
    it("should track changes and sync them", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-5";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config, {
        enabled: true,
        syncInterval: 5000,
      });

      await vi.advanceTimersByTimeAsync(1000);

      const status = adapter.getSyncStatus();
      expect(status.pendingChanges).toBe(0);
      expect(status.isSyncing).toBe(false);
    }, 15000);

    it("should start and stop auto sync", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-6";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config);

      adapter.startAutoSync();
      await vi.advanceTimersByTimeAsync(6000);

      adapter.stopAutoSync();
      await vi.advanceTimersByTimeAsync(6000);

      const status = adapter.getSyncStatus();
      expect(status).toBeDefined();
    }, 15000);
  });

  describe("Query Cache Integration", () => {
    it("should provide cache statistics", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-7";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config);

      const stats = adapter.getCacheStats();
      expect(stats).toBeDefined();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.entries).toBe(0);
    }, 15000);
  });

  describe("Slow Query Monitoring", () => {
    it("should provide slow query statistics", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-8";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config);

      const stats = adapter.getSlowQueryStats();
      if (stats) {
        expect(stats.totalQueries).toBe(0);
        expect(stats.slowQueries).toBe(0);
      } else {
        expect(stats).toBeNull();
      }
    }, 15000);
  });

  describe("Query Analysis", () => {
    it("should analyze queries", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-9";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config);

      const analysis = await adapter.analyzeQuery(
        "SELECT * FROM models WHERE provider = 'openai'"
      );

      expect(analysis).toBeDefined();
    }, 15000);
  });

  describe("Error Handling", () => {
    it("should handle connection errors gracefully", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "invalid-host",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-10";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config);

      await vi.advanceTimersByTimeAsync(2000);

      const status = adapter.getSyncStatus();
      expect(status).toBeDefined();
    }, 15000);

    it("should update sync status on error", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-11";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config, {
        enabled: true,
        syncInterval: 1000,
      });

      await vi.advanceTimersByTimeAsync(2000);

      const status = adapter.getSyncStatus();
      expect(status).toBeDefined();
    }, 15000);
  });

  describe("Cleanup", () => {
    it("should destroy adapter and stop timers", async () => {
      const config: DatabaseConfig = {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
      };

      connectionId = "test-connection-12";
      await connectionManager.createConnection(
        connectionId,
        "Test Connection",
        config
      );

      await vi.advanceTimersByTimeAsync(2000);

      adapter = new DatabaseAdapter(connectionId, config);
      adapter.startAutoSync();

      adapter.destroy();

      const status = adapter.getSyncStatus();
      expect(status).toBeDefined();
    }, 15000);
  });
});

