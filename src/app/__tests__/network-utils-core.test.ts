/**
 * @file: network-utils-core.test.ts
 * @description: network-utils-core.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateWsUrl,
  DEFAULT_NETWORK_CONFIG,
  loadNetworkConfig,
  saveNetworkConfig,
  resetNetworkConfig,
} from "../lib/network-utils";

describe("network-utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("generateWsUrl", () => {
    it("should generate WebSocket URL from address and port", () => {
      const url = generateWsUrl("192.168.1.1", "8080");
      expect(url).toBe("ws://192.168.1.1:8080/ws");
    });

    it("should handle localhost", () => {
      const url = generateWsUrl("localhost", "3000");
      expect(url).toBe("ws://localhost:3000/ws");
    });

    it("should handle IP addresses", () => {
      const url = generateWsUrl("127.0.0.1", "3113");
      expect(url).toBe("ws://127.0.0.1:3113/ws");
    });
  });

  describe("DEFAULT_NETWORK_CONFIG", () => {
    it("should have default server address", () => {
      expect(DEFAULT_NETWORK_CONFIG.serverAddress).toBe("localhost");
    });

    it("should have default port", () => {
      expect(DEFAULT_NETWORK_CONFIG.port).toBe("3113");
    });

    it("should have default mode", () => {
      expect(DEFAULT_NETWORK_CONFIG.mode).toBe("auto");
    });

    it("should have generated wsUrl", () => {
      expect(DEFAULT_NETWORK_CONFIG.wsUrl).toBe("ws://localhost:3113/ws");
    });
  });

  describe("loadNetworkConfig", () => {
    it("should return default config when nothing stored", () => {
      const config = loadNetworkConfig();
      expect(config.serverAddress).toBe("localhost");
    });

    it("should load config from localStorage", () => {
      const customConfig = {
        serverAddress: "10.0.0.1",
        port: "9000",
        nasAddress: "10.0.0.1:9999",
        wsUrl: "ws://10.0.0.1:9000/ws",
        mode: "manual" as const,
      };
      localStorage.setItem("network_config", JSON.stringify(customConfig));

      const config = loadNetworkConfig();
      expect(config.serverAddress).toBe("10.0.0.1");
      expect(config.port).toBe("9000");
      expect(config.mode).toBe("manual");
    });

    it("should merge with defaults for partial config", () => {
      const partialConfig = {
        serverAddress: "10.0.0.1",
      };
      localStorage.setItem("network_config", JSON.stringify(partialConfig));

      const config = loadNetworkConfig();
      expect(config.serverAddress).toBe("10.0.0.1");
      expect(config.port).toBe("3113");
    });

    it("should handle invalid JSON in localStorage", () => {
      localStorage.setItem("network_config", "invalid json");

      const config = loadNetworkConfig();
      expect(config.serverAddress).toBe("localhost");
    });
  });

  describe("saveNetworkConfig", () => {
    it("should save config to localStorage", () => {
      const config = {
        serverAddress: "10.0.0.1",
        port: "9000",
        nasAddress: "10.0.0.1:9999",
        wsUrl: "ws://10.0.0.1:9000/ws",
        mode: "manual" as const,
      };

      saveNetworkConfig(config);

      const stored = localStorage.getItem("network_config");
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.serverAddress).toBe("10.0.0.1");
    });
  });

  describe("resetNetworkConfig", () => {
    it("should remove config from localStorage", () => {
      localStorage.setItem("network_config", JSON.stringify({ serverAddress: "custom" }));

      const config = resetNetworkConfig();

      expect(config.serverAddress).toBe("localhost");
      expect(localStorage.getItem("network_config")).toBeNull();
    });

    it("should return default config", () => {
      const config = resetNetworkConfig();
      expect(config).toEqual(DEFAULT_NETWORK_CONFIG);
    });
  });
});
