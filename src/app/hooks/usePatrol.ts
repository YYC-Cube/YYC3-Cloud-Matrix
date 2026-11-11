/**
 * @file: usePatrol.ts
 * @description: 巡查模式状态管理 Hook · 真实巡检 + 演示模式隔离
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-02-26
 * @updated: 2026-11-11
 * @status: active
 * @tags: [hook],[patrol],[monitoring]
 *
 * @brief: 巡查模式状态管理（v2 全真化，2026-11-11）
 *
 * @details:
 * - 真实巡查：检查项从 node-slice / follow-up-slice / log-slice / WS 连接态派生，
 *   无节点时对应项标记 skipped，绝不编造数值
 * - 演示巡查：随机检查项仅在 demoMode 开启时可用，结果 ID 以 demo- 前缀隔离，
 *   关闭演示模式后演示历史自动隐藏（持久化保留）
 * - 历史假种子（patrol-init-*）挂载时按 ID 一次性从 IndexedDB 清除
 * - 自动巡查定时器不再依赖 demoMode —— 真实巡查始终可调度
 */

import { useState, useCallback, useEffect, useRef, useContext } from "react";
import { toast } from "sonner";
import { usePersistedList } from "./usePersistedState";
import { idbDelete } from "../lib/yyc3-storage";
import { WebSocketContext } from "../lib/view-context";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";
import { useNodeSlice } from "../store/slices/node-slice";
import { useFollowUpSlice } from "../store/slices/follow-up-slice";
import { useLogSlice } from "../store/slices/log-slice";
import type {
  PatrolStatus,
  CheckStatus,
  PatrolInterval,
  PatrolCheckItem,
  PatrolResult,
  PatrolSchedule,
} from "../types";

// ============================================================
//  真实巡查检查项（数据源：node-slice / follow-up-slice / log-slice / WS）
// ============================================================

function buildRealChecks(connectionState: string | undefined): PatrolCheckItem[] {
  const { derived, nodes } = useNodeSlice.getState();
  const followUps = useFollowUpSlice.getState().followUps;
  const logs = useLogSlice.getState().logs;
  const checks: PatrolCheckItem[] = [];
  const noNodes = derived.totalCount === 0;

  // 1. 节点在线率
  checks.push(noNodes
    ? { id: "chk-real-online", category: "节点健康", label: "节点在线率", status: "skipped", value: "无节点", detail: "等待 WS 节点快照或手动添加" }
    : (() => {
        const ratio = derived.activeCount / derived.totalCount;
        return {
          id: "chk-real-online", category: "节点健康", label: "节点在线率",
          status: ratio >= 1 ? "pass" as CheckStatus : ratio >= 0.8 ? "warning" as CheckStatus : "critical" as CheckStatus,
          value: `${Math.round(ratio * 100)}%`, threshold: "100%",
          detail: `${derived.activeCount}/${derived.totalCount} 节点在线`,
        };
      })());

  // 2. GPU 平均利用率
  checks.push(noNodes
    ? { id: "chk-real-gpu", category: "GPU", label: "GPU 平均利用率", status: "skipped", value: "无节点" }
    : {
        id: "chk-real-gpu", category: "GPU", label: "GPU 平均利用率",
        status: derived.avgGpu < 85 ? "pass" : derived.avgGpu < 95 ? "warning" : "critical",
        value: `${derived.avgGpu}%`, threshold: "<85%",
      });

  // 3. GPU 峰值温度
  const maxTemp = nodes.filter((n) => n.status !== "inactive").reduce((m, n) => Math.max(m, n.temp), 0);
  checks.push(noNodes
    ? { id: "chk-real-temp", category: "GPU", label: "GPU 峰值温度", status: "skipped", value: "无节点" }
    : {
        id: "chk-real-temp", category: "GPU", label: "GPU 峰值温度",
        status: maxTemp < 75 ? "pass" : maxTemp < 85 ? "warning" : "critical",
        value: `${maxTemp}°C`, threshold: "<75°C",
      });

  // 4. 内存平均利用率
  checks.push(noNodes
    ? { id: "chk-real-mem", category: "内存", label: "内存利用率", status: "skipped", value: "无节点" }
    : {
        id: "chk-real-mem", category: "内存", label: "内存利用率",
        status: derived.avgMem < 80 ? "pass" : derived.avgMem < 90 ? "warning" : "critical",
        value: `${derived.avgMem}%`, threshold: "<80%",
      });

  // 5. 待处理告警工单
  const pending = followUps.filter((f) => f.status !== "completed").length;
  checks.push({
    id: "chk-real-alerts", category: "告警", label: "待处理告警工单",
    status: pending === 0 ? "pass" : pending <= 3 ? "warning" : "critical",
    value: `${pending} 单`, threshold: "0 单",
  });

  // 6. 近 24h 错误日志
  const dayAgo = Date.now() - 86400000;
  const errCount = logs.filter((l) => (l.level === "error" || l.level === "fatal") && l.timestamp >= dayAgo).length;
  checks.push({
    id: "chk-real-errors", category: "日志", label: "近24h错误日志",
    status: errCount === 0 ? "pass" : errCount <= 5 ? "warning" : "critical",
    value: `${errCount} 条`, threshold: "0 条",
  });

  // 7. agent 通道状态
  const connMap: Record<string, { status: CheckStatus; value: string }> = {
    connected: { status: "pass", value: "已连接" },
    connecting: { status: "warning", value: "连接中" },
    reconnecting: { status: "warning", value: "重连中" },
    simulated: { status: "warning", value: "模拟模式" },
    disconnected: { status: "critical", value: "已断开" },
  };
  const conn = connMap[connectionState ?? ""] ?? { status: "critical" as CheckStatus, value: "未知" };
  checks.push({
    id: "chk-real-conn", category: "连接", label: "agent 通道状态",
    status: conn.status, value: conn.value, threshold: "已连接",
  });

  return checks;
}

