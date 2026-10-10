/**
 * @file constants/commands.ts
 * @description AI 助手系统命令预设
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

import {
  Activity,
  Server,
  Database,
  Shield,
  RotateCcw,
  Cpu,
  HardDrive,
  Network,
  Layers,
  Zap,
} from "lucide-react";
import type { CommandCategory } from "../../../types";

export interface SystemCommand {
  id: string;
  icon: typeof Zap;
  label: string;
  desc: string;
  category: CommandCategory;
  action: string;
  color: string;
}

export const SYSTEM_COMMANDS: SystemCommand[] = [
  {
    id: "cmd-01",
    icon: Activity,
    label: "集群状态总览",
    desc: "获取所有节点实时状态",
    category: "cluster",
    action: "查看当前集群所有节点的运行状态、GPU利用率和温度",
    color: "#00d4ff",
  },
  {
    id: "cmd-02",
    icon: Server,
    label: "重启异常节点",
    desc: "自动检测并重启异常节点",
    category: "cluster",
    action: "检测并重启所有状态异常的推理节点",
    color: "#ff6600",
  },
  {
    id: "cmd-03",
    icon: Layers,
    label: "部署模型",
    desc: "将模型部署到指定节点",
    category: "model",
    action: "将 DeepSeek-V3 模型部署到空闲 GPU 节点",
    color: "#00ff88",
  },
  {
    id: "cmd-04",
    icon: Cpu,
    label: "推理性能报告",
    desc: "生成推理性能分析报告",
    category: "model",
    action: "生成过去24小时的推理性能分析报告",
    color: "#aa55ff",
  },
  {
    id: "cmd-05",
    icon: Database,
    label: "数据库健康检查",
    desc: "检查 PostgreSQL 连接状态",
    category: "data",
    action: "执行数据库健康检查，检测连接池和慢查询",
    color: "#ffdd00",
  },
  {
    id: "cmd-06",
    icon: HardDrive,
    label: "存储空间分析",
    desc: "分析存储使用和清理建议",
    category: "data",
    action: "分析当前存储空间使用情况给出清理建议",
    color: "#ff3366",
  },
  {
    id: "cmd-07",
    icon: Shield,
    label: "安全审计扫描",
    desc: "扫描安全漏洞和异常访问",
    category: "security",
    action: "执行安全审计扫描，检查异常访问和潜在风险",
    color: "#ff3366",
  },
  {
    id: "cmd-08",
    icon: Network,
    label: "网络延迟诊断",
    desc: "诊断节点间网络延迟",
    category: "monitor",
    action: "诊断所有节点间的网络延迟和带宽状态",
    color: "#00d4ff",
  },
  {
    id: "cmd-09",
    icon: Zap,
    label: "一键优化配置",
    desc: "AI 自动优化系统配置",
    category: "cluster",
    action: "根据当前负载情况，AI 自动优化集群配置参数",
    color: "#00ff88",
  },
  {
    id: "cmd-10",
    icon: RotateCcw,
    label: "WebSocket 重连",
    desc: "重新建立数据推送连接",
    category: "monitor",
    action: "重新建立 WebSocket 实时数据推送连接",
    color: "#aa55ff",
  },
];

export const CMD_CATEGORIES = [
  { key: "all", label: "全部" },
  { key: "cluster", label: "集群" },
  { key: "model", label: "模型" },
  { key: "data", label: "数据" },
  { key: "security", label: "安全" },
  { key: "monitor", label: "监控" },
];
