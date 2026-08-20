---
file: CHANGELOG.md
description: YYC³ Cloud Intelli-Matrix 版本更新日志 · 记录所有重要变更
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-02-26
updated: 2026-04-26
status: stable
tags: [changelog],[version],[release]
category: general
language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 更新日志 (CHANGELOG)

本文件记录 YYC³ Cloud Intelli-Matrix 项目的所有重要更改。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [3.4.2] - 2026-04-26

### Added

- 全量模块审核: 6 大模块 42 页面数据源、可编辑性、持久化闭环验证
- 通讯基站独立主导航: CommStationPanel 组件 + IndexedDB 持久化 + 完整 CRUD
- 智慧酒店独立主导航: 从 AI Family 子导航提升为 `/hotel` 独立路由
- 音乐空间播放列表删除功能: 每首歌曲可从列表移除，自动调整播放索引
- 音乐空间上传加固: SongUploadZone 改用 React useRef + 隐藏 `<input>` 替代 document.createElement
- 时钟页面成员详情面板: "对话"和"任务分配"按钮绑定实际导航（→ chat / activities）
- AI Family 19 子页面数据源审核报告: 全部使用 useFamilyMemberSlice 统一数据

### Changed

- 预设模型精简: BUILTIN_PROVIDERS 从 9 个缩减为 3 个（智谱 / DeepSeek / Ollama），清理全部 openai/kimi/volcengine/claude/qwen 引用
- OperationAudit 数据真实化: 硬编码 ALL_AUDIT_LOGS → useLogSlice 真实日志数据 + mapLogToAudit 映射
- DEFAULT_MODEL_ASSIGNMENTS 更新: 全部 8 个 AI 成员分配到 zhipu/deepseek/ollama
- Logo 路径修复: YYC3LogoSvg BASE_URL 拼接归一化，`"./"` / `"/"` 统一为空字符串
- StoreName 扩展: 新增 `comm_stations`，ALL_STORES 23→24
- react-router-dom → react-router: AIFamilyCenterPage / usePageConfig 修正导入路径（项目使用 React Router v7）
- OperationAudit 无障碍修复: 4 个 button 补充 title 属性
- FamilyMusic 上传回调: song 对象补全 id/artist 字段，careEngine 加 .catch 防崩溃

### Fixed

- 🔴 AI Family 中心页面加载失败: `import from "react-router-dom"` 导致模块找不到，整个 center 页面崩溃
- 🔴 usePageConfig 路由错误: 同样引用 react-router-dom，影响页面配置功能
- 🔴 音乐空间上传按钮无效: document.createElement("input").click() 在部分环境下被拦截
- 🔴 音乐空间无删除功能: 播放列表和已上传列表均缺少删除入口
- 🔴 时钟页面成员弹出面板按钮无效: "对话"和"任务分配"两个按钮缺少 onClick 处理器
- 🔴 Logo 不显示 (net::ERR_NAME_NOT_RESOLVED): BASE_URL 拼接产生 `yyc3-icons/macOS/32.png` 无前导 `/`

### Audited

- 系统设定 9 页: 安全监控 / 操作审计 / 环境变量 / 数据管理 / 统一设置 / 系统管理 / 性能监控 / 用户管理 / PWA 管理
- 监控中心 5 页: Dashboard / FollowUpPanel / PatrolDashboard / AlertRulesPanel / OperationCenter
- AI 智能中心 4 页: AISuggestionPanel / ModelProviderPanel / AIDiagnostics / SDKChatPanel
- 运维管理 9 页: 全部数据源正确
- 开发工具 5 页: 全部数据源正确
- AI Family 19 子页面: 全部使用 useFamilyMemberSlice 统一数据源

### Technical

- tsc: 0 errors | lint: 0 errors | test: 4222/4222 all green
- 修改文件: 17 源文件 + 3 测试文件
- 新增文件: CommStationPanel.tsx
- 影响范围: 全局路由 / AI Family 模块 / 预设模型系统 / Logo 系统

---

## [3.5.0] - 2026-04-23

### Changed

- GitHub Pages 自定义域名迁移: `cpim.yyccube.xin` / `cp.yyccube.xin` / `yyc-cube.github.io` → **`matrix.yyc3.top`**
  - CNAME 文件、deploy-pages.yml CUSTOM_DOMAIN、README.md Demo 链接、scripts/README.md 文档链接全部同步
