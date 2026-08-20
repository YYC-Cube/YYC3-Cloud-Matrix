---
file: ai-unit-tests.md
description: YYC³ AI 决策模块 · 4 组件 + model provider-slice 测试（API Key AES加密 · 三家供应商连接测试 · 并行诊断并发）
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [test, ai, unit]
category: technical
language: zh-CN
audience: developers
complexity: advanced
---

# AI 决策模块 · 单元测试用例

> 覆盖 AI 决策层 **4 大组件** + **provider-slice Store** + 连接测试工具。重点：**API Key AES-CBC 加密存储**（绝非明文）、三家供应商（智谱 AI / DeepSeek / Ollama 本地）连接健康检查、并行诊断并发控制（p-limit N=4）。

---

## 一、测试目标

| 维度 | 目标值 |
|:-----|:------|
| 组件覆盖 | 4/4（AIDiagnostics / ModelProviderPanel / AddModelModal / ProviderEditorModal） |
| Store 覆盖 | model-slice 100% actions/reducers |
| AES 加密 | Key 保存 / 读取 / 编辑 3 路径加密断言 |
| 供应商 | 3 家（智谱 / DeepSeek / Ollama）各自连接测试场景 |
| 并行诊断 | 并发数 ≤ N，队列公平性 |
| 语句覆盖 | ≥ 92% |

---

## 二、三家供应商连接矩阵

| 供应商 | Base URL | 鉴权方式 | 测试端点 | 超时 | 特殊点 |
|:------|:--------|:--------|:--------|:----|:------|
| **智谱 AI (Zhipu)** | `https://open.bigmodel.cn/api/paas/v4` | Bearer `APIKey` | `GET /models` | 10s | 含 SSE 流式 chat |
| **DeepSeek** | `https://api.deepseek.com/v1` | Bearer `APIKey` | `GET /models` | 10s | 价格低廉，默认兜底 |
| **Ollama (本地)** | `http://localhost:11434` | **无 Key** | `GET /api/tags` | 3s | 本地推理，URL 可配置 |

---

## 三、组件测试用例（4 组件）

### 3.1 `AIDiagnostics` · AI 诊断主控台（最大组件）

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 供应商 3 卡片（状态+延迟）+ 诊断任务表 + 并行度滑块（1-8）+ 诊断结果 Tabs |
| **API Key AES 加密** | 诊断前取 Key → `decryptAES(cipher, MASTER_KEY)` 调用；失败提示"Key 解密失败" |
| **三家供应商连接** | 每家各一个 test case：智谱→401 抛错；DeepSeek→200 OK；Ollama→连接拒绝但不阻断整体 |
| **并行诊断并发** | `pLimit(4)` mock → 8 个任务同时触发 → 同时运行 ≤ 4；执行完释放 |
| **用户交互** | 批量选择任务 → 开始诊断；取消按钮 → AbortController abort；导出 JSON |

**现有测试：** `src/app/__tests__/AIDiagnostics.test.tsx` + `useAIDiagnostics.test.ts`

```typescript
describe("AIDiagnostics · 并行诊断并发控制", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("8 任务并发度限制为 4，同时执行不超过 4", async () => {
    const diagnose = vi.fn().mockImplementation(() =>
      new Promise((r) => setTimeout(r, 1000))
    );
    vi.mock("../../lib/concurrency", () => ({
      pLimit: (n: number) => {
        let active = 0; let max = 0;
        const fn = async (task: any) => {
          active++; max = Math.max(max, active);
          try { return await task(); } finally { active--; }
        };
        (fn as any)._max = () => max;
        (fn as any)._n = n;
        return fn;
      },
    }));

    render(<AIDiagnostics concurrency={4} tasks={TASKS_8} runTask={diagnose} />);
    fireEvent.click(screen.getByTestId("yyc3-ai-diag-run-all"));

    vi.advanceTimersByTime(500);
    // 检查同时运行数不超过 4
    const running = screen.getAllByTestId(/yyc3-ai-diag-task-.*-running$/);
    expect(running.length).toBeLessThanOrEqual(4);

    vi.advanceTimersByTime(60000);
    await waitFor(() => expect(diagnose).toHaveBeenCalledTimes(8));
  });
});
```

