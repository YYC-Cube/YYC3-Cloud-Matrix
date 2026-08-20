/**
 * @file: LanguageSwitcher.test.tsx
 * @description: LanguageSwitcher.test.tsx description
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
import { LanguageSwitcher } from "../modules/shared/LanguageSwitcher";

const mockSetLocale = vi.fn();

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    locale: "zh-CN",
    setLocale: mockSetLocale,
    locales: [
      { code: "zh-CN", nativeLabel: "简体中文" },
      { code: "en-US", nativeLabel: "English" },
    ],
    t: (key: string) => key,
  }),
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render language switcher button", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByTestId("language-switcher")).toBeInTheDocument();
  });

  it("should display current language label", () => {
    render(<LanguageSwitcher />);
    const labels = screen.getAllByText("简体中文");
    expect(labels.length).toBeGreaterThan(0);
  });

  it("should not display label in compact mode", () => {
    render(<LanguageSwitcher compact={true} />);
    const trigger = screen.getByTestId("lang-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger.querySelector("span")).toBeNull();
  });

  it("should open dropdown when clicked", () => {
    render(<LanguageSwitcher />);
    const trigger = screen.getByTestId("lang-trigger");
    fireEvent.click(trigger);
    expect(screen.getByTestId("lang-dropdown")).toBeInTheDocument();
  });

  it("should display all available languages", () => {
    render(<LanguageSwitcher />);
    const trigger = screen.getByTestId("lang-trigger");
    fireEvent.click(trigger);
    const zhLabels = screen.getAllByText("简体中文");
    const enLabels = screen.getAllByText("English");
    expect(zhLabels.length).toBeGreaterThan(0);
    expect(enLabels.length).toBeGreaterThan(0);
  });

  it("should change language when option is clicked", () => {
    render(<LanguageSwitcher />);
    const trigger = screen.getByTestId("lang-trigger");
    fireEvent.click(trigger);
    const englishOption = screen.getByTestId("lang-en-US");
    fireEvent.click(englishOption);
    expect(mockSetLocale).toHaveBeenCalledWith("en-US");
  });

  it("should close dropdown after selecting language", () => {
    render(<LanguageSwitcher />);
    const trigger = screen.getByTestId("lang-trigger");
    fireEvent.click(trigger);
    const englishOption = screen.getByTestId("lang-en-US");
    fireEvent.click(englishOption);
    expect(screen.queryByTestId("lang-dropdown")).not.toBeInTheDocument();
  });

  it("should close dropdown when clicking outside", () => {
    render(
      <div>
        <LanguageSwitcher />
        <div data-testid="outside">Outside</div>
      </div>
    );
    const trigger = screen.getByTestId("lang-trigger");
    fireEvent.click(trigger);
    expect(screen.getByTestId("lang-dropdown")).toBeInTheDocument();
    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);
    expect(screen.queryByTestId("lang-dropdown")).not.toBeInTheDocument();
  });

  it("should toggle dropdown on multiple clicks", () => {
    render(<LanguageSwitcher />);
    const trigger = screen.getByTestId("lang-trigger");
    fireEvent.click(trigger);
    expect(screen.getByTestId("lang-dropdown")).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByTestId("lang-dropdown")).not.toBeInTheDocument();
  });
});
