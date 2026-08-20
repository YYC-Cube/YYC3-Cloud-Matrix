/**
 * @file: useModelProvider.ts
 * @description: useModelProvider — Provider slice 的 React Hook 包装
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-17
 * @status: active
 * @tags: [hook]
 *
 * @details:
 * - v2.0: 从 useState+localStorage 迁移为 useProviderSlice wrapper
 * - 所有状态管理委托给 Zustand slice
 * - 保留旧的 BUILTIN_PROVIDERS/loadProviders/saveProviders 等导出（测试兼容）
 */

import { useCallback, useMemo, useState, useEffect } from "react";
import type {
  ModelProviderDef,
  ConfiguredModel,
  OllamaModel,
} from "../types";
import { useProviderSlice, BUILTIN_PROVIDERS as SLICE_BUILTIN_PROVIDERS } from "../store/slices/provider-slice";

// ============================================================
// 兼容性导出 — 供测试和外部代码使用
// ============================================================

/** 内置服务商定义（规范来源: provider-slice.ts） */
export const BUILTIN_PROVIDERS: ModelProviderDef[] = SLICE_BUILTIN_PROVIDERS;

export const PROVIDERS_KEY = "yyc3_model_providers";
export const MODELS_KEY = "yyc3_configured_models";

/** 从 provider-slice 加载服务商（兼容旧代码/测试） */
export function loadProviders(): ModelProviderDef[] {
  try {
    const saved = useProviderSlice.getState().providers;
    const savedIds = new Set(saved.map((p) => p.id));
    const missing = BUILTIN_PROVIDERS.filter((bp) => !savedIds.has(bp.id)).map((bp) => ({ ...bp }));
    return [...saved, ...missing];
  } catch {
    return BUILTIN_PROVIDERS.map((p) => ({ ...p }));
  }
}

export function saveProviders(providers: ModelProviderDef[]) {
  useProviderSlice.setState({ providers });
}

export function loadModels(): ConfiguredModel[] {
  try {
    return useProviderSlice.getState().configuredModels;
  } catch { return []; }
}

export function saveModels(models: ConfiguredModel[]) {
  useProviderSlice.setState({ configuredModels: models });
}

/** @deprecated 请使用 useModelProvider().providers 获取动态列表 */
export const MODEL_PROVIDERS: ModelProviderDef[] = (() => {
  try { return useProviderSlice.getState().providers; } catch { return SLICE_BUILTIN_PROVIDERS; }
})();

// ============================================================
// Hook — 委托给 provider-slice
// ============================================================

export function useModelProvider() {
  const slice = useProviderSlice();

  // modalOpen 保留在 hook 内（纯 UI 状态，不需要 persist）
  const [modalOpen, setModalOpen] = useState(false);

  // 初始化时自动获取 Ollama 模型
  useEffect(() => {
    slice.fetchOllamaModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 合并可用模型列表 ──
  const availableModels = useMemo(() => {
    const models: Array<{ id: string; name: string; provider: string; isLocal: boolean }> = [];

    slice.configuredModels.forEach((cm) => {
      models.push({
        id: cm.id,
        name: `${cm.model} (${cm.providerLabel})`,
        provider: cm.providerLabel,
        isLocal: cm.providerId === "ollama",
      });
    });

    const configuredOllamaNames = new Set(
      slice.configuredModels
        .filter((cm) => cm.providerId === "ollama")
        .map((cm) => cm.model)
    );
    slice.ollamaModels.forEach((om: OllamaModel) => {
      if (!configuredOllamaNames.has(om.name)) {
        models.push({
          id: `ollama-live-${om.name}`,
          name: om.name,
          provider: "Ollama (本地)",
          isLocal: true,
        });
      }
    });

    return models;
  }, [slice.configuredModels, slice.ollamaModels]);

  // ── 统计 ──
  const stats = useMemo(() => ({
    total: slice.configuredModels.length,
    active: slice.configuredModels.filter((m) => m.status === "active").length,
    ollamaCount: slice.ollamaModels.length,
    providers: new Set(slice.configuredModels.map((m) => m.providerId)).size,
    customProviders: slice.providers.filter((p) => p.isCustom).length,
    totalProviders: slice.providers.length,
  }), [slice.configuredModels, slice.ollamaModels, slice.providers]);

  return {
    // 数据
    providers: slice.providers,
    configuredModels: slice.configuredModels,
    ollamaModels: slice.ollamaModels,
    ollamaLoading: slice.ollamaLoading,
    ollamaError: slice.ollamaError,
    stats,
    availableModels,
    activeModelId: slice.activeModelId,
    testingIds: slice.testingIds,

    // 模态框
    modalOpen,
    openModal: useCallback(() => setModalOpen(true), []),
    closeModal: useCallback(() => setModalOpen(false), []),

    // 服务商 CRUD
    addProvider: slice.addProvider,
    updateProvider: slice.updateProvider,
    removeProvider: slice.removeProvider,
    resetProvider: slice.resetProvider,
    addModelToProvider: slice.addModelToProvider,
    removeModelFromProvider: slice.removeModelFromProvider,

    // 已配置模型 CRUD
    addModel: slice.addModel,
    updateModel: slice.updateModel,
    removeModel: slice.removeModel,
    testConnection: slice.testConnection,
    testAllConnections: slice.testAllConnections,
    setActiveModel: slice.setActiveModel,
    getActiveModel: slice.getActiveModel,
    getModelsByStatus: slice.getModelsByStatus,

    // Ollama
    fetchOllamaModels: slice.fetchOllamaModels,

    // Preset
    presetModels: slice.presetModels,

    // 导入/导出
    exportConfig: slice.exportConfig,
    importConfig: slice.importConfig,
  };
}
