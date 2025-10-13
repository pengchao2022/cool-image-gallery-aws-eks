-- Enable trigram extension for better text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 修改 users 表创建语句，添加 role 字段
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',  -- 添加这行
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create comics table
CREATE TABLE IF NOT EXISTS comics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags VARCHAR(500),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_urls TEXT[] NOT NULL,
    views INTEGER DEFAULT 0,  -- 新增 views 列，默认值为 0
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comics_user_id ON comics(user_id);
CREATE INDEX IF NOT EXISTS idx_comics_created_at ON comics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comics_tags ON comics USING gin(tags gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_comics_views ON comics(views DESC);  -- 新增按浏览量索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comics_updated_at ON comics;
CREATE TRIGGER update_comics_updated_at
    BEFORE UPDATE ON comics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();