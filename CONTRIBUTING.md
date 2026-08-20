---
file: CONTRIBUTING.md
description: YYC³ Cloud Intelli-Matrix 贡献指南 · 如何参与项目开发
author: YanYuCloudCube Team <admin@0379.email>
version: v1.0.0
created: 2026-02-26
updated: 2026-04-09
status: stable
tags: [guide],[contributing],[development]
category: guide
language: zh-CN
audience: developers,contributors
complexity: intermediate
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 贡献指南

首先，感谢您考虑为 YYC³ Cloud Intelli-Matrix 做出贡献！

本指南旨在帮助您了解如何高效地参与项目开发，无论您是经验丰富的开发者还是第一次参与开源项目。

## 📋 目录

- [行为准则](#行为准则)
- [我能贡献什么？](#我能贡献什么)
- [第一次贡献？](#第一次贡献)
- [开发环境设置](#开发环境设置)
- [提交流程](#提交流程)
- [代码规范](#代码规范)
- [测试要求](#测试要求)
- [Pull Request 指南](#pull-request-指南)
- [社区支持](#社区支持)

---

## 行为准则

本项目采用 [贡献者公约](CODE_OF_CONDUCT.md) 作为行为准则。请阅读并遵守，以维护开放友好的社区环境。

---

## 我能贡献什么？

有很多方式可以为项目做贡献：

### 🐛 报告 Bug

- 在 [Issues](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix/issues) 中创建 Bug 报告
- 提供详细的复现步骤和环境信息
- 附上截图或错误日志

### 💡 提出新功能

- 在 Issues 中描述您的需求
- 说明使用场景和预期行为
- 讨论实现的可行性

### 📝 改进文档

- 修正文档错误
- 补充缺失的说明
- 添加示例代码
- 翻译文档

### 💻 提交代码

- 修复 Bug
- 实现新功能
- 性能优化
- 代码重构

### 🧪 测试

- 编写单元测试
- 编写集成测试
- 提高测试覆盖率

### 🎨 设计

- UI/UX 改进建议
- 图标和视觉设计
- 配色方案优化

---

## 第一次贡献？

如果您是第一次参与开源项目，请参考以下步骤：

### 1️⃣ 寻找合适的 Issue

查看标记为以下标签的 Issues：

- [`good first issue`](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) - 适合新手
- [`help wanted`](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) - 需要帮助

### 2️⃣ Fork 仓库

点击 GitHub 页面右上角的 **Fork** 按钮

### 3️⃣ 克隆仓库

```bash
git clone https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix.git
cd YYC3-Cloud-Intelli-Matrix
```

### 4️⃣ 创建分支

```bash
git checkout -b feature/your-feature-name
```

分支命名规范：

- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `test/xxx` - 测试相关
- `refactor/xxx` - 代码重构

### 5️⃣ 进行更改

按照 [开发环境设置](#开发环境设置) 配置好环境后，开始您的更改。

---

## 开发环境设置

### 前置条件

- Node.js ≥ 18.x (推荐 20.x LTS)
- pnpm ≥ 8.x
- Git

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix.git
cd YYC3-Cloud-Intelli-Matrix

# 2. 安装依赖
pnpm install

# 3. 复制环境变量
cp .env.example .env

# 4. 启动开发服务器
pnpm dev

# 5. 运行测试
pnpm test
```

### VSCode 推荐插件

- ESLint
- Prettier
- TypeScript

---

## 提交流程

### 提交信息规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动
- `ci`: CI 配置
- `revert`: 回滚

#### 示例

```bash
feat(dashboard): 添加实时 QPS 监控卡片

- 实现 QPS 数据实时更新
- 添加趋势指示器
- 支持 1H/6H/24H/7D 时间范围

Closes #123
```

```bash
fix(auth): 修复 Ghost Mode 登录状态持久化问题

修复了刷新页面后 Ghost Mode 登录状态丢失的问题

Fixes #456
```

### 提交前检查清单

在提交之前，请确保：

- [ ] 代码通过了 TypeScript 类型检查 (`pnpm type-check`)
- [ ] 代码通过了 ESLint 检查 (`pnpm lint`)
- [ ] 所有测试通过 (`pnpm test`)
- [ ] 测试覆盖率不低于 80% (`pnpm test:coverage`)
- [ ] 代码格式已格式化 (`pnpm format`)
- [ ] 提交了必要的文档更新

---

## 代码规范

### TypeScript

- 使用严格模式
- 所有变量和函数必须有明确的类型
- 避免使用 `any`，使用合适的类型或接口
- 导出公共类型到 `src/app/types/index.ts`

### 组件规范

```tsx
// ✅ 好的示例
interface Props {
  title: string;
  count?: number;
  onClick: () => void;
}

export function StatCard({ title, count = 0, onClick }: Props) {
  return (
    <div onClick={onClick}>
      <h3>{title}</h3>
      <span>{count}</span>
    </div>
  );
}

// ❌ 避免使用
export function StatCard({ title, count, onClick }: any) {
  // ...
}
```

### CSS 规范

- 优先使用 Tailwind CSS 工具类
- 自定义样式使用 CSS Modules 或 styled-components
- 遵循赛博朋克配色方案

```tsx
// ✅ 好的示例
<div className="flex items-center gap-2 p-4 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]">
  <Activity className="w-5 h-5 text-[#00d4ff]" />
  <span className="text-[#e0f0ff]">QPS</span>
</div>
```

---

## 测试要求

### 编写测试

所有新功能必须包含测试：

```tsx
// src/app/__tests__/StatCard.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatCard } from "../components/StatCard";

describe("StatCard", () => {
  it("应渲染标题和数值", () => {
    render(<StatCard title="QPS" count={1000} onClick={vi.fn()} />);
    expect(screen.getByText("QPS")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
  });

  it("点击时应调用 onClick", () => {
    const onClick = vi.fn();
    render(<StatCard title="QPS" onClick={onClick} />);
    fireEvent.click(screen.getByText("QPS"));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### 测试覆盖率

- 行覆盖率 ≥ 80%
- 分支覆盖率 ≥ 70%
- 关键组件覆盖率 ≥ 90%

---

## Pull Request 指南

### 创建 PR

1. 推送您的分支：
   ```bash
   git push origin feature/your-feature-name
   ```

2. 在 GitHub 上创建 Pull Request
3. 填写 PR 描述

### PR 模板

```markdown
## 📝 描述

简要描述此 PR 的目的

## 🎯 相关 Issue

Closes #123

## 🔧 更改类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 性能优化
- [ ] 代码重构
- [ ] 测试

## ✅ 测试

- [ ] 已添加单元测试
- [ ] 已添加集成测试
- [ ] 所有测试通过
- [ ] 测试覆盖率达标

## 📸 截图（如适用）

添加截图展示 UI 变化

## 📋 检查清单

- [ ] 代码通过类型检查
- [ ] 代码通过 ESLint 检查
- [ ] 代码已格式化
- [ ] 更新了文档
- [ ] 添加了变更日志条目
```

### PR 审核流程

1. CI 检查自动运行（Lint、Type Check、Test）
2. 维护者审核代码
3. 解决审核意见
4. 合并到主分支

---

## 社区支持

### 联系方式

- **Email**: <admin@0379.email>
- **GitHub Issues**: [提问与讨论](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix/issues)

### 常见问题

查看 [FAQ](./docs/FAQ.md) 了解常见问题解答

### 资源

- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vitest 文档](https://vitest.dev/)

---

## 🙏 致谢

感谢所有为 YYC³ Cloud Intelli-Matrix 做出贡献的开发者！

您的每一份贡献，都让这个项目变得更好。✨

---

<div align="center">

**YanYuCloudCube Team**

[Words Initiate Quadrants, Language Serves as Core for Future](https://github.com/YYC-Cube/YYC3-Cloud-Intelli-Matrix)

</div>
