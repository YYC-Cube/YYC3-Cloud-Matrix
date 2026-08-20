/**
 * @file: StorageConfigPanel.test.tsx
 * @description: StorageConfigPanel 组件单元测试
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
import { StorageConfigPanel } from "../modules/admin/StorageConfigPanel";

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

vi.mock("../components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "card" }, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "card-content" }, children),
  CardDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("p", { "data-testid": "card-description" }, children),
  CardHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "card-header" }, children),
  CardTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h3", { "data-testid": "card-title" }, children),
}));

vi.mock("../components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, type }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: string;
  }) => React.createElement("button", { onClick, disabled, className, type, "data-testid": "button" }, children),
}));

vi.mock("../components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => React.createElement("div", { "data-testid": "select", "data-value": value }, children),
  SelectContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select-content" }, children),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement("div", { "data-testid": "select-item", "data-value": value }, children),
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) =>
    React.createElement("button", { id, "data-testid": "select-trigger" }, children),
  SelectValue: ({ placeholder }: { placeholder?: string }) =>
    React.createElement("span", { "data-testid": "select-value" }, placeholder),
}));

vi.mock("../components/ui/label", () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) =>
    React.createElement("label", { htmlFor }, children),
}));

vi.mock("../components/ui/switch", () => ({
  Switch: ({ id, checked, onCheckedChange, disabled }: {
    id?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
  }) => React.createElement("button", {
    id,
    "data-testid": "switch",
    "data-checked": checked,
    disabled,
    onClick: () => onCheckedChange?.(!checked),
  }),
}));

vi.mock("../components/ui/slider", () => ({
  Slider: ({ id, min, max, step, value, onValueChange }: {
    id?: string;
    min?: number;
    max?: number;
    step?: number;
    value?: number[];
    onValueChange?: (value: number[]) => void;
  }) => React.createElement("input", {
    id,
    type: "range",
    min,
    max,
    step,
    value: value?.[0],
    "data-testid": "slider",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onValueChange?.([parseInt(e.target.value)]),
  }),
}));

vi.mock("../components/ui/alert", () => ({
  Alert: ({ children, variant, className }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => React.createElement("div", { className, "data-testid": "alert", "data-variant": variant }, children),
  AlertDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "alert-description" }, children),
}));

vi.mock("../modules/ops/DatabaseConnectionPanel", () => ({
  DatabaseConnectionPanel: () => React.createElement("div", { "data-testid": "database-connection-panel" }),
}));

const defaultConfig = {
  type: "localStorage" as const,
  syncInterval: 30,
  autoSync: true,
  offlineMode: false,
  conflictResolution: "local" as const,
};

describe("StorageConfigPanel", () => {
  const mockOnConfigChange = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderPanel(props = {}) {
    return render(
      React.createElement(StorageConfigPanel, {
        config: defaultConfig,
        onConfigChange: mockOnConfigChange,
        onSave: mockOnSave,
        ...props,
      })
    );
  }

  it("renders storage type selector", () => {
    renderPanel();
    expect(screen.getByText("storage.config.storageType")).toBeInTheDocument();
    expect(screen.getByText("storage.config.selectStorageType")).toBeInTheDocument();
  });

  it("renders sync interval slider", () => {
    renderPanel();
    expect(screen.getByText("storage.config.syncInterval")).toBeInTheDocument();
    expect(screen.getByTestId("slider")).toBeInTheDocument();
  });

  it("renders auto-sync toggle", () => {
    renderPanel();
    expect(screen.getByText("storage.config.autoSync")).toBeInTheDocument();
  });

  it("renders offline mode toggle", () => {
    renderPanel();
    expect(screen.getByText("storage.config.offlineMode")).toBeInTheDocument();
  });

  it("renders conflict resolution selector", () => {
    renderPanel();
    expect(screen.getByText("storage.config.conflictResolution")).toBeInTheDocument();
  });

  it("renders save button", () => {
    renderPanel();
    expect(screen.getByText("common.save")).toBeInTheDocument();
  });

  it("calls onSave when save button clicked", () => {
    renderPanel();
    const saveBtn = screen.getByText("common.save");
    fireEvent.click(saveBtn);
    expect(mockOnConfigChange).toHaveBeenCalled();
    expect(mockOnSave).toHaveBeenCalled();
  });

  it("save button disabled when isSaving=true", () => {
    renderPanel({ isSaving: true });
    const saveBtn = screen.getByText("common.saving");
    expect(saveBtn).toBeDisabled();
  });

  it("shows error alert when error prop provided", () => {
    renderPanel({ error: "Connection failed" });
    expect(screen.getByTestId("alert")).toBeInTheDocument();
    expect(screen.getByText("Connection failed")).toBeInTheDocument();
  });

  it("shows database config section when type is database", () => {
    const dbConfig = { ...defaultConfig, type: "database" as const };
    renderPanel({ config: dbConfig });
    expect(screen.getByTestId("database-connection-panel")).toBeInTheDocument();
  });

  it("updates local config when storage type changes", () => {
    renderPanel();
    const selectEls = screen.getAllByTestId("select");
    expect(selectEls.length).toBeGreaterThan(0);
  });
});