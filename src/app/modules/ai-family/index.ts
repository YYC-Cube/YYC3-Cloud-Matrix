/**
 * @file: index.ts
 * @description: AI Family 模块入口 — 统一导出所有公共 API
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-07-25
 * @updated: 2026-07-25
 * @status: active
 * @tags: [module],[ai-family],[barrel]
 *
 * @brief: AI Family 独立功能模块
 *
 * @details:
 * - 8 位 AI 家人体系
 * - 家庭聊天、通讯、音乐、娱乐
 * - 家人成长、勋章、记忆系统
 * - 模型绑定、语音配置
 */

// 路由
export { aiFamilyRoutes } from './routes';

// 组件
export { AIFamilyRouter } from './components/AIFamilyRouter';
export { AIFamilyPage } from './AIFamilyPage';

// Store
export {
  useFamilyMemberSlice,
  useFamilyMessageSlice,
  useFamilySettingsSlice,
  useFamilySkillsSlice,
  useFamilyMemoriesSlice,
  useFamilyCallLogSlice,
  useFamilyMilestonesSlice,
  useFamilyMedalsSlice,
  useFamilyPostsSlice,
  useFamilyMomentsSlice,
  useFamilyNewsSlice,
  useFamilyChatSlice,
  useFamilyActivitiesSlice,
} from './store';

// Types
export type {
  MemberPresenceStatus,
  MemberPersonality,
  MemberStats,
  MemberModelBinding,
  MemberVoiceProfile,
  FamilyMemberId,
  UnifiedFamilyMember,
  MessageContentType,
  MessagePriority,
  MessageDeliveryStatus,
  UnifiedFamilyMessage,
  FamilyConversation,
} from './types';

// Shared data
export {
  FAMILY_MEMBERS,
  MEMBERS_MAP,
  getMember,
  refreshFromStore,
  getMembersMap,
  getGreeting,
  getHourlyCare,
  generateDailyBroadcast,
  getFamilyDataSummary,
  getTodayReporter,
  NEON_CYAN,
  NEON_PINK,
  DEEP_BG,
} from './components/shared';
export type {
  FamilyMember,
  Medal,
  DailyBroadcast,
  BroadcastSegment,
  FamilyActivity,
  GrowthMemory,
  VoiceProfile,
  MemberModelAssignment,
  FamilyMessage,
  FamilyDataSummary,
} from './components/shared';