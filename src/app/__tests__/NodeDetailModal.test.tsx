/**
 * @file: NodeDetailModal.test.tsx
 * @description: NodeDetailModal.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * NodeDetailModal.test.tsx
 * =============
 * NodeDetailModal 组件 - 渲染测试
 *
 * 覆盖范围:
 * - 节点信息展示
 * - 状态标签映射
 * - 关闭按钮
 * - 操作按钮
 * - Recharts 图表渲染
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { NodeDetailModal } from "../modules/monitor/NodeDetailModal";
import type { NodeData } from "../types";

// Mock recharts (jsdom 不支持 SVG 渲染)
vi.mock("recharts", () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const mockActiveNode: NodeData = {
  id: "GPU-A100-01",
  status: "active",
  gpu: 87,
  mem: 72,
  temp: 68,
  model: "LLaMA-70B",
  tasks: 128,
};

const mockWarningNode: NodeData = {
  id: "GPU-A100-03",
  status: "warning",
  gpu: 98,
  mem: 94,
  temp: 82,
  model: "DeepSeek-V3",
  tasks: 89,
};

const mockInactiveNode: NodeData = {
  id: "GPU-H100-03",
  status: "inactive",
  gpu: 0,
  mem: 12,
  temp: 32,
  model: "-",
  tasks: 0,
};

describe("NodeDetailModal", () => {

afterEach(() => {
  cleanup();
});
  const mockOnClose = vi.fn() as any;

  // ----------------------------------------------------------
  // 节点信息渲染
  // ----------------------------------------------------------

  describe("节点信息渲染", () => {

afterEach(() => {
  cleanup();
});
    it("应显示节点 ID", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("GPU-A100-01")[0]).toBeInTheDocument();
    });

    it("active 节点应显示'运行中'标签", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("运行中")[0]).toBeInTheDocument();
    });

    it("warning 节点应显示'预警'标签", () => {
      render(<NodeDetailModal node={mockWarningNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("预警")[0]).toBeInTheDocument();
    });

    it("inactive 节点应显示'离线'标签", () => {
      render(<NodeDetailModal node={mockInactiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("离线")[0]).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 指标显示
  // ----------------------------------------------------------

  describe("指标显示", () => {

afterEach(() => {
  cleanup();
});
    it("应显示 GPU 负载", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("87%")[0]).toBeInTheDocument();
      expect(screen.getAllByText("GPU 负载")[0]).toBeInTheDocument();
    });

    it("应显示内存使用", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("72%")[0]).toBeInTheDocument();
      expect(screen.getAllByText("内存使用")[0]).toBeInTheDocument();
    });

    it("应显示温度", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("68°C")[0]).toBeInTheDocument();
      expect(screen.getAllByText("温度")[0]).toBeInTheDocument();
    });

    it("应显示任务数", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("128")[0]).toBeInTheDocument();
      expect(screen.getAllByText("任务数")[0]).toBeInTheDocument();
    });

    it("应显示当前部署的模型", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("LLaMA-70B")[0]).toBeInTheDocument();
      expect(screen.getAllByText("当前模型")[0]).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 图表
  // ----------------------------------------------------------

  describe("图表渲染", () => {

afterEach(() => {
  cleanup();
});
    it("应渲染历史负载趋势标题", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("历史负载趋势")[0]).toBeInTheDocument();
    });

    it("应渲染 LineChart 组件", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByTestId("line-chart")[0]).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 操作按钮
  // ----------------------------------------------------------

  describe("操作按钮", () => {

afterEach(() => {
  cleanup();
});
    it("应包含查看日志按钮", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("查看日志")[0]).toBeInTheDocument();
    });

    it("应包含重启节点按钮", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("重启节点")[0]).toBeInTheDocument();
    });

    it("应包含移除节点按钮", () => {
      render(<NodeDetailModal node={mockActiveNode} onClose={mockOnClose} />);
      expect(screen.getAllByText("移除节点")[0]).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 关闭
  // ----------------------------------------------------------

  describe("关闭交互", () => {

afterEach(() => {
  cleanup();
});
    it("点击遮罩层应触发关闭", () => {
      const handleClose = vi.fn() as any;
      const { container } = render(
        <NodeDetailModal node={mockActiveNode} onClose={handleClose} />
      );
      // 点击最外层容器（遮罩层）
      fireEvent.click(container.firstElementChild!);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("点击弹窗内容不应触发关闭（事件阻止冒泡）", () => {
      const handleClose = vi.fn() as any;
      render(
        <NodeDetailModal node={mockActiveNode} onClose={handleClose} />
      );
      // 点击弹窗内部内容
      fireEvent.click(screen.getAllByText("GPU-A100-01")[0]);
      expect(handleClose).not.toHaveBeenCalled();
    });
  });
});
