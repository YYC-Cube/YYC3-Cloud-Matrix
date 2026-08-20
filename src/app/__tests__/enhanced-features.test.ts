/**
 * @file: enhanced-features.test.ts
 * @description: 验证4项极致优化功能
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ============================================================
// Mock localStorage
// ============================================================

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null,
    store,
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// ============================================================
// 1️⃣ TypeScript 类型导出测试
// ============================================================

describe("📦 TypeScript 类型导出 - 增强功能测试", () => {
  it("应导出 BUILTIN_PROVIDERS 常量", async () => {
    const { BUILTIN_PROVIDERS } = await import("../hooks/useModelProvider");

    expect(BUILTIN_PROVIDERS).toBeDefined();
    expect(Array.isArray(BUILTIN_PROVIDERS)).toBe(true);
    expect(BUILTIN_PROVIDERS.length).toBeGreaterThan(0);

    // 验证 Ollama 存在
    const ollama = BUILTIN_PROVIDERS.find(p => p.id === "ollama");
    expect(ollama).toBeDefined();
    expect(ollama!.isLocal).toBe(true);
  });

  it("应导出持久化工具函数", async () => {
    const { loadProviders, saveProviders, loadModels, saveModels } = await import("../hooks/useModelProvider");

    expect(typeof loadProviders).toBe("function");
    expect(typeof saveProviders).toBe("function");
    expect(typeof loadModels).toBe("function");
    expect(typeof saveModels).toBe("function");
  });

  it("应导出存储键常量", async () => {
    const { PROVIDERS_KEY, MODELS_KEY } = await import("../hooks/useModelProvider");

    expect(PROVIDERS_KEY).toBe("yyc3_model_providers");
    expect(MODELS_KEY).toBe("yyc3_configured_models");
  });
});

// ============================================================
// 2️⃣ 数据校验增强测试
// ============================================================

describe("✅ 数据校验增强 - Validators 测试", () => {
  it("应正确验证 URL 格式", async () => {
    const { isValidUrl, validateUrl } = await import("../lib/validators");

    // 有效 URL
    expect(isValidUrl("https://api.openai.com/v1")).toBe(true);
    expect(isValidUrl("http://localhost:11434")).toBe(true);
    expect(isValidUrl("https://example.com:8080/path")).toBe(true);

    // 无效 URL
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("ftp://invalid.com")).toBe(false);

    // 详细验证
    const result1 = validateUrl("https://api.openai.com/v1");
    expect(result1.valid).toBe(true);
    expect(result1.errors.length).toBe(0);

    const result2 = validateUrl("invalid-url");
    expect(result2.valid).toBe(false);
    expect(result2.errors.length).toBeGreaterThan(0);
  });

  it("应正确验证邮箱格式", async () => {
    const { isValidEmail, validateEmail } = await import("../lib/validators");

    // 有效邮箱
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.org")).toBe(true);
    expect(isValidEmail("admin@local.dev")).toBe(true);

    // 无效邮箱
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);

    // 详细验证
    const result1 = validateEmail("user@example.com");
    expect(result1.valid).toBe(true);

    const result2 = validateEmail("invalid");
    expect(result2.valid).toBe(false);
    expect(result2.errors.length).toBeGreaterThan(0);
  });

  it("应正确验证 ID 格式", async () => {
    const { isValidId, validateId } = await import("../lib/validators");

    // 有效 ID
    expect(isValidId("valid-id_123")).toBe(true);
    expect(isValidId("ABC123")).toBe(true);

    // 无效 ID
    expect(isValidId("")).toBe(false);
    expect(isValidId("id with spaces")).toBe(false);
    expect(isValidId("id@special")).toBe(false);
  });

  it("应正确验证百分比数值", async () => {
    const { isValidPercentage, validatePercentage } = await import("../lib/validators");

    // 有效百分比
    expect(isValidPercentage(0)).toBe(true);
    expect(isValidPercentage(50)).toBe(true);
    expect(isValidPercentage(100)).toBe(true);

    // 无效百分比
    expect(isValidPercentage(-1)).toBe(false);
    expect(isValidPercentage(101)).toBe(false);
    expect(isValidPercentage(NaN)).toBe(false);

    // 详细验证
    const result1 = validatePercentage(75);
    expect(result1.valid).toBe(true);

    const result2 = validatePercentage(150);
    expect(result2.valid).toBe(false);
    expect(result2.errors).toContain("百分比 不能大于 100");
  });

  it("应正确验证 API Key 格式", async () => {
    const { isValidApiKey, validateApiKey } = await import("../lib/validators");

    // 有效 API Key
    expect(isValidApiKey("sk-1234567890abcdef1234567890abcdef")).toBe(true);
    expect(isValidApiKey("abcdefghijklmnopqrstuvwxyz123456")).toBe(true);

    // 无效 API Key
    expect(isValidApiKey("")).toBe(false);
    expect(isValidApiKey("short")).toBe(false);

    // 详细验证
    const result1 = validateApiKey("sk-valid-api-key-12345678901234567890");
    expect(result1.valid).toBe(true);

    const result2 = validateApiKey("short");
    expect(result2.valid).toBe(false);
    expect(result2.errors.some(e => e.includes("20"))).toBe(true);
  });

  it("应支持 ModelProviderDef 验证", async () => {
    const { validateModelProvider } = await import("../lib/validators");

    // 有效 Provider
    const validProvider = {
      label: "Test Provider",
      baseUrl: "https://api.test.com/v1",
      authType: "bearer" as const,
      models: ["model-1"],
      requiresApiKey: true,
      isLocal: false,
    };

    const result1 = validateModelProvider(validProvider);
    expect(result1.valid).toBe(true);

    // 无效 Provider（缺少必填字段）
    const invalidProvider = {
      label: "",
      baseUrl: "not-a-url",
      authType: "invalid-auth" as any,
    };

    const result2 = validateModelProvider(invalidProvider);
    expect(result2.valid).toBe(false);
    expect(result2.errors.length).toBeGreaterThan(0);
  });

  it("应支持 ConfiguredModel 验证", async () => {
    const { validateConfiguredModel } = await import("../lib/validators");

    // 有效 Model
    const validModel = {
      providerId: "openai",
      model: "gpt-4-turbo",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "sk-valid-key-12345678901234567890",
      createdAt: Date.now(),
      status: "active" as const,
    };

    const result1 = validateConfiguredModel(validModel);
    expect(result1.valid).toBe(true);

    // 无效 Model（缺少必填字段）
    const invalidModel = {
      providerId: "",
      model: "",
      baseUrl: "invalid",
    };

    const result2 = validateConfiguredModel(invalidModel);
    expect(result2.valid).toBe(false);
    expect(result2.errors.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 3️⃣ 批量操作优化 - 事务机制测试
// ============================================================

describe("🔄 批量操作优化 - 事务机制测试", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("应支持基本事务操作", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface TestItem { id: string; name: string; value: number; }

    const store = createLocalStore<TestItem>("test-transaction", [], "tx");

    // 开始事务
    const tx = store.transaction();

    // 在事务中添加多个项目
    tx.add({ name: "Item 1", value: 10 })
      .add({ name: "Item 2", value: 20 })
      .add({ name: "Item 3", value: 30 });

    // 提交前数据不应改变
    expect(store.count()).toBe(0);

    // 提交事务
    const committed = tx.commit();

    expect(committed).toBe(true);
    expect(store.count()).toBe(3);

    // 验证数据
    const items = store.getAll();
    expect(items.length).toBe(3);
  });

  it("应支持事务中的更新和删除", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface TestItem { id: string; name: string; value: number; }

    const store = createLocalStore<TestItem>("test-tx-update", [
      { id: "item-1", name: "Original", value: 100 },
      { id: "item-2", name: "To Remove", value: 200 },
    ], "item");

    const tx = store.transaction();

    tx.update("item-1", { name: "Updated", value: 150 })
      .remove("item-2")
      .add({ name: "New Item", value: 300 });

    tx.commit();

    expect(store.count()).toBe(2);

    const item1 = store.getById("item-1");
    expect(item1?.name).toBe("Updated");
    expect(item1?.value).toBe(150);

    expect(store.getById("item-2")).toBeUndefined();
  });

  it("应支持事务回滚", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface TestItem { id: string; name: string; }

    const store = createLocalStore<TestItem>("test-tx-rollback", [
      { id: "original", name: "Original Item" },
    ], "item");

    const initialCount = store.count();

    const tx = store.transaction();
    tx.remove("original")
      .add({ name: "Should Not Appear" });

    // 回滚而不是提交
    tx.rollback();

    // 数据应该保持不变
    expect(store.count()).toBe(initialCount);
    expect(store.getById("original")).toBeDefined();
  });

  it("应跟踪事务变更记录", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface TestItem { id: string; name: string; }

    const store = createLocalStore<TestItem>("test-tx-changes", [], "item");

    const tx = store.transaction();

    tx.add({ name: "A" })
      .add({ name: "B" });

    const changesBeforeCommit = tx.getChanges();
    expect(changesBeforeCommit.length).toBe(2);
    expect(changesBeforeCommit[0].type).toBe("add");

    tx.commit();

    const changesAfterCommit = tx.getChanges();
    expect(changesAfterCommit.length).toBe(2);
  });

  it("应支持批量删除事务", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface TestItem { id: string; name: string; }

    const store = createLocalStore<TestItem>("test-batch-remove", [
      { id: "keep-1", name: "Keep 1" },
      { id: "remove-1", name: "Remove 1" },
      { id: "remove-2", name: "Remove 2" },
      { id: "keep-2", name: "Keep 2" },
    ], "item");

    const tx = store.transaction();
    tx.removeBatch(["remove-1", "remove-2"]);
    tx.commit();

    expect(store.count()).toBe(2);
    expect(store.getById("keep-1")).toBeDefined();
    expect(store.getById("keep-2")).toBeDefined();
    expect(store.getById("remove-1")).toBeUndefined();
    expect(store.getById("remove-2")).toBeUndefined();
  });
});

// ============================================================
// 4️⃣ 缓存策略测试
// ============================================================

describe("⚡ 缓存策略 - 内存缓存层测试", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("应使用内存缓存减少 localStorage 读取", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface CacheItem { id: string; data: string; }

    const store = createLocalStore<CacheItem>("test-cache", [
      { id: "cached-1", data: "Cached Data 1" },
      { id: "cached-2", data: "Cached Data 2" },
    ], "cache");

    // 第一次读取（缓存未命中）
    store.getAll();
    let stats = store.getCacheStats();
    expect(stats.misses).toBe(1);
    expect(stats.hits).toBe(0);

    // 第二次读取（缓存命中）
    store.getAll();
    stats = store.getCacheStats();
    expect(stats.misses).toBe(1); // 不变
    expect(stats.hits).toBe(1);   // 增加

    // 第三次读取
    store.getAll();
    stats = store.getCacheStats();
    expect(stats.hits).toBe(2);
  });

  it("应支持清除缓存", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface CacheItem { id: string; data: string; }

    const store = createLocalStore<CacheItem>("test-clear-cache", [
      { id: "item-1", data: "Data 1" },
    ], "item");

    // 加载到缓存
    store.getAll();
    let stats = store.getCacheStats();
    expect(stats.misses).toBe(1);

    // 清除缓存
    store.clearCache();

    // 再次读取应该重新从 localStorage 加载
    store.getAll();
    stats = store.getCacheStats();
    expect(stats.misses).toBe(2); // 再次未命中
  });

  it("应正确统计写入次数", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface WriteItem { id: string; value: number; }

    const store = createLocalStore<WriteItem>("test-write-stats", [], "write");

    // 添加项目会触发写入
    store.add({ value: 1 });
    store.add({ value: 2 });
    store.add({ value: 3 });

    const stats = store.getCacheStats();
    expect(stats.writes).toBeGreaterThanOrEqual(3);
    expect(stats.size).toBe(3);
  });

  it("应记录最后同步时间", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface SyncItem { id: string; data: string; }

    const store = createLocalStore<SyncItem>("test-sync-time", [], "sync");

    // 初始时没有同步时间
    let stats = store.getCacheStats();
    expect(stats.lastSync).toBeNull();

    // 操作后应该有同步时间
    store.add({ data: "test" });
    stats = store.getCacheStats();
    expect(stats.lastSync).not.toBeNull();
    expect(typeof stats.lastSync).toBe("number");
    expect(stats.lastSync!).toBeLessThanOrEqual(Date.now());
  });

  it("应支持防抖保存优化频繁写入", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");

    interface DebounceItem { id: string; value: number; }

    // 使用防抖模式（100ms）
    const store = createLocalStore<DebounceItem>(
      "test-debounce",
      [],
      "debounce",
      { debounceMs: 100 }
    );

    // 快速连续添加多个项目
    for (let i = 0; i < 50; i++) {
      store.add({ value: i });
    }

    // 由于防抖，实际写入次数应该少于操作次数
    const stats = store.getCacheStats();
    expect(store.count()).toBe(50);
    // 注意：实际写入次数取决于防抖实现，这里只验证数据完整性
  });
});

// ============================================================
// 综合集成测试
// ============================================================

describe("🎯 综合集成 - 所有增强功能协同工作", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("应在事务中使用验证器", async () => {
    const { createLocalStore } = await import("../lib/create-local-store");
    const { validatePercentage } = await import("../lib/validators");

    interface ValidatedItem {
      id: string;
      name: string;
      percentage: number;
    }

    const store = createLocalStore<ValidatedItem>(
      "test-validation-integration",
      [],
      "val",
      {
        validator: (item) => {
          const errors: string[] = [];
          if (!item.name?.trim()) errors.push("[name] 不能为空");
          if (!validatePercentage(item.percentage ?? -1).valid) {
            errors.push("[percentage] 必须是 0-100 的数值");
          }
          return { valid: errors.length === 0, errors };
        },
      }
    );

    // 正常添加有效数据
    const item1 = store.add({ name: "Valid Item", percentage: 75 });
    expect(item1).toBeDefined();
    expect(store.count()).toBe(1);

    // 尝试添加无效数据应该抛出错误
    expect(() => {
      store.add({ name: "", percentage: 150 });
    }).toThrow();
  });

  it("应结合类型导出、验证和事务的完整流程", async () => {
    // 导入类型
    const { BUILTIN_PROVIDERS } = await import("../hooks/useModelProvider");
    const { validateModelProvider } = await import("../lib/validators");
    const { createLocalStore } = await import("../lib/create-local-store");

    // 验证内置供应商
    expect(BUILTIN_PROVIDERS.length).toBeGreaterThan(0);

    // 创建带验证的 Store
    interface ProviderConfig {
      id: string;
      label: string;
      baseUrl: string;
      isActive: boolean;
    }

    const providerStore = createLocalStore<ProviderConfig>(
      "test-full-integration",
      [],
      "prov",
      {
        validator: (item) => {
          const urlResult = typeof item.baseUrl === "string"
            ? (() => { try { new URL(item.baseUrl); return true; } catch { return false; } })()
            : false;

          return {
            valid: !!(item.label?.trim() && urlResult),
            errors: !item.label?.trim() ? ["label 不能为空"] :
                   !urlResult ? ["baseUrl 格式无效"] : [],
          };
        },
      }
    );

    // 使用事务批量添加配置
    const tx = providerStore.transaction();

    BUILTIN_PROVIDERS.slice(0, 3).forEach(provider => {
      tx.add({
        label: provider.label,
        baseUrl: provider.baseUrl,
        isActive: true,
      });
    });

    // 提交事务
    const success = tx.commit();
    expect(success).toBe(true);
    expect(providerStore.count()).toBe(3);

    // 验证数据完整性
    const providers = providerStore.getAll();
    providers.forEach(p => {
      expect(p.label).toBeTruthy();
      expect(p.baseUrl).toBeTruthy();
    });
  });
});