// ============================================================
//  演示巡查检查项（仅 demoMode，随机数据不进入生产路径）
// ============================================================

function generateDemoChecks(): PatrolCheckItem[] {
  const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
  const defs: Array<{ category: string; label: string; threshold: string; gen: () => { value: string; status: CheckStatus } }> = [
    { category: "节点健康", label: "节点在线率", threshold: "≥95%", gen: () => { const v = rnd(90, 100); return { value: `${v}%`, status: v >= 95 ? "pass" : "warning" }; } },
    { category: "GPU", label: "GPU 平均利用率", threshold: "<85%", gen: () => { const v = rnd(40, 95); return { value: `${v}%`, status: v < 85 ? "pass" : "warning" }; } },
    { category: "GPU", label: "GPU 温度", threshold: "<75°C", gen: () => { const v = rnd(55, 85); return { value: `${v}°C`, status: v < 75 ? "pass" : "warning" }; } },
    { category: "内存", label: "内存利用率", threshold: "<80%", gen: () => { const v = rnd(50, 95); return { value: `${v}%`, status: v < 80 ? "pass" : "warning" }; } },
  ];
  return defs.map((d, i) => ({
    id: `chk-demo-${i + 1}`,
    category: d.category,
    label: d.label,
    threshold: d.threshold,
    ...d.gen(),
  }));
}

// ============================================================
//  结果组装（健康度只统计非 skipped 项）
// ============================================================

