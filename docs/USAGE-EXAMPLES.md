# YYC³ CloudPivot Intelli-Matrix - 使用示例

## 完整应用示例

本示例展示如何在实际项目中集成和使用所有新增的服务功能。

---

## 示例 1: 模型管理面板

完整的模型管理面板，包含查询、缓存、批量操作和实时更新。

```typescript
import { useState, useEffect } from 'react';
import { getActiveModels, addDbModel, updateDbModel } from '@/app/lib/db-queries';
import { queryCache, generateCacheKey } from '@/app/lib/query-cache';
import { batchOperations } from '@/app/lib/batch-operations';
import { realtimeSync } from '@/app/lib/realtime-sync';
import { RetryManager } from '@/app/lib/retry-manager';
import type { Model } from '@/app/types';

export function ModelManagementPanel() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载模型数据
  const loadModels = async () => {
    setLoading(true);
    setError(null);

    try {
      // 使用重试机制加载数据
      const result = await RetryManager.execute(
        async () => {
          const { data } = await getActiveModels();
          return data;
        },
        {
          maxAttempts: 3,
          baseDelay: 1000,
          onRetry: (attempt, error) => {
            console.warn(`加载模型失败，重试第 ${attempt} 次:`, error.message);
          },
        }
      );

      if (result.success) {
        setModels(result.data || []);
      } else {
        setError(result.error?.message || '加载失败');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 批量添加模型
  const handleBatchAdd = async () => {
    const newModels: Omit<Model, 'id'>[] = [
      {
        name: 'GPT-4-Turbo',
        provider: 'OpenAI',
        tier: 'primary',
        status: 'active',
        avg_latency_ms: 120,
        throughput: 100,
        created_at: new Date().toISOString(),
      },
      {
        name: 'Claude-3-Opus',
        provider: 'Anthropic',
        tier: 'secondary',
        status: 'active',
        avg_latency_ms: 150,
        throughput: 80,
        created_at: new Date().toISOString(),
      },
    ];

    const result = await batchOperations.batchInsert('models', newModels, {
      batchSize: 50,
      onProgress: ({ current, total }) => {
        console.log(`批量添加进度: ${current}/${total}`);
      },
    });

    if (result.success) {
      console.log(`成功添加 ${result.data.length} 个模型`);
      // 清除缓存，重新加载
      queryCache.delete(generateCacheKey('models', 'getActiveModels', { status: 'active' }));
      await loadModels();
    } else {
      console.error('批量添加失败:', result.errors);
    }
  };

  // 批量更新模型状态
  const handleBatchUpdate = async () => {
    const updates = models.map(model => ({
      id: model.id,
      changes: { status: 'maintenance' as const },
    }));

    const result = await batchOperations.batchUpdate('models', updates);

    if (result.success) {
      console.log(`成功更新 ${result.data.length} 个模型`);
      await loadModels();
    }
  };

  // 实时订阅模型变更
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const subscribeToChanges = async () => {
      subscription = await realtimeSync.subscribe<Model>(
        'models',
        (event) => {
          console.log('模型变更事件:', event.eventType);
          
          // 根据事件类型更新本地状态
          if (event.eventType === 'INSERT') {
            setModels(prev => [...prev, event.record]);
          } else if (event.eventType === 'UPDATE') {
            setModels(prev =>
              prev.map(m => (m.id === event.record.id ? event.record : m))
            );
          } else if (event.eventType === 'DELETE') {
            setModels(prev => prev.filter(m => m.id !== event.record.id));
          }
        },
        '*'
      );
    };

    subscribeToChanges();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // 初始加载
  useEffect(() => {
    loadModels();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div className="model-management-panel">
      <h2>模型管理</h2>
      
      <div className="actions">
        <button onClick={loadModels}>刷新</button>
        <button onClick={handleBatchAdd}>批量添加</button>
        <button onClick={handleBatchUpdate}>批量维护</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>提供商</th>
            <th>层级</th>
            <th>状态</th>
            <th>延迟</th>
          </tr>
        </thead>
        <tbody>
          {models.map(model => (
            <tr key={model.id}>
              <td>{model.name}</td>
              <td>{model.provider}</td>
              <td>{model.tier}</td>
              <td>{model.status}</td>
              <td>{model.avg_latency_ms}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 示例 2: 数据同步服务

完整的数据同步服务，包含错误恢复和缓存管理。

```typescript
import { queryCache, generateCacheKey } from '@/app/lib/query-cache';
import { RetryManager } from '@/app/lib/retry-manager';
import { ErrorRecovery, ErrorCategory, RecoveryStrategy } from '@/app/lib/error-recovery';
import { realtimeSync } from '@/app/lib/realtime-sync';

