# YYC³ CloudPivot Intelli-Matrix 代码编辑工具改造提示文档

> **文档版本**: v1.0
> **生成日期**: 2026-03-08
> **目标**: 将现有 IDE 面板改造为功能完整的代码编辑工具

---

## 📋 目录

1. [现状分析](#现状分析)
2. [改造目标](#改造目标)
3. [功能需求](#功能需求)
4. [技术方案](#技术方案)
5. [实施步骤](#实施步骤)
6. [对接说明](#对接说明)

---

## 现状分析

### 当前 IDEPanel 功能

**文件位置**: [`src/app/components/IDEPanel.tsx`](file:///Users/yanyu/Documents/YYC3-CloudPivot-Intelli-Matrix/src/app/components/IDEPanel.tsx)

**现有功能**:
- 📊 **数据监控 Tab**: 显示节点状态列表（模拟数据）
- 🔔 **告警 Tab**: 显示告警列表（模拟数据）
- ⚙️ **操作 Tab**: 快捷操作按钮（重启节点、清理缓存、导出日志、生成报告）
- 📝 **日志 Tab**: 显示系统日志（模拟数据）

**问题分析**:
1. ❌ **功能重复**: 数据监控、告警、日志等功能在主界面已有完整实现
2. ❌ **模拟数据**: 所有数据都是硬编码的 mock 数据，与实际系统无关
3. ❌ **定位模糊**: 作为一个"IDE 面板"，却不具备代码编辑能力
4. ❌ **用户价值低**: 用户无法在此进行实际的开发工作

---

## 改造目标

### 核心目标

将 IDEPanel 从"监控面板"改造为"代码编辑工具"，使其具备以下能力：

1. ✅ **代码编辑**: 支持多种编程语言的代码编辑
2. ✅ **文件管理**: 浏览、创建、编辑、删除本地文件
3. ✅ **智能提示**: 代码补全、语法高亮、错误提示
4. ✅ **多标签页**: 同时编辑多个文件
5. ✅ **终端集成**: 内置终端，执行命令
6. ✅ **Git 集成**: 版本控制、提交、推送
7. ✅ **AI 辅助**: 集成 AI 代码助手（基于现有的 AI 功能）

---

## 功能需求

### 一、核心编辑功能

#### 1.1 代码编辑器

**功能描述**:
- 支持多种编程语言（TypeScript、JavaScript、Python、Go、Rust 等）
- 语法高亮
- 代码折叠
- 行号显示
- 括号匹配
- 自动缩进
- 多光标编辑

**技术选型**:
- **Monaco Editor** (VS Code 核心) ⭐⭐⭐⭐⭐
  - 优势: 功能强大、性能优秀、VS Code 同源
  - 劣势: 体积较大（~3MB）
- **CodeMirror 6** ⭐⭐⭐⭐
  - 优势: 轻量级、模块化、性能好
  - 劣势: 功能相对简单
- **Ace Editor** ⭐⭐⭐
  - 优势: 成熟稳定、兼容性好
  - 劣势: 性能一般、维护较少

**推荐**: Monaco Editor（与 VS Code 体验一致）

---

#### 1.2 文件树和文件管理

**功能描述**:
- 显示项目文件树
- 支持文件/文件夹的创建、删除、重命名
- 支持文件拖拽
- 文件搜索和过滤
- 右键菜单操作

**界面设计**:
```
┌─────────────────────────────────────────────────────────┐
│  📁 yyc3-cloudpivot                             │
│    📁 src                                         │
│      📁 app                                       │
│        📁 components                               │
│          📄 Dashboard.tsx                          │
│          📄 IDEPanel.tsx ← 当前编辑               │
│        📁 hooks                                   │
│          📄 useModelProvider.ts                   │
│      📄 package.json                              │
│      📄 tsconfig.json                             │
│    📁 docs                                        │
│      📄 README.md                                 │
└─────────────────────────────────────────────────────────┘
```

---

#### 1.3 多标签页编辑

**功能描述**:
- 支持同时打开多个文件
- 标签页切换
- 标签页关闭
- 标签页拖拽排序
- 未保存提示

**界面设计**:
```
┌─────────────────────────────────────────────────────────┐
│  Dashboard.tsx │ IDEPanel.tsx │ useModelProvider.ts │
│  [✓]            [●]            [ ]                  │
├─────────────────────────────────────────────────────────┤
│  1  │ import React, { useState } from "react";    │
│  2  │ import { Monitor, AlertTriangle } from "lucide-react"; │
│  3  │                                            │
│  4  │ export default function IDEPanel() {         │
│  5  │   const [activeTab, setActiveTab] = useState("monitor"); │
│  6  │                                            │
│  7  │   return (                                 │
│  8  │     <div className="space-y-4">            │
│  9  │       {/* ... */}                           │
│ 10  │     </div>                                  │
│ 11  │   );                                        │
│ 12  │ }                                            │
└─────────────────────────────────────────────────────────┘
```

---

### 二、智能辅助功能

#### 2.1 代码补全和智能提示

**功能描述**:
- 基于上下文的代码补全
- 函数参数提示
- 类型提示
- 导入建议
- 自动导入

**技术实现**:
```typescript
// 使用 Monaco Editor 的内置 IntelliSense
import * as monaco from 'monaco-editor';

// 配置 TypeScript 语言服务
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2020,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  jsx: monaco.languages.typescript.JsxEmit.React,
  jsxImportSource: 'react',
});

// 配置自动导入
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
});
```

---

#### 2.2 AI 代码助手

**功能描述**:
- 基于现有 AI 功能的代码助手
- 代码生成
- 代码优化建议
- 代码解释
- 错误修复建议

**集成方案**:
```typescript
// 复用现有的 AI 功能
import { useBigModelSDK } from "../hooks/useBigModelSDK";

interface AIAssistant {
  generateCode(prompt: string): Promise<string>;
  optimizeCode(code: string): Promise<string>;
  explainCode(code: string): Promise<string>;
  fixError(error: string, code: string): Promise<string>;
}

// 在代码编辑器中集成
function CodeEditorWithAI() {
  const { generateResponse } = useBigModelSDK();

  const handleAIAssist = async (selection: string) => {
    const prompt = `请优化以下代码：\n${selection}`;
    const optimized = await generateResponse(prompt);
    // 应用优化后的代码
  };

  return <MonacoEditor onSelectionChange={handleAIAssist} />;
}
```

---

#### 2.3 代码格式化和 Lint

**功能描述**:
- 自动代码格式化
- 代码风格检查
- 错误提示
- 快速修复

**技术实现**:
```typescript
// 集成 Prettier 和 ESLint
import prettier from 'prettier';
import eslint from 'eslint';

async function formatCode(code: string, language: string): Promise<string> {
  const formatted = await prettier.format(code, {
    parser: language === 'typescript' ? 'typescript' : 'babel',
    semi: true,
    singleQuote: false,
    tabWidth: 2,
  });
  return formatted;
}

async function lintCode(code: string): Promise<LintResult[]> {
  const result = await eslint.lintText(code);
  return result.results[0].messages;
}
```

---

### 三、高级功能

#### 3.1 终端集成

**功能描述**:
- 内置终端
- 支持多终端标签
- 命令历史
- 命令自动补全

**技术实现**:
```typescript
// 使用 xterm.js
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

function IntegratedTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', monospace",
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    return () => terminal.dispose();
  }, []);

  return <div ref={terminalRef} className="terminal-container" />;
}
```

---

#### 3.2 Git 集成

**功能描述**:
- 显示 Git 状态
- 文件变更标记
- 提交、推送、拉取
- 分支切换
- 合并冲突解决

**界面设计**:
```
┌─────────────────────────────────────────────────────────┐
│  Git: main (↑2 ↓0)                              │
├─────────────────────────────────────────────────────────┤
│  📁 src                                          │
│    📁 app                                        │
│      📄 Dashboard.tsx                              │
│      📄 IDEPanel.tsx (M) ← 已修改               │
│      📄 useModelProvider.ts (A) ← 已添加         │
│    📄 package.json                                │
└─────────────────────────────────────────────────────────┘

操作面板:
[提交] [推送] [拉取] [分支] [历史]
```

---

#### 3.3 调试支持

**功能描述**:
- 断点设置
- 变量查看
- 调用栈
- 单步执行
- 表达式求值

**技术实现**:
```typescript
// 使用 Chrome DevTools Protocol
import { launch, Chrome } from 'chrome-launcher';
import CDP from 'chrome-remote-interface';

async function startDebugging() {
  const chrome = await launch({
    chromeFlags: ['--remote-debugging-port=9222'],
  });

  const protocol = await CDP({ port: 9222 });
  const { Debugger } = protocol;

  await Debugger.enable();
  await Debugger.pause();

  // 设置断点
  await Debugger.setBreakpointByUrl({
    lineNumber: 10,
    url: 'http://localhost:3218/src/app/components/IDEPanel.tsx',
  });
}
```

---

## 技术方案

### 技术栈选型

| 功能 | 技术选型 | 说明 |
|------|---------|------|
| **代码编辑器** | Monaco Editor | VS Code 核心，功能强大 |
| **终端** | xterm.js | 功能完善的终端模拟器 |
| **Git 集成** | isomorphic-git | 纯 JavaScript Git 实现 |
| **代码格式化** | Prettier | 代码格式化工具 |
| **代码检查** | ESLint | JavaScript/TypeScript 代码检查 |
| **AI 助手** | 复用现有 AI 功能 | useBigModelSDK |
| **文件系统** | Electron API | 本地文件访问 |

---

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│  IDEPanel (代码编辑工具)                            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │  文件树 (FileTree)                        │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  标签页栏 (TabBar)                       │   │
│  │  [Dashboard.tsx] [IDEPanel.tsx] [...]      │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  代码编辑器 (Monaco Editor)               │   │
│  │  - 语法高亮                               │   │
│  │  - 代码补全                               │   │
│  │  - 错误提示                               │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  终端面板 (Terminal)                      │   │
│  │  $ npm run dev                           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AI 助手面板 (AIAssistant)               │   │
│  │  💡 代码优化建议...                       │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Git 面板 (GitPanel)                     │   │
│  │  Git: main (↑2 ↓0)                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

### 组件结构

```
src/app/components/IDE/
├── IDEPanel.tsx              # 主面板组件
├── FileTree.tsx              # 文件树组件
├── TabBar.tsx               # 标签页栏组件
├── CodeEditor.tsx            # 代码编辑器组件
├── TerminalPanel.tsx         # 终端面板组件
├── AIAssistantPanel.tsx      # AI 助手面板组件
├── GitPanel.tsx             # Git 面板组件
└── hooks/
    ├── useFileTree.ts        # 文件树逻辑
    ├── useEditor.ts         # 编辑器逻辑
    ├── useTerminal.ts       # 终端逻辑
    └── useGit.ts           # Git 逻辑
```

---

## 实施步骤

### 第一阶段：核心功能（2 周）

**目标**: 实现基本的代码编辑和文件管理功能

**任务**:
1. ✅ 集成 Monaco Editor
2. ✅ 实现文件树和文件管理
3. ✅ 实现多标签页编辑
4. ✅ 实现基本的文件读写操作

**交付物**:
- 基础代码编辑器
- 文件管理功能
- 多标签页支持

---

### 第二阶段：智能辅助（2 周）

**目标**: 添加代码补全、格式化和 AI 助手

**任务**:
1. ✅ 集成 TypeScript 语言服务
2. ✅ 实现代码补全和智能提示
3. ✅ 集成 Prettier 和 ESLint
4. ✅ 集成 AI 代码助手

**交付物**:
- 智能代码补全
- 代码格式化和检查
- AI 代码助手

---

### 第三阶段：高级功能（2 周）

**目标**: 添加终端、Git 集成和调试支持

**任务**:
1. ✅ 集成 xterm.js 终端
2. ✅ 集成 isomorphic-git
3. ✅ 实现调试支持
4. ✅ 优化性能和用户体验

**交付物**:
- 内置终端
- Git 集成
- 调试支持

---

## 对接说明

### 与现有功能的对接

#### 1. AI 功能对接

**现有 AI 功能**:
- `useBigModelSDK`: 大模型 SDK
- `useModelProvider`: 模型提供者管理
- `AISuggestionPanel`: AI 建议面板

**对接方案**:
```typescript
// 在 IDEPanel 中复用现有的 AI 功能
import { useBigModelSDK } from "../hooks/useBigModelSDK";
import { useModelProvider } from "../hooks/useModelProvider";

function AIAssistantPanel() {
  const { generateResponse } = useBigModelSDK();
  const { selectedModel } = useModelProvider();

  const handleCodeGeneration = async (prompt: string) => {
    const response = await generateResponse({
      model: selectedModel,
      prompt,
      temperature: 0.7,
    });
    return response.content;
  };

  return <div>{/* AI 助手界面 */}</div>;
}
```

---

#### 2. 文件系统对接

**现有文件系统功能**:
- `useLocalFileSystem`: 本地文件系统管理
- `LocalFileManager`: 文件管理器组件

**对接方案**:
```typescript
// 在 IDEPanel 中复用现有的文件系统功能
import { useLocalFileSystem } from "../hooks/useLocalFileSystem";

function FileTree() {
  const { fileTree, readFile, writeFile, createFile, deleteFile } = useLocalFileSystem();

  const handleFileSelect = async (fileId: string) => {
    const content = await readFile(fileId);
    // 在编辑器中打开文件
  };

  const handleFileSave = async (fileId: string, content: string) => {
    await writeFile(fileId, content);
  };

  return <div>{/* 文件树界面 */}</div>;
}
```

---

#### 3. 系统设置对接

**现有系统设置功能**:
- `SystemSettings`: 系统设置组件
- `useNetworkConfig`: 网络配置

**对接方案**:
```typescript
// 在 IDEPanel 中读取系统设置
import { useNetworkConfig } from "../hooks/useNetworkConfig";

function CodeEditorSettings() {
  const { wsUrl, setWsUrl } = useNetworkConfig();

  return (
    <div>
      <label>WebSocket URL:</label>
      <input
        value={wsUrl}
        onChange={(e) => setWsUrl(e.target.value)}
      />
    </div>
  );
}
```

---

### 与新增功能的对接

#### 1. Agent 工作流对接

**新增功能**: AI Agent 工作流编排

**对接方案**:
```typescript
// 在 IDEPanel 中集成 Agent 工作流
import { useAgentWorkflow } from "../hooks/useAgentWorkflow";

function AgentWorkflowPanel() {
  const { workflows, runWorkflow } = useAgentWorkflow();

  const handleRunWorkflow = async (workflowId: string) => {
    const result = await runWorkflow(workflowId);
    // 在终端中显示执行结果
  };

  return <div>{/* Agent 工作流界面 */}</div>;
}
```

---

#### 2. 知识库对接

**新增功能**: 知识库和 RAG

**对接方案**:
```typescript
// 在 IDEPanel 中集成知识库搜索
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";

function KnowledgeSearch() {
  const { searchDocuments } = useKnowledgeBase();

  const handleSearch = async (query: string) => {
    const results = await searchDocuments(query);
    // 显示搜索结果
  };

  return <div>{/* 知识库搜索界面 */}</div>;
}
```

---

### 数据流对接

```
┌─────────────────────────────────────────────────────────┐
│  IDEPanel (代码编辑工具)                            │
├─────────────────────────────────────────────────────────┤
│  输入:                                            │
│  - 文件系统 (useLocalFileSystem)                    │
│  - AI 功能 (useBigModelSDK, useModelProvider)       │
│  - 系统设置 (useNetworkConfig)                     │
│  - Agent 工作流 (useAgentWorkflow)                  │
│  - 知识库 (useKnowledgeBase)                       │
│                                                     │
│  输出:                                            │
│  - 文件变更 (writeFile, createFile, deleteFile)      │
│  - AI 请求 (generateResponse)                       │
│  - Git 操作 (commit, push, pull)                    │
│  - 终端命令 (executeCommand)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 预期效果

### 功能对比

| 功能 | 改造前 | 改造后 |
|------|---------|--------|
| **代码编辑** | ❌ 不支持 | ✅ 支持（Monaco Editor） |
| **文件管理** | ❌ 不支持 | ✅ 支持（文件树） |
| **代码补全** | ❌ 不支持 | ✅ 支持（IntelliSense） |
| **AI 助手** | ❌ 不支持 | ✅ 支持（集成现有 AI） |
| **终端** | ❌ 不支持 | ✅ 支持（xterm.js） |
| **Git 集成** | ❌ 不支持 | ✅ 支持（isomorphic-git） |
| **调试** | ❌ 不支持 | ✅ 支持（CDP） |
| **多标签页** | ❌ 不支持 | ✅ 支持 |
| **代码格式化** | ❌ 不支持 | ✅ 支持（Prettier） |
| **代码检查** | ❌ 不支持 | ✅ 支持（ESLint） |

### 用户体验提升

- ✅ **开发效率**: 在应用内直接编辑代码，无需切换到外部编辑器
- ✅ **智能辅助**: AI 代码助手提供实时建议和优化
- ✅ **一体化**: 文件管理、编辑、终端、Git 集成在一个界面
- ✅ **本地优先**: 所有操作在本地完成，无需云端
- ✅ **实时反馈**: 即时的代码补全和错误提示

---

## 总结

### 改造要点

1. **移除冗余功能**: 删除数据监控、告警、日志等重复功能
2. **添加核心编辑功能**: 集成 Monaco Editor，实现代码编辑
3. **复用现有功能**: 对接 AI、文件系统、系统设置等现有功能
4. **集成新增功能**: 对接 Agent 工作流、知识库等新增功能
5. **优化用户体验**: 提供一体化的开发环境

### 实施周期

- **第一阶段**: 2 周（核心功能）
- **第二阶段**: 2 周（智能辅助）
- **第三阶段**: 2 周（高级功能）
- **总计**: 6 周

### 预期工作量

- **核心编辑功能**: 10 人天
- **智能辅助功能**: 10 人天
- **高级功能**: 10 人天
- **总计**: 30 人天

---

**文档结束**
