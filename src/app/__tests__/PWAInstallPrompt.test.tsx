/**
 * @file: PWAInstallPrompt.test.tsx
 * @description: PWAInstallPrompt.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PWAInstallPrompt } from "../modules/admin/PWAInstallPrompt";

vi.mock("../hooks/useInstallPrompt", () => ({
  useInstallPrompt: vi.fn(),
}));

vi.mock("../modules/shared/YYC3Logo", () => ({
  YYC3Logo: () => <div data-testid="yyc3-logo" />,
}));

import { useInstallPrompt } from "../hooks/useInstallPrompt";

describe("PWAInstallPrompt", () => {
  afterEach(() => {
    cleanup();
  });

  it("should not render when already installed", () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      isInstalled: true,
      canInstall: true,
      promptInstall: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<PWAInstallPrompt />);

    expect(screen.queryByText("安装 CP-IM Cloud")).not.toBeInTheDocument();
  });

  it("should not render when cannot install", () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      isInstalled: false,
      canInstall: false,
      promptInstall: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<PWAInstallPrompt />);

    expect(screen.queryByText("安装 CP-IM Cloud")).not.toBeInTheDocument();
  });

  it("should render when can install and not installed", () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      isInstalled: false,
      canInstall: true,
      promptInstall: vi.fn(),
      dismiss: vi.fn(),
    });

    render(<PWAInstallPrompt />);

    expect(screen.getByText("安装 CP-IM Cloud")).toBeInTheDocument();
    expect(screen.getByText("添加到桌面，获得原生应用体验，支持离线使用")).toBeInTheDocument();
    const installButtons = screen.getAllByText("安装到桌面");
    expect(installButtons.length).toBeGreaterThan(0);
  });

  it("should call promptInstall when install button is clicked", () => {
    const mockPromptInstall = vi.fn();
    vi.mocked(useInstallPrompt).mockReturnValue({
      isInstalled: false,
      canInstall: true,
      promptInstall: mockPromptInstall,
      dismiss: vi.fn(),
    });

    render(<PWAInstallPrompt />);

    const installBtns = screen.getAllByRole("button", { name: /安装到桌面/ });
    fireEvent.click(installBtns[0]);

    expect(mockPromptInstall).toHaveBeenCalledTimes(1);
  });

  it("should call dismiss when close button is clicked", () => {
    const mockDismiss = vi.fn();
    vi.mocked(useInstallPrompt).mockReturnValue({
      isInstalled: false,
      canInstall: true,
      promptInstall: vi.fn(),
      dismiss: mockDismiss,
    });

    const { container } = render(<PWAInstallPrompt />);

    // The close button is the one with "absolute top-2 right-2" classes (contains only X icon)
    const closeButton = container.querySelector("button.absolute.top-2");
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton!);

    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("should have correct styling classes", () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      isInstalled: false,
      canInstall: true,
      promptInstall: vi.fn(),
      dismiss: vi.fn(),
    });

    const { container } = render(<PWAInstallPrompt />);

    const promptElement = container.querySelector(".fixed.bottom-20");
    expect(promptElement).toBeInTheDocument();
  });
});
