/**
 * @file: node-types.ts
 * @description: 节点与集群类型 — 实时节点 + DB 记录 + 转换函数
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[node],[cluster]
 */

/** 节点运行状态 */
export type NodeStatusType = "active" | "warning" | "inactive";

/**
 * 实时节点数据（WebSocket 推送 / 前端展示）
 * 字段使用 camelCase 短名，适合高频 UI 渲染
 */
export interface NodeData {
  id: string;
  status: NodeStatusType;
  gpu: number;       // GPU 利用率 0-100
  mem: number;       // 内存利用率 0-100
  temp: number;      // 温度 °C
  model: string;     // 当前部署模型
  tasks: number;     // 活跃任务数
}

/**
 * 数据库节点状态（PostgreSQL Schema: infra.nodes）
 * 字段使用 snake_case，与 DB 列名一致
 */
export interface NodeStatusRecord {
  id: string;
  hostname: string;
  gpu_util: number;
  mem_util: number;
  temp_celsius: number;
  model_deployed: string;
  active_tasks: number;
  status: NodeStatusType;
}

/** NodeStatusRecord → NodeData 转换 */
export function toNodeData(record: NodeStatusRecord): NodeData {
  return {
    id: record.hostname,
    status: record.status,
    gpu: record.gpu_util,
    mem: record.mem_util,
    temp: record.temp_celsius,
    model: record.model_deployed,
    tasks: record.active_tasks,
  };
}
