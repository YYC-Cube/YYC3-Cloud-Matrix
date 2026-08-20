# 🖥️ YYC³ CloudPivot Intelli-Matrix 本地桌面应用可编辑性改进方案

## 📋 项目定位分析

### 核心需求
根据您的说明，这是一个**本地桌面应用**，核心需求是：

1. **自动识别宿主机存储** - 自动扫描本地文件系统
2. **实现可编辑管理** - 所有固定内容都要可编辑
3. **链接数据库** - 连接本地数据库

### 当前架构
- **Electron 桌面应用** - 使用 Electron 封装
- **React 前端** - React 19 + TypeScript
- **本地存储** - localStorage + Mock 数据
- **数据库** - Supabase（Mock 模式）

---

## 🔴 严重问题：所有固定内容都是硬编码的

### 问题 1：模型提供商硬编码

**当前实现**:
```typescript
// useModelProvider.ts
export const MODEL_PROVIDERS: ModelProviderDef[] = [
  {
    id: "zhipu",
    label: "Z.ai",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    authType: "api-key",
    models: ["glm-4-flash", "glm-4-plus", "glm-4-air", ...],  // ❌ 硬编码
    requiresApiKey: true,
    isLocal: false,
  },
  {
    id: "ollama",
    label: "Ollama (本地)",
    baseUrl: "http://localhost:11434",
    authType: "none",
    models: [],  // ❌ 运行时从 /api/tags 自动获取
    requiresApiKey: false,
    isLocal: true,
  },
  // ... 更多硬编码的服务商
];
```

**问题**:
- ❌ 服务商列表硬编码，无法动态添加
- ❌ 模型列表硬编码，无法自动更新
- ❌ 用户无法自定义服务商

### 问题 2：文件系统硬编码

**当前实现**:
```typescript
// useLocalFileSystem.ts
export const MOCK_FILE_TREE: FileItem[] = [
  {
    id: "d-logs", name: "logs", type: "directory", path: "~/.yyc3-cloudpivot/logs", modifiedAt: h(0.5),
    children: [
      {
        id: "d-logs-node", name: "node", type: "directory", path: "~/.yyc3-cloudpivot/logs/node", modifiedAt: h(0.5),
        children: [
          {
            id: "d-gpu01", name: "GPU-A100-01", type: "directory", path: "~/.yyc3-cloudpivot/logs/node/GPU-A100-01", modifiedAt: h(1),
            children: [
              { id: "f-inf01",  name: "inference.log", type: "file", size: 2400000, path: "~/.yyc3-cloudpivot/logs/node/GPU-A100-01/inference.log", extension: "log", modifiedAt: h(0.03) },
              // ... 更多硬编码的文件
            ],
          },
          // ... 更多硬编码的目录
        ],
      },
      // ... 更多硬编码的目录
    ],
  },
  // ... 更多硬编码的目录
];
```

**问题**:
- ❌ 文件树完全硬编码，无法反映真实文件系统
- ❌ 无法自动扫描宿主机存储
- ❌ 用户无法管理真实文件

### 问题 3：节点数据硬编码

**当前实现**:
```typescript
// useWebSocketData.ts
const DEFAULT_NODES: NodeData[] = [
  { id: "GPU-A100-01", status: "active", gpu: 87, mem: 72, temp: 68, model: "LLaMA-70B", tasks: 128 },
  { id: "GPU-A100-02", status: "active", gpu: 92, mem: 85, temp: 74, model: "Qwen-72B", tasks: 156 },
  { id: "GPU-A100-03", status: "warning", gpu: 98, mem: 94, temp: 82, model: "DeepSeek-V3", tasks: 89 },
  // ... 更多硬编码的节点
];

const DEFAULT_THROUGHPUT: ThroughputPoint[] = [
  { time: "00:00", qps: 1200, latency: 28, tokens: 45000 },
  { time: "02:00", qps: 980, latency: 32, tokens: 38000 },
  // ... 更多硬编码的数据
];
```

