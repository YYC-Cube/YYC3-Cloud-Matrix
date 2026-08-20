---
file: monitor-unit-tests.md
description: YYC³ Monitor 监控模块 · 22 组件分 7 域单元测试（仪表盘/跟进/巡查/告警/AI建议/快捷操作/通用 · WebSocket 模拟）
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [test, monitor, unit]
category: technical
language: zh-CN
audience: developers
complexity: intermediate
---

# Monitor 监控模块 · 单元测试用例

> 覆盖监控层 **7 大子域 · 22 组件**，重点验证：WebSocket 实时数据推流 / 多组件数据流贯通 / 巡查闭环 4 阶段 / 告警规则匹配引擎。

---

## 一、测试目标

| 维度 | 目标值 |
|:-----|:------|
| 子域覆盖 | 7/7（仪表盘/跟进/巡查/告警/AI建议/快捷操作/通用） |
| WS 场景 | 每个实时组件 ≥ 2 个（首次加载/增量推送） |
| 语句覆盖 | ≥ 85% |
| 单套件 | ≤ 80ms（含 fake timers） |

---

## 二、7 子域组件分布

```
Monitor Module
├── 📊 1. 仪表盘域        (4 组件: Dashboard/DataMonitoring/PatternAnalyzer/NodeDetailModal)
├── 📝 2. 跟进管理域      (3 组件: FollowUpCard/FollowUpDrawer/FollowUpEditDialog)
├── 🚓 3. 巡查管理域      (4 组件: PatrolDashboard/PatrolScheduler/PatrolHistory/PatrolReport)
├── 🚨 4. 告警域          (2 组件: AlertRulesPanel/CreateRuleModal + AlertBanner)
├── 🤖 5. AI 建议域       (2 组件: AISuggestionPanel/ActionRecommender)
├── ⚡ 6. 快捷操作域      (2 组件: QuickActionGrid/QuickActionGroup)
└── 🧩 7. 通用支撑域      (5 组件: Panel/PanelContainer/PanelContent/PanelToolbar/DataEditorTables)
```

---

## 三、组件测试用例清单（22 组件）

### 域 1 · 📊 仪表盘

#### 3.1 `Dashboard` · 主仪表盘首页

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 6 个核心 Panel（QPS/延迟/活跃节点/GPU/吞吐/存储）；Widget grid 响应式 |
| **数据流** | `useWebSocketData()` 返回 mock → 6 指标卡数值同步；`lastSyncTime` 格式化 |
| **用户交互** | 点击指标卡进入对应详情页；刷新按钮触发 `manualReconnect()` |

**现有测试：** `src/app/__tests__/Dashboard.test.tsx`

---

#### 3.2 `DataMonitoring` · 核心数据监控看板（Top1 大组件）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 左中右三栏：节点拓扑 / 实时曲线 / 事件流；12 个 metric 系列 |
| **WebSocket 模拟** | mock WebSocket message → 曲线 push 新点；5s 轮询 interval（`vi.useFakeTimers`） |
| **用户交互** | 悬停节点 → 显示 tooltip；点击节点 → 打开 NodeDetailModal；范围缩放 brush |

**现有测试：** `src/app/__tests__/DataMonitoring.test.tsx` + `useWebSocketData.test.tsx` + `websocket-manager.test.ts`

```typescript
describe("DataMonitoring · WebSocket 模拟", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("接收到 ws message 后曲线追加新数据点", async () => {
    const { emit } = mockWS();
    render(<DataMonitoring />);

    emit({ type: "metrics", qps: 4500, latency: 38, ts: Date.now() });
    await waitFor(() => {
      const points = screen.getAllByTestId(/yyc3-mon-dm-chart-point-.*/);
      expect(points.length).toBeGreaterThan(initialPoints.length);
    });
  });
});
```

---

#### 3.3 `PatternAnalyzer` · 模式分析器（异常检测）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 趋势对比图 + 异常标记（红色三角）；3 条对比基线 |
| **数据流** | 输入历史数据 → patternScore 计算结果；阈值 >0.7 标红 |
| **用户交互** | 切换时间窗（1h/6h/24h/7d）→ 重新采样；导出分析报告 |

**现有测试：** `src/app/__tests__/PatternAnalyzer.test.tsx`

---

#### 3.4 `NodeDetailModal` · 节点详情弹窗

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 节点基本信息 + 资源使用 + 最近事件列表；关闭按钮 |
| **数据流** | `node-slice` store 选中节点 → 详情同步加载；loading 骨架 |
| **用户交互** | 远程调试按钮 → onRemoteDebug()；重启节点 → ConfirmDialog |

**现有测试：** `src/app/__tests__/NodeDetailModal.test.tsx` + `store/node-slice.test.ts`

