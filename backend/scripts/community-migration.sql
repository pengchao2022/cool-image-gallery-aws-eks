-- backend/scripts/community-migration.sql
-- Community Service 数据库迁移脚本

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建讨论表
CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    comic_id UUID,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建回复表
CREATE TABLE IF NOT EXISTS replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    parent_reply_id UUID REFERENCES replies(id),
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建讨论点赞表
CREATE TABLE IF NOT EXISTS discussion_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(discussion_id, user_id)
);

-- 创建回复点赞表
CREATE TABLE IF NOT EXISTS reply_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reply_id UUID NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reply_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_discussions_author_id ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_comic_id ON discussions(comic_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at);
CREATE INDEX IF NOT EXISTS idx_discussions_pinned ON discussions(is_pinned, created_at);

CREATE INDEX IF NOT EXISTS idx_replies_discussion_id ON replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_replies_author_id ON replies(author_id);
CREATE INDEX IF NOT EXISTS idx_replies_parent_id ON replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON replies(created_at);

CREATE INDEX IF NOT EXISTS idx_discussion_likes_discussion_id ON discussion_likes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_likes_user_id ON discussion_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_reply_id ON reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_user_id ON reply_likes(user_id);

-- 更新讨论回复计数的函数
CREATE OR REPLACE FUNCTION update_discussion_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussions 
        SET reply_count = reply_count + 1,
            last_reply_at = CURRENT_TIMESTAMP
        WHERE id = NEW.discussion_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussions 
        SET reply_count = reply_count - 1
        WHERE id = OLD.discussion_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS update_reply_count_on_insert ON replies;
CREATE TRIGGER update_reply_count_on_insert
    AFTER INSERT ON replies
    FOR EACH ROW EXECUTE FUNCTION update_discussion_reply_count();

DROP TRIGGER IF EXISTS update_reply_count_on_delete ON replies;
CREATE TRIGGER update_reply_count_on_delete
    AFTER DELETE ON replies
    FOR EACH ROW EXECUTE FUNCTION update_discussion_reply_count();

-- 插入示例数据（可选）
INSERT INTO discussions (id, title, content, author_id, comic_id, is_pinned) VALUES
    (uuid_generate_v4(), '欢迎来到社区讨论区', '欢迎大家在这里分享关于漫画的想法和讨论！', uuid_generate_v4(), NULL, true),
    (uuid_generate_v4(), '最新漫画推荐', '大家最近在看什么好看的漫画？来分享一下！', uuid_generate_v4(), NULL, false)
ON CONFLICT (id) DO NOTHING;

-- 为 Community 用户授予权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO community_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO community_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO community_user;

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO community_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO community_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO community_user;

-- 输出完成信息
DO $$ BEGIN
    RAISE NOTICE '✅ Community database schema setup completed successfully!';
END $$;