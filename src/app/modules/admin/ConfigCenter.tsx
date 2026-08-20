/**
 * @file: ConfigCenter.tsx
 * @description: 配置中心 — 页面配置 + 存储管理
 * @author: YanYuCloudCube Team
 * @version: v1.1.0
 * @created: 2026-04-06
 * @updated: 2026-05-05
 * @status: active
 * @tags: [component]
 */

import { useState } from "react";
import { PageConfigEditor } from "./PageConfigEditor";
import { getAllPages, type PageConfig } from "../../config";
import { GlassCard } from "../shared/GlassCard";
import {
  Settings,
  FileText,
  Database,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) { return `${bytes} B`; }
  if (bytes < 1024 * 1024) { return `${(bytes / 1024).toFixed(1)} KB`; }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ConfigCenter() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pages] = useState(() => getAllPages());
  const [activeTab, setActiveTab] = useState<"pages" | "storage">("pages");

  const groupedPages = pages.reduce(
    (acc, page) => {
      const group = page.sidebar.navGroup;
      if (!acc[group]) { acc[group] = []; }
      acc[group].push(page);
      return acc;
    },
    {} as Record<string, PageConfig[]>,
  );

  const handleExportAll = () => {
    const data = {
      pages: Object.fromEntries(pages.map((p) => [p.id, p])),
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yyc3-config-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAll = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            console.info("[ConfigCenter] Imported config:", data);
          } catch {
            console.error("[ConfigCenter] Failed to parse config file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetAll = () => {
    if (confirm("确定要重置所有配置吗？此操作不可撤销。")) {
      localStorage.removeItem("yyc3-page-configs");
      localStorage.removeItem("yyc3-design-system-overrides");
      window.location.reload();
    }
  };

  const tabs: { key: typeof activeTab; label: string; icon: typeof FileText }[] = [
    { key: "pages", label: "页面配置", icon: FileText },
    { key: "storage", label: "存储管理", icon: Database },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar px-3 md:px-6 py-4 md:py-6 space-y-5">
      {/* ════ Header ════ */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h2 className="text-[#e0f0ff]" style={{ fontSize: "1.1rem" }}>配置中心</h2>
            <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.7rem" }}>
              统一管理页面配置与存储数据
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImportAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(0,180,255,0.15)] bg-[rgba(0,20,40,0.3)] text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:border-[rgba(0,180,255,0.3)] transition-all"
            style={{ fontSize: "0.72rem" }}
          >
            <Upload className="w-3.5 h-3.5" />
            导入
          </button>
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(0,180,255,0.15)] bg-[rgba(0,20,40,0.3)] text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:border-[rgba(0,180,255,0.3)] transition-all"
            style={{ fontSize: "0.72rem" }}
          >
            <Download className="w-3.5 h-3.5" />
            导出
          </button>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(255,51,102,0.15)] bg-[rgba(255,51,102,0.03)] text-[rgba(255,51,102,0.5)] hover:text-[#ff3366] hover:border-[rgba(255,51,102,0.3)] transition-all"
            style={{ fontSize: "0.72rem" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>
      </div>

      {/* ════ Tab Nav ════ */}
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border border-[rgba(0,212,255,0.25)]"
                  : "text-[rgba(0,212,255,0.4)] border border-transparent hover:border-[rgba(0,180,255,0.15)]"
              }`}
              style={{ fontSize: "0.78rem" }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ════ Content ════ */}
      {activeTab === "pages" && (
        <div className="flex gap-4 flex-1 min-h-0">
          <GlassCard className="w-64 shrink-0 p-3 flex flex-col overflow-hidden">
            <h3 className="text-[#e0f0ff] px-2 mb-3" style={{ fontSize: "0.82rem" }}>页面列表</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
              {Object.entries(groupedPages).map(([group, groupPages]) => (
                <div key={group}>
                  <h4 className="px-2 py-1 text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.62rem" }}>
                    {group}
                  </h4>
                  <div className="space-y-1">
                    {groupPages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => setSelectedPageId(page.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                          selectedPageId === page.id
                            ? "bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border border-[rgba(0,212,255,0.2)]"
                            : "hover:bg-[rgba(0,212,255,0.04)] text-[#c0dcf0] border border-transparent"
                        }`}
                        style={{ fontSize: "0.75rem" }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{page.title}</span>
                          {page.editable && (
                            <span className="px-1.5 py-0.5 rounded text-[rgba(0,255,136,0.7)]" style={{ fontSize: "0.6rem", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
                              可编辑
                            </span>
                          )}
                        </div>
                        <p className="text-[rgba(0,212,255,0.3)] truncate mt-0.5" style={{ fontSize: "0.6rem" }}>
                          {page.path}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="flex-1 p-4 overflow-auto">
            {selectedPageId ? (
              <PageConfigEditor pageId={selectedPageId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <FileText className="w-10 h-10 text-[rgba(0,212,255,0.15)] mb-4" />
                <p className="text-[#e0f0ff]" style={{ fontSize: "0.88rem" }}>选择一个页面</p>
                <p className="text-[rgba(0,212,255,0.35)] mt-1" style={{ fontSize: "0.7rem" }}>
                  从左侧列表中选择一个页面进行配置
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {activeTab === "storage" && (
        <StorageManager />
      )}
    </div>
  );
}

function StorageManager() {
  const [storageKeys] = useState(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("yyc3")) {
        keys.push(key);
      }
    }
    return keys.sort();
  });

  const getStorageSize = (key: string): number => {
    const value = localStorage.getItem(key);
    return value ? new Blob([value]).size : 0;
  };

  const handleClearKey = (key: string) => {
    if (confirm(`确定要清除 ${key} 吗？`)) {
      localStorage.removeItem(key);
      window.location.reload();
    }
  };

  const handleClearAll = () => {
    if (confirm("确定要清除所有 YYC³ 存储数据吗？此操作不可撤销。")) {
      storageKeys.forEach((key) => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  const totalSize = storageKeys.reduce((sum, key) => sum + getStorageSize(key), 0);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[#e0f0ff] flex items-center gap-2" style={{ fontSize: "0.88rem" }}>
            <Database className="w-4 h-4 text-[#00d4ff]" />
            存储管理
          </h3>
          <p className="text-[rgba(0,212,255,0.35)] mt-1" style={{ fontSize: "0.7rem" }}>
            查看和管理本地存储数据
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-[#00d4ff]" style={{ fontSize: "0.68rem", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
            {storageKeys.length} 项 · {formatBytes(totalSize)}
          </span>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[rgba(255,51,102,0.15)] text-[rgba(255,51,102,0.5)] hover:text-[#ff3366] hover:border-[rgba(255,51,102,0.3)] transition-all"
            style={{ fontSize: "0.68rem" }}
          >
            清除全部
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {storageKeys.map((key) => {
          const size = getStorageSize(key);
          return (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-xl bg-[rgba(0,40,80,0.15)] border border-[rgba(0,180,255,0.06)]"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-[rgba(0,212,255,0.4)]" />
                <div>
                  <code className="text-[#e0f0ff]" style={{ fontSize: "0.75rem" }}>{key}</code>
                  <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.62rem" }}>{formatBytes(size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const value = localStorage.getItem(key);
                    if (value) { console.info(`${key}:`, JSON.parse(value)); }
                  }}
                  className="px-2 py-1 rounded-lg text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.06)] transition-all"
                  style={{ fontSize: "0.68rem" }}
                >
                  查看
                </button>
                <button
                  onClick={() => handleClearKey(key)}
                  className="px-2 py-1 rounded-lg text-[rgba(255,51,102,0.4)] hover:text-[#ff3366] hover:bg-[rgba(255,51,102,0.06)] transition-all"
                  style={{ fontSize: "0.68rem" }}
                >
                  清除
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default ConfigCenter;
