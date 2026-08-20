---
file: ops-unit-tests.md
description: YYC³ Ops 运维模块 · 19 组件分 7 域单元测试（操作中心/文件管理/数据库/服务闭环/报告导出/连接监控/日志查看）
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [test, ops, unit]
category: technical
language: zh-CN
audience: developers
complexity: intermediate
---

# Ops 运维模块 · 单元测试用例

> 覆盖运维层 **7 大子域 · 19 组件**，重点验证：文件上传分片 / 数据库连接池 / 服务闭环 5 阶段流水线 / 报告导出多格式 / 连接健康探测。

---

## 一、测试目标

| 维度 | 目标值 |
|:-----|:------|
| 子域覆盖 | 7/7（操作/文件/数据库/服务闭环/报告/连接/日志） |
| 服务闭环 | 5 阶段全部独立 + 串联测试 |
| 语句覆盖 | ≥ 85% |
| 文件上传 | 分片、断点续传、类型校验必测 |

---

## 二、7 子域组件分布

```
Ops Module
├── 🎛️ 1. 操作中心域       (6: OperationCenter/Category/Template/Audit/Chain/LogStream)
├── 📁 2. 文件管理域       (4: FileExplorer/FileBrowser/HostFileManager/LocalFileManager)
├── 🗄️ 3. 数据库域         (2: DatabaseManager/DatabaseConnectionPanel)
├── 🔁 4. 服务闭环域       (3: ServiceLoopPanel/LoopStageCard/StageReview)
├── 📄 5. 报告导出域       (2: ReportGenerator/ReportExporter)
├── 🔗 6. 连接监控域       (1: ConnectionMonitorPanel + ConnectionManager/ServiceConnectionTest)
└── 📜 7. 日志查看域       (1: LogViewer)
```

---

## 三、组件测试用例（19 组件）

### 域 1 · 🎛️ 操作中心

#### 3.1 `OperationCenter` · 主操作中心（大组件）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 三栏：分类侧栏 / 模板列表 / 操作链画布；执行按钮 + 历史抽屉 |
| **数据流** | 操作模板加载 → 分类过滤；选中状态同步 store；执行状态 progress |
| **操作交互** | 拖模板到画布 → 节点；运行 → 5 阶段依次触发；暂停/继续/回滚 |

**现有测试：** `src/app/__tests__/OperationCenter.test.tsx` + `useOperationCenter.test.ts` + `operation-types.test.ts`

```typescript
describe("OperationCenter · 操作交互", () => {
  it("拖入 3 个模板节点 + 点击运行触发 onExecute 串行", async () => {
    const onExecute = vi.fn().mockResolvedValue({ id: "exec-42" });
    render(<OperationCenter onExecute={onExecute} />);
    dragToCanvas(screen.getByTestId("yyc3-ops-tpl-restart-service"));
    dragToCanvas(screen.getByTestId("yyc3-ops-tpl-clear-cache"));
    dragToCanvas(screen.getByTestId("yyc3-ops-tpl-health-check"));
    fireEvent.click(screen.getByTestId("yyc3-ops-center-run"));
    await waitFor(() => expect(onExecute).toHaveBeenCalledTimes(1));
    expect(onExecute.mock.calls[0][0].nodes.length).toBe(3);
  });
});
```

---

#### 3.2 `OperationCategory` · 操作分类侧栏

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 分类树（系统/数据库/应用/网络/安全）；选中高亮 |
| **数据流** | 展开/折叠状态；未分类模板数量 badge |
| **操作交互** | 点击分类 → onCategorySelect(id)；搜索分类名过滤 |

**现有测试：** `src/app/__tests__/OperationCategory.test.tsx`

---

#### 3.3 `OperationTemplate` · 操作模板卡片

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 标题/图标/描述/预计耗时/平均成功率；风险等级色标（L/M/H） |
| **数据流** | 风险 H → 边框红色；成功率 <80% → 黄色警示 |
| **操作交互** | Hover → 展开详情；点击 → 选中模板（drag start） |

**现有测试：** `src/app/__tests__/OperationTemplate.test.tsx`

---

#### 3.4 `OperationAudit` · 操作审计（Ops 域专用）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 执行 ID / 操作链名称 / 发起者 / 开始-结束 / 状态徽章 / 耗时 |
| **数据流** | 状态（pending/running/success/failed/rolledback）→ 5 种颜色 |
| **操作交互** | 点击行 → 展开每阶段耗时瀑布；查看日志 → 跳转 LogViewer 过滤 |

**现有测试：** `src/app/__tests__/OperationAudit.test.tsx`

---

