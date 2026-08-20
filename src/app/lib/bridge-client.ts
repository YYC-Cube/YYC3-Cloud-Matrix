/**
 * @file: bridge-client.ts
 * @description: bridge-client.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [lib]
 */

import type {
  YYC3BridgeAPI,
  DatabaseExecuteResult,
  DatabaseQueryResult,
  QueryParams,
  CPUInfo,
  MemoryInfo,
  DiskInfo,
  NetworkInfo,
  ProcessInfo,
  OpenDialogOptions,
  SaveDialogOptions,
  MessageDialogOptions,
} from "../../shared/ipc-types";

/**
 * 检查是否在 Electron 环境中
 */
export function isElectron(): boolean {
  return typeof window !== "undefined" && typeof window.yyc3 !== "undefined";
}

/**
 * 获取桥接 API
 */
export function getBridgeAPI(): YYC3BridgeAPI | null {
  if (!isElectron()) {
    console.warn("[Bridge] Not running in Electron environment");
    return null;
  }
  return window.yyc3;
}

/**
 * 文件系统客户端
 */
export const fileSystemClient = {
  /**
   * 读取文件内容
   */
  async readFile(path: string, encoding: BufferEncoding = "utf-8"): Promise<string> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("File system not available in web environment");
    }
    return bridge.fileSystem.readFile(path, { encoding }) as Promise<string>;
  },

  /**
   * 写入文件
   */
  async writeFile(path: string, data: string | Buffer): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("File system not available in web environment");
    }
    return bridge.fileSystem.writeFile(path, data);
  },

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("File system not available in web environment");
    }
    return bridge.fileSystem.deleteFile(path);
  },

  /**
   * 检查文件是否存在
   */
  async exists(path: string): Promise<boolean> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return false;
    }
    return bridge.fileSystem.exists(path);
  },

  /**
   * 列出目录内容
   */
  async listDirectory(path: string, recursive = false): Promise<unknown[]> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return [];
    }
    return bridge.fileSystem.listDirectory(path, { recursive });
  },

  /**
   * 获取文件信息
   */
  async getFileInfo(path: string): Promise<Record<string, unknown>> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("File system not available in web environment");
    }
    return bridge.fileSystem.getFileInfo(path) as unknown as Promise<Record<string, unknown>>;
  },

  /**
   * 创建目录
   */
  async createDirectory(path: string): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("File system not available in web environment");
    }
    return bridge.fileSystem.createDirectory(path);
  },

  /**
   * 复制文件
   */
  async copyFile(source: string, destination: string): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("File system not available in web environment");
    }
    return bridge.fileSystem.copyFile(source, destination);
  },

  /**
   * 移动文件
   */
  async moveFile(source: string, destination: string): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("File system not available in web environment");
    }
    return bridge.fileSystem.moveFile(source, destination);
  },
};

/**
 * 数据库客户端
 */
export const databaseClient = {
  /**
   * 执行 SQL 语句
   */
  async execute(sql: string, params?: QueryParams): Promise<DatabaseExecuteResult> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("Database not available in web environment");
    }
    return bridge.database.execute(sql, params);
  },

  /**
   * 查询数据
   */
  async query<T = unknown>(sql: string, params?: QueryParams): Promise<DatabaseQueryResult<T>> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("Database not available in web environment");
    }
    return bridge.database.query<T>(sql, params);
  },

  /**
   * 备份数据库
   */
  async backup(path: string): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("Database not available in web environment");
    }
    return bridge.database.backup(path);
  },

  /**
   * 恢复数据库
   */
  async restore(path: string): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("Database not available in web environment");
    }
    return bridge.database.restore(path);
  },

  /**
   * 迁移数据库
   */
  async migrate(): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("Database not available in web environment");
    }
    return bridge.database.migrate();
  },
};

/**
 * 系统监控客户端
 */
