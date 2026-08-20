/**
 * @file: usePatrol.test.ts
 * @description: usePatrol Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../hooks/usePersistedState", () => ({
  usePersistedList: () => ({
    items: [],
    setItems: vi.fn(),
    prepend: vi.fn(),
  }),
}));

import { usePatrol } from "../hooks/usePatrol";

describe("usePatrol", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with idle status", () => {
      const { result } = renderHook(() => usePatrol());

      expect(result.current.patrolStatus).toBe("idle");
    });

    it("should initialize with null current result", () => {
      const { result } = renderHook(() => usePatrol());

      expect(result.current.currentResult).toBeNull();
    });

    it("should initialize with 0 progress", () => {
      const { result } = renderHook(() => usePatrol());

      expect(result.current.progress).toBe(0);
    });

    it("should initialize with null selected report", () => {
      const { result } = renderHook(() => usePatrol());

      expect(result.current.selectedReport).toBeNull();
    });

    it("should initialize with schedule", () => {
      const { result } = renderHook(() => usePatrol());

      expect(result.current.schedule).toBeDefined();
      expect(result.current.schedule.enabled).toBe(true);
      expect(result.current.schedule.interval).toBe(15);
    });
  });

  describe("runPatrol", () => {
    it("should run patrol and set status to running", async () => {
      const { result } = renderHook(() => usePatrol());

      act(() => {
        result.current.runPatrol("manual");
      });

      expect(result.current.patrolStatus).toBe("running");
    });

    it("should complete patrol after timeout", async () => {
      const { result } = renderHook(() => usePatrol());

      act(() => {
        result.current.runPatrol("manual");
      });

      expect(result.current.patrolStatus).toBe("running");

      await act(async () => {
        vi.advanceTimersByTimeAsync(500);
      });

      expect(result.current.patrolStatus).toBe("completed");
      expect(result.current.currentResult).not.toBeNull();
    });

    it("should generate checks in result", async () => {
      const { result } = renderHook(() => usePatrol());

      act(() => {
        result.current.runPatrol("manual");
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(500);
      });

      expect(result.current.currentResult?.checks).toBeDefined();
      expect(result.current.currentResult?.checks.length).toBeGreaterThan(0);
    });

    it("should calculate health score", async () => {
      const { result } = renderHook(() => usePatrol());

      act(() => {
        result.current.runPatrol("manual");
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(500);
      });

      expect(result.current.currentResult?.healthScore).toBeDefined();
      expect(result.current.currentResult?.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.current.currentResult?.healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe("toggleAutoPatrol", () => {
    it("should toggle auto patrol off", () => {
      const { result } = renderHook(() => usePatrol());

      expect(result.current.schedule.enabled).toBe(true);

      act(() => {
        result.current.toggleAutoPatrol(false);
      });

      expect(result.current.schedule.enabled).toBe(false);
    });

    it("should toggle auto patrol on", () => {
      const { result } = renderHook(() => usePatrol());

      act(() => {
        result.current.toggleAutoPatrol(false);
      });

      expect(result.current.schedule.enabled).toBe(false);

      act(() => {
        result.current.toggleAutoPatrol(true);
      });

      expect(result.current.schedule.enabled).toBe(true);
    });
  });

  describe("updateInterval", () => {
    it("should update patrol interval", () => {
      const { result } = renderHook(() => usePatrol());

      expect(result.current.schedule.interval).toBe(15);

      act(() => {
        result.current.updateInterval(30);
      });

      expect(result.current.schedule.interval).toBe(30);
    });
  });

  describe("viewReport", () => {
    it("should set selected report", async () => {
      const { result } = renderHook(() => usePatrol());

      act(() => {
        result.current.runPatrol("manual");
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(500);
      });

      const report = result.current.currentResult;

      if (report) {
        act(() => {
          result.current.viewReport(report);
        });

        expect(result.current.selectedReport).toEqual(report);
      }
    });
  });

  describe("closeReport", () => {
    it("should clear selected report", async () => {
      const { result } = renderHook(() => usePatrol());

      act(() => {
        result.current.runPatrol("manual");
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(500);
      });

      const report = result.current.currentResult;

      if (report) {
        act(() => {
          result.current.viewReport(report);
        });

        expect(result.current.selectedReport).not.toBeNull();

        act(() => {
          result.current.closeReport();
        });

        expect(result.current.selectedReport).toBeNull();
      }
    });
  });
});
