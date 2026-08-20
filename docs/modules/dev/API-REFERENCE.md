---
file: API-REFERENCE.md
description: Dev 模块 API 参考 · index.ts 全部导出签名、Hooks、工具函数与类型定义
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [api],[reference],[dev],[ide],[module]
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

- [Barrel 导出清单总览](#barrel-导出清单总览)
- [组件 API 参考 (20+ Components)](#组件-api-参考-20-components)
  - [页面级组件 (8)](#页面级组件-8)
    - [DesignSystemPage](#designsystempage)
    - [DevGuidePage](#devguidepage)
    - [ThemeCustomizer](#themecustomizer)
    - [CLITerminal](#cliterminal)
    - [IntegratedTerminal](#integratedterminal)
    - [IDEPanel](#idepanel)
    - [RefactoringReport](#refactoringreport)
    - [ArchitectureAudit](#architectureaudit)
  - [IDE 子模块 · 布局与导航 (7)](#ide-子模块--布局与导航-7)
    - [IDELayout](#idelayout)
    - [IDETopBar](#idetopbar)
    - [IDEStatusBar](#idestatusbar)
    - [IDESettingsPanel](#idesettingspanel)
    - [IDEViewSwitcher](#ideviewswitcher)
    - [IDETerminal](#ideterminal)
    - [Workspace](#workspace)
  - [IDE 子模块 · 面板系列 (10)](#ide-子模块--面板系列-10)
    - [FileExplorer](#fileexplorer)
    - [GitPanel](#gitpanel)
    - [AIChatPanel](#aichatpanel)
    - [CodePreviewPanel](#codepreviewpanel)
    - [TabBar](#tabbar)
    - [PanelEditor ~ PanelExtensions](#paneleditor--panelextensions)
    - [NotificationPanel](#notificationpanel)
    - [GPUNodeCard](#gpunodecard)
    - [DeployDialog](#deploydialog)
    - [ShareDialog](#sharedialog)
  - [Xterm 封装 (1)](#xterm-封装-1)
    - [XtermTerminal](#xtermterminal)
  - [主题组件 (2)](#主题组件-2)
    - [ColorSwatch](#colorswatch)
    - [ColorPicker](#colorpicker)
- [Hooks API 参考](#hooks-api-参考)
  - [useTerminal](#useterminal)
- [主题工具函数 API](#主题工具函数-api)
  - [hexToOklch](#hextooklch)
  - [oklchToHex](#oklchtohex)
  - [formatOklch](#formatoklch)
- [主题预设常量 API](#主题预设常量-api)
  - [THEME_PRESETS](#theme_presets)
  - [DEFAULT_COLORS](#default_colors)
- [类型定义索引 (Type Definitions)](#类型定义索引-type-definitions)
  - [主题类型 (BrandingConfig, ThemeColors 等)](#主题类型-brandingconfig-themecolors-等)
  - [IDE 类型 (ide-types, ide-layout-types)](#ide-类型-ide-types-ide-layout-types)

---

## 📦 Barrel 导出清单总览

> 来源文件：`src/app/modules/dev/index.ts`
>
> 共导出 **30+ 组件** + **1 Hook** + **3 工具函数** + **2 预设常量** + **多组类型定义**

### 组件导出清单 (30+)

```typescript
// ========== 页面级组件 (8) ==========
export { DesignSystemPage } from './DesignSystemPage';
export { DevGuidePage } from './DevGuidePage';
export { ThemeCustomizer } from './ThemeCustomizer';
export { CLITerminal } from './CLITerminal';
export { IntegratedTerminal } from './IntegratedTerminal';
export { IDEPanel } from './IDEPanel';
export { RefactoringReport } from './RefactoringReport';
export { ArchitectureAudit } from './ArchitectureAudit';

// ========== IDE 子模块 · 布局与导航 (7) ==========
export { IDELayout } from './ide/IDELayout';
export { IDETopBar } from './ide/IDETopBar';
export { IDEStatusBar } from './ide/IDEStatusBar';
export { IDESettingsPanel } from './ide/IDESettingsPanel';
export { IDETerminal } from './ide/IDETerminal';
export { IDEViewSwitcher } from './ide/IDEViewSwitcher';
export { Workspace } from './ide/Workspace';

// ========== IDE 子模块 · 面板系列 (10) ==========
export { FileExplorer } from './ide/FileExplorer';
export { GitPanel } from './ide/GitPanel';
export { AIChatPanel } from './ide/AIChatPanel';
export { CodePreviewPanel } from './ide/CodePreviewPanel';
export { TabBar } from './ide/TabBar';
export { PanelEditor } from './ide/PanelEditor';
export { PanelTerminal } from './ide/PanelTerminal';
export { PanelProblems } from './ide/PanelProblems';
export { PanelOutput } from './ide/PanelOutput';
export { PanelDebug } from './ide/PanelDebug';
export { PanelExtensions } from './ide/PanelExtensions';
export { NotificationPanel } from './ide/NotificationPanel';
export { DeployDialog } from './ide/DeployDialog';
export { ShareDialog } from './ide/ShareDialog';
export { GPUNodeCard } from './ide/GPUNodeCard';

// ========== Xterm 封装 (1) ==========
export { XtermTerminal } from './ide/XtermTerminal';

// ========== 主题组件 (2) ==========
export { ColorSwatch } from './theme/ColorSwatch';
export { ColorPicker } from './theme/ColorPicker';
```

### Hooks / 工具函数 / 常量 / 类型 导出清单

```typescript
// ========== Hooks (1) ==========
export { useTerminal } from './hooks/useTerminal';

// ========== 主题工具函数 (3) ==========
export { hexToOklch, oklchToHex, formatOklch } from './theme/color-utils';

// ========== 主题预设常量 (2) ==========
export { THEME_PRESETS, DEFAULT_COLORS } from './theme/theme-presets';

// ========== 主题类型 (2+) ==========
export type { BrandingConfig, ThemeColors } from './theme/color-utils';

// ========== IDE 类型 (20+) ==========
export * from './ide/ide-types';
export * from './ide/ide-layout-types';

// ========== 路由 ==========
export { devRoutes } from './routes';
```

---

## 🧩 组件 API 参考 (20+ Components)

### 页面级组件 (8)

---

#### DesignSystemPage

| 项 | 值 |
|:---|:---|
| **签名** | `function DesignSystemPage(): JSX.Element` |
| **来源** | `./DesignSystemPage.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props** | 无 |
| **路由** | `/design-system` |
| **权限** | 开发者及以上 |
| **State 依赖** | `useI18n` |
| **共享依赖** | `GlassCard` (from `../shared/GlassCard`) |
| **三方依赖** | `lucide-react` |

**说明**：设计系统展示页，分类呈现颜色 Token / 间距 Token / 字号 / 圆角 / 阴影 / 组件库示例。

---

#### DevGuidePage

| 项 | 值 |
|:---|:---|
| **签名** | `function DevGuidePage(): JSX.Element` |
| **来源** | `./DevGuidePage.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props** | 无 |
| **路由** | `/dev-guide` |
| **权限** | 公开 |
| **State 依赖** | `useI18n` |
| **三方依赖** | `lucide-react` |

**说明**：开发者指南门户页，提供快速入门、最佳实践、FAQ、贡献指南等内容聚合。

---

#### ThemeCustomizer

| 项 | 值 |
|:---|:---|
| **签名** | `function ThemeCustomizer(props?: ThemeCustomizerProps): JSX.Element` |
| **来源** | `./ThemeCustomizer.tsx` |
| **类型** | React.FC · 页面级组件 / 可嵌入 |
| **Props 签名** | 见下方 |
| **路由** | `/theme` |
| **权限** | 开发者及以上 |
| **跨模块被引用** | `admin/SystemSettings` (作为主题设置 Tab) |
| **子组件引用** | `ColorSwatch`, `ColorPicker` (from `./theme/*`) |
| **State 依赖** | `useUIPrefsSlice`, `useSettingsSSOT` |

**Props 签名**：
```typescript
interface ThemeCustomizerProps {
  embedded?: boolean;
  className?: string;
  onThemeChange?: (config: BrandingConfig) => void;
}
```

**说明**：主题定制主控面板，集成 Oklch 调色板、预设主题、品牌色配置、对比度检查、导入导出。

---

#### CLITerminal

| 项 | 值 |
|:---|:---|
| **签名** | `function CLITerminal(props?: CLITerminalProps): JSX.Element` |
| **来源** | `./CLITerminal.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props 签名** | 见下方 |
| **路由** | `/terminal` |
| **权限** | 开发者及以上 |
| **Hook 依赖** | `useTerminal` |
| **三方依赖** | `xterm`, `xterm-addon-fit`, `xterm-addon-web-links` |

**Props 签名**：
```typescript
interface CLITerminalProps {
  initialCwd?: string;                      // @default "~/workspace"
  initialCommands?: string[];               // @default []
  readOnly?: boolean;                       // @default false
}
```

**说明**：全屏 CLI 终端页，集成 xterm.js，内置 cpim/env/goto/ai/kb 专属命令。

---

#### IntegratedTerminal

| 项 | 值 |
|:---|:---|
| **签名** | `function IntegratedTerminal(props?: IntegratedTerminalProps): JSX.Element` |
| **来源** | `./IntegratedTerminal.tsx` |
| **类型** | React.FC · 嵌入式终端变体 |
| **Props 签名** | 见下方 |
| **路由** | - |
| **Hook 依赖** | `useTerminal` |
| **典型引用方** | `PanelTerminal`, `IDETerminal` |

**Props 签名**：
```typescript
interface IntegratedTerminalProps {
  minHeight?: string;                       // @default "120px"
  maxHeight?: string;                       // @default "100%"
  showHeader?: boolean;                     // @default true
  title?: string;                           // @default "Terminal"
  initialCommand?: string;
  terminalId?: string;                      // @default auto
  resizable?: boolean;                      // @default false
  onCommandDone?: (cmd: string, output: string) => void;
  className?: string;
}
```

**说明**：紧凑变体终端组件，适合嵌入 IDE 底部面板、Dialog 等有限空间场景。

---

#### IDEPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function IDEPanel(): JSX.Element` |
| **来源** | `./IDEPanel.tsx` |
| **类型** | React.FC · 页面级组件 · IDE 总入口 |
| **Props** | 无 |
| **路由** | `/ide` |
| **权限** | 开发者及以上 |
| **内部引用** | `LayoutProvider` + `IDELayout` + 所有子模块 |
| **State 依赖** | 完整 Zustand Store 切片 (layout/workspace/terminal/notification/gpu) |
| **共享依赖** | `GlassCard` |

**说明**：IDE 功能总入口页，首次访问显示 Welcome Tab，装配完整的 IDELayout 布局与所有子面板。

---

#### RefactoringReport

| 项 | 值 |
|:---|:---|
| **签名** | `function RefactoringReport(props?: RefactoringReportProps): JSX.Element` |
| **来源** | `./RefactoringReport.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props 签名** | 见下方 |
| **路由** | `/refactoring` |
| **权限** | 架构师 |
| **三方依赖** | `recharts` (RadarChart, BarChart, AreaChart) |

**Props 签名**：
```typescript
interface RefactoringReportProps {
  targetModules?: string[];
  baselineReportId?: string;
  className?: string;
}
```

**说明**：重构报告仪表盘，含可维护性雷达图、坏味道检测列表、重构建议、前后代码 Diff、报告导出。

---

#### ArchitectureAudit

| 项 | 值 |
|:---|:---|
| **签名** | `function ArchitectureAudit(props?: ArchitectureAuditProps): JSX.Element` |
| **来源** | `./ArchitectureAudit.tsx` |
| **类型** | React.FC · 页面级组件 · 复杂度最高 |
| **Props 签名** | 见下方 |
| **路由** | `/architecture` |
| **权限** | 架构师 |
| **三方依赖** | `reactflow` (或 `d3-force`) + `recharts` |

**Props 签名**：
```typescript
interface ArchitectureAuditProps {
  depth?: 'module' | 'file' | 'symbol';     // @default "module"
  layout?: 'force' | 'layered' | 'circle' | 'matrix';  // @default "force"
  className?: string;
}
```

**说明**：架构审计仪表盘，提供依赖图谱、循环依赖检测、模块健康度评分、架构合规校验、DSM 耦合矩阵。

---

### IDE 子模块 · 布局与导航 (7)

---

#### IDELayout

| 项 | 值 |
|:---|:---|
| **签名** | `function IDELayout(props?: IDELayoutProps): JSX.Element` |
| **来源** | `./ide/IDELayout.tsx` |
| **类型** | React.FC · IDE 布局根容器 |
| **Props 签名** | 见下方 |
| **Context 依赖** | 必须在 `<LayoutProvider>` 子树中使用 |

**Props 签名**：
```typescript
interface IDELayoutProps {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  bottomPanel?: React.ReactNode;
  editorArea?: React.ReactNode;
  topBar?: React.ReactNode;
  statusBar?: React.ReactNode;
  className?: string;
}
```

**说明**：3×3 布局容器 (TopBar / Left / Center / Right / Bottom / StatusBar)，支持拖拽分隔条和尺寸持久化。

---

#### IDETopBar

| 项 | 值 |
|:---|:---|
| **签名** | `function IDETopBar(props?: IDETopBarProps): JSX.Element` |
| **来源** | `./ide/IDETopBar.tsx` |
| **类型** | React.FC |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface IDETopBarProps {
  projectName?: string;                     // @default "YYC3-CloudPivot"
  breadcrumbs?: string[];                   // @default []
  showRunButtons?: boolean;                 // @default true
  onDeployClick?: () => void;
  className?: string;
}
```

---

#### IDEStatusBar

| 项 | 值 |
|:---|:---|
| **签名** | `function IDEStatusBar(props?: IDEStatusBarProps): JSX.Element` |
| **来源** | `./ide/IDEStatusBar.tsx` |
| **类型** | React.FC |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface IDEStatusBarProps {
  branch?: string;
  problems?: { errors: number; warnings: number; infos: number };
  encoding?: string;                        // @default "UTF-8"
  eol?: 'LF' | 'CRLF';                      // @default "LF"
  language?: string;
  indent?: string;                          // @default "Spaces: 2"
  cursor?: { line: number; column: number; selected?: number };
  className?: string;
}
```

---

#### IDESettingsPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function IDESettingsPanel(props?: IDESettingsPanelProps): JSX.Element` |
| **来源** | `./ide/IDESettingsPanel.tsx` |
| **类型** | React.FC · 设置面板 (可作为 Dialog) |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
type IDESettingTab = 'general' | 'editor' | 'terminal' | 'appearance' | 'keybindings' | 'extensions';

interface IDESettingsPanelProps {
  defaultTab?: IDESettingTab;               // @default "general"
  asDialog?: boolean;                       // @default false
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
```

---

#### IDEViewSwitcher

| 项 | 值 |
|:---|:---|
| **签名** | `function IDEViewSwitcher(props: IDEViewSwitcherProps): JSX.Element` |
| **来源** | `./ide/IDEViewSwitcher.tsx` |
| **类型** | React.FC · TabBar 右侧拆分按钮组 |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface IDEViewSwitcherProps {
  splitMode: 'none' | 'horizontal' | 'vertical';
  onSplitModeChange: (mode: 'none' | 'horizontal' | 'vertical') => void;
  className?: string;
}
```

---

#### IDETerminal

| 项 | 值 |
|:---|:---|
| **签名** | `function IDETerminal(props?: IDETerminalProps): JSX.Element` |
| **来源** | `./ide/IDETerminal.tsx` |
| **类型** | React.FC · IDE 内嵌终端面板 |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface IDETerminalProps {
  terminalId?: string;                      // @default "ide-main"
  cwd?: string;                             // @default "~/workspace"
  className?: string;
}
```

---

#### Workspace

| 项 | 值 |
|:---|:---|
| **签名** | `function Workspace(props?: WorkspaceProps): JSX.Element` |
| **来源** | `./ide/Workspace.tsx` |
| **类型** | React.FC · 编辑器工作区根容器 |
| **Props 签名** | 见下方 |
| **内部引用** | `TabBar` + `IDEViewSwitcher` + `PanelEditor` |

**Props 签名**：
```typescript
interface WorkspaceProps {
  welcome?: React.ReactNode;
  renderEditor?: (tab: WorkspaceTab) => React.ReactNode;
  className?: string;
}
```

---

### IDE 子模块 · 面板系列 (10)

---

#### FileExplorer

| 项 | 值 |
|:---|:---|
| **签名** | `function FileExplorer(props?: FileExplorerProps): JSX.Element` |
| **来源** | `./ide/FileExplorer.tsx` |
| **类型** | React.FC · 左侧文件树 |
| **Props 签名** | 见下方 |
| **Mock 依赖** | `ide-mock-data.ts` (defaultProjectRoot) |

**Props 签名**：
```typescript
interface FileExplorerProps {
  rootNode?: FileNode;
  onFileOpen?: (file: FileNode) => void;
  onFolderSelect?: (folder: FileNode) => void;
  showHeader?: boolean;                     // @default true
  className?: string;
}
```

---

#### GitPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function GitPanel(props?: GitPanelProps): JSX.Element` |
| **来源** | `./ide/GitPanel.tsx` |
| **类型** | React.FC · Git 控制面板 |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface GitPanelProps {
  repoRoot?: string;
  onCommit?: (message: string, files: string[]) => void;
  className?: string;
}
```

---

#### AIChatPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function AIChatPanel(props?: AIChatPanelProps): JSX.Element` |
| **来源** | `./ide/AIChatPanel.tsx` |
| **类型** | React.FC · AI 编程助手面板 |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface AIChatPanelProps {
  initialContext?: AIContext;
  onInsertCode?: (code: string, mode: 'insert' | 'replace') => void;
  collapsible?: boolean;                    // @default true
  className?: string;
}
```

**内部关联类型**：
```typescript
type AIContext =
  | { type: 'file'; path: string; language: string; content: string }
  | { type: 'selection'; file: string; language: string; code: string }
  | { type: 'error'; stack: string; message: string };
```

---

#### CodePreviewPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function CodePreviewPanel(props: CodePreviewPanelProps): JSX.Element` |
| **来源** | `./ide/CodePreviewPanel.tsx` |
| **类型** | React.FC · 代码预览面板 |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface CodePreviewPanelProps {
  path?: string;
  code: string;
  language?: string;                       // @default auto-detect from path
  highlightLines?: number[];               // @default []
  onGotoLine?: (line: number) => void;
  showMinimap?: boolean;                   // @default true (if code > 100 lines)
  className?: string;
}
```

---

#### TabBar

| 项 | 值 |
|:---|:---|
| **签名** | `function TabBar(props: TabBarProps): JSX.Element` |
| **来源** | `./ide/TabBar.tsx` |
| **类型** | React.FC · 编辑器 Tab 栏 |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface TabBarProps {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  pinnedTabIds?: string[];                  // @default []
  onSelect?: (tabId: string) => void;
  onClose?: (tabId: string) => void;
  onTogglePin?: (tabId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  className?: string;
}
```

---

#### PanelEditor ~ PanelExtensions

六个底部面板组件统一摘要：

| 组件 | 签名 | Props (关键字段) | 路由 | 类型 |
|:-----|:-----|:-----------------|:-----|:-----|
| `PanelEditor` | `(props: PanelEditorProps) => JSX.Element` | `splitId`, `direction` | - | 分屏编辑器容器 |
| `PanelTerminal` | `(props?: PanelTerminalProps) => JSX.Element` | `className` | - | 集成 IntegratedTerminal |
| `PanelProblems` | `(props?: PanelProblemsProps) => JSX.Element` | `problems?`, `onGotoProblem?` | - | 问题分级列表 |
| `PanelOutput` | `(props?: PanelOutputProps) => JSX.Element` | `defaultChannel?: OutputChannel` | - | 多频道输出日志 |
| `PanelDebug` | `(props?: PanelDebugProps) => JSX.Element` | `state?: 'idle'\|'running'\|'paused'\|'stopped'` | - | 调试控制面板 |
| `PanelExtensions` | `(props?: PanelExtensionsProps) => JSX.Element` | `installed?: ExtensionDef[]` | - | 扩展市场面板 |

---

#### NotificationPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function NotificationPanel(props?: NotificationPanelProps): JSX.Element` |
| **来源** | `./ide/NotificationPanel.tsx` |
| **类型** | React.FC · 通知中心 Popover |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface NotificationPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
```

---

#### GPUNodeCard

| 项 | 值 |
|:---|:---|
| **签名** | `function GPUNodeCard(props: GPUNodeCardProps): JSX.Element` |
| **来源** | `./ide/GPUNodeCard.tsx` |
| **类型** | React.FC · GPU 节点卡片 |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface GPUNodeCardProps {
  node: GPUNode;
  compact?: boolean;                        // @default false
  onClick?: (node: GPUNode) => void;
  className?: string;
}
```

---

#### DeployDialog

| 项 | 值 |
|:---|:---|
| **签名** | `function DeployDialog(props: DeployDialogProps): JSX.Element` |
| **来源** | `./ide/DeployDialog.tsx` |
| **类型** | React.FC · 部署 Dialog |
| **Props 签名** | 见下方 |
| **UI 依赖** | shadcn/ui `Dialog*`, `RadioGroup`, `Checkbox`, `Progress` |

**Props 签名**：
```typescript
interface DeployDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateModules?: string[];
  onDeploy?: (config: DeployConfig) => Promise<void>;
}
```

**关联类型**：
```typescript
interface DeployConfig {
  env: 'development' | 'staging' | 'production';
  mode: 'all' | 'blue-green' | 'canary' | 'rollback';
  modules: string[];
  canaryPercentage?: number;                // 金丝雀比例 1-100
  productionConfirmText?: string;           // 生产防误操作二次确认
}
```

---

#### ShareDialog

| 项 | 值 |
|:---|:---|
| **签名** | `function ShareDialog(props: ShareDialogProps): JSX.Element` |
| **来源** | `./ide/ShareDialog.tsx` |
| **类型** | React.FC · 分享协作 Dialog |
| **Props 签名** | 见下方 |

**Props 签名**：
```typescript
interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: ShareContent;
  onShareSuccess?: (result: ShareResult) => void;
}
```

---

### Xterm 封装 (1)

---

#### XtermTerminal

| 项 | 值 |
|:---|:---|
| **签名** | `forwardRef(function XtermTerminal(props: XtermTerminalProps, ref: ForwardedRef<XtermTerminalRef>): JSX.Element` |
| **来源** | `./ide/XtermTerminal.tsx` |
| **类型** | React.ForwardRefExoticComponent · xterm.js React 封装 |
| **Props 签名** | 见下方 |
| **Imperative Ref** | `XtermTerminalRef` (execute / write / writeln / clear / resize / focus / getBuffer) |
| **三方依赖** | `xterm`, `xterm-addon-fit`, `xterm-addon-web-links`, `xterm-addon-webgl?` |
| **Addon 配置** | `XtermAddons.ts` 注册 fit + weblinks |
| **主题配置** | `XtermTheme.ts` 映射 IDE 主题 → xterm theme object |

**Props 签名**：
```typescript
interface XtermTerminalProps {
  options?: Partial<ITerminalOptions>;
  onCommand?: (command: string) => void | Promise<string>;
  onData?: (data: string) => void;
  onReady?: (term: Terminal) => void;
  className?: string;
  style?: React.CSSProperties;
}
```

**Ref 暴露 API**：
```typescript
export interface XtermTerminalRef {
  /** 执行命令 (可选是否追加换行回车) */
  execute: (command: string, newline?: boolean) => void;
  /** 写入原始文本 (无换行) */
  write: (text: string) => void;
  /** 写入一行 (追加换行) */
  writeln: (text: string) => void;
  /** 清屏 */
  clear: () => void;
  /** 手动指定行列数 resize */
  resize: (cols: number, rows: number) => void;
  /** 聚焦到终端输入区 */
  focus: () => void;
  /** 获取当前缓冲区所有行的字符串数组 */
  getBuffer: () => string[];
}
```

---

### 主题组件 (2)

---

#### ColorSwatch

| 项 | 值 |
|:---|:---|
| **签名** | `function ColorSwatch(props: ColorSwatchProps): JSX.Element` |
| **来源** | `./theme/ColorSwatch.tsx` |
| **类型** | React.FC · 色块选择器 |
| **Props 签名** | 见下方 |
| **工具依赖** | `hexToOklch` (Tooltip 详情) |

**Props 签名**：
```typescript
interface ColorSwatchProps {
  color: string;                            // Hex 如 "#3b82f6"
  size?: 'sm' | 'md' | 'lg';                // @default "md"
  label?: string;                           // 如 "Primary 500"
  selectable?: boolean;                     // @default false
  selected?: boolean;                       // @default false
  onClick?: (color: string) => void;
  showDetails?: boolean;                    // @default true (Tooltip L/C/H)
  className?: string;
}
```

---

#### ColorPicker

| 项 | 值 |
|:---|:---|
| **签名** | `function ColorPicker(props: ColorPickerProps): JSX.Element` |
| **来源** | `./theme/ColorPicker.tsx` |
| **类型** | React.FC · Oklch 原生取色器 |
| **Props 签名** | 见下方 |
| **内部引用** | `ColorSwatch` (预设色/历史面板) |

**Props 签名**：
```typescript
interface ColorPickerProps {
  value: string;                            // Hex
  onChange: (hex: string) => void;
  showActions?: boolean;                    // @default false
  onConfirm?: (hex: string) => void;
  onCancel?: () => void;
  compact?: boolean;                        // @default false
  className?: string;
}
```

---

## 🪝 Hooks API 参考

### useTerminal

| 项 | 值 |
|:---|:---|
| **签名** | `function useTerminal(options?: UseTerminalOptions): UseTerminalReturn` |
| **来源** | `./hooks/useTerminal.ts` |
| **类型** | React Custom Hook |
| **状态管理** | 内部使用 `useState` + `useRef` + 可选 Zustand slice |
| **典型消费者** | `CLITerminal`, `IntegratedTerminal`, `PanelTerminal`, `IDETerminal` |

**入参 Options**：
```typescript
interface UseTerminalOptions {
  /** 初始工作目录 (显示在 prompt) */
  initialCwd?: string;                                 // @default "~/workspace"
  /** 初始环境变量 */
  initialEnv?: Record<string, string>;                // @default {}
  /** 终端实例 ID (多终端隔离状态) */
  terminalId?: string;                                 // @default auto
  /** 最大命令历史条数 */
  historyLimit?: number;                               // @default 100
  /** 导航回调 (goto 命令触发) */
  onNavigate?: (path: string) => void;
  /** AI 命令回调 (ai 命令触发) */
  onAI?: (prompt: string) => Promise<string> | string;
  /** 自定义命令处理器 (可扩展) */
  customCommands?: Record<string, TerminalCommandHandler>;
  /** 是否启用持久化 (IndexedDB 存命令历史) */
  persist?: boolean;                                   // @default true
}
```

**返回值 Return**：
```typescript
interface UseTerminalReturn {
  // ===== 状态 =====
  /** 输出缓冲 (prompt + output 行数组) */
  buffer: TerminalLine[];
  /** 命令历史 (字符串数组) */
  history: string[];
  /** 当前 prompt 输入 */
  input: string;
  /** 设置 prompt 输入 */
  setInput: React.Dispatch<React.SetStateAction<string>>;
  /** 当前工作目录 */
  cwd: string;
  /** 当前环境变量快照 */
  env: Record<string, string>;
  /** 是否正在执行异步命令 (loading) */
  isExecuting: boolean;

  // ===== 行为 =====
  /** 执行命令 (模拟回车提交) */
  execute: (command: string) => Promise<void>;
  /** 写入原始文本到输出缓冲区 */
  write: (text: string, type?: TerminalLineType) => void;
  /** 写入一行 (末尾追加换行) */
  writeln: (text: string, type?: TerminalLineType) => void;
  /** 清屏 */
  clear: () => void;
  /** 切换工作目录 (仅影响 prompt 显示) */
  cd: (path: string) => void;
  /** 获取历史：向上一条 */
  getHistoryPrev: () => string | null;
  /** 获取历史：向下一条 */
  getHistoryNext: () => string | null;
  /** 重置历史指针 (输入了新字符后调用) */
  resetHistoryPointer: () => void;
}
```

**辅助类型**：
```typescript
type TerminalLineType =
  | 'prompt'     // $ prompt 行
  | 'output'     // 标准输出 (默认)
  | 'error'      // 标准错误 (红色)
  | 'info'       // 信息 (蓝色)
  | 'success'    // 成功 (绿色)
  | 'warning';   // 警告 (黄色)

interface TerminalLine {
  type: TerminalLineType;
  content: string;
  ts: number;        // 毫秒时间戳
}

type TerminalCommandHandler = (
  args: string[],
  ctx: TerminalCommandContext
) => TerminalCommandResult | Promise<TerminalCommandResult>;

interface TerminalCommandContext {
  cwd: string;
  env: Record<string, string>;
  history: string[];
  api: UseTerminalReturn;
}

interface TerminalCommandResult {
  output?: string;
  exitCode?: 0 | 1;        // 0 成功 / 1 错误
  cwdChange?: string;      // cd 命令返回新路径
  envPatch?: Record<string, string | undefined>;  // set/export 返回变更
  navigate?: string;       // goto 命令返回路径
  aiPrompt?: string;       // ai 命令返回 prompt
}
```

---

## 🎨 主题工具函数 API

### hexToOklch

| 项 | 值 |
|:---|:---|
| **签名** | `function hexToOklch(hex: string): Oklch` |
| **来源** | `./theme/color-utils.ts` |
| **纯度** | ✅ 纯函数 · 无副作用 |
| **输入格式** | `"#RGB"` / `"#RRGGBB"` / `"#RRGGBBAA"` · `#` 可省略 |

**返回类型**：
```typescript
interface Oklch {
  l: number;   // Lightness: 0 ~ 1
  c: number;   // Chroma:    0 ~ 0.37+
  h: number;   // Hue:       0 ~ 360 (degress)
}
```

**示例**：
```typescript
hexToOklch('#3b82f6');
// => { l: 0.673..., c: 0.179..., h: 250.1... }
hexToOklch('3b82f6');   // # 省略 OK
// => 同上
hexToOklch('#fff');     // 短格式 OK
// => { l: 1, c: 0, h: NaN }
```

---

### oklchToHex

| 项 | 值 |
|:---|:---|
| **签名** | `function oklchToHex(l: number, c: number, h: number, alpha?: number): string` |
| **来源** | `./theme/color-utils.ts` |
| **纯度** | ✅ 纯函数 |
| **返回格式** | `"#RRGGBB"` 或 `"#RRGGBBAA"` (当 alpha 存在且 < 1) |
| **色域裁剪** | OOG (Out of Gamut) 时自动裁剪到 sRGB 色域 |

**示例**：
```typescript
oklchToHex(0.673, 0.179, 250.1);
// => "#3b82f6"
oklchToHex(1, 0, 0);     // 纯白
// => "#ffffff"
oklchToHex(0.67, 0.18, 250, 0.5);  // 带 50% 透明度
// => "#3b82f680"
```

---

### formatOklch

| 项 | 值 |
|:---|:---|
| **签名** | `function formatOklch(l: number, c: number, h: number, mode?: 'css' | 'oklch' | 'raw'): string` |
| **来源** | `./theme/color-utils.ts` |
| **纯度** | ✅ 纯函数 |
| **默认 mode** | `"css"` |

**三种格式**：

| Mode | 输出示例 | 用途 |
|:-----|:---------|:-----|
| `css` (默认) | `"oklch(67.3% 0.179 250.1)"` | 直接写入 CSS |
| `oklch` | `"67.3%, 0.179, 250.1°"` | 人眼可读 |
| `raw` | `"0.673 0.179 250.1"` | CSS 变量值片段 |

**示例**：
```typescript
formatOklch(0.673, 0.179, 250.1);
// => "oklch(67.3% 0.179 250.1)"
formatOklch(0.673, 0.179, 250.1, 'raw');
// => "0.673 0.179 250.1"
```

---

## 🎯 主题预设常量 API

### THEME_PRESETS

| 项 | 值 |
|:---|:---|
| **签名** | `const THEME_PRESETS: Record<ThemePresetKey, ThemePreset>` |
| **来源** | `./theme/theme-presets.ts` |
| **类型** | Const 断言 · 5 套官方预设 |

**类型定义**：
```typescript
export type ThemePresetKey = 'default' | 'ocean' | 'sunset' | 'forest' | 'midnight';

export interface ThemePreset {
  /** 显示名 (i18n key) */
  name: string;
  /** 预设描述 */
  description: string;
  /** 主题模式 (基础外观) */
  appearance: 'light' | 'dark' | 'auto';
  /** 完整色彩配置 */
  colors: ThemeColors;
  /** 预览主色 (卡片/缩略图用) */
  previewColor: string;
}
```

**内容结构示例**：
```typescript
export const THEME_PRESETS = {
  default: {
    name: 'dev.theme.default',
    description: 'dev.theme.defaultDesc',
    appearance: 'light',
    previewColor: '#3b82f6',
    colors: {
      primary:   generateOklchScale('#3b82f6'),   // 蓝
      secondary: generateOklchScale('#8b5cf6'),   // 紫
      accent:    generateOklchScale('#06b6d4'),   // 青
      success:   generateOklchScale('#10b981'),   // 绿
      warning:   generateOklchScale('#f59e0b'),   // 黄
      error:     generateOklchScale('#ef4444'),   // 红
      info:      generateOklchScale('#6366f1'),   // 靛
      neutral:   generateOklchScale('#64748b'),   // 灰蓝
      background: { 50:'#...', 100:'...', 900:'...' },
      surface:    { 50:'#...', ... },
      text:       { primary:'#0f172a', secondary:'#475569', muted:'#94a3b8' },
      border:     { default:'#e2e8f0', strong:'#94a3b8' },
      shadow:     { sm:'...', md:'...', lg:'...' },
    } satisfies ThemeColors,
  },
  // ... ocean / sunset / forest / midnight 同样结构
} as const satisfies Record<ThemePresetKey, ThemePreset>;
```

---

### DEFAULT_COLORS

| 项 | 值 |
|:---|:---|
| **签名** | `const DEFAULT_COLORS: ThemeColors` |
| **来源** | `./theme/theme-presets.ts` |
| **说明** | `THEME_PRESETS.default.colors` 的直接别名导出，便于快速引用默认调色板 |

**典型引用场景**：
```typescript
import { DEFAULT_COLORS } from '../dev/theme/theme-presets';

// 默认 primary-500
const brandColor = DEFAULT_COLORS.primary['500'];

// 遍历默认色阶生成文档页
Object.entries(DEFAULT_COLORS.primary).map(([step, hex]) => ...)
```

---

## 📐 类型定义索引 (Type Definitions)

### 主题类型 (BrandingConfig, ThemeColors 等)

来源文件：`./theme/color-utils.ts`

```typescript
// Oklch 色彩三元组
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

// 单品牌色完整色阶 (50-950)
export type ColorScale = {
  '50': string;   '100': string;  '200': string;
  '300': string;  '400': string;  '500': string;
  '600': string;  '700': string;  '800': string;
  '900': string;  '950': string;
};

// 完整主题色彩集
export interface ThemeColors {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  neutral: ColorScale;
  background: Partial<ColorScale> & { DEFAULT: string; paper: string };
  surface:    Partial<ColorScale> & { DEFAULT: string; elevated: string };
  text:       { primary: string; secondary: string; muted: string; inverse: string };
  border:     { DEFAULT: string; strong: string; subtle: string };
  shadow:     { sm: string; md: string; lg: string; xl: string };
}

// 品牌配置 (完整持久化单元)
export interface BrandingConfig {
  /** 品牌名 */
  brandName: string;
  /** Logo URL / Data URL (可选) */
  logo?: string;
  /** 外观模式 */
  appearance: 'light' | 'dark' | 'auto';
  /** 主色 (基准色) */
  primaryColor: string;
  /** 辅助色 */
  secondaryColor: string;
  /** 成功色 */
  successColor: string;
  /** 警告色 */
  warningColor: string;
  /** 错误色 */
  errorColor: string;
  /** 圆角等级 0-3 */
  radiusLevel: 0 | 1 | 2 | 3;
  /** 主题预设 key (如果来自预设) */
  presetKey?: ThemePresetKey;
  /** 完整 ThemeColors (派生值，不建议直接编辑) */
  themeColors?: ThemeColors;
  /** 字体族 */
  fontFamily?: {
    sans?: string;
    mono?: string;
  };
  /** 最后变更时间 */
  updatedAt: number;
}
```

---

### IDE 类型 (ide-types, ide-layout-types)

#### 来源：`./ide/ide-layout-types.ts`

```typescript
// 底部面板 Tab 键
export type BottomTabKey = 'terminal' | 'problems' | 'output' | 'debug' | 'extensions';

// 布局切片状态
export interface LayoutSlice {
  leftPanelWidth: number;           // 像素
  rightPanelWidth: number;
  bottomPanelHeight: number;
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  bottomPanelVisible: boolean;
  activeBottomTab: BottomTabKey;
  splitMode: 'none' | 'horizontal' | 'vertical';
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setPanelSize: (p: 'left' | 'right' | 'bottom', size: number) => void;
  setActiveBottomTab: (t: BottomTabKey) => void;
  setSplitMode: (m: LayoutSlice['splitMode']) => void;
}
```

#### 来源：`./ide/ide-types.ts` (核心类型节选)

```typescript
// ============ 文件系统 ============
export type FileNodeType = 'file' | 'folder' | 'symlink';
export type FileStatus = 'M' | 'A' | 'D' | 'U' | 'R' | 'C' | null;  // Git 状态

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: FileNodeType;
  extension?: string;
  language?: string;
  size?: number;
  modifiedAt?: number;
  children?: FileNode[];
  expanded?: boolean;
  status?: FileStatus;
}

// ============ 工作区 Tab ============
export interface WorkspaceTab {
  id: string;
  title: string;
  path: string;
  language?: string;
  icon?: React.ComponentType<{ className?: string }>;
  dirty: boolean;              // 是否未保存
  content: string;
  lastModified: number;
  pinned?: boolean;
  preview?: boolean;           // 预览模式 (单击打开)
}

// ============ 问题面板 ============
export type ProblemSeverity = 'error' | 'warning' | 'info' | 'hint';

export interface IDEProblem {
  id: string;
  severity: ProblemSeverity;
  message: string;
  ruleId?: string;
  source?: string;             // ESLint / TS / Build
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

// ============ 通知 ============
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'collaboration';
export type NotificationCategory = 'system' | 'deploy' | 'ai' | 'collaboration' | 'all';

export interface IDENotification {
  id: string;
  type: NotificationType;
  category: Exclude<NotificationCategory, 'all'>;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  source?: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'danger';
  }[];
}

// ============ GPU 节点 ============
export type GPUStatus = 'online' | 'busy' | 'offline' | 'degraded';

export interface GPUNode {
  id: string;
  name: string;
  model: string;                       // e.g. "NVIDIA H100 80GB"
  status: GPUStatus;
  utilization: number;                 // 0-100
  vramUsed: number;                    // GB
  vramTotal: number;                   // GB
  powerDraw: number;                   // Watt
  powerLimit: number;                  // Watt
  tempCore: number;                    // Celsius
  tempHotspot?: number;
  fanspeed?: number;                   // 0-100 %
  tflopsFP16?: number;
  tflopsFP32?: number;
  tflopsTensor?: number;
  updatedAt: number;
}

// ============ 扩展 ============
export interface ExtensionDef {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  icon?: string;
  category: 'theme' | 'language' | 'debugger' | 'snippets' | 'other';
  installed: boolean;
  enabled: boolean;
  downloads: number;
  rating: number;                      // 0-5
  hasUpdate?: boolean;
  sizeBytes?: number;
}

// ============ 部署 ============
export type DeployEnv = 'development' | 'staging' | 'production';
export type DeployMode = 'all' | 'blue-green' | 'canary' | 'rollback';

export interface DeployConfig {
  env: DeployEnv;
  mode: DeployMode;
  modules: string[];
  canaryPercentage?: number;
  productionConfirmText?: string;
}

// ============ 分享 ============
export type ShareContentType = 'file' | 'snippet' | 'workspace-snapshot';
export type SharePermission = 'edit' | 'read';
export type ShareExpiry = '1h' | '24h' | '7d' | 'never';

export interface ShareContent {
  type: ShareContentType;
  file?: string;
  code?: string;
  language?: string;
  workspaceId?: string;
}

export interface ShareResult {
  id: string;
  url: string;
  permission: SharePermission;
  expiry: ShareExpiry;
  createdAt: number;
  password?: boolean;
}
```

---

<div align="center">

---

**[⬆ 返回顶部](#-目录--table-of-contents)** · **[README.md](./README.md)** · **[COMPONENTS.md](./COMPONENTS.md)** · **[DEV-GUIDE.md](../../src/app/modules/dev/DEV-GUIDE.md)**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
