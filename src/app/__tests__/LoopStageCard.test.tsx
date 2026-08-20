/**
 * @file: LoopStageCard.test.tsx
 * @description: LoopStageCard.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * LoopStageCard.test.tsx
 * ==============
 * LoopStageCard 组件 - 闭环阶段卡片测试
 *
 * 覆盖范围:
 * - 渲染标签 / 描述 / 状态
 * - idle / running / completed 状态表现
 * - 结果 summary / details / metrics
 * - 连接线
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { LoopStageCard } from "../modules/ops/LoopStageCard";
import type { StageResult, StageMeta } from "../types";

const mockMeta: StageMeta = {
  key: "monitor",
  label: "监测层",
  icon: "Activity",
  color: "#00d4ff",
  description: "实时数据采集 · 指标监控 · 异常检测",
};

describe("LoopStageCard", () => {
  afterEach(() => {
    cleanup();
  });

  describe("idle 状态", () => {
    const idleResult: StageResult = {
      stage: "monitor",
      status: "idle",
      startedAt: null,
      completedAt: null,
      duration: null,
      summary: "",
      details: [],
    };

    it("应渲染阶段标签", () => {
      render(<LoopStageCard meta={mockMeta} result={idleResult} index={0} isActive={false} />);
      expect(screen.getAllByText("监测层")[0]).toBeInTheDocument();
    });

    it("应显示待执行状态", () => {
      render(<LoopStageCard meta={mockMeta} result={idleResult} index={0} isActive={false} />);
      expect(screen.getAllByText("待执行")[0]).toBeInTheDocument();
    });

    it("应渲染描述", () => {
      render(<LoopStageCard meta={mockMeta} result={idleResult} index={0} isActive={false} />);
      expect(screen.getAllByText("实时数据采集 · 指标监控 · 异常检测")[0]).toBeInTheDocument();
    });

    it("应有 data-testid", () => {
      render(<LoopStageCard meta={mockMeta} result={idleResult} index={0} isActive={false} />);
      expect(screen.getAllByTestId("loop-stage-monitor")[0]).toBeInTheDocument();
    });
  });

  describe("running 状态", () => {
    const runningResult: StageResult = {
      stage: "monitor",
      status: "running",
      startedAt: Date.now(),
      completedAt: null,
      duration: null,
      summary: "",
      details: [],
    };

    it("应显示执行中状态", () => {
      render(<LoopStageCard meta={mockMeta} result={runningResult} index={0} isActive={true} />);
      expect(screen.getAllByText("执行中")[0]).toBeInTheDocument();
    });
  });

  describe("completed 状态", () => {
    const completedResult: StageResult = {
      stage: "monitor",
      status: "completed",
      startedAt: Date.now() - 1500,
      completedAt: Date.now(),
      duration: 1500,
      summary: "采集 13 个节点数据",
      details: ["GPU-A100-03 推理延迟异常", "其余 11 个节点正常"],
      metrics: { nodes_scanned: 13, anomalies: 2 },
    };

    it("应显示已完成状态", () => {
      render(<LoopStageCard meta={mockMeta} result={completedResult} index={0} isActive={false} />);
      expect(screen.getAllByText("已完成")[0]).toBeInTheDocument();
    });

    it("应渲染 summary", () => {
      render(<LoopStageCard meta={mockMeta} result={completedResult} index={0} isActive={false} />);
      expect(screen.getAllByText("采集 13 个节点数据")[0]).toBeInTheDocument();
    });

    it("应渲染 details", () => {
      render(<LoopStageCard meta={mockMeta} result={completedResult} index={0} isActive={false} />);
      expect(screen.getAllByText("GPU-A100-03 推理延迟异常")[0]).toBeInTheDocument();
    });

    it("应渲染 metrics", () => {
      render(<LoopStageCard meta={mockMeta} result={completedResult} index={0} isActive={false} />);
      expect(screen.getAllByText("nodes_scanned: 13")[0]).toBeInTheDocument();
      expect(screen.getAllByText("anomalies: 2")[0]).toBeInTheDocument();
    });

    it("应渲染耗时", () => {
      render(<LoopStageCard meta={mockMeta} result={completedResult} index={0} isActive={false} />);
      expect(screen.getAllByText("1.5s")[0]).toBeInTheDocument();
    });
  });

  describe("连接线", () => {
    const idleResult: StageResult = {
      stage: "monitor",
      status: "idle",
      startedAt: null,
      completedAt: null,
      duration: null,
      summary: "",
      details: [],
    };

    it("showConnector=true 应渲染连接线", () => {
      const { container } = render(
        <LoopStageCard meta={mockMeta} result={idleResult} index={0} isActive={false} showConnector />
      );
      const connector = container.querySelector(".w-0\\.5");
      expect(connector).toBeTruthy();
    });
  });
});
