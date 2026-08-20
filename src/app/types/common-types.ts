/**
 * @file: common-types.ts
 * @description: 跨领域基础类型 — 所有 severity 别名的根定义
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[common]
 */

/**
 * RF-005: 统一基础严重级别类型
 * 所有模块的 severity 类型应基于此定义，确保跨模块类型兼容
 * 注意: PatternSeverity (low/medium/high/critical) 语义不同，保持独立
 */
export type BaseSeverity = "info" | "warning" | "error" | "critical";
