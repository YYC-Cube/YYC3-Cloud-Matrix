---
file: admin-unit-tests.md
description: YYC³ Admin 管理模块 · 18 组件单元测试（权限校验 · 数据渲染 · 操作交互 · 敏感操作加密）
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [test, admin, unit]
category: technical
language: zh-CN
audience: developers
complexity: intermediate
---

# Admin 管理模块 · 单元测试用例

> 覆盖 Admin 层 **18 个管理组件**，重点验证：RBAC 权限校验 / 表格数据正确渲染 / 敏感操作二次确认 + AES 加密 / 审计日志全量记录。

---

## 一、测试目标

| 维度 | 目标值 |
|:-----|:------|
| 组件覆盖 | 18/18 = 100% |
| 权限覆盖 | 每个组件 ≥ 2 种 role 场景 (admin / viewer) |
| 语句覆盖 | ≥ 88% |
| 加密断言 | API Key / 密码脱敏 → 必测 |

---

## 二、核心测试清单（18 组件）

### 2.1 `OperationAudit` · 操作审计面板

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | viewer 角色下"导出/删除"按钮 `disabled` 或隐藏；admin 全部可见 |
| **数据渲染** | 表格列：时间 / 用户 / 模块 / 动作 / 结果 / IP；分页器当前页 = 1 |
| **操作交互** | 筛选（时间段、模块）触发 query 变化；点击详情弹出 Modal；导出 CSV 触发 Blob |

**现有测试：** `src/app/__tests__/OperationAudit.test.tsx`

```typescript
describe("OperationAudit · 权限校验", () => {
  it("viewer 角色看不到删除按钮", () => {
    renderWithRole(<OperationAudit />, "viewer");
    expect(screen.queryByTestId("yyc3-admin-audit-delete-selected")).not.toBeInTheDocument();
  });
  it("admin 角色可看到所有操作按钮", () => {
    renderWithRole(<OperationAudit />, "admin");
    expect(screen.getByTestId("yyc3-admin-audit-export-csv")).toBeInTheDocument();
  });
});
```

---

### 2.2 `UserManagement` · 用户管理（CRUD + 角色）

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 非 admin 禁止访问（重定向 / 403）；admin 可创建新用户 |
| **数据渲染** | 表格 6+ 列（头像/用户名/邮箱/角色/状态/操作）；状态 Badge 颜色 |
| **操作交互** | 新增用户 → 密码字段 type=password；编辑角色 Dialog；删除二次 ConfirmDialog |

**现有测试：** `src/app/__tests__/UserManagement.test.tsx`

---

### 2.3 `SystemSettings` · 系统设置总页

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 普通用户仅"个人偏好"tab 可编辑；系统级 tab 只读或隐藏 |
| **数据渲染** | 9 大 Tab：基础/账户/AI/开发/数据/性能/安全/集成/日志 |
| **操作交互** | Tab 切换保留状态；save 按钮 disabled 直到 form dirty |

**现有测试：** `src/app/__tests__/SystemSettings.test.tsx`

---

### 2.4 `UnifiedSettingsPanel` · 统设置面板容器

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 按 section 级别配置权限（system/ai/user）；无权 section 显示锁图标 |
| **数据渲染** | 左侧 section 导航 + 右侧内容；面包屑显示层级 |
| **操作交互** | 嵌套表单提交聚合 payload；搜索配置项过滤 |

**现有测试：** `src/app/__tests__/UnifiedSettingsPanel.test.tsx`

---

### 2.5 `SecurityMonitor` · 安全监控看板

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 仅 security-admin 可见"IP 封禁"控件；其他角色只读 |
| **数据渲染** | 5 指标卡：登录失败/异常请求/HTTPS 覆盖/会话数/封禁 IP；趋势图 |
| **操作交互** | 封禁 IP → 输入框校验 + 二次确认；解封操作写入审计 |

**现有测试：** `src/app/__tests__/SecurityMonitor.test.tsx` + `hooks/useSecurityMonitor.test.tsx`

