/**
 * @file: mcp-bridge.ts
 * @description: YYC³ MCP Bridge · DataBus ↔ MCP 双向桥接层
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[mcp],[bridge]
 *
 * @brief: 将 DataBus 事件桥接到 MCP，使 Agent 能感知数据变更
 *
 * @details:
 * - DataBus publish → MCP Server 上下文注入
 * - MCP tool:result → DataBus publish (Agent 动作影响数据)
 * - 自动路由: 节点数据 → Thinker/Prophet, 安全事件 → Sentinel
 */

import { dataBus } from "../data-bus";
import type { DataChangeEvent } from "../data-bus";
import { getMCPServer } from "./mcp-server";
import { getMCPContextManager } from "./mcp-context";
import type { MCPEventType, MCPCallEvent, MCPResultEvent } from "./mcp-types";

// ============================================================
// 路由规则: entity → agentId[]
// ============================================================

const ENTITY_AGENT_MAP: Record<string, string[]> = {
  nodes: ["thinker", "prophet"],
  metrics: ["thinker", "prophet"],
  logs: ["sentinel", "thinker"],
  alerts: ["sentinel", "meta-oracle"],
  security: ["sentinel"],
  models: ["bolero", "master"],
  tasks: ["meta-oracle"],
  config: ["master"],
};

// ============================================================
// Bridge 类
// ============================================================

class MCPBridge {
  private unsubDataBus: (() => void) | null = null;
  private unsubMCPCall: (() => void) | null = null;
  private unsubMCPResult: (() => void) | null = null;
  private active = false;

  /** 启动桥接 */
  start(): void {
    if (this.active) {return;}
    this.active = true;

    // 1. DataBus → MCP: 订阅关键实体的数据变更
    const entities = Object.keys(ENTITY_AGENT_MAP);
    const unsubs = entities.map((entity) =>
      dataBus.subscribe(entity, (event: DataChangeEvent) => {
        this.handleDataBusEvent(event);
      })
    );
    this.unsubDataBus = () => { unsubs.forEach((fn) => fn()); };

    const server = getMCPServer();

    // 2. MCP tool:called → 日志
    this.unsubMCPCall = server.on("tool:called" as MCPEventType, (evt: unknown) => {
      const call = evt as MCPCallEvent;
      // 将工具调用记录到 Agent 上下文
      const ctxMgr = getMCPContextManager();
      ctxMgr.addMessage(
        call.agentId,
        "tool",
        `[${call.toolName}] ${JSON.stringify(call.arguments)}`,
      );
    });

    // 3. MCP tool:result → 可能触发 DataBus publish
    this.unsubMCPResult = server.on("tool:result" as MCPEventType, (evt: unknown) => {
      const result = evt as MCPResultEvent;
      // Agent 执行结果通知
      this.handleMCPResult(result);
    });
  }

  /** 停止桥接 */
  stop(): void {
    this.unsubDataBus?.();
    this.unsubMCPCall?.();
    this.unsubMCPResult?.();
    this.unsubDataBus = null;
    this.unsubMCPCall = null;
    this.unsubMCPResult = null;
    this.active = false;
  }

  /** 检查状态 */
  isActive(): boolean {
    return this.active;
  }

  // ========== 内部方法 ==========

  /** DataBus 事件 → Agent 上下文 */
  private handleDataBusEvent(event: DataChangeEvent): void {
    const targetAgents = ENTITY_AGENT_MAP[event.entity];
    if (!targetAgents) {return;}

    const ctxMgr = getMCPContextManager();
    const summary = this.summarizeDataEvent(event);

    for (const agentId of targetAgents) {
      ctxMgr.addMessage(agentId, "system", summary);
    }
  }

  /** MCP 结果 → DataBus */
  private handleMCPResult(result: MCPResultEvent): void {
    // 如果 Agent 的工具执行结果涉及数据变更，桥接回 DataBus
    const dataMutationTools = ["resource_schedule", "recommend"];
    if (dataMutationTools.includes(result.toolName)) {
      // 通过 dataBus 广播 Agent 决策
      dataBus.publish({
        entity: `agent:${result.agentId}`,
        action: "update",
        source: "simulation",
        timestamp: Date.now(),
        payload: {
          toolName: result.toolName,
          result: result.result.content.map((c) => c.text).join(" "),
        },
      });
    }
  }

  /** 将 DataBus 事件转为简洁的上下文摘要 */
  private summarizeDataEvent(event: DataChangeEvent): string {
    const time = new Date(event.timestamp).toISOString();
    return `[数据更新] ${event.entity} ${event.action} (${event.source}) @ ${time}`;
  }
}

// ============================================================
// 单例
// ============================================================

let _bridge: MCPBridge | null = null;

export function getMCPBridge(): MCPBridge {
  if (!_bridge) {
    _bridge = new MCPBridge();
  }
  return _bridge;
}

export function destroyMCPBridge(): void {
  _bridge?.stop();
  _bridge = null;
}
