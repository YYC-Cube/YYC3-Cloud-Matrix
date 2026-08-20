/**
 * @file: PatrolScheduler.test.tsx
 * @description: PatrolScheduler.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * PatrolScheduler.test.tsx
 * =============
 * PatrolScheduler 组件 - 巡查计划配置面板测试
 *
 * 覆盖范围:
 * - 面板标题渲染
 * - 自动巡查开关
 * - 间隔选择器
 * - 回调触发
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PatrolScheduler } from "../modules/monitor/PatrolScheduler";
import type { PatrolSchedule } from "../types";

const defaultSchedule: PatrolSchedule = {
  enabled: true,
  interval: 15,
  lastRun: Date.now() - 30 * 60 * 1000,
  nextRun: Date.now() + 15 * 60 * 1000,
};

describe("PatrolScheduler", () => {
  let onToggle: any;
  let onIntervalChange: any;

  beforeEach(() => {
    cleanup();
    onToggle = vi.fn() as any;
    onIntervalChange = vi.fn() as any;
  });

  afterEach(() => {
    cleanup();
  });

  // ----------------------------------------------------------
  // 基础渲染
  // ----------------------------------------------------------

  describe("基础渲染", () => {
    it("应渲染面板标题", () => {
      render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      expect(screen.getAllByText("巡查计划配置")[0]).toBeInTheDocument();
    });

    it("应渲染自动巡查标签", () => {
      render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      expect(screen.getAllByText("自动巡查")[0]).toBeInTheDocument();
    });

    it("应渲染巡查间隔标签", () => {
      render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      expect(screen.getAllByText("巡查间隔")[0]).toBeInTheDocument();
    });

    it("应渲染 5 个间隔选项", () => {
      render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      expect(screen.getAllByText("5 分钟")[0]).toBeInTheDocument();
      expect(screen.getAllByText("10 分钟")[0]).toBeInTheDocument();
      expect(screen.getAllByText("15 分钟")[0]).toBeInTheDocument();
      expect(screen.getAllByText("30 分钟")[0]).toBeInTheDocument();
      expect(screen.getAllByText("1 小时")[0]).toBeInTheDocument();
    });

    it("应有 data-testid", () => {
      const { container } = render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      expect(container.querySelector("[data-testid='patrol-scheduler']")).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 开关操作
  // ----------------------------------------------------------

  describe("开关操作", () => {
    it("点击开关应触发 onToggle(false) 当 enabled=true", () => {
      render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      const toggle = screen.getAllByTestId("patrol-toggle");
      fireEvent.click(toggle[0]);
      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it("点击开关应触发 onToggle(true) 当 enabled=false", () => {
      render(
        <PatrolScheduler
          schedule={{ ...defaultSchedule, enabled: false }}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      const toggle = screen.getAllByTestId("patrol-toggle");
      fireEvent.click(toggle[0]);
      expect(onToggle).toHaveBeenCalledWith(true);
    });
  });

  // ----------------------------------------------------------
  // 间隔选择
  // ----------------------------------------------------------

  describe("间隔选择", () => {
    it("点击 30 分钟应触发 onIntervalChange(30)", () => {
      render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      fireEvent.click(screen.getAllByTestId("interval-30")[0]);
      expect(onIntervalChange).toHaveBeenCalledWith(30);
    });

    it("当前间隔按钮应有激活样式", () => {
      render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      const activeBtn = screen.getAllByTestId("interval-15");
      expect(activeBtn[0].className).toContain("text-[#00d4ff]");
    });
  });

  // ----------------------------------------------------------
  // 调度信息
  // ----------------------------------------------------------

  describe("调度信息", () => {
    it("应显示上次巡查时间", () => {
      render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      expect(screen.getAllByText(/上次巡查/)[0]).toBeInTheDocument();
    });

    it("应显示下次巡查时间（当 enabled + nextRun 有值）", () => {
      render(
        <PatrolScheduler
          schedule={defaultSchedule}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      expect(screen.getAllByText(/下次巡查/)[0]).toBeInTheDocument();
    });

    it("disabled 时不应显示下次巡查", () => {
      render(
        <PatrolScheduler
          schedule={{ ...defaultSchedule, enabled: false, nextRun: null }}
          onToggle={onToggle}
          onIntervalChange={onIntervalChange}
        />
      );
      expect(screen.queryByText(/下次巡查/)).not.toBeInTheDocument();
    });
  });
});
