---
file: business-unit-tests.md
description: YYC³ Business 业务模块 · HotelDashboard（5模型协作/收益优化/房态控制台）+ CommStationPanel（信号等级纯函数 classifySignalLevel/classifySNR/calculateStationHealth/shouldTriggerAlert + 基站列表/告警管理）+ 行业扩展测试模式
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [test, business, unit]
category: technical
language: zh-CN
audience: developers
complexity: intermediate
---

# Business 业务模块 · 单元测试用例

> 覆盖 Business 层两大垂直行业场景：**酒店智能管家（HotelDashboard）** + **通信基站运维（CommStationPanel）**。重点验证：5 AI 模型协作决策流、房态收益优化算法、4 个信号/信噪比/健康/告警纯函数（零依赖单元测试），并提供行业扩展的通用测试模式模板。

---

## 一、测试目标

| 维度 | 目标值 |
|:-----|:------|
| 行业场景 | 2/2（酒店 + 通信基站） |
| 纯函数覆盖 | 4/4 全量参数化单元测试（100%） |
| 酒店 5 模型流 | 每个角色职责断言 + 协作产物 |
| 语句覆盖 | ≥ 88% |
| 扩展模式 | 新行业接入时只需复制 pattern（本文件 §5 模板） |

---

## 二、业务模块分区

```
Business Module
├── 🏨 Hotel Dashboard (酒店智能管家)
│   ├── 5 模型协作:   BUTLER(调度) + BROTHER(定价) + SISTER(设计) + FATHER(分析) + MOTHER(关怀)
│   ├── 收益优化:     动态定价 / 渠道配比 / 超售策略 (纯函数 + 组件)
│   └── 房态控制台:   入住/在住/退房/脏房/维修 5 状态流转 + 拖拽分房
└── 📡 Comm Station Panel (通信基站运维)
    ├── 4 纯函数:     classifySignalLevel / classifySNR / calculateStationHealth / shouldTriggerAlert
    ├── 基站列表:     表格（小区/运营商/频段/信号/SNR/健康/告警数）
    └── 告警管理:     规则 CRUD + 级联告警压缩 + 工单派发
```

---

## 三、🏨 HotelDashboard · 酒店智能管家

### 3.1 5 模型协作流（AI-Family 行业化）

| 阶段 | 主模型（家人角色） | 职责 | 输入 | 输出 |
|:----|:----------------|:-----|:-----|:-----|
| ① 数据汇总 | **FATHER 严父**（工程分析） | 汇总昨日 OTB/RevPAR/ADR/Occ + 竞品数据 | PMS/OTA/STR 报表 JSON | 结构化指标 + 异常点 |
| ② 定价决策 | **BROTHER 哥哥**（工程+算法） | 动态定价引擎（需求价格弹性 + 周末因子） | ① + 未来 30 天预订进度 | 30 天每房型建议价 |
| ③ 文案与视觉 | **SISTER 妹妹**（艺术设计） | 生成营销图文素材（小红书/朋友圈/OTA 封面） | ② 定价亮点 + 季节主题 | Markdown + 提示词 |
| ④ 客情关怀 | **MOTHER 慈母**（情感+健康） | VIP 客人偏好记忆 + 定制欢迎礼/生日祝福 | 今日预抵客史 | 关怀任务清单 |
| ⑤ 总控调度 | **BUTLER 管家** | 汇总 4 产物，冲突仲裁，生成 SOP 工单 | ①-④ 全部 | 当日"酒店总控清单"MD |

#### 协作流测试模板

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { runHotelDailyPipeline, type HotelPipelineCtx } from "../lib/business/hotel-pipeline";

