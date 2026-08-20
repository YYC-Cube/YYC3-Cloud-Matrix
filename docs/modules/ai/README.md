---
file: README.md
description: AI 决策与模型管理模块文档 - YYC3 CloudPivot Intelli-Matrix AI 能力中枢
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [guide, ai, module]
category: guide
language: zh-CN
audience: developers
complexity: basic
---

<div align="center">

# ✦ YYC3 · CloudPivot Intelli-Matrix ✦

### 言启千行代码 · 语枢万物智能

**研发团队：YanYuCloudCube** | **联系邮箱：admin@0379.email**

---

</div>

---

## 模块概述

**模块名：** AI 决策与模型管理模块（AI Module）

**模块定位：** YYC3 CloudPivot Intelli-Matrix 平台的 AI 能力中枢，提供 AI 诊断、模型供应商配置与模型生命周期管理。作为整个平台智能能力的核心调度层，统一管理多模型接入、API Key 安全存储与 AI 能力调用入口。

**设计理念：**
- **统一接入，多模型调度**：智谱 / DeepSeek / Ollama 等供应商通过统一抽象层接入
- **安全可信，全链路加密**：API Key 全程加密存储，零信任访问模型
- **智能诊断，自进化运维**：内置 AI 健康诊断面板，实时监控模型可用性与延迟
- **五维驱动架构**：以时间、空间、属性、事件、关联五个维度构建高可用 AI 系统

---

## 功能域矩阵

| 功能域 | 路由路径 | 核心组件 | 复杂度 | 说明 |
|--------|----------|----------|--------|------|
| **AI 诊断** | `/ai-diagnosis` | `AIDiagnostics` | basic | AI 模型健康度监控、延迟检测、可用性诊断 |
| **模型供应商** | `/models` | `ModelProviderPanel` | basic | 供应商列表管理、状态切换、模型在线配置 |
| **添加模型** | `/models`（弹窗） | `AddModelModal` | basic | 新增模型实例、API Key 录入、参数初配置 |
| **供应商编辑** | `/models`（弹窗） | `ProviderEditorModal` | basic | 供应商参数编辑、加密密钥更新、模型版本切换 |
| **AI 决策入口** | `/ai` | 路由挂载 | basic | AI 模块总入口，聚合诊断与供应商管理 |

---

## 文件结构

```
ai/
├── index.ts                  # Barrel 统一导出入口
├── DEV-GUIDE.md              # 模块内部开发指南
├── AIDiagnostics.tsx         # AI 诊断面板（健康监控 + 延迟检测）
├── ModelProviderPanel.tsx    # 模型供应商管理面板
├── AddModelModal.tsx         # 添加模型弹窗
└── ProviderEditorModal.tsx   # 供应商编辑弹窗
```

---

## 导出清单

所有导出通过 `index.ts` Barrel 方式统一暴露：

```typescript
// AI 诊断
export { AIDiagnostics } from './AIDiagnostics';
export type { AIDiagnosticsProps } from './AIDiagnostics';

// 模型供应商面板
export { ModelProviderPanel } from './ModelProviderPanel';
export type { ModelProviderPanelProps } from './ModelProviderPanel';

// 添加模型弹窗
export { AddModelModal } from './AddModelModal';
export type { AddModelModalProps } from './AddModelModal';

// 供应商编辑弹窗
export { ProviderEditorModal } from './ProviderEditorModal';
export type { ProviderEditorModalProps } from './ProviderEditorModal';
```

---

## 依赖关系

### 入站依赖（本模块依赖）

| 依赖包 / 模块 | 用途 | 引用路径 |
|--------------|------|----------|
| `GlassCard` | 毛玻璃卡片容器（诊断卡片、供应商卡片） | `../shared/GlassCard` |
| `useI18n` | 多语言国际化 Hook | `../../hooks/useI18n` |
| `provider-slice` | 模型供应商 Zustand Store（状态管理） | `../../store/slices/provider-slice` |
| `types` | 全局 TypeScript 类型定义（ModelProvider 等） | `../../types` |
| `react` | UI 框架 | ^18.2.0 |
| `lucide-react` | 图标库（Brain、Server、Key、CheckCircle 等） | ^0.300.0 |
| `zustand` | 轻量状态管理（provider-slice 基础） | ^4.4.0 |
| `@radix-ui/react-*` | Radix UI Dialog / Select / Switch 等原语 | 最新 |
| `shadcn/ui` 组件库 | Button / Input / Table / Badge 等 | 内置 |

### 出站依赖（依赖本模块的模块）

| 依赖方 | 用途 | 引用点 |
|--------|------|--------|
| `shared/Sidebar` | 侧边栏导航配置 | `NAV_CATEGORIES.ai` 路由挂载入口 |
| 主应用路由 | `/ai`、`/ai-diagnosis`、`/models` 页面挂载 | `app/ai/**` 路由层 |

---

## 供应商适配说明

