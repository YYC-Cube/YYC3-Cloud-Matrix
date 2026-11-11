/**
 * @file: useAlertRules.test.ts
 * @description: useAlertRules 测试 — 零硬编码种子 / 真实创建流 / WS 实时评估 / 假种子清除
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-03-31
 * @updated: 2026-11-11
 * @status: active
 * @tags: [test],[alert-rules]
 *
 * @notes:
 * v2: 2026-11-11 假种子（MOCK_RULES/MOCK_EVENTS）已按「可编辑项拒绝硬编码」原则移除，
 * 测试改为通过 createRule 建立真实规则再驱动后续断言；
 * 新增历史假种子一次性清除（legacy purge）的专项用例。
 */

// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AlertRule } from "../types";
import { useAlertRules } from "../hooks/useAlertRules";

/** 每个 store 的 mock 初始数据（purge 用例在渲染前注入假种子） */
let mockSeed: Record<string, any[]> = {};

vi.mock("../hooks/usePersistedState", () => ({
  usePersistedList: vi.fn((storeName: string, defaultData: any[]) => {
    const [items, setItems] = React.useState<any[]>(mockSeed[storeName] ?? defaultData);
    const [loaded] = React.useState(true);

    const upsert = async (item: any) => {
      setItems((prev: any[]) => {
        const idx = prev.findIndex((i) => i.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = item;
          return next;
        }
        return [...prev, item];
      });
    };

    const remove = async (id: string) => {
      setItems((prev: any[]) => prev.filter((i) => i.id !== id));
    };

    const setAll = async (newItems: any[]) => {
      setItems(newItems);
    };

    return {
      items,
      loaded,
      upsert,
      setAll,
      remove,
      setItems,
    };
  }),
}));

import * as React from "react";

// ============================================================
// Fixtures
// ============================================================

function makeRuleInput(overrides: Record<string, any> = {}) {
  return {
    name: "内存使用率过高",
    enabled: true,
    severity: "critical" as const,
    thresholds: [
      { metric: "memory" as const, condition: "gt" as const, value: 90, unit: "%", duration: 0 },
    ],
    aggregation: { enabled: false, windowMinutes: 0, maxGroupSize: 0 },
    deduplication: { enabled: true, cooldownMinutes: 15 },
    escalation: [{ level: 1 as const, delayMinutes: 0, notifyChannels: ["dashboard"] }],
    targets: ["NODE-01"],
    ...overrides,
  };
}

/** 渲染 hook 并创建一条规则，返回 { result, ruleId } */
function renderWithRule(opts: Record<string, any> = {}, ruleInput = makeRuleInput()) {
  const rendered = renderHook((props: any) => useAlertRules(props), { initialProps: opts });
  act(() => {
    rendered.result.current.createRule(ruleInput);
  });
  const rule = rendered.result.current.rules[0];
  return { ...rendered, rule };
}

