/**
 * @file: FollowUpEditDialog.tsx
 * @description: FollowUpEditDialog.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React, { useState, useEffect } from "react";
import { X, Save, Calendar, User, Flag, FileText } from "lucide-react";
import { GlassCard } from "../shared/GlassCard";
import type { FollowUpRecord, UserRecord } from "../../types";

interface FollowUpEditDialogProps {
  isOpen: boolean;
  followUp: FollowUpRecord | null;
  users: UserRecord[];
  onSave: (followUp: FollowUpRecord) => void;
  onClose: () => void;
}

export function FollowUpEditDialog({
  isOpen,
  followUp,
  users,
  onSave,
  onClose,
}: FollowUpEditDialogProps) {
  const [formData, setFormData] = useState<Partial<FollowUpRecord>>({
    taskId: "",
    taskName: "",
    assignee: "",
    assigneeName: "",
    priority: "medium",
    status: "pending",
    dueDate: Date.now() + 86400000 * 7,
    notes: "",
    category: "maintenance",
  });

  useEffect(() => {
    if (followUp) {
      setFormData(followUp);
    } else {
      setFormData({
        taskId: "",
        taskName: "",
        assignee: users[0]?.id || "",
        assigneeName: users[0]?.name || "",
        priority: "medium",
        status: "pending",
        dueDate: Date.now() + 86400000 * 7,
        notes: "",
        category: "maintenance",
      });
    }
  }, [followUp, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assigneeUser = users.find((u) => u.id === formData.assignee);
    const followUpData: FollowUpRecord = {
      id: formData.id || `fu-${Date.now()}`,
      taskId: formData.taskId || `TASK-${Date.now()}`,
      taskName: formData.taskName || "",
      assignee: formData.assignee || "",
      assigneeName: assigneeUser?.name || "",
      priority: formData.priority || "medium",
      status: formData.status || "pending",
      dueDate: formData.dueDate || Date.now() + 86400000 * 7,
      notes: formData.notes,
      category: formData.category || "maintenance",
      createdAt: followUp?.createdAt || Date.now(),
      updatedAt: Date.now(),
      completedAt: formData.status === "completed" ? Date.now() : undefined,
    };

    onSave(followUpData);
  };

  const handleChange = (
    field: keyof FollowUpRecord,
    value: unknown
   ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssigneeChange = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setFormData((prev) => ({
      ...prev,
      assignee: userId,
      assigneeName: user?.name || "",
    }));
  };

  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
                <Flag className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#e0f0ff]">
                  {followUp ? "编辑跟进任务" : "新建跟进任务"}
                </h2>
                <p className="text-sm text-[rgba(0,212,255,0.5)]">
                  {followUp ? "修改任务信息" : "创建新的跟进任务"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgba(0,212,255,0.1)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[rgba(0,212,255,0.7)]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#e0f0ff]">
                  <FileText className="w-4 h-4" />
                  任务名称 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.taskName}
                  onChange={(e) => handleChange("taskName", e.target.value)}
                  placeholder="输入任务名称"
                  className="w-full px-4 py-2.5 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] placeholder-[rgba(0,212,255,0.4)] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#e0f0ff]">
                  <FileText className="w-4 h-4" />
                  任务 ID
                </label>
                <input
                  type="text"
                  value={formData.taskId}
                  onChange={(e) => handleChange("taskId", e.target.value)}
                  placeholder="TASK-XXX"
                  className="w-full px-4 py-2.5 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] placeholder-[rgba(0,212,255,0.4)] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#e0f0ff]">
                  <User className="w-4 h-4" />
                  负责人 *
                </label>
                <select
                  required
                  value={formData.assignee}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] focus:outline-none focus:border-[#00d4ff]"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#e0f0ff]">
                  <Flag className="w-4 h-4" />
                  优先级 *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="critical">紧急</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#e0f0ff]">
                  <Flag className="w-4 h-4" />
                  状态 *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="pending">待处理</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#e0f0ff]">
                  <Flag className="w-4 h-4" />
                  分类 *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="maintenance">维护</option>
                  <option value="optimization">优化</option>
                  <option value="security">安全</option>
                  <option value="feature">功能</option>
                  <option value="bugfix">缺陷修复</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#e0f0ff]">
                  <Calendar className="w-4 h-4" />
                  截止日期 *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={new Date(formData.dueDate || Date.now()).toISOString().slice(0, 16)}
                  onChange={(e) => handleChange("dueDate", new Date(e.target.value).getTime())}
                  className="w-full px-4 py-2.5 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#e0f0ff]">
                  <FileText className="w-4 h-4" />
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="输入任务备注..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] placeholder-[rgba(0,212,255,0.4)] focus:outline-none focus:border-[#00d4ff] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(0,212,255,0.2)]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[rgba(0,212,255,0.05)] text-[#e0f0ff] rounded-lg hover:bg-[rgba(0,212,255,0.1)] transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#00d4ff] text-[#060e1f] rounded-lg font-medium hover:bg-[#00b8e6] transition-colors"
              >
                <Save className="w-4 h-4" />
                {followUp ? "保存修改" : "创建任务"}
              </button>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
