/**
 * @file: local-knowledge-base.ts
 * @description: 本地开发知识库 — 结构化知识管理与关键词检索
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [lib],[knowledge-base],[local],[retrieval]
 *
 * @brief: 面向本地开发场景的结构化知识检索服务
 * @details:
 * - 内置 YYC³ 项目核心知识条目（React/TS/Vite/Electron/Store 等）
 * - 支持关键词检索 + 分类过滤
 * - 可扩展加载外部知识库目录
 * - 零外部依赖，纯 TypeScript
 */

export interface DevKnowledgeArticle {
  id: string;
  category: DevKnowledgeCategory;
  title: string;
  summary: string;
  content: string;
  keywords: string[];
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  relatedArticles: string[];
  codeExample?: string;
}

export type DevKnowledgeCategory =
  | "react"
  | "typescript"
  | "vite"
  | "electron"
  | "state-management"
  | "tailwind"
  | "testing"
  | "architecture"
  | "devops"
  | "ai-integration"
  | "project-specific";

export interface KnowledgeSearchResult {
  article: DevKnowledgeArticle;
  score: number;
  matchedKeywords: string[];
}

const KB: DevKnowledgeArticle[] = [
  {
    id: "dev-react-19",
    category: "react",
    title: "React 19 核心特性与最佳实践",
    summary: "React 19 新特性：Actions、use() Hook、Server Components、改进的 Suspense",
    content: `React 19 引入了多项重大改进：

**Actions**: 表单提交和服务端交互的新范式
- useActionState() 替代 useState 管理异步状态
- useOptimistic() 实现乐观更新
- useFormStatus() 获取表单提交状态

**use() Hook**: 在渲染期间读取 Promise 和 Context
- 替代 useContext + useState 的组合模式
- 支持 Suspense 集成

**改进的 Suspense**: 更好的流式 SSR 支持
- 与 Server Components 深度集成
- 支持部分水合

**YYC³ 项目实践**:
- 使用 React 19.2.4 + createHashRouter
- 组件统一使用函数式 + hooks 模式
- GlassCard 作为标准卡片容器`,
    keywords: ["react", "hooks", "actions", "suspense", "component", "函数组件", "useActionState"],
    tags: ["frontend", "react-19", "core"],
    difficulty: "intermediate",
    relatedArticles: ["dev-ts-strict", "dev-state-zustand"],
    codeExample: `import { useState, useContext, memo } from "react";

interface Props {
  title: string;
  onAction?: (id: string) => void;
}

export default function MyComponent({ title, onAction }: Props) {
  const [data, setData] = useState<string>("");
  return <div onClick={() => onAction("id")}>{title}</div>;
}`,
  },
  {
    id: "dev-ts-strict",
    category: "typescript",
    title: "TypeScript 5.9 严格模式配置与类型安全",
    summary: "YYC³ 项目使用 TypeScript strict 模式，类型定义拆分为30+领域独立文件",
    content: `TypeScript 严格模式配置要点：

**tsconfig.json 核心配置**:
- strict: true — 启用所有严格检查
- noUnusedLocals / noUnusedParameters — 禁止未使用变量
- 未使用参数用 _ 前缀标记

**类型组织架构**:
- 所有类型定义在 src/app/types/ 目录
- index.ts 作为 barrel re-export
- 每个领域一个独立文件（30+ 类型文件）
- 组件从此文件统一导入: import type { X } from "../types"

**关键类型模式**:
- Discriminated Union: 使用 kind/type 字段区分变体
- Brand Type: 防止原始类型混用
- Template Literal Type: 路由路径类型安全

**禁止 any**: ESLint 配置 any 为 warning，使用 unknown + 类型守卫替代`,
    keywords: ["typescript", "类型", "strict", "interface", "type", "泛型", "type guard"],
    tags: ["typescript", "quality", "types"],
    difficulty: "advanced",
    relatedArticles: ["dev-react-19", "dev-state-zustand"],
  },
  {
    id: "dev-state-zustand",
    category: "state-management",
    title: "Zustand 统一状态管理 — 20个 Slice 架构",
    summary: "全部状态通过 Zustand Store Slice 管理，支持 persist middleware 自动持久化",
    content: `Zustand Store 架构：

**核心原则**:
- 单一数据源: store/index.ts 统一导出
- 每个 Slice 独立: 20 个 Slice 文件在 store/slices/
- persist middleware: 自动同步到 localStorage
- useShallow: 避免全量订阅导致的重渲染

**Slice 列表**:
- useNodeSlice: 节点数据 (persist)
- useMetricsSlice: 图表指标 (persist)
- useModelSlice: 模型配置 (persist)
- useFollowUpSlice: 跟进数据 (persist)
- useUserMgmtSlice: 用户管理 (persist)
- useAISuggestionSlice: AI 分析结果 (persist)
- useSDKSessionSlice: SDK 对话会话 (persist)
- useFamilyMemberSlice: AI Family 成员 (persist)
- ... 等 20 个

**数据流**:
WebSocket → DataBus → useNodeSlice → React Component

**使用模式**:
const { nodes, derived } = useNodeSlice(useShallow((s) => ({ nodes: s.nodes, derived: s.derived })));`,
    keywords: ["zustand", "store", "state", "slice", "persist", "状态管理", "数据流"],
    tags: ["state", "architecture", "store"],
    difficulty: "intermediate",
    relatedArticles: ["dev-react-19", "dev-databus"],
    codeExample: `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MySlice {
  items: Item[];
  addItem: (item: Item) => void;
}

export const useMySlice = create<MySlice>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
    }),
    { name: 'yyc3-my-slice' }
  )
);`,
  },
  {
    id: "dev-databus",
    category: "architecture",
    title: "DataBus 数据总线 — 全局数据合并/校验/分发",
    summary: "DataBus 是所有数据变更的唯一调度中枢，支持智能合并和冲突解决",
    content: `DataBus 核心架构：

**三类数据源**:
1. WebSocket 推送 — 实时遥测数据
2. UI 用户编辑 — 手动修改配置
3. Simulation/Initialization — 模拟数据和初始化

**合并策略**:
- ws_priority: 遥测字段（GPU/MEM/Temp）跟随 WS
- user_priority: 编辑字段（status/model）保留用户值
- timestamp_win: 时间戳胜出
- shallow_replace: 浅替换

**事件系统**:
- subscribe(entity, listener) — 订阅变更
- publish(event) — 发布变更
- 事件历史最多保留 200 条

**WebSocket 同步引擎**:
- 自动重连 + 心跳保活
- 离线队列 + 上线自动补发
- 推送节流 + 批量合并`,
    keywords: ["databus", "数据总线", "websocket", "合并", "冲突", "事件", "实时"],
    tags: ["architecture", "data-flow", "realtime"],
    difficulty: "advanced",
    relatedArticles: ["dev-state-zustand", "dev-storage"],
  },
  {
    id: "dev-storage",
    category: "architecture",
    title: "双层存储架构 — localStorage + IndexedDB",
    summary: "轻量配置存 localStorage，大数据持久化存 IndexedDB，支持 BroadcastChannel 跨标签页同步",
    content: `存储架构：

**localStorage (轻量配置 < 5KB)**:
- 认证/语言/网络/主题设置
- Zustand persist 自动同步

**IndexedDB (大数据 yyc3_matrix)**:
- 22 个 Object Store
- alertRules, patrolHistory, loopHistory, operationTemplates
- operationLogs, diagnosisHistory, reports, errorLog
- dashboardSnapshots, fileVersions, dbConnections
- queryHistory, committedChanges, agent_memories
- family_messages, family_activities, family_memories

**全量备份 (full-backup.ts)**:
- exportFullBackup() — 导出所有存储层数据
- importFullBackup() — 逐层还原
- 支持版本兼容迁移

**跨标签页同步**:
- BroadcastChannel API
- state-sync-manager.ts 状态同步管理器`,
    keywords: ["storage", "indexeddb", "localstorage", "备份", "持久化", "存储"],
    tags: ["storage", "persistence", "offline"],
    difficulty: "intermediate",
    relatedArticles: ["dev-databus", "dev-state-zustand"],
  },
  {
    id: "dev-ide-architecture",
    category: "project-specific",
    title: "YYC³ IDE 模块架构",
    summary: "IDE 模块包含可分割面板、AI Chat、文件浏览器、代码预览、终端等完整组件",
    content: `IDE 模块组件结构：

**核心组件 (src/app/components/ide/)**:
- IDELayout.tsx — 主布局，包含 SplitContainer 可拖拽分割
- IDETopBar.tsx — 顶部导航栏
- IDEViewSwitcher.tsx — 视图模式切换
- AIChatPanel.tsx — AI 对话面板（支持解释/修复/优化/测试/重构/生成）
- FileExplorer.tsx — 文件浏览器
- CodePreviewPanel.tsx — 代码预览
- IDETerminal.tsx — 内嵌终端
- IDEStatusBar.tsx — 状态栏
- Workspace.tsx — 12x12 网格工作区
- PanelContainer.tsx — 可拖拽面板容器

**IDE 设置 (useIDESettingsSlice)**:
- persist 到 localStorage
- 字体大小、主题、面板布局偏好

**AI 快捷操作**:
- explain: 解释代码
- fix: 修复 Bug
- optimize: 性能优化
- test: 生成测试
- refactor: 代码重构
- generate: 代码生成`,
    keywords: ["ide", "编辑器", "代码", "面板", "split", "workspace", "文件浏览器"],
    tags: ["ide", "ui", "components"],
    difficulty: "intermediate",
    relatedArticles: ["dev-terminal", "dev-ai-sdk"],
  },
  {
    id: "dev-terminal",
    category: "project-specific",
    title: "YYC³ 终端模块 — CPIM CLI 命令体系",
    summary: "内置命令行终端，支持 cpim/node/model/alerts/patrol/report/config/env/goto/ai 等命令",
    content: `终端命令体系：

**核心命令**:
- cpim status — 系统总览
- cpim node [GPU-xxx|restart|--all|--force] — 节点管理
- cpim model [deploy|list|migrate|status] — 模型管理
- cpim alerts [--unresolved|--critical|--all] — 告警查看
- cpim patrol [run|--full|--quick|history|status] — 巡查执行
- cpim report [--type|--format|--output] — 报告生成
- config [set|get|list] — 配置管理
- env [list|get|set|reset|export] — 环境变量

**导航命令**:
- goto <path> — 跳转到指定页面
- open <path> — 打开指定模块

**AI 自然语言**:
- ai <中文描述> — 自然语言转 CLI 命令
- 支持模糊匹配: "查看节点状态" → cpim node

**系统命令**:
- clear — 清屏
- help — 帮助
- Tab — 自动补全
- ↑/↓ — 历史命令`,
    keywords: ["terminal", "终端", "cli", "命令", "cpim", "console", "shell"],
    tags: ["terminal", "cli", "tools"],
    difficulty: "beginner",
    relatedArticles: ["dev-ide-architecture", "dev-ai-sdk"],
  },
  {
    id: "dev-ai-sdk",
    category: "ai-integration",
    title: "AI 模型集成 — useBigModelSDK + MCP Agent",
    summary: "支持 Ollama/OpenAI/智谱/DeepSeek/Kimi/火山引擎等多提供商，MCP Agent 工具调用",
    content: `AI 集成架构：

**useBigModelSDK Hook**:
- 支持 9 个 AI 提供商
- Ollama 本地模型（localhost:11434）
- 智谱 GLM（zhipu/zhipu-plan）
- OpenAI 兼容接口
- DeepSeek、Kimi、火山引擎
- 流式/非流式聊天
- 自动保存会话到 useSDKSessionSlice

**MCP Server (Model Context Protocol)**:
- 浏览器端本地 MCP 服务
- 8 位 AI 成员作为 Agent 注册
- 工具注册/验证/执行
- 上下文窗口管理
- 统一事件分发

**AI 智能模块**:
- AISuggestionPanel: 模式分析 + 行动建议
- AIDiagnostics: 异常模式检测 + 预测性分析
- SDKChatPanel: 通用 AI 对话界面

**提供商能力矩阵**:
- chat / chat-stream: 全部支持
- code-gen: zhipu/openai/ollama/deepseek
- knowledge-base: zhipu
- image-gen: zhipu/openai`,
    keywords: ["ai", "sdk", "模型", "ollama", "openai", "zhipu", "deepseek", "mcp", "agent"],
    tags: ["ai", "sdk", "integration"],
    difficulty: "advanced",
    relatedArticles: ["dev-terminal", "dev-ide-architecture"],
  },
  {
    id: "dev-vite-config",
    category: "vite",
    title: "Vite 7 构建配置要点",
    summary: "Vite 7.3 配置：Hash路由兼容、手动分块、Electron集成、生产优化",
    content: `Vite 配置关键项：

**基础配置**:
- base: "./" — Electron 兼容的相对路径
- server.port: 3218 — 开发服务器端口
- plugins: react() + tailwindcss()

**路径别名**:
- @/* → ./src/* — 简化导入路径

**构建优化**:
- manualChunks: 手动分块
  - react-vendor, mui-vendor, radix-vendor
  - chart-vendor, util-vendor
- minify: esbuild — 生产压缩
- drop_console: true — 移除 console/debugger

**Electron 集成**:
- 多 TypeScript 配置文件
- electron-builder 多平台构建
- Auto-updater GitHub releases 集成`,
    keywords: ["vite", "构建", "配置", "build", "chunk", "bundle", "打包"],
    tags: ["vite", "build", "config"],
    difficulty: "intermediate",
    relatedArticles: ["dev-react-19", "dev-electron"],
  },
  {
    id: "dev-electron",
    category: "electron",
    title: "Electron 28 桌面端集成",
    summary: "Electron 桌面应用：BrowserWindow安全配置、IPC通信、自动更新、系统托盘",
    content: `Electron 集成要点：

**主进程 (electron/main.ts)**:
- BrowserWindow 安全设置
  - contextIsolation: true
  - nodeIntegration: false
  - sandbox: true
- 系统托盘 (Tray)
- 原生通知
- 自动更新器 (electron-updater)

**预加载脚本 (electron/preload.ts)**:
- contextBridge 暴露安全 API
- IPC 双向通信

**构建命令**:
- pnpm build:mac — macOS (arm64 + x64)
- pnpm build:win — Windows (x64, NSIS)
- pnpm build:linux — Linux (AppImage + deb)

**开发模式**:
- pnpm electron:dev — 启动 Electron 开发模式`,
    keywords: ["electron", "桌面", "desktop", "ipc", "tray", "自动更新", "native"],
    tags: ["electron", "desktop", "native"],
    difficulty: "intermediate",
    relatedArticles: ["dev-vite-config"],
  },
  {
    id: "dev-testing",
    category: "testing",
    title: "测试体系 — Vitest + React Testing Library",
    summary: "Vitest jsdom 环境，200+测试文件，覆盖组件/Store/Hook/Lib",
    content: `测试架构：

**框架**: Vitest + @testing-library/react
**环境**: jsdom
**覆盖率**: ~14% (阈值 10%)

**测试文件位置**: src/app/__tests__/
- 组件测试: ComponentName.test.tsx
- Store 测试: store/xxx-slice.test.ts
- Hook 测试: useXxx.test.ts(x)
- Lib 测试: lib/xxx.test.ts

**Mock 指南**:
- Recharts: 必须在 @vitest-environment jsdom 中 mock
- React Router: mock useNavigate/useLocation
- Context: 使用 Provider wrapper
- 自定义 Hook: vi.mock 隔离

**运行命令**:
- pnpm test — 运行测试
- pnpm test:watch — 监听模式
- pnpm test:coverage — 覆盖率报告
- pnpm test:ci — CI 模式 (4 shards)`,
    keywords: ["test", "测试", "vitest", "coverage", "mock", "单元测试"],
    tags: ["testing", "quality", "vitest"],
    difficulty: "beginner",
    relatedArticles: ["dev-react-19", "dev-ts-strict"],
  },
  {
    id: "dev-i18n",
    category: "project-specific",
    title: "国际化 i18n 体系",
    summary: "useI18n Hook 支持中英文切换，嵌套 key + 模板变量",
    content: `国际化架构：

**Hook**: useI18n()
- t(key, vars?) — 翻译函数
- locale / setLocale — 当前语言/切换
- locales — 可用语言列表

**翻译文件**:
- src/app/i18n/zh-CN.ts — 中文
- src/app/i18n/en-US.ts — 英文

**使用模式**:
- 简单: t("nav.dataMonitor")
- 带变量: t("common.nMinutesAgo", { n: 5 })
- 嵌套: t("settings.model.aiTemperature")

**存储**: yyc3_locale localStorage key`,
    keywords: ["i18n", "国际化", "翻译", "locale", "语言", "中文", "english"],
    tags: ["i18n", "locale", "ux"],
    difficulty: "beginner",
    relatedArticles: ["dev-react-19"],
  },
];