本模块内置三家主流模型供应商的适配层，通过统一的 `ModelProvider` 抽象接口接入：

### 1. 智谱 AI（Zhipu / ChatGLM）

| 项目 | 说明 |
|------|------|
| **供应商标识** | `ModelProvider.ZHIPU` |
| **API 端点** | `https://open.bigmodel.cn/api/paas/v4/chat/completions` |
| **默认模型** | `glm-4`、`glm-4-flash`、`glm-3-turbo` |
| **认证方式** | Bearer Token（API Key） |
| **特色能力** | 长文本支持（128K）、中文理解优秀、函数调用 |

### 2. DeepSeek

| 项目 | 说明 |
|------|------|
| **供应商标识** | `ModelProvider.DEEPSEEK` |
| **API 端点** | `https://api.deepseek.com/v1/chat/completions` |
| **默认模型** | `deepseek-chat`、`deepseek-coder` |
| **认证方式** | Bearer Token（API Key） |
| **特色能力** | 代码生成强、推理能力强、高性价比 |

### 3. Ollama（本地部署）

| 项目 | 说明 |
|------|------|
| **供应商标识** | `ModelProvider.OLLAMA` |
| **API 端点** | `http://localhost:11434/api/chat`（可自定义 host） |
| **默认模型** | `llama3`、`qwen2`、`codellama`（需本地 `ollama pull`） |
| **认证方式** | 无（本地）或自定义 Header（如走反向代理） |
| **特色能力** | 完全本地化、数据零出域、支持 GPU 加速、离线可用 |

### 统一适配接口

所有供应商实现以下标准契约，上层业务无需感知差异：

```typescript
interface ProviderAdapter {
  provider: ModelProvider;
  testConnection(config: ProviderConfig): Promise<ConnectionResult>;
  listModels(config: ProviderConfig): Promise<ModelInfo[]>;
  chat(config: ProviderConfig, payload: ChatPayload): Promise<ChatResponse>;
}
```

---

## AI 诊断能力介绍

`AIDiagnostics` 组件提供完整的 AI 健康监控能力，覆盖以下诊断维度：

### 诊断维度矩阵

| 维度 | 指标 | 阈值判定 | 告警级别 |
|------|------|----------|----------|
| **连接性** | API 可达性 | 连接失败 → 红色告警 | P0 - Critical |
| **延迟** | 首 Token 延迟 / 总耗时 | > 3s 黄 / > 8s 红 | P1 / P0 |
| **可用性** | 最近 24h 成功率 | < 99.5% 黄 / < 98% 红 | P2 / P1 |
| **配额** | Token 剩余额度 / RPM | < 10% 黄 / 耗尽红 | P2 / P1 |
| **模型状态** | 具体模型在线数 | 任一核心模型离线 → 黄 | P2 |

### 诊断能力特点

1. **一键全量诊断**：点击「开始诊断」对所有已启用供应商并行检测，10s 内出报告
2. **历史趋势**：展示最近 7 天延迟、成功率曲线（从 `provider-slice` 的 `diagnosticHistory` 读取）
3. **故障定位**：连接失败时自动拆解为「DNS / TLS / 认证 / 配额 / 超时」五类根因
4. **导出报告**：支持 JSON / Markdown 双格式诊断报告导出，便于归档

---

## 新增模型提供商流程

如需接入除智谱 / DeepSeek / Ollama 之外的供应商（如 OpenAI、Anthropic、Moonshot 等），按以下步骤执行：

### 步骤 1：扩展枚举与类型

在 `../../types` 中追加：

```typescript
// 1. types/index.ts
export enum ModelProvider {
  ZHIPU = 'zhipu',
  DEEPSEEK = 'deepseek',
  OLLAMA = 'ollama',
  // 新增
  OPENAI = 'openai',
}

// 2. 追加对应 ProviderConfig 子类型
export interface OpenAIProviderConfig extends ProviderConfigBase {
  provider: ModelProvider.OPENAI;
  apiKey: string;
  baseUrl?: string;       // 兼容代理 / Azure
  organization?: string;
}
```

### 步骤 2：实现适配器

在 `ai/adapters/openai-adapter.ts` 中实现 `ProviderAdapter` 接口：

```typescript
export class OpenAIAdapter implements ProviderAdapter {
  readonly provider = ModelProvider.OPENAI;

  async testConnection(config: OpenAIProviderConfig): Promise<ConnectionResult> {
    // 调用 /v1/models 验证连通性 + Key 有效性
  }

  async listModels(config: OpenAIProviderConfig): Promise<ModelInfo[]> {
    // 拉取模型列表
  }

  async chat(config: OpenAIProviderConfig, payload: ChatPayload): Promise<ChatResponse> {
    // 统一对话调用
  }
}
```

### 步骤 3：注册适配器到工厂

在 `ai/provider-factory.ts` 中追加：

```typescript
providerFactory.register(ModelProvider.OPENAI, new OpenAIAdapter());
```

