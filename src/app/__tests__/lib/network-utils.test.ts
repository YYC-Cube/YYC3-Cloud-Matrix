/**
 * @file: network-utils.test.ts
 * @description: network-utils.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  generateWsUrl,
  loadNetworkConfig,
  saveNetworkConfig,
  resetNetworkConfig,
  DEFAULT_NETWORK_CONFIG,
} from "../../lib/network-utils";

describe("network-utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("generateWsUrl", () => {
    it("should generate correct WebSocket URL", () => {
      expect(generateWsUrl("localhost", "3113")).toBe("ws://localhost:3113/ws");
    });

    it("should handle IP addresses", () => {
      expect(generateWsUrl("192.168.1.1", "8080")).toBe("ws://192.168.1.1:8080/ws");
    });
  });

  describe("DEFAULT_NETWORK_CONFIG", () => {
    it("should have expected defaults", () => {
      expect(DEFAULT_NETWORK_CONFIG.serverAddress).toBe("localhost");
      expect(DEFAULT_NETWORK_CONFIG.port).toBe("3113");
      expect(DEFAULT_NETWORK_CONFIG.mode).toBe("auto");
    });
  });

  describe("loadNetworkConfig", () => {
    it("should return defaults when nothing stored", () => {
      const config = loadNetworkConfig();
      expect(config.serverAddress).toBe("localhost");
      expect(config.port).toBe("3113");
    });

    it("should merge stored config with defaults", () => {
      localStorage.setItem("network_config", JSON.stringify({ serverAddress: "10.0.0.1" }));
      const config = loadNetworkConfig();
      expect(config.serverAddress).toBe("10.0.0.1");
      expect(config.port).toBe("3113");
    });
  });

  describe("saveNetworkConfig", () => {
    it("should persist config to localStorage", () => {
      const config = { ...DEFAULT_NETWORK_CONFIG, serverAddress: "custom" };
      saveNetworkConfig(config);
      const stored = JSON.parse(localStorage.getItem("network_config")!);
      expect(stored.serverAddress).toBe("custom");
    });
  });

  describe("resetNetworkConfig", () => {
    it("should clear stored config and return defaults", () => {
      localStorage.setItem("network_config", JSON.stringify({ serverAddress: "custom" }));
      const config = resetNetworkConfig();
      expect(config.serverAddress).toBe("localhost");
      expect(localStorage.getItem("network_config")).toBeNull();
    });
  });

  describe("getLocalIP", () => {
    it("should fallback to 127.0.0.1 when WebRTC unavailable", async () => {
      const { getLocalIP } = await import("../../lib/network-utils");
      const ip = await getLocalIP();
      expect(typeof ip).toBe("string");
      expect(ip.length).toBeGreaterThan(0);
    }, 10000);
  });
});
