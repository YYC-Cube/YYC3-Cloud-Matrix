---
file: COMPONENTS.md
description: AI 模块组件参考手册 - Props 说明与使用示例
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [components, ai, reference]
category: reference
language: zh-CN
audience: developers
complexity: basic
---

<div align="center">

# ✦ YYC3 · AI Components Reference ✦

### 言启千行代码 · 语枢万物智能

**研发团队：YanYuCloudCube** | **联系邮箱：admin@0379.email**

---

</div>

---

## 目录

- [AIDiagnostics](#aidiagnostics)
- [ModelProviderPanel](#modelproviderpanel)
- [AddModelModal](#addmodelmodal)
- [ProviderEditorModal](#providereditormodal)

---

## AIDiagnostics

**组件名：** `AIDiagnostics`  
**路由：** `/ai-diagnosis`  
**文件路径：** `ai/AIDiagnostics.tsx`  
**用途：** AI 诊断面板，提供全平台模型供应商健康度可视化、一键全量诊断、延迟/可用性/配额多维指标监控、故障根因定位与诊断报告导出。

### 核心能力

- 📊 **多维度仪表盘**：连接性、延迟、可用性、配额、模型状态 5 维度实时概览
- 🚀 **一键全量诊断**：对所有已启用供应商并行发起连通性 + 性能测试
- 📈 **历史趋势曲线**：最近 7 天延迟与成功率趋势可视化
- 🔍 **故障根因分析**：连接失败自动拆解为 DNS / TLS / 认证 / 配额 / 超时五类
- 📥 **诊断报告导出**：支持 JSON / Markdown 双格式导出归档

### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `providers` | `ModelProviderConfig[]` | - | ❌ | 指定诊断的供应商列表（不传则取 store 中全部已启用） |
| `autoStart` | `boolean` | `false` | ❌ | 组件挂载后是否自动开始诊断 |
| `onDiagnosisComplete` | `(result: DiagnosisResult[]) => void` | - | ❌ | 全量诊断完成后的回调 |
| `showExport` | `boolean` | `true` | ❌ | 是否显示报告导出按钮 |
| `showHistory` | `boolean` | `true` | ❌ | 是否显示历史趋势区域 |
| `className` | `string` | `''` | ❌ | 自定义外层容器类名 |

**类型补充：**

```typescript
interface DiagnosisResult {
  providerId: string;
  providerType: ModelProvider;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  latencyMs: number;
  successRate: number;        // 0 - 100
  quotaRemaining: number;     // 剩余百分比 0 - 100
  modelsOnline: number;
  modelsTotal: number;
  rootCause?: 'dns' | 'tls' | 'auth' | 'quota' | 'timeout' | 'unknown';
  errorMessage?: string;
  timestamp: number;
}
```

### 使用示例

```tsx
// 路由页面：app/ai-diagnosis/page.tsx
import { AIDiagnostics } from '@/modules/ai';
import { GlassCard } from '@/modules/shared';

export default function AIDiagnosisPage() {
  return (
    <div className="p-6 space-y-6">
      <GlassCard glow="soft">
        <h1 className="text-2xl font-bold text-cyan-100 mb-2">AI 智能诊断中心</h1>
        <p className="text-cyan-300/70">实时监控所有模型供应商的健康状态</p>
      </GlassCard>

      <AIDiagnostics
        autoStart={true}
        showExport={true}
        showHistory={true}
        onDiagnosisComplete={(results) => {
          console.log('诊断完成，异常项：', results.filter(r => r.status !== 'healthy'));
        }}
      />
    </div>
  );
}
```

### 注意事项

- 全量诊断默认超时为 15 秒/供应商，建议 `timeout = Math.min(providers.length * 3s, 15s)`
- `autoStart=true` 时注意页面初始化性能，建议在非首屏路由使用
- 诊断结果会自动写入 `provider-slice.diagnosticHistory`，无需手动持久化
- 历史趋势依赖 store 中累计数据，**首次使用可能为空**，属正常现象

---

## ModelProviderPanel

**组件名：** `ModelProviderPanel`  
**路由：** `/models`  
**文件路径：** `ai/ModelProviderPanel.tsx`  
**用途：** 模型供应商管理面板，展示所有已配置供应商列表、启停状态切换、一键测试连接、入口跳转到添加/编辑弹窗。

### 核心能力

- 📋 **供应商列表**：表格化展示供应商类型、名称、状态、模型数、最后诊断时间
- 🔛 **启用/禁用切换**：行级 Switch 一键切换供应商启用状态
- ✅ **行级连接测试**：单供应商快速 Ping 测试，实时反馈延迟
- ➕ **入口按钮**：一键打开 AddModelModal / ProviderEditorModal
- 🔄 **诊断联动**：从面板入口跳转到 AIDiagnostics 并预选中对应供应商

### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `onAddClick` | `() => void` | 内部打开 `AddModelModal` | ❌ | 「添加模型」按钮点击回调（不传则使用内置弹窗） |
| `onEditClick` | `(providerId: string) => void` | 内部打开 `ProviderEditorModal` | ❌ | 编辑按钮回调（不传则使用内置弹窗，参数为 provider id） |
| `showDiagnosisEntry` | `boolean` | `true` | ❌ | 是否显示跳转到 AI 诊断页的入口 |
| `filterEnabled` | `boolean \| 'all'` | `'all'` | ❌ | 初始过滤：`true` 仅看启用 / `false` 仅看禁用 / `'all'` 全部 |
| `className` | `string` | `''` | ❌ | 自定义外层容器类名 |

### 使用示例

```tsx
// 路由页面：app/models/page.tsx
import { ModelProviderPanel } from '@/modules/ai';
import { GlassCard } from '@/modules/shared';

export default function ModelsPage() {
  return (
    <div className="p-6 space-y-6">
      <GlassCard glow="soft">
        <h1 className="text-2xl font-bold text-cyan-100 mb-2">模型供应商管理</h1>
        <p className="text-cyan-300/70">配置和管理您的 AI 模型供应商与 API 密钥</p>
      </GlassCard>

      <ModelProviderPanel
        filterEnabled="all"
        showDiagnosisEntry={true}
      />
    </div>
  );
}
```

### 自定义弹窗示例（受控模式）

```tsx
import { useState } from 'react';
import { ModelProviderPanel, AddModelModal, ProviderEditorModal } from '@/modules/ai';

export default function CustomModelsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      <ModelProviderPanel
        onAddClick={() => setAddOpen(true)}
        onEditClick={(id) => setEditingId(id)}
      />

      <AddModelModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={() => { toast.success('添加成功'); setAddOpen(false); }}
      />

      <ProviderEditorModal
        open={!!editingId}
        providerId={editingId ?? undefined}
        onOpenChange={(o) => !o && setEditingId(null)}
        onSuccess={() => { toast.success('更新成功'); setEditingId(null); }}
      />
    </>
  );
}
```

### 注意事项

- 默认模式（不传 `onAddClick` / `onEditClick`）会在组件内部渲染弹窗，适合大多数场景
- 受控模式需要调用方自行处理弹窗开关与成功回调，适合需要额外副作用（如埋点）的场景
- 删除供应商会要求二次确认（内置 Dialog），且会同步清理 `provider-slice` 中关联历史

---

## AddModelModal

**组件名：** `AddModelModal`  
**路由：** `/models`（弹窗形式挂载）  
**文件路径：** `ai/AddModelModal.tsx`  
**用途：** 新增模型供应商弹窗，提供供应商类型选择、连接参数表单、API Key 加密录入、**测试连接**异步校验、表单提交全流程。

### 核心能力

- 📝 **表单自适应**：切换供应商类型时，表单字段自动变化（如 Ollama 无 Key / 有 host）
- 🔐 **API Key 加密输入**：密码框 + 眼睛切换显示，提交前自动加密
- ✅ **测试连接按钮**：提交前先 ping 供应商端点，失败时阻止提交并给出明确错误
- 🎯 **模型列表拉取**：连接测试成功后，自动拉取可用模型列表并支持多选默认启用
- 📌 **校验规则**：供应商类型、必填字段、Key 格式、Base URL 合法性全链路校验

### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `open` | `boolean` | - | ✅ | 弹窗是否打开（受控） |
| `onOpenChange` | `(open: boolean) => void` | - | ✅ | 开关状态变更回调 |
| `onSuccess` | `(providerId: string, config: ProviderConfig) => void` | - | ❌ | 保存成功回调，参数为新分配的 providerId 与完整配置 |
| `defaultProvider` | `ModelProvider` | - | ❌ | 预选供应商类型（打开弹窗时默认选中） |
| `requireTestBeforeSave` | `boolean` | `true` | ❌ | 是否强制先通过测试连接才能保存 |
| `className` | `string` | `''` | ❌ | 弹窗容器自定义类名 |

### 使用示例

```tsx
import { useState } from 'react';
import { AddModelModal } from '@/modules/ai';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AddModelExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-cyan-500 hover:bg-cyan-600"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        添加模型供应商
      </Button>

      <AddModelModal
        open={open}
        onOpenChange={setOpen}
        requireTestBeforeSave={true}
        onSuccess={(id, config) => {
          console.log('新增供应商成功', id, config.provider);
        }}
      />
    </>
  );
}
```

### 提交流程说明

```
[1] 选择供应商类型
       ↓
[2] 填写对应字段（API Key / Base URL / 组织 ID 等）
       ↓
[3] 点击「测试连接」（可选开关强制）
     → 成功：显示绿色 + 延迟 + 已发现 X 个模型
     → 失败：红色错误提示（401 / 超时 / DNS）并阻止保存
       ↓
[4] 选择默认启用的模型（多选框，来自 listModels 返回）
       ↓
[5] 点击「保存」
     → API Key 加密为 EncryptedApiKey
     → 写入 provider-slice.providers
     → 触发 onSuccess 回调
```

### 注意事项

- 弹窗关闭时**自动清空**表单（reset），不会残留半填写状态
- `requireTestBeforeSave=true` 时「保存」按钮在测试通过前处于禁用态
- Ollama 类型的 `apiKey` 字段为可选（本地部署通常无 Key），但 host 必须可解析

---

## ProviderEditorModal

**组件名：** `ProviderEditorModal`  
**路由：** `/models`（弹窗形式挂载）  
**文件路径：** `ai/ProviderEditorModal.tsx`  
**用途：** 编辑已有模型供应商配置，支持参数修改、**API Key 轮换**（Key 更新单独校验）、启用模型列表调整、供应商昵称修改。

### 核心能力

- 🔄 **配置回显**：打开弹窗自动回填当前供应商的所有配置
- 🔑 **Key 轮换安全模式**：已存 API Key 默认脱敏显示（`sk-****abcd`），点击「更换 Key」进入编辑态
- 👁️ **密钥零明文**：编辑态下仍使用密码框，不自动填充历史 Key（避免泄露）
- 🧪 **修改后重测**：字段变更后自动提示需重新测试连接，避免保存后立即失效
- 🎛️ **模型细粒度配置**：单个模型启用/禁用、默认 temperature、max_tokens、别名等

### Props 说明

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `open` | `boolean` | - | ✅ | 弹窗是否打开（受控） |
| `providerId` | `string` | - | ✅（`open=true` 时） | 要编辑的供应商 ID（`provider-slice` 中对应条目的 id） |
| `onOpenChange` | `(open: boolean) => void` | - | ✅ | 开关状态变更回调 |
| `onSuccess` | `(providerId: string, config: ProviderConfig) => void` | - | ❌ | 保存成功回调 |
| `allowProviderTypeChange` | `boolean` | `false` | ❌ | 是否允许切换供应商类型（默认不允许，避免历史配置丢失） |
| `className` | `string` | `''` | ❌ | 弹窗容器自定义类名 |

### 使用示例

```tsx
import { useState } from 'react';
import { ProviderEditorModal } from '@/modules/ai';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';

export default function ProviderRow({ providerId }: { providerId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Settings2 className="w-4 h-4 mr-1 text-cyan-400" />
        编辑
      </Button>

      <ProviderEditorModal
        open={open}
        providerId={providerId}
        onOpenChange={setOpen}
        allowProviderTypeChange={false}
        onSuccess={(id, config) => {
          console.log('供应商已更新', id, config.name);
        }}
      />
    </>
  );
}
```

### Key 轮换模式详解

弹窗加载后，`apiKey` 字段默认显示：

```
┌─────────────────────────────────────────────┐
│ API Key                                     │
│ ┌───────────────────────────────────────┐   │
│ │ ********abcd                    👁 🔄 │   │
│ └───────────────────────────────────────┘   │
│                          [更换 Key] 按钮    │
└─────────────────────────────────────────────┘
```

- 点击「更换 Key」后，输入框清空，进入录入模式
- 新 Key 需通过「测试连接」校验后才能保存
- 如果用户未输入新 Key 直接保存，**保留旧 Key 不变**（不会被空值覆盖）

### 注意事项

- `providerId` 在 `open=true` 时必须存在，否则弹窗会显示「未找到该供应商」错误态
- 切换供应商类型可能导致字段 schema 冲突，默认禁用；确需切换建议「删除 → 新建」
- 保存时仅上传**已变更字段**的 diff，避免触发不必要的加密与审计日志

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
