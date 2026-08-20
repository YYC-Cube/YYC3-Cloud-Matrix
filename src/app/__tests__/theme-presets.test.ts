/**
 * @file: theme-presets.test.ts
 * @description: 主题预设配置单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect } from "vitest";
import {
  DEFAULT_COLORS,
  THEME_PRESETS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SHADOW,
  DEFAULT_BRANDING,
  type ThemeColors,
  type ThemePreset,
  type ThemeTypography,
  type ThemeShadow,
  type BrandingConfig,
} from "../modules/dev/theme/theme-presets";

describe("theme-presets", () => {
  describe("DEFAULT_COLORS", () => {
    it("should have all required color properties", () => {
      const requiredKeys: (keyof ThemeColors)[] = [
        "primary",
        "primaryForeground",
        "secondary",
        "secondaryForeground",
        "accent",
        "accentForeground",
        "background",
        "foreground",
        "card",
        "cardForeground",
        "popover",
        "popoverForeground",
        "muted",
        "mutedForeground",
        "destructive",
        "destructiveForeground",
        "border",
        "input",
        "ring",
        "chart1",
        "chart2",
        "chart3",
        "chart4",
        "chart5",
        "chart6",
        "sidebar",
        "sidebarForeground",
        "sidebarPrimary",
        "sidebarPrimaryForeground",
        "sidebarAccent",
        "sidebarAccentForeground",
        "sidebarBorder",
        "sidebarRing",
      ];

      requiredKeys.forEach((key) => {
        expect(DEFAULT_COLORS[key]).toBeDefined();
        expect(typeof DEFAULT_COLORS[key]).toBe("string");
      });
    });

    it("should have valid hex color format for primary", () => {
      expect(DEFAULT_COLORS.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it("should have valid hex color format for background", () => {
      expect(DEFAULT_COLORS.background).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it("should have valid hex color format for all chart colors", () => {
      for (let i = 1; i <= 6; i++) {
        const chartColor = DEFAULT_COLORS[`chart${i}` as keyof ThemeColors];
        expect(chartColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    it("should have cyberpunk theme primary color as cyan", () => {
      expect(DEFAULT_COLORS.primary).toBe("#00d4ff");
    });

    it("should have dark background color", () => {
      expect(DEFAULT_COLORS.background).toBe("#060e1f");
    });
  });

  describe("THEME_PRESETS", () => {
    it("should be an array of theme presets", () => {
      expect(Array.isArray(THEME_PRESETS)).toBe(true);
      expect(THEME_PRESETS.length).toBeGreaterThan(0);
    });

    it("should have base theme as first preset", () => {
      expect(THEME_PRESETS[0].id).toBe("base");
      expect(THEME_PRESETS[0].name).toBe("基础色调");
      expect(THEME_PRESETS[0].nameEn).toBe("Base Tone");
    });

    it("should have cosmic-night theme", () => {
      const cosmicNight = THEME_PRESETS.find((p) => p.id === "cosmic-night");
      expect(cosmicNight).toBeDefined();
      expect(cosmicNight?.name).toBe("宇宙之夜");
      expect(cosmicNight?.colors.primary).toBe("#7c5cfc");
    });

    it("should have soft-pop theme", () => {
      const softPop = THEME_PRESETS.find((p) => p.id === "soft-pop");
      expect(softPop).toBeDefined();
      expect(softPop?.name).toBe("柔和流行");
      expect(softPop?.colors.primary).toBe("#f472b6");
    });

    it("should have cyberpunk theme", () => {
      const cyberpunk = THEME_PRESETS.find((p) => p.id === "cyberpunk");
      expect(cyberpunk).toBeDefined();
      expect(cyberpunk?.name).toBe("赛博朋克");
      expect(cyberpunk?.colors.primary).toBe("#00ffaa");
    });

    it("should have minimal theme", () => {
      const minimal = THEME_PRESETS.find((p) => p.id === "minimal");
      expect(minimal).toBeDefined();
      expect(minimal?.name).toBe("现代极简");
      expect(minimal?.colors.primary).toBe("#f8f8f8");
    });

    it("should have future-tech theme", () => {
      const futureTech = THEME_PRESETS.find((p) => p.id === "future-tech");
      expect(futureTech).toBeDefined();
      expect(futureTech?.name).toBe("未来科技");
      expect(futureTech?.colors.primary).toBe("#38bdf8");
    });

    it("each preset should have all required color properties", () => {
      const requiredKeys: (keyof ThemeColors)[] = [
        "primary",
        "primaryForeground",
        "secondary",
        "background",
        "foreground",
        "card",
        "muted",
        "destructive",
        "border",
        "ring",
      ];

      THEME_PRESETS.forEach((preset) => {
        requiredKeys.forEach((key) => {
          expect(preset.colors[key]).toBeDefined();
          expect(typeof preset.colors[key]).toBe("string");
        });
      });
    });

    it("each preset should have unique id", () => {
      const ids = THEME_PRESETS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("each preset should have name and nameEn", () => {
      THEME_PRESETS.forEach((preset) => {
        expect(preset.name).toBeDefined();
        expect(typeof preset.name).toBe("string");
        expect(preset.nameEn).toBeDefined();
        expect(typeof preset.nameEn).toBe("string");
      });
    });
  });

  describe("DEFAULT_TYPOGRAPHY", () => {
    it("should have all required typography properties", () => {
      const requiredKeys: (keyof ThemeTypography)[] = ["sansSerif", "serif", "mono"];

      requiredKeys.forEach((key) => {
        expect(DEFAULT_TYPOGRAPHY[key]).toBeDefined();
        expect(typeof DEFAULT_TYPOGRAPHY[key]).toBe("string");
      });
    });

    it("should have Rajdhani as sans-serif font", () => {
      expect(DEFAULT_TYPOGRAPHY.sansSerif).toContain("Rajdhani");
    });

    it("should have JetBrains Mono as mono font", () => {
      expect(DEFAULT_TYPOGRAPHY.mono).toContain("JetBrains Mono");
    });
  });

  describe("DEFAULT_SHADOW", () => {
    it("should have all required shadow properties", () => {
      const requiredKeys: (keyof ThemeShadow)[] = [
        "offsetX",
        "offsetY",
        "blur",
        "spread",
        "color",
      ];

      requiredKeys.forEach((key) => {
        expect(DEFAULT_SHADOW[key]).toBeDefined();
      });
    });

    it("should have numeric offset values", () => {
      expect(typeof DEFAULT_SHADOW.offsetX).toBe("number");
      expect(typeof DEFAULT_SHADOW.offsetY).toBe("number");
      expect(typeof DEFAULT_SHADOW.blur).toBe("number");
      expect(typeof DEFAULT_SHADOW.spread).toBe("number");
    });

    it("should have string color value", () => {
      expect(typeof DEFAULT_SHADOW.color).toBe("string");
    });

    it("should have zero offset by default", () => {
      expect(DEFAULT_SHADOW.offsetX).toBe(0);
      expect(DEFAULT_SHADOW.offsetY).toBe(0);
    });
  });

  describe("DEFAULT_BRANDING", () => {
    it("should have all required branding properties", () => {
      const requiredKeys: (keyof BrandingConfig)[] = [
        "systemName",
        "tagline",
        "backgroundUrl",
      ];

      requiredKeys.forEach((key) => {
        expect(DEFAULT_BRANDING[key]).toBeDefined();
        expect(typeof DEFAULT_BRANDING[key]).toBe("string");
      });
    });

    it("should have correct system name", () => {
      expect(DEFAULT_BRANDING.systemName).toBe("YYC³ Cloud Intelli-Matrix");
    });

    it("should have correct tagline", () => {
      expect(DEFAULT_BRANDING.tagline).toBe("本地多端推理矩阵 · 数据看盘");
    });

    it("should have empty background URL by default", () => {
      expect(DEFAULT_BRANDING.backgroundUrl).toBe("");
    });
  });

  describe("Theme Colors Consistency", () => {
    it("all presets should have contrasting primary and primaryForeground", () => {
      THEME_PRESETS.forEach((preset) => {
        const primary = preset.colors.primary;
        const primaryForeground = preset.colors.primaryForeground;

        expect(primary).not.toBe(primaryForeground);
      });
    });

    it("all presets should have contrasting background and foreground", () => {
      THEME_PRESETS.forEach((preset) => {
        const background = preset.colors.background;
        const foreground = preset.colors.foreground;

        expect(background).not.toBe(foreground);
      });
    });

    it("all presets should have sidebar colors defined", () => {
      THEME_PRESETS.forEach((preset) => {
        expect(preset.colors.sidebar).toBeDefined();
        expect(preset.colors.sidebarForeground).toBeDefined();
        expect(preset.colors.sidebarPrimary).toBeDefined();
        expect(preset.colors.sidebarBorder).toBeDefined();
      });
    });
  });
});
