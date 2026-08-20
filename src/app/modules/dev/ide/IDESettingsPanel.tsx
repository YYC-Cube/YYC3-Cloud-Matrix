/**
 * @file: IDESettingsPanel.tsx
 * @description: IDE 设置面板 - 编辑器配置、外观主题、快捷键管理
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [ide],[settings],[panel]
 */

import * as React from "react";
import { useState, useCallback } from "react";
import { X, RotateCcw } from "lucide-react";
import { useI18n } from "../../../hooks/useI18n";
import { useIDESettingsSlice } from "../../../store/slices/ide-settings-slice";
import type { IDESettings } from "./ide-types";

// ============================================================
// Constants
// ============================================================

const FONT_OPTIONS = [
  "'JetBrains Mono', monospace",
  "'Fira Code', monospace",
  "'Cascadia Code', monospace",
  "'Source Code Pro', monospace",
  "Consolas, monospace",
  "'Courier New', monospace",
];

const FONT_SIZE_OPTIONS = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24];
const TAB_SIZE_OPTIONS = [2, 4, 6, 8];
const AUTO_SAVE_DELAY_OPTIONS = [
  { value: 500, label: "500ms" },
  { value: 1000, label: "1s" },
  { value: 2000, label: "2s" },
  { value: 5000, label: "5s" },
];

// ============================================================
// Types
// ============================================================

type SettingsTab = "editor" | "appearance" | "shortcuts";

interface IDESettingsPanelProps {
  /** Whether the settings panel is visible */
  isOpen: boolean;
  /** Callback to close the panel */
  onClose: () => void;
}

// ============================================================
// Component
// ============================================================