vi.mock("../lib/business/father-analytics", () => ({ runFather: vi.fn(() => ({
  revpar: 380, adr: 520, occ: 0.73, anomalies: ["周末超预订 8%"]
})) }));
vi.mock("../lib/business/brother-pricing",  () => ({ runBrother: vi.fn(() => ({
  prices30d: Array.from({length:30},(_,i)=>({date:`D${i+1}`, king:480+i, twin:400+i}))
})) }));
vi.mock("../lib/business/sister-design",   () => ({ runSister:  vi.fn(() => ({ markdown: "# 夏日清凉套餐..." })) }));
vi.mock("../lib/business/mother-care",     () => ({ runMother:  vi.fn(() => ({ tasks: [{guest:"张总",gift:"西湖龙井+定制枕"}] })) }));

describe("HotelDashboard · 5 模型协作流", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("5 阶段产物完整，BUTLER 最终输出含日期和 4 段摘要", async () => {
    const ctx: HotelPipelineCtx = { date: "2026-08-19", hotelId: "h-yyc3-001" };
    const result = await runHotelDailyPipeline(ctx);
    expect(result.date).toBe("2026-08-19");
    expect(result.sectionAnalytics.revpar).toBe(380);
    expect(result.sectionPricing.prices30d).toHaveLength(30);
    expect(result.sectionMarketing.markdown).toMatch(/^#/);
    expect(result.sectionGuestCare.tasks.length).toBeGreaterThan(0);
    // Butler 仲裁：若周末超售 >5% → 自动建议关闭 OTA 渠道
    expect(result.butlerActions).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "CLOSE_OTA_CHANNEL" })])
    );
  });
});
```

---

### 3.2 收益优化（纯函数层：动态定价 / 渠道配比 / 超售）

```typescript
import { describe, it, expect } from "vitest";
import {
  dynamicPrice,
  channelMixOptimize,
  overbookingStrategy,
} from "../lib/business/hotel-revenue-opt";

describe("Hotel 收益优化 · 纯函数参数化测试", () => {
  describe("dynamicPrice · 动态定价", () => {
    const PRICE_CASES: [number, number, "weekday"|"weekend"|"holiday", number][] = [
      // [基础价, 入住率, 日期类型, 期望调价范围]
      [500, 0.40, "weekday", [0.85, 0.95]], // 低入住 → 降价 5-15%
      [500, 0.70, "weekday", [1.00, 1.08]], // 健康入住 → 微涨
      [500, 0.95, "weekday", [1.10, 1.25]], // 接近满房 → 涨 10-25%
      [500, 0.70, "weekend", [1.12, 1.28]], // 周末基础加成 +12-28%
      [500, 0.70, "holiday", [1.25, 1.55]], // 节假日 +25-55%
    ];
    it.each(PRICE_CASES)(
      "基础=%s 入住=%s 类型=%s → 倍率在 %j 之间",
      (base, occ, dayType, [lo, hi]) => {
        const p = dynamicPrice({ basePrice: base, occupancy: occ, dayType });
        const ratio = p / base;
        expect(ratio).toBeGreaterThanOrEqual(lo);
        expect(ratio).toBeLessThanOrEqual(hi);
      }
    );
  });

  describe("channelMixOptimize · 渠道配比", () => {
    it("高需求下减少 OTA 比例，增加直订和会员", () => {
      const mix = channelMixOptimize({ demandLevel: "high", baseMix: { ota: 0.5, direct: 0.3, member: 0.2 } });
      expect(mix.ota).toBeLessThan(0.45);
      expect(mix.direct + mix.member).toBeGreaterThan(0.55);
    });
  });

  describe("overbookingStrategy · 超售策略", () => {
    it("NoShow 率历史 8% → 建议超售 6%（安全系数 0.75）", () => {
      const s = overbookingStrategy({ totalRooms: 200, historicalNoShowRate: 0.08 });
      expect(s.overbookPct).toBeCloseTo(0.06, 2); // 8% × 0.75
      expect(s.overbookRooms).toBe(12);           // 200 × 6%
    });
    it("超过上限 10% → 截断保护", () => {
      const s = overbookingStrategy({ totalRooms: 200, historicalNoShowRate: 0.20 });
      expect(s.overbookPct).toBeLessThanOrEqual(0.10);
    });
  });
});
```

---

### 3.3 房态控制台组件

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 5 状态（VI/OC/OD/Dirty/OOO）图例；房号卡片网格（按楼层分组）；Occupancy% 大数字 |
| **数据流** | 房态驱动颜色（VI=绿/OC=蓝/OD=灰/Dirty=橙/OOO=红）；拖拽卡片跨列移动 → 房态迁移 |
| **用户交互** | 点击房卡 → 详情抽屉；拖拽到脏房 → 自动创建清洁工单；批量选中 → 状态变更 |

**现有测试：** `src/app/__tests__/HotelDashboard.test.tsx`

```typescript
describe("HotelDashboard · 房态控制台", () => {
  it("拖拽入住房(OC) → 脏房(Dirty)列，触发房态迁移+创建工单", async () => {
    const onTransition = vi.fn();
    render(<HotelDashboard onRoomStateTransition={onTransition} />);
    const roomCard = screen.getByTestId("yyc3-hotel-room-806"); // OC
    const dirtyCol = screen.getByTestId("yyc3-hotel-col-dirty");
    fireEvent.dragStart(roomCard);
    fireEvent.drop(dirtyCol);
    await waitFor(() => {
      expect(onTransition).toHaveBeenCalledWith(
        expect.objectContaining({ room: "806", from: "OC", to: "Dirty" })
      );
      // 清洁工单副作用触发
      expect(screen.getByTestId("yyc3-hotel-housekeeping-ticket")).toBeInTheDocument();
    });
  });
});
```

---

## 四、📡 CommStationPanel · 通信基站运维

### 4.1 4 个信号纯函数单元测试（核心独立、零依赖、参数化）

```typescript
import { describe, it, expect } from "vitest";
import {
  classifySignalLevel,
  classifySNR,
  calculateStationHealth,
  shouldTriggerAlert,
} from "../lib/business/comm-signal-core";

