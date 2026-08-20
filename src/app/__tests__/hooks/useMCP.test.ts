/**
 * @file: useMCP.test.ts
 * @description: useMCP.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetMCPServer } from "../../lib/mcp/mcp-server";

vi.mock("../../lib/mcp/mcp-server", async () => {
  const listeners = new Map<string, Set<Function>>();
  const agents: any[] = [];
  let mockCallToolFn = vi.fn().mockResolvedValue({
    id: "result-1",
    content: [{ type: "text", text: "工具执行结果" }],
    isError: false,
  });

  return {
    getMCPServer: () => ({
      getAllAgents: () => agents,
      callTool: mockCallToolFn,
      getAgentTools: (agentId: string) => {
        if (agentId === "navigator") {
          return [{ name: "intent_parse", description: "Parse intent" }];
        }
        return [];
      },
      on: (event: string, handler: Function) => {
        if (!listeners.has(event)) { listeners.set(event, new Set()); }
        listeners.get(event)!.add(handler);
        return () => listeners.get(event)?.delete(handler);
      },
      _addAgent: (agent: any) => agents.push(agent),
      _emit: (event: string, data: any) => {
        listeners.get(event)?.forEach((fn) => fn(data));
      },
    }),
    resetMCPServer: () => {
      agents.length = 0;
      listeners.clear();
      mockCallToolFn = vi.fn().mockResolvedValue({
        id: "result-1",
        content: [{ type: "text", text: "工具执行结果" }],
        isError: false,
      });
    },
  };
});

vi.mock("../../lib/mcp/mcp-context", () => ({
  getMCPContextManager: () => ({
    setSystemPrompt: vi.fn(),
    addMessage: vi.fn(),
  }),
  resetMCPContextManager: vi.fn(),
}));

vi.mock("../../lib/mcp/mcp-bridge", () => ({
  getMCPBridge: () => ({
    start: vi.fn(),
    stop: vi.fn(),
  }),
  destroyMCPBridge: vi.fn(),
}));

vi.mock("../../lib/mcp/mcp-tools-builtin", () => ({
  registerBuiltinAgents: vi.fn(),
  BUILTIN_AGENT_CONFIGS: [],
}));

describe("useMCP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMCPServer();
  });

  it("should return initial state", async () => {
    const { useMCP } = await import("../../hooks/useMCP");
    const { result } = renderHook(() => useMCP(false));
    expect(result.current.agents).toEqual([]);
    expect(result.current.bridgeActive).toBe(false);
    expect(result.current.lastResult).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should return hook interface", async () => {
    const { useMCP } = await import("../../hooks/useMCP");
    const { result } = renderHook(() => useMCP(false));
    expect(typeof result.current.refresh).toBe("function");
    expect(typeof result.current.callTool).toBe("function");
    expect(typeof result.current.getAgentTools).toBe("function");
    expect(typeof result.current.injectContext).toBe("function");
  });

  it("should call tool and return result", async () => {
    const { useMCP } = await import("../../hooks/useMCP");
    const { result } = renderHook(() => useMCP(false));

    const res = await result.current.callTool("navigator", "intent_parse", { text: "hello" });
    expect(res).toBeDefined();
    expect(res.content[0].text).toBe("工具执行结果");
  });

  it("should set loading during callTool and clear after", async () => {
    const { useMCP } = await import("../../hooks/useMCP");
    const { result } = renderHook(() => useMCP(false));

    await result.current.callTool("navigator", "intent_parse", { text: "test" });
    expect(result.current.loading).toBe(false);
    expect(result.current.lastResult).toBeDefined();
  });

  it("should get agent tools", async () => {
    const { useMCP } = await import("../../hooks/useMCP");
    const { result } = renderHook(() => useMCP(false));

    const tools = result.current.getAgentTools("navigator");
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe("intent_parse");
  });

  it("should get empty tools for unknown agent", async () => {
    const { useMCP } = await import("../../hooks/useMCP");
    const { result } = renderHook(() => useMCP(false));

    const tools = result.current.getAgentTools("unknown");
    expect(tools).toHaveLength(0);
  });
});
