---
@file: 001-CP-IM-运营与维护阶段-日常运维操作手册.md
@description: YYC³-CP-IM 日常运维操作手册文档
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2026-02-26
@updated: 2026-03-05
@status: published
@tags: [运维手册],[日常运维],[操作手册]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元***
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ CloudPivot Intelli-Matrix - 日常运维操作手册

本文档提供 YYC³ CloudPivot Intelli-Matrix 项目的日常运维操作指南，包括系统检查、日志管理、性能优化和故障处理。

---

## 目录

- [运维概述](#运维概述)
- [日常检查](#日常检查)
- [日志管理](#日志管理)
- [备份管理](#备份管理)
- [性能优化](#性能优化)
- [安全维护](#安全维护)
- [故障处理](#故障处理)

---

## 运维概述

### 运维架构

```
┌─────────────────────────────────────────────────────────────┐
│                      运维管理层                              │
│  - 监控告警系统                                              │
│  - 日志分析系统                                              │
│  - 自动化运维工具                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      应用运维层                              │
│  - 前端应用运维                                              │
│  - 后端服务运维                                              │
│  - 数据库运维                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      基础设施层                              │
│  - 服务器运维                                                │
│  - 网络运维                                                  │
│  - 存储运维                                                  │
└─────────────────────────────────────────────────────────────┘
```

### 运维职责

| 角色 | 职责 | 联系方式 |
|------|------|----------|
| **系统运维工程师** | 服务器管理、网络配置、系统监控 | oncall@example.com |
| **应用运维工程师** | 应用部署、服务管理、性能优化 | app-ops@example.com |
| **数据库管理员** | 数据库维护、备份恢复、性能调优 | dba@example.com |
| **安全运维工程师** | 安全加固、漏洞扫描、应急响应 | security@example.com |

### 运维工具

| 工具 | 用途 | 版本 |
|------|------|------|
| **Docker** | 容器管理 | 24.x |
| **Docker Compose** | 容器编排 | 2.x |
| **Nginx** | 反向代理 | 1.24.x |
| **Prometheus** | 监控数据收集 | latest |
| **Grafana** | 监控可视化 | latest |
| **Logrotate** | 日志轮转 | 系统默认 |

---

## 日常检查

### 每日检查清单

#### 系统状态检查

```bash
# 1. 检查服务器运行状态
uptime
# 输出示例：load average: 0.50, 0.60, 0.55

# 2. 检查磁盘使用情况
df -h
# 检查磁盘使用率是否超过 80%

# 3. 检查内存使用情况
free -h
# 检查内存使用率是否超过 85%

# 4. 检查网络连接
netstat -tuln | grep LISTEN
# 检查关键端口是否正常监听
# 3118: 应用端口
# 5432: PostgreSQL 端口
```

#### 应用服务检查

```bash
# 1. 检查 Docker 容器状态
docker ps -a
# 检查 yyc3-cpim-app 容器是否运行

# 2. 检查应用日志
docker logs yyc3-cpim-app --tail 100
# 检查是否有错误日志

# 3. 检查 Nginx 状态
systemctl status nginx
# 检查 Nginx 服务是否正常运行

# 4. 检查 Nginx 配置
nginx -t
# 验证 Nginx 配置文件是否正确
```

#### 数据库检查

```bash
# 1. 检查 PostgreSQL 连接
psql -h localhost -U postgres -c "SELECT version();"

# 2. 检查数据库连接数
psql -h localhost -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 3. 检查数据库大小
psql -h localhost -U postgres -c "SELECT pg_size_pretty(pg_database_size('yyc3_cpim'));"

# 4. 检查慢查询日志
# 查看 PostgreSQL 日志文件
tail -f /var/log/postgresql/postgresql-*.log
```

#### 监控指标检查

```bash
# 1. 检查 Prometheus 状态
systemctl status prometheus

# 2. 检查 Grafana 状态
systemctl status grafana-server

# 3. 访问监控面板
# Grafana: http://your-server:3000
# Prometheus: http://your-server:9090
```

### 每周检查清单

#### 性能分析

```bash
# 1. 分析应用性能
# 查看 Grafana 应用性能面板
# 关注 API 响应时间、错误率、前端性能指标

# 2. 分析数据库性能
# 查看慢查询日志
# 分析查询执行计划
# 检查索引使用情况

# 3. 分析系统性能
# 查看 CPU、内存、磁盘、网络趋势
# 识别性能瓶颈
```

#### 安全检查

```bash
# 1. 检查系统更新
apt list --upgradable

# 2. 检查安全日志
tail -f /var/log/auth.log

# 3. 检查应用日志异常
grep -i "error\|exception\|fail" /var/log/yyc3-cpim/app.log

# 4. 检查防火墙规则
iptables -L -n
```

### 每月检查清单

#### 容量规划

```bash
# 1. 分析资源使用趋势
# 查看过去一个月的 CPU、内存、磁盘使用情况
# 预测未来资源需求

# 2. 分析业务增长趋势
# 查看用户增长、数据增长趋势
# 评估系统容量是否满足需求

# 3. 制定扩容计划
# 根据分析结果制定扩容计划
# 包括服务器扩容、数据库扩容等
```

#### 备份验证

```bash
# 1. 验证备份完整性
# 检查最近一次备份是否成功
# 验证备份文件是否完整

# 2. 测试恢复流程
# 定期进行恢复测试
# 确保备份可以正常恢复

# 3. 审查备份策略
# 根据业务需求调整备份策略
# 包括备份频率、保留时间等
```

---

## 日志管理

### 日志分类

| 日志类型 | 路径 | 用途 | 保留时间 |
|---------|------|------|----------|
| **应用日志** | `/var/log/yyc3-cpim/app.log` | 应用运行日志 | 30 天 |
| **访问日志** | `/var/log/nginx/access.log` | Nginx 访问日志 | 30 天 |
| **错误日志** | `/var/log/nginx/error.log` | Nginx 错误日志 | 90 天 |
| **系统日志** | `/var/log/syslog` | 系统日志 | 30 天 |
| **数据库日志** | `/var/log/postgresql/postgresql-*.log` | PostgreSQL 日志 | 30 天 |

### 日志轮转配置

#### 应用日志轮转

```bash
# /etc/logrotate.d/yyc3-cpim-app
/var/log/yyc3-cpim/app.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        docker exec yyc3-cpim-app kill -USR1 $(cat /var/run/nginx.pid 2>/dev/null || echo -1)
    endscript
}
```

#### Nginx 日志轮转

```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### 日志分析

#### 查看实时日志

```bash
# 查看应用实时日志
docker logs -f yyc3-cpim-app

# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

#### 日志搜索

```bash
# 搜索错误日志
grep -i "error" /var/log/yyc3-cpim/app.log

# 搜索特定时间段的日志
grep "2026-03-05 10:" /var/log/yyc3-cpim/app.log

# 统计错误数量
grep -c "error" /var/log/yyc3-cpim/app.log

# 搜索慢请求
grep "request_time" /var/log/nginx/access.log | awk '$NF > 1'
```

#### 日志统计

```bash
# 统计访问量
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# 统计状态码
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# 统计最常访问的 URL
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

### 日志清理

```bash
# 手动清理旧日志
find /var/log/yyc3-cpim -name "*.log.*" -mtime +30 -delete

# 清理压缩日志
find /var/log/yyc3-cpim -name "*.gz" -mtime +30 -delete

# 清理空日志文件
find /var/log/yyc3-cpim -name "*.log" -size 0 -delete
```

---

## 备份管理

### 备份策略

| 备份类型 | 频率 | 保留时间 | 存储位置 |
|---------|------|----------|----------|
| **数据库备份** | 每日 | 30 天 | 本地 + 远程 |
| **应用配置备份** | 每周 | 90 天 | 本地 + 远程 |
| **日志备份** | 每周 | 30 天 | 远程 |
| **代码备份** | 每次 | 永久 | Git 仓库 |

### 数据库备份

#### 自动备份脚本

```bash
#!/bin/bash
# /usr/local/bin/backup-database.sh

# 配置
DB_NAME="yyc3_cpim"
DB_USER="postgres"
BACKUP_DIR="/backup/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump -h localhost -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "Database backup successful: $BACKUP_FILE"
    
    # 删除 30 天前的备份
    find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
    
    # 同步到远程服务器
    rsync -avz $BACKUP_DIR user@remote-server:/backup/database/
else
    echo "Database backup failed!"
    exit 1
fi
```

#### 定时任务配置

```bash
# /etc/cron.d/database-backup
# 每天凌晨 2 点执行数据库备份
0 2 * * * root /usr/local/bin/backup-database.sh >> /var/log/backup.log 2>&1
```

### 应用配置备份

#### 备份脚本

```bash
#!/bin/bash
# /usr/local/bin/backup-config.sh

# 配置
BACKUP_DIR="/backup/config"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/config_${DATE}.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份配置文件
tar -czf $BACKUP_FILE \
    /etc/nginx/ \
    /etc/docker/ \
    /var/www/yyc3-cpim/.env \
    /usr/local/bin/*.sh

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "Config backup successful: $BACKUP_FILE"
    
    # 删除 90 天前的备份
    find $BACKUP_DIR -name "*.tar.gz" -mtime +90 -delete
    
    # 同步到远程服务器
    rsync -avz $BACKUP_DIR user@remote-server:/backup/config/
else
    echo "Config backup failed!"
    exit 1
fi
```

#### 定时任务配置

```bash
# /etc/cron.d/config-backup
# 每周日凌晨 3 点执行配置备份
0 3 * * 0 root /usr/local/bin/backup-config.sh >> /var/log/backup.log 2>&1
```

### 备份恢复

#### 数据库恢复

```bash
# 从备份文件恢复数据库
gunzip < /backup/database/yyc3_cpim_20260305_020000.sql.gz | psql -h localhost -U postgres yyc3_cpim

# 验证恢复结果
psql -h localhost -U postgres -c "SELECT count(*) FROM pg_tables;"
```

#### 配置恢复

```bash
# 从备份文件恢复配置
tar -xzf /backup/config/config_20260305_030000.tar.gz -C /

# 重启相关服务
systemctl restart nginx
systemctl restart docker
```

---

## 性能优化

### 应用性能优化

#### 前端性能优化

```bash
# 1. 启用 Gzip 压缩
# 在 Nginx 配置中添加
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;

# 2. 启用浏览器缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 3. 优化图片
# 使用 WebP 格式
# 压缩图片大小
```

#### 后端性能优化

```bash
# 1. 优化 Docker 容器资源限制
# 在 docker-compose.yml 中配置
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

# 2. 优化 Nginx 配置
# 增加 worker_processes
worker_processes auto;

# 增加 worker_connections
events {
    worker_connections 2048;
}

# 3. 启用 HTTP/2
listen 443 ssl http2;
```

### 数据库性能优化

#### 查询优化

```sql
-- 1. 分析慢查询
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 2. 创建索引
CREATE INDEX idx_table_column ON table_name(column_name);

-- 3. 分析查询计划
EXPLAIN ANALYZE SELECT * FROM table_name WHERE column_name = 'value';

-- 4. 更新统计信息
ANALYZE table_name;
```

#### 配置优化

```bash
# /etc/postgresql/14/main/postgresql.conf

# 增加共享缓冲区
shared_buffers = 256MB

# 增加工作内存
work_mem = 16MB

# 增加维护工作内存
maintenance_work_mem = 128MB

# 增加最大连接数
max_connections = 100

# 启用查询统计
shared_preload_libraries = 'pg_stat_statements'
```

### 系统性能优化

#### 内核参数优化

```bash
# /etc/sysctl.conf

# 增加文件描述符限制
fs.file-max = 65535

# 优化 TCP 连接
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200

# 增加网络缓冲区
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# 应用配置
sysctl -p
```

#### 文件描述符限制

```bash
# /etc/security/limits.conf

* soft nofile 65535
* hard nofile 65535

# 验证配置
ulimit -n
```

---

## 安全维护

### 系统安全加固

#### 更新系统

```bash
# 更新软件包列表
apt update

# 更新已安装的软件包
apt upgrade -y

# 清理不需要的软件包
apt autoremove -y

# 清理缓存
apt clean
```

#### 配置防火墙

```bash
# 安装 UFW
apt install ufw -y

# 默认拒绝所有传入连接
ufw default deny incoming

# 允许所有传出连接
ufw default allow outgoing

# 允许 SSH
ufw allow 22/tcp

# 允许 HTTP
ufw allow 80/tcp

# 允许 HTTPS
ufw allow 443/tcp

# 启用防火墙
ufw enable

# 查看防火墙状态
ufw status
```

#### 配置 SSH

```bash
# /etc/ssh/sshd_config

# 禁用 root 登录
PermitRootLogin no

# 禁用密码登录
PasswordAuthentication no

# 只允许特定用户
AllowUsers user1 user2

# 更改默认端口
Port 2222

# 重启 SSH 服务
systemctl restart sshd
```

### 应用安全维护

#### SSL 证书管理

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run

# 添加定时任务
0 0 * * * certbot renew --quiet
```

#### 环境变量管理

```bash
# 保护环境变量文件
chmod 600 /var/www/yyc3-cpim/.env

# 定期更新密钥
# 更新数据库密码
# 更新 API 密钥
# 更新 JWT 密钥
```

### 安全审计

#### 日志审计

```bash
# 检查登录日志
lastlog

# 检查失败的登录尝试
grep "Failed password" /var/log/auth.log

# 检查 sudo 使用情况
grep sudo /var/log/auth.log
```

#### 漏洞扫描

```bash
# 安装 Lynis
apt install lynis -y

# 执行安全审计
lynis audit system

# 查看报告
cat /var/log/lynis-report.dat
```

---

## 故障处理

### 常见故障处理

#### 应用无法访问

**症状**：无法访问应用，浏览器显示连接错误

**排查步骤**：

```bash
# 1. 检查容器状态
docker ps -a

# 2. 检查容器日志
docker logs yyc3-cpim-app

# 3. 检查 Nginx 状态
systemctl status nginx

# 4. 检查端口监听
netstat -tuln | grep 3118

# 5. 检查防火墙
ufw status
```

**解决方案**：

```bash
# 重启容器
docker restart yyc3-cpim-app

# 重启 Nginx
systemctl restart nginx

# 检查防火墙规则
ufw allow 3118/tcp
```

#### 数据库连接失败

**症状**：应用无法连接数据库

**排查步骤**：

```bash
# 1. 检查 PostgreSQL 状态
systemctl status postgresql

# 2. 检查数据库连接
psql -h localhost -U postgres -c "SELECT version();"

# 3. 检查数据库日志
tail -f /var/log/postgresql/postgresql-*.log

# 4. 检查网络连接
telnet localhost 5432
```

**解决方案**：

```bash
# 重启 PostgreSQL
systemctl restart postgresql

# 检查数据库配置
# /etc/postgresql/14/main/postgresql.conf

# 检查连接数限制
psql -h localhost -U postgres -c "SHOW max_connections;"
```

#### 性能下降

**症状**：应用响应缓慢

**排查步骤**：

```bash
# 1. 检查系统资源
top
htop

# 2. 检查磁盘 I/O
iostat -x 1

# 3. 检查网络流量
iftop

# 4. 检查应用日志
docker logs yyc3-cpim-app --tail 100

# 5. 检查数据库性能
psql -h localhost -U postgres -c "SELECT * FROM pg_stat_activity;"
```

**解决方案**：

```bash
# 优化数据库查询
# 创建索引
# 更新统计信息

# 增加系统资源
# 扩容服务器
# 优化配置

# 清理日志
# 清理缓存
```

### 应急响应流程

#### 故障分级

| 级别 | 响应时间 | 解决时间 | 通知范围 |
|------|----------|----------|----------|
| **P0** | 15 分钟 | 4 小时 | 全员 |
| **P1** | 30 分钟 | 8 小时 | 运维团队 |
| **P2** | 2 小时 | 24 小时 | 相关团队 |
| **P3** | 1 天 | 3 天 | 相关人员 |

#### 应急响应步骤

1. **故障发现**
   - 监控告警
   - 用户反馈
   - 主动巡检

2. **故障确认**
   - 验证故障现象
   - 确定故障范围
   - 评估故障影响

3. **故障处理**
   - 执行应急预案
   - 隔离故障
   - 恢复服务

4. **故障复盘**
   - 分析故障原因
   - 总结经验教训
   - 改进预防措施

---

## 相关文档

- [故障处理手册](002-CP-IM-运营与维护阶段-故障处理手册.md)
- [应急响应预案](003-CP-IM-运营与维护阶段-应急响应预案.md)
- [备份与恢复手册](004-CP-IM-运营与维护阶段-备份与恢复手册.md)
- [安全运维手册](006-CP-IM-运营与维护阶段-安全运维手册.md)

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
