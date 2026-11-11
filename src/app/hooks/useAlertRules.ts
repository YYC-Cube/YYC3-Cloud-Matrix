/**
 * @file: useAlertRules.ts
 * @description: useAlertRules.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { usePersistedList } from "./usePersistedState";
import { syncAlertRulesToAgent } from "../lib/agent-rules-sync";

// ============================================================
// Types — centralized in types/index.ts
// ============================================================

import type {
  AlertSeverity,
  AlertRule, AlertEvent, AlertRulesOptions,
} from "../types";

// RF-011: Re-export 已移除

// ============================================================
// 历史假种子清理
// 2026-11-11 前版本内置 6 条 GPU-A100 假规则 + 5 条假事件作为默认种子，
// 违反「可编辑项拒绝硬编码」原则。现默认空列表，真实规则由用户创建；
// 已持久化在用户浏览器 IndexedDB 中的假种子按已知 ID 一次性清除。
// ============================================================

const LEGACY_MOCK_RULE_IDS = new Set([
  "rule-001", "rule-002", "rule-003", "rule-004", "rule-005", "rule-006",
]);
const LEGACY_MOCK_EVENT_IDS = new Set([
  "evt-001", "evt-002", "evt-003", "evt-004", "evt-005",
]);

// ============================================================
// Hook
// ============================================================

export function useAlertRules(opts: AlertRulesOptions = {}) {
  // RF-007: 使用 usePersistedList 代替手动 IndexedDB CRUD
  // 默认空列表：规则/事件均为用户可编辑数据，禁止硬编码种子（唯一禁忌）
  const {
    items: rules,
    upsert: upsertRule,
    remove: removeRule,
    setAll: setAllRules,
    loaded: rulesLoaded,
  } = usePersistedList<AlertRule>("alertRules", []);

  const {
    items: events,
    setItems: setEvents,
    setAll: setAllEvents,
    upsert: upsertEvent,
    loaded: eventsLoaded,
  } = usePersistedList<AlertEvent>("alertEvents", []);

  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "all">("all");
  const lastPushRef = useRef<number>(0);
  const rulesRef = useRef(rules);

  // ── 历史假种子一次性清除（IndexedDB 加载完成后执行） ──
  useEffect(() => {
    if (!rulesLoaded) {return;}
    if (rules.some((r) => LEGACY_MOCK_RULE_IDS.has(r.id))) {
      void setAllRules(rules.filter((r) => !LEGACY_MOCK_RULE_IDS.has(r.id)));
    }
  }, [rulesLoaded, rules, setAllRules]);

  useEffect(() => {
    if (!eventsLoaded) {return;}
    if (events.some((e) => LEGACY_MOCK_EVENT_IDS.has(e.id))) {
      void setAllEvents(events.filter((e) => !LEGACY_MOCK_EVENT_IDS.has(e.id)));
    }
  }, [eventsLoaded, events, setAllEvents]);

  // ── WebSocket live alert evaluation ──
  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);

  // ── 规则下发 yyc3-agent（防抖）：编辑即生效的下行链路 ──
  // agent 端按规则实时评估 cpu/memory/disk 并推送 alert（上行闭环）
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!rulesLoaded) {return;}
    if (syncTimerRef.current) {clearTimeout(syncTimerRef.current);}
    syncTimerRef.current = setTimeout(() => {
      void syncAlertRulesToAgent(rulesRef.current);
    }, 800);
    return () => {
      if (syncTimerRef.current) {clearTimeout(syncTimerRef.current);}
    };
  }, [rules, rulesLoaded]);

  useEffect(() => {
    if (!opts.liveNodes || opts.liveNodes.length === 0) {return;}
    const now = Date.now();
    if (now - lastPushRef.current < 10000) {return;}
    lastPushRef.current = now;

    const enabledRules = rulesRef.current.filter((r) => r.enabled);

    setEvents((prevEvents) => {
      const newEvts: AlertEvent[] = [];

      for (const rule of enabledRules) {
        for (const th of rule.thresholds) {
          for (const node of opts.liveNodes!) {
            if (!rule.targets.includes(node.id)) {continue;}

            let value: number | null = null;
            if (th.metric === "gpu") {value = node.gpu;}
            else if (th.metric === "memory") {value = node.mem;}
            else if (th.metric === "latency" && opts.liveLatency !== null && opts.liveLatency !== undefined) {value = opts.liveLatency;}

            if (value === null) {continue;}

            const triggered =
              (th.condition === "gt" && value > th.value) ||
              (th.condition === "gte" && value >= th.value) ||
              (th.condition === "lt" && value < th.value) ||
              (th.condition === "lte" && value <= th.value) ||
              (th.condition === "eq" && value === th.value) ||
              (th.condition === "neq" && value !== th.value);

            if (!triggered) {continue;}

            // Deduplication check
            const cooldownMs = rule.deduplication.enabled
              ? rule.deduplication.cooldownMinutes * 60000
              : 0;
            const hasDuplicate = prevEvents.some(
              (e) =>
                e.ruleId === rule.id &&
                e.nodeId === node.id &&
                e.metric === th.metric &&
                !e.resolved &&
                now - e.timestamp < cooldownMs
            );
            if (hasDuplicate) {continue;}

            newEvts.push({
              id: `evt-ws-${now}-${node.id}-${th.metric}`,
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              message: `[WS] ${node.id} ${th.metric} = ${value.toFixed(1)} (阈值 ${th.condition} ${th.value}${th.unit})`,
              metric: th.metric,
              currentValue: value,
              threshold: th.value,
              nodeId: node.id,
              timestamp: now,
              acknowledged: false,
              resolved: false,
              escalationLevel: 1,
            });
          }
        }
      }

      if (newEvts.length === 0) {return prevEvents;}
      return [...newEvts, ...prevEvents].slice(0, 50);
    });
  }, [opts.liveNodes, opts.liveLatency, setEvents]);

  const toggleRule = useCallback((ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      upsertRule({ ...rule, enabled: !rule.enabled });
    }
  }, [rules, upsertRule]);

  const deleteRule = useCallback((ruleId: string) => {
    removeRule(ruleId);
    if (selectedRule?.id === ruleId) {setSelectedRule(null);}
  }, [selectedRule, removeRule]);

  const acknowledgeEvent = useCallback((eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      upsertEvent({ ...event, acknowledged: true });
    }
  }, [events, upsertEvent]);

  const resolveEvent = useCallback((eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      upsertEvent({ ...event, resolved: true, acknowledged: true });
    }
  }, [events, upsertEvent]);

  const createRule = useCallback((rule: Omit<AlertRule, "id" | "createdAt" | "lastTriggered" | "triggerCount">) => {
    const newRule: AlertRule = {
      ...rule,
      // 同毫秒连续创建时 Date.now() 会撞 ID，追加随机段防碰撞
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      lastTriggered: null,
      triggerCount: 0,
    };
    upsertRule(newRule);
    setIsCreating(false);
  }, [upsertRule]);

  /** Update an existing rule (edit mode) */
  const updateRule = useCallback((ruleId: string, updates: Partial<Omit<AlertRule, "id" | "createdAt" | "lastTriggered" | "triggerCount">>) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      upsertRule({ ...rule, ...updates });
    }
    setEditingRule(null);
  }, [rules, upsertRule]);

  const filteredRules = filterSeverity === "all"
    ? rules
    : rules.filter((r) => r.severity === filterSeverity);

  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter((r) => r.enabled).length,
    unresolvedEvents: events.filter((e) => !e.resolved).length,
    criticalEvents: events.filter((e) => e.severity === "critical" && !e.resolved).length,
  };

  return {
    rules: filteredRules,
    events,
    selectedRule,
    setSelectedRule,
    isCreating,
    setIsCreating,
    editingRule,
    setEditingRule,
    filterSeverity,
    setFilterSeverity,
    toggleRule,
    deleteRule,
    acknowledgeEvent,
    resolveEvent,
    createRule,
    updateRule,
    stats,
  };
}