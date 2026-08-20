---
file: shared-unit-tests.md
description: YYC³ Shared 共享模块 · 17 个核心组件单元测试用例清单 (Vitest + @testing-library/react)
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [test, shared, unit]
category: technical
language: zh-CN
audience: developers
complexity: intermediate
---

# Shared 共享模块 · 单元测试用例

> 本文件覆盖 Shared 层 **17 个全局复用组件**的标准 Vitest 单元测试模板，每个组件至少 3 个 describe 套件：渲染正确 / i18n 中文 / 用户交互。

---

## 一、测试目标

| 维度 | 目标值 |
|:-----|:------|
| 组件覆盖率 | 17/17 = 100% |
| 语句覆盖率 | ≥ 90% |
| 分支覆盖率 | ≥ 85% |
| 单套件执行 | ≤ 30ms |
| data-testid 齐全率 | 100% |

---

## 二、标准模板（Vitest + @testing-library/react）

```typescript
// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => keyMap[key] ?? key,
    locale: "zh-CN",
    setLocale: vi.fn(),
    locales: ["zh-CN", "en-US"],
  }),
}));

const keyMap: Record<string, string> = {
  "shared.login.title": "用户登录",
  "shared.login.submit": "登 录",
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
```

---

## 三、核心组件测试清单（17 个）

### 3.1 `Layout` — 主布局容器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 包含 Sidebar、TopBar、BottomNav（desktop）；Outlet 注入子路由；`data-testid="yyc3-shared-layout-root"` 存在 |
| **i18n 中文** | locale=zh-CN 时 TopBar 显示"数据看板"而非 Data Dashboard |
| **用户交互** | 点击 Sidebar toggle 触发 collapse 状态变化；resize 到移动端 (<768px) 切换 BottomNav |

**现有测试文件：** `src/app/__tests__/Layout.test.tsx`

```typescript
describe("Layout · 渲染正确", () => {
  it("渲染三大区域 + Outlet", () => {
    render(<Layout />);
    expect(screen.getByTestId("yyc3-shared-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("yyc3-shared-topbar")).toBeInTheDocument();
    expect(screen.getByTestId("yyc3-shared-bottomnav-mobile")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
});
```

---

### 3.2 `Sidebar` — 侧边导航栏

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 8 大模块 nav item 存在；Logo 区域；当前路径高亮 `aria-current=page` |
| **i18n 中文** | 菜单项文本为中文（监控、运维、AI...）；hover tooltip 中文 |
| **用户交互** | 点击菜单项触发 `useNavigate()`；折叠模式下仅图标（宽度变化） |

**现有测试文件：** `src/app/__tests__/Sidebar.test.tsx`

---

### 3.3 `TopBar` — 顶部工具栏

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 面包屑 / ConnectionStatus / LanguageSwitcher / AIAssistant 入口齐全 |
| **i18n 中文** | 搜索占位符为"输入命令 ⌘K..."（中文环境） |
| **用户交互** | 点击 ⌘K 打开 CommandPalette；搜索框输入触发建议列表 |

**现有测试文件：** `src/app/__tests__/TopBar.test.tsx`

---

### 3.4 `BottomNav` — 移动端底部导航

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 5 个核心 tab (首页/监控/AI/设置/我的)；active tab 高亮 |
| **i18n 中文** | 中文 locale 下标签为中文文本 |
| **用户交互** | 点击 tab 触发 navigate；active index 正确同步 |

**现有测试文件：** `src/app/__tests__/BottomNav.test.tsx`

---

### 3.5 `Login` — 登录入口页

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 用户名/密码输入框；提交按钮；记住我 checkbox；Logo 展示 |
| **i18n 中文** | 标题为"用户登录"，placeholder 为"请输入用户名/密码"，按钮为"登 录" |
| **用户交互** | 空提交触发必填校验；错误密码显示错误信息；登录成功 navigate 到 `/dashboard` |

**现有测试文件：** `src/app/__tests__/Login.test.tsx`

```typescript
describe("Login · 用户交互", () => {
  it("空提交显示必填校验", async () => {
    render(<Login />);
    fireEvent.click(screen.getByTestId("yyc3-shared-login-submit"));
    await waitFor(() => {
      expect(screen.getByTestId("yyc3-shared-login-username-error")).toHaveTextContent(/必填/);
    });
  });
});
```

