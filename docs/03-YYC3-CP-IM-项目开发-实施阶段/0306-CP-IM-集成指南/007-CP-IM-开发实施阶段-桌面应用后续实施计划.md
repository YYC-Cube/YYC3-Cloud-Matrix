---
@file: 007-CP-IM-开发实施阶段-桌面应用后续实施计划.md
@description: YYC³ CloudPivot Intelli-Matrix 桌面应用后续实施计划
@author: YanYuCloudCube Team
@version: 1.0.0
@created: 2026-03-04
@updated: 2026-03-04
@status: pending
@tags: [desktop, electron, implementation, roadmap]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 桌面应用后续实施计划

## 概述

本文档详细说明 YYC³ CloudPivot Intelli-Matrix 桌面应用的后续实施步骤，包括测试、优化、发布等关键环节。

## 实施阶段

### 阶段 1：本地测试验证（优先级：🔴 高）

#### 1.1 功能测试

**目标**：验证桌面应用核心功能正常

**执行步骤：**

```bash
# 1. 运行应用
open dist-electron/mac-arm64/YYC³ CloudPivot.app

# 2. 检查应用进程
ps aux | grep "YYC³ CloudPivot"
```

**测试清单：**

- [ ] 应用正常启动，无白屏/崩溃
- [ ] 窗口尺寸正确（1400×900）
- [ ] 窗口可调整大小（最小 1200×700）
- [ ] macOS 原生标题栏样式正常
- [ ] 系统托盘图标显示
- [ ] 托盘菜单功能正常：
  - [ ] 显示主窗口
  - [ ] 重启应用
  - [ ] 检查更新
  - [ ] 退出应用
- [ ] 单实例锁定生效（双击不启动多个实例）
- [ ] 外部链接在系统浏览器打开
- [ ] 应用退出时托盘图标消失
- [ ] 应用数据持久化正常

**预期时间：** 30 分钟

#### 1.2 兼容性测试

**目标**：验证应用在不同 macOS 版本上的兼容性

**测试环境：**
- macOS 12 (Monterey)
- macOS 13 (Ventura)
- macOS 14 (Sonoma)
- macOS 15 (Sequoia)

**执行步骤：**

```bash
# 检查系统版本
sw_vers

# 查看应用日志
log stream --predicate 'process == "YYC³ CloudPivot"' --level debug
```

**测试清单：**

- [ ] 应用在各版本上正常启动
- [ ] 系统托盘功能正常
- [ ] 窗口动画流畅
- [ ] 无系统权限警告

**预期时间：** 2 小时（需要多台设备或虚拟机）

#### 1.3 性能测试

**目标**：评估应用性能指标

**执行步骤：**

```bash
# 1. 启动时间测试
time open dist-electron/mac-arm64/YYC³ CloudPivot.app

# 2. 内存占用测试
ps aux | grep "YYC³ CloudPivot" | awk '{print $6}'

# 3. CPU 占用测试
top -pid $(pgrep -f "YYC³ CloudPivot") -l 1

# 4. 使用 Instruments 进行详细分析
open -a Instruments
```

**性能指标：**

| 指标 | 目标值 | 实际值 | 状态 |
|------|---------|---------|------|
| 冷启动时间 | < 3s | ___ | ___ |
| 内存占用（空闲） | < 200MB | ___ | ___ |
| 内存占用（运行）| < 500MB | ___ | ___ |
| CPU 占用（空闲） | < 5% | ___ | ___ |
| CPU 占用（运行）| < 20% | ___ | ___ |

**预期时间：** 1 小时

---

### 阶段 2：代码签名配置（优先级：🟡 中）

#### 2.1 准备 Apple Developer 证书

**目标**：获取代码签名所需的证书

**执行步骤：**

1. **注册 Apple Developer 账号**
   - 访问：https://developer.apple.com/
   - 注册账号（$99/年）
   - 完成身份验证

2. **创建证书**
   ```
   Xcode → Preferences → Accounts → 选择账号 → Manage Certificates
   → + → Developer ID Application → 创建证书
   ```

3. **导出证书**
   ```bash
   # 查看可用证书
   security find-identity -v -p codesigning

   # 输出示例：
   # 1) 1234567890ABCDEF01234567890ABCDEF01234567890ABCDEF01 "Developer ID Application: Your Name (TEAMID)"
   ```

**预期时间：** 1 小时

#### 2.2 配置代码签名

**目标**：在构建流程中集成代码签名

**执行步骤：**

1. **更新 package.json**

```json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "resources/entitlements.mac.plist",
      "entitlementsInherit": "resources/entitlements.mac.plist",
      "identity": "Developer ID Application: Your Name (TEAMID)"
    }
  }
}
```

2. **创建权限文件**

创建 `resources/entitlements.mac.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
</dict>
</plist>
```

3. **测试签名**

```bash
# 手动签名测试
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAMID)" \
  dist-electron/mac-arm64/YYC³ CloudPivot.app

# 验证签名
codesign -dv dist-electron/mac-arm64/YYC³ CloudPivot.app
```

**预期时间：** 30 分钟