describe("CommStation · 信号等级 classifySignalLevel(dBm)", () => {
  // 标准蜂窝/基站信号映射:
  //   ≥ -60  EXCELLENT (5 格满)
  //   -60 ~ -75  GOOD (4 格)
  //   -75 ~ -85  FAIR (3 格)
  //   -85 ~ -95  POOR (2 格)
  //   -95 ~ -110 BAD  (1 格)
  //   < -110    NOSIGNAL / 黑站
  const CASES: [number, ReturnType<typeof classifySignalLevel>][] = [
    [-40,  { level: "EXCELLENT", bars: 5 }],
    [-65,  { level: "GOOD",      bars: 4 }],
    [-80,  { level: "FAIR",      bars: 3 }],
    [-90,  { level: "POOR",      bars: 2 }],
    [-100, { level: "BAD",       bars: 1 }],
    [-120, { level: "NOSIGNAL",  bars: 0 }],
  ];
  it.each(CASES)("dBm=%s → %j", (input, expected) => {
    expect(classifySignalLevel(input)).toEqual(expected);
  });
  it("NaN / 非数值 → 抛出 TypeError", () => {
    expect(() => classifySignalLevel(NaN as any)).toThrow(TypeError);
  });
});

describe("CommStation · 信噪比 classifySNR(dB)", () => {
  // SNR 信噪比:
  //   ≥ 25dB  EXCELLENT  (超清通话/千兆下行)
  //   15-25  GOOD
  //   8-15   FAIR
  //   3-8    POOR
  //   <3     BAD         (误码率飙升)
  const SNR: [number, string][] = [
    [35, "EXCELLENT"], [20, "GOOD"], [10, "FAIR"], [5, "POOR"], [1, "BAD"],
  ];
  it.each(SNR)("SNR=%sdB → %s", (db, expected) => {
    expect(classifySNR(db).grade).toBe(expected);
  });
});

