// ============================================================
// YYC³（YanYuCloudCube™ · 注册商标）
// 言启象限 | 语枢未来 · Words Initiate Quadrants, Language Serves as Core for Future
// 万象归元于云枢 | 深栈智启新纪元
// All things converge in cloud pivot; Deep stacks ignite a new era of intelligence
// ============================================================
// Copyright (c) 2026 YanYuCloudCube™（YYC³）| admin@0379.email
// ============================================================

/**
 * @file: app-brand.ts
 * @description: 品牌常量单一真源（A1 主选命名）— 全端品牌文案统一从此处消费
 * @author: YYC³ Team
 * @version: v1.0.0
 * @created: 2026-11-10
 * @updated: 2026-11-10
 * @status: active
 * @tags: [config],[brand],[ssot]
 *
 * @brief: 落地《YYC3-PivotMatrixOps 项目命名规范》v1.1.0 §5.4 前端常量
 *
 * @details:
 * - 主名：言语云枢·智能矩阵 / YYC³ PivotMatrix Ops（A1 主选，单项目唯一主名）
 * - 产品级 Slogan 仅用于登录页副标、大屏顶部、宣传物料（规范 §4.2 使用约束）
 * - 代码注释与文档标头标尾只允许使用家族级标语（规范 §7.6）
 * - 文件/目录/容器/镜像名禁用上标字符 ³，一律使用 slug 的 ASCII 形式（规范 §7.2）
 *
 * @exports: APP_BRAND
 */

export const APP_BRAND = {
  /** Web 标签 / APP 中文名（页签固定值，不追加英文或副标题） */
  nameZh: "言语云枢·智能矩阵",
  /** APP 英文名（应用商店英文回退名） */
  nameEn: "PivotMatrix Ops",
  /** 产品对外正式全称（登录页、版权页、文档封面） */
  fullNameZh: "言语云枢 · YYC³ PivotMatrix Ops 异构算力矩阵运维面板",
  fullNameEn: "YYC³ PivotMatrix Ops — Heterogeneous Compute Matrix Operations Panel",
  /** 产品级 Slogan · 对外品牌版 */
  sloganZh: "万源汇枢，阵驭算力",
  sloganEn: "Converge at Pivot, Govern the Matrix",
  /** 产品级 Slogan · 运维对内版（告警页、巡检大屏、值班看板） */
  sloganOpsZh: "矩阵统一管控，算力可视可管",
  sloganOpsEn: "Unified Matrix Control for Heterogeneous Compute",
  /** 代码内部标识（常量 / 日志 Tag，全小写连字符） */
  slug: "yyc3-pivotmatrix-ops",
  /** 环境变量前缀 */
  envPrefix: "PMO_",
  /** 生产域名（public/CNAME 为唯一真源，本仓 Pages 部署域） */
  domain: "matrix.yyc3.vip",
  author: "YYC³ Team",
  email: "admin@0379.email",
} as const;

export type AppBrand = typeof APP_BRAND;
