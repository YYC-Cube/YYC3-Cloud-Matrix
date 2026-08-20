/**
 * @file: AlertBanner.test.tsx
 * @description: AlertBanner 组件测试 - 使用统一数据源 useAlerts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AlertBanner } from "../modules/monitor/AlertBanner";

const mockNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../stores/global-store", () => ({
  useAlerts: () => ({
    followUps: [
      {
        id: "AL-0032",
        severity: "critical",
        title: "GPU-A100-03 推理延迟异常",
        source: "GPU-A100-03",
        metric: "2,450ms > 2,000ms (阈值)",
        status: "active",
        timestamp: Date.now() - 5 * 60 * 1000,
        tags: ["推理延迟", "A100"],
      },
      {
        id: "AL-0031",
        severity: "error",
        title: "GPU-H100-02 显存不足告警",
        source: "GPU-H100-02",
        metric: "78.5 GB / 80 GB (98.1%)",
        status: "investigating",
        timestamp: Date.now() - 18 * 60 * 1000,
        tags: ["显存", "H100"],
      },
      {
        id: "AL-0030",
        severity: "warning",
        title: "存储空间接近阈值",
        source: "NAS-Storage-01",
        metric: "41.2 TB / 48 TB (85.8%)",
        status: "active",
        timestamp: Date.now() - 45 * 60 * 1000,
        tags: ["存储", "NAS"],
      },
      {
        id: "AL-0029",
        severity: "warning",
        title: "网络延迟波动",
        source: "Switch-Core-01",
        metric: "平均 45ms",
        status: "investigating",
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        tags: ["网络", "延迟"],
      },
      {
        id: "AL-0026",
        severity: "info",
        title: "模型自动更新完成",
        source: "GPU-A100-01",
        metric: "Qwen-72B v2.1 → v2.2",
        status: "resolved",
        timestamp: Date.now() - 6 * 60 * 60 * 1000,
        tags: ["模型更新"],
      },
    ],
    addFollowUp: vi.fn(),
    updateFollowUp: vi.fn(),
    removeFollowUp: vi.fn(),
    clearFollowUps: vi.fn(),
  }),
}));

describe("AlertBanner", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render alert banner with latest title", () => {
    render(<AlertBanner />);
    expect(screen.getByText("GPU-A100-03 推理延迟异常")).toBeInTheDocument();
  });

  it("should display alert count", () => {
    render(<AlertBanner />);
    expect(screen.getByText(/5 条告警/)).toBeInTheDocument();
  });

  it("should display critical count", () => {
    render(<AlertBanner />);
    expect(screen.getByText("1 严重")).toBeInTheDocument();
  });

  it("should display error count", () => {
    render(<AlertBanner />);
    expect(screen.getByText("1 错误")).toBeInTheDocument();
  });

  it("should display warning count", () => {
    render(<AlertBanner />);
    expect(screen.getByText("2 警告")).toBeInTheDocument();
  });

  it("should display latest metric", () => {
    render(<AlertBanner />);
    expect(screen.getByText("2,450ms > 2,000ms (阈值)")).toBeInTheDocument();
  });

  it("should navigate to follow-up page when clicked", () => {
    render(<AlertBanner />);
    const banner = screen.getByTestId("alert-banner");
    fireEvent.click(banner);
    expect(mockNavigate).toHaveBeenCalledWith("/follow-up");
  });

  it("should render compact mode without detailed counts", () => {
    render(<AlertBanner compact={true} />);
    expect(screen.getByTestId("alert-banner")).toBeInTheDocument();
    expect(screen.getByText("GPU-A100-03 推理延迟异常")).toBeInTheDocument();
  });

  it("should show follow-up CTA text", () => {
    render(<AlertBanner />);
    expect(screen.getByText("一键跟进")).toBeInTheDocument();
  });

  it("should have correct data-testid", () => {
    render(<AlertBanner />);
    expect(screen.getByTestId("alert-banner")).toBeInTheDocument();
  });

  it("should apply critical styles when critical alerts exist", () => {
    render(<AlertBanner />);
    const banner = screen.getByTestId("alert-banner");
    expect(banner.className).toContain("border-[rgba(255,51,102,0.2)]");
  });
});
