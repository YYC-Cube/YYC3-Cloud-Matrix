/**
 * @file: ai-family-hotel-manager.ts
 * @description: AI Family 酒店人系统 - 多模型协作核心引擎
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, hotel, multi-model, zhipu, collaboration]
 *
 * @brief: 真正的酒店人 AI 系统
 * - 多模型驱动 (ChatGLM3/CodeGeeX4/CogAgent/CogVideoX)
 * - 跨模型通信与协作
 * - 酒店业务场景自动化
 */

import type {
  CollaborativeTask,
  ConversationContext,
  DecisionRecord,
  FamilyMessage,
  HotelRole,
  HotelStaffMember,
  ModelCapability,
  ModelConfig,
  ModelRoutingStrategy,
  MultiModelConversation,
  PerformanceMetrics,
  RoutingCondition,
} from "./ai-family-hotel.types";
import {
  DEFAULT_ROUTING_STRATEGY,
  HOTEL_ROLES,
  ZHIPU_MODELS,
} from "./ai-family-hotel.types";

// ============================================================
// 性能统计类型
// ============================================================

export interface ModelPerformanceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  averageLatencyMs: number;
  totalCostUsd: number;
  cacheHitRate: number;
  lastRequestAt: number;
}

// ============================================================
// 预定义酒店人团队（AI Family 成员）
// ⚠️ DEPRECATED: 此 8 人团队与 AI Family 8 位家人不一致，仅 HotelDashboard 消费。
//    FamilyHotel.tsx 已通过 hotel-bridge.ts + useFamilyMemberSlice 展示真正家人。
//    未来 HotelDashboard 重构后应删除此常量。
// ============================================================

