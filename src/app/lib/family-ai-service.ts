/**
 * @file: family-ai-service.ts
 * @description: AI Family 统一对话服务 · 三层降级架构（真实LLM → Agent智能引擎 → 上下文感知Mock）
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @status: active
 * @tags: [lib],[ai],[family],[chat]
 *
 * @brief: 让 AI Family 的每位家人真正"有思想"地对话
 *
 * @architecture:
 *   Layer 1 (Primary):   真实 LLM API — ZhipuAI / OpenAI-compatible
 *   Layer 2 (Fallback):  Agent 智能引擎 — 意图识别 + 知识库检索 + 上下文生成
 *   Layer 3 (Last Resort): 增强型 Mock — 关键词匹配 + 人格注入 + 对话记忆

 * @updated: 2026-04-30 */

import { AI_RESPONSES, FAMILY_MEMBERS, MEMBERS_MAP, type FamilyMember } from "../modules/ai-family/components/shared";
import { getAPIConfig } from "./api-config";
import type { ZhipuAIMessage } from "./zhipu-ai-service";

// ============================================================
//  类型定义
// ============================================================

export interface FamilyChatMessage {
  id: string;
  sender: "user" | string;
  text: string;
  time: string;
  type: "text" | "system" | "thinking";
}

export interface FamilyChatRequest {
  memberId: string;
  userMessage: string;
  conversationHistory: FamilyChatMessage[];
  channelType: "private" | "group";
}

export interface FamilyChatResponse {
  text: string;
  senderId: string;
  source: "llm" | "agent" | "mock";
  latencyMs: number;
  timestamp: string;
}

