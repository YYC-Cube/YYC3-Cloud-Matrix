/**
 * @file: useNetworkConfig.test.ts
 * @description: useNetworkConfig Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

const mockSaveNetworkConfig = vi.fn();
const mockResetNetworkConfig = vi.fn(() => ({
  serverAddress: "localhost",
  port: "3113",
  wsUrl: "ws://localhost:3113/ws",
  mode: "auto" as const,
}));
const mockTestWebSocketConnection = vi.fn((_url: string, _timeout: number) =>
  Promise.resolve({ success: true, latency: 50, error: "" })
);
const mockGetNetworkInterfaces = vi.fn(() =>
  Promise.resolve([{ name: "eth0", type: "ethernet", ip: "192.168.1.1", status: "active" }])
);
const mockGetLocalIP = vi.fn(() => Promise.resolve("127.0.0.1"));

vi.mock("../lib/network-utils", () => ({
  loadNetworkConfig: () => ({
    serverAddress: "localhost",
    port: "3113",
    wsUrl: "ws://localhost:3113/ws",
    mode: "auto" as const,
  }),
  saveNetworkConfig: () => mockSaveNetworkConfig(),
  resetNetworkConfig: () => mockResetNetworkConfig(),
  getNetworkInterfaces: () => mockGetNetworkInterfaces(),
  getLocalIP: () => mockGetLocalIP(),
  generateWsUrl: (host: string, port: string) => `ws://${host}:${port}/ws`,
  testWebSocketConnection: (url: string, timeout: number) => mockTestWebSocketConnection(url, timeout),
}));

import { useNetworkConfig } from "../hooks/useNetworkConfig";

describe("useNetworkConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should return initial state", () => {
    const { result } = renderHook(() => useNetworkConfig());

    expect(result.current.config).toBeDefined();
    expect(result.current.interfaces).toBeDefined();
    expect(result.current.localIP).toBeDefined();
    expect(result.current.testStatus).toBe("idle");
    expect(result.current.detecting).toBe(false);
  });

  it("should update config", () => {
    const { result } = renderHook(() => useNetworkConfig());

    act(() => {
      result.current.updateConfig({ serverAddress: "192.168.1.100" });
    });

    expect(result.current.config.serverAddress).toBe("192.168.1.100");
  });

  it("should update port", () => {
    const { result } = renderHook(() => useNetworkConfig());

    act(() => {
      result.current.updateConfig({ port: "8080" });
    });

    expect(result.current.config.port).toBe("8080");
  });

  it("should save config", () => {
    const { result } = renderHook(() => useNetworkConfig());

    act(() => {
      result.current.save();
    });

    expect(mockSaveNetworkConfig).toHaveBeenCalled();
  });

  it("should reset config", () => {
    const { result } = renderHook(() => useNetworkConfig());

    act(() => {
      result.current.updateConfig({ serverAddress: "modified" });
    });

    expect(result.current.config.serverAddress).toBe("modified");

    act(() => {
      result.current.reset();
    });

    expect(mockResetNetworkConfig).toHaveBeenCalled();
  });

  it("should test connection", async () => {
    const { result } = renderHook(() => useNetworkConfig());

    await act(async () => {
      await result.current.testConnection();
    });

    expect(result.current.testStatus).toBe("success");
    expect(result.current.testLatency).toBe(50);
  });

  it("should handle connection test failure", async () => {
    mockTestWebSocketConnection.mockResolvedValueOnce({
      success: false,
      latency: 0,
      error: "Connection refused",
    });

    const { result } = renderHook(() => useNetworkConfig());

    await act(async () => {
      await result.current.testConnection();
    });

    expect(result.current.testStatus).toBe("failed");
    expect(result.current.testError).toBe("Connection refused");
  });

  it("should detect network", async () => {
    const { result } = renderHook(() => useNetworkConfig());

    await act(async () => {
      await result.current.detectNetwork();
    });

    expect(result.current.detecting).toBe(false);
  });

  it("should reset test status on config update", () => {
    const { result } = renderHook(() => useNetworkConfig());

    act(() => {
      result.current.updateConfig({ serverAddress: "new-server" });
    });

    expect(result.current.testStatus).toBe("idle");
  });
});
