---
file: DEV-GUIDE.md
description: OPS 运维与操作中心模块开发者指导文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-07-25
updated: 2026-07-25
status: stable
tags: [guide],[ops],[module]
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

`ops` 是运维与操作中心模块，涵盖操作执行、文件管理、数据库管理、服务闭环和报告导出等运维核心功能。

### 功能域

| 功能域 | 组件 | 路由 |
|--------|------|------|
| 操作中心 | OperationCenter, OperationChain, OperationCategory, OperationLogStream, OperationTemplate | `/operations` |
| 文件管理 | LocalFileManager, FileBrowser, HostFileManager | `/files`, `/host-files` |
| 数据库 | DatabaseManager, DatabaseConnectionPanel | `/database`, `/db-connections` |
| 服务闭环 | ServiceLoopPanel, LoopStageCard, ServiceConnectionTest | `/loop`, `/connection-test` |
| 报告导出 | ReportExporter, ReportGenerator, ConfigExportCenter | `/reports`, `/export-center` |
| 连接监控 | ConnectionMonitorPanel | `/connection-monitor` |
| 日志查看 | LogViewer | - |

## 文件结构

```
ops/
├── index.ts                  # Barrel 统一导出
├── DEV-GUIDE.md              # 本文档
│
├── OperationCenter.tsx       # 操作中心主面板
├── OperationChain.tsx        # 操作链
├── OperationCategory.tsx     # 操作分类
├── OperationLogStream.tsx    # 操作日志流
├── OperationTemplate.tsx     # 操作模板
│
├── LocalFileManager.tsx      # 本地文件管理器
├── FileBrowser.tsx           # 文件浏览器
├── HostFileManager.tsx       # 主机文件管理器
│
├── DatabaseManager.tsx       # 数据库管理器
├── DatabaseConnectionPanel.tsx # 数据库连接面板
│
├── ServiceLoopPanel.tsx      # 服务闭环面板
├── LoopStageCard.tsx         # 闭环阶段卡片
├── ServiceConnectionTest.tsx # 服务连接测试
│
├── ReportExporter.tsx        # 报告导出器
├── ReportGenerator.tsx       # 报告生成器
├── ConfigExportCenter.tsx    # 配置导出中心
│
├── ConnectionMonitorPanel.tsx # 连接监控面板
└── LogViewer.tsx             # 日志查看器
```

## 导出清单

```typescript
// 操作中心
export { OperationCenter, OperationChain, OperationCategory, OperationLogStream, OperationTemplate };

// 文件管理
export { LocalFileManager, FileBrowser, HostFileManager };

// 数据库
export { DatabaseManager, DatabaseConnectionPanel };

// 服务闭环
export { ServiceLoopPanel, LoopStageCard, ServiceConnectionTest };

// 报告导出
export { ReportExporter, ReportGenerator, ConfigExportCenter };

// 监控与日志
export { ConnectionMonitorPanel, LogViewer };
```

## 依赖关系

### 跨模块依赖

| 引用方 | 被引用方 | 用途 |
|--------|----------|------|
| `ops/OperationCenter` | `shared/QuickActionGrid` | 快捷操作 |
| `ops/DatabaseManager` | `admin/InlineEditableTable` | 可编辑表格 |

### 外部依赖

| 依赖 | 用途 |
|------|------|
| `../shared/GlassCard` | 卡片容器 |
| `../../hooks/useI18n` | 国际化 |
| `../../lib/*` | 工具库 |
| `../../store/*` | 全局状态 |
| `../../types` | 类型定义 |
| `../../../database/ConnectionManager` | 数据库连接管理 |
| `lucide-react` | 图标库 |

## 使用方式

### 路由配置

```typescript
const OperationCenter = lazy(() =>
  import("./modules/ops/OperationCenter").then(m => ({ default: m.OperationCenter }))
);
const DatabaseManager = lazy(() =>
  import("./modules/ops/DatabaseManager").then(m => ({ default: m.DatabaseManager }))
);
```

### 新增运维功能

1. 在 `ops/` 下创建组件文件
2. 在 `index.ts` 中添加导出
3. 在 `routes.tsx` 中添加路由懒加载
4. 在 `shared/Sidebar.tsx` 的 `NAV_CATEGORIES.ops.children` 中添加导航项

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-07-25 | 初始版本 — 模块拆分后独立 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」

</div>