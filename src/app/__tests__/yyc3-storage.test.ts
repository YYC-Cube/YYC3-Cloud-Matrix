/**
 * @file: yyc3-storage.test.ts
 * @description: yyc3-storage 单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ALL_STORES,
  LOCALSTORAGE_KEYS,
  idbPut,
  idbPutMany,
  idbGet,
  idbGetAll,
  idbDelete,
  idbClear,
  idbCount,
  exportAllData,
  importAllData,
  getStorageStats,
  clearAllLocalStorage,
  clearAllStorage,
  onStorageChange,
} from "../lib/yyc3-storage";

vi.mock("./broadcast-channel", () => ({
  getSharedChannel: vi.fn(() => ({
    postMessage: vi.fn(),
    onmessage: null,
  })),
}));

describe("ALL_STORES", () => {
  it("should contain required stores", () => {
    expect(ALL_STORES).toContain("alertRules");
    expect(ALL_STORES).toContain("patrolHistory");
    expect(ALL_STORES).toContain("operationLogs");
    expect(ALL_STORES).toContain("errorLog");
  });
});

describe("LOCALSTORAGE_KEYS", () => {
  it("should have all required keys", () => {
    expect(LOCALSTORAGE_KEYS.session).toBe("yyc3_session");
    expect(LOCALSTORAGE_KEYS.locale).toBe("yyc3_locale");
    expect(LOCALSTORAGE_KEYS.networkConfig).toBe("network_config");
    expect(LOCALSTORAGE_KEYS.dashboardState).toBe("dashboard_state");
  });
});

describe("IndexedDB Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should put item to store", async () => {
    const item = { id: "test-1", name: "Test Item" };
    await idbPut("alertRules", item);
  });

  it("should put many items to store", async () => {
    const items = [
      { id: "test-1", name: "Item 1" },
      { id: "test-2", name: "Item 2" },
    ];
    await idbPutMany("alertRules", items);
  });

  it("should get item from store", async () => {
    const result = await idbGet("alertRules", "nonexistent");
    expect(result).toBeUndefined();
  });

  it("should get all items from store", async () => {
    const result = await idbGetAll("alertRules");
    expect(Array.isArray(result)).toBe(true);
  });

  it("should delete item from store", async () => {
    await idbDelete("alertRules", "test-1");
  });

  it("should clear store", async () => {
    await idbClear("alertRules");
  });

  it("should count items in store", async () => {
    const count = await idbCount("alertRules");
    expect(typeof count).toBe("number");
  });
});

describe("Data Import/Export", () => {
  it("should export all data", async () => {
    const data = await exportAllData();
    expect(data).toBeDefined();
    expect(typeof data).toBe("object");
  });

  it("should import data", async () => {
    const result = await importAllData({
      alertRules: [{ id: "import-1" }],
    });
    expect(result.imported).toBe(1);
    expect(result.stores).toContain("alertRules");
  });

  it("should handle empty import data", async () => {
    const result = await importAllData({});
    expect(result.imported).toBe(0);
    expect(result.stores.length).toBe(0);
  });
});

describe("Storage Stats", () => {
  it("should get storage stats", async () => {
    const stats = await getStorageStats();
    expect(stats.stores).toBeDefined();
    expect(stats.totalRecords).toBeDefined();
    expect(Array.isArray(stats.stores)).toBe(true);
    expect(typeof stats.totalRecords).toBe("number");
  });
});

describe("localStorage Operations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should clear all localStorage", () => {
    localStorage.setItem("yyc3_session", "test-session");
    localStorage.setItem("yyc3_locale", "en-US");

    clearAllLocalStorage();

    expect(localStorage.getItem("yyc3_session")).toBeNull();
    expect(localStorage.getItem("yyc3_locale")).toBeNull();
  });
});

describe("clearAllStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should clear all storage", async () => {
    localStorage.setItem("yyc3_session", "test-session");

    await clearAllStorage();

    expect(localStorage.getItem("yyc3_session")).toBeNull();
  });
});

describe("onStorageChange", () => {
  it("should register and unregister listener", () => {
    const listener = vi.fn();
    const unsubscribe = onStorageChange(listener);

    expect(typeof unsubscribe).toBe("function");

    unsubscribe();
  });
});
