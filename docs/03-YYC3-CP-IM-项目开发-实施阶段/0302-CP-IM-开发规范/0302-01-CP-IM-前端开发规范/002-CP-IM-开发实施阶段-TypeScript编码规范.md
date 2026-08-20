---
@file: 002-CP-IM-开发实施阶段-TypeScript编码规范.md
@description: YYC³-CP-IM TypeScript 编码规范与标准
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-26
@updated: 2026-03-05
@status: published
@tags: [开发规范],[TypeScript],[编码规范]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元***
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ CloudPivot Intelli-Matrix - TypeScript 编码规范

本文档定义 YYC³ CloudPivot Intelli-Matrix 项目的 TypeScript 编码规范和最佳实践，确保类型安全、代码质量和团队协作效率。

---

## 目录

- [核心原则](#核心原则)
- [类型定义规范](#类型定义规范)
- [接口与类型](#接口与类型)
- [泛型使用](#泛型使用)
- [类型推断](#类型推断)
- [类型守卫](#类型守卫)
- [工具类型](#工具类型)
- [配置规范](#配置规范)
- [最佳实践](#最佳实践)
- [常见错误](#常见错误)

---

## 核心原则

### 1. 严格模式

项目使用 TypeScript 严格模式，确保类型安全：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 2. 类型优先

- **明确类型**：所有函数参数、返回值必须有明确类型
- **避免 any**：禁止使用 `any` 类型
- **类型复用**：优先使用已有的类型定义

### 3. 类型集中管理

- **统一位置**：所有类型定义在 `src/app/types/index.ts`
- **全局引用**：组件、Hooks、工具函数从统一位置导入类型
- **命名规范**：遵循 camelCase（前端）/ snake_case（DB）双标准

---

## 类型定义规范

### 类型定义位置

```typescript
// ✅ 正确：在 types/index.ts 中定义类型
// src/app/types/index.ts

export interface NodeData {
  id: string;
  status: NodeStatusType;
  gpu: number;
  mem: number;
  temp: number;
  model: string;
  tasks: number;
}

// ❌ 错误：在组件文件中定义复杂类型
// src/app/components/NodeCard.tsx
interface NodeData {
  id: string;
  status: NodeStatusType;
  // ...
}
```

### 类型命名规范

```typescript
// ✅ 正确：接口使用 PascalCase
export interface NodeData { }
export interface AppUser { }
export interface WebSocketDataState { }

// ✅ 正确：类型别名使用 PascalCase
export type UserRole = "admin" | "developer";
export type NodeStatusType = "active" | "warning" | "inactive";

// ✅ 正确：枚举使用 PascalCase
export enum LogLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error"
}

// ❌ 错误：使用小写命名
export interface nodeData { }
export type userRole = "admin" | "developer";
```

### 字段命名规范

```typescript
// ✅ 正确：前端类型使用 camelCase
export interface NodeData {
  id: string;
  status: NodeStatusType;
  gpuUtil: number;
  memUtil: number;
  tempCelsius: number;
  modelDeployed: string;
  activeTasks: number;
}

// ✅ 正确：数据库类型使用 snake_case
export interface NodeStatusRecord {
  id: string;
  hostname: string;
  gpu_util: number;
  mem_util: number;
  temp_celsius: number;
  model_deployed: string;
  active_tasks: number;
}

// ✅ 正确：提供转换函数
export function toNodeData(record: NodeStatusRecord): NodeData {
  return {
    id: record.hostname,
    status: record.status,
    gpuUtil: record.gpu_util,
    memUtil: record.mem_util,
    tempCelsius: record.temp_celsius,
    modelDeployed: record.model_deployed,
    activeTasks: record.active_tasks,
  };
}
```

---

## 接口与类型

### 接口定义

```typescript
// ✅ 正确：使用 interface 定义对象类型
export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

// ✅ 正确：接口继承
export interface AdminUser extends AppUser {
  permissions: string[];
  department: string;
}

// ✅ 正确：可选属性
export interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
  callbackProp?: (value: string) => void;
}

// ✅ 正确：只读属性
export interface ImmutableConfig {
  readonly version: string;
  readonly buildDate: Date;
}
```

### 类型别名

```typescript
// ✅ 正确：使用 type 定义联合类型
export type UserRole = "admin" | "developer" | "viewer";

// ✅ 正确：使用 type 定义函数类型
export type EventHandler = (event: Event) => void;
export type AsyncCallback = (data: any) => Promise<void>;

// ✅ 正确：使用 type 定义复杂类型
export type NodeDataMap = Record<string, NodeData>;
export type UserList = AppUser[];
export type ConfigValue = string | number | boolean | null;
```

### 接口 vs 类型

```typescript
// ✅ 正确：使用 interface 定义对象结构
export interface NodeData {
  id: string;
  status: NodeStatusType;
  metrics: NodeMetrics;
}

// ✅ 正确：使用 type 定义联合类型、交叉类型
export type NodeStatusType = "active" | "warning" | "inactive";
export type NodeWithUser = NodeData & { user: AppUser };

// ✅ 正确：简单类型可以使用 type
export type ID = string;
export type Timestamp = number;
```

---

## 泛型使用

### 泛型函数

```typescript
// ✅ 正确：使用泛型提高函数复用性
export function fetchData<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json());
}

// ✅ 正确：泛型约束
export function processNode<T extends NodeData>(node: T): T {
  // 处理逻辑
  return node;
}

// ✅ 正确：多个泛型参数
export function merge<K, V>(obj1: Record<K, V>, obj2: Record<K, V>): Record<K, V> {
  return { ...obj1, ...obj2 };
}
```

### 泛型接口

```typescript
// ✅ 正确：泛型接口
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: number;
}

// 使用示例
const userResponse: ApiResponse<AppUser> = {
  data: { id: "1", email: "user@example.com", role: "admin", name: "Admin" },
  success: true,
  message: "Success",
  timestamp: Date.now()
};

const nodeResponse: ApiResponse<NodeData[]> = {
  data: [
    { id: "1", status: "active", gpu: 80, mem: 70, temp: 65, model: "LLaMA", tasks: 5 }
  ],
  success: true,
  message: "Success",
  timestamp: Date.now()
};
```

### 泛型组件

```typescript
// ✅ 正确：泛型组件
export interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function GenericList<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// 使用示例
<GenericList<NodeData>
  items={nodes}
  renderItem={(node) => <NodeCard node={node} />}
  keyExtractor={(node) => node.id}
/>
```

---

## 类型推断

### 自动推断

```typescript
// ✅ 正确：利用类型推断
const user = {
  id: "1",
  email: "user@example.com",
  role: "admin" as UserRole,
  name: "Admin"
};
// TypeScript 自动推断为 { id: string, email: string, role: UserRole, name: string }

// ✅ 正确：数组类型推断
const nodes = [
  { id: "1", status: "active" as NodeStatusType, gpu: 80 },
  { id: "2", status: "warning" as NodeStatusType, gpu: 90 }
];
// TypeScript 自动推断为 { id: string, status: NodeStatusType, gpu: number }[]
```

### 显式类型

```typescript
// ✅ 正确：复杂类型使用显式类型
const nodeMap: Record<string, NodeData> = {
  "node-1": { id: "node-1", status: "active", gpu: 80, mem: 70, temp: 65, model: "LLaMA", tasks: 5 },
  "node-2": { id: "node-2", status: "warning", gpu: 90, mem: 80, temp: 70, model: "Qwen", tasks: 3 }
};

// ✅ 正确：函数返回值使用显式类型
export function transformNode(record: NodeStatusRecord): NodeData {
  return {
    id: record.hostname,
    status: record.status,
    gpu: record.gpu_util,
    mem: record.mem_util,
    temp: record.temp_celsius,
    model: record.model_deployed,
    tasks: record.active_tasks
  };
}
```

---

## 类型守卫

### typeof 类型守卫

```typescript
// ✅ 正确：使用 typeof 进行类型守卫
function processValue(value: string | number) {
  if (typeof value === "string") {
    // value 在这里是 string
    return value.toUpperCase();
  } else {
    // value 在这里是 number
    return value.toFixed(2);
  }
}
```

### instanceof 类型守卫

```typescript
// ✅ 正确：使用 instanceof 进行类型守卫
function handleError(error: unknown) {
  if (error instanceof Error) {
    // error 在这里是 Error
    console.error(error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

### 自定义类型守卫

```typescript
// ✅ 正确：自定义类型守卫
export function isNodeData(obj: any): obj is NodeData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.status === "string" &&
    typeof obj.gpu === "number" &&
    typeof obj.mem === "number"
  );
}

export function isAppUser(obj: any): obj is AppUser {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.email === "string" &&
    typeof obj.role === "string" &&
    typeof obj.name === "string"
  );
}

// 使用示例
function processData(data: unknown) {
  if (isNodeData(data)) {
    // data 在这里是 NodeData
    console.log(`Node ${data.id} is ${data.status}`);
  }
}
```

### in 操作符类型守卫

```typescript
// ✅ 正确：使用 in 操作符进行类型守卫
interface Dog {
  kind: "dog";
  bark: () => void;
}

interface Cat {
  kind: "cat";
  meow: () => void;
}

type Animal = Dog | Cat;

function makeSound(animal: Animal) {
  if ("bark" in animal) {
    // animal 在这里是 Dog
    animal.bark();
  } else {
    // animal 在这里是 Cat
    animal.meow();
  }
}
```

---

## 工具类型

### Partial

```typescript
// ✅ 正确：使用 Partial 创建可选属性类型
export interface NodeData {
  id: string;
  status: NodeStatusType;
  gpu: number;
  mem: number;
  temp: number;
  model: string;
  tasks: number;
}

type PartialNodeData = Partial<NodeData>;
// { id?: string, status?: NodeStatusType, gpu?: number, ... }

// 使用示例
function updateNode(id: string, updates: Partial<NodeData>) {
  // 更新节点的部分属性
}
```

### Required

```typescript
// ✅ 正确：使用 Required 创建必需属性类型
export interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
}

type RequiredProps = Required<ComponentProps>;
// { requiredProp: string, optionalProp: number }
```

### Readonly

```typescript
// ✅ 正确：使用 Readonly 创建只读类型
export interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

type ReadonlyConfig = Readonly<Config>;
// { readonly apiUrl: string, readonly timeout: number, readonly retries: number }

// 使用示例
const config: ReadonlyConfig = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3
};

// config.apiUrl = "new-url"; // 错误：无法赋值到只读属性
```

### Pick

```typescript
// ✅ 正确：使用 Pick 选择部分属性
export interface NodeData {
  id: string;
  status: NodeStatusType;
  gpu: number;
  mem: number;
  temp: number;
  model: string;
  tasks: number;
}

type NodeStatus = Pick<NodeData, "id" | "status" | "gpu" | "mem">;
// { id: string, status: NodeStatusType, gpu: number, mem: number }
```

### Omit

```typescript
// ✅ 正确：使用 Omit 排除部分属性
export interface NodeData {
  id: string;
  status: NodeStatusType;
  gpu: number;
  mem: number;
  temp: number;
  model: string;
  tasks: number;
}

type NodeWithoutMetrics = Omit<NodeData, "gpu" | "mem" | "temp">;
// { id: string, status: NodeStatusType, model: string, tasks: number }
```

### Record

```typescript
// ✅ 正确：使用 Record 创建对象类型
type NodeDataMap = Record<string, NodeData>;
// { [key: string]: NodeData }

type UserRoleMap = Record<UserRole, string[]>;
// { admin: string[], developer: string[], viewer: string[] }

// 使用示例
const nodeMap: NodeDataMap = {
  "node-1": { id: "node-1", status: "active", gpu: 80, mem: 70, temp: 65, model: "LLaMA", tasks: 5 },
  "node-2": { id: "node-2", status: "warning", gpu: 90, mem: 80, temp: 70, model: "Qwen", tasks: 3 }
};
```

---

## 配置规范

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "electron/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "dist-electron"
  ]
}
```

### ESLint TypeScript 规则

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error"
  }
}
```

---

## 最佳实践

### 1. 避免使用 any

```typescript
// ❌ 错误：使用 any
function processData(data: any) {
  return data.value;
}

// ✅ 正确：使用泛型或具体类型
function processData<T extends { value: any }>(data: T): any {
  return data.value;
}

// ✅ 正确：使用 unknown
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: any }).value;
  }
  throw new Error("Invalid data");
}
```

### 2. 使用类型断言谨慎

```typescript
// ❌ 错误：过度使用类型断言
const node = data as NodeData;

