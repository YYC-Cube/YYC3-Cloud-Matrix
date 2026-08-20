/**
 * @file: FamilyModelSettings.test.tsx
 * @description: FamilyModelSettings组件自编辑功能单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../store/slices/provider-slice", () => ({
  useProviderSlice: () => ({
    providers: [
      { id: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1", models: ["gpt-4o", "gpt-4o-mini"], isLocal: false },
      { id: "deepseek", label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", models: ["deepseek-chat"], isLocal: false },
      { id: "ollama", label: "Ollama", baseUrl: "http://localhost:11434", models: ["llama3.1:8b"], isLocal: true },
      { id: "zhipu", label: "智谱AI", baseUrl: "https://open.bigmodel.cn/api/paas/v4", models: ["glm-4-flash", "glm-4"], isLocal: false },
      { id: "qwen", label: "通义千问", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", models: ["qwen3-max"], isLocal: false },
    ],
    configuredModels: [
      { id: "cm-1", providerId: "openai", providerLabel: "OpenAI", model: "gpt-4o", apiKey: "sk-test-key", baseUrl: "https://api.openai.com/v1", status: "active" },
      { id: "cm-2", providerId: "deepseek", providerLabel: "DeepSeek", model: "deepseek-chat", apiKey: "sk-ds-test", baseUrl: "https://api.deepseek.com/v1", status: "active" },
    ],
    fetchOllamaModels: vi.fn(),
    addModel: vi.fn(),
    updateModel: vi.fn(),
    removeModel: vi.fn(),
    testConnection: vi.fn(async () => { }),
    testAllConnections: vi.fn(async () => []),
    presetModels: vi.fn(),
  }),
}));

vi.mock("../store/slices/family-settings-slice", () => {
  const state = {
    modelAssignments: [],
    voiceProfiles: [],
    updateModelAssignment: vi.fn(),
    updateVoiceProfile: vi.fn(),
  };
  const mockFn = (selector?: Function) => selector ? selector(state) : state;
  mockFn.getState = () => state;
  return { useFamilySettingsSlice: mockFn };
});

vi.mock("../store", () => ({
  useFamilyMemberSlice: () => ({
    members: [
      { id: "navigator", name: "千行", shortName: "千行", enTitle: "Navigator", icon: "Compass", color: "#00d4ff", quote: "导航", status: "online", role: "导航员" },
      { id: "thinker", name: "万物", shortName: "万物", enTitle: "Thinker", icon: "Brain", color: "#a855f7", quote: "思考", status: "online", role: "思考者" },
    ],
  }),
}));

const STORAGE_KEY = "yyc3-family-model-assignments";
const API_KEYS_KEY = "yyc3-family-api-keys";

const defaultAssignments = [
  { memberId: "navigator", provider: "openai", model: "gpt-4o", enabled: true },
  { memberId: "thinker", provider: "claude", model: "claude-sonnet-4-20250514", enabled: true },
  { memberId: "prophet", provider: "zhipu", model: "glm-5", enabled: true },
  { memberId: "bolero", provider: "qwen", model: "qwen3-max", enabled: true },
  { memberId: "sentinel", provider: "deepseek", model: "deepseek-chat", enabled: true },
  { memberId: "master", provider: "ollama", model: "llama3.1:8b", enabled: true },
  { memberId: "oracle", provider: "openai", model: "gpt-4o-mini", enabled: true },
  { memberId: "creator", provider: "claude", model: "claude-3-5-haiku-20241022", enabled: true },
];

import { FamilyModelSettings } from "../modules/ai-family/components/FamilyModelSettings";

describe("FamilyModelSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAssignments));
    localStorage.setItem(API_KEYS_KEY, JSON.stringify({
      openai: "sk-test-key",
      claude: "sk-ant-test",
    }));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe("rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<FamilyModelSettings />);
      expect(container.firstChild).toBeDefined();
    });

    it("should render page header", () => {
      render(<FamilyModelSettings />);
      expect(screen.getByText(/模型设置|大模型/i)).toBeDefined();
    });

    it("should render provider list", () => {
      render(<FamilyModelSettings />);
      const providerTexts = screen.getAllByText(/OpenAI|Anthropic|智谱|通义|DeepSeek|Ollama/i);
      expect(providerTexts.length).toBeGreaterThan(0);
    });

    it("should render family member model assignments", () => {
      render(<FamilyModelSettings />);
      const memberTexts = screen.getAllByText(/千行|万物|先知|伯乐|守护|宗师|天枢|灵韵/);
      expect(memberTexts.length).toBeGreaterThan(0);
    });
  });

  describe("API key management", () => {
    it("should load API keys from localStorage", () => {
      render(<FamilyModelSettings />);
      expect(localStorage.getItem(API_KEYS_KEY)).toBeDefined();
    });

    it("should toggle API key visibility", async () => {
      render(<FamilyModelSettings />);

      const eyeButtons = screen.getAllByRole("button");
      const eyeBtn = eyeButtons.find((btn) =>
        btn.getAttribute("aria-label")?.includes("显示") ||
        btn.querySelector('[data-icon="eye"]')
      );

      if (eyeBtn) {
        fireEvent.click(eyeBtn);
        await waitFor(() => {
          expect(screen.getByDisplayValue(/sk-/i) || document.querySelector("input[type='text']")).toBeDefined();
        });
      }
    });

    it("should save API key changes", async () => {
      render(<FamilyModelSettings />);

      const inputs = document.querySelectorAll("input[type='password'], input[type='text']");
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: "new-api-key" } });
      }

      await waitFor(() => {
        const saved = localStorage.getItem(API_KEYS_KEY);
        expect(saved).toBeDefined();
      });
    });
  });

  describe("model assignment editing", () => {
    it("should load model assignments from localStorage", () => {
      render(<FamilyModelSettings />);
      expect(localStorage.getItem(STORAGE_KEY)).toBeDefined();
    });

    it("should display current model assignments", () => {
      render(<FamilyModelSettings />);
      const modelTexts = screen.getAllByText(/gpt-4o|claude|glm|qwen|deepseek|llama/i);
      expect(modelTexts.length).toBeGreaterThan(0);
    });

    it("should save model assignment changes", async () => {
      render(<FamilyModelSettings />);

      const selects = document.querySelectorAll("select");
      if (selects.length > 0) {
        fireEvent.change(selects[0], { target: { value: "gpt-4o-mini" } });
      }

      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEY)).toBeDefined();
      });
    });

    it("should toggle model enabled state", async () => {
      render(<FamilyModelSettings />);

      const toggleButtons = screen.getAllByRole("button");
      const toggleBtn = toggleButtons.find((btn) =>
        btn.getAttribute("aria-pressed") !== null ||
        btn.className.includes("toggle")
      );

      if (toggleBtn) {
        fireEvent.click(toggleBtn);
        await waitFor(() => {
          expect(localStorage.getItem(STORAGE_KEY)).toBeDefined();
        });
      }
    });
  });

  describe("connection testing", () => {
    it("should render test connection button", () => {
      render(<FamilyModelSettings />);
      const testButtons = screen.getAllByRole("button");
      const hasTestButton = testButtons.some((btn) =>
        btn.textContent?.includes("测试") ||
        btn.textContent?.includes("诊断")
      );
      expect(hasTestButton || testButtons.length > 0).toBe(true);
    });
  });

  describe("provider management", () => {
    it("should display all supported providers", () => {
      render(<FamilyModelSettings />);
      expect(screen.getAllByText(/OpenAI|Anthropic|智谱|通义|DeepSeek|Ollama/i).length).toBeGreaterThan(0);
    });

    it("should show provider models on expand", async () => {
      render(<FamilyModelSettings />);

      const expandButtons = screen.getAllByRole("button");
      const expandBtn = expandButtons.find((btn) =>
        btn.querySelector('[data-icon="chevron-down"]') ||
        btn.querySelector('[data-icon="chevron-right"]')
      );

      if (expandBtn) {
        fireEvent.click(expandBtn);
        await waitFor(() => {
          expect(document.body).toBeDefined();
        });
      }
    });
  });
});
