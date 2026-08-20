/**
 * @file: ConnectionStatus.test.tsx
 * @description: ConnectionStatus.test.tsx description
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
import { ConnectionStatus } from "../modules/shared/ConnectionStatus";
import type { ConnectionState } from "../types";

describe("ConnectionStatus", () => {
  const mockOnReconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render connected state correctly", () => {
    render(
      <ConnectionStatus
        state="connected"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    expect(screen.getByText("实时连接")).toBeInTheDocument();
    expect(screen.getByText("10:30:00")).toBeInTheDocument();
  });

  it("should render connecting state correctly", () => {
    render(
      <ConnectionStatus
        state="connecting"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    expect(screen.getByText("连接中...")).toBeInTheDocument();
  });

  it("should render reconnecting state with count", () => {
    render(
      <ConnectionStatus
        state="reconnecting"
        reconnectCount={5}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    expect(screen.getByText("重连中")).toBeInTheDocument();
  });

  it("should render disconnected state correctly", () => {
    render(
      <ConnectionStatus
        state="disconnected"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    expect(screen.getByText("已断开")).toBeInTheDocument();
  });

  it("should render simulated state correctly", () => {
    render(
      <ConnectionStatus
        state="simulated"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    expect(screen.getByText("模拟模式")).toBeInTheDocument();
  });

  it("should show reconnect button for disconnected state", () => {
    render(
      <ConnectionStatus
        state="disconnected"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    const reconnectButtons = screen.queryAllByTestId("manual-reconnect-btn");
    expect(reconnectButtons.length).toBeGreaterThan(0);
  });

  it("should show reconnect button for simulated state", () => {
    render(
      <ConnectionStatus
        state="simulated"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    const reconnectButtons = screen.queryAllByTestId("manual-reconnect-btn");
    expect(reconnectButtons.length).toBeGreaterThan(0);
  });

  it("should not show reconnect button for connected state", () => {
    render(
      <ConnectionStatus
        state="connected"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    expect(screen.queryByTestId("manual-reconnect-btn")).not.toBeInTheDocument();
  });

  it("should render compact mode correctly", () => {
    render(
      <ConnectionStatus
        state="connected"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
        compact={true}
      />
    );
    expect(screen.getByText("实时连接")).toBeInTheDocument();
  });

  it("should show reconnect count in compact mode for reconnecting state", () => {
    render(
      <ConnectionStatus
        state="reconnecting"
        reconnectCount={5}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
        compact={true}
      />
    );
    expect(screen.getByText("(5/10)")).toBeInTheDocument();
  });

  it("should call onReconnect when clicking compact button", () => {
    render(
      <ConnectionStatus
        state="disconnected"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
        compact={true}
      />
    );
    const button = screen.getByText("已断开").closest("button");
    fireEvent.click(button!);
    expect(mockOnReconnect).toHaveBeenCalled();
  });

  it("should display last sync time", () => {
    render(
      <ConnectionStatus
        state="connected"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    const syncTimeElements = screen.getAllByText("10:30:00");
    expect(syncTimeElements.length).toBeGreaterThan(0);
  });

  it("should call onReconnect when clicking manual reconnect button", () => {
    render(
      <ConnectionStatus
        state="disconnected"
        reconnectCount={0}
        lastSyncTime="10:30:00"
        onReconnect={mockOnReconnect}
      />
    );
    const reconnectButtons = screen.getAllByTestId("manual-reconnect-btn");
    fireEvent.click(reconnectButtons[0]);
    expect(mockOnReconnect).toHaveBeenCalled();
  });
});
