// PostgreSQL database configuration
import { Sequelize } from 'sequelize';

// 从环境变量获取数据库连接信息
const sequelize = new Sequelize(
    process.env.DB_NAME || 'comicdb',
    process.env.DB_USER || 'comicadmin', 
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// 测试数据库连接
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to PostgreSQL:', error);
        return false;
    }
};

// 添加 connectDB 函数（server.js 需要的）
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error);
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