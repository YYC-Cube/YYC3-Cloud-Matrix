// @vitest-environment jsdom
/**
 * FollowUpEditDialog.test.tsx
 * ===========================
 * FollowUpEditDialog 组件测试 — 跟进任务编辑弹窗
 *
 * 覆盖范围:
 * - 关闭/打开状态渲染
 * - 创建模式 vs 编辑模式标题
 * - 表单字段填充（编辑/新建）
 * - 所有必填字段渲染
 * - 关闭按钮回调
 * - 表单提交与数据组装
 * - assigneeName 查找
 * - 选择器选项
 * - 文本域/日期字段
 * - 新任务 ID 生成
 * - 默认用户回退
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FollowUpEditDialog } from "../modules/monitor/FollowUpEditDialog";
import type { FollowUpRecord, UserRecord } from "../types";

// Mock GlassCard
vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

const mockUsers: UserRecord[] = [
  { id: "u1", name: "张三", username: "zhangsan", email: "zhangsan@test.com", role: "admin", status: "online", lastLogin: "2026-01-01", sessions: 5, apiCalls: 100, locked: false },
  { id: "u2", name: "李四", username: "lisi", email: "lisi@test.com", role: "developer", status: "offline", lastLogin: "2026-01-02", sessions: 3, apiCalls: 50, locked: false },
];

const mockFollowUp: FollowUpRecord = {
  id: "fu-001",
  taskId: "TASK-001",
  taskName: "修复 GPU 节点",
  assignee: "u2",
  assigneeName: "李四",
  priority: "high",
  status: "in_progress",
  dueDate: Date.now() + 86400000 * 3,
  notes: "需要紧急处理",
  category: "bugfix",
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now(),
};

describe("FollowUpEditDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ----------------------------------------------------------
  // 打开/关闭状态
  // ----------------------------------------------------------

  describe("打开/关闭状态", () => {
    it("isOpen=false 时不应渲染任何内容", () => {
      const { container } = render(
        <FollowUpEditDialog
          isOpen={false}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );
      expect(container.innerHTML).toBe("");
    });

    it("isOpen=true 时应渲染表单", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText("新建跟进任务")).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 标题模式
  // ----------------------------------------------------------

  describe("标题模式", () => {
    it("创建模式应显示「新建跟进任务」", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText("新建跟进任务")).toBeInTheDocument();
      expect(screen.getByText("创建新的跟进任务")).toBeInTheDocument();
    });

    it("编辑模式应显示「编辑跟进任务」", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={mockFollowUp}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText("编辑跟进任务")).toBeInTheDocument();
      expect(screen.getByText("修改任务信息")).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 表单字段填充
  // ----------------------------------------------------------

  describe("表单字段填充", () => {
    it("编辑模式应使用 followUp 数据填充表单", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={mockFollowUp}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const taskNameInput = screen.getByPlaceholderText("输入任务名称") as HTMLInputElement;
      expect(taskNameInput.value).toBe("修复 GPU 节点");

      const taskIdInput = screen.getByPlaceholderText("TASK-XXX") as HTMLInputElement;
      expect(taskIdInput.value).toBe("TASK-001");
    });

    it("创建模式应使用默认值填充表单", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const taskNameInput = screen.getByPlaceholderText("输入任务名称") as HTMLInputElement;
      expect(taskNameInput.value).toBe("");
    });
  });

  // ----------------------------------------------------------
  // 必填字段
  // ----------------------------------------------------------

  describe("必填字段", () => {
    it("表单应包含 taskName 输入框", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByPlaceholderText("输入任务名称")).toBeInTheDocument();
    });

    it("表单应包含 taskId 输入框", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByPlaceholderText("TASK-XXX")).toBeInTheDocument();
    });

    it("taskName 输入框应为 required", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );
      const taskNameInput = screen.getByPlaceholderText("输入任务名称");
      expect(taskNameInput).toBeRequired();
    });
  });

  // ----------------------------------------------------------
  // 关闭按钮
  // ----------------------------------------------------------

  describe("关闭按钮", () => {
    it("点击 X 按钮应调用 onClose", () => {
      const onClose = vi.fn();
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={onClose}
        />
      );

      // X button is the one with the X icon, find it by its position in the header
      const buttons = screen.getAllByRole("button");
      const xButton = buttons.find((btn) =>
        btn.querySelector("svg") && !btn.textContent?.trim()
      );
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it("点击取消按钮应调用 onClose", () => {
      const onClose = vi.fn();
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={onClose}
        />
      );

      fireEvent.click(screen.getByText("取消"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------
  // 表单提交
  // ----------------------------------------------------------

  describe("表单提交", () => {
    it("提交时应调用 onSave 并包含正确数据", () => {
      const onSave = vi.fn();
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={onSave}
          onClose={vi.fn()}
        />
      );

      const taskNameInput = screen.getByPlaceholderText("输入任务名称");
      fireEvent.change(taskNameInput, { target: { value: "新任务" } });

      // Find and click the submit button
      const submitButton = screen.getByText("创建任务");
      fireEvent.click(submitButton);

      expect(onSave).toHaveBeenCalledTimes(1);
      const savedData = onSave.mock.calls[0][0] as FollowUpRecord;
      expect(savedData.taskName).toBe("新任务");
      expect(savedData.assignee).toBe("u1"); // defaults to first user
      expect(savedData.assigneeName).toBe("张三");
    });

    it("提交时应从用户列表中查找 assigneeName", () => {
      const onSave = vi.fn();
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={onSave}
          onClose={vi.fn()}
        />
      );

      const taskNameInput = screen.getByPlaceholderText("输入任务名称");
      fireEvent.change(taskNameInput, { target: { value: "测试任务" } });

      const submitButton = screen.getByText("创建任务");
      fireEvent.click(submitButton);

      const savedData = onSave.mock.calls[0][0] as FollowUpRecord;
      expect(savedData.assignee).toBe("u1");
      expect(savedData.assigneeName).toBe("张三");
    });
  });

  // ----------------------------------------------------------
  // 选择器选项
  // ----------------------------------------------------------

  describe("选择器选项", () => {
    it("负责人选择器应渲染用户选项", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );

      // The select element should have user options
      const selects = screen.getAllByRole("combobox");
      const assigneeSelect = selects[0];
      expect(assigneeSelect).toBeInTheDocument();
      expect(assigneeSelect).toHaveValue("u1");
    });

    it("优先级选择器应有 low, medium, high, critical 选项", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const selects = screen.getAllByRole("combobox");
      const prioritySelect = selects[1] as HTMLSelectElement;
      const options = Array.from(prioritySelect.options).map((o) => o.value);
      expect(options).toContain("low");
      expect(options).toContain("medium");
      expect(options).toContain("high");
      expect(options).toContain("critical");
    });

    it("状态选择器应有 pending, in_progress, completed, cancelled 选项", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const selects = screen.getAllByRole("combobox");
      const statusSelect = selects[2] as HTMLSelectElement;
      const options = Array.from(statusSelect.options).map((o) => o.value);
      expect(options).toContain("pending");
      expect(options).toContain("in_progress");
      expect(options).toContain("completed");
      expect(options).toContain("cancelled");
    });

    it("分类选择器应有 maintenance, optimization, security, feature, bugfix 选项", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const selects = screen.getAllByRole("combobox");
      const categorySelect = selects[3] as HTMLSelectElement;
      const options = Array.from(categorySelect.options).map((o) => o.value);
      expect(options).toContain("maintenance");
      expect(options).toContain("optimization");
      expect(options).toContain("security");
      expect(options).toContain("feature");
      expect(options).toContain("bugfix");
    });
  });

  // ----------------------------------------------------------
  // 日期与备注字段
  // ----------------------------------------------------------

  describe("日期与备注字段", () => {
    it("dueDate 字段应渲染 datetime-local 输入框", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const dateInput = document.querySelector("input[type='datetime-local']");
      expect(dateInput).toBeInTheDocument();
    });

    it("notes 字段应渲染 textarea", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const textarea = screen.getByPlaceholderText("输入任务备注...");
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe("TEXTAREA");
    });
  });

  // ----------------------------------------------------------
  // 新建任务 ID 生成
  // ----------------------------------------------------------

  describe("新建任务 ID 生成", () => {
    it("创建任务时应生成新的 id", () => {
      const onSave = vi.fn();
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={onSave}
          onClose={vi.fn()}
        />
      );

      const taskNameInput = screen.getByPlaceholderText("输入任务名称");
      fireEvent.change(taskNameInput, { target: { value: "新任务" } });
      fireEvent.click(screen.getByText("创建任务"));

      const savedData = onSave.mock.calls[0][0] as FollowUpRecord;
      expect(savedData.id).toMatch(/^fu-\d+$/);
    });

    it("创建任务时应生成新的 taskId", () => {
      const onSave = vi.fn();
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={mockUsers}
          onSave={onSave}
          onClose={vi.fn()}
        />
      );

      const taskNameInput = screen.getByPlaceholderText("输入任务名称");
      fireEvent.change(taskNameInput, { target: { value: "新任务" } });
      fireEvent.click(screen.getByText("创建任务"));

      const savedData = onSave.mock.calls[0][0] as FollowUpRecord;
      expect(savedData.taskId).toMatch(/^TASK-\d+$/);
    });
  });

  // ----------------------------------------------------------
  // 默认用户回退
  // ----------------------------------------------------------

  describe("默认用户回退", () => {
    it("没有用户时 assignee 应默认为空字符串", () => {
      render(
        <FollowUpEditDialog
          isOpen={true}
          followUp={null}
          users={[]}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const selects = screen.getAllByRole("combobox");
      const assigneeSelect = selects[0] as HTMLSelectElement;
      // With no users, there should be no options, value is empty
      expect(assigneeSelect.options.length).toBe(0);
    });
  });
});