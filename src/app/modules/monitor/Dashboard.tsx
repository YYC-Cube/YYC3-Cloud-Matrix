/**
 * @file: Dashboard.tsx
 * @description: Dashboard.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-19
 * @updated: 2026-03-19
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  Gauge,
  GitBranch,
  HardDrive,
  Layers,
  Maximize2, Network,
  Radio,
  RefreshCw,
  Server,
  TrendingUp,
  Wifi, XCircle,
  Zap,
} from "lucide-react";
import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSwipeable } from "react-swipeable";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { useI18n } from "../../hooks/useI18n";
import { ViewContext, WebSocketContext } from "../../lib/view-context";
import { useAppSlice } from "../../store/slices/app-slice";
import { useMetricsSlice } from "../../store/slices/metrics-slice";
import { useNodeSlice } from "../../store/slices/node-slice";
import { useProviderSlice } from "../../store/slices/provider-slice";
import type { NodeData } from "../../types";
import { AlertBanner } from "./AlertBanner";
import { GlassCard } from "../shared/GlassCard";
import { NodeDetailModal } from "./NodeDetailModal";

// ============================================================
// Static reference data → 从 localStorage 读取 (可编辑)
// ============================================================

const PIE_COLORS = ["#00d4ff", "#00ff88", "#ff6600", "#aa55ff", "#ffdd00"];

interface PredictionPoint {
  time: string;
  actual: number | null;
  predicted: number | null;
}

function buildPredictionFromHistory(
  history: { time: string; qps: number }[],
): PredictionPoint[] {
  const recent = history.slice(-12);
  if (recent.length < 2) {
    return [
      { time: "now", actual: 3800, predicted: null },
      { time: "+1h", actual: null, predicted: 4100 },
      { time: "+2h", actual: null, predicted: 4350 },
      { time: "+3h", actual: null, predicted: 4200 },
      { time: "+4h", actual: null, predicted: 3900 },
      { time: "+6h", actual: null, predicted: 3500 },
      { time: "+8h", actual: null, predicted: 3100 },
      { time: "+12h", actual: null, predicted: 2200 },
    ];
  }
  const lastQps = recent[recent.length - 1].qps;
  const firstQps = recent[0].qps;
  const slope = (lastQps - firstQps) / recent.length;
  const actuals: PredictionPoint[] = recent.map((p) => ({
    time: p.time,
    actual: p.qps,
    predicted: null,
  }));
  const labels = ["+1h", "+2h", "+3h", "+4h", "+6h", "+8h", "+12h"];
  const multipliers = [1, 2, 3, 4, 6, 8, 12];
  const forecasts: PredictionPoint[] = labels.map((label, i) => {
    const raw = lastQps + slope * (multipliers[i] + 1) + (Math.sin(i * 0.8) * lastQps * 0.05);
    return { time: label, actual: null, predicted: Math.round(Math.max(0, raw)) };
  });
  return [...actuals, ...forecasts];
}

const customTooltipStyle = {
  backgroundColor: "rgba(8, 25, 55, 0.95)",
  border: "1px solid rgba(0, 180, 255, 0.3)",
  borderRadius: "8px",
  backdropFilter: "blur(10px)",
  color: "#e0f0ff",
  fontSize: "0.75rem",
  fontFamily: "'Rajdhani', sans-serif",
};

// ============================================================
// Chart tab selector for mobile
// ============================================================

type AnalyticsTab = "radar" | "performance" | "prediction";
const ANALYTICS_TABS: AnalyticsTab[] = ["radar", "performance", "prediction"];

function ChartTabBar({ active, onChange }: { active: AnalyticsTab; onChange: (t: AnalyticsTab) => void }) {
  const { t } = useI18n();
  const tabs: { key: AnalyticsTab; label: string }[] = [
    { key: "radar", label: t("monitor.radarTab") },
    { key: "performance", label: t("monitor.performanceTab") },
    { key: "prediction", label: t("monitor.predictionTab") },
  ];
  return (
    <div className="flex items-center gap-1 mb-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${active === tab.key
            ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border border-[rgba(0,212,255,0.25)]"
            : "text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff] border border-transparent"
            }`}
          style={{ fontSize: "0.75rem" }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ModelStatusBar() {
  const { configuredModels, testingIds, getActiveModel } = useProviderSlice();
  const activeModel = getActiveModel();
  const activeCount = configuredModels.filter((m: { status: string }) => m.status === "active").length;
  const errorCount = configuredModels.filter((m: { status: string }) => m.status === "error").length;
  const total = configuredModels.length;

  if (total === 0) {
    return (
      <>
        <div className="w-px h-5 bg-[rgba(0,180,255,0.12)]" />
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.1)]">
          <Cpu className="w-3.5 h-3.5 text-[rgba(0,212,255,0.4)]" />
          <span className="text-[rgba(0,212,255,0.5)] font-medium" style={{ fontSize: "0.68rem" }}>
            未配置模型
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-px h-5 bg-[rgba(0,180,255,0.12)]" />
      <div className="flex items-center gap-1.5">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${activeCount > 0
          ? "bg-[rgba(0,255,136,0.06)] border-[rgba(0,255,136,0.15)]"
          : errorCount > 0
            ? "bg-[rgba(255,51,102,0.06)] border-[rgba(255,51,102,0.15)]"
            : "bg-[rgba(170,85,255,0.06)] border-[rgba(170,85,255,0.15)]"
          }`}>
          <Cpu className={`w-3.5 h-3.5 ${testingIds.length > 0 ? "text-[#00d4ff] animate-pulse" :
            activeCount > 0 ? "text-[#00ff88]" : errorCount > 0 ? "text-[#ff3366]" : "text-[#aa55ff]"
            }`} />
          <span className={`font-medium ${activeCount > 0 ? "text-[rgba(0,255,136,0.85)]" : errorCount > 0 ? "text-[rgba(255,51,102,0.85)]" : "text-[rgba(170,85,255,0.85)]"}`} style={{ fontSize: "0.68rem" }}>
            {testingIds.length > 0
              ? `测试中 (${testingIds.length}/${total})`
              : activeModel
                ? `${activeModel.model}`
                : `${activeCount}/${total} 可用`}
          </span>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Dashboard Component
// ============================================================

export function Dashboard() {
  // ★ SSOT原则: 节点数据统一从 useNodeSlice 获取
  // WebSocketContext 仅用于: 连接状态/QPS/Latency/吞吐量/告警 等非节点类实时指标
  // 禁止从此处读取 nodes 相关数据（2026-04-15 架构审计确认）
  const ws = useContext(WebSocketContext);
  const view = useContext(ViewContext);
  const { t } = useI18n();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>("radar");
  const [swipeAnim, setSwipeAnim] = useState<"" | "left" | "right">("");
  const [showAllNodes, setShowAllNodes] = useState(false);

  // P-11: mounted guard to prevent setState on unmounted component
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const isMobile = view?.isMobile ?? false;
  const isTablet = view?.isTablet ?? false;
  const _isDesktop = !isMobile && !isTablet;

  // ★ 统一 Store — useShallow 避免全量订阅
  const { modelPerf: _modelPerf, modelDist, radarData: _radarData } = useMetricsSlice(
    useShallow((s) => ({ modelPerf: s.modelPerf, modelDist: s.modelDist, radarData: s.radarData }))
  );
  const { recentOps } = useAppSlice(useShallow((s) => ({ recentOps: s.recentOps })));
  const { nodes, derived, addNode } = useNodeSlice(
    useShallow((s) => ({ nodes: s.nodes, derived: s.derived, addNode: s.addNode }))
  );

  // Swipe handlers for chart tabs
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const idx = ANALYTICS_TABS.indexOf(analyticsTab);
      if (idx < ANALYTICS_TABS.length - 1) {
        setSwipeAnim("left");
        setTimeout(() => {
          if (mountedRef.current) {
            setAnalyticsTab(ANALYTICS_TABS[idx + 1]);
            setSwipeAnim("");
          }
        }, 150);
      }
    },
    onSwipedRight: () => {
      const idx = ANALYTICS_TABS.indexOf(analyticsTab);
      if (idx > 0) {
        setSwipeAnim("right");
        setTimeout(() => {
          if (mountedRef.current) {
            setAnalyticsTab(ANALYTICS_TABS[idx - 1]);
            setSwipeAnim("");
          }
        }, 150);
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 40,
  });

  // WebSocket data (or defaults)
  const liveQPS = ws?.liveQPS ?? 3842;
  const qpsTrend = ws?.qpsTrend ?? "+12.3%";
  const liveLatency = ws?.liveLatency ?? 48;
  const latencyTrend = ws?.latencyTrend ?? "-5.2%";
  const activeNodesStr = derived.activeRatio;
  const gpuUtilStr = `${derived.avgGpu}%`;
  const tokenTP = ws?.tokenThroughput ?? "138K/s";
  const storageStr = ws?.storageUsed ?? "12.8TB";
  const throughputHistory = ws?.throughputHistory ?? [];

  const isQPSUp = qpsTrend.startsWith("+");
  const isLatencyUp = latencyTrend.startsWith("+");

  const statCards = [
    { label: "QPS", value: liveQPS.toLocaleString(), icon: Activity, trend: qpsTrend, up: isQPSUp, color: "#00d4ff" },
    { label: "Latency", value: `${liveLatency}ms`, icon: Clock, trend: latencyTrend, up: isLatencyUp, color: "#00ff88" },
    { label: t("monitor.activeNodes"), value: activeNodesStr, icon: Server, trend: "+1", up: true, color: "#aa55ff" },
    { label: t("monitor.gpuUtil"), value: gpuUtilStr, icon: Cpu, trend: "+3.1%", up: true, color: "#ff6600" },
    { label: t("monitor.tokenThroughput"), value: tokenTP, icon: Zap, trend: "+18.7%", up: true, color: "#ffdd00" },
    { label: t("monitor.storageUsed"), value: storageStr, icon: HardDrive, trend: "+2.1%", up: true, color: "#ff3366" },
  ];

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="space-y-3 md:space-y-4">
      {/* ===== Alert Banner → 一键跟进入口 ===== */}
      <AlertBanner compact={isMobile} />

      {/* ===== Connection Status Bar ===== */}
      <GlassCard
        className={`p-2.5 md:p-3 transition-all duration-500 ${ws?.connectionState === "connected"
          ? "border-[rgba(0,255,136,0.25)] bg-[rgba(0,255,136,0.03)]"
          : ws?.connectionState === "disconnected"
            ? "border-[rgba(255,51,102,0.3)] bg-[rgba(255,51,102,0.05)]"
            : ws?.connectionState === "connecting" || ws?.connectionState === "reconnecting"
              ? "border-[rgba(255,221,0,0.3)] bg-[rgba(255,221,0,0.03)]"
              : ""
          }`}
      >
        <div className="flex items-center gap-3 md:gap-4">
          {/* Connection State Indicator */}
          <div className="flex items-center gap-2">
            {ws?.connectionState === "connected" ? (
              <div className="relative">
                <Wifi className="w-5 h-5 text-[#00ff88]" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              </div>
            ) : ws?.connectionState === "connecting" || ws?.connectionState === "reconnecting" ? (
              <div className="relative">
                <Radio className="w-5 h-5 text-[#ffdd00] animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ffdd00] animate-ping" />
              </div>
            ) : (
              <div className="relative">
                <XCircle className="w-5 h-5 text-[#ff3366]" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ff3366] animate-pulse" />
              </div>
            )}
            <span className="font-bold" style={{
              fontSize: "0.85rem",
              color: ws?.connectionState === "connected" ? "#00ff88" :
                ws?.connectionState === "connecting" || ws?.connectionState === "reconnecting" ? "#ffdd00" : "#ff3366",
              textShadow: ws?.connectionState !== "connected" ? "0 0 10px currentColor" : "none",
            }}>
              {ws?.connectionState === "connected" ? "● 已连接" :
                ws?.connectionState === "connecting" ? "◌ 连接中..." :
                  ws?.connectionState === "reconnecting" ? "◌ 重连中..." :
                    ws?.connectionState === "disconnected" ? "✕ 已断开" :
                      ws?.connectionState === "simulated" ? "◇ 模拟模式" : "？ 未知"}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-[rgba(0,180,255,0.12)]" />

          {/* Latency & QPS */}
          <div className="flex items-center gap-3 md:gap-4 text-[rgba(0,212,255,0.6)]" style={{ fontSize: "0.68rem" }}>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" style={{ color: "#00d4ff" }} />
              延迟: <strong className="text-[#e0f0ff]">{liveLatency}ms</strong>
            </span>
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3" style={{ color: "#aa55ff" }} />
              QPS: <strong className="text-[#e0f0ff]">{liveQPS.toLocaleString()}</strong>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Zap className="w-3 h-3" style={{ color: "#ffdd00" }} />
              吞吐: <strong className="text-[#e0f0ff]">{tokenTP}</strong>
            </span>
          </div>

          {/* Health Score Bar (if connected) */}
          {ws?.connectionState === "connected" && (
            <>
              <div className="w-px h-5 bg-[rgba(0,180,255,0.12)]" />
              <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                <span className="text-[rgba(0,212,255,0.45)] shrink-0" style={{ fontSize: "0.62rem" }}>通道质量</span>
                <div className="flex-1 h-1.5 rounded-full bg-[rgba(0,40,80,0.6)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, Math.max(0, 100 - liveLatency * 1.2))}%`,
                      background: liveLatency < 50 ? "#00ff88" : liveLatency < 100 ? "#ffdd00" : "#ff3366",
                      boxShadow: `0 0 6px ${liveLatency < 50 ? "#00ff8840" : liveLatency < 100 ? "#ffdd0030" : "#ff336620"}`,
                    }}
                  />
                </div>
                <span className="shrink-0 font-mono text-xs" style={{
                  fontSize: "0.58rem",
                  color: liveLatency < 50 ? "#00ff88" : liveLatency < 100 ? "#ffdd00" : "#ff3366",
                }}>
                  {liveLatency < 50 ? "优" : liveLatency < 100 ? "良" : "差"}
                </span>
              </div>
            </>
          )}

          {/* Disconnected Reason with Reconnect Button */}
          {(ws?.connectionState === "disconnected" || ws?.connectionState === undefined) && (
            <>
              <div className="w-px h-5 bg-[rgba(0,180,255,0.12)]" />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[rgba(255,51,102,0.08)] border border-[rgba(255,51,102,0.15)]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ffaa00]" />
                  <span className="text-[rgba(255,170,0,0.85)] font-medium" style={{ fontSize: "0.68rem" }}>
                    {ws?.connectionState === "disconnected"
                      ? "WebSocket 未连接 — 数据为模拟值"
                      : "等待连接..."}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (ws?.manualReconnect) {
                      ws.manualReconnect();
                      toast.info("正在尝试重新连接...", { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(0,212,255,0.3)", color: "#e0f0ff" } });
                    }
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.25)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.2)] transition-all"
                  style={{ fontSize: "0.68rem" }}
                >
                  <RefreshCw className="w-3 h-3" />
                  重连
                </button>
              </div>
            </>
          )}

          {/* Reconnect hint for reconnecting state */}
          {ws?.connectionState === "reconnecting" && (
            <>
              <div className="w-px h-5 bg-[rgba(0,180,255,0.12)]" />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[rgba(255,221,0,0.08)] border border-[rgba(255,221,0,0.15)]">
                <RefreshCw className="w-3.5 h-3.5 text-[#ffdd00] animate-spin" />
                <span className="text-[rgba(255,221,0,0.85)] font-medium" style={{ fontSize: "0.68rem" }}>
                  正在尝试重新连接...
                </span>
              </div>
            </>
          )}

          {/* Simulated mode indicator */}
          {ws?.connectionState === "simulated" && (
            <>
              <div className="w-px h-5 bg-[rgba(0,180,255,0.12)]" />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[rgba(170,85,255,0.08)] border border-[rgba(170,85,255,0.15)]">
                <Cpu className="w-3.5 h-3.5 text-[#aa55ff]" />
                <span className="text-[rgba(170,85,255,0.85)] font-medium" style={{ fontSize: "0.68rem" }}>
                  使用模拟数据 — 可在设置中配置 WebSocket
                </span>
              </div>
            </>
          )}

          {/* AI Model Status */}
          <ModelStatusBar />
        </div>
      </GlassCard>

      {/* ===== Stats Row ===== */}
      <div className={`grid gap-2 md:gap-3 ${isMobile ? "grid-cols-2" : isTablet ? "grid-cols-3" : "grid-cols-6"}`}>
        {statCards.map((stat) => (
          <GlassCard key={stat.label} className="p-3 md:p-4 group">
            <div className="flex items-start justify-between mb-1.5 md:mb-2">
              <div className="p-1.5 md:p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${stat.up ? "bg-[rgba(0,255,136,0.1)] text-[#00ff88]" : "bg-[rgba(255,51,102,0.1)] text-[#ff3366]"}`} style={{ fontSize: "0.65rem" }}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-1" style={{ fontSize: isMobile ? "1.2rem" : "1.5rem", color: stat.color, fontFamily: "'Orbitron', sans-serif" }}>
              {stat.value}
            </div>
            <div className="text-[rgba(0,212,255,0.5)] mt-0.5" style={{ fontSize: "0.72rem" }}>{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* ===== Main Charts Row ===== */}
      <div className={`grid gap-2 md:gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-12"}`}>
        {/* Throughput Chart */}
        <GlassCard className={`p-3 md:p-4 ${isMobile ? "" : isTablet ? "col-span-7" : "col-span-8"}`}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00d4ff]" />
              <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.85rem" }}>{t("monitor.throughputChart")}</h3>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {(isMobile ? ["24H", "7D"] : ["1H", "6H", "24H", "7D"]).map((period) => (
                <button key={period} className={`px-2 py-1 rounded text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] transition-all min-h-[32px] ${period === "24H" ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff]" : ""}`} style={{ fontSize: "0.68rem" }}>
                  {period}
                </button>
              ))}
              {!isMobile && (
                <button className="p-1 rounded hover:bg-[rgba(0,212,255,0.1)] transition-all" title="全屏">
                  <Maximize2 className="w-3.5 h-3.5 text-[rgba(0,212,255,0.4)]" />
                </button>
              )}
            </div>
          </div>
          <div className={isMobile ? "overflow-x-auto -mx-3" : ""}>
            <div style={isMobile ? { minWidth: "500px", paddingLeft: 12, paddingRight: 12 } : undefined}>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
                <AreaChart data={throughputHistory}>
                  <defs>
                    <linearGradient id="qpsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="tokensGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
                  <XAxis dataKey="time" tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 10 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} tickFormatter={(v: string) => v.split(".")[0]} />
                  <YAxis yAxisId="left" tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 10 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} width={40} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "rgba(0,255,136,0.4)", fontSize: 10 }} axisLine={{ stroke: "rgba(0,255,136,0.1)" }} width={45} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Area yAxisId="left" type="monotone" dataKey="qps" stroke="#00d4ff" fill="url(#qpsGradient)" strokeWidth={2} name="QPS" />
                  <Area yAxisId="right" type="monotone" dataKey="tokens" stroke="#00ff88" fill="url(#tokensGradient)" strokeWidth={2} name="Tokens/s" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* Model Load Distribution */}
        <GlassCard className={`p-3 md:p-4 ${isMobile ? "" : isTablet ? "col-span-5" : "col-span-4"}`}>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Layers className="w-4 h-4 text-[#aa55ff]" />
            <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.85rem" }}>{t("monitor.modelLoadDist")}</h3>
          </div>
          {(() => {
            const distData = modelDist;
            return (
              <>
                <ResponsiveContainer width="100%" height={isMobile ? 140 : 160}>
                  <PieChart>
                    <Pie data={distData} cx="50%" cy="50%" innerRadius={isMobile ? 35 : 45} outerRadius={isMobile ? 58 : 70} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                      {distData.map((entry, index) => (
                        <Cell key={`cell-${entry.id}`} fill={PIE_COLORS[index % PIE_COLORS.length]} fillOpacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={customTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className={`grid gap-x-4 gap-y-1 mt-2 ${isMobile ? "grid-cols-2" : "grid-cols-2"}`}>
                  {distData.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[rgba(0,212,255,0.6)] truncate" style={{ fontSize: "0.7rem" }}>{item.name}</span>
                      <span className="ml-auto shrink-0" style={{ fontSize: "0.7rem", color: PIE_COLORS[i % PIE_COLORS.length] }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </GlassCard>
      </div>

      {/* ===== Analytics Row (Tab-based on mobile) ===== */}
      {isMobile || isTablet ? (
        <GlassCard className="p-3 md:p-4">
          <ChartTabBar active={analyticsTab} onChange={(t) => { setSwipeAnim(""); setAnalyticsTab(t); }} />
          <div
            {...swipeHandlers}
            className="relative overflow-hidden"
            style={{
              transition: swipeAnim ? "opacity 0.15s, transform 0.15s" : "none",
              opacity: swipeAnim ? 0.3 : 1,
              transform: swipeAnim === "left" ? "translateX(-30px)" : swipeAnim === "right" ? "translateX(30px)" : "translateX(0)",
            }}
          >
            {analyticsTab === "radar" && <RadarSection isMobile={isMobile} />}
            {analyticsTab === "performance" && <PerformanceSection isMobile={isMobile} />}
            {analyticsTab === "prediction" && <PredictionSection isMobile={isMobile} throughputHistory={throughputHistory} />}
          </div>
          {/* Swipe indicator dots */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {ANALYTICS_TABS.map((tab) => (
              <div
                key={tab}
                className={`rounded-full transition-all duration-300 ${analyticsTab === tab
                  ? "w-5 h-1.5 bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.4)]"
                  : "w-1.5 h-1.5 bg-[rgba(0,212,255,0.2)]"
                  }`}
              />
            ))}
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-12 gap-3">
          <GlassCard className="col-span-4 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-[#00ff88]" />
              <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.9rem" }}>{t("monitor.radarTitle")}</h3>
            </div>
            <RadarSection isMobile={false} />
          </GlassCard>
          <GlassCard className="col-span-4 p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#ffdd00]" />
              <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.9rem" }}>{t("monitor.performanceTitle")}</h3>
            </div>
            <PerformanceSection isMobile={false} />
          </GlassCard>
          <GlassCard className="col-span-4 p-4">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-4 h-4 text-[#ff6600]" />
              <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.9rem" }}>{t("monitor.predictionTitle")}</h3>
              <span className="ml-auto px-2 py-0.5 rounded bg-[rgba(255,102,0,0.1)] border border-[rgba(255,102,0,0.2)] text-[#ff6600]" style={{ fontSize: "0.65rem" }}>{t("monitor.aiPrediction")}</span>
            </div>
            <PredictionSection isMobile={false} throughputHistory={throughputHistory} />
          </GlassCard>
        </div>
      )}

      {/* ===== Nodes + Operations Row ===== */}
      <div className={`grid gap-2 md:gap-3 ${isMobile ? "grid-cols-1" : showAllNodes ? "grid-cols-1" : "grid-cols-12"}`}>
        {/* Node Status Grid */}
        <GlassCard className={`p-3 md:p-4 ${isMobile ? "" : showAllNodes ? "" : isTablet ? "col-span-7" : "col-span-7"}`} data-testid="node-matrix-card">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[#00d4ff]" />
              <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.85rem" }}>{t("monitor.nodeMatrix")}</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.15)] transition-all min-h-[32px]" style={{ fontSize: "0.7rem" }}>
                <RefreshCw className="w-3 h-3" />
                {!isMobile && t("monitor.refresh")}
              </button>
              {!isMobile && (
                <button
                  onClick={() => setShowAllNodes(!showAllNodes)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all min-h-[32px] ${showAllNodes
                    ? "bg-[rgba(0,212,255,0.15)] border-[rgba(0,212,255,0.3)] text-[#00d4ff]"
                    : "bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.2)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.15)]"
                    }`}
                  style={{ fontSize: "0.7rem" }}
                >
                  <Eye className="w-3 h-3" />
                  {t("monitor.panorama")}
                </button>
              )}
            </div>
          </div>
          <div className={`grid gap-2 ${showAllNodes
            ? (isMobile ? "grid-cols-2" : isTablet ? "grid-cols-4" : "grid-cols-5")
            : (isMobile ? "grid-cols-2" : isTablet ? "grid-cols-3" : "grid-cols-4")
            }`}>
            {nodes.map((node) => (
              <NodeCard key={node.id} node={node} onClick={setSelectedNode} />
            ))}
            <button
              onClick={() => {
                const id = `GPU-${Date.now().toString(36).toUpperCase()}`;
                addNode({ id, status: "inactive", gpu: 0, mem: 0, temp: 30, model: "", tasks: 0 });
                toast.success(`节点 ${id} 已添加`, { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(0,255,136,0.3)", color: "#e0f0ff" } });
              }}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-[rgba(0,180,255,0.15)] hover:border-[rgba(0,180,255,0.4)] bg-[rgba(0,40,80,0.05)] hover:bg-[rgba(0,40,80,0.15)] transition-all cursor-pointer min-h-[72px]"
              style={{ fontSize: "0.75rem" }}
            >
              <Server className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
              <span className="text-[rgba(0,212,255,0.4)]">添加节点</span>
            </button>
          </div>
        </GlassCard>

        {/* Recent Operations */}
        <GlassCard className={`p-3 md:p-4 ${isMobile ? "" : isTablet ? "col-span-5" : "col-span-5"}`}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ffdd00]" />
              <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.85rem" }}>{t("monitor.realtimeOps")}</h3>
            </div>
            <button
              onClick={() => navigate("/audit")}
              className="text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] transition-colors min-h-[32px]"
              style={{ fontSize: "0.7rem" }}
            >
              {t("monitor.viewAll")}
            </button>
          </div>
          <div className="space-y-2">
            {recentOps.map((op) => (
              <div key={op.id} className="flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-lg bg-[rgba(0,40,80,0.2)] border border-[rgba(0,180,255,0.06)] hover:border-[rgba(0,180,255,0.15)] transition-all cursor-pointer">
                <div className={`shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${op.status === "success" ? "bg-[rgba(0,255,136,0.1)]" :
                  op.status === "running" ? "bg-[rgba(0,212,255,0.1)]" :
                    op.status === "pending" ? "bg-[rgba(170,85,255,0.1)]" :
                      "bg-[rgba(255,221,0,0.1)]"
                  }`}>
                  {op.status === "success" ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" /> :
                    op.status === "running" ? <RefreshCw className="w-3.5 h-3.5 text-[#00d4ff] animate-spin" /> :
                      op.status === "pending" ? <Clock className="w-3.5 h-3.5 text-[#aa55ff]" /> :
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ffdd00]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#c0dcf0]" style={{ fontSize: "0.75rem" }}>{op.action}</span>
                    {!isMobile && (
                      <span className="px-1.5 py-0.5 rounded text-[rgba(0,212,255,0.5)] bg-[rgba(0,212,255,0.05)]" style={{ fontSize: "0.58rem" }}>
                        {op.user}
                      </span>
                    )}
                  </div>
                  <p className="text-[rgba(0,212,255,0.4)] truncate" style={{ fontSize: "0.68rem" }}>{op.target}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block px-1.5 py-0.5 rounded ${op.status === "success" ? "bg-[rgba(0,255,136,0.1)] text-[#00ff88]" :
                    op.status === "running" ? "bg-[rgba(0,212,255,0.1)] text-[#00d4ff]" :
                      op.status === "pending" ? "bg-[rgba(170,85,255,0.1)] text-[#aa55ff]" :
                        "bg-[rgba(255,221,0,0.1)] text-[#ffdd00]"
                    }`} style={{ fontSize: "0.6rem" }}>
                    {op.status === "success" ? t("monitor.statusDone") : op.status === "running" ? t("monitor.statusRunning") : op.status === "pending" ? t("monitor.statusPending") : t("monitor.statusAlert")}
                  </span>
                  <p className="text-[rgba(0,212,255,0.3)] mt-0.5" style={{ fontSize: "0.6rem" }}>{op.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Node Detail Modal */}
      {selectedNode && (
        <NodeDetailModal node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}

// ============================================================
// Sub-components extracted for cleanliness
// ============================================================

function RadarSection({ isMobile }: { isMobile: boolean }) {
  const { t } = useI18n();
  const { radarData } = useMetricsSlice(useShallow((s) => ({ radarData: s.radarData })));
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 240 : 220}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="rgba(0,180,255,0.15)" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(0,212,255,0.5)", fontSize: isMobile ? 10 : 11 }} />
        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
        <Radar name={t("monitor.currentCluster")} dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
        <Radar name={t("monitor.baseline")} dataKey="B" stroke="#aa55ff" fill="#aa55ff" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
        <Legend wrapperStyle={{ fontSize: "0.7rem", color: "rgba(0,212,255,0.6)" }} />
        <Tooltip contentStyle={customTooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function PerformanceSection({ isMobile }: { isMobile: boolean }) {
  const { t } = useI18n();
  const { modelPerf } = useMetricsSlice(useShallow((s) => ({ modelPerf: s.modelPerf })));
  return (
    <div className={isMobile ? "overflow-x-auto -mx-3" : ""}>
      <div style={isMobile ? { minWidth: "420px", paddingLeft: 12, paddingRight: 12 } : undefined}>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 220}>
          <BarChart data={modelPerf} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
            <XAxis dataKey="model" tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 9 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} />
            <YAxis tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 10 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} domain={[0, 100]} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Bar dataKey="accuracy" fill="#00d4ff" fillOpacity={0.7} radius={[4, 4, 0, 0]} name={t("monitor.accuracy")} />
            <Bar dataKey="speed" fill="#00ff88" fillOpacity={0.7} radius={[4, 4, 0, 0]} name={t("monitor.speed")} />
            <Bar dataKey="memory" fill="#aa55ff" fillOpacity={0.7} radius={[4, 4, 0, 0]} name={t("monitor.memory")} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PredictionSection({ isMobile, throughputHistory }: { isMobile: boolean; throughputHistory: { time: string; qps: number }[] }) {
  const { t } = useI18n();
  const data = useMemo(() => buildPredictionFromHistory(throughputHistory), [throughputHistory]);
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 220 : 220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
        <XAxis dataKey="time" tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} />
        <YAxis tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(0,180,255,0.1)" }} />
        <Tooltip contentStyle={customTooltipStyle} />
        <Line type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 4 }} name={t("monitor.actualValue")} connectNulls={false} />
        <Line type="monotone" dataKey="predicted" stroke="#ff6600" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: "#ff6600", r: 3, strokeDasharray: "" }} name={t("monitor.predictedValue")} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

const NodeCard = memo(function NodeCard({ node, onClick }: { node: NodeData; onClick: (n: NodeData) => void }) {
  return (
    <div
      onClick={() => onClick(node)}
      className={`
        relative p-2.5 md:p-3 rounded-lg border cursor-pointer transition-all duration-300
        hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,180,255,0.15)]
        min-h-[44px]
        ${node.status === "active"
          ? "bg-[rgba(0,255,136,0.03)] border-[rgba(0,255,136,0.15)] hover:border-[rgba(0,255,136,0.3)]"
          : node.status === "warning"
            ? "bg-[rgba(255,221,0,0.03)] border-[rgba(255,221,0,0.15)] hover:border-[rgba(255,221,0,0.3)]"
            : "bg-[rgba(255,51,102,0.03)] border-[rgba(255,51,102,0.15)] hover:border-[rgba(255,51,102,0.3)]"
        }
      `}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[#c0dcf0] truncate" style={{ fontSize: "0.7rem" }}>{node.id}</span>
        <div className={`w-2 h-2 rounded-full shrink-0 ${node.status === "active" ? "bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.5)]"
          : node.status === "warning" ? "bg-[#ffdd00] shadow-[0_0_6px_rgba(255,221,0,0.5)] animate-pulse"
            : "bg-[#ff3366] shadow-[0_0_6px_rgba(255,51,102,0.5)]"
          }`} />
      </div>
      {/* GPU bar */}
      <div className="mb-1">
        <div className="flex justify-between mb-0.5">
          <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.58rem" }}>GPU</span>
          <span style={{ fontSize: "0.58rem", color: node.gpu > 90 ? "#ff3366" : "#00d4ff" }}>{node.gpu}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-[rgba(0,180,255,0.1)]">
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${node.gpu}%`,
            background: node.gpu > 90 ? "linear-gradient(90deg, #ff6600, #ff3366)" : "linear-gradient(90deg, #00d4ff, #00ff88)",
          }} />
        </div>
      </div>
      {/* Mem bar */}
      <div>
        <div className="flex justify-between mb-0.5">
          <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.58rem" }}>MEM</span>
          <span style={{ fontSize: "0.58rem", color: node.mem > 90 ? "#ff3366" : "#aa55ff" }}>{node.mem}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-[rgba(0,180,255,0.1)]">
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${node.mem}%`,
            background: "linear-gradient(90deg, #aa55ff, #7b2ff7)",
          }} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.56rem" }}>{node.model}</span>
        <span className="text-[rgba(0,212,255,0.3)]" style={{ fontSize: "0.56rem" }}>{node.temp}°C</span>
      </div>
    </div>
  );
});
