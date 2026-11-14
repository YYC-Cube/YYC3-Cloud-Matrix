---
title: 数据备份（配置中心）真实化 + Ollama 假模型回退清除
date: 2026-11-14
stage: 运维管理 · 数据备份（#/export-center）
commit: e926be5
gates: tsc 0 错 / vitest 292 文件 5094 用例全绿 / vite build 通过
---

# 数据备份（配置中心）真实化 + Ollama 假模型回退清除

## 一、背景与审计结论

导航「运维管理 → 数据备份」对应 `#/export-center`（ConfigExportCenter），
底层是 `full-backup.ts`（全量备份）、`db-queries`（业务数据）、
`env-config`（环境变量）、`provider-slice`（服务商与模型配置）、
`useSettingsStore`（系统设置）五条导出链路。

审计结论：

| 链路 | 结论 |
|---|---|
| full-backup.ts | 真实实现（遍历 localStorage 前缀 + IndexedDB + GlobalStore），无假数据 |
| db-queries | 上一阶段已真实化，导出为空数组属诚实空态 |
| env-config | DEFAULTS 为端点/模型名等**配置定义**，合法 |
| ConfigExportCenter | 发现 2 处问题（见下） |
| provider-slice | 发现 1 处严重假数据（Ollama Mock 回退） |

发现的问题：

1. **provider-slice `fetchOllamaModels` Mock 回退（严重）**：
   Ollama 不可达时伪造 6 个模型（codegeex4 / qwen2.5:7b / gpt-oss:120b-cloud /
   nomic-embed-text / deepseek-v3.1:671b-cloud / qwen2.5-coder:1.5b），
   不仅展示，还**注入 `providers.ollama.models`**，
   使用户误以为本地 Ollama 真实存在这些模型 —— 直接违反真实化红线。
2. **ConfigExportCenter 服务商重置为死按钮**：点击仅 toast「服务商已重置为初始配置」，
   不执行任何实际操作（假反馈）。
3. **文案残留**：业务数据重置 toast 仍写「重置为初始 Mock 数据」。

边界确认（保留不动）：

- `presetModels`（模型管理页「一键预设」按钮）：用户主动触发，
  写入的是真实服务商端点 + 环境变量中的 API Key，属合法便捷功能，非默认展示假数据
- `exportConfig` 的 `!p.isBuiltin || p.updatedAt` 过滤：刻意只导出被用户修改过的
  内置服务商 + 自定义服务商，保持导出精简，导出为空 = 用户未定制，属诚实行为
- `BUILTIN_PROVIDERS`（zhipu/deepseek/ollama 三个定义）：注册表定义，非业务数据

## 二、改造内容

### 1. provider-slice.ts

- `fetchOllamaModels` catch 分支重写：
  - 默认（demoMode 关闭）：`ollamaModels: []` + 诚实错误信息
    「Ollama 连接失败: …」，**不再触碰 provider.models**，返回空数组
  - demoMode 开启：返回 1 条明确标注的演示模型（`demo-llm:latest`，
    错误信息注明「演示模式，以下为演示模型」），且不注入 provider.models
  - 引入 `useSettingsSSOT` 读取 demoMode（无循环依赖，settings-ssot 不引用本 slice）
- 新增 `resetAllProviders()`：内置服务商恢复规范定义；
  自定义服务商及其已配置模型一并移除；挂在内置服务商下的已配置模型
  （含用户 API Key）保留；activeModelId 指向被删模型时置空

### 2. useModelProvider.ts

- 暴露 `resetAllProviders`

### 3. ConfigExportCenter.tsx

- 服务商重置按钮接线到 `modelProvider.resetAllProviders()`，
  toast 改为「服务商已重置：内置恢复定义，自定义已移除」
- 业务数据重置 toast：「已重置为初始 Mock 数据」→「业务数据已清空」

### 4. useModelProvider.test.tsx

- 旧测试断言 Mock 回退 6 模型 → 重写为真实语义：
  连接失败返回空数组、错误信息含「Ollama 连接失败」、
  假模型不得注入 provider.models

## 三、验证证据

### 门禁

| 门禁 | 结果 |
|---|---|
| `tsc --noEmit` | 0 错误 |
| `vitest --run` | 292 文件 / 5094 用例全绿 |
| `vite build` | 通过 |

### 浏览器实证（http://localhost:7100/#/export-center）

1. 五个模块卡正常渲染（服务商/系统设置/业务数据/环境变量/全量备份），
   全页无「Mock 数据」字样
2. 「预览导出 JSON」：业务数据 models/agents/nodes 均为空数组（诚实空态）；
   providers 导出为空 = 用户未定制任何服务商（exportConfig 精简策略，正确）
3. 服务商「恢复默认 → 确认」真实执行：
   持久化存储 `yyc3-provider-slice` 中 providers 精确为
   `["zhipu","deepseek","ollama"]` 三个内置定义，自定义条目已移除

## 四、边界说明

- `ollamaModels` 的真实数据源是 Ollama `/api/tags`，用户本机起 Ollama
  后即显示真实模型列表；不可达时为空 + 错误提示，这是最终正确形态
- `getRecentLogs` / `getModelStats`（db-queries）仍待 AI 智能阶段对接
  用户的模型服务端