describe("useAlertRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSeed = {};
  });

  describe("initialization（零硬编码种子）", () => {
    it("should initialize with empty rules and events", () => {
      const { result } = renderHook(() => useAlertRules());

      // 唯一禁忌：可编辑项拒绝硬编码 — 初始必须为空
      expect(result.current.rules).toHaveLength(0);
      expect(result.current.events).toHaveLength(0);
      expect(result.current.selectedRule).toBeNull();
      expect(result.current.isCreating).toBe(false);
      expect(result.current.editingRule).toBeNull();
      expect(result.current.filterSeverity).toBe("all");
    });

    it("should calculate zero stats on empty state", () => {
      const { result } = renderHook(() => useAlertRules());

      expect(result.current.stats.totalRules).toBe(0);
      expect(result.current.stats.activeRules).toBe(0);
      expect(result.current.stats.unresolvedEvents).toBe(0);
      expect(result.current.stats.criticalEvents).toBe(0);
    });
  });

  describe("legacy mock purge（历史假种子一次性清除）", () => {
    it("should purge legacy mock rules after load", async () => {
      mockSeed.alertRules = [
        { ...makeRuleInput(), id: "rule-001", createdAt: 1, lastTriggered: null, triggerCount: 0 },
        { ...makeRuleInput({ name: "真实规则" }), id: "rule-real", createdAt: 2, lastTriggered: null, triggerCount: 0 },
      ];

      const { result } = renderHook(() => useAlertRules());

      await waitFor(() => {
        expect(result.current.rules).toHaveLength(1);
      });
      expect(result.current.rules[0].id).toBe("rule-real");
    });

    it("should purge legacy mock events after load", async () => {
      mockSeed.alertEvents = [
        {
          id: "evt-001", ruleId: "rule-001", ruleName: "假", severity: "critical",
          message: "假事件", metric: "gpu", currentValue: 1, threshold: 1,
          nodeId: "GPU-A100-03", timestamp: 1, acknowledged: false, resolved: false, escalationLevel: 1,
        },
      ];

      const { result } = renderHook(() => useAlertRules());

      await waitFor(() => {
        expect(result.current.events).toHaveLength(0);
      });
    });
  });

  describe("rule management", () => {
    it("should create new rule", () => {
      const { result } = renderHook(() => useAlertRules());

      act(() => {
        result.current.setIsCreating(true);
        result.current.createRule(makeRuleInput());
      });

      expect(result.current.rules).toHaveLength(1);
      expect(result.current.rules[0].name).toBe("内存使用率过高");
      expect(result.current.rules[0].triggerCount).toBe(0);
      expect(result.current.isCreating).toBe(false);
    });

    it("should toggle rule enabled state", () => {
      const { result, rule } = renderWithRule();

      act(() => {
        result.current.toggleRule(rule.id);
      });

      expect(result.current.rules[0].enabled).toBe(!rule.enabled);
    });

    it("should delete rule", () => {
      const { result, rule } = renderWithRule();

      act(() => {
        result.current.deleteRule(rule.id);
      });

      expect(result.current.rules).toHaveLength(0);
    });

    it("should clear selected rule when deleting selected rule", () => {
      const { result, rule } = renderWithRule();

      act(() => {
        result.current.setSelectedRule(rule);
      });
      expect(result.current.selectedRule?.id).toBe(rule.id);

      act(() => {
        result.current.deleteRule(rule.id);
      });
      expect(result.current.selectedRule).toBeNull();
    });

    it("should update existing rule", () => {
      const { result, rule } = renderWithRule();

      act(() => {
        result.current.setEditingRule(rule);
        result.current.updateRule(rule.id, { name: "更新后的规则" });
      });

      expect(result.current.rules[0].name).toBe("更新后的规则");
      expect(result.current.editingRule).toBeNull();
    });
  });

  describe("filtering", () => {
    it("should filter rules by severity", () => {
      const { result } = renderHook(() => useAlertRules());

      act(() => {
        result.current.createRule(makeRuleInput({ name: "严重", severity: "critical" }));
        result.current.createRule(makeRuleInput({ name: "提示", severity: "info" }));
      });
      expect(result.current.rules).toHaveLength(2);

      act(() => {
        result.current.setFilterSeverity("critical");
      });

      expect(result.current.rules).toHaveLength(1);
      expect(result.current.rules.every((r) => r.severity === "critical")).toBe(true);
    });

    it("should show all rules when filter is all", () => {
      const { result } = renderWithRule();

      act(() => {
        result.current.setFilterSeverity("all");
      });

      expect(result.current.filterSeverity).toBe("all");
      expect(result.current.rules).toHaveLength(1);
    });
  });

  describe("selection and editing", () => {
    it("should set selected rule", () => {
      const { result, rule } = renderWithRule();

      act(() => {
        result.current.setSelectedRule(rule);
      });

      expect(result.current.selectedRule?.id).toBe(rule.id);
    });

    it("should set editing rule", () => {
      const { result, rule } = renderWithRule();

      act(() => {
        result.current.setEditingRule(rule);
      });

      expect(result.current.editingRule?.id).toBe(rule.id);
    });

    it("should set creating state", () => {
      const { result } = renderHook(() => useAlertRules());

      act(() => {
        result.current.setIsCreating(true);
      });

      expect(result.current.isCreating).toBe(true);
    });
  });

  describe("WebSocket live evaluation（真实规则 × 真实节点）", () => {
    const liveNodes = [
      { id: "NODE-01", gpu: 40, mem: 96, temp: 72, status: "online" },
      { id: "NODE-02", gpu: 45, mem: 60, temp: 55, status: "online" },
    ];

    it("should evaluate live nodes and create events", async () => {
      const { result, rerender } = renderWithRule({}, makeRuleInput());

      rerender({ liveNodes });

      await waitFor(() => {
        expect(result.current.events.length).toBeGreaterThan(0);
      });
      // mem 96 > 90 命中 NODE-01；NODE-02 未命中
      expect(result.current.events[0].nodeId).toBe("NODE-01");
      expect(result.current.events[0].metric).toBe("memory");
    });

    it("should not create events when no rule targets the node", async () => {
      const { result, rerender } = renderWithRule({}, makeRuleInput({ targets: ["NODE-99"] }));

      rerender({ liveNodes });

      // 等待一个评估周期后仍无事件
      await new Promise((r) => setTimeout(r, 50));
      expect(result.current.events).toHaveLength(0);
    });

    it("should throttle repeated evaluation within 10s window", async () => {
      const { result, rerender } = renderWithRule({}, makeRuleInput());

      rerender({ liveNodes });
      await waitFor(() => {
        expect(result.current.events.length).toBe(1);
      });

      // 立即再次触发评估（10s 节流窗口内，不应新增事件）
      rerender({ liveNodes: [...liveNodes] });

      await new Promise((r) => setTimeout(r, 50));
      expect(result.current.events).toHaveLength(1);
    });

    it("should handle live latency data", async () => {
      const { result, rerender } = renderWithRule(
        {},
        makeRuleInput({
          thresholds: [{ metric: "latency", condition: "gt", value: 2000, unit: "ms", duration: 0 }],
        }),
      );

      rerender({ liveNodes, liveLatency: 2500 });

      await waitFor(() => {
        expect(result.current.events.length).toBeGreaterThan(0);
      });
      expect(result.current.events[0].metric).toBe("latency");
    });
  });

  describe("event management", () => {
    async function setupEvent() {
      const rendered = renderWithRule({}, makeRuleInput());
      rendered.rerender({
        liveNodes: [{ id: "NODE-01", gpu: 40, mem: 96, temp: 72, status: "online" }],
      });
      await waitFor(() => {
        expect(rendered.result.current.events.length).toBeGreaterThan(0);
      });
      return rendered;
    }

    it("should acknowledge event", async () => {
      const { result } = await setupEvent();
      const firstEvent = result.current.events[0];

      act(() => {
        result.current.acknowledgeEvent(firstEvent.id);
      });

      expect(result.current.events[0].acknowledged).toBe(true);
    });

    it("should resolve event", async () => {
      const { result } = await setupEvent();
      const firstEvent = result.current.events[0];

      act(() => {
        result.current.resolveEvent(firstEvent.id);
      });

      const updated = result.current.events.find((e) => e.id === firstEvent.id);
      expect(updated?.resolved).toBe(true);
      expect(updated?.acknowledged).toBe(true);
    });
  });

  describe("stats calculation", () => {
    it("should calculate stats from real rules and events", async () => {
      const { result, rerender } = renderWithRule({}, makeRuleInput());

      rerender({
        liveNodes: [{ id: "NODE-01", gpu: 40, mem: 96, temp: 72, status: "online" }],
      });
      await waitFor(() => {
        expect(result.current.events.length).toBe(1);
      });

      expect(result.current.stats.totalRules).toBe(1);
      expect(result.current.stats.activeRules).toBe(1);
      expect(result.current.stats.unresolvedEvents).toBe(1);
      expect(result.current.stats.criticalEvents).toBe(1);
    });
  });

  describe("integration", () => {
    it("should handle complete workflow", async () => {
      const { result, rule, rerender } = renderWithRule();

      // Select rule
      act(() => {
        result.current.setSelectedRule(rule);
      });
      expect(result.current.selectedRule?.id).toBe(rule.id);

      // Toggle rule
      act(() => {
        result.current.toggleRule(rule.id);
      });
      expect(result.current.rules[0].enabled).toBe(false);

      // 禁用后重新启用，再评估
      act(() => {
        result.current.toggleRule(rule.id);
      });
      rerender({
        liveNodes: [{ id: "NODE-01", gpu: 40, mem: 96, temp: 72, status: "online" }],
      });
      await waitFor(() => {
        expect(result.current.events.length).toBe(1);
      });

      // Acknowledge event
      const firstEvent = result.current.events[0];
      act(() => {
        result.current.acknowledgeEvent(firstEvent.id);
      });
      expect(result.current.events[0].acknowledged).toBe(true);

      // Filter by severity
      act(() => {
        result.current.setFilterSeverity("critical");
      });
      expect(result.current.rules.every((r) => r.severity === "critical")).toBe(true);

      // Reset filter
      act(() => {
        result.current.setFilterSeverity("all");
      });
      expect(result.current.filterSeverity).toBe("all");
    });
  });
});

// 类型引用（避免未使用告警）
export type { AlertRule };
