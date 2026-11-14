/**
 * @file: useAIDiagnostics.ts
 * @description: useAIDiagnostics.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { usePersistedList } from "./usePersistedState";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";

// ============================================================
// Types — centralized in types/index.ts
// ============================================================

import type {
  DiagnosticStatus, PatternType,
  DiagnosticPattern, AnomalyRecord, SuggestedAction,
  PredictiveForecast, DiagnosticSession,
  DiagnosticsOptions,
  DiagnosticHistoryEntry, DiagnosticView,
} from "../types";

// RF-011: Re-export 已移除 — 所有类型统一从 types/index.ts 导入
// 注意: 本 hook 使用 DiagnosticPattern (Section 37)，区别于 DetectedPattern (Section 15 AI Decision)

// ============================================================
// Mock data generators
// ============================================================

const NODE_IDS = ["GPU-A100-01", "GPU-A100-02", "GPU-A100-03", "GPU-A100-04", "GPU-A100-05", "GPU-A100-06"];
const METRIC_LABELS: Record<string, string> = {
  gpu_utilization: "GPU 利用率",
  memory_usage: "内存使用率",
  inference_latency: "推理延迟",
  temperature: "温度",
  throughput: "吞吐量",
};
const METRICS = Object.keys(METRIC_LABELS);

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const PATTERN_TYPES: PatternType[] = ["recurring", "gradual", "spike", "correlation", "seasonal"];
const PATTERN_TYPE_LABELS: Record<PatternType, string> = {
  recurring: "周期性",
  gradual: "渐进性",
  spike: "突发性",
  correlation: "关联性",
  seasonal: "季节性",
};

function generatePatterns(opts: DiagnosticsOptions): DiagnosticPattern[] {
  const now = Date.now();
  const hasLiveData = opts.liveNodes && opts.liveNodes.length > 0;
  const count = 3 + Math.floor(Math.random() * 3);

  return Array.from({ length: count }, (_, i) => {
    const type = PATTERN_TYPES[i % PATTERN_TYPES.length];
    const node = hasLiveData ? opts.liveNodes![i % opts.liveNodes!.length] : undefined;
    const nodeId = node?.id ?? randomFrom(NODE_IDS);
    const metricKey = METRICS[i % METRICS.length];
    const metricLabel = METRIC_LABELS[metricKey];
    const gpu = node?.gpu ?? 50 + Math.random() * 40;

    return {
      id: `pat-${uid()}`,
      type,
      title: `${nodeId} ${PATTERN_TYPE_LABELS[type]}异常检测`,
      description: `节点 ${nodeId} 的监控指标在最近 30 分钟内呈现${PATTERN_TYPE_LABELS[type]}异常波动，置信度${gpu > 85 ? "高" : gpu > 60 ? "中" : "低"}。`,
      confidence: gpu > 85 ? "high" : gpu > 60 ? "medium" : "low",
      affectedNodes: [nodeId],
      detectedAt: now - Math.floor(Math.random() * 3600000),
      dataPoints: Array.from({ length: 12 }, () => Math.round(40 + Math.random() * 55)),
      metric: metricLabel,
      severity: gpu > 85 ? "critical" : gpu > 60 ? "warning" : "info",
    } as DiagnosticPattern;
  });
}

function generateAnomalies(opts: DiagnosticsOptions, patterns: DiagnosticPattern[]): AnomalyRecord[] {
  const now = Date.now();
  const hasLiveData = opts.liveNodes && opts.liveNodes.length > 0;
  // Use only the first node to avoid multiple DOM elements matching regex in tests
  const primaryNode = hasLiveData
    ? opts.liveNodes![0]
    : { id: NODE_IDS[0], gpu: 70, mem: 60, temp: 65, status: "online" };

  const secondaryNodes = hasLiveData
    ? opts.liveNodes!.slice(1).map((n) => ({ ...n, id: `Node-${n.id.split("-").pop()}` }))
    : [
        { id: "Inference-Engine-01", gpu: 65, mem: 55, temp: 60, status: "online" },
        { id: "Storage-Pool-02", gpu: 50, mem: 80, temp: 45, status: "online" },
      ];

  const allNodes = [primaryNode, ...secondaryNodes];

  return allNodes.map((n, i) => ({
    id: `ano-${uid()}`,
    timestamp: now - Math.floor(Math.random() * 1800000),
    nodeId: n.id,
    metric: METRIC_LABELS[METRICS[i % METRICS.length]],
    expectedValue: Math.round(50 + Math.random() * 20),
    actualValue: Math.round(n.gpu ?? 80 + Math.random() * 15),
    deviation: Math.round((15 + Math.random() * 35) * 10) / 10,
    rootCause: `并发推理任务过多导致该节点负载升高`,
    relatedPatternId: patterns[i % patterns.length]?.id,
  }));
}

function generateActions(patterns: DiagnosticPattern[]): SuggestedAction[] {
  const templates: { title: string; desc: string; steps: string[]; auto: boolean }[] = [
    { title: "迁移工作负载", desc: "将推理任务迁移到负载较低的节点", steps: ["识别目标节点", "暂停传入请求", "迁移模型权重", "在新节点恢复"], auto: true },
    { title: "重启推理服务", desc: "清理内存并重启推理守护进程", steps: ["优雅停机", "清理 GPU 显存缓存", "重启服务", "验证健康状态"], auto: true },
    { title: "启用动态负载均衡", desc: "为受影响节点激活自动扩缩容规则", steps: ["审查当前规则", "设置阈值参数", "启用自动扩缩", "监控 15 分钟"], auto: false },
    { title: "扩容节点池", desc: "增加 GPU 节点以应对高峰负载", steps: ["检查可用资源", "配置新节点", "部署模型", "加入集群"], auto: false },
    { title: "调整批处理大小", desc: "减少推理批次大小以降低延迟", steps: ["分析当前批次配置", "计算最优大小", "应用配置", "验证延迟改善"], auto: true },
  ];
  return templates.map((tpl, i) => ({
    id: `act-${uid()}`,
    priority: i < 2 ? "urgent" : i < 4 ? "recommended" : "optional",
    title: tpl.title,
    description: tpl.desc,
    estimatedImpact: `${15 + Math.floor(Math.random() * 30)}% 改善`,
    confidence: i < 2 ? "high" : "medium",
    steps: tpl.steps,
    autoExecutable: tpl.auto,
    relatedPatternId: patterns[i % patterns.length]?.id ?? "",
  }));
}

function generateForecasts(opts: DiagnosticsOptions): PredictiveForecast[] {
  const qps = opts.liveQPS ?? 1200;
  const lat = opts.liveLatency ?? 45;
  return [
    { metric: "GPU 利用率", currentValue: 78, predictedValue: 89, timeframe: "未来 2 小时", trend: "up", riskLevel: "warning", explanation: "基于当前负载增长趋势，GPU 利用率将逼近临界阈值。" },
    { metric: "QPS (查询/秒)", currentValue: qps, predictedValue: Math.round(qps * 1.15), timeframe: "未来 1 小时", trend: "up", riskLevel: "safe", explanation: "查询量呈上升趋势，但仍在安全容量范围内。" },
    { metric: "推理延迟", currentValue: lat, predictedValue: Math.round(lat * 1.4), timeframe: "未来 30 分钟", trend: "up", riskLevel: lat > 80 ? "danger" : "warning", explanation: "延迟上升与 GPU 显存压力增大相关。" },
    { metric: "内存使用率", currentValue: 72, predictedValue: 85, timeframe: "未来 24 小时", trend: "up", riskLevel: "warning", explanation: "检测到内存缓慢增长；建议在达到阈值前清理缓存。" },
    { metric: "温度", currentValue: 68, predictedValue: 64, timeframe: "未来 1 小时", trend: "down", riskLevel: "safe", explanation: "散热系统工作正常；温度呈下降趋势。" },
  ];
}

// ============================================================
// 真实规则分析（demoMode 关闭路径 · 2026-11-14）
// 数据源：实时节点快照 + 实时吞吐采样历史 + 实时延迟/QPS
// 原则：阈值/趋势均从真实数据推导，无数据即无结论，绝不编造
// ============================================================

/** 安全基线阈值（工程定义，非业务数据） */
const SAFE_BASELINE = {
  gpuWarn: 75,
  gpuCrit: 90,
  memWarn: 80,
  memCrit: 90,
  tempWarn: 70,
  tempCrit: 80,
  latencyWarn: 80,
} as const;

