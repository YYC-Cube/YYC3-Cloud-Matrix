/**
 * @file: yyc3-core-processors.test.ts
 * @description: yyc3-core-processors.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageProcessor } from "../../lib/yyc3-core/multimodal/image-processor";
import { DocumentProcessor } from "../../lib/yyc3-core/multimodal/document-processor";
import type { UnifiedAuthManager } from "../../lib/yyc3-core/auth/unified-auth";
import type { ImageInput, DocumentInput } from "../../lib/yyc3-core/multimodal/types";

function createMockAuth(): UnifiedAuthManager {
  return {
    chat: vi.fn().mockResolvedValue({
      id: "mock-1",
      object: "chat.completion",
      created: Date.now(),
      model: "mock",
      choices: [{ index: 0, message: { role: "assistant", content: "这是一张包含蓝天的风景图片，有山和湖泊" }, finishReason: "stop" }],
      usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
    }),
  } as unknown as UnifiedAuthManager;
}

describe("ImageProcessor", () => {
  let processor: ImageProcessor;
  let mockAuth: UnifiedAuthManager;

  beforeEach(() => {
    mockAuth = createMockAuth();
    processor = new ImageProcessor(mockAuth);
  });

  it("should analyze image with default task", async () => {
    const input: ImageInput = { type: "image", data: "dGVzdA==", format: "png" };
    const result = await processor.analyze(input);
    expect(result).toBeDefined();
    expect(result.description).toBeDefined();
  });

  it("should analyze image with multiple tasks", async () => {
    const input: ImageInput = { type: "image", data: "dGVzdA==", format: "jpeg" };
    const result = await processor.analyze(input, { tasks: ["describe", "caption"] });
    expect(result).toBeDefined();
    expect(result.description).toBeDefined();
    expect(result.caption).toBeDefined();
  });

  it("should handle OCR task", async () => {
    const input: ImageInput = { type: "image", data: "dGVzdA==", format: "png" };
    const result = await processor.analyze(input, { tasks: ["ocr"] });
    expect(result.text).toBeDefined();
  });

  it("should handle classify task", async () => {
    const auth = createMockAuth();
    (auth.chat as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1", object: "chat.completion", created: Date.now(), model: "mock",
      choices: [{ index: 0, message: { role: "assistant", content: "- 风景照: 90%\n- 自然: 80%" }, finishReason: "stop" }],
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    });
    const proc = new ImageProcessor(auth);
    const input: ImageInput = { type: "image", data: "dGVzdA==", format: "png" };
    const result = await proc.analyze(input, { tasks: ["classify"] });
    expect(result.labels).toBeDefined();
    expect(result.labels!.length).toBeGreaterThan(0);
  });

  it("should handle detect task", async () => {
    const auth = createMockAuth();
    (auth.chat as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1", object: "chat.completion", created: Date.now(), model: "mock",
      choices: [{ index: 0, message: { role: "assistant", content: "- 山脉\n- 湖泊" }, finishReason: "stop" }],
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    });
    const proc = new ImageProcessor(auth);
    const input: ImageInput = { type: "image", data: "dGVzdA==", format: "png" };
    const result = await proc.analyze(input, { tasks: ["detect"] });
    expect(result.objects).toBeDefined();
    expect(result.objects!.length).toBeGreaterThan(0);
  });

  it("should prepare data URL from base64", async () => {
    const input: ImageInput = { type: "image", data: "base64data", format: "png" };
    await processor.analyze(input);
    const chatCalls = (mockAuth.chat as ReturnType<typeof vi.fn>).mock.calls;
    expect(chatCalls.length).toBeGreaterThan(0);
    const msgContent = chatCalls[0][0][0].content;
    expect(msgContent[1].image_url.url).toContain("data:image/png;base64,base64data");
  });

  it("should keep existing data URL unchanged", async () => {
    const input: ImageInput = { type: "image", data: "data:image/png;base64,abc", format: "png" };
    await processor.analyze(input);
    const chatCalls = (mockAuth.chat as ReturnType<typeof vi.fn>).mock.calls;
    const msgContent = chatCalls[0][0][0].content;
    expect(msgContent[1].image_url.url).toBe("data:image/png;base64,abc");
  });

  it("should batch analyze images", async () => {
    const images: ImageInput[] = [
      { type: "image", data: "dGVzdA==", format: "png" },
      { type: "image", data: "dGVzdA==", format: "jpeg" },
    ];
    const results = await processor.analyzeBatch(images);
    expect(results).toHaveLength(2);
  });
});

describe("DocumentProcessor", () => {
  let processor: DocumentProcessor;
  let mockAuth: UnifiedAuthManager;

  beforeEach(() => {
    mockAuth = createMockAuth();
    processor = new DocumentProcessor(mockAuth);
  });

  it("should parse plain text document", async () => {
    const doc: DocumentInput = { type: "document", data: "Hello World", format: "txt" };
    const result = await processor.parse(doc);
    expect(result.text).toBe("Hello World");
  });

  it("should parse markdown document", async () => {
    const doc: DocumentInput = { type: "document", data: "# Title\n\nContent", format: "md" };
    const result = await processor.parse(doc);
    expect(result.text).toContain("Title");
  });

  it("should strip HTML tags", async () => {
    const doc: DocumentInput = { type: "document", data: "<h1>Title</h1><p>Content</p>", format: "html" };
    const result = await processor.parse(doc);
    expect(result.text).not.toContain("<h1>");
    expect(result.text).toContain("Title");
    expect(result.text).toContain("Content");
  });

  it("should extract metadata when requested", async () => {
    const doc: DocumentInput = { type: "document", data: "text", format: "txt", pageCount: 5 };
    const result = await processor.parse(doc, { extractMetadata: true });
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.pageCount).toBe(5);
  });

  it("should summarize document via AI", async () => {
    const doc: DocumentInput = { type: "document", data: "Long document content here...", format: "txt" };
    const summary = await processor.summarize(doc, 200);
    expect(summary).toBeDefined();
    expect(typeof summary).toBe("string");
  });

  it("should extract key info from document", async () => {
    const auth = createMockAuth();
    (auth.chat as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1", object: "chat.completion", created: Date.now(), model: "mock",
      choices: [{ index: 0, message: { role: "assistant", content: "作者：张三\n日期：2026-01-01" }, finishReason: "stop" }],
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    });
    const proc = new DocumentProcessor(auth);
    const doc: DocumentInput = { type: "document", data: "作者张三，日期2026", format: "txt" };
    const info = await proc.extractKeyInfo(doc, ["作者", "日期"]);
    expect(info).toBeDefined();
  });

  it("should compare two documents", async () => {
    const doc1: DocumentInput = { type: "document", data: "Document A", format: "txt" };
    const doc2: DocumentInput = { type: "document", data: "Document B", format: "txt" };
    const comparison = await processor.compare(doc1, doc2);
    expect(comparison).toBeDefined();
    expect(typeof comparison.summary).toBe("string");
  });

  it("should parse complex document via AI", async () => {
    const doc: DocumentInput = { type: "document", data: "PDF binary content", format: "pdf" };
    const result = await processor.parse(doc);
    expect(result.text).toBeDefined();
    expect(mockAuth.chat).toHaveBeenCalled();
  });
});
