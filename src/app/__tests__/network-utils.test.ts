/**
 * @file: network-utils.test.ts
 * @description: network-utils 单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateWsUrl,
  DEFAULT_NETWORK_CONFIG,
  loadNetworkConfig,
  saveNetworkConfig,
  resetNetworkConfig,
  getLocalIP,
  getNetworkInterfaces,
  testWebSocketConnection,
  testHTTPConnection,
} from "../lib/network-utils";

describe("generateWsUrl", () => {
  it("should generate WebSocket URL from address and port", () => {
    const url = generateWsUrl("localhost", "3113");
    expect(url).toBe("ws://localhost:3113/ws");
  });

  it("should handle IP address", () => {
    const url = generateWsUrl("192.168.1.100", "8080");
    expect(url).toBe("ws://192.168.1.100:8080/ws");
  });
});

describe("DEFAULT_NETWORK_CONFIG", () => {
  it("should have required properties", () => {
    expect(DEFAULT_NETWORK_CONFIG.serverAddress).toBeDefined();
    expect(DEFAULT_NETWORK_CONFIG.port).toBeDefined();
    expect(DEFAULT_NETWORK_CONFIG.wsUrl).toBeDefined();
    expect(DEFAULT_NETWORK_CONFIG.mode).toBeDefined();
  });

  it("should have consistent wsUrl", () => {
    const expectedUrl = generateWsUrl(
      DEFAULT_NETWORK_CONFIG.serverAddress,
      DEFAULT_NETWORK_CONFIG.port
    );
    expect(DEFAULT_NETWORK_CONFIG.wsUrl).toBe(expectedUrl);
  });
});

describe("loadNetworkConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return default config when nothing stored", () => {
    const config = loadNetworkConfig();
    expect(config.serverAddress).toBe(DEFAULT_NETWORK_CONFIG.serverAddress);
    expect(config.port).toBe(DEFAULT_NETWORK_CONFIG.port);
  });

  it("should load saved config", () => {
    const savedConfig = {
      serverAddress: "custom.server",
      port: "9999",
    };
    localStorage.setItem("network_config", JSON.stringify(savedConfig));

    const config = loadNetworkConfig();
    expect(config.serverAddress).toBe("custom.server");
    expect(config.port).toBe("9999");
  });

  it("should handle invalid JSON", () => {
    localStorage.setItem("network_config", "invalid json");

    const config = loadNetworkConfig();
    expect(config.serverAddress).toBe(DEFAULT_NETWORK_CONFIG.serverAddress);
  });
});

describe("saveNetworkConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should save config to localStorage", () => {
    const config = {
      serverAddress: "saved.server",
      port: "7777",
      nasAddress: "saved.server:9898",
      wsUrl: "ws://saved.server:7777/ws",
      mode: "auto" as const,
    };

    saveNetworkConfig(config);

    const stored = localStorage.getItem("network_config");
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.serverAddress).toBe("saved.server");
    expect(parsed.port).toBe("7777");
  });
});

describe("resetNetworkConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should remove stored config and return default", () => {
    localStorage.setItem("network_config", JSON.stringify({ serverAddress: "custom" }));

    const config = resetNetworkConfig();

    expect(config.serverAddress).toBe(DEFAULT_NETWORK_CONFIG.serverAddress);
    expect(localStorage.getItem("network_config")).toBeNull();
  });
});

describe("getLocalIP", () => {
  it("should return IP address", async () => {
    const ip = await getLocalIP();
    expect(typeof ip).toBe("string");
    expect(ip.length).toBeGreaterThan(0);
  });

  it("should fallback to 127.0.0.1 when WebRTC fails", async () => {
    const originalRTCPeerConnection = global.RTCPeerConnection;
    (global as Record<string, unknown>).RTCPeerConnection = undefined;

    const ip = await getLocalIP();
    expect(ip).toBe("127.0.0.1");

    (global as Record<string, unknown>).RTCPeerConnection = originalRTCPeerConnection;
  });
});

describe("getNetworkInterfaces", () => {
  it("should return network interfaces", async () => {
    const interfaces = await getNetworkInterfaces();

    expect(Array.isArray(interfaces)).toBe(true);
    expect(interfaces.length).toBeGreaterThan(0);
    expect(interfaces[0].name).toBeDefined();
    expect(interfaces[0].type).toBeDefined();
    expect(interfaces[0].ip).toBeDefined();
    expect(interfaces[0].status).toBeDefined();
  });

  it("should detect online status", async () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });

    const interfaces = await getNetworkInterfaces();
    expect(interfaces[0].status).toBe("active");
  });

  it("should detect offline status", async () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const interfaces = await getNetworkInterfaces();
    expect(interfaces[0].status).toBe("inactive");
  });
});

describe("testWebSocketConnection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should test connection and return result", async () => {
    const resultPromise = testWebSocketConnection("ws://localhost:3113/ws", 1000);

    vi.runAllTimers();

    const result = await resultPromise;
    expect(result.success).toBeDefined();
    expect(typeof result.latency).toBe("number");
  });

  it("should timeout after specified time", async () => {
    const resultPromise = testWebSocketConnection("ws://invalid:9999/ws", 100);

    vi.advanceTimersByTime(150);

    const result = await resultPromise;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("testHTTPConnection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should test HTTP connection", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response());

    const resultPromise = testHTTPConnection("http://localhost:3113/health", 1000);

    await vi.runAllTimersAsync();

    const result = await resultPromise;
    expect(result.success).toBeDefined();
    expect(typeof result.latency).toBe("number");
  });

  it("should handle fetch error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const resultPromise = testHTTPConnection("http://invalid:9999/health", 100);

    await vi.runAllTimersAsync();

    const result = await resultPromise;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle timeout", async () => {
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 10000);
        })
    );

    const resultPromise = testHTTPConnection("http://localhost:3113/health", 100);

    await vi.runAllTimersAsync();

    const result = await resultPromise;
    expect(result.success).toBe(false);
  });
});
