/**
 * @file: alerting-manager.ts
 * @description: alerting-manager.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

export type AlertSeverity = "info" | "warning" | "error" | "critical";
export type AlertCategory = "system" | "performance" | "security" | "business" | "custom";

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  condition: {
    metric: string;
    operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
    threshold: number;
    duration?: number;
  };
  enabled: boolean;
  cooldown: number;
  notifications: NotificationChannel[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationChannel {
  type: "email" | "webhook" | "slack" | "teams" | "sms";
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  category: AlertCategory;
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  status: "firing" | "resolved";
  firedAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface AlertStats {
  total: number;
  firing: number;
  resolved: number;
  bySeverity: Record<AlertSeverity, number>;
  byCategory: Record<AlertCategory, number>;
  last24Hours: number;
  last7Days: number;
}

export class AlertingManager {
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, AlertInstance> = new Map();
  private lastTriggered: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    const defaultRules: Omit<AlertRule, "id" | "createdAt" | "updatedAt">[] = [
      {
        name: "High CPU Usage",
        description: "CPU 使用率超过阈值",
        category: "performance",
        severity: "warning",
        condition: {
          metric: "cpu.usage",
          operator: ">",
          threshold: 80,
          duration: 60,
        },
        enabled: true,
        cooldown: 300,
        notifications: [
          { type: "webhook", enabled: true, config: { url: "/api/alerts/webhook" } },
        ],
      },
      {
        name: "Critical CPU Usage",
        description: "CPU 使用率严重超标",
        category: "performance",
        severity: "critical",
        condition: {
          metric: "cpu.usage",
          operator: ">",
          threshold: 95,
          duration: 30,
        },
        enabled: true,
        cooldown: 180,
        notifications: [
          { type: "webhook", enabled: true, config: { url: "/api/alerts/webhook" } },
        ],
      },
      {
        name: "High Memory Usage",
        description: "内存使用率超过阈值",
        category: "performance",
        severity: "warning",
        condition: {
          metric: "memory.usage",
          operator: ">",
          threshold: 85,
          duration: 60,
        },
        enabled: true,
        cooldown: 300,
        notifications: [
          { type: "webhook", enabled: true, config: { url: "/api/alerts/webhook" } },
        ],
      },
      {
        name: "Node Down",
        description: "节点离线",
        category: "system",
        severity: "critical",
        condition: {
          metric: "node.status",
          operator: "==",
          threshold: 0,
          duration: 30,
        },
        enabled: true,
        cooldown: 60,
        notifications: [
          { type: "webhook", enabled: true, config: { url: "/api/alerts/webhook" } },
        ],
      },
      {
        name: "High Error Rate",
        description: "错误率过高",
        category: "business",
        severity: "error",
        condition: {
          metric: "requests.error_rate",
          operator: ">",
          threshold: 5,
          duration: 60,
        },
        enabled: true,
        cooldown: 300,
        notifications: [
          { type: "webhook", enabled: true, config: { url: "/api/alerts/webhook" } },
        ],
      },
      {
        name: "Slow Response Time",
        description: "响应时间过慢",
        category: "performance",
        severity: "warning",
        condition: {
          metric: "requests.latency_p95",
          operator: ">",
          threshold: 1000,
          duration: 120,
        },
        enabled: true,
        cooldown: 600,
        notifications: [
          { type: "webhook", enabled: true, config: { url: "/api/alerts/webhook" } },
        ],
      },
    ];

    defaultRules.forEach((rule) => {
      const id = `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();
      this.rules.set(id, {
        ...rule,
        id,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  addRule(rule: Omit<AlertRule, "id" | "createdAt" | "updatedAt">): AlertRule {
    const id = `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const newRule: AlertRule = {
      ...rule,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.rules.set(id, newRule);
    return newRule;
  }

  updateRule(id: string, updates: Partial<AlertRule>): AlertRule | undefined {
    const rule = this.rules.get(id);
    if (!rule) {return undefined;}

    const updated: AlertRule = {
      ...rule,
      ...updates,
      id: rule.id,
      createdAt: rule.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.rules.set(id, updated);
    return updated;
  }

  deleteRule(id: string): boolean {
    return this.rules.delete(id);
  }

  getRule(id: string): AlertRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  getEnabledRules(): AlertRule[] {
    return this.getAllRules().filter((r) => r.enabled);
  }

  evaluateMetric(
    metric: string,
    value: number,
    labels: Record<string, string> = {}
  ): AlertInstance[] {
    const triggeredAlerts: AlertInstance[] = [];
    const now = Date.now();

    this.getEnabledRules().forEach((rule) => {
      if (rule.condition.metric !== metric) {return;}

      const lastTrigger = this.lastTriggered.get(rule.id) || 0;
      if (now - lastTrigger < rule.cooldown * 1000) {return;}

      let shouldFire = false;
      const { operator, threshold } = rule.condition;

      switch (operator) {
        case ">":
          shouldFire = value > threshold;
          break;
        case "<":
          shouldFire = value < threshold;
          break;
        case ">=":
          shouldFire = value >= threshold;
          break;
        case "<=":
          shouldFire = value <= threshold;
          break;
        case "==":
          shouldFire = value === threshold;
          break;
        case "!=":
          shouldFire = value !== threshold;
          break;
      }

      if (shouldFire) {
        const alertId = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const alert: AlertInstance = {
          id: alertId,
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          category: rule.category,
          message: `${rule.name}: ${metric} = ${value} (threshold: ${threshold})`,
          metric,
          currentValue: value,
          threshold,
          status: "firing",
          firedAt: new Date().toISOString(),
          labels,
          annotations: {
            description: rule.description,
          },
        };

        this.alerts.set(alertId, alert);
        this.lastTriggered.set(rule.id, now);
        triggeredAlerts.push(alert);
      }
    });

    return triggeredAlerts;
  }

  acknowledgeAlert(id: string, acknowledgedBy: string): AlertInstance | undefined {
    const alert = this.alerts.get(id);
    if (!alert || alert.status !== "firing") {return undefined;}

    const updated: AlertInstance = {
      ...alert,
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy,
    };
    this.alerts.set(id, updated);
    return updated;
  }

  resolveAlert(id: string): AlertInstance | undefined {
    const alert = this.alerts.get(id);
    if (!alert || alert.status !== "firing") {return undefined;}

    const updated: AlertInstance = {
      ...alert,
      status: "resolved",
      resolvedAt: new Date().toISOString(),
    };
    this.alerts.set(id, updated);
    return updated;
  }

  getAlert(id: string): AlertInstance | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): AlertInstance[] {
    return Array.from(this.alerts.values());
  }

  getFiringAlerts(): AlertInstance[] {
    return this.getAllAlerts().filter((a) => a.status === "firing");
  }

  getAlertsByRule(ruleId: string): AlertInstance[] {
    return this.getAllAlerts().filter((a) => a.ruleId === ruleId);
  }

  getAlertsBySeverity(severity: AlertSeverity): AlertInstance[] {
    return this.getAllAlerts().filter((a) => a.severity === severity);
  }

  getAlertsByCategory(category: AlertCategory): AlertInstance[] {
    return this.getAllAlerts().filter((a) => a.category === category);
  }

  getStats(): AlertStats {
    const alerts = this.getAllAlerts();
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const stats: AlertStats = {
      total: alerts.length,
      firing: alerts.filter((a) => a.status === "firing").length,
      resolved: alerts.filter((a) => a.status === "resolved").length,
      bySeverity: {
        info: 0,
        warning: 0,
        error: 0,
        critical: 0,
      },
      byCategory: {
        system: 0,
        performance: 0,
        security: 0,
        business: 0,
        custom: 0,
      },
      last24Hours: 0,
      last7Days: 0,
    };

    alerts.forEach((alert) => {
      stats.bySeverity[alert.severity]++;
      stats.byCategory[alert.category]++;

      const firedAt = new Date(alert.firedAt).getTime();
      if (firedAt >= dayAgo) {stats.last24Hours++;}
      if (firedAt >= weekAgo) {stats.last7Days++;}
    });

    return stats;
  }

  clearAlerts(): void {
    this.alerts.clear();
    this.lastTriggered.clear();
  }

  async sendNotification(
    alert: AlertInstance,
    channel: NotificationChannel
  ): Promise<{ success: boolean; error?: string }> {
    if (!channel.enabled) {
      return { success: false, error: "Channel is disabled" };
    }

    switch (channel.type) {
      case "webhook":
        return this.sendWebhookNotification(alert, channel);
      case "email":
        return { success: true };
      case "slack":
        return { success: true };
      case "teams":
        return { success: true };
      case "sms":
        return { success: true };
      default:
        return { success: false, error: "Unknown channel type" };
    }
  }

  private async sendWebhookNotification(
    alert: AlertInstance,
    channel: NotificationChannel
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const url = channel.config.url as string;
      if (!url) {
        return { success: false, error: "Webhook URL not configured" };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export function createAlertingManager(): AlertingManager {
  return new AlertingManager();
}
