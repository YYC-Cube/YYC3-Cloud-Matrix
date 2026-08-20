/**
 * @file: UnifiedModelSelector.tsx
 * @description: 统一模型选择器 — 只读组件，供所有页面复用
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-05-01
 * @updated: 2026-05-01
 * @status: active
 * @tags: [component],[model],[unified]
 *
 * @details:
 * - 只读：可选择、测试，不可增删改
 * - 数据源：provider-slice (唯一全局数据核心)
 * - 总控在 SystemSettings > UnifiedModelManager
 * - 供 AI Family / AI 智能 / IDE / AI 浮窗等页面使用
 */

import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useProviderSlice } from "../../store/slices/provider-slice";
import type { ConfiguredModel } from "../../types";
import { GlassCard } from "../shared/GlassCard";

interface UnifiedModelSelectorProps {
  value?: string | null;
  onChange: (modelId: string, model: ConfiguredModel) => void;
  label?: string;
  placeholder?: string;
  showTestButton?: boolean;
  showProviderGroup?: boolean;
  compact?: boolean;
  className?: string;
  filterByProvider?: string[];
}

function StatusBadge({ status }: { status: ConfiguredModel["status"] }) {
  switch (status) {
    case "active":
      return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
    case "error":
      return <XCircle className="w-3 h-3 text-red-400" />;
    default:
      return <Activity className="w-3 h-3 text-white/30" />;
  }
}

