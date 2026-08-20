/**
 * @file: model-slice.ts
 * @description: model-slice.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-15
 * @status: active
 * @tags: [type]
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeployedModel } from '../../types';

const DEFAULT_MODELS: DeployedModel[] = [
  { id: "dm-1", name: "LLaMA-70B",    version: "v2.1", size: "140GB", status: "deployed",  gpu: "GPU-A100-01" },
  { id: "dm-2", name: "Qwen-72B",     version: "v1.5", size: "145GB", status: "deployed",  gpu: "GPU-A100-02" },
  { id: "dm-3", name: "DeepSeek-V3",  version: "v3.0", size: "180GB", status: "deploying", gpu: "GPU-A100-03" },
  { id: "dm-4", name: "GLM-4",        version: "v4.0", size: "92GB",  status: "deployed",  gpu: "GPU-H100-01" },
  { id: "dm-5", name: "Mixtral-8x7B", version: "v0.1", size: "95GB",  status: "standby",   gpu: "-" },
];

export interface ModelSlice {
  models: DeployedModel[];
  addModel: (model: Omit<DeployedModel, 'id'>) => void;
  updateModel: (id: string, updates: Partial<DeployedModel>) => void;
  removeModel: (id: string) => void;
  getModelById: (id: string) => DeployedModel | undefined;
}

export const useModelSlice = create<ModelSlice>()(
  persist(
    (set, get) => ({
      models: DEFAULT_MODELS,
      addModel: (model) => set((s) => ({ models: [...s.models, { ...model, id: `dm-${Date.now()}` }] })),
      updateModel: (id, updates) => set((s) => ({ models: s.models.map((m) => m.id === id ? { ...m, ...updates } : m) })),
      removeModel: (id) => set((s) => ({ models: s.models.filter((m) => m.id !== id) })),
      getModelById: (id) => get().models.find((m) => m.id === id),
    }),
    {
      name: 'yyc3-model-slice',
      partialize: (state) => ({ models: state.models }),
    }
  )
);
