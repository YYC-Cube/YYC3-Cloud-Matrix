/**
 * @file: shims.d.ts
 * @description: IDE 标准规范类型声明 — 解决第三方库类型兼容性问题
 * @author: YanYuCloudCube Team <admin@0379.email>
 * @version: v1.1.0
 * @created: 2026-06-03
 * @updated: 2026-06-03
 * @status: stable
 * @license: MIT
 */

// ================================================================
// IDE 标准规范全局类型声明
// 解决：idb / jszip / file-saver / react-window / agent 模块 / Timer类型
// ================================================================

// ── idb (IndexedDB) ──

declare module 'idb' {
  interface IDBPDatabase<T = IDBDatabase> {
    name: string;
    objectStoreNames: DOMStringList;
    version: number;
    close(): void;
    transaction(storeNames: string | readonly string[], mode?: IDBTransactionMode, options?: IDBTransactionOptions): IDBPTransaction<T>;
    createObjectStore(name: string, optionalParameters?: IDBObjectStoreParameters): IDBPObjectStore<T>;
    deleteObjectStore(name: string): void;
    getAll<T>(storeName: string, query?: IDBValidKey | IDBKeyRange, count?: number): Promise<T[]>;
    get<T>(storeName: string, query: IDBValidKey | IDBKeyRange): Promise<T | undefined>;
    put(storeName: string, value: unknown, key?: IDBValidKey): Promise<IDBValidKey>;
    add(storeName: string, value: unknown, key?: IDBValidKey): Promise<IDBValidKey>;
    delete(storeName: string, key: IDBValidKey | IDBKeyRange): Promise<void>;
    clear(storeName: string): Promise<void>;
  }

  interface IDBPTransaction<T = IDBDatabase> {
    objectStore(name: string): IDBPObjectStore<T>;
    store: IDBPObjectStore<T>;
    done: Promise<void>;
    abort(): void;
    commit(): void;
    error: DOMException | null;
    mode: IDBTransactionMode;
    db: T;
  }

  interface IDBPObjectStore<T = IDBDatabase> {
    name: string;
    keyPath: string | string[];
    indexNames: DOMStringList;
    autoIncrement: boolean;
    get(query: IDBValidKey | IDBKeyRange): Promise<unknown>;
    getAll(query?: IDBValidKey | IDBKeyRange, count?: number): Promise<unknown[]>;
    count(query?: IDBValidKey | IDBKeyRange): Promise<number>;
    put(value: unknown, key?: IDBValidKey): Promise<IDBValidKey>;
    add(value: unknown, key?: IDBValidKey): Promise<IDBValidKey>;
    delete(query: IDBValidKey | IDBKeyRange): Promise<void>;
    clear(): Promise<void>;
    createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): IDBIndex;
    index(name: string): IDBIndex;
    deleteIndex(name: string): void;
  }

  interface OpenDBCallbacks {
    upgrade(db: IDBPDatabase, oldVersion: number, newVersion: number | null, transaction: IDBPTransaction): void;
  }

  function openDB<T extends IDBDatabase>(
    name: string,
    version: number,
    callbacks?: OpenDBCallbacks
  ): Promise<IDBPDatabase<T>>;

  function deleteDB(name: string, options?: { blocked?: () => void }): Promise<void>;

  export { openDB, deleteDB };
  export type { IDBPDatabase, IDBPTransaction, IDBPObjectStore };
}

// ── jszip ──

declare module 'jszip' {
  class JSZip {
    files: Record<string, JSZipObject>;

    constructor(data?: ArrayBuffer | string, options?: Record<string, unknown>);

    file(name: string, data?: string | ArrayBuffer | Blob | unknown, options?: Record<string, unknown>): this;

    folder(name: string): JSZip;

    remove(name: string): this;

    generateAsync(options?: { type?: string; compression?: string; compressionOptions?: Record<string, unknown> }, onUpdate?: (metadata: { percent: number }) => void): Promise<ArrayBuffer | Blob>;

    static loadAsync(data: ArrayBuffer | Blob | File | string, options?: Record<string, unknown>): Promise<JSZip>;
  }

  interface JSZipObject {
    name: string;
    dir: boolean;
    date: Date;
    comment: string;

    async(type: 'arraybuffer'): Promise<ArrayBuffer>;
    async(type: 'base64'): Promise<string>;
    async(type: 'string' | 'text'): Promise<string>;
    async(type: 'uint8array'): Promise<Uint8Array>;
    async(type: 'blob'): Promise<Blob>;
  }

  export default JSZip;
}

