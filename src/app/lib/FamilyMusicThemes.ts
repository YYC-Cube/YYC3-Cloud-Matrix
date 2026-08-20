/**
 * @file: FamilyMusicThemes.ts
 * @description: 家人角色主题皮肤配置，包含颜色、动画、背景等视觉元素
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-04
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import type { FamilyMember } from "../modules/ai-family/components/shared";
import { FamilyDataAccessor } from "../modules/ai-family/lib/family-data-accessor";

export interface FamilyTheme {
  id: string;
  name: string;
  memberId: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundGradient: string;
    text: string;
    textSecondary: string;
    border: string;
    glow: string;
    progress: string;
    progressBackground: string;
    button: string;
    buttonHover: string;
  };
  animation: {
    duration: number;
    easing: string;
    pulseEffect: boolean;
    glowEffect: boolean;
    particleEffect: boolean;
  };
  background: {
    type: "gradient" | "image" | "animated";
    value: string;
    overlay?: string;
  };
  typography: {
    fontFamily: string;
    titleSize: string;
    bodySize: string;
  };
  playerStyle: {
    borderRadius: string;
    boxShadow: string;
    backdropBlur: string;
  };
  iconStyle: {
    size: string;
    strokeWidth: number;
  };
}

export const FAMILY_THEMES: FamilyTheme[] = [
  {
    id: "theme-navigator",
    name: "千行·晨曦",
    memberId: "navigator",
    colors: {
      primary: "#FFD700",
      secondary: "#FFA500",
      accent: "#FFEC8B",
      background: "#0a0f1a",
      backgroundGradient: "linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 50%, #0f1520 100%)",
      text: "#FFFFFF",
      textSecondary: "#B0B0B0",
      border: "rgba(255, 215, 0, 0.3)",
      glow: "rgba(255, 215, 0, 0.5)",
      progress: "#FFD700",
      progressBackground: "rgba(255, 215, 0, 0.2)",
      button: "#FFD700",
      buttonHover: "#FFEC8B",
    },
    animation: {
      duration: 300,
      easing: "ease-out",
      pulseEffect: true,
      glowEffect: true,
      particleEffect: false,
    },
    background: {
      type: "gradient",
      value: "radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)",
      overlay: "linear-gradient(180deg, transparent 0%, rgba(10, 15, 26, 0.8) 100%)",
    },
    typography: {
      fontFamily: "system-ui, sans-serif",
      titleSize: "1.5rem",
      bodySize: "0.875rem",
    },
    playerStyle: {
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(255, 215, 0, 0.15)",
      backdropBlur: "20px",
    },
    iconStyle: {
      size: "24px",
      strokeWidth: 2,
    },
  },
  {
    id: "theme-thinker",
    name: "万物·深邃",
    memberId: "thinker",
    colors: {
      primary: "#FF69B4",
      secondary: "#FF1493",
      accent: "#FFB6C1",
      background: "#0a0812",
      backgroundGradient: "linear-gradient(135deg, #0a0812 0%, #1a1020 50%, #0f0a18 100%)",
      text: "#FFFFFF",
      textSecondary: "#A0A0A0",
      border: "rgba(255, 105, 180, 0.3)",
      glow: "rgba(255, 105, 180, 0.5)",
      progress: "#FF69B4",
      progressBackground: "rgba(255, 105, 180, 0.2)",
      button: "#FF69B4",
      buttonHover: "#FFB6C1",
    },
    animation: {
      duration: 400,
      easing: "ease-in-out",
      pulseEffect: false,
      glowEffect: true,
      particleEffect: false,
    },
    background: {
      type: "gradient",
      value: "radial-gradient(circle at 70% 70%, rgba(255, 105, 180, 0.08) 0%, transparent 50%)",
      overlay: "linear-gradient(180deg, transparent 0%, rgba(10, 8, 18, 0.9) 100%)",
    },
    typography: {
      fontFamily: "Georgia, serif",
      titleSize: "1.5rem",
      bodySize: "0.875rem",
    },
    playerStyle: {
      borderRadius: "12px",
      boxShadow: "0 4px 24px rgba(255, 105, 180, 0.1)",
      backdropBlur: "25px",
    },
    iconStyle: {
      size: "22px",
      strokeWidth: 2,
    },
  },
  {
    id: "theme-prophet",
    name: "先知·预见",
    memberId: "prophet",
    colors: {
      primary: "#00BFFF",
      secondary: "#1E90FF",
      accent: "#87CEEB",
      background: "#050a12",
      backgroundGradient: "linear-gradient(135deg, #050a12 0%, #0a1525 50%, #080f1a 100%)",
      text: "#FFFFFF",
      textSecondary: "#8FA0B0",
      border: "rgba(0, 191, 255, 0.3)",
      glow: "rgba(0, 191, 255, 0.5)",
      progress: "#00BFFF",
      progressBackground: "rgba(0, 191, 255, 0.2)",
      button: "#00BFFF",
      buttonHover: "#87CEEB",
    },
    animation: {
      duration: 500,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      pulseEffect: true,
      glowEffect: true,
      particleEffect: true,
    },
    background: {
      type: "animated",
      value: "radial-gradient(circle at 50% 50%, rgba(0, 191, 255, 0.05) 0%, transparent 70%)",
      overlay: "linear-gradient(180deg, transparent 0%, rgba(5, 10, 18, 0.85) 100%)",
    },
    typography: {
      fontFamily: "system-ui, sans-serif",
      titleSize: "1.5rem",
      bodySize: "0.875rem",
    },
    playerStyle: {
      borderRadius: "20px",
      boxShadow: "0 12px 40px rgba(0, 191, 255, 0.12)",
      backdropBlur: "30px",
    },
    iconStyle: {
      size: "24px",
      strokeWidth: 1.5,
    },
  },
  {
    id: "theme-bolero",
    name: "伯乐·温暖",
    memberId: "bolero",
    colors: {
      primary: "#E8E8E8",
      secondary: "#C0C0C0",
      accent: "#FFFFFF",
      background: "#0f0f0f",
      backgroundGradient: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #121212 100%)",
      text: "#FFFFFF",
      textSecondary: "#A0A0A0",
      border: "rgba(232, 232, 232, 0.3)",
      glow: "rgba(232, 232, 232, 0.4)",
      progress: "#E8E8E8",
      progressBackground: "rgba(232, 232, 232, 0.15)",
      button: "#E8E8E8",
      buttonHover: "#FFFFFF",
    },
    animation: {
      duration: 350,
      easing: "ease-out",
      pulseEffect: false,
      glowEffect: false,
      particleEffect: false,
    },
    background: {
      type: "gradient",
      value: "linear-gradient(145deg, rgba(232, 232, 232, 0.02) 0%, transparent 50%)",
      overlay: "linear-gradient(180deg, transparent 0%, rgba(15, 15, 15, 0.9) 100%)",
    },
    typography: {
      fontFamily: "system-ui, sans-serif",
      titleSize: "1.5rem",
      bodySize: "0.875rem",
    },
    playerStyle: {
      borderRadius: "14px",
      boxShadow: "0 6px 28px rgba(232, 232, 232, 0.08)",
      backdropBlur: "22px",
    },
    iconStyle: {
      size: "24px",
      strokeWidth: 2,
    },
  },
  {
    id: "theme-meta-oracle",
    name: "天枢·全局",
    memberId: "meta-oracle",
    colors: {
      primary: "#00FF88",
      secondary: "#00CC6A",
      accent: "#66FFB2",
      background: "#030a08",
      backgroundGradient: "linear-gradient(135deg, #030a08 0%, #0a1a12 50%, #050f0a 100%)",
      text: "#FFFFFF",
      textSecondary: "#90B0A0",
      border: "rgba(0, 255, 136, 0.3)",
      glow: "rgba(0, 255, 136, 0.5)",
      progress: "#00FF88",
      progressBackground: "rgba(0, 255, 136, 0.2)",
      button: "#00FF88",
      buttonHover: "#66FFB2",
    },
    animation: {
      duration: 250,
      easing: "linear",
      pulseEffect: true,
      glowEffect: true,
      particleEffect: true,
    },
    background: {
      type: "animated",
      value: "radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.03) 0%, transparent 60%)",
      overlay: "linear-gradient(180deg, transparent 0%, rgba(3, 10, 8, 0.9) 100%)",
    },
    typography: {
      fontFamily: "system-ui, sans-serif",
      titleSize: "1.5rem",
      bodySize: "0.875rem",
    },
    playerStyle: {
      borderRadius: "18px",
      boxShadow: "0 10px 36px rgba(0, 255, 136, 0.1)",
      backdropBlur: "28px",
    },
    iconStyle: {
      size: "24px",
      strokeWidth: 2,
    },
  },
  {
    id: "theme-sentinel",
    name: "守护·警戒",
    memberId: "sentinel",
    colors: {
      primary: "#BF00FF",
      secondary: "#9900CC",
      accent: "#D966FF",
      background: "#08030f",
      backgroundGradient: "linear-gradient(135deg, #08030f 0%, #120820 50%, #0a0515 100%)",
      text: "#FFFFFF",
      textSecondary: "#A090B0",
      border: "rgba(191, 0, 255, 0.3)",
      glow: "rgba(191, 0, 255, 0.5)",
      progress: "#BF00FF",
      progressBackground: "rgba(191, 0, 255, 0.2)",
      button: "#BF00FF",
      buttonHover: "#D966FF",
    },
    animation: {
      duration: 200,
      easing: "ease-out",
      pulseEffect: false,
      glowEffect: true,
      particleEffect: false,
    },
    background: {
      type: "gradient",
      value: "radial-gradient(circle at 80% 20%, rgba(191, 0, 255, 0.06) 0%, transparent 50%)",
      overlay: "linear-gradient(180deg, transparent 0%, rgba(8, 3, 15, 0.9) 100%)",
    },
    typography: {
      fontFamily: "system-ui, sans-serif",
      titleSize: "1.5rem",
      bodySize: "0.875rem",
    },
    playerStyle: {
      borderRadius: "10px",
      boxShadow: "0 4px 20px rgba(191, 0, 255, 0.15)",
      backdropBlur: "24px",
    },
    iconStyle: {
      size: "22px",
      strokeWidth: 2.5,
    },
  },
  {
    id: "theme-master",
    name: "宗师·品质",
    memberId: "master",
    colors: {
      primary: "#C0C0C0",
      secondary: "#A0A0A0",
      accent: "#E0E0E0",
      background: "#0a0a0a",
      backgroundGradient: "linear-gradient(135deg, #0a0a0a 0%, #151515 50%, #0d0d0d 100%)",
      text: "#FFFFFF",
      textSecondary: "#909090",
      border: "rgba(192, 192, 192, 0.3)",
      glow: "rgba(192, 192, 192, 0.3)",
      progress: "#C0C0C0",
      progressBackground: "rgba(192, 192, 192, 0.15)",
      button: "#C0C0C0",
      buttonHover: "#E0E0E0",
    },
    animation: {
      duration: 400,
      easing: "ease-in-out",
      pulseEffect: false,
      glowEffect: false,
      particleEffect: false,
    },
    background: {
      type: "gradient",
      value: "linear-gradient(180deg, rgba(192, 192, 192, 0.02) 0%, transparent 30%)",
      overlay: "linear-gradient(180deg, transparent 0%, rgba(10, 10, 10, 0.95) 100%)",
    },
    typography: {
      fontFamily: "Georgia, serif",
      titleSize: "1.5rem",
      bodySize: "0.875rem",
    },
    playerStyle: {
      borderRadius: "8px",
      boxShadow: "0 2px 16px rgba(192, 192, 192, 0.06)",
      backdropBlur: "20px",
    },
    iconStyle: {
      size: "22px",
      strokeWidth: 2,
    },
  },
  {
    id: "theme-creative",
    name: "灵韵·创意",
    memberId: "creative",
    colors: {
      primary: "#FF7043",
      secondary: "#FF5722",
      accent: "#FFAB91",
      background: "#0f0805",
      backgroundGradient: "linear-gradient(135deg, #0f0805 0%, #1a0f0a 50%, #120a06 100%)",
      text: "#FFFFFF",
      textSecondary: "#B0A090",
      border: "rgba(255, 112, 67, 0.3)",
      glow: "rgba(255, 112, 67, 0.5)",
      progress: "#FF7043",
      progressBackground: "rgba(255, 112, 67, 0.2)",
      button: "#FF7043",
      buttonHover: "#FFAB91",
    },
    animation: {
      duration: 300,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      pulseEffect: true,
      glowEffect: true,
      particleEffect: true,
    },
    background: {
      type: "animated",
      value: "radial-gradient(circle at 20% 80%, rgba(255, 112, 67, 0.08) 0%, transparent 50%)",
      overlay: "linear-gradient(180deg, transparent 0%, rgba(15, 8, 5, 0.85) 100%)",
    },
    typography: {
      fontFamily: "system-ui, sans-serif",
      titleSize: "1.5rem",
      bodySize: "0.875rem",
    },
    playerStyle: {
      borderRadius: "24px",
      boxShadow: "0 16px 48px rgba(255, 112, 67, 0.15)",
      backdropBlur: "26px",
    },
    iconStyle: {
      size: "26px",
      strokeWidth: 1.5,
    },
  },
];

class FamilyThemeManagerClass {
  private themes: Map<string, FamilyTheme> = new Map();
  private currentTheme: FamilyTheme | null = null;
  private listeners: Set<(theme: FamilyTheme) => void> = new Set();

  constructor() {
    FAMILY_THEMES.forEach((theme) => {
      this.themes.set(theme.memberId, theme);
    });
  }

  getTheme(memberId: string): FamilyTheme | undefined {
    return this.themes.get(memberId);
  }

  getAllThemes(): FamilyTheme[] {
    return Array.from(this.themes.values());
  }

  getCurrentTheme(): FamilyTheme | null {
    return this.currentTheme;
  }

  setTheme(memberId: string): FamilyTheme | null {
    const theme = this.themes.get(memberId);
    if (theme) {
      this.currentTheme = theme;
      this.notifyListeners(theme);
      return theme;
    }
    return null;
  }

  subscribe(listener: (theme: FamilyTheme) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(theme: FamilyTheme): void {
    this.listeners.forEach((listener) => {
      try {
        listener(theme);
      } catch (error) {
        console.error("Theme listener error:", error);
      }
    });
  }

  getThemeStyles(memberId: string): React.CSSProperties {
    const theme = this.getTheme(memberId);
    if (!theme) {
      return {};
    }

    return {
      "--theme-primary": theme.colors.primary,
      "--theme-secondary": theme.colors.secondary,
      "--theme-accent": theme.colors.accent,
      "--theme-background": theme.colors.background,
      "--theme-background-gradient": theme.colors.backgroundGradient,
      "--theme-text": theme.colors.text,
      "--theme-text-secondary": theme.colors.textSecondary,
      "--theme-border": theme.colors.border,
      "--theme-glow": theme.colors.glow,
      "--theme-progress": theme.colors.progress,
      "--theme-progress-bg": theme.colors.progressBackground,
      "--theme-button": theme.colors.button,
      "--theme-button-hover": theme.colors.buttonHover,
      "--theme-border-radius": theme.playerStyle.borderRadius,
      "--theme-shadow": theme.playerStyle.boxShadow,
      "--theme-blur": theme.playerStyle.backdropBlur,
      "--theme-font": theme.typography.fontFamily,
      "--theme-title-size": theme.typography.titleSize,
      "--theme-body-size": theme.typography.bodySize,
      background: theme.colors.backgroundGradient,
      color: theme.colors.text,
    } as React.CSSProperties;
  }

  getThemeClassName(memberId: string): string {
    const theme = this.getTheme(memberId);
    if (!theme) {
      return "";
    }

    const classes = [`theme-${memberId}`];

    if (theme.animation.glowEffect) {
      classes.push("theme-glow");
    }
    if (theme.animation.pulseEffect) {
      classes.push("theme-pulse");
    }
    if (theme.animation.particleEffect) {
      classes.push("theme-particles");
    }

    return classes.join(" ");
  }

  getMemberForTheme(themeId: string): FamilyMember | undefined {
    const theme = FAMILY_THEMES.find((t) => t.id === themeId);
    if (!theme) {
      return undefined;
    }
    return FamilyDataAccessor.getMembers().find((m) => m.id === theme.memberId);
  }
}

export const familyThemeManager = new FamilyThemeManagerClass();

export default familyThemeManager;
