/**
 * @file: yyc3-icons.test.ts
 * @description: yyc3-icons.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

import { describe, it, expect } from "vitest";
import { icons, iconsCDN, handleIconError } from "../lib/yyc3-icons";

describe("yyc3-icons", () => {
  describe("icons (local paths)", () => {
    it("should have all Android icon paths", () => {
      expect(icons.androidMdpi).toBe("/yyc3-icons/Android/mdpi.png");
      expect(icons.androidHdpi).toBe("/yyc3-icons/Android/hdpi.png");
      expect(icons.androidXhdpi).toBe("/yyc3-icons/Android/xhdpi.png");
      expect(icons.androidXxhdpi).toBe("/yyc3-icons/Android/xxhdpi.png");
      expect(icons.androidXxxhdpi).toBe("/yyc3-icons/Android/xxxhdpi.png");
      expect(icons.androidPlayStore).toBe("/yyc3-icons/Android/Play Store.png");
    });

    it("should have all Web App icon paths", () => {
      expect(icons.favicon16).toBe("/yyc3-icons/Web App/favicon-16.png");
      expect(icons.favicon32).toBe("/yyc3-icons/Web App/favicon-32.png");
      expect(icons.webAppChrome192).toBe("/yyc3-icons/Web App/android-chrome-192.png");
      expect(icons.webAppChrome512).toBe("/yyc3-icons/Web App/android-chrome-512.png");
      expect(icons.webAppAppleTouch).toBe("/yyc3-icons/Web App/apple-touch-icon.png");
    });

    it("should have all iOS icon paths", () => {
      expect(icons.iosAppStore).toBe("/yyc3-icons/iOS/App Store.png");
      expect(icons.iosiPadApp).toBe("/yyc3-icons/iOS/iPad App.png");
      expect(icons.iosiPadNotification).toBe("/yyc3-icons/iOS/iPad Notification.png");
      expect(icons.iosiPadProApp2x).toBe("/yyc3-icons/iOS/iPad Pro App 2x.png");
      expect(icons.iosiPadSettings).toBe("/yyc3-icons/iOS/iPad Settings.png");
      expect(icons.iosiPadSpotlight).toBe("/yyc3-icons/iOS/iPad Spotlight.png");
      expect(icons.iosiPhoneApp2x).toBe("/yyc3-icons/iOS/iPhone App 2x.png");
      expect(icons.iosiPhoneApp3x).toBe("/yyc3-icons/iOS/iPhone App 3x.png");
      expect(icons.iosiPhoneNotification2x).toBe("/yyc3-icons/iOS/iPhone Notification 2x.png");
      expect(icons.iosiPhoneNotification3x).toBe("/yyc3-icons/iOS/iPhone Notification 3x.png");
      expect(icons.iosiPhoneSettings2x).toBe("/yyc3-icons/iOS/iPhone Settings 2x.png");
      expect(icons.iosiPhoneSettings3x).toBe("/yyc3-icons/iOS/iPhone Settings 3x.png");
      expect(icons.iosiPhoneSpotlight2x).toBe("/yyc3-icons/iOS/iPhone Spotlight 2x.png");
      expect(icons.iosiPhoneSpotlight3x).toBe("/yyc3-icons/iOS/iPhone Spotlight 3x.png");
    });

    it("should have all macOS icon paths", () => {
      expect(icons.macOS16).toBe("/yyc3-icons/macOS/16.png");
      expect(icons.macOS32).toBe("/yyc3-icons/macOS/32.png");
      expect(icons.macOS64).toBe("/yyc3-icons/macOS/64.png");
      expect(icons.macOS128).toBe("/yyc3-icons/macOS/128.png");
      expect(icons.macOS256).toBe("/yyc3-icons/macOS/256.png");
      expect(icons.macOS512).toBe("/yyc3-icons/macOS/512.png");
      expect(icons.macOS1024).toBe("/yyc3-icons/macOS/1024.png");
    });

    it("should have all watchOS icon paths", () => {
      expect(icons.watchOSAppStore).toBe("/yyc3-icons/watchOS/App Store.png");
      expect(icons.watchOSHome).toBe("/yyc3-icons/watchOS/Home Screen.png");
      expect(icons.watchOSNotification).toBe("/yyc3-icons/watchOS/Notification.png");
      expect(icons.watchOSShortLook).toBe("/yyc3-icons/watchOS/Short Look.png");
    });

    it("should have semantic aliases", () => {
      expect(icons.logo).toBe("/yyc3-icons/Web App/android-chrome-512.png");
      expect(icons.pwa192).toBe("/yyc3-icons/Web App/android-chrome-192.png");
      expect(icons.pwa512).toBe("/yyc3-icons/Web App/android-chrome-512.png");
      expect(icons.iosAppleTouch).toBe("/yyc3-icons/Web App/apple-touch-icon.png");
      expect(icons.ios1024).toBe("/yyc3-icons/iOS/App Store.png");
      expect(icons.playstore).toBe("/yyc3-icons/Android/Play Store.png");
      expect(icons.logo72).toBe("/yyc3-icons/Android/hdpi.png");
      expect(icons.logo192).toBe("/yyc3-icons/Web App/android-chrome-192.png");
      expect(icons.logo512).toBe("/yyc3-icons/Web App/android-chrome-512.png");
    });

    it("should have all 45 icon paths (32 unique + 13 aliases)", () => {
      const iconKeys = Object.keys(icons);
      expect(iconKeys.length).toBe(45);
    });
  });

  describe("iconsCDN (CDN fallback paths)", () => {
    it("should have all Android icon CDN paths", () => {
      expect(iconsCDN.androidMdpi).toContain("raw.githubusercontent.com");
      expect(iconsCDN.androidMdpi).toContain("Android/mdpi.png");
      expect(iconsCDN.androidHdpi).toContain("Android/hdpi.png");
      expect(iconsCDN.androidPlayStore).toContain("Play%20Store.png");
    });

    it("should have all Web App icon CDN paths", () => {
      expect(iconsCDN.favicon16).toContain("Web App/favicon-16.png");
      expect(iconsCDN.favicon32).toContain("Web App/favicon-32.png");
      expect(iconsCDN.webAppChrome192).toContain("Web App/android-chrome-192.png");
      expect(iconsCDN.webAppChrome512).toContain("Web App/android-chrome-512.png");
      expect(iconsCDN.webAppAppleTouch).toContain("Web App/apple-touch-icon.png");
    });

    it("should have all iOS icon CDN paths", () => {
      expect(iconsCDN.iosAppStore).toContain("iOS/App%20Store.png");
      expect(iconsCDN.iosiPadApp).toContain("iOS/iPad%20App.png");
      expect(iconsCDN.iosiPadNotification).toContain("iOS/iPad%20Notification.png");
      expect(iconsCDN.iosiPadProApp2x).toContain("iOS/iPad%20Pro%20App%202x.png");
      expect(iconsCDN.iosiPadSettings).toContain("iOS/iPad%20Settings.png");
      expect(iconsCDN.iosiPadSpotlight).toContain("iOS/iPad%20Spotlight.png");
      expect(iconsCDN.iosiPhoneApp2x).toContain("iOS/iPhone%20App%202x.png");
      expect(iconsCDN.iosiPhoneApp3x).toContain("iOS/iPhone%20App%203x.png");
      expect(iconsCDN.iosiPhoneNotification2x).toContain("iPhone%20Notification%202x.png");
      expect(iconsCDN.iosiPhoneNotification3x).toContain("iPhone%20Notification%203x.png");
      expect(iconsCDN.iosiPhoneSettings2x).toContain("iPhone%20Settings%202x.png");
      expect(iconsCDN.iosiPhoneSettings3x).toContain("iPhone%20Settings%203x.png");
      expect(iconsCDN.iosiPhoneSpotlight2x).toContain("iPhone%20Spotlight%202x.png");
      expect(iconsCDN.iosiPhoneSpotlight3x).toContain("iPhone%20Spotlight%203x.png");
    });

    it("should have all macOS icon CDN paths", () => {
      expect(iconsCDN.macOS16).toContain("macOS/16.png");
      expect(iconsCDN.macOS32).toContain("macOS/32.png");
      expect(iconsCDN.macOS64).toContain("macOS/64.png");
      expect(iconsCDN.macOS128).toContain("macOS/128.png");
      expect(iconsCDN.macOS256).toContain("macOS/256.png");
      expect(iconsCDN.macOS512).toContain("macOS/512.png");
      expect(iconsCDN.macOS1024).toContain("macOS/1024.png");
    });

    it("should have all watchOS icon CDN paths", () => {
      expect(iconsCDN.watchOSAppStore).toContain("watchOS/App%20Store.png");
      expect(iconsCDN.watchOSHome).toContain("watchOS/Home%20Screen.png");
      expect(iconsCDN.watchOSNotification).toContain("watchOS/Notification.png");
      expect(iconsCDN.watchOSShortLook).toContain("watchOS/Short%20Look.png");
    });

    it("should encode spaces in filenames", () => {
      expect(iconsCDN.androidPlayStore).toContain("Play%20Store.png");
      expect(iconsCDN.iosAppStore).toContain("App%20Store.png");
      expect(iconsCDN.iosiPadApp).toContain("iPad%20App.png");
      expect(iconsCDN.watchOSHome).toContain("Home%20Screen.png");
    });

    it("should have all 45 CDN icon paths (32 unique + 13 aliases)", () => {
      const iconKeys = Object.keys(iconsCDN);
      expect(iconKeys.length).toBe(45);
    });
  });

  describe("path consistency", () => {
    it("should have consistent local and CDN paths", () => {
      const localKeys = Object.keys(icons);
      const cdnKeys = Object.keys(iconsCDN);
      
      expect(localKeys).toEqual(cdnKeys);
    });

    it("should use local base path for icons", () => {
      Object.values(icons).forEach((path) => {
        expect(path).toMatch(/^\/yyc3-icons\//);
      });
    });

    it("should use CDN base path for iconsCDN", () => {
      Object.values(iconsCDN).forEach((path) => {
        expect(path).toMatch(/^https:\/\/raw\.githubusercontent\.com\//);
      });
    });
  });

  describe("handleIconError", () => {
    it("should return a function", () => {
      const handler = handleIconError("favicon16");
      expect(typeof handler).toBe("function");
    });

    it("should set img.src to CDN path when src differs", () => {
      const handler = handleIconError("favicon16");
      const mockImg = {
        src: "/local/path.png",
      };
      const mockEvent = {
        currentTarget: mockImg,
      } as unknown as React.SyntheticEvent<HTMLImageElement>;
      handler(mockEvent);
      expect(mockImg.src).toBe(iconsCDN.favicon16);
    });

    it("should not change src when already using CDN path", () => {
      const handler = handleIconError("favicon16");
      const cdnSrc = iconsCDN.favicon16;
      const mockImg = {
        src: cdnSrc,
      };
      const mockEvent = {
        currentTarget: mockImg,
      } as unknown as React.SyntheticEvent<HTMLImageElement>;
      handler(mockEvent);
      expect(mockImg.src).toBe(cdnSrc);
    });
  });
});
