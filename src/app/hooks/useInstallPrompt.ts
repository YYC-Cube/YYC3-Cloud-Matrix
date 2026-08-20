/**
 * @file: useInstallPrompt.ts
 * @description: useInstallPrompt Hook
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [hook]
 */

import { useState, useEffect, useCallback } from "react";
import type { BeforeInstallPromptEvent } from "../types";

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    return isStandalone;
  });
  const [dismissed, setDismissed] = useState(() => {
    const wasDismissed = localStorage.getItem("pwa_install_dismissed");
    return !!wasDismissed;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // 监听安装状态变更
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {return false;}

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem("pwa_install_dismissed", "true");
  }, []);

  return {
    isInstalled,
    canInstall: !!deferredPrompt && !dismissed,
    promptInstall,
    dismiss,
  };
}