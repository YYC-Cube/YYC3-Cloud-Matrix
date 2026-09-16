### 原生 Supabase 客户端 (native-supabase-client.ts)
- 使用原生 fetch API 实现 Supabase REST API 调用
- 实现完整的认证管理（登录、登出、会话管理、Token 刷新）
- 实现数据库 CRUD 操作（链式查询 API）
- 实现 WebSocket 实时订阅
- 实现文件存储操作
- 自动重试机制
### 2. 混合存储管理器 (hybrid-storage-manager.ts)
- LocalStorageStore ：本地快速存储层，支持内存缓存
- SupabaseStore ：远程持久化层
- HybridStorageManager ：统一存储接口
  - 优先读取本地数据（快速响应）
  - 后台同步到远程（异步）
  - 冲突解决（远程优先）
  - 自动同步（可配置间隔）
  - 实时订阅支持
### 3. 高级数据库操作 (advanced-db-operations.ts)
- 批量操作 ：批量插入、批量更新、批量删除
- 事务支持 ：原子操作，全部成功或全部失败
- 复杂查询 ：联表查询、聚合查询、分组查询
- 数据缓存 ：智能缓存策略，减少网络请求
- 查询优化 ：查询验证和优化建议
### 4. 更新数据库查询层 (db-queries.ts)
- 所有 CRUD 函数改为异步
- 优先使用 HybridStorageManager
- Supabase 不可用时自动降级到 localStorage
- 保持原有 API 签名兼容性
### 5. 更新 Supabase 客户端包装 (supabaseClient.ts)
- 集成原生 Supabase 客户端
- 保持 Mock 模式兼容性
- 添加 initSupabaseClient() 函数
### 6. 应用初始化 (App.tsx)
- 在应用启动时初始化 Supabase 客户端
- 确保环境变量正确配置
## 配置方式
在 .env.development 或 .env.production 中添加：
# Supabase 配置（可选）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
## 架构特点
### 🚀 性能优化
- 本地数据优先读取，减少网络延迟
- 内存缓存，避免频繁 JSON 解析
- 批量操作支持，减少请求次数
### 🔄 数据同步
- 自动后台同步（默认 30 秒间隔）
- 写入时立即同步（可配置）
- 基于时间戳的冲突解决
### 🛡️ 可靠性
- Supabase 不可用时自动降级到 localStorage
- 自动重试机制（最多 3 次）
- 完整的错误处理
### 🔌 扩展性
- 统一的存储接口，易于扩展
- 支持多种存储后端
- 插件化的查询优化器

### 使用示例
以下是一个简单的示例：

// 初始化（在 App.tsx 中自动完成）
import { initSupabaseClient } from "./lib/supabaseClient";
initSupabaseClient();

// 使用混合存储
import { getHybridStorage } from "./lib/hybrid-storage-manager";

const storage = getHybridStorage();
const models = await storage.get<Model>("models");

// 使用高级操作
import { batchInsert, executeTransaction } from "./lib/advanced-db-operations";

await batchInsert("models", models, { batchSize: 100 });

await executeTransaction([
  { type: "insert", table: "models", data: newModel },
  { type: "update", table: "agents", filter: { id: "a1" }, data: { is_active: true } },
]);

┌─────────────────────────────────────────────────────────────┐
│              应用层 (React Components)                     │
│  - Dashboard, DataEditorPanel, DatabaseManager 等         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           混合存储管理层 (HybridStorageManager)          │
│  - 统一存储接口                                          │
│  - 本地优先读取策略                                      │
│  - 后台自动同步                                          │
│  - 冲突解决机制                                          │
└────────┬────────────────────────────┬──────────────────────┘
         ↓                            ↓
┌──────────────────────┐    ┌──────────────────────┐
│   LocalStorageStore   │    │   SupabaseStore     │
│  (本地快速存储)      │    │  (远程持久化)      │
│  - 内存缓存          │    │  - 原生 Supabase   │
│  - IndexedDB         │    │  - REST API         │
│  - localStorage      │    │  - WebSocket       │
└──────────────────────┘    └──────────────────────┘

### 🎯 核心组件说明 1. HybridStorageManager (混合存储管理器)
文件位置 : src/app/lib/hybrid-storage-manager.ts

核心功能 :

- ✅ 统一的存储接口（get, add, update, delete, query）
- ✅ 本地优先读取（快速响应）
- ✅ 后台自动同步到远程
- ✅ 冲突解决（远程优先）
- ✅ 实时订阅支持
使用示例 :

import { getHybridStorage } from './lib/hybrid-storage-manager';

const storage = getHybridStorage();

// 读取数据（优先从本地）
const models = await storage.get<Model>('models');

// 添加数据（立即写入本地，后台同步）
await storage.add('models', newModel);

// 订阅实时更新
storage.subscribe('models', (data) => {
  console.log('数据已更新:', data);
});

2. LocalStorageStore (本地存储)
文件位置 : src/app/lib/hybrid-storage-manager.ts

存储策略 :

- 内存缓存 : 最快访问速度
- IndexedDB : 大容量数据存储
- localStorage : 配置和小数据
数据流程 :

