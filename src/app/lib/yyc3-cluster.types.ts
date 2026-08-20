/**
 * @file: yyc3-cluster.types.ts
 * @description: YYC3 全球空间通信基站 - 分布式设备集群类型定义
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [yyc3, cluster, distributed, ssh, global]
 *
 * @brief: 全球空间通信基站核心类型
 * - yyc3-** 命名规范设备识别
 * - SSH 多机互联协议
 * - 全球分布式节点管理
 */

// ============================================================
// YYC3 设备命名规范 (yyc3-XX)
// ============================================================

export type YYC3DevicePrefix = "yyc3";

export interface YYC3DeviceID {
  prefix: YYC3DevicePrefix;
  number: string;           // 设备编号 (如: "77", "33", "202")
  fullName: string;         // 完整名称 (如: "yyc3-77")
}

export function parseYYC3DeviceID(id: string): YYC3DeviceID | null {
  const match = id.match(/^yyc3-(\d+)$/i);
  if (!match) {return null;}
  
  return {
    prefix: "yyc3",
    number: match[1],
    fullName: id.toLowerCase(),
  };
}

export function isValidYYC3DeviceID(id: string): boolean {
  return /^yyc3-\d+$/i.test(id);
}

// ============================================================
// 设备角色与分类
// ============================================================

export type YYC3DeviceRole =
  | "flagship"        // 旗舰主机 (M4 Max)
  | "development"     // 开发机 (M4)
  | "collaboration"   // 协作终端 (MateBook)
  | "family-station"  // 家庭站 (iMac)
  | "mobile"          // 移动站 (MacBook Pro)
  | "cloud-node"      // 云端节点 (ECS)
  | "storage"         // 存储中心 (NAS)
  | "gateway";        // 网关/路由

export type YYC3DeviceCategory =
  | "apple-silicon"   // Apple Silicon 芯片
  | "intel-based"     // Intel 芯片
  | "arm-based"       // ARM 架构
  | "cloud-server"    // 云服务器
  | "nas-device"      // NAS 存储
  | "linux-server";   // Linux 服务器

export type YYC3ChipType =
  | "M4"
  | "M4 Max"
  | "M4 Pro"
  | "M3"
  | "M3 Max"
  | "M3 Pro"
  | "M2"
  | "M2 Max"
  | "M2 Pro"
  | "M1"
  | "M1 Max"
  | "M1 Pro"
  | "Intel Core i7"
  | "Intel Core i9"
  | "AMD Ryzen"
  | "Xeon"
  | "EPYC"
  | "Unknown";

// ============================================================
// 设备位置与区域
// ============================================================

export type YYC3Location =
  | "local-lan"       // 本地局域网
  | "home-network"    // 家庭网络
  | "office-network"  // 办公网络
  | "cloud-apac"      // 亚太云区
  | "cloud-eu"        // 欧洲云区
  | "cloud-us-east"   // 美东云区
  | "cloud-us-west"   // 美西云区
  | "global-cdn";     // 全球CDN

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  region?: string;
  timezone?: string;
}

// ============================================================
// YYC3 设备节点定义
// ============================================================

export interface YYC3ClusterNode {
  // 基础标识
  deviceId: YYC3DeviceID;
  hostname: string;
  
  // 设备信息
  role: YYC3DeviceRole;
  category: YYC3DeviceCategory;
  chipType: YYC3ChipType;
  
  // 硬件规格
  specs: DeviceSpecifications;
  
  // 网络配置
  network: NetworkConfiguration;
  
  // 位置信息
  location: YYC3Location;
  geoLocation?: GeoLocation;
  
  // SSH 连接配置
  ssh: SSHConfiguration;
  
  // 状态
  status: NodeStatus;
  lastHeartbeat: number;
  uptimeSeconds?: number;
  
  // 能力标签
  capabilities: YYC3Capability[];
  
  // 元数据
  tags: string[];
  description?: string;
  
  // 时间戳
  registeredAt: number;
  updatedAt: number;
}

export interface DeviceSpecifications {
  cpu: {
    cores: number;
    threads: number;
    baseFrequencyGHz: number;
    maxFrequencyGHz?: number;
  };
  memory: {
    totalGB: number;
    type: "Unified Memory" | "DDR4" | "DDR5" | "LPDDR5";
    bandwidthGBps?: number;
  };
  storage: {
    totalTB: number;
    type: "SSD" | "HDD" | "NVMe" | "RAID";
    speedMBps?: number;
  };
  gpu?: {
    model: string;
    memoryGB: number;
    cores?: number;
  };
  network: {
    maxSpeedMbps: number;
    interfaces: NetworkInterface[];
  };
}

export interface NetworkInterface {
  name: string;              // en0, eth0, etc.
  macAddress: string;
  ipAddress: string;
  ipv6Address?: string;
  isWireless: boolean;
  speedMbps: number;
}

