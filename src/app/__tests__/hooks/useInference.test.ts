/**
 * @file: useInference.test.ts
 * @description: useInference.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerate = vi.fn().mockResolvedValue({
  id: "chat-1",
  model: "test-model",
  content: "Hello response",
  finishReason: "stop",
  usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
  latencyMs: 100,
});

const mockGetStatus = vi.fn().mockReturnValue({
  ollama: "idle" as const,
  webgpu: "idle" as const,
  webgpuModel: null,
});

const mockSwitchBackend = vi.fn();
const mockAbort = vi.fn();
const mockLoadModel = vi.fn().mockResolvedValue(undefined);

vi.mock("../../lib/inference-engine", () => ({
  getInferenceEngine: () => ({
    generate: mockGenerate,
    getStatus: mockGetStatus,
    switchBackend: mockSwitchBackend,
    abort: mockAbort,
    loadModel: mockLoadModel,
  }),
  detectGPU: vi.fn().mockResolvedValue({
    available: true,
    vendor: "Mock GPU",
    renderer: "Mock Renderer",
    memoryMB: 4096,
    webgpuSupported: false,
  }),
  WEBGPU_PRESETS: [
    { id: "smollm2-135m", name: "SmolLM2 135M", size: "~100MB" },
    { id: "phi-3.5-mini", name: "Phi 3.5 Mini", size: "~2.2GB" },
  ],
}));

describe("useInference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return initial state", async () => {
    const { useInference } = await import("../../hooks/useInference");
    const { result } = renderHook(() => useInference());

    await waitFor(() => {
      expect(result.current.backend).toBe("ollama");
      expect(result.current.inferencing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.streamText).toBe("");
    });
  });

  it("should expose all interface methods", async () => {
    const { useInference } = await import("../../hooks/useInference");
    const { result } = renderHook(() => useInference());

    await waitFor(() => {
      expect(typeof result.current.switchBackend).toBe("function");
      expect(typeof result.current.loadModel).toBe("function");
      expect(typeof result.current.generate).toBe("function");
      expect(typeof result.current.abort).toBe("function");
      expect(typeof result.current.refreshGPU).toBe("function");
    });
  });

  it("should switch backend", async () => {
    const { useInference } = await import("../../hooks/useInference");
    const { result } = renderHook(() => useInference());

    await waitFor(() => expect(result.current.backend).toBe("ollama"));

    act(() => {
      result.current.switchBackend("webgpu");
    });

    expect(mockSwitchBackend).toHaveBeenCalledWith("webgpu");
    expect(result.current.backend).toBe("webgpu");
  });

  it("should generate response", async () => {
    const { useInference } = await import("../../hooks/useInference");
    const { result } = renderHook(() => useInference());

    await waitFor(() => expect(result.current.backend).toBeDefined());

    const response = await result.current.generate([
      { role: "user", content: "Hello" },
    ]);

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(response.content).toBe("Hello response");
  });

  it("should abort inference", async () => {
    const { useInference } = await import("../../hooks/useInference");
    const { result } = renderHook(() => useInference());

    await waitFor(() => expect(result.current.backend).toBeDefined());

    act(() => {
      result.current.abort();
    });

    expect(mockAbort).toHaveBeenCalledTimes(1);
    expect(result.current.inferencing).toBe(false);
  });

  it("should refresh GPU info", async () => {
    const { useInference } = await import("../../hooks/useInference");
    const { result } = renderHook(() => useInference());

    await waitFor(() => expect(result.current.gpuInfo).toBeDefined());

    await act(async () => {
      await result.current.refreshGPU();
    });

    expect(result.current.gpuInfo).toBeDefined();
    expect(result.current.gpuInfo!.available).toBe(true);
  });

  it("should load model with progress", async () => {
    const { useInference } = await import("../../hooks/useInference");
    const { result } = renderHook(() => useInference());

    await waitFor(() => expect(result.current.backend).toBeDefined());

    await act(async () => {
      await result.current.loadModel("smollm2-135m");
    });

    expect(mockLoadModel).toHaveBeenCalledWith("smollm2-135m", expect.any(Function));
  });

  it("should expose webgpu presets", async () => {
    const { useInference } = await import("../../hooks/useInference");
    const { result } = renderHook(() => useInference());

    await waitFor(() => {
      expect(result.current.webgpuPresets.length).toBeGreaterThan(0);
    });
  });
});
