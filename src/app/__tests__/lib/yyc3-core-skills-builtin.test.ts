/**
 * @file: yyc3-core-skills-builtin.test.ts
 * @description: yyc3-core-skills-builtin.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi } from "vitest";
import { SkillManager } from "../../lib/yyc3-core/skills/manager";
import {
  ReasoningSkill,
  reasoningHandler,
  GenerationSkill,
  generationHandler,
  AnalysisSkill,
  analysisHandler,
} from "../../lib/yyc3-core/skills/builtin";
import type { ExecutionContext, SkillExecutionResult } from "../../lib/yyc3-core/skills/types";

function createMockContext(): ExecutionContext {
  return {
    sessionId: "s-1",
    userId: "u-1",
    provider: "ollama",
    model: "llama3.2",
    messages: [],
    variables: {},
    metadata: {},
  };
}

describe("Builtin Skills - Full Coverage", () => {
  describe("GenerationSkill", () => {
    it("should have valid definition", () => {
      expect(GenerationSkill.id).toBe("core.generation.content");
      expect(GenerationSkill.category).toBe("generation");
    });

    it("should generate content", async () => {
      const result = await generationHandler(
        { type: "text", prompt: "Hello World" },
        createMockContext(),
      );
      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      const output = result.output as { type: string; content: string };
      expect(output.type).toBe("text");
      expect(output.content).toContain("Hello World");
    });

    it("should pass options through", async () => {
      const result = await generationHandler(
        { type: "code", prompt: "function", options: { language: "typescript" } },
        createMockContext(),
      );
      expect(result.success).toBe(true);
      const output = result.output as { metadata: { options: Record<string, unknown> } };
      expect(output.metadata.options.language).toBe("typescript");
    });

    it("should handle error gracefully", async () => {
      const result = await generationHandler(null, createMockContext());
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("AnalysisSkill", () => {
    it("should have valid definition", () => {
      expect(AnalysisSkill.id).toBe("core.analysis.code");
      expect(AnalysisSkill.category).toBe("analysis");
    });

    it("should analyze code", async () => {
      const result = await analysisHandler(
        { code: "const x = 1;", language: "typescript" },
        createMockContext(),
      );
      expect(result.success).toBe(true);
      const output = result.output as { language: string; aspects: string[]; analysis: Record<string, { score: number }> };
      expect(output.language).toBe("typescript");
      expect(output.aspects).toContain("quality");
      expect(output.analysis.quality.score).toBe(85);
    });

    it("should handle error gracefully", async () => {
      const result = await analysisHandler(null, createMockContext());
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("ReasoningSkill", () => {
    it("should execute with custom steps", async () => {
      const result = await reasoningHandler(
        { task: "架构评估", steps: ["Context", "Evaluate"] },
        createMockContext(),
      );
      expect(result.success).toBe(true);
      const output = result.output as { task: string; reasoning: string[] };
      expect(output.task).toBe("架构评估");
      expect(output.reasoning).toHaveLength(2);
    });
  });

  describe("SkillManager integration with builtins", () => {
    it("should register and execute all builtin skills", async () => {
      const manager = new SkillManager();
      manager.register(ReasoningSkill, reasoningHandler);
      manager.register(GenerationSkill, generationHandler);
      manager.register(AnalysisSkill, analysisHandler);

      expect(manager.getAll()).toHaveLength(3);

      const reasoningResult = await manager.execute(
        "core.reasoning.cageerf",
        { task: "test" },
        createMockContext(),
      );
      expect(reasoningResult.success).toBe(true);

      const generationResult = await manager.execute(
        "core.generation.content",
        { type: "text", prompt: "test" },
        createMockContext(),
      );
      expect(generationResult.success).toBe(true);

      const analysisResult = await manager.execute(
        "core.analysis.code",
        { code: "test", language: "ts" },
        createMockContext(),
      );
      expect(analysisResult.success).toBe(true);
    });
  });
});
