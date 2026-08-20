/**
 * @file: security-types.ts
 * @description: 安全与性能监控类型 — CSP / Cookie / 性能 / Web Vitals
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[security],[performance]
 */

/** 安全监控标签页 */
export type SecurityTab = "security" | "performance" | "diagnostics" | "dataManagement";

/** 扫描状态 */
export type ScanStatus = "idle" | "scanning" | "complete";

/** 风险等级 */
export type RiskLevel = "safe" | "warning" | "danger";

/** Web Vitals 评级 */
export type VitalRating = "good" | "needs-improvement" | "poor";

/** CSP 检测结果 */
export interface CSPResult {
  enabled: boolean;
  directives: { name: string; value: string; status: "pass" | "warn" | "fail" }[];
  inlineBlocked: boolean;
  recommendations: string[];
  score: number;
}

/** Cookie 检查结果 */
export interface CookieResult {
  count: number;
  checks: { name: string; status: "pass" | "warn" | "fail"; detail: string }[];
  score: number;
}

/** 敏感数据检测结果 */
export interface SensitiveDataResult {
  localStorage: { key: string; risk: RiskLevel; detail: string }[];
  sessionStorage: { key: string; risk: RiskLevel; detail: string }[];
  consoleRisks: number;
  totalRisks: number;
  score: number;
}

/** 资源加载条目 */
export interface ResourceEntry {
  name: string;
  type: string;
  size: number;
  loadTime: number;
  cached: boolean;
}

/** 性能分析结果 */
export interface PerformanceResult {
  resources: ResourceEntry[];
  totalResources: number;
  totalSize: number;
  pageLoadTime: number;
  imgOptimizations: string[];
  jsBundles: { name: string; size: number; gzipped: number }[];
  lazyLoadSavings: number;
}

/** 内存分析结果 */
export interface MemoryResult {
  usedJSHeap: number;
  totalJSHeap: number;
  jsHeapLimit: number;
  listeners: number;
  timers: number;
  domNodes: number;
  leakRisk: RiskLevel;
  trend: number[];
}

/** Web Vitals 指标 */
export interface WebVital {
  name: string;
  value: number;
  unit: string;
  rating: VitalRating;
  target: string;
}

/** 设备信息 */
export interface DeviceInfo {
  cpuCores: number;
  memory: number | null;
  screen: string;
  pixelRatio: number;
  touchSupport: boolean;
  gpu: string;
  platform: string;
  userAgent: string;
}

/** 网络信息 */
export interface NetworkInfo {
  type: string;
  downlink: number;
  rtt: number;
  effectiveType: string;
  isStable: boolean;
  saveData: boolean;
}

/** 浏览器特性支持 */
export interface BrowserFeature {
  name: string;
  supported: boolean;
  polyfillNeeded: boolean;
}

/** 浏览器信息 */
export interface BrowserInfo {
  name: string;
  version: string;
  features: BrowserFeature[];
  upgradeNeeded: boolean;
}

/** 存储使用情况 */
export interface StorageUsage {
  localStorage: number;
  sessionStorage: number;
  indexedDB: number;
  cacheAPI: number;
  total: number;
}

/** 数据管理状态 */
export interface DataManagementState {
  storage: StorageUsage;
  lastBackup: number | null;
  syncEnabled: boolean;
  expiredItems: number;
  cacheSize: number;
}

/** 安全监控完整状态 */
export interface SecurityMonitorState {
  activeTab: SecurityTab;
  scanStatus: ScanStatus;
  lastScanTime: number | null;
  overallScore: number;
  overallRisk: RiskLevel;
  csp: CSPResult | null;
  cookie: CookieResult | null;
  sensitive: SensitiveDataResult | null;
  performance: PerformanceResult | null;
  memory: MemoryResult | null;
  vitals: WebVital[];
  device: DeviceInfo | null;
  network: NetworkInfo | null;
  browser: BrowserInfo | null;
  dataManagement: DataManagementState | null;
}
