/**
 * @file: ipc-types.ts
 * @description: ipc-types.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

/**
 * IPC 通道名称
 */
export enum IPCChannel {
  // 文件系统操作
  FILE_READ = "file:read",
  FILE_WRITE = "file:write",
  FILE_DELETE = "file:delete",
  FILE_EXISTS = "file:exists",
  FILE_LIST = "file:list",
  FILE_STAT = "file:stat",
  FILE_MKDIR = "file:mkdir",
  FILE_COPY = "file:copy",
  FILE_MOVE = "file:move",

  // 数据库文件操作
  DB_EXECUTE = "db:execute",
  DB_QUERY = "db:query",
  DB_BACKUP = "db:backup",
  DB_RESTORE = "db:restore",
  DB_MIGRATE = "db:migrate",

  // 系统监控
  SYSTEM_CPU = "system:cpu",
  SYSTEM_MEMORY = "system:memory",
  SYSTEM_DISK = "system:disk",
  SYSTEM_NETWORK = "system:network",
  SYSTEM_PROCESSES = "system:processes",

  // 应用控制
  APP_VERSION = "app:version",
  APP_PATH = "app:path",
  APP_CONFIG = "app:config",
  APP_RESTART = "app:restart",
  APP_QUIT = "app:quit",

  // 对话框
  DIALOG_OPEN = "dialog:open",
  DIALOG_SAVE = "dialog:save",
  DIALOG_MESSAGE = "dialog:message",

  // Shell 操作
  SHELL_OPEN = "shell:open",
  SHELL_EXECUTE = "shell:execute",

  // 原生通知
  NOTIFICATION_SHOW = "notification:show",
  NOTIFICATION_PERMISSION = "notification:permission",
  NOTIFICATION_REQUEST = "notification:request",
}

/**
 * 文件信息
 */
export interface FileInfo {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  createdAt: number;
  modifiedAt: number;
  accessedAt: number;
  permissions?: string;
}

/**
 * 文件读取选项
 */
export interface FileReadOptions {
  encoding?: BufferEncoding;
  flag?: string;
}

/**
 * 文件写入选项
 */
export interface FileWriteOptions {
  encoding?: BufferEncoding;
  mode?: number;
  flag?: string;
}

/**
 * 目录列表选项
 */
export interface DirectoryListOptions {
  recursive?: boolean;
  includeHidden?: boolean;
  pattern?: string;
}

/**
 * 数据库查询结果
 */
export interface DatabaseQueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  fields?: string[];
  duration: number;
}

/**
 * 数据库执行结果
 */
export interface DatabaseExecuteResult {
  affectedRows: number;
  insertId?: number;
  duration: number;
}

/**
 * CPU 使用率信息
 */
export interface CPUInfo {
  model: string;
  speed: number;
  usage: number;
  cores: number;
  loadAverage: number[];
}

/**
 * 内存使用信息
 */
export interface MemoryInfo {
  total: number;
  free: number;
  used: number;
  usage: number;
  swapTotal?: number;
  swapUsed?: number;
  swapFree?: number;
}

/**
 * 磁盘使用信息
 */
export interface DiskInfo {
  filesystem: string;
  mountpoint: string;
  total: number;
  free: number;
  used: number;
  usage: number;
}

/**
 * 网络接口信息
 */
export interface NetworkInfo {
  interface: string;
  ip: string;
  mac: string;
  bytesReceived: number;
  bytesSent: number;
}

/**
 * 进程信息
 */
export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: string;
  command?: string;
}

/**
 * IPC 响应基础接口
 */
export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * 数据库查询参数类型
 */
export type QueryParams = unknown[];

/**
 * 对话框选项类型
 */
export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<"openFile" | "openDirectory" | "multiSelections" | "showHiddenFiles">;
  message?: string;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  message?: string;
}

export interface MessageDialogOptions {
  type?: "none" | "info" | "error" | "question" | "warning";
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
  title?: string;
  message: string;
  detail?: string;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
}

/**
 * 文件系统 API
 */
export interface FileSystemAPI {
  readFile(path: string, options?: FileReadOptions): Promise<string | Buffer>;
  writeFile(path: string, data: string | Buffer, options?: FileWriteOptions): Promise<void>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  listDirectory(path: string, options?: DirectoryListOptions): Promise<FileInfo[]>;
  getFileInfo(path: string): Promise<FileInfo>;
  createDirectory(path: string): Promise<void>;
  copyFile(source: string, destination: string): Promise<void>;
  moveFile(source: string, destination: string): Promise<void>;
}

/**
 * 数据库 API
 */
export interface DatabaseAPI {
  execute(sql: string, params?: QueryParams): Promise<DatabaseExecuteResult>;
  query<T = unknown>(sql: string, params?: QueryParams): Promise<DatabaseQueryResult<T>>;
  backup(path: string): Promise<void>;
  restore(path: string): Promise<void>;
  migrate(): Promise<void>;
}

/**
 * 系统监控 API
 */
export interface SystemMonitorAPI {
  getCPUInfo(): Promise<CPUInfo>;
  getMemoryInfo(): Promise<MemoryInfo>;
  getDiskInfo(): Promise<DiskInfo[]>;
  getNetworkInfo(): Promise<NetworkInfo[]>;
  getProcesses(): Promise<ProcessInfo[]>;
}

/**
 * 应用控制 API
 */
export interface AppControlAPI {
  getVersion(): Promise<string>;
  getPath(name: string): Promise<string>;
  getConfig(): Promise<Record<string, unknown>>;
  restart(): Promise<void>;
  quit(): Promise<void>;
}

/**
 * 对话框 API
 */
export interface DialogAPI {
  showOpenDialog(options: OpenDialogOptions): Promise<string[]>;
  showSaveDialog(options: SaveDialogOptions): Promise<string>;
  showMessage(options: MessageDialogOptions): Promise<number>;
}

/**
 * Shell API
 */
export interface ShellAPI {
  openExternal(url: string): Promise<void>;
  openPath(path: string): Promise<void>;
  execute(command: string, args?: string[]): Promise<string>;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  silent?: boolean;
  requireInteraction?: boolean;
}

export interface NotificationAPI {
  show(options: NotificationOptions): Promise<string>;
  getPermission(): Promise<string>;
  requestPermission(): Promise<string>;
}

export interface YYC3BridgeAPI {
  fileSystem: FileSystemAPI;
  database: DatabaseAPI;
  systemMonitor: SystemMonitorAPI;
  appControl: AppControlAPI;
  dialog: DialogAPI;
  shell: ShellAPI;
  notification: NotificationAPI;
}
