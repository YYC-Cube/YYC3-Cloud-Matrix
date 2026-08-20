/**
 * @file: family-calllog-slice.ts
 * @description: YYC³ AI Family 通话记录 Slice — CRUD + 持久化
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-25
 * @updated: 2026-04-25
 * @status: active
 * @tags: [store],[slice],[ai-family],[calllog]
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CallLog {
  id: string;
  memberId: string;
  time: string;
  duration: string;
  type: "incoming" | "outgoing" | "missed";
  createdAt: number;
}

const SEED_CALL_LOGS: CallLog[] = [
  { id: "c1", memberId: "meta-oracle", time: "10:15", duration: "3:42", type: "outgoing", createdAt: Date.now() - 3600000 },
  { id: "c2", memberId: "creative", time: "09:30", duration: "5:18", type: "incoming", createdAt: Date.now() - 7200000 },
  { id: "c3", memberId: "sentinel", time: "09:00", duration: "1:05", type: "incoming", createdAt: Date.now() - 10800000 },
  { id: "c4", memberId: "thinker", time: "昨天 18:20", duration: "8:33", type: "outgoing", createdAt: Date.now() - 86400000 },
  { id: "c5", memberId: "prophet", time: "昨天 15:00", duration: "", type: "missed", createdAt: Date.now() - 90000000 },
  { id: "c6", memberId: "navigator", time: "昨天 11:45", duration: "2:10", type: "incoming", createdAt: Date.now() - 93600000 },
];

interface FamilyCallLogSlice {
  callLogs: CallLog[];
  addCallLog: (log: Omit<CallLog, "id" | "createdAt">) => void;
  deleteCallLog: (id: string) => void;
  clearCallLogs: () => void;
}

export const useFamilyCallLogSlice = create<FamilyCallLogSlice>()(
  persist(
    (set) => ({
      callLogs: SEED_CALL_LOGS,

      addCallLog: (log) =>
        set((s) => ({
          callLogs: [
            { ...log, id: `call-${Date.now()}`, createdAt: Date.now() },
            ...s.callLogs,
          ],
        })),

      deleteCallLog: (id) =>
        set((s) => ({
          callLogs: s.callLogs.filter((c) => c.id !== id),
        })),

      clearCallLogs: () => set({ callLogs: [] }),
    }),
    { name: "yyc3-family-calllog" },
  ),
);
