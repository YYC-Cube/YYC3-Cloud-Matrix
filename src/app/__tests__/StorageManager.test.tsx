/**
 * file: StorageManager.test.tsx
 * description: StorageManager 组件测试 · 存储管理器标题渲染 / 子组件挂载 / 配置变更 / 保存同步双分支（成功+异常）
 * author: YanYuCloudCube Team
 * version: v1.0.0
 * created: 2026-08-19
 * updated: 2026-08-19
 * status: active
 * tags: [component],[test],[admin],[storage],[config]
 *
 * brief:
 *  - 对齐文档：docs/tests/admin-unit-tests.md §3
 *  - 严格按 StorageManager.tsx 72 行实际源码结构编写断言，不臆测不存在的 UI
 *  - 覆盖 PageHeader 标题描述、StorageSyncStatus/StorageConfigPanel 子组件挂载、
 *    onConfigChange 错误清除、handleSave 成功 / 异常分支、isSaving 加载态传递
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { StorageConfig } from "../types/storage";

// ──────────────────────────────────────────────────────────────────
// Mock: storageManager service
// ──────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: StorageConfig = {
  type: "localStorage",
  syncInterval: 30,
  autoSync: true,
  offlineMode: true,
  conflictResolution: "local",
};

let mockConfig: StorageConfig = { ...DEFAULT_CONFIG };
let mockSaveConfig = vi.fn((cfg: StorageConfig) => { mockConfig = cfg; });
let mockTriggerSync = vi.fn(async () => {});
let mockGetConfig = vi.fn(() => mockConfig);

vi.mock("../services/storageManager", () => ({
  storageManager: {
    getConfig: () => mockGetConfig(),
    saveConfig: (cfg: StorageConfig) => mockSaveConfig(cfg),
    triggerSync: () => mockTriggerSync(),
    getStatus: () => ({
      connected: true,
      syncing: false,
      lastSync: null,
      pendingChanges: 0,
    }),
    onEvent: vi.fn(),
    offEvent: vi.fn(),
  },
}));

// ──────────────────────────────────────────────────────────────────
// Mock: PageHeader
// ──────────────────────────────────────────────────────────────────

vi.mock("../components/ui/page-header", () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) =>
    React.createElement("div", { "data-testid": "yyc3-page-header" },
      React.createElement("h1", { "data-testid": "yyc3-page-title" }, title),
      React.createElement("p", { "data-testid": "yyc3-page-desc" }, description),
    ),
}));

// ──────────────────────────────────────────────────────────────────
// Mock: StorageSyncStatus
// ──────────────────────────────────────────────────────────────────

vi.mock("../modules/admin/StorageSyncStatus", () => ({
  StorageSyncStatus: (_props?: { showDetails?: boolean }) =>
    React.createElement("div", { "data-testid": "yyc3-storage-sync-status" }, "StorageSyncStatus"),
}));

// ──────────────────────────────────────────────────────────────────
// Mock: StorageConfigPanel
//   暴露通过 data-testid 模拟配置变更 + 点击保存
// ──────────────────────────────────────────────────────────────────

type PanelSpy = {
  lastConfig: StorageConfig | null;
  lastIsSaving: boolean;
  lastError: string | undefined;
  fireConfigChange: (newCfg: StorageConfig) => void;
  fireSave: () => void;
};

let panelSpy: PanelSpy = {
  lastConfig: null,
  lastIsSaving: false,
  lastError: undefined,
  fireConfigChange: () => {},
  fireSave: () => {},
};

vi.mock("../modules/admin/StorageConfigPanel", () => ({
  StorageConfigPanel: ({
    config,
    onConfigChange,
    onSave,
    isSaving,
    error,
  }: {
    config: StorageConfig;
    onConfigChange: (c: StorageConfig) => void;
    onSave: () => void;
    isSaving?: boolean;
    error?: string;
  }) => {
    React.useEffect(() => {
      panelSpy.lastConfig = config;
      panelSpy.lastIsSaving = !!isSaving;
      panelSpy.lastError = error;
    }, [config, isSaving, error]);

    panelSpy.fireConfigChange = onConfigChange;
    panelSpy.fireSave = onSave;

    return React.createElement("div", { "data-testid": "yyc3-storage-config-panel" },
      React.createElement("button", {
        "data-testid": "yyc3-panel-save-btn",
        onClick: () => onSave(),
      }, isSaving ? "保存中..." : "保存配置"),
      error && React.createElement("p", { "data-testid": "yyc3-panel-error" }, error),
    );
  },
}));

// ──────────────────────────────────────────────────────────────────
// Mock: useI18n（按组件实际调用的 t key 填充中文 map）
// ──────────────────────────────────────────────────────────────────

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (k: string, _vars?: Record<string, string | number>) => {
      const map: Record<string, string> = {
        "storage.manager.title": "存储管理中心",
        "storage.manager.description": "配置存储策略、同步间隔与离线模式",
        "storage.config.title": "存储配置",
        "storage.config.description": "选择存储类型并设置同步策略",
        "storage.config.storageType": "存储类型",
        "storage.config.selectStorageType": "请选择存储类型",
        "storage.config.localStorage": "本地存储（localStorage）",
        "storage.config.database": "远程数据库",
        "storage.config.databaseConfig": "数据库连接配置",
        "storage.config.syncSettings": "同步设置",
        "storage.config.syncInterval": "同步间隔",
        "storage.config.autoSync": "自动同步",
        "storage.config.offlineMode": "离线模式",
        "storage.config.conflictResolution": "冲突解决策略",
        "storage.config.selectConflictResolution": "请选择冲突解决策略",
        "storage.config.localWins": "本地优先",
        "storage.config.remoteWins": "远程优先",
        "storage.config.merge": "自动合并",
        "storage.sync.status": "同步状态",
        "storage.sync.statusDescription": "查看当前存储连接与同步历史",
        "storage.sync.completed": "同步完成",
        "storage.sync.failed": "同步失败",
        "storage.network.online": "在线",
        "storage.network.offline": "离线",
        "storage.offline.operationAdded": "离线操作已加入队列",
        "storage.offline.queueProcessed": "离线队列已处理完成",
        "storage.status.disconnected": "未连接",
        "storage.status.syncing": "同步中",
        "storage.status.synced": "已同步",
        "storage.status.ready": "就绪",
        "storage.sync.manual": "立即同步",
        "storage.sync.inProgress": "同步进行中",
        "storage.sync.noHistory": "暂无同步记录",
        "storage.sync.history": "同步历史",
        "storage.sync.details": "详细信息",
        "storage.sync.pendingChanges": "待同步变更",
        "storage.sync.storageType": "存储类型",
        "storage.sync.syncInterval": "同步间隔",
        "storage.sync.autoSync": "自动同步",
        "storage.sync.offlineMode": "离线模式",
        "storage.offline.modeActive": "离线模式已启用",
        "storage.offline.pendingChanges": "当前有 {count} 条变更待同步",
        "storage.offline.processingQueue": "正在处理离线队列",
        "storage.offline.processingDescription": "正在处理 {count} 条离线操作",
        "common.save": "保存配置",
        "common.saving": "保存中...",
        "common.enabled": "已启用",
        "common.disabled": "已禁用",
      };
      return map[k] ?? k;
    },
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

import { StorageManager } from "../modules/admin/StorageManager";

// ──────────────────────────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────────────────────────

function resetPanelSpy() {
  panelSpy = {
    lastConfig: null,
    lastIsSaving: false,
    lastError: undefined,
    fireConfigChange: () => {},
    fireSave: () => {},
  };
}

// ──────────────────────────────────────────────────────────────────
// Test Suite
// ──────────────────────────────────────────────────────────────────

describe("StorageManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mockConfig = { ...DEFAULT_CONFIG };
    mockGetConfig = vi.fn(() => mockConfig);
    mockSaveConfig = vi.fn((cfg: StorageConfig) => { mockConfig = cfg; });
    mockTriggerSync = vi.fn(async () => {});
    resetPanelSpy();
  });

  afterEach(() => {
    cleanup();
  });

  // =================================================================
  describe("基础渲染", () => {
    it("(TC01) 应渲染 PageHeader 容器与外层空间布局根节点", () => {
      render(<StorageManager />);
      expect(screen.getByTestId("yyc3-page-header")).toBeInTheDocument();
    });

    it("(TC02) PageHeader title / description 应为 useI18n 中 storage.manager.* 对应中文", () => {
      render(<StorageManager />);
      expect(screen.getByTestId("yyc3-page-title").textContent).toBe("存储管理中心");
      expect(screen.getByTestId("yyc3-page-desc").textContent).toBe("配置存储策略、同步间隔与离线模式");
    });

    it("(TC03) 两个子组件均挂载：StorageSyncStatus + StorageConfigPanel", () => {
      render(<StorageManager />);
      expect(screen.getByTestId("yyc3-storage-sync-status")).toBeInTheDocument();
      expect(screen.getByTestId("yyc3-storage-config-panel")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("初始配置加载", () => {
    it("(TC04) 初始化时调用 storageManager.getConfig() 一次，并将结果传给 StorageConfigPanel", () => {
      mockConfig = {
        type: "database",
        syncInterval: 60,
        autoSync: false,
        offlineMode: false,
        conflictResolution: "merge",
      };
      render(<StorageManager />);
      expect(panelSpy.lastConfig).toMatchObject({
        type: "database",
        syncInterval: 60,
        autoSync: false,
        offlineMode: false,
        conflictResolution: "merge",
      });
    });
  });

  // =================================================================
  describe("onConfigChange 行为", () => {
    it("(TC05) StorageConfigPanel 触发 onConfigChange → 内部 config 更新，error 被清除", () => {
      render(<StorageManager />);
      const newCfg: StorageConfig = {
        type: "database",
        syncInterval: 120,
        autoSync: true,
        offlineMode: true,
        conflictResolution: "remote",
      };
      act(() => { panelSpy.fireConfigChange(newCfg); });
      expect(panelSpy.lastConfig).toMatchObject(newCfg);
      expect(panelSpy.lastError).toBeUndefined();
    });
  });

  // =================================================================
  describe("handleSave 成功分支", () => {
    it("(TC06) 点击保存 → saveConfig 被调用 + triggerSync 被调用 + 最终 isSaving=false", async () => {
      render(<StorageManager />);
      const newCfg: StorageConfig = {
        ...DEFAULT_CONFIG,
        syncInterval: 45,
      };
      act(() => { panelSpy.fireConfigChange(newCfg); });

      await act(async () => { panelSpy.fireSave(); });

      expect(mockSaveConfig).toHaveBeenCalledTimes(1);
      expect(mockSaveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ syncInterval: 45 }),
      );
      expect(mockTriggerSync).toHaveBeenCalledTimes(1);
      expect(panelSpy.lastIsSaving).toBe(false);
      expect(panelSpy.lastError).toBeUndefined();
    });
  });

  // =================================================================
  describe("handleSave 异常分支", () => {
    it("(TC07) triggerSync 抛出 Error → error 设为 message，isSaving 回退 false，不影响 saveConfig", async () => {
      mockTriggerSync = vi.fn(async () => {
        throw new Error("同步服务暂时不可用");
      });
      render(<StorageManager />);

      await act(async () => { panelSpy.fireSave(); });

      expect(mockSaveConfig).toHaveBeenCalledTimes(1);
      expect(mockTriggerSync).toHaveBeenCalledTimes(1);
      expect(panelSpy.lastIsSaving).toBe(false);
      expect(panelSpy.lastError).toBe("同步服务暂时不可用");
      expect(screen.getByTestId("yyc3-panel-error").textContent).toBe("同步服务暂时不可用");
    });

    it("(TC08) triggerSync 抛非 Error 对象（字符串） → error 转为 String()", async () => {
      mockTriggerSync = vi.fn(async () => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "SERVICE_500";
      });
      render(<StorageManager />);

      await act(async () => { panelSpy.fireSave(); });

      expect(panelSpy.lastError).toBe("SERVICE_500");
    });
  });

  // =================================================================
  describe("isSaving 加载态 + 错误清除联动", () => {
    it("(TC09) 先出错再修改配置 → onConfigChange 把先前 error 清空", async () => {
      mockTriggerSync = vi.fn(async () => {
        throw new Error("首次同步失败");
      });
      render(<StorageManager />);

      await act(async () => { panelSpy.fireSave(); });
      expect(panelSpy.lastError).toBe("首次同步失败");

      act(() => {
        panelSpy.fireConfigChange({ ...DEFAULT_CONFIG, syncInterval: 90 });
      });
      expect(panelSpy.lastError).toBeUndefined();
    });
  });
});