export interface NetworkConfiguration {
  // 主网络接口
  primaryInterface: string;
  
  // IP 地址（动态/静态）
  ipAddress: string;
  ipv6Address?: string;
  
  // 局域网配置
  lanIP?: string;
  lanSubnet?: string;
  
  // 公网配置（云端节点）
  publicIP?: string;
  domainName?: string;
  
  // 端口映射
  portMappings: PortMapping[];
  
  // DNS 配置
  dnsServers?: string[];
  
  // 带宽限制
  bandwidthLimitMbps?: number;
}

export interface PortMapping {
  protocol: "tcp" | "udp" | "both";
  externalPort: number;
  internalPort: number;
  description?: string;
}

export interface SSHConfiguration {
  enabled: boolean;
  host: string;              // 主机地址或域名
  port: number;              // SSH 端口（默认22）
  username: string;          // 登录用户名
  
  // 认证方式
  authMethod: "password" | "public-key" | "certificate";
  password?: string;        // 密码（加密存储）
  publicKeyPath?: string;    // 公钥路径
  privateKeyPath?: string;   // 私钥路径
  
  // 连接选项
  connectionTimeoutMs: number;
  keepAliveIntervalMs: number;
  maxRetries: number;
  
  // 高级选项
  compressionEnabled: boolean;
  agentForwarding: boolean;
  X11Forwarding: boolean;
  
  // 安全设置
  allowedFromIPs?: string[]; // IP白名单
  denyUsers?: string[];      // 黑名单用户
  
  // 状态
  lastConnectedAt?: number;
  connectionCount: number;
}

export type NodeStatus =
  | "online"
  | "offline"
  | "maintenance"
  | "error"
  | "decommissioned";

export type YYC3Capability =
  | "ssh-access"
  | "remote-desktop"
  | "file-transfer"
  | "docker-support"
  | "kubernetes-support"
  | "gpu-computing"
  | "ai-inference"
  | "database-host"
  | "web-server"
  | "storage-server"
  | "backup-source"
  | "backup-target"
  | "monitoring-agent"
  | "logging-aggregator"
  | "vpn-gateway"
  | "load-balancer"
  | "cache-layer"
  | "message-queue"
  | "task-scheduler"
  | "ci-cd-runner"
  | "cdn-edge";

// ============================================================
// 集群拓扑结构
// ============================================================

export interface YYC3ClusterTopology {
  clusterId: string;
  clusterName: string;
  
  // 节点列表
  nodes: Map<string, YYC3ClusterNode>;
  
  // 拓扑关系
  connections: ClusterConnection[];
  
  // 区域分布
  regions: RegionDistribution[];
  
  // 全局配置
  globalConfig: ClusterGlobalConfig;
  
  // 统计信息
  statistics: ClusterStatistics;
  
  // 版本控制
  version: number;
  updatedAt: number;
}

export interface ClusterConnection {
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  latencyMs: number;
  bandwidthMbps: number;
  isEncrypted: boolean;
  status: ConnectionStatus;
  establishedAt: number;
  lastActiveAt: number;
}

export type ConnectionType =
  | "lan-direct"       // 局域网直连
  | "vpn-tunnel"       // VPN隧道
  | "ssh-tunnel"       // SSH隧道
  | "wireguard"        // WireGuard VPN
  | "zerotier"         // ZeroTier 网络
  | "tailscale"        // Tailscale 组网
  | "cloud-relay"      // 云端中继
  | "p2p-direct";      // P2P直连

export type ConnectionStatus =
  | "active"
  | "idle"
  | "degraded"
  | "failed"
  | "blocked";

export interface RegionDistribution {
  region: YYC3Location;
  nodeCount: number;
  primaryNode?: string;
  backupNodes: string[];
  latencyToOtherRegions: Map<string, number>;
}

export interface ClusterGlobalConfig {
  // 集群名称前缀
  namingConvention: "yyc3-**";
  
  // 心跳配置
  heartbeatIntervalMs: number;
  heartbeatTimeoutMs: number;
  
  // 同步策略
  syncStrategy: SyncStrategy;
  
  // 备份策略
  backupStrategy: BackupStrategy;
  
  // 安全策略
  securityPolicy: SecurityPolicy;
  
  // 监控配置
  monitoringConfig: MonitoringConfig;
  
  // 告警规则
  alertRules: AlertRule[];
}

export type SyncStrategy =
  | "real-time"        // 实时同步
  | "event-driven"     // 事件驱动
  | "scheduled"        // 定时同步
  | "manual";          // 手动同步

export type BackupStrategy = {
  enabled: boolean;
  schedule: string;             // Cron 表达式
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  targetNodes: string[];        // 备份目标节点
  excludePatterns: string[];    // 排除模式
};

