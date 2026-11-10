/**
 * @file: collectors.test.ts
 * @description: 节点采集器单测 — vm_stat/df 解析（fixture）/ CPU 采样器 / 字节格式化
 */

import { describe, it, expect } from "vitest";
import {
  parseVmStat,
  parseDf,
  createCpuSampler,
  formatBytesTB,
} from "../../../../agent/lib/collectors.mjs";

// macOS vm_stat 真实输出 fixture（page size 16384）
const VM_STAT_FIXTURE = `Mach Virtual Memory Statistics: (page size of 16384 bytes)
Pages free:                               642258.
Pages active:                            3347377.
Pages inactive:                          1200000.
Pages speculative:                        300000.
Pages wired down:                        1000000.
Pages occupied by compressor:             500000.
File-backed pages:                       2000000.
Anonymous pages:                         2547377.
`;

describe("parseVmStat", () => {
  it("按 (active+wired+compressed)/物理总量 计算百分比", () => {
    // (3347377 + 1000000 + 500000) * 16384 = 4847377 * 16384 ≈ 73.9GiB
    // 物理 128GiB → 4847377*16384 / (128*1024^3) ≈ 57.8% → 58
    const totalBytes = 128 * 1024 ** 3;
    const pct = parseVmStat(VM_STAT_FIXTURE, totalBytes);
    expect(pct).toBe(58);
  });

  it("缺少关键字段返回 null（不造假）", () => {
    expect(parseVmStat("garbage text", 1024 ** 3)).toBeNull();
  });

  it("物理总量为 0 返回 null", () => {
    expect(parseVmStat(VM_STAT_FIXTURE, 0)).toBeNull();
  });
});

const DF_FIXTURE = `Filesystem   1K-blocks       Used  Available Capacity iused ifree %iused  Mounted on
/dev/disk3s1 1948455240  13337832 950000000       3%  350000 10000  97%   /
`;

describe("parseDf", () => {
  it("解析 macOS df -k 标准输出", () => {
    const r = parseDf(DF_FIXTURE);
    expect(r).not.toBeNull();
    expect(r!.totalKB).toBe(1948455240);
    expect(r!.usedKB).toBe(13337832);
    expect(r!.percent).toBe(3);
  });

  it("单行/乱文本返回 null", () => {
    expect(parseDf("Filesystem only")).toBeNull();
    expect(parseDf("")).toBeNull();
  });
});

describe("createCpuSampler", () => {
  it("首次采样建立基线返回 null", () => {
    const sample = createCpuSampler();
    expect(sample()).toBeNull();
  });

  it("间隔后采样返回 0-100 的整数利用率", async () => {
    const sample = createCpuSampler();
    sample();
    // CPU 时间片按时钟滴答累积，间隔过短 totalDelta 可能为 0（实现返回 null）
    await new Promise((r) => setTimeout(r, 1100));
    const v = sample();
    expect(v).not.toBeNull();
    expect(Number.isInteger(v)).toBe(true);
    expect(v!).toBeGreaterThanOrEqual(0);
    expect(v!).toBeLessThanOrEqual(100);
  });
});

describe("formatBytesTB", () => {
  it("≥1TB 显示 TB", () => {
    expect(formatBytesTB(5.2 * 1024 ** 4)).toBe("5.2TB");
    expect(formatBytesTB(1024 ** 4)).toBe("1.0TB");
  });

  it("<1TB 显示 GB", () => {
    expect(formatBytesTB(380 * 1024 ** 3)).toBe("380.0GB");
    expect(formatBytesTB(0)).toBe("0.0GB");
  });

  it("非法输入降级 0GB", () => {
    expect(formatBytesTB(NaN)).toBe("0GB");
    expect(formatBytesTB(-1)).toBe("0GB");
  });
});
