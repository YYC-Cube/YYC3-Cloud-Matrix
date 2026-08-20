/**
 * @file: useWebSocketData.ts
 * @description: WebSocket 实时数据推送 Hook · 管理连接、消息路由、断线降级
 * @author: YanYuCloudCube Team
 * @version: v3.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-30
 * @status: active
 * @tags: [hook],[websocket],[realtime]
 *
 * @brief: WebSocket 实时数据推送管理（已接入 DataBus 统一数据层）
 *
 * @details:
 * - WebSocket 连接管理（生命周期、自动重连、心跳）
 * - 消息类型路由（qps_update / latency_update / node_status / alert）
 * - ★ 节点数据通过 DataBus.mergeNodeData() 合并后写入 useNodeSlice
 * - ★ 用户编辑的字段在 WS 推送时不会被覆盖（smartMerge 策略）
 * - ★ v3.0: 状态机修复 — WS优先，失败后明确降级到模拟模式
 * - ★ v3.0: isSimulated 标志位 — UI 可据此显示"模拟数据"标识
 * - 断线降级：自动切换本地模拟数据
 *
 * @dependencies: React, WebSocket API, DataBus, useNodeSlice
 * @exports: useWebSocketData, WebSocketContext
 */

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  AlertData,
  ConnectionState,
  NodeData,
  ThroughputPoint,
  WSMessage,
  WebSocketDataState,
} from "../types";

import { getAPIConfig } from "../lib/api-config";
import { dataBus } from "../lib/data-bus";
import { useNodeSlice } from "../store/slices/node-slice";

// ============================================================
// Simulated Data Generator — 从 useNodeSlice 读取初始数据
// ============================================================

function jitter(base: number, range: number): number {
  return Math.max(0, base + (Math.random() - 0.5) * range * 2);
}

function generateSimulatedNodes(baseNodes: NodeData[]): NodeData[] {
  return baseNodes.map((n) => ({
    ...n,
    gpu: n.status === "inactive" ? 0 : Math.min(100, Math.round(jitter(n.gpu, 5))),
    mem: n.status === "inactive" ? n.mem : Math.min(100, Math.round(jitter(n.mem, 3))),
    temp: n.status === "inactive" ? n.temp : Math.round(jitter(n.temp, 2)),
    tasks: n.status === "inactive" ? 0 : Math.max(0, Math.round(jitter(n.tasks, 10))),
  }));
}

let throughputCounter = 0;

function generateThroughputPoint(): ThroughputPoint {
  const now = new Date();
  const hms = now.toLocaleTimeString("zh-CN", { hour12: false });
  throughputCounter += 1;
  return {
    time: `${hms}.${String(throughputCounter % 1000).padStart(3, "0")}`,
    qps: Math.round(jitter(3800, 400)),
    latency: Math.round(jitter(48, 8)),
    tokens: Math.round(jitter(138000, 15000)),
  };
}

// ============================================================
// Hook
// ============================================================

const MAX_THROUGHPUT_HISTORY = 60;
const SIMULATE_INTERVAL_MS = 2000;
const RECONNECT_DELAY_MS = 5000;

