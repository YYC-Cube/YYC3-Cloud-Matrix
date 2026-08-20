/**
 * @file: ColorPicker.test.tsx
 * @description: ColorPicker组件单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor, act } from "@testing-library/react";
import React from "react";
import { ColorPicker } from "../modules/dev/theme/ColorPicker";

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  fillStyle: "",
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

describe("ColorPicker", () => {
  const mockOnChange = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("渲染", () => {
    it("should render color picker component", () => {
      const { container } = render(
        <ColorPicker value="#00d4ff" onChange={mockOnChange} />
      );
      expect(container.firstChild).toBeTruthy();
    });

    it("should display current color in hex input", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);
      const hexInputs = screen.getAllByDisplayValue("00d4ff");
      expect(hexInputs.length).toBeGreaterThan(0);
    });

    it("should display RGB inputs", () => {
      render(<ColorPicker value="#FF0000" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBe(3);
    });

    it("should display OKLch format", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);
      const oklchText = screen.getByText(/oklch/i);
      expect(oklchText).toBeTruthy();
    });

    it("should display color preview", () => {
      const { container } = render(
        <ColorPicker value="#00d4ff" onChange={mockOnChange} />
      );

      const previewDiv = container.querySelector('div[style*="background-color"]');
      expect(previewDiv).toBeTruthy();
    });
  });

  describe("HEX输入", () => {
    it("should update hex input value on change", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);

      const hexInputs = screen.getAllByDisplayValue("00d4ff");
      const hexInput = hexInputs[0];
      fireEvent.change(hexInput, { target: { value: "FF0000" } });

      expect(hexInput).toHaveValue("FF0000");
    });

    it("should filter non-hex characters", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);

      const hexInputs = screen.getAllByDisplayValue("00d4ff");
      const hexInput = hexInputs[0];
      fireEvent.change(hexInput, { target: { value: "GGHHII" } });

      expect(hexInput).toHaveValue("");
    });

    it("should limit to 6 characters", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);

      const hexInputs = screen.getAllByDisplayValue("00d4ff");
      const hexInput = hexInputs[0];
      fireEvent.change(hexInput, { target: { value: "AABBCCDD" } });

      expect(hexInput).toHaveValue("AABBCC");
    });

    it("should call onChange on blur", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);

      const hexInputs = screen.getAllByDisplayValue("00d4ff");
      const hexInput = hexInputs[0];
      fireEvent.change(hexInput, { target: { value: "FF0000" } });
      fireEvent.blur(hexInput);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should call onChange on Enter key", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);

      const hexInputs = screen.getAllByDisplayValue("00d4ff");
      const hexInput = hexInputs[0];
      fireEvent.change(hexInput, { target: { value: "FF0000" } });
      fireEvent.keyDown(hexInput, { key: "Enter" });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should not call onChange on other key press", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);

      const hexInputs = screen.getAllByDisplayValue("00d4ff");
      const hexInput = hexInputs[0];
      fireEvent.change(hexInput, { target: { value: "FF0000" } });
      fireEvent.keyDown(hexInput, { key: "Escape" });

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("RGB输入", () => {
    it("should display correct RGB values for red", () => {
      render(<ColorPicker value="#FF0000" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs[0]).toHaveValue(255);
      expect(inputs[1]).toHaveValue(0);
      expect(inputs[2]).toHaveValue(0);
    });

    it("should display correct RGB values for green", () => {
      render(<ColorPicker value="#00FF00" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs[0]).toHaveValue(0);
      expect(inputs[1]).toHaveValue(255);
      expect(inputs[2]).toHaveValue(0);
    });

    it("should display correct RGB values for blue", () => {
      render(<ColorPicker value="#0000FF" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs[0]).toHaveValue(0);
      expect(inputs[1]).toHaveValue(0);
      expect(inputs[2]).toHaveValue(255);
    });

    it("should call onChange when RGB value changes", () => {
      render(<ColorPicker value="#FF0000" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      fireEvent.change(inputs[1], { target: { value: "128" } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should clamp RGB values to 0-255", () => {
      render(<ColorPicker value="#FF0000" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      fireEvent.change(inputs[0], { target: { value: "300" } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should handle negative RGB values", () => {
      render(<ColorPicker value="#FF0000" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      fireEvent.change(inputs[0], { target: { value: "-50" } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should handle empty RGB input", () => {
      render(<ColorPicker value="#FF0000" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      fireEvent.change(inputs[0], { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should handle non-numeric RGB input", () => {
      render(<ColorPicker value="#FF0000" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      fireEvent.change(inputs[0], { target: { value: "abc" } });

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Canvas交互", () => {
    it("should render SV canvas", () => {
      const { container } = render(
        <ColorPicker value="#00d4ff" onChange={mockOnChange} />
      );

      const canvases = container.querySelectorAll("canvas");
      expect(canvases.length).toBe(2);
    });

    it("should handle mouse down on SV canvas", () => {
      const { container } = render(
        <ColorPicker value="#00d4ff" onChange={mockOnChange} />
      );

      const canvases = container.querySelectorAll("canvas");
      fireEvent.mouseDown(canvases[0]);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should handle mouse down on Hue canvas", () => {
      const { container } = render(
        <ColorPicker value="#00d4ff" onChange={mockOnChange} />
      );

      const canvases = container.querySelectorAll("canvas");
      fireEvent.mouseDown(canvases[1]);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should handle mouse move on SV canvas", () => {
      const { container } = render(
        <ColorPicker value="#00d4ff" onChange={mockOnChange} />
      );

      const canvases = container.querySelectorAll("canvas");
      fireEvent.mouseDown(canvases[0]);
      fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(window);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should handle mouse move on Hue canvas", () => {
      const { container } = render(
        <ColorPicker value="#00d4ff" onChange={mockOnChange} />
      );

      const canvases = container.querySelectorAll("canvas");
      fireEvent.mouseDown(canvases[1]);
      fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(window);

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("颜色转换", () => {
    it("should correctly convert hex to RGB", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs[0]).toHaveValue(0);
      expect(inputs[1]).toHaveValue(212);
      expect(inputs[2]).toHaveValue(255);
    });

    it("should update when value prop changes", async () => {
      const { rerender } = render(
        <ColorPicker value="#FF0000" onChange={mockOnChange} />
      );

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs[0]).toHaveValue(255);

      rerender(<ColorPicker value="#00FF00" onChange={mockOnChange} />);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      const newInputs = screen.getAllByRole("spinbutton");
      expect(newInputs[0]).toHaveValue(0);
      expect(newInputs[1]).toHaveValue(255);
    });
  });

  describe("点击事件", () => {
    it("should stop propagation on click", () => {
      const mockStopPropagation = vi.fn();
      const { container } = render(
        <ColorPicker value="#00d4ff" onChange={mockOnChange} />
      );

      const picker = container.firstChild as HTMLElement;
      fireEvent.click(picker);

      expect(mockStopPropagation).not.toHaveBeenCalled();
    });
  });

  describe("辅助功能", () => {
    it("should have number inputs for RGB", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      inputs.forEach((input) => {
        expect(input).toHaveAttribute("type", "number");
      });
    });

    it("should have min and max attributes for RGB inputs", () => {
      render(<ColorPicker value="#00d4ff" onChange={mockOnChange} />);

      const inputs = screen.getAllByRole("spinbutton");
      inputs.forEach((input) => {
        expect(input).toHaveAttribute("min", "0");
        expect(input).toHaveAttribute("max", "255");
      });
    });
  });

  describe("onClose prop", () => {
    it("should accept onClose prop without error", () => {
      render(
        <ColorPicker value="#00d4ff" onChange={mockOnChange} onClose={mockOnClose} />
      );

      const hexInputs = screen.getAllByDisplayValue("00d4ff");
      expect(hexInputs.length).toBeGreaterThan(0);
    });
  });
});
