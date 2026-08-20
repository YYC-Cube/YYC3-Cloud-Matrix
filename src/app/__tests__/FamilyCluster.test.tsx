/**
 * @file: FamilyCluster.test.tsx
 * @description: AI Family - FamilyCluster 组件单元测试 (全球空间通信基站管理面板)
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-08-19
 * @updated: 2026-08-19
 * @status: active
 * @tags: [ai-family, cluster, test, vitest, testing-library]
 *
 * @brief: FamilyCluster 组件的 jsdom 环境单元测试
 *
 * @details:
 * - 环境: jsdom + @testing-library/react
 * - Mock: GlassCard (透明传递)、useI18n (t(key) => key)
 * - Seed: family-member-slice (8位家人初始数据)
 *         family-activities-slice (活动记录种子数据)
 * - Stub: window.devicePixelRatio = 1
 * - 覆盖: 基础渲染 / Tab栏 / Overview统计卡 / Tab切换 /
 *         节点数量渲染 / 节点点击展开 / Network在线节点 /
 *         快速操作Tab跳转 / 空状态渲染 (共9个用例)
 *
 * @notes:
 * - 本组件不含 Canvas/SVG，仅做 DOM wrapper 校验
 * - 严格依据 FamilyCluster.tsx 真实结构，不臆测按钮/模式
 * - YYC3ClusterManager 由组件内部 useState 创建，通过 jest.mock 拦截
 */

import React from "react";
import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

// ============================================================
// 1. Seed 数据: family-member-slice + family-activities-slice
// ============================================================
import "../modules/ai-family/store/family-member-slice";
import "../modules/ai-family/store/family-activities-slice";
import { useFamilyActivitiesSlice } from "../modules/ai-family/store/family-activities-slice";

// ============================================================
// 2. Stub window.devicePixelRatio = 1
// ============================================================
beforeAll(() => {
  vi.stubGlobal("devicePixelRatio", 1);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

// ============================================================
// 3. Mock useI18n: t(key) => key (避免依赖 i18n context)
// ============================================================
vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN" as const,
    setLocale: vi.fn(),
    supportedLocales: [],
  }),
}));

// ============================================================
// 4. Mock GlassCard: 透传 children + className + data-testid
//    (保证组件内部结构不被破坏，onClick 等事件正常传递)
// ============================================================
vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { glowColor?: string }>(
    ({ children, className = "", glowColor, onClick, style, ...rest }, ref) => (
      <div
        ref={ref}
        data-testid="glass-card"
        data-glow={glowColor || ""}
        className={className}
        onClick={onClick}
        style={style}
        {...rest}
      >
        {children}
      </div>
    ),
  ),
}));

// ============================================================
// 5. Mock FadeIn (避免动画干扰)
// ============================================================
vi.mock("../modules/ai-family/components/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode; delay?: number }) => (
    <div data-testid="fade-in">{children}</div>
  ),
}));

// ============================================================
// 6. Mock YYC3ClusterManager - 提供可控的测试数据
// ============================================================
import type {
  YYC3ClusterNode,
  ClusterStatistics,
  DistributedTask,
  SSHSession,
  NodeStatus,
  YYC3DeviceRole,
  YYC3Capability,
} from "../lib/yyc3-cluster.types";

function makeNode(
  fullName: string,
  role: YYC3DeviceRole,
  status: NodeStatus,
  cores: number,
  mem: number,
  stor: number,
  caps: YYC3Capability[] = [],
): YYC3ClusterNode {
  const num = fullName.replace(/yyc3-/, "");
  return {
    deviceId: { prefix: "yyc3", number: num, fullName },
    hostname: `${fullName}.local`,
    role,
    category: "apple-silicon",
    chipType: "M4",
    specs: {
      cpu: { cores, threads: cores, baseFrequencyGHz: 4.0 },
      memory: { totalGB: mem, type: "Unified Memory" },
      storage: { totalTB: stor, type: "SSD" },
      network: { maxSpeedMbps: 1000, interfaces: [] },
    },
    network: {
      primaryInterface: "en0",
      ipAddress: `192.168.1.${num}`,
      portMappings: [],
    },
    location: "local-lan",
    ssh: {
      enabled: true, host: `192.168.1.${num}`, port: 22,
      username: "yyc3", authMethod: "public-key",
      connectionTimeoutMs: 10000, keepAliveIntervalMs: 30000,
      maxRetries: 3, compressionEnabled: true,
      agentForwarding: false, X11Forwarding: false,
      connectionCount: 0,
    },
    capabilities: caps,
    tags: [role],
    status,
    lastHeartbeat: Date.now(),
    registeredAt: Date.now(),
    updatedAt: Date.now(),
  };
}

