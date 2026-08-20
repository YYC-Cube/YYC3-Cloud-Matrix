/**
 * @file: useAIDiagnostics.test.ts
 * @description: useAIDiagnostics Hook单元测试
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

vi.mock("../hooks/usePersistedState", () => ({
  usePersistedList: () => ({
    items: [],
    prepend: vi.fn(),
    loaded: true,
  }),
}));

import { useAIDiagnostics } from "../hooks/useAIDiagnostics";

describe("useAIDiagnostics", () => {
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
      const { result } = renderHook(() => useAIDiagnostics());

      expect(result.current.status).toBe("idle");
    });

    it("should initialize with null session", () => {
      const { result } = renderHook(() => useAIDiagnostics());

      expect(result.current.session).toBeNull();
    });

    it("should initialize with patterns view", () => {
      const { result } = renderHook(() => useAIDiagnostics());

      expect(result.current.activeView).toBe("patterns");
    });

    it("should initialize with no executing action", () => {
      const { result } = renderHook(() => useAIDiagnostics());

      expect(result.current.executingAction).toBeNull();
    });

    it("should initialize with empty history", () => {
      const { result } = renderHook(() => useAIDiagnostics());

      expect(result.current.history).toEqual([]);
    });
  });

  describe("startDiagnosis", () => {
    it("should start diagnosis and set status to analyzing", () => {
      const { result } = renderHook(() => useAIDiagnostics());

      act(() => {
        result.current.startDiagnosis();
      });

      expect(result.current.status).toBe("analyzing");
    });

    it("should complete diagnosis after timeout", async () => {
      const { result } = renderHook(() => useAIDiagnostics());

      act(() => {
        result.current.startDiagnosis();
      });

      expect(result.current.status).toBe("analyzing");

      await act(async () => {
        vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current.status).toBe("complete");
      expect(result.current.session).not.toBeNull();
    });

    it("should generate patterns in session", async () => {
      const { result } = renderHook(() => useAIDiagnostics());

      act(() => {
        result.current.startDiagnosis();
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current.session?.patterns).toBeDefined();
      expect(result.current.session?.patterns.length).toBeGreaterThan(0);
    });

    it("should generate anomalies in session", async () => {
      const { result } = renderHook(() => useAIDiagnostics());

      act(() => {
        result.current.startDiagnosis();
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current.session?.anomalies).toBeDefined();
      expect(result.current.session?.anomalies.length).toBeGreaterThan(0);
    });

    it("should generate actions in session", async () => {
      const { result } = renderHook(() => useAIDiagnostics());

      act(() => {
        result.current.startDiagnosis();
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current.session?.actions).toBeDefined();
      expect(result.current.session?.actions.length).toBeGreaterThan(0);
    });

    it("should generate forecasts in session", async () => {
      const { result } = renderHook(() => useAIDiagnostics());

      act(() => {
        result.current.startDiagnosis();
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current.session?.forecasts).toBeDefined();
      expect(result.current.session?.forecasts.length).toBeGreaterThan(0);
    });
  });

  describe("setActiveView", () => {
    it("should change active view", () => {
      const { result } = renderHook(() => useAIDiagnostics());

      expect(result.current.activeView).toBe("patterns");

      act(() => {
        result.current.setActiveView("anomalies");
      });

      expect(result.current.activeView).toBe("anomalies");

      act(() => {
        result.current.setActiveView("actions");
      });

      expect(result.current.activeView).toBe("actions");
    });
  });

  describe("executeAction", () => {
    it("should set executing action", async () => {
      const { result } = renderHook(() => useAIDiagnostics());

      act(() => {
        result.current.startDiagnosis();
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(2000);
      });

      const actionId = result.current.session?.actions[0]?.id;

      if (actionId) {
        act(() => {
          result.current.executeAction(actionId);
        });

        expect(result.current.executingAction).toBe(actionId);

        await act(async () => {
          vi.advanceTimersByTimeAsync(2500);
        });

        expect(result.current.executingAction).toBeNull();
      }
    });
  });

  describe("with live data options", () => {
    it("should accept live nodes option", async () => {
      const opts = {
        liveNodes: [
          { id: "GPU-A100-01", gpu: 85, mem: 70, temp: 75, status: "online" },
        ],
      };

      const { result } = renderHook(() => useAIDiagnostics(opts));

      act(() => {
        result.current.startDiagnosis();
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current.status).toBe("complete");
    });

    it("should accept live QPS and latency options", async () => {
      const opts = {
        liveQPS: 1500,
        liveLatency: 60,
      };

      const { result } = renderHook(() => useAIDiagnostics(opts));

      act(() => {
        result.current.startDiagnosis();
      });

      await act(async () => {
        vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current.status).toBe("complete");
    });
  });
});
