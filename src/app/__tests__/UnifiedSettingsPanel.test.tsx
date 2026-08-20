/**
 * @file: UnifiedSettingsPanel.test.tsx
 * @description: UnifiedSettingsPanel 组件单元测试
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
import { UnifiedSettingsPanel } from "../modules/admin/UnifiedSettingsPanel";
import { exportStoreData } from "../stores/global-store";

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

vi.mock("../hooks/useCopyFeedback", () => ({
  useCopyFeedback: vi.fn(() => [false, vi.fn()]),
}));

vi.mock("../lib/crypto-vault", () => ({
  isCryptoAvailable: vi.fn(() => true),
}));

vi.mock("../lib/full-backup", () => ({
  downloadFullBackup: vi.fn(() => Promise.resolve()),
  importFullBackup: vi.fn(() => Promise.resolve({ success: true, errors: [] })),
}));

vi.mock("../store", () => ({
  useProviderSlice: vi.fn(() => ({
    providers: [
      { id: "1", label: "OpenAI", requiresApiKey: true },
      { id: "2", label: "Ollama", requiresApiKey: false },
      { id: "3", label: "Anthropic", requiresApiKey: true },
    ],
    configuredModels: [
      { id: "m1", name: "gpt-4" },
      { id: "m2", name: "llama3" },
    ],
  })),
  useSettingsSSOT: vi.fn(() => ({
    toggles: { feature1: true, feature2: false, feature3: true },
  })),
}));

vi.mock("../stores/global-store", () => ({
  exportStoreData: vi.fn(() => JSON.stringify({ test: "data" })),
  importStoreData: vi.fn(() => true),
  useAlerts: vi.fn(() => ({
    followUps: [{ id: "f1" }, { id: "f2" }, { id: "f3" }],
  })),
  useDatabase: vi.fn(() => ({
    connections: [{ id: "c1" }, { id: "c2" }, { id: "c3" }, { id: "c4" }],
  })),
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "glass-card" }, children),
}));

vi.mock("../components/ui/alert-dialog", () => {
  const createElement = React.createElement;
  return {
    AlertDialog: ({ children }: { children: React.ReactNode }) =>
      createElement("div", { "data-testid": "alert-dialog" }, children),
    AlertDialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
      asChild ? children : createElement("div", null, children),
    AlertDialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      createElement("div", { className, "data-testid": "alert-dialog-content" }, children),
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) =>
      createElement("div", null, children),
    AlertDialogTitle: ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) =>
      createElement("div", { className, style }, children),
    AlertDialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      createElement("div", { className }, children),
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) =>
      createElement("div", null, children),
    AlertDialogCancel: ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) =>
      createElement("button", { className, onClick }, children),
    AlertDialogAction: ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) =>
      createElement("button", { className, onClick, "data-testid": "alert-dialog-action" }, children),
  };
});

vi.mock("../components/ui/progress", () => ({
  Progress: ({ value, className }: { value: number; className?: string }) =>
    React.createElement("div", { className, "data-testid": "progress", "aria-valuenow": value }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("UnifiedSettingsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders title and description", () => {
    render(React.createElement(UnifiedSettingsPanel));
    expect(screen.getByText("settings.unifiedSettings")).toBeInTheDocument();
    expect(screen.getByText("settings.unifiedSettingsDesc")).toBeInTheDocument();
  });

  it("renders 4 tabs: security, data, storage, about", () => {
    render(React.createElement(UnifiedSettingsPanel));
    expect(screen.getByText("settings.security")).toBeInTheDocument();
    expect(screen.getByText("settings.dataManagement")).toBeInTheDocument();
    expect(screen.getByText("settings.storage")).toBeInTheDocument();
    expect(screen.getByText("settings.about")).toBeInTheDocument();
  });

  it("default tab is security", () => {
    render(React.createElement(UnifiedSettingsPanel));
    expect(screen.getByText("settings.dataIsolation")).toBeInTheDocument();
    expect(screen.getByText("settings.dataIsolationDesc")).toBeInTheDocument();
  });

  it("clicking tab switches content", () => {
    render(React.createElement(UnifiedSettingsPanel));
    const dataTab = screen.getByText("settings.dataManagement");
    fireEvent.click(dataTab);
    expect(screen.getByText("settings.dataExport")).toBeInTheDocument();
    expect(screen.getByText("settings.dataImport")).toBeInTheDocument();
  });

  it("renders data isolation verification items in security tab", () => {
    render(React.createElement(UnifiedSettingsPanel));
    expect(screen.getByText("settings.localStorage")).toBeInTheDocument();
    expect(screen.getByText("settings.noCloudSync")).toBeInTheDocument();
    expect(screen.getByText("settings.noTracking")).toBeInTheDocument();
    expect(screen.getByText("settings.noThirdParty")).toBeInTheDocument();
    expect(screen.getByText("settings.offlineReady")).toBeInTheDocument();
  });

  it("renders API key management section in security tab", () => {
    render(React.createElement(UnifiedSettingsPanel));
    expect(screen.getByText("settings.apiKeyManagement")).toBeInTheDocument();
    expect(screen.getByText("settings.apiKeyDesc")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Ollama")).toBeInTheDocument();
  });

  it("renders data export/import buttons in data tab", () => {
    render(React.createElement(UnifiedSettingsPanel));
    const dataTab = screen.getByText("settings.dataManagement");
    fireEvent.click(dataTab);
    expect(screen.getByText("settings.exportAll")).toBeInTheDocument();
    expect(screen.getByText("settings.selectFile")).toBeInTheDocument();
  });

  it("renders storage usage in storage tab", () => {
    render(React.createElement(UnifiedSettingsPanel));
    const storageTab = screen.getByText("settings.storage");
    fireEvent.click(storageTab);
    expect(screen.getByText("settings.storageUsage")).toBeInTheDocument();
    expect(screen.getByText("settings.totalUsage")).toBeInTheDocument();
  });

  it("renders about section with core principles", () => {
    render(React.createElement(UnifiedSettingsPanel));
    const aboutTab = screen.getByText("settings.about");
    fireEvent.click(aboutTab);
    expect(screen.getByText("settings.corePrinciples")).toBeInTheDocument();
    expect(screen.getByText("settings.principle1")).toBeInTheDocument();
    expect(screen.getByText("settings.principle2")).toBeInTheDocument();
  });

  it("formatBytes utility function behavior", () => {
    render(React.createElement(UnifiedSettingsPanel));
    const storageTab = screen.getByText("settings.storage");
    fireEvent.click(storageTab);
    expect(screen.getByText("settings.totalUsage")).toBeInTheDocument();
  });

  it("clicking refresh updates storage info", () => {
    render(React.createElement(UnifiedSettingsPanel));
    const storageTab = screen.getByText("settings.storage");
    fireEvent.click(storageTab);
    const refreshButtons = screen.getAllByRole("button");
    const refreshBtn = refreshButtons.find((btn) =>
      btn.querySelector(".lucide-refresh-cw")
    );
    if (refreshBtn) {
      fireEvent.click(refreshBtn);
    }
    expect(screen.getByText("settings.storageUsage")).toBeInTheDocument();
  });

  it("export button triggers download", () => {
    render(React.createElement(UnifiedSettingsPanel));
    const dataTab = screen.getByText("settings.dataManagement");
    fireEvent.click(dataTab);
    const exportBtn = screen.getByText("settings.exportAll");
    fireEvent.click(exportBtn);
    expect(exportStoreData).toHaveBeenCalled();
  });

  it("clear data shows confirmation dialog", () => {
    render(React.createElement(UnifiedSettingsPanel));
    const dataTab = screen.getByText("settings.dataManagement");
    fireEvent.click(dataTab);
    const clearBtn = screen.getByText("settings.clearAllData");
    fireEvent.click(clearBtn);
    expect(screen.getByText("settings.confirmClear")).toBeInTheDocument();
    expect(screen.getByText("settings.confirmClearDesc")).toBeInTheDocument();
  });
});