#### 2.3 公证（Notarization）

**目标**：通过 Apple 公证，避免用户安装时的安全警告

**执行步骤：**

```bash
# 1. 上传应用进行公证
xcrun notarytool submit dist-electron/YYC³ CloudPivot-1.0.0-mac-arm64.dmg \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAMID" \
  --wait

# 2. 装订公证票据
xcrun stapler staple dist-electron/YYC³ CloudPivot-1.0.0-mac-arm64.dmg

# 3. 验证公证
xcrun stapler validate dist-electron/YYC³ CloudPivot-1.0.0-mac-arm64.dmg
```

**预期时间：** 30 分钟（等待公证）

---

### 阶段 3：自动更新配置（优先级：🟡 中）

#### 3.1 配置 GitHub 发布

**目标**：设置自动更新服务器

**执行步骤：**

1. **创建 GitHub Release**

```bash
# 1. 创建 GitHub Token
# Settings → Developer settings → Personal access tokens → Generate new token
# 权限：repo, workflow

# 2. 配置环境变量
echo "GH_TOKEN=your_token_here" >> .env

# 3. 发布版本
gh release create v1.0.0 \
  --title "YYC³ CloudPivot v1.0.0" \
  --notes "Initial release" \
  dist-electron/YYC³ CloudPivot-1.0.0-mac-arm64.dmg \
  dist-electron/YYC³ CloudPivot-1.0.0-mac-x64.dmg
```

2. **更新 package.json**

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "YanYuCloudCube",
      "repo": "CloudPivot-Intelli-Matrix",
      "private": false
    }
  },
  "scripts": {
    "release": "electron-builder --publish always"
  }
}
```

3. **实现自动更新逻辑**

在 `electron/main.ts` 中添加：

```typescript
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

app.whenReady().then(() => {
  // 检查更新
  autoUpdater.checkForUpdatesAndNotify();

  // 监听更新事件
  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    // 通知用户
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    // 提示用户重启
  });
});
```

**预期时间：** 1 小时

#### 3.2 测试自动更新

**目标**：验证自动更新功能正常

**执行步骤：**

1. **发布测试版本**

```bash
# 发布 v1.0.1
pnpm run release
```

2. **测试更新流程**

```bash
# 运行旧版本
open dist-electron/mac-arm64/YYC³ CloudPivot.app

# 检查日志
tail -f ~/Library/Logs/YYC³ CloudPivot/main.log
```

**测试清单：**

- [ ] 应用启动时检查更新
- [ ] 发现更新时通知用户
- [ ] 下载进度显示正常
- [ ] 下载完成后提示重启
- [ ] 重启后应用更新成功
- [ ] 版本号正确更新

**预期时间：** 1 小时

---

### 阶段 4：性能优化（优先级：🟢 低）

#### 4.1 包大小优化

**目标**：减少安装包大小

**当前状态：**
- macOS ARM64: 202 MB
- macOS x64: 616 MB

**优化方案：**

1. **移除未使用的依赖**

```bash
# 分析依赖
pnpm ls --depth=0

# 移除未使用的包
pnpm remove <unused-package>
```

2. **优化代码分割**

更新 `vite.config.ts`：

```typescript
manualChunks: {
  'react-core': ['react', 'react-dom'],
  'react-router': ['react-router', 'react-router-dom'],
  'ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  'charts': ['recharts'],
  'utils': ['date-fns', 'clsx', 'tailwind-merge']
}
```

3. **启用压缩**

```json
{
  "build": {
    "compression": "maximum"
  }
}
```

**目标：**
- macOS ARM64: < 150 MB
- macOS x64: < 400 MB

**预期时间：** 2 小时

#### 4.2 启动速度优化

**目标**：减少冷启动时间

**优化方案：**

1. **延迟加载非关键模块**

```typescript
// 懒加载图表组件
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));
```

2. **优化预加载脚本**

```typescript
// electron/preload.ts
// 只暴露必要的 API
contextBridge.exposeInMainWorld('yyc3', {
  openExternal: shell.openExternal,
  getVersion: () => process.versions.electron
});
```

3. **启用缓存**

```typescript
// electron/main.ts
app.commandLine.appendSwitch('disk-cache-dir', path.join(app.getPath('userData'), 'cache'));
```

**目标：**
- 冷启动时间: < 2s

**预期时间：** 3 小时

#### 4.3 内存优化

**目标**：减少运行时内存占用

**优化方案：**

1. **优化数据结构**

```typescript
// 使用更高效的数据结构
// 避免：Array.filter().map()
// 推荐：Array.reduce()
```

2. **清理未使用的资源**

```bash
# 分析资源使用
npx @squoosh/cli

# 压缩图片
pnpm add -D vite-plugin-imagemin
```

3. **启用垃圾回收**

```typescript
// 定期触发垃圾回收
setInterval(() => {
  if (global.gc) global.gc();
}, 300000); // 5 分钟
```

**目标：**
- 空闲内存: < 150 MB
- 运行内存: < 400 MB

**预期时间：** 2 小时

---

### 阶段 5：多平台支持（优先级：🟢 低）

#### 5.1 Windows 支持

**目标**：构建 Windows 版本

**执行步骤：**

```bash
# 1. 安装 Windows 依赖
pnpm add -D @electron/windows-sign

