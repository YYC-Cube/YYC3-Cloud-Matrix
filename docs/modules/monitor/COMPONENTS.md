---
file: COMPONENTS.md
description: Monitor 模块组件参考手册 — 按功能域分组的组件用途、核心能力、Props 说明与使用示例
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [components],[monitor],[reference]
category: technical
language: zh-CN
audience: developers
complexity: intermediate
checksum: monitor-components-v1
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***

---

# Monitor 模块组件参考手册

本手册按 **功能域** 分组，列出 Monitor 模块所有导出组件的用途、核心能力、Props 签名与使用示例。

---

## 目录

1. [仪表盘域](#1-仪表盘域)
   - [Dashboard](#dashboard)
   - [DataMonitoring](#datamonitoring)
2. [跟进管理域](#2-跟进管理域)
   - [FollowUpPanel](#followuppanel)
   - [FollowUpManager](#followupmanager)
   - [FollowUpCard](#followupcard)
   - [FollowUpDrawer](#followupdrawer)
   - [FollowUpEditDialog](#followupeditdialog)
3. [巡查管理域](#3-巡查管理域)
   - [PatrolDashboard](#patroldashboard)
   - [PatrolReport](#patrolreport)
   - [PatrolScheduler](#patrolscheduler)
   - [PatrolHistory](#patrolhistory)
4. [告警管理域](#4-告警管理域)
   - [AlertBanner](#alertbanner)
   - [AlertRulesPanel](#alertrulespanel)
   - [CreateRuleModal](#createrulemodal)
5. [AI 建议域](#5-ai-建议域)
   - [AISuggestionPanel](#aisuggestionpanel)
   - [ActionRecommender](#actionrecommender)
   - [PatternAnalyzer](#patternanalyzer)
   - [SDKChatPanel](#sdkchatpanel)
6. [快捷操作域](#6-快捷操作域)
   - [QuickActionGroup](#quickactiongroup)
7. [通用组件域](#7-通用组件域)
   - [NodeDetailModal](#nodedetailmodal)
   - [UnifiedModelSelector](#unifiedmodelselector)

---

## 1. 仪表盘域

### Dashboard

| 项 | 说明 |
|----|------|
| **组件名** | `Dashboard` |
| **用途** | 监控大盘主页面，集成连接状态、核心指标卡、吞吐量/负载分布图、雷达/性能/预测分析、节点矩阵、实时操作流 |
| **核心能力** | ① 6 项核心指标卡（QPS/延迟/活跃节点/GPU 利用率/Token 吞吐/存储）<br>② 响应式布局：手机 2 列 / 平板 3 列 / 桌面 6 列<br>③ 吞吐量双 Y 轴面积图（QPS + Tokens/s）<br>④ 模型负载分布环形饼图<br>⑤ 移动端图表 Tab 切换 + 左右滑动手势<br>⑥ 节点矩阵（点击打开 NodeDetailModal）<br>⑦ 实时操作流时间线 |

#### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| — | — | — | 无 Props，通过以下 Context / Store 自包含：<br>• `WebSocketContext` (连接状态/QPS/延迟/吞吐历史)<br>• `ViewContext` (isMobile / isTablet)<br>• `useMetricsSlice` (modelPerf / modelDist / radarData)<br>• `useAppSlice` (recentOps)<br>• `useNodeSlice` (nodes / derived / addNode) |

#### 使用示例

```tsx
import { Dashboard } from '@/app/modules/monitor';

// 路由级页面直接挂载
export function MonitorHomePage() {
  return <Dashboard />;
}
```

---

### DataMonitoring

| 项 | 说明 |
|----|------|
| **组件名** | `DataMonitoring` |
| **用途** | 数据监控专用视图，侧重业务指标与时间序列对比 |
| **核心能力** | ① 业务维度指标分组展示<br>② 多时间范围切换<br>③ 数据导出入口 |

#### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `metricGroups?` | `string[]` | 内置默认组 | 自定义展示的指标分组 |
| `showExport?` | `boolean` | `true` | 是否显示数据导出按钮 |

#### 使用示例

```tsx
import { DataMonitoring } from '@/app/modules/monitor';

export function DataMonitorPage() {
  return (
    <DataMonitoring
      metricGroups={['revenue', 'users', 'inference']}
      showExport
    />
  );
}
```

---

## 2. 跟进管理域

### FollowUpPanel

| 项 | 说明 |
|----|------|
| **组件名** | `FollowUpPanel` |
| **用途** | 异常跟进主面板：统计卡 + 严重级别/状态筛选 + 跟进卡片列表 + 详情抽屉 |
| **核心能力** | ① 4 项统计卡（严重/错误/分析中/已解决）<br>② 严重级别筛选（all/critical/error/warning/info）<br>③ 状态筛选（all/active/investigating/resolved/ignored）<br>④ 跟进卡片列表（空状态友好提示）<br>⑤ 详情抽屉联动（点击卡片 → Drawer 打开）<br>⑥ 初次加载注入默认示例数据 |

#### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| — | — | — | 无 Props，内部依赖：<br>• `useAlerts()` → followUps / addFollowUp / updateFollowUp<br>• `useWebSocketData()` → isSimulated 模拟数据标识<br>• `ViewContext` → isMobile 紧凑模式 |

#### 使用示例

```tsx
import { FollowUpPanel } from '@/app/modules/monitor';

// 路由: /follow-up
export function FollowUpPage() {
  return <FollowUpPanel />;
}
```

---

### FollowUpManager

| 项 | 说明 |
|----|------|
| **组件名** | `FollowUpManager` |
| **用途** | 跟进管理高级视图：表格化展示 + 批量操作 + 高级筛选 + 导出 |
| **核心能力** | ① 表格视图（ID/严重级别/标题/来源/状态/处理人/时间）<br>② 多选批量处理（状态变更/指派/导出）<br>③ 高级筛选（时间范围/处理人/标签） |

#### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableExport?` | `boolean` | `true` | 是否启用 CSV/JSON 导出 |
| `enableBatch?` | `boolean` | `true` | 是否启用批量操作 |

#### 使用示例

```tsx
import { FollowUpManager } from '@/app/modules/monitor';

// 路由: /follow-up-manager
export function FollowUpManagerPage() {
  return <FollowUpManager enableExport enableBatch />;
}
```

---

### FollowUpCard

| 项 | 说明 |
|----|------|
| **组件名** | `FollowUpCard` |
| **用途** | 单条跟进事项卡片渲染，展示严重级别、标题、来源、指标、快捷操作按钮 |
| **核心能力** | ① 严重级别色带（左侧色条 + 图标）<br>② 状态徽标（active/investigating/resolved/ignored）<br>③ 三个快捷按钮：查看详情 / 快速修复 / 标记解决<br>④ `compact` 模式（移动端减边距） |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `item` | `FollowUpItem` | ✅ | — | 跟进数据，见 `FollowUpItem` 类型 |
| `onOpenDrawer` | `(item: FollowUpItem) => void` | ✅ | — | 点击卡片或「详情」时调用 |
| `onQuickFix` | `(item: FollowUpItem) => void` | ✅ | — | 「快速修复」按钮：状态 → investigating |
| `onMarkResolved` | `(item: FollowUpItem) => void` | ✅ | — | 「标记解决」：状态 → resolved |
| `compact?` | `boolean` | ❌ | `false` | 移动端紧凑模式 |

#### 使用示例

```tsx
import { FollowUpCard } from '@/app/modules/monitor';
import type { FollowUpItem } from '@/app/types/followup-types';

export function Demo() {
  const item: FollowUpItem = {
    id: 'AL-0032',
    severity: 'critical',
    title: 'GPU-A100-03 推理延迟异常',
    source: 'GPU-A100-03',
    metric: '2,450ms > 2,000ms (阈值)',
    status: 'active',
    timestamp: Date.now() - 5 * 60 * 1000,
    chain: [],
  };

  return (
    <FollowUpCard
      item={item}
      onOpenDrawer={(i) => console.log('open', i.id)}
      onQuickFix={(i) => console.log('fix', i.id)}
      onMarkResolved={(i) => console.log('resolve', i.id)}
      compact={false}
    />
  );
}
```

---

### FollowUpDrawer

| 项 | 说明 |
|----|------|
| **组件名** | `FollowUpDrawer` |
| **用途** | 跟进事项详情抽屉：完整信息 + 根因链时间线 + 关联告警 + 操作按钮 |
| **核心能力** | ① 抽屉式滑入（桌面右侧 / 移动端底部）<br>② 根因链时间线（`ChainEvent[]`）→ 当前事件高亮<br>③ 关联告警快速跳转<br>④ 快捷操作：快速修复 / 标记解决 / 关闭<br>⑤ 300ms 关闭过渡后清空 item |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `item` | `FollowUpItem \| null` | ✅ | — | 当前跟进数据，`null` 时不渲染内容 |
| `isOpen` | `boolean` | ✅ | — | 抽屉开关状态 |
| `onClose` | `() => void` | ✅ | — | 关闭回调（遮罩 / 关闭按钮 / ESC） |
| `onQuickFix` | `(item: FollowUpItem) => void` | ✅ | — | 「快速修复」操作 |
| `onMarkResolved` | `(item: FollowUpItem) => void` | ✅ | — | 「标记解决」操作 |
| `isMobile?` | `boolean` | ❌ | `false` | 移动端 → 底部抽屉 |

#### 使用示例

```tsx
import { useState } from 'react';
import { FollowUpDrawer } from '@/app/modules/monitor';
import type { FollowUpItem } from '@/app/types/followup-types';

export function Demo() {
  const [item, setItem] = useState<FollowUpItem | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <FollowUpDrawer
      item={item}
      isOpen={open}
      onClose={() => {
        setOpen(false);
        setTimeout(() => setItem(null), 300);
      }}
      onQuickFix={(i) => updateStatus(i.id, 'investigating')}
      onMarkResolved={(i) => updateStatus(i.id, 'resolved')}
    />
  );
}
```

---

### FollowUpEditDialog

| 项 | 说明 |
|----|------|
| **组件名** | `FollowUpEditDialog` |
| **用途** | 跟进事项编辑对话框：修改状态、指派处理人、添加备注 |
| **核心能力** | ① 状态下拉（active / investigating / resolved / ignored）<br>② 处理人选择 + 自动补全<br>③ 多行备注输入<br>④ 保存前校验 |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `item` | `FollowUpItem \| null` | ✅ | — | 编辑目标 |
| `open` | `boolean` | ✅ | — | 对话框开关 |
| `onClose` | `() => void` | ✅ | — | 关闭回调 |
| `onSave` | `(id: string, patch: Partial<FollowUpItem>) => void` | ✅ | — | 保存回调，返回 id + 差异字段 |

#### 使用示例

```tsx
import { FollowUpEditDialog } from '@/app/modules/monitor';
import type { FollowUpItem } from '@/app/types/followup-types';

export function Demo() {
  return (
    <FollowUpEditDialog
      item={currentItem}
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onSave={(id, patch) => updateFollowUp(id, patch)}
    />
  );
}
```

---

## 3. 巡查管理域

### PatrolDashboard

| 项 | 说明 |
|----|------|
| **组件名** | `PatrolDashboard` |
| **用途** | 智能巡检主控台：启动/停止手动巡检、自动巡查调度配置、实时进度、历史记录、报告查看 |
| **核心能力** | ① 一键手动巡检（触发 → 进度条 → 结果呈现）<br>② 调度配置入口 → PatrolScheduler<br>③ 实时进度百分比 + 当前检查项<br>④ 当前结果摘要卡（健康评分 / 通过数 / 警告 / 严重）<br>⑤ 子组件内嵌：PatrolScheduler / PatrolHistory / PatrolReport |

#### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| — | — | — | 无 Props，内部依赖：<br>• `usePatrol()` → patrolStatus / currentResult / history / schedule / progress / runPatrol / toggleAutoPatrol / updateInterval / viewReport / closeReport / selectedReport<br>• `ViewContext` → isMobile<br>• `useWebSocketData()` → isSimulated |

#### 使用示例

```tsx
import { PatrolDashboard } from '@/app/modules/monitor';

// 路由: /patrol
export function PatrolPage() {
  return <PatrolDashboard />;
}
```

---

### PatrolReport

| 项 | 说明 |
|----|------|
| **组件名** | `PatrolReport` |
| **用途** | 单次巡检结果报告展示：健康评分可视化 + 检查项明细表 + 建议 |
| **核心能力** | ① 健康评分（0-100）大字号显示 + 色阶<br>② 汇总卡：通过/警告/严重/跳过 计数<br>③ 检查项明细表：分类 / 标签 / 状态 / 实际值 / 阈值 / 详情<br>④ 可折叠展开详情（mobile 友好） |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `report` | `PatrolResult` | ✅ | — | 单次巡检结果数据 |
| `onClose?` | `() => void` | ❌ | — | 关闭按钮回调（作为弹窗内嵌时） |

#### 使用示例

```tsx
import { PatrolReport } from '@/app/modules/monitor';
import type { PatrolResult } from '@/app/types/patrol-types';

export function Demo() {
  const report: PatrolResult = {
    id: 'PR-20260819-001',
    timestamp: Date.now(),
    duration: 12450,
    status: 'completed',
    healthScore: 87,
    totalChecks: 24,
    passCount: 20,
    warningCount: 3,
    criticalCount: 1,
    skippedCount: 0,
    checks: [/* PatrolCheckItem[] */],
    triggeredBy: 'manual',
  };

  return <PatrolReport report={report} onClose={() => console.log('closed')} />;
}
```

---

### PatrolScheduler

| 项 | 说明 |
|----|------|
| **组件名** | `PatrolScheduler` |
| **用途** | 自动巡查调度配置：启停开关、间隔选择、上次/下次运行时间显示 |
| **核心能力** | ① 自动巡查 Enable/Disable Switch<br>② 间隔选择预设：5 / 10 / 15 / 30 / 60 分钟<br>③ 上次运行时间（相对时间）<br>④ 下次运行时间倒计时 |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `schedule` | `PatrolSchedule` | ✅ | — | 当前调度配置 |
| `onToggle` | `(enabled: boolean) => void` | ✅ | — | 启停自动巡查 |
| `onUpdateInterval` | `(interval: PatrolInterval) => void` | ✅ | — | 修改巡查间隔 |

#### 使用示例

```tsx
import { PatrolScheduler } from '@/app/modules/monitor';
import type { PatrolSchedule, PatrolInterval } from '@/app/types/patrol-types';

export function Demo() {
  const [schedule, setSchedule] = useState<PatrolSchedule>({
    enabled: true,
    interval: 15,
    lastRun: Date.now() - 8 * 60 * 1000,
    nextRun: Date.now() + 7 * 60 * 1000,
  });

  return (
    <PatrolScheduler
      schedule={schedule}
      onToggle={(enabled) => setSchedule((s) => ({ ...s, enabled }))}
      onUpdateInterval={(interval: PatrolInterval) =>
        setSchedule((s) => ({ ...s, interval }))
      }
    />
  );
}
```

---

### PatrolHistory

| 项 | 说明 |
|----|------|
| **组件名** | `PatrolHistory` |
| **用途** | 巡查历史记录列表：按时间倒序展示 + 查看报告入口 |
| **核心能力** | ① 时间倒序列表：触发方式图标（手动/自动/定时）<br>② 健康评分色阶徽标<br>③ 每条点击 → 触发 `onViewReport`<br>④ 空状态友好提示 |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `history` | `PatrolResult[]` | ✅ | — | 历史记录数组 |
| `onViewReport` | `(report: PatrolResult) => void` | ✅ | — | 点击单条 → 查看详情报告 |

#### 使用示例

```tsx
import { PatrolHistory } from '@/app/modules/monitor';
import type { PatrolResult } from '@/app/types/patrol-types';

export function Demo({ history }: { history: PatrolResult[] }) {
  return (
    <PatrolHistory
      history={history}
      onViewReport={(r) => console.log('view report', r.id)}
    />
  );
}
```

---

## 4. 告警管理域

### AlertBanner

| 项 | 说明 |
|----|------|
| **组件名** | `AlertBanner` |
| **用途** | 顶部告警横幅：最新严重告警摘要 + 统计计数 + 一键跳转到跟进面板 |
| **核心能力** | ① 智能颜色：critical → 红色系、error/warning → 橙黄色系、其余 → 蓝色<br>② 左侧色条视觉强调<br>③ 统计：总数 / 活跃 / 严重 / 错误 / 警告<br>④ 点击整卡 → navigate('/follow-up')<br>⑤ 无告警 → 返回 `null` 不渲染 |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `compact?` | `boolean` | ❌ | `false` | 紧凑模式：隐藏二级统计文字，减小内边距（Dashboard 移动端用） |

#### 使用示例

```tsx
import { AlertBanner } from '@/app/modules/monitor';

// Dashboard 顶部横幅（手机端紧凑）
export function DashboardTopBar({ isMobile }: { isMobile: boolean }) {
  return <AlertBanner compact={isMobile} />;
}
```

---

### AlertRulesPanel

| 项 | 说明 |
|----|------|
| **组件名** | `AlertRulesPanel` |
| **用途** | 告警规则管理面板：规则列表 + 启停 + 触发次数统计 + 新建/编辑/删除 |
| **核心能力** | ① 规则卡片列表：名称 / 严重级别 / 阈值摘要<br>② Enable/Disable 开关<br>③ 触发次数统计 + 最后触发时间<br>④ 编辑 / 删除按钮<br>⑤ 「新建规则」按钮打开 CreateRuleModal |

#### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| — | — | — | 无 Props，内部依赖：<br>• `useAlertRules(options?)` → rules / toggleRule / deleteRule / createRule / updateRule |

#### 使用示例

```tsx
import { AlertRulesPanel } from '@/app/modules/monitor';

// 路由: /alerts
export function AlertRulesPage() {
  return <AlertRulesPanel />;
}
```

---

### CreateRuleModal

| 项 | 说明 |
|----|------|
| **组件名** | `CreateRuleModal` |
| **用途** | 新建 / 编辑告警规则弹窗：阈值配置 + 聚合策略 + 去重冷却 + 升级策略 |
| **核心能力** | ① 多阈值可增删（metric + condition + value + unit + duration）<br>② 聚合策略：时间窗 + 最大分组<br>③ 去重冷却：cooldownMinutes<br>④ 三级升级策略表（延迟时间 / 通知渠道 / 自动操作）<br>⑤ 目标节点多选 |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `open` | `boolean` | ✅ | — | 弹窗开关 |
| `onClose` | `() => void` | ✅ | — | 关闭回调 |
| `initial?` | `Partial<AlertRule>` | ❌ | — | 编辑模式时传入初始值，缺省为新建模式 |
| `onSubmit` | `(rule: AlertRule \| Omit<AlertRule, 'id' \| 'createdAt' \| 'lastTriggered' \| 'triggerCount'>) => void` | ✅ | — | 提交回调：新建缺省 id 等系统字段；编辑模式带完整 id |

#### 使用示例

```tsx
import { CreateRuleModal } from '@/app/modules/monitor';
import type { AlertRule } from '@/app/types/alert-rules-types';

export function Demo() {
  return (
    <CreateRuleModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      // initial={editingRule}  // 编辑时
      onSubmit={(rule) => createOrUpdate(rule)}
    />
  );
}
```

---

## 5. AI 建议域

### AISuggestionPanel

| 项 | 说明 |
|----|------|
| **组件名** | `AISuggestionPanel` |
| **用途** | AI 运维建议面板容器：整合 ActionRecommender + PatternAnalyzer，展示当前集群智能分析结论 |
| **核心能力** | ① 建议列表：每条含类型、置信度、一键采纳<br>② 模式识别卡片组（PatternAnalyzer）<br>③ 刷新建议（重新分析） |

#### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| — | — | — | 无 Props，内部依赖：<br>• `useAISuggestion()` → suggestions / patterns / refresh / acceptSuggestion |

#### 使用示例

```tsx
import { AISuggestionPanel } from '@/app/modules/monitor';

export function DashboardInsights() {
  return <AISuggestionPanel />;
}
```

---

### ActionRecommender

| 项 | 说明 |
|----|------|
| **组件名** | `ActionRecommender` |
| **用途** | 行动推荐卡片：单个 AI 建议的完整展示与一键执行 |
| **核心能力** | ① 置信度进度条（0-100%）<br>② 建议摘要 + 理由说明<br>③ 预计影响 / 风险级别<br>④ 「执行」「忽略」「稍后」三按钮 |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `suggestion` | `AISuggestion` | ✅ | — | 单条建议数据（见 `ai-analysis-types.ts`） |
| `onExecute` | `(id: string) => void` | ✅ | — | 执行建议 |
| `onDismiss?` | `(id: string) => void` | ❌ | — | 忽略 |
| `onSnooze?` | `(id: string, minutes: number) => void` | ❌ | — | 稍后提醒（默认 30 分钟） |

#### 使用示例

```tsx
import { ActionRecommender } from '@/app/modules/monitor';

export function SuggestionList({ suggestions }: any) {
  return (
    <div className="space-y-3">
      {suggestions.map((s: any) => (
        <ActionRecommender
          key={s.id}
          suggestion={s}
          onExecute={executeSuggestion}
          onDismiss={dismissSuggestion}
          onSnooze={snoozeSuggestion}
        />
      ))}
    </div>
  );
}
```

---

### PatternAnalyzer

| 项 | 说明 |
|----|------|
| **组件名** | `PatternAnalyzer` |
| **用途** | 异常模式分析器：识别数据中的异常模式并可视化展示 |
| **核心能力** | ① 模式类型标签（周期性异常 / 梯度恶化 / 突变 / 关联异常）<br>② 小缩略图可视化（迷你折线/散点）<br>③ 影响范围说明 |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `patterns` | `DetectedPattern[]` | ✅ | — | 识别出的模式数组 |
| `maxItems?` | `number` | ❌ | `5` | 最大展示条数 |

#### 使用示例

```tsx
import { PatternAnalyzer } from '@/app/modules/monitor';

export function Demo({ patterns }: any) {
  return <PatternAnalyzer patterns={patterns} maxItems={6} />;
}
```

---

### SDKChatPanel

| 项 | 说明 |
|----|------|
| **组件名** | `SDKChatPanel` |
| **用途** | SDK 对话排障面板：对话式 AI 助手，支持选择大模型进行运维排障、日志分析、配置建议等对话 |
| **核心能力** | ① 连接状态指示（idle / connecting / connected / error）<br>② UnifiedModelSelector 选择 Provider + Model<br>③ 消息气泡（用户 / AI / 系统错误）<br>④ 对话上下文菜单：新建 / 清空 / 删除<br>⑤ 流式输出 + 停止生成<br>⑥ 模拟数据模式提示徽标 |

#### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| — | — | — | 无 Props，内部依赖：<br>• `useBigModelSDK()` → PROVIDER_CAPABILITIES / 发送消息 / 连接状态<br>• `useProviderSlice()` → configuredModels / 活跃模型<br>• `ViewContext` → isMobile |

#### 使用示例

```tsx
import { SDKChatPanel } from '@/app/modules/monitor';

// 路由: /sdk-chat
export function SDKChatPage() {
  return <SDKChatPanel />;
}
```

---

## 6. 快捷操作域

### QuickActionGroup

| 项 | 说明 |
|----|------|
| **组件名** | `QuickActionGroup` |
| **用途** | 快捷操作按钮组：在 Dashboard / PatrolDashboard 等页面提供常用运维操作一键入口 |
| **核心能力** | ① 常见操作：重启节点 / 清理缓存 / 手动巡检 / 导出快照 / 强制 GC<br>② 危险操作二次确认（内置对话框）<br>③ 操作成功 / 失败 toast 反馈 |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `actions?` | `QuickAction[]` | ❌ | 内置默认 5 项 | 自定义快捷操作列表（覆盖默认） |
| `variant?` | `'horizontal' \| 'vertical' \| 'grid'` | ❌ | `'horizontal'` | 排列方式 |
| `onActionPerformed?` | `(actionId: string, result: any) => void` | ❌ | — | 操作完成回调 |

#### 使用示例

```tsx
import { QuickActionGroup } from '@/app/modules/monitor';

export function DashboardToolbar() {
  return (
    <QuickActionGroup
      variant="horizontal"
      onActionPerformed={(id, result) =>
        console.log(`action ${id} result:`, result)
      }
    />
  );
}
```

---

## 7. 通用组件域

### NodeDetailModal

| 项 | 说明 |
|----|------|
| **组件名** | `NodeDetailModal` |
| **用途** | 节点详情模态框：展示 GPU/显存/温度/任务/模型等完整参数，含实时趋势小图和运维操作按钮 |
| **核心能力** | ① 基本信息：ID / 状态 / 模型 / 温度<br>② GPU 利用率 + 显存占用实时趋势迷你图<br>③ 任务队列快照<br>④ 操作按钮：重启 / 下线 / 排空任务 / 查看日志 |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `node` | `NodeData` | ✅ | — | 目标节点数据 |
| `onClose` | `() => void` | ✅ | — | 关闭模态框（遮罩 / X / ESC） |

#### 使用示例

```tsx
import { useState } from 'react';
import { NodeDetailModal } from '@/app/modules/monitor';
import type { NodeData } from '@/app/types/node-types';

export function NodeGrid({ nodes }: { nodes: NodeData[] }) {
  const [selected, setSelected] = useState<NodeData | null>(null);

  return (
    <>
      {nodes.map((n) => (
        <div key={n.id} onClick={() => setSelected(n)}>
          {/* NodeCard */}
        </div>
      ))}
      {selected && (
        <NodeDetailModal node={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
```

---

### UnifiedModelSelector

| 项 | 说明 |
|----|------|
| **组件名** | `UnifiedModelSelector` |
| **用途** | 统一模型选择器：Provider → Model 两级选择，支持搜索过滤、状态标识、在线/离线图标 |
| **核心能力** | ① 两级联动：Provider Tab → Model 列表<br>② 关键字搜索（匹配 model name / provider / 标签，不区分大小写）<br>③ 状态徽标：active / error / testing / inactive<br>④ 可清空选择 + 已选回显<br>⑤ Compact 模式（适合嵌在工具栏） |

#### Props 说明

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `value?` | `string \| null` | ❌ | `null` | 已选 model ID（受控） |
| `onChange?` | `(modelId: string \| null, model?: ConfiguredModel) => void` | ❌ | — | 选择变更回调，返回 ID 和完整对象 |
| `providers?` | `ConfiguredModel[]` | ❌ | 从 `useProviderSlice().configuredModels` 获取 | 自定义模型列表（覆盖默认） |
| `placeholder?` | `string` | ❌ | `'选择模型...'` (i18n) | 占位文案 |
| `compact?` | `boolean` | ❌ | `false` | 紧凑模式：减小高度/字号，SDKChatPanel 工具栏专用 |
| `clearable?` | `boolean` | ❌ | `true` | 是否显示清空按钮 |
| `disabled?` | `boolean` | ❌ | `false` | 禁用状态 |

#### 使用示例

```tsx
import { useState } from 'react';
import { UnifiedModelSelector } from '@/app/modules/monitor';
import type { ConfiguredModel } from '@/app/types/model-provider-types';

export function Demo() {
  const [modelId, setModelId] = useState<string | null>('gpt-4o');

  return (
    <UnifiedModelSelector
      value={modelId}
      onChange={(id, full) => {
        setModelId(id);
        console.log('selected:', full?.model, 'by', full?.provider);
      }}
      compact
      clearable
    />
  );
}
```

---

> **言启千行代码，语枢万物智能**
> *Words inspire thousands of lines of code, language pivots the intelligence of all things*
>
> **品牌**: YanYuCloudCube · 言雨云枢
> **产品**: YYC³ CloudPivot Intelli-Matrix
> **模块文档索引**: `./README.md`
> **API 类型参考**: `./API-REFERENCE.md`
> **技术支持**: dev-support@yanyucloudcube.com