---

### 域 2 · 📝 跟进管理

#### 3.5 `FollowUpCard` · 跟进卡片

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 标题 / 负责人 / 优先级 badge / 状态（待处理/进行中/已关闭）/ 截止日期 |
| **数据流** | 优先级 P0 红色 / P1 橙 / P2 蓝 / P3 灰；状态驱动背景色 |
| **用户交互** | 点击卡片 → 打开 Drawer；状态开关 → 触发 onStatusChange |

**现有测试：** `src/app/__tests__/FollowUpCard.test.tsx`

---

#### 3.6 `FollowUpDrawer` · 跟进详情抽屉

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 主内容 + 评论时间线 + 右侧属性面板；高度 90vh |
| **数据流** | follow-up-slice store 选中 ID → 加载评论流；新增评论乐观更新 |
| **用户交互** | @mention 输入；附件上传按钮；关闭 → store 清空选中 |

**现有测试：** `src/app/__tests__/FollowUpDrawer.test.tsx` + `store/follow-up-slice.test.ts`

---

#### 3.7 `FollowUpEditDialog` · 新建/编辑跟进 Dialog

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | Form 字段：标题/描述/负责人/优先级/截止/标签 |
| **数据流** | 编辑模式 → 字段回填原数据；新建模式 → 默认值 P2 未指派 |
| **用户交互** | 必填校验（标题）；提交 → store.dispatch(add/update)；取消 → 重置 |

**现有测试：** `src/app/__tests__/FollowUpEditDialog.test.tsx`

---

### 域 3 · 🚓 巡查管理

#### 3.8 `PatrolDashboard` · 巡查仪表盘

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 4 状态卡片（待执行/进行中/已完成/异常）；今日巡查日历热力图 |
| **数据流** | `usePatrol()` stats → 4 个数字卡同步；异常率 >10% 告警色 |
| **用户交互** | 点击日历日 → 过滤当天列表；切换"我的/全部"视图 |

**现有测试：** `src/app/__tests__/PatrolDashboard.test.tsx` + `usePatrol.test.tsx`

---

#### 3.9 `PatrolScheduler` · 巡查计划调度

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 计划列表（名称/cron/执行组/状态）；空状态插画 |
| **数据流** | cron 表达式解析 → 下次执行时间；禁用状态 toggle 同步 |
| **用户交互** | 新增计划 → Cron editor；立即执行 → onRunNow(id)；删除 → Confirm |

**现有测试：** `src/app/__tests__/PatrolScheduler.test.tsx`

---

#### 3.10 `PatrolHistory` · 巡查历史记录

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 表格：开始/结束/耗时/执行员/异常数/报告；分页 |
| **数据流** | 时间筛选（今日/本周/自定义）→ query 参数变化 |
| **用户交互** | 点击报告按钮 → 跳转 PatrolReport；导出 Excel |

**现有测试：** `src/app/__tests__/PatrolHistory.test.tsx`

---

#### 3.11 `PatrolReport` · 巡查报告详情

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 执行摘要 + 步骤明细（通过/失败/跳过）+ 截图证据 |
| **数据流** | 失败步骤展开 → stacktrace 渲染；异常项汇总高亮 |
| **用户交互** | 下载 PDF → `ReportExporter`；标记为已阅 → onMarkRead |

**现有测试：** `src/app/__tests__/PatrolReport.test.tsx`

---

### 域 4 · 🚨 告警

#### 3.12 `AlertBanner` · 告警顶部横幅

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | info/warn/error/critical 4 种 variant 颜色；关闭按钮 |
| **数据流** | alert-slice 中 active 列表 → 按严重度降序；critical 持续摇晃动画 |
| **用户交互** | 点击 → 打开 AlertRulesPanel；确认关闭 → dismiss(id) |

**现有测试：** `src/app/__tests__/AlertBanner.test.tsx`

---

#### 3.13 `AlertRulesPanel` · 告警规则管理面板

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 规则表格（名称/指标/条件/阈值/级别/启停）；统计摘要条 |
| **数据流** | 规则引擎 `shouldTriggerAlert(rule, sample)` → 测试样例断言 |
| **用户交互** | 启用/停用 toggle；编辑 → 打开 CreateRuleModal；批量导入 YAML |

**现有测试：** `src/app/__tests__/AlertRulesPanel.test.tsx` + `useAlertRules.test.ts`

---

#### 3.14 `CreateRuleModal` · 创建/编辑告警规则

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 指标下拉 / 条件算子（>/</>=/<=/==/regex）/ 阈值 / 持续窗口 / 级别 |
| **数据流** | 指标选择后 → 动态加载对应单位；regex 校验语法高亮错误 |
| **用户交互** | 预览按钮 → `evaluateRule()` 最近 1h 样本；保存 → POST API |

