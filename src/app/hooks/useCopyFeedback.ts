/**
 * @file: useCopyFeedback.ts
 * @description: 复制到剪贴板 + 临时反馈状态 Hook
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [hook],[clipboard]
 */

import { useState, useCallback, useRef } from "react";

/**
 * 复制到剪贴板 + 临时反馈
 *
 * @param resetMs 反馈重置延迟 (默认 2000ms)
 * @returns [copiedId, copy] — copiedId 为 null 时未复制，非 null 时为当前反馈 key
 *
 * @example
 * // 简单布尔模式
 * const [copied, copy] = useCopyFeedback<boolean>();
 * // 跟踪多消息模式
 * const [copiedId, copy] = useCopyFeedback<string>();
 */
export function useCopyFeedback<T extends string | number | boolean = boolean>(
  resetMs = 2000,
): [T | null, (text: string, id: T) => void] {
  const [copiedId, setCopiedId] = useState<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(
    (text: string, id: T) => {
      navigator.clipboard?.writeText(text).catch(() => {});
      setCopiedId(id);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedId(null), resetMs);
    },
    [resetMs],
  );

  return [copiedId, copy];
}
