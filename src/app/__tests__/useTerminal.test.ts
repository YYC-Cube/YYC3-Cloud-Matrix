/**
 * @file: useTerminal.test.ts
 * @description: useTerminal.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTerminal } from "../modules/dev/hooks/useTerminal";

vi.mock("../lib/env-config", () => ({
  env: vi.fn((key) => {
    const defaults: Record<string, string> = {
      SYSTEM_NAME: "CP-IM Cloud",
      SYSTEM_VERSION: "1.0.0",
      WS_ENDPOINT: "ws://localhost:8080",
      OLLAMA_BASE_URL: "http://localhost:11434",
      STORAGE_PREFIX: "yyc3_",
      ENABLE_MOCK_MODE: "true",
    };
    return defaults[key] || "";
  }),
  getEnvConfig: vi.fn(() => ({
    SYSTEM_NAME: "CP-IM Cloud",
    SYSTEM_VERSION: "1.0.0",
    WS_ENDPOINT: "ws://localhost:8080",
    OLLAMA_BASE_URL: "http://localhost:11434",
    STORAGE_PREFIX: "yyc3_",
    ENABLE_MOCK_MODE: true,
    DEFAULT_AI_TEMPERATURE: 0.7,
    ENABLE_DEBUG: false,
  })),
  setEnvConfig: vi.fn((updates) => ({ ...updates })),
  resetEnvConfig: vi.fn(() => ({})),
  exportEnvConfig: vi.fn(() => JSON.stringify({ SYSTEM_NAME: "CP-IM Cloud" }, null, 2)),
}));

import { env, getEnvConfig, setEnvConfig, resetEnvConfig, exportEnvConfig } from "../lib/env-config";

describe("useTerminal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with welcome message", () => {
      const { result } = renderHook(() => useTerminal());

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].output).toContain("CP-IM Cloud CLI");
      expect(result.current.inputValue).toBe("");
      expect(result.current.completions).toEqual([]);
    });

    it("should accept custom tabId", () => {
      const { result } = renderHook(() => useTerminal({ tabId: "custom-tab" }));

      expect(result.current.history[0].id).toContain("custom-tab");
    });
  });

  describe("command execution", () => {
    it("should execute help command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("help");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("CPIM 命令");
      expect(result.current.inputValue).toBe("");
    });

    it("should execute clear command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("help");
      });

      expect(result.current.history.length).toBeGreaterThan(1);

      act(() => {
        result.current.execute("clear");
      });

      expect(result.current.history).toHaveLength(0);
    });

    it("should execute cpim status command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim status");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
      expect(result.current.history[1].output).toContain("活跃节点");
    });

    it("should execute cpim node command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim node");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("节点列表");
    });

    it("should execute cpim node restart command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim node restart");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("重启节点");
    });

    it("should execute cpim node restart --force command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim node restart --force");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("强制");
    });

    it("should execute cpim model list command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim model list");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("已部署模型");
    });

    it("should execute cpim model deploy command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim model deploy LLaMA-70B");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("部署模型");
    });

    it("should execute cpim patrol run command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim patrol run");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("巡查");
    });

    it("should execute cpim patrol run --full command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim patrol run --full");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("完整模式");
    });

    it("should execute cpim patrol history command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim patrol history");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("巡查历史");
    });

    it("should execute cpim report command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim report");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("生成报告");
    });

    it("should execute cpim report --type health command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim report --type health");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("健康");
    });

    it("should execute cpim config list command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim config list");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("系统配置");
    });

    it("should execute cpim config get command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim config get patrol.interval");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("patrol.interval");
    });

    it("should execute cpim config set command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim config set patrol.interval 30");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("已更新");
    });

    it("should execute cpim alerts command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cpim alerts");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("告警列表");
    });

    it("should execute ls command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("ls");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute ls with directory", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("ls logs");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute ls with invalid directory", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("ls invalid");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("error");
    });

    it("should execute pwd command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("pwd");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("cpim-cloudpivot");
    });

    it("should execute whoami command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("whoami");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("admin");
    });

    it("should execute date command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("date");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute uptime command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("uptime");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute neofetch command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("neofetch");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("info");
    });

    it("should execute fastfetch command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("fastfetch");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("info");
    });

    it("should execute htop command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("htop");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("info");
    });

    it("should execute top command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("top");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("info");
    });

    it("should execute ping command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("ping");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute ping with host", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("ping 192.168.3.1");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute df command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("df");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute echo command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("echo hello world");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toBe("hello world");
    });

    it("should execute cat command with patrol.json", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cat configs/patrol.json");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute cat command with alerts.json", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cat configs/alerts.json");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute cat command with templates.json", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cat configs/templates.json");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute cat command with env.json", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cat configs/env.json");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute cat command with invalid file", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cat invalid.json");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("error");
    });

    it("should execute cat command without file", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cat");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("error");
    });

    it("should execute cd command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("cd /logs");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute history command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("history");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("info");
    });

    it("should execute exit command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("exit");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("info");
    });

    it("should execute quit command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("quit");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("info");
    });
  });

  describe("env commands", () => {
    it("should execute env list command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("env list");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("环境变量配置");
      expect(getEnvConfig).toHaveBeenCalled();
    });

    it("should execute env get command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("env get SYSTEM_NAME");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
    });

    it("should execute env set command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("env set SYSTEM_NAME \"New Name\"");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
      expect(setEnvConfig).toHaveBeenCalled();
    });

    it("should execute env reset command with confirmation", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("env reset --confirm");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("success");
      expect(resetEnvConfig).toHaveBeenCalled();
    });

    it("should execute env export command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("env export");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("环境变量导出 JSON");
      expect(exportEnvConfig).toHaveBeenCalled();
    });
  });

  describe("navigation commands", () => {
    it("should execute goto command with valid path", () => {
      const onNavigate = vi.fn();
      const { result } = renderHook(() => useTerminal({ onNavigate }));

      act(() => {
        result.current.execute("goto /");
      });

      expect(result.current.history).toHaveLength(2);
      expect(onNavigate).toHaveBeenCalledWith("/");
    });

    it("should execute goto command without path", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("goto");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("用法");
    });

    it("should execute open command", () => {
      const onNavigate = vi.fn();
      const { result } = renderHook(() => useTerminal({ onNavigate }));

      act(() => {
        result.current.execute("open /patrol");
      });

      expect(onNavigate).toHaveBeenCalledWith("/patrol");
    });
  });

  describe("AI Text-to-CLI", () => {
    it("should execute ai command and auto-execute suggestion", async () => {
      const onNavigate = vi.fn();
      const { result } = renderHook(() => useTerminal({ onNavigate }));

      act(() => {
        result.current.execute("ai 查看节点状态");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("AI Text-to-CLI");
      expect(result.current.history[1].output).toContain("cpim node");

      await waitFor(() => {
        expect(result.current.history).toHaveLength(3);
      });
    });

    it("should show help when ai command has no prompt", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("ai");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].output).toContain("用法");
    });
  });

  describe("input handling", () => {
    it("should update input value", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.handleInputChange("test");
      });

      expect(result.current.inputValue).toBe("test");
    });

    it("should clear completions when input is empty", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.handleInputChange("cp");
      });

      expect(result.current.completions.length).toBeGreaterThan(0);

      act(() => {
        result.current.handleInputChange("");
      });

      expect(result.current.completions).toEqual([]);
    });

    it("should provide completions for cpim command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.handleInputChange("cpim s");
      });

      expect(result.current.completions).toContain("status");
    });

    it("should provide completions for env command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.handleInputChange("env l");
      });

      expect(result.current.completions).toContain("list");
    });

    it("should provide completions for goto command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.handleInputChange("goto /p");
      });

      expect(result.current.completions.length).toBeGreaterThan(0);
    });
  });

  describe("history navigation", () => {
    it("should navigate up in history", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("command1");
      });

      act(() => {
        result.current.execute("command2");
      });

      act(() => {
        result.current.handleHistoryNav("up");
      });

      expect(result.current.inputValue).toBe("command2");
    });

    it("should navigate down in history", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("command1");
      });

      act(() => {
        result.current.handleHistoryNav("up");
      });

      expect(result.current.inputValue).toBe("command1");

      act(() => {
        result.current.handleHistoryNav("down");
      });

      expect(result.current.inputValue).toBe("");
    });

    it("should handle empty history", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.handleHistoryNav("up");
      });

      expect(result.current.inputValue).toBe("");
    });
  });

  describe("completion application", () => {
    it("should apply completion", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.handleInputChange("cpim s");
      });

      const completion = result.current.completions[0];

      act(() => {
        result.current.applyCompletion(completion);
      });

      expect(result.current.inputValue).toContain(completion);
      expect(result.current.inputValue.endsWith(" ")).toBe(true);
    });

    it("should apply completion for ls command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.handleInputChange("ls l");
      });

      const completion = result.current.completions[0];

      act(() => {
        result.current.applyCompletion(completion);
      });

      expect(result.current.inputValue).toContain(completion);
      expect(result.current.inputValue.endsWith(" ")).toBe(true);
    });

    it("should apply completion for cat command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.handleInputChange("cat c");
      });

      const completion = result.current.completions[0];

      act(() => {
        result.current.applyCompletion(completion);
      });

      expect(result.current.inputValue).toContain(completion);
      expect(result.current.inputValue.endsWith(" ")).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle unknown command", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("unknown-command");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("error");
      expect(result.current.history[1].output).toContain("命令未找到");
    });

    it("should handle invalid env variable", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("env get INVALID_VAR");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("error");
    });

    it("should handle invalid goto path", () => {
      const { result } = renderHook(() => useTerminal());

      act(() => {
        result.current.execute("goto /invalid-path");
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].status).toBe("error");
    });
  });

  describe("integration", () => {
    it("should handle complete workflow", () => {
      const onNavigate = vi.fn();
      const { result } = renderHook(() => useTerminal({ onNavigate }));

      // Execute multiple commands
      act(() => {
        result.current.execute("help");
      });

      act(() => {
        result.current.execute("cpim status");
      });

      act(() => {
        result.current.execute("env list");
      });

      act(() => {
        result.current.execute("goto /");
      });

      expect(result.current.history).toHaveLength(5);
      expect(onNavigate).toHaveBeenCalledWith("/");
    });
  });
});
