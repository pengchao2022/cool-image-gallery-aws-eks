import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sequelize } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 修复：使用正确的 Sequelize 查询语法
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email or username' 
      });
    }

    // 手动加密密码
    const password_hash = await bcrypt.hash(password, 10);

    // 使用原始查询插入用户（绕过 Sequelize 钩子问题）
    const [result] = await sequelize.query(
      `INSERT INTO users (username, email, password_hash, created_at, updated_at) 
       VALUES (:username, :email, :password_hash, NOW(), NOW()) 
       RETURNING id, username, email, role, created_at`,
      {
        replacements: { username, email, password_hash },
        type: sequelize.QueryTypes.INSERT
      }
    );

    const user = result[0];

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'User already exists with this email or username'
      });
    }

    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
};

// 添加缺失的 login 函数
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 从数据库查找用户
    const [users] = await sequelize.query(
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
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// 添加缺失的 getProfile 函数
export const getProfile = async (req, res) => {
  try {
    const [users] = await sequelize.query(
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
    
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// 添加缺失的 verifyToken 中间件
export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// 添加缺失的 requireAdmin 中间件
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};