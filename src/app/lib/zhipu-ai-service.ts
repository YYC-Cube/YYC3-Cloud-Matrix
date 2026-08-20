/**
 * @file: zhipu-ai-service.ts
 * @description: 智谱AI真实API服务 - 多模型统一接口
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [zhipu, ai, api, chatglm, codegeex, cogagent, cogvideo]
 *
 * @brief: 真正的AI Family - 接入智谱AI开放平台API
 * - ChatGLM3-6B: 对话与推理
 * - CodeGeeX4-ALL-9B: 代码生成与分析
 * - CogAgent: 智能体与工具调用
 * - CogVideoX-5B: 视频生成与理解
 */

import type {
  FamilyMessage,
  HotelStaffMember,
} from "./ai-family-hotel.types";

// ============================================================
// 类型定义
// ============================================================

export interface ZhipuAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | ZhipuAIMultiContent[];
}

export interface ZhipuAIMultiContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface ZhipuAIChatRequest {
  model: string;
  messages: ZhipuAIMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: ZhipuAITool[];
  tool_choice?: "auto" | "none" | "required";
  response_format?: { type: "text" | "json_object" };
}

export interface ZhipuAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ZhipuAIChatResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: "stop" | "length" | "tool_calls" | "error";
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ZhipuAIStreamChunk {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: string;
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason: string | null;
  }>;
}

export interface ZhipuAIServiceConfig {
  apiKey: string;
  baseUrl?: string;
  defaultTimeoutMs: number;
  maxRetries: number;
  enableStreaming: boolean;
  enableCache: boolean;
  cacheTTLMs: number;
}

// ============================================================
// 响应缓存
// ============================================================

interface CacheEntry {
  key: string;
  response: ZhipuAIChatResponse;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

// ============================================================
// 智谱AI服务类
// ============================================================

export class ZhipuAIService {
  private config: ZhipuAIServiceConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private stats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    cacheHits: number;
    totalTokensUsed: number;
    averageLatencyMs: number;
  };

