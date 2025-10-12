import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/constants.js';  // 导入配置

// 添加详细的调试信息
console.log('=== AUTH.JS 调试信息 ===');
console.log('🔧 配置文件路径: ../config/constants.js');
console.log('🔧 config.JWT_SECRET:', config.JWT_SECRET ? `已设置 (长度: ${config.JWT_SECRET.length})` : '未设置');
console.log('🔧 config.JWT_EXPIRES_IN:', config.JWT_EXPIRES_IN);
console.log('🔧 process.env.JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
console.log('🔧 当前工作目录:', process.cwd());
console.log('========================');

export const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 authenticate 中间件被调用');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ 未提供 token');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    console.log('🔑 验证 token, 使用 JWT_SECRET:', config.JWT_SECRET ? '已设置' : '未设置');
    
    const decoded = jwt.verify(token, config.JWT_SECRET);  // 使用配置的 JWT_SECRET
    console.log('✅ Token 解码成功, userId:', decoded.userId);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('❌ 用户不存在, userId:', decoded.userId);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }

    console.log('✅ 用户验证成功:', user.username);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Token 验证错误:', error.message);
    console.error('❌ 错误详情:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};