/**
 * @file: DevGuidePage.test.tsx
 * @description: DevGuidePage.test.tsx description
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
import { DevGuidePage } from "../modules/dev/DevGuidePage";

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

describe("DevGuidePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render dev guide page", () => {
    render(React.createElement(DevGuidePage));
    // useI18n mock returns the key directly
    expect(screen.getByText("devGuide.title")).toBeInTheDocument();
  });

  it("should render tech choices tab", () => {
    render(React.createElement(DevGuidePage));
    expect(screen.getAllByText("devGuide.techStack").length).toBeGreaterThan(0);
  });

  it("should render development phases tab", () => {
    render(React.createElement(DevGuidePage));
    expect(screen.getAllByText("devGuide.devPriority").length).toBeGreaterThan(0);
  });

  it("should render architecture tab", () => {
    render(React.createElement(DevGuidePage));
    expect(screen.getAllByText("devGuide.architecture").length).toBeGreaterThan(0);
  });

  it("should render storage strategy tab", () => {
    render(React.createElement(DevGuidePage));
    expect(screen.getAllByText("devGuide.storageStrategy").length).toBeGreaterThan(0);
  });

  it("should render tech choice items", () => {
    render(React.createElement(DevGuidePage));
    // "本地文件访问" appears in the feature span AND as text within the parent div,
    // so use getAllByText since multiple elements contain this text
    expect(screen.getAllByText("本地文件访问").length).toBeGreaterThan(0);
    expect(screen.getAllByText("前端框架").length).toBeGreaterThan(0);
    expect(screen.getAllByText("样式系统").length).toBeGreaterThan(0);
  });
});
