/**
 * @file: demo-mode-off.test.ts
 * @description: 演示模式关闭（demoMode=false，生产默认）行为专项测试
 *
 * 覆盖范围：
 * - Settings SSOT 生产默认值 demoMode === false
 * - usePatrol：关闭时不产生模拟巡查结果、历史为空
 * - useAIDiagnostics：关闭时不产生模拟诊断会话、历史为空
 * - useReportExporter：关闭时不生成模拟报表、报表历史为空
 *
 * 注意：存量测试通过 helpers/demo-mode.ts 显式开启演示模式，
 * 本文件在 beforeEach 中显式置为 false 验证生产语义。
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";
import { usePatrol } from "../hooks/usePatrol";
import { useAIDiagnostics } from "../hooks/useAIDiagnostics";
import { useReportExporter } from "../hooks/useReportExporter";

function setDemoMode(v: boolean) {
  useSettingsSSOT.setState((state) => ({
    toggles: { ...state.toggles, demoMode: v },
  }));
}

beforeEach(() => {
  localStorage.clear();
  setDemoMode(false);
});

afterEach(() => {
  // 保持生产默认（其他文件如需演示模式会自行开启）
  setDemoMode(false);
});

describe("Settings SSOT · 演示模式默认值", () => {
  it("生产默认 demoMode 为 false（DEFAULT_TOGGLES）", () => {
    // 重置设置后应回到生产默认值
    useSettingsSSOT.getState().resetSettings();
    expect(useSettingsSSOT.getState().toggles.demoMode).toBe(false);
  });
});

describe("usePatrol · 演示模式关闭", () => {
  it("runPatrol 不产生模拟巡查结果", async () => {
    const { result } = renderHook(() => usePatrol());
    await act(async () => {
      await result.current.runPatrol("manual");
    });
    expect(result.current.currentResult).toBeNull();
    expect(result.current.patrolStatus).toBe("idle");
  });

  it("历史记录为空（不展示模拟种子）", () => {
    const { result } = renderHook(() => usePatrol());
    expect(result.current.history).toEqual([]);
  });
});

describe("useAIDiagnostics · 演示模式关闭", () => {
  it("startDiagnosis 不产生模拟诊断会话", async () => {
    const { result } = renderHook(() => useAIDiagnostics());
    await act(async () => {
      result.current.startDiagnosis();
    });
    expect(result.current.session).toBeNull();
    expect(result.current.status).toBe("idle");
  });

  it("诊断历史为空（不展示模拟种子）", () => {
    const { result } = renderHook(() => useAIDiagnostics());
    expect(result.current.history).toEqual([]);
  });
});

describe("useReportExporter · 演示模式关闭", () => {
  it("generateReport 不生成模拟报表", async () => {
    const { result } = renderHook(() => useReportExporter());
    await act(async () => {
      result.current.generateReport();
    });
    expect(result.current.report).toBeNull();
    expect(result.current.isGenerating).toBe(false);
  });

  it("报表历史为空（不展示模拟种子）", () => {
    const { result } = renderHook(() => useReportExporter());
    expect(result.current.recentReports).toEqual([]);
  });
});
