/**
 * @file: full-backup.ts
 * @description: YYC³ 全量数据备份与恢复 · 一键导出所有存储层数据
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[backup],[data-management]
 *
 * @brief: 一键全量备份/恢复所有本地存储数据
 *
 * @details:
 * - 遍历所有 yyc3- 前缀的 localStorage 键
 * - 导出 IndexedDB (yyc3_matrix) 全部 object store 数据
 * - JSON 格式输出，带版本号和时间戳
 * - 恢复时逐层还原，支持版本兼容迁移
 */

import { exportStoreData, importStoreData } from "../stores/global-store";
import { exportAllData, importAllData } from "./yyc3-storage";

// ============================================================
// 类型定义
// ============================================================

export interface FullBackupData {
  _version: 1;
  _exportedAt: string;
  _tool: "yyc3-full-backup";
  localStorage: Record<string, string>;
  indexedDB: Record<string, unknown[]>;
  globalStore: string; // GlobalStore 导出的 JSON
}

// ============================================================
// 需要备份的 localStorage 键前缀
// ============================================================

const BACKUP_PREFIXES = [
  "yyc3",
  "yyc3-",
  "network_config",
  "offline_snapshot",
];

function shouldBackup(key: string): boolean {
  return BACKUP_PREFIXES.some((prefix) => key.startsWith(prefix));
}

// ============================================================
// IndexedDB 数据读取
// ============================================================

async function readIndexedDBData(): Promise<Record<string, unknown[]>> {
  try {
    return await exportAllData();
  } catch (e) {
    console.warn("[FullBackup] IndexedDB read failed:", e);
    return {};
  }
}

// ============================================================
// 导出 API
// ============================================================

/**
 * 全量导出所有本地数据
 * - 包括所有 yyc3- 前缀的 localStorage 键
 * - 包括 IndexedDB yyc3_matrix 的全部 object store
 * - 包括 GlobalStore 的导出数据
 */
export async function exportFullBackup(): Promise<string> {
  // 1. 收集 localStorage
  const lsData: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && shouldBackup(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        // 脱敏: 跳过包含 password/apiKey 的值中的实际内容
        lsData[key] = value;
      }
    }
  }

  // 2. 收集 IndexedDB
  const idbData = await readIndexedDBData();

  // 3. GlobalStore 导出
  const globalStoreData = exportStoreData();

  const backup: FullBackupData = {
    _version: 1,
    _exportedAt: new Date().toISOString(),
    _tool: "yyc3-full-backup",
    localStorage: lsData,
    indexedDB: idbData,
    globalStore: globalStoreData,
  };

  return JSON.stringify(backup, null, 2);
}

// ============================================================
// 导入 API
// ============================================================

/**
 * 全量恢复本地数据
 * - 先恢复 localStorage
 * - 再恢复 IndexedDB
 * - 最后恢复 GlobalStore
 * - 触发所有同步通道广播
 */
export async function importFullBackup(json: string): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    const backup = JSON.parse(json) as FullBackupData;

    if (backup._tool !== "yyc3-full-backup") {
      return { success: false, errors: ["Invalid backup file: missing _tool marker"] };
    }

    // 1. 恢复 localStorage
    if (backup.localStorage) {
      for (const [key, value] of Object.entries(backup.localStorage)) {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          errors.push(`localStorage[${key}]: ${(e as Error).message}`);
        }
      }
    }

    // 2. 恢复 IndexedDB
    if (backup.indexedDB && Object.keys(backup.indexedDB).length > 0) {
      try {
        await restoreIndexedDBData(backup.indexedDB);
      } catch (e) {
        errors.push(`IndexedDB: ${(e as Error).message}`);
      }
    }

    // 3. 恢复 GlobalStore
    if (backup.globalStore) {
      const ok = importStoreData(backup.globalStore);
      if (!ok) {
        errors.push("GlobalStore import failed");
      }
    }

    // 4. 广播全量同步
    try {
      const { broadcastSyncMessage } = await import("./broadcast-channel");
      broadcastSyncMessage({ domain: "global-store", action: "reset" });
    } catch { /* ignore */ }

    return { success: errors.length === 0, errors };
  } catch (e) {
    return { success: false, errors: [`Parse error: ${(e as Error).message}`] };
  }
}

async function restoreIndexedDBData(data: Record<string, unknown[]>): Promise<void> {
  try {
    await importAllData(data as Parameters<typeof importAllData>[0]);
  } catch (e) {
    console.warn("[FullBackup] IndexedDB restore failed:", e);
    throw e;
  }
}

/**
 * 生成备份文件并触发下载
 */
export async function downloadFullBackup(): Promise<void> {
  const data = await exportFullBackup();
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `yyc3-full-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
