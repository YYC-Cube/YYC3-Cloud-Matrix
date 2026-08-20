/**
 * @file: UnifiedModelManager.tsx
 * @description: 统一模型管理组件 — 选择→测试→测通→使用 完整闭环
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-30
 * @updated: 2026-04-30
 * @status: active
 * @tags: [component],[model],[unified]
 */

import {
  CheckCircle,
  Cpu,
  Edit2,
  Eye, EyeOff,
  HelpCircle,
  Plug,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Wifi, WifiOff,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../hooks/useI18n";
import { useModelProvider } from "../hooks/useModelProvider";
import type { ConfiguredModel } from "../types";
import { GlassCard } from "../modules/shared/GlassCard";

const STATUS_CONFIG = {
  active: { color: "#00ff88", bg: "rgba(0,255,136,0.1)", icon: CheckCircle, label: "已激活" },
  error: { color: "#ff3366", bg: "rgba(255,51,102,0.1)", icon: XCircle, label: "异常" },
  unchecked: { color: "#aa55ff", bg: "rgba(170,85,255,0.1)", icon: HelpCircle, label: "未检测" },
};

interface UnifiedModelManagerProps {
  compact?: boolean;
  showHeader?: boolean;
}

export function UnifiedModelManager({ compact = false, showHeader = true }: UnifiedModelManagerProps) {
  const { t } = useI18n();
  const {
    providers,
    configuredModels,
    activeModelId,
    testingIds,
    addModel,
    updateModel,
    removeModel,
    testConnection,
    testAllConnections,
    setActiveModel,
  } = useModelProvider();

  const [editModel, setEditModel] = useState<ConfiguredModel | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // form state
  const [fProviderId, setFProviderId] = useState<string>("");
  const [fModel, setFModel] = useState("");
  const [fApiKey, setFApiKey] = useState("");
  const [fBaseUrl, setFBaseUrl] = useState("");
  const [fProxyUrl, setFProxyUrl] = useState("");

  const providerOptions = useMemo(() =>
    providers.map(p => ({
      id: p.id,
      label: p.label,
      baseUrl: p.baseUrl,
      isLocal: p.isLocal,
      requiresApiKey: p.requiresApiKey,
    })),
    [providers]);

  const selectedProviderModels = useMemo(() => {
    if (!fProviderId) { return []; }
    return providers.find(p => p.id === fProviderId)?.models || [];
  }, [fProviderId, providers]);

  const stats = useMemo(() => ({
    total: configuredModels.length,
    active: configuredModels.filter(m => m.status === "active").length,
    error: configuredModels.filter(m => m.status === "error").length,
    unchecked: configuredModels.filter(m => m.status === "unchecked").length,
  }), [configuredModels]);

  const openAdd = () => {
    setEditModel(null);
    setIsAdding(true);
    setShowForm(true);
    setFProviderId(providerOptions[0]?.id || "");
    setFModel(""); setFApiKey(""); setFBaseUrl(""); setFProxyUrl("");
  };

  const openEdit = (m: ConfiguredModel) => {
    setEditModel(m);
    setIsAdding(false);
    setShowForm(true);
    setFProviderId(m.providerId);
    setFModel(m.model); setFApiKey(m.apiKey); setFBaseUrl(m.baseUrl); setFProxyUrl(m.proxyUrl || "");
  };

  const closeForm = () => { setEditModel(null); setIsAdding(false); setShowForm(false); };

  const handleSave = useCallback(() => {
    if (!fProviderId) { toast.error("请选择服务商"); return; }
    if (!fModel.trim()) { toast.error("请输入模型名称"); return; }

    const provider = providers.find(p => p.id === fProviderId);
    const baseUrl = fBaseUrl.trim() || provider?.baseUrl || "";

    if (isAdding) {
      const newModel = addModel(fProviderId as any, fModel.trim(), fApiKey.trim(), baseUrl || undefined, fProxyUrl.trim() || undefined);
      if (newModel) {
        toast.success(`模型 ${fModel} 已添加`, { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(0,255,136,0.3)", color: "#e0f0ff" } });
        closeForm();
      }
    } else if (editModel) {
      updateModel(editModel.id, {
        model: fModel.trim(),
        apiKey: fApiKey.trim(),
        baseUrl: baseUrl || editModel.baseUrl,
        proxyUrl: fProxyUrl.trim() || undefined,
      });
      toast.success(`模型 ${fModel} 已更新`, { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(0,255,136,0.3)", color: "#e0f0ff" } });
      closeForm();
    }
  }, [fProviderId, fModel, fApiKey, fBaseUrl, fProxyUrl, isAdding, editModel, providers, addModel, updateModel]);

  const handleTest = useCallback(async (id: string) => {
    try {
      await testConnection(id);
      toast.success("连接测试通过", { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(0,255,136,0.3)", color: "#e0f0ff" } });
    } catch (e: any) {
      toast.error(`测试失败: ${e.message}`, { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(255,51,102,0.3)", color: "#e0f0ff" } });
    }
  }, [testConnection]);

  const handleTestAll = useCallback(async () => {
    if (configuredModels.length === 0) {
      toast.info("暂无模型可测试");
      return;
    }
    toast.info(`正在测试 ${configuredModels.length} 个模型...`, { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(0,212,255,0.3)", color: "#e0f0ff" } });
    await testAllConnections();
    const updatedStats = { active: 0, error: 0 };
    configuredModels.forEach(m => { if (m.status === "active") { updatedStats.active++; } if (m.status === "error") { updatedStats.error++; } });
    toast.success(`测试完成: ${updatedStats.active} 通过, ${updatedStats.error} 失败`, { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(0,255,136,0.3)", color: "#e0f0ff" } });
  }, [configuredModels, testAllConnections]);

  const handleSelect = useCallback((id: string) => {
    setActiveModel(id);
    const model = configuredModels.find(m => m.id === id);
    if (model) {
      toast.success(`已选择: ${model.model} (${model.providerLabel})`, { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(0,255,136,0.3)", color: "#e0f0ff" } });
    }
  }, [configuredModels, setActiveModel]);

  const handleDelete = useCallback((id: string) => {
    removeModel(id);
    if (activeModelId === id) { setActiveModel(null); }
    toast.success("模型已删除", { style: { background: "rgba(8,25,55,0.95)", border: "1px solid rgba(0,255,136,0.3)", color: "#e0f0ff" } });
    setDeleteConfirm(null);
  }, [removeModel, activeModelId, setActiveModel]);

  const toggleApiKey = (id: string) => {
    setShowApiKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4" data-testid="unified-model-manager">
      {showHeader && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <div>
              <h2 className="text-[#e0f0ff]" style={{ fontSize: "1.1rem" }}>模型管理</h2>
              <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.7rem" }}>选择 → 测试 → 测通 → 使用</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleTestAll}
              disabled={testingIds.length > 0 || configuredModels.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.2)] text-[#00ff88] hover:bg-[rgba(0,255,136,0.15)] transition-all disabled:opacity-40"
              style={{ fontSize: "0.78rem" }}
              title="测试所有模型连接"
            >
              {testingIds.length > 0 ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {testingIds.length > 0 ? `测试中 (${testingIds.length})` : "全部测试"}
            </button>

            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(0,140,200,0.15)] border border-[rgba(0,180,255,0.3)] text-[#00d4ff] hover:bg-[rgba(0,140,200,0.25)] transition-all"
              style={{ fontSize: "0.78rem" }}
            >
              <Plus className="w-4 h-4" />
              添加模型
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={`grid gap-3 ${compact ? "grid-cols-3" : "grid-cols-4"}`}>
        <GlassCard className="p-3 flex flex-col items-center">
          <span className="text-[#e0f0ff]" style={{ fontSize: "1.1rem", fontFamily: "'Orbitron', monospace" }}>
            {stats.total}
          </span>
          <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.62rem" }}>总模型</p>
        </GlassCard>
        <GlassCard className="p-3 flex flex-col items-center">
          <span className="text-[#00ff88]" style={{ fontSize: "1.1rem", fontFamily: "'Orbitron', monospace" }}>
            {stats.active}
          </span>
          <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.62rem" }}>已激活</p>
        </GlassCard>
        {!compact && (
          <GlassCard className="p-3 flex flex-col items-center">
            <span className="text-[#ff3366]" style={{ fontSize: "1.1rem", fontFamily: "'Orbitron', monospace" }}>
              {stats.error}
            </span>
            <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.62rem" }}>异常</p>
          </GlassCard>
        )}
        <GlassCard className="p-3 flex flex-col items-center">
          <span className="text-[#aa55ff]" style={{ fontSize: "1.1rem", fontFamily: "'Orbitron', monospace" }}>
            {stats.unchecked}
          </span>
          <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.62rem" }}>未检测</p>
        </GlassCard>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[#e0f0ff] flex items-center gap-2" style={{ fontSize: "0.88rem" }}>
              <Plug className="w-4 h-4 text-[#00d4ff]" />
              {isAdding ? "添加新模型" : `编辑: ${editModel?.model}`}
            </h4>
            <button onClick={closeForm} className="p-1 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-all" title="关闭">
              <X className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[rgba(0,212,255,0.5)] block mb-1" style={{ fontSize: "0.7rem" }}>服务商 *</label>
              <select value={fProviderId} onChange={e => { setFProviderId(e.target.value); setFModel(""); }}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#00d4ff] focus:outline-none"
                style={{ fontSize: "0.8rem" }}
                title="选择服务商"
              >
                {providerOptions.map(p => (
                  <option key={p.id} value={p.id} style={{ background: "#0a1830" }}>
                    {p.label}{p.isLocal ? " (本地)" : ""}{p.requiresApiKey ? " 🔑" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[rgba(0,212,255,0.5)] block mb-1" style={{ fontSize: "0.7rem" }}>模型 *</label>
              {selectedProviderModels.length > 0 ? (
                <select value={fModel} onChange={e => setFModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#00d4ff] focus:outline-none"
                  style={{ fontSize: "0.8rem" }}
                  title="选择模型"
                >
                  <option value="" style={{ background: "#0a1830" }}>选择模型...</option>
                  {selectedProviderModels.map(m => <option key={m} value={m} style={{ background: "#0a1830" }}>{m}</option>)}
                </select>
              ) : (
                <input value={fModel} onChange={e => setFModel(e.target.value)} placeholder="输入模型名称"
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
                  style={{ fontSize: "0.8rem" }} />
              )}
            </div>
            <div>
              <label className="text-[rgba(0,212,255,0.5)] block mb-1" style={{ fontSize: "0.7rem" }}>API Key</label>
              <input value={fApiKey} onChange={e => setFApiKey(e.target.value)} type="password" placeholder="sk-..."
                className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
                style={{ fontSize: "0.8rem" }} />
            </div>
            <div>
              <label className="text-[rgba(0,212,255,0.5)] block mb-1" style={{ fontSize: "0.7rem" }}>Base URL</label>
              <input value={fBaseUrl} onChange={e => setFBaseUrl(e.target.value)} placeholder={providers.find(p => p.id === fProviderId)?.baseUrl || "https://..."}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
                style={{ fontSize: "0.8rem" }} />
            </div>
            <div>
              <label className="text-[rgba(0,212,255,0.5)] block mb-1" style={{ fontSize: "0.7rem" }}>代理 URL (可选)</label>
              <input value={fProxyUrl} onChange={e => setFProxyUrl(e.target.value)} placeholder="https://proxy.example.com"
                className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#e0f0ff] focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
                style={{ fontSize: "0.8rem" }} />
            </div>
          </div>
          <div className="flex gap-2 pt-3">
            <button onClick={closeForm}
              className="px-4 py-2 rounded-lg bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] transition-all"
              style={{ fontSize: "0.78rem" }}>取消</button>
            <button onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[rgba(0,140,200,0.5)] border border-[rgba(0,180,255,0.3)] text-white hover:bg-[rgba(0,160,220,0.6)] transition-all flex items-center gap-1.5"
              style={{ fontSize: "0.78rem" }}>
              <Save className="w-3.5 h-3.5" />
              {isAdding ? "创建" : "保存"}
            </button>
          </div>
        </GlassCard>
      )}

      {/* Model List */}
      <div className="space-y-2.5">
        {configuredModels.length === 0 && (
          <GlassCard className="p-8 text-center">
            <Cpu className="w-10 h-10 text-[rgba(0,212,255,0.2)] mx-auto mb-3" />
            <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.85rem" }}>暂无模型配置</p>
            <p className="text-[rgba(0,212,255,0.2)] mt-1" style={{ fontSize: "0.72rem" }}>点击「添加模型」开始配置 AI 服务</p>
            <button onClick={openAdd}
              className="mt-4 px-4 py-2 rounded-lg bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.25)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.2)] transition-all inline-flex items-center gap-1.5"
              style={{ fontSize: "0.78rem" }}>
              <Plus className="w-3.5 h-3.5" />
              添加第一个模型
            </button>
          </GlassCard>
        )}

        {configuredModels.map((model) => {
          const provider = providers.find(p => p.id === model.providerId);
          const sc = STATUS_CONFIG[model.status];
          const StatusIcon = sc.icon;
          const isActive = activeModelId === model.id;
          const isTesting = testingIds.includes(model.id);
          const showKey = showApiKeys[model.id];

          return (
            <div
              key={model.id}
              className={`relative p-3.5 rounded-xl transition-all duration-300 cursor-pointer ${isActive
                ? "bg-[rgba(0,255,136,0.05)] border-2 border-[rgba(0,255,136,0.3)] shadow-[0_0_20px_rgba(0,255,136,0.08)]"
                : "bg-[rgba(0,40,80,0.12)] border border-[rgba(0,180,255,0.08)] hover:border-[rgba(0,180,255,0.2)]"
                }`}
              onClick={() => handleSelect(model.id)}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
              )}

              <div className="flex items-center justify-between gap-3">
                {/* Left: Model Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg shrink-0 ${isActive ? "bg-[rgba(0,255,136,0.12)]" : "bg-[rgba(0,212,255,0.08)]"}`}>
                    <Cpu className={`w-4 h-4 ${isActive ? "text-[#00ff88]" : "text-[#00d4ff]"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#e0f0ff] truncate" style={{ fontSize: "0.85rem" }}>{model.model}</span>
                      {isActive && (
                        <span className="px-1.5 py-0.5 rounded bg-[rgba(0,255,136,0.1)] text-[#00ff88] shrink-0" style={{ fontSize: "0.55rem" }}>当前使用</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[rgba(0,212,255,0.3)] truncate" style={{ fontSize: "0.62rem", fontFamily: "'JetBrains Mono', monospace" }}>
                        {provider?.label || model.providerId}
                      </span>
                      <span className="text-[rgba(0,212,255,0.15)]" style={{ fontSize: "0.55rem" }}>·</span>
                      <span className="text-[rgba(0,212,255,0.2)] truncate" style={{ fontSize: "0.6rem" }}>
                        {model.baseUrl}
                      </span>
                    </div>
                    {model.apiKey && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[rgba(0,212,255,0.15)]" style={{ fontSize: "0.55rem" }}>Key:</span>
                        <span className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.55rem", fontFamily: "'JetBrains Mono', monospace" }}>
                          {showKey ? model.apiKey : `${model.apiKey.slice(0, 6)}${"•".repeat(12)}`}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleApiKey(model.id); }}
                          className="p-0.5 rounded hover:bg-[rgba(0,212,255,0.1)]"
                        >
                          {showKey ? <EyeOff className="w-2.5 h-2.5 text-[rgba(0,212,255,0.3)]" /> : <Eye className="w-2.5 h-2.5 text-[rgba(0,212,255,0.3)]" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status + Actions */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Status Badge */}
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${sc.bg}`} style={{ fontSize: "0.65rem", color: sc.color }}>
                    <StatusIcon className="w-3 h-3" />
                    {sc.label}
                  </span>

                  {/* Test Button */}
                  <button
                    onClick={() => handleTest(model.id)}
                    disabled={isTesting}
                    className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-all disabled:opacity-50"
                    title="测试连接"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#00d4ff] animate-spin" />
                    ) : model.status === "active" ? (
                      <Wifi className="w-3.5 h-3.5 text-[#00ff88]" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5 text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff]" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(model)}
                    className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-all"
                    title="编辑"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff]" />
                  </button>

                  {/* Delete */}
                  {deleteConfirm === model.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(model.id)} className="p-1.5 rounded-lg bg-[rgba(255,51,102,0.2)] hover:bg-[rgba(255,51,102,0.3)]" title="确认删除">
                        <CheckCircle className="w-3.5 h-3.5 text-[#ff3366]" />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)]" title="取消">
                        <X className="w-3.5 h-3.5 text-[rgba(0,212,255,0.3)]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(model.id)}
                      className="p-1.5 rounded-lg hover:bg-[rgba(255,51,102,0.1)] transition-all"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[rgba(0,212,255,0.3)] hover:text-[#ff3366]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