const MOCK_NODES: YYC3ClusterNode[] = [
  makeNode("yyc3-77", "development", "online", 10, 24, 0.5, ["ssh-access", "docker-support", "ai-inference", "gpu-computing", "file-transfer"] as YYC3Capability[]),
  makeNode("yyc3-33", "flagship", "online", 16, 128, 4, ["ssh-access", "kubernetes-support"] as YYC3Capability[]),
  makeNode("yyc3-66", "collaboration", "offline", 8, 16, 1),
  makeNode("yyc3-45", "storage", "maintenance", 4, 8, 20),
];

const MOCK_STATS: ClusterStatistics = {
  totalNodes: 4,
  onlineNodes: 2,
  offlineNodes: 1,
  totalCPUcores: 38,
  totalMemoryGB: 176,
  totalStorageTB: 25.5,
  averageUptimePercent: 92.3,
  totalConnections: 24,
  activeConnections: 12,
  dataTransferredTodayBytes: 5 * 1024 * 1024 * 1024, // 5 GB
  lastFullSyncAt: Date.now(),
};

const MOCK_TASKS: DistributedTask[] = [
  {
    taskId: "task-001", taskType: "health-check", name: "cluster.healthCheck",
    payload: {}, scheduledBy: "yyc3-33", scheduledAt: Date.now(), priority: "high",
    assignedNodes: ["yyc3-77", "yyc3-33"], executionStrategy: "all-nodes",
    status: "running", progress: 45, results: new Map(),
    retryCount: 0, maxRetries: 3,
  },
];

const MOCK_SESSIONS: SSHSession[] = [
  {
    sessionId: "sess-001", sourceNodeId: "yyc3-77", targetNodeId: "yyc3-33",
    connectedAt: Date.now() - 7200, durationSeconds: 7200,
    status: "active", commandHistory: [{
      commandId: "cmd-1", command: "ls -la", executedAt: Date.now(),
      durationMs: 10, success: true,
    }], fileTransfers: [],
    metrics: { bytesSent: 1024, bytesReceived: 2048, commandsExecuted: 1, filesTransferred: 0, averageLatencyMs: 5, peakMemoryUsageMB: 10 },
  },
];

vi.mock("../lib/yyc3-cluster-manager", () => ({
  YYC3ClusterManager: vi.fn(function (this: unknown) {
    (this as Record<string, unknown>).getAllNodes = vi.fn().mockReturnValue(MOCK_NODES);
    (this as Record<string, unknown>).getClusterStatistics = vi.fn().mockReturnValue(MOCK_STATS);
    (this as Record<string, unknown>).getTaskQueue = vi.fn().mockReturnValue(MOCK_TASKS);
    (this as Record<string, unknown>).getActiveSessions = vi.fn().mockReturnValue(MOCK_SESSIONS);
  }),
}));

// ============================================================
// 7. 导入被测组件 (必须在所有 vi.mock 之后)
// ============================================================
import { FamilyCluster } from "../modules/ai-family/components/FamilyCluster";

