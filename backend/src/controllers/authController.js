import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // 修改：改为默认导入
import { sequelize } from '../config/database.js';
import { config } from '../config/constants.js';  // 导入配置

const JWT_SECRET = config.JWT_SECRET;  // 使用配置中的 JWT_SECRET

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email and password are required' 
      });
    }

    // 使用原始查询检查用户是否存在
    const [existingUsers] = await sequelize.query(
      `SELECT * FROM users WHERE email = :email OR username = :username`,
      {
        replacements: { email, username },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'User already exists with this email or username' 
      });
    }

    // 手动加密密码
    const password_hash = await bcrypt.hash(password, 10);

    // 使用原始查询插入用户
    const [result] = await sequelize.query(
      `INSERT INTO users (username, email, password_hash, created_at, updated_at) 
       VALUES (:username, :email, :password_hash, NOW(), NOW()) 
       RETURNING id, username, email, role, created_at`,
      {
        replacements: { username, email, password_hash },
        type: sequelize.QueryTypes.INSERT
      }
    );

    const user = Array.isArray(result) ? result[0] : result;

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }  // 使用配置的过期时间 (7天)
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 检查必填字段
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // 从数据库查找用户 - 修复查询语法
    const users = await sequelize.query(
      'SELECT * FROM users WHERE email = :email',
      {
        replacements: { email },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }  // 使用配置的过期时间 (7天)
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    // 检查用户是否已认证
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const users = await sequelize.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = :userId',
      {
        replacements: { userId: req.user.userId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 修改这里：直接返回用户对象，而不是 { user: user }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile: ' + error.message });
  }
};

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization check failed.' });
  }
};