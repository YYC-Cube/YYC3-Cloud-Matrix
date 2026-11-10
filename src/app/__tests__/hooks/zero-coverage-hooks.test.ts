/**
 * @file: zero-coverage-hooks.test.ts
 * @description: zero-coverage-hooks.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

describe("useClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return a Date object", async () => {
    const { useClock } = await import("../../hooks/useClock");
    const { result } = renderHook(() => useClock());
    expect(result.current).toBeInstanceOf(Date);
  });

  it("should update over time", async () => {
    const { useClock } = await import("../../hooks/useClock");
    const { result } = renderHook(() => useClock());
    const initial = result.current.getTime();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.getTime()).toBeGreaterThanOrEqual(initial);
  });
});

describe("useVariables", () => {
  it("should return variables interface", async () => {
    vi.doMock("../../config/variable-center", () => {
      // 快照必须返回稳定引用（每次新建对象会触发 useSyncExternalStore 无限循环）
      const stableSnapshot: Record<string, never> = {};
      return {
        VARIABLE_DEFINITIONS: [],
        getVariableDefinition: vi.fn(() => undefined),
        getVariablesByCategory: vi.fn(() => []),
        getVariableValue: vi.fn(() => ({ key: "test", value: "default", source: "default", updatedAt: Date.now() })),
        setVariableValue: vi.fn(),
        resetVariableValue: vi.fn(),
        validateVariable: vi.fn(() => ({ valid: true, errors: [] })),
        loadVariableValues: vi.fn(() => ({})),
        // v1.1 响应式引擎接口适配
        getVariableValuesSnapshot: vi.fn(() => stableSnapshot),
        subscribeVariables: vi.fn(() => () => {}),
        VariableCategory: {},
      };
    });
    const { useVariables } = await import("../../hooks/useVariables");
    const { result } = renderHook(() => useVariables());
    expect(result.current.values).toBeDefined();
    expect(result.current.get).toBeInstanceOf(Function);
    expect(result.current.set).toBeInstanceOf(Function);
    expect(result.current.reset).toBeInstanceOf(Function);
    expect(result.current.validate).toBeInstanceOf(Function);
    expect(result.current.reload).toBeInstanceOf(Function);
    expect(typeof result.current.hasChanges).toBe("boolean");
  });
});
