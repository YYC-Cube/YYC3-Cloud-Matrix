/**
 * @file: mcp-bridge-tools.test.ts
 * @description: mcp-bridge-tools.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerBuiltinAgents, BUILTIN_AGENT_CONFIGS } from "../../lib/mcp/mcp-tools-builtin";
import { resetMCPServer, getMCPServer } from "../../lib/mcp/mcp-server";
import { resetMCPContextManager } from "../../lib/mcp/mcp-context";
import { destroyMCPBridge, getMCPBridge } from "../../lib/mcp/mcp-bridge";

describe("mcp-tools-builtin", () => {
  beforeEach(() => {
    resetMCPServer();
    resetMCPContextManager();
  });

  afterEach(() => {
    destroyMCPBridge();
    resetMCPServer();
    resetMCPContextManager();
  });

  describe("BUILTIN_AGENT_CONFIGS", () => {
    it("should define all 8 agents", () => {
      expect(BUILTIN_AGENT_CONFIGS).toHaveLength(8);
    });

    it("should have correct agent IDs", () => {
      const ids = BUILTIN_AGENT_CONFIGS.map((c) => c.agentId);
      expect(ids).toContain("navigator");
      expect(ids).toContain("thinker");
      expect(ids).toContain("prophet");
      expect(ids).toContain("bolero");
      expect(ids).toContain("meta-oracle");
      expect(ids).toContain("sentinel");
      expect(ids).toContain("master");
      expect(ids).toContain("creative");
    });

    it("should have tools for each agent", () => {
      for (const config of BUILTIN_AGENT_CONFIGS) {
        expect(config.tools.length).toBeGreaterThan(0);
        expect(config.displayName).toBeTruthy();
        expect(config.systemPrompt).toBeTruthy();
      }
    });

    it("should have valid tool schemas", () => {
      for (const config of BUILTIN_AGENT_CONFIGS) {
        for (const tool of config.tools) {
          expect(tool.name).toBeTruthy();
          expect(tool.description).toBeTruthy();
          expect(tool.inputSchema.type).toBe("object");
          expect(tool.inputSchema.properties).toBeDefined();
        }
      }
    });
  });

  describe("registerBuiltinAgents", () => {
    it("should register all agents to MCP server", () => {
      registerBuiltinAgents();
      const server = getMCPServer();
      const agents = server.getAllAgents();
      expect(agents).toHaveLength(8);
    });

    it("should make all tools available", () => {
      registerBuiltinAgents();
      const server = getMCPServer();
      const allTools = server.getAllTools();
      expect(allTools.length).toBeGreaterThanOrEqual(8);
    });

    it("should allow calling registered tools", async () => {
      registerBuiltinAgents();
      const server = getMCPServer();
      const result = await server.callTool("navigator", "intent_parse", { text: "分析数据" });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain("尚未实现");
    });

    it("should handle tool call with missing required params", async () => {
      registerBuiltinAgents();
      const server = getMCPServer();
      const result = await server.callTool("sentinel", "security_scan", {});
      expect(result.isError).toBe(true);
    });

    it("should handle tool call with valid params", async () => {
      registerBuiltinAgents();
      const server = getMCPServer();
      const result = await server.callTool("sentinel", "security_scan", { target: "node-1" });
      expect(result).toBeDefined();
    });
  });
});

describe("MCPBridge", () => {
  beforeEach(() => {
    resetMCPServer();
    resetMCPContextManager();
    destroyMCPBridge();
  });

  afterEach(() => {
    destroyMCPBridge();
    resetMCPServer();
    resetMCPContextManager();
  });

  it("should create singleton bridge", () => {
    const a = getMCPBridge();
    const b = getMCPBridge();
    expect(a).toBe(b);
  });

  it("should start and stop", () => {
    const bridge = getMCPBridge();
    bridge.start();
    expect(bridge.isActive()).toBe(true);
    bridge.stop();
    expect(bridge.isActive()).toBe(false);
  });

  it("should not start twice", () => {
    const bridge = getMCPBridge();
    bridge.start();
    bridge.start();
    expect(bridge.isActive()).toBe(true);
    bridge.stop();
  });

  it("should destroy and reset", () => {
    const bridge = getMCPBridge();
    bridge.start();
    destroyMCPBridge();
    const newBridge = getMCPBridge();
    expect(newBridge.isActive()).toBe(false);
    newBridge.stop();
  });
});
