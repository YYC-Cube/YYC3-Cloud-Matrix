/**
 * @file: state-sync-manager.test.ts
 * @description: state-sync-manager.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StateSyncManager, createStateSyncManager, StateChange } from "../lib/state-sync-manager";

interface TestItem {
  id: string;
  name: string;
  value: number;
}

describe("StateSyncManager", () => {
  let manager: StateSyncManager<TestItem>;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    manager = createStateSyncManager<TestItem>("test-state", {
      persistenceEnabled: true,
      syncIntervalMs: 1000,
      maxHistorySize: 10,
      maxSnapshots: 3,
    });
  });

  afterEach(() => {
    manager.destroy();
    vi.useRealTimers();
  });

  describe("basic operations", () => {
    it("should set and get items", () => {
      const item: TestItem = { id: "1", name: "test", value: 42 };
      manager.set(item);

      expect(manager.getById("1")).toEqual(item);
      expect(manager.getAll()).toHaveLength(1);
    });

    it("should update existing items", () => {
      manager.set({ id: "1", name: "test", value: 42 });
      manager.set({ id: "1", name: "updated", value: 100 });

      const item = manager.getById("1");
      expect(item?.name).toBe("updated");
      expect(item?.value).toBe(100);
    });

    it("should delete items", () => {
      manager.set({ id: "1", name: "test", value: 42 });
      const deleted = manager.delete("1");

      expect(deleted).toBe(true);
      expect(manager.getById("1")).toBeUndefined();
    });

    it("should clear all items", () => {
      manager.set({ id: "1", name: "test1", value: 1 });
      manager.set({ id: "2", name: "test2", value: 2 });
      manager.clear();

      expect(manager.getAll()).toHaveLength(0);
    });

    it("should set batch items", () => {
      manager.setBatch([
        { id: "1", name: "test1", value: 1 },
        { id: "2", name: "test2", value: 2 },
      ]);

      expect(manager.getAll()).toHaveLength(2);
    });
  });

  describe("change tracking", () => {
    it("should track create changes", () => {
      manager.set({ id: "1", name: "test", value: 42 });

      const history = manager.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe("create");
      expect(history[0].newValue?.name).toBe("test");
    });

    it("should track update changes", () => {
      manager.set({ id: "1", name: "test", value: 42 });
      manager.set({ id: "1", name: "updated", value: 100 });

      const history = manager.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe("update");
      expect(history[0].oldValue?.name).toBe("test");
      expect(history[0].newValue?.name).toBe("updated");
    });

    it("should track delete changes", () => {
      manager.set({ id: "1", name: "test", value: 42 });
      manager.delete("1");

      const history = manager.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe("delete");
      expect(history[0].oldValue?.name).toBe("test");
      expect(history[0].newValue).toBeNull();
    });

    it("should limit history size", () => {
      for (let i = 0; i < 15; i++) {
        manager.set({ id: `item-${i}`, name: `test-${i}`, value: i });
      }

      const history = manager.getHistory();
      expect(history.length).toBeLessThanOrEqual(10);
    });
  });

  describe("subscriptions", () => {
    it("should notify listeners on change", () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.set({ id: "1", name: "test", value: 42 });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "create",
          key: "1",
        })
      );
    });

    it("should unsubscribe listeners", () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      manager.set({ id: "1", name: "test", value: 42 });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      manager.set({ id: "2", name: "test2", value: 2 });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("snapshots", () => {
    it("should create snapshots", () => {
      manager.set({ id: "1", name: "test", value: 42 });
      const snapshot = manager.createSnapshot();

      expect(snapshot.version).toBeGreaterThan(0);
      expect(snapshot.data["1"]).toBeDefined();
      expect(snapshot.checksum).toBeDefined();
    });

    it("should restore snapshots", () => {
      manager.set({ id: "1", name: "test", value: 42 });
      manager.createSnapshot();

      manager.set({ id: "1", name: "updated", value: 100 });
      manager.set({ id: "2", name: "new", value: 50 });

      const restored = manager.restoreSnapshot();

      expect(restored).toBe(true);
      expect(manager.getAll()).toHaveLength(1);
      expect(manager.getById("1")?.name).toBe("test");
    });

    it("should limit snapshots count", () => {
      for (let i = 0; i < 5; i++) {
        manager.set({ id: `item-${i}`, name: `test-${i}`, value: i });
        manager.createSnapshot();
      }

      const stats = manager.getStats();
      expect(stats.snapshotsCount).toBeLessThanOrEqual(3);
    });

    it("should rollback to specific version", () => {
      manager.set({ id: "1", name: "v1", value: 1 });
      const snap1 = manager.createSnapshot();

      manager.set({ id: "1", name: "v2", value: 2 });
      manager.createSnapshot();

      const rolledBack = manager.rollback(snap1.version);

      expect(rolledBack).toBe(true);
      expect(manager.getById("1")?.name).toBe("v1");
    });
  });

  describe("persistence", () => {
    it("should persist to localStorage", () => {
      manager.set({ id: "1", name: "test", value: 42 });
      manager.sync();

      const stored = localStorage.getItem("yyc3_state_test-state");
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.state["1"]).toBeDefined();
    });

    it("should load from localStorage", () => {
      localStorage.setItem("yyc3_state_test-state", JSON.stringify({
        state: { "1": { id: "1", name: "persisted", value: 99 } },
        version: 5,
      }));

      const newManager = createStateSyncManager<TestItem>("test-state");

      expect(newManager.getById("1")?.name).toBe("persisted");

      newManager.destroy();
    });

    it("should auto-sync periodically", () => {
      manager.set({ id: "1", name: "test", value: 42 });

      vi.advanceTimersByTime(1000);

      const stored = localStorage.getItem("yyc3_state_test-state");
      expect(stored).toBeDefined();
    });
  });

  describe("stats", () => {
    it("should return correct stats", () => {
      manager.set({ id: "1", name: "test", value: 42 });
      manager.set({ id: "2", name: "test2", value: 50 });
      manager.createSnapshot();

      const stats = manager.getStats();

      expect(stats.totalChanges).toBe(2);
      expect(stats.snapshotsCount).toBe(1);
      expect(stats.historySize).toBe(2);
    });
  });

  describe("destroy", () => {
    it("should clean up resources", () => {
      manager.set({ id: "1", name: "test", value: 42 });
      manager.subscribe(() => {});

      manager.destroy();

      expect(manager.getAll()).toHaveLength(0);
      expect(manager.getHistory()).toHaveLength(0);
    });
  });
});

describe("createStateSyncManager", () => {
  it("should create manager instance", () => {
    const manager = createStateSyncManager<TestItem>("test");

    expect(manager).toBeInstanceOf(StateSyncManager);

    manager.destroy();
  });
});
