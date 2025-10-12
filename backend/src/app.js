import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import comicRoutes from './routes/comics.js';
import userRoutes from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// CORS - 极简智能配置（推荐使用这个）
app.use(cors({
  origin: function (origin, callback) {
    // 记录请求来源（可选）
    if (origin) {
      console.log('🌐 请求来源:', origin);
    }
    // 允许所有来源，依赖其他安全措施
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/comics', comicRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;