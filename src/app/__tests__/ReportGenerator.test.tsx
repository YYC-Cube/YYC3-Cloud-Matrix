/**
 * @file: ReportGenerator.test.tsx
 * @description: ReportGenerator.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * ReportGenerator.test.tsx
 * =============
 * ReportGenerator 组件 - 报告生成器测试
 *
 * 覆盖范围:
 * - 表单渲染 (类型 / 格式 / 时间范围)
 * - 生成按钮
 * - 已生成报告列表
 * - 预览面板
 * - 复选框选项
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ReportGenerator } from "../modules/ops/ReportGenerator";
import type { ReportResult } from "../types";

const mockReports: ReportResult[] = [
  {
    id: "rpt-1",
    config: { type: "performance", format: "json", dateRange: "today", includeCharts: true, includeRawData: false },
    generatedAt: Date.now() - 3600000,
    filename: "yyc3-performance-2026-02-25.json",
    size: 4500,
    previewContent: '{"report":{"type":"performance"}}',
  },
];

describe("ReportGenerator", () => {
  let onGenerate: any;

  beforeEach(() => {
    onGenerate = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("应渲染标题", () => {
      render(<ReportGenerator reports={[]} isGenerating={false} onGenerate={onGenerate} />);
      expect(screen.getAllByText("报告生成器")[0]).toBeInTheDocument();
    });

    it("应渲染 4 个报告类型按钮", () => {
      render(<ReportGenerator reports={[]} isGenerating={false} onGenerate={onGenerate} />);
      expect(screen.getAllByTestId("type-performance")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("type-health")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("type-security")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("type-custom")[0]).toBeInTheDocument();
    });

    it("应渲染 3 个格式按钮", () => {
      render(<ReportGenerator reports={[]} isGenerating={false} onGenerate={onGenerate} />);
      expect(screen.getAllByTestId("format-json")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("format-markdown")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("format-csv")[0]).toBeInTheDocument();
    });

    it("应渲染 3 个时间范围按钮", () => {
      render(<ReportGenerator reports={[]} isGenerating={false} onGenerate={onGenerate} />);
      expect(screen.getAllByTestId("range-today")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("range-week")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("range-month")[0]).toBeInTheDocument();
    });

    it("应渲染生成按钮", () => {
      render(<ReportGenerator reports={[]} isGenerating={false} onGenerate={onGenerate} />);
      expect(screen.getAllByTestId("generate-btn")[0]).toBeInTheDocument();
    });

    it("应渲染复选框", () => {
      render(<ReportGenerator reports={[]} isGenerating={false} onGenerate={onGenerate} />);
      expect(screen.getAllByTestId("include-charts")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("include-rawdata")[0]).toBeInTheDocument();
    });
  });

  describe("生成操作", () => {
    it("点击生成按钮应触发 onGenerate", async () => {
      render(<ReportGenerator reports={[]} isGenerating={false} onGenerate={onGenerate} />);
      fireEvent.click(screen.getAllByTestId("generate-btn")[0]);
      expect(onGenerate).toHaveBeenCalledWith({
        type: "performance",
        format: "json",
        dateRange: "today",
        includeCharts: true,
        includeRawData: false,
      });
    });

    it("切换类型后应传递正确 config", async () => {
      render(<ReportGenerator reports={[]} isGenerating={false} onGenerate={onGenerate} />);
      fireEvent.click(screen.getAllByTestId("type-health")[0]);
      fireEvent.click(screen.getAllByTestId("format-markdown")[0]);
      fireEvent.click(screen.getAllByTestId("range-week")[0]);
      fireEvent.click(screen.getAllByTestId("generate-btn")[0]);
      expect(onGenerate).toHaveBeenCalledWith({
        type: "health",
        format: "markdown",
        dateRange: "week",
        includeCharts: true,
        includeRawData: false,
      });
    });

    it("isGenerating 时应显示加载状态", () => {
      render(<ReportGenerator reports={[]} isGenerating={true} onGenerate={onGenerate} />);
      expect(screen.getAllByText("生成中...")[0]).toBeInTheDocument();
    });

    it("isGenerating 时生成按钮应禁用", () => {
      render(<ReportGenerator reports={[]} isGenerating={true} onGenerate={onGenerate} />);
      const btn = screen.getAllByTestId("generate-btn")[0];
      expect(btn).toBeDisabled();
    });
  });

  describe("已生成报告", () => {
    it("有报告时应渲染已生成报告列表", () => {
      render(<ReportGenerator reports={mockReports} isGenerating={false} onGenerate={onGenerate} />);
      expect(screen.queryByTestId("report-list")).toBeInTheDocument();
      expect(screen.getAllByText("yyc3-performance-2026-02-25.json")[0]).toBeInTheDocument();
    });

    it("点击预览按钮应显示预览内容", () => {
      render(<ReportGenerator reports={mockReports} isGenerating={false} onGenerate={onGenerate} />);
      fireEvent.click(screen.getAllByTestId("preview-rpt-1")[0]);
      expect(screen.getAllByTestId("report-preview")[0]).toBeInTheDocument();
    });

    it("无报告时不应渲染报告列表", () => {
      render(<ReportGenerator reports={[]} isGenerating={false} onGenerate={onGenerate} />);
      expect(screen.queryByTestId("report-list")).not.toBeInTheDocument();
    });
  });
});
