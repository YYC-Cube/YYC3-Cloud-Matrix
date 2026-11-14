/**
 * @file: useSecurityMonitor.ts
 * @description: 安全与性能监控 Hook · 真实浏览器采集（demoMode 关闭）/ 演示数据（demoMode 开启）
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-02-26
 * @updated: 2026-11-14
 * @status: active
 * @tags: [hook],[security],[monitoring],[real-data]
 *
 * @brief: 安全与性能监控
 *
 * @details:
 * - demoMode 关闭（默认）：全部指标来自真实浏览器 API
 *   · CSP：解析 meta[http-equiv] 标签；响应头 CSP 页面上下文不可读，如实标注
 *   · Cookie：仅可统计数量；Secure/HttpOnly/SameSite 属性 JS 不可读，如实标注
 *   · 敏感数据：真实枚举 localStorage / sessionStorage 键并按名称启发式评估
 *   · 性能：PerformanceResourceTiming / PerformanceNavigationTiming 真实条目
 *   · 内存：performance.memory（Chromium）；listeners/timers JS 不可测，输出 -1（UI 显示 N/A）
 *   · Web Vitals：TTFB / LCP（buffered 观察者）真实值，FID/INP 无法回溯不产出
 *   · 设备：WebGL UNMASKED_RENDERER 真实 GPU；navigator 真实值
 *   · 存储：localStorage 体积实算 + navigator.storage.estimate()
 * - demoMode 开启：使用演示生成器，用于界面演示
 *
 * @dependencies: React, settings-ssot-slice (demoMode)
 * @exports: useSecurityMonitor
 */

import { useState, useCallback } from "react";
import { useSettingsSSOT } from "../store/slices/settings-ssot-slice";
import type {
  SecurityTab,
  RiskLevel,
  CSPResult,
  CookieResult,
  SensitiveDataResult,
  PerformanceResult,
  MemoryResult,
  WebVital,
  DeviceInfo,
  NetworkInfo,
  BrowserInfo,
  DataManagementState,
  SecurityMonitorState,
} from "../types";

// RF-011: Re-export 已移除 — 所有类型统一从 types/index.ts 导入

// 备份时间戳键：由 full-backup.ts 的 downloadFullBackup 写入
const LAST_BACKUP_KEY = "yyc3_last_backup_at";

// 敏感键名启发式（真实枚举仅做提示，不读取值内容）
const SENSITIVE_KEY_RE = /token|secret|password|apikey|api_key|credential|private/i;

// ============================================================
// Real Collectors（demoMode 关闭路径 · 2026-11-14）
// ============================================================

/** CSP：页面上下文只能读到 meta 标签声明；响应头 CSP 不可读，如实标注 */
function realCSP(): CSPResult {
  if (typeof document === "undefined") {
    return { enabled: false, directives: [], inlineBlocked: false, recommendations: ["非浏览器环境，无法检测"], score: 0 };
  }
  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  const content = meta?.getAttribute("content") ?? "";
  if (!content) {
    return {
      enabled: false,
      directives: [],
      inlineBlocked: false,
      recommendations: [
        "页面未通过 meta 标签声明 CSP",
        "响应头 Content-Security-Policy 在页面上下文中不可读，如需完整审计请在服务端检查",
        "建议配置 default-src 'self' 并逐步收紧 script-src / style-src",
      ],
      score: 0,
    };
  }
  const directives = content.split(";").map((d) => d.trim()).filter(Boolean).map((d) => {
    const [name, ...rest] = d.split(/\s+/);
    const value = rest.join(" ");
    const risky = /'unsafe-inline'|'unsafe-eval'|\*/.test(value);
    return { name, value, status: (risky ? "warn" : "pass") as "pass" | "warn" | "fail" };
  });
  const warnCount = directives.filter((d) => d.status === "warn").length;
  const recommendations: string[] = [];
  if (warnCount > 0) {
    recommendations.push(`${warnCount} 条指令包含 unsafe-inline / unsafe-eval / 通配符，建议收紧`);
  }
  if (!directives.some((d) => d.name === "default-src")) {
    recommendations.push("缺少 default-src 兜底指令");
  }
  if (recommendations.length === 0) {
    recommendations.push("CSP 指令配置良好");
  }
  recommendations.push("响应头 CSP 页面上下文不可读，完整审计需服务端配合");
  return {
    enabled: true,
    directives,
    inlineBlocked: !/'unsafe-inline'/.test(content),
    recommendations,
    score: Math.max(0, 100 - warnCount * 15),
  };
}

