---
file: DEV-GUIDE.md
description: 全局 UI/UX 共用层开发者指导文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-07-25
updated: 2026-07-25
status: stable
tags: [guide],[shared],[module]
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

`shared` 是全局 UI/UX 共用层，为所有独立子模块提供基础设施。每个独立项目模块均依赖此层启动。

### 核心职责

| 职责 | 组件 |
|------|------|
| 布局系统 | Layout, Sidebar, TopBar, BottomNav |
| 认证系统 | Login |
| 错误处理 | ErrorBoundary, NotFound |
| 品牌标识 | YYC3Logo, YYC3LogoSvg |
| 通用交互 | GlassCard, LanguageSwitcher, AIAssistant, CommandPalette, OfflineIndicator, ConnectionStatus, QuickActionGrid |

## 文件结构

```
shared/
├── index.ts                # Barrel 统一导出
├── DEV-GUIDE.md            # 本文档
├── Layout.tsx              # 全局布局容器
├── Sidebar.tsx             # 侧边栏导航
├── TopBar.tsx              # 顶部栏
├── BottomNav.tsx           # 底部导航（移动端）
├── Login.tsx               # 登录页
├── ErrorBoundary.tsx       # 错误边界
├── NotFound.tsx            # 404 页面
├── GlassCard.tsx           # 毛玻璃卡片
├── LanguageSwitcher.tsx    # 语言切换器
├── YYC3Logo.tsx            # 品牌 Logo 组件
├── YYC3LogoSvg.tsx         # Logo SVG 资源
├── AIAssistant.tsx         # AI 助手浮窗
├── CommandPalette.tsx      # 命令面板 (Cmd+K)
├── OfflineIndicator.tsx    # 离线状态指示器
├── ConnectionStatus.tsx    # 连接状态指示器
└── QuickActionGrid.tsx     # 快捷操作网格
```

## 导出清单

```typescript
// 布局组件
export { Layout } from './Layout';
export { Sidebar, SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from './Sidebar';
export { TopBar } from './TopBar';
export { BottomNav } from './BottomNav';

// 认证与品牌
export { Login } from './Login';
export { YYC3Logo } from './YYC3Logo';
export { YYC3LogoSvg } from './YYC3LogoSvg';

// 通用组件
export { ErrorBoundary } from './ErrorBoundary';
export { GlassCard } from './GlassCard';
export { NotFound } from './NotFound';
export { LanguageSwitcher } from './LanguageSwitcher';

// 全局交互
export { AIAssistant } from './AIAssistant';
export { CommandPalette } from './CommandPalette';
export { OfflineIndicator } from './OfflineIndicator';
export { ConnectionStatus } from './ConnectionStatus';
export { QuickActionGrid } from './QuickActionGrid';
```

## 依赖关系

### 外部依赖

| 依赖 | 用途 |
|------|------|
| `react-router` | 路由导航 |
| `lucide-react` | 图标库 |
| `../../hooks/useI18n` | 国际化 |
| `../../lib/view-context` | 视口响应式 |

### 被依赖方

所有模块均依赖 `shared` 模块：

```
admin / monitor / ops / ai / ai-family / dev / business
                      └── shared ──┘
```

## 使用方式

### 在独立项目中使用共享组件

```typescript
import { Layout, GlassCard, ErrorBoundary } from '../shared';
// 或通过 barrel
import { Layout, GlassCard, ErrorBoundary } from '../shared/index';
```

### 布局使用示例

```tsx
<Layout>
  <YourModuleComponent />
</Layout>
```

Layout 自动包含：Sidebar + TopBar + BottomNav + AIAssistant + CommandPalette + OfflineIndicator + ErrorBoundary

### 新增共用组件

1. 在 `shared/` 下创建组件文件，遵循 `PascalCase.tsx` 命名
2. 在 `index.ts` 中添加导出
3. 其他模块即可通过 `import { X } from '../shared'` 使用

## 设计规范

### 主题色彩

| 颜色 | 用途 |
|------|------|
| `#00d4ff` | 主色调（赛博青） |
| `rgba(0,212,255,0.08)` | 激活态背景 |
| `rgba(4,10,22,0.95)` | 侧边栏背景 |
| `rgba(0,180,255,0.06)` | 边框分隔线 |

### 侧边栏尺寸

- 折叠宽度: `52px`
- 展开宽度: `208px`
- Logo 区高度: `52px`

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-07-25 | 初始版本 — 模块拆分后共享层确立 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」

</div>