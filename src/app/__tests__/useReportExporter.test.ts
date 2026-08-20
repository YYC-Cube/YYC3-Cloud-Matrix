/**
 * @file: useReportExporter.test.ts
 * @description: useReportExporter.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-07
 * @updated: 2026-04-07
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReportExporter } from "../hooks/useReportExporter";

vi.mock("../hooks/usePersistedState", () => ({
  usePersistedList: vi.fn((key: string, initial: any) => {
    return {
      items: initial,
      prepend: vi.fn(),
      loaded: true,
    };
  }),
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

describe("useReportExporter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useReportExporter());

      expect(result.current.reportType).toBe("performance");
      expect(result.current.timeRange).toBe("24h");
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.report).toBeNull();
      expect(result.current.recentReports).toHaveLength(3);
      expect(result.current.reportsLoaded).toBe(true);
    });
  });

  describe("generateReport", () => {
    it("should generate performance report", () => {
      const { result } = renderHook(() => useReportExporter());

      expect(result.current.isGenerating).toBe(false);

      act(() => {
        result.current.generateReport();
      });

      expect(result.current.isGenerating).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.report).not.toBeNull();
      expect(result.current.report?.type).toBe("performance");
    });

    it("should generate security report", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setReportType("security");
      });

      act(() => {
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current.report?.type).toBe("security");
    });

    it("should generate audit report", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setReportType("audit");
      });

      act(() => {
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current.report?.type).toBe("audit");
    });

    it("should generate comprehensive report", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setReportType("comprehensive");
      });

      act(() => {
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current.report?.type).toBe("comprehensive");
    });

    it("should use custom time range", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setTimeRange("custom");
      });

      act(() => {
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current.report).not.toBeNull();
    });
  });

  describe("exportReport", () => {
    it("should export as JSON", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:url");
      const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
        href: "",
        download: "",
        click: vi.fn(),
      } as any);
      const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

      act(() => {
        result.current.exportReport("json");
      });

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:url");

      createObjectURLSpy.mockRestore();
      createElementSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it("should export as CSV", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:url");
      const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
        href: "",
        download: "",
        click: vi.fn(),
      } as any);
      const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

      act(() => {
        result.current.exportReport("csv");
      });

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:url");

      createObjectURLSpy.mockRestore();
      createElementSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it("should export as printable HTML", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const mockWin = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        location: { href: "" },
      } as any;
      const openSpy = vi.spyOn(window, "open").mockReturnValue(mockWin);

      act(() => {
        result.current.exportReport("print");
      });

      expect(openSpy).toHaveBeenCalledWith("", "_blank");

      openSpy.mockRestore();
    });

    it("should not export when no report generated", () => {
      const { result } = renderHook(() => useReportExporter());

      const createObjectURLSpy = vi.spyOn(URL, "createObjectURL");

      act(() => {
        result.current.exportReport("json");
      });

      expect(createObjectURLSpy).not.toHaveBeenCalled();

      createObjectURLSpy.mockRestore();
    });
  });

  describe("state updates", () => {
    it("should update report type", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setReportType("security");
      });

      expect(result.current.reportType).toBe("security");
    });

    it("should update time range", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setTimeRange("7d");
      });

      expect(result.current.timeRange).toBe("7d");
    });
  });

  describe("report data structure", () => {
    it("should generate report with correct structure", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const report = result.current.report;
      expect(report).toBeDefined();
      expect(report?.id).toMatch(/^rpt-\d+$/);
      expect(report?.title).toBeDefined();
      expect(report?.generatedAt).toBeGreaterThan(0);
      expect(report?.timeRange).toBeDefined();
      expect(report?.summary).toHaveLength(6);
      expect(report?.performanceHistory).toBeDefined();
      expect(report?.securityHistory).toBeDefined();
      expect(report?.recommendations).toBeDefined();
      expect(report?.nodeBreakdown).toHaveLength(5);
    });

    it("should generate performance history with correct data points", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setTimeRange("24h");
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const history = result.current.report?.performanceHistory;
      expect(history).toBeDefined();
      expect(history?.length).toBeGreaterThan(0);
      expect(history?.[0]).toHaveProperty("timestamp");
      expect(history?.[0]).toHaveProperty("cpuUsage");
      expect(history?.[0]).toHaveProperty("gpuUsage");
      expect(history?.[0]).toHaveProperty("memoryUsage");
      expect(history?.[0]).toHaveProperty("latencyP50");
      expect(history?.[0]).toHaveProperty("latencyP99");
      expect(history?.[0]).toHaveProperty("throughput");
      expect(history?.[0]).toHaveProperty("errorRate");
    });

    it("should generate security history with correct data points", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.generateReport();
      });

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const history = result.current.report?.securityHistory;
      expect(history).toBeDefined();
      expect(history?.length).toBeGreaterThan(0);
      expect(history?.[0]).toHaveProperty("timestamp");
      expect(history?.[0]).toHaveProperty("cspScore");
      expect(history?.[0]).toHaveProperty("cookieScore");
      expect(history?.[0]).toHaveProperty("sensitiveScore");
      expect(history?.[0]).toHaveProperty("overallScore");
      expect(history?.[0]).toHaveProperty("activeThreats");
    });
  });
});
