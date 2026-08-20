/**
 * @file: AIDiagnostics.test.tsx
 * @description: AIDiagnostics.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AIDiagnostics } from "../modules/ai/AIDiagnostics";
import { useI18n } from "../hooks/useI18n";
import { useWebSocketData } from "../hooks/useWebSocketData";

vi.mock("../hooks/useI18n");
vi.mock("../hooks/useWebSocketData");
vi.mock("../hooks/useAIDiagnostics", () => ({
  useAIDiagnostics: vi.fn(),
}));

import { useAIDiagnostics } from "../hooks/useAIDiagnostics";
import type { DiagnosticSession } from "../types";

const mockT = vi.fn((key: string) => key);
const mockSetActiveView = vi.fn();
const mockStartDiagnosis = vi.fn();
const mockExecuteAction = vi.fn();

const mockSession: DiagnosticSession = {
  id: "session-1",
  startedAt: Date.now() - 5000,
  completedAt: Date.now(),
  status: "complete",
  patterns: [
    {
      id: "pattern-1",
      type: "recurring",
      title: "Recurring pattern",
      description: "GPU使用率呈现周期性波动",
      confidence: "high",
      affectedNodes: ["node-1"],
      detectedAt: Date.now() - 3000,
      dataPoints: [70, 75, 80, 85, 80, 75, 70, 75],
      metric: "gpu_utilization",
      severity: "warning",
    },
  ],
  anomalies: [
    {
      id: "anomaly-1",
      timestamp: Date.now() - 3000,
      nodeId: "node-1",
      metric: "gpu_utilization",
      expectedValue: 80,
      actualValue: 95,
      deviation: 15,
      rootCause: "Elevated load",
    },
  ],
  actions: [
    {
      id: "action-1",
      priority: "urgent",
      title: "降低GPU负载",
      description: "建议降低GPU负载或增加GPU资源",
      estimatedImpact: "GPU使用率降低10-15%",
      confidence: "high",
      steps: ["Step 1", "Step 2"],
      autoExecutable: true,
      relatedPatternId: "pattern-1",
    },
  ],
  forecasts: [
    {
      metric: "GPU Utilization",
      currentValue: 78,
      predictedValue: 89,
      timeframe: "Next 2 hours",
      trend: "up",
      riskLevel: "warning",
      explanation: "Based on current workload growth",
    },
  ],
  summary: "系统运行正常，检测到1个模式，1个异常。",
};

describe("AIDiagnostics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });


  beforeEach(() => {
    vi.clearAllMocks();
    mockT.mockImplementation((key: string) => key);
    mockSetActiveView.mockReset();
    mockStartDiagnosis.mockReset();
    mockExecuteAction.mockReset();

    vi.mocked(useI18n).mockReturnValue({
      t: mockT,
      locale: "zh-CN",
      setLocale: vi.fn(),
      locales: [
        { code: "zh-CN", label: "简体中文", nativeLabel: "简体中文" },
        { code: "en-US", label: "English", nativeLabel: "English" },
      ],
    });

    vi.mocked(useWebSocketData).mockReturnValue({
      connectionState: "connected",
      isSimulated: false,
      reconnectCount: 0,
      lastSyncTime: new Date().toISOString(),
      liveQPS: 1000,
      qpsTrend: "up",
      liveLatency: 120,
      latencyTrend: "down",
      activeNodes: "1",
      gpuUtil: "85%",
      tokenThroughput: "1.2K/s",
      storageUsed: "45%",
      nodes: [
        {
          id: "node-1",
          status: "active",
          gpu: 85,
          mem: 60,
          temp: 45,
          model: "llama-2-7b",
          tasks: 5,
        },
      ],
      throughputHistory: [],
      alerts: [],
      manualReconnect: vi.fn(),
      clearAlerts: vi.fn(),
    });
  });

  it("should render panel correctly", () => {
    vi.mocked(useAIDiagnostics).mockReturnValue({
      status: "idle",
      session: null,
      history: [],
      historyLoaded: false,
      activeView: "patterns",
      setActiveView: mockSetActiveView,
      executingAction: null,
      startDiagnosis: mockStartDiagnosis,
      executeAction: mockExecuteAction,
    });

    render(<AIDiagnostics />);
    
    expect(screen.getAllByText(/aiDiag.title/i).length).toBeGreaterThan(0);
  });

  it("should display title", () => {
    vi.mocked(useAIDiagnostics).mockReturnValue({
      status: "idle",
      session: null,
      history: [],
      historyLoaded: false,
      activeView: "patterns",
      setActiveView: mockSetActiveView,
      executingAction: null,
      startDiagnosis: mockStartDiagnosis,
      executeAction: mockExecuteAction,
    });

    render(<AIDiagnostics />);
    
    expect(screen.getAllByText(/aiDiag.title/i).length).toBeGreaterThan(0);
  });

  it("should start diagnosis when button clicked", () => {
    vi.mocked(useAIDiagnostics).mockReturnValue({
      status: "idle",
      session: null,
      history: [],
      historyLoaded: false,
      activeView: "patterns",
      setActiveView: mockSetActiveView,
      executingAction: null,
      startDiagnosis: mockStartDiagnosis,
      executeAction: mockExecuteAction,
    });

    render(<AIDiagnostics />);
    const startButtons = screen.getAllByText(/aiDiag.startDiagnosis/i);
    if (startButtons.length > 0) {
      fireEvent.click(startButtons[0]);
      expect(mockStartDiagnosis).toHaveBeenCalled();
    }
  });

  it("should display analyzing state", () => {
    vi.mocked(useAIDiagnostics).mockReturnValue({
      status: "analyzing",
      session: null,
      history: [],
      historyLoaded: false,
      activeView: "patterns",
      setActiveView: mockSetActiveView,
      executingAction: null,
      startDiagnosis: mockStartDiagnosis,
      executeAction: mockExecuteAction,
    });

    render(<AIDiagnostics />);
    
    expect(screen.getAllByText(/aiDiag.analyzing/i).length).toBeGreaterThan(0);
  });

  it("should display session summary when completed", () => {
    vi.mocked(useAIDiagnostics).mockReturnValue({
      status: "complete",
      session: mockSession,
      history: [],
      historyLoaded: false,
      activeView: "patterns",
      setActiveView: mockSetActiveView,
      executingAction: null,
      startDiagnosis: mockStartDiagnosis,
      executeAction: mockExecuteAction,
    });

    render(<AIDiagnostics />);
    
    expect(screen.getAllByText(/aiDiag.aiSummary/i).length).toBeGreaterThan(0);
  });

  it("should switch between views", () => {
    vi.mocked(useAIDiagnostics).mockReturnValue({
      status: "complete",
      session: mockSession,
      history: [],
      historyLoaded: false,
      activeView: "patterns",
      setActiveView: mockSetActiveView,
      executingAction: null,
      startDiagnosis: mockStartDiagnosis,
      executeAction: mockExecuteAction,
    });

    render(<AIDiagnostics />);
    
    const anomaliesTabs = screen.getAllByText(/aiDiag.viewAnomalies/i);
    if (anomaliesTabs.length > 0) {
      fireEvent.click(anomaliesTabs[0]);
      expect(mockSetActiveView).toHaveBeenCalledWith("anomalies");
    }
  });

  it("should display empty state when no session", () => {
    vi.mocked(useAIDiagnostics).mockReturnValue({
      status: "idle",
      session: null,
      history: [],
      historyLoaded: false,
      activeView: "patterns",
      setActiveView: mockSetActiveView,
      executingAction: null,
      startDiagnosis: mockStartDiagnosis,
      executeAction: mockExecuteAction,
    });

    render(<AIDiagnostics />);
    
    const emptyHintElements = screen.getAllByText(/aiDiag.emptyHint/i);
    expect(emptyHintElements.length).toBeGreaterThan(0);
  });

  it("should execute action when button clicked", () => {
    vi.mocked(useAIDiagnostics).mockReturnValue({
      status: "complete",
      session: mockSession,
      history: [],
      historyLoaded: false,
      activeView: "actions",
      setActiveView: mockSetActiveView,
      executingAction: null,
      startDiagnosis: mockStartDiagnosis,
      executeAction: mockExecuteAction,
    });

    render(<AIDiagnostics />);
    
    const executeButtons = screen.getAllByText(/aiDiag.execute/i);
    if (executeButtons.length > 0) {
      fireEvent.click(executeButtons[0]);
      expect(mockExecuteAction).toHaveBeenCalledWith("action-1");
    }
  });
});
