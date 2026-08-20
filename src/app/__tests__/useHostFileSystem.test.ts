/**
 * @file: useHostFileSystem.test.ts
 * @description: useHostFileSystem.test.ts description
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
import { useHostFileSystem, getExtension, formatSize, isTextFile, isImageFile } from "../hooks/useHostFileSystem";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../lib/yyc3-storage", () => ({
  idbPut: vi.fn(),
  idbGetAll: vi.fn(() => []),
  idbDelete: vi.fn(),
  idbPutMany: vi.fn(),
}));

vi.mock("../lib/api-config", () => ({
  getAPIConfig: vi.fn(() => ({
    fsBase: "http://localhost:3000/api/fs",
    enableBackend: false,
  })),
}));

describe("useHostFileSystem utilities", () => {
  it("should get file extension", () => {
    expect(getExtension("test.txt")).toBe("txt");
    expect(getExtension("document.pdf")).toBe("pdf");
    expect(getExtension("image.png")).toBe("png");
    expect(getExtension("noextension")).toBe("");
    expect(getExtension(".hidden")).toBe("");
  });

  it("should format file size", () => {
    expect(formatSize(100)).toBe("100 B");
    expect(formatSize(2048)).toBe("2.0 KB");
    expect(formatSize(1048576)).toBe("1.0 MB");
    expect(formatSize(1073741824)).toBe("1.00 GB");
  });

  it("should detect text files", () => {
    expect(isTextFile("test.txt")).toBe(true);
    expect(isTextFile("code.js")).toBe(true);
    expect(isTextFile("style.css")).toBe(true);
    expect(isTextFile("data.json")).toBe(true);
    expect(isTextFile("README")).toBe(true);
    expect(isTextFile("Dockerfile")).toBe(true);
    expect(isTextFile("image.png")).toBe(false);
    expect(isTextFile("video.mp4")).toBe(false);
  });

  it("should detect image files", () => {
    expect(isImageFile("image.png")).toBe(true);
    expect(isImageFile("photo.jpg")).toBe(true);
    expect(isImageFile("graphic.svg")).toBe(true);
    expect(isImageFile("document.pdf")).toBe(false);
    expect(isImageFile("video.mp4")).toBe(false);
  });
});

describe("useHostFileSystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    expect(result.current.supported).toBeDefined();
    expect(result.current.rootHandle).toBeNull();
    expect(result.current.rootName).toBe("");
    expect(result.current.entries).toEqual([]);
    expect(result.current.currentPath).toEqual([]);
    expect(result.current.selectedEntry).toBeNull();
    expect(result.current.editingContent).toBeNull();
    expect(result.current.editingDirty).toBe(false);
    expect(result.current.versions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.searchQuery).toBe("");
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.searching).toBe(false);
    expect(result.current.recentFiles).toEqual([]);
    expect(result.current.imagePreviewUrl).toBeNull();
  });

  it("should calculate stats correctly", () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    expect(result.current.stats.totalEntries).toBe(0);
    expect(result.current.stats.dirs).toBe(0);
    expect(result.current.stats.files).toBe(0);
    expect(result.current.stats.totalSize).toBe(0);
    expect(result.current.stats.totalVersions).toBe(0);
  });

  it("should generate breadcrumbs", () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    expect(result.current.breadcrumbs).toEqual(["根目录"]);
  });

  it("should get current file versions", () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    expect(result.current.currentFileVersions).toEqual([]);
  });

  it("should set search query via searchFiles", async () => {
    const { result } = renderHook(() => useHostFileSystem());

    await act(async () => {
      await result.current.searchFiles("test");
    });

    expect(result.current.searchQuery).toBe("test");
  });

  it("should set selected entry", () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    const mockEntry = {
      id: "test-id",
      name: "test.txt",
      kind: "file" as const,
      path: "/test.txt",
      size: 100,
      lastModified: Date.now(),
    };
    
    act(() => {
      result.current.setSelectedEntry(mockEntry);
    });
    
    expect(result.current.selectedEntry).toEqual(mockEntry);
  });

  it("should set editing content", () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    act(() => {
      result.current.setEditingContent("test content");
    });
    
    expect(result.current.editingContent).toBe("test content");
    expect(result.current.editingDirty).toBe(true);
  });

  it("should navigate up when no path", () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    act(() => {
      result.current.navigateUp();
    });
    
    // Should not throw error
    expect(result.current.currentPath).toEqual([]);
  });

  it("should navigate to breadcrumb", () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    act(() => {
      result.current.navigateToBreadcrumb(0);
    });
    
    // Should not throw error
    expect(result.current.currentPath).toEqual([]);
  });

  it("should refresh current directory", async () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    await act(async () => {
      await result.current.refreshCurrentDir();
    });
    
    // Should not throw error
    expect(result.current.entries).toEqual([]);
  });

  it("should handle delete version", async () => {
    const { result } = renderHook(() => useHostFileSystem());
    
    await act(async () => {
      await result.current.deleteVersion("test-version-id");
    });
    
    // Should not throw error
    expect(result.current.versions).toEqual([]);
  });
});
