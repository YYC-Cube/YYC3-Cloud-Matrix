/**
 * @file: family-db-bridge.test.ts
 * @description: family-db-bridge.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchNodeStatus,
  fetchPerformanceMetrics,
  fetchAlerts,
  fetchDashboardStats,
} from "../../lib/family-db-bridge";

describe("family-db-bridge", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch node status", async () => {
    const data = await fetchNodeStatus();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should fetch performance metrics", async () => {
    const data = await fetchPerformanceMetrics();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should fetch alerts", async () => {
    const data = await fetchAlerts();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should fetch dashboard stats", async () => {
    const data = await fetchDashboardStats();
    expect(data).toBeNull();
  });

  it("should return empty array on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
    const data = await fetchNodeStatus();
    expect(data).toEqual([]);
  });

  it("should return null on stats fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
    const data = await fetchDashboardStats();
    expect(data).toBeNull();
  });

  it("should return null on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 500 }));
    const data = await fetchDashboardStats();
    expect(data).toBeNull();
  });
});
