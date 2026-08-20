/**
 * @file: DataMonitoring.test.tsx
 * @description: DataMonitoring.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { DataMonitoring } from "../modules/monitor/DataMonitoring";

vi.mock("../modules/monitor/Dashboard", () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard</div>,
}));

describe("DataMonitoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render data monitoring page", () => {
    render(React.createElement(DataMonitoring));
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
  });

  it("should render dashboard component", () => {
    render(React.createElement(DataMonitoring));
    // Use getAllByText since React StrictMode may cause double rendering
    const dashboardElements = screen.getAllByText("Dashboard");
    expect(dashboardElements.length).toBeGreaterThan(0);
  });
});
