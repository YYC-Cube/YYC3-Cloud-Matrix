/**
 * @file: usePersistedState.test.ts
 * @description: usePersistedList Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePersistedList } from "../hooks/usePersistedState";

const mockIdbGetAll = vi.fn();
const mockIdbPut = vi.fn();
const mockIdbPutMany = vi.fn();
const mockIdbDelete = vi.fn();
const mockIdbClear = vi.fn();
const mockOnStorageChange = vi.fn();

vi.mock("../lib/yyc3-storage", () => ({
  idbGetAll: () => mockIdbGetAll(),
  idbPut: (...args: unknown[]) => mockIdbPut(...args),
  idbPutMany: (...args: unknown[]) => mockIdbPutMany(...args),
  idbDelete: (...args: unknown[]) => mockIdbDelete(...args),
  idbClear: (...args: unknown[]) => mockIdbClear(...args),
  onStorageChange: (...args: unknown[]) => mockOnStorageChange(...args),
}));

describe("usePersistedList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIdbGetAll.mockResolvedValue([]);
    mockIdbPut.mockResolvedValue(undefined);
    mockIdbPutMany.mockResolvedValue(undefined);
    mockIdbDelete.mockResolvedValue(undefined);
    mockIdbClear.mockResolvedValue(undefined);
    mockOnStorageChange.mockReturnValue(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with empty items", async () => {
      const { result } = renderHook(() => usePersistedList("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      expect(result.current.items).toEqual([]);
    });

    it("should initialize with initial data when IndexedDB is empty", async () => {
      const initialData = [{ id: "1", name: "Rule 1" }];
      const { result } = renderHook(() =>
        usePersistedList("alertRules", initialData)
      );

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      expect(result.current.items).toEqual(initialData);
    });

    it("should load data from IndexedDB on mount", async () => {
      const storedData = [{ id: "stored-1", name: "Stored Rule" }];
      mockIdbGetAll.mockResolvedValueOnce(storedData);

      const { result } = renderHook(() => usePersistedList("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      expect(result.current.items).toEqual(storedData);
    });
  });

  describe("upsert operation", () => {
    it("should add new item", async () => {
      const { result } = renderHook(() => usePersistedList<{ id: string; name: string }>("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      await act(async () => {
        await result.current.upsert({ id: "1", name: "New Item" });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe("New Item");
      expect(mockIdbPut).toHaveBeenCalledWith("alertRules", { id: "1", name: "New Item" });
    });

    it("should update existing item", async () => {
      mockIdbGetAll.mockResolvedValueOnce([{ id: "1", name: "Old Name" }]);

      const { result } = renderHook(() => usePersistedList<{ id: string; name: string }>("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      await act(async () => {
        await result.current.upsert({ id: "1", name: "New Name" });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe("New Name");
    });
  });

  describe("setAll operation", () => {
    it("should replace all items", async () => {
      const { result } = renderHook(() => usePersistedList<{ id: string; name: string }>("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      const newItems = [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ];

      await act(async () => {
        await result.current.setAll(newItems);
      });

      expect(result.current.items).toEqual(newItems);
      expect(mockIdbClear).toHaveBeenCalledWith("alertRules");
      expect(mockIdbPutMany).toHaveBeenCalledWith("alertRules", newItems);
    });

    it("should clear storage when setting empty array", async () => {
      const { result } = renderHook(() => usePersistedList<{ id: string; name: string }>("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      await act(async () => {
        await result.current.setAll([]);
      });

      expect(result.current.items).toEqual([]);
      expect(mockIdbClear).toHaveBeenCalledWith("alertRules");
      expect(mockIdbPutMany).not.toHaveBeenCalled();
    });
  });

  describe("remove operation", () => {
    it("should remove item by id", async () => {
      mockIdbGetAll.mockResolvedValueOnce([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      const { result } = renderHook(() => usePersistedList<{ id: string; name: string }>("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      await act(async () => {
        await result.current.remove("1");
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe("2");
      expect(mockIdbDelete).toHaveBeenCalledWith("alertRules", "1");
    });

    it("should handle removing non-existent item", async () => {
      const { result } = renderHook(() => usePersistedList<{ id: string; name: string }>("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      await act(async () => {
        await result.current.remove("non-existent");
      });

      expect(result.current.items).toEqual([]);
      expect(mockIdbDelete).toHaveBeenCalledWith("alertRules", "non-existent");
    });
  });

  describe("clear operation", () => {
    it("should clear all items", async () => {
      mockIdbGetAll.mockResolvedValueOnce([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      const { result } = renderHook(() => usePersistedList<{ id: string; name: string }>("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      await act(async () => {
        await result.current.clear();
      });

      expect(result.current.items).toEqual([]);
      expect(mockIdbClear).toHaveBeenCalledWith("alertRules");
    });
  });

  describe("prepend operation", () => {
    it("should prepend item to the beginning", async () => {
      mockIdbGetAll.mockResolvedValueOnce([{ id: "1", name: "Item 1" }]);

      const { result } = renderHook(() => usePersistedList<{ id: string; name: string }>("alertRules"));

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      await act(async () => {
        await result.current.prepend({ id: "2", name: "Item 2" });
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].id).toBe("2");
      expect(mockIdbPut).toHaveBeenCalledWith("alertRules", { id: "2", name: "Item 2" });
    });
  });

  describe("cross-tab sync", () => {
    it("should subscribe to storage changes on mount", async () => {
      renderHook(() => usePersistedList("alertRules"));

      await waitFor(() => {
        expect(mockOnStorageChange).toHaveBeenCalled();
      });
    });
  });
});
