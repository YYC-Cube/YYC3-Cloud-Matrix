/**
 * @file: FamilyCluster.tsx
 * @description: AI Family - 全球空间通信基站管理面板 (统一UI风格)
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-15
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, cluster, dashboard]
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Server, Wifi, Activity, Terminal, ListTodo,
  Globe, Cpu, HardDrive, MemoryStick, Zap,
  Shield, ArrowUpRight, ArrowDownRight, Clock,
  Radio, Plug, Network, ChevronRight, Cloud,
} from "lucide-react";
import { GlassCard } from "../../shared/GlassCard";
import { FadeIn } from "./FadeIn";
import { useI18n } from "../../../hooks/useI18n";
import { NEON_CYAN, NEON_PINK, hexToRgb } from "./shared";

import { YYC3ClusterManager } from "../../../lib/yyc3-cluster-manager";
import type {
  YYC3ClusterNode,
  NodeStatus,
  ClusterStatistics,
  DistributedTask,
  SSHSession,
  YYC3DeviceRole,
} from "../../../lib/yyc3-cluster.types";

type ClusterTab = "overview" | "nodes" | "network" | "tasks" | "sessions";

interface NodeCardData {
  deviceId: string;
  hostname: string;
  role: YYC3DeviceRole;
  chipType: string;
  status: NodeStatus;
  ip: string;
  cpuCores: number;
  memoryGB: number;
  storageTB: number;
  capabilities: string[];
  tags: string[];
}

const TAB_CONFIG: { key: ClusterTab; icon: React.ElementType; labelKey: string }[] = [
  { key: "overview", icon: Activity, labelKey: "cluster.tabOverview" },
  { key: "nodes", icon: Server, labelKey: "cluster.tabNodes" },
  { key: "network", icon: Network, labelKey: "cluster.tabNetwork" },
  { key: "tasks", icon: ListTodo, labelKey: "cluster.tabTasks" },
  { key: "sessions", icon: Terminal, labelKey: "cluster.tabSessions" },
];

const ROLE_ICON_MAP: Record<string, React.ElementType> = {
  flagship: Shield,
  development: Cpu,
  collaboration: Globe,
  "family-station": Wifi,
  mobile: Radio,
  "cloud-node": Cloud,
  storage: HardDrive,
  gateway: Plug,
};

const ROLE_LABEL_MAP: Record<string, string> = {
  flagship: "旗舰主机",
  development: "开发机",
  collaboration: "协作终端",
  "family-station": "家庭站",
  mobile: "移动站",
  "cloud-node": "云端节点",
  storage: "存储中心",
  gateway: "网关/路由",
};

const STATUS_COLOR_MAP: Record<NodeStatus, { bg: string; text: string; dot: string }> = {
  online: { bg: "rgba(0,255,136,0.1)", text: "#00FF88", dot: "#00FF88" },
  offline: { bg: "rgba(128,128,128,0.1)", text: "#808080", dot: "#808080" },
  maintenance: { bg: "rgba(255,180,0,0.1)", text: "#FFB400", dot: "#FFB400" },
  error: { bg: "rgba(255,68,68,0.1)", text: "#FF4444", dot: "#FF4444" },
  decommissioned: { bg: "rgba(100,100,120,0.08)", text: "#646478", dot: "#646478" },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) { return "0 B"; }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatUptime(seconds?: number): string {
  if (!seconds) { return "-"; }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 48) { return `${Math.floor(h / 24)}d ${h % 24}h`; }
  if (h > 0) { return `${h}h ${m}m`; }
  return `${m}m`;
}

export function FamilyCluster() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ClusterTab>("overview");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [manager] = useState(() => new YYC3ClusterManager());

  const [nodeList, setNodeList] = useState<NodeCardData[]>([]);
  const [stats, setStats] = useState<ClusterStatistics>({
    totalNodes: 0,
    onlineNodes: 0,
    offlineNodes: 0,
    totalCPUcores: 0,
    totalMemoryGB: 0,
    totalStorageTB: 0,
    averageUptimePercent: 0,
    totalConnections: 0,
    activeConnections: 0,
    dataTransferredTodayBytes: 0,
    lastFullSyncAt: Date.now(),
  });
  const [tasks, setTasks] = useState<DistributedTask[]>([]);
  const [sessions, setSessions] = useState<SSHSession[]>([]);

  const loadInitialData = useCallback(() => {
    const allNodes = manager.getAllNodes();
    const cards: NodeCardData[] = allNodes.map((node: YYC3ClusterNode) => ({
      deviceId: node.deviceId.fullName,
      hostname: node.hostname,
      role: node.role,
      chipType: node.chipType,
      status: node.status,
      ip: node.network.ipAddress,
      cpuCores: node.specs.cpu.cores,
      memoryGB: node.specs.memory.totalGB,
      storageTB: node.specs.storage.totalTB,
      capabilities: node.capabilities,
      tags: node.tags,
    }));
    setNodeList(cards);
    setStats(manager.getClusterStatistics());
    setTasks(manager.getTaskQueue());
    setSessions(manager.getActiveSessions());
  }, [manager]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const _selectedNode = nodeList.find((n) => n.deviceId === selectedNodeId);
  const onlineNodes = nodeList.filter((n) => n.status === "online");

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-4 md:px-6 md:py-5"
      style={{ background: "transparent" }}
    >
      <FadeIn>
        {/* ═══ Page Header ═══ */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${NEON_CYAN}20, ${NEON_PINK}15)` }}
          >
            <Radio className="w-5 h-5" style={{ color: NEON_CYAN }} />
          </div>
          <div>
            <h1 className="text-[0.95rem] font-semibold tracking-wide" style={{ color: NEON_CYAN }}>
              {t("cluster.title")}
            </h1>
            <p className="text-[0.68rem] mt-0.5" style={{ color: "rgba(196,220,240,0.45)" }}>
              {t("cluster.subtitle")}
            </p>
          </div>
        </div>

        {/* ═══ Tab Bar ═══ */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] transition-all duration-200"
                style={{
                  background: isActive ? `rgba(${hexToRgb(NEON_CYAN)},0.12)` : "rgba(8,25,55,0.5)",
                  border: `1px solid ${isActive ? `rgba(${hexToRgb(NEON_CYAN)},0.35)` : "rgba(0,180,255,0.1)"}`,
                  color: isActive ? NEON_CYAN : "rgba(196,220,240,0.55)",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* ═══ Overview Tab ═══ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: t("cluster.statTotalNodes"), value: `${stats.onlineNodes}/${stats.totalNodes}`, icon: Server, color: NEON_CYAN },
              { label: t("cluster.statCPU"), value: `${stats.totalCPUcores}`, icon: Cpu, color: "#00FF88" },
              { label: t("cluster.statMemory"), value: `${stats.totalMemoryGB} GB`, icon: MemoryStick, color: "#FF69B4" },
              { label: t("cluster.statStorage"), value: `${stats.totalStorageTB.toFixed(1)} TB`, icon: HardDrive, color: "#FFD700" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <FadeIn key={stat.label} delay={i * 60}>
                  <GlassCard className="p-4" glowColor={`${stat.color}10`}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                      <span className="text-[0.62rem]" style={{ color: "rgba(196,220,240,0.4)" }}>
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-[1.3rem] font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </GlassCard>
                </FadeIn>
              );
            })}

            {/* Network Stats */}
            <FadeIn delay={280}>
              <GlassCard className="p-4 lg:col-span-2">
                <h3 className="text-[0.75rem] font-medium mb-3 flex items-center gap-2" style={{ color: NEON_CYAN }}>
                  <Wifi className="w-3.5 h-3.5" />
                  {t("cluster.networkOverview")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t("cluster.activeConnections"), value: stats.activeConnections, icon: ArrowUpRight, color: "#00FF88" },
                    { label: t("cluster.dataTransferred"), value: formatBytes(stats.dataTransferredTodayBytes), icon: ArrowDownRight, color: NEON_PINK },
                    { label: t("cluster.avgUptime"), value: `${stats.averageUptimePercent}%`, icon: Clock, color: "#FFD700" },
                    { label: t("cluster.syncStatus"), value: t("cluster.synced"), icon: Zap, color: "#00BFFF" },
                  ].map((item) => {
                    const IIcon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(0,212,255,0.03)" }}>
                        <IIcon className="w-3.5 h-3.5" style={{ color: item.color }} />
                        <div>
                          <p className="text-[0.6rem]" style={{ color: "rgba(196,220,240,0.4)" }}>{item.label}</p>
                          <p className="text-[0.76rem] font-semibold" style={{ color: "rgba(228,240,255,0.85)" }}>{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </FadeIn>

            {/* Quick Actions */}
            <FadeIn delay={320}>
              <GlassCard className="p-4 lg:col-span-2">
                <h3 className="text-[0.75rem] font-medium mb-3 flex items-center gap-2" style={{ color: NEON_CYAN }}>
                  <Zap className="w-3.5 h-3.5" />
                  {t("cluster.quickActions")}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: t("cluster.actionHealthCheck"), icon: Activity },
                    { label: t("cluster.actionViewNodes"), icon: Server },
                    { label: t("cluster.actionViewTasks"), icon: ListTodo },
                    { label: t("cluster.actionSessions"), icon: Terminal },
                  ].map((action) => {
                    const AIcon = action.icon;
                    const targetTab: ClusterTab =
                  action.label.includes(t("cluster.actionHealthCheck")) ? "overview" :
                  action.label.includes(t("cluster.actionViewNodes")) ? "nodes" :
                  action.label.includes(t("cluster.actionViewTasks")) ? "tasks" : "sessions";
                    return (
                      <button
                        key={action.label}
                        onClick={() => setActiveTab(targetTab)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[0.68rem] transition-all duration-200"
                        style={{
                          background: "rgba(0,212,255,0.05)",
                          border: "1px solid rgba(0,212,255,0.12)",
                          color: "rgba(196,220,240,0.7)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(0,212,255,0.12)";
                          e.currentTarget.style.borderColor = `rgba(${hexToRgb(NEON_CYAN)},0.35)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(0,212,255,0.05)";
                          e.currentTarget.style.borderColor = "rgba(0,212,255,0.12)";
                        }}
                      >
                        <AIcon className="w-3.5 h-3.5" style={{ color: NEON_CYAN }} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </FadeIn>
          </div>
        )}

        {/* ═══ Nodes Tab ═══ */}
        {activeTab === "nodes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {nodeList.map((node, i) => {
              const RoleIcon = ROLE_ICON_MAP[node.role] || Server;
              const sc = STATUS_COLOR_MAP[node.status] || STATUS_COLOR_MAP.offline;
              const isSelected = selectedNodeId === node.deviceId;
              return (
                <FadeIn key={node.deviceId} delay={i * 50}>
                  <GlassCard
                    className={`p-4 cursor-pointer transition-all duration-200 ${isSelected ? "ring-1" : ""}`}
                    glowColor={isSelected ? `${NEON_CYAN}20` : undefined}
                    onClick={() => setSelectedNodeId(isSelected ? null : node.deviceId)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                          style={{ background: `rgba(${hexToRgb(NEON_CYAN)},0.08)` }}
                        >
                          <RoleIcon className="w-4 h-4" style={{ color: NEON_CYAN }} />
                        </div>
                        <div>
                          <p className="text-[0.74rem] font-medium" style={{ color: "rgba(228,240,255,0.9)" }}>
                            {node.deviceId}
                          </p>
                          <p className="text-[0.6rem]" style={{ color: "rgba(196,220,240,0.45)" }}>
                            {ROLE_LABEL_MAP[node.role] || node.role}
                          </p>
                        </div>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full mt-1"
                        style={{ background: sc.dot, boxShadow: `0 0 6px ${sc.dot}40` }}
                      />
                    </div>

                    <div className="space-y-1.5 text-[0.62rem]" style={{ color: "rgba(196,220,240,0.5)" }}>
                      <div className="flex justify-between">
                        <span>{node.chipType}</span>
                        <span style={{ color: sc.text }}>{node.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU {node.cpuCores}核</span>
                        <span>内存 {node.memoryGB}GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>存储 {node.storageTB}TB</span>
                        <span className="truncate max-w-[70px]">{node.ip}</span>
                      </div>
                    </div>

                    {isSelected && node.capabilities.length > 0 && (
                      <div className="mt-3 pt-3 flex flex-wrap gap-1" style={{ borderTop: "1px solid rgba(0,212,255,0.1)" }}>
                        {node.capabilities.slice(0, 4).map((cap) => (
                          <span key={cap} className="px-1.5 py-0.5 rounded text-[0.56rem]"
                            style={{ background: "rgba(0,212,255,0.06)", color: "rgba(196,220,240,0.6)" }}
                          >
                            {cap}
                          </span>
                        ))}
                        {node.capabilities.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[0.56rem]"
                            style={{ background: "rgba(255,180,0,0.08)", color: "#FFB400" }}
                          >
                            +{node.capabilities.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </GlassCard>
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* ═══ Network Tab ═══ */}
        {activeTab === "network" && (
          <div className="max-w-3xl space-y-3">
            <GlassCard className="p-4">
              <h3 className="text-[0.75rem] font-medium mb-3 flex items-center gap-2" style={{ color: NEON_CYAN }}>
                <Globe className="w-3.5 h-3.5" />
                {t("cluster.topology")}
              </h3>
              <div className="space-y-2">
                {nodeList.filter((n) => n.status === "online").map((node, i) => (
                  <FadeIn key={node.deviceId} delay={i * 50}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg"
                      style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.06)" }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `rgba(${hexToRgb(NEON_CYAN)},0.1)` }}
                      >
                        {(() => { const IconComp = ROLE_ICON_MAP[node.role] || Server; return <IconComp className="w-4 h-4" style={{ color: NEON_CYAN }} />; })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.7rem] font-medium" style={{ color: "rgba(228,240,255,0.85)" }}>{node.deviceId}</p>
                        <p className="text-[0.6rem]" style={{ color: "rgba(196,220,240,0.4)" }}>{node.ip} · {ROLE_LABEL_MAP[node.role]}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ArrowUpRight className="w-3 h-3" style={{ color: "#00FF88" }} />
                        <ArrowDownRight className="w-3 h-3" style={{ color: NEON_PINK }} />
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <h3 className="text-[0.75rem] font-medium mb-3 flex items-center gap-2" style={{ color: NEON_CYAN }}>
                <Plug className="w-3.5 h-3.5" />
                {t("cluster.connectionSummary")}
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-lg" style={{ background: "rgba(0,255,136,0.05)" }}>
                  <p className="text-[1.1rem] font-bold" style={{ color: "#00FF88" }}>{stats.activeConnections}</p>
                  <p className="text-[0.6rem]" style={{ color: "rgba(196,220,240,0.45)" }}>{t("cluster.activeConnections")}</p>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: "rgba(255,105,180,0.05)" }}>
                  <p className="text-[1.1rem] font-bold" style={{ color: "#FF69B4" }}>{stats.totalConnections}</p>
                  <p className="text-[0.6rem]" style={{ color: "rgba(196,220,240,0.45)" }}>{t("cluster.totalConnections")}</p>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: "rgba(0,212,255,0.05)" }}>
                  <p className="text-[1.1rem] font-bold" style={{ color: NEON_CYAN }}>{onlineNodes.length}</p>
                  <p className="text-[0.6rem]" style={{ color: "rgba(196,220,240,0.45)" }}>{t("cluster.onlineNodes")}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ═══ Tasks Tab ═══ */}
        {activeTab === "tasks" && (
          <div className="max-w-3xl space-y-2.5">
            {tasks.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <ListTodo className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(0,212,255,0.25)" }} />
                <p className="text-[0.72rem]" style={{ color: "rgba(196,220,240,0.4)" }}>
                  {t("cluster.noTasks")}
                </p>
              </GlassCard>
            ) : tasks.map((task, i) => (
              <FadeIn key={task.taskId} delay={i * 50}>
                <GlassCard className="p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.72rem] font-medium" style={{ color: "rgba(228,240,255,0.85)" }}>
                      {task.name}
                    </span>
                    <span className={`text-[0.6rem] px-2 py-0.5 rounded-full`}
                      style={{
                        background: task.status === "completed" ? "rgba(0,255,136,0.1)"
                          : task.status === "running" ? "rgba(0,180,255,0.1)"
                          : task.status === "failed" ? "rgba(255,68,68,0.1)"
                          : "rgba(196,220,240,0.08)",
                        color: task.status === "completed" ? "#00FF88"
                          : task.status === "running" ? NEON_CYAN
                          : task.status === "failed" ? "#FF4444"
                          : "rgba(196,220,240,0.55)",
                      }}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[0.64rem]" style={{ color: "rgba(196,220,240,0.45)" }}>
                    <span>📋 {task.assignedNodes?.length || 0} nodes</span>
                    <span>📊 {task.progress}%</span>
                    <span>⏱️ Priority: {task.priority}</span>
                  </div>
                  {task.progress > 0 && task.progress < 100 && (
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,212,255,0.08)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${task.progress}%`,
                          background: `linear-gradient(90deg, ${NEON_CYAN}, ${NEON_PINK})`,
                        }}
                      />
                    </div>
                  )}
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        )}

        {/* ═══ Sessions Tab ═══ */}
        {activeTab === "sessions" && (
          <div className="max-w-3xl space-y-2.5">
            {sessions.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <Terminal className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(0,212,255,0.25)" }} />
                <p className="text-[0.72rem]" style={{ color: "rgba(196,220,240,0.4)" }}>
                  {t("cluster.noSessions")}
                </p>
              </GlassCard>
            ) : sessions.map((session, i) => (
              <FadeIn key={session.sessionId} delay={i * 50}>
                <GlassCard className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4" style={{ color: NEON_CYAN }} />
                    <div>
                      <p className="text-[0.7rem] font-medium" style={{ color: "rgba(228,240,255,0.85)" }}>
                        {session.sourceNodeId} → {session.targetNodeId}
                      </p>
                      <p className="text-[0.6rem]" style={{ color: "rgba(196,220,240,0.4)" }}>
                        {formatUptime(session.durationSeconds)} · {session.commandHistory.length} commands
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(196,220,240,0.25)" }} />
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