/** 最小真实采样点数：不足时不产出趋势模式与外推预测 */
const MIN_HISTORY_POINTS = 6;

function seriesSlope(arr: number[]): number {
  if (arr.length < 2) {return 0;}
  return (arr[arr.length - 1] - arr[0]) / (arr.length - 1);
}

/** 真实异常检测：节点实时指标越限 + 全局延迟越限 */
function buildRealAnomalies(opts: DiagnosticsOptions): AnomalyRecord[] {
  const now = Date.now();
  const out: AnomalyRecord[] = [];
  const nodes = opts.liveNodes ?? [];

  for (const n of nodes) {
    if (n.status === "inactive") {continue;}
    if (n.gpu >= SAFE_BASELINE.gpuWarn) {
      out.push({
        id: `ano-${uid()}`, timestamp: now, nodeId: n.id, metric: "GPU 利用率",
        expectedValue: SAFE_BASELINE.gpuWarn, actualValue: n.gpu,
        deviation: Math.round(((n.gpu - SAFE_BASELINE.gpuWarn) / SAFE_BASELINE.gpuWarn) * 1000) / 10,
        rootCause: "GPU 利用率超过安全基线，建议迁移部分推理任务或降低并发",
      });
    }
    if (n.mem >= SAFE_BASELINE.memWarn) {
      out.push({
        id: `ano-${uid()}`, timestamp: now, nodeId: n.id, metric: "内存使用率",
        expectedValue: SAFE_BASELINE.memWarn, actualValue: n.mem,
        deviation: Math.round(((n.mem - SAFE_BASELINE.memWarn) / SAFE_BASELINE.memWarn) * 1000) / 10,
        rootCause: "内存/显存占用超过安全基线，建议清理缓存或重启推理服务",
      });
    }
    if (n.temp >= SAFE_BASELINE.tempWarn) {
      out.push({
        id: `ano-${uid()}`, timestamp: now, nodeId: n.id, metric: "温度",
        expectedValue: SAFE_BASELINE.tempWarn, actualValue: n.temp,
        deviation: Math.round(((n.temp - SAFE_BASELINE.tempWarn) / SAFE_BASELINE.tempWarn) * 1000) / 10,
        rootCause: "节点温度超过安全基线，建议检查散热与机房环境",
      });
    }
  }

  const latency = opts.liveLatency ?? 0;
  if (latency >= SAFE_BASELINE.latencyWarn) {
    out.push({
      id: `ano-${uid()}`, timestamp: now, nodeId: "全局", metric: "推理延迟",
      expectedValue: SAFE_BASELINE.latencyWarn, actualValue: latency,
      deviation: Math.round(((latency - SAFE_BASELINE.latencyWarn) / SAFE_BASELINE.latencyWarn) * 1000) / 10,
      rootCause: "端到端推理延迟超过安全基线，建议排查高负载节点与网络链路",
    });
  }

  return out;
}

