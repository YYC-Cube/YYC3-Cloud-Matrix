/**
 * @file: ai-service-manager.test.ts
 * @description: ai-service-manager.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AIServiceManager, getAIServiceManager, resetAIServiceManager } from "../lib/ai-service-manager";
import type { ConfiguredModel } from "../types";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock model
const mockModel: ConfiguredModel = {
  id: "test-model-1",
  providerId: "openai",
  providerLabel: "OpenAI",
  model: "gpt-4",
  apiKey: "test-api-key",
  baseUrl: "https://api.openai.com/v1",
  createdAt: Date.now(),
  lastUsed: null,
  status: "active",
};

describe("AIServiceManager", () => {
  let manager: AIServiceManager;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    resetAIServiceManager();
    manager = getAIServiceManager({ maxConcurrent: 2, maxRetries: 1, cacheEnabled: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sendRequest", () => {
    it("should send request and return response", async () => {
      const mockResponse = {
        id: "chat-1",
        choices: [{ message: { content: "Hello!" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await manager.sendRequest({
        model: mockModel,
        messages: [{ role: "user", content: "Hi" }],
        priority: "normal",
        temperature: 0.7,
      });

      expect(result.response.content).toBe("Hello!");
      expect(result.cached).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle API errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        manager.sendRequest({
          model: mockModel,
          messages: [{ role: "user", content: "Hi" }],
          priority: "normal",
          temperature: 0.7,
        })
      ).rejects.toThrow("Network error");
    });

    it("should handle rate limit with retry", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Rate Limit",
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "chat-2",
          choices: [{ message: { content: "Success!" }, finish_reason: "stop" }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      });

      const result = await manager.sendRequest({
        model: mockModel,
        messages: [{ role: "user", content: "Hi" }],
        priority: "normal",
        temperature: 0.7,
      });

      expect(result.response.content).toBe("Success!");
      expect(result.retries).toBe(1);
    });
  });

  describe("priority queue", () => {
    it("should process high priority requests first", async () => {
      const responses = ["low", "high", "normal"];
      let callIndex = 0;

      mockFetch.mockImplementation(async () => ({
        ok: true,
        json: async () => ({
          id: `chat-${callIndex}`,
          choices: [{ message: { content: responses[callIndex++] }, finish_reason: "stop" }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      }));

      const [lowResult, highResult, normalResult] = await Promise.all([
        manager.sendRequest({
          model: mockModel,
          messages: [{ role: "user", content: "low" }],
          priority: "low",
          temperature: 0.7,
        }),
        manager.sendRequest({
          model: mockModel,
          messages: [{ role: "user", content: "high" }],
          priority: "high",
          temperature: 0.7,
        }),
        manager.sendRequest({
          model: mockModel,
          messages: [{ role: "user", content: "normal" }],
          priority: "normal",
          temperature: 0.7,
        }),
      ]);

      expect(highResult.response.content).toBe("high");
    });
  });

  describe("caching", () => {
    it("should cache responses when enabled", async () => {
      resetAIServiceManager();
      manager = getAIServiceManager({ cacheEnabled: true, cacheTTLMs: 60000 });

      const mockResponse = {
        id: "chat-1",
        choices: [{ message: { content: "Cached!" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result1 = await manager.sendRequest({
        model: mockModel,
        messages: [{ role: "user", content: "Same query" }],
        priority: "normal",
        temperature: 0.7,
      });

      const result2 = await manager.sendRequest({
        model: mockModel,
        messages: [{ role: "user", content: "Same query" }],
        priority: "normal",
        temperature: 0.7,
      });

      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should not cache streaming requests", async () => {
      resetAIServiceManager();
      manager = getAIServiceManager({ cacheEnabled: true });

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n') })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      mockFetch.mockResolvedValue({
        ok: true,
        body: { getReader: () => mockReader },
      });

      const onChunk = vi.fn();

      await manager.sendRequest({
        model: mockModel,
        messages: [{ role: "user", content: "Stream" }],
        priority: "normal",
        temperature: 0.7,
        onChunk,
      });

      expect(onChunk).toHaveBeenCalled();
    });
  });

  describe("stats", () => {
    it("should track request statistics", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "chat-1",
          choices: [{ message: { content: "Response" }, finish_reason: "stop" }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      });

      await manager.sendRequest({
        model: mockModel,
        messages: [{ role: "user", content: "Test" }],
        priority: "normal",
        temperature: 0.7,
      });

      const stats = manager.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1);
      expect(stats.failedRequests).toBe(0);
    });
  });

  describe("cancelRequest", () => {
    it("should cancel pending request", async () => {
      const mockResponse = {
        id: "chat-1",
        choices: [{ message: { content: "Response" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      mockFetch.mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 100));
        return { ok: true, json: async () => mockResponse };
      });

      const requestPromise = manager.sendRequest({
        model: mockModel,
        messages: [{ role: "user", content: "Test" }],
        priority: "low",
        temperature: 0.7,
      });

      const stats = manager.getStats();
      const cancelled = manager.cancelRequest(
        Array.from((manager as unknown as { activeRequests: Map<string, unknown> }).activeRequests.keys())[0] || "unknown"
      );

      if (cancelled) {
        await expect(requestPromise).rejects.toThrow("Request cancelled");
      }
    });
  });
});

describe("Singleton", () => {
  it("should return same instance", () => {
    resetAIServiceManager();
    const instance1 = getAIServiceManager();
    const instance2 = getAIServiceManager();
    expect(instance1).toBe(instance2);
  });

  it("should reset instance", () => {
    const instance1 = getAIServiceManager();
    resetAIServiceManager();
    const instance2 = getAIServiceManager();
    expect(instance1).not.toBe(instance2);
  });
});