// ✅ 正确：使用类型守卫
if (isNodeData(data)) {
  const node = data;
}

// ✅ 正确：使用类型断言（仅在必要时）
const element = document.getElementById("root") as HTMLElement;
```

### 3. 使用可选链和空值合并

```typescript
// ❌ 错误：冗长的空值检查
const value = obj && obj.prop && obj.prop.value ? obj.prop.value : defaultValue;

// ✅ 正确：使用可选链和空值合并
const value = obj?.prop?.value ?? defaultValue;
```

### 4. 使用 readonly 防止意外修改

```typescript
// ✅ 正确：使用 readonly 防止意外修改
export interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

const config: Config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
};

// config.apiUrl = "new-url"; // 编译错误
```

### 5. 使用类型导入

```typescript
// ✅ 正确：使用类型导入减少编译时依赖
import type { NodeData, AppUser } from "../types";
import { useI18n } from "../hooks/useI18n";

// ❌ 错误：混合导入
import { NodeData, AppUser, useI18n } from "../types";
```

---

## 常见错误

### 1. 隐式 any 错误

```typescript
// ❌ 错误：隐式 any
function processData(data) {
  return data.value;
}

// ✅ 正确：显式类型
function processData(data: { value: any }) {
  return data.value;
}
```

### 2. 未使用的变量错误

```typescript
// ❌ 错误：未使用的变量
function processData(data: any) {
  const unused = data.value;
  return data;
}

// ✅ 正确：使用下划线前缀
function processData(data: any) {
  const _unused = data.value;
  return data;
}

// ✅ 正确：删除未使用的变量
function processData(data: any) {
  return data;
}
```

### 3. 类型不匹配错误

```typescript
// ❌ 错误：类型不匹配
const status: NodeStatusType = "online"; // "online" 不是 NodeStatusType

// ✅ 正确：使用正确的类型
const status: NodeStatusType = "active";
```

### 4. 空值检查错误

```typescript
// ❌ 错误：可能的空值
function getValue(obj: { value?: string }) {
  return obj.value.toUpperCase(); // 可能为 undefined
}

// ✅ 正确：空值检查
function getValue(obj: { value?: string }) {
  return obj.value?.toUpperCase() ?? "";
}
```

---

## 相关文档

- [React 开发规范](001-CP-IM-开发实施阶段-React开发规范.md)
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
