-- =====================================================
-- YYC³ AI Family Supabase 数据表结构设计
-- =====================================================
-- 版本: 1.0.0
-- 创建日期: 2026-03-28
-- 说明: AI Family 模块的完整数据表结构
-- =====================================================

-- =====================================================
-- 1. family_members 表
-- =====================================================
-- 用途: 存储家庭成员的基础信息
-- 说明: 对应 shared.ts 中的 FamilyMember 类型

CREATE TABLE IF NOT EXISTS family_members (
  -- 主键
  id TEXT PRIMARY KEY,
  
  -- 基本信息
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  en_title TEXT NOT NULL,
  quote TEXT,
  role TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  personality TEXT NOT NULL,
  greeting TEXT,
  care_message TEXT,
  core_ability TEXT,
  
  -- 状态信息
  status TEXT NOT NULL CHECK (status IN ('online', 'speaking', 'idle')),
  mood TEXT,
  
  -- 统计信息
  contribution INTEGER DEFAULT 0,
  growth INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  
  -- 外观信息
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  
  -- 元数据 (JSON 格式存储 hobbies, expertise, responsibilities)
  metadata JSONB DEFAULT '{}',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT check_contribution_non_negative CHECK (contribution >= 0),
  CONSTRAINT check_growth_non_negative CHECK (growth >= 0),
  CONSTRAINT check_streak_non_negative CHECK (streak >= 0)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_family_members_status ON family_members(status);
CREATE INDEX IF NOT EXISTS idx_family_members_contribution ON family_members(contribution DESC);
CREATE INDEX IF NOT EXISTS idx_family_members_updated_at ON family_members(updated_at DESC);

-- 添加注释
COMMENT ON TABLE family_members IS '家庭成员信息表';
COMMENT ON COLUMN family_members.id IS '成员唯一标识 (如: navigator, doctor, etc.)';
COMMENT ON COLUMN family_members.name IS '成员全名';
COMMENT ON COLUMN family_members.short_name IS '成员简称';
COMMENT ON COLUMN family_members.en_title IS '成员英文头衔';
COMMENT ON COLUMN family_members.quote IS '成员名言';
COMMENT ON COLUMN family_members.role IS '成员角色描述';
COMMENT ON COLUMN family_members.phone IS '成员专属电话号码';
COMMENT ON COLUMN family_members.personality IS '性格特质';
COMMENT ON COLUMN family_members.greeting IS '接听电话时的问候语';
COMMENT ON COLUMN family_members.care_message IS '整点关爱播报';
COMMENT ON COLUMN family_members.core_ability IS '核心能力描述';
COMMENT ON COLUMN family_members.status IS '当前状态 (online/speaking/idle)';
COMMENT ON COLUMN family_members.mood IS '当前心情';
COMMENT ON COLUMN family_members.contribution IS '贡献度';
COMMENT ON COLUMN family_members.growth IS '成长值';
COMMENT ON COLUMN family_members.streak IS '连续活跃天数';
COMMENT ON COLUMN family_members.color IS '主题颜色';
COMMENT ON COLUMN family_members.icon IS '图标名称';
COMMENT ON COLUMN family_members.metadata IS '元数据 (hobbies, expertise, responsibilities)';
COMMENT ON COLUMN family_members.created_at IS '创建时间';
COMMENT ON COLUMN family_members.updated_at IS '更新时间';

-- =====================================================
-- 2. family_activities 表
-- =====================================================
-- 用途: 存储家庭成员的活动记录
-- 说明: 对应 FamilyStore.ts 中的 FamilyActivity 类型

CREATE TABLE IF NOT EXISTS family_activities (
  -- 主键
  id TEXT PRIMARY KEY,
  
  -- 活动信息
  type TEXT NOT NULL CHECK (type IN ('game', 'learning', 'music', 'chat', 'achievement')),
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  member_color TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- 元数据 (JSON 格式存储额外的活动信息)
  metadata JSONB DEFAULT '{}',
  
  -- 时间戳
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 外键约束
  CONSTRAINT fk_activity_member 
    FOREIGN KEY (member_id) 
    REFERENCES family_members(id) 
    ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_family_activities_member_id ON family_activities(member_id);
CREATE INDEX IF NOT EXISTS idx_family_activities_type ON family_activities(type);
CREATE INDEX IF NOT EXISTS idx_family_activities_timestamp ON family_activities(timestamp DESC);

-- 添加注释
COMMENT ON TABLE family_activities IS '家庭成员活动记录表';
COMMENT ON COLUMN family_activities.id IS '活动唯一标识';
COMMENT ON COLUMN family_activities.type IS '活动类型 (game/learning/music/chat/achievement)';
COMMENT ON COLUMN family_activities.member_id IS '成员ID';
COMMENT ON COLUMN family_activities.member_name IS '成员名称';
COMMENT ON COLUMN family_activities.member_color IS '成员主题颜色';
COMMENT ON COLUMN family_activities.title IS '活动标题';
COMMENT ON COLUMN family_activities.description IS '活动描述';
COMMENT ON COLUMN family_activities.metadata IS '活动元数据';
COMMENT ON COLUMN family_activities.timestamp IS '活动时间戳 (毫秒)';
COMMENT ON COLUMN family_activities.created_at IS '记录创建时间';

-- =====================================================
-- 3. family_messages 表
-- =====================================================
-- 用途: 存储家庭成员之间的消息
-- 说明: 对应 FamilyStore.ts 中的 FamilyMessage 类型

CREATE TABLE IF NOT EXISTS family_messages (
  -- 主键
  id TEXT PRIMARY KEY,
  
  -- 消息信息
  from_member_id TEXT NOT NULL,
  to_member_id TEXT,
  channel_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'voice', 'file')),
  
  -- 状态
  read BOOLEAN DEFAULT FALSE,
  
  -- 时间戳
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 外键约束
  CONSTRAINT fk_message_from_member 
    FOREIGN KEY (from_member_id) 
    REFERENCES family_members(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_message_to_member 
    FOREIGN KEY (to_member_id) 
    REFERENCES family_members(id) 
    ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_family_messages_from_member_id ON family_messages(from_member_id);
CREATE INDEX IF NOT EXISTS idx_family_messages_to_member_id ON family_messages(to_member_id);
CREATE INDEX IF NOT EXISTS idx_family_messages_channel_id ON family_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_family_messages_read ON family_messages(read);
CREATE INDEX IF NOT EXISTS idx_family_messages_timestamp ON family_messages(timestamp DESC);

-- 添加注释
COMMENT ON TABLE family_messages IS '家庭成员消息表';
COMMENT ON COLUMN family_messages.id IS '消息唯一标识';
COMMENT ON COLUMN family_messages.from_member_id IS '发送者成员ID';
COMMENT ON COLUMN family_messages.to_member_id IS '接收者成员ID (NULL 表示群发)';
COMMENT ON COLUMN family_messages.channel_id IS '频道ID';
COMMENT ON COLUMN family_messages.content IS '消息内容';
COMMENT ON COLUMN family_messages.type IS '消息类型 (text/image/voice/file)';
COMMENT ON COLUMN family_messages.read IS '是否已读';
COMMENT ON COLUMN family_messages.timestamp IS '消息时间戳 (毫秒)';
COMMENT ON COLUMN family_messages.created_at IS '消息创建时间';

-- =====================================================
-- 4. family_learning_courses 表
-- =====================================================
-- 用途: 存储学习课程信息
-- 说明: 对应学习成长模块的课程数据

CREATE TABLE IF NOT EXISTS family_learning_courses (
  -- 主键
  id TEXT PRIMARY KEY,
  
  -- 课程信息
  title TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  skill TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  
  -- 进度信息
  total_lessons INTEGER NOT NULL,
  completed_lessons INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- 元数据
  metadata JSONB DEFAULT '{}',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT check_total_lessons_positive CHECK (total_lessons > 0),
  CONSTRAINT check_completed_lessons_non_negative CHECK (completed_lessons >= 0),
  CONSTRAINT check_completed_lessons_not_exceed_total CHECK (completed_lessons <= total_lessons)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_family_learning_courses_skill ON family_learning_courses(skill);
CREATE INDEX IF NOT EXISTS idx_family_learning_courses_level ON family_learning_courses(level);
CREATE INDEX IF NOT EXISTS idx_family_learning_courses_progress ON family_learning_courses(progress DESC);

-- 添加注释
COMMENT ON TABLE family_learning_courses IS '学习课程表';
COMMENT ON COLUMN family_learning_courses.id IS '课程唯一标识';
COMMENT ON COLUMN family_learning_courses.title IS '课程标题';
COMMENT ON COLUMN family_learning_courses.description IS '课程描述';
COMMENT ON COLUMN family_learning_courses.color IS '课程主题颜色';
COMMENT ON COLUMN family_learning_courses.skill IS '技能类别';
COMMENT ON COLUMN family_learning_courses.level IS '难度等级 (beginner/intermediate/advanced)';
COMMENT ON COLUMN family_learning_courses.total_lessons IS '总课程数';
COMMENT ON COLUMN family_learning_courses.completed_lessons IS '已完成课程数';
COMMENT ON COLUMN family_learning_courses.progress IS '完成进度 (0-100)';
COMMENT ON COLUMN family_learning_courses.metadata IS '课程元数据';

-- =====================================================
-- 5. family_learning_progress 表
-- =====================================================
-- 用途: 存储成员的学习进度
-- 说明: 记录每个成员对每个课程的学习进度

CREATE TABLE IF NOT EXISTS family_learning_progress (
  -- 主键
  id TEXT PRIMARY KEY,
  
  -- 关联信息
  member_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  
  -- 进度信息
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_lesson_completed INTEGER DEFAULT 0,
  
  -- 时间戳
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 外键约束
  CONSTRAINT fk_progress_member 
    FOREIGN KEY (member_id) 
    REFERENCES family_members(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_progress_course 
    FOREIGN KEY (course_id) 
    REFERENCES family_learning_courses(id) 
    ON DELETE CASCADE,
  
  -- 唯一约束
  CONSTRAINT unique_member_course UNIQUE (member_id, course_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_family_learning_progress_member_id ON family_learning_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_family_learning_progress_course_id ON family_learning_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_family_learning_progress_progress ON family_learning_progress(progress DESC);

-- 添加注释
COMMENT ON TABLE family_learning_progress IS '成员学习进度表';
COMMENT ON COLUMN family_learning_progress.id IS '进度记录唯一标识';
COMMENT ON COLUMN family_learning_progress.member_id IS '成员ID';
COMMENT ON COLUMN family_learning_progress.course_id IS '课程ID';
COMMENT ON COLUMN family_learning_progress.progress IS '完成进度 (0-100)';
COMMENT ON COLUMN family_learning_progress.last_lesson_completed IS '最后完成的课程序号';
COMMENT ON COLUMN family_learning_progress.started_at IS '开始学习时间';
COMMENT ON COLUMN family_learning_progress.completed_at IS '完成时间';
COMMENT ON COLUMN family_learning_progress.updated_at IS '更新时间';

-- =====================================================
-- 6. family_growth_records 表
-- =====================================================
-- 用途: 存储成员的成长记录
-- 说明: 记录成员的每日成长数据

CREATE TABLE IF NOT EXISTS family_growth_records (
  -- 主键
  id TEXT PRIMARY KEY,
  
  -- 成长信息
  member_id TEXT NOT NULL,
  date DATE NOT NULL,
  contribution INTEGER DEFAULT 0,
  mood TEXT,
  activities INTEGER DEFAULT 0,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 外键约束
  CONSTRAINT fk_growth_member 
    FOREIGN KEY (member_id) 
    REFERENCES family_members(id) 
    ON DELETE CASCADE,
  
  -- 唯一约束
  CONSTRAINT unique_member_date UNIQUE (member_id, date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_family_growth_records_member_id ON family_growth_records(member_id);
CREATE INDEX IF NOT EXISTS idx_family_growth_records_date ON family_growth_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_family_growth_records_contribution ON family_growth_records(contribution DESC);

-- 添加注释
COMMENT ON TABLE family_growth_records IS '成员成长记录表';
COMMENT ON COLUMN family_growth_records.id IS '成长记录唯一标识';
COMMENT ON COLUMN family_growth_records.member_id IS '成员ID';
COMMENT ON COLUMN family_growth_records.date IS '日期';
COMMENT ON COLUMN family_growth_records.contribution IS '当日贡献度';
COMMENT ON COLUMN family_growth_records.mood IS '当日心情';
COMMENT ON COLUMN family_growth_records.activities IS '当日活动数';
COMMENT ON COLUMN family_growth_records.created_at IS '记录创建时间';

-- =====================================================
-- 7. family_settings 表
-- =====================================================
-- 用途: 存储家庭系统设置
-- 说明: 对应 FamilyStore.ts 中的 FamilySettings 类型

CREATE TABLE IF NOT EXISTS family_settings (
  -- 主键
  id TEXT PRIMARY KEY DEFAULT 'global',
  
  -- 设置项
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  language TEXT NOT NULL DEFAULT 'zh-CN' CHECK (language IN ('zh-CN', 'en-US')),
  notifications BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  auto_sync BOOLEAN DEFAULT TRUE,
  sync_interval INTEGER DEFAULT 300000, -- 5 分钟 (毫秒)
  
  -- 时间戳
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加注释
COMMENT ON TABLE family_settings IS '家庭系统设置表';
COMMENT ON COLUMN family_settings.id IS '设置ID (默认为 global)';
COMMENT ON COLUMN family_settings.theme IS '主题 (dark/light)';
COMMENT ON COLUMN family_settings.language IS '语言 (zh-CN/en-US)';
COMMENT ON COLUMN family_settings.notifications IS '是否启用通知';
COMMENT ON COLUMN family_settings.sound_enabled IS '是否启用声音';
COMMENT ON COLUMN family_settings.auto_sync IS '是否自动同步';
COMMENT ON COLUMN family_settings.sync_interval IS '同步间隔 (毫秒)';
COMMENT ON COLUMN family_settings.updated_at IS '更新时间';

-- =====================================================
-- 8. 初始化数据
-- =====================================================

-- 插入默认设置
INSERT INTO family_settings (id, theme, language, notifications, sound_enabled, auto_sync, sync_interval)
VALUES ('global', 'dark', 'zh-CN', TRUE, TRUE, TRUE, 300000)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 9. 创建触发器
-- =====================================================

-- 更新 updated_at 触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 family_members 表创建触发器
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 family_learning_courses 表创建触发器
CREATE TRIGGER update_family_learning_courses_updated_at
  BEFORE UPDATE ON family_learning_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 family_learning_progress 表创建触发器
CREATE TRIGGER update_family_learning_progress_updated_at
  BEFORE UPDATE ON family_learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 family_settings 表创建触发器
CREATE TRIGGER update_family_settings_updated_at
  BEFORE UPDATE ON family_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. 创建视图
-- =====================================================

-- 成员统计视图
CREATE OR REPLACE VIEW family_member_stats AS
SELECT 
  fm.id,
  fm.name,
  fm.short_name,
  fm.status,
  fm.contribution,
  fm.growth,
  fm.streak,
  COUNT(DISTINCT fa.id) AS activity_count,
  COUNT(DISTINCT CASE WHEN fm.read = FALSE THEN fm.id END) AS unread_message_count
FROM family_members fm
LEFT JOIN family_activities fa ON fm.id = fa.member_id
LEFT JOIN family_messages fm_msg ON fm.id = fm_msg.from_member_id
GROUP BY fm.id, fm.name, fm.short_name, fm.status, fm.contribution, fm.growth, fm.streak;

COMMENT ON VIEW family_member_stats IS '成员统计视图';

-- =====================================================
-- 11. Row Level Security (RLS) 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;

-- 创建策略 (示例，根据实际需求调整)
-- 允许所有读取
CREATE POLICY "Allow read access" ON family_members FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON family_activities FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON family_messages FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON family_learning_courses FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON family_learning_progress FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON family_growth_records FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON family_settings FOR SELECT USING (true);

-- 允许所有插入
CREATE POLICY "Allow insert access" ON family_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert access" ON family_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert access" ON family_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert access" ON family_learning_courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert access" ON family_learning_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert access" ON family_growth_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert access" ON family_settings FOR INSERT WITH CHECK (true);

-- 允许所有更新
CREATE POLICY "Allow update access" ON family_members FOR UPDATE USING (true);
CREATE POLICY "Allow update access" ON family_activities FOR UPDATE USING (true);
CREATE POLICY "Allow update access" ON family_messages FOR UPDATE USING (true);
CREATE POLICY "Allow update access" ON family_learning_courses FOR UPDATE USING (true);
CREATE POLICY "Allow update access" ON family_learning_progress FOR UPDATE USING (true);
CREATE POLICY "Allow update access" ON family_growth_records FOR UPDATE USING (true);
CREATE POLICY "Allow update access" ON family_settings FOR UPDATE USING (true);

-- 允许所有删除
CREATE POLICY "Allow delete access" ON family_members FOR DELETE USING (true);
CREATE POLICY "Allow delete access" ON family_activities FOR DELETE USING (true);
CREATE POLICY "Allow delete access" ON family_messages FOR DELETE USING (true);
CREATE POLICY "Allow delete access" ON family_learning_courses FOR DELETE USING (true);
CREATE POLICY "Allow delete access" ON family_learning_progress FOR DELETE USING (true);
CREATE POLICY "Allow delete access" ON family_growth_records FOR DELETE USING (true);
CREATE POLICY "Allow delete access" ON family_settings FOR DELETE USING (true);

-- =====================================================
-- 完成
-- =====================================================
