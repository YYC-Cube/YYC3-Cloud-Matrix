/**
 * @file: useLocalFileSystem.test.tsx
 * @description: useLocalFileSystem Hook 测试套件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-01
 * @updated: 2026-04-01
 * @status: active
 * @tags: [hook],[test]
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalFileSystem } from "../hooks/useLocalFileSystem";
import { useFSSlice } from "../store/slices/fs-slice";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("useLocalFileSystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useFSSlice.setState({
      fileTree: null,
      fileContents: {},
      recentFiles: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("初始化", () => {
    it("should initialize with default file tree", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.fileTree.length).toBeGreaterThan(0);
    });

    it("should initialize with root path", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.currentPath).toBe("~/.yyc3-cloudpivot");
    });

    it("should initialize with no selected file", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.selectedFile).toBeNull();
    });

    it("should provide breadcrumbs", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.breadcrumbs.length).toBeGreaterThanOrEqual(1);
      expect(result.current.breadcrumbs[0].path).toBe("~/.yyc3-cloudpivot");
    });

    it("should provide current items at root", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.currentItems.length).toBeGreaterThan(0);
    });

    it("should provide logs", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.allLogs.length).toBe(50);
    });

    it("should provide log sources", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.logSources.length).toBeGreaterThan(0);
    });
  });

  describe("导航", () => {
    it("should navigate to subdirectory", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.navigateTo("~/.yyc3-cloudpivot/logs");
      });

      expect(result.current.currentPath).toBe("~/.yyc3-cloudpivot/logs");
    });

    it("should clear selected file on navigate", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.navigateTo("~/.yyc3-cloudpivot/logs");
      });

      expect(result.current.selectedFile).toBeNull();
    });

    it("should go up one directory", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.navigateTo("~/.yyc3-cloudpivot/logs");
      });

      act(() => {
        result.current.goUp();
      });

      expect(result.current.currentPath).toBe("~/.yyc3-cloudpivot");
    });

    it("should not go up from root", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.goUp();
      });

      expect(result.current.currentPath).toBe("~/.yyc3-cloudpivot");
    });

    it("should select directory and navigate", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      const dir = result.current.currentItems.find((item) => item.type === "directory");

      if (dir) {
        act(() => {
          result.current.selectFile(dir);
        });
        expect(result.current.currentPath).toBe(dir.path);
      }
    });

    it("should select file", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.navigateTo("~/.yyc3-cloudpivot/logs/system");
      });

      const file = result.current.currentItems.find((item) => item.type === "file");
      if (file) {
        act(() => {
          result.current.selectFile(file);
        });
        expect(result.current.selectedFile?.id).toBe(file.id);
      }
    });
  });

  describe("CRUD 操作", () => {
    it("should add a file", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.addFile("~/.yyc3-cloudpivot", "test.ts", "ts");
      });

      const found = result.current.currentItems.find((item) => item.name === "test.ts");
      expect(found).toBeDefined();
      expect(found?.type).toBe("file");
    });

    it("should add a directory", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.addDirectory("~/.yyc3-cloudpivot", "new-dir");
      });

      const found = result.current.currentItems.find((item) => item.name === "new-dir");
      expect(found).toBeDefined();
      expect(found?.type).toBe("directory");
    });

    it("should rename an item", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.addFile("~/.yyc3-cloudpivot", "old-name.txt", "txt");
      });

      const file = result.current.currentItems.find((item) => item.name === "old-name.txt");
      if (file) {
        act(() => {
          result.current.renameItem(file.id, "new-name.txt");
        });
        expect(result.current.currentItems.find((item) => item.name === "new-name.txt")).toBeDefined();
      }
    });

    it("should return false when renaming non-existent item", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      let renamed = false;
      act(() => {
        renamed = result.current.renameItem("non-existent-id", "new.txt");
      });
      expect(renamed).toBe(false);
    });

    it("should delete an item", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.addFile("~/.yyc3-cloudpivot", "to-delete.txt", "txt");
      });

      const file = result.current.currentItems.find((item) => item.name === "to-delete.txt");
      if (file) {
        act(() => {
          result.current.deleteItem(file.id);
        });
        expect(result.current.currentItems.find((item) => item.name === "to-delete.txt")).toBeUndefined();
      }
    });

    it("should return false when deleting non-existent item", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      let deleted = false;
      act(() => {
        deleted = result.current.deleteItem("non-existent-id");
      });
      expect(deleted).toBe(false);
    });

    it("should batch delete items", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.addFile("~/.yyc3-cloudpivot", "batch1.txt", "txt");
        result.current.addFile("~/.yyc3-cloudpivot", "batch2.txt", "txt");
      });

      const files = result.current.currentItems.filter((item) => item.name.startsWith("batch"));
      const ids = files.map((f) => f.id);

      act(() => {
        result.current.deleteBatch(ids);
      });

      expect(result.current.currentItems.find((item) => item.name.startsWith("batch"))).toBeUndefined();
    });

    it("should reset file tree", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.addFile("~/.yyc3-cloudpivot", "temp.txt", "txt");
      });

      act(() => {
        result.current.resetFileTree();
      });

      expect(result.current.currentItems.find((item) => item.name === "temp.txt")).toBeUndefined();
    });
  });

  describe("导入导出", () => {
    it("should export file tree as JSON", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      let exported: string | undefined;
      act(() => {
        exported = result.current.exportFileTree();
      });

      expect(exported).toBeDefined();
      const parsed = JSON.parse(exported!);
      expect(parsed._type).toBe("file-tree");
      expect(Array.isArray(parsed.tree)).toBe(true);
    });

    it("should import valid file tree JSON", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      const json = JSON.stringify({ tree: [{ id: "f-1", name: "imported.txt", type: "file", path: "~/.yyc3-cloudpivot/imported.txt", size: 0, modifiedAt: Date.now() }] });

      let imported = false;
      act(() => {
        imported = result.current.importFileTree(json);
      });

      expect(imported).toBe(true);
    });

    it("should fail to import invalid JSON", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      let imported = false;
      act(() => {
        imported = result.current.importFileTree("not json");
      });

      expect(imported).toBe(false);
    });
  });

  describe("日志过滤", () => {
    it("should filter logs by level", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.setLogLevelFilter("error");
      });

      expect(result.current.logs.every((l) => l.level === "error")).toBe(true);
    });

    it("should filter logs by source", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      const source = result.current.logSources[0];

      if (source) {
        act(() => {
          result.current.setLogSourceFilter(source);
        });

        expect(result.current.logs.every((l) => l.source === source)).toBe(true);
      }
    });

    it("should filter logs by search query", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.setLogSearchQuery("GPU");
      });

      expect(result.current.logs.every((l) => l.message.toLowerCase().includes("gpu") || l.source.toLowerCase().includes("gpu"))).toBe(true);
    });

    it("should reset log filter to all", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.setLogLevelFilter("error");
        result.current.setLogLevelFilter("all");
      });

      expect(result.current.logs.length).toBe(50);
    });
  });

  describe("文件内容", () => {
    it("should get file content for json file", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.navigateTo("~/.yyc3-cloudpivot/logs/node/GPU-A100-01");
      });

      const file = result.current.currentItems.find((item) => item.extension === "json");
      if (file) {
        let content = "";
        act(() => {
          content = result.current.getFileContent(file.id);
        });
        expect(content).toContain("yyc3-matrix");
      }
    });

    it("should get file content for log file", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.navigateTo("~/.yyc3-cloudpivot/logs/node/GPU-A100-01");
      });

      const file = result.current.currentItems.find((item) => item.extension === "log");
      if (file) {
        let content = "";
        act(() => {
          content = result.current.getFileContent(file.id);
        });
        expect(content).toContain("INFO");
      }
    });

    it("should return empty string for non-existent file", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      let content = "";
      act(() => {
        content = result.current.getFileContent("non-existent-id");
      });
      expect(content).toBe("");
    });

    it("should save file content", () => {
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.addFile("~/.yyc3-cloudpivot", "editable.txt", "txt");
      });

      const file = result.current.currentItems.find((item) => item.name === "editable.txt");
      if (file) {
        act(() => {
          result.current.saveFileContent(file.id, "new content");
        });
        expect(result.current.getFileContent(file.id)).toBe("new content");
      }
    });
  });

  describe("工具函数", () => {
    it("should format size in bytes", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.formatSize(500)).toBe("500B");
    });

    it("should format size in KB", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.formatSize(2048)).toBe("2.0KB");
    });

    it("should format size in MB", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.formatSize(1048576)).toBe("1.0MB");
    });

    it("should format size for undefined", () => {
      const { result } = renderHook(() => useLocalFileSystem());
      expect(result.current.formatSize(undefined)).toBe("--");
    });

    it("should call downloadLogs", async () => {
      const { toast } = await import("sonner");
      const { result } = renderHook(() => useLocalFileSystem());

      act(() => {
        result.current.downloadLogs();
      });

      expect(toast.success).toHaveBeenCalled();
    });
  });
});
