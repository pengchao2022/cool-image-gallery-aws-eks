import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sequelize } from '../config/database.js'; // 添加这行导入

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        $or: [
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