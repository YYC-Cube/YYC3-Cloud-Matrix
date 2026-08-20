---
file: API-REFERENCE.md
description: Admin 模块 API 参考 · index.ts 全部导出签名、说明与类型
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [api],[reference],[admin],[module]
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

## 📑 目录 | Table of Contents

- [Barrel 导出清单总览](#barrel-导出清单总览)
- [组件 API 参考 (React Components)](#组件-api-参考-react-components)
  - [OperationAudit](#operationaudit)
  - [UserManagement](#usermanagement)
  - [SystemSettings](#systemsettings)
  - [UnifiedSettingsPanel](#unifiedsettingspanel)
  - [SecurityMonitor](#securitymonitor)
  - [PWAStatusPanel](#pwastatuspanel)
  - [PWAInstallPrompt](#pwainstallprompt)
  - [DataEditorPanel](#dataeditorpanel)
  - [InlineEditableTable](#inlineeditabletable)
  - [PerformanceMonitor](#performancemonitor)
  - [EnvConfigEditor](#envconfigeditor)
  - [StorageManager](#storagemanager)
  - [StorageConfigPanel](#storageconfigpanel)
  - [StorageSyncStatus](#storagesyncstatus)
  - [ConfigCenter](#configcenter)
  - [VariableCenter](#variablecenter)
  - [PageConfigEditor](#pageconfigeditor)
  - [NetworkConfig](#networkconfig)
- [纯函数 API 参考 (Pure Functions)](#纯函数-api-参考-pure-functions)
  - [formatSQLValue](#formatsqlvalue)
  - [buildUpdateSQL](#buildupdatesql)
  - [buildRollbackSQL](#buildrollbacksql)
  - [buildDeleteSQL](#builddeletesql)
  - [buildInsertSQL](#buildinsertsql)
  - [rateVital](#ratevital)
  - [riskColor](#riskcolor)
  - [statusIcon](#statusicon)
  - [vitalColor](#vitalcolor)
- [类型定义索引 (Type Definitions)](#类型定义索引-type-definitions)

---

## 📦 Barrel 导出清单总览

> 来源文件：`src/app/modules/admin/index.ts`
>
> 共导出 **18 个组件** + **5 个纯函数**（部分纯函数仅在 `InlineEditableTable.tsx` 直接 export，需直接引用该文件）

### 📋 组件导出清单 (18)

```typescript
// 1. 操作审计
export { OperationAudit } from './OperationAudit';

// 2. 用户管理
export { UserManagement } from './UserManagement';

// 3. 系统设置
export { SystemSettings } from './SystemSettings';

// 4. 统一设置面板
export { UnifiedSettingsPanel } from './UnifiedSettingsPanel';

// 5. 安全监控
export { SecurityMonitor } from './SecurityMonitor';

// 6-7. PWA 管理
export { PWAStatusPanel } from './PWAStatusPanel';
export { PWAInstallPrompt } from './PWAInstallPrompt';

// 8-9. 数据编辑
export { DataEditorPanel } from './DataEditorPanel';
export { InlineEditableTable } from './InlineEditableTable';

// 10. 性能监控
export { PerformanceMonitor } from './PerformanceMonitor';

// 11. 环境配置
export { EnvConfigEditor } from './EnvConfigEditor';

// 12-14. 存储管理
export { StorageManager } from './StorageManager';
export { StorageConfigPanel } from './StorageConfigPanel';
export { StorageSyncStatus } from './StorageSyncStatus';

// 15-18. 配置中心
export { ConfigCenter } from './ConfigCenter';
export { VariableCenter } from './VariableCenter';
export { PageConfigEditor } from './PageConfigEditor';
export { NetworkConfig } from './NetworkConfig';
```

### 🧮 纯函数导出清单 (5)

> ⚠️ 以下纯函数未通过 Barrel 统一导出，需从 `InlineEditableTable.tsx` **直接引用**

```typescript
// 直接从 InlineEditableTable.tsx 导入
import {
  formatSQLValue,
  buildUpdateSQL,
  buildRollbackSQL,
  buildDeleteSQL,
  buildInsertSQL,
} from '../admin/InlineEditableTable';
```

---

## 🧩 组件 API 参考 (React Components)

### OperationAudit

| 项 | 值 |
|:---|:---|
| **签名** | `function OperationAudit(): JSX.Element` |
| **来源** | `./OperationAudit.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props** | 无 |
| **路由** | `/audit` |
| **权限** | `admin.audit.read` |
| **State 依赖** | `useI18n`, `useLogSlice` |
| **外部类型** | `StoredLogEntry` (from `../../types`) |
| **三方依赖** | `recharts`, `lucide-react`, `sonner` |

**说明**：操作审计日志页面，提供日志列表、趋势图表、风险分布、搜索筛选和导出功能。内部通过 `mapLogToAudit()` 将 `StoredLogEntry` 转换为视图模型 `AuditLog`。

**内部类型**：
```typescript
interface AuditLog {
  id: string;
  time: string;
  user: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  status: "success" | "running" | "failed" | "warning";
  risk: "low" | "medium" | "high";
}
```

---

### UserManagement

| 项 | 值 |
|:---|:---|
| **签名** | `function UserManagement(): JSX.Element` |
| **来源** | `./UserManagement.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props** | 无 |
| **路由** | `/users` |
| **权限** | `admin.users.manage` / `admin.users.read` |
| **State 依赖** | `useI18n`, `useUserMgmtSlice` (Zustand slice) |
| **外部类型** | `UserRecord` (from `../../types`) |
| **三方依赖** | `lucide-react`, `sonner`, `zustand/shallow` |

**说明**：用户生命周期管理页面，支持 CRUD、搜索、角色权限矩阵、锁定/解锁等操作。

**内部类型**：
```typescript
type ModalMode = "view" | "edit" | "add" | null;

const ROLE_LIST: string[] = [
  "超级管理员", "运维工程师", "开发者",
  "数据分析师", "测试工程师", "AI 研究员",
  "系统服务", "自动化运维"
];
```

---

### SystemSettings

| 项 | 值 |
|:---|:---|
| **签名** | `function SystemSettings(): JSX.Element` |
| **来源** | `./SystemSettings.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props** | 无 |
| **路由** | `/settings` |
| **权限** | `admin.settings.read` |
| **State 依赖** | `useUIPrefsSlice`, `useSettingsSSOT` |
| **跨模块引用** | `../dev/*` (设计系统 / 主题定制) |
| **三方依赖** | `lucide-react` |

**说明**：基础系统设置面板，涵盖主题、语言、显示、通知、交互等偏好设置。

---

### UnifiedSettingsPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function UnifiedSettingsPanel(): JSX.Element` |
| **来源** | `./UnifiedSettingsPanel.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props** | 无 |
| **路由** | `/unified-settings` |
| **权限** | `admin.settings.manage` |
| **核心依赖** | `useI18n`, `useCopyFeedback`, `useSettingsSSOT`, `useProviderSlice`, `useAlerts`, `useDatabase` |
| **Lib 依赖** | `isCryptoAvailable`, `downloadFullBackup`, `importFullBackup`, `exportStoreData`, `importStoreData` |
| **外部类型** | `ModelProviderDef` |
| **三方依赖** | `lucide-react`, `sonner` |

**说明**：统一设置管理面板，提供全量配置的导入、导出、备份、加密检测、存储概览和分类清理功能。所有危险操作通过 `AlertDialog` 二次确认保护。

**内部类型**：
```typescript
interface StorageInfo {
  key: string;
  size: number;
  type: "store" | "cache" | "session";
}
```

---

### SecurityMonitor

| 项 | 值 |
|:---|:---|
| **签名** | `function SecurityMonitor(): JSX.Element` |
| **来源** | `./SecurityMonitor.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props** | 无 |
| **路由** | `/security` |
| **权限** | `admin.security.read` |
| **Hook 依赖** | `useI18n`, `useSecurityMonitor` |
| **外部类型** | `SecurityTab`, `RiskLevel`, `VitalRating` |
| **三方依赖** | `lucide-react` |

**说明**：安全态势感知面板，含安全评分环、4 个 Tab（Security/Performance/Diagnostics/Data Management），覆盖 CSP 检测、Cookie 安全、敏感数据扫描等。

**内部类型与常量**：
```typescript
type SecurityTabContentProps = {
  state: ReturnType<typeof useSecurityMonitor>;
  t: (k: string, v?: Record<string, string | number>) => string;
};

const TAB_CONFIG: { key: SecurityTab; icon: React.ElementType }[] = [
  { key: "security", icon: Shield },
  { key: "performance", icon: Zap },
  { key: "diagnostics", icon: Cpu },
  { key: "dataManagement", icon: Database },
];
```

**内部辅助函数**：
```typescript
function formatBytes(bytes: number): string;
function riskColor(risk: RiskLevel): string;           // "#00ff88" | "#ffaa00" | "#ff3366"
function statusIcon(status: "pass" | "warn" | "fail"): JSX.Element;
function vitalColor(rating: VitalRating): string;
function ScoreRing({ score, size = 80 }: { score: number; size?: number }): JSX.Element;
```

---

### PWAStatusPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function PWAStatusPanel(props?: PWAStatusPanelProps): JSX.Element` |
| **来源** | `./PWAStatusPanel.tsx` |
| **类型** | React.FC · 页面级 / 可嵌入面板 |
| **路由** | `/pwa` |
| **权限** | 公开 |
| **Hook 依赖** | `useInstallPrompt` 相关能力 |

**Props 签名**：
```typescript
interface PWAStatusPanelProps {
  compact?: boolean;
  className?: string;
}
```

**说明**：PWA 状态管理面板，提供安装状态、缓存管理、Service Worker 更新检测、离线检测与 Manifest 信息展示。支持紧凑模式嵌入其他面板。

---

### PWAInstallPrompt

| 项 | 值 |
|:---|:---|
| **签名** | `function PWAInstallPrompt(): JSX.Element \| null` |
| **来源** | `./PWAInstallPrompt.tsx` |
| **类型** | React.FC · 悬浮 Widget · **跨模块通用组件** |
| **路由** | - (全局悬浮) |
| **权限** | 公开 |
| **Hook 依赖** | `useInstallPrompt` |
| **跨模块被引用** | `shared/Layout` (全局注入) |
| **引用组件** | `YYC3Logo` (from `../shared/YYC3Logo`) |

**说明**：智能 PWA 安装提示横幅。当 `isInstalled || !canInstall` 时返回 `null`，不产生任何 DOM 节点。自动响应式布局：移动端底部全宽、桌面端右下角 320px 卡片。

**Hook 返回值**：
```typescript
const {
  isInstalled: boolean,
  canInstall: boolean,
  promptInstall: () => Promise<void>,
  dismiss: () => void,
} = useInstallPrompt();
```

---

### DataEditorPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function DataEditorPanel(props?: DataEditorPanelProps): JSX.Element` |
| **来源** | `./DataEditorPanel.tsx` |
| **类型** | React.FC · 页面级组件 |
| **路由** | `/data-editor` |
| **权限** | `admin.data.edit` |
| **内部引用** | `InlineEditableTable` 子组件 |

**Props 签名**：
```typescript
interface DataEditorPanelProps {
  defaultTableName?: string;
  readOnly?: boolean;
}
```

**说明**：数据编辑器主面板，提供多表切换、SQL 预览、批量提交、CSV/JSON/SQL 导入导出功能，核心编辑能力委托给 `InlineEditableTable`。

---

### InlineEditableTable

| 项 | 值 |
|:---|:---|
| **签名** | `function InlineEditableTable(props: InlineEditableTableProps): JSX.Element` |
| **来源** | `./InlineEditableTable.tsx` |
| **类型** | React.FC · **跨模块通用组件** |
| **路由** | - |
| **权限** | 使用场景决定 |
| **跨模块被引用** | `ops/DatabaseManager` |
| **外部类型** | `EditableCellChange`, `CommittedChange` |
| **Lib 依赖** | `idbGetAll`, `idbPut`, `idbClearStore` (IndexedDB) |
| **三方依赖** | `lucide-react`, `sonner` |

**Props 签名**：
```typescript
interface InlineEditableTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  tableName?: string;
  primaryKey?: string;                     // @default "id"
  editable?: boolean;                      // @default true
  onCellChange?: (
    change: EditableCellChange,
    generatedSQL: string
  ) => void;
  onExecuteSQL?: (sql: string) => Promise<{
    ok: boolean;
    error?: string;
    affectedRows?: number;
  }>;
  maxHeight?: string;                      // @default "300px"
}
```

**内部状态类型**：
```typescript
interface EditingCell {
  rowIndex: number;
  column: string;
  value: string;
}
```

**说明**：通用内联可编辑表格组件，是 Admin 模块复用率最高的组件。支持单元格双击编辑、主键行定位、Undo/Redo 历史（IndexedDB 持久化，保留 20 条）、批量提交、SQL 预览等。同时导出 5 个纯函数供独立使用与单元测试。

---

### PerformanceMonitor

| 项 | 值 |
|:---|:---|
| **签名** | `function PerformanceMonitor(): JSX.Element` |
| **来源** | `./PerformanceMonitor.tsx` |
| **类型** | React.FC · 页面级组件 |
| **路由** | `/performance` |
| **权限** | `admin.performance.read` |
| **State 依赖** | `useUIPrefsSlice` |
| **Lib 依赖** | `env` (from `../../lib/env-config`) |
| **三方依赖** | `recharts`, `lucide-react`, `sonner` |

**内部类型**：
```typescript
interface VitalMetric {
  name: string;
  value: number | null;
  unit: string;
  rating: "good" | "needs-improvement" | "poor" | "unknown";
  threshold: { good: number; poor: number };
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ResourceEntry {
  name: string;
  type: string;
  size: number;
  duration: number;
}

interface FpsSnapshot { time: string; fps: number; }
interface MemorySnapshot { time: string; usedMB: number; totalMB: number; }

interface AlertThresholds {
  fpsMin: number;
  memMaxPercent: number;
  clsMax: number;
  fcpMax: number;
  lcpMax: number;
  ttfbMax: number;
  inpMax: number;
  storageMaxKB: number;
  alertEnabled: boolean;
  alertCooldownSec: number;
}
```

**常量**：
```typescript
const DEFAULT_THRESHOLDS: AlertThresholds;
const ratingColor: Record<VitalMetric["rating"], string>;
const ratingLabel: Record<VitalMetric["rating"], string>;
const f: { xs: string; sm: string; md: string; lg: string }; // 字号常量
```

**内部工具函数**：
```typescript
function rateVital(
  value: number,
  good: number,
  poor: number
): VitalMetric["rating"];
```

**说明**：性能监控核心面板，涵盖生命体征、Web Vitals、FPS/内存趋势图、慢资源列表、9 项阈值告警引擎（持久化 + 冷却机制）以及报告导出功能。

---

### EnvConfigEditor

| 项 | 值 |
|:---|:---|
| **签名** | `function EnvConfigEditor(props?: EnvConfigEditorProps): JSX.Element` |
| **来源** | `./EnvConfigEditor.tsx` |
| **类型** | React.FC · 页面级组件 |
| **路由** | `/env-config` |
| **权限** | `admin.env.manage` |

**Props 签名**：
```typescript
interface EnvConfigEditorProps {
  forceReadOnly?: boolean;
}
```

**说明**：环境变量编辑器，支持 API Key 加密管理、模型提供商配置、端点连通性测试、分组展示与生产环境只读锁定。

---

### StorageManager

| 项 | 值 |
|:---|:---|
| **签名** | `function StorageManager(): JSX.Element` |
| **来源** | `./StorageManager.tsx` |
| **类型** | React.FC · 页面级组件 · Storage 三件套主控 |
| **路由** | `/storage` |
| **权限** | `admin.storage.manage` |
| **内部引用** | `StorageConfigPanel`, `StorageSyncStatus` |
| **Service 依赖** | `storageManager` (from `../../services/storageManager`) |
| **外部类型** | `StorageConfig` (from `../../types/storage`) |
| **UI 依赖** | `PageHeader` (from `../../components/ui/page-header`) |

**说明**：存储管理总控页面，采用 1:2 栅格布局：左列显示同步状态 `StorageSyncStatus`，右列显示配置面板 `StorageConfigPanel`。保存配置后自动触发一次存储同步。

---

### StorageConfigPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function StorageConfigPanel(props: StorageConfigPanelProps): JSX.Element` |
| **来源** | `./StorageConfigPanel.tsx` |
| **类型** | React.FC · 子面板 |
| **路由** | - |
| **外部类型** | `StorageConfig` |

**Props 签名**：
```typescript
interface StorageConfigPanelProps {
  config: StorageConfig;
  onConfigChange: (newConfig: StorageConfig) => void;
  onSave: () => Promise<void> | void;
  isSaving: boolean;
  error?: string;
}
```

**说明**：存储配置子面板，负责后端切换、同步策略、容量限制、加密开关等配置的表单渲染与交互。受控组件模式，所有状态提升到父组件 `StorageManager`。

---

### StorageSyncStatus

| 项 | 值 |
|:---|:---|
| **签名** | `function StorageSyncStatus(props?: StorageSyncStatusProps): JSX.Element` |
| **来源** | `./StorageSyncStatus.tsx` |
| **类型** | React.FC · 子面板 |
| **路由** | - |

**Props 签名**：
```typescript
interface StorageSyncStatusProps {
  compact?: boolean;
}
```

**说明**：存储同步状态子面板，以三态状态灯 + 时间显示 + 同步统计 + 最近日志形式，直观呈现当前存储后端的同步状态。支持紧凑模式嵌入顶栏或其他面板。

---

### ConfigCenter

| 项 | 值 |
|:---|:---|
| **签名** | `function ConfigCenter(): JSX.Element` |
| **来源** | `./ConfigCenter.tsx` |
| **类型** | React.FC · 页面级组件 · Config 套件主控 |
| **路由** | `/config-center` |
| **权限** | `admin.config.manage` |
| **内部引用** | `PageConfigEditor` |
| **Config 依赖** | `getAllPages`, `PageConfig` (from `../../config`) |
| **UI 依赖** | `GlassCard` (from `../shared/GlassCard`) |
| **三方依赖** | `lucide-react` |

**内部状态类型**：
```typescript
const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
const [pages] = useState<PageConfig[]>(() => getAllPages());
const [activeTab, setActiveTab] = useState<"pages" | "storage">("pages");

const tabs: { key: "pages" | "storage"; label: string; icon: typeof FileText }[];
```

**说明**：配置中心主面板，双 Tab 架构（页面配置 / 存储管理）。按 `sidebar.navGroup` 对页面进行分组展示，提供全量配置的导入、导出与重置能力。`handleExportAll()` 导出的 JSON schema 如下：

```typescript
interface ConfigBackup {
  pages: Record<string, PageConfig>;
  exportedAt: string;
  version: "1.0.0";
}
```

---

### VariableCenter

| 项 | 值 |
|:---|:---|
| **签名** | `function VariableCenter(props?: VariableCenterProps): JSX.Element` |
| **来源** | `./VariableCenter.tsx` |
| **类型** | React.FC · 页面级组件 |
| **路由** | `/variables` |
| **权限** | `admin.config.manage` |

**Props 签名**：
```typescript
interface VariableCenterProps {
  groupFilter?: "system" | "business" | "custom";
}
```

**说明**：全局变量管理中心，支持按分组展示、新增/编辑变量、类型校验、版本历史、.env / JSON 双格式导出与代码引用示例生成。

---

### PageConfigEditor

| 项 | 值 |
|:---|:---|
| **签名** | `function PageConfigEditor(props: PageConfigEditorProps): JSX.Element` |
| **来源** | `./PageConfigEditor.tsx` |
| **类型** | React.FC · 子面板 |
| **路由** | - (嵌入 `ConfigCenter`) |
| **外部类型** | `PageConfig` (from `../../config`) |

**Props 签名**：
```typescript
interface PageConfigEditorProps {
  pageId: string | null;
  onUpdate?: (pageConfig: PageConfig) => void;
}
```

**说明**：单页面配置编辑器，细粒度控制侧边栏、可见性、路由、数据源、Layout 五大类配置。自动 debounced 持久化到 localStorage `yyc3-page-configs`，并对非法配置提供实时校验反馈。

---

### NetworkConfig

| 项 | 值 |
|:---|:---|
| **签名** | `function NetworkConfig(props?: NetworkConfigProps): JSX.Element` |
| **来源** | `./NetworkConfig.tsx` |
| **类型** | React.FC · 子面板 |
| **路由** | - |

**Props 签名**：
```typescript
interface NetworkConfigProps {
  onChange?: (config: NetworkConfigShape) => void;
  onSave?: () => Promise<void>;
}
```

**说明**：网络配置面板，统一管理 API 基础 URL、超时、重试、代理、WebSocket、证书等网络层参数，并内置一键连通性测试功能。

---

## 🔢 纯函数 API 参考 (Pure Functions)

> ⚠️ 所有纯函数均为 **副作用-free**，可直接在单元测试中 import 使用，无需 Mock 环境。

### formatSQLValue

| 项 | 值 |
|:---|:---|
| **签名** | `function formatSQLValue(value: unknown): string` |
| **来源** | `./InlineEditableTable.tsx` (named export) |
| **纯度** | ✅ 纯函数 · 无副作用 |

**说明**：将任意 JS 值转换为合法的 SQL 字面量字符串。处理规则：

| 输入类型 / 值 | 输出示例 |
|:---|:---|
| `null` / `undefined` / `""` / `"NULL"` | `"NULL"` |
| 数字字符串（如 `"42"`） | `"42"` |
| 布尔字符串（`"true"` / `"false"`） | `"true"` / `"false"` |
| 普通字符串（如 `"hello"`） | `"'hello'"` |
| 含单引号字符串（如 `"It's"`） | `"'It''s'"`（SQL 转义） |

**类型签名示例**：
```typescript
formatSQLValue(null);         // "NULL"
formatSQLValue(42);           // "42"
formatSQLValue(true);         // "true"
formatSQLValue("O'Neil");     // "'O''Neil'"
formatSQLValue("test");       // "'test'"
```

---

### buildUpdateSQL

| 项 | 值 |
|:---|:---|
| **签名** | `function buildUpdateSQL(tableName: string, column: string, newValue: string, primaryKey: string, pkValue: unknown): string` |
| **来源** | `./InlineEditableTable.tsx` (named export) |
| **纯度** | ✅ 纯函数 |

**说明**：生成标准单字段 `UPDATE` SQL 语句。

**返回示例**：
```typescript
buildUpdateSQL("users", "name", "Admin", "id", 1);
// => "UPDATE users\nSET name = 'Admin'\nWHERE id = '1';"
```

---

### buildRollbackSQL

| 项 | 值 |
|:---|:---|
| **签名** | `function buildRollbackSQL(tableName: string, column: string, oldValue: unknown, primaryKey: string, pkValue: unknown): string` |
| **来源** | `./InlineEditableTable.tsx` (named export) |
| **纯度** | ✅ 纯函数 |

**说明**：生成 `UPDATE` 的反向回滚 SQL（与 `buildUpdateSQL` 对称，将 `oldValue` 写回）。

**返回示例**：
```typescript
buildRollbackSQL("users", "name", "OldName", "id", 1);
// => "UPDATE users\nSET name = 'OldName'\nWHERE id = '1';"
```

---

### buildDeleteSQL

| 项 | 值 |
|:---|:---|
| **签名** | `function buildDeleteSQL(tableName: string, primaryKey: string, pkValue: unknown): string` |
| **来源** | `./InlineEditableTable.tsx` (named export) |
| **纯度** | ✅ 纯函数 |

**说明**：生成主键精准定位的 `DELETE` SQL 语句。

**返回示例**：
```typescript
buildDeleteSQL("users", "id", 1);
// => "DELETE FROM users\nWHERE id = '1';"
```

---

### buildInsertSQL

| 项 | 值 |
|:---|:---|
| **签名** | `function buildInsertSQL(tableName: string, columns: string[], row: Record<string, unknown>): string` |
| **来源** | `./InlineEditableTable.tsx` (named export) |
| **纯度** | ✅ 纯函数 |

**说明**：生成完整行的 `INSERT` SQL 语句，用于 `DELETE` 操作的反向回滚。

**返回示例**：
```typescript
buildInsertSQL(
  "users",
  ["id", "name", "email"],
  { id: 1, name: "Alice", email: "a@b.com" }
);
// => "INSERT INTO users (id, name, email)\nVALUES (1, 'Alice', 'a@b.com');"
```

---

### rateVital

| 项 | 值 |
|:---|:---|
| **签名** | `function rateVital(value: number, good: number, poor: number): "good" \| "needs-improvement" \| "poor"` |
| **来源** | `./PerformanceMonitor.tsx` (内部函数，未导出) |
| **纯度** | ✅ 纯函数 |

**说明**：根据阈值对指标进行三档评级。`value <= good → "good"`；`value <= poor → "needs-improvement"`；否则 `"poor"`。

**访问方式**：暂未通过 Barrel 导出，如跨模块使用建议提取至 `lib/performance-utils.ts`。

---

### riskColor / statusIcon / vitalColor

| 函数 | 签名 | 返回类型 | 说明 |
|:---|:---|:---|:---|
| `riskColor` | `(risk: RiskLevel) => string` | HEX color string | 风险等级 → 颜色映射 |
| `statusIcon` | `(status: "pass"\|"warn"\|"fail") => JSX.Element` | Lucide icon | 检查状态 → 图标组件 |
| `vitalColor` | `(rating: VitalRating) => string` | HEX color string | 生命体征评级 → 颜色映射 |

> 以上三函数均为 `SecurityMonitor.tsx` 内部辅助，未导出。如需复用建议提取。

---

## 📐 类型定义索引 (Type Definitions)

### Props 接口汇总

| 接口名 | 所属组件 | 定义位置 |
|:-------|:---------|:---------|
| `InlineEditableTableProps` | InlineEditableTable | `./InlineEditableTable.tsx:27` |
| `EditingCell` | InlineEditableTable | `./InlineEditableTable.tsx:43` |
| `AuditLog` | OperationAudit | `./OperationAudit.tsx:46` |
| `StorageInfo` | UnifiedSettingsPanel | `./UnifiedSettingsPanel.tsx:59` |
| `VitalMetric` | PerformanceMonitor | `./PerformanceMonitor.tsx:34` |
| `MemoryInfo` | PerformanceMonitor | `./PerformanceMonitor.tsx:42` |
| `ResourceEntry` | PerformanceMonitor | `./PerformanceMonitor.tsx:48` |
| `FpsSnapshot` | PerformanceMonitor | `./PerformanceMonitor.tsx:55` |
| `MemorySnapshot` | PerformanceMonitor | `./PerformanceMonitor.tsx:56` |
| `AlertThresholds` | PerformanceMonitor | `./PerformanceMonitor.tsx:59` |
| `StorageConfigPanelProps` | StorageConfigPanel | `./StorageConfigPanel.tsx` |
| `StorageSyncStatusProps` | StorageSyncStatus | `./StorageSyncStatus.tsx` |
| `PageConfigEditorProps` | PageConfigEditor | `./PageConfigEditor.tsx` |
| `NetworkConfigProps` | NetworkConfig | `./NetworkConfig.tsx` |
| `PWAStatusPanelProps` | PWAStatusPanel | `./PWAStatusPanel.tsx` |
| `DataEditorPanelProps` | DataEditorPanel | `./DataEditorPanel.tsx` |
| `EnvConfigEditorProps` | EnvConfigEditor | `./EnvConfigEditor.tsx` |
| `VariableCenterProps` | VariableCenter | `./VariableCenter.tsx` |

### 外部类型引用 (from `../../types/*`)

| 类型名 | 来源路径 | 用途 |
|:-------|:---------|:-----|
| `StoredLogEntry` | `../../types` | OperationAudit 日志源数据 |
| `UserRecord` | `../../types` | UserManagement 用户记录 |
| `EditableCellChange` | `../../types` | InlineEditableTable 单元格变更 |
| `CommittedChange` | `../../types` | InlineEditableTable 提交历史 |
| `SecurityTab` | `../../types` | SecurityMonitor Tab 键名 |
| `RiskLevel` | `../../types` | SecurityMonitor 风险等级 |
| `VitalRating` | `../../types` | SecurityMonitor 生命体征评级 |
| `StorageConfig` | `../../types/storage` | StorageManager/ConfigPanel 配置 |
| `ModelProviderDef` | `../../types/model-provider-types` | UnifiedSettingsPanel 模型配置 |
| `PageConfig` | `../../config` | ConfigCenter/PageConfigEditor 页面配置 |

---

<div align="center">

---

**[⬆ 返回顶部](#-目录--table-of-contents)** · **[README.md](./README.md)** · **[COMPONENTS.md](./COMPONENTS.md)** · **[DEV-GUIDE.md](../../src/app/modules/admin/DEV-GUIDE.md)**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
