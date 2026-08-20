/* eslint-disable no-console */
/**
 * @file: usage-example.ts
 * @description: IDE 标准规范使用示例 — 展示如何在项目中集成和使用
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 */

// ================================================================
// 示例 1: 基础导入和使用
// ================================================================

import {
  // 核心接口
  IDisposable,
  IEventBus,
  ILogger,
  ISubscription,

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
  getService,

  // 常量
  BRAND_NAME,
  APP_VERSION,
  SERVER_PORT,

  // 类型
  type YYC3AppConfig,
} from '../docs/YYC3-团队通用-标准规范/ide';

// ================================================================
// 示例 2: 初始化应用
// ================================================================

async function exampleInitializeApp() {
  console.log('=== 示例 2: 初始化应用 ===');

  const context = await initializeApp({
    configSource: 'localStorage',
    config: {
      storage: {
        dbName: 'my-app-db',
        dbVersion: 2,
        maxStorageSize: 100 * 1024 * 1024, // 100MB
      },
      theme: {
        defaultThemeId: 'dark',
        persistTheme: true,
      },
      logger: {
        level: 'debug', // 开发环境用 debug，生产环境用 info/warn
        prefix: '[MyApp]',
      },
    },
  });

  console.log('✅ 应用初始化完成');
  console.log('📦 容器实例:', context.container);
  console.log('⚙️  配置管理器:', context.config);
  console.log('📝 日志器:', context.logger);
  console.log('📡 事件总线:', context.eventBus);

  return context;
}

// ================================================================
// 示例 3: 使用 DI 容器
// ================================================================

function exampleDIContainer() {
  console.log('\n=== 示例 3: 使用 DI 容器 ===');

  // 创建容器
  const container = new DIContainer();

  // 定义服务接口
  interface IDataService {
    getData(): Promise<string[]>;
    saveData(data: string[]): Promise<void>;
  }

  // 创建服务令牌
  const DataServiceToken = new ServiceToken<IDataService>('dataService');

  // 注册服务（单例）
  class DataService implements IDataService {
    private data: string[] = [];

    async getData(): Promise<string[]> {
      return [...this.data];
    }

    async saveData(data: string[]): Promise<void> {
      this.data = data;
      console.log(`💾 数据已保存 (${data.length} 条)`);
    }
  }

  container.registerSingleton(DataServiceToken, new DataService());

  // 解析服务
  const dataService = container.resolve(DataServiceToken);

  // 使用服务
  await dataService.saveData(['item1', 'item2', 'item3']);
  const data = await dataService.getData();

  console.log('✅ DI 容器工作正常');
  console.log('📊 数据:', data);

  // 检查服务是否存在
  const hasService = container.has(DataServiceToken);
  console.log('🔍 服务存在检查:', hasService);
}

// ================================================================
// 示例 4: 配置管理
// ================================================================

async function exampleConfigManagement() {
  console.log('\n=== 示例 4: 配置管理 ===');

  // 创建配置管理器
  const config = createYYC3ConfigManager({ source: 'memory' });

  // 读取默认配置
  const defaultTheme = config.getNested('theme.defaultThemeId', 'light');
  const maxSnapshots = config.getNested('snapshot.maxSnapshots', 50);

  console.log('🎨 默认主题:', defaultTheme);
  console.log('📸 最大快照数:', maxSnapshots);

  // 设置自定义配置
  config.setNested('theme.defaultThemeId', 'cyberpunk');
  config.setNested('storage.dbName', 'custom-db');

  // 监听配置变更
  const subscription = config.onChange((key, value) => {
    console.log(`⚙️  配置变更: ${key} =`, value);
  });

  // 触发变更
  config.set('logger.level', 'warn');

  // 获取所有配置
  const allConfig = config.getAll();
  console.log('📋 所有配置:', Object.keys(allConfig));

  // 清理
  subscription.dispose();
}

// ================================================================
// 示例 5: 事件总线
// ================================================================