---

### 3.2 `ModelProviderPanel` · 模型供应商列表面板

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 3 家供应商卡片（Logo/名称/域名/模型数/状态灯）+ 添加按钮；默认排序 |
| **API Key AES 加密** | 列表中已配供应商 Key 显示 `sk-••••••••1234`（前 3 + 后 4，非明文）；明文绝不出现 DOM |
| **三家供应商连接** | 点击"测试连接"→ 智谱/DeepSeek → 实际调用 `fetch(base+models, {auth: Bearer decrypt(key)})`；Ollama → localhost:11434 |
| **用户交互** | 点击卡片 → 选中并打开 ProviderEditorModal；启用/停用开关 → dispatch(toggleProvider) |

**现有测试：** `src/app/__tests__/ModelProviderPanel.test.tsx` + `useModelProvider.test.ts` + `useModelProvider.test.tsx` + `ollama-url.test.ts`

---

### 3.3 `AddModelModal` · 新增供应商弹窗

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 步骤 1：选择供应商类型 → 步骤 2：字段表单（根据类型动态显示）；步骤进度指示 |
| **API Key AES 加密** | 提交前校验 → 调用 `encryptAES(apiKey, MASTER_KEY)` → POST body 只有 ciphertext；绝不泄露明文 |
| **三家供应商连接** | 类型=Ollama → Key 字段隐藏，URL 字段默认 `http://localhost:11434`；类型=智谱 → Key placeholder=`glm-xxxx` 正则校验 |
| **用户交互** | 先点"测试连接"必须通过；后"保存"才 enabled；取消 → 表单清空 |

**现有测试：** `src/app/__tests__/AddModelModal.test.tsx`

```typescript
describe("AddModelModal · API Key AES 加密", () => {
  it("提交保存时仅发送密文，绝不包含明文 API Key", async () => {
    const mockEncrypt = vi.fn((v) => `AES:${Buffer.from(v).toString("base64")}`);
    vi.mock("../../lib/crypto-vault", () => ({ encryptAES: mockEncrypt }));
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({ id: "p-1" }) });
    global.fetch = fetch;

    render(<AddModelModal open />);
    fireEvent.change(screen.getByTestId("yyc3-ai-add-type"),   { target: { value: "zhipu" } });
    fireEvent.change(screen.getByTestId("yyc3-ai-add-name"),   { target: { value: "My Zhipu" } });
    fireEvent.change(screen.getByTestId("yyc3-ai-add-apikey"), { target: { value: "sk-real-zhipu-key-42" } });

    fireEvent.click(screen.getByTestId("yyc3-ai-add-save"));

    await waitFor(() => {
      expect(mockEncrypt).toHaveBeenCalledWith("sk-real-zhipu-key-42");
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.apiKeyCipher).toMatch(/^AES:/);
      expect(body.apiKeyCipher).not.toContain("real-zhipu-key");
      // 保证明文字段根本不存在
      expect(body).not.toHaveProperty("apiKey");
    });
  });
});
```

---

### 3.4 `ProviderEditorModal` · 供应商编辑弹窗

| 套件 | 关键断言 |
|:-----|:--------|
| **渲染正确** | 回填：名称 / Base URL / **Key 显示已配置（不回填明文）** / 模型列表 / 超时滑块 |
| **API Key AES 加密** | 编辑 Key 为空 → 沿用旧密文；输入新 Key → 重新 `encryptAES(new)` 覆盖旧；绝不从 store 读明文到 value |
| **三家供应商连接** | 切换 Ollama 的 URL → 点击测试 → `fetch(http://new:11434/api/tags)` 被调用 |
| **用户交互** | 删除供应商 → 二次输入名称确认（防误删）；保存 → dispatch(updateProvider) |