export class DataSyncService {
  private static instance: DataSyncService;
  private subscriptions: Map<string, () => void> = new Map();

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  // 配置错误恢复策略
  configureRecoveryStrategies() {
    ErrorRecovery.configureRecovery('network error', {
      category: ErrorCategory.NETWORK,
      strategy: RecoveryStrategy.RETRY,
      maxRetries: 5,
    });

    ErrorRecovery.configureRecovery('database error', {
      category: ErrorCategory.DATABASE,
      strategy: RecoveryStrategy.RETRY,
      maxRetries: 3,
    });

    ErrorRecovery.configureRecovery('authentication error', {
      category: ErrorCategory.AUTHENTICATION,
      strategy: RecoveryStrategy.ALERT,
      alertThreshold: 1,
    });
  }

  // 同步数据（带缓存和重试）
  async syncData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 60000
  ): Promise<T> {
    // 1. 检查缓存
    const cacheKey = generateCacheKey('sync', key, {});
    const cached = queryCache.get<T>(cacheKey);
    
    if (cached) {
      console.log(`[DataSync] 从缓存加载: ${key}`);
      return cached;
    }

    // 2. 使用重试机制获取数据
    const result = await RetryManager.executeWithFallback(
      fetcher,
      async () => {
        // 降级策略：返回空数据或从本地存储读取
        console.warn(`[DataSync] 主数据源失败，使用降级数据: ${key}`);
        return [] as T;
      },
      {
        maxAttempts: 3,
        baseDelay: 1000,
        onRetry: (attempt, error) => {
          console.warn(`[DataSync] 重试 ${attempt}/${3}: ${error.message}`);
        },
      }
    );

    if (result.success && result.data) {
      // 3. 更新缓存
      queryCache.set(cacheKey, result.data, ttl);
      return result.data;
    }

    throw result.error || new Error('同步失败');
  }

  // 订阅数据变更
  async subscribeToTable<T>(
    table: string,
    onChange: (data: T) => void
  ): Promise<() => void> {
    const subscription = await realtimeSync.subscribe<T>(
      table,
      (event) => {
        console.log(`[DataSync] 表 ${table} 变更:`, event.eventType);
        
        // 清除相关缓存
        const keys = queryCache.keys();
        const tableKeys = keys.filter(k => k.includes(table));
        tableKeys.forEach(k => queryCache.delete(k));
        
        // 触发回调
        onChange(event.record);
      },
      '*'
    );

    this.subscriptions.set(subscription.id, subscription.unsubscribe);
    
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(subscription.id);
    };
  }

  // 清理所有订阅
  cleanup() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }

  // 获取同步统计
  getStats() {
    const cacheStats = queryCache.getStats();
    const connectionStatus = realtimeSync.getConnectionStatus();

    return {
      cache: cacheStats,
      realtime: connectionStatus,
      subscriptions: this.subscriptions.size,
    };
  }
}

// 使用示例
export function useDataSync() {
  const syncService = DataSyncService.getInstance();

  const syncModels = async () => {
    return syncService.syncData(
      'models',
      async () => {
        const { data } = await getActiveModels();
        return data;
      },
      30000 // 30秒缓存
    );
  };

  const subscribeToModels = (onChange: (model: any) => void) => {
    return syncService.subscribeToTable('models', onChange);
  };

  return {
    syncModels,
    subscribeToModels,
    getStats: () => syncService.getStats(),
  };
}
```

---

## 示例 3: 批量导入工具

完整的批量导入工具，包含进度显示和错误处理。

```typescript
import { batchOperations, BatchResult } from '@/app/lib/batch-operations';
import { RetryManager } from '@/app/lib/retry-manager';
import type { Model, Agent, NodeStatusRecord } from '@/app/types';

interface ImportProgress {
  phase: 'validating' | 'importing' | 'completed' | 'error';
  current: number;
  total: number;
  errors: Array<{ row: number; message: string }>;
}

export class BatchImportTool {
  private onProgress?: (progress: ImportProgress) => void;

  constructor(options?: { onProgress?: (progress: ImportProgress) => void }) {
    this.onProgress = options?.onProgress;
  }

