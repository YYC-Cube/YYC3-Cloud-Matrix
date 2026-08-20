# YYC³ CloudPivot Intelli-Matrix - API 文档

## 核心服务 API

### 1. 数据库查询服务 (db-queries)

#### `getActiveModels()`
获取所有活跃模型列表。

**返回值:**
```typescript
Promise<{ data: Model[]; error: null }>
```

**示例:**
```typescript
import { getActiveModels } from '@/app/lib/db-queries';

const { data: models } = await getActiveModels();
console.log(models); // [{ id: 'model-1', name: 'GPT-4', ... }]
```

#### `getActiveAgents()`
获取所有活跃 Agent 列表。

**返回值:**
```typescript
Promise<{ data: Agent[]; error: null }>
```

**示例:**
```typescript
import { getActiveAgents } from '@/app/lib/db-queries';

const { data: agents } = await getActiveAgents();
console.log(agents); // [{ id: 'agent-1', name: 'Agent-1', ... }]
```

#### `getNodesStatus()`
获取所有节点状态。

**返回值:**
```typescript
Promise<{ data: NodeStatusRecord[]; error: null }>
```

---

### 2. 查询缓存服务 (query-cache)

#### `QueryCache.get<T>(key: string)`
从缓存中获取数据。

**参数:**
- `key`: 缓存键

**返回值:**
```typescript
T | null
```

**示例:**
```typescript
import { queryCache } from '@/app/lib/query-cache';

const cachedData = queryCache.get<Model[]>('models:getActiveModels');
```

#### `QueryCache.set<T>(key: string, data: T, ttl?: number)`
设置缓存数据。

**参数:**
- `key`: 缓存键
- `data`: 缓存数据
- `ttl`: 过期时间（毫秒），默认 60000ms

**示例:**
```typescript
import { queryCache } from '@/app/lib/query-cache';

queryCache.set('models:getActiveModels', models, 30000);
```

#### `generateCacheKey(table: string, operation: string, params: Record<string, unknown>)`
生成缓存键。

**示例:**
```typescript
import { generateCacheKey } from '@/app/lib/query-cache';

const key = generateCacheKey('models', 'getActiveModels', { status: 'active' });
// 'models:getActiveModels:status:"active"'
```

---

### 3. 批量操作服务 (batch-operations)

#### `BatchOperations.batchInsert<T>(table: string, items: T[], options?: BatchInsertOptions)`
批量插入数据。

**参数:**
- `table`: 表名
- `items`: 数据数组
- `options`: 配置选项
  - `batchSize`: 批次大小，默认 100
  - `onProgress`: 进度回调

**返回值:**
```typescript
Promise<BatchResult<T>>
```

**示例:**
```typescript
import { batchOperations } from '@/app/lib/batch-operations';

const items = [
  { name: 'Item 1', value: 100 },
  { name: 'Item 2', value: 200 },
];

const result = await batchOperations.batchInsert('test_table', items, {
  batchSize: 50,
  onProgress: ({ current, total }) => {
    console.log(`Progress: ${current}/${total}`);
  },
});

console.log(result.success); // true
console.log(result.data); // [插入的数据]
```

#### `BatchOperations.batchUpdate<T>(table: string, updates: Array<{ id: string; changes: Partial<T> }>)`
批量更新数据。

**示例:**
```typescript
import { batchOperations } from '@/app/lib/batch-operations';

const updates = [
  { id: '1', changes: { name: 'Updated 1' } },
  { id: '2', changes: { name: 'Updated 2' } },
];

const result = await batchOperations.batchUpdate('test_table', updates);
```

#### `BatchOperations.batchDelete(table: string, ids: string[])`
批量删除数据。

**示例:**
```typescript
import { batchOperations } from '@/app/lib/batch-operations';

const result = await batchOperations.batchDelete('test_table', ['1', '2', '3']);
console.log(result.deleted); // 3
```

---

### 4. 重试管理器 (retry-manager)

#### `RetryManager.execute<T>(fn: () => Promise<T>, options?: RetryOptions)`
执行带重试的异步操作。

**参数:**
- `fn`: 要执行的异步函数
- `options`: 重试选项
  - `maxAttempts`: 最大尝试次数，默认 3
  - `baseDelay`: 基础延迟（毫秒），默认 1000
  - `maxDelay`: 最大延迟（毫秒），默认 30000
  - `backoffFactor`: 退避因子，默认 2
  - `onRetry`: 重试回调

**返回值:**
```typescript
Promise<RetryResult<T>>
```

**示例:**
```typescript
import { RetryManager } from '@/app/lib/retry-manager';

const result = await RetryManager.execute(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Network error');
    return response.json();
  },
  {
    maxAttempts: 3,
    baseDelay: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`);
    },
  }
);

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

#### `RetryManager.executeWithFallback<T>(primaryFn: () => Promise<T>, fallbackFn: () => Promise<T>, options?: RetryOptions)`
执行带降级的异步操作。

**示例:**
```typescript
import { RetryManager } from '@/app/lib/retry-manager';

const result = await RetryManager.executeWithFallback(
  async () => {
    // 主函数：从远程服务器获取数据
    return await fetchFromRemoteServer();
  },
  async () => {
    // 降级函数：从本地缓存获取数据
    return await getFromLocalCache();
  }
);
```

---

### 5. 错误恢复服务 (error-recovery)

#### `ErrorRecovery.recover(error: Error, action: () => Promise<unknown>)`
执行错误恢复。

**参数:**
- `error`: 错误对象
- `action`: 恢复操作

