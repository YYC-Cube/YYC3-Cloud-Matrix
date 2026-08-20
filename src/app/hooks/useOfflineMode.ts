/**
 * @file: useOfflineMode.ts
 * @description: useOfflineMode Hook — 离线模式状态管理
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-18
 * @status: active
 * @tags: [hook]
 *
 * @brief: 离线模式检测 + 快照恢复
 * @details: v2 从 localStorage 直接调用迁移至 useOfflineSlice 持久化
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useOfflineSlice } from "../store/slices/offline-slice";
import { useProviderSlice } from "../store/slices/provider-slice";

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingSync, setPendingSync] = useState(false);
  const snapshotTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const saveOfflineSnapshot = useCallback(() => {
    const dashboard = useOfflineSlice.getState().dashboardSnapshot;
    if (dashboard) {
      useOfflineSlice.getState().setOfflineSnapshot(dashboard, new Date().toISOString());
    }
  }, []);

  const syncOfflineData = useCallback(async () => {
    const { offlineSnapshot } = useOfflineSlice.getState();
    if (!offlineSnapshot) {
      setLastSyncTime(new Date());
      return;
    }
    setPendingSync(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLastSyncTime(new Date());
      useOfflineSlice.getState().clearOfflineSnapshot();
    } catch {
      // sync failed
    } finally {
      setPendingSync(false);
    }
  }, []);

  // 定期保存 dashboard_state (每 30 秒)
  useEffect(() => {
    const saveSnapshot = () => {
      useOfflineSlice.getState().setDashboardSnapshot({
        savedAt: Date.now(),
        locale: localStorage.getItem("yyc3_locale") ?? "zh-CN",
        networkConfig: localStorage.getItem("yyc3_network_config"),
        modelsCount: useProviderSlice.getState().configuredModels.length,
      });
    };

    saveSnapshot();
    snapshotTimer.current = setInterval(saveSnapshot, 30_000);

    return () => {
      if (snapshotTimer.current) {clearInterval(snapshotTimer.current);}
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      saveOfflineSnapshot();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [saveOfflineSnapshot, syncOfflineData]);

  const getOfflineSnapshotTime = useCallback((): Date | null => {
    const time = useOfflineSlice.getState().offlineSnapshotTime;
    return time ? new Date(time) : null;
  }, []);

  return {
    isOnline,
    lastSyncTime,
    pendingSync,
    saveOfflineSnapshot,
    syncOfflineData,
    getOfflineSnapshotTime,
    /** 手动保存仪表盘快照 */
    saveDashboardState: (data: Record<string, unknown>) =>
      useOfflineSlice.getState().setDashboardSnapshot(data),
    /** 读取仪表盘快照 */
    loadDashboardState: () =>
      useOfflineSlice.getState().dashboardSnapshot,
  };
}
