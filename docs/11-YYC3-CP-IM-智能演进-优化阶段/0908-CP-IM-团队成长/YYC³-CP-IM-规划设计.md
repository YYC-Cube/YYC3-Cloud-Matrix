---
@file: CP-IM-RES-DOC-001.md
@description: YYC³-CP-IM 开发规划，本地多端推理矩阵数据看盘补充功能
@author: YanYuCloudCube Team
@version: v2.0.0
@created: 2026-02-26
@updated: 2026-02-26
@status: published
@tags: [09-YYC³-CP-IM-开发文档],[0908-CP-IM-设计规划],[预矩阵看盘]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ 本地多端推理矩阵数据看盘补充功能

## 📱 网络板块+PWA板块实现

---

### 任务 4 + 任务 5: 网络连接配置 + PWA 完整设计

**目标**：实现网络连接配置功能和 PWA（Progressive Web App）完整支持，打造可安装、离线可用的桌面级应用。

---

## 📋 第一部分：网络连接配置功能

### 1.1 网络连接弹窗设计

```
┌─────────────────────────────────────────────────────────────┐
│  [网络连接配置]                          [× 关闭]    │
├─────────────────────────────────────────────────────────────┤
│                                                      │
│  连接方式                                              │
│  ┌────────────┬────────────┬────────────┐        │
│  │ 自动检测    │ WiFi 配置  │ 手动配置  │        │
│  └────────────┴────────────┴────────────┘        │
│                                                      │
│  自动检测 (WebRTC)                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 本机 IP: 192.168.3.45                          │   │
│  │ 网络接口: en0 (有线以太网)                 │   │
│  │ [刷新检测]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                      │
│  手动配置                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 服务器地址: [192.168.3.45_______________]    │   │
│  │ 端口: [3113____]                           │   │
│  │ NAS 地址: [192.168.3.45:9898___________]     │   │
│  │ WebSocket: [ws://192.168.3.45:3113/ws____]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                      │
│  [测试连接]  [保存配置]                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 具体要求

1. **网络连接弹窗**
   - 使用 `ui/dialog.tsx` 或 `ui/sheet.tsx` 组件
   - 支持 3 种配置方式：自动检测、WiFi 配置、手动配置
   - 统一的玻璃效果（backdrop-blur-xl，70% 透明度）

2. **自动检测功能**
   - 使用 WebRTC 获取本机 IP 地址
   - 使用 `navigator.connection` 检测网络类型（WiFi/以太网）
   - 显示网络接口列表（en0, en1, wlan0 等）
   - 刷新按钮：重新检测网络状态

3. **手动配置功能**
   - 服务器地址输入框（默认：192.168.3.45）
   - 端口输入框（默认：3113）
   - NAS 地址输入框（默认：192.168.3.45:9898）
   - WebSocket URL 自动生成（基于服务器地址和端口）
   - 验证按钮：测试连接是否可用

4. **配置持久化**
   - 保存到 `localStorage`：`network_config` 键
   - 启动时自动读取配置
   - 提供重置为默认值功能

5. **连接测试逻辑**
   - 发送 WebSocket 握手请求验证连接
   - 显示连接状态：连接中、成功、失败
   - 失败时显示具体错误信息（超时、拒绝、网络不可达）

### 1.3 技术实现

```typescript
// WebRTC 获取本机 IP
const getLocalIP = async (): Promise<string> => {
  const pc = new RTCPeerConnection({
    iceServers: []  // 使用 STUN 服务器
  });
  const dataChannel = pc.createDataChannel('test');
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  
  const regex = /c=IN IP4 (\d+\.\d+\.\d+)/;
  const match = offer.sdp.match(regex);
  return match ? match[1] : '127.0.0.1';
};

