/**
 * @file: sdk-session-slice.ts
 * @description: YYC³ SDK Session Slice — 聊天会话 + SDK 使用统计持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-18
 * @updated: 2026-04-18
 * @status: active
 * @tags: [store],[slice],[sdk]
 *
 * @brief: BigModel SDK 会话与统计 Zustand Store
 *
 * @details:
 * - 合并 2 个 localStorage 键: yyc3_chat_sessions, yyc3_sdk_usage_stats
 * - useBigModelSDK hook 改为薄 wrapper
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatSession, SDKUsageStats } from '../../types';
import { migrateKey } from '../../lib/migrate-storage';

// ============================================================
// Default Stats
// ============================================================

function defaultStats(): SDKUsageStats {
  return {
    totalRequests: 0,
    totalTokensIn: 0,
    totalTokensOut: 0,
    avgLatencyMs: 0,
    lastRequestAt: null,
    errorCount: 0,
  };
}

// ============================================================
// Slice Interface
// ============================================================

interface SDKSessionSlice {
  chatSessions: ChatSession[];
  setChatSessions: (sessions: ChatSession[]) => void;

  usageStats: SDKUsageStats;
  setUsageStats: (stats: SDKUsageStats) => void;
}

// ============================================================
// Store
// ============================================================

export const useSDKSessionSlice = create<SDKSessionSlice>()(
  persist(
    (set) => ({
      chatSessions: [],
      setChatSessions: (sessions) => set({ chatSessions: sessions }),

      usageStats: defaultStats(),
      setUsageStats: (stats) => set({ usageStats: stats }),
    }),
    {
      name: 'yyc3-sdk-session',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Legacy Migration Helper
// ============================================================

export function migrateLegacySDKSession(): boolean {
  let migrated = false;
  migrated = migrateKey<ChatSession[]>('yyc3_chat_sessions', (v) => useSDKSessionSlice.setState({ chatSessions: v })) || migrated;
  migrated = migrateKey<SDKUsageStats>('yyc3_sdk_usage_stats', (v) => useSDKSessionSlice.setState({ usageStats: v })) || migrated;
  return migrated;
}
