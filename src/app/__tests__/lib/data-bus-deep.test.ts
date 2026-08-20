/**
 * @file: data-bus-deep.test.ts
 * @description: data-bus-deep.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DataChangeEvent } from "../../lib/data-bus";
import { dataBus } from "../../lib/data-bus";
import type { NodeData } from "../../types";

function createMockNode(overrides?: Partial<NodeData>): NodeData {
  return {
    id: "node-1",
    status: "active",
    gpu: 50,
    mem: 32,
    temp: 45,
    model: "chatglm3-6b",
    tasks: 2,
    ...overrides,
  };
}

describe("DataBus", () => {
  beforeEach(() => {
    dataBus.disconnectWS();
  });

  describe("Subscribe & Publish", () => {
    it("should subscribe and receive events", () => {
      const handler = vi.fn();
      const unsub = dataBus.subscribe("nodes", handler);

      dataBus.publish({
        entity: "nodes",
        action: "update",
        source: "simulation",
        timestamp: Date.now(),
        payload: { id: "n1" },
      });

      expect(handler).toHaveBeenCalledTimes(1);
      unsub();
    });

    it("should unsubscribe correctly", () => {
      const handler = vi.fn();
      const unsub = dataBus.subscribe("nodes", handler);
      unsub();

      dataBus.publish({
        entity: "nodes",
        action: "update",
        source: "simulation",
        timestamp: Date.now(),
        payload: {},
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it("should support multiple subscribers", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const unsub1 = dataBus.subscribe("metrics", handler1);
      const unsub2 = dataBus.subscribe("metrics", handler2);

      dataBus.publish({
        entity: "metrics",
        action: "merge",
        source: "websocket",
        timestamp: Date.now(),
        payload: { cpu: 80 },
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });

    it("should not deliver events to wrong entity subscribers", () => {
      const handler = vi.fn();
      const unsub = dataBus.subscribe("alerts", handler);

      dataBus.publish({
        entity: "nodes",
        action: "update",
        source: "simulation",
        timestamp: Date.now(),
        payload: {},
      });

      expect(handler).not.toHaveBeenCalled();
      unsub();
    });
  });

  describe("mergeNodeData", () => {
    it("should merge nodes with ws_priority strategy", () => {
      const current = [createMockNode()];
      const incoming = [createMockNode({ gpu: 80, temp: 55 })];

      const result = dataBus.mergeNodeData(current, incoming, "websocket", "ws_priority");
      expect(result).toHaveLength(1);
      expect(result[0].gpu).toBe(80);
    });

    it("should merge nodes with shallow_replace strategy", () => {
      const current = [createMockNode()];
      const incoming = [createMockNode({ status: "inactive" })];

      const result = dataBus.mergeNodeData(current, incoming, "websocket", "shallow_replace");
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("inactive");
    });

    it("should add new nodes from incoming", () => {
      const current = [createMockNode({ id: "n1" })];
      const incoming = [createMockNode({ id: "n1" }), createMockNode({ id: "n2" })];

      const result = dataBus.mergeNodeData(current, incoming);
      expect(result).toHaveLength(2);
    });

    it("should keep existing nodes not in incoming", () => {
      const current = [createMockNode({ id: "n1" }), createMockNode({ id: "n2" })];
      const incoming = [createMockNode({ id: "n1" })];

      const result = dataBus.mergeNodeData(current, incoming);
      expect(result).toHaveLength(2);
    });

    it("should publish merge event", () => {
      const handler = vi.fn();
      const unsub = dataBus.subscribe("nodes", handler);

      dataBus.mergeNodeData([createMockNode()], [createMockNode()]);

      expect(handler).toHaveBeenCalledTimes(1);
      unsub();
    });
  });

  describe("updateUserEditNode", () => {
    it("should update specific node fields", () => {
      const nodes = [createMockNode({ id: "n1" }), createMockNode({ id: "n2" })];
      const result = dataBus.updateUserEditNode(nodes, "n1", { status: "warning" });
      expect(result[0].status).toBe("warning");
      expect(result[1].status).toBe("active");
    });

    it("should publish user_edit event", () => {
      const handler = vi.fn();
      const unsub = dataBus.subscribe("nodes", handler);

      dataBus.updateUserEditNode([createMockNode()], "node-1", { status: "inactive" });

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as DataChangeEvent;
      expect(event.source).toBe("user_edit");
      unsub();
    });
  });

  describe("replaceNodes", () => {
    it("should replace all nodes", () => {
      const newNodes = [createMockNode({ id: "new-1" })];
      const result = dataBus.replaceNodes(newNodes);
      expect(result).toEqual(newNodes);
    });

    it("should publish replace event", () => {
      const handler = vi.fn();
      const unsub = dataBus.subscribe("nodes", handler);
      dataBus.replaceNodes([]);
      expect(handler).toHaveBeenCalledTimes(1);
      unsub();
    });
  });

  describe("mergeArrayData", () => {
    it("should merge arrays by id", () => {
      const current = [{ id: "a", value: 1 }, { id: "b", value: 2 }];
      const incoming = [{ id: "a", value: 10 }, { id: "c", value: 3 }];

      const result = dataBus.mergeArrayData(current, incoming, "metrics");
      expect(result).toHaveLength(3);
      expect(result.find((r) => r.id === "a")!.value).toBe(10);
    });

    it("should publish merge event for entity", () => {
      const handler = vi.fn();
      const unsub = dataBus.subscribe("logs", handler);
      dataBus.mergeArrayData([], [{ id: "1", msg: "test" }], "logs");
      expect(handler).toHaveBeenCalledTimes(1);
      unsub();
    });
  });

  describe("clearUserEdits", () => {
    it("should clear user edits for node", () => {
      const nodes = [createMockNode()];
      dataBus.updateUserEditNode(nodes, "node-1", { status: "warning" });
      dataBus.clearUserEdits("node-1");
    });

    it("should clear specific fields", () => {
      const nodes = [createMockNode()];
      dataBus.updateUserEditNode(nodes, "node-1", { status: "warning", model: "new-model" });
      dataBus.clearUserEdits("node-1", ["status"]);
    });
  });
});
