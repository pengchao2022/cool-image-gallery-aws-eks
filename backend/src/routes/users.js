import express from 'express';
import { query } from '../config/database.js';
import { verifyToken, getProfile } from '../controllers/authController.js';
import { upload } from '../middleware/upload.js';
import { uploadToS3, deleteFromS3 } from '../utils/s3.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
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

// 更新用户头像
router.put('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请选择头像文件'
            });
        }

        const userId = req.user.id;
        
        console.log('🔄 开始上传头像，用户ID:', userId);
        console.log('📁 文件信息:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // 检查文件类型
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: '只支持图片文件格式'
            });
        }

        // 检查文件大小 (限制为2MB)
        if (req.file.size > 2 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: '图片大小不能超过2MB'
            });
        }

        // 获取用户当前的头像信息
        const userResult = await query(
            'SELECT avatar FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const oldAvatarUrl = userResult.rows[0].avatar;

        // 上传到 S3
        console.log('☁️ 上传头像到S3...');
        const avatarUrl = await uploadToS3(req.file, 'avatars', userId);
        console.log('✅ S3上传成功，URL:', avatarUrl);

        // 更新数据库中的头像URL
        console.log('💾 更新数据库头像信息...');
        await query(
            'UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [avatarUrl, userId]
        );

        // 如果存在旧头像，从S3删除
        if (oldAvatarUrl) {
            try {
                console.log('🗑️ 删除旧头像:', oldAvatarUrl);
                await deleteFromS3(oldAvatarUrl);
            } catch (deleteError) {
                console.error('删除旧头像失败:', deleteError);
                // 不阻止整个操作，只是记录错误
            }
        }

        console.log('✅ 头像更新完成');
        res.json({
            success: true,
            message: '头像更新成功',
            avatarUrl: avatarUrl
        });

    } catch (error) {
        console.error('❌ 更新头像失败:', error);
        res.status(500).json({
            success: false,
            message: '头像更新失败: ' + error.message
        });
    }
});

// 删除用户头像
router.delete('/avatar', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('🗑️ 开始删除头像，用户ID:', userId);

        // 获取用户当前的头像信息
        const userResult = await query(
            'SELECT avatar FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const avatarUrl = userResult.rows[0].avatar;
        
        if (!avatarUrl) {
            return res.status(400).json({
                success: false,
                message: '用户没有设置头像'
            });
        }

        // 从S3删除头像文件
        try {
            console.log('☁️ 从S3删除头像文件:', avatarUrl);
            await deleteFromS3(avatarUrl);
        } catch (deleteError) {
            console.error('删除S3头像文件失败:', deleteError);
            // 继续执行，不中断
        }

        // 更新数据库，移除头像
        console.log('💾 更新数据库，移除头像字段...');
        await query(
            'UPDATE users SET avatar = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [userId]
        );

        console.log('✅ 头像删除完成');
        res.json({
            success: true,
            message: '头像删除成功'
        });

    } catch (error) {
        console.error('❌ 删除头像失败:', error);
        res.status(500).json({
            success: false,
            message: '头像删除失败: ' + error.message
        });
    }
});

// Get user's favorite comics
router.get('/favorites', verifyToken, async (req, res) => {
    try {
        const favorites = [
            { id: 1, title: 'Favorite Comic 1' },
            { id: 2, title: 'Favorite Comic 2' }
        ];
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// 获取用户注册时间
router.get('/registration-date/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('🔍 查询用户注册时间，用户ID:', userId);
        
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

// 获取用户详细信息（包含注册时间）
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🔍 获取用户详情，用户ID:', id);
        
        const result = await query(
            'SELECT id, username, email, created_at, avatar FROM users WHERE id = $1',
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