// 网络接口检测
const getNetworkInterfaces = async (): Promise<NetworkInterface[]> => {
  const ip = await getLocalIP();
  const connection = navigator.connection;
  const type = connection?.effectiveType || 'unknown';
  
  return [{
    name: type === 'wifi' ? 'wlan0' : 'en0',
    type: type,
    ip: ip,
    status: 'active'
  }];
};
```

### 1.4 输出要求
- 提供 `src/app/components/NetworkConfig.tsx` 完整组件
- 提供 `src/hooks/useNetworkConfig.ts` Hook
- 更新 `SystemSettings.tsx`，添加"网络连接"配置卡片
- 提供 `src/lib/network-utils.ts` 工具函数

---

## 📱 第二部分：PWA 完整设计

### 2.1 PWA 功能清单

```
┌─────────────────────────────────────────────────────────────┐
│  PWA 功能矩阵                                              │
├─────────────────────────────────────────────────────────────┤
│                                                      │
│  ✅ 核心功能                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Service Worker: 完整实现                           │   │
│  │ Manifest 配置: 完整实现                            │   │
│  │ 离线缓存: 核心资源预缓存                           │   │
│  │ 添加到主屏幕: iOS + Android                       │   │
│  │ 安装提示: 横幅 + 内置按钮                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                      │
│  ✅ 高级功能                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 后台同步: 数据定期同步                             │   │
│  │ 推送通知: 告警通知推送                             │   │
│  │ 离线模式: 完整离线可用                             │   │
│  │ 数据持久化: IndexedDB 本地存储                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                      │
│  ✅ 性能优化                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 资源预加载: 关键资源预缓存                          │   │
│  │ 懒加载: 非关键资源延迟加载                          │   │
│  │ 缓存策略: Stale-While-Revalidate                  │   │
│  │ 更新机制: 后台静默更新                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Manifest 配置

```json
{
  "name": "YYC³ 本地多端推理矩阵数据库数据看盘",
  "short_name": "YYC³ Dashboard",
  "description": "YYC³ 本地多端推理矩阵数据库数据看盘，实时监控 AI 推理性能",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#060e1f",
  "theme_color": "#00d4ff",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "数据监控",
      "short_name": "监控",
      "description": "查看实时数据监控",
      "url": "/dashboard",
      "icons": [
        {
          "src": "/icons/shortcut-dashboard.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "操作审计",
      "short_name": "审计",
      "description": "查看操作审计日志",
      "url": "/audit",
      "icons": [
        {
          "src": "/icons/shortcut-audit.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "用户管理",
      "short_name": "用户",
      "description": "管理用户和权限",
      "url": "/users",
      "icons": [
        {
          "src": "/icons/shortcut-users.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "系统设置",
      "short_name": "设置",
      "description": "系统配置管理",
      "url": "/settings",
      "icons": [
        {
          "src": "/icons/shortcut-settings.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "categories": ["productivity", "utilities", "developer"],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### 2.3 Service Worker 实现

```typescript
// sw.ts
const CACHE_NAME = 'yyc3-dashboard-v1';
const RUNTIME_CACHE = 'yyc3-dashboard-runtime';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 激活新 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求
  if (request.method !== 'GET') return;

  // 跳过 WebSocket 请求
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;

  // 跳过本地数据库请求
  if (url.pathname.startsWith('/api/')) return;

  // 资源请求：Cache-First 策略
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2|ttf)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML 请求：Network-First 策略
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirst(request));
    return;
  }

  // API 请求：Network-First + 离线回退
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // 其他请求：Stale-While-Revalidate 策略
  event.respondWith(staleWhileRevalidate(request));
});

// Cache-First 策略
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  return cached || fetch(request);
}

// Network-First 策略
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    return cached;
  }
}

// Network-First + 离线回退
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // 返回离线页面
    return new Response(
      JSON.stringify({ error: 'Offline', message: '网络不可用，请检查连接' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Stale-While-Revalidate 策略
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });
  
  return cached || fetchPromise;
}
```

### 2.4 离线模式实现

```typescript
// src/hooks/useOfflineMode.ts
import { useState, useEffect } from 'react';

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      saveOfflineData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = () => {
    // 保存当前状态到 IndexedDB
    const state = localStorage.getItem('dashboard_state');
    localStorage.setItem('offline_state', state);
  };

  const syncOfflineData = async () => {
    const offlineState = localStorage.getItem('offline_state');
    if (offlineState) {
      // 上传离线数据到服务器
      await fetch('/api/sync', {
        method: 'POST',
        body: offlineState,
      });
      setLastSyncTime(new Date());
    }
  };

  return { isOnline, lastSyncTime };
}
```

### 2.5 安装提示实现

```typescript
// src/hooks/useInstallPrompt.ts
import { useState, useEffect } from 'react';

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 检查是否已安装
    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;

    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return { isInstalled, canInstall: !!deferredPrompt, promptInstall };
}
```

### 2.6 推送通知实现

```typescript
// src/hooks/usePushNotifications.ts
import { useState, useEffect } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY',
    });

    setSubscription(sub);
    
    // 发送订阅信息到服务器
    await fetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(sub),
    });

    return sub;
  };

  const showNotification = (title: string, options: NotificationOptions = {}) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });
    }
  };

  return { permission, subscription, requestPermission, subscribe, showNotification };
}
```

### 2.7 后台同步实现

```typescript
// src/lib/backgroundSync.ts
export async function registerBackgroundSync() {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-data');
}

