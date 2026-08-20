/**
 * @file: index.ts
 * @description: YYC³ 全局类型 barrel re-export — 所有消费者从此文件导入
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[barrel],[re-export]
 *
 * @brief: 纯 barrel 文件，所有类型定义已拆分至领域独立文件
 * @note: 消费者 `import { X } from "../types"` 无需任何改动
 */

// ── AI Family (已迁移至独立模块) ──
export type {
  MemberPresenceStatus,
  MemberPersonality,
  MemberStats,
  MemberModelBinding,
  MemberVoiceProfile,
  FamilyMemberId,
  UnifiedFamilyMember,
  MessageContentType,
  MessagePriority,
  MessageDeliveryStatus,
  UnifiedFamilyMessage,
  FamilyConversation,
} from "../modules/ai-family/types";

// ── Foundation ──
export type { BaseSeverity } from "./common-types";

// ── Auth ──
export type { UserRole, AppUser, AppSession, AuthContextValue } from "./auth-types";

// ── Node & Cluster ──
export type { NodeStatusType, NodeData, NodeStatusRecord } from "./node-types";
export { toNodeData } from "./node-types";

// ── Model & Agent ──
export type {
  ModelTier, Model, Agent,
  InferenceStatus, InferenceLog, ModelStats,
} from "./model-agent-types";

// ── WebSocket ──
export type {
  ConnectionState, AlertLevel, AlertData,
  ThroughputPoint, SystemStats, WSMessage, WebSocketDataState,
} from "./websocket-types";

// ── Network & API ──
export type {
  NetworkInterface, NetworkMode, NetworkConfig,
  TestStatus, ConnectionTestResult, NetworkConfigState,
  APIEndpoints,
} from "./network-types";

// ── Sync ──
export type {
  SyncItemType, SyncItem, SyncQueueStats, SyncProcessResult,
} from "./sync-types";

// ── Error ──
export type {
  ErrorCategory, ErrorSeverity, AppError, ErrorStats,
} from "./error-types";

// ── Layout ──
export type {
  Breakpoint, ViewState, ErrorBoundaryLevel,
} from "./layout-types";

// ── UI Components ──
export type {
  ChatMessage, CommandCategory, BeforeInstallPromptEvent,
  KeyboardShortcut, CommandPaletteItem, RegisteredShortcut,
  TerminalHistoryEntry, IDEPanelTab,
  SWStatus, CacheEntry, PWAState,
} from "./ui-types";

// ── Follow-up ──
export type {
  FollowUpSeverity, FollowUpStatus,
  ChainEventType, ChainEvent,
  FollowUpItem, QuickAction,
} from "./followup-types";

// ── Operation Center ──
export type {
  OperationCategoryType, OperationCategoryMeta, OperationStatus,
  OperationItem, OperationTemplateItem, OperationLogEntry, LogFilterType,
} from "./operation-types";

// ── File System & Logs ──
export type {
  FileItemType, FileItem, LogLevel, LogEntry,
  ReportType, ReportFormat, ReportConfig, ReportResult,
  RecentFile,
} from "./filesystem-types";

// ── Service Loop ──
export type {
  LoopStage, StageStatus, StageResult, LoopRun,
  DataFlowNodeType, DataFlowEdge,
  StageMeta, DataFlowNode,
} from "./service-loop-types";

// ── AI Analysis ──
export type {
  AnomalyPatternType, PatternSeverity,
  DetectedPattern, AIRecommendation, AIAnalysisResult,
} from "./ai-analysis-types";

// ── i18n ──
export type { Locale, LocaleInfo, I18nContextValue } from "./i18n-types";

// ── Model Provider ──
export type {
  ModelProviderId, ModelProviderDef, ConfiguredModel,
  OllamaModel, OllamaTagsResponse,
} from "./model-provider-types";

// ── SDK ──
export type {
  SDKConnectionStatus, ChatRole, ChatSession,
  SDKCapability, SDKUsageStats, SDKProviderCapabilities,
  SDKChatRequest, SDKChatResponse,
} from "./sdk-types";

// ── Inference ──
export type {
  InferenceBackendType, ModelLoadProgress, InferenceConfig,
  InferenceBackendStatus, GPUDeviceInfo, WebGPUPreset,
} from "./inference-types";

// ── Host File System ──
export type { HostFileEntry, FileVersion, HostFSState } from "./host-fs-types";

// ── Database ──
export type {
  DatabaseType, DBConnectionStatus, DBConnection,
  DBTable, DBColumn, QueryResult, DBBackup,
  SQLTemplate,
  ChangeType, EditableCellChange, CommittedChange,
} from "./database-types";
export { toConnectionInfo, toDBConnection } from "./database-types";

// ── Patrol ──
export type {
  PatrolStatus, CheckStatus, PatrolInterval,
  PatrolCheckItem, PatrolResult, PatrolSchedule,
} from "./patrol-types";

// ── Security Monitor ──
export type {
  SecurityTab, ScanStatus, RiskLevel, VitalRating,
  CSPResult, CookieResult, SensitiveDataResult,
  ResourceEntry, PerformanceResult, MemoryResult,
  WebVital, DeviceInfo, NetworkInfo,
  BrowserFeature, BrowserInfo,
  StorageUsage, DataManagementState, SecurityMonitorState,
} from "./security-types";

// ── Alert Rules ──
export type {
  AlertSeverity, AlertMetric, AlertCondition, EscalationLevel,
  AlertThreshold, EscalationPolicy, AlertRule, AlertEvent,
  AlertRulesOptions,
} from "./alert-rules-types";

// ── Report Export ──
export type {
  ExportReportType, ExportFormat, TimeRange,
  ReportMetric, PerformanceSnapshot, SecuritySnapshot,
  ReportData, ReportHistoryEntry,
} from "./report-export-types";

// ── AI Diagnostic ──
export type {
  DiagnosticStatus, PatternType, ConfidenceLevel, ActionPriority,
  DiagnosticPattern, AnomalyRecord, SuggestedAction, PredictiveForecast,
  DiagnosticSession, WsNodeSnapshot, DiagnosticsOptions,
  DiagnosticHistoryEntry, DiagnosticView,
} from "./diagnostic-types";

// ── Storage Infrastructure ──
export type {
  StorageType, StorageConfig, StorageStatus,
  OfflineQueueItem, SyncData, StorageEvent,
  StoreName, StorageChangeEvent,
} from "./storage";

// ── Design System ──
export type {
  ColorToken, TypographyToken, SpacingToken, ShadowToken, AnimationToken,
  StatusDef, ComponentEntry, InteractionSpec,
  ChapterStatus, ChapterReview, ProjectStats, AcceptanceItem,
} from "./design-system-types";

// ── Dashboard ──
export type {
  ModelPerfEntry, ModelDistEntry, RecentOpEntry, RadarEntry,
  StoredLogEntry, DeployedModel, WifiNetwork, UserRecord,
  WifiAutoReconnectSettings, FollowUpRecord,
} from "./dashboard-types";
