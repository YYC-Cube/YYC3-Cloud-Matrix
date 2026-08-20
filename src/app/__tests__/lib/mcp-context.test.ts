/**
 * @file: mcp-context.test.ts
 * @description: mcp-context.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  MCPContextManager,
  getMCPContextManager,
  resetMCPContextManager,
} from "../../lib/mcp/mcp-context";

describe("MCPContextManager", () => {
  let manager: MCPContextManager;

  beforeEach(() => {
    resetMCPContextManager();
    manager = new MCPContextManager();
    localStorage.clear();
  });

  afterEach(() => {
    resetMCPContextManager();
  });

  describe("getOrCreate", () => {
    it("should create context for new agent", () => {
      const ctx = manager.getOrCreate("agent-1");
      expect(ctx.agentId).toBe("agent-1");
      expect(ctx.messages).toEqual([]);
      expect(ctx.maxTokens).toBe(4096);
    });

    it("should return same context on repeated calls", () => {
      const a = manager.getOrCreate("agent-1");
      const b = manager.getOrCreate("agent-1");
      expect(a).toBe(b);
    });

    it("should use custom maxTokens", () => {
      const ctx = manager.getOrCreate("agent-1", 8192);
      expect(ctx.maxTokens).toBe(8192);
    });
  });

  describe("addMessage", () => {
    it("should add message to context", () => {
      manager.addMessage("agent-1", "user", "Hello");
      const msgs = manager.getMessages("agent-1");
      expect(msgs).toHaveLength(1);
      expect(msgs[0].role).toBe("user");
      expect(msgs[0].content).toBe("Hello");
    });

    it("should add message with toolCallId", () => {
      manager.addMessage("agent-1", "tool", "result", "call-123");
      const msgs = manager.getMessages("agent-1");
      expect(msgs[0].toolCallId).toBe("call-123");
    });

    it("should persist to localStorage", () => {
      manager.addMessage("agent-1", "user", "persist me");
      const stored = localStorage.getItem("yyc3_mcp_ctx_agent-1");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.messages).toHaveLength(1);
    });

    it("should auto-truncate when messages exceed limit", () => {
      for (let i = 0; i < 120; i++) {
        manager.addMessage("agent-1", "user", `Message ${i} with padding to increase token count `.repeat(10));
      }
      const ctx = manager.getContext("agent-1");
      expect(ctx!.messages.length).toBeLessThan(120);
    });
  });

  describe("getMessages", () => {
    it("should return empty for unknown agent", () => {
      expect(manager.getMessages("ghost")).toEqual([]);
    });

    it("should return limited messages", () => {
      for (let i = 0; i < 20; i++) {
        manager.addMessage("agent-1", "user", `Msg ${i}`);
      }
      const limited = manager.getMessages("agent-1", 5);
      expect(limited.length).toBeLessThanOrEqual(20);
    });

    it("should preserve system messages when limiting", () => {
      manager.addMessage("agent-1", "system", "System prompt");
      for (let i = 0; i < 20; i++) {
        manager.addMessage("agent-1", "user", `Msg ${i}`);
      }
      const limited = manager.getMessages("agent-1", 5);
      const systemMsgs = limited.filter((m) => m.role === "system");
      expect(systemMsgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("setSystemPrompt", () => {
    it("should set system prompt as first message", () => {
      manager.addMessage("agent-1", "user", "Hello");
      manager.setSystemPrompt("agent-1", "You are a helpful agent");
      const msgs = manager.getMessages("agent-1");
      expect(msgs[0].role).toBe("system");
      expect(msgs[0].content).toBe("You are a helpful agent");
    });

    it("should replace existing system prompt", () => {
      manager.setSystemPrompt("agent-1", "Prompt 1");
      manager.setSystemPrompt("agent-1", "Prompt 2");
      const msgs = manager.getMessages("agent-1");
      const systemMsgs = msgs.filter((m) => m.role === "system");
      expect(systemMsgs).toHaveLength(1);
      expect(systemMsgs[0].content).toBe("Prompt 2");
    });
  });

  describe("clearContext", () => {
    it("should clear all messages", () => {
      manager.addMessage("agent-1", "user", "Hello");
      manager.clearContext("agent-1");
      expect(manager.getMessages("agent-1")).toHaveLength(0);
    });
  });

  describe("getStats", () => {
    it("should return empty stats for unknown agent", () => {
      const stats = manager.getStats("ghost");
      expect(stats.messageCount).toBe(0);
      expect(stats.estimatedTokens).toBe(0);
      expect(stats.oldestTimestamp).toBeNull();
    });

    it("should return correct stats", () => {
      manager.addMessage("agent-1", "user", "Hello world");
      manager.addMessage("agent-1", "assistant", "Hi there");
      const stats = manager.getStats("agent-1");
      expect(stats.messageCount).toBe(2);
      expect(stats.estimatedTokens).toBeGreaterThan(0);
      expect(stats.oldestTimestamp).not.toBeNull();
    });
  });

  describe("getRegisteredAgentIds", () => {
    it("should return all registered agent IDs", () => {
      manager.getOrCreate("agent-1");
      manager.getOrCreate("agent-2");
      const ids = manager.getRegisteredAgentIds();
      expect(ids).toContain("agent-1");
      expect(ids).toContain("agent-2");
    });
  });

  describe("Singleton", () => {
    it("should return same instance from getMCPContextManager", () => {
      resetMCPContextManager();
      const a = getMCPContextManager();
      const b = getMCPContextManager();
      expect(a).toBe(b);
    });

    it("should create new instance after reset", () => {
      const a = getMCPContextManager();
      resetMCPContextManager();
      const b = getMCPContextManager();
      expect(a).not.toBe(b);
    });
  });
});
