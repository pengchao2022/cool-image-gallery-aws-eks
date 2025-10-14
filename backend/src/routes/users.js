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
        console.log('🔍 ========== 头像上传路由调试开始 ==========');
        console.log('🔍 req.user:', req.user);
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请选择头像文件'
            });
        }

        const userId = req.user?.userId;
        
        console.log('🔄 开始上传头像，用户ID:', userId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: '用户认证信息不完整'
            });
        }

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
        console.log('💾 查询当前头像信息...');
        const userResult = await query(
            'SELECT avatar FROM users WHERE id = ?',
            [userId]
        );

        console.log('📊 用户查询结果:', userResult);

        if (!userResult || userResult.length === 0) {
            console.error('❌ 数据库中没有找到用户，ID:', userId);
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const oldAvatarUrl = userResult[0].avatar;
        console.log('📸 当前头像URL:', oldAvatarUrl);

        // 上传到 S3
        console.log('☁️ 上传头像到S3...');
        let avatarUrl;
        try {
            avatarUrl = await uploadToS3(req.file, 'avatars', userId);
            console.log('✅ S3上传成功，URL:', avatarUrl);
        } catch (s3Error) {
            console.error('❌ S3上传失败:', s3Error);
            return res.status(500).json({
                success: false,
                message: '文件上传失败: ' + s3Error.message
            });
        }

        // 更新数据库中的头像URL
        console.log('💾 更新数据库头像信息...');
        try {
            const updateResult = await query(
                'UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [avatarUrl, userId]
            );
            console.log('📊 数据库更新结果:', updateResult);
        } catch (dbError) {
            console.error('❌ 数据库更新失败:', dbError);
            // 如果数据库更新失败，尝试删除刚上传的S3文件
            try {
                await deleteFromS3(avatarUrl);
                console.log('🗑️ 已回滚删除刚上传的S3文件');
            } catch (rollbackError) {
                console.error('❌ 回滚失败:', rollbackError);
            }
            
            return res.status(500).json({
                success: false,
                message: '数据库更新失败: ' + dbError.message
            });
        }

        // 验证数据库更新是否成功
        console.log('🔍 验证数据库更新...');
        const verifyResult = await query(
            'SELECT avatar FROM users WHERE id = ?',
            [userId]
        );
        
        if (verifyResult && verifyResult.length > 0) {
            const newAvatarUrl = verifyResult[0].avatar;
            console.log('✅ 数据库更新验证成功，新头像URL:', newAvatarUrl);
            
            if (newAvatarUrl !== avatarUrl) {
                console.error('❌ 数据库验证失败: 存储的URL与上传的URL不匹配');
                console.error('📤 上传的URL:', avatarUrl);
                console.error('💾 存储的URL:', newAvatarUrl);
            }
        } else {
            console.error('❌ 数据库验证失败: 无法获取更新后的用户数据');
        }

        // 如果存在旧头像，从S3删除
        if (oldAvatarUrl && oldAvatarUrl !== avatarUrl) {
            try {
                console.log('🗑️ 删除旧头像:', oldAvatarUrl);
                await deleteFromS3(oldAvatarUrl);
                console.log('✅ 旧头像删除成功');
            } catch (deleteError) {
                console.error('⚠️ 删除旧头像失败（不影响主要操作）:', deleteError);
            }
        }

        console.log('✅ 头像更新流程完成');
        
        // 确保返回正确的响应格式
        const response = {
            success: true,
            message: '头像更新成功',
            avatarUrl: avatarUrl
        };
        
        console.log('📤 返回响应:', response);
        res.json(response);

    } catch (error) {
        console.error('❌ 更新头像失败:', error);
        
        // 返回详细的错误信息
        const errorResponse = {
            success: false,
            message: '头像更新失败: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        
        console.error('📤 返回错误响应:', errorResponse);
        res.status(500).json(errorResponse);
    }
});

// 删除用户头像
router.delete('/avatar', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        console.log('🗑️ 开始删除头像，用户ID:', userId);

        const userResult = await query(
            'SELECT avatar FROM users WHERE id = ?',
            [userId]
        );

        if (!userResult || userResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const avatarUrl = userResult[0].avatar;
        
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
        }

        // 更新数据库，移除头像
        console.log('💾 更新数据库，移除头像字段...');
        await query(
            'UPDATE users SET avatar = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
            'SELECT id, username, created_at FROM users WHERE id = ?',
            [userId]
        );
        
        if (result && result.length > 0) {
            res.json({ 
                success: true,
                user_id: result[0].id,
                username: result[0].username,
                created_at: result[0].created_at 
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
            'SELECT id, username, email, created_at, avatar FROM users WHERE id = ?',
            [id]
        );
        
        if (result && result.length > 0) {
            res.json({ 
                success: true,
                user: result[0]
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