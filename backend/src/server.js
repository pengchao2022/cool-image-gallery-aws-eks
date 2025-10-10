import app from './app.js';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // 尝试连接数据库，但即使失败也启动服务器
    console.log('🔄 Attempting to connect to database...');
    try {
      await connectDB();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.warn('⚠️ Database connection failed, but starting server anyway:', dbError.message);
      console.log('ℹ️ Application will start without database connection');
      console.log('💡 Database connections will be retried by the application');
    }

    // 启动服务器（无论数据库连接是否成功）
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log('🌟 Server is ready to accept requests');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

startServer();