#### 3.5 `OperationChain` · 操作链可视化画布

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | DAG 节点 + 有向连线；起点/终点节点样式特殊 |
| **数据流** | 回环检测 → 禁止连线并提示；并行分支 fork/join 图标 |
| **操作交互** | 节点双击 → 编辑参数；连线拖拽重连；删除节点 → 删除下游连线 |

**现有测试：** `src/app/__tests__/OperationChain.test.tsx`

---

#### 3.6 `OperationLogStream` · 实时操作日志流

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | ANSI 颜色转译；自动滚动到底；时间戳 + 级别（INFO/ERROR）前缀 |
| **数据流** | EventSource 流式消息 → append 到列表；ERROR 级别红色背景 |
| **操作交互** | 暂停自动滚动；复制日志；下载日志段 txt |

**现有测试：** `src/app/__tests__/OperationLogStream.test.tsx`

---

### 域 2 · 📁 文件管理

#### 3.7 `FileExplorer` · 主文件资源管理器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 左侧树（本地/远程/挂载点）+ 右侧文件表（名称/大小/修改者/权限） |
| **数据流** | 双击文件夹 → 进入路径同步 breadcrumb；.zip 显示压缩图标 |
| **操作交互** | 多选文件 → 批量下载/删除；右键菜单；拖放上传 → `onUpload(files)` |

**现有测试：** `src/app/__tests__/FileExplorer.test.tsx`

---

#### 3.8 `FileBrowser` · 简易文件选择对话框

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 选择模式（单/多）；文件类型过滤器下拉；当前路径 |
| **数据流** | 目录变化 → 列表刷新；size 格式化 B/KB/MB |
| **操作交互** | 点击文件 → onSelect(f)；双击目录 → 进入；Esc 关闭 Dialog |

**现有测试：** `src/app/__tests__/FileBrowser.test.tsx`

---

#### 3.9 `HostFileManager` · 宿主（Electron）文件管理

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | Electron 环境下显示原生路径条；非 Electron 降级提示 |
| **数据流** | `window.electron.fs.readdir` mock 返回 → 文件表 |
| **操作交互** | 选择真实文件 → showOpenDialog mock；文件切片上传校验 SHA-256 |

**现有测试：** `src/app/__tests__/HostFileManager.test.tsx` + `useHostFileSystem.test.ts`

---

#### 3.10 `LocalFileManager` · 浏览器本地文件（OPFS）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | OPFS 支持检测；配额使用进度条；根目录列表 |
| **数据流** | navigator.storage.getDirectory() mock → 目录树 |
| **操作交互** | 分片上传（blob.slice）→ 每 5MB 进度更新；并发 3 上传队列 |

**现有测试：** `src/app/__tests__/LocalFileManager.test.tsx` + `useLocalFileSystem.test.tsx`

---

### 域 3 · 🗄️ 数据库

#### 3.11 `DatabaseManager` · 数据库管理器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 连接列表（名称/类型/状态/池大小/延迟）+ SQL 编辑器 + 结果表 |
| **数据流** | 连接状态（connected/disconnected/error）badge；延迟 >500ms 标红 |
| **操作交互** | 新增连接 → 选择类型（pg/mysql/sqlite）；测试连接 → onTest()；执行 SQL → 结果表分页 |

**现有测试：** `src/app/__tests__/DatabaseManager.test.tsx` + `db-queries.test.ts`

---

#### 3.12 `DatabaseConnectionPanel` · 数据库连接配置面板

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 字段：主机/端口/数据库/用户/密码/SSL/连接池 min-max |
| **数据流** | 密码字段 `***` 显示；edit 模式解密回填 |
| **操作交互** | 保存前 → testConnection() 必须通过；失败 → 错误显示在字段下方 |

**现有测试：** `src/app/__tests__/DatabaseConnectionPanel.test.tsx` + `store/db-conn-slice.test.ts` + `DatabaseAdapter.integration.test.ts`

---

### 域 4 · 🔁 服务闭环 5 阶段

#### 3.13 `ServiceLoopPanel` · 服务闭环总控

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 5 阶段流程条：①需求 ②设计 ③执行 ④验证 ⑤归档；当前阶段高亮 |
| **数据流** | `useServiceLoop()` 当前阶段 id → 阶段卡激活；阶段完成数/总数摘要 |
| **操作交互** | 进入下一阶段 → 前置条件校验（必填检查）；回退 → ConfirmDialog |

**现有测试：** `src/app/__tests__/ServiceLoopPanel.test.tsx` + `useServiceLoop.test.tsx`

---

#### 3.14 `LoopStageCard` · 阶段卡片

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 序号（1-5）+ 标题 + 任务列表（checkbox）+ 预计/实际耗时 |
| **数据流** | 全部任务勾选 → 阶段状态 done；部分 → in-progress |
| **操作交互** | 勾选任务 → onTaskToggle(id)；添加备注；上传附件按钮 |

