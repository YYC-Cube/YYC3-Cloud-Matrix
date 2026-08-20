/**
 * @file: filesystem-types.ts
 * @description: 本地文件系统 + 日志 + 报告 + 最近文件类型
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[filesystem],[log]
 */

/** 文件类型 */
export type FileItemType = "file" | "directory";

/** 文件条目 */
export interface FileItem {
  id: string;
  name: string;
  type: FileItemType;
  size?: number;
  modifiedAt: number;
  path: string;
  extension?: string;
  children?: FileItem[];
}

/** 日志级别 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/** 日志条目 */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;
  message: string;
  detail?: string;
}

/** 报告类型 */
export type ReportType = "performance" | "health" | "security" | "custom";

/** 报告格式 */
export type ReportFormat = "json" | "markdown" | "csv";

/** 报告配置 */
export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  dateRange: "today" | "week" | "month" | "custom";
  includeCharts: boolean;
  includeRawData: boolean;
}

/** 报告结果 */
export interface ReportResult {
  id: string;
  config: ReportConfig;
  generatedAt: number;
  filename: string;
  size: number;
  previewContent: string;
}

/** 最近访问文件 */
export interface RecentFile {
  id: string;
  name: string;
  path: string;
  size?: number;
  accessedAt: number;
}
