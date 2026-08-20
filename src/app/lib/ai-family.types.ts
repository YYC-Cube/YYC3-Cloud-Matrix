/**
 * @file: ai-family.types.ts
 * @description: AI Family 核心类型定义 - 记忆档案、多端同步、遥测通讯
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, types, telemetry, memory]
 *
 * @brief: AI Family 是一种方式或信念
 * - 一人 8T 专属空间
 * - 记忆不丢不齐不删
 * - 相互信任，极致向前
 * - 全球化社区协作
 */

// ============================================================
// AI Family 成员定义
// ============================================================

export interface AIFamilyMember {
  id: string;
  name: string;
  avatar?: string;
  email?: string;

  // 专属标识
  familyId: string;           // 家庭/团队 ID
  memberNumber: number;       // 成员编号 (如: 001, 002)
  personalSpaceId: string;    // 8T 专属空间 ID

  // 多端支持 (一人 8 端)
  devices: AIFamilyDevice[];

  // 角色与权限
  role: AIFamilyRole;
  permissions: AIFamilyPermission[];

  // 社交属性
  bio?: string;
  tags?: string[];
  timezone?: string;
  language?: string;

  // 状态
  status: MemberStatus;
  lastActiveAt: number;
  createdAt: number;
}

export type AIFamilyRole =
  | "founder"      // 创始人
  | "guardian"     // 守护者（导师）
  | "core"         // 核心成员
  | "member"       // 正式成员
  | "guest";       // 嘉宾

export type MemberStatus =
  | "online"
  | "away"
  | "busy"
  | "offline";

export type AIFamilyPermission =
  | "space:read"
  | "space:write"
  | "memory:view"
  | "memory:edit"
  | "memory:delete"
  | "comm:voice"
  | "comm:video"
  | "comm:message"
  | "comm:screen-share"
  | "collab:whiteboard"
  | "collab:document"
  | "admin:manage";

// ============================================================
// 多端设备定义 (一人 8 端)
// ============================================================

export interface AIFamilyDevice {
  id: string;
  deviceId: string;          // 唯一设备标识
  deviceType: DeviceType;
  deviceName: string;        // 自定义名称 (如: "我的 MacBook")

  // 连接状态
  isOnline: boolean;
  lastSyncAt: number;
  batteryLevel?: number;     // 0-100

  // 能力
  capabilities: DeviceCapability[];

  // 位置信息 (可选)
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

export type DeviceType =
  | "smartphone"      // 手机
  | "tablet"          // 平板
  | "laptop"          // 笔记本
  | "desktop"         // 台式机
  | "smartwatch"      // 智能手表
  | "smarttv"         // 智能电视
  | "iot-device"      // IoT 设备
  | "vr-ar";          // VR/AR 设备

export type DeviceCapability =
  | "camera"
  | "microphone"
  | "speaker"
  | "screen-share"
  | "file-transfer"
  | "location"
  | "biometric"
  | "ar-vr";

export const MAX_DEVICES_PER_MEMBER = 8;

// ============================================================
// 个人空间 (8T 专属)
// ============================================================

export interface PersonalSpace {
  id: string;
  ownerId: string;

  // 空间配额 (8TB = 8 * 1024 GB)
  totalQuotaBytes: number;      // 8TB in bytes
  usedQuotaBytes: number;

  // 存储分类
  storage: SpaceStorage;

  // 分享设置
  sharingSettings: SharingSettings;

  // 统计
  stats: SpaceStats;

  updatedAt: number;
}

export const PERSONAL_SPACE_QUOTA_TB = 8;
export const PERSONAL_SPACE_QUOTA_BYTES = 8 * 1024 * 1024 * 1024 * 1024; // 8TB

export interface SpaceStorage {
  memories: MemoryStorage;        // 记忆档案
  documents: DocumentStorage;      // 文档文件
  media: MediaStorage;            // 媒体资源
  projects: ProjectStorage;       // 项目代码
  backups: BackupStorage;         // 备份数据
}

export interface MemoryStorage {
  usedBytes: number;
  itemCount: number;
  lastBackupAt?: number;
}

export interface DocumentStorage {
  usedBytes: number;
  fileCount: number;
}

export interface MediaStorage {
  usedBytes: number;
  fileCount: number;
  durationSeconds?: number;       // 视频/音频总时长
}

export interface ProjectStorage {
  usedBytes: number;
  repoCount: number;
}

export interface BackupStorage {
  usedBytes: number;
  backupCount: number;
  lastFullBackupAt?: number;
}

export interface SharingSettings {
  allowFamilyView: boolean;
  allowFamilyDownload: boolean;
  publicLinks: SharedLink[];
  sharedWithMembers: SharedAccess[];
}

export interface SharedLink {
  id: string;
  path: string;
  expiresAt?: number;
  password?: string;
  accessCount: number;
  maxAccessCount?: number;
  createdAt: number;
}

export interface SharedAccess {
  memberId: string;
  paths: string[];
  permission: "read" | "write" | "admin";
  grantedAt: number;
  grantedBy: string;
}

export interface SpaceStats {
  totalFiles: number;
  totalMemories: number;
  dailyActiveMinutes: number;
  weeklyGrowthRate: number;
}

// ============================================================
// 记忆档案系统 (不丢不齐不删)
// ============================================================

export interface MemoryArchive {
  id: string;
  ownerId: string;

