/**
 * @file: yyc3-core-aifamily.test.ts
 * @description: yyc3-core-aifamily.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { BaseAgent } from "../../lib/yyc3-core/ai-family/base-agent";
import { getAllAgentDefinitions } from "../../lib/yyc3-core/ai-family/definitions";
import { AIFamilyManager } from "../../lib/yyc3-core/ai-family/manager";
import type { AgentTask, TaskContext, TaskResult } from "../../lib/yyc3-core/ai-family/types";
import type { UnifiedAuthManager } from "../../lib/yyc3-core/auth/unified-auth";

function createMockAuthManager(): UnifiedAuthManager {
  return {
    chat: vi.fn().mockResolvedValue({
      choices: [{ message: { content: "Mock AI response with 洞察 and 结论 about 分析" } }],
      usage: { promptTokens: 100, completionTokens: 50 },
    }),
    getActiveProvider: vi.fn().mockReturnValue("ollama"),
    autoDetect: vi.fn().mockResolvedValue([]),
  } as unknown as UnifiedAuthManager;
}

function createMockTask(overrides?: Partial<AgentTask>): AgentTask {
  return {
    id: `task-${Date.now()}`,
    type: "intent_analysis",
    priority: "medium",
    input: { text: "分析系统数据" },
    context: {
      sessionId: "session-1",
      conversationHistory: [],
      metadata: {},
    },
    status: "pending",
    createdAt: new Date(),
    ...overrides,
  };
}

describe("yyc3-core/ai-family BaseAgent", () => {
  let mockAuth: UnifiedAuthManager;

  beforeEach(() => {
    mockAuth = createMockAuthManager();
  });

  it("should expose definition and state", () => {
    const definitions = getAllAgentDefinitions();
    const def = definitions[0];

    class TestAgent extends BaseAgent {
      protected async executeTask(): Promise<TaskResult> {
        return { success: true, duration: 0 };
      }
    }

    const agent = new TestAgent({ definition: def, authManager: mockAuth });
    expect(agent.getId()).toBe(def.id);
    expect(agent.getName()).toBe(def.displayName);
    expect(agent.getState().status).toBe("idle");
    expect(agent.canAcceptTask()).toBe(true);
  });

  it("should execute task and update state", async () => {
    const definitions = getAllAgentDefinitions();
    const def = definitions.find((d) => d.id === "navigator")!;

    class TestAgent extends BaseAgent {
      protected async executeTask(): Promise<TaskResult> {
        return { success: true, output: "done", duration: 0 };
      }
    }

    const agent = new TestAgent({ definition: def, authManager: mockAuth });
    const task = createMockTask();
    const result = await agent.execute(task);

    expect(result.success).toBe(true);
    expect(result.output).toBe("done");
    expect(agent.getState().totalTasksCompleted).toBe(1);
    expect(agent.getState().status).toBe("idle");
  });

  it("should reject task when at capacity", async () => {
    const definitions = getAllAgentDefinitions();
    const def = { ...definitions[0], maxConcurrentTasks: 1 };

    class SlowAgent extends BaseAgent {
      private resolveTask: (() => void) | null = null;
      protected async executeTask(): Promise<TaskResult> {
        await new Promise<void>((r) => { this.resolveTask = r; });
        return { success: true, duration: 0 };
      }
      finish() { this.resolveTask?.(); }
    }

    const agent = new SlowAgent({ definition: def, authManager: mockAuth });
    const task1 = createMockTask({ id: "t-1" });
    const task2 = createMockTask({ id: "t-2" });

    agent.execute(task1);
    const result2 = await agent.execute(task2);

    expect(result2.success).toBe(false);
    expect(result2.error).toContain("无法接受新任务");

    agent.finish();
  });

  it("should track errors on task failure", async () => {
    const definitions = getAllAgentDefinitions();
    const def = definitions[0];

    class FailAgent extends BaseAgent {
      protected async executeTask(): Promise<TaskResult> {
        throw new Error("Task execution failed");
      }
    }

    const agent = new FailAgent({ definition: def, authManager: mockAuth });
    const task = createMockTask();
    const result = await agent.execute(task);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Task execution failed");
    expect(agent.getState().errorCount).toBe(1);
  });

  it("should emit events during task lifecycle", async () => {
    const definitions = getAllAgentDefinitions();
    const def = definitions[0];

    class TestAgent extends BaseAgent {
      protected async executeTask(): Promise<TaskResult> {
        return { success: true, duration: 0 };
      }
    }

    const agent = new TestAgent({ definition: def, authManager: mockAuth });
    const statusChanges: string[] = [];
    const taskStarted: string[] = [];
    const taskCompleted: string[] = [];

    agent.on("status_changed", (e) => statusChanges.push(e.status));
    agent.on("task_started", (e) => taskStarted.push(e.taskId));
    agent.on("task_completed", (e) => taskCompleted.push(e.taskId));

    const task = createMockTask();
    await agent.execute(task);

    expect(taskStarted).toHaveLength(1);
    expect(taskCompleted).toHaveLength(1);
    expect(statusChanges).toContain("busy");
    expect(statusChanges).toContain("idle");
  });

  it("should estimate capability matching", async () => {
    const definitions = getAllAgentDefinitions();
    const def = definitions.find((d) => d.id === "thinker")!;

    class TestAgent extends BaseAgent {
      protected async executeTask(): Promise<TaskResult> {
        return { success: true, duration: 0 };
      }
    }

    const agent = new TestAgent({ definition: def, authManager: mockAuth });
    const task = createMockTask({ type: "data_analysis" });
    const ctx: TaskContext = {
      sessionId: "s-1",
      conversationHistory: [],
      metadata: {},
    };

    const result = await agent.estimateCapability(task, ctx);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it("should return stats", () => {
    const definitions = getAllAgentDefinitions();
    const def = definitions[0];

    class TestAgent extends BaseAgent {
      protected async executeTask(): Promise<TaskResult> {
        return { success: true, duration: 0 };
      }
    }

    const agent = new TestAgent({ definition: def, authManager: mockAuth });
    const stats = agent.getStats();
    expect(stats.totalTasks).toBe(0);
    expect(stats.averageResponseTime).toBe(0);
    expect(stats.errorRate).toBe(0);
  });

  it("should build messages with system prompt and history", () => {
    const definitions = getAllAgentDefinitions();
    const def = definitions[0];

    class TestAgent extends BaseAgent {
      protected async executeTask(): Promise<TaskResult> {
        return { success: true, duration: 0 };
      }
      testBuildMessages(task: AgentTask) {
        return this.buildMessages(task);
      }
    }

    const agent = new TestAgent({ definition: def, authManager: mockAuth });
    const task = createMockTask({
      context: {
        sessionId: "s-1",
        conversationHistory: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi" },
        ],
        metadata: {},
      },
    });

    const messages = agent.testBuildMessages(task);
    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toBe(def.systemPrompt);
  });
});

describe("yyc3-core/ai-family Definitions", () => {
  it("should return all 8 agent definitions", () => {
    const defs = getAllAgentDefinitions();
    expect(defs.length).toBeGreaterThanOrEqual(8);
  });

  it("should have required fields for each definition", () => {
    const defs = getAllAgentDefinitions();
    for (const def of defs) {
      expect(def.id).toBeTruthy();
      expect(def.displayName).toBeTruthy();
      expect(def.systemPrompt).toBeTruthy();
      expect(def.capabilities.length).toBeGreaterThan(0);
      expect(def.maxConcurrentTasks).toBeGreaterThan(0);
    }
  });

  it("should include all 8 core agent roles", () => {
    const defs = getAllAgentDefinitions();
    const ids = defs.map((d) => d.id);
    expect(ids).toContain("navigator");
    expect(ids).toContain("thinker");
    expect(ids).toContain("prophet");
    expect(ids).toContain("bolero");
    expect(ids).toContain("meta-oracle");
    expect(ids).toContain("sentinel");
    expect(ids).toContain("master");
    expect(ids).toContain("creative");
  });
});

describe("yyc3-core/ai-family AIFamilyManager", () => {
  let mockAuth: UnifiedAuthManager;

  beforeEach(() => {
    mockAuth = createMockAuthManager();
  });

  it("should initialize with agents", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const agents = manager.getAllAgents();
    expect(agents.size).toBeGreaterThan(0);
    manager.dispose();
  });

  it("should create tasks with correct structure", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const task = manager.createTask("intent_analysis", { text: "test" }, {});
    expect(task.id).toBeTruthy();
    expect(task.type).toBe("intent_analysis");
    expect(task.status).toBe("pending");
    expect(task.context.sessionId).toBeTruthy();
    manager.dispose();
  });

  it("should recommend agents for tasks", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const task = manager.createTask("security_scan", { target: "system" }, {});
    const recommendations = manager.recommendAgents(task);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].confidence).toBeGreaterThan(0);
    manager.dispose();
  });

  it("should recommend sentinel for security tasks", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const task = manager.createTask("security_threat_detection", { indicators: {} }, {});
    const recommendations = manager.recommendAgents(task);
    expect(recommendations.some((r) => r.agentId === "sentinel")).toBe(true);
    manager.dispose();
  });

  it("should recommend master for code quality tasks", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const task = manager.createTask("code_quality_review", { code: "const x = 1" }, {});
    const recommendations = manager.recommendAgents(task);
    expect(recommendations.some((r) => r.agentId === "master")).toBe(true);
    manager.dispose();
  });

  it("should recommend creative for design tasks", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const task = manager.createTask("creative_design", { prompt: "logo" }, {});
    const recommendations = manager.recommendAgents(task);
    expect(recommendations.some((r) => r.agentId === "creative")).toBe(true);
    manager.dispose();
  });

  it("should fallback to navigator for unknown tasks", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const task = manager.createTask("random_unknown_task", { data: "test" }, {});
    const recommendations = manager.recommendAgents(task);
    if (recommendations.length > 0) {
      expect(recommendations[0].agentId).toBe("navigator");
    }
    manager.dispose();
  });

  it("should submit task and return result", async () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const task = manager.createTask("intent_analysis", { text: "Hello" }, {});
    const result = await manager.submitTask(task);
    expect(result).toBeDefined();
    manager.dispose();
  });

  it("should get queue status", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const status = manager.getQueueStatus();
    expect(status.queueLength).toBe(0);
    expect(status.runningTasks).toBe(0);
    expect(status.maxQueueSize).toBeGreaterThan(0);
    manager.dispose();
  });

  it("should get agent stats", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const stats = manager.getAgentsStats();
    expect(stats.size).toBeGreaterThan(0);
    manager.dispose();
  });

  it("should get agent status", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const status = manager.getAgentStatus("navigator");
    expect(["idle", "busy", "offline"]).toContain(status);
    manager.dispose();
  });

  it("should dispose resources cleanly", () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    manager.dispose();
    const agents = manager.getAllAgents();
    expect(agents.size).toBe(0);
  });

  it("should reject task when queue is full", async () => {
    const manager = new AIFamilyManager({ authManager: mockAuth, maxQueueSize: 0 });
    const task = manager.createTask("intent_analysis", { text: "test" }, {});
    const result = await manager.submitTask(task);
    expect(result.success).toBe(false);
    expect(result.error).toContain("队列已满");
    manager.dispose();
  });

  it("should emit events during task lifecycle", async () => {
    const manager = new AIFamilyManager({ authManager: mockAuth });
    const events: string[] = [];
    manager.on("task_queued", () => events.push("queued"));
    manager.on("task_started", () => events.push("started"));
    manager.on("task_completed", () => events.push("completed"));

    const task = manager.createTask("intent_analysis", { text: "test" }, {});
    await manager.submitTask(task);

    expect(events).toContain("queued");
    manager.dispose();
  });
});
