/**
 * @file: report-export-types.ts
 * @description: 报表导出类型 — 性能/安全快照 + 导出数据
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[report],[export]
 */

/** 导出报告类型 */
export type ExportReportType = "performance" | "security" | "audit" | "comprehensive";

/** 导出格式 */
export type ExportFormat = "json" | "csv" | "print";

/** 时间范围 */
export type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d" | "custom";

/** 报表指标 */
export interface ReportMetric {
  label: string;
  value: string;
  trend: "up" | "down" | "stable";
  change: string;
}

/** 性能快照 */
export interface PerformanceSnapshot {
  timestamp: number;
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  latencyP50: number;
  latencyP99: number;
  throughput: number;
  errorRate: number;
}

/** 安全快照 */
export interface SecuritySnapshot {
  timestamp: number;
  cspScore: number;
  cookieScore: number;
  sensitiveScore: number;
  overallScore: number;
  activeThreats: number;
}

/** 导出报告数据 */
export interface ReportData {
  id: string;
  type: ExportReportType;
  title: string;
  generatedAt: number;
  timeRange: { start: number; end: number; label: string };
  summary: ReportMetric[];
  performanceHistory: PerformanceSnapshot[];
  securityHistory: SecuritySnapshot[];
  recommendations: string[];
  nodeBreakdown: { nodeId: string; avgCpu: number; avgGpu: number; avgLatency: number; errorRate: number }[];
}

/** 报告历史条目 (可持久化) */
export interface ReportHistoryEntry {
  id: string;
  type: ExportReportType;
  time: number;
  range: string;
}
