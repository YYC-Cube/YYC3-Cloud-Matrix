---
file: API-REFERENCE.md
description: Shared 模块 API 参考手册 - index.ts 完整导出清单与类型签名
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [api, shared, reference, typescript]
category: reference
language: zh-CN
audience: developers
complexity: intermediate
---

<div align="center">

# ✦ YYC3 · Shared API Reference ✦

### 言启千行代码 · 语枢万物智能

**研发团队：YanYuCloudCube** | **联系邮箱：admin@0379.email**

---

</div>

---

## 目录

- [导入方式](#导入方式)
- [布局系统 API](#布局系统-api)
- [认证系统 API](#认证系统-api)
- [错误处理 API](#错误处理-api)
- [品牌标识 API](#品牌标识-api)
- [通用交互 API](#通用交互-api)
- [常量 API](#常量-api)
- [类型定义附录](#类型定义附录)

---

## 导入方式

所有 API 通过 Barrel 入口统一导出，调用方使用单一路径即可：

```typescript
// ✅ 推荐（支持 tree-shaking）
import {
  Layout,
  Sidebar,
  GlassCard,
  SIDEBAR_COLLAPSED_W,
  type SidebarItem,
} from '@/modules/shared';

// ❌ 不推荐（绕过 Barrel，打破封装）
import { Layout } from '@/modules/shared/Layout';
```

---

## 布局系统 API

---

### `<Layout />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<LayoutProps>` |
| **组件类型** | Client Component（包含交互状态） |

```typescript
// 类型签名
interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;          // default: true
  showTopBar?: boolean;           // default: true
  showBottomNav?: boolean;        // default: true
  sidebarDefaultCollapsed?: boolean; // default: false
  className?: string;
}

declare const Layout: React.FC<LayoutProps>;
```

**导出路径：** `shared/Layout.tsx` → `shared/index.ts`

---

### `<Sidebar />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<SidebarProps>` |
| **组件类型** | Client Component |

```typescript
// 类型签名
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: SidebarItem[];
  badge?: string | number;
  disabled?: boolean;
}

interface SidebarProps {
  items?: SidebarItem[];          // default: 内置全局路由表
  collapsed?: boolean;            // 受控模式
  onCollapsedChange?: (collapsed: boolean) => void;
  footer?: React.ReactNode;
  className?: string;
}

declare const Sidebar: React.FC<SidebarProps>;
```

**导出路径：** `shared/Sidebar.tsx` → `shared/index.ts`

**连带导出类型：** `SidebarItem`

---

### `<TopBar />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<TopBarProps>` |
| **组件类型** | Client Component |

```typescript
// 类型签名
interface TopBarProps {
  title?: string;                 // default: 路由自动解析
  showBreadcrumb?: boolean;       // default: true
  showNotifications?: boolean;    // default: true
  showUserMenu?: boolean;         // default: true
  actions?: React.ReactNode;
  className?: string;
}

declare const TopBar: React.FC<TopBarProps>;
```

**导出路径：** `shared/TopBar.tsx` → `shared/index.ts`

---

### `<BottomNav />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<BottomNavProps>` |
| **组件类型** | Client Component |

```typescript
// 类型签名
import type { LucideIcon } from 'lucide-react';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
}

interface BottomNavProps {
  items?: BottomNavItem[];        // default: 内置主 Tab
  className?: string;
}

declare const BottomNav: React.FC<BottomNavProps>;
```

**导出路径：** `shared/BottomNav.tsx` → `shared/index.ts`

**连带导出类型：** `BottomNavItem`

---

## 认证系统 API

---

### `<Login />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<LoginProps>` |
| **组件类型** | Client Component |

```typescript
// 类型签名
export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export type OAuthProvider = 'github' | 'google' | 'wechat' | 'sso';

interface LoginProps {
  onLogin: (payload: LoginPayload) => Promise<void>;
  onOAuth?: (provider: OAuthProvider) => void;
  providers?: OAuthProvider[];       // default: ['github']
  redirect?: string;                 // default: '/dashboard'
  logoVariant?: 'cyber' | 'mono' | 'dark'; // default: 'cyber'
  className?: string;
}

declare const Login: React.FC<LoginProps>;
```

**导出路径：** `shared/Login.tsx` → `shared/index.ts`

**连带导出类型：** `LoginPayload`、`OAuthProvider`

---

## 错误处理 API

---

### `<ErrorBoundary />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export（Class Component） |
| **继承** | `React.Component<ErrorBoundaryProps, ErrorBoundaryState>` |
| **组件类型** | Client Component（必须） |

```typescript
// 类型签名
import type { ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  resetKeys?: unknown[];            // default: []
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

declare class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState;
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
  reset(): void;
}
```

**导出路径：** `shared/ErrorBoundary.tsx` → `shared/index.ts`

---

### `<NotFound />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<NotFoundProps>` |
| **组件类型** | Client Component（含交互） |

```typescript
// 类型签名
interface NotFoundProps {
  homeHref?: string;                // default: '/'
  showSearch?: boolean;             // default: true
  message?: string;                 // default: '您访问的页面不存在或已被移除'
  className?: string;
}

declare const NotFound: React.FC<NotFoundProps>;
```

**导出路径：** `shared/NotFound.tsx` → `shared/index.ts`

---

## 品牌标识 API

---

### `<YYC3Logo />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<YYC3LogoProps>` |
| **组件类型** | Client Component（可点击） |

```typescript
// 类型签名
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoVariant = 'cyber' | 'mono' | 'dark' | 'light';

interface YYC3LogoProps {
  size?: LogoSize;                  // default: 'md'
  width?: number | string;
  height?: number | string;
  variant?: LogoVariant;            // default: 'cyber'
  showText?: boolean;               // default: false
  textClassName?: string;
  className?: string;
  onClick?: () => void;
}

declare const YYC3Logo: React.FC<YYC3LogoProps>;
```

**导出路径：** `shared/YYC3Logo.tsx` → `shared/index.ts`

**连带导出类型：** `LogoSize`、`LogoVariant`

---

### `<YYC3LogoSvg />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<SVGProps<SVGSVGElement>>` |
| **组件类型** | 可被 Server Component 导入（纯 SVG） |

```typescript
// 类型签名
import type { SVGProps } from 'react';

type YYC3LogoSvgProps = SVGProps<SVGSVGElement>;

declare const YYC3LogoSvg: React.FC<YYC3LogoSvgProps>;
```

**导出路径：** `shared/YYC3LogoSvg.tsx` → `shared/index.ts`

---

## 通用交互 API

---

### `<GlassCard />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<GlassCardProps>` |
| **组件类型** | Client Component（含 hover 动效） |

```typescript
// 类型签名
export type GlassElevation = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type GlassGlow = 'none' | 'cyber' | 'soft';
export type GlassPadding = 'none' | 'sm' | 'md' | 'lg';
export type GlassRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

interface GlassCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  elevation?: GlassElevation;       // default: 'md'
  glow?: GlassGlow;                 // default: 'none'
  padding?: GlassPadding;           // default: 'md'
  radius?: GlassRadius;             // default: 'lg'
  as?: keyof JSX.IntrinsicElements; // default: 'div'
  hoverable?: boolean;              // default: false
}

declare const GlassCard: React.FC<GlassCardProps>;
```

**导出路径：** `shared/GlassCard.tsx` → `shared/index.ts`

**连带导出类型：** `GlassElevation`、`GlassGlow`、`GlassPadding`、`GlassRadius`

---

### `<LanguageSwitcher />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<LanguageSwitcherProps>` |
| **组件类型** | Client Component |

```typescript
// 类型签名
export interface Locale {
  code: string;
  label: string;
  flag?: string;
}

export type LanguageVariant = 'dropdown' | 'segment' | 'auto';

interface LanguageSwitcherProps {
  locales?: Locale[];
  variant?: LanguageVariant;        // default: 'auto'
  onChange?: (code: string) => void;
  cookieName?: string;              // default: 'NEXT_LOCALE'
  className?: string;
}

declare const LanguageSwitcher: React.FC<LanguageSwitcherProps>;
```

**导出路径：** `shared/LanguageSwitcher.tsx` → `shared/index.ts`

**连带导出类型：** `Locale`、`LanguageVariant`

---

### `<AIAssistant />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<AIAssistantProps>` |
| **组件类型** | Client Component（FAB + 浮窗） |

```typescript
// 类型签名
interface AIAssistantProps {
  onSendMessage: (message: string) => Promise<string>;
  defaultOpen?: boolean;            // default: false
  suggestions?: string[];           // default: 内置建议
  welcome?: string;                 // default: '你好！我是 YYC3 智能助手'
  position?: { bottom: number; right: number }; // default: {24, 24}
  draggable?: boolean;              // default: true
  className?: string;
}

declare const AIAssistant: React.FC<AIAssistantProps>;
```

**导出路径：** `shared/AIAssistant.tsx` → `shared/index.ts`

---

### `<CommandPalette />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<CommandPaletteProps>` |
| **组件类型** | Client Component（全局快捷键） |

```typescript
// 类型签名
import type { LucideIcon } from 'lucide-react';

export interface CommandItem {
  id: string;
  group: string;
  label: string;
  icon?: LucideIcon;
  keywords?: string[];
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  commands: CommandItem[];
  open?: boolean;                   // 受控
  onOpenChange?: (open: boolean) => void;
  hotkey?: string;                  // default: 'mod+k'
  placeholder?: string;             // default: '输入命令或搜索...'
  className?: string;
}

declare const CommandPalette: React.FC<CommandPaletteProps>;
```

**导出路径：** `shared/CommandPalette.tsx` → `shared/index.ts`

**连带导出类型：** `CommandItem`

---

### `<OfflineIndicator />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<OfflineIndicatorProps>` |
| **组件类型** | Client Component（事件监听） |

```typescript
// 类型签名
interface OfflineIndicatorProps {
  offlineMessage?: string;
  onlineMessage?: string;
  showOnlineFlash?: boolean;        // default: true
  position?: 'top' | 'bottom';      // default: 'top'
  persistent?: boolean;             // default: false
  className?: string;
}

declare const OfflineIndicator: React.FC<OfflineIndicatorProps>;
```

**导出路径：** `shared/OfflineIndicator.tsx` → `shared/index.ts`

---

### `<ConnectionStatus />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<ConnectionStatusProps>` |
| **组件类型** | Client Component |

```typescript
// 类型签名
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
export type ConnectionVariant = 'dot' | 'badge' | 'full';
export type StatusSize = 'sm' | 'md' | 'lg';

interface ConnectionStatusProps {
  status: ConnectionState;
  label?: string;
  ping?: number;                    // 毫秒
  onRetry?: () => void;
  variant?: ConnectionVariant;      // default: 'dot'
  size?: StatusSize;                // default: 'md'
  className?: string;
}

declare const ConnectionStatus: React.FC<ConnectionStatusProps>;
```

**导出路径：** `shared/ConnectionStatus.tsx` → `shared/index.ts`

**连带导出类型：** `ConnectionState`、`ConnectionVariant`、`StatusSize`

---

### `<QuickActionGrid />`

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<QuickActionGridProps>` |
| **组件类型** | Client Component |

```typescript
// 类型签名
import type { LucideIcon } from 'lucide-react';

export interface QuickActionItem {
  key: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
  highlight?: boolean;
}

export type GridColumns = { sm?: number; md?: number; lg?: number };
export type GridGap = 'sm' | 'md' | 'lg';
export type GridVariant = 'flat' | 'card';

interface QuickActionGridProps {
  items: QuickActionItem[];
  columns?: GridColumns;            // default: { sm:2, md:3, lg:4 }
  gap?: GridGap;                    // default: 'md'
  variant?: GridVariant;            // default: 'card'
  className?: string;
}

declare const QuickActionGrid: React.FC<QuickActionGridProps>;
```

**导出路径：** `shared/QuickActionGrid.tsx` → `shared/index.ts`

**连带导出类型：** `QuickActionItem`、`GridColumns`、`GridGap`、`GridVariant`

---

## 常量 API

### 侧边栏尺寸常量

| 常量名 | 类型 | 值 | 单位 | 说明 |
|--------|------|----|------|------|
| **`SIDEBAR_COLLAPSED_W`** | `number` | `52` | px | 侧边栏折叠宽度（仅显示图标） |
| **`SIDEBAR_EXPANDED_W`** | `number` | `208` | px | 侧边栏展开宽度（图标 + 文字） |

**来源文件：** `shared/constants.ts`（或 `shared/index.ts` 直接声明）

```typescript
// 类型签名
export const SIDEBAR_COLLAPSED_W: 52 = 52;
export const SIDEBAR_EXPANDED_W: 208 = 208;
```

**使用场景：**
```tsx
import { SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from '@/modules/shared';

// 动态计算主内容区 padding-left
const mainPaddingLeft = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;

<div style={{ paddingLeft: mainPaddingLeft }}>
  {children}
</div>
```

---

## 类型定义附录

以下为 index.ts 中所有 **连带导出的 TypeScript 类型** 汇总表：

| 类型名 | 归属组件 | 类型分类 |
|--------|----------|----------|
| `LayoutProps` | Layout | Interface |
| `SidebarProps` | Sidebar | Interface |
| `SidebarItem` | Sidebar | Interface |
| `TopBarProps` | TopBar | Interface |
| `BottomNavProps` | BottomNav | Interface |
| `BottomNavItem` | BottomNav | Interface |
| `LoginProps` | Login | Interface |
| `LoginPayload` | Login | Interface |
| `OAuthProvider` | Login | Union Type |
| `ErrorBoundaryProps` | ErrorBoundary | Interface |
| `NotFoundProps` | NotFound | Interface |
| `YYC3LogoProps` | YYC3Logo | Interface |
| `LogoSize` | YYC3Logo | Union Type (literal) |
| `LogoVariant` | YYC3Logo | Union Type (literal) |
| `GlassCardProps` | GlassCard | Interface |
| `GlassElevation` | GlassCard | Union Type (literal) |
| `GlassGlow` | GlassCard | Union Type (literal) |
| `GlassPadding` | GlassCard | Union Type (literal) |
| `GlassRadius` | GlassCard | Union Type (literal) |
| `LanguageSwitcherProps` | LanguageSwitcher | Interface |
| `Locale` | LanguageSwitcher | Interface |
| `LanguageVariant` | LanguageSwitcher | Union Type (literal) |
| `AIAssistantProps` | AIAssistant | Interface |
| `CommandPaletteProps` | CommandPalette | Interface |
| `CommandItem` | CommandPalette | Interface |
| `OfflineIndicatorProps` | OfflineIndicator | Interface |
| `ConnectionStatusProps` | ConnectionStatus | Interface |
| `ConnectionState` | ConnectionStatus | Union Type (literal) |
| `ConnectionVariant` | ConnectionStatus | Union Type (literal) |
| `StatusSize` | ConnectionStatus | Union Type (literal) |
| `QuickActionGridProps` | QuickActionGrid | Interface |
| `QuickActionItem` | QuickActionGrid | Interface |
| `GridColumns` | QuickActionGrid | Type Alias |
| `GridGap` | QuickActionGrid | Union Type (literal) |
| `GridVariant` | QuickActionGrid | Union Type (literal) |

---

## index.ts 完整导出清单（对照）

```typescript
// ============= shared/index.ts =============

// --- 布局系统 ---
export { Layout } from './Layout';
export type { LayoutProps } from './Layout';

export { Sidebar } from './Sidebar';
export type { SidebarProps, SidebarItem } from './Sidebar';

export { TopBar } from './TopBar';
export type { TopBarProps } from './TopBar';

export { BottomNav } from './BottomNav';
export type { BottomNavProps, BottomNavItem } from './BottomNav';

// --- 认证系统 ---
export { Login } from './Login';
export type { LoginProps, LoginPayload, OAuthProvider } from './Login';

// --- 错误处理 ---
export { ErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps } from './ErrorBoundary';

export { NotFound } from './NotFound';
export type { NotFoundProps } from './NotFound';

// --- 品牌标识 ---
export { YYC3Logo } from './YYC3Logo';
export type { YYC3LogoProps, LogoSize, LogoVariant } from './YYC3Logo';

export { YYC3LogoSvg } from './YYC3LogoSvg';

// --- 通用交互 ---
export { GlassCard } from './GlassCard';
export type { GlassCardProps, GlassElevation, GlassGlow, GlassPadding, GlassRadius } from './GlassCard';

export { LanguageSwitcher } from './LanguageSwitcher';
export type { LanguageSwitcherProps, Locale, LanguageVariant } from './LanguageSwitcher';

export { AIAssistant } from './AIAssistant';
export type { AIAssistantProps } from './AIAssistant';

export { CommandPalette } from './CommandPalette';
export type { CommandPaletteProps, CommandItem } from './CommandPalette';

export { OfflineIndicator } from './OfflineIndicator';
export type { OfflineIndicatorProps } from './OfflineIndicator';

export { ConnectionStatus } from './ConnectionStatus';
export type { ConnectionStatusProps, ConnectionState, ConnectionVariant, StatusSize } from './ConnectionStatus';

export { QuickActionGrid } from './QuickActionGrid';
export type { QuickActionGridProps, QuickActionItem, GridColumns, GridGap, GridVariant } from './QuickActionGrid';

// --- 常量 ---
export const SIDEBAR_COLLAPSED_W = 52 as const;
export const SIDEBAR_EXPANDED_W = 208 as const;
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
