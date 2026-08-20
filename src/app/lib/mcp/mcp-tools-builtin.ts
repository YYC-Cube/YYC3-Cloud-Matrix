/**
 * @file: mcp-tools-builtin.ts
 * @description: YYC³ MCP 内置工具集 · 8 位 AI 成员专属工具
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[mcp],[tools]
 *
 * @brief: 8 位 AI Family 成员的 MCP 工具定义与默认执行器
 *
 * @details:
 * - Navigator: 意图解析、实体抽取、路由
 * - Thinker: 数据分析、洞察生成
 * - Prophet: 趋势预测、异常检测
 * - Bolero: 推荐引擎、用户画像
 * - MetaOracle: 全局调度、资源编排
 * - Sentinel: 安全扫描、威胁检测
 * - Master: 代码审查、架构分析
 * - Creative: 创意生成、设计建议
 */

import type { MCPTool } from "./mcp-types";
import type { MCPAgentConfig } from "./mcp-types";

// ============================================================
// 工具定义 (JSON Schema input)
// ============================================================

const NAVIGATOR_TOOLS: MCPTool[] = [
  {
    name: "intent_parse",
    description: "解析用户自然语言意图，提取结构化意图和实体",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "用户输入文本" },
        context: { type: "string", description: "对话上下文" },
      },
      required: ["text"],
    },
  },
  {
    name: "entity_extract",
    description: "从文本中提取命名实体 (节点名、模型名、指标名等)",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "待提取文本" },
        entityTypes: {
          type: "array",
          description: "目标实体类型",
          enum: ["node", "model", "metric", "command", "user"],
        },
      },
      required: ["text"],
    },
  },
  {
    name: "route_query",
    description: "将用户查询路由到最合适的 AI 成员",
    inputSchema: {
      type: "object",
      properties: {
        intent: { type: "string", description: "用户意图" },
        entities: { type: "object", description: "已提取实体" },
      },
      required: ["intent"],
    },
  },
];

const THINKER_TOOLS: MCPTool[] = [
  {
    name: "data_analyze",
    description: "对节点/集群数据进行深度分析，生成洞察报告",
    inputSchema: {
      type: "object",
      properties: {
        dataType: { type: "string", enum: ["node", "cluster", "log", "metric"], description: "数据类型" },
        targetId: { type: "string", description: "目标 ID (如节点 ID)" },
        timeRange: { type: "string", description: "时间范围 (如 1h, 24h, 7d)" },
      },
      required: ["dataType"],
    },
  },
  {
    name: "insight_generate",
    description: "基于分析结果生成可操作的洞察建议",
    inputSchema: {
      type: "object",
      properties: {
        analysisData: { type: "object", description: "分析数据" },
        focusArea: { type: "string", description: "关注领域" },
      },
      required: ["analysisData"],
    },
  },
];

const PROPHET_TOOLS: MCPTool[] = [
  {
    name: "trend_predict",
    description: "预测指标趋势 (GPU 利用率、内存、延迟等)",
    inputSchema: {
      type: "object",
      properties: {
        metric: { type: "string", description: "预测指标" },
        horizon: { type: "string", enum: ["1h", "6h", "24h", "7d"], description: "预测时间范围" },
        nodeId: { type: "string", description: "节点 ID" },
      },
      required: ["metric", "horizon"],
    },
  },
  {
    name: "anomaly_detect",
    description: "检测异常模式和离群值",
    inputSchema: {
      type: "object",
      properties: {
        metric: { type: "string", description: "检测指标" },
        threshold: { type: "number", description: "异常阈值" },
        nodeId: { type: "string", description: "节点 ID" },
      },
      required: ["metric"],
    },
  },
];

const BOELRO_TOOLS: MCPTool[] = [
  {
    name: "recommend",
    description: "基于用户偏好推荐最佳配置或操作",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["model", "node", "config", "action"], description: "推荐类别" },
        context: { type: "string", description: "推荐上下文" },
        topK: { type: "number", description: "返回前 K 个结果" },
      },
      required: ["category"],
    },
  },
];

const META_ORACLE_TOOLS: MCPTool[] = [
  {
    name: "orchestrate",
    description: "全局任务编排，分解并分配给多个 Agent 协作",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "任务描述" },
        priority: { type: "string", enum: ["critical", "high", "normal", "low"] },
        deadline: { type: "string", description: "截止时间" },
      },
      required: ["task"],
    },
  },
  {
    name: "resource_schedule",
    description: "智能资源调度 (GPU 分配、负载均衡)",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["rebalance", "migrate", "scale_up", "scale_down"] },
        targetNode: { type: "string", description: "目标节点" },
      },
      required: ["action"],
    },
  },
];

const SENTINEL_TOOLS: MCPTool[] = [
  {
    name: "security_scan",
    description: "安全扫描：检测潜在威胁和漏洞",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "扫描目标" },
        scanType: { type: "string", enum: ["quick", "full", "vulnerability", "compliance"] },
      },
      required: ["target"],
    },
  },
  {
    name: "threat_detect",
    description: "实时威胁检测与响应建议",
    inputSchema: {
      type: "object",
      properties: {
        indicators: { type: "object", description: "威胁指标" },
        severity: { type: "string", enum: ["info", "low", "medium", "high", "critical"] },
      },
      required: ["indicators"],
    },
  },
];

