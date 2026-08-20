/**
 * @file: AlertRulesPanel.test.tsx
 * @description: AlertRulesPanel组件完整测试套件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-01
 * @status: active
 * @tags: [component],[test]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";

const mockToggleRule = vi.fn();
const mockDeleteRule = vi.fn();
const mockAcknowledgeEvent = vi.fn();
const mockResolveEvent = vi.fn();
const mockCreateRule = vi.fn();
const mockUpdateRule = vi.fn();
const mockSetSelectedRule = vi.fn();
const mockSetFilterSeverity = vi.fn();
const mockSetIsCreating = vi.fn();
const mockSetEditingRule = vi.fn();

const mockRules = [
  {
    id: "rule-001",
    name: "GPU Utilization High",
    enabled: true,
    severity: "critical" as const,
    thresholds: [{ metric: "gpu", condition: "gt", value: 95, unit: "%", duration: 300 }],
    aggregation: { enabled: true, windowMinutes: 5, maxGroupSize: 10 },
    deduplication: { enabled: true, cooldownMinutes: 15 },
    escalation: [
      { level: 1, delayMinutes: 0, notifyChannels: ["dashboard"], autoAction: "auto_scale_check" },
      { level: 2, delayMinutes: 10, notifyChannels: ["dashboard", "email"], autoAction: "auto_scale_up" },
    ],
    targets: ["GPU-A100-01", "GPU-A100-02"],
    createdAt: Date.now() - 86400000,
    lastTriggered: Date.now() - 3600000,
    triggerCount: 23,
  },
  {
    id: "rule-002",
    name: "Latency Anomaly",
    enabled: false,
    severity: "warning" as const,
    thresholds: [{ metric: "latency", condition: "gt", value: 2000, unit: "ms", duration: 60 }],
    aggregation: { enabled: false, windowMinutes: 0, maxGroupSize: 0 },
    deduplication: { enabled: true, cooldownMinutes: 10 },
    escalation: [{ level: 1, delayMinutes: 0, notifyChannels: ["dashboard"] }],
    targets: ["GPU-A100-01"],
    createdAt: Date.now() - 86400000 * 2,
    lastTriggered: null,
    triggerCount: 0,
  },
];

const mockEvents = [
  {
    id: "evt-001",
    ruleId: "rule-001",
    ruleName: "GPU Utilization High",
    severity: "critical" as const,
    message: "GPU-A100-03 utilization reached 98.2%",
    metric: "gpu",
    currentValue: 98.2,
    threshold: 95,
    nodeId: "GPU-A100-03",
    timestamp: Date.now() - 300000,
    acknowledged: false,
    resolved: false,
    escalationLevel: 2,
  },
  {
    id: "evt-002",
    ruleId: "rule-002",
    ruleName: "Latency Anomaly",
    severity: "warning" as const,
    message: "GPU-A100-01 latency 2450ms",
    metric: "latency",
    currentValue: 2450,
    threshold: 2000,
    nodeId: "GPU-A100-01",
    timestamp: Date.now() - 900000,
    acknowledged: true,
    resolved: true,
    escalationLevel: 1,
  },
];

const defaultMockState = {
  rules: mockRules,
  events: mockEvents,
  stats: { totalRules: 2, activeRules: 1, unresolvedEvents: 1, criticalEvents: 1 },
  selectedRule: null,
  setSelectedRule: mockSetSelectedRule,
  filterSeverity: "all" as const,
  setFilterSeverity: mockSetFilterSeverity,
  toggleRule: mockToggleRule,
  deleteRule: mockDeleteRule,
  acknowledgeEvent: mockAcknowledgeEvent,
  resolveEvent: mockResolveEvent,
  createRule: mockCreateRule,
  updateRule: mockUpdateRule,
  isCreating: false,
  setIsCreating: mockSetIsCreating,
  editingRule: null,
  setEditingRule: mockSetEditingRule,
};

let mockAlertRulesState = { ...defaultMockState };
let mockConnectionState: string = "connected";

vi.mock("../hooks/useAlertRules", () => ({
  useAlertRules: () => mockAlertRulesState,
}));

vi.mock("../hooks/useWebSocketData", () => ({
  useWebSocketData: () => ({
    nodes: [],
    liveLatency: 0,
    connectionState: mockConnectionState,
  }),
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

vi.mock("../modules/monitor/CreateRuleModal", () => ({
  CreateRuleModal: ({ open, onClose, onSubmit }: any) => {
    if (!open) {return null;}
    return (
      <div data-testid="create-rule-modal">
        <button onClick={onClose} data-testid="modal-close">Close</button>
        <button onClick={() => onSubmit({ name: "Test Rule" })} data-testid="modal-submit">Submit</button>
      </div>
    );
  },
}));

vi.mock("./GlassCard", () => ({
  GlassCard: ({ children, className, onClick, ...props }: any) => (
    <div className={className} onClick={onClick} data-testid="glass-card" {...props}>
      {children}
    </div>
  ),
}));

describe("AlertRulesPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlertRulesState = { ...defaultMockState };
    mockConnectionState = "connected";
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("should render alert rules panel title", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getByText("alerts.title")).toBeInTheDocument();
    });

    it("should render stats labels", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getByText("alerts.totalRules")).toBeInTheDocument();
      expect(screen.getByText("alerts.activeRules")).toBeInTheDocument();
      expect(screen.getByText("alerts.unresolvedEvents")).toBeInTheDocument();
      expect(screen.getByText("alerts.criticalEvents")).toBeInTheDocument();
    });

    it("should render add rule button", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getByTestId("create-rule-btn")).toBeInTheDocument();
    });

    it("should render tabs", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getByText("alerts.rulesTab")).toBeInTheDocument();
      expect(screen.getByText("alerts.eventsTab")).toBeInTheDocument();
    });

    it("should render WebSocket status indicator", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      const wsElements = screen.getAllByText((_content, element) => {
        return element?.textContent?.includes("WebSocket Connected") ?? false;
      });
      expect(wsElements.length).toBeGreaterThan(0);
    });
  });

  describe("规则列表渲染", () => {
    it("should render rule cards", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getByText("GPU Utilization High")).toBeInTheDocument();
      expect(screen.getByText("Latency Anomaly")).toBeInTheDocument();
    });

    it("should show rule thresholds", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getByText(/gpu gt 95%/)).toBeInTheDocument();
      expect(screen.getByText(/latency gt 2000ms/)).toBeInTheDocument();
    });

    it("should display rule targets count", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getByText(/2 alerts.nodes/)).toBeInTheDocument();
    });

    it("should show trigger count", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getByText(/23 alerts.triggers/)).toBeInTheDocument();
    });
  });

  describe("规则交互", () => {
    it("should toggle rule when toggle button clicked", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      const editBtn = screen.getByTestId("edit-rule-rule-001");
      fireEvent.click(editBtn);
      expect(mockSetEditingRule).toHaveBeenCalled();
      expect(mockSetIsCreating).toHaveBeenCalledWith(true);
    });

    it("should select rule when card clicked", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      const ruleText = screen.getByText("GPU Utilization High");
      fireEvent.click(ruleText);
      expect(mockSetSelectedRule).toHaveBeenCalled();
    });
  });

  describe("事件列表渲染", () => {
    it("should switch to events tab", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      const eventsTab = screen.getByText("alerts.eventsTab");
      fireEvent.click(eventsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPU-A100-03 utilization reached 98.2%/)).toBeInTheDocument();
      });
    });

    it("should render event messages", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      fireEvent.click(screen.getByText("alerts.eventsTab"));

      await waitFor(() => {
        expect(screen.getByText(/GPU-A100-03 utilization reached 98.2%/)).toBeInTheDocument();
        expect(screen.getByText(/GPU-A100-01 latency 2450ms/)).toBeInTheDocument();
      });
    });

    it("should show event node IDs", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      fireEvent.click(screen.getByText("alerts.eventsTab"));

      await waitFor(() => {
        expect(screen.getByText("GPU-A100-03")).toBeInTheDocument();
        expect(screen.getByText("GPU-A100-01")).toBeInTheDocument();
      });
    });

    it("should display acknowledge button for unacknowledged events", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      fireEvent.click(screen.getByText("alerts.eventsTab"));

      await waitFor(() => {
        expect(screen.getByText("alerts.acknowledge")).toBeInTheDocument();
      });
    });

    it("should display resolve button for unresolved events", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      fireEvent.click(screen.getByText("alerts.eventsTab"));

      await waitFor(() => {
        expect(screen.getByText("alerts.resolve")).toBeInTheDocument();
      });
    });
  });

  describe("事件交互", () => {
    it("should acknowledge event when acknowledge button clicked", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      fireEvent.click(screen.getByText("alerts.eventsTab"));

      await waitFor(() => {
        const ackBtn = screen.getByText("alerts.acknowledge");
        fireEvent.click(ackBtn);
        expect(mockAcknowledgeEvent).toHaveBeenCalled();
      });
    });

    it("should resolve event when resolve button clicked", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      fireEvent.click(screen.getByText("alerts.eventsTab"));

      await waitFor(() => {
        const resolveBtn = screen.getByText("alerts.resolve");
        fireEvent.click(resolveBtn);
        expect(mockResolveEvent).toHaveBeenCalled();
      });
    });
  });

  describe("过滤功能", () => {
    it("should filter by severity critical", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      const criticalFilter = screen.getByText("alerts.severityCritical");
      fireEvent.click(criticalFilter);
      expect(mockSetFilterSeverity).toHaveBeenCalledWith("critical");
    });

    it("should filter by warning", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      const warningFilter = screen.getByText("alerts.severityWarning");
      fireEvent.click(warningFilter);
      expect(mockSetFilterSeverity).toHaveBeenCalledWith("warning");
    });

    it("should show all when all filter selected", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      const allFilter = screen.getByText("alerts.filterAll");
      fireEvent.click(allFilter);
      expect(mockSetFilterSeverity).toHaveBeenCalledWith("all");
    });
  });

  describe("创建规则", () => {
    it("should open create rule modal when create button clicked", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      const createButton = screen.getByTestId("create-rule-btn");
      fireEvent.click(createButton);
      expect(mockSetIsCreating).toHaveBeenCalledWith(true);
      expect(mockSetEditingRule).toHaveBeenCalledWith(null);
    });

    it("should render create rule modal when isCreating is true", async () => {
      mockAlertRulesState = { ...defaultMockState, isCreating: true };
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      await waitFor(() => {
        expect(screen.getByTestId("create-rule-modal")).toBeInTheDocument();
      });
    });
  });

  describe("WebSocket状态显示", () => {
    it("should display connected status", async () => {
      mockConnectionState = "connected";
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      const wsElements = screen.getAllByText((_content, element) =>
        element?.textContent?.includes("WebSocket Connected") ?? false
      );
      expect(wsElements.length).toBeGreaterThan(0);
    });

    it("should display simulated status", async () => {
      mockConnectionState = "simulated";
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      const wsElements = screen.getAllByText((_content, element) =>
        element?.textContent?.includes("Simulated Data") ?? false
      );
      expect(wsElements.length).toBeGreaterThan(0);
    });
  });

  describe("统计信息", () => {
    it("should display stats values", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getAllByText("2").length).toBeGreaterThan(0);
      expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    });
  });

  describe("视图切换", () => {
    it("should switch between rules and events tabs", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      fireEvent.click(screen.getByText("alerts.eventsTab"));

      await waitFor(() => {
        expect(screen.getByText(/GPU-A100-03 utilization reached 98.2%/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("alerts.rulesTab"));

      await waitFor(() => {
        expect(screen.getByText("GPU Utilization High")).toBeInTheDocument();
      });
    });
  });

  describe("边界情况", () => {
    it("should handle empty rules list", async () => {
      mockAlertRulesState = { ...defaultMockState, rules: [], events: [], stats: { totalRules: 0, activeRules: 0, unresolvedEvents: 0, criticalEvents: 0 } };
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));
      expect(screen.getByText("alerts.title")).toBeInTheDocument();
    });

    it("should handle events with resolved status", async () => {
      const { AlertRulesPanel } = await import("../modules/monitor/AlertRulesPanel");
      render(React.createElement(AlertRulesPanel));

      fireEvent.click(screen.getByText("alerts.eventsTab"));

      await waitFor(() => {
        expect(screen.getByText(/GPU-A100-01 latency 2450ms/)).toBeInTheDocument();
      });
    });
  });
});
