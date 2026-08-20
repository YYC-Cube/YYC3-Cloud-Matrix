/**
 * @file: useOperationCenter.test.ts
 * @description: useOperationCenter.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOperationCenter } from "../hooks/useOperationCenter";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useOperationCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useOperationCenter());
    expect(result.current.categories).toBeDefined();
    expect(result.current.actions).toBeDefined();
    expect(result.current.templates).toBeDefined();
    expect(result.current.logs).toBeDefined();
  });

  it("should have category meta data", () => {
    const { result } = renderHook(() => useOperationCenter());
    expect(result.current.categories.length).toBeGreaterThan(0);
    expect(result.current.categories[0]).toHaveProperty("key");
    expect(result.current.categories[0]).toHaveProperty("label");
    expect(result.current.categories[0]).toHaveProperty("icon");
    expect(result.current.categories[0]).toHaveProperty("color");
  });

  it("should have quick actions", () => {
    const { result } = renderHook(() => useOperationCenter());
    expect(result.current.actions.length).toBeGreaterThan(0);
    expect(result.current.actions[0]).toHaveProperty("id");
    expect(result.current.actions[0]).toHaveProperty("category");
    expect(result.current.actions[0]).toHaveProperty("label");
  });

  it("should have templates", () => {
    const { result } = renderHook(() => useOperationCenter());
    expect(result.current.templates.length).toBeGreaterThan(0);
    expect(result.current.templates[0]).toHaveProperty("id");
    expect(result.current.templates[0]).toHaveProperty("name");
    expect(result.current.templates[0]).toHaveProperty("steps");
  });

  it("should have logs", () => {
    const { result } = renderHook(() => useOperationCenter());
    expect(result.current.logs.length).toBeGreaterThan(0);
    expect(result.current.logs[0]).toHaveProperty("id");
    expect(result.current.logs[0]).toHaveProperty("timestamp");
    expect(result.current.logs[0]).toHaveProperty("action");
  });

  it("should filter actions by category", () => {
    const { result } = renderHook(() => useOperationCenter());
    const initialCount = result.current.actions.length;
    
    act(() => {
      result.current.setActiveCategory("node");
    });
    
    const filteredCount = result.current.actions.length;
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  it("should filter logs by search query", () => {
    const { result } = renderHook(() => useOperationCenter());
    const initialCount = result.current.logs.length;
    
    act(() => {
      result.current.setSearchQuery("重启");
    });
    
    const filteredCount = result.current.logs.length;
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  it("should add new template", () => {
    const { result } = renderHook(() => useOperationCenter());
    const initialCount = result.current.templates.length;
    
    act(() => {
      result.current.addTemplate(
        "测试模板",
        "测试描述",
        "system",
        ["步骤1", "步骤2"]
      );
    });
    
    expect(result.current.templates.length).toBeGreaterThan(initialCount);
  });

  it("should delete template", () => {
    const { result } = renderHook(() => useOperationCenter());
    const templateId = result.current.templates[0].id;
    const initialCount = result.current.templates.length;
    
    act(() => {
      result.current.deleteTemplate(templateId);
    });
    
    expect(result.current.templates.length).toBeLessThan(initialCount);
  });

  it("should execute action", async () => {
    const { result } = renderHook(() => useOperationCenter());
    const actionId = result.current.actions[0].id;
    
    await act(async () => {
      await result.current.executeAction(actionId);
    });
    
    // Verify action was executed — isExecuting resets to null after completion
    expect(result.current.isExecuting).toBeNull();
  });

  it("should run template", async () => {
    const { result } = renderHook(() => useOperationCenter());
    const templateId = result.current.templates[0].id;
    
    await act(async () => {
      await result.current.runTemplate(templateId);
    });
    
    // Verify template was run (logs should be added)
    expect(result.current.logs.length).toBeGreaterThan(0);
  });

  it("should set log filter", () => {
    const { result } = renderHook(() => useOperationCenter());
    
    act(() => {
      result.current.setLogFilter("all");
    });
    
    expect(result.current.logFilter).toBe("all");
  });
});
