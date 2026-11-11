/**
 * @file: useOperationCenter.ts
 * @description: 操作中心状态管理 Hook · 管理操作分类、快速操作、模板、日志流
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-02-26
 * @updated: 2026-04-09
 * @status: active
 * @tags: [hook],[operation-center],[management]
 *
 * @brief: 操作中心状态管理
 *
 * @details:
 * - 管理操作分类和快速操作
 * - 操作模板配置
 * - 操作日志流管理
 * - 操作状态跟踪
 *
 * @dependencies: React, toast
 * @exports: useOperationCenter
 * @notes: 使用 usePersistedList 持久化操作日志
 */

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { usePersistedList } from "./usePersistedState";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";
import type {
  OperationCategoryType,
  OperationCategoryMeta,
  OperationItem,
  OperationTemplateItem,
  OperationLogEntry,
  OperationStatus,
  LogFilterType,
} from "../types";

// ============================================================
// Category Meta
// ============================================================

export const CATEGORY_META: OperationCategoryMeta[] = [
  { key: "node",   label: "节点操作", icon: "Server",   color: "#00d4ff" },
  { key: "model",  label: "模型操作", icon: "Brain",    color: "#aa55ff" },
  { key: "task",   label: "任务操作", icon: "ListTodo", color: "#00ff88" },
  { key: "system", label: "系统操作", icon: "Settings", color: "#ffaa00" },
  { key: "custom", label: "自定义",   icon: "Puzzle",   color: "#ff6699" },
];

// ============================================================
// Mock Quick Actions — 运维能力目录（非用户数据，等同路由/菜单定义）
// 其中 REAL_ACTIONS 已接入真实执行；其余为演示模式动作（demoMode 开启时可演练）
// ============================================================

const QUICK_ACTIONS: OperationItem[] = [
  { id: "qa1", category: "node",   label: "重启节点",  description: "重启指定 GPU 计算节点",        icon: "RotateCw",    status: "pending" },
  { id: "qa2", category: "model",  label: "部署模型",  description: "部署新模型到指定节点",          icon: "Upload",      status: "pending" },
  { id: "qa3", category: "system", label: "清理缓存",  description: "清理推理缓存和临时文件",        icon: "Trash2",      status: "pending" },
  { id: "qa4", category: "system", label: "导出日志",  description: "导出系统日志到本地文件",        icon: "Download",    status: "pending" },
  { id: "qa5", category: "system", label: "生成报告",  description: "生成系统性能报告 (JSON/PDF)",   icon: "FileText",    status: "pending" },
  { id: "qa6", category: "node",   label: "批量重启",  description: "批量重启所有异常节点",          icon: "RefreshCw",   status: "pending", dangerous: true },
  { id: "qa7", category: "model",  label: "模型迁移",  description: "将模型迁移到负载更低的节点",     icon: "ArrowRightLeft", status: "pending" },
  { id: "qa8", category: "task",   label: "暂停队列",  description: "暂停推理任务队列",              icon: "Pause",       status: "pending" },
  { id: "qa9", category: "task",   label: "恢复队列",  description: "恢复推理任务队列",              icon: "Play",        status: "pending" },
  { id: "qa10", category: "node",  label: "健康检查",  description: "对所有节点执行健康检查",        icon: "HeartPulse",  status: "pending" },
  { id: "qa11", category: "system",label: "备份配置",  description: "备份当前系统配置到本地",        icon: "HardDrive",   status: "pending" },
  { id: "qa12", category: "custom",label: "自定义脚本",description: "执行自定义运维脚本",           icon: "Terminal",    status: "pending" },
];

// ============================================================
// 模板与日志（零硬编码种子 2026-11-11）
// 模板/日志均为用户可编辑数据，禁止内置假种子；
// 历史版本持久化在 IndexedDB 的假数据按已知 ID 一次性清除。
// ============================================================

const LEGACY_TEMPLATE_IDS = new Set(["tpl1", "tpl2", "tpl3"]);
const LEGACY_LOG_IDS = new Set(
  Array.from({ length: 12 }, (_, i) => `log-${1000 + i}`),
);

// ============================================================
// 真实动作执行器（2026-11-11）
// qa10 健康检查 / qa4 导出日志 / qa5 生成报告 / qa11 备份配置
// 均为真实能力：直接读 SSOT / 调 agent /healthz / 本地下载，无模拟
// ============================================================

import { deriveAgentHttpBase } from "../lib/agent-rules-sync";
import { getAPIConfig } from "../lib/api-config";
import { useLogSlice } from "../store/slices/log-slice";
import { useNodeSlice } from "../store/slices/node-slice";
import { useFollowUpSlice } from "../store/slices/follow-up-slice";

