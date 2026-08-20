/**
 * @file: design-system-types.ts
 * @description: 设计系统类型 — 色彩 / 排版 / 间距 / 阴影 / 动效 / 组件注册
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[design-system]
 */

import type { ElementType } from "react";

/** 色彩 Token */
export interface ColorToken {
  name: string;
  value: string;
  cssVar: string;
  usage: string;
}

/** 字体排版 Token */
export interface TypographyToken {
  name: string;
  family: string;
  weight: string;
  size: string;
  usage: string;
  sample: string;
}

/** 间距 Token */
export interface SpacingToken {
  name: string;
  value: string;
  px: number;
  usage: string;
}

/** 阴影 Token */
export interface ShadowToken {
  name: string;
  value: string;
  usage: string;
}

/** 动效 Token */
export interface AnimationToken {
  name: string;
  duration: string;
  easing: string;
  usage: string;
}

/** 状态定义 */
export interface StatusDef {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  icon: ElementType;
  description: string;
}

/** 组件注册表条目 */
export interface ComponentEntry {
  name: string;
  tier: "atom" | "molecule" | "organism" | "template";
  path: string;
  description: string;
  props: string[];
  states: string[];
  responsive: boolean;
}

/** 交互规范 */
export interface InteractionSpec {
  name: string;
  trigger: string;
  duration: string;
  effect: string;
  feedback: string;
}

/** 阶段审核状态 */
export type ChapterStatus = "completed" | "partial" | "pending" | "deferred";

/** 章节审核 */
export interface ChapterReview {
  chapter: number;
  title: string;
  status: ChapterStatus;
  progress: number;
  deliverables: string[];
  notes: string;
}

/** 项目统计 */
export interface ProjectStats {
  label: string;
  value: string | number;
  color: string;
}

/** 验收清单项 */
export interface AcceptanceItem {
  category: string;
  items: { label: string; passed: boolean }[];
}