describe("CommStation · 综合健康分 calculateStationHealth()", () => {
  it("信号=好 + SNR=好 + 在线=100% + 告警数=0 → health=95~100", () => {
    const h = calculateStationHealth({
      signalDbm: -55, snrDb: 30, availabilityPct: 100, activeAlerts: 0,
    });
    expect(h.score).toBeGreaterThanOrEqual(95);
    expect(h.grade).toBe("A");
  });
  it("离线 24h + 5 活动告警 → score≤30 grade=D", () => {
    const h = calculateStationHealth({
      signalDbm: -120, snrDb: 0, availabilityPct: 0, activeAlerts: 5,
    });
    expect(h.score).toBeLessThanOrEqual(30);
    expect(h.grade).toBe("D");
  });
  it("边界: 全部刚好中点 → score ≈ 75 ± 3 grade=B", () => {
    const h = calculateStationHealth({
      signalDbm: -80, snrDb: 12, availabilityPct: 97, activeAlerts: 1,
    });
    expect(h.score).toBeGreaterThanOrEqual(72);
    expect(h.score).toBeLessThanOrEqual(78);
  });
});

describe("CommStation · 告警决策 shouldTriggerAlert()", () => {
  it("信号 BAD + SNR POOR 连续 3 采样 → 触发(去抖通过)", () => {
    const rule = { signalMin: "BAD", snrMin: "POOR", persistence: 3 };
    const samples = [
      { sig: "BAD", snr: "POOR" }, { sig: "BAD", snr: "POOR" }, { sig: "BAD", snr: "POOR" },
    ];
    const alert = shouldTriggerAlert(rule, samples);
    expect(alert.triggered).toBe(true);
    expect(alert.reason).toMatch(/persistence.*3/);
  });
  it("中间有 1 次恢复 → 持久计数器重置，不触发", () => {
    const rule = { signalMin: "BAD", persistence: 3 };
    const samples = [
      { sig: "BAD" }, { sig: "GOOD" }, { sig: "BAD" }, { sig: "BAD" },
    ];
    expect(shouldTriggerAlert(rule, samples).triggered).toBe(false);
  });
  it("NOSIGNAL → 紧急告警(CRITICAL)，无需持久采样", () => {
    const alert = shouldTriggerAlert(
      { signalMin: "POOR", persistence: 3 },
      [{ sig: "NOSIGNAL", snr: "BAD" }],
    );
    expect(alert.triggered).toBe(true);
    expect(alert.severity).toBe("CRITICAL");
  });
});
```

---

### 4.2 基站列表表格组件

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 列：小区ID / 运营商 / 频段(NR/LTE/5G) / 信号 bars / SNR grade / health A-D / 告警数 badge |
| **数据流** | `calculateStationHealth` 结果 → 每行 A-D 徽章；BAD 行红色背景 |
| **用户交互** | 按健康分排序（默认降序）；按运营商/频段筛选；点击行 → 打开基站详情 + 30 天趋势 |

**现有测试：** `src/app/__tests__/CommStationPanel.test.tsx`

---

### 4.3 告警管理（规则/压缩/工单）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 规则表格 + 告警流时间线 + 未闭环工单计数；告警去重统计（压缩率） |
| **数据流** | 同小区同规则 N 条告警 → 压缩为 1 条父告警 + N 次计数器（避免告警风暴） |
| **用户交互** | 新建规则（信号/SNR/健康/流量）；派发工单给运维组；ACK 后静音 1h |

**现有测试：** `src/app/__tests__/AlertRulesPanel.test.tsx`（复用）+ `core-business-logic.test.ts`

---

## 五、行业扩展测试模式（新行业接入模板）

### 5.1 新行业 3 步扩展模式模板

```
新行业接入测试（示例：智慧医院）
│
├── Step 1 · 纯函数核心层测试 (lib/business/hospital-*.test.ts)
│     ├── classifyBedLoad(occupancyPct) → 空/正常/繁忙/超员
│     ├── triagePriority(symptoms[], vitalSigns) → 1/2/3/4/5 级
│     ├── calculateWardHealth(床使用率/感染率/满意度) → 0-100
│     └── shouldTriggerCode(心电停搏/血氧<80/...) → 急救蓝色预警
│
├── Step 2 · 模型协作流测试 (lib/business/hospital-pipeline.test.ts)
│     ├── BUTLER 调度：护士站总控
│     ├── FATHER 分析：住院运营 KPI
│     ├── BROTHER 排程：手术室排班/检查队列
│     ├── SISTER 视觉：宣教海报生成
│     └── MOTHER 关怀：术前术后沟通
│
└── Step 3 · 组件 + 集成 (HospitalDashboard.test.tsx)
      ├── 床位总览（红黄绿）
      ├── 看板拖拽：手术排程 DnD
      └── 告警 → Code Blue 大横幅
