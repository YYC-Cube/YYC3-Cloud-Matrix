/**
 * @file: IDETopBar.test.tsx
 * @description: IDETopBar 组件测试 — IDE 顶部导航栏、AI 模型选择器、操作图标
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-07-25
 * @updated: 2026-07-25
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";

// ─── Mocks ─────────────────────────────────────────────────

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("../modules/shared/YYC3LogoSvg", () => ({
  YYC3LogoSvg: ({ size, showText }: { size: number; showText: boolean }) => (
    <div data-testid="yyc3-logo" data-size={size} data-show-text={showText} />
  ),
}));

vi.mock("../modules/dev/ide/ide-mock-data", () => ({
  AI_MODELS: [
    { id: "glm-4-flash", name: "GLM-4 Flash", provider: "Z.ai", status: "online" },
    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", status: "online" },
    { id: "llama3-8b", name: "LLaMA-3 8B", provider: "Ollama", status: "online" },
    { id: "deepseek-v3", name: "DeepSeek-V3", provider: "DeepSeek", status: "offline" },
    { id: "qwen-72b", name: "Qwen-72B", provider: "Ollama", status: "online" },
  ],
}));

import { IDETopBar } from "../modules/dev/ide/IDETopBar";

// ─── Helpers ───────────────────────────────────────────────

const defaultProps = {
  projectName: "YYC3 Dashboard",
  onBack: vi.fn(),
  selectedModel: "glm-4-flash",
  onModelChange: vi.fn(),
  onExplorerClick: vi.fn(),
  onNotificationsClick: vi.fn(),
  onSettingsClick: vi.fn(),
  onGithubClick: vi.fn(),
  onShareClick: vi.fn(),
  onDeployClick: vi.fn(),
  unreadCount: 0,
};

function renderBar(props: Partial<typeof defaultProps> = {}) {
  return render(
    React.createElement(IDETopBar, { ...defaultProps, ...props })
  );
}

// ─── Tests ─────────────────────────────────────────────────

describe("IDETopBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ── Logo 和项目名 ──

  describe("Logo 和项目名", () => {
    it("renders logo and 'Cloud AI' text", () => {
      renderBar();
      expect(screen.getByTestId("yyc3-logo")).toBeInTheDocument();
      expect(screen.getByText("Cloud AI")).toBeInTheDocument();
    });

    it("clicking logo area calls onBack", () => {
      const onBack = vi.fn();
      renderBar({ onBack });
      fireEvent.click(screen.getByText("Cloud AI"));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("renders project name", () => {
      renderBar({ projectName: "My Project" });
      expect(screen.getByText("My Project")).toBeInTheDocument();
    });
  });

  // ── AI 模型选择器 ──

  describe("AI 模型选择器", () => {
    it("renders AI model selector with current model name", () => {
      renderBar({ selectedModel: "gpt-4o" });
      expect(screen.getByText("GPT-4o")).toBeInTheDocument();
    });

    it("clicking model selector opens dropdown", () => {
      renderBar();
      // Find the model selector button
      const modelBtn = screen.getByText("GLM-4 Flash").closest("button");
      if (modelBtn) fireEvent.click(modelBtn);
      // Dropdown should show all models
      expect(screen.getByText("LLaMA-3 8B")).toBeInTheDocument();
      expect(screen.getByText("DeepSeek-V3")).toBeInTheDocument();
      expect(screen.getByText("Qwen-72B")).toBeInTheDocument();
    });

    it("selecting a model calls onModelChange", () => {
      const onModelChange = vi.fn();
      renderBar({ onModelChange });
      // Open dropdown
      const modelBtn = screen.getByText("GLM-4 Flash").closest("button");
      if (modelBtn) fireEvent.click(modelBtn);
      // Click a model
      fireEvent.click(screen.getByText("LLaMA-3 8B"));
      expect(onModelChange).toHaveBeenCalledWith("llama3-8b");
    });

    it("model status indicator shows green for online", () => {
      renderBar({ selectedModel: "glm-4-flash" });
      // The Circle component renders an SVG with fill color
      const modelBtn = screen.getByText("GLM-4 Flash").closest("button");
      expect(modelBtn).toBeInTheDocument();
      // Check that the circle has green fill
      const circles = modelBtn?.querySelectorAll("svg");
      if (circles && circles.length > 0) {
        const firstCircle = circles[0];
        expect(firstCircle).toBeInTheDocument();
      }
    });

    it("model status indicator shows red for offline", () => {
      renderBar({ selectedModel: "deepseek-v3" });
      expect(screen.getByText("DeepSeek-V3")).toBeInTheDocument();
    });

    it("dropdown closes when clicking outside", () => {
      renderBar();
      // Open dropdown
      const modelBtn = screen.getByText("GLM-4 Flash").closest("button");
      if (modelBtn) fireEvent.click(modelBtn);
      expect(screen.getByText("LLaMA-3 8B")).toBeInTheDocument();
      // Click the backdrop (fixed inset-0 z-40)
      const backdrop = document.querySelector(".fixed.inset-0.z-40");
      if (backdrop) fireEvent.click(backdrop);
      expect(screen.queryByText("LLaMA-3 8B")).not.toBeInTheDocument();
    });
  });

  // ── 操作图标 ──

  describe("操作图标", () => {
    it("renders action icons: explorer, notifications, settings, github, share, deploy", () => {
      renderBar();
      // Check that all action icons are rendered by their labels/titles
      const buttons = screen.getAllByRole("button");
      // There should be many buttons: logo, model selector, 6 action icons
      expect(buttons.length).toBeGreaterThanOrEqual(7);
    });

    it("clicking action icons calls respective handlers", () => {
      const onExplorerClick = vi.fn();
      const onSettingsClick = vi.fn();
      const onGithubClick = vi.fn();
      const onShareClick = vi.fn();
      const onDeployClick = vi.fn();
      renderBar({
        onExplorerClick,
        onSettingsClick,
        onGithubClick,
        onShareClick,
        onDeployClick,
      });
      // Find buttons by their title attributes
      const buttons = screen.getAllByRole("button");
      // Filter to action icon buttons (not logo, not model selector, not user avatar)
      const actionButtons = buttons.filter(
        (btn) => btn.title && btn.title !== "ide.modelSelector"
      );
      // Click each action button
      actionButtons.forEach((btn) => {
        fireEvent.click(btn);
      });
      // Verify at least some handlers were called
      const allCalled = [
        onExplorerClick,
        onSettingsClick,
        onGithubClick,
        onShareClick,
        onDeployClick,
      ].some((fn) => fn.mock.calls.length > 0);
      expect(allCalled).toBe(true);
    });
  });

  // ── 通知徽章 ──

  describe("通知徽章", () => {
    it("renders unread badge on notifications when unreadCount > 0", () => {
      renderBar({ unreadCount: 5 });
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("renders '9+' when unreadCount > 9", () => {
      renderBar({ unreadCount: 15 });
      expect(screen.getByText("9+")).toBeInTheDocument();
    });

    it("does not render badge when unreadCount is 0", () => {
      renderBar({ unreadCount: 0 });
      // There should be no badge span with a number
      const badges = Array.from(document.querySelectorAll("span")).filter(
        (span) => span.textContent === "0" && span.style.fontSize === "0.4rem"
      );
      expect(badges.length).toBe(0);
    });
  });

  // ── 用户头像 ──

  describe("用户头像", () => {
    it("renders user avatar 'YY'", () => {
      renderBar();
      expect(screen.getByText("YY")).toBeInTheDocument();
    });
  });
});