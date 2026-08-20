/**
 * @file: AlertBanner.tsx
 * @description: AlertBanner.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, XCircle, ChevronRight,
} from "lucide-react";
import { useAlerts } from "../../stores/global-store";

interface AlertBannerProps {
  compact?: boolean;
}

export function AlertBanner({ compact = false }: AlertBannerProps) {
  const navigate = useNavigate();
  const { followUps } = useAlerts();

  const criticalCount = followUps.filter((f) => f.severity === "critical").length;
  const errorCount = followUps.filter((f) => f.severity === "error").length;
  const warningCount = followUps.filter((f) => f.severity === "warning").length;
  const activeCount = followUps.filter((f) => f.status === "active").length;
  
  const latestCritical = followUps
    .filter((f) => f.severity === "critical" || f.severity === "error")
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  const hasCritical = criticalCount > 0;
  const hasWarnings = warningCount > 0 || errorCount > 0;

  if (followUps.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="alert-banner"
      onClick={() => navigate("/follow-up")}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        transition-all duration-300 group
        ${hasCritical
          ? "bg-[rgba(255,51,102,0.04)] border border-[rgba(255,51,102,0.2)] hover:border-[rgba(255,51,102,0.4)] hover:shadow-[0_0_25px_rgba(255,51,102,0.08)]"
          : hasWarnings
          ? "bg-[rgba(255,170,0,0.04)] border border-[rgba(255,170,0,0.15)] hover:border-[rgba(255,170,0,0.3)]"
          : "bg-[rgba(0,212,255,0.03)] border border-[rgba(0,180,255,0.1)] hover:border-[rgba(0,180,255,0.25)]"
        }
      `}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: hasCritical ? "#ff3366" : hasWarnings ? "#ffaa00" : "#00d4ff" }}
      />

      <div className={`flex items-center gap-3 ${compact ? "px-3 py-2 pl-4" : "px-4 py-3 pl-5"}`}>
        <div
          className={`shrink-0 rounded-lg flex items-center justify-center ${compact ? "w-8 h-8" : "w-9 h-9"}`}
          style={{ backgroundColor: hasCritical ? "rgba(255,51,102,0.1)" : "rgba(255,170,0,0.1)" }}
        >
          {hasCritical ? (
            <XCircle className="w-4 h-4 text-[#ff3366]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#ffaa00]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>
              {latestCritical?.title || `${followUps.length} 条告警待处理`}
            </span>
            {latestCritical?.metric && (
              <span
                className="px-1.5 py-0.5 rounded"
                style={{
                  fontSize: "0.58rem",
                  backgroundColor: "rgba(255,51,102,0.12)",
                  color: "#ff3366",
                }}
              >
                {latestCritical.metric}
              </span>
            )}
          </div>
          {!compact && (
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.68rem" }}>
                {followUps.length} 条告警 · {activeCount} 活跃
              </span>
              {criticalCount > 0 && (
                <span className="text-[#ff3366]" style={{ fontSize: "0.62rem" }}>
                  {criticalCount} 严重
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-[#ff6600]" style={{ fontSize: "0.62rem" }}>
                  {errorCount} 错误
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-[#ffaa00]" style={{ fontSize: "0.62rem" }}>
                  {warningCount} 警告
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="hidden sm:inline text-[rgba(0,212,255,0.5)] group-hover:text-[#00d4ff] transition-colors"
            style={{ fontSize: "0.72rem" }}
          >
            一键跟进
          </span>
          <ChevronRight className="w-4 h-4 text-[rgba(0,212,255,0.4)] group-hover:text-[#00d4ff] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
