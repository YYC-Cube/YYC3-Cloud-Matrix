/**
 * @file: provider-slice.ts
 * @description: Provider & ConfiguredModel Zustand slice — AI 服务商统一管理
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-17
 * @updated: 2026-04-17
 * @status: active
 * @tags: [store],[slice],[provider]
 *
 * @details:
 * - 从 useModelProvider.ts 迁移的 Zustand slice
 * - 管理 9 个内置服务商 + 自定义服务商
 * - 管理已配置模型实例 (ConfiguredModel)
 * - Ollama 自动发现 + mock fallback
 * - localStorage 持久化 + 旧键迁移
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { testAIConnection, type AIConnectionConfig } from '../../lib/connection-test-engine';
import { env } from '../../lib/env-config';
import { getOllamaTagsUrl } from '../../lib/ollama-url';
import type {
  ConfiguredModel,
  ModelProviderDef,
  ModelProviderId,
  OllamaModel,
  OllamaTagsResponse,
} from '../../types';

// ============================================================
// 内置服务商定义（规范来源）
// ============================================================

export const BUILTIN_PROVIDERS: ModelProviderDef[] = [
  {
    id: "zhipu",
    label: "Z.ai (智谱)",
    baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4",
    authType: "api-key",
    models: ["glm-4-flash", "glm-4-plus", "glm-4-air", "glm-4-airx", "glm-4-long", "glm-4v-plus", "glm-4.7", "glm-5", "glm-5-turbo", "glm-5.1"],
    requiresApiKey: true,
    isLocal: false,
    isBuiltin: true,
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    authType: "bearer",
    models: ["deepseek-chat", "deepseek-coder", "deepseek-reasoner", "deepseek-4", "deepseek-4-flash"],
    requiresApiKey: true,
    isLocal: false,
    isBuiltin: true,
  },
  {
    id: "ollama",
    label: "Ollama (本地)",
    baseUrl: "http://localhost:11434",
    authType: "none",
    models: [],
    requiresApiKey: false,
    isLocal: true,
    isBuiltin: true,
  },
];

// ============================================================
// Storage Keys
// ============================================================

const PROVIDERS_KEY = "yyc3_model_providers";
const MODELS_KEY = "yyc3_configured_models";

// ============================================================
// 迁移辅助：从旧 localStorage 键读取数据
// ============================================================

function migrateProviders(): ModelProviderDef[] {
  try {
    const raw = localStorage.getItem(PROVIDERS_KEY);
    if (raw) {
      const saved: ModelProviderDef[] = JSON.parse(raw);
      const builtinIds = new Set(BUILTIN_PROVIDERS.map((bp) => bp.id));
      const customProviders = saved.filter((p) => !builtinIds.has(p.id) && p.isCustom);
      const merged = [...BUILTIN_PROVIDERS.map((bp) => {
        const existing = saved.find((s) => s.id === bp.id);
        return existing && existing.updatedAt ? { ...bp, ...existing } : { ...bp };
      }), ...customProviders];
      return merged;
    }
  } catch { /* ignore */ }
  return BUILTIN_PROVIDERS.map((p) => ({ ...p }));
}

function migrateModels(): ConfiguredModel[] {
  try {
    const raw = localStorage.getItem(MODELS_KEY);
    if (raw) { return JSON.parse(raw); }
  } catch { /* ignore */ }
  return [];
}

// ============================================================
// Slice State & Actions
// ============================================================

export interface ProviderSlice {
  // State
  providers: ModelProviderDef[];
  configuredModels: ConfiguredModel[];
  ollamaModels: OllamaModel[];
  ollamaLoading: boolean;
  ollamaError: string | null;
  activeModelId: string | null;
  testingIds: string[];

  // Provider CRUD
  addProvider: (provider: Omit<ModelProviderDef, "id" | "isBuiltin" | "isCustom" | "createdAt">) => ModelProviderDef;
  updateProvider: (id: ModelProviderId, updates: Partial<ModelProviderDef>) => void;
  removeProvider: (id: ModelProviderId) => void;
  resetProvider: (id: ModelProviderId) => void;
  addModelToProvider: (providerId: ModelProviderId, modelName: string) => void;
  removeModelFromProvider: (providerId: ModelProviderId, modelName: string) => void;

