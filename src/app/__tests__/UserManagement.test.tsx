/**
 * @file: UserManagement.test.tsx
 * @description: UserManagement 全面测试 — 用户 CRUD / 搜索 / 角色权限 / 模态框
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-19
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { UserManagement } from "../modules/admin/UserManagement";
import { useUserMgmtSlice } from "../store/slices/user-mgmt-slice";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  })),
}));

const MOCK_USER = {
  name: "测试用户",
  username: "test_user",
  email: "test@example.com",
  role: "开发者",
  status: "online" as const,
  lastLogin: "2026-04-19 10:00",
  sessions: 1,
  apiCalls: 100,
  locked: false,
};

describe("UserManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useUserMgmtSlice.setState({
      users: [
        { ...MOCK_USER, id: "usr-test-1" },
        { ...MOCK_USER, id: "usr-test-2", name: "管理员甲", username: "admin2", role: "超级管理员", locked: true },
      ],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ═══ 基础渲染 ═══
  describe("基础渲染", () => {
    it("renders user management page", () => {
      render(React.createElement(UserManagement));
      expect(screen.getByText("userMgmt.userList")).toBeInTheDocument();
    });

    it("renders add user button", () => {
      render(React.createElement(UserManagement));
      const addButtons = screen.getAllByText("userMgmt.addUser");
      expect(addButtons.length).toBeGreaterThan(0);
    });

    it("renders search input", () => {
      render(React.createElement(UserManagement));
      const searchInputs = screen.getAllByPlaceholderText("userMgmt.searchUser");
      expect(searchInputs.length).toBeGreaterThan(0);
    });

    it("renders role statistics", () => {
      render(React.createElement(UserManagement));
      expect(screen.getAllByText("超级管理员").length).toBeGreaterThan(0);
      expect(screen.getAllByText("运维工程师").length).toBeGreaterThan(0);
      expect(screen.getAllByText("开发者").length).toBeGreaterThan(0);
    });

    it("renders permission matrix button", () => {
      render(React.createElement(UserManagement));
      const permButtons = screen.getAllByText("userMgmt.permMatrix");
      expect(permButtons.length).toBeGreaterThan(0);
    });

    it("renders user table with rows", () => {
      render(React.createElement(UserManagement));
      expect(screen.getByText("测试用户")).toBeInTheDocument();
      expect(screen.getByText("管理员甲")).toBeInTheDocument();
    });
  });

  // ═══ 搜索 ═══
  describe("搜索", () => {
    it("filters users by name", () => {
      render(React.createElement(UserManagement));
      const searchInput = screen.getAllByPlaceholderText("userMgmt.searchUser")[0];
      fireEvent.change(searchInput, { target: { value: "管理员" } });

      expect(screen.queryByText("测试用户")).not.toBeInTheDocument();
      expect(screen.getByText("管理员甲")).toBeInTheDocument();
    });

    it("shows all users when search is cleared", () => {
      render(React.createElement(UserManagement));
      const searchInput = screen.getAllByPlaceholderText("userMgmt.searchUser")[0];
      fireEvent.change(searchInput, { target: { value: "不存在的用户" } });
      expect(screen.queryByText("测试用户")).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "" } });
      expect(screen.getByText("测试用户")).toBeInTheDocument();
    });
  });

  // ═══ 用户详情查看 ═══
  describe("查看用户", () => {
    it("opens view modal", () => {
      render(React.createElement(UserManagement));
      const viewBtns = screen.getAllByTitle("查看详情");
      fireEvent.click(viewBtns[0]);

      expect(screen.getByText("userMgmt.userDetail")).toBeInTheDocument();
    });

    it("shows user info in view modal", () => {
      render(React.createElement(UserManagement));
      fireEvent.click(screen.getAllByTitle("查看详情")[0]);

      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("test_user")).toBeInTheDocument();
    });

    it("closes modal on backdrop click", () => {
      render(React.createElement(UserManagement));
      fireEvent.click(screen.getAllByTitle("查看详情")[0]);
      expect(screen.getByText("userMgmt.userDetail")).toBeInTheDocument();

      const backdrop = screen.getByText("userMgmt.userDetail").closest(".fixed");
      if (backdrop) {
        fireEvent.click(backdrop);
      }
      expect(screen.queryByText("userMgmt.userDetail")).not.toBeInTheDocument();
    });
  });

  // ═══ 添加用户 ═══
  describe("添加用户", () => {
    it("opens add modal", () => {
      render(React.createElement(UserManagement));
      const addBtns = screen.getAllByText("userMgmt.addUser");
      fireEvent.click(addBtns[0]);

      expect(screen.getByText("添加用户")).toBeInTheDocument();
    });

    it("creates a new user with valid input", () => {
      render(React.createElement(UserManagement));
      fireEvent.click(screen.getAllByText("userMgmt.addUser")[0]);

      const inputs = screen.getAllByPlaceholderText("输入名称...");
      fireEvent.change(inputs[0], { target: { value: "新用户" } });

      const usernameInputs = screen.getAllByPlaceholderText("输入登录账号...");
      fireEvent.change(usernameInputs[0], { target: { value: "newuser" } });

      const emailInputs = screen.getAllByPlaceholderText("user@cloudpivot.ai");
      fireEvent.change(emailInputs[0], { target: { value: "new@example.com" } });

      fireEvent.click(screen.getByText("创建"));

      const users = useUserMgmtSlice.getState().users;
      expect(users.some(u => u.name === "新用户")).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });

    it("shows error when fields are empty", () => {
      render(React.createElement(UserManagement));
      fireEvent.click(screen.getAllByText("userMgmt.addUser")[0]);

      fireEvent.click(screen.getByText("创建"));
      expect(toast.error).toHaveBeenCalledWith("请填写完整信息", expect.any(Object));
    });
  });

  // ═══ 编辑用户 ═══
  describe("编辑用户", () => {
    it("opens edit modal with pre-filled data", () => {
      render(React.createElement(UserManagement));
      const editBtns = screen.getAllByTitle("编辑");
      fireEvent.click(editBtns[0]);

      expect(screen.getByText("编辑用户")).toBeInTheDocument();
    });

    it("updates user info", () => {
      render(React.createElement(UserManagement));
      fireEvent.click(screen.getAllByTitle("编辑")[0]);

      const nameInputs = screen.getAllByPlaceholderText("输入名称...");
      fireEvent.change(nameInputs[0], { target: { value: "更新名称" } });

      fireEvent.click(screen.getByText("保存"));

      const users = useUserMgmtSlice.getState().users;
      expect(users.some(u => u.name === "更新名称")).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // ═══ 锁定/解锁 ═══
  describe("锁定/解锁", () => {
    it("toggles user lock", () => {
      render(React.createElement(UserManagement));
      const lockBtns = screen.getAllByTitle("解锁");
      fireEvent.click(lockBtns[0]);

      const user = useUserMgmtSlice.getState().users.find(u => u.id === "usr-test-2");
      expect(user?.locked).toBe(false);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // ═══ 删除用户 ═══
  describe("删除用户", () => {
    it("deletes a non-admin user", () => {
      render(React.createElement(UserManagement));
      const deleteBtns = screen.getAllByTitle("删除");
      fireEvent.click(deleteBtns[0]);

      const users = useUserMgmtSlice.getState().users;
      expect(users.length).toBe(1);
      expect(toast.success).toHaveBeenCalled();
    });

    it("prevents deleting admin user", () => {
      render(React.createElement(UserManagement));
      const deleteBtns = screen.getAllByTitle("删除");
      fireEvent.click(deleteBtns[1]);

      expect(toast.error).toHaveBeenCalledWith("无法删除超级管理员", expect.any(Object));
      expect(useUserMgmtSlice.getState().users.length).toBe(2);
    });
  });

  // ═══ 权限矩阵 ═══
  describe("权限矩阵", () => {
    it("toggles permission matrix visibility", () => {
      render(React.createElement(UserManagement));
      const permBtns = screen.getAllByText("userMgmt.permMatrix");
      fireEvent.click(permBtns[0]);

      expect(screen.getByText("权限矩阵")).toBeInTheDocument();
    });
  });

  // ═══ 角色面板 ═══
  describe("角色面板", () => {
    it("shows role count for existing users", () => {
      render(React.createElement(UserManagement));
      const roleHeaders = screen.getAllByText("userMgmt.rolesPerms");
      expect(roleHeaders.length).toBeGreaterThan(0);
    });
  });
});
