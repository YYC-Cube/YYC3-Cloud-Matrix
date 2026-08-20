/**
 * @file: TopBar.test.tsx
 * @description: TopBar.test.tsx description
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
import { BrowserRouter } from "react-router";
import { TopBar } from "../modules/shared/TopBar";
import { isGhostMode } from "../lib/supabaseClient";
import type { ConnectionState } from "../types";

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
    locales: [
      { code: "zh-CN", nativeLabel: "简体中文" },
      { code: "en-US", nativeLabel: "English" },
    ],
  }),
}));

vi.mock("../modules/shared/YYC3Logo", () => ({
  YYC3Logo: () => <div data-testid="yyc3-logo">YYC3 Logo</div>,
}));

vi.mock("../modules/shared/ConnectionStatus", () => ({
  ConnectionStatus: () => <div data-testid="connection-status">Connected</div>,
}));

vi.mock("../modules/shared/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language</div>,
}));

vi.mock("../lib/supabaseClient", () => ({
  isGhostMode: vi.fn(() => false),
}));

vi.mock("motion/react", () => {
  const MockMotionDiv = React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement("div", { ...props, ref }, children)
  );
  MockMotionDiv.displayName = "MockMotionDiv";
  return {
    motion: {
      div: MockMotionDiv,
    },
    AnimatePresence: ({ children }: any) => children,
  };
});

describe("TopBar Component", () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  const baseProps = {
    connectionState: "connected" as ConnectionState,
    reconnectCount: 0,
    lastSyncTime: "2024-01-01T00:00:00Z",
    onReconnect: vi.fn(),
    onLogout: vi.fn(),
    userEmail: "test@example.com",
    userRole: "admin",
    onToggleTerminal: vi.fn(),
  };

  const desktopProps = {
    ...baseProps,
    isMobile: false,
    isTablet: false,
    mobileMenuOpen: false,
    onToggleMobileMenu: vi.fn(),
  };

  const mobileProps = {
    ...baseProps,
    isMobile: true,
    isTablet: false,
    mobileMenuOpen: false,
    onToggleMobileMenu: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render top bar with desktop elements", () => {
    renderWithRouter(<TopBar {...desktopProps} />);

    // Desktop shows connection status and language switcher
    expect(screen.getByTestId("connection-status")).toBeInTheDocument();
    expect(screen.getByTestId("language-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("brand-name")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should render hamburger menu button on mobile", () => {
    renderWithRouter(<TopBar {...mobileProps} />);

    // On mobile the hamburger button is the first button
    const allButtons = screen.getAllByRole("button");
    expect(allButtons.length).toBeGreaterThan(0);
    // On mobile, YYC3Logo is rendered
    expect(screen.getByTestId("yyc3-logo")).toBeInTheDocument();
  });

  it("should call onToggleMobileMenu when hamburger is clicked", () => {
    const onToggle = vi.fn();
    renderWithRouter(<TopBar {...mobileProps} onToggleMobileMenu={onToggle} />);

    // The hamburger button is the first button on mobile
    const hamburgerButton = screen.getAllByRole("button")[0];
    fireEvent.click(hamburgerButton);

    expect(onToggle).toHaveBeenCalled();
  });

  it("should call onToggleMobileMenu when close button is clicked in open drawer", () => {
    const onToggle = vi.fn();
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} onToggleMobileMenu={onToggle} />
    );

    // When mobileMenuOpen is true, the hamburger shows X icon; clicking toggles
    const hamburgerButton = screen.getAllByRole("button")[0];
    fireEvent.click(hamburgerButton);

    expect(onToggle).toHaveBeenCalled();
  });

  it("should render navigation categories in mobile drawer", () => {
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} />
    );

    // Categories use t(labelKey) and mock returns the key as-is
    expect(screen.getByText("nav.catMonitor")).toBeInTheDocument();
    expect(screen.getByText("nav.catOps")).toBeInTheDocument();
    expect(screen.getByText("nav.catAI")).toBeInTheDocument();
  });

  it("should expand navigation category when clicked", () => {
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} />
    );

    // "monitor" starts expanded (contains "/"); click "ops" to expand it
    const categoryButton = screen.getByText("nav.catOps");
    fireEvent.click(categoryButton);
    expect(screen.getByText("nav.operations")).toBeInTheDocument();
  });

  it("should collapse navigation category when clicked again", () => {
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} />
    );

    // Click to expand
    fireEvent.click(screen.getByText("nav.catOps"));
    expect(screen.getByText("nav.operations")).toBeInTheDocument();

    // Re-query the button after re-render, then click again to collapse
    fireEvent.click(screen.getByText("nav.catOps"));
    expect(screen.queryByText("nav.operations")).not.toBeInTheDocument();
  });

  it("should render navigation items when monitor category is expanded", () => {
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} />
    );

    // "monitor" category starts expanded because "/" is the active route
    expect(screen.getByText("nav.dataMonitor")).toBeInTheDocument();
    expect(screen.getByText("nav.followUp")).toBeInTheDocument();
  });

  it("should navigate when navigation item is clicked", () => {
    const onToggle = vi.fn();
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} onToggleMobileMenu={onToggle} />
    );

    // "monitor" category is expanded by default
    const dataMonitorLinks = screen.getAllByText("nav.dataMonitor");
    fireEvent.click(dataMonitorLinks[0]);

    // Should call onToggleMobileMenu to close drawer after navigation
    expect(onToggle).toHaveBeenCalled();
  });

  it("should show ghost mode indicator when in ghost mode", () => {
    vi.mocked(isGhostMode).mockReturnValue(true);

    renderWithRouter(<TopBar {...desktopProps} />);

    // Ghost badge renders "GHOST" text (not "GHOST MODE")
    expect(screen.getByText("GHOST")).toBeInTheDocument();
  });

  it("should not show ghost mode indicator when not in ghost mode", () => {
    vi.mocked(isGhostMode).mockReturnValue(false);

    renderWithRouter(<TopBar {...desktopProps} />);
    expect(screen.queryByText("GHOST")).not.toBeInTheDocument();
  });

  it("should render user avatar button", () => {
    renderWithRouter(<TopBar {...desktopProps} />);

    const avatarBtn = screen.getByTestId("user-avatar-btn");
    expect(avatarBtn).toBeInTheDocument();
  });

  it("should render user initials in avatar", () => {
    renderWithRouter(<TopBar {...desktopProps} />);

    const initials = screen.getByTestId("user-initials");
    // userEmail "test@example.com" -> displayName "test" -> initials "TE"
    expect(initials).toHaveTextContent("TE");
  });

  it("should render notification badge", () => {
    renderWithRouter(<TopBar {...desktopProps} />);

    expect(screen.getByTestId("notification-badge")).toBeInTheDocument();
    expect(screen.getByTestId("notification-badge")).toHaveTextContent("3");
  });

  it("should render brand name on desktop", () => {
    renderWithRouter(<TopBar {...desktopProps} />);

    const brandName = screen.getByTestId("brand-name");
    expect(brandName).toBeInTheDocument();
    expect(brandName).toHaveTextContent("CP-IM");
  });

  it("should render brand name on mobile", () => {
    renderWithRouter(<TopBar {...mobileProps} />);

    const brandName = screen.getByTestId("brand-name");
    expect(brandName).toBeInTheDocument();
    expect(brandName).toHaveTextContent("YYC\u00b3");
  });

  it("should render all monitor category items", () => {
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} />
    );

    // "monitor" category is expanded by default since "/" is the active route
    expect(screen.getByText("nav.dataMonitor")).toBeInTheDocument();
    expect(screen.getByText("nav.followUp")).toBeInTheDocument();
    expect(screen.getByText("nav.patrol")).toBeInTheDocument();
    expect(screen.getByText("nav.alertRules")).toBeInTheDocument();
  });

  it("should render all operations category items", () => {
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} />
    );

    // Click to expand the "ops" category
    const opsCategory = screen.getByText("nav.catOps");
    fireEvent.click(opsCategory);
    expect(screen.getByText("nav.operations")).toBeInTheDocument();
    expect(screen.getByText("nav.fileManager")).toBeInTheDocument();
    expect(screen.getByText("nav.hostFiles")).toBeInTheDocument();
    expect(screen.getByText("nav.database")).toBeInTheDocument();
  });

  it("should render all AI category items", () => {
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} />
    );

    // Click to expand the "ai" category
    const aiCategory = screen.getByText("nav.catAI");
    fireEvent.click(aiCategory);
    expect(screen.getByText("nav.aiDecision")).toBeInTheDocument();
    expect(screen.getByText("modelProvider.title")).toBeInTheDocument();
    expect(screen.getByText("nav.aiDiagnostics")).toBeInTheDocument();
  });

  it("should open user menu when avatar is clicked on desktop", () => {
    renderWithRouter(<TopBar {...desktopProps} />);

    const avatarBtn = screen.getByTestId("user-avatar-btn");
    fireEvent.click(avatarBtn);

    // User menu should be visible on desktop with i18n keys as labels
    expect(screen.getAllByText("nav.userMgmt").length).toBeGreaterThan(0);
    expect(screen.getAllByText("nav.settings").length).toBeGreaterThan(0);
    expect(screen.getAllByText("common.logout").length).toBeGreaterThan(0);
  });

  it("should render search input on desktop", () => {
    renderWithRouter(<TopBar {...desktopProps} />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should render mobile search input in drawer", () => {
    renderWithRouter(
      <TopBar {...mobileProps} mobileMenuOpen={true} />
    );
    expect(screen.getByTestId("mobile-search-input")).toBeInTheDocument();
  });
});
