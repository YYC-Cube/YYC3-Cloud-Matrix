/**
 * @file: create-local-store.test.ts
 * @description: create-local-store模块单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createLocalStore, type LocalStore } from "../lib/create-local-store";

interface TestItem {
  id: string;
  name: string;
  value: number;
}

describe("create-local-store", () => {
  const STORAGE_KEY = "test_store";
  const DEFAULTS: TestItem[] = [
    { id: "item-1", name: "Item 1", value: 100 },
    { id: "item-2", name: "Item 2", value: 200 },
  ];

  let store: LocalStore<TestItem>;

  beforeEach(() => {
    localStorage.clear();
    store = createLocalStore(STORAGE_KEY, DEFAULTS, "test");
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getAll()", () => {
    it("should return default items on first call", () => {
      const items = store.getAll();
      expect(items).toHaveLength(2);
      expect(items[0].name).toBe("Item 1");
      expect(items[1].name).toBe("Item 2");
    });

    it("should return a copy of items", () => {
      const items1 = store.getAll();
      const items2 = store.getAll();
      expect(items1).not.toBe(items2);
      expect(items1).toEqual(items2);
    });

    it("should persist items to localStorage", () => {
      store.getAll();
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(2);
    });
  });

  describe("getById()", () => {
    it("should return item by id", () => {
      const item = store.getById("item-1");
      expect(item).toBeDefined();
      expect(item?.name).toBe("Item 1");
    });

    it("should return undefined for non-existent id", () => {
      const item = store.getById("non-existent");
      expect(item).toBeUndefined();
    });
  });

  describe("add()", () => {
    it("should add new item with generated id", () => {
      const newItem = store.add({ name: "Item 3", value: 300 });
      expect(newItem.id).toBeDefined();
      expect(newItem.id.startsWith("test-")).toBe(true);
      expect(newItem.name).toBe("Item 3");
    });

    it("should add new item with custom id", () => {
      const newItem = store.add({ id: "custom-id", name: "Custom Item", value: 400 });
      expect(newItem.id).toBe("custom-id");
    });

    it("should persist added item", () => {
      store.add({ name: "Item 3", value: 300 });
      const items = store.getAll();
      expect(items).toHaveLength(3);
    });
  });

  describe("update()", () => {
    it("should update existing item", () => {
      const updated = store.update("item-1", { value: 999 });
      expect(updated).toBeDefined();
      expect(updated?.value).toBe(999);
      expect(updated?.name).toBe("Item 1");
    });

    it("should return null for non-existent id", () => {
      const updated = store.update("non-existent", { value: 999 });
      expect(updated).toBeNull();
    });

    it("should persist updated item", () => {
      store.update("item-1", { value: 999 });
      const item = store.getById("item-1");
      expect(item?.value).toBe(999);
    });
  });

  describe("remove()", () => {
    it("should remove existing item", () => {
      const result = store.remove("item-1");
      expect(result).toBe(true);
      const items = store.getAll();
      expect(items).toHaveLength(1);
    });

    it("should return false for non-existent id", () => {
      const result = store.remove("non-existent");
      expect(result).toBe(false);
    });

    it("should persist removal", () => {
      store.remove("item-1");
      const item = store.getById("item-1");
      expect(item).toBeUndefined();
    });
  });

  describe("removeBatch()", () => {
    it("should remove multiple items", () => {
      const removed = store.removeBatch(["item-1", "item-2"]);
      expect(removed).toBe(2);
      const items = store.getAll();
      expect(items).toHaveLength(0);
    });

    it("should return count of removed items", () => {
      store.add({ id: "item-3", name: "Item 3", value: 300 });
      const removed = store.removeBatch(["item-1", "item-3"]);
      expect(removed).toBe(2);
    });

    it("should handle non-existent ids", () => {
      const removed = store.removeBatch(["item-1", "non-existent"]);
      expect(removed).toBe(1);
    });
  });

  describe("reset()", () => {
    it("should reset to defaults", () => {
      store.add({ name: "Item 3", value: 300 });
      store.update("item-1", { value: 999 });
      const items = store.reset();
      expect(items).toHaveLength(2);
      expect(items[0].value).toBe(100);
    });

    it("should persist reset", () => {
      store.add({ name: "Item 3", value: 300 });
      store.reset();
      const items = store.getAll();
      expect(items).toHaveLength(2);
    });
  });

  describe("exportData()", () => {
    it("should export data as JSON string", () => {
      const exported = store.exportData();
      expect(typeof exported).toBe("string");
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty("_key", STORAGE_KEY);
      expect(parsed).toHaveProperty("data");
    });

    it("should include export timestamp", () => {
      const exported = store.exportData();
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty("_exportedAt");
    });

    it("should export current data", () => {
      store.add({ name: "Item 3", value: 300 });
      const exported = store.exportData();
      const parsed = JSON.parse(exported);
      expect(parsed.data).toHaveLength(3);
    });
  });

  describe("importData()", () => {
    it("should import valid JSON with data property", () => {
      const json = JSON.stringify({
        _key: STORAGE_KEY,
        data: [{ id: "imported-1", name: "Imported Item", value: 500 }],
      });
      const result = store.importData(json);
      expect(result).toBe(true);
      const items = store.getAll();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Imported Item");
    });

    it("should import valid JSON array", () => {
      const json = JSON.stringify([
        { id: "imported-1", name: "Imported Item", value: 500 },
      ]);
      const result = store.importData(json);
      expect(result).toBe(true);
      const items = store.getAll();
      expect(items).toHaveLength(1);
    });

    it("should return false for invalid JSON", () => {
      const result = store.importData("invalid json");
      expect(result).toBe(false);
    });

    it("should return false for non-array data", () => {
      const json = JSON.stringify({ data: "not an array" });
      const result = store.importData(json);
      expect(result).toBe(false);
    });

    it("should not modify data on import failure", () => {
      store.getAll();
      store.importData("invalid json");
      const items = store.getAll();
      expect(items).toHaveLength(2);
    });
  });

  describe("count()", () => {
    it("should return count of items", () => {
      expect(store.count()).toBe(2);
    });

    it("should update count after add", () => {
      store.add({ name: "Item 3", value: 300 });
      expect(store.count()).toBe(3);
    });

    it("should update count after remove", () => {
      store.remove("item-1");
      expect(store.count()).toBe(1);
    });
  });

  describe("persistence", () => {
    it("should load from localStorage on subsequent calls", () => {
      store.add({ name: "Item 3", value: 300 });
      const newStore = createLocalStore<TestItem>(STORAGE_KEY, DEFAULTS, "test");
      const items = newStore.getAll();
      expect(items).toHaveLength(3);
    });

    it("should handle corrupted localStorage data", () => {
      localStorage.setItem(STORAGE_KEY, "invalid json");
      const newStore = createLocalStore<TestItem>(STORAGE_KEY, DEFAULTS, "test");
      const items = newStore.getAll();
      expect(items).toHaveLength(2);
      expect(items[0].name).toBe("Item 1");
    });
  });
});
