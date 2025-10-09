import pkg from 'pg';
const { Pool } = pkg;
import { config, validateConfig } from './constants.js';

// 在生产环境启动时验证配置
if (process.env.NODE_ENV === 'production') {
  validateConfig();
}

const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
    return pool;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};

export const query = (text, params) => pool.query(text, params);

export default pool;