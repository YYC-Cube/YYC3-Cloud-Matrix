/**
 * @file: config-validator.test.ts
 * @description: 配置验证器单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-03
 * @updated: 2026-04-03
 * @status: active
 * @tags: [validation, zod, config]
 */

// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  validateAPIConfig,
  validatePartialAPIConfig,
  formatValidationErrors,
  getDefaultValue,
  sanitizeAPIConfig,
  apiEndpointsSchema,
} from "../lib/config-validator";

describe("config-validator", () => {
  describe("validateAPIConfig", () => {
    it("should validate a valid complete config", () => {
      const validConfig = {
        fsBase: "/api/fs",
        dbBase: "/api/db",
        wsEndpoint: "ws://localhost:3113/ws",
        aiBase: "https://api.openai.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: false,
        timeout: 15000,
        maxRetries: 2,
      };

      const result = validateAPIConfig(validConfig);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validConfig);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate config with absolute URLs", () => {
      const config = {
        fsBase: "http://localhost:3000/api/fs",
        dbBase: "https://api.example.com/db",
        wsEndpoint: "wss://ws.example.com/ws",
        aiBase: "https://api.openai.com/v1",
        clusterBase: "http://cluster.example.com/api",
        enableBackend: true,
        timeout: 30000,
        maxRetries: 5,
      };

      const result = validateAPIConfig(config);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(config);
    });

    it("should reject invalid WebSocket URL", () => {
      const invalidConfig = {
        fsBase: "/api/fs",
        dbBase: "/api/db",
        wsEndpoint: "http://localhost:3113/ws",
        aiBase: "https://api.openai.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: false,
        timeout: 15000,
        maxRetries: 2,
      };

      const result = validateAPIConfig(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.field === "wsEndpoint")).toBe(true);
    });

    it("should reject invalid AI base URL", () => {
      const invalidConfig = {
        fsBase: "/api/fs",
        dbBase: "/api/db",
        wsEndpoint: "ws://localhost:3113/ws",
        aiBase: "ws://invalid.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: false,
        timeout: 15000,
        maxRetries: 2,
      };

      const result = validateAPIConfig(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "aiBase")).toBe(true);
    });

    it("should reject timeout below minimum", () => {
      const invalidConfig = {
        fsBase: "/api/fs",
        dbBase: "/api/db",
        wsEndpoint: "ws://localhost:3113/ws",
        aiBase: "https://api.openai.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: false,
        timeout: 500,
        maxRetries: 2,
      };

      const result = validateAPIConfig(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "timeout")).toBe(true);
    });

    it("should reject timeout above maximum", () => {
      const invalidConfig = {
        fsBase: "/api/fs",
        dbBase: "/api/db",
        wsEndpoint: "ws://localhost:3113/ws",
        aiBase: "https://api.openai.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: false,
        timeout: 500000,
        maxRetries: 2,
      };

      const result = validateAPIConfig(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "timeout")).toBe(true);
    });

    it("should reject maxRetries above maximum", () => {
      const invalidConfig = {
        fsBase: "/api/fs",
        dbBase: "/api/db",
        wsEndpoint: "ws://localhost:3113/ws",
        aiBase: "https://api.openai.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: false,
        timeout: 15000,
        maxRetries: 15,
      };

      const result = validateAPIConfig(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "maxRetries")).toBe(true);
    });

    it("should reject negative maxRetries", () => {
      const invalidConfig = {
        fsBase: "/api/fs",
        dbBase: "/api/db",
        wsEndpoint: "ws://localhost:3113/ws",
        aiBase: "https://api.openai.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: false,
        timeout: 15000,
        maxRetries: -1,
      };

      const result = validateAPIConfig(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "maxRetries")).toBe(true);
    });

    it("should provide suggestions for errors", () => {
      const invalidConfig = {
        fsBase: "invalid-url",
        dbBase: "/api/db",
        wsEndpoint: "http://invalid.com/ws",
        aiBase: "ftp://invalid.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: false,
        timeout: 100,
        maxRetries: 20,
      };

      const result = validateAPIConfig(invalidConfig);

      expect(result.success).toBe(false);
      for (const error of result.errors) {
        expect(error.suggestion).toBeDefined();
      }
    });
  });

  describe("validatePartialAPIConfig", () => {
    it("should validate partial config", () => {
      const partialConfig = {
        timeout: 20000,
        maxRetries: 3,
      };

      const result = validatePartialAPIConfig(partialConfig);

      expect(result.success).toBe(true);
    });

    it("should reject invalid partial config", () => {
      const partialConfig = {
        timeout: 50,
      };

      const result = validatePartialAPIConfig(partialConfig);

      expect(result.success).toBe(false);
    });
  });

  describe("formatValidationErrors", () => {
    it("should return success message for empty errors", () => {
      const result = formatValidationErrors([]);
      expect(result).toBe("配置验证通过");
    });

    it("should format errors with suggestions", () => {
      const errors = [
        {
          field: "timeout",
          message: "超时时间不能小于 1000ms",
          code: "VALUE_TOO_SMALL",
          suggestion: "建议范围: 5000-60000ms，默认值: 15000ms",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toContain("timeout");
      expect(result).toContain("超时时间不能小于 1000ms");
      expect(result).toContain("建议范围");
    });
  });

  describe("getDefaultValue", () => {
    it("should return correct default values", () => {
      expect(getDefaultValue("timeout")).toBe(15000);
      expect(getDefaultValue("maxRetries")).toBe(2);
      expect(getDefaultValue("enableBackend")).toBe(false);
      expect(getDefaultValue("wsEndpoint")).toBe("ws://localhost:3113/ws");
      expect(getDefaultValue("aiBase")).toBe("https://api.openai.com/v1");
    });
  });

  describe("sanitizeAPIConfig", () => {
    it("should filter out unknown keys", () => {
      const input = {
        fsBase: "/api/fs",
        unknownKey: "should be removed",
        timeout: 20000,
        maliciousKey: "hack",
      };

      const result = sanitizeAPIConfig(input);

      expect(result).toHaveProperty("fsBase");
      expect(result).toHaveProperty("timeout");
      expect(result).not.toHaveProperty("unknownKey");
      expect(result).not.toHaveProperty("maliciousKey");
    });

    it("should only include allowed keys", () => {
      const input = {
        fsBase: "/api/fs",
        dbBase: "/api/db",
        wsEndpoint: "ws://localhost:3113/ws",
        aiBase: "https://api.openai.com/v1",
        clusterBase: "/api/cluster",
        enableBackend: true,
        timeout: 20000,
        maxRetries: 3,
      };

      const result = sanitizeAPIConfig(input);

      expect(Object.keys(result)).toHaveLength(8);
    });
  });

  describe("apiEndpointsSchema", () => {
    it("should be a valid Zod schema", () => {
      expect(apiEndpointsSchema).toBeDefined();
      expect(typeof apiEndpointsSchema.safeParse).toBe("function");
    });
  });
});
