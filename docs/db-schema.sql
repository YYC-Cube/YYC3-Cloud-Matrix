-- YYC³ CloudPivot Intelli-Matrix - Supabase 数据库表结构
-- 版本: v1.0.0
-- 创建时间: 2026-04-01
-- 维护团队: YanYuCloudCube Team

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 模型表 (models)
-- ============================================
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  version TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  is_encrypted BOOLEAN DEFAULT FALSE,
  version_number INTEGER DEFAULT 1,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  config JSONB,
  metrics JSONB,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
CREATE INDEX IF NOT EXISTS idx_models_provider ON models(provider);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_models_sync_status ON models(sync_status);
CREATE INDEX IF NOT EXISTS idx_models_tags ON models USING GIN(tags);

-- ============================================
-- 代理表 (agents)
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB,
  version_number INTEGER DEFAULT 1,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_sync_status ON agents(sync_status);
CREATE INDEX IF NOT EXISTS idx_agents_tags ON agents USING GIN(tags);

-- ============================================
-- 节点表 (nodes)
-- ============================================
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'warning', 'inactive', 'error')),
  metrics JSONB,
  config JSONB,
  parent_id TEXT REFERENCES nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);
CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_nodes_created_at ON nodes(created_at DESC);

-- ============================================
-- 操作表 (operations)
-- ============================================
CREATE TABLE IF NOT EXISTS operations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('restart', 'scale', 'deploy', 'rollback', 'custom')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  target TEXT NOT NULL,
  result JSONB,
  error_message TEXT,
  duration INTEGER,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);
CREATE INDEX IF NOT EXISTS idx_operations_type ON operations(type);
CREATE INDEX IF NOT EXISTS idx_operations_target ON operations(target);
CREATE INDEX IF NOT EXISTS idx_operations_created_at ON operations(created_at DESC);

-- ============================================
-- 巡查表 (patrols)
-- ============================================
CREATE TABLE IF NOT EXISTS patrols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'completed', 'failed')),
  checks JSONB,
  results JSONB,
  total_checks INTEGER DEFAULT 0,
  passed_checks INTEGER DEFAULT 0,
  failed_checks INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_patrols_status ON patrols(status);
CREATE INDEX IF NOT EXISTS idx_patrols_created_at ON patrols(created_at DESC);

-- ============================================
-- 安全扫描表 (security_scans)
-- ============================================
CREATE TABLE IF NOT EXISTS security_scans (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('csp', 'cookie', 'sensitive', 'vulnerability')),
  target TEXT NOT NULL,
  results JSONB,
  vulnerabilities JSONB,
  total_issues INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  high_issues INTEGER DEFAULT 0,
  medium_issues INTEGER DEFAULT 0,
  low_issues INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_security_scans_type ON security_scans(type);
CREATE INDEX IF NOT EXISTS idx_security_scans_target ON security_scans(target);
CREATE INDEX IF NOT EXISTS idx_security_scans_created_at ON security_scans(created_at DESC);

-- ============================================
-- AI 建议表 (ai_suggestions)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id TEXT PRIMARY KEY,
  pattern TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  confidence DECIMAL(5, 2),
  applied BOOLEAN DEFAULT FALSE,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_applied ON ai_suggestions(applied);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_confidence ON ai_suggestions(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_created_at ON ai_suggestions(created_at DESC);

-- ============================================
-- 推理日志表 (inference_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS inference_logs (
  id TEXT PRIMARY KEY,
  model_id TEXT REFERENCES models(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  prompt TEXT,
  response TEXT,
  tokens_used INTEGER,
  duration INTEGER,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_inference_logs_model_id ON inference_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_inference_logs_agent_id ON inference_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_inference_logs_status ON inference_logs(status);
CREATE INDEX IF NOT EXISTS idx_inference_logs_created_at ON inference_logs(created_at DESC);

-- ============================================
-- 文件表 (files)
-- ============================================
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  content TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  parent_id TEXT REFERENCES files(id) ON DELETE CASCADE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_files_parent_id ON files(parent_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);

-- ============================================
-- 标签表 (tags)
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- ============================================
-- 迁移记录表 (migrations)
-- ============================================
CREATE TABLE IF NOT EXISTS migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'applied' CHECK (status IN ('pending', 'applied', 'failed')),
  error_message TEXT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON migrations(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_migrations_status ON migrations(status);

-- ============================================
-- 性能指标表 (performance_metrics)
-- ============================================
CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10, 2),
  metric_unit TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags JSONB,
  metadata JSONB
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);

-- ============================================
-- 告警表 (alerts)
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================

-- models 表
CREATE OR REPLACE FUNCTION update_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_models_updated_at();

-- agents 表
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agents_updated_at();

-- nodes 表
CREATE OR REPLACE FUNCTION update_nodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_nodes_updated_at();

-- operations 表
CREATE OR REPLACE FUNCTION update_operations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_operations_updated_at
  BEFORE UPDATE ON operations
  FOR EACH ROW
  EXECUTE FUNCTION update_operations_updated_at();

-- patrols 表
CREATE OR REPLACE FUNCTION update_patrols_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_patrols_updated_at
  BEFORE UPDATE ON patrols
  FOR EACH ROW
  EXECUTE FUNCTION update_patrols_updated_at();

-- files 表
CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_files_updated_at();

-- ============================================
-- 行级安全策略 (RLS)
-- ============================================

-- 启用 RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrols ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inference_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（开发环境）
-- 生产环境应该根据实际需求配置更严格的策略
CREATE POLICY "Allow all access to models" ON models FOR ALL USING (true);
CREATE POLICY "Allow all access to agents" ON agents FOR ALL USING (true);
CREATE POLICY "Allow all access to nodes" ON nodes FOR ALL USING (true);
CREATE POLICY "Allow all access to operations" ON operations FOR ALL USING (true);
CREATE POLICY "Allow all access to patrols" ON patrols FOR ALL USING (true);
CREATE POLICY "Allow all access to security_scans" ON security_scans FOR ALL USING (true);
CREATE POLICY "Allow all access to ai_suggestions" ON ai_suggestions FOR ALL USING (true);
CREATE POLICY "Allow all access to inference_logs" ON inference_logs FOR ALL USING (true);
CREATE POLICY "Allow all access to files" ON files FOR ALL USING (true);
CREATE POLICY "Allow all access to alerts" ON alerts FOR ALL USING (true);

-- ============================================
-- 初始化数据
-- ============================================

-- 插入初始标签
INSERT INTO tags (name, color) VALUES
  ('生产环境', '#EF4444'),
  ('开发环境', '#3B82F6'),
  ('测试环境', '#F59E0B'),
  ('高优先级', '#DC2626'),
  ('中优先级', '#F59E0B'),
  ('低优先级', '#10B981')
ON CONFLICT (name) DO NOTHING;

-- 插入初始迁移记录
INSERT INTO migrations (version, name, description, status) VALUES
  (1, 'Initial Schema', 'Initialize base table structure', 'applied'),
  (2, 'Add Encryption Support', 'Add encryption fields to models', 'applied'),
  (3, 'Add Version Control', 'Add version field to all entities', 'applied'),
  (4, 'Add Sync Status', 'Add sync status and timestamp fields', 'applied'),
  (5, 'Add Tags Support', 'Add tags field and create tags store', 'applied')
ON CONFLICT (version) DO NOTHING;