// ── file-saver ──

declare module 'file-saver' {
  function saveAs(data: Blob | File | string, filename?: string, options?: { autoBom?: boolean }): void;
  export { saveAs };
}

// ── react-window (v2 兼容 — 匹配 VirtualList 实际使用) ──

declare module 'react-window' {
  import type { CSSProperties, ReactNode } from 'react';

  interface ListChildComponentProps {
    index: number;
    style: CSSProperties;
  }

  interface RowComponentProps<T = unknown> extends ListChildComponentProps {
    data: T;
    [key: string]: unknown; // 允许额外属性透传
  }

  interface ScrollToRowOptions {
    index: number;
    align?: 'auto' | 'smart' | 'center' | 'start' | 'end';
  }

  interface RowsRenderedInfo {
    visibleStartIndex: number;
    visibleStopIndex: number;
    startIndex?: number;
    stopIndex?: number;
  }

  interface ListProps {
    /** 高度 (可通过 style 或此 prop 设置) */
    height?: number | string;
    /** 宽度 (可通过 style 或此 prop 设置) */
    width?: number | string;
    /** v1 兼容 */
    itemCount?: number;
    itemSize?: number | ((index: number) => number);
    /** v2 API (VirtualList 实际使用) */
    rowCount?: number;
    rowHeight?: number | ((index: number) => number);
    itemData?: unknown;
    overscanCount?: number;
    className?: string;
    style?: CSSProperties;
    children?: React.ComponentType<ListChildComponentProps>;
    listRef?: React.RefObject<unknown>;
    rowComponent?: React.ComponentType<RowComponentProps>;
    rowProps?: Record<string, unknown>;
    onRowsRendered?: (info: RowsRenderedInfo) => void;
  }

  class List extends React.Component<ListProps> {
    scrollTo(scrollOffset: number): void;
    scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'start' | 'end'): void;
    scrollToRow?(options: ScrollToRowOptions): void;
    resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
  }

  function useListRef<T = unknown>(initialValue?: T | null): React.MutableRefObject<T | null>;

  export { List, useListRef };
  export type { ListChildComponentProps, RowComponentProps, RowsRenderedInfo, ScrollToRowOptions };
}

// ════════════════════════════════════════════════════════════
//  Agent 智能体模块 — 完整类型声明（匹配 AgentServiceAdapter 使用）
// ════════════════════════════════════════════════════════════

// ── 基础类型定义 ──

type _AgentRole = 'planner' | 'coder' | 'tester' | 'reviewer';
type _AgentStatus = 'pending' | 'running' | 'completed' | 'failed';
type _AgentResultStatus = 'success' | 'failed';

interface _AgentMetrics {
  executionTime: number;
  tokensUsed: number;
  filesModified: number;
  testsGenerated: number;
}

interface _AgentInput {
  userMessage: string;
  context: Record<string, unknown>;
  parameters?: Record<string, unknown>;
}

interface _AgentConstraints {
  timeout: number;
  maxRetries: number;
}

interface _AgentMetadata {
  source: string;
  conversationId: string;
  projectId: string;
  tags: string[];
}

// ── agent:types — 核心类型 ──

declare module 'agent:types' {
  export type AgentRole = _AgentRole;
  export type AgentStatus = _AgentStatus;

  export interface AgentTask {
    id: string;
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: AgentStatus;
    input: _AgentInput;
    dependencies: string[];
    constraints: _AgentConstraints;
    metadata: _AgentMetadata;
    createdAt: number;
  }

  export interface AgentResult {
    taskId: string;
    agent: AgentRole;
    status: _AgentResultStatus;
    output: Record<string, unknown>;
    metrics: _AgentMetrics;
    suggestions?: string[];
  }

  export interface AgentContext {
    projectId: string;
    sessionId: string;
    conversationId: string;
    taskDescription: string;
    files?: Array<{ path: string; content: string }>;
    history?: AgentResult[];
    metadata?: Record<string, unknown>;
  }

  export interface TaskDefinition {
    id: string;
    title: string;
    description: string;
    type: string;
    requiredAgent: AgentRole;
    dependencies?: string[];
    estimatedDuration?: number;
    priority?: 'low' | 'medium' | 'high';
  }
}

// ── agent:orchestrator — 编排器 ──

declare module 'agent:orchestrator' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type AgentRole = _AgentRole;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentResult {
    taskId: string; agent: AgentRole; status: _AgentResultStatus;
    output: Record<string, unknown>; metrics: _AgentMetrics; suggestions?: string[];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TaskDefinition { id: string; title: string; description: string; type: string }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentContext { projectId: string; sessionId: string; conversationId: string; taskDescription: string }

