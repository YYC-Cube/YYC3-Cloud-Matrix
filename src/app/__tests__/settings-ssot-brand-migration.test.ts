/**
 * @file: settings-ssot-brand-migration.test.ts
 * @description: 设置 SSOT 持久层品牌迁移测试（persist v1 → v2，A1 主选命名落地）
 * @author: YYC³ Team
 * @version: v1.0.0
 * @created: 2026-11-10
 * @status: active
 * @tags: [store],[persist],[migration],[brand]
 *
 * @brief: 验证旧版本持久化状态中的旧默认品牌值被迁移为新默认，用户自定义值不被覆盖
 */

// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "yyc3-settings-ssot";
const NEW_FULL_NAME = "言语云枢 · YYC³ PivotMatrix Ops 异构算力矩阵运维面板 v3.4.1";
const NEW_BRAND = "言语云枢·智能矩阵";

/** 向 localStorage 播种一份 v1 持久化状态，然后重新引入 store 触发 rehydrate + migrate
 *  注：真实 v1 装机在首次运行后 _migrated 已为 true（legacy 归并分支已跳过），
 *  本 helper 模拟的正是这种「健康的 v1 存量装机」 */
async function rehydrateWithV1(values: Record<string, string>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: {
        values,
        runtime: { autoRefresh: true, refreshInterval: 5000 },
        _migrated: true,
      },
      version: 1,
    })
  );
  vi.resetModules();
  const mod = await import("../store/slices/settings-ssot-slice");
  return mod.useSettingsSSOT;
}

describe("设置 SSOT 品牌迁移（persist v1 → v2）", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("旧默认 brandName（YanYuCloudCube）应迁移为新默认品牌名", async () => {
    const store = await rehydrateWithV1({
      brandName: "YanYuCloudCube",
      systemName: "YYC³ Cloud Intelli-Matrix v3.4",
      language: "zh-CN",
    });
    expect(store.getState().values.brandName).toBe(NEW_BRAND);
  });

  it("旧默认 systemName（Cloud Intelli-Matrix 前缀）应迁移为新全称", async () => {
    const store = await rehydrateWithV1({
      brandName: "YanYuCloudCube",
      systemName: "YYC³ Cloud Intelli-Matrix v3.4",
      language: "zh-CN",
    });
    expect(store.getState().values.systemName).toBe(NEW_FULL_NAME);
  });

  it("v3.2 时代的旧 systemName 同样应被迁移", async () => {
    const store = await rehydrateWithV1({
      brandName: "YanYuCloudCube",
      systemName: "YYC³ Cloud Intelli-Matrix v3.2",
      language: "zh-CN",
    });
    expect(store.getState().values.systemName).toBe(NEW_FULL_NAME);
  });

  it("用户自定义品牌值不得被迁移覆盖", async () => {
    const store = await rehydrateWithV1({
      brandName: "我的自定义品牌",
      systemName: "我的集群自定义名称",
      language: "zh-CN",
    });
    expect(store.getState().values.brandName).toBe("我的自定义品牌");
    expect(store.getState().values.systemName).toBe("我的集群自定义名称");
  });

  it("迁移后 persist 版本应升级为 2", async () => {
    await rehydrateWithV1({
      brandName: "YanYuCloudCube",
      systemName: "YYC³ Cloud Intelli-Matrix v3.4",
      language: "zh-CN",
    });
    // zustand persist 在 rehydrate 后会以当前 version 回写
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).version).toBe(2);
  });

  it("legacy 归并路径（yyc3_system_settings 旧品牌）应被归一化", async () => {
    // 模拟从未运行过 SSOT 版本、但存在旧版系统设置存量的装机
    localStorage.setItem(
      "yyc3_system_settings",
      JSON.stringify({
        values: { brandName: "YanYuCloudCube", systemName: "YYC³ Cloud Intelli-Matrix v3.2" },
      })
    );
    vi.resetModules();
    const mod = await import("../store/slices/settings-ssot-slice");
    const values = mod.useSettingsSSOT.getState().values;
    expect(values.brandName).toBe(NEW_BRAND);
    expect(values.systemName).toBe(NEW_FULL_NAME);
  });

  it("legacy 归并路径中的用户自定义品牌值不得被覆盖", async () => {
    localStorage.setItem(
      "yyc3_system_settings",
      JSON.stringify({
        values: { brandName: "我的自定义品牌", systemName: "我的集群自定义名称" },
      })
    );
    vi.resetModules();
    const mod = await import("../store/slices/settings-ssot-slice");
    const values = mod.useSettingsSSOT.getState().values;
    expect(values.brandName).toBe("我的自定义品牌");
    expect(values.systemName).toBe("我的集群自定义名称");
  });
});
