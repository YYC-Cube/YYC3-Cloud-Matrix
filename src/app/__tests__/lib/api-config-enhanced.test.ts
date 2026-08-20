/**
 * @file: api-config-enhanced.test.ts
 * @description: api-config-enhanced.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAPIConfig,
  setAPIConfig,
  resetAPIConfig,
  setAPIConfigWithValidation,
  validateConfigUpdates,
  onAPIConfigChange,
  type APIEndpoints,
} from "../../lib/api-config";

vi.mock("../../lib/error-handler", () => ({
  captureError: vi.fn(),
}));

describe("API Configuration", () => {
  beforeEach(() => {
    localStorage.clear();
    resetAPIConfig();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    resetAPIConfig();
  });

  describe("getAPIConfig", () => {
    it("should return default config when no custom config exists", () => {
      const config = getAPIConfig();

      expect(config).toBeDefined();
      expect(config.fsBase).toBeDefined();
      expect(config.wsEndpoint).toBeDefined();
      expect(config.dbBase).toBeDefined();
    });

    it("should return custom config from localStorage", async () => {
      const customConfig: Partial<APIEndpoints> = {
        fsBase: "/custom/fs",
        wsEndpoint: "ws://custom.example.com/ws",
      };

      localStorage.setItem("yyc3_api_endpoints", JSON.stringify(customConfig));

      vi.resetModules();

      const { getAPIConfig: getConfig } = await import("../../lib/api-config");
      const config = getConfig();

      expect(config.fsBase).toBe("/custom/fs");
      expect(config.wsEndpoint).toBe("ws://custom.example.com/ws");
    });

    it("should handle invalid localStorage data gracefully", () => {
      localStorage.setItem("yyc3_api_endpoints", "invalid-json");

      const config = getAPIConfig();

      expect(config).toBeDefined();
      expect(config.fsBase).toBeDefined();
    });
  });

  describe("setAPIConfig", () => {
    it("should save config to localStorage", () => {
      const customConfig: Partial<APIEndpoints> = {
        fsBase: "/new/fs",
        wsEndpoint: "ws://new.example.com/ws",
      };

      setAPIConfig(customConfig);

      const stored = JSON.parse(localStorage.getItem("yyc3_api_endpoints") || "{}");
      expect(stored.fsBase).toBe("/new/fs");
      expect(stored.wsEndpoint).toBe("ws://new.example.com/ws");
    });

    it("should merge with existing config", () => {
      setAPIConfig({
        fsBase: "/first/fs",
      });

      setAPIConfig({
        wsEndpoint: "ws://second.example.com/ws",
      });

      const config = getAPIConfig();
      expect(config.fsBase).toBe("/first/fs");
      expect(config.wsEndpoint).toBe("ws://second.example.com/ws");
    });

    it("should validate config before saving", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
      const invalidConfig = {
        fsBase: "not-a-valid-url",
      };

      const result = setAPIConfig(invalidConfig);

      expect(result).toBeDefined();
      warnSpy.mockRestore();
    });
  });

  describe("Default Values", () => {
    it("should have correct default fsBase", () => {
      const config = getAPIConfig();
      expect(config.fsBase).toBe("/api/fs");
    });

    it("should have correct default dbBase", () => {
      const config = getAPIConfig();
      expect(config.dbBase).toBe("/api/db");
    });

    it("should have correct default wsEndpoint", () => {
      const config = getAPIConfig();
      expect(config.wsEndpoint).toBe("ws://localhost:3113/ws");
    });

    it("should have correct default aiBase", () => {
      const config = getAPIConfig();
      expect(config.aiBase).toBe("https://api.openai.com/v1");
    });

    it("should have correct default timeout", () => {
      const config = getAPIConfig();
      expect(config.timeout).toBe(15000);
    });

    it("should have correct default maxRetries", () => {
      const config = getAPIConfig();
      expect(config.maxRetries).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty localStorage", () => {
      localStorage.clear();

      const config = getAPIConfig();

      expect(config).toBeDefined();
    });

    it("should handle null localStorage values", () => {
      localStorage.setItem("yyc3_api_endpoints", "null");

      const config = getAPIConfig();

      expect(config).toBeDefined();
    });

    it("should handle partial config updates", () => {
      setAPIConfig({
        fsBase: "/partial/fs",
      });

      const config = getAPIConfig();

      expect(config.fsBase).toBe("/partial/fs");
    });

    it("should handle empty config updates", () => {
      const originalConfig = getAPIConfig();

      setAPIConfig({});

      const config = getAPIConfig();
      expect(config).toEqual(originalConfig);
    });
  });

  describe("Configuration Validation", () => {
    it("should accept valid URL paths", () => {
      const result = setAPIConfig({
        fsBase: "/valid/path",
      });

      expect(result).toBeDefined();
    });

    it("should accept valid WebSocket URLs", () => {
      const result = setAPIConfig({
        wsEndpoint: "ws://valid.example.com/ws",
      });

      expect(result).toBeDefined();
    });

    it("should accept valid HTTP URLs", () => {
      const result = setAPIConfig({
        aiBase: "https://api.valid.com/v1",
      });

      expect(result).toBeDefined();
    });

    it("should accept valid timeout values", () => {
      const result = setAPIConfig({
        timeout: 30000,
      });

      expect(result).toBeDefined();
    });

    it("should accept valid maxRetries values", () => {
      const result = setAPIConfig({
        maxRetries: 5,
      });

      expect(result).toBeDefined();
    });
  });

  describe("Type Safety", () => {
    it("should maintain type safety for boolean fields", () => {
      setAPIConfig({
        enableBackend: true,
      });

      const config = getAPIConfig();
      expect(config.enableBackend).toBe(true);
    });

    it("should maintain type safety for number fields", () => {
      setAPIConfig({
        timeout: 20000,
        maxRetries: 3,
      });

      const config = getAPIConfig();
      expect(config.timeout).toBe(20000);
      expect(config.maxRetries).toBe(3);
    });

    it("should maintain type safety for string fields", () => {
      setAPIConfig({
        fsBase: "/api/custom",
        dbBase: "/api/custom-db",
      });

      const config = getAPIConfig();
      expect(config.fsBase).toBe("/api/custom");
      expect(config.dbBase).toBe("/api/custom-db");
    });
  });

  describe("setAPIConfigWithValidation", () => {
    it("should return config and validation result on success", () => {
      const result = setAPIConfigWithValidation({ fsBase: "/api/test" });

      expect(result.config).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.validation.success).toBe(true);
      expect(result.config.fsBase).toBe("/api/test");
    });

    it("should return failed validation for invalid input", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = setAPIConfigWithValidation({ fsBase: "bad-url" });

      expect(result.validation.success).toBe(false);
      expect(result.config).toBeDefined();
      warnSpy.mockRestore();
    });

    it("should persist valid config to localStorage", () => {
      setAPIConfigWithValidation({ timeout: 9999 });

      const stored = JSON.parse(localStorage.getItem("yyc3_api_endpoints") || "{}");
      expect(stored.timeout).toBe(9999);
    });
  });

  describe("validateConfigUpdates", () => {
    it("should return success for valid updates", () => {
      const result = validateConfigUpdates({ fsBase: "/valid" });

      expect(result.success).toBe(true);
    });

    it("should return failure for invalid updates", () => {
      const result = validateConfigUpdates({ fsBase: "not-valid" });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe("onAPIConfigChange", () => {
    it("should call listener when config changes", () => {
      const listener = vi.fn();
      const cleanup = onAPIConfigChange(listener);

      setAPIConfig({ timeout: 5555 });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].timeout).toBe(5555);

      cleanup();
    });

    it("should return cleanup function that removes listener", () => {
      const listener = vi.fn();
      const cleanup = onAPIConfigChange(listener);

      cleanup();
      listener.mockClear();

      setAPIConfig({ timeout: 7777 });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should call listener on reset", () => {
      const listener = vi.fn();
      const cleanup = onAPIConfigChange(listener);

      resetAPIConfig();

      expect(listener).toHaveBeenCalled();

      cleanup();
    });
  });
});
