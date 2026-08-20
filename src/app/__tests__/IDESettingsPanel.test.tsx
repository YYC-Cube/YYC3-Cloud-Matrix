/**
 * @file: IDESettingsPanel.test.tsx
 * @description: IDESettingsPanel 组件测试 — 编辑器设置、外观、快捷键面板
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-07-25
 * @updated: 2026-07-25
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";

// ─── Mocks ─────────────────────────────────────────────────

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const { mockUpdateSetting, mockResetSettings } = vi.hoisted(() => ({
  mockUpdateSetting: vi.fn(),
  mockResetSettings: vi.fn(),
}));

const DEFAULT_SETTINGS = {
  theme: "dark" as const,
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

vi.mock("../store/slices/ide-settings-slice", () => ({
  useIDESettingsSlice: (selector: (s: any) => any) => {
    const state = {
      settings: DEFAULT_SETTINGS,
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
    };
    return selector ? selector(state) : state;
  },
}));

import { IDESettingsPanel } from "../modules/dev/ide/IDESettingsPanel";

// ─── Helpers ───────────────────────────────────────────────

function renderPanel(props: { isOpen?: boolean; onClose?: () => void } = {}) {
  return render(
    React.createElement(IDESettingsPanel, {
      isOpen: true,
      onClose: vi.fn(),
      ...props,
    })
  );
}

// ─── Tests ─────────────────────────────────────────────────

describe("IDESettingsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ── 渲染控制 ──

  describe("渲染控制", () => {
    it("renders nothing when isOpen is false", () => {
      renderPanel({ isOpen: false });
      expect(screen.queryByText("ide.settingsTitle")).not.toBeInTheDocument();
    });

    it("renders panel when isOpen is true", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsTitle")).toBeInTheDocument();
    });
  });

  // ── Tab 切换 ──

  describe("Tab 切换", () => {
    it("renders 3 tabs: editor, appearance, shortcuts", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsEditor")).toBeInTheDocument();
      expect(screen.getByText("ide.settingsAppearance")).toBeInTheDocument();
      expect(screen.getByText("ide.settingsShortcuts")).toBeInTheDocument();
    });

    it("default tab is editor", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsFontSize")).toBeInTheDocument();
      expect(screen.getByText("ide.settingsFontFamily")).toBeInTheDocument();
    });
  });

  // ── 编辑器 Tab ──

  describe("编辑器 Tab", () => {
    it("editor tab: font size select", () => {
      renderPanel();
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(3); // fontSize, fontFamily, tabSize
    });

    it("editor tab: font family select", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsFontFamily")).toBeInTheDocument();
    });

    it("editor tab: tab size select", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsTabSize")).toBeInTheDocument();
    });

    it("editor tab: word wrap toggle", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsWordWrap")).toBeInTheDocument();
      const switches = screen.getAllByRole("switch");
      expect(switches.length).toBeGreaterThanOrEqual(1);
    });

    it("editor tab: minimap toggle", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsMinimap")).toBeInTheDocument();
    });

    it("editor tab: line numbers toggle", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsLineNumbers")).toBeInTheDocument();
    });

    it("editor tab: bracket pair colorization toggle", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsBracketColorization")).toBeInTheDocument();
    });

    it("editor tab: auto save toggle", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsAutoSave")).toBeInTheDocument();
    });

    it("editor tab: format on save toggle", () => {
      renderPanel();
      expect(screen.getByText("ide.settingsFormatOnSave")).toBeInTheDocument();
    });

    it("auto save delay select appears when autoSave is enabled", () => {
      renderPanel();
      // AutoSave is true by default, so autoSaveDelay should be visible
      expect(screen.getByText("ide.autoSaveDelay")).toBeInTheDocument();
    });

    it("changing select values calls updateSetting with correct value type", () => {
      renderPanel();
      const selects = screen.getAllByRole("combobox");
      // First select is fontSize
      fireEvent.change(selects[0], { target: { value: "16" } });
      expect(mockUpdateSetting).toHaveBeenCalledWith("fontSize", 16);
    });

    it("auto save delay select appears when autoSave is enabled", () => {
      renderPanel();
      expect(screen.getByText("ide.autoSaveDelay")).toBeInTheDocument();
    });
  });

  // ── 外观 Tab ──

  describe("外观 Tab", () => {
    it("appearance tab: theme selector with dark/light/cyberpunk options", () => {
      renderPanel();
      fireEvent.click(screen.getByText("ide.settingsAppearance"));
      expect(screen.getByText("ide.settingsThemeDark")).toBeInTheDocument();
      expect(screen.getByText("ide.settingsThemeLight")).toBeInTheDocument();
      expect(screen.getByText("ide.settingsThemeCyberpunk")).toBeInTheDocument();
    });

    it("clicking theme option updates theme", () => {
      renderPanel();
      fireEvent.click(screen.getByText("ide.settingsAppearance"));
      fireEvent.click(screen.getByText("ide.settingsThemeLight"));
      expect(mockUpdateSetting).toHaveBeenCalledWith("theme", "light");
    });
  });

  // ── 快捷键 Tab ──

  describe("快捷键 Tab", () => {
    it("shortcuts tab: renders keyboard shortcuts reference list", () => {
      renderPanel();
      fireEvent.click(screen.getByText("ide.settingsShortcuts"));
      expect(screen.getByText("Toggle Preview")).toBeInTheDocument();
      expect(screen.getByText("Ctrl+1")).toBeInTheDocument();
      expect(screen.getByText("Toggle Terminal")).toBeInTheDocument();
      expect(screen.getByText("Ctrl+`")).toBeInTheDocument();
    });
  });

  // ── 重置 ──

  describe("重置", () => {
    it("clicking reset button calls resetSettings", () => {
      renderPanel();
      // Find the reset button by its title
      const buttons = screen.getAllByRole("button");
      const resetBtn = buttons.find((btn) => btn.title === "ide.resetLayout");
      if (resetBtn) fireEvent.click(resetBtn);
      expect(mockResetSettings).toHaveBeenCalledTimes(1);
    });
  });

  // ── 关闭 ──

  describe("关闭", () => {
    it("clicking X button calls onClose", () => {
      const onClose = vi.fn();
      renderPanel({ onClose });
      const buttons = screen.getAllByRole("button");
      const xBtn = buttons.find((btn) => btn.title === "ide.close");
      if (xBtn) fireEvent.click(xBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("clicking backdrop calls onClose", () => {
      const onClose = vi.fn();
      renderPanel({ onClose });
      // The backdrop is the fixed div with z-40
      const backdrop = document.querySelector(".fixed.inset-0.z-40");
      if (backdrop) fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ── 设置变更 ──

  describe("设置变更", () => {
    it("toggling a setting calls updateSetting", () => {
      renderPanel();
      const switches = screen.getAllByRole("switch");
      // Click the first toggle (wordWrap)
      fireEvent.click(switches[0]);
      expect(mockUpdateSetting).toHaveBeenCalled();
    });

    it("shows 'Settings auto-saved' footer when hasChanges", () => {
      renderPanel();
      const switches = screen.getAllByRole("switch");
      // Toggle a setting to trigger hasChanges
      fireEvent.click(switches[0]);
      expect(screen.getByText("Settings auto-saved")).toBeInTheDocument();
    });
  });
});