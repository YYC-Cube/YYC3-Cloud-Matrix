# 硬编码内容可编辑化专项方案

> **文档版本**: v1.0
> **生成日期**: 2026-03-07
> **目标**: 将所有硬编码内容修改为可编辑、可持久化的配置

---

## 📋 目录

1. [概述](#概述)
2. [硬编码内容清单](#硬编码内容清单)
3. [可编辑化实施方案](#可编辑化实施方案)
4. [数据库设计](#数据库设计)
5. [组件设计](#组件设计)
6. [实施步骤](#实施步骤)
7. [验证标准](#验证标准)

---

## 概述

### 问题背景

YYC³ CloudPivot Intelli-Matrix 项目作为本地桌面应用，当前存在大量硬编码内容，包括：

- **模型提供者配置**（9 个提供者，硬编码在 `useModelProvider.ts`）
- **文件系统结构**（完整的目录树，硬编码在 `useLocalFileSystem.ts`）
- **数据库 Mock 数据**（模型、Agent、节点、日志，硬编码在 `db-queries.ts`）
- **系统设置默认值**（硬编码在 `SystemSettings.tsx`）

这些硬编码内容导致：
- ❌ 无法添加、修改、删除配置
- ❌ 无法持久化用户修改
- ❌ 重启应用后恢复默认值
- ❌ 无法适应不同用户的需求

### 目标

将所有硬编码内容修改为：
- ✅ 可编辑：用户可以通过 UI 界面添加、修改、删除配置
- ✅ 可持久化：配置保存到数据库，重启后不丢失
- ✅ 可同步：多个数据源保持同步，避免不一致
- ✅ 可扩展：支持用户自定义配置，适应不同场景

---

## 硬编码内容清单

### 1. 模型提供者配置（硬编码）

**文件位置**: `src/app/hooks/useModelProvider.ts`

**硬编码内容**:

```typescript
export const MODEL_PROVIDERS: ModelProviderDef[] = [
  {
    id: "zhipu",
    label: "Z.ai",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    authType: "api-key",
    models: ["glm-4-flash", "glm-4-plus", "glm-4-air", "glm-4-airx", "glm-4-long", "glm-4v-plus"],
    requiresApiKey: true,
    isLocal: false,
  },
  {
    id: "zhipu-plan",
    label: "Z.ai-plan",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    authType: "api-key",
    models: ["glm-4-plan", "glm-4-plan-plus"],
    requiresApiKey: true,
    isLocal: false,
  },
  {
    id: "kimi-cn",
    label: "Kimi-CN",
    baseUrl: "https://api.moonshot.cn/v1",
    authType: "bearer",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
    requiresApiKey: true,
    isLocal: false,
  },
  {
    id: "kimi-global",
    label: "Kimi-Global",
    baseUrl: "https://api.moonshot.ai/v1",
    authType: "bearer",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
    requiresApiKey: true,
    isLocal: false,
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    authType: "bearer",
    models: ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"],
    requiresApiKey: true,
    isLocal: false,
  },
  {
    id: "volcengine",
    label: "火山引擎",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    authType: "bearer",
    models: ["doubao-pro-32k", "doubao-pro-128k", "doubao-lite-32k"],
    requiresApiKey: true,
    isLocal: false,
  },
  {
    id: "volcengine-plan",
    label: "火山引擎 Plan",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    authType: "bearer",
    models: ["doubao-plan-pro", "doubao-plan-lite"],
    requiresApiKey: true,
    isLocal: false,
  },
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    authType: "bearer",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1-preview", "o1-mini"],
    requiresApiKey: true,
    isLocal: false,
  },
  {
    id: "ollama",
    label: "Ollama (本地)",
    baseUrl: "http://localhost:11434",
    authType: "none",
    models: [],  // 运行时从 /api/tags 自动获取
    requiresApiKey: false,
    isLocal: true,
  },
];
```

**问题**:
- ❌ 无法添加新的模型提供者
- ❌ 无法修改现有提供者的配置（baseUrl、authType、models 等）
- ❌ 无法删除不需要的提供者
- ❌ 模型列表固定，无法动态更新
- ❌ 无法自定义提供者配置

**影响范围**:
- 模型设置页面
- AI 智能浮窗
- 模型选择器组件
- 所有使用模型提供者的功能

---

### 2. 文件系统结构（硬编码）

**文件位置**: `src/app/hooks/useLocalFileSystem.ts`

**硬编码内容**:

```typescript
export const MOCK_FILE_TREE: FileItem[] = [
  {
    id: "d-logs",
    name: "logs",
    type: "directory",
    path: "~/.yyc3-cloudpivot/logs",
    modifiedAt: h(0.5),
    children: [
      {
        id: "d-logs-node",
        name: "node",
        type: "directory",
        path: "~/.yyc3-cloudpivot/logs/node",
        modifiedAt: h(0.5),
        children: [
          {
            id: "d-gpu01",
            name: "GPU-A100-01",
            type: "directory",
            path: "~/.yyc3-cloudpivot/logs/node/GPU-A100-01",
            modifiedAt: h(1),
            children: [
              {
                id: "f-inf01",
                name: "inference.log",
                type: "file",
                size: 2400000,
                path: "~/.yyc3-cloudpivot/logs/node/GPU-A100-01/inference.log",
                extension: "log",
                modifiedAt: h(0.03),
              },
              {
                id: "f-err01",
                name: "error.log",
                type: "file",
                size: 85000,
                path: "~/.yyc3-cloudpivot/logs/node/GPU-A100-01/error.log",
                extension: "log",
                modifiedAt: h(2),
              },
              {
                id: "f-met01",
                name: "metrics.json",
                type: "file",
                size: 320000,
                path: "~/.yyc3-cloudpivot/logs/node/GPU-A100-01/metrics.json",
                extension: "json",
                modifiedAt: h(0.25),
              },
            ],
          },
          // ... 更多目录和文件
        ],
      },
      // ... 更多目录
    ],
  },
  // ... 更多根目录（reports, backups, configs, cache）
];
```

**问题**:
- ❌ 文件树完全硬编码，无法反映实际文件系统
- ❌ 无法添加、删除、重命名文件或目录
- ❌ 无法编辑文件内容
- ❌ 文件大小和修改时间是模拟的
- ❌ 无法浏览真实的本地文件系统
- ❌ 无法上传或下载文件

**影响范围**:
- 文件浏览器组件
- 日志查看器
- 报告生成器
- 配置文件管理

---

### 3. 数据库 Mock 数据（硬编码）

**文件位置**: `src/app/lib/db-queries.ts`

**硬编码内容**:

#### 3.1 模型数据（MOCK_MODELS）

```typescript
const MOCK_MODELS: Model[] = [
  { id: "m1", name: "LLaMA-70B", provider: "Meta", tier: "primary", avg_latency_ms: 45, throughput: 3200, created_at: "2025-12-01" },
  { id: "m2", name: "Qwen-72B", provider: "Alibaba", tier: "primary", avg_latency_ms: 42, throughput: 3500, created_at: "2025-11-15" },
  { id: "m3", name: "DeepSeek-V3", provider: "DeepSeek", tier: "primary", avg_latency_ms: 55, throughput: 2800, created_at: "2026-01-20" },
  { id: "m4", name: "GLM-4", provider: "Zhipu", tier: "secondary", avg_latency_ms: 38, throughput: 4100, created_at: "2025-10-08" },
  { id: "m5", name: "Mixtral-8x7B", provider: "Mistral", tier: "secondary", avg_latency_ms: 32, throughput: 4800, created_at: "2025-09-20" },
];
```

**问题**:
- ❌ 模型数据固定，无法添加、修改、删除
- ❌ 无法与真实数据库连接
- ❌ 无法反映实际部署的模型
- ❌ 性能指标（延迟、吞吐量）是模拟的

#### 3.2 Agent 数据（MOCK_AGENTS）

```typescript
const MOCK_AGENTS: Agent[] = [
  { id: "a1", name: "orchestrator", name_cn: "编排器", role: "core", description: "任务调度与编排", is_active: true },
  { id: "a2", name: "retriever", name_cn: "检索器", role: "rag", description: "向量检索与文档召回", is_active: true },
  { id: "a3", name: "evaluator", name_cn: "评估器", role: "quality", description: "输出质量评估", is_active: true },
  { id: "a4", name: "router", name_cn: "路由器", role: "routing", description: "模型路由与负载均衡", is_active: true },
  { id: "a5", name: "monitor", name_cn: "监控器", role: "ops", description: "系统监控与告警", is_active: true },
];
```

**问题**:
- ❌ Agent 配置固定，无法自定义
- ❌ 无法添加新的 Agent
- ❌ 无法修改 Agent 的角色和描述

#### 3.3 节点数据（MOCK_NODES）

```typescript
const MOCK_NODES: NodeStatus[] = [
  { id: "n1", hostname: "GPU-A100-01", gpu_util: 87, mem_util: 72, temp_celsius: 68, model_deployed: "LLaMA-70B", active_tasks: 128, status: "active" },
  { id: "n2", hostname: "GPU-A100-02", gpu_util: 92, mem_util: 85, temp_celsius: 74, model_deployed: "Qwen-72B", active_tasks: 156, status: "active" },
  { id: "n3", hostname: "GPU-A100-03", gpu_util: 98, mem_util: 94, temp_celsius: 82, model_deployed: "DeepSeek-V3", active_tasks: 89, status: "warning" },
  { id: "n4", hostname: "GPU-H100-01", gpu_util: 65, mem_util: 58, temp_celsius: 55, model_deployed: "GLM-4", active_tasks: 210, status: "active" },
  { id: "n5", hostname: "GPU-H100-02", gpu_util: 78, mem_util: 66, temp_celsius: 62, model_deployed: "Mixtral", active_tasks: 178, status: "active" },
  { id: "n6", hostname: "GPU-H100-03", gpu_util: 0, mem_util: 12, temp_celsius: 32, model_deployed: "-", active_tasks: 0, status: "inactive" },
  { id: "n7", hostname: "TPU-v4-01", gpu_util: 82, mem_util: 70, temp_celsius: 58, model_deployed: "LLaMA-70B", active_tasks: 95, status: "active" },
  { id: "n8", hostname: "TPU-v4-02", gpu_util: 55, mem_util: 48, temp_celsius: 50, model_deployed: "Qwen-72B", active_tasks: 134, status: "active" },
];
```

**问题**:
- ❌ 节点信息固定，无法添加、修改、删除
- ❌ 无法反映实际的计算节点
- ❌ 性能指标（GPU 利用率、内存利用率、温度）是模拟的
- ❌ 无法与真实的监控系统连接

#### 3.4 日志数据（generateMockLogs）

```typescript
const generateMockLogs = (limit: number): InferenceLog[] => {
  const logs: InferenceLog[] = [];
  const statuses: InferenceLog["status"][] = ["success", "success", "success", "success", "error", "timeout"];
  for (let i = 0; i < limit; i++) {
    const modelIdx = Math.floor(Math.random() * MOCK_MODELS.length);
    const agentIdx = Math.floor(Math.random() * MOCK_AGENTS.length);
    const now = new Date();
    now.setMinutes(now.getMinutes() - i * 2);
    logs.push({
      id: `log-${String(i).padStart(5, "0")}`,
      model_id: MOCK_MODELS[modelIdx].id,
      agent_id: MOCK_AGENTS[agentIdx].id,
      latency_ms: Math.floor(20 + Math.random() * 80),
      tokens_in: Math.floor(100 + Math.random() * 2000),
      tokens_out: Math.floor(50 + Math.random() * 4000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: now.toISOString(),
    });
  }
  return logs;
};
```

**问题**:
- ❌ 日志数据是随机生成的，无法反映真实情况
- ❌ 无法与真实的推理日志系统连接

**影响范围**:
- 仪表盘组件
- 模型管理页面
- Agent 管理页面
- 节点监控页面
- 日志查看器
- 所有使用数据库查询的功能

---

### 4. 系统设置默认值（硬编码）

**文件位置**: `src/app/components/SystemSettings.tsx`

**硬编码内容**:

```typescript
const [values, setValues] = useState({
  // 系统设置
  systemName: "YYC³ CloudPivot Intelli-Matrix",
  systemLanguage: "zh-CN",
  systemTheme: "dark",

  // AI / 大模型配置
  aiApiKey: "",
  aiBaseUrl: "https://api.openai.com/v1",
  aiModel: "gpt-4o",
  aiTemperature: "0.7",
  aiTopP: "0.9",
  aiMaxTokens: "2048",
  aiTimeout: "30000",

  // 数据库配置
  dbType: "sqlite",
  dbHost: "localhost",
  dbPort: "5432",
  dbName: "yyc3_cloudpivot",
  dbUser: "postgres",
  dbPassword: "",

  // ... 更多配置
});
```

**问题**:
- ❌ 默认值固定在代码中
- ❌ 无法持久化用户修改
- ❌ 重启应用后恢复默认值
- ❌ 无法自定义默认配置

**影响范围**:
- 系统设置页面
- 所有使用系统设置的功能

---

## 可编辑化实施方案

### 方案架构

```
┌─────────────────────────────────────────────────────────────┐
│                    UI 层（前端）                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 模型提供者   │  │ 文件系统     │  │ 系统设置     │ │
│  │ 编辑器       │  │ 管理器       │  │ 编辑器       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  业务逻辑层（Hooks）                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │useConfig     │  │useModel      │  │useFileSystem │ │
│  │Manager      │  │Provider     │  │Manager      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                数据访问层（DAL）                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ ConfigDAL    │  │ ModelDAL     │  │ FileDAL      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              持久化层（数据库 + 文件系统）               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ SQLite       │  │ Electron IPC │  │ Local FS     │ │
│  │ Database     │  │ (文件操作)   │  │ (真实文件)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 核心原则

1. **单一数据源（Single Source of Truth）**: 所有配置和数据都存储在数据库中
2. **可编辑性**: 所有硬编码内容都可以通过 UI 界面编辑
3. **持久化**: 配置和数据保存到数据库，重启后不丢失
4. **同步性**: 多个数据源保持同步，避免不一致
5. **扩展性**: 支持用户自定义配置，适应不同场景

---

## 数据库设计

### 1. 模型提供者表（model_providers）

```sql
CREATE TABLE model_providers (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  base_url TEXT NOT NULL,
  auth_type TEXT NOT NULL,  -- 'api-key', 'bearer', 'none'
  models TEXT,  -- JSON 数组，存储模型列表
  requires_api_key BOOLEAN NOT NULL DEFAULT 0,
  is_local BOOLEAN NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 创建索引
CREATE INDEX idx_model_providers_is_active ON model_providers(is_active);
CREATE INDEX idx_model_providers_is_local ON model_providers(is_local);
```

**初始数据**（从硬编码迁移）:

```sql
INSERT INTO model_providers (id, label, base_url, auth_type, models, requires_api_key, is_local) VALUES
  ('zhipu', 'Z.ai', 'https://open.bigmodel.cn/api/paas/v4', 'api-key', '["glm-4-flash","glm-4-plus","glm-4-air","glm-4-airx","glm-4-long","glm-4v-plus"]', 1, 0),
  ('zhipu-plan', 'Z.ai-plan', 'https://open.bigmodel.cn/api/paas/v4', 'api-key', '["glm-4-plan","glm-4-plan-plus"]', 1, 0),
  ('kimi-cn', 'Kimi-CN', 'https://api.moonshot.cn/v1', 'bearer', '["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"]', 1, 0),
  ('kimi-global', 'Kimi-Global', 'https://api.moonshot.ai/v1', 'bearer', '["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"]', 1, 0),
  ('deepseek', 'DeepSeek', 'https://api.deepseek.com/v1', 'bearer', '["deepseek-chat","deepseek-coder","deepseek-reasoner"]', 1, 0),
  ('volcengine', '火山引擎', 'https://ark.cn-beijing.volces.com/api/v3', 'bearer', '["doubao-pro-32k","doubao-pro-128k","doubao-lite-32k"]', 1, 0),
  ('volcengine-plan', '火山引擎 Plan', 'https://ark.cn-beijing.volces.com/api/v3', 'bearer', '["doubao-plan-pro","doubao-plan-lite"]', 1, 0),
  ('openai', 'OpenAI', 'https://api.openai.com/v1', 'bearer', '["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview","o1-mini"]', 1, 0),
  ('ollama', 'Ollama (本地)', 'http://localhost:11434', 'none', '[]', 0, 1);
```

---

### 2. 系统配置表（system_settings）

```sql
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'string', 'number', 'boolean', 'json'
  category TEXT NOT NULL,  -- 'system', 'ai', 'database', 'ui', etc.
  description TEXT,
  is_editable BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 创建索引
CREATE INDEX idx_system_settings_category ON system_settings(category);
```

**初始数据**（从硬编码迁移）:

```sql
INSERT INTO system_settings (key, value, type, category, description) VALUES
  -- 系统设置
  ('systemName', 'YYC³ CloudPivot Intelli-Matrix', 'string', 'system', '系统名称'),
  ('systemLanguage', 'zh-CN', 'string', 'system', '系统语言'),
  ('systemTheme', 'dark', 'string', 'system', '系统主题'),

  -- AI / 大模型配置
  ('aiBaseUrl', 'https://api.openai.com/v1', 'string', 'ai', 'API Base URL'),
  ('aiModel', 'gpt-4o', 'string', 'ai', '默认模型'),
  ('aiTemperature', '0.7', 'number', 'ai', 'Temperature'),
  ('aiTopP', '0.9', 'number', 'ai', 'Top P'),
  ('aiMaxTokens', '2048', 'number', 'ai', 'Max Tokens'),
  ('aiTimeout', '30000', 'number', 'ai', 'Timeout (ms)'),

  -- 数据库配置
  ('dbType', 'sqlite', 'string', 'database', '数据库类型'),
  ('dbHost', 'localhost', 'string', 'database', '数据库主机'),
  ('dbPort', '5432', 'number', 'database', '数据库端口'),
  ('dbName', 'yyc3_cloudpivot', 'string', 'database', '数据库名称'),
  ('dbUser', 'postgres', 'string', 'database', '数据库用户');
```

---

### 3. 文件系统配置表（file_system_config）

```sql
CREATE TABLE file_system_config (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,  -- 文件或目录的路径
  name TEXT NOT NULL,  -- 文件或目录的名称
  type TEXT NOT NULL,  -- 'file' 或 'directory'
  parent_id TEXT,  -- 父目录 ID，根目录为 NULL
  is_watched BOOLEAN NOT NULL DEFAULT 0,  -- 是否监控文件变化
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES file_system_config(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX idx_file_system_config_parent_id ON file_system_config(parent_id);
CREATE INDEX idx_file_system_config_type ON file_system_config(type);
```

**初始数据**（从硬编码迁移）:

```sql
-- 根目录
INSERT INTO file_system_config (id, path, name, type, parent_id) VALUES
  ('d-logs', '~/.yyc3-cloudpivot/logs', 'logs', 'directory', NULL),
  ('d-reports', '~/.yyc3-cloudpivot/reports', 'reports', 'directory', NULL),
  ('d-backups', '~/.yyc3-cloudpivot/backups', 'backups', 'directory', NULL),
  ('d-configs', '~/.yyc3-cloudpivot/configs', 'configs', 'directory', NULL),
  ('d-cache', '~/.yyc3-cloudpivot/cache', 'cache', 'directory', NULL);

-- 子目录
INSERT INTO file_system_config (id, path, name, type, parent_id) VALUES
  ('d-logs-node', '~/.yyc3-cloudpivot/logs/node', 'node', 'directory', 'd-logs'),
  ('d-logs-sys', '~/.yyc3-cloudpivot/logs/system', 'system', 'directory', 'd-logs'),
  ('d-daily', '~/.yyc3-cloudpivot/reports/daily', 'daily', 'directory', 'd-reports'),
  ('d-weekly', '~/.yyc3-cloudpivot/reports/weekly', 'weekly', 'directory', 'd-reports'),
  ('d-bk-nodes', '~/.yyc3-cloudpivot/backups/nodes', 'nodes', 'directory', 'd-backups'),
  ('d-bk-models', '~/.yyc3-cloudpivot/backups/models', 'models', 'directory', 'd-backups'),
  ('d-bk-config', '~/.yyc3-cloudpivot/backups/config', 'config', 'directory', 'd-backups');
```

---

### 4. 模型表（models）

```sql
CREATE TABLE models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  tier TEXT NOT NULL,  -- 'primary', 'secondary'
  avg_latency_ms INTEGER,
  throughput INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 创建索引
CREATE INDEX idx_models_tier ON models(tier);
CREATE INDEX idx_models_provider ON models(provider);
CREATE INDEX idx_models_is_active ON models(is_active);
```

**初始数据**（从硬编码迁移）:

```sql
INSERT INTO models (id, name, provider, tier, avg_latency_ms, throughput) VALUES
  ('m1', 'LLaMA-70B', 'Meta', 'primary', 45, 3200),
  ('m2', 'Qwen-72B', 'Alibaba', 'primary', 42, 3500),
  ('m3', 'DeepSeek-V3', 'DeepSeek', 'primary', 55, 2800),
  ('m4', 'GLM-4', 'Zhipu', 'secondary', 38, 4100),
  ('m5', 'Mixtral-8x7B', 'Mistral', 'secondary', 32, 4800);
```

---

### 5. Agent 表（agents）

```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_cn TEXT,
  role TEXT NOT NULL,  -- 'core', 'rag', 'quality', 'routing', 'ops'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 创建索引
CREATE INDEX idx_agents_role ON agents(role);
CREATE INDEX idx_agents_is_active ON agents(is_active);
```

**初始数据**（从硬编码迁移）:

```sql
INSERT INTO agents (id, name, name_cn, role, description) VALUES
  ('a1', 'orchestrator', '编排器', 'core', '任务调度与编排'),
  ('a2', 'retriever', '检索器', 'rag', '向量检索与文档召回'),
  ('a3', 'evaluator', '评估器', 'quality', '输出质量评估'),
  ('a4', 'router', '路由器', 'routing', '模型路由与负载均衡'),
  ('a5', 'monitor', '监控器', 'ops', '系统监控与告警');
```

---

### 6. 节点表（nodes）

```sql
CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  hostname TEXT NOT NULL,
  gpu_util INTEGER,  -- GPU 利用率 (0-100)
  mem_util INTEGER,  -- 内存利用率 (0-100)
  temp_celsius INTEGER,  -- 温度 (摄氏度)
  model_deployed TEXT,  -- 部署的模型
  active_tasks INTEGER,  -- 活跃任务数
  status TEXT NOT NULL,  -- 'active', 'warning', 'inactive'
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 创建索引
CREATE INDEX idx_nodes_status ON nodes(status);
CREATE INDEX idx_nodes_is_active ON nodes(is_active);
```

**初始数据**（从硬编码迁移）:

```sql
INSERT INTO nodes (id, hostname, gpu_util, mem_util, temp_celsius, model_deployed, active_tasks, status) VALUES
  ('n1', 'GPU-A100-01', 87, 72, 68, 'LLaMA-70B', 128, 'active'),
  ('n2', 'GPU-A100-02', 92, 85, 74, 'Qwen-72B', 156, 'active'),
  ('n3', 'GPU-A100-03', 98, 94, 82, 'DeepSeek-V3', 89, 'warning'),
  ('n4', 'GPU-H100-01', 65, 58, 55, 'GLM-4', 210, 'active'),
  ('n5', 'GPU-H100-02', 78, 66, 62, 'Mixtral', 178, 'active'),
  ('n6', 'GPU-H100-03', 0, 12, 32, '-', 0, 'inactive'),
  ('n7', 'TPU-v4-01', 82, 70, 58, 'LLaMA-70B', 95, 'active'),
  ('n8', 'TPU-v4-02', 55, 48, 50, 'Qwen-72B', 134, 'active');
```

---

## 组件设计

### 1. 模型提供者编辑器（ModelProviderEditor）

**功能**:
- ✅ 查看所有模型提供者列表
- ✅ 添加新的模型提供者
- ✅ 编辑现有提供者的配置
- ✅ 删除不需要的提供者
- ✅ 测试提供者连接
- ✅ 启用/禁用提供者

**界面设计**:

```
┌─────────────────────────────────────────────────────────┐
│  模型提供者管理                                      │
├─────────────────────────────────────────────────────────┤
│  [+ 添加提供者]  [刷新]                              │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ Z.ai                      [✓ 已启用] [编辑] [删除] │   │
│  │ Base URL: https://open.bigmodel.cn/api/paas/v4  │   │
│  │ 认证方式: API Key                               │   │
│  │ 模型: glm-4-flash, glm-4-plus, ...               │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ OpenAI                    [✓ 已启用] [编辑] [删除] │   │
│  │ Base URL: https://api.openai.com/v1             │   │
│  │ 认证方式: Bearer Token                          │   │
│  │ 模型: gpt-4o, gpt-4o-mini, ...                │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Ollama (本地)              [✓ 已启用] [编辑] [删除] │   │
│  │ Base URL: http://localhost:11434               │   │
│  │ 认证方式: 无                                   │   │
│  │ 模型: (自动从 Ollama 获取)                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**编辑表单**:

```
┌─────────────────────────────────────────────────────────┐
│  编辑模型提供者                                      │
├─────────────────────────────────────────────────────────┤
│  ID: [zhipu]                                       │
│  名称: [Z.ai]                                       │
│  Base URL: [https://open.bigmodel.cn/api/paas/v4]     │
│  认证方式: [API Key ▼]                               │
│  模型列表:                                          │
│    [glm-4-flash] [x]                                │
│    [glm-4-plus] [x]                                  │
│    [glm-4-air] [x]                                   │
│    [+] 添加模型                                       │
│  [✓] 需要 API Key                                   │
│  [ ] 本地提供者                                       │
│  [✓] 已启用                                         │
│                                                         │
│  [取消] [保存] [测试连接]                              │
└─────────────────────────────────────────────────────────┘
```

---

### 2. 文件系统管理器（FileSystemManager）

**功能**:
- ✅ 浏览真实的本地文件系统
- ✅ 添加、删除、重命名文件或目录
- ✅ 编辑文件内容
- ✅ 上传文件到指定目录
- ✅ 下载文件到本地
- ✅ 监控文件变化

**界面设计**:

```
┌─────────────────────────────────────────────────────────┐
│  文件系统管理                                        │
├─────────────────────────────────────────────────────────┤
│  路径: ~/.yyc3-cloudpivot/logs/                    │
│  [新建文件夹] [上传文件] [刷新]                        │
├─────────────────────────────────────────────────────────┤
│  📁 node/                                          │
│  📁 system/                                        │
│  📄 app.log (1.2 MB)  [编辑] [下载] [删除]          │
│  📄 performance.json (890 KB)  [编辑] [下载] [删除] │
└─────────────────────────────────────────────────────────┘
```

**文件编辑器**:

```
┌─────────────────────────────────────────────────────────┐
│  编辑文件: ~/.yyc3-cloudpivot/logs/system/app.log    │
├─────────────────────────────────────────────────────────┤
│  [2026-03-07 10:30:15] INFO: Application started   │
│  [2026-03-07 10:30:16] INFO: Connected to database │
│  [2026-03-07 10:30:17] INFO: Loading models...     │
│  [2026-03-07 10:30:18] INFO: Loaded 5 models     │
│  ...                                                │
├─────────────────────────────────────────────────────────┤
│  [取消] [保存] [保存并关闭]                         │
└─────────────────────────────────────────────────────────┘
```

---

### 3. 系统设置编辑器（SystemSettingsEditor）

**功能**:
- ✅ 查看所有系统设置
- ✅ 编辑系统设置
- ✅ 重置为默认值
- ✅ 导出配置到文件
- ✅ 从文件导入配置

**界面设计**:

```
┌─────────────────────────────────────────────────────────┐
│  系统设置                                            │
├─────────────────────────────────────────────────────────┤
│  分类: [全部 ▼]  [导出配置] [导入配置] [重置默认]    │
├─────────────────────────────────────────────────────────┤
│  系统设置                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 系统名称                                      │   │
│  │ [YYC³ CloudPivot Intelli-Matrix]               │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 系统语言                                      │   │
│  │ [简体中文 ▼]                                  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 系统主题                                      │   │
│  │ [深色 ▼]                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  AI / 大模型配置                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ API Base URL                                 │   │
│  │ [https://api.openai.com/v1]                  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 默认模型                                     │   │
│  │ [gpt-4o ▼]                                  │   │
│  └─────────────────────────────────────────────────┘   │
│  ...                                                │
│                                                         │
│  [保存更改]                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 实施步骤

### 第一阶段：数据库集成（5 人天）

**目标**: 建立 SQLite 数据库，创建所有必要的表，迁移初始数据

**任务**:
1. ✅ 设计数据库表结构（已完成）
2. ⬜ 创建数据库初始化脚本
3. ⬜ 实现数据库连接管理
4. ⬜ 创建数据访问层（DAL）
5. ⬜ 迁移硬编码数据到数据库
6. ⬜ 编写数据库迁移脚本

**输出**:
- `src/app/lib/database.ts` - 数据库连接管理
- `src/app/lib/dal/` - 数据访问层
- `src/app/lib/migrations/` - 数据库迁移脚本
- `src/app/lib/initial-data.sql` - 初始数据 SQL

---

### 第二阶段：模型提供者可编辑化（8 人天）

**目标**: 将模型提供者配置修改为可编辑、可持久化

**任务**:
1. ⬜ 创建 `ModelProviderDAL` 数据访问层
2. ⬜ 修改 `useModelProvider` Hook，从数据库读取配置
3. ⬜ 创建 `ModelProviderEditor` 组件
4. ⬜ 实现添加、编辑、删除提供者功能
5. ⬜ 实现测试连接功能
6. ⬜ 实现 Ollama 模型自动识别并同步到数据库
7. ⬜ 更新所有使用模型提供者的组件
8. ⬜ 编写单元测试和集成测试

**输出**:
- `src/app/lib/dal/ModelProviderDAL.ts`
- `src/app/hooks/useModelProvider.ts` (修改)
- `src/app/components/ModelProviderEditor.tsx`
- `src/app/components/AddModelProviderModal.tsx`
- `src/app/components/EditModelProviderModal.tsx`
- `src/app/__tests__/ModelProviderEditor.test.tsx`

---

### 第三阶段：文件系统可编辑化（10 人天）

**目标**: 将文件系统管理修改为可编辑、可持久化，支持真实文件系统访问

**任务**:
1. ⬜ 扩展 Electron IPC API，添加文件系统操作接口
2. ⬜ 创建 `FileSystemDAL` 数据访问层
3. ⬜ 修改 `useLocalFileSystem` Hook，从真实文件系统读取
4. ⬜ 创建 `FileSystemManager` 组件
5. ⬜ 实现文件浏览、添加、删除、重命名功能
6. ⬜ 实现文件编辑器组件
7. ⬜ 实现文件上传和下载功能
8. ⬜ 实现文件监控功能
9. ⬜ 编写单元测试和集成测试

**输出**:
- `electron/main.ts` (扩展 IPC API)
- `electron/preload.ts` (扩展 IPC API)
- `src/app/lib/dal/FileSystemDAL.ts`
- `src/app/hooks/useLocalFileSystem.ts` (修改)
- `src/app/components/FileSystemManager.tsx`
- `src/app/components/FileEditor.tsx`
- `src/app/components/FileUpload.tsx`
- `src/app/__tests__/FileSystemManager.test.tsx`

---

### 第四阶段：系统设置可编辑化（4 人天）

**目标**: 将系统设置修改为可编辑、可持久化

**任务**:
1. ⬜ 创建 `SystemSettingsDAL` 数据访问层
2. ⬜ 修改 `SystemSettings` 组件，从数据库读取配置
3. ⬜ 实现配置编辑功能
4. ⬜ 实现配置导出/导入功能
5. ⬜ 实现配置重置功能
6. ⬜ 编写单元测试和集成测试

**输出**:
- `src/app/lib/dal/SystemSettingsDAL.ts`
- `src/app/components/SystemSettings.tsx` (修改)
- `src/app/components/ConfigExportModal.tsx`
- `src/app/components/ConfigImportModal.tsx`
- `src/app/__tests__/SystemSettings.test.tsx`

---

### 第五阶段：Mock 数据可编辑化（8 人天）

**目标**: 将所有 Mock 数据修改为可编辑、可持久化

**任务**:
1. ⬜ 创建 `ModelDAL`、`AgentDAL`、`NodeDAL` 数据访问层
2. ⬜ 修改 `db-queries.ts`，从数据库读取数据
3. ⬜ 创建模型管理页面，支持添加、编辑、删除模型
4. ⬜ 创建 Agent 管理页面，支持添加、编辑、删除 Agent
5. ⬜ 创建节点管理页面，支持添加、编辑、删除节点
6. ⬜ 实现与真实监控系统的集成（可选）
7. ⬜ 编写单元测试和集成测试

**输出**:
- `src/app/lib/dal/ModelDAL.ts`
- `src/app/lib/dal/AgentDAL.ts`
- `src/app/lib/dal/NodeDAL.ts`
- `src/app/lib/db-queries.ts` (修改)
- `src/app/components/ModelManagement.tsx`
- `src/app/components/AgentManagement.tsx`
- `src/app/components/NodeManagement.tsx`
- `src/app/__tests__/ModelManagement.test.tsx`

---

### 第六阶段：测试和优化（6 人天）

**目标**: 全面测试所有可编辑化功能，优化用户体验

**任务**:
1. ⬜ 编写端到端测试（E2E）
2. ⬜ 进行性能测试和优化
3. ⬜ 进行安全测试和加固
4. ⬜ 优化用户界面和交互体验
5. ⬜ 编写用户文档
6. ⬜ 进行用户验收测试

**输出**:
- `src/app/__tests__/e2e/` - E2E 测试
- `docs/用户手册.md` - 用户手册
- 性能优化报告
- 安全加固报告

---

## 验证标准

### 功能验证

- [ ] **模型提供者可编辑化**
  - [ ] 可以添加新的模型提供者
  - [ ] 可以编辑现有提供者的配置
  - [ ] 可以删除不需要的提供者
  - [ ] 可以测试提供者连接
  - [ ] 可以启用/禁用提供者
  - [ ] Ollama 模型自动识别并同步到数据库
  - [ ] 所有使用模型提供者的组件都从数据库读取配置

- [ ] **文件系统可编辑化**
  - [ ] 可以浏览真实的本地文件系统
  - [ ] 可以添加、删除、重命名文件或目录
  - [ ] 可以编辑文件内容
  - [ ] 可以上传文件到指定目录
  - [ ] 可以下载文件到本地
  - [ ] 可以监控文件变化
  - [ ] 所有使用文件系统的组件都从真实文件系统读取

- [ ] **系统设置可编辑化**
  - [ ] 可以编辑所有系统设置
  - [ ] 可以导出配置到文件
  - [ ] 可以从文件导入配置
  - [ ] 可以重置为默认值
  - [ ] 配置保存到数据库，重启后不丢失

- [ ] **Mock 数据可编辑化**
  - [ ] 可以添加、编辑、删除模型
  - [ ] 可以添加、编辑、删除 Agent
  - [ ] 可以添加、编辑、删除节点
  - [ ] 所有数据都从数据库读取
  - [ ] 可以与真实监控系统集成（可选）

### 质量验证

- [ ] **代码质量**
  - [ ] 所有代码通过 ESLint 检查
  - [ ] 所有代码通过 TypeScript 类型检查
  - [ ] 代码覆盖率 ≥ 80%
  - [ ] 所有测试通过

- [ ] **性能**
  - [ ] 数据库查询响应时间 < 100ms
  - [ ] 文件系统操作响应时间 < 500ms
  - [ ] UI 渲染帧率 ≥ 60 FPS
  - [ ] 内存使用合理（< 500MB）

- [ ] **安全**
  - [ ] API Key 使用 Electron safeStorage 加密存储
  - [ ] 文件系统访问有权限控制
  - [ ] 用户输入有验证和过滤
  - [ ] 没有安全漏洞

- [ ] **用户体验**
  - [ ] 界面友好，操作直观
  - [ ] 有清晰的错误提示
  - [ ] 有加载状态指示
  - [ ] 有操作确认提示
  - [ ] 支持键盘快捷键

---

## 总结

本方案详细描述了如何将 YYC³ CloudPivot Intelli-Matrix 项目中的所有硬编码内容修改为可编辑、可持久化的配置。

**核心改进**:
1. ✅ 建立统一的数据库存储（SQLite）
2. ✅ 创建数据访问层（DAL）封装数据库操作
3. ✅ 开发可编辑的 UI 组件
4. ✅ 实现配置的 CRUD 操作
5. ✅ 支持配置的导出/导入
6. ✅ 集成真实的文件系统访问

**预计工作量**: 41 人天（约 8.2 周，按 5 人团队计算约 1.6 个月）

**实施周期**: 6 个阶段，每个阶段 4-10 人天

**预期效果**:
- 所有硬编码内容都可以通过 UI 界面编辑
- 配置和数据保存到数据库，重启后不丢失
- 多个数据源保持同步，避免不一致
- 支持用户自定义配置，适应不同场景
- 提升用户体验和系统可维护性

---

**文档结束**
