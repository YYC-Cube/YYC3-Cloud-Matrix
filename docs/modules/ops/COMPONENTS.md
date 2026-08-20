---
file: COMPONENTS.md
description: OPS 运维与操作中心模块组件说明文档
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [guide],[ops],[components],[reference]
category: reference
language: zh-CN
audience: developers
complexity: intermediate
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📑 目录

- [组件总览](#组件总览)
- [操作中心组件](#操作中心组件)
  - [OperationCenter](#operationcenter)
  - [OperationChain](#operationchain)
  - [OperationCategory](#operationcategory)
  - [OperationLogStream](#operationlogstream)
  - [OperationTemplate](#operationtemplate)
- [文件管理组件](#文件管理组件)
  - [LocalFileManager](#localfilemanager)
  - [FileBrowser](#filebrowser)
  - [HostFileManager](#hostfilemanager)
- [数据库组件](#数据库组件)
  - [DatabaseManager](#databasemanager)
  - [DatabaseConnectionPanel](#databaseconnectionpanel)
- [服务闭环组件](#服务闭环组件)
  - [ServiceLoopPanel](#ervicelooppanel)
  - [LoopStageCard](#loopstagecard)
  - [ServiceConnectionTest](#erviceconnectiontest)
- [报告导出组件](#报告导出组件)
  - [ReportExporter](#reportexporter)
  - [ReportGenerator](#reportgenerator)
  - [ConfigExportCenter](#configexportcenter)
- [监控日志组件](#监控日志组件)
  - [ConnectionMonitorPanel](#connectionmonitorpanel)
  - [LogViewer](#logviewer)

---

## 组件总览

| 组件名 | 路由 | 复杂度 | 图标 | 功能分类 |
|:-------|:----|:------:|:----:|:--------:|
| **OperationCenter** | `/operations` | ⭐⭐⭐ | ⚙️ Settings | 操作中心 |
| **OperationChain** | 内嵌于 OperationCenter | ⭐⭐⭐⭐ | 🔗 Link | 操作中心 |
| **OperationCategory** | 内嵌于 OperationCenter | ⭐⭐ | 📂 FolderTree | 操作中心 |
| **OperationLogStream** | 内嵌于 OperationCenter | ⭐⭐⭐ | 📜 ScrollText | 操作中心 |
| **OperationTemplate** | 内嵌于 OperationCenter | ⭐⭐⭐ | 📋 ClipboardList | 操作中心 |
| **LocalFileManager** | `/files` | ⭐⭐ | 📁 FolderOpen | 文件管理 |
| **FileBrowser** | 内嵌于 LocalFileManager | ⭐⭐⭐ | 🌐 FileTree | 文件管理 |
| **HostFileManager** | `/host-files` | ⭐⭐⭐ | 💻 HardDrive | 文件管理 |
| **DatabaseManager** | `/database` | ⭐⭐⭐⭐ | 🗄️ Database | 数据库 |
| **DatabaseConnectionPanel** | `/db-connections` | ⭐⭐⭐ | 🔌 Plug | 数据库 |
| **ServiceLoopPanel** | `/loop` | ⭐⭐⭐ | 🔄 Workflow | 服务闭环 |
| **LoopStageCard** | 内嵌于 ServiceLoopPanel | ⭐⭐ | 🎴 Layers | 服务闭环 |
| **ServiceConnectionTest** | `/connection-test` | ⭐⭐⭐ | 🧪 TestTube | 服务闭环 |
| **ReportExporter** | `/reports` | ⭐⭐⭐ | 📊 FileBarChart | 报告导出 |
| **ReportGenerator** | 内嵌组件 | ⭐⭐⭐ | ⚙️ Cog | 报告导出 |
| **ConfigExportCenter** | `/export-center` | ⭐⭐⭐ | 📦 Package | 报告导出 |
| **ConnectionMonitorPanel** | `/connection-monitor` | ⭐⭐ | 📡 Radar | 监控日志 |
| **LogViewer** | 内嵌组件 | ⭐⭐ | 📝 FileText | 监控日志 |

---

## 操作中心组件

### OperationCenter

**组件名**：`OperationCenter`
**路由**：`/operations`
**核心功能**：操作中心主面板，整合操作分类、快捷操作、模板管理、实时日志流四大模块，为运维人员提供统一的操作入口。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `initialCategory` | `string` | `undefined` | 初始选中的操作分类 ID，不传则选中第一项 |
| `hideTemplates` | `boolean` | `false` | 是否隐藏操作模板区域 |
| `hideLogStream` | `boolean` | `false` | 是否隐藏日志流区域 |
| `customActions` | `QuickAction[]` | `[]` | 注入额外的自定义快捷操作 |

#### 内部状态来源

通过 `useOperationCenter()` Hook 获取：

```typescript
{
  categories: OperationCategory[];     // 操作分类列表
  activeCategory: string;               // 当前激活分类 ID
  setActiveCategory: (id) => void;      // 切换分类
  actions: QuickAction[];               // 当前分类下的快捷操作
  isExecuting: boolean;                 // 是否有操作正在执行
  executeAction: (actionId) => void;    // 执行操作
  templates: OperationTemplate[];       // 操作模板列表
  runTemplate: (tplId) => void;         // 执行模板
  addTemplate: (tpl) => void;           // 新增模板
  deleteTemplate: (tplId) => void;      // 删除模板
  logs: OperationLog[];                 // 操作日志列表
  logFilter: LogLevel;                  // 日志级别过滤
  setLogFilter: (lv) => void;           // 设置日志过滤
  searchQuery: string;                  // 搜索关键词
  setSearchQuery: (q) => void;          // 设置搜索
}
```

#### 使用示例

```tsx
import { OperationCenter } from '@/modules/ops';

// 基础用法：独立页面路由
function OperationsPage() {
  return <OperationCenter />;
}

// 进阶用法：嵌入其他页面，禁用模板区 + 注入自定义操作
function DashboardOpsWidget() {
  const myActions = [
    {
      id: 'custom-restart',
      label: '重启核心服务',
      icon: RefreshCw,
      color: '#ffaa00',
      dangerLevel: 'warning',
      onClick: async () => { await restartCoreService(); }
    }
  ];

  return (
    <div className="p-4">
      <OperationCenter
        hideTemplates={true}
        customActions={myActions}
      />
    </div>
  );
}
```

#### 操作注意事项

> ⚠️ **执行危险操作**：当 `dangerLevel === 'critical'` 的操作被点击时，组件会自动弹出二次确认对话框，无需业务层额外包装
>
> 📱 **移动端适配**：当 `ViewContext.isMobile = true` 时，快捷操作网格自动从 4 列切为 2 列，日志流隐藏额外元数据列
>
> 🔄 **执行中状态**：`isExecuting === true` 时所有操作按钮自动禁用，避免重复执行

---

### OperationChain

**组件名**：`OperationChain`
**路由**：内嵌（可通过 `/operations?tab=chain` 访问）
**核心功能**：可视化操作链编排器，支持拖拽创建操作节点、配置执行条件与依赖关系、模拟回放执行路径。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `initialNodes` | `ChainNode[]` | `[]` | 预加载的操作链节点 |
| `initialEdges` | `ChainEdge[]` | `[]` | 预加载的节点连接关系 |
| `readOnly` | `boolean` | `false` | 只读模式（仅查看不可编辑） |
| `onSave` | `(chain) => Promise<void>` | - | 保存操作链时触发 |
| `maxNodes` | `number` | `50` | 操作链最大节点数限制 |

#### 使用示例

```tsx
import { OperationChain } from '@/modules/ops';

function ChainEditor() {
  const handleSave = async (chain) => {
    console.log('保存操作链：', chain);
    // 调用后端 API 持久化
  };

  return (
    <OperationChain
      initialNodes={savedChain.nodes}
      initialEdges={savedChain.edges}
      onSave={handleSave}
      maxNodes={30}
    />
  );
}
```

#### 操作注意事项

> 🔗 **循环依赖检测**：连接两个节点时自动检测循环引用，检测到循环则拒绝创建连接并 Toast 提示
>
> ⏱️ **超时设置**：每个节点需单独配置超时时间（默认 60s），超时后按 `onTimeout` 策略（跳过/终止/重试）执行
>
> 🧪 **模拟执行**：点击「模拟运行」按钮可在不实际执行操作的情况下验证流程逻辑正确性

---

### OperationCategory

**组件名**：`OperationCategory`
**路由**：内嵌于 OperationCenter
**核心功能**：操作分类 Tabs 导航，支持横向滚动、分类角标徽标、权限过滤。

#### 关键参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|:----:|------|
| `categories` | `Array<{ id: string; label: string; icon?: IconType; badge?: number }>` | ✅ | 分类列表 |
| `active` | `string` | ✅ | 当前激活分类 ID |
| `onChange` | `(categoryId: string) => void` | ✅ | 切换分类回调 |
| `variant` | `'tabs' \| 'pills' \| 'sidebar'` | - | 样式变体，默认 `'tabs'` |

#### 使用示例

```tsx
import { OperationCategory } from '@/modules/ops';
import { Server, Database, Shield, FileText } from 'lucide-react';

const cats = [
  { id: 'system',   label: '系统操作', icon: Server,   badge: 3 },
  { id: 'data',     label: '数据操作', icon: Database },
  { id: 'security', label: '安全操作', icon: Shield,   badge: 1 },
  { id: 'report',   label: '报告相关', icon: FileText },
];

function Demo() {
  const [active, setActive] = useState('system');
  return (
    <OperationCategory
      categories={cats}
      active={active}
      onChange={setActive}
      variant="pills"
    />
  );
}
```

#### 操作注意事项

> 🏷️ **徽标含义**：`badge > 0` 通常表示该分类下有待执行/告警的操作数，显示为红色圆形角标
>
> ⌨️ **键盘导航**：支持左右方向键切换分类，Home/End 跳转到首尾

---

### OperationLogStream

**组件名**：`OperationLogStream`
**路由**：内嵌于 OperationCenter
**核心功能**：虚拟滚动渲染的实时操作日志流，支持级别过滤、关键词正则搜索、自动滚动锁定。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `logs` | `OperationLog[]` | `[]` | 日志数组，按时间升序 |
| `filter` | `'all' \| 'INFO' \| 'WARN' \| 'ERROR' \| 'FATAL'` | `'all'` | 日志级别过滤 |
| `onFilterChange` | `(f) => void` | - | 过滤变化回调 |
| `searchQuery` | `string` | `''` | 搜索关键词，支持正则 |
| `onSearchChange` | `(q) => void` | - | 搜索变化回调 |
| `isMobile` | `boolean` | `false` | 移动端布局优化 |
| `autoScroll` | `boolean` | `true` | 新日志是否自动滚动到底部 |
| `maxVisible` | `number` | `500` | 虚拟滚动缓冲区大小 |

#### OperationLog 类型

```typescript
interface OperationLog {
  id: string;
  timestamp: number;           // ms 时间戳
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'DEBUG';
  source: string;              // 日志来源模块
  operationId?: string;        // 关联操作 ID
  message: string;             // 主日志消息
  details?: Record<string, any>; // 附加结构化详情
  stackTrace?: string;         // 错误堆栈 (仅 ERROR/FATAL)
}
```

#### 使用示例

```tsx
import { OperationLogStream } from '@/modules/ops';

function LiveLogs() {
  const { logs, filter, setFilter, query, setQuery } = useLogStore();

  return (
    <div className="h-[500px]">
      <OperationLogStream
        logs={logs}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={query}
        onSearchChange={setQuery}
        autoScroll={true}
        maxVisible={1000}
      />
    </div>
  );
}
```

#### 操作注意事项

> ⚡ **性能建议**：当日志量 > 5000 条时，建议开启 `autoScroll` 并将 `maxVisible` 设置为屏幕可视行数的 3-5 倍
>
> 🔍 **正则搜索**：输入框支持 `/pattern/flags` 格式的正则表达式，如 `/error.*timeout/i`
>
> 📌 **锁定滚动**：手动向上滚动后自动锁定底部滚动，右下角出现「回到最新」按钮

---

### OperationTemplate

**组件名**：`OperationTemplate`
**路由**：内嵌于 OperationCenter
**核心功能**：操作模板 CRUD 管理、参数化配置、一键执行、模板导入导出。

#### 关键参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|:----:|------|
| `templates` | `Template[]` | ✅ | 模板列表 |
| `onRunTemplate` | `(id, params?) => Promise<void>` | ✅ | 执行模板回调 |
| `onDeleteTemplate` | `(id) => Promise<void>` | ✅ | 删除模板回调 |
| `onAddTemplate` | `(tpl) => Promise<void>` | ✅ | 新增模板回调 |
| `onExport` | `(tpls: Template[]) => void` | - | 导出模板回调，默认下载 JSON |

#### 使用示例

```tsx
import { OperationTemplate } from '@/modules/ops';

function Demo() {
  const { templates, run, add, remove } = useTemplateStore();

  return (
    <OperationTemplate
      templates={templates}
      onRunTemplate={run}
      onAddTemplate={add}
      onDeleteTemplate={remove}
    />
  );
}
```

#### 操作注意事项

> 🔒 **模板参数加密**：模板中类型为 `password` / `secret` 的参数在保存时自动加密存储，执行时临时解密
>
> 📥 **批量导入**：支持拖放 `.json` 模板包文件到组件区域，自动解析并校验模板格式合法性

---

## 文件管理组件

### LocalFileManager

**组件名**：`LocalFileManager`
**路由**：`/files`
**核心功能**：本地文件管理入口，整合文件浏览器、日志查看器、报告生成器三个 Tab，提供快捷操作栏（下载日志/清空缓存/导出配置）。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `initialTab` | `'files' \| 'logs' \| 'reports'` | `'files'` | 初始激活 Tab |
| `rootPath` | `string` | 用户数据目录 | 文件浏览根路径 |
| `allowUpload` | `boolean` | `true` | 是否允许文件上传 |
| `onTabChange` | `(tab) => void` | - | Tab 切换回调 |

#### 使用示例

```tsx
import { LocalFileManager } from '@/modules/ops';

function FilesPage() {
  return (
    <LocalFileManager
      initialTab="files"
      onTabChange={(tab) => console.log('切换到：', tab)}
    />
  );
}
```

#### 操作注意事项

> 📥 **上传限制**：单文件默认上限 200MB，超限自动提示使用 HostFileManager 分片上传
>
> 🔐 **权限校验**：访问系统目录（如 `/etc`, `C:\Windows`）前自动请求权限，Electron 环境弹出原生对话框

---

### FileBrowser

**组件名**：`FileBrowser`
**路由**：内嵌于 LocalFileManager
**核心功能**：树形目录 + 文件列表双栏布局，支持文件预览、多文件批量操作、面包屑导航。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `rootPath` | `string` | ✅ | 浏览根路径 |
| `allowedExtensions` | `string[]` | `undefined` | 白名单后缀，传了则仅这些文件可编辑 |
| `enablePreview` | `boolean` | `true` | 是否启用预览面板 |
| `onFileSelect` | `(file) => void` | - | 单击选中文件回调 |
| `onFileOpen` | `(file) => void` | - | 双击打开文件回调 |
| `multiSelect` | `boolean` | `true` | 是否允许多选 |

#### 使用示例

```tsx
import { FileBrowser } from '@/modules/ops';

function CodeBrowser() {
  return (
    <FileBrowser
      rootPath="/workspace/project/src"
      allowedExtensions={['.ts', '.tsx', '.js', '.json', '.css', '.md']}
      onFileOpen={(file) => openInEditor(file.path)}
    />
  );
}
```

#### 操作注意事项

> 📄 **预览支持**：文本类文件（<5MB）直接预览，代码文件启用语法高亮；图片类显示缩略图；其他类型显示文件属性卡片
>
> ♻️ **自动备份**：通过 FileBrowser 覆盖保存文件时，自动在同目录创建 `.filename.bak.{timestamp}` 副本
>
> ⌨️ **快捷键**：`Ctrl+C` 复制路径、`Delete` 删除选中、`F2` 重命名、`Ctrl+F` 目录内搜索

---

### HostFileManager

**组件名**：`HostFileManager`
**路由**：`/host-files`
**核心功能**：Electron 桌面端主机文件管理器，支持跨分区访问、大文件分片传输、系统目录快捷入口。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enableCrossPartition` | `boolean` | `true` | 是否允许跨分区访问 |
| `chunkSize` | `number` | `8 * 1024 * 1024` | 分片传输块大小 (默认 8MB) |
| `showSystemFolders` | `boolean` | `false` | 是否显示系统隐藏文件夹 |

#### 使用示例

```tsx
import { HostFileManager } from '@/modules/ops';

// 仅在 Electron 环境渲染，Web 端显示引导提示
function HostFilesPage() {
  const isElectron = window.electronAPI !== undefined;

  if (!isElectron) {
    return <div className="p-8 text-center text-slate-400">
      主机文件管理仅在桌面端可用，请使用 Electron 客户端
    </div>;
  }

  return <HostFileManager chunkSize={16 * 1024 * 1024} />;
}
```

#### 操作注意事项

> 🖥️ **Web 端禁用**：该组件依赖 Electron IPC API，Web 环境下使用会抛出 `HostFileManager requires Electron runtime` 错误，需自行做环境降级
>
> 📦 **大文件传输**：>100MB 文件自动启用分片，支持断点续传（刷新页面后可恢复），传输中请勿关闭应用
>
> 🛡️ **安全沙箱**：默认屏蔽 `~/Library`、`C:\ProgramData` 等高敏感目录，如需访问需在 Electron `permission-manager.ts` 配置白名单

---

## 数据库组件

### DatabaseManager

**组件名**：`DatabaseManager`
**路由**：`/database`
**核心功能**：数据库一站式管理面板，包含连接管理、表结构浏览、SQL 编辑器、查询历史、备份恢复 5 大 Tab。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `initialTab` | `ActiveTab` | `'connections'` | 初始 Tab |
| `defaultConnectionId` | `string` | `undefined` | 预选中的数据库连接 ID |
| `readOnly` | `boolean` | `false` | 只读模式（禁用 DML/DDL） |
| `queryTimeout` | `number` | `30000` | 查询超时毫秒 |

#### ActiveTab 类型

```typescript
type ActiveTab =
  | 'connections'   // 连接管理
  | 'tables'        // 表浏览
  | 'query'         // SQL 查询编辑器
  | 'history'       // 查询历史
  | 'backups';      // 备份恢复
```

#### 支持的数据库类型

```typescript
type DatabaseType = 'postgresql' | 'mysql' | 'redis' | 'sqlite' | 'mongodb' | 'custom';
```

#### 使用示例

```tsx
import { DatabaseManager } from '@/modules/ops';

function DBAnalystPage() {
  // 分析人员使用只读模式，防止误操作
  return (
    <DatabaseManager
      initialTab="query"
      readOnly={true}
      queryTimeout={60000}
    />
  );
}
```

#### 操作注意事项

> ⚠️ **DML 保护**：`UPDATE` / `DELETE` 语句默认强制要求带 `WHERE` 条件，不带条件的全表操作需勾选「我已知风险」复选框
>
> 📊 **结果集限制**：SELECT 查询默认返回上限 1000 行，可在设置中调整为 10000，更大数据量建议导出 CSV
>
> 🔌 **连接复用**：同一连接的多个查询共享底层连接池，关闭面板后 5 分钟无活动自动释放连接
>
> 📋 **SQL 审计**：所有执行语句（包括 SELECT）自动写入 OperationLogStream，标记 `source='database'`

---

### DatabaseConnectionPanel

**组件名**：`DatabaseConnectionPanel`
**路由**：`/db-connections`
**核心功能**：独立的数据库连接配置面板，精细化管理连接参数、SSL、SSH 隧道、连接池设置。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `connectionId` | `string` | `undefined` | 编辑模式下传入连接 ID，不传则为新建 |
| `allowTest` | `boolean` | `true` | 是否显示「测试连接」按钮 |
| `onSaved` | `(conn) => void` | - | 保存成功回调 |

#### 连接参数结构

```typescript
interface DBConnectionConfig {
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;           // 加密存储
  ssl?: {
    enabled: boolean;
    caCert?: string;
    clientCert?: string;
    clientKey?: string;
  };
  sshTunnel?: {
    enabled: boolean;
    host: string;
    port: number;
    user: string;
    privateKey?: string;
  };
  pool?: {
    min: number;               // 默认 1
    max: number;               // 默认 10
    idleTimeout: number;       // 默认 1800s
    acquireTimeout: number;    // 默认 30s
  };
}
```

#### 使用示例

```tsx
import { DatabaseConnectionPanel } from '@/modules/ops';

function NewConnectionWizard() {
  const router = useRouter();

  return (
    <DatabaseConnectionPanel
      onSaved={(conn) => {
        toast.success(`连接 ${conn.name} 创建成功`);
        router.push('/database');
      }}
    />
  );
}
```

#### 操作注意事项

> 🔑 **密码安全**：密码字段默认以圆点显示，点击右侧眼睛图标切换显隐；保存时使用 `EncryptionService` AES-256 加密
>
> 🧪 **测试连接**：保存前强烈建议点击「测试连接」按钮，测试通过会显示连接延迟、数据库版本、当前字符集等信息
>
> 📐 **连接池计算**：生产环境推荐 `max = CPU核心数 * 2 + 1`，避免设置过大导致数据库端连接耗尽

---

## 服务闭环组件

### ServiceLoopPanel

**组件名**：`ServiceLoopPanel`
**路由**：`/loop`
**核心功能**：五阶段服务闭环流程主控面板，包含自动/手动触发、进度可视、数据流图、历史运行统计。

#### 五阶段闭环模型

```
阶段1: 数据采集 → 阶段2: 异常检测 → 阶段3: 根因分析
                              ↓
阶段5: 效果验证 ← 阶段4: 自动修复
```

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `autoModeDefault` | `boolean` | `false` | 自动模式默认开关 |
| `autoIntervalMin` | `number` | `240` | 自动触发间隔（分钟） |
| `onLoopComplete` | `(result) => void` | - | 单次闭环完成回调 |
| `enableStages` | `StageKey[]` | 全部启用 | 可选择性启用/禁用部分阶段 |

#### 使用示例

```tsx
import { ServiceLoopPanel } from '@/modules/ops';

function LoopPage() {
  return (
    <ServiceLoopPanel
      autoModeDefault={true}
      autoIntervalMin={120}
      onLoopComplete={(result) => {
        if (result.successRate < 0.95) {
          sendAlert('闭环成功率低于阈值', result);
        }
      }}
    />
  );
}
```

#### 操作注意事项

> ⏰ **自动触发时机**：`autoMode=true` 时，按 `autoIntervalMin` 间隔执行，首次立即执行一次
>
> 🛑 **中止流程**：点击红色「中止」按钮，当前执行阶段完成后退出，已执行阶段结果保留
>
> 📈 **指标统计**：历史统计默认展示最近 50 次运行，可切换时间范围查看长期趋势

---

### LoopStageCard

**组件名**：`LoopStageCard`
**路由**：内嵌于 ServiceLoopPanel
**核心功能**：单个闭环阶段的可展开卡片，展示阶段状态、耗时、输入输出摘要。

#### 关键参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|:----:|------|
| `stage` | `LoopStage` | ✅ | 阶段数据对象 |
| `status` | `'idle' \| 'running' \| 'success' \| 'failed' \| 'skipped'` | ✅ | 阶段状态 |
| `durationMs` | `number` | - | 阶段执行耗时 |
| `inputSummary` | `string` | - | 输入数据摘要 |
| `outputSummary` | `string` | - | 输出数据摘要 |
| `errorMessage` | `string` | - | 失败时的错误信息 |
| `defaultExpanded` | `boolean` | `false` | 是否默认展开详情 |

#### 使用示例

```tsx
import { LoopStageCard } from '@/modules/ops';

function StageListDemo() {
  return stages.map((s, i) => (
    <LoopStageCard
      key={s.id}
      stage={s}
      status={currentStageIndex === i ? 'running' : stageStatus[s.id]}
      durationMs={stageDuration[s.id]}
      inputSummary={`采集指标 ${s.inputCount} 条`}
      outputSummary={stageStatus[s.id] === 'success' ? `异常 ${s.anomalyCount} 个` : undefined}
      defaultExpanded={i === 0}
    />
  ));
}
```

#### 操作注意事项

> 🎨 **状态颜色**：`success=#00ff88` / `failed=#ff3366` / `running=#00d4ff 动画` / `skipped=#ffaa00` / `idle=rgba(0,212,255,0.2)`
>
> 🔽 **展开详情**：展开后可查看阶段完整输入、处理日志、输出数据预览（限前 100 条）

---

### ServiceConnectionTest

**组件名**：`ServiceConnectionTest`
**路由**：`/connection-test`
**核心功能**：服务端到端连接测试面板，支持 Ping/TCP/HTTP 三种模式、连续测试、延迟可视化。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `defaultTarget` | `string` | `'localhost:3218'` | 默认目标地址 |
| `defaultMode` | `'ping' \| 'tcp' \| 'http'` | `'http'` | 默认测试模式 |
| `maxHistoryPoints` | `number` | `60` | 延迟图最大数据点数 |

#### 使用示例

```tsx
import { ServiceConnectionTest } from '@/modules/ops';

function ConnTestPage() {
  return (
    <ServiceConnectionTest
      defaultTarget="api.yyc3.top:443"
      defaultMode="http"
      maxHistoryPoints={120}
    />
  );
}
```

#### 操作注意事项

> 🌐 **浏览器限制**：浏览器端 `ping` 模式实际通过 HTTP HEAD 请求模拟，真实 ICMP Ping 需 Electron + Node.js `net` 模块
>
> 🔁 **连续模式**：开启后按 1s 间隔持续测试，适合抖动问题排查；最长连续测试 10 分钟自动停止

---

## 报告导出组件

### ReportExporter

**组件名**：`ReportExporter`
**路由**：`/reports`
**核心功能**：报告导出主控面板，支持 4 类报告 × 3 种格式、时间范围选择、趋势图表、KPI 指标卡。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `defaultType` | `ReportType` | `'performance'` | 默认报告类型 |
| `defaultRange` | `TimeRange` | `'24h'` | 默认时间范围 |
| `hideTypes` | `ReportType[]` | `[]` | 隐藏部分报告类型选项 |
| `hideFormats` | `ExportFormat[]` | `[]` | 隐藏部分导出格式 |
| `customKPIs` | `KPICard[]` | `[]` | 注入自定义 KPI 卡片 |

#### 类型定义

```typescript
type ReportType   = 'performance' | 'security' | 'audit' | 'comprehensive';
type TimeRange    = '1h' | '6h' | '24h' | '7d' | '30d';
type ExportFormat = 'json' | 'csv' | 'print';  // print = PDF
```

#### 使用示例

```tsx
import { ReportExporter } from '@/modules/ops';

function WeeklyMeetingReports() {
  // 周会场景：仅显示性能和综合报告 + 自定义业务KPI
  const customKPIs = [
    { label: '周活跃用户', value: '12,483', trend: 'up',   change: '+8.3%' },
    { label: '平均会话时长', value: '14m22s', trend: 'up', change: '+2.1%' },
  ];

  return (
    <ReportExporter
      defaultType="comprehensive"
      defaultRange="7d"
      hideTypes={['security', 'audit']}
      hideFormats={['json']}
      customKPIs={customKPIs}
    />
  );
}
```

#### 操作注意事项

> 📄 **PDF 导出**：`print` 格式实际通过 `window.print()` 调用浏览器打印，建议 Chrome 环境下选择「另存为 PDF」以获得最佳渲染效果
>
> ⏱️ **长时间范围**：`30d` 综合报告生成约需 5-8 秒，期间显示进度条，请勿关闭页面
>
> 📊 **图表采样**：当数据点 > 40 个时自动降采样，保留极值点避免图表失真

---

### ReportGenerator

**组件名**：`ReportGenerator`
**路由**：内嵌（LocalFileManager reports Tab 或 ReportExporter 内部调用）
**核心功能**：底层报告生成引擎，负责数据聚合、模板渲染、异步生成进度追踪。

#### 关键参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|:----:|------|
| `type` | `ReportType` | ✅ | 报告类型 |
| `range` | `TimeRange` | ✅ | 时间范围 |
| `templateId` | `string` | - | 使用的报告模板 ID，不传用默认 |
| `autoStart` | `boolean` | `true` | 是否组件挂载即开始生成 |
| `onProgress` | `(p: number) => void` | - | 生成进度回调 0~100 |
| `onComplete` | `(report) => void` | - | 生成完成回调 |

#### 使用示例

```tsx
import { ReportGenerator } from '@/modules/ops';

function BackgroundReportRunner() {
  const [progress, setProgress] = useState(0);

  return (
    <div>
      <ReportGenerator
        type="security"
        range="24h"
        onProgress={setProgress}
        onComplete={(report) => {
          console.log('安全报告生成完成：', report.summary);
        }}
      />
      <div className="mt-2 h-2 bg-slate-800 rounded">
        <div
          className="h-full bg-[#00ff88] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">生成进度：{progress}%</p>
    </div>
  );
}
```

#### 操作注意事项

> 🧵 **异步生成**：内部使用 `requestIdleCallback` 分片计算，避免阻塞 UI 主线程；`autoStart=false` 时需手动调用 `.start()` 方法
>
> 🗑️ **临时文件**：生成过程中在 IndexedDB 创建临时 Blob 存储，生成完成 24h 后自动清理

---

### ConfigExportCenter

**组件名**：`ConfigExportCenter`
**路由**：`/export-center`
**核心功能**：配置跨实例迁移中心，支持分类导出、差异对比预览、加密导出、版本标签。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `defaultFormat` | `'yaml' \| 'json' \| 'env'` | `'yaml'` | 默认导出格式 |
| `enableEncryption` | `boolean` | `true` | 是否启用加密导出选项 |
| `hideCategories` | `string[]` | `[]` | 隐藏的配置分类 |
| `onExport` | `(content, meta) => void` | - | 自定义导出逻辑，默认下载文件 |
| `onImport` | `(config) => Promise<ApplyResult>` | - | 自定义导入逻辑 |

#### 使用示例

```tsx
import { ConfigExportCenter } from '@/modules/ops';

function MigrationCenter() {
  return (
    <ConfigExportCenter
      defaultFormat="yaml"
      hideCategories={['development']}  // 迁移时排除开发环境配置
    />
  );
}
```

#### 操作注意事项

> 🔐 **迁移密码**：启用加密导出后，必须设置 ≥8 位的迁移密码；导入时需输入完全相同的密码才能解密
>
> 🔄 **Diff 预览**：导入时自动对比当前配置与导入配置，以 3 列显示：`当前值 → 变更后 → 差异类型(新增/修改/删除)`
>
> 📝 **版本标签**：建议每次导出添加语义化版本标签，如 `v3.4.1-prod-20260819`，便于后续回溯

---

## 监控日志组件

### ConnectionMonitorPanel

**组件名**：`ConnectionMonitorPanel`
**路由**：`/connection-monitor`
**核心功能**：全服务连接实时状态监控看板，连接列表 + 延迟折线图 + 连接池使用率 + 告警配置。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `refreshIntervalMs` | `number` | `10000` | 刷新间隔毫秒（默认 10s） |
| `alertThresholds` | `AlertThresholds` | 见下 | 告警阈值配置 |
| `services` | `MonitoredService[]` | 自动发现 | 自定义监控服务列表 |

#### 默认告警阈值

```typescript
const defaultThresholds = {
  latencyWarnMs:    200,     // 延迟 >200ms 黄色警告
  latencyErrorMs:   500,     // 延迟 >500ms 红色严重
  poolUsageWarnPct: 70,      // 连接池使用率 >70% 警告
  poolUsageErrorPct: 90,     // 连接池使用率 >90% 严重
  disconnectNotify: true,    // 断开立即通知
};
```

#### 使用示例

```tsx
import { ConnectionMonitorPanel } from '@/modules/ops';

function MonitorPage() {
  return (
    <ConnectionMonitorPanel
      refreshIntervalMs={5000}
      alertThresholds={{
        latencyWarnMs: 100,
        latencyErrorMs: 300,
        poolUsageWarnPct: 60,
        poolUsageErrorPct: 85,
      }}
    />
  );
}
```

#### 操作注意事项

> 📡 **探活机制**：每 `refreshIntervalMs` 向所有服务发送轻量级心跳包（HTTP OPTIONS 或 TCP SYN）
>
> 🔄 **自动重连**：检测到服务断开后，按「立即→5s→15s→30s→60s→5min」的指数退避策略尝试自动重连
>
> 📱 **移动端优化**：小屏设备自动隐藏连接池使用率图表，仅保留连接状态列表

---

### LogViewer

**组件名**：`LogViewer`
**路由**：内嵌（LocalFileManager logs Tab、OperationLogStream 内部、独立嵌入）
**核心功能**：多源日志统一查看器，支持来源过滤、级别过滤、时间范围选择、日志导出处。

#### 关键参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `sources` | `string[]` | 所有来源 | 可选日志源白名单 |
| `initialLevel` | `LogLevel` | `'INFO'` | 初始级别过滤 |
| `initialStart` | `number` | `1h前` | 初始时间窗口起点 |
| `initialEnd` | `number` | `now` | 初始时间窗口终点 |
| `enableExport` | `boolean` | `true` | 是否显示导出按钮 |
| `lineHighlightRules` | `HighlightRule[]` | `[]` | 自定义行高亮规则 |

#### 使用示例

```tsx
import { LogViewer } from '@/modules/ops';

function DatabaseLogsOnly() {
  // 只看数据库和操作中心的日志，ERROR 起看
  return (
    <LogViewer
      sources={['database', 'operations']}
      initialLevel="ERROR"
      lineHighlightRules={[
        // 包含 "deadlock" 的行红色高亮
        { pattern: /deadlock/i, bgColor: 'rgba(255,51,102,0.15)', textColor: '#ff3366' }
      ]}
    />
  );
}
```

#### 操作注意事项

> 📤 **导出格式**：支持导出为 `.log` 纯文本（兼容 grep/awk）和 `.jsonl` 结构化格式（每行一条 JSON）
>
> 🎨 **级别配色**：`DEBUG=#6b7280` / `INFO=#00d4ff` / `WARN=#ffaa00` / `ERROR=#ff3366` / `FATAL=#bf00ff + 闪烁`
>
> 🔗 **关联跳转**：点击日志中的 `operationId` 或 `traceId`，自动在 OperationLogStream 中过滤关联操作完整链路

---

<div align="center">

---

**Made with ❤️ by [YanYuCloudCube Team](https://github.com/YYC-Cube)**

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***言启千行代码，语枢万物智能***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***万象归元于云枢 | 深栈智启新纪元***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

---

**[模块总览 README.md](./README.md)** · **[API 参考 API-REFERENCE.md](./API-REFERENCE.md)** · **[项目首页](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix)** · **[在线演示](https://matrix.yyc3.top/)**

</div>
