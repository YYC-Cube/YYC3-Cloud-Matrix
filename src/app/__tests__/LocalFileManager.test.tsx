/**
 * @file: LocalFileManager.test.tsx
 * @description: LocalFileManager.test.tsx description
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
import { LocalFileManager } from "../modules/ops/LocalFileManager";

vi.mock("../hooks/useLocalFileSystem", () => ({
  useLocalFileSystem: vi.fn(() => ({
    files: [],
    logs: [],
    currentItems: [],
    breadcrumbs: ["~/.yyc3-cloudpivot"],
    currentPath: "~/.yyc3-cloudpivot",
    selectedFile: null,
    logLevelFilter: "all",
    logSourceFilter: "all",
    logSearchQuery: "",
    logSources: [],
    reports: [],
    isGenerating: false,
    downloadLogs: vi.fn(),
    executeBackup: vi.fn(),
    clearCache: vi.fn(),
    clearLogs: vi.fn(),
    selectFile: vi.fn(),
    navigateTo: vi.fn(),
    goUp: vi.fn(),
    getFileContent: vi.fn(() => ""),
    saveFileContent: vi.fn(),
    formatSize: vi.fn((n?: number) => n ? `${n} B` : "--"),
    generateReport: vi.fn(),
    setLogLevelFilter: vi.fn(),
    setLogSourceFilter: vi.fn(),
    setLogSearchQuery: vi.fn(),
  })),
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

vi.mock("../lib/view-context", () => ({
  ViewContext: React.createContext({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
}));

vi.mock("../modules/ops/FileBrowser", () => ({
  FileBrowser: () => <div data-testid="file-browser">FileBrowser</div>,
}));

vi.mock("../modules/ops/LogViewer", () => ({
  LogViewer: () => <div data-testid="log-viewer">LogViewer</div>,
}));

vi.mock("../modules/ops/ReportGenerator", () => ({
  ReportGenerator: () => <div data-testid="report-generator">ReportGenerator</div>,
}));

vi.mock("../modules/dev/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
  getLanguageLabel: vi.fn(() => "Text"),
}));

describe("LocalFileManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render local file manager page", () => {
    render(React.createElement(LocalFileManager));
    // i18n mock returns key as-is, so t("fileManager.title") renders as "fileManager.title"
    expect(screen.getByText("fileManager.title")).toBeInTheDocument();
  });

  it("should render tabs", () => {
    render(React.createElement(LocalFileManager));
    // Tab labels come from t("fileManager.fileBrowse"), t("fileManager.logViewer"), t("fileManager.reportGen")
    // These appear in both tab buttons and possibly elsewhere, so use getAllByText
    expect(screen.getAllByText("fileManager.fileBrowse").length).toBeGreaterThan(0);
    expect(screen.getAllByText("fileManager.logViewer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("fileManager.reportGen").length).toBeGreaterThan(0);
  });

  it("should render download logs button", () => {
    render(React.createElement(LocalFileManager));
    // Quick action labels come from t() calls - text may appear in multiple elements
    expect(screen.getAllByText("fileManager.downloadLogs").length).toBeGreaterThan(0);
  });

  it("should render backup button", () => {
    render(React.createElement(LocalFileManager));
    expect(screen.getAllByText("fileManager.executeBackup").length).toBeGreaterThan(0);
  });

  it("should render clear logs button", () => {
    render(React.createElement(LocalFileManager));
    expect(screen.getAllByText("fileManager.clearCache").length).toBeGreaterThan(0);
  });
});