// ============================================================
// 检索引擎
// ============================================================

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function searchKnowledge(
  query: string,
  options?: {
    category?: DevKnowledgeCategory;
    limit?: number;
    threshold?: number;
  },
): KnowledgeSearchResult[] {
  const limit = options?.limit ?? 5;
  const threshold = options?.threshold ?? 0.1;
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {return [];}

  const results: KnowledgeSearchResult[] = [];

  for (const article of KB) {
    if (options?.category && article.category !== options.category) {continue;}

    const allText = `${article.title} ${article.summary} ${article.content} ${article.keywords.join(" ")} ${article.tags.join(" ")}`;
    const articleTokens = new Set(tokenize(allText));

    let matchCount = 0;
    const matched: string[] = [];

    for (const qt of queryTokens) {
      for (const at of articleTokens) {
        if (at === qt || at.startsWith(qt) || qt.startsWith(at)) {
          matchCount++;
          matched.push(qt);
          break;
        }
      }
    }

    if (matchCount > 0) {
      const score = matchCount / queryTokens.length;
      if (score >= threshold) {
        results.push({ article, score, matchedKeywords: matched });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function getArticleById(id: string): DevKnowledgeArticle | undefined {
  return KB.find((a) => a.id === id);
}

export function getArticlesByCategory(category: DevKnowledgeCategory): DevKnowledgeArticle[] {
  return KB.filter((a) => a.category === category);
}

export function getAllCategories(): DevKnowledgeCategory[] {
  return [...new Set(KB.map((a) => a.category))];
}

export function getKnowledgeStats(): { totalArticles: number; categories: number; totalKeywords: number } {
  return {
    totalArticles: KB.length,
    categories: new Set(KB.map((a) => a.category)).size,
    totalKeywords: KB.reduce((sum, a) => sum + a.keywords.length, 0),
  };
}

export function formatSearchResultForAI(results: KnowledgeSearchResult[]): string {
  if (results.length === 0) {
    return "未在本地知识库中找到相关内容。";
  }
  return results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.article.title} (相关度: ${Math.round(r.score * 100)}%)\n${r.article.summary}\n关键词: ${r.matchedKeywords.join(", ")}`,
    )
    .join("\n\n");
}

export const KnowledgeBaseAPI = {
  search: searchKnowledge,
  getById: getArticleById,
  getByCategory: getArticlesByCategory,
  getCategories: getAllCategories,
  getStats: getKnowledgeStats,
  formatForAI: formatSearchResultForAI,
};
