---
@file: 001-CP-IM-项目总览索引-项目总览手册.md
@description: YYC³-CP-IM 项目总览手册，包含项目介绍、技术栈、核心功能和架构设计
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-03-05
@updated: 2026-03-05
@status: published
@tags: [项目总览],[项目介绍],[技术栈]
---

# YYC³ CloudPivot Intelli-Matrix 项目总览手册

## 一、项目概述

### 1.1 项目简介

YYC³ CloudPivot Intelli-Matrix (CP-IM) 是一个基于 React 19 + TypeScript 的现代化智能监控与运维平台，专为 YYC³ Family 内部 AI 研发与运维团队设计。该系统集成了实时监控、智能巡查、AI 辅助决策、操作中心等核心功能，支持 Web、桌面端（Electron）和移动端多平台部署。

### 1.2 核心理念

**人机共生，智慧同行；以 AI 为魂，以流程为骨，以规范为脉。**

### 1.3 项目定位

| 维度 | 描述 |
|------|------|
| **目标用户** | YYC³ Family 内部 AI 研发与运维团队 |
| **应用场景** | 智能监控、运维管理、AI 辅助决策 |
| **部署方式** | Web 应用、桌面应用（Electron）、PWA 离线应用 |
| **技术特点** | 实时数据推送、AI 智能分析、赛博朋克设计 |

### 1.4 项目特色

- ✅ **开箱即用** - 完整的监控、巡查、操作中心功能
- ✅ **AI 驱动** - 集成 AI SDK，提供智能决策建议
- ✅ **跨平台** - 桌面端、平板、移动端完美适配
- ✅ **离线优先** - PWA 支持，无网络也能使用
- ✅ **类型安全** - TypeScript 严格模式，1267 个测试保障

---

## 二、技术架构

### 2.1 技术栈概览

#### 前端核心

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.2.4 | UI 框架，支持并发特性 |
| TypeScript | 5.9.3 | 类型安全，严格模式 |
| React Router | 7.13.1 | 路由管理（Hash 模式） |
| Vite | 7.3.1 | 极速构建工具 |

#### 样式与 UI

| 技术 | 版本 | 说明 |
|------|------|------|
| Tailwind CSS | 4.2.1 | 原子化 CSS，JIT 编译 |
| Motion | 12.34.5 | 高性能动画库 |
| Radix UI | 1.x | 无头组件库，可访问性优先 |
| MUI Material | 7.3.8 | Material Design 组件库 |
| Lucide Icons | 0.576.0 | 现代化图标库 |

#### 数据可视化

| 技术 | 版本 | 说明 |
|------|------|------|
| Recharts | 3.7.0 | 响应式图表库 |

#### 桌面应用

| 技术 | 版本 | 说明 |
|------|------|------|
| Electron | 28.0.0 | 跨平台桌面应用框架 |
| electron-updater | 6.1.0 | 自动更新功能 |

#### 认证与数据

| 技术 | 版本 | 说明 |
|------|------|------|
| Supabase | 2.98.0 | 认证与数据库服务 |

#### 测试与构建

| 技术 | 版本 | 说明 |
|------|------|------|
| Vitest | 最新 | 单元测试框架 |
| React Testing Library | 最新 | 测试工具 |
| ESLint | 最新 | 代码检查 |
| Prettier | 最新 | 代码格式化 |

### 2.2 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                   YYC³ CP-IM 系统架构                          │
├─────────────────────────────────────────────────────────────────┤
│  📱 表现层 (Presentation Layer)                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │ Desktop │ │ Tablet  │ │ Mobile  │                       │
│  └─────────┘ └─────────┘ └─────────┘                       │
├─────────────────────────────────────────────────────────────────┤
│  🎨 交互层 (Interaction Layer)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ React 19.2 + TypeScript Strict + React Router v7    │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  🎭 样式层 (Styling Layer)                                  │
│  ┌───────────┐ ┌─────────┐ ┌─────────────┐               │
│  │ Tailwind  │ │ Motion │ │ Radix UI    │               │
│  └───────────┘ └─────────┘ └─────────────┘               │
├─────────────────────────────────────────────────────────────────┤
│  📊 数据层 (Data Layer)                                     │
│  ┌───────────┐ ┌─────────┐ ┌─────────────┐               │
│  │ Recharts  │ │ Lucide  │ │ WebSocket   │               │
│  └───────────┘ └─────────┘ └─────────────┘               │
├─────────────────────────────────────────────────────────────────┤
│  🔧 工具层 (Utility Layer)                                  │
│  ┌───────────┐ ┌─────────┐ ┌─────────────┐               │
│  │ Vite     │ │ Vitest  │ │ Testing Lib │               │
│  └───────────┘ └─────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 核心特性