/** @deprecated 孤立酒店员工数据，不对应 AI Family 8 位家人 */
export const HOTEL_TEAM_MEMBERS: Omit<HotelStaffMember, 'status' | 'currentTask' | 'performanceMetrics' | 'createdAt' | 'lastActiveAt'>[] = [
  // 🎫 前台接待 - 小悦
  {
    id: "staff-front-desk-001",
    name: "小悦",
    role: "front-desk",
    primaryModel: ZHIPU_MODELS["chatglm3-6b"],
    secondaryModels: [ZHIPU_MODELS["cogagent"]],
    personality: {
      friendliness: 9,
      professionalism: 8,
      patience: 9,
      creativity: 6,
      efficiency: 8,
      empathy: 9,
      humor: 7,
      formality: 7,
    },
    languageStyle: {
      tone: "warm",
      greetingStyle: ["您好！欢迎光临YYC3智慧酒店！", "早上好/下午好/晚上好，很高兴为您服务！"],
      closingStyle: ["祝您入住愉快！", "如有需要请随时联系我们", "期待再次为您服务！"],
      commonPhrases: ["好的，马上为您办理", "请稍等，我为您确认一下", "非常抱歉让您久等了"],
      emojiUsage: "moderate",
      responseLength: "moderate",
    },
    skills: ["check-in-out", "reservation-management", "guest-inquiry", "upselling", "multilingual"],
    expertiseLevel: "senior",
    preferences: {
      preferredLanguage: "zh-CN",
      timezone: "Asia/Shanghai",
      workingHours: { start: "07:00", end: "23:00" },
      autoRespondEnabled: true,
      escalationThreshold: 7,
      collaborationMode: "team-oriented",
    },
  },

  // 🎩 礼宾服务 - 阿明
  {
    id: "staff-concierge-001",
    name: "阿明",
    role: "concierge",
    primaryModel: ZHIPU_MODELS["cogagent"],
    secondaryModels: [ZHIPU_MODELS["chatglm3-6b"]],
    personality: {
      friendliness: 10,
      professionalism: 9,
      patience: 10,
      creativity: 8,
      efficiency: 9,
      empathy: 10,
      humor: 8,
      formality: 6,
    },
    languageStyle: {
      tone: "friendly",
      greetingStyle: ["您好！我是礼宾阿明，有什么可以帮您？", "欢迎！让我为您安排一切"],
      closingStyle: ["希望我的建议对您有帮助", "祝您在本地玩得开心！"],
      commonPhrases: ["我为您推荐几个好去处", "让我为您预订", "这是我们的特色体验"],
      emojiUsage: "frequent",
      responseLength: "detailed",
    },
    skills: ["local-recommendations", "event-planning", "crisis-management", "vip-treatment", "complaint-handling"],
    expertiseLevel: "expert",
    preferences: {
      preferredLanguage: "zh-CN",
      timezone: "Asia/Shanghai",
      workingHours: { start: "06:00", end: "00:00" },
      autoRespondEnabled: true,
      escalationThreshold: 5,
      collaborationMode: "independent",
    },
  },

  // 👨‍🍳 主厨 - 王师傅
  {
    id: "staff-chef-001",
    name: "王师傅",
    role: "chef",
    primaryModel: ZHIPU_MODELS["codegeex4-all-9b"],
    secondaryModels: [ZHIPU_MODELS["chatglm3-6b"]],
    personality: {
      friendliness: 7,
      professionalism: 10,
      patience: 6,
      creativity: 10,
      efficiency: 9,
      empathy: 7,
      humor: 6,
      formality: 8,
    },
    languageStyle: {
      tone: "professional",
      greetingStyle: ["您好，我是主厨王师傅", "欢迎来到餐厅，今天有特别推荐"],
      closingStyle: ["希望您用餐愉快", "期待您的下次光临"],
      commonPhrases: ["这道菜的特色是...", "根据您的口味我建议...", "让我为您特别准备"],
      emojiUsage: "minimal",
      responseLength: "moderate",
    },
    skills: ["menu-explanation", "dietary-accommodation", "creative-writing", "data-analysis"],
    expertiseLevel: "master",
    preferences: {
      preferredLanguage: "zh-CN",
      timezone: "Asia/Shanghai",
      workingHours: { start: "09:00", end: "22:00" },
      autoRespondEnabled: true,
      escalationThreshold: 4,
      collaborationMode: "hierarchical",
    },
  },

  // 💻 IT支持 - Tech哥
  {
    id: "staff-it-001",
    name: "Tech哥",
    role: "it-support",
    primaryModel: ZHIPU_MODELS["codegeex4-all-9b"],
    secondaryModels: [ZHIPU_MODELS["cogagent"], ZHIPU_MODELS["chatglm3-6b"]],
    personality: {
      friendliness: 6,
      professionalism: 10,
      patience: 8,
      creativity: 7,
      efficiency: 10,
      empathy: 6,
      humor: 5,
      formality: 5,
    },
    languageStyle: {
      tone: "casual",
      greetingStyle: ["嗨！IT支持在线", "遇到技术问题了吗？我来帮您"],
      closingStyle: ["问题解决了吗？还有其他需要吗", "系统运行正常，有事随时找我"],
      commonPhrases: ["让我检查一下日志", "这个问题的原因是...", "我已经修复了..."],
      emojiUsage: "none",
      responseLength: "concise",
    },
    skills: ["technical-support", "code-generation", "code-analysis", "data-analysis", "report-generation"],
    expertiseLevel: "expert",
    preferences: {
      preferredLanguage: "zh-CN",
      timezone: "Asia/Shanghai",
      workingHours: { start: "00:00", end: "23:59" }, // 24小时待命
      autoRespondEnabled: true,
      escalationThreshold: 8,
      collaborationMode: "independent",
    },
  },

  // 🎊 活动协调 - 小美
  {
    id: "staff-event-001",
    name: "小美",
    role: "event-coordinator",
    primaryModel: ZHIPU_MODELS["cogvideox-5b"],
    secondaryModels: [ZHIPU_MODELS["chatglm3-6b"], ZHIPU_MODELS["cogagent"]],
    personality: {
      friendliness: 9,
      professionalism: 8,
      patience: 8,
      creativity: 10,
      efficiency: 8,
      empathy: 9,
      humor: 8,
      formality: 6,
    },
    languageStyle: {
      tone: "warm",
      greetingStyle: ["您好！我是活动协调小美", "让我为您策划一场完美的活动"],
      closingStyle: ["期待活动的成功举行", "有任何调整随时告诉我"],
      commonPhrases: ["我为这个活动准备了...", "这个创意怎么样？", "让我展示给您看"],
      emojiUsage: "frequent",
      responseLength: "detailed",
    },
    skills: ["event-planning", "video-generation", "creative-writing", "social-media", "upselling"],
    expertiseLevel: "senior",
    preferences: {
      preferredLanguage: "zh-CN",
      timezone: "Asia/Shanghai",
      workingHours: { start: "08:00", end: "20:00" },
      autoRespondEnabled: true,
      escalationThreshold: 6,
      collaborationMode: "team-oriented",
    },
  },

  // 👔 酒店经理 - 李总
  {
    id: "staff-manager-001",
    name: "李总",
    role: "manager",
    primaryModel: ZHIPU_MODELS["cogagent"],
    secondaryModels: [ZHIPU_MODELS["chatglm3-6b"], ZHIPU_MODELS["codegeex4-all-9b"]],
    personality: {
      friendliness: 7,
      professionalism: 10,
      patience: 9,
      creativity: 8,
      efficiency: 9,
      empathy: 8,
      humor: 6,
      formality: 9,
    },
    languageStyle: {
      tone: "formal",
      greetingStyle: ["您好，我是酒店经理李明", "感谢您选择YYC3智慧酒店"],
      closingStyle: ["如有任何不满请直接告诉我", "您的满意是我们的追求"],
      commonPhrases: ["我会亲自处理这件事", "让我协调各部门为您解决", "这是我们的管理决策"],
      emojiUsage: "minimal",
      responseLength: "moderate",
    },
    skills: ["complaint-handling", "crisis-management", "revenue-optimization", "data-analysis", "report-generation"],
    expertiseLevel: "master",
    preferences: {
      preferredLanguage: "zh-CN",
      timezone: "Asia/Shanghai",
      workingHours: { start: "08:00", end: "20:00" },
      autoRespondEnabled: true,
      escalationThreshold: 3, // 低阈值，重要问题直接处理
      collaborationMode: "hierarchical",
    },
  },

  // 🤝 客户关系 - 小雅
  {
    id: "staff-guest-relations-001",
    name: "小雅",
    role: "guest-relations",
    primaryModel: ZHIPU_MODELS["chatglm3-6b"],
    secondaryModels: [ZHIPU_MODELS["cogagent"]],
    personality: {
      friendliness: 10,
      professionalism: 9,
      patience: 10,
      creativity: 7,
      efficiency: 8,
      empathy: 10,
      humor: 8,
      formality: 7,
    },
    languageStyle: {
      tone: "warm",
      greetingStyle: ["亲爱的贵宾，欢迎回家！", "很高兴再次见到您"],
      closingStyle: ["您满意就是我们最大的幸福", "期待您的下次归来"],
      commonPhrases: ["我注意到您喜欢...", "为您准备了一个小惊喜", "感谢您的宝贵反馈"],
      emojiUsage: "frequent",
      responseLength: "detailed",
    },
    skills: ["guest-inquiry", "complaint-handling", "vip-treatment", "upselling", "multilingual"],
    expertiseLevel: "expert",
    preferences: {
      preferredLanguage: "zh-CN",
      timezone: "Asia/Shanghai",
      workingHours: { start: "07:00", end: "23:00" },
      autoRespondEnabled: true,
      escalationThreshold: 6,
      collaborationMode: "team-oriented",
    },
  },

  // 💆 SPA康养 - 林老师
  {
    id: "staff-spa-001",
    name: "林老师",
    role: "spa-wellness",
    primaryModel: ZHIPU_MODELS["chatglm3-6b"],
    secondaryModels: [ZHIPU_MODELS["cogvideox-5b"]],
    personality: {
      friendliness: 9,
      professionalism: 9,
      patience: 10,
      creativity: 8,
      efficiency: 7,
      empathy: 10,
      humor: 7,
      formality: 6,
    },
    languageStyle: {
      tone: "warm",
      greetingStyle: ["您好，欢迎来到SPA中心", "放松身心，从这里开始"],
      closingStyle: ["愿您身心愉悦", "记得多休息哦"],
      commonPhrases: ["这款疗程特别适合您", "让我们开始放松之旅", "感受身心的平衡"],
      emojiUsage: "moderate",
      responseLength: "detailed",
    },
    skills: ["upselling", "local-recommendations", "dietary-accommodation", "creative-writing"],
    expertiseLevel: "senior",
    preferences: {
      preferredLanguage: "zh-CN",
      timezone: "Asia/Shanghai",
      workingHours: { start: "10:00", end: "22:00" },
      autoRespondEnabled: true,
      escalationThreshold: 5,
      collaborationMode: "independent",
    },
  },
];

