/**
 * @file: useNetworkConfig.ts
 * @description: useNetworkConfig Hook
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { NetworkConfig, NetworkConfigState } from "../types";
import {
  loadNetworkConfig,
  saveNetworkConfig,
  resetNetworkConfig,
  getNetworkInterfaces,
  getLocalIP,
  generateWsUrl,
  testWebSocketConnection,
} from "../lib/network-utils";

export function useNetworkConfig() {
  const [state, setState] = useState<NetworkConfigState>({
    config: loadNetworkConfig(),
    interfaces: [],
    localIP: "127.0.0.1",
    testStatus: "idle",
    testLatency: 0,
    testError: "",
    detecting: false,
  });

  const detectNetworkRef = useRef<(() => Promise<void>) | null>(null);

  // 启动时自动检测
  useEffect(() => {
    detectNetworkRef.current?.();
  }, []);

  /** 刷新网络检测 */
  const detectNetwork = useCallback(async () => {
    setState((prev) => ({ ...prev, detecting: true }));
    try {
      const [ip, ifaces] = await Promise.all([
        getLocalIP(),
        getNetworkInterfaces(),
      ]);
      setState((prev) => ({
        ...prev,
        localIP: ip,
        interfaces: ifaces,
        detecting: false,
      }));
    } catch {
      setState((prev) => ({ ...prev, detecting: false }));
    }
  }, []);

  // Keep detectNetwork ref updated
  useEffect(() => {
    detectNetworkRef.current = detectNetwork;
  }, [detectNetwork]);

  /** 更新配置字段 */
  const updateConfig = useCallback(
    (partial: Partial<NetworkConfig>) => {
      setState((prev) => {
        const newConfig = { ...prev.config, ...partial };
        // 自动生成 wsUrl
        if (partial.serverAddress || partial.port) {
          newConfig.wsUrl = generateWsUrl(
            newConfig.serverAddress,
            newConfig.port
          );
        }
        return { ...prev, config: newConfig, testStatus: "idle" };
      });
    },
    []
  );

  /** 保存配置 */
  const save = useCallback(() => {
    saveNetworkConfig(state.config);
  }, [state.config]);

  /** 重置配置 */
  const reset = useCallback(() => {
    const defaultConfig = resetNetworkConfig();
    setState((prev) => ({
      ...prev,
      config: defaultConfig,
      testStatus: "idle",
      testError: "",
    }));
  }, []);

  /** 测试连接 */
  const testConnection = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      testStatus: "testing",
      testError: "",
      testLatency: 0,
    }));
    const result = await testWebSocketConnection(state.config.wsUrl);
    setState((prev) => ({
      ...prev,
      testStatus: result.success ? "success" : "failed",
      testLatency: result.latency,
      testError: result.error || "",
    }));
    return result;
  }, [state.config.wsUrl]);

  return {
    ...state,
    updateConfig,
    save,
    reset,
    detectNetwork,
    testConnection,
  };
}