- Dependabot 自动合并: Actions 版本升级（pnpm/action-setup@v6, upload-pages-artifact@v5, deploy-pages@v5 等）
- pnpm-lock.yaml 同步修复: dependabot 合并后 lockfile 与 package.json 版本不一致问题
- CI/CD Pipeline Codecov action 降级: v6 → v4 + fail_ci_if_error:false，解决 git config 锁定错误 (exit code 255)
- 生产依赖升级: vite 8.0.8→8.0.9, electron 28→41.1.1, electron-builder 26.8.1, eslint 10.2.0, vitest 4.1.4 等

### Fixed

- CI Install dependencies 失败: pnpm-lock.yaml 与 package.json semver spec 不匹配导致 --frozen-lockfile 校验失败
- CI Test 全部 shard 失败: codecov/codecov-action@v6 git config 错误导致 exit code 255，覆盖率上传阻塞测试结果
- SSH 推送协议切换: OAuth App 缺少 workflow scope，改用 SSH 协议推送 workflow 文件变更

---

## [3.4.1] - 2026-04-20

### Added

- 五维审计报告修复: 58 项问题核心项全部解决
- Phase 2.1: types/index.ts 1999行 → 31 领域类型文件 + barrel re-export
- Phase 2.2: migrate-storage.ts 工具集 + 8 slice localStorage 迁移重构
- Phase 2.3: useCopyFeedback (7处) + useClock (2处) 共享 Hook 提取
- Phase 3: HotelDashboard / SDKChatPanel / Dashboard React.memo + useMemo 优化
- config/colors.ts 快捷颜色常量导出 + C.alpha() 工具函数
- 三份闭环文档: 审核分析总结 / API架构功能模块 / 教科书式功能模块

### Changed

- 27 个 ESLint warning 修复 (34 → 7): exhaustive-deps / unused-vars / useMemo
- FamilyHome.tsx: 移除不必要的 useMemo，清理未使用导入
- HotelDashboard / FamilyCluster / FamilyHotel: loadInitialData useCallback 提升到 useEffect 之前
- AIChatPanel: handleSend 包裹 useCallback 防止无限重渲染
- 5 个文件 header 规范修复 (check-headers 683 文件全通过)

### Fixed

- TypeScript TDZ 错误: 3 个文件 loadInitialData 声明前使用 → 调整声明顺序
- create-local-store.ts: maxCacheSize 属性访问保持原名 + eslint-disable
- ai-family-local.tsx: lyrics 渲染时数组加 eslint-disable 防无限循环
- react-hooks/exhaustive-deps: 20 处 Zustand setter 补充到依赖数组

---

## [3.4.0] - 2026-04-19

### Added

- Phase 2E: IndexedDB v4 + AI-Family object stores
- Phase 2D: CRDT 工具 + BroadcastChannel Agent 状态同步
- Phase 2C: Agent 编排系统 (think→act→report 生命周期)
- Phase 2B: MCP 上下文管理 + DataBus 桥接 + React Hook
- Phase 2B: MCP 协议核心 (类型 + 服务 + 内置工具集)
- Phase 2A: WebGPU 推理引擎 (@mlc-ai/web-llm)
- 安全加固: AES-GCM 密码加密替代 Base64 编码
- 安全加固: Electron CSP 条件化 (生产环境移除 unsafe-eval)
- 安全加固: shell.execute 命令白名单
- 安全加固: Ghost Mode 生产环境门控
- 安全加固: chart.tsx CSS 注入防护

### Changed

- 数据统一重构: 22 个 Zustand Store Slices 替代 ~65 个独立 localStorage 键
- 路由懒加载: 95.3% 路由使用 React.lazy() (41/43)
- ESLint 全面清零: 35 个错误 + 45 个警告 → 0 错误
- 测试通过率提升: 55 个失败用例修复 → 493+ 测试全通过

### Fixed

- Electron CSP: 生产环境移除 unsafe-inline/unsafe-eval
- useLocalDatabase: btoa/atob 替换为 Web Crypto API AES-GCM
- Ghost Mode: 生产构建自动禁用 (import.meta.env.PROD 门控)
- shell.execute: 仅允许白名单命令 (open/ping/echo 等)
- chart.tsx: 添加 CSS 颜色值正则验证
- 测试: 13 个默认值断言同步更新
- 测试: 22 个 Zustand 迁移测试重写
- ESLint: 6 处 curly 规则 + 5 处未使用导入 + 6 处未使用变量修复

---

## [3.3.0] - 2026-04-09

### Added

