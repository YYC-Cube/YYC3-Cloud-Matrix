---
file: COMPONENTS.md
description: Dev 模块组件详解 · 每个组件的路由、功能、Props 与使用示例
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [components],[dev],[ide],[module],[reference]
category: reference
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

## 📑 目录 | Table of Contents

- [组件索引总览](#组件索引总览)
- [🎨 设计系统 · DesignSystemPage](#-设计系统--designsystempage)
- [🌈 主题定制 · 主题套件](#-主题定制--主题套件)
  - [ThemeCustomizer](#themecustomizer)
  - [ColorSwatch](#colorswatch)
  - [ColorPicker](#colorpicker)
- [💻 CLI 终端 · 终端套件](#-cli-终端--终端套件)
  - [CLITerminal](#cliterminal)
  - [IntegratedTerminal](#integratedterminal)
- [🧩 IDE 面板 · IDE 主组件](#-ide-面板--ide-主组件)
  - [IDEPanel](#idepanel)
  - [IDELayout](#idelayout)
  - [IDETopBar](#idetopbar)
  - [IDEStatusBar](#idestatusbar)
  - [IDESettingsPanel](#idesettingspanel)
- [🧩 IDE 子模块 · 工作区与导航](#-ide-子模块--工作区与导航)
  - [Workspace](#workspace)
  - [FileExplorer](#fileexplorer)
  - [TabBar](#tabbar)
  - [CodePreviewPanel](#codepreviewpanel)
  - [IDEViewSwitcher](#ideviewswitcher)
- [🧩 IDE 子模块 · 面板系列](#-ide-子模块--面板系列)
  - [PanelEditor](#paneleditor)
  - [PanelTerminal](#panelterminal)
  - [PanelProblems](#panelproblems)
  - [PanelOutput](#paneloutput)
  - [PanelDebug](#paneldebug)
  - [PanelExtensions](#panelextensions)
- [🧩 IDE 子模块 · 集成面板](#-ide-子模块--集成面板)
  - [GitPanel](#gitpanel)
  - [AIChatPanel](#aichatpanel)
  - [NotificationPanel](#notificationpanel)
  - [GPUNodeCard](#gpunodecard)
  - [IDETerminal](#ideterminal)
- [🧩 IDE 子模块 · 对话框系列](#-ide-子模块--对话框系列)
  - [DeployDialog](#deploydialog)
  - [ShareDialog](#sharedialog)
- [🧩 IDE 子模块 · Xterm 系列](#-ide-子模块--xterm-系列)
  - [XtermTerminal](#xtermterminal)
- [🔧 重构报告 · RefactoringReport](#-重构报告--refactoringreport)
- [🏗️ 架构审计 · ArchitectureAudit](#-架构审计--architectureaudit)
- [📚 开发指南 · DevGuidePage](#-开发指南--devguidepage)

---

## 🔗 组件索引总览

| 组件名 | 路由 | 页面级 | IDE 子组件 | 复杂度 | 类型 |
|:-------|:-----|:------:|:----------:|:------:|:-----|
| [DesignSystemPage](#-设计系统--designsystempage) | `/design-system` | ✅ | ❌ | ⭐⭐⭐ | Page |
| [ThemeCustomizer](#themecustomizer) | `/theme` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| [ColorSwatch](#colorswatch) | - | ❌ | ⚠️ | ⭐⭐ | Theme Widget |
| [ColorPicker](#colorpicker) | - | ❌ | ⚠️ | ⭐⭐⭐ | Theme Widget |
| [CLITerminal](#cliterminal) | `/terminal` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| [IntegratedTerminal](#integratedterminal) | - | ❌ | ⚠️ | ⭐⭐⭐ | Terminal Widget |
| [IDEPanel](#idepanel) | `/ide` | ✅ | ❌ | ⭐⭐⭐⭐⭐ | Page |
| [IDELayout](#idelayout) | - | ❌ | ✅ | ⭐⭐⭐⭐⭐ | IDE Layout Root |
| [IDETopBar](#idetopbar) | - | ❌ | ✅ | ⭐⭐⭐ | IDE TopBar |
| [IDEStatusBar](#idestatusbar) | - | ❌ | ✅ | ⭐⭐⭐ | IDE StatusBar |
| [IDESettingsPanel](#idesettingspanel) | - | ❌ | ✅ | ⭐⭐⭐⭐ | IDE Settings |
| [Workspace](#workspace) | - | ❌ | ✅ | ⭐⭐⭐⭐ | IDE Workspace |
| [FileExplorer](#fileexplorer) | - | ❌ | ✅ | ⭐⭐⭐⭐ | IDE Panel |
| [GitPanel](#gitpanel) | - | ❌ | ✅ | ⭐⭐⭐⭐ | IDE Panel |
| [AIChatPanel](#aichatpanel) | - | ❌ | ✅ | ⭐⭐⭐⭐ | IDE Panel |
| [CodePreviewPanel](#codepreviewpanel) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Panel |
| [TabBar](#tabbar) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Navigation |
| [PanelEditor](#paneleditor) | - | ❌ | ✅ | ⭐⭐⭐⭐ | IDE Bottom Panel |
| [PanelTerminal](#panelterminal) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Bottom Panel |
| [PanelProblems](#panelproblems) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Bottom Panel |
| [PanelOutput](#paneloutput) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Bottom Panel |
| [PanelDebug](#paneldebug) | - | ❌ | ✅ | ⭐⭐⭐⭐ | IDE Bottom Panel |
| [PanelExtensions](#panelextensions) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Panel |
| [NotificationPanel](#notificationpanel) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Panel |
| [DeployDialog](#deploydialog) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Dialog |
| [ShareDialog](#sharedialog) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Dialog |
| [GPUNodeCard](#gpunodecard) | - | ❌ | ✅ | ⭐⭐⭐ | IDE Widget |
| [XtermTerminal](#xtermterminal) | - | ❌ | ✅ | ⭐⭐⭐⭐ | IDE Terminal Core |
| [RefactoringReport](#-重构报告--refactoringreport) | `/refactoring` | ✅ | ❌ | ⭐⭐⭐⭐ | Page |
| [ArchitectureAudit](#-架构审计--architectureaudit) | `/architecture` | ✅ | ❌ | ⭐⭐⭐⭐⭐ | Page |
| [DevGuidePage](#-开发指南--devguidepage) | `/dev-guide` | ✅ | ❌ | ⭐⭐ | Page |

---

## 🎨 设计系统 · DesignSystemPage

**文件**：`src/app/modules/dev/DesignSystemPage.tsx`
**路由**：`/design-system`
**权限**：开发者及以上
**类型**：页面级组件 (Page Component)

### 核心能力

- 🎨 **设计 Token 展示**：颜色/间距/圆角/阴影/字号/字重 六大类 Token 分类展示
- 🧩 **组件库预览**：Button/Card/Dialog/Input/Tabs 等 shadcn/ui 核心组件演示区
- 📐 **布局规范**：栅格系统 (Grid)、容器尺寸、安全区域可视化
- 🌗 **主题切换器**：浅色/深色切换，实时预览 Token 变化
- 📋 **一键复制**：每个 Token 旁带 Copy 按钮，复制 CSS 变量或 Tailwind 类名
- 📖 **使用指引**：为每个规范区块提供代码片段示例

### 关键 Props

**无 Props**（页面级组件，内部通过 `useI18n` 获取翻译）

### 使用示例

```tsx
// routes.tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';

const DesignSystemPage = lazy(() =>
  import('./modules/dev/DesignSystemPage').then(m => ({ default: m.DesignSystemPage }))
);

<Route
  path="/design-system"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <DesignSystemPage />
    </Suspense>
  }
/>
```

---

## 🌈 主题定制 · 主题套件

### ThemeCustomizer

**文件**：`src/app/modules/dev/ThemeCustomizer.tsx`
**路由**：`/theme`
**权限**：开发者及以上
**类型**：页面级组件 (Page Component) · 被 `admin/SystemSettings` 跨模块引用

### 核心能力

- 🎨 **Oklch 调色板**：实时调整 L/C/H 三参数，预览色阶 (50-950)
- 📦 **预设主题**：Default / Ocean / Sunset / Forest / Midnight 五种官方预设
- 🏷️ **品牌定制**：品牌色/辅助色/成功/警告/错误色独立配置
- 👁️ **实时预览区**：卡片/按钮/文字/图表模拟场景，实时应用主题
- 💾 **导入导出**：主题配置 JSON 一键导入导出
- 🎯 **对比度检查**：自动校验 WCAG AA 对比度合规性

### 关键 Props

```typescript
interface ThemeCustomizerProps {
  /** 嵌入模式 (隐藏路由导航元素)，SystemSettings 中使用 */
  embedded?: boolean;
  /** 自定义 className */
  className?: string;
  /** 主题变更回调 */
  onThemeChange?: (config: BrandingConfig) => void;
}
```

### 使用示例

```tsx
// 独立页面
<Route path="/theme" element={<ThemeCustomizer />} />

// 嵌入 admin/SystemSettings
<TabPanel value="appearance">
  <ThemeCustomizer embedded onThemeChange={handlePersistBranding} />
</TabPanel>
```

---

### ColorSwatch

**文件**：`src/app/modules/dev/theme/ColorSwatch.tsx`
**路由**：- (主题组件)
**类型**：通用组件 · 被 `ThemeCustomizer` 和 `ColorPicker` 引用

### 核心能力

- 🎨 **单色色块**：显示 Hex 色值 + 视觉颜色
- 📊 **色阶展示**：支持 50/100/.../900/950 完整色阶 (Grid 展示)
- 📋 **点击复制**：点击色块复制对应的 Hex / Oklch / CSS 变量
- 👁️ **悬停详情**：Tooltip 显示 L/C/H 三值 + 对比度
- ✅ **选中态**：被选中的色块显示勾选边框

### 关键 Props

```typescript
interface ColorSwatchProps {
  /** 颜色值 (Hex) */
  color: string;
  /** 尺寸变体 */
  size?: 'sm' | 'md' | 'lg';
  /** 显示文本 (Hex 色值或色阶名) */
  label?: string;
  /** 是否可选中 */
  selectable?: boolean;
  /** 选中状态 */
  selected?: boolean;
  /** 点击回调 */
  onClick?: (color: string) => void;
  /** 悬停显示 Oklch 详情 */
  showDetails?: boolean;
}
```

### 使用示例

```tsx
// 单色块
<ColorSwatch
  color="#3b82f6"
  label="Primary 500"
  selectable
  selected={true}
  onClick={(c) => console.log('Selected:', c)}
/>

// 色阶组
{['50','100','200','300','400','500','600','700','800','900','950'].map(step => (
  <ColorSwatch
    key={step}
    color={THEME_PRESETS.default.colors.primary[step]}
    label={step}
    size="sm"
  />
))}
```

---

### ColorPicker

**文件**：`src/app/modules/dev/theme/ColorPicker.tsx`
**路由**：- (主题组件)
**类型**：通用组件 · Oklch 原生支持取色器

### 核心能力

- 🌈 **全色域拾取**：二维拾色板 (C × H) + 明度滑块 L
- 🔢 **精确输入**：Hex / Oklch / RGB 三种输入模式切换
- 📦 **历史记录**：最近使用 12 个颜色快捷选择
- 🎯 **滴管工具**：(桌面端) 从屏幕任意位置取色
- ⚡ **预设快捷色**：内置常用品牌色面板

### 关键 Props

```typescript
interface ColorPickerProps {
  /** 当前值 (Hex) */
  value: string;
  /** 变更回调 */
  onChange: (hex: string) => void;
  /** 是否显示确认/取消按钮 (弹窗模式) */
  showActions?: boolean;
  /** 确认回调 (配合 showActions) */
  onConfirm?: (hex: string) => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 紧凑模式 (隐藏历史/预设) */
  compact?: boolean;
}
```

### 使用示例

```tsx
// 受控模式
const [primaryColor, setPrimaryColor] = useState('#3b82f6');
<ColorPicker value={primaryColor} onChange={setPrimaryColor} />

// 弹窗模式 (Dialog 中使用)
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <ColorPicker
      value={color}
      onChange={setDraftColor}
      showActions
      onConfirm={() => { setColor(draftColor); setOpen(false); }}
      onCancel={() => setOpen(false)}
    />
  </DialogContent>
</Dialog>
```

---

## 💻 CLI 终端 · 终端套件

### CLITerminal

**文件**：`src/app/modules/dev/CLITerminal.tsx`
**路由**：`/terminal`
**权限**：开发者及以上
**类型**：页面级组件 (Page Component) · 全屏终端

### 核心能力

- 💻 **xterm.js 渲染**：完整终端模拟器，支持真彩色 / Unicode / 256 色
- ⚡ **内置命令**：`cpim` / `env` / `goto` / `ai` / `kb` 五大专属命令
- 📜 **命令历史**：↑↓ 回溯 + Ctrl+R 反向搜索，持久化到 IndexedDB
- 🔀 **多标签页**：支持打开多个终端 Tab，独立会话
- 🎨 **主题适配**：自动匹配 IDE 主题配色方案
- 📋 **复制粘贴**：Ctrl+C/V + 右键菜单支持

### 关键 Props

```typescript
interface CLITerminalProps {
  /** 初始工作目录 */
  initialCwd?: string;
  /** 预置初始命令列表 (页面加载后依次执行) */
  initialCommands?: string[];
  /** 只读模式 (禁止输入，仅显示输出) */
  readOnly?: boolean;
}
```

### 使用示例

```tsx
// 全屏终端页
<Route
  path="/terminal"
  element={<CLITerminal initialCommands={['cpim status', 'env list']} />}
/>
```

---

### IntegratedTerminal

**文件**：`src/app/modules/dev/IntegratedTerminal.tsx`
**路由**：- (嵌入式终端)
**类型**：通用组件 · 适用于面板嵌入 / 底部面板 / Modal 内

### 核心能力

- 🔲 **紧凑变体**：减少内边距和字号，适合嵌入面板
- 🎚️ **最小化切换**：内置展开/收起 Header (可配置)
- 🔄 **自动高度**：根据容器自适应 fit()

### 关键 Props

```typescript
interface IntegratedTerminalProps {
  /** 最小高度 (收起状态) */
  minHeight?: string;
  /** 最大高度 (展开状态) */
  maxHeight?: string;
  /** 是否显示 Header */
  showHeader?: boolean;
  /** Header 标题 (默认 "Terminal") */
  title?: string;
  /** 初始命令 */
  initialCommand?: string;
  /** 终端 ID (用于多实例隔离) */
  terminalId?: string;
  /** 可拖拽调整高度 */
  resizable?: boolean;
  /** 命令执行完成回调 */
  onCommandDone?: (cmd: string, output: string) => void;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
// IDE 底部面板集成
<PanelTerminal>
  <IntegratedTerminal
    showHeader={false}
    terminalId="ide-bottom"
    resizable
    maxHeight="40vh"
  />
</PanelTerminal>

// Modal 内调试终端
<Dialog>
  <DialogContent className="max-w-4xl">
    <DialogHeader>Debug Terminal</DialogHeader>
    <IntegratedTerminal
      initialCommand="cpim doctor"
      onCommandDone={(cmd, out) => logger(cmd, out)}
    />
  </DialogContent>
</Dialog>
```

---

## 🧩 IDE 面板 · IDE 主组件

### IDEPanel

**文件**：`src/app/modules/dev/IDEPanel.tsx`
**路由**：`/ide`
**权限**：开发者及以上
**类型**：页面级组件 (Page Component) · IDE 总入口

### 核心能力

- 🏗️ **整体装配**：集成 IDELayout + LayoutProvider + 所有子面板
- 🔌 **工作区加载**：从 Zustand store 恢复打开的 Tab、面板尺寸、布局状态
- 📌 **欢迎向导**：首次访问展示 Welcome Tab (创建项目 / 克隆 / 打开示例)
- 🔄 **自动保存**：防抖自动保存编辑器内容到 IndexedDB
- 💡 **快捷键提示**：Cmd/Ctrl+K 弹出命令面板 (Command Palette)

### 关键 Props

**无 Props**（页面级组件）

### 使用示例

```tsx
<Route path="/ide" element={<IDEPanel />} />
```

---

### IDELayout

**文件**：`src/app/modules/dev/ide/IDELayout.tsx`
**路由**：- (IDE 子模块)
**类型**：IDE 布局根容器 · 3 行 × 3 列 Golden Layout 风格

### 核心能力

- 🪟 **黄金布局**：TopBar + 左栏 (FileExplorer/Git) + 中间区 (TabBar+Editor) + 右栏 (AI/Preview) + 底栏 (Terminal/Problems) + StatusBar
- 📏 **可拖拽分隔条**：通过 DragHandle 组件拖拽调整 4 个区域尺寸
- 🎚️ **面板显隐**：左/右/底栏可分别折叠，支持 Ctrl+B / Ctrl+J 快捷键
- 📐 **尺寸持久化**：面板宽度/高度自动写入 `useLayoutStore`，刷新保留
- 🧭 **分屏模式**：支持水平 / 垂直 编辑器拆分 (setSplitMode)

### 关键 Props

```typescript
interface IDELayoutProps {
  /** 左侧面板内容 (默认 FileExplorer) */
  leftPanel?: React.ReactNode;
  /** 右侧面板内容 (默认 AIChatPanel + CodePreviewPanel Tabs) */
  rightPanel?: React.ReactNode;
  /** 底部面板内容 (默认 PanelTerminal + PanelProblems + PanelOutput + PanelDebug) */
  bottomPanel?: React.ReactNode;
  /** 编辑器区内容 (默认 Workspace) */
  editorArea?: React.ReactNode;
  /** 自定义 TopBar */
  topBar?: React.ReactNode;
  /** 自定义 StatusBar */
  statusBar?: React.ReactNode;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
import { LayoutProvider } from './ide/LayoutContext';
import { IDELayout } from './ide/IDELayout';

<LayoutProvider>
  <IDELayout
    leftPanel={<CustomExplorer />}
    editorArea={<CustomEditor />}
  />
</LayoutProvider>
```

---

### IDETopBar

**文件**：`src/app/modules/dev/ide/IDETopBar.tsx`
**路由**：- (IDE 子模块)
**类型**：顶部工具栏 (仿 VS Code TitleBar)

### 核心能力

- 🍞 **面包屑导航**：项目名 / 目录 / 打开文件名 / 符号名
- 🧠 **命令面板入口**：Cmd/Ctrl+K 触发搜索框 (快速打开文件/命令)
- 🪟 **窗口控制**：Traffic Light 按钮 (macOS) / 最小化/最大化/关闭
- 🎛️ **快捷操作**：Run / Debug / Deploy 按钮组 (可配置)
- 🔔 **通知徽章**：NotificationPanel 触发按钮 + 未读计数红点
- 👤 **用户菜单**：头像 + 账户设置 / 偏好 / 登出

### 关键 Props

```typescript
interface IDETopBarProps {
  /** 项目名 (面包屑根) */
  projectName?: string;
  /** 面包屑路径数组 */
  breadcrumbs?: string[];
  /** 显示运行/调试按钮 */
  showRunButtons?: boolean;
  /** 部署按钮点击回调 */
  onDeployClick?: () => void;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<IDETopBar
  projectName="YYC3-CloudPivot"
  breadcrumbs={['src', 'app', 'modules', 'dev', 'IDEPanel.tsx']}
  showRunButtons
  onDeployClick={() => setDeployOpen(true)}
/>
```

---

### IDEStatusBar

**文件**：`src/app/modules/dev/ide/IDEStatusBar.tsx`
**路由**：- (IDE 子模块)
**类型**：底部状态栏 (仿 VS Code StatusBar)

### 核心能力

- 🌿 **Git 分支**：当前分支名 + 提交数 (点击切到 GitPanel)
- ⚠️ **问题计数**：错误 ❌ / 警告 ⚠️ / 信息 ℹ️ 三档计数 (点击切到 PanelProblems)
- 🔀 **编码**：UTF-8 / LF / TypeScript / 空格 4 (可点击修改)
- 📝 **光标位置**：Ln 42, Col 18 / 选中字符数
- 🔔 **通知铃铛**：点击打开 NotificationPanel
- ☁️ **同步状态**：云端同步 / 部署状态指示器
- 🎮 **GPU 状态**：GPU 节点健康度摘要 (点击展开详情)

### 关键 Props

```typescript
interface IDEStatusBarProps {
  /** 分支名 */
  branch?: string;
  /** 问题统计 */
  problems?: { errors: number; warnings: number; infos: number };
  /** 编码格式 */
  encoding?: string;
  /** 行尾符 */
  eol?: 'LF' | 'CRLF';
  /** 语言模式 */
  language?: string;
  /** 空格缩进 */
  indent?: string;
  /** 光标位置 */
  cursor?: { line: number; column: number; selected?: number };
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<IDEStatusBar
  branch="feature/oklch-theme"
  problems={{ errors: 0, warnings: 3, infos: 12 }}
  encoding="UTF-8"
  eol="LF"
  language="TypeScript React"
  indent="Spaces: 2"
  cursor={{ line: 89, column: 42, selected: 156 }}
/>
```

---

### IDESettingsPanel

**文件**：`src/app/modules/dev/ide/IDESettingsPanel.tsx`
**路由**：- (IDE 子模块)
**类型**：IDE 设置面板

### 核心能力

- 🧭 **侧边分类**：General / Editor / Terminal / Appearance / Keybindings / Extensions
- 👔 **编辑器偏好**：字号 / 行高 / 字体族 / 制表符 / 自动换行 / 自动保存
- 💻 **终端偏好**：字体 / 字号 / 行高 / Cursor 样式 / 滚动行数 / Shell 路径
- 🎨 **外观**：主题 / 图标主题 / 侧边栏位置 / 平滑滚动 / 动画开关
- ⌨️ **快捷键**：快捷键列表 + 搜索 + 自定义绑定
- 💾 **自动持久化**：通过 `useSettingsSSOT` 写入 localStorage

### 关键 Props

```typescript
interface IDESettingsPanelProps {
  /** 默认选中的 Tab */
  defaultTab?: IDESettingTab;
  /** 是否 Dialog 模式 (带关闭按钮) */
  asDialog?: boolean;
  /** Dialog 受控显示 */
  open?: boolean;
  /** Dialog 关闭回调 */
  onOpenChange?: (open: boolean) => void;
}
```

### 使用示例

```tsx
// 作为页面打开
<IDESettingsPanel defaultTab="editor" />

// 作为 Dialog 打开 (Cmd/Ctrl+, 触发)
<IDESettingsPanel asDialog open={open} onOpenChange={setOpen} />
```

---

## 🧩 IDE 子模块 · 工作区与导航

### Workspace

**文件**：`src/app/modules/dev/ide/Workspace.tsx`
**路由**：- (IDE 子模块)
**类型**：工作区根容器 (编辑器区外层)

### 核心能力

- 🗂️ **Tab 管理**：集成 TabBar + 对应编辑器内容切换
- 💾 **内容持久化**：打开文件列表 / 内容 / 光标位置 读写 store
- ⚡ **快捷操作**：新建文件 / 保存 / 全部保存 / 关闭右侧其他 / 关闭所有
- 🔀 **编辑器拆分**：集成 IDEViewSwitcher，支持左右分屏编辑器

### 关键 Props

```typescript
interface WorkspaceProps {
  /** 欢迎页 (无 Tab 打开时显示) */
  welcome?: React.ReactNode;
  /** 编辑器渲染函数 (可注入 Monaco/CodeMirror 等) */
  renderEditor?: (tab: WorkspaceTab) => React.ReactNode;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<Workspace
  welcome={<WelcomeGuide />}
  renderEditor={(tab) => (
    <MonacoEditor
      key={tab.id}
      path={tab.path}
      language={tab.language}
      value={tab.content}
      onChange={(v) => updateTabContent(tab.id, v)}
    />
  )}
/>
```

---

### FileExplorer

**文件**：`src/app/modules/dev/ide/FileExplorer.tsx`
**路由**：- (IDE 子模块)
**类型**：左侧文件资源管理器 (树状)

### 核心能力

- 📁 **树状结构**：文件夹可展开 / 折叠，带 Chevron 图标
- 📄 **文件图标**：按扩展名差异化图标 (tsx / ts / md / json / css ...)
- 🖱️ **右键菜单**：新建文件/文件夹、重命名、删除、复制路径、在终端中打开
- 🔍 **过滤搜索**：顶部搜索框模糊过滤
- ✨ **状态装饰**：Git 状态徽章 (M 已修改 / A 新增 / D 删除 / U 未追踪)
- 📌 **置顶文件夹**：Project / Modules / Components 常用目录可固定

### 关键 Props

```typescript
interface FileExplorerProps {
  /** 根目录节点 (或默认加载 Mock) */
  rootNode?: FileNode;
  /** 选中/打开文件回调 */
  onFileOpen?: (file: FileNode) => void;
  /** 选中文件夹回调 */
  onFolderSelect?: (folder: FileNode) => void;
  /** 显示头部 (搜索 + 操作按钮) */
  showHeader?: boolean;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<FileExplorer
  rootNode={projectRoot}
  onFileOpen={(f) => workspace.openFile(f)}
/>
```

---

### TabBar

**文件**：`src/app/modules/dev/ide/TabBar.tsx`
**路由**：- (IDE 子模块)
**类型**：编辑器顶部 Tab 栏

### 核心能力

- 📑 **Tab 列表**：图标 + 文件名 + 扩展名 + 脏点 (已修改未保存)
- 📌 **固定 Tab**：Pin 状态 Tab 置顶分隔显示
- 🔴 **关闭按钮**：Hover 显示 ×，中键关闭
- 🎨 **状态高亮**：Active Tab 背景色 + 底部装饰条
- 🖱️ **右键菜单**：关闭 / 关闭其他 / 关闭右侧 / 关闭所有 / 在资源管理器中显示
- ↔️ **可拖拽重排**：HTML5 DnD 重新排序

### 关键 Props

```typescript
interface TabBarProps {
  /** Tab 列表 */
  tabs: WorkspaceTab[];
  /** 当前活跃 Tab ID */
  activeTabId: string | null;
  /** 已固定 Tab ID 集合 */
  pinnedTabIds?: string[];
  /** Tab 切换回调 */
  onSelect?: (tabId: string) => void;
  /** 关闭回调 */
  onClose?: (tabId: string) => void;
  /** 切换 Pin 回调 */
  onTogglePin?: (tabId: string) => void;
  /** 拖拽重排回调 */
  onReorder?: (fromIndex: number, toIndex: number) => void;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<TabBar
  tabs={workspace.openTabs}
  activeTabId={workspace.activeTabId}
  pinnedTabIds={workspace.pinnedTabs}
  onSelect={workspace.setActiveTab}
  onClose={workspace.closeTab}
  onTogglePin={workspace.togglePinTab}
/>
```

---

### CodePreviewPanel

**文件**：`src/app/modules/dev/ide/CodePreviewPanel.tsx`
**路由**：- (IDE 子模块)
**类型**：右侧代码预览 + 语法高亮面板

### 核心能力

- 💻 **语法高亮**：shiki / highlight.js 支持 TS/TSX/JS/Python/Go/...
- 📐 **行号栏**：显示行号 + 点击跳转 (联动编辑器)
- 🌓 **主题适配**：自动根据 IDE 主题切换 light/dark 代码主题
- 🧮 **Minimap**：右侧代码缩略图导航 (大文件)
- 📋 **复制代码**：一键复制整个文件内容

### 关键 Props

```typescript
interface CodePreviewPanelProps {
  /** 文件路径 */
  path?: string;
  /** 代码字符串 */
  code: string;
  /** 语言 */
  language?: string;
  /** 高亮行号 */
  highlightLines?: number[];
  /** 跳转到行回调 */
  onGotoLine?: (line: number) => void;
  /** 显示 Minimap */
  showMinimap?: boolean;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<CodePreviewPanel
  path="src/app/modules/dev/hooks/useTerminal.ts"
  code={terminalHookSource}
  language="typescript"
  highlightLines={[42, 56]}
  onGotoLine={(l) => editor.revealLine(l)}
/>
```

---

### IDEViewSwitcher

**文件**：`src/app/modules/dev/ide/IDEViewSwitcher.tsx`
**路由**：- (IDE 子模块)
**类型**：编辑器拆分切换器 (TabBar 右侧按钮组)

### 核心能力

- ➡️ **右拆分**：垂直左右分屏编辑器
- ⬇️ **下拆分**：水平上下分屏编辑器
- 🔙 **取消拆分**：回到单编辑器
- 🔄 **分屏同步**：滚动联动 (可选)

### 关键 Props

```typescript
interface IDEViewSwitcherProps {
  /** 当前拆分模式 */
  splitMode: 'none' | 'horizontal' | 'vertical';
  /** 模式变更回调 */
  onSplitModeChange: (mode: 'none' | 'horizontal' | 'vertical') => void;
  /** className */
  className?: string;
}
```

---

## 🧩 IDE 子模块 · 面板系列

### PanelEditor

**文件**：`src/app/modules/dev/ide/PanelEditor.tsx`
**路由**：- (IDE 子模块)
**类型**：编辑器面板 (当 IDE 为拆分模式时作为分屏编辑器容器)

### 核心能力

- 🧩 **分屏编辑器**：独立 Workspace 实例，可打开不同文件
- 🔗 **文件拖拽**：从 FileExplorer 拖入分屏
- 🎚️ **尺寸拖动**：相邻面板之间拖拽分隔条

### 关键 Props

```typescript
interface PanelEditorProps {
  /** 分屏 ID */
  splitId: string;
  /** 方向 */
  direction?: 'horizontal' | 'vertical';
  /** className */
  className?: string;
}
```

---

### PanelTerminal

**文件**：`src/app/modules/dev/ide/PanelTerminal.tsx`
**路由**：- (IDE 子模块)
**类型**：底部面板 - Terminal Tab 内容

### 核心能力

- 🔀 **多终端实例**：Tab 栏 + (➕) 按钮新建终端
- 🗑️ **关闭实例**：每个终端 Tab 独立关闭
- 🔁 **下拉选择**：快速切换已打开终端
- 📦 **集成 IntegratedTerminal** (每个 Tab 一个实例)

### 关键 Props

```typescript
interface PanelTerminalProps {
  /** className */
  className?: string;
}
```

---

### PanelProblems

**文件**：`src/app/modules/dev/ide/PanelProblems.tsx`
**路由**：- (IDE 子模块)
**类型**：底部面板 - Problems Tab 内容

### 核心能力

- 🔴🟡🔵 **问题分级**：Errors / Warnings / Infos 三 Tab
- 📋 **列表展示**：文件 / 行 / 列 / 描述 / 规则 ID
- 🔍 **过滤搜索**：关键词 + 严重级别过滤
- 👆 **点击跳转**：点击条目打开对应文件定位到行列

### 关键 Props

```typescript
interface PanelProblemsProps {
  /** 问题列表数据源 */
  problems?: IDEProblem[];
  /** 点击条目回调 */
  onGotoProblem?: (p: IDEProblem) => void;
  /** className */
  className?: string;
}
```

---

### PanelOutput

**文件**：`src/app/modules/dev/ide/PanelOutput.tsx`
**路由**：- (IDE 子模块)
**类型**：底部面板 - Output Tab 内容

### 核心能力

- 📡 **多频道**：Build / Deploy / Lint / AI / Git 输出频道切换
- 🔄 **自动滚动**：新输出时自动滚到底部 (可锁定)
- 🗑️ **清空**：一键清空当前频道
- 📋 **复制**：复制全部日志 / 复制选中行
- 🎨 **ANSI 渲染**：支持 16/256 色终端日志彩色输出

### 关键 Props

```typescript
interface PanelOutputProps {
  /** 默认选中频道 */
  defaultChannel?: OutputChannel;
  /** className */
  className?: string;
}
```

---

### PanelDebug

**文件**：`src/app/modules/dev/ide/PanelDebug.tsx`
**路由**：- (IDE 子模块)
**类型**：底部面板 - Debug Tab 内容

### 核心能力

- 🎮 **调试控制**：Continue / Step Over / Step Into / Step Out / Restart / Stop
- 📋 **断点列表**：所有文件断点一览 (启用/禁用/跳转)
- 🔎 **变量面板**：Locals / Closure / Global 作用域变量树
- 📞 **调用栈**：帧列表，点击切换到对应帧
- ⚠️ **异常捕获**：显示捕获的异常 + 堆栈

### 关键 Props

```typescript
interface PanelDebugProps {
  /** 调试状态 */
  state?: 'idle' | 'running' | 'paused' | 'stopped';
  /** className */
  className?: string;
}
```

---

### PanelExtensions

**文件**：`src/app/modules/dev/ide/PanelExtensions.tsx`
**路由**：- (IDE 子模块)
**类型**：扩展市场面板

### 核心能力

- 🔎 **搜索**：按关键字/分类/评分搜索扩展
- 📊 **详情卡**：图标 / 作者 / 下载量 / 评分 / 功能描述
- 📦 **安装管理**：Install / Uninstall / Enable / Disable / Update
- 📁 **分类**：Themes / Languages / Debuggers / Snippets / Other

### 关键 Props

```typescript
interface PanelExtensionsProps {
  /** 已安装扩展列表 (或使用 Mock) */
  installed?: ExtensionDef[];
  /** className */
  className?: string;
}
```

---

## 🧩 IDE 子模块 · 集成面板

### GitPanel

**文件**：`src/app/modules/dev/ide/GitPanel.tsx`
**路由**：- (IDE 子模块)
**类型**：Git 版本控制面板 (可位于左侧或右侧栏)

### 核心能力

- 🔢 **变更列表**：Staged / Changes / Untracked 三级分组
- ✅ **Stage/Unstage**：点击 ± 按钮，单文件或全部
- 📝 **提交输入框**：Commit message + Ctrl+Enter 快捷提交
- 🌿 **分支管理**：当前分支下拉切换 / 新建 / 合并
- 🔀 **同步按钮**：Pull / Push 状态指示器
- ⏳ **历史记录**：最近 20 条提交简表 (哈希/作者/信息/时间)

### 关键 Props

```typescript
interface GitPanelProps {
  /** 仓库根目录 */
  repoRoot?: string;
  /** 提交完成回调 */
  onCommit?: (message: string, files: string[]) => void;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<GitPanel
  repoRoot="~/workspace/YYC3-CloudPivot"
  onCommit={(msg, files) => toast(`提交成功: ${msg}`)}
/>
```

---

### AIChatPanel

**文件**：`src/app/modules/dev/ide/AIChatPanel.tsx`
**路由**：- (IDE 子模块)
**类型**：AI 编程助手聊天面板 (右侧栏)

### 核心能力

- 💬 **流式聊天**：SSE 流式输出，逐字显示 AI 回复
- 📎 **上下文注入**：当前文件 / 选中代码 / 错误堆栈自动作为上下文
- 🎯 **快捷命令**：Explain / Refactor / Optimize / Add Tests / Generate Docs
- 🧠 **会话管理**：New Chat / 历史会话列表 / 会话重命名
- 🔌 **模型切换**：智谱 / DeepSeek / Ollama / OpenAI 实时切换
- 📋 **代码块操作**：Copy / Insert at Cursor / Replace Selection

### 关键 Props

```typescript
interface AIChatPanelProps {
  /** 初始上下文 (选中的代码/文件) */
  initialContext?: AIContext;
  /** 插入代码到编辑器回调 */
  onInsertCode?: (code: string, mode: 'insert'|'replace') => void;
  /** 可折叠 */
  collapsible?: boolean;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<AIChatPanel
  initialContext={{
    type: 'selection',
    file: 'IDEPanel.tsx',
    language: 'tsx',
    code: selectedCode,
  }}
  onInsertCode={(code, mode) => editor.applyEdit(code, mode)}
/>
```

---

### NotificationPanel

**文件**：`src/app/modules/dev/ide/NotificationPanel.tsx`
**路由**：- (IDE 子模块)
**类型**：通知中心面板 (点击 StatusBar 铃铛弹出)

### 核心能力

- 📬 **列表**：Icon / 标题 / 正文 / 时间 / 来源
- 🏷️ **分类**：All / System / Deploy / AI / Collaboration Tab
- ✅ **已读标记**：单个标记 / 全部标记已读
- 🗑️ **清空**：单条删除 / 全部清空
- 🔔 **Toast 联动**：新通知同步 sonner Toast + 未读红点
- ⚡ **快捷操作按钮**：每条通知最多 2 个操作按钮 (如 "查看报告" / "回滚")

### 关键 Props

```typescript
interface NotificationPanelProps {
  /** 受控显示 */
  open?: boolean;
  /** 关闭回调 */
  onOpenChange?: (open: boolean) => void;
  /** className */
  className?: string;
}
```

---

### GPUNodeCard

**文件**：`src/app/modules/dev/ide/GPUNodeCard.tsx`
**路由**：- (IDE 子模块)
**类型**：GPU 节点资源卡片 (可用于 StatusBar 弹出 / 资源面板)

### 核心能力

- 💳 **节点信息**：名称 / 型号 / ID / 状态指示灯 (🟢 在线 / 🟡 繁忙 / 🔴 离线)
- 📊 **使用率条**：GPU Util / VRAM / 功耗 三条实时进度条
- 🌡️ **温度显示**：核心温度 + 热点温度 + 阈值警告配色
- 🧮 **算力数据**：Tensor Core / FP16 / FP32 TFLOPS
- ⏱️ **实时刷新**：默认 2s 轮询，可配置

### 关键 Props

```typescript
interface GPUNodeCardProps {
  /** GPU 节点数据 */
  node: GPUNode;
  /** 紧凑模式 (用于 StatusBar 弹出) */
  compact?: boolean;
  /** 点击卡片回调 (跳转详情页) */
  onClick?: (node: GPUNode) => void;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
// StatusBar 弹出列表
{gpuNodes.map(node => (
  <GPUNodeCard key={node.id} node={node} compact />
))}

// GPU 资源管理页全卡片
<GPUNodeCard
  node={selectedNode}
  onClick={(n) => router.push(`/monitor/gpu/${n.id}`)}
/>
```

---

### IDETerminal

**文件**：`src/app/modules/dev/ide/IDETerminal.tsx`
**路由**：- (IDE 子模块)
**类型**：IDE 内嵌终端面板 (和 PanelTerminal 的区别：非底部 Tab，独立面板)

### 核心能力

- 💻 **封装 XtermTerminal**：集成 IDE 主题
- 🧩 **快捷命令按钮**：顶部快捷执行 `cpim status` / `cpim doctor` / `env list`
- 📋 **历史命令下拉**：最近执行命令快捷重跑

### 关键 Props

```typescript
interface IDETerminalProps {
  /** 终端实例 ID */
  terminalId?: string;
  /** 初始工作目录 */
  cwd?: string;
  /** className */
  className?: string;
}
```

---

## 🧩 IDE 子模块 · 对话框系列

### DeployDialog

**文件**：`src/app/modules/dev/ide/DeployDialog.tsx`
**路由**：- (IDE 子模块)
**类型**：部署确认对话框 (从 IDETopBar Deploy 按钮触发)

### 核心能力

- 🎯 **环境选择**：Development / Staging / Production 单选卡片
- 📋 **部署清单**：本次构建包含的模块 / 服务列表 (勾选包含)
- 🚀 **部署模式**：蓝绿发布 / 金丝雀 / 全量 / 回滚
- ⏱️ **预计时间**：根据模式和目标环境估算
- ⚠️ **生产环境二次确认**：输入项目名二次确认防误操作
- 📊 **实时日志**：点击部署后切换到实时部署日志流

### 关键 Props

```typescript
interface DeployDialogProps {
  /** 受控显示 */
  open: boolean;
  /** 关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** 待部署模块 (默认全部变更) */
  candidateModules?: string[];
  /** 部署提交回调 */
  onDeploy?: (config: DeployConfig) => Promise<void>;
}
```

### 使用示例

```tsx
<DeployDialog
  open={deployOpen}
  onOpenChange={setDeployOpen}
  candidateModules={['dev', 'admin', 'monitor']}
  onDeploy={async (cfg) => {
    outputChannel.appendLine(`🚀 开始部署到 ${cfg.env}...`);
    await runDeploy(cfg);
  }}
/>
```

---

### ShareDialog

**文件**：`src/app/modules/dev/ide/ShareDialog.tsx`
**路由**：- (IDE 子模块)
**类型**：分享协作对话框

### 核心能力

- 📎 **分享内容选择**：当前文件 / 选中代码片段 / 工作区快照
- 🔗 **链接模式**：生成可分享短链，可设置有效期 (1h / 24h / 7d / 永久)
- 👥 **协作者模式**：输入邮箱邀请加入实时协作 (编辑 / 只读权限)
- 🔒 **安全设置**：密码保护 / IP 白名单 / 禁止下载
- 📊 **统计**：分享链接访问 / 编辑次数统计

### 关键 Props

```typescript
interface ShareDialogProps {
  /** 受控显示 */
  open: boolean;
  /** 关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** 默认分享内容 */
  initialContent?: ShareContent;
  /** 分享成功回调 */
  onShareSuccess?: (result: ShareResult) => void;
}
```

---

## 🧩 IDE 子模块 · Xterm 系列

### XtermTerminal

**文件**：`src/app/modules/dev/ide/XtermTerminal.tsx`
**路由**：- (IDE 子模块)
**类型**：xterm.js React 封装组件 (核心组件)

### 核心能力

- 💻 **xterm.js v5 封装**：完整类型支持
- 🧩 **Addon 系统**：FitAddon + WebLinksAddon + WebglAddon (可选)
- 📐 **autoFit**：容器 ResizeObserver 自动 fit()
- 🎨 **主题注入**：通过 XtermTheme.ts 映射 IDE 主题 → xterm theme
- 🔌 **命令执行 API**：`execute(command)` / `write(text)` / `clear()`
- 📜 **滚动历史**：可配置 scrollback (默认 5000 行)

### 关键 Props

```typescript
interface XtermTerminalProps {
  /** xterm 原生配置 */
  options?: Partial<ITerminalOptions>;
  /** 启动命令输入后的回调 */
  onCommand?: (command: string) => void | Promise<string>;
  /** 输入任意键的回调 */
  onData?: (data: string) => void;
  /** Terminal 实例 ready 回调 */
  onReady?: (term: Terminal) => void;
  /** 自定义 className */
  className?: string;
  /** 样式 */
  style?: React.CSSProperties;
}

// 通过 ref 暴露的 imperative API
export interface XtermTerminalRef {
  execute: (command: string, newline?: boolean) => void;
  write: (text: string) => void;
  writeln: (text: string) => void;
  clear: () => void;
  resize: (cols: number, rows: number) => void;
  focus: () => void;
  getBuffer: () => string[];
}
```

### 使用示例

```tsx
const termRef = useRef<XtermTerminalRef>(null);

<XtermTerminal
  ref={termRef}
  options={{ cursorBlink: true, fontFamily: 'JetBrains Mono, monospace' }}
  onCommand={async (cmd) => {
    const out = await shell.run(cmd);
    return out;
  }}
  onReady={(t) => t.writeln('YYC³ CloudPivot Terminal v1.0.0\n')}
/>

<Button onClick={() => termRef.current?.execute('cpim status')}>
  Run Status
</Button>
```

---

## 🔧 重构报告 · RefactoringReport

**文件**：`src/app/modules/dev/RefactoringReport.tsx`
**路由**：`/refactoring`
**权限**：架构师
**类型**：页面级组件 (Page Component)

### 核心能力

- 📊 **重构仪表盘**：可维护性指数 / 技术债金额 / 代码覆盖率 / 复杂度分布雷达图
- 🐛 **坏味道检测**：Long Method / God Class / Duplicate Code / Shotgun Surgery 分类列示
- 💡 **重构建议**：每个坏味道匹配对应的重构手法 + 预估工作量
- 📈 **趋势对比**：与上次审计对比 (本月 vs 上月) 的改善百分比
- 📝 **改造前/后**：代码 Diff 对比视图，针对具体坏味道给出示例
- 📄 **导出报告**：PDF / Markdown / HTML 三种格式导出

### 关键 Props

```typescript
interface RefactoringReportProps {
  /** 指定分析的模块 (默认全量) */
  targetModules?: string[];
  /** 对比的基准报告 ID (显示趋势对比) */
  baselineReportId?: string;
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<Route
  path="/refactoring"
  element={<RefactoringReport targetModules={['dev', 'admin']} />}
/>
```

---

## 🏗️ 架构审计 · ArchitectureAudit

**文件**：`src/app/modules/dev/ArchitectureAudit.tsx`
**路由**：`/architecture`
**权限**：架构师
**类型**：页面级组件 (Page Component)

### 核心能力

- 🗺️ **依赖图谱**：D3/ReactFlow 可视化模块依赖关系，支持力导向布局
- 🔁 **循环依赖检测**：自动发现循环依赖环，高亮展示危险路径
- 🏥 **模块健康度评分**：耦合度 / 内聚度 / 稳定性 / 抽象度 四维打分
- 📐 **架构合规**：分层约束校验 (Layering) - 如 admin 不得反向依赖 dev
- 📦 **耦合矩阵**：DSM (Design Structure Matrix) 热力图可视化依赖强度
- 🚦 **风险热力图**：按包/文件夹显示改动频率 × 复杂度的风险聚集
- 📊 **趋势追踪**：近 N 次审计健康度曲线，识别架构腐化趋势

### 关键 Props

```typescript
interface ArchitectureAuditProps {
  /** 分析深度：module / file / symbol */
  depth?: 'module' | 'file' | 'symbol';
  /** 布局算法 */
  layout?: 'force' | 'layered' | 'circle' | 'matrix';
  /** className */
  className?: string;
}
```

### 使用示例

```tsx
<Route
  path="/architecture"
  element={<ArchitectureAudit depth="module" layout="layered" />}
/>
```

---

## 📚 开发指南 · DevGuidePage

**文件**：`src/app/modules/dev/DevGuidePage.tsx`
**路由**：`/dev-guide`
**权限**：公开
**类型**：页面级组件 (Page Component)

### 核心能力

- 🏁 **快速入门**：5 步快速上手指南 (初始化 → 配置 → 启动 → IDE → 部署)
- ✨ **最佳实践**：目录结构 / 命名规范 / 状态管理 / 性能优化 / 安全清单
- 🧭 **FAQ**：常见问题 + 排错指南 (Troubleshooting)
- 🤝 **贡献指南**：Issue 模板 / PR 规范 / Code Review Checklist
- 🔍 **搜索**：顶部搜索框全文搜索指南条目
- 📱 **响应式**：移动端适配良好的阅读体验

### 关键 Props

**无 Props**

### 使用示例

```tsx
<Route path="/dev-guide" element={<DevGuidePage />} />
```

---

<div align="center">

---

**[⬆ 返回顶部](#-目录--table-of-contents)** · **[README.md](./README.md)** · **[API-REFERENCE.md](./API-REFERENCE.md)** · **[DEV-GUIDE.md](../../src/app/modules/dev/DEV-GUIDE.md)**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
