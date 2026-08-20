/**
 * @file: NotificationPanel.tsx
 * @description: NotificationPanel.tsx
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
  X, Bell, Check, CheckCheck, AlertTriangle,
  Info, XCircle,
} from "lucide-react";
import { useI18n } from "../../../hooks/useI18n";
import { MOCK_NOTIFICATIONS } from "./ide-mock-data";
import type { IDENotification } from "./ide-types";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEVERITY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  success: { icon: Check, color: "#00ff88" },
  error: { icon: XCircle, color: "#ff3366" },
  warning: { icon: AlertTriangle, color: "#ffaa00" },
  info: { icon: Info, color: "#00d4ff" },
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<IDENotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  if (!isOpen) {return null;}

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-3 top-[52px] z-50 rounded-lg overflow-hidden"
        style={{
          width: "360px",
          maxHeight: "480px",
          background: "rgba(8,20,45,0.96)",
          border: "1px solid rgba(0,180,255,0.2)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2 shrink-0"
          style={{ borderBottom: "1px solid rgba(0,180,255,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-[#e0f0ff]" style={{ fontSize: "0.78rem" }}>
              {t("ide.notificationPanel")}
            </span>
            {unreadCount > 0 && (
              <span
                className="px-1.5 rounded-full bg-[#ff3366] text-white"
                style={{ fontSize: "0.5rem" }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all"
                title={t("ide.markAllRead")}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span style={{ fontSize: "0.55rem" }}>{t("ide.markAllRead")}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div
          className="overflow-y-auto"
          style={{
            maxHeight: "400px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,180,255,0.15) transparent",
          }}
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Bell className="w-8 h-8 text-[rgba(0,212,255,0.1)] mb-2" />
              <p className="text-[rgba(0,212,255,0.25)]" style={{ fontSize: "0.72rem" }}>
                {t("ide.noNotifications")}
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const config = SEVERITY_CONFIG[notif.severity] || SEVERITY_CONFIG.info;
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  className="flex gap-2 px-3 py-2 hover:bg-[rgba(0,40,80,0.2)] transition-all cursor-pointer"
                  style={{
                    borderBottom: "1px solid rgba(0,180,255,0.04)",
                    background: notif.read ? "transparent" : "rgba(0,212,255,0.03)",
                  }}
                  onClick={() => markRead(notif.id)}
                >
                  <div
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: `${config.color}15` }}
                  >
                    <Icon className="w-3 h-3" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate ${notif.read ? "text-[rgba(0,212,255,0.5)]" : "text-[#e0f0ff]"}`}
                        style={{ fontSize: "0.7rem", fontWeight: notif.read ? 400 : 500 }}
                      >
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] shrink-0" />
                      )}
                    </div>
                    <p className="text-[rgba(0,212,255,0.35)] mt-0.5" style={{ fontSize: "0.6rem" }}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[rgba(0,212,255,0.2)]" style={{ fontSize: "0.5rem" }}>
                        {notif.source}
                      </span>
                      <span className="text-[rgba(0,212,255,0.15)]" style={{ fontSize: "0.5rem" }}>
                        {notif.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
