/**
 * @file: yyc3-core-skills.test.ts
 * @description: yyc3-core-skills.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReasoningSkill, reasoningHandler } from "../../lib/yyc3-core/skills/builtin";
import { SkillManager } from "../../lib/yyc3-core/skills/manager";
import type { ExecutionContext, SkillDefinition } from "../../lib/yyc3-core/skills/types";

function createMockContext(): ExecutionContext {
  return {
    sessionId: "session-1",
    userId: "user-1",
    provider: "ollama",
    model: "llama3.2",
    messages: [],
    variables: {},
    metadata: {},
  };
}

const mockSkillDef: SkillDefinition = {
  id: "test.skill.echo",
  name: "Echo Skill",
  description: "Returns input as output",
  version: "1.0.0",
  category: "automation",
};

describe("SkillManager", () => {
  let manager: SkillManager;

  beforeEach(() => {
    manager = new SkillManager();
  });

  afterEach(() => {
    manager.clear();
  });

  describe("Registration", () => {
    it("should register a skill", () => {
      const handler = vi.fn().mockResolvedValue({ success: true, duration: 0 });
      manager.register(mockSkillDef, handler);
      const skill = manager.get("test.skill.echo");
      expect(skill).toBeDefined();
      expect(skill!.name).toBe("Echo Skill");
      expect(skill!.handler).toBe(handler);
    });

    it("should unregister a skill", () => {
      const handler = vi.fn().mockResolvedValue({ success: true, duration: 0 });
      manager.register(mockSkillDef, handler);
      const removed = manager.unregister("test.skill.echo");
      expect(removed).toBe(true);
      expect(manager.get("test.skill.echo")).toBeUndefined();
    });

    it("should return false for unregistering non-existent skill", () => {
      expect(manager.unregister("ghost")).toBe(false);
    });

    it("should get all skills", () => {
      manager.register(mockSkillDef, vi.fn().mockResolvedValue({ success: true, duration: 0 }));
      manager.register(
        { ...mockSkillDef, id: "test.skill.2", category: "analysis" },
        vi.fn().mockResolvedValue({ success: true, duration: 0 }),
      );
      expect(manager.getAll()).toHaveLength(2);
    });

    it("should get skills by category", () => {
      manager.register(mockSkillDef, vi.fn().mockResolvedValue({ success: true, duration: 0 }));
      manager.register(
        { ...mockSkillDef, id: "test.skill.2", category: "analysis" },
        vi.fn().mockResolvedValue({ success: true, duration: 0 }),
      );
      expect(manager.getByCategory("automation")).toHaveLength(1);
      expect(manager.getByCategory("analysis")).toHaveLength(1);
      expect(manager.getByCategory("reasoning")).toHaveLength(0);
    });

    it("should clear all skills", () => {
      manager.register(mockSkillDef, vi.fn().mockResolvedValue({ success: true, duration: 0 }));
      manager.clear();
      expect(manager.getAll()).toHaveLength(0);
    });
  });

  describe("Execution", () => {
    it("should execute a skill successfully", async () => {
      const handler = vi.fn().mockResolvedValue({
        success: true,
        output: { result: "echo" },
        duration: 10,
      });
      manager.register(mockSkillDef, handler);
      const result = await manager.execute("test.skill.echo", { text: "hello" }, createMockContext());
      expect(result.success).toBe(true);
      expect(result.output).toEqual({ result: "echo" });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should return error for non-existent skill", async () => {
      const result = await manager.execute("ghost", {}, createMockContext());
      expect(result.success).toBe(false);
      expect(result.error).toContain("未找到");
    });

    it("should handle skill execution error", async () => {
      const handler = vi.fn().mockRejectedValue(new Error("Skill crashed"));
      manager.register(mockSkillDef, handler);
      const result = await manager.execute("test.skill.echo", {}, createMockContext());
      expect(result.success).toBe(false);
      expect(result.error).toContain("crashed");
    });
  });

  describe("Skill Chain", () => {
    it("should execute a chain of skills", async () => {
      const step1Handler = vi.fn().mockResolvedValue({
        success: true,
        output: { step: 1, data: "processed" },
        duration: 5,
      });
      const step2Handler = vi.fn().mockResolvedValue({
        success: true,
        output: { step: 2, data: "final" },
        duration: 5,
        tokens: { input: 10, output: 20 },
      });

      manager.register({ ...mockSkillDef, id: "step1" }, step1Handler);
      manager.register({ ...mockSkillDef, id: "step2" }, step2Handler);

      const result = await manager.executeChain(
        [{ id: "step1" }, { id: "step2" }],
        { initial: "data" },
        createMockContext(),
      );

      expect(result.success).toBe(true);
      expect(result.output).toEqual({ step: 2, data: "final" });
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.tokens).toBeDefined();
    });

    it("should stop chain on failure", async () => {
      const step1Handler = vi.fn().mockResolvedValue({
        success: false,
        error: "Step 1 failed",
        duration: 5,
      });

      manager.register({ ...mockSkillDef, id: "fail-step" }, step1Handler);
      manager.register(
        { ...mockSkillDef, id: "never-reached" },
        vi.fn().mockResolvedValue({ success: true, duration: 0 }),
      );

      const result = await manager.executeChain(
        [{ id: "fail-step" }, { id: "never-reached" }],
        {},
        createMockContext(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("失败");
    });
  });

  describe("Recommendation", () => {
    it("should recommend skills based on task", () => {
      manager.register(
        { ...mockSkillDef, id: "img-skill", name: "Image Analyzer", description: "Analyze images and photos" },
        vi.fn().mockResolvedValue({ success: true, duration: 0 }),
      );
      manager.register(
        { ...mockSkillDef, id: "code-skill", name: "Code Generator", description: "Generate code and scripts" },
        vi.fn().mockResolvedValue({ success: true, duration: 0 }),
      );

      const recommendations = manager.recommend("analyze images");
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].id).toBe("img-skill");
    });

    it("should return empty for no matches", () => {
      manager.register(mockSkillDef, vi.fn().mockResolvedValue({ success: true, duration: 0 }));
      const recommendations = manager.recommend("quantum physics");
      expect(recommendations).toEqual([]);
    });
  });
});

describe("Builtin Skills", () => {
  it("should have valid ReasoningSkill definition", () => {
    expect(ReasoningSkill.id).toBe("core.reasoning.cageerf");
    expect(ReasoningSkill.category).toBe("reasoning");
    expect(ReasoningSkill.metadata?.framework).toBe("CAGEERF");
  });

  it("should execute reasoningHandler", async () => {
    const result = await reasoningHandler(
      { task: "分析系统架构", steps: ["Context", "Analyze"] },
      createMockContext(),
    );
    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    expect((result.output as { task: string }).task).toBe("分析系统架构");
  });

  it("should handle reasoningHandler with null input", async () => {
    const result = await reasoningHandler(null, createMockContext());
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
