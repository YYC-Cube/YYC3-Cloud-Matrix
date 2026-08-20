/**
 * @file: usePushNotifications.ts
 * @description: 统一推送通知 Hook — 自动适配 Electron 原生通知 / Web Notification API
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-30
 * @status: active
 * @tags: [hook],[notification],[electron]
 */

import { useCallback, useState } from "react";

import { isElectron, notificationClient } from "../lib/bridge-client";
import type { AlertLevel } from "../types";

function detectSupport(): boolean {
  if (isElectron()) {
    return true;
  }
  return typeof Notification !== "undefined";
}

function detectPermission(): NotificationPermission {
  if (isElectron()) {
    return "granted";
  }
  if (typeof Notification === "undefined") {
    return "denied";
  }
  return Notification.permission;
}

export function usePushNotifications() {
  const [supported] = useState(detectSupport);
  const [permission, setPermission] = useState<NotificationPermission>(detectPermission);

  const requestPermission = useCallback(async () => {
    const result = await notificationClient.requestPermission();
    setPermission(result as NotificationPermission);
    return result as NotificationPermission;
  }, []);

  const showNotification = useCallback(
    async (title: string, options: NotificationOptions = {}) => {
      if (permission !== "granted" && !isElectron()) {
        return null;
      }

      try {
        const result = await notificationClient.show({
          title,
          body: options.body,
          icon: options.icon || "/yyc3-icons/Web App/android-chrome-192.png",
          tag: options.tag || "cpim-notification",
          silent: options.silent ?? undefined,
          requireInteraction: options.requireInteraction,
        });

        if (result === "denied" || result === "failed") {
          return null;
        }
        return result;
      } catch {
        return null;
      }
    },
    [permission],
  );

  const sendAlert = useCallback(
    (level: AlertLevel, message: string, detail?: string) => {
      const titles: Record<AlertLevel, string> = {
        info: "CP-IM 信息",
        warning: "CP-IM 告警",
        error: "CP-IM 错误",
        critical: "CP-IM 严重告警",
      };

      return showNotification(titles[level], {
        body: detail ? `${message}\n${detail}` : message,
        tag: `cpim-alert-${level}`,
        requireInteraction: level === "error" || level === "critical",
      });
    },
    [showNotification],
  );

  return {
    permission,
    supported,
    requestPermission,
    showNotification,
    sendAlert,
  };
}