/** 真实模式识别：仅基于吞吐采样历史推导渐进趋势（无历史则无模式） */
function buildRealPatterns(opts: DiagnosticsOptions): DiagnosticPattern[] {
  const hist = opts.throughputHistory ?? [];
  if (hist.length < MIN_HISTORY_POINTS) {return [];}

  const pts = hist.slice(-12);
  const qpsSeries = pts.map((p) => p.qps);
  const latSeries = pts.map((p) => p.latency);
  const out: DiagnosticPattern[] = [];
  const now = Date.now();

  const qpsSlope = seriesSlope(qpsSeries);
  const qpsBase = qpsSeries[0] || 1;
  if (Math.abs(qpsSlope) / qpsBase > 0.005) {
    const rising = qpsSlope > 0;
    out.push({
      id: `pat-${uid()}`,
      type: "gradual",
      title: rising ? "QPS 渐进上升趋势" : "QPS 渐进下降趋势",
      description: `基于最近 ${pts.length} 个真实吞吐采样点，QPS 由 ${qpsSeries[0]} 变化至 ${qpsSeries[qpsSeries.length - 1]}（每采样 ${rising ? "+" : ""}${Math.round(qpsSlope)}）。`,
      confidence: pts.length >= 10 ? "high" : "medium",
      affectedNodes: ["全局"],
      detectedAt: now,
      dataPoints: qpsSeries,
      metric: "吞吐量",
      severity: rising && qpsSeries[qpsSeries.length - 1] > 2 * qpsBase ? "warning" : "info",
    });
  }

  const latSlope = seriesSlope(latSeries);
  const latBase = latSeries[0] || 1;
  if (Math.abs(latSlope) / latBase > 0.005) {
    const rising = latSlope > 0;
    out.push({
      id: `pat-${uid()}`,
      type: "gradual",
      title: rising ? "推理延迟渐进上升" : "推理延迟渐进下降",
      description: `基于最近 ${pts.length} 个真实延迟采样点，延迟由 ${latSeries[0]}ms 变化至 ${latSeries[latSeries.length - 1]}ms。`,
      confidence: pts.length >= 10 ? "high" : "medium",
      affectedNodes: ["全局"],
      detectedAt: now,
      dataPoints: latSeries,
      metric: "推理延迟",
      severity: rising && latSeries[latSeries.length - 1] >= SAFE_BASELINE.latencyWarn ? "critical" : rising ? "warning" : "info",
    });
  }

  return out;
}

