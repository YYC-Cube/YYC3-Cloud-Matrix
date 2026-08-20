---
@file: 001-CP-IM-开发实施阶段-React开发规范.md
@description: YYC³-CP-IM React 开发规范与最佳实践
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-26
@updated: 2026-03-05
@status: published
@tags: [开发规范],[React],[开发规范]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元***
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ CloudPivot Intelli-Matrix - React 开发规范

本文档定义 YYC³ CloudPivot Intelli-Matrix 项目的 React 开发规范和最佳实践，确保代码质量、可维护性和团队协作效率。

---

## 目录

- [核心原则](#核心原则)
- [组件规范](#组件规范)
- [Hooks 使用规范](#hooks-使用规范)
- [状态管理](#状态管理)
- [性能优化](#性能优化)
- [样式规范](#样式规范)
- [类型定义](#类型定义)
- [错误处理](#错误处理)
- [测试规范](#测试规范)
- [代码示例](#代码示例)

---

## 核心原则

### 1. 组件化设计

- **单一职责**：每个组件只负责一个功能
- **可复用性**：优先创建可复用的通用组件
- **可组合性**：组件应该易于组合和嵌套

### 2. 类型安全

- **严格模式**：使用 TypeScript 严格模式
- **明确类型**：所有 props 和 state 必须有明确类型
- **避免 any**：禁止使用 `any` 类型

### 3. 性能优先

- **按需加载**：使用 React.lazy 和 Suspense 进行代码分割
- **避免不必要的渲染**：合理使用 memo、useMemo、useCallback
- **优化重渲染**：避免在渲染函数中创建新对象和函数

### 4. 可维护性

- **清晰的命名**：使用有意义的变量和函数名
- **代码注释**：复杂逻辑必须添加注释
- **代码组织**：按照功能模块组织代码结构

---

## 组件规范

### 组件文件结构

```typescript
/**
 * ComponentName.tsx
 * =================
 * 组件描述（简短说明组件的功能和用途）
 */

// 1. 导入依赖
import { useState, useEffect, useMemo } from "react";
import { useI18n } from "../hooks/useI18n";
import type { ComponentProps } from "../types";

// 2. 导入子组件
import { Button } from "../components/ui/button";
import GlassCard from "./GlassCard";

// 3. 定义常量
const DEFAULT_VALUE = 0;
const MAX_ITEMS = 100;

// 4. 组件定义
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
  onAction?: (value: string) => void;
}

export default function ComponentName({ 
  requiredProp, 
  optionalProp = DEFAULT_VALUE,
  onAction 
}: ComponentProps) {
  // 5. Hooks
  const { t } = useI18n();
  const [state, setState] = useState<string>("");

  // 6. 计算属性
  const computedValue = useMemo(() => {
    return state.length;
  }, [state]);

  // 7. 事件处理
  const handleClick = () => {
    onAction?.(state);
  };

  // 8. 渲染
  return (
    <GlassCard>
      <h2>{requiredProp}</h2>
      <Button onClick={handleClick}>
        {t("common.confirm")}
      </Button>
    </GlassCard>
  );
}
```

### 组件命名规范

- **文件名**：使用 PascalCase，如 `Dashboard.tsx`
- **组件名**：与文件名一致，使用 PascalCase
- **导出方式**：默认导出主要组件

```typescript
// ✅ 正确
export default function Dashboard() { }

// ❌ 错误
export default function dashboard() { }
export const Dashboard = () => { }
```

### Props 定义规范

```typescript
// ✅ 正确：使用 interface 定义 props
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
  callbackProp?: (value: string) => void;
  objectProp?: {
    id: string;
    name: string;
  };
  arrayProp?: string[];
}

export default function Component({ 
  requiredProp, 
  optionalProp = 0,
  callbackProp,
  objectProp,
  arrayProp = []
}: ComponentProps) {
  // ...
}

// ❌ 错误：使用 type 定义 props（简单类型可以使用）
type ComponentProps = {
  requiredProp: string;
  optionalProp?: number;
};
```

### 组件导入顺序

```typescript
// 1. React 和第三方库
import { useState, useEffect } from "react";
import { motion } from "motion";

// 2. UI 组件库
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";

// 3. 项目内部组件
import GlassCard from "./GlassCard";
import NodeDetailModal from "./NodeDetailModal";

// 4. Hooks
import { useI18n } from "../hooks/useI18n";
import { useWebSocketData } from "../hooks/useWebSocketData";

// 5. 类型定义
import type { NodeData, AppUser } from "../types";

// 6. 工具函数
import { cn } from "../components/ui/utils";
```

---

## Hooks 使用规范

### 自定义 Hooks

```typescript
/**
 * useCustomHook.ts
 * =================
 * Hook 描述（简短说明 Hook 的功能和用途）
 */

import { useState, useEffect, useCallback } from "react";
import type { CustomHookReturn } from "../types";

export function useCustomHook(initialValue: string): CustomHookReturn {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  useEffect(() => {
    // 副作用逻辑
  }, [value]);

  return {
    value,
    loading,
    updateValue,
  };
}
```

### Hooks 使用规则

```typescript
// ✅ 正确：Hooks 在顶层调用
export default function Component() {
  const [state, setState] = useState("");
  const { t } = useI18n();
  
  useEffect(() => {
    // 副作用
  }, [state]);

  return <div>{state}</div>;
}

// ❌ 错误：在条件语句中使用 Hooks
export default function Component() {
  if (condition) {
    const [state, setState] = useState(""); // 错误
  }
  
  return <div></div>;
}

// ❌ 错误：在循环中使用 Hooks
export default function Component() {
  items.forEach(item => {
    const [state, setState] = useState(""); // 错误
  });
  
  return <div></div>;
}
```

### useEffect 使用规范

```typescript
// ✅ 正确：清理函数
useEffect(() => {
  const subscription = subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, [dependency]);

// ✅ 正确：依赖数组
useEffect(() => {
  fetchData();
}, [userId, page]); // 明确的依赖

// ❌ 错误：缺少依赖
useEffect(() => {
  fetchData();
}, []); // 如果使用了 userId，应该包含在依赖数组中

// ❌ 错误：过度依赖
useEffect(() => {
  fetchData();
}, [userId, page, state1, state2, state3]); // 只依赖真正需要的值
```

### useMemo 使用规范

```typescript
// ✅ 正确：计算密集型操作
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.value - b.value);
}, [items]);

// ✅ 正确：避免对象引用变化
const memoizedStyle = useMemo(() => ({
  color: theme.primary,
  fontSize: 16,
}), [theme.primary]);

// ❌ 错误：简单计算不需要 useMemo
const doubled = useMemo(() => value * 2, [value]); // 简单计算不需要
```

### useCallback 使用规范

```typescript
// ✅ 正确：传递给子组件的回调
const handleClick = useCallback(() => {
  onAction(value);
}, [value, onAction]);

// ✅ 正确：作为依赖项的回调
useEffect(() => {
  const cleanup = setup(handleClick);
  return cleanup;
}, [handleClick]);

// ❌ 错误：不传递给子组件的回调
const handleClick = useCallback(() => {
  console.log("clicked");
}, []); // 不需要 useCallback
```

---

## 状态管理

### 本地状态

```typescript
// ✅ 正确：使用 useState 管理本地状态
export default function Component() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  
  return <div>{/* ... */}</div>;
}
```

### 全局状态

```typescript
// ✅ 正确：使用 Context 管理全局状态
import { createContext, useContext, useState } from "react";

interface AppContextType {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  
  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
```

### 表单状态

```typescript
// ✅ 正确：使用受控组件
export default function Form() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <form>
      <input
        type="text"
        value={formData.username}
        onChange={handleChange("username")}
      />
      <input
        type="email"
        value={formData.email}
        onChange={handleChange("email")}
      />
    </form>
  );
}
```

---

## 性能优化

### React.memo 使用

```typescript
// ✅ 正确：使用 memo 避免不必要的重渲染
export const ExpensiveComponent = React.memo(function ExpensiveComponent({ 
  data, 
  onUpdate 
}: ExpensiveComponentProps) {
  // 复杂的渲染逻辑
  return <div>{/* ... */}</div>;
});

// ✅ 正确：自定义比较函数
export const CustomMemoComponent = React.memo(
  function CustomMemoComponent({ data, onUpdate }: Props) {
    return <div>{/* ... */}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### 代码分割

```typescript
// ✅ 正确：使用 React.lazy 进行代码分割
const LazyComponent = React.lazy(() => import("./LazyComponent"));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 虚拟列表

```typescript
// ✅ 正确：对于长列表使用虚拟滚动
import { FixedSizeList } from "react-window";

export default function VirtualList({ items }: { items: Item[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

---

## 样式规范

### TailwindCSS 使用

```typescript
// ✅ 正确：使用 TailwindCSS 工具类
export default function Component() {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-2">Title</h2>
      <p className="text-sm opacity-80">Description</p>
    </div>
  );
}

// ✅ 正确：使用 cn 工具函数合并类名
import { cn } from "../components/ui/utils";

export default function Component({ className }: { className?: string }) {
  return (
    <div className={cn(
      "p-4 bg-blue-500 text-white",
      className
    )}>
      Content
    </div>
  );
}
```

### 响应式设计

```typescript
// ✅ 正确：使用 TailwindCSS 响应式前缀
export default function Component() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="col-span-1 md:col-span-2">Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </div>
  );
}
```

### 动画效果

```typescript
// ✅ 正确：使用 Motion 库添加动画
import { motion } from "motion";

export default function Component() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      Animated content
    </motion.div>
  );
}
```

---

## 类型定义

### 类型导入

```typescript
// ✅ 正确：从 types/index.ts 导入类型
import type { NodeData, AppUser, WebSocketDataState } from "../types";

// ❌ 错误：在组件文件中定义类型（简单类型除外）
interface LocalType {
  id: string;
  name: string;
}
```

### 类型定义位置

```typescript
// ✅ 正确：复杂类型定义在 types/index.ts
// types/index.ts
export interface NodeData {
  id: string;
  name: string;
  status: "online" | "offline" | "error";
  metrics: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export type AppRole = "admin" | "developer" | "viewer";

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: AppRole;
}
```

### 泛型使用

```typescript
// ✅ 正确：使用泛型提高类型复用
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  return response.json();
}

// 使用
const result = await fetchData<NodeData>("/api/nodes");
```

---

## 错误处理

### 错误边界

```typescript
// ✅ 正确：使用错误边界捕获组件错误
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### 异步错误处理

```typescript
// ✅ 正确：使用 try-catch 处理异步错误
export default function Component() {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetch("/api/data");
      // 处理数据
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <ErrorMessage error={error} />}
      {loading && <LoadingSpinner />}
    </div>
  );
}
```

---

## 测试规范

### 组件测试

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

// Mock 外部依赖
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "zh-CN",
    setLocale: vi.fn(),
  }),
}));

