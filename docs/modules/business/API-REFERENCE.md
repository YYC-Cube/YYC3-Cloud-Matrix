---
file: API-REFERENCE.md
description: Business 模块 API 参考 · index.ts 全部导出签名、说明与类型
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [api],[reference],[business],[module]
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

- [Barrel 导出清单总览](#barrel-导出清单总览)
- [组件 API 参考 (React Components)](#组件-api-参考-react-components)
  - [HotelDashboard](#hoteldashboard)
  - [CommStationPanel](#commstationpanel)
- [纯函数 API 参考 (Pure Functions)](#纯函数-api-参考-pure-functions)
  - [classifySignalLevel](#classifysignallevel)
  - [classifySNR](#classifysnr)
  - [calculateStationHealth](#calculatestationhealth)
  - [shouldTriggerAlert](#shouldtriggeralert)
  - [mapHotelTypeToLabel](#maphoteltypetolabel)
- [类型定义索引 (Type Definitions)](#类型定义索引-type-definitions)
- [配置接口汇总](#配置接口汇总)

---

## 📦 Barrel 导出清单总览

> 来源文件：`src/app/modules/business/index.ts`
>
> 共导出 **2 个组件** + **5 个类型接口**（纯函数需从组件文件直接引用）

### 📋 组件导出清单 (2)

```typescript
// 1. 酒店管理
export { HotelDashboard } from './HotelDashboard';

// 2. 通讯站管理
export { CommStationPanel } from './CommStationPanel';
```

### 📐 类型导出清单 (5)

```typescript
// HotelDashboard 相关类型
export type { HotelDashboardProps } from './HotelDashboard';
export type { HotelConfig } from './HotelDashboard';

// CommStationPanel 相关类型
export type { CommStationPanelProps } from './CommStationPanel';
export type { StationInfo } from './CommStationPanel';
export type { SignalLevel } from './CommStationPanel';
```

> 💡 **提示**：更多内部类型（如 `RecommendationItem`、`AlertRecord`、`StationConfig` 等）需从对应组件文件直接 import。

---

## 🧩 组件 API 参考 (React Components)

### HotelDashboard

| 项 | 值 |
|:---|:---|
| **签名** | `function HotelDashboard(props?: HotelDashboardProps): JSX.Element` |
| **来源** | `./HotelDashboard.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props** | 有 (见下表) |
| **路由** | `/hotel` |
| **权限** | `business.hotel.read` |
| **Hook 依赖** | `useI18n` |
| **共享组件依赖** | `GlassCard` (from `../shared/GlassCard`) |
| **UI 依赖** | `../../components/ui/*` (Card, Progress, Badge, Button, Tabs, Table, Chart 等) |
| **三方依赖** | `lucide-react` (Building2, Users, TrendingUp, Bot, Settings, Sparkles 等) |
| **Lib 依赖** | `../../lib/*` (格式化、数据处理工具) |

**说明**：智慧酒店多模型协作控制台。采用 Tab 布局分为「运营控制台」「模型协作区」「场景配置」「智能推荐」四大模块，内部通过多模型协作引擎 (Orchestrator) 调度 5 种专长 AI 模型协同工作。

---

#### HotelDashboardProps

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|:-----|:-----|:-------|:----:|:-----|
| `hotelId` | `string` | `'default'` | ❌ | 酒店唯一标识，用于多酒店场景下的数据隔离与配置存储 |
| `variant` | `'full' \| 'compact'` | `'full'` | ❌ | 布局变体：full 为完整四 Tab 控制台，compact 为精简概览模式（嵌入场景） |
| `initialConfig` | `Partial<HotelConfig>` | `{}` | ❌ | 初始场景配置，可覆盖默认值，优先级高于 localStorage 读取 |
| `onConfigChange` | `(config: HotelConfig) => void` | `-` | ❌ | 场景配置变更时的回调，用于外部状态同步或持久化 |
| `onRecommendationAction` | `(rec: RecommendationItem) => void` | `-` | ❌ | 用户点击推荐项「执行」按钮时的回调 |
| `className` | `string` | `-` | ❌ | 自定义 className，追加到根 GlassCard 容器 |

**Props 完整签名**：

```typescript
export interface HotelDashboardProps {
  hotelId?: string;
  variant?: 'full' | 'compact';
  initialConfig?: Partial<HotelConfig>;
  onConfigChange?: (config: HotelConfig) => void;
  onRecommendationAction?: (rec: RecommendationItem) => void;
  className?: string;
}
```

---

### CommStationPanel

| 项 | 值 |
|:---|:---|
| **签名** | `function CommStationPanel(props?: CommStationPanelProps): JSX.Element` |
| **来源** | `./CommStationPanel.tsx` |
| **类型** | React.FC · 页面级组件 |
| **Props** | 有 (见下表) |
| **路由** | `/comm-station` |
| **权限** | `business.comm.read` (只读) / `business.comm.manage` (配置下发) |
| **Hook 依赖** | `useI18n` |
| **共享组件依赖** | `GlassCard` (from `../shared/GlassCard`) |
| **UI 依赖** | `../../components/ui/*` (Table, Card, Progress, Badge, AlertDialog, Button, Tabs, Select, Input 等) |
| **三方依赖** | `lucide-react` (Radio, Signal, AlertTriangle, Settings, Download, RefreshCw 等) |
| **Lib 依赖** | `../../lib/*` (格式化、数据处理工具) |

**说明**：通讯基站管理面板。实现基站列表 → 信号监控 → 告警管理 → 配置下发的全闭环运维流程。内部根据 `allowConfigPush` 属性控制配置下发能力的可见性与交互性。

---

#### CommStationPanelProps

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|:-----|:-----|:-------|:----:|:-----|
| `regionFilter` | `string` | `-` | ❌ | 区域过滤，设置后仅显示指定 region 的基站 |
| `variant` | `'full' \| 'compact'` | `'full'` | ❌ | 布局变体：full 为完整四模块面板，compact 为精简信号监控模式 |
| `allowConfigPush` | `boolean` | `false` | ❌ | 是否启用配置下发能力（通常与 RBAC 权限联动） |
| `alertThresholds` | `Partial<AlertThresholdConfig>` | `{}` | ❌ | 自定义告警阈值，可覆盖默认的 RSSI/SNR/延迟等触发线 |
| `onBeforeConfigPush` | `(stationIds: string[], config: Partial<StationConfig>) => boolean \| Promise<boolean>` | `-` | ❌ | 配置下发前拦截回调，返回 false 可终止下发（用于二次确认） |
| `onConfigPushed` | `(result: Array<{ stationId: string; success: boolean; error?: string }>) => void` | `-` | ❌ | 配置下发完成后的汇总结果回调 |
| `className` | `string` | `-` | ❌ | 自定义 className，追加到根 GlassCard 容器 |

**Props 完整签名**：

```typescript
export interface CommStationPanelProps {
  regionFilter?: string;
  variant?: 'full' | 'compact';
  allowConfigPush?: boolean;
  alertThresholds?: Partial<AlertThresholdConfig>;
  onBeforeConfigPush?: (
    stationIds: string[],
    config: Partial<StationConfig>
  ) => boolean | Promise<boolean>;
  onConfigPushed?: (
    result: { stationId: string; success: boolean; error?: string }[]
  ) => void;
  className?: string;
}
```

---

## 🔢 纯函数 API 参考 (Pure Functions)

> ⚠️ 所有纯函数均为 **副作用-free**，可直接在单元测试中 import 使用，无需 Mock 环境。
>
> 纯函数暂未通过 Barrel 统一导出，需从对应组件文件直接引用。

### classifySignalLevel

| 项 | 值 |
|:---|:---|
| **签名** | `function classifySignalLevel(rssi: number): SignalLevel` |
| **来源** | `./CommStationPanel.tsx` (named export) |
| **纯度** | ✅ 纯函数 · 无副作用 |

**说明**：根据 RSSI (接收信号强度指示, 单位 dBm) 映射为五档信号等级。

**阈值映射规则**：

| 输入范围 (dBm) | 返回值 | 语义 |
|:---------------|:-------|:-----|
| `rssi >= -60` | `'excellent'` | 优秀 |
| `-60 > rssi >= -75` | `'good'` | 良好 |
| `-75 > rssi >= -85` | `'fair'` | 一般 |
| `-85 > rssi >= -95` | `'poor'` | 较差 |
| `rssi < -95` | `'critical'` | 危险 |

**示例**：

```typescript
classifySignalLevel(-45);   // 'excellent'
classifySignalLevel(-72);   // 'good'
classifySignalLevel(-80);   // 'fair'
classifySignalLevel(-90);   // 'poor'
classifySignalLevel(-100);  // 'critical'
```

---

### classifySNR

| 项 | 值 |
|:---|:---|
| **签名** | `function classifySNR(snr: number): SignalLevel` |
| **来源** | `./CommStationPanel.tsx` (named export) |
| **纯度** | ✅ 纯函数 |

**说明**：根据 SNR (信噪比, 单位 dB) 映射为五档信号质量等级。

**阈值映射规则**：

| 输入范围 (dB) | 返回值 | 语义 |
|:--------------|:-------|:-----|
| `snr >= 30` | `'excellent'` | 优秀 |
| `30 > snr >= 20` | `'good'` | 良好 |
| `20 > snr >= 15` | `'fair'` | 一般 |
| `15 > snr >= 10` | `'poor'` | 较差 |
| `snr < 10` | `'critical'` | 危险 |

**示例**：

```typescript
classifySNR(35);  // 'excellent'
classifySNR(25);  // 'good'
classifySNR(17);  // 'fair'
classifySNR(12);  // 'poor'
classifySNR(5);   // 'critical'
```

---

### calculateStationHealth

| 项 | 值 |
|:---|:---|
| **签名** | `function calculateStationHealth(snapshot: SignalSnapshot): number` |
| **来源** | `./CommStationPanel.tsx` (named export) |
| **纯度** | ✅ 纯函数 |

**说明**：综合信号快照中的 RSSI、SNR、延迟、丢包率四项指标，加权计算基站健康分 (0-100)。

**权重分配**：

| 指标 | 权重 | 评分函数 |
|:-----|:-----|:---------|
| RSSI | 35% | 线性映射 -100dBm→0, -50dBm→100 |
| SNR | 30% | 线性映射 0dB→0, 35dB→100 |
| Latency | 20% | 线性映射 500ms→0, 10ms→100 |
| PacketLoss | 15% | 线性映射 10%→0, 0%→100 |

**输入类型**：

```typescript
interface SignalSnapshot {
  stationId: string;
  rssi: number;         // dBm
  snr: number;          // dB
  bandwidth: number;    // Mbps
  latency: number;      // ms
  packetLoss: number;   // %
  timestamp: number;
}
```

**示例**：

```typescript
calculateStationHealth({
  stationId: 'st-001',
  rssi: -65,
  snr: 28,
  bandwidth: 300,
  latency: 35,
  packetLoss: 0.2,
  timestamp: Date.now(),
});
// => 约 86 (健康状况良好)
```

---

### shouldTriggerAlert

| 项 | 值 |
|:---|:---|
| **签名** | `function shouldTriggerAlert(snapshot: SignalSnapshot, thresholds: AlertThresholdConfig): AlertLevel \| null` |
| **来源** | `./CommStationPanel.tsx` (named export) |
| **纯度** | ✅ 纯函数 |

**说明**：根据告警阈值配置，检测信号快照是否触发告警。返回 `null` 表示正常，否则返回告警级别。

**输入类型**：

```typescript
interface AlertThresholdConfig {
  rssiCritical: number;     // 默认 -90
  rssiWarning: number;      // 默认 -80
  snrCritical: number;      // 默认 10
  snrWarning: number;       // 默认 15
  latencyCritical: number;  // 默认 200
  latencyWarning: number;   // 默认 100
  packetLossCritical: number;   // 默认 5
  packetLossWarning: number;    // 默认 2
  heartbeatTimeoutSec: number;  // 默认 120
}
```

**告警级别优先级**：任一指标达到 `critical` → 返回 `'critical'`；否则任一达到 `warning` → 返回 `'warning'`；否则 `null`。

**示例**：

```typescript
const defaultThresholds = {
  rssiCritical: -90, rssiWarning: -80,
  snrCritical: 10, snrWarning: 15,
  latencyCritical: 200, latencyWarning: 100,
  packetLossCritical: 5, packetLossWarning: 2,
  heartbeatTimeoutSec: 120,
};

shouldTriggerAlert(
  { rssi: -70, snr: 25, latency: 40, packetLoss: 0 } as SignalSnapshot,
  defaultThresholds
);
// => null (正常)

shouldTriggerAlert(
  { rssi: -85, snr: 12, latency: 40, packetLoss: 0 } as SignalSnapshot,
  defaultThresholds
);
// => 'warning' (SNR 低于 warning 线)

shouldTriggerAlert(
  { rssi: -95, snr: 25, latency: 40, packetLoss: 0 } as SignalSnapshot,
  defaultThresholds
);
// => 'critical' (RSSI 低于 critical 线)
```

---

### mapHotelTypeToLabel

| 项 | 值 |
|:---|:---|
| **签名** | `function mapHotelTypeToLabel(type: HotelConfig['hotelType']): string` |
| **来源** | `./HotelDashboard.tsx` (named export) |
| **纯度** | ✅ 纯函数 |

**说明**：将酒店类型枚举映射为中文显示标签（配合 i18n 使用）。

**映射表**：

| 输入值 | 返回中文 |
|:-------|:---------|
| `'economy'` | `'经济型酒店'` |
| `'business'` | `'商务酒店'` |
| `'resort'` | `'度假酒店'` |
| `'luxury'` | `'豪华酒店'` |

---

## 📐 类型定义索引 (Type Definitions)

### Props 接口汇总

| 接口名 | 所属组件 | 定义位置 |
|:-------|:---------|:---------|
| `HotelDashboardProps` | HotelDashboard | `./HotelDashboard.tsx` |
| `CommStationPanelProps` | CommStationPanel | `./CommStationPanel.tsx` |

### 配置接口汇总

| 接口名 | 所属模块 | 定义位置 | 用途 |
|:-------|:---------|:---------|:-----|
| `HotelConfig` | 酒店管理 | `./HotelDashboard.tsx` | 酒店场景完整配置，含类型、服务等级、价格策略、模型配置 |
| `StationConfig` | 通讯站管理 | `./CommStationPanel.tsx` | 基站运行参数配置，含功率、信道、频点、MTU |
| `AlertThresholdConfig` | 通讯站管理 | `./CommStationPanel.tsx` | 告警阈值配置（8 项指标的 warning/critical 线） |

### 核心业务类型

| 类型名 | 所属模块 | 定义位置 | 用途 |
|:-------|:---------|:---------|:-----|
| `StationInfo` | 通讯站管理 | `./CommStationPanel.tsx` | 基站基础信息（ID/名称/IP/型号/区域/状态） |
| `SignalLevel` | 通讯站管理 | `./CommStationPanel.tsx` | 信号等级联合类型（5 档） |
| `StationStatus` | 通讯站管理 | `./CommStationPanel.tsx` | 基站运行状态联合类型（4 态） |
| `SignalSnapshot` | 通讯站管理 | `./CommStationPanel.tsx` | 单基站实时信号采样快照 |
| `AlertRecord` | 通讯站管理 | `./CommStationPanel.tsx` | 告警记录（含确认/解决状态流转） |
| `HotelOperationsSnapshot` | 酒店管理 | `./HotelDashboard.tsx` | 酒店运营数据快照（入住率/RevPAR/房态） |
| `ModelCollaborationTask` | 酒店管理 | `./HotelDashboard.tsx` | 多模型协作任务记录 |
| `RecommendationItem` | 酒店管理 | `./HotelDashboard.tsx` | 智能推荐项 |

### HotelConfig 完整结构

```typescript
export interface HotelConfig {
  hotelId: string;
  hotelName: string;
  hotelType: 'economy' | 'business' | 'resort' | 'luxury';
  serviceLevel: 1 | 2 | 3 | 4 | 5;
  totalRooms: number;
  pricingStrategy: {
    basePrice: number;
    weekendPremium: number;
    peakSeasonPremium: number;
    lastMinuteDiscount: number;
  };
  enabledModules: string[];
  modelConfig: {
    orchestratorModel: string;
    analystModel: string;
    conciergeModel: string;
    operatorModel: string;
    inspectorModel: string;
  };
}
```

### StationInfo 完整结构

```typescript
export interface StationInfo {
  stationId: string;
  name: string;
  ipAddress: string;
  model: string;
  region: string;
  status: 'online' | 'offline' | 'warning' | 'maintenance';
  firmwareVersion: string;
  installedAt: number;
  lastHeartbeat: number;
}
```

### SignalLevel 完整定义

```typescript
export type SignalLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
```

### StationConfig 完整结构

```typescript
export interface StationConfig {
  transmitPower: number;       // dBm
  channel: number;
  frequency: number;           // MHz
  mtu: number;                 // bytes
  dtimEnabled: boolean;
  dtimPeriod: number;
  band: '2.4G' | '5G' | '6G' | 'dual' | 'tri';
}
```

---

<div align="center">

---

**[⬆ 返回顶部](#-目录--table-of-contents)** · **[README.md](./README.md)** · **[COMPONENTS.md](./COMPONENTS.md)** · **[DEV-GUIDE.md](../../src/app/modules/business/DEV-GUIDE.md)**

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
