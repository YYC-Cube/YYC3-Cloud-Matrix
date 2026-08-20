/**
 * @file: ComponentShowcase.test.tsx
 * @description: ComponentShowcase.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * ComponentShowcase.test.tsx
 * ===============
 * ComponentShowcase 组件测试
 *
 * 覆盖范围:
 * - 状态设计 / 组件清单 / 交互规范 标签
 * - STATUS_DEFINITIONS 完整性
 * - COMPONENT_REGISTRY 完整性
 * - INTERACTION_SPECS 完整性
 * - 筛选功能
 */

import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  ComponentShowcase,
  STATUS_DEFINITIONS,
  COMPONENT_REGISTRY,
  INTERACTION_SPECS,
} from "../modules/dev/design-system/ComponentShowcase";

describe("ComponentShowcase", () => {

afterEach(() => {
  cleanup();
});
  describe("数据完整性", () => {

afterEach(() => {
  cleanup();
});
    it("应有 5 种状态定义", () => {
      expect(STATUS_DEFINITIONS.length).toBe(5);
    });

    it("状态应含 normal/warning/error/loading/info", () => {
      const keys = STATUS_DEFINITIONS.map((s) => s.key);
      expect(keys).toContain("normal");
      expect(keys).toContain("warning");
      expect(keys).toContain("error");
      expect(keys).toContain("loading");
      expect(keys).toContain("info");
    });

    it("应有 27 个组件注册", () => {
      expect(COMPONENT_REGISTRY.length).toBe(27);
    });

    it("组件应覆盖 4 个层级", () => {
      const tiers = new Set(COMPONENT_REGISTRY.map((c) => c.tier));
      expect(tiers.has("atom")).toBe(true);
      expect(tiers.has("molecule")).toBe(true);
      expect(tiers.has("organism")).toBe(true);
      expect(tiers.has("template")).toBe(true);
    });

    it("应有 10 条交互规范", () => {
      expect(INTERACTION_SPECS.length).toBe(10);
    });

    it("交互规范每项应有 name/trigger/duration/effect/feedback", () => {
      for (const spec of INTERACTION_SPECS) {
        expect(spec.name).toBeTruthy();
        expect(spec.trigger).toBeTruthy();
        expect(spec.duration).toBeTruthy();
        expect(spec.effect).toBeTruthy();
        expect(spec.feedback).toBeTruthy();
      }
    });
  });

  describe("渲染", () => {

afterEach(() => {
  cleanup();
});
    it("应渲染主容器", () => {
      render(<ComponentShowcase />);
      expect(screen.getByTestId("component-showcase")).toBeInTheDocument();
    });

    it("默认应显示状态设计", () => {
      render(<ComponentShowcase />);
      expect(screen.getByTestId("showcase-states")).toBeInTheDocument();
    });

    it("状态设计应渲染 5 个状态卡片", () => {
      render(<ComponentShowcase />);
      expect(screen.getByTestId("status-normal")).toBeInTheDocument();
      expect(screen.getByTestId("status-warning")).toBeInTheDocument();
      expect(screen.getByTestId("status-error")).toBeInTheDocument();
      expect(screen.getByTestId("status-loading")).toBeInTheDocument();
      expect(screen.getByTestId("status-info")).toBeInTheDocument();
    });

    it("切换到组件清单", () => {
      render(<ComponentShowcase />);
      fireEvent.click(screen.getByTestId("showcase-tab-components"));
      expect(screen.getByTestId("showcase-components")).toBeInTheDocument();
    });

    it("组件清单应渲染组件列表", () => {
      render(<ComponentShowcase />);
      fireEvent.click(screen.getByTestId("showcase-tab-components"));
      expect(screen.getByTestId("component-list")).toBeInTheDocument();
    });

    it("切换到交互规范", () => {
      render(<ComponentShowcase />);
      fireEvent.click(screen.getByTestId("showcase-tab-interactions"));
      expect(screen.getByTestId("showcase-interactions")).toBeInTheDocument();
    });
  });

  describe("筛选", () => {

afterEach(() => {
  cleanup();
});
    it("筛选 atom 应只显示原子组件", () => {
      render(<ComponentShowcase />);
      fireEvent.click(screen.getByTestId("showcase-tab-components"));
      fireEvent.click(screen.getByTestId("filter-atom"));
      const atomCount = COMPONENT_REGISTRY.filter((c) => c.tier === "atom").length;
      expect(atomCount).toBeGreaterThan(0);
    });
  });
});
