/**
 * @file: colors.ts
 * @description: 设计系统颜色常量快捷导出 — 组件导入入口
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [config],[design-system],[colors]
 *
 * @usage: import { C } from "../../config/colors"; C.primary
 */

// ── 核心语义色 ──
export const C = {
  /** 主色调 #00d4ff — 按钮/链接/焦点 */
  primary: "#00d4ff",
  /** 成功/健康 #00ff88 */
  success: "#00ff88",
  /** 危险/错误 #ff3366 */
  destructive: "#ff3366",
  /** 警告 #ffaa00 */
  warning: "#ffaa00",
  /** 金色/高亮 #ffd700 */
  gold: "#ffd700",
  /** 紫色 #7b2ff7 */
  purple: "#7b2ff7",

  // ── 文本 ──
  /** 主文字 #e0f0ff */
  foreground: "#e0f0ff",
  /** 弱化文字 #6bb8d9 */
  mutedFg: "#6bb8d9",
  /** 背景 #060e1f */
  background: "#060e1f",

  // ── 透明度变体 ──
  /** 边框 rgba(0,180,255,0.2) */
  border: "rgba(0,180,255,0.2)",
  /** 卡片背景 rgba(10,30,60,0.7) */
  card: "rgba(10,30,60,0.7)",
  /** 焦点环 rgba(0,212,255,0.5) */
  ring: "rgba(0,212,255,0.5)",
  /** 次要背景 rgba(0,180,255,0.15) */
  secondary: "rgba(0,180,255,0.15)",
  /** 高亮 rgba(0,200,255,0.1) */
  accent: "rgba(0,200,255,0.1)",
  /** 弱化背景 rgba(0,120,200,0.2) */
  muted: "rgba(0,120,200,0.2)",

  /** 16进制 → rgba 转换 */
  alpha(hex: string, a: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  },
} as const;

export { CHART_COLORS, FAMILY_COLORS } from "./design-system";
