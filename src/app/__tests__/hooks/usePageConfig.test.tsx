/**
 * @file: usePageConfig.test.tsx
 * @description: usePageConfig.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";

vi.mock("../../config", () => {
  const configs = new Map<string, any>();
  configs.set("dashboard", {
    id: "dashboard",
    path: "/",
    title: "Dashboard",
    editable: true,
    storageKeys: ["theme", "layout"],
  });

  return {
    getPageConfigByPath: vi.fn((path: string) => {
      if (path === "/") { return configs.get("dashboard"); }
      return undefined;
    }),
    getMergedPageConfig: vi.fn((pageId: string) => {
      return configs.get(pageId);
    }),
    updatePageConfig: vi.fn(),
    resetPageConfig: vi.fn(),
  };
});

function wrapper({ children }: { children: ReactNode }) {
  return React.createElement(MemoryRouter, { initialEntries: ["/"] }, children);
}

import React from "react";

describe("usePageConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return config for current path", async () => {
    const { usePageConfig } = await import("../../hooks/usePageConfig");
    const { result } = renderHook(() => usePageConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toBeDefined();
    expect(result.current.config!.id).toBe("dashboard");
    expect(result.current.isEditable).toBe(true);
    expect(result.current.storageKeys).toEqual(["theme", "layout"]);
  });

  it("should expose update and reset functions", async () => {
    const { usePageConfig } = await import("../../hooks/usePageConfig");
    const { result } = renderHook(() => usePageConfig(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.updateConfig).toBe("function");
    expect(typeof result.current.resetConfig).toBe("function");
  });

  it("should call updateConfig", async () => {
    const config = await import("../../config");
    const { usePageConfig } = await import("../../hooks/usePageConfig");
    const { result } = renderHook(() => usePageConfig(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.updateConfig({ title: "New Title" });
    expect(config.updatePageConfig).toHaveBeenCalledWith("dashboard", { title: "New Title" });
  });

  it("should call resetConfig", async () => {
    const config = await import("../../config");
    const { usePageConfig } = await import("../../hooks/usePageConfig");
    const { result } = renderHook(() => usePageConfig(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.resetConfig();
    expect(config.resetPageConfig).toHaveBeenCalledWith("dashboard");
  });
});

describe("usePageConfigById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return config for given pageId", async () => {
    const { usePageConfigById } = await import("../../hooks/usePageConfig");
    const { result } = renderHook(() => usePageConfigById("dashboard"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toBeDefined();
    expect(result.current.config!.id).toBe("dashboard");
  });

  it("should return null config for unknown pageId", async () => {
    const { usePageConfigById } = await import("../../hooks/usePageConfig");
    const { result } = renderHook(() => usePageConfigById("unknown"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toBeNull();
    expect(result.current.isEditable).toBe(false);
    expect(result.current.storageKeys).toEqual([]);
  });
});
