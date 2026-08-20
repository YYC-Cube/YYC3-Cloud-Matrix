/**
 * @file: FollowUpManager.tsx
 * @description: FollowUpManager.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle, Clock,
  Edit,
  Filter,
  Flag,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import { useFollowUpSlice } from "../../store/slices/follow-up-slice";
import { useUserMgmtSlice } from "../../store/slices/user-mgmt-slice";
import type { FollowUpRecord } from "../../types";
import { FollowUpEditDialog } from "./FollowUpEditDialog";
import { GlassCard } from "../shared/GlassCard";

export function FollowUpManager() {
  const { t } = useI18n();
  const { followUps, addFollowUp, updateFollowUp, removeFollowUp } = useFollowUpSlice();
  const { users } = useUserMgmtSlice();
  const [filteredFollowUps, setFilteredFollowUps] = useState<FollowUpRecord[]>([]);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | FollowUpRecord["status"]>("all");
  const [filterPriority, setFilterPriority] = useState<"all" | FollowUpRecord["priority"]>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "createdAt">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const applyFilters = () => {
    let filtered = [...followUps];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (fu) =>
          fu.taskName.toLowerCase().includes(query) ||
          fu.notes?.toLowerCase().includes(query) ||
          fu.assigneeName.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((fu) => fu.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((fu) => fu.priority === filterPriority);
    }

    if (filterAssignee !== "all") {
      filtered = filtered.filter((fu) => fu.assignee === filterAssignee);
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "dueDate") {
        comparison = a.dueDate - b.dueDate;
      } else if (sortBy === "priority") {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "createdAt") {
        comparison = a.createdAt - b.createdAt;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredFollowUps(filtered);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followUps, searchQuery, filterStatus, filterPriority, filterAssignee, sortBy, sortOrder]);

  const handleCreate = () => {
    setSelectedFollowUp(null);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (followUp: FollowUpRecord) => {
    setSelectedFollowUp(followUp);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t("collab.confirmDelete"))) {
      removeFollowUp(id);
    }
  };

  const handleStatusChange = (id: string, status: FollowUpRecord["status"]) => {
    const followUp = followUps.find((fu) => fu.id === id);
    if (followUp) {
      const updates: Partial<FollowUpRecord> = { status, updatedAt: Date.now() };
      if (status === "completed") {
        updates.completedAt = Date.now();
      }
      updateFollowUp(id, updates);
    }
  };

  const handleSave = (followUp: FollowUpRecord) => {
    if (followUp.id) {
      updateFollowUp(followUp.id, followUp);
    } else {
      addFollowUp(followUp);
    }
    setIsEditDialogOpen(false);
    setSelectedFollowUp(null);
  };

  const getPriorityColor = (priority: FollowUpRecord["priority"]) => {
    const colors = {
      critical: "#ff3366",
      high: "#ff6600",
      medium: "#ffaa00",
      low: "#00d4ff",
    };
    return colors[priority];
  };

  const getStatusColor = (status: FollowUpRecord["status"]) => {
    const colors = {
      pending: "#ffaa00",
      in_progress: "#00d4ff",
      completed: "#00ff88",
      cancelled: "#666666",
    };
    return colors[status];
  };

  const getStatusIcon = (status: FollowUpRecord["status"]) => {
    const icons = {
      pending: Clock,
      in_progress: RefreshCw,
      completed: CheckCircle,
      cancelled: AlertCircle,
    };
    return icons[status];
  };

  const isOverdue = (dueDate: number, status: FollowUpRecord["status"]) => {
    return (status === "pending" || status === "in_progress") && dueDate < Date.now();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntilDue = (dueDate: number) => {
    const now = Date.now();
    const diff = dueDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const stats = {
    total: followUps.length,
    pending: followUps.filter((fu) => fu.status === "pending").length,
    inProgress: followUps.filter((fu) => fu.status === "in_progress").length,
    completed: followUps.filter((fu) => fu.status === "completed").length,
    overdue: followUps.filter((fu) => isOverdue(fu.dueDate, fu.status)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
            <Flag className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h2 className="text-[#e0f0ff]" style={{ fontSize: "1.1rem" }}>
              {t("collab.title")}
            </h2>
            <p className="text-[rgba(0,212,255,0.35)]" style={{ fontSize: "0.7rem" }}>
              {t("collab.subtitle")}
            </p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))",
            border: "1px solid rgba(0,212,255,0.3)",
            color: "#00d4ff",
            fontSize: "0.75rem",
          }}
        >
          <Plus className="w-4 h-4" />
          {t("collab.create")}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label={t("collab.stats.total")} value={stats.total} color="#00d4ff" />
        <StatCard label={t("collab.stats.pending")} value={stats.pending} color="#ffaa00" />
        <StatCard label={t("collab.stats.inProgress")} value={stats.inProgress} color="#00d4ff" />
        <StatCard label={t("collab.stats.completed")} value={stats.completed} color="#00ff88" />
        <StatCard label={t("collab.stats.overdue")} value={stats.overdue} color="#ff3366" />
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,212,255,0.5)]" />
            <input
              type="text"
              placeholder={t("collab.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] placeholder-[rgba(0,212,255,0.4)] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[rgba(0,212,255,0.5)]" />
            <select
              title="状态筛选"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "pending" | "in_progress" | "completed" | "cancelled")}
              className="px-3 py-2 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] focus:outline-none focus:border-[#00d4ff]"
            >
              <option value="all">{t("collab.filter.allStatus")}</option>
              <option value="pending">{t("collab.status.pending")}</option>
              <option value="in_progress">{t("collab.status.inProgress")}</option>
              <option value="completed">{t("collab.status.completed")}</option>
              <option value="cancelled">{t("collab.status.cancelled")}</option>
            </select>

            <select
              title="优先级筛选"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as "all" | "critical" | "high" | "medium" | "low")}
              className="px-3 py-2 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] focus:outline-none focus:border-[#00d4ff]"
            >
              <option value="all">{t("collab.filter.allPriority")}</option>
              <option value="critical">{t("collab.priority.critical")}</option>
              <option value="high">{t("collab.priority.high")}</option>
              <option value="medium">{t("collab.priority.medium")}</option>
              <option value="low">{t("collab.priority.low")}</option>
            </select>

            <select
              title="负责人筛选"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] focus:outline-none focus:border-[#00d4ff]"
            >
              <option value="all">{t("collab.filter.allAssignee")}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              title="排序方式"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "dueDate" | "priority" | "createdAt")}
              className="px-3 py-2 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] focus:outline-none focus:border-[#00d4ff]"
            >
              <option value="dueDate">{t("collab.sort.dueDate")}</option>
              <option value="priority">{t("collab.sort.priority")}</option>
              <option value="createdAt">{t("collab.sort.createdAt")}</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#e0f0ff] hover:bg-[rgba(0,212,255,0.1)] transition-colors"
            >
              {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {filteredFollowUps.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Flag className="w-12 h-12 text-[rgba(0,212,255,0.3)] mx-auto mb-4" />
            <p className="text-[#e0f0ff] mb-2">{t("collab.empty.title")}</p>
            <p className="text-sm text-[rgba(0,212,255,0.5)]">
              {t("collab.empty.hint")}
            </p>
          </GlassCard>
        ) : (
          filteredFollowUps.map((followUp) => {
            const StatusIcon = getStatusIcon(followUp.status);
            const daysUntilDue = getDaysUntilDue(followUp.dueDate);
            const overdue = isOverdue(followUp.dueDate, followUp.status);

            return (
              <GlassCard
                key={followUp.id}
                className={`p-4 ${overdue ? "border-l-4 border-l-[#ff3366]" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${getPriorityColor(followUp.priority)}20` }}
                  >
                    <Flag className="w-5 h-5" style={{ color: getPriorityColor(followUp.priority) }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#e0f0ff] mb-1" style={{ fontSize: "0.88rem" }}>
                          {followUp.taskName}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${getPriorityColor(followUp.priority)}20`,
                              color: getPriorityColor(followUp.priority),
                            }}
                          >
                            {followUp.priority}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
                            style={{
                              backgroundColor: `${getStatusColor(followUp.status)}20`,
                              color: getStatusColor(followUp.status),
                            }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {followUp.status}
                          </span>
                          <span className="text-xs text-[rgba(0,212,255,0.5)]">
                            {followUp.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(followUp)}
                          className="p-2 hover:bg-[rgba(0,212,255,0.1)] rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4 text-[rgba(0,212,255,0.7)]" />
                        </button>
                        <button
                          onClick={() => handleDelete(followUp.id)}
                          className="p-2 hover:bg-[rgba(255,51,102,0.1)] rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-[rgba(255,51,102,0.7)]" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2 text-[rgba(0,212,255,0.7)]">
                        <User className="w-4 h-4" />
                        {followUp.assigneeName}
                      </div>
                      <div
                        className={`flex items-center gap-2 ${overdue ? "text-[#ff3366]" : "text-[rgba(0,212,255,0.7)]"}`}
                      >
                        <Calendar className="w-4 h-4" />
                        {overdue ? (
                          <span>{t("collab.overdue.prefix")} {Math.abs(daysUntilDue)} {t("collab.overdue.suffix")}</span>
                        ) : (
                          <span>{t("collab.remaining.prefix")} {daysUntilDue} {t("collab.remaining.suffix")}</span>
                        )}
                        <span className="text-xs opacity-70">
                          ({formatDate(followUp.dueDate)})
                        </span>
                      </div>
                    </div>

                    {followUp.notes && (
                      <p className="text-sm text-[rgba(0,212,255,0.6)] mb-3">
                        {followUp.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      {followUp.status === "pending" && (
                        <button
                          onClick={() => handleStatusChange(followUp.id, "in_progress")}
                          className="px-3 py-1.5 bg-[rgba(0,212,255,0.1)] text-[#00d4ff] rounded-lg text-sm hover:bg-[rgba(0,212,255,0.2)] transition-colors"
                        >
                          {t("collab.action.start")}
                        </button>
                      )}
                      {followUp.status === "in_progress" && (
                        <button
                          onClick={() => handleStatusChange(followUp.id, "completed")}
                          className="px-3 py-1.5 bg-[rgba(0,255,136,0.1)] text-[#00ff88] rounded-lg text-sm hover:bg-[rgba(0,255,136,0.2)] transition-colors"
                        >
                          {t("collab.action.complete")}
                        </button>
                      )}
                      {followUp.status === "completed" && (
                        <button
                          onClick={() => handleStatusChange(followUp.id, "pending")}
                          className="px-3 py-1.5 bg-[rgba(255,170,0,0.1)] text-[#ffaa00] rounded-lg text-sm hover:bg-[rgba(255,170,0,0.2)] transition-colors"
                        >
                          {t("collab.action.reopen")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      <FollowUpEditDialog
        isOpen={isEditDialogOpen}
        followUp={selectedFollowUp}
        users={users}
        onSave={handleSave}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedFollowUp(null);
        }}
      />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Flag className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-[rgba(0,212,255,0.5)] mb-1">{label}</p>
          <p className="text-2xl font-bold" style={{ color, fontFamily: "'Orbitron', sans-serif" }}>
            {value}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
