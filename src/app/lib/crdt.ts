/**
 * @file: crdt.ts
 * @description: YYC³ CRDT 工具集 · 跨标签页无冲突状态合并
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[crdt],[sync]
 *
 * @brief: 轻量级 CRDT 原语，用于 Agent 状态跨标签页合并
 *
 * @details:
 * - LWWRegister<T>: Last-Writer-Wins Register (基于时间戳)
 * - GCounter: Grow-only Counter (多标签页计数)
 * - mergeState: 通用状态合并
 */

// ============================================================
// LWW Register (Last-Writer-Wins)
// ============================================================

export interface LWWRegisterEntry<T> {
  value: T;
  timestamp: number;
  nodeId: string;  // 来源标签页/节点 ID
}

export class LWWRegister<T> {
  private entry: LWWRegisterEntry<T>;

  constructor(initialValue: T, nodeId = "local") {
    this.entry = {
      value: initialValue,
      timestamp: Date.now(),
      nodeId,
    };
  }

  get value(): T {
    return this.entry.value;
  }

  get timestamp(): number {
    return this.entry.timestamp;
  }

  /** 设置新值 */
  set(value: T, nodeId?: string): void {
    this.entry = {
      value,
      timestamp: Date.now(),
      nodeId: nodeId ?? this.entry.nodeId,
    };
  }

  /** 合并远端值 (LWW: 时间戳大的赢) */
  merge(remote: LWWRegisterEntry<T>): boolean {
    if (remote.timestamp > this.entry.timestamp) {
      this.entry = remote;
      return true; // 远端胜出
    }
    return false; // 本地胜出
  }

  /** 导出 (用于跨标签页传输) */
  export(): LWWRegisterEntry<T> {
    return { ...this.entry };
  }

  /** 从导出数据恢复 */
  static import<T>(data: LWWRegisterEntry<T>): LWWRegister<T> {
    const reg = new LWWRegister(data.value, data.nodeId);
    reg.entry = { ...data };
    return reg;
  }
}

// ============================================================
// G-Counter (Grow-only Counter)
// ============================================================

export class GCounter {
  private counts: Map<string, number> = new Map();
  readonly nodeId: string;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.counts.set(nodeId, 0);
  }

  /** 本地递增 */
  increment(amount = 1): void {
    const current = this.counts.get(this.nodeId) ?? 0;
    this.counts.set(this.nodeId, current + amount);
  }

  /** 获取全局总数 */
  get value(): number {
    let total = 0;
    for (const count of this.counts.values()) {
      total += count;
    }
    return total;
  }

  /** 合并远端计数 */
  merge(remoteCounts: Map<string, number>): void {
    for (const [node, count] of remoteCounts) {
      const local = this.counts.get(node) ?? 0;
      this.counts.set(node, Math.max(local, count));
    }
  }

  /** 导出 */
  export(): Map<string, number> {
    return new Map(this.counts);
  }
}

// ============================================================
// 通用状态合并
// ============================================================

export type MergeStrategy = "lww" | "merge-deep" | "prefer-local";

/** 通用状态合并 */
export function mergeState<T extends Record<string, unknown>>(
  local: T,
  remote: T,
  strategy: MergeStrategy = "lww",
  localTimestamp?: number,
  remoteTimestamp?: number,
): T {
  switch (strategy) {
    case "lww": {
      // Last-Writer-Wins: 时间戳大的赢
      if (remoteTimestamp && localTimestamp && remoteTimestamp > localTimestamp) {
        return remote;
      }
      return local;
    }

    case "merge-deep": {
      // 深度合并: 远端覆盖本地同 key
      return { ...local, ...remote };
    }

    case "prefer-local": {
      // 本地优先: 仅补充本地没有的 key
      return { ...remote, ...local };
    }

    default:
      return local;
  }
}
