// ============================================================
// YYC³（YanYuCloudCube™ · 注册商标）
// 言启象限 | 语枢未来 · Words Initiate Quadrants, Language Serves as Core for Future
// 万象归元于云枢 | 深栈智启新纪元
// All things converge in cloud pivot; Deep stacks ignite a new era of intelligence
// ============================================================
// Copyright (c) 2026 YanYuCloudCube™（YYC³）| admin@0379.email
// ============================================================

/**
 * @file: collectors.mjs
 * @description: 节点真实指标采集器 — CPU / 内存 / 磁盘 / Ollama 推理服务
 * @author: YYC³ Team
 * @version: v1.0.0
 * @created: 2026-11-10
 * @status: active
 * @tags: [agent],[metrics],[collector]
 *
 * @brief: 面向 Apple Silicon macOS 的零依赖真实指标采集
 *
 * @details:
 * - CPU：os.cpus() 时间片差分（user+nice+sys / total），真实利用率
 * - 内存：vm_stat 分页统计（wired+active+compressed / 物理总量），
 *   比 os.freemem 更贴近 macOS 真实占用
 * - 磁盘：df -k / 实测已用/总量
 * - Ollama：/api/ps 运行中模型 + API RTT 实测延迟；服务未运行返回 online:false
 * - GPU/温度：macOS 需 sudo powermetrics，无免密授权时降级为 null（不造假）
 *
 * @exports: createCpuSampler, parseVmStat, readMemPercent, parseDf, readDiskUsage,
 *           sampleOllama, formatBytesTB
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";

const execFileAsync = promisify(execFile);

// ============================================================
// CPU — 时间片差分
// ============================================================

/**
 * 创建 CPU 采样器：首次调用建立基线返回 null，后续返回两次采样间的真实利用率
 * @returns {() => number | null}
 */
export function createCpuSampler() {
  let prev = null;
  return function sample() {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;
    for (const cpu of cpus) {
      idle += cpu.times.idle;
      total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    }
    if (prev === null) {
      prev = { idle, total };
      return null;
    }
    const idleDelta = idle - prev.idle;
    const totalDelta = total - prev.total;
    prev = { idle, total };
    if (totalDelta <= 0) { return null; }
    return Math.min(100, Math.max(0, Math.round((1 - idleDelta / totalDelta) * 100)));
  };
}

// ============================================================
// 内存 — vm_stat（macOS 真实分页统计）
// ============================================================

/**
 * 解析 vm_stat 输出，返回已用内存百分比
 * 口径：(active + wired + compressed) / 物理页总量
 * @param {string} text vm_stat 标准输出
 * @param {number} totalBytes 物理内存总量
 * @returns {number | null}
 */
export function parseVmStat(text, totalBytes) {
  const pageSizeMatch = /page size of (\d+) bytes/.exec(text);
  if (!pageSizeMatch) { return null; }
  const pageSize = Number(pageSizeMatch[1]);

  const pick = (name) => {
    const m = new RegExp(`${name}:\\s+(\\d+)\\.`).exec(text);
    return m ? Number(m[1]) : null;
  };

  const active = pick("Pages active");
  const wired = pick("Pages wired down");
  const compressed = pick("Pages occupied by compressor");
  if (active === null || wired === null || compressed === null) { return null; }

  const usedBytes = (active + wired + compressed) * pageSize;
  if (totalBytes <= 0) { return null; }
  return Math.min(100, Math.max(0, Math.round((usedBytes / totalBytes) * 100)));
}

/** 读取真实内存占用百分比（macOS vm_stat）；失败返回 null */
export async function readMemPercent() {
  try {
    const { stdout } = await execFileAsync("vm_stat", [], { timeout: 3000 });
    return parseVmStat(stdout, os.totalmem());
  } catch {
    return null;
  }
}

// ============================================================
// 磁盘 — df -k /
// ============================================================

/**
 * 解析 df -k 输出
 * @param {string} text
 * @returns {{ usedKB: number, totalKB: number, percent: number } | null}
 */
export function parseDf(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) { return null; }
  // macOS df 一行可能被换行截断（设备名过长），取最后一条含数字的行
  const dataLine = lines[lines.length - 1].trim().startsWith("/")
    ? lines[lines.length - 1]
    : lines.slice(1).join(" ");
  const parts = dataLine.trim().split(/\s+/);
  // Filesystem 1K-blocks Used Available ...（macOS 9 列）
  if (parts.length < 4) { return null; }
  const totalKB = Number(parts[1]);
  const usedKB = Number(parts[2]);
  const pctRaw = parts.find((p) => p.endsWith("%"));
  if (!Number.isFinite(totalKB) || !Number.isFinite(usedKB)) { return null; }
  const percent = pctRaw ? Number(pctRaw.replace("%", "")) : Math.round((usedKB / totalKB) * 100);
  return { usedKB, totalKB, percent };
}

/** 读取根分区磁盘用量；失败返回 null */
export async function readDiskUsage() {
  try {
    const { stdout } = await execFileAsync("df", ["-k", "/"], { timeout: 3000 });
    return parseDf(stdout);
  } catch {
    return null;
  }
}

/** 字节数格式化为 x.xTB / x.xGB */
export function formatBytesTB(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) { return "0GB"; }
  const tb = bytes / 1024 ** 4;
  if (tb >= 1) { return `${tb.toFixed(1)}TB`; }
  return `${(bytes / 1024 ** 3).toFixed(1)}GB`;
}

// ============================================================
// Ollama 推理服务 — /api/ps 实测
// ============================================================

/**
 * 采样 Ollama 服务状态
 * @param {string} baseUrl 如 http://127.0.0.1:11434
 * @param {number} timeoutMs
 * @returns {Promise<{online: boolean, latencyMs: number, models: Array<{name: string, processor: string, sizeVram: number}>, error?: string}>}
 */
export async function sampleOllama(baseUrl, timeoutMs = 2000) {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${baseUrl}/api/ps`, { signal: controller.signal });
    clearTimeout(timer);
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      return { online: false, latencyMs, models: [], error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    const models = Array.isArray(data.models)
      ? data.models.map((m) => ({
          name: String(m.name ?? m.model ?? "unknown"),
          processor: String(m.processor ?? ""),
          sizeVram: Number(m.size_vram ?? 0),
        }))
      : [];
    return { online: true, latencyMs, models };
  } catch (err) {
    return {
      online: false,
      latencyMs: Date.now() - started,
      models: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