export interface SecurityPolicy {
  sshKeyRotationDays: number;
  passwordExpiryDays: number;
  requireTwoFactorAuth: boolean;
  encryptionAlgorithm: "AES-256-GCM" | "ChaCha20-Poly1305";
  firewallEnabled: boolean;
  intrusionDetectionEnabled: boolean;
  auditLogEnabled: boolean;
}

export interface MonitoringConfig {
  metricsCollectionIntervalSec: number;
  logRetentionDays: number;
  performanceAlertThreshold: {
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    diskUsagePercent: number;
    networkLatencyMs: number;
  };
  enableDistributedTracing: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  severity: "info" | "warning" | "critical";
  condition: string;            // 条件表达式
  notificationChannels: string[]; // 通知渠道
  cooldownMinutes: number;
  isEnabled: boolean;
}

export interface ClusterStatistics {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  totalCPUcores: number;
  totalMemoryGB: number;
  totalStorageTB: number;
  averageUptimePercent: number;
  totalConnections: number;
  activeConnections: number;
  dataTransferredTodayBytes: number;
  lastFullSyncAt: number;
  updatedAt?: number;
}

// ============================================================
// SSH 会话管理
// ============================================================

export interface SSHSession {
  sessionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  
  // 连接信息
  connectedAt: number;
  disconnectedAt?: number;
  durationSeconds: number;
  
  // 会话状态
  status: SessionStatus;
  
  // 执行的命令历史
  commandHistory: CommandExecution[];
  
  // 文件传输记录
  fileTransfers: FileTransferRecord[];
  
  // 性能指标
  metrics: SessionMetrics;
}

export type SessionStatus =
  | "connecting"
  | "authenticated"
  | "active"
  | "idle"
  | "disconnecting"
  | "disconnected"
  | "error";

export interface CommandExecution {
  commandId: string;
  command: string;
  executedAt: number;
  completedAt?: number;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface FileTransferRecord {
  transferId: string;
  type: "upload" | "download";
  sourcePath: string;
  targetPath: string;
  fileSizeBytes: number;
  transferredBytes: number;
  startedAt: number;
  completedAt?: number;
  speedBytesPerSec: number;
  status: TransferStatus;
  error?: string;
}

export type TransferStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "failed"
  | "cancelled"
  | "paused";

export interface SessionMetrics {
  bytesSent: number;
  bytesReceived: number;
  commandsExecuted: number;
  filesTransferred: number;
  averageLatencyMs: number;
  peakMemoryUsageMB: number;
}

// ============================================================
// 任务调度与执行
// ============================================================

export interface DistributedTask {
  taskId: string;
  taskType: TaskType;
  
  // 任务定义
  name: string;
  description?: string;
  payload: unknown;
  
  // 调度信息
  scheduledBy: string;
  scheduledAt: number;
  priority: TaskPriority;
  
  // 执行信息
  assignedNodes: string[];
  executionStrategy: ExecutionStrategy;
  
  // 状态跟踪
  status: TaskStatus;
  progress: number;           // 0-100
  results: Map<string, TaskResult>;
  
  // 重试机制
  retryCount: number;
  maxRetries: number;
  
  // 时间戳
  startedAt?: number;
  completedAt?: number;
  deadlineAt?: number;
}

export type TaskType =
  | "shell-command"
  | "file-sync"
  | "backup"
  | "deploy"
  | "health-check"
  | "metrics-collection"
  | "log-aggregation"
  | "service-restart"
  | "config-update"
  | "custom-script";

export type TaskPriority = "low" | "normal" | "high" | "urgent" | "critical";

export type ExecutionStrategy =
  | "single-node"          // 单节点执行
  | "all-nodes"            // 所有节点执行
  | "round-robin"          // 轮询执行
  | "least-loaded"         // 最少负载优先
  | "geographically-close" // 地理位置最近
  | "failover";            // 故障转移

export type TaskStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "timeout"
  | "partially-completed";

export interface TaskResult {
  nodeId: string;
  success: boolean;
  output?: string;
  error?: string;
  executionTimeMs: number;
  resourceUsage?: {
    cpuPercent: number;
    memoryMB: number;
    diskIOBytes: number;
  };
}

// ============================================================
// NAS 存储中心特殊配置
// ============================================================

export interface NASStorageConfig {
  nodeId: string;                    // yyc3-45
  
  // 存储池配置
  storagePools: StoragePool[];
  
  // 共享协议
  sharingProtocols: SharingProtocol[];
  
  // 备份配置
  backupConfig: NASBackupConfig;
  
  // 记忆档案存储
  memoryArchiveConfig: MemoryArchiveStorageConfig;
  
  // 配额管理
  quotaManagement: QuotaManagement;
  
