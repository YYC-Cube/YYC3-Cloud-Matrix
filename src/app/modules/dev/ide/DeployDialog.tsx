/**
 * @file: DeployDialog.tsx
 * @description: DeployDialog.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { X, Rocket, Check, Loader2 } from "lucide-react";
import { useI18n } from "../../../hooks/useI18n";

interface DeployDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeployEnv = "production" | "staging" | "development";
type DeployStatus = "idle" | "building" | "success" | "failed";

const BUILD_LOG_LINES = [
  { time: "0.0s", text: "Installing dependencies..." },
  { time: "1.2s", text: "Lockfile is up to date" },
  { time: "1.3s", text: "Running type check..." },
  { time: "2.1s", text: "Type check passed." },
  { time: "2.2s", text: "Building with Vite..." },
  { time: "2.3s", text: "vite v6.3.5 building for production..." },
  { time: "3.8s", text: "✓ 248 modules transformed." },
  { time: "4.1s", text: "dist/index.html              0.46 kB │ gzip: 0.30 kB" },
  { time: "4.1s", text: "dist/assets/index-Da3x9.css  28.34 kB │ gzip: 5.89 kB" },
  { time: "4.2s", text: "dist/assets/index-Hk92a.js  346.21 kB │ gzip: 98.45 kB" },
  { time: "4.2s", text: "✓ built in 3.42s" },
  { time: "4.3s", text: "Deploying to server..." },
  { time: "5.8s", text: "✓ Deploy succeeded!" },
];

export function DeployDialog({ isOpen, onClose }: DeployDialogProps) {
  const { t } = useI18n();
  const [env, setEnv] = useState<DeployEnv>("production");
  const [status, setStatus] = useState<DeployStatus>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isOpen) {return null;}

  const handleDeploy = () => {
    setStatus("building");
    setLogs([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < BUILD_LOG_LINES.length) {
        setLogs((prev) => [...prev, `[${BUILD_LOG_LINES[i].time}] ${BUILD_LOG_LINES[i].text}`]);
        i++;
      } else {
        clearInterval(interval);
        setStatus("success");
      }
    }, 400);
  };

  const handleClose = () => {
    setStatus("idle");
    setLogs([]);
    onClose();
  };

  const envOptions: { value: DeployEnv; label: string; color: string }[] = [
    { value: "production", label: t("ide.deployProduction"), color: "#00ff88" },
    { value: "staging", label: t("ide.deployStaging"), color: "#ffaa00" },
    { value: "development", label: t("ide.deployDevelopment"), color: "#00d4ff" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={handleClose} />
      <div
        className="fixed z-50 rounded-lg overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "480px",
          background: "rgba(8,20,45,0.97)",
          border: "1px solid rgba(0,180,255,0.2)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(0,180,255,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-[#00ff88]" />
            <span className="text-[#e0f0ff]" style={{ fontSize: "0.82rem" }}>
              {t("ide.deployTitle")}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* Environment selector */}
          <div>
            <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.62rem", letterSpacing: "0.5px" }}>
              {t("ide.deployEnv")}
            </span>
            <div className="flex gap-2 mt-1.5">
              {envOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => env !== opt.value && setEnv(opt.value)}
                  disabled={status === "building"}
                  className={`flex-1 py-2 rounded-md border transition-all text-center ${
                    env === opt.value
                      ? "border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.1)]"
                      : "border-[rgba(0,180,255,0.08)] bg-[rgba(0,40,80,0.2)] hover:border-[rgba(0,212,255,0.15)]"
                  }`}
                >
                  <span
                    className="block"
                    style={{ fontSize: "0.65rem", color: env === opt.value ? opt.color : "rgba(0,212,255,0.4)" }}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Deploy button */}
          {status === "idle" && (
            <button
              onClick={handleDeploy}
              className="w-full py-2.5 rounded-md bg-[rgba(0,255,136,0.12)] border border-[rgba(0,255,136,0.3)] text-[#00ff88] hover:bg-[rgba(0,255,136,0.2)] transition-all flex items-center justify-center gap-2"
              style={{ fontSize: "0.78rem" }}
            >
              <Rocket className="w-4 h-4" />
              {t("ide.deployStart")}
            </button>
          )}

          {status === "building" && (
            <button
              disabled
              className="w-full py-2.5 rounded-md bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)] text-[#00d4ff] flex items-center justify-center gap-2"
              style={{ fontSize: "0.78rem" }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("ide.deployBuilding")}
            </button>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-md bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.15)]">
              <Check className="w-4 h-4 text-[#00ff88]" />
              <span className="text-[#00ff88]" style={{ fontSize: "0.72rem" }}>{t("ide.deploySuccess")}</span>
            </div>
          )}

          {/* Build logs */}
          {logs.length > 0 && (
            <div>
              <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.62rem", letterSpacing: "0.5px" }}>
                {t("ide.deployLogs")}
              </span>
              <div
                className="mt-1.5 rounded-md p-2 font-mono overflow-y-auto"
                style={{
                  background: "rgba(0,10,25,0.6)",
                  border: "1px solid rgba(0,180,255,0.08)",
                  maxHeight: "200px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0,180,255,0.15) transparent",
                }}
              >
                {logs.map((line, i) => (
                  <div key={i} className="py-[1px]" style={{ fontSize: "0.62rem", color: line.includes("✓") ? "#00ff88" : line.includes("✗") ? "#ff3366" : "#c0dcf0" }}>
                    {line}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
