/**
 * @file: ide-types.ts
 * @description: ide-types.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

export interface IDEFile {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: IDEFile[];
  language?: string;
  content?: string;
  size?: string;
  modified?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface IDEProject {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  status: "active" | "archived";
  thumbnail?: string;
}

export type IDEViewMode = "default" | "preview" | "code";

export type IDELayoutMode = "edit" | "preview" | "free";

export interface OpenTab {
  id: string;
  filename: string;
  filepath: string;
  content: string;
  isModified: boolean;
}

// ======== Git Types ========

export type GitFileStatus = "modified" | "added" | "deleted" | "renamed" | "untracked";

export interface GitChange {
  id: string;
  filename: string;
  filepath: string;
  status: GitFileStatus;
  staged: boolean;
  additions: number;
  deletions: number;
}

export interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: string;
  branch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}

export interface GitBranch {
  name: string;
  current: boolean;
  lastCommit: string;
  behind: number;
  ahead: number;
}

// ======== Editor Types ========

export interface EditorDiagnostic {
  line: number;
  column: number;
  severity: "error" | "warning" | "info" | "hint";
  message: string;
  source: string;
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
}

// ======== Notification Types ========

export type IDENotificationSeverity = "info" | "warning" | "error" | "success";

export interface IDENotification {
  id: string;
  title: string;
  message: string;
  severity: IDENotificationSeverity;
  timestamp: string;
  read: boolean;
  source: string;
}

// ======== IDE Settings Types ========

export interface IDESettings {
  theme: "dark" | "light" | "cyberpunk";
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  formatOnSave: boolean;
  bracketPairColorization: boolean;
}
