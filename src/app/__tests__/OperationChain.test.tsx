/**
 * @file: OperationChain.test.tsx
 * @description: OperationChain.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * OperationChain.test.tsx
 * ==============
 * OperationChain 组件 - 时间线渲染测试
 *
 * 覆盖范围:
 * - 空数据提示
 * - 事件列表渲染
 * - 当前事件高亮标记
 * - compact 模式
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { OperationChain } from "../modules/ops/OperationChain";
import type { ChainEvent } from "../types";

const mockEvents: ChainEvent[] = [
  { id: "c1", time: "10:23:45", type: "model_load", label: "模型加载 LLaMA-70B", detail: "节点: GPU-A100-03" },
  { id: "c2", time: "10:24:12", type: "task_start", label: "推理任务启动", detail: "任务: #12847" },
  { id: "c3", time: "10:24:15", type: "alert_trigger", label: "延迟异常告警", detail: "告警: #AL-0032", isCurrent: true },
  { id: "c4", time: "10:24:30", type: "auto_action", label: "系统自动降频", detail: "操作: auto_scale_down" },
];

describe("OperationChain", () => {
  afterEach(() => {
    cleanup();
  });

  describe("空数据", () => {
    it("无事件时应渲染空提示", () => {
      render(<OperationChain events={[]} />);
      expect(screen.getAllByText("暂无操作链路数据")[0]).toBeInTheDocument();
    });
  });

  describe("事件渲染", () => {
    it("应渲染所有事件的时间戳", () => {
      render(<OperationChain events={mockEvents} />);
      expect(screen.getAllByText("10:23:45")[0]).toBeInTheDocument();
      expect(screen.getAllByText("10:24:12")[0]).toBeInTheDocument();
      expect(screen.getAllByText("10:24:15")[0]).toBeInTheDocument();
      expect(screen.getAllByText("10:24:30")[0]).toBeInTheDocument();
    });

    it("应渲染所有事件的标签", () => {
      render(<OperationChain events={mockEvents} />);
      expect(screen.getAllByText("模型加载 LLaMA-70B")[0]).toBeInTheDocument();
      expect(screen.getAllByText("推理任务启动")[0]).toBeInTheDocument();
      expect(screen.getAllByText("延迟异常告警")[0]).toBeInTheDocument();
      expect(screen.getAllByText("系统自动降频")[0]).toBeInTheDocument();
    });

    it("应渲染所有事件的详情", () => {
      render(<OperationChain events={mockEvents} />);
      expect(screen.getAllByText("节点: GPU-A100-03")[0]).toBeInTheDocument();
      expect(screen.getAllByText("任务: #12847")[0]).toBeInTheDocument();
    });

    it("应渲染正确数量的事件", () => {
      const { container } = render(<OperationChain events={mockEvents} />);
      const timestamps = container.querySelectorAll("[class*=\"font-\\[Rajdhani\"]");
      expect(timestamps.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("当前事件标记", () => {
    it("当前事件应显示「当前」标签", () => {
      render(<OperationChain events={mockEvents} />);
      expect(screen.getAllByText("当前")[0]).toBeInTheDocument();
    });

    it("非当前事件不应有额外标记", () => {
      const eventsNoCurrent = mockEvents.map((e) => ({ ...e, isCurrent: false }));
      render(<OperationChain events={eventsNoCurrent} />);
      expect(screen.queryByText("当前")).not.toBeInTheDocument();
    });
  });

  describe("compact 模式", () => {
    it("compact 模式应正常渲染", () => {
      render(<OperationChain events={mockEvents} compact />);
      expect(screen.getAllByText("模型加载 LLaMA-70B")[0]).toBeInTheDocument();
      expect(screen.getAllByText("当前")[0]).toBeInTheDocument();
    });
  });
});
