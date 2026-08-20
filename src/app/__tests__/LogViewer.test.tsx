/**
 * @file: LogViewer.test.tsx
 * @description: LogViewer.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * LogViewer.test.tsx
 * ===========
 * LogViewer 组件 - 日志查看器测试
 *
 * 覆盖范围:
 * - 日志条目渲染
 * - 级别筛选按钮
 * - 来源筛选下拉框
 * - 搜索输入
 * - 空状态
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { LogViewer } from "../modules/ops/LogViewer";
import type { LogEntry } from "../types";

const mockLogs: LogEntry[] = [
  { id: "l1", timestamp: Date.now(),        level: "info",  source: "GPU-A100-01", message: "推理完成 延迟 820ms" },
  { id: "l2", timestamp: Date.now() - 60000, level: "warn",  source: "system",      message: "温度接近阈值 78°C" },
  { id: "l3", timestamp: Date.now() - 120000,level: "error", source: "GPU-A100-03", message: "推理超时 5000ms" },
  { id: "l4", timestamp: Date.now() - 180000,level: "debug", source: "scheduler",   message: "心跳 ack 12ms" },
];

const sources = ["GPU-A100-01", "GPU-A100-03", "system", "scheduler"];

describe("LogViewer", () => {
  let onLevelChange: any;
  let onSourceChange: any;
  let onSearchChange: any;

  beforeEach(() => {
    cleanup();
    onLevelChange = vi.fn() as any;
    onSourceChange = vi.fn() as any;
    onSearchChange = vi.fn() as any;
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("应渲染标题", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByText("日志查看器")[0]).toBeInTheDocument();
    });

    it("应渲染日志数量", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByText("(4 条)")[0]).toBeInTheDocument();
    });

    it("应渲染日志消息", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByText("推理完成 延迟 820ms")[0]).toBeInTheDocument();
      expect(screen.getAllByText("推理超时 5000ms")[0]).toBeInTheDocument();
    });

    it("应有 data-testid", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByTestId("log-viewer")[0]).toBeInTheDocument();
    });
  });

  describe("级别筛选", () => {
    it("应渲染 6 个级别按钮", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByTestId("level-all")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("level-error")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("level-warn")[0]).toBeInTheDocument();
    });

    it("点击级别按钮应触发 onLevelChange", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      fireEvent.click(screen.getAllByTestId("level-error")[0]);
      expect(onLevelChange).toHaveBeenCalledWith("error");
    });
  });

  describe("来源筛选", () => {
    it("应渲染来源下拉框", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByTestId("source-filter")[0]).toBeInTheDocument();
    });

    it("更改来源应触发 onSourceChange", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      fireEvent.change(screen.getAllByTestId("source-filter")[0], { target: { value: "system" } });
      expect(onSourceChange).toHaveBeenCalledWith("system");
    });
  });

  describe("搜索", () => {
    it("应渲染搜索框", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByTestId("log-search")[0]).toBeInTheDocument();
    });

    it("输入搜索应触发 onSearchChange", () => {
      render(
        <LogViewer logs={mockLogs} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={sources} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      fireEvent.change(screen.getAllByTestId("log-search")[0], { target: { value: "超时" } });
      expect(onSearchChange).toHaveBeenCalledWith("超时");
    });
  });

  describe("空状态", () => {
    it("无日志时应显示空提示", () => {
      render(
        <LogViewer logs={[]} levelFilter="all" sourceFilter="all" searchQuery=""
          sources={[]} onLevelChange={onLevelChange} onSourceChange={onSourceChange}
          onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByText("暂无匹配日志")[0]).toBeInTheDocument();
    });
  });
});