/** Cookie：JS 仅可见数量；Secure/HttpOnly/SameSite 标志不可读，不参与评分 */
function realCookie(): CookieResult {
  const count = typeof document === "undefined" || !document.cookie
    ? 0
    : document.cookie.split(";").filter((c) => c.trim()).length;
  return {
    count,
    checks: [
      {
        name: "可观测性说明",
        status: "warn",
        detail: "Cookie 的 Secure / HttpOnly / SameSite 属性在 JS 中不可读，需在服务端审计 Set-Cookie 响应头",
      },
    ],
    // -1 表示不参与总评（无真实评分能力）
    score: -1,
  };
}

/** 敏感数据：真实枚举两个 Web Storage 的键 */
function realSensitive(): SensitiveDataResult {
  const scan = (storage: Storage | undefined): { key: string; risk: RiskLevel; detail: string }[] => {
    if (!storage) {return [];}
    const out: { key: string; risk: RiskLevel; detail: string }[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) {continue;}
      const sizeKB = ((storage.getItem(key)?.length ?? 0) * 2 / 1024).toFixed(1);
      if (SENSITIVE_KEY_RE.test(key)) {
        out.push({ key, risk: "warning", detail: `键名疑似敏感（${sizeKB} KB），请确认内容已加密` });
      } else {
        out.push({ key, risk: "safe", detail: `${sizeKB} KB，未发现敏感特征` });
      }
    }
    return out;
  };
  const local = scan(typeof localStorage !== "undefined" ? localStorage : undefined);
  const session = scan(typeof sessionStorage !== "undefined" ? sessionStorage : undefined);
  const warnings = [...local, ...session].filter((e) => e.risk === "warning").length;
  return {
    localStorage: local,
    sessionStorage: session,
    consoleRisks: 0,
    totalRisks: warnings,
    score: Math.max(0, 100 - warnings * 10),
  };
}

/** 性能：PerformanceResourceTiming / NavigationTiming 真实条目 */
function realPerformance(): PerformanceResult {
  if (typeof performance === "undefined" || !performance.getEntriesByType) {
    return { resources: [], totalResources: 0, totalSize: 0, pageLoadTime: 0, imgOptimizations: [], jsBundles: [], lazyLoadSavings: 0 };
  }
  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const resources = entries.map((e) => ({
    name: e.name.split("/").pop()?.split("?")[0] || e.name,
    type: e.initiatorType,
    size: e.transferSize,
    loadTime: Math.round(e.duration),
    cached: e.transferSize === 0 && e.decodedBodySize > 0,
  }));
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const jsBundles = entries
    .filter((e) => e.initiatorType === "script" || e.initiatorType === "link")
    .map((e) => ({
      name: e.name.split("/").pop()?.split("?")[0] || e.name,
      size: e.decodedBodySize,
      gzipped: e.transferSize,
    }));
  const imgOptimizations: string[] = [];
  if (typeof document !== "undefined") {
    const imgs = Array.from(document.querySelectorAll("img"));
    const noLazy = imgs.filter((img) => img.loading !== "lazy").length;
    if (noLazy > 0) {
      imgOptimizations.push(`${noLazy} 张图片未启用懒加载（loading="lazy"）`);
    }
  }
  const totalSize = entries.reduce((a, e) => a + e.transferSize, 0);
  return {
    resources,
    totalResources: entries.length,
    totalSize,
    pageLoadTime: nav ? Math.round(nav.duration) : 0,
    imgOptimizations,
    jsBundles,
    lazyLoadSavings: 0,
  };
}

