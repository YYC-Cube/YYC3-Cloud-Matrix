/**
 * @file: color-utils.test.ts
 * @description: 颜色转换工具测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  rgbToHex,
  hexToOklch,
  oklchToHex,
  formatOklch,
  parseOklchString,
  hsvToRgb,
  rgbToHsv,
  type OklchColor,
} from "../modules/dev/theme/color-utils";

describe("color-utils", () => {
  describe("hexToRgb", () => {
    it("should convert hex to rgb correctly", () => {
      expect(hexToRgb("#FF0000")).toEqual([255, 0, 0]);
      expect(hexToRgb("#00FF00")).toEqual([0, 255, 0]);
      expect(hexToRgb("#0000FF")).toEqual([0, 0, 255]);
      expect(hexToRgb("#FFFFFF")).toEqual([255, 255, 255]);
      expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    });

    it("should handle hex without # prefix", () => {
      expect(hexToRgb("FF0000")).toEqual([255, 0, 0]);
      expect(hexToRgb("00FF00")).toEqual([0, 255, 0]);
    });

    it("should handle invalid hex gracefully", () => {
      expect(hexToRgb("")).toEqual([0, 0, 0]);
      expect(hexToRgb("#")).toEqual([0, 0, 0]);
    });
  });

  describe("rgbToHex", () => {
    it("should convert rgb to hex correctly", () => {
      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
      expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
      expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
      expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
      expect(rgbToHex(0, 0, 0)).toBe("#000000");
    });

    it("should clamp values to valid range", () => {
      expect(rgbToHex(300, -10, 128)).toBe("#ff0080");
      expect(rgbToHex(-50, 300, 0)).toBe("#00ff00");
    });

    it("should round decimal values", () => {
      expect(rgbToHex(127.5, 64.7, 192.3)).toBe("#8041c0");
    });
  });

  describe("hexToOklch and oklchToHex", () => {
    it("should convert hex to oklch", () => {
      const result = hexToOklch("#FF0000");
      expect(result.L).toBeGreaterThan(0);
      expect(result.L).toBeLessThanOrEqual(1);
      expect(result.C).toBeGreaterThanOrEqual(0);
      expect(result.h).toBeGreaterThanOrEqual(0);
      expect(result.h).toBeLessThan(360);
    });

    it("should convert oklch back to hex approximately", () => {
      const originalHex = "#FF0000";
      const oklch = hexToOklch(originalHex);
      const resultHex = oklchToHex(oklch.L, oklch.C, oklch.h);

      const originalRgb = hexToRgb(originalHex);
      const resultRgb = hexToRgb(resultHex);

      const tolerance = 5;
      expect(Math.abs(originalRgb[0] - resultRgb[0])).toBeLessThan(tolerance);
      expect(Math.abs(originalRgb[1] - resultRgb[1])).toBeLessThan(tolerance);
      expect(Math.abs(originalRgb[2] - resultRgb[2])).toBeLessThan(tolerance);
    });

    it("should handle white color", () => {
      const oklch = hexToOklch("#FFFFFF");
      expect(oklch.L).toBeCloseTo(1, 1);
    });

    it("should handle black color", () => {
      const oklch = hexToOklch("#000000");
      expect(oklch.L).toBeCloseTo(0, 1);
    });
  });

  describe("formatOklch", () => {
    it("should format oklch color correctly", () => {
      const oklch: OklchColor = { L: 0.5, C: 0.1, h: 180 };
      const result = formatOklch(oklch);
      expect(result).toBe("oklch(50.0% 0.100 180.0)");
    });

    it("should handle different values", () => {
      const oklch: OklchColor = { L: 0.75, C: 0.25, h: 270 };
      const result = formatOklch(oklch);
      expect(result).toBe("oklch(75.0% 0.250 270.0)");
    });
  });

  describe("parseOklchString", () => {
    it("should parse valid oklch string", () => {
      const result = parseOklchString("oklch(50% 0.1 180)");
      expect(result).toEqual({ L: 0.5, C: 0.1, h: 180 });
    });

    it("should parse oklch string without %", () => {
      const result = parseOklchString("oklch(0.5 0.1 180)");
      expect(result).toEqual({ L: 0.5, C: 0.1, h: 180 });
    });

    it("should return null for invalid string", () => {
      expect(parseOklchString("invalid")).toBeNull();
      expect(parseOklchString("rgb(255, 0, 0)")).toBeNull();
      expect(parseOklchString("#FF0000")).toBeNull();
    });

    it("should handle L value > 1 by dividing by 100", () => {
      const result = parseOklchString("oklch(50 0.1 180)");
      expect(result?.L).toBe(0.5);
    });
  });

  describe("hsvToRgb", () => {
    it("should convert hsv to rgb correctly for red", () => {
      const [r, g, b] = hsvToRgb(0, 1, 1);
      expect(r).toBe(255);
      expect(g).toBe(0);
      expect(b).toBe(0);
    });

    it("should convert hsv to rgb correctly for green", () => {
      const [r, g, b] = hsvToRgb(120, 1, 1);
      expect(r).toBe(0);
      expect(g).toBe(255);
      expect(b).toBe(0);
    });

    it("should convert hsv to rgb correctly for blue", () => {
      const [r, g, b] = hsvToRgb(240, 1, 1);
      expect(r).toBe(0);
      expect(g).toBe(0);
      expect(b).toBe(255);
    });

    it("should convert hsv to rgb correctly for white", () => {
      const [r, g, b] = hsvToRgb(0, 0, 1);
      expect(r).toBe(255);
      expect(g).toBe(255);
      expect(b).toBe(255);
    });

    it("should convert hsv to rgb correctly for black", () => {
      const [r, g, b] = hsvToRgb(0, 0, 0);
      expect(r).toBe(0);
      expect(g).toBe(0);
      expect(b).toBe(0);
    });

    it("should handle all hue ranges", () => {
      const testCases = [
        { h: 30, expected: [255, 128, 0] },
        { h: 90, expected: [128, 255, 0] },
        { h: 150, expected: [0, 255, 128] },
        { h: 210, expected: [0, 128, 255] },
        { h: 270, expected: [128, 0, 255] },
        { h: 330, expected: [255, 0, 128] },
      ];

      testCases.forEach(({ h, expected }) => {
        const [r, g, b] = hsvToRgb(h, 1, 1);
        expect(Math.abs(r - expected[0])).toBeLessThan(2);
        expect(Math.abs(g - expected[1])).toBeLessThan(2);
        expect(Math.abs(b - expected[2])).toBeLessThan(2);
      });
    });
  });

  describe("rgbToHsv", () => {
    it("should convert rgb to hsv correctly for red", () => {
      const [h, s, v] = rgbToHsv(255, 0, 0);
      expect(h).toBe(0);
      expect(s).toBe(1);
      expect(v).toBe(1);
    });

    it("should convert rgb to hsv correctly for green", () => {
      const [h, s, v] = rgbToHsv(0, 255, 0);
      expect(h).toBe(120);
      expect(s).toBe(1);
      expect(v).toBe(1);
    });

    it("should convert rgb to hsv correctly for blue", () => {
      const [h, s, v] = rgbToHsv(0, 0, 255);
      expect(h).toBe(240);
      expect(s).toBe(1);
      expect(v).toBe(1);
    });

    it("should convert rgb to hsv correctly for white", () => {
      const [h, s, v] = rgbToHsv(255, 255, 255);
      expect(s).toBe(0);
      expect(v).toBe(1);
    });

    it("should convert rgb to hsv correctly for black", () => {
      const [h, s, v] = rgbToHsv(0, 0, 0);
      expect(s).toBe(0);
      expect(v).toBe(0);
    });

    it("should be inverse of hsvToRgb", () => {
      const testCases = [
        [0, 1, 1],
        [120, 0.5, 0.8],
        [240, 0.3, 0.6],
        [60, 0.7, 0.9],
      ];

      testCases.forEach(([h, s, v]) => {
        const [r, g, b] = hsvToRgb(h, s, v);
        const [h2, s2, v2] = rgbToHsv(r, g, b);

        expect(Math.abs(h - h2)).toBeLessThan(1);
        expect(Math.abs(s - s2)).toBeLessThan(0.02);
        expect(Math.abs(v - v2)).toBeLessThan(0.02);
      });
    });
  });

  describe("round-trip conversions", () => {
    it("should maintain color through hex -> oklch -> hex conversion", () => {
      const testColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];

      testColors.forEach((hex) => {
        const oklch = hexToOklch(hex);
        const resultHex = oklchToHex(oklch.L, oklch.C, oklch.h);

        const originalRgb = hexToRgb(hex);
        const resultRgb = hexToRgb(resultHex);

        const tolerance = 10;
        expect(Math.abs(originalRgb[0] - resultRgb[0])).toBeLessThan(tolerance);
        expect(Math.abs(originalRgb[1] - resultRgb[1])).toBeLessThan(tolerance);
        expect(Math.abs(originalRgb[2] - resultRgb[2])).toBeLessThan(tolerance);
      });
    });
  });
});
