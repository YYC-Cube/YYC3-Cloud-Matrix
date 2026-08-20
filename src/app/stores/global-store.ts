/**
 * @file: global-store.ts
 * @description: YYC³ Global Store — Config + Chat 自有数据域
 * @author: YanYuCloudCube Team
 * @version: v4.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-17
 * @status: active
 * @tags: [module]
 *
 * Phase Q: 移除 theme/locale/sidebarCollapsed（僵尸数据，0 渲染消费者）
 * v4 migration: strip theme/locale/sidebarCollapsed from persisted state
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type {
  ChatSession,
  FollowUpItem,
  FollowUpRecord,
  FollowUpSeverity,
  FollowUpStatus,
} from '../types';

// ============================================================
// 数据域定义（仅自有数据）
// ============================================================

interface ConfigDomain {
  autoRefresh: boolean;
  refreshInterval: number;
  enableNotifications: boolean;
  enableSounds: boolean;
  compactMode: boolean;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  setEnableNotifications: (enabled: boolean) => void;
  setEnableSounds: (enabled: boolean) => void;
  setCompactMode: (enabled: boolean) => void;
  resetConfig: () => void;
}

interface ChatDomain {
  sessions: ChatSession[];
  activeSessionId: string | null;
  setSessions: (sessions: ChatSession[]) => void;
  addSession: (session: ChatSession) => void;
  updateSession: (id: string, updates: Partial<ChatSession>) => void;
  removeSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
}

// ============================================================
// 默认值
// ============================================================

const DEFAULT_CONFIG = {
  autoRefresh: true,
  refreshInterval: 5000,
  enableNotifications: true,
  enableSounds: false,
  compactMode: false,
};

// ============================================================
// Global Store — 自有数据域 (Config/Chat)
// ============================================================

interface GlobalStore extends ConfigDomain, ChatDomain {
  _version: number;
  _lastSync: string | null;
  _migrate: () => void;
}

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set, get) => ({
      _version: 4,
      _lastSync: null,

      // 配置域
      ...DEFAULT_CONFIG,
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      setEnableNotifications: (enableNotifications) => set({ enableNotifications }),
      setEnableSounds: (enableSounds) => set({ enableSounds }),
      setCompactMode: (compactMode) => set({ compactMode }),
      resetConfig: () => set(DEFAULT_CONFIG),

      // 会话域
      sessions: [],
      activeSessionId: null,
      setSessions: (sessions) => set({ sessions }),
      addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
      updateSession: (id, updates) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === id ? { ...s, ...updates } : s),
      })),
      removeSession: (id) => set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
      })),
      setActiveSession: (activeSessionId) => set({ activeSessionId }),

      // 迁移函数
      _migrate: () => {
        const state = get();
        if (state._version < 4) {
          console.info('[GlobalStore] Migrating to version 4...');
          set({ _version: 4 });
        }
      },
    }),
    {
      name: 'yyc3-global-store',
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: (persisted, version) => {
        const p = persisted as Record<string, unknown>;
        if (version < 2) {
          delete p.connections;
          delete p.activeConnectionId;
          delete p.followUps;
        }
        if (version < 3) {
          delete p.providers;
          delete p.configuredModels;
          delete p.activeModelId;
        }
        if (version < 4) {
          // v3 → v4: 移除僵尸 theme/locale/sidebarCollapsed
          delete p.theme;
          delete p.locale;
          delete p.sidebarCollapsed;
        }
        return persisted as GlobalStore;
      },
    }
  )
);

// ============================================================
// 选择器 Hooks — 自有域
// ============================================================

export const useChat = () => useGlobalStore(useShallow((state) => ({
  sessions: state.sessions,
  activeSessionId: state.activeSessionId,
  setSessions: state.setSessions,
  addSession: state.addSession,
  updateSession: state.updateSession,
  removeSession: state.removeSession,
  setActiveSession: state.setActiveSession,
})));

// ============================================================
// 聚合选择器 — 从 Slice 读取
// ============================================================

import { useDbConnSlice } from '../store/slices/db-conn-slice';
import { useFollowUpSlice } from '../store/slices/follow-up-slice';

/** 从 follow-up-slice 聚合读取告警数据 + 暴露操作方法 */
export const useAlerts = () => {
  const slice = useFollowUpSlice(useShallow((s) => ({
    followUps: s.followUps,
    addFollowUp: s.addFollowUp,
    updateFollowUp: s.updateFollowUp,
    removeFollowUp: s.removeFollowUp,
  })));

  const items: FollowUpItem[] = slice.followUps.map((fu) => ({
    id: fu.id,
    title: fu.taskName,
    severity: (fu.priority === "critical" ? "critical" : fu.priority === "high" ? "error" : "warning") as FollowUpSeverity,
    status: (fu.status === "completed" ? "resolved" : fu.status === "cancelled" ? "ignored" : "active") as FollowUpStatus,
    source: fu.category,
    timestamp: fu.createdAt,
    chain: [],
    assignee: fu.assigneeName,
  }));

  return {
    followUps: items,
    addFollowUp: (item: FollowUpItem) => {
      slice.addFollowUp({
        taskId: item.id,
        taskName: item.title,
        assigneeName: item.assignee ?? "",
        priority: item.severity === "critical" ? "critical" : item.severity === "error" ? "high" : "medium",
        status: "pending",
        dueDate: Date.now() + 86400000,
        notes: "",
        category: "maintenance",
        assignee: "",
        updatedAt: Date.now(),
      });
    },
    updateFollowUp: (id: string, updates: Partial<FollowUpItem>) => {
      const mapped: Partial<FollowUpRecord> = { updatedAt: Date.now() };
      if (updates.status) {
        mapped.status = ({
          active: "pending",
          investigating: "in_progress",
          resolved: "completed",
          ignored: "cancelled",
        } as Record<string, FollowUpRecord["status"]>)[updates.status] ?? "pending";
      }
      if (updates.severity) {
        mapped.priority = ({
          critical: "critical",
          error: "high",
          warning: "medium",
        } as Record<string, FollowUpRecord["priority"]>)[updates.severity] ?? "medium";
      }
      if (updates.title) { mapped.taskName = updates.title; }
      if (updates.assignee) { mapped.assigneeName = updates.assignee; }
      slice.updateFollowUp(id, mapped);
    },
    removeFollowUp: slice.removeFollowUp,
    clearFollowUps: () => {
      slice.followUps.forEach((fu) => slice.removeFollowUp(fu.id));
    },
  };
};

