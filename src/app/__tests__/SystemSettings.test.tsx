/**
 * @file: SystemSettings.test.tsx
 * @description: SystemSettings.test.tsx description
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
import { SystemSettings } from "../modules/admin/SystemSettings";

vi.mock("../lib/api-config", () => ({
  getAPIConfig: vi.fn(() => ({
    apiBaseUrl: "http://localhost:3000/api",
    wsEndpoint: "ws://localhost:3000/ws",
    ollamaBaseUrl: "http://localhost:11434",
    enableBackend: false,
    timeout: 10000,
    maxRetries: 2,
    dbBase: "/api/v1/db",
  })),
  setAPIConfig: vi.fn(() => ({})),
  resetAPIConfig: vi.fn(() => ({})),
  onAPIConfigChange: vi.fn(() => () => {}),
  ENDPOINT_META: [],
}));

vi.mock("../hooks/useModelProvider", () => ({
  useModelProvider: vi.fn(() => ({
    providers: [],
    configuredModels: [],
    availableModels: [],
    addModel: vi.fn(),
    removeModel: vi.fn(),
    testConnection: vi.fn(),
  })),
}));

vi.mock("../hooks/useSettingsStore", () => ({
  useSettingsStore: vi.fn(() => ({
    settings: {
      darkMode: true,
      autoScale: false,
      healthCheck: true,
      autoBackup: false,
      dataCompression: true,
      wsAutoReconnect: true,
      wsHeartbeat: true,
      mfa: false,
      auditLog: true,
      rateLimiting: true,
      corsEnabled: false,
      debugMode: false,
      performanceLog: false,
      autoUpdate: true,
      alertEmail: false,
      alertSlack: false,
      cacheEnabled: false,
      aiStreamMode: true,
      aiContextMemory: true,
    },
    values: {
      systemName: "YYC3 Cloud Intelli-Matrix",
      clusterId: "yyc3-cluster-001",
      brandName: "YanYuCloudCube",
      brandSlogan1: "言启象限 | 语枢未来",
      brandSlogan2: "言启千行代码 | 语枢万物智能",
      brandSlogan3: "万象归元于云枢 | 深栈智启新纪元",
      refreshInterval: "5",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      wsEndpoint: "ws://localhost:3000/ws",
      dbHost: "localhost",
      dbPort: "5432",
      maxNodes: "10",
      healthCheckInterval: "30",
      loadBalanceStrategy: "轮询 (Round Robin)",
      scaleUpThreshold: "80",
      scaleDownThreshold: "30",
      backupSchedule: "0 2 * * *",
      wsReconnectInterval: "3000",
      wsMaxReconnect: "5",
      wsHeartbeatInterval: "30000",
      wsThrottleMs: "100",
      aiApiKey: "",
      aiBaseUrl: "",
      aiModel: "",
      aiTemperature: "0.7",
      aiTopP: "0.9",
      aiMaxTokens: "4096",
      aiTimeout: "60000",
      cacheSize: "1024",
      cacheTTL: "3600",
      sessionTimeout: "60",
      ipWhitelist: "",
      alertGpuThreshold: "90",
      alertTempThreshold: "80",
      alertEmailAddr: "",
      webhookUrl: "",
      dbName: "yyc3",
      dbUser: "admin",
      dbPassword: "",
      dbPoolSize: "10",
      logLevel: "info",
      logRetention: "30",
      maxConcurrency: "100",
    },
    toggleSetting: vi.fn(),
    updateValue: vi.fn(),
    updateValues: vi.fn(),
    resetSettings: vi.fn(),
    exportSettings: vi.fn(() => "{}"),
    importSettings: vi.fn(() => true),
  })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

vi.mock("../modules/admin/NetworkConfig", () => ({
  NetworkConfig: () => React.createElement("div", { "data-testid": "network-config-mock" }),
}));

vi.mock("../modules/shared/YYC3Logo", () => ({
  YYC3Logo: () => React.createElement("div", { "data-testid": "yyc3-logo-mock" }),
}));

describe("SystemSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render system settings page", () => {
    render(React.createElement(SystemSettings));
    expect(screen.getByText("系统设置")).toBeInTheDocument();
  });

  it("should render settings sections", () => {
    render(React.createElement(SystemSettings));
    // Section labels are rendered via t(section.labelKey)
    expect(screen.getAllByText("settings.general").length).toBeGreaterThan(0);
    expect(screen.getAllByText("settings.network").length).toBeGreaterThan(0);
    expect(screen.getAllByText("settings.cluster").length).toBeGreaterThan(0);
    expect(screen.getAllByText("settings.model").length).toBeGreaterThan(0);
  });

  it("should render save button", () => {
    render(React.createElement(SystemSettings));
    const saveButtons = screen.getAllByText("settings.saveChanges");
    expect(saveButtons.length).toBeGreaterThan(0);
  });

  it("should render reset button", () => {
    render(React.createElement(SystemSettings));
    const resetButtons = screen.getAllByText("settings.resetDefault");
    expect(resetButtons.length).toBeGreaterThan(0);
  });

  it("should render export button", () => {
    render(React.createElement(SystemSettings));
    // "导出配置" is hardcoded in the general section
    const exportButtons = screen.getAllByText("导出配置");
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it("should render import button", () => {
    render(React.createElement(SystemSettings));
    // "导入配置" is hardcoded in the general section
    const importButtons = screen.getAllByText("导入配置");
    expect(importButtons.length).toBeGreaterThan(0);
  });
});
