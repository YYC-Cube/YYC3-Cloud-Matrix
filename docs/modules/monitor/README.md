---
file: README.md
description: Monitor 监控与巡检模块文档 — 数据监控、异常跟进、巡查管理、告警规则与 AI 建议
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [guide],[monitor],[module]
category: guide
language: zh-CN
audience: developers
complexity: intermediate
checksum: monitor-module-readme-v1
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 模块概述

**Monitor 监控与巡检模块** 是 YYC³ CloudPivot Intelli-Matrix 平台的核心运维管控模块，负责全链路数据可视化监控、异常事件智能跟进、自动化巡检调度、分级告警规则管理以及 AI 驱动的运维建议。模块基于 **五维驱动** 理念设计，覆盖 **时间维**（实时+历史）、**空间维**（节点+集群）、**属性维**（性能+容量）、**事件维**（告警+操作）、**关联维**（链路+影响面）五大评估维度。

### 核心能力

| 能力维度 | 说明 |
|---------|------|
| **实时监控** | 集群 QPS、延迟、吞吐量、GPU/显存利用率等核心指标秒级刷新 |
| **异常跟进** | 告警事件 → 根因链分析 → 快速修复 → 状态流转 闭环管理 |
| **智能巡检** | 手动/自动/定时多模式巡检，健康评分量化输出 |
| **分级告警** | 阈值 + 聚合 + 去重 + 升级策略 四层告警引擎 |
| **AI 赋能** | 模式识别 + 行动建议 + SDK 对话式排障 三位一体 |

---

## 功能域矩阵

| 功能域 | 核心组件 | 路由路径 | 数据来源 | 主要 Hooks |
|--------|---------|---------|---------|-----------|
| **仪表盘** | `DataMonitoring`, `Dashboard` | `/` | WebSocket + Store | `useMetricsSlice`, `useNodeSlice`, `useAppSlice` |
| **跟进管理** | `FollowUpPanel`, `FollowUpManager`, `FollowUpCard`, `FollowUpDrawer`, `FollowUpEditDialog` | `/follow-up`, `/follow-up-manager` | `useAlerts` Store | `useAlerts`, `useWebSocketData` |
| **巡查管理** | `PatrolDashboard`, `PatrolReport`, `PatrolScheduler`, `PatrolHistory` | `/patrol` | `usePatrol` Hook | `usePatrol`, `useWebSocketData` |
| **告警管理** | `AlertBanner`, `AlertRulesPanel`, `CreateRuleModal` | `/alerts` | `useAlertRules` Hook | `useAlertRules` |
| **AI 建议** | `AISuggestionPanel`, `ActionRecommender`, `PatternAnalyzer`, `SDKChatPanel` | `/sdk-chat` | LLM SDK + Store | `useAISuggestion`, `useBigModelSDK` |
| **快捷操作** | `QuickActionGroup` | (内嵌) | — | — |
| **通用组件** | `NodeDetailModal`, `UnifiedModelSelector` | (内嵌) | Store | `useProviderSlice` |

---

## 文件结构

```
src/app/modules/monitor/
├── index.ts                    # Barrel 统一导出
│
├── 【仪表盘】
│   ├── Dashboard.tsx           # 主监控大盘（QPS/延迟/节点/图表）
│   └── DataMonitoring.tsx      # 数据监控专用视图
│
├── 【跟进管理】
│   ├── FollowUpPanel.tsx       # 跟进面板（列表+筛选+统计）
│   ├── FollowUpManager.tsx     # 跟进管理器（高级视图）
│   ├── FollowUpCard.tsx        # 跟进卡片（单条告警渲染）
│   ├── FollowUpDrawer.tsx      # 跟进抽屉（详情+链路）
│   └── FollowUpEditDialog.tsx  # 编辑对话框（状态/处理人）
│
├── 【巡查管理】
│   ├── PatrolDashboard.tsx     # 巡查主控台
│   ├── PatrolReport.tsx        # 巡查报告展示
│   ├── PatrolScheduler.tsx     # 巡查计划调度
│   └── PatrolHistory.tsx       # 巡查历史列表
│
├── 【告警管理】
│   ├── AlertBanner.tsx         # 顶部告警横幅（一键跟进入口）
│   ├── AlertRulesPanel.tsx     # 告警规则面板（列表+启停）
│   └── CreateRuleModal.tsx     # 新建规则弹窗
│
├── 【AI 建议】
│   ├── AISuggestionPanel.tsx   # AI 建议面板
│   ├── ActionRecommender.tsx   # 行动推荐器
│   ├── PatternAnalyzer.tsx     # 模式分析器
│   └── SDKChatPanel.tsx        # SDK 对话排障面板
│
├── 【快捷操作】
│   └── QuickActionGroup.tsx    # 快捷操作按钮组
│
└── 【通用组件】
    ├── NodeDetailModal.tsx     # 节点详情模态框
    └── UnifiedModelSelector.tsx # 统一模型选择器
```

