---
file: YYC3-PivotMatrixOps-项目命名规范.md
title: YYC³ 言语云枢·智能矩阵 项目命名规范 — Web 标签 · APP 中文名 · 品牌落地
description: YYC³ PivotMatrix Ops（言语云枢·智能矩阵）命名规范，含原始标识收敛路径、多场景命名矩阵、品牌标语体系、前端落地片段与禁用清单
author: YYC³ Team <admin@0379.email>
version: v1.1.0
created: 2026-11-10
updated: 2026-11-10
status: stable
tags: [standard, naming, brand, pivotmatrix, opspanel]
category: policy
language: zh-CN
audience: developers,managers,designers
complexity: basic
---

# YYC³ 言语云枢·智能矩阵 项目命名规范 — Web 标签 · APP 中文名 · 品牌落地

> **_YYC³_**（YanYuCloudCube™ · 注册商标）
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 核心理念

**五高架构**：高可用 | 高性能 | 高安全 | 高扩展 | 高智能
**五标体系**：标准化 | 规范化 | 自动化 | 可视化 | 智能化
**五化转型**：流程化 | 数字化 | 生态化 | 工具化 | 服务化
**五维评估**：时间维 | 空间维 | 属性维 | 事件维 | 关联维

---

## 一、原始标识与语义拆解

原始标识：`YYC3 CloudPivot-IDeviceMatrix-OpsPanel`

| 词根 | 原义 | 收敛后承载 | 说明 |
| ---- | ---- | ---------- | ---- |
| `YanYuCloudCube` | 品牌商标 | `YYC³` | 与 YYC³ Dynasty 看板家族同宗，品牌资产复用 |
| `CloudPivot` | 云枢 / 云枢纽 | `言语云枢` | 保留“枢”的核心语义，同时承载“言启象限”的语言资产 |
| `IDeviceMatrix` | 异构设备矩阵 | `智能矩阵` | 设备资产矩阵、算力节点矩阵的智能化表达 |
| `OpsPanel` | 运维管控面板 | `Ops` | 指向运维、巡检、告警、审计 |

**定型名称：`言语云枢·智能矩阵`（中文主名） / `YYC³ PivotMatrix Ops`（英文名）**

> 收敛逻辑：四段式长串 → 中文四段品牌名（言语云枢 · 智能矩阵）+ 英文两词产品名（PivotMatrix）+ 职能短词（Ops），兼顾溯源完整性、对外可读性与落地可写性。

---

## 二、核心命名矩阵（主选 + 衍生变体）

| 编号 | 正式英文名 | Web 标签（强制） | APP 中文名 | 产品全称 | 适用侧重 |
| ---- | ---------- | ---------------- | ---------- | -------- | -------- |
| **A1（主选）** | `YYC³ PivotMatrix Ops` | `言语云枢·智能矩阵` | `言语云枢·智能矩阵` | 言语云枢 · YYC³ PivotMatrix Ops 异构算力矩阵运维面板 | 内部算力集群主力面板，与 YYC³ Dynasty 同体系 |
| A2 | `YYC³ PivotMatrix Hub` | `言语云枢·矩阵枢纽` | `矩阵枢纽` | 言语云枢 PivotMatrix Hub 多节点汇聚管控台 | 侧重 QSFP 双链路、Tailscale 组网、BMC 纳管 |
| A3 | `YYC³ PivotMatrix Watch` | `言语云枢·矩阵值守` | `矩阵值守` | 矩阵值守 · 异构算力矩阵监控告警台 | 侧重 7×24 监控、多渠道告警聚合、大屏驾驶舱 |
| B1 | `iMatrixOps` | `矩阵运维` | `矩阵控` | iMatrixOps 异构设备运维矩阵面板 | 极简技术风、工程师侧边栏导航、移动端图标 |
| B2 | `PivotPanel` | `枢控面板` | `枢控` | PivotPanel 云枢设备统一管控面板 | 轻量 PWA、随身告警控制台 |
| C1 | `UniMatrix OpsCenter` | `全域矩阵运维中心` | `全域枢管` | UniMatrix 全域异构设备运维管控中心 | 对外客户交付、机房审计、工单闭环 |
| D1 | `CloudPivot ArrayGuard` | `云枢阵御` | `阵御` | 云枢阵御 · 算力矩阵运维控制台 | 国风品牌、总控驾驶舱、对外宣传物料 |

