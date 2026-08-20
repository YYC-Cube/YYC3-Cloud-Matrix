/**
 * @file: env-config.test.ts
 * @description: env-config模块单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  env,
  getEnvConfig,
  setEnvConfig,
  resetEnvConfig,
  exportEnvConfig,
  importEnvConfig,
} from "../lib/env-config";

const ENV_STORAGE_KEY = "yyc3_env_config";

describe("env-config", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("env()", () => {
    it("should return default system name", () => {
      const systemName = env("SYSTEM_NAME");
      expect(systemName).toBe("YYC³ Cloud Intelli-Matrix");
    });

    it("should return default system version", () => {
      const version = env("SYSTEM_VERSION");
      expect(version).toBe("3.4.1");
    });

    it("should return default API base URL", () => {
      const apiUrl = env("API_BASE_URL");
      expect(apiUrl).toBe("http://localhost:3113/api");
    });

    it("should return default WS endpoint", () => {
      const wsEndpoint = env("WS_ENDPOINT");
      expect(wsEndpoint).toBe("ws://localhost:3113/ws");
    });

    it("should return default storage prefix", () => {
      const prefix = env("STORAGE_PREFIX");
      expect(prefix).toBe("yyc3_");
    });

    it("should return default IDB name", () => {
      const idbName = env("IDB_NAME");
      expect(idbName).toBe("yyc3_matrix");
    });

    it("should return default IDB version", () => {
      const idbVersion = env("IDB_VERSION");
      expect(idbVersion).toBe(3);
    });

    it("should return default mock mode setting", () => {
      const mockMode = env("ENABLE_MOCK_MODE");
      expect(mockMode).toBe(true);
    });

    it("should return default debug setting", () => {
      const debug = env("ENABLE_DEBUG");
      expect(debug).toBe(false);
    });

    it("should return default PWA setting", () => {
      const pwa = env("ENABLE_PWA");
      expect(pwa).toBe(true);
    });

    it("should return default session timeout", () => {
      const timeout = env("SESSION_TIMEOUT_MIN");
      expect(timeout).toBe(30);
    });

    it("should return default max login attempts", () => {
      const attempts = env("MAX_LOGIN_ATTEMPTS");
      expect(attempts).toBe(5);
    });

    it("should return default AI model", () => {
      const model = env("DEFAULT_AI_MODEL");
      expect(model).toBe("codegeex4:latest");
    });

    it("should return default AI temperature", () => {
      const temp = env("DEFAULT_AI_TEMPERATURE");
      expect(temp).toBe(0.7);
    });

    it("should return default AI max tokens", () => {
      const tokens = env("DEFAULT_AI_MAX_TOKENS");
      expect(tokens).toBe(2048);
    });

    it("should return default DB pool min", () => {
      const poolMin = env("DB_POOL_MIN");
      expect(poolMin).toBe(2);
    });

    it("should return default DB pool max", () => {
      const poolMax = env("DB_POOL_MAX");
      expect(poolMax).toBe(10);
    });

    it("should return default SQL max history", () => {
      const history = env("SQL_MAX_HISTORY");
      expect(history).toBe(20);
    });
  });

  describe("getEnvConfig()", () => {
    it("should return full config object", () => {
      const config = getEnvConfig();
      expect(config).toHaveProperty("SYSTEM_NAME");
      expect(config).toHaveProperty("SYSTEM_VERSION");
      expect(config).toHaveProperty("API_BASE_URL");
      expect(config).toHaveProperty("WS_ENDPOINT");
      expect(config).toHaveProperty("STORAGE_PREFIX");
    });

    it("should return readonly config", () => {
      const config1 = getEnvConfig();
      const config2 = getEnvConfig();
      expect(config1).not.toBe(config2);
    });
  });

  describe("setEnvConfig()", () => {
    it("should update single config value", () => {
      const updated = setEnvConfig({ SYSTEM_NAME: "Custom System" });
      expect(updated.SYSTEM_NAME).toBe("Custom System");
    });

    it("should persist to localStorage", () => {
      setEnvConfig({ SYSTEM_NAME: "Persisted System" });
      const stored = localStorage.getItem(ENV_STORAGE_KEY);
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.SYSTEM_NAME).toBe("Persisted System");
    });

    it("should merge with existing config", () => {
      setEnvConfig({ SYSTEM_NAME: "System A" });
      setEnvConfig({ SYSTEM_VERSION: "1.0.0" });
      const config = getEnvConfig();
      expect(config.SYSTEM_NAME).toBe("System A");
      expect(config.SYSTEM_VERSION).toBe("1.0.0");
    });

    it("should update multiple values at once", () => {
      const updated = setEnvConfig({
        SYSTEM_NAME: "Multi Update",
        SYSTEM_VERSION: "2.0.0",
        ENABLE_DEBUG: true,
      });
      expect(updated.SYSTEM_NAME).toBe("Multi Update");
      expect(updated.SYSTEM_VERSION).toBe("2.0.0");
      expect(updated.ENABLE_DEBUG).toBe(true);
    });

    it("should handle localStorage errors gracefully", () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
      setItemSpy.mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      expect(() => setEnvConfig({ SYSTEM_NAME: "Test" })).not.toThrow();
      setItemSpy.mockRestore();
    });
  });

  describe("resetEnvConfig()", () => {
    it("should clear localStorage config", () => {
      setEnvConfig({ SYSTEM_NAME: "To Be Reset" });
      resetEnvConfig();
      const stored = localStorage.getItem(ENV_STORAGE_KEY);
      expect(stored).toBeNull();
    });

    it("should return default config", () => {
      setEnvConfig({ SYSTEM_NAME: "Custom Name" });
      const config = resetEnvConfig();
      expect(config.SYSTEM_NAME).toBe("YYC³ Cloud Intelli-Matrix");
    });

    it("should clear cached config", () => {
      setEnvConfig({ SYSTEM_NAME: "Cached Name" });
      resetEnvConfig();
      const name = env("SYSTEM_NAME");
      expect(name).toBe("YYC³ Cloud Intelli-Matrix");
    });
  });

  describe("exportEnvConfig()", () => {
    it("should export config as JSON string", () => {
      const exported = exportEnvConfig();
      expect(typeof exported).toBe("string");
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty("_type", "env-config");
      expect(parsed).toHaveProperty("config");
    });

    it("should include export timestamp", () => {
      const exported = exportEnvConfig();
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty("_exportedAt");
    });

    it("should export current config", () => {
      setEnvConfig({ SYSTEM_NAME: "Exported System" });
      const exported = exportEnvConfig();
      const parsed = JSON.parse(exported);
      expect(parsed.config.SYSTEM_NAME).toBe("Exported System");
    });
  });

  describe("importEnvConfig()", () => {
    it("should import valid config JSON", () => {
      const json = JSON.stringify({
        _type: "env-config",
        config: {
          SYSTEM_NAME: "Imported System",
          SYSTEM_VERSION: "4.0.0",
        },
      });
      const result = importEnvConfig(json);
      expect(result).toBe(true);
      expect(env("SYSTEM_NAME")).toBe("Imported System");
    });

    it("should import config without wrapper", () => {
      const json = JSON.stringify({
        SYSTEM_NAME: "Direct Import",
      });
      const result = importEnvConfig(json);
      expect(result).toBe(true);
      expect(env("SYSTEM_NAME")).toBe("Direct Import");
    });

    it("should return false for invalid JSON", () => {
      const result = importEnvConfig("invalid json");
      expect(result).toBe(false);
    });

    it("should return false for empty string", () => {
      const result = importEnvConfig("");
      expect(result).toBe(false);
    });

    it("should not modify config on import failure", () => {
      setEnvConfig({ SYSTEM_NAME: "Original Name" });
      importEnvConfig("invalid json");
      expect(env("SYSTEM_NAME")).toBe("Original Name");
    });
  });

  describe("localStorage integration", () => {
    it("should load config from localStorage on init", async () => {
      localStorage.setItem(
        ENV_STORAGE_KEY,
        JSON.stringify({ SYSTEM_NAME: "Stored Name" })
      );
      vi.resetModules();
      const { env: envReloaded } = await import("../lib/env-config");
      expect(envReloaded("SYSTEM_NAME")).toBe("Stored Name");
    });

    it("should handle corrupted localStorage data", async () => {
      localStorage.setItem(ENV_STORAGE_KEY, "invalid json");
      vi.resetModules();
      const { env: envReloaded } = await import("../lib/env-config");
      expect(envReloaded("SYSTEM_NAME")).toBe("YYC³ Cloud Intelli-Matrix");
    });
  });
});
