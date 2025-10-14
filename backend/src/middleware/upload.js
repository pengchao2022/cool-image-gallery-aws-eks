import multer from 'multer';

// 配置 multer
const storage = multer.memoryStorage();

// 通用的上传配置
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 文件过滤检查:', file.originalname, file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      console.log('✅ 文件类型验证通过');
      cb(null, true);
    } else {
      console.log('❌ 文件类型验证失败:', file.mimetype);
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 专门用于头像上传的配置（限制更严格）
export const avatarUpload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB - 头像文件更小
    files: 1 // 只允许一个文件
  },
  fileFilter: (req, file, cb) => {
    console.log('🖼️ 头像文件过滤检查:', file.originalname, file.mimetype);
    
    // 允许的图片格式
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.mimetype.startsWith('image/') && allowedMimeTypes.includes(file.mimetype)) {
      console.log('✅ 头像文件类型验证通过');
      cb(null, true);
    } else {
      console.log('❌ 头像文件类型验证失败:', file.mimetype);
      cb(new Error('只支持 JPG, PNG, GIF, WebP 格式的图片'), false);
    }
  }
});

export const handleUploadErrors = (error, req, res, next) => {
  console.log('📁 上传错误处理中间件被调用');
  
  if (error instanceof multer.MulterError) {
    console.log('❌ Multer 错误:', error.code, error.message);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: '文件大小超过限制' 
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: '文件数量超过限制' 
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false, 
        message: '意外的文件字段' 
      });
    } else if (error.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: '表单字段数量超过限制' 
      });
    }
    
    return res.status(400).json({ 
      success: false, 
      message: `上传错误: ${error.message}` 
    });
    
  } else if (error) {
    console.log('❌ 上传错误:', error.message);
    
    // 针对头像上传的特殊错误处理
    if (error.message.includes('JPG') || error.message.includes('PNG') || error.message.includes('GIF') || error.message.includes('WebP')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
  
  console.log('✅ 上传错误处理完成，无错误');
  next();
};

// 专门的头像上传错误处理
export const handleAvatarUploadErrors = (error, req, res, next) => {
  console.log('🖼️ 头像上传错误处理中间件被调用');
  
  if (error instanceof multer.MulterError) {
    console.log('❌ 头像上传 Multer 错误:', error.code, error.message);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: '头像文件大小不能超过2MB' 
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: '只能上传一个头像文件' 
      });
    }
    
    return res.status(400).json({ 
      success: false, 
      message: `头像上传错误: ${error.message}` 
    });
    
  } else if (error) {
    console.log('❌ 头像上传错误:', error.message);
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
  
  console.log('✅ 头像上传错误处理完成，无错误');
  next();
};