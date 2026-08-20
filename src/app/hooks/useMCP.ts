/**
 * @file: useMCP.ts
 * @description: YYC³ MCP React Hook · Agent 工具调用与状态管理
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [hooks],[mcp]
 *
 * @brief: React Hook 封装 MCP Server，供组件消费 Agent 能力
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { getMCPServer } from "../lib/mcp/mcp-server";
import { getMCPContextManager } from "../lib/mcp/mcp-context";
import { getMCPBridge } from "../lib/mcp/mcp-bridge";
import { registerBuiltinAgents } from "../lib/mcp/mcp-tools-builtin";
import type { MCPAgentConfig, MCPToolResult, MCPEventType } from "../lib/mcp/mcp-types";

// ============================================================
// Hook: useMCP
// ============================================================

export interface UseMCPReturn {
  /** 所有已注册 Agent */
  agents: MCPAgentConfig[];
  /** 刷新 Agent 列表 */
  refresh: () => void;
  /** 调用 Agent 工具 */
  callTool: (agentId: string, toolName: string, args: Record<string, unknown>) => Promise<MCPToolResult>;
  /** 获取 Agent 工具列表 */
  getAgentTools: (agentId: string) => { name: string; description: string }[];
  /** 向 Agent 上下文注入消息 */
  injectContext: (agentId: string, role: "user" | "system" | "assistant", content: string) => void;
  /** MCP Bridge 是否已启动 */
  bridgeActive: boolean;
  /** 最近一次工具调用结果 */
  lastResult: MCPToolResult | null;
  /** 是否正在执行工具 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

export function useMCP(autoInit = true): UseMCPReturn {
  const [agents, setAgents] = useState<MCPAgentConfig[]>([]);
  const [bridgeActive, setBridgeActive] = useState(false);
  const [lastResult, setLastResult] = useState<MCPToolResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  // 初始化: 注册内置 Agent + 启动 Bridge
  useEffect(() => {
    if (!autoInit || initialized.current) {return;}
    initialized.current = true;

    const server = getMCPServer();
    registerBuiltinAgents();

    const bridge = getMCPBridge();
    bridge.start();
    setBridgeActive(true);

    // 注入 system prompt 到上下文
    const ctxMgr = getMCPContextManager();
    for (const agent of server.getAllAgents()) {
      if (agent.systemPrompt) {
        ctxMgr.setSystemPrompt(agent.agentId, agent.systemPrompt);
      }
    }

    setAgents(server.getAllAgents());

    // 监听 agent 注册/注销
    const unsubRegister = server.on("agent:registered" as MCPEventType, () => {
      setAgents(server.getAllAgents());
    });
    const unsubUnregister = server.on("agent:unregistered" as MCPEventType, () => {
      setAgents(server.getAllAgents());
    });

    return () => {
      unsubRegister();
      unsubUnregister();
      bridge.stop();
    };
  }, [autoInit]);

  const refresh = useCallback(() => {
    const server = getMCPServer();
    setAgents(server.getAllAgents());
  }, []);

  const callTool = useCallback(async (
    agentId: string,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<MCPToolResult> => {
    setLoading(true);
    setError(null);
    try {
      const server = getMCPServer();
      const result = await server.callTool(agentId, toolName, args);
      setLastResult(result);
      if (result.isError) {
        setError(result.content.map((c) => c.text).join(" "));
      }
      return result;
    } catch (err: unknown) {
      const msg = (err as Error).message;
      setError(msg);
      return {
        id: "error",
        content: [{ type: "text", text: msg }],
        isError: true,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAgentTools = useCallback((agentId: string) => {
    const server = getMCPServer();
    return server.getAgentTools(agentId).map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }, []);

  const injectContext = useCallback((
    agentId: string,
    role: "user" | "system" | "assistant",
    content: string,
  ) => {
    const ctxMgr = getMCPContextManager();
    ctxMgr.addMessage(agentId, role, content);
  }, []);

  return {
    agents,
    refresh,
    callTool,
    getAgentTools,
    injectContext,
    bridgeActive,
    lastResult,
    loading,
    error,
  };
}