| 特性 | 说明 | 状态 |
|------|------|------|
| 🎨 **赛博朋克设计** | 深蓝 #060e1f + 青色 #00d4ff 视觉体系 | ✅ |
| 🚀 **实时监控** | WebSocket 实时推送，QPS/延迟/节点监控 | ✅ |
| 🤖 **AI 智能辅助** | 集成 AI SDK，智能决策建议 | ✅ |
| 📱 **响应式布局** | 完美支持桌面端、平板、移动端 | ✅ |
| 🌐 **PWA 离线** | 可离线使用，本地缓存数据 | ✅ |
| 🌍 **国际化** | 中文简体 / English (US) 双语言 | ✅ |
| 🎯 **Ghost Mode** | 开发便捷入口，跳过认证 | ✅ |
| 🔍 **智能巡查** | 自动化巡查计划与报告生成 | ✅ |
| 📊 **数据可视化** | Recharts 图表，实时趋势分析 | ✅ |
| 🔔 **告警系统** | 实时告警推送与处理 | ✅ |

---

## 三、核心功能模块

### 3.1 数据监控

- ✅ 实时节点状态监控（GPU/内存/温度）
- ✅ QPS 与延迟趋势图表
- ✅ 告警实时推送与处理
- ✅ 吞吐量历史数据

### 3.2 巡查管理

- ✅ 巡查计划调度
- ✅ 巡查报告生成
- ✅ 巡查历史记录
- ✅ 自动化巡查

### 3.3 操作中心

- ✅ 快速操作网格
- ✅ 操作模板管理
- ✅ 实时操作日志流
- ✅ 操作审计

### 3.4 AI 辅助

- ✅ AI 决策建议面板
- ✅ SDK 流式聊天
- ✅ 操作推荐引擎
- ✅ 模式分析器

### 3.5 系统设置

- ✅ 主题定制（6 套预设主题）
- ✅ 模型供应商管理
- ✅ 网络配置
- ✅ PWA 状态管理

---

## 四、项目结构

### 4.1 目录结构

```
YYC3-CloudPivot-Intelli-Matrix/
├── .github/                    # GitHub 配置
│   ├── workflows/             # CI/CD 工作流
│   └── ISSUE_TEMPLATE/        # Issue 模板
├── .vscode/                    # VSCode 配置
├── docs/                       # 详细文档
│   ├── 00-YYC³-CP-IM-项目总览索引/
│   ├── 01-YYC³-CP-IM-项目规划-启动阶段/
│   ├── 02-YYC³-CP-IM-项目规划-架构设计/
│   ├── 03-YYC³-CP-IM-项目开发-实施阶段/
│   ├── 05-YYC³-CP-IM-项目部署-文档闭环/
│   └── 06-YYC³-CP-IM-项目运营-维护阶段/
├── public/                     # 静态资源
├── src/
│   ├── app/
│   │   ├── __tests__/         # 测试文件
│   │   ├── components/        # 组件库（55+ 组件）
│   │   ├── hooks/             # 自定义 Hooks（19 个）
│   │   ├── i18n/              # 国际化语言包
│   │   ├── lib/               # 工具库
│   │   ├── types/             # 全局类型
│   │   ├── App.tsx            # 根组件
│   │   └── routes.ts          # 路由定义
│   ├── styles/
│   │   ├── index.css          # 主 CSS 入口
│   │   ├── tailwind.css       # Tailwind 导入
│   │   ├── theme.css          # CSS 自定义属性
│   │   └── fonts.css          # 字体声明
│   └── main.tsx               # 应用入口
├── electron/                   # Electron 主进程
│   ├── main.ts                # Electron 主进程
│   ├── preload.ts             # 预加载脚本
│   └── tsconfig.json         # Electron TypeScript 配置
├── .env.example                # 环境变量示例
├── .gitignore                  # Git 忽略文件
├── .prettierrc.json            # Prettier 配置
├── .eslintrc.json              # ESLint 配置
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile                  # Docker 构建文件
├── nginx.conf                  # Nginx 配置
├── package.json                # 依赖清单，脚本定义
├── pnpm-lock.yaml              # pnpm 锁定文件
├── README.md                   # 项目主文档
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 配置
└── vitest.config.ts            # Vitest 配置
```

