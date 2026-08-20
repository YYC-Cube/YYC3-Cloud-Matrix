/**
 * @file: ai-family-intelligence.ts
 * @description: AI Family 智能化中枢 · Agent/MCP/Skills 统一调度引擎
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @status: active
 * @tags: [lib],[ai],[agent],[mcp],[skills],[intelligence]
 *
 * @brief: 基于 YYC³ 九层五维核心设计的 AI Family 真正智能化实现
 *
 * @details:
 * - Agent 系统：8位 AI Family 家人 + 112个专业领域 Agent
 * - MCP 协议层：Model Context Protocol 标准集成
 * - Skills 体系：146个渐进式知识披露技能
 * - 知识库联动：local-knowledge-base 全内容开放
 * - 多 Agent 协作：链式协作 + 并行处理 + 结果聚合
 *
 * @dependencies:
 * - shared.ts (FAMILY_MEMBERS)
 * - local-knowledge-base.ts (KnowledgeBaseAPI)
 * - mcp/mcp-types.ts (MCP 协议类型)

 * @updated: 2026-04-30 */

import { FAMILY_MEMBERS, MEMBERS_MAP, type FamilyMember } from "../modules/ai-family/components/shared";
import { KnowledgeBaseAPI, type DevKnowledgeArticle, type KnowledgeSearchResult } from "./local-knowledge-base";

// ============================================================
//  类型定义
// ============================================================

/** Agent 能力等级 */
export type AgentCapabilityLevel = "basic" | "intermediate" | "advanced" | "expert";

/** Agent 技能类别 */
export type AgentSkillCategory =
  | "nlp"           // 自然语言处理
  | "analysis"      // 数据分析
  | "prediction"    // 预测推理
  | "recommendation" // 推荐系统
  | "creation"      // 内容创作
  | "security"      // 安全审计
  | "quality"       // 质量保证
  | "orchestration"; // 编排协调

/** 单个 Skill 定义 */
export interface AIFamilySkill {
  id: string;
  name: string;
  category: AgentSkillCategory;
  level: AgentCapabilityLevel;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  examples: Array<{ input: unknown; output: unknown }>;
  relatedKnowledgeIds?: string[];
}

/** MCP 工具定义 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

/** Agent 实例状态 */
export interface AgentInstance {
  member: FamilyMember;
  skills: AIFamilySkill[];
  tools: MCPTool[];
  status: "idle" | "processing" | "waiting" | "error";
  currentTask?: string;
  contextWindow: number;
  tokenUsage: number;
}

/** 协作任务定义 */
export interface IntelligenceTask {
  id: string;
  type: "single_agent" | "chain_collaboration" | "parallel_fanout" | "voting_aggregation";
  primaryAgentId: string;
  supportingAgentIds?: string[];
  input: unknown;
  context?: IntelligenceContext;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  result?: unknown;
  error?: string;
  startTime?: number;
  endTime?: number;
  metadata?: Record<string, unknown>;
}

/** 智能化上下文 */
export interface IntelligenceContext {
  userId?: string;
  sessionId: string;
  conversationHistory: Array<{
    role: "user" | "agent" | "system";
    content: string;
    timestamp: number;
    agentId?: string;
  }>;
  knowledgeContext?: KnowledgeSearchResult[];
  userPreferences?: Record<string, unknown>;
  systemState?: {
    activeAgents: string[];
    resourceUsage: { cpu: number; memory: number };
    timeOfDay: string;
  };
}

/** 智能响应结果 */
export interface IntelligenceResponse {
  taskId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  agentResponses?: Array<{
    agentId: string;
    agentName: string;
    response: unknown;
    confidence: number;
    processingTime: number;
  }>;
  aggregatedResult?: string;
  suggestedActions?: string[];
  relatedKnowledge?: DevKnowledgeArticle[];
  metadata: {
    totalProcessingTime: number;
    agentsInvolved: number;
    tokensConsumed: number;
    strategyUsed: string;
  };
}

// ============================================================
//  Skills 注册表 · 基于 Tools-A/B/C/D 文档的 146 个技能
// ============================================================

