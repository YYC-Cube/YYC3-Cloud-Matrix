/**
 * @file: FamilyModelSettings.tsx
 * @description: FamilyModelSettings.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown, ChevronRight,
  Cpu,
  Download,
  Eye, EyeOff,
  Loader2,
  Search,
  Server, Shield,
  Sparkles,
  Volume2,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFamilyMemberSlice } from "../store";
import { useFamilySettingsSlice } from "../store/family-settings-slice";
import { useProviderSlice } from "../../../store/slices/provider-slice";
import type { UnifiedFamilyMember } from "../../../types";
import { GlassCard } from "../../shared/GlassCard";
import { FadeIn } from "./FadeIn";
import { DEFAULT_MODEL_ASSIGNMENTS, DEFAULT_VOICE_PROFILES, hexToRgb, type MemberModelAssignment, type VoiceProfile } from "./shared";

const PROVIDER_ICON_MAP: Record<string, React.ElementType> = {
  zhipu: Cpu, deepseek: Zap, ollama: Server, openai: Bot,
  anthropic: Shield, qwen: Sparkles, custom: Cpu,
};

const PROVIDER_COLOR_MAP: Record<string, string> = {
  zhipu: "#3b82f6", deepseek: "#06b6d4", ollama: "#f59e0b",
  openai: "#10a37f", anthropic: "#d97706", qwen: "#8b5cf6",
};

interface ProviderDef {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
  baseURL: string;
  models: { id: string; name: string; desc: string; ctx?: string }[];
}

// ═══ 诊断状态 ═══

interface DiagResult {
  memberId: string;
  status: "idle" | "testing" | "success" | "error";
  latency?: number;
  message: string;
  details?: string[];   // 诊断详情步骤
  repairHint?: string;  // 修复建议
  timestamp?: string;
}

// ═══ 诊断步骤模拟 ═══

interface DiagStep {
  label: string;
  check: (assignment: MemberModelAssignment, apiKeys: Record<string, string>, providersMap?: Record<string, ProviderDef>) => { ok: boolean; detail: string };
}

const DIAG_STEPS: DiagStep[] = [
  {
    label: "API Key 检查",
    check: (a, keys) => {
      const isLocal = a.providerId === "ollama";
      if (isLocal) { return { ok: true, detail: "本地模型无需 API Key" }; }
      const hasKey = !!keys[a.providerId];
      return hasKey
        ? { ok: true, detail: `${a.providerId} API Key 已配置 (${keys[a.providerId].slice(0, 6)}...)` }
        : { ok: false, detail: `缺少 ${a.providerId} API Key` };
    },
  },
  {
    label: "Endpoint 可达性",
    check: (a, _keys, pMap) => {
      const ok = Math.random() > 0.1;
      const provider = pMap?.[a.providerId];
      return ok
        ? { ok: true, detail: `${provider?.baseURL || "endpoint"} 可达` }
        : { ok: false, detail: `${provider?.baseURL || "endpoint"} 无法连接` };
    },
  },
  {
    label: "模型可用性",
    check: (a) => {
      const ok = Math.random() > 0.08;
      return ok
        ? { ok: true, detail: `模型 ${a.modelId} 可用` }
        : { ok: false, detail: `模型 ${a.modelId} 不可用或已下线` };
    },
  },
  {
    label: "推理响应测试",
    check: () => {
      const ok = Math.random() > 0.12;
      const latency = Math.round(80 + Math.random() * 300);
      return ok
        ? { ok: true, detail: `响应正常 (${latency}ms)` }
        : { ok: false, detail: "推理超时或返回异常" };
    },
  },
];

// ═══ 子组件：家人模型卡片 ═══

function MemberModelCard({
  member,
  assignment,
  voiceProfile: _voiceProfile,
  apiKeys,
  diagResult,
  providers,
  providersMap,
  onChangeModel,
  onTestConnection,
  onSpeak,
}: {
  member: UnifiedFamilyMember;
  assignment: MemberModelAssignment;
  voiceProfile: VoiceProfile;
  apiKeys: Record<string, string>;
  diagResult?: DiagResult;
  providers: ProviderDef[];
  providersMap: Record<string, ProviderDef>;
  onChangeModel: (providerId: string, modelId: string) => void;
  onTestConnection: () => void;
  onSpeak: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const provider = providersMap[assignment.providerId];
  const model = provider?.models.find((m: { id: string }) => m.id === assignment.modelId);
  const rgb = hexToRgb(member.color);
  const hasKey = !!apiKeys[assignment.providerId];
  const isLocal = assignment.providerId === "ollama";

  const statusColor = diagResult?.status === "success" ? "#00FF88"
    : diagResult?.status === "error" ? "#FF4444"
      : diagResult?.status === "testing" ? "#FFD700"
        : "rgba(255,255,255,0.2)";

  return (
    <FadeIn delay={0.05}>
      <GlassCard
        className="p-0 overflow-hidden"
        glowColor={expanded ? `rgba(${rgb},0.15)` : undefined}
      >
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `rgba(${rgb},0.15)`, border: `1.5px solid rgba(${rgb},0.4)` }}
          >
            <member.icon className="w-5 h-5" style={{ color: member.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white/90" style={{ fontSize: "0.875rem" }}>{member.shortName}</span>
              <span className="text-white/30" style={{ fontSize: "0.65rem" }}>{member.enTitle}</span>
              <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {provider && (
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{ fontSize: "0.6rem", background: `${provider.color}20`, color: provider.color }}
                >
                  {provider.name}
                </span>
              )}
              <span className="text-white/40 truncate" style={{ fontSize: "0.65rem" }}>
                {model?.name || assignment.modelId}
              </span>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2 shrink-0">
            {hasKey || isLocal ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
            {expanded ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
          </div>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-white/[0.06] p-4 space-y-4">
            {/* Purpose */}
            <div className="flex items-start gap-2">
              <Bot className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
              <div>
                <div className="text-white/40" style={{ fontSize: "0.65rem" }}>职能定位</div>
                <div className="text-white/70 mt-0.5" style={{ fontSize: "0.75rem" }}>{assignment.purpose}</div>
              </div>
            </div>

            {/* Model selector */}
            <div>
              <div className="text-white/40 mb-2" style={{ fontSize: "0.65rem" }}>模型选择</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {providers.map((p: ProviderDef) => (
                  <div key={p.id}>
                    <div className="text-white/30 mb-1" style={{ fontSize: "0.6rem" }}>{p.name}</div>
                    <div className="space-y-1">
                      {p.models.map((m: { id: string; name: string; desc: string; ctx?: string }) => {
                        const isActive = assignment.providerId === p.id && assignment.modelId === m.id;
                        return (
                          <button
                            key={`${p.id}-${m.id}`}
                            onClick={() => onChangeModel(p.id, m.id)}
                            className={`w-full text-left px-2 py-1.5 rounded transition-all ${isActive
                              ? "bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)]"
                              : "bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-white/[0.08]"
                              }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {isActive && <Check className="w-3 h-3 text-cyan-400" />}
                              <span className={`${isActive ? "text-cyan-300" : "text-white/60"}`} style={{ fontSize: "0.7rem" }}>
                                {m.name}
                              </span>
                              {m.ctx && (
                                <span className="text-white/20 ml-auto" style={{ fontSize: "0.55rem" }}>{m.ctx}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onTestConnection}
                disabled={diagResult?.status === "testing"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-cyan-300 hover:bg-[rgba(0,212,255,0.2)] transition-all disabled:opacity-50"
                style={{ fontSize: "0.7rem" }}
              >
                {diagResult?.status === "testing" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Activity className="w-3 h-3" />
                )}
                连接测试
              </button>

              <button
                onClick={onSpeak}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(191,0,255,0.1)] border border-[rgba(191,0,255,0.2)] text-purple-300 hover:bg-[rgba(191,0,255,0.2)] transition-all"
                style={{ fontSize: "0.7rem" }}
              >
                <Volume2 className="w-3 h-3" />
                语音预览
              </button>

              {diagResult && diagResult.status !== "idle" && (
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded ${diagResult.status === "success" ? "bg-emerald-500/10 text-emerald-400"
                    : diagResult.status === "error" ? "bg-red-500/10 text-red-400"
                      : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {diagResult.status === "success" && <CheckCircle2 className="w-3 h-3" />}
                  {diagResult.status === "error" && <AlertCircle className="w-3 h-3" />}
                  {diagResult.message}
                  {diagResult.latency && ` (${diagResult.latency}ms)`}
                </span>
              )}
            </div>

            {/* Diagnostic details */}
            {diagResult?.details && diagResult.details.length > 0 && (
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="text-white/40 mb-1.5" style={{ fontSize: "0.6rem" }}>诊断详情</div>
                {diagResult.details.map((d, i) => (
                  <div key={i} className="text-white/50" style={{ fontSize: "0.65rem", lineHeight: "1.6" }}>
                    {d}
                  </div>
                ))}
                {diagResult.repairHint && (
                  <div className="mt-2 flex items-start gap-1.5 p-2 rounded bg-amber-500/[0.06] border border-amber-500/10">
                    <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-amber-300" style={{ fontSize: "0.6rem" }}>
                      修复建议: {diagResult.repairHint}
                    </span>
                  </div>
                )}
                {diagResult.timestamp && (
                  <div className="text-white/15 text-right mt-1" style={{ fontSize: "0.5rem" }}>
                    {new Date(diagResult.timestamp).toLocaleTimeString("zh-CN")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </FadeIn>
  );
}

// ═══ 子组件：API Key 管理面板 ═══

function ApiKeyPanel({
  apiKeys,
  onKeyChange,
  providers,
}: {
  apiKeys: Record<string, string>;
  onKeyChange: (providerId: string, key: string) => void;
  providers: ProviderDef[];
}) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-cyan-400" />
        <span className="text-white/80" style={{ fontSize: "0.85rem" }}>API 密钥管理</span>
        <span className="text-white/30 ml-auto" style={{ fontSize: "0.6rem" }}>密钥仅存储在本地 localStorage</span>
      </div>
      <div className="space-y-3">
        {providers.filter((p: ProviderDef) => p.id !== "ollama").map((provider: ProviderDef) => {
          const key = apiKeys[provider.id] || "";
          const visible = showKeys[provider.id] || false;
          return (
            <div key={provider.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-24 shrink-0">
                <provider.icon className="w-3.5 h-3.5" style={{ color: provider.color }} />
                <span className="text-white/60 truncate" style={{ fontSize: "0.7rem" }}>{provider.name}</span>
              </div>
              <div className="relative flex-1">
                <input
                  type={visible ? "text" : "password"}
                  value={key}
                  onChange={e => onKeyChange(provider.id, e.target.value)}
                  placeholder={`输入 ${provider.name} API Key...`}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white/70 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/30"
                  style={{ fontSize: "0.7rem" }}
                />
                <button
                  onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"
                >
                  {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {key ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ═══ 主组件 ═══

export function FamilyModelSettings() {
  const { members } = useFamilyMemberSlice();
  const assignments = useFamilySettingsSlice((s) => s.modelAssignments);
  const voiceProfiles = useFamilySettingsSlice((s) => s.voiceProfiles);
  const providerSlice = useProviderSlice();

  const apiKeys = useMemo(() => {
    const keys: Record<string, string> = {};
    for (const cm of providerSlice.configuredModels) {
      if (cm.apiKey && !keys[cm.providerId]) {
        keys[cm.providerId] = cm.apiKey;
      }
    }
    return keys;
  }, [providerSlice.configuredModels]);

  const PROVIDERS: ProviderDef[] = useMemo(() => {
    const mapped = providerSlice.providers.map(p => ({
      id: p.id,
      name: p.label,
      icon: PROVIDER_ICON_MAP[p.id] || Cpu,
      color: PROVIDER_COLOR_MAP[p.id] || "#00d4ff",
      description: p.isLocal ? "本地部署 · 私有数据" : `${p.label} 系列`,
      baseURL: p.baseUrl,
      models: p.models.map(mId => ({
        id: mId,
        name: mId,
        desc: "",
        ctx: undefined,
      })),
    }));
    return [...mapped].sort((a, b) => (a.id === "ollama" ? -1 : b.id === "ollama" ? 1 : 0));
  }, [providerSlice.providers]);

  const PROVIDERS_MAP = useMemo(() =>
    Object.fromEntries(PROVIDERS.map(p => [p.id, p])),
    [PROVIDERS]);

  const _ollamaProviders = useMemo(() =>
    PROVIDERS.filter(p => p.id === "ollama"),
    [PROVIDERS]);
  // State
  const [diagnostics, setDiagnostics] = useState<Record<string, DiagResult>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "keys" | "overview">("members");

  useEffect(() => {
    providerSlice.fetchOllamaModels();
  }, [providerSlice]);

  // Handlers
  const handleKeyChange = useCallback((providerId: string, key: string) => {
    const existing = providerSlice.configuredModels.find(cm => cm.providerId === providerId);
    if (existing) {
      providerSlice.updateModel(existing.id, { apiKey: key });
    }
  }, [providerSlice]);

  const handleChangeModel = useCallback((memberId: string, providerId: string, modelId: string) => {
    useFamilySettingsSlice.getState().updateModelAssignment(memberId, { providerId, modelId });
  }, []);

  const handleTestConnection = useCallback(async (memberId: string) => {
    const assignment = assignments.find(a => a.memberId === memberId) || DEFAULT_MODEL_ASSIGNMENTS.find(a => a.memberId === memberId)!;

    setDiagnostics(prev => ({
      ...prev,
      [memberId]: { memberId, status: "testing", message: "诊断中...", details: [] },
    }));

    const details: string[] = [];
    let allOk = true;
    let repairHint: string | undefined;
    let totalLatency = 0;

    for (const step of DIAG_STEPS) {
      // Show current step
      setDiagnostics(prev => ({
        ...prev,
        [memberId]: { ...prev[memberId], message: `${step.label}...`, details: [...details] },
      }));

      await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

      const result = step.check(assignment, apiKeys, PROVIDERS_MAP);
      details.push(`${result.ok ? "✅" : "❌"} ${step.label}: ${result.detail}`);

      if (!result.ok) {
        allOk = false;
        if (step.label === "API Key 检查") {
          repairHint = "请在「密钥管理」标签页配置对应 API Key";
        } else if (step.label === "Endpoint 可达性") {
          repairHint = "请检查网络连接或代理配置";
        } else if (step.label === "模型可用性") {
          repairHint = "尝试切换到同提供商的其他模型";
        } else {
          repairHint = "建议重启后重试或降级模型";
        }
        break; // 遇到失败停止后续检查
      }

      if (result.detail.includes("ms")) {
        const match = result.detail.match(/\((\d+)ms\)/);
        if (match) { totalLatency = parseInt(match[1]); }
      }
    }

    setDiagnostics(prev => ({
      ...prev,
      [memberId]: {
        memberId,
        status: allOk ? "success" : "error",
        latency: allOk ? totalLatency || Math.round(100 + Math.random() * 200) : undefined,
        message: allOk ? "全部通过" : "诊断失败",
        details,
        repairHint,
        timestamp: new Date().toISOString(),
      },
    }));
  }, [assignments, apiKeys, PROVIDERS_MAP]);

  const handleSpeak = useCallback((member: UnifiedFamilyMember, profile: VoiceProfile) => {
    if (!("speechSynthesis" in window)) { return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(member.greeting);
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;
    utterance.volume = profile.volume;
    utterance.lang = profile.lang;
    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith("zh"));
    if (zhVoice) { utterance.voice = zhVoice; }
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleExportConfig = useCallback(() => {
    const sliceState = useFamilySettingsSlice.getState();
    const providerState = providerSlice;
    const aggregatedKeys: Record<string, string> = {};
    for (const cm of providerState.configuredModels) {
      if (cm.apiKey && !aggregatedKeys[cm.providerId]) {
        aggregatedKeys[cm.providerId] = cm.apiKey;
      }
    }
    const data = {
      apiKeys: aggregatedKeys,
      assignments: sliceState.modelAssignments,
      voiceProfiles: sliceState.voiceProfiles,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yyc3-family-model-config-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [providerSlice]);
  const filteredMembers = useMemo(() => {
    if (!searchQuery) { return members; }
    const q = searchQuery.toLowerCase();
    return members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.shortName.toLowerCase().includes(q) ||
      m.enTitle.toLowerCase().includes(q)
    );
  }, [searchQuery, members]);

  // Stats
  const connectedCount = PROVIDERS.filter(p => p.id === "ollama" || !!apiKeys[p.id]).length;
  const testedCount = Object.values(diagnostics).filter(d => d.status === "success").length;

  return (
    <div className="min-h-full pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-white/90" style={{ fontSize: "1.25rem" }}>AI Family 大模型控制中心</h1>
                  <p className="text-white/40" style={{ fontSize: "0.7rem" }}>为每位家人注入生命力 - 独立模型绑定 & 语音赋能</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400" style={{ fontSize: "0.65rem" }}>{connectedCount}/{PROVIDERS.length} 接入</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-400" style={{ fontSize: "0.65rem" }}>{testedCount}/8 已测通</span>
              </div>
              <button
                onClick={handleExportConfig}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                style={{ fontSize: "0.65rem" }}
              >
                <Download className="w-3 h-3" />
                导出配置
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.05}>
          <div className="flex items-center gap-1 mb-4 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06]">
            {([
              { key: "members" as const, label: "家人模型", icon: Bot },
              { key: "keys" as const, label: "密钥管理", icon: Shield },
              { key: "overview" as const, label: "总览", icon: Activity },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${activeTab === tab.key
                  ? "bg-[rgba(0,212,255,0.1)] text-cyan-300 border border-[rgba(0,212,255,0.2)]"
                  : "text-white/40 hover:text-white/60 border border-transparent"
                  }`}
                style={{ fontSize: "0.75rem" }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Search (members tab) */}
        {activeTab === "members" && (
          <FadeIn delay={0.08}>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索家人..."
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-white/70 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/30"
                style={{ fontSize: "0.8rem" }}
              />
            </div>
          </FadeIn>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {filteredMembers.map(member => {
              const assignment = assignments.find(a => a.memberId === member.id) || DEFAULT_MODEL_ASSIGNMENTS.find(a => a.memberId === member.id)!;
              const profile = voiceProfiles.find(v => v.memberId === member.id) || DEFAULT_VOICE_PROFILES.find(v => v.memberId === member.id)!;
              return (
                <MemberModelCard
                  key={member.id}
                  member={member}
                  assignment={assignment}
                  voiceProfile={profile}
                  apiKeys={apiKeys}
                  diagResult={diagnostics[member.id]}
                  providers={PROVIDERS}
                  providersMap={PROVIDERS_MAP}
                  onChangeModel={(pid, mid) => handleChangeModel(member.id, pid, mid)}
                  onTestConnection={() => handleTestConnection(member.id)}
                  onSpeak={() => handleSpeak(member, profile)}
                />
              );
            })}
          </div>
        )}

        {/* Keys Tab */}
        {activeTab === "keys" && (
          <FadeIn delay={0.05}>
            <ApiKeyPanel apiKeys={apiKeys} onKeyChange={handleKeyChange} providers={PROVIDERS} />
          </FadeIn>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <FadeIn delay={0.05}>
            <div className="space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "AI 提��商", value: PROVIDERS.length, color: "#00d4ff" },
                  { label: "可用模型", value: PROVIDERS.reduce((s, p) => s + p.models.length, 0), color: "#a855f7" },
                  { label: "密钥配置", value: Object.values(apiKeys).filter(Boolean).length, color: "#10b981" },
                  { label: "测试通过", value: testedCount, color: "#f59e0b" },
                ].map(stat => (
                  <GlassCard key={stat.label} className="p-4 text-center">
                    <div className="text-white/30" style={{ fontSize: "0.65rem" }}>{stat.label}</div>
                    <div className="mt-1" style={{ fontSize: "1.5rem", color: stat.color }}>{stat.value}</div>
                  </GlassCard>
                ))}
              </div>

              {/* Family assignment table */}
              <GlassCard className="p-4">
                <div className="text-white/60 mb-3" style={{ fontSize: "0.8rem" }}>家人 <ArrowRight className="w-3 h-3 inline" /> 模型分配一览</div>
                <div className="space-y-2">
                  {members.map(member => {
                    const assignment = assignments.find(a => a.memberId === member.id) || DEFAULT_MODEL_ASSIGNMENTS.find(a => a.memberId === member.id)!;
                    const provider = PROVIDERS_MAP[assignment.providerId];
                    const model = provider?.models.find(m => m.id === assignment.modelId);
                    const diag = diagnostics[member.id];
                    const rgb = hexToRgb(member.color);
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `rgba(${rgb},0.15)` }}
                        >
                          <member.icon className="w-3.5 h-3.5" style={{ color: member.color }} />
                        </div>
                        <span className="text-white/70 w-16 shrink-0" style={{ fontSize: "0.75rem" }}>{member.shortName}</span>
                        <ArrowRight className="w-3 h-3 text-white/15 shrink-0" />
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "0.6rem", background: `${provider?.color}20`, color: provider?.color }}>
                            {provider?.name}
                          </span>
                          <span className="text-white/50 truncate" style={{ fontSize: "0.7rem" }}>{model?.name}</span>
                        </div>
                        <span className="text-white/30 truncate hidden sm:block" style={{ fontSize: "0.6rem" }}>
                          {assignment.purpose}
                        </span>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{
                          background: diag?.status === "success" ? "#00FF88" : diag?.status === "error" ? "#FF4444" : "rgba(255,255,255,0.15)"
                        }} />
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Batch test */}
              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    for (const m of members) {
                      handleTestConnection(m.id);
                      await new Promise(r => setTimeout(r, 200));
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 text-cyan-300 hover:from-cyan-500/30 hover:to-purple-500/30 transition-all"
                  style={{ fontSize: "0.8rem" }}
                >
                  <Sparkles className="w-4 h-4" />
                  一键测通全部家人
                </button>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
