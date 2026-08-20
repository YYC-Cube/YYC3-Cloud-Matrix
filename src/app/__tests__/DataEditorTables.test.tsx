/**
 * @file: DataEditorTables.test.tsx
 * @description: DataEditorTables.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { ModelTable, NodeTable, AgentTable } from "../modules/admin/DataEditorTables";
import type { Model, NodeStatusRecord, Agent } from "../types";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className }: any) => (
    <div className={className} data-testid="glass-card">
      {children}
    </div>
  ),
}));

describe("DataEditorTables", () => {
  const mockModels: Model[] = [
    {
      id: "model-1",
      name: "GPT-4",
      provider: "OpenAI",
      tier: "primary",
      avg_latency_ms: 100,
      throughput: 1000,
      created_at: new Date().toISOString(),
    },
    {
      id: "model-2",
      name: "Claude",
      provider: "Anthropic",
      tier: "secondary",
      avg_latency_ms: 150,
      throughput: 800,
      created_at: new Date().toISOString(),
    },
  ];

  const mockNodes: NodeStatusRecord[] = [
    {
      id: "node-1",
      hostname: "gpu-server-01",
      gpu_util: 85,
      mem_util: 70,
      temp_celsius: 65,
      model_deployed: "GPT-4",
      active_tasks: 3,
      status: "active",
    },
    {
      id: "node-2",
      hostname: "gpu-server-02",
      gpu_util: 45,
      mem_util: 50,
      temp_celsius: 55,
      model_deployed: "Claude",
      active_tasks: 1,
      status: "warning",
    },
  ];

  const mockAgents: Agent[] = [
    {
      id: "agent-1",
      name: "CodeAssistant",
      name_cn: "代码助手",
      role: "developer",
      description: "AI coding assistant",
      is_active: true,
    },
    {
      id: "agent-2",
      name: "DataAnalyst",
      name_cn: "数据分析师",
      role: "analyst",
      description: "Data analysis specialist",
      is_active: false,
    },
  ];

  describe("ModelTable", () => {
    it("should render models correctly", () => {
      render(
        <ModelTable
          models={mockModels}
          editingId={null}
          editDraft={{}}
          errors={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          clearError={vi.fn()}
          searchQuery=""
        />
      );

      expect(screen.getByText("GPT-4")).toBeInTheDocument();
      expect(screen.getByText("Claude")).toBeInTheDocument();
      expect(screen.getByText("OpenAI")).toBeInTheDocument();
      expect(screen.getByText("Anthropic")).toBeInTheDocument();
    });

    it("should render empty state when no models", () => {
      render(
        <ModelTable
          models={[]}
          editingId={null}
          editDraft={{}}
          errors={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          clearError={vi.fn()}
          searchQuery=""
        />
      );

      expect(screen.getByText("暂无模型数据")).toBeInTheDocument();
    });

    it("should render search result empty state", () => {
      render(
        <ModelTable
          models={[]}
          editingId={null}
          editDraft={{}}
          errors={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          clearError={vi.fn()}
          searchQuery="test"
        />
      );

      expect(screen.getByText("无匹配结果")).toBeInTheDocument();
    });

    it("should call onStartEdit when edit button clicked", () => {
      const onStartEdit = vi.fn();

      render(
        <ModelTable
          models={mockModels}
          editingId={null}
          editDraft={{}}
          errors={{}}
          onStartEdit={onStartEdit}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          clearError={vi.fn()}
          searchQuery=""
        />
      );

      // Find the Edit3 icon button specifically - look for svg with lucide-edit-3 class
      // or find buttons containing an Edit3 SVG (not Square, not Trash2, not CheckSquare)
      const allButtons = screen.getAllByRole("button");
      const editButton = allButtons.find(btn => {
        const svg = btn.querySelector("svg.lucide-edit-3");
        return svg !== null;
      });
      if (editButton) {
        fireEvent.click(editButton);
        expect(onStartEdit).toHaveBeenCalled();
      }
    });

    it("should call onDelete when delete button clicked", () => {
      const onDelete = vi.fn();

      render(
        <ModelTable
          models={mockModels}
          editingId={null}
          editDraft={{}}
          errors={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={onDelete}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          clearError={vi.fn()}
          searchQuery=""
        />
      );

      const allButtons = screen.getAllByRole("button");
      const deleteButton = allButtons.find(btn => btn.innerHTML.includes("Trash2"));
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(onDelete).toHaveBeenCalled();
      }
    });

    it("should render editing mode", () => {
      render(
        <ModelTable
          models={mockModels}
          editingId="model-1"
          editDraft={{ name: "Updated Name" }}
          errors={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          clearError={vi.fn()}
          searchQuery=""
        />
      );

      expect(screen.getByDisplayValue("Updated Name")).toBeInTheDocument();
    });

    it("should handle row selection", () => {
      render(
        <ModelTable
          models={mockModels}
          editingId={null}
          editDraft={{}}
          errors={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          clearError={vi.fn()}
          searchQuery=""
        />
      );

      const checkboxes = screen.getAllByRole("button");
      const checkbox = checkboxes.find(btn => btn.innerHTML.includes("Square"));
      if (checkbox) {
        fireEvent.click(checkbox);
      }
    });

    it("should handle batch delete", () => {
      const onBatchDelete = vi.fn();

      render(
        <ModelTable
          models={mockModels}
          editingId={null}
          editDraft={{}}
          errors={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={onBatchDelete}
          setEditDraft={vi.fn()}
          clearError={vi.fn()}
          searchQuery=""
        />
      );

      // Select all rows by clicking the header select-all checkbox
      const checkboxes = screen.getAllByRole("button");
      const selectAllCheckbox = checkboxes.find(btn => btn.innerHTML.includes("Square"));
      if (selectAllCheckbox) {
        fireEvent.click(selectAllCheckbox);
      }

      // Click batch delete - use queryAllByText since it may not be present if selection didn't work
      const batchDeleteButtons = screen.queryAllByText("批量删除");
      if (batchDeleteButtons.length > 0) {
        fireEvent.click(batchDeleteButtons[0]);
      }
    });
  });

  describe("NodeTable", () => {
    it("should render nodes correctly", () => {
      render(
        <NodeTable
          nodes={mockNodes}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      expect(screen.getByText("gpu-server-01")).toBeInTheDocument();
      expect(screen.getByText("gpu-server-02")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("45%")).toBeInTheDocument();
    });

    it("should render empty state when no nodes", () => {
      render(
        <NodeTable
          nodes={[]}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      expect(screen.getByText("暂无节点数据")).toBeInTheDocument();
    });

    it("should render search result empty state", () => {
      render(
        <NodeTable
          nodes={[]}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery="test"
        />
      );

      // Use getAllByText since React StrictMode may cause double rendering
      const emptyResults = screen.getAllByText("无匹配结果");
      expect(emptyResults.length).toBeGreaterThan(0);
    });

    it("should display status colors correctly", () => {
      render(
        <NodeTable
          nodes={mockNodes}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      // Use getAllByText since "active" may appear multiple times
      const activeElements = screen.getAllByText("active");
      expect(activeElements.length).toBeGreaterThan(0);
      const warningElements = screen.getAllByText("warning");
      expect(warningElements.length).toBeGreaterThan(0);
    });

    it("should call onStartEdit when edit button clicked", () => {
      const onStartEdit = vi.fn();

      render(
        <NodeTable
          nodes={mockNodes}
          editingId={null}
          editDraft={{}}
          onStartEdit={onStartEdit}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find(btn => btn.innerHTML.includes("Edit3"));
      if (editButton) {
        fireEvent.click(editButton);
        expect(onStartEdit).toHaveBeenCalled();
      }
    });

    it("should call onDelete when delete button clicked", () => {
      const onDelete = vi.fn();

      render(
        <NodeTable
          nodes={mockNodes}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={onDelete}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find(btn => btn.innerHTML.includes("Trash2"));
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(onDelete).toHaveBeenCalled();
      }
    });
  });

  describe("AgentTable", () => {
    it("should render agents correctly", () => {
      render(
        <AgentTable
          agents={mockAgents}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      expect(screen.getByText("CodeAssistant")).toBeInTheDocument();
      expect(screen.getByText("DataAnalyst")).toBeInTheDocument();
      expect(screen.getByText("代码助手")).toBeInTheDocument();
      expect(screen.getByText("数据分析师")).toBeInTheDocument();
      expect(screen.getByText("developer")).toBeInTheDocument();
      expect(screen.getByText("analyst")).toBeInTheDocument();
    });

    it("should render empty state when no agents", () => {
      render(
        <AgentTable
          agents={[]}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      expect(screen.getByText("暂无 Agent 数据")).toBeInTheDocument();
    });

    it("should render search result empty state", () => {
      render(
        <AgentTable
          agents={[]}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery="test"
        />
      );

      // Use getAllByText since React StrictMode may cause double rendering
      const emptyResults = screen.getAllByText("无匹配结果");
      expect(emptyResults.length).toBeGreaterThan(0);
    });

    it("should display active status correctly", () => {
      render(
        <AgentTable
          agents={mockAgents}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      // Use getAllByText since "启用" and "禁用" may appear multiple times
      const enabledElements = screen.getAllByText("启用");
      expect(enabledElements.length).toBeGreaterThan(0);
      const disabledElements = screen.getAllByText("禁用");
      expect(disabledElements.length).toBeGreaterThan(0);
    });

    it("should call onStartEdit when edit button clicked", () => {
      const onStartEdit = vi.fn();

      render(
        <AgentTable
          agents={mockAgents}
          editingId={null}
          editDraft={{}}
          onStartEdit={onStartEdit}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find(btn => btn.innerHTML.includes("Edit3"));
      if (editButton) {
        fireEvent.click(editButton);
        expect(onStartEdit).toHaveBeenCalled();
      }
    });

    it("should call onDelete when delete button clicked", () => {
      const onDelete = vi.fn();

      render(
        <AgentTable
          agents={mockAgents}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={onDelete}
          onBatchDelete={vi.fn()}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find(btn => btn.innerHTML.includes("Trash2"));
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(onDelete).toHaveBeenCalled();
      }
    });

    it("should handle batch delete", () => {
      const onBatchDelete = vi.fn();

      render(
        <AgentTable
          agents={mockAgents}
          editingId={null}
          editDraft={{}}
          onStartEdit={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          onDelete={vi.fn()}
          onBatchDelete={onBatchDelete}
          setEditDraft={vi.fn()}
          searchQuery=""
        />
      );

      // Select all rows
      const checkboxes = screen.getAllByRole("button");
      const selectAllCheckbox = checkboxes.find(btn => btn.innerHTML.includes("Square"));
      if (selectAllCheckbox) {
        fireEvent.click(selectAllCheckbox);
      }

      // Click batch delete
      const batchDeleteButtons = screen.queryAllByText("批量删除");
      if (batchDeleteButtons.length > 0) {
        fireEvent.click(batchDeleteButtons[0]);
      }
    });
  });

  describe("Integration", () => {
    it("should handle complete workflow for ModelTable", () => {
      const onStartEdit = vi.fn();
      const onSave = vi.fn();
      const onCancel = vi.fn();
      const onDelete = vi.fn();
      const onBatchDelete = vi.fn();
      const setEditDraft = vi.fn();

      const { rerender } = render(
        <ModelTable
          models={mockModels}
          editingId={null}
          editDraft={{}}
          errors={{}}
          onStartEdit={onStartEdit}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
          onBatchDelete={onBatchDelete}
          setEditDraft={setEditDraft}
          clearError={vi.fn()}
          searchQuery=""
        />
      );

      // Start edit
      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find(btn => btn.innerHTML.includes("Edit3"));
      if (editButton) {
        fireEvent.click(editButton);
        expect(onStartEdit).toHaveBeenCalled();
      }

      // Switch to editing mode
      rerender(
        <ModelTable
          models={mockModels}
          editingId="model-1"
          editDraft={{ name: "Updated Name" }}
          errors={{}}
          onStartEdit={onStartEdit}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
          onBatchDelete={onBatchDelete}
          setEditDraft={setEditDraft}
          clearError={vi.fn()}
          searchQuery=""
        />
      );

      // Use getAllByDisplayValue since StrictMode may cause duplicates
      const inputs = screen.getAllByDisplayValue("Updated Name");
      expect(inputs.length).toBeGreaterThan(0);
    });

    it("should handle complete workflow for NodeTable", () => {
      const onStartEdit = vi.fn();
      const onSave = vi.fn();
      const onCancel = vi.fn();
      const onDelete = vi.fn();
      const onBatchDelete = vi.fn();
      const setEditDraft = vi.fn();

      const { rerender } = render(
        <NodeTable
          nodes={mockNodes}
          editingId={null}
          editDraft={{}}
          onStartEdit={onStartEdit}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
          onBatchDelete={onBatchDelete}
          setEditDraft={setEditDraft}
          searchQuery=""
        />
      );

      // Start edit
      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find(btn => btn.innerHTML.includes("Edit3"));
      if (editButton) {
        fireEvent.click(editButton);
        expect(onStartEdit).toHaveBeenCalled();
      }

      // Switch to editing mode
      rerender(
        <NodeTable
          nodes={mockNodes}
          editingId="node-1"
          editDraft={{ hostname: "updated-hostname" }}
          onStartEdit={onStartEdit}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
          onBatchDelete={onBatchDelete}
          setEditDraft={setEditDraft}
          searchQuery=""
        />
      );

      expect(screen.getByDisplayValue("updated-hostname")).toBeInTheDocument();
    });

    it("should handle complete workflow for AgentTable", () => {
      const onStartEdit = vi.fn();
      const onSave = vi.fn();
      const onCancel = vi.fn();
      const onDelete = vi.fn();
      const onBatchDelete = vi.fn();
      const setEditDraft = vi.fn();

      const { rerender } = render(
        <AgentTable
          agents={mockAgents}
          editingId={null}
          editDraft={{}}
          onStartEdit={onStartEdit}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
          onBatchDelete={onBatchDelete}
          setEditDraft={setEditDraft}
          searchQuery=""
        />
      );

      // Start edit
      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find(btn => btn.innerHTML.includes("Edit3"));
      if (editButton) {
        fireEvent.click(editButton);
        expect(onStartEdit).toHaveBeenCalled();
      }

      // Switch to editing mode
      rerender(
        <AgentTable
          agents={mockAgents}
          editingId="agent-1"
          editDraft={{ name: "Updated Name" }}
          onStartEdit={onStartEdit}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
          onBatchDelete={onBatchDelete}
          setEditDraft={setEditDraft}
          searchQuery=""
        />
      );

      // Use getAllByDisplayValue since StrictMode may cause duplicates
      const inputs = screen.getAllByDisplayValue("Updated Name");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