// sw.ts 添加后台同步处理
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  const offlineData = await getOfflineData();
  await fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify(offlineData),
  });
}
```

### 2.8 PWA UI 组件

```typescript
// src/app/components/PWAInstallPrompt.tsx
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';

export function PWAInstallPrompt() {
  const { isInstalled, canInstall, promptInstall } = useInstallPrompt();

  if (isInstalled || !canInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={promptInstall} size="lg">
        <Download className="mr-2 h-5 w-5" />
        安装到桌面
      </Button>
    </div>
  );
}

// src/app/components/OfflineIndicator.tsx
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline, lastSyncTime } = useOfflineMode();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 px-4 py-2 bg-black/80 backdrop-blur-xl rounded-lg">
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-500">已连接</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-500">离线模式</span>
          </>
        )}
        {lastSyncTime && !isOnline && (
          <span className="text-xs text-gray-400">
            上次同步: {lastSyncTime.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
```

### 2.9 PWA 配置文件

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/*.png',
        'screenshots/*.png',
      ],
      manifest: {
        name: 'YYC³ 本地多端推理矩阵数据库数据看盘',
        short_name: 'YYC³ Dashboard',
        description: 'YYC³ 本地多端推理矩阵数据库数据看盘，实时监控 AI 推理性能',
        theme_color: '#00d4ff',
        background_color: '#060e1f',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/192\.168\.3\.\d+:3113\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
```

### 2.10 输出要求

#### 网络连接配置：
- 提供 `src/app/components/NetworkConfig.tsx` 完整组件
- 提供 `src/hooks/useNetworkConfig.ts` Hook
- 更新 `SystemSettings.tsx`，添加"网络连接"配置卡片
- 提供 `src/lib/network-utils.ts` 工具函数

#### PWA 完整设计：
- 提供 `public/manifest.json` 配置文件
- 提供 `public/sw.ts` Service Worker 实现
- 提供 `src/hooks/useOfflineMode.ts` Hook
- 提供 `src/hooks/useInstallPrompt.ts` Hook
- 提供 `src/hooks/usePushNotifications.ts` Hook
- 提供 `src/lib/backgroundSync.ts` 工具函数
- 提供 `src/app/components/PWAInstallPrompt.tsx` 组件
- 提供 `src/app/components/OfflineIndicator.tsx` 组件
- 更新 `vite.config.ts`，添加 VitePWA 插件配置
- 更新 `index.html`，添加 PWA meta 标签

---

## 🎯 设计原则

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
   - 故障降级：任何环节故障时，系统仍可运行（离线模式）

4. **PWA 优先**
   - 可安装到桌面，提供原生应用体验
   - 离线可用，核心功能不依赖网络
   - 后台同步，恢复网络后自动同步数据
   - 推送通知，实时告警提醒

5. **性能优化**
   - 代码分割：按路由懒加载
   - 虚拟化长列表：仅渲染可见节点
   - 节流控制：100ms 限制 UI 更新
   - 图表优化：数据切片（最多 100 点）
   - Service Worker 预缓存：核心资源提前缓存

6. **视觉一致性**
   - 所有卡片使用统一 GlassCard 组件
   - 所有颜色使用 CSS 变量（--primary, --success, --warning, --error）
   - 所有图标使用 Lucide React
   - 所有图表使用 Recharts

---

## 📋 约束条件

- 必须保持现有的视觉风格（未来科技感，赛博朋克）
- 必须使用 GlassCard 组件实现所有弹窗和子页面
- 必须支持本地数据库直连（Supabase 不可用时的降级）
- 必须实现移动端完整适配（不只是简单的缩放）
- 所有代码必须是 TypeScript，严格类型检查
- PWA 必须支持离线模式，核心功能不依赖网络
- PWA 必须支持添加到主屏幕（iOS + Android）
- PWA 必须支持后台同步，恢复网络后自动同步数据

---

**请开始优化，按上述 4+5 合并任务提供完整实现方案。**
---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
