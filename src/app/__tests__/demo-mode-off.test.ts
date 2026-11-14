/**
 * @file: demo-mode-off.test.ts
 * @description: 演示模式关闭（demoMode=false，生产默认）行为专项测试
 *
 * 覆盖范围：
 * - Settings SSOT 生产默认值 demoMode === false
 * - usePatrol：关闭时执行真实巡检（slice 派生，无模拟数据）、历史为空
 * - useAIDiagnostics：关闭时不产生模拟诊断会话、历史为空
 * - useReportExporter：关闭时不生成模拟报表、报表历史为空
 *
 * 注意：存量测试通过 helpers/demo-mode.ts 显式开启演示模式，
 * 本文件在 beforeEach 中显式置为 false 验证生产语义。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";
import { usePatrol } from "../hooks/usePatrol";
import { useAIDiagnostics } from "../hooks/useAIDiagnostics";
import { useReportExporter } from "../hooks/useReportExporter";
import { useOperationCenter } from "../hooks/useOperationCenter";
import { useBigModelSDK } from "../hooks/useBigModelSDK";
import type { ConfiguredModel } from "../types";

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
  it("runPatrol 执行真实巡检（chk-real- 派生，无 demo 前缀）", async () => {
    const { result } = renderHook(() => usePatrol());
    await act(async () => {
      await result.current.runPatrol("manual");
    });
    const r = result.current.currentResult;
    // 2026-11-11 起：demoMode 关闭 = 真实巡检（slice 派生），不再拒绝执行
    expect(r).not.toBeNull();
    expect(r!.id.startsWith("demo-")).toBe(false);
    expect(r!.checks.every((c) => c.id.startsWith("chk-real-"))).toBe(true);
    expect(result.current.patrolStatus).toBe("completed");
  });

  it("历史记录为空（不展示模拟种子）", () => {
    const { result } = renderHook(() => usePatrol());
    expect(result.current.history).toEqual([]);
  });
});

describe("useAIDiagnostics · 演示模式关闭", () => {
  it("startDiagnosis 执行真实规则分析（无实时数据时如实给出无结论会话）", async () => {
    // 2026-11-14 起：demoMode 关闭 = 真实规则分析（阈值越限+真实采样趋势），不再拒绝执行
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useAIDiagnostics());
      act(() => {
        result.current.startDiagnosis();
      });
      expect(result.current.status).toBe("analyzing");
      await act(async () => {
        vi.advanceTimersByTime(700);
      });
      expect(result.current.status).toBe("complete");
      const s = result.current.session!;
      expect(s).not.toBeNull();
      // 无节点数据且采样历史不足：全部为空 + 摘要如实说明
      expect(s.anomalies).toEqual([]);
      expect(s.patterns).toEqual([]);
      expect(s.actions).toEqual([]);
      expect(s.forecasts).toEqual([]);
      expect(s.summary).toContain("未产生诊断结论");
    } finally {
      vi.useRealTimers();
    }
  });

  it("startDiagnosis 基于真实越限节点产出异常与处置建议（不模拟执行）", async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() =>
        useAIDiagnostics({
          liveNodes: [{ id: "GPU-REAL-01", gpu: 95, mem: 60, temp: 65, status: "active" }],
        })
      );
      act(() => {
        result.current.startDiagnosis();
      });
      await act(async () => {
        vi.advanceTimersByTime(700);
      });
      const s = result.current.session!;
      // 异常来自真实值：actualValue 恰为节点真实 GPU 95
      const gpuAnomaly = s.anomalies.find((a) => a.nodeId === "GPU-REAL-01" && a.metric === "GPU 利用率");
      expect(gpuAnomaly).toBeDefined();
      expect(gpuAnomaly!.actualValue).toBe(95);
      // 处置建议由真实异常驱动，且不模拟执行
      expect(s.actions.length).toBeGreaterThan(0);
      expect(s.actions.every((a) => a.autoExecutable === false)).toBe(true);
      expect(s.summary).toContain("规则分析");
    } finally {
      vi.useRealTimers();
    }
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

describe("useOperationCenter · 演示模式关闭", () => {
  it("executeAction 不执行模拟操作、不产生日志", async () => {
    const { result } = renderHook(() => useOperationCenter());
    const firstAction = result.current.allActions[0];
    await act(async () => {
      await result.current.executeAction(firstAction.id);
    });
    expect(result.current.isExecuting).toBeNull();
    expect(result.current.logs).toEqual([]);
  });

  it("操作日志为空（不展示模拟种子，含 allLogs）", () => {
    const { result } = renderHook(() => useOperationCenter());
    expect(result.current.logs).toEqual([]);
    expect(result.current.allLogs).toEqual([]);
  });
});

describe("useBigModelSDK · 演示模式关闭", () => {
  const unconfiguredModel: ConfiguredModel = {
    id: "model-off-1",
    providerId: "zhipu",
    providerLabel: "智谱 AI",
    model: "chatglm3",
    apiKey: "", // 空 apiKey 触发 mock 分支
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    createdAt: Date.now(),
    lastUsed: null,
    status: "active",
  };

  it("未配置模型时不返回编造数据，引导配置真实服务", async () => {
    const { result } = renderHook(() => useBigModelSDK());
    let content = "";
    await act(async () => {
      const res = await result.current.sendMessage(unconfiguredModel, "系统状态如何");
      content = res.content;
    });
    expect(content).toContain("未配置 API Key");
    // 不得包含 Mock 编造的系统指标
    expect(content).not.toContain("12/13");
    expect(content).not.toContain("78.5%");
  });

  it("连接测试不返回假阳性", async () => {
    const { result } = renderHook(() => useBigModelSDK());
    let res: { success: boolean; error?: string } | undefined;
    await act(async () => {
      res = await result.current.testConnection(unconfiguredModel);
    });
    expect(res?.success).toBe(false);
    expect(res?.error).toContain("未配置 API Key");
  });
});