export function IDESettingsPanel({ isOpen, onClose }: IDESettingsPanelProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<SettingsTab>("editor");
  const settings = useIDESettingsSlice((s) => s.settings);
  const updateSettingAction = useIDESettingsSlice((s) => s.updateSetting);
  const resetSettings = useIDESettingsSlice((s) => s.resetSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // ─── Settings update helpers ─────────────────────────────

  const updateSetting = useCallback(<K extends keyof IDESettings>(key: K, value: IDESettings[K]) => {
    updateSettingAction(key, value);
    setHasChanges(true);
  }, [updateSettingAction]);

  const handleReset = useCallback(() => {
    resetSettings();
    setHasChanges(true);
  }, [resetSettings]);

  // ─── Tab configuration ───────────────────────────────────

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "editor", label: t("ide.settingsEditor") },
    { id: "appearance", label: t("ide.settingsAppearance") },
    { id: "shortcuts", label: t("ide.settingsShortcuts") },
  ];

  // ─── Keyboard shortcuts reference ────────────────────────

  const shortcuts = [
    { keys: "Ctrl+1", action: "Toggle Preview" },
    { keys: "Ctrl+2", action: "Toggle Code View" },
    { keys: "Ctrl+3", action: "Cycle Layout Mode" },
    { keys: "Ctrl+Shift+F", action: "Global Search" },
    { keys: "Ctrl+`", action: "Toggle Terminal" },
    { keys: "Esc", action: "Close Search" },
    { keys: "Ctrl+S", action: "Save File" },
    { keys: "Ctrl+Z", action: "Undo" },
    { keys: "Ctrl+Shift+Z", action: "Redo" },
    { keys: "Ctrl+P", action: "Quick Open File" },
    { keys: "Ctrl+G", action: "Go to Line" },
    { keys: "Ctrl+F", action: "Find" },
    { keys: "Ctrl+H", action: "Find and Replace" },
  ];

  // ─── Render helpers ──────────────────────────────────────

  const renderToggle = (
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
  ) => (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[#c0dcf0]" style={{ fontSize: "0.72rem" }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-9 h-5 rounded-full transition-all duration-200"
        style={{
          background: checked
            ? "linear-gradient(90deg, #00d4ff, #00ff88)"
            : "rgba(0, 40, 80, 0.5)",
          border: `1px solid ${checked ? "rgba(0, 212, 255, 0.4)" : "rgba(0, 180, 255, 0.15)"}`,
        }}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-200"
          style={{
            left: checked ? "18px" : "2px",
            background: checked ? "#fff" : "rgba(0, 212, 255, 0.4)",
            boxShadow: checked ? "0 0 6px rgba(0, 212, 255, 0.5)" : "none",
          }}
        />
      </button>
    </div>
  );

  const renderSelect = (
    label: string,
    value: string | number,
    options: { value: string | number; label: string }[],
    onChange: (value: string | number) => void,
  ) => (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[#c0dcf0]" style={{ fontSize: "0.72rem" }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(typeof value === "number" ? Number(v) : v);
        }}
        className="bg-[rgba(0,40,80,0.4)] text-[#e0f0ff] border border-[rgba(0,180,255,0.15)] rounded-md px-2 py-1 outline-none focus:border-[#00d4ff] transition-all cursor-pointer"
        style={{ fontSize: "0.68rem", minWidth: "120px" }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  // ─── Tab content ─────────────────────────────────────────

  const renderEditorTab = () => (
    <div className="space-y-1">
      {/* Font Size */}
      {renderSelect(
        t("ide.settingsFontSize"),
        settings.fontSize,
        FONT_SIZE_OPTIONS.map((s) => ({ value: s, label: `${s}px` })),
        (v) => updateSetting("fontSize", v as number),
      )}

      {/* Font Family */}
      {renderSelect(
        t("ide.settingsFontFamily"),
        settings.fontFamily,
        FONT_OPTIONS.map((f) => ({ value: f, label: f.split(",")[0].replace(/'/g, "") })),
        (v) => updateSetting("fontFamily", v as string),
      )}

      {/* Tab Size */}
      {renderSelect(
        t("ide.settingsTabSize"),
        settings.tabSize,
        TAB_SIZE_OPTIONS.map((s) => ({ value: s, label: `${s} spaces` })),
        (v) => updateSetting("tabSize", v as number),
      )}

      {/* Divider */}
      <div className="border-t border-[rgba(0,180,255,0.08)] my-2" />

      {/* Word Wrap */}
      {renderToggle(
        t("ide.settingsWordWrap"),
        settings.wordWrap,
        (v) => updateSetting("wordWrap", v),
      )}

      {/* Minimap */}
      {renderToggle(
        t("ide.settingsMinimap"),
        settings.minimap,
        (v) => updateSetting("minimap", v),
      )}

      {/* Line Numbers */}
      {renderToggle(
        t("ide.settingsLineNumbers"),
        settings.lineNumbers,
        (v) => updateSetting("lineNumbers", v),
      )}

      {/* Bracket Pair Colorization */}
      {renderToggle(
        t("ide.settingsBracketColorization"),
        settings.bracketPairColorization,
        (v) => updateSetting("bracketPairColorization", v),
      )}

      {/* Divider */}
      <div className="border-t border-[rgba(0,180,255,0.08)] my-2" />

      {/* Auto Save */}
      {renderToggle(
        t("ide.settingsAutoSave"),
        settings.autoSave,
        (v) => updateSetting("autoSave", v),
      )}

      {/* Auto Save Delay (shown when autoSave is enabled) */}
      {settings.autoSave &&
        renderSelect(
          t("ide.autoSaveDelay"),
          settings.autoSaveDelay,
          AUTO_SAVE_DELAY_OPTIONS,
          (v) => updateSetting("autoSaveDelay", v as number),
        )}

      {/* Format On Save */}
      {renderToggle(
        t("ide.settingsFormatOnSave"),
        settings.formatOnSave,
        (v) => updateSetting("formatOnSave", v),
      )}
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-1">
      {/* Theme selector */}
      <div className="py-2.5">
        <span className="text-[#c0dcf0] block mb-2.5" style={{ fontSize: "0.72rem" }}>
          Theme
        </span>
        <div className="grid grid-cols-3 gap-2">
          {(["dark", "light", "cyberpunk"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => updateSetting("theme", theme)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all ${
                settings.theme === theme
                  ? "border-[#00d4ff] bg-[rgba(0,212,255,0.1)]"
                  : "border-[rgba(0,180,255,0.1)] bg-[rgba(0,40,80,0.2)] hover:border-[rgba(0,212,255,0.3)]"
              }`}
            >
              <div
                className="w-8 h-8 rounded-md"
                style={{
                  background:
                    theme === "dark"
                      ? "linear-gradient(135deg, #0a0e1a, #1a1f35)"
                      : theme === "light"
                      ? "linear-gradient(135deg, #f0f4f8, #e2e8f0)"
                      : "linear-gradient(135deg, #0a0020, #1a0040, #2a0060)",
                  border: "1px solid rgba(0,180,255,0.1)",
                }}
              />
              <span
                className={
                  settings.theme === theme ? "text-[#00d4ff]" : "text-[rgba(224,240,255,0.6)]"
                }
                style={{ fontSize: "0.6rem" }}
              >
                {theme === "dark"
                  ? t("ide.settingsThemeDark")
                  : theme === "light"
                  ? t("ide.settingsThemeLight")
                  : t("ide.settingsThemeCyberpunk")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShortcutsTab = () => (
    <div className="space-y-0.5">
      {shortcuts.map((shortcut) => (
        <div
          key={shortcut.keys}
          className="flex items-center justify-between py-2 border-b border-[rgba(0,180,255,0.05)]"
        >
          <span className="text-[#c0dcf0]" style={{ fontSize: "0.68rem" }}>
            {shortcut.action}
          </span>
          <kbd
            className="bg-[rgba(0,40,80,0.4)] text-[#00d4ff] border border-[rgba(0,180,255,0.15)] rounded px-1.5 py-0.5 font-mono"
            style={{ fontSize: "0.6rem" }}
          >
            {shortcut.keys}
          </kbd>
        </div>
      ))}
    </div>
  );

  // ─── Main render ─────────────────────────────────────────

  if (!isOpen) { return null; }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed z-50"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "480px",
          maxHeight: "80vh",
          background: "linear-gradient(180deg, rgba(8,20,45,0.98) 0%, rgba(6,14,31,0.98) 100%)",
          border: "1px solid rgba(0, 180, 255, 0.2)",
          borderRadius: "12px",
          boxShadow: "0 0 40px rgba(0, 180, 255, 0.15), 0 0 80px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(0, 180, 255, 0.1)" }}
        >
          <h2 className="text-[#e0f0ff] font-medium" style={{ fontSize: "0.82rem" }}>
            {t("ide.settingsTitle")}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-md text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all"
              title={t("ide.resetLayout")}
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all"
              title={t("ide.close")}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex px-4 pt-1"
          style={{ borderBottom: "1px solid rgba(0, 180, 255, 0.08)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 transition-all relative`}
              style={{ fontSize: "0.72rem" }}
            >
              <span
                className={
                  activeTab === tab.id
                    ? "text-[#00d4ff]"
                    : "text-[rgba(224,240,255,0.5)] hover:text-[rgba(224,240,255,0.7)]"
                }
              >
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full"
                  style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "calc(80vh - 110px)" }}>
          {activeTab === "editor" && renderEditorTab()}
          {activeTab === "appearance" && renderAppearanceTab()}
          {activeTab === "shortcuts" && renderShortcutsTab()}
        </div>

        {/* Footer indicator */}
        {hasChanges && (
          <div
            className="flex items-center justify-center px-4 py-1.5"
            style={{
              background: "rgba(0, 212, 255, 0.05)",
              borderTop: "1px solid rgba(0, 180, 255, 0.08)",
            }}
          >
            <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.55rem" }}>
              Settings auto-saved
            </span>
          </div>
        )}
      </div>
    </>
  );
}
