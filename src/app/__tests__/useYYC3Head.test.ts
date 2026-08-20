/**
 * @file: useYYC3Head.test.ts
 * @description: useYYC3Head.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { useYYC3Head } from "../hooks/useYYC3Head";

vi.mock("../lib/yyc3-icons", () => ({
  icons: {
    favicon16: "/yyc3-badge-icons/Web App/favicon-16x16.png",
    favicon32: "/yyc3-badge-icons/Web App/favicon-32x32.png",
    webAppAppleTouch: "/yyc3-badge-icons/Web App/apple-touch-icon.png",
    webAppChrome512: "/yyc3-badge-icons/Web App/chrome-512x512.png",
  },
  iconsCDN: {
    favicon16: "https://cdn.example.com/favicon-16x16.png",
    favicon32: "https://cdn.example.com/favicon-32x32.png",
    webAppAppleTouch: "https://cdn.example.com/apple-touch-icon.png",
  },
}));

describe("useYYC3Head", () => {
  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("should set document title", () => {
    renderHook(() => useYYC3Head());
    expect(document.title).toBe("YYC³ Cloud Intelli-Matrix · 数据看盘");
  });

  it("should add favicon links", () => {
    renderHook(() => useYYC3Head());
    
    const favicon16 = document.querySelector('link[rel="icon"][sizes="16x16"]');
    const favicon32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
    
    expect(favicon16).toBeInTheDocument();
    expect(favicon32).toBeInTheDocument();
    expect(favicon16?.getAttribute("href")).toBe("/yyc3-badge-icons/Web App/favicon-16x16.png");
    expect(favicon32?.getAttribute("href")).toBe("/yyc3-badge-icons/Web App/favicon-32x32.png");
  });

  it("should add apple touch icon", () => {
    renderHook(() => useYYC3Head());
    
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"][sizes="180x180"]');
    
    expect(appleTouchIcon).toBeInTheDocument();
    expect(appleTouchIcon?.getAttribute("href")).toBe("/yyc3-badge-icons/Web App/apple-touch-icon.png");
  });

  it("should add manifest link", () => {
    renderHook(() => useYYC3Head());
    
    const manifest = document.querySelector('link[rel="manifest"]');
    
    expect(manifest).toBeInTheDocument();
    expect(manifest?.getAttribute("href")).toBe("/manifest.json");
  });

  it("should set theme color meta", () => {
    renderHook(() => useYYC3Head());
    
    const themeColor = document.querySelector('meta[name="theme-color"]');
    
    expect(themeColor).toBeInTheDocument();
    expect(themeColor?.getAttribute("content")).toBe("#060e1f");
  });

  it("should set apple mobile web app meta tags", () => {
    renderHook(() => useYYC3Head());
    
    const statusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    const capable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    const title = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    
    expect(statusBarStyle).toBeInTheDocument();
    expect(statusBarStyle?.getAttribute("content")).toBe("black-translucent");
    
    expect(capable).toBeInTheDocument();
    expect(capable?.getAttribute("content")).toBe("yes");
    
    expect(title).toBeInTheDocument();
    expect(title?.getAttribute("content")).toBe("YYC³ Cloud");
  });

  it("should set description meta", () => {
    renderHook(() => useYYC3Head());
    
    const description = document.querySelector('meta[name="description"]');
    
    expect(description).toBeInTheDocument();
    expect(description?.getAttribute("content")).toContain("YYC³ Cloud Intelli-Matrix");
  });

  it("should set og meta tags", () => {
    renderHook(() => useYYC3Head());
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogType = document.querySelector('meta[property="og:type"]');
    
    expect(ogTitle).toBeInTheDocument();
    expect(ogTitle?.getAttribute("content")).toBe("YYC³ Cloud Intelli-Matrix");
    
    expect(ogDescription).toBeInTheDocument();
    expect(ogDescription?.getAttribute("content")).toContain("本地闭环多端推理矩阵数据看盘系统");
    
    expect(ogImage).toBeInTheDocument();
    expect(ogType?.getAttribute("content")).toBe("website");
  });

  it("should add error handlers for fallback to CDN", () => {
    renderHook(() => useYYC3Head());
    
    const favicon16 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="16x16"]');
    const favicon32 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="32x32"]');
    const appleTouchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"][sizes="180x180"]');
    
    expect(favicon16?.onerror).toBeDefined();
    expect(favicon32?.onerror).toBeDefined();
    expect(appleTouchIcon?.onerror).toBeDefined();
  });
});