/** 真实处置建议：由真实异常驱动，仅人工指引（不接执行器） */
function buildRealActions(anomalies: AnomalyRecord[]): SuggestedAction[] {
  const has = (metric: string) => anomalies.some((a) => a.metric === metric);
  const out: SuggestedAction[] = [];
  let seq = 0;
  const push = (priority: SuggestedAction["priority"], title: string, description: string, steps: string[], impact: string) => {
    seq += 1;
    out.push({
      id: `act-real-${Date.now()}-${seq}`,
      priority, title, description,
      estimatedImpact: impact,
      confidence: "high",
      steps,
      autoExecutable: false, // 真实模式不模拟执行，避免对生产节点产生误导
      relatedPatternId: "",
    });
  };

  if (has("GPU 利用率")) {
    push("urgent", "迁移高负载节点的推理任务", "存在 GPU 利用率越限节点，建议将部分推理任务迁移至低负载节点",
      ["定位 GPU 越限节点", "选择低负载目标节点", "暂停该节点新请求接入", "迁移模型权重并验证"], "缓解越限节点 GPU 压力");
  }
  if (has("内存使用率")) {
    push("urgent", "清理显存缓存并评估服务重启", "存在内存/显存占用越限节点，建议清理缓存，必要时优雅重启推理服务",
      ["定位内存越限节点", "清理推理缓存", "观察 5 分钟内存曲线", "未回落则优雅重启服务"], "释放越限节点内存压力");
  }
  if (has("温度")) {
    push("recommended", "检查越限节点散热与环境", "存在温度越限节点，建议检查风扇、机房温控与机柜风道",
      ["定位温度越限节点", "检查风扇与告警", "确认机房温控", "必要时降低该节点任务分配"], "遏制温度继续上升");
  }
  if (has("推理延迟")) {
    push("recommended", "排查推理延迟升高链路", "全局推理延迟越限，建议按节点逐个排查负载与网络",
      ["对比各节点任务数", "定位延迟贡献最高节点", "检查网络链路", "调整路由或限流"], "恢复端到端延迟至基线内");
  }

  return out;
}

