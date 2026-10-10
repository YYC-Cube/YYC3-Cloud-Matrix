/**
 * @file: family-settings-slice.ts
 * @description: YYC³ AI-Family Settings Slice · 统一实现转发入口
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-10-10
 * @updated: 2026-10-10
 * @status: active
 * @tags: [store],[slice],[family]
 *
 * @brief: components/ai-family 组件的固定消费入口
 *
 * @details:
 * - 唯一实现位于 modules/ai-family/store/family-settings-slice.ts
 *   (zustand + persist, localStorage key: yyc3-family-settings)
 * - store/index.ts 已通过 modules/ai-family/store 注册该 store,
 *   此文件仅将其挂载到 store/slices 命名空间, 保持单一状态源
 */

export {
  useFamilySettingsSlice,
  migrateLegacyUIConfig,
} from '../../modules/ai-family/store/family-settings-slice';

export type {
  VoiceProfile,
  VoiceConversation,
  FamilyMessage,
  FamilyUIConfig,
  MemberModelAssignment,
  CreatedWork,
} from '../../modules/ai-family/store/family-settings-slice';
