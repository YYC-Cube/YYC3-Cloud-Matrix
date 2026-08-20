/**
 * @file: useSettingsStore.test.tsx
 * @description: useSettingsStore.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSettingsStore } from "../hooks/useSettingsStore";

describe("useSettingsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should initialize with default settings", () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.autoScale).toBe(true);
    expect(result.current.settings.healthCheck).toBe(true);
    expect(result.current.settings.darkMode).toBe(true);
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.values.systemName).toBe("YYC³ Cloud Intelli-Matrix v3.2");
    expect(result.current.values.clusterId).toBe("CN-EAST-PROD-01");
    expect(result.current.values.language).toBe("zh-CN");
  });

  it("should toggle a setting", () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.autoScale).toBe(true);

    act(() => {
      result.current.toggleSetting("autoScale");
    });

    expect(result.current.settings.autoScale).toBe(false);

    act(() => {
      result.current.toggleSetting("autoScale");
    });

    expect(result.current.settings.autoScale).toBe(true);
  });

  it("should update a single value", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValue("systemName", "Custom System");
    });

    expect(result.current.values.systemName).toBe("Custom System");
  });

  it("should update multiple values at once", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValues({
        systemName: "New System",
        clusterId: "NEW-CLUSTER-01",
        language: "en-US",
      });
    });

    expect(result.current.values.systemName).toBe("New System");
    expect(result.current.values.clusterId).toBe("NEW-CLUSTER-01");
    expect(result.current.values.language).toBe("en-US");
  });

  it("should reset to default values", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValue("systemName", "Modified System");
    });

    expect(result.current.values.systemName).toBe("Modified System");

    act(() => {
      result.current.resetSettings();
    });

    expect(result.current.values.systemName).toBe("YYC³ Cloud Intelli-Matrix v3.2");
  });

  it("should persist settings to localStorage", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValue("systemName", "Persisted System");
    });

    const stored = localStorage.getItem("yyc3_system_settings");
    expect(stored).toBeDefined();

    const parsed = JSON.parse(stored!);
    expect(parsed.values.systemName).toBe("Persisted System");
  });

  it("should load settings from localStorage on init", () => {
    localStorage.setItem(
      "yyc3_system_settings",
      JSON.stringify({
        toggles: { autoScale: false, darkMode: false },
        values: { systemName: "Stored System", clusterId: "STORED-01" },
      })
    );

    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.autoScale).toBe(false);
    expect(result.current.settings.darkMode).toBe(false);
    expect(result.current.values.systemName).toBe("Stored System");
    expect(result.current.values.clusterId).toBe("STORED-01");
  });

  it("should export settings as JSON", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateValue("systemName", "Export Test");
    });

    const exported = result.current.exportSettings();
    const parsed = JSON.parse(exported);

    expect(parsed.version).toBe(1);
    expect(parsed.values.systemName).toBe("Export Test");
  });

  it("should import settings from JSON", () => {
    const { result } = renderHook(() => useSettingsStore());

    const importJson = JSON.stringify({
      version: 1,
      toggles: { autoScale: false, healthCheck: false },
      values: { systemName: "Imported System", clusterId: "IMPORTED-CLUSTER" },
    });

    let success: boolean;
    act(() => {
      success = result.current.importSettings(importJson);
    });

    expect(success!).toBe(true);
    expect(result.current.values.systemName).toBe("Imported System");
    expect(result.current.values.clusterId).toBe("IMPORTED-CLUSTER");
  });

  it("should handle invalid JSON import gracefully", () => {
    const { result } = renderHook(() => useSettingsStore());

    let success: boolean;
    act(() => {
      success = result.current.importSettings("invalid json");
    });

    expect(success!).toBe(false);
  });

  it("should toggle multiple settings independently", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.toggleSetting("autoScale");
      result.current.toggleSetting("darkMode");
    });

    expect(result.current.settings.autoScale).toBe(false);
    expect(result.current.settings.darkMode).toBe(false);
    expect(result.current.settings.healthCheck).toBe(true);
  });

  it("should handle all toggle types", () => {
    const { result } = renderHook(() => useSettingsStore());

    const toggleKeys = [
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
    ] as const;

    toggleKeys.forEach((key) => {
      act(() => {
        result.current.toggleSetting(key);
      });
    });

    const defaultFalseKeys = ["alertSlack", "debugMode", "autoUpdate"];
    toggleKeys.forEach((key) => {
      const wasDefaultTrue = !defaultFalseKeys.includes(key);
      const expectedValue = !wasDefaultTrue;
      expect(result.current.settings[key]).toBe(expectedValue);
    });
  });
});