> 命名选用原则：**单项目只允许一个主名**（默认 A1，且 Web 标签固定为「言语云枢·智能矩阵」）；A2/A3 为同一产品的子模块或后缀变体，不得作为并列产品对外；B/C/D 为不同交付形态的品牌化备选，需报品牌归口确认后启用。

---

## 三、多场景命名映射（A1 主选落地值）

| 场景 | 取值 | 备注 |
| ---- | ---- | ---- |
| Web 浏览器 Title（强制） | `言语云枢·智能矩阵` | `index.html` 与 `useYYC3Head` 统一，页签不追加英文 |
| Web 浏览器 Title（长版 / OG） | `言语云枢·智能矩阵 \| YYC³ PivotMatrix Ops` | 仅用于 `og:title`、分享卡片、文档封面 |
| APP / PWA 中文名 | `言语云枢·智能矩阵` | 桌面图标名、应用商店名 |
| APP 英文名 | `PivotMatrix Ops` | 应用商店英文回退名 |
| 产品对外正式全称 | `言语云枢 · YYC³ PivotMatrix Ops 异构算力矩阵运维面板` | 登录页、版权页、文档封面 |
| 简称（侧边栏 / 导航） | `言语云枢·智能矩阵` | 大屏标题可用 `PivotMatrix` |
| 代码内部标识（常量 / 日志 Tag） | `yyc3-pivotmatrix-ops` | 全小写连字符，禁止上标字符 |
| npm 包名 / 仓库根包 | `yyc3-pivotmatrix-ops-panel` | 与 Git 仓库名一致，ASCII 形式 |
| npm 作用域包名（子包） | `@yyc3/pivotmatrix-ops` | 与品牌 ASCII 规则一致 |
| Git 仓库名 | `YYC3-Pivotmatrix-Ops-Panel` | GitHub 远程已定名 |
| Docker Compose 项目名 | `yyc3-pivotmatrix` | 服务名加后缀如 `yyc3-pivotmatrix-api` |
| K8s Namespace | `yyc3-pivotmatrix` | |
| 生产域名 | `ops.yyc3.top` | `public/CNAME` 为唯一真源 |
| 推荐品牌域名 | `pivotmatrix.yanyucloudcube.com` | 品牌宣传 / 301 跳转 |
| 内网域名 | `pivotmatrix.yyc3.local` | Tailscale / 内网解析 |
| 环境变量前缀 | `PMO_` | 如 `PMO_API_BASE`、`PMO_NODE_TOKEN` |
| 日志文件名 | `yyc3-pivotmatrix-ops.log` | 轮转后缀 `.{date}` |
| 指标 / Prometheus Job | `pivotmatrix_ops` | 采集 Job 与 Grafana Dashboard 前缀 |

---

## 四、品牌标语与 Slogan 体系

### 4.1 家族级标语（沿用，不得改写）

| 序号 | 中文 | 英文 |
| ---- | ---- | ---- |
| 1 | 言启象限 \| 语枢未来 | Words Initiate Quadrants, Language Serves as Core for Future |
| 2 | 万象归元于云枢 \| 深栈智启新纪元 | All things converge in cloud pivot; Deep stacks ignite a new era of intelligence |

### 4.2 产品级 Slogan（本产品专属）

**对外品牌版**

- 中文：**万源汇枢，阵驭算力**
- 英文：**Converge at Pivot, Govern the Matrix**

**运维对内版（告警页、巡检大屏、值班看板）**

- 中文：**矩阵统一管控，算力可视可管**
- 英文：**Unified Matrix Control for Heterogeneous Compute**

> 使用约束：产品级 Slogan 仅出现在登录页副标、大屏顶部、宣传物料；代码注释与文档标头标尾**只允许**使用家族级标语（§4.1）。

---

## 五、前端落地片段

### 5.1 HTML `<head>` 元信息