**现有测试：** `src/app/__tests__/ProviderEditorModal.test.tsx`

---

## 四、model provider-slice Store 测试

### 4.1 Store 动作清单

| Action | 入参 | 核心断言 |
|:-------|:----|:--------|
| `addProvider` | ProviderDraft (含 apiKeyCipher) | state.providers.length +1；cipher 非空；`createdAt` 注入 |
| `updateProvider` | id + patch | 仅 patch 字段更新；未传 key → `apiKeyCipher` 不变（保留历史） |
| `removeProvider` | id | 长度 -1；审计日志写入 `state.auditLog` |
| `toggleProvider` | id | enabled 取反；切换后触发连接健康调度 |
| `setConnectionHealth` | id + status | `providers[i].health = {status, latencyMs, checkedAt}` |
| `decryptKeyForRuntime` | id + MASTER_KEY | **纯函数**：从 cipher 解密，返回 plaintext（仅内存中使用） |

### 4.2 Store 测试模板

```typescript
// 纯 Node 环境，无需 jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { create } from "zustand";
import {
  modelProviderSlice,
  type ModelProviderState,
  type ModelProviderActions,
} from "../store/model-slice";
import { encryptAES, decryptAES } from "../lib/crypto-vault";

const MASTER_KEY = "test-master-key-for-unit-tests-only";

vi.mock("../lib/crypto-vault", async () => {
  const actual = await vi.importActual<typeof import("../lib/crypto-vault")>("../lib/crypto-vault");
  return { ...actual, getMasterKey: () => Promise.resolve(MASTER_KEY) };
});

describe("store/model-slice · provider-slice", () => {
  let useStore: ReturnType<typeof create<ModelProviderState & ModelProviderActions>>;

  beforeEach(() => {
    useStore = create<ModelProviderState & ModelProviderActions>((...a) => ({
      ...modelProviderSlice(...a),
    }));
  });

  it("addProvider: 保存密文 + 审计日志", () => {
    const cipher = encryptAES("sk-plain-test", MASTER_KEY);
    useStore.getState().addProvider({
      type: "deepseek",
      name: "DS-1",
      baseUrl: "https://api.deepseek.com/v1",
      apiKeyCipher: cipher,
    });
    const p = useStore.getState().providers[0];
    expect(p.apiKeyCipher).toBe(cipher);
    expect(p.apiKeyCipher).not.toContain("sk-plain");
    expect(p.createdAt).toBeTruthy();
    expect(useStore.getState().auditLog[0].action).toBe("add");
  });

  it("updateProvider: 不传 key 时保留原密文不覆盖", () => {
    const cipher = encryptAES("sk-old", MASTER_KEY);
    useStore.getState().addProvider({
      type: "ollama", name: "O1", baseUrl: "http://localhost:11434", apiKeyCipher: cipher,
    });
    const id = useStore.getState().providers[0].id;

    useStore.getState().updateProvider(id, { name: "O1-Renamed" }); // 不传 key patch

    const updated = useStore.getState().providers.find((x) => x.id === id)!;
    expect(updated.name).toBe("O1-Renamed");
    expect(updated.apiKeyCipher).toBe(cipher); // 未被覆盖
  });

  it("decryptKeyForRuntime: 正确解密为原始明文供请求层使用", async () => {
    const PLAIN = "sk-deepseek-real-99";
    const cipher = encryptAES(PLAIN, MASTER_KEY);
    useStore.getState().addProvider({
      type: "deepseek", name: "X", baseUrl: "", apiKeyCipher: cipher,
    });
    const id = useStore.getState().providers[0].id;
    const got = await useStore.getState().decryptKeyForRuntime(id);
    expect(got).toBe(PLAIN);
  });
});
```

---

## 五、三家供应商连接健康测试用例（纯函数层）