---

### 2.6 `PWAStatusPanel` · PWA 状态面板

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 所有登录用户可见，无特殊限制 |
| **数据渲染** | SW 版本 / 缓存大小 / 离线支持 / 上次更新时间；Badge=installed/not-installed |
| **操作交互** | "检查更新"→ onCheckUpdate() 调用；"清除缓存"→ Confirmation |

**现有测试：** `src/app/__tests__/PWAStatusPanel.test.tsx`

---

### 2.7 `PWAInstallPrompt` · PWA 安装提示横幅

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 未安装环境显示；已安装自动隐藏 |
| **数据渲染** | 标题 / 描述 / 安装 / 稍后 按钮；App Logo |
| **操作交互** | 点击安装 → beforeinstallprompt.prompt() mock 被调用；稍后 → banner 消失 7d |

**现有测试：** `src/app/__tests__/PWAInstallPrompt.test.tsx`

---

### 2.8 `DataEditorPanel` · 数据编辑器面板

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | data-editor 角色可写；data-viewer 只读（输入框 disabled） |
| **数据渲染** | 左侧表列表 + 右侧列编辑器；主键列锁定 |
| **操作交互** | 新增行 → 必填校验；删除行 → 二次确认；保存 → 事务日志 |

**现有测试：** `src/app/__tests__/DataEditorPanel.test.tsx`

---

### 2.9 `InlineEditableTable` · 行内可编辑表格

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 可编辑列依据 `canEdit(row, col)`；返回 false → 单元格只读 |
| **数据渲染** | 20 行分页；列宽拖拽；排序指示器 |
| **操作交互** | 双击单元格进入编辑态；Esc 取消 / Enter 保存；校验失败 inline error |

**现有测试：** `src/app/__tests__/InlineEditableTable.test.tsx`

```typescript
describe("InlineEditableTable · 操作交互", () => {
  it("双击进入编辑，Enter 保存回调", async () => {
    const onSave = vi.fn();
    render(<InlineEditableTable data={rows} columns={cols} onCellSave={onSave} />);
    const cell = screen.getByTestId("yyc3-admin-iet-cell-0-name");
    fireEvent.doubleClick(cell);
    const input = within(cell).getByRole("textbox");
    fireEvent.change(input, { target: { value: "NewName" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(0, "name", "NewName"));
  });
});
```

---

### 2.10 `PerformanceMonitor` · 性能监控器

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 运维/管理员可见详细指标；普通用户仅见基础 |
| **数据渲染** | CPU / Memory / GPU / Disk / Net 6 个仪表；实时刷新时间戳 |
| **操作交互** | 暂停/继续按钮；阈值设置 Modal；导出性能快照 JSON |

**现有测试：** `src/app/__tests__/PerformanceMonitor.test.tsx`

---

### 2.11 `EnvConfigEditor` · 环境变量编辑器

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 仅 super-admin 可保存；其他角色只能查看（**值掩码 `***`**） |
| **数据渲染** | K/V 列表；敏感 key 类型 password 显示 ***；分组 `.env` / `.env.local` |
| **操作交互** | 新增变量 → key 正则校验（A-Z0-9_）；保存 → AES 加密后 POST |

**现有测试：** `src/app/__tests__/EnvConfigEditor.test.tsx`

---

### 2.12 `StorageManager` · 存储管理器（Hook + UI）

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | storage-admin 可清缓存；普通用户仅查看用量 |
| **数据渲染** | IndexedDB / LocalStorage / CacheStorage 三栏；容量进度条 |
| **操作交互** | 按 store 清数据 → ConfirmDialog；导出 DB 为 JSON |

**现有测试：** `src/app/__tests__/storageManager.test.ts`

---

### 2.13 `StorageConfigPanel` · 存储配置面板

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 管理员可编辑存储策略；普通用户只读 |
| **数据渲染** | 策略列表（LRU/TTL/Quota）；当前生效策略高亮 |
| **操作交互** | 新建策略 → Schema 校验；切换默认策略 → 广播所有 tab |