  // 记忆元数据
  title: string;
  description?: string;
  tags: string[];
  category: MemoryCategory;

  // 时间线
  timestamp: number;
  timeline?: MemoryTimelineEvent[];

  // 内容
  content: MemoryContent;

  // 情感标记
  emotion?: EmotionTag;
  sentiment?: SentimentScore;

  // 关联
  relatedMembers: string[];      // 相关成员 IDs
  relatedMemories: string[];     // 关联记忆 IDs
  sourceDevice?: string;         // 来源设备

  // 永久保存标记
  isPermanent: boolean;          // true = 永不删除
  isEncrypted: boolean;          // 端到端加密

  // 版本控制
  version: number;
  previousVersions?: string[];   // 历史版本 IDs

  // 统计
  viewCount: number;
  editCount: number;

  createdAt: number;
  updatedAt: number;
}

export type MemoryCategory =
  | "moment"           // 瞬间
  | "conversation"     // 对话
  | "achievement"      // 成就
  | "learning"         // 学习
  | "creation"         // 创作
  | "milestone"        // 里程碑
  | "dream"            // 梦想
  | "reflection"       // 反思
  | "gratitude"        // 感恩
  | "legacy";          // 传承

export interface MemoryTimelineEvent {
  id: string;
  type: "created" | "edited" | "shared" | "viewed" | "restored";
  timestamp: number;
  byMemberId?: string;
  details?: string;
}

export interface MemoryContent {
  type: ContentType;
  data: string | object;
  metadata?: ContentMetadata;
}

export type ContentType =
  | "text"
  | "rich-text"
  | "image"
  | "audio"
  | "voice-note"
  | "video"
  | "document"
  | "code"
  | "drawing"
  | "3d-model"
  | "composite";       // 混合内容

export interface ContentMetadata {
  mimeType?: string;
  sizeBytes?: number;
  durationMs?: number;
  dimensions?: { width: number; height: number };
  thumbnails?: string[];
  transcription?: string;       // 音频转文字
  description?: string;         // AI 生成的描述
}

export interface EmotionTag {
  primary: EmotionType;
  secondary?: EmotionType;
  intensity: number;             // 0-1
  emojis?: string[];
}

export type EmotionType =
  | "joy"
  | "love"
  | "surprise"
  | "anger"
  | "sadness"
  | "fear"
  | "disgust"
  | "trust"
  | "anticipation"
  | "nostalgia"
  | "pride"
  | "gratitude"
  | "serenity"
  | "hope"
  | "wonder";

export interface SentimentScore {
  positive: number;              // 0-1
  negative: number;              // 0-1
  neutral: number;               // 0-1
  overall: "positive" | "negative" | "neutral" | "mixed";
  confidence: number;            // 0-1
}

// ============================================================
// 遥测通讯系统
// ============================================================

export interface TelemetrySession {
  id: string;
  sessionId: string;

  // 参与者
  initiatorId: string;
  participants: TelemetryParticipant[];

  // 会话类型
  type: SessionType;
  status: SessionStatus;

  // 连接信息
  connectionQuality: ConnectionQuality;
  latencyMs: number;

  // 媒体流
  streams: MediaStreamInfo[];

  // 协作功能
  collaboration: CollaborationState;

  // 时间统计
  startedAt: number;
  endedAt?: number;
  durationSeconds: number;

  // 录制 (可选)
  recording?: RecordingInfo;
}

export interface TelemetryParticipant {
  memberId: string;
  deviceId: string;
  displayName: string;

