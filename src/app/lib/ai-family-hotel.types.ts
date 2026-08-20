/**
 * @file: ai-family-hotel.types.ts
 * @description: AI Family 酒店人系统 - 多模型协作类型定义
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, hotel, multi-model, zhipu, chatglm]
 *
 * @brief: 真正的酒店人 AI 系统
 * - 多模型驱动架构 (ChatGLM/CogAgent/CodeGeeX/CogVideoX)
 * - 跨模型通信协议
 * - 酒店业务角色与技能体系
 */

// ============================================================
// 模型提供商定义
// ============================================================

export type ModelProvider =
  | "zhipu"           // 智谱AI
  | "deepseek"        // DeepSeek
  | "ollama"          // 本地 Ollama
  | "custom";         // 自定义模型

export interface ModelConfig {
  provider: ModelProvider;
  modelId: string;              // 模型标识符
  modelName: string;            // 模型显示名称
  version: string;              // 版本号
  
  // 能力标签
  capabilities: ModelCapability[];
  
  // 性能参数
  maxTokens: number;
  contextWindow: number;        // 上下文窗口大小
  
  // 推理参数
  defaultTemperature: number;
  maxRetries: number;
  timeoutMs: number;
  
  // 成本信息
  costPerInputToken?: number;    // 输入token成本
  costPerOutputToken?: number;   // 输出token成本
  
  // 部署信息
  deploymentType: "cloud" | "local" | "hybrid";
  endpointUrl?: string;
  apiKeyEnvVar?: string;         // API Key 环境变量名
  
  // 特殊配置
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
  supportsCodeExecution: boolean;
}

export type ModelCapability =
  | "chat"               // 对话能力
  | "code-generation"    // 代码生成
  | "code-analysis"      // 代码分析
  | "reasoning"          // 推理能力
  | "agent"              // 智能体能力
  | "vision"            // 视觉理解
  | "video-generation"   // 视频生成
  | "video-understanding"// 视频理解
  | "math"              // 数学计算
  | "translation"       // 翻译
  | "creative-writing"  // 创意写作
  | "data-analysis"     // 数据分析
  | "tool-use"          // 工具使用
  | "multi-modal";      // 多模态

// ============================================================
// 预定义的智谱AI模型配置
// ⚠️ DEPRECATED: 仅 ai-family-hotel-manager 及其测试使用，不对应 provider-slice 的模型体系。
// ============================================================

/** @deprecated 仅酒店管理器使用，不对应 provider-slice 的模型体系 */
export const ZHIPU_MODELS: Record<string, ModelConfig> = {
  "chatglm3-6b": {
    provider: "zhipu",
    modelId: "chatglm3-6b",
    modelName: "ChatGLM3-6B",
    version: "3.0",
    capabilities: ["chat", "reasoning", "translation", "creative-writing"],
    maxTokens: 8192,
    contextWindow: 32768,
    defaultTemperature: 0.7,
    maxRetries: 3,
    timeoutMs: 30000,
    deploymentType: "local",
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    supportsCodeExecution: false,
  },
  
  "codegeex4-all-9b": {
    provider: "zhipu",
    modelId: "codegeex4-all-9b",
    modelName: "CodeGeeX4-ALL-9B",
    version: "4.0",
    capabilities: ["code-generation", "code-analysis", "reasoning", "translation"],
    maxTokens: 16384,
    contextWindow: 65536,
    defaultTemperature: 0.2,
    maxRetries: 3,
    timeoutMs: 60000,
    deploymentType: "local",
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    supportsCodeExecution: true,
  },

  "cogagent": {
    provider: "zhipu",
    modelId: "cogagent",
    modelName: "CogAgent",
    version: "2.0",
    capabilities: ["agent", "reasoning", "tool-use", "data-analysis"],
    maxTokens: 4096,
    contextWindow: 16384,
    defaultTemperature: 0.8,
    maxRetries: 5,
    timeoutMs: 120000,
    deploymentType: "local",
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    supportsCodeExecution: true,
  },

  "cogvideox-5b": {
    provider: "zhipu",
    modelId: "cogvideox-5b",
    modelName: "CogVideoX-5B",
    version: "1.0",
    capabilities: ["video-generation", "video-understanding", "vision"],
    maxTokens: 2048,
    contextWindow: 8192,
    defaultTemperature: 0.9,
    maxRetries: 2,
    timeoutMs: 180000,
    deploymentType: "local",
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    supportsCodeExecution: false,
  },
};

