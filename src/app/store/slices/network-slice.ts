/**
 * @file: network-slice.ts
 * @description: network-slice.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-15
 * @status: active
 * @tags: [type]
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WifiNetwork, WifiAutoReconnectSettings } from '../../types';

const DEFAULT_NETWORKS: WifiNetwork[] = [];
const DEFAULT_AUTO_RECONNECT: WifiAutoReconnectSettings = {
  id: "wifi-ar-config",
  enabled: true,
  preferStrongestSignal: true,
  intervalSeconds: 5,
  maxRetries: 10,
  preferredSsid: "",
  lastUpdatedAt: Date.now(),
};

export interface NetworkSlice {
  networks: WifiNetwork[];
  autoReconnect: WifiAutoReconnectSettings;
  addNetwork: (net: Omit<WifiNetwork, 'id'>) => void;
  updateNetwork: (id: string, updates: Partial<WifiNetwork>) => void;
  removeNetwork: (id: string) => void;
  setConnected: (id: string) => void;
  updateAutoReconnect: (updates: Partial<WifiAutoReconnectSettings>) => void;
}

export const useNetworkSlice = create<NetworkSlice>()(
  persist(
    (set) => ({
      networks: DEFAULT_NETWORKS,
      autoReconnect: DEFAULT_AUTO_RECONNECT,
      addNetwork: (net) => set((s) => ({ networks: [...s.networks, { ...net, id: `wifi-${Date.now()}` }] })),
      updateNetwork: (id, updates) => set((s) => ({ networks: s.networks.map((n) => n.id === id ? { ...n, ...updates } : n) })),
      removeNetwork: (id) => set((s) => ({ networks: s.networks.filter((n) => n.id !== id) })),
      setConnected: (id) => set((s) => ({
        networks: s.networks.map((n) => ({ ...n, connected: n.id === id })),
        autoReconnect: { ...s.autoReconnect, lastUpdatedAt: Date.now() },
      })),
      updateAutoReconnect: (updates) => set((s) => ({ autoReconnect: { ...s.autoReconnect, ...updates, lastUpdatedAt: Date.now() } })),
    }),
    {
      name: 'yyc3-network-slice',
      partialize: (state) => ({
        networks: state.networks,
        autoReconnect: state.autoReconnect,
      }),
    }
  )
);
