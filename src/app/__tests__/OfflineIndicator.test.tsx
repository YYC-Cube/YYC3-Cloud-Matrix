/**
 * @file: OfflineIndicator.test.tsx
 * @description: OfflineIndicator.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { OfflineIndicator } from "../modules/shared/OfflineIndicator";

const mockUseOfflineMode = vi.fn();

vi.mock("../hooks/useOfflineMode", () => ({
  useOfflineMode: () => mockUseOfflineMode(),
}));

describe("OfflineIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseOfflineMode.mockReturnValue({
      isOnline: true,
      lastSyncTime: null,
      pendingSync: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should not render when online and not showing", () => {
    mockUseOfflineMode.mockReturnValue({
      isOnline: true,
      lastSyncTime: null,
      pendingSync: false,
    });
    render(<OfflineIndicator />);
    expect(screen.queryAllByText("离线模式")).toHaveLength(0);
  });

  it("should render offline indicator when offline", async () => {
    mockUseOfflineMode.mockReturnValue({
      isOnline: false,
      lastSyncTime: null,
      pendingSync: false,
    });
    render(<OfflineIndicator />);
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    const offlineElements = screen.queryAllByText("离线模式");
    expect(offlineElements.length).toBeGreaterThan(0);
  });

  it("should show last sync time when offline", async () => {
    const lastSync = new Date("2024-01-01T10:30:00");
    mockUseOfflineMode.mockReturnValue({
      isOnline: false,
      lastSyncTime: lastSync,
      pendingSync: false,
    });
    render(<OfflineIndicator />);
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    const syncElements = screen.queryAllByText(/上次同步:/);
    expect(syncElements.length).toBeGreaterThan(0);
  });

  it("should show reconnected message when coming back online", async () => {
    const { rerender } = render(<OfflineIndicator />);

    mockUseOfflineMode.mockReturnValue({
      isOnline: false,
      lastSyncTime: null,
      pendingSync: false,
    });
    rerender(<OfflineIndicator />);
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    const offlineElements = screen.queryAllByText("离线模式");
    expect(offlineElements.length).toBeGreaterThan(0);

    mockUseOfflineMode.mockReturnValue({
      isOnline: true,
      lastSyncTime: null,
      pendingSync: false,
    });
    rerender(<OfflineIndicator />);
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    const reconnectedElements = screen.queryAllByText("网络已恢复");
    expect(reconnectedElements.length).toBeGreaterThan(0);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    const reconnectedElementsAfter = screen.queryAllByText("网络已恢复");
    expect(reconnectedElementsAfter.length).toBe(0);
  });

  it("should show sync indicator when pending sync", async () => {
    mockUseOfflineMode.mockReturnValue({
      isOnline: false,
      lastSyncTime: null,
      pendingSync: true,
    });
    render(<OfflineIndicator />);
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    const offlineElements = screen.queryAllByText("离线模式");
    expect(offlineElements.length).toBeGreaterThan(0);
  });
});
