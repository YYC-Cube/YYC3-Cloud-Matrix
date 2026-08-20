---
file: DEV-GUIDE.md
description: Dev 开发工具与 IDE 模块开发者指导文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-07-25
updated: 2026-07-25
status: stable
tags: [guide],[dev],[ide],[module]
category: guide
language: zh-CN
audience: developers
complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 模块概述

`dev` 是开发工具与 IDE 模块，为开发者提供设计系统、主题定制、CLI 终端、IDE 面板、重构报告和架构审计等全套开发工具。

### 功能域

| 功能域 | 组件 | 路由 |
|--------|------|------|
| 设计系统 | DesignSystemPage | `/design-system` |
| 主题定制 | ThemeCustomizer, ColorSwatch, ColorPicker | `/theme` |
| CLI 终端 | CLITerminal, IntegratedTerminal | `/terminal` |
| IDE 面板 | IDEPanel, IDELayout, IDETopBar, IDEStatusBar, IDESettingsPanel | `/ide` |
| 重构报告 | RefactoringReport | `/refactoring` |
| 架构审计 | ArchitectureAudit | `/architecture` |
| 开发指南 | DevGuidePage | `/dev-guide` |

## 文件结构

```
dev/
├── index.ts                  # Barrel 统一导出
├── DEV-GUIDE.md              # 本文档
├── routes.ts                 # 模块路由配置
├── DesignSystemPage.tsx      # 设计系统页面
├── DevGuidePage.tsx          # 开发指南页面
├── ThemeCustomizer.tsx       # 主题定制器
├── CLITerminal.tsx           # CLI 终端
├── IntegratedTerminal.tsx    # 集成终端
├── IDEPanel.tsx              # IDE 面板
├── RefactoringReport.tsx     # 重构报告
├── ArchitectureAudit.tsx     # 架构审计
│
├── hooks/
│   └── useTerminal.ts        # 终端 Hook
│
├── ide/
│   ├── IDELayout.tsx         # IDE 布局容器
│   ├── IDETopBar.tsx         # IDE 顶栏
│   ├── IDEStatusBar.tsx      # IDE 状态栏
│   ├── IDESettingsPanel.tsx  # IDE 设置面板
│   ├── IDETerminal.tsx       # IDE 终端
│   ├── IDEViewSwitcher.tsx   # 视图切换器
│   ├── FileExplorer.tsx      # 文件浏览器
│   ├── GitPanel.tsx          # Git 面板
│   ├── AIChatPanel.tsx       # AI 聊天面板
│   ├── CodePreviewPanel.tsx  # 代码预览
│   ├── Workspace.tsx         # 工作区
│   ├── TabBar.tsx            # 标签栏
│   ├── Panel.tsx, PanelContainer.tsx, PanelContent.tsx, PanelHeader.tsx, PanelToolbar.tsx, PanelResizeHandle.tsx
│   ├── LayoutContext.tsx     # 布局上下文
│   ├── NotificationPanel.tsx # 通知面板
│   ├── DeployDialog.tsx      # 部署弹窗
│   ├── ShareDialog.tsx       # 分享弹窗
│   ├── GPUNodeCard.tsx       # GPU 节点卡片
│   ├── XtermTerminal.tsx     # Xterm 终端
│   ├── XtermIntegration.ts   # Xterm 集成
│   ├── ide-types.ts          # IDE 类型
│   ├── ide-layout-types.ts   # 布局类型
│   ├── ide-mock-data.ts      # 模拟数据
│   └── layout.css            # 布局样式
│
└── theme/
    ├── theme-presets.ts      # 主题预设
    ├── color-utils.ts        # 颜色工具
    ├── ColorSwatch.tsx       # 色板组件
    └── ColorPicker.tsx       # 颜色选择器
```

## 导出清单

### 页面组件

```typescript
export { DesignSystemPage, DevGuidePage, ThemeCustomizer, CLITerminal, IntegratedTerminal, IDEPanel, RefactoringReport, ArchitectureAudit };
```

### IDE 子模块

```typescript
export { IDELayout, IDETopBar, IDEStatusBar, IDESettingsPanel };
```

### Hooks

```typescript
export { useTerminal } from './hooks/useTerminal';
```

### 主题系统

```typescript
export { ColorSwatch, ColorPicker, formatOklch, hexToOklch, oklchToHex };
export { DEFAULT_BRANDING, DEFAULT_COLORS, DEFAULT_SHADOW, DEFAULT_TYPOGRAPHY, THEME_PRESETS };
export type { BrandingConfig, ThemeColors, ThemePreset, ThemeShadow, ThemeTypography };
```

### 路由

```typescript
export { devRoutes } from './routes';
```

## 依赖关系

### 外部依赖

| 依赖 | 用途 |
|------|------|
| `../shared/GlassCard` | 卡片容器 |
| `../../hooks/useI18n` | 国际化 |
| `../../store/*` | 全局状态 (IDE settings) |
| `../../types` | 类型定义 |
| `../../lib/*` | 工具库 (env-config 等) |
| `xterm` | 终端模拟器 |
| `zustand` | 状态管理 |

### 被依赖方

- `admin/SystemSettings` → `dev/design-system/DesignSystemPage`, `dev/ThemeCustomizer`

## 使用方式

### IDE 状态管理

```typescript
import { useIDESettingsSlice } from '../../store/slices/ide-settings-slice';
// 统一管理 layoutMode, settings, layoutConfig 三个数据域
```

### 主题定制

```typescript
import { hexToOklch, oklchToHex } from '../dev/theme/color-utils';
import { THEME_PRESETS } from '../dev/theme/theme-presets';
```

### 终端命令

```typescript
import { useTerminal } from '../dev/hooks/useTerminal';
// 支持 cpim, env, goto, ai, kb 等命令
```

### 新增 IDE 功能

1. 在 `dev/ide/` 下创建组件文件
2. 在 `dev/index.ts` 中添加导出
3. 如需新状态，在 `../../store/slices/` 中创建对应 slice

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-07-25 | 初始版本 — 模块拆分后独立 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」

</div>