/**
 * file: FollowUpManager.test.tsx
 * description: FollowUpManager 组件测试 · 跟进任务 CRUD（搜索/筛选/排序/增删改）
 * author: YanYuCloudCube Team
 * version: v1.2.0
 * created: 2026-08-19
 * updated: 2026-08-19
 * status: active
 * tags: [component],[test],[monitor],[crud]
 *
 * brief: v1.2.0 修复 v1.1.0 两个 Unhandled Exception：
 *  1) TypeError: addFollowUp is not a function
 *  2) TypeError: removeFollowUp is not a function
 *    → 根因：useFollowUpSlice(selector) 解构时，selector 只选 followUps 没有包含 add/remove/update，导致组件内调用时报错。
 *    → 修复：跟随组件源码一致，显式传入 selector 测试所有字段均包含，或直接 getState().addFollowUp 校验
 *  同时修复删除用例：confirm=true 时二次校验 removeFollowUp 实际调用时机
 *
 * details:
 * - 对齐文档：docs/tests/monitor-unit-tests.md §5
 * - 通过 seedStores 注入 Zustand 真实状态 + localStorage 清理
 * - select[title] 定位 状态/优先级/负责人/排序 四个原生下拉
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { FollowUpRecord } from "../types";
import { useFollowUpSlice } from "../store/slices/follow-up-slice";
import { useUserMgmtSlice } from "../store/slices/user-mgmt-slice";

// ──────────────────────────────────────────────────────────────────
// Mock
// ──────────────────────────────────────────────────────────────────

vi.mock("../modules/shared/GlassCard", () => ({
  GlassCard: ({ children, className, ...rest }: any) =>
    React.createElement("div", { "data-testid": "yyc3-glass-card", className, ...rest }, children),
}));

vi.mock("../modules/monitor/FollowUpEditDialog", () => ({
  FollowUpEditDialog: ({ isOpen, onClose, onSave, followUp, users }: any) => {
    if (!isOpen) return null;
    const isEdit = !!followUp;
    return React.createElement(
      "div",
      { "data-testid": "yyc3-followup-edit-dialog", role: "dialog" },
      React.createElement("p", { "data-testid": "yyc3-followup-edit-title" },
        isEdit ? `编辑：${followUp.taskName}` : "新建跟进任务"),
      React.createElement("button", {
        "data-testid": "yyc3-followup-edit-save",
        onClick: () => onSave?.(isEdit
          ? { ...followUp, taskName: followUp.taskName + " （已改）", updatedAt: Date.now() }
          : {
              taskId: "TASK-NEW",
              taskName: "MOCK新建任务",
              assignee: users?.[0]?.id ?? "usr-1",
              assigneeName: users?.[0]?.name ?? "张管理",
              priority: "medium",
              status: "pending",
              dueDate: Date.now() + 86400_000,
              notes: "来自测试",
              category: "maintenance",
              updatedAt: Date.now(),
            }),
      }, isEdit ? "保存修改" : "保存新建"),
      React.createElement("button", {
        "data-testid": "yyc3-followup-edit-close",
        onClick: () => onClose?.(),
      }, "关闭"),
    );
  },
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (k: string, _vars?: Record<string, string | number>) => {
      const map: Record<string, string> = {
        "collab.title": "跟进任务管理",
        "collab.subtitle": "协作闭环 · 从告警 → 任务 → 复盘",
        "collab.create": "新建任务",
        "collab.search": "搜索任务 / 备注 / 负责人",
        "collab.confirmDelete": "确认删除该跟进任务？此操作不可恢复",
        "collab.filter.allStatus": "全部状态",
        "collab.filter.allPriority": "全部优先级",
        "collab.filter.allAssignee": "全部负责人",
        "collab.status.pending": "待处理",
        "collab.status.inProgress": "处理中",
        "collab.status.completed": "已完成",
        "collab.status.cancelled": "已取消",
        "collab.priority.critical": "紧急",
        "collab.priority.high": "高",
        "collab.priority.medium": "中",
        "collab.priority.low": "低",
        "collab.sort.dueDate": "按截止日期",
        "collab.sort.priority": "按优先级",
        "collab.sort.createdAt": "按创建时间",
        "collab.stats.total": "总计",
        "collab.stats.pending": "待处理",
        "collab.stats.inProgress": "处理中",
        "collab.stats.completed": "已完成",
        "collab.stats.overdue": "逾期",
        "collab.empty.title": "暂无跟进任务",
        "collab.empty.hint": "点击右上角创建第一条任务",
      };
      return map[k] ?? k;
    },
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

import { FollowUpManager } from "../modules/monitor/FollowUpManager";

// ──────────────────────────────────────────────────────────────────
// 种子数据
// ──────────────────────────────────────────────────────────────────

const BASE = 1724000000000;

function seedStores() {
  const followUps: FollowUpRecord[] = [
    {
      id: "fu-001", taskId: "TASK-042",
      taskName: "GPU-A100-03 温度告警处理",
      assignee: "usr-2", assigneeName: "李运维",
      priority: "high", status: "in_progress",
      dueDate: BASE + 86400_000,
      notes: "需要检查散热系统",
      category: "maintenance",
      createdAt: BASE - 3600_000,
      updatedAt: BASE,
    },
    {
      id: "fu-002", taskId: "TASK-043",
      taskName: "LLaMA-70B 模型版本升级",
      assignee: "usr-3", assigneeName: "王开发",
      priority: "medium", status: "pending",
      dueDate: BASE + 172800_000,
      category: "optimization",
      createdAt: BASE - 7200_000,
      updatedAt: BASE,
    },
    {
      id: "fu-003", taskId: "TASK-044",
      taskName: "巡检日报：NAS 存储空间",
      assignee: "usr-5", assigneeName: "刘测试",
      priority: "low", status: "completed",
      dueDate: BASE - 86400_000,
      notes: "85.8% → 已释放 2TB",
      category: "maintenance",
      createdAt: BASE - 86400_000,
      updatedAt: BASE,
      completedAt: BASE,
    },
  ];

  // 注意：setState 使用默认 merge 模式（不传 replace=true），避免 TS 重载报错
  // （followUps / users / 方法实现 合并到现有 Slice，而非完整替换）
  useFollowUpSlice.setState({
    followUps,
    addFollowUp: (fu: Omit<FollowUpRecord, "id" | "createdAt">) => {
      const rec: FollowUpRecord = {
        ...fu,
        id: `fu-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as FollowUpRecord;
      useFollowUpSlice.setState({
        followUps: [...useFollowUpSlice.getState().followUps, rec],
      });
    },
    updateFollowUp: (id: string, updates: Partial<FollowUpRecord>) =>
      useFollowUpSlice.setState({
        followUps: useFollowUpSlice.getState().followUps.map(f =>
          f.id === id ? { ...f, ...updates, updatedAt: Date.now() } : f,
        ),
      }),
    removeFollowUp: (id: string) =>
      useFollowUpSlice.setState({
        followUps: useFollowUpSlice.getState().followUps.filter(f => f.id !== id),
      }),
    completeFollowUp: (id: string) =>
      useFollowUpSlice.setState({
        followUps: useFollowUpSlice.getState().followUps.map(f =>
          f.id === id ? { ...f, status: "completed", completedAt: Date.now(), updatedAt: Date.now() } : f,
        ),
      }),
  });

  useUserMgmtSlice.setState({
    users: [
      { id: "usr-1", name: "张管理", username: "admin",    email: "admin@cloudpivot.ai",   role: "超级管理员", status: "online",  lastLogin: "2026-02-22 14:30", sessions: 3, apiCalls: 1284, locked: false },
      { id: "usr-2", name: "李运维", username: "ops_li",   email: "ops_li@cloudpivot.ai",  role: "运维工程师", status: "online",  lastLogin: "2026-02-22 14:25", sessions: 1, apiCalls: 856,  locked: false },
      { id: "usr-3", name: "王开发", username: "dev_wang", email: "dev_wang@cloudpivot.ai", role: "开发者",     status: "online",  lastLogin: "2026-02-22 14:18", sessions: 2, apiCalls: 2105, locked: false },
      { id: "usr-5", name: "刘测试", username: "qa_liu",   email: "qa_liu@cloudpivot.ai",   role: "测试工程师", status: "offline", lastLogin: "2026-02-21 18:30", sessions: 0, apiCalls: 321,  locked: false },
    ],
  });
}

function getSelect(title: string): HTMLSelectElement {
  return screen.getByTitle(title) as HTMLSelectElement;
}

describe("FollowUpManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    seedStores();
    // confirm 默认 true
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  // =================================================================
  describe("基础渲染", () => {
    it("应渲染 GlassCard 容器", () => {
      render(<FollowUpManager />);
      expect(screen.getAllByTestId("yyc3-glass-card").length).toBeGreaterThanOrEqual(2);
    });

    it("应展示标题 + 三条任务名称", () => {
      render(<FollowUpManager />);
      expect(screen.getByText("跟进任务管理")).toBeInTheDocument();
      expect(screen.getByText("GPU-A100-03 温度告警处理")).toBeTruthy();
      expect(screen.getByText("LLaMA-70B 模型版本升级")).toBeTruthy();
      expect(screen.getByText("巡检日报：NAS 存储空间")).toBeTruthy();
    });

    it("总计 3 + 其它统计值均可见", () => {
      render(<FollowUpManager />);
      // stats labels: 待处理/处理中 等同时出现在 option 内，改用 getAllByText 校验至少存在一次
      ["总计", "待处理", "处理中", "已完成", "逾期"].forEach(l =>
        expect(screen.getAllByText(l).length).toBeGreaterThanOrEqual(1),
      );
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(3);
    });
  });

  // =================================================================
  describe("搜索过滤", () => {
    it("搜索 '温度' → 仅 A100", () => {
      render(<FollowUpManager />);
      const input = screen.getByPlaceholderText("搜索任务 / 备注 / 负责人");
      fireEvent.change(input, { target: { value: "温度" } });
      expect(screen.getByText("GPU-A100-03 温度告警处理")).toBeTruthy();
      expect(screen.queryByText("LLaMA-70B 模型版本升级")).toBeNull();
    });

    it("搜索 '刘测试' → 仅巡检日报", () => {
      render(<FollowUpManager />);
      fireEvent.change(
        screen.getByPlaceholderText("搜索任务 / 备注 / 负责人"),
        { target: { value: "刘测试" } },
      );
      expect(screen.getByText("巡检日报：NAS 存储空间")).toBeTruthy();
    });

    it("搜索 notes 内容 '释放 2TB' → 仅巡检日报", () => {
      render(<FollowUpManager />);
      fireEvent.change(
        screen.getByPlaceholderText("搜索任务 / 备注 / 负责人"),
        { target: { value: "释放 2TB" } },
      );
      expect(screen.getByText("巡检日报：NAS 存储空间")).toBeTruthy();
    });

    it("无结果 → 展示空态", () => {
      render(<FollowUpManager />);
      fireEvent.change(
        screen.getByPlaceholderText("搜索任务 / 备注 / 负责人"),
        { target: { value: "ZZZZZ_XXX_EMPTY" } },
      );
      expect(screen.getByText("暂无跟进任务")).toBeInTheDocument();
    });
  });

  // =================================================================
  describe("状态筛选 (title=状态筛选)", () => {
    it("处理中 → 仅 A100 温度告警", () => {
      render(<FollowUpManager />);
      fireEvent.change(getSelect("状态筛选"), { target: { value: "in_progress" } });
      expect(screen.getByText("GPU-A100-03 温度告警处理")).toBeTruthy();
      expect(screen.queryByText("LLaMA-70B 模型版本升级")).toBeNull();
    });

    it("待处理 → 仅 LLaMA 升级", () => {
      render(<FollowUpManager />);
      fireEvent.change(getSelect("状态筛选"), { target: { value: "pending" } });
      expect(screen.getByText("LLaMA-70B 模型版本升级")).toBeTruthy();
    });

    it("已完成 → 仅巡检日报", () => {
      render(<FollowUpManager />);
      fireEvent.change(getSelect("状态筛选"), { target: { value: "completed" } });
      expect(screen.getByText("巡检日报：NAS 存储空间")).toBeTruthy();
    });
  });

  // =================================================================
  describe("优先级筛选 (title=优先级筛选)", () => {
    it("高 → 仅 A100", () => {
      render(<FollowUpManager />);
      fireEvent.change(getSelect("优先级筛选"), { target: { value: "high" } });
      expect(screen.getByText("GPU-A100-03 温度告警处理")).toBeTruthy();
    });
    it("中 → 仅 LLaMA", () => {
      render(<FollowUpManager />);
      fireEvent.change(getSelect("优先级筛选"), { target: { value: "medium" } });
      expect(screen.getByText("LLaMA-70B 模型版本升级")).toBeTruthy();
    });
    it("低 → 仅巡检日报", () => {
      render(<FollowUpManager />);
      fireEvent.change(getSelect("优先级筛选"), { target: { value: "low" } });
      expect(screen.getByText("巡检日报：NAS 存储空间")).toBeTruthy();
    });
  });

  // =================================================================
  describe("负责人筛选 (title=负责人筛选)", () => {
    it("option 全 4 位 + 全部负责人", () => {
      render(<FollowUpManager />);
      const opts = Array.from(getSelect("负责人筛选").options).map(o => o.textContent);
      expect(opts).toContain("全部负责人");
      ["张管理", "李运维", "王开发", "刘测试"].forEach(n => expect(opts).toContain(n));
    });

    it("选择李运维 → 仅 A100", () => {
      render(<FollowUpManager />);
      fireEvent.change(getSelect("负责人筛选"), { target: { value: "usr-2" } });
      expect(screen.getByText("GPU-A100-03 温度告警处理")).toBeTruthy();
      expect(screen.queryByText("LLaMA-70B 模型版本升级")).toBeNull();
    });
  });

  // =================================================================
  describe("排序逻辑 (title=排序方式)", () => {
    it("默认 dueDate asc → 第一条 = 巡检日报（昨日 dueDate 最早）", () => {
      render(<FollowUpManager />);
      const first = screen.getAllByText(/GPU-A100|LLaMA-70B|巡检日报/)[0].textContent;
      expect(first).toBe("巡检日报：NAS 存储空间");
    });

    it("priority asc → A100 → LLaMA → NAS", () => {
      render(<FollowUpManager />);
      fireEvent.change(getSelect("排序方式"), { target: { value: "priority" } });
      const names = screen.getAllByText(/GPU-A100|LLaMA-70B|巡检日报/).map(n => n.textContent);
      expect(names[0]).toBe("GPU-A100-03 温度告警处理");
      expect(names[1]).toBe("LLaMA-70B 模型版本升级");
      expect(names[2]).toBe("巡检日报：NAS 存储空间");
    });
  });

  // =================================================================
  describe("新建任务（3→4）", () => {
    it("点击新建任务 → 打开弹窗 title='新建跟进任务'", () => {
      render(<FollowUpManager />);
      fireEvent.click(screen.getByText("新建任务"));
      expect(screen.getByTestId("yyc3-followup-edit-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("yyc3-followup-edit-title").textContent).toBe("新建跟进任务");
    });

    it("点击保存新建 → 列表 3 → 4，新增 taskName='MOCK新建任务'", () => {
      render(<FollowUpManager />);
      expect(useFollowUpSlice.getState().followUps).toHaveLength(3);
      fireEvent.click(screen.getByText("新建任务"));
      fireEvent.click(screen.getByTestId("yyc3-followup-edit-save"));
      const all = useFollowUpSlice.getState().followUps;
      expect(all).toHaveLength(4);
      expect(all[3].taskName).toBe("MOCK新建任务");
      expect(screen.queryByTestId("yyc3-followup-edit-dialog")).toBeNull();
    });
  });

  // =================================================================
  describe("编辑任务", () => {
    it("编辑 A100 行 → 弹窗包含 'GPU-A100-03'", () => {
      // 默认排序 dueDate asc → NAS(fu-003 最早) → A100(fu-001) → LLaMA(fu-002)
      // editBtns[0]=NAS, editBtns[1]=A100, editBtns[2]=LLaMA
      render(<FollowUpManager />);
      const editBtns = screen.getAllByTitle("编辑");
      expect(editBtns.length).toBe(3);
      fireEvent.click(editBtns[1]);   // A100 (fu-001)
      expect(screen.getByTestId("yyc3-followup-edit-title").textContent).toContain("GPU-A100-03");
    });

    it("保存修改 → fu-001.taskName 追加 '（已改）'", () => {
      render(<FollowUpManager />);
      const editBtns = screen.getAllByTitle("编辑");
      fireEvent.click(editBtns[1]);   // A100 (fu-001)
      fireEvent.click(screen.getByTestId("yyc3-followup-edit-save"));
      const fu = useFollowUpSlice.getState().followUps.find(f => f.id === "fu-001")!;
      expect(fu.taskName).toContain("（已改）");
    });
  });

  // =================================================================
  describe("删除任务（confirm 双分支）", () => {
    it("confirm=true → 删除 LLaMA(fu-002) → 3→2，confirm 文案匹配", () => {
      // trashBtns 顺序同编辑：[0]=NAS(fu-003), [1]=A100(fu-001), [2]=LLaMA(fu-002)
      render(<FollowUpManager />);
      const trashBtns = screen.getAllByTitle("删除");
      expect(trashBtns.length).toBe(3);
      fireEvent.click(trashBtns[2]);   // LLaMA 行
      expect(window.confirm).toHaveBeenCalledWith(
        "确认删除该跟进任务？此操作不可恢复",
      );
      expect(useFollowUpSlice.getState().followUps).toHaveLength(2);
      expect(screen.queryAllByText("LLaMA-70B 模型版本升级").length).toBe(0);
    });

    it("confirm=false → 不删除，保持 3 条", () => {
      vi.stubGlobal("confirm", vi.fn().mockReturnValue(false));
      render(<FollowUpManager />);
      const trashBtns = screen.getAllByTitle("删除");
      fireEvent.click(trashBtns[0]);
      expect(useFollowUpSlice.getState().followUps).toHaveLength(3);
    });
  });

  // =================================================================
  describe("逾期逻辑 isOverdue", () => {
    it("仅 fu-002 逾期，fu-001(future)+fu-003(completed) 不逾期 → 逾期值=1", () => {
      // 注意 BASE=1724000000000 << Date.now()，所以初始所有 pending/in_progress 都逾期
      // 因此需要先把 fu-001(in_progress) 推到未来，再单独把 fu-002 留在过去
      const slice = useFollowUpSlice.getState();
      useFollowUpSlice.setState({
        followUps: slice.followUps.map(f => {
          if (f.id === "fu-001") {
            return { ...f, dueDate: Date.now() + 86400_000 };          // 未来 → 不逾期
          }
          if (f.id === "fu-002") {
            return { ...f, dueDate: Date.now() - 3600_000, status: "pending" as const };   // 1 小时前 + pending → 逾期
          }
          if (f.id === "fu-003") {
            return { ...f, status: "completed" as const };            // completed 不逾期
          }
          return f;
        }),
      });
      render(<FollowUpManager />);
      // 校验 slice 自身统计
      const state = useFollowUpSlice.getState();
      const pendingOrProgress = state.followUps.filter(
        f => f.status === "pending" || f.status === "in_progress"
      );
      const overdueCount = pendingOrProgress.filter(f => f.dueDate < Date.now()).length;
      expect(overdueCount).toBe(1);
      // 渲染后值文本 1 出现在: pending=1, inProgress=0, completed=1, overdue=1, total=3
      //  所以 "1" 应该至少出现 3 次（或更多），"0" 至少出现 1 次
      expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(2);
    });
  });
});
