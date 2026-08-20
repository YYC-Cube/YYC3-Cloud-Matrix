/**
 * @file: offline-slice.ts
 * @description: YYC³ Offline Mode Slice — 离线快照持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-18
 * @updated: 2026-04-18
 * @status: active
 * @tags: [store],[slice],[offline]
 *
 * @brief: 离线模式快照缓存 Zustand Store
 *
 * @details:
 * - 合并 3 个 localStorage 键: dashboard_state, offline_snapshot, offline_snapshot_time
 * - useOfflineMode hook 改为薄 wrapper，持久化委托此 slice
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { migrateKey } from '../../lib/migrate-storage';

// ============================================================
// Slice Interface
// ============================================================

interface OfflineSlice {
  // 仪表盘状态快照 (定期保存 + 离线恢复用)
  dashboardSnapshot: Record<string, unknown> | null;
  setDashboardSnapshot: (data: Record<string, unknown>) => void;

  // 离线快照 (断网时从 dashboardSnapshot 复制)
  offlineSnapshot: Record<string, unknown> | null;
  offlineSnapshotTime: string | null;
  setOfflineSnapshot: (data: Record<string, unknown>, time: string) => void;
  clearOfflineSnapshot: () => void;
}

// ============================================================
// Store
// ============================================================

export const useOfflineSlice = create<OfflineSlice>()(
  persist(
    (set) => ({
      dashboardSnapshot: null,
      setDashboardSnapshot: (data) => set({ dashboardSnapshot: data }),

      offlineSnapshot: null,
      offlineSnapshotTime: null,
      setOfflineSnapshot: (data, time) =>
        set({ offlineSnapshot: data, offlineSnapshotTime: time }),
      clearOfflineSnapshot: () =>
        set({ offlineSnapshot: null, offlineSnapshotTime: null }),
    }),
    {
      name: 'yyc3-offline',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Legacy Migration Helper
// ============================================================

export function migrateLegacyOfflineData(): boolean {
  let migrated = false;
  migrated = migrateKey<Record<string, unknown>>('dashboard_state', (v) => useOfflineSlice.setState({ dashboardSnapshot: v })) || migrated;
  migrated = migrateKey<Record<string, unknown>>('offline_snapshot', (v) => {
    const time = localStorage.getItem('offline_snapshot_time');
    useOfflineSlice.setState({ offlineSnapshot: v, offlineSnapshotTime: time });
    localStorage.removeItem('offline_snapshot_time');
  }) || migrated;
  return migrated;
}
