/**
 * @file: service-loop-types.ts
 * @description: 一站式服务闭环 + 数据流可视化类型
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[service-loop]
 */

/** 闭环阶段 */
export type LoopStage =
  | "monitor"
  | "analyze"
  | "decide"
  | "execute"
  | "verify"
  | "optimize";

/** 阶段运行状态 */
export type StageStatus = "idle" | "running" | "completed" | "error" | "skipped";

/** 单阶段结果 */
export interface StageResult {
  stage: LoopStage;
  status: StageStatus;
  startedAt: number | null;
  completedAt: number | null;
  duration: number | null;
  summary: string;
  details: string[];
  metrics?: Record<string, number>;
}

/** 闭环运行记录 */
export interface LoopRun {
  id: string;
  startedAt: number;
  completedAt: number | null;
  trigger: "manual" | "auto" | "alert";
  currentStage: LoopStage;
  stages: StageResult[];
  overallStatus: StageStatus;
}

/** 数据流节点 */
export type DataFlowNodeType = "device" | "storage" | "dashboard" | "terminal";

/** 数据流连线 */
export interface DataFlowEdge {
  from: DataFlowNodeType;
  to: DataFlowNodeType;
  label: string;
  bandwidth: string;
  active: boolean;
}

/** 闭环阶段元信息 */
export interface StageMeta {
  key: LoopStage;
  label: string;
  icon: string;
  color: string;
  description: string;
}

/** 数据流可视化节点 */
export interface DataFlowNode {
  type: DataFlowNodeType;
  label: string;
  sublabel: string;
  color: string;
}