describe("ComponentName", () => {
  beforeEach(() => {
    // 设置测试环境
  });

  afterEach(() => {
    cleanup();
  });

  it("should render correctly", () => {
    render(<ComponentName />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("should handle user interaction", () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Hook 测试

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCustomHook } from "./useCustomHook";

describe("useCustomHook", () => {
  it("should initialize with default value", () => {
    const { result } = renderHook(() => useCustomHook("default"));
    
    expect(result.current.value).toBe("default");
  });

  it("should update value", () => {
    const { result } = renderHook(() => useCustomHook("initial"));
    
    act(() => {
      result.current.updateValue("new value");
    });
    
    expect(result.current.value).toBe("new value");
  });
});
```

---

## 代码示例

### 完整组件示例

```typescript
/**
 * NodeCard.tsx
 * ============
 * 节点卡片组件，显示节点状态和指标
 */

import { useState, useMemo } from "react";
import { Activity, Server, Cpu, HardDrive } from "lucide-react";
import { useI18n } from "../hooks/useI18n";
import type { NodeData } from "../types";
import GlassCard from "./GlassCard";

interface NodeCardProps {
  node: NodeData;
  onClick?: () => void;
}

export default function NodeCard({ node, onClick }: NodeCardProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const statusColor = useMemo(() => {
    switch (node.status) {
      case "online":
        return "text-green-400";
      case "offline":
        return "text-gray-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  }, [node.status]);

  return (
    <GlassCard
      className={`p-4 cursor-pointer transition-all duration-300 ${
        isHovered ? "scale-105 shadow-lg" : ""
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{node.name}</h3>
        <Activity className={statusColor} size={20} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center text-gray-300">
          <Cpu size={16} className="mr-2" />
          <span>{node.metrics.cpu}%</span>
        </div>
        <div className="flex items-center text-gray-300">
          <HardDrive size={16} className="mr-2" />
          <span>{node.metrics.memory}%</span>
        </div>
        <div className="flex items-center text-gray-300">
          <Server size={16} className="mr-2" />
          <span>{node.metrics.network} Mbps</span>
        </div>
        <div className="flex items-center text-gray-300">
          <span className={statusColor}>
            {t(`node.status.${node.status}`)}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
```

---

## 相关文档

- [TypeScript 编码规范](002-CP-IM-开发实施阶段-TypeScript编码规范.md)
- [组件开发规范](004-CP-IM-开发实施阶段-组件开发规范.md)
- [状态管理规范](005-CP-IM-开发实施阶段-状态管理规范.md)
- [前端性能优化指南](006-CP-IM-开发实施阶段-前端性能优化指南.md)

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