  // Configured Model CRUD
  addModel: (providerId: ModelProviderId, model: string, apiKey: string, customBaseUrl?: string, proxyUrl?: string) => ConfiguredModel | undefined;
  updateModel: (id: string, updates: Partial<ConfiguredModel>) => void;
  removeModel: (id: string) => void;
  testConnection: (id: string) => Promise<void>;
  testAllConnections: () => Promise<void>;
  setActiveModel: (id: string | null) => void;
  getActiveModel: () => ConfiguredModel | undefined;
  getModelsByStatus: (status: ConfiguredModel["status"]) => ConfiguredModel[];

  // Ollama
  fetchOllamaModels: (baseUrl?: string) => Promise<OllamaModel[]>;

  // Preset
  presetModels: () => void;

  // Import/Export
  exportConfig: () => string;
  importConfig: (jsonStr: string) => boolean;
}

export const useProviderSlice = create<ProviderSlice>()(
  persist(
    (set, get) => ({
      // ── State ──
      providers: migrateProviders(),
      configuredModels: migrateModels(),
      ollamaModels: [],
      ollamaLoading: false,
      ollamaError: null,
      activeModelId: null,
      testingIds: [],

      // ── Provider CRUD ──

      addProvider: (input) => {
        const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newProvider: ModelProviderDef = {
          ...input,
          id,
          isBuiltin: false,
          isCustom: true,
          createdAt: Date.now(),
        };
        set((s) => ({ providers: [...s.providers, newProvider] }));
        return newProvider;
      },

      updateProvider: (id, updates) => {
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
          // 同步更新已配置模型中的 providerLabel / baseUrl
          configuredModels: updates.label || updates.baseUrl
            ? s.configuredModels.map((m) =>
              m.providerId === id
                ? { ...m, providerLabel: updates.label ?? m.providerLabel, baseUrl: updates.baseUrl ?? m.baseUrl }
                : m
            )
            : s.configuredModels,
        }));
      },

      removeProvider: (id) => {
        set((s) => ({
          providers: s.providers.filter((p) => p.id !== id),
          configuredModels: s.configuredModels.filter((m) => m.providerId !== id),
        }));
      },

      resetProvider: (id) => {
        const builtin = BUILTIN_PROVIDERS.find((p) => p.id === id);
        if (!builtin) { return; }
        set((s) => ({
          providers: s.providers.map((p) => (p.id === id ? { ...builtin, updatedAt: Date.now() } : p)),
        }));
      },

      addModelToProvider: (providerId, modelName) => {
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === providerId && !p.models.includes(modelName)
              ? { ...p, models: [...p.models, modelName], updatedAt: Date.now() }
              : p
          ),
        }));
      },

      removeModelFromProvider: (providerId, modelName) => {
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === providerId
              ? { ...p, models: p.models.filter((m) => m !== modelName), updatedAt: Date.now() }
              : p
          ),
        }));
      },

      // ── Configured Model CRUD ──

      addModel: (providerId, model, apiKey, customBaseUrl, proxyUrl) => {
        const provider = get().providers.find((p) => p.id === providerId);
        if (!provider) { return undefined; }

        const newModel: ConfiguredModel = {
          id: `${providerId}-${model}-${Date.now()}`,
          providerId,
          providerLabel: provider.label,
          model,
          apiKey,
          baseUrl: customBaseUrl || provider.baseUrl,
          proxyUrl: proxyUrl || undefined,
          createdAt: Date.now(),
          lastUsed: null,
          status: "unchecked",
        };

        set((s) => ({ configuredModels: [...s.configuredModels, newModel] }));
        return newModel;
      },

      updateModel: (id, updates) => {
        set((s) => ({
          configuredModels: s.configuredModels.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }));
      },

      removeModel: (id) => {
        set((s) => ({ configuredModels: s.configuredModels.filter((m) => m.id !== id) }));
      },

      testConnection: async (id) => {
        const model = get().configuredModels.find((m) => m.id === id);
        if (!model) { return; }

        set((s) => ({ testingIds: [...s.testingIds, id] }));

        const isLocal = model.providerId === "ollama" || model.providerLabel.toLowerCase().includes("ollama");
        const ollamaDefault = env("OLLAMA_BASE_URL") || "http://localhost:11434";
        const baseUrl = model.baseUrl || (isLocal ? ollamaDefault : "");

        try {
          const config: AIConnectionConfig = {
            providerId: model.providerId,
            providerLabel: model.providerLabel,
            baseUrl,
            authType: "bearer",
            apiKey: model.apiKey || "",
            modelId: model.id,
            modelName: model.model,
            isLocal,
            proxyUrl: model.proxyUrl,
          };

          const result = await testAIConnection(config);

          set((s) => ({
            configuredModels: s.configuredModels.map((m) => {
              if (m.id !== id) { return m; }
              return {
                ...m,
                status: result.overallStatus === "pass" || result.overallStatus === "warn" ? "active" as const : "error" as const,
                lastUsed: Date.now(),
                lastTestResult: {
                  steps: result.steps.map(st => ({ label: st.label, status: st.status, detail: st.detail, latencyMs: st.latencyMs })),
                  suggestion: result.suggestion,
                  totalLatencyMs: result.totalLatencyMs,
                  testedAt: Date.now(),
                },
              };
            }),
            testingIds: s.testingIds.filter((tid) => tid !== id),
          }));
        } catch {
          set((s) => ({
            configuredModels: s.configuredModels.map((m) => {
              if (m.id !== id) { return m; }
              return { ...m, status: "error" as const, lastUsed: Date.now() };
            }),
            testingIds: s.testingIds.filter((tid) => tid !== id),
          }));
        }
      },

      testAllConnections: async () => {
        const models = get().configuredModels;
        for (const model of models) {
          await get().testConnection(model.id);
        }
      },

      setActiveModel: (id) => {
        set({ activeModelId: id });
      },

      getActiveModel: () => {
        const { activeModelId, configuredModels } = get();
        if (!activeModelId) {
          const firstActive = configuredModels.find((m) => m.status === "active");
          return firstActive || configuredModels[0];
        }
        return configuredModels.find((m) => m.id === activeModelId);
      },

      getModelsByStatus: (status) => {
        return get().configuredModels.filter((m) => m.status === status);
      },

      // ── Ollama ──

      fetchOllamaModels: async (baseUrl) => {
        const ollamaProvider = get().providers.find((p) => p.id === "ollama");
        const url = baseUrl || ollamaProvider?.baseUrl || env("OLLAMA_BASE_URL") || "http://localhost:11434";

        set({ ollamaLoading: true, ollamaError: null });

        try {
          const tagsUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/tags` : getOllamaTagsUrl();
          const res = await fetch(tagsUrl, { method: "GET", signal: AbortSignal.timeout(5000) });
          if (!res.ok) { throw new Error(`HTTP ${res.status}`); }

          const data: OllamaTagsResponse = await res.json();
          const models = data.models || [];

          set((s) => ({
            ollamaModels: models,
            ollamaLoading: false,
            providers: models.length > 0
              ? s.providers.map((p) => p.id === "ollama" ? { ...p, models: models.map((m) => m.name), baseUrl: url } : p)
              : s.providers,
          }));

          return models;
        } catch (err: unknown) {
          // Mock fallback for development
          const mockModels: OllamaModel[] = [
            { name: "codegeex4:latest", model: "codegeex4:latest", modified_at: "2026-02-22T00:55:15.920502035+08:00", size: 5455323291, digest: "867b8e81d03898ac2289d809edb718d67a6d706d6a644bb1a922ee1607c7e5ed", details: { parent_model: "", format: "gguf", family: "chatglm", parameter_size: "9.4B", quantization_level: "Q4_0" } },
            { name: "qwen2.5:7b", model: "qwen2.5:7b", modified_at: "2026-02-22T00:28:20.785576365+08:00", size: 4683087332, digest: "845dbda0ea48ed749caafd9e6037047aa19acfcfd82e704d7ca97d631a0b697e", details: { parent_model: "", format: "gguf", family: "qwen2", parameter_size: "7.6B", quantization_level: "Q4_K_M" } },
            { name: "gpt-oss:120b-cloud", model: "gpt-oss:120b-cloud", modified_at: "2026-02-20T19:35:46.930016073+08:00", size: 384, digest: "569662207105c69bb0eca2f79a3fdf8691ad6301def477a5ec66f8e8bae237e3", details: { parent_model: "", format: "", family: "gptoss", parameter_size: "116.8B", quantization_level: "MXFP4" } },
            { name: "nomic-embed-text:latest", model: "nomic-embed-text:latest", modified_at: "2026-02-17T22:24:23.909072343+08:00", size: 274302450, digest: "0a109f422b47e3a30ba2b10eca18548e944e8a23073ee3f3e947efcf3c45e59f", details: { parent_model: "", format: "gguf", family: "nomic-bert", parameter_size: "137M", quantization_level: "F16" } },
            { name: "deepseek-v3.1:671b-cloud", model: "deepseek-v3.1:671b-cloud", modified_at: "2025-12-11T12:32:45.905310644+08:00", size: 405, digest: "d3749919e45f955731da7a7e76849e20f7ed310725d3b8b52822e811f55d0a90", details: { parent_model: "", format: "", family: "deepseek2", parameter_size: "671.0B", quantization_level: "FP8_E4M3" } },
            { name: "qwen2.5-coder:1.5b", model: "qwen2.5-coder:1.5b", modified_at: "2025-09-26T03:48:11.422863972+08:00", size: 986062089, digest: "d7372fd828518a4d38b1eb196c673c31a85f2ed302b3d1e406c4c2d1b64a0668", details: { parent_model: "", format: "gguf", family: "qwen2", parameter_size: "1.5B", quantization_level: "Q4_K_M" } },
          ];

          set((s) => ({
            ollamaModels: mockModels,
            ollamaError: `连接失败 (Mock 模式): ${(err as Error).message}`,
            ollamaLoading: false,
            providers: s.providers.map((p) =>
              p.id === "ollama" ? { ...p, models: mockModels.map((m) => m.name) } : p
            ),
          }));

          return mockModels;
        }
      },

      // ── Import/Export ──

      exportConfig: () => {
        const { providers, configuredModels } = get();
        return JSON.stringify({
          version: 2,
          exportedAt: Date.now(),
          providers: providers.filter((p) => !p.isBuiltin || p.updatedAt),
          configuredModels,
        }, null, 2);
      },

      importConfig: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr);
          if (data.providers) {
            set((s) => {
              const currentIds = new Set(s.providers.map((p) => p.id));
              const imported = data.providers.filter((p: ModelProviderDef) => !currentIds.has(p.id));
              const updated = s.providers.map((p) => {
                const match = data.providers.find((dp: ModelProviderDef) => dp.id === p.id && !p.isBuiltin);
                return match ? { ...p, ...match } : p;
              });
              return { providers: [...updated, ...imported] };
            });
          }
          if (data.configuredModels) {
            set((s) => {
              const currentIds = new Set(s.configuredModels.map((m) => m.id));
              const imported = data.configuredModels.filter((m: ConfiguredModel) => !currentIds.has(m.id));
              return { configuredModels: [...s.configuredModels, ...imported] };
            });
          }
          return true;
        } catch {
          return false;
        }
      },

      presetModels: () => {
        const existing = get().configuredModels;
        const existingKeys = new Set(existing.map((m) => `${m.providerId}:${m.model}`));
        const presets: ConfiguredModel[] = [];

        const zhipuApiKey = env("ZHIPU_API_KEY");
        const deepseekApiKey = env("DEEPSEEK_API_KEY");
        const zhipuBaseUrl = BUILTIN_PROVIDERS.find(p => p.id === "zhipu")?.baseUrl || "https://open.bigmodel.cn/api/coding/paas/v4";
        const deepseekBaseUrl = BUILTIN_PROVIDERS.find(p => p.id === "deepseek")?.baseUrl || "https://api.deepseek.com/v1";

        const zhipuModels = ["glm-4-flash", "glm-4-plus", "glm-5", "glm-5-turbo"];
        const deepseekModels = ["deepseek-chat", "deepseek-4", "deepseek-4-flash"];

        for (const model of zhipuModels) {
          if (!existingKeys.has(`zhipu:${model}`)) {
            presets.push({
              id: `preset-zhipu-${model}-${Date.now()}`,
              providerId: "zhipu",
              providerLabel: "Z.ai (智谱)",
              model,
              apiKey: zhipuApiKey,
              baseUrl: zhipuBaseUrl,
              createdAt: Date.now(),
              lastUsed: null,
              status: "unchecked",
            });
          }
        }

        for (const model of deepseekModels) {
          if (!existingKeys.has(`deepseek:${model}`)) {
            presets.push({
              id: `preset-deepseek-${model}-${Date.now()}`,
              providerId: "deepseek",
              providerLabel: "DeepSeek",
              model,
              apiKey: deepseekApiKey,
              baseUrl: deepseekBaseUrl,
              createdAt: Date.now(),
              lastUsed: null,
              status: "unchecked",
            });
          }
        }

        if (presets.length > 0) {
          set((s) => ({ configuredModels: [...s.configuredModels, ...presets] }));
        }
      },
    }),
    {
      name: 'yyc3-provider-slice',
      partialize: (state) => ({
        providers: state.providers,
        configuredModels: state.configuredModels,
        activeModelId: state.activeModelId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) { return; }
        const zhipuApiKey = env("ZHIPU_API_KEY");
        const deepseekApiKey = env("DEEPSEEK_API_KEY");
        const ollamaBaseUrl = env("OLLAMA_BASE_URL") || "http://localhost:11434";
        const zhipuBaseUrl = BUILTIN_PROVIDERS.find(p => p.id === "zhipu")?.baseUrl || "https://open.bigmodel.cn/api/coding/paas/v4";
        const deepseekBaseUrl = BUILTIN_PROVIDERS.find(p => p.id === "deepseek")?.baseUrl || "https://api.deepseek.com/v1";

        let needsUpdate = false;
        const updated = state.configuredModels.map((m) => {
          const patch: Partial<ConfiguredModel> = {};
          if (m.providerId === "zhipu" && !m.apiKey && zhipuApiKey) {
            patch.apiKey = zhipuApiKey;
            patch.baseUrl = zhipuBaseUrl;
          } else if (m.providerId === "deepseek" && !m.apiKey && deepseekApiKey) {
            patch.apiKey = deepseekApiKey;
            patch.baseUrl = deepseekBaseUrl;
          } else if (m.providerId === "ollama" && m.baseUrl !== ollamaBaseUrl) {
            patch.baseUrl = ollamaBaseUrl;
          }
          if (Object.keys(patch).length > 0) {
            needsUpdate = true;
            return { ...m, ...patch };
          }
          return m;
        });

        if (state.configuredModels.length === 0 && (zhipuApiKey || deepseekApiKey)) {
          const autoPresets: ConfiguredModel[] = [];
          const now = Date.now();
          if (zhipuApiKey) {
            for (const model of ["glm-4-flash", "glm-4-plus", "glm-5", "glm-5-turbo"]) {
              autoPresets.push({
                id: `auto-zhipu-${model}-${now}`,
                providerId: "zhipu",
                providerLabel: "Z.ai (智谱)",
                model,
                apiKey: zhipuApiKey,
                baseUrl: zhipuBaseUrl,
                createdAt: now,
                lastUsed: null,
                status: "unchecked",
              });
            }
          }
          if (deepseekApiKey) {
            for (const model of ["deepseek-chat", "deepseek-4", "deepseek-4-flash"]) {
              autoPresets.push({
                id: `auto-deepseek-${model}-${now}`,
                providerId: "deepseek",
                providerLabel: "DeepSeek",
                model,
                apiKey: deepseekApiKey,
                baseUrl: deepseekBaseUrl,
                createdAt: now,
                lastUsed: null,
                status: "unchecked",
              });
            }
          }
          state.configuredModels = autoPresets;
          needsUpdate = true;
        } else if (needsUpdate) {
          state.configuredModels = updated;
        }

        if (state.providers) {
          state.providers = migrateProviders();
          const ollama = state.providers.find(p => p.id === "ollama");
          if (ollama) {
            ollama.baseUrl = ollamaBaseUrl;
          }
          const zhipu = state.providers.find(p => p.id === "zhipu");
          if (zhipu) {
            zhipu.baseUrl = zhipuBaseUrl;
          }
        }
      },
    }
  )
);

if (typeof window !== "undefined") {
  setTimeout(() => useProviderSlice.getState().fetchOllamaModels(), 100);
}