- 完整的 CI/CD 自动化流程
- GitHub Actions 工作流（质量门禁、安全审计、性能基准测试）
- Docker 多阶段构建支持
- 安全扫描（Trivy、pnpm audit）
- 测试覆盖率报告

### Changed

- 优化 README.md，添加更多徽章和开源元素
- 数据统一重构 (9 阶段 SSOT)
- React 19 + TypeScript 5.9.3 升级

### Fixed

- 修复所有 TypeScript 编译错误
- IndexedDB 版本不匹配修复
- Store 双重写入消除

---

## [3.2.0] - 2026-03-15

### Added

- AI Family 系统 (9 个 Agent + Hotel + Music + Voice)
- IDE 面板 (终端 + 文件管理 + AI Chat)
- 主题定制系统 + 自定义颜色
- 国际化 (中文/英文)

### Changed

- 路由架构: 35+ 路由全部懒加载
- 设计系统: 赛博朋克主题 (#060e1f + #00d4ff)
- 状态管理: Zustand 统一 store 架构

---

## [0.0.1] - 2026-02-26

### Added

#### 核心功能

- **数据监控仪表盘**
  - 实时节点状态监控（GPU/内存/温度）
  - QPS 与延迟趋势图表
  - 吞吐量历史数据
  - 告警实时推送与处理

- **巡查管理系统**
  - 巡查计划调度
  - 巡查报告生成
  - 巡查历史记录
  - 自动化巡查流程

- **操作中心**
  - 快速操作网格
  - 操作模板管理
  - 实时操作日志流
  - 操作审计功能

- **AI 智能辅助**
  - AI 决策建议面板
  - SDK 流式聊天
  - 操作推荐引擎
  - 模式分析器

- **系统设置**
  - 主题定制（6 套预设主题）
  - 模型供应商管理
  - 网络配置
  - PWA 状态管理

#### 技术特性

- **前端框架**
  - React 18.3.1 + TypeScript 严格模式
  - React Router 7.13.0 (Data Mode)
  - 17 个路由配置

- **样式系统**
  - Tailwind CSS 4.1.12
  - Motion 12.23.24 动画库
  - Radix UI 无头组件库
  - 赛博朋克设计系统（#060e1f + #00d4ff）

- **数据可视化**
  - Recharts 2.15.2 图表库
  - Lucide 0.487.0 图标库
  - 实时数据更新

- **构建工具**
  - Vite 6.3.5
  - Vitest 4.0.18 测试框架
  - 1267 个测试用例，100% 通过率

- **PWA 支持**
  - 离线可用
  - 本地缓存
  - 可安装到主屏幕

- **国际化**
  - 中文简体支持
  - English (US) 支持
  - i18n 架构

#### 开发体验

- **开发工具**
  - ESLint + Prettier 代码规范
  - TypeScript 严格模式
  - 热模块替换 (HMR)

- **测试**
  - 单元测试
  - 集成测试
  - 覆盖率报告（门槛 80%）

- **文档**
  - 完整的项目文档
  - 开发者衔接文档
  - 快速开始指南
  - API 文档

#### 部署

- **Docker 支持**
  - 多阶段构建
  - Nginx 配置
  - Docker Compose

- **CI/CD**
  - GitHub Actions 工作流
  - 自动化测试
  - 自动化构建

### Changed

- 优化项目结构，清晰的分层架构
- 统一类型定义到 `src/app/types/index.ts`
- 重构 Hooks，提高代码复用性

### Technical Debt

- 部分组件需要性能优化
- 需要添加更多集成测试
- 需要完善 E2E 测试

---

## 版本说明

### 版本号规则

- **主版本号 (Major)**：不兼容的 API 修改
- **次版本号 (Minor)**：向下兼容的功能性新增
- **修订号 (Patch)**：向下兼容的问题修正

### 发布周期

- **主版本**：每季度发布一次
- **次版本**：每月发布一次
- **修订版**：根据需要发布

### 分支策略

- `main` - 生产环境代码
- `develop` - 开发环境代码
- `feature/*` - 功能分支
- `release/*` - 发布分支
- `hotfix/*` - 热修复分支

---

## 贡献者

感谢所有为 YYC³ Cloud Intelli-Matrix 做出贡献的开发者！

[贡献者列表](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix/graphs/contributors)

---

## 链接

- [GitHub Releases](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix/releases)
- [提交历史](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix/commits/main)
- [项目看板](https://github.com/orgs/YYC-Cube/projects/1)

---

<div align="center">

**YanYuCloudCube Team**

[Words Initiate Quadrants, Language Serves as Core for Future](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix)

</div>
