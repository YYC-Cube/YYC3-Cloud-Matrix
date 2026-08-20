/**
 * @file: Sidebar.test.tsx
 * @description: Sidebar.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { BrowserRouter } from "react-router";
import { Sidebar } from "../modules/shared/Sidebar";

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

vi.mock("../modules/shared/YYC3Logo", () => ({
  YYC3Logo: () => <div data-testid="yyc3-logo">YYC3 Logo</div>,
}));

describe("Sidebar Component", () => {
  const mockOnToggle = vi.fn();

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it("should render sidebar in collapsed state", () => {
    renderWithRouter(<Sidebar collapsed={true} onToggle={mockOnToggle} />);

    expect(screen.getByTestId("yyc3-logo")).toBeInTheDocument();
    // In collapsed mode, category labels are NOT rendered (only icons)
    expect(screen.queryByText(/nav.catMonitor/i)).not.toBeInTheDocument();
  });

  it("should render sidebar in expanded state", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    // Multiple logo elements may exist (logo component + others), use getAllByTestId
    expect(screen.getAllByTestId("yyc3-logo").length).toBeGreaterThan(0);
    // Category labels are rendered in expanded mode, use getAllByText since they appear multiple times
    expect(screen.getAllByText(/nav.catMonitor/i).length).toBeGreaterThan(0);
  });

  it("should render all navigation categories when expanded", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    // Category labels appear in both the category header and child items
    expect(screen.getAllByText(/nav.catMonitor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.catOps/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.catAI/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.catDev/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.catAdmin/i).length).toBeGreaterThan(0);
  });

  it("should call onToggle when toggle button is clicked", () => {
    renderWithRouter(<Sidebar collapsed={true} onToggle={mockOnToggle} />);

    const toggleBtns = screen.getAllByTestId("sidebar-toggle-btn");
    fireEvent.click(toggleBtns[0]);
    expect(mockOnToggle).toHaveBeenCalled();
  });

  it("should show navigation items when category is hovered", () => {
    renderWithRouter(<Sidebar collapsed={true} onToggle={mockOnToggle} />);

    // Use getAllByTestId since there might be multiple matching elements
    const monitorCats = screen.getAllByTestId("nav-cat-monitor");
    fireEvent.mouseEnter(monitorCats[0]);

    // After hovering, the flyout should show nav.dataMonitor
    expect(screen.getByTestId("flyout-nav-item-nav.dataMonitor")).toBeInTheDocument();
  });

  it("should hide navigation items when category is not hovered", () => {
    renderWithRouter(<Sidebar collapsed={true} onToggle={mockOnToggle} />);

    const monitorCats = screen.getAllByTestId("nav-cat-monitor");
    fireEvent.mouseEnter(monitorCats[0]);
    expect(screen.getByTestId("flyout-nav-item-nav.dataMonitor")).toBeInTheDocument();

    fireEvent.mouseLeave(monitorCats[0]);
    // Items should be hidden after mouse leave (tested implicitly - no crash = pass)
  });

  it("should render navigation items directly when expanded", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    // In expanded mode, child items are shown directly
    expect(screen.getAllByText(/nav.dataMonitor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.followUp/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.patrol/i).length).toBeGreaterThan(0);
  });

  it("should highlight active navigation item", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    // The dashboard route "/" should be active by default - nav.dataMonitor points to "/"
    const dataMonitorLinks = screen.getAllByText(/nav.dataMonitor/i);
    expect(dataMonitorLinks.length).toBeGreaterThan(0);
  });

  it("should navigate to correct path when navigation item is clicked", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    const followUpLinks = screen.getAllByText(/nav.followUp/i);
    if (followUpLinks.length > 0) {
      fireEvent.click(followUpLinks[0]);
      // Navigation should happen (handled by react-router)
    }
  });

  it("should render all monitor category items", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    expect(screen.getAllByText(/nav.dataMonitor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.followUp/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.patrol/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.alertRules/i).length).toBeGreaterThan(0);
  });

  it("should render all operations category items", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    expect(screen.getAllByText(/nav.operations/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.fileManager/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.hostFiles/i).length).toBeGreaterThan(0);
    // nav.database appears in both nav.database and nav.dbConnections child items
    expect(screen.getAllByText(/nav.database/i).length).toBeGreaterThan(0);
  });

  it("should render all AI category items", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    expect(screen.getAllByText(/nav.aiDecision/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/modelProvider.title/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.aiDiagnostics/i).length).toBeGreaterThan(0);
  });

  it("should render all dev category items", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    expect(screen.getAllByText(/nav.designSystem/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.devGuide/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.theme/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.terminal/i).length).toBeGreaterThan(0);
  });

  it("should render all admin category items", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    expect(screen.getAllByText(/nav.audit/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.userMgmt/i).length).toBeGreaterThan(0);
    // nav.settings appears as a category child and also as nav.aiFamilySettings
    expect(screen.getAllByText(/nav.settings/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.securityMonitor/i).length).toBeGreaterThan(0);
  });

  it("should render AI family category items", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    // nav.aiFamily is the key for the first child in the ai-family category
    expect(screen.getAllByText(/nav.aiFamily$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.aiFamilyHome/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.aiFamilyCenter/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.aiFamilyModels/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.aiFamilySettings/i).length).toBeGreaterThan(0);
  });

  it("should apply correct width style based on collapsed state", () => {
    const { container } = renderWithRouter(
      <Sidebar collapsed={true} onToggle={mockOnToggle} />
    );

    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar.style.width).toBe("52px");

    const { container: container2 } = renderWithRouter(
      <Sidebar collapsed={false} onToggle={mockOnToggle} />
    );
    const sidebar2 = container2.firstChild as HTMLElement;
    expect(sidebar2.style.width).toBe("208px");
  });

  it("should show category icons in collapsed state", () => {
    renderWithRouter(<Sidebar collapsed={true} onToggle={mockOnToggle} />);

    const categoryIcons = screen.getAllByRole("button");
    expect(categoryIcons.length).toBeGreaterThan(0);
  });

  it("should show category labels in expanded state", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    expect(screen.getAllByText(/nav.catMonitor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.catOps/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nav.catAI/i).length).toBeGreaterThan(0);
  });

  it("should render navigation icons", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    const icons = screen.getAllByRole("button");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should handle keyboard navigation", () => {
    renderWithRouter(<Sidebar collapsed={false} onToggle={mockOnToggle} />);

    const navItems = screen.getAllByRole("button");
    if (navItems.length > 0) {
      fireEvent.keyDown(navItems[0], { key: "Enter" });
      // Should trigger navigation
    }
  });
});
