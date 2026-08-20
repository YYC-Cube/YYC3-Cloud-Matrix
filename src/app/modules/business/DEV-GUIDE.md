---
file: DEV-GUIDE.md
description: Business 业务场景模块开发者指导文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-07-25
updated: 2026-07-25
status: stable
tags: [guide],[business],[module]
category: guide
language: zh-CN
audience: developers
complexity: basic
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 模块概述

`business` 是业务场景模块，承载平台面向具体业务场景的功能组件，当前包含酒店管理和通讯站管理。

### 功能域

| 功能域 | 组件 | 路由 |
|--------|------|------|
| 酒店管理 | HotelDashboard | `/hotel` |
| 通讯站 | CommStationPanel | `/comm-station` |

## 文件结构

```
business/
├── index.ts               # Barrel 统一导出
├── DEV-GUIDE.md           # 本文档
├── HotelDashboard.tsx     # 酒店管理仪表盘
└── CommStationPanel.tsx   # 通讯站管理面板
```

## 导出清单

```typescript
export { HotelDashboard } from './HotelDashboard';
export { CommStationPanel } from './CommStationPanel';
```

## 依赖关系

### 外部依赖

| 依赖 | 用途 |
|------|------|
| `../shared/GlassCard` | 卡片容器 |
| `../../hooks/useI18n` | 国际化 |
| `../../lib/*` | 工具库 |
| `lucide-react` | 图标库 |

## 使用方式

### 路由配置

```typescript
const HotelDashboard = lazy(() =>
  import("./modules/business/HotelDashboard").then(m => ({ default: m.HotelDashboard }))
);
const CommStationPanel = lazy(() =>
  import("./modules/business/CommStationPanel").then(m => ({ default: m.CommStationPanel }))
);
```

### 新增业务场景

1. 在 `business/` 下创建组件文件
2. 在 `index.ts` 中添加导出
3. 在 `routes.tsx` 中添加路由懒加载
4. 在 `shared/Sidebar.tsx` 的 `NAV_CATEGORIES.business.children` 中添加导航项

## 扩展规划

该模块为业务场景容器，后续可扩展的子模块：

| 场景 | 路由 | 说明 |
|------|------|------|
| 智慧酒店 | `/hotel/*` | 已实现，可扩展子页面 |
| 通讯站 | `/comm-station/*` | 已实现，可扩展子页面 |
| 更多业务场景 | TBD | 按需扩展 |

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-07-25 | 初始版本 — 模块拆分后独立 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」

</div>