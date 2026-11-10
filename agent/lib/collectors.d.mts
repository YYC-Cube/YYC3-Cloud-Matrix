/**
 * @file: collectors.d.mts
 * @description: collectors.mjs 的类型声明（与实现同目录，供 TS 模块解析自动匹配）
 */

export function createCpuSampler(): () => number | null;

export function parseVmStat(text: string, totalBytes: number): number | null;
export function readMemPercent(): Promise<number | null>;

export interface DiskUsage {
  usedKB: number;
  totalKB: number;
  percent: number;
}
export function parseDf(text: string): DiskUsage | null;
export function readDiskUsage(): Promise<DiskUsage | null>;

export function formatBytesTB(bytes: number): string;

export interface OllamaSample {
  online: boolean;
  latencyMs: number;
  models: Array<{ name: string; processor: string; sizeVram: number }>;
  error?: string;
}
export function sampleOllama(baseUrl: string, timeoutMs?: number): Promise<OllamaSample>;
