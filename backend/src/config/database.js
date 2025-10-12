// src/config/database.js
import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// connectDB 函数
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL 连接成功');
    return sequelize;
  } catch (error) {
    console.error('❌ PostgreSQL 连接失败:', error);
    throw error;
  }
};

// query 函数
export const query = (sql, params) => {
  return sequelize.query(sql, {
    replacements: params,
    type: sequelize.QueryTypes.SELECT
  });
};

// 导出 sequelize 实例
export { sequelize };

// 原有的测试连接代码可以移除，因为现在有 connectDB 函数了