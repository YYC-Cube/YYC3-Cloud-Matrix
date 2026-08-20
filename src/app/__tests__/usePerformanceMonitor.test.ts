/**
 * @file: usePerformanceMonitor.test.ts
 * @description: usePerformanceMonitor.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-07
 * @updated: 2026-04-07
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

describe("usePerformanceMonitor", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(result.current.isMonitoring).toBe(true);
      expect(result.current.current).toBeDefined();
      expect(result.current.current.fps).toBe(60);
      expect(result.current.current.memUsedMB).toBe(0);
      expect(result.current.current.domNodes).toBe(0);
      expect(result.current.vitals).toBeDefined();
      expect(result.current.vitals.fcp).toBeNull();
      expect(result.current.vitals.lcp).toBeNull();
    });

    it("should load history from localStorage", () => {
      const mockHistory = [
        {
          timestamp: 1234567890,
          fps: 60,
          memUsedMB: 100,
          memTotalMB: 1000,
          memPercent: 10,
          domNodes: 1000,
          resourceCount: 10,
          transferSizeKB: 1000,
          longTasks: 0,
          networkType: "4g",
          rttMs: 100,
        },
      ];
      localStorage.setItem("yyc3_perf_history", JSON.stringify(mockHistory));

      const { result } = renderHook(() => usePerformanceMonitor());
      expect(result.current.history).toEqual(mockHistory);
    });

    it("should handle corrupted localStorage data", () => {
      localStorage.setItem("yyc3_perf_history", "invalid-json");

      const { result } = renderHook(() => usePerformanceMonitor());
      expect(result.current.history).toEqual([]);
    });
  });

  describe("toggleMonitoring", () => {
    it("should toggle monitoring state", () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(result.current.isMonitoring).toBe(true);

      act(() => {
        result.current.toggleMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);

      act(() => {
        result.current.toggleMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);
    });
  });

  describe("clearHistory", () => {
    it("should clear history and localStorage", () => {
      const mockHistory = [
        {
          timestamp: 1234567890,
          fps: 60,
          memUsedMB: 100,
          memTotalMB: 1000,
          memPercent: 10,
          domNodes: 1000,
          resourceCount: 10,
          transferSizeKB: 1000,
          longTasks: 0,
          networkType: "4g",
          rttMs: 100,
        },
      ];
      localStorage.setItem("yyc3_perf_history", JSON.stringify(mockHistory));

      const { result } = renderHook(() => usePerformanceMonitor());
      expect(result.current.history).toHaveLength(1);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
      expect(localStorage.getItem("yyc3_perf_history")).toBeNull();
    });

    it("should handle localStorage errors gracefully", () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error("StorageError");
      });

      expect(() => {
        act(() => {
          result.current.clearHistory();
        });
      }).not.toThrow();

      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe("exportPerfData", () => {
    it("should export performance data as JSON", () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      const exported = result.current.exportPerfData();
      const parsed = JSON.parse(exported);

      expect(parsed.version).toBe(1);
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.current).toBeDefined();
      expect(parsed.vitals).toBeDefined();
      expect(parsed.history).toBeDefined();
    });
  });

  describe("memory info", () => {
    it("should handle missing memory API", () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(result.current.current.memUsedMB).toBe(0);
      expect(result.current.current.memTotalMB).toBe(0);
      expect(result.current.current.memPercent).toBe(0);
    });

    it("should calculate memory info when available", () => {
      const mockMemory = {
        usedJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 1000 * 1024 * 1024,
      };

      Object.defineProperty(performance, "memory", {
        value: mockMemory,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.current.memUsedMB).toBe(100);
      expect(result.current.current.memTotalMB).toBe(1000);
      expect(result.current.current.memPercent).toBe(10);

      delete (performance as { memory?: unknown }).memory;
    });
  });

  describe("network info", () => {
    it("should handle missing connection API", () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(result.current.current.networkType).toBe("unknown");
      expect(result.current.current.rttMs).toBe(0);
    });

    it("should get network info when available", () => {
      const mockConnection = {
        effectiveType: "4g",
        rtt: 100,
      };

      Object.defineProperty(navigator, "connection", {
        value: mockConnection,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.current.networkType).toBe("4g");
      expect(result.current.current.rttMs).toBe(100);

      delete (navigator as { connection?: unknown }).connection;
    });
  });

  describe("resource stats", () => {
    it("should get resource stats", () => {
      const mockResource = {
        name: "test.js",
        transferSize: 1024,
      };

      vi.spyOn(performance, "getEntriesByType").mockReturnValue([mockResource as any]);

      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.current.resourceCount).toBe(1);
      expect(result.current.current.transferSizeKB).toBe(1);
    });
  });

  describe("DOM nodes", () => {
    it("should get DOM node count", () => {
      document.body.innerHTML = "<div><span></span></div>";

      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.current.domNodes).toBeGreaterThan(0);

      document.body.innerHTML = "";
    });
  });

  describe("Web Vitals", () => {
    it("should get FCP from performance entries", () => {
      const mockFCP = {
        name: "first-contentful-paint",
        startTime: 1000,
      };

      vi.spyOn(performance, "getEntriesByName").mockReturnValue([mockFCP as any]);

      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.vitals.fcp).toBe(1000);
    });

    it("should get TTFB from navigation entries", () => {
      const mockNav = {
        responseStart: 500,
      };

      vi.spyOn(performance, "getEntriesByType").mockReturnValue([mockNav as any]);

      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.vitals.ttfb).toBe(500);
    });
  });

  describe("long tasks", () => {
    it("should handle PerformanceObserver errors gracefully", () => {
      vi.spyOn(window, "PerformanceObserver").mockImplementation(() => {
        throw new Error("Not supported");
      });

      expect(() => {
        renderHook(() => usePerformanceMonitor());
      }).not.toThrow();
    });
  });

  describe("periodic sampling", () => {
    it("should update current snapshot periodically", () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      const initialTimestamp = result.current.current.timestamp;

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.current.timestamp).toBeGreaterThan(initialTimestamp);
      expect(result.current.history).toHaveLength(1);
    });

    it("should limit history to MAX_HISTORY", () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      for (let i = 0; i < 150; i++) {
        act(() => {
          vi.advanceTimersByTime(3000);
        });
      }

      expect(result.current.history.length).toBeLessThanOrEqual(100);
    });

    it("should save history to localStorage", () => {
      renderHook(() => usePerformanceMonitor());

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      const saved = localStorage.getItem("yyc3_perf_history");
      expect(saved).toBeDefined();
      const parsed = JSON.parse(saved as string);
      expect(parsed).toHaveLength(1);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });

      const { result } = renderHook(() => usePerformanceMonitor());

      expect(() => {
        act(() => {
          vi.advanceTimersByTime(3000);
        });
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });

    it("should reset long task count after sampling", () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.current.longTasks).toBe(0);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.current.longTasks).toBe(0);
    });
  });

  describe("cleanup", () => {
    it("should clear interval on unmount", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      const { unmount } = renderHook(() => usePerformanceMonitor());

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it("should clear timeout on unmount", () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { unmount } = renderHook(() => usePerformanceMonitor());

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
