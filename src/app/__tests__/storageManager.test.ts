/**
 * @file: storageManager.test.ts
 * @description: storageManager.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StorageManager } from "../services/storageManager";
import type { StorageConfig, StorageEvent } from "../types/storage";

// 模拟 localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// 模拟 navigator.onLine
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
});

// 模拟 DatabaseAdapter
vi.mock("../../database/DatabaseAdapter", () => ({
  DatabaseAdapter: vi.fn().mockImplementation(() => ({
    getModels: vi.fn().mockResolvedValue([]),
    getAgents: vi.fn().mockResolvedValue([]),
    getNodes: vi.fn().mockResolvedValue([]),
    executeQuery: vi.fn().mockResolvedValue({ rows: [] }),
    executeWithCache: vi.fn().mockResolvedValue({ rows: [] }),
    destroy: vi.fn(),
  })),
}));

// 模拟 ConnectionManager
vi.mock("../../database/ConnectionManager", () => ({
  connectionManager: {
    getConnection: vi.fn().mockReturnValue(null),
    createConnection: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("StorageManager", () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // 重置 StorageManager 实例
    (StorageManager as any).instance = null;
    storageManager = StorageManager.getInstance();
  });

  afterEach(() => {
    storageManager.destroy();
  });

  describe("配置管理", () => {
    it("应该加载默认配置", () => {
      const config = storageManager.getConfig();
      expect(config.type).toBe("localStorage");
      expect(config.syncInterval).toBe(30);
      expect(config.autoSync).toBe(true);
      expect(config.offlineMode).toBe(true);
      expect(config.conflictResolution).toBe("local");
    });

    it("应该保存配置到 localStorage", () => {
      const newConfig: StorageConfig = {
        type: "database",
        syncInterval: 60,
        autoSync: false,
        offlineMode: false,
        conflictResolution: "remote",
      };

      storageManager.saveConfig(newConfig);
      const savedConfig = storageManager.getConfig();

      expect(savedConfig.type).toBe("database");
      expect(savedConfig.syncInterval).toBe(60);
      expect(savedConfig.autoSync).toBe(false);
      expect(savedConfig.offlineMode).toBe(false);
      expect(savedConfig.conflictResolution).toBe("remote");

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "yyc3_storage_config",
        JSON.stringify(newConfig)
      );
    });

    it("应该从 localStorage 加载已保存的配置", () => {
      const savedConfig: StorageConfig = {
        type: "database",
        syncInterval: 120,
        autoSync: true,
        offlineMode: true,
        conflictResolution: "merge",
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedConfig));

      // 重新创建实例以加载已保存的配置
      (StorageManager as any).instance = null;
      const newManager = StorageManager.getInstance();
      const config = newManager.getConfig();

      expect(config.type).toBe("database");
      expect(config.syncInterval).toBe(120);
      expect(config.conflictResolution).toBe("merge");

      newManager.destroy();
    });
  });

  describe("状态管理", () => {
    it("应该返回当前状态", () => {
      const status = storageManager.getStatus();

      expect(status).toHaveProperty("connected");
      expect(status).toHaveProperty("syncing");
      expect(status).toHaveProperty("lastSync");
      expect(status).toHaveProperty("pendingChanges");
    });

    it("应该正确更新状态", () => {
      storageManager.saveConfig({
        type: "localStorage",
        syncInterval: 30,
        autoSync: false,
        offlineMode: false,
        conflictResolution: "local",
      });

      const status = storageManager.getStatus();
      expect(status.connected).toBe(true);
    });
  });

  describe("事件系统", () => {
    it("应该注册事件监听器", () => {
      const listener = vi.fn();
      storageManager.onEvent(listener);

      // 触发事件
      (storageManager as any).emitEvent({ type: "syncStart" });

      expect(listener).toHaveBeenCalledWith({ type: "syncStart" });
    });

    it("应该移除事件监听器", () => {
      const listener = vi.fn();
      storageManager.onEvent(listener);
      storageManager.offEvent(listener);

      // 触发事件
      (storageManager as any).emitEvent({ type: "syncStart" });

      expect(listener).not.toHaveBeenCalled();
    });

    it("应该处理多个事件监听器", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      storageManager.onEvent(listener1);
      storageManager.onEvent(listener2);

      // 触发事件
      (storageManager as any).emitEvent({ type: "syncComplete" });

      expect(listener1).toHaveBeenCalledWith({ type: "syncComplete" });
      expect(listener2).toHaveBeenCalledWith({ type: "syncComplete" });
    });
  });

  describe("离线操作", () => {
    it("应该添加离线操作到队列", () => {
      // 设置为离线模式
      (storageManager as any).isOnline = false;
      storageManager.saveConfig({
        type: "database",
        syncInterval: 30,
        autoSync: true,
        offlineMode: true,
        conflictResolution: "local",
      });

      const operation = { type: "addModel", data: { id: "model-1", name: "Test Model" } };
      storageManager.addToOfflineQueue(operation);

      const status = storageManager.getStatus();
      expect(status.pendingChanges).toBeGreaterThan(0);
    });

    it("应该在在线时不添加离线操作", () => {
      // 设置为在线
      (storageManager as any).isOnline = true;
      storageManager.saveConfig({
        type: "database",
        syncInterval: 30,
        autoSync: true,
        offlineMode: true,
        conflictResolution: "local",
      });

      const initialStatus = storageManager.getStatus();
      const operation = { type: "addModel", data: { id: "model-1", name: "Test Model" } };
      storageManager.addToOfflineQueue(operation);

      const status = storageManager.getStatus();
      expect(status.pendingChanges).toBe(initialStatus.pendingChanges);
    });
  });

  describe("冲突解决", () => {
    it("应该使用本地优先策略", () => {
      storageManager.saveConfig({
        type: "database",
        syncInterval: 30,
        autoSync: false,
        offlineMode: false,
        conflictResolution: "local",
      });

      const localItem = { id: "1", name: "Local Item", version: 1 };
      const remoteItem = { id: "1", name: "Remote Item", version: 2 };

      const resolved = (storageManager as any).resolveConflict(localItem, remoteItem, "models");
      expect(resolved.name).toBe("Local Item");
    });

    it("应该使用远程优先策略", () => {
      storageManager.saveConfig({
        type: "database",
        syncInterval: 30,
        autoSync: false,
        offlineMode: false,
        conflictResolution: "remote",
      });

      const localItem = { id: "1", name: "Local Item", version: 1 };
      const remoteItem = { id: "1", name: "Remote Item", version: 2 };

      const resolved = (storageManager as any).resolveConflict(localItem, remoteItem, "models");
      expect(resolved.name).toBe("Remote Item");
    });

    it("应该使用合并策略", () => {
      storageManager.saveConfig({
        type: "database",
        syncInterval: 30,
        autoSync: false,
        offlineMode: false,
        conflictResolution: "merge",
      });

      const localItem = { id: "1", name: "Local Item", created_at: "2024-01-02" };
      const remoteItem = { id: "1", name: "Remote Item", created_at: "2024-01-01" };

      const resolved = (storageManager as any).resolveConflict(localItem, remoteItem, "models");
      // 本地时间戳更新，应该选择本地
      expect(resolved.name).toBe("Local Item");
    });
  });

  describe("增量同步", () => {
    it("应该识别有变化的项目", () => {
      const currentItems = [
        { id: "1", name: "Item 1", version: 1 },
        { id: "2", name: "Item 2 Updated", version: 2 },
        { id: "3", name: "Item 3", version: 1 },
      ];

      const lastItems = [
        { id: "1", name: "Item 1", version: 1 },
        { id: "2", name: "Item 2", version: 1 },
      ];

      const changed = (storageManager as any).getChangedItems(currentItems, lastItems, "models");

      expect(changed.length).toBe(2);
      expect(changed.find((item: any) => item.id === "2")).toBeDefined();
      expect(changed.find((item: any) => item.id === "3")).toBeDefined();
    });

    it("应该检测项目差异", () => {
      const item1 = { id: "1", name: "Item 1", provider: "OpenAI" };
      const item2 = { id: "1", name: "Item 1", provider: "Anthropic" };

      const different = (storageManager as any).itemsAreDifferent(item1, item2, "models");
      expect(different).toBe(true);
    });

    it("应该识别相同的项目", () => {
      const item1 = { id: "1", name: "Item 1", provider: "OpenAI" };
      const item2 = { id: "1", name: "Item 1", provider: "OpenAI" };

      const different = (storageManager as any).itemsAreDifferent(item1, item2, "models");
      expect(different).toBe(false);
    });
  });

  describe("同步节流", () => {
    it("应该节流同步请求", async () => {
      vi.useFakeTimers();

      const syncSpy = vi.spyOn(storageManager as any, "sync");

      // 快速连续触发多次同步
      storageManager.triggerSync();
      storageManager.triggerSync();
      storageManager.triggerSync();

      // 等待节流时间
      await vi.advanceTimersByTimeAsync(600);

      // 应该只调用一次
      expect(syncSpy).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe("销毁", () => {
    it("应该清理资源", () => {
      storageManager.saveConfig({
        type: "database",
        syncInterval: 30,
        autoSync: true,
        offlineMode: true,
        conflictResolution: "local",
      });

      storageManager.destroy();

      const status = storageManager.getStatus();
      expect(status.syncing).toBe(false);
    });
  });
});
