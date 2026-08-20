---
file: README.md
description: YYC³ CloudPivot Intelli-Matrix · 模块级开发者文档总索引
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [index],[modules],[docs]
category: guide
language: zh-CN
audience: developers
complexity: intermediate
project: yyc3-cloudpivot-intelli-matrix
phase: development
related_docs: ../../README.md, ../README.md
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 📚 模块级开发者文档 · 总索引

本目录为 **YYC³ CloudPivot Intelli-Matrix** 的模块级开发者文档总入口，覆盖 **1 共享层 + 7 业务模块 = 8 大独立模块** 的全套文档体系。

每个模块子目录下统一提供 **三件套文档**：

| 文档 | 用途 |
|------|------|
| **README.md** | 模块总览：架构、功能域、导出、依赖、使用、测试、变更历史 |
| **COMPONENTS.md** | 组件详解：每个组件的 Props / 用法 / 示例 / 注意事项 |
| **API-REFERENCE.md** | API 参考：完整 TypeScript 签名、类型定义、Hooks、纯函数 |

---

## 🏗️ 模块架构总览

```mermaid
graph TB
    subgraph Shared["🔷 共享层 · Shared Layer"]
        S[shared<br/>全局 UI/UX 共用层]
    end

    subgraph Business["💼 业务模块 · Business Modules"]
        M1[monitor<br/>监控与巡检]
        M2[ops<br/>运维与操作中心]
        M3[ai<br/>AI 决策与模型管理]
        M4[ai-family<br/>AI Family 生态]
        M5[dev<br/>开发工具与 IDE]
        M6[admin<br/>审计与系统管理]
        M7[business<br/>业务场景容器]
    end

    S --> M1 & M2 & M3 & M4 & M5 & M6 & M7

    style Shared fill:rgba(0,212,255,0.12),stroke:#00d4ff
    style Business fill:rgba(191,0,255,0.08),stroke:#bf00ff
```

---

## 📋 模块目录索引

### 🔷 共享层 Shared Layer

| 模块 | 复杂度 | 组件数 | 入口文档 | 说明 |
|------|--------|--------|----------|------|
| **shared** | ⭐⭐ intermediate | 17 | [README.md](./shared/README.md) · [组件](./shared/COMPONENTS.md) · [API](./shared/API-REFERENCE.md) | 全局 UI/UX 共用层 · 布局/认证/错误/品牌/通用交互 |

> ⚠️ **架构规则**：所有 7 个业务模块均依赖 shared，shared **不可反向依赖任何业务模块**，否则破坏单向数据流 → 构建循环依赖。

---

### 👑 管理层 Admin & Dev

| 模块 | 复杂度 | 组件数 | 入口文档 | 说明 |
|------|--------|--------|----------|------|
| **admin** | ⭐⭐ intermediate | 18 | [README.md](./admin/README.md) · [组件](./admin/COMPONENTS.md) · [API](./admin/API-REFERENCE.md) | 审计与系统管理 · 操作审计/用户/设置/安全/PWA/存储/配置中心 |
| **dev** | ⭐⭐⭐ advanced | 30+ | [README.md](./dev/README.md) · [组件](./dev/COMPONENTS.md) · [API](./dev/API-REFERENCE.md) | 开发工具与 IDE · 设计系统/主题/CLI/IDE面板/重构报告/架构审计 |

> 🔗 **跨模块引用**：`admin/SystemSettings` → 引用 `dev/DesignSystemPage` 与 `dev/ThemeCustomizer`（单向，无循环）。

---

### 📊 核心层 Monitor & Ops

| 模块 | 复杂度 | 组件数 | 入口文档 | 说明 |
|------|--------|--------|----------|------|
| **monitor** | ⭐⭐ intermediate | 22 | [README.md](./monitor/README.md) · [组件](./monitor/COMPONENTS.md) · [API](./monitor/API-REFERENCE.md) | 监控与巡检 · 仪表盘/跟进/巡查/告警/AI建议 |
| **ops** | ⭐⭐ intermediate | 19 | [README.md](./ops/README.md) · [组件](./ops/COMPONENTS.md) · [API](./ops/API-REFERENCE.md) | 运维与操作中心 · 操作中心/文件/数据库/服务闭环/报告导出 |

