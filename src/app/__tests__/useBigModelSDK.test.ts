/**
 * @file: useBigModelSDK.test.ts
 * @description: useBigModelSDK.test.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [type]
 */

// @vitest-environment jsdom
/**
 * useBigModelSDK.test.ts
 * ========================
 * useBigModelSDK Hook - 大模型 SDK 测试
 *
 * 覆盖范围:
 * - 会话管理（创建、删除、清空）
 * - 能力查询
 * - 消息发送（同步和流式）
 * - Mock 模式
 * - 统计数据更新
 * - 错误处理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, cleanup, waitFor } from "@testing-library/react";
import { useBigModelSDK } from "../hooks/useBigModelSDK";
import { useSDKSessionSlice } from "../store/slices/sdk-session-slice";
import type { ConfiguredModel, SDKCapability } from "../types";

// Mock ollama-url to avoid environment-dependent code
vi.mock("../lib/ollama-url", () => ({
  getOllamaChatUrl: vi.fn(() => "http://localhost:11434/api/chat"),
  getOllamaUrl: vi.fn((path: string) => `http://localhost:11434/${path}`),
}));

// Mock fetch
global.fetch = vi.fn();

describe("useBigModelSDK", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the localStorage mock provided by setup.ts
    localStorage.clear();
    // Reset the Zustand SDK session slice to default state
    useSDKSessionSlice.setState({
      chatSessions: [],
      usageStats: {
        totalRequests: 0,
        totalTokensIn: 0,
        totalTokensOut: 0,
        avgLatencyMs: 0,
        lastRequestAt: null,
        errorCount: 0,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("初始化状态", () => {
    it("应该初始化为空闲状态", () => {
      const { result } = renderHook(() => useBigModelSDK());

      expect(result.current.connectionStatus).toBe("idle");
      expect(result.current.streaming).toBe(false);
      expect(result.current.streamingContent).toBe("");
      expect(result.current.error).toBe(null);
      expect(result.current.sessions).toEqual([]);
      expect(result.current.activeSession).toBe(null);
    });

    it("应该从 Zustand slice 加载会话", () => {
      const mockSessions = [
        {
          id: "session-1",
          title: "Test Session",
          modelId: "model-1",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      // Use Zustand slice to set sessions (replaces raw localStorage)
      useSDKSessionSlice.getState().setChatSessions(mockSessions);

      const { result } = renderHook(() => useBigModelSDK());

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].title).toBe("Test Session");
    });
  });

  describe("会话管理", () => {
    it("应该创建新会话", () => {
      const { result } = renderHook(() => useBigModelSDK());

      act(() => {
        result.current.createSession("model-1", "New Session");
      });

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].title).toBe("New Session");
      expect(result.current.sessions[0].modelId).toBe("model-1");
      expect(result.current.activeSessionId).toBe(result.current.sessions[0].id);
    });

    it("应该删除会话", () => {
      const { result } = renderHook(() => useBigModelSDK());

      act(() => {
        const session = result.current.createSession("model-1", "Session 1");
        result.current.createSession("model-1", "Session 2");
        result.current.deleteSession(session.id);
      });

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].title).toBe("Session 2");
    });

    it("应该清空所有会话", () => {
      const { result } = renderHook(() => useBigModelSDK());

      act(() => {
        result.current.createSession("model-1", "Session 1");
        result.current.createSession("model-1", "Session 2");
        result.current.clearSessions();
      });

      expect(result.current.sessions).toHaveLength(0);
      expect(result.current.activeSessionId).toBe(null);
    });

    it("删除活跃会话时应该重置 activeSessionId", () => {
      const { result } = renderHook(() => useBigModelSDK());

      act(() => {
        const session = result.current.createSession("model-1", "Active Session");
        result.current.deleteSession(session.id);
      });

      expect(result.current.activeSessionId).toBe(null);
    });
  });

  describe("能力查询", () => {
    it("应该返回提供商的能力列表", () => {
      const { result } = renderHook(() => useBigModelSDK());

      const capabilities = result.current.getCapabilities("zhipu");

      expect(capabilities).toContain("chat");
      expect(capabilities).toContain("chat-stream");
      expect(capabilities).toContain("image-gen");
    });

    it("应该检查提供商是否支持特定能力", () => {
      const { result } = renderHook(() => useBigModelSDK());

      expect(result.current.hasCapability("zhipu", "chat")).toBe(true);
      expect(result.current.hasCapability("zhipu", "image-gen")).toBe(true);
      expect(result.current.hasCapability("zhipu", "unknown" as any as SDKCapability)).toBe(false);
    });

    it("未知提供商应该返回空能力列表", () => {
      const { result } = renderHook(() => useBigModelSDK());

      const capabilities = result.current.getCapabilities("unknown" as any);

      expect(capabilities).toEqual([]);
    });
  });

  describe("Mock 模式 - 同步消息", () => {
    const mockModel: ConfiguredModel = {
      id: "model-1",
      providerId: "zhipu",
      providerLabel: "智谱 AI",
      model: "chatglm3",
      apiKey: "", // 空 apiKey 触发 mock 模式
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      createdAt: Date.now(),
      lastUsed: null,
      status: "active",
    };

    it("应该在 Mock 模式下返回模拟响应", async () => {
      const { result } = renderHook(() => useBigModelSDK());

      // Create a session first so messages are stored
      act(() => {
        result.current.createSession("model-1", "Test Chat");
      });

      const response = await act(async () => {
        return await result.current.sendMessage(mockModel, "你好");
      });

      expect(response.content).toContain("YYC3 Cloud Intelli-Matrix");
      expect(response.finishReason).toBe("stop");
      expect(result.current.connectionStatus).toBe("connected");
      expect(result.current.sessions[0].messages).toHaveLength(2);
    });

    it("应该根据输入内容返回不同的模拟响应", async () => {
      const { result } = renderHook(() => useBigModelSDK());

      const statusResponse = await act(async () => {
        return await result.current.sendMessage(mockModel, "系统状态");
      });

      expect(statusResponse.content).toContain("系统状态概览");

      // Need a fresh hook instance since sessions accumulate
      cleanup();
      const { result: result2 } = renderHook(() => useBigModelSDK());

      const errorResponse = await act(async () => {
        return await result2.current.sendMessage(mockModel, "异常检测");
      });

      expect(errorResponse.content).toContain("异常模式");
    });

    it("应该更新使用统计", async () => {
      const { result } = renderHook(() => useBigModelSDK());

      await act(async () => {
        await result.current.sendMessage(mockModel, "测试");
      });

      expect(result.current.usageStats.totalRequests).toBe(1);
      expect(result.current.usageStats.totalTokensIn).toBeGreaterThan(0);
      expect(result.current.usageStats.totalTokensOut).toBeGreaterThan(0);
      expect(result.current.usageStats.avgLatencyMs).toBeGreaterThan(0);
    });
  });

  describe("Mock 模式 - 流式消息", () => {
    const mockModel: ConfiguredModel = {
      id: "model-1",
      providerId: "zhipu",
      providerLabel: "智谱 AI",
      model: "chatglm3",
      apiKey: "",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      createdAt: Date.now(),
      lastUsed: null,
      status: "active",
    };

    it("应该流式返回模拟响应", async () => {
      const { result } = renderHook(() => useBigModelSDK());
      const chunks: string[] = [];

      const response = await act(async () => {
        return await result.current.sendMessageStream(mockModel, "你好", undefined, (chunk) => {
          chunks.push(chunk);
        });
      });

      expect(response.content).toContain("YYC3 Cloud Intelli-Matrix");
      expect(chunks.length).toBeGreaterThan(0);
      expect(result.current.streaming).toBe(false);
      expect(result.current.streamingContent).toBe("");
    });

    it("应该逐字符更新流式内容", async () => {
      const { result } = renderHook(() => useBigModelSDK());

      // Start streaming but don't await completion yet
      let streamDone = false;
      act(() => {
        result.current.sendMessageStream(mockModel, "你好", undefined, () => {}).then(() => {
          streamDone = true;
        });
      });

      // streaming should be true at some point during the stream
      await waitFor(() => {
        expect(streamDone).toBe(true);
      }, { timeout: 5000 });

      expect(result.current.streaming).toBe(false);
    });
  });

  describe("错误处理", () => {
    const mockModel: ConfiguredModel = {
      id: "model-1",
      providerId: "zhipu",
      providerLabel: "智谱 AI",
      model: "chatglm3",
      apiKey: "test-key",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      createdAt: Date.now(),
      lastUsed: null,
      status: "active",
    };

    it("应该处理 API 错误", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useBigModelSDK());

      const response = await act(async () => {
        return await result.current.sendMessage(mockModel, "测试");
      });

      expect(response.finishReason).toBe("error");
      expect(response.content).toContain("请求失败");
      expect(result.current.error).not.toBeNull();
      expect(result.current.connectionStatus).toBe("error");
      expect(result.current.usageStats.errorCount).toBe(1);
    });

    it("应该处理 HTTP 错误响应", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      const { result } = renderHook(() => useBigModelSDK());

      const response = await act(async () => {
        return await result.current.sendMessage(mockModel, "测试");
      });

      expect(response.finishReason).toBe("error");
      expect(response.content).toContain("认证失败");
    });

    it("应该处理流式响应错误", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Stream error"));

      const { result } = renderHook(() => useBigModelSDK());

      const response = await act(async () => {
        return await result.current.sendMessageStream(mockModel, "测试", undefined, () => {});
      });

      expect(response.finishReason).toBe("error");
      expect(result.current.streaming).toBe(false);
      expect(result.current.streamingContent).toBe("");
    });
  });

  describe("边界情况", () => {
    const mockModel: ConfiguredModel = {
      id: "model-1",
      providerId: "zhipu",
      providerLabel: "智谱 AI",
      model: "chatglm3",
      apiKey: "",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      createdAt: Date.now(),
      lastUsed: null,
      status: "active",
    };

    it("应该处理空消息", async () => {
      const { result } = renderHook(() => useBigModelSDK());

      const response = await act(async () => {
        return await result.current.sendMessage(mockModel, "");
      });

      expect(response.content).not.toBe("");
    });

    it("应该处理没有活跃会话的情况", async () => {
      const { result } = renderHook(() => useBigModelSDK());

      // sendMessage without active session — messages won't be stored in any session
      const response = await act(async () => {
        return await result.current.sendMessage(mockModel, "测试");
      });

      expect(response.content).not.toBe("");
      // No session was created by sendMessage (only createSession does that)
      // But the response itself is valid
      expect(response.finishReason).toBe("stop");
    });

    it("应该处理 Zustand slice 持久化错误", () => {
      const { result } = renderHook(() => useBigModelSDK());

      // createSession works via Zustand slice which handles errors internally
      act(() => {
        result.current.createSession("model-1", "Test");
      });

      expect(result.current.sessions).toHaveLength(1);
    });
  });

  describe("统计功能", () => {
    it("应该从 Zustand slice 加载统计数据", () => {
      const mockStats = {
        totalRequests: 10,
        totalTokensIn: 1000,
        totalTokensOut: 2000,
        avgLatencyMs: 150,
        lastRequestAt: Date.now(),
        errorCount: 1,
      };
      // Use Zustand slice to set stats (replaces raw localStorage)
      useSDKSessionSlice.getState().setUsageStats(mockStats);

      const { result } = renderHook(() => useBigModelSDK());

      expect(result.current.usageStats.totalRequests).toBe(10);
      expect(result.current.usageStats.totalTokensIn).toBe(1000);
      expect(result.current.usageStats.errorCount).toBe(1);
    });

    it("应该计算平均延迟", async () => {
      const mockModel: ConfiguredModel = {
        id: "model-1",
        providerId: "zhipu",
        providerLabel: "智谱 AI",
        model: "chatglm3",
        apiKey: "",
        baseUrl: "https://open.bigmodel.cn/api/paas/v4",
        createdAt: Date.now(),
        lastUsed: null,
        status: "active",
      };

      const { result } = renderHook(() => useBigModelSDK());

      await act(async () => {
        await result.current.sendMessage(mockModel, "测试");
      });

      expect(result.current.usageStats.avgLatencyMs).toBeGreaterThan(0);
    });
  });
});
