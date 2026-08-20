---
@file: 006-CP-IM-开发实施阶段-桌面应用封装操作指南.md
@description: YYC³ CloudPivot Intelli-Matrix 桌面应用封装操作指南
@author: YanYuCloudCube Team
@version: 1.0.0
@created: 2026-03-04
@updated: 2026-03-04
@status: completed
@tags: [desktop, electron, packaging, guide]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 桌面应用封装操作指南

## 概述

本文档提供 YYC³ CloudPivot Intelli-Matrix 桌面应用封装的详细操作指导，包括开发、构建、测试和发布流程。

## 目录

1. [项目结构说明](#项目结构说明)
2. [开发环境配置](#开发环境配置)
3. [开发模式运行](#开发模式运行)
4. [生产环境构建](#生产环境构建)
5. [测试与验证](#测试与验证)
6. [发布与分发](#发布与分发)
7. [常见问题解决](#常见问题解决)
8. [工作区分离建议](#工作区分离建议)

---

## 项目结构说明

### 当前项目结构

```
YYC³ CloudPivot Intelli-Matrix/
├── electron/                  # Electron 主进程代码
│   ├── main.ts                # 主进程入口
│   ├── preload.ts             # 预加载脚本
│   └── tsconfig.json          # TypeScript 配置
├── src/                       # React 应用源码
├── dist/                      # Vite 构建输出（前端资源）
├── dist-electron/             # Electron 构建输出
│   ├── mac-arm64/             # ARM64 应用包
│   ├── mac/                   # x64 应用包
│   └── *.dmg                  # 安装包
├── public/                    # 静态资源
├── package.json               # 项目配置
├── vite.config.ts             # Vite 配置
└── tsconfig.json              # TypeScript 配置
```

### 关键文件说明

| 文件 | 用途 | 重要性 |
|------|--------|---------|
| `electron/main.ts` | Electron 主进程，管理窗口、托盘等 | 🔴 必须 |
| `electron/preload.ts` | 预加载脚本，安全桥接主进程和渲染进程 | 🔴 必须 |
| `package.json` | 项目配置，包含构建脚本和依赖 | 🔴 必须 |
| `vite.config.ts` | 前端构建配置 | 🔴 必须 |
| `electron/tsconfig.json` | Electron TypeScript 配置 | 🟡 重要 |

---

## 开发环境配置

### 1. 环境要求

```bash
# Node.js 版本
node >= 18.0.0

# 包管理器
pnpm >= 8.0.0
```

### 2. 依赖安装

```bash
# 安装所有依赖
pnpm install

# 仅安装 Electron 相关依赖
pnpm add -D electron electron-builder
```

### 3. 环境变量配置

创建 `.env` 文件：

```env
# 开发环境
NODE_ENV=development

# Electron 开发模式
ELECTRON_IS_DEV=true

# 应用端口
VITE_PORT=3218
```

---

## 开发模式运行

### 1. 启动开发服务器

```bash
# 启动 Vite 开发服务器 + Electron
pnpm run electron:dev
```

此命令会：

1. 启动 Vite 开发服务器（端口 3218）
2. 等待服务器就绪
3. 启动 Electron 应用
4. 加载开发服务器地址

### 2. 热重载配置

开发模式下支持：

- **前端热重载**：修改 React 代码自动刷新
- **Electron 重启**：修改主进程代码需手动重启

### 3. 开发工具

```bash
# 启动 Vite 开发服务器（仅前端）
pnpm run dev

# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint

# 代码格式化
pnpm run lint:fix
```

---

## 生产环境构建

### 1. 构建命令

```bash
# 构建当前平台（自动检测）
pnpm run electron:build

# 构建 macOS ARM64 版本
pnpm run build:mac

# 构建 Windows x64 版本
pnpm run build:win

# 构建 Linux x64 版本
pnpm run build:linux
```

### 2. 构建流程

构建命令执行以下步骤：

1. **TypeScript 编译**

   ```bash
   tsc -p electron/tsconfig.json
   ```

   输出：`dist-electron/main.js`、`dist-electron/preload.js`

2. **Vite 构建**

   ```bash
   vite build
   ```

   输出：`dist/` 目录（前端资源）

3. **Electron 打包**

   ```bash
   electron-builder
   ```

   输出：平台特定的安装包

### 3. 构建输出

#### macOS

```
dist-electron/
├── YYC³ CloudPivot-1.0.0-mac-arm64.dmg    # Apple Silicon 安装包
├── YYC³ CloudPivot-1.0.0-mac-x64.dmg      # Intel 安装包
├── mac-arm64/YYC³ CloudPivot.app/         # ARM64 应用包
└── mac/YYC³ CloudPivot.app/               # x64 应用包
```

#### Windows

```
dist-electron/
├── YYC³ CloudPivot Setup 1.0.0.exe        # NSIS 安装程序
└── YYC³ CloudPivot-1.0.0-win.exe          # 便携版
```

#### Linux

```
dist-electron/
├── YYC³ CloudPivot-1.0.0-linux-x64.AppImage  # AppImage 格式
└── YYC³ CloudPivot-1.0.0-linux-amd64.deb    # DEB 包
```

---

## 测试与验证

### 1. 本地测试

#### macOS 测试

```bash
# 打开 DMG 文件
open dist-electron/YYC³ CloudPivot-1.0.0-mac-arm64.dmg

# 或直接运行应用
open dist-electron/mac-arm64/YYC³ CloudPivot.app
```

#### Windows 测试

```bash
# 运行安装程序
dist-electron/YYC³ CloudPivot Setup 1.0.0.exe

# 或运行便携版
dist-electron/YYC³ CloudPivot-1.0.0-win.exe
```

#### Linux 测试

```bash
# 运行 AppImage
chmod +x dist-electron/YYC³ CloudPivot-1.0.0-linux-x64.AppImage
./dist-electron/YYC³ CloudPivot-1.0.0-linux-x64.AppImage

# 安装 DEB 包
sudo dpkg -i dist-electron/YYC³ CloudPivot-1.0.0-linux-amd64.deb
```

### 2. 功能测试清单

- [ ] 应用正常启动
- [ ] 窗口尺寸正确（1400×900）
- [ ] 系统托盘图标显示
- [ ] 托盘菜单功能正常
- [ ] 单实例锁定生效
- [ ] 外部链接正确打开
- [ ] 应用退出正常
- [ ] 数据持久化正常
- [ ] 自动更新检查功能

### 3. 性能测试

```bash
# 检查应用内存占用
ps aux | grep "YYC³ CloudPivot"

# 检查应用 CPU 占用
top -pid $(pgrep -f "YYC³ CloudPivot")
```

---

## 发布与分发

### 1. 版本管理

更新 `package.json` 版本号：

```json
{
  "version": "1.0.1",
  "build": {
    "appId": "com.yyc3.cloudpivot.intelli-matrix",
    "productName": "YYC³ CloudPivot"
  }
}
```

### 2. 代码签名

#### macOS 代码签名

```bash
# 查看可用证书
security find-identity -v -p codesigning

# 代码签名
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name" \
  dist-electron/mac-arm64/YYC³ CloudPivot.app
```

#### Windows 代码签名

```bash
# 使用 signtool 签名
signtool sign /f certificate.pfx /p password \
  dist-electron/YYC³ CloudPivot Setup 1.0.0.exe
```

### 3. 自动更新配置

在 `package.json` 中配置发布源：

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "YanYuCloudCube",
      "repo": "CloudPivot-Intelli-Matrix",
      "private": false
    }
  },
  "scripts": {
    "release": "electron-builder --publish always"
  }
}
```

### 4. 发布流程

```bash
# 1. 更新版本号
# 2. 提交代码
git add .
git commit -m "Release v1.0.1"
git tag v1.0.1
git push origin main --tags

# 3. 构建并发布
pnpm run release
```

---

## 常见问题解决

### 1. 构建错误

#### 问题：找不到模块

```
Error: Cannot find module 'electron'
```

**解决方案：**

```bash
pnpm install
```

#### 问题：TypeScript 编译错误

```
error TS2307: Cannot find module 'electron'
```

**解决方案：**

```bash
pnpm add -D @types/node
```

#### 问题：Vite 构建失败

```
Error: Rollup failed to resolve import
```

**解决方案：**

```bash
# 安装缺失的依赖
pnpm add <missing-package>
```

### 2. 运行时错误

#### 问题：应用白屏

**可能原因：**

1. 前端资源路径错误
2. 网络请求被阻止

**解决方案：**

```typescript
// electron/main.ts
mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
```

#### 问题：托盘图标不显示

**可能原因：**

1. 图标路径错误
2. 图标尺寸不正确

**解决方案：**

```typescript
// 使用 16×16 或 32×32 图标
const trayIcon = nativeImage.createFromPath(trayIconPath)
  .resize({ width: 16, height: 16 });
```

### 3. 性能问题

#### 问题：应用启动慢

**优化方案：**

1. 减少初始加载的依赖
2. 启用代码分割
3. 延迟加载非关键模块

```typescript
// vite.config.ts
manualChunks: {
  'vendor': ['react', 'react-dom'],
  'charts': ['recharts']
}
```

---

## 工作区分离建议

### 当前架构分析

**当前状态：**

- ✅ 桌面应用代码已集成在主项目中
- ✅ 构建输出独立在 `dist-electron/` 目录
- ✅ 可以独立分发构建产物

**是否需要完全分离？**

### 分离方案对比

#### 方案 A：保持当前架构（推荐）

**优点：**

- ✅ 代码统一管理，便于维护
- ✅ 共享配置和依赖
- ✅ 构建流程简单
- ✅ 适合中小型项目

**缺点：**

- ⚠️ 项目结构稍显复杂
- ⚠️ Electron 和 Web 代码耦合

**适用场景：**

- 团队规模 < 10 人
- 桌面应用是主要分发方式
- 需要频繁更新

#### 方案 B：完全分离工作区

**优点：**

- ✅ 职责清晰，便于团队协作
- ✅ 可以独立发布和版本管理
- ✅ 便于多平台维护

**缺点：**

- ⚠️ 需要额外的构建流程
- ⚠️ 依赖管理复杂
- ⚠️ 需要同步 Web 和 Electron 版本

**适用场景：**

- 团队规模 > 10 人
- 需要独立维护桌面和 Web 版本
- 有专门的桌面应用团队

### 推荐方案

**当前阶段：保持方案 A**

**理由：**

1. 项目处于早期开发阶段
2. 桌面应用是主要分发方式
3. 构建输出已独立，可以满足分发需求

**未来演进：**
如果出现以下情况，考虑方案 B：

- Web 版本需求增长
- 需要独立的桌面应用团队
- 版本发布频率差异大

### 分离实施步骤（如需方案 B）

#### 1. 创建独立仓库

```bash
# 创建桌面应用仓库
mkdir yyc3-cloudpivot-desktop
cd yyc3-cloudpivot-desktop

# 初始化项目
pnpm init
```

#### 2. 配置项目结构

```
yyc3-cloudpivot-desktop/
├── electron/              # Electron 主进程
├── web/                   # Web 应用（作为 git submodule）
├── scripts/               # 构建脚本
├── package.json
└── README.md
```

#### 3. 配置依赖

```json
{
  "scripts": {
    "build:web": "cd web && pnpm run build",
    "build:electron": "tsc -p electron/tsconfig.json",
    "build": "pnpm run build:web && pnpm run build:electron && electron-builder"
  }
}
```

#### 4. 设置 Git Submodule

```bash
# 添加 Web 应用为子模块
git submodule add https://github.com/YanYuCloudCube/CloudPivot-Intelli-Matrix.git web

# 更新子模块
git submodule update --remote --merge
```

---

## 附录

### A. 快速参考

| 命令 | 用途 |
|------|--------|
| `pnpm run electron:dev` | 开发模式 |
| `pnpm run electron:build` | 构建当前平台 |
| `pnpm run build:mac` | 构建 macOS |
| `pnpm run build:win` | 构建 Windows |
| `pnpm run build:linux` | 构建 Linux |
| `pnpm run type-check` | 类型检查 |
| `pnpm run lint` | 代码检查 |

### B. 相关文档

- [项目架构总览](../../02-YYC³-CP-IM-项目设计阶段/0201-CP-IM-架构设计/001-CP-IM-项目设计阶段-系统架构总览图.md)
- [开发环境配置](../../03-YYC³-CP-IM-开发实施阶段/0301-CP-IM-开发环境/002-CP-IM-开发实施阶段-多环境配置规范.md)
- [接口集成指南](../../03-YYC³-CP-IM-开发实施阶段/0306-CP-IM-集成指南/001-CP-IM-开发实施阶段-前后端联调手册.md)

### C. 联系方式

- **技术支持**: <admin@0379.email>
- **GitHub Issues**: <https://github.com/YanYuCloudCube/CloudPivot-Intelli-Matrix/issues>
- **文档反馈**: <https://github.com/YanYuCloudCube/CloudPivot-Intelli-Matrix/pulls>

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
