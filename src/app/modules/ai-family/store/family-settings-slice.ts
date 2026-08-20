/**
 * @file: family-settings-slice.ts
 * @description: YYC³ AI-Family Settings Slice · 统一管理 7 个 localStorage 键
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-17
 * @updated: 2026-04-17
 * @status: active
 * @tags: [store],[slice],[family]
 *
 * @brief: AI-Family 组件设置统一 Zustand Store
 *
 * @details:
 * - 替代分散在 5 个组件中的独立 localStorage 读/写
 * - 7 个数据域: voiceProfiles, voiceConversations, commMessages,
 *   uiConfig, modelAssignments, providerKeys, musicWorks
 * - 2 个幻影键 (diagnostics, activities) 保留为空数组供导出兼容
 * - persist middleware 自动同步 localStorage
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================================
// 类型定义
// ============================================================

export interface VoiceProfile {
  memberId: string;
  pitch: number;
  rate: number;
  volume: number;
  lang: string;
  voiceName?: string;
}

export interface VoiceConversation {
  id: string;
  memberId: string;
  userText: string;
  aiText: string;
  timestamp: string;
}

export interface FamilyMessage {
  id: string;
  from: string;
  to: string | 'all';
  content: string;
  timestamp: string;
  type: 'text' | 'announcement' | 'alert' | 'heartbeat';
  read: boolean;
}

export interface FamilyUIConfig {
  animationSpeed: 'fast' | 'normal' | 'slow' | 'none';
  infoDensity: 'compact' | 'normal' | 'expanded';
  showOfflineMembers: boolean;
  memberOrder: string[];
  defaultExpandCards: boolean;
  notificationsEnabled: boolean;
  hourlyCareEnabled: boolean;
  dailyBroadcastEnabled: boolean;
  soundEnabled: boolean;
  autoMarkRead: boolean;
  messageRetentionDays: number;
  locale: 'zh-CN' | 'en-US';
}

export interface MemberModelAssignment {
  memberId: string;
  providerId: string;
  modelId: string;
  purpose: string;
}

export interface CreatedWork {
  id: string;
  title: string;
  theme: string;
  lyrics: string[];
  createdAt: number;
  mode: string;
  audioUrl?: string;
}

// ============================================================
// 默认值
// ============================================================

const DEFAULT_UI_CONFIG: FamilyUIConfig = {
  animationSpeed: 'normal',
  infoDensity: 'normal',
  showOfflineMembers: true,
  memberOrder: ["navigator", "thinker", "prophet", "bolero", "meta-oracle", "sentinel", "master", "creative"],
  defaultExpandCards: false,
  notificationsEnabled: true,
  hourlyCareEnabled: true,
  dailyBroadcastEnabled: true,
  soundEnabled: true,
  autoMarkRead: false,
  messageRetentionDays: 30,
  locale: 'zh-CN',
};

const DEFAULT_MODEL_ASSIGNMENTS: MemberModelAssignment[] = [
  { memberId: "navigator", providerId: "zhipu", modelId: "glm-4-plus", purpose: "语义理解与意图识别" },
  { memberId: "thinker", providerId: "deepseek", modelId: "deepseek-chat", purpose: "深度数据分析与洞察" },
  { memberId: "prophet", providerId: "deepseek", modelId: "deepseek-reasoner", purpose: "趋势预测与异常检测" },
  { memberId: "bolero", providerId: "zhipu", modelId: "glm-4-air", purpose: "用户画像与推荐" },
  { memberId: "meta-oracle", providerId: "deepseek", modelId: "deepseek-chat", purpose: "全局调度与决策优化" },
  { memberId: "sentinel", providerId: "deepseek", modelId: "deepseek-reasoner", purpose: "安全分析与威胁检测" },
  { memberId: "master", providerId: "ollama", modelId: "codegeex4:latest", purpose: "代码审查与架构分析" },
  { memberId: "creative", providerId: "zhipu", modelId: "glm-4v-plus", purpose: "多模态创意生成" },
];

// ============================================================
// Slice Interface
// ============================================================

interface FamilySettingsSlice {
  // 数据域
  voiceProfiles: VoiceProfile[];
  voiceConversations: VoiceConversation[];
  commMessages: FamilyMessage[];
  uiConfig: FamilyUIConfig;
  modelAssignments: MemberModelAssignment[];
  providerKeys: Record<string, string>;
  musicWorks: CreatedWork[];

  // VoiceProfiles 操作
  setVoiceProfiles: (profiles: VoiceProfile[]) => void;
  updateVoiceProfile: (memberId: string, updates: Partial<VoiceProfile>) => void;

  // VoiceConversations 操作
  setVoiceConversations: (convs: VoiceConversation[]) => void;
  addVoiceConversation: (conv: VoiceConversation) => void;
  clearVoiceConversations: () => void;

  // CommMessages 操作
  setCommMessages: (messages: FamilyMessage[]) => void;
  addCommMessage: (msg: FamilyMessage) => void;
  markMessageRead: (id: string) => void;
  deleteCommMessage: (id: string) => void;
  clearCommMessages: () => void;
  markAllMessagesRead: () => void;

  // UIConfig 操作
  setUIConfig: (config: Partial<FamilyUIConfig>) => void;
  resetUIConfig: () => void;

  // ModelAssignments 操作
  setModelAssignments: (assignments: MemberModelAssignment[]) => void;
  updateModelAssignment: (memberId: string, updates: Partial<MemberModelAssignment>) => void;

  // ProviderKeys 操作
  setProviderKeys: (keys: Record<string, string>) => void;
  updateProviderKey: (providerId: string, apiKey: string) => void;
  removeProviderKey: (providerId: string) => void;

  // MusicWorks 操作
  addMusicWork: (work: CreatedWork) => void;
  removeMusicWork: (id: string) => void;

  // 批量操作
  clearAllFamilyData: () => void;
  exportAllData: () => string;
  importAllData: (json: string) => boolean;
  getStorageStats: () => { totalSize: number; items: { key: string; size: number }[] };
}

// ============================================================
// Store
// ============================================================

export const useFamilySettingsSlice = create<FamilySettingsSlice>()(
  persist(
    (set, get) => ({
      // 初始值
      voiceProfiles: [],
      voiceConversations: [],
      commMessages: [],
      uiConfig: DEFAULT_UI_CONFIG,
      modelAssignments: DEFAULT_MODEL_ASSIGNMENTS.map(a => ({ ...a })),
      providerKeys: {},
      musicWorks: [],

      // VoiceProfiles
      setVoiceProfiles: (profiles) => set({ voiceProfiles: profiles }),
      updateVoiceProfile: (memberId, updates) =>
        set((s) => ({
          voiceProfiles: s.voiceProfiles.map((p) =>
            p.memberId === memberId ? { ...p, ...updates } : p
          ),
        })),

      // VoiceConversations (cap at 100)
      setVoiceConversations: (convs) => set({ voiceConversations: convs }),
      addVoiceConversation: (conv) =>
        set((s) => ({
          voiceConversations: [...s.voiceConversations, conv].slice(-100),
        })),
      clearVoiceConversations: () => set({ voiceConversations: [] }),

      // CommMessages (cap at 500)
      setCommMessages: (messages) => set({ commMessages: messages }),
      addCommMessage: (msg) =>
        set((s) => ({
          commMessages: [...s.commMessages, msg].slice(-500),
        })),
      markMessageRead: (id) =>
        set((s) => ({
          commMessages: s.commMessages.map((m) =>
            m.id === id ? { ...m, read: true } : m
          ),
        })),
      deleteCommMessage: (id) =>
        set((s) => ({
          commMessages: s.commMessages.filter((m) => m.id !== id),
        })),
      clearCommMessages: () => set({ commMessages: [] }),
      markAllMessagesRead: () =>
        set((s) => ({
          commMessages: s.commMessages.map((m) => ({ ...m, read: true })),
        })),

      // UIConfig
      setUIConfig: (config) =>
        set((s) => ({ uiConfig: { ...s.uiConfig, ...config } })),
      resetUIConfig: () => set({ uiConfig: DEFAULT_UI_CONFIG }),

      // ModelAssignments
      setModelAssignments: (assignments) => set({ modelAssignments: assignments }),
      updateModelAssignment: (memberId, updates) =>
        set((s) => ({
          modelAssignments: s.modelAssignments.map((a) =>
            a.memberId === memberId ? { ...a, ...updates } : a
          ),
        })),

      // ProviderKeys
      setProviderKeys: (keys) => set({ providerKeys: keys }),
      updateProviderKey: (providerId, apiKey) =>
        set((s) => ({
          providerKeys: { ...s.providerKeys, [providerId]: apiKey },
        })),
      removeProviderKey: (providerId) =>
        set((s) => {
          const { [providerId]: _, ...rest } = s.providerKeys;
          return { providerKeys: rest };
        }),

      // MusicWorks (cap at 50)
      addMusicWork: (work) =>
        set((s) => ({
          musicWorks: [work, ...s.musicWorks].slice(0, 50),
        })),
      removeMusicWork: (id) =>
        set((s) => ({
          musicWorks: s.musicWorks.filter((w) => w.id !== id),
        })),

      // 批量操作
      clearAllFamilyData: () =>
        set({
          voiceProfiles: [],
          voiceConversations: [],
          commMessages: [],
          uiConfig: DEFAULT_UI_CONFIG,
          modelAssignments: [],
          providerKeys: {},
          musicWorks: [],
        }),

      exportAllData: () => {
        const s = get();
        return JSON.stringify({
          _exportedAt: new Date().toISOString(),
          _version: 1,
          voiceProfiles: s.voiceProfiles,
          voiceConversations: s.voiceConversations,
          commMessages: s.commMessages,
          uiConfig: s.uiConfig,
          modelAssignments: s.modelAssignments,
          providerKeys: s.providerKeys,
          musicWorks: s.musicWorks,
        }, null, 2);
      },

      importAllData: (json) => {
        try {
          const parsed = JSON.parse(json);

          // v2.0 envelope format: { data: { "yyc3-family-xxx": value }, version: "2.0" }
          let data: Record<string, unknown>;
          if (parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)) {
            const d = parsed.data as Record<string, unknown>;
            // Map legacy key names to internal fields
            data = {
              voiceProfiles: d['yyc3-family-voice-profiles'] ?? d.voiceProfiles,
              voiceConversations: d['yyc3-family-voice-conversations'] ?? d.voiceConversations,
              commMessages: d['yyc3-family-comm-messages'] ?? d.commMessages,
              uiConfig: d['yyc3-family-ui-config'] ?? d.uiConfig,
              modelAssignments: d['yyc3-family-model-assignments'] ?? d.modelAssignments,
              providerKeys: d['yyc3-family-provider-keys'] ?? d.providerKeys,
              musicWorks: d['yyc3-family-music-works'] ?? d.musicWorks,
            };
          } else {
            data = parsed;
          }

          set({
            voiceProfiles: Array.isArray(data.voiceProfiles) ? data.voiceProfiles : [],
            voiceConversations: Array.isArray(data.voiceConversations) ? data.voiceConversations : [],
            commMessages: Array.isArray(data.commMessages) ? data.commMessages : [],
            uiConfig: { ...DEFAULT_UI_CONFIG, ...(data.uiConfig && typeof data.uiConfig === 'object' ? data.uiConfig as Partial<FamilyUIConfig> : {}) },
            modelAssignments: Array.isArray(data.modelAssignments) ? data.modelAssignments : [],
            providerKeys: data.providerKeys && typeof data.providerKeys === 'object' ? data.providerKeys as Record<string, string> : {},
            musicWorks: Array.isArray(data.musicWorks) ? data.musicWorks : [],
          });
          return true;
        } catch {
          return false;
        }
      },

      getStorageStats: () => {
        try {
          const raw = localStorage.getItem('yyc3-family-settings');
          if (!raw) { return { totalSize: 0, items: [] }; }
          const totalSize = new Blob([raw]).size;
          const parsed = JSON.parse(raw);
          const fieldToKey: Record<string, string> = {
            commMessages: 'yyc3-family-comm-messages',
            voiceProfiles: 'yyc3-family-voice-profiles',
            voiceConversations: 'yyc3-family-voice-conversations',
            modelAssignments: 'yyc3-family-model-assignments',
            providerKeys: 'yyc3-family-provider-keys',
            uiConfig: 'yyc3-family-ui-config',
            musicWorks: 'd-music-works',
          };
          const items: { key: string; size: number }[] = [];
          for (const [field, displayKey] of Object.entries(fieldToKey)) {
            const value = parsed[field];
            if (value !== undefined) {
              items.push({ key: displayKey, size: new Blob([JSON.stringify(value)]).size });
            }
          }
          return { totalSize, items };
        } catch {
          return { totalSize: 0, items: [] };
        }
      },
    }),
    {
      name: 'yyc3-family-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Legacy Migration Helper
// ============================================================

export function migrateLegacyUIConfig(): boolean {
  try {
    const raw = localStorage.getItem('yyc3-family-ui-config');
    if (!raw) { return false; }
    const parsed = JSON.parse(raw);
    useFamilySettingsSlice.getState().setUIConfig({ ...DEFAULT_UI_CONFIG, ...parsed });
    localStorage.removeItem('yyc3-family-ui-config');
    return true;
  } catch {
    return false;
  }
}