**现有测试：** `src/app/__tests__/StorageConfigPanel.test.tsx`

---

### 2.14 `StorageSyncStatus` · 存储同步状态

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 所有用户可见自己的同步状态 |
| **数据渲染** | 队列 / 已同步 / 失败 三列；冲突项 badge |
| **操作交互** | 手动同步按钮；冲突解决 Modal（ours/theirs/merge） |

**现有测试：** `src/app/__tests__/StorageSyncStatus.test.tsx`

---

### 2.15 `ConfigCenter` · 配置中心（YAML/JSON）

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | config-admin 可发布草稿；其他角色仅查看已发布 |
| **数据渲染** | 版本历史列表；当前版本 diff 高亮；YAML/JSON 切换 |
| **操作交互** | 发布 → 二次输入密码；回滚到历史版本；JSON Schema 校验错误显示 |

**现有测试：** `src/app/__tests__/ConfigCenter.test.tsx`

---

### 2.16 `VariableCenter` · 全局变量中心

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | 变量级别 public/internal/secret；secret 仅 super-admin 查看明文 |
| **数据渲染** | 变量表格：Key / 类型 / 作用域 / 更新时间；secret 值 = `••••••••` |
| **操作交互** | 创建 secret → AES 加密写入；复制按钮 → 写入 clipboard（测试 mock） |

**现有测试：** `src/app/__tests__/VariableCenter.test.tsx`

---

### 2.17 `PageConfigEditor` · 页面配置编辑器

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | page-editor 角色可拖拽布局；viewer 只读预览 |
| **数据渲染** | 左侧组件库 / 中间画布 / 右侧属性面板；画布网格 |
| **操作交互** | 拖放组件到画布 → `onDrop` 被调用；属性编辑实时双向绑定；保存 JSON |

**现有测试：** `src/app/__tests__/PageConfigEditor.test.tsx` + `hooks/usePageConfig.test.tsx`

---

### 2.18 `NetworkConfig` · 网络配置（代理/WSS/超时）

| 套件 | 关键断言 |
|:-----|:--------|
| **权限校验** | network-admin 可编辑代理；普通用户仅看连接状态 |
| **数据渲染** | 代理主机/端口/认证；WebSocket URL；超时滑块 5-120s |
| **操作交互** | 连通性测试按钮 → mock fetch；保存写 cookie；代理密码脱敏保存 |

**现有测试：** `src/app/__tests__/NetworkConfig.test.tsx`

---

## 三、权限 + 敏感操作加密测试模板（以 VariableCenter 创建 secret 为例）

```typescript
// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VariableCenter from "../../modules/admin/components/VariableCenter";
import { encryptAES } from "../../lib/crypto-vault";

vi.mock("../../lib/crypto-vault", () => ({
  encryptAES: vi.fn((v) => `ENC(${v})`),
  decryptAES: vi.fn(),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch.mockResolvedValue({ ok: true, json: () => ({ id: 42 }) });

const mockRole = { role: "super-admin" };
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockRole,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("VariableCenter · 敏感操作加密", () => {
  it("创建 secret 变量时必须走 AES 加密再提交", async () => {
    render(<VariableCenter />);
    fireEvent.click(screen.getByTestId("yyc3-admin-var-add-btn"));

    fireEvent.change(screen.getByTestId("yyc3-admin-var-key"), {
      target: { value: "OPENAI_API_KEY" },
    });
    fireEvent.change(screen.getByTestId("yyc3-admin-var-scope"), {
      target: { value: "secret" },
    });
    fireEvent.change(screen.getByTestId("yyc3-admin-var-value"), {
      target: { value: "sk-real-secret-123" },
    });

    fireEvent.click(screen.getByTestId("yyc3-admin-var-save"));

    await waitFor(() => {
      expect(encryptAES).toHaveBeenCalledWith("sk-real-secret-123");
      const [req] = mockFetch.mock.calls;
      const body = JSON.parse(req[1].body);
      expect(body.value).toBe("ENC(sk-real-secret-123)");
      expect(body.value).not.toContain("real-secret");
    });
  });

  it("非 super-admin 查看 secret 列表只显示脱敏掩码", () => {
    mockRole.role = "viewer";
    render(<VariableCenter initialVars={[{ key: "DB_PASS", scope: "secret", value: "xx" }]} />);
    const cell = screen.getByTestId("yyc3-admin-var-cell-0-value");
    expect(cell).toHaveTextContent(/^[•••]+$/);
    expect(cell).not.toHaveTextContent("xx");
  });
});
```

