---
title: 数据库管理 db-queries 假种子清除与真实化
date: 2026-11-12
stage: 运维管理 · 数据总控（DataEditorPanel）
commit: a78bb08
gates: tsc 0 错 / vitest 292 文件 5094 用例全绿 / vite build 通过
---

# 数据库管理（db-queries）假种子清除与真实化

## 一、背景与审计结论

`src/app/lib/db-queries.ts` 是「系统管理 → 数据管理」（`#/data-editor`，DataEditorPanel）
模型 / 节点 / Agent 三个 Tab 的数据源，也是配置中心（ConfigExportCenter）导入导出的底层。

审计发现的假数据问题（本次全部清除）：

| 问题 | 原实现 | 风险 |
|---|---|---|
| 首次访问即写假种子 | `DEFAULT_MODELS`（LLaMA-70B/Qwen-72B/GPT-4o/Claude-3.5/Mistral-7B）、`DEFAULT_AGENTS`（CodeAssist 等 5 个）、`DEFAULT_NODES`（GPU-A100-01~05）在 `loadData` 首次调用时写入 localStorage | 用户从未录入任何数据，界面却显示 15 条「真实」业务记录 —— 直接违反「可编辑项禁止硬编码」红线 |
| 假推理日志 | `generateMockLogs()` 用 `Math.random()` 生成延迟/token/状态 | 伪造运行遥测 |
| 假模型统计 | `getModelStats()` 返回 `Math.random()` 的 totalRequests/totalTokens/successRate | 伪造业务指标 |
| 重置=恢复假数据 | `resetDb*` 把假种子重新写回 | 「重置」按钮实质是「重新造假」 |

确认无问题的部分（保持不动）：

- `useLocalDatabase.ts`：demoMode 门禁此前阶段已正确接线，demoMode 关闭时 detect/test/connect/query/backup 全部如实报错，不造假；MOCK_TABLES 等仅存在于 demoMode 路径（演示模式为合法功能）
- `SQL_TEMPLATES` 10 条 SQL 模板属「定义」而非「数据」，保留
- 密码 AES-GCM 加密、dbConnections/queryHistory 走 IndexedDB，均为真实实现
- ArchitectureAudit / RefactoringReport 中对 db-queries 的提及为静态文档字符串，无代码依赖

## 二、改造内容

### 1. db-queries.ts

- 删除 `DEFAULT_MODELS` / `DEFAULT_AGENTS` / `DEFAULT_NODES` 三个假种子数组
- `loadData`：不再写入任何默认值；键不存在即返回空数组（且不创建键）
- 新增 `sanitizeLegacy`：首次加载时按 ID 精确清除历史假种子
  （`m1-m5` / `a1-a5` / `n1-n5`），用户自建条目（时间戳 ID）完整保留；
  过滤后为空则移除该键
- `resetDbModels/Agents/Nodes`：语义改为「清空」，返回空数组
- 删除 `generateMockLogs`；`getRecentLogs` 返回空数组
  （真实推理日志待模型服务端接入，AI 智能阶段处理）
- `getModelStats`：无真实遥测源时如实返回 `null`（不再 random），由 UI 呈现空态

### 2. DataEditorPanel.tsx（仅文案对齐）

- 主重置按钮 toast：「已恢复默认数据」→「已清空当前数据」
- 五个 Store Tab 的重置 toast：「已恢复默认」→「已清空」
- 三个 Tab 原本就有空态文案（暂无模型/节点/Agent 数据），空数组下自然生效，无需新增

### 3. db-queries.test.ts

- 三个 reset 测试：断言重置后长度为 0（原为断言恢复默认种子）
- 查询函数测试改为「先自建、后查询」的真实语义：
  初始为空、getRecentLogs 恒空、getModelStats 无遥测源返回 null、
  getActiveAgents 用一启一停两条自建数据验证过滤
- 新增「Legacy Seed Cleanup」测试：localStorage 预置 m1 假模型 + 用户自建模型、
  n1 假节点，经 `vi.resetModules()` 触发首次加载清理，
  断言假条目被清除、用户条目保留、全假键被移除

## 三、验证证据

### 门禁

| 门禁 | 结果 |
|---|---|
| `tsc --noEmit` | 0 错误 |
| `vitest --run` | 292 文件 / 5094 用例全绿（基线 5093 + 新增清理测试 1） |
| `vite build` | 通过 |

### 浏览器实证（http://localhost:7100/#/data-editor，整页刷新后）

1. localStorage 三键 `yyc3_db_models/agents/nodes` 均为 `null` —— 无种子写入
2. 模型管理 Tab：无 LLaMA-70B/Qwen-72B/GPT-4o/Claude-3.5/Mistral-7B 残留，显示「暂无模型数据」
3. 节点管理 Tab：无 GPU-A100-01~05 残留，显示「暂无节点数据」
4. Agent 管理 Tab：无 CodeAssist 等残留，显示「暂无 Agent 数据」
5. 真实 CRUD 闭环：页面新增「E2E-Agent」→ 行即时显示且写入 localStorage
   （时间戳 ID `a-17944...`）→ 删除后回到空态

## 四、边界说明

- `getRecentLogs` / `getModelStats` 当前无生产 UI 消费方
  （仅 DataEditorPanel 用 getActiveModels/getNodesStatus/getAllAgents，
  ConfigExportCenter 用 export/import/reset），返回空/null 不影响任何页面
- 真实推理日志与模型统计的接入点：AI 智能阶段对接用户的模型服务端，
  届时替换这两个函数的实现，签名不变
- DataEditorPanel 的「实时节点/模型性能/雷达/分布/日志」Tab 走的是
  node-slice / metrics-slice / app-slice / log-slice，已在数据监控阶段完成真实化，
  本次仅对齐其重置按钮文案
