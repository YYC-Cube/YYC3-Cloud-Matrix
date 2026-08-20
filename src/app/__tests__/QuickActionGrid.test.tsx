/**
 * @file: QuickActionGrid.test.tsx
 * @description: QuickActionGrid.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * QuickActionGrid.test.tsx
 * =============
 * QuickActionGrid 组件 - 快速操作网格测试
 *
 * 覆盖范围:
 * - 操作列表渲染
 * - 点击执行回调
 * - 危险操作二次确认
 * - running 状态禁用
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { QuickActionGrid } from "../modules/shared/QuickActionGrid";
import type { OperationItem } from "../types";

const mockActions: OperationItem[] = [
  { id: "qa1", category: "node",   label: "重启节点",  description: "重启 GPU 节点", icon: "RotateCw", status: "pending" },
  { id: "qa2", category: "model",  label: "部署模型",  description: "部署新模型",    icon: "Upload",   status: "pending" },
  { id: "qa3", category: "system", label: "清理缓存",  description: "清理缓存",     icon: "Trash2",   status: "pending" },
  { id: "qa4", category: "node",   label: "批量重启",  description: "批量重启节点",  icon: "RefreshCw", status: "pending", dangerous: true },
  { id: "qa5", category: "system", label: "执行中操作", description: "测试",         icon: "Terminal",  status: "running" },
];

describe("QuickActionGrid", () => {
  let onExecute: any;

  beforeEach(() => {
    onExecute = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  // ----------------------------------------------------------
  // 基础渲染
  // ----------------------------------------------------------

  describe("基础渲染", () => {
    it("应渲染所有操作项", () => {
      render(<QuickActionGrid actions={mockActions} isExecuting={null} onExecute={onExecute} />);
      expect(screen.getAllByText("重启节点")[0]).toBeInTheDocument();
      expect(screen.getAllByText("部署模型")[0]).toBeInTheDocument();
      expect(screen.getAllByText("清理缓存")[0]).toBeInTheDocument();
      expect(screen.getAllByText("批量重启")[0]).toBeInTheDocument();
    });

    it("应有 data-testid", () => {
      render(<QuickActionGrid actions={mockActions} isExecuting={null} onExecute={onExecute} />);
      expect(screen.getAllByTestId("quick-action-grid")[0]).toBeInTheDocument();
    });

    it("应渲染操作描述", () => {
      render(<QuickActionGrid actions={mockActions} isExecuting={null} onExecute={onExecute} />);
      expect(screen.getAllByText("重启 GPU 节点")[0]).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 点击执行
  // ----------------------------------------------------------

  describe("点击执行", () => {
    it("点击普通操作应触发 onExecute", () => {
      render(<QuickActionGrid actions={mockActions} isExecuting={null} onExecute={onExecute} />);
      fireEvent.click(screen.getAllByTestId("action-qa1")[0]);
      expect(onExecute).toHaveBeenCalledWith("qa1");
    });

    it("点击危险操作第一次应显示确认提示", () => {
      render(<QuickActionGrid actions={mockActions} isExecuting={null} onExecute={onExecute} />);
      fireEvent.click(screen.getAllByTestId("action-qa4")[0]);
      expect(onExecute).not.toHaveBeenCalled();
      expect(screen.getAllByText("确认 批量重启？")[0]).toBeInTheDocument();
    });

    it("再次点击危险操作应执行", () => {
      render(<QuickActionGrid actions={mockActions} isExecuting={null} onExecute={onExecute} />);
      fireEvent.click(screen.getAllByTestId("action-qa4")[0]);
      fireEvent.click(screen.getAllByTestId("action-qa4")[0]);
      expect(onExecute).toHaveBeenCalledWith("qa4");
    });

    it("running 状态的操作应禁用", () => {
      render(<QuickActionGrid actions={mockActions} isExecuting="qa5" onExecute={onExecute} />);
      const btn = screen.getAllByTestId("action-qa5")[0];
      expect(btn).toBeDisabled();
    });
  });

  // ----------------------------------------------------------
  // 移动端
  // ----------------------------------------------------------

  describe("移动端", () => {
    it("isMobile 时应使用 2 列网格", () => {
      render(<QuickActionGrid actions={mockActions} isExecuting={null} onExecute={onExecute} isMobile />);
      const grid = screen.getAllByTestId("quick-action-grid")[0];
      expect(grid.className).toContain("grid-cols-2");
    });
  });
});
