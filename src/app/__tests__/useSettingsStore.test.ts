/**
 * @file: useSettingsStore.test.ts
 * @description: useSettingsStore Hook单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useSettingsStore } from "../hooks/useSettingsStore";

vi.mock("../lib/broadcast-channel", () => ({
  getSharedChannel: vi.fn(() => ({
    postMessage: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
}));

describe("useSettingsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should return initial state with default values", () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings).toBeDefined();
    expect(result.current.values).toBeDefined();
    expect(result.current.settings.autoScale).toBe(true);
    expect(result.current.settings.darkMode).toBe(true);
    expect(result.current.values.systemName).toBe("YYC³ Cloud Intelli-Matrix v3.2");
  });

  it("should toggle setting", () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.autoScale).toBe(true);

    act(() => {
      result.current.toggleSetting("autoScale");
    });

    expect(result.current.settings.autoScale).toBe(false);
  });

  it("should update single value", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValue("systemName", "New System Name");
    });

    expect(result.current.values.systemName).toBe("New System Name");
  });

  it("should update multiple values", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValues({
        systemName: "New Name",
        clusterId: "NEW-CLUSTER",
      });
    });

    expect(result.current.values.systemName).toBe("New Name");
    expect(result.current.values.clusterId).toBe("NEW-CLUSTER");
  });

  it("should reset settings to defaults", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValue("systemName", "Modified");
      result.current.toggleSetting("autoScale");
    });

    expect(result.current.values.systemName).toBe("Modified");
    expect(result.current.settings.autoScale).toBe(false);

    act(() => {
      result.current.resetSettings();
    });

    expect(result.current.values.systemName).toBe("YYC³ Cloud Intelli-Matrix v3.2");
    expect(result.current.settings.autoScale).toBe(true);
  });

  it("should export settings as JSON", () => {
    const { result } = renderHook(() => useSettingsStore());

    const exported = result.current.exportSettings();

    expect(exported).toBeDefined();
    const parsed = JSON.parse(exported);
    expect(parsed.version).toBe(1);
    expect(parsed.exportedAt).toBeDefined();
    expect(parsed.toggles).toBeDefined();
    expect(parsed.values).toBeDefined();
  });

  it("should import settings from JSON", () => {
    const { result } = renderHook(() => useSettingsStore());

    const importData = JSON.stringify({
      version: 1,
      toggles: { autoScale: false, darkMode: false },
      values: { systemName: "Imported System" },
    });

    let importResult: boolean;
    act(() => {
      importResult = result.current.importSettings(importData);
    });

    expect(importResult!).toBe(true);
    expect(result.current.settings.autoScale).toBe(false);
    expect(result.current.settings.darkMode).toBe(false);
    expect(result.current.values.systemName).toBe("Imported System");
  });

  it("should return false for invalid JSON import", () => {
    const { result } = renderHook(() => useSettingsStore());

    let importResult: boolean;
    act(() => {
      importResult = result.current.importSettings("invalid json");
    });

    expect(importResult!).toBe(false);
  });

  it("should persist settings to localStorage", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValue("systemName", "Persisted Name");
    });

    const stored = localStorage.getItem("yyc3_system_settings");
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.values.systemName).toBe("Persisted Name");
  });

  it("should load settings from localStorage on mount", () => {
    const savedState = {
      toggles: { autoScale: false },
      values: { systemName: "Saved Name" },
    };
    localStorage.setItem("yyc3_system_settings", JSON.stringify(savedState));

    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.autoScale).toBe(false);
    expect(result.current.values.systemName).toBe("Saved Name");
  });

  it("should handle all toggle keys", () => {
    const { result } = renderHook(() => useSettingsStore());

    const toggleKeys: (keyof ReturnType<typeof useSettingsStore>["settings"])[] = [
      "autoScale",
      "healthCheck",
      "alertEmail",
      "alertSlack",
      "darkMode",
      "autoBackup",
      "mfa",
      "auditLog",
      "rateLimiting",
      "cacheEnabled",
      "wsAutoReconnect",
      "wsHeartbeat",
      "aiStreamMode",
      "aiContextMemory",
      "debugMode",
      "performanceLog",
      "autoUpdate",
      "dataCompression",
      "corsEnabled",
    ];

    toggleKeys.forEach((key) => {
      act(() => {
        result.current.toggleSetting(key);
      });
    });

    expect(result.current.settings.autoScale).toBe(false);
    expect(result.current.settings.darkMode).toBe(false);
  });

  it("should handle all value keys", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValue("refreshInterval", "10");
      result.current.updateValue("language", "en-US");
      result.current.updateValue("timezone", "America/New_York");
    });

    expect(result.current.values.refreshInterval).toBe("10");
    expect(result.current.values.language).toBe("en-US");
    expect(result.current.values.timezone).toBe("America/New_York");
  });
});