function buildResult(
  checks: PatrolCheckItem[],
  triggeredBy: "manual" | "auto" | "scheduled",
  durationSec: number,
  isDemo: boolean,
): PatrolResult {
  const effective = checks.filter((c) => c.status !== "skipped");
  const passCount = checks.filter((c) => c.status === "pass").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;
  const criticalCount = checks.filter((c) => c.status === "critical").length;
  const skippedCount = checks.length - effective.length;
  const healthScore = effective.length > 0
    ? Math.round(((passCount * 100 + warningCount * 60 + criticalCount * 10) / (effective.length * 100)) * 100)
    : 0;

  return {
    id: `${isDemo ? "demo-" : ""}patrol-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    duration: durationSec,
    status: "completed",
    healthScore,
    totalChecks: checks.length,
    passCount,
    warningCount,
    criticalCount,
    skippedCount,
    checks,
    triggeredBy,
  };
}

// ============================================================
//  Hook
// ============================================================

export function usePatrol() {
  // 演示模式总开关（Settings SSOT）：决定巡查检查项来源（演示随机 vs 真实派生）
  const demoMode = useSettingsSSOT((s) => s.toggles.demoMode);
  const ws = useContext(WebSocketContext);
  const [patrolStatus, setPatrolStatus] = useState<PatrolStatus>("idle");
  const [currentResult, setCurrentResult] = useState<PatrolResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedReport, setSelectedReport] = useState<PatrolResult | null>(null);

  const {
    items: history,
    setItems: _setHistory,
    prepend: prependHistory,
    loaded: historyLoaded,
  } = usePersistedList<PatrolResult>("patrolHistory");

  // 一次性清除历史假巡查数据（按生成器签名精确识别）：
  // - patrol-init-*：旧版初始假种子
  // - checks[0].id 形如 chk-001：旧版 generateChecks 随机假检查项产生的结果
  const purgedRef = useRef(false);
  useEffect(() => {
    if (!historyLoaded || purgedRef.current) { return; }
    purgedRef.current = true;
    const isLegacyFake = (h: PatrolResult) =>
      h.id.startsWith("patrol-init-") || /^chk-\d+$/.test(h.checks?.[0]?.id ?? "");
    const fakes = history.filter(isLegacyFake);
    if (fakes.length > 0) {
      for (const f of fakes) { void idbDelete("patrolHistory", f.id); }
      _setHistory(history.filter((h) => !isLegacyFake(h)));
    }
  }, [historyLoaded, history, _setHistory]);

  const [schedule, setSchedule] = useState<PatrolSchedule>(() => ({
    enabled: true,
    interval: 15,
    lastRun: null,
    nextRun: Date.now() + 15 * 60 * 1000,
  }));

  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── runPatrol ──────────────────────────────────────────────

  const runPatrol = useCallback(
    async (triggeredBy: "manual" | "auto" | "scheduled" = "manual") => {
      setPatrolStatus("running");
      setProgress(0);
      const startedAt = Date.now();

      // 渐进进度（真实检查为同步派生，进度条仅作执行反馈）
      const steps = 5;
      for (let i = 1; i <= steps; i++) {
        await new Promise((r) => setTimeout(r, 80));
        setProgress(Math.round((i / steps) * 100));
      }

      const isDemo = demoMode;
      const checks = isDemo
        ? generateDemoChecks()
        : buildRealChecks(ws?.connectionState);
      const durationSec = Math.round(((Date.now() - startedAt) / 1000) * 10) / 10;
      const result = buildResult(checks, triggeredBy, durationSec, isDemo);

      setCurrentResult(result);
      setPatrolStatus("completed");
      setProgress(100);
      prependHistory(result);

      setSchedule((s) => ({
        ...s,
        lastRun: Date.now(),
        nextRun: s.enabled ? Date.now() + s.interval * 60 * 1000 : s.nextRun,
      }));

      if (triggeredBy === "manual") {
        toast.success(`巡查完成 — 健康度 ${result.healthScore}%（${isDemo ? "演示数据" : "真实巡检"}）`);
      }
    },
    [demoMode, ws?.connectionState, prependHistory]
  );

  // ── toggleAutoPatrol ───────────────────────────────────────

  const toggleAutoPatrol = useCallback(
    (enabled: boolean) => {
      setSchedule((s) => ({
        ...s,
        enabled,
        nextRun: enabled ? Date.now() + s.interval * 60 * 1000 : null,
      }));

      if (!enabled && autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }

      toast.info(enabled ? "自动巡查已开启" : "自动巡查已关闭");
    },
    []
  );

  // ── updateInterval ─────────────────────────────────────────

  const updateInterval = useCallback(
    (interval: PatrolInterval) => {
      setSchedule((s) => ({
        ...s,
        interval,
        nextRun: s.enabled ? Date.now() + interval * 60 * 1000 : s.nextRun,
      }));
    },
    []
  );

  // ── viewReport / closeReport ───────────────────────────────

  const viewReport = useCallback((report: PatrolResult) => {
    setSelectedReport(report);
  }, []);

  const closeReport = useCallback(() => {
    setSelectedReport(null);
  }, []);

  // ── 自动巡查定时器（真实巡查始终可调度，不再依赖 demoMode） ──

  useEffect(() => {
    if (schedule.enabled) {
      autoTimerRef.current = setInterval(() => {
        runPatrol("auto");
      }, schedule.interval * 60 * 1000);
    }
    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [schedule.enabled, schedule.interval, runPatrol]);

  return {
    patrolStatus,
    currentResult,
    // 演示历史仅在演示模式下展示；真实巡查记录始终可见
    history: demoMode ? history : history.filter((h) => !h.id.startsWith("demo-")),
    schedule,
    progress,
    selectedReport,
    runPatrol,
    toggleAutoPatrol,
    updateInterval,
    viewReport,
    closeReport,
  };
}