  // 导入模型数据
  async importModels(data: Partial<Model>[]): Promise<BatchResult<Model>> {
    // 1. 验证数据
    this.reportProgress('validating', 0, data.length);
    
    const validatedData: Omit<Model, 'id'>[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    data.forEach((item, index) => {
      try {
        this.validateModel(item);
        validatedData.push({
          name: item.name!,
          provider: item.provider!,
          tier: item.tier || 'secondary',
          status: item.status || 'active',
          avg_latency_ms: item.avg_latency_ms || 0,
          throughput: item.throughput || 0,
          created_at: new Date().toISOString(),
        });
      } catch (error) {
        errors.push({
          row: index + 1,
          message: (error as Error).message,
        });
      }
    });

    if (errors.length > 0) {
      this.reportProgress('error', 0, data.length, errors);
      return {
        success: false,
        data: [],
        errors: errors.map((e, i) => ({ index: e.row, error: new Error(e.message) })),
      };
    }

    // 2. 批量导入
    this.reportProgress('importing', 0, validatedData.length);

    const result = await batchOperations.batchInsert('models', validatedData, {
      batchSize: 100,
      onProgress: ({ current, total }) => {
        this.reportProgress('importing', current, total);
      },
    });

    // 3. 完成
    this.reportProgress('completed', validatedData.length, validatedData.length);

    return result;
  }

  // 导入 Agent 数据
  async importAgents(data: Partial<Agent>[]): Promise<BatchResult<Agent>> {
    this.reportProgress('validating', 0, data.length);

    const validatedData: Omit<Agent, 'id'>[] = data.map(item => ({
      name: item.name || 'Unknown Agent',
      name_cn: item.name_cn || item.name || '未知 Agent',
      role: item.role || 'assistant',
      description: item.description || '',
      is_active: item.is_active ?? true,
      created_at: new Date().toISOString(),
    }));

    this.reportProgress('importing', 0, validatedData.length);

    const result = await batchOperations.batchInsert('agents', validatedData, {
      batchSize: 100,
      onProgress: ({ current, total }) => {
        this.reportProgress('importing', current, total);
      },
    });

    this.reportProgress('completed', validatedData.length, validatedData.length);

    return result;
  }

  // 导入节点数据
  async importNodes(data: Partial<NodeStatusRecord>[]): Promise<BatchResult<NodeStatusRecord>> {
    this.reportProgress('validating', 0, data.length);

    const validatedData: Omit<NodeStatusRecord, 'id'>[] = data.map(item => ({
      hostname: item.hostname || 'unknown-node',
      status: item.status || 'inactive',
      gpu_util: item.gpu_util || 0,
      mem_util: item.mem_util || 0,
      temp_celsius: item.temp_celsius || 0,
      model_deployed: item.model_deployed || '',
      active_tasks: item.active_tasks || 0,
      created_at: new Date().toISOString(),
    }));

    this.reportProgress('importing', 0, validatedData.length);

    const result = await batchOperations.batchInsert('nodes', validatedData, {
      batchSize: 50,
      onProgress: ({ current, total }) => {
        this.reportProgress('importing', current, total);
      },
    });

    this.reportProgress('completed', validatedData.length, validatedData.length);

    return result;
  }

  // 验证模型数据
  private validateModel(data: Partial<Model>) {
    if (!data.name) throw new Error('模型名称不能为空');
    if (!data.provider) throw new Error('提供商不能为空');
    if (data.avg_latency_ms && data.avg_latency_ms < 0) {
      throw new Error('延迟不能为负数');
    }
  }

  // 报告进度
  private reportProgress(
    phase: ImportProgress['phase'],
    current: number,
    total: number,
    errors: Array<{ row: number; message: string }> = []
  ) {
    if (this.onProgress) {
      this.onProgress({ phase, current, total, errors });
    }
  }
}

// React Hook 示例
export function useBatchImport() {
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const importTool = useMemo(
    () =>
      new BatchImportTool({
        onProgress: setProgress,
      }),
    []
  );

  const importModels = async (data: Partial<Model>[]) => {
    return importTool.importModels(data);
  };

  const importAgents = async (data: Partial<Agent>[]) => {
    return importTool.importAgents(data);
  };

  const importNodes = async (data: Partial<NodeStatusRecord>[]) => {
    return importTool.importNodes(data);
  };

  return {
    importModels,
    importAgents,
    importNodes,
    progress,
  };
}
```

---

## 示例 4: 错误监控面板

完整的错误监控面板，展示错误恢复历史和统计。

```typescript
import { useState, useEffect } from 'react';
import { ErrorRecovery, ErrorCategory, RecoveryStrategy } from '@/app/lib/error-recovery';

export function ErrorMonitoringPanel() {
  const [history, setHistory] = useState<any[]>([]);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // 配置错误恢复策略
    ErrorRecovery.configureRecovery('network', {
      category: ErrorCategory.NETWORK,
      strategy: RecoveryStrategy.RETRY,
      maxRetries: 3,
    });

    // 定期获取错误历史
    const interval = setInterval(() => {
      const history = ErrorRecovery.getRecoveryHistory(50);
      const counts = ErrorRecovery.getErrorCounts();
      
      setHistory(history);
      setCounts(counts);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category: ErrorCategory) => {
    const colors = {
      [ErrorCategory.NETWORK]: 'text-blue-500',
      [ErrorCategory.DATABASE]: 'text-red-500',
      [ErrorCategory.AUTHENTICATION]: 'text-yellow-500',
      [ErrorCategory.VALIDATION]: 'text-purple-500',
      [ErrorCategory.RUNTIME]: 'text-orange-500',
      [ErrorCategory.UNKNOWN]: 'text-gray-500',
    };
    return colors[category] || 'text-gray-500';
  };

  const getStrategyIcon = (strategy: RecoveryStrategy) => {
    const icons = {
      [RecoveryStrategy.RETRY]: '🔄',
      [RecoveryStrategy.FALLBACK]: '⬇️',
      [RecoveryStrategy.IGNORE]: '⏭️',
      [RecoveryStrategy.LOG_ONLY]: '📝',
      [RecoveryStrategy.ALERT]: '⚠️',
    };
    return icons[strategy] || '❓';
  };

  return (
    <div className="error-monitoring-panel">
      <h2>错误监控</h2>

      {/* 错误统计 */}
      <div className="error-stats">
        <h3>错误统计</h3>
        <div className="stats-grid">
          {Array.from(counts.entries()).map(([error, count]) => (
            <div key={error} className="stat-item">
              <span className="error-message">{error}</span>
              <span className="error-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 错误历史 */}
      <div className="error-history">
        <h3>恢复历史</h3>
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>分类</th>
              <th>策略</th>
              <th>错误</th>
              <th>状态</th>
              <th>尝试次数</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={record.id || index}>
                <td>{new Date(record.timestamp).toLocaleString()}</td>
                <td className={getCategoryColor(record.category)}>
                  {record.category}
                </td>
                <td>
                  {getStrategyIcon(record.strategy)} {record.strategy}
                </td>
                <td>{record.error?.message}</td>
                <td>
                  {record.success ? (
                    <span className="text-green-500">✓ 成功</span>
                  ) : (
                    <span className="text-red-500">✗ 失败</span>
                  )}
                </td>
                <td>{record.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 示例 5: 性能监控仪表板

完整的性能监控仪表板，展示缓存命中率和查询性能。

```typescript
import { useState, useEffect } from 'react';
import { queryCache } from '@/app/lib/query-cache';
import { queryMonitor } from '@/app/lib/query-monitor';
import { realtimeSync } from '@/app/lib/realtime-sync';

export function PerformanceDashboard() {
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
  });
  const [queryStats, setQueryStats] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // 获取缓存统计
      const stats = queryCache.getStats();
      setCacheStats(stats);

      // 获取查询统计
      const queries = queryMonitor.getMetrics();
      setQueryStats(queries.slice(-20)); // 最近 20 条

      // 获取连接状态
      const status = realtimeSync.getConnectionStatus();
      setConnectionStatus(status);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const hitRate = cacheStats.hits + cacheStats.misses > 0
    ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="performance-dashboard">
      <h2>性能监控</h2>

      {/* 缓存统计 */}
      <div className="cache-stats">
        <h3>缓存统计</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{hitRate}%</div>
            <div className="stat-label">命中率</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{cacheStats.hits}</div>
            <div className="stat-label">命中次数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{cacheStats.misses}</div>
            <div className="stat-label">未命中次数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{cacheStats.size}</div>
            <div className="stat-label">缓存大小</div>
          </div>
        </div>
      </div>

      {/* 连接状态 */}
      <div className="connection-status">
        <h3>连接状态</h3>
        <div className={`status-indicator ${connectionStatus.connected ? 'connected' : 'disconnected'}`}>
          {connectionStatus.connected ? '🟢 已连接' : '🔴 未连接'}
        </div>
      </div>

      {/* 查询性能 */}
      <div className="query-performance">
        <h3>查询性能</h3>
        <table>
          <thead>
            <tr>
              <th>查询</th>
              <th>表</th>
              <th>耗时</th>
              <th>状态</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {queryStats.map((query, index) => (
              <tr key={index}>
                <td>{query.query}</td>
                <td>{query.table}</td>
                <td>{query.duration}ms</td>
                <td>{query.cacheHit ? '缓存命中' : '数据库查询'}</td>
                <td>{new Date(query.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 操作按钮 */}
      <div className="actions">
        <button onClick={() => queryCache.clear()}>
          清空缓存
        </button>
        <button onClick={() => queryCache.resetStats()}>
          重置统计
        </button>
        <button onClick={() => queryMonitor.clearMetrics()}>
          清空查询记录
        </button>
      </div>
    </div>
  );
}
```

---

## 总结

以上示例展示了如何在实际项目中集成和使用所有新增的服务功能：

1. **查询缓存**: 提升查询性能，减少数据库负载
2. **批量操作**: 高效处理大量数据操作
3. **重试机制**: 增强系统可靠性，自动处理临时故障
4. **错误恢复**: 智能错误处理，自动选择恢复策略
5. **实时同步**: 实时数据更新，保持数据一致性

这些功能协同工作，为 YYC³ CloudPivot Intelli-Matrix 提供了强大的数据管理能力。