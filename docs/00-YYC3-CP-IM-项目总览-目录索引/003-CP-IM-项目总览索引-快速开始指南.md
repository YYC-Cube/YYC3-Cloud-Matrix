---
@file: 003-CP-IM-项目总览索引-快速开始指南.md
@description: YYC³-CP-IM 快速开始指南，帮助用户快速上手项目
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-03-05
@updated: 2026-03-05
@status: published
@tags: [项目总览],[快速开始],[使用指南]
---

# YYC³ CloudPivot Intelli-Matrix 快速开始指南

## 一、环境准备

### 1.1 系统要求

| 组件 | 最低要求 | 推荐配置 |
|------|----------|----------|
| 操作系统 | Windows 10+, macOS 10.15+, Ubuntu 18.04+ | Windows 11, macOS 13+, Ubuntu 22.04+ |
| CPU | 双核 2.0 GHz | 四核 3.0 GHz+ |
| 内存 | 4 GB | 8 GB+ |
| 磁盘 | 10 GB 可用空间 | 20 GB+ SSD |
| 网络 | 稳定的互联网连接 | 高速宽带 |

### 1.2 软件依赖

| 软件 | 版本要求 | 安装方式 |
|------|----------|----------|
| Node.js | ≥ 18.x（推荐 20.x LTS） | [官网下载](https://nodejs.org/) 或 `nvm install 20` |
| pnpm | ≥ 8.x | `corepack enable pnpm` |
| Git | 最新版 | [官网下载](https://git-scm.com/) 或包管理器 |
| 浏览器 | Chrome 90+, Firefox 88+, Safari 14+ | 最新版浏览器 |

### 1.3 可选依赖

| 软件 | 用途 | 安装方式 |
|------|------|----------|
| Docker | 容器化开发 | [官网下载](https://www.docker.com/) |
| VSCode | 代码编辑器 | [官网下载](https://code.visualstudio.com/) |
| Postman | API 测试 | [官网下载](https://www.postman.com/) |

---

## 二、项目安装

### 2.1 克隆项目

```bash
# 使用 HTTPS
git clone https://github.com/YYC-Cube/YYC3-CloudPivot-Intelli-Matrix.git

# 使用 SSH（推荐）
git clone git@github.com:YYC-Cube/YYC3-CloudPivot-Intelli-Matrix.git

# 进入项目目录
cd YYC3-CloudPivot-Intelli-Matrix
```

### 2.2 安装依赖

```bash
# 使用 pnpm 安装依赖（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

**安装时间**：约 2-5 分钟（取决于网络速度）

### 2.3 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件
# 根据实际情况填写配置
```

**环境变量配置说明**：

```bash
# Supabase 认证（可选，生产环境必需）
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# WebSocket 配置
VITE_WS_URL=ws://localhost:3113/ws

# API 配置
VITE_API_URL=http://localhost:3000/api

# AI 配置（可选）
VITE_AI_BASE_URL=https://api.openai.com/v1
VITE_AI_API_KEY=your_api_key

# 开发模式配置
VITE_DEV_MODE=true
```

---

## 三、启动项目

### 3.1 开发模式

```bash
# 启动开发服务器
pnpm dev

# 或
npm run dev
```

**访问地址**：http://localhost:3218

**特性**：
- ✅ 热模块替换（HMR）
- ✅ 源码映射
- ✅ 错误提示
- ✅ 自动刷新

### 3.2 Electron 桌面应用

```bash
# 启动 Electron 开发模式
pnpm electron:dev

# 或
npm run electron:dev
```

**特性**：
- ✅ 桌面原生窗口
- ✅ 系统托盘
- ✅ 原生通知
- ✅ 自动更新（生产环境）

### 3.3 生产构建

```bash
# 构建 Web 应用
pnpm build

# 构建 Electron 应用
pnpm build:electron

# 或
npm run build
```

**构建产物**：
- Web 应用：`dist/` 目录
- Electron 应用：`dist-electron/` 目录

---

## 四、登录与认证

### 4.1 正常登录

1. 打开应用登录页面
2. 输入邮箱和密码
3. 点击"登录"按钮
4. 等待 Supabase 认证完成

### 4.2 Ghost Mode（开发模式）

**适用场景**：本地开发、测试、演示

**使用方法**：
1. 打开应用登录页面
2. 点击 **GHOST MODE** 按钮
3. 自动跳过认证，进入系统

**Ghost Mode 配置**：

| 配置项 | 值 | 说明 |
|---------|-----|------|
| 用户 | ghost@yyc3.local | 开发用户 |
| 角色 | developer | 开发者角色 |
| 权限 | 所有功能 | 完整功能访问 |
| 数据存储 | localStorage | 本地存储 |

**注意事项**：
- ⚠️ Ghost Mode 仅用于开发环境
- ⚠️ 生产环境必须使用正常认证
- ⚠️ Ghost Mode 数据不会同步到服务器

---

## 五、核心功能使用

### 5.1 数据监控

**访问路径**：左侧导航 → 数据监控

**功能说明**：
- 实时节点状态监控（GPU/内存/温度）
- QPS 与延迟趋势图表
- 告警实时推送与处理
- 吞吐量历史数据

**使用步骤**：
1. 点击"数据监控"导航项
2. 查看实时监控数据
3. 点击图表查看详细信息
4. 使用筛选器过滤数据

### 5.2 巡查管理

**访问路径**：左侧导航 → 巡查管理

**功能说明**：
- 巡查计划调度
- 巡查报告生成
- 巡查历史记录
- 自动化巡查

**使用步骤**：
1. 点击"巡查管理"导航项
2. 创建新的巡查计划
3. 配置巡查参数
4. 执行巡查任务
5. 查看巡查报告

### 5.3 操作中心

**访问路径**：左侧导航 → 操作中心

**功能说明**：
- 快速操作网格
- 操作模板管理
- 实时操作日志流
- 操作审计

**使用步骤**：
1. 点击"操作中心"导航项
2. 选择操作模板
3. 填写操作参数
4. 执行操作
5. 查看操作日志

### 5.4 AI 辅助

**访问路径**：左侧导航 → AI 辅助

**功能说明**：
- AI 决策建议面板
- SDK 流式聊天
- 操作推荐引擎
- 模式分析器

**使用步骤**：
1. 点击"AI 辅助"导航项
2. 输入问题或描述
3. 等待 AI 响应
4. 查看决策建议
5. 应用推荐操作

### 5.5 系统设置

**访问路径**：左侧导航 → 系统设置

**功能说明**：
- 主题定制（6 套预设主题）
- 模型供应商管理
- 网络配置
- PWA 状态管理

**使用步骤**：
1. 点击"系统设置"导航项
2. 选择设置类别
3. 修改配置参数
4. 保存设置
5. 重启应用生效

---

## 六、开发工具

### 6.1 代码编辑器

**推荐**：Visual Studio Code

**必备插件**：
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- GitLens
- Auto Rename Tag

### 6.2 浏览器开发者工具

**推荐**：Chrome DevTools

**必备插件**：
- React Developer Tools
- Redux DevTools（如使用 Redux）
- Vue.js devtools（如使用 Vue）

### 6.3 API 测试工具

**推荐**：Postman 或 Insomnia

**使用场景**：
- 接口测试
- 调试 API
- 集合管理
- 环境配置

---

## 七、常见问题

### 7.1 安装问题

**Q: pnpm install 失败**

A: 尝试以下解决方案：
```bash
# 清除缓存
pnpm store prune

# 重新安装
pnpm install --force
```

**Q: Node.js 版本不兼容**

A: 使用 nvm 切换版本：
```bash
# 安装推荐版本
nvm install 20

# 切换版本
nvm use 20
```

### 7.2 启动问题

**Q: 端口被占用**

A: 修改端口或关闭占用进程：
```bash
# 查找占用端口的进程
lsof -i :3218

# 杀死进程
kill -9 <PID>

# 或修改 vite.config.ts 中的端口配置
```

**Q: 构建失败**

A: 检查以下内容：
```bash
# 检查 TypeScript 错误
pnpm type-check

# 检查 ESLint 错误
pnpm lint

# 清除缓存重新构建
pnpm clean && pnpm build
```

### 7.3 功能问题

**Q: WebSocket 连接失败**

A: 检查配置：
1. 确认 WebSocket URL 配置正确
2. 检查网络连接
3. 查看浏览器控制台错误
4. 系统会自动切换到模拟模式

**Q: AI 功能不可用**

A: 检查配置：
1. 确认 AI API Key 已配置
2. 检查 API 配额
3. 查看网络连接
4. 查看错误日志

---

## 八、下一步

### 8.1 学习资源

- [项目总览手册](./001-CP-IM-项目总览索引-项目总览手册.md) - 了解项目整体情况
- [核心概念词典](./004-CP-IM-项目总览索引-核心概念词典.md) - 理解项目核心概念
- [开发环境搭建手册](../03-YYC3-CP-IM-项目开发-实施阶段/0301-CP-IM-开发环境/001-CP-IM-开发实施阶段-开发环境搭建手册.md) - 深入开发环境配置

### 8.2 开发指南

- [前端开发规范](../03-YYC3-CP-IM-项目开发-实施阶段/0302-CP-IM-开发规范/0302-01-CP-IM-前端开发规范/) - 遵循开发规范
- [技术文档](../03-YYC3-CP-IM-项目开发-实施阶段/0303-CP-IM-技术文档/) - 了解技术细节
- [API文档](../03-YYC3-CP-IM-项目开发-实施阶段/0304-CP-IM-API文档/) - 接口开发参考

### 8.3 获取帮助

- 📧 提交 Issue：[GitHub Issues](https://github.com/YYC-Cube/YYC3-CloudPivot-Intelli-Matrix/issues)
- 💬 讨论区：[GitHub Discussions](https://github.com/YYC-Cube/YYC3-CloudPivot-Intelli-Matrix/discussions)
- 📧 邮件支持：admin@0379.email

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
