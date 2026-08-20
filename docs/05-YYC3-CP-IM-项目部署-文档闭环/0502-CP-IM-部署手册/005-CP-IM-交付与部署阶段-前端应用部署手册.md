---
@file: 005-CP-IM-交付与部署阶段-前端应用部署手册.md
@description: YYC³-CP-IM 前端应用部署手册文档
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-26
@updated: 2026-03-05
@status: published
@tags: [部署手册],[前端部署],[部署手册]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元***
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ CloudPivot Intelli-Matrix - 前端应用部署手册

本文档提供 YYC³ CloudPivot Intelli-Matrix 前端应用的完整部署指南，包括构建配置、部署方式、性能优化和故障排查。

---

## 目录

- [部署概述](#部署概述)
- [环境准备](#环境准备)
- [构建配置](#构建配置)
- [部署方式](#部署方式)
- [静态资源部署](#静态资源部署)
- [CDN 配置](#cdn-配置)
- [性能优化](#性能优化)
- [监控与日志](#监控与日志)
- [故障排查](#故障排查)

---

## 部署概述

### 技术栈

YYC³ CloudPivot Intelli-Matrix 前端应用基于以下技术栈：

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19.2.4 | 前端框架 |
| **TypeScript** | 5.9.3 | 类型系统 |
| **Vite** | 7.3.1 | 构建工具 |
| **TailwindCSS** | 4.2.1 | 样式框架 |
| **React Router** | 7.13.1 | 路由管理 |

### 构建产物

```bash
dist/
├── index.html              # 入口 HTML
├── assets/                 # 静态资源
│   ├── index-[hash].js     # 主入口文件
│   ├── react-vendor-[hash].js    # React 相关依赖
│   ├── mui-vendor-[hash].js       # MUI 相关依赖
│   ├── radix-vendor-[hash].js     # Radix UI 相关依赖
│   ├── charts-vendor-[hash].js    # 图表相关依赖
│   ├── animation-vendor-[hash].js  # 动画相关依赖
│   ├── utils-vendor-[hash].js     # 工具函数相关依赖
│   └── [name]-[hash].[ext]  # 其他静态资源
└── build-info.txt          # 构建信息
```

### 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户访问                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN / 负载均衡                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Web 服务器 (Nginx)                       │
│  - 静态资源服务                                               │
│  - Gzip 压缩                                                 │
│  - 缓存控制                                                   │
│  - SPA 路由处理                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  静态资源存储 (dist/)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 环境准备

### 系统要求

- **Node.js**：v20.x 或更高版本
- **pnpm**：v9.x 或更高版本
- **磁盘空间**：至少 5GB 可用空间
- **网络**：稳定的互联网连接

### 安装依赖

```bash
# 安装 pnpm（如果未安装）
npm install -g pnpm

# 验证安装
node --version
pnpm --version

# 安装项目依赖
pnpm install
```

### 环境变量配置

创建 `.env.production` 文件：

```env
# 应用配置
NODE_ENV=production

# API 配置
VITE_API_URL=https://api.yourdomain.com/api

# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_supabase_anon_key

# WebSocket 配置
VITE_WS_URL=wss://ws.yourdomain.com

# 其他配置
VITE_APP_TITLE=YYC³ CloudPivot Intelli-Matrix
VITE_APP_VERSION=1.0.0
```

---

## 构建配置

### Vite 配置说明

项目使用 Vite 7.3.1 进行构建，主要配置如下：

```typescript
export default defineConfig({
  base: './',  // 相对路径，适配 Electron 和静态部署
  
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,  // 生产环境不生成 sourcemap
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        // 文件命名规则
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // 手动代码分割
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'radix-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
          ],
          'charts-vendor': ['recharts'],
          'animation-vendor': ['motion', '@popperjs/core'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    
    // 生产环境优化
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
      minifyWhitespace: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      keepNames: false,
      target: 'esnext',
    },
  },
  
  // 依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      'recharts',
      'motion',
    ],
  },
})
```

### 构建命令

```bash
# 开发环境构建
pnpm build

# 查看构建分析
pnpm build -- --mode production

# 清理构建缓存后重新构建
rm -rf node_modules/.vite
pnpm build

# 生成构建分析报告
pnpm build -- --mode production --report
```

### 构建输出

构建完成后，`dist/` 目录结构如下：

```
dist/
├── index.html              # 2-5 KB
├── assets/
│   ├── index-[hash].js     # 50-100 KB (主入口)
│   ├── react-vendor-[hash].js    # 200-300 KB
│   ├── mui-vendor-[hash].js       # 150-250 KB
│   ├── radix-vendor-[hash].js     # 100-150 KB
│   ├── charts-vendor-[hash].js    # 80-120 KB
│   ├── animation-vendor-[hash].js  # 50-80 KB
│   ├── utils-vendor-[hash].js     # 30-50 KB
│   └── [name]-[hash].[ext]  # 图片、字体等
└── build-info.txt          # 构建信息
```

---

## 部署方式

### 1. Nginx 静态部署

#### Nginx 配置

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # 启用 Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/yyc3-cloudpivot/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # HTML 文件不缓存
    location ~* \.html$ {
        root /var/www/yyc3-cloudpivot/dist;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA 路由处理
    location / {
        root /var/www/yyc3-cloudpivot/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

#### 部署步骤

```bash
# 1. 构建应用
pnpm build

# 2. 上传到服务器
scp -r dist/* user@server:/var/www/yyc3-cloudpivot/dist/

# 3. 设置权限
ssh user@server
sudo chown -R www-data:www-data /var/www/yyc3-cloudpivot/dist
sudo chmod -R 755 /var/www/yyc3-cloudpivot/dist

# 4. 重启 Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Docker 容器部署

#### Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm 并安装依赖
RUN corepack enable pnpm && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 运行阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### 部署步骤

```bash
# 1. 构建镜像
docker build -t yyc3-cloudpivot:latest .

# 2. 运行容器
docker run -d \
  --name yyc3-cloudpivot \
  -p 80:80 \
  --restart unless-stopped \
  yyc3-cloudpivot:latest

# 3. 验证部署
curl http://localhost
```

### 3. 云平台部署

#### Vercel 部署

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 部署：
```bash
vercel --prod
```

3. 配置 `vercel.json`：
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

#### Netlify 部署

1. 配置 `netlify.toml`：
```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

2. 部署：
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## 静态资源部署

### 资源优化

#### 图片优化

```bash
# 使用 imagemin 优化图片
npm install -g imagemin-cli

# 优化 PNG/JPG 图片
imagemin images/**/*.{png,jpg} --out-dir=dist/assets/images
```

#### 字体优化

```bash
# 使用 fonttools 优化字体
pip install fonttools
pyftsubset font.ttf --text-file=chars.txt --output-file=font-subset.ttf
```

### 资源版本控制

Vite 自动为静态资源添加 hash，实现长期缓存：

```javascript
// 构建后的文件名
index-abc123.js
react-vendor-def456.js
```

### 资源预加载

在 `index.html` 中添加预加载：

```html
<link rel="modulepreload" href="/assets/index-[hash].js">
<link rel="modulepreload" href="/assets/react-vendor-[hash].js">
<link rel="preload" href="/assets/font-[hash].woff2" as="font" type="font/woff2" crossorigin>
```

---

## CDN 配置

### CDN 加速配置

#### 阿里云 CDN

```bash
# 1. 创建 CDN 加速域名
# 2. 配置回源地址为你的服务器
# 3. 配置缓存规则
```

缓存规则配置：

| 资源类型 | 缓存时间 | 规则 |
|----------|----------|------|
| JS/CSS | 1 年 | `/assets/*` |
| 图片/字体 | 1 年 | `/\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/` |
| HTML | 不缓存 | `/*.html` |

#### 腾讯云 CDN

```javascript
// 在 Vite 配置中添加 CDN 基础路径
export default defineConfig({
  base: 'https://cdn.yourdomain.com/',
  // ...
})
```

### CDN 回源策略

```nginx
# Nginx 配置支持 CDN 回源
location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
    root /var/www/yyc3-cloudpivot/dist;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept";
}
```

---

## 性能优化

### 1. 代码分割

项目已配置手动代码分割，将不同依赖打包到不同的 chunk：

```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
  'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
  'radix-vendor': [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-tabs',
    '@radix-ui/react-tooltip',
    '@radix-ui/react-popover',
    '@radix-ui/react-accordion',
  ],
  'charts-vendor': ['recharts'],
  'animation-vendor': ['motion', '@popperjs/core'],
  'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
}
```

### 2. 懒加载

使用 React.lazy 进行路由懒加载：

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('../components/Dashboard'));
const Settings = lazy(() => import('../components/Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
```

### 3. 预加载关键资源

```html
<!-- 预加载关键 CSS -->
<link rel="preload" href="/assets/index-[hash].css" as="style">

<!-- 预加载关键 JS -->
<link rel="modulepreload" href="/assets/index-[hash].js">

<!-- 预加载字体 -->
<link rel="preload" href="/assets/font-[hash].woff2" as="font" type="font/woff2" crossorigin>
```

### 4. Gzip 压缩

Nginx 配置：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
gzip_comp_level 6;
```

### 5. Brotli 压缩

Nginx 配置（需要安装 Brotli 模块）：

```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
```

---

## 监控与日志

### 性能监控

#### Web Vitals 监控

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// 监控 Cumulative Layout Shift (CLS)
onCLS((metric) => {
  console.log('CLS:', metric);
  // 发送到监控服务
});

// 监控 First Input Delay (FID)
onFID((metric) => {
  console.log('FID:', metric);
});

// 监控 First Contentful Paint (FCP)
onFCP((metric) => {
  console.log('FCP:', metric);
});

// 监控 Largest Contentful Paint (LCP)
onLCP((metric) => {
  console.log('LCP:', metric);
});

// 监控 Time to First Byte (TTFB)
onTTFB((metric) => {
  console.log('TTFB:', metric);
});
```

#### 错误监控

```typescript
// 全局错误捕获
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // 发送到错误监控服务
});

// 未捕获的 Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // 发送到错误监控服务
});
```

### 日志管理

#### Nginx 访问日志

```nginx
# 访问日志格式
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for" '
                'rt=$request_time uct="$upstream_connect_time" '
                'uht="$upstream_header_time" urt="$upstream_response_time"';

access_log /var/log/nginx/yyc3-access.log main;
```

#### 错误日志

```nginx
error_log /var/log/nginx/yyc3-error.log warn;
```

---

## 故障排查

### 常见问题

#### 1. 白屏问题

**问题**：页面加载后显示白屏

**解决方案**：

```bash
# 检查浏览器控制台错误
# 检查网络请求是否成功
# 检查 JavaScript 文件是否正确加载

# 常见原因：
# 1. API 地址配置错误
# 2. 路由配置错误
# 3. JavaScript 错误
```

#### 2. 资源 404 错误

**问题**：静态资源返回 404

**解决方案**：

```bash
# 检查 Nginx 配置中的 root 路径
# 检查文件是否正确上传
# 检查文件权限

# Nginx 配置检查
nginx -t
```

#### 3. 路由刷新 404

**问题**：刷新页面后显示 404

**解决方案**：

```nginx
# 确保配置了 SPA 路由处理
location / {
    root /var/www/yyc3-cloudpivot/dist;
    try_files $uri $uri/ /index.html;
}
```

#### 4. 缓存问题

**问题**：更新后用户看到旧版本

**解决方案**：

```nginx
# HTML 文件不缓存
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# 强制刷新缓存
# 在构建时使用不同的文件名（Vite 自动处理）
```

#### 5. 跨域问题

**问题**：API 请求被阻止

**解决方案**：

```nginx
# 配置 CORS
add_header Access-Control-Allow-Origin "*";
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";

# 或在开发环境中配置代理
```

### 性能问题排查

#### 1. 加载速度慢

**排查步骤**：

```bash
# 使用 Lighthouse 分析性能
# 使用 Chrome DevTools 分析网络请求
# 检查资源大小和加载时间
```

#### 2. 内存泄漏

**排查步骤**：

```typescript
// 使用 Chrome DevTools Memory 面板
// 检查堆快照
// 查找未释放的对象
```

#### 3. CPU 占用高

**排查步骤**：

```typescript
// 使用 Chrome DevTools Performance 面板
// 分析 JavaScript 执行时间
// 优化重渲染和计算密集型操作
```

---

## 相关文档

- [Docker 部署手册](001-CP-IM-交付与部署阶段-Docker部署手册.md)
- [Kubernetes 部署手册](002-CP-IM-交付与部署阶段-Kubernetes部署手册.md)
- [CI/CD 流水线配置](001-CP-IM-交付与部署阶段-CI_CD流水线配置.md)
- [性能优化指南](../10-YYC3-CP-IM-项目模版-标准规范/README.md)

---

## 技术支持

如果遇到问题，请通过以下方式获取帮助：

- **GitHub Issues**：https://github.com/YanYuCloudCube/CloudPivot-Intelli-Matrix/issues
- **邮件联系**：admin@0379.email
- **团队沟通**：通过团队内部沟通渠道

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
