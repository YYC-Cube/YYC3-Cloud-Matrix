/**
 * @file: OperationCenter.test.tsx
 * @description: OperationCenter.test.tsx description
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
import { OperationCenter } from "../modules/ops/OperationCenter";

vi.mock("../hooks/useOperationCenter", () => ({
  useOperationCenter: vi.fn(() => ({
    categories: [
      { key: "system", label: "系统操作", icon: "Settings", color: "#ffaa00" },
      { key: "network", label: "网络操作", icon: "Server", color: "#00d4ff" },
    ],
    activeCategory: "system",
    setActiveCategory: vi.fn(),
    actions: [
      { id: "1", label: "重启服务", category: "system", icon: "RotateCw", status: "pending", description: "test" },
      { id: "2", label: "清理缓存", category: "system", icon: "Trash2", status: "pending", description: "test" },
    ],
    isExecuting: null,
    executeAction: vi.fn(),
    templates: [],
    runTemplate: vi.fn(),
    addTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    logs: [],
    logFilter: "all",
    setLogFilter: vi.fn(),
    searchQuery: "",
    setSearchQuery: vi.fn(),
  })),
  CATEGORY_META: [
    { key: "system", label: "系统操作", icon: "Settings", color: "#ffaa00" },
    { key: "network", label: "网络操作", icon: "Server", color: "#00d4ff" },
  ],
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

describe("OperationCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render operation center page", () => {
    render(React.createElement(OperationCenter));
    expect(screen.getByText("operations.title")).toBeInTheDocument();
  });

  it("should render quick actions section", () => {
    render(React.createElement(OperationCenter));
    expect(screen.getAllByText("operations.quickActions").length).toBeGreaterThan(0);
  });

  it("should render action count", () => {
    render(React.createElement(OperationCenter));
    expect(screen.getAllByText("(2)").length).toBeGreaterThan(0);
  });

  it("should render templates section", () => {
    render(React.createElement(OperationCenter));
    expect(screen.getAllByText("操作模板").length).toBeGreaterThan(0);
  });

  it("should render log stream section", () => {
    render(React.createElement(OperationCenter));
    expect(screen.getAllByText("操作日志").length).toBeGreaterThan(0);
  });
});