  // 状态
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;

  // 连接
  connectionQuality: ConnectionQuality;
  joinedAt: number;
}

export type SessionType =
  | "voice-call"           // 语音通话
  | "video-call"           // 视频通话
  | "group-call"           // 群组通话
  | "webinar"              // 网络研讨会
  | "screen-share"         // 屏幕共享
  | "remote-assist"        // 远程协助
  | "virtual-meeting"      // 虚拟会议
  | "immersive-room";      // 沉浸式房间 (VR/AR)

export type SessionStatus =
  | "initializing"
  | "connecting"
  | "active"
  | "on-hold"
  | "reconnecting"
  | "ended";

export type ConnectionQuality =
  | "excellent"            // < 50ms
  | "good"                 // 50-100ms
  | "fair"                 // 100-200ms
  | "poor"                 // 200-500ms
  | "disconnected";        // > 500ms 或断开

export interface MediaStreamInfo {
  id: string;
  type: "audio" | "video" | "screen" | "data";
  sourceMemberId: string;
  quality: StreamQuality;
  isEnabled: boolean;
}

export type StreamQuality =
  | "360p"
  | "480p"
  | "720p"
  | "1080p"
  | "4k";

export interface CollaborationState {
  whiteboard?: WhiteboardState;
  documentSharing?: DocumentSharingState;
  poll?: PollState;
  qa?: QAState;
}

export interface WhiteboardState {
  isActive: boolean;
  canvasDataUrl?: string;
  currentTool: WhiteboardTool;
  participants: string[];       // 正在绘制的成员 IDs
}

export type WhiteboardTool =
  | "pen"
  | "highlighter"
  | "eraser"
  | "text"
  | "shape"
  | "select"
  | "move";

export interface DocumentSharingState {
  documentId: string;
  documentName: string;
  currentPage: number;
  presenterId: string;
  viewers: string[];
}

export interface PollState {
  question: string;
  options: PollOption[];
  responses: Record<string, string>;  // memberId -> optionId
  isActive: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface QAState {
  questions: QAQuestion[];
  isActive: boolean;
}

export interface QAQuestion {
  id: string;
  questionerId: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  upvotes: number;
  timestamp: number;
}

export interface RecordingInfo {
  id: string;
  format: "mp4" | "webm" | "mkv";
  sizeBytes: number;
  durationSeconds: number;
  storagePath: string;
  thumbnailUrl?: string;
  isProcessing: boolean;
  completedAt?: number;
}

// ============================================================
// 即时消息系统
// ============================================================

export interface Message {
  id: string;
  sessionId?: string;          // 关联的会话 ID (可选)

  // 发送者
  senderId: string;
  senderDeviceId: string;

  // 接收者
  receiverId?: string;         // 私聊接收者
  groupId?: string;            // 群组 ID

  // 内容
  content: MessageContent;

  // 状态
  status: MessageStatus;

  // 回复/引用
  replyTo?: string;            // 回复的消息 ID
  reactions?: Reaction[];

  // 时间
  sentAt: number;
  deliveredAt?: number;
  readAt?: number;
  editedAt?: number;
  deletedAt?: number;
}

export interface MessageContent {
  type: MessageType;
  text?: string;
  media?: MediaAttachment;
  file?: FileAttachment;
  location?: LocationAttachment;
  contact?: ContactAttachment;
  poll?: MessagePoll;
  voiceNote?: VoiceNoteAttachment;
}

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "contact"
  | "poll"
  | "voice-note"
  | "system"
  | "rich-text";

export interface MediaAttachment {
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSecs?: number;
}

export interface FileAttachment {
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  previewUrl?: string;
}

export interface LocationAttachment {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
}

export interface ContactAttachment {
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export interface MessagePoll {
  question: string;
  options: { id: string; text: string }[];
  multipleChoice: boolean;
  expiresAt?: number;
  responses: Record<string, string[]>;
}

export interface VoiceNoteAttachment {
  url: string;
  durationSecs: number;
  waveform?: number[];
  transcription?: string;
}

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "edited"
  | "deleted";

export interface Reaction {
  emoji: string;
  memberId: string;
  timestamp: number;
}

// ============================================================
// 全球化社区
// ============================================================

export interface GlobalCommunity {
  id: string;
  name: string;
  description?: string;
  avatar?: string;

  // 类型
  type: CommunityType;

  // 成员
  members: CommunityMember[];
  memberCount: number;

