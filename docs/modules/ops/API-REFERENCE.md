---
file: API-REFERENCE.md
description: OPS 运维与操作中心模块 API 参考文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [guide],[ops],[api],[reference]
category: reference
language: zh-CN
audience: developers
complexity: intermediate
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📑 目录

- [总览](#总览)
  - [导入方式](#导入方式)
  - [导出分类](#导出分类)
- [组件 API](#组件-api)
  - [操作中心](#操作中心-1)
  - [文件管理](#文件管理-1)
  - [数据库](#数据库-1)
  - [服务闭环](#服务闭环-1)
  - [报告导出](#报告导出-1)
  - [监控日志](#监控日志-1)
- [Hook API](#hook-api)
- [类型定义](#类型定义)
- [服务类](#服务类)

---

## 总览

### 导入方式

所有 OPS 模块导出均通过 Barrel 文件 `index.ts` 统一导出，支持 Tree Shaking：

```typescript
// ✅ 推荐：命名导入 (Tree Shaking 友好)
import {
  OperationCenter,
  DatabaseManager,
  ServiceLoopPanel,
  useOperationCenter,
  type OperationLog,
} from '@/app/modules/ops';

// ❌ 不推荐：默认导入整个模块
// import OPS from '@/app/modules/ops';
```

### 导出分类

| 类别 | 数量 | 说明 |
|:----:|:----:|:-----|
| **React 组件** | 19 | 功能组件：面板、卡片、浏览器、查看器等 |
| **自定义 Hooks** | 5 | 状态与业务逻辑封装（从 `../../hooks` 再导出） |
| **TypeScript 类型** | 60+ | 接口、枚举、联合类型（从 `../../types` 再导出） |
| **服务类** | 2 | 数据库连接管理、文件系统操作（Electron 端） |

---

## 组件 API

### 操作中心

---

#### OperationCenter

```typescript
/**
 * 操作中心主面板组件
 * 整合操作分类、快捷操作、模板管理、实时日志流
 *
 * @route /operations
 * @category Operations Center
 * @complexity intermediate
 */
export function OperationCenter(props: OperationCenterProps): JSX.Element;

interface OperationCenterProps {
  /** 初始选中的操作分类 ID */
  initialCategory?: string;
  /** 是否隐藏操作模板区域 */
  hideTemplates?: boolean;
  /** 是否隐藏日志流区域 */
  hideLogStream?: boolean;
  /** 额外注入的自定义快捷操作列表 */
  customActions?: QuickAction[];
  /** 自定义根类名 */
  className?: string;
  /** 自定义根样式 */
  style?: React.CSSProperties;
}
```

**返回值**：`JSX.Element` — 操作中心完整 UI

**示例**：
```tsx
<OperationCenter
  initialCategory="database"
  hideTemplates={false}
  customActions={[
    { id: 'backup', label: '一键备份', icon: Save, onClick: doBackup }
  ]}
/>
```

---

#### OperationChain

```typescript
/**
 * 可视化操作链编排器
 * 拖拽创建节点、配置依赖关系、模拟执行路径
 *
 * @category Operations Center
 * @complexity advanced
 */
export function OperationChain(props: OperationChainProps): JSX.Element;

interface OperationChainProps {
  /** 预加载的操作链节点 */
  initialNodes?: ChainNode[];
  /** 预加载的节点连接边 */
  initialEdges?: ChainEdge[];
  /** 只读模式（禁用编辑） */
  readOnly?: boolean;
  /** 保存操作链回调 */
  onSave?: (chain: OperationChainData) => Promise<void>;
  /** 操作链最大节点数限制 */
  maxNodes?: number;
}
```

---

#### OperationCategory

```typescript
/**
 * 操作分类导航 Tabs
 * 支持横向滚动、分类徽标、权限过滤
 *
 * @category Operations Center
 * @complexity basic
 */
export function OperationCategory(props: OperationCategoryProps): JSX.Element;

interface OperationCategoryProps {
  /** 分类列表 */
  categories: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType;
    badge?: number;
  }>;
  /** 当前激活分类 ID (受控) */
  active: string;
  /** 切换分类回调 */
  onChange: (categoryId: string) => void;
  /** 样式变体 */
  variant?: 'tabs' | 'pills' | 'sidebar';
}
```

---

#### OperationLogStream

```typescript
/**
 * 虚拟滚动操作日志流
 * 实时追加、级别过滤、正则搜索、自动滚动
 *
 * @category Operations Center
 * @complexity intermediate
 */
export function OperationLogStream(props: OperationLogStreamProps): JSX.Element;

interface OperationLogStreamProps {
  /** 日志数组 (按时间升序) */
  logs: OperationLog[];
  /** 日志级别过滤 */
  filter?: 'all' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  /** 过滤变化回调 */
  onFilterChange?: (f: LogLevel | 'all') => void;
  /** 搜索关键词，支持 /pattern/flags 正则 */
  searchQuery?: string;
  /** 搜索变化回调 */
  onSearchChange?: (q: string) => void;
  /** 是否移动端布局优化 */
  isMobile?: boolean;
  /** 新日志自动滚动到底部 */
  autoScroll?: boolean;
  /** 虚拟滚动缓冲区最大日志数 */
  maxVisible?: number;
}
```

---

#### OperationTemplate

```typescript
/**
 * 操作模板管理面板
 * CRUD、参数化配置、一键执行、导入导出
 *
 * @category Operations Center
 * @complexity intermediate
 */
export function OperationTemplate(props: OperationTemplateProps): JSX.Element;

interface OperationTemplateProps {
  /** 模板列表 */
  templates: OperationTemplateItem[];
  /** 执行模板回调 */
  onRunTemplate: (templateId: string, params?: Record<string, any>) => Promise<void>;
  /** 删除模板回调 */
  onDeleteTemplate: (templateId: string) => Promise<void>;
  /** 新增模板回调 */
  onAddTemplate: (template: Omit<OperationTemplateItem, 'id'>) => Promise<void>;
  /** 导出模板回调，默认下载 JSON */
  onExport?: (templates: OperationTemplateItem[]) => void;
}
```

---

### 文件管理

---

#### LocalFileManager

```typescript
/**
 * 本地文件管理器入口
 * 文件浏览 + 日志查看 + 报告生成 三 Tab 整合
 *
 * @route /files
 * @category File Management
 * @complexity intermediate
 */
export function LocalFileManager(props: LocalFileManagerProps): JSX.Element;

interface LocalFileManagerProps {
  /** 初始激活 Tab */
  initialTab?: 'files' | 'logs' | 'reports';
  /** 文件浏览根路径（默认用户数据目录） */
  rootPath?: string;
  /** 是否允许文件上传 */
  allowUpload?: boolean;
  /** Tab 切换回调 */
  onTabChange?: (tab: 'files' | 'logs' | 'reports') => void;
}
```

---

#### FileBrowser

```typescript
/**
 * 文件浏览器
 * 树形目录 + 文件列表 + 预览面板三栏布局
 *
 * @category File Management
 * @complexity intermediate
 */
export function FileBrowser(props: FileBrowserProps): JSX.Element;

interface FileBrowserProps {
  /** 浏览根路径 */
  rootPath: string;
  /** 白名单后缀，传了仅这些文件可编辑 */
  allowedExtensions?: string[];
  /** 是否启用预览面板 */
  enablePreview?: boolean;
  /** 单击选中文件回调 */
  onFileSelect?: (file: FileItem) => void;
  /** 双击打开文件回调 */
  onFileOpen?: (file: FileItem) => void;
  /** 是否允许多选 */
  multiSelect?: boolean;
}
```

---

#### HostFileManager

```typescript
/**
 * 主机文件管理器（Electron 桌面端专用）
 * 跨分区访问、大文件分片、系统目录快捷入口
 *
 * @route /host-files
 * @category File Management
 * @complexity advanced
 * @requires Electron IPC runtime
 */
export function HostFileManager(props: HostFileManagerProps): JSX.Element;

interface HostFileManagerProps {
  /** 是否允许跨分区访问 */
  enableCrossPartition?: boolean;
  /** 分片传输块大小（字节，默认 8MB） */
  chunkSize?: number;
  /** 是否显示系统隐藏文件夹 */
  showSystemFolders?: boolean;
}
```

---

### 数据库

---

#### DatabaseManager

```typescript
/**
 * 数据库一站式管理面板
 * 连接管理 / 表浏览 / SQL 查询 / 查询历史 / 备份恢复
 *
 * @route /database
 * @category Database
 * @complexity advanced
 */
export function DatabaseManager(props: DatabaseManagerProps): JSX.Element;

type ActiveTab = 'connections' | 'tables' | 'query' | 'history' | 'backups';

interface DatabaseManagerProps {
  /** 初始激活 Tab */
  initialTab?: ActiveTab;
  /** 预选中的数据库连接 ID */
  defaultConnectionId?: string;
  /** 只读模式（禁用 DML/DDL 语句） */
  readOnly?: boolean;
  /** 查询超时毫秒（默认 30000） */
  queryTimeout?: number;
}
```

---

#### DatabaseConnectionPanel

```typescript
/**
 * 数据库连接配置面板
 * 精细化参数：SSL、SSH 隧道、连接池
 *
 * @route /db-connections
 * @category Database
 * @complexity intermediate
 */
export function DatabaseConnectionPanel(props: DatabaseConnectionPanelProps): JSX.Element;

interface DatabaseConnectionPanelProps {
  /** 编辑模式下传入连接 ID，不传则为新建 */
  connectionId?: string;
  /** 是否显示「测试连接」按钮 */
  allowTest?: boolean;
  /** 保存成功回调 */
  onSaved?: (connection: DBConnectionConfig) => void;
}
```

---

### 服务闭环

---

#### ServiceLoopPanel

```typescript
/**
 * 五阶段服务闭环流程主控面板
 * 采集 → 检测 → 分析 → 修复 → 验证
 *
 * @route /loop
 * @category Service Loop
 * @complexity advanced
 */
export function ServiceLoopPanel(props: ServiceLoopPanelProps): JSX.Element;

type StageKey = 'collect' | 'detect' | 'analyze' | 'repair' | 'verify';

interface ServiceLoopPanelProps {
  /** 自动模式默认开关（默认 false） */
  autoModeDefault?: boolean;
  /** 自动触发间隔分钟（默认 240 = 4h） */
  autoIntervalMin?: number;
  /** 单次闭环完成回调 */
  onLoopComplete?: (result: LoopResult) => void;
  /** 启用的阶段，默认全部启用 */
  enableStages?: StageKey[];
}

interface LoopResult {
  runId: string;
  success: boolean;
  successRate: number;      // 0 ~ 1
  totalDurationMs: number;
  stageResults: Record<StageKey, StageResult>;
  triggeredAt: number;
  trigger: 'manual' | 'auto' | 'alert';
}
```

---

#### LoopStageCard

```typescript
/**
 * 服务闭环单个阶段卡片
 * 可展开查看执行详情、耗时、输入输出
 *
 * @category Service Loop
 * @complexity basic
 */
export function LoopStageCard(props: LoopStageCardProps): JSX.Element;

type StageStatus = 'idle' | 'running' | 'success' | 'failed' | 'skipped';

interface LoopStageCardProps {
  /** 阶段元数据 */
  stage: LoopStageMeta;
  /** 阶段当前状态 */
  status: StageStatus;
  /** 阶段执行耗时（毫秒） */
  durationMs?: number;
  /** 输入数据摘要 */
  inputSummary?: string;
  /** 输出数据摘要 */
  outputSummary?: string;
  /** 失败时的错误信息 */
  errorMessage?: string;
  /** 是否默认展开详情 */
  defaultExpanded?: boolean;
}

interface LoopStageMeta {
  key: StageKey;
  order: number;
  title: string;
  description: string;
  icon: React.ComponentType;
}
```

---

#### ServiceConnectionTest

```typescript
/**
 * 服务连接测试面板
 * Ping/TCP/HTTP 三种模式，连续测试，延迟可视化
 *
 * @route /connection-test
 * @category Service Loop
 * @complexity intermediate
 */
export function ServiceConnectionTest(props: ServiceConnectionTestProps): JSX.Element;

type TestMode = 'ping' | 'tcp' | 'http';

interface ServiceConnectionTestProps {
  /** 默认目标地址 host:port */
  defaultTarget?: string;
  /** 默认测试模式 */
  defaultMode?: TestMode;
  /** 延迟折线图最大数据点数（默认 60） */
  maxHistoryPoints?: number;
}
```

---

### 报告导出

---

#### ReportExporter

```typescript
/**
 * 报告导出主控面板
 * 4 类报告 × 3 种格式、时间范围、趋势图表、KPI 卡
 *
 * @route /reports
 * @category Reports & Export
 * @complexity advanced
 */
export function ReportExporter(props: ReportExporterProps): JSX.Element;

type ReportType   = 'performance' | 'security' | 'audit' | 'comprehensive';
type TimeRange    = '1h' | '6h' | '24h' | '7d' | '30d';
type ExportFormat = 'json' | 'csv' | 'print';  // print = 打印/PDF

interface ReportExporterProps {
  /** 默认报告类型 */
  defaultType?: ReportType;
  /** 默认时间范围 */
  defaultRange?: TimeRange;
  /** 隐藏部分报告类型选项 */
  hideTypes?: ReportType[];
  /** 隐藏部分导出格式 */
  hideFormats?: ExportFormat[];
  /** 注入自定义 KPI 卡片 */
  customKPIs?: KPICard[];
}

interface KPICard {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  change?: string;       // e.g. '+8.3%'
  color?: string;        // e.g. '#00ff88'
}
```

---

#### ReportGenerator

```typescript
/**
 * 底层报告生成引擎
 * 数据聚合、模板渲染、异步进度追踪
 *
 * @category Reports & Export
 * @complexity advanced
 */
export function ReportGenerator(props: ReportGeneratorProps): JSX.Element | null;

interface ReportGeneratorProps {
  /** 报告类型 */
  type: ReportType;
  /** 时间范围 */
  range: TimeRange;
  /** 使用的报告模板 ID，不传用默认 */
  templateId?: string;
  /** 组件挂载即开始生成 */
  autoStart?: boolean;
  /** 生成进度回调 0~100 */
  onProgress?: (progress: number) => void;
  /** 生成完成回调 */
  onComplete?: (report: GeneratedReport) => void;
}

interface GeneratedReport {
  id: string;
  type: ReportType;
  range: TimeRange;
  title: string;
  summary: {
    totalRecords: number;
    generatedAt: number;
    durationMs: number;
  };
  sections: ReportSection[];
  charts: ChartConfig[];
  rawData: Record<string, any>;
}
```

---

#### ConfigExportCenter

```typescript
/**
 * 配置导出/导入迁移中心
 * 分类导出、Diff 对比预览、加密导出、版本标签
 *
 * @route /export-center
 * @category Reports & Export
 * @complexity intermediate
 */
export function ConfigExportCenter(props: ConfigExportCenterProps): JSX.Element;

type ConfigFormat = 'yaml' | 'json' | 'env';

interface ConfigExportCenterProps {
  /** 默认导出格式 */
  defaultFormat?: ConfigFormat;
  /** 是否启用加密导出选项 */
  enableEncryption?: boolean;
  /** 隐藏的配置分类 ID 列表 */
  hideCategories?: string[];
  /** 自定义导出逻辑（默认下载为文件） */
  onExport?: (content: string, meta: ExportMeta) => void;
  /** 自定义导入应用逻辑 */
  onImport?: (config: ImportConfig) => Promise<ApplyResult>;
}

interface ExportMeta {
  format: ConfigFormat;
  categories: string[];
  versionTag: string;
  encrypted: boolean;
  exportedAt: number;
  checksum: string;
}

interface ApplyResult {
  success: boolean;
  applied: number;      // 成功应用的配置项数
  skipped: number;      // 跳过的配置项数
  failed: number;       // 失败数
  errors?: string[];
}
```

---

### 监控日志

---

#### ConnectionMonitorPanel

```typescript
/**
 * 全服务连接实时监控看板
 * 连接列表、延迟折线图、连接池使用率、告警配置
 *
 * @route /connection-monitor
 * @category Monitor & Logs
 * @complexity intermediate
 */
export function ConnectionMonitorPanel(props: ConnectionMonitorPanelProps): JSX.Element;

interface ConnectionMonitorPanelProps {
  /** 刷新间隔毫秒（默认 10000 = 10s） */
  refreshIntervalMs?: number;
  /** 告警阈值配置 */
  alertThresholds?: AlertThresholds;
  /** 自定义监控服务列表（不传自动发现） */
  services?: MonitoredService[];
}

interface AlertThresholds {
  /** 延迟 > 此值黄色警告（毫秒） */
  latencyWarnMs?: number;
  /** 延迟 > 此值红色严重（毫秒） */
  latencyErrorMs?: number;
  /** 连接池使用率 > 此值警告（百分比 0~100） */
  poolUsageWarnPct?: number;
  /** 连接池使用率 > 此值严重（百分比 0~100） */
  poolUsageErrorPct?: number;
  /** 断开立即通知 */
  disconnectNotify?: boolean;
}

interface MonitoredService {
  id: string;
  name: string;
  type: 'http' | 'tcp' | 'database' | 'redis' | 'ws';
  endpoint: string;
  expectedStatus?: number;  // HTTP 预期状态码
}
```

---

#### LogViewer

```typescript
/**
 * 多源日志统一查看器
 * 来源过滤、级别过滤、时间窗口、高亮规则、导出
 *
 * @category Monitor & Logs
 * @complexity intermediate
 */
export function LogViewer(props: LogViewerProps): JSX.Element;

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

interface LogViewerProps {
  /** 可选日志源白名单（不传 = 所有来源） */
  sources?: string[];
  /** 初始级别过滤（默认 INFO） */
  initialLevel?: LogLevel;
  /** 初始时间窗口起点 ms 时间戳（默认 1h 前） */
  initialStart?: number;
  /** 初始时间窗口终点 ms 时间戳（默认 now） */
  initialEnd?: number;
  /** 是否显示导出按钮 */
  enableExport?: boolean;
  /** 自定义行高亮规则 */
  lineHighlightRules?: HighlightRule[];
}

interface HighlightRule {
  /** 匹配正则 */
  pattern: RegExp;
  /** 高亮背景色 */
  bgColor?: string;
  /** 高亮文字色 */
  textColor?: string;
  /** 是否整行加粗 */
  bold?: boolean;
}
```

---

## Hook API

### useOperationCenter

```typescript
/**
 * 操作中心状态与业务逻辑 Hook
 * 管理分类、操作、模板、日志、搜索过滤
 *
 * @hook
 * @category Operations Center
 */
export function useOperationCenter(): UseOperationCenterReturn;

interface UseOperationCenterReturn {
  // ── 分类 ──────────────────────────────
  categories: OperationCategoryItem[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;

  // ── 快捷操作 ──────────────────────────
  actions: QuickAction[];
  isExecuting: boolean;
  executeAction: (actionId: string, params?: any) => Promise<ActionResult>;

  // ── 模板 ──────────────────────────────
  templates: OperationTemplateItem[];
  runTemplate: (tplId: string, overrides?: Record<string, any>) => Promise<void>;
  addTemplate: (tpl: Omit<OperationTemplateItem, 'id' | 'createdAt'>) => Promise<void>;
  deleteTemplate: (tplId: string) => Promise<void>;

  // ── 日志流 ────────────────────────────
  logs: OperationLog[];
  logFilter: LogLevel | 'all';
  setLogFilter: (f: LogLevel | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}
```

---

### useLocalFileSystem

```typescript
/**
 * 本地文件系统操作 Hook
 * 封装 IndexedDB + Electron IPC 双端实现
 *
 * @hook
 * @category File Management
 */
export function useLocalFileSystem(): UseLocalFileSystemReturn;

interface UseLocalFileSystemReturn {
  // 浏览
  currentPath: string;
  setCurrentPath: (p: string) => void;
  files: FileItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;

  // 操作
  readFile:    (path: string) => Promise<{ content: string; encoding: string }>;
  writeFile:   (path: string, content: string) => Promise<boolean>;
  deleteFile:  (path: string) => Promise<boolean>;
  renameFile:  (oldPath: string, newPath: string) => Promise<boolean>;
  createDir:   (path: string) => Promise<boolean>;
  uploadFiles: (files: FileList | File[], targetDir?: string) => Promise<UploadResult[]>;

  // 快捷操作
  downloadLogs:   () => void;
  clearCache:     () => Promise<void>;
  exportConfig:   () => void;
  getStorageUsed: () => Promise<{ usedBytes: number; quotaBytes: number }>;
}
```

---

### useLocalDatabase

```typescript
/**
 * 本地数据库管理 Hook
 * 连接 CRUD、SQL 执行、备份恢复
 *
 * @hook
 * @category Database
 */
export function useLocalDatabase(): UseLocalDatabaseReturn;

interface UseLocalDatabaseReturn {
  // 连接管理
  connections: DBConnectionConfig[];
  activeConnectionId: string | null;
  setActiveConnection: (id: string | null) => void;
  addConnection: (cfg: Omit<DBConnectionConfig, 'id'>) => Promise<void>;
  updateConnection: (id: string, cfg: Partial<DBConnectionConfig>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  testConnection: (cfg: DBConnectionConfig) => Promise<TestResult>;

  // 查询
  executeQuery: (sql: string, connectionId?: string) => Promise<QueryResult>;
  queryHistory: QueryHistoryItem[];
  clearHistory: () => void;

  // 表
  tables: TableInfo[];
  describeTable: (tableName: string) => Promise<ColumnInfo[]>;

  // 备份恢复
  createBackup: (opts: BackupOptions) => Promise<BackupInfo>;
  listBackups: () => Promise<BackupInfo[]>;
  restoreBackup: (backupId: string, opts?: RestoreOptions) => Promise<RestoreResult>;
  deleteBackup: (backupId: string) => Promise<void>;
}
```

---

### useServiceLoop

```typescript
/**
 * 服务闭环状态机 Hook
 * 五阶段执行、历史记录、统计指标
 *
 * @hook
 * @category Service Loop
 */
export function useServiceLoop(): UseServiceLoopReturn;

interface UseServiceLoopReturn {
  // 状态
  currentRun: LoopRun | null;
  history: LoopRun[];
  isRunning: boolean;
  autoMode: boolean;
  setAutoMode: (enabled: boolean) => void;
  currentStageIndex: number;

  // 统计
  stats: {
    totalRuns: number;
    successRate: number;
    avgDurationMs: number;
    lastRunAt: number | null;
  };

  // 操作
  startLoop:    (trigger?: 'manual' | 'auto') => Promise<void>;
  abortLoop:    () => void;
  clearHistory: () => void;

  // 元数据
  stageMeta: LoopStageMeta[];
  dataFlowNodes: DataFlowNode[];
  dataFlowEdges: DataFlowEdge[];
}
```

---

### useReportExporter

```typescript
/**
 * 报告导出逻辑 Hook
 * 类型/范围切换、生成、导出
 *
 * @hook
 * @category Reports & Export
 */
export function useReportExporter(): UseReportExporterReturn;

interface UseReportExporterReturn {
  // 选择器状态
  reportType: ReportType;
  setReportType: (t: ReportType) => void;
  timeRange: TimeRange;
  setTimeRange: (r: TimeRange) => void;

  // 生成
  isGenerating: boolean;
  report: GeneratedReport | null;
  recentReports: GeneratedReport[];
  generateReport: () => Promise<void>;

  // 导出
  exportReport: (format: ExportFormat, reportId?: string) => Promise<void>;
}
```

---

## 类型定义

### 日志相关类型

```typescript
/** 操作日志条目 */
export interface OperationLog {
  id: string;
  timestamp: number;                                    // ms 时间戳
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  source: string;                                       // 来源模块
  operationId?: string;                                 // 关联操作 ID
  traceId?: string;                                     // 分布式追踪 ID
  message: string;                                      // 主消息
  details?: Record<string, any>;                        // 结构化详情
  stackTrace?: string;                                  // 错误堆栈
}

/** 日志级别类型 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
```

### 操作中心类型

```typescript
/** 操作分类项 */
export interface OperationCategoryItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  description?: string;
  badge?: number;
  requiredRole?: string;  // 权限控制
}

/** 快捷操作 */
export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  color?: string;
  dangerLevel?: 'normal' | 'warning' | 'critical';
  requireConfirm?: boolean;
  onClick: (params?: any) => Promise<any> | any;
  disabled?: boolean;
  hotkey?: string;
}

/** 操作模板 */
export interface OperationTemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  steps: TemplateStep[];
  params: TemplateParam[];
  createdAt: number;
  updatedAt: number;
  lastRunAt?: number;
  runCount: number;
  tags?: string[];
}

/** 操作模板步骤 */
export interface TemplateStep {
  id: string;
  order: number;
  actionId: string;
  paramsMapping: Record<string, string>;
  timeoutMs?: number;
  continueOnError?: boolean;
  retryCount?: number;
}

/** 操作模板参数声明 */
export interface TemplateParam {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'password' | 'textarea';
  required?: boolean;
  default?: any;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
}
```

### 数据库相关类型

```typescript
/** 支持的数据库类型 */
export type DatabaseType = 'postgresql' | 'mysql' | 'redis' | 'sqlite' | 'mongodb' | 'custom';

/** 数据库连接配置 */
export interface DBConnectionConfig {
  id: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;                           // 加密存储
  ssl?: DBSSLConfig;
  sshTunnel?: DBSSHTunnelConfig;
  pool?: DBPoolConfig;
  createdAt: number;
  updatedAt: number;
  lastConnectedAt?: number;
}

/** SSL 配置 */
export interface DBSSLConfig {
  enabled: boolean;
  caCert?: string;
  clientCert?: string;
  clientKey?: string;
  rejectUnauthorized?: boolean;
}

/** SSH 隧道配置 */
export interface DBSSHTunnelConfig {
  enabled: boolean;
  host: string;
  port: number;
  user: string;
  authType: 'password' | 'privateKey';
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

/** 连接池配置 */
export interface DBPoolConfig {
  min: number;           // 最小连接数 (默认 1)
  max: number;           // 最大连接数 (默认 10)
  idleTimeout: number;   // 空闲超时秒 (默认 1800)
  acquireTimeout: number;// 获取连接超时秒 (默认 30)
}

/** SQL 查询结果 */
export interface QueryResult {
  success: boolean;
  rows?: Record<string, any>[];
  rowCount?: number;
  affectedRows?: number;
  fields?: FieldInfo[];
  error?: string;
  executionMs: number;
  query: string;
}

/** 表信息 */
export interface TableInfo {
  name: string;
  schema?: string;
  type: 'table' | 'view' | 'materialized-view';
  rowsEstimate?: number;
  sizeBytes?: number;
  comment?: string;
}

/** 列信息 */
export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  defaultValue?: string;
  comment?: string;
}
```

### 报告相关类型

```typescript
/** 报告类型 */
export type ReportType = 'performance' | 'security' | 'audit' | 'comprehensive';

/** 时间范围 */
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

/** 导出格式 */
export type ExportFormat = 'json' | 'csv' | 'print';

/** 生成的报告 */
export interface GeneratedReport {
  id: string;
  type: ReportType;
  range: TimeRange;
  title: string;
  subtitle?: string;
  generatedAt: number;
  durationMs: number;
  summary: ReportSummary;
  sections: ReportSection[];
  charts: ChartConfig[];
  rawData: Record<string, any>;
}

/** 报告摘要 */
export interface ReportSummary {
  totalRecords: number;
  anomalyCount?: number;
  alertCount?: number;
  overallScore?: number;     // 0~100
  recommendations?: string[];
}

/** 报告章节 */
export interface ReportSection {
  id: string;
  title: string;
  order: number;
  content: string;            // Markdown 字符串
  metrics?: SectionMetric[];
  tables?: SectionTable[];
}

/** KPI 指标 */
export interface SectionMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  changePct?: number;
  color?: string;
}

/** 节内表格 */
export interface SectionTable {
  title?: string;
  headers: string[];
  rows: (string | number)[][];
}
```

### 服务闭环类型

```typescript
/** 闭环阶段 Key */
export type StageKey = 'collect' | 'detect' | 'analyze' | 'repair' | 'verify';

/** 单次闭环运行记录 */
export interface LoopRun {
  runId: string;
  trigger: 'manual' | 'auto' | 'alert';
  startedAt: number;
  endedAt?: number;
  status: 'running' | 'success' | 'failed' | 'aborted';
  stages: Record<StageKey, StageResult>;
  successRate: number;
  errorMessage?: string;
}

/** 阶段执行结果 */
export interface StageResult {
  key: StageKey;
  status: StageStatus;
  startedAt?: number;
  endedAt?: number;
  durationMs?: number;
  inputCount?: number;
  outputCount?: number;
  details?: any;
  errorMessage?: string;
}

/** 阶段状态 */
export type StageStatus = 'idle' | 'running' | 'success' | 'failed' | 'skipped';
```

---

## 服务类

### ConnectionManager（跨平台数据库连接管理）

```typescript
/**
 * 跨平台数据库连接管理器
 * Electron 端走原生驱动，Web 端走 WebSocket / REST 代理
 *
 * @service
 * @singleton
 * @category Database
 */
import { ConnectionManager } from '@/database/ConnectionManager';

// ── 构造 & 单例 ──────────────────────────────────────
/** 获取全局单例 */
static getInstance(): ConnectionManager;

// ── 连接生命周期 ────────────────────────────────────
/** 新建连接并加入连接池 */
connect(config: DBConnectionConfig): Promise<ConnectionHandle>;
/** 断开指定连接 */
disconnect(connectionId: string): Promise<boolean>;
/** 测试连接（不加入连接池） */
test(config: DBConnectionConfig, timeoutMs?: number): Promise<TestResult>;
/** 获取连接句柄 */
getConnection(connectionId: string): ConnectionHandle | null;
/** 列出所有活跃连接 */
listConnections(): ConnectionHandle[];

// ── 查询操作 ────────────────────────────────────────
/** 执行 SQL 查询 */
query(connectionId: string, sql: string, params?: any[]): Promise<QueryResult>;
/** 执行事务 (一组 SQL) */
transaction(connectionId: string, statements: SQLStatement[]): Promise<TransactionResult>;
/** 取消正在执行的查询 */
cancelQuery(connectionId: string, queryId: string): Promise<boolean>;

// ── 状态检查 ────────────────────────────────────────
/** 检查连接是否健康 */
ping(connectionId: string): Promise<boolean>;
/** 获取连接池统计指标 */
getPoolStats(connectionId: string): PoolStats;

// ── 事件 ────────────────────────────────────────────
/** 监听事件 */
on(event: 'disconnect' | 'error' | 'acquire' | 'release', callback: EventCallback): void;
/** 取消监听 */
off(event: string, callback: EventCallback): void;
```

**使用示例**：
```typescript
const manager = ConnectionManager.getInstance();

// 测试连接
const result = await manager.test(myConfig, 5000);
console.log(result.success ? `延迟 ${result.latencyMs}ms` : result.error);

// 执行查询
const conn = await manager.connect(myConfig);
const data = await manager.query(conn.id, 'SELECT * FROM users LIMIT 100');
```

---

### FileSystemService（Electron 主机文件系统）

```typescript
/**
 * Electron 端主机文件系统服务（Web 端不可用）
 * 通过 IPC 调用主进程 Node.js fs API
 *
 * @service
 * @requires Electron runtime
 * @category File Management
 */
declare global {
  interface Window {
    electronAPI?: {
      filesystem: {
        // 浏览
        readDir(path: string, opts?: ReadDirOpts): Promise<FileItem[]>;
        stat(path: string): Promise<FileStats>;
        resolvePath(relative: string): Promise<string>;

        // 读写
        readFile(path: string, encoding?: BufferEncoding): Promise<string | Buffer>;
        readFileChunk(path: string, offset: number, length: number): Promise<Buffer>;
        writeFile(path: string, data: string | Buffer, flag?: 'w' | 'a'): Promise<void>;

        // 操作
        rename(oldPath: string, newPath: string): Promise<void>;
        copy(src: string, dest: string, onProgress?: (pct: number) => void): Promise<void>;
        move(src: string, dest: string): Promise<void>;
        remove(path: string): Promise<void>;
        mkdir(path: string, recursive?: boolean): Promise<void>;

        // 分片传输（大文件）
        startUpload(targetPath: string, fileSize: number): Promise<UploadSession>;
        uploadChunk(sessionId: string, chunkIndex: number, chunk: Buffer): Promise<void>;
        finishUpload(sessionId: string, checksum: string): Promise<boolean>;
        cancelUpload(sessionId: string): Promise<void>;

        // 系统
        getDrives(): Promise<DriveInfo[]>;            // 盘符列表 (Windows)
        getSpecialPath(name: SpecialPathName): Promise<string>;  // home / desktop / temp
        watch(path: string, callback: WatchCallback): () => void;  // 文件监听
        checkPermission(path: string, mode: 'r' | 'w'): Promise<boolean>;
      };
    };
  }
}
```

---

<div align="center">

---

**Made with ❤️ by [YanYuCloudCube Team](https://github.com/YYC-Cube)**

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***万象归元于云枢 | 深栈智启新纪元***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

---

**[模块总览 README.md](./README.md)** · **[组件文档 COMPONENTS.md](./COMPONENTS.md)** · **[项目首页](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix)** · **[在线演示](https://matrix.yyc3.top/)**

</div>
