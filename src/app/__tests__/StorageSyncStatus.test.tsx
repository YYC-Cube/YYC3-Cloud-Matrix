/**
 * @file: StorageSyncStatus.test.tsx
 * @description: StorageSyncStatus 组件单元测试
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
import { StorageSyncStatus } from "../modules/admin/StorageSyncStatus";
import { storageManager } from "../services/storageManager";

const statusState = {
  connected: true,
  syncing: false,
  lastSync: Date.now() - 60000 as number | null,
  pendingChanges: 0,
};

const configState = {
  type: "localStorage" as const,
  syncInterval: 30,
  autoSync: true,
  offlineMode: false,
  conflictResolution: "local" as const,
};

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params) {
        return key.replace(/\{(\w+)\}/g, (_, k) => params[k] || "");
      }
      return key;
    },
  })),
}));

vi.mock("../services/storageManager", () => ({
  storageManager: {
    getStatus: () => ({ ...statusState }),
    getConfig: () => ({ ...configState }),
    onEvent: vi.fn(),
    offEvent: vi.fn(),
    triggerSync: vi.fn(() => Promise.resolve()),
  },
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
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("h3", { className, "data-testid": "card-title" }, children),
}));

vi.mock("../components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => React.createElement("button", { onClick, disabled, className, "data-testid": "button" }, children),
}));

vi.mock("../components/ui/badge", () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) =>
    React.createElement("span", { "data-testid": "badge", "data-variant": variant }, children),
}));

vi.mock("../components/ui/progress", () => ({
  Progress: ({ value, className }: { value: number; className?: string }) =>
    React.createElement("div", { className, "data-testid": "progress", "aria-valuenow": value }),
}));

vi.mock("../components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) =>
    React.createElement("div", { "data-testid": "tabs", "data-default": defaultValue }, children),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement("div", { "data-testid": "tabs-content", "data-value": value }, children),
  TabsList: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { className, "data-testid": "tabs-list" }, children),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement("button", { "data-testid": "tabs-trigger", "data-value": value }, children),
}));

vi.mock("../components/ui/alert", () => ({
  Alert: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "alert" }, children),
  AlertDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "alert-description" }, children),
  AlertTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "alert-title" }, children),
}));

describe("StorageSyncStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(statusState, {
      connected: true,
      syncing: false,
      lastSync: Date.now() - 60000,
      pendingChanges: 0,
    });
    Object.assign(configState, {
      type: "localStorage",
      syncInterval: 30,
      autoSync: true,
      offlineMode: false,
      conflictResolution: "local",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders status overview", () => {
    render(React.createElement(StorageSyncStatus));
    expect(screen.getByText("storage.sync.status")).toBeInTheDocument();
    expect(screen.getByText("storage.sync.statusDescription")).toBeInTheDocument();
  });

  it("renders connected status", () => {
    render(React.createElement(StorageSyncStatus));
    expect(screen.getByText("storage.status.synced")).toBeInTheDocument();
  });

  it("renders disconnected status", () => {
    Object.assign(statusState, {
      connected: false,
      syncing: false,
      lastSync: null,
      pendingChanges: 0,
    });
    render(React.createElement(StorageSyncStatus));
    expect(screen.getByText("storage.status.disconnected")).toBeInTheDocument();
  });

  it("renders sync button", () => {
    render(React.createElement(StorageSyncStatus));
    expect(screen.getByText("storage.sync.manual")).toBeInTheDocument();
  });

  it("renders network status indicator", () => {
    render(React.createElement(StorageSyncStatus));
    expect(screen.getByText("storage.network.online")).toBeInTheDocument();
  });

  it("renders sync history tab", () => {
    render(React.createElement(StorageSyncStatus));
    expect(screen.getByText("storage.sync.history")).toBeInTheDocument();
  });

  it("renders details tab", () => {
    render(React.createElement(StorageSyncStatus));
    expect(screen.getByText("storage.sync.details")).toBeInTheDocument();
  });

  it("shows sync progress when syncing", () => {
    Object.assign(statusState, {
      connected: true,
      syncing: true,
      lastSync: null,
      pendingChanges: 0,
    });
    render(React.createElement(StorageSyncStatus));
    expect(screen.getByText("storage.sync.inProgress")).toBeInTheDocument();
  });

  it("shows offline queue alert", () => {
    Object.assign(statusState, {
      connected: true,
      syncing: false,
      lastSync: null,
      pendingChanges: 3,
    });
    Object.assign(configState, {
      type: "localStorage",
      syncInterval: 30,
      autoSync: true,
      offlineMode: true,
      conflictResolution: "local",
    });
    // Make navigator report offline
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
    render(React.createElement(StorageSyncStatus));
    expect(screen.getByText("storage.offline.modeActive")).toBeInTheDocument();
  });

  it("shows pending changes count in details tab", () => {
    Object.assign(statusState, {
      connected: true,
      syncing: false,
      lastSync: null,
      pendingChanges: 5,
    });
    render(React.createElement(StorageSyncStatus));
    const detailsTab = screen.getByText("storage.sync.details");
    fireEvent.click(detailsTab);
    expect(screen.getByText("storage.sync.pendingChanges")).toBeInTheDocument();
  });

  it("handles empty sync history", () => {
    render(React.createElement(StorageSyncStatus));
    const historyTab = screen.getByText("storage.sync.history");
    fireEvent.click(historyTab);
    expect(screen.getByText("storage.sync.noHistory")).toBeInTheDocument();
  });

  it("clicking sync button triggers sync", () => {
    render(React.createElement(StorageSyncStatus));
    const syncBtn = screen.getByText("storage.sync.manual");
    fireEvent.click(syncBtn);
    expect(storageManager.triggerSync).toHaveBeenCalled();
  });
});