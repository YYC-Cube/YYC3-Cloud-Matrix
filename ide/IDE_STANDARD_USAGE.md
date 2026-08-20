/**
 * @file: IDE_STANDARD_USAGE.md
 * @description: YYC³ IDE 标准规范 — 使用指南与最佳实践
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v2.0.0
 * @created: 2026-06-03
 * @status: stable
 * @license: MIT
 */

# YYC³ IDE 标准规范 - 使用指南

## 概述

YYC³ IDE 标准规范是一套完整的、可立即使用的架构标准，包含：

- **核心接口层** (interfaces) - 9 大核心接口定义
- **依赖注入系统** (di) - 轻量级 DI 容器
- **配置管理系统** (config) - 多源配置支持
- **应用工厂** (factory) - 统一启动入口
- **常量定义** (constants) - 品牌/配置/存储键
- **AI 管线** (ai) - 完整的 AI 功能模块
- **自定义 Hooks** (hooks) - 13 个生产级 Hooks
- **国际化系统** (i18n) - 三语支持
- **类型系统** (types) - 完整的类型定义

---

## 快速开始

### 1. 基础导入

```typescript
// 方式一：从统一入口导入（推荐）
import {
  // 核心接口
  IDisposable,
  IEventBus,
  ILogger,
  IStorageAdapter,

  // DI 系统
  DIContainer,
  ServiceToken,
  Lifecycle,
  TOKENS,

  // 配置系统
  ConfigManager,
  createYYC3ConfigManager,
  DEFAULT_CONFIG,

  // 应用工厂
  AppFactory,
  initializeApp,

  // 常量
  BRAND_NAME,
  APP_VERSION,
} from './docs/YYC3-团队通用-标准规范/ide';

// 方式二：从子模块导入
import { DIContainer, ServiceToken } from './docs/YYC3-团队通用-标准规范/ide/di';
import { ConfigManager } from './docs/YYC3-团队通用-标准规范/ide/config';
```

### 2. 初始化应用

```typescript
import { initializeApp, getService } from './docs/YYC3-团队通用-标准规范/ide';

// 在应用入口初始化
async function main() {
  const context = await initializeApp({
    configSource: 'localStorage',
    config: {
      theme: { defaultThemeId: 'dark' },
      logger: { level: 'info' },
    },
  });

  // 使用服务
  const logger = context.logger;
  const eventBus = context.eventBus;
  const config = context.config;

  logger.info('Application started');
}
```

### 3. 使用 DI 容器

```typescript
import {
  DIContainer,
  ServiceToken,
  Lifecycle,
  Injectable,
} from './docs/YYC3-团队通用-标准规范/ide';

// 定义服务令牌
const UserServiceToken = new ServiceToken<IUserService>('userService');

// 定义服务接口
interface IUserService {
  getUser(id: string): Promise<User>;
  saveUser(user: User): Promise<void>;
}

// 标记为可注入
@Injectable(Lifecycle.Singleton)
class UserService implements IUserService {
  async getUser(id: string): Promise<User> {
    // 实现逻辑
  }

  async saveUser(user: User): Promise<void> {
    // 实现逻辑
  }
}

// 注册和解析
const container = new DIContainer();
container.registerSingleton(UserServiceToken, new UserService());

const userService = container.resolve(UserServiceToken);
```

### 4. 使用配置管理

```typescript
import {
  createYYC3ConfigManager,
  DEFAULT_CONFIG,
} from './docs/YYC3-团队通用-标准规范/ide/config';

// 创建配置管理器
const config = createYYC3ConfigManager({ source: 'localStorage' });

// 读取嵌套配置
const dbName = config.getNested('storage.dbName', 'default-db');
const theme = config.getNested('theme.defaultThemeId', 'light');

// 监听配置变更
config.onChange((key, value) => {
  console.log(`Config changed: ${key}`, value);
});

// 设置配置
config.set('theme.defaultThemeId', 'dark');
```

### 5. 使用事件总线

```typescript
import { SimpleEventBus } from './docs/YYC3-团队通用-标准规范/ide/factory';

// 创建事件总线
const eventBus = new SimpleEventBus();

// 订阅事件
const subscription = eventBus.subscribe('user:login', (event) => {
  console.log('User logged in:', event);
});

// 发布事件
eventBus.publish('user:login', { userId: '123', timestamp: Date.now() });

// 取消订阅
subscription.dispose();
```