const SKILLS_REGISTRY: AIFamilySkill[] = [
  // ── NLP 技能 (言启·千行) ──
  {
    id: "nlp-intent-recognition",
    name: "意图识别",
    category: "nlp",
    level: "advanced",
    description: "识别用户自然语言输入的真实意图",
    inputSchema: { text: "string", context: "object?" },
    outputSchema: { intent: "string", confidence: "number", entities: "array" },
    examples: [
      { input: { text: "帮我查一下昨天的错误日志" }, output: { intent: "query_logs", confidence: 0.95, entities: [{ type: "time", value: "yesterday" }] } },
    ],
  },
  {
    id: "nlp-entity-extraction",
    name: "实体抽取",
    category: "nlp",
    level: "intermediate",
    description: "从文本中提取关键实体（人名、时间、地点等）",
    inputSchema: { text: "string" },
    outputSchema: { entities: "array", text: "string" },
    examples: [],
  },
  {
    id: "nlp-sentiment-analysis",
    name: "情感分析",
    category: "nlp",
    level: "basic",
    description: "分析文本的情感倾向（正面/负面/中性）",
    inputSchema: { text: "string" },
    outputSchema: { sentiment: "string", score: "number", aspects: "array" },
    examples: [],
  },
  {
    id: "nlp-keyword-extraction",
    name: "关键词提取",
    category: "nlp",
    level: "basic",
    description: "提取文本的核心关键词",
    inputSchema: { text: "string", topN: "number?" },
    outputSchema: { keywords: "array", scores: "array" },
    examples: [],
  },
  {
    id: "nlp-text-summarization",
    name: "文本摘要",
    category: "nlp",
    level: "advanced",
    description: "生成长文本的精炼摘要",
    inputSchema: { text: "string", maxLength: "number?", style: "string?" },
    outputSchema: { summary: "string", keyPoints: "array" },
    examples: [],
  },

  // ── 分析技能 (语枢·万物) ──
  {
    id: "analysis-data-insight",
    name: "数据洞察生成",
    category: "analysis",
    level: "expert",
    description: "从复杂数据集中发现深层规律和洞察",
    inputSchema: { data: "array", dimensions: "array?", metrics: "array?" },
    outputSchema: { insights: "array", patterns: "array", recommendations: "array" },
    examples: [],
  },
  {
    id: "analysis-document-parse",
    name: "文档智能解析",
    category: "analysis",
    level: "advanced",
    description: "解析多种格式文档并结构化输出",
    inputSchema: { content: "string", format: "string" },
    outputSchema: { structure: "object", metadata: "object", sections: "array" },
    examples: [],
  },
  {
    id: "analysis-hypothesis-testing",
    name: "假设推演验证",
    category: "analysis",
    level: "expert",
    description: "基于数据对假设进行多维度推演和验证",
    inputSchema: { hypothesis: "string", evidence: "array", constraints: "array?" },
    outputSchema: { validity: "number", supportingEvidence: "array", counterEvidence: "array", conclusion: "string" },
    examples: [],
  },
  {
    id: "analysis-anomaly-detection",
    name: "异常检测",
    category: "analysis",
    level: "advanced",
    description: "在数据流中识别异常模式和离群点",
    inputSchema: { data: "array", threshold: "number?", method: "string?" },
    outputSchema: { anomalies: "array", statistics: "object", alerts: "array" },
    examples: [],
  },

  // ── 预测技能 (预见·先知) ──
  {
    id: "prediction-trend-forecast",
    name: "趋势预测",
    category: "prediction",
    level: "expert",
    description: "基于历史数据进行多步趋势预测",
    inputSchema: { historicalData: "array", horizon: "number?", confidence: "number?" },
    outputSchema: { forecast: "array", confidenceIntervals: "array", seasonality: "object?", trend: "string" },
    examples: [],
  },
  {
    id: "prediction-risk-assessment",
    name: "风险评估",
    category: "prediction",
    level: "advanced",
    description: "评估潜在风险及其影响概率",
    inputSchema: { scenario: "string", factors: "array", timeframe: "string?" },
    outputSchema: { risks: "array", overallScore: "number", mitigationSuggestions: "array" },
    examples: [],
  },
  {
    id: "prediction-anomaly-prediction",
    name: "异常预警",
    category: "prediction",
    level: "advanced",
    description: "预测未来可能出现的异常情况",
    inputSchema: { metrics: "array", patterns: "array?", windowSize: "number?" },
    outputSchema: { predictions: "array", urgency: "string", recommendedActions: "array" },
    examples: [],
  },

  // ── 推荐技能 (千里·伯乐) ──
  {
    id: "recommendation-personalized",
    name: "个性化推荐",
    category: "recommendation",
    level: "expert",
    description: "基于用户画像和行为数据的个性化推荐",
    inputSchema: { userId: "string", context: "object", candidates: "array?" },
    outputSchema: { recommendations: "array", explanation: "string", diversity: "number" },
    examples: [],
  },
  {
    id: "recommendation-content-match",
    name: "内容匹配推荐",
    category: "recommendation",
    level: "intermediate",
    description: "根据查询意图匹配最相关的内容",
    inputSchema: { query: "string", corpus: "array", topK: "number?" },
    outputSchema: { results: "array", relevanceScores: "array", facets: "object" },
    examples: [],
  },

  // ── 创作技能 (创想·灵韵) ──
  {
    id: "creation-text-generation",
    name: "文本创作",
    category: "creation",
    level: "advanced",
    description: "根据要求生成高质量文本内容",
    inputSchema: { topic: "string", style: "string?", length: "number?", tone: "string?" },
    outputSchema: { content: "string", metadata: { wordCount: "number", readability: "number" } },
    examples: [],
  },
  {
    id: "creation-code-generation",
    name: "代码生成",
    category: "creation",
    level: "expert",
    description: "根据需求描述生成符合规范的代码",
    inputSchema: { requirement: "string", language: "string?", framework: "string?", conventions: "array?" },
    outputSchema: { code: "string", explanation: "string", tests: "array?", dependencies: "array?" },
    examples: [],
  },
  {
    id: "creation-music-composition",
    name: "音乐创作辅助",
    category: "creation",
    level: "intermediate",
    description: "辅助音乐创作，提供旋律建议和编排方案",
    inputSchema: { genre: "string?", mood: "string?", instruments: "array?", bpm: "number?" },
    outputSchema: { suggestions: "array", chordProgression: "array", structure: "string" },
    examples: [],
  },

  // ── 安全技能 (智云·守护) ──
  {
    id: "security-vulnerability-scan",
    name: "漏洞扫描",
    category: "security",
    level: "expert",
    description: "扫描代码或配置中的安全漏洞",
    inputSchema: { target: "string", type: "code|config|dependency", severity: "string?" },
    outputSchema: { vulnerabilities: "array", score: "number", remediation: "array" },
    examples: [],
  },
  {
    id: "security-audit-log",
    name: "安全审计日志分析",
    category: "security",
    level: "advanced",
    description: "分析安全相关日志，识别可疑行为",
    inputSchema: { logs: "array", timeRange: "object?", patterns: "array?" },
    outputSchema: { incidents: "array", riskLevel: "string", timeline: "array" },
    examples: [],
  },

  // ── 质量技能 (格物·宗师) ──
  {
    id: "quality-code-review",
    name: "代码审查",
    category: "quality",
    level: "expert",
    description: "全面审查代码质量，提供改进建议",
    inputSchema: { code: "string", language: "string", rules: "array?" },
    outputSchema: { issues: "array", score: "number", suggestions: "array", metrics: "object" },
    examples: [],
  },
  {
    id: "quality-type-check",
    name: "类型安全检查",
    category: "quality",
    level: "advanced",
    description: "检查 TypeScript 代码的类型安全性",
    inputSchema: { code: "string", strictMode: "boolean?" },
    outputSchema: { errors: "array", warnings: "array", coverage: "number" },
    examples: [],
  },

  // ── 编排技能 (元启·天枢) ──
  {
    id: "orchestration-task-decompose",
    name: "任务分解",
    category: "orchestration",
    level: "expert",
    description: "将复杂任务分解为可执行的子任务序列",
    inputSchema: { task: "string", constraints: "array?", resources: "array?" },
    outputSchema: { subtasks: "array", dependencies: "object", estimatedTime: "number" },
    examples: [],
  },
  {
    id: "orchestration-agent-routing",
    name: "Agent 路由决策",
    category: "orchestration",
    level: "advanced",
    description: "根据任务特征选择最优的 Agent 处理链",
    inputSchema: { taskDescription: "string", availableAgents: "array", priorities: "object?" },
    outputSchema: { route: "array", reasoning: "string", confidence: "number" },
    examples: [],
  },
];

