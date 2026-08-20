/**
 * @file: ConfigExportCenter.test.tsx
 * @description: ConfigExportCenter.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { ConfigExportCenter } from "../modules/ops/ConfigExportCenter";

vi.mock("../hooks/useModelProvider", () => ({
  useModelProvider: vi.fn(() => ({
    providers: [],
    configuredModels: [],
    exportConfig: vi.fn(() => "{}"),
    importConfig: vi.fn(() => true),
  })),
}));

vi.mock("../hooks/useSettingsStore", () => ({
  useSettingsStore: vi.fn(() => ({
    settings: {
      theme: "dark",
      language: "zh-CN",
      notifications: true,
      autoSave: true,
    },
    exportSettings: vi.fn(() => "{}"),
    importSettings: vi.fn(() => true),
    resetSettings: vi.fn(),
  })),
}));

vi.mock("../lib/db-queries", () => ({
  exportDbData: vi.fn(() => "{}"),
  importDbData: vi.fn(() => true),
  resetDbModels: vi.fn(),
  resetDbAgents: vi.fn(),
  resetDbNodes: vi.fn(),
}));

vi.mock("../lib/env-config", () => ({
  exportEnvConfig: vi.fn(() => "{}"),
  importEnvConfig: vi.fn(() => true),
  resetEnvConfig: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ConfigExportCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render config export center page", () => {
    render(React.createElement(ConfigExportCenter));
    expect(screen.getByText("配置中心")).toBeInTheDocument();
  });

  it("should render export modules", () => {
    render(React.createElement(ConfigExportCenter));
    expect(screen.getByText("服务商 + 模型配置")).toBeInTheDocument();
    expect(screen.getByText("系统设置")).toBeInTheDocument();
    expect(screen.getByText("业务数据")).toBeInTheDocument();
    expect(screen.getByText("环境变量")).toBeInTheDocument();
  });

  it("should render export button", () => {
    render(React.createElement(ConfigExportCenter));
    const exportButtons = screen.getAllByText("导出选中");
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it("should render import button", () => {
    render(React.createElement(ConfigExportCenter));
    const importButtons = screen.getAllByText("粘贴导入");
    expect(importButtons.length).toBeGreaterThan(0);
  });

  it("should render reset button", () => {
    render(React.createElement(ConfigExportCenter));
    const resetButtons = screen.getAllByText("恢复默认");
    expect(resetButtons.length).toBeGreaterThan(0);
  });
});
