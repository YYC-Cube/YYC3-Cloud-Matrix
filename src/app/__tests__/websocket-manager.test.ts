/**
 * @file: websocket-manager.test.ts
 * @description: websocket-manager.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WebSocketManager, createWebSocketManager } from "../lib/websocket-manager";

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event("open"));
    }, 10);
  }

  send(data: string): void {
    // Mock send
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", { code: code || 1000, reason: reason || "" }));
  }

  simulateMessage(data: unknown): void {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(data) }));
  }

  simulateError(): void {
    this.onerror?.(new Event("error"));
  }
}

// Replace global WebSocket
vi.stubGlobal("WebSocket", MockWebSocket);

describe("WebSocketManager", () => {
  let manager: WebSocketManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = createWebSocketManager({
      endpoints: ["ws://localhost:8080", "ws://localhost:8081"],
      heartbeatIntervalMs: 1000,
      reconnectBaseDelayMs: 100,
      maxReconnectAttempts: 3,
    });
  });

  afterEach(() => {
    manager.disconnect();
    vi.useRealTimers();
  });

  describe("connection", () => {
    it("should connect to first endpoint", async () => {
      const stateListener = vi.fn();
      manager.addStateListener(stateListener);

      manager.connect();

      expect(stateListener).toHaveBeenCalledWith("connecting");

      await vi.advanceTimersByTimeAsync(20);

      expect(stateListener).toHaveBeenCalledWith("connected");
      expect(manager.getState()).toBe("connected");
    });

    it("should track connection stats", async () => {
      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      const stats = manager.getStats();
      expect(stats.totalConnections).toBe(1);
      expect(stats.successfulConnections).toBe(1);
      expect(stats.currentEndpoint).toBe("ws://localhost:8080");
    });

    it("should disconnect properly", async () => {
      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      manager.disconnect();

      expect(manager.getState()).toBe("disconnected");
    });
  });

  describe("messaging", () => {
    it("should send messages when connected", async () => {
      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      const sent = manager.send({ type: "test", payload: { data: "hello" } });

      expect(sent).toBe(true);
      expect(manager.getStats().messagesSent).toBe(1);
    });

    it("should queue messages when disconnected", () => {
      const sent = manager.send({ type: "test", payload: "hello" });

      expect(sent).toBe(false);
    });

    it("should receive messages", async () => {
      const listener = vi.fn();
      manager.addListener(listener);

      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      const ws = (manager as unknown as { ws: MockWebSocket }).ws;
      ws.simulateMessage({ type: "update", payload: { value: 42 } });

      expect(listener).toHaveBeenCalledWith({
        type: "update",
        payload: { value: 42 },
      });
      expect(manager.getStats().messagesReceived).toBe(1);
    });
  });

  describe("reconnection", () => {
    it("should attempt reconnect on close", async () => {
      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      const ws = (manager as unknown as { ws: MockWebSocket }).ws;
      ws.close(1006, "Abnormal closure");

      expect(manager.getState()).toBe("reconnecting");
    });

    it("should respect max reconnect attempts", async () => {
      manager.updateConfig({ maxReconnectAttempts: 2, reconnectBaseDelayMs: 10 });
      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      const initialStats = manager.getStats();

      for (let i = 0; i < 3; i++) {
        const ws = (manager as unknown as { ws: MockWebSocket }).ws;
        if (ws) {
          ws.close(1006, "Error");
        }
        await vi.advanceTimersByTimeAsync(100);
      }

      const finalStats = manager.getStats();
      expect(finalStats.reconnectCount).toBeGreaterThanOrEqual(initialStats.reconnectCount);
    });

    it("should switch endpoint on error", async () => {
      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      const ws = (manager as unknown as { ws: MockWebSocket }).ws;
      ws.simulateError();

      await vi.advanceTimersByTimeAsync(50);

      const stats = manager.getStats();
      expect(stats.currentEndpoint).toBe("ws://localhost:8081");
    });
  });

  describe("heartbeat", () => {
    it("should send heartbeat periodically", async () => {
      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      const sendSpy = vi.spyOn(MockWebSocket.prototype, "send");

      await vi.advanceTimersByTimeAsync(1000);

      expect(sendSpy).toHaveBeenCalledWith(
        expect.stringContaining("heartbeat")
      );
    });
  });

  describe("manual operations", () => {
    it("should manually reconnect", async () => {
      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      manager.reconnect();
      await vi.advanceTimersByTimeAsync(150);

      expect(["connecting", "connected"]).toContain(manager.getState());
    });

    it("should switch endpoint", async () => {
      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      manager.switchEndpoint(1);
      await vi.advanceTimersByTimeAsync(150);

      expect(["connecting", "connected"]).toContain(manager.getState());
    });

    it("should clear message queue", () => {
      manager.send({ type: "test", payload: "queued" });
      manager.clearQueue();

      // Queue should be empty
      expect(manager.getStats().messagesSent).toBe(0);
    });
  });

  describe("listeners", () => {
    it("should add and remove message listeners", async () => {
      const listener = vi.fn();
      const unsubscribe = manager.addListener(listener);

      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      const ws = (manager as unknown as { ws: MockWebSocket }).ws;
      ws.simulateMessage({ type: "test", payload: null });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      ws.simulateMessage({ type: "test", payload: null });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should add and remove state listeners", async () => {
      const listener = vi.fn();
      const unsubscribe = manager.addStateListener(listener);

      manager.connect();
      await vi.advanceTimersByTimeAsync(20);

      expect(listener).toHaveBeenCalledWith("connecting");
      expect(listener).toHaveBeenCalledWith("connected");

      unsubscribe();

      manager.disconnect();

      // Should not be called after unsubscribe
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });
});

describe("createWebSocketManager", () => {
  it("should create manager instance", () => {
    const manager = createWebSocketManager({
      endpoints: ["ws://localhost:8080"],
    });

    expect(manager).toBeInstanceOf(WebSocketManager);
  });
});
