/**
 * @file: useServiceLoop.test.tsx
 * @description: useServiceLoop.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * useServiceLoop.test.tsx
 * ==============
 * useServiceLoop Hook - 一站式服务闭环测试
 *
 * 覆盖范围:
 * - 初始状态
 * - startLoop 完整闭环流转
 * - abortLoop 中止
 * - stats 统计
 * - clearHistory
 * - stageMeta / dataFlowNodes / dataFlowEdges 常量
 * - autoMode 开关
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useServiceLoop, STAGE_META, DATA_FLOW_NODES, DATA_FLOW_EDGES } from "../hooks/useServiceLoop";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the IndexedDB-backed storage to prevent state pollution across tests
vi.mock("../lib/yyc3-storage", () => ({
  idbGetAll: vi.fn().mockResolvedValue([]),
  idbPut: vi.fn().mockResolvedValue(undefined),
  idbPutMany: vi.fn().mockResolvedValue(undefined),
  idbDelete: vi.fn().mockResolvedValue(undefined),
  idbClear: vi.fn().mockResolvedValue(undefined),
  idbCount: vi.fn().mockResolvedValue(0),
  onStorageChange: vi.fn(() => () => {}),
  ALL_STORES: [],
  clearAllLocalStorage: vi.fn(),
}));

// Also mock broadcast-channel to avoid cross-test pollution
vi.mock("../lib/broadcast-channel", () => ({
  getSharedChannel: vi.fn(() => null),
}));

describe("useServiceLoop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  // ----------------------------------------------------------
  // 初始状态
  // ----------------------------------------------------------

  describe("初始状态", () => {
    it("currentRun 应为 null", () => {
      const { result } = renderHook(() => useServiceLoop());
      expect(result.current.currentRun).toBeNull();
    });

    it("history 应为空", () => {
      const { result } = renderHook(() => useServiceLoop());
      expect(result.current.history).toEqual([]);
    });

    it("isRunning 应为 false", () => {
      const { result } = renderHook(() => useServiceLoop());
      expect(result.current.isRunning).toBe(false);
    });

    it("autoMode 初始为 false", () => {
      const { result } = renderHook(() => useServiceLoop());
      expect(result.current.autoMode).toBe(false);
    });

    it("currentStageIndex 应为 -1", () => {
      const { result } = renderHook(() => useServiceLoop());
      expect(result.current.currentStageIndex).toBe(-1);
    });
  });

  // ----------------------------------------------------------
  // 常量验证
  // ----------------------------------------------------------

  describe("常量", () => {
    it("STAGE_META 应有 6 个阶段", () => {
      expect(STAGE_META.length).toBe(6);
    });

    it("阶段顺序应正确", () => {
      const keys = STAGE_META.map((s) => s.key);
      expect(keys).toEqual(["monitor", "analyze", "decide", "execute", "verify", "optimize"]);
    });

    it("每个阶段应有 label / icon / color / description", () => {
      for (const s of STAGE_META) {
        expect(s.label).toBeTruthy();
        expect(s.icon).toBeTruthy();
        expect(s.color).toMatch(/^#/);
        expect(s.description).toBeTruthy();
      }
    });

    it("DATA_FLOW_NODES 应有 4 个节点", () => {
      expect(DATA_FLOW_NODES.length).toBe(4);
    });

    it("节点类型应覆盖 device/storage/dashboard/terminal", () => {
      const types = DATA_FLOW_NODES.map((n) => n.type);
      expect(types).toContain("device");
      expect(types).toContain("storage");
      expect(types).toContain("dashboard");
      expect(types).toContain("terminal");
    });

    it("DATA_FLOW_EDGES 应有 6 条连线", () => {
      expect(DATA_FLOW_EDGES.length).toBe(6);
    });

    it("所有连线应有 from/to/label/bandwidth", () => {
      for (const e of DATA_FLOW_EDGES) {
        expect(e.from).toBeTruthy();
        expect(e.to).toBeTruthy();
        expect(e.label).toBeTruthy();
        expect(e.bandwidth).toBeTruthy();
      }
    });
  });

  // ----------------------------------------------------------
  // startLoop
  // ----------------------------------------------------------

  describe("startLoop", () => {
    it("完整闭环后 history 应有 1 条记录", { timeout: 15000 }, async () => {
      const { result } = renderHook(() => useServiceLoop());

      await act(async () => {
        await result.current.startLoop("manual");
      });

      expect(result.current.history.length).toBe(1);
      expect(result.current.history[0].overallStatus).toBe("completed");
    });

    it("完整闭环后 6 个阶段均为 completed", { timeout: 15000 }, async () => {
      const { result } = renderHook(() => useServiceLoop());

      await act(async () => {
        await result.current.startLoop("manual");
      });

      const run = result.current.currentRun;
      expect(run).not.toBeNull();
      expect(run!.stages.every((s) => s.status === "completed")).toBe(true);
    });

    it("每个阶段应有 summary 和 details", { timeout: 15000 }, async () => {
      const { result } = renderHook(() => useServiceLoop());

      await act(async () => {
        await result.current.startLoop("manual");
      });

      for (const stage of result.current.currentRun!.stages) {
        expect(stage.summary).toBeTruthy();
        expect(stage.details.length).toBeGreaterThan(0);
        expect(stage.duration).toBeGreaterThan(0);
      }
    });

    it("trigger 应记录触发方式", { timeout: 15000 }, async () => {
      const { result } = renderHook(() => useServiceLoop());

      await act(async () => {
        await result.current.startLoop("alert");
      });

      expect(result.current.currentRun!.trigger).toBe("alert");
    });
  });

  // ----------------------------------------------------------
  // stats
  // ----------------------------------------------------------

  describe("stats", () => {
    it("初始统计应全为 0", () => {
      const { result } = renderHook(() => useServiceLoop());
      expect(result.current.stats.totalRuns).toBe(0);
      expect(result.current.stats.successRuns).toBe(0);
      expect(result.current.stats.errorRuns).toBe(0);
    });

    it("运行后 totalRuns 应增加", { timeout: 15000 }, async () => {
      const { result } = renderHook(() => useServiceLoop());

      await act(async () => {
        await result.current.startLoop("manual");
      });

      expect(result.current.stats.totalRuns).toBe(1);
      expect(result.current.stats.successRuns).toBe(1);
    });
  });

  // ----------------------------------------------------------
  // clearHistory
  // ----------------------------------------------------------

  describe("clearHistory", () => {
    it("清空后 history 应为空", { timeout: 15000 }, async () => {
      const { result } = renderHook(() => useServiceLoop());

      await act(async () => {
        await result.current.startLoop("manual");
      });
      expect(result.current.history.length).toBe(1);

      act(() => {
        result.current.clearHistory();
      });
      expect(result.current.history.length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // autoMode
  // ----------------------------------------------------------

  describe("autoMode", () => {
    it("切换 autoMode", () => {
      const { result } = renderHook(() => useServiceLoop());
      expect(result.current.autoMode).toBe(false);

      act(() => {
        result.current.setAutoMode(true);
      });
      expect(result.current.autoMode).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // Hook 返回值
  // ----------------------------------------------------------

  describe("返回值", () => {
    it("应返回 stageMeta / dataFlowNodes / dataFlowEdges", () => {
      const { result } = renderHook(() => useServiceLoop());
      expect(result.current.stageMeta.length).toBe(6);
      expect(result.current.dataFlowNodes.length).toBe(4);
      expect(result.current.dataFlowEdges.length).toBe(6);
    });
  });
});
