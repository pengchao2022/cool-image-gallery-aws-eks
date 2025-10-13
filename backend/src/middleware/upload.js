import multer from 'multer';

// 配置 multer
const storage = multer.memoryStorage();

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
    }
    
    return res.status(400).json({ 
      success: false, 
      message: `上传错误: ${error.message}` 
    });
    
  } else if (error) {
    console.log('❌ 上传错误:', error.message);
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
  
  console.log('✅ 上传错误处理完成，无错误');
  next();
};