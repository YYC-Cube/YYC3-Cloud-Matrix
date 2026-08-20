---
file: COMPONENTS.md
description: Shared 模块组件参考手册 - Props 说明与使用示例
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [components, shared, reference]
category: reference
language: zh-CN
audience: developers
complexity: intermediate
---

<div align="center">

# ✦ YYC3 · Shared Components Reference ✦

### 言启千行代码 · 语枢万物智能

**研发团队：YanYuCloudCube** | **联系邮箱：admin@0379.email**

---

</div>

---

## 目录

- [布局系统组件](#布局系统组件)
  - [Layout](#layout)
  - [Sidebar](#sidebar)
  - [TopBar](#topbar)
  - [BottomNav](#bottomnav)
- [认证系统组件](#认证系统组件)
  - [Login](#login)
- [错误处理组件](#错误处理组件)
  - [ErrorBoundary](#errorboundary)
  - [NotFound](#notfound)
- [品牌标识组件](#品牌标识组件)
  - [YYC3Logo](#yyc3logo)
  - [YYC3LogoSvg](#yyc3logosvg)
- [通用交互组件](#通用交互组件)
  - [GlassCard](#glasscard)
  - [LanguageSwitcher](#languageswitcher)
  - [AIAssistant](#aiassistant)
  - [CommandPalette](#commandpalette)
  - [OfflineIndicator](#offlineindicator)
  - [ConnectionStatus](#connectionstatus)
  - [QuickActionGrid](#quickactiongrid)

---

## 布局系统组件

---

### Layout

**组件名：** `Layout`  
**文件路径：** `shared/Layout.tsx`  
**用途：** 全局布局容器，管理侧边栏状态、主题上下文注入、路由出口挂载，作为所有业务页面的外层包裹器。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `children` | `ReactNode` | - | ✅ | 页面主内容（通常为 `<Outlet />` 或子路由） |
| `showSidebar` | `boolean` | `true` | ❌ | 是否显示侧边栏（登录页可设为 false） |
| `showTopBar` | `boolean` | `true` | ❌ | 是否显示顶部栏 |
| `showBottomNav` | `boolean` | `true` | ❌ | 移动端是否显示底部导航 |
| `sidebarDefaultCollapsed` | `boolean` | `false` | ❌ | 侧边栏初始折叠状态（未持久化时生效） |
| `className` | `string` | `''` | ❌ | 自定义外层容器类名 |

#### 使用示例

```tsx
// app/layout.tsx
import { Layout } from '@/modules/shared';

export default function RootLayout({ children }) {
  return <Layout showSidebar={true}>{children}</Layout>;
}

// 登录页禁用侧边栏与顶部栏
export default function LoginLayout({ children }) {
  return (
    <Layout showSidebar={false} showTopBar={false} showBottomNav={false}>
      {children}
    </Layout>
  );
}
```

#### 注意事项
- `Layout` 内部集成了 `Sidebar / TopBar / BottomNav`，**业务代码不应单独嵌套使用三者**
- 侧边栏折叠状态通过 `zustand` + `localStorage` 持久化，刷新不丢失
- 响应式断点：`>= 768px` 显示 Sidebar + TopBar，`< 768px` 自动切换 BottomNav

---

### Sidebar

**组件名：** `Sidebar`  
**文件路径：** `shared/Sidebar.tsx`  
**用途：** 赛博青主题侧边导航栏，支持折叠/展开、嵌套菜单、徽标角标、当前路由高亮。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `items` | `SidebarItem[]` | 内置路由表 | ❌ | 自定义导航项数组 |
| `collapsed` | `boolean` | - | ❌ | 受控折叠态（不传则内部自管） |
| `onCollapsedChange` | `(collapsed: boolean) => void` | - | ❌ | 折叠状态变更回调 |
| `footer` | `ReactNode` | `null` | ❌ | 侧边栏底部自定义内容（如版本号） |
| `className` | `string` | `''` | ❌ | 自定义类名 |

**类型补充：** `SidebarItem`
```typescript
interface SidebarItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: SidebarItem[];
  badge?: string | number;
  disabled?: boolean;
}
```

#### 使用示例

```tsx
import { Sidebar } from '@/modules/shared';
import { LayoutDashboard, Settings, Users } from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: '控制台', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'users', label: '用户管理', icon: Users, href: '/users', badge: 12 },
  { key: 'settings', label: '系统设置', icon: Settings, href: '/settings' },
];

<Sidebar
  items={navItems}
  footer={<span className="text-xs text-cyan-500">v1.0.0</span>}
/>
```

#### 注意事项
- 折叠宽度 `52px` / 展开宽度 `208px`，通过常量 `SIDEBAR_COLLAPSED_W` / `SIDEBAR_EXPANDED_W` 引用
- 折叠态下 tooltip 显示完整菜单项名称
- 嵌套菜单支持最多 2 层，多层建议重构为独立模块路由

---

### TopBar

**组件名：** `TopBar`  
**文件路径：** `shared/TopBar.tsx`  
**用途：** 顶部栏，承载面包屑导航、页面标题、通知中心、用户头像菜单、语言切换入口。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `title` | `string` | `''` | ❌ | 自定义页面标题（不传则读取路由元数据） |
| `showBreadcrumb` | `boolean` | `true` | ❌ | 是否显示面包屑 |
| `showNotifications` | `boolean` | `true` | ❌ | 是否显示通知铃铛 |
| `showUserMenu` | `boolean` | `true` | ❌ | 是否显示用户菜单 |
| `actions` | `ReactNode` | `null` | ❌ | 标题右侧自定义操作区（按钮/搜索框等） |
| `className` | `string` | `''` | ❌ | 自定义类名 |

#### 使用示例

```tsx
import { TopBar } from '@/modules/shared';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

<TopBar
  title="订单管理"
  actions={
    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
      <Plus className="w-4 h-4 mr-1" /> 新建订单
    </Button>
  }
/>
```

#### 注意事项
- TopBar 高度固定 `h-14`（56px），布局计算需同步
- 面包屑由 `next/navigation` 自动生成，自定义 `title` 会覆盖最后一级
- 通知铃铛点击展开 `NotificationCenter`（由 AIAssistant 模块共享浮层容器）

---

### BottomNav

**组件名：** `BottomNav`  
**文件路径：** `shared/BottomNav.tsx`  
**用途：** 移动端底部 Tab 导航栏，与 Sidebar 导航项保持同源，`< 768px` 自动显示。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `items` | `BottomNavItem[]` | 内置主路由 Tab | ❌ | 自定义底部 Tab 项 |
| `className` | `string` | `''` | ❌ | 自定义类名 |

**类型补充：** `BottomNavItem`
```typescript
interface BottomNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
}
```

#### 使用示例

```tsx
import { BottomNav } from '@/modules/shared';
import { Home, Search, Bell, User } from 'lucide-react';

<BottomNav
  items={[
    { key: 'home', label: '首页', icon: Home, href: '/' },
    { key: 'search', label: '搜索', icon: Search, href: '/search' },
    { key: 'notifications', label: '消息', icon: Bell, href: '/notifications', badge: 3 },
    { key: 'me', label: '我的', icon: User, href: '/me' },
  ]}
/>
```

#### 注意事项
- BottomNav 高度固定 `h-16`（64px），主内容区已内置底部 padding
- 建议底部 Tab 数量 3-5 个，超出则改用侧滑抽屉
- 当前路由高亮使用 `pathname === href || pathname.startsWith(href)` 匹配

---

## 认证系统组件

---

### Login

**组件名：** `Login`  
**文件路径：** `shared/Login.tsx`  
**用途：** 统一登录页面，支持账号密码、OAuth2（Github / Google / WeChat）、记住我、忘记密码跳转。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `onLogin` | `(payload: LoginPayload) => Promise<void>` | - | ✅ | 登录提交回调，返回 Promise |
| `onOAuth` | `(provider: OAuthProvider) => void` | - | ❌ | 第三方登录回调 |
| `providers` | `OAuthProvider[]` | `['github']` | ❌ | 启用的 OAuth 提供商 |
| `redirect` | `string` | `'/dashboard'` | ❌ | 登录成功后跳转路径 |
| `logoVariant` | `'cyber' \| 'mono' \| 'dark'` | `'cyber'` | ❌ | Logo 展示变体 |
| `className` | `string` | `''` | ❌ | 自定义类名 |

**类型补充：**
```typescript
interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}
type OAuthProvider = 'github' | 'google' | 'wechat' | 'sso';
```

#### 使用示例

```tsx
import { Login } from '@/modules/shared';
import { signIn } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const redirect = useSearchParams().get('redirect') || '/dashboard';

  return (
    <Login
      providers={['github', 'wechat']}
      redirect={redirect}
      onLogin={async (payload) => {
        await signIn(payload);
        router.push(redirect);
      }}
      onOAuth={(provider) => {
        window.location.href = `/api/auth/${provider}`;
      }}
    />
  );
}
```

#### 注意事项
- 登录表单内置客户端校验（邮箱格式、密码最小 8 位）
- `onLogin` reject 时自动在表单顶部显示错误信息
- "记住我"勾选后 token 存入 `localStorage`，否则存入 `sessionStorage`
- 组件本身**不处理**路由守卫，需结合 Next.js middleware 使用

---

## 错误处理组件

---

### ErrorBoundary

**组件名：** `ErrorBoundary`  
**文件路径：** `shared/ErrorBoundary.tsx`  
**用途：** React 错误边界，捕获子树中的渲染异常、Promise  rejection（配合 Suspense），展示友好降级 UI。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `children` | `ReactNode` | - | ✅ | 需被捕获异常的子组件树 |
| `fallback` | `ReactNode` | 内置错误页 | ❌ | 自定义降级 UI |
| `onError` | `(error: Error, info: ErrorInfo) => void` | - | ❌ | 错误发生时的回调（可上报 Sentry） |
| `resetKeys` | `unknown[]` | `[]` | ❌ | 当这些依赖变化时自动重置错误状态（如路由 key） |

#### 使用示例

```tsx
// 全局包裹
import { ErrorBoundary } from '@/modules/shared';
import * as Sentry from '@sentry/nextjs';

<ErrorBoundary
  onError={(err, info) => {
    Sentry.captureException(err, { extra: { componentStack: info.componentStack } });
  }}
  resetKeys={[router.pathname]}
>
  <App />
</ErrorBoundary>

// 局部包裹 + 自定义 fallback
<ErrorBoundary
  fallback={
    <div className="p-4 text-red-500">
      图表加载失败，<button onClick={() => location.reload()}>点击重试</button>
    </div>
  }
>
  <ComplexChart />
</ErrorBoundary>
```

#### 注意事项
- ErrorBoundary 仅捕获**子组件渲染阶段**的错误，无法捕获：
  - 事件处理器内的错误（需自行 try/catch）
  - 异步代码错误（需在 Promise 中处理）
  - 服务端渲染错误
- 内置 fallback 提供"回到首页 / 联系管理员 / 复制异常栈"三个操作
- 与 React 18 Suspense 组合使用时，建议 ErrorBoundary 包裹 Suspense

---

### NotFound

**组件名：** `NotFound`  
**文件路径：** `shared/NotFound.tsx`  
**用途：** 404 路由兜底页面，提供赛博青主题视觉、返回首页、返回上一页、快捷搜索入口。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `homeHref` | `string` | `'/'` | ❌ | "返回首页"按钮跳转路径 |
| `showSearch` | `boolean` | `true` | ❌ | 是否显示快捷搜索框（跳全局搜索） |
| `message` | `string` | `'您访问的页面不存在或已被移除'` | ❌ | 自定义提示文案 |
| `className` | `string` | `''` | ❌ | 自定义类名 |

#### 使用示例

```tsx
// app/not-found.tsx (Next.js App Router 约定)
import { NotFound } from '@/modules/shared';

export default function NotFoundPage() {
  return <NotFound homeHref="/dashboard" showSearch={true} />;
}
```

#### 注意事项
- 组件内置赛博青 404 动画数字，无需额外插图
- `showSearch` 为 true 时，输入关键词回车跳转 `/search?q=xxx`
- 与 Next.js `notFound()` 函数配合使用：`import { notFound } from 'next/navigation'`

---

## 品牌标识组件

---

### YYC3Logo

**组件名：** `YYC3Logo`  
**文件路径：** `shared/YYC3Logo.tsx`  
**用途：** 品牌 Logo 渲染组件，封装 SVG 资源，自动适配深浅主题，支持四种预设尺寸。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | ❌ | 预设尺寸：sm=24 / md=40 / lg=64 / xl=128 (px) |
| `width` | `number \| string` | - | ❌ | 自定义宽度（优先级高于 size） |
| `height` | `number \| string` | - | ❌ | 自定义高度 |
| `variant` | `'cyber' \| 'mono' \| 'dark' \| 'light'` | `'cyber'` | ❌ | 颜色变体 |
| `showText` | `boolean` | `false` | ❌ | 是否同时显示 "YYC3" 文字标识 |
| `textClassName` | `string` | `''` | ❌ | 文字自定义类名 |
| `className` | `string` | `''` | ❌ | 容器自定义类名 |
| `onClick` | `() => void` | - | ❌ | 点击回调（通常跳首页） |

#### 使用示例

```tsx
import { YYC3Logo } from '@/modules/shared';

// 侧边栏折叠态 - 小尺寸
<YYC3Logo size="sm" variant="cyber" onClick={() => router.push('/')} />

// 登录页 - 大尺寸 + 文字
<YYC3Logo size="xl" variant="cyber" showText textClassName="text-2xl font-black tracking-wider" />

// 自定义宽高
<YYC3Logo width={80} height={80} variant="mono" />
```

#### 注意事项
- `variant='cyber'` 使用品牌主色 `#00d4ff`，其余变体随主题自适应
- SVG 采用 `currentColor` 机制，父级 `color` 可覆盖 logo 颜色
- `showText=true` 时文字与图标水平排列，小屏幕自动堆叠

---

### YYC3LogoSvg

**组件名：** `YYC3LogoSvg`  
**文件路径：** `shared/YYC3LogoSvg.tsx`  
**用途：** Logo SVG 源资源组件，输出纯净 SVG 标签（无容器、无文字），供自定义包装场景使用。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `className` | `string` | `''` | ❌ | `<svg>` 元素自定义类名 |
| `...props` | `SVGProps<SVGSVGElement>` | - | ❌ | 透传所有 SVG 原生属性 |

#### 使用示例

```tsx
import { YYC3LogoSvg } from '@/modules/shared';

// 作为 favicon / meta 图像源（服务端场景）
<YYC3LogoSvg width={32} height={32} aria-hidden="true" />

// 嵌入自定义动画容器
<div className="animate-pulse-slow">
  <YYC3LogoSvg className="text-cyan-400 w-16 h-16" />
</div>
```

#### 注意事项
- **纯 SVG 无任何包裹层**，尺寸需调用方显式设置（`width/height` 或 `className`）
- 颜色完全通过 `currentColor` 驱动，不写死任何色值
- 如需修改图形，**直接编辑本文件**并同步更新 `YYC3Logo` 快照测试

---

## 通用交互组件

---

### GlassCard

**组件名：** `GlassCard`  
**文件路径：** `shared/GlassCard.tsx`  
**用途：** 毛玻璃卡片容器，提供 4 级阴影（elevation）、可选边框发光（glow）、悬停微动效，是业务 UI 的基础容器单元。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `children` | `ReactNode` | - | ✅ | 卡片内容 |
| `elevation` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | ❌ | 背景透明度 + 阴影强度等级 |
| `glow` | `'none' \| 'cyber' \| 'soft'` | `'none'` | ❌ | 边框外发光效果 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | ❌ | 内边距：sm=p-3 / md=p-5 / lg=p-8 |
| `radius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'lg'` | ❌ | 圆角大小 |
| `as` | `keyof JSX.IntrinsicElements` | `'div'` | ❌ | 渲染的 HTML 标签 |
| `hoverable` | `boolean` | `false` | ❌ | 是否启用悬停上浮动效 |
| `className` | `string` | `''` | ❌ | 自定义类名 |

#### 使用示例

```tsx
import { GlassCard } from '@/modules/shared';

// 基础卡片
<GlassCard>
  <h3>统计概览</h3>
</GlassCard>

// 高等级阴影 + 赛博青发光 + 可悬停
<GlassCard elevation="xl" glow="cyber" hoverable padding="lg">
  <FeatureContent />
</GlassCard>

// 渲染为 <section> 标签 + 无内边距
<GlassCard as="section" padding="none" elevation="sm">
  <img src="/banner.jpg" alt="" className="w-full h-40 object-cover rounded-lg" />
</GlassCard>
```

#### 注意事项
- `glow='cyber'` 使用 `#00d4ff` 主色，背景为深色时效果最佳
- `hoverable` 包含 translateY(-2px) + shadow 增强 + 边框高亮，避免在列表中每行开启（性能）
- `elevation='none'` 仅保留 backdrop-blur，背景完全透明（用于叠加层场景）

---

### LanguageSwitcher

**组件名：** `LanguageSwitcher`  
**文件路径：** `shared/LanguageSwitcher.tsx`  
**用途：** 多语言切换器，支持 `Dropdown`（桌面）与 `Segment`（移动）两种形态，自动写入 cookie 供服务端读取。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `locales` | `Locale[]` | `[{code:'zh-CN',label:'简体中文'},{code:'en-US',label:'English'}]` | ❌ | 支持的语言列表 |
| `variant` | `'dropdown' \| 'segment' \| 'auto'` | `'auto'` | ❌ | 展示形态（auto 根据断点切换） |
| `onChange` | `(code: string) => void` | - | ❌ | 语言变更回调（默认刷新路由） |
| `cookieName` | `string` | `'NEXT_LOCALE'` | ❌ | 写入的 cookie 名称 |
| `className` | `string` | `''` | ❌ | 自定义类名 |

**类型补充：**
```typescript
interface Locale {
  code: string;
  label: string;
  flag?: string;   // emoji 国旗
}
```

#### 使用示例

```tsx
import { LanguageSwitcher } from '@/modules/shared';

<LanguageSwitcher
  locales={[
    { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
    { code: 'en-US', label: 'English', flag: '🇺🇸' },
    { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  ]}
  onChange={(code) => {
    // 如使用 next-intl 等库，可在此调用 setLocale
    console.log('切换至', code);
  }}
/>
```

#### 注意事项
- 组件自身**不加载**翻译文件，仅负责切换语言标识 + 触发刷新
- 默认实现：`document.cookie = ${name}=${code}` + `router.refresh()`
- SSR 场景下，middleware 中读取 cookie 重写 locale，避免 hydration 不匹配

---

### AIAssistant

**组件名：** `AIAssistant`  
**文件路径：** `shared/AIAssistant.tsx`  
**用途：** 全局 AI 助手浮窗入口（FAB）+ 可展开对话面板，支持拖拽位置、快捷指令、Markdown 渲染。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `onSendMessage` | `(msg: string) => Promise<string>` | - | ✅ | 消息发送回调，返回 AI 回复文本 |
| `defaultOpen` | `boolean` | `false` | ❌ | 初始是否展开对话面板 |
| `suggestions` | `string[]` | 内置建议 | ❌ | 输入框上方快捷指令数组 |
| `welcome` | `string` | `'你好！我是 YYC3 智能助手'` | ❌ | 欢迎语 |
| `position` | `{ bottom: number; right: number }` | `{ bottom: 24, right: 24 }` | ❌ | 浮窗位置（px） |
| `draggable` | `boolean` | `true` | ❌ | 是否允许拖拽浮窗 |
| `className` | `string` | `''` | ❌ | 自定义类名 |

#### 使用示例

```tsx
import { AIAssistant } from '@/modules/shared';
import { chatWithAI } from '@/lib/ai';

// 全局 Layout 中挂载一次即可
<AIAssistant
  suggestions={['帮我生成 SQL', '解释这段代码', '生成周报模板']}
  onSendMessage={async (msg) => {
    const res = await chatWithAI({ message: msg, context: window.location.pathname });
    return res.content;
  }}
/>
```

#### 注意事项
- **全应用只挂载一次**，建议放在 `Layout` 组件最外层
- `onSendMessage` 中自行处理 SSE 流式输出（组件提供 `appendStreamChunk` 上下文方法）
- 对话记录仅保存在内存中（页面刷新清空），如需持久化请在上层 store 管理

---

### CommandPalette

**组件名：** `CommandPalette`  
**文件路径：** `shared/CommandPalette.tsx`  
**用途：** 全局命令面板（类似 VS Code Cmd+K），支持模糊搜索、分组命令、最近使用、路由跳转。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `commands` | `CommandItem[]` | - | ✅ | 命令列表（数组） |
| `open` | `boolean` | - | ❌ | 受控打开状态 |
| `onOpenChange` | `(open: boolean) => void` | - | ❌ | 开关状态变更回调 |
| `hotkey` | `string` | `'mod+k'` | ❌ | 触发快捷键（mod = Cmd/Ctrl） |
| `placeholder` | `string` | `'输入命令或搜索...'` | ❌ | 搜索框占位符 |
| `className` | `string` | `''` | ❌ | 自定义类名 |

**类型补充：**
```typescript
interface CommandItem {
  id: string;
  group: string;              // 分组名，如 "导航" / "操作"
  label: string;              // 显示名称
  icon?: LucideIcon;
  keywords?: string[];        // 模糊搜索命中关键词
  shortcut?: string;          // 右侧显示辅助快捷键
  action: () => void;         // 选中后执行
}
```

#### 使用示例

```tsx
import { CommandPalette } from '@/modules/shared';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText } from 'lucide-react';

const router = useRouter();

<CommandPalette
  commands={[
    { id: 'nav-home', group: '导航', label: '回到控制台', icon: LayoutDashboard, action: () => router.push('/') },
    { id: 'nav-users', group: '导航', label: '用户管理', icon: Users, keywords: ['member', 'team'], action: () => router.push('/users') },
    { id: 'export', group: '操作', label: '导出报告', icon: FileText, shortcut: '⌘E', action: () => exportReport() },
  ]}
/>
```

#### 注意事项
- 快捷键监听全局 `keydown`，输入框 focus 状态下需按 `Esc` 再触发（避免冲突）
- 模糊搜索使用 `fuse.js`（或自实现轻量算法），支持拼音 / 首字母
- 命令建议上限 50 条，超出时请按功能域拆分命令面板实例

---

### OfflineIndicator

**组件名：** `OfflineIndicator`  
**文件路径：** `shared/OfflineIndicator.tsx`  
**用途：** 网络离线状态指示器，监听浏览器 `online/offline` 事件，顶部滑入 Banner 提示用户当前无网络。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `offlineMessage` | `string` | `'当前处于离线状态，部分功能可能不可用'` | ❌ | 离线提示文案 |
| `onlineMessage` | `string` | `'网络已恢复'` | ❌ | 恢复上线提示文案 |
| `showOnlineFlash` | `boolean` | `true` | ❌ | 恢复在线时是否显示闪屏提示（3s 后消失） |
| `position` | `'top' \| 'bottom'` | `'top'` | ❌ | 提示条位置 |
| `persistent` | `boolean` | `false` | ❌ | 离线时是否常驻（默认在线立即隐藏） |
| `className` | `string` | `''` | ❌ | 自定义类名 |

#### 使用示例

```tsx
import { OfflineIndicator } from '@/modules/shared';

// 全局挂载（Layout 中）
<OfflineIndicator position="top" showOnlineFlash={true} />
```

#### 注意事项
- 基于 `window.navigator.onLine`，但该属性仅表示**链路层连接**，不保证公网可达
- 如需真实心跳检测，请在上层结合 `ConnectionStatus` 组件实现
- 移动端浏览器切后台再切前台可能不触发 `online`，组件内置 1s 轮询兜底

---

### ConnectionStatus

**组件名：** `ConnectionStatus`  
**文件路径：** `shared/ConnectionStatus.tsx`  
**用途：** API / WebSocket 连接状态指示器，支持心跳检测，展示连接中 / 已连接 / 断开 / 重连中四态。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `status` | `'connecting' \| 'connected' \| 'disconnected' \| 'reconnecting'` | - | ✅ | 当前连接状态（由调用方提供） |
| `label` | `string` | - | ❌ | 状态右侧文字（不传则使用内置文案） |
| `ping` | `number` | - | ❌ | 延迟毫秒数，已连接时显示 |
| `onRetry` | `() => void` | - | ❌ | 断开状态下点击"重试"按钮回调 |
| `variant` | `'dot' \| 'badge' \| 'full'` | `'dot'` | ❌ | 展示形态：点状 / 徽章 / 完整信息条 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | ❌ | 指示器尺寸 |
| `className` | `string` | `''` | ❌ | 自定义类名 |

#### 使用示例

```tsx
import { ConnectionStatus } from '@/modules/shared';
import { useSocket } from '@/hooks/useSocket';

const { status, latency, reconnect } = useSocket('wss://api.yyc3.cloud/ws');

// TopBar 中使用 - 点状
<ConnectionStatus status={status} ping={latency} onRetry={reconnect} variant="dot" />

// 设置页详情 - 完整信息
<ConnectionStatus
  status={status}
  ping={latency}
  label={status === 'connected' ? `已连接 · ${latency}ms` : undefined}
  onRetry={reconnect}
  variant="full"
/>
```

#### 注意事项
- 组件**只负责可视化状态**，不执行实际心跳 / 重连逻辑
- 心跳 + 指数退避重连建议通过自定义 hook（如 `useSocket`）实现
- 四态颜色：connecting=黄 / connected=绿 / disconnected=红 / reconnecting=蓝（脉冲动画）

---

### QuickActionGrid

**组件名：** `QuickActionGrid`  
**文件路径：** `shared/QuickActionGrid.tsx`  
**用途：** 首页 / 控制台的快捷操作网格，支持自定义行列、图标 + 标题 + 描述 + 徽标，响应式自动换行。

#### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `items` | `QuickActionItem[]` | - | ✅ | 快捷操作数组 |
| `columns` | `{ sm?: number; md?: number; lg?: number }` | `{ sm:2, md:3, lg:4 }` | ❌ | 响应式列数配置 |
| `gap` | `'sm' \| 'md' \| 'lg'` | `'md'` | ❌ | 网格间距 |
| `variant` | `'flat' \| 'card'` | `'card'` | ❌ | flat=仅图标文字 / card=GlassCard 包裹 |
| `className` | `string` | `''` | ❌ | 自定义类名 |

**类型补充：**
```typescript
interface QuickActionItem {
  key: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
  highlight?: boolean;   // 高亮推荐（赛博青边框 glow）
}
```

#### 使用示例

```tsx
import { QuickActionGrid } from '@/modules/shared';
import { FilePlus, Users, BarChart3, Settings } from 'lucide-react';

<QuickActionGrid
  columns={{ sm: 2, md: 4, lg: 6 }}
  items={[
    { key: 'new', label: '新建项目', icon: FilePlus, href: '/projects/new', highlight: true },
    { key: 'team', label: '团队成员', icon: Users, description: '8 人在线', href: '/team' },
    { key: 'report', label: '数据报告', icon: BarChart3, badge: 'NEW', onClick: () => openReport() },
    { key: 'setting', label: '系统设置', icon: Settings, href: '/settings' },
  ]}
/>
```

#### 注意事项
- `href` 与 `onClick` 二选一即可，同时存在时 `onClick` 优先
- `highlight=true` 时使用 `GlassCard glow="cyber"` 高亮显示，建议每组最多 1 个
- 每项默认固定高 `h-28`，超出内容将被省略（用 `description` 替代长标题）

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