```html
<title>言语云枢·智能矩阵</title>
<meta name="description" content="言语云枢·智能矩阵（YYC³ PivotMatrix Ops）异构算力矩阵运维面板，统一纳管 Apple M 系列、DGX GPU、NAS 与 BMC 节点，覆盖实时监控、巡检、告警、权限审计与工单运维">
<meta name="keywords" content="言语云枢,智能矩阵,YYC³,PivotMatrix,Ops,算力矩阵,异构运维,DGX,M4 Max,NAS,设备矩阵,运维面板,监控告警,巡检">
<meta name="application-name" content="言语云枢·智能矩阵">
<meta name="apple-mobile-web-app-title" content="言语云枢·智能矩阵">
<meta property="og:site_name" content="言语云枢·智能矩阵">
<meta property="og:title" content="言语云枢·智能矩阵 | YYC³ PivotMatrix Ops">
```

### 5.2 Web App Manifest

```json
{
  "name": "言语云枢·智能矩阵 | YYC³ PivotMatrix Ops",
  "short_name": "言语云枢·智能矩阵",
  "description": "异构算力矩阵统一运维面板 — 监控、巡检、告警、审计、工单闭环",
  "lang": "zh-CN",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#060e1f",
  "background_color": "#060e1f",
  "icons": [
    { "src": "/yyc3-icons/Web App/android-chrome-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/yyc3-icons/Web App/android-chrome-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 5.3 i18n 基础词条

```json
{
  "appName": { "zh": "言语云枢·智能矩阵", "en": "PivotMatrix Ops" },
  "appFullName": {
    "zh": "言语云枢 · YYC³ PivotMatrix Ops 异构算力矩阵运维面板",
    "en": "YYC³ PivotMatrix Ops — Heterogeneous Compute Matrix Operations Panel"
  },
  "appSlogan": {
    "zh": "万源汇枢，阵驭算力",
    "en": "Converge at Pivot, Govern the Matrix"
  },
  "appSloganOps": {
    "zh": "矩阵统一管控，算力可视可管",
    "en": "Unified Matrix Control for Heterogeneous Compute"
  }
}
```

### 5.4 前端常量（TypeScript）

```typescript
// ============================================================
// YYC³（YanYuCloudCube™ · 注册商标）
// 言启象限 | 语枢未来 · Words Initiate Quadrants, Language Serves as Core for Future
// 万象归元于云枢 | 深栈智启新纪元
// All things converge in cloud pivot; Deep stacks ignite a new era of intelligence
// ============================================================
// Copyright (c) 2026 YanYuCloudCube™（YYC³）| admin@0379.email
// ============================================================