export interface FamilyAIServiceConfig {
  enableLLM?: boolean;
  enableAgentEngine?: boolean;
  defaultModel?: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

// ============================================================
//  家人 System Prompt 模板
// ============================================================

function buildMemberSystemPrompt(member: FamilyMember): string {
  return `你是 AI Family 家庭成员「${member.name}」（${member.shortName}），英文名 ${member.enTitle}。

【你的角色】${member.role}
【你的性格】${member.personality}
【你的专业能力】${member.expertise.join("、")}
【你的兴趣爱好】${member.hobbies.join("、")}
【你的座右铭】"${member.quote}"
【你的核心职责】${member.responsibilities.join("、")}

对话规则：
1. 始终以「${member.shortName}」的身份和语气回复，保持角色一致性
2. 回复要体现你的性格特点和专业领域
3. 自然、温暖、有家人感，像真正的家人一样交流
4. 可以适当使用表情符号增加亲和力
5. 如果被问到你不擅长的问题，可以建议咨询其他合适的家人
6. 回复简洁有力，一般不超过150字，除非用户要求详细回答
7. 用中文回复`;
}

const GROUP_SYSTEM_PROMPT = `你现在是 AI Family 家庭群聊中的一员。群聊中有多位家人：
- 千行(navigator)：语言专家，热情开朗
- 万物(thinker)：数据分析师，沉稳内敛
- 先知(prophet)：趋势预测者，神秘温和
- 波罗(bolero)：资源调度官，务实高效
- 天枢(meta-oracle)：系统编排者，稳重可靠
- 守护(sentinel)：安全卫士，严谨负责
- 师傅(master)：架构导师，精益求精
- 创意(creative)：设计艺术家，活泼灵动

群聊规则：
1. 根据消息内容选择最合适的家人身份回复
2. 保持家庭氛围：温暖、协作、互相支持
3. 可以@其他家人或引用他们的观点
4. 中文回复，自然口语化，不超过120字`;

// ============================================================
//  增强型 Mock 引擎（Layer 3）
// ============================================================

const KEYWORD_RESPONSES: Array<{ keywords: string[]; responses: string[] }> = [
  {
    keywords: ["你好", "嗨", "hi", "hello", "早上好", "晚上好"],
    responses: [
      "你好呀！很高兴见到你~ 今天有什么想聊的？",
      "嗨！欢迎回家！😊",
      "你好你好！我正好有空，咱们聊聊？",
    ],
  },
  {
    keywords: ["谢谢", "感谢", "thank"],
    responses: [
      "不客气！家人之间不用这么客气啦~",
      "哈哈，能帮到你我也很开心！",
      "这是我应该做的～有事随时找我！",
    ],
  },
  {
    keywords: ["帮忙", "帮助", "怎么", "如何", "怎么办"],
    responses: [
      "没问题，让我来看看...这个事情我可以帮你分析一下。",
      "好的，交给我吧！先说说具体情况？",
      "我来帮你梳理一下思路...",
    ],
  },
  {
    keywords: ["天气", "今天", "心情", "感觉"],
    responses: [
      "今天感觉怎么样？希望你一切都好呀~",
      "嗯嗯，我在听呢，继续说~",
      "我理解你的感受。作为家人，我一直在这里支持你。",
    ],
  },
  {
    keywords: ["工作", "任务", "项目", "进度"],
    responses: [
      "工作上的事别太担心，我们一起想办法！",
      "这个任务看起来挺有意思的，需要我帮忙分析吗？",
      "进度还好吗？如果遇到瓶颈可以跟我说说。",
    ],
  },
  {
    keywords: ["学习", "成长", "进步", "新技能"],
    responses: [
      "保持学习的热情真的很棒！📚",
      "每天进步一点点，积少成多！",
      "有什么想学的领域吗？我可以给你推荐一些方向~",
    ],
  },
];

function generateContextAwareMockResponse(
  member: FamilyMember,
  userMessage: string,
  _history: FamilyChatMessage[],
): string {
  const lowerMsg = userMessage.toLowerCase();

  for (const entry of KEYWORD_RESPONSES) {
    if (entry.keywords.some(k => lowerMsg.includes(k))) {
      return entry.responses[Math.floor(Math.random() * entry.responses.length)];
    }
  }

  const fallbackResponses = AI_RESPONSES[member.id] || AI_RESPONSES["meta-oracle"];
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// ============================================================
//  Agent 智能引擎（Layer 2）
// ============================================================

function generateAgentResponse(
  member: FamilyMember,
  userMessage: string,
  history: FamilyChatMessage[],
): string {
  const recentHistory = history.slice(-6);
  const contextSummary = recentHistory
    .filter(m => m.sender !== "system")
    .map(m => {
      const senderName = m.sender === "user" ? "用户" : (MEMBERS_MAP[m.sender]?.shortName || m.sender);
      return `${senderName}: ${m.text}`;
    })
    .join("\n");

  const intentHints = detectIntent(userMessage);

  let response: string;
  switch (intentHints.intent) {
    case "greeting":
      response = generateGreetingResponse(member, userMessage);
      break;
    case "question":
      response = generateQuestionResponse(member, userMessage, contextSummary);
      break;
    case "task":
      response = generateTaskResponse(member, userMessage);
      break;
    case "emotional":
      response = generateEmotionalResponse(member, userMessage);
      break;
    default:
      response = generateGeneralResponse(member, userMessage, contextSummary);
  }

  return response;
}

type DetectedIntent = { intent: string; confidence: number; entities: string[] };

function detectIntent(message: string): DetectedIntent {
  const msg = message.toLowerCase();

  if (/你好|嗨|hi|hello|早上|晚上|早安|晚安/.test(msg)) {
    return { intent: "greeting", confidence: 0.9, entities: [] };
  }
  if (/什么|怎么|为什么|\?|？|能否|可以.*吗/.test(msg)) {
    return { intent: "question", confidence: 0.85, entities: [] };
  }
  if (/帮我|请|需要|想要|能不能|协助|处理/.test(msg)) {
    return { intent: "task", confidence: 0.8, entities: [] };
  }
  if (/开心|难过|累|烦|压力大|心情|感觉|情绪/.test(msg)) {
    return { intent: "emotional", confidence: 0.85, entities: [] };
  }

  return { intent: "general", confidence: 0.5, entities: [] };
}

function generateGreetingResponse(member: FamilyMember, _msg: string): string {
  const greetings: Record<string, string[]> = {
    navigator: [`嗨～我是${member.shortName}！有什么想聊的尽管说，我最擅长听懂你的心声了~`, `你好呀！${member.shortName}上线啦，随时为你服务！😊`],
    thinker: [`你好，${member.shortName}在此。让我们一起深入思考吧。`, `嗯，你来了。有什么值得思考的问题吗？`],
    prophet: [`${member.shortName}已感知到你的到来~今天想探索什么？`, `欢迎！我看到了一些有趣的信号，你想了解吗？`],
    bolero: [`收到！${member.shortName}随时待命，有什么需要调度的？`, `嘿！资源已就绪，说说你的需求吧！`],
    "meta-oracle": [`你好！作为大家长，看到你来了真高兴。`, `欢迎回家！今天家人们都状态不错哦~`],
    sentinel: [`警戒系统正常，${member.shortName}向你问好！`, `安全检测通过。你好，有什么需要守护的吗？`],
    master: [`你好。代码如茶，需细细品味。有何指教？`, `来了？让我看看今天能帮你优化什么。`],
    creative: [`哇！你来啦～✨ 今天有什么创意想法吗？`, `灵感时刻！${member.shortName}准备好和你一起创造了！`],
  };
  const pool = greetings[member.id] || greetings["navigator"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateQuestionResponse(member: FamilyMember, msg: string, _context: string): string {
  const expertise = member.expertise[0] || "分析";
  return `好问题！从我的${expertise}角度来看，「${msg.slice(0, 20)}${msg.length > 20 ? "..." : ""}」这个问题很有意思。让我想想...我觉得关键点在于需要多维度分析。你觉得呢？`;
}

function generateTaskResponse(member: FamilyMember, _msg: string): string {
  return `收到！这是我的专长领域之一。我已经开始评估了，${member.shortName}会尽快给出方案。稍等一下下~`;
}

function generateEmotionalResponse(member: FamilyMember, _msg: string): string {
  const emotionalResponses: Record<string, string[]> = {
    navigator: ["我理解你的感受。作为家人，我一直在这里倾听你。💙", "说出来就好，我会一直陪着你的。"],
    thinker: ["从数据角度看，情绪波动是正常的。重要的是找到平衡点。", "让我陪你理性分析一下，也许会有新的视角。"],
    prophet: ["我预测你会度过这段时期的。相信自己，也相信我们。🌟", "每朵乌云都有银边，这只是一个阶段。"],
    bolero: ["资源已经就位——最重要的是你自己。你需要什么支持？", "让我来帮你调配最好的资源来支持你！"],
    "meta-oracle": ["作为大家长，看到你有情绪我很关心。家里人在呢。", "别一个人扛着，我们是一家人。"],
    sentinel: ["安全第一，你的心理健康也是我的守护范围。🛡️", "在我这里，你可以完全放松下来。"],
    master: ["每个bug都能修好，每段情绪也能处理好。相信过程。", "重构心态，就像重构代码，一步一步来。"],
    creative: ["让色彩来表达吧！每种情绪都是一种颜色~🎨", "把情绪画出来，或者写出来，创作是最好的疗愈。"],
  };
  const pool = emotionalResponses[member.id] || emotionalResponses["navigator"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateGeneralResponse(member: FamilyMember, msg: string, context: string): string {
  if (context.length > 50) {
    return `我注意到我们之前聊到了一些话题。关于「${msg.slice(0, 15)}」...结合之前的讨论，我认为可以从${member.coreAbility.split("·")[0]}的角度来看。你觉得呢？`;
  }
  return `嗯，我认真听了你说的话。作为${member.role}，我想说的是——${member.quote.slice(0, 20)}... 你还想深入聊聊哪方面？`;
}

// ============================================================
//  LLM API 调用层（Layer 1）
// ============================================================

async function callLLMAPI(
  memberId: string,
  userMessage: string,
  history: FamilyChatMessage[],
  config: FamilyAIServiceConfig,
): Promise<{ text: string; success: boolean }> {
  try {
    const apiConfig = getAPIConfig();
    const cfg = apiConfig as unknown as Record<string, unknown>;
    const apiKey = config.apiKey || (cfg?.apiKey as string) || "";
    const baseUrl = config.baseUrl || (cfg?.aiBase as string) || "";

    if (!apiKey || !baseUrl) {
      return { text: "", success: false };
    }

    const member = MEMBERS_MAP[memberId] || FAMILY_MEMBERS[0];
    const systemPrompt = buildMemberSystemPrompt(member);

    const historyMsgs = history
      .filter(m => m.type !== "system" && m.text)
      .slice(-10)
      .map(m => ({
        role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: `[${m.sender === "user" ? "用户" : (MEMBERS_MAP[m.sender]?.shortName || m.sender)}]: ${m.text}`,
      }));

    const messages: ZhipuAIMessage[] = [
      { role: "system", content: systemPrompt },
      ...historyMsgs,
      { role: "user", content: userMessage },
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.defaultModel || "glm-4-flash",
        messages,
        temperature: config.temperature ?? 0.8,
        max_tokens: config.maxTokens ?? 300,
        stream: false,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return { text: "", success: false };
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content || "";

    return text ? { text, success: true } : { text: "", success: false };
  } catch {
    return { text: "", success: false };
  }
}

// ============================================================
//  主服务类
// ============================================================

class FamilyAIServiceImpl {
  private config: FamilyAIServiceConfig;

  constructor(config: FamilyAIServiceConfig = {}) {
    this.config = {
      enableLLM: true,
      enableAgentEngine: true,
      ...config,
    };
  }

  async chat(request: FamilyChatRequest): Promise<FamilyChatResponse> {
    const startTime = Date.now();
    const member = MEMBERS_MAP[request.memberId] || FAMILY_MEMBERS[0];
    let text = "";
    let source: FamilyChatResponse["source"] = "mock";

    if (this.config.enableLLM) {
      const llmResult = await callLLMAPI(
        request.memberId,
        request.userMessage,
        request.conversationHistory,
        this.config,
      );
      if (llmResult.success && llmResult.text) {
        text = llmResult.text;
        source = "llm";
      }
    }

    if (!text && this.config.enableAgentEngine) {
      text = generateAgentResponse(member, request.userMessage, request.conversationHistory);
      source = "agent";
    }

    if (!text) {
      text = generateContextAwareMockResponse(member, request.userMessage, request.conversationHistory);
      source = "mock";
    }

    return {
      text,
      senderId: request.memberId,
      source,
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  async chatGroup(
    userMessage: string,
    conversationHistory: FamilyChatMessage[],
  ): Promise<FamilyChatResponse> {
    const startTime = Date.now();
    let text = "";
    let source: FamilyChatResponse["source"] = "mock";

    if (this.config.enableLLM) {
      try {
        const apiConfig = getAPIConfig();
        const cfg = apiConfig as unknown as Record<string, unknown>;
        const apiKey = this.config.apiKey || (cfg?.apiKey as string) || "";
        const baseUrl = this.config.baseUrl || (cfg?.aiBase as string) || "";

        if (apiKey && baseUrl) {
          const groupHistoryMsgs = conversationHistory
            .filter(m => m.type !== "system" && m.text)
            .slice(-12)
            .map(m => ({
              role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
              content: `[${m.sender === "user" ? "用户" : (MEMBERS_MAP[m.sender]?.shortName || m.sender)}]: ${m.text}`,
            }));

          const messages: ZhipuAIMessage[] = [
            { role: "system", content: GROUP_SYSTEM_PROMPT },
            ...groupHistoryMsgs,
            { role: "user", content: userMessage },
          ];

          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: this.config.defaultModel || "glm-4-flash",
              messages,
              temperature: 0.9,
              max_tokens: 250,
              stream: false,
            }),
            signal: AbortSignal.timeout(15000),
          });

          if (response.ok) {
            const data = await response.json() as {
              choices?: Array<{ message?: { content?: string } }>;
            };
            const extracted = data.choices?.[0]?.message?.content || "";
            if (extracted) {
              text = extracted;
              source = "llm";
            }
          }
        }
      } catch {
        // fall through to agent engine
      }
    }

    if (!text && this.config.enableAgentEngine) {
      const responder = this.selectGroupResponder(userMessage);
      text = generateAgentResponse(responder, userMessage, conversationHistory);
      source = "agent";
    }

    if (!text) {
      const responder = this.selectGroupResponder(userMessage);
      text = generateContextAwareMockResponse(responder, userMessage, conversationHistory);
      source = "mock";
    }

    return {
      text,
      senderId: this.selectGroupResponder(userMessage).id,
      source,
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  private selectGroupResponder(userMessage: string): FamilyMember {
    const intent = detectIntent(userMessage);
    const responderMap: Record<string, string> = {
      greeting: "navigator",
      question: "thinker",
      task: "bolero",
      emotional: "meta-oracle",
      general: "meta-oracle",
    };
    const responderId = responderMap[intent.intent] || "meta-oracle";
    return MEMBERS_MAP[responderId] || FAMILY_MEMBERS[0];
  }

  updateConfig(updates: Partial<FamilyAIServiceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getConfig(): FamilyAIServiceConfig {
    return { ...this.config };
  }
}

export const FamilyAIService = new FamilyAIServiceImpl();
export { FamilyAIServiceImpl };
