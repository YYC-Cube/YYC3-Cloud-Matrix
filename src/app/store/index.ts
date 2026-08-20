/**
 * @file: index.ts
 * @description: YYC³ Unified Store · Zustand 根 Store + 全部 Slices 统一入口
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-16
 * @status: active
 * @tags: [store],[root]
 *
 * @brief: 全应用唯一状态入口，组合所有 Slice
 *
 * @details:
 * - 每个 Slice 对应原独立 Store 的迁移目标
 * - 组件从此文件导入 useXxxSlice hooks
 * - 未来可在此添加跨 Slice 操作 (thunks / 中间件)
 */

export { useNodeSlice } from './slices/node-slice';
export { useMetricsSlice } from './slices/metrics-slice';
export { useAppSlice } from './slices/app-slice';
export { useLogSlice } from './slices/log-slice';
export { useDbConnSlice } from './slices/db-conn-slice';
export type { PoolConfig } from './slices/db-conn-slice';
export { useUserMgmtSlice } from './slices/user-mgmt-slice';
export { useNetworkSlice } from './slices/network-slice';
export { useFollowUpSlice } from './slices/follow-up-slice';
export { useModelSlice } from './slices/model-slice';
export { useFamilyMemberSlice, useFamilyMessageSlice, useFamilySettingsSlice } from '../modules/ai-family/store';
export { useProviderSlice } from './slices/provider-slice';
export { useAISuggestionSlice } from './slices/ai-suggestion-slice';
export { useIDESettingsSlice } from './slices/ide-settings-slice';
export { useUIPrefsSlice } from './slices/ui-prefs-slice';
export type { AlertThresholds } from './slices/ui-prefs-slice';
export { useOfflineSlice } from './slices/offline-slice';
export { useFSSlice } from './slices/fs-slice';
export { useSDKSessionSlice } from './slices/sdk-session-slice';
export { useSettingsSSOT } from './slices/settings-ssot-slice';
export type { SettingsSSOTSlice, SettingsToggles, SettingsValues, RuntimeConfig } from './slices/settings-ssot-slice';
export type { VoiceProfile, VoiceConversation, FamilyMessage, FamilyUIConfig, MemberModelAssignment, CreatedWork } from '../modules/ai-family/store/family-settings-slice';

export type { NodeData } from '../types';
export type { ModelPerfEntry, ModelDistEntry, RadarEntry } from './slices/metrics-slice';

import { useNodeSlice } from './slices/node-slice';
import { useMetricsSlice } from './slices/metrics-slice';
import { useAppSlice } from './slices/app-slice';
import { useFamilyMemberSlice, useFamilyMessageSlice } from '../modules/ai-family/store';

/**
 * 组合 Hook — 一次性获取多个 Slice 状态（按需使用）
 *
 * 用法：
 * const { nodes, derived, modelPerf, alerts } = useUnifiedStore();
 */
export function useUnifiedStore() {
  const nodeState = useNodeSlice();
  const metricsState = useMetricsSlice();
  const appState = useAppSlice();
  const familyState = useFamilyMemberSlice();
  const messageState = useFamilyMessageSlice();

  return {
    ...nodeState,
    ...metricsState,
    ...appState,
    members: familyState.members,
    messages: messageState.messages,
  };
}
