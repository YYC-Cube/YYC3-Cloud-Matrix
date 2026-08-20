/**
 * @file: yyc3-core-auth.test.ts
 * @description: yyc3-core-auth.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UnifiedAuthManager } from "../../lib/yyc3-core/auth/unified-auth";
import { OllamaProvider } from "../../lib/yyc3-core/auth/ollama-provider";
import { OpenAIProvider } from "../../lib/yyc3-core/auth/openai-provider";
import type { AuthProvider, AuthProviderInfo } from "../../lib/yyc3-core/auth/types";

function createMockProvider(name: "openai" | "ollama", overrides?: Partial<AuthProvider>): AuthProvider {
  return {
    name,
    isReady: true,
    initialize: vi.fn().mockResolvedValue(undefined),
    chat: vi.fn().mockResolvedValue({
      id: "mock-1",
      object: "chat.completion",
      created: Date.now(),
      model: "mock-model",
      choices: [{ index: 0, message: { role: "assistant", content: "mock response" }, finishReason: "stop" }],
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    }),
    stream: vi.fn(),
    getModels: vi.fn().mockResolvedValue(["mock-model"]),
    validate: vi.fn().mockResolvedValue(true),
    dispose: vi.fn().mockResolvedValue(undefined),
    getInfo: vi.fn().mockReturnValue({
      name,
      displayName: name === "openai" ? "OpenAI" : "Ollama",
      description: "Mock provider",
      isAvailable: true,
      isLocal: name === "ollama",
      models: ["mock-model"],
      defaultModel: "mock-model",
    } as AuthProviderInfo),
    ...overrides,
  } as unknown as AuthProvider;
}

describe("UnifiedAuthManager", () => {
  let manager: UnifiedAuthManager;

  beforeEach(() => {
    manager = new UnifiedAuthManager({ autoDetect: false });
  });

  afterEach(async () => {
    await manager.dispose();
  });

  describe("Constructor", () => {
    it("should create with default config", () => {
      const m = new UnifiedAuthManager();
      const status = m.getStatus();
      expect(status.activeProvider).toBeNull();
      expect(status.providers).toEqual([]);
    });

    it("should accept config with preferLocal", () => {
      const m = new UnifiedAuthManager({ preferLocal: true, autoDetect: false });
      expect(m.getStatus().activeProvider).toBeNull();
    });
  });

  describe("Provider Management", () => {
    it("should register custom provider", () => {
      const provider = createMockProvider("openai");
      manager.registerProvider(provider);
      const providers = manager.getProviders();
      expect(providers).toHaveLength(1);
      expect(providers[0].name).toBe("openai");
    });

    it("should get active provider as null when none set", () => {
      expect(manager.getActiveProvider()).toBeNull();
    });

    it("should get status", () => {
      const status = manager.getStatus();
      expect(status.activeProvider).toBeNull();
      expect(status.lastChecked).toBeInstanceOf(Date);
      expect(status.errors).toEqual([]);
    });

    it("should switch provider", async () => {
      const provider = createMockProvider("openai");
      manager.registerProvider(provider);
      await manager.switchProvider("openai");
      expect(manager.getActiveProvider()).toBe(provider);
    });

    it("should throw when switching to unavailable provider", async () => {
      await expect(manager.switchProvider("openai")).rejects.toThrow("不可用");
    });
  });

  describe("Chat", () => {
    it("should send chat via active provider", async () => {
      const provider = createMockProvider("ollama");
      manager.registerProvider(provider);
      await manager.switchProvider("ollama");

      const response = await manager.chat([{ role: "user", content: "Hello" }]);
      expect(response.choices[0].message.content).toBe("mock response");
      expect(provider.chat).toHaveBeenCalledTimes(1);
    });

    it("should throw when no provider available", async () => {
      await expect(
        manager.chat([{ role: "user", content: "Hello" }])
      ).rejects.toThrow("没有可用的 AI 提供商");
    });
  });

  describe("Auto Detection", () => {
    it("should attempt auto detection", async () => {
      vi.spyOn(OpenAIProvider.prototype, "validate").mockResolvedValue(false);
      vi.spyOn(OllamaProvider.prototype, "validate").mockResolvedValue(false);
      const m = new UnifiedAuthManager({ autoDetect: true });
      const providers = await m.autoDetect();
      expect(providers).toEqual([]);
      await m.dispose();
    });
  });

  describe("Dispose", () => {
    it("should clear all providers", async () => {
      const provider = createMockProvider("openai");
      manager.registerProvider(provider);
      await manager.dispose();
      expect(manager.getProviders()).toEqual([]);
      expect(manager.getActiveProvider()).toBeNull();
    });
  });
});

describe("OllamaProvider", () => {
  it("should have correct name", () => {
    const provider = new OllamaProvider();
    expect(provider.name).toBe("ollama");
  });

  it("should not be ready before initialize", () => {
    const provider = new OllamaProvider();
    expect(provider.isReady).toBe(false);
  });

  it("should return info", () => {
    const provider = new OllamaProvider();
    const info = provider.getInfo();
    expect(info.name).toBe("ollama");
    expect(info.isLocal).toBe(true);
    expect(info.models.length).toBeGreaterThan(0);
  });

  it("should use custom config", () => {
    const provider = new OllamaProvider({ baseUrl: "http://custom:11434", defaultModel: "custom-model" });
    const info = provider.getInfo();
    expect(info.defaultModel).toBe("custom-model");
  });

  it("should validate returns false when service unreachable", async () => {
    const provider = new OllamaProvider({ baseUrl: "http://localhost:19999" });
    const isValid = await provider.validate();
    expect(isValid).toBe(false);
  });

  it("should get default models when unreachable", async () => {
    const provider = new OllamaProvider({ baseUrl: "http://localhost:19999" });
    const models = await provider.getModels();
    expect(models).toContain("llama3.2");
  });

  it("should dispose cleanly", async () => {
    const provider = new OllamaProvider();
    await provider.dispose();
    expect(provider.isReady).toBe(false);
  });
});

describe("OpenAIProvider", () => {
  it("should have correct name", () => {
    const provider = new OpenAIProvider();
    expect(provider.name).toBe("openai");
  });

  it("should not be ready without API key", () => {
    const provider = new OpenAIProvider();
    expect(provider.isReady).toBe(false);
  });

  it("should return info", () => {
    const provider = new OpenAIProvider();
    const info = provider.getInfo();
    expect(info.name).toBe("openai");
    expect(info.isLocal).toBe(false);
    expect(info.models.length).toBeGreaterThan(0);
  });

  it("should throw on initialize without API key", async () => {
    const provider = new OpenAIProvider();
    await expect(provider.initialize()).rejects.toThrow("未配置");
  });

  it("should validate returns false without API key", async () => {
    const provider = new OpenAIProvider();
    const isValid = await provider.validate();
    expect(isValid).toBe(false);
  });

  it("should be ready with API key after initialize", async () => {
    const provider = new OpenAIProvider({ apiKey: "sk-test-key" });
    await provider.initialize();
    expect(provider.isReady).toBe(true);
  });

  it("should dispose cleanly", async () => {
    const provider = new OpenAIProvider();
    await provider.dispose();
    expect(provider.isReady).toBe(false);
  });
});
