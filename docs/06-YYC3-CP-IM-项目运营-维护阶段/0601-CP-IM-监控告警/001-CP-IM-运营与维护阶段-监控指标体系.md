---
@file: 001-CP-IM-运营与维护阶段-监控指标体系.md
@description: YYC³-CP-IM 监控指标体系文档
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-26
@updated: 2026-03-05
@status: published
@tags: [监控告警],[监控指标],[指标体系]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元***
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ CloudPivot Intelli-Matrix - 监控指标体系

本文档提供 YYC³ CloudPivot Intelli-Matrix 项目的完整监控指标体系，包括基础设施、应用性能、业务指标和告警规则。

---

## 目录

- [监控体系概述](#监控体系概述)
- [基础设施监控](#基础设施监控)
- [应用性能监控](#应用性能监控)
- [业务指标监控](#业务指标监控)
- [告警规则](#告警规则)
- [监控面板](#监控面板)

---

## 监控体系概述

### 监控架构

```
┌─────────────────────────────────────────────────────────────┐
│                        应用层                               │
│  - React 前端应用                                            │
│  - Electron 桌面应用                                         │
│  - WebSocket 实时通信                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      中间件层                                │
│  - Nginx 反向代理                                           │
│  - Docker 容器                                             │
│  - Prometheus 数据收集                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      基础设施层                              │
│  - 服务器资源 (CPU, 内存, 磁盘, 网络)                         │
│  - 数据库 (Supabase PostgreSQL)                              │
│  - CDN 加速                                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      可视化层                                │
│  - Grafana 监控面板                                          │
│  - 告警通知                                                 │
│  - 日志分析                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 监控工具栈

| 工具 | 用途 | 版本 |
|------|------|------|
| **Prometheus** | 数据收集和存储 | latest |
| **Grafana** | 数据可视化和告警 | latest |
| **cAdvisor** | 容器监控 | latest |
| **Node Exporter** | 服务器指标 | latest |
| **Nginx Exporter** | Nginx 指标 | latest |

### 监控指标分类

```
监控指标
├── 基础设施指标
│   ├── 服务器资源
│   ├── 容器资源
│   └── 网络流量
├── 应用性能指标
│   ├── 前端性能
│   ├── 后端性能
│   └── 数据库性能
├── 业务指标
│   ├── 用户行为
│   ├── 功能使用
│   └── 业务数据
└── 告警指标
    ├── 系统告警
    ├── 应用告警
    └── 业务告警
```

---

## 基础设施监控

### 服务器资源监控

#### CPU 使用率

**指标名称**：`node_cpu_seconds_total`

**PromQL 查询**：

```promql
# CPU 使用率
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# CPU 核心数
count by(instance) (node_cpu_seconds_total{mode="idle"})

# CPU 负载
node_load1
node_load5
node_load15
```

**告警规则**：

```yaml
- alert: HighCPUUsage
  expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High CPU usage on {{ $labels.instance }}"
    description: "CPU usage is above 80% for 5 minutes"
```

#### 内存使用率

**指标名称**：`node_memory_MemAvailable_bytes`

**PromQL 查询**：

```promql
# 内存使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 内存使用量
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes

# 交换分区使用率
(1 - (node_memory_SwapFree_bytes / node_memory_SwapTotal_bytes)) * 100
```

**告警规则**：

```yaml
- alert: HighMemoryUsage
  expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High memory usage on {{ $labels.instance }}"
    description: "Memory usage is above 85% for 5 minutes"
```

#### 磁盘使用率

**指标名称**：`node_filesystem_size_bytes`

**PromQL 查询**：

```promql
# 磁盘使用率
(1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"})) * 100

# 磁盘 I/O
rate(node_disk_io_time_seconds_total[5m])
rate(node_disk_read_bytes_total[5m])
rate(node_disk_written_bytes_total[5m])
```

**告警规则**：

```yaml
- alert: HighDiskUsage
  expr: (1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"})) * 100 > 80
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "High disk usage on {{ $labels.instance }}"
    description: "Disk usage is above 80% for 10 minutes"
```

#### 网络流量

**指标名称**：`node_network_receive_bytes_total`

**PromQL 查询**：

```promql
# 网络接收速率
rate(node_network_receive_bytes_total[5m])

# 网络发送速率
rate(node_network_transmit_bytes_total[5m])

# 网络错误率
rate(node_network_receive_errs_total[5m])
rate(node_network_transmit_errs_total[5m])
```

### 容器监控

#### 容器资源使用

**指标名称**：`container_cpu_usage_seconds_total`

**PromQL 查询**：

```promql
# 容器 CPU 使用率
rate(container_cpu_usage_seconds_total{name="yyc3-cpim-app"}[5m]) * 100

# 容器内存使用量
container_memory_usage_bytes{name="yyc3-cpim-app"}
container_memory_max_usage_bytes{name="yyc3-cpim-app"}

# 容器网络流量
rate(container_network_receive_bytes_total{name="yyc3-cpim-app"}[5m])
rate(container_network_transmit_bytes_total{name="yyc3-cpim-app"}[5m])
```

#### 容器状态

**PromQL 查询**：

```promql
# 容器运行状态
up{job="docker"}

# 容器重启次数
increase(container_restart_count{name="yyc3-cpim-app"}[1h])
```

**告警规则**：

```yaml
- alert: ContainerDown
  expr: up{job="docker", name="yyc3-cpim-app"} == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Container {{ $labels.name }} is down"
    description: "Container has been down for 1 minute"
```

### Nginx 监控

#### Nginx 性能指标

**指标名称**：`nginx_http_requests_total`

**PromQL 查询**：

```promql
# 请求速率
rate(nginx_http_requests_total[5m])

# 响应时间
histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket[5m]))

# 连接数
nginx_connections_active
nginx_connections_reading
nginx_connections_writing
nginx_connections_waiting

# 错误率
rate(nginx_http_requests_total{status=~"5.."}[5m]) / rate(nginx_http_requests_total[5m])
```

**告警规则**：

```yaml
- alert: HighErrorRate
  expr: rate(nginx_http_requests_total{status=~"5.."}[5m]) / rate(nginx_http_requests_total[5m]) > 0.05
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High error rate on Nginx"
    description: "Error rate is above 5% for 5 minutes"
```

---

## 应用性能监控

### 前端性能监控

#### Web Vitals

**指标名称**：`web_vital_*`

**PromQL 查询**：

```promql
# LCP (Largest Contentful Paint)
histogram_quantile(0.95, rate(web_vital_lcp_seconds_bucket[5m]))

# FID (First Input Delay)
histogram_quantile(0.95, rate(web_vital_fid_seconds_bucket[5m]))

# CLS (Cumulative Layout Shift)
histogram_quantile(0.95, rate(web_vital_cls_bucket[5m]))

# FCP (First Contentful Paint)
histogram_quantile(0.95, rate(web_vital_fcp_seconds_bucket[5m]))

# TTFB (Time to First Byte)
histogram_quantile(0.95, rate(web_vital_ttfb_seconds_bucket[5m]))
```

**告警规则**：

```yaml
- alert: SlowLCP
  expr: histogram_quantile(0.95, rate(web_vital_lcp_seconds_bucket[5m])) > 2.5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Slow LCP detected"
    description: "95th percentile LCP is above 2.5s"
```

#### 页面加载性能

**PromQL 查询**：

```promql
# 页面加载时间
histogram_quantile(0.95, rate(page_load_time_seconds_bucket[5m]))

# 首次渲染时间
histogram_quantile(0.95, rate(first_paint_seconds_bucket[5m]))

# 资源加载时间
histogram_quantile(0.95, rate(resource_load_time_seconds_bucket[5m]))
```

### 后端性能监控

#### API 响应时间

**指标名称**：`api_request_duration_seconds`

**PromQL 查询**：

```promql
# API 平均响应时间
rate(api_request_duration_seconds_sum[5m]) / rate(api_request_duration_seconds_count[5m])

# API P95 响应时间
histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))

# API P99 响应时间
histogram_quantile(0.99, rate(api_request_duration_seconds_bucket[5m]))

# API 错误率
rate(api_requests_total{status=~"5.."}[5m]) / rate(api_requests_total[5m])
```

**告警规则**：

```yaml
- alert: SlowAPIResponse
  expr: histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m])) > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Slow API response detected"
    description: "95th percentile API response time is above 1s"
```

#### WebSocket 连接监控

**指标名称**：`websocket_connections_total`

**PromQL 查询**：

```promql
# WebSocket 连接数
websocket_connections_active

# WebSocket 消息速率
rate(websocket_messages_sent_total[5m])
rate(websocket_messages_received_total[5m])

# WebSocket 错误率
rate(websocket_errors_total[5m])
```

### 数据库性能监控

#### PostgreSQL 监控

**指标名称**：`pg_stat_database_*`

**PromQL 查询**：

```promql
# 数据库连接数
pg_stat_database_numbackends

# 查询速率
rate(pg_stat_statements_calls_total[5m])

# 查询平均执行时间
rate(pg_stat_statements_total_exec_time_ms[5m]) / rate(pg_stat_statements_calls_total[5m])

# 缓存命中率
sum(pg_stat_database_blks_hit) / (sum(pg_stat_database_blks_hit) + sum(pg_stat_database_blks_read))

# 事务速率
rate(pg_stat_database_xact_commit[5m])
rate(pg_stat_database_xact_rollback[5m])
```

**告警规则**：

```yaml
- alert: HighDBConnections
  expr: pg_stat_database_numbackends > 80
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High database connections"
    description: "Database connections are above 80"
```

---

## 业务指标监控

### 用户行为监控

#### 用户活跃度

**PromQL 查询**：

```promql
# 日活跃用户数
count(increase(user_sessions_total[1d]))

# 周活跃用户数
count(increase(user_sessions_total[7d]))

# 月活跃用户数
count(increase(user_sessions_total[30d]))

# 用户留存率
increase(user_sessions_total[7d]) / increase(user_sessions_total[1d])
```

#### 用户会话

**PromQL 查询**：

```promql
# 会话持续时间
histogram_quantile(0.95, rate(session_duration_seconds_bucket[5m]))

# 会话跳出率
rate(session_bounces_total[5m]) / rate(session_starts_total[5m])

# 页面浏览量
rate(page_views_total[5m])
```

### 功能使用监控

#### 功能使用率

**PromQL 查询**：

```promql
# 功能使用次数
increase(feature_usage_total{feature="dashboard"}[1d])

# 功能使用率
rate(feature_usage_total{feature="dashboard"}[5m]) / rate(feature_usage_total[5m])

# 功能错误率
rate(feature_errors_total{feature="dashboard"}[5m]) / rate(feature_usage_total{feature="dashboard"}[5m])
```

#### 核心功能监控

**PromQL 查询**：

```promql
# 仪表板访问
increase(dashboard_views_total[1d])

# 数据监控访问
increase(data_monitor_views_total[1d])

# 操作中心访问
increase(operation_center_views_total[1d])

# AI 功能使用
increase(ai_features_usage_total[1d])
```

### 业务数据监控

#### 数据处理量

**PromQL 查询**：

```promql
# 数据处理速率
rate(data_processed_bytes[5m])

# 数据存储量
data_stored_bytes

# 数据传输量
rate(data_transferred_bytes[5m])
```

#### 业务成功率

**PromQL 查询**：

```promql
# 业务操作成功率
rate(business_operations_total{status="success"}[5m]) / rate(business_operations_total[5m])

# 数据同步成功率
rate(data_sync_operations_total{status="success"}[5m]) / rate(data_sync_operations_total[5m])
```

---

## 告警规则

### 告警级别

| 级别 | 说明 | 响应时间 |
|------|------|----------|
| **Critical** | 严重故障，需要立即处理 | 15 分钟 |
| **Warning** | 警告，需要关注 | 1 小时 |
| **Info** | 信息，仅供参考 | 24 小时 |

### 告警规则配置

#### 系统告警

```yaml
groups:
  - name: system_alerts
    interval: 30s
    rules:
      # CPU 告警
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
          category: system
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}% for 5 minutes"

      - alert: CriticalCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 95
        for: 2m
        labels:
          severity: critical
          category: system
        annotations:
          summary: "Critical CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}% for 2 minutes"

      # 内存告警
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
          category: system
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}% for 5 minutes"

      # 磁盘告警
      - alert: HighDiskUsage
        expr: (1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"})) * 100 > 80
        for: 10m
        labels:
          severity: warning
          category: system
        annotations:
          summary: "High disk usage on {{ $labels.instance }}"
          description: "Disk usage is {{ $value }}% for 10 minutes"

      # 容器告警
      - alert: ContainerDown
        expr: up{job="docker", name="yyc3-cpim-app"} == 0
        for: 1m
        labels:
          severity: critical
          category: system
        annotations:
          summary: "Container {{ $labels.name }} is down"
          description: "Container has been down for 1 minute"
```

#### 应用告警

```yaml
  - name: application_alerts
    interval: 30s
    rules:
      # API 告警
      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
          category: application
        annotations:
          summary: "Slow API response detected"
          description: "95th percentile API response time is {{ $value }}s"

      - alert: HighAPIErrorRate
        expr: rate(api_requests_total{status=~"5.."}[5m]) / rate(api_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
          category: application
        annotations:
          summary: "High API error rate"
          description: "API error rate is {{ $value }}%"

      # 前端性能告警
      - alert: SlowLCP
        expr: histogram_quantile(0.95, rate(web_vital_lcp_seconds_bucket[5m])) > 2.5
        for: 5m
        labels:
          severity: warning
          category: application
        annotations:
          summary: "Slow LCP detected"
          description: "95th percentile LCP is {{ $value }}s"

      # WebSocket 告警
      - alert: WebSocketConnectionFailure
        expr: rate(websocket_errors_total[5m]) > 10
        for: 5m
        labels:
          severity: warning
          category: application
        annotations:
          summary: "High WebSocket error rate"
          description: "WebSocket error rate is {{ $value }}/s"
```

#### 数据库告警

```yaml
  - name: database_alerts
    interval: 30s
    rules:
      # 数据库连接告警
      - alert: HighDBConnections
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
          category: database
        annotations:
          summary: "High database connections"
          description: "Database connections are {{ $value }}"

      # 数据库性能告警
      - alert: SlowDBQuery
        expr: rate(pg_stat_statements_total_exec_time_ms[5m]) / rate(pg_stat_statements_calls_total[5m]) > 1000
        for: 5m
        labels:
          severity: warning
          category: database
        annotations:
          summary: "Slow database query detected"
          description: "Average query execution time is {{ $value }}ms"
```

### 告警通知

#### 通知渠道

| 渠道 | 用途 | 配置 |
|------|------|------|
| **Email** | 所有告警 | SMTP 配置 |
| **Slack** | Critical/Warning | Webhook 配置 |
| **钉钉** | Critical 告警 | Webhook 配置 |
| **企业微信** | Critical 告警 | Webhook 配置 |

#### 通知规则

```yaml
receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@example.com'
        headers:
          Subject: '[CRITICAL] {{ .GroupLabels.alertname }}'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/xxx'
        channel: '#alerts-critical'

  - name: 'warning-alerts'
    email_configs:
      - to: 'team@example.com'
        headers:
          Subject: '[WARNING] {{ .GroupLabels.alertname }}'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/xxx'
        channel: '#alerts-warning'

route:
  receiver: 'critical-alerts'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'
```

---

## 监控面板

### Grafana 面板配置

#### 系统概览面板

```json
{
  "dashboard": {
    "title": "System Overview",
    "panels": [
      {
        "title": "CPU Usage",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100"
          }
        ]
      },
      {
        "title": "Disk Usage",
        "targets": [
          {
            "expr": "(1 - (node_filesystem_avail_bytes{fstype!=\"tmpfs\"} / node_filesystem_size_bytes{fstype!=\"tmpfs\"})) * 100"
          }
        ]
      },
      {
        "title": "Network Traffic",
        "targets": [
          {
            "expr": "rate(node_network_receive_bytes_total[5m])",
            "legendFormat": "RX"
          },
          {
            "expr": "rate(node_network_transmit_bytes_total[5m])",
            "legendFormat": "TX"
          }
        ]
      }
    ]
  }
}
```

#### 应用性能面板

```json
{
  "dashboard": {
    "title": "Application Performance",
    "panels": [
      {
        "title": "API Response Time (P95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "API Error Rate",
        "targets": [
          {
            "expr": "rate(api_requests_total{status=~\"5..\"}[5m]) / rate(api_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Web Vitals - LCP",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(web_vital_lcp_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "WebSocket Connections",
        "targets": [
          {
            "expr": "websocket_connections_active"
          }
        ]
      }
    ]
  }
}
```

#### 业务指标面板

```json
{
  "dashboard": {
    "title": "Business Metrics",
    "panels": [
      {
        "title": "Daily Active Users",
        "targets": [
          {
            "expr": "count(increase(user_sessions_total[1d]))"
          }
        ]
      },
      {
        "title": "Feature Usage",
        "targets": [
          {
            "expr": "increase(feature_usage_total[1d])"
          }
        ]
      },
      {
        "title": "Page Views",
        "targets": [
          {
            "expr": "rate(page_views_total[5m])"
          }
        ]
      },
      {
        "title": "Business Success Rate",
        "targets": [
          {
            "expr": "rate(business_operations_total{status=\"success\"}[5m]) / rate(business_operations_total[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## 相关文档

- [告警规则配置](002-CP-IM-运营与维护阶段-告警规则配置.md)
- [监控面板配置](003-CP-IM-运营与维护阶段-监控面板配置.md)
- [日志收集配置](004-CP-IM-运营与维护阶段-日志收集配置.md)
- [性能监控配置](005-CP-IM-运营与维护阶段-性能监控配置.md)

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
