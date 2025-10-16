// src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 测试连接
pool.on('connect', () => {
  console.log('✅ 连接到 PostgreSQL 数据库');
});

pool.on('error', (err) => {
  console.error('❌ 数据库连接错误:', err);
});

module.exports = pool;