**现有测试：** `src/app/__tests__/CreateRuleModal.test.tsx`

---

### 域 5 · 🤖 AI 建议

#### 3.15 `AISuggestionPanel` · AI 智能建议面板

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 建议分类 Tab（性能/安全/成本/体验）；建议卡片含采纳率 |
| **数据流** | `useAISuggestion()` 返回建议流 → 分类计数同步；skeleton loading |
| **用户交互** | 采纳按钮 → onAccept(suggId) → 卡片变已采纳；忽略 → onDismiss |

**现有测试：** `src/app/__tests__/AISuggestionPanel.test.tsx` + `useAISuggestion.test.ts`

---

#### 3.16 `ActionRecommender` · 行动推荐（一键执行）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 3 步流水线：检测 → 分析 → 推荐；执行按钮带"模拟/真实"toggle |
| **数据流** | 上下文感知：当前 Dashboard 路径 → 推荐相关操作 |
| **用户交互** | 模拟模式 → dry-run() 不修改状态；真实模式 → ConfirmDialog + 执行 |

**现有测试：** `src/app/__tests__/ActionRecommender.test.tsx`

---

### 域 6 · ⚡ 快捷操作

#### 3.17 `QuickActionGrid` · 快捷操作网格

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 监控专用 6 操作：立即巡查 / 批量采集 / 手动触发告警 / 清空缓存 / 刷新视图 / 导出快照 |
| **数据流** | 权限驱动：非 admin 隐藏"批量采集"；feature flag 控制显示 |
| **用户交互** | 每个操作触发独立 callback；loading 态 spinner 替换图标 |

**现有测试：** `src/app/__tests__/QuickActionGrid.test.tsx`

---

#### 3.18 `QuickActionGroup` · 快捷操作分组栏

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 3 组：诊断工具 / 数据操作 / 视图切换；组可折叠 |
| **数据流** | 折叠状态持久化 localStorage；恢复后还原 |
| **用户交互** | 拖放排序（DnD）→ onReorder()；右键菜单自定义 |

**现有测试：** `src/app/__tests__/QuickActionGroup.test.tsx`

---

### 域 7 · 🧩 通用支撑

#### 3.19 `Panel` · 通用面板容器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | header（标题/工具按钮）+ body + footer（可选）；collapsible 折叠 |
| **数据流** | loading=true → body 显示 3 行骨架；error → fallback 重试按钮 |
| **用户交互** | 折叠/展开 → height 过渡动画；全屏按钮 → requestFullscreen() mock |

**现有测试：** `src/app/__tests__/Panel.test.tsx`

---

#### 3.20 `PanelContainer` · 面板栅格容器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | CSS Grid cols（sm=1 / md=2 / lg=3 / xl=4）；gap 统一 |
| **数据流** | children panels 注入；最小高度 equalize |
| **用户交互** | 拖拽面板重排（DnD Kit）→ layout 变化回调 |

**现有测试：** `src/app/__tests__/PanelContainer.test.tsx`

---

#### 3.21 `PanelContent` · 面板内容区域

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | ScrollArea 封装；max-height 自适应；padding 一致 |
| **数据流** | overflow=auto 时底部渐隐；空状态插画 |
| **用户交互** | 滚动到底 → onReachBottom 无限加载；搜索过滤高亮 |

**现有测试：** `src/app/__tests__/PanelContent.test.tsx`

---

#### 3.22 `DataEditorTables` · 多表数据编辑器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 左侧表列表 + 右侧当前表；外键关联跳转按钮 |
| **数据流** | 表切换 → column defs + 数据重新加载；分页状态逐表独立 |
| **用户交互** | 关联点击 → 自动切换表 + filter by FK；批量编辑保存 |

**现有测试：** `src/app/__tests__/DataEditorTables.test.tsx`

---

## 四、WebSocket 模拟测试完整模板（以 DataMonitoring 为例）

