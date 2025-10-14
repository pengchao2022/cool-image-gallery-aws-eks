const User = require('../models/User');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');

const userController = {
  // 更新用户头像
  updateAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请选择头像文件'
        });
      }

      const userId = req.user.id;
      
      // 上传到 S3
      const result = await uploadToS3(req.file, 'avatars');
      
      // 获取旧头像URL用于删除
      const user = await User.findById(userId);
      const oldAvatarUrl = user.avatar;
      
      // 更新用户头像
      await User.updateAvatar(userId, result.url);
      
      // 如果存在旧头像，从S3删除
      if (oldAvatarUrl) {
        try {
          await deleteFromS3(oldAvatarUrl);
        } catch (deleteError) {
          console.error('删除旧头像失败:', deleteError);
          // 不阻止整个操作，只是记录错误
        }
      }

      res.json({
        success: true,
        message: '头像更新成功',
        avatarUrl: result.url
      });

    } catch (error) {
      console.error('更新头像失败:', error);
      res.status(500).json({
        success: false,
        message: '头像更新失败'
      });
    }
  },

  // 删除用户头像
  removeAvatar: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user.avatar) {
        return res.status(400).json({
          success: false,
          message: '用户没有设置头像'
        });
      }

      // 从S3删除头像文件
      try {
        await deleteFromS3(user.avatar);
      } catch (deleteError) {
        console.error('删除S3头像文件失败:', deleteError);
      }

      // 更新用户记录，移除头像
      await User.removeAvatar(userId);

      res.json({
        success: true,
        message: '头像删除成功'
      });

    } catch (error) {
      console.error('删除头像失败:', error);
      res.status(500).json({
        success: false,
        message: '头像删除失败'
      });
    }
  },

  // 获取用户信息
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({
        success: false,
        message: '获取用户信息失败'
      });
    }
  }
};

module.exports = userController;