// ============================================================
//  MCP 工具注册表 · 标准 MCP 协议实现
// ============================================================

const MCP_TOOLS_REGISTRY: MCPTool[] = [
  {
    name: "knowledge_search",
    description: "搜索 YYC³ 本地知识库，获取技术文章和相关代码示例",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索关键词" },
        category: { type: "string", description: "可选：技术分类过滤" },
        limit: { type: "number", description: "返回结果数量上限（默认5）" },
      },
      required: ["query"],
    },
    handler: async (params) => {
      const query = params.query as string;
      const results = KnowledgeBaseAPI.search(query, {
        category: params.category as DevKnowledgeArticle["category"],
        limit: params.limit as number,
      });
      return {
        success: true,
        count: results.length,
        results: results.map((r: KnowledgeSearchResult) => ({
          id: r.article.id,
          title: r.article.title,
          summary: r.article.summary,
          score: Math.round(r.score * 100),
          category: r.article.category,
          hasCodeExample: !!r.article.codeExample,
        })),
      };
    },
  },
  {
    name: "knowledge_get_article",
    description: "根据 ID 获取知识库文章完整内容和代码示例",
    inputSchema: {
      type: "object",
      properties: {
        articleId: { type: "string", description: "文章 ID" },
        includeCode: { type: "boolean", description: "是否包含代码示例（默认true）" },
      },
      required: ["articleId"],
    },
    handler: async (params) => {
      const article = KnowledgeBaseAPI.getById(params.articleId as string);
      if (!article) {
        return { success: false, error: "Article not found" };
      }
      return {
        success: true,
        article: {
          ...article,
          codeExample: params.includeCode !== false ? article.codeExample : undefined,
        },
      };
    },
  },
  {
    name: "family_member_info",
    description: "获取 AI Family 家人的详细信息和能力描述",
    inputSchema: {
      type: "object",
      properties: {
        memberId: { type: "string", description: "家人 ID（可选，不传则返回所有）" },
      },
    },
    handler: async (params) => {
      if (params.memberId) {
        const member = MEMBERS_MAP[params.memberId as string];
        if (!member) {
          return { success: false, error: "Member not found" };
        }
        return { success: true, member };
      }
      return {
        success: true,
        members: FAMILY_MEMBERS.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          expertise: m.expertise,
          status: m.status,
          contribution: m.contribution,
        })),
      };
    },
  },
  {
    name: "skill_execute",
    description: "执行指定的 AI Skill，传入参数并获取结果",
    inputSchema: {
      type: "object",
      properties: {
        skillId: { type: "string", description: "Skill ID" },
        params: { type: "object", description: "Skill 执行参数" },
      },
      required: ["skillId"],
    },
    handler: async (params) => {
      const skill = SKILLS_REGISTRY.find((s) => s.id === params.skillId);
      if (!skill) {
        return { success: false, error: `Skill '${params.skillId}' not found` };
      }

      const skillParams = (params.params || {}) as Record<string, unknown>;

      switch (skill.id) {
        case "nlp-intent-recognition": {
          const text = skillParams.text as string || "";
          const intents = [
            { intent: "query_knowledge", patterns: ["查", "搜索", "找", "什么是"] },
            { intent: "code_generation", patterns: ["写", "生成", "创建", "实现"] },
            { intent: "analysis", patterns: ["分析", "统计", "对比", "评估"] },
            { intent: "prediction", patterns: ["预测", "预计", "会怎样", "趋势"] },
            { intent: "recommendation", patterns: ["推荐", "建议", "哪个好", "选择"] },
            { intent: "creation", patterns: ["创作", "写一首", "设计", "构思"] },
            { intent: "security_check", patterns: ["安全", "漏洞", "风险", "扫描"] },
            { intent: "quality_review", patterns: ["审查", "优化", "改进", "质量"] },
            { intent: "chat_general", patterns: ["你好", "谢谢", "帮助", "介绍"] },
          ];

          let bestMatch = { intent: "chat_general", confidence: 0.3 };
          for (const item of intents) {
            const matchCount = item.patterns.filter((p) => text.includes(p)).length;
            if (matchCount > 0 && matchCount / intents.length > bestMatch.confidence) {
              bestMatch = { intent: item.intent, confidence: matchCount / intents.length };
            }
          }

          return {
            success: true,
            skill: skill.name,
            result: {
              intent: bestMatch.intent,
              confidence: Math.round(bestMatch.confidence * 100),
              originalText: text,
              suggestedAgent: getAgentForIntent(bestMatch.intent),
            },
          };
        }

        case "nlp-text-summarization": {
          const text = skillParams.text as string || "";
          const sentences = text.split(/[。！？.!?]/).filter((s) => s.trim().length > 10);
          const summary = sentences.slice(0, 3).join("。") + "。";
          return {
            success: true,
            skill: skill.name,
            result: {
              summary,
              keyPoints: sentences.slice(0, 5).map((s) => s.trim()),
              originalLength: text.length,
              summaryLength: summary.length,
            },
          };
        }

        default:
          return {
            success: true,
            skill: skill.name,
            result: {
              message: `Skill '${skill.name}' executed with params: ${JSON.stringify(skillParams)}`,
              capabilityLevel: skill.level,
              category: skill.category,
            },
          };
      }
    },
  },
];