function ModelItem({
  model,
  isSelected,
  isTesting,
  onSelect,
  onTest,
  compact,
}: {
  model: ConfiguredModel;
  isSelected: boolean;
  isTesting: boolean;
  onSelect: () => void;
  onTest?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${isSelected
        ? "bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.25)]"
        : "hover:bg-white/[0.04] border border-transparent"
        }`}
      onClick={onSelect}
    >
      <StatusBadge status={model.status} />
      <div className="flex-1 min-w-0">
        <p
          className={`truncate ${isSelected ? "text-cyan-300" : "text-[rgba(224,240,255,0.7)]"}`}
          style={{ fontSize: compact ? "0.7rem" : "0.78rem" }}
        >
          {model.model}
        </p>
        {!compact && (
          <p className="text-[rgba(224,240,255,0.3)] truncate" style={{ fontSize: "0.6rem" }}>
            {model.providerLabel}
          </p>
        )}
      </div>
      {model.lastTestResult && (
        <span className="text-[rgba(224,240,255,0.25)] shrink-0" style={{ fontSize: "0.55rem" }}>
          {model.lastTestResult.totalLatencyMs}ms
        </span>
      )}
      {onTest && (
        <button
          onClick={(e) => { e.stopPropagation(); onTest(); }}
          disabled={isTesting}
          className="shrink-0 p-1 rounded text-white/20 hover:text-cyan-400 transition-colors disabled:opacity-50"
          title="测试连接"
        >
          {isTesting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Zap className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );
}

export function UnifiedModelSelector({
  value,
  onChange,
  label = "选择模型",
  placeholder = "选择 AI 模型",
  showTestButton = true,
  showProviderGroup = true,
  compact = false,
  className = "",
  filterByProvider,
}: UnifiedModelSelectorProps) {
  const {
    configuredModels,
    testingIds,
    testConnection,
    fetchOllamaModels,
    activeModelId,
  } = useProviderSlice();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const selectedModel = useMemo(() => {
    if (value) { return configuredModels.find((m) => m.id === value); }
    if (activeModelId) { return configuredModels.find((m) => m.id === activeModelId); }
    return undefined;
  }, [value, activeModelId, configuredModels]);

  const filteredModels = useMemo(() => {
    let models = configuredModels;
    if (filterByProvider && filterByProvider.length > 0) {
      models = models.filter((m) => filterByProvider.includes(m.providerId));
    }
    if (search) {
      const q = search.toLowerCase();
      models = models.filter(
        (m) =>
          m.model.toLowerCase().includes(q) ||
          m.providerLabel.toLowerCase().includes(q)
      );
    }
    return [...models].sort((a, b) => {
      const aLocal = a.providerId === "ollama" ? 0 : 1;
      const bLocal = b.providerId === "ollama" ? 0 : 1;
      return aLocal - bLocal;
    });
  }, [configuredModels, filterByProvider, search]);

  const grouped = useMemo(() => {
    if (!showProviderGroup) { return { all: filteredModels }; }
    return filteredModels.reduce(
      (acc, m) => {
        const key = m.providerLabel;
        if (!acc[key]) { acc[key] = []; }
        acc[key].push(m);
        return acc;
      },
      {} as Record<string, ConfiguredModel[]>,
    );
  }, [filteredModels, showProviderGroup]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOllamaModels();
    } finally {
      setRefreshing(false);
    }
  };

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePos = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePos();
      const onScroll = () => updatePos();
      const onResize = () => updatePos();
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
      };
    }
  }, [isOpen, updatePos]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-[rgba(224,240,255,0.5)] mb-1.5" style={{ fontSize: "0.7rem" }}>
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${isOpen
          ? "bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.25)]"
          : "bg-white/[0.04] border-white/10 hover:border-white/20"
          }`}
      >
        {selectedModel ? (
          <>
            <StatusBadge status={selectedModel.status} />
            <span className="flex-1 text-[rgba(224,240,255,0.8)] truncate" style={{ fontSize: "0.78rem" }}>
              {selectedModel.model}
            </span>
            <span className="text-[rgba(224,240,255,0.3)] shrink-0" style={{ fontSize: "0.6rem" }}>
              {selectedModel.providerLabel}
            </span>
          </>
        ) : (
          <span className="flex-1 text-[rgba(224,240,255,0.3)]" style={{ fontSize: "0.78rem" }}>
            {placeholder}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && typeof window !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] rounded-xl bg-[rgba(10,15,30,0.98)] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden"
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
        >
          <div className="p-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <Search className="w-3 h-3 text-white/30" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索模型..."
                  className="flex-1 bg-transparent text-[rgba(224,240,255,0.7)] outline-none"
                  style={{ fontSize: "0.72rem" }}
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
                title="刷新 Ollama 模型列表"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5">
            {filteredModels.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[rgba(224,240,255,0.3)]" style={{ fontSize: "0.75rem" }}>
                  {configuredModels.length === 0
                    ? "未配置模型 — 请在「系统设置 > 模型管理」中添加"
                    : "无匹配模型"}
                </p>
              </div>
            ) : showProviderGroup ? (
              Object.entries(grouped).map(([provider, models]) => (
                <div key={provider} className="mb-2">
                  <p className="px-2 py-1 text-[rgba(224,240,255,0.4)] font-medium" style={{ fontSize: "0.6rem" }}>
                    {provider}
                  </p>
                  {models.map((m) => (
                    <ModelItem
                      key={m.id}
                      model={m}
                      isSelected={m.id === (value || activeModelId)}
                      isTesting={testingIds.includes(m.id)}
                      onSelect={() => {
                        onChange(m.id, m);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      onTest={showTestButton ? () => testConnection(m.id) : undefined}
                      compact={compact}
                    />
                  ))}
                </div>
              ))
            ) : (
              filteredModels.map((m) => (
                <ModelItem
                  key={m.id}
                  model={m}
                  isSelected={m.id === (value || activeModelId)}
                  isTesting={testingIds.includes(m.id)}
                  onSelect={() => {
                    onChange(m.id, m);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  onTest={showTestButton ? () => testConnection(m.id) : undefined}
                  compact={compact}
                />
              ))
            )}
          </div>

          <div className="px-3 py-2 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[rgba(224,240,255,0.2)]" style={{ fontSize: "0.55rem" }}>
              共 {filteredModels.length} 个模型 · 数据来自全局设置
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[rgba(224,240,255,0.3)] hover:text-[rgba(224,240,255,0.6)] transition-colors"
              style={{ fontSize: "0.6rem" }}
            >
              关闭
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export function ModelTestCard({
  model,
  onRetest,
}: {
  model: ConfiguredModel;
  onRetest: () => void;
}) {
  const { testingIds } = useProviderSlice();
  const isTesting = testingIds.includes(model.id);

  return (
    <GlassCard className="p-3" glowColor={model.status === "active" ? "rgba(16,185,129,0.03)" : "rgba(239,68,68,0.03)"}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={model.status} />
          <span className="text-[rgba(224,240,255,0.8)]" style={{ fontSize: "0.8rem" }}>
            {model.model}
          </span>
          <span className="text-[rgba(224,240,255,0.3)]" style={{ fontSize: "0.6rem" }}>
            {model.providerLabel}
          </span>
        </div>
        <button
          onClick={onRetest}
          disabled={isTesting}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] text-white/40 hover:text-cyan-400 transition-all disabled:opacity-50"
          style={{ fontSize: "0.65rem" }}
        >
          {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          {isTesting ? "测试中" : "重新测试"}
        </button>
      </div>
      {model.lastTestResult && (
        <div className="space-y-1">
          {model.lastTestResult.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              {step.status === "pass" ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : step.status === "warn" ? (
                <Activity className="w-3 h-3 text-amber-400 shrink-0" />
              ) : step.status === "fail" ? (
                <XCircle className="w-3 h-3 text-red-400 shrink-0" />
              ) : (
                <Activity className="w-3 h-3 text-white/20 shrink-0" />
              )}
              <span className="text-[rgba(224,240,255,0.5)]" style={{ fontSize: "0.65rem" }}>
                {step.label}: {step.detail}
              </span>
            </div>
          ))}
          {model.lastTestResult.suggestion && (
            <p className="text-amber-300/60 mt-1" style={{ fontSize: "0.6rem" }}>
              💡 {model.lastTestResult.suggestion}
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
}
