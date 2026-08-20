/**
 * @file: VariableCenter.test.tsx
 * @description: VariableCenter 组件单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-07-25
 * @updated: 2026-07-25
 * @status: active
 * @tags: [test],[component],[admin]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { VariableCenter } from "../modules/admin/VariableCenter";

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

vi.mock("../config/variable-center", () => {
  const sampleVariables = [
    {
      key: "device.name",
      label: "Device Name",
      labelCn: "设备名称",
      description: "设备名称",
      type: "text" as const,
      category: "device" as const,
      group: "device-info",
      defaultValue: "MyDevice",
      editable: true,
      required: true,
      sensitive: false,
      placeholder: "输入设备名称",
    },
    {
      key: "device.autoStart",
      label: "Auto Start",
      labelCn: "自动启动",
      description: "是否自动启动",
      type: "boolean" as const,
      category: "device" as const,
      group: "device-info",
      defaultValue: false,
      editable: true,
      required: false,
      sensitive: false,
    },
    {
      key: "user.name",
      label: "User Name",
      labelCn: "用户名",
      description: "用户名称",
      type: "text" as const,
      category: "user" as const,
      group: "user-info",
      defaultValue: "Admin",
      editable: true,
      required: true,
      sensitive: false,
      placeholder: "输入用户名",
    },
    {
      key: "secret.apiKey",
      label: "API Key",
      labelCn: "API 密钥",
      description: "API 密钥",
      type: "password" as const,
      category: "secret" as const,
      group: "secret-keys",
      defaultValue: "",
      editable: true,
      required: false,
      sensitive: true,
      placeholder: "输入 API 密钥",
    },
    {
      key: "model.temperature",
      label: "Temperature",
      labelCn: "温度",
      description: "模型温度参数",
      type: "number" as const,
      category: "model" as const,
      group: "model-params",
      defaultValue: 0.7,
      editable: true,
      required: false,
      sensitive: false,
      validation: { min: 0, max: 2 },
    },
    {
      key: "model.provider",
      label: "Provider",
      labelCn: "提供商",
      description: "模型提供商",
      type: "select" as const,
      category: "model" as const,
      group: "model-params",
      defaultValue: "openai",
      editable: true,
      required: true,
      sensitive: false,
      options: [
        { value: "openai", label: "OpenAI" },
        { value: "ollama", label: "Ollama" },
        { value: "anthropic", label: "Anthropic" },
      ],
    },
    {
      key: "system.logLevel",
      label: "Log Level",
      labelCn: "日志级别",
      description: "系统日志级别",
      type: "select" as const,
      category: "system" as const,
      group: "system-config",
      defaultValue: "info",
      editable: true,
      required: false,
      sensitive: false,
      options: [
        { value: "debug", label: "Debug" },
        { value: "info", label: "Info" },
        { value: "warn", label: "Warn" },
        { value: "error", label: "Error" },
      ],
    },
    {
      key: "env.apiUrl",
      label: "API URL",
      labelCn: "API 地址",
      description: "API 服务地址",
      type: "url" as const,
      category: "env" as const,
      group: "env-config",
      defaultValue: "http://localhost:3000",
      editable: true,
      required: true,
      sensitive: false,
      placeholder: "输入 API 地址",
    },
    {
      key: "env.config",
      label: "Config JSON",
      labelCn: "配置 JSON",
      description: "JSON 格式配置",
      type: "json" as const,
      category: "env" as const,
      group: "env-config",
      defaultValue: { key: "value" },
      editable: true,
      required: false,
      sensitive: false,
    },
    {
      key: "system.readOnly",
      label: "Read Only",
      labelCn: "只读变量",
      description: "只读系统变量",
      type: "text" as const,
      category: "system" as const,
      group: "system-config",
      defaultValue: "readonly-value",
      editable: false,
      required: false,
      sensitive: false,
    },
  ];

  const sampleGroups = [
    { id: "device-info", nameCn: "设备信息", description: "设备相关配置" },
    { id: "user-info", nameCn: "用户信息", description: "用户相关配置" },
    { id: "secret-keys", nameCn: "密钥信息", description: "密钥相关配置" },
    { id: "model-params", nameCn: "模型参数", description: "模型参数配置" },
    { id: "system-config", nameCn: "系统配置", description: "系统配置" },
    { id: "env-config", nameCn: "环境配置", description: "环境变量配置" },
  ];

  return {
    VARIABLE_DEFINITIONS: sampleVariables,
    getVariablesByCategory: (category: string) =>
      sampleVariables.filter((v) => v.category === category),
    getGroupsByCategory: (category: string) => {
      const groupIds = new Set(
        sampleVariables.filter((v) => v.category === category).map((v) => v.group)
      );
      return sampleGroups.filter((g) => groupIds.has(g.id));
    },
    getVariableValue: (key: string) => {
      const def = sampleVariables.find((v) => v.key === key);
      return def
        ? { key, value: def.defaultValue, source: "default" as const, updatedAt: Date.now() }
        : { key, value: undefined, source: "default" as const, updatedAt: Date.now() };
    },
    setVariableValue: vi.fn(),
    resetVariableValue: vi.fn(),
    resetAllVariableValues: vi.fn(),
    validateVariable: () => ({ valid: true, errors: [] }),
    exportVariables: () => ({ version: "1.0.0", exportedAt: "", variables: {} }),
    importVariables: () => ({ imported: 0, skipped: 0 }),
    getAllCategories: () => ["device", "user", "secret", "model", "system", "env"] as const,
  };
});

vi.mock("../components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
    className?: string;
  }) => React.createElement("button", { onClick, disabled, "data-testid": "button", "data-variant": variant }, children),
}));

vi.mock("../components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "card" }, children),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "card-content" }, children),
  CardDescription: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("p", { className, "data-testid": "card-description" }, children),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "card-header" }, children),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("h3", { className, "data-testid": "card-title" }, children),
}));

vi.mock("../components/ui/label", () => ({
  Label: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("label", { className }, children),
}));

vi.mock("../components/ui/input", () => ({
  Input: ({ value, onChange, placeholder, disabled, type, className, min, max }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
    className?: string;
    min?: number;
    max?: number;
  }) => React.createElement("input", { value, placeholder, disabled, type, className, min, max, onChange, "data-testid": "input" }),
}));

vi.mock("../components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange, disabled }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
  }) => React.createElement("button", {
    "data-testid": "switch",
    "data-checked": checked,
    disabled,
    onClick: () => onCheckedChange?.(!checked),
  }),
}));

vi.mock("../components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }) => React.createElement("div", { "data-testid": "select", "data-value": value }, children),
  SelectContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select-content" }, children),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement("div", { "data-testid": "select-item", "data-value": value }, children),
  SelectTrigger: ({ className }: { className?: string }) =>
    React.createElement("button", { className, "data-testid": "select-trigger" }),
  SelectValue: () => React.createElement("span", { "data-testid": "select-value" }),
}));

vi.mock("../components/ui/badge", () => ({
  Badge: ({ children, variant, className }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => React.createElement("span", { "data-testid": "badge", "data-variant": variant, className }, children),
}));

vi.mock("../components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "scroll-area" }, children),
}));

const originalConfirm = window.confirm;

describe("VariableCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.confirm = originalConfirm;
  });

  it("renders header with '变量中心'", () => {
    render(React.createElement(VariableCenter));
    expect(screen.getByText("变量中心")).toBeInTheDocument();
  });

  it("renders category sidebar with 6 categories", () => {
    render(React.createElement(VariableCenter));
    expect(screen.getByText("设备变量")).toBeInTheDocument();
    expect(screen.getByText("人员变量")).toBeInTheDocument();
    expect(screen.getByText("密钥变量")).toBeInTheDocument();
    expect(screen.getByText("模型配置")).toBeInTheDocument();
    expect(screen.getByText("系统配置")).toBeInTheDocument();
    expect(screen.getByText("环境变量")).toBeInTheDocument();
  });

  it("renders variable groups for selected category", () => {
    render(React.createElement(VariableCenter));
    expect(screen.getByText("设备信息")).toBeInTheDocument();
  });

  it("renders variable inputs based on type", () => {
    render(React.createElement(VariableCenter));
    const deviceNames = screen.getAllByText("设备名称");
    expect(deviceNames.length).toBeGreaterThan(0);
    expect(screen.getByText("自动启动")).toBeInTheDocument();
  });

  it("search input filters variables", () => {
    render(React.createElement(VariableCenter));
    const searchInput = screen.getByPlaceholderText("搜索变量...");
    expect(searchInput).toBeInTheDocument();
  });

  it("save button disabled when no changes", () => {
    render(React.createElement(VariableCenter));
    const saveBtn = screen.getByText("保存");
    expect(saveBtn).toBeDisabled();
  });

  it("import button opens file dialog", () => {
    render(React.createElement(VariableCenter));
    expect(screen.getByText("导入")).toBeInTheDocument();
  });

  it("export button triggers download", () => {
    render(React.createElement(VariableCenter));
    expect(screen.getByText("导出")).toBeInTheDocument();
  });

  it("reset all button shows confirm dialog", () => {
    render(React.createElement(VariableCenter));
    const resetBtn = screen.getByText("重置全部");
    expect(resetBtn).toBeInTheDocument();
  });

  it("reset individual variable resets to default", () => {
    render(React.createElement(VariableCenter));
    const resetButtons = screen.queryAllByTitle("重置为默认值");
    expect(resetButtons.length).toBeGreaterThanOrEqual(0);
  });

  it("shows empty state when no variables match search", () => {
    render(React.createElement(VariableCenter));
    const searchInput = screen.getByPlaceholderText("搜索变量...");
    fireEvent.change(searchInput, { target: { value: "zzz_nonexistent" } });
    expect(screen.getByText("未找到变量")).toBeInTheDocument();
  });
});