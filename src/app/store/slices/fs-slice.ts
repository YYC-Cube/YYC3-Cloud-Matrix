/**
 * @file: fs-slice.ts
 * @description: YYC³ File System Slice — 文件树 + 文件内容 + 最近文件持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-18
 * @updated: 2026-04-18
 * @status: active
 * @tags: [store],[slice],[fs]
 *
 * @brief: 文件系统数据 Zustand Store
 *
 * @details:
 * - 合并 3 个 localStorage 键: yyc3_file_tree, yyc3_file_contents, yyc3_recent_files
 * - useLocalFileSystem + useHostFileSystem 改为薄 wrapper
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FileItem, RecentFile } from '../../types';
import { migrateKey } from '../../lib/migrate-storage';

// ============================================================
// Slice Interface
// ============================================================

interface FSSlice {
  // 文件树 (null = 使用 hook 层默认值)
  fileTree: FileItem[] | null;
  setFileTree: (tree: FileItem[]) => void;

  // 文件内容缓存 (fileId → content)
  fileContents: Record<string, string>;
  setFileContents: (contents: Record<string, string>) => void;
  setOneFileContent: (fileId: string, content: string) => void;

  // 最近打开文件 (host FS)
  recentFiles: RecentFile[];
  setRecentFiles: (files: RecentFile[]) => void;
  addRecentFile: (entry: { id: string; name: string; path: string; size?: number }) => void;
}

const MAX_RECENT = 20;

// ============================================================
// Store
// ============================================================

export const useFSSlice = create<FSSlice>()(
  persist(
    (set, _get) => ({
      fileTree: null,
      setFileTree: (tree) => set({ fileTree: tree }),

      fileContents: {},
      setFileContents: (contents) => set({ fileContents: contents }),
      setOneFileContent: (fileId, content) =>
        set((s) => ({ fileContents: { ...s.fileContents, [fileId]: content } })),

      recentFiles: [],
      setRecentFiles: (files) => set({ recentFiles: files }),
      addRecentFile: (entry) =>
        set((s) => {
          const filtered = s.recentFiles.filter((r) => r.path !== entry.path);
          filtered.unshift({
            id: entry.id,
            name: entry.name,
            path: entry.path,
            size: entry.size,
            accessedAt: Date.now(),
          });
          return { recentFiles: filtered.slice(0, MAX_RECENT) };
        }),
    }),
    {
      name: 'yyc3-fs',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Legacy Migration Helper
// ============================================================

export function migrateLegacyFSData(): boolean {
  let migrated = false;
  migrated = migrateKey<FileItem[]>('yyc3_file_tree', (v) => useFSSlice.setState({ fileTree: v })) || migrated;
  migrated = migrateKey<Record<string, string>>('yyc3_file_contents', (v) => useFSSlice.setState({ fileContents: v })) || migrated;
  migrated = migrateKey<RecentFile[]>('yyc3_recent_files', (v) => useFSSlice.setState({ recentFiles: v })) || migrated;
  return migrated;
}