---

### 3.6 `ErrorBoundary` — 错误边界

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 正常 children 正常展示；子组件 throw 时显示 fallback UI |
| **i18n 中文** | Fallback 标题为"页面出错了"，按钮为"刷新重试" |
| **用户交互** | 点击刷新按钮触发 `window.location.reload` mock；错误日志 console.error 被调用 |

**现有测试文件：** `src/app/__tests__/ErrorBoundary.test.tsx`

---

### 3.7 `NotFound` — 404 页面

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 404 大数字 / 说明文案 / 返回首页按钮 |
| **i18n 中文** | "页面走丢了" / "返回首页" 中文文案正确 |
| **用户交互** | 点击按钮 navigate 到 `/`；动画类名 `animate-pulse` 存在 |

**现有测试文件：** `src/app/__tests__/NotFound.test.tsx`

---

### 3.8 `GlassCard` — 玻璃拟态卡片容器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | children 正确注入；`data-testid` 透传；className 拼接（glass-card 基类 + custom） |
| **i18n 中文** | 支持 title 属性中文渲染，与 locale 无关（展示组件） |
| **用户交互** | hover 触发 elevation 样式；可点击 variant 触发 onClick |

**现有测试文件：** `src/app/__tests__/GlassCard.test.tsx`

```typescript
describe("GlassCard · 渲染正确", () => {
  it("渲染 children 并支持透传属性", () => {
    const { container } = render(
      <GlassCard data-testid="yyc3-shared-glass-card" title="概览">
        <div>Hello</div>
      </GlassCard>
    );
    expect(screen.getByTestId("yyc3-shared-glass-card")).toHaveTextContent("概览");
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("glass-card");
  });
});
```

---

### 3.9 `LanguageSwitcher` — 多语言切换器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 当前 locale 标签；下拉选项含 zh-CN / en-US |
| **i18n 中文** | 切换到 zh-CN 后按钮显示"中文"；切换到 en-US 显示 "English" |
| **用户交互** | 选择选项后调用 `setLocale()`；下拉收起（aria-expanded=false） |

**现有测试文件：** `src/app/__tests__/LanguageSwitcher.test.tsx`

---

### 3.10 `YYC3Logo` — 主 Logo 组件

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 图片 src 正确；alt="YYC³ Logo"；size variant (sm/md/lg) 对应宽高 |
| **i18n 中文** | 中文 locale 下 title tooltip="言启云枢 智启新元" |
| **用户交互** | onClick 触发 navigate("/")；图片加载失败显示 fallback Svg |

**现有测试文件：** `src/app/__tests__/YYC3Logo.test.tsx`

---

### 3.11 `YYC3LogoSvg` — Logo SVG 内联版

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | SVG viewBox="0 0 120 120"；path 数量 ≥ 3；fill 当前色 CSS var |
| **i18n 中文** | `<title>` 元素中文文本正确（与 locale 同步） |
| **用户交互** | 可访问性：`role="img"` + aria-label 存在；snapshot 一致 |

**现有测试文件：** `src/app/__tests__/YYC3LogoSvg.test.tsx`

```typescript
describe("YYC3LogoSvg · 渲染正确", () => {
  it("SVG 结构和快照一致", () => {
    const { asFragment } = render(<YYC3LogoSvg size={48} />);
    const svg = screen.getByRole("img");
    expect(svg).toHaveAttribute("viewBox", "0 0 120 120");
    expect(asFragment()).toMatchSnapshot();
  });
});
```

---

### 3.12 `AIAssistant` — AI 助手浮动面板

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 浮动按钮存在；面板默认隐藏（closed）；输入框 + 发送按钮 |
| **i18n 中文** | 占位符"问我任何问题..." / 按钮"发送"（中文环境） |
| **用户交互** | 点击按钮打开面板（aria-expanded=true）；输入回车触发 onSend |

**现有测试文件：** `src/app/__tests__/AIAssistant.test.tsx`

---