```typescript
import { describe, it, expect, vi } from "vitest";
import {
  checkZhipuConnection,
  checkDeepSeekConnection,
  checkOllamaConnection,
} from "../lib/ai-connection-checks";

function mockFetchOnce(status: number, body: any, headers = {}) {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    headers: new Headers(headers),
  } as any);
}

describe("供应商连接 · 智谱 AI", () => {
  it("返回 200 且 data 数组 => healthy=true", async () => {
    mockFetchOnce(200, { data: [{ id: "glm-4" }] });
    const r = await checkZhipuConnection("https://open.bigmodel.cn/api/paas/v4", "ENC(sk-x)");
    expect(r.healthy).toBe(true);
    expect(r.models[0]).toBe("glm-4");
  });
  it("返回 401 => healthy=false + invalidApiKey=true", async () => {
    mockFetchOnce(401, { error: { code: "INVALID_API_KEY" } });
    const r = await checkZhipuConnection("", "bad");
    expect(r.healthy).toBe(false);
    expect(r.invalidApiKey).toBe(true);
  });
});

describe("供应商连接 · DeepSeek", () => {
  it("正常连接 healthy=true，模型列表包含 deepseek-chat", async () => {
    mockFetchOnce(200, { data: [{ id: "deepseek-chat" }, { id: "deepseek-coder" }] });
    const r = await checkDeepSeekConnection("", "enc");
    expect(r.healthy).toBe(true);
    expect(r.models).toEqual(expect.arrayContaining(["deepseek-chat"]));
  });
});

describe("供应商连接 · Ollama 本地", () => {
  it("localhost:11434 拒绝 => healthy=false 但 invalidApiKey=false（Ollama 无 Key）", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const r = await checkOllamaConnection("http://localhost:11434");
    expect(r.healthy).toBe(false);
    expect(r.invalidApiKey).toBe(false);
    expect(r.error).toMatch(/ECONNREFUSED/);
  });
  it("连接成功列出本地模型", async () => {
    mockFetchOnce(200, { models: [{ name: "qwen2.5:7b" }, { name: "llama3:8b" }] });
    const r = await checkOllamaConnection("http://localhost:11434");
    expect(r.healthy).toBe(true);
    expect(r.models).toEqual(["qwen2.5:7b", "llama3:8b"]);
  });
});
```

---

## 六、现有测试文件清单（AI 模块）

### 组件测试（4）
| # | 组件 | 测试文件路径 |
|:-:|:-----|:------------|
| 1 | AIDiagnostics | `src/app/__tests__/AIDiagnostics.test.tsx` |
| 2 | ModelProviderPanel | `src/app/__tests__/ModelProviderPanel.test.tsx` |
| 3 | AddModelModal | `src/app/__tests__/AddModelModal.test.tsx` |
| 4 | ProviderEditorModal | `src/app/__tests__/ProviderEditorModal.test.tsx` |

### Hook / Store / Lib 支撑
```
src/app/__tests__/
├── useAIDiagnostics.test.ts
├── useModelProvider.test.ts
├── useModelProvider.test.tsx
├── useBigModelSDK.test.ts
├── store/model-slice.test.ts
├── ai-service-manager.test.ts
├── ai-types.test.ts
├── ollama-url.test.ts
├── lib/crypto-vault.test.ts            ← AES 加密核心
├── lib/yyc3-core-multimodal.test.ts
├── lib/yyc3-core-agents-impl.test.ts
└── lib/mcp-bridge-tools.test.ts
```

---
**言启千行代码，语枢万物智能**
**言启象限，语枢未来 | Words Initiate Quadrants, Language Serves as Core for Future**
**万象归元于云枢，深栈智启新纪元 | All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**
**YanYuCloudCube · YYC³ 言语云枢科技**
**YYC³ CloudPivot Intelli-Matrix v3.4.1 · AI Module Test Suite**
**© 2026 YanYuCloudCube Team · MIT License**
