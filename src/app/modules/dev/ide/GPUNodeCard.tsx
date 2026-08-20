/**
 * @file: GPUNodeCard.tsx
 * @description: GPUNodeCard.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import * as React from "react";
import { useState, useCallback } from "react";
import {
  Cpu, HardDrive, Thermometer, Activity, Zap, AlertTriangle,
  CheckCircle, Clock, MoreVertical, RefreshCw,
} from "lucide-react";
import { GlassCard } from "../../shared/GlassCard";
import type { NodeData, NodeStatusType } from "../../../types";

interface GPUNodeCardProps {
  node: NodeData;
  onRefresh?: (nodeId: string) => void;
  onClick?: (node: NodeData) => void;
  compact?: boolean;
  showActions?: boolean;
}

const STATUS_CONFIG: Record<NodeStatusType, { color: string; bgColor: string; label: string; icon: React.ElementType }> = {
  active: { color: "#00ff88", bgColor: "rgba(0,255,136,0.15)", label: "运行中", icon: CheckCircle },
  warning: { color: "#ffaa00", bgColor: "rgba(255,170,0,0.15)", label: "警告", icon: AlertTriangle },
  inactive: { color: "#ff3366", bgColor: "rgba(255,51,102,0.15)", label: "离线", icon: Activity },
};

function getUtilizationColor(value: number): string {
  if (value >= 90) {return "#ff3366";}
  if (value >= 70) {return "#ffaa00";}
  return "#00ff88";
}

function getTempColor(value: number): string {
  if (value >= 85) {return "#ff3366";}
  if (value >= 70) {return "#ffaa00";}
  return "#00ff88";
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1 bg-[rgba(0,180,255,0.1)] rounded-full overflow-hidden mt-1">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </div>
  );
}

function MetricItem({
  icon: Icon,
  label,
  value,
  unit,
  color,
  progress,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit?: string;
  color: string;
  progress?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-white/50" style={{ fontSize: "0.65rem" }}>{label}</span>
        </div>
        <span className="font-mono" style={{ fontSize: "0.7rem", color }}>
          {value}{unit}
        </span>
      </div>
      {progress !== undefined && (
        <ProgressBar value={progress} color={color} />
      )}
    </div>
  );
}

export function GPUNodeCard({
  node,
  onRefresh,
  onClick,
  compact = false,
  showActions = true,
}: GPUNodeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statusConfig = STATUS_CONFIG[node.status];
  const StatusIcon = statusConfig.icon;

  const handleRefresh = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      onRefresh(node.id);
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [onRefresh, node.id, isRefreshing]);

  const handleClick = useCallback(() => {
    onClick?.(node);
  }, [onClick, node]);

  if (compact) {
    return (
      <GlassCard
        className={`p-3 ${onClick ? "cursor-pointer" : ""}`}
        onClick={handleClick}
        glowColor={isHovered ? "rgba(0,212,255,0.15)" : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: statusConfig.bgColor }}
            >
              <Cpu className="w-4 h-4" style={{ color: statusConfig.color }} />
            </div>
            <div>
              <div className="text-white/90" style={{ fontSize: "0.72rem" }}>{node.id}</div>
              <div className="text-white/40" style={{ fontSize: "0.6rem" }}>{node.model}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-mono" style={{ fontSize: "0.72rem", color: getUtilizationColor(node.gpu) }}>
                {node.gpu}%
              </div>
              <div className="text-white/40" style={{ fontSize: "0.55rem" }}>GPU</div>
            </div>
            <StatusIcon className="w-4 h-4" style={{ color: statusConfig.color }} />
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      className={`p-4 ${onClick ? "cursor-pointer" : ""}`}
      onClick={handleClick}
      glowColor={isHovered ? "rgba(0,212,255,0.15)" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: statusConfig.bgColor }}
          >
            <Cpu className="w-5 h-5" style={{ color: statusConfig.color }} />
          </div>
          <div>
            <div className="text-white/90 font-medium" style={{ fontSize: "0.8rem" }}>
              {node.id}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.color,
                  fontSize: "0.58rem",
                }}
              >
                {statusConfig.label}
              </span>
              <span className="text-white/40" style={{ fontSize: "0.6rem" }}>
                {node.model}
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-colors disabled:opacity-50"
              title="刷新状态"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#00d4ff] ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5 text-white/40" />
            </button>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricItem
          icon={Activity}
          label="GPU"
          value={node.gpu}
          unit="%"
          color={getUtilizationColor(node.gpu)}
          progress={node.gpu}
        />
        <MetricItem
          icon={HardDrive}
          label="内存"
          value={node.mem}
          unit="%"
          color={getUtilizationColor(node.mem)}
          progress={node.mem}
        />
        <MetricItem
          icon={Thermometer}
          label="温度"
          value={node.temp}
          unit="°C"
          color={getTempColor(node.temp)}
        />
        <MetricItem
          icon={Zap}
          label="任务"
          value={node.tasks}
          color="#00d4ff"
        />
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[rgba(0,180,255,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/30" style={{ fontSize: "0.6rem" }}>
            <Clock className="w-3 h-3" />
            <span>实时监控</span>
          </div>
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: statusConfig.color }}
          />
        </div>
      </div>
    </GlassCard>
  );
}

export default GPUNodeCard;