### 3.1 仪表盘

| 文件 | 职责 | 关键内部组件 |
|------|------|-------------|
| `Dashboard.tsx` | 大盘主入口，集成状态卡、吞吐量图、雷达图、节点矩阵、实时操作流 | `RadarSection`, `PerformanceSection`, `PredictionSection`, `NodeCard` |
| `DataMonitoring.tsx` | 数据维度专用监控视图，侧重业务指标 | (独立页面) |

### 3.2 跟进管理

| 文件 | 职责 | Props 入口 |
|------|------|-----------|
| `FollowUpPanel.tsx` | 列表容器：统计卡 + 筛选栏 + 卡片列表 + 抽屉 | 无（通过 `useAlerts` 自包含） |
| `FollowUpManager.tsx` | 管理视图：表格 + 批量操作 + 高级筛选 | 无 |
| `FollowUpCard.tsx` | 卡片展示：严重级别标识 + 标题 + 快捷操作按钮 | `item`, `onOpenDrawer`, `onQuickFix`, `onMarkResolved`, `compact` |
| `FollowUpDrawer.tsx` | 抽屉详情：根因链时间线 + 关联告警 + 操作记录 | `item`, `isOpen`, `onClose`, `onQuickFix`, `onMarkResolved`, `isMobile` |
| `FollowUpEditDialog.tsx` | 编辑弹窗：状态/处理人/备注 | `item`, `open`, `onClose`, `onSave` |

### 3.3 巡查管理

| 文件 | 职责 | 数据来源 |
|------|------|---------|
| `PatrolDashboard.tsx` | 主控台：启动/暂停 + 进度 + 结果汇总 + 子组件容器 | `usePatrol()` |
| `PatrolReport.tsx` | 单次巡查报告：健康评分 + 检查项明细 | `report: PatrolResult` |
| `PatrolScheduler.tsx` | 调度配置：自动启停 + 间隔选择(5/10/15/30/60min) | `schedule`, `onToggle`, `onUpdateInterval` |
| `PatrolHistory.tsx` | 历史记录：列表 + 查看报告入口 | `history: PatrolResult[]` |

### 3.4 告警管理

| 文件 | 职责 | 交互跳转 |
|------|------|---------|
| `AlertBanner.tsx` | 横幅：最新严重告警摘要 + 计数 + 跳转入口 | 点击 → `/follow-up` |
| `AlertRulesPanel.tsx` | 规则列表：启停开关 + 触发次数 + 编辑/删除 | — |
| `CreateRuleModal.tsx` | 新建/编辑：阈值 + 聚合 + 去重 + 升级策略 | — |

### 3.5 AI 建议

| 文件 | 职责 | 外部依赖 |
|------|------|---------|
| `AISuggestionPanel.tsx` | 建议展示容器 | `useAISuggestion()` |
| `ActionRecommender.tsx` | 行动推荐卡片（置信度 + 一键执行） | — |
| `PatternAnalyzer.tsx` | 异常模式识别与可视化 | — |
| `SDKChatPanel.tsx` | 对话式排障：消息流 + 模型选择 + 连接状态 | `useBigModelSDK()`, `UnifiedModelSelector` |

### 3.6 通用组件

| 文件 | 职责 | 调用者 |
|------|------|-------|
| `NodeDetailModal.tsx` | 节点完整参数 + 实时趋势 + 操作按钮 | `Dashboard.tsx` (节点卡片点击) |
| `UnifiedModelSelector.tsx` | Provider/Model 两级选择 + 搜索 + 状态标识 | `SDKChatPanel.tsx` |

---

## 导出清单