/** 真实动作 ID 集合 */
export const REAL_ACTION_IDS = new Set(["qa10", "qa4", "qa5", "qa11"]);

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface RealActionResult {
  ok: boolean;
  note: string;
}

async function runHealthCheck(): Promise<RealActionResult> {
  const base = deriveAgentHttpBase(getAPIConfig().wsEndpoint);
  if (!base) {
    return { ok: false, note: "未配置 WS 端点 — 请到「系统设置 → WebSocket」配置" };
  }
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${base}/healthz`, { signal: controller.signal });
    const rtt = Math.round(performance.now() - started);
    if (!res.ok) { return { ok: false, note: `agent 返回 HTTP ${res.status}` }; }
    const health = await res.json();
    return {
      ok: true,
      note: `agent 在线（${health.nodeId}）· RTT ${rtt}ms · WS 客户端 ${health.clients} · 规则 ${health.rules} 条 · 运行 ${health.uptimeSec}s`,
    };
  } catch {
    return { ok: false, note: "agent 不可达 — 请确认 yyc3-agent 已启动（pnpm agent）" };
  } finally {
    clearTimeout(timer);
  }
}

function runExportLogs(): RealActionResult {
  const logs = useLogSlice.getState().logs;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadJson(`yyc3-logs-${stamp}.json`, { exportedAt: Date.now(), count: logs.length, logs });
  return { ok: true, note: `已导出 ${logs.length} 条日志` };
}

function runGenerateReport(): RealActionResult {
  const nodes = useNodeSlice.getState().nodes;
  const followUps = useFollowUpSlice.getState().followUps;
  const pending = followUps.filter((f) => f.status === "pending");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadJson(`yyc3-report-${stamp}.json`, {
    generatedAt: Date.now(),
    nodes: nodes.map((n) => ({ id: n.id, status: n.status, mem: n.mem, tasks: n.tasks, model: n.model })),
    alerts: { total: followUps.length, pending: pending.length },
    pendingWorkOrders: pending.map((f) => ({ taskId: f.taskId, taskName: f.taskName, priority: f.priority })),
  });
  return { ok: true, note: `报告已生成：${nodes.length} 节点 · ${pending.length} 待办工单` };
}

function runBackupConfig(): RealActionResult {
  const values = useSettingsSSOT.getState().values;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadJson(`yyc3-config-backup-${stamp}.json`, {
    backedUpAt: Date.now(),
    settings: { ...values, wsToken: values.wsToken ? "***（已脱敏）" : "", aiApiKey: values.aiApiKey ? "***（已脱敏）" : "" },
    apiEndpoints: getAPIConfig(),
  });
  return { ok: true, note: "配置备份已导出（令牌字段已脱敏）" };
}

const REAL_EXECUTORS: Record<string, () => Promise<RealActionResult> | RealActionResult> = {
  qa10: runHealthCheck,
  qa4: runExportLogs,
  qa5: runGenerateReport,
  qa11: runBackupConfig,
};

// ============================================================
// Hook
// ============================================================

export function useOperationCenter() {
  // 演示模式总开关（Settings SSOT）：关闭时演示动作不执行
  const demoMode = useSettingsSSOT((s) => s.toggles.demoMode);
  const [activeCategory, setActiveCategory] = useState<OperationCategoryType | "all">("all");
  const [actions, setActions] = useState<OperationItem[]>(QUICK_ACTIONS);
  const {
    items: templates,
    upsert: upsertTemplate,
    remove: removeTemplate,
    setAll: setAllTemplates,
    loaded: templatesLoaded,
  } = usePersistedList<OperationTemplateItem>("operationTemplates", []);
  const {
    items: logs,
    prepend: prependLog,
    setAll: setAllLogs,
    loaded: logsLoaded,
  } = usePersistedList<OperationLogEntry>("operationLogs", []);
  const [logFilter, setLogFilter] = useState<LogFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  // ── 历史假种子一次性清除（IndexedDB 加载完成后执行） ──
  useEffect(() => {
    if (!templatesLoaded) {return;}
    if (templates.some((t) => LEGACY_TEMPLATE_IDS.has(t.id))) {
      void setAllTemplates(templates.filter((t) => !LEGACY_TEMPLATE_IDS.has(t.id)));
    }
  }, [templatesLoaded, templates, setAllTemplates]);

  useEffect(() => {
    if (!logsLoaded) {return;}
    if (logs.some((l) => LEGACY_LOG_IDS.has(l.id))) {
      void setAllLogs(logs.filter((l) => !LEGACY_LOG_IDS.has(l.id)));
    }
  }, [logsLoaded, logs, setAllLogs]);

  // Filtered actions
  const filteredActions = activeCategory === "all"
    ? actions
    : actions.filter((a) => a.category === activeCategory);

  // Filtered logs（演示模式关闭时不展示模拟日志种子，持久化数据保留）
  const filteredLogs = (() => {
    let result = demoMode ? logs : logs.filter((l) => !LEGACY_LOG_IDS.has(l.id));
    if (logFilter === "byCategory" && activeCategory !== "all") {
      result = result.filter((l) => l.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) => l.action.toLowerCase().includes(q) || l.user.toLowerCase().includes(q)
      );
    }
    return result;
  })();

  // Execute an action
  const executeAction = useCallback(async (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    if (!action) {return;}

    const realExecutor = REAL_EXECUTORS[actionId];
    if (!realExecutor && !demoMode) {
      toast.info(`「${action.label}」需要接入对应服务端能力（演示模式下可演练，请在系统设置中开启）`);
      return;
    }

    setIsExecuting(actionId);
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: "running" as const } : a))
    );

    let finalStatus: OperationStatus;
    let duration: number;
    let note = "";

    if (realExecutor) {
      // ── 真实动作：实测耗时与结果 ──
      const started = performance.now();
      try {
        const result = await realExecutor();
        finalStatus = result.ok ? "success" : "failed";
        note = result.note;
      } catch (err) {
        finalStatus = "failed";
        note = err instanceof Error ? err.message : String(err);
      }
      duration = Math.round(performance.now() - started);
    } else {
      // ── 演示动作：仅在演示模式下演练 ──
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000));
      const success = Math.random() > 0.15;
      finalStatus = success ? "success" : "failed";
      duration = 1500 + Math.floor(Math.random() * 2000);
    }

    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: finalStatus } : a))
    );

    // Add log entry
    const newLog: OperationLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      category: action.category,
      action: note ? `${action.label} — ${note}` : action.label,
      user: "admin",
      status: finalStatus,
      duration,
    };
    await prependLog(newLog);
    setIsExecuting(null);

    if (finalStatus === "success") {
      toast.success(`${action.label} 执行成功`, note ? { description: note } : undefined);
    } else {
      toast.error(`${action.label} 执行失败`, { description: note || "请检查日志获取详情" });
    }

    // Reset status after 3s
    setTimeout(() => {
      setActions((prev) =>
        prev.map((a) => (a.id === actionId ? { ...a, status: "pending" as const } : a))
      );
    }, 3000);
  }, [actions, demoMode, prependLog]);

  // Run template
  const runTemplate = useCallback(async (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) {return;}

    if (!demoMode) {
      toast.info("演示模式已关闭：模板执行需要接入真实运维通道，请在系统设置中开启演示模式查看效果");
      return;
    }

    await upsertTemplate({ ...tpl, lastUsed: Date.now() });

    toast.info(`正在执行模板：${tpl.name}`, { description: `共 ${tpl.steps.length} 步` });

    // Simulate execution
    for (let i = 0; i < tpl.steps.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      const log: OperationLogEntry = {
        id: `log-tpl-${Date.now()}-${i}`,
        timestamp: Date.now(),
        category: tpl.category,
        action: `[${tpl.name}] ${tpl.steps[i]}`,
        user: "admin",
        status: "success",
        duration: 500 + Math.floor(Math.random() * 1500),
      };
      await prependLog(log);
    }

    toast.success(`模板「${tpl.name}」执行完成`);
  }, [templates, demoMode, upsertTemplate, prependLog]);

  // Add new template
  const addTemplate = useCallback((name: string, description: string, category: OperationCategoryType, steps: string[]) => {
    const newTpl: OperationTemplateItem = {
      id: `tpl-${Date.now()}`,
      name,
      description,
      category,
      steps,
      createdAt: Date.now(),
    };
    upsertTemplate(newTpl);
    toast.success(`模板「${name}」已创建`);
  }, [upsertTemplate]);

  // Delete template
  const deleteTemplate = useCallback((templateId: string) => {
    removeTemplate(templateId);
    toast.info("模板已删除");
  }, [removeTemplate]);

  return {
    // Category
    categories: CATEGORY_META,
    activeCategory,
    setActiveCategory,
    // Actions
    actions: filteredActions,
    allActions: actions,
    isExecuting,
    executeAction,
    // Templates
    templates,
    templatesLoaded,
    runTemplate,
    addTemplate,
    deleteTemplate,
    // Logs
    logs: filteredLogs,
    allLogs: demoMode ? logs : logs.filter((l) => !LEGACY_LOG_IDS.has(l.id)),
    logsLoaded,
    logFilter,
    setLogFilter,
    searchQuery,
    setSearchQuery,
  };
}