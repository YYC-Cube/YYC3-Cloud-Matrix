/**
 * @file: usePWAManager.test.ts
 * @description: usePWAManager Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { usePWAManager } from "../hooks/usePWAManager";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("usePWAManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("should return initial state", () => {
    const { result } = renderHook(() => usePWAManager());

    expect(result.current.swStatus).toBe("active");
    expect(result.current.swVersion).toBe("1.4.2");
    expect(result.current.isOnline).toBeDefined();
    expect(result.current.updateAvailable).toBe(true);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isClearing).toBe(false);
  });

  it("should return cache entries", () => {
    const { result } = renderHook(() => usePWAManager());

    expect(result.current.cacheEntries).toBeDefined();
    expect(Array.isArray(result.current.cacheEntries)).toBe(true);
    expect(result.current.cacheEntries.length).toBeGreaterThan(0);
  });

  it("should calculate total cache size", () => {
    const { result } = renderHook(() => usePWAManager());

    expect(result.current.totalCacheSize).toBeGreaterThan(0);
    expect(typeof result.current.totalCacheSize).toBe("number");
  });

  it("should calculate total cache count", () => {
    const { result } = renderHook(() => usePWAManager());

    expect(result.current.totalCacheCount).toBeGreaterThan(0);
    expect(typeof result.current.totalCacheCount).toBe("number");
  });

  it("should determine offline ready status", () => {
    const { result } = renderHook(() => usePWAManager());

    expect(typeof result.current.offlineReady).toBe("boolean");
  });

  it("should calculate last cache update time", () => {
    const { result } = renderHook(() => usePWAManager());

    expect(result.current.lastCacheUpdate).toBeGreaterThan(0);
    expect(typeof result.current.lastCacheUpdate).toBe("number");
  });

  it("should return pwaState object", () => {
    const { result } = renderHook(() => usePWAManager());

    expect(result.current.pwaState).toBeDefined();
    expect(result.current.pwaState.swStatus).toBe("active");
    expect(result.current.pwaState.swVersion).toBe("1.4.2");
    expect(result.current.pwaState.isOnline).toBeDefined();
    expect(result.current.pwaState.cacheEntries).toBeDefined();
  });

  it("should update SW when updateSW is called", async () => {
    const { result } = renderHook(() => usePWAManager());

    expect(result.current.updateAvailable).toBe(true);

    await act(async () => {
      const updatePromise = result.current.updateSW();
      vi.runAllTimers();
      await updatePromise;
    });

    expect(result.current.swVersion).toBe("1.5.0");
    expect(result.current.updateAvailable).toBe(false);
    expect(result.current.isUpdating).toBe(false);
  });

  it("should not update SW when no update available", async () => {
    const { result } = renderHook(() => usePWAManager());

    await act(async () => {
      const updatePromise = result.current.updateSW();
      vi.runAllTimers();
      await updatePromise;
    });

    expect(result.current.updateAvailable).toBe(false);

    await act(async () => {
      const updatePromise = result.current.updateSW();
      vi.runAllTimers();
      await updatePromise;
    });

    expect(result.current.swVersion).toBe("1.5.0");
  });

  it("should clear all cache when clearAllCache is called", async () => {
    const { result } = renderHook(() => usePWAManager());

    expect(result.current.cacheEntries.length).toBeGreaterThan(0);

    await act(async () => {
      const clearPromise = result.current.clearAllCache();
      vi.runAllTimers();
      await clearPromise;
    });

    expect(result.current.cacheEntries.length).toBe(0);
    expect(result.current.isClearing).toBe(false);
  });

  it("should clear specific cache when clearCache is called", async () => {
    const { result } = renderHook(() => usePWAManager());

    const initialLength = result.current.cacheEntries.length;
    const cacheName = result.current.cacheEntries[0].name;

    await act(async () => {
      const clearPromise = result.current.clearCache(cacheName);
      vi.runAllTimers();
      await clearPromise;
    });

    expect(result.current.cacheEntries.length).toBe(initialLength - 1);
    expect(result.current.cacheEntries.find((e) => e.name === cacheName)).toBeUndefined();
  });

  it("should refresh cache when refreshCache is called", async () => {
    const { result } = renderHook(() => usePWAManager());

    const originalUpdateTime = result.current.cacheEntries[0].lastUpdated;

    await act(async () => {
      vi.advanceTimersByTime(1000);
      const refreshPromise = result.current.refreshCache();
      vi.runAllTimers();
      await refreshPromise;
    });

    expect(result.current.cacheEntries[0].lastUpdated).toBeGreaterThan(originalUpdateTime);
  });

  it("should format size correctly", () => {
    const { result } = renderHook(() => usePWAManager());

    expect(result.current.formatSize(500)).toBe("500B");
    expect(result.current.formatSize(1024)).toBe("1.0KB");
    expect(result.current.formatSize(1048576)).toBe("1.0MB");
    expect(result.current.formatSize(1572864)).toBe("1.5MB");
  });

  it("should set isUpdating during SW update", async () => {
    const { result } = renderHook(() => usePWAManager());

    let updatePromise: Promise<void>;

    act(() => {
      updatePromise = result.current.updateSW();
    });

    expect(result.current.isUpdating).toBe(true);

    await act(async () => {
      vi.runAllTimers();
      await updatePromise!;
    });

    expect(result.current.isUpdating).toBe(false);
  });

  it("should set isClearing during cache clear", async () => {
    const { result } = renderHook(() => usePWAManager());

    let clearPromise: Promise<void>;

    act(() => {
      clearPromise = result.current.clearAllCache();
    });

    expect(result.current.isClearing).toBe(true);

    await act(async () => {
      vi.runAllTimers();
      await clearPromise!;
    });

    expect(result.current.isClearing).toBe(false);
  });
});