  export interface OrchestratorConfig {
    maxRetries?: number;
    timeout?: number;
    parallelExecution?: boolean;
    saveToMemory?: boolean;
    enableStreaming?: boolean;
    maxConcurrentTasks?: number;
    taskTimeout?: number;
    retryAttempts?: number;
    enableParallelExecution?: boolean;
  }

  export interface OrchestratorState {
    currentStage: 'idle' | 'planning' | 'coding' | 'testing' | 'reviewing' | 'completed' | 'error';
    agents: Partial<Record<AgentRole, { status: string; progress: number; currentTask: string }>>;
    results: AgentResult[];
    totalDuration: number;
  }

  export class AgentOrchestrator {
    constructor(config?: Partial<OrchestratorConfig>);
    initialize(context: AgentContext): Promise<void>;
    getOrchestratorState(): OrchestratorState;
    getState(): OrchestratorState;
    execute(context: AgentContext): AsyncIterable<{ stage: string; progress: number; message: string; result?: AgentResult }>;
    cancel(): void;
    reset(): void;
  }
}

// ── agent:planner — 规划智能体 ──

declare module 'agent:planner' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type AgentRole = _AgentRole;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentTask {
    id: string; type: string; description: string;
    priority: string; status: string; input: _AgentInput;
    dependencies: string[]; constraints: _AgentConstraints;
    metadata: _AgentMetadata; createdAt: number;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentResult {
    taskId: string; agent: AgentRole; status: _AgentResultStatus;
    output: Record<string, unknown>; metrics: _AgentMetrics; suggestions?: string[];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentContext { projectId: string; sessionId: string; conversationId: string; taskDescription: string }

  export class PlannerAgent {
    static role: 'planner';
    constructor();
    initialize(context: AgentContext): Promise<void>;
    execute(task: AgentTask): Promise<AgentResult>;
  }
}

// ── agent:coder — 编码智能体 ──

declare module 'agent:coder' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type AgentRole = _AgentRole;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentTask {
    id: string; type: string; description: string;
    priority: string; status: string; input: _AgentInput;
    dependencies: string[]; constraints: _AgentConstraints;
    metadata: _AgentMetadata; createdAt: number;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentResult {
    taskId: string; agent: AgentRole; status: _AgentResultStatus;
    output: Record<string, unknown>; metrics: _AgentMetrics; suggestions?: string[];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentContext { projectId: string; sessionId: string; conversationId: string; taskDescription: string }

  export class CoderAgent {
    static role: 'coder';
    constructor();
    initialize(context: AgentContext): Promise<void>;
    execute(task: AgentTask): Promise<AgentResult>;
  }
}

// ── agent:tester — 测试智能体 ──

declare module 'agent:tester' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type AgentRole = _AgentRole;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentTask {
    id: string; type: string; description: string;
    priority: string; status: string; input: _AgentInput;
    dependencies: string[]; constraints: _AgentConstraints;
    metadata: _AgentMetadata; createdAt: number;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentResult {
    taskId: string; agent: AgentRole; status: _AgentResultStatus;
    output: Record<string, unknown>; metrics: _AgentMetrics; suggestions?: string[];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentContext { projectId: string; sessionId: string; conversationId: string; taskDescription: string }

  export class TesterAgent {
    static role: 'tester';
    constructor();
    initialize(context: AgentContext): Promise<void>;
    execute(task: AgentTask): Promise<AgentResult>;
  }
}

// ── agent:reviewer — 审查智能体 ──

declare module 'agent:reviewer' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type AgentRole = _AgentRole;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentTask {
    id: string; type: string; description: string;
    priority: string; status: string; input: _AgentInput;
    dependencies: string[]; constraints: _AgentConstraints;
    metadata: _AgentMetadata; createdAt: number;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentResult {
    taskId: string; agent: AgentRole; status: _AgentResultStatus;
    output: Record<string, unknown>; metrics: _AgentMetrics; suggestions?: string[];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AgentContext { projectId: string; sessionId: string; conversationId: string; taskDescription: string }

  export class ReviewerAgent {
    static role: 'reviewer';
    constructor();
    initialize(context: AgentContext): Promise<void>;
    execute(task: AgentTask): Promise<AgentResult>;
  }
}

// ── NodeJS.Timeout 扩展 ──

declare namespace NodeJS {
  interface Timeout {
    close(): void;
    ref(): this;
    unref(): this;
    refresh(): this;
  }
}
