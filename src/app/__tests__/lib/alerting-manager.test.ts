/**
 * @file: alerting-manager.test.ts
 * @description: alerting-manager.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  AlertingManager,
  createAlertingManager,
  type AlertRule,
  type AlertSeverity,
  type AlertCategory,
} from "../../lib/alerting-manager";

describe("AlertingManager", () => {
  let manager: AlertingManager;

  beforeEach(() => {
    manager = createAlertingManager();
  });

  describe("constructor", () => {
    it("should initialize with default rules", () => {
      const rules = manager.getAllRules();
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe("addRule", () => {
    it("should add new rule", () => {
      const rule = manager.addRule({
        name: "Test Rule",
        description: "Test rule description",
        category: "custom",
        severity: "warning",
        condition: {
          metric: "test.metric",
          operator: ">",
          threshold: 50,
        },
        enabled: true,
        cooldown: 60,
        notifications: [],
      });

      expect(rule.id).toBeDefined();
      expect(rule.name).toBe("Test Rule");
      expect(rule.createdAt).toBeDefined();
    });
  });

  describe("updateRule", () => {
    it("should update existing rule", () => {
      const rule = manager.addRule({
        name: "Test Rule",
        description: "Test rule description",
        category: "custom",
        severity: "warning",
        condition: {
          metric: "test.metric",
          operator: ">",
          threshold: 50,
        },
        enabled: true,
        cooldown: 60,
        notifications: [],
      });

      const updated = manager.updateRule(rule.id, {
        severity: "error",
        condition: {
          ...rule.condition,
          threshold: 75,
        },
      });

      expect(updated?.severity).toBe("error");
      expect(updated?.condition.threshold).toBe(75);
    });

    it("should return undefined for non-existent rule", () => {
      const result = manager.updateRule("non-existent", { severity: "error" });
      expect(result).toBeUndefined();
    });
  });

  describe("deleteRule", () => {
    it("should delete existing rule", () => {
      const rule = manager.addRule({
        name: "Test Rule",
        description: "Test rule description",
        category: "custom",
        severity: "warning",
        condition: {
          metric: "test.metric",
          operator: ">",
          threshold: 50,
        },
        enabled: true,
        cooldown: 60,
        notifications: [],
      });

      const result = manager.deleteRule(rule.id);
      expect(result).toBe(true);
      expect(manager.getRule(rule.id)).toBeUndefined();
    });

    it("should return false for non-existent rule", () => {
      const result = manager.deleteRule("non-existent");
      expect(result).toBe(false);
    });
  });

  describe("getRule", () => {
    it("should return rule by id", () => {
      const rules = manager.getAllRules();
      const rule = manager.getRule(rules[0].id);
      expect(rule).toBeDefined();
    });
  });

  describe("getEnabledRules", () => {
    it("should return only enabled rules", () => {
      manager.addRule({
        name: "Disabled Rule",
        description: "Disabled rule",
        category: "custom",
        severity: "info",
        condition: {
          metric: "test.metric",
          operator: ">",
          threshold: 50,
        },
        enabled: false,
        cooldown: 60,
        notifications: [],
      });

      const enabledRules = manager.getEnabledRules();
      expect(enabledRules.every((r) => r.enabled)).toBe(true);
    });
  });

  describe("evaluateMetric", () => {
    it("should trigger alert when condition is met", () => {
      manager.clearAlerts();

      manager.addRule({
        name: "CPU Alert",
        description: "CPU alert",
        category: "performance",
        severity: "warning",
        condition: {
          metric: "cpu.usage",
          operator: ">",
          threshold: 80,
        },
        enabled: true,
        cooldown: 0,
        notifications: [],
      });

      const alerts = manager.evaluateMetric("cpu.usage", 85);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].currentValue).toBe(85);
      expect(alerts[0].status).toBe("firing");
    });

    it("should not trigger alert when condition is not met", () => {
      manager.clearAlerts();

      manager.addRule({
        name: "CPU Alert",
        description: "CPU alert",
        category: "performance",
        severity: "warning",
        condition: {
          metric: "cpu.usage",
          operator: ">",
          threshold: 80,
        },
        enabled: true,
        cooldown: 0,
        notifications: [],
      });

      const alerts = manager.evaluateMetric("cpu.usage", 50);
      expect(alerts.length).toBe(0);
    });

    it("should respect cooldown period", () => {
      manager.clearAlerts();

      manager.addRule({
        name: "CPU Alert",
        description: "CPU alert",
        category: "performance",
        severity: "warning",
        condition: {
          metric: "cpu.usage",
          operator: ">",
          threshold: 80,
        },
        enabled: true,
        cooldown: 60,
        notifications: [],
      });

      manager.evaluateMetric("cpu.usage", 85);
      const secondAlerts = manager.evaluateMetric("cpu.usage", 90);

      expect(secondAlerts.length).toBe(0);
    });

    it("should support different operators", () => {
      const operators: Array<{ op: AlertRule["condition"]["operator"]; value: number; expected: boolean }> = [
        { op: ">", value: 85, expected: true },
        { op: ">", value: 75, expected: false },
        { op: "<", value: 75, expected: true },
        { op: "<", value: 85, expected: false },
        { op: ">=", value: 80, expected: true },
        { op: "<=", value: 80, expected: true },
        { op: "==", value: 80, expected: true },
        { op: "!=", value: 81, expected: true },
      ];

      operators.forEach(({ op, value, expected }) => {
        const testManager = createAlertingManager();
        testManager.clearAlerts();

        testManager.addRule({
          name: `Test ${op}`,
          description: `Test ${op}`,
          category: "custom",
          severity: "warning",
          condition: {
            metric: "test.metric",
            operator: op,
            threshold: 80,
          },
          enabled: true,
          cooldown: 0,
          notifications: [],
        });

        const alerts = testManager.evaluateMetric("test.metric", value);
        expect(alerts.length > 0).toBe(expected);
      });
    });
  });

  describe("acknowledgeAlert", () => {
    it("should acknowledge firing alert", () => {
      manager.clearAlerts();

      manager.addRule({
        name: "Test Rule",
        description: "Test",
        category: "custom",
        severity: "warning",
        condition: {
          metric: "test.metric",
          operator: ">",
          threshold: 50,
        },
        enabled: true,
        cooldown: 0,
        notifications: [],
      });

      const alerts = manager.evaluateMetric("test.metric", 60);
      const acknowledged = manager.acknowledgeAlert(alerts[0].id, "test-user");

      expect(acknowledged?.acknowledgedBy).toBe("test-user");
      expect(acknowledged?.acknowledgedAt).toBeDefined();
    });

    it("should not acknowledge resolved alert", () => {
      manager.clearAlerts();

      manager.addRule({
        name: "Test Rule",
        description: "Test",
        category: "custom",
        severity: "warning",
        condition: {
          metric: "test.metric",
          operator: ">",
          threshold: 50,
        },
        enabled: true,
        cooldown: 0,
        notifications: [],
      });

      const alerts = manager.evaluateMetric("test.metric", 60);
      manager.resolveAlert(alerts[0].id);
      const acknowledged = manager.acknowledgeAlert(alerts[0].id, "test-user");

      expect(acknowledged).toBeUndefined();
    });
  });

  describe("resolveAlert", () => {
    it("should resolve firing alert", () => {
      manager.clearAlerts();

      manager.addRule({
        name: "Test Rule",
        description: "Test",
        category: "custom",
        severity: "warning",
        condition: {
          metric: "test.metric",
          operator: ">",
          threshold: 50,
        },
        enabled: true,
        cooldown: 0,
        notifications: [],
      });

      const alerts = manager.evaluateMetric("test.metric", 60);
      const resolved = manager.resolveAlert(alerts[0].id);

      expect(resolved?.status).toBe("resolved");
      expect(resolved?.resolvedAt).toBeDefined();
    });
  });

  describe("getStats", () => {
    it("should return correct statistics", () => {
      manager.clearAlerts();

      manager.addRule({
        name: "Test Rule",
        description: "Test",
        category: "performance",
        severity: "warning",
        condition: {
          metric: "test.metric",
          operator: ">",
          threshold: 50,
        },
        enabled: true,
        cooldown: 0,
        notifications: [],
      });

      manager.evaluateMetric("test.metric", 60);
      manager.evaluateMetric("test.metric", 70);

      const stats = manager.getStats();

      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.firing).toBeGreaterThanOrEqual(2);
      expect(stats.bySeverity.warning).toBeGreaterThanOrEqual(2);
      expect(stats.byCategory.performance).toBeGreaterThanOrEqual(2);
    });
  });

  describe("clearAlerts", () => {
    it("should clear all alerts", () => {
      manager.clearAlerts();

      manager.addRule({
        name: "Test Rule",
        description: "Test",
        category: "custom",
        severity: "warning",
        condition: {
          metric: "test.metric",
          operator: ">",
          threshold: 50,
        },
        enabled: true,
        cooldown: 0,
        notifications: [],
      });

      manager.evaluateMetric("test.metric", 60);
      manager.clearAlerts();

      expect(manager.getAllAlerts()).toHaveLength(0);
    });
  });

  describe("sendNotification", () => {
    it("should fail for disabled channel", async () => {
      const result = await manager.sendNotification(
        {
          id: "test-alert",
          ruleId: "test-rule",
          ruleName: "Test",
          severity: "warning",
          category: "custom",
          message: "Test",
          metric: "test",
          currentValue: 10,
          threshold: 5,
          status: "firing",
          firedAt: new Date().toISOString(),
          labels: {},
          annotations: {},
        },
        {
          type: "webhook",
          enabled: false,
          config: { url: "http://example.com/webhook" },
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("disabled");
    });
  });
});

describe("createAlertingManager", () => {
  it("should create new alerting manager instance", () => {
    const manager = createAlertingManager();
    expect(manager).toBeInstanceOf(AlertingManager);
  });
});
