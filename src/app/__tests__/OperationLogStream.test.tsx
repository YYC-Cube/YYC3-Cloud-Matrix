/**
 * @file: OperationLogStream.test.tsx
 * @description: OperationLogStream.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * OperationLogStream.test.tsx
 * ===============
 * OperationLogStream 组件 - 实时日志流测试
 *
 * 覆盖范围:
 * - 日志列表渲染
 * - 筛选 Tab 切换
 * - 搜索输入框
 * - 空状态
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { OperationLogStream } from "../modules/ops/OperationLogStream";
import type { OperationLogEntry } from "../types";

const mockLogs: OperationLogEntry[] = [
  { id: "log1", timestamp: Date.now(), category: "node",   action: "重启节点 GPU-A100-03", user: "admin",  status: "success", duration: 2500 },
  { id: "log2", timestamp: Date.now() - 60000, category: "model",  action: "部署 LLaMA-70B",       user: "dev_yang", status: "success", duration: 5000 },
  { id: "log3", timestamp: Date.now() - 120000, category: "system", action: "清理推理缓存",         user: "admin",  status: "failed", duration: 800 },
  { id: "log4", timestamp: Date.now() - 180000, category: "task",   action: "暂停推理队列",         user: "admin",  status: "running" },
];

describe("OperationLogStream", () => {
  let onFilterChange: any;
  let onSearchChange: any;

  beforeEach(() => {
    cleanup();
    onFilterChange = vi.fn() as any;
    onSearchChange = vi.fn() as any;
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("应渲染标题", () => {
      render(
        <OperationLogStream logs={mockLogs} filter="all" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByText("操作日志")[0]).toBeInTheDocument();
    });

    it("应渲染日志数量", () => {
      render(
        <OperationLogStream logs={mockLogs} filter="all" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByText("(4)")[0]).toBeInTheDocument();
    });

    it("应渲染所有日志操作名", () => {
      render(
        <OperationLogStream logs={mockLogs} filter="all" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByText("重启节点 GPU-A100-03")[0]).toBeInTheDocument();
      expect(screen.getAllByText("部署 LLaMA-70B")[0]).toBeInTheDocument();
      expect(screen.getAllByText("清理推理缓存")[0]).toBeInTheDocument();
    });

    it("应有 data-testid", () => {
      render(
        <OperationLogStream logs={mockLogs} filter="all" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByTestId("operation-log-stream")[0]).toBeInTheDocument();
    });
  });

  describe("筛选 Tab", () => {
    it("应渲染 4 个筛选按钮", () => {
      render(
        <OperationLogStream logs={mockLogs} filter="all" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByText("实时流")[0]).toBeInTheDocument();
      expect(screen.getAllByText("按类型")[0]).toBeInTheDocument();
      expect(screen.getAllByText("按用户")[0]).toBeInTheDocument();
      expect(screen.getAllByText("搜索")[0]).toBeInTheDocument();
    });

    it("点击搜索 tab 应触发 onFilterChange", () => {
      render(
        <OperationLogStream logs={mockLogs} filter="all" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      fireEvent.click(screen.getAllByTestId("log-filter-search")[0]);
      expect(onFilterChange).toHaveBeenCalledWith("search");
    });
  });

  describe("搜索", () => {
    it("filter=search 时应显示搜索框", () => {
      render(
        <OperationLogStream logs={mockLogs} filter="search" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByTestId("log-search-input")[0]).toBeInTheDocument();
    });

    it("filter=all 时不应显示搜索框", () => {
      render(
        <OperationLogStream logs={mockLogs} filter="all" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      expect(screen.queryByTestId("log-search-input")).not.toBeInTheDocument();
    });

    it("输入搜索内容应触发 onSearchChange", () => {
      render(
        <OperationLogStream logs={mockLogs} filter="search" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      const input = screen.getAllByTestId("log-search-input")[0];
      fireEvent.change(input, { target: { value: "重启" } });
      expect(onSearchChange).toHaveBeenCalledWith("重启");
    });
  });

  describe("空状态", () => {
    it("无日志时应显示空提示", () => {
      render(
        <OperationLogStream logs={[]} filter="all" onFilterChange={onFilterChange} searchQuery="" onSearchChange={onSearchChange} />
      );
      expect(screen.getAllByText("暂无操作日志")[0]).toBeInTheDocument();
    });
  });
});
