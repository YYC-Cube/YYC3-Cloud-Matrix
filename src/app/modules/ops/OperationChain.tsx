/**
 * @file: OperationChain.tsx
 * @description: OperationChain.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { AlertTriangle, CheckCircle, Cpu, Play, Server, Wrench, Zap } from "lucide-react";
import React from "react";
import type { ChainEvent, ChainEventType } from "../../types";

interface OperationChainProps {
  events: ChainEvent[];
  compact?: boolean;
}

const eventConfig: Record<ChainEventType, { icon: typeof Cpu; color: string; label: string }> = {
  model_load: { icon: Cpu, color: "#00d4ff", label: "模型加载" },
  task_start: { icon: Play, color: "#00ff88", label: "任务启动" },
  alert_trigger: { icon: AlertTriangle, color: "#ff3366", label: "告警触发" },
  auto_action: { icon: Zap, color: "#ffdd00", label: "自动操作" },
  manual_action: { icon: Wrench, color: "#aa55ff", label: "手动操作" },
  resolved: { icon: CheckCircle, color: "#00ff88", label: "已解决" },
  system_event: { icon: Server, color: "#00d4ff", label: "系统事件" },
};

export function OperationChain({ events, compact = false }: OperationChainProps) {
  if (!events.length) {
    return (
      <div className="text-center py-4">
        <span className="text-[rgba(0,212,255,0.3)] text-xs">暂无操作链路数据</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {events.map((event, idx) => {
        const config = eventConfig[event.type];
        const Icon = config.icon;
        const isLast = idx === events.length - 1;

        return (
          <div
            key={event.id}
            className="relative flex items-start gap-3"
            style={{ "--chain-color": config.color } as React.CSSProperties}
          >
            {!isLast && (
              <div
                className={`absolute left-[13px] top-[28px] w-[2px] ${compact ? "h-6" : "h-8"}`}
                style={{
                  background: event.isCurrent
                    ? `linear-gradient(180deg, var(--chain-color), rgba(0,180,255,0.15))`
                    : "rgba(0,180,255,0.1)",
                }}
              />
            )}

            <div
              className={`
                relative shrink-0 w-[28px] h-[28px] rounded-full flex items-center justify-center
                ${event.isCurrent ? "ring-2 ring-offset-1 ring-offset-[#060e1f]" : ""}
              `}
              style={{
                backgroundColor: `color-mix(in srgb, var(--chain-color) 9%, transparent)`,
                borderColor: event.isCurrent ? "var(--chain-color)" : "transparent",
                boxShadow: event.isCurrent ? `0 0 0 1px var(--chain-color)` : undefined,
              }}
            >
              <Icon
                className="w-3.5 h-3.5"
                style={{
                  color: event.isCurrent
                    ? "var(--chain-color)"
                    : `color-mix(in srgb, var(--chain-color) 60%, transparent)`,
                }}
              />
              {event.isCurrent && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: "var(--chain-color)" }}
                />
              )}
            </div>

            <div className={`flex-1 min-w-0 ${compact ? "pb-3" : "pb-4"}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[rgba(0,212,255,0.5)] shrink-0 text-[0.68rem] font-[Rajdhani,monospace]">
                  {event.time}
                </span>
                <span
                  className={`${event.isCurrent ? "text-[#e0f0ff]" : "text-[#c0dcf0]"} text-[0.78rem]`}
                >
                  {event.label}
                </span>
                {event.isCurrent && (
                  <span className="px-1.5 py-0.5 rounded bg-[rgba(255,51,102,0.15)] text-[#ff3366] shrink-0 text-[0.58rem]">
                    当前
                  </span>
                )}
              </div>
              <p className="text-[rgba(0,212,255,0.35)] mt-0.5 truncate text-[0.7rem]">
                {event.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