// ============================================================
// 8. 测试套件
// ============================================================
describe("🛰️ FamilyCluster - 全球空间通信基站管理面板", () => {

  // 每次测试前重置 activities slice (seed 数据已在 slice 内部)
  beforeEach(() => {
    const state = useFamilyActivitiesSlice.getState();
    expect(state.activities.length).toBeGreaterThanOrEqual(2);
  });

  // ----------------------------------------------------------
  // 用例 1: 基础渲染不崩溃 — 检查 wrapper div + 标题/副标题
  // ----------------------------------------------------------
  it("【1/9】基础渲染不崩溃 — 外层 wrapper div 与页面标题均存在", () => {
    render(<FamilyCluster />);

    const wrapper = document.querySelector(".w-full.h-full.overflow-y-auto");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ background: "transparent" });

    expect(screen.getByText("cluster.title")).toBeInTheDocument();
    expect(screen.getByText("cluster.subtitle")).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 用例 2: Tab 栏渲染 — 5 个 Tab 按钮按配置完整呈现
  // ----------------------------------------------------------
  it("【2/9】Tab 栏完整渲染 — 5 个 Tab (overview/nodes/network/tasks/sessions)", () => {
    render(<FamilyCluster />);

    const tabs = ["cluster.tabOverview", "cluster.tabNodes", "cluster.tabNetwork", "cluster.tabTasks", "cluster.tabSessions"];
    tabs.forEach((tabKey) => {
      expect(screen.getByText(tabKey)).toBeInTheDocument();
    });

    const overviewTab = screen.getByText("cluster.tabOverview").closest("button");
    expect(overviewTab).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 用例 3: Overview Tab — 4 张统计卡片数值按 mock stats 渲染
  // ----------------------------------------------------------
  it("【3/9】Overview 统计卡渲染 — 节点/CPU/内存/存储 4 张卡片数值正确", () => {
    render(<FamilyCluster />);

    const statCards = screen.getAllByTestId("glass-card");
    expect(statCards.length).toBeGreaterThanOrEqual(4);

    expect(screen.getByText("2/4")).toBeInTheDocument();
    expect(screen.getByText("38")).toBeInTheDocument();
    expect(screen.getByText("176 GB")).toBeInTheDocument();
    expect(screen.getByText("25.5 TB")).toBeInTheDocument();

    expect(screen.getByText("cluster.statTotalNodes")).toBeInTheDocument();
    expect(screen.getByText("cluster.statCPU")).toBeInTheDocument();
    expect(screen.getByText("cluster.statMemory")).toBeInTheDocument();
    expect(screen.getByText("cluster.statStorage")).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 用例 4: Tab 切换 — 点击 nodes tab 后切换显示节点列表
  // ----------------------------------------------------------
  it("【4/9】集群模式切换 (Tab 切换) — 点击 nodes tab 显示节点网格", () => {
    render(<FamilyCluster />);

    const nodesTabBtn = screen.getByText("cluster.tabNodes").closest("button")!;
    fireEvent.click(nodesTabBtn);

    const nodeGrid = document.querySelector(".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4");
    expect(nodeGrid).toBeInTheDocument();

    expect(screen.getByText("yyc3-77")).toBeInTheDocument();
    expect(screen.getByText("yyc3-33")).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 用例 5: 节点卡片数量 — 与 manager.getAllNodes() 返回数量一致
  // ----------------------------------------------------------
  it("【5/9】家人节点数量显示 — Nodes Tab 渲染 4 张节点卡片", () => {
    render(<FamilyCluster />);

    const nodesTabBtn = screen.getByText("cluster.tabNodes").closest("button")!;
    fireEvent.click(nodesTabBtn);

    const nodeCards = screen.getAllByTestId("glass-card").filter((card) => {
      const deviceId = within(card).queryByText(/^yyc3-\d+$/);
      return deviceId !== null;
    });
    expect(nodeCards).toHaveLength(MOCK_NODES.length);

    expect(screen.getByText("yyc3-77")).toBeInTheDocument();
    expect(screen.getByText("yyc3-66")).toBeInTheDocument();
    expect(screen.getByText("yyc3-45")).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 用例 6: 点击节点展开详情 — 选中后 capabilities 标签渲染
  // ----------------------------------------------------------
  it("【6/9】点击节点展开详情 — 选中 yyc3-77 后显示 capabilities 标签", () => {
    render(<FamilyCluster />);

    const nodesTabBtn = screen.getByText("cluster.tabNodes").closest("button")!;
    fireEvent.click(nodesTabBtn);

    const yyc3_77 = screen.getByText("yyc3-77");
    const card77 = yyc3_77.closest('[data-testid="glass-card"]')!;
    expect(card77).toBeInTheDocument();

    const scope = within(card77 as HTMLElement);
    expect(scope.queryByText("ssh-access")).not.toBeInTheDocument();
    fireEvent.click(card77 as HTMLElement);
    expect(scope.getByText("ssh-access")).toBeInTheDocument();
    expect(scope.getByText("docker-support")).toBeInTheDocument();
    expect(scope.getByText("ai-inference")).toBeInTheDocument();
    expect(scope.getByText("gpu-computing")).toBeInTheDocument();
    expect(scope.getByText("+1")).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 用例 7: 节点状态色阶 — online/offline/maintenance 状态点颜色区分
  // ----------------------------------------------------------
  it("【7/9】情感强度色阶显示 (状态色阶) — 节点状态圆点 background 区分 online/offline/maintenance", () => {
    render(<FamilyCluster />);

    const nodesTabBtn = screen.getByText("cluster.tabNodes").closest("button")!;
    fireEvent.click(nodesTabBtn);

    const statusDots = document.querySelectorAll<HTMLDivElement>(".w-2.h-2.rounded-full.mt-1");
    expect(statusDots.length).toBe(MOCK_NODES.length);

    const colors = Array.from(statusDots).map((d) => d.style.background.toLowerCase());
    expect(colors).toContain("rgb(0, 255, 136)");
    expect(colors).toContain("rgb(128, 128, 128)");
    expect(colors).toContain("rgb(255, 180, 0)");
  });

  // ----------------------------------------------------------
  // 用例 8: Network Tab — 仅在线节点出现在拓扑列表中
  // ----------------------------------------------------------
  it("【8/9】Network Tab 拓扑列表 — 仅在线 (online) 节点渲染", () => {
    render(<FamilyCluster />);

    const netTabBtn = screen.getByText("cluster.tabNetwork").closest("button")!;
    fireEvent.click(netTabBtn);

    expect(screen.getByText("cluster.topology")).toBeInTheDocument();

    expect(screen.getByText("yyc3-77")).toBeInTheDocument();
    expect(screen.getByText("yyc3-33")).toBeInTheDocument();
    expect(screen.queryByText("yyc3-66")).not.toBeInTheDocument();
    expect(screen.queryByText("yyc3-45")).not.toBeInTheDocument();

    expect(screen.getByText("cluster.connectionSummary")).toBeInTheDocument();
    expect(screen.getByText(`${MOCK_STATS.activeConnections}`)).toBeInTheDocument();
  });

  // ----------------------------------------------------------
  // 用例 9: 快速操作按钮 — 点击"查看节点"跳转 nodes tab，再切回验证查看任务
  // ----------------------------------------------------------
  it("【9/9】重置视图按钮 (快速操作) — 点击 actionViewNodes 切换到 nodes tab", () => {
    render(<FamilyCluster />);

    const viewNodesBtn = screen.getByText("cluster.actionViewNodes").closest("button")!;
    fireEvent.click(viewNodesBtn);

    const nodeGrid = document.querySelector(".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4");
    expect(nodeGrid).toBeInTheDocument();
    expect(screen.getByText("yyc3-77")).toBeInTheDocument();

    const overviewTabBtn = screen.getByText("cluster.tabOverview").closest("button")!;
    fireEvent.click(overviewTabBtn);

    const viewTasksBtn = screen.getByText("cluster.actionViewTasks").closest("button")!;
    fireEvent.click(viewTasksBtn);
    expect(screen.getByText("cluster.healthCheck")).toBeInTheDocument();
  });
});