// ============================================================
// 酒店人角色定义
// ============================================================

export type HotelRole =
  | "front-desk"        // 前台接待
  | "concierge"         // 礼宾服务
  | "housekeeping"      // 客房服务
  | "restaurant"        // 餐饮服务
  | "manager"           // 酒店经理
  | "sales"             // 销售经理
  | "marketing"         // 市场营销
  | "finance"           // 财务管理
  | "hr"                // 人力资源
  | "it-support"        // IT支持
  | "security"          // 安全保卫
  | "guest-relations"   // 客户关系
  | "event-coordinator" // 活动协调
  | "spa-wellness"      // SPA康养
  | "chef"              // 主厨;

export interface HotelStaffMember {
  id: string;
  name: string;
  role: HotelRole;
  
  // AI 配置
  primaryModel: ModelConfig;
  secondaryModels: ModelConfig[];     // 备选模型
  
  // 个性特征
  personality: PersonalityTraits;
  languageStyle: LanguageStyle;
  
  // 专业技能
  skills: HotelSkill[];
  expertiseLevel: ExpertiseLevel;
  
  // 工作状态
  status: StaffStatus;
  currentTask?: string;
  
  // 统计数据
  performanceMetrics: PerformanceMetrics;
  
  // 偏好设置
  preferences: StaffPreferences;
  
  // 时间戳
  createdAt: number;
  lastActiveAt: number;
}

export interface PersonalityTraits {
  friendliness: number;        // 0-10 友好度
  professionalism: number;    // 0-10 专业性
  patience: number;           // 0-10 耐心程度
  creativity: number;         // 0-10 创造力
  efficiency: number;         // 0-10 效率
  empathy: number;            // 0-10 同理心
  humor: number;              // 0-10 幽默感
  formality: number;          // 0-10 正式程度
}

export interface LanguageStyle {
  tone: "formal" | "casual" | "warm" | "professional" | "friendly";
  greetingStyle: string[];
  closingStyle: string[];
  commonPhrases: string[];
  emojiUsage: "none" | "minimal" | "moderate" | "frequent";
  responseLength: "concise" | "moderate" | "detailed";
}

export type HotelSkill =
  | "check-in-out"
  | "reservation-management"
  | "guest-inquiry"
  | "complaint-handling"
  | "upselling"
  | "local-recommendations"
  | "multilingual"
  | "crisis-management"
  | "event-planning"
  | "menu-explanation"
  | "dietary-accommodation"
  | "room-service"
  | "housekeeping-supervision"
  | "inventory-management"
  | "revenue-optimization"
  | "social-media"
  | "data-analysis"
  | "report-generation"
  | "technical-support"
  | "security-protocols"
  | "vip-treatment"
  | "creative-writing"
  | "code-generation"
  | "code-analysis"
  | "video-generation";

export type ExpertiseLevel = "trainee" | "junior" | "mid-level" | "senior" | "expert" | "master";

export type StaffStatus =
  | "available"
  | "busy"
  | "off-duty"
  | "training"
  | "on-break"
  | "meeting";

export interface PerformanceMetrics {
  totalInteractions: number;
  satisfactionScore: number;      // 0-100
  averageResponseTime: number;    // ms
  tasksCompleted: number;
  complaintsResolved: number;
  upsellsGenerated: number;
  guestCompliments: number;
  errorRate: number;              // 0-100
  lastEvaluatedAt: number;
}

export interface StaffPreferences {
  preferredLanguage: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  autoRespondEnabled: boolean;
  escalationThreshold: number;    // 复杂度阈值，超过则升级
  collaborationMode: "independent" | "team-oriented" | "hierarchical";
}

// ============================================================
// 对话消息类型
// ============================================================

export interface FamilyMessage {
  messageId: string;
  conversationId: string;
  
  // 发送者信息
  senderId: string;
  senderName: string;
  senderRole: HotelRole;
  senderModel: string;           // 使用的模型
  
