/**
 * @file: ArchitectureAudit.test.tsx
 * @description: ArchitectureAudit.test.tsx description
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
import { ArchitectureAudit } from "../modules/dev/ArchitectureAudit";

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

describe("ArchitectureAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render architecture audit page", () => {
    render(React.createElement(ArchitectureAudit));
    expect(screen.getByText("YYC3 架构审计全景")).toBeInTheDocument();
  });

  it("should render architecture overview section", () => {
    render(React.createElement(ArchitectureAudit));
    expect(screen.getByText("架构概览")).toBeInTheDocument();
  });

  it("should render routes section", () => {
    render(React.createElement(ArchitectureAudit));
    // The tab label is "路由 (28)" where 28 is ROUTES.length
    const routeTab = screen.getByText(/路由 \(\d+\)/);
    expect(routeTab).toBeInTheDocument();
  });

  it("should render stores section", () => {
    render(React.createElement(ArchitectureAudit));
    // The tab label is "数据层 (11)" where 11 is STORES.length
    const storesTab = screen.getByText(/数据层 \(\d+\)/);
    expect(storesTab).toBeInTheDocument();
  });

  it("should render test coverage section", () => {
    render(React.createElement(ArchitectureAudit));
    // The tab label is "测试 (N)" where N is TEST_FILES.length
    const testTab = screen.getByText(/测试 \(\d+\)/);
    expect(testTab).toBeInTheDocument();
  });

  it("should render feature completion section", () => {
    render(React.createElement(ArchitectureAudit));
    expect(screen.getByText("功能清单")).toBeInTheDocument();
  });
});
