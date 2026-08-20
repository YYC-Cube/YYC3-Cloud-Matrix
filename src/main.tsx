/**
 * @file: main.tsx
 * @description: React 应用入口文件 · 初始化根组件和全局样式
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-09
 * @status: active
 * @tags: [entry],[react],[root]
 *
 * @brief: React 应用入口点
 *
 * @details:
 * - 创建 React 根节点
 * - 挂载 App 组件
 * - 引入全局样式
 * - 启用严格模式
 *
 * @dependencies: React, ReactDOM
 * @exports: -
 * @notes: 不要在此文件添加业务逻辑
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
