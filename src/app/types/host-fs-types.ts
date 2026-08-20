/**
 * @file: host-fs-types.ts
 * @description: 宿主机文件系统类型 — File System Access API
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[host-fs]
 */

/** 宿主机文件条目 (真实文件系统) */
export interface HostFileEntry {
  id: string;
  name: string;
  kind: "file" | "directory";
  path: string;
  size?: number;
  lastModified?: number;
  mimeType?: string;
  /** File System Access API handle (运行时引用, 不持久化) */
  handle?: FileSystemHandle;
  children?: HostFileEntry[];
}

/** 文件版本快照 */
export interface FileVersion {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  content: string;
  size: number;
  savedAt: number;
  label?: string;
}

/** 宿主机文件系统状态 */
export interface HostFSState {
  supported: boolean;
  rootHandle: FileSystemDirectoryHandle | null;
  rootName: string;
  entries: HostFileEntry[];
  currentPath: string[];
  selectedEntry: HostFileEntry | null;
  editingContent: string | null;
  versions: FileVersion[];
  loading: boolean;
}