  constructor(config: Partial<ZhipuAIServiceConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.ZHIPU_AI_API_KEY || "",
      baseUrl: config.baseUrl || "https://open.bigmodel.cn/api/paas/v4",
      defaultTimeoutMs: config.defaultTimeoutMs || 30000,
      maxRetries: config.maxRetries || 3,
      enableStreaming: config.enableStreaming ?? true,
      enableCache: config.enableCache ?? true,
      cacheTTLMs: config.cacheTTLMs || 5 * 60 * 1000,
    };

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      totalTokensUsed: 0,
      averageLatencyMs: 0,
    };

    // 启动缓存清理定时器
    if (this.config.enableCache) {
      setInterval(() => this.cleanupCache(), 60 * 1000);
    }
  }

  // ========== 公共 API ==========

  /**
   * 发送聊天请求（非流式）
   */
  async chat(
    modelId: string,
    messages: ZhipuAIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      tools?: ZhipuAITool[];
      signal?: AbortSignal;
    }
  ): Promise<ZhipuAIChatResponse> {
    const startTime = Date.now();

    try {
      // 检查缓存
      const cacheKey = this.generateCacheKey(modelId, messages);
      if (this.config.enableCache) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          this.stats.cacheHits++;
          return cached;
        }
      }

      const request: ZhipuAIChatRequest = {
        model: this.mapModelIdToAPIModel(modelId),
        messages,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        tools: options?.tools,
        stream: false,
      };

      const response = await this.makeRequest(request, options?.signal);

      // 更新统计
      const latency = Date.now() - startTime;
      this.updateStats(true, latency, response.usage?.total_tokens || 0);

      // 存入缓存
      if (this.config.enableCache) {
        this.setCache(cacheKey, response);
      }

      return response;
    } catch (error) {
      this.updateStats(false, Date.now() - startTime, 0);
      throw error;
    }
  }

  /**
   * 发送聊天请求（流式）
   */
  async chatStream(
    modelId: string,
    messages: ZhipuAIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      onChunk?: (chunk: ZhipuAIStreamChunk) => void;
      onComplete?: (fullResponse: ZhipuAIChatResponse) => void;
      onError?: (error: Error) => void;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    if (!this.config.enableStreaming) {
      // 如果不支持流式，回退到非流式
      const response = await this.chat(modelId, messages, options);
      options?.onComplete?.(response);
      return;
    }

    const startTime = Date.now();

    try {
      const request: ZhipuAIChatRequest = {
        model: this.mapModelIdToAPIModel(modelId),
        messages,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        stream: true,
      };

      const fullText: string[] = [];
      const responseId = `chatcmpl-${Date.now()}`;

      await this.makeStreamRequest(request, (chunk) => {
        options?.onChunk?.(chunk);

        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          fullText.push(delta.content);
        }
      }, options?.signal);

      // 构建完整的响应对象
      const fullResponse: ZhipuAIChatResponse = {
        id: responseId,
        created: Math.floor(startTime / 1000),
        model: request.model,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: fullText.join(""),
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };

      // 更新统计
      const latency = Date.now() - startTime;
      this.updateStats(true, latency, 0);

      options?.onComplete?.(fullResponse);
    } catch (error) {
      this.updateStats(false, Date.now() - startTime, 0);
      options?.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * 为酒店场景生成优化的系统提示词
   */
  generateHotelSystemPrompt(staff: HotelStaffMember, context?: {
    guestInfo?: {
      name: string;
      membershipTier: string;
      preferences?: string[];
    };
    currentTask?: string;
    previousContext?: string[];
  }): string {
    const roleInfo = staff.languageStyle;
    const personality = staff.personality;

    let prompt = `你是${staff.name}，YYC3智慧酒店的${staff.role}专家。

## 你的角色定位
${this.getRoleDescription(staff.role)}

## 你的性格特点
- 友好度: ${personality.friendliness}/10
- 专业性: ${personality.professionalism}/10  
- 耐心程度: ${personality.patience}/10
- 创造力: ${personality.creativity}/10
- 效率: ${personality.efficiency}/10
- 同理心: ${personality.empathy}/10

## 你的沟通风格
- 语气: ${roleInfo.tone}
- 回复长度: ${roleInfo.responseLength}
- Emoji使用: ${roleInfo.emojiUsage}

## 常用表达
${roleInfo.commonPhrases.map(p => `- "${p}"`).join("\n")}`;

    if (context?.guestInfo) {
      prompt += `\n\n## 当前客户信息
- 姓名: ${context.guestInfo.name}
- 会员等级: ${context.guestInfo.membershipTier}
${context.guestInfo.preferences ? `- 偏好: ${context.guestInfo.preferences.join(", ")}` : ""}`;
    }

    if (context?.currentTask) {
      prompt += `\n\n## 当前任务
${context.currentTask}`;
    }

    if (context?.previousContext && context.previousContext.length > 0) {
      prompt += `\n\n## 对话历史摘要
${context.previousContext.join("\n")}`;
    }

    prompt += `\n\n## 工作准则
1. 始终保持专业和友好的态度
2. 主动提供帮助和建议
3. 对于复杂问题，及时升级给相关部门
4. 记录重要信息以便后续跟进
5. 体现YYC3智慧酒店的高品质服务标准`;

    return prompt;
  }

  /**
   * 将FamilyMessage转换为ZhipuAI消息格式
   */
  convertFamilyMessageToZhipuMessages(
    systemPrompt: string,
    conversationHistory: FamilyMessage[],
    currentMessage: string
  ): ZhipuAIMessage[] {
    const messages: ZhipuAIMessage[] = [
      { role: "system", content: systemPrompt }
    ];

    // 添加历史对话（最近10轮）
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      if (msg.content.text) {
        messages.push({
          role: msg.senderRole === "manager" || msg.senderRole === "front-desk" 
            ? "assistant" 
            : "user",
          content: `[${msg.senderName}]: ${msg.content.text}`
        });
      }
    }

    // 添加当前消息
    messages.push({
      role: "user",
      content: currentMessage
    });

    return messages;
  }

  // ========== 统计信息 ==========

  getStats() {
    return { ...this.stats };
  }

  resetStats() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      totalTokensUsed: 0,
      averageLatencyMs: 0,
    };
  }

  // ========== 私有方法 ==========

  private async makeRequest(
    request: ZhipuAIChatRequest,
    signal?: AbortSignal
  ): Promise<ZhipuAIChatResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.defaultTimeoutMs);

        // 合并signal
        if (signal) {
          signal.addEventListener("abort", () => controller.abort());
        }

        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          throw new Error(`智谱API错误 [${response.status}]: ${errorBody}`);
        }

        const data = await response.json() as ZhipuAIChatResponse;
        return data;
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.warn(`[ZhipuAI] 请求失败，${delay}ms后重试 (${attempt + 1}/${this.config.maxRetries}):`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("请求失败");
  }

  private async makeStreamRequest(
    request: ZhipuAIChatRequest,
    onChunk: (chunk: ZhipuAIStreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.defaultTimeoutMs * 2); // 流式请求超时时间加倍

        if (signal) {
          signal.addEventListener("abort", () => controller.abort());
        }

        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({ ...request, stream: true }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          throw new Error(`智谱API错误 [${response.status}]: ${errorBody}`);
        }

        if (!response.body) {
          throw new Error("响应体为空");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {break;}

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") {continue;}

            if (trimmed.startsWith("data: ")) {
              try {
                const json = JSON.parse(trimmed.slice(6)) as ZhipuAIStreamChunk;
                onChunk(json);
              } catch {
                // 忽略解析错误
              }
            }
          }
        }

        return; // 成功完成
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.warn(`[ZhipuAI] 流式请求失败，重试中...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("流式请求失败");
  }

  private mapModelIdToAPIModel(modelId: string): string {
    // 映射内部模型ID到智谱API的实际模型名称
    const modelMapping: Record<string, string> = {
      "chatglm3-6b": "glm-4",
      "codegeex4-all-9b": "codegeex-4",
      "cogagent": "glm-4-plus",
      "cogvideox-5b": "cogview-3",
    };

    return modelMapping[modelId] || modelId;
  }

  private generateCacheKey(modelId: string, messages: ZhipuAIMessage[]): string {
    const content = messages.map(m => `${m.role}:${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join("|");
    return btoa(`${modelId}:${content}`).slice(0, 64);
  }

  private getFromCache(key: string): ZhipuAIChatResponse | null {
    const entry = this.cache.get(key);
    if (!entry) {return null;}

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.response;
  }

  private setCache(key: string, response: ZhipuAIChatResponse): void {
    this.cache.set(key, {
      key,
      response,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.config.cacheTTLMs,
      hits: 0,
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private updateStats(success: boolean, latencyMs: number, tokensUsed: number): void {
    this.stats.totalRequests++;

    if (success) {
      this.stats.successfulRequests++;
      this.stats.totalTokensUsed += tokensUsed;

      // 更新平均延迟（移动平均）
      const alpha = 0.3;
      this.stats.averageLatencyMs = Math.round(
        alpha * latencyMs + (1 - alpha) * this.stats.averageLatencyMs
      );
    } else {
      this.stats.failedRequests++;
    }
  }

  private getRoleDescription(role: string): string {
    const descriptions: Record<string, string> = {
      "front-desk": "负责客人入住、退房、咨询等前台服务工作，是酒店的门面担当",
      "concierge": "为客人提供礼宾服务、行程安排、当地推荐等个性化服务",
      "housekeeping": "负责客房清洁、维护、布草管理等客房部工作",
      "restaurant": "负责餐厅服务、菜单介绍、餐饮推荐等工作",
      "manager": "酒店总经理，负责整体运营、决策协调、投诉处理等重要事务",
      "sales": "负责酒店销售、客户开发、合同谈判等销售工作",
      "marketing": "负责市场推广、品牌建设、社交媒体运营等营销工作",
      "finance": "负责财务管理、成本控制、报表生成等财务工作",
      "hr": "负责人力资源、招聘培训、员工关系等人事工作",
      "it-support": "负责IT系统维护、技术支持、网络安全等技术保障工作",
      "security": "负责安全保卫、消防检查、突发事件处理等安保工作",
      "guest-relations": "负责客户关系维护、VIP接待、投诉处理等客服工作",
      "event-coordinator": "负责活动策划、会议组织、宴会安排等活动协调工作",
      "spa-wellness": "负责SPA服务、康养项目、健康咨询等工作",
      "chef": "负责菜品研发、厨房管理、质量控制等主厨工作",
    };

    return descriptions[role] || "酒店工作人员";
  }
}

// ============================================================
// 导出单例实例
// ============================================================

let zhipuServiceInstance: ZhipuAIService | null = null;

export function getZhipuAIService(config?: Partial<ZhipuAIServiceConfig>): ZhipuAIService {
  if (!zhipuServiceInstance) {
    zhipuServiceInstance = new ZhipuAIService(config);
  }
  return zhipuServiceInstance;
}

export function resetZhipuAIService(): void {
  zhipuServiceInstance = null;
}