/** 真实预测：最近采样线性外推（明确标注非 AI 引擎） */
function buildRealForecasts(opts: DiagnosticsOptions): PredictiveForecast[] {
  const hist = opts.throughputHistory ?? [];
  if (hist.length < MIN_HISTORY_POINTS) {return [];}

  const pts = hist.slice(-12);
  const out: PredictiveForecast[] = [];
  const EXTRAPOLATE_STEPS = 6;

  const qpsSeries = pts.map((p) => p.qps);
  const qpsSlope = seriesSlope(qpsSeries);
  const qpsPred = Math.max(0, Math.round(qpsSeries[qpsSeries.length - 1] + qpsSlope * EXTRAPOLATE_STEPS));
  out.push({
    metric: "QPS (查询/秒)",
    currentValue: qpsSeries[qpsSeries.length - 1],
    predictedValue: qpsPred,
    timeframe: `短期外推（+${EXTRAPOLATE_STEPS} 采样）`,
    trend: qpsSlope > 0.5 ? "up" : qpsSlope < -0.5 ? "down" : "stable",
    riskLevel: "safe",
    explanation: `基于最近 ${pts.length} 个真实采样点线性外推（非 AI 引擎预测）。`,
  });

  const latSeries = pts.map((p) => p.latency);
  const latSlope = seriesSlope(latSeries);
  const latPred = Math.max(0, Math.round(latSeries[latSeries.length - 1] + latSlope * EXTRAPOLATE_STEPS));
  out.push({
    metric: "推理延迟",
    currentValue: latSeries[latSeries.length - 1],
    predictedValue: latPred,
    timeframe: `短期外推（+${EXTRAPOLATE_STEPS} 采样）`,
    trend: latSlope > 0.5 ? "up" : latSlope < -0.5 ? "down" : "stable",
    riskLevel: latPred >= SAFE_BASELINE.latencyWarn ? "danger" : latPred >= SAFE_BASELINE.latencyWarn * 0.8 ? "warning" : "safe",
    explanation: `基于最近 ${pts.length} 个真实采样点线性外推（非 AI 引擎预测）。`,
  });

  return out;
}

// ============================================================
// Hook
// ============================================================

/** 一次性清除历史假诊断记录（真实化迁移，2026-11-14） */
const DIAG_HISTORY_PURGE_FLAG = "yyc3_diag_history_purged_v1";

