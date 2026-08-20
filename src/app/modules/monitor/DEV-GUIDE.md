---
file: DEV-GUIDE.md
description: Monitor 监控与巡检模块开发者指导文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-07-25
updated: 2026-07-25
status: stable
tags: [guide],[monitor],[module]
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

`monitor` 是监控与巡检模块，负责数据监控大盘、异常跟进、巡查管理、告警规则和 AI 建议等核心监控功能。

### 功能域

| 功能域 | 组件 | 路由 |
|--------|------|------|
| 仪表盘 | DataMonitoring, Dashboard | `/` |
| 跟进管理 | FollowUpPanel, FollowUpManager, FollowUpCard, FollowUpDrawer, FollowUpEditDialog | `/follow-up`, `/follow-up-manager` |
| 巡查管理 | PatrolDashboard, PatrolReport, PatrolScheduler, PatrolHistory | `/patrol` |
| 告警管理 | AlertBanner, AlertRulesPanel, CreateRuleModal | `/alerts` |
| AI 建议 | AISuggestionPanel, ActionRecommender, PatternAnalyzer, SDKChatPanel | `/sdk-chat` |
| 快捷操作 | QuickActionGroup | - |
| 通用组件 | NodeDetailModal, UnifiedModelSelector | - |

## 文件结构

```
monitor/
├── index.ts              # Barrel 统一导出
├── DEV-GUIDE.md          # 本文档
│
├── DataMonitoring.tsx    # 数据监控仪表盘
├── Dashboard.tsx         # 通用仪表盘
│
├── FollowUpPanel.tsx     # 跟进面板
├── FollowUpManager.tsx   # 跟进管理器
├── FollowUpCard.tsx      # 跟进卡片
├── FollowUpDrawer.tsx    # 跟进抽屉
├── FollowUpEditDialog.tsx # 跟进编辑弹窗
│
├── PatrolDashboard.tsx   # 巡查仪表盘
├── PatrolReport.tsx      # 巡查报告
├── PatrolScheduler.tsx   # 巡查调度器
├── PatrolHistory.tsx     # 巡查历史
│
├── AlertBanner.tsx       # 告警横幅
├── AlertRulesPanel.tsx   # 告警规则面板
├── CreateRuleModal.tsx   # 创建规则弹窗
│
├── AISuggestionPanel.tsx # AI 建议面板
├── ActionRecommender.tsx # 操作建议
├── PatternAnalyzer.tsx   # 模式分析器
├── SDKChatPanel.tsx      # SDK 聊天面板
│
├── QuickActionGroup.tsx  # 快捷操作组
├── NodeDetailModal.tsx   # 节点详情弹窗
└── UnifiedModelSelector.tsx # 统一模型选择器
```

## 导出清单

```typescript
// 仪表盘
export { DataMonitoring } from './DataMonitoring';
export { Dashboard } from './Dashboard';

// 跟进管理
export { FollowUpPanel, FollowUpManager, FollowUpCard, FollowUpDrawer, FollowUpEditDialog } from './...';

// 巡查
export { PatrolDashboard, PatrolReport, PatrolScheduler, PatrolHistory } from './...';

// 告警
export { AlertBanner, AlertRulesPanel, CreateRuleModal } from './...';

// AI 建议
export { AISuggestionPanel, ActionRecommender, PatternAnalyzer, SDKChatPanel } from './...';

// 通用
export { QuickActionGroup, NodeDetailModal, UnifiedModelSelector } from './...';
```

## 依赖关系

### 内部依赖

- `FollowUpPanel` → `FollowUpCard`, `FollowUpDrawer`, `FollowUpEditDialog`
- `Dashboard` → `NodeDetailModal`
- `SDKChatPanel` → `UnifiedModelSelector`

### 外部依赖

| 依赖 | 用途 |
|------|------|
| `../shared/GlassCard` | 卡片容器 |
| `../../hooks/useI18n` | 国际化 |
| `../../lib/view-context` | 视口响应式 |
| `../../store/*` | 全局状态 |
| `../../types` | 类型定义 |
| `../../components/ui/*` | shadcn/ui 组件 |

## 使用方式

### 路由配置

```typescript
const DataMonitoring = lazy(() =>
  import("./modules/monitor/DataMonitoring").then(m => ({ default: m.DataMonitoring }))
);
const PatrolDashboard = lazy(() =>
  import("./modules/monitor/PatrolDashboard").then(m => ({ default: m.PatrolDashboard }))
);
```

### 新增监控功能

1. 在 `monitor/` 下创建组件文件
2. 在 `index.ts` 中添加导出
3. 在 `routes.tsx` 中添加路由懒加载
4. 在 `shared/Sidebar.tsx` 的 `NAV_CATEGORIES.monitor.children` 中添加导航项

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-07-25 | 初始版本 — 模块拆分后独立 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」

</div>