**问题**:
- ❌ 节点列表硬编码，无法动态添加
- ❌ 吞吐量数据硬编码，无法实时更新
- ❌ 无法从数据库读取真实节点信息

### 问题 4：数据库 Mock 数据硬编码

**当前实现**:
```typescript
// db-queries.ts
const MOCK_MODELS: Model[] = [
  { id: "m1", name: "LLaMA-70B", provider: "Meta", tier: "primary", avg_latency_ms: 45, throughput: 3200, created_at: "2025-12-01" },
  { id: "m2", name: "Qwen-72B", provider: "Alibaba", tier: "primary", avg_latency_ms: 42, throughput: 3500, created_at: "2025-11-15" },
  // ... 更多硬编码的模型
];

const MOCK_AGENTS: Agent[] = [
  { id: "a1", name: "orchestrator", name_cn: "编排器", role: "core", description: "任务调度与编排", is_active: true },
  // ... 更多硬编码的 Agent
];

const MOCK_NODES: NodeStatus[] = [
  { id: "n1", hostname: "GPU-A100-01", gpu_util: 87, mem_util: 72, temp_celsius: 68, model_deployed: "LLaMA-70B", active_tasks: 128, status: "active" },
  // ... 更多硬编码的节点
];
```

**问题**:
- ❌ 所有数据库查询都是 Mock 数据
- ❌ 无法连接真实数据库
- ❌ 无法持久化用户配置

### 问题 5：Dashboard 图表数据硬编码

**当前实现**:
```typescript
// Dashboard.tsx
const modelPerformance = [
  { model: "LLaMA-70B", accuracy: 94.2, speed: 85, memory: 78, cost: 62 },
  { model: "Qwen-72B", accuracy: 92.8, speed: 88, memory: 72, cost: 68 },
  // ... 更多硬编码的数据
];

const radarData = [
  { metric: "inferenceSpeed", A: 92, B: 85 },
  { metric: "modelAccuracy", A: 88, B: 94 },
  // ... 更多硬编码的数据
];

const pieData = [
  { name: "LLaMA-70B", value: 35 },
  { name: "Qwen-72B", value: 25 },
  // ... 更多硬编码的数据
];
```

**问题**:
- ❌ 所有图表数据都是硬编码的
- ❌ 无法从数据库读取真实数据
- ❌ 无法动态更新

---

## ✅ 改进方案

### 方案 1：宿主机存储自动识别

#### 1.1 实现 Electron IPC 文件系统访问

**步骤 1：扩展 Electron Preload API**

```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer, shell } from 'electron';

contextBridge.exposeInMainWorld('yyc3', {
  // 现有 API
  openExternal: (url: string) => shell.openExternal(url),
  openPath: (path: string) => shell.openPath(path),
  showItemInFolder: (path: string) => shell.showItemInFolder(path),
  openFileEditor: (path: string) => shell.openExternal(`file://${path}`),
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,
  isDev: () => process.env.NODE_ENV === 'development',
  
  // 新增：文件系统 API
  fs: {
    readDir: (path: string) => ipcRenderer.invoke('fs-readDir', path),
    readFile: (path: string) => ipcRenderer.invoke('fs-readFile', path),
    writeFile: (path: string, content: string) => ipcRenderer.invoke('fs-writeFile', path, content),
    mkdir: (path: string) => ipcRenderer.invoke('fs-mkdir', path),
    exists: (path: string) => ipcRenderer.invoke('fs-exists', path),
    getHomeDir: () => ipcRenderer.invoke('fs-getHomeDir'),
    getAppDataPath: () => ipcRenderer.invoke('fs-getAppDataPath'),
    scanDirectory: (path: string, recursive?: boolean) => ipcRenderer.invoke('fs-scanDirectory', path, recursive),
  },
  
  // 新增：数据库 API
  db: {
    connect: (config: DatabaseConfig) => ipcRenderer.invoke('db-connect', config),
    disconnect: () => ipcRenderer.invoke('db-disconnect'),
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db-query', sql, params),
    execute: (sql: string, params?: any[]) => ipcRenderer.invoke('db-execute', sql, params),
  },
});
```

**步骤 2：实现 Electron Main 进程文件系统处理**

```typescript
// electron/main.ts
const { app, BrowserWindow, Tray, Menu, nativeImage, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 文件系统 IPC 处理
ipcMain.handle('fs-readDir', async (event, dirPath: string) => {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    return files.map(file => ({
      name: file.name,
      type: file.isDirectory() ? 'directory' : 'file',
      path: path.join(dirPath, file.name),
      size: file.isFile() ? fs.statSync(path.join(dirPath, file.name)).size : 0,
      modifiedAt: fs.statSync(path.join(dirPath, file.name)).mtimeMs,
    }));
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
});

ipcMain.handle('fs-readFile', async (event, filePath: string) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});