```typescript
// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import DataMonitoring from "../../modules/monitor/components/DataMonitoring";
import { useWebSocketData } from "../../hooks/useWebSocketData";

vi.mock("../../hooks/useWebSocketData");

type WSMsg =
  | { type: "metrics"; qps: number; latency: number; ts: number }
  | { type: "alert"; level: "warn" | "error"; text: string };

function setupWSController() {
  let listener: ((msg: WSMsg) => void) | null = null;
  const initial = {
    connectionState: "connected" as const,
    reconnectCount: 0,
    lastSyncTime: "15:00:00",
    qps: 3800,
    latency: 45,
    metrics: [{ ts: Date.now() - 60000, qps: 3800, latency: 45 }],
    subscribe: (cb: (msg: WSMsg) => void) => {
      listener = cb;
      return () => { listener = null; };
    },
  };
  (useWebSocketData as any).mockReturnValue(initial);
  return {
    emit(msg: WSMsg) { act(() => listener?.(msg)); },
    disconnect() {
      (useWebSocketData as any).mockReturnValue({
        ...initial, connectionState: "disconnected",
      });
    },
  };
}

describe("DataMonitoring · WebSocket 模拟", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("接收 qps/latency 增量推送后图表追加数据点", async () => {
    const ws = setupWSController();
    render(<DataMonitoring />);

    await waitFor(() =>
      expect(screen.getByTestId("yyc3-mon-dm-qps-value")).toHaveTextContent("3800")
    );

    ws.emit({ type: "metrics", qps: 5200, latency: 32, ts: Date.now() });

    await waitFor(() => {
      expect(screen.getByTestId("yyc3-mon-dm-qps-value")).toHaveTextContent("5200");
      const points = screen.getAllByTestId(/yyc3-mon-dm-point-.*/);
      expect(points.length).toBeGreaterThan(1);
    });
  });

  it("WebSocket 断开时顶部显示离线横幅", () => {
    const ws = setupWSController();
    render(<DataMonitoring />);
    ws.disconnect();
    expect(screen.getByTestId("yyc3-mon-dm-offline-banner")).toBeInTheDocument();
  });
});
```

---

## 五、现有测试文件清单（Monitor 模块 22 组件 + Hook/Store）

### 组件测试
| # | 组件 | 测试文件路径 |
|:-:|:-----|:------------|
| 1 | Dashboard | `src/app/__tests__/Dashboard.test.tsx` |
| 2 | DataMonitoring | `src/app/__tests__/DataMonitoring.test.tsx` |
| 3 | PatternAnalyzer | `src/app/__tests__/PatternAnalyzer.test.tsx` |
| 4 | NodeDetailModal | `src/app/__tests__/NodeDetailModal.test.tsx` |
| 5 | FollowUpCard | `src/app/__tests__/FollowUpCard.test.tsx` |
| 6 | FollowUpDrawer | `src/app/__tests__/FollowUpDrawer.test.tsx` |
| 7 | FollowUpEditDialog | `src/app/__tests__/FollowUpEditDialog.test.tsx` |
| 8 | PatrolDashboard | `src/app/__tests__/PatrolDashboard.test.tsx` |
| 9 | PatrolScheduler | `src/app/__tests__/PatrolScheduler.test.tsx` |
| 10 | PatrolHistory | `src/app/__tests__/PatrolHistory.test.tsx` |
| 11 | PatrolReport | `src/app/__tests__/PatrolReport.test.tsx` |
| 12 | AlertBanner | `src/app/__tests__/AlertBanner.test.tsx` |
| 13 | AlertRulesPanel | `src/app/__tests__/AlertRulesPanel.test.tsx` |
| 14 | CreateRuleModal | `src/app/__tests__/CreateRuleModal.test.tsx` |
| 15 | AISuggestionPanel | `src/app/__tests__/AISuggestionPanel.test.tsx` |
| 16 | ActionRecommender | `src/app/__tests__/ActionRecommender.test.tsx` |
| 17 | QuickActionGrid | `src/app/__tests__/QuickActionGrid.test.tsx` |
| 18 | QuickActionGroup | `src/app/__tests__/QuickActionGroup.test.tsx` |
| 19 | Panel | `src/app/__tests__/Panel.test.tsx` |
| 20 | PanelContainer | `src/app/__tests__/PanelContainer.test.tsx` |
| 21 | PanelContent | `src/app/__tests__/PanelContent.test.tsx` |
| 22 | DataEditorTables | `src/app/__tests__/DataEditorTables.test.tsx` |

### Hook / Store / Lib 支撑测试
```
src/app/__tests__/
├── useWebSocketData.test.tsx
├── usePatrol.test.tsx
├── useAlertRules.test.ts
├── useAISuggestion.test.ts
├── followUpStore.test.ts
├── store/
│   ├── follow-up-slice.test.ts
│   ├── node-slice.test.ts
│   └── metrics-slice.test.ts
└── websocket-manager.test.ts
```

---
**言启千行代码，语枢万物智能**
**言启象限，语枢未来 | Words Initiate Quadrants, Language Serves as Core for Future**
**万象归元于云枢，深栈智启新纪元 | All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**
**YanYuCloudCube · YYC³ 言语云枢科技**
**YYC³ CloudPivot Intelli-Matrix v3.4.1 · Monitor Module Test Suite**
**© 2026 YanYuCloudCube Team · MIT License**