  // 区域
  region: CommunityRegion;
  languages: string[];

  // 频道/话题
  channels: CommunityChannel[];

  // 活动
  events: CommunityEvent[];

  // 规则
  rules: CommunityRule[];

  // 统计
  stats: CommunityStats;

  createdAt: number;
  updatedAt: number;
}

export type CommunityType =
  | "regional"           // 地区社区
  | "interest"           // 兴趣社区
  | "professional"       // 专业社区
  | "educational"        // 教育社区
  | "open-source"        // 开源社区
  | "support"            // 支持社区
  | "family-team";       // 家庭/团队

export type CommunityRegion =
  | "global"
  | "asia-pacific"
  | "americas"
  | "europe-africa"
  | "middle-east"
  | "china"
  | "specific-country";

export interface CommunityMember {
  memberId: string;
  role: CommunityRole;
  joinedAt: number;
  reputation: number;
  contributions: number;
  lastActiveAt: number;
}

export type CommunityRole =
  | "owner"
  | "admin"
  | "moderator"
  | "expert"
  | "member"
  | "newcomer";

export interface CommunityChannel {
  id: string;
  name: string;
  type: "text" | "voice" | "video";
  topic?: string;
  memberCount: number;
  unreadCount?: number;
  lastMessageAt?: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startTime: number;
  endTime: number;
  maxParticipants?: number;
  registeredCount: number;
  hostId: string;
  recordingUrl?: string;
}

export type EventType =
  | "meetup"
  | "webinar"
  | "workshop"
  | "hackathon"
  | "conference"
  | "social";

export interface CommunityRule {
  id: string;
  title: string;
  description: string;
  isEnforced: boolean;
}

export interface CommunityStats {
  totalMessages: number;
  activeMembers24h: number;
  averageSessionDuration: number;
  growthRate: number;
}

// ============================================================
// 教育培训场景
// ============================================================

export interface EducationSession {
  id: string;
  title: string;
  description?: string;

  // 类型
  type: EducationType;

  // 讲师/导师
  instructorId: string;
  instructorName: string;

  // 学员
  students: StudentRecord[];

  // 课程内容
  curriculum: CurriculumItem[];

  // 互动
  interactions: EducationInteraction[];

  // 资源
  resources: EducationResource[];

  // 进度
  progress: SessionProgress;

  // 时间
  scheduledStart: number;
  scheduledEnd: number;
  actualStart?: number;
  actualEnd?: number;

  // 录制
  recording?: RecordingInfo;

  status: EducationStatus;
}

export type EducationType =
  | "lecture"             // 讲座
  | "tutorial"            // 辅导
  | "workshop"            // 工作坊
  | "mentorship"          // 导师制
  | "peer-learning"       // 同伴学习
  | "code-review"         // 代码评审
  | "demo"                // 演示
  | "q-and-a";            // 问答

export interface StudentRecord {
  studentId: string;
  studentName: string;
  joinTime?: number;
  leaveTime?: number;
  attentionScore?: number;      // 0-1 注意力分数
  participationScore?: number;  // 0-1 参与度
  questionsAsked: number;
  notes?: string;
  feedback?: StudentFeedback;
}

export interface StudentFeedback {
  rating: number;               // 1-5
  comment?: string;
  wouldRecommend: boolean;
  topicsToReview?: string[];
}

export interface CurriculumItem {
  id: string;
  order: number;
  title: string;
  type: "theory" | "practice" | "discussion" | "assessment";
  durationMinutes: number;
  resources: string[];
  completed: boolean;
  completedAt?: number;
}

export interface EducationInteraction {
  id: string;
  type: InteractionType;
  participantId: string;
  timestamp: number;
  content?: string;
  reaction?: string;
}

export type InteractionType =
  | "question"
  | "answer"
  | "poll-response"
  | "chat-message"
  | "raise-hand"
  | "emoji-reaction"
  | "screen-share"
  | "whiteboard-draw";

export interface EducationResource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  sizeBytes?: number;
  description?: string;
}

export type ResourceType =
  | "pdf"
  | "presentation"
  | "video"
  | "code-snippet"
  | "link"
  | "interactive"
  | "dataset";

export interface SessionProgress {
  currentItemIndex: number;
  overallPercentage: number;
  timeRemainingMinutes: number;
  milestonesCompleted: string[];
}

export type EducationStatus =
  | "scheduled"
  | "in-progress"
  | "paused"
  | "completed"
  | "cancelled";
