/**
 * @file: ProviderEditorModal.test.tsx
 * @description: ProviderEditorModal 组件测试 — 服务商添加/编辑/模型管理
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

import { ProviderEditorModal } from "../modules/ai/ProviderEditorModal";

// ─── Helpers ───────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  editingProvider: null as any,
  onSave: vi.fn(),
  onUpdate: vi.fn(),
  onReset: vi.fn(),
};

function renderModal(props: Partial<typeof defaultProps> = {}) {
  return render(
    React.createElement(ProviderEditorModal, {
      ...defaultProps,
      ...props,
    })
  );
}

// ─── Tests ─────────────────────────────────────────────────

describe("ProviderEditorModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ── 渲染控制 ──

  describe("渲染控制", () => {
    it("renders nothing when isOpen is false", () => {
      renderModal({ isOpen: false });
      expect(screen.queryByText("添加自定义服务商")).not.toBeInTheDocument();
      expect(screen.queryByText("编辑服务商")).not.toBeInTheDocument();
    });

    it("renders modal when isOpen is true", () => {
      renderModal();
      expect(screen.getByText("添加自定义服务商")).toBeInTheDocument();
    });
  });

  // ── 标题 ──

  describe("标题", () => {
    it("renders '添加自定义服务商' title when editingProvider is null", () => {
      renderModal({ editingProvider: null });
      expect(screen.getByText("添加自定义服务商")).toBeInTheDocument();
    });

    it("renders '编辑服务商' title when editingProvider is provided", () => {
      renderModal({
        editingProvider: {
          id: "test-provider",
          label: "Test Provider",
          baseUrl: "https://api.test.com",
          authType: "bearer",
          requiresApiKey: true,
          isLocal: false,
          isBuiltin: false,
          isCustom: true,
          models: [],
          createdAt: Date.now(),
        },
      });
      expect(screen.getByText("编辑服务商")).toBeInTheDocument();
    });
  });

  // ── 内置标记 ──

  describe("内置标记", () => {
    it("renders '内置' badge when editingProvider.isBuiltin", () => {
      renderModal({
        editingProvider: {
          id: "builtin-provider",
          label: "Builtin Provider",
          baseUrl: "https://api.builtin.com",
          authType: "bearer",
          requiresApiKey: true,
          isLocal: false,
          isBuiltin: true,
          isCustom: false,
          models: [],
          createdAt: Date.now(),
        },
      });
      expect(screen.getByText("内置")).toBeInTheDocument();
    });

    it("does not render '内置' badge when not builtin", () => {
      renderModal({
        editingProvider: {
          id: "custom-provider",
          label: "Custom Provider",
          baseUrl: "https://api.custom.com",
          authType: "bearer",
          requiresApiKey: true,
          isLocal: false,
          isBuiltin: false,
          isCustom: true,
          models: [],
          createdAt: Date.now(),
        },
      });
      expect(screen.queryByText("内置")).not.toBeInTheDocument();
    });
  });

  // ── 表单字段 ──

  describe("表单字段", () => {
    it("form has fields: label (name), baseUrl, authType", () => {
      renderModal();
      expect(screen.getByPlaceholderText(/例如: Claude API/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("https://api.example.com/v1")).toBeInTheDocument();
      expect(screen.getByText("Bearer Token")).toBeInTheDocument();
    });

    it("renders auth type dropdown with 3 options: bearer, api-key, none", () => {
      renderModal();
      // Open the auth dropdown
      fireEvent.click(screen.getByText("Bearer Token"));
      expect(screen.getByText("API Key Header")).toBeInTheDocument();
      expect(screen.getByText("无认证 (本地)")).toBeInTheDocument();
    });
  });

  // ── 认证方式 ──

  describe("认证方式", () => {
    it("selecting auth type 'none' sets isLocal to true", () => {
      renderModal();
      fireEvent.click(screen.getByText("Bearer Token"));
      fireEvent.click(screen.getByText("无认证 (本地)"));
      // The checkbox should be checked
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("renders '本地服务' checkbox", () => {
      renderModal();
      expect(screen.getByText("本地服务 (无需外网)")).toBeInTheDocument();
    });
  });

  // ── 模型列表管理 ──

  describe("模型列表管理", () => {
    it("renders model list management section", () => {
      renderModal();
      expect(screen.getByText(/模型列表/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("输入模型名称，回车添加...")).toBeInTheDocument();
    });

    it("can add model name to list", () => {
      renderModal();
      const input = screen.getByPlaceholderText("输入模型名称，回车添加...");
      fireEvent.change(input, { target: { value: "gpt-4" } });
      // Find the Plus button by its parent container (the flex div containing the input)
      const container = input.closest("div")!;
      const plusBtn = container.querySelector("button:not([disabled])") as HTMLButtonElement;
      if (plusBtn) fireEvent.click(plusBtn);
      expect(screen.getByText("gpt-4")).toBeInTheDocument();
    });

    it("can remove model from list", () => {
      renderModal({
        editingProvider: {
          id: "test-provider",
          label: "Test Provider",
          baseUrl: "https://api.test.com",
          authType: "bearer",
          requiresApiKey: true,
          isLocal: false,
          isBuiltin: false,
          isCustom: true,
          models: ["gpt-4", "gpt-3.5"],
          createdAt: Date.now(),
        },
      });
      expect(screen.getByText("gpt-4")).toBeInTheDocument();
      expect(screen.getByText("gpt-3.5")).toBeInTheDocument();
      // Find the trash button - it's inside the model list item
      const gpt4Row = screen.getByText("gpt-4").closest("div")?.parentElement;
      if (gpt4Row) {
        const trashBtn = gpt4Row.querySelector("button");
        if (trashBtn) fireEvent.click(trashBtn);
      }
      expect(screen.queryByText("gpt-4")).not.toBeInTheDocument();
    });

    it("Enter key adds model", () => {
      renderModal();
      const input = screen.getByPlaceholderText("输入模型名称，回车添加...");
      fireEvent.change(input, { target: { value: "claude-3" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(screen.getByText("claude-3")).toBeInTheDocument();
    });

    it("cannot add duplicate model names", () => {
      renderModal({
        editingProvider: {
          id: "test-provider",
          label: "Test Provider",
          baseUrl: "https://api.test.com",
          authType: "bearer",
          requiresApiKey: true,
          isLocal: false,
          isBuiltin: false,
          isCustom: true,
          models: ["gpt-4"],
          createdAt: Date.now(),
        },
      });
      const input = screen.getByPlaceholderText("输入模型名称，回车添加...");
      fireEvent.change(input, { target: { value: "gpt-4" } });
      fireEvent.keyDown(input, { key: "Enter" });
      // Should still only have one gpt-4
      const occurrences = screen.getAllByText("gpt-4");
      expect(occurrences.length).toBe(1);
    });

    it("cannot add empty model name", () => {
      renderModal();
      const input = screen.getByPlaceholderText("输入模型名称，回车添加...");
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.keyDown(input, { key: "Enter" });
      // The add button should be disabled
      const addBtn = Array.from(document.querySelectorAll("button")).find(
        (btn) => btn.querySelector("svg") && btn.disabled
      );
      expect(addBtn).toBeTruthy();
    });
  });

  // ── 提交 ──

  describe("提交", () => {
    it("submit button disabled when label or baseUrl is empty", () => {
      renderModal();
      // Find the submit button
      const submitBtn = screen.getByText("添加服务商");
      expect(submitBtn).toBeDisabled();
    });

    it("submit calls onSave with correct data for new provider", () => {
      const onSave = vi.fn();
      renderModal({ onSave });
      // Fill in required fields
      const nameInput = screen.getByPlaceholderText(/例如: Claude API/);
      fireEvent.change(nameInput, { target: { value: "My Provider" } });
      const urlInput = screen.getByPlaceholderText("https://api.example.com/v1");
      fireEvent.change(urlInput, { target: { value: "https://my.api.com/v1" } });
      // Add a model
      const modelInput = screen.getByPlaceholderText("输入模型名称，回车添加...");
      fireEvent.change(modelInput, { target: { value: "my-model" } });
      fireEvent.keyDown(modelInput, { key: "Enter" });
      // Submit
      fireEvent.click(screen.getByText("添加服务商"));
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          label: "My Provider",
          baseUrl: "https://my.api.com/v1",
          models: ["my-model"],
        })
      );
    });

    it("submit calls onUpdate with correct data for editing provider", () => {
      const onUpdate = vi.fn();
      const provider = {
        id: "test-provider",
        label: "Test Provider",
        baseUrl: "https://api.test.com",
        authType: "bearer" as const,
        requiresApiKey: true,
        isLocal: false,
        isBuiltin: false,
        isCustom: true,
        models: [],
        createdAt: Date.now(),
      };
      renderModal({ editingProvider: provider, onUpdate });
      // Change the label
      const nameInput = screen.getByPlaceholderText(/例如: Claude API/);
      fireEvent.change(nameInput, { target: { value: "Updated Provider" } });
      // Submit
      fireEvent.click(screen.getByText("保存修改"));
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(
        "test-provider",
        expect.objectContaining({
          label: "Updated Provider",
        })
      );
    });
  });

  // ── 内置服务商行为 ──

  describe("内置服务商行为", () => {
    it("builtin provider name field is disabled", () => {
      renderModal({
        editingProvider: {
          id: "builtin-provider",
          label: "Builtin",
          baseUrl: "https://api.builtin.com",
          authType: "bearer",
          requiresApiKey: true,
          isLocal: false,
          isBuiltin: true,
          isCustom: false,
          models: [],
          createdAt: Date.now(),
        },
      });
      const nameInput = screen.getByPlaceholderText(/例如: Claude API/) as HTMLInputElement;
      expect(nameInput.disabled).toBe(true);
    });

    it("renders '恢复默认' button for builtin provider with onReset", () => {
      const onReset = vi.fn();
      renderModal({
        editingProvider: {
          id: "builtin-provider",
          label: "Builtin",
          baseUrl: "https://api.builtin.com",
          authType: "bearer",
          requiresApiKey: true,
          isLocal: false,
          isBuiltin: true,
          isCustom: false,
          models: [],
          createdAt: Date.now(),
        },
        onReset,
      });
      expect(screen.getByText("恢复默认")).toBeInTheDocument();
      fireEvent.click(screen.getByText("恢复默认"));
      expect(onReset).toHaveBeenCalledWith("builtin-provider");
    });
  });

  // ── 关闭行为 ──

  describe("关闭行为", () => {
    it("clicking backdrop calls onClose", () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      // The backdrop is the first child div with absolute inset-0
      const backdrop = document.querySelector(".absolute.inset-0");
      if (backdrop) fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("clicking X button calls onClose", () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      // Find the X button in the header
      const buttons = screen.getAllByRole("button");
      const xBtn = buttons.find((btn) => btn.querySelector("svg"));
      if (xBtn) fireEvent.click(xBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ── Ollama 特殊消息 ──

  describe("Ollama 特殊消息", () => {
    it("Ollama provider shows special message about auto-detection", () => {
      renderModal({
        editingProvider: {
          id: "ollama",
          label: "Ollama",
          baseUrl: "http://localhost:11434",
          authType: "none",
          requiresApiKey: false,
          isLocal: true,
          isBuiltin: true,
          isCustom: false,
          models: [],
          createdAt: Date.now(),
        },
      });
      expect(screen.getByText("Ollama 模型从本地自动检测")).toBeInTheDocument();
    });
  });
});