读取请求 → 检查内存缓存 → 命中返回
                 ↓ 未命中
              检查 IndexedDB → 命中返回并缓存
                 ↓ 未命中
              检查 localStorage → 命中返回并缓存
                 ↓ 未命中
              返回空数组

3. SupabaseStore (远程存储)
文件位置 : src/app/lib/hybrid-storage-manager.ts

核心功能 :

- ✅ 原生 Supabase 集成（不使用第三方库）
- ✅ REST API 调用
- ✅ WebSocket 实时订阅
- ✅ 自动重试机制
数据流程 :

同步请求 → 检查连接状态 → 已连接
                              ↓
                        执行 REST API
                              ↓
                        更新本地存储
                              ↓
                        通知订阅者

4. NativeSupabaseClient (原生客户端)
文件位置 : src/app/lib/native-supabase-client.ts

核心功能 :

- ✅ 使用 fetch API 直接调用 Supabase
- ✅ 认证管理（登录、登出、Token 刷新）
- ✅ 数据库 CRUD 操作
- ✅ 实时订阅（WebSocket）
- ✅ 文件存储
使用示例 :

import { getNativeSupabaseClient } from './lib/native-supabase-client';

const client = getNativeSupabaseClient();

// 认证
await client.signInWithPassword('user@example.com', 'password');

// 数据库操作
const { data } = await client.from('models').select('*').eq('id', 'm-1');

// 实时订阅
const subscription = client.channel('models')
  .on('*', { schema: 'public', table: 'models' }, (payload) => {
    console.log('实时更新:', payload);
  });

5. AdvancedDBOperations (高级操作)
文件位置 : src/app/lib/advanced-db-operations.ts

核心功能 :

- ✅ 批量操作（批量插入、更新、删除）
- ✅ 事务支持（原子操作）
- ✅ 复杂查询（联表、聚合、分组）
- ✅ 查询缓存
使用示例 :

import { batchInsert, executeTransaction } from './lib/advanced-db-operations';

// 批量插入
await batchInsert('models', models, { batchSize: 100 });

// 事务操作
await executeTransaction([
  { type: 'insert', table: 'models', data: newModel },
  { type: 'update', table: 'agents', filter: { id: 'a1' }, data: { is_active: true } },
]);

### 📦 数据存储策略
数据类型 存储位置 同步策略 访问速度 配置数据 localStorage 立即同步 🟢 极快 模型列表 IndexedDB + Supabase 后台同步 🟢 快 代理配置 localStorage + Supabase 后台同步 🟢 快 聊天历史 IndexedDB + Supabase 后台同步 🟡 中 文件内容 IndexedDB + Supabase 手动同步 🟡 中 临时数据 内存缓存 不同步 🟢 极快

### 🔄 同步机制
自动同步 :

// 默认每 30 秒自动同步一次
const storage = getHybridStorage({
  syncInterval: 30000,  // 30 秒
  syncOnWrite: true,    // 写入时立即同步
});

手动同步 :

await storage.syncAll();  // 同步所有表
await storage.syncTable('models');  // 同步单个表

冲突解决 :

const storage = getHybridStorage({
  conflictResolution: 'remote',  // 远程优先
  // conflictResolution: 'local',   // 本地优先
  // conflictResolution: 'manual',  // 手动解决
});

### 🎯 实际应用场景 场景 1: 读取模型列表

// 1. 应用请求模型列表
const models = await storage.get<Model>('models');

// 2. HybridStorageManager 检查本地缓存
//    - 内存缓存有数据 → 立即返回（最快）
//    - IndexedDB 有数据 → 返回并更新缓存（快）
//    - 都没有 → 返回空数组，后台从 Supabase 加载

// 3. 后台异步同步
//    - 从 Supabase 获取最新数据
//    - 更新本地存储
//    - 通知订阅者

场景 2: 添加新模型

// 1. 应用添加新模型
await storage.add('models', newModel);

// 2. HybridStorageManager 立即写入本地
//    - 更新内存缓存
//    - 写入 IndexedDB
//    - 立即返回成功

// 3. 后台异步同步到 Supabase
//    - 发送 POST 请求到 Supabase
//    - 更新 syncStatus.pendingChanges
//    - 成功后清除 pendingChanges

场景 3: 离线模式

// 1. Supabase 连接断开
//    - HybridStorageManager 自动降级到本地存储
//    - 所有操作只影响本地数据
//    - syncStatus.pendingChanges 增加

// 2. 恢复在线
//    - 自动触发同步
//    - 上传所有待同步的更改
//    - 处理冲突（如果有）

### 📊 性能优化
缓存策略 :

- 内存缓存 : 最近访问的数据
- IndexedDB : 大容量数据
- 查询缓存 : 高频查询结果
批量操作 :

- 批量插入（100 条/批）
- 批量更新（100 条/批）
- 批量删除（100 条/批）
懒加载 :

- 按需加载大文件
- 分页查询大量数据
- 虚拟滚动列表
### 🔒 安全性
数据加密 :

- 使用 Web Crypto API 加密敏感数据
- 密钥存储在 localStorage（加密后）
- 支持用户自定义密码
访问控制 :

- Supabase RLS（Row Level Security）
- 用户权限验证
- API 密钥管理

