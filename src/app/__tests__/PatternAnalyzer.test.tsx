/**
 * @file: PatternAnalyzer.test.tsx
 * @description: PatternAnalyzer.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * PatternAnalyzer.test.tsx
 * =============
 * PatternAnalyzer 组件 - 异常模式分析器测试
 *
 * 覆盖范围:
 * - 模式列表渲染
 * - 严重级别标签
 * - 忽略/选中回调
 * - 空状态
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PatternAnalyzer } from "../modules/monitor/PatternAnalyzer";
import type { DetectedPattern } from "../types";

const mockPatterns: DetectedPattern[] = [
  {
    id: "pat-1", type: "latency_spike", severity: "critical",
    title: "GPU-A100-03 延迟异常", description: "连续超时",
    source: "GPU-A100-03", metric: "2,450ms > 2,000ms",
    detectedAt: Date.now(), occurrences: 3, trend: "rising",
  },
  {
    id: "pat-2", type: "memory_pressure", severity: "medium",
    title: "显存压力过大", description: "89%+ 占用",
    source: "GPU-A100-03", metric: "89% > 85%",
    detectedAt: Date.now(), occurrences: 5, trend: "stable",
  },
];

describe("PatternAnalyzer", () => {
  let onDismiss: any;
  let onSelectPattern: any;

  beforeEach(() => {
    onDismiss = vi.fn();
    onSelectPattern = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("应渲染所有模式标题", () => {
      render(<PatternAnalyzer patterns={mockPatterns} onDismiss={onDismiss} />);
      expect(screen.getAllByText("GPU-A100-03 延迟异常")[0]).toBeInTheDocument();
      expect(screen.getAllByText("显存压力过大")[0]).toBeInTheDocument();
    });

    it("应渲染严重级别标签", () => {
      render(<PatternAnalyzer patterns={mockPatterns} onDismiss={onDismiss} />);
      expect(screen.getAllByText("严重")[0]).toBeInTheDocument();
      expect(screen.getAllByText("中")[0]).toBeInTheDocument();
    });

    it("应渲染指标", () => {
      render(<PatternAnalyzer patterns={mockPatterns} onDismiss={onDismiss} />);
      expect(screen.getAllByText("2,450ms > 2,000ms")[0]).toBeInTheDocument();
    });

    it("应渲染来源", () => {
      render(<PatternAnalyzer patterns={mockPatterns} onDismiss={onDismiss} />);
      expect(screen.getAllByText("GPU-A100-03").length).toBeGreaterThan(0);
    });

    it("应渲染趋势", () => {
      render(<PatternAnalyzer patterns={mockPatterns} onDismiss={onDismiss} />);
      expect(screen.getAllByText("趋势 上升")[0]).toBeInTheDocument();
      expect(screen.getAllByText("趋势 稳定")[0]).toBeInTheDocument();
    });

    it("应有 data-testid", () => {
      render(<PatternAnalyzer patterns={mockPatterns} onDismiss={onDismiss} />);
      expect(screen.getAllByTestId("pattern-analyzer")[0]).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("点击忽略应触发 onDismiss", () => {
      render(<PatternAnalyzer patterns={mockPatterns} onDismiss={onDismiss} />);
      fireEvent.click(screen.getAllByTestId("dismiss-pat-1")[0]);
      expect(onDismiss).toHaveBeenCalledWith("pat-1");
    });

    it("点击模式应触发 onSelectPattern", () => {
      render(
        <PatternAnalyzer patterns={mockPatterns} onDismiss={onDismiss} onSelectPattern={onSelectPattern} />
      );
      fireEvent.click(screen.getAllByTestId("pattern-pat-2")[0]);
      expect(onSelectPattern).toHaveBeenCalledWith("pat-2");
    });

    it("选中模式应有高亮样式", () => {
      render(
        <PatternAnalyzer patterns={mockPatterns} onDismiss={onDismiss} selectedPatternId="pat-1" />
      );
      const el = screen.getAllByTestId("pattern-pat-1")[0];
      expect(el.className).toContain("border-[rgba(0,212,255,0.3)]");
    });
  });

  describe("空状态", () => {
    it("无模式时应显示正常提示", () => {
      render(<PatternAnalyzer patterns={[]} onDismiss={onDismiss} />);
      expect(screen.getAllByText("未检测到异常模式")[0]).toBeInTheDocument();
    });
  });
});
