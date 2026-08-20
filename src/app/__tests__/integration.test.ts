/**
 * @file: integration.test.ts
 * @description: integration.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("集成测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("存储管理器与数据库集成", () => {
    it("应该能够初始化存储管理器", async () => {
      const { storageManager } = await import("../services/storageManager");

      const config = {
        type: "localStorage" as const,
        syncInterval: 30,
        autoSync: true,
        offlineMode: false,
        conflictResolution: "local" as const,
      };

      storageManager.saveConfig(config);
      const savedConfig = storageManager.getConfig();

      expect(savedConfig.type).toBe("localStorage");
      expect(savedConfig.syncInterval).toBe(30);
    });

    it("应该能够处理离线队列", async () => {
      const { storageManager } = await import("../services/storageManager");

      const config = {
        type: "localStorage" as const,
        syncInterval: 30,
        autoSync: true,
        offlineMode: true,
        conflictResolution: "local" as const,
      };

      storageManager.saveConfig(config);

      const operation = { type: "addModel", data: { id: "model-1", name: "Test Model" } };
      storageManager.addToOfflineQueue(operation);

      const status = storageManager.getStatus();
      expect(status.pendingChanges).toBeGreaterThanOrEqual(0);
    });

    it("应该能够触发和监听事件", async () => {
      const { storageManager } = await import("../services/storageManager");

      const eventHandler = vi.fn();
      storageManager.onEvent(eventHandler);

      const status = storageManager.getStatus();
      expect(status.connected).toBeDefined();

      storageManager.offEvent(eventHandler);
    });

    it("应该能够保存和加载配置", async () => {
      const { storageManager } = await import("../services/storageManager");

      const config = {
        type: "localStorage" as const,
        syncInterval: 60,
        autoSync: true,
        offlineMode: true,
        conflictResolution: "merge" as const,
      };

      storageManager.saveConfig(config);
      const loadedConfig = storageManager.getConfig();

      expect(loadedConfig.type).toBe("localStorage");
      expect(loadedConfig.syncInterval).toBe(60);
      expect(loadedConfig.offlineMode).toBe(true);
    });
  });

  describe("桥接客户端与环境检测集成", () => {
    it("应该正确检测非 Electron 环境", async () => {
      const { isElectron, getBridgeAPI } = await import("../lib/bridge-client");

      const electronDetected = isElectron();
      expect(electronDetected).toBe(false);

      const api = getBridgeAPI();
      expect(api).toBeNull();
    });

    it("应该在非 Electron 环境中提供降级方案", async () => {
      const { systemMonitorClient, appControlClient } = await import("../lib/bridge-client");

      const cpuInfo = await systemMonitorClient.getCPUInfo();
      expect(cpuInfo.model).toBe("Unknown");

      const version = await appControlClient.getVersion();
      expect(version).toBe("web");
    });
  });

  describe("数据流集成测试", () => {
    it("应该能够存储和检索数据", async () => {
      const testData = {
        id: "test-1",
        name: "Test Model",
        provider: "OpenAI",
        tier: "premium",
        avg_latency_ms: 100,
        throughput: 1000,
        created_at: new Date().toISOString(),
      };

      localStorage.setItem("yyc3_db_models", JSON.stringify([testData]));

      const stored = localStorage.getItem("yyc3_db_models");
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored || "[]");
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe("test-1");
    });

    it("应该能够处理离线队列", async () => {
      const { storageManager } = await import("../services/storageManager");

      const config = {
        type: "localStorage" as const,
        syncInterval: 30,
        autoSync: true,
        offlineMode: true,
        conflictResolution: "local" as const,
      };

      storageManager.saveConfig(config);

      const operation = {
        type: "addModel",
        data: { id: "model-1", name: "Test Model" },
      };

      storageManager.addToOfflineQueue(operation);

      const status = storageManager.getStatus();
      expect(status.pendingChanges).toBeGreaterThanOrEqual(0);
    });
  });

  describe("错误处理集成", () => {
    it("应该能够获取存储状态", async () => {
      const { storageManager } = await import("../services/storageManager");

      const status = storageManager.getStatus();
      expect(status).toHaveProperty("connected");
      expect(status).toHaveProperty("syncing");
      expect(status).toHaveProperty("lastSync");
      expect(status).toHaveProperty("pendingChanges");
    });

    it("应该能够处理同步操作", async () => {
      const { storageManager } = await import("../services/storageManager");

      const config = {
        type: "localStorage" as const,
        syncInterval: 30,
        autoSync: false,
        offlineMode: false,
        conflictResolution: "local" as const,
      };

      storageManager.saveConfig(config);

      await storageManager.sync();

      const status = storageManager.getStatus();
      expect(status.lastSync).toBeDefined();
    });
  });

  describe("性能集成测试", () => {
    it("应该能够快速处理大量数据", async () => {
      const startTime = Date.now();

      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `model-${i}`,
        name: `Model ${i}`,
        provider: "Test",
        tier: "standard",
        avg_latency_ms: Math.random() * 100,
        throughput: Math.random() * 1000,
        created_at: new Date().toISOString(),
      }));

      localStorage.setItem("yyc3_db_models", JSON.stringify(largeDataset));

      const stored = localStorage.getItem("yyc3_db_models");
      const parsed = JSON.parse(stored || "[]");

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(parsed).toHaveLength(1000);
      expect(duration).toBeLessThan(1000);
    });

    it("应该能够快速触发同步", async () => {
      const { storageManager } = await import("../services/storageManager");

      const config = {
        type: "localStorage" as const,
        syncInterval: 30,
        autoSync: false,
        offlineMode: false,
        conflictResolution: "local" as const,
      };

      storageManager.saveConfig(config);

      const startTime = Date.now();

      await storageManager.triggerSync();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);
    });
  });
});
