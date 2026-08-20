/**
 * file: UnifiedModelSelector.test.tsx
 * description: UnifiedModelSelector 组件测试 · 只读模型选择器（搜索/分组/连接测试回调）
 * author: YanYuCloudCube Team
 * version: v1.2.0
 * created: 2026-08-19
 * updated: 2026-08-19
 * status: active
 * tags: [component],[test],[monitor],[model]
 *
 * brief: 修复 v1.1.0 3 个核心问题：
 *  1) useProviderSlice 未解构 testingIds 导致 testingIds.includes() 崩溃
 *  2) ConfiguredModel.status 合法值应为 active | error | unchecked（model-provider-types.ts:41），原 "idle" 非法
 *  3) onChange 类型与 vi.fn() 泛型对齐，修复 14 处 "Mock 不能分配给 (modelId,model)=>void"
 *
 * details:
 * - 对齐文档：docs/tests/monitor-unit-tests.md §6 UnifiedModelSelector
 * - 下拉内容使用 createPortal，默认注入 document.body，因此 screen.* 查询正常
 * - 通过真实 provider-slice 属性：testingIds=[]、activeModelId=null、fetchOllamaModels()、providers 完整结构
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ConfiguredModel } from "../types";

// ──────────────────────────────────────────────────────────────────
// 类型：onChange 精确签名（与 UnifiedModelSelectorProps.onChange 一致）
// ──────────────────────────────────────────────────────────────────
type OnChangeFn = (modelId: string, model: ConfiguredModel) => void;

// ──────────────────────────────────────────────────────────────────
// Mock
// ──────────────────────────────────────────────────────────────────

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className, ...rest }: any) =>
    React.createElement("div", { "data-testid": "yyc3-glass-card", className, ...rest }, children),
}));

// ──────────────────────────────────────────────────────────────────
// 测试数据（status 严格使用 "active"|"error"|"unchecked"）
// ──────────────────────────────────────────────────────────────────

const mockModels: ConfiguredModel[] = [
  {
    id: "m-zhipu-glm4-1",
    providerId: "zhipu",
    providerLabel: "Z.ai",
    model: "glm-4-flash",
    apiKey: "sk-xxx-glm4-1",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    createdAt: Date.now() - 86400_000,
    lastUsed: Date.now() - 3600_000,
    status: "active",
    lastTestResult: {
      steps: [
        { label: "连通性", status: "pass", detail: "200 OK", latencyMs: 120 },
        { label: "鉴权", status: "pass", detail: "API Key 合法", latencyMs: 40 },
        { label: "响应", status: "pass", detail: "stream 正常", latencyMs: 252 },
      ],
      suggestion: "响应速度良好",
      totalLatencyMs: 412,
      testedAt: Date.now() - 3600_000,
    },
  },
  {
    id: "m-deepseek-chat",
    providerId: "deepseek",
    providerLabel: "DeepSeek",
    model: "deepseek-chat",
    apiKey: "sk-xxx-deepseek-2",
    baseUrl: "https://api.deepseek.com/v1",
    createdAt: Date.now() - 172800_000,
    lastUsed: Date.now() - 7200_000,
    status: "error",
    lastTestResult: {
      steps: [
        { label: "连通性", status: "pass", detail: "200 OK", latencyMs: 15000 },
        { label: "鉴权", status: "fail", detail: "Invalid API Key", latencyMs: 0 },
      ],
      suggestion: "请检查 DeepSeek API Key 是否正确",
      totalLatencyMs: 15000,
      testedAt: Date.now() - 7200_000,
    },
  },
  {
    id: "m-ollama-qwen3",
    providerId: "ollama",
    providerLabel: "Ollama (本地)",
    model: "qwen3:latest",
    apiKey: "",
    baseUrl: "http://localhost:11434",
    createdAt: Date.now() - 259200_000,
    lastUsed: null,
    status: "unchecked",      // 合法联合类型（非 idle）
  },
];

let mockProvidersReturn: any;

vi.mock("../store/slices/provider-slice", () => ({
  useProviderSlice: (_selector?: any) => mockProvidersReturn,
  BUILTIN_PROVIDERS: [
    { id: "zhipu", label: "Z.ai" },
    { id: "deepseek", label: "DeepSeek" },
    { id: "ollama", label: "Ollama (本地)" },
  ],
}));

// import 必须在 vi.mock 之后
import { UnifiedModelSelector } from "../modules/monitor/UnifiedModelSelector";

describe("UnifiedModelSelector", () => {
  // 类型修复：Vitest 4 vi.fn 仅接受 0-1 个泛型参数（整函数签名），且与 OnChangeFn 交叉
  // 需先 cast to unknown 再 cast 到目标组合类型
  let onChangeFn: OnChangeFn & ReturnType<typeof vi.fn>;
  let testFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChangeFn = vi.fn() as unknown as OnChangeFn & ReturnType<typeof vi.fn>;
    testFn = vi.fn().mockResolvedValue(undefined);
    mockProvidersReturn = {
      configuredModels: mockModels,
      providers: [
        { id: "zhipu", label: "Z.ai" },
        { id: "deepseek", label: "DeepSeek" },
        { id: "ollama", label: "Ollama (本地)" },
      ],
      ollamaModels: [],
      ollamaLoading: false,
      ollamaError: null,
      testingIds: [] as string[],      // 修复 testingIds.includes() 崩溃
      activeModelId: null,
      testConnection: testFn,
      fetchOllamaModels: vi.fn().mockResolvedValue([] as any),
    };
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // =================================================================
  describe("基础渲染", () => {
    it("应正常挂载并展示占位文案", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="请选择模型" />);
      expect(screen.getByText("请选择模型")).toBeInTheDocument();
    });

    it("label 应正确展示", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} label="推理模型" placeholder="选一个" />);
      expect(screen.getByText("推理模型")).toBeInTheDocument();
    });

    it("点击占位文案打开下拉，3 个模型名均可见", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选模型" showTestButton />);
      fireEvent.click(screen.getByText("选模型"));
      expect(screen.getByText("glm-4-flash")).toBeInTheDocument();
      expect(screen.getByText("deepseek-chat")).toBeInTheDocument();
      expect(screen.getByText("qwen3:latest")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("模型状态图标", () => {
    it("active 状态模型 (glm-4-flash) 文本可见", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选" showTestButton />);
      fireEvent.click(screen.getByText("选"));
      expect(screen.getByText("glm-4-flash")).toBeTruthy();
    });

    it("error 状态模型 (deepseek-chat) 可见", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选" showTestButton />);
      fireEvent.click(screen.getByText("选"));
      expect(screen.getByText("deepseek-chat")).toBeTruthy();
    });

    it("unchecked 状态模型 (ollama qwen3:latest) 可见", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选" showTestButton />);
      fireEvent.click(screen.getByText("选"));
      expect(screen.getByText("qwen3:latest")).toBeTruthy();
    });
  });

  // =================================================================
  describe("选择回调 onChange", () => {
    it("点击模型 glm-4-flash → onChange(modelId, model) 调用 1 次", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选" />);
      fireEvent.click(screen.getByText("选"));
      fireEvent.click(screen.getByText("glm-4-flash"));
      expect(onChangeFn).toHaveBeenCalledTimes(1);
      expect(onChangeFn.mock.calls[0][0]).toBe("m-zhipu-glm4-1");
      expect(onChangeFn.mock.calls[0][1].model).toBe("glm-4-flash");
    });

    it("点击 qwen3:latest → onChange 回调收到 m-ollama-qwen3 ID", () => {
      // 注意：组件受控，selectedModel 来自 props.value / providerSlice.activeModelId
      // 点击模型后只会触发 onChange + 关闭下拉，触发器本身不会回显模型
      // （除非父组件传递 value 或全局 activeModelId 被更新）
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选一个模型" />);
      fireEvent.click(screen.getByText("选一个模型"));
      expect(screen.getByText("qwen3:latest")).toBeTruthy();
      fireEvent.click(screen.getByText("qwen3:latest"));
      expect(onChangeFn).toHaveBeenCalledTimes(1);
      expect(onChangeFn.mock.calls[0][0]).toBe("m-ollama-qwen3");
      expect(onChangeFn.mock.calls[0][1].model).toBe("qwen3:latest");
    });
  });

  // =================================================================
  describe("provider 分组", () => {
    it("showProviderGroup=true 时显示 3 个 providerLabel 文本", () => {
      render(
        <UnifiedModelSelector
          onChange={onChangeFn}
          placeholder="选"
          showProviderGroup
          showTestButton
        />
      );
      fireEvent.click(screen.getByText("选"));
      expect(screen.getAllByText("Z.ai").length).toBeGreaterThan(0);
      expect(screen.getAllByText("DeepSeek").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Ollama (本地)").length).toBeGreaterThan(0);
    });
  });

  // =================================================================
  describe("连接测试 (showTestButton & lastTestResult)", () => {
    it("showTestButton 开启时，glm-4-flash 行右侧显示 412ms 延迟", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选" showTestButton />);
      fireEvent.click(screen.getByText("选"));
      expect(screen.getByText("412ms")).toBeInTheDocument();
    });

    it("Zap 按钮顺序 = Ollama→Z.ai→DeepSeek，点击第二个 = Z.ai (m-zhipu-glm4-1)", async () => {
      // filteredModels.sort: Ollama 本地 providerId 优先，故 zapBtns[1]=zhipu
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选" showTestButton showProviderGroup />);
      fireEvent.click(screen.getByText("选"));
      const zapBtns = screen.getAllByTitle("测试连接");
      expect(zapBtns.length).toBe(3);
      fireEvent.click(zapBtns[1]);
      await Promise.resolve();
      expect(testFn).toHaveBeenCalledWith("m-zhipu-glm4-1");
    });
  });

  // =================================================================
  describe("搜索过滤", () => {
    it("搜索 'qwen' → 仅剩下 ollama 的 qwen3:latest", () => {
      render(
        <UnifiedModelSelector
          onChange={onChangeFn}
          placeholder="选"
          showTestButton
          showProviderGroup
        />
      );
      fireEvent.click(screen.getByText("选"));
      const searchInput = screen.getByPlaceholderText("搜索模型...") as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: "qwen" } });
      expect(screen.getByText("qwen3:latest")).toBeTruthy();
      expect(screen.queryByText("glm-4-flash")).toBeNull();
      expect(screen.queryByText("deepseek-chat")).toBeNull();
    });

    it("搜索 providerLabel 'DeepSeek' → 只显示 deepseek-chat", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选" showProviderGroup />);
      fireEvent.click(screen.getByText("选"));
      const input = screen.getByPlaceholderText("搜索模型...") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "DeepSeek" } });
      expect(screen.getByText("deepseek-chat")).toBeTruthy();
      expect(screen.queryByText("glm-4-flash")).toBeNull();
    });
  });

  // =================================================================
  describe("filterByProvider 限制", () => {
    it("filterByProvider=['ollama'] → 仅 qwen3:latest 可见", () => {
      render(
        <UnifiedModelSelector
          onChange={onChangeFn}
          placeholder="选"
          filterByProvider={["ollama"]}
        />
      );
      fireEvent.click(screen.getByText("选"));
      expect(screen.getByText("qwen3:latest")).toBeInTheDocument();
      expect(screen.queryByText("glm-4-flash")).toBeNull();
      expect(screen.queryByText("deepseek-chat")).toBeNull();
    });
  });

  // =================================================================
  describe("compact 模式", () => {
    it("compact=true + showProviderGroup=false → 下拉内不出现分组标题 'Z.ai'，仅存在模型 p 标签内的 providerLabel", () => {
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选" compact showProviderGroup={false} />);
      fireEvent.click(screen.getByText("选"));
      // 只有 1 次 "Z.ai"：compact 模式下 providerLabel 默认隐藏
      expect(screen.getByText("glm-4-flash")).toBeTruthy();
      const zhs = screen.queryAllByText("Z.ai");
      expect(zhs.length).toBe(0);
    });
  });

  // =================================================================
  describe("activeModelId 默认回显", () => {
    it("provider activeModelId=m-deepseek-chat → 触发器默认显示 deepseek-chat", () => {
      mockProvidersReturn.activeModelId = "m-deepseek-chat";
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="选" />);
      expect(screen.getByText("deepseek-chat")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("异常保护", () => {
    it("空 configuredModels → 仅渲染占位，展开后不抛错", () => {
      mockProvidersReturn.configuredModels = [];
      render(<UnifiedModelSelector onChange={onChangeFn} placeholder="无模型" />);
      expect(screen.getByText("无模型")).toBeInTheDocument();
      fireEvent.click(screen.getByText("无模型"));
      expect(screen.queryByText("glm-4-flash")).toBeNull();
    });
  });
});
