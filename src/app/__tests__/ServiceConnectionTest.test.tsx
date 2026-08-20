/**
 * @file: ServiceConnectionTest.test.tsx
 * @description: ServiceConnectionTest.test.tsx description
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
import { ServiceConnectionTest } from "../modules/ops/ServiceConnectionTest";

vi.mock("../hooks/useModelProvider", () => ({
  useModelProvider: vi.fn(() => ({
    providers: [],
    addProvider: vi.fn(),
    removeProvider: vi.fn(),
    updateProvider: vi.fn(),
    configuredModels: [],
  })),
}));

vi.mock("../lib/env-config", () => ({
  env: vi.fn((key: string) => {
    const envMap: Record<string, string> = {
      OLLAMA_BASE_URL: "http://localhost:11434",
      OLLAMA_PROXY_PATH: "/api/v1/llm/ollama",
    };
    return envMap[key] || "";
  }),
}));

vi.mock("../lib/ollama-url", () => ({
  getOllamaEndpointInfo: vi.fn(() => ({
    mode: "proxy",
    chatUrl: "/api/v1/llm/ollama/chat",
    tagsUrl: "/api/v1/llm/ollama/tags",
    proxyPath: "/api/v1/llm/ollama",
    directBase: "http://localhost:11434",
  })),
  getOllamaChatUrl: vi.fn(() => "/api/v1/llm/ollama/chat"),
  getOllamaTagsUrl: vi.fn(() => "/api/v1/llm/ollama/tags"),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
}));

vi.mock("../lib/view-context", () => ({
  ViewContext: React.createContext({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

describe("ServiceConnectionTest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render service connection test panel", () => {
    render(React.createElement(ServiceConnectionTest));
    // The component renders "全链路服务连接测试" as the heading
    expect(screen.getByText("全链路服务连接测试")).toBeInTheDocument();
  });

  it("should render quick test section", () => {
    render(React.createElement(ServiceConnectionTest));
    // The "快速单项测试" section heading appears in multiple elements
    expect(screen.getAllByText("快速单项测试").length).toBeGreaterThan(0);
  });

  it("should render test all button", () => {
    render(React.createElement(ServiceConnectionTest));
    const testAllButtons = screen.getAllByText("一键全部测试");
    expect(testAllButtons.length).toBeGreaterThan(0);
  });

  it("should render clear results button", () => {
    render(React.createElement(ServiceConnectionTest));
    const clearButtons = screen.getAllByText("清空");
    expect(clearButtons.length).toBeGreaterThan(0);
  });
});
