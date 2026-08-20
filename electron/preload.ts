/**
 * preload.ts
 * ===========
 * Electron 预加载脚本
 * 暴露安全的 IPC 桥接 API 给渲染进程
 */

import { contextBridge, ipcRenderer } from "electron";
import { IPCChannel, type YYC3BridgeAPI } from "../src/shared/ipc-types";

/**
 * IPC 调用封装
 */
async function invoke<T>(channel: IPCChannel, ...args: any[]): Promise<T> {
  const response = await ipcRenderer.invoke(channel, ...args);

  if (!response.success) {
    throw new Error(response.error || "IPC call failed");
  }

  return response.data;
}

/**
 * 文件系统 API
 */
const fileSystem = {
  readFile: (path: string, options?: any) =>
    invoke(IPCChannel.FILE_READ, path, options),

  writeFile: (path: string, data: string | Buffer, options?: any) =>
    invoke(IPCChannel.FILE_WRITE, path, data, options),

  deleteFile: (path: string) =>
    invoke(IPCChannel.FILE_DELETE, path),

  exists: (path: string) =>
    invoke<boolean>(IPCChannel.FILE_EXISTS, path),

  listDirectory: (path: string, options?: any) =>
    invoke(IPCChannel.FILE_LIST, path, options),

  getFileInfo: (path: string) =>
    invoke(IPCChannel.FILE_STAT, path),

  createDirectory: (path: string) =>
    invoke(IPCChannel.FILE_MKDIR, path),

  copyFile: (source: string, destination: string) =>
    invoke(IPCChannel.FILE_COPY, source, destination),

  moveFile: (source: string, destination: string) =>
    invoke(IPCChannel.FILE_MOVE, source, destination),
};

/**
 * 数据库 API
 */
const database = {
  execute: (sql: string, params?: any[]) =>
    invoke(IPCChannel.DB_EXECUTE, sql, params),

  query: (sql: string, params?: any[]) =>
    invoke(IPCChannel.DB_QUERY, sql, params),

  backup: (path: string) =>
    invoke(IPCChannel.DB_BACKUP, path),

  restore: (path: string) =>
    invoke(IPCChannel.DB_RESTORE, path),

  migrate: () =>
    invoke(IPCChannel.DB_MIGRATE),
};

/**
 * 系统监控 API
 */
const systemMonitor = {
  getCPUInfo: () =>
    invoke(IPCChannel.SYSTEM_CPU),

  getMemoryInfo: () =>
    invoke(IPCChannel.SYSTEM_MEMORY),

  getDiskInfo: () =>
    invoke(IPCChannel.SYSTEM_DISK),

  getNetworkInfo: () =>
    invoke(IPCChannel.SYSTEM_NETWORK),

  getProcesses: () =>
    invoke(IPCChannel.SYSTEM_PROCESSES),
};

/**
 * 应用控制 API
 */
const appControl = {
  getVersion: () =>
    invoke<string>(IPCChannel.APP_VERSION),

  getPath: (name: string) =>
    invoke<string>(IPCChannel.APP_PATH, name),

  getConfig: () =>
    invoke(IPCChannel.APP_CONFIG),

  restart: () =>
    invoke(IPCChannel.APP_RESTART),

  quit: () =>
    invoke(IPCChannel.APP_QUIT),
};

/**
 * 对话框 API
 */
const dialog = {
  showOpenDialog: (options: any) =>
    invoke<string[]>(IPCChannel.DIALOG_OPEN, options),

  showSaveDialog: (options: any) =>
    invoke<string>(IPCChannel.DIALOG_SAVE, options),

  showMessage: (options: any) =>
    invoke<number>(IPCChannel.DIALOG_MESSAGE, options),
};

/**
 * Shell API
 */
const shell = {
  openExternal: (url: string) =>
    invoke(IPCChannel.SHELL_OPEN, url),

  openPath: (path: string) =>
    invoke(IPCChannel.SHELL_OPEN, path),

  execute: (command: string, args?: string[]) =>
    invoke<string>(IPCChannel.SHELL_EXECUTE, command, args),
};

const notification = {
  show: (options: any) =>
    invoke<string>(IPCChannel.NOTIFICATION_SHOW, options),

  getPermission: () =>
    invoke<string>(IPCChannel.NOTIFICATION_PERMISSION),

  requestPermission: () =>
    invoke<string>(IPCChannel.NOTIFICATION_REQUEST),
};

/**
 * 暴露 YYC3 桥接 API 到渲染进程
 */
contextBridge.exposeInMainWorld("yyc3", {
  fileSystem,
  database,
  systemMonitor,
  appControl,
  dialog,
  shell,
  notification,
} as YYC3BridgeAPI);

/**
 * 类型声明：扩展 Window 接口
 */
declare global {
  interface Window {
    yyc3: YYC3BridgeAPI;
  }
}
