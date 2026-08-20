/**
 * @file: create-local-store.test.ts
 * @description: create-local-store.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createLocalStore } from "../../lib/create-local-store";

interface TestItem {
  id: string;
  name: string;
  value?: number;
}

describe("createLocalStore", () => {
  const DEFAULTS: TestItem[] = [
    { id: "d-1", name: "default-1", value: 10 },
    { id: "d-2", name: "default-2", value: 20 },
  ];

  let store: ReturnType<typeof createLocalStore<TestItem>>;

  beforeEach(() => {
    localStorage.clear();
    store = createLocalStore("test-store", DEFAULTS, "item");
  });

  describe("basic CRUD", () => {
    it("should load defaults on first access", () => {
      expect(store.getAll()).toHaveLength(2);
      expect(store.getById("d-1")?.name).toBe("default-1");
    });

    it("should add items", () => {
      const item = store.add({ name: "new-item" });
      expect(item.name).toBe("new-item");
      expect(item.id).toMatch(/^item-/);
      expect(store.count()).toBe(3);
    });

    it("should update items", () => {
      const updated = store.update("d-1", { name: "updated" });
      expect(updated?.name).toBe("updated");
    });

    it("should return null for non-existent update", () => {
      expect(store.update("missing", { name: "x" })).toBeNull();
    });

    it("should remove items", () => {
      expect(store.remove("d-1")).toBe(true);
      expect(store.count()).toBe(1);
    });

    it("should return false for non-existent remove", () => {
      expect(store.remove("missing")).toBe(false);
    });

    it("should remove batch", () => {
      const removed = store.removeBatch(["d-1", "d-2"]);
      expect(removed).toBe(2);
      expect(store.count()).toBe(0);
    });

    it("should reset to defaults", () => {
      store.add({ name: "extra" });
      const reset = store.reset();
      expect(reset).toHaveLength(2);
      expect(store.count()).toBe(2);
    });

    it("should count items", () => {
      expect(store.count()).toBe(2);
    });
  });

  describe("persistence", () => {
    it("should persist to localStorage", () => {
      store.add({ name: "persisted" });
      const raw = localStorage.getItem("test-store");
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(3);
    });

    it("should load from localStorage on next instance", () => {
      store.add({ name: "persisted" });
      const store2 = createLocalStore("test-store", DEFAULTS, "item");
      expect(store2.count()).toBe(3);
      expect(store2.getAll().find((i) => i.name === "persisted")).toBeDefined();
    });
  });

  describe("export/import", () => {
    it("should export data as JSON", () => {
      const json = store.exportData();
      const parsed = JSON.parse(json);
      expect(parsed._key).toBe("test-store");
      expect(parsed.data).toHaveLength(2);
    });

    it("should import valid data", () => {
      const json = JSON.stringify([{ id: "imp-1", name: "imported" }]);
      expect(store.importData(json)).toBe(true);
      expect(store.getById("imp-1")?.name).toBe("imported");
    });

    it("should reject invalid JSON", () => {
      expect(store.importData("not json")).toBe(false);
    });

    it("should reject non-array data", () => {
      expect(store.importData(JSON.stringify({ not: "array" }))).toBe(false);
    });
  });

  describe("transactions", () => {
    it("should commit transaction", () => {
      const tx = store.transaction();
      tx.add({ name: "tx-item" });
      tx.remove("d-1");
      expect(tx.commit()).toBe(true);
      expect(store.getById("d-1")).toBeUndefined();
      expect(store.getAll().find((i) => i.name === "tx-item")).toBeDefined();
    });

    it("should track changes", () => {
      const tx = store.transaction();
      tx.add({ name: "new" });
      tx.update("d-1", { name: "changed" });
      const changes = tx.getChanges();
      expect(changes).toHaveLength(2);
      expect(changes[0].type).toBe("add");
      expect(changes[1].type).toBe("update");
    });

    it("should prevent double commit", () => {
      const tx = store.transaction();
      tx.commit();
      expect(tx.commit()).toBe(false);
    });

    it("should throw on add after commit", () => {
      const tx = store.transaction();
      tx.commit();
      expect(() => tx.add({ name: "late" })).toThrow("Transaction already committed");
    });

    it("should throw on rollback after commit", () => {
      const tx = store.transaction();
      tx.commit();
      expect(() => tx.rollback()).toThrow("Cannot rollback committed transaction");
    });
  });

  describe("cache", () => {
    it("should clear cache", () => {
      store.getAll();
      store.clearCache();
      const stats = store.getCacheStats();
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });

    it("should track cache stats", () => {
      store.getAll();
      store.getAll();
      const stats = store.getCacheStats();
      expect(stats.hits).toBeGreaterThan(0);
    });
  });

  describe("validate", () => {
    it("should return valid when no validator", () => {
      const result = store.validate({ name: "test" });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});