/** 内存：performance.memory（Chromium 专有）；listeners/timers JS 不可测 → -1（UI 显示 N/A） */
function realMemory(): MemoryResult {
  const nav = typeof performance !== "undefined"
    ? (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
    : undefined;
  const domNodes = typeof document !== "undefined" ? document.querySelectorAll("*").length : 0;
  const used = nav?.usedJSHeapSize ?? 0;
  const total = nav?.totalJSHeapSize ?? 0;
  const limit = nav?.jsHeapSizeLimit ?? 0;
  const usageRatio = limit > 0 ? used / limit : 0;
  const leakRisk: RiskLevel = usageRatio > 0.7 ? "danger" : usageRatio > 0.4 ? "warning" : "safe";
  return {
    usedJSHeap: used,
    totalJSHeap: total,
    jsHeapLimit: limit,
    listeners: -1, // JS 无法统计事件监听器数量
    timers: -1,    // JS 无法统计活动定时器数量
    domNodes,
    leakRisk,
    trend: [Math.round(used / 1024 / 1024)], // 单点真实采样；历史趋势需多次扫描累积
  };
}

/** Web Vitals：TTFB / LCP 真实可回溯指标；FID/INP 需用户交互，扫描时点无法回溯，不产出 */
function realVitals(): WebVital[] {
  const vitals: WebVital[] = [];
  if (typeof performance === "undefined") {return vitals;}
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav) {
    const ttfb = Math.round(nav.responseStart);
    vitals.push({
      name: "TTFB",
      value: ttfb,
      unit: "ms",
      rating: ttfb < 800 ? "good" : ttfb < 1800 ? "needs-improvement" : "poor",
      target: "< 800ms",
    });
  }
  try {
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    const lcp = lcpEntries[lcpEntries.length - 1];
    if (lcp) {
      const sec = Math.round(lcp.startTime) / 1000;
      vitals.push({
        name: "LCP",
        value: Math.round(sec * 100) / 100,
        unit: "s",
        rating: sec < 2.5 ? "good" : sec < 4 ? "needs-improvement" : "poor",
        target: "< 2.5s",
      });
    }
  } catch {
    // 部分浏览器不支持该 entryType，跳过
  }
  try {
    const clsEntries = performance.getEntriesByType("layout-shift") as (PerformanceEntry & { value?: number; hadRecentInput?: boolean })[];
    const cls = clsEntries.filter((e) => !e.hadRecentInput).reduce((a, e) => a + (e.value ?? 0), 0);
    if (clsEntries.length > 0) {
      vitals.push({
        name: "CLS",
        value: Math.round(cls * 1000) / 1000,
        unit: "",
        rating: cls < 0.1 ? "good" : cls < 0.25 ? "needs-improvement" : "poor",
        target: "< 0.1",
      });
    }
  } catch {
    // 同上
  }
  return vitals;
}

/** 设备信息：全部真实采集，GPU 经 WebGL 调试扩展读取 */
function realDevice(): DeviceInfo {
  let gpu = "未知（浏览器未暴露）";
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    // 保持「未知」
  }
  return {
    cpuCores: typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 0 : 0,
    memory: typeof navigator !== "undefined" ? (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? null : null,
    screen: typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "未知",
    pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    touchSupport: typeof window !== "undefined" ? "ontouchstart" in window : false,
    gpu,
    platform: typeof navigator !== "undefined" ? navigator.platform || "未知" : "未知",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "未知",
  };
}

/** 网络信息：navigator.connection 真实值，不支持的浏览器如实标注 */
function realNetwork(): NetworkInfo {
  const conn = typeof navigator !== "undefined"
    ? (navigator as unknown as { connection?: { type?: string; downlink?: number; rtt?: number; effectiveType?: string; saveData?: boolean } }).connection
    : undefined;
  return {
    type: conn?.type || "unknown",
    downlink: conn?.downlink ?? 0,
    rtt: conn?.rtt ?? 0,
    effectiveType: conn?.effectiveType || "unknown",
    isStable: typeof navigator !== "undefined" ? navigator.onLine : false,
    saveData: conn?.saveData ?? false,
  };
}

/** 浏览器信息：UA 真实解析 + 特性真实探测 */
function realBrowser(): BrowserInfo {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  let name = "未知";
  let version = "未知";
  const pick = (re: RegExp): string | null => {
    const m = ua.match(re);
    return m ? m[1] : null;
  };
  if (ua.includes("Edg/")) { name = "Edge"; version = pick(/Edg\/([\d.]+)/) ?? "未知"; }
  else if (ua.includes("Firefox/")) { name = "Firefox"; version = pick(/Firefox\/([\d.]+)/) ?? "未知"; }
  else if (ua.includes("Chrome/")) { name = "Chrome"; version = pick(/Chrome\/([\d.]+)/) ?? "未知"; }
  else if (ua.includes("Safari/")) { name = "Safari"; version = pick(/Version\/([\d.]+)/) ?? "未知"; }

  const w = typeof window !== "undefined" ? window : ({} as Window);
  const hasGL2 = (() => {
    try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; }
  })();
  const features = [
    { name: "WebSocket", supported: "WebSocket" in w, polyfillNeeded: false },
    { name: "Service Worker", supported: typeof navigator !== "undefined" && "serviceWorker" in navigator, polyfillNeeded: false },
    { name: "IndexedDB", supported: "indexedDB" in w, polyfillNeeded: false },
    { name: "Web Crypto API", supported: typeof crypto !== "undefined" && !!crypto.subtle, polyfillNeeded: false },
    { name: "ResizeObserver", supported: "ResizeObserver" in w, polyfillNeeded: false },
    { name: "IntersectionObserver", supported: "IntersectionObserver" in w, polyfillNeeded: false },
    { name: "File System Access API", supported: "showOpenFilePicker" in w, polyfillNeeded: false },
    { name: "WebGL 2.0", supported: hasGL2, polyfillNeeded: false },
    { name: "CSS Container Queries", supported: typeof CSS !== "undefined" && CSS.supports?.("container-type: inline-size") === true, polyfillNeeded: false },
    { name: "View Transitions API", supported: "startViewTransition" in document, polyfillNeeded: false },
    { name: "Web Bluetooth", supported: typeof navigator !== "undefined" && "bluetooth" in navigator, polyfillNeeded: false },
    { name: "WebXR", supported: typeof navigator !== "undefined" && "xr" in navigator, polyfillNeeded: false },
  ];
  const unsupported = features.filter((f) => !f.supported).length;
  return { name, version, features, upgradeNeeded: unsupported > 4 };
}