# 2. 构建 Windows 版本
pnpm run build:win

# 3. 在 Windows 上测试
# 使用虚拟机或远程桌面
```

**预期时间：** 4 小时

#### 5.2 Linux 支持

**目标**：构建 Linux 版本

**执行步骤：**

```bash
# 1. 构建 Linux 版本
pnpm run build:linux

# 2. 测试 AppImage
chmod +x dist-electron/YYC³ CloudPivot-1.0.0-linux-x64.AppImage
./dist-electron/YYC³ CloudPivot-1.0.0-linux-x64.AppImage

# 3. 测试 DEB 包
sudo dpkg -i dist-electron/YYC³ CloudPivot-1.0.0-linux-amd64.deb
```

**预期时间：** 2 小时

---

## 实施时间表

| 阶段 | 任务 | 预计时间 | 优先级 | 状态 |
|------|------|----------|--------|
| 1.1 | 功能测试 | 30 分钟 | 🔴 高 | ⏳ 待开始 |
| 1.2 | 兼容性测试 | 2 小时 | 🔴 高 | ⏳ 待开始 |
| 1.3 | 性能测试 | 1 小时 | 🔴 高 | ⏳ 待开始 |
| 2.1 | 准备证书 | 1 小时 | 🟡 中 | ⏳ 待开始 |
| 2.2 | 配置签名 | 30 分钟 | 🟡 中 | ⏳ 待开始 |
| 2.3 | 公证 | 30 分钟 | 🟡 中 | ⏳ 待开始 |
| 3.1 | 配置自动更新 | 1 小时 | 🟡 中 | ⏳ 待开始 |
| 3.2 | 测试自动更新 | 1 小时 | 🟡 中 | ⏳ 待开始 |
| 4.1 | 包大小优化 | 2 小时 | 🟢 低 | ⏳ 待开始 |
| 4.2 | 启动速度优化 | 3 小时 | 🟢 低 | ⏳ 待开始 |
| 4.3 | 内存优化 | 2 小时 | 🟢 低 | ⏳ 待开始 |
| 5.1 | Windows 支持 | 4 小时 | 🟢 低 | ⏳ 待开始 |
| 5.2 | Linux 支持 | 2 小时 | 🟢 低 | ⏳ 待开始 |

**总计：** 约 20 小时

---

## 快速开始指南

### 立即执行（今天）

```bash
# 1. 功能测试
open dist-electron/mac-arm64/YYC³ CloudPivot.app

# 2. 检查功能清单
# 参考 1.1 节的测试清单

# 3. 记录问题
# 创建 GitHub Issue 记录发现的问题
```

### 本周完成

```bash
# 1. 性能测试
time open dist-electron/mac-arm64/YYC³ CloudPivot.app
ps aux | grep "YYC³ CloudPivot"

# 2. 兼容性测试
# 在不同 macOS 版本上测试

# 3. 准备发布
# 更新 CHANGELOG.md
# 准备发布说明
```

### 下月规划

- [ ] 配置代码签名
- [ ] 设置自动更新
- [ ] 性能优化
- [ ] 多平台支持

---

## 附录

### A. 测试报告模板

```markdown
# 桌面应用测试报告

**测试日期：** YYYY-MM-DD
**测试人员：** Your Name
**应用版本：** v1.0.0
**测试环境：** macOS 15 (ARM64)

## 功能测试

| 功能 | 预期结果 | 实际结果 | 状态 |
|------|----------|----------|------|
| 应用启动 | 正常启动 | ___ | ___ |
| 窗口管理 | 1400×900 | ___ | ___ |
| 系统托盘 | 显示图标 | ___ | ___ |

## 性能测试

| 指标 | 目标值 | 实际值 | 状态 |
|------|---------|---------|------|
| 启动时间 | < 3s | ___ | ___ |
| 内存占用 | < 200MB | ___ | ___ |

## 发现的问题

1. [问题描述]
   - 复现步骤：
   - 预期行为：
   - 实际行为：
```

### B. 发布检查清单

```markdown
# 发布前检查清单

## 代码质量
- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 无已知严重 bug

## 文档
- [ ] CHANGELOG.md 更新
- [ ] README.md 更新
- [ ] 发布说明准备

## 构建配置
- [ ] 版本号更新
- [ ] 构建脚本测试
- [ ] 代码签名配置

## 发布渠道
- [ ] GitHub Release 准备
- [ ] 自动更新配置
- [ ] 发布说明发布
```

### C. 相关文档

- [桌面应用封装操作指南](./006-CP-IM-开发实施阶段-桌面应用封装操作指南.md)
- [开发环境配置](../../03-YYC³-CP-IM-开发实施阶段/0301-CP-IM-开发环境/002-CP-IM-开发实施阶段-多环境配置规范.md)
- [接口集成指南](./001-CP-IM-开发实施阶段-前后端联调手册.md)

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