  // 接收者信息
  receiverIds: string[];         // 可以发给多人
  receiverNames: string[];
  
  // 消息内容
  content: MessageContent;
  messageType: MessageType;
  
  // 元数据
  timestamp: number;
  priority: MessagePriority;
  context?: ConversationContext;
  
  // 追踪信息
  parentMessageId?: string;      // 回复的消息
  threadId?: string;             // 所属话题线程
  
  // 状态
  status: MessageStatus;
  readReceipts: Map<string, number>; // 各接收者的阅读时间
}

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "action-request"
  | "action-response"
  | "notification"
  | "escalation"
  | "handoff";

export interface MessageContent {
  text?: string;
  html?: string;
  markdown?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  fileUrl?: string;
  fileName?: string;
  metadata?: Record<string, unknown>;
  structuredData?: StructuredContent;
}

export interface StructuredContent {
  type: "reservation" | "order" | "complaint" | "request" | "report" | "schedule";
  data: Record<string, unknown>;
  schemaVersion: string;
}

export type MessagePriority = "low" | "normal" | "high" | "urgent" | "critical";

export type MessageStatus =
  | "sent"
  | "delivered"
  | "read"
  | "processing"
  | "responded"
  | "failed"
  | "escalated";

export interface ConversationContext {
  guestInfo?: GuestInformation;
  reservationDetails?: ReservationDetails;
  previousContext: string[];      // 前几轮对话摘要
  currentSituation?: string;     // 当前情境描述
  currentTask?: string;
  sentiment?: "positive" | "neutral" | "negative" | "frustrated";
  language: string;
  channel: CommunicationChannel;
}

export interface GuestInformation {
  guestId?: string;
  name: string;
  membershipTier: "regular" | "silver" | "gold" | "platinum" | "diamond" | "vip";
  stayHistory: StayRecord[];
  preferences: GuestPreferences;
  specialRequests: string[];
  notes: string;
}

export interface StayRecord {
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  roomType: string;
  purpose: string;
  rating?: number;
  feedback?: string;
}

export interface GuestPreferences {
  roomType: string;
  floorPreference: string;
  pillowType: string;
  dietaryRestrictions: string[];
  amenities: string[];
  communicationPreference: "phone" | "email" | "app" | "wechat";
  language: string;
}

export interface ReservationDetails {
  confirmationNumber: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  roomNumber?: string;
  rate: number;
  currency: string;
  specialRequests: string;
  status: "confirmed" | "checked-in" | "checked-out" | "cancelled" | "no-show";
}

export type CommunicationChannel =
  | "internal-chat"
  | "guest-facing"
  | "phone"
  | "email"
  | "wechat"
  | "app-notification"
  | "kiosk";

// ============================================================
// 多模型协作协议
// ============================================================

export interface MultiModelConversation {
  conversationId: string;
  participants: ConversationParticipant[];
  messages: FamilyMessage[];
  
  // 协作模式
  collaborationMode: CollaborationMode;
  currentSpeaker: string;
  
  // 上下文共享
  sharedContext: SharedContext;
  
  // 任务追踪
  activeTasks: CollaborativeTask[];
  
  // 决策记录
  decisionLog: DecisionRecord[];
  
  // 元数据
  startedAt: number;
  updatedAt: number;
  status: ConversationStatus;
  summary?: string;
}

export interface ConversationParticipant {
  memberId: string;
  memberName: string;
  role: HotelRole;
  currentModel: string;
  joinedAt: number;
  isActive: boolean;
  contributionCount: number;
}

export type CollaborationMode =
  | "round-robin"         // 轮流发言
  | "expert-led"          // 专家主导
  | "consensus"           // 共识决策
  | "parallel"            // 并行处理
  | "hierarchical"        // 层级决策
  | "democratic";         // 民主投票

export interface SharedContext {
  guestProfile?: GuestInformation;
  currentSituation: string;
  constraints: string[];
  goals: string[];
  timeline: TimelineEvent[];
  resources: ResourceAllocation[];
}

export interface TimelineEvent {
  eventId: string;
  timestamp: number;
  event: string;
  source: string;
  impact: "low" | "medium" | "high";
}