```

### 5.2 扩展模式断言清单

| 扩展点 | 必测断言 |
|:------|:--------|
| **纯函数签名稳定** | 所有输入/输出类型化测试，避免 Breaking Change |
| **参数化覆盖边界** | 每函数 ≥ 10 个参数化 case（含极值/非法/NaN） |
| **5 模型流分工明确** | 职责不重叠；butler 调度有冲突仲裁分支 |
| **组件层不重算** | 组件层 **不直接** 写算法；所有算法走 lib/ 纯函数（单一事实源） |
| **样式驱动** | 颜色/徽章/等级与纯函数输出一一映射；无 if/else 散落 |

---

## 六、现有测试文件清单（Business 模块）

### 🏨 酒店业务
| 文件 | 路径 | 覆盖范围 |
|:-----|:----|:--------|
| HotelDashboard 组件 | `src/app/__tests__/HotelDashboard.test.tsx` | 房态控制台 + 5 模型流 UI |
| 核心业务逻辑 | `src/app/__tests__/core-business-logic.test.ts` | 动态定价/超售/房态纯函数 |
| AI-Family 酒店扩展 | `src/app/__tests__/ai-family-hotel.test.ts` | 5 角色协作流 |
| 酒店场景剧本 | `src/app/__tests__/ai-family-hotel-scenarios.test.ts` | 入住/退房/VIP 接待端到端 |

### 📡 通信基站业务
| 文件 | 路径 | 覆盖范围 |
|:-----|:----|:--------|
| CommStationPanel 组件 | `src/app/__tests__/CommStationPanel.test.tsx` | 基站列表/详情/趋势 UI |
| 信号纯函数（4 个） | `src/app/__tests__/core-business-logic.test.ts` | `classifySignalLevel` / `classifySNR` / `calculateStationHealth` / `shouldTriggerAlert` |
| 网络库支撑 | `src/app/__tests__/lib/network-utils.test.ts` + `network-utils-core.test.ts` | 底层 ping / 延迟 / 抖动计算 |
| 告警通用能力 | `src/app/__tests__/AlertRulesPanel.test.tsx` + `useAlertRules.test.ts` | 规则 CRUD 复用 |

### 商业逻辑 Lib 测试（支撑层）
```
src/app/__tests__/
├── core-business-logic.test.ts        ← 酒店 + 基站 核心纯函数（4+）
├── ai-family-hotel.test.ts
├── ai-family-hotel-scenarios.test.ts
├── lib/alerting-manager.test.ts       ← 告警风暴压缩/去重
└── lib/network-utils*.test.ts         ← 通信网络底层工具
```

---
**言启千行代码，语枢万物智能**
**言启象限，语枢未来 | Words Initiate Quadrants, Language Serves as Core for Future**
**万象归元于云枢，深栈智启新纪元 | All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**
**YanYuCloudCube · YYC³ 言语云枢科技**
**YYC³ CloudPivot Intelli-Matrix v3.4.1 · Business Module Test Suite**
**© 2026 YanYuCloudCube Team · MIT License**