export function useWebSocketData(): WebSocketDataState {
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [reconnectCount, setReconnectCount] = useState(0);
  const [liveQPS, setLiveQPS] = useState(3842);
  const [qpsTrend, setQpsTrend] = useState("+12.3%");
  const [liveLatency, setLiveLatency] = useState(48);
  const [latencyTrend, setLatencyTrend] = useState("-5.2%");
  const [activeNodes, setActiveNodes] = useState("7/8");
  const [gpuUtil, setGpuUtil] = useState("82.4%");
  const [tokenThroughput, setTokenThroughput] = useState("138K/s");
  const [storageUsed] = useState("12.8TB");
  const [throughputHistory, setThroughputHistory] = useState<ThroughputPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState(
    new Date().toLocaleString("zh-CN", { hour12: false })
  );

  // ★ 核心：接入统一节点 Store — 节点数据从此处获取
  const { nodes: sliceNodes, mergeFromWS } = useNodeSlice();

  const wsRef = useRef<WebSocket | null>(null);
  const simulateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectWSRef = useRef<(() => void) | null>(null);

  // ----- simulated data updater -----
  const runSimulation = useCallback(() => {
    const baseNodes = useNodeSlice.getState().nodes;
    const newNodes = generateSimulatedNodes(baseNodes);

    // ★ 关键改动：模拟数据也通过 DataBus 合并，保留用户编辑
    mergeFromWS(newNodes);

    const active = newNodes.filter((n) => n.status !== "inactive");
    setActiveNodes(`${active.length}/${newNodes.length}`);

    const avgGpu = active.reduce((s, n) => s + n.gpu, 0) / (active.length || 1);
    setGpuUtil(`${avgGpu.toFixed(1)}%`);

    const newQps = Math.round(jitter(3800, 400));
    setLiveQPS(newQps);
    setQpsTrend(newQps > 3800 ? `+${((newQps / 3800 - 1) * 100).toFixed(1)}%` : `-${((1 - newQps / 3800) * 100).toFixed(1)}%`);

    const newLatency = Math.round(jitter(48, 8));
    setLiveLatency(newLatency);
    setLatencyTrend(newLatency < 48 ? `-${((1 - newLatency / 48) * 100).toFixed(1)}%` : `+${((newLatency / 48 - 1) * 100).toFixed(1)}%`);

    const tp = Math.round(jitter(138, 15));
    setTokenThroughput(`${tp}K/s`);

    const point = generateThroughputPoint();
    setThroughputHistory((prev) => {
      const next = [...prev, point];
      return next.length > MAX_THROUGHPUT_HISTORY ? next.slice(-MAX_THROUGHPUT_HISTORY) : next;
    });

    setLastSyncTime(new Date().toLocaleString("zh-CN", { hour12: false }));
  }, [mergeFromWS]);

  // ----- lifecycle -----
  // ★ v3.0 修复：先尝试WS连接，仅在失败后启动模拟器
  // 不再"启动即双跑"，消除模拟数据污染真实数据的竞争窗口
  useEffect(() => {
    let wsConnected = false;
    let cancelled = false;

    const startSimulation = () => {
      if (cancelled) { return; }
      if (simulateTimerRef.current) { return; }
      setConnectionState("simulated");
      simulateTimerRef.current = setInterval(runSimulation, SIMULATE_INTERVAL_MS);
      runSimulation();
    };

    const tryConnectWS = () => {
      if (cancelled) { return; }
      const wsUrl = getAPIConfig().wsEndpoint;
      setConnectionState("connecting");

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const connectTimeout = setTimeout(() => {
          if (!wsConnected && ws.readyState !== WebSocket.OPEN) {
            ws.close();
          }
        }, 8000);

        ws.onopen = () => {
          clearTimeout(connectTimeout);
          if (cancelled) { ws.close(); return; }
          wsConnected = true;
          setConnectionState("connected");
          setReconnectCount(0);
          if (simulateTimerRef.current) {
            clearInterval(simulateTimerRef.current);
            simulateTimerRef.current = null;
          }
          dataBus.registerWSSender((msg) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(msg));
              return true;
            }
            return false;
          });
        };

        ws.onmessage = (event) => {
          try {
            const msg: WSMessage = JSON.parse(event.data);
            dataBus.ingestWSMessage(msg);
            switch (msg.type) {
              case "qps_update":
                setLiveQPS(msg.payload.qps);
                setQpsTrend(msg.payload.trend);
                break;
              case "latency_update":
                setLiveLatency(msg.payload.latency);
                setLatencyTrend(msg.payload.trend);
                break;
              case "node_status":
                mergeFromWS(msg.payload as NodeData[]);
                break;
              case "alert":
                setAlerts((prev) => [msg.payload, ...prev].slice(0, 100));
                break;
              case "throughput_history":
                setThroughputHistory(msg.payload.slice(-MAX_THROUGHPUT_HISTORY));
                break;
              case "system_stats":
                setActiveNodes(msg.payload.activeNodes);
                setGpuUtil(msg.payload.gpuUtil);
                setTokenThroughput(msg.payload.tokenThroughput);
                break;
              case "heartbeat_ack":
                break;
            }
            setLastSyncTime(new Date().toLocaleString("zh-CN", { hour12: false }));
          } catch {
            // silently ignore parse errors for non-critical messages
          }
        };

        ws.onclose = () => {
          clearTimeout(connectTimeout);
          wsRef.current = null;
          dataBus.unregisterWSSender();
          if (cancelled) { return; }

          if (!wsConnected) {
            startSimulation();
          }

          reconnectTimerRef.current = setTimeout(() => {
            if (cancelled) { return; }
            setReconnectCount((c) => c + 1);
            wsConnected = false;
            tryConnectWS();
          }, RECONNECT_DELAY_MS);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        startSimulation();
      }
    };

    connectWSRef.current = tryConnectWS;
    tryConnectWS();

    return () => {
      cancelled = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (simulateTimerRef.current) {
        clearInterval(simulateTimerRef.current);
        simulateTimerRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [mergeFromWS, runSimulation]);

  // ----- public API -----
  const manualReconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    setConnectionState("reconnecting");
    connectWSRef.current?.();
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    connectionState,
    isSimulated: connectionState === "simulated",
    reconnectCount,
    lastSyncTime,
    liveQPS,
    qpsTrend,
    liveLatency,
    latencyTrend,
    activeNodes,
    gpuUtil,
    tokenThroughput,
    storageUsed,

    // ★ 节点数据从统一 Slice 返回 — 所有消费者拿到同一份
    nodes: sliceNodes,

    throughputHistory,
    alerts,
    manualReconnect,
    clearAlerts,
  };
}
