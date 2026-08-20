/**
 * @file: DesignTokens.test.tsx
 * @description: DesignTokens.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * DesignTokens.test.tsx
 * ============
 * Design Tokens 展示组件测试
 *
 * 覆盖范围:
 * - 色彩 / 字体 / 间距 / 阴影 / 动效 标签页
 * - Token 数据完整性
 * - 标签切换
 */

import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  DesignTokens,
  COLOR_TOKENS,
  TYPOGRAPHY_TOKENS,
  SPACING_TOKENS,
  SHADOW_TOKENS,
  ANIMATION_TOKENS,
} from "../modules/dev/design-system/DesignTokens";

describe("DesignTokens", () => {

afterEach(() => {
  cleanup();
});
  describe("Token 数据完整性", () => {

afterEach(() => {
  cleanup();
});
    it("应有 19 个色彩 Token", () => {
      expect(COLOR_TOKENS.length).toBe(19);
    });

    it("色彩 Token 应有 name/value/cssVar/usage", () => {
      for (const t of COLOR_TOKENS) {
        expect(t.name).toBeTruthy();
        expect(t.value).toBeTruthy();
        expect(t.cssVar).toBeTruthy();
        expect(t.usage).toBeTruthy();
      }
    });

    it("应有 8 个字体 Token", () => {
      expect(TYPOGRAPHY_TOKENS.length).toBe(8);
    });

    it("应有 9 个间距 Token", () => {
      expect(SPACING_TOKENS.length).toBe(9);
    });

    it("应有 9 个阴影 Token", () => {
      expect(SHADOW_TOKENS.length).toBe(9);
    });

    it("应有 9 个动效 Token", () => {
      expect(ANIMATION_TOKENS.length).toBe(9);
    });
  });

  describe("渲染", () => {

afterEach(() => {
  cleanup();
});
    it("应渲染主容器", () => {
      render(<DesignTokens />);
      expect(screen.getAllByTestId("design-tokens")[0]).toBeInTheDocument();
    });

    it("应有 5 个标签按钮", () => {
      render(<DesignTokens />);
      expect(screen.getAllByTestId("token-tab-colors")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("token-tab-typography")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("token-tab-spacing")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("token-tab-shadows")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("token-tab-animations")[0]).toBeInTheDocument();
    });

    it("默认应显示色彩面板", () => {
      render(<DesignTokens />);
      expect(screen.getAllByTestId("token-colors")[0]).toBeInTheDocument();
    });

    it("切换到字体标签应显示字体面板", () => {
      render(<DesignTokens />);
      fireEvent.click(screen.getAllByTestId("token-tab-typography")[0]);
      expect(screen.getAllByTestId("token-typography")[0]).toBeInTheDocument();
    });

    it("切换到间距标签", () => {
      render(<DesignTokens />);
      fireEvent.click(screen.getAllByTestId("token-tab-spacing")[0]);
      expect(screen.getAllByTestId("token-spacing")[0]).toBeInTheDocument();
    });

    it("切换到阴影标签", () => {
      render(<DesignTokens />);
      fireEvent.click(screen.getAllByTestId("token-tab-shadows")[0]);
      expect(screen.getAllByTestId("token-shadows")[0]).toBeInTheDocument();
    });

    it("切换到动效标签", () => {
      render(<DesignTokens />);
      fireEvent.click(screen.getAllByTestId("token-tab-animations")[0]);
      expect(screen.getAllByTestId("token-animations")[0]).toBeInTheDocument();
    });
  });

  describe("Primary 色彩标注", () => {

afterEach(() => {
  cleanup();
});
    it("应含 #00d4ff 主色", () => {
      const primary = COLOR_TOKENS.find((c) => c.name === "Primary");
      expect(primary?.value).toBe("#00d4ff");
    });

    it("应含 #060e1f 背景色", () => {
      const bg = COLOR_TOKENS.find((c) => c.name === "Background");
      expect(bg?.value).toBe("#060e1f");
    });

    it("应含 #ff3366 危险色", () => {
      const dest = COLOR_TOKENS.find((c) => c.name === "Destructive");
      expect(dest?.value).toBe("#ff3366");
    });
  });
});