export const APP_BRAND = {
  nameZh: '言语云枢·智能矩阵',
  nameEn: 'PivotMatrix Ops',
  fullNameZh: '言语云枢 · YYC³ PivotMatrix Ops 异构算力矩阵运维面板',
  fullNameEn: 'YYC³ PivotMatrix Ops — Heterogeneous Compute Matrix Operations Panel',
  slug: 'yyc3-pivotmatrix-ops',
  repo: 'YYC3-Pivotmatrix-Ops-Panel',
  envPrefix: 'PMO_',
  domain: 'ops.yyc3.top',
  author: 'YYC³ Team',
  email: 'admin@0379.email',
} as const;
```

---

## 六、视觉与图标命名

| 资产 | 命名 | 尺寸 |
| ---- | ---- | ---- |
| README 顶图 | `public/yyc3-matrix.png` | 原始尺寸，不缩放 |
| 应用图标 | `pivotmatrix-192.png` / `pivotmatrix-512.png` | 192 / 512 |
| 品牌 Logo（横版） | `yyc3-pivotmatrix-logo-h.svg` | 矢量 |
| 登录页主视觉 | `pivotmatrix-login-hero.webp` | 2560×1440 |
| 大屏驾驶舱背景 | `pivotmatrix-dashboard-bg.webp` | 3840×2160 |
| 告警卡片标识 | `pivotmatrix-alert-badge.svg` | 矢量 |

- 图标文字统一使用 **言语云枢·智能矩阵**，禁止压入英文长串
- 深色底 + 金属灰主色，与 YYC³ Dynasty 家族视觉一致

---

## 七、命名禁用清单（强制）

1. 禁止使用带序号或后缀的品牌变体：`YanYuCloudCube 02`、`YYC3 v2 面板` 等
2. 禁止在文件、目录、容器、镜像名中使用上标字符 `³`：一律写 `yyc3-` 前缀 ASCII 形式
3. 禁止并列使用 `PivotMatrix Ops` 与 `iMatrixOps` 作为同一系统的两个正式名，对外只暴露主名
4. 禁止把 `OpsPanel` 直接留作面向用户的名词：需中文化为“运维面板 / 运维中心 / 管控台”
5. 禁止浏览器页签 Title 追加英文或副标题：页签固定为 `言语云枢·智能矩阵`（7 个汉字 + 间隔号），英文信息只能进入 `og:title`
6. 禁止在代码标头写产品级 Slogan，代码标头只允许家族级标语（§4.1）
7. 禁止把域名、邮箱、商标主体改写成其它近似写法：固定为 `yyc3.top`（生产入口）、`yanyucloudcube.com`（品牌域名）、`admin@0379.email`、`YanYuCloudCube™（YYC³）`
8. 禁止继续使用历史名 `Cloud Intelli-Matrix` / `CloudPivot-IDeviceMatrix-OpsPanel` 作为对外展示名（仅允许出现在历史归档与变更记录中）

---

## 八、落地检查清单

- [x] 仓库名 `YYC3-Pivotmatrix-Ops-Panel` 已建立，README 首行使用产品正式全称
- [x] `index.html` 的 `<title>` 命中 `言语云枢·智能矩阵`
- [x] `manifest.json` 的 `name` / `short_name` 已填写
- [x] Electron 窗口标题、`useYYC3Head` 动态标题已同步
- [x] `package.json` 的 `name` / `description` / `productName` / `publish.repo` 已同步
- [x] Docker Compose 项目名、K8s Namespace、Prometheus Job 三处命名一致
- [x] 环境变量前缀 `PMO_` 已写入 `.env.example`
- [x] 登录页、版权页、文档封面三处全称一致
- [ ] 全仓库无 `YanYuCloudCube-`、`yanyucloud.com`、`Cloud Intelli-Matrix` 等旧品牌残留（历史归档除外）

---

## 九、校验命令

```bash
# 1. 检查 Web Title 合规
grep -n "<title>" index.html | grep -v "言语云枢·智能矩阵"

# 2. 检查旧品牌残留（应为空）
grep -rn "Cloud Intelli-Matrix\|CloudPivot-IDeviceMatrix\|OpsPanel" \
  --include="*.ts" --include="*.tsx" --include="*.html" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=docs .

# 3. 检查上标字符进入路径（应为空）
find . -name "*³*" -not -path "./node_modules/*"

# 4. 检查品牌常量是否被硬编码绕过
grep -rn "言语云枢" --include="*.tsx" src/ | grep -v "APP_BRAND"
```

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | -------- | ---- |
| v1.0.0 | 2026-11-10 | 由 `YYC3 CloudPivot-IDeviceMatrix-OpsPanel` 收敛定名 `YYC³ PivotMatrix Ops`，新增多场景命名矩阵、品牌标语分层、前端落地片段、禁用清单与校验命令 | YYC³ Team |
| v1.1.0 | 2026-11-10 | Web 标签与 APP 中文名统一为「言语云枢·智能矩阵」，同步 `index.html` / `manifest.json` / Electron 窗口 / `package.json` / i18n；生产域名收敛为 `ops.yyc3.top`；新增历史名禁用条款与 README 顶图命名 | YYC³ Team |

---

<p align="center">
  <b>YYC³</b>（YanYuCloudCube™ · 注册商标）<br>
  言启象限 | 语枢未来<br>
  <i>Words Initiate Quadrants, Language Serves as Core for Future</i><br>
  万象归元于云枢 | 深栈智启新纪元<br>
  <i>All things converge in cloud pivot; Deep stacks ignite a new era of intelligence</i><br>
  <sub>© 2026 YanYuCloudCube™（YYC³）· <a href="mailto:admin@0379.email">admin@0379.email</a></sub>
</p>