**返回值:**
```typescript
Promise<{ success: boolean; result?: unknown; record: RecoveryRecord }>
```

**示例:**
```typescript
import { ErrorRecovery } from '@/app/lib/error-recovery';

try {
  await riskyOperation();
} catch (error) {
  const result = await ErrorRecovery.recover(error, async () => {
    // 恢复操作
    return await fallbackOperation();
  });
  
  if (result.success) {
    console.log('Recovery successful');
  }
}
```

#### `ErrorRecovery.configureRecovery(errorPattern: string, config: ErrorRecoveryConfig)`
配置错误恢复策略。

**示例:**
```typescript
import { ErrorRecovery, ErrorCategory, RecoveryStrategy } from '@/app/lib/error-recovery';

ErrorRecovery.configureRecovery('network error', {
  category: ErrorCategory.NETWORK,
  strategy: RecoveryStrategy.RETRY,
  maxRetries: 5,
});
```

---

### 6. 实时同步服务 (realtime-sync)

#### `RealtimeSync.subscribe<T>(table: string, callback: RealtimeSubscriptionCallback<T>, eventType?: RealtimeEventType)`
订阅数据表变更。

**参数:**
- `table`: 表名
- `callback`: 变更回调函数
- `eventType`: 事件类型，默认 '*'

**返回值:**
```typescript
Promise<RealtimeSubscription>
```

**示例:**
```typescript
import { realtimeSync } from '@/app/lib/realtime-sync';

// 订阅模型表变更
const subscription = await realtimeSync.subscribe<Model>(
  'models',
  (event) => {
    console.log('Event type:', event.eventType);
    console.log('New record:', event.record);
    console.log('Old record:', event.oldRecord);
  },
  'UPDATE'
);

// 取消订阅
subscription.unsubscribe();
```

#### `RealtimeSync.unsubscribe(subscriptionId: string)`
取消指定订阅。

**示例:**
```typescript
import { realtimeSync } from '@/app/lib/realtime-sync';

realtimeSync.unsubscribe('subscription-id');
```

#### `RealtimeSync.unsubscribeAll()`
取消所有订阅。

**示例:**
```typescript
import { realtimeSync } from '@/app/lib/realtime-sync';

realtimeSync.unsubscribeAll();
```

---

## 类型定义

### Model
```typescript
interface Model {
  id: string;
  name: string;
  provider: string;
  tier: 'primary' | 'secondary' | 'standby';
  status: 'active' | 'inactive' | 'maintenance';
  avg_latency_ms: number;
  throughput: number;
  created_at: string;
}
```

### Agent
```typescript
interface Agent {
  id: string;
  name: string;
  name_cn: string;
  role: string;
  description: string;
  is_active: boolean;
  created_at: string;
}
```

### NodeStatusRecord
```typescript
interface NodeStatusRecord {
  id: string;
  hostname: string;
  status: 'active' | 'warning' | 'inactive';
  gpu_util: number;
  mem_util: number;
  temp_celsius: number;
  model_deployed: string;
  active_tasks: number;
  created_at: string;
}
```

### BatchResult
```typescript
interface BatchResult<T> {
  success: boolean;
  data: T[];
  errors: Array<{ index: number; error: Error }>;
}
```

### RetryResult
```typescript
interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}
```

### RealtimeEvent
```typescript
interface RealtimeEvent<T = unknown> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  table: string;
  oldRecord: T | null;
  record: T;
  timestamp: number;
}
```

---

## 错误处理

所有 API 都遵循统一的错误处理模式：

1. **网络错误**: 自动重试（最多 3 次）
2. **验证错误**: 直接返回错误，不重试
3. **认证错误**: 触发告警
4. **数据库错误**: 自动重试（最多 2 次）

---

## 最佳实践

### 1. 使用缓存
```typescript
// ✅ 推荐：使用缓存
const { data: models } = await getActiveModels();

// ❌ 不推荐：频繁查询
for (let i = 0; i < 100; i++) {
  await getActiveModels(); // 每次都会查询数据库
}
```

### 2. 批量操作
```typescript
// ✅ 推荐：批量插入
await batchOperations.batchInsert('table', items);

// ❌ 不推荐：逐条插入
for (const item of items) {
  await insertItem(item);
}
```

### 3. 错误恢复
```typescript
// ✅ 推荐：使用错误恢复
try {
  await riskyOperation();
} catch (error) {
  await ErrorRecovery.recover(error, fallbackOperation);
}

// ❌ 不推荐：忽略错误
try {
  await riskyOperation();
} catch (error) {
  console.error(error);
}
```

### 4. 实时订阅
```typescript
// ✅ 推荐：及时取消订阅
useEffect(() => {
  const subscription = await realtimeSync.subscribe('table', callback);
  return () => subscription.unsubscribe();
}, []);

// ❌ 不推荐：忘记取消订阅
useEffect(() => {
  realtimeSync.subscribe('table', callback);
  // 没有 cleanup 函数
}, []);
```

---

## 性能优化建议

1. **缓存策略**: 为频繁查询的数据设置合理的 TTL
2. **批量大小**: 根据数据大小调整批量操作批次大小
3. **重试策略**: 根据业务需求调整重试次数和延迟
4. **订阅管理**: 及时取消不需要的订阅，避免内存泄漏

---

## 相关文档

- [测试指南](./TESTING-GUIDE.ts)
- [组件参考](./COMPONENT-REFERENCE.ts)
- [项目规则](../../.trae/rules/project_rules.md)
- [实施计划](./follow-up-implementation-plan.md)