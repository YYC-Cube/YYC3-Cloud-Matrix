---
file: README.md
description: YYC³ CloudPivot Intelli-Matrix · 模块级单元测试计划与用例总索引
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-08-19
updated: 2026-08-19
status: stable
tags: [test, plan, index]
category: technical
language: zh-CN
audience: developers
complexity: intermediate
---

# YYC³ CloudPivot Intelli-Matrix · 单元测试总索引

> **五维驱动 · 五高架构 · 五标体系 · 五化转型** | 本索引统领全项目 8 大模块 200+ 测试文件的计划、执行与覆盖追踪。

---

## 一、测试架构图 · Vitest 四层金字塔

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4 · E2E 端到端测试  (Playwright)                      │
│  · dashboard / navigation / git-panel / cross-page 等 5 规格 │
│  · 路径: src/app/__tests__/e2e/specs/*.e2e.spec.ts           │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 · 集成测试 Integration                              │
│  · 模块间数据流 / core-integration / GitPanel / CreationStudio │
│  · 路径: src/app/__tests__/*.integration.test.{ts,tsx}       │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 · 组件/Hook 测试  (@testing-library/react)          │
│  · 170+ *.test.tsx 组件用例 / 40+ use*.test.ts Hook 用例     │
│  · 路径: src/app/__tests__/*.test.{ts,tsx}                   │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 · 纯函数/Lib/Store 单元测试                          │
│  · 30+ lib/*.test.ts / 10+ store/*.test.ts / utils 测试      │
│  · 路径: src/app/__tests__/{lib,store,hooks,utils}/          │
└─────────────────────────────────────────────────────────────┘
```

**四层架构设计原则：**
| 层级 | 占比目标 | 执行速度 | 稳定性 | 运行频率 |
|:-----|:--------|:--------|:------|:--------|
| L1 纯函数 | 60% | <10ms | 极高 | 每次保存 |
| L2 组件/Hook | 25% | 10-100ms | 高 | 每次保存 |
| L3 集成 | 10% | 100ms-1s | 中 | 每次提交 |
| L4 E2E | 5% | >1s | 低 | 每日/发布 |

---

## 二、全局运行命令表

| 命令 | 脚本定义 | 用途 | 输出 | 适用场景 |
|:-----|:--------|:-----|:-----|:--------|
| `pnpm test` | `vitest` | 交互开发模式 (watch) | 实时反馈 | 本地开发 TDD |
| `pnpm test:watch` | `vitest --watch` | 显式 watch 模式 | 实时反馈 | 持续测试 |
| `pnpm test:ci` | `vitest --run` | CI 单次运行 (无 watch) | JUnit/JSON 报告 | GitHub Actions / 流水线 |
| `pnpm test:coverage` | `vitest --coverage` | 覆盖率统计 (v8) | `coverage/` 目录 HTML/Icov | 质量门禁 / 里程碑评审 |
| `pnpm test:e2e` | `playwright test` | Playwright E2E 无头测试 | HTML 报告 / trace | 发布前验收 |
| `pnpm test:e2e:headed` | `playwright test --headed` | 有头浏览器调试 | 可视交互 | 排查失败用例 |
| `pnpm test:e2e:ui` | `playwright test --ui` | Playwright UI Mode | 时间线 UI | 可视化调试 |
| `pnpm test:lighthouse` | `lhci autorun` | Lighthouse CI 性能审计 | LHCI 报告 | 性能门禁 |

**环境与工具链：**
```
框架:      Vitest 4.x
DOM:       jsdom + fake-indexeddb/auto
Observers: MockResizeObserver + MockIntersectionObserver
断言库:    @testing-library/jest-dom/vitest
渲染:      @testing-library/react 14+
路径别名:  @/ → src/   (vitest.config.ts 已配置)
Setup:     src/app/__tests__/setup.ts  (全局前置)
```

---

## 三、8 模块测试覆盖矩阵

| # | 模块 | 核心域 | 组件数 | Hook/Store数 | 覆盖率目标 | 测试文档 |
|:-:|:-----|:------|:------|:------------|:----------|:--------|
| 1 | **Shared** 共享层 | Layout / 导航 / i18n / 基础组件 | 17 | 5 | ≥ 90% | [shared-unit-tests.md](./shared-unit-tests.md) |
| 2 | **Admin** 管理层 | 用户 / 安全 / 存储 / 配置 / PWA | 18 | 6 | ≥ 88% | [admin-unit-tests.md](./admin-unit-tests.md) |
| 3 | **Monitor** 监控层 | 仪表盘 / 跟进 / 巡查 / 告警 / AI | 22 | 8 | ≥ 85% | [monitor-unit-tests.md](./monitor-unit-tests.md) |
| 4 | **Ops** 运维层 | 操作中心 / 文件 / 数据库 / 报告 | 19 | 7 | ≥ 85% | [ops-unit-tests.md](./ops-unit-tests.md) |
| 5 | **AI** 决策层 | AIDiagnostics / 模型供应商 / Key 加密 | 4 | 3 | ≥ 92% | [ai-unit-tests.md](./ai-unit-tests.md) |
| 6 | **AI-Family** 家庭生态 | 8位家人 / 13 Slices / 情感引擎 | 8+ | 13+ | ≥ 80% | [ai-family-unit-tests.md](./ai-family-unit-tests.md) |
| 7 | **Dev** 开发IDE | 设计系统 / CLI / IDE 面板 / 重构审计 | 25+ | 5 | ≥ 85% | [dev-unit-tests.md](./dev-unit-tests.md) |
| 8 | **Business** 业务层 | HotelDashboard / CommStation 行业 | 2+ | 4 | ≥ 88% | [business-unit-tests.md](./business-unit-tests.md) |

---

## 四、现有测试文件统计

### 4.1 按文件类型分布

| 类型 | 数量 | 示例 |
|:-----|:----|:-----|
| 组件测试 `*.test.tsx` | ~170 | Layout.test.tsx / DataMonitoring.test.tsx |
| Hook 测试 `use*.test.{ts,tsx}` | ~45 | useI18n.test.ts / useWebSocketData.test.tsx |
| Store/Slice 测试 | ~10 | store/app-slice.test.ts / followUpStore.test.ts |
| Lib 纯函数测试 | ~30 | lib/crypto-vault.test.ts / lib/network-utils.test.ts |
| 集成测试 `*.integration.*` | ~6 | core-integration.test.tsx / GitPanel.integration.test.tsx |
| E2E `*.e2e.spec.ts` | 5 | dashboard / navigation / git-panel / cross-page / wifi |
| 工具/类型/基础设施 | ~25 | setup.ts / test-infrastructure.test.ts / types-audit.test.ts |
| **合计** | **~291** |  |

### 4.2 按模块分布（Top 10 组件测试）

| 排名 | 文件 | 模块 | 预计行数 |
|:----|:-----|:-----|:--------|
| 1 | DataMonitoring.test.tsx | Monitor | +300 |
| 2 | OperationCenter.test.tsx | Ops | +280 |
| 3 | AIDiagnostics.test.tsx | AI | +250 |
| 4 | IDELayout.test.tsx | Dev | +240 |
| 5 | HotelDashboard.test.tsx | Business | +230 |
| 6 | PatrolDashboard.test.tsx | Monitor | +220 |
| 7 | FamilyVoiceSystem.test.tsx | AI-Family | +210 |
| 8 | UserManagement.test.tsx | Admin | +200 |
| 9 | DatabaseManager.test.tsx | Ops | +195 |
| 10 | UnifiedSettingsPanel.test.tsx | Admin | +190 |

---

## 五、文档导航链接

### 5.1 八大模块单元测试文档

| 模块 | 文档链接 | 难度 | 测试数量参考 |
|:-----|:--------|:----|:------------|
| 🔷 Shared 共享层 | [shared-unit-tests.md](./shared-unit-tests.md) | 中级 | 17 组件 × ≥3 套件 |
| 👑 Admin 管理层 | [admin-unit-tests.md](./admin-unit-tests.md) | 中高级 | 18 组件 × ≥2 套件 |
| 📊 Monitor 监控层 | [monitor-unit-tests.md](./monitor-unit-tests.md) | 高级 | 22 组件 × ≥3 套件 |
| 🛠️ Ops 运维层 | [ops-unit-tests.md](./ops-unit-tests.md) | 高级 | 19 组件 × ≥2 套件 |
| 🤖 AI 决策层 | [ai-unit-tests.md](./ai-unit-tests.md) | 高级 | 4 组件 + Store + AES |
| 👨‍👩‍👧 AI-Family 家庭 | [ai-family-unit-tests.md](./ai-family-unit-tests.md) | 专家 | 8 角色 + 13 Slices |
| 💻 Dev 开发IDE | [dev-unit-tests.md](./dev-unit-tests.md) | 专家 | 设计系统 + CLI + 20 IDE 面板 |
| 💼 Business 业务 | [business-unit-tests.md](./business-unit-tests.md) | 高级 | Hotel + CommStation 纯函数 |

### 5.2 相关资源链接

- 项目 README：[`/README.md`](../../README.md)
- 模块源码：[`src/app/modules/*/`](../../src/app/modules/)
- 测试根目录：[`src/app/__tests__/`](../../src/app/__tests__/)
- 测试 Setup：[`setup.ts`](../../src/app/__tests__/setup.ts)
- 测试辅助：[`helpers/render-utils.tsx`](../../src/app/__tests__/helpers/render-utils.tsx)
- Store 测试目录：[`store/`](../../src/app/__tests__/store/)
- Hook 测试目录：[`hooks/`](../../src/app/__tests__/hooks/)
- Lib 测试目录：[`lib/`](../../src/app/__tests__/lib/)
- E2E 规格：[`e2e/specs/`](../../src/app/__tests__/e2e/specs/)

---

## 六、质量门禁指标

| 指标 | 阈值 | 测量方式 |
|:-----|:----|:--------|
| 语句覆盖率 | ≥ 80% | `vitest --coverage` |
| 分支覆盖率 | ≥ 75% | `vitest --coverage` |
| 函数覆盖率 | ≥ 80% | `vitest --coverage` |
| 行覆盖率 | ≥ 82% | `vitest --coverage` |
| 单文件最大复杂度 | ≤ 20 | ESLint `complexity` |
| 单用例平均执行 | ≤ 50ms | Vitest `--reporter=verbose` |
| CI 全量测试时间 | ≤ 15 min | GitHub Actions |

---

## 七、现有测试文件清单（按模块索引）

### 7.1 Shared 模块
```
src/app/__tests__/
├── Layout.test.tsx
├── Sidebar.test.tsx
├── TopBar.test.tsx
├── BottomNav.test.tsx
├── Login.test.tsx
├── ErrorBoundary.test.tsx
├── NotFound.test.tsx
├── GlassCard.test.tsx
├── LanguageSwitcher.test.tsx
├── YYC3Logo.test.tsx
├── YYC3LogoSvg.test.tsx
├── AIAssistant.test.tsx
├── CommandPalette.test.tsx
├── OfflineIndicator.test.tsx
├── ConnectionStatus.test.tsx
└── QuickActionGrid.test.tsx
```

### 7.2 Admin 模块
```
src/app/__tests__/
├── OperationAudit.test.tsx
├── UserManagement.test.tsx
├── SystemSettings.test.tsx
├── UnifiedSettingsPanel.test.tsx
├── SecurityMonitor.test.tsx
├── PWAStatusPanel.test.tsx
├── PWAInstallPrompt.test.tsx
├── DataEditorPanel.test.tsx
├── InlineEditableTable.test.tsx
├── PerformanceMonitor.test.tsx
├── EnvConfigEditor.test.tsx
├── storageManager.test.ts
├── StorageConfigPanel.test.tsx
├── StorageSyncStatus.test.tsx
├── ConfigCenter.test.tsx
├── VariableCenter.test.tsx
├── PageConfigEditor.test.tsx
└── NetworkConfig.test.tsx
```

### 7.3 Monitor 模块
```
src/app/__tests__/
├── Dashboard.test.tsx
├── DataMonitoring.test.tsx
├── FollowUpCard.test.tsx
├── FollowUpDrawer.test.tsx
├── PatrolDashboard.test.tsx
├── PatrolScheduler.test.tsx
├── PatrolHistory.test.tsx
├── PatrolReport.test.tsx
├── AlertRulesPanel.test.tsx
├── CreateRuleModal.test.tsx
├── AISuggestionPanel.test.tsx
├── ActionRecommender.test.tsx
├── QuickActionGrid.test.tsx
├── QuickActionGroup.test.tsx
├── PatternAnalyzer.test.tsx
└── NodeDetailModal.test.tsx
```

### 7.4 Ops 模块
```
src/app/__tests__/
├── OperationCenter.test.tsx
├── OperationCategory.test.tsx
├── OperationTemplate.test.tsx
├── OperationAudit.test.tsx
├── OperationChain.test.tsx
├── OperationLogStream.test.tsx
├── FileExplorer.test.tsx
├── FileBrowser.test.tsx
├── HostFileManager.test.tsx
├── LocalFileManager.test.tsx
├── DatabaseManager.test.tsx
├── DatabaseConnectionPanel.test.tsx
├── ServiceLoopPanel.test.tsx
├── LoopStageCard.test.tsx
├── StageReview.test.tsx
├── ReportGenerator.test.tsx
├── ReportExporter.test.tsx
├── ConnectionMonitorPanel.test.tsx
└── LogViewer.test.tsx
```

### 7.5 AI 模块
```
src/app/__tests__/
├── AIDiagnostics.test.tsx
├── ModelProviderPanel.test.tsx
├── AddModelModal.test.tsx
├── ProviderEditorModal.test.tsx
├── useAIDiagnostics.test.ts
├── useModelProvider.test.ts
├── useModelProvider.test.tsx
├── store/model-slice.test.ts
└── ai-service-manager.test.ts
```

### 7.6 AI-Family 模块
```
src/app/__tests__/
├── FamilyModelSettings.test.tsx
├── FamilyUISettings.test.tsx
├── FamilyVoiceSystem.test.tsx
├── EmotionVisualizer.test.tsx
├── VinylPhotoPlayer.test.tsx
├── VinylPhotoPlayer.integration.test.tsx
├── FamilyMusic.integration.test.tsx
├── SmartPlaylistGenerator.test.ts
├── MultimodalEmotionEngine.test.ts
├── useAudioEngine.test.ts
├── useEmotionMusic.test.ts
├── MusicEventBus.test.ts
├── ai-family.test.ts
├── ai-family-hotel.test.ts
└── ai-family-hotel-scenarios.test.ts
```

### 7.7 Dev 模块
```
src/app/__tests__/
├── DesignSystemPage.test.tsx
├── DesignTokens.test.tsx
├── ThemeCustomizer.test.tsx
├── ColorSwatch.test.tsx
├── ColorPicker.test.tsx
├── color-utils.test.ts
├── CLITerminal.test.tsx
├── IntegratedTerminal.test.tsx
├── useTerminal.test.ts
├── IDELayout.test.tsx
├── IDEPanel.test.tsx
├── IDETopBar.test.tsx
├── IDEStatusBar.test.tsx
├── IDESettingsPanel.test.tsx
├── Workspace.test.tsx
├── Panel.test.tsx
├── PanelContainer.test.tsx
├── PanelContent.test.tsx
├── PanelToolbar.test.tsx
├── CodeEditor.test.tsx
├── CreationStudio.test.tsx
├── CreationStudio.integration.test.tsx
├── ComponentShowcase.test.tsx
├── DataFlowDiagram.test.tsx
├── RefactoringReport.test.tsx
├── ArchitectureAudit.test.tsx
├── DevGuidePage.test.tsx
└── ide-mock-data.test.ts
```

### 7.8 Business 模块
```
src/app/__tests__/
├── HotelDashboard.test.tsx
├── CommStationPanel.test.tsx
├── core-business-logic.test.ts
├── ai-family-hotel.test.ts
└── ai-family-hotel-scenarios.test.ts
```

---

## 八、执行约定与最佳实践

1. **data-testid 命名**：全部使用 `yyc3-<模块>-<组件>-<语义>` 前缀，例如 `data-testid="yyc3-shared-sidebar-toggle"`
2. **三层结构**：每个 `describe("渲染正确")` / `describe("i18n 中文")` / `describe("用户交互")` 必须齐备
3. **Mock 隔离**：`vi.mock("...")` 置于文件顶部 import 之后，`beforeEach/vi.clearAllMocks()` 清理
4. **异步测试**：WebSocket/API 使用 `vi.useFakeTimers()` + `await waitFor()`
5. **覆盖率忽略**：`/* v8 ignore next */` 仅用于第三方回调/不可达分支
6. **快照策略**：仅对纯展示组件（如 Logo、Icon、GlassCard）使用 `toMatchSnapshot()`

---

---
**言启千行代码，语枢万物智能**
**言启象限，语枢未来 | Words Initiate Quadrants, Language Serves as Core for Future**
**万象归元于云枢，深栈智启新纪元 | All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**
**YanYuCloudCube · YYC³ 言语云枢科技**
**YYC³ CloudPivot Intelli-Matrix v3.4.1 · Test Suite**
**© 2026 YanYuCloudCube Team · MIT License**
