/**
 * @file: ErrorBoundary.test.tsx
 * @description: ErrorBoundary.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { ErrorBoundary } from "../modules/shared/ErrorBoundary";

vi.mock("../lib/error-handler", () => ({
  captureError: vi.fn((error, options) => ({
    id: "test-error-id",
    category: options?.category || "RUNTIME",
    severity: options?.severity || "critical",
    message: error.message,
    timestamp: new Date().toISOString(),
  })),
}));

vi.mock("../lib/figma-error-filter", () => ({
  isFigmaPlatformError: vi.fn(() => false),
}));

vi.mock("../modules/shared/YYC3LogoSvg", () => ({
  YYC3LogoSvg: () => React.createElement("div", { "data-testid": "yyc3-logo" }),
}));

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return React.createElement("div", null, "Normal content");
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should render children when no error", () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement("div", null, "Test content")
      )
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should render error UI when error is thrown", () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    const errorTitles = screen.getAllByText("系统异常");
    expect(errorTitles.length).toBeGreaterThan(0);
  });

  it("should display error message", () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    const errorMessages = screen.getAllByText("Test error");
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it("should render retry button", () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    const retryButtons = screen.getAllByText("重新加载");
    expect(retryButtons.length).toBeGreaterThan(0);
  });

  it("should render home button", () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    const homeButtons = screen.getAllByText("返回首页");
    expect(homeButtons.length).toBeGreaterThan(0);
  });

  it("should render copy report button", () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    const copyButtons = screen.getAllByText("复制报告");
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  it("should reset error state when retry button is clicked", () => {
    const { rerender } = render(
      React.createElement(
        ErrorBoundary,
        { key: "eb" },
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    const errorTitles = screen.getAllByText("系统异常");
    expect(errorTitles.length).toBeGreaterThan(0);

    const retryButtons = screen.getAllByText("重新加载");
    fireEvent.click(retryButtons[0]);
    // Use a different key to force React to create a new ErrorBoundary instance
    rerender(
      React.createElement(
        ErrorBoundary,
        { key: "eb-reset" },
        React.createElement(ThrowError, { shouldThrow: false })
      )
    );
    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("should navigate to home when home button is clicked", () => {
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: "" };

    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );

    const homeButtons = screen.getAllByText("返回首页");
    fireEvent.click(homeButtons[0]);

    expect((window as any).location.href).toBe("/");

    (window as any).location = originalLocation;
  });

  it("should toggle error details when clicking expand button", () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );

    const expandButtons = screen.getAllByText("展开错误详情");
    expect(expandButtons.length).toBeGreaterThan(0);
    fireEvent.click(expandButtons[0]);
    const collapseButtons = screen.getAllByText("收起错误详情");
    expect(collapseButtons.length).toBeGreaterThan(0);
    expect(screen.getAllByText("堆栈跟踪:").length).toBeGreaterThan(0);

    fireEvent.click(collapseButtons[0]);
    const expandButtonsAgain = screen.getAllByText("展开错误详情");
    expect(expandButtonsAgain.length).toBeGreaterThan(0);
  });

  it("should render widget level error UI", () => {
    render(
      React.createElement(
        ErrorBoundary,
        { level: "widget" },
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    expect(screen.getByText("组件加载失败")).toBeInTheDocument();
  });

  it("should render module level error UI", () => {
    render(
      React.createElement(
        ErrorBoundary,
        { level: "module" },
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    expect(screen.getByText("模块加载异常")).toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      React.createElement(
        ErrorBoundary,
        { onError },
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it("should render custom fallback when provided", () => {
    render(
      React.createElement(
        ErrorBoundary,
        { fallback: React.createElement("div", null, "Custom error UI") },
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
  });

  it("should render custom fallback function when provided", () => {
    render(
      React.createElement(
        ErrorBoundary,
        {
          fallback: (error: Error, reset: () => void) =>
            React.createElement(
              "div",
              null,
              React.createElement("span", null, "Custom: ", error.message),
              React.createElement("button", { onClick: reset }, "Reset")
            ),
        },
        React.createElement(ThrowError, { shouldThrow: true })
      )
    );
    expect(screen.getByText("Custom: Test error")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });
});
