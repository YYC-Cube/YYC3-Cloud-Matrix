---
title: AI 智能域 — AI 诊断真实规则分析 + SDK 对话/AI 决策审计
date: 2026-11-14
stage: AI 智能（AI 诊断 / SDK 对话 / AI 决策）
commit: 9614662
gates: tsc 0 错 / vitest 292 文件 5095 用例全绿 / vite build 通过
---

# AI 智能域：AI 诊断真实规则分析 + SDK 对话 / AI 决策审计

## 一、审计结论

| 模块 | 路由 | 审计结果 |
|---|---|---|
| AI 诊断 AIDiagnostics + useAIDiagnostics | `#/ai-diagnosis` | **有假数据，本次改造** |
| SDK 对话 SDKChatPanel + useBigModelSDK | `#/sdk-chat` | 已真实化（此前阶段完成），本次确认 |
| AI 决策 ai-suggestion-slice | `#/ai` | 已真实化（v3 清种子 + deriveFromRealData + 真实跟进工单），本次确认 |

### AI 诊断发现的假数据问题（已全部清除）

1. **整页假诊断产物**：`generatePatterns/Anomalies/Actions/Forecasts` 四个生成器
   全部用 `Math.random()` 编造异常模式、越限事件、处置建议与预测，
   节点名硬编码 GPU-A100-01~06、Inference-Engine-01 等
2. **假诊断历史**：`createInitialHistory()` 在 IndexedDB 为空时展示 3 条
   编造的「历史诊断记录」
3. **真实模式被阉割**：demoMode 关闭时 `startDiagnosis` 直接拒绝执行
   （toast 引导开演示模式）——页面在生产模式下是完全的死功能

### SDK 对话 / AI 决策确认合法（未改动）

- useBigModelSDK：Mock 回复仅 demoMode 可达；关闭时未配置 API Key
  返回配置引导文案（MOCK_DISABLED_GUIDE）；连接测试不返回假阳性；
  会话/用量统计初始全空全零
- ai-suggestion-slice：v3 已清假种子；runAnalysis 用 `deriveFromRealData()`
  基于真实节点与告警流推导；applyRecommendation 生成真实 follow-up 工单

## 二、改造内容（useAIDiagnostics）

### 真实规则分析引擎（demoMode 关闭路径，即生产路径）

- **异常检测 `buildRealAnomalies`**：遍历实时节点快照，GPU≥75% /
  内存≥80% / 温度≥70°C 越限即产出异常（expectedValue=阈值、
  actualValue=真实值、deviation 实算）；全局推理延迟 ≥80ms 同样越限检测。
  阈值集中为 `SAFE_BASELINE` 工程定义
- **模式识别 `buildRealPatterns`**：仅当吞吐采样历史 ≥6 个真实点时，
  从 QPS/延迟序列实算斜率，产出「渐进上升/下降」模式，
  dataPoints 就是真实采样序列；历史不足 → 零模式，绝不编造
- **处置建议 `buildRealActions`**：由真实异常驱动（GPU 越限→迁移任务、
  内存越限→清理缓存、温度越限→检查散热、延迟越限→排查链路），
  `autoExecutable: false` —— 真实模式不模拟执行，避免误导生产操作
- **预测 `buildRealForecasts`**：最近 ≤12 个真实采样点线性外推，
  明确标注「非 AI 引擎预测」；历史不足 → 零预测
- **摘要如实分层**：无数据 →「未产生诊断结论」；一切正常 →
  「实时指标均在安全基线内」；有发现 → 真实计数 +「规则分析（非 AI 引擎）」

### 演示路径保留（合法 demoMode）

- 原四个随机生成器保留为演示专属，摘要追加「（演示数据）」标注，
  历史条目带 `demo: true` 标记，演示模式关闭即隐藏

### 历史与类型

- `createInitialHistory()` 假历史 → 初始空数组
- 一次性清除 IndexedDB `diagnosisHistory` 中的历史假记录
  （localStorage 标记位 `yyc3_diag_history_purged_v1` 防重复）
- `DiagnosticsOptions` 新增 `throughputHistory`（真实趋势数据源），
  `DiagnosticHistoryEntry` 新增 `demo?` 标记；AIDiagnostics 传入
  `wsData.throughputHistory`

### 测试

- demo-mode-off.test.ts：旧「拒绝执行」语义 → 新真实语义 2 个用例
  （无数据如实无结论 / 越限节点产出真实异常与建议且 autoExecutable=false）

## 三、验证证据

### 门禁

| 门禁 | 结果 |
|---|---|
| `tsc --noEmit` | 0 错误 |
| `vitest --run` | 292 文件 / 5095 用例全绿（净增 1：替换 1 + 新增 1） |
| `vite build` | 通过 |

### 浏览器实证（http://localhost:7100/#/ai-diagnosis，demoMode 关闭）

1. 初始态：无任何假历史记录
2. 点击「启动诊断」→ 真实规则分析执行 → 摘要：
   「实时指标均在安全基线内，未检测到异常。（规则分析，非 AI 引擎）」
3. 全页零假数据残留（LLaMA-70B / GPU-A100-03 / NAS-Storage-01 等均未出现）
4. 真实越限路径由单测覆盖（GPU 95% 节点 → 异常 actualValue=95 +
   迁移建议 + autoExecutable=false）

## 四、边界说明

- 真实模式不使用「AI」字样误导：摘要、预测解释均标注规则分析/线性外推；
  后续接入真实 AI 诊断引擎时替换四个 build 函数，UI 与类型零改动
- 节点级时间序列历史当前不存在（仅全局吞吐有采样历史），
  因此节点模式不做 sparkline 编造；agent 后续上报节点历史即可扩展
- 模型管理（ModelProviderPanel）的服务端对接仍待用户给出
  服务端地址/协议/鉴权后专项进行
