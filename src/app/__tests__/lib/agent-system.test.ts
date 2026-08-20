/**
 * @file: agent-system.test.ts
 * @description: agent-system.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIAgent } from "../../lib/agent/agent-base";
import {
  AgentOrchestrator,
  getAgentOrchestrator,
  resetAgentOrchestrator,
} from "../../lib/agent/agent-orchestrator";
import type { AgentStep, AgentTask } from "../../lib/agent/agent-types";
import { BoleroAgent } from "../../lib/agent/agents/bolero-agent";
import { CreativeAgent } from "../../lib/agent/agents/creative-agent";
import { MasterAgent } from "../../lib/agent/agents/master-agent";
import { MetaOracleAgent } from "../../lib/agent/agents/meta-oracle-agent";
import { NavigatorAgent } from "../../lib/agent/agents/navigator-agent";
import { ProphetAgent } from "../../lib/agent/agents/prophet-agent";
import { SentinelAgent } from "../../lib/agent/agents/sentinel-agent";
import { ThinkerAgent } from "../../lib/agent/agents/thinker-agent";
import { registerBuiltinAgents } from "../../lib/agent/index";
import { resetMCPContextManager } from "../../lib/mcp/mcp-context";
import { resetMCPServer } from "../../lib/mcp/mcp-server";

describe("AIAgent Base Class", () => {
  afterEach(() => {
    resetMCPServer();
    resetMCPContextManager();
  });

  function createTestAgent(id: string) {
    class TestAgent extends AIAgent {
      thinkFn = vi.fn();
      reportFn = vi.fn();

      constructor() {
        super({
          agentId: id,
          displayName: `Test ${id}`,
          capabilities: ["nlu"],
          systemPrompt: "test",
          maxConcurrentTasks: 1,
        });
      }
      protected async think(task: AgentTask): Promise<void> {
        this.thinkFn(task);
      }
      protected async report(task: AgentTask, steps: AgentStep[]): Promise<unknown> {
        return this.reportFn(task, steps);
      }
    }
    return new TestAgent();
  }

  it("should expose correct config properties", () => {
    const agent = createTestAgent("test-1");
    expect(agent.agentId).toBe("test-1");
    expect(agent.displayName).toBe("Test test-1");
    expect(agent.state).toBe("idle");
  });

  it("should return correct status snapshot", () => {
    const agent = createTestAgent("test-2");
    const status = agent.getStatus();
    expect(status.agentId).toBe("test-2");
    expect(status.state).toBe("idle");
    expect(status.completedTasks).toBe(0);
    expect(status.errorCount).toBe(0);
  });

  it("should execute a task successfully", async () => {
    const agent = createTestAgent("test-3");
    const task: AgentTask = {
      id: "t-1",
      description: "test task",
      priority: "normal",
      status: "pending",
      assigneeId: null,
      steps: [],
      dependencies: [],
      createdAt: Date.now(),
    };
    const result = await agent.execute(task);
    expect(result.status).toBe("completed");
    expect(result.completedAt).toBeDefined();
    expect(agent.getStatus().completedTasks).toBe(1);
  });

  it("should reject task when agent is busy", async () => {
    const agent = createTestAgent("test-4");
    const task1: AgentTask = {
      id: "t-1", description: "first", priority: "normal", status: "pending",
      assigneeId: null, steps: [], dependencies: [], createdAt: Date.now(),
    };
    const task2: AgentTask = {
      id: "t-2", description: "second", priority: "normal", status: "pending",
      assigneeId: null, steps: [], dependencies: [], createdAt: Date.now(),
    };
    agent.execute(task1);
    const result2 = await agent.execute(task2);
    expect(result2.status).toBe("failed");
    expect(result2.error).toContain("busy");
  });

  it("should abort a running task", async () => {
    const agent = createTestAgent("test-5");
    let resolveThink: () => void;
    class SlowAgent extends AIAgent {
      constructor() {
        super({ agentId: "slow", displayName: "Slow", capabilities: ["nlu"], systemPrompt: "", maxConcurrentTasks: 1 });
      }
      protected async think(): Promise<void> {
        await new Promise<void>((r) => { resolveThink = r; });
      }
      protected async report(): Promise<unknown> { return null; }
    }
    const slow = new SlowAgent();
    const task: AgentTask = {
      id: "t-abort", description: "abort test", priority: "normal", status: "pending",
      assigneeId: null, steps: [], dependencies: [], createdAt: Date.now(),
    };
    const execPromise = slow.execute(task);
    slow.abort();
    resolveThink!();
    const result = await execPromise;
    expect(result.status).toBe("cancelled");
  });

  it("should handle step execution via default executor gracefully", async () => {
    class DefaultAgent extends AIAgent {
      constructor() {
        super({ agentId: "default-agent", displayName: "Default", capabilities: ["nlu"], systemPrompt: "", maxConcurrentTasks: 1 });
      }
      protected async think(): Promise<void> { }
      protected planSteps(): AgentStep[] {
        return [{ id: "s-1", toolName: "test_tool", args: { input: "test" }, status: "pending" }];
      }
      protected async report(): Promise<unknown> { return null; }
    }
    const agent = new DefaultAgent();
    const task: AgentTask = {
      id: "t-default", description: "default test", priority: "normal", status: "pending",
      assigneeId: null, steps: [], dependencies: [], createdAt: Date.now(),
    };
    const result = await agent.execute(task);
    expect(result.status).toBe("completed");
    expect(result.steps[0].status).toBe("done");
    expect(result.steps[0].result).toBeDefined();
  });
});

describe("AgentOrchestrator", () => {
  let orchestrator: AgentOrchestrator;

  beforeEach(() => {
    resetAgentOrchestrator();
    resetMCPServer();
    resetMCPContextManager();
    orchestrator = new AgentOrchestrator();
  });

  afterEach(() => {
    resetAgentOrchestrator();
    resetMCPServer();
    resetMCPContextManager();
  });

  describe("Agent Registration", () => {
    it("should register agents", () => {
      const agent = new NavigatorAgent();
      orchestrator.registerAgent(agent);
      expect(orchestrator.getAllAgents()).toHaveLength(1);
    });

    it("should unregister agents", () => {
      const agent = new NavigatorAgent();
      orchestrator.registerAgent(agent);
      const removed = orchestrator.unregisterAgent("navigator");
      expect(removed).toBe(true);
      expect(orchestrator.getAllAgents()).toHaveLength(0);
    });

    it("should return false for unregistering non-existent agent", () => {
      expect(orchestrator.unregisterAgent("ghost")).toBe(false);
    });

    it("should get all statuses", () => {
      orchestrator.registerAgent(new NavigatorAgent());
      orchestrator.registerAgent(new ThinkerAgent());
      const statuses = orchestrator.getAllStatuses();
      expect(statuses).toHaveLength(2);
      expect(statuses[0].state).toBe("idle");
    });

    it("should get idle agents", () => {
      orchestrator.registerAgent(new NavigatorAgent());
      orchestrator.registerAgent(new ThinkerAgent());
      const idle = orchestrator.getIdleAgents();
      expect(idle).toHaveLength(2);
    });
  });

  describe("Task Submission", () => {
    it("should submit task to an available agent", async () => {
      orchestrator.registerAgent(new NavigatorAgent());
      const result = await orchestrator.submitTask("理解用户意图", "normal");
      expect(result.status).toBe("completed");
      expect(result.assigneeId).toBe("navigator");
    });

    it("should submit task with preferred agent", async () => {
      orchestrator.registerAgent(new NavigatorAgent());
      orchestrator.registerAgent(new ThinkerAgent());
      const result = await orchestrator.submitTask("any task", "normal", "thinker");
      expect(result.assigneeId).toBe("thinker");
    });

    it("should fail when no agents available", async () => {
      const result = await orchestrator.submitTask("no agents", "normal");
      expect(result.status).toBe("failed");
      expect(result.error).toContain("无可用 Agent");
    });

    it("should fail when preferred agent does not exist", async () => {
      orchestrator.registerAgent(new NavigatorAgent());
      const result = await orchestrator.submitTask("task", "normal", "ghost");
      expect(result.status).toBe("failed");
    });
  });

  describe("Task Decomposition", () => {
    it("should decompose analysis task", () => {
      const decomp = orchestrator.decomposeTask("分析节点数据洞察");
      expect(decomp.subtasks.length).toBeGreaterThan(0);
      expect(decomp.subtasks[0].suggestedAssignee).toBe("thinker");
    });

    it("should decompose prediction task", () => {
      const decomp = orchestrator.decomposeTask("预测未来趋势");
      expect(decomp.subtasks.length).toBeGreaterThan(0);
    });

    it("should decompose security task", () => {
      const decomp = orchestrator.decomposeTask("安全漏洞扫描");
      expect(decomp.subtasks.length).toBeGreaterThan(0);
      expect(decomp.subtasks.some((s) => s.suggestedAssignee === "sentinel")).toBe(true);
    });

    it("should decompose code review task", () => {
      const decomp = orchestrator.decomposeTask("代码架构质量审查");
      expect(decomp.subtasks.some((s) => s.suggestedAssignee === "master")).toBe(true);
    });

    it("should decompose creative task", () => {
      const decomp = orchestrator.decomposeTask("创意文案设计");
      expect(decomp.subtasks.some((s) => s.suggestedAssignee === "creative")).toBe(true);
    });

    it("should fallback to meta-oracle for unknown tasks", () => {
      const decomp = orchestrator.decomposeTask("随机任务");
      expect(decomp.subtasks[0].suggestedAssignee).toBe("meta-oracle");
    });
  });

  describe("Collaborative Tasks", () => {
    it("should submit collaborative task", async () => {
      orchestrator.registerAgent(new NavigatorAgent());
      orchestrator.registerAgent(new ThinkerAgent());
      orchestrator.registerAgent(new SentinelAgent());
      const results = await orchestrator.submitCollaborativeTask("分析节点数据洞察和安全扫描");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Task Query", () => {
    it("should retrieve task by ID", async () => {
      orchestrator.registerAgent(new NavigatorAgent());
      const result = await orchestrator.submitTask("test query");
      const found = orchestrator.getTask(result.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(result.id);
    });

    it("should get all tasks", async () => {
      orchestrator.registerAgent(new NavigatorAgent());
      await orchestrator.submitTask("task 1");
      await orchestrator.submitTask("task 2");
      expect(orchestrator.getAllTasks()).toHaveLength(2);
    });

    it("should get agent tasks", async () => {
      orchestrator.registerAgent(new NavigatorAgent());
      await orchestrator.submitTask("task 1");
      const agentTasks = orchestrator.getAgentTasks("navigator");
      expect(agentTasks).toHaveLength(1);
    });
  });

  describe("Agent Messaging", () => {
    it("should send directed message", () => {
      orchestrator.registerAgent(new NavigatorAgent());
      orchestrator.registerAgent(new ThinkerAgent());
      orchestrator.sendMessage({
        id: "msg-1",
        from: "navigator",
        to: "thinker",
        type: "context_share",
        content: "sharing context",
        timestamp: Date.now(),
      });
      const msgs = orchestrator.getMessages();
      expect(msgs).toHaveLength(1);
    });

    it("should broadcast message to all agents except sender", () => {
      orchestrator.registerAgent(new NavigatorAgent());
      orchestrator.registerAgent(new ThinkerAgent());
      orchestrator.registerAgent(new ProphetAgent());
      orchestrator.sendMessage({
        id: "msg-broadcast",
        from: "navigator",
        to: "*",
        type: "notification",
        content: "broadcast message",
        timestamp: Date.now(),
      });
      const msgs = orchestrator.getMessages();
      expect(msgs).toHaveLength(1);
    });
  });

  describe("Singleton", () => {
    it("should return same instance", () => {
      resetAgentOrchestrator();
      const a = getAgentOrchestrator();
      const b = getAgentOrchestrator();
      expect(a).toBe(b);
    });

    it("should reset instance", () => {
      const a = getAgentOrchestrator();
      resetAgentOrchestrator();
      const b = getAgentOrchestrator();
      expect(a).not.toBe(b);
    });
  });

  describe("registerBuiltinAgents", () => {
    it("should register all 8 built-in agents", () => {
      resetAgentOrchestrator();
      registerBuiltinAgents();
      const orch = getAgentOrchestrator();
      expect(orch.getAllAgents()).toHaveLength(8);
    });
  });
});

describe("Individual Agent Implementations", () => {
  afterEach(() => {
    resetMCPServer();
    resetMCPContextManager();
  });

  it("NavigatorAgent should have correct config", () => {
    const agent = new NavigatorAgent();
    expect(agent.agentId).toBe("navigator");
    expect(agent.displayName).toBe("言启·千行");
  });

  it("ThinkerAgent should have correct config", () => {
    const agent = new ThinkerAgent();
    expect(agent.agentId).toBe("thinker");
    expect(agent.displayName).toBe("语枢·万物");
  });

  it("ProphetAgent should have correct config", () => {
    const agent = new ProphetAgent();
    expect(agent.agentId).toBe("prophet");
  });

  it("SentinelAgent should have correct config", () => {
    const agent = new SentinelAgent();
    expect(agent.agentId).toBe("sentinel");
  });

  it("MasterAgent should have correct config", () => {
    const agent = new MasterAgent();
    expect(agent.agentId).toBe("master");
  });

  it("CreativeAgent should have correct config", () => {
    const agent = new CreativeAgent();
    expect(agent.agentId).toBe("creative");
  });

  it("BoleroAgent should have correct config", () => {
    const agent = new BoleroAgent();
    expect(agent.agentId).toBe("bolero");
  });

  it("MetaOracleAgent should have correct config", () => {
    const agent = new MetaOracleAgent();
    expect(agent.agentId).toBe("meta-oracle");
  });

  it("NavigatorAgent should execute task with planSteps", async () => {
    const agent = new NavigatorAgent();
    const task: AgentTask = {
      id: "nav-1", description: "路由请求", priority: "normal", status: "pending",
      assigneeId: null, steps: [], dependencies: [], createdAt: Date.now(),
    };
    const result = await agent.execute(task);
    expect(result.status).toBe("completed");
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it("ThinkerAgent should execute task with planSteps", async () => {
    const agent = new ThinkerAgent();
    const task: AgentTask = {
      id: "think-1", description: "数据分析", priority: "high", status: "pending",
      assigneeId: null, steps: [], dependencies: [], createdAt: Date.now(),
    };
    const result = await agent.execute(task);
    expect(result.status).toBe("completed");
    expect(result.steps.length).toBeGreaterThan(0);
  });
});
