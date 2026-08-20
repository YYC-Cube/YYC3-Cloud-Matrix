/**
 * @file: useWebSocketData.test.tsx
 * @description: useWebSocketData Hook 完整测试套件
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-01
 * @status: active
 * @tags: [hook],[test]
 */

// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocketData } from "../hooks/useWebSocketData";

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static CONNECTING = 0;
  url = "";
  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) { this.onclose(); }
  }

  send(_data: string) { }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) { this.onopen(); }
  }

  simulateMessage(data: object) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }

  simulateError() {
    if (this.onerror) { this.onerror(); }
  }
}

let mockWSInstance: MockWebSocket | null = null;

vi.mock("../lib/api-config", () => ({
  getAPIConfig: () => ({
    wsEndpoint: "ws://localhost:3113/ws",
  }),
}));

describe("useWebSocketData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockWSInstance = null;
    (globalThis as any).WebSocket = class extends MockWebSocket {
      constructor(url: string) {
        super(url);
        mockWSInstance = this;
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("初始化", () => {
    it("should initialize with connecting state", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.connectionState).toBe("connecting");
    });

    it("should provide initial nodes from nodeStore", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.nodes).toBeDefined();
      expect(Array.isArray(result.current.nodes)).toBe(true);
      expect(result.current.nodes.length).toBeGreaterThan(0);
    });

    it("should provide initial liveQPS", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.liveQPS).toBe(3842);
    });

    it("should provide initial liveLatency", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.liveLatency).toBe(48);
    });

    it("should provide initial activeNodes", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.activeNodes).toBe("7/8");
    });

    it("should provide initial gpuUtil", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.gpuUtil).toBe("82.4%");
    });

    it("should provide initial tokenThroughput", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.tokenThroughput).toBe("138K/s");
    });

    it("should provide initial storageUsed", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.storageUsed).toBe("12.8TB");
    });

    it("should provide initial qpsTrend", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.qpsTrend).toBe("+12.3%");
    });

    it("should provide initial latencyTrend", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.latencyTrend).toBe("-5.2%");
    });

    it("should provide empty alerts array", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.alerts).toEqual([]);
    });

    it("should provide empty throughputHistory", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.throughputHistory).toEqual([]);
    });

    it("should provide reconnectCount as 0", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(result.current.reconnectCount).toBe(0);
    });

    it("should provide lastSyncTime string", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(typeof result.current.lastSyncTime).toBe("string");
      expect(result.current.lastSyncTime.length).toBeGreaterThan(0);
    });
  });

  describe("模拟数据 (Simulation)", () => {
    it("should run simulation after WS timeout fallback", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.throughputHistory.length).toBeGreaterThan(0);
    });

    it("should update nodes during simulation", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.nodes.length).toBeGreaterThan(0);
    });

    it("should update liveQPS during simulation", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.liveQPS).toBeDefined();
      expect(typeof result.current.liveQPS).toBe("number");
    });

    it("should update liveLatency during simulation", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.liveLatency).toBeDefined();
      expect(typeof result.current.liveLatency).toBe("number");
    });

    it("should update activeNodes during simulation", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.activeNodes).toMatch(/^\d+\/\d+$/);
    });

    it("should update gpuUtil during simulation", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.gpuUtil).toMatch(/^\d+\.\d+%$/);
    });

    it("should update tokenThroughput during simulation", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.tokenThroughput).toMatch(/^\d+K\/s$/);
    });

    it("should update qpsTrend during simulation", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.qpsTrend).toMatch(/^[+-]\d+\.\d+%$/);
    });

    it("should update latencyTrend during simulation", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.latencyTrend).toMatch(/^[+-]\d+\.\d+%$/);
    });

    it("should cap throughputHistory at 60 entries", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
        for (let i = 0; i < 65; i++) {
          vi.advanceTimersByTime(2100);
        }
      });

      expect(result.current.throughputHistory.length).toBeLessThanOrEqual(60);
    });

    it("should update lastSyncTime during simulation", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.lastSyncTime).toBeDefined();
    });
  });

  describe("WebSocket 连接", () => {
    it("should attempt WebSocket connection on mount", () => {
      renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(mockWSInstance).not.toBeNull();
    });

    it("should set connected state when WebSocket opens", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
      });

      expect(result.current.connectionState).toBe("connected");
    });

    it("should reset reconnectCount on successful connection", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
      });

      expect(result.current.reconnectCount).toBe(0);
    });

    it("should stop simulation when WebSocket connects", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        vi.advanceTimersByTime(2100);
      });

      expect(result.current.connectionState).toBe("connected");
    });

    it("should fallback to simulated when WS connect times out", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(result.current.connectionState).toBe("simulated");
    });

    it("should schedule reconnect after WebSocket close", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.close();
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.reconnectCount).toBe(1);
    });

    it("should handle WebSocket constructor error", () => {
      (globalThis as any).WebSocket = class {
        constructor() {
          throw new Error("WebSocket not supported");
        }
      };

      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current.connectionState).toBe("simulated");
    });

    it("should handle WebSocket onerror", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateError();
      });

      expect(result.current.connectionState).toBe("simulated");
    });
  });

  describe("WebSocket 消息处理", () => {
    it("should handle qps_update message", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "qps_update",
          payload: { qps: 5000, trend: "+30.2%" },
        });
      });

      expect(result.current.liveQPS).toBe(5000);
      expect(result.current.qpsTrend).toBe("+30.2%");
    });

    it("should handle latency_update message", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "latency_update",
          payload: { latency: 120, trend: "+150.0%" },
        });
      });

      expect(result.current.liveLatency).toBe(120);
      expect(result.current.latencyTrend).toBe("+150.0%");
    });

    it("should handle node_status message", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "node_status",
          payload: [
            { id: "GPU-A100-01", status: "active", gpu: 95, mem: 80, temp: 70, model: "Test", tasks: 50 },
          ],
        });
      });

      // node_status merges with existing nodes via DataBus (smart merge)
      // So the node count stays the same (or grows if new nodes are added)
      // Verify that the specific node was updated
      const updatedNode = result.current.nodes.find((n) => n.id === "GPU-A100-01");
      expect(updatedNode).toBeDefined();
      expect(updatedNode!.id).toBe("GPU-A100-01");
      expect(updatedNode!.gpu).toBe(95);
    });

    it("should handle alert message", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "alert",
          payload: { id: "a1", severity: "critical", message: "Test Alert", timestamp: Date.now() },
        });
      });

      expect(result.current.alerts.length).toBe(1);
    });

    it("should cap alerts at 100 entries", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        for (let i = 0; i < 105; i++) {
          mockWSInstance?.simulateMessage({
            type: "alert",
            payload: { id: `a${i}`, severity: "info", message: `Alert ${i}`, timestamp: Date.now() },
          });
        }
      });

      expect(result.current.alerts.length).toBeLessThanOrEqual(100);
    });

    it("should handle throughput_history message", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "throughput_history",
          payload: [
            { time: "10:00:00", qps: 4000, latency: 45, tokens: 140000 },
            { time: "10:00:01", qps: 4100, latency: 47, tokens: 142000 },
          ],
        });
      });

      expect(result.current.throughputHistory.length).toBe(2);
    });

    it("should handle system_stats message", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "system_stats",
          payload: {
            activeNodes: "8/8",
            gpuUtil: "90.5%",
            tokenThroughput: "150K/s",
          },
        });
      });

      expect(result.current.activeNodes).toBe("8/8");
      expect(result.current.gpuUtil).toBe("90.5%");
      expect(result.current.tokenThroughput).toBe("150K/s");
    });

    it("should handle heartbeat_ack message without error", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "heartbeat_ack",
          payload: {},
        });
      });

      expect(result.current.connectionState).toBe("connected");
    });

    it("should handle invalid JSON message gracefully", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        if (mockWSInstance?.onmessage) {
          mockWSInstance.onmessage({ data: "invalid json" });
        }
      });

      expect(result.current.connectionState).toBe("connected");
    });

    it("should handle unknown message type gracefully", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "unknown_type",
          payload: {},
        });
      });

      expect(result.current.connectionState).toBe("connected");
    });

    it("should update lastSyncTime on message", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "heartbeat_ack",
          payload: {},
        });
      });

      expect(result.current.lastSyncTime).toBeDefined();
    });
  });

  describe("公开 API", () => {
    it("should provide manualReconnect function", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(typeof result.current.manualReconnect).toBe("function");
    });

    it("should provide clearAlerts function", () => {
      const { result } = renderHook(() => useWebSocketData());
      expect(typeof result.current.clearAlerts).toBe("function");
    });

    it("should clear alerts when clearAlerts called", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        mockWSInstance?.simulateMessage({
          type: "alert",
          payload: { id: "a1", severity: "critical", message: "Test", timestamp: Date.now() },
        });
      });

      expect(result.current.alerts.length).toBe(1);

      act(() => {
        result.current.clearAlerts();
      });

      expect(result.current.alerts).toEqual([]);
    });

    it("should trigger reconnection on manualReconnect", () => {
      const { result } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
        result.current.manualReconnect();
      });

      expect(["reconnecting", "connecting"]).toContain(result.current.connectionState);
    });
  });

  describe("清理", () => {
    it("should clean up on unmount", () => {
      const { unmount } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(() => unmount()).not.toThrow();
    });

    it("should close WebSocket on unmount", () => {
      const { unmount } = renderHook(() => useWebSocketData());

      act(() => {
        vi.advanceTimersByTime(0);
        mockWSInstance?.simulateOpen();
      });

      expect(mockWSInstance?.readyState).toBe(MockWebSocket.OPEN);

      act(() => {
        unmount();
      });

      expect(mockWSInstance?.readyState).toBe(MockWebSocket.CLOSED);
    });
  });
});