/** 从 db-conn-slice 聚合读取数据库连接数据 */
export const useDatabase = () => {
  const connections = useDbConnSlice((state) => state.connections);
  return { connections };
};

// ============================================================
// 数据导出/导入（含 provider-slice 数据）
// ============================================================

import { useProviderSlice } from '../store/slices/provider-slice';

export function exportStoreData(): string {
  const state = useGlobalStore.getState();
  const providerState = useProviderSlice.getState();
  return JSON.stringify({
    _exportedAt: new Date().toISOString(),
    _version: state._version,
    config: {
      autoRefresh: state.autoRefresh,
      refreshInterval: state.refreshInterval,
      enableNotifications: state.enableNotifications,
      enableSounds: state.enableSounds,
      compactMode: state.compactMode,
    },
    providers: providerState.providers,
    configuredModels: providerState.configuredModels,
    sessions: state.sessions,
  }, null, 2);
}

export function importStoreData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    const state = useGlobalStore.getState();

    if (data.config) {
      state.setAutoRefresh(data.config.autoRefresh);
      state.setRefreshInterval(data.config.refreshInterval);
      state.setEnableNotifications(data.config.enableNotifications);
      state.setEnableSounds(data.config.enableSounds);
      state.setCompactMode(data.config.compactMode);
    }

    if (data.providers || data.configuredModels) {
      useProviderSlice.getState().importConfig(JSON.stringify({
        providers: data.providers,
        configuredModels: data.configuredModels,
      }));
    }

    if (data.sessions) {
      state.setSessions(data.sessions);
    }

    return true;
  } catch (e) {
    console.error('[GlobalStore] Import failed:', e);
    return false;
  }
}
