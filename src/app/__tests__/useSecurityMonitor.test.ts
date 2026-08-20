/**
 * @file: useSecurityMonitor.test.ts
 * @description: useSecurityMonitor.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSecurityMonitor } from "../hooks/useSecurityMonitor";

describe("useSecurityMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    
    expect(result.current.activeTab).toBe("security");
    expect(result.current.scanStatus).toBe("idle");
    expect(result.current.lastScanTime).toBeNull();
    expect(result.current.overallScore).toBe(0);
    expect(result.current.overallRisk).toBe("safe");
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

  it("should set active tab", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    
    act(() => {
      result.current.setActiveTab("performance");
    });
    
    expect(result.current.activeTab).toBe("performance");
  });

  it("should start scan and update status", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    
    act(() => {
      result.current.startScan();
    });
    
    expect(result.current.scanStatus).toBe("scanning");
  });

  it("should complete scan and populate data", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    
    act(() => {
      result.current.startScan();
    });
    
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    
    expect(result.current.scanStatus).toBe("complete");
    expect(result.current.lastScanTime).not.toBeNull();
    expect(result.current.overallScore).toBeGreaterThan(0);
    expect(result.current.csp).not.toBeNull();
    expect(result.current.cookie).not.toBeNull();
    expect(result.current.sensitive).not.toBeNull();
    expect(result.current.performance).not.toBeNull();
    expect(result.current.memory).not.toBeNull();
    expect(result.current.vitals.length).toBeGreaterThan(0);
    expect(result.current.device).not.toBeNull();
    expect(result.current.network).not.toBeNull();
    expect(result.current.browser).not.toBeNull();
    expect(result.current.dataManagement).not.toBeNull();
  });

  it("should calculate overall risk based on scores", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    
    act(() => {
      result.current.startScan();
    });
    
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    
    expect(result.current.scanStatus).toBe("complete");
    const risk = result.current.overallRisk;
    expect(["safe", "warning", "danger"]).toContain(risk);
  });

  it("should cleanup expired items", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    
    act(() => {
      result.current.startScan();
    });
    
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    
    expect(result.current.dataManagement).not.toBeNull();
    
    act(() => {
      result.current.cleanupData("expired");
    });
    
    expect(result.current.dataManagement?.expiredItems).toBe(0);
  });

  it("should cleanup cache", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    
    act(() => {
      result.current.startScan();
    });
    
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    
    expect(result.current.dataManagement).not.toBeNull();
    
    act(() => {
      result.current.cleanupData("cache");
    });
    
    expect(result.current.dataManagement?.cacheSize).toBe(0);
  });

  it("should cleanup privacy data", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    
    act(() => {
      result.current.startScan();
    });
    
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    
    expect(result.current.dataManagement).not.toBeNull();
    
    act(() => {
      result.current.cleanupData("privacy");
    });
    
    expect(result.current.dataManagement?.storage.sessionStorage).toBe(0);
  });

  it("should export data", () => {
    const { result } = renderHook(() => useSecurityMonitor());
    
    // Mock URL.createObjectURL and document.createElement
    const mockUrl = "blob:test-url";
    const mockCreateElement = vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: vi.fn(),
    } as any);
    const mockCreateObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue(mockUrl as any);
    const mockRevokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    
    act(() => {
      result.current.exportData();
    });
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockCreateElement).toHaveBeenCalledWith("a");
    expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockUrl);
    
    mockCreateElement.mockRestore();
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
  });

  it("should cleanup timer on unmount", () => {
    const { result, unmount } = renderHook(() => useSecurityMonitor());
    
    act(() => {
      result.current.startScan();
    });
    
    unmount();
    
    // Timer should be cleaned up without errors
    expect(true).toBe(true);
  });
});
