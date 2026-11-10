/**
 * @file: config-reactivity.test.tsx
 * @description: P0 修复验证 —— 配置「编辑即生效」响应式链路测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-11-10
 * @updated: 2026-11-10
 * @status: active
 * @tags: [test],[config],[reactivity],[p0]
 *
 * @brief: 覆盖此前从未测试过的维度——写入后 UI 无刷新即时反映
 *
 * @details:
 * - page-config：updatePageConfig/resetPageConfig → usePageConfigById 即时反映
 * - page-config：getMergedPageConfig 快照引用稳定（useSyncExternalStore 不无限循环）
 * - page-config：window "storage" 事件跨标签同步
 * - variable-center：setVariableValue/resetVariableValue → useVariable 即时反映
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  PAGE_REGISTRY,
  updatePageConfig,
  resetPageConfig,
  resetAllPageConfigs,
  getMergedPageConfig,
  getNavVisibilitySnapshot,
} from "../config";
import {
  setVariableValue,
  resetVariableValue,
  resetAllVariableValues,
  getVariableValuesSnapshot,
} from "../config/variable-center";
import { usePageConfigById } from "../hooks/usePageConfig";
import { useVariable } from "../hooks/useVariables";

const TEST_PAGE_ID = "data-monitoring"; // PAGE_REGISTRY 中真实存在的页面

describe("P0 配置响应式链路（编辑即生效）", () => {
  beforeEach(() => {
    resetAllPageConfigs();
    resetAllVariableValues();
  });

  describe("page-config", () => {
    it("updatePageConfig 后 usePageConfigById 无刷新即时反映", () => {
      const { result } = renderHook(() => usePageConfigById(TEST_PAGE_ID));
      const originalTitle = result.current.config?.title;
      expect(originalTitle).toBe(PAGE_REGISTRY[TEST_PAGE_ID].title);

      act(() => {
        updatePageConfig(TEST_PAGE_ID, { title: "改后标题-E2E" });
      });

      expect(result.current.config?.title).toBe("改后标题-E2E");
    });

    it("resetPageConfig 后恢复注册表默认值", () => {
      const { result } = renderHook(() => usePageConfigById(TEST_PAGE_ID));

      act(() => {
        updatePageConfig(TEST_PAGE_ID, { title: "临时标题" });
      });
      expect(result.current.config?.title).toBe("临时标题");

      act(() => {
        resetPageConfig(TEST_PAGE_ID);
      });
      expect(result.current.config?.title).toBe(PAGE_REGISTRY[TEST_PAGE_ID].title);
    });

    it("getMergedPageConfig 快照引用稳定（不触发无限重渲染）", () => {
      const a = getMergedPageConfig(TEST_PAGE_ID);
      const b = getMergedPageConfig(TEST_PAGE_ID);
      expect(a).toBe(b); // 同一引用

      act(() => {
        updatePageConfig(TEST_PAGE_ID, { title: "引用失效测试" });
      });

      const c = getMergedPageConfig(TEST_PAGE_ID);
      expect(c).not.toBe(a); // 变更后新引用
      expect(getMergedPageConfig(TEST_PAGE_ID)).toBe(c); // 再次读取仍稳定
    });

    it("跨标签页 storage 事件触发订阅者更新", () => {
      const { result } = renderHook(() => usePageConfigById(TEST_PAGE_ID));

      // 模拟另一标签页直接写 localStorage 并广播 storage 事件
      const overrides = {
        [TEST_PAGE_ID]: {
          pageId: TEST_PAGE_ID,
          overrides: { title: "来自另一标签页" },
          updatedAt: Date.now(),
        },
      };
      act(() => {
        localStorage.setItem("yyc3-page-configs", JSON.stringify(overrides));
        window.dispatchEvent(
          new StorageEvent("storage", { key: "yyc3-page-configs" })
        );
      });

      expect(result.current.config?.title).toBe("来自另一标签页");
    });

    it("导航可见性快照随 sidebar.showInNav 覆盖即时更新", () => {
      const page = PAGE_REGISTRY[TEST_PAGE_ID];
      const before = getNavVisibilitySnapshot();
      expect(before[page.path]).toBe(true);

      act(() => {
        updatePageConfig(TEST_PAGE_ID, { sidebar: { ...page.sidebar, showInNav: false } });
      });

      const after = getNavVisibilitySnapshot();
      expect(after[page.path]).toBe(false);
    });
  });

  describe("variable-center", () => {
    it("setVariableValue 后 useVariable 无刷新即时反映", () => {
      const { result } = renderHook(() => useVariable("system.language"));

      act(() => {
        setVariableValue("system.language", "en-US");
      });

      expect(result.current.value).toBe("en-US");
      expect(result.current.isModified).toBe(true);
    });

    it("resetVariableValue 后回到默认值", () => {
      const { result } = renderHook(() => useVariable("system.language"));

      act(() => {
        setVariableValue("system.language", "en-US");
      });
      expect(result.current.value).toBe("en-US");

      act(() => {
        resetVariableValue("system.language");
      });
      expect(result.current.isDefault).toBe(true);
    });

    it("变量值快照引用稳定", () => {
      const a = getVariableValuesSnapshot();
      const b = getVariableValuesSnapshot();
      expect(a).toBe(b);

      act(() => {
        setVariableValue("system.language", "zh-CN");
      });

      const c = getVariableValuesSnapshot();
      expect(c).not.toBe(a);
    });
  });
});
