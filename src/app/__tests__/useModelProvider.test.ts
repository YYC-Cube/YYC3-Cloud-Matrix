/**
 * @file: useModelProvider.test.ts
 * @description: useModelProvider Hook unit test — Zustand slice integration
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-19
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock dependencies before imports ──────────────────────────

vi.mock("../lib/ollama-url", () => ({
  getOllamaTagsUrl: vi.fn(() => "http://localhost:11434/api/tags"),
}));

vi.mock("../lib/connection-test-engine", () => ({
  testAIConnection: vi.fn(async () => ({
    overallStatus: "pass",
    steps: [],
    totalLatencyMs: 50,
  })),
}));

global.fetch = vi.fn();

// ── Import store and hook after mocks ─────────────────────────

import { useModelProvider } from "../hooks/useModelProvider";
import { BUILTIN_PROVIDERS as SLICE_BUILTIN, useProviderSlice } from "../store/slices/provider-slice";

describe("useModelProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store to clean state with fresh builtin providers
    useProviderSlice.setState({
      providers: SLICE_BUILTIN.map((p) => ({ ...p })),
      configuredModels: [],
      ollamaModels: [],
      ollamaLoading: false,
      ollamaError: null,
    });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ models: [] }),
    } as Response);
  });

  afterEach(() => {
    cleanup();
  });

  it("should return initial state", () => {
    const { result } = renderHook(() => useModelProvider());

    expect(result.current.providers).toBeDefined();
    expect(result.current.configuredModels).toBeDefined();
    expect(result.current.ollamaModels).toBeDefined();
    expect(result.current.stats).toBeDefined();
    expect(result.current.availableModels).toBeDefined();
  });

  it("should have builtin providers", () => {
    const { result } = renderHook(() => useModelProvider());

    const providerIds = result.current.providers.map((p) => p.id);
    expect(providerIds).toContain("zhipu");
    expect(providerIds).toContain("deepseek");
    expect(providerIds).toContain("ollama");
  });

  it("should add custom provider", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.addProvider({
        label: "Custom Provider",
        baseUrl: "https://custom.api.com/v1",
        authType: "bearer",
        models: ["model-1"],
        requiresApiKey: true,
        isLocal: false,
      });
    });

    const customProvider = result.current.providers.find(
      (p) => p.label === "Custom Provider"
    );
    expect(customProvider).toBeDefined();
    expect(customProvider?.isBuiltin).toBe(false);
    expect(customProvider?.isCustom).toBe(true);
  });

  it("should update provider", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.updateProvider("zhipu", { label: "Updated Z.ai" });
    });

    const zhipu = result.current.providers.find((p) => p.id === "zhipu");
    expect(zhipu?.label).toBe("Updated Z.ai");
  });

  it("should remove builtin provider (all providers are now removable)", () => {
    const { result } = renderHook(() => useModelProvider());

    const initialLength = result.current.providers.length;

    act(() => {
      result.current.removeProvider("zhipu");
    });

    expect(result.current.providers.length).toBe(initialLength - 1);
    expect(result.current.providers.find((p) => p.id === "zhipu")).toBeUndefined();
  });

  it("should remove custom provider", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.addProvider({
        label: "To Remove",
        baseUrl: "https://remove.api.com/v1",
        authType: "bearer",
        models: [],
        requiresApiKey: true,
        isLocal: false,
      });
    });

    const customProvider = result.current.providers.find(
      (p) => p.label === "To Remove"
    );
    expect(customProvider).toBeDefined();

    act(() => {
      result.current.removeProvider(customProvider!.id);
    });

    expect(
      result.current.providers.find((p) => p.label === "To Remove")
    ).toBeUndefined();
  });

  it("should add model to provider", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.addModelToProvider("zhipu", "new-model");
    });

    const zhipu = result.current.providers.find((p) => p.id === "zhipu");
    expect(zhipu?.models).toContain("new-model");
  });

  it("should not add duplicate model to provider", () => {
    const { result } = renderHook(() => useModelProvider());

    const zhipu = result.current.providers.find((p) => p.id === "zhipu");
    const initialCount = zhipu?.models.length || 0;

    act(() => {
      result.current.addModelToProvider("zhipu", "glm-4-flash");
    });

    const updatedZhipu = result.current.providers.find((p) => p.id === "zhipu");
    expect(updatedZhipu?.models.length).toBe(initialCount);
  });

  it("should remove model from provider", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.removeModelFromProvider("zhipu", "glm-4-flash");
    });

    const zhipu = result.current.providers.find((p) => p.id === "zhipu");
    expect(zhipu?.models).not.toContain("glm-4-flash");
  });

  it("should add configured model", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.addModel("zhipu", "glm-4-flash", "test-api-key");
    });

    expect(result.current.configuredModels.length).toBeGreaterThan(0);
    const model = result.current.configuredModels.find(
      (m) => m.model === "glm-4-flash"
    );
    expect(model).toBeDefined();
    expect(model?.providerId).toBe("zhipu");
  });

  it("should update configured model", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.addModel("zhipu", "glm-4-flash", "test-api-key");
    });

    const model = result.current.configuredModels.find(
      (m) => m.model === "glm-4-flash"
    );

    act(() => {
      result.current.updateModel(model!.id, { status: "active" });
    });

    const updatedModel = result.current.configuredModels.find(
      (m) => m.id === model!.id
    );
    expect(updatedModel?.status).toBe("active");
  });

  it("should remove configured model", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.addModel("zhipu", "glm-4-flash", "test-api-key");
    });

    const model = result.current.configuredModels.find(
      (m) => m.model === "glm-4-flash"
    );

    act(() => {
      result.current.removeModel(model!.id);
    });

    expect(
      result.current.configuredModels.find((m) => m.id === model!.id)
    ).toBeUndefined();
  });

  it("should test connection", async () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.addModel("zhipu", "glm-4-flash", "test-api-key");
    });

    const model = result.current.configuredModels.find(
      (m) => m.model === "glm-4-flash"
    );

    await act(async () => {
      await result.current.testConnection(model!.id);
    });

    const updatedModel = result.current.configuredModels.find(
      (m) => m.id === model!.id
    );
    expect(updatedModel?.status).toBe("active");
  });

  it("should export config", () => {
    const { result } = renderHook(() => useModelProvider());

    const exported = result.current.exportConfig();

    expect(exported).toBeDefined();
    const parsed = JSON.parse(exported);
    expect(parsed.version).toBe(2);
    expect(parsed.exportedAt).toBeDefined();
  });

  it("should import config", () => {
    const { result } = renderHook(() => useModelProvider());

    const importData = JSON.stringify({
      version: 2,
      providers: [],
      configuredModels: [
        {
          id: "test-model",
          providerId: "zhipu",
          providerLabel: "Z.ai",
          model: "test-model",
          apiKey: "test-key",
          baseUrl: "https://test.com",
          createdAt: Date.now(),
          status: "unchecked",
        },
      ],
    });

    let importResult: boolean;
    act(() => {
      importResult = result.current.importConfig(importData);
    });

    expect(importResult!).toBe(true);
    expect(
      result.current.configuredModels.find((m) => m.id === "test-model")
    ).toBeDefined();
  });

  it("should return false for invalid import", () => {
    const { result } = renderHook(() => useModelProvider());

    let importResult: boolean;
    act(() => {
      importResult = result.current.importConfig("invalid json");
    });

    expect(importResult!).toBe(false);
  });

  it("should calculate stats correctly", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.addModel("zhipu", "glm-4-flash", "test-api-key");
    });

    expect(result.current.stats.total).toBeGreaterThan(0);
    expect(result.current.stats.totalProviders).toBeGreaterThan(0);
  });

  it("should open and close modal", () => {
    const { result } = renderHook(() => useModelProvider());

    expect(result.current.modalOpen).toBe(false);

    act(() => {
      result.current.openModal();
    });

    expect(result.current.modalOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.modalOpen).toBe(false);
  });

  it("should reset builtin provider", () => {
    const { result } = renderHook(() => useModelProvider());

    act(() => {
      result.current.updateProvider("zhipu", { label: "Modified" });
    });

    const modified = result.current.providers.find((p) => p.id === "zhipu");
    expect(modified?.label).toBe("Modified");

    act(() => {
      result.current.resetProvider("zhipu");
    });

    const reset = result.current.providers.find((p) => p.id === "zhipu");
    expect(reset?.label).toBe("Z.ai (智谱)");
  });
});
