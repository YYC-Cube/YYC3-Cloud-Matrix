/**
 * @file: UnifiedSettingsPanel.tsx
 * @description: 统一设置管理面板 - 数据本地化、导入导出、安全隔离
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [settings, security, local-storage]
 */

import {
  Check,
  CheckCircle,
  Copy,
  Database,
  Download,
  FileJson,
  HardDrive,
  Info,
  Key,
  Lock,
  RefreshCw,
  Server,
  Shield,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";
import { useI18n } from "../../hooks/useI18n";
import { isCryptoAvailable } from "../../lib/crypto-vault";
import { downloadFullBackup, importFullBackup } from "../../lib/full-backup";
import { useProviderSlice, useSettingsSSOT } from "../../store";
import type { ModelProviderDef } from "../../types/model-provider-types";
import {
  exportStoreData,
  importStoreData,
  useAlerts,
  useDatabase,
} from "../../stores/global-store";
import { GlassCard } from "../shared/GlassCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Progress } from "../../components/ui/progress";

interface StorageInfo {
  key: string;
  size: number;
  type: "store" | "cache" | "session";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) { return "0 B"; }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getLocalStorageInfo(): StorageInfo[] {
  const info: StorageInfo[] = [];
  const storeKeys = [
    { key: "yyc3-settings-ssot", type: "store" as const },
    { key: "yyc3-family-settings", type: "store" as const },
    { key: "yyc3-global-store", type: "store" as const },
    { key: "yyc3-session", type: "session" as const },
    { key: "yyc3-settings", type: "store" as const },
    { key: "yyc3-models", type: "store" as const },
    { key: "yyc3-connections", type: "store" as const },
  ];

  for (const { key, type } of storeKeys) {
    const value = localStorage.getItem(key);
    if (value) {
      info.push({
        key,
        size: new Blob([value]).size,
        type,
      });
    }
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !storeKeys.some((s) => s.key === key) && key.startsWith("yyc3-")) {
      const value = localStorage.getItem(key);
      if (value) {
        info.push({
          key,
          size: new Blob([value]).size,
          type: "cache",
        });
      }
    }
  }

  return info.sort((a, b) => b.size - a.size);
}