---

## 四、现有测试文件清单（Admin 模块 18 组件）

| # | 组件名 | 测试文件路径 | Store/Hook 辅助 |
|:-:|:------|:------------|:---------------|
| 1 | OperationAudit | `src/app/__tests__/OperationAudit.test.tsx` | — |
| 2 | UserManagement | `src/app/__tests__/UserManagement.test.tsx` | `store/user-mgmt-slice.test.ts` |
| 3 | SystemSettings | `src/app/__tests__/SystemSettings.test.tsx` | `useSettingsStore.test.tsx` |
| 4 | UnifiedSettingsPanel | `src/app/__tests__/UnifiedSettingsPanel.test.tsx` | `settings-model-unified-dataflow.test.ts` |
| 5 | SecurityMonitor | `src/app/__tests__/SecurityMonitor.test.tsx` | `useSecurityMonitor.test.tsx` |
| 6 | PWAStatusPanel | `src/app/__tests__/PWAStatusPanel.test.tsx` | `usePWAManager.test.tsx` |
| 7 | PWAInstallPrompt | `src/app/__tests__/PWAInstallPrompt.test.tsx` | `useInstallPrompt.test.ts` |
| 8 | DataEditorPanel | `src/app/__tests__/DataEditorPanel.test.tsx` | `hooks/useDbData.test.ts` |
| 9 | InlineEditableTable | `src/app/__tests__/InlineEditableTable.test.tsx` | — |
| 10 | PerformanceMonitor | `src/app/__tests__/PerformanceMonitor.test.tsx` | `usePerformanceMonitor.test.ts` |
| 11 | EnvConfigEditor | `src/app/__tests__/EnvConfigEditor.test.tsx` | `lib/crypto-vault.test.ts` |
| 12 | StorageManager | `src/app/__tests__/storageManager.test.ts` | `yyc3-storage.test.ts` |
| 13 | StorageConfigPanel | `src/app/__tests__/StorageConfigPanel.test.tsx` | `storage.test.ts` |
| 14 | StorageSyncStatus | `src/app/__tests__/StorageSyncStatus.test.tsx` | `state-sync-manager.test.ts` |
| 15 | ConfigCenter | `src/app/__tests__/ConfigCenter.test.tsx` | `config-validator.test.ts` |
| 16 | VariableCenter | `src/app/__tests__/VariableCenter.test.tsx` | `lib/crypto-vault.test.ts` |
| 17 | PageConfigEditor | `src/app/__tests__/PageConfigEditor.test.tsx` | `hooks/usePageConfig.test.tsx` |
| 18 | NetworkConfig | `src/app/__tests__/NetworkConfig.test.tsx` | `useNetworkConfig.test.ts` |

### Admin 关联 Store 测试
```
src/app/__tests__/store/
├── app-slice.test.ts
├── user-mgmt-slice.test.ts
├── network-slice.test.ts
├── metrics-slice.test.ts
└── log-slice.test.ts
```

---
**言启千行代码，语枢万物智能**
**言启象限，语枢未来 | Words Initiate Quadrants, Language Serves as Core for Future**
**万象归元于云枢，深栈智启新纪元 | All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**
**YanYuCloudCube · YYC³ 言语云枢科技**
**YYC³ CloudPivot Intelli-Matrix v3.4.1 · Admin Module Test Suite**
**© 2026 YanYuCloudCube Team · MIT License**