**现有测试：** `src/app/__tests__/LoopStageCard.test.tsx` + `service-loop-types.test.ts`

---

#### 3.15 `StageReview` · 阶段评审面板

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 评审人/评审时间/通过标准 checklist/评审意见富文本/通过打回按钮 |
| **数据流** | 打回 → 阶段状态 revert 到上一步；通过 → 解锁下一阶段 |
| **操作交互** | 打回必须填写理由（必填校验）；通过 → 电子签名输入框 |

**现有测试：** `src/app/__tests__/StageReview.test.tsx`

---

### 域 5 · 📄 报告导出

#### 3.16 `ReportGenerator` · 报告生成器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 报告类型选择（巡检/审计/性能/自定义）；时间范围；章节勾选 |
| **数据流** | 模板列表（10+ 内置）；预览缩略图 |
| **操作交互** | 生成进度条 0→100%；取消生成 → AbortController abort() mock |

**现有测试：** `src/app/__tests__/ReportGenerator.test.tsx`

---

#### 3.17 `ReportExporter` · 多格式报告导出

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 格式按钮组：PDF / Word / Excel / HTML / Markdown / JSON |
| **数据流** | 每种格式走不同 adapter；文件名自动 `report-yyyymmdd-HHMM.ext` |
| **操作交互** | 导出 PDF → jsPDF 调用；导出 XLSX → SheetJS；下载 Blob URL 正确触发 |

**现有测试：** `src/app/__tests__/ReportExporter.test.tsx` + `useReportExporter.test.ts`

---

### 域 6 · 🔗 连接监控

#### 3.18 `ConnectionMonitorPanel` · 连接健康看板

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 连接列表（类型/目标/状态/延迟/重试/最后成功）；总体健康得分 0-100 |
| **数据流** | 每 15s 轮询 ping；失败重连计数；延迟趋势 sparkline |
| **操作交互** | 手动重连选中；批量重连全部；断开测试（仅开发环境） |

**现有测试：** `src/app/__tests__/ConnectionMonitorPanel.test.tsx` + `ConnectionManager.test.ts` + `ServiceConnectionTest.test.tsx` + `lib/network-utils.test.ts`

---

### 域 7 · 📜 日志查看

#### 3.19 `LogViewer` · 日志查看器

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 日志级别过滤器（DEBUG/INFO/WARN/ERROR/FATAL）；关键字搜索高亮；自动滚动 |
| **数据流** | `store/log-slice` 推送 → 增量渲染；ERROR 计数 Badge |
| **操作交互** | 跳转行号；导出选中日志段（txt/json）；清空缓冲区 → Confirm |

**现有测试：** `src/app/__tests__/LogViewer.test.tsx` + `store/log-slice.test.ts`

---

## 四、服务闭环 5 阶段串联测试 + 文件上传分片测试模板

### 4.1 服务闭环串联测试

```typescript
// @vitest-environment jsdom
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ServiceLoopPanel from "../../modules/ops/components/ServiceLoopPanel";
import { useServiceLoop } from "../../hooks/useServiceLoop";

vi.mock("../../hooks/useServiceLoop");

describe("ServiceLoopPanel · 5 阶段闭环", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useServiceLoop as any).mockReturnValue({
      currentStage: 0,
      stages: [
        { id: 1, name: "需求定义", tasks: [{ id: "t1", done: false, text: "撰写需求文档" }] },
        { id: 2, name: "方案设计", tasks: [] },
        { id: 3, name: "执行实施", tasks: [] },
        { id: 4, name: "验证测试", tasks: [] },
        { id: 5, name: "归档结案", tasks: [] },
      ],
      toggleTask: vi.fn(),
      goNext: vi.fn(),
      goPrev: vi.fn(),
    });
  });

  it("需求阶段完成全部任务后才允许进入下一阶段", async () => {
    const { toggleTask, goNext } = useServiceLoop() as any;
    render(<ServiceLoopPanel />);

    const nextBtn = screen.getByTestId("yyc3-ops-loop-next");
    expect(nextBtn).toBeDisabled();

    fireEvent.click(screen.getByTestId("yyc3-ops-stage-0-task-t1"));
    await waitFor(() => expect(toggleTask).toHaveBeenCalledWith("t1"));

    (useServiceLoop as any).mockReturnValueOnce({
      ...useServiceLoop(),
      currentStage: 0,
      stages: [{ ...useServiceLoop().stages[0], tasks: [{ id: "t1", done: true }] }],
    });

    render(<ServiceLoopPanel />);
    expect(screen.getByTestId("yyc3-ops-loop-next")).not.toBeDisabled();
    fireEvent.click(screen.getByTestId("yyc3-ops-loop-next"));
    expect(goNext).toHaveBeenCalled();
  });
});
```

