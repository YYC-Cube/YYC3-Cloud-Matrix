---
file: DEV-GUIDE.md
description: AI 决策与模型管理模块开发者指导文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-07-25
updated: 2026-07-25
status: stable
tags: [guide],[ai],[module]
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

`ai` 是 AI 决策与模型管理模块，提供 AI 诊断、模型供应商配置和模型生命周期管理。

### 功能域

| 功能域 | 组件 | 路由 |
|--------|------|------|
| AI 诊断 | AIDiagnostics | `/ai-diagnosis` |
| 模型供应商 | ModelProviderPanel, AddModelModal, ProviderEditorModal | `/models` |
| AI 决策 | (路由挂载) | `/ai` |

## 文件结构

```
ai/
├── index.ts               # Barrel 统一导出
├── DEV-GUIDE.md           # 本文档
├── AIDiagnostics.tsx      # AI 诊断面板
├── ModelProviderPanel.tsx # 模型供应商管理面板
├── AddModelModal.tsx      # 添加模型弹窗
└── ProviderEditorModal.tsx # 供应商编辑弹窗
```

## 导出清单

```typescript
export { AIDiagnostics } from './AIDiagnostics';
export { ModelProviderPanel } from './ModelProviderPanel';
export { AddModelModal } from './AddModelModal';
export { ProviderEditorModal } from './ProviderEditorModal';
```

## 依赖关系

### 外部依赖

| 依赖 | 用途 |
|------|------|
| `../shared/GlassCard` | 卡片容器 |
| `../../hooks/useI18n` | 国际化 |
| `../../store/slices/provider-slice` | 模型供应商状态 |
| `../../types` | 类型定义 |

### 被依赖方

- `shared/Sidebar` → 导航配置 `NAV_CATEGORIES.ai`

## 使用方式

### 路由配置

```typescript
const ModelProviderPanel = lazy(() =>
  import("./modules/ai/ModelProviderPanel").then(m => ({ default: m.ModelProviderPanel }))
);
const AIDiagnostics = lazy(() =>
  import("./modules/ai/AIDiagnostics").then(m => ({ default: m.AIDiagnostics }))
);
```

### 新增 AI 功能

1. 在 `ai/` 下创建组件文件
2. 在 `index.ts` 中添加导出
3. 在 `routes.tsx` 中添加路由懒加载
4. 在 `shared/Sidebar.tsx` 的 `NAV_CATEGORIES.ai.children` 中添加导航项

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-07-25 | 初始版本 — 模块拆分后独立 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」

</div>