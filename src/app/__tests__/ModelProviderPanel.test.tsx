/**
 * @file: ModelProviderPanel.test.tsx
 * @description: ModelProviderPanel.test.tsx description
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
import { ModelProviderPanel } from "../modules/ai/ModelProviderPanel";

vi.mock("../hooks/useModelProvider", () => ({
  useModelProvider: vi.fn(() => ({
    providers: [],
    configuredModels: [],
    ollamaModels: [],
    ollamaLoading: false,
    ollamaError: null,
    stats: { total: 0, active: 0, totalProviders: 0, ollamaCount: 0, customProviders: 0 },
    modalOpen: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
    addModel: vi.fn(),
    removeModel: vi.fn(),
    testConnection: vi.fn(),
    fetchOllamaModels: vi.fn(),
    addProvider: vi.fn(),
    updateProvider: vi.fn(),
    removeProvider: vi.fn(),
    resetProvider: vi.fn(),
    addModelToProvider: vi.fn(),
    removeModelFromProvider: vi.fn(),
    exportConfig: vi.fn(() => "{}"),
    importConfig: vi.fn(() => true),
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

describe("ModelProviderPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render model provider panel page", () => {
    render(React.createElement(ModelProviderPanel));
    expect(screen.getByText("modelProvider.title")).toBeInTheDocument();
  });

  it("should render add model button", () => {
    render(React.createElement(ModelProviderPanel));
    const addButtons = screen.getAllByText("modelProvider.addModel");
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it("should render ollama section", () => {
    render(React.createElement(ModelProviderPanel));
    const elems = screen.getAllByText("modelProvider.ollamaLocal");
    expect(elems.length).toBeGreaterThan(0);
  });

  it("should render refresh button", () => {
    render(React.createElement(ModelProviderPanel));
    const refreshButtons = screen.getAllByText("common.refresh");
    expect(refreshButtons.length).toBeGreaterThan(0);
  });

  it("should render export button", () => {
    render(React.createElement(ModelProviderPanel));
    const exportButtons = screen.getAllByText("导出");
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it("should render import button", () => {
    render(React.createElement(ModelProviderPanel));
    const importButtons = screen.getAllByText("导入");
    expect(importButtons.length).toBeGreaterThan(0);
  });

  it("should render stats section", () => {
    render(React.createElement(ModelProviderPanel));
    expect(screen.getAllByText("modelProvider.totalModels").length).toBeGreaterThan(0);
    expect(screen.getAllByText("modelProvider.activeModels").length).toBeGreaterThan(0);
    expect(screen.getAllByText("服务商总数").length).toBeGreaterThan(0);
    expect(screen.getAllByText("modelProvider.ollamaModels").length).toBeGreaterThan(0);
  });
});
