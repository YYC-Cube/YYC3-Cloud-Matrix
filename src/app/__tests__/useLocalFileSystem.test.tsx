/**
 * @file: useLocalFileSystem.test.tsx
 * @description: useLocalFileSystem Hook 测试套件（v2 全真版）
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-01
 * @updated: 2026-11-11
 * @status: active
 * @tags: [hook],[test]
 *
 * @brief: 覆盖 agent 文件浏览（mock fetch）、log-slice 日志过滤、
 * 真实报告生成、快速操作；零假种子 — agent 不可达时一律空态/失败，
 * 绝不回退虚构数据。
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocalFileSystem, AGENT_FS_ROOT_LABEL } from "../hooks/useLocalFileSystem";
import { useFSSlice } from "../store/slices/fs-slice";
import { useLogSlice } from "../store/slices/log-slice";
import { useNodeSlice } from "../store/slices/node-slice";
import { useFollowUpSlice } from "../store/slices/follow-up-slice";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

const DIR_LISTING = {
  ok: true,
  type: "dir",
  entries: [
    { name: "subdir", type: "directory", modifiedAt: 1700000000000 },
    { name: "alert-rules.json", type: "file", size: 480, modifiedAt: 1700000001000 },
    { name: "notes.txt", type: "file", size: 64, modifiedAt: 1700000002000 },
  ],
};

function mockFetchOnce(payload: unknown, ok = true, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(payload),
  }));
}

describe("useLocalFileSystem (v2 全真)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    useFSSlice.setState({ fileTree: null, fileContents: {}, recentFiles: [] });
    useLogSlice.setState({ logs: [] });
    useFollowUpSlice.setState({ followUps: [] });
    useNodeSlice.getState().setNodes([], "initialization");
    useSettingsSSOT.getState().updateValue("wsToken", "");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------
  // 初始化（零假种子）
  // ----------------------------------------------------------

  describe("初始化", () => {
    it("应以 agent 根目录为起点", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.currentPath).toBe(AGENT_FS_ROOT_LABEL);
    });

    it("无令牌时文件列表为空且不回退假数据", async () => {
      const { result } = renderHook(() => useLocalFileSystem());
      await waitFor(() => expect(result.current.agentReachable).toBe(false));
      expect(result.current.currentItems).toEqual([]);
    });

    it("初始无选中文件", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.selectedFile).toBeNull();
    });

    it("面包屑首项为 agent 根", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.breadcrumbs[0].path).toBe(AGENT_FS_ROOT_LABEL);
    });

    it("挂载时清除历史假文件树残留", () => {
      useFSSlice.setState({
        fileTree: [{ id: "d-fake", name: "logs", type: "directory", path: "~/.yyc3-cloudpivot/logs", modifiedAt: 0 }],
        fileContents: { "f-fake": "fake" },
      });
      renderHook(() => useLocalFileSystem());
      expect(useFSSlice.getState().fileTree).toBeNull();
      expect(useFSSlice.getState().fileContents).toEqual({});
    });
  });

  // ----------------------------------------------------------
  // agent 文件浏览（mock fetch）
  // ----------------------------------------------------------

  describe("agent 文件浏览", () => {
    it("配置令牌后拉取真实目录列表", async () => {
      useSettingsSSOT.getState().updateValue("wsToken", "test-token");
      mockFetchOnce(DIR_LISTING);
      const { result } = renderHook(() => useLocalFileSystem());

      await waitFor(() => expect(result.current.currentItems.length).toBe(3));
      expect(result.current.agentReachable).toBe(true);
      expect(result.current.currentItems[0].name).toBe("subdir");
      expect(result.current.currentItems[1].extension).toBe("json");
      expect(result.current.currentItems[1].id).toBe(`${AGENT_FS_ROOT_LABEL}/alert-rules.json`);
    });

    it("agent 网络失败时为空态且标记不可达", async () => {
      useSettingsSSOT.getState().updateValue("wsToken", "test-token");
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
      const { result } = renderHook(() => useLocalFileSystem());

      await waitFor(() => expect(result.current.agentReachable).toBe(false));
      expect(result.current.currentItems).toEqual([]);
    });

    it("getFileContent 读取 agent 真实内容", async () => {
      useSettingsSSOT.getState().updateValue("wsToken", "test-token");
      mockFetchOnce({ ok: true, content: "{\"rules\":[]}", size: 12, modifiedAt: 1, truncated: false });
      const { result } = renderHook(() => useLocalFileSystem());

      let content = "";
      await act(async () => {
        content = await result.current.getFileContent(`${AGENT_FS_ROOT_LABEL}/alert-rules.json`);
      });
      expect(content).toBe("{\"rules\":[]}");
    });

    it("agent 不可达时 getFileContent 返回空串", async () => {
      const { result } = renderHook(() => useLocalFileSystem());
      let content = "x";
      await act(async () => {
        content = await result.current.getFileContent(`${AGENT_FS_ROOT_LABEL}/any.json`);
      });
      expect(content).toBe("");
    });

    it("saveFileContent 成功写回并刷新列表", async () => {
      const { toast } = await import("sonner");
      useSettingsSSOT.getState().updateValue("wsToken", "test-token");
      // 按请求方法路由：PUT → 写入响应；其余（挂载/刷新列表）→ 目录列表
      const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        if (init?.method === "PUT") {
          return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ ok: true, size: 5, modifiedAt: 2 }) });
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(DIR_LISTING) });
      });
      vi.stubGlobal("fetch", fetchMock);
      const { result } = renderHook(() => useLocalFileSystem());

      let ok = false;
      await act(async () => {
        ok = await result.current.saveFileContent(`${AGENT_FS_ROOT_LABEL}/notes.txt`, "hello");
      });
      expect(ok).toBe(true);
      expect(toast.success).toHaveBeenCalledWith("文件已保存");
      // PUT 请求体携带相对路径
      const putCall = fetchMock.mock.calls.find((c) => (c[1] as RequestInit | undefined)?.method === "PUT");
      expect(putCall).toBeDefined();
      expect(String(putCall![0])).toContain("/files/content");
      expect(JSON.parse(String((putCall![1] as RequestInit).body))).toEqual({ path: "notes.txt", content: "hello" });
    });

    it("agent 不可达时 saveFileContent 返回 false", async () => {
      const { toast } = await import("sonner");
      const { result } = renderHook(() => useLocalFileSystem());
      let ok = true;
      await act(async () => {
        ok = await result.current.saveFileContent(`${AGENT_FS_ROOT_LABEL}/x.txt`, "c");
      });
      expect(ok).toBe(false);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 导航
  // ----------------------------------------------------------

  describe("导航", () => {
    it("navigateTo 更新当前路径", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { result.current.navigateTo(`${AGENT_FS_ROOT_LABEL}/subdir`); });
      expect(result.current.currentPath).toBe(`${AGENT_FS_ROOT_LABEL}/subdir`);
    });

    it("goUp 返回上级目录", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { result.current.navigateTo(`${AGENT_FS_ROOT_LABEL}/subdir`); });
      act(() => { result.current.goUp(); });
      expect(result.current.currentPath).toBe(AGENT_FS_ROOT_LABEL);
    });

    it("根目录不可再向上", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { result.current.goUp(); });
      expect(result.current.currentPath).toBe(AGENT_FS_ROOT_LABEL);
    });

    it("选中目录条目时进入该目录", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => {
        result.current.selectFile({
          id: `${AGENT_FS_ROOT_LABEL}/subdir`, name: "subdir", type: "directory",
          path: `${AGENT_FS_ROOT_LABEL}/subdir`, modifiedAt: 0,
        });
      });
      expect(result.current.currentPath).toBe(`${AGENT_FS_ROOT_LABEL}/subdir`);
      expect(result.current.selectedFile).toBeNull();
    });

    it("选中文件条目时设为当前文件", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      const file = {
        id: `${AGENT_FS_ROOT_LABEL}/notes.txt`, name: "notes.txt", type: "file" as const,
        path: `${AGENT_FS_ROOT_LABEL}/notes.txt`, modifiedAt: 0,
      };
      act(() => { result.current.selectFile(file); });
      expect(result.current.selectedFile?.id).toBe(file.id);
    });
  });

  // ----------------------------------------------------------
  // 日志过滤（log-slice SSOT）
  // ----------------------------------------------------------

  describe("日志过滤", () => {
    function seedLogs() {
      const { addLog } = useLogSlice.getState();
      addLog({ timestamp: 1, level: "info", source: "agent", message: "节点心跳正常" });
      addLog({ timestamp: 2, level: "error", source: "agent", message: "GPU 温度超限" });
      addLog({ timestamp: 3, level: "warn", source: "patrol", message: "磁盘接近阈值" });
    }

    it("日志来自 log-slice 而非内置假数据", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.allLogs).toEqual([]);
      act(() => { seedLogs(); });
      expect(result.current.allLogs.length).toBe(3);
    });

    it("按级别过滤", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { seedLogs(); });
      act(() => { result.current.setLogLevelFilter("error"); });
      expect(result.current.logs.every((l) => l.level === "error")).toBe(true);
      expect(result.current.logs.length).toBe(1);
    });

    it("按来源过滤", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { seedLogs(); });
      act(() => { result.current.setLogSourceFilter("patrol"); });
      expect(result.current.logs.every((l) => l.source === "patrol")).toBe(true);
    });

    it("按关键词过滤", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { seedLogs(); });
      act(() => { result.current.setLogSearchQuery("GPU"); });
      expect(result.current.logs.length).toBe(1);
      expect(result.current.logs[0].message).toContain("GPU");
    });

    it("logSources 来自真实日志", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { seedLogs(); });
      expect(result.current.logSources.sort()).toEqual(["agent", "patrol"]);
    });
  });

  // ----------------------------------------------------------
  // 报告生成（真实 slice 统计）
  // ----------------------------------------------------------

  describe("报告生成", () => {
    function seedRealData() {
      useNodeSlice.getState().setNodes([
        { id: "NODE-1", status: "active", gpu: 60, mem: 50, temp: 55, model: "m1", tasks: 10 },
        { id: "NODE-2", status: "warning", gpu: 90, mem: 80, temp: 78, model: "m2", tasks: 5 },
      ], "initialization");
      useFollowUpSlice.getState().addFollowUp({
        taskId: "T-1", taskName: "处理告警", assignee: "system", assigneeName: "agent",
        priority: "high", status: "pending", dueDate: Date.now(), notes: "", category: "maintenance",
        updatedAt: Date.now(),
      });
      useLogSlice.getState().addLog({ timestamp: 1, level: "error", source: "agent", message: "err" });
    }

    it("JSON 报告包含真实节点与统计", async () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { seedRealData(); });

      let report: Awaited<ReturnType<typeof result.current.generateReport>> | undefined;
      await act(async () => {
        report = await result.current.generateReport({ type: "performance", format: "json", dateRange: "today", includeCharts: false, includeRawData: true });
      });

      const parsed = JSON.parse(report!.previewContent);
      expect(parsed.summary.nodes).toBe("2/2");
      expect(parsed.summary.avgGpu).toBe(75);
      expect(parsed.summary.pendingFollowUps).toBe(1);
      expect(parsed.summary.errorLogs).toBe(1);
      expect(parsed.nodes.map((n: { id: string }) => n.id)).toEqual(["NODE-1", "NODE-2"]);
    });

    it("Markdown 报告含真实节点行", async () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { seedRealData(); });

      let report: Awaited<ReturnType<typeof result.current.generateReport>> | undefined;
      await act(async () => {
        report = await result.current.generateReport({ type: "health", format: "markdown", dateRange: "week", includeCharts: false, includeRawData: false });
      });

      expect(report!.previewContent).toContain("NODE-1");
      expect(report!.previewContent).toContain("⚠️ NODE-2");
      expect(report!.filename).toMatch(/\.md$/);
    });

    it("CSV 报告含真实表头与节点行", async () => {
      const { result } = renderHook(() => useLocalFileSystem());
      act(() => { seedRealData(); });

      let report: Awaited<ReturnType<typeof result.current.generateReport>> | undefined;
      await act(async () => {
        report = await result.current.generateReport({ type: "custom", format: "csv", dateRange: "month", includeCharts: false, includeRawData: true });
      });

      expect(report!.previewContent).toContain("node,status,gpu,mem,temp,model,tasks");
      expect(report!.previewContent).toContain("NODE-1,active,60,50,55,m1,10");
    });
  });

  // ----------------------------------------------------------
  // 快速操作
  // ----------------------------------------------------------

  describe("快速操作", () => {
    beforeEach(() => {
      vi.stubGlobal("URL", Object.assign(URL, {
        createObjectURL: vi.fn(() => "blob:mock"),
        revokeObjectURL: vi.fn(),
      }));
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    });

    it("downloadLogs 导出真实日志 JSON", async () => {
      const { toast } = await import("sonner");
      useLogSlice.getState().addLog({ timestamp: 1, level: "info", source: "agent", message: "hello" });
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => { result.current.downloadLogs(); });
      expect(toast.success).toHaveBeenCalledWith("已导出 1 条日志");
    });

    it("clearCache 清空推理缓存与会话存储", async () => {
      const { toast } = await import("sonner");
      sessionStorage.setItem("tmp", "1");
      const { result } = renderHook(() => useLocalFileSystem());

      await act(async () => { await result.current.clearCache(); });
      expect(sessionStorage.getItem("tmp")).toBeNull();
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("缓存已清理"));
    });
  });

  // ----------------------------------------------------------
  // 工具函数
  // ----------------------------------------------------------

  describe("formatSize", () => {
    it("字节级", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.formatSize(500)).toBe("500B");
    });

    it("KB 级", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.formatSize(2048)).toBe("2.0KB");
    });

    it("MB 级", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.formatSize(1048576)).toBe("1.0MB");
    });

    it("undefined 显示占位", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.formatSize(undefined)).toBe("--");
    });
  });
});