> 🔗 **跨模块引用**：`ops/DatabaseManager` → 引用 `admin/InlineEditableTable`（可编辑表格组件复用）。

---

### 🤖 AI 层 AI & AI Family

| 模块 | 复杂度 | 组件数 | 入口文档 | 说明 |
|------|--------|--------|----------|------|
| **ai** | ⭐ basic | 4 | [README.md](./ai/README.md) · [组件](./ai/COMPONENTS.md) · [API](./ai/API-REFERENCE.md) | AI 决策与模型管理 · AI诊断/模型供应商（智谱/DeepSeek/Ollama） |
| **ai-family** | ⭐⭐⭐ advanced | 30+ | [README.md](./ai-family/README.md) · [组件](./ai-family/COMPONENTS.md) · [API](./ai-family/API-REFERENCE.md) | AI Family 生态 · 8 位家人角色系统 + 13 Zustand Slices |

---

### 💼 业务层 Business Scenarios

| 模块 | 复杂度 | 组件数 | 入口文档 | 说明 |
|------|--------|--------|----------|------|
| **business** | ⭐ basic | 2 | [README.md](./business/README.md) · [组件](./business/COMPONENTS.md) · [API](./business/API-REFERENCE.md) | 业务场景容器 · 智慧酒店 / 通讯站管理（面向行业扩展） |

---

## 📊 文档统计总览

| 模块 | README | COMPONENTS | API-REFERENCE | 组件数 | Store | 类型数 | 复杂度 |
|------|--------|------------|---------------|--------|-------|--------|--------|
| shared | ✅ | ✅ (17) | ✅ | 17 | 0 | 35+ | intermediate |
| admin | ✅ | ✅ (18) | ✅ | 18 | 0 | 27+ | intermediate |
| monitor | ✅ | ✅ (22) | ✅ | 22 | 0 | 48+ | intermediate |
| ops | ✅ | ✅ (19) | ✅ | 19 | 0 | 60+ | intermediate |
| ai | ✅ | ✅ (4) | ✅ | 4 | 1 slice | 15+ | basic |
| ai-family | ✅ | ✅ (30+) | ✅ | 30+ | **13 slices** | 60+ | advanced |
| dev | ✅ | ✅ (30+) | ✅ | 30+ | 5 slices | 40+ | advanced |
| business | ✅ | ✅ (2) | ✅ | 2 | 0 | 10+ | basic |
| **合计** | **8** | **8** | **8** | **~142** | **19** | **~295+** | - |

---

## 🧭 文档导航建议

### 新开发者 → 按顺序阅读

```
0. 本索引文档（了解模块划分与依赖）
      ↓
1. ../../README.md（项目总览 + 快速开始）
      ↓
2. shared/README.md（共享层 → 所有模块的基础）
      ↓
3. 按职责阅读业务模块：
   ├── 监控开发  → monitor/
   ├── 运维开发  → ops/
   ├── AI 开发   → ai/ → ai-family/
   ├── 工具开发  → dev/
   ├── 平台管理  → admin/
   └── 业务开发  → business/
```

### 调试问题 → 快速定位

| 场景 | 跳转文档 |
|------|----------|
| 组件如何 Props 传参？ | `{module}/COMPONENTS.md` → 搜索组件名 |
| API 类型签名是什么？ | `{module}/API-REFERENCE.md` → 字母序索引 |
| 新增组件步骤？ | `{module}/README.md` → "新增 xxx 流程"章节 |
| 跨模块能引用吗？ | 本页 Mermaid 图 + 各 README 的"依赖关系" |
| 测试怎么写？ | 各 README 的"测试指南"章节 |

---

## ✅ YYC³ 五维评估标准

本模块级文档体系严格遵循 **五高架构 + 五标体系**：

