// Auth controller with mock data for PostgreSQL
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockUsers } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req, res) => {
    try {
        // 这里应该是数据库插入操作
        // 暂时使用模拟数据
        res.status(201).json({
            message: 'User registered successfully',
            user: { id: 3, username: req.body.username, email: req.body.email }
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 模拟用户查找 - 在实际应用中这里应该是数据库查询
        const user = mockUsers.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 模拟密码验证
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

export const getProfile = (req, res) => {
    res.json({ user: req.user });
};

// JWT token verification middleware
export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Admin authorization middleware  
export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
};