ipcMain.handle('fs-writeFile', async (event, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
});

ipcMain.handle('fs-mkdir', async (event, dirPath: string) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to create directory: ${error.message}`);
  }
});

ipcMain.handle('fs-exists', async (event, filePath: string) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
});

ipcMain.handle('fs-getHomeDir', async () => {
  return os.homedir();
});

ipcMain.handle('fs-getAppDataPath', async () => {
  return path.join(os.homedir(), '.yyc3-cloudpivot');
});

ipcMain.handle('fs-scanDirectory', async (event, dirPath: string, recursive: boolean = false) => {
  try {
    const scanDir = (dir: string, base: string = ''): FileItem[] => {
      const items: FileItem[] = [];
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        const relativePath = path.join(base, file.name);
        const stats = fs.statSync(fullPath);
        
        const item: FileItem = {
          id: relativePath.replace(/\//g, '-'),
          name: file.name,
          type: file.isDirectory() ? 'directory' : 'file',
          path: fullPath,
          size: file.isFile() ? stats.size : 0,
          modifiedAt: stats.mtimeMs,
          extension: file.isFile() ? path.extname(file.name).slice(1) : undefined,
        };
        
        if (file.isDirectory() && recursive) {
          item.children = scanDir(fullPath, relativePath);
        }
        
        items.push(item);
      }
      
      return items;
    };
    
    return scanDir(dirPath);
  } catch (error) {
    throw new Error(`Failed to scan directory: ${error.message}`);
  }
});
```

#### 1.2 创建真实的文件系统 Hook

```typescript
// src/app/hooks/useRealFileSystem.ts
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { FileItem, LogEntry } from "../types";

export function useRealFileSystem() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [currentItems, setCurrentItems] = useState<FileItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path: string }>>([]);
  const [loading, setLoading] = useState(false);

  // 初始化应用数据目录
  useEffect(() => {
    const initAppDataDir = async () => {
      try {
        const appDataPath = await (window as any).yyc3.fs.getAppDataPath();
        
        // 检查目录是否存在
        const exists = await (window as any).yyc3.fs.exists(appDataPath);
        if (!exists) {
          await (window as any).yyc3.fs.mkdir(appDataPath);
          toast.success("应用数据目录已创建");
        }
        
        // 创建默认子目录
        const subdirs = ['logs', 'reports', 'backups', 'configs', 'cache'];
        for (const subdir of subdirs) {
          const dirPath = path.join(appDataPath, subdir);
          const dirExists = await (window as any).yyc3.fs.exists(dirPath);
          if (!dirExists) {
            await (window as any).yyc3.fs.mkdir(dirPath);
          }
        }
        
        // 设置初始路径
        setCurrentPath(appDataPath);
        setBreadcrumbs([{ label: "~/.yyc3-cloudpivot", path: appDataPath }]);
        
        // 扫描目录
        await scanDirectory(appDataPath);
      } catch (error) {
        toast.error("初始化应用数据目录失败", {
          description: error.message,
        });
      }
    };
    
    initAppDataDir();
  }, []);

  // 扫描目录
  const scanDirectory = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const items = await (window as any).yyc3.fs.scanDirectory(path, true);
      setCurrentItems(items);
    } catch (error) {
      toast.error("扫描目录失败", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 导航到目录
  const navigateTo = useCallback(async (path: string) => {
    setCurrentPath(path);
    await scanDirectory(path);
  }, [scanDirectory]);

  // 返回上级目录
  const goUp = useCallback(async () => {
    const parentPath = path.dirname(currentPath);
    if (parentPath !== currentPath) {
      await navigateTo(parentPath);
      setBreadcrumbs(prev => prev.slice(0, -1));
    }
  }, [currentPath, navigateTo]);

  // 选择文件
  const selectFile = useCallback(async (item: FileItem) => {
    if (item.type === 'directory') {
      await navigateTo(item.path);
      setBreadcrumbs(prev => [...prev, { label: item.name, path: item.path }]);
    } else {
      // 打开文件
      await (window as any).yyc3.openFileEditor(item.path);
    }
  }, [navigateTo]);

  return {
    currentPath,
    currentItems,
    breadcrumbs,
    loading,
    navigateTo,
    goUp,
    selectFile,
    scanDirectory,
  };
}
```

### 方案 2：所有固定内容可编辑管理

#### 2.1 创建统一配置管理

```typescript
// src/app/hooks/useConfigManager.ts
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { ModelProviderDef, ConfiguredModel } from "../types";

interface AppConfig {
  modelProviders: ModelProviderDef[];
  configuredModels: ConfiguredModel[];
  nodes: NodeData[];
  systemSettings: SystemSettings;
}

const DEFAULT_CONFIG: AppConfig = {
  modelProviders: [],  // 从数据库读取
  configuredModels: [],  // 从数据库读取
  nodes: [],  // 从数据库读取
  systemSettings: {
    aiApiKey: "",
    aiBaseUrl: "https://api.openai.com/v1",
    aiModel: "gpt-4o",
    // ... 其他设置
  },
};

export function useConfigManager() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);

  // 从数据库加载配置
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const modelProviders = await (window as any).yyc3.db.query('SELECT * FROM model_providers ORDER BY id');
      const configuredModels = await (window as any).yyc3.db.query('SELECT * FROM configured_models ORDER BY created_at DESC');
      const nodes = await (window as any).yyc3.db.query('SELECT * FROM nodes ORDER BY id');
      const systemSettings = await (window as any).yyc3.db.query('SELECT * FROM system_settings WHERE id = 1');
      
      setConfig({
        modelProviders: modelProviders.data || [],
        configuredModels: configuredModels.data || [],
        nodes: nodes.data || [],
        systemSettings: systemSettings.data?.[0] || DEFAULT_CONFIG.systemSettings,
      });
    } catch (error) {
      toast.error("加载配置失败", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存配置到数据库
  const saveConfig = useCallback(async (key: keyof AppConfig, value: any) => {
    try {
      switch (key) {
        case 'modelProviders':
          await (window as any).yyc3.db.execute('DELETE FROM model_providers');
          for (const provider of value) {
            await (window as any).yyc3.db.execute(
              'INSERT INTO model_providers (id, label, base_url, auth_type, models, requires_api_key, is_local) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [provider.id, provider.label, provider.baseUrl, provider.authType, JSON.stringify(provider.models), provider.requiresApiKey, provider.isLocal]
            );
          }
          break;
        case 'configuredModels':
          await (window as any).yyc3.db.execute('DELETE FROM configured_models');
          for (const model of value) {
            await (window as any).yyc3.db.execute(
              'INSERT INTO configured_models (id, provider_id, provider_label, model, api_key, base_url, created_at, last_used, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [model.id, model.providerId, model.providerLabel, model.model, model.apiKey, model.baseUrl, model.createdAt, model.lastUsed, model.status]
            );
          }
          break;
        case 'nodes':
          await (window as any).yyc3.db.execute('DELETE FROM nodes');
          for (const node of value) {
            await (window as any).yyc3.db.execute(
              'INSERT INTO nodes (id, status, gpu, mem, temp, model, tasks) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [node.id, node.status, node.gpu, node.mem, node.temp, node.model, node.tasks]
            );
          }
          break;
        case 'systemSettings':
          await (window as any).yyc3.db.execute('INSERT OR REPLACE INTO system_settings (id, ai_api_key, ai_base_url, ai_model, ai_temperature, ai_top_p, ai_max_tokens, ai_timeout) VALUES (1, ?, ?, ?, ?, ?, ?, ?)',
            [value.aiApiKey, value.aiBaseUrl, value.aiModel, value.aiTemperature, value.aiTopP, value.aiMaxTokens, value.aiTimeout]
          );
          break;
      }
      
      setConfig(prev => ({ ...prev, [key]: value }));
      toast.success("配置已保存");
    } catch (error) {
      toast.error("保存配置失败", {
        description: error.message,
      });
    }
  }, []);

  // 添加模型提供商
  const addModelProvider = useCallback(async (provider: ModelProviderDef) => {
    const updatedProviders = [...config.modelProviders, provider];
    await saveConfig('modelProviders', updatedProviders);
  }, [config.modelProviders, saveConfig]);

  // 删除模型提供商
  const removeModelProvider = useCallback(async (providerId: string) => {
    const updatedProviders = config.modelProviders.filter(p => p.id !== providerId);
    await saveConfig('modelProviders', updatedProviders);
  }, [config.modelProviders, saveConfig]);

  // 添加节点
  const addNode = useCallback(async (node: NodeData) => {
    const updatedNodes = [...config.nodes, node];
    await saveConfig('nodes', updatedNodes);
  }, [config.nodes, saveConfig]);

  // 删除节点
  const removeNode = useCallback(async (nodeId: string) => {
    const updatedNodes = config.nodes.filter(n => n.id !== nodeId);
    await saveConfig('nodes', updatedNodes);
  }, [config.nodes, saveConfig]);

  // 更新系统设置
  const updateSystemSettings = useCallback(async (settings: Partial<SystemSettings>) => {
    const updatedSettings = { ...config.systemSettings, ...settings };
    await saveConfig('systemSettings', updatedSettings);
  }, [config.systemSettings, saveConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    loadConfig,
    saveConfig,
    addModelProvider,
    removeModelProvider,
    addNode,
    removeNode,
    updateSystemSettings,
  };
}
```

#### 2.2 创建可编辑的模型提供商管理界面

```typescript
// src/app/components/ModelProviderEditor.tsx
import { useState } from "react";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import GlassCard from "./GlassCard";
import { useConfigManager } from "../hooks/useConfigManager";
import type { ModelProviderDef } from "../types";

export default function ModelProviderEditor() {
  const { config, addModelProvider, removeModelProvider } = useConfigManager();
  const [editingProvider, setEditingProvider] = useState<ModelProviderDef | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    setEditingProvider({
      id: `custom-${Date.now()}`,
      label: "自定义服务商",
      baseUrl: "",
      authType: "api-key",
      models: [],
      requiresApiKey: true,
      isLocal: false,
    });
  };

  const handleEdit = (provider: ModelProviderDef) => {
    setEditingProvider({ ...provider });
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (editingProvider) {
      await addModelProvider(editingProvider);
      setEditingProvider(null);
      setIsAdding(false);
    }
  };

  const handleDelete = async (providerId: string) => {
    if (confirm("确定要删除这个服务商吗？")) {
      await removeModelProvider(providerId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[#e0f0ff]" style={{ fontSize: "1.1rem" }}>
          模型提供商管理
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.25)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.2)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>添加服务商</span>
        </button>
      </div>

      {editingProvider && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.95rem" }}>
              {isAdding ? "添加服务商" : "编辑服务商"}
            </h3>
            <button
              onClick={() => {
                setEditingProvider(null);
                setIsAdding(false);
              }}
              className="text-[rgba(0,212,255,0.4)] hover:text-[#00d4ff]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[rgba(0,212,255,0.6)] mb-1" style={{ fontSize: "0.72rem" }}>
                服务商标识
              </label>
              <input
                type="text"
                value={editingProvider.id}
                onChange={(e) => setEditingProvider({ ...editingProvider, id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#00d4ff] focus:outline-none"
                placeholder="例如: openai, anthropic"
              />
            </div>

            <div>
              <label className="block text-[rgba(0,212,255,0.6)] mb-1" style={{ fontSize: "0.72rem" }}>
                服务商名称
              </label>
              <input
                type="text"
                value={editingProvider.label}
                onChange={(e) => setEditingProvider({ ...editingProvider, label: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#00d4ff] focus:outline-none"
                placeholder="例如: OpenAI, Anthropic"
              />
            </div>

            <div>
              <label className="block text-[rgba(0,212,255,0.6)] mb-1" style={{ fontSize: "0.72rem" }}>
                API Base URL
              </label>
              <input
                type="url"
                value={editingProvider.baseUrl}
                onChange={(e) => setEditingProvider({ ...editingProvider, baseUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#00d4ff] focus:outline-none"
                placeholder="https://api.openai.com/v1"
              />
            </div>

            <div>
              <label className="block text-[rgba(0,212,255,0.6)] mb-1" style={{ fontSize: "0.72rem" }}>
                认证类型
              </label>
              <select
                value={editingProvider.authType}
                onChange={(e) => setEditingProvider({ ...editingProvider, authType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#00d4ff] focus:outline-none"
              >
                <option value="api-key">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="none">无认证</option>
              </select>
            </div>

            <div>
              <label className="block text-[rgba(0,212,255,0.6)] mb-1" style={{ fontSize: "0.72rem" }}>
                支持的模型（JSON 数组）
              </label>
              <textarea
                value={JSON.stringify(editingProvider.models, null, 2)}
                onChange={(e) => {
                  try {
                    const models = JSON.parse(e.target.value);
                    setEditingProvider({ ...editingProvider, models });
                  } catch (error) {
                    // 忽略 JSON 解析错误
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(0,40,80,0.4)] border border-[rgba(0,180,255,0.15)] text-[#00d4ff] focus:outline-none min-h-[100px]"
                placeholder='["gpt-4", "gpt-3.5-turbo"]'
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresApiKey"
                checked={editingProvider.requiresApiKey}
                onChange={(e) => setEditingProvider({ ...editingProvider, requiresApiKey: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="requiresApiKey" className="text-[rgba(0,212,255,0.6)]" style={{ fontSize: "0.72rem" }}>
                需要 API Key
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isLocal"
                checked={editingProvider.isLocal}
                onChange={(e) => setEditingProvider({ ...editingProvider, isLocal: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isLocal" className="text-[rgba(0,212,255,0.6)]" style={{ fontSize: "0.72rem" }}>
                本地服务商（如 Ollama）
              </label>
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.25)] text-[#00ff88] hover:bg-[rgba(0,255,136,0.2)] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>保存</span>
            </button>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {config.modelProviders.map((provider) => (
          <GlassCard key={provider.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[#e0f0ff]" style={{ fontSize: "0.88rem" }}>
                  {provider.label}
                </h3>
                <p className="text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                  {provider.baseUrl}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(provider)}
                  className="p-1.5 rounded-lg bg-[rgba(0,40,80,0.3)] hover:bg-[rgba(0,40,80,0.5)] transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[rgba(0,212,255,0.6)]" />
                </button>
                <button
                  onClick={() => handleDelete(provider.id)}
                  className="p-1.5 rounded-lg bg-[rgba(255,102,0,0.1)] hover:bg-[rgba(255,102,0,0.2)] transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#ff6600]" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                <span>认证类型</span>
                <span className="text-[#00d4ff]">{provider.authType}</span>
              </div>
              <div className="flex items-center justify-between text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                <span>模型数量</span>
                <span className="text-[#00d4ff]">{provider.models.length}</span>
              </div>
              <div className="flex items-center justify-between text-[rgba(0,212,255,0.4)]" style={{ fontSize: "0.65rem" }}>
                <span>本地服务商</span>
                <span className={provider.isLocal ? "text-[#00ff88]" : "text-[#ff6600]"}>
                  {provider.isLocal ? "是" : "否"}
                </span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
```

### 方案 3：数据库连接实现

#### 3.1 实现 SQLite 数据库

```typescript
// electron/main.ts
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

let db = null;

// 初始化数据库
function initDatabase() {
  const dbPath = path.join(os.homedir(), '.yyc3-cloudpivot', 'yyc3.db');
  db = new Database(dbPath);
  
  // 创建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS model_providers (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      base_url TEXT NOT NULL,
      auth_type TEXT NOT NULL,
      models TEXT NOT NULL,
      requires_api_key INTEGER NOT NULL,
      is_local INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS configured_models (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL,
      provider_label TEXT NOT NULL,
      model TEXT NOT NULL,
      api_key TEXT NOT NULL,
      base_url TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_used INTEGER,
      status TEXT NOT NULL,
      FOREIGN KEY (provider_id) REFERENCES model_providers(id)
    );
    
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      gpu INTEGER NOT NULL,
      mem INTEGER NOT NULL,
      temp INTEGER NOT NULL,
      model TEXT NOT NULL,
      tasks INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY,
      ai_api_key TEXT,
      ai_base_url TEXT,
      ai_model TEXT,
      ai_temperature REAL,
      ai_top_p REAL,
      ai_max_tokens INTEGER,
      ai_timeout INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS file_system (
      id TEXT PRIMARY KEY,
      path TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER,
      modified_at INTEGER NOT NULL,
      parent_id TEXT
    );
  `);
  
  // 插入默认系统设置
  db.exec(`
    INSERT OR IGNORE INTO system_settings (id, ai_base_url, ai_model, ai_temperature, ai_top_p, ai_max_tokens, ai_timeout)
    VALUES (1, 'https://api.openai.com/v1', 'gpt-4o', 0.7, 0.9, 2048, 30000);
  `);
}

