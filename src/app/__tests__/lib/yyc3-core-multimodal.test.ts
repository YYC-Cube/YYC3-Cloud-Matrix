/**
 * @file: yyc3-core-multimodal.test.ts
 * @description: yyc3-core-multimodal.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UnifiedAuthManager } from "../../lib/yyc3-core/auth/unified-auth";
import { MultimodalManager } from "../../lib/yyc3-core/multimodal/manager";
import type { AudioInput, DocumentInput, ImageInput, MultimodalInput } from "../../lib/yyc3-core/multimodal/types";

function createMockAuthManager(): UnifiedAuthManager {
  return {
    chat: vi.fn().mockResolvedValue({
      id: "mock-1",
      object: "chat.completion",
      created: Date.now(),
      model: "mock-model",
      choices: [{ index: 0, message: { role: "assistant", content: "这是一个测试图像的描述分析结果" }, finishReason: "stop" }],
      usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
    }),
    getActiveProvider: vi.fn().mockReturnValue("ollama"),
  } as unknown as UnifiedAuthManager;
}

describe("MultimodalManager", () => {
  let manager: MultimodalManager;
  let mockAuth: UnifiedAuthManager;

  beforeEach(() => {
    mockAuth = createMockAuthManager();
    manager = new MultimodalManager(mockAuth, {
      openai: { apiKey: "sk-test", baseUrl: "http://localhost:19999" },
      ollama: { baseUrl: "http://localhost:19999" },
    });
  });

  it("should create manager with auth", () => {
    expect(manager.authManager).toBe(mockAuth);
    expect(manager.config).toBeDefined();
  });

  it("should expose processors", () => {
    expect(manager.getImageProcessor()).toBeDefined();
    expect(manager.getAudioProcessor()).toBeDefined();
    expect(manager.getDocumentProcessor()).toBeDefined();
  });

  it("should process image input", async () => {
    const input: ImageInput = {
      type: "image",
      data: "base64encodedimagedata",
      format: "png",
      width: 100,
      height: 100,
    };
    const result = await manager.process(input);
    expect(result).toBeDefined();
    expect(result.type).toBe("image");
    expect(typeof result.success).toBe("boolean");
  });

  it("should process video input", async () => {
    const input: MultimodalInput = {
      type: "video",
      data: "video data",
      format: "mp4",
    };
    const result = await manager.process(input);
    expect(result).toBeDefined();
    expect(result.type).toBe("video");
    expect(result.success).toBe(true);
  });

  it("should reject unsupported type", async () => {
    const input = { type: "hologram", data: "data", format: "holo" } as unknown as MultimodalInput;
    const result = await manager.process(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain("不支持");
  });

  it("should emit processing_started event", async () => {
    const handler = vi.fn();
    manager.on("processing_started", handler);
    const input: ImageInput = { type: "image", data: "d", format: "png" };
    await manager.process(input);
    expect(handler).toHaveBeenCalledWith({ type: "image", input });
  });

  it("should emit processing_completed event on success", async () => {
    const handler = vi.fn();
    manager.on("processing_completed", handler);
    const input: MultimodalInput = { type: "video", data: "d", format: "mp4" };
    await manager.process(input);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].type).toBe("video");
  });

  it("should emit processing_failed event on error", async () => {
    const handler = vi.fn();
    manager.on("processing_failed", handler);
    const input = { type: "hologram", data: "data", format: "holo" } as unknown as MultimodalInput;
    await manager.process(input);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should batch process multiple inputs", async () => {
    const inputs: MultimodalInput[] = [
      { type: "video", data: "d1", format: "mp4" },
      { type: "video", data: "d2", format: "webm" },
    ];
    const results = await manager.processBatch(inputs);
    expect(results).toHaveLength(2);
    expect(results[0].type).toBe("video");
    expect(results[1].type).toBe("video");
  });

  it("should analyze image via processor", async () => {
    const input: ImageInput = { type: "image", data: "d", format: "png" };
    const result = await manager.analyzeImage(input);
    expect(result).toBeDefined();
  });

  it("should parse document via processor", async () => {
    const input: DocumentInput = { type: "document", data: "text content", format: "txt" };
    const result = await manager.parseDocument(input);
    expect(result).toBeDefined();
  });

  it("should handle audio processing failure gracefully", async () => {
    const input: AudioInput = {
      type: "audio",
      data: "invalid-base64!!!",
      format: "mp3",
      duration: 10,
    };
    const result = await manager.process(input);
    expect(result.type).toBe("audio");
  });
});
