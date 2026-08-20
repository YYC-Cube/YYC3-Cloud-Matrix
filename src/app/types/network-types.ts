/**
 * @file: network-types.ts
 * @description: 网络配置 + API 端点类型
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [types],[network],[api]
 */

/** 网络接口信息 */
export interface NetworkInterface {
  name: string;
  type: string;
  ip: string;
  status: "active" | "inactive" | "unknown";
}

/** 网络配置模式 */
export type NetworkMode = "auto" | "wifi" | "manual";

/** 网络配置项 */
export interface NetworkConfig {
  serverAddress: string;
  port: string;
  nasAddress: string;
  wsUrl: string;
  mode: NetworkMode;
}

/** 连接测试状态 */
export type TestStatus = "idle" | "testing" | "success" | "failed";

/** 连接测试结果 */
export interface ConnectionTestResult {
  success: boolean;
  latency: number;
  error?: string;
}

/** useNetworkConfig Hook 状态 */
export interface NetworkConfigState {
  config: NetworkConfig;
  interfaces: NetworkInterface[];
  localIP: string;
  testStatus: TestStatus;
  testLatency: number;
  testError: string;
  detecting: boolean;
}

/** 后端 API 端点配置 */
export interface APIEndpoints {
  /** 文件系统 API 基地址 */
  fsBase: string;
  /** 数据库管理 API 基地址 */
  dbBase: string;
  /** WebSocket 地址 */
  wsEndpoint: string;
  /** AI 推理 API 基地址 */
  aiBase: string;
  /** 集群管理 API 基地址 */
  clusterBase: string;
  /** 是否启用后端 API (false = 纯前端 Mock) */
  enableBackend: boolean;
  /** API 请求超时 (ms) */
  timeout: number;
  /** 最大重试次数 (指数退避, 0 = 不重试) */
  maxRetries: number;
}
