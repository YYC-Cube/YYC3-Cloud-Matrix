/**
 * @file: useLocalFileSystem.ts
 * @description: 本地文件系统 Hook — agent 真实文件浏览 + 真实日志/报告/备份
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-08
 * @updated: 2026-11-11
 * @status: active
 * @tags: [hook],[filesystem],[agent]
 *
 * @brief: 文件管理面板全真化（2026-11-11 重写）
 *
 * @details:
 * - 文件浏览/读写：通过 yyc3-agent HTTP 端点（/files, /files/content）访问
 *   白名单根目录 ~/.yyc3-cloud-matrix，令牌与 WS 共用（settings wsToken）；
 *   agent 不可达时列表为空并标记 agentReachable=false，绝不回退假数据
 * - 日志：直连 log-slice SSOT（WS 告警/审计真实写入），原 mock 日志已删除
 * - 报告：从 node-slice / follow-up-slice / log-slice 真实统计生成
 * - 快速操作：downloadLogs=真实 JSON 导出；executeBackup=full-backup 全量导出；
 *   clearCache=清空 IndexedDB inference_cache + sessionStorage
 * - 历史假文件树（fs-slice.persist 残留）挂载时一次性清除
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { env } from "../lib/env-config";
import { getAPIConfig } from "../lib/api-config";
import { deriveAgentHttpBase } from "../lib/agent-rules-sync";
import { idbClear, idbCount } from "../lib/yyc3-storage";
import { downloadFullBackup } from "../lib/full-backup";
import { useFSSlice } from "../store/slices/fs-slice";
import { useLogSlice } from "../store/slices/log-slice";
import { useNodeSlice } from "../store/slices/node-slice";
import { useFollowUpSlice } from "../store/slices/follow-up-slice";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";
import type {
  FileItem,
  LogLevel,
  ReportConfig,
  ReportResult,
  ReportFormat,
} from "../types";

// ============================================================
// 常量与路径工具
// ============================================================

/** agent 白名单根目录的展示标签（与 agent/yyc3-agent.mjs FILE_ROOT 对齐） */
export const AGENT_FS_ROOT_LABEL = "~/.yyc3-cloud-matrix";

/** 展示路径 → agent 相对路径 */
function toRelPath(displayPath: string): string {
  if (displayPath === AGENT_FS_ROOT_LABEL) { return ""; }
  return displayPath.slice(AGENT_FS_ROOT_LABEL.length + 1);
}

function extensionOf(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(idx + 1) : "";
}

// ============================================================
// agent HTTP 访问（令牌与 WS 共用；不可达返回 null，绝不造假）
// ============================================================

