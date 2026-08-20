/**
 * @file: ide-settings-slice.ts
 * @description: YYC³ IDE Settings Slice · 统一管理 3 个 localStorage 键
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-18
 * @updated: 2026-04-18
 * @status: active
 * @tags: [store],[slice],[ide]
 *
 * @brief: IDE 设置统一 Zustand Store（替代分散在 3 个组件中的独立 localStorage 读/写）
 *
 * @details:
 * - 3 个数据域: layoutMode, settings, layoutConfig
 * - 原 localStorage 键: yyc3-ide-layout-mode, yyc3-ide-settings, ide-layout
 * - persist middleware 自动同步 localStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IDELayoutMode, IDESettings } from '../../modules/dev/ide/ide-types';
import type { LayoutConfig } from '../../modules/dev/ide/ide-layout-types';
import { migrateRawString, migrateKeyWithMerge, migrateKey } from '../../lib/migrate-storage';

// ============================================================
// 默认值
// ============================================================

const DEFAULT_IDE_SETTINGS: IDESettings = {
  theme: "dark",
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  autoSave: true,
  autoSaveDelay: 1000,
  formatOnSave: true,
  bracketPairColorization: true,
};

export { DEFAULT_IDE_SETTINGS };

// ============================================================
// Slice Interface
// ============================================================

interface IDESettingsSlice {
  // 数据域
  layoutMode: IDELayoutMode;
  settings: IDESettings;
  layoutConfig: LayoutConfig | null;

  // LayoutMode 操作
  setLayoutMode: (mode: IDELayoutMode) => void;

  // Settings 操作
  setSettings: (settings: IDESettings) => void;
  updateSetting: (key: keyof IDESettings, value: IDESettings[keyof IDESettings]) => void;
  resetSettings: () => void;

  // LayoutConfig 操作
  setLayoutConfig: (config: LayoutConfig) => void;
}

// ============================================================
// Store
// ============================================================

export const useIDESettingsSlice = create<IDESettingsSlice>()(
  persist(
    (set) => ({
      layoutMode: 'preview' as IDELayoutMode,
      settings: DEFAULT_IDE_SETTINGS,
      layoutConfig: null,

      setLayoutMode: (mode) => set({ layoutMode: mode }),
      setSettings: (settings) => set({ settings }),
      updateSetting: (key, value) => set((s) => ({
        settings: { ...s.settings, [key]: value },
      })),
      resetSettings: () => set({ settings: { ...DEFAULT_IDE_SETTINGS } }),
      setLayoutConfig: (config) => set({ layoutConfig: config }),
    }),
    {
      name: 'yyc3-ide',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Legacy Migration Helper
// ============================================================

export function migrateLegacyIDESettings(): boolean {
  let migrated = false;
  migrated = migrateRawString('yyc3-ide-layout-mode', (v) => {
    if (v === 'edit' || v === 'preview' || v === 'free') {
      useIDESettingsSlice.setState({ layoutMode: v as IDELayoutMode });
    }
  }) || migrated;
  migrated = migrateKeyWithMerge('yyc3-ide-settings', DEFAULT_IDE_SETTINGS, (v) => useIDESettingsSlice.setState({ settings: v })) || migrated;
  migrated = migrateKey<LayoutConfig>('ide-layout', (v) => useIDESettingsSlice.setState({ layoutConfig: v })) || migrated;
  return migrated;
}