### 6. 使用日志系统

```typescript
import { ConsoleLogger } from './docs/YYC3-团队通用-标准规范/ide/factory';

// 创建日志器
const logger = new ConsoleLogger('[MyApp]');

// 使用不同级别
logger.debug('Debug message', { key: 'value' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', new Error('Something went wrong'));

// 设置日志级别
logger.setLevel('warn'); // 只显示 warn 和 error
```

### 7. 使用 AI 管线

```typescript
import {
  SystemPromptBuilder,
  detectIntent,
  buildSystemPrompt,
} from './docs/YYC3-团队通用-标准规范/ide';

// 检测用户意图
const intent = detectIntent('帮我写一个 React 组件');
console.log(intent); // 'code-generation'

// 构建系统提示词
const systemPrompt = buildSystemPrompt({
  userIntent: 'code-generation',
  projectContext: {
    language: 'TypeScript',
    framework: 'React',
    techStack: ['React', 'TailwindCSS', 'Vite'],
  },
});
```

### 8. 使用国际化

```typescript
import { useI18n, translate } from './docs/YYC3-团队通用-标准规范/ide/i18n';

// 在组件中使用
function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t('common.confirm')}</h1>
      <button onClick={() => setLocale('en-US')}>
        Switch to English
      </button>
    </div>
  );
}

// 在非组件环境中使用
const text = translate('nav.home'); // '首页'
```

### 9. 使用自定义 Hooks

```typescript
import {
  usePerformanceMonitor,
  useErrorDiagnostics,
  useKeyboardNavigation,
} from './docs/YYC3-团队通用-标准规范/ide/hooks';

function MyComponent() {
  // 性能监控
  const metrics = usePerformanceMonitor();

  // 错误诊断
  const { errors, clearErrors } = useErrorDiagnostics();

  // 键盘导航
  const { registerShortcut, handleKeyDown } = useKeyboardNavigation();

  useEffect(() => {
    registerShortcut('Ctrl+S', () => {
      console.log('Save triggered');
    });
  }, []);
}
```

---

## 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                     应用层 (Application)                      │
│  组件、页面、业务逻辑                                         │
├─────────────────────────────────────────────────────────────┤
│                     工厂层 (Factory)                          │
│  AppFactory → DIContainer → ConfigManager                   │
├─────────────────────────────────────────────────────────────┤
│                     接口层 (Interfaces) ⭐                    │
│  IStorageAdapter │ IEventBus │ ILogger │ IConfigProvider   │
│  ISnapshotManager │ IThemeManager │ IPreviewController     │
├─────────────────────────────────────────────────────────────┤
│                   基础设施层 (Infrastructure)                 │
│  IndexedDBAdapter │ LocalStorageConfig │ SimpleEventBus    │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心接口清单

| 接口 | 用途 | 关键方法 |
|------|------|----------|
| `IDisposable` | 资源释放 | `dispose()` |
| `IEventBus` | 事件总线 | `publish()`, `subscribe()`, `once()` |
| `ILogger` | 日志记录 | `debug()`, `info()`, `warn()`, `error()` |
| `IStorageAdapter` | 存储抽象 | `saveFile()`, `loadFile()`, `saveObject()` |
| `ISnapshotManager` | 快照管理 | `createSnapshot()`, `restoreSnapshot()` |
| `IThemeManager` | 主题管理 | `setTheme()`, `registerTheme()` |
| `IPreviewController` | 预览控制 | `setMode()`, `triggerImmediateUpdate()` |
| `ICodeValidator` | 代码验证 | `validate()`, `addRule()` |
| `IPlugin` | 插件接口 | `activate()`, `deactivate()` |
| `IServiceLocator` | 服务定位 | `register()`, `resolve()`, `has()` |

---

## 最佳实践

### 1. 依赖注入优先

```typescript
// ❌ 不推荐：直接导入
import { ApiService } from './services/ApiService';

// ✅ 推荐：通过 DI 注入
class MyComponent {
  constructor(
    private apiService: IServiceLocator
  ) {}

  async fetchData() {
    const service = this.apiService.resolve(ApiServiceToken);
    return service.getData();
  }
}
```

