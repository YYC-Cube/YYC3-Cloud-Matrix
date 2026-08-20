/**
 * @file: ui-prefs-slice.ts
 * @description: YYC³ UI 偏好设置 Slice · 杂项 UI 配置统一持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-18
 * @updated: 2026-04-18
 * @status: active
 * @tags: [store],[slice],[ui]
 *
 * @brief: 杂项 UI 偏好统一 Zustand Store
 *
 * @details:
 * - 合并 4 个组件的 5 个 localStorage 键
 * - 原: yyc3_ai_float_position, yyc3_terminal_height,
 *       yyc3_perf_alert_thresholds, yyc3_connection_test_results, yyc3_cors_proxy
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { migrateKey, migrateRawString } from '../../lib/migrate-storage';

// ============================================================
// 类型定义
// ============================================================

export interface AlertThresholds {
  fpsMin: number;
  memMaxPercent: number;
  clsMax: number;
  fcpMax: number;
  lcpMax: number;
  ttfbMax: number;
  inpMax: number;
  storageMaxKB: number;
  alertEnabled: boolean;
  alertCooldownSec: number;
}

// ============================================================
// Slice Interface
// ============================================================

interface UIPrefsSlice {
  // AI 浮动面板位置
  aiFloatPosition: { x: number; y: number };
  setAIFloatPosition: (pos: { x: number; y: number }) => void;

  // 终端面板高度
  terminalHeight: number;
  setTerminalHeight: (height: number) => void;

  // 性能告警阈值
  perfAlertThresholds: AlertThresholds;
  setPerfAlertThresholds: (thresholds: AlertThresholds) => void;

  // 连接测试结果 (any[] — 组件含 React.ElementType 不可序列化, 仅存 JSON-safe 部分)
  connectionTestResults: unknown[];
  setConnectionTestResults: (results: unknown[]) => void;

  // CORS 代理 URL
  corsProxyUrl: string;
  setCorsProxyUrl: (url: string) => void;

  // 自定义主题 (ThemeCustomizer 保存的完整主题数据)
  customTheme: Record<string, unknown> | null;
  setCustomTheme: (theme: Record<string, unknown> | null) => void;
}

// ============================================================
// Store
// ============================================================

export const useUIPrefsSlice = create<UIPrefsSlice>()(
  persist(
    (set) => ({
      aiFloatPosition: { x: 100, y: 100 },
      setAIFloatPosition: (pos) => set({ aiFloatPosition: pos }),

      terminalHeight: 300,
      setTerminalHeight: (height) => set({ terminalHeight: height }),

      perfAlertThresholds: {
        fpsMin: 30, memMaxPercent: 80, clsMax: 0.1,
        fcpMax: 3000, lcpMax: 4000, ttfbMax: 1800,
        inpMax: 500, storageMaxKB: 4096,
        alertEnabled: true, alertCooldownSec: 60,
      },
      setPerfAlertThresholds: (thresholds) => set({ perfAlertThresholds: thresholds }),

      connectionTestResults: [],
      setConnectionTestResults: (results) => set({ connectionTestResults: results }),

      corsProxyUrl: '',
      setCorsProxyUrl: (url) => set({ corsProxyUrl: url }),

      customTheme: null,
      setCustomTheme: (theme) => set({ customTheme: theme }),
    }),
    {
      name: 'yyc3-ui-prefs',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Legacy Migration Helper
// ============================================================

export function migrateLegacyUIPrefs(): boolean {
  let migrated = false;
  migrated = migrateKey<{ x: number; y: number }>('yyc3_ai_float_position', (v) => useUIPrefsSlice.setState({ aiFloatPosition: v })) || migrated;
  migrated = migrateKey<number>('yyc3_terminal_height', (v) => useUIPrefsSlice.setState({ terminalHeight: v })) || migrated;
  migrated = migrateKey<AlertThresholds>('yyc3_perf_alert_thresholds', (v) => useUIPrefsSlice.setState({ perfAlertThresholds: v })) || migrated;
  migrated = migrateKey<unknown[]>('yyc3_connection_test_results', (v) => useUIPrefsSlice.setState({ connectionTestResults: v })) || migrated;
  migrated = migrateRawString('yyc3_cors_proxy', (v) => useUIPrefsSlice.setState({ corsProxyUrl: v })) || migrated;
  migrated = migrateKey<Record<string, unknown>>('yyc3_custom_theme', (v) => useUIPrefsSlice.setState({ customTheme: v })) || migrated;
  return migrated;
}
