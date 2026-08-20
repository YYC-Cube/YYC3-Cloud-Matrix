/**
 * @file: NotFound.test.tsx
 * @description: NotFound.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { NotFound } from "../modules/shared/NotFound";

const mockNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/unknown-path" }),
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
    locales: [],
  }),
}));

describe("NotFound", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render 404 heading", () => {
    render(<NotFound />);
    const headingElements = screen.getAllByText("404");
    expect(headingElements.length).toBeGreaterThan(0);
  });

  it("should render page not found title", () => {
    render(<NotFound />);
    const titleElements = screen.getAllByText("notFound.title");
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it("should render description", () => {
    render(<NotFound />);
    const descElements = screen.getAllByText("notFound.desc");
    expect(descElements.length).toBeGreaterThan(0);
  });

  it("should display current path", () => {
    render(<NotFound />);
    const pathElements = screen.getAllByText("/unknown-path");
    expect(pathElements.length).toBeGreaterThan(0);
  });

  it("should render go back button", () => {
    render(<NotFound />);
    const goBackElements = screen.getAllByText("notFound.goBack");
    expect(goBackElements.length).toBeGreaterThan(0);
  });

  it("should render go home button", () => {
    render(<NotFound />);
    const goHomeElements = screen.getAllByText("notFound.goHome");
    expect(goHomeElements.length).toBeGreaterThan(0);
  });

  it("should navigate back when go back button is clicked", () => {
    render(<NotFound />);
    const goBackButtons = screen.getAllByText("notFound.goBack");
    fireEvent.click(goBackButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("should navigate to home when go home button is clicked", () => {
    render(<NotFound />);
    const goHomeButtons = screen.getAllByText("notFound.goHome");
    fireEvent.click(goHomeButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should render footer text", () => {
    render(<NotFound />);
    const footerElements = screen.getAllByText("notFound.footer");
    expect(footerElements.length).toBeGreaterThan(0);
  });

  it("should handle mouse enter/leave on go back button", () => {
    render(<NotFound />);
    const goBackButtons = screen.getAllByText("notFound.goBack");
    fireEvent.mouseEnter(goBackButtons[0]);
    fireEvent.mouseLeave(goBackButtons[0]);
    expect(goBackButtons[0]).toBeInTheDocument();
  });

  it("should handle mouse enter/leave on go home button", () => {
    render(<NotFound />);
    const goHomeButtons = screen.getAllByText("notFound.goHome");
    fireEvent.mouseEnter(goHomeButtons[0]);
    fireEvent.mouseLeave(goHomeButtons[0]);
    expect(goHomeButtons[0]).toBeInTheDocument();
  });
});