  // 数据保护
  dataProtection: DataProtectionConfig;
}

export interface StoragePool {
  poolId: string;
  name: string;
  totalSizeTB: number;
  usedSizeTB: number;
  availableSizeTB: number;
  raidLevel: "RAID0" | "RAID1" | "RAID5" | "RAID6" | "RAID10" | "ZFS";
  filesystem: "ext4" | "xfs" | "zfs" | "btrfs" | "apfs";
  mountPoint: string;
  isEncrypted: boolean;
  compressionEnabled: boolean;
}

export type SharingProtocol =
  | "SMB"           // Windows/Mac共享
  | "NFS"           // Linux共享
  | "AFP"           // Mac专用
  | "WebDAV"        // HTTP共享
  | "SFTP"          // SSH文件传输
  | "rsync"         // 同步协议;

export interface NASBackupConfig {
  enabled: boolean;
  schedule: string;
  retentionPolicy: {
    dailyBackups: number;
    weeklyBackups: number;
    monthlyBackups: number;
  };
  replicationTargets: string[];     // 备份到哪些节点
  bandwidthThrottleMbps: number;
}

export interface MemoryArchiveStorageConfig {
  basePath: string;                 // 记忆档案根路径
  perMemberQuotaTB: number;         // 每成员配额 (8T)
  totalQuotaTB: number;             // 总配额
  versioningEnabled: boolean;       // 版本控制
  autoArchiveEnabled: boolean;      // 自动归档
  encryptionEnabled: boolean;       // 加密存储
  deduplicationEnabled: boolean;    // 去重
  compressionAlgorithm: "lz4" | "zstd" | "gzip";
}

export interface QuotaManagement {
  enabled: boolean;
  defaultPerUserQuotaGB: number;
  warningThresholdPercent: number;  // 告警阈值
  enforcementAction: "warn-only" | "block-write" | "soft-limit";
}

export interface DataProtectionConfig {
  snapshotsEnabled: boolean;
  snapshotSchedule: string;
  snapshotRetentionHours: number;
  bitRotDetection: boolean;         // 位腐烂检测
  scrubSchedule: string;            // 数据校验计划
  offsiteReplication: boolean;      // 异地复制
}

// ============================================================
// 全局空间通信基站常量
// ============================================================

export const YYC3_CLUSTER_NAME = "YYC3-Global-Space-Station";
export const YYC3_NAMING_PATTERN = /^yyc3-\d+$/i;
export const DEFAULT_SSH_PORT = 22;
export const HEARTBEAT_INTERVAL_MS = 30000;      // 30秒心跳
export const CONNECTION_TIMEOUT_MS = 10000;      // 10秒连接超时
export const MAX_RETRY_ATTEMPTS = 3;

export const PREDEFINED_NODES: Omit<YYC3ClusterNode, 'status' | 'lastHeartbeat' | 'registeredAt' | 'updatedAt'>[] = [
  {
    deviceId: { prefix: "yyc3", number: "77", fullName: "yyc3-77" },
    hostname: "yyc3-77.local",
    role: "development",
    category: "apple-silicon",
    chipType: "M4",
    specs: {
      cpu: { cores: 10, threads: 10, baseFrequencyGHz: 4.4, maxFrequencyGHz: 4.7 },
      memory: { totalGB: 24, type: "Unified Memory", bandwidthGBps: 120 },
      storage: { totalTB: 0.512, type: "SSD", speedMBps: 2900 },
      gpu: { model: "Apple GPU", memoryGB: 10, cores: 10 },
      network: { maxSpeedMbps: 10000, interfaces: [] },
    },
    network: {
      primaryInterface: "en0",
      ipAddress: "192.168.1.77",
      portMappings: [],
    },
    location: "local-lan",
    ssh: {
      enabled: true,
      host: "192.168.1.77",
      port: 22,
      username: "yyc3user",
      authMethod: "public-key",
      connectionTimeoutMs: 10000,
      keepAliveIntervalMs: 30000,
      maxRetries: 3,
      compressionEnabled: true,
      agentForwarding: false,
      X11Forwarding: false,
      connectionCount: 0,
    },
    capabilities: ["ssh-access", "remote-desktop", "file-transfer", "docker-support"],
    tags: ["mac", "m4", "development"],
    description: "M4 开发机 (副机)",
  },
  // ... 其他预定义节点将在实现中添加
];

// ============================================================
// 导出工具函数
// ============================================================

export function generateYYC3NodeId(number: string): YYC3DeviceID {
  return {
    prefix: "yyc3",
    number,
    fullName: `yyc3-${number}`,
  };
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function calculateDistance(
  loc1: GeoLocation,
  loc2: GeoLocation
): number {
  const R = 6371; // 地球半径（公里）
  const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.latitude * Math.PI / 180) * 
    Math.cos(loc2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
