import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

    // 读取 SQL 文件
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'migration.sql');
    console.log(`📖 Reading SQL file: ${sqlFilePath}`);
    
    const migrationSQL = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('✅ SQL file loaded successfully');

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