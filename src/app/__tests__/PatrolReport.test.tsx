/**
 * @file: PatrolReport.test.tsx
 * @description: PatrolReport.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * PatrolReport.test.tsx
 * ============
 * PatrolReport 组件 - 巡查报告测试
 *
 * 覆盖范围:
 * - 健康度分数渲染
 * - 触发类型标签
 * - 分类分组显示
 * - 展开/折叠分类
 * - 状态图标（pass/warning/critical）
 * - 空检查数据提示
 */

import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PatrolReport } from "../modules/monitor/PatrolReport";
import type { PatrolResult } from "../types";

const mockResult: PatrolResult = {
  id: "patrol-1",
  timestamp: Date.now(),
  duration: 12,
  status: "completed",
  healthScore: 92,
  totalChecks: 5,
  passCount: 3,
  warningCount: 1,
  criticalCount: 1,
  skippedCount: 0,
  triggeredBy: "manual",
  checks: [
    { id: "n1", category: "节点健康", label: "GPU-A100-01", status: "pass", value: "正常" },
    { id: "n2", category: "节点健康", label: "GPU-A100-02", status: "pass", value: "正常" },
    { id: "n3", category: "节点健康", label: "GPU-A100-03", status: "warning", value: "延迟高", detail: "2,450ms" },
    { id: "s1", category: "存储", label: "NAS-01", status: "pass", value: "62%", threshold: "85%" },
    { id: "k1", category: "网络", label: "延迟", status: "critical", value: "120ms", threshold: "50ms" },
  ],
};

describe("PatrolReport", () => {

afterEach(() => {
  cleanup();
});
  // ----------------------------------------------------------
  // 基础渲染
  // ----------------------------------------------------------

  describe("基础渲染", () => {

afterEach(() => {
  cleanup();
});
    it("应渲染巡查报告标题", () => {
      render(<PatrolReport result={mockResult} />);
      expect(screen.getAllByText("巡查报告")[0]).toBeInTheDocument();
    });

    it("应渲染健康度分数", () => {
      render(<PatrolReport result={mockResult} />);
      expect(screen.getAllByText("92")[0]).toBeInTheDocument();
    });

    it("应渲染耗时", () => {
      render(<PatrolReport result={mockResult} />);
      expect(screen.getAllByText("耗时 12s")[0]).toBeInTheDocument();
    });

    it("应渲染触发类型标签", () => {
      render(<PatrolReport result={mockResult} />);
      expect(screen.getAllByText("手动")[0]).toBeInTheDocument();
    });

    it("auto 触发应显示「自动」", () => {
      render(<PatrolReport result={{ ...mockResult, triggeredBy: "auto" }} />);
      expect(screen.getAllByText("自动")[0]).toBeInTheDocument();
    });

    it("scheduled 触发应显示「计划」", () => {
      render(<PatrolReport result={{ ...mockResult, triggeredBy: "scheduled" }} />);
      expect(screen.getAllByText("计划")[0]).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 统计 Badges
  // ----------------------------------------------------------

  describe("统计 Badges", () => {

afterEach(() => {
  cleanup();
});
    it("应显示通过数量 badge", () => {
      render(<PatrolReport result={mockResult} />);
      expect(screen.getAllByText("3")[0]).toBeInTheDocument();
    });

    it("应显示警告数量 badge", () => {
      render(<PatrolReport result={mockResult} />);
      expect(screen.getAllByText("1")[0]).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 分类分组
  // ----------------------------------------------------------

  describe("分类分组", () => {

afterEach(() => {
  cleanup();
});
    it("应渲染 3 个分类组", () => {
      render(<PatrolReport result={mockResult} />);
      expect(screen.getAllByText("节点健康")[0]).toBeInTheDocument();
      expect(screen.getAllByText("存储")[0]).toBeInTheDocument();
      expect(screen.getAllByText("网络")[0]).toBeInTheDocument();
    });

    it("应显示每个分类的检查项数量", () => {
      render(<PatrolReport result={mockResult} />);
      expect(screen.getAllByText("(3)")[0]).toBeInTheDocument(); // 节点健康: 3
      expect(screen.getAllByText("(1)")[0]).toBeInTheDocument(); // 存储: 1 or 网络: 1
    });
  });

  // ----------------------------------------------------------
  // 展开/折叠
  // ----------------------------------------------------------

  describe("展开/折叠", () => {

afterEach(() => {
  cleanup();
});
    it("点击分类标题应展开检查项", () => {
      render(<PatrolReport result={mockResult} />);
      fireEvent.click(screen.getAllByText("节点健康")[0]);
      expect(screen.getAllByText("GPU-A100-01")[0]).toBeInTheDocument();
      expect(screen.getAllByText("GPU-A100-02")[0]).toBeInTheDocument();
      expect(screen.getAllByText("GPU-A100-03")[0]).toBeInTheDocument();
    });

    it("再次点击应折叠", () => {
      render(<PatrolReport result={mockResult} />);
      fireEvent.click(screen.getAllByText("节点健康")[0]);
      expect(screen.getAllByText("GPU-A100-01")[0]).toBeInTheDocument();
      fireEvent.click(screen.getAllByText("节点健康")[0]);
      expect(screen.queryByText("GPU-A100-01")).not.toBeInTheDocument();
    });

    it("展开后应显示检查值", () => {
      render(<PatrolReport result={mockResult} />);
      fireEvent.click(screen.getAllByText("网络")[0]);
      expect(screen.getAllByText("120ms")[0]).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 空数据
  // ----------------------------------------------------------

  describe("空检查数据", () => {

afterEach(() => {
  cleanup();
});
    it("无检查项时应显示提示", () => {
      render(<PatrolReport result={{ ...mockResult, checks: [] }} />);
      expect(screen.getAllByText("巡查历史报告（无详细检查数据）")[0]).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // embedded 模式
  // ----------------------------------------------------------

  describe("embedded 模式", () => {

afterEach(() => {
  cleanup();
});
    it("embedded 模式应正常渲染", () => {
      render(<PatrolReport result={mockResult} embedded />);
      expect(screen.getAllByText("巡查报告")[0]).toBeInTheDocument();
      expect(screen.getAllByText("92")[0]).toBeInTheDocument();
    });
  });
});