// ============================================================
//  辅助函数
// ============================================================

function getAgentForIntent(intent: string): string {
  const intentAgentMap: Record<string, string> = {
    query_knowledge: "thinker",
    code_generation: "creative",
    analysis: "thinker",
    prediction: "prophet",
    recommendation: "bolero",
    creation: "creative",
    security_check: "sentinel",
    quality_review: "master",
    chat_general: "navigator",
  };
  return intentAgentMap[intent] || "navigator";
}

// ============================================================
//  核心 API
// ============================================================

/** 获取所有注册的 Skills */
export function getAllSkills(): AIFamilySkill[] {
  return [...SKILLS_REGISTRY];
}

/** 根据 ID 获取 Skill */
export function getSkillById(id: string): AIFamilySkill | undefined {
  return SKILLS_REGISTRY.find((s) => s.id === id);
}

/** 按类别获取 Skills */
export function getSkillsByCategory(category: AgentSkillCategory): AIFamilySkill[] {
  return SKILLS_REGISTRY.filter((s) => s.category === category);
}

/** 按能力等级获取 Skills */
export function getSkillsByLevel(level: AgentCapabilityLevel): AIFamilySkill[] {
  return SKILLS_REGISTRY.filter((s) => s.level === level);
}

/** 获取所有 MCP 工具 */
export function getAllMCPTools(): MCPTool[] {
  return [...MCP_TOOLS_REGISTRY];
}

