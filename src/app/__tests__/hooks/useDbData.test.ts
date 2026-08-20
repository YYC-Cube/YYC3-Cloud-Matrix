/**
 * @file: useDbData.test.ts
 * @description: useDbData.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../../lib/family-db-bridge", () => ({
  fetchNodeStatus: vi.fn().mockResolvedValue([
    { id: "n1", hostname: "node-1", gpu_util: 50, mem_util: 32, temp_celsius: 45, model_deployed: "test", active_tasks: 2, status: "active" },
  ]),
  fetchPerformanceMetrics: vi.fn().mockResolvedValue([
    { id: "m1", timestamp: Date.now(), cpu: 80, memory: 60 },
  ]),
  fetchAlerts: vi.fn().mockResolvedValue([
    { id: "a1", severity: "warning", message: "High CPU", timestamp: Date.now() },
  ]),
  fetchDashboardStats: vi.fn().mockResolvedValue({
    totalNodes: 3,
    activeNodes: 2,
    totalAlerts: 5,
  }),
}));

describe("useDbData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start loading and fetch data", async () => {
    const { useDbData } = await import("../../hooks/useDbData");
    const { result } = renderHook(() => useDbData(0));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.metrics).toHaveLength(1);
    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.stats).toBeDefined();
    expect(result.current.stats!.totalNodes).toBe(3);
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch errors", async () => {
    const bridge = await import("../../lib/family-db-bridge");
    (bridge.fetchNodeStatus as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

    const { useDbData } = await import("../../hooks/useDbData");
    const { result } = renderHook(() => useDbData(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
  });

  it("should expose refresh function", async () => {
    const { useDbData } = await import("../../hooks/useDbData");
    const { result } = renderHook(() => useDbData(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe("function");
    await result.current.refresh();
  });
});