export interface ResourceAllocation {
  resourceType: "room" | "staff" | "equipment" | "budget" | "time";
  resourceId: string;
  quantity: number;
  assignedTo: string;
  status: "available" | "allocated" | "in-use" | "unavailable";
}

export interface CollaborativeTask {
  taskId: string;
  title: string;
  description: string;
  assignedTo: string[];
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: string[];
  progress: number;
  subtasks: Subtask[];
  deadline?: Date;
  output?: unknown;
}

export type TaskStatus = "pending" | "in-progress" | "completed" | "blocked" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "critical";

export interface Subtask {
  subtaskId: string;
  title: string;
  assignedTo: string;
  status: TaskStatus;
  completedAt?: number;
}

export interface DecisionRecord {
  decisionId: string;
  topic: string;
  options: DecisionOption[];
  selectedOption: string;
  rationale: string;
  madeBy: string;
  modelUsed: string;
  confidence: number;
  timestamp: number;
  feedback?: string;
}

export interface DecisionOption {
  optionId: string;
  description: string;
  pros: string[];
  cons: string[];
  riskLevel: "low" | "medium" | "high";
  estimatedImpact: string;
}

export type ConversationStatus =
  | "active"
  | "paused"
  | "resolved"
  | "escalated"
  | "closed"
  | "archived";

// ============================================================
// 模型路由策略
// ============================================================

export interface ModelRoutingStrategy {
  strategyName: string;
  description: string;
  
  // 路由规则
  rules: RoutingRule[];
  
  // 默认行为
  defaultModel: string;
  fallbackChain: string[];       // 模型降级链
  
  // 负载均衡
  loadBalancing: LoadBalancingConfig;
  
  // 成本优化
  costOptimization: CostOptimizationConfig;
  
  // 性能监控
  performanceThresholds: PerformanceThresholds;
}

export interface RoutingRule {
  ruleId: string;
  name: string;
  condition: RoutingCondition;
  action: RoutingAction;
  priority: number;
  isEnabled: boolean;
}

export interface RoutingCondition {
  taskComplexity?: "simple" | "moderate" | "complex" | "very-complex";
  requiredCapabilities?: ModelCapability[];
  maxLatencyMs?: number;
  maxCostUsd?: number;
  requiredExpertise?: ExpertiseLevel;
  guestTier?: GuestInformation["membershipTier"];
  timeOfDay?: "business-hours" | "after-hours" | "peak-time";
  channelType?: CommunicationChannel;
}

export interface RoutingAction {
  targetModel: string;
  parameters?: Partial<ModelParameters>;
  preProcessing?: string[];
  postProcessing?: string[];
}

export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences?: string[];
}

export interface LoadBalancingConfig {
  algorithm: "round-robin" | "least-connections" | "weighted" | "random";
  healthCheckIntervalSec: number;
  maxQueueSize: number;
  timeoutMs: number;
}

export interface CostOptimizationConfig {
  dailyBudgetUsd: number;
  enableCaching: boolean;
  cacheTtlSeconds: number;
  preferLocalModels: boolean;
  batchSimilarRequests: boolean;
}

export interface PerformanceThresholds {
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRatePercent: number;
  satisfactionScoreMin: number;
}

// ============================================================
// 酒店业务场景模板
// ============================================================

export interface HotelScenarioTemplate {
  templateId: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  
  // 参与者
  requiredRoles: HotelRole[];
  recommendedModels: string[];
  
  // 流程步骤
  workflow: WorkflowStep[];
  
  // 关键决策点
  decisionPoints: string[];
  
  // KPI指标
  kpis: ScenarioKPI[];
  
  // 最佳实践
  bestPractices: string[];
  
  // 常见问题
  faqs: FAQ[];
}

export type ScenarioCategory =
  | "guest-arrival"
  | "guest-departure"
  | "service-request"
  | "complaint-resolution"
  | "upselling"
  | "emergency"
  | "event-management"
  | "corporate-booking"
  | "group-coordination"
  | "quality-assurance";

