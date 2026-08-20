---
file: COMPONENTS.md
description: Admin 模块组件详解 · 每个组件的路由、功能、Props 与使用示例
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [components],[admin],[module],[reference]
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

- [组件索引总览](#组件索引总览)
- [🔍 操作审计 · OperationAudit](#-操作审计--operationaudit)
- [👥 用户管理 · UserManagement](#-用户管理--usermanagement)
- [⚙️ 系统设置 · SystemSettings](#️-系统设置--systemsettings)
- [🎛️ 统一设置面板 · UnifiedSettingsPanel](#️-统一设置面板--unifiedsettingspanel)
- [🛡️ 安全监控 · SecurityMonitor](#️-安全监控--securitymonitor)
- [📱 PWA 状态面板 · PWAStatusPanel](#-pwa-状态面板--pwastatuspanel)
- [📱 PWA 安装提示 · PWAInstallPrompt](#-pwa-安装提示--pwainstallprompt)
- [✏️ 数据编辑面板 · DataEditorPanel](#️-数据编辑面板--dataeditorpanel)
- [✏️ 内联可编辑表格 · InlineEditableTable](#️-内联可编辑表格--inlineeditabletable)
- [📊 性能监控 · PerformanceMonitor](#-性能监控--performancemonitor)
- [🌐 环境配置编辑器 · EnvConfigEditor](#-环境配置编辑器--envconfigeditor)
- [💾 存储管理器 · StorageManager](#-存储管理器--storagemanager)
- [💾 存储配置面板 · StorageConfigPanel](#-存储配置面板--storageconfigpanel)
- [💾 存储同步状态 · StorageSyncStatus](#-存储同步状态--storagesyncstatus)
- [🔧 配置中心 · ConfigCenter](#-配置中心--configcenter)
- [🔧 变量中心 · VariableCenter](#-变量中心--variablecenter)
- [🔧 页面配置编辑器 · PageConfigEditor](#-页面配置编辑器--pageconfigeditor)
- [🔧 网络配置 · NetworkConfig](#-网络配置--networkconfig)

---

## 🔗 组件索引总览

| 组件名 | 路由 | 页面级 | 通用组件 | 复杂度 | 类型 |
|:-------|:-----|:------:|:--------:|:------:|:-----|
| [OperationAudit](#-操作审计--operationaudit) | `/audit` | ✅ | ❌ | ⭐⭐⭐ | Page |
| [UserManagement](#-用户管理--usermanagement) | `/users` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| [SystemSettings](#️-系统设置--systemsettings) | `/settings` | ✅ | ❌ | ⭐⭐⭐ | Page |
| [UnifiedSettingsPanel](#️-统一设置面板--unifiedsettingspanel) | `/unified-settings` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| [SecurityMonitor](#️-安全监控--securitymonitor) | `/security` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| [PWAStatusPanel](#-pwa-状态面板--pwastatuspanel) | `/pwa` | ✅ | ⚠️ | ⭐⭐ | Page/Panel |
| [PWAInstallPrompt](#-pwa-安装提示--pwainstallprompt) | - | ❌ | ✅ | ⭐⭐ | Widget |
| [DataEditorPanel](#️-数据编辑面板--dataeditorpanel) | `/data-editor` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| [InlineEditableTable](#️-内联可编辑表格--inlineeditabletable) | - | ❌ | ✅★ | ⭐⭐⭐⭐ | Shared Component |
| [PerformanceMonitor](#-性能监控--performancemonitor) | `/performance` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| [EnvConfigEditor](#-环境配置编辑器--envconfigeditor) | `/env-config` | ✅ | ❌ | ⭐⭐⭐ | Page |
| [StorageManager](#-存储管理器--storagemanager) | `/storage` | ✅ | ❌ | ⭐⭐⭐ | Page |
| [StorageConfigPanel](#-存储配置面板--storageconfigpanel) | - | ❌ | ⚠️ | ⭐⭐⭐ | Sub Panel |
| [StorageSyncStatus](#-存储同步状态--storagesyncstatus) | - | ❌ | ⚠️ | ⭐⭐ | Sub Panel |
| [ConfigCenter](#-配置中心--configcenter) | `/config-center` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| [VariableCenter](#-变量中心--variablecenter) | `/variables` | ✅ | ❌ | ⭐⭐⭐ | Page |
| [PageConfigEditor](#-页面配置编辑器--pageconfigeditor) | - | ❌ | ⚠️ | ⭐⭐⭐ | Sub Panel |
| [NetworkConfig](#-网络配置--networkconfig) | - | ❌ | ⚠️ | ⭐⭐⭐ | Sub Panel |

> ✅★ 标记表示该组件被**跨模块高频复用**

---

## 🔍 操作审计 · OperationAudit

**文件**：`src/app/modules/admin/OperationAudit.tsx`
**路由**：`/audit`
**权限**：`admin.audit.read`
**类型**：页面级组件 (Page Component)

### 核心功能

- 📋 完整操作审计日志列表 (时间/用户/角色/操作/目标/IP/状态/风险)
- 📊 操作趋势面积图 (按小时统计操作数 vs 错误数)
- 📈 风险分布柱状图 (低/中/高/严重四级分布)
- 🔍 多条件筛选 (关键词搜索 + 风险等级 + 状态)
- 📄 日志导出 (JSON 格式)
- ↩️ 日志查看详情弹窗
- 🛡️ 风险评分系统 (映射 StoredLogEntry → AuditLog)

### 关键类型定义

```typescript
interface AuditLog {
  id: string;
  time: string;                    // 本地化时间字符串 HH:mm:ss
  user: string;                    // 操作来源用户
  role: string;                    // 角色: "系统" | "服务" | 用户角色
  action: string;                  // 操作类型: "异常事件" | "告警事件" | "操作日志"
  target: string;                  // 操作目标/消息
  ip: string;                      // 来源 IP
  status: "success" | "running" | "failed" | "warning";
  risk: "low" | "medium" | "high"; // 风险等级
}

// 日志映射: StoredLogEntry → AuditLog
function mapLogToAudit(entry: StoredLogEntry): AuditLog;
```

### Mock 数据结构

```typescript
// 操作趋势数据 (每小时)
const auditTrend = [
  { time: "08:00", ops: 120, errors: 2 },
  { time: "09:00", ops: 280, errors: 5 },
  // ...
];

// 风险分布数据
const riskDistribution = [
  { level: "低风险", count: 245 },
  { level: "中风险", count: 82 },
  { level: "高风险", count: 18 },
  { level: "严重", count: 3 },
];
```

### 关键 Props

**无 Props**（页面级组件，内部通过 `useI18n` 和 `useLogSlice` 获取数据）

### 使用示例

```tsx
// routes.tsx
import { lazy, Suspense } from 'react';

const OperationAudit = lazy(() =>
  import('./modules/admin/OperationAudit').then(m => ({ default: m.OperationAudit }))
);

<Route path="/audit" element={
  <Suspense fallback={<LoadingSpinner />}>
    <OperationAudit />
  </Suspense>
} />
```

---

## 👥 用户管理 · UserManagement

**文件**：`src/app/modules/admin/UserManagement.tsx`
**路由**：`/users`
**权限**：`admin.users.manage` (CRUD) / `admin.users.read` (只读)
**类型**：页面级组件 (Page Component)

### 核心功能

- 👤 用户卡片列表 (在线状态/角色/API 调用次数)
- ➕ 新增用户 (Modal 表单：姓名/用户名/邮箱/角色)
- ✏️ 编辑用户信息
- 👁️ 查看用户详情
- 🗑️ 删除用户 (二次确认)
- 🔒 锁定 / 🔓 解锁用户账户
- 🔍 搜索过滤 (姓名/用户名/邮箱)
- 📊 统计概览 (在线人数/管理员数/服务账号数/总 API 调用)
- 🛡️ 角色权限矩阵展示 (5 种角色卡片)

### 关键类型定义

```typescript
// 从 useUserMgmtSlice 获取的用户记录
interface UserRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;              // "超级管理员" | "运维工程师" | "开发者" | ...
  status: "online" | "offline" | "locked";
  apiCalls: number;
  lastActive: number;        // timestamp
  avatar?: string;
}

type ModalMode = "view" | "edit" | "add" | null;

// 内置角色列表
const ROLE_LIST = [
  "超级管理员", "运维工程师", "开发者",
  "数据分析师", "测试工程师", "AI 研究员",
  "系统服务", "自动化运维"
];
```

### 关键 Props

**无 Props**（页面级组件，内部通过 `useUserMgmtSlice` 管理状态）

### Store 切片使用

```typescript
const { users, addUser, updateUser, removeUser, toggleLock } = useUserMgmtSlice(
  useShallow((s) => ({
    users: s.users,
    addUser: s.addUser,
    updateUser: s.updateUser,
    removeUser: s.removeUser,
    toggleLock: s.toggleLock,
  }))
);
```

### 使用示例

```tsx
// 路由中懒加载
const UserManagement = lazy(() =>
  import('./modules/admin/UserManagement').then(m => ({ default: m.UserManagement }))
);

<Route path="/users" element={<UserManagement />} />
```

---

## ⚙️ 系统设置 · SystemSettings

**文件**：`src/app/modules/admin/SystemSettings.tsx`
**路由**：`/settings`
**权限**：`admin.settings.read`
**类型**：页面级组件 (Page Component)

### 核心功能

- 🎨 主题设置 (浅色/深色/跟随系统 + 玻璃拟态开关)
- 🌐 语言切换 (zh-CN / en-US)
- 📊 数据显示设置 (密度/小数位/日期格式)
- 🔔 通知设置 (声音/弹窗/桌面通知)
- 🖱️ 交互设置 (动画开关/特效等级/悬停预览)
- 🧪 实验性功能 Flag 开关 (GF 模式/新渲染引擎)

### 关键 Props

**无 Props**（页面级组件）

### 依赖说明

- 引用 `../dev/*` 设计系统与主题定制能力
- 通过 `useUIPrefsSlice` / `useSettingsSSOT` 持久化到 localStorage

### 使用示例

```tsx
<Route path="/settings" element={<SystemSettings />} />
```

---

## 🎛️ 统一设置面板 · UnifiedSettingsPanel

**文件**：`src/app/modules/admin/UnifiedSettingsPanel.tsx`
**路由**：`/unified-settings`
**权限**：`admin.settings.manage`
**类型**：页面级组件 (Page Component)

### 核心功能

- 📦 **完整备份**：全量配置一键导出 JSON (downloadFullBackup)
- 📥 **完整恢复**：从 JSON 备份文件导入并合并 (importFullBackup)
- 💾 **存储概览**：localStorage 各 key 的占用统计条形图
- 🔐 **安全状态**：加密能力检测 (isCryptoAvailable) / 指纹信息
- 🧹 **数据清理**：分类清理 (Store/Cache/Session) + 一键清空
- 👤 **用户数据**：当前用户 SSOT 设置查看与复制
- 🤖 **模型配置**：Model Provider 配置导入导出
- ⚠️ **二次确认**：危险操作通过 AlertDialog 保护

### 关键类型定义

```typescript
interface StorageInfo {
  key: string;
  size: number;                           // bytes
  type: "store" | "cache" | "session";
}

// localStorage 追踪键列表
const storeKeys = [
  { key: "yyc3-settings-ssot", type: "store" },
  { key: "yyc3-family-settings", type: "store" },
  { key: "yyc3-global-store", type: "store" },
  { key: "yyc3-session", type: "session" },
  { key: "yyc3-settings", type: "store" },
  { key: "yyc3-models", type: "store" },
  { key: "yyc3-connections", type: "store" },
];
```

### 关键 Props

**无 Props**

### 使用的核心 Hook 与 Service

```typescript
import { useCopyFeedback } from '../../hooks/useCopyFeedback';
import { isCryptoAvailable } from '../../lib/crypto-vault';
import { downloadFullBackup, importFullBackup } from '../../lib/full-backup';
import { useProviderSlice, useSettingsSSOT } from '../../store';
import {
  exportStoreData, importStoreData,
  useAlerts, useDatabase,
} from '../../stores/global-store';
```

### 使用示例

```tsx
<Route path="/unified-settings" element={<UnifiedSettingsPanel />} />
```

---

## 🛡️ 安全监控 · SecurityMonitor

**文件**：`src/app/modules/admin/SecurityMonitor.tsx`
**路由**：`/security`
**权限**：`admin.security.read`
**类型**：页面级组件 (Page Component)

### 核心功能

- 🎯 **安全评分环** (ScoreRing)：0-100 分 SVG 动画评分 (≥80 绿 / ≥60 黄 / <60 红)
- 🛡️ **Security Tab**：CSP 策略检测 + Cookie 安全属性 + 敏感数据扫描
- ⚡ **Performance Tab**：资源加载性能 + 内存占用 + FPS
- 🧠 **Diagnostics Tab**：JS 错误统计 + 控制台异常 + 浏览器指纹
- 💾 **Data Management Tab**：存储容量 + 缓存策略 + 数据导出
- ✅⚠️❌ **三态状态图标**：pass/warn/fail 每项检查结果

### 关键类型定义

```typescript
// 来自 ../../types
type SecurityTab = "security" | "performance" | "diagnostics" | "dataManagement";
type RiskLevel = "safe" | "warning" | "danger";
type VitalRating = "good" | "needs-improvement" | "poor";

// Hook 返回类型
ReturnType<typeof useSecurityMonitor>;
```

### 内部子组件

```tsx
// 评分环组件
function ScoreRing({ score, size = 80 }: { score: number; size?: number }): JSX.Element;

// 各 Tab 内容
function SecurityTabContent({ state, t }): JSX.Element;
function PerformanceTabContent({ state, t }): JSX.Element;
function DiagnosticsTabContent({ state, t }): JSX.Element;
function DataManagementTabContent({ state, t }): JSX.Element;
```

### 关键 Props

**无 Props**

### Tab 配置

```typescript
const TAB_CONFIG: { key: SecurityTab; icon: React.ElementType }[] = [
  { key: "security", icon: Shield },
  { key: "performance", icon: Zap },
  { key: "diagnostics", icon: Cpu },
  { key: "dataManagement", icon: Database },
];
```

### 使用示例

```tsx
<Route path="/security" element={<SecurityMonitor />} />
```

---

## 📱 PWA 状态面板 · PWAStatusPanel

**文件**：`src/app/modules/admin/PWAStatusPanel.tsx`
**路由**：`/pwa`
**权限**：公开
**类型**：页面级组件 / 可嵌入 Panel

### 核心功能

- ✅ **安装状态**：检测是否已安装 PWA、当前运行环境 (浏览器/独立窗口)
- 🗄️ **缓存概览**：Service Worker 缓存的资源数量 + 大小
- 🔄 **更新检测**：检测 Service Worker 是否有新版本
- 🧹 **缓存管理**：一键清理指定缓存 / 全量缓存
- 📶 **离线检测**：navigator.onLine 实时状态显示
- 📋 **Manifest 信息**：显示 manifest.json 解析内容

### 关键 Props

```typescript
interface PWAStatusPanelProps {
  /** 紧凑模式，用于嵌入其他面板 */
  compact?: boolean;
  /** 自定义 className */
  className?: string;
}
```

### 使用示例

```tsx
// 路由中作为完整页面
<Route path="/pwa" element={<PWAStatusPanel />} />

// 作为嵌入子组件 (紧凑模式)
<PWAStatusPanel compact className="max-w-md" />
```

---

## 📱 PWA 安装提示 · PWAInstallPrompt

**文件**：`src/app/modules/admin/PWAInstallPrompt.tsx`
**路由**：- (悬浮 Widget)
**权限**：公开
**类型**：通用组件 (被 shared/Layout 全局引用)
**复用等级**：★★★★★ (跨模块共享)

### 核心功能

- 🧠 **智能条件渲染**：已安装或不支持时返回 null，不占 DOM
- 💬 **品牌化横幅**：YYC3Logo + 标题 + 说明文案 + 安装按钮
- ❌ **可关闭**：点击 X 触发 `dismiss()`，会话内不再显示
- 📱 **响应式**：移动端底部全宽 / 桌面端右下角固定 (320px 宽)
- ✨ **玻璃拟态**：`rgba(8,25,55,0.95)` + backdrop-blur-xl + 顶部发光线

### 关键 Props

**无 Props**（所有状态来自 `useInstallPrompt` Hook）

### Hook 依赖

```typescript
const {
  isInstalled,   // 是否已安装 (boolean)
  canInstall,    // 是否满足安装条件 (boolean)
  promptInstall, // 触发浏览器安装对话框 () => Promise<void>
  dismiss,       // 关闭本次会话提示 () => void
} = useInstallPrompt();
```

### 使用示例

```tsx
// ✅ 推荐用法：全局 Layout 中放一次即可
import { PWAInstallPrompt } from '../admin/PWAInstallPrompt';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Sidebar />
      <main>{children}</main>
      {/* 全局自动显示，已安装/不支持时自动隐藏 */}
      <PWAInstallPrompt />
    </div>
  );
}
```

---

## ✏️ 数据编辑面板 · DataEditorPanel

**文件**：`src/app/modules/admin/DataEditorPanel.tsx`
**路由**：`/data-editor`
**权限**：`admin.data.edit`
**类型**：页面级组件 (Page Component)

### 核心功能

- 📋 多表数据管理 (左侧切换不同数据表)
- ✏️ 集成 `InlineEditableTable` 作为表格编辑核心
- 💾 批量提交 / 回滚未保存更改
- 📄 SQL 预览面板 (显示待执行 SQL 语句列表)
- 📥 数据导入 (CSV/JSON)
- 📤 数据导出 (CSV/JSON/SQL INSERT 脚本)
- 🔎 表内搜索过滤

### 关键 Props

```typescript
interface DataEditorPanelProps {
  /** 预置打开的表名 */
  defaultTableName?: string;
  /** 只读模式 (隐藏编辑功能) */
  readOnly?: boolean;
}
```

### 使用示例

```tsx
<Route path="/data-editor" element={<DataEditorPanel />} />

// 嵌入式使用：只开放某张表
<DataEditorPanel defaultTableName="monitor_nodes" readOnly={false} />
```

---

## ✏️ 内联可编辑表格 · InlineEditableTable

**文件**：`src/app/modules/admin/InlineEditableTable.tsx`
**路由**：- (通用组件)
**权限**：按使用场景决定
**类型**：通用组件 (被 ops/DatabaseManager 跨模块引用)
**复用等级**：★★★★★ (跨模块共享)

### 核心功能

- 🖱️ **单元格双击编辑**：点击任意单元格进入编辑模式，Enter 确认 Esc 取消
- 🎯 **主键定位**：primaryKey 精准定位行，生成合法 SQL
- 🔄 **Undo/Redo 历史**：提交历史存入 IndexedDB (committedChanges 表)，支持 20 条回滚
- 📝 **SQL 生成**：5 个纯函数生成标准 SQL (UPDATE/ROLLBACK/DELETE/INSERT + 值格式化)
- ✅ **批量提交**：pendingChanges 队列一次批量提交 + onCellChange 回调
- ⚡ **行删除**：勾选多行批量删除 + DELETE SQL 自动生成
- 📜 **历史面板**：showHistory 开关查看历史记录并一键回滚
- ⚠️ **确认对话框**：执行前显示 SQL 预览确认

### 关键 Props

```typescript
interface InlineEditableTableProps {
  /** 列名数组 */
  columns: string[];
  /** 行数据数组 */
  rows: Record<string, unknown>[];
  /** 表名 (用于生成 SQL) */
  tableName?: string;
  /** 主键列名，默认 "id" */
  primaryKey?: string;
  /** 是否启用编辑功能，默认 true */
  editable?: boolean;
  /** 单元格变更回调，返回变更对象 + 生成的 SQL */
  onCellChange?: (change: EditableCellChange, generatedSQL: string) => void;
  /** 执行 SQL 的回调 (可选)，返回执行结果 */
  onExecuteSQL?: (sql: string) => Promise<{
    ok: boolean;
    error?: string;
    affectedRows?: number;
  }>;
  /** 表格最大高度 (超过滚动)，默认 "300px" */
  maxHeight?: string;
}
```

### 导出的纯函数 (可单独 import 测试)

```typescript
/** 格式化 SQL 值字面量 (NULL / 数字 / 布尔 / 字符串转义) */
export function formatSQLValue(value: unknown): string;

/** 生成 UPDATE SQL 语句 */
export function buildUpdateSQL(
  tableName: string,
  column: string,
  newValue: string,
  primaryKey: string,
  pkValue: unknown
): string;

/** 生成 Rollback SQL (反向 UPDATE) */
export function buildRollbackSQL(
  tableName: string,
  column: string,
  oldValue: unknown,
  primaryKey: string,
  pkValue: unknown
): string;

/** 生成 DELETE SQL 语句 */
export function buildDeleteSQL(
  tableName: string,
  primaryKey: string,
  pkValue: unknown
): string;

/** 生成 INSERT SQL (用于 DELETE 回滚) */
export function buildInsertSQL(
  tableName: string,
  columns: string[],
  row: Record<string, unknown>
): string;
```

### 关键类型

```typescript
// 来自 ../../types
interface EditableCellChange {
  tableName: string;
  rowIndex: number;
  column: string;
  oldValue: unknown;
  newValue: string;
  primaryKey: string;
  pkValue: unknown;
}

interface CommittedChange {
  id: string;
  tableName: string;
  type: "update" | "delete" | "insert";
  changes: EditableCellChange[];
  forwardSQL: string;
  rollbackSQL: string;
  committedAt: number;
}

interface EditingCell {
  rowIndex: number;
  column: string;
  value: string;
}
```

### 使用示例

```tsx
import {
  InlineEditableTable,
  buildUpdateSQL,
  formatSQLValue,
} from '../admin/InlineEditableTable';

// 基础用法
<InlineEditableTable
  columns={['id', 'name', 'status', 'qps', 'updated_at']}
  rows={[
    { id: 1, name: 'node-01', status: 'online', qps: 1250, updated_at: '2026-08-19' },
    { id: 2, name: 'node-02', status: 'warning', qps: 890, updated_at: '2026-08-19' },
  ]}
  tableName="monitor_nodes"
  primaryKey="id"
/>

// 完整用法：自定义 SQL 执行 + 变更回调
<InlineEditableTable
  columns={columns}
  rows={data}
  tableName="users"
  primaryKey="id"
  editable={userHasPermission('admin.data.edit')}
  maxHeight="600px"
  onCellChange={(change, sql) => {
    console.log(`[Audit] Cell changed: ${change.column} ${change.oldValue} → ${change.newValue}`);
    console.log(`[SQL] ${sql}`);
  }}
  onExecuteSQL={async (sql) => {
    try {
      const result = await window.electronAPI.runSQL(sql);
      return { ok: true, affectedRows: result.rowsAffected };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }}
/>

// 单独使用纯函数 (单元测试友好)
const sql = buildUpdateSQL('orders', 'amount', '99.9', 'order_id', 'ORD-001');
console.log(formatSQLValue("It's working")); // 'It''s working'
```

---

## 📊 性能监控 · PerformanceMonitor

**文件**：`src/app/modules/admin/PerformanceMonitor.tsx`
**路由**：`/performance`
**权限**：`admin.performance.read`
**类型**：页面级组件 (Page Component)

### 核心功能

- 💓 **核心生命体征 (Vitals)**：FPS / JS Heap / DOM Nodes / Event Loop 延迟，每项带等级评价 (good/needs-improvement/poor)
- 🎯 **Web Vitals 面板**：FCP / LCP / CLS / TTFB / INP 真实用户体验指标
- 📈 **FPS 趋势图**：每秒采样，AreaChart 面积图
- 💾 **内存趋势图**：usedMB / totalMB 双折线
- 🧱 **资源加载 Top N**：按 size / duration 排序的慢资源列表
- 🔔 **阈值告警引擎**：9 项可配置阈值 (AlertThresholds) + 声音/Toast 告警 + 冷却时间
- 💾 **localStorage 持久化**：告警阈值存入 localStorage，刷新保留
- 📄 **性能报告导出**：JSON 格式完整快照导出

### 关键类型定义

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

/** 告警阈值配置 (localStorage 持久化) */
interface AlertThresholds {
  fpsMin: number;              // FPS 低于此值告警 (默认 30)
  memMaxPercent: number;       // JS Heap 使用率超过此值 (%) (默认 80)
  clsMax: number;              // CLS 超过此值告警 (默认 0.1)
  fcpMax: number;              // FCP 超过此值 (ms) (默认 3000)
  lcpMax: number;              // LCP 超过此值 (ms) (默认 4000)
  ttfbMax: number;             // TTFB 超过此值 (ms) (默认 1800)
  inpMax: number;              // INP 超过此值 (ms) (默认 200)
  storageMaxKB: number;        // localStorage 超过此值 (KB) (默认 4096)
  alertEnabled: boolean;       // 告警总开关 (默认 true)
  alertCooldownSec: number;    // 同一指标两次告警最小间隔 (默认 30)
}
```

### 工具函数

```typescript
/** 根据阈值评级 */
function rateVital(
  value: number,
  good: number,
  poor: number
): VitalMetric["rating"];

const ratingColor: Record<VitalMetric["rating"], string> = {
  good: "#00ff88",
  "needs-improvement": "#ffaa00",
  poor: "#ff3366",
  unknown: "rgba(0,212,255,0.3)",
};

const ratingLabel: Record<VitalMetric["rating"], string> = {
  good: "优秀",
  "needs-improvement": "需改善",
  poor: "较差",
  unknown: "未知",
};
```

### 关键 Props

**无 Props**（页面级组件）

### 默认阈值常量

```typescript
const DEFAULT_THRESHOLDS: AlertThresholds = {
  fpsMin: 30,
  memMaxPercent: 80,
  clsMax: 0.1,
  fcpMax: 3000,
  lcpMax: 4000,
  ttfbMax: 1800,
  inpMax: 200,
  storageMaxKB: 4096,
  alertEnabled: true,
  alertCooldownSec: 30,
};
```

### 使用示例

```tsx
<Route path="/performance" element={<PerformanceMonitor />} />
```

---

## 🌐 环境配置编辑器 · EnvConfigEditor

**文件**：`src/app/modules/admin/EnvConfigEditor.tsx`
**路由**：`/env-config`
**权限**：`admin.env.manage`
**类型**：页面级组件 (Page Component)

### 核心功能

- 🔑 API Key 管理 (加密存储 / 遮罩显示 / 一键复制)
- 🤖 模型提供商配置 (智谱 / DeepSeek / Ollama / OpenAI)
- 🌍 端点 URL 配置与连通性测试
- 📦 环境变量分组展示 (API / 安全 / 特性开关 / 开发调试)
- 👁️ 显示/隐藏敏感字段切换
- ⚠️ 生产环境只读模式 (基于 env.NODE_ENV)

### 关键 Props

```typescript
interface EnvConfigEditorProps {
  /** 强制只读模式 (覆盖环境判断) */
  forceReadOnly?: boolean;
}
```

### 使用示例

```tsx
<Route path="/env-config" element={<EnvConfigEditor />} />

// 在演示环境强制只读
<EnvConfigEditor forceReadOnly={import.meta.env.MODE === 'demo'} />
```

---

## 💾 存储管理器 · StorageManager

**文件**：`src/app/modules/admin/StorageManager.tsx`
**路由**：`/storage`
**权限**：`admin.storage.manage`
**类型**：页面级组件 (Page Component) · Storage 三件套之主控

### 核心功能

- 🎛️ **总控布局**：左侧 StorageSyncStatus 同步状态 + 右侧 StorageConfigPanel 配置
- 💾 **配置读写**：从 `storageManager.getConfig()` 读取，保存后 `storageManager.saveConfig()`
- 🔄 **手动触发同步**：保存完成后自动 `storageManager.triggerSync()`
- ⏳ **Loading 状态**：保存过程中 isSaving = true，按钮变 loading
- ❌ **错误处理**：捕获异常并显示 error 文案

### 关键 Props

**无 Props**

### Service 依赖

```typescript
import { storageManager } from '../../services/storageManager';
import type { StorageConfig } from '../../types/storage';

// StorageManager 内部逻辑
const [config, setConfig] = useState<StorageConfig>(storageManager.getConfig());

const handleSave = async () => {
  storageManager.saveConfig(config);
  await storageManager.triggerSync();
};
```

### 使用示例

```tsx
<Route path="/storage" element={<StorageManager />} />
```

---

## 💾 存储配置面板 · StorageConfigPanel

**文件**：`src/app/modules/admin/StorageConfigPanel.tsx`
**路由**：- (StorageManager 子组件)
**类型**：子面板 (Sub Panel) · Storage 三件套之配置

### 核心功能

- 🎚️ **存储后端切换**：localStorage / IndexedDB / 云端同步 (Supabase)
- ⏱️ **同步策略**：实时同步 / 定时同步 (可配置分钟) / 手动同步
- 📊 **容量限制**：各存储后端配额设置
- 🔐 **加密开关**：传输加密 + 静态加密选项
- ✅ **保存按钮**：触发父组件传入的 onSave 回调
- ⚠️ **错误展示**：显示来自 onSave 抛出的错误信息

### 关键 Props

```typescript
interface StorageConfigPanelProps {
  /** 当前存储配置 */
  config: StorageConfig;
  /** 配置变更时回调 (实时同步到父 state) */
  onConfigChange: (newConfig: StorageConfig) => void;
  /** 点击保存时回调 */
  onSave: () => Promise<void> | void;
  /** 保存中 loading 状态 */
  isSaving: boolean;
  /** 错误信息 (可选) */
  error?: string;
}
```

### 使用示例

```tsx
// 通常由 StorageManager 调用，也可独立嵌入
<StorageConfigPanel
  config={config}
  onConfigChange={setConfig}
  onSave={handleSave}
  isSaving={loading}
  error={saveError}
/>
```

---

## 💾 存储同步状态 · StorageSyncStatus

**文件**：`src/app/modules/admin/StorageSyncStatus.tsx`
**路由**：- (StorageManager 子组件)
**类型**：子面板 (Sub Panel) · Storage 三件套之状态

### 核心功能

- 🟢🟡🔴 **同步状态灯**：已同步 / 同步中 / 同步失败三态
- ⏰ **上次同步时间**：相对时间显示 (如 "3 分钟前")
- 📊 **同步统计**：本次同步数据条数 / 冲突数 / 错误数
- 🔄 **手动同步按钮**：触发立即同步
- ⚙️ **后端标识**：当前使用的存储后端 + 云端连接状态
- 📝 **最近同步日志**：最近 5 条同步记录简表

### 关键 Props

```typescript
interface StorageSyncStatusProps {
  /** 紧凑布局 (用于嵌入其他面板) */
  compact?: boolean;
}
```

### 使用示例

```tsx
// 作为 StorageManager 的左栏
<div className="lg:col-span-1">
  <StorageSyncStatus />
</div>

// 嵌入顶部状态栏
<StorageSyncStatus compact />
```

---

## 🔧 配置中心 · ConfigCenter

**文件**：`src/app/modules/admin/ConfigCenter.tsx`
**路由**：`/config-center`
**权限**：`admin.config.manage`
**类型**：页面级组件 (Page Component) · Config 套件主控

### 核心功能

- 📑 **双 Tab 架构**：
  - `pages` · 页面配置：按 navGroup 分组显示所有 PageConfig，选中后嵌入 PageConfigEditor
  - `storage` · 存储管理：存储容量统计 + 快捷操作
- 📁 **页面分组**：`pages.reduce()` 按 `page.sidebar.navGroup` 分组
- 📤 **全量导出**：导出所有页面配置为 `yyc3-config-backup.json`
- 📥 **全量导入**：通过 `<input type="file">` 导入配置 JSON
- 🔄 **一键重置**：`localStorage.removeItem` 清理后 reload (confirm 二次确认)

### 关键 Props

**无 Props**

### 内部状态

```typescript
const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
const [pages] = useState(() => getAllPages());   // 来自 ../../config
const [activeTab, setActiveTab] = useState<"pages" | "storage">("pages");
```

### 导出格式

```typescript
// handleExportAll() 生成的 JSON schema
interface ConfigBackup {
  pages: Record<string, PageConfig>;   // key = page.id
  exportedAt: string;                   // ISO timestamp
  version: "1.0.0";                     // schema version
}
```

### Tab 配置

```typescript
const tabs: { key: "pages" | "storage"; label: string; icon: typeof FileText }[] = [
  { key: "pages", label: "页面配置", icon: FileText },
  { key: "storage", label: "存储管理", icon: Database },
];
```

### 使用示例

```tsx
<Route path="/config-center" element={<ConfigCenter />} />
```

---

## 🔧 变量中心 · VariableCenter

**文件**：`src/app/modules/admin/VariableCenter.tsx`
**路由**：`/variables`
**权限**：`admin.config.manage`
**类型**：页面级组件 (Page Component)

### 核心功能

- 📋 **全局变量列表**：按分组 (系统变量 / 业务变量 / 自定义变量) 展示
- ➕ **新增变量**：Key / Value / Type / Description / Scope
- ✏️ **编辑变量**：支持 TypeScript 类型约束 (string/number/boolean/json)
- 🔍 **搜索过滤**：按 key / description 模糊搜索
- 📖 **版本历史**：变量修改历史 (修改人 / 修改时间 / 变更前后值)
- 📤 **导出变量**：导出为 .env 或 JSON 格式
- 💡 **使用示例**：提供变量在代码中的引用示例 `const value = env.VAR_NAME;`

### 关键 Props

```typescript
interface VariableCenterProps {
  /** 变量分组过滤 (只显示指定分组) */
  groupFilter?: "system" | "business" | "custom";
}
```

### 使用示例

```tsx
<Route path="/variables" element={<VariableCenter />} />

// 在业务面板中只展示业务变量
<VariableCenter groupFilter="business" />
```

---

## 🔧 页面配置编辑器 · PageConfigEditor

**文件**：`src/app/modules/admin/PageConfigEditor.tsx`
**路由**：- (ConfigCenter 子组件)
**类型**：子面板 (Sub Panel)

### 核心功能

- 📝 **单页配置编辑**：编辑指定 pageId 的 PageConfig 对象
- 🎨 **侧边栏配置**：navGroup / navOrder / icon / label / badge
- 👁️ **可见性控制**：enabled 开关 + 角色可见性白名单
- 🧭 **路由配置**：path / exact / redirect / lazy 开关
- 🔌 **数据源配置**：dataSource / pollingInterval / cacheTTL
- 🎯 **Layout 配置**：showSidebar / showTopBar / fullWidth / padding
- 💾 **自动保存**：debounced 写入 localStorage `yyc3-page-configs`
- ✅ **校验反馈**：非法 path 格式 / 重复 path 实时提示

### 关键 Props

```typescript
interface PageConfigEditorProps {
  /** 目标页面 ID */
  pageId: string | null;
  /** 配置更新后的回调 */
  onUpdate?: (pageConfig: PageConfig) => void;
}
```

### 依赖类型

```typescript
import { type PageConfig } from '../../config';
```

### 使用示例

```tsx
// 由 ConfigCenter 调用
<PageConfigEditor pageId={selectedPageId} onUpdate={handlePageUpdate} />
```

---

## 🔧 网络配置 · NetworkConfig

**文件**：`src/app/modules/admin/NetworkConfig.tsx`
**路由**：- (通常嵌套在 ConfigCenter 或独立引用)
**类型**：子面板 (Sub Panel)

### 核心功能

- 🌐 **API 基础 URL**：多环境配置 (development / staging / production)
- 🚦 **超时设置**：请求超时 / WebSocket 心跳超时 / 文件上传超时
- 🔄 **重试策略**：重试次数 + 退避算法 (linear / exponential) + 重试状态码白名单
- 🪜 **代理配置**：HTTP Proxy / SOCKS5 / 代理绕过列表
- 📡 **WebSocket 配置**：URL / 自动重连 / 重连间隔上限
- 🛡️ **证书设置**：自签证书信任 / SSL Pinning (Electron)
- 🧪 **连通性测试**：一键测试当前配置是否可通 (toast 反馈)

### 关键 Props

```typescript
interface NetworkConfigProps {
  /** 变更回调 */
  onChange?: (config: NetworkConfigShape) => void;
  /** 保存回调 */
  onSave?: () => Promise<void>;
}
```

### 使用示例

```tsx
// 作为 ConfigCenter Tab 使用
<TabPanel value="network">
  <NetworkConfig onSave={saveNetworkConfig} />
</TabPanel>
```

---

<div align="center">

---

**[⬆ 返回顶部](#-目录--table-of-contents)** · **[README.md](./README.md)** · **[API-REFERENCE.md](./API-REFERENCE.md)** · **[DEV-GUIDE.md](../../src/app/modules/admin/DEV-GUIDE.md)**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
