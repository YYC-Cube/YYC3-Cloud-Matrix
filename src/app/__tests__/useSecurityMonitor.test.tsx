/**
 * @file: useSecurityMonitor.test.tsx
 * @description: useSecurityMonitor 测试 · 真实采集语义（demoMode 关闭）+ 演示分支
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-03-31
 * @updated: 2026-11-14
 * @status: active
 * @tags: [component],[real-data]
 */

// @vitest-environment jsdom

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useSecurityMonitor } from "../hooks/useSecurityMonitor";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";

/** 执行一次完整扫描（startScan 已改为 async 真实采集） */
async function runScan(result: { current: ReturnType<typeof useSecurityMonitor> }) {
  await act(async () => {
    await result.current.startScan();
  });
}

describe("useSecurityMonitor（真实采集路径 · demoMode 关闭）", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useSettingsSSOT.setState((s) => ({ toggles: { ...s.toggles, demoMode: false } }));
  });

  it("initializes with idle state", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    expect(result.current.scanStatus).toBe("idle");
    expect(result.current.activeTab).toBe("security");
    expect(result.current.lastScanTime).toBeNull();
    expect(result.current.csp).toBeNull();
    expect(result.current.cookie).toBeNull();
    expect(result.current.sensitive).toBeNull();
    expect(result.current.performance).toBeNull();
    expect(result.current.memory).toBeNull();
    expect(result.current.vitals).toEqual([]);
    expect(result.current.device).toBeNull();
    expect(result.current.network).toBeNull();
    expect(result.current.browser).toBeNull();
    expect(result.current.dataManagement).toBeNull();
  });

  it("switches active tab", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    act(() => { result.current.setActiveTab("performance"); });
    expect(result.current.activeTab).toBe("performance");
    act(() => { result.current.setActiveTab("diagnostics"); });
    expect(result.current.activeTab).toBe("diagnostics");
    act(() => { result.current.setActiveTab("dataManagement"); });
    expect(result.current.activeTab).toBe("dataManagement");
  });

  it("starts scan and transitions through scanning to complete", async () => {
    const { result } = renderHook(() => useSecurityMonitor());

    let scanPromise: Promise<void> | undefined;
    act(() => {
      scanPromise = result.current.startScan();
    });
    expect(result.current.scanStatus).toBe("scanning");

    await act(async () => {
      await scanPromise;
    });
    expect(result.current.scanStatus).toBe("complete");
    expect(result.current.lastScanTime).not.toBeNull();
  });

  it("populates all result fields from real browser APIs", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    expect(result.current.csp).not.toBeNull();
    expect(result.current.cookie).not.toBeNull();
    expect(result.current.sensitive).not.toBeNull();
    expect(result.current.performance).not.toBeNull();
    expect(result.current.memory).not.toBeNull();
    expect(result.current.device).not.toBeNull();
    expect(result.current.network).not.toBeNull();
    expect(result.current.browser).not.toBeNull();
    expect(result.current.browser!.features.length).toBeGreaterThan(0);
    expect(result.current.dataManagement).not.toBeNull();
  });

  it("CSP: 无 meta 声明时如实标注并提示响应头不可读", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    const csp = result.current.csp!;
    expect(csp.enabled).toBe(false);
    expect(csp.directives).toEqual([]);
    expect(csp.recommendations.some((r) => r.includes("响应头"))).toBe(true);
    expect(csp.score).toBe(0);
  });

  it("CSP: 解析真实 meta 标签并标记 unsafe-inline 风险", async () => {
    const meta = document.createElement("meta");
    meta.setAttribute("http-equiv", "Content-Security-Policy");
    meta.setAttribute("content", "default-src 'self'; script-src 'self' 'unsafe-inline'");
    document.head.appendChild(meta);

    try {
      const { result } = renderHook(() => useSecurityMonitor());
      await runScan(result);

      const csp = result.current.csp!;
      expect(csp.enabled).toBe(true);
      expect(csp.directives).toHaveLength(2);
      expect(csp.directives.find((d) => d.name === "script-src")?.status).toBe("warn");
      expect(csp.directives.find((d) => d.name === "default-src")?.status).toBe("pass");
      expect(csp.inlineBlocked).toBe(false);
      expect(csp.score).toBe(85); // 100 - 1 warn × 15
    } finally {
      meta.remove();
    }
  });

  it("Cookie: 仅可统计数量，属性审计如实标注不可读且不参与总评", async () => {
    document.cookie = "test_cookie=1";
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    const cookie = result.current.cookie!;
    expect(cookie.count).toBeGreaterThanOrEqual(1);
    expect(cookie.checks.some((c) => c.detail.includes("不可读"))).toBe(true);
    expect(cookie.score).toBe(-1); // 不参与总评
  });

  it("敏感数据: 真实枚举存储键并按名称启发式标记风险", async () => {
    localStorage.setItem("yyc3_theme", "dark");
    localStorage.setItem("api_token_backup", "should-be-flagged");
    sessionStorage.setItem("session_cache", "ok");

    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    const sensitive = result.current.sensitive!;
    const flagged = sensitive.localStorage.find((e) => e.key === "api_token_backup");
    expect(flagged?.risk).toBe("warning");
    const safeEntry = sensitive.localStorage.find((e) => e.key === "yyc3_theme");
    expect(safeEntry?.risk).toBe("safe");
    const sessionEntry = sensitive.sessionStorage.find((e) => e.key === "session_cache");
    expect(sessionEntry?.risk).toBe("safe");
    expect(sensitive.totalRisks).toBe(1);
    expect(sensitive.score).toBe(90); // 100 - 1 warning × 10
  });

  it("内存: DOM 节点数为真实统计，listeners/timers 不可测输出 -1", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    const mem = result.current.memory!;
    expect(mem.domNodes).toBeGreaterThan(0);
    expect(mem.domNodes).toBe(document.querySelectorAll("*").length);
    expect(mem.listeners).toBe(-1);
    expect(mem.timers).toBe(-1);
    expect(mem.trend).toHaveLength(1);
  });

  it("设备信息: 全部真实采集，无模拟 GPU 字符串", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    const device = result.current.device!;
    expect(typeof device.cpuCores).toBe("number");
    expect(typeof device.touchSupport).toBe("boolean");
    expect(device.screen).toMatch(/\d+x\d+/);
    expect(device.pixelRatio).toBeGreaterThan(0);
    expect(device.gpu).not.toContain("Simulated");
    expect(device.userAgent).toBe(navigator.userAgent);
  });

  it("网络信息: navigator.onLine 为真实在线状态", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    expect(result.current.network!.isStable).toBe(navigator.onLine);
  });

  it("浏览器特性: 真实探测结果与 jsdom 环境一致", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    const browser = result.current.browser!;
    expect(browser.name).toBeTruthy();
    expect(browser.version).toBeTruthy();
    const ws = browser.features.find((f) => f.name === "WebSocket");
    expect(ws?.supported).toBe("WebSocket" in window);
    const idb = browser.features.find((f) => f.name === "IndexedDB");
    expect(idb?.supported).toBe("indexedDB" in window);
    browser.features.forEach((f) => {
      expect(typeof f.supported).toBe("boolean");
      expect(f.name).toBeTruthy();
    });
  });

  it("数据管理: localStorage 体积为真实实算", async () => {
    localStorage.setItem("probe_key", "x".repeat(100));
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    const dm = result.current.dataManagement!;
    // "probe_key"(9) + 100 字符 = 109 × 2 字节
    expect(dm.storage.localStorage).toBeGreaterThanOrEqual(218);
    expect(dm.storage.total).toBeGreaterThanOrEqual(dm.storage.localStorage);
    expect(dm.expiredItems).toBe(0); // 无 TTL 体系，如实为 0
  });

  it("总评: 仅对有真实评分能力的项求均值，范围 0-100", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    expect(result.current.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.current.overallScore).toBeLessThanOrEqual(100);
    expect(["safe", "warning", "danger"]).toContain(result.current.overallRisk);
    // cookie.score = -1 不参与总评：均值 = (csp + sensitive) / 2
    const expected = Math.round((result.current.csp!.score + result.current.sensitive!.score) / 2);
    expect(result.current.overallScore).toBe(expected);
  });

  it("cleanupData(privacy): 真实清空 sessionStorage 并重算体积", async () => {
    sessionStorage.setItem("privacy_item", "sensitive-session-data");
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);
    expect(result.current.dataManagement!.storage.sessionStorage).toBeGreaterThan(0);

    await act(async () => {
      await result.current.cleanupData("privacy");
    });
    expect(sessionStorage.length).toBe(0);
    expect(result.current.dataManagement!.storage.sessionStorage).toBe(0);
  });

  it("cleanupData(cache): 无 Cache API 时如实为 0", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    await act(async () => {
      await result.current.cleanupData("cache");
    });
    expect(result.current.dataManagement!.cacheSize).toBe(0);
    expect(result.current.dataManagement!.storage.cacheAPI).toBe(0);
  });

  it("cleanupData(expired): 无 TTL 体系，保持 0", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    await act(async () => {
      await result.current.cleanupData("expired");
    });
    expect(result.current.dataManagement!.expiredItems).toBe(0);
  });

  it("Web Vitals: 仅产出真实可回溯指标，评级合法", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    result.current.vitals.forEach((v) => {
      expect(["good", "needs-improvement", "poor"]).toContain(v.rating);
      expect(v.value).toBeGreaterThanOrEqual(0);
      expect(v.name).toBeTruthy();
      expect(v.target).toBeTruthy();
    });
  });
});

describe("useSecurityMonitor（演示分支 · demoMode 开启）", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useSettingsSSOT.setState((s) => ({ toggles: { ...s.toggles, demoMode: true } }));
  });

  it("demoMode 开启时使用演示数据生成器", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    await runScan(result);

    expect(result.current.scanStatus).toBe("complete");
    expect(result.current.csp!.enabled).toBe(true);
    expect(result.current.csp!.directives.length).toBeGreaterThan(0);
    expect(result.current.cookie!.score).toBeGreaterThan(0);
    expect(result.current.memory!.listeners).toBeGreaterThan(0); // 演示值
    expect(result.current.vitals.length).toBeGreaterThan(0);
    expect(result.current.overallScore).toBeGreaterThan(0);
  });

  it("演示分支关闭后恢复真实采集", async () => {
    const { result } = renderHook(() => useSecurityMonitor());
    act(() => {
      useSettingsSSOT.setState((s) => ({ toggles: { ...s.toggles, demoMode: false } }));
    });
    await runScan(result);

    // 真实路径：listeners 不可测
    expect(result.current.memory!.listeners).toBe(-1);
    expect(result.current.cookie!.score).toBe(-1);
  });
});