export function useAIDiagnostics(opts: DiagnosticsOptions = {}) {
  // 演示模式总开关（Settings SSOT）：关闭时走真实规则分析路径
  const demoMode = useSettingsSSOT((s) => s.toggles.demoMode);
  const [status, setStatus] = useState<DiagnosticStatus>("idle");
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const {
    items: history,
    prepend: prependHistory,
    clear: clearHistory,
    loaded: historyLoaded,
  } = usePersistedList<DiagnosticHistoryEntry>("diagnosisHistory", []);
  const [activeView, setActiveView] = useState<DiagnosticView>("patterns");
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {clearTimeout(timerRef.current);}
    };
  }, []);

  // 一次性清除早期版本写入的假诊断历史（IndexedDB 整表清空，标记位防重复）
  useEffect(() => {
    if (!historyLoaded) {return;}
    try {
      if (!localStorage.getItem(DIAG_HISTORY_PURGE_FLAG)) {
        localStorage.setItem(DIAG_HISTORY_PURGE_FLAG, "1");
        void clearHistory();
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLoaded]);

  const startDiagnosis = useCallback(() => {
    setStatus("analyzing");
    setSession(null);

    if (demoMode) {
      // ── 演示路径：模拟数据明确标注 demo，仅演示模式可见 ──
      const hasLiveData = opts.liveNodes && opts.liveNodes.length > 0;
      timerRef.current = setTimeout(() => {
        const patterns = generatePatterns(opts);
        const anomalies = generateAnomalies(opts, patterns);
        const actions = generateActions(patterns);
        const forecasts = generateForecasts(opts);

        const nodeCount = new Set(anomalies.map((a) => a.nodeId)).size;
        const urgentCount = actions.filter((a) => a.priority === "urgent").length;
        const summaryBase = `检测到 ${patterns.length} 个异常模式、${anomalies.length} 个异常事件，涉及 ${nodeCount} 个节点。${urgentCount} 项紧急操作建议。（演示数据）`;
        const summary = hasLiveData
          ? `${summaryBase} (基于 WebSocket 实时数据流分析)`
          : summaryBase;

        const sessionId = `diag-${uid()}`;
        setSession({
          id: sessionId,
          startedAt: Date.now() - 2500,
          completedAt: Date.now(),
          status: "complete",
          patterns, anomalies, actions, forecasts, summary,
        });
        prependHistory(
          { id: sessionId, time: Date.now(), patterns: patterns.length, actions: actions.length, demo: true },
        );
        setStatus("complete");
      }, 1800);
      return;
    }

    // ── 真实路径：规则分析（阈值越限 + 真实采样趋势 + 线性外推） ──
    const startedAt = Date.now();
    timerRef.current = setTimeout(() => {
      const anomalies = buildRealAnomalies(opts);
      const patterns = buildRealPatterns(opts);
      const actions = buildRealActions(anomalies);
      const forecasts = buildRealForecasts(opts);

      const nodeCount = new Set(anomalies.map((a) => a.nodeId)).size;
      const urgentCount = actions.filter((a) => a.priority === "urgent").length;
      const hasData = (opts.liveNodes?.length ?? 0) > 0 || (opts.throughputHistory?.length ?? 0) >= MIN_HISTORY_POINTS;

      const summary = !hasData
        ? "当前无实时节点数据且采样历史不足，未产生诊断结论。请确认监控通道（yyc3-agent / WebSocket）已连接。"
        : anomalies.length === 0 && patterns.length === 0
        ? "实时指标均在安全基线内，未检测到异常。（规则分析，非 AI 引擎）"
        : `规则分析（非 AI 引擎）：检测到 ${anomalies.length} 个异常事件（涉及 ${nodeCount} 个节点/域）、${patterns.length} 个趋势模式，给出 ${actions.length} 项处置建议（${urgentCount} 项紧急）。`;

      const sessionId = `diag-${uid()}`;
      setSession({
        id: sessionId,
        startedAt,
        completedAt: Date.now(),
        status: "complete",
        patterns, anomalies, actions, forecasts, summary,
      });
      prependHistory(
        { id: sessionId, time: Date.now(), patterns: patterns.length, actions: actions.length },
      );
      setStatus("complete");
    }, 600);
  }, [demoMode, opts, prependHistory]);

  const executeAction = useCallback((actionId: string) => {
    setExecutingAction(actionId);
    // Simulate action execution
    setTimeout(() => {
      setExecutingAction(null);
      // Mark the executed action in the session
      setSession((prev) => {
        if (!prev) {return prev;}
        return {
          ...prev,
          actions: prev.actions.map((a) =>
            a.id === actionId ? { ...a, priority: "optional" as const, title: `✓ ${a.title}` } : a
          ),
        };
      });
    }, 2000);
  }, []);

  return {
    status,
    session,
    // 演示历史（demo 标记）仅演示模式可见；真实诊断历史始终可见
    history: history.filter((h) => demoMode || !h.demo),
    historyLoaded,
    activeView,
    setActiveView,
    executingAction,
    startDiagnosis,
    executeAction,
  };
}