| 维度 | 覆盖情况 |
|------|----------|
| **高可用** | 每个 README 的测试指南、依赖关系、错误处理 |
| **高性能** | dev 模块 Oklch 色彩体系 / monitor 数据流架构 |
| **高安全** | ai 模块 AES-256-GCM Key 存储 / admin 权限矩阵 |
| **高扩展** | ai 适配器模式 / business Phase 1-3 扩展规划 |
| **高智能** | ai-family 8 角色 + 13 slices 智能交互体系 |

| 标准 | 落实情况 |
|------|----------|
| **标准化** | 8 模块文档三件套结构 100% 统一 |
| **规范化** | YAML Front Matter 13 字段 + 品牌区完整 |
| **自动化** | 可对接 `scripts/doc-standard-check.js` 检查 |
| **可视化** | Mermaid 架构图 / 数据流图 / 状态序列图 |
| **智能化** | 索引推荐阅读路径 + 问题→文档跳转速查表 |

---

## 📄 文档合规性验证

所有子模块文档均符合 **YYC³ 团队统一开发标准**：

- [x] **YAML Front Matter**：file / description / author / version / created / updated / status / tags / category / language / audience / complexity 全部必填字段齐全
- [x] **品牌标语块**：中英双语六行品牌标语一致
- [x] **三件套齐全**：README + COMPONENTS + API-REFERENCE
- [x] **语义化版本**：全部 v1.0.0 初始发布
- [x] **变更历史**：每个 README 末尾含版本对照表
- [x] **联系方式**：底部统一 `<admin@0379.email>`

---

## 🔄 与源码 DEV-GUIDE.md 的映射关系

每个模块在 `src/app/modules/{module}/DEV-GUIDE.md` 下保留**精简版**开发指引（用于源码内就近查阅）；完整版、结构化、带 API 签名和 Props 详解的文档位于本目录 `docs/modules/{module}/` 下。

| 源码精简文档 | 本目录完整文档 | 差异 |
|--------------|---------------|------|
| `src/app/modules/shared/DEV-GUIDE.md` | [shared/README.md](./shared/README.md) | 本目录新增 COMPONENTS / API-REFERENCE + 测试/贡献章节 |
| `src/app/modules/admin/DEV-GUIDE.md` | [admin/README.md](./admin/README.md) | 本目录新增安全权限矩阵 + 18 组件详细 Props |
| `src/app/modules/monitor/DEV-GUIDE.md` | [monitor/README.md](./monitor/README.md) | 本目录新增数据流设计 + 7 域测试用例清单 |
| `src/app/modules/ops/DEV-GUIDE.md` | [ops/README.md](./ops/README.md) | 本目录新增运维最佳实践 + 备份恢复指南 |
| `src/app/modules/ai/DEV-GUIDE.md` | [ai/README.md](./ai/README.md) | 本目录新增供应商适配器 + Key 安全存储详解 |
| `src/app/modules/ai-family/DEV-GUIDE.md` | [ai-family/README.md](./ai-family/README.md) | 本目录新增 8 角色介绍 + 13 Slices 状态矩阵 |
| `src/app/modules/dev/DEV-GUIDE.md` | [dev/README.md](./dev/README.md) | 本目录新增 Oklch 色彩体系 + 终端命令手册 |
| `src/app/modules/business/DEV-GUIDE.md` | [business/README.md](./business/README.md) | 本目录新增行业扩展路线图 + 4 步业务接入 |

> 💡 **维护建议**：更新源码结构后，优先修改 `DEV-GUIDE.md`（就近），然后同步更新本目录三件套（全面）。可通过运行 `pnpm run docs:check` 检查一致性。

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-08-19 | 初始版本 — 8 模块三件套文档体系正式发布，覆盖 shared/admin/monitor/ops/ai/ai-family/dev/business 全部模块 | YanYuCloudCube Team |

---

<div align="center">

**[⬆ 返回顶部](#-模块级开发者文档--总索引)** · **[项目总览](../../README.md)** · **[文档根目录](../README.md)** · **[源码模块目录](../../src/app/modules/)**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
