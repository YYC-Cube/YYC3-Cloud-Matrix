/**
 * @file: vite.config.ts
 * @description: Vite 配置文件 · 包含构建、插件、别名等配置
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-02-26
 * @updated: 2026-03-05
 * @status: active
 * @tags: [config],[build],[vite]
 *
 * @brief: Vite 构建配置
 *
 * @details:
 * - 基础路径配置（./ 用于 Electron 兼容）
 * - 插件配置（React + TailwindCSS）
 * - 路径别名（@/* → ./src/*）
 * - 开发服务器配置（端口 3218）
 * - 构建优化（代码分割、压缩）
 *
 * @dependencies: Vite, React, TailwindCSS
 * @exports: default config
 * @notes: 修改配置后需要重启开发服务器
 */

import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3218,
    host: true,
    proxy: {
      '/api/v1/llm/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/llm\/ollama/, '/api'),
        configure: (proxy) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[ollama-proxy] Ollama 服务未启动或不可达:', err.message);
          });
        },
      },
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@mui')) {
              return 'mui-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('recharts')) {
              return 'recharts-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-vendor';
            }
            if (id.includes('motion')) {
              return 'motion-vendor';
            }
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
  },
})
