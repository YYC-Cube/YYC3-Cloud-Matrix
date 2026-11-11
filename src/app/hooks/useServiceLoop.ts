/**
 * @file: useServiceLoop.ts
 * @description: 一站式服务闭环 Hook · 六层管道自动流转管理
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-09
 * @status: active
 * @tags: [hook],[service-loop],[automation]
 *
 * @brief: 一站式服务闭环管理
 *
 * @details:
 * - 六层管道：监测 → 分析 → 决策 → 执行 → 验证 → 优化
 * - 自动流转 + 手动干预
 * - 数据流管理
 * - 阶段状态跟踪
 *
 * @dependencies: React, toast
 * @exports: useServiceLoop
 * @notes: 使用 usePersistedList 持久化运行历史
 */

import { useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { usePersistedList } from "./usePersistedState";
import type {
  LoopStage,
  StageStatus,
  StageResult,
  LoopRun,
  DataFlowEdge,
  StageMeta,
  DataFlowNode,
} from "../types";

// RF-011: Re-export 已移除 — 所有类型统一从 types/index.ts 导入

// ============================================================
// 闭环阶段元信息
// ============================================================

export const STAGE_META: StageMeta[] = [
  {
    key: "monitor",
    label: "监测层",
    icon: "Activity",
    color: "#00d4ff",
    description: "实时数据采集 · 指标监控 · 异常检测",
  },
  {
    key: "analyze",
    label: "分析层",
    icon: "BarChart3",
    color: "#7b2ff7",
    description: "模式识别 · 趋势分析 · 异常关联",
  },
  {
    key: "decide",
    label: "决策层",
    icon: "Brain",
    color: "#ff6600",
    description: "AI 辅助 · 规则引擎 · 操作推荐",
  },
  {
    key: "execute",
    label: "执行层",
    icon: "Play",
    color: "#00ff88",
    description: "一键操作 · 脚本执行 · 批量处理",
  },
  {
    key: "verify",
    label: "验证层",
    icon: "CheckCircle",
    color: "#ffaa00",
    description: "效果评估 · 指标对比 · 回归检测",
  },
  {
    key: "optimize",
    label: "优化层",
    icon: "TrendingUp",
    color: "#ff3366",
    description: "持续改进 · 参数调优 · 学习更新",
  },
];

// ============================================================
// 闭环阶段真实执行器（v2 真实化 2026-11-11）
// 六阶段全部基于真实数据源执行，零模拟数据：
//   monitor  → useNodeSlice（WS 权威节点快照）
//   analyze  → deriveFromRealData（AI 决策同一派生引擎，口径一致）
//   decide   → 筛选可自动执行建议
//   execute  → 真实动作：为可执行建议生成跟进工单（follow-up-slice SSOT）
//   verify   → 等待一个 WS 推送周期后重读真实指标对比
//   optimize → 真实沉淀：统计在库告警规则与生成工单
// ============================================================

import { useNodeSlice } from "../store/slices/node-slice";
import { useFollowUpSlice } from "../store/slices/follow-up-slice";
import { deriveFromRealData } from "../store/slices/ai-suggestion-slice";
import { idbGetAll } from "../lib/yyc3-storage";
import type { DetectedPattern, AIRecommendation } from "../types";

/** 单次闭环运行的跨阶段上下文 */
interface LoopContext {
  runId: string;
  before: { nodes: number; anomalies: number };
  patterns: DetectedPattern[];
  recommendations: AIRecommendation[];
  createdOrders: string[];
}

function countAnomalies(nodes: { mem: number; status: string }[]): number {
  return nodes.filter((n) => n.mem >= 90 || n.status !== "active").length;
}

const REAL_STAGE_EXECUTORS: Record<LoopStage, (ctx: LoopContext) => Promise<Partial<StageResult>>> = {
  monitor: async (ctx) => {
    const nodes = useNodeSlice.getState().nodes;
    const anomalies = nodes.filter((n) => n.mem >= 90 || n.status !== "active");
    ctx.before = { nodes: nodes.length, anomalies: anomalies.length };
    return {
      summary: `采集 ${nodes.length} 个节点真实指标，检测到 ${anomalies.length} 个异常信号`,
      details: [
        ...anomalies.map((n) => {
          const parts: string[] = [];
          if (n.status !== "active") { parts.push(`状态 ${n.status}`); }
          if (n.mem >= 90) { parts.push(`内存 ${n.mem.toFixed(1)}%`); }
          return `${n.id}: ${parts.join(" · ")}`;
        }),
        ...(anomalies.length === 0 ? ["全部节点指标处于正常区间"] : []),
      ],
      metrics: { nodes_scanned: nodes.length, anomalies: anomalies.length },
    };
  },

  analyze: async (ctx) => {
    const { patterns, recommendations } = deriveFromRealData();
    ctx.patterns = patterns;
    ctx.recommendations = recommendations;
    return {
      summary: patterns.length > 0
        ? `识别 ${patterns.length} 个异常模式（真实数据派生）`
        : "未识别到异常模式",
      details: patterns.length > 0
        ? patterns.map((p) => `${p.severity.toUpperCase()} · ${p.title} — ${p.metric}`)
        : ["节点指标与告警流均正常"],
      metrics: { patterns_found: patterns.length, recommendations: recommendations.length },
    };
  },

  decide: async (ctx) => {
    const auto = ctx.recommendations.filter((r) => r.autoExecutable && !r.applied);
    return {
      summary: auto.length > 0
        ? `生成 ${auto.length} 条可执行建议（来自真实异常模式）`
        : "无需干预 — 当前无可执行建议",
      details: auto.length > 0
        ? auto.map((r) => `${r.action}（置信度 ${r.confidence}%）`)
        : ["系统处于健康状态，保持观察"],
      metrics: { recommendations: auto.length, total_patterns: ctx.patterns.length },
    };
  },

  execute: async (ctx) => {
    const auto = ctx.recommendations.filter((r) => r.autoExecutable && !r.applied);
    const now = Date.now();
    for (const rec of auto) {
      const pattern = ctx.patterns.find((p) => p.id === rec.patternId);
      const taskId = `LOOP-${ctx.runId}-${rec.id}`;
      useFollowUpSlice.getState().addFollowUp({
        taskId,
        taskName: rec.action,
        assignee: "operator",
        assigneeName: pattern?.source ?? "系统",
        priority: pattern?.severity === "critical" ? "critical"
          : pattern?.severity === "high" ? "high"
          : pattern?.severity === "medium" ? "medium" : "low",
        status: "pending",
        dueDate: now + 86400000,
        notes: `服务闭环自动派发 · ${rec.description}（置信度 ${rec.confidence}%）`,
        updatedAt: now,
        category: "maintenance",
      });
      ctx.createdOrders.push(taskId);
    }
    return {
      summary: ctx.createdOrders.length > 0
        ? `真实执行：生成 ${ctx.createdOrders.length} 张跟进工单（一键跟进可追踪）`
        : "无待执行项，跳过",
      details: ctx.createdOrders.length > 0
        ? ctx.createdOrders.map((id) => `工单 ${id} 已创建`)
        : ["所有建议均无需执行"],
      metrics: { executed: ctx.createdOrders.length },
    };
  },

  verify: async (ctx) => {
    // 真实等待一个 WS 推送周期（agent 默认 2s），再重读指标做前后对比
    await new Promise((r) => setTimeout(r, 2500));
    const nodes = useNodeSlice.getState().nodes;
    const after = { nodes: nodes.length, anomalies: countAnomalies(nodes) };
    const delta = ctx.before.anomalies - after.anomalies;
    return {
      summary: `验证完成：异常信号 ${ctx.before.anomalies} → ${after.anomalies}${delta > 0 ? `（减少 ${delta}）` : delta < 0 ? `（新增 ${-delta}，需关注）` : "（持平）"}`,
      details: [
        `节点数: ${ctx.before.nodes} → ${after.nodes}`,
        `异常信号: ${ctx.before.anomalies} → ${after.anomalies}`,
        `已派发工单: ${ctx.createdOrders.length} 张（待人工处置闭环）`,
      ],
      metrics: { before_anomalies: ctx.before.anomalies, after_anomalies: after.anomalies, orders: ctx.createdOrders.length },
    };
  },

  optimize: async (ctx) => {
    const rules = await idbGetAll<{ id: string; enabled?: boolean }>("alertRules").catch(() => [] as { id: string; enabled?: boolean }[]);
    const enabledCount = rules.filter((r) => r.enabled !== false).length;
    return {
      summary: `本轮闭环沉淀：${ctx.createdOrders.length} 张工单 · ${enabledCount}/${rules.length} 条告警规则生效中`,
      details: [
        `告警规则库: ${rules.length} 条（${enabledCount} 条启用）— 可在「告警规则」中按本轮结果调整阈值`,
        `跟进工单: ${ctx.createdOrders.length} 张已入「一键跟进」队列`,
        ctx.patterns.length === 0 && ctx.createdOrders.length === 0
          ? "系统健康，建议保持当前阈值策略"
          : "建议复盘本轮异常模式，优化对应告警阈值",
      ],
      metrics: { rules_total: rules.length, rules_enabled: enabledCount, orders_created: ctx.createdOrders.length },
    };
  },
};

// ============================================================
// 数据流连线（真实链路描述，替代假带宽数字）
// ============================================================

export const DATA_FLOW_EDGES: DataFlowEdge[] = [
  {
    from: "device",
    to: "storage",
    label: "指标采集",
    bandwidth: "WS 推送 · 2s/帧",
    active: true,
  },
  {
    from: "storage",
    to: "dashboard",
    label: "数据查询",
    bandwidth: "IndexedDB 本地",
    active: true,
  },
  {
    from: "dashboard",
    to: "device",
    label: "控制指令",
    bandwidth: "PUT /rules",
    active: true,
  },
  {
    from: "dashboard",
    to: "terminal",
    label: "CLI / IDE",
    bandwidth: "本地进程",
    active: true,
  },
  {
    from: "terminal",
    to: "device",
    label: "脚本执行",
    bandwidth: "yyc3-agent",
    active: true,
  },
  {
    from: "storage",
    to: "terminal",
    label: "日志/报告",
    bandwidth: "本地导出",
    active: true,
  },
];

export const DATA_FLOW_NODES: DataFlowNode[] = [
  { type: "device",    label: "本地设备",       sublabel: "yyc3-agent · 本机", color: "#00d4ff" },
  { type: "storage",   label: "本地存储",       sublabel: "localStorage + IndexedDB", color: "#7b2ff7" },
  { type: "dashboard", label: "YYC³ Dashboard", sublabel: "React + PWA",   color: "#00ff88" },
  { type: "terminal",  label: "终端集成",       sublabel: "CLI",            color: "#ffaa00" },
];

// ============================================================
// Hook
// ============================================================

const ALL_STAGES: LoopStage[] = ["monitor", "analyze", "decide", "execute", "verify", "optimize"];

function createEmptyStages(): StageResult[] {
  return ALL_STAGES.map((s) => ({
    stage: s,
    status: "idle" as StageStatus,
    startedAt: null,
    completedAt: null,
    duration: null,
    summary: "",
    details: [],
  }));
}

let runIdCounter = 0;

export function useServiceLoop() {
  const [currentRun, setCurrentRun] = useState<LoopRun | null>(null);
  const {
    items: history,
    prepend: prependHistory,
    clear: clearHistoryStore,
    loaded: historyLoaded,
  } = usePersistedList<LoopRun>("loopHistory");
  const [isRunning, setIsRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const abortRef = useRef(false);

  // 当前阶段索引
  const currentStageIndex = useMemo(() => {
    if (!currentRun) {return -1;}
    return ALL_STAGES.indexOf(currentRun.currentStage);
  }, [currentRun]);

  // 运行历史统计
  const stats = useMemo(() => ({
    totalRuns: history.length,
    successRuns: history.filter((r) => r.overallStatus === "completed").length,
    errorRuns: history.filter((r) => r.overallStatus === "error").length,
    avgDuration: history.length > 0
      ? Math.round(
          history
            .filter((r) => r.completedAt)
            .reduce((acc, r) => acc + ((r.completedAt! - r.startedAt) || 0), 0) /
          Math.max(history.filter((r) => r.completedAt).length, 1)
        )
      : 0,
  }), [history]);

  // 执行单个阶段（真实执行器，verify 阶段内含真实等待）
  const runStage = useCallback(
    async (run: LoopRun, stageIndex: number, ctx: LoopContext): Promise<LoopRun> => {
      const stage = ALL_STAGES[stageIndex];
      const now = Date.now();

      // 设置阶段为 running
      const updatedStages = [...run.stages];
      updatedStages[stageIndex] = {
        ...updatedStages[stageIndex],
        status: "running",
        startedAt: now,
      };

      const updatedRun: LoopRun = {
        ...run,
        currentStage: stage,
        stages: updatedStages,
      };
      setCurrentRun(updatedRun);

      if (abortRef.current) {
        throw new Error("ABORTED");
      }

      // 真实执行（无模拟延迟）
      const realResult = await REAL_STAGE_EXECUTORS[stage](ctx);
      const completedAt = Date.now();

      if (abortRef.current) {
        throw new Error("ABORTED");
      }

      updatedStages[stageIndex] = {
        stage,
        status: "completed",
        startedAt: now,
        completedAt,
        duration: completedAt - now,
        summary: realResult.summary ?? "",
        details: realResult.details ?? [],
        metrics: realResult.metrics,
      };

      const nextRun: LoopRun = {
        ...updatedRun,
        stages: updatedStages,
      };
      setCurrentRun(nextRun);
      return nextRun;
    },
    []
  );

  // 执行完整闭环
  const startLoop = useCallback(
    async (trigger: "manual" | "auto" | "alert" = "manual") => {
      if (isRunning) {return;}

      abortRef.current = false;
      setIsRunning(true);

      const runId = `loop-${++runIdCounter}-${Date.now()}`;
      const ctx: LoopContext = {
        runId,
        before: { nodes: 0, anomalies: 0 },
        patterns: [],
        recommendations: [],
        createdOrders: [],
      };
      let run: LoopRun = {
        id: runId,
        startedAt: Date.now(),
        completedAt: null,
        trigger,
        currentStage: "monitor",
        stages: createEmptyStages(),
        overallStatus: "running",
      };
      setCurrentRun(run);

      toast.info("🔄 闭环流程已启动", {
        description: `触发方式: ${trigger === "manual" ? "手动" : trigger === "auto" ? "自动" : "告警"}`,
      });

      try {
        for (let i = 0; i < ALL_STAGES.length; i++) {
          run = await runStage(run, i, ctx);
        }

        run = {
          ...run,
          completedAt: Date.now(),
          overallStatus: "completed",
        };
        setCurrentRun(run);
        await prependHistory(run);
        toast.success("✅ 闭环流程完成", {
          description: `总耗时 ${((run.completedAt! - run.startedAt) / 1000).toFixed(1)}s`,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "ABORTED") {
          run = { ...run, overallStatus: "error", completedAt: Date.now() };
          setCurrentRun(run);
          toast.info("闭环流程已中止");
        } else {
          run = { ...run, overallStatus: "error", completedAt: Date.now() };
          setCurrentRun(run);
          await prependHistory(run);
          toast.error("闭环流程出错");
        }
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, runStage, prependHistory]
  );

  // 中止
  const abortLoop = useCallback(() => {
    abortRef.current = true;
  }, []);

  // 清空历史
  const clearHistory = useCallback(() => {
    clearHistoryStore();
    toast.info("历史记录已清空");
  }, [clearHistoryStore]);

  return {
    currentRun,
    history,
    isRunning,
    autoMode,
    setAutoMode,
    currentStageIndex,
    stats,
    historyLoaded,
    startLoop,
    abortLoop,
    clearHistory,
    stageMeta: STAGE_META,
    dataFlowNodes: DATA_FLOW_NODES,
    dataFlowEdges: DATA_FLOW_EDGES,
  };
}