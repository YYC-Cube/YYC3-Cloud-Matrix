/**
 * @file: crdt.test.ts
 * @description: crdt.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { describe, expect, it } from "vitest";
import { GCounter, LWWRegister, mergeState } from "../../lib/crdt";

describe("LWWRegister", () => {
  it("should initialize with value", () => {
    const reg = new LWWRegister("hello");
    expect(reg.value).toBe("hello");
    expect(reg.timestamp).toBeGreaterThan(0);
  });

  it("should update value with set", () => {
    const reg = new LWWRegister("old");
    reg.set("new");
    expect(reg.value).toBe("new");
  });

  it("should merge when remote is newer", () => {
    const reg = new LWWRegister("local");
    const merged = reg.merge({
      value: "remote",
      timestamp: Date.now() + 10000,
      nodeId: "remote",
    });
    expect(merged).toBe(true);
    expect(reg.value).toBe("remote");
  });

  it("should not merge when local is newer", () => {
    const reg = new LWWRegister("local");
    const merged = reg.merge({
      value: "remote",
      timestamp: Date.now() - 10000,
      nodeId: "remote",
    });
    expect(merged).toBe(false);
    expect(reg.value).toBe("local");
  });

  it("should export and import", () => {
    const reg = new LWWRegister("data", "node-1");
    const exported = reg.export();
    expect(exported.value).toBe("data");
    expect(exported.nodeId).toBe("node-1");

    const imported = LWWRegister.import(exported);
    expect(imported.value).toBe("data");
  });
});

describe("GCounter", () => {
  it("should start at zero", () => {
    const counter = new GCounter("node-1");
    expect(counter.value).toBe(0);
  });

  it("should increment locally", () => {
    const counter = new GCounter("node-1");
    counter.increment();
    counter.increment(5);
    expect(counter.value).toBe(6);
  });

  it("should merge remote counts", () => {
    const counter1 = new GCounter("node-1");
    counter1.increment(10);

    const remoteCounts = new Map<string, number>();
    remoteCounts.set("node-2", 20);
    counter1.merge(remoteCounts);

    expect(counter1.value).toBe(30);
  });

  it("should take max on merge for same node", () => {
    const counter = new GCounter("node-1");
    counter.increment(5);

    const remoteCounts = new Map<string, number>();
    remoteCounts.set("node-1", 10);
    counter.merge(remoteCounts);

    expect(counter.value).toBe(10);
  });

  it("should export counts", () => {
    const counter = new GCounter("node-1");
    counter.increment(3);
    const exported = counter.export();
    expect(exported.get("node-1")).toBe(3);
  });
});

describe("mergeState", () => {
  it("should use LWW strategy - remote wins when newer", () => {
    const local = { a: 1, b: 2 };
    const remote = { a: 10, b: 20 };
    const result = mergeState(local, remote, "lww", 1000, 2000);
    expect(result).toEqual(remote);
  });

  it("should use LWW strategy - local wins when newer", () => {
    const local = { a: 1 };
    const remote = { a: 10 };
    const result = mergeState(local, remote, "lww", 2000, 1000);
    expect(result).toEqual(local);
  });

  it("should use merge-deep strategy", () => {
    const local: Record<string, unknown> = { a: 1, b: 2 };
    const remote: Record<string, unknown> = { b: 20, c: 30 };
    const result = mergeState(local, remote, "merge-deep");
    expect(result).toEqual({ a: 1, b: 20, c: 30 });
  });

  it("should use prefer-local strategy", () => {
    const local: Record<string, unknown> = { a: 1, b: 2 };
    const remote: Record<string, unknown> = { a: 10, b: 20, c: 30 };
    const result = mergeState(local, remote, "prefer-local");
    expect(result).toEqual({ a: 1, b: 2, c: 30 });
  });

  it("should default to local when no timestamps provided", () => {
    const local = { a: 1 };
    const remote = { a: 10 };
    const result = mergeState(local, remote, "lww");
    expect(result).toEqual(local);
  });
});
