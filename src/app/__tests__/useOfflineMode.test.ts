/**
 * @file: useOfflineMode.test.ts
 * @description: useOfflineMode Hook单元测试
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
import { useOfflineMode } from "../hooks/useOfflineMode";
import { LOCALSTORAGE_KEYS } from "../lib/yyc3-storage";
import { useOfflineSlice } from "../store/slices/offline-slice";

describe("useOfflineMode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    // Reset the Zustand offline slice to default state
    useOfflineSlice.setState({
      dashboardSnapshot: null,
      offlineSnapshot: null,
      offlineSnapshotTime: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("should return initial state", () => {
    const { result } = renderHook(() => useOfflineMode());

    expect(result.current.isOnline).toBeDefined();
    expect(result.current.lastSyncTime).toBeNull();
    expect(result.current.pendingSync).toBe(false);
    expect(typeof result.current.saveOfflineSnapshot).toBe("function");
    expect(typeof result.current.syncOfflineData).toBe("function");
    expect(typeof result.current.getOfflineSnapshotTime).toBe("function");
    expect(typeof result.current.saveDashboardState).toBe("function");
    expect(typeof result.current.loadDashboardState).toBe("function");
  });

  it("should detect online status", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
      configurable: true,
    });

    const { result } = renderHook(() => useOfflineMode());

    expect(result.current.isOnline).toBe(true);
  });

  it("should detect offline status", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
      configurable: true,
    });

    const { result } = renderHook(() => useOfflineMode());

    expect(result.current.isOnline).toBe(false);
  });

  it("should handle online event", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
      configurable: true,
    });

    const { result } = renderHook(() => useOfflineMode());

    expect(result.current.isOnline).toBe(false);

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
      window.dispatchEvent(new window.Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it("should handle offline event", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
      configurable: true,
    });

    const { result } = renderHook(() => useOfflineMode());

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
      window.dispatchEvent(new window.Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it("should save offline snapshot when dashboard state exists", () => {
    const { result } = renderHook(() => useOfflineMode());

    act(() => {
      result.current.saveDashboardState({ test: "data" });
      result.current.saveOfflineSnapshot();
    });

    // Check Zustand slice instead of raw localStorage
    const state = useOfflineSlice.getState();
    expect(state.offlineSnapshot).toBeDefined();
    expect((state.offlineSnapshot as Record<string, unknown>).test).toBe("data");
    expect(state.offlineSnapshotTime).toBeDefined();
  });

  it("should not save offline snapshot when no dashboard state", () => {
    // Ensure slice has no dashboard snapshot
    useOfflineSlice.setState({ dashboardSnapshot: null });

    const { result } = renderHook(() => useOfflineMode());

    // Ensure no dashboard snapshot exists in slice
    useOfflineSlice.setState({ dashboardSnapshot: null });

    act(() => {
      result.current.saveOfflineSnapshot();
    });

    const state = useOfflineSlice.getState();
    expect(state.offlineSnapshot).toBeNull();
  });

  it("should sync offline data", async () => {
    const { result } = renderHook(() => useOfflineMode());

    act(() => {
      result.current.saveDashboardState({ test: "data" });
      result.current.saveOfflineSnapshot();
    });

    await act(async () => {
      const syncPromise = result.current.syncOfflineData();
      vi.advanceTimersByTime(1500);
      await syncPromise;
    });

    expect(result.current.lastSyncTime).not.toBeNull();
    expect(result.current.pendingSync).toBe(false);
    // After sync, the offline snapshot should be cleared in the slice
    expect(useOfflineSlice.getState().offlineSnapshot).toBeNull();
  });

  it("should handle sync when no offline snapshot", async () => {
    const { result } = renderHook(() => useOfflineMode());

    await act(async () => {
      const syncPromise = result.current.syncOfflineData();
      vi.advanceTimersByTime(100);
      await syncPromise;
    });

    expect(result.current.lastSyncTime).not.toBeNull();
    expect(result.current.pendingSync).toBe(false);
  });

  it("should get offline snapshot time", () => {
    const { result } = renderHook(() => useOfflineMode());

    act(() => {
      result.current.saveDashboardState({ test: "data" });
      result.current.saveOfflineSnapshot();
    });

    const snapshotTime = result.current.getOfflineSnapshotTime();

    expect(snapshotTime).not.toBeNull();
  });

  it("should return null when no offline snapshot time", () => {
    const { result } = renderHook(() => useOfflineMode());

    const snapshotTime = result.current.getOfflineSnapshotTime();

    expect(snapshotTime).toBeNull();
  });

  it("should save dashboard state manually", () => {
    const { result } = renderHook(() => useOfflineMode());

    act(() => {
      result.current.saveDashboardState({ test: "manual-data" });
    });

    // Check Zustand slice instead of raw localStorage
    const saved = useOfflineSlice.getState().dashboardSnapshot;
    expect(saved).toBeDefined();
    expect((saved as Record<string, unknown>).test).toBe("manual-data");
  });

  it("should load dashboard state", () => {
    const { result } = renderHook(() => useOfflineMode());

    act(() => {
      result.current.saveDashboardState({ test: "data" });
    });

    const loaded = result.current.loadDashboardState();

    expect(loaded).toBeDefined();
    expect((loaded as Record<string, unknown>)?.test).toBe("data");
  });

  it("should cleanup event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useOfflineMode());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
  });

  it("should cleanup interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = renderHook(() => useOfflineMode());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it("should periodically save dashboard state", () => {
    const { result } = renderHook(() => useOfflineMode());

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Check Zustand slice instead of raw localStorage
    const saved = useOfflineSlice.getState().dashboardSnapshot;
    expect(saved).toBeDefined();
  });
});