export interface WorkflowStep {
  stepId: number;
  stepName: string;
  responsibleRole: HotelRole;
  recommendedModel: string;
  actions: WorkflowAction[];
  expectedOutput: string;
  estimatedDurationMin: number;
  canParallelize: boolean;
}

export interface WorkflowAction {
  actionId: string;
  type: "send-message" | "call-api" | "update-record" | "notify-team" | "escalate" | "wait-for-input";
  description: string;
  requiredParams: string[];
  optionalParams: string[];
}

export interface ScenarioKPI {
  metricName: string;
  targetValue: number;
  unit: string;
  weight: number;
  measurementMethod: string;
}

export interface FAQ {
  question: string;
  answer: string;
  relatedScenarios: string[];
  difficulty: "easy" | "moderate" | "hard";
}

// ============================================================
// 常量导出
// ============================================================

export const HOTEL_ROLES: Record<HotelRole, { label: string; emoji: string; department: string }> = {
  "front-desk": { label: "前台接待", emoji: "🎫", department: "前厅部" },
  "concierge": { label: "礼宾服务", emoji: "🎩", department: "前厅部" },
  "housekeeping": { label: "客房服务", emoji: "🧹", department: "客房部" },
  "restaurant": { label: "餐饮服务", emoji: "🍽️", department: "餐饮部" },
  "manager": { label: "酒店经理", emoji: "👔", department: "管理层" },
  "sales": { label: "销售经理", emoji: "💼", department: "销售部" },
  "marketing": { label: "市场营销", emoji: "📢", department: "市场部" },
  "finance": { label: "财务管理", emoji: "💰", department: "财务部" },
  "hr": { label: "人力资源", emoji: "👥", department: "人力资源部" },
  "it-support": { label: "IT支持", emoji: "💻", department: "IT部" },
  "security": { label: "安全保卫", emoji: "🛡️", department: "安保部" },
  "guest-relations": { label: "客户关系", emoji: "🤝", department: "客户关系部" },
  "event-coordinator": { label: "活动协调", emoji: "🎊", department: "活动部" },
  "spa-wellness": { label: "SPA康养", emoji: "💆", department: "康乐部" },
  "chef": { label: "主厨", emoji: "👨‍🍳", department: "餐饮部" },
};

export const DEFAULT_ROUTING_STRATEGY: ModelRoutingStrategy = {
  strategyName: "hotel-default",
  description: "酒店默认模型路由策略",
  rules: [
    {
      ruleId: "rule-simple-query",
      name: "简单查询路由",
      condition: { taskComplexity: "simple" },
      action: { targetModel: "chatglm3-6b" },
      priority: 1,
      isEnabled: true,
    },
    {
      ruleId: "rule-code-task",
      name: "代码任务路由",
      condition: { 
        taskComplexity: "complex",
        requiredCapabilities: ["code-generation"]
      },
      action: { targetModel: "codegeex4-all-9b" },
      priority: 2,
      isEnabled: true,
    },
    {
      ruleId: "rule-agent-task",
      name: "智能体任务路由",
      condition: { 
        taskComplexity: "very-complex",
        requiredCapabilities: ["agent", "tool-use"]
      },
      action: { targetModel: "cogagent" },
      priority: 3,
      isEnabled: true,
    },
    {
      ruleId: "rule-video-task",
      name: "视频任务路由",
      condition: { 
        requiredCapabilities: ["video-generation", "vision"]
      },
      action: { targetModel: "cogvideox-5b" },
      priority: 4,
      isEnabled: true,
    },
  ],
  defaultModel: "chatglm3-6b",
  fallbackChain: ["chatglm3-6b", "codegeex4-all-9b", "cogagent"],
  loadBalancing: {
    algorithm: "round-robin",
    healthCheckIntervalSec: 30,
    maxQueueSize: 100,
    timeoutMs: 30000,
  },
  costOptimization: {
    dailyBudgetUsd: 50,
    enableCaching: true,
    cacheTtlSeconds: 3600,
    preferLocalModels: true,
    batchSimilarRequests: true,
  },
  performanceThresholds: {
    p50LatencyMs: 500,
    p95LatencyMs: 2000,
    p99LatencyMs: 5000,
    errorRatePercent: 1,
    satisfactionScoreMin: 85,
  },
};