/** 数据管理：真实存储体积 + storage.estimate() */
async function realDataManagement(): Promise<DataManagementState> {
  const sizeOf = (storage: Storage | undefined): number => {
    if (!storage) {return 0;}
    let bytes = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) {continue;}
      bytes += (key.length + (storage.getItem(key)?.length ?? 0)) * 2; // UTF-16
    }
    return bytes;
  };
  const localBytes = sizeOf(typeof localStorage !== "undefined" ? localStorage : undefined);
  const sessionBytes = sizeOf(typeof sessionStorage !== "undefined" ? sessionStorage : undefined);
  let idbBytes = 0;
  let cacheBytes = 0;
  let total = localBytes + sessionBytes;
  try {
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      const details = (est as unknown as { usageDetails?: { indexedDB?: number; caches?: number } }).usageDetails;
      idbBytes = details?.indexedDB ?? 0;
      cacheBytes = details?.caches ?? 0;
      // usage 总量优先采用浏览器估值（含 idb/caches 等），但不少于两项 Web Storage 实算
      total = Math.max(est.usage ?? 0, localBytes + sessionBytes);
    }
  } catch {
    // estimate 不可用时保留实算总量
  }
  const lastBackupRaw = typeof localStorage !== "undefined" ? localStorage.getItem(LAST_BACKUP_KEY) : null;
  const lastBackup = lastBackupRaw ? Number(lastBackupRaw) : null;
  return {
    storage: {
      localStorage: localBytes,
      sessionStorage: sessionBytes,
      indexedDB: idbBytes,
      cacheAPI: cacheBytes,
      total,
    },
    lastBackup: lastBackup && Number.isFinite(lastBackup) ? lastBackup : null,
    syncEnabled: typeof window !== "undefined" && "BroadcastChannel" in window,
    expiredItems: 0, // 无 TTL 体系，如实为 0
    cacheSize: cacheBytes,
  };
}

/** 演示数据生成器（仅 demoMode 开启时使用） */
function mockCSP(): CSPResult {
  return {
    enabled: true,
    directives: [
      { name: "default-src", value: "'self'", status: "pass" },
      { name: "script-src", value: "'self' 'unsafe-inline'", status: "warn" },
      { name: "style-src", value: "'self' 'unsafe-inline'", status: "warn" },
      { name: "img-src", value: "'self' data: https:", status: "pass" },
      { name: "connect-src", value: "'self' wss://192.168.3.*", status: "pass" },
      { name: "frame-ancestors", value: "'none'", status: "pass" },
      { name: "base-uri", value: "'self'", status: "pass" },
      { name: "form-action", value: "'self'", status: "pass" },
    ],
    inlineBlocked: false,
    recommendations: [
      "移除 script-src 中的 'unsafe-inline'，改用 nonce 或 hash",
      "添加 upgrade-insecure-requests 指令",
      "配置 report-uri 收集 CSP 违规报告",
    ],
    score: 78,
  };
}

function mockCookie(): CookieResult {
  return {
    count: 4,
    checks: [
      { name: "Secure", status: "pass", detail: "所有 Cookie 已设置 Secure 标志" },
      { name: "HttpOnly", status: "warn", detail: "2/4 Cookie 缺少 HttpOnly 标志" },
      { name: "SameSite", status: "pass", detail: "所有 Cookie 已设置 SameSite=Strict" },
      { name: "过期时间", status: "pass", detail: "所有 Cookie 有合理的过期时间" },
    ],
    score: 82,
  };
}

