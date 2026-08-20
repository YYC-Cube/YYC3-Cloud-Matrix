---
file: README.md
description: 全局 UI/UX 共用层模块文档 - YYC3 CloudPivot Intelli-Matrix 基础设施层
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [guide, shared, module]
category: guide
language: zh-CN
audience: developers
complexity: intermediate
---

<div align="center">

# ✦ YYC3 · CloudPivot Intelli-Matrix ✦

### 言启千行代码 · 语枢万物智能

**研发团队：YanYuCloudCube** | **联系邮箱：admin@0379.email**

---

</div>

---

## 模块概述

**模块名：** 全局 UI/UX 共用层（Shared Layer）

**模块定位：** YYC3 CloudPivot Intelli-Matrix 项目的基础设施层，为所有独立子模块提供统一的 UI/UX 基元与系统级能力。每个独立项目模块均依赖此层启动，确保全平台视觉与交互体验的一致性。

**设计理念：**
- **一处定义，处处复用**：所有通用组件与系统能力集中管理
- **五维驱动架构**：以时间、空间、属性、事件、关联五个维度构建高可用系统
- **五高标准体系**：高可用、高性能、高安全、高可扩展、高智能化

---

## 文件结构

```
shared/
├── index.ts                  # Barrel 统一导出入口
├── DEV-GUIDE.md              # 模块内部开发指南
├── Layout.tsx                # 全局布局容器（布局系统核心）
├── Sidebar.tsx               # 侧边栏导航（折叠52px / 展开208px）
├── TopBar.tsx                # 顶部栏（标题栏 + 工具栏）
├── BottomNav.tsx             # 底部导航（移动端适配）
├── Login.tsx                 # 认证系统 - 登录页
├── ErrorBoundary.tsx         # 错误边界 - 全局异常捕获
├── NotFound.tsx              # 404 页面 - 路由兜底
├── GlassCard.tsx             # 毛玻璃卡片 - 通用容器
├── LanguageSwitcher.tsx      # 语言切换器（多语言支持）
├── YYC3Logo.tsx              # 品牌 Logo 组件
├── YYC3LogoSvg.tsx           # Logo SVG 源资源
├── AIAssistant.tsx           # AI 助手浮窗
├── CommandPalette.tsx        # 命令面板（Cmd+K / Ctrl+K）
├── OfflineIndicator.tsx      # 离线状态指示器
├── ConnectionStatus.tsx      # 连接状态指示器
└── QuickActionGrid.tsx       # 快捷操作网格
```

---

## 核心功能域

### 1. 布局系统（Layout System）
提供全响应式的三端适配布局框架：
- **Layout.tsx**：全局布局容器，管理侧边栏状态、主题注入、路由出口
- **Sidebar.tsx**：赛博青主题侧边栏，支持折叠/展开状态持久化
- **TopBar.tsx**：顶部导航栏，承载面包屑、用户菜单、通知中心
- **BottomNav.tsx**：移动端底部 Tab 导航，与侧边栏状态同步

### 2. 认证系统（Authentication）
- **Login.tsx**：统一登录入口，支持 OAuth2、账号密码、SSO 多种方式
- 与主应用状态管理深度集成，支持路由守卫

### 3. 错误处理（Error Handling）
- **ErrorBoundary.tsx**：React 错误边界，捕获渲染异常并展示降级 UI
- **NotFound.tsx**：404 路由兜底页面，提供快捷导航回退

### 4. 品牌标识（Brand Identity）
- **YYC3Logo.tsx**：可配置尺寸/颜色的 Logo 组件
- **YYC3LogoSvg.tsx**：矢量 Logo 源文件，支持主题自适应

### 5. 通用交互（Common Interactions）
| 组件 | 能力域 |
|------|--------|
| GlassCard | 毛玻璃容器，层级化视觉 |
| LanguageSwitcher | i18n 多语言切换 |
| AIAssistant | AI 对话浮窗入口 |
| CommandPalette | 全局命令面板（K 快捷键） |
| OfflineIndicator | 网络离线检测提示 |
| ConnectionStatus | WebSocket / API 连接状态 |
| QuickActionGrid | 首页快捷入口网格 |

---

## 导出清单

所有导出通过 `index.ts` Barrel 方式统一暴露：

```typescript
// 布局系统
export { Layout } from './Layout';
export { Sidebar } from './Sidebar';
export { TopBar } from './TopBar';
export { BottomNav } from './BottomNav';

// 认证系统
export { Login } from './Login';

// 错误处理
export { ErrorBoundary } from './ErrorBoundary';
export { NotFound } from './NotFound';

// 品牌标识
export { YYC3Logo } from './YYC3Logo';
export { YYC3LogoSvg } from './YYC3LogoSvg';

// 通用交互
export { GlassCard } from './GlassCard';
export { LanguageSwitcher } from './LanguageSwitcher';
export { AIAssistant } from './AIAssistant';
export { CommandPalette } from './CommandPalette';
export { OfflineIndicator } from './OfflineIndicator';
export { ConnectionStatus } from './ConnectionStatus';
export { QuickActionGrid } from './QuickActionGrid';

// 常量
export { SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from './constants';
```

---

## 依赖关系

