---
file: API-REFERENCE.md
description: AI 模块 API 参考手册 - index.ts 完整导出清单、provider-slice 状态与 ModelProvider 类型枚举
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [api, ai, reference, typescript]
category: reference
language: zh-CN
audience: developers
complexity: basic
---

<div align="center">

# ✦ YYC3 · AI API Reference ✦

### 言启千行代码 · 语枢万物智能

**研发团队：YanYuCloudCube** | **联系邮箱：admin@0379.email**

---

</div>

---

## 目录

- [导入方式](#导入方式)
- [组件 API](#组件-api)
  - [\<AIDiagnostics /\>](#aidiagnostics-)
  - [\<ModelProviderPanel /\>](#modelproviderpanel-)
  - [\<AddModelModal /\>](#addmodelmodal-)
  - [\<ProviderEditorModal /\>](#providereditormodal-)
- [provider-slice 状态 API](#provider-slice-状态-api)
  - [State 类型](#state-类型)
  - [Actions API](#actions-api)
  - [Store Hook 使用示例](#store-hook-使用示例)
- [ModelProvider 类型枚举与配置](#modelprovider-类型枚举与配置)
  - [ModelProvider 枚举](#modelprovider-枚举)
  - [ProviderConfig 类型族](#providerconfig-类型族)
  - [Diagnosis / 结果类型](#diagnosis--结果类型)
- [类型定义附录](#类型定义附录)
- [index.ts 完整导出清单（对照）](#indexts-完整导出清单对照)

---

## 导入方式

所有 API 通过 Barrel 入口统一导出，调用方使用单一路径即可：

```typescript
// ✅ 推荐（支持 tree-shaking）
import {
  AIDiagnostics,
  ModelProviderPanel,
  AddModelModal,
  ProviderEditorModal,
  useProviderStore,
  ModelProvider,
  type ProviderConfig,
  type DiagnosisResult,
} from '@/modules/ai';

// ❌ 不推荐（绕过 Barrel，打破封装）
import { AIDiagnostics } from '@/modules/ai/AIDiagnostics';
```

---

## 组件 API

---

### \<AIDiagnostics /\>

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<AIDiagnosticsProps>` |
| **组件类型** | Client Component（含异步诊断 + 状态管理） |

```typescript
// 类型签名
interface AIDiagnosticsProps {
  providers?: ModelProviderConfig[];
  autoStart?: boolean;                          // default: false
  onDiagnosisComplete?: (result: DiagnosisResult[]) => void;
  showExport?: boolean;                         // default: true
  showHistory?: boolean;                        // default: true
  className?: string;
}

declare const AIDiagnostics: React.FC<AIDiagnosticsProps>;
```

**导出路径：** `ai/AIDiagnostics.tsx` → `ai/index.ts`

**连带导出类型：** `AIDiagnosticsProps`、`DiagnosisResult`

---

### \<ModelProviderPanel /\>

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<ModelProviderPanelProps>` |
| **组件类型** | Client Component（表格 + 弹窗入口） |

```typescript
// 类型签名
interface ModelProviderPanelProps {
  onAddClick?: () => void;
  onEditClick?: (providerId: string) => void;
  showDiagnosisEntry?: boolean;                 // default: true
  filterEnabled?: boolean | 'all';              // default: 'all'
  className?: string;
}

declare const ModelProviderPanel: React.FC<ModelProviderPanelProps>;
```

**导出路径：** `ai/ModelProviderPanel.tsx` → `ai/index.ts`

**连带导出类型：** `ModelProviderPanelProps`

---

### \<AddModelModal /\>

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<AddModelModalProps>` |
| **组件类型** | Client Component（Radix Dialog + 受控表单） |

```typescript
// 类型签名
interface AddModelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (providerId: string, config: ProviderConfig) => void;
  defaultProvider?: ModelProvider;
  requireTestBeforeSave?: boolean;              // default: true
  className?: string;
}

declare const AddModelModal: React.FC<AddModelModalProps>;
```

**导出路径：** `ai/AddModelModal.tsx` → `ai/index.ts`

**连带导出类型：** `AddModelModalProps`

---

### \<ProviderEditorModal /\>

| 项目 | 说明 |
|------|------|
| **导出方式** | Named Export |
| **类型签名** | `React.FC<ProviderEditorModalProps>` |
| **组件类型** | Client Component（Radix Dialog + 编辑态表单 + Key 轮换） |

```typescript
// 类型签名
interface ProviderEditorModalProps {
  open: boolean;
  providerId?: string;                          // open=true 时必填
  onOpenChange: (open: boolean) => void;
  onSuccess?: (providerId: string, config: ProviderConfig) => void;
  allowProviderTypeChange?: boolean;            // default: false
  className?: string;
}

declare const ProviderEditorModal: React.FC<ProviderEditorModalProps>;
```

**导出路径：** `ai/ProviderEditorModal.tsx` → `ai/index.ts`

**连带导出类型：** `ProviderEditorModalProps`

---

## provider-slice 状态 API

AI 模块的所有供应商状态通过 Zustand Store（`../../store/slices/provider-slice`）统一管理。本模块通过 `ai/index.ts` 再导出 `useProviderStore` Hook，业务层无需关心底层实现。

### State 类型

```typescript
interface ProviderSliceState {
  /** 已配置的供应商列表（含加密密钥） */
  providers: ModelProviderConfig[];

  /** 诊断历史（滚动保留最近 100 条） */
  diagnosticHistory: DiagnosisResult[];

  /** 使用审计日志（滚动保留最近 500 条，30 天自动清理） */
  usageAudit: UsageAuditRecord[];

  /** 诊断进行中的供应商 ID 集合 */
  diagnosingIds: Set<string>;

  /** UI 过滤条件（持久化） */
  uiFilter: {
    search: string;
    status: 'all' | 'enabled' | 'disabled';
    sortBy: 'name' | 'provider' | 'lastDiagAt';
  };

  /** 加载 / 错误状态 */
  status: {
    loading: boolean;
    saving: boolean;
    error: string | null;
  };
}
```

**字段说明表：**

| 字段 | 类型 | 初始值 | 说明 |
|------|------|--------|------|
| `providers` | `ModelProviderConfig[]` | `[]` | 供应商配置列表，`apiKey` 字段以 `EncryptedApiKey` 类型存储 |
| `diagnosticHistory` | `DiagnosisResult[]` | `[]` | 最近 100 条诊断结果（FIFO 滚动） |
| `usageAudit` | `UsageAuditRecord[]` | `[]` | 每次 API Key 使用（解密/发送请求）都会写入审计 |
| `diagnosingIds` | `Set<string>` | `new Set()` | AIDiagnostics 正在诊断的供应商 ID 集（用于表格行 loading 态） |
| `uiFilter.search` | `string` | `''` | 供应商列表搜索关键词 |
| `uiFilter.status` | `'all' \| 'enabled' \| 'disabled'` | `'all'` | 列表状态过滤 |
| `uiFilter.sortBy` | `'name' \| 'provider' \| 'lastDiagAt'` | `'lastDiagAt'` | 列表排序方式 |
| `status.loading` | `boolean` | `false` | 初次从持久化恢复中的加载态 |
| `status.saving` | `boolean` | `false` | 保存中的全局 loading |
| `status.error` | `string \| null` | `null` | 最近一次错误（由组件层消费显示） |

### Actions API

```typescript
interface ProviderSliceActions {
  // ===== 供应商 CRUD =====
  addProvider(config: Omit<ModelProviderConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateProvider(id: string, patch: Partial<ModelProviderConfig>): Promise<void>;
  removeProvider(id: string): Promise<void>;
  getProvider(id: string): ModelProviderConfig | undefined;

  // ===== 启用/禁用 =====
  setProviderEnabled(id: string, enabled: boolean): void;

  // ===== 密钥相关 =====
  /** 安全轮换 API Key，内部会解密旧值 → 比对 → 加密新值 → 写入审计 */
  rotateApiKey(id: string, newApiKeyPlain: string): Promise<void>;
  /** 一次性使用解密，返回 DisposableString（务必 dispose） */
  decryptApiKey(id: string, scope: string): Promise<DisposableString | null>;

  // ===== 诊断 =====
  startDiagnosis(ids?: string[]): Promise<DiagnosisResult[]>;
  appendDiagnosisResult(result: DiagnosisResult): void;
  clearDiagnosticHistory(): void;

  // ===== 审计 =====
  appendUsageAudit(record: Omit<UsageAuditRecord, 'id' | 'timestamp'>): void;
  purgeOldAudits(beforeDays?: number): number;

  // ===== UI 过滤 =====
  setUiFilter(patch: Partial<ProviderSliceState['uiFilter']>): void;
  resetUiFilter(): void;

  // ===== 持久化 =====
  hydrate(): Promise<void>;     // 从 localStorage/IndexedDB 恢复
  persist(): Promise<void>;     // 强制写盘（正常为自动 debounce）
  resetAll(): void;             // 危险操作：清空所有供应商 + 历史 + 审计
}
```

**Actions 说明表：**

| Action | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `addProvider` | `config`（不含 id） | `Promise<string>`（新 id） | 自动加密 apiKey，写入审计，返回新分配的 ULID |
| `updateProvider` | `id`, `patch` | `Promise<void>` | 合并更新，变更字段自动写入审计，如需改 Key 请用 `rotateApiKey` |
| `removeProvider` | `id` | `Promise<void>` | 删除前二次校验由组件层负责，store 层直接删 |
| `getProvider` | `id` | `ModelProviderConfig \| undefined` | 同步读取，无需 await |
| `setProviderEnabled` | `id`, `enabled` | `void` | 仅切换 `enabled` 标志，同步更新 `updatedAt` |
| `rotateApiKey` | `id`, `newApiKeyPlain` | `Promise<void>` | **唯一推荐**的改 Key 方式，自动触发加密 + 审计 |
| `decryptApiKey` | `id`, `scope` | `Promise<DisposableString \| null>` | 解密一次性使用，scope 用于审计记录（如 `'chat:gpt-4'`） |
| `startDiagnosis` | `ids?`（可选，缺省=所有启用） | `Promise<DiagnosisResult[]>` | 并行调用对应适配器 `testConnection` |
| `appendDiagnosisResult` | `result` | `void` | 通常内部调用，外部自定义诊断可手工追加 |
| `clearDiagnosticHistory` | - | `void` | 清空诊断历史（保留审计不变） |
| `appendUsageAudit` | `record`（无 id/ts） | `void` | Key 解密使用时自动调用，外部自定义请求也应显式调用 |
| `purgeOldAudits` | `beforeDays`（默认 30） | `number`（删除条数） | 手动清理过期审计 |
| `setUiFilter` | `patch` | `void` | 局部更新 uiFilter |
| `resetUiFilter` | - | `void` | 恢复默认过滤 |
| `hydrate` | - | `Promise<void>` | 初始化时自动调用一次，业务层一般无需手调 |
| `persist` | - | `Promise<void>` | 通常自动 debounce 持久化，关键操作后可手动 force |
| `resetAll` | - | `void` | 危险操作，组件层会有二次确认弹窗 |

### Store Hook 使用示例

```tsx
import { useProviderStore, ModelProvider } from '@/modules/ai';

// 1. 读取所有启用的供应商
const enabledProviders = useProviderStore((s) =>
  s.providers.filter(p => p.enabled)
);

// 2. 添加新供应商
const addProvider = useProviderStore((s) => s.addProvider);
const id = await addProvider({
  provider: ModelProvider.DEEPSEEK,
  name: '团队主 DeepSeek',
  enabled: true,
  apiKeyPlain: 'sk-xxxx',   // store 内部自动加密，不存明文
  baseUrl: 'https://api.deepseek.com',
  models: ['deepseek-chat'],
});

// 3. 安全使用密钥（用完 dispose）
const decryptApiKey = useProviderStore((s) => s.decryptApiKey);
const key = await decryptApiKey(id, 'chat:deepseek-chat');
if (key) {
  try {
    await fetch('https://api.deepseek.com/v1/chat/completions', {
      headers: { Authorization: `Bearer ${key.value}` },
    });
  } finally {
    key.dispose();  // 手动清零内存
  }
}

// 4. 发起全量诊断
const startDiagnosis = useProviderStore((s) => s.startDiagnosis);
const results = await startDiagnosis();
console.log(`健康 ${results.filter(r => r.status === 'healthy').length}/${results.length}`);
```

---

## ModelProvider 类型枚举与配置

### ModelProvider 枚举

```typescript
/**
 * 支持的模型供应商类型枚举
 * 新增供应商需在此追加，并实现对应的 ProviderAdapter
 */
export enum ModelProvider {
  /** 智谱 AI（ChatGLM / GLM-4） */
  ZHIPU = 'zhipu',
  /** DeepSeek（深度求索） */
  DEEPSEEK = 'deepseek',
  /** Ollama（本地部署模型网关） */
  OLLAMA = 'ollama',
}
```

**枚举项元信息（辅助映射）：**

```typescript
export const MODEL_PROVIDER_META: Record<ModelProvider, {
  label: string;
  defaultBaseUrl: string;
  defaultModels: string[];
  requiresApiKey: boolean;
  icon: string;          // 图标 key（lucide）
  color: string;         // 主题色
}> = {
  [ModelProvider.ZHIPU]: {
    label: '智谱 AI',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModels: ['glm-4', 'glm-4-flash', 'glm-3-turbo'],
    requiresApiKey: true,
    icon: 'Sparkles',
    color: '#00d4ff',
  },
  [ModelProvider.DEEPSEEK]: {
    label: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModels: ['deepseek-chat', 'deepseek-coder'],
    requiresApiKey: true,
    icon: 'BrainCircuit',
    color: '#5E6AD2',
  },
  [ModelProvider.OLLAMA]: {
    label: 'Ollama',
    defaultBaseUrl: 'http://localhost:11434/api',
    defaultModels: ['llama3', 'qwen2', 'codellama'],
    requiresApiKey: false,
    icon: 'Server',
    color: '#10b981',
  },
};
```

### ProviderConfig 类型族

```typescript
/** 加密后的 API Key（opaque 类型，业务层不解析内部结构） */
export type EncryptedApiKey = string & { readonly __brand: 'EncryptedApiKey' };

/** 配置基类（所有供应商共有字段） */
interface ProviderConfigBase {
  id: string;                    // ULID
  name: string;                  // 用户给的昵称，如"团队主模型"
  provider: ModelProvider;
  enabled: boolean;
  baseUrl: string;
  encryptedApiKey: EncryptedApiKey;
  organizationId?: string;       // 部分供应商需要（如 OpenAI）
  models: ModelInstance[];       // 该供应商下启用的模型列表
  createdAt: number;             // ms timestamp
  updatedAt: number;             // ms timestamp
  lastDiagnosedAt?: number;      // 上次诊断时间
  meta?: Record<string, unknown>; // 扩展字段（如 Ollama GPU 配置）
}

/** 模型实例（供应商下的具体模型） */
interface ModelInstance {
  modelName: string;             // 如 "glm-4"
  displayName?: string;          // 用户自定义别名
  enabled: boolean;
  defaultTemperature?: number;   // 0 - 2
  defaultMaxTokens?: number;
  capabilities?: ModelCapability[]; // 如 "chat" | "embedding" | "vision"
}

/** 能力枚举 */
export type ModelCapability = 'chat' | 'completion' | 'embedding' | 'vision' | 'audio' | 'function_call';

/** 智谱专属配置 */
export interface ZhipuProviderConfig extends ProviderConfigBase {
  provider: ModelProvider.ZHIPU;
}

/** DeepSeek 专属配置 */
export interface DeepSeekProviderConfig extends ProviderConfigBase {
  provider: ModelProvider.DEEPSEEK;
}

/** Ollama 专属配置 */
export interface OllamaProviderConfig extends ProviderConfigBase {
  provider: ModelProvider.OLLAMA;
  meta: {
    /** Ollama 特有的本地请求并发数 */
    concurrentRequests?: number;
    /** 是否启用 GPU 加速（本地） */
    gpuAcceleration?: boolean;
  };
}

/** 联合类型（Discriminated Union，通过 provider 字段区分） */
export type ProviderConfig = ZhipuProviderConfig | DeepSeekProviderConfig | OllamaProviderConfig;

/** 新增时的配置（不含自动生成字段 + 传入明文 Key） */
export type NewProviderInput = Omit<ProviderConfigBase, 'id' | 'createdAt' | 'updatedAt' | 'encryptedApiKey'> & {
  apiKeyPlain: string;
};
```

**ProviderConfig 关键字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string`（ULID） | ✅ | 系统生成，不可修改 |
| `name` | `string` | ✅ | 昵称，用于列表展示，建议 2-20 字 |
| `provider` | `ModelProvider` | ✅ | 供应商类型（区分联合类型的 discriminator） |
| `enabled` | `boolean` | ✅ | 是否在诊断 / 调度中启用 |
| `baseUrl` | `string` | ✅ | API 端点，支持 http/https |
| `encryptedApiKey` | `EncryptedApiKey` | ✅ | **只存密文**，明文绝不进入此字段 |
| `models` | `ModelInstance[]` | ✅ | 至少 1 个，可随时增删 |

### Diagnosis / 结果类型

```typescript
/** 诊断状态分级 */
export type DiagnosisStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'diagnosing';

/** 失败根因枚举 */
export type DiagnosisRootCause =
  | 'dns'          // 域名解析失败
  | 'tls'          // 证书 / 握手失败
  | 'auth'         // 401 / 403 认证错误
  | 'quota'        // 429 超限 / 额度不足
  | 'timeout'      // 超过阈值无响应
  | 'server_error' // 5xx 服务端错误
  | 'unknown';     // 其他

/** 单次诊断结果 */
export interface DiagnosisResult {
  id: string;                          // ULID
  providerId: string;                  // 对应 providers.id
  providerType: ModelProvider;
  status: DiagnosisStatus;
  latencyMs: number;                   // 总耗时，失败为 -1
  firstTokenLatencyMs?: number;        // 首 Token 延迟（流式场景）
  successRate: number;                 // 0 - 100，全量诊断基于 3 次取样
  quotaRemaining?: number;             // 0 - 100，百分比（部分供应商不支持）
  rpmRemaining?: number;               // 剩余 RPM（每分钟请求数）
  tpmRemaining?: number;               // 剩余 TPM（每分钟 Token）
  modelsOnline: number;
  modelsTotal: number;
  rootCause?: DiagnosisRootCause;
  errorMessage?: string;               // 原始错误（脱敏后）
  timestamp: number;                   // 诊断发生时间 ms
}

/** 使用审计记录 */
export interface UsageAuditRecord {
  id: string;
  providerId: string;
  scope: string;                       // 解密时传入的用途（如 "chat:gpt-4"）
  action: 'decrypt_key' | 'rotate_key' | 'add_provider' | 'remove_provider' | 'update_config';
  status: 'success' | 'failed';
  errorReason?: string;
  timestamp: number;
  operator?: string;                   // 当前用户 ID（如系统有用户体系）
}

/** 连接测试返回（适配器层） */
export interface ConnectionResult {
  ok: boolean;
  latencyMs: number;
  modelsFound?: ModelInstance[];
  rootCause?: DiagnosisRootCause;
  message?: string;
}

/** 可清零的字符串（密钥使用完毕后 dispose 防止堆泄漏） */
export interface DisposableString {
  readonly value: string;
  dispose(): void;                     // 内部 memset 清零
  readonly disposed: boolean;
}
```

---

## 类型定义附录

以下为 `ai/index.ts` 中所有 **连带导出的 TypeScript 类型** 汇总表：

| 类型名 | 归属 | 类型分类 | 说明 |
|--------|------|----------|------|
| `AIDiagnosticsProps` | AIDiagnostics | Interface | 诊断面板 Props |
| `ModelProviderPanelProps` | ModelProviderPanel | Interface | 供应商面板 Props |
| `AddModelModalProps` | AddModelModal | Interface | 添加弹窗 Props |
| `ProviderEditorModalProps` | ProviderEditorModal | Interface | 编辑弹窗 Props |
| `ModelProvider` | types | Enum | 供应商类型枚举：zhipu / deepseek / ollama |
| `EncryptedApiKey` | types | Branded Type | 加密后 Key（opaque，不解析内部） |
| `ProviderConfigBase` | types | Interface | 供应商配置基类 |
| `ZhipuProviderConfig` | types | Interface | 智谱配置 |
| `DeepSeekProviderConfig` | types | Interface | DeepSeek 配置 |
| `OllamaProviderConfig` | types | Interface | Ollama 配置 |
| `ProviderConfig` | types | Union Type | 三家供应商配置联合类型 |
| `NewProviderInput` | types | Type Alias | 新增供应商入参（明文 Key） |
| `ModelInstance` | types | Interface | 单模型实例 |
| `ModelCapability` | types | Union Literal | 模型能力：chat / embedding / vision 等 |
| `DiagnosisStatus` | types | Union Literal | healthy / warning / critical 等 |
| `DiagnosisRootCause` | types | Union Literal | dns / tls / auth / quota 等 |
| `DiagnosisResult` | types | Interface | 完整诊断结果 |
| `UsageAuditRecord` | types | Interface | 密钥使用审计 |
| `ConnectionResult` | types | Interface | 适配器层连接测试返回 |
| `DisposableString` | types | Interface | 可手动清零的字符串（防泄漏） |
| `ProviderSliceState` | provider-slice | Interface | Zustand Store State 类型 |
| `ProviderSliceActions` | provider-slice | Interface | Zustand Store Actions 类型 |

---

## index.ts 完整导出清单（对照）

```typescript
// ============= ai/index.ts =============

// --- 组件 ---
export { AIDiagnostics } from './AIDiagnostics';
export type { AIDiagnosticsProps } from './AIDiagnostics';

export { ModelProviderPanel } from './ModelProviderPanel';
export type { ModelProviderPanelProps } from './ModelProviderPanel';

export { AddModelModal } from './AddModelModal';
export type { AddModelModalProps } from './AddModelModal';

export { ProviderEditorModal } from './ProviderEditorModal';
export type { ProviderEditorModalProps } from './ProviderEditorModal';

// --- Store（再导出） ---
export {
  useProviderStore,
  // 若导出 selectors / helpers，统一从这里暴露
} from '../../store/slices/provider-slice';
export type {
  ProviderSliceState,
  ProviderSliceActions,
} from '../../store/slices/provider-slice';

// --- 类型（再导出自 ../../types） ---
export {
  ModelProvider,
  MODEL_PROVIDER_META,
} from '../../types';
export type {
  EncryptedApiKey,
  ProviderConfigBase,
  ZhipuProviderConfig,
  DeepSeekProviderConfig,
  OllamaProviderConfig,
  ProviderConfig,
  NewProviderInput,
  ModelInstance,
  ModelCapability,
  DiagnosisStatus,
  DiagnosisRootCause,
  DiagnosisResult,
  UsageAuditRecord,
  ConnectionResult,
  DisposableString,
} from '../../types';
```

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
