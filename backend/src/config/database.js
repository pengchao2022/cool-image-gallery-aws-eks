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

// 测试连接
sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL 连接成功');
  })
  .catch(err => {
    console.error('❌ PostgreSQL 连接失败:', err);
  });

export { sequelize };