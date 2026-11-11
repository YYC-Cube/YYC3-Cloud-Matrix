/**
 * @file: agent-rules-sync.ts
 * @description: 告警规则双向闭环 — 前端规则变更同步下发至 yyc3-agent
 * @author: YYC³ Team
 * @version: v1.0.0
 * @created: 2026-11-11
 * @status: active
 * @tags: [lib],[alert-rules],[agent],[sync]
 *
 * @brief: 「告警规则」面板编辑即生效的下行链路
 *
 * @details:
 * - 数据源：usePersistedList("alertRules")（IndexedDB，用户可编辑 SSOT）
 * - 下行：PUT http://<agent>/rules（令牌鉴权，与 WS 同一 agent-token）
 * - agent 端按规则实时评估 cpu/memory/disk 并推送 alert（上行闭环）
 * - 未配置 WS 访问令牌时静默跳过（此时 WS 也连不上，无代理可收）
 * - 失败不阻塞本地持久化：规则先落 IndexedDB，下发失败仅影响 agent 侧评估
 */

import { getAPIConfig } from "./api-config";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";
import type { AlertRule } from "../types";

/** agent 可实测指标（其余指标由前端本地评估，无需下发但保留在规则内） */
export interface AgentRuleWire {
  id: string;
  name: string;
  severity: string;
  enabled: boolean;
  thresholds: { metric: string; condition: string; value: number; unit: string }[];
  cooldownMinutes: number;
  targets: string[];
}

/**
 * 从 WS 端点推导 agent HTTP 基址
 * ws(s)://host:port/path → http(s)://host:port
 */
export function deriveAgentHttpBase(wsEndpoint: string): string | null {
  try {
    const url = new URL(wsEndpoint);
    const proto = url.protocol === "wss:" ? "https:" : url.protocol === "ws:" ? "http:" : null;
    if (!proto) { return null; }
    return `${proto}//${url.host}`;
  } catch {
    return null;
  }
}

/** 前端 AlertRule → agent 线协议（提取 cooldown，丢弃 escalation/aggregation 等 agent 不用的字段） */
export function toAgentWire(rule: AlertRule): AgentRuleWire {
  return {
    id: rule.id,
    name: rule.name,
    severity: rule.severity,
    enabled: rule.enabled,
    thresholds: rule.thresholds.map((th) => ({
      metric: th.metric,
      condition: th.condition,
      value: th.value,
      unit: th.unit,
    })),
    cooldownMinutes: rule.deduplication.enabled ? rule.deduplication.cooldownMinutes : 0,
    targets: rule.targets,
  };
}

export interface SyncResult {
  ok: boolean;
  /** skipped=no-token/no-endpoint；network=连接失败；http-<code>=agent 拒绝 */
  reason?: string;
}

/**
 * 将完整规则列表下发到 agent（全量替换语义）
 * 设计为 fire-and-forget：调用方无需 await，失败仅返回原因
 */
export async function syncAlertRulesToAgent(rules: AlertRule[]): Promise<SyncResult> {
  const token = useSettingsSSOT.getState().values.wsToken?.trim();
  if (!token) { return { ok: false, reason: "no-token" }; }

  const base = deriveAgentHttpBase(getAPIConfig().wsEndpoint);
  if (!base) { return { ok: false, reason: "no-endpoint" }; }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${base}/rules?token=${encodeURIComponent(token)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: rules.map(toAgentWire) }),
      signal: controller.signal,
    });
    if (!res.ok) { return { ok: false, reason: `http-${res.status}` }; }
    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}
