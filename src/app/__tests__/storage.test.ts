/**
 * @file: storage.test.ts
 * @description: storage.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect } from "vitest";
import type { StorageConfig, StorageStatus, StorageEvent, SyncData, OfflineQueueItem } from "../types/storage";

describe("存储类型定义测试", () => {
  describe("StorageConfig", () => {
    it("应该定义本地存储配置", () => {
      const config: StorageConfig = {
        type: "localStorage",
        syncInterval: 30,
        autoSync: true,
        offlineMode: false,
        conflictResolution: "local",
      };

      expect(config.type).toBe("localStorage");
      expect(config.syncInterval).toBe(30);
      expect(config.autoSync).toBe(true);
    });

    it("应该定义数据库存储配置", () => {
      const config: StorageConfig = {
        type: "database",
        syncInterval: 60,
        autoSync: true,
        offlineMode: true,
        conflictResolution: "remote",
        database: {
          type: "postgresql",
          host: "localhost",
          port: 5432,
          database: "yyc3",
          username: "admin",
          password: "password",
        },
      };

      expect(config.type).toBe("database");
      expect(config.database?.type).toBe("postgresql");
    });
  });

  describe("StorageStatus", () => {
    it("应该定义存储状态", () => {
      const status: StorageStatus = {
        connected: true,
        syncing: false,
        lastSync: Date.now(),
        pendingChanges: 0,
      };

      expect(status.connected).toBe(true);
      expect(status.syncing).toBe(false);
      expect(status.pendingChanges).toBe(0);
    });

    it("应该包含错误信息", () => {
      const status: StorageStatus = {
        connected: false,
        syncing: false,
        lastSync: null,
        pendingChanges: 5,
        error: "Connection timeout",
      };

      expect(status.connected).toBe(false);
      expect(status.error).toBe("Connection timeout");
      expect(status.pendingChanges).toBe(5);
    });
  });

  describe("StorageEvent", () => {
    it("应该定义同步开始事件", () => {
      const event: StorageEvent = {
        type: "syncStart",
        data: { direction: "local-to-remote" } as unknown as SyncData,
      };

      expect(event.type).toBe("syncStart");
      expect((event.data as { direction: string })?.direction).toBe("local-to-remote");
    });

    it("应该定义同步完成事件", () => {
      const event: StorageEvent = {
        type: "syncComplete",
        data: {
          modelsSynced: 10,
          agentsSynced: 5,
          nodesSynced: 3,
        } as unknown as SyncData,
      };

      expect(event.type).toBe("syncComplete");
      expect((event.data as { modelsSynced: number })?.modelsSynced).toBe(10);
    });

    it("应该定义同步错误事件", () => {
      const event: StorageEvent = {
        type: "syncError",
        error: "Network connection failed",
      };

      expect(event.type).toBe("syncError");
      expect(event.error).toBe("Network connection failed");
    });

    it("应该定义离线事件", () => {
      const event: StorageEvent = {
        type: "offline",
      };

      expect(event.type).toBe("offline");
    });

    it("应该定义在线事件", () => {
      const event: StorageEvent = {
        type: "online",
      };

      expect(event.type).toBe("online");
    });

    it("应该定义离线操作添加事件", () => {
      const event: StorageEvent = {
        type: "offlineOperationAdded",
        data: { operation: "addModel", item: "model-1" } as unknown as OfflineQueueItem,
      };

      expect(event.type).toBe("offlineOperationAdded");
      expect((event.data as { operation: string })?.operation).toBe("addModel");
    });

    it("应该定义离线队列处理事件", () => {
      const event: StorageEvent = {
        type: "offlineQueueProcessed",
        data: { processed: 5, failed: 0 } as unknown as SyncData,
      };

      expect(event.type).toBe("offlineQueueProcessed");
      expect((event.data as { processed: number })?.processed).toBe(5);
    });
  });
});
