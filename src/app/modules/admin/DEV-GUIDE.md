---
file: DEV-GUIDE.md
description: Admin 审计与系统管理模块开发者指导文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-07-25
updated: 2026-07-25
status: stable
tags: [guide],[admin],[module]
category: guide
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

## 模块概述

`admin` 是审计与系统管理模块，集中管理平台安全、用户、配置、监控等核心功能。

### 功能域

| 功能域 | 组件 | 路由 |
|--------|------|------|
| 操作审计 | OperationAudit | `/audit` |
| 用户管理 | UserManagement | `/users` |
| 系统设置 | SystemSettings | `/settings` |
| 统一设置面板 | UnifiedSettingsPanel | `/unified-settings` |
| 安全监控 | SecurityMonitor | `/security` |
| PWA 管理 | PWAStatusPanel, PWAInstallPrompt | `/pwa` |
| 数据编辑 | DataEditorPanel, InlineEditableTable | `/data-editor` |
| 性能监控 | PerformanceMonitor | `/performance` |
| 环境配置 | EnvConfigEditor | `/env-config` |
| 存储管理 | StorageManager, StorageConfigPanel, StorageSyncStatus | `/storage` |
| 配置中心 | ConfigCenter, VariableCenter, PageConfigEditor, NetworkConfig | `/config-center`, `/variables` |

## 文件结构

```
admin/
├── index.ts                  # Barrel 统一导出
├── DEV-GUIDE.md              # 本文档
├── OperationAudit.tsx        # 操作审计
├── UserManagement.tsx        # 用户管理
├── SystemSettings.tsx        # 系统设置
├── UnifiedSettingsPanel.tsx  # 统一设置面板
├── SecurityMonitor.tsx       # 安全监控
├── PWAStatusPanel.tsx        # PWA 状态面板
├── PWAInstallPrompt.tsx      # PWA 安装提示
├── DataEditorPanel.tsx       # 数据编辑器面板
├── InlineEditableTable.tsx   # 内联可编辑表格
├── PerformanceMonitor.tsx    # 性能监控
├── EnvConfigEditor.tsx       # 环境变量编辑器
├── StorageManager.tsx        # 存储管理器
├── StorageConfigPanel.tsx    # 存储配置面板
├── StorageSyncStatus.tsx     # 存储同步状态
├── ConfigCenter.tsx          # 配置中心
├── VariableCenter.tsx        # 变量中心
├── PageConfigEditor.tsx      # 页面配置编辑器
└── NetworkConfig.tsx         # 网络配置
```

## 导出清单

```typescript
export { OperationAudit } from './OperationAudit';
export { UserManagement } from './UserManagement';
export { SystemSettings } from './SystemSettings';
export { UnifiedSettingsPanel } from './UnifiedSettingsPanel';
export { SecurityMonitor } from './SecurityMonitor';
export { PWAStatusPanel } from './PWAStatusPanel';
export { PWAInstallPrompt } from './PWAInstallPrompt';
export { DataEditorPanel } from './DataEditorPanel';
export { InlineEditableTable } from './InlineEditableTable';
export { PerformanceMonitor } from './PerformanceMonitor';
export { EnvConfigEditor } from './EnvConfigEditor';
export { StorageManager } from './StorageManager';
export { StorageConfigPanel } from './StorageConfigPanel';
export { StorageSyncStatus } from './StorageSyncStatus';
export { ConfigCenter } from './ConfigCenter';
export { VariableCenter } from './VariableCenter';
export { PageConfigEditor } from './PageConfigEditor';
export { NetworkConfig } from './NetworkConfig';
```

## 依赖关系

### 模块内依赖

### 外部依赖

| 依赖 | 用途 |
|------|------|
| `../shared/*` | GlassCard, Layout 等共用组件 |
| `../../components/ui/*` | shadcn/ui 组件 (button, dialog, progress, scroll-area 等) |
| `../../hooks/useI18n` | 国际化 |
| `../../store` | 全局状态管理 |
| `../../services/storageManager` | 存储服务 |
| `../../types/*` | 类型定义 |
| `../dev/*` | 引用 Dev 模块（设计系统、主题定制） |

### 被依赖方

- `ops/DatabaseManager` → `admin/InlineEditableTable`
- `shared/Layout` → `admin/PWAInstallPrompt`

## 使用方式

### 在路由中使用

```typescript
const OperationAudit = lazy(() =>
  import("./modules/admin/OperationAudit").then(m => ({ default: m.OperationAudit }))
);
```

### 跨模块引用

```typescript
// 其他模块引用 admin 的通用组件
import { InlineEditableTable } from '../admin/InlineEditableTable';
```

## 新增功能组件

1. 在 `admin/` 下创建 `PascalCase.tsx` 文件
2. 在 `index.ts` 中添加导出
3. 在 `routes.tsx` 中添加路由懒加载配置
4. 在 `shared/Sidebar.tsx` 的 `NAV_CATEGORIES.admin.children` 中添加导航项

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-07-25 | 初始版本 — 模块拆分后独立 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」

</div>