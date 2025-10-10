import express from 'express';
import { query } from '../config/database.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        // 模拟用户数据
        const user = {
            id: req.user.userId,
            username: 'testuser',
            email: req.user.email,
            role: req.user.role
        };
        res.json(user);
    } catch (error) {
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

export default router;