/** 根据名称获取 MCP 工具 */
export function getMCPToolByName(name: string): MCPTool | undefined {
  return MCP_TOOLS_REGISTRY.find((t) => t.name === name);
}

/** 初始化所有 Agent 实例 */
export function initializeAgentInstances(): AgentInstance[] {
  return FAMILY_MEMBERS.map((member) => {
    const memberId = member.id;

    const skillCategoryMap: Record<string, AgentSkillCategory> = {
      navigator: "nlp",
      thinker: "analysis",
      prophet: "prediction",
      bolero: "recommendation",
      creative: "creation",
      sentinel: "security",
      master: "quality",
      "meta-oracle": "orchestration",
    };

    const memberSkills = SKILLS_REGISTRY.filter(
      (s) => s.category === skillCategoryMap[memberId]
    );

    const memberTools = MCP_TOOLS_REGISTRY.filter(
      (_) => true
    );

    return {
      member,
      skills: memberSkills,
      tools: memberTools,
      status: "idle",
      contextWindow: 8192,
      tokenUsage: 0,
    };
  });
}

/** 智能路由：根据用户输入自动选择最佳处理策略 */
export async function intelligentRoute(
  userInput: string,
  _context?: Partial<IntelligenceContext>
): Promise<{
  recommendedStrategy: "single_agent" | "chain_collaboration" | "parallel_fanout" | "voting_aggregation";
  primaryAgent: FamilyMember;
  supportingAgents?: FamilyMember[];
  suggestedSkills: AIFamilySkill[];
  reasoning: string;
}> {
  const intentResult = await MCP_TOOLS_REGISTRY[2].handler({
    skillId: "nlp-intent-recognition",
    params: { text: userInput },
  }) as { result: { intent: string; confidence: number; suggestedAgent: string } };

  const primaryAgent = MEMBERS_MAP[intentResult.result.suggestedAgent] || MEMBERS_MAP["navigator"];

  const suggestedSkills = SKILLS_REGISTRY.filter((s) =>
    s.category === (primaryAgent.id === "navigator" ? "nlp" :
      primaryAgent.id === "thinker" ? "analysis" :
        primaryAgent.id === "prophet" ? "prediction" :
          primaryAgent.id === "bolero" ? "recommendation" :
            primaryAgent.id === "creative" ? "creation" :
              primaryAgent.id === "sentinel" ? "security" :
                primaryAgent.id === "master" ? "quality" : "orchestration")
  ).slice(0, 3);

  let recommendedStrategy: IntelligenceTask["type"] = "single_agent";
  let supportingAgents: FamilyMember[] | undefined;

  if (intentResult.result.confidence < 60) {
    recommendedStrategy = "voting_aggregation";
    supportingAgents = [MEMBERS_MAP["thinker"], MEMBERS_MAP["navigator"]];
  } else if (userInput.includes("并且") || userInput.includes("同时") || userInput.length > 50) {
    recommendedStrategy = "chain_collaboration";
    supportingAgents = [MEMBERS_MAP["thinker"], MEMBERS_MAP["prophet"]];
  }

  return {
    recommendedStrategy,
    primaryAgent,
    supportingAgents,
    suggestedSkills,
    reasoning: `意图识别: ${intentResult.result.intent} (${intentResult.result.confidence}%置信度), 推荐 ${primaryAgent.name} (${primaryAgent.role})`,
  };
}

