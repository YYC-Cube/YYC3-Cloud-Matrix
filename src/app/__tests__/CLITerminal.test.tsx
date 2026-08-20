/**
 * @file: CLITerminal.test.tsx
 * @description: CLITerminal 组件测试套件
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-03-31
 * @updated: 2026-04-01
 * @status: active
 * @tags: [component],[terminal]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import * as React from "react";
import { CLITerminal } from "../modules/dev/CLITerminal";

const mockExecute = vi.fn();
const mockHandleInputChange = vi.fn();
const mockHandleHistoryNav = vi.fn();
const mockApplyCompletion = vi.fn();

vi.mock("lucide-react", () => ({
  Terminal: () => React.createElement("span", { "data-testid": "icon-terminal" }),
  ChevronRight: () => React.createElement("span", { "data-testid": "icon-chevron" }),
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

const defaultMockHistory: Array<{ id: string; input: string; output: string; status: "success" | "error" | "info" }> = [];

vi.mock("../hooks/useTerminal", () => ({
  useTerminal: () => ({
    history: defaultMockHistory,
    inputValue: "",
    completions: [],
    execute: mockExecute,
    handleInputChange: mockHandleInputChange,
    handleHistoryNav: mockHandleHistoryNav,
    applyCompletion: mockApplyCompletion,
  }),
}));

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "nav.terminal": "CLI 终端",
        "nav.ide": "IDE",
        "monitor.commonCommands": "常用命令",
      };
      return translations[key] || key;
    },
  }),
}));

describe("CLITerminal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultMockHistory.length = 0;
  });

  afterEach(() => {
    cleanup();
  });

  describe("基本渲染", () => {
    it("应该渲染终端图标", () => {
      render(React.createElement(CLITerminal));
      expect(screen.getByTestId("icon-terminal")).toBeInTheDocument();
    });

    it("应该渲染终端标题", () => {
      render(React.createElement(CLITerminal));
      expect(screen.getByText("CLI 终端")).toBeInTheDocument();
    });

    it("应该渲染终端窗口区域", () => {
      render(React.createElement(CLITerminal));
      expect(screen.getByTestId("cli-terminal")).toBeInTheDocument();
    });

    it("应该渲染输入框", () => {
      render(React.createElement(CLITerminal));
      expect(screen.getByTestId("cli-input")).toBeInTheDocument();
    });

    it("应该渲染命令提示符", () => {
      render(React.createElement(CLITerminal));
      expect(screen.getByText("admin@cpim")).toBeInTheDocument();
    });

    it("应该渲染常用命令提示", () => {
      render(React.createElement(CLITerminal));
      expect(screen.getByText("常用命令")).toBeInTheDocument();
    });

    it("应该渲染快捷命令按钮", () => {
      render(React.createElement(CLITerminal));
      expect(screen.getByText("cpim status")).toBeInTheDocument();
      expect(screen.getByText("cpim node")).toBeInTheDocument();
      expect(screen.getByText("cpim alerts")).toBeInTheDocument();
    });
  });

  describe("键盘交互", () => {
    it("应该在 Enter 时执行命令", () => {
      render(React.createElement(CLITerminal));
      const input = screen.getByTestId("cli-input");
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockExecute).toHaveBeenCalled();
    });

    it("应该在 ArrowUp 时导航历史", () => {
      render(React.createElement(CLITerminal));
      const input = screen.getByTestId("cli-input");
      fireEvent.keyDown(input, { key: "ArrowUp" });
      expect(mockHandleHistoryNav).toHaveBeenCalledWith("up");
    });

    it("应该在 ArrowDown 时导航历史", () => {
      render(React.createElement(CLITerminal));
      const input = screen.getByTestId("cli-input");
      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(mockHandleHistoryNav).toHaveBeenCalledWith("down");
    });

    it("应该在 Tab 时应用补全", () => {
      render(React.createElement(CLITerminal));
      const input = screen.getByTestId("cli-input");
      fireEvent.keyDown(input, { key: "Tab" });
    });

    it("应该在输入时调用 handleInputChange", () => {
      render(React.createElement(CLITerminal));
      const input = screen.getByTestId("cli-input");
      fireEvent.change(input, { target: { value: "test" } });
      expect(mockHandleInputChange).toHaveBeenCalledWith("test");
    });
  });

  describe("快捷命令", () => {
    it("应该在点击快捷命令时执行", () => {
      render(React.createElement(CLITerminal));
      const btn = screen.getByText("cpim status");
      fireEvent.click(btn);
      expect(mockHandleInputChange).toHaveBeenCalledWith("cpim status");
      expect(mockExecute).toHaveBeenCalledWith("cpim status");
    });

    it("应该在点击中文命令时执行", () => {
      render(React.createElement(CLITerminal));
      const btn = screen.getByText("ai 查看节点状态");
      fireEvent.click(btn);
      expect(mockExecute).toHaveBeenCalledWith("ai 查看节点状态");
    });
  });
});
