---
@file: 001-CP-IM-开发实施阶段-开发环境搭建手册.md
@description: YYC³-CP-IM 开发环境搭建步骤与配置
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-26
@updated: 2026-03-05
@status: published
@tags: [开发环境],[环境搭建],[配置指南]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ CloudPivot Intelli-Matrix - 开发环境搭建手册

本文档提供 YYC³ CloudPivot Intelli-Matrix 项目的完整开发环境搭建指南，包括系统要求、依赖安装、配置步骤和验证方法。

---

## 目录

- [系统要求](#系统要求)
- [前置依赖](#前置依赖)
- [项目克隆](#项目克隆)
- [依赖安装](#依赖安装)
- [环境配置](#环境配置)
- [开发服务器](#开发服务器)
- [开发工具](#开发工具)
- [常见问题](#常见问题)
- [验证步骤](#验证步骤)

---

## 系统要求

### 操作系统

- **macOS**：macOS 11.0 (Big Sur) 或更高版本
- **Windows**：Windows 10 或更高版本
- **Linux**：Ubuntu 20.04 LTS 或更高版本

### 硬件要求

- **CPU**：双核处理器或更高
- **内存**：至少 8GB RAM（推荐 16GB）
- **磁盘空间**：至少 5GB 可用空间
- **网络**：稳定的互联网连接

### 软件要求

- **Node.js**：v20.x 或更高版本
- **pnpm**：v9.x 或更高版本
- **Git**：v2.x 或更高版本

---

## 前置依赖

### 安装 Node.js

#### macOS

```bash
# 使用 Homebrew 安装
brew install node@20

# 验证安装
node --version
npm --version
```

#### Windows

1. 从 [Node.js 官网](https://nodejs.org/) 下载并安装 LTS 版本
2. 验证安装：
   ```bash
   node --version
   npm --version
   ```

#### Linux (Ubuntu)

```bash
# 使用 NodeSource 仓库安装
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 安装 pnpm

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

### 安装 Git

#### macOS

```bash
# macOS 通常已预装 Git
git --version

# 如果未安装，使用 Homebrew
brew install git
```

#### Windows

1. 从 [Git 官网](https://git-scm.com/) 下载并安装
2. 验证安装：
   ```bash
   git --version
   ```

#### Linux (Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y git

# 验证安装
git --version
```

---

## 项目克隆

### 克隆仓库

```bash
# 克隆项目仓库
git clone https://github.com/YanYuCloudCube/CloudPivot-Intelli-Matrix.git

# 进入项目目录
cd CloudPivot-Intelli-Matrix
```

### 查看项目结构

```bash
# 查看项目结构
ls -la

# 主要目录说明：
# src/          - 源代码目录
# electron/     - Electron 主进程代码
# public/       - 静态资源
# docs/         - 项目文档
# tests/        - 测试文件
```

---

## 依赖安装

### 安装项目依赖

```bash
# 使用 pnpm 安装依赖
pnpm install

# 如果遇到权限问题，使用：
sudo pnpm install
```

### 验证依赖安装

```bash
# 检查 node_modules 是否生成
ls node_modules

# 检查 package-lock.yaml 是否存在
ls package-lock.yaml
```

---

## 环境配置

### 创建环境变量文件

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env  # 或使用其他编辑器
```

### 配置环境变量

在 `.env` 文件中配置以下变量：

```env
# 应用配置
VITE_APP_NAME=YYC³ CloudPivot Intelli-Matrix
VITE_APP_VERSION=1.0.0
VITE_APP_PORT=3218

# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# WebSocket 配置
VITE_WS_URL=ws://localhost:8080

# API 配置
VITE_API_URL=http://localhost:3000/api

# Electron 配置
ELECTRON_IS_DEV=true
```

### Supabase 配置（可选）

如果使用 Supabase 进行身份验证：

1. 访问 [Supabase 控制台](https://supabase.com/dashboard)
2. 创建新项目或使用现有项目
3. 获取项目的 URL 和 anon key
4. 将这些值填入 `.env` 文件

### Ghost Mode 配置

开发环境可以使用 Ghost Mode（模拟认证模式）：

```env
# 在 .env 中启用 Ghost Mode
VITE_GHOST_MODE=true
```

---

## 开发服务器

### 启动 Web 开发服务器

```bash
# 启动开发服务器
pnpm dev

# 服务器将在 http://localhost:3218 启动
```

### 启动 Electron 开发环境

```bash
# 启动 Electron 开发环境
pnpm electron:dev

# 这将同时启动 Vite 开发服务器和 Electron 应用
```

### 访问应用

- **Web 应用**：http://localhost:3218
- **Electron 应用**：自动启动桌面应用窗口

---

## 开发工具

### 推荐的 IDE/编辑器

#### Visual Studio Code

```bash
# 安装 VS Code
# macOS
brew install --cask visual-studio-code

# Windows
# 从 https://code.visualstudio.com/ 下载安装

# Linux (Ubuntu)
sudo snap install --classic code
```

#### 推荐的 VS Code 扩展

- **ESLint**：代码质量检查
- **Prettier**：代码格式化
- **TypeScript Importer**：自动导入 TypeScript 模块
- **Auto Rename Tag**：自动重命名 HTML/XML 标签
- **Path Intellisense**：路径自动补全
- **Tailwind CSS IntelliSense**：Tailwind CSS 智能提示
- **GitLens**：Git 增强

### 代码质量工具

#### ESLint 配置

```bash
# 运行 ESLint 检查
pnpm lint

# 自动修复 ESLint 问题
pnpm lint:fix
```

#### TypeScript 类型检查

```bash
# 运行 TypeScript 类型检查
pnpm type-check
```

### 测试工具

```bash
# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:coverage
```

---

## 常见问题

### 依赖安装失败

**问题**：`pnpm install` 失败

**解决方案**：

```bash
# 清除缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 端口被占用

**问题**：端口 3218 被占用

**解决方案**：

```bash
# macOS/Linux
lsof -ti:3218 | xargs kill -9

# Windows
netstat -ano | findstr :3218
taskkill /PID <PID> /F

# 或者修改 vite.config.ts 中的端口配置
```

### TypeScript 类型错误

**问题**：运行 `pnpm type-check` 时出现类型错误

**解决方案**：

```bash
# 清除 TypeScript 缓存
rm -rf node_modules/.vite

# 重新生成类型定义
pnpm exec tsc --noEmit
```

### Electron 启动失败

**问题**：`pnpm electron:dev` 启动失败

**解决方案**：

```bash
# 确保 Electron 已正确安装
pnpm install

# 重新构建 Electron 主进程
pnpm exec tsc -p electron/tsconfig.json

# 检查 electron/main.ts 是否存在
ls electron/main.ts
```

### 权限问题（macOS/Linux）

**问题**：权限被拒绝错误

**解决方案**：

```bash
# 修复 node_modules 权限
sudo chown -R $(whoami) node_modules

# 修复项目目录权限
sudo chown -R $(whoami) .
```

---

## 验证步骤

### 验证 Node.js 和 pnpm

```bash
# 检查 Node.js 版本
node --version
# 应显示：v20.x.x

# 检查 pnpm 版本
pnpm --version
# 应显示：9.x.x
```

### 验证项目依赖

```bash
# 检查依赖是否安装成功
ls node_modules

# 检查关键依赖
ls node_modules/react
ls node_modules/react-dom
ls node_modules/vite
```

### 验证开发服务器

```bash
# 启动开发服务器
pnpm dev

# 在浏览器中访问 http://localhost:3218
# 应看到 YYC³ CloudPivot Intelli-Matrix 应用界面
```

### 验证 TypeScript 配置

```bash
# 运行类型检查
pnpm type-check

# 应无错误输出
```

### 验证代码质量

```bash
# 运行 ESLint
pnpm lint

# 应无错误输出（可能有警告）
```

### 验证测试

```bash
# 运行测试
pnpm test

# 应显示测试通过
```

---

## 下一步

开发环境搭建完成后，您可以：

1. **阅读项目文档**：查看 `docs/` 目录下的项目文档
2. **了解项目结构**：熟悉 `src/` 目录的代码组织
3. **开始开发**：根据需求开始功能开发
4. **运行测试**：确保代码质量
5. **提交代码**：遵循 Git 工作流规范

---

## 相关文档

- [多环境配置规范](002-CP-IM-开发实施阶段-多环境配置规范.md)
- [Docker 容器配置](003-CP-IM-开发实施阶段-Docker容器配置.md)
- [开发工具链说明](004-CP-IM-开发实施阶段-开发工具链说明.md)
- [本地调试指南](005-CP-IM-开发实施阶段-本地调试指南.md)

---

## 技术支持

如果遇到问题，请通过以下方式获取帮助：

- **GitHub Issues**：https://github.com/YanYuCloudCube/CloudPivot-Intelli-Matrix/issues
- **邮件联系**：admin@0379.email
- **团队沟通**：通过团队内部沟通渠道

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
