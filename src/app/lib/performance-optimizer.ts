/**
 * @file: performance-optimizer.ts
 * @description: performance-optimizer.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

export interface PerformanceMetrics {
  queryTime: number;
  syncTime: number;
  ipcTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

export interface QueryOptimization {
  useIndex: boolean;
  cacheResult: boolean;
  batchSize: number;
  timeout: number;
}

export interface SyncOptimization {
  incrementalSync: boolean;
  compressionEnabled: boolean;
  parallelSync: boolean;
  maxRetries: number;
}

export interface IPCOptimization {
  batchingEnabled: boolean;
  cacheEnabled: boolean;
  timeout: number;
  maxConcurrent: number;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics = {
    queryTime: 0,
    syncTime: 0,
    ipcTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
  };
  private queryCache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private ipcCache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private queryOptimization: QueryOptimization = {
    useIndex: true,
    cacheResult: true,
    batchSize: 100,
    timeout: 5000,
  };
  private syncOptimization: SyncOptimization = {
    incrementalSync: true,
    compressionEnabled: true,
    parallelSync: true,
    maxRetries: 3,
  };
  private ipcOptimization: IPCOptimization = {
    batchingEnabled: true,
    cacheEnabled: true,
    timeout: 3000,
    maxConcurrent: 10,
  };

  private constructor() {}

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * 优化数据库查询
   */
  public optimizeQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options?: Partial<QueryOptimization>
  ): Promise<T> {
    const opt = { ...this.queryOptimization, ...options };
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Query timeout after ${opt.timeout}ms`));
      }, opt.timeout);

      const executeQuery = async () => {
        try {
          if (opt.cacheResult) {
            const cached = this.queryCache.get(queryKey);
            if (cached && Date.now() - cached.timestamp < 60000) {
              this.metrics.cacheHitRate =
                (this.metrics.cacheHitRate * (this.queryCache.size - 1) + 1) / this.queryCache.size;
              clearTimeout(timeoutId);
              resolve(cached.data as T);
              return;
            }
          }

          const result = await queryFn();

          if (opt.cacheResult) {
            this.queryCache.set(queryKey, {
              data: result,
              timestamp: Date.now(),
            });
          }

          this.metrics.queryTime = Date.now() - startTime;
          clearTimeout(timeoutId);
          resolve(result);
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      };

      executeQuery();
    });
  }

  /**
   * 批量查询优化
   */
  public async batchQuery<T, R>(
    items: T[],
    queryFn: (item: T) => Promise<R>,
    options?: Partial<QueryOptimization>
  ): Promise<R[]> {
    const opt = { ...this.queryOptimization, ...options };
    const results: R[] = [];
    const startTime = Date.now();

    for (let i = 0; i < items.length; i += opt.batchSize) {
      const batch = items.slice(i, i + opt.batchSize);
      const batchResults = await Promise.all(batch.map(queryFn));
      results.push(...batchResults);
    }

    this.metrics.queryTime = Date.now() - startTime;
    return results;
  }

  /**
   * 优化存储同步
   */
  public async optimizeSync<T>(
    syncKey: string,
    localData: T[],
    remoteData: T[],
    compareFn: (local: T, remote: T) => boolean,
    options?: Partial<SyncOptimization>
  ): Promise<{ toUpload: T[]; toDownload: T[] }> {
    const opt = { ...this.syncOptimization, ...options };
    const startTime = Date.now();

    const toUpload: T[] = [];
    const toDownload: T[] = [];

    if (opt.incrementalSync) {
      const remoteMap = new Map(remoteData.map((item) => [JSON.stringify(item), item]));

      for (const localItem of localData) {
        const key = JSON.stringify(localItem);
        if (!remoteMap.has(key)) {
          toUpload.push(localItem);
        }
      }

      const localMap = new Map(localData.map((item) => [JSON.stringify(item), item]));

      for (const remoteItem of remoteData) {
        const key = JSON.stringify(remoteItem);
        if (!localMap.has(key)) {
          toDownload.push(remoteItem);
        }
      }
    } else {
      toUpload.push(...localData);
      toDownload.push(...remoteData);
    }

    this.metrics.syncTime = Date.now() - startTime;
    return { toUpload, toDownload };
  }

  /**
   * 优化 IPC 通信
   */
  public async optimizeIPC<T, D = unknown>(
    channel: string,
    data: D,
    ipcFn: () => Promise<T>,
    options?: Partial<IPCOptimization>
  ): Promise<T> {
    const opt = { ...this.ipcOptimization, ...options };
    const startTime = Date.now();

    if (opt.cacheEnabled) {
      const cacheKey = `${channel}:${JSON.stringify(data)}`;
      const cached = this.ipcCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 30000) {
        this.metrics.cacheHitRate =
          (this.metrics.cacheHitRate * (this.ipcCache.size - 1) + 1) / this.ipcCache.size;
        return cached.data as T;
      }

      const result = await ipcFn();
      this.ipcCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      this.metrics.ipcTime = Date.now() - startTime;
      return result;
    }

    const result = await ipcFn();
    this.metrics.ipcTime = Date.now() - startTime;
    return result;
  }

  /**
   * 批量 IPC 调用优化
   */
  public async batchIPC<T, D>(
    calls: Array<{ channel: string; data: D; fn: () => Promise<T> }>,
    options?: Partial<IPCOptimization>
  ): Promise<T[]> {
    const opt = { ...this.ipcOptimization, ...options };
    const results: T[] = [];

    if (opt.batchingEnabled) {
      for (let i = 0; i < calls.length; i += opt.maxConcurrent) {
        const batch = calls.slice(i, i + opt.maxConcurrent);
        const batchResults = await Promise.all(batch.map((call) => call.fn()));
        results.push(...batchResults);
      }
    } else {
      for (const call of calls) {
        results.push(await call.fn());
      }
    }

    return results;
  }

  /**
   * 获取性能指标
   */
  public getMetrics(): PerformanceMetrics {
    if (typeof process !== "undefined" && process.memoryUsage) {
      this.metrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    } else if (typeof performance !== "undefined" && (performance as unknown as Record<string, unknown>).memory) {
      this.metrics.memoryUsage = ((performance as unknown as Record<string, unknown>).memory as Record<string, number>).usedJSHeapSize / 1024 / 1024;
    }

    return { ...this.metrics };
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.queryCache.clear();
    this.ipcCache.clear();
    this.metrics.cacheHitRate = 0;
  }

  /**
   * 设置查询优化配置
   */
  public setQueryOptimization(config: Partial<QueryOptimization>): void {
    this.queryOptimization = { ...this.queryOptimization, ...config };
  }

  /**
   * 设置同步优化配置
   */
  public setSyncOptimization(config: Partial<SyncOptimization>): void {
    this.syncOptimization = { ...this.syncOptimization, ...config };
  }

  /**
   * 设置 IPC 优化配置
   */
  public setIPCOptimization(config: Partial<IPCOptimization>): void {
    this.ipcOptimization = { ...this.ipcOptimization, ...config };
  }

  /**
   * 获取优化配置
   */
  public getOptimizationConfig(): {
    query: QueryOptimization;
    sync: SyncOptimization;
    ipc: IPCOptimization;
  } {
    return {
      query: { ...this.queryOptimization },
      sync: { ...this.syncOptimization },
      ipc: { ...this.ipcOptimization },
    };
  }

  /**
   * 性能分析
   */
  public analyzePerformance(): {
    metrics: PerformanceMetrics;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    if (this.metrics.queryTime > 1000) {
      recommendations.push("查询时间过长，建议启用缓存或优化查询语句");
    }

    if (this.metrics.syncTime > 5000) {
      recommendations.push("同步时间过长，建议启用增量同步或压缩");
    }

    if (this.metrics.ipcTime > 500) {
      recommendations.push("IPC 通信时间过长，建议启用批处理或缓存");
    }

    if (this.metrics.cacheHitRate < 0.5 && this.queryCache.size > 10) {
      recommendations.push("缓存命中率低，建议调整缓存策略");
    }

    if (this.metrics.memoryUsage > 100) {
      recommendations.push("内存使用过高，建议清理缓存或优化数据结构");
    }

    return {
      metrics: this.getMetrics(),
      recommendations,
    };
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();
