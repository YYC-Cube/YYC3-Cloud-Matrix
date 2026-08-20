/**
 * @file: useAgentOrchestrator.ts
 * @description: YYC³ Agent 编排 React Hook · 任务提交与状态追踪
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [hooks],[agent]
 *
 * @brief: React Hook 封装 AgentOrchestrator，供组件消费编排能力
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { getAgentOrchestrator, registerBuiltinAgents } from "../lib/agent";
import type { AgentTask, AgentStatus, TaskPriority, TaskDecomposition } from "../lib/agent/agent-types";

// ============================================================
// Hook
// ============================================================

export interface UseAgentOrchestratorReturn {
  /** 所有 Agent 状态 */
  agentStatuses: AgentStatus[];
  /** 所有任务 */
  tasks: AgentTask[];
  /** 提交任务 */
  submitTask: (description: string, priority?: TaskPriority, preferredAgent?: string) => Promise<AgentTask>;
  /** 提交协作任务 */
  submitCollaborativeTask: (description: string, priority?: TaskPriority) => Promise<AgentTask[]>;
  /** 分解任务 (预览) */
  decomposeTask: (description: string) => TaskDecomposition;
  /** 最近完成的任务 */
  lastTask: AgentTask | null;
  /** 是否正在执行 */
  loading: boolean;
  /** 错误 */
  error: string | null;
  /** 刷新状态 */
  refresh: () => void;
}

export function useAgentOrchestrator(autoInit = true): UseAgentOrchestratorReturn {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [lastTask, setLastTask] = useState<AgentTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  const refresh = useCallback(() => {
    const orch = getAgentOrchestrator();
    setAgentStatuses(orch.getAllStatuses());
    setTasks(orch.getAllTasks());
  }, []);

  useEffect(() => {
    if (!autoInit || initialized.current) {return;}
    initialized.current = true;
    registerBuiltinAgents();
    refresh();
  }, [autoInit, refresh]);

  const submitTask = useCallback(async (
    description: string,
    priority: TaskPriority = "normal",
    preferredAgent?: string,
  ): Promise<AgentTask> => {
    setLoading(true);
    setError(null);
    try {
      const orch = getAgentOrchestrator();
      const result = await orch.submitTask(description, priority, preferredAgent);
      setLastTask(result);
      refresh();
      if (result.status === "failed") {
        setError(result.error ?? "任务失败");
      }
      return result;
    } catch (err: unknown) {
      const msg = (err as Error).message;
      setError(msg);
      return {
        id: "error",
        description,
        priority,
        status: "failed",
        assigneeId: null,
        steps: [],
        dependencies: [],
        createdAt: Date.now(),
        error: msg,
      };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const submitCollaborativeTask = useCallback(async (
    description: string,
    priority: TaskPriority = "normal",
  ): Promise<AgentTask[]> => {
    setLoading(true);
    setError(null);
    try {
      const orch = getAgentOrchestrator();
      const results = await orch.submitCollaborativeTask(description, priority);
      refresh();
      return results;
    } catch (err: unknown) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const decomposeTask = useCallback((description: string): TaskDecomposition => {
    const orch = getAgentOrchestrator();
    return orch.decomposeTask(description);
  }, []);

  return {
    agentStatuses,
    tasks,
    submitTask,
    submitCollaborativeTask,
    decomposeTask,
    lastTask,
    loading,
    error,
    refresh,
  };
}