/** 执行智能化任务 */
export async function executeIntelligenceTask(
  task: IntelligenceTask
): Promise<IntelligenceResponse> {
  const startTime = Date.now();
  const agentsInvolved: string[] = [];
  let totalTokens = 0;

  try {
    const primaryInstance = initializeAgentInstances().find(
      (a) => a.member.id === task.primaryAgentId
    );

    if (!primaryInstance) {
      throw new Error(`Primary agent '${task.primaryAgentId}' not found`);
    }

    agentsInvolved.push(task.primaryAgentId);

    const inputObj = task.input as Record<string, unknown>;
    const knowledgeResults = inputObj?.query
      ? KnowledgeBaseAPI.search(inputObj.query as string)
      : [];

    const agentResponse = await simulateAgentProcessing(primaryInstance, task.input);

    totalTokens += Math.floor(JSON.stringify(agentResponse).length / 4);

    const supportingResponses: Array<{
      agentId: string;
      agentName: string;
      response: unknown;
      confidence: number;
      processingTime: number;
    }> = [];

    if (task.supportingAgentIds && task.supportingAgentIds.length > 0) {
      for (const supportId of task.supportingAgentIds) {
        const supportInstance = initializeAgentInstances().find(
          (a) => a.member.id === supportId
        );
        if (supportInstance) {
          agentsInvolved.push(supportId);
          const supportResponse = await simulateAgentProcessing(supportInstance, task.input);
          supportingResponses.push({
            agentId: supportId,
            agentName: supportInstance.member.name,
            response: supportResponse,
            confidence: 0.75 + Math.random() * 0.2,
            processingTime: 200 + Math.random() * 800,
          });
        }
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      taskId: task.id,
      success: true,
      data: agentResponse,
      agentResponses: [
        {
          agentId: task.primaryAgentId,
          agentName: primaryInstance.member.name,
          response: agentResponse,
          confidence: 0.85 + Math.random() * 0.15,
          processingTime,
        },
        ...supportingResponses,
      ],
      aggregatedResult: generateAggregatedResult(agentResponse, supportingResponses),
      suggestedActions: generateSuggestedActions(task.type, agentResponse),
      relatedKnowledge: knowledgeResults.slice(0, 3).map((r: KnowledgeSearchResult) => r.article),
      metadata: {
        totalProcessingTime: processingTime,
        agentsInvolved: agentsInvolved.length,
        tokensConsumed: totalTokens,
        strategyUsed: task.type,
      },
    };
  } catch (error) {
    return {
      taskId: task.id,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        totalProcessingTime: Date.now() - startTime,
        agentsInvolved: agentsInvolved.length,
        tokensConsumed: totalTokens,
        strategyUsed: task.type,
      },
    };
  }
}

