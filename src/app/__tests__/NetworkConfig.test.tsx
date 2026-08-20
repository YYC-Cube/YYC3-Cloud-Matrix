/**
 * @file: NetworkConfig.test.tsx
 * @description: NetworkConfig.test.tsx description
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
import { NetworkConfig } from "../modules/admin/NetworkConfig";

vi.mock("../hooks/useNetworkConfig", () => ({
  useNetworkConfig: vi.fn(() => ({
    config: {
      serverAddress: "192.168.1.1",
      port: "8080",
      nasAddress: "192.168.1.1:9898",
      wsUrl: "ws://192.168.1.1:8080/ws",
      mode: "auto",
    },
    interfaces: [
      {
        name: "en0",
        type: "有线以太网",
        ip: "192.168.1.100",
        status: "active",
      },
    ],
    localIP: "192.168.1.100",
    testStatus: "idle",
    testLatency: 0,
    testError: "",
    detecting: false,
    updateConfig: vi.fn(),
    save: vi.fn(),
    reset: vi.fn(),
    detectNetwork: vi.fn(),
    testConnection: vi.fn(),
  })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("NetworkConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should render network config modal when open", () => {
    render(
      React.createElement(NetworkConfig, {
        open: true,
        onClose: vi.fn(),
      })
    );
    expect(screen.getByText("网络连接配置")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    const { container } = render(
      React.createElement(NetworkConfig, {
        open: false,
        onClose: vi.fn(),
      })
    );
    expect(container.innerHTML).toBe("");
  });

  it("should render tabs", () => {
    render(
      React.createElement(NetworkConfig, {
        open: true,
        onClose: vi.fn(),
      })
    );
    expect(screen.getAllByText("自动检测").length).toBeGreaterThan(0);
    expect(screen.getAllByText("WiFi 配置").length).toBeGreaterThan(0);
    expect(screen.getAllByText("手动配置").length).toBeGreaterThan(0);
    expect(screen.getAllByText("连接历史").length).toBeGreaterThan(0);
  });

  it("should call onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      React.createElement(NetworkConfig, {
        open: true,
        onClose,
      })
    );
    // Click the backdrop div (first child of the fixed container)
    const backdrop = container.querySelector(".fixed > .absolute.inset-0") as HTMLElement;
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it("should display local IP", () => {
    render(
      React.createElement(NetworkConfig, {
        open: true,
        onClose: vi.fn(),
      })
    );
    // localIP appears in the auto-detect tab AND in the manual tab input value
    expect(screen.getAllByText("192.168.1.100").length).toBeGreaterThan(0);
  });

  it("should display network interfaces", () => {
    render(
      React.createElement(NetworkConfig, {
        open: true,
        onClose: vi.fn(),
      })
    );
    // The interface renders as "{iface.name} ({iface.type})" in a single span
    expect(screen.getAllByText(/en0.*有线以太网/).length).toBeGreaterThan(0);
  });
});
