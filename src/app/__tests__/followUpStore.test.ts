/**
 * @file: followUpStore.test.ts
 * @description: followUpStore.test.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  followUpStore,
  getPendingFollowUps,
  getOverdueFollowUps,
  getFollowUpsByPriority,
  getFollowUpsByAssignee,
} from "../stores/dashboard-stores";
import type { FollowUpRecord } from "../types";

describe("followUpStore", () => {
  beforeEach(() => {
    followUpStore.reset();
  });

  afterEach(() => {
    followUpStore.reset();
  });

  describe("getAll", () => {
    it("should return default follow-ups on first call", () => {
      const followUps = followUpStore.getAll();
      expect(followUps).toHaveLength(3);
      expect(followUps[0].taskName).toBe("GPU-A100-03 温度优化");
    });

    it("should return all follow-ups", () => {
      const followUps = followUpStore.getAll();
      expect(followUps).toBeDefined();
      expect(Array.isArray(followUps)).toBe(true);
    });
  });

  describe("getById", () => {
    it("should return follow-up by id", () => {
      const followUp = followUpStore.getById("fu-001");
      expect(followUp).toBeDefined();
      expect(followUp?.taskName).toBe("GPU-A100-03 温度优化");
    });

    it("should return undefined for non-existent id", () => {
      const followUp = followUpStore.getById("non-existent");
      expect(followUp).toBeUndefined();
    });
  });

  describe("add", () => {
    it("should add new follow-up", () => {
      const newFollowUp: Omit<FollowUpRecord, "id"> = {
        taskId: "TASK-004",
        taskName: "新任务",
        assignee: "usr-1",
        assigneeName: "张管理",
        priority: "medium",
        status: "pending",
        dueDate: Date.now() + 86400000 * 7,
        category: "maintenance",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const added = followUpStore.add(newFollowUp);
      expect(added).toBeDefined();
      expect(added.id).toMatch(/^fu-/);
      expect(added.taskName).toBe("新任务");

      const allFollowUps = followUpStore.getAll();
      expect(allFollowUps).toHaveLength(4);
    });

    it("should use provided id if available", () => {
      const newFollowUp: FollowUpRecord = {
        id: "fu-custom-001",
        taskId: "TASK-005",
        taskName: "自定义 ID 任务",
        assignee: "usr-1",
        assigneeName: "张管理",
        priority: "low",
        status: "pending",
        dueDate: Date.now() + 86400000 * 7,
        category: "feature",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const added = followUpStore.add(newFollowUp);
      expect(added.id).toBe("fu-custom-001");
    });
  });

  describe("update", () => {
    it("should update existing follow-up", () => {
      const updates = {
        status: "completed" as FollowUpRecord["status"],
        completedAt: Date.now(),
        notes: "任务已完成",
      };

      const updated = followUpStore.update("fu-001", updates);
      expect(updated).toBeDefined();
      expect(updated?.status).toBe("completed");
      expect(updated?.completedAt).toBeDefined();
      expect(updated?.notes).toBe("任务已完成");

      const followUp = followUpStore.getById("fu-001");
      expect(followUp?.status).toBe("completed");
    });

    it("should return null for non-existent id", () => {
      const updated = followUpStore.update("non-existent", { status: "completed" });
      expect(updated).toBeNull();
    });

    it("should update updatedAt timestamp when provided", () => {
      const newTimestamp = Date.now() + 1000;
      const updated = followUpStore.update("fu-001", { updatedAt: newTimestamp });
      expect(updated?.updatedAt).toBe(newTimestamp);
    });
  });

  describe("remove", () => {
    it("should remove follow-up by id", () => {
      const initialCount = followUpStore.getAll().length;
      const removed = followUpStore.remove("fu-001");

      expect(removed).toBe(true);
      expect(followUpStore.getAll().length).toBe(initialCount - 1);
      expect(followUpStore.getById("fu-001")).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const removed = followUpStore.remove("non-existent");
      expect(removed).toBe(false);
    });
  });

  describe("removeBatch", () => {
    it("should remove multiple follow-ups", () => {
      const initialCount = followUpStore.getAll().length;
      const removedCount = followUpStore.removeBatch(["fu-001", "fu-002"]);

      expect(removedCount).toBe(2);
      expect(followUpStore.getAll().length).toBe(initialCount - 2);
    });

    it("should return 0 for empty array", () => {
      const removedCount = followUpStore.removeBatch([]);
      expect(removedCount).toBe(0);
    });

    it("should handle mix of existing and non-existent ids", () => {
      const initialCount = followUpStore.getAll().length;
      const removedCount = followUpStore.removeBatch(["fu-001", "non-existent"]);

      expect(removedCount).toBe(1);
      expect(followUpStore.getAll().length).toBe(initialCount - 1);
    });
  });

  describe("reset", () => {
    it("should reset to default follow-ups", () => {
      followUpStore.add({
        taskId: "TASK-004",
        taskName: "新任务",
        assignee: "usr-1",
        assigneeName: "张管理",
        priority: "medium",
        status: "pending",
        dueDate: Date.now() + 86400000 * 7,
        category: "maintenance",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      expect(followUpStore.getAll().length).toBeGreaterThan(3);

      const reset = followUpStore.reset();
      expect(reset).toHaveLength(3);
      expect(followUpStore.getAll()).toHaveLength(3);
    });
  });

  describe("exportData", () => {
    it("should export follow-ups as JSON", () => {
      const exported = followUpStore.exportData();
      expect(typeof exported).toBe("string");

      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty("_key");
      expect(parsed).toHaveProperty("_exportedAt");
      expect(parsed).toHaveProperty("data");
      expect(parsed._key).toBe("yyc3_follow_ups");
      expect(Array.isArray(parsed.data)).toBe(true);
    });
  });

  describe("importData", () => {
    it("should import follow-ups from JSON", () => {
      const importData = JSON.stringify([
        {
          id: "fu-import-001",
          taskId: "TASK-IMPORT-001",
          taskName: "导入任务",
          assignee: "usr-1",
          assigneeName: "张管理",
          priority: "high",
          status: "pending",
          dueDate: Date.now() + 86400000 * 7,
          category: "bugfix",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);

      const imported = followUpStore.importData(importData);
      expect(imported).toBe(true);

      const followUps = followUpStore.getAll();
      expect(followUps).toHaveLength(1);
      expect(followUps[0].taskName).toBe("导入任务");
    });

    it("should return false for invalid JSON", () => {
      const imported = followUpStore.importData("invalid json");
      expect(imported).toBe(false);
    });

    it("should return false for non-array data", () => {
      const imported = followUpStore.importData(JSON.stringify({ not: "an array" }));
      expect(imported).toBe(false);
    });
  });

  describe("count", () => {
    it("should return the number of follow-ups", () => {
      const count = followUpStore.count();
      expect(count).toBe(3);
    });

    it("should update count after adding", () => {
      const initialCount = followUpStore.count();
      followUpStore.add({
        taskId: "TASK-004",
        taskName: "新任务",
        assignee: "usr-1",
        assigneeName: "张管理",
        priority: "medium",
        status: "pending",
        dueDate: Date.now() + 86400000 * 7,
        category: "maintenance",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      expect(followUpStore.count()).toBe(initialCount + 1);
    });
  });
});

describe("followUpStore utility functions", () => {
  beforeEach(() => {
    followUpStore.reset();
  });

  afterEach(() => {
    followUpStore.reset();
  });

  describe("getPendingFollowUps", () => {
    it("should return pending and in_progress follow-ups", () => {
      const pending = getPendingFollowUps();

      expect(pending.length).toBeGreaterThan(0);
      pending.forEach((fu: FollowUpRecord) => {
        expect(["pending", "in_progress"]).toContain(fu.status);
      });
    });
  });

  describe("getOverdueFollowUps", () => {
    it("should return overdue follow-ups", () => {
      followUpStore.update("fu-001", {
        dueDate: Date.now() - 86400000,
      });

      const overdue = getOverdueFollowUps();
      expect(overdue.length).toBeGreaterThan(0);
      overdue.forEach((fu: FollowUpRecord) => {
        expect(fu.dueDate).toBeLessThan(Date.now());
        expect(["pending", "in_progress"]).toContain(fu.status);
      });
    });
  });

  describe("getFollowUpsByPriority", () => {
    it("should return follow-ups by priority", () => {
      const highPriority = getFollowUpsByPriority("high");

      highPriority.forEach((fu: FollowUpRecord) => {
        expect(fu.priority).toBe("high");
      });
    });
  });

  describe("getFollowUpsByAssignee", () => {
    it("should return follow-ups by assignee", () => {
      const assigneeFollowUps = getFollowUpsByAssignee("usr-2");

      assigneeFollowUps.forEach((fu: FollowUpRecord) => {
        expect(fu.assignee).toBe("usr-2");
      });
    });
  });
});