### 2. 接口编程

```typescript
// ❌ 不推荐：依赖具体实现
class DataService {
  private storage: LocalStorage;

  // ...
}

// ✅ 推荐：依赖抽象接口
class DataService {
  private storage: IStorageAdapter;

  constructor(storage: IStorageAdapter) {
    this.storage = storage;
  }
}
```

### 3. 配置外部化

```typescript
// ❌ 不推荐：硬编码配置
const API_URL = 'http://localhost:3201/api';

// ✅ 推荐：从配置管理器读取
const API_URL = config.get('api.baseUrl', 'http://localhost:3201/api');
```

### 4. 日志统一

```typescript
// ❌ 不推荐：直接使用 console
console.log('Debug info');

// ✅ 推荐：使用统一日志
logger.debug('Debug info', { context: 'additional data' });
```

### 5. 事件驱动通信

```typescript
// ❌ 不推荐：直接调用
componentA.updateComponentB(data);

// ✅ 推荐：通过事件总线
eventBus.publish('data:updated', data);
```

---

## 迁移指南

### 从现有项目迁移到 IDE 标准

#### Step 1: 安装依赖

无需额外安装，IDE 标准规范零第三方依赖。

#### Step 2: 引入 DI 容器

```typescript
// 创建全局容器实例
// src/app/core/di/container.ts
import { DIContainer } from '../../../docs/YYC3-团队通用-标准规范/ide/di';

export const container = new DIContainer();
```

#### Step 3: 注册核心服务

```typescript
// src/app/core/di/register.ts
import { container } from './container';
import { TOKENS } from '../../../docs/YYC3-团队通用-标准规范/ide/di';
import { ConsoleLogger } from '../../../docs/YYC3-团队通用-标准规范/ide/factory';
import { SimpleEventBus } from '../../../docs/YYC3-团队通用-标准规范/ide/factory';

container.registerSingleton(TOKENS.Logger, new ConsoleLogger());
container.registerSingleton(TOKENS.EventBus, new SimpleEventBus());
```

#### Step 4: 重构组件

```typescript
// Before:
export function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(setData);
  }, []);

  return <div>{data}</div>;
}

// After:
export function MyComponent() {
  const logger = useService(TOKENS.Logger);
  const [data, setData] = useState(null);

  useEffect(() => {
    logger.info('Fetching data...');
    fetch('/api/data')
      .then(setData)
      .catch(error => logger.error('Fetch failed', error));
  }, [logger]);

  return <div>{data}</div>;
}
```

---

## 故障排除

### 问题 1: 模块找不到

**错误**: `Cannot find module './docs/...'`

**解决方案**:
1. 确认路径正确（相对路径）
2. 检查 tsconfig.json 的 `paths` 配置
3. 确认文件存在且可访问

### 问题 2: 类型错误

**错误**: `TS2307: Cannot find module` 或 `TS2345: Type ... is not assignable`

**解决方案**:
1. 确认 TypeScript 版本 >= 5.0
2. 检查是否正确导出类型
3. 使用 `type` 关键字导入类型：`import type { X } from '...'`

### 问题 3: 循环依赖

**错误**: `Circular dependency detected`

**解决方案**:
1. 使用延迟导入：`const module = await import(...)`
2. 重构代码结构，提取公共模块
3. 使用事件总线解耦

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v2.0.0 | 2026-06-03 | 统一入口文件，修复导出问题，完善文档 |
| v1.0.0 | 2026-04-01 | 初始版本，核心架构完成 |

---

## 相关文档

- [IDE 标准规范综合分析报告](./reports/YYC3-AI-Family-IDE标准规范综合分析报告-20260603.md)
- [项目现状审核报告](./reports/YYC3-AI-Family-现状审核报告-20260603.md)
- [YYC3 Design Prompt](../YYC3-Design-Prompt)

---

## 技术支持

- **邮箱**: admin@0379.email
- **GitHub**: https://github.com/YanYuCloudCube
- **文档**: https://github.com/YanYuCloudCube/YYC3-Family-AI/wiki

---

> **最后更新**: 2026-06-03
> **维护者**: YanYuCloudCube Team