```typescript
// src/app/modules/monitor/index.ts

// —— 仪表盘 ——
export { DataMonitoring }  from './DataMonitoring';
export { Dashboard }       from './Dashboard';

// —— 跟进管理 ——
export { FollowUpPanel }      from './FollowUpPanel';
export { FollowUpManager }    from './FollowUpManager';
export { FollowUpCard }       from './FollowUpCard';
export { FollowUpDrawer }     from './FollowUpDrawer';
export { FollowUpEditDialog } from './FollowUpEditDialog';

// —— 巡查管理 ——
export { PatrolDashboard } from './PatrolDashboard';
export { PatrolReport }    from './PatrolReport';
export { PatrolScheduler } from './PatrolScheduler';
export { PatrolHistory }   from './PatrolHistory';

// —— 告警管理 ——
export { AlertBanner }      from './AlertBanner';
export { AlertRulesPanel }  from './AlertRulesPanel';
export { CreateRuleModal }  from './CreateRuleModal';

// —— AI 建议 ——
export { AISuggestionPanel } from './AISuggestionPanel';
export { ActionRecommender } from './ActionRecommender';
export { PatternAnalyzer }   from './PatternAnalyzer';
export { SDKChatPanel }      from './SDKChatPanel';

// —— 快捷操作 ——
export { QuickActionGroup } from './QuickActionGroup';

// —— 通用组件 ——
export { NodeDetailModal }      from './NodeDetailModal';
export { UnifiedModelSelector } from './UnifiedModelSelector';
```

---

## 依赖关系图说明

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Monitor 模块内部依赖关系                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Dashboard ─────uses─────→ NodeDetailModal                          │
│      │                                                              │
│      └────uses─────→ AlertBanner                                    │
│                                                                     │
│  FollowUpPanel ──uses──→ FollowUpCard                               │
│      │                ──uses──→ FollowUpDrawer                      │
│      │                                                              │
│  FollowUpDrawer ──uses──→ FollowUpEditDialog (间接)                 │
│                                                                     │
│  SDKChatPanel ───uses──→ UnifiedModelSelector                       │
│                                                                     │
│  PatrolDashboard ─uses──→ PatrolReport                              │
│      │                ─uses──→ PatrolScheduler                      │
│      │                ─uses──→ PatrolHistory                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     Monitor 模块外部依赖关系                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  UI 基座:    ../shared/GlassCard → 所有卡片容器                      │
│                                                                     │
│  Hooks:      ../../hooks/useI18n              → 国际化 (全部组件)    │
│              ../../hooks/usePatrol             → Patrol*             │
│              ../../hooks/useAlertRules         → AlertRulesPanel*    │
│              ../../hooks/useBigModelSDK        → SDKChatPanel        │
│              ../../hooks/useAISuggestion       → AISuggestionPanel   │
│              ../../hooks/useWebSocketData      → 实时数据消费        │
│                                                                     │
│  Store:      ../../store/slices/app-slice       → recentOps          │
│              ../../store/slices/metrics-slice   → 图表数据           │
│              ../../store/slices/node-slice      → 节点矩阵           │
│              ../../store/slices/provider-slice  → 模型配置           │
│              ../../stores/global-store          → useAlerts          │
│                                                                     │
│  类型:       ../../types/followup-types.ts     → FollowUpItem       │
│              ../../types/patrol-types.ts       → PatrolResult       │
│              ../../types/alert-rules-types.ts  → AlertRule          │
│              ../../types/sdk-types.ts          → ChatMessage        │
│              ../../types/node-types.ts         → NodeData           │
│                                                                     │
│  shadcn/ui:  ../../components/ui/*  → button, card, dialog, drawer  │
│                                    form, input, badge, chart 等     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 数据流设计

### 单向数据流架构（SSOT 原则）

```
                                                        ┌──────────────┐
                                                        │  WebSocket   │
                                                        │   Context    │
                                                        └──────┬───────┘
                                                               │ liveQPS/liveLatency/
                                                               │ throughputHistory
                                                               ▼
┌──────────────────┐    subscribe    ┌──────────────────┐  selector   ┌──────────────────┐
│  Zustand Stores  │◄───────────────│  Monitor 组件     │───────────►│  Derived Data    │
│  (Slices)        │                 │  (React 渲染层)   │             │  (useMemo 局部)  │
└────────┬─────────┘                 └─────────┬────────┘             └──────────────────┘
         │                                     │
         │ actions (setNodes, addFollowUp,     │ user interaction
         │  triggerAlert, runPatrol...)        │ (onClick, onChange)
         ▼                                     ▼
┌──────────────────┐                 ┌──────────────────┐
│  Persist Layer   │                 │  Dispatch Actions │
│  (localStorage/  │                 │  (调用 Store/Hook │
│   IndexedDB)     │                 │   暴露的方法)     │
└──────────────────┘                 └──────────────────┘
```

### 关键数据流通道

| 通道 | 方向 | 数据 | 刷新频率 |
|------|------|------|---------|
| WebSocket → Dashboard | Push | QPS / 延迟 / 吞吐量 / 告警 | 实时 (秒级) |
| `useNodeSlice` → Dashboard | Pull + Subscribe | nodes[] / derived | Store 更新时 |
| `useAlerts` → FollowUpPanel | Subscribe | followUps[] | 增删改时 |
| `usePatrol` → PatrolDashboard | Hook 内部调度 | status / progress / history | 手动/定时触发 |
| LLM SDK → SDKChatPanel | Bidirectional Stream | messages[] | 用户提问 + SSE |

---

## 路由配置示例

```tsx
// src/app/routes/monitor-routes.tsx 示例
import {
  Dashboard,
  FollowUpPanel,
  FollowUpManager,
  PatrolDashboard,
  AlertRulesPanel,
  SDKChatPanel,
} from '../modules/monitor';

export const monitorRoutes = [
  {
    path: '/',
    element: <Dashboard />,
    handle: { title: '监控大盘', icon: 'Gauge', crumb: '仪表盘' },
  },
  {
    path: '/data-monitoring',
    element: <Dashboard dataOnly />,
    handle: { title: '数据监控', crumb: '数据监控' },
  },
  {
    path: '/follow-up',
    element: <FollowUpPanel />,
    handle: { title: '异常跟进', icon: 'AlertTriangle', crumb: '跟进面板' },
  },
  {
    path: '/follow-up-manager',
    element: <FollowUpManager />,
    handle: { title: '跟进管理', icon: 'ListChecks', crumb: '跟进管理' },
  },
  {
    path: '/patrol',
    element: <PatrolDashboard />,
    handle: { title: '智能巡检', icon: 'ShieldCheck', crumb: '巡查台' },
  },
  {
    path: '/alerts',
    element: <AlertRulesPanel />,
    handle: { title: '告警规则', icon: 'BellRing', crumb: '告警中心' },
  },
  {
    path: '/sdk-chat',
    element: <SDKChatPanel />,
    handle: { title: 'AI 排障助手', icon: 'BotMessageSquare', crumb: 'SDK 对话' },
  },
];
```

---

## 新增监控功能流程

### 标准 7 步流程

```
Step 1 ──► 类型定义
  │         在 ../../types/ 下新增或扩展类型文件
  │         (例: xyz-types.ts → XyzItem, XyzStatus)
  │
Step 2 ──► Store / Hook 层
  │         Zustand slice 或自定义 Hook 封装数据与行为
  │         (例: useXyzSlice 或 useXyz)
  │
Step 3 ──► 子组件拆分
  │         卡片 / 抽屉 / 弹窗 按单一职责拆分
  │         内部子组件无需 barrel 导出
  │
Step 4 ──► 容器组件
  │         编写 XyzPanel / XyzDashboard，组合子组件
  │         接入 useI18n、GlassCard、shadcn/ui
  │
Step 5 ──► Barrel 注册
  │         在 index.ts 中 export { XyzPanel } from './XyzPanel';
  │
Step 6 ──► 路由挂载
  │         在对应路由配置中添加 path + element
  │         如需导航入口，同步 Sidebar / BottomNav
  │
Step 7 ──► 测试闭环
            单元测试 (Vitest) + 组件交互测试
            → 见下文 [测试策略]
```

### 新建告警规则功能（示例校验）

| 步骤 | 实际落点 | 文件 |
|------|---------|------|
| Step 1 | `AlertRule` 接口 | `types/alert-rules-types.ts` |
| Step 2 | `useAlertRules()` Hook | `hooks/useAlertRules.ts` |
| Step 3 | `CreateRuleModal.tsx` | `monitor/CreateRuleModal.tsx` |
| Step 4 | `AlertRulesPanel.tsx` | `monitor/AlertRulesPanel.tsx` |
| Step 5 | `export { CreateRuleModal } from './CreateRuleModal'` | `monitor/index.ts` |
| Step 6 | `path: '/alerts' → AlertRulesPanel` | 路由表 |
| Step 7 | `__tests__/alert-rules.test.tsx` | 测试目录 |

---

## 测试策略

### 测试层级与覆盖率目标

| 层级 | 工具 | 目标覆盖率 | 重点验证 |
|------|------|-----------|---------|
| **类型层** | `tsc --noEmit` + Vitest 类型测试 | 100% | 类型守卫、联合类型边界 |
| **Hook 层** | Vitest + `@testing-library/react-hooks` | ≥ 85% | 状态流转、副作用、Mock WebSocket |
| **组件层** | Vitest + React Testing Library | ≥ 80% | Props 渲染、交互事件、快照 |
| **集成层** | Vitest + MSW (Mock Service Worker) | ≥ 60% | Store ↔ 组件协同、路由跳转 |
| **E2E 层** | Playwright (P0 路径) | 关键路径 100% | 大盘加载、告警跟进闭环、巡查触发 |

### Monitor 模块重点用例清单

| 用例 ID | 描述 | 断言要点 |
|---------|------|---------|
| MON-UT-001 | Dashboard 连接状态显示 | connected / reconnecting / disconnected 对应图标与色值 |
| MON-UT-002 | NodeCard 点击打开模态框 | `onClick` 触发后 `NodeDetailModal` 渲染对应 `node.id` |
| MON-UT-003 | AlertBanner 计数汇总 | followUps 数据变化后 critical/error/warning 数字正确 |
| MON-UT-004 | FollowUpCard 筛选逻辑 | severity + status 联合过滤后列表长度符合预期 |
| MON-UT-005 | FollowUpDrawer 根因链时间线 | chain 数组渲染顺序、isCurrent 高亮 |
| MON-UT-006 | PatrolScheduler 间隔切换 | interval 变更后 nextRun 时间戳计算 |
| MON-UT-007 | PatrolReport 健康评分计算 | checks 中各状态计数 → healthScore 公式验证 |
| MON-UT-008 | CreateRuleModal 阈值校验 | value < 0 / duration = 0 等非法输入禁用提交 |
| MON-UT-009 | UnifiedModelSelector 搜索过滤 | keyword 匹配 model name 不区分大小写 |
| MON-INT-010 | Dashboard → FollowUpPanel 跳转 | AlertBanner 点击后 router path 为 `/follow-up` |

### 运行测试命令

```bash
# monitor 模块单测（推荐）
pnpm test src/app/modules/monitor --run

# 含覆盖率报告
pnpm test src/app/modules/monitor --run --coverage

# 交互模式 + watch
pnpm test src/app/modules/monitor
```

---

## 变更历史

| 版本 | 日期 | 变更类型 | 说明 | 作者 |
|------|------|---------|------|------|
| v1.0.0 | 2026-08-19 | **Initial** | 模块文档初版发布，覆盖 6 大功能域、22 个组件、完整数据流设计 | YanYuCloudCube Team |
| v0.9.0 | 2026-07-25 | Barrel | `index.ts` 统一导出，内部依赖关系确认 | Monitor 小组 |
| v0.8.0 | 2026-04-20 | Types | followup / patrol / alert-rules 三大类型体系定型 | 架构组 |
| v0.5.0 | 2026-04-08 | Components | Dashboard / FollowUpPanel / PatrolDashboard / SDKChatPanel 首版 | 前端组 |
| v0.1.0 | 2026-03-19 | Prototype | Dashboard 原型验证，节点矩阵 + QPS 曲线 | PoC 阶段 |

---

> **言启千行代码，语枢万物智能**
> *Words inspire thousands of lines of code, language pivots the intelligence of all things*
>
> **品牌**: YanYuCloudCube · 言雨云枢
> **产品**: YYC³ CloudPivot Intelli-Matrix
> **团队文档**: `/docs/20-YYC3-团队通用-标准规范/`
> **技术支持**: dev-support@yanyucloudcube.com
> **项目主页**: https://cloudpivot.yanyucloudcube.com
