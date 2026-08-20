/**
 * @file: OperationCategory.test.tsx
 * @description: OperationCategory.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * OperationCategory.test.tsx
 * ===============
 * OperationCategory 组件 - 操作分类标签页测试
 *
 * 覆盖范围:
 * - 渲染「全部」+ 5 个分类按钮
 * - 切换分类回调
 * - 激活态样式
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { OperationCategory } from "../modules/ops/OperationCategory";
import { CATEGORY_META } from "../hooks/useOperationCenter";

describe("OperationCategory", () => {
  let onChange: any;

  beforeEach(() => {
    cleanup();
    onChange = vi.fn() as any;
  });

  afterEach(() => {
    cleanup();
  });

  it("应渲染「全部」按钮", () => {
    render(<OperationCategory categories={CATEGORY_META} active="all" onChange={onChange} />);
    expect(screen.getAllByText("全部")[0]).toBeInTheDocument();
  });

  it("应渲染 5 个分类按钮", () => {
    render(<OperationCategory categories={CATEGORY_META} active="all" onChange={onChange} />);
    expect(screen.getAllByText("节点操作")[0]).toBeInTheDocument();
    expect(screen.getAllByText("模型操作")[0]).toBeInTheDocument();
    expect(screen.getAllByText("任务操作")[0]).toBeInTheDocument();
    expect(screen.getAllByText("系统操作")[0]).toBeInTheDocument();
    expect(screen.getAllByText("自定义")[0]).toBeInTheDocument();
  });

  it("点击分类应触发 onChange", () => {
    render(<OperationCategory categories={CATEGORY_META} active="all" onChange={onChange} />);
    fireEvent.click(screen.getAllByTestId("category-node")[0]);
    expect(onChange).toHaveBeenCalledWith("node");
  });

  it("点击全部应触发 onChange('all')", () => {
    render(<OperationCategory categories={CATEGORY_META} active="node" onChange={onChange} />);
    fireEvent.click(screen.getAllByTestId("category-all")[0]);
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("激活分类按钮应有对应颜色样式", () => {
    render(<OperationCategory categories={CATEGORY_META} active="node" onChange={onChange} />);
    const btn = screen.getAllByTestId("category-node")[0];
    expect(btn.style.color).toBe("rgb(0, 212, 255)"); // #00d4ff
  });

  it("非激活分类按钮应有默认透明样式", () => {
    render(<OperationCategory categories={CATEGORY_META} active="node" onChange={onChange} />);
    const btn = screen.getAllByTestId("category-model")[0];
    expect(btn.className).toContain("text-[rgba(0,212,255,0.4)]");
  });

  it("应有 data-testid", () => {
    render(<OperationCategory categories={CATEGORY_META} active="all" onChange={onChange} />);
    expect(screen.getAllByTestId("operation-category")[0]).toBeInTheDocument();
  });
});
