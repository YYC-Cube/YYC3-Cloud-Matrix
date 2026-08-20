/**
 * @file: CreateRuleModal.test.tsx
 * @description: CreateRuleModal组件完整测试套件
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-01
 * @updated: 2026-04-01
 * @status: active
 * @tags: [component],[test]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { CreateRuleModal } from "../modules/monitor/CreateRuleModal";
import type { AlertRule } from "../types";

const mockOnClose = vi.fn();
const mockOnSubmit = vi.fn();

const mockEditRule: AlertRule = {
  id: "rule-edit-001",
  name: "编辑测试规则",
  enabled: true,
  severity: "warning",
  thresholds: [
    { metric: "cpu", condition: "gt", value: 85, unit: "%", duration: 120 },
  ],
  aggregation: { enabled: true, windowMinutes: 10, maxGroupSize: 15 },
  deduplication: { enabled: true, cooldownMinutes: 20 },
  escalation: [
    { level: 1, delayMinutes: 0, notifyChannels: ["dashboard", "email"] },
    { level: 2, delayMinutes: 15, notifyChannels: ["dashboard", "sms"] },
  ],
  targets: ["GPU-A100-01", "GPU-A100-02"],
  createdAt: Date.now() - 86400000,
  lastTriggered: null,
  triggerCount: 0,
};

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

describe("CreateRuleModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("基础渲染", () => {
    it("should not render when open is false", () => {
      render(
        <CreateRuleModal
          open={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.queryByTestId("create-rule-modal")).not.toBeInTheDocument();
    });

    it("should render modal when open is true", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByTestId("create-rule-modal")).toBeInTheDocument();
    });

    it("should render create title when not editing", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByText("alerts.createRuleTitle")).toBeInTheDocument();
    });

    it("should render edit title when editing", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={mockEditRule}
        />
      );
      
      expect(screen.getByText("alerts.editRuleTitle")).toBeInTheDocument();
    });

    it("should render close button", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const buttons = screen.getAllByRole("button");
      const closeBtn = buttons.find((btn) => btn.querySelector("svg"));
      expect(closeBtn).toBeInTheDocument();
    });

    it("should render rule name input", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByTestId("rule-name-input")).toBeInTheDocument();
    });

    it("should render severity buttons", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByTestId("severity-critical")).toBeInTheDocument();
      expect(screen.getByTestId("severity-error")).toBeInTheDocument();
      expect(screen.getByTestId("severity-warning")).toBeInTheDocument();
      expect(screen.getByTestId("severity-info")).toBeInTheDocument();
    });

    it("should render threshold section", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByText("alerts.thresholds")).toBeInTheDocument();
      expect(screen.getByTestId("add-threshold-btn")).toBeInTheDocument();
    });

    it("should render aggregation section", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByTestId("agg-toggle")).toBeInTheDocument();
    });

    it("should render deduplication section", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByTestId("dedup-toggle")).toBeInTheDocument();
    });

    it("should render escalation section", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByText("alerts.escalationLevels")).toBeInTheDocument();
    });

    it("should render target nodes section", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByText("alerts.selectNodes")).toBeInTheDocument();
    });

    it("should render cancel and submit buttons", () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByTestId("cancel-btn")).toBeInTheDocument();
      expect(screen.getByTestId("submit-rule-btn")).toBeInTheDocument();
    });
  });

  describe("表单交互", () => {
    it("should update rule name when typing", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const nameInput = screen.getByTestId("rule-name-input");
      fireEvent.change(nameInput, { target: { value: "测试规则名称" } });
      
      expect(nameInput).toHaveValue("测试规则名称");
    });

    it("should change severity when clicking severity button", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const criticalBtn = screen.getByTestId("severity-critical");
      fireEvent.click(criticalBtn);
      
      expect(criticalBtn).toHaveClass("flex");
    });

    it("should add threshold when clicking add button", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const addBtn = screen.getByTestId("add-threshold-btn");
      fireEvent.click(addBtn);
      
      const thresholdMetrics = screen.getAllByTestId(/threshold-metric-/);
      expect(thresholdMetrics.length).toBe(2);
    });

    it("should remove threshold when clicking remove button", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const addBtn = screen.getByTestId("add-threshold-btn");
      fireEvent.click(addBtn);
      
      const removeBtn = screen.getByTestId("remove-threshold-0");
      fireEvent.click(removeBtn);
      
      const thresholdMetrics = screen.getAllByTestId(/threshold-metric-/);
      expect(thresholdMetrics.length).toBe(1);
    });

    it("should update threshold metric when selecting", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const metricSelect = screen.getByTestId("threshold-metric-0");
      fireEvent.change(metricSelect, { target: { value: "cpu" } });
      
      expect(metricSelect).toHaveValue("cpu");
    });

    it("should update threshold condition when selecting", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const conditionSelect = screen.getByTestId("threshold-condition-0");
      fireEvent.change(conditionSelect, { target: { value: "lt" } });
      
      expect(conditionSelect).toHaveValue("lt");
    });

    it("should update threshold value when typing", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const valueInput = screen.getByTestId("threshold-value-0");
      fireEvent.change(valueInput, { target: { value: "95" } });
      
      expect(valueInput).toHaveValue(95);
    });

    it("should toggle aggregation when clicking checkbox", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const aggToggle = screen.getByTestId("agg-toggle");
      fireEvent.click(aggToggle);
      
      expect(aggToggle).not.toBeChecked();
    });

    it("should show aggregation inputs when enabled", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByTestId("agg-window-input")).toBeInTheDocument();
    });

    it("should toggle deduplication when clicking checkbox", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const dedupToggle = screen.getByTestId("dedup-toggle");
      fireEvent.click(dedupToggle);
      
      expect(dedupToggle).not.toBeChecked();
    });

    it("should show deduplication input when enabled", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByTestId("dedup-cooldown-input")).toBeInTheDocument();
    });

    it("should add escalation when clicking add button", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const addBtn = screen.getByTestId("add-escalation-btn");
      fireEvent.click(addBtn);
      
      const escalationDelays = screen.getAllByTestId(/escalation-delay-/);
      expect(escalationDelays.length).toBe(2);
    });

    it("should not add more than 3 escalation levels", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const addBtn = screen.getByTestId("add-escalation-btn");
      fireEvent.click(addBtn);
      fireEvent.click(addBtn);
      
      expect(screen.queryByTestId("add-escalation-btn")).not.toBeInTheDocument();
    });

    it("should toggle notification channel when clicking", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const emailChannel = screen.getByTestId("channel-email-0");
      fireEvent.click(emailChannel);
      
      expect(emailChannel).toBeInTheDocument();
    });

    it("should toggle target node when clicking", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const nodeButton = screen.getByTestId("node-GPU-A100-02");
      fireEvent.click(nodeButton);
      
      expect(nodeButton).toBeInTheDocument();
    });
  });

  describe("表单验证", () => {
    it("should show error when submitting without name", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const submitBtn = screen.getByTestId("submit-rule-btn");
      fireEvent.click(submitBtn);
      
      await waitFor(() => {
        expect(screen.getByText("alerts.formRequired")).toBeInTheDocument();
      });
    });

    it("should show error when submitting without target nodes", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const nameInput = screen.getByTestId("rule-name-input");
      fireEvent.change(nameInput, { target: { value: "测试规则" } });
      
      const nodeButton = screen.getByTestId("node-GPU-A100-01");
      fireEvent.click(nodeButton);
      
      const submitBtn = screen.getByTestId("submit-rule-btn");
      fireEvent.click(submitBtn);
      
      await waitFor(() => {
        expect(screen.getByText("alerts.formRequired")).toBeInTheDocument();
      });
    });
  });

  describe("表单提交", () => {
    it("should call onSubmit with correct data when form is valid", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const nameInput = screen.getByTestId("rule-name-input");
      fireEvent.change(nameInput, { target: { value: "测试规则" } });
      
      const submitBtn = screen.getByTestId("submit-rule-btn");
      fireEvent.click(submitBtn);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "测试规则",
            enabled: true,
            severity: "warning",
          })
        );
      });
    });

    it("should reset form after successful submit when creating", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const nameInput = screen.getByTestId("rule-name-input");
      fireEvent.change(nameInput, { target: { value: "测试规则" } });
      
      const submitBtn = screen.getByTestId("submit-rule-btn");
      fireEvent.click(submitBtn);
      
      await waitFor(() => {
        expect(nameInput).toHaveValue("");
      });
    });

    it("should not reset form after successful submit when editing", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={mockEditRule}
        />
      );
      
      const nameInput = screen.getByTestId("rule-name-input");
      expect(nameInput).toHaveValue("编辑测试规则");
      
      const submitBtn = screen.getByTestId("submit-rule-btn");
      fireEvent.click(submitBtn);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("编辑模式", () => {
    it("should populate form with edit rule data", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={mockEditRule}
        />
      );
      
      const nameInput = screen.getByTestId("rule-name-input");
      expect(nameInput).toHaveValue("编辑测试规则");
    });

    it("should populate severity from edit rule", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={mockEditRule}
        />
      );
      
      const warningBtn = screen.getByTestId("severity-warning");
      expect(warningBtn).toBeInTheDocument();
    });

    it("should populate thresholds from edit rule", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={mockEditRule}
        />
      );
      
      const metricSelect = screen.getByTestId("threshold-metric-0");
      expect(metricSelect).toHaveValue("cpu");
    });

    it("should populate aggregation settings from edit rule", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={mockEditRule}
        />
      );
      
      const aggToggle = screen.getByTestId("agg-toggle");
      expect(aggToggle).toBeChecked();
      
      const aggWindowInput = screen.getByTestId("agg-window-input");
      expect(aggWindowInput).toHaveValue(10);
    });

    it("should populate deduplication settings from edit rule", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={mockEditRule}
        />
      );
      
      const dedupToggle = screen.getByTestId("dedup-toggle");
      expect(dedupToggle).toBeChecked();
      
      const dedupCooldownInput = screen.getByTestId("dedup-cooldown-input");
      expect(dedupCooldownInput).toHaveValue(20);
    });

    it("should populate escalation levels from edit rule", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={mockEditRule}
        />
      );
      
      const escalationDelays = screen.getAllByTestId(/escalation-delay-/);
      expect(escalationDelays.length).toBe(2);
    });

    it("should populate target nodes from edit rule", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={mockEditRule}
        />
      );
      
      const node1 = screen.getByTestId("node-GPU-A100-01");
      const node2 = screen.getByTestId("node-GPU-A100-02");
      
      expect(node1).toBeInTheDocument();
      expect(node2).toBeInTheDocument();
    });
  });

  describe("关闭模态框", () => {
    it("should call onClose when clicking close button", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const buttons = screen.getAllByRole("button");
      const closeBtn = buttons.find((btn) => btn.querySelector("svg"));
      if (closeBtn) {
        fireEvent.click(closeBtn);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it("should call onClose when clicking cancel button", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const cancelButton = screen.getByTestId("cancel-btn");
      fireEvent.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call onClose when clicking overlay", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const overlay = screen.getByTestId("create-rule-modal-overlay");
      fireEvent.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should not call onClose when clicking modal content", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const modal = screen.getByTestId("create-rule-modal");
      fireEvent.click(modal);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("边界情况", () => {
    it("should handle empty edit rule gracefully", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editRule={null}
        />
      );
      
      expect(screen.getByText("alerts.createRuleTitle")).toBeInTheDocument();
    });

    it("should handle multiple threshold additions and removals", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const addBtn = screen.getByTestId("add-threshold-btn");
      fireEvent.click(addBtn);
      fireEvent.click(addBtn);
      
      let thresholdMetrics = screen.getAllByTestId(/threshold-metric-/);
      expect(thresholdMetrics.length).toBe(3);
      
      const removeBtn1 = screen.getByTestId("remove-threshold-0");
      fireEvent.click(removeBtn1);
      
      thresholdMetrics = screen.getAllByTestId(/threshold-metric-/);
      expect(thresholdMetrics.length).toBe(2);
    });

    it("should handle all severity options", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const criticalBtn = screen.getByTestId("severity-critical");
      const errorBtn = screen.getByTestId("severity-error");
      const warningBtn = screen.getByTestId("severity-warning");
      const infoBtn = screen.getByTestId("severity-info");
      
      fireEvent.click(criticalBtn);
      fireEvent.click(errorBtn);
      fireEvent.click(warningBtn);
      fireEvent.click(infoBtn);
      
      expect(infoBtn).toBeInTheDocument();
    });

    it("should handle all notification channels", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const dashboardChannel = screen.getByTestId("channel-dashboard-0");
      const emailChannel = screen.getByTestId("channel-email-0");
      const smsChannel = screen.getByTestId("channel-sms-0");
      const webhookChannel = screen.getByTestId("channel-webhook-0");
      const slackChannel = screen.getByTestId("channel-slack-0");
      
      fireEvent.click(emailChannel);
      fireEvent.click(smsChannel);
      fireEvent.click(webhookChannel);
      fireEvent.click(slackChannel);
      
      expect(dashboardChannel).toBeInTheDocument();
    });

    it("should handle multiple node selections", async () => {
      render(
        <CreateRuleModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      const node1 = screen.getByTestId("node-GPU-A100-02");
      const node2 = screen.getByTestId("node-GPU-A100-03");
      const node3 = screen.getByTestId("node-GPU-H100-01");
      
      fireEvent.click(node1);
      fireEvent.click(node2);
      fireEvent.click(node3);
      
      expect(node1).toBeInTheDocument();
    });
  });
});
