/**
 * @file: followup-types.ts
 * @description: 一键跟进系统类型 — 跟进卡片 + 操作链路 + 快速操作
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[followup]
 */

import type { BaseSeverity } from "./common-types";

/** 告警 / 异常严重级别 — RF-005: BaseSeverity 别名 */
export type FollowUpSeverity = BaseSeverity;

/** 告警状态 */
export type FollowUpStatus = "active" | "investigating" | "resolved" | "ignored";

/** 操作链路条目类型 */
export type ChainEventType =
  | "model_load"
  | "task_start"
  | "alert_trigger"
  | "auto_action"
  | "manual_action"
  | "resolved"
  | "system_event";

/** 操作链路单条事件 */
export interface ChainEvent {
  id: string;
  time: string;           // HH:mm:ss
  type: ChainEventType;
  label: string;
  detail: string;
  isCurrent?: boolean;
}

/** 跟进卡片数据 */
export interface FollowUpItem {
  id: string;
  severity: FollowUpSeverity;
  title: string;
  source: string;
  metric?: string;
  status: FollowUpStatus;
  timestamp: number;
  chain: ChainEvent[];
  relatedAlerts?: string[];
  assignee?: string;
  tags?: string[];
}

/** 快速操作定义 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  variant: "default" | "primary" | "warning" | "danger" | "success";
  action: () => void;
}
