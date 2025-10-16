const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 创建 PostgreSQL 连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 测试数据库连接
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// 健康检查
app.get('/health', async (req, res) => {
  try {
    // 测试数据库连接
    await pool.query('SELECT 1');
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'community-service',
      database: 'connected'
    };
    res.json(health);
  } catch (error) {
    const health = {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'community-service',
      database: 'disconnected',
      error: error.message
    };
    res.status(503).json(health);
  }
});

// 创建内存版本的路由（临时解决方案）
const createMemoryRoutes = () => {
  const router = express.Router();
  
  // 讨论路由
  router.get('/', (req, res) => {
    res.json({
      success: true,
      discussions: [],
      message: 'Using memory mode - discussions API is working'
    });
  });
  
  router.get('/:id', (req, res) => {
    res.json({
      success: true,
      discussion: { id: req.params.id, title: 'Sample Discussion' },
      message: 'Using memory mode - discussion retrieved'
    });
  });
  
  router.post('/', (req, res) => {
    res.status(201).json({
      success: true,
      discussion: { id: Date.now(), ...req.body },
      message: 'Using memory mode - discussion created'
    });
  });
  
  return router;
};

const createMemoryReplyRoutes = () => {
  const router = express.Router();
  
  router.get('/', (req, res) => {
    res.json({
      success: true,
      replies: [],
      message: 'Using memory mode - replies API is working'
    });
  });
  
  router.post('/', (req, res) => {
    res.status(201).json({
      success: true,
      reply: { id: Date.now(), ...req.body },
      message: 'Using memory mode - reply created'
    });
  });
  
  return router;
};

// 尝试加载真实路由，失败时使用内存版本
let discussionsRoutes;
let repliesRoutes;

try {
  discussionsRoutes = require('./routes/discussion');
  console.log('✅ Loaded discussions routes from file');
} catch (error) {
  console.log('⚠️ Using memory discussions routes:', error.message);
  discussionsRoutes = createMemoryRoutes();
}

try {
  repliesRoutes = require('./routes/replies');
  console.log('✅ Loaded replies routes from file');
} catch (error) {
  console.log('⚠️ Using memory replies routes:', error.message);
  repliesRoutes = createMemoryReplyRoutes();
}

// 路由
app.use('/api/discussions', discussionsRoutes);
app.use('/api/replies', repliesRoutes);

// 基础 API 测试端点
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Community Service API is working!',
    timestamp: new Date().toISOString(),
    mode: 'PostgreSQL + Express'
  });
});

// WebSocket 实时通信
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('join-discussion', (discussionId) => {
    socket.join(`discussion:${discussionId}`);
    console.log(`👥 User ${socket.id} joined discussion ${discussionId}`);
  });
  
  socket.on('new-reply', (data) => {
    socket.to(`discussion:${data.discussionId}`).emit('reply-added', data);
    console.log(`💬 New reply in discussion ${data.discussionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 Community service running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'PostgreSQL configured' : 'No database configured'}`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await pool.end();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, pool };