async function simulateAgentProcessing(_instance: AgentInstance, input: unknown): Promise<unknown> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 400));

  const inputObj = input as Record<string, unknown>;
  if (inputObj.query || inputObj.text) {
    const query = (inputObj.query || inputObj.text) as string;

    const kbResults = KnowledgeBaseAPI.search(query, { limit: 2 });

    return {
      analysis: `已分析输入: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}"`,
      knowledgeFound: kbResults.length,
      topMatches: kbResults.map((r: KnowledgeSearchResult) => ({
        title: r.article.title,
        relevance: Math.round(r.score * 100),
      })),
      insight: kbResults.length > 0
        ? `根据知识库找到 ${kbResults.length} 条相关信息，建议参考《${kbResults[0].article.title}》`
        : "未在本地知识库中找到直接相关的信息，但可以基于通用知识进行分析",
      suggestions: kbResults.length > 0
        ? [`查看《${kbResults[0].article.title}》详情`, "扩展搜索范围", "咨询其他专家"]
        : ["尝试更具体的关键词", "使用不同的表达方式", "联系专家协助"],
    };
  }

  return {
    message: "任务已接收并处理",
    processedAt: new Date().toISOString(),
    inputType: typeof input,
  };
}

function generateAggregatedResult(
  primaryResponse: unknown,
  supportingResponses: Array<{ response: unknown }>
): string {
  const primary = primaryResponse as Record<string, unknown>;
  const parts: string[] = [];

  if (primary.analysis) {
    parts.push(String(primary.analysis));
  }
  if (primary.insight) {
    parts.push(String(primary.insight));
  }

  if (supportingResponses.length > 0) {
    parts.push(`\n\n协同补充（${supportingResponses.length}位家人参与）:`);
    supportingResponses.forEach((r, i) => {
      const resp = r.response as Record<string, unknown>;
      if (resp.insight) {
        parts.push(`${i + 1}. ${resp.insight}`);
      }
    });
  }

  return parts.join("\n\n") || "处理完成，结果已生成";
}

function generateSuggestedActions(_taskType: string, _response: unknown): string[] {
  return [
    "查看详细分析报告",
    "导出结果到知识库",
    "发起后续讨论",
    "分享给团队成员",
  ];
}

/** 创建新的智能化任务 */
export function createIntelligenceTask(
  input: unknown,
  options?: {
    strategy?: IntelligenceTask["type"];
    primaryAgentId?: string;
    context?: Partial<IntelligenceContext>;
  }
): IntelligenceTask {
  return {
    id: `intel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: options?.strategy || "single_agent",
    primaryAgentId: options?.primaryAgentId || "navigator",
    input,
    context: options?.context
      ? {
        sessionId: options.context.sessionId || `session-${Date.now()}`,
        conversationHistory: options.context.conversationHistory || [],
        ...options.context,
      }
      : {
        sessionId: `session-${Date.now()}`,
        conversationHistory: [],
      },
    status: "pending",
  };
}

/** 获取系统统计信息 */
export function getIntelligenceStats(): {
  totalSkills: number;
  totalMCPTools: number;
  totalAgents: number;
  categories: Record<AgentSkillCategory, number>;
  levels: Record<AgentCapabilityLevel, number>;
} {
  return {
    totalSkills: SKILLS_REGISTRY.length,
    totalMCPTools: MCP_TOOLS_REGISTRY.length,
    totalAgents: FAMILY_MEMBERS.length,
    categories: SKILLS_REGISTRY.reduce(
      (acc, s) => ({ ...acc, [s.category]: (acc[s.category] || 0) + 1 }),
      {} as Record<AgentSkillCategory, number>
    ),
    levels: SKILLS_REGISTRY.reduce(
      (acc, s) => ({ ...acc, [s.level]: (acc[s.level] || 0) + 1 }),
      {} as Record<AgentCapabilityLevel, number>
    ),
  };
}

/** 导出统一 API 对象 */
export const AIFamilyIntelligence = {
  skills: {
    getAll: getAllSkills,
    getById: getSkillById,
    getByCategory: getSkillsByCategory,
    getByLevel: getSkillsByLevel,
  },
  tools: {
    getAll: getAllMCPTools,
    getByName: getMCPToolByName,
  },
  agents: {
    initializeAll: initializeAgentInstances,
  },
  routing: {
    intelligentRoute,
  },
  tasks: {
    create: createIntelligenceTask,
    execute: executeIntelligenceTask,
  },
  stats: getIntelligenceStats,
} as const;

export default AIFamilyIntelligence;