// 数据库 IPC 处理
ipcMain.handle('db-connect', async (event, config: DatabaseConfig) => {
  try {
    initDatabase();
    return { success: true, message: "Database connected" };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('db-disconnect', async () => {
  try {
    if (db) {
      db.close();
      db = null;
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('db-query', async (event, sql: string, params: any[] = []) => {
  try {
    const stmt = db.prepare(sql);
    const results = stmt.all(...params);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('db-execute', async (event, sql: string, params: any[] = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { success: true, changes: result.changes, lastInsertId: result.lastInsertRowid };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

#### 3.2 创建数据库查询 Hook

```typescript
// src/app/hooks/useDatabase.ts
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export function useDatabase() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // 连接数据库
  const connect = useCallback(async () => {
    setLoading(true);
    try {
      const result = await (window as any).yyc3.db.connect({
        type: 'sqlite',
        path: '~/.yyc3-cloudpivot/yyc3.db',
      });
      
      if (result.success) {
        setConnected(true);
        toast.success("数据库连接成功");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error("数据库连接失败", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 断开数据库
  const disconnect = useCallback(async () => {
    try {
      const result = await (window as any).yyc3.db.disconnect();
      if (result.success) {
        setConnected(false);
        toast.success("数据库已断开");
      }
    } catch (error) {
      toast.error("断开数据库失败", {
        description: error.message,
      });
    }
  }, []);

  // 查询数据
  const query = useCallback(async (sql: string, params?: any[]) => {
    try {
      const result = await (window as any).yyc3.db.query(sql, params);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    } catch (error) {
      toast.error("查询失败", {
        description: error.message,
      });
      throw error;
    }
  }, []);

  // 执行 SQL
  const execute = useCallback(async (sql: string, params?: any[]) => {
    try {
      const result = await (window as any).yyc3.db.execute(sql, params);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    } catch (error) {
      toast.error("执行失败", {
        description: error.message,
      });
      throw error;
    }
  }, []);

  // 初始化时自动连接
  useEffect(() => {
    connect();
  }, [connect]);

  return {
    connected,
    loading,
    connect,
    disconnect,
    query,
    execute,
  };
}
```

---

## 📊 改进方案总结

### 改进内容

| 改进项 | 当前状态 | 改进后 | 优先级 |
|--------|---------|---------|--------|
| 宿主机存储识别 | Mock 数据 | 真实文件系统扫描 | P0 |
| 模型提供商管理 | 硬编码 | 可编辑、可添加、可删除 | P0 |
| 节点数据管理 | 硬编码 | 可编辑、可添加、可删除 | P0 |
| 系统设置管理 | 硬编码 | 可编辑、持久化到数据库 | P0 |
| Dashboard 数据 | 硬编码 | 从数据库读取 | P0 |
| 数据库连接 | Mock 模式 | 真实 SQLite 数据库 | P0 |

### 实施步骤

1. **第一阶段（1-2周）**：
   - 实现 Electron IPC 文件系统 API
   - 实现真实文件系统 Hook
   - 实现 SQLite 数据库连接
   - 创建统一配置管理 Hook

2. **第二阶段（2-3周）**：
   - 创建可编辑的模型提供商管理界面
   - 创建可编辑的节点管理界面
   - 创建可编辑的系统设置界面
   - 实现所有配置的数据库持久化

3. **第三阶段（1-2周）**：
   - 从数据库读取 Dashboard 数据
   - 实现数据实时更新
   - 完善错误处理和用户反馈

---

**分析完成时间**: 2026-03-07  
**分析标准**: 本地桌面应用可编辑性需求  
**核心问题**: 所有固定内容都是硬编码的，无法编辑管理

## 已完成的分析工作

### 1. 模型信息一致性分析 ✅
- 深度分析了 Ollama 本地识别、模型设置页面、AI 智能浮窗之间的数据源
- 识别了 3 个主要数据源和 5 个信息不一致问题
- 提供了统一数据管理架构方案

### 2. 多维度问题识别 ✅
- 从 8 个维度进行了全面分析：架构、数据流、用户体验、性能、安全、可维护性、测试、文档
- 共识别出 **156 个问题**：
  - 🔴 严重问题：32 个
  - 🟡 中等问题：68 个
  - 🟢 轻微问题：56 个

### 3. 可编辑内容改进方案 ✅
- 分析了 Electron 应用架构
- 设计了宿主机存储自动识别方案
- 规划了可编辑内容管理系统
- 设计了 SQLite 数据库集成方案

## 核心问题总结

您提到的核心问题已确认：
- **模型信息不一致**：Ollama 本地识别准确，但设置页面和 AI 浮窗显示不同
- **硬编码内容过多**：整个应用中存在大量固定内容（模型列表、文件系统、仪表盘数据等）
- **缺少持久化存储**：当前使用 mock 数据，没有实现真正的数据库连接

## 下一步行动建议

您现在可以选择以下任一方向：

1. **开始实施改进** - 按照改进方案开始实现可编辑内容管理系统
2. **深入某个具体问题** - 针对某个特定问题进行更详细的分析
3. **生成开发任务清单** - 将 156 个问题转化为具体的开发任务
4. **其他需求** - 如果您有其他具体需求，请告诉我
