/**
 * @file: FileBrowser.test.tsx
 * @description: FileBrowser.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * FileBrowser.test.tsx
 * ============
 * FileBrowser 组件 - 文件浏览器测试
 *
 * 覆盖范围:
 * - 文件/目录列表渲染
 * - 面包屑导航
 * - 选择文件/目录回调
 * - 返回上级按钮
 * - 空目录状态
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FileBrowser } from "../modules/ops/FileBrowser";
import type { FileItem } from "../types";

const mockItems: FileItem[] = [
  { id: "d-logs",    name: "logs",     type: "directory", path: "~/.yyc3-cloudpivot/logs",     modifiedAt: Date.now(), children: [{ id: "f1", name: "a.log", type: "file", path: "x", modifiedAt: Date.now() }] },
  { id: "d-reports", name: "reports",  type: "directory", path: "~/.yyc3-cloudpivot/reports",  modifiedAt: Date.now() },
  { id: "f-config",  name: "config.json", type: "file",   path: "~/.yyc3-cloudpivot/config.json", extension: "json", size: 2400, modifiedAt: Date.now() },
];

const breadcrumbs = [
  { label: "~/.yyc3-cloudpivot", path: "~/.yyc3-cloudpivot" },
];

describe("FileBrowser", () => {
  let onSelect: any;
  let onNavigate: any;
  let onGoUp: any;
  const formatSize = (bytes?: number) => bytes ? `${(bytes / 1024).toFixed(1)}KB` : "--";

  beforeEach(() => {
    onSelect = vi.fn() as any;
    onNavigate = vi.fn() as any;
    onGoUp = vi.fn() as any;
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("应渲染所有文件和目录", () => {
      render(
        <FileBrowser items={mockItems} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      expect(screen.getByText("logs")).toBeInTheDocument();
      expect(screen.getByText("reports")).toBeInTheDocument();
      expect(screen.getByText("config.json")).toBeInTheDocument();
    });

    it("目录应显示子项数", () => {
      render(
        <FileBrowser items={mockItems} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      expect(screen.getByText("1 项")).toBeInTheDocument();
    });

    it("应有 data-testid", () => {
      render(
        <FileBrowser items={mockItems} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      expect(screen.getByTestId("file-browser")).toBeInTheDocument();
    });
  });

  describe("面包屑", () => {
    it("应渲染面包屑路径", () => {
      const crumbs = [
        { label: "~/.yyc3-cloudpivot", path: "~/.yyc3-cloudpivot" },
        { label: "logs", path: "~/.yyc3-cloudpivot/logs" },
      ];
      render(
        <FileBrowser items={mockItems} breadcrumbs={crumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={true} />
      );
      expect(screen.getByTestId("breadcrumb-0")).toBeInTheDocument();
      expect(screen.getByTestId("breadcrumb-1")).toBeInTheDocument();
    });

    it("点击面包屑应触发 onNavigate", () => {
      const crumbs = [
        { label: "~/.yyc3-cloudpivot", path: "~/.yyc3-cloudpivot" },
        { label: "logs", path: "~/.yyc3-cloudpivot/logs" },
      ];
      render(
        <FileBrowser items={mockItems} breadcrumbs={crumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={true} />
      );
      fireEvent.click(screen.getByTestId("breadcrumb-0"));
      expect(onNavigate).toHaveBeenCalledWith("~/.yyc3-cloudpivot");
    });
  });

  describe("交互", () => {
    it("点击文件应触发 onSelect", () => {
      render(
        <FileBrowser items={mockItems} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      fireEvent.click(screen.getByTestId("file-f-config"));
      expect(onSelect).toHaveBeenCalledWith(mockItems[2]);
    });

    it("点击目录应触发 onSelect", () => {
      render(
        <FileBrowser items={mockItems} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      fireEvent.click(screen.getByTestId("file-d-logs"));
      expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
    });

    it("canGoUp=true 时应显示返回按钮", () => {
      render(
        <FileBrowser items={mockItems} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={true} />
      );
      expect(screen.getByTestId("go-up-btn")).toBeInTheDocument();
    });

    it("canGoUp=false 时不应显示返回按钮", () => {
      render(
        <FileBrowser items={mockItems} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      expect(screen.queryByTestId("go-up-btn")).not.toBeInTheDocument();
    });

    it("点击返回按钮应触发 onGoUp", () => {
      render(
        <FileBrowser items={mockItems} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={true} />
      );
      fireEvent.click(screen.getByTestId("go-up-btn"));
      expect(onGoUp).toHaveBeenCalled();
    });
  });

  describe("空目录", () => {
    it("无文件时应显示空提示", () => {
      render(
        <FileBrowser items={[]} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      expect(screen.getByText("空目录")).toBeInTheDocument();
    });
  });

  describe("时间格式化", () => {
    it("应显示'刚刚'对于小于1分钟的文件", () => {
      const recentItem: FileItem = {
        id: "recent",
        name: "recent.txt",
        type: "file",
        path: "~/.yyc3-cloudpivot/recent.txt",
        modifiedAt: Date.now() - 30000,
      };
      render(
        <FileBrowser items={[recentItem]} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      expect(screen.getByText("刚刚")).toBeInTheDocument();
    });

    it("应显示'X分钟前'对于小于1小时的文件", () => {
      const item: FileItem = {
        id: "minutes",
        name: "minutes.txt",
        type: "file",
        path: "~/.yyc3-cloudpivot/minutes.txt",
        modifiedAt: Date.now() - 30 * 60 * 1000,
      };
      render(
        <FileBrowser items={[item]} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      expect(screen.getByText("30分钟前")).toBeInTheDocument();
    });

    it("应显示'X小时前'对于小于24小时的文件", () => {
      const item: FileItem = {
        id: "hours",
        name: "hours.txt",
        type: "file",
        path: "~/.yyc3-cloudpivot/hours.txt",
        modifiedAt: Date.now() - 5 * 60 * 60 * 1000,
      };
      render(
        <FileBrowser items={[item]} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      expect(screen.getByText("5小时前")).toBeInTheDocument();
    });

    it("应显示'X天前'对于大于24小时的文件", () => {
      const item: FileItem = {
        id: "days",
        name: "days.txt",
        type: "file",
        path: "~/.yyc3-cloudpivot/days.txt",
        modifiedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      };
      render(
        <FileBrowser items={[item]} breadcrumbs={breadcrumbs} onSelect={onSelect}
          onNavigate={onNavigate} onGoUp={onGoUp} formatSize={formatSize} canGoUp={false} />
      );
      expect(screen.getByText("3天前")).toBeInTheDocument();
    });
  });
});