### 步骤 4：在 ProviderEditorModal 中补充表单字段

扩展 `providerFormSchema`，添加新供应商的专属字段 UI。

### 步骤 5：补充测试

- 单元测试覆盖 `testConnection` 成功 / 失败分支
- E2E 走通「新增 → 测试连接 → 保存 → 诊断」全流程

---

## 配置安全（API Key 加密存储）

本模块遵循 **YYC3 密钥管理安全规范**，API Key 全程加密：

### 加密存储机制

```
用户输入 API Key（明文）
        ↓
AES-256-GCM 加密（密钥来自 window.crypto.subtle + 用户设备指纹派生）
        ↓
写入 provider-slice（内存中为 EncryptedApiKey 类型，不保留明文）
        ↓
持久化到 localStorage / IndexedDB（仅存密文 + IV + Tag）
        ↓
发送请求前（内存中）：临时解密 → 注入 Authorization Header → 请求结束立即销毁明文
```

### 安全保障清单

| 保障项 | 实现方式 |
|--------|----------|
| **零日志** | 任何 `console.log` / 错误上报禁止打印 API Key，脱敏为 `sk-****last4` |
| **防 XSS 窃取** | 加密密钥不落地到 JS 堆可枚举区，使用 `Uint8Array` 零拷贝操作后手动清零 |
| **导入导出** | 供应商配置导出时强制二次密码加密（AES-KDF），导入需同密码解密 |
| **作用域隔离** | 子 iframe / 第三方脚本无法通过 postMessage 获取 Key（strict-origin 校验） |
| **审计日志** | 每次 API Key 使用写入 `provider-slice.usageAudit`，保留 30 天滚动 |

### 开发注意

- 业务层**禁止**直接读取 `config.apiKey`，必须通过 `decryptKey(config.encryptedApiKey)` 并传入 scope 参数
- `decryptKey` 解密后返回的 `DisposableString` 务必使用 `try/finally` 调 `.dispose()` 清零

---

## 测试指南

### 单元测试（Vitest）

```bash
pnpm test:unit src/modules/ai
```

**核心测试点：**

| 测试文件 | 覆盖场景 |
|----------|----------|
| `AIDiagnostics.test.tsx` | 诊断启动 / 诊断中状态 / 失败重试 / 报告导出 |
| `ModelProviderPanel.test.tsx` | 供应商列表渲染 / 启用禁用切换 / 删除确认 |
| `AddModelModal.test.tsx` | 表单校验（必填项 / Key 格式） / 测试连接按钮异步态 |
| `ProviderEditorModal.test.tsx` | 编辑回填 / 加密 Key 脱敏显示 / 保存更新 store |
| `provider-slice.test.ts` | addProvider / updateProvider / removeProvider / rotateKey |
| `adapters/*.test.ts` | 三家供应商 testConnection 成功 / 401 / 超时 场景 |

### 组件交互测试（React Testing Library）

```typescript
// AddModelModal - API Key 格式校验示例
const user = userEvent.setup();
render(<AddModelModal open={true} onOpenChange={fn} />);

await user.selectOptions(screen.getByLabelText('供应商'), ModelProvider.DEEPSEEK);
await user.type(screen.getByLabelText('API Key'), 'invalid-key');
await user.click(screen.getByRole('button', { name: '测试连接' }));

await waitFor(() => {
  expect(screen.getByText('API Key 格式无效，应为 sk- 开头')).toBeInTheDocument();
});
```

### E2E 测试（Playwright）

```typescript
// AI 诊断完整流程
await page.goto('/ai-diagnosis');
await page.click('button:text("开始全量诊断")');
await expect(page.locator('[data-testid="diag-progress"]')).toBeVisible();
await expect(page.locator('[data-testid="diag-result-success"]'), { timeout: 15000 }).toBeVisible();

// 新增模型供应商
await page.goto('/models');
await page.click('button:text("添加模型")');
await page.selectOption('[name="provider"]', ModelProvider.OLLAMA);
await page.fill('[name="baseUrl"]', 'http://localhost:11434');
await page.click('button:text("保存")');
await expect(page.locator('text=Ollama')).toBeInTheDocument();
```

---

## 变更历史

| 版本 | 日期 | 变更内容 | 责任人 |
|------|------|----------|--------|
| v1.0.0 | 2026-08-19 | 🚀 初始版本发布：AI 诊断面板、模型供应商管理、添加/编辑弹窗、智谱/DeepSeek/Ollama 三家适配、AES-256-GCM API Key 加密存储 | YanYuCloudCube Team |

---

<div align="center">

---

## ✦ YanYuCloudCube · 言启千行代码，语枢万物智能 ✦

### 📧 技术支持：admin@0379.email
### 🔗 官方文档：https://docs.yyc3.cloud
### 💬 开发者社区：YYC3 Dev Hub

---

**版权所有 © 2026 YanYuCloudCube Team** · **CloudPivot Intelli-Matrix Platform**

</div>
