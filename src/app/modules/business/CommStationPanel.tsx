/**
 * @file: CommStationPanel.tsx
 * @description: 通讯基站管理面板 — 独立主导航系统
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-26
 * @updated: 2026-04-26
 * @status: active
 * @tags: [component],[comm-station]
 */

import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Radio,
  Settings2,
  Signal,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../../hooks/useI18n";
import { usePersistedList } from "../../hooks/usePersistedState";
import { GlassCard } from "../shared/GlassCard";

interface CommStation {
  id: string;
  name: string;
  type: "5g" | "4g" | "wifi" | "mesh";
  status: "online" | "offline" | "degraded" | "maintenance";
  signal: number;
  latency: number;
  connections: number;
  maxConnections: number;
  uptime: number;
  location: string;
  lastCheck: number;
}

const DEFAULT_STATIONS: CommStation[] = [
  { id: "cs-001", name: "YYC3-主站-5G-A", type: "5g", status: "online", signal: 95, latency: 3, connections: 128, maxConnections: 256, uptime: 99.97, location: "A栋-3F-机房01", lastCheck: Date.now() - 30000 },
  { id: "cs-002", name: "YYC3-辅站-WiFi-01", type: "wifi", status: "online", signal: 82, latency: 8, connections: 64, maxConnections: 128, uptime: 99.85, location: "B栋-2F-走廊", lastCheck: Date.now() - 60000 },
  { id: "cs-003", name: "YYC3-Mesh-节点-03", type: "mesh", status: "degraded", signal: 45, latency: 22, connections: 32, maxConnections: 64, uptime: 98.5, location: "C栋-1F-仓库", lastCheck: Date.now() - 120000 },
  { id: "cs-004", name: "YYC3-基站-4G-备份", type: "4g", status: "offline", signal: 0, latency: 0, connections: 0, maxConnections: 128, uptime: 0, location: "D栋-B1-设备间", lastCheck: Date.now() - 3600000 },
];

const toastStyle = {
  background: "rgba(8, 25, 55, 0.95)",
  border: "1px solid rgba(0, 255, 136, 0.3)",
  color: "#e0f0ff",
};