function mockSensitive(): SensitiveDataResult {
  return {
    localStorage: [
      { key: "yyc3_locale", risk: "safe", detail: "语言设置，无风险" },
      { key: "yyc3_theme", risk: "safe", detail: "主题配置，无风险" },
      { key: "debug_token", risk: "warning", detail: "疑似调试 Token，建议清理" },
    ],
    sessionStorage: [
      { key: "session_cache", risk: "safe", detail: "会话缓存，安全" },
    ],
    consoleRisks: 0,
    totalRisks: 1,
    score: 90,
  };
}

function mockPerformance(): PerformanceResult {
  return {
    resources: [
      { name: "main.js", type: "script", size: 245760, loadTime: 120, cached: true },
      { name: "vendor.js", type: "script", size: 512000, loadTime: 85, cached: true },
      { name: "styles.css", type: "stylesheet", size: 32768, loadTime: 25, cached: true },
      { name: "index.html", type: "document", size: 4096, loadTime: 15, cached: false },
      { name: "logo.svg", type: "image", size: 2048, loadTime: 8, cached: true },
      { name: "fonts.woff2", type: "font", size: 65536, loadTime: 45, cached: true },
    ],
    totalResources: 24,
    totalSize: 1.8 * 1024 * 1024,
    pageLoadTime: 1250,
    imgOptimizations: [
      "3 张图片可转换为 WebP 格式，预计节省 40%",
      "2 张图片可启用懒加载",
      "1 张图片建议使用 srcset 适配多分辨率",
    ],
    jsBundles: [
      { name: "main.js", size: 245760, gzipped: 78643 },
      { name: "vendor.js", size: 512000, gzipped: 163840 },
      { name: "recharts.js", size: 180224, gzipped: 57672 },
    ],
    lazyLoadSavings: 35,
  };
}

function mockMemory(): MemoryResult {
  return {
    usedJSHeap: 45 * 1024 * 1024,
    totalJSHeap: 68 * 1024 * 1024,
    jsHeapLimit: 2048 * 1024 * 1024,
    listeners: 127,
    timers: 8,
    domNodes: 1843,
    leakRisk: "safe",
    trend: [38, 40, 42, 41, 43, 44, 45, 44, 45, 45],
  };
}

function mockVitals(): WebVital[] {
  return [
    { name: "FID", value: 12, unit: "ms", rating: "good", target: "< 100ms" },
    { name: "INP", value: 85, unit: "ms", rating: "good", target: "< 200ms" },
    { name: "CLS", value: 0.03, unit: "", rating: "good", target: "< 0.1" },
    { name: "TTFB", value: 180, unit: "ms", rating: "good", target: "< 800ms" },
    { name: "LCP", value: 1.8, unit: "s", rating: "good", target: "< 2.5s" },
  ];
}

function mockDevice(): DeviceInfo {
  return {
    cpuCores: typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 8 : 8,
    memory: typeof navigator !== "undefined" ? (navigator as unknown as { deviceMemory?: number }).deviceMemory || null : null,
    screen: typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "1920x1080",
    pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 2,
    touchSupport: typeof window !== "undefined" ? "ontouchstart" in window : false,
    gpu: "演示 GPU（demoMode）",
    platform: typeof navigator !== "undefined" ? navigator.platform || "MacIntel" : "MacIntel",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Mock UA",
  };
}

function mockNetwork(): NetworkInfo {
  const conn = typeof navigator !== "undefined" ? (navigator as unknown as { connection?: { type?: string; downlink?: number; rtt?: number; effectiveType?: string; saveData?: boolean } }).connection : null;
  return {
    type: conn?.type || "wifi",
    downlink: conn?.downlink || 100,
    rtt: conn?.rtt || 12,
    effectiveType: conn?.effectiveType || "4g",
    isStable: true,
    saveData: conn?.saveData || false,
  };
}

