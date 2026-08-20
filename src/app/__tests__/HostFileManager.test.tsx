/**
 * @file: HostFileManager.test.tsx
 * @description: HostFileManager.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { HostFileManager } from "../modules/ops/HostFileManager";

vi.mock("../hooks/useHostFileSystem", () => ({
  useHostFileSystem: vi.fn(() => ({
    supported: true,
    rootHandle: { name: "test-root" },
    rootName: "test-root",
    entries: [],
    currentPath: [],
    breadcrumbs: ["test-root"],
    selectedEntry: null,
    editingContent: null,
    editingDirty: false,
    versions: [],
    currentFileVersions: [],
    recentFiles: [],
    loading: false,
    searchQuery: "",
    searchResults: [],
    searching: false,
    imagePreviewUrl: null,
    stats: { totalEntries: 0, dirs: 0, files: 0, totalSize: 0, totalVersions: 0 },
    openDirectory: vi.fn(),
    navigateToDir: vi.fn(),
    navigateUp: vi.fn(),
    navigateToBreadcrumb: vi.fn(),
    createFile: vi.fn(),
    createDirectory: vi.fn(),
    deleteEntry: vi.fn(),
    renameEntry: vi.fn(),
    readFile: vi.fn(),
    saveFile: vi.fn(),
    closeEditor: vi.fn(),
    uploadFiles: vi.fn(),
    searchFiles: vi.fn(),
    restoreVersion: vi.fn(),
    deleteVersion: vi.fn(),
    refreshCurrentDir: vi.fn(),
    downloadFile: vi.fn(),
    setEditingContent: vi.fn(),
    setSelectedEntry: vi.fn(),
    formatSize: vi.fn((n: number) => `${n} B`),
  })),
  getFileTypeInfo: vi.fn(() => ({
    icon: "File",
    color: "#00d4ff",
  })),
}));

vi.mock("../modules/dev/CodeEditor", () => ({
  CodeEditor: ({ value, onChange }: any) => (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} />
  ),
  getLanguageLabel: vi.fn(() => "JavaScript"),
}));

vi.mock("../lib/view-context", () => ({
  ViewContext: React.createContext({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

describe("HostFileManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render host file manager page", () => {
    render(React.createElement(HostFileManager));
    expect(screen.getByText("宿主机文件系统")).toBeInTheDocument();
  });

  it("should render tabs", () => {
    render(React.createElement(HostFileManager));
    expect(screen.getAllByText("文件浏览").length).toBeGreaterThan(0);
    expect(screen.getAllByText("编辑器").length).toBeGreaterThan(0);
    expect(screen.getAllByText("版本历史").length).toBeGreaterThan(0);
    expect(screen.getAllByText("最近文件").length).toBeGreaterThan(0);
  });

  it("should render open directory button", () => {
    render(React.createElement(HostFileManager));
    const openButtons = screen.getAllByText("打开目录");
    expect(openButtons.length).toBeGreaterThan(0);
  });

  it("should render create file button", () => {
    render(React.createElement(HostFileManager));
    const createButtons = screen.getAllByTitle("新建文件");
    expect(createButtons.length).toBeGreaterThan(0);
  });

  it("should render create directory button", () => {
    render(React.createElement(HostFileManager));
    const createDirButtons = screen.getAllByTitle("新建目录");
    expect(createDirButtons.length).toBeGreaterThan(0);
  });

  it("should render upload button", () => {
    render(React.createElement(HostFileManager));
    const uploadButtons = screen.getAllByTitle("上传文件");
    expect(uploadButtons.length).toBeGreaterThan(0);
  });
});
