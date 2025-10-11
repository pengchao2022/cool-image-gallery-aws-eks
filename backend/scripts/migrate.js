import pg from 'pg';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const { Client } = pg;

// 数据库连接配置
const dbConfig = {
  host: process.env.RDS_HOST || process.env.DB_HOST,
  port: process.env.RDS_PORT || process.env.DB_PORT || 5432,
  user: process.env.RDS_USERNAME || process.env.DB_USERNAME,
  password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.RDS_DATABASE || process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// 迁移 SQL 语句
const migrationSQL = `
-- Enable trigram extension for better text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comics_user_id ON comics(user_id);
CREATE INDEX IF NOT EXISTS idx_comics_created_at ON comics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comics_tags ON comics USING gin(tags gin_trgm_ops);
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
`;

async function runMigration() {
  console.log('🚀 Starting database migration...');
  console.log('📊 Database configuration:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

  const client = new Client(dbConfig);

  try {
    // 连接数据库
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully');

    // 执行迁移
    console.log('🗃 Running migration SQL...');
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully');

    // 验证表创建
    console.log('🔍 Verifying table creation...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // 验证扩展
    const extensionsResult = await client.query(`
      SELECT extname 
      FROM pg_extension 
      WHERE extname = 'pg_trgm';
    `);

    if (extensionsResult.rows.length > 0) {
      console.log('✅ pg_trgm extension enabled');
    } else {
      console.log('❌ pg_trgm extension not found');
    }

    // 验证索引
    const indexesResult = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);

    console.log('📑 Created indexes:');
    indexesResult.rows.forEach(row => {
      console.log(`   - ${row.indexname} (on ${row.tablename})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed');
  }
}

// 如果是直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration };