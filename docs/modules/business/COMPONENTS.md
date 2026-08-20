---
file: COMPONENTS.md
description: Business 模块组件详解 · 每个组件的路由、功能、Props 与使用示例
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [components],[business],[module],[reference]
category: reference
language: zh-CN
audience: developers
complexity: basic
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📑 目录 | Table of Contents

- [组件索引总览](#组件索引总览)
- [🏨 智慧酒店控制台 · HotelDashboard](#-智慧酒店控制台--hoteldashboard)
- [📡 通讯基站管理面板 · CommStationPanel](#-通讯基站管理面板--commstationpanel)

---

## 🔗 组件索引总览

| 组件名 | 路由 | 页面级 | 通用组件 | 复杂度 | 类型 |
|:-------|:-----|:------:|:--------:|:------:|:-----|
| [HotelDashboard](#-智慧酒店控制台--hoteldashboard) | `/hotel` | ✅ | ❌ | ⭐⭐ | Page |
| [CommStationPanel](#-通讯基站管理面板--commstationpanel) | `/comm-station` | ✅ | ❌ | ⭐⭐ | Page |

---

## 🏨 智慧酒店控制台 · HotelDashboard

**文件**：`src/app/modules/business/HotelDashboard.tsx`
**路由**：`/hotel`
**权限**：`business.hotel.read`
**类型**：页面级组件 (Page Component)

### 用途

面向酒店行业的多模型协作智能控制台，集成运营数据展示、AI 模型协同对话、场景参数配置与智能决策推荐，帮助酒店管理者一站式完成日常运营与收益优化。

### 核心功能

| 功能模块 | 描述 |
|:---------|:-----|
| **🎛️ 运营控制台** | 入住率、RevPAR、平均房价、客房状态（在住/空房/清洁/维修）实时概览，今日到店/离店人数统计卡片，近 7 日收入趋势折线图 |
| **🤝 模型协作区** | 多 AI 模型对话面板，调度模型 (Orchestrator) 协调分析模型、客服模型、运营模型、质检模型的任务分发与结果融合，支持任务历史回溯 |
| **⚙️ 场景配置** | 酒店类型选择（经济型/商务/度假/豪华）、服务等级配置、价格策略参数（淡季/旺季/周末溢价）、客群偏好标签设置 |
| **💡 智能推荐** | 基于多模型分析输出的收益优化建议（动态调价、促销活动）、人员排班推荐（基于入住率预测）、服务升级提醒（VIP 客人到达） |

### 关键类型定义

```typescript
/** 酒店场景配置 */
export interface HotelConfig {
  /** 酒店唯一标识 */
  hotelId: string;
  /** 酒店名称 */
  hotelName: string;
  /** 酒店类型 */
  hotelType: 'economy' | 'business' | 'resort' | 'luxury';
  /** 服务等级 1-5 */
  serviceLevel: 1 | 2 | 3 | 4 | 5;
  /** 总房间数 */
  totalRooms: number;
  /** 价格策略 */
  pricingStrategy: {
    basePrice: number;
    weekendPremium: number;       // % 溢价比例
    peakSeasonPremium: number;    // % 溢价比例
    lastMinuteDiscount: number;   // % 折扣比例
  };
  /** 启用的功能模块 */
  enabledModules: string[];
  /** 多模型协作配置 */
  modelConfig: {
    orchestratorModel: string;
    analystModel: string;
    conciergeModel: string;
    operatorModel: string;
    inspectorModel: string;
  };
}

/** 酒店运营快照数据 */
interface HotelOperationsSnapshot {
  occupancyRate: number;          // % 入住率
  revPAR: number;                 // 每间可售房收入
  averageRate: number;            // 平均房价
  roomsStatus: {
    occupied: number;
    vacant: number;
    cleaning: number;
    maintenance: number;
  };
  todayArrivals: number;
  todayDepartures: number;
  revenueTrend: { date: string; revenue: number }[];
}

/** 多模型协作任务 */
interface ModelCollaborationTask {
  id: string;
  type: 'analysis' | 'concierge' | 'operation' | 'inspection';
  status: 'pending' | 'running' | 'completed' | 'failed';
  assignedModel: string;
  prompt: string;
  result?: string;
  createdAt: number;
  completedAt?: number;
}

/** 智能推荐项 */
interface RecommendationItem {
  id: string;
  category: 'revenue' | 'staffing' | 'service' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  confidence: number;             // 0-1
  actionable: boolean;
}
```

### 关键 Props

```typescript
export interface HotelDashboardProps {
  /** 酒店 ID，用于多酒店场景下的数据隔离 */
  hotelId?: string;
  /** 布局变体：full 完整控制台 / compact 紧凑嵌入模式 */
  variant?: 'full' | 'compact';
  /** 初始场景配置（可选，默认从存储读取） */
  initialConfig?: Partial<HotelConfig>;
  /** 配置变更回调 */
  onConfigChange?: (config: HotelConfig) => void;
  /** 推荐操作点击回调 */
  onRecommendationAction?: (rec: RecommendationItem) => void;
  /** 自定义 className */
  className?: string;
}
```

### 默认值

```typescript
const DEFAULT_HOTEL_CONFIG: HotelConfig = {
  hotelId: 'default',
  hotelName: '云枢智慧酒店',
  hotelType: 'business',
  serviceLevel: 4,
  totalRooms: 200,
  pricingStrategy: {
    basePrice: 399,
    weekendPremium: 20,
    peakSeasonPremium: 35,
    lastMinuteDiscount: 15,
  },
  enabledModules: ['revenue', 'concierge', 'housekeeping', 'inspection'],
  modelConfig: {
    orchestratorModel: 'zhipu-glm-4',
    analystModel: 'deepseek-v3',
    conciergeModel: 'zhipu-glm-4',
    operatorModel: 'ollama-llama3',
    inspectorModel: 'deepseek-v3',
  },
};
```

### 使用示例

```tsx
// 方式一：路由中懒加载（推荐）
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

const HotelDashboard = lazy(() =>
  import('./modules/business/HotelDashboard').then(m => ({ default: m.HotelDashboard }))
);

<Route
  path="/hotel"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <HotelDashboard />
    </Suspense>
  }
/>
```

```tsx
// 方式二：自定义配置 + 回调
import { HotelDashboard } from '../modules/business/HotelDashboard';

function HotelManagementPage() {
  const [config, setConfig] = useState<HotelConfig>();

  return (
    <HotelDashboard
      hotelId="hotel-sh-001"
      variant="full"
      initialConfig={{
        hotelName: '上海云枢商务酒店',
        hotelType: 'business',
        totalRooms: 350,
      }}
      onConfigChange={(newConfig) => {
        setConfig(newConfig);
        console.log('[Hotel] Config updated:', newConfig);
      }}
      onRecommendationAction={(rec) => {
        if (rec.actionable) {
          toast.success(`执行推荐：${rec.title}`);
        }
      }}
    />
  );
}
```

```tsx
// 方式三：紧凑模式嵌入其他面板
<GlassCard className="h-[600px]">
  <HotelDashboard
    variant="compact"
    hotelId="quick-view"
  />
</GlassCard>
```

---

## 📡 通讯基站管理面板 · CommStationPanel

**文件**：`src/app/modules/business/CommStationPanel.tsx`
**路由**：`/comm-station`
**权限**：`business.comm.read` / `business.comm.manage`（配置下发）
**类型**：页面级组件 (Page Component)

### 用途

面向通讯行业的基站管理与信号监控面板，提供基站列表总览、实时信号质量监控、分级告警管理与远程配置下发能力，实现基站运维的全闭环管理。

### 核心功能

| 功能模块 | 描述 |
|:---------|:-----|
| **📋 基站列表** | 基站表格/卡片双视图切换，按区域/状态/型号筛选，关键字搜索；展示基站名称、IP 地址、型号、区域、在线状态、信号等级徽标 |
| **📶 信号监控** | 选中基站后展示 RSSI（接收信号强度）、SNR（信噪比）、带宽、延迟四项核心指标的实时数值 + 近 24 小时趋势折线图 |
| **🚨 告警管理** | 三级告警（一般/重要/紧急）列表，告警详情弹窗（时间/基站/指标/阈值/当前值），告警确认/忽略/派发工单操作，历史告警 Tab |
| **⚙️ 配置下发** | 远程参数配置表单（发射功率、信道、频点、MTU），单台/批量下发，固件升级入口，配置执行结果反馈与回滚按钮 |

### 关键类型定义

```typescript
/** 信号等级枚举 */
export type SignalLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

/** 基站状态 */
export type StationStatus = 'online' | 'offline' | 'warning' | 'maintenance';

/** 基站信息 */
export interface StationInfo {
  /** 基站唯一 ID */
  stationId: string;
  /** 基站名称 */
  name: string;
  /** IP 地址 */
  ipAddress: string;
  /** 硬件型号 */
  model: string;
  /** 所属区域 */
  region: string;
  /** 当前状态 */
  status: StationStatus;
  /** 固件版本 */
  firmwareVersion: string;
  /** 安装时间 (timestamp) */
  installedAt: number;
  /** 最后心跳时间 (timestamp) */
  lastHeartbeat: number;
}

/** 基站实时信号快照 */
interface SignalSnapshot {
  stationId: string;
  /** RSSI: 接收信号强度指示 (dBm) */
  rssi: number;
  /** SNR: 信噪比 (dB) */
  snr: number;
  /** 带宽 (Mbps) */
  bandwidth: number;
  /** 往返延迟 (ms) */
  latency: number;
  /** 丢包率 (%) */
  packetLoss: number;
  /** 采样时间 */
  timestamp: number;
}

/** 告警级别 */
type AlertLevel = 'info' | 'warning' | 'critical';

/** 告警记录 */
interface AlertRecord {
  id: string;
  stationId: string;
  stationName: string;
  level: AlertLevel;
  metric: 'rssi' | 'snr' | 'bandwidth' | 'latency' | 'packetLoss' | 'heartbeat';
  threshold: number;
  currentValue: number;
  message: string;
  triggeredAt: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolved: boolean;
  resolvedAt?: number;
}

/** 基站配置参数 */
export interface StationConfig {
  /** 发射功率 (dBm) */
  transmitPower: number;
  /** 信道编号 */
  channel: number;
  /** 中心频点 (MHz) */
  frequency: number;
  /** MTU 大小 (bytes) */
  mtu: number;
  /** 启用 DTIM */
  dtimEnabled: boolean;
  /** DTIM 间隔 */
  dtimPeriod: number;
  /** 支持的频段 */
  band: '2.4G' | '5G' | '6G' | 'dual' | 'tri';
}

/** 告警阈值配置 */
interface AlertThresholdConfig {
  rssiCritical: number;          // 默认 -90 dBm
  rssiWarning: number;           // 默认 -80 dBm
  snrCritical: number;           // 默认 10 dB
  snrWarning: number;            // 默认 15 dB
  latencyCritical: number;       // 默认 200 ms
  latencyWarning: number;        // 默认 100 ms
  packetLossCritical: number;    // 默认 5 %
  packetLossWarning: number;     // 默认 2 %
  heartbeatTimeoutSec: number;   // 默认 120 s
}
```

### 关键 Props

```typescript
export interface CommStationPanelProps {
  /** 区域过滤，仅显示指定区域的基站 */
  regionFilter?: string;
  /** 布局变体：full 完整面板 / compact 紧凑监控模式 */
  variant?: 'full' | 'compact';
  /** 是否启用配置下发能力（基于权限控制） */
  allowConfigPush?: boolean;
  /** 告警阈值配置（可选，默认内置） */
  alertThresholds?: Partial<AlertThresholdConfig>;
  /** 配置下发前回调，返回 false 可取消下发 */
  onBeforeConfigPush?: (
    stationIds: string[],
    config: Partial<StationConfig>
  ) => boolean | Promise<boolean>;
  /** 配置下发完成回调 */
  onConfigPushed?: (
    result: { stationId: string; success: boolean; error?: string }[]
  ) => void;
  /** 自定义 className */
  className?: string;
}
```

### 信号等级阈值映射

```typescript
/**
 * RSSI → SignalLevel 映射规则
 * excellent: >= -60 dBm
 * good:      -60 ~ -75 dBm
 * fair:      -75 ~ -85 dBm
 * poor:      -85 ~ -95 dBm
 * critical:  < -95 dBm
 */
export function classifySignalLevel(rssi: number): SignalLevel;

/**
 * SNR → 评级映射
 * excellent: >= 30 dB
 * good:      20 ~ 30 dB
 * fair:      15 ~ 20 dB
 * poor:      10 ~ 15 dB
 * critical:  < 10 dB
 */
export function classifySNR(snr: number): SignalLevel;

/**
 * 计算基站综合健康分 (0-100)
 * 综合考虑信号、SNR、延迟、丢包
 */
export function calculateStationHealth(snapshot: SignalSnapshot): number;
```

### 使用示例

```tsx
// 方式一：路由中懒加载（推荐）
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

const CommStationPanel = lazy(() =>
  import('./modules/business/CommStationPanel').then(m => ({ default: m.CommStationPanel }))
);

<Route
  path="/comm-station"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <CommStationPanel />
    </Suspense>
  }
/>
```

```tsx
// 方式二：权限控制 + 区域过滤 + 下发回调
import { CommStationPanel } from '../modules/business/CommStationPanel';

function CommManagementPage() {
  const { user } = useAuth();
  const canManage = user?.permissions?.includes('business.comm.manage');

  return (
    <CommStationPanel
      variant="full"
      regionFilter="east-china"
      allowConfigPush={canManage}
      onBeforeConfigPush={async (stationIds, config) => {
        // 二次确认
        return window.confirm(
          `即将对 ${stationIds.length} 台基站下发配置，是否继续？`
        );
      }}
      onConfigPushed={(results) => {
        const success = results.filter(r => r.success).length;
        const failed = results.length - success;
        toast.success(
          `配置下发完成：成功 ${success} 台${failed > 0 ? `，失败 ${failed} 台` : ''}`
        );
      }}
    />
  );
}
```

```tsx
// 方式三：紧凑监控模式嵌入 NOC 大屏
<div className="grid grid-cols-3 gap-4">
  <GlassCard>
    <CommStationPanel variant="compact" regionFilter="beijing" />
  </GlassCard>
  <GlassCard>
    <CommStationPanel variant="compact" regionFilter="shanghai" />
  </GlassCard>
  <GlassCard>
    <CommStationPanel variant="compact" regionFilter="guangzhou" />
  </GlassCard>
</div>
```

---

<div align="center">

---

**[⬆ 返回顶部](#-目录--table-of-contents)** · **[README.md](./README.md)** · **[API-REFERENCE.md](./API-REFERENCE.md)** · **[DEV-GUIDE.md](../../src/app/modules/business/DEV-GUIDE.md)**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
