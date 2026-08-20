/**
 * @file: yyc3-core-agents-impl.test.ts
 * @description: yyc3-core-agents-impl.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, expect, it, vi } from "vitest";
import {
  AgentClasses,
  BoleroAgent,
  CreativeAgent,
  MasterAgent,
  MetaOracleAgent,
  NavigatorAgent,
  ProphetAgent,
  SentinelAgent,
  ThinkerAgent,
} from "../../lib/yyc3-core/ai-family/agents";
import type { AgentTask } from "../../lib/yyc3-core/ai-family/types";
import type { UnifiedAuthManager } from "../../lib/yyc3-core/auth/unified-auth";

function createMockAuth(overrides?: Record<string, unknown>): UnifiedAuthManager {
  return {
    chat: vi.fn().mockResolvedValue({
      id: "mock-1",
      object: "chat.completion",
      created: Date.now(),
      model: "mock",
      choices: [{ index: 0, message: { role: "assistant", content: "分析结果包含洞察和结论以及建议" }, finishReason: "stop" }],
      usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
    }),
    ...overrides,
  } as unknown as UnifiedAuthManager;
}

function createTask(overrides?: Partial<AgentTask>): AgentTask {
  return {
    id: "t-1",
    type: "intent_analysis",
    priority: "medium",
    input: { text: "测试任务" },
    context: { sessionId: "s-1", conversationHistory: [], metadata: {} },
    status: "pending",
    createdAt: new Date(),
    ...overrides,
  };
}

describe("MetaOracleAgent", () => {
  it("should execute and return decision with orchestration", async () => {
    const auth = createMockAuth();
    const agent = new MetaOracleAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    expect((result.output as { decision: string }).decision).toBeTruthy();
    expect((result.output as { orchestration: unknown }).orchestration).toBeDefined();
  });
});

describe("SentinelAgent", () => {
  it("should execute and extract threats", async () => {
    const auth = createMockAuth({
      chat: vi.fn().mockResolvedValue({
        id: "1", object: "chat.completion", created: Date.now(), model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "发现安全威胁：SQL注入风险\n建议修复漏洞" }, finishReason: "stop" }],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    });
    const agent = new SentinelAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    expect(result.success).toBe(true);
    const output = result.output as { threats: string[]; recommendations: string[] };
    expect(output.threats.length).toBeGreaterThan(0);
    expect(output.recommendations.length).toBeGreaterThan(0);
  });

  it("should return empty threats when none found", async () => {
    const auth = createMockAuth({
      chat: vi.fn().mockResolvedValue({
        id: "1", object: "chat.completion", created: Date.now(), model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "系统安全，无异常" }, finishReason: "stop" }],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    });
    const agent = new SentinelAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { threats: string[] };
    expect(output.threats).toEqual([]);
  });
});

describe("MasterAgent", () => {
  it("should execute and extract quality score", async () => {
    const auth = createMockAuth({
      chat: vi.fn().mockResolvedValue({
        id: "1", object: "chat.completion", created: Date.now(), model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "代码质量评分 85/100\n发现bug在行42\n建议优化性能" }, finishReason: "stop" }],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    });
    const agent = new MasterAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { qualityScore: number; issues: string[]; suggestions: string[] };
    expect(output.qualityScore).toBe(85);
    expect(output.issues.length).toBeGreaterThan(0);
    expect(output.suggestions.length).toBeGreaterThan(0);
  });

  it("should default to 85 when no score found", async () => {
    const auth = createMockAuth();
    const agent = new MasterAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { qualityScore: number };
    expect(output.qualityScore).toBe(85);
  });
});

describe("CreativeAgent", () => {
  it("should execute and extract ideas", async () => {
    const auth = createMockAuth({
      chat: vi.fn().mockResolvedValue({
        id: "1", object: "chat.completion", created: Date.now(), model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "1. 创意想法A\n2. 或者使用备选方案\n创意：全新设计" }, finishReason: "stop" }],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    });
    const agent = new CreativeAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { ideas: string[]; alternatives: string[] };
    expect(output.ideas.length).toBeGreaterThan(0);
    expect(output.alternatives.length).toBeGreaterThan(0);
  });
});

describe("NavigatorAgent", () => {
  it("should detect coding intent", async () => {
    const auth = createMockAuth({
      chat: vi.fn().mockResolvedValue({
        id: "1", object: "chat.completion", created: Date.now(), model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "这是一个代码编程请求" }, finishReason: "stop" }],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    });
    const agent = new NavigatorAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { intent: string; routing: string[] };
    expect(output.intent).toBe("coding");
    expect(output.routing).toContain("master");
  });

  it("should detect security intent", async () => {
    const auth = createMockAuth({
      chat: vi.fn().mockResolvedValue({
        id: "1", object: "chat.completion", created: Date.now(), model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "需要安全风险评估" }, finishReason: "stop" }],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    });
    const agent = new NavigatorAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { intent: string; routing: string[] };
    expect(output.intent).toBe("security");
    expect(output.routing).toContain("sentinel");
  });

  it("should detect intent based on AI response content", async () => {
    const auth = createMockAuth();
    const agent = new NavigatorAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { intent: string; routing: string[] };
    expect(["general", "analysis", "coding", "security", "creative"]).toContain(output.intent);
    expect(output.routing.length).toBeGreaterThan(0);
  });
});

describe("ThinkerAgent", () => {
  it("should execute and extract insights and conclusions", async () => {
    const auth = createMockAuth({
      chat: vi.fn().mockResolvedValue({
        id: "1", object: "chat.completion", created: Date.now(), model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "关键发现：数据异常\n洞察：趋势向上\n结论：需要关注" }, finishReason: "stop" }],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    });
    const agent = new ThinkerAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { insights: string[]; conclusions: string[] };
    expect(output.insights.length).toBeGreaterThan(0);
    expect(output.conclusions.length).toBeGreaterThan(0);
  });
});

describe("ProphetAgent", () => {
  it("should execute and extract trends and risks", async () => {
    const auth = createMockAuth({
      chat: vi.fn().mockResolvedValue({
        id: "1", object: "chat.completion", created: Date.now(), model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "趋势：持续增长\n风险：资源瓶颈\n机会：市场扩大" }, finishReason: "stop" }],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    });
    const agent = new ProphetAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { trends: string[]; risks: string[]; opportunities: string[] };
    expect(output.trends.length).toBeGreaterThan(0);
    expect(output.risks.length).toBeGreaterThan(0);
    expect(output.opportunities.length).toBeGreaterThan(0);
  });
});

describe("BoleroAgent", () => {
  it("should execute and extract matches and reasons", async () => {
    const auth = createMockAuth({
      chat: vi.fn().mockResolvedValue({
        id: "1", object: "chat.completion", created: Date.now(), model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "推荐方案A\n因为性能更好\n匹配度90%" }, finishReason: "stop" }],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    });
    const agent = new BoleroAgent({ authManager: auth });
    const result = await agent.execute(createTask());
    const output = result.output as { matches: string[]; reasons: string[] };
    expect(output.matches.length).toBeGreaterThan(0);
    expect(output.reasons.length).toBeGreaterThan(0);
  });
});

describe("AgentClasses mapping", () => {
  it("should map all 8 core agent IDs", () => {
    expect(AgentClasses["meta-oracle"]).toBe(MetaOracleAgent);
    expect(AgentClasses["sentinel"]).toBe(SentinelAgent);
    expect(AgentClasses["master"]).toBe(MasterAgent);
    expect(AgentClasses["creative"]).toBe(CreativeAgent);
    expect(AgentClasses["navigator"]).toBe(NavigatorAgent);
    expect(AgentClasses["thinker"]).toBe(ThinkerAgent);
    expect(AgentClasses["prophet"]).toBe(ProphetAgent);
    expect(AgentClasses["bolero"]).toBe(BoleroAgent);
  });

  it("should map alias IDs", () => {
    expect(AgentClasses["commander"]).toBe(MetaOracleAgent);
    expect(AgentClasses["coder"]).toBe(CreativeAgent);
    expect(AgentClasses["security"]).toBe(SentinelAgent);
    expect(AgentClasses["quality"]).toBe(MasterAgent);
  });
});
