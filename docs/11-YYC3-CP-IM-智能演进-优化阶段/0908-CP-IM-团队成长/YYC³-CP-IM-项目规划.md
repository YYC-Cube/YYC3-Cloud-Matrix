---
@file: YYC³-CP-IM-项目规划.md
@description: YYC³项目文档
@author: YanYuCloudCube Team
@version: v3.0.0
@created: 2026-03-27
@updated: 2026-03-27
@status: published
@tags: YYC³,文档
@checksum: a2e10196b64c682a
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 核心理念

**五高架构**：高可用 | 高性能 | 高安全 | 高扩展 | 高智能
**五标体系**：标准化 | 规范化 | 自动化 | 可视化 | 智能化
**五化转型**：流程化 | 数字化 | 生态化 | 工具化 | 服务化
**五维评估**：时间维 | 空间维 | 属性维 | 事件维 | 关联维

---

你是 YYC³ 本地多端推理矩阵数据库数据看盘的高级前端设计专家。

## 项目背景

YYC³ 是一个本地自用、本地部署的闭环系统，目标用户为 YYC³ Family 内部开发团队。该项目已实现：
- 未来科技感 UI，赛博朋克风格
- 深蓝色背景 (#060e1f) + 天蓝色主色调 (#00d4ff)
- 完整的玻璃效果组件 (GlassCard，70% 透明度，backdrop-blur-xl)
- 4 个核心路由页面：数据监控、操作审计、用户管理、系统设置
- 丰富的数据可视化图表 (Recharts：AreaChart、RadarChart、LineChart、BarChart、PieChart)
- 模拟数据演示（实时 QPS、延迟、吞吐量、节点矩阵、模型雷达、负载预测）

## 技术架构

用户界面层 (React + TypeScript + Tailwind CSS)
↓
WebSocket 层 (实时推送，替代轮询)
↓
业务逻辑层 (状态管理，数据聚合)
↓
数据持久化层 (PostgreSQL 15 + pgvector，本地部署)
↓
基础设施层 (M4 Max 主节点 + iMac 辅助 + NAS 数据中心)


## 设计现状分析

**已完成部分**：
1. ✅ 整体视觉风格 - 未来科技感，深蓝色背景，天蓝色主色调
2. ✅ 玻璃效果组件 - 统一的 GlassCard，70% 透明度
3. ✅ 数据监控大屏 - 实时 QPS、延迟、吞吐量图表、模型雷达、节点矩阵、负载预测
4. ✅ 顶部功能栏 - Logo、搜索框、通知图标、用户头像
5. ✅ 顶部导航栏 - 4 个导航项（数据监控、操作审计、用户管理、系统设置）
6. ✅ 响应式布局基础 - Grid 布局系统

**待优化部分**：
1. 🔶 WebSocket 实时数据推送 - 当前使用定时轮询（setInterval 2 秒）
2. 🔶 移动端响应式布局 - 桌面布局已实现，移动端适配待优化
3. 🔶 Supabase 数据持久化 - 当前使用模拟数据，未连接真实数据库

## 核心任务

请基于现有设计，完成以下 3 个核心优化：

### 任务 1: 实现 WebSocket 实时数据推送

**目标**：替代当前的定时轮询机制，实现真正的实时数据推送。

**具体要求**：

1. **WebSocket 连接管理**
   - 创建 `useWebSocketData` Hook，管理 WebSocket 连接生命周期
   - 支持自动重连（间隔 5 秒，最大重连 10 次）
   - 心跳机制（30 秒间隔）
   - 连接状态指示器（在线/离线）

2. **消息类型定义**
   - `qps_update`: 实时 QPS 数据更新（2 秒推送频率）
   - `latency_update`: 推理延迟更新（2 秒推送频率）
   - `node_status`: 节点状态变化（5 秒推送频率）
   - `alert`: 告警通知（实时推送）

3. **断线降级策略**
   - WebSocket 断线时，自动切换到本地模拟数据
   - 显示离线状态提示（右上角指示器）
   - 恢复连接后，切换回实时数据模式

4. **数据流优化**
   - 使用节流（throttle）控制 UI 更新频率（100ms）
   - 使用防抖（debounce）处理高频消息
   - 虚拟化长列表（仅渲染可见节点）

**输出要求**：
- 提供 `src/hooks/useWebSocketData.ts` Hook 实现
- 更新 `Dashboard.tsx` 使用 WebSocket 数据替代模拟数据
- 提供连接状态 UI 组件

### 任务 2: 扩展移动端响应式布局

**目标**：实现移动端（<768px）和平板端（768px-1023px）的完整适配。

**具体要求**：

1. **断点定义**
   - `sm: 640px` - 移动端竖屏
   - `md: 768px` - 平板端竖屏
   - `lg: 1024px` - 桌面端
   - `xl: 1280px` - 大桌面端
   - `2xl: 1536px` - 超大屏

2. **桌面端布局优化**（≥1024px）
   - 保持现有 Grid 布局（6 列指标卡片）
   - 吞吐量图：8 列
   - 节点矩阵：7 列
   - 所有组件按原样排列

3. **平板端布局适配**（768px-1023px）
   - 指标卡片：3 列 × 2 行（堆叠）
   - 吞吐量图 + 模型分布：6 列（横向）
   - 雷达图 + 性能对比 + 预测图：Tab 切换或 6 列堆叠
   - 节点矩阵 + 操作流：6 列（横向滚动）
   - 使用 `flex-wrap` 或 Grid 切换

4. **移动端布局适配**（<768px）
   - 指标卡片：2 列 × 3 行（垂直堆叠）
   - 图表区域：12 列（可横向滚动）
   - 多图表使用 Tab 切换（雷达图 / 性能对比 / 预测图）
   - 节点矩阵：2 列（垂直堆叠，可展开详情）
   - 操作审计：12 列（表格，横向滚动）
   - 导航栏：汉堡菜单 + 底部导航

5. **触控优化**
   - 最小点击目标：44x44px
   - 触摸手势：滑动切换图表
   - 底部导航：固定位置，易于拇指操作

**输出要求**：
- 更新 `src/styles/theme.css`，添加完整的响应式断点定义
- 修改 `Dashboard.tsx`，实现所有布局适配
- 提供 `src/hooks/useMobileView.ts` Hook（检测移动端视图）
- 更新 `Layout.tsx`，添加汉堡菜单和底部导航

### 任务 3: 接入 Supabase 实现真实数据持久化

**目标**：替代模拟数据，连接真实的 PostgreSQL 数据库实现数据持久化和用户认证。

**具体要求**：

1. **Supabase 项目配置**
   - 项目名称：`yyc3-dashboard-local`
   - 数据库区域：与本地 PostgreSQL 保持一致
   - 启用认证：Email/Password 登录
   - 启用 Realtime：WebSocket 实时订阅

2. **数据库 Schema 对接**
   - 表 `core.models`：模型配置（id, name, provider, tier, avg_latency_ms, throughput）
   - 表 `core.agents`：Agent 配置（id, name, name_cn, role, description）
   - 表 `telemetry.inference_logs`：推理日志（id, model_id, agent_id, latency_ms, status）
   - 使用 pgvector 扩展存储向量数据（可选）

3. **数据查询接口**
   - `getActiveModels()`: 查询活跃模型列表
   - `getRecentLogs(limit)`: 查询最近推理日志（默认 100 条）
   - `getModelStats(modelId)`: 查询模型性能统计（24 小时）
   - `getNodesStatus()`: 查询节点实时状态

4. **用户认证流程**
   - 登录页面：Email + Password 表单
   - Token 持久化：localStorage
   - Session 管理：Supabase Auth Session
   - 登出功能：清除 Token + 重定向

5. **本地数据库连接配置**
   - 备选方案：直接连接本地 PostgreSQL（localhost:5433）
   - 连接池：最大 20 个连接
   - 超时配置：连接 10 秒，空闲 30 秒
   - 降级策略：Supabase 不可用时使用本地直连

**输出要求**：
- 提供 `src/lib/supabaseClient.ts` 客户端封装
- 提供 `src/lib/db-queries.ts` 数据库查询函数
- 创建 `src/app/Login.tsx` 登录页面
- 更新 `Dashboard.tsx` 使用真实数据替代模拟数据

## 设计原则

1. **本地自用优先**
   - 无需考虑多租户隔离
   - 配置硬编码在环境变量（.env.development）
   - 简化用户管理（仅管理员 + 开发者角色）

2. **本地部署优先**
   - 所有服务运行在本地网络（192.168.3.x）
   - 无需考虑 CDN、CDN、云存储
   - WebSocket 端点：ws://localhost:3113/ws

3. **闭环定义**
   - 数据流：前端 → WebSocket → 本地 PostgreSQL → 前端
   - 无外部依赖：不依赖任何云服务 API
   - 故障降级：任何环节故障时，系统仍可运行（模拟数据）

4. **性能优化**
   - 代码分割：按路由懒加载
   - 虚拟化长列表：仅渲染可见节点
   - 节流控制：100ms 限制 UI 更新
   - 图表优化：数据切片（最多 100 点）

5. **视觉一致性**
   - 所有卡片使用统一 GlassCard 组件
   - 所有颜色使用 CSS 变量（--primary, --success, --warning, --error）
   - 所有图标使用 Lucide React
   - 所有图表使用 Recharts

## 输出格式

请以以下格式提供优化方案：

### [任务名称] 优化方案

#### 1. 代码实现
- 提供完整的 TypeScript 代码文件
- 包含详细的代码注释
- 符合现有项目风格

#### 2. 组件更新
- 说明需要修改的现有组件
- 提供修改前后的对比
- 标注关键变更点

#### 3. 配置文件
- 需要添加的环境变量
- 需要更新的配置文件
- Supabase 项目配置指南

#### 4. 测试验证
- 单元测试用例
- 集成测试步骤
- 手动验证清单

## 约束条件

- 必须保持现有的视觉风格（未来科技感，赛博朋克）
- 必须使用 GlassCard 组件实现所有弹窗和子页面
- 必须支持本地数据库直连（Supabase 不可用时的降级）
- 必须实现移动端完整适配（不只是简单的缩放）
- 所有代码必须是 TypeScript，严格类型检查

## 📋 补充说明

- 本地设备认知 ：M4 Max 主节点、iMac 辅助、NAS 数据中心
- Family-π³ 项目经验 ：九层架构、七大智能体、93+ 组件、TypeScript 严格模式
- 当前 UI 现状 ：已实现玻璃效果、未来科技感、核心页面布局
- Figma 回复内容 ：WebSocket 推送、移动端适配、Supabase 集成建议
- 闭环定义 ：本地自用、本地部署、本地数据库、故障降级

请开始优化，按上述 3 个任务依次提供完整实现方案。

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