function mockBrowser(): BrowserInfo {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  let name = "Chrome";
  let version = "120";
  if (ua.includes("Firefox")) { name = "Firefox"; version = "121"; }
  else if (ua.includes("Safari") && !ua.includes("Chrome")) { name = "Safari"; version = "17"; }

  return {
    name,
    version,
    features: [
      { name: "WebSocket", supported: true, polyfillNeeded: false },
      { name: "Service Worker", supported: true, polyfillNeeded: false },
      { name: "IndexedDB", supported: true, polyfillNeeded: false },
      { name: "Web Crypto API", supported: true, polyfillNeeded: false },
      { name: "ResizeObserver", supported: true, polyfillNeeded: false },
      { name: "IntersectionObserver", supported: true, polyfillNeeded: false },
      { name: "File System Access API", supported: true, polyfillNeeded: false },
      { name: "WebGL 2.0", supported: true, polyfillNeeded: false },
      { name: "CSS Container Queries", supported: true, polyfillNeeded: false },
      { name: "View Transitions API", supported: true, polyfillNeeded: false },
      { name: "Web Bluetooth", supported: false, polyfillNeeded: false },
      { name: "WebXR", supported: false, polyfillNeeded: false },
    ],
    upgradeNeeded: false,
  };
}

function mockDataManagement(): DataManagementState {
  return {
    storage: {
      localStorage: 2048,
      sessionStorage: 512,
      indexedDB: 15 * 1024 * 1024,
      cacheAPI: 8 * 1024 * 1024,
      total: 23 * 1024 * 1024 + 2560,
    },
    lastBackup: Date.now() - 86400000,
    syncEnabled: true,
    expiredItems: 12,
    cacheSize: 8 * 1024 * 1024,
  };
}

// ============================================================
// Hook
// ============================================================

export function useSecurityMonitor() {
  const demoMode = useSettingsSSOT((s) => s.toggles.demoMode);
  const [state, setState] = useState<SecurityMonitorState>({
    activeTab: "security",
    scanStatus: "idle",
    lastScanTime: null,
    overallScore: 0,
    overallRisk: "safe",
    csp: null,
    cookie: null,
    sensitive: null,
    performance: null,
    memory: null,
    vitals: [],
    device: null,
    network: null,
    browser: null,
    dataManagement: null,
  });

  const setActiveTab = useCallback((tab: SecurityTab) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const startScan = useCallback(async () => {
    setState((prev) => ({ ...prev, scanStatus: "scanning" }));

    let csp: CSPResult;
    let cookie: CookieResult;
    let sensitive: SensitiveDataResult;
    let perf: PerformanceResult;
    let mem: MemoryResult;
    let vitals: WebVital[];
    let device: DeviceInfo;
    let network: NetworkInfo;
    let browser: BrowserInfo;
    let dataMgmt: DataManagementState;

    if (demoMode) {
      // 演示路径：界面演示专用
      csp = mockCSP();
      cookie = mockCookie();
      sensitive = mockSensitive();
      perf = mockPerformance();
      mem = mockMemory();
      vitals = mockVitals();
      device = mockDevice();
      network = mockNetwork();
      browser = mockBrowser();
      dataMgmt = mockDataManagement();
    } else {
      // 真实路径：全部来自浏览器真实 API
      csp = realCSP();
      cookie = realCookie();
      sensitive = realSensitive();
      perf = realPerformance();
      mem = realMemory();
      vitals = realVitals();
      device = realDevice();
      network = realNetwork();
      browser = realBrowser();
      dataMgmt = await realDataManagement();
    }

    // 仅对有真实评分能力的项求均值（cookie.score = -1 表示不参与）
    const scores = [csp.score, cookie.score, sensitive.score].filter((s) => s >= 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const risk: RiskLevel = avgScore >= 80 ? "safe" : avgScore >= 60 ? "warning" : "danger";

    setState((prev) => ({
      ...prev,
      scanStatus: "complete",
      lastScanTime: Date.now(),
      overallScore: avgScore,
      overallRisk: risk,
      csp,
      cookie,
      sensitive,
      performance: perf,
      memory: mem,
      vitals,
      device,
      network,
      browser,
      dataManagement: dataMgmt,
    }));
  }, [demoMode]);

  const cleanupData = useCallback(async (type: "expired" | "cache" | "privacy") => {
    if (!demoMode) {
      // 真实清理动作
      if (type === "cache" && typeof caches !== "undefined") {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {
          // Cache API 不可用时忽略
        }
      }
      if (type === "privacy" && typeof sessionStorage !== "undefined") {
        sessionStorage.clear();
      }
      // expired：无 TTL 体系，本就为 0
    }
    // 重新实算存储状态
    const dm = demoMode
      ? mockDataManagement()
      : await realDataManagement();
    setState((prev) => ({ ...prev, dataManagement: dm }));
  }, [demoMode]);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yyc3-security-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  return {
    ...state,
    setActiveTab,
    startScan,
    cleanupData,
    exportData,
  };
}
