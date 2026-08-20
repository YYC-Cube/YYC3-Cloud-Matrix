/**
 * @file: useTerminal.test.tsx
 * @description: useTerminal.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * useTerminal.test.tsx
 * ============
 * useTerminal Hook - CLI 终端模拟测试
 *
 * 覆盖范围:
 * - 初始状态（欢迎消息）
 * - 命令执行（cpim status / node / alerts / help / clear）
 * - 未知命令错误提示
 * - 输入历史导航
 * - 自动补全
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act , cleanup } from "@testing-library/react";
import { useTerminal } from "../modules/dev/hooks/useTerminal";

describe("useTerminal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });


  // ----------------------------------------------------------
  // 初始状态
  // ----------------------------------------------------------

  describe("初始状态", () => {
    it("history 应有欢迎消息", () => {
      const { result } = renderHook(() => useTerminal());
      expect(result.current.history.length).toBe(1);
      expect(result.current.history[0].output).toContain("YYC³");
    });

    it("inputValue 应为空", () => {
      const { result } = renderHook(() => useTerminal());
      expect(result.current.inputValue).toBe("");
    });

    it("completions 应为空", () => {
      const { result } = renderHook(() => useTerminal());
      expect(result.current.completions.length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 命令执行
  // ----------------------------------------------------------

  describe("命令执行", () => {
    it("help 应显示帮助信息", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("help");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("cpim status");
      expect(last.status).toBe("info");
    });

    it("cpim status 应显示系统状态", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim status");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("活跃节点");
      expect(last.output).toContain("GPU 利用率");
      expect(last.status).toBe("success");
    });

    it("cpim node 应列出节点", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim node");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("GPU-A100-01");
      expect(last.status).toBe("success");
    });

    it("cpim node GPU-A100-01 应显示节点详情", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim node GPU-A100-01");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("节点详情");
      expect(last.status).toBe("success");
    });

    it("cpim alerts 应列出告警", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim alerts");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("AL-0032");
      expect(last.status).toBe("success");
    });

    it("cpim model list 应列出模型", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim model list");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("LLaMA-70B");
    });

    it("cpim patrol run --full 应执行巡查", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim patrol run --full");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("巡查完成");
    });

    it("cpim report 应生成报告", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim report");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("报告已生成");
    });

    it("cpim config list 应列出配置", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim config list");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("patrol.interval");
    });

    it("cpim config set key value 应设置成功", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim config set patrol.interval 30");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("已更新");
      expect(last.status).toBe("success");
    });

    it("clear 应清空历史", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim status");
      });
      act(() => {
        result.current.execute("clear");
      });
      expect(result.current.history.length).toBe(0);
    });

    it("空输入不应添加历史", () => {
      const { result } = renderHook(() => useTerminal());
      const before = result.current.history.length;
      act(() => {
        result.current.execute("");
      });
      expect(result.current.history.length).toBe(before);
    });

    it("未知命令应返回错误", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("foobar");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("命令未找到");
      expect(last.status).toBe("error");
    });

    it("未知 cpim 子命令应返回错误", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim foobar");
      });
      const last = result.current.history[result.current.history.length - 1];
      expect(last.output).toContain("未知子命令");
      expect(last.status).toBe("error");
    });
  });

  // ----------------------------------------------------------
  // 输入管理
  // ----------------------------------------------------------

  describe("输入管理", () => {
    it("handleInputChange 应更新输入值", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.handleInputChange("cpim");
      });
      expect(result.current.inputValue).toBe("cpim");
    });

    it("execute 后应清空输入", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.handleInputChange("help");
      });
      act(() => {
        result.current.execute("help");
      });
      expect(result.current.inputValue).toBe("");
    });
  });

  // ----------------------------------------------------------
  // 自动补全
  // ----------------------------------------------------------

  describe("自动补全", () => {
    it("输入 cp 应补全 cpim", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.handleInputChange("cp");
      });
      expect(result.current.completions).toContain("cpim");
    });

    it("输入 cpim st 应补全 status", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.handleInputChange("cpim st");
      });
      expect(result.current.completions).toContain("status");
    });

    it("applyCompletion 应更新输入值", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.handleInputChange("cpim st");
      });
      act(() => {
        result.current.applyCompletion("status");
      });
      expect(result.current.inputValue).toContain("status");
    });

    it("空输入应无补全", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.handleInputChange("");
      });
      expect(result.current.completions.length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 历史导航
  // ----------------------------------------------------------

  describe("历史导航", () => {
    it("执行命令后应能上下导航历史", () => {
      const { result } = renderHook(() => useTerminal());
      act(() => {
        result.current.execute("cpim status");
      });
      act(() => {
        result.current.execute("help");
      });

      act(() => {
        result.current.handleHistoryNav("up");
      });
      expect(result.current.inputValue).toBe("help");

      act(() => {
        result.current.handleHistoryNav("up");
      });
      expect(result.current.inputValue).toBe("cpim status");

      act(() => {
        result.current.handleHistoryNav("down");
      });
      expect(result.current.inputValue).toBe("help");

      act(() => {
        result.current.handleHistoryNav("down");
      });
      expect(result.current.inputValue).toBe("");
    });
  });
});
