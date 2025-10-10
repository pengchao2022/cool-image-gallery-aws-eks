// PostgreSQL database configuration
import { Sequelize } from 'sequelize';

// 验证必要的环境变量
const validateEnvironmentVariables = () => {
  const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'];
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ All required database environment variables are set');
  console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
};

// 从环境变量获取数据库连接信息（移除所有默认值）
const sequelize = new Sequelize(
  process.env.DB_NAME,      // 移除 || 'comicdb'
  process.env.DB_USER,      // 移除 || 'comicadmin'
  process.env.DB_PASSWORD,  // 移除 || 'password'
  {
    host: process.env.DB_HOST,  // 移除 || 'localhost'
    dialect: 'postgres',
    port: process.env.DB_PORT,  // 移除 || 5432
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // 生产环境 SSL 配置
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

// 测试数据库连接
export const testConnection = async () => {
  try {
    validateEnvironmentVariables();
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    return false;
  }
};

// 添加 connectDB 函数（server.js 需要的）
export const connectDB = async () => {
  try {
    validateEnvironmentVariables();
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    throw error;
  }
};

// PostgreSQL query function
export const query = async (text, params) => {
  try {
    const result = await sequelize.query(text, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Simple query function for development (without Sequelize)
export const simpleQuery = async (text, params) => {
  // 模拟数据库查询 - 在实际应用中这里应该是真实的数据库操作
  console.log('Executing query:', text, params);
  return [{ id: 1, message: 'Mock database result' }];
};

export default sequelize;