### 4.2 核心文件说明

| 文件 | 说明 |
|------|------|
| `src/main.tsx` | 应用入口，ReactDOM.createRoot |
| `src/app/App.tsx` | 根组件，包含 Auth + Router |
| `src/app/routes.tsx` | 路由配置（Hash 模式） |
| `src/app/types/index.ts` | 全局类型定义 |
| `src/app/hooks/` | 自定义 Hooks（19 个） |
| `src/app/components/` | 组件库（55+ 组件） |
| `electron/main.ts` | Electron 主进程 |
| `vite.config.ts` | Vite 构建配置 |
| `tsconfig.json` | TypeScript 配置（严格模式） |

---

## 五、快速开始

### 5.1 前置条件

| 依赖 | 版本要求 | 安装命令 |
|------|---------|---------|
| Node.js | ≥ 18.x（推荐 20.x LTS） | `nvm install 20` |
| pnpm | ≥ 8.x | `corepack enable pnpm` |
| Git | 最新版 | `git --version` |

### 5.2 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/YYC-Cube/YYC3-CloudPivot-Intelli-Matrix.git
cd YYC3-CloudPivot-Intelli-Matrix
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置
```

4. **启动开发服务器**

```bash
pnpm dev
```

访问 http://localhost:3218

5. **运行测试**

```bash
# 单次运行
pnpm test

# 监听模式
pnpm test:watch

# 覆盖率报告
pnpm test:coverage
```

6. **构建生产包**

```bash
# 标准构建
pnpm build

# 构建 Electron 应用
pnpm build:electron
```

### 5.3 登录方式

#### 正常登录

需要 Supabase 认证

#### Ghost Mode（开发模式）

点击登录页 **GHOST MODE** 按钮跳过认证

| 配置项 | 值 |
|---------|-----|
| 用户 | ghost@yyc3.local |
| 角色 | developer |
| 说明 | 所有功能可用，数据仅 localStorage |

---

## 六、端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 开发服务器 | 3218 | Vite 开发服务器 |
| 生产部署 | 3118 | 符合 YYC³ 标准（3200-3500） |
| WebSocket | 3113 | 实时数据推送 |
| Nginx 代理 | 80/443 | 反向代理 |

---

## 七、项目指标

### 7.1 技术指标

| 指标 | 值 | 说明 |
|------|-----|------|
| 🚀 **构建速度** | 6.42s | Vite 极速编译 |
| 📦 **包大小** | 275KB | 优化后主包大小 |
| 🧪 **测试覆盖** | 14%+ | 1267 个测试用例 |
| 💾 **类型安全** | 100% | TypeScript Strict Mode |
| 🎨 **样式隔离** | 原子化 | Tailwind CSS JIT |
| 🔄 **热更新** | HMR | 开发体验极佳 |

### 7.2 功能指标

| 指标 | 值 | 说明 |
|------|-----|------|
| 📦 **组件数量** | 55+ | React 组件 |
| 🎣 **Hooks 数量** | 19 | 自定义 Hooks |
| 🌍 **语言支持** | 2 | 中文/英文 |
| 📱 **平台支持** | 3 | Web/Desktop/Mobile |
| 🎨 **主题数量** | 6 | 预设主题 |

---

## 八、相关文档

| 文档 | 说明 |
|------|------|
| [快速开始指南](./003-CP-IM-项目总览索引-快速开始指南.md) | 快速上手教程 |
| [文档架构导航](./002-CP-IM-项目总览索引-文档架构导航.md) | 文档体系导航 |
| [核心概念词典](./004-CP-IM-项目总览索引-核心概念词典.md) | 项目核心概念 |
| [版本更新日志](./005-CP-IM-项目总览索引-版本更新日志.md) | 版本迭代记录 |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
