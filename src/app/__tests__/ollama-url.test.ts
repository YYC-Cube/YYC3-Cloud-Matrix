/**
 * @file: ollama-url.test.ts
 * @description: ollama-url模块单元测试
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
  isLocalDeployment,
  shouldUseProxy,
  getOllamaChatUrl,
  getOllamaTagsUrl,
  getOllamaUrl,
  getOllamaEndpointInfo,
} from "../lib/ollama-url";

describe("ollama-url", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  describe("isLocalDeployment()", () => {
    it("should return true for localhost", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });
      expect(isLocalDeployment()).toBe(true);
    });

    it("should return true for 127.0.0.1", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "127.0.0.1" },
        writable: true,
      });
      expect(isLocalDeployment()).toBe(true);
    });

    it("should return true for 192.168.x.x", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "192.168.1.100" },
        writable: true,
      });
      expect(isLocalDeployment()).toBe(true);
    });

    it("should return true for 10.x.x.x", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "10.0.0.1" },
        writable: true,
      });
      expect(isLocalDeployment()).toBe(true);
    });

    it("should return true for 172.x.x.x", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "172.16.0.1" },
        writable: true,
      });
      expect(isLocalDeployment()).toBe(true);
    });

    it("should return false for public IP", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "example.com" },
        writable: true,
      });
      expect(isLocalDeployment()).toBe(false);
    });

    it("should return false for public IP address", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "8.8.8.8" },
        writable: true,
      });
      expect(isLocalDeployment()).toBe(false);
    });

    it("should return false when window is undefined", () => {
      const originalWindow = global.window;
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });
      expect(isLocalDeployment()).toBe(false);
      Object.defineProperty(global, "window", {
        value: originalWindow,
        writable: true,
      });
    });
  });

  describe("shouldUseProxy()", () => {
    it("should return true for local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });
      expect(shouldUseProxy()).toBe(true);
    });

    it("should return false for non-local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "example.com" },
        writable: true,
      });
      expect(shouldUseProxy()).toBe(false);
    });
  });

  describe("getOllamaChatUrl()", () => {
    it("should return proxy URL for local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });
      const url = getOllamaChatUrl();
      expect(url).toBe("/api/v1/llm/ollama/chat");
    });

    it("should return direct URL for non-local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "example.com" },
        writable: true,
      });
      const url = getOllamaChatUrl();
      expect(url).toBe("http://localhost:11434/api/chat");
    });
  });

  describe("getOllamaTagsUrl()", () => {
    it("should return proxy URL for local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });
      const url = getOllamaTagsUrl();
      expect(url).toBe("/api/v1/llm/ollama/tags");
    });

    it("should return direct URL for non-local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "example.com" },
        writable: true,
      });
      const url = getOllamaTagsUrl();
      expect(url).toBe("http://localhost:11434/api/tags");
    });
  });

  describe("getOllamaUrl()", () => {
    it("should return proxy URL for local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });
      const url = getOllamaUrl("show");
      expect(url).toBe("/api/v1/llm/ollama/show");
    });

    it("should return direct URL for non-local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "example.com" },
        writable: true,
      });
      const url = getOllamaUrl("show");
      expect(url).toBe("http://localhost:11434/api/show");
    });

    it("should handle subPath with leading slash", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });
      const url = getOllamaUrl("/generate");
      expect(url).toBe("/api/v1/llm/ollama/generate");
    });

    it("should handle embeddings subPath", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });
      const url = getOllamaUrl("embeddings");
      expect(url).toBe("/api/v1/llm/ollama/embeddings");
    });
  });

  describe("getOllamaEndpointInfo()", () => {
    it("should return proxy mode info for local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });
      const info = getOllamaEndpointInfo();
      expect(info.mode).toBe("proxy");
      expect(info.chatUrl).toBe("/api/v1/llm/ollama/chat");
      expect(info.tagsUrl).toBe("/api/v1/llm/ollama/tags");
      expect(info.proxyPath).toBe("/api/v1/llm/ollama");
      expect(info.directBase).toBe("http://localhost:11434");
    });

    it("should return direct mode info for non-local deployment", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "example.com" },
        writable: true,
      });
      const info = getOllamaEndpointInfo();
      expect(info.mode).toBe("direct");
      expect(info.chatUrl).toBe("http://localhost:11434/api/chat");
      expect(info.tagsUrl).toBe("http://localhost:11434/api/tags");
      expect(info.proxyPath).toBe("/api/v1/llm/ollama");
      expect(info.directBase).toBe("http://localhost:11434");
    });
  });
});
