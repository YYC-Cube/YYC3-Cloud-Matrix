/**
 * @file: EnvConfigEditor.test.tsx
 * @description: EnvConfigEditor.test.tsx description
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
import { EnvConfigEditor } from "../modules/admin/EnvConfigEditor";

const mockConfig = {
  SYSTEM_NAME: "YYC3",
  SYSTEM_VERSION: "1.0.0",
  SYSTEM_BUILD: "2026-01-01",
  CLUSTER_ID: "test-cluster",
  NODE_ENV: "test",
  API_BASE_URL: "http://localhost:3000",
  WS_ENDPOINT: "ws://localhost:3001",
  OLLAMA_BASE_URL: "http://localhost:11434",
  STORAGE_PREFIX: "yyc3_",
  IDB_NAME: "test-db",
  IDB_VERSION: 1,
  DEFAULT_AI_BASE_URL: "http://localhost:8080",
  DEFAULT_AI_MODEL: "test-model",
  DEFAULT_AI_TEMPERATURE: 0.5,
  DEFAULT_AI_MAX_TOKENS: 1024,
  DEFAULT_AI_TIMEOUT: 10000,
  SESSION_TIMEOUT_MIN: 30,
  MAX_LOGIN_ATTEMPTS: 5,
  CORS_ORIGINS: "*",
  ENABLE_MOCK_MODE: true,
  ENABLE_DEBUG: false,
  ENABLE_PWA: false,
  ENABLE_ELECTRON_IPC: false,
};

vi.mock("../lib/env-config", () => ({
  getEnvConfig: vi.fn(() => mockConfig),
  setEnvConfig: vi.fn((updates) => ({ ...mockConfig, ...updates })),
  resetEnvConfig: vi.fn(() => mockConfig),
  exportEnvConfig: vi.fn(() => "{}"),
  importEnvConfig: vi.fn(() => true),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("EnvConfigEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render env config editor page", () => {
    render(React.createElement(EnvConfigEditor));
    expect(screen.getByText("环境变量管理")).toBeInTheDocument();
  });

  it("should render system group", () => {
    render(React.createElement(EnvConfigEditor));
    const elems = screen.getAllByText("系统标识");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render network group", () => {
    render(React.createElement(EnvConfigEditor));
    const elems = screen.getAllByText("网络端点");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render storage group", () => {
    render(React.createElement(EnvConfigEditor));
    const elems = screen.getAllByText("存储配置");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render AI group", () => {
    render(React.createElement(EnvConfigEditor));
    const elems = screen.getAllByText("AI 默认配置");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render security group", () => {
    render(React.createElement(EnvConfigEditor));
    const elems = screen.getAllByText("安全配置");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render features group", () => {
    render(React.createElement(EnvConfigEditor));
    const elems = screen.getAllByText("功能开关");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render reset button", () => {
    render(React.createElement(EnvConfigEditor));
    const resetButtons = screen.getAllByText("重置");
    expect(resetButtons.length).toBeGreaterThan(0);
  });

  it("should render export button", () => {
    render(React.createElement(EnvConfigEditor));
    const exportButtons = screen.getAllByText("导出");
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it("should render import button", () => {
    render(React.createElement(EnvConfigEditor));
    const importButtons = screen.getAllByText("导入");
    expect(importButtons.length).toBeGreaterThan(0);
  });

  it("should render all group field counts", () => {
    render(React.createElement(EnvConfigEditor));
    // Each group shows "N 项" for its field count — some counts repeat across groups
    expect(screen.getAllByText("5 项").length).toBeGreaterThanOrEqual(2); // system + ai: 5 fields each
    expect(screen.getAllByText("3 项").length).toBeGreaterThanOrEqual(2); // network + storage + security: 3 fields each
    expect(screen.getAllByText("4 项").length).toBeGreaterThanOrEqual(1); // features: 4 fields
  });
});
