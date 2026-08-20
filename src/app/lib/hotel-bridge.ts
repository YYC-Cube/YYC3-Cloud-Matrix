/**
 * @file: hotel-bridge.ts
 * @description: YYC³ Hotel-Family 桥接层 — 将酒店角色映射到8位AI家人
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[ai-family],[hotel],[bridge]
 *
 * @brief: 动态将 UnifiedFamilyMember 映射为酒店业务角色，消除独立 staff 列表
 */

import type { UnifiedFamilyMember, MemberPresenceStatus } from '../types';

// ============================================================
//  酒店-家人角色映射
// ============================================================

/** 家人 ID → 酒店业务角色 */
export const FAMILY_TO_HOTEL_ROLE: Record<string, string> = {
  "navigator":   "front-desk",         // 聆听 → 前台接待
  "thinker":     "finance",            // 分析 → 财务管理
  "prophet":     "sales",              // 预见 → 销售预测
  "bolero":      "guest-relations",    // 推荐 → 客户关系
  "meta-oracle": "manager",            // 指挥 → 酒店经理
  "sentinel":    "security",           // 守护 → 安全保卫
  "master":      "it-support",         // 代码 → IT支持
  "creative":    "event-coordinator",  // 创意 → 活动协调
};

/** 酒店角色中文标签 */
export const HOTEL_ROLE_LABELS: Record<string, string> = {
  "front-desk": "前台接待",
  "finance": "财务管理",
  "sales": "销售预测",
  "guest-relations": "客户关系",
  "manager": "酒店经理",
  "security": "安全保卫",
  "it-support": "IT支持",
  "event-coordinator": "活动协调",
};

/** 酒店角色对应技能标签 */
export const HOTEL_ROLE_SKILLS: Record<string, string[]> = {
  "front-desk": ["check-in-out", "reservation-management", "guest-inquiry", "multilingual"],
  "finance": ["data-analysis", "report-generation", "revenue-optimization"],
  "sales": ["upselling", "local-recommendations", "data-analysis"],
  "guest-relations": ["complaint-handling", "vip-treatment", "guest-inquiry"],
  "manager": ["crisis-management", "inventory-management", "report-generation", "social-media"],
  "security": ["security-protocols", "crisis-management"],
  "it-support": ["technical-support", "code-generation", "code-analysis"],
  "event-coordinator": ["event-planning", "creative-writing", "creative-writing", "video-generation"],
};

// ============================================================
//  状态映射
// ============================================================

/**
 * 将 MemberPresenceStatus 映射为酒店 StaffStatus
 * 解决原有 bug："available" 永远匹配不到 "online"
 */
export function toHotelStatus(status: MemberPresenceStatus): string {
  const mapping: Record<MemberPresenceStatus, string> = {
    "online": "available",
    "idle": "on-break",
    "busy": "busy",
    "speaking": "busy",
    "offline": "off-duty",
  };
  return mapping[status] || "off-duty";
}

/**
 * 将酒店 StaffStatus 映射回 MemberPresenceStatus（用于 UI 显示）
 */
export function fromHotelStatus(hotelStatus: string): MemberPresenceStatus {
  const mapping: Record<string, MemberPresenceStatus> = {
    "available": "online",
    "busy": "busy",
    "on-break": "idle",
    "off-duty": "offline",
    "training": "idle",
    "meeting": "busy",
  };
  return mapping[hotelStatus] || "offline";
}

// ============================================================
//  核心转换函数
// ============================================================

/** 酒店展示用的成员卡片数据 */
export interface HotelStaffCard {
  memberId: string;
  name: string;
  shortName: string;
  color: string;
  hotelRole: string;
  hotelRoleLabel: string;
  skills: string[];
  status: MemberPresenceStatus;          // 统一状态（UI 显示用）
  satisfactionScore: number;             // 从 contribution 换算
  interactionCount: number;              // 从 stats.contribution 取
  personality: string;                   // personality.description
  primaryModel: string;                  // modelAssignment.modelId
}

/**
 * 将 UnifiedFamilyMember 转换为酒店展示数据
 */
export function toHotelStaffCard(member: UnifiedFamilyMember): HotelStaffCard {
  const hotelRole = FAMILY_TO_HOTEL_ROLE[member.id] || "front-desk";

  return {
    memberId: member.id,
    name: member.name,
    shortName: member.shortName,
    color: member.color,
    hotelRole,
    hotelRoleLabel: HOTEL_ROLE_LABELS[hotelRole] || hotelRole,
    skills: HOTEL_ROLE_SKILLS[hotelRole] || [],
    status: member.status,
    satisfactionScore: Math.min(100, Math.round(member.stats.contribution / 12)),
    interactionCount: member.stats.contribution,
    personality: member.personality.description,
    primaryModel: member.modelAssignment.modelId,
  };
}

/**
 * 批量转换 — 生成酒店团队展示数据
 */
export function toHotelStaffCards(members: UnifiedFamilyMember[]): HotelStaffCard[] {
  return members.map(toHotelStaffCard);
}
