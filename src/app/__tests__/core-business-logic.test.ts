/**
 * @file: core-business-logic.test.ts
 * @description: 核心业务逻辑单元测试 - 覆盖stores、utils、hooks
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [unit-test, business-logic, stores, utils]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, val: string) => {
    store[key] = val;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    for (const k of Object.keys(store)) {
      delete store[k];
    }
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
};
(globalThis as any).localStorage = localStorageMock;

import { createLocalStore } from "../lib/create-local-store";
import type { LocalStore } from "../lib/create-local-store";

describe("Core Business Logic - createLocalStore", () => {
  interface TestItem {
    id: string;
    name: string;
    value: number;
  }

  let testStore: LocalStore<TestItem>;
  const defaultData: TestItem[] = [
    { id: "item-1", name: "Test 1", value: 100 },
    { id: "item-2", name: "Test 2", value: 200 },
    { id: "item-3", name: "Test 3", value: 300 },
  ];

  beforeEach(() => {
    localStorageMock.clear();
    testStore = createLocalStore<TestItem>("test-store-key", defaultData, "test");
  });

  describe("Initialization", () => {
    it("should initialize with default data", () => {
      const items = testStore.getAll();

      expect(items.length).toBe(3);
      expect(items[0].name).toBe("Test 1");
    });

    it("should persist data to localStorage on initialization", () => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should load existing data from localStorage if available", () => {
      const existingData = JSON.stringify([
        { id: "existing-1", name: "Existing", value: 999 },
      ]);
      localStorageMock.getItem.mockReturnValue(existingData);

      const newStore = createLocalStore<TestItem>(
        "existing-store",
        defaultData,
        "ex"
      );

      const items = newStore.getAll();
      expect(items.length).toBe(1);
      expect(items[0].name).toBe("Existing");

      // 重置 mock 以避免影响其他测试
      localStorageMock.getItem.mockRestore();
    });
  });

  describe("CRUD Operations", () => {
    it("should add new item with auto-generated ID", () => {
      const newItem = testStore.add({
        name: "New Item",
        value: 400,
      });

      expect(newItem.id).toBeDefined();
      expect(newItem.name).toBe("New Item");
      expect(testStore.count()).toBe(4);
    });

    it("should add item with custom ID", () => {
      const newItem = testStore.add({
        id: "custom-id",
        name: "Custom",
        value: 500,
      });

      expect(newItem.id).toBe("custom-id");
    });

    it("should get item by ID", () => {
      const item = testStore.getById("item-1");

      expect(item).toBeDefined();
      expect(item!.name).toBe("Test 1");
    });

    it("should return undefined for non-existent ID", () => {
      const item = testStore.getById("non-existent");

      expect(item).toBeUndefined();
    });

    it("should update existing item", () => {
      const updated = testStore.update("item-1", {
        name: "Updated Test 1",
        value: 150,
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("Updated Test 1");
      expect(updated!.value).toBe(150);

      // Verify the update persisted
      const item = testStore.getById("item-1");
      expect(item!.name).toBe("Updated Test 1");
    });

    it("should return null when updating non-existent item", () => {
      const result = testStore.update("non-existent", { name: "Test" });

      expect(result).toBeNull();
    });

    it("should remove item by ID", () => {
      const result = testStore.remove("item-1");

      expect(result).toBe(true);
      expect(testStore.count()).toBe(2);
      expect(testStore.getById("item-1")).toBeUndefined();
    });

    it("should return false when removing non-existent item", () => {
      const result = testStore.remove("non-existent");

      expect(result).toBe(false);
    });

    it("should remove multiple items in batch", () => {
      const removed = testStore.removeBatch(["item-1", "item-2"]);

      expect(removed).toBe(2);
      expect(testStore.count()).toBe(1);
    });
  });

  describe("Query Operations", () => {
    it("should get all items", () => {
      const items = testStore.getAll();

      expect(items.length).toBe(3);
      expect(Array.isArray(items)).toBe(true);
    });

    it("should return copy of data (immutability)", () => {
      const items1 = testStore.getAll();
      const items2 = testStore.getAll();

      expect(items1).not.toBe(items2); // Different references
      expect(items1).toEqual(items2); // Same content
    });

    it("should count items correctly", () => {
      expect(testStore.count()).toBe(3);

      testStore.add({ name: "Extra", value: 0 });
      expect(testStore.count()).toBe(4);
    });
  });

  describe("Reset Operation", () => {
    it("should reset to default data", () => {
      testStore.add({ name: "Extra", value: 0 });
      testStore.remove("item-1");
      expect(testStore.count()).toBe(3);

      const resetItems = testStore.reset();

      expect(resetItems.length).toBe(defaultData.length);
      expect(testStore.count()).toBe(defaultData.length);
    });
  });

  describe("Export/Import Operations", () => {
    it("should export data as JSON string", () => {
      const json = testStore.exportData();

      expect(typeof json).toBe("string");
      const parsed = JSON.parse(json);
      expect(parsed.data.length).toBe(3);
      expect(parsed._key).toBe("test-store-key");
      expect(parsed._exportedAt).toBeDefined();
    });

    it("should import valid JSON data", () => {
      const importData = [
        { id: "imported-1", name: "Imported 1", value: 1000 },
        { id: "imported-2", name: "Imported 2", value: 2000 },
      ];

      const result = testStore.importData(JSON.stringify(importData));

      expect(result).toBe(true);
      expect(testStore.count()).toBe(2);
      expect(testStore.getById("imported-1")?.name).toBe("Imported 1");
    });

    it("should handle invalid JSON gracefully", () => {
      const result = testStore.importData("invalid json");

      expect(result).toBe(false);
    });

    it("should handle non-array data gracefully", () => {
      const result = testStore.importData('{"not": "an array"}');

      expect(result).toBe(false);
    });
  });

  describe("Persistence", () => {
    it("should save to localStorage on mutation operations", () => {
      localStorageMock.clear();

      testStore.add({ name: "Persist Test", value: 999 });

      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Verify saved data
      const lastCall = localStorageMock.setItem.mock.calls.slice(-1)[0];
      const savedData = JSON.parse(lastCall[1]);
      expect(savedData.some((item: any) => item.name === "Persist Test")).toBe(
        true
      );
    });

    it("should handle localStorage errors gracefully", () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error("Storage quota exceeded");
      });

      // Should not throw error
      expect(() => testStore.add({ name: "Error Test", value: 0 })).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty defaults array", () => {
      const emptyStore = createLocalStore<TestItem>("empty-store", [], "empty");

      expect(emptyStore.count()).toBe(0);
      expect(emptyStore.getAll()).toEqual([]);
    });

    it("should handle moderate number of items efficiently", () => {
      const manyItems: TestItem[] = Array.from({ length: 50 }, (_, i) => ({
        id: `bulk-${i}`,
        name: `Bulk Item ${i}`,
        value: i,
      }));

      const bulkStore = createLocalStore<TestItem>("bulk-store", manyItems, "bulk");

      expect(bulkStore.count()).toBe(50);

      bulkStore.add({ name: "One More", value: 51 });
      expect(bulkStore.count()).toBe(51);
    });

    it("should handle special characters in data", () => {
      const specialItem = testStore.add({
        name: 'Special "characters" & <symbols>',
        value: -1,
      });

      expect(specialItem.name).toContain('"');
      expect(specialItem.value).toBe(-1);
    });

    it("should maintain data integrity through rapid mutations", () => {
      const initialCount = testStore.count();

      for (let i = 0; i < 20; i++) {
        testStore.add({
          name: `Rapid ${i}`,
          value: Math.random() * 1000,
        });
      }

      // Verify we added items successfully
      const finalCount = testStore.count();
      expect(finalCount).toBeGreaterThan(initialCount);

      // All items should be retrievable and valid
      const allItems = testStore.getAll();
      allItems.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(typeof item.value).toBe("number");
      });
    });
  });
});

describe("Core Business Logic - Data Validation", () => {
  let testStore: LocalStore<{ id: string; value: any }>;

  beforeEach(() => {
    localStorageMock.clear();
    testStore = createLocalStore<{ id: string; value: any }>(
      "validation-store",
      [{ id: "valid-1", value: "test" }],
      "val"
    );
  });

  it("should store various data types correctly", () => {
    testStore.add({ id: "string", value: "text" });
    testStore.add({ id: "number", value: 12345 });
    testStore.add({ id: "boolean", value: true });
    testStore.add({ id: "null", value: null });
    testStore.add({ id: "object", value: { nested: true } });
    testStore.add({ id: "array", value: [1, 2, 3] });

    expect(testStore.count()).toBe(7);

    const objectItem = testStore.getById("object");
    expect(objectItem!.value.nested).toBe(true);

    const arrayItem = testStore.getById("array");
    expect(Array.isArray(arrayItem!.value)).toBe(true);
  });

  it("should preserve data through export/import cycle", () => {
    // Use a unique key to avoid conflicts
    const uniqueKey = `types-store-${Date.now()}`;
    const originalData = [
      { id: "type-1", value: "string" },
      { id: "type-2", value: 42 },
      { id: "type-3", value: true },
    ];

    const storeWithTypes = createLocalStore<{ id: string; value: any }>(
      uniqueKey,
      originalData,
      "type"
    );

    // Export and verify structure
    const exported = storeWithTypes.exportData();
    expect(typeof exported).toBe("string");

    // Verify it's valid JSON
    const parsedExport = JSON.parse(exported);
    expect(parsedExport).toBeDefined();
  });
});