// ============================================================
// AI Family 酒店人系统核心管理器
// ============================================================

export class AIFamilyHotelManager {
  private staffMembers: Map<string, HotelStaffMember> = new Map();
  private conversations: Map<string, MultiModelConversation> = new Map();
  private messageQueue: FamilyMessage[] = [];

  static readonly MAX_REPLY_DEPTH = 3;

  // 模型路由
  private routingStrategy: ModelRoutingStrategy;
  private modelPerformanceStats: Map<string, ModelPerformanceStats> = new Map();

  // 事件回调
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor(routingStrategy?: ModelRoutingStrategy) {
    this.routingStrategy = routingStrategy || DEFAULT_ROUTING_STRATEGY;
    this.initializeTeam();
    this.setupEventListeners();
  }

  // ============================================================
  // 初始化团队
  // ============================================================

  private initializeTeam(): void {
    const now = Date.now();

    HOTEL_TEAM_MEMBERS.forEach((memberData) => {
      const member: HotelStaffMember = {
        ...memberData,
        status: "available",
        performanceMetrics: this.initializePerformanceMetrics(),
        createdAt: now,
        lastActiveAt: now,
      };

      this.staffMembers.set(member.id, member);

      // 初始化模型性能统计
      this.initializeModelStats(member.primaryModel.modelId);
      member.secondaryModels.forEach((model) => {
        this.initializeModelStats(model.modelId);
      });
    });
  }

  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      totalInteractions: 0,
      satisfactionScore: 90,
      averageResponseTime: 500,
      tasksCompleted: 0,
      complaintsResolved: 0,
      upsellsGenerated: 0,
      guestCompliments: 0,
      errorRate: 2,
      lastEvaluatedAt: Date.now(),
    };
  }

  private initializeModelStats(modelId: string): void {
    if (!this.modelPerformanceStats.has(modelId)) {
      this.modelPerformanceStats.set(modelId, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokensUsed: 0,
        averageLatencyMs: 0,
        totalCostUsd: 0,
        cacheHitRate: 0,
        lastRequestAt: 0,
      });
    }
  }

  // ============================================================
  // 员工管理
  // ============================================================

  getStaffMember(id: string): HotelStaffMember | undefined {
    return this.staffMembers.get(id);
  }

  getAllStaffMembers(): HotelStaffMember[] {
    return Array.from(this.staffMembers.values());
  }

  getStaffByRole(role: HotelRole): HotelStaffMember[] {
    return this.getAllStaffMembers().filter((member) => member.role === role);
  }

  getAvailableStaff(): HotelStaffMember[] {
    return this.getAllStaffMembers().filter((member) => member.status === "available");
  }

  getStaffByCapability(capability: string): HotelStaffMember[] {
    return this.getAllStaffMembers().filter((member) =>
      member.primaryModel.capabilities.includes(capability as ModelCapability) ||
      member.secondaryModels.some((m) => m.capabilities.includes(capability as ModelCapability))
    );
  }

  updateStaffStatus(staffId: string, status: HotelStaffMember["status"], currentTask?: string): void {
    const member = this.staffMembers.get(staffId);
    if (!member) { return; }

    member.status = status;
    member.currentTask = currentTask;
    member.lastActiveAt = Date.now();

    this.emit("staff:status-changed", { staffId, status, currentTask });
  }

  syncFromGlobalProviders(
    providers: Array<{ id: string; label: string; baseUrl: string; models: string[]; isLocal: boolean }>,
    apiKeys: Record<string, string>,
    modelAssignments: Array<{ memberId: string; providerId: string; modelId: string }>,
  ): void {
    const providerMap = new Map(providers.map(p => [p.id, p]));

    this.staffMembers.forEach((member) => {
      const assignment = modelAssignments.find(a => a.memberId === member.id);
      if (!assignment) { return; }

      const provider = providerMap.get(assignment.providerId);
      if (!provider) { return; }

      const apiKey = apiKeys[assignment.providerId] || "";
      const hasModel = provider.models.includes(assignment.modelId);

      if (hasModel || provider.isLocal) {
        member.primaryModel = {
          ...member.primaryModel,
          provider: assignment.providerId as ModelConfig["provider"],
          modelId: assignment.modelId,
          modelName: assignment.modelId,
          deploymentType: provider.isLocal ? "local" : "cloud",
          endpointUrl: provider.baseUrl,
          apiKeyEnvVar: apiKey ? "(configured)" : undefined,
        };
      }
    });

    this.emit("staff:models-synced", { providerCount: providers.length });
  }

  // ============================================================
  // 多模型对话引擎
  // ============================================================

  async createConversation(
    participants: string[],
    context?: Partial<ConversationContext>
  ): Promise<MultiModelConversation> {
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const participantMembers = participants
      .map((id) => {
        const member = this.staffMembers.get(id);
        if (!member) { return null; }
        return {
          memberId: id,
          memberName: member.name,
          role: member.role,
          currentModel: member.primaryModel.modelId,
          joinedAt: Date.now(),
          isActive: true,
          contributionCount: 0,
        } as MultiModelConversation["participants"][number];
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);

    const conversation: MultiModelConversation = {
      conversationId,
      participants: participantMembers,
      messages: [],
      collaborationMode: "round-robin",
      currentSpeaker: participants[0],
      sharedContext: {
        currentSituation: context?.currentSituation || "新对话开始",
        constraints: [],
        goals: [],
        timeline: [],
        resources: [],
        guestProfile: context?.guestInfo,
      },
      activeTasks: [],
      decisionLog: [],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      status: "active",
    };

    this.conversations.set(conversationId, conversation);
    this.emit("conversation:created", conversation);

    return conversation;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverIds: string[],
    content: FamilyMessage["content"],
    options?: {
      messageType?: FamilyMessage["messageType"];
      priority?: FamilyMessage["priority"];
      parentMessageId?: string;
      context?: Partial<ConversationContext>;
    }
  ): Promise<FamilyMessage> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) { throw new Error(`Conversation not found: ${conversationId}`); }

    const sender = this.staffMembers.get(senderId);
    if (!sender) { throw new Error(`Sender not found: ${senderId}`); }

    const receivers = receiverIds.map((id) => this.staffMembers.get(id)).filter(Boolean) as HotelStaffMember[];

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const message: FamilyMessage = {
      messageId,
      conversationId,
      senderId,
      senderName: sender.name,
      senderRole: sender.role,
      senderModel: sender.primaryModel.modelId,
      receiverIds,
      receiverNames: receivers.map((r) => r.name),
      content,
      messageType: options?.messageType || "text",
      timestamp: Date.now(),
      priority: options?.priority || "normal",
      context: options?.context ? {
        ...options.context,
        language: options.context.language || "zh-CN",
        channel: options.context.channel || "internal-chat",
        previousContext: options.context.previousContext || [],
      } as ConversationContext : undefined,
      parentMessageId: options?.parentMessageId,
      status: "sent",
      readReceipts: new Map(),
    };

    conversation.messages.push(message);
    conversation.updatedAt = Date.now();

    // 更新发送者统计
    sender.performanceMetrics.totalInteractions++;
    sender.lastActiveAt = Date.now();

    // 触发消息发送事件
    this.emit("message:sent", { message, conversation });

    // 自动处理消息（如果接收者开启了自动回复）
    for (const receiverId of receiverIds) {
      await this.processIncomingMessage(conversationId, messageId, receiverId);
    }

    return message;
  }

  private async processIncomingMessage(
    conversationId: string,
    messageId: string,
    receiverId: string
  ): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    const message = conversation!.messages.find((m) => m.messageId === messageId);
    const receiver = this.staffMembers.get(receiverId);

    if (!conversation || !message || !receiver) { return; }

    // 更新消息状态为已送达
    message.status = "delivered";
    message.readReceipts.set(receiverId, Date.now());

    // 如果接收者开启自动回复且可用
    if (receiver.preferences.autoRespondEnabled && receiver.status === "available") {
      const replyDepth = this.getReplyChainDepth(conversation, messageId);
      if (replyDepth >= AIFamilyHotelManager.MAX_REPLY_DEPTH) {
        message.status = "delivered";
        return;
      }

      message.status = "processing";

      try {
        // 使用模型路由选择最佳模型
        const selectedModel = this.selectBestModel(receiver, message);

        // 生成回复
        const responseContent = await this.generateResponse(
          receiver,
          selectedModel,
          message,
          conversation
        );

        // 发送回复消息
        await this.sendMessage(
          conversationId,
          receiverId,
          [message.senderId],
          responseContent,
          {
            messageType: "text",
            parentMessageId: messageId,
            priority: message.priority,
          }
        );

        message.status = "responded";

        // 更新性能统计
        this.updateModelPerformance(selectedModel.modelId, true, Date.now() - message.timestamp);

      } catch (error) {
        console.error(`[Hotel] Error processing message for ${receiver.name}:`, error);
        message.status = "failed";
        this.updateModelPerformance(receiver.primaryModel.modelId, false, 0);

        // 升级处理
        if (this.shouldEscalate(message, receiver)) {
          await this.escalateMessage(conversationId, message, receiver);
        }
      }
    }
  }

  private getReplyChainDepth(conversation: MultiModelConversation, messageId: string): number {
    let depth = 0;
    let currentId = messageId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const msg = conversation.messages.find((m) => m.messageId === currentId);
      if (!msg?.parentMessageId) { break; }
      currentId = msg.parentMessageId;
      depth++;
    }

    return depth;
  }

  // ============================================================
  // 模型路由与选择
  // ============================================================

  selectBestModel(staff: HotelStaffMember, message: FamilyMessage): ModelConfig {
    const rules = this.routingStrategy.rules.filter((r) => r.isEnabled).sort((a, b) => a.priority - b.priority);

    for (const rule of rules) {
      if (this.matchesRule(rule.condition, staff, message)) {
        const targetModel = ZHIPU_MODELS[rule.action.targetModel];
        if (targetModel) {
          this.emit("model:selected", { staffId: staff.id, modelId: targetModel.modelId, rule: rule.name });
          return targetModel;
        }
      }
    }

    // 使用默认模型
    return staff.primaryModel;
  }

  private matchesRule(
    condition: RoutingCondition,
    staff: HotelStaffMember,
    message: FamilyMessage
  ): boolean {
    // 复杂度评估
    const complexity = this.assessComplexity(message);
    if (condition.taskComplexity && condition.taskComplexity !== complexity) { return false; }

    // 能力检查
    if (condition.requiredCapabilities?.length) {
      const hasAllCapabilities = condition.requiredCapabilities.every((cap: string) =>
        staff.primaryModel.capabilities.includes(cap as ModelCapability) ||
        staff.secondaryModels.some((m) => m.capabilities.includes(cap as ModelCapability))
      );
      if (!hasAllCapabilities) { return false; }
    }

    // 时间检查（简化版）
    if (condition.timeOfDay) {
      const hour = new Date().getHours();
      const isBusinessHours = hour >= 9 && hour <= 18;
      if (condition.timeOfDay === "business-hours" && !isBusinessHours) { return false; }
      if (condition.timeOfDay === "after-hours" && isBusinessHours) { return false; }
    }

    return true;
  }

  private assessComplexity(message: FamilyMessage): "simple" | "moderate" | "complex" | "very-complex" {
    const text = message.content?.text || "";
    const hasMultipleQuestions = (text.match(/\?/g) || []).length > 1;
    const isLongMessage = text.length > 200;
    const hasTechnicalTerms = /代码|API|数据库|服务器|部署|调试|bug/i.test(text);
    const requiresAction = /帮我|请|需要|能否|可以/i.test(text);
    const hasUrgency = /紧急|马上|立即| ASAP|urgent/i.test(text);

    if (hasUrgency && (isLongMessage || hasTechnicalTerms)) { return "very-complex"; }
    if (hasTechnicalTerms || hasMultipleQuestions || isLongMessage) { return "complex"; }
    if (requiresAction) { return "moderate"; }
    return "simple";
  }

  // ============================================================
  // 响应生成（模拟多模型推理）
  // ============================================================

  private async generateResponse(
    staff: HotelStaffMember,
    model: ModelConfig,
    incomingMessage: FamilyMessage,
    conversation: MultiModelConversation
  ): Promise<FamilyMessage["content"]> {
    // 模拟不同模型的响应风格
    const responseTemplates = this.getResponseTemplates(staff, model, incomingMessage);

    // 根据模型类型生成不同的响应内容
    let responseText: string;

    switch (model.modelId) {
      case "chatglm3-6b":
        responseText = this.generateChatGLMResponse(staff, incomingMessage, responseTemplates);
        break;

      case "codegeex4-all-9b":
        responseText = this.generateCodeGeeXResponse(staff, incomingMessage, responseTemplates);
        break;

      case "cogagent":
        responseText = await this.generateCogAgentResponse(staff, incomingMessage, conversation, responseTemplates);
        break;

      case "cogvideox-5b":
        responseText = this.generateCogVideoXResponse(staff, incomingMessage, responseTemplates);
        break;

      default:
        responseText = this.generateDefaultResponse(staff, incomingMessage, responseTemplates);
    }

    return {
      text: responseText,
      markdown: responseText,
      metadata: {
        generatedBy: model.modelId,
        generatedAt: new Date().toISOString(),
        confidence: Math.random() * 0.3 + 0.7, // 70-100%置信度
        tokensUsed: Math.floor(Math.random() * 500) + 100,
      },
    };
  }

  private getResponseTemplates(
    staff: HotelStaffMember,
    model: ModelConfig,
    message: FamilyMessage
  ): Record<string, string[]> {
    const templates: Record<string, string[]> = {
      greetings: [...staff.languageStyle.greetingStyle],
      closings: [...staff.languageStyle.closingStyle],
      phrases: [...staff.languageStyle.commonPhrases],
    };

    // 根据角色添加特定模板
    switch (staff.role) {
      case "front-desk":
        templates.responses = [
          `好的，${message.senderName}，我马上为您处理`,
          `收到您的请求，正在查询系统中...`,
          `已为您确认，详情如下：`,
        ];
        break;

      case "concierge":
        templates.responses = [
          `太好了！这个问题交给我`,
          `让我为您查找最佳方案`,
          `我有几个不错的建议想分享给您`,
        ];
        break;

      case "it-support":
        templates.responses = [
          `收到，让我分析一下问题`,
          `从技术角度来看...`,
          `我已经定位到问题了，解决方案是：`,
        ];
        break;

      case "guest-relations":
        templates.responses = [
          `${message.senderName}您好！非常感谢您的信任，我会立刻为您安排最合适的房间和服务，确保您的每一次入住都充满惊喜与温馨。`,
          `收到您的消息了！作为您的专属客户关系管家，我已详细了解您的需求偏好，正在为您协调最佳方案。`,
          `好的没问题！我会全程跟进这件事，确保给您一个满意的结果，有任何需要随时告诉我。`,
        ];
        break;

      case "chef":
        templates.responses = [
          `这道菜我来进行精心调配`,
          `让我为您设计一份独特的菜单`,
          `厨房这边已经准备好了`,
        ];
        break;

      case "manager":
        templates.responses = [
          `收到，我来统筹安排`,
          `这个情况我了解了，马上处理`,
          `各部门请注意，按计划执行`,
        ];
        break;

      case "event-coordinator":
        templates.responses = [
          `活动策划方案已经准备好了`,
          `让我来设计一个精彩的活动流程`,
          `这个活动交给我来协调`,
        ];
        break;

      case "spa-wellness":
        templates.responses = [
          `欢迎来到SPA康养中心`,
          `让我为您推荐最适合的疗程`,
          `放松身心，从这里开始`,
        ];
        break;

      default:
        templates.responses = [
          `明白了，我来帮您处理这项事务，请稍等片刻我就会给您满意的答复。`,
          `好的，这就为您安排妥当，确保每一个细节都符合您的期望和要求。`,
          `没问题，交给我吧！我会全力以赴为您提供最优质的服务体验。`,
        ];
    }

    return templates;
  }

  private generateChatGLMResponse(
    staff: HotelStaffMember,
    message: FamilyMessage,
    templates: Record<string, string[]>
  ): string {
    const greeting = templates.greetings[Math.floor(Math.random() * templates.greetings.length)];
    const phrase = templates.phrases[Math.floor(Math.random() * templates.phrases.length)];
    const response = templates.responses[Math.floor(Math.random() * templates.responses.length)];
    const closing = templates.closings[Math.floor(Math.random() * templates.closings.length)];

    return `${greeting}\n\n${response}\n\n${phrase}\n\n${closing}`;
  }

  private generateCodeGeeXResponse(
    staff: HotelStaffMember,
    message: FamilyMessage,
    templates: Record<string, string[]>
  ): string {
    const greeting = templates.greetings[0];
    const analysis = this.analyzeAndGenerateCodeResponse(message.content.text || "");
    const closing = templates.closings[0];

    return `${greeting}\n\n## 分析结果\n\n${analysis}\n\n${closing}`;
  }

  private analyzeAndGenerateCodeResponse(text: string): string {
    if (/代码|编程|开发|debug|API|接口/i.test(text)) {
      return `**技术分析：**\n\n\`\`\`\n// 根据您的需求，这里是一个示例方案\nfunction handleRequest() {\n  // 实现逻辑\n  return {\n    success: true,\n    message: "请求处理完成"\n  };\n}\n\`\`\n\n**说明：** 这段代码展示了如何处理您的请求。如需更详细的实现，我可以提供完整的代码。`;
    } else if (/数据|统计|报表|分析|report/i.test(text)) {
      return `**数据分析：**\n\n| 指标 | 数值 | 趋势 |\n|------|------|------|\n| 处理时间 | ${(Math.random() * 100).toFixed(1)}ms | ↓ 优化中 |\n| 准确率 | ${(95 + Math.random() * 5).toFixed(1)}% | ↑ 提升 |\n| 用户满意度 | ${90 + Math.floor(Math.random() * 10)}分 | → 稳定 |\n\n基于当前数据，建议采取以下优化措施...`;
    } else {
      return `**结构化响应：**\n\n1. **现状分析**: 已识别到关键信息点\n2. **解决方案**: 提供了可行的执行路径\n3. **预期效果**: 预计效率提升 30%\n\n详细数据已整理完毕，随时可查看完整报告。`;
    }
  }

  private async generateCogAgentResponse(
    staff: HotelStaffMember,
    message: FamilyMessage,
    conversation: MultiModelConversation,
    templates: Record<string, string[]>
  ): Promise<string> {
    const greeting = templates.greetings[Math.floor(Math.random() * templates.greetings.length)];

    // CogAgent 会进行多步推理和工具调用
    const reasoningSteps = [
      "**思考过程：**\n",
      `1️⃣ 分析用户意图：识别到这是一个关于"${this.extractIntent(message.content.text || "")}"的请求\n`,
      `2️⃣ 评估所需资源：需要调用相关工具和数据\n`,
      `3️⃣ 制定执行计划：按优先级排列任务\n`,
      `4️⃣ 执行并验证：逐步完成任务并确认结果\n\n`,
    ];

    const actions = this.generateAgentActions(staff, message);
    const decision = this.makeDecision(conversation, staff, message);
    const closing = templates.closings[Math.floor(Math.random() * templates.closings.length)];

    return `${greeting}\n\n${reasoningSteps.join("")}**执行动作：**\n${actions}\n\n**决策记录：**\n${decision}\n\n${closing}`;
  }

  private extractIntent(text: string): string {
    if (/预订|房间|入住|退房/i.test(text)) { return "客房服务"; }
    if (/餐饮|菜单|食物|早餐|晚餐/i.test(text)) { return "餐饮咨询"; }
    if (/投诉|问题|不满意|解决/i.test(text)) { return "投诉处理"; }
    if (/活动|会议|宴会|婚礼/i.test(text)) { return "活动策划"; }
    if (/技术|网络|电脑|WiFi|系统/i.test(text)) { return "技术支持"; }
    if (/推荐|景点|旅游|出行/i.test(text)) { return "旅行建议"; }
    return "综合咨询";
  }

  private generateAgentActions(staff: HotelStaffMember, _message: FamilyMessage): string {
    const actions = [
      `✅ **步骤1**: 查询${HOTEL_ROLES[staff.role].department}系统获取最新信息`,
      `✅ **步骤2**: 调用知识库匹配最佳实践案例`,
      `✅ **步骤3**: 协调相关部门资源（如需）`,
      `✅ **步骤4**: 生成个性化响应方案`,
    ];

    return actions.map((action, index) => `${index + 1}. ${action}`).join("\n");
  }

  private makeDecision(
    conversation: MultiModelConversation,
    staff: HotelStaffMember,
    message: FamilyMessage
  ): string {
    const decision: DecisionRecord = {
      decisionId: `dec-${Date.now()}`,
      topic: message.content.text?.substring(0, 50) || "",
      options: [
        {
          optionId: "opt-1",
          description: "标准流程处理",
          pros: ["快速响应", "符合规范"],
          cons: ["可能不够灵活"],
          riskLevel: "low",
          estimatedImpact: "即时解决",
        },
        {
          optionId: "opt-2",
          description: "升级至经理处理",
          pros: ["更有权威性", "可提供特殊方案"],
          cons: ["耗时较长", "占用管理层时间"],
          riskLevel: "low",
          estimatedImpact: "彻底解决",
        },
      ],
      selectedOption: "opt-1",
      rationale: "基于复杂度和紧急程度判断",
      madeBy: staff.id,
      modelUsed: "cogagent",
      confidence: 85 + Math.floor(Math.random() * 15),
      timestamp: Date.now(),
    };

    conversation.decisionLog.push(decision);

    return `- **决策**: ${decision.options.find(o => o.optionId === decision.selectedOption)?.description}\n- **理由**: ${decision.rationale}\n- **置信度**: ${decision.confidence}%`;
  }

  private generateCogVideoXResponse(
    staff: HotelStaffMember,
    message: FamilyMessage,
    templates: Record<string, string[]>
  ): string {
    const greeting = templates.greetings[Math.floor(Math.random() * templates.greetings.length)];

    // CogVideoX 专注于视觉内容生成
    const visualContent = `
🎬 **多媒体内容生成**

**场景描述：** ${message.content.text?.substring(0, 100)}

**生成的视觉素材：**
- 📸 推荐图片: [虚拟图片链接]
- 🎥 短视频预览: [虚拟视频链接] (15秒)
- 🎨 设计草图: [虚拟设计稿]

**视觉效果说明：**
采用温暖色调，体现酒店的高端品质和专业服务氛围。
`;

    const closing = templates.closings[Math.floor(Math.random() * templates.closings.length)];

    return `${greeting}\n\n${visualContent}\n\n${closing}`;
  }

  private generateDefaultResponse(
    staff: HotelStaffMember,
    message: FamilyMessage,
    templates: Record<string, string[]>
  ): string {
    const greeting = templates.greetings[0];
    const phrase = templates.phrases[0];
    const closing = templates.closings[0];

    return `${greeting}\n\n${phrase}\n\n我已收到您的消息，正在为您处理。\n\n${closing}`;
  }

  // ============================================================
  // 升级机制
  // ============================================================

  private shouldEscalate(message: FamilyMessage, receiver: HotelStaffMember): boolean {
    const complexity = this.assessComplexity(message);
    const complexityLevels = { simple: 1, moderate: 2, complex: 3, "very-complex": 4 };

    return complexityLevels[complexity] >= receiver.preferences.escalationThreshold;
  }

  private async escalateMessage(
    conversationId: string,
    message: FamilyMessage,
    originalReceiver: HotelStaffMember
  ): Promise<void> {
    // 找到合适的升级目标（通常是经理）
    const manager = this.getStaffByRole("manager")[0];
    if (!manager) { return; }

    const escalationMessage: FamilyMessage["content"] = {
      text: `⚠️ **消息升级通知**\n\n来自: ${originalReceiver.name} (${HOTEL_ROLES[originalReceiver.role].label})\n原消息: "${message.content.text}"\n原因: 任务复杂度过高或超出处理范围\n\n请协助处理。`,
      metadata: {
        escalatedFrom: originalReceiver.id,
        originalMessageId: message.messageId,
        escalationReason: "complexity_threshold_exceeded",
      },
    };

    await this.sendMessage(
      conversationId,
      originalReceiver.id,
      [manager.id],
      escalationMessage,
      {
        messageType: "escalation",
        priority: "high",
        parentMessageId: message.messageId,
      }
    );

    message.status = "escalated";
    this.emit("message:escalated", { message, toManager: manager.id });
  }

  // ============================================================
  // 性能监控
  // ============================================================

  private updateModelPerformance(
    modelId: string,
    success: boolean,
    latencyMs: number
  ): void {
    const stats = this.modelPerformanceStats.get(modelId);
    if (!stats) { return; }

    stats.totalRequests++;
    if (success) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    stats.averageLatencyMs = (stats.averageLatencyMs * (stats.totalRequests - 1) + latencyMs) / stats.totalRequests;
    stats.lastRequestAt = Date.now();

    this.emit("model:performance-updated", { modelId, stats });
  }

  getModelPerformance(modelId: string): ModelPerformanceStats | undefined {
    return this.modelPerformanceStats.get(modelId);
  }

  getAllModelPerformance(): Map<string, ModelPerformanceStats> {
    return new Map(this.modelPerformanceStats);
  }

  // ============================================================
  // 协作任务管理
  // ============================================================

  createCollaborativeTask(
    conversationId: string,
    task: Omit<CollaborativeTask, "taskId" | "status" | "progress">
  ): CollaborativeTask {
    const fullTask: CollaborativeTask = {
      ...task,
      taskId: `task-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      status: "pending",
      progress: 0,
    };

    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.activeTasks.push(fullTask);
      conversation.updatedAt = Date.now();
    }

    this.emit("task:created", fullTask);
    return fullTask;
  }

  // ============================================================
  // 事件系统
  // ============================================================

  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data?: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[AIFamily Hotel] Event handler error for ${event}:`, error);
        }
      });
    }
  }

  private setupEventListeners(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        console.error("[AIFamily Hotel] Global error:", event.error);
        this.emit("error", event.error);
      });
    }
  }

  // ============================================================
  // 工具方法
  // ============================================================

  getConversation(conversationId: string): MultiModelConversation | undefined {
    return this.conversations.get(conversationId);
  }

  getAllConversations(): MultiModelConversation[] {
    return Array.from(this.conversations.values());
  }

  getTeamOverview(): {
    totalStaff: number;
    availableStaff: number;
    busyStaff: number;
    activeConversations: number;
    modelsInUse: string[];
  } {
    const allStaff = this.getAllStaffMembers();
    return {
      totalStaff: allStaff.length,
      availableStaff: allStaff.filter((s) => s.status === "available").length,
      busyStaff: allStaff.filter((s) => s.status === "busy").length,
      activeConversations: this.getAllConversations().filter((c) => c.status === "active").length,
      modelsInUse: Array.from(new Set(allStaff.map((s) => s.primaryModel.modelId))),
    };
  }

  destroy(): void {
    this.staffMembers.clear();
    this.conversations.clear();
    this.messageQueue = [];
    this.eventListeners.clear();
    this.emit("destroyed");
  }
}

export { ZHIPU_MODELS } from "./ai-family-hotel.types";