export function CommStationPanel() {
  const { t } = useI18n();
  const { items: stations, upsert: upsertStation, remove: removeStationById } =
    usePersistedList<CommStation>("comm_stations", DEFAULT_STATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addDraft, setAddDraft] = useState<Partial<CommStation>>({});

  const stats = useMemo(() => {
    const online = stations.filter((s) => s.status === "online").length;
    const degraded = stations.filter((s) => s.status === "degraded").length;
    const offline = stations.filter((s) => s.status === "offline").length;
    const avgSignal = stations.length > 0
      ? Math.round(stations.reduce((a, s) => a + s.signal, 0) / stations.length)
      : 0;
    const totalConn = stations.reduce((a, s) => a + s.connections, 0);
    return { online, degraded, offline, avgSignal, totalConn, total: stations.length };
  }, [stations]);

  const selected = stations.find((s) => s.id === selectedId);

  const handleAdd = useCallback(() => {
    if (!addDraft.name?.trim()) { return; }
    const newStation: CommStation = {
      id: `cs-${Date.now()}`,
      name: addDraft.name.trim(),
      type: addDraft.type || "wifi",
      status: "online",
      signal: addDraft.signal || 80,
      latency: addDraft.latency || 10,
      connections: 0,
      maxConnections: addDraft.maxConnections || 128,
      uptime: 100,
      location: addDraft.location || "",
      lastCheck: Date.now(),
    };
    upsertStation(newStation);
    setShowAddForm(false);
    setAddDraft({});
    toast.success(`基站 ${newStation.name} 已添加`, { style: toastStyle });
  }, [addDraft, upsertStation]);

  const handleRemove = useCallback((id: string) => {
    removeStationById(id);
    if (selectedId === id) { setSelectedId(null); }
    toast.success("基站已删除", { style: toastStyle });
  }, [removeStationById, selectedId]);

  const statusIcon = (status: CommStation["status"]) => {
    switch (status) {
      case "online": return <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />;
      case "degraded": return <AlertTriangle className="w-4 h-4 text-[#ffdd00]" />;
      case "offline": return <XCircle className="w-4 h-4 text-[#ff3366]" />;
      case "maintenance": return <Settings2 className="w-4 h-4 text-[#00d4ff]" />;
    }
  };

  const typeLabel = (type: CommStation["type"]) => {
    const map: Record<string, string> = { "5g": "5G", "4g": "4G", wifi: "WiFi", mesh: "Mesh" };
    return map[type] || type;
  };

  return (
    <div className="p-4 space-y-4 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-[#00d4ff]" />
          <h1 className="text-xl font-bold text-white">{t("nav.commStation") || "通讯基站"}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.15)] text-[#00d4ff] text-sm hover:bg-[rgba(0,212,255,0.25)] transition-colors"
          >
            <Plus className="w-4 h-4" /> 添加基站
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "在线", value: stats.online, icon: Wifi, color: "#00ff88" },
          { label: "降级", value: stats.degraded, icon: AlertTriangle, color: "#ffdd00" },
          { label: "离线", value: stats.offline, icon: WifiOff, color: "#ff3366" },
          { label: "平均信号", value: `${stats.avgSignal}%`, icon: Signal, color: "#00d4ff" },
        ].map((card) => (
          <GlassCard key={card.label} className="p-3">
            <div className="flex items-center gap-2">
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <span className="text-xs text-[rgba(224,240,255,0.6)]">{card.label}</span>
            </div>
            <p className="text-2xl font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
          </GlassCard>
        ))}
      </div>

      {showAddForm && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-white mb-3">添加新基站</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input placeholder="基站名称" value={addDraft.name || ""} onChange={(e) => setAddDraft((d) => ({ ...d, name: e.target.value }))} className="col-span-1 px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.2)] text-white text-sm outline-none focus:border-[#00d4ff]" />
            <select title="基站类型" value={addDraft.type || "wifi"} onChange={(e) => setAddDraft((d) => ({ ...d, type: e.target.value as CommStation["type"] }))} className="px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.2)] text-white text-sm outline-none focus:border-[#00d4ff]">
              <option value="5g">5G</option>
              <option value="4g">4G</option>
              <option value="wifi">WiFi</option>
              <option value="mesh">Mesh</option>
            </select>
            <input placeholder="位置" value={addDraft.location || ""} onChange={(e) => setAddDraft((d) => ({ ...d, location: e.target.value }))} className="px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.2)] text-white text-sm outline-none focus:border-[#00d4ff]" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} className="px-4 py-1.5 rounded-lg bg-[rgba(0,255,136,0.2)] text-[#00ff88] text-sm hover:bg-[rgba(0,255,136,0.3)]">确认添加</button>
            <button onClick={() => { setShowAddForm(false); setAddDraft({}); }} className="px-4 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] text-[rgba(224,240,255,0.6)] text-sm">取消</button>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,180,255,0.1)]">
              <th className="text-left px-4 py-3 text-[rgba(224,240,255,0.5)] font-normal">状态</th>
              <th className="text-left px-4 py-3 text-[rgba(224,240,255,0.5)] font-normal">名称</th>
              <th className="text-left px-4 py-3 text-[rgba(224,240,255,0.5)] font-normal">类型</th>
              <th className="text-left px-4 py-3 text-[rgba(224,240,255,0.5)] font-normal">信号</th>
              <th className="text-left px-4 py-3 text-[rgba(224,240,255,0.5)] font-normal">延迟</th>
              <th className="text-left px-4 py-3 text-[rgba(224,240,255,0.5)] font-normal">连接数</th>
              <th className="text-left px-4 py-3 text-[rgba(224,240,255,0.5)] font-normal">位置</th>
              <th className="text-left px-4 py-3 text-[rgba(224,240,255,0.5)] font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr
                key={station.id}
                className={`border-b border-[rgba(0,180,255,0.05)] cursor-pointer transition-colors ${selectedId === station.id ? "bg-[rgba(0,212,255,0.08)]" : "hover:bg-[rgba(0,180,255,0.03)]"}`}
                onClick={() => setSelectedId(station.id === selectedId ? null : station.id)}
              >
                <td className="px-4 py-3">{statusIcon(station.status)}</td>
                <td className="px-4 py-3 text-white font-medium">{station.name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-[rgba(0,212,255,0.15)] text-[#00d4ff]">{typeLabel(station.type)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${station.signal}%`, backgroundColor: station.signal >= 70 ? "#00ff88" : station.signal >= 40 ? "#ffdd00" : "#ff3366" }} />
                    </div>
                    <span className="text-[rgba(224,240,255,0.8)]">{station.signal}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[rgba(224,240,255,0.8)]">{station.latency}ms</td>
                <td className="px-4 py-3 text-[rgba(224,240,255,0.8)]">{station.connections}/{station.maxConnections}</td>
                <td className="px-4 py-3 text-[rgba(224,240,255,0.6)]">{station.location}</td>
                <td className="px-4 py-3">
                  <button onClick={(e) => { e.stopPropagation(); handleRemove(station.id); }} title="删除基站" className="p-1 rounded hover:bg-[rgba(255,51,102,0.2)] text-[#ff3366]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stations.length === 0 && (
          <div className="py-12 text-center text-[rgba(224,240,255,0.3)]">暂无基站数据，请添加</div>
        )}
      </GlassCard>

      {selected && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              {statusIcon(selected.status)}
              {selected.name}
              <span className="px-2 py-0.5 rounded text-xs bg-[rgba(0,212,255,0.15)] text-[#00d4ff]">{typeLabel(selected.type)}</span>
            </h3>
            <button onClick={() => setSelectedId(null)} className="text-[rgba(224,240,255,0.4)] hover:text-white text-xs">关闭</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-[rgba(224,240,255,0.4)]">信号强度</span><p className="text-white font-bold">{selected.signal}%</p></div>
            <div><span className="text-[rgba(224,240,255,0.4)]">延迟</span><p className="text-white font-bold">{selected.latency}ms</p></div>
            <div><span className="text-[rgba(224,240,255,0.4)]">在线率</span><p className="text-white font-bold">{selected.uptime}%</p></div>
            <div><span className="text-[rgba(224,240,255,0.4)]">活跃连接</span><p className="text-white font-bold">{selected.connections}/{selected.maxConnections}</p></div>
          </div>
          <div className="mt-3 text-xs text-[rgba(224,240,255,0.4)]">
            位置: {selected.location} · 上次检查: {new Date(selected.lastCheck).toLocaleTimeString("zh-CN", { hour12: false })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

export default CommStationPanel;
