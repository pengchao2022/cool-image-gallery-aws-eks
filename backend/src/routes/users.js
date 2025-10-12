import express from 'express';
import { query } from '../config/database.js';
import { verifyToken, getProfile } from '../controllers/authController.js';

const router = express.Router();

// Get user profile - 修改这里：直接调用 getProfile 控制器
router.get('/profile', verifyToken, async (req, res) => {
    try {
        // 直接调用 getProfile 控制器，它会从数据库查询真实数据
        await getProfile(req, res);
    } catch (error) {
        console.error('Profile route error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user's favorite comics
router.get('/favorites', verifyToken, async (req, res) => {
    try {
        // 模拟收藏数据
        const favorites = [
            { id: 1, title: 'Favorite Comic 1' },
            { id: 2, title: 'Favorite Comic 2' }
        ];
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// 新增：获取用户注册时间
router.get('/registration-date/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('🔍 查询用户注册时间，用户ID:', userId);
        
        // 查询数据库获取用户的注册时间
        const result = await query(
            'SELECT id, username, created_at FROM users WHERE id = $1',
            [userId]
        );
        
        console.log('📊 查询结果:', result.rows);
        
        if (result.rows.length > 0) {
            res.json({ 
                success: true,
                user_id: result.rows[0].id,
                username: result.rows[0].username,
                created_at: result.rows[0].created_at 
            });
        } else {
            res.status(404).json({ 
                success: false,
                error: '用户未找到' 
            });
        }
    } catch (error) {
        console.error('❌ 获取注册时间错误:', error);
        res.status(500).json({ 
            success: false,
            error: '服务器错误' 
        });
    }
});

// 新增：获取用户详细信息（包含注册时间）
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🔍 获取用户详情，用户ID:', id);
        
        const result = await query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [id]
        );
        
        console.log('📊 用户详情结果:', result.rows);
        
        if (result.rows.length > 0) {
            res.json({ 
                success: true,
                user: result.rows[0]
            });
        } else {
            res.status(404).json({ 
                success: false,
                error: '用户未找到' 
            });
        }
    } catch (error) {
        console.error('❌ 获取用户信息错误:', error);
        res.status(500).json({ 
            success: false,
            error: '服务器错误' 
        });
    }
});

export default router;