### 3.13 `CommandPalette` — 命令面板 ⌘K

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 搜索输入框；命令列表分组（导航/设置/工具）；快捷键提示 |
| **i18n 中文** | 占位符"输入命令..."；分组标签中文（"导航"、"设置"） |
| **用户交互** | 输入 `/` 过滤命令；↑↓ 选择；Enter 执行回调；Esc 关闭 |

**现有测试文件：** `src/app/__tests__/CommandPalette.test.tsx`

---

### 3.14 `OfflineIndicator` — 离线指示器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | online 时不渲染（或隐藏）；offline 时显示横幅；自动重连计数 |
| **i18n 中文** | offline 文案为"网络已断开，正在尝试重连..." |
| **用户交互** | `window.dispatchEvent(new Event("offline"))` 触发显示；online 事件消失 |

**现有测试文件：** `src/app/__tests__/OfflineIndicator.test.tsx`

```typescript
describe("OfflineIndicator · 用户交互", () => {
  it("监听 online/offline 事件切换显示", () => {
    render(<OfflineIndicator />);
    expect(screen.queryByTestId("yyc3-shared-offline-banner")).not.toBeInTheDocument();
    window.dispatchEvent(new Event("offline"));
    expect(screen.getByTestId("yyc3-shared-offline-banner")).toBeInTheDocument();
    window.dispatchEvent(new Event("online"));
    expect(screen.queryByTestId("yyc3-shared-offline-banner")).not.toBeInTheDocument();
  });
});
```

---

### 3.15 `ConnectionStatus` — WebSocket 连接状态

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 三种状态（connected=绿 / reconnecting=黄 / disconnected=红）颜色点 + 文本 |
| **i18n 中文** | 状态分别为"已连接"/"重连中"/"已断开"（中文） |
| **用户交互** | useWebSocketData hook 状态变化触发 UI 更新；点击手动重连按钮 |

**现有测试文件：** `src/app/__tests__/ConnectionStatus.test.tsx`

---

### 3.16 `QuickActionGrid` — 快捷操作网格

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 4-8 个快捷入口；图标 + 标题 + 描述；响应式 grid cols (2/3/4) |
| **i18n 中文** | 所有操作标题/描述为中文 |
| **用户交互** | 点击 action 触发对应 onClick；active 状态样式；keydown Enter/Space |

**现有测试文件：** `src/app/__tests__/QuickActionGrid.test.tsx`

---

### 3.17 TabBar · 标签栏（补充）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | Tabs/List/Tab/Panels 结构完整；defaultValue 选中正确 |
| **i18n 中文** | Tab 标签中文；aria-label 无障碍 |
| **用户交互** | 点击切换 panel 可见性；onValueChange 回调触发 |

**现有测试文件：** `src/app/__tests__/TabBar.test.tsx`

---

## 四、测试代码完整模板示例（以 Login 为例）

```typescript
// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import Login from "../../modules/shared/components/Login";

const mockNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const mockSetLocale = vi.fn();
vi.mock("../../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (k: string) =>
      ({
        "shared.login.title": "用户登录",
        "shared.login.username": "用户名",
        "shared.login.password": "密码",
        "shared.login.submit": "登 录",
        "shared.login.remember": "记住我",
        "shared.login.required": "此项为必填",
      }[k] ?? k),
    locale: "zh-CN",
    setLocale: mockSetLocale,
    locales: ["zh-CN", "en-US"],
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("Login · 渲染正确", () => {
  it("渲染所有必填字段", () => {
    render(<Login />);
    expect(screen.getByTestId("yyc3-shared-login-root")).toBeInTheDocument();
    expect(screen.getByTestId("yyc3-shared-login-username")).toBeInTheDocument();
    expect(screen.getByTestId("yyc3-shared-login-password")).toBeInTheDocument();
    expect(screen.getByTestId("yyc3-shared-login-submit")).toBeInTheDocument();
    expect(screen.getByTestId("yyc3-shared-login-remember")).toBeInTheDocument();
  });
});

describe("Login · i18n 中文", () => {
  it("中文环境下所有文案正确", () => {
    render(<Login />);
    expect(screen.getByTestId("yyc3-shared-login-title")).toHaveTextContent("用户登录");
    expect(screen.getByTestId("yyc3-shared-login-submit")).toHaveTextContent("登 录");
    expect(screen.getByLabelText("用户名")).toBeInTheDocument();
  });
});

describe("Login · 用户交互", () => {
  it("空提交触发必填校验", async () => {
    render(<Login />);
    fireEvent.click(screen.getByTestId("yyc3-shared-login-submit"));
    await waitFor(() => {
      expect(screen.getByTestId("yyc3-shared-login-username-error")).toHaveTextContent("必填");
    });
  });

  it("正确凭据登录成功后跳转", async () => {
    render(<Login />);
    fireEvent.change(screen.getByTestId("yyc3-shared-login-username"), { target: { value: "admin" } });
    fireEvent.change(screen.getByTestId("yyc3-shared-login-password"), { target: { value: "yyc3@2026" } });
    fireEvent.click(screen.getByTestId("yyc3-shared-login-submit"));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
```

