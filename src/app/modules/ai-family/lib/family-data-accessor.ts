/**
 * @file: family-data-accessor.ts
 * @description: 非 React 库服务层 — 为无法使用 hooks 的工具库提供数据访问
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-17
 * @updated: 2026-04-17
 * @status: active
 * @tags: [lib],[service-layer],[ai-family]
 *
 * @brief: 桥接层，让非 React 库（LyricsGenerator、VoiceProfileManager 等）
 *         可以在 App 初始化时注入 store 数据，运行时通过静态方法读取。
 *         接受 UnifiedFamilyMember（store）或 FamilyMember（shared.ts）。
 */

import type { FamilyMember } from "../components/shared";
import { FAMILY_MEMBERS as SHARED_MEMBERS } from "../components/shared";
import type { UnifiedFamilyMember } from "../types";

/**
 * 将 UnifiedFamilyMember 转换为 FamilyMember（shared.ts 旧类型）
 * 非 React 库仍然依赖 FamilyMember 接口
 */
/** 将 UnifiedFamilyMember.status 映射到 FamilyMember 兼容状态 */
function mapStatus(status: string): "online" | "idle" | "speaking" {
  if (status === "online" || status === "speaking") {return status;}
  if (status === "busy") {return "online";}
  return "idle"; // "idle" | "offline" → "idle"
}

function toFamilyMembers(members: UnifiedFamilyMember[]): FamilyMember[] {
  return members.map((m) => ({
    id: m.id,
    name: m.name,
    shortName: m.shortName,
    enTitle: m.enTitle,
    quote: m.quote,
    role: m.role,
    phone: m.phone,
    color: m.color,
    icon: m.icon,
    personality: m.personality.description,
    responsibilities: m.responsibilities,
    coreAbility: m.coreAbility,
    expertise: m.expertise,
    hobbies: m.hobbies,
    greeting: m.greeting,
    careMessage: m.careMessage,
    status: mapStatus(m.status),
    contribution: m.stats.contribution,
    growth: m.stats.growth,
    streak: m.stats.streak,
    mood: m.stats.mood,
  }));
}

type MemberInput = UnifiedFamilyMember[] | FamilyMember[];

/**
 * 非 React 服务层访问器
 */
export class FamilyDataAccessor {
  private static members: FamilyMember[] | null = null;

  /** 初始化：接受 UnifiedFamilyMember[] 或 FamilyMember[] */
  static initialize(members: MemberInput): void {
    if (members.length > 0 && 'stats' in members[0]) {
      // UnifiedFamilyMember[] — 需要转换
      FamilyDataAccessor.members = toFamilyMembers(members as UnifiedFamilyMember[]);
    } else {
      // 已经是 FamilyMember[]（或空数组）
      FamilyDataAccessor.members = members as FamilyMember[];
    }
  }

  /** 获取全部成员（未初始化时回退到 shared.ts） */
  static getMembers(): FamilyMember[] {
    return FamilyDataAccessor.members ?? SHARED_MEMBERS;
  }

  /** 按 ID 获取单个成员 */
  static getMember(id: string): FamilyMember | undefined {
    return FamilyDataAccessor.getMembers().find((m) => m.id === id);
  }

  /** 按索引获取成员 */
  static getMemberByIndex(index: number): FamilyMember | undefined {
    return FamilyDataAccessor.getMembers()[index];
  }

  /** 成员总数 */
  static getMemberCount(): number {
    return FamilyDataAccessor.getMembers().length;
  }

  /** 检查是否已初始化 */
  static isInitialized(): boolean {
    return FamilyDataAccessor.members !== null;
  }

  /** 重置（测试用） */
  static reset(): void {
    FamilyDataAccessor.members = null;
  }
}
