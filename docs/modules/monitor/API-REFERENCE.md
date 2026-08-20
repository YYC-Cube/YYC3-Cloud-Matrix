---
file: API-REFERENCE.md
description: Monitor 模块 API 参考 — 所有导出组件、Hooks、类型的完整签名与说明
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [api],[monitor],[reference],[types]
category: api
language: zh-CN
audience: developers
complexity: advanced
checksum: monitor-api-reference-v1
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***

---

# Monitor 模块 API 参考

本参考手册列出 Monitor 模块 **所有导出 API** 的完整类型签名、参数说明与返回值类型，覆盖三大类：

| 类别 | 数量 | 索引 |
|------|------|------|
| **组件 (Components)** | 22 | [第 1 章](#1-组件-components) |
| **关联 Hooks** | 12 | [第 2 章](#2-关联-hooks) |
| **类型 (Types)** | 48 | [第 3 章](#3-类型-types) |

---

## 目录速查

### 组件速查

| 功能域 | 组件名 | 导出行 |
|--------|--------|--------|
| 仪表盘 | `DataMonitoring`, `Dashboard` | L13-14 |
| 跟进管理 | `FollowUpPanel`, `FollowUpManager`, `FollowUpCard`, `FollowUpDrawer`, `FollowUpEditDialog` | L17-21 |
| 巡查管理 | `PatrolDashboard`, `PatrolReport`, `PatrolScheduler`, `PatrolHistory` | L24-27 |
| 告警管理 | `AlertBanner`, `AlertRulesPanel`, `CreateRuleModal` | L30-32 |
| AI 建议 | `AISuggestionPanel`, `ActionRecommender`, `PatternAnalyzer`, `SDKChatPanel` | L35-38 |
| 快捷操作 | `QuickActionGroup` | L41 |
| 通用组件 | `NodeDetailModal`, `UnifiedModelSelector` | L44-45 |

### 类型速查

| 类型文件 | 核心导出 |
|----------|---------|
| `followup-types.ts` | `FollowUpSeverity`, `FollowUpStatus`, `ChainEventType`, `ChainEvent`, `FollowUpItem`, `QuickAction` |
| `patrol-types.ts` | `PatrolStatus`, `CheckStatus`, `PatrolInterval`, `PatrolCheckItem`, `PatrolResult`, `PatrolSchedule` |
| `alert-rules-types.ts` | `AlertSeverity`, `AlertMetric`, `AlertCondition`, `EscalationLevel`, `AlertThreshold`, `EscalationPolicy`, `AlertRule`, `AlertEvent`, `AlertRulesOptions` |
| `common-types.ts` | `BaseSeverity` |

---

## 1. 组件 (Components)

所有组件均从 `src/app/modules/monitor/index.ts` 统一导出。

### 1.1 Dashboard

```typescript
/**
 * 监控大盘主页面
 * 无 Props，通过 WebSocketContext + Zustand Slices 获取数据
 */
export function Dashboard(): JSX.Element;
```

### 1.2 DataMonitoring

```typescript
interface DataMonitoringProps {
  metricGroups?: string[];   // 自定义展示的指标分组
  showExport?: boolean;      // 是否显示数据导出按钮 (默认 true)
}

export function DataMonitoring(props?: DataMonitoringProps): JSX.Element;
```

---

### 1.3 FollowUpPanel

```typescript
/**
 * 异常跟进主面板
 * 无 Props，内部依赖 useAlerts() + useWebSocketData() + ViewContext
 */
export function FollowUpPanel(): JSX.Element;
```

### 1.4 FollowUpManager

```typescript
interface FollowUpManagerProps {
  enableExport?: boolean;    // 启用 CSV/JSON 导出 (默认 true)
  enableBatch?: boolean;     // 启用批量操作 (默认 true)
}

export function FollowUpManager(props?: FollowUpManagerProps): JSX.Element;
```

### 1.5 FollowUpCard

```typescript
import type { FollowUpItem } from '../../types/followup-types';

interface FollowUpCardProps {
  item: FollowUpItem;
  onOpenDrawer: (item: FollowUpItem) => void;
  onQuickFix: (item: FollowUpItem) => void;
  onMarkResolved: (item: FollowUpItem) => void;
  compact?: boolean;         // 移动端紧凑模式 (默认 false)
}

export function FollowUpCard(props: FollowUpCardProps): JSX.Element;
```

### 1.6 FollowUpDrawer

```typescript
import type { FollowUpItem } from '../../types/followup-types';

interface FollowUpDrawerProps {
  item: FollowUpItem | null;
  isOpen: boolean;
  onClose: () => void;
  onQuickFix: (item: FollowUpItem) => void;
  onMarkResolved: (item: FollowUpItem) => void;
  isMobile?: boolean;        // 移动端底部抽屉 (默认 false)
}

export function FollowUpDrawer(props: FollowUpDrawerProps): JSX.Element;
```

### 1.7 FollowUpEditDialog

```typescript
import type { FollowUpItem } from '../../types/followup-types';

interface FollowUpEditDialogProps {
  item: FollowUpItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, patch: Partial<FollowUpItem>) => void;
}

export function FollowUpEditDialog(props: FollowUpEditDialogProps): JSX.Element;
```

---

### 1.8 PatrolDashboard

```typescript
/**
 * 智能巡检主控台
 * 无 Props，内部依赖 usePatrol() + ViewContext + useWebSocketData()
 */
export function PatrolDashboard(): JSX.Element;
```

### 1.9 PatrolReport

```typescript
import type { PatrolResult } from '../../types/patrol-types';

interface PatrolReportProps {
  report: PatrolResult;
  onClose?: () => void;      // 弹窗内嵌时的关闭回调
}

export function PatrolReport(props: PatrolReportProps): JSX.Element;
```

### 1.10 PatrolScheduler

```typescript
import type {
  PatrolSchedule,
  PatrolInterval,
} from '../../types/patrol-types';

interface PatrolSchedulerProps {
  schedule: PatrolSchedule;
  onToggle: (enabled: boolean) => void;
  onUpdateInterval: (interval: PatrolInterval) => void;
}

export function PatrolScheduler(props: PatrolSchedulerProps): JSX.Element;
```

### 1.11 PatrolHistory

```typescript
import type { PatrolResult } from '../../types/patrol-types';

interface PatrolHistoryProps {
  history: PatrolResult[];
  onViewReport: (report: PatrolResult) => void;
}

export function PatrolHistory(props: PatrolHistoryProps): JSX.Element;
```

---

### 1.12 AlertBanner

```typescript
interface AlertBannerProps {
  compact?: boolean;         // 紧凑模式，Dashboard 移动端用 (默认 false)
}

export function AlertBanner(props?: AlertBannerProps): JSX.Element | null;
```

### 1.13 AlertRulesPanel

```typescript
/**
 * 告警规则管理面板
 * 无 Props，内部依赖 useAlertRules()
 */
export function AlertRulesPanel(): JSX.Element;
```

### 1.14 CreateRuleModal

```typescript
import type { AlertRule } from '../../types/alert-rules-types';

type NewAlertRule = Omit<AlertRule, 'id' | 'createdAt' | 'lastTriggered' | 'triggerCount'>;

interface CreateRuleModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<AlertRule>;   // 编辑模式初始值
  onSubmit: (rule: AlertRule | NewAlertRule) => void;
}

export function CreateRuleModal(props: CreateRuleModalProps): JSX.Element;
```

---

### 1.15 AISuggestionPanel

```typescript
/**
 * AI 运维建议面板容器
 * 无 Props，内部依赖 useAISuggestion()
 */
export function AISuggestionPanel(): JSX.Element;
```

### 1.16 ActionRecommender

```typescript
import type { AISuggestion } from '../../types/ai-analysis-types';

interface ActionRecommenderProps {
  suggestion: AISuggestion;
  onExecute: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSnooze?: (id: string, minutes: number) => void;
}

export function ActionRecommender(props: ActionRecommenderProps): JSX.Element;
```

### 1.17 PatternAnalyzer

```typescript
import type { DetectedPattern } from '../../types/ai-analysis-types';

interface PatternAnalyzerProps {
  patterns: DetectedPattern[];
  maxItems?: number;          // 最大展示条数 (默认 5)
}

export function PatternAnalyzer(props: PatternAnalyzerProps): JSX.Element;
```

### 1.18 SDKChatPanel

```typescript
/**
 * SDK 对话排障面板
 * 无 Props，内部依赖 useBigModelSDK() + useProviderSlice() + ViewContext
 */
export function SDKChatPanel(): JSX.Element;
```

---

### 1.19 QuickActionGroup

```typescript
import type { QuickAction } from '../../types/followup-types';

interface QuickActionGroupProps {
  actions?: QuickAction[];    // 自定义快捷操作，缺省用内置 5 项
  variant?: 'horizontal' | 'vertical' | 'grid';  // 默认 'horizontal'
  onActionPerformed?: (actionId: string, result: any) => void;
}

export function QuickActionGroup(props?: QuickActionGroupProps): JSX.Element;
```

---

### 1.20 NodeDetailModal

```typescript
import type { NodeData } from '../../types/node-types';

interface NodeDetailModalProps {
  node: NodeData;
  onClose: () => void;
}

export function NodeDetailModal(props: NodeDetailModalProps): JSX.Element;
```

### 1.21 UnifiedModelSelector

```typescript
import type { ConfiguredModel } from '../../types/model-provider-types';

interface UnifiedModelSelectorProps {
  value?: string | null;                          // 已选 model ID (受控)
  onChange?: (modelId: string | null, model?: ConfiguredModel) => void;
  providers?: ConfiguredModel[];                  // 自定义列表，缺省取 useProviderSlice
  placeholder?: string;                           // 默认 i18n('选择模型...')
  compact?: boolean;                              // 紧凑模式 (默认 false)
  clearable?: boolean;                            // 可清空 (默认 true)
  disabled?: boolean;                             // 禁用 (默认 false)
}

export function UnifiedModelSelector(props?: UnifiedModelSelectorProps): JSX.Element;
```

---

## 2. 关联 Hooks

Monitor 模块核心数据与行为通过下列 Hooks 暴露。非 Monitor 独占，但为 Monitor 主要消费者。

### 2.1 usePatrol（巡查核心 Hook）

**文件**: `src/app/hooks/usePatrol.ts`

```typescript
/**
 * 巡查模式 Hook — 封装巡查状态、结果、调度、进度
 * 内部集成定时器 + 模拟检查项执行器
 */
export function usePatrol(): {
  // === 状态 ===
  patrolStatus: PatrolStatus;            // idle | running | completed | failed
  currentResult: PatrolResult | null;    // 当前/最近一次结果
  history: PatrolResult[];               // 历史记录（默认保留 50 条）
  schedule: PatrolSchedule;              // 自动巡查调度配置
  progress: number;                      // 当前进度 0-100
  selectedReport: PatrolResult | null;   // 选中查看的报告

  // === 操作 ===
  runPatrol: (triggeredBy: 'manual' | 'auto' | 'scheduled') => Promise<void>;
  toggleAutoPatrol: (enabled: boolean) => void;
  updateInterval: (interval: PatrolInterval) => void;
  viewReport: (report: PatrolResult) => void;
  closeReport: () => void;
};
```

### 2.2 useAlertRules（告警规则 Hook）

**文件**: `src/app/hooks/useAlertRules.ts`

```typescript
export interface AlertRulesOptions {
  liveNodes?: { id: string; gpu: number; mem: number; temp: number; status: string }[];
  liveLatency?: number;
}

/**
 * 告警规则引擎 Hook
 * 内置阈值匹配 + 聚合 + 去重 + 升级逻辑
 */
export function useAlertRules(options?: AlertRulesOptions): {
  // === 状态 ===
  rules: AlertRule[];
  activeEvents: AlertEvent[];

  // === CRUD ===
  createRule: (rule: NewAlertRule) => AlertRule;
  updateRule: (id: string, patch: Partial<AlertRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string, enabled: boolean) => void;

  // === 事件 ===
  acknowledgeEvent: (eventId: string) => void;
  resolveEvent: (eventId: string) => void;
};
```

### 2.3 useAISuggestion（AI 建议 Hook）

**文件**: `src/app/hooks/useAISuggestion.ts`

```typescript
export function useAISuggestion(): {
  suggestions: AISuggestion[];
  patterns: DetectedPattern[];
  isAnalyzing: boolean;

  refresh: () => Promise<void>;            // 重新触发分析
  acceptSuggestion: (id: string) => void;  // 采纳建议（标记已执行）
  dismissSuggestion: (id: string) => void;
  snoozeSuggestion: (id: string, minutes: number) => void;
};
```

### 2.4 useBigModelSDK（LLM SDK Hook）

**文件**: `src/app/hooks/useBigModelSDK.ts`

```typescript
export const PROVIDER_CAPABILITIES: Record<string, {
  streaming: boolean;
  toolCalls: boolean;
  maxTokens: number;
}>;

export type SDKConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export function useBigModelSDK(): {
  status: SDKConnectionStatus;
  messages: ChatMessage[];
  isStreaming: boolean;

  sendMessage: (content: string, modelId?: string) => Promise<void>;
  stopGeneration: () => void;
  clearHistory: () => void;
  startNewSession: () => void;
  manualReconnect: () => Promise<void>;
};
```

### 2.5 useWebSocketData（实时数据 Hook）

**文件**: `src/app/hooks/useWebSocketData.ts`

```typescript
export function useWebSocketData(): {
  isConnected: boolean;
  isSimulated: boolean;                    // 模拟模式标识
  connectionState: 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'simulated';

  // 实时指标
  liveQPS: number;
  qpsTrend: string;                        // e.g. "+12.3%"
  liveLatency: number;                     // ms
  latencyTrend: string;
  tokenThroughput: string;                 // e.g. "138K/s"
  storageUsed: string;                     // e.g. "12.8TB"
  throughputHistory: { time: string; qps: number; tokens: number }[];

  manualReconnect?: () => void;
};
```

### 2.6 useI18n（国际化 Hook）

**文件**: `src/app/hooks/useI18n.ts`

```typescript
export function useI18n(): {
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: string;                          // 'zh-CN' | 'en-US' | ...
  setLocale: (locale: string) => void;
  availableLocales: string[];
};
```

### 2.7 useAlerts（跟进数据 Store Hook）

**文件**: `src/app/stores/global-store.ts`

```typescript
export function useAlerts(): {
  followUps: FollowUpItem[];

  addFollowUp: (item: FollowUpItem) => void;
  updateFollowUp: (id: string, patch: Partial<FollowUpItem>) => void;
  removeFollowUp: (id: string) => void;
  clearResolved: () => void;
  batchUpdateStatus: (ids: string[], status: FollowUpStatus) => void;
};
```

### 2.8 Zustand Slices（Store 分片）

```typescript
// src/app/store/slices/metrics-slice.ts
export function useMetricsSlice<T>(
  selector: (state: MetricsState) => T,
  equalityFn?: (a: T, b: T) => boolean
): T;
// 典型 state: modelPerf[], modelDist[], radarData[]

// src/app/store/slices/node-slice.ts
export function useNodeSlice<T>(
  selector: (state: NodeState) => T,
  equalityFn?: (a: T, b: T) => boolean
): T;
// 典型 state: nodes: NodeData[], derived: { activeRatio, avgGpu, ... }, addNode, removeNode, updateNode

// src/app/store/slices/app-slice.ts
export function useAppSlice<T>(selector: ...): T;
// 典型 state: recentOps: OperationLogItem[]

// src/app/store/slices/provider-slice.ts
export function useProviderSlice<T>(selector: ...): T;
// 典型 API: configuredModels: ConfiguredModel[], getActiveModel(), testingIds
```

---

## 3. 类型 (Types)

### 3.1 跟进类型 — followup-types.ts

**路径**: `src/app/types/followup-types.ts`

```typescript
// === 严重级别 ===
import type { BaseSeverity } from './common-types';
export type FollowUpSeverity = BaseSeverity;
// 等价于: 'info' | 'warning' | 'error' | 'critical'

// === 状态 ===
export type FollowUpStatus =
  | 'active'          // 待处理
  | 'investigating'   // 处理中
  | 'resolved'        // 已解决
  | 'ignored';        // 已忽略

// === 链路事件 ===
export type ChainEventType =
  | 'model_load'      // 模型加载
  | 'task_start'      // 任务启动
  | 'alert_trigger'   // 告警触发
  | 'auto_action'     // 自动操作
  | 'manual_action'   // 手动操作
  | 'resolved'        // 解决
  | 'system_event';   // 系统事件

export interface ChainEvent {
  id: string;
  time: string;                     // HH:mm:ss
  type: ChainEventType;
  label: string;                    // 事件标题
  detail: string;                   // 详细说明
  isCurrent?: boolean;              // 是否为当前高亮节点
}

// === 跟进卡片数据 ===
export interface FollowUpItem {
  id: string;
  severity: FollowUpSeverity;
  title: string;
  source: string;                   // 来源节点/资源
  metric?: string;                  // 超阈值指标摘要
  status: FollowUpStatus;
  timestamp: number;                // 触发时间戳 (ms)
  chain: ChainEvent[];              // 根因链
  relatedAlerts?: string[];         // 关联告警 ID
  assignee?: string;                // 处理人
  tags?: string[];                  // 标签数组
}

// === 快捷操作 ===
export interface QuickAction {
  id: string;
  label: string;
  icon: string;                     // lucide icon name
  variant: 'default' | 'primary' | 'warning' | 'danger' | 'success';
  action: () => void;
}
```

---

### 3.2 巡查类型 — patrol-types.ts

**路径**: `src/app/types/patrol-types.ts`

```typescript
// === 运行状态 ===
export type PatrolStatus =
  | 'idle'         // 空闲
  | 'running'      // 运行中
  | 'completed'    // 已完成
  | 'failed';      // 失败

// === 检查项状态 ===
export type CheckStatus =
  | 'pass'         // 通过
  | 'warning'      // 警告
  | 'critical'     // 严重
  | 'skipped';     // 跳过

// === 自动巡查间隔（分钟）===
export type PatrolInterval = 5 | 10 | 15 | 30 | 60;

// === 检查项 ===
export interface PatrolCheckItem {
  id: string;
  category: string;                 // 分类：e.g. 'GPU', 'Network', 'Storage'
  label: string;
  status: CheckStatus;
  value: string;                    // 实际值
  threshold?: string;               // 阈值 e.g. "> 90%"
  detail?: string;                  // 说明/建议
}

// === 巡查结果 ===
export interface PatrolResult {
  id: string;
  timestamp: number;                // 开始时间 ms
  duration: number;                 // 耗时 ms
  status: PatrolStatus;
  healthScore: number;              // 健康评分 0-100
  totalChecks: number;
  passCount: number;
  warningCount: number;
  criticalCount: number;
  skippedCount: number;
  checks: PatrolCheckItem[];
  triggeredBy: 'manual' | 'auto' | 'scheduled';
}

// === 调度配置 ===
export interface PatrolSchedule {
  enabled: boolean;
  interval: PatrolInterval;
  lastRun: number | null;           // 上次运行 ms timestamp
  nextRun: number | null;           // 下次运行 ms timestamp
}
```

---

### 3.3 告警规则类型 — alert-rules-types.ts

**路径**: `src/app/types/alert-rules-types.ts`

```typescript
// === 严重级别 ===
export type AlertSeverity =
  | 'info'
  | 'warning'
  | 'error'
  | 'critical';

// === 指标类型 ===
export type AlertMetric =
  | 'cpu'          // CPU 利用率
  | 'gpu'          // GPU 利用率
  | 'memory'       // 内存 / 显存
  | 'latency'      // 推理延迟
  | 'disk'         // 磁盘
  | 'network'      // 网络
  | 'error_rate'   // 错误率
  | 'throughput';  // 吞吐量

// === 比较条件 ===
export type AlertCondition =
  | 'gt'    // >  greater than
  | 'lt'    // <  less than
  | 'gte'   // >= greater than or equal
  | 'lte'   // <= less than or equal
  | 'eq'    // == equal
  | 'neq';  // != not equal

// === 升级等级 ===
export type EscalationLevel = 1 | 2 | 3;

// === 阈值 ===
export interface AlertThreshold {
  metric: AlertMetric;
  condition: AlertCondition;
  value: number;
  unit: string;                     // e.g. '%', 'ms', 'GB'
  duration: number;                 // 持续触发时长 (秒)
}

// === 升级策略 ===
export interface EscalationPolicy {
  level: EscalationLevel;           // 1/2/3 级
  delayMinutes: number;             // X 分钟未处理则升级
  notifyChannels: string[];         // e.g. ['email', 'sms', 'wecom']
  autoAction?: string;              // 自动操作 ID
}

// === 告警规则 ===
export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  severity: AlertSeverity;
  thresholds: AlertThreshold[];
  aggregation: {
    enabled: boolean;
    windowMinutes: number;          // 聚合时间窗
    maxGroupSize: number;           // 每窗口最大触发数
  };
  deduplication: {
    enabled: boolean;
    cooldownMinutes: number;        // 去重冷却期
  };
  escalation: EscalationPolicy[];   // 最多 3 级
  targets: string[];                // 生效目标 (node IDs 或 '*')
  createdAt: number;
  lastTriggered: number | null;
  triggerCount: number;
}

// === 触发的告警事件 ===
export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  metric: AlertMetric;
  currentValue: number;
  threshold: number;
  nodeId: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  escalationLevel: EscalationLevel;
}

// === Hook Options ===
export interface AlertRulesOptions {
  liveNodes?: {
    id: string;
    gpu: number;
    mem: number;
    temp: number;
    status: string;
  }[];
  liveLatency?: number;
}
```

---

### 3.4 通用基础类型 — common-types.ts

**路径**: `src/app/types/common-types.ts`

```typescript
/**
 * 统一严重级别（RF-005）
 * Monitor 模块多处引用此基础类型别名
 */
export type BaseSeverity =
  | 'info'       // 提示
  | 'warning'    // 警告
  | 'error'      // 错误
  | 'critical';  // 严重
```

---

### 3.5 SDK 对话类型 — sdk-types.ts（关键片段）

**路径**: `src/app/types/sdk-types.ts`

```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelId?: string;
  tokens?: number;
  error?: boolean;
}

export type SDKConnectionStatus =
  | 'idle'         // 未连接
  | 'connecting'   // 连接中
  | 'connected'    // 已连接
  | 'error';       // 错误
```

---

### 3.6 模型配置类型 — model-provider-types.ts（关键片段）

```typescript
export interface ConfiguredModel {
  id: string;                              // modelId
  model: string;                           // 模型显示名
  provider: string;                        // Provider key e.g. 'openai'
  status: 'active' | 'inactive' | 'error' | 'testing';
  baseUrl?: string;
  apiKeyMasked?: string;
  capabilities: string[];                  // e.g. ['chat','vision','tools']
  maxTokens?: number;
  temperature?: number;
}
```

---

### 3.7 节点类型 — node-types.ts（关键片段）

```typescript
export type NodeStatus = 'active' | 'warning' | 'inactive' | 'error';

export interface NodeData {
  id: string;
  status: NodeStatus;
  gpu: number;         // 0-100 %
  mem: number;         // 0-100 %
  temp: number;        // °C
  model: string;
  tasks: number;
  // ... 其他字段: cpu, networkIn, networkOut, uptime 等
}
```

---

## 4. 索引

### 按字母顺序查找

| 名称 | 类型 | 章节 |
|------|------|------|
| `ActionRecommender` | 组件 | 1.16 |
| `AlertBanner` | 组件 | 1.12 |
| `AlertCondition` | 类型 | 3.3 |
| `AlertEvent` | 类型 | 3.3 |
| `AlertMetric` | 类型 | 3.3 |
| `AlertRule` | 类型 | 3.3 |
| `AlertRulesOptions` | 类型 | 3.3 |
| `AlertRulesPanel` | 组件 | 1.13 |
| `AlertSeverity` | 类型 | 3.3 |
| `AISuggestionPanel` | 组件 | 1.15 |
| `BaseSeverity` | 类型 | 3.4 |
| `ChainEvent` | 类型 | 3.1 |
| `ChainEventType` | 类型 | 3.1 |
| `CheckStatus` | 类型 | 3.2 |
| `ConfiguredModel` | 类型 | 3.6 |
| `CreateRuleModal` | 组件 | 1.14 |
| `Dashboard` | 组件 | 1.1 |
| `DataMonitoring` | 组件 | 1.2 |
| `EscalationLevel` | 类型 | 3.3 |
| `EscalationPolicy` | 类型 | 3.3 |
| `FollowUpCard` | 组件 | 1.5 |
| `FollowUpDrawer` | 组件 | 1.6 |
| `FollowUpEditDialog` | 组件 | 1.7 |
| `FollowUpItem` | 类型 | 3.1 |
| `FollowUpManager` | 组件 | 1.4 |
| `FollowUpPanel` | 组件 | 1.3 |
| `FollowUpSeverity` | 类型 | 3.1 |
| `FollowUpStatus` | 类型 | 3.1 |
| `NodeData` | 类型 | 3.7 |
| `NodeDetailModal` | 组件 | 1.20 |
| `PatrolCheckItem` | 类型 | 3.2 |
| `PatrolDashboard` | 组件 | 1.8 |
| `PatrolHistory` | 组件 | 1.11 |
| `PatrolInterval` | 类型 | 3.2 |
| `PatrolReport` | 组件 | 1.9 |
| `PatrolResult` | 类型 | 3.2 |
| `PatrolSchedule` | 类型 | 3.2 |
| `PatrolScheduler` | 组件 | 1.10 |
| `PatrolStatus` | 类型 | 3.2 |
| `PatternAnalyzer` | 组件 | 1.17 |
| `QuickAction` | 类型 | 3.1 |
| `QuickActionGroup` | 组件 | 1.19 |
| `SDKChatPanel` | 组件 | 1.18 |
| `SDKConnectionStatus` | 类型 | 2.4 / 3.5 |
| `UnifiedModelSelector` | 组件 | 1.21 |
| `useAlertRules` | Hook | 2.2 |
| `useAISuggestion` | Hook | 2.3 |
| `useAlerts` | Hook | 2.7 |
| `useBigModelSDK` | Hook | 2.4 |
| `useI18n` | Hook | 2.6 |
| `usePatrol` | Hook | 2.1 |
| `useWebSocketData` | Hook | 2.5 |

---

> **言启千行代码，语枢万物智能**
> *Words inspire thousands of lines of code, language pivots the intelligence of all things*
>
> **品牌**: YanYuCloudCube · 言雨云枢
> **产品**: YYC³ CloudPivot Intelli-Matrix
> **模块说明**: `./README.md`
> **组件手册**: `./COMPONENTS.md`
> **技术支持**: dev-support@yanyucloudcube.com