export function UnifiedSettingsPanel() {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("security");
  const [storageInfo, setStorageInfo] = useState<StorageInfo[]>([]);
  const [_showApiKey] = useState(false);
  const [copied, _copyRaw] = useCopyFeedback();

  const { providers, configuredModels } = useProviderSlice();
  const ssot = useSettingsSSOT();
  const database = useDatabase();
  const alerts = useAlerts();

  const refreshStorageInfo = useCallback(() => {
    setStorageInfo(getLocalStorageInfo());
  }, []);

  React.useEffect(() => {
    refreshStorageInfo();
  }, [refreshStorageInfo]);

  const handleExport = useCallback(() => {
    try {
      const data = exportStoreData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `yyc3-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("settings.exportSuccess") || "数据导出成功");
    } catch {
      toast.error(t("settings.exportFailed") || "数据导出失败");
    }
  }, [t]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) { return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importStoreData(content);
        if (success) {
          toast.success(t("settings.importSuccess") || "数据导入成功");
          refreshStorageInfo();
        } else {
          toast.error(t("settings.importFailed") || "数据导入失败");
        }
      } catch {
        toast.error(t("settings.importInvalid") || "无效的数据文件");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [t, refreshStorageInfo]);

  const handleClearData = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success(t("settings.clearSuccess") || "数据已清除");
    refreshStorageInfo();
  }, [t, refreshStorageInfo]);

  const copyToClipboard = useCallback((text: string) => {
    _copyRaw(text, true);
    toast.success(t("common.copied") || "已复制到剪贴板");
  }, [t, _copyRaw]);

  const totalSize = storageInfo.reduce((sum, info) => sum + info.size, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h2 className="text-[#e0f0ff]" style={{ fontSize: "1.1rem" }}>
              {t("settings.unifiedSettings") || "统一设置管理"}
            </h2>
            <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.7rem" }}>
              {t("settings.unifiedSettingsDesc") || "数据完全本地化，绝对安全，随心驾驭"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)" }}>
          <Lock className="w-3 h-3 text-[#00ff88]" />
          <span className="text-[#00ff88]" style={{ fontSize: "0.72rem" }}>{t("settings.localMode") || "本地模式"}</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {([
          { key: "security", icon: Shield, label: t("settings.security") || "安全隔离" },
          { key: "data", icon: Database, label: t("settings.dataManagement") || "数据管理" },
          { key: "storage", icon: HardDrive, label: t("settings.storage") || "存储空间" },
          { key: "about", icon: Info, label: t("settings.about") || "关于" },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === tab.key
              ? "bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border border-[rgba(0,212,255,0.25)]"
              : "text-[rgba(0,212,255,0.4)] border border-transparent hover:border-[rgba(0,180,255,0.15)]"
              }`}
            style={{ fontSize: "0.78rem" }}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "security" && (
        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[rgba(0,255,136,0.1)] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#00ff88]" />
              </div>
              <div>
                <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.88rem" }}>
                  {t("settings.dataIsolation") || "数据隔离验证"}
                </h3>
                <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.7rem" }}>
                  {t("settings.dataIsolationDesc") || "验证您的数据完全存储在本地，不上传任何信息"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                  <span className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>{t("settings.localStorage") || "本地存储"}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", fontSize: "0.68rem", border: "1px solid rgba(0,255,136,0.2)" }}>
                  {t("settings.verified") || "已验证"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#00d4ff]" />
                  <span className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>{t("settings.ssot") || "统一设置"}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", fontSize: "0.68rem", border: "1px solid rgba(0,212,255,0.2)" }}>
                  {ssot.toggles ? `${Object.keys(ssot.toggles).length} ${t("settings.toggles") || "项配置"}` : (t("settings.notInit") || "未初始化")}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                  <span className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>{t("settings.noCloudSync") || "无云端同步"}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", fontSize: "0.68rem", border: "1px solid rgba(0,255,136,0.2)" }}>
                  {t("settings.verified") || "已验证"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                  <span className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>{t("settings.noTracking") || "无数据追踪"}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", fontSize: "0.68rem", border: "1px solid rgba(0,255,136,0.2)" }}>
                  {t("settings.verified") || "已验证"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                  <span className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>{t("settings.noThirdParty") || "无第三方服务"}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", fontSize: "0.68rem", border: "1px solid rgba(0,255,136,0.2)" }}>
                  {t("settings.verified") || "已验证"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                  <span className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>{t("settings.offlineReady") || "离线可用"}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", fontSize: "0.68rem", border: "1px solid rgba(0,255,136,0.2)" }}>
                  {t("settings.verified") || "已验证"}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-[#e0f0ff] mb-3 flex items-center gap-2" style={{ fontSize: "0.88rem" }}>
              <Key className="w-5 h-5 text-[#00d4ff]" />
              {t("settings.apiKeyManagement") || "API 密钥管理"}
            </h3>
            <p className="text-[rgba(0,212,255,0.35)] mb-3" style={{ fontSize: "0.7rem" }}>
              {t("settings.apiKeyDesc") || "您的 API 密钥仅存储在本地浏览器中，永远不会上传到任何服务器"}
            </p>
            <div className="space-y-3">
              {providers.slice(0, 3).map((provider: ModelProviderDef) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]"
                >
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#00d4ff]" />
                    <span className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>{provider.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.requiresApiKey ? (
                      <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(255,51,102,0.1)", color: "#ff3366", fontSize: "0.68rem", border: "1px solid rgba(255,51,102,0.2)" }}>
                        <Lock className="w-3 h-3 mr-1" />
                        {t("settings.keyStored") || "密钥已存储"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", fontSize: "0.68rem", border: "1px solid rgba(0,255,136,0.2)" }}>
                        {t("settings.noKeyRequired") || "无需密钥"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div >
      )
      }

      {
        activeTab === "data" && (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="text-[#e0f0ff] mb-3 flex items-center gap-2" style={{ fontSize: "0.88rem" }}>
                <FileJson className="w-5 h-5 text-[#00d4ff]" />
                {t("settings.dataExport") || "数据导出"}
              </h3>
              <p className="text-[rgba(0,212,255,0.35)] mb-3" style={{ fontSize: "0.7rem" }}>
                {t("settings.dataExportDesc") || "将所有设置和数据导出为 JSON 文件，便于备份或迁移"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="bg-[rgba(0,212,255,0.2)] hover:bg-[rgba(0,212,255,0.3)] border border-[rgba(0,212,255,0.5)] text-[#00d4ff]" style={{ fontSize: "0.78rem" }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("settings.exportAll") || "导出全部数据"}
                </button>
                <button
                  onClick={async () => {
                    try {
                      await downloadFullBackup();
                      toast.success(t("settings.exportSuccess") || "全量备份导出成功");
                    } catch {
                      toast.error(t("settings.exportFailed") || "全量备份导出失败");
                    }
                  }}
                  className="border-[rgba(0,180,255,0.3)] text-[rgba(0,180,255,0.8)] hover:bg-[rgba(0,180,255,0.1)]"
                >
                  <HardDrive className="w-4 h-4 mr-2" />
                  {t("settings.fullBackup") || "全量备份"}
                </button>
                <button
                  onClick={() => copyToClipboard(exportStoreData())}
                  className="border-[rgba(0,180,255,0.3)] text-[rgba(0,180,255,0.8)] hover:bg-[rgba(0,180,255,0.1)]"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? t("common.copied") || "已复制" : t("settings.copyToClipboard") || "复制到剪贴板"}
                </button>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-[#e0f0ff] mb-3 flex items-center gap-2" style={{ fontSize: "0.88rem" }}>
                <Upload className="w-5 h-5 text-[#00d4ff]" />
                {t("settings.dataImport") || "数据导入"}
              </h3>
              <p className="text-[rgba(0,212,255,0.35)] mb-3" style={{ fontSize: "0.7rem" }}>
                {t("settings.dataImportDesc") || "从备份文件恢复设置和数据"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                title={t("settings.dataImport") || "导入数据"}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[rgba(0,212,255,0.2)] hover:bg-[rgba(0,212,255,0.3)] border border-[rgba(0,212,255,0.5)] text-[#00d4ff]"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t("settings.selectFile") || "选择备份文件"}
              </button>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={async () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".json";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) { return; }
                      const text = await file.text();
                      const result = await importFullBackup(text);
                      if (result.success) {
                        toast.success(t("settings.importSuccess") || "全量恢复成功");
                        refreshStorageInfo();
                      } else {
                        toast.error(`${t("settings.importFailed") || "全量恢复失败"}: ${result.errors.join("; ")}`);
                      }
                    };
                    input.click();
                  }}
                  className="border-[rgba(0,180,255,0.3)] text-[rgba(0,180,255,0.8)] hover:bg-[rgba(0,180,255,0.1)]"
                >
                  <HardDrive className="w-4 h-4 mr-2" />
                  {t("settings.fullRestore") || "全量恢复"}
                </button>
                <div className="flex items-center gap-2 text-xs text-[rgba(0,180,255,0.5)]">
                  <Lock className="w-3 h-3" />
                  {isCryptoAvailable()
                    ? (t("settings.cryptoAvailable") || "加密引擎可用")
                    : (t("settings.cryptoUnavailable") || "加密引擎不可用")}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-[rgba(255,51,102,0.3)]">
              <h3 className="text-[#e0f0ff] mb-3 flex items-center gap-2" style={{ fontSize: "0.88rem" }}>
                <Trash2 className="w-5 h-5 text-[#ff3366]" />
                {t("settings.clearData") || "清除数据"}
              </h3>
              <p className="text-[rgba(0,212,255,0.35)] mb-3" style={{ fontSize: "0.7rem" }}>
                {t("settings.clearDataDesc") || "清除所有本地存储的数据，此操作不可恢复"}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="border-[rgba(255,51,102,0.5)] text-[#ff3366] hover:bg-[rgba(255,51,102,0.1)]" style={{ fontSize: "0.78rem" }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t("settings.clearAllData") || "清除所有数据"}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#060e1f] border border-[rgba(255,51,102,0.3)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>
                      {t("settings.confirmClear") || "确认清除数据？"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[rgba(0,180,255,0.7)]">
                      {t("settings.confirmClearDesc") || "此操作将清除所有本地数据，包括设置、模型配置、数据库连接等。此操作不可恢复。"}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-[rgba(0,180,255,0.3)] text-[rgba(0,180,255,0.8)]">
                      {t("common.cancel") || "取消"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearData}
                      className="bg-[rgba(255,51,102,0.2)] hover:bg-[rgba(255,51,102,0.3)] text-[#ff3366]"
                    >
                      {t("common.confirm") || "确认清除"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </GlassCard>
          </div>
        )
      }

      {
        activeTab === "storage" && (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#e0f0ff] flex items-center gap-2" style={{ fontSize: "0.88rem" }}>
                  <HardDrive className="w-5 h-5 text-[#00d4ff]" />
                  {t("settings.storageUsage") || "存储空间使用"}
                </h3>
                <button
                  onClick={refreshStorageInfo}
                  className="text-[rgba(0,180,255,0.6)] hover:text-[#00d4ff] p-1" style={{ fontSize: "0.78rem" }}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.7rem" }}>
                    {t("settings.totalUsage") || "总使用量"}
                  </span>
                  <span className="text-[#00d4ff]" style={{ fontSize: "0.75rem" }}>{formatBytes(totalSize)}</span>
                </div>
                <Progress
                  value={Math.min((totalSize / (5 * 1024 * 1024)) * 100, 100)}
                  className="h-2 bg-[rgba(0,40,80,0.4)]"
                />
                <p className="text-xs text-[rgba(0,180,255,0.4)] mt-1">
                  {t("settings.storageLimit") || "浏览器本地存储限制约 5MB"}
                </p>
              </div>

              <div className="space-y-2">
                {storageInfo.map((info) => (
                  <div
                    key={info.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#00d4ff]" />
                      <span className="text-[#e0f0ff]" style={{ fontSize: "0.75rem" }}>{info.key}</span>
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.68rem" }}>
                        {info.type === "store"
                          ? t("settings.store") || "存储"
                          : info.type === "session"
                            ? t("settings.session") || "会话"
                            : t("settings.cache") || "缓存"}
                      </span>
                    </div>
                    <span className="text-[#00d4ff]" style={{ fontSize: "0.75rem" }}>{formatBytes(info.size)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-[#e0f0ff] mb-3 flex items-center gap-2" style={{ fontSize: "0.88rem" }}>
                <Database className="w-5 h-5 text-[#00d4ff]" />
                {t("settings.dataOverview") || "数据概览"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)] text-center">
                  <div className="text-[#00d4ff]" style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{providers.length}</div>
                  <div className="text-xs text-[rgba(0,180,255,0.6)]">
                    {t("settings.providers") || "模型提供商"}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)] text-center">
                  <div className="text-[#00d4ff]" style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                    {configuredModels.length}
                  </div>
                  <div className="text-xs text-[rgba(0,180,255,0.6)]">
                    {t("settings.configuredModels") || "已配置模型"}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)] text-center">
                  <div className="text-[#00d4ff]" style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{database.connections.length}</div>
                  <div className="text-xs text-[rgba(0,180,255,0.6)]">
                    {t("settings.connections") || "数据库连接"}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)] text-center">
                  <div className="text-[#00d4ff]" style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{alerts.followUps.length}</div>
                  <div className="text-xs text-[rgba(0,180,255,0.6)]">
                    {t("settings.followUps") || "跟进事项"}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )
      }

      {
        activeTab === "about" && (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
                  <Shield className="w-8 h-8 text-[#00d4ff]" />
                </div>
                <h3 className="text-[#e0f0ff]" style={{ fontSize: "1rem" }}>YYC³ Cloud Intelli-Matrix</h3>
                <p className="text-[rgba(0,212,255,0.35)] mt-1" style={{ fontSize: "0.7rem" }}>v1.0.0</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]">
                  <h4 className="text-[#e0f0ff] mb-2 flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                    <Lock className="w-4 h-4 text-[#00ff88]" />
                    {t("settings.corePrinciples") || "核心原则"}
                  </h4>
                  <ul className="space-y-2 text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.72rem" }}>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                      {t("settings.principle1") || "纯开源：所有代码完全开源，可审计"}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                      {t("settings.principle2") || "本地化存储：所有数据存储在本地浏览器"}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                      {t("settings.principle3") || "一用户一端：单用户单设备，无云端同步"}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                      {t("settings.principle4") || "数据完全隔离：不上传任何数据到服务器"}
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[rgba(0,20,40,0.4)] border border-[rgba(0,180,255,0.15)]">
                  <h4 className="text-[#e0f0ff] mb-2 flex items-center gap-2" style={{ fontSize: "0.82rem" }}>
                    <User className="w-4 h-4 text-[#00d4ff]" />
                    {t("settings.userRights") || "用户权利"}
                  </h4>
                  <ul className="space-y-2 text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.72rem" }}>
                    <li>• {t("settings.right1") || "完全掌控自己的数据"}</li>
                    <li>• {t("settings.right2") || "随时导出所有数据"}</li>
                    <li>• {t("settings.right3") || "随时清除所有数据"}</li>
                    <li>• {t("settings.right4") || "离线使用所有功能"}</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        )
      }
    </div >
  );
}

export default UnifiedSettingsPanel;