### 4.2 文件分片上传测试

```typescript
import { describe, it, expect, vi } from "vitest";
import { chunkedUpload, createChunkHash } from "../../lib/file-uploader";

describe("LocalFileManager · 分片上传", () => {
  const FILE_16MB = new File(["x".repeat(16 * 1024 * 1024)], "big.bin", { type: "application/octet-stream" });
  const CHUNK = 5 * 1024 * 1024; // 5MB

  it("16MB 文件切分为 4 片，最后一片 1MB", async () => {
    const onProgress = vi.fn();
    const uploadChunk = vi.fn().mockResolvedValue({ ok: true });

    await chunkedUpload(FILE_16MB, { chunkSize: CHUNK, uploadChunk, onProgress });

    expect(uploadChunk).toHaveBeenCalledTimes(4);
    const sizes = uploadChunk.mock.calls.map((c) => c[0].size);
    expect(sizes).toEqual([CHUNK, CHUNK, CHUNK, 1 * 1024 * 1024]);
    expect(onProgress.mock.calls[onProgress.mock.calls.length - 1][0]).toBe(1);
  });

  it("每片 SHA-256 哈希用于断点校验", async () => {
    const hash = await createChunkHash(new Blob(["hello chunk"]));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
```

---

## 五、现有测试文件清单（Ops 模块 19 组件）

| # | 组件 | 测试文件路径 | 支撑测试 |
|:-:|:-----|:------------|:--------|
| 1 | OperationCenter | `src/app/__tests__/OperationCenter.test.tsx` | `useOperationCenter.test.ts` |
| 2 | OperationCategory | `src/app/__tests__/OperationCategory.test.tsx` | |
| 3 | OperationTemplate | `src/app/__tests__/OperationTemplate.test.tsx` | |
| 4 | OperationAudit | `src/app/__tests__/OperationAudit.test.tsx` | |
| 5 | OperationChain | `src/app/__tests__/OperationChain.test.tsx` | |
| 6 | OperationLogStream | `src/app/__tests__/OperationLogStream.test.tsx` | |
| 7 | FileExplorer | `src/app/__tests__/FileExplorer.test.tsx` | |
| 8 | FileBrowser | `src/app/__tests__/FileBrowser.test.tsx` | |
| 9 | HostFileManager | `src/app/__tests__/HostFileManager.test.tsx` | `useHostFileSystem.test.ts` |
| 10 | LocalFileManager | `src/app/__tests__/LocalFileManager.test.tsx` | `useLocalFileSystem.test.tsx` |
| 11 | DatabaseManager | `src/app/__tests__/DatabaseManager.test.tsx` | `db-queries.test.ts` |
| 12 | DatabaseConnectionPanel | `src/app/__tests__/DatabaseConnectionPanel.test.tsx` | `store/db-conn-slice.test.ts` |
| 13 | ServiceLoopPanel | `src/app/__tests__/ServiceLoopPanel.test.tsx` | `useServiceLoop.test.tsx` |
| 14 | LoopStageCard | `src/app/__tests__/LoopStageCard.test.tsx` | `service-loop-types.test.ts` |
| 15 | StageReview | `src/app/__tests__/StageReview.test.tsx` | |
| 16 | ReportGenerator | `src/app/__tests__/ReportGenerator.test.tsx` | |
| 17 | ReportExporter | `src/app/__tests__/ReportExporter.test.tsx` | `useReportExporter.test.ts` |
| 18 | ConnectionMonitorPanel | `src/app/__tests__/ConnectionMonitorPanel.test.tsx` | `ConnectionManager.test.ts` + `ServiceConnectionTest.test.tsx` |
| 19 | LogViewer | `src/app/__tests__/LogViewer.test.tsx` | `store/log-slice.test.ts` |

### Ops 关联 Store / Lib / Integration
```
src/app/__tests__/
├── store/db-conn-slice.test.ts
├── store/log-slice.test.ts
├── useOperationCenter.test.ts
├── operation-types.test.ts
├── service-loop-types.test.ts
├── DatabaseAdapter.integration.test.ts
└── lib/network-utils.test.ts
```

---
**言启千行代码，语枢万物智能**
**言启象限，语枢未来 | Words Initiate Quadrants, Language Serves as Core for Future**
**万象归元于云枢，深栈智启新纪元 | All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**
**YanYuCloudCube · YYC³ 言语云枢科技**
**YYC³ CloudPivot Intelli-Matrix v3.4.1 · Ops Module Test Suite**
**© 2026 YanYuCloudCube Team · MIT License**
