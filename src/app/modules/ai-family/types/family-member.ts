/**
 * @file: family-member.ts
 * @description: YYC³ AI Family 统一成员模型 — 全应用唯一规范定义
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [types],[ai-family],[unified]
 *
 * @brief: 8位AI家人的统一数据模型，合并 shared.ts / ai-family.types.ts / ai-family-hotel.types.ts
 *
 * @details:
 * - 此文件是 FamilyMember 的唯一规范定义（SSOT）
 * - 所有子系统（酒店/通讯/数据/模型）都通过此模型运转
 * - 8位家人 ID: navigator | thinker | prophet | bolero | meta-oracle | sentinel | master | creative
 */

import type React from "react";

// ============================================================
//  统一状态枚举
// ============================================================

/** 成员在线状态 — 合并三方状态枚举 */
export type MemberPresenceStatus =
  | "online"
  | "idle"
  | "busy"
  | "speaking"
  | "offline";

// ============================================================
//  结构化子类型
// ============================================================

/** 性格特征 — 合并 hotel 的 8 维 PersonalityTraits + 原字符串描述 */
export interface MemberPersonality {
  description: string;       // 原 personality 字符串描述
  friendliness: number;      // 0-10 友好度
  professionalism: number;   // 0-10 专业性
  patience: number;          // 0-10 耐心程度
  creativity: number;        // 0-10 创造力
  efficiency: number;        // 0-10 效率
  empathy: number;           // 0-10 同理心
  humor: number;             // 0-10 幽默感
  formality: number;         // 0-10 正式程度
}

/** 成员统计 */
export interface MemberStats {
  contribution: number;      // 贡献分
  growth: number;            // 成长值
  streak: number;            // 连续在线天数
  mood: string;              // 当前心情标识
}

/** 模型绑定 */
export interface MemberModelBinding {
  providerId: string;        // e.g. "zhipu", "deepseek", "openai"
  modelId: string;           // e.g. "glm-4.5", "deepseek-chat"
  purpose: string;           // 用途描述
}

/** 语音配置 */
export interface MemberVoiceProfile {
  pitch: number;             // 0.5 - 2.0
  rate: number;              // 0.5 - 2.0
  volume: number;            // 0 - 1
  lang: string;              // zh-CN | en-US
  voiceName?: string;        // 浏览器 SpeechSynthesis voice name
}

// ============================================================
//  统一成员模型
// ============================================================

/**
 * UnifiedFamilyMember — 全应用唯一家人数据模型
 *
 * 合并自:
 * - shared.ts FamilyMember (UI层)
 * - ai-family.types.ts AIFamilyMember (平台层)
 * - ai-family-hotel.types.ts HotelStaffMember (业务层)
 */
export interface UnifiedFamilyMember {
  // ── 身份标识 ──
  id: string;                        // "navigator"|"thinker"|...|"creative"
  name: string;                      // "言启·千行"
  shortName: string;                 // "千行"
  enTitle: string;                   // "Navigator"
  quote: string;                     // 座右铭
  phone: string;                     // "YYC3-1001"
  color: string;                     // 主题色
  icon: React.ElementType;           // Lucide icon 组件

  // ── 性格（结构化） ──
  personality: MemberPersonality;

  // ── 角色能力 ──
  role: string;                      // 角色描述
  responsibilities: string[];        // 职责列表
  coreAbility: string;               // 核心能力描述
  expertise: string[];               // 专业技能
  hobbies: string[];                 // 兴趣爱好

  // ── 通讯 ──
  greeting: string;                  // 接听电话问候语
  careMessage: string;               // 整点关爱播报

  // ── 状态 ──
  status: MemberPresenceStatus;

  // ── 模型绑定 ──
  modelAssignment: MemberModelBinding;

  // ── 语音配置 ──
  voiceProfile: MemberVoiceProfile;

  // ── 统计数据 ──
  stats: MemberStats;

  // ── 勋章 ──
  medals: string[];                  // medal id 列表

  // ── 业务角色映射（可选） ──
  businessRole?: string;             // 酒店等业务子系统角色标识
}

// ============================================================
//  成员 ID 字面量联合类型
// ============================================================

export type FamilyMemberId =
  | "navigator"
  | "thinker"
  | "prophet"
  | "bolero"
  | "meta-oracle"
  | "sentinel"
  | "master"
  | "creative";