function exampleEventBus() {
  console.log('\n=== 示例 5: 事件总线 ===');

  // 从工厂导入 SimpleEventBus
  // 注意：这里我们手动创建一个简单实现用于演示
  class DemoEventBus implements IEventBus {
    private listeners = new Map<string, Set<Function>>();
    private isDisposed = false;

    publish<T>(eventType: string, event: T): void {
      const handlers = this.listeners.get(eventType);
      if (handlers) {
        handlers.forEach(handler => handler(event));
      }
    }

    subscribe<T>(eventType: string, handler: (event: T) => void): ISubscription {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, new Set());
      }
      this.listeners.get(eventType)!.add(handler as Function);

      let isActive = true;
      return {
        get isActive() { return isActive; },
        dispose: () => {
          isActive = false;
          this.listeners.get(eventType)?.delete(handler);
        },
        unsubscribe: () => {
          isActive = false;
          this.listeners.get(eventType)?.delete(handler);
        },
      };
    }

    once<T>(eventType: string, handler: (event: T) => void): ISubscription {
      const sub = this.subscribe(eventType, (event) => {
        sub.dispose();
        handler(event as T);
      });
      return sub;
    }

    get eventTypes(): string[] {
      return Array.from(this.listeners.keys());
    }

    getListenerCount(eventType: string): number {
      return this.listeners.get(eventType)?.size || 0;
    }

    dispose(): void {
      this.isDisposed = true;
      this.listeners.clear();
    }
  }

  const eventBus = new DemoEventBus();

  // 订阅事件
  const sub1 = eventBus.subscribe('user:login', (data: any) => {
    console.log(`👤 用户登录: ${data.userId}`);
  });

  const sub2 = eventBus.subscribe('user:login', (data: any) => {
    console.log(`📊 记录登录日志: ${data.timestamp}`);
  });

  // 发布事件
  eventBus.publish('user:login', {
    userId: '12345',
    timestamp: Date.now(),
  });

  console.log('📡 事件类型:', eventBus.eventTypes);
  console.log('👥 监听器数量:', eventBus.getListenerCount('user:login'));

  // 取消订阅
  sub1.dispose();
  console.log('❌ 取消订阅后监听器数量:', eventBus.getListenerCount('user:login'));

  // 清理
  eventBus.dispose();
}

// ================================================================
// 示例 6: 日志系统
// ================================================================

function exampleLoggerSystem() {
  console.log('\n=== 示例 6: 日志系统 ===');

  // 简单日志实现
  class DemoLogger implements ILogger {
    private level: LogLevel = 'info';
    private prefix: string;

    constructor(prefix: string = '[Demo]') {
      this.prefix = prefix;
    }

    debug(message: string, context?: Record<string, unknown>): void {
      if (this.shouldLog('debug')) {
        console.log(`${this.prefix} [DEBUG] ${message}`, context || '');
      }
    }

    info(message: string, context?: Record<string, unknown>): void {
      if (this.shouldLog('info')) {
        console.info(`${this.prefix} [INFO] ${message}`, context || '');
      }
    }

    warn(message: string, context?: Record<string, unknown>): void {
      if (this.shouldLog('warn')) {
        console.warn(`${this.prefix} [WARN] ${message}`, context || '');
      }
    }

    error(message: string, error?: Error, context?: Record<string, unknown>): void {
      if (this.shouldLog('error')) {
        console.error(`${this.prefix} [ERROR] ${message}`, error?.stack, context || '');
      }
    }

    setLevel(level: LogLevel): void {
      this.level = level;
      console.log(`📊 日志级别设置为: ${level}`);
    }

    getLevel(): LogLevel {
      return this.level;
    }

    onLog(callback: (entry: any) => void): ISubscription {
      // 简化实现
      return { isActive: true, dispose: () => {}, unsubscribe: () => {} };
    }

    private shouldLog(level: LogLevel): boolean {
      const levels = { debug: 0, info: 1, warn: 2, error: 3 };
      return levels[level] >= levels[this.level];
    }
  }

  const logger = new DemoLogger('[MyApp]');

  // 不同级别的日志
  logger.debug('这是调试信息', { key: 'value' });
  logger.info('这是一般信息');
  logger.warn('这是警告信息');
  logger.error('这是错误信息', new Error('测试错误'), { context: '额外上下文' });

  // 设置级别
  logger.setLevel('warn');
  logger.debug('这条调试信息不会显示'); // 不会输出
  logger.warn('这条警告会显示'); // 会输出

  console.log('✅ 日志系统工作正常');
}

// ================================================================
// 主函数：运行所有示例
// ================================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     YYC³ IDE 标准规范 - 使用示例                      ║');
  console.log('║     Version: v2.0.0                                 ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  console.log('\n📌 品牌信息:');
  console.log(`   名称: ${BRAND_NAME}`);
  console.log(`   版本: ${APP_VERSION}`);
  console.log(`   端口: ${SERVER_PORT}`);

  try {
    // 运行示例
    await exampleInitializeApp();
    exampleDIContainer();
    await exampleConfigManagement();
    exampleEventBus();
    exampleLoggerSystem();

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║     ✅ 所有示例运行成功！                              ║');
    console.log('╚══════════════════════════════════════════════════════╝');
  } catch (error) {
    console.error('❌ 示例运行失败:', error);
  }
}

// 导出供外部使用
export { main as runExamples };

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}
