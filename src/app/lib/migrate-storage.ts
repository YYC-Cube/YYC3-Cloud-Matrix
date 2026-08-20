/**
 * @file: migrate-storage.ts
 * @description: localStorage → Zustand 迁移工具集
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [util],[migration],[localStorage]
 */

/**
 * 从 localStorage 读取 JSON 并回调，成功后删除 key
 * 返回是否成功迁移
 */
export function migrateKey<T>(key: string, setter: (value: T) => void): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      setter(JSON.parse(raw));
      localStorage.removeItem(key);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

/**
 * 读取 JSON 后与默认值合并，再回调
 */
export function migrateKeyWithMerge<T extends object>(
  key: string,
  defaults: T,
  setter: (value: T) => void,
): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      setter({ ...defaults, ...JSON.parse(raw) });
      localStorage.removeItem(key);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

/**
 * 读取 JSON 并验证为数组，再回调
 */
export function migrateKeyAsArray<T>(
  key: string,
  setter: (value: T[]) => void,
): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setter(parsed);
        localStorage.removeItem(key);
        return true;
      }
    }
  } catch { /* ignore */ }
  return false;
}

/**
 * 读取原始字符串（不做 JSON.parse），再回调
 */
export function migrateRawString(key: string, setter: (value: string) => void): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      setter(raw);
      localStorage.removeItem(key);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}
