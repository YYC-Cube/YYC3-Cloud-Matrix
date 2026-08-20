/**
 * @file: useServiceLoop.test.ts
 * @description: useServiceLoop Hook单元测试
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

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../hooks/usePersistedState", () => ({
  usePersistedList: () => ({
    items: [],
    prepend: vi.fn(),
    clear: vi.fn(),
    loaded: true,
  }),
}));

import { useServiceLoop, STAGE_META, DATA_FLOW_EDGES, DATA_FLOW_NODES } from "../hooks/useServiceLoop";

describe("useServiceLoop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("constants", () => {
    it("should export STAGE_META with 6 stages", () => {
      expect(STAGE_META).toHaveLength(6);
      expect(STAGE_META[0].key).toBe("monitor");
      expect(STAGE_META[5].key).toBe("optimize");
    });

    it("should export DATA_FLOW_EDGES", () => {
      expect(DATA_FLOW_EDGES).toBeDefined();
      expect(DATA_FLOW_EDGES.length).toBeGreaterThan(0);
    });

    it("should export DATA_FLOW_NODES", () => {
      expect(DATA_FLOW_NODES).toBeDefined();
      expect(DATA_FLOW_NODES.length).toBeGreaterThan(0);
    });
  });

  describe("initialization", () => {
    it("should initialize with null currentRun", () => {
      const { result } = renderHook(() => useServiceLoop());

      expect(result.current.currentRun).toBeNull();
    });

    it("should initialize with isRunning false", () => {
      const { result } = renderHook(() => useServiceLoop());

      expect(result.current.isRunning).toBe(false);
    });

    it("should initialize with autoMode false", () => {
      const { result } = renderHook(() => useServiceLoop());

      expect(result.current.autoMode).toBe(false);
    });

    it("should initialize with empty history", () => {
      const { result } = renderHook(() => useServiceLoop());

      expect(result.current.history).toEqual([]);
    });

    it("should initialize with stats", () => {
      const { result } = renderHook(() => useServiceLoop());

      expect(result.current.stats).toBeDefined();
      expect(result.current.stats.totalRuns).toBe(0);
    });
  });

  describe("startLoop", () => {
    it("should start loop with manual trigger", async () => {
      const { result } = renderHook(() => useServiceLoop());

      act(() => {
        result.current.startLoop("manual");
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.currentRun).not.toBeNull();
      expect(result.current.currentRun?.trigger).toBe("manual");
    });

    it("should not start loop if already running", async () => {
      const { result } = renderHook(() => useServiceLoop());

      act(() => {
        result.current.startLoop("manual");
      });

      const firstRun = result.current.currentRun;

      act(() => {
        result.current.startLoop("auto");
      });

      expect(result.current.currentRun).toBe(firstRun);
    });
  });

  describe("abortLoop", () => {
    it("should set abort flag when called", async () => {
      const { result } = renderHook(() => useServiceLoop());

      act(() => {
        result.current.startLoop("manual");
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.abortLoop();
      });

      expect(result.current.isRunning).toBe(true);
    });
  });

  describe("setAutoMode", () => {
    it("should set auto mode", () => {
      const { result } = renderHook(() => useServiceLoop());

      expect(result.current.autoMode).toBe(false);

      act(() => {
        result.current.setAutoMode(true);
      });

      expect(result.current.autoMode).toBe(true);

      act(() => {
        result.current.setAutoMode(false);
      });

      expect(result.current.autoMode).toBe(false);
    });
  });

  describe("clearHistory", () => {
    it("should clear history", () => {
      const { result } = renderHook(() => useServiceLoop());

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toEqual([]);
    });
  });

  describe("currentStageIndex", () => {
    it("should return -1 when no currentRun", () => {
      const { result } = renderHook(() => useServiceLoop());

      expect(result.current.currentStageIndex).toBe(-1);
    });

    it("should return correct stage index during run", async () => {
      const { result } = renderHook(() => useServiceLoop());

      act(() => {
        result.current.startLoop("manual");
      });

      expect(result.current.currentStageIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe("stats", () => {
    it("should calculate stats correctly", () => {
      const { result } = renderHook(() => useServiceLoop());

      expect(result.current.stats).toEqual({
        totalRuns: 0,
        successRuns: 0,
        errorRuns: 0,
        avgDuration: 0,
      });
    });
  });
});
