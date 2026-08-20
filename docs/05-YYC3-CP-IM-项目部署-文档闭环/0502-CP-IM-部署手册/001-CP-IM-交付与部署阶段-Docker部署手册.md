---
@file: 001-CP-IM-交付与部署阶段-Docker部署手册.md
@description: YYC³-CP-IM Docker 部署手册文档
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-26
@updated: 2026-03-05
@status: published
@tags: [部署手册],[Docker部署],[部署手册]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元***
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ CloudPivot Intelli-Matrix - Docker 部署手册

本文档提供 YYC³ CloudPivot Intelli-Matrix 项目的完整 Docker 部署指南，包括环境准备、配置步骤、部署流程和运维管理。

---

## 目录

- [部署概述](#部署概述)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [详细配置](#详细配置)
- [部署流程](#部署流程)
- [监控管理](#监控管理)
- [故障排查](#故障排查)
- [运维指南](#运维指南)

---

## 部署概述

### 架构说明

YYC³ CloudPivot Intelli-Matrix 使用 Docker Compose 进行容器化部署，包含以下服务：

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| **app** | yyc3-cloudpivot:latest | 3118:8080 | 主应用服务 |
| **nginx-proxy** | nginx:alpine | 80:80, 443:443 | 反向代理 |
| **prometheus** | prom/prometheus:latest | 9090:9090 | 监控数据收集 |
| **grafana** | grafana/grafana:latest | 3000:3000 | 监控数据可视化 |

### 网络架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                         │
│                   (yyc3-network)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │     app     │◄──►│nginx-proxy  │◄──►│  External  │   │
│  │  (3118)    │    │  (80/443)   │    │   Traffic  │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐                       │
│  │ prometheus  │◄──►│   grafana   │                       │
│  │  (9090)    │    │  (3000)     │                       │
│  └─────────────┘    └─────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 环境要求

### 系统要求

- **操作系统**：Linux (Ubuntu 20.04+, CentOS 7+, Debian 10+)
- **CPU**：4核心或更高
- **内存**：8GB 或更高（推荐 16GB）
- **磁盘空间**：至少 20GB 可用空间
- **网络**：稳定的互联网连接

### 软件要求

- **Docker**：v20.10 或更高版本
- **Docker Compose**：v2.0 或更高版本
- **Git**：v2.x 或更高版本

### 权限要求

- **Docker 访问权限**：用户需要加入 docker 组
- **端口访问权限**：80、443、3000、3118、9090 端口
- **文件系统权限**：项目目录读写权限

---

## 快速开始

### 1. 安装 Docker 和 Docker Compose

#### Ubuntu/Debian

```bash
# 更新包索引
sudo apt-get update

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt-get install docker-compose-plugin

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录以应用组更改
newgrp docker

# 验证安装
docker --version
docker compose version
```

#### CentOS/RHEL

```bash
# 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录以应用组更改
newgrp docker

# 验证安装
docker --version
docker compose version
```

### 2. 克隆项目

```bash
# 克隆项目仓库
git clone https://github.com/YanYuCloudCube/CloudPivot-Intelli-Matrix.git

# 进入项目目录
cd CloudPivot-Intelli-Matrix
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

配置以下关键变量：

```env
# 应用配置
NODE_ENV=production
VITE_API_URL=http://localhost:3000/api

# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key

# Grafana 配置
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_secure_password

# 构建信息
BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
VCS_REF=main
```

### 4. 启动服务

```bash
# 构建并启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs -f
```

### 5. 验证部署

```bash
# 检查应用健康状态
curl http://localhost:3118/health

# 检查 Prometheus
curl http://localhost:9090/-/healthy

# 检查 Grafana
curl http://localhost:3000/api/health
```

访问以下 URL 验证服务：

- **主应用**：http://localhost:3118
- **Prometheus**：http://localhost:9090
- **Grafana**：http://localhost:3000 (默认用户名/密码：admin/admin)

---

## 详细配置

### Dockerfile 配置

项目使用多阶段构建优化镜像大小：

```dockerfile
# 阶段1：基础镜像
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 阶段2：依赖安装
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --prod=false

# 阶段3：构建
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

# 阶段4：运行时
FROM nginx:alpine AS runner
RUN apk add --no-cache curl
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml 配置

#### 应用服务配置

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
    args:
      VERSION: 0.0.1
      BUILD_DATE: ${BUILD_DATE}
      VCS_REF: ${VCS_REF}
  container_name: yyc3-cpim-app
  ports:
    - "3118:8080"
  environment:
    NODE_ENV: production
    VITE_API_URL: ${VITE_API_URL}
    VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
    VITE_SUPABASE_KEY: ${VITE_SUPABASE_KEY}
  networks:
    - yyc3-network
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
    interval: 30s
    timeout: 3s
    retries: 3
    start_period: 10s
```

#### Nginx 反向代理配置

```yaml
nginx-proxy:
  image: nginx:alpine
  container_name: yyc3-nginx-proxy
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx-proxy.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro
  depends_on:
    - app
  networks:
    - yyc3-network
  restart: unless-stopped
```

#### Prometheus 配置

```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: yyc3-prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    - prometheus-data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
  networks:
    - yyc3-network
  restart: unless-stopped
```

#### Grafana 配置

```yaml
grafana:
  image: grafana/grafana:latest
  container_name: yyc3-grafana
  ports:
    - "3000:3000"
  volumes:
    - grafana-data:/var/lib/grafana
    - ./grafana-dashboards:/etc/grafana/provisioning/dashboards:ro
    - ./grafana-datasources:/etc/grafana/provisioning/datasources:ro
  environment:
    - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER}
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
  depends_on:
    - prometheus
  networks:
    - yyc3-network
  restart: unless-stopped
```

### 网络和存储配置

```yaml
networks:
  yyc3-network:
    driver: bridge
    name: yyc3-network

volumes:
  prometheus-data:
    name: yyc3-prometheus-data
  grafana-data:
    name: yyc3-grafana-data
```

---

## 部署流程

### 1. 构建镜像

```bash
# 构建所有服务的镜像
docker compose build

# 构建特定服务的镜像
docker compose build app

# 使用构建参数
docker compose build --build-arg VERSION=1.0.0 --build-arg VCS_REF=main
```

### 2. 启动服务

```bash
# 后台启动所有服务
docker compose up -d

# 前台启动（查看日志）
docker compose up

# 启动特定服务
docker compose up -d app nginx-proxy

# 强制重新创建容器
docker compose up -d --force-recreate
```

### 3. 停止服务

```bash
# 停止所有服务
docker compose down

# 停止并删除数据卷
docker compose down -v

# 停止特定服务
docker compose stop app
```

### 4. 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart app

# 重启并查看日志
docker compose restart -f
```

### 5. 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker compose up -d --build

# 清理旧镜像
docker image prune -f
```

---

## 监控管理

### Prometheus 监控

访问 Prometheus 控制台：http://localhost:9090

#### 常用查询

```promql
# CPU 使用率
rate(container_cpu_usage_seconds_total{name="yyc3-cpim-app"}[5m])

# 内存使用率
container_memory_usage_bytes{name="yyc3-cpim-app"} / container_spec_memory_limit_bytes{name="yyc3-cpim-app"}

# 网络流量
rate(container_network_receive_bytes_total{name="yyc3-cpim-app"}[5m])
rate(container_network_transmit_bytes_total{name="yyc3-cpim-app"}[5m])

# 容器状态
up{job="docker"}
```

### Grafana 监控

访问 Grafana 控制台：http://localhost:3000

#### 默认凭据

- **用户名**：admin
- **密码**：admin（首次登录后需要修改）

#### 配置数据源

1. 登录 Grafana
2. 导航到 Configuration → Data Sources
3. 添加 Prometheus 数据源
4. URL：http://prometheus:9090
5. 保存并测试连接

#### 导入仪表板

1. 导航到 Dashboards → Import
2. 上传仪表板 JSON 文件
3. 选择 Prometheus 数据源
4. 导入仪表板

### 日志管理

```bash
# 查看所有服务日志
docker compose logs

# 查看特定服务日志
docker compose logs app

# 实时查看日志
docker compose logs -f app

# 查看最近100行日志
docker compose logs --tail=100 app

# 查看特定时间范围的日志
docker compose logs --since 1h app
```

---

## 故障排查

### 常见问题

#### 1. 容器无法启动

**问题**：容器启动失败

**解决方案**：

```bash
# 查看容器状态
docker compose ps

# 查看容器日志
docker compose logs app

# 检查容器详情
docker inspect yyc3-cpim-app

# 重启容器
docker compose restart app
```

#### 2. 端口冲突

**问题**：端口已被占用

**解决方案**：

```bash
# 查看端口占用
lsof -i :3118
lsof -i :80
lsof -i :443

# 停止占用端口的进程
kill -9 <PID>

# 或修改 docker-compose.yml 中的端口映射
ports:
  - "3119:8080"  # 使用不同的主机端口
```

#### 3. 内存不足

**问题**：容器因内存不足被终止

**解决方案**：

```bash
# 检查系统内存
free -h

# 查看容器资源使用
docker stats

# 增加 Docker 内存限制（在 docker-compose.yml 中）
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

#### 4. 网络连接问题

**问题**：服务间无法通信

**解决方案**：

```bash
# 检查网络状态
docker network inspect yyc3-network

# 测试容器间连接
docker exec yyc3-cpim-app ping yyc3-nginx-proxy

# 重新创建网络
docker compose down
docker network prune
docker compose up -d
```

#### 5. 数据持久化问题

**问题**：数据卷未正确挂载

**解决方案**：

```bash
# 检查数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect yyc3-prometheus-data

# 重新创建数据卷
docker compose down -v
docker compose up -d
```

### 健康检查

```bash
# 检查容器健康状态
docker compose ps

# 查看健康检查日志
docker inspect yyc3-cpim-app | grep -A 10 Health

# 手动执行健康检查
docker exec yyc3-cpim-app curl -f http://localhost:8080/health
```

---

## 运维指南

### 日常维护

#### 1. 定期备份

```bash
# 备份数据卷
docker run --rm -v yyc3-prometheus-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/prometheus-data-backup.tar.gz -C /data .

docker run --rm -v yyc3-grafana-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/grafana-data-backup.tar.gz -C /data .

# 备份配置文件
tar czf config-backup.tar.gz \
  docker-compose.yml \
  .env \
  nginx-proxy.conf \
  prometheus.yml
```

#### 2. 日志轮转

```bash
# 清理旧日志
docker compose logs --tail=0 > /dev/null

# 配置日志轮转（在 docker-compose.yml 中）
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### 3. 资源清理

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的网络
docker network prune

# 清理未使用的卷
docker volume prune

# 清理所有未使用的资源
docker system prune -a
```

### 性能优化

#### 1. 镜像优化

```bash
# 使用多阶段构建减少镜像大小
# 已在 Dockerfile 中实现

# 使用 .dockerignore 排除不必要的文件
# .dockerignore 文件内容：
node_modules
dist
.git
.env
*.log
```

#### 2. 资源限制

```yaml
# 在 docker-compose.yml 中配置资源限制
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

#### 3. 缓存优化

```bash
# 使用构建缓存加速构建
docker compose build --no-cache=false

# 清理构建缓存
docker builder prune
```

### 安全加固

#### 1. 最小权限原则

```bash
# 使用非 root 用户运行容器
# 在 Dockerfile 中添加：
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

#### 2. 网络隔离

```yaml
# 使用自定义网络隔离服务
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # 内部网络，无法访问外部
```

#### 3. 密钥管理

```bash
# 使用 Docker Secrets 管理敏感信息
echo "your_secret_password" | docker secret create db_password -

# 在 docker-compose.yml 中使用
services:
  app:
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```

---

## 相关文档

- [Kubernetes 部署手册](002-CP-IM-交付与部署阶段-Kubernetes部署手册.md)
- [数据库部署手册](003-CP-IM-交付与部署阶段-数据库部署手册.md)
- [前端应用部署手册](005-CP-IM-交付与部署阶段-前端应用部署手册.md)
- [CI/CD 流水线配置](001-CP-IM-交付与部署阶段-CI_CD流水线配置.md)

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
