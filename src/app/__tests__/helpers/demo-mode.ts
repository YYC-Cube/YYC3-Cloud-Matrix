/**
 * @file: demo-mode.ts
 * @description: 测试辅助 · 演示模式开关
 *
 * 存量测试断言的是「演示模式开启」下的模拟数据行为。
 * 生产默认 demoMode=false（DEFAULT_TOGGLES），因此消费 demoMode 的
 * hooks/组件测试需在 beforeEach 显式开启。
 *
 * 关闭态（生产语义）由 demo-mode-off.test.ts 专项覆盖。
 */

import { beforeEach } from "vitest";
import { useSettingsSSOT } from "../../store/slices/settings-ssot-slice";

/** 在当前测试文件的每个用例前开启演示模式 */
export function enableDemoModeForTests(): void {
  beforeEach(() => {
    useSettingsSSOT.setState((state) => ({
      toggles: { ...state.toggles, demoMode: true },
    }));
  });
}