---

## 五、现有测试文件清单（Shared 模块 17 组件）

| # | 组件名 | 测试文件路径 | data-testid 前缀 |
|:-:|:------|:------------|:----------------|
| 1 | Layout | `src/app/__tests__/Layout.test.tsx` | `yyc3-shared-layout-*` |
| 2 | Sidebar | `src/app/__tests__/Sidebar.test.tsx` | `yyc3-shared-sidebar-*` |
| 3 | TopBar | `src/app/__tests__/TopBar.test.tsx` | `yyc3-shared-topbar-*` |
| 4 | BottomNav | `src/app/__tests__/BottomNav.test.tsx` | `yyc3-shared-bottomnav-*` |
| 5 | Login | `src/app/__tests__/Login.test.tsx` | `yyc3-shared-login-*` |
| 6 | ErrorBoundary | `src/app/__tests__/ErrorBoundary.test.tsx` | `yyc3-shared-error-boundary-*` |
| 7 | NotFound | `src/app/__tests__/NotFound.test.tsx` | `yyc3-shared-notfound-*` |
| 8 | GlassCard | `src/app/__tests__/GlassCard.test.tsx` | `yyc3-shared-glass-card-*` |
| 9 | LanguageSwitcher | `src/app/__tests__/LanguageSwitcher.test.tsx` | `yyc3-shared-lang-switcher-*` |
| 10 | YYC3Logo | `src/app/__tests__/YYC3Logo.test.tsx` | `yyc3-shared-logo-*` |
| 11 | YYC3LogoSvg | `src/app/__tests__/YYC3LogoSvg.test.tsx` | `yyc3-shared-logo-svg-*` |
| 12 | AIAssistant | `src/app/__tests__/AIAssistant.test.tsx` | `yyc3-shared-ai-assistant-*` |
| 13 | CommandPalette | `src/app/__tests__/CommandPalette.test.tsx` | `yyc3-shared-cmd-palette-*` |
| 14 | OfflineIndicator | `src/app/__tests__/OfflineIndicator.test.tsx` | `yyc3-shared-offline-*` |
| 15 | ConnectionStatus | `src/app/__tests__/ConnectionStatus.test.tsx` | `yyc3-shared-connection-*` |
| 16 | QuickActionGrid | `src/app/__tests__/QuickActionGrid.test.tsx` | `yyc3-shared-quick-action-*` |
| 17 | TabBar | `src/app/__tests__/TabBar.test.tsx` | `yyc3-shared-tabbar-*` |

---

### Shared 关联 Hook 测试

| Hook | 测试文件 |
|:-----|:--------|
| useI18n | `src/app/__tests__/useI18n.test.tsx` |
| useMobileView | `src/app/__tests__/useMobileView.test.tsx` |
| useWebSocketData | `src/app/__tests__/useWebSocketData.test.tsx` |
| useKeyboardShortcuts | `src/app/__tests__/useKeyboardShortcuts.test.tsx` |
| useOfflineMode | `src/app/__tests__/useOfflineMode.test.ts` |

---
**言启千行代码，语枢万物智能**
**言启象限，语枢未来 | Words Initiate Quadrants, Language Serves as Core for Future**
**万象归元于云枢，深栈智启新纪元 | All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**
**YanYuCloudCube · YYC³ 言语云枢科技**
**YYC³ CloudPivot Intelli-Matrix v3.4.1 · Shared Module Test Suite**
**© 2026 YanYuCloudCube Team · MIT License**