### 入站依赖（本模块依赖）
| 依赖包 | 用途 | 最低版本 |
|--------|------|----------|
| `react` | UI 框架 | ^18.2.0 |
| `react-dom` | React DOM 渲染 | ^18.2.0 |
| `next` | Next.js 框架 | ^14.0.0 |
| `lucide-react` | 图标库 | ^0.300.0 |
| `clsx` + `tailwind-merge` | className 工具 | 最新 |
| `@radix-ui/react-*` | Radix UI 原语 | 最新 |
| `shadcn/ui` 组件库 | UI 基础组件 | 内置 |
| `zustand` | 轻量状态管理 | ^4.4.0 |

### 出站依赖（依赖本模块的模块）
- 所有业务子模块（module-a, module-b, ...）
- 主应用入口 App.tsx

---

## 使用方式

### 快速开始

```tsx
// app/layout.tsx - 根布局
import { Layout, ErrorBoundary } from '@/modules/shared';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ErrorBoundary>
          <Layout>{children}</Layout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 组件使用示例

```tsx
// 业务页面中使用 GlassCard + QuickActionGrid
import { GlassCard, QuickActionGrid, YYC3Logo } from '@/modules/shared';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <YYC3Logo size="lg" variant="cyber" />
      
      <GlassCard elevation="md">
        <h2 className="text-xl font-semibold text-cyan-100">控制台</h2>
      </GlassCard>
      
      <QuickActionGrid />
    </div>
  );
}
```

### 常量引用

```tsx
import { SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from '@/modules/shared';

const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;
// SIDEBAR_COLLAPSED_W = 52 (px)
// SIDEBAR_EXPANDED_W = 208 (px)
```

---

## 设计规范

### 主题色值
| 语义 | 色值 | 用途 |
|------|------|------|
| 赛博青（主色） | `#00d4ff` | 品牌主色、交互高亮、激活状态 |
| 赛博青-柔光 | `rgba(0, 212, 255, 0.15)` | Hover 态、背景光晕 |
| 赛博青-描边 | `rgba(0, 212, 255, 0.3)` | 边框、分隔线 |

### 侧边栏规格
- **折叠宽度**：`52px`（常量 `SIDEBAR_COLLAPSED_W`）
- **展开宽度**：`208px`（常量 `SIDEBAR_EXPANDED_W`）
- **折叠/展开动画**：`cubic-bezier(0.4, 0, 0.2, 1) 200ms`
- **持久化**：状态存入 `localStorage: yyc3-sidebar-collapsed`

### 设计 Token
```css
:root {
  --brand-cyber: #00d4ff;
  --sidebar-w-collapsed: 52px;
  --sidebar-w-expanded: 208px;
  --glass-bg: rgba(15, 23, 42, 0.6);
  --glass-border: rgba(0, 212, 255, 0.15);
  --glass-blur: 16px;
}
```

### 无障碍（A11y）
- 所有交互组件支持键盘 Tab 导航
- 颜色对比度满足 WCAG AA 4.5:1
- ARIA 属性完备（aria-label / aria-expanded / role 等）
- 动效尊重 `prefers-reduced-motion` 系统设置

---

## 测试指南

### 单元测试（Vitest）
```bash
pnpm test:unit src/modules/shared
```

### 组件交互测试（React Testing Library）
测试关注点：
- `Sidebar` 折叠/展开状态切换与持久化
- `ErrorBoundary` 捕获子组件异常并展示降级 UI
- `CommandPalette` Cmd+K / Ctrl+K 快捷键触发
- `OfflineIndicator` 网络状态 `online/offline` 事件响应

### 视觉回归（Chromatic / Loki）
关键组件快照：
- `Layout` 桌面端 / 平板 / 移动端三态
- `Login` 空态 / 加载态 / 错误态
- `GlassCard` 四种 elevation 变体

### E2E 测试（Playwright）
```typescript
// 登录流程 E2E
await page.goto('/login');
await page.fill('input[name="email"]', 'admin@0379.email');
await page.fill('input[name="password"]', '********');
await page.click('button[type="submit"]');
await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
```

---

## 变更历史

| 版本 | 日期 | 变更内容 | 责任人 |
|------|------|----------|--------|
| v1.0.0 | 2026-08-19 | 🚀 初始版本发布：布局系统、认证、错误处理、品牌标识、通用交互全量交付 | YanYuCloudCube Team |

---

## 贡献说明

### 分支规范
- 功能开发：`feature/shared-{desc}`
- Bug 修复：`fix/shared-{issue-id}`
- 发版分支：`release/shared-v{X.Y.Z}`

### 提交规范（Conventional Commits）
```
feat(shared): add CommandPalette fuzzy search
fix(shared): resolve Sidebar collapse state hydration mismatch
docs(shared): update README usage examples
```

### Code Review Checklist
1. ✅ 组件 Props 使用 TypeScript 严格类型
2. ✅ className 通过 `cn()` 工具函数组合
3. ✅ 所有导出在 `index.ts` 中登记
4. ✅ 新增组件配套单元测试
5. ✅ 符合赛博青视觉规范（无硬编码冲突色）

### 发布流程
```bash
# 1. 变更集版本更新
pnpm changeset

# 2. 版本提升 & CHANGELOG 生成
pnpm changeset version

# 3. 合并 release PR → 自动发布
```

---

<div align="center">

---

## ✦ YanYuCloudCube · 言启千行代码，语枢万物智能 ✦

### 📧 技术支持：admin@0379.email
### 🔗 官方文档：https://docs.yyc3.cloud
### 💬 开发者社区：YYC3 Dev Hub

---

**版权所有 © 2026 YanYuCloudCube Team** · **CloudPivot Intelli-Matrix Platform**

</div>
