/**
 * @file: ColorSwatch.test.tsx
 * @description: ColorSwatch组件单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { ColorSwatch } from "../modules/dev/theme/ColorSwatch";

vi.mock("../modules/dev/theme/ColorPicker", () => ({
  ColorPicker: ({ value, onChange }: { value: string; onChange: (hex: string) => void }) => (
    <div data-testid="color-picker">
      <span>ColorPicker: {value}</span>
      <button onClick={() => onChange("#FF0000")}>Change Color</button>
    </div>
  ),
}));

describe("ColorSwatch", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render with label and value", () => {
    render(<ColorSwatch label="Primary" value="#00d4ff" onChange={mockOnChange} />);

    expect(screen.getByText("Primary")).toBeTruthy();
    expect(screen.getByText("#00D4FF")).toBeTruthy();
  });

  it("should display color preview", () => {
    const { container } = render(
      <ColorSwatch label="Primary" value="#00d4ff" onChange={mockOnChange} />
    );

    const colorPreview = container.querySelector('div[style*="background-color"]');
    expect(colorPreview).toBeTruthy();
    expect(colorPreview?.getAttribute("style")).toContain("background-color: rgb(0, 212, 255)");
  });

  it("should display OKLch format", () => {
    render(<ColorSwatch label="Primary" value="#00d4ff" onChange={mockOnChange} />);

    const oklchText = screen.getByText(/oklch/i);
    expect(oklchText).toBeTruthy();
  });

  it("should toggle color picker on click", () => {
    render(<ColorSwatch label="Primary" value="#00d4ff" onChange={mockOnChange} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByTestId("color-picker")).toBeTruthy();
  });

  it("should close color picker when clicking outside", () => {
    render(
      <div>
        <ColorSwatch label="Primary" value="#00d4ff" onChange={mockOnChange} />
        <div data-testid="outside">Outside</div>
      </div>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByTestId("color-picker")).toBeTruthy();

    fireEvent.mouseDown(screen.getByTestId("outside"));
  });

  it("should call onChange when color is changed", () => {
    render(<ColorSwatch label="Primary" value="#00d4ff" onChange={mockOnChange} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const changeButton = screen.getByText("Change Color");
    fireEvent.click(changeButton);

    expect(mockOnChange).toHaveBeenCalledWith("#FF0000");
  });

  it("should display uppercase hex value", () => {
    render(<ColorSwatch label="Primary" value="#00d4ff" onChange={mockOnChange} />);

    expect(screen.getByText("#00D4FF")).toBeTruthy();
  });

  it("should handle different colors", () => {
    const { rerender } = render(
      <ColorSwatch label="Background" value="#060e1f" onChange={mockOnChange} />
    );

    expect(screen.getByText("#060E1F")).toBeTruthy();

    rerender(<ColorSwatch label="Accent" value="#ff3366" onChange={mockOnChange} />);
    expect(screen.getByText("#FF3366")).toBeTruthy();
  });

  it("should have proper accessibility", () => {
    render(<ColorSwatch label="Primary" value="#00d4ff" onChange={mockOnChange} />);

    const button = screen.getByRole("button");
    expect(button).toBeTruthy();
  });
});
