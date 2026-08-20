/**
 * @file: utils.ts
 * @description: utils.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-19
 * @updated: 2026-03-19
 * @status: active
 * @tags: [tag1],[tag2],[tag3]
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
