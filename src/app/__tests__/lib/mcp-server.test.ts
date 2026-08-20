/**
 * @file: mcp-server.test.ts
 * @description: mcp-server.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  YYC3MCPServer,
  getMCPServer,
  resetMCPServer,
} from "../../lib/mcp/mcp-server";
import type {
  MCPAgentConfig,
  MCPTool,
  MCPToolResult,
  MCPToolExecutor,
} from "../../lib/mcp/mcp-types";
import { MCP_ERROR_CODES } from "../../lib/mcp/mcp-types";

const MOCK_AGENT_CONFIG: MCPAgentConfig = {
  agentId: "test-agent",
  displayName: "Test Agent",
  capabilities: { tools: true },
  tools: [
    {
      name: "test_tool",
      description: "A test tool",
      inputSchema: {
        type: "object",
        properties: {
          input: { type: "string", description: "test input" },
        },
        required: ["input"],
      },
    },
    {
      name: "another_tool",
      description: "Another test tool",
      inputSchema: {
        type: "object",
        properties: {
          count: { type: "number", description: "count" },
        },
      },
    },
  ],
};

describe("YYC3MCPServer", () => {
  let server: YYC3MCPServer;

  beforeEach(() => {
    resetMCPServer();
    server = new YYC3MCPServer();
  });

  afterEach(() => {
    resetMCPServer();
  });

  describe("Agent Management", () => {
    it("should register an agent", () => {
      server.registerAgent(MOCK_AGENT_CONFIG);
      expect(server.getAgent("test-agent")).toEqual(MOCK_AGENT_CONFIG);
    });

    it("should return all registered agents", () => {
      server.registerAgent(MOCK_AGENT_CONFIG);
      const all = server.getAllAgents();
      expect(all).toHaveLength(1);
      expect(all[0].agentId).toBe("test-agent");
    });

    it("should unregister an agent", () => {
      server.registerAgent(MOCK_AGENT_CONFIG);
      const deleted = server.unregisterAgent("test-agent");
      expect(deleted).toBe(true);
      expect(server.getAgent("test-agent")).toBeUndefined();
    });

    it("should return false when unregistering non-existent agent", () => {
      const deleted = server.unregisterAgent("ghost");
      expect(deleted).toBe(false);
    });

    it("should emit agent:registered event", () => {
      const handler = vi.fn();
      server.on("agent:registered", handler);
      server.registerAgent(MOCK_AGENT_CONFIG);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(MOCK_AGENT_CONFIG);
    });

    it("should emit agent:unregistered event", () => {
      const handler = vi.fn();
      server.registerAgent(MOCK_AGENT_CONFIG);
      server.on("agent:unregistered", handler);
      server.unregisterAgent("test-agent");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should return undefined for non-existent agent", () => {
      expect(server.getAgent("no-such-agent")).toBeUndefined();
    });
  });

  describe("Tool Management", () => {
    beforeEach(() => {
      server.registerAgent(MOCK_AGENT_CONFIG);
    });

    it("should get agent tools", () => {
      const tools = server.getAgentTools("test-agent");
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe("test_tool");
    });

    it("should return empty array for non-existent agent tools", () => {
      const tools = server.getAgentTools("ghost");
      expect(tools).toHaveLength(0);
    });

    it("should get all tools across agents", () => {
      const secondConfig: MCPAgentConfig = {
        agentId: "agent-2",
        displayName: "Agent 2",
        capabilities: { tools: true },
        tools: [{ name: "extra_tool", description: "Extra", inputSchema: { type: "object", properties: {} } }],
      };
      server.registerAgent(secondConfig);
      const allTools = server.getAllTools();
      expect(allTools).toHaveLength(3);
    });

    it("should register custom tool executor", async () => {
      const executor: MCPToolExecutor = vi.fn().mockResolvedValue({
        id: "custom-1",
        content: [{ type: "text", text: "custom result" }],
      });
      server.registerToolExecutor("test-agent", "test_tool", executor);
      const result = await server.callTool("test-agent", "test_tool", { input: "hello" });
      expect(result.content[0].text).toBe("custom result");
    });
  });

  describe("Tool Execution", () => {
    beforeEach(() => {
      server.registerAgent(MOCK_AGENT_CONFIG);
    });

    it("should return error for unregistered tool", async () => {
      const result = await server.callTool("test-agent", "unknown_tool", {});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("未注册");
    });

    it("should return error for missing required args", async () => {
      const result = await server.callTool("test-agent", "test_tool", {});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("缺少必填参数");
    });

    it("should use default executor when no custom executor", async () => {
      const result = await server.callTool("test-agent", "test_tool", { input: "hello" });
      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain("尚未实现");
    });

    it("should emit tool:called and tool:result events", async () => {
      const callHandler = vi.fn();
      const resultHandler = vi.fn();
      server.on("tool:called", callHandler);
      server.on("tool:result", resultHandler);

      await server.callTool("test-agent", "test_tool", { input: "x" });
      expect(callHandler).toHaveBeenCalledTimes(1);
      expect(resultHandler).toHaveBeenCalledTimes(1);
    });

    it("should emit tool:error when executor throws", async () => {
      const errorHandler = vi.fn();
      server.on("tool:error", errorHandler);

      const executor: MCPToolExecutor = vi.fn().mockRejectedValue(new Error("boom"));
      server.registerToolExecutor("test-agent", "test_tool", executor);

      const result = await server.callTool("test-agent", "test_tool", { input: "x" });
      expect(result.isError).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe("Context Management", () => {
    beforeEach(() => {
      server.registerAgent(MOCK_AGENT_CONFIG);
    });

    it("should add context message", () => {
      server.addContextMessage("test-agent", "user", "Hello");
      const msgs = server.getContext("test-agent");
      expect(msgs).toHaveLength(1);
      expect(msgs[0].content).toBe("Hello");
      expect(msgs[0].role).toBe("user");
    });

    it("should return empty for non-existent agent context", () => {
      const msgs = server.getContext("ghost");
      expect(msgs).toEqual([]);
    });

    it("should clear context", () => {
      server.addContextMessage("test-agent", "user", "Hello");
      server.clearContext("test-agent");
      expect(server.getContext("test-agent")).toHaveLength(0);
    });

    it("should auto-truncate when context exceeds maxTokens", () => {
      for (let i = 0; i < 150; i++) {
        server.addContextMessage("test-agent", "user", `Message ${i} with some content padding`.repeat(5));
      }
      const msgs = server.getContext("test-agent");
      expect(msgs.length).toBeLessThan(150);
    });
  });

  describe("JSON-RPC 2.0 handleRequest", () => {
    beforeEach(() => {
      server.registerAgent(MOCK_AGENT_CONFIG);
    });

    it("should handle tools/list with agentId", async () => {
      const resp = await server.handleRequest({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: { agentId: "test-agent" },
      });
      expect(resp.result).toHaveLength(2);
    });

    it("should handle tools/list without agentId", async () => {
      const resp = await server.handleRequest({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
      });
      expect(resp.result).toHaveLength(2);
    });

    it("should handle tools/call", async () => {
      const resp = await server.handleRequest({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { agentId: "test-agent", toolName: "test_tool", arguments: { input: "rpc" } },
      });
      expect(resp.result).toBeDefined();
    });

    it("should handle agents/list", async () => {
      const resp = await server.handleRequest({
        jsonrpc: "2.0",
        id: 4,
        method: "agents/list",
      });
      expect(resp.result).toHaveLength(1);
    });

    it("should handle context/get", async () => {
      server.addContextMessage("test-agent", "user", "test");
      const resp = await server.handleRequest({
        jsonrpc: "2.0",
        id: 5,
        method: "context/get",
        params: { agentId: "test-agent" },
      });
      expect(resp.result).toHaveLength(1);
    });

    it("should handle context/add", async () => {
      const resp = await server.handleRequest({
        jsonrpc: "2.0",
        id: 6,
        method: "context/add",
        params: { agentId: "test-agent", role: "system", content: "sys prompt" },
      });
      expect(resp.result).toEqual({ ok: true });
    });

    it("should handle context/clear", async () => {
      const resp = await server.handleRequest({
        jsonrpc: "2.0",
        id: 7,
        method: "context/clear",
        params: { agentId: "test-agent" },
      });
      expect(resp.result).toEqual({ ok: true });
    });

    it("should return error for unknown method", async () => {
      const resp = await server.handleRequest({
        jsonrpc: "2.0",
        id: 8,
        method: "nonexistent",
      });
      expect(resp.error).toBeDefined();
      expect(resp.error?.code).toBe(MCP_ERROR_CODES.METHOD_NOT_FOUND);
    });

    it("should return internal error when handler throws", async () => {
      const executor: MCPToolExecutor = vi.fn().mockRejectedValue(new Error("fail"));
      server.registerToolExecutor("test-agent", "test_tool", executor);
      const resp = await server.handleRequest({
        jsonrpc: "2.0",
        id: 9,
        method: "tools/call",
        params: { agentId: "test-agent", toolName: "test_tool", arguments: { input: "x" } },
      });
      expect(resp.result).toBeDefined();
      expect((resp.result as MCPToolResult).isError).toBe(true);
    });
  });

  describe("Singleton", () => {
    it("should return same instance from getMCPServer", () => {
      resetMCPServer();
      const a = getMCPServer();
      const b = getMCPServer();
      expect(a).toBe(b);
    });

    it("should create new instance after resetMCPServer", () => {
      const a = getMCPServer();
      resetMCPServer();
      const b = getMCPServer();
      expect(a).not.toBe(b);
    });
  });
});