async function agentFetch(path: string, init?: RequestInit): Promise<Response | null> {
  const token = useSettingsSSOT.getState().values.wsToken?.trim();
  if (!token) { return null; }
  const base = deriveAgentHttpBase(getAPIConfig().wsEndpoint);
  if (!base) { return null; }
  const sep = path.includes("?") ? "&" : "?";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    return await fetch(`${base}${path}${sep}token=${encodeURIComponent(token)}`, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface AgentDirEntry {
  name: string;
  type: "file" | "directory";
  size?: number;
  modifiedAt: number;
}

// ============================================================
// 报告生成（真实数据源：node-slice + follow-up-slice + log-slice）
// ============================================================

function buildReportPreview(config: ReportConfig): string {
  const sysName = useSettingsSSOT.getState().values.systemName || env("SYSTEM_NAME");
  const { nodes, derived } = useNodeSlice.getState();
  const followUps = useFollowUpSlice.getState().followUps;
  const logs = useLogSlice.getState().logs;

  const pendingTasks = followUps.filter((f) => f.status !== "completed").length;
  const errorLogs = logs.filter((l) => l.level === "error" || l.level === "fatal").length;
  const warnLogs = logs.filter((l) => l.level === "warn").length;
  const generatedAt = new Date().toISOString();

  const typeLabel = { performance: "性能", health: "健康", security: "安全", custom: "自定义" }[config.type];
  const dateLabel = { today: "今日", week: "本周", month: "本月", custom: "自定义" }[config.dateRange];

  const nodeRows = nodes.map((n) => ({
    id: n.id, status: n.status, gpu: n.gpu, mem: n.mem, temp: n.temp, model: n.model, tasks: n.tasks,
  }));

  if (config.format === "json") {
    return JSON.stringify({
      report: { type: config.type, dateRange: config.dateRange, generatedAt, system: sysName },
      summary: {
        nodes: `${derived.activeCount}/${derived.totalCount}`,
        avgGpu: derived.avgGpu,
        avgMem: derived.avgMem,
        avgTemp: derived.avgTemp,
        totalTasks: derived.totalTasks,
        pendingFollowUps: pendingTasks,
        errorLogs,
        warnLogs,
      },
      nodes: nodeRows,
    }, null, 2);
  }

  if (config.format === "markdown") {
    const nodeLines = nodes.length > 0
      ? nodes.map((n) => `- ${n.status === "inactive" ? "⚪" : n.status === "warning" ? "⚠️" : "✅"} ${n.id}: GPU ${n.gpu}%, 内存 ${n.mem}%, ${n.temp}°C${n.model ? ` · ${n.model}` : ""}`).join("\n")
      : "- （暂无在线节点）";
    return `# ${sysName} ${typeLabel}报告\n\n> 范围: ${dateLabel} | 生成时间: ${new Date().toLocaleString("zh-CN")}\n\n## 概览\n\n| 指标 | 值 |\n|------|------|\n| 在线节点 | ${derived.activeCount}/${derived.totalCount} |\n| 平均 GPU | ${derived.avgGpu}% |\n| 平均内存 | ${derived.avgMem}% |\n| 平均温度 | ${derived.avgTemp}°C |\n| 运行任务 | ${derived.totalTasks} |\n| 待办工单 | ${pendingTasks} |\n| 错误日志 | ${errorLogs} |\n| 警告日志 | ${warnLogs} |\n\n## 节点状态\n\n${nodeLines}\n`;
  }

  // csv
  const header = "node,status,gpu,mem,temp,model,tasks";
  const rows = nodeRows.map((n) => `${n.id},${n.status},${n.gpu},${n.mem},${n.temp},${n.model || "-"},${n.tasks}`);
  return [`# ${sysName} ${typeLabel}报告 ${generatedAt}`, header, ...rows].join("\n");
}

// ============================================================
// Hook
// ============================================================

export function useLocalFileSystem() {
  const [currentPath, setCurrentPath] = useState<string>(AGENT_FS_ROOT_LABEL);
  const [currentItems, setCurrentItems] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isListing, setIsListing] = useState(false);
  /** null=尚未探测；false=agent 不可达/未配置令牌 */
  const [agentReachable, setAgentReachable] = useState<boolean | null>(null);

  const [logLevelFilter, setLogLevelFilter] = useState<LogLevel | "all">("all");
  const [logSourceFilter, setLogSourceFilter] = useState<string>("all");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [reports, setReports] = useState<ReportResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 真实日志 SSOT
  const allLogs = useLogSlice((s) => s.logs);

  // 一次性清除历史假文件树/假内容缓存（fs-slice persist 残留）
  useEffect(() => {
    const s = useFSSlice.getState();
    if (s.fileTree !== null || Object.keys(s.fileContents).length > 0) {
      useFSSlice.setState({ fileTree: null, fileContents: {} });
    }
  }, []);

  // ═══ 目录浏览（agent 真实拉取） ═══

  const refresh = useCallback(async () => {
    setIsListing(true);
    const res = await agentFetch(`/files?path=${encodeURIComponent(toRelPath(currentPath))}`);
    if (!res) {
      setAgentReachable(false);
      setCurrentItems([]);
      setIsListing(false);
      return;
    }
    const data = await res.json().catch(() => null) as
      | { ok: boolean; type?: string; entries?: AgentDirEntry[] }
      | null;
    if (!res.ok || !data?.ok || data.type !== "dir" || !Array.isArray(data.entries)) {
      setAgentReachable(res.ok ? true : false);
      setCurrentItems([]);
      setIsListing(false);
      return;
    }
    setAgentReachable(true);
    setCurrentItems(data.entries.map((e) => ({
      id: `${currentPath}/${e.name}`,
      name: e.name,
      type: e.type,
      size: e.size,
      modifiedAt: Math.round(e.modifiedAt),
      path: `${currentPath}/${e.name}`,
      extension: e.type === "file" ? extensionOf(e.name) : undefined,
    })));
    setIsListing(false);
  }, [currentPath]);

  useEffect(() => { void refresh(); }, [refresh]);

  // ═══ 导航 ═══

  const breadcrumbs = useMemo(() => {
    const parts = currentPath.replace(AGENT_FS_ROOT_LABEL, "").split("/").filter(Boolean);
    const crumbs = [{ label: AGENT_FS_ROOT_LABEL, path: AGENT_FS_ROOT_LABEL }];
    let acc = AGENT_FS_ROOT_LABEL;
    for (const p of parts) {
      acc += `/${p}`;
      crumbs.push({ label: p, path: acc });
    }
    return crumbs;
  }, [currentPath]);

  const navigateTo = useCallback((path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
  }, []);

  const selectFile = useCallback((file: FileItem) => {
    if (file.type === "directory") {
      navigateTo(file.path);
    } else {
      setSelectedFile(file);
    }
  }, [navigateTo]);

  const goUp = useCallback(() => {
    if (currentPath === AGENT_FS_ROOT_LABEL) { return; }
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
    setSelectedFile(null);
  }, [currentPath]);

  // ═══ 日志（log-slice SSOT，真实写入源） ═══

  const filteredLogs = useMemo(() => {
    let result = allLogs;
    if (logLevelFilter !== "all") { result = result.filter((l) => l.level === logLevelFilter); }
    if (logSourceFilter !== "all") { result = result.filter((l) => l.source === logSourceFilter); }
    if (logSearchQuery) {
      const q = logSearchQuery.toLowerCase();
      result = result.filter((l) => l.message.toLowerCase().includes(q) || l.source.toLowerCase().includes(q));
    }
    return result;
  }, [allLogs, logLevelFilter, logSourceFilter, logSearchQuery]);

  const logSources = useMemo(() => Array.from(new Set(allLogs.map((l) => l.source))), [allLogs]);

  // ═══ 报告（真实统计） ═══

  const generateReport = useCallback(async (config: ReportConfig) => {
    setIsGenerating(true);
    const preview = buildReportPreview(config);
    const typeLabel = { performance: "性能", health: "健康", security: "安全", custom: "自定义" }[config.type];
    const extMap: Record<ReportFormat, string> = { json: "json", markdown: "md", csv: "csv" };

    const report: ReportResult = {
      id: `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      config,
      generatedAt: Date.now(),
      filename: `yyc3-${config.type}-${new Date().toISOString().slice(0, 10)}.${extMap[config.format]}`,
      size: new TextEncoder().encode(preview).length,
      previewContent: preview,
    };

    setReports((prev) => [report, ...prev]);
    setIsGenerating(false);
    toast.success(`${typeLabel}报告已生成（真实数据）`);
    return report;
  }, []);

  // ═══ 工具 ═══

  const formatSize = useCallback((bytes?: number): string => {
    if (bytes === null || bytes === undefined) { return "--"; }
    if (bytes < 1024) { return `${bytes}B`; }
    if (bytes < 1048576) { return `${(bytes / 1024).toFixed(1)}KB`; }
    return `${(bytes / 1048576).toFixed(1)}MB`;
  }, []);

  /** 真实导出 log-slice 日志为 JSON 文件 */
  const downloadLogs = useCallback(() => {
    const logs = useLogSlice.getState().logs;
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), count: logs.length, logs }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yyc3-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${logs.length} 条日志`);
  }, []);

  /** 真实全量备份（localStorage + IndexedDB + globalStore） */
  const executeBackup = useCallback(async () => {
    toast.info("正在导出全量备份…");
    try {
      await downloadFullBackup();
      toast.success("全量备份已导出");
    } catch {
      toast.error("备份导出失败");
    }
  }, []);

  /** 真实清理：IndexedDB inference_cache + sessionStorage */
  const clearCache = useCallback(async () => {
    toast.info("正在清理缓存…");
    let count = 0;
    try {
      count = await idbCount("inference_cache");
      await idbClear("inference_cache");
    } catch { /* IndexedDB 不可用时仍继续清理会话存储 */ }
    try { sessionStorage.clear(); } catch { /* ignore */ }
    toast.success(`缓存已清理（推理缓存 ${count} 条 + 会话存储）`);
  }, []);

  // ═══ 文件内容读写（agent 真实读写，fileId 即展示路径） ═══

  const getFileContent = useCallback(async (fileId: string): Promise<string> => {
    const res = await agentFetch(`/files/content?path=${encodeURIComponent(toRelPath(fileId))}`);
    if (!res || !res.ok) { return ""; }
    const data = await res.json().catch(() => null) as { ok: boolean; content?: string } | null;
    return data?.ok && typeof data.content === "string" ? data.content : "";
  }, []);

  const saveFileContent = useCallback(async (fileId: string, content: string): Promise<boolean> => {
    const res = await agentFetch("/files/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: toRelPath(fileId), content }),
    });
    const data = res ? await res.json().catch(() => null) as { ok: boolean } | null : null;
    if (res?.ok && data?.ok) {
      toast.success("文件已保存");
      void refresh();
      return true;
    }
    toast.error("保存失败：agent 不可达或写入被拒绝");
    return false;
  }, [refresh]);

  return {
    currentPath, currentItems, breadcrumbs, selectedFile,
    navigateTo, selectFile, goUp, formatSize,
    refresh, isListing, agentReachable,
    // 文件内容
    getFileContent, saveFileContent,
    // 日志
    logs: filteredLogs, allLogs,
    logLevelFilter, setLogLevelFilter,
    logSourceFilter, setLogSourceFilter,
    logSearchQuery, setLogSearchQuery, logSources,
    // 报告
    reports, isGenerating, generateReport,
    // 快速操作
    downloadLogs, executeBackup, clearCache,
  };
}