export const systemMonitorClient = {
  /**
   * 获取 CPU 信息
   */
  async getCPUInfo(): Promise<CPUInfo> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return {
        model: "Unknown",
        speed: 0,
        usage: 0,
        cores: 0,
        loadAverage: [0, 0, 0],
      };
    }
    return bridge.systemMonitor.getCPUInfo();
  },

  /**
   * 获取内存信息
   */
  async getMemoryInfo(): Promise<MemoryInfo> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return {
        total: 0,
        free: 0,
        used: 0,
        usage: 0,
      };
    }
    return bridge.systemMonitor.getMemoryInfo();
  },

  /**
   * 获取磁盘信息
   */
  async getDiskInfo(): Promise<DiskInfo[]> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return [];
    }
    return bridge.systemMonitor.getDiskInfo();
  },

  /**
   * 获取网络信息
   */
  async getNetworkInfo(): Promise<NetworkInfo[]> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return [];
    }
    return bridge.systemMonitor.getNetworkInfo();
  },

  /**
   * 获取进程信息
   */
  async getProcesses(): Promise<ProcessInfo[]> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return [];
    }
    return bridge.systemMonitor.getProcesses();
  },
};

/**
 * 应用控制客户端
 */
export const appControlClient = {
  /**
   * 获取应用版本
   */
  async getVersion(): Promise<string> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return "web";
    }
    return bridge.appControl.getVersion();
  },

  /**
   * 获取应用路径
   */
  async getPath(name: string): Promise<string> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return "";
    }
    return bridge.appControl.getPath(name);
  },

  /**
   * 获取应用配置
   */
  async getConfig(): Promise<Record<string, unknown>> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      return {
        name: "YYC3-Cloud-Intelli-Matrix",
        version: "web",
        locale: "zh-CN",
        isPackaged: false,
      };
    }
    return bridge.appControl.getConfig();
  },

  /**
   * 重启应用
   */
  async restart(): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      window.location.reload();
      return;
    }
    return bridge.appControl.restart();
  },

  /**
   * 退出应用
   */
  async quit(): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      window.close();
      return;
    }
    return bridge.appControl.quit();
  },
};

/**
 * 对话框客户端
 */
export const dialogClient = {
  /**
   * 显示打开对话框
   */
  async showOpenDialog(options: OpenDialogOptions): Promise<string[]> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("Dialog not available in web environment");
    }
    return bridge.dialog.showOpenDialog(options);
  },

  /**
   * 显示保存对话框
   */
  async showSaveDialog(options: SaveDialogOptions): Promise<string> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("Dialog not available in web environment");
    }
    return bridge.dialog.showSaveDialog(options);
  },

  /**
   * 显示消息对话框
   */
  async showMessage(options: MessageDialogOptions): Promise<number> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      alert(options.message);
      return 0;
    }
    return bridge.dialog.showMessage(options);
  },
};

/**
 * Shell 客户端
 */
export const shellClient = {
  /**
   * 打开外部链接
   */
  async openExternal(url: string): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      window.open(url, "_blank");
      return;
    }
    return bridge.shell.openExternal(url);
  },

  /**
   * 打开路径
   */
  async openPath(path: string): Promise<void> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("Shell not available in web environment");
    }
    return bridge.shell.openPath(path);
  },

  /**
   * 执行命令
   */
  async execute(command: string, args?: string[]): Promise<string> {
    const bridge = getBridgeAPI();
    if (!bridge) {
      throw new Error("Shell not available in web environment");
    }
    return bridge.shell.execute(command, args);
  },
};

export const notificationClient = {
  async show(options: { title: string; body?: string; icon?: string; tag?: string; silent?: boolean; requireInteraction?: boolean }): Promise<string> {
    const bridge = getBridgeAPI();
    if (bridge) {
      return bridge.notification.show(options);
    }
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return "denied";
    }
    try {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        tag: options.tag,
      });
      return "sent";
    } catch {
      return "failed";
    }
  },

  async getPermission(): Promise<string> {
    const bridge = getBridgeAPI();
    if (bridge) {
      return bridge.notification.getPermission();
    }
    if (typeof Notification === "undefined") {
      return "unsupported";
    }
    return Notification.permission;
  },

  async requestPermission(): Promise<string> {
    const bridge = getBridgeAPI();
    if (bridge) {
      return bridge.notification.requestPermission();
    }
    if (typeof Notification === "undefined") {
      return "unsupported";
    }
    return Notification.requestPermission();
  },
};
