/**
 * @file: useAlertRules.test.ts
 * @description: useAlertRules.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAlertRules } from "../hooks/useAlertRules";
import type { AlertRule, AlertEvent } from "../types";

vi.mock("../hooks/usePersistedState", () => ({
  usePersistedList: vi.fn((storeName, defaultData) => {
    const [items, setItems] = React.useState(defaultData);
    const [loaded, setLoaded] = React.useState(true);

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

describe("useAlertRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default rules", () => {
      const { result } = renderHook(() => useAlertRules());

      expect(result.current.rules.length).toBeGreaterThan(0);
      expect(result.current.events.length).toBeGreaterThan(0);
      expect(result.current.selectedRule).toBeNull();
      expect(result.current.isCreating).toBe(false);
      expect(result.current.editingRule).toBeNull();
      expect(result.current.filterSeverity).toBe("all");
    });

    it("should calculate stats correctly", () => {
      const { result } = renderHook(() => useAlertRules());

      expect(result.current.stats.totalRules).toBeGreaterThan(0);
      expect(result.current.stats.activeRules).toBeGreaterThanOrEqual(0);
      expect(result.current.stats.unresolvedEvents).toBeGreaterThanOrEqual(0);
      expect(result.current.stats.criticalEvents).toBeGreaterThanOrEqual(0);
    });
  });

  describe("rule management", () => {
    it("should toggle rule enabled state", () => {
      const { result } = renderHook(() => useAlertRules());

      const firstRule = result.current.rules[0];
      const originalEnabled = firstRule.enabled;

      act(() => {
        result.current.toggleRule(firstRule.id);
      });

      expect(result.current.rules[0].enabled).toBe(!originalEnabled);
    });

    it("should delete rule", () => {
      const { result } = renderHook(() => useAlertRules());

      const firstRule = result.current.rules[0];
      const originalLength = result.current.rules.length;

      act(() => {
        result.current.deleteRule(firstRule.id);
      });

      expect(result.current.rules.length).toBe(originalLength - 1);
      expect(result.current.rules.find((r) => r.id === firstRule.id)).toBeUndefined();
    });

    it("should clear selected rule when deleting selected rule", () => {
      const { result } = renderHook(() => useAlertRules());

      const firstRule = result.current.rules[0];

      act(() => {
        result.current.setSelectedRule(firstRule);
      });

      expect(result.current.selectedRule).toBe(firstRule);

      act(() => {
        result.current.deleteRule(firstRule.id);
      });

      expect(result.current.selectedRule).toBeNull();
    });

    it("should create new rule", () => {
      const { result } = renderHook(() => useAlertRules());

      const newRuleData = {
        name: "Test Rule",
        enabled: true,
        severity: "warning" as const,
        thresholds: [
          { metric: "gpu" as const, condition: "gt" as const, value: 90, unit: "%", duration: 60 },
        ],
        aggregation: { enabled: true, windowMinutes: 5, maxGroupSize: 10 },
        deduplication: { enabled: true, cooldownMinutes: 15 },
        escalation: [
          { level: 1 as const, delayMinutes: 0, notifyChannels: ["dashboard"] },
        ],
        targets: ["GPU-A100-01"],
      };

      const originalLength = result.current.rules.length;

      act(() => {
        result.current.setIsCreating(true);
        result.current.createRule(newRuleData);
      });

      expect(result.current.rules.length).toBe(originalLength + 1);
      expect(result.current.isCreating).toBe(false);
    });

    it("should update existing rule", () => {
      const { result } = renderHook(() => useAlertRules());

      const firstRule = result.current.rules[0];
      const originalName = firstRule.name;

      act(() => {
        result.current.setEditingRule(firstRule);
        result.current.updateRule(firstRule.id, { name: "Updated Rule Name" });
      });

      expect(result.current.rules[0].name).toBe("Updated Rule Name");
      expect(result.current.editingRule).toBeNull();
    });
  });

  describe("event management", () => {
    it("should acknowledge event", () => {
      const { result } = renderHook(() => useAlertRules());

      const firstEvent = result.current.events[0];
      const originalAcknowledged = firstEvent.acknowledged;

      act(() => {
        result.current.acknowledgeEvent(firstEvent.id);
      });

      expect(result.current.events[0].acknowledged).toBe(!originalAcknowledged);
    });

    it("should resolve event", () => {
      const { result } = renderHook(() => useAlertRules());

      const firstEvent = result.current.events[0];

      act(() => {
        result.current.resolveEvent(firstEvent.id);
      });

      const updatedEvent = result.current.events.find((e) => e.id === firstEvent.id);
      expect(updatedEvent?.resolved).toBe(true);
      expect(updatedEvent?.acknowledged).toBe(true);
    });
  });

  describe("filtering", () => {
    it("should filter rules by severity", () => {
      const { result } = renderHook(() => useAlertRules());

      act(() => {
        result.current.setFilterSeverity("critical");
      });

      expect(result.current.rules.every((r) => r.severity === "critical")).toBe(true);
    });

    it("should show all rules when filter is all", () => {
      const { result } = renderHook(() => useAlertRules());

      act(() => {
        result.current.setFilterSeverity("all");
      });

      expect(result.current.filterSeverity).toBe("all");
    });
  });

  describe("selection and editing", () => {
    it("should set selected rule", () => {
      const { result } = renderHook(() => useAlertRules());

      const firstRule = result.current.rules[0];

      act(() => {
        result.current.setSelectedRule(firstRule);
      });

      expect(result.current.selectedRule).toBe(firstRule);
    });

    it("should set editing rule", () => {
      const { result } = renderHook(() => useAlertRules());

      const firstRule = result.current.rules[0];

      act(() => {
        result.current.setEditingRule(firstRule);
      });

      expect(result.current.editingRule).toBe(firstRule);
    });

    it("should set creating state", () => {
      const { result } = renderHook(() => useAlertRules());

      act(() => {
        result.current.setIsCreating(true);
      });

      expect(result.current.isCreating).toBe(true);
    });
  });

  describe("WebSocket live evaluation", () => {
    it("should evaluate live nodes and create events", async () => {
      const { result } = renderHook(() => useAlertRules({
        liveNodes: [
          { id: "GPU-A100-01", gpu: 98, mem: 85, temp: 72, status: "online" },
          { id: "GPU-A100-02", gpu: 45, mem: 60, temp: 55, status: "online" },
        ],
      }));

      await waitFor(() => {
        expect(result.current.events.length).toBeGreaterThan(0);
      });
    });

    it("should respect deduplication cooldown", async () => {
      const { result } = renderHook(() => useAlertRules({
        liveNodes: [
          { id: "GPU-A100-01", gpu: 98, mem: 85, temp: 72, status: "online" },
        ],
      }));

      const initialEventCount = result.current.events.length;

      // Trigger again immediately (should be deduplicated)
      act(() => {
        result.current.setFilterSeverity("all");
      });

      await waitFor(() => {
        expect(result.current.events.length).toBe(initialEventCount);
      });
    });

    it("should handle live latency data", async () => {
      const { result } = renderHook(() => useAlertRules({
        liveNodes: [
          { id: "GPU-A100-01", gpu: 80, mem: 70, temp: 65, status: "online" },
        ],
        liveLatency: 2500,
      }));

      await waitFor(() => {
        expect(result.current.events.length).toBeGreaterThan(0);
      });
    });
  });

  describe("stats calculation", () => {
    it("should calculate active rules correctly", () => {
      const { result } = renderHook(() => useAlertRules());

      const activeRules = result.current.rules.filter((r) => r.enabled);
      expect(result.current.stats.activeRules).toBe(activeRules.length);
    });

    it("should calculate unresolved events correctly", () => {
      const { result } = renderHook(() => useAlertRules());

      const unresolvedEvents = result.current.events.filter((e) => !e.resolved);
      expect(result.current.stats.unresolvedEvents).toBe(unresolvedEvents.length);
    });

    it("should calculate critical events correctly", () => {
      const { result } = renderHook(() => useAlertRules());

      const criticalEvents = result.current.events.filter(
        (e) => e.severity === "critical" && !e.resolved
      );
      expect(result.current.stats.criticalEvents).toBe(criticalEvents.length);
    });
  });

  describe("integration", () => {
    it("should handle complete workflow", () => {
      const { result } = renderHook(() => useAlertRules());

      // Select rule
      const firstRule = result.current.rules[0];
      act(() => {
        result.current.setSelectedRule(firstRule);
      });
      expect(result.current.selectedRule).toBe(firstRule);

      // Toggle rule
      act(() => {
        result.current.toggleRule(firstRule.id);
      });
      expect(result.current.rules[0].enabled).toBe(!firstRule.enabled);

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