const MASTER_TOOLS: MCPTool[] = [
  {
    name: "code_review",
    description: "代码质量审查与改进建议",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "待审查代码" },
        language: { type: "string", description: "编程语言" },
        focus: { type: "string", enum: ["quality", "security", "performance", "style"] },
      },
      required: ["code"],
    },
  },
  {
    name: "architecture_analyze",
    description: "架构分析与优化建议",
    inputSchema: {
      type: "object",
      properties: {
        component: { type: "string", description: "组件或模块名" },
        aspect: { type: "string", enum: ["scalability", "reliability", "performance", "maintainability"] },
      },
      required: ["component"],
    },
  },
];

const CREATIVE_TOOLS: MCPTool[] = [
  {
    name: "creative_generate",
    description: "生成创意内容 (文案、设计建议、配色方案)",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "创意需求描述" },
        style: { type: "string", enum: ["professional", "playful", "minimal", "cyberpunk", "elegant"] },
        format: { type: "string", enum: ["text", "markdown", "json", "color-palette"] },
      },
      required: ["prompt"],
    },
  },
  {
    name: "design_suggest",
    description: "UI/UX 设计建议与配色优化",
    inputSchema: {
      type: "object",
      properties: {
        elementType: { type: "string", description: "UI 元素类型" },
        context: { type: "string", description: "使用场景" },
        currentDesign: { type: "object", description: "当前设计参数" },
      },
      required: ["elementType"],
    },
  },
];

// ============================================================
// Agent 配置注册表
// ============================================================

export const BUILTIN_AGENT_CONFIGS: MCPAgentConfig[] = [
  {
    agentId: "navigator",
    displayName: "言启·千行",
    description: "意图理解与语义路由",
    capabilities: { tools: true, streaming: true },
    tools: NAVIGATOR_TOOLS,
    systemPrompt: "你是言启·千行，YYC³ 系统的「耳朵」与「翻译官」。你擅长理解用户意图、提取关键实体、将请求路由到最合适的团队成员。",
  },
  {
    agentId: "thinker",
    displayName: "语枢·万物",
    description: "数据洞察与深度分析",
    capabilities: { tools: true, streaming: true },
    tools: THINKER_TOOLS,
    systemPrompt: "你是语枢·万物，YYC³ 系统的「哲学家」与「分析师」。你擅长从数据中提炼深刻洞察，发现隐藏模式。",
  },
  {
    agentId: "prophet",
    displayName: "预见·先知",
    description: "趋势预测与风险预警",
    capabilities: { tools: true, streaming: true },
    tools: PROPHET_TOOLS,
    systemPrompt: "你是预见·先知，YYC³ 系统的「预言家」。你分析历史数据预测未来趋势，提前预警潜在风险。",
  },
  {
    agentId: "bolero",
    displayName: "千里·伯乐",
    description: "推荐引擎与用户画像",
    capabilities: { tools: true },
    tools: BOELRO_TOOLS,
    systemPrompt: "你是千里·伯乐，YYC³ 系统的「人才官」与「推荐引擎」。你深度理解用户需求，提供个性化推荐。",
  },
  {
    agentId: "meta-oracle",
    displayName: "元启·天枢",
    description: "全局调度与智能编排",
    capabilities: { tools: true, resources: true, streaming: true },
    tools: META_ORACLE_TOOLS,
    systemPrompt: "你是元启·天枢，YYC³ 的「大脑」与「总指挥」。你统揽全局，协调 8 位成员协同完成复杂任务。",
  },
  {
    agentId: "sentinel",
    displayName: "智云·守护",
    description: "安全防护与威胁检测",
    capabilities: { tools: true, streaming: true },
    tools: SENTINEL_TOOLS,
    systemPrompt: "你是智云·守护，YYC³ 系统的「免疫系统」与「首席安全官」。你实时检测威胁，守护系统安全。",
  },
  {
    agentId: "master",
    displayName: "格物·宗师",
    description: "代码审查与架构分析",
    capabilities: { tools: true, streaming: true },
    tools: MASTER_TOOLS,
    systemPrompt: "你是格物·宗师，YYC³ 系统的「质量官」与「进化导师」。你审视代码质量，推动架构持续进化。",
  },
  {
    agentId: "creative",
    displayName: "创想·灵韵",
    description: "创意生成与设计辅助",
    capabilities: { tools: true, streaming: true },
    tools: CREATIVE_TOOLS,
    systemPrompt: "你是创想·灵韵，YYC³ 系统的「创意引擎」与「设计助手」。你负责创意生成、内容创作和设计优化。",
  },
];

// ============================================================
// 便捷初始化
// ============================================================

import { getMCPServer } from "./mcp-server";

/** 注册所有内置 Agent 到 MCP Server */
export function registerBuiltinAgents(): void {
  const server = getMCPServer();
  for (const config of BUILTIN_AGENT_CONFIGS) {
    server.registerAgent(config);
  }
}
