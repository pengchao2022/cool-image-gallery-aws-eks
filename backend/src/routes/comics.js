import express from 'express';
import {
  uploadComic,
  getAllComics,
  getComic,
  getUserComics,
  deleteComic,
  searchComics
} from '../controllers/comicController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { upload, handleUploadErrors } from '../middleware/upload.js';

const router = express.Router();

// 添加全局调试中间件 - 记录所有访问 comic 路由的请求
router.use((req, res, next) => {
  console.log('🛣️ ========== Comic 路由被访问 ==========');
  console.log('🛣️ 请求路径:', req.path);
  console.log('🛣️ 请求方法:', req.method);
  console.log('🛣️ Content-Type:', req.headers['content-type']);
  console.log('🛣️ Authorization:', req.headers.authorization);
  console.log('🛣️ User-Agent:', req.headers['user-agent']);
  console.log('🛣️ =====================================');
  next();
});

// 上传漫画路由 - 添加详细的中间件调试
router.post('/', 
  (req, res, next) => {
    console.log('🔵 开始处理上传请求 - 第一步: 进入路由');
    console.log('🔵 请求体类型:', req.headers['content-type']);
    console.log('🔵 Authorization header:', req.headers.authorization);
    next();
  },
  authenticate, 
  (req, res, next) => {
    console.log('🟢 认证中间件通过 - 第二步: 准备文件上传');
    console.log('🟢 用户信息已设置:', req.user ? `用户ID: ${req.user.id}` : '无用户信息');
    next();
  },
  upload.array('images', 10), 
  (req, res, next) => {
    console.log('🟢 文件上传中间件完成 - 第三步: 文件处理完成');
    console.log('🟢 文件数量:', req.files ? req.files.length : 0);
    if (req.files) {
      req.files.forEach((file, index) => {
        console.log(`🟢 文件 ${index + 1}:`, file.originalname, file.size, file.mimetype);
      });
    }
    next();
  },
  handleUploadErrors, 
  (req, res, next) => {
    console.log('🟢 上传错误处理完成 - 第四步: 准备进入控制器');
    console.log('🟢 最终状态 - 用户:', req.user ? `ID: ${req.user.id}` : '无');
    console.log('🟢 最终状态 - 文件:', req.files ? `${req.files.length} 个文件` : '无');
    console.log('🟢 最终状态 - 请求体:', {
      title: req.body.title,
      description: req.body.description
    });
    next();
  },
  uploadComic
);

// 获取所有漫画
router.get('/', 
  (req, res, next) => {
    console.log('📚 获取所有漫画请求');
    next();
  },
  optionalAuth, 
  getAllComics
);

// 搜索漫画
router.get('/search', 
  (req, res, next) => {
    console.log('🔍 搜索漫画请求，关键词:', req.query.q);
    next();
  },
  optionalAuth, 
  searchComics
);

// 获取用户自己的漫画
router.get('/my-comics', 
  (req, res, next) => {
    console.log('👤 获取用户漫画请求');
    next();
  },
  authenticate, 
  getUserComics
);

// 获取单个漫画
router.get('/:id', 
  (req, res, next) => {
    console.log('📖 获取单个漫画请求，ID:', req.params.id);
    next();
  },
  optionalAuth, 
  getComic
);

// 删除漫画
router.delete('/:id', 
  (req, res, next) => {
    console.log('🗑️ 删除漫画请求，ID:', req.params.id);
    next();
  },
  authenticate, 
  deleteComic
);

// 添加测试路由用于诊断认证问题
router.post('/test-auth', 
  (req, res, next) => {
    console.log('🧪 ========== 测试认证路由 ==========');
    console.log('🧪 Authorization:', req.headers.authorization);
    console.log('🧪 Content-Type:', req.headers['content-type']);
    next();
  },
  authenticate, 
  (req, res) => {
    console.log('✅ 测试认证成功');
    res.json({
      success: true,
      message: '认证测试通过',
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      },
      headers: {
        authorization: req.headers.authorization,
        contentType: req.headers['content-type']
      }
    });
  }
);

// 添加测试文件上传路由
router.post('/test-upload', 
  (req, res, next) => {
    console.log('🧪 ========== 测试文件上传路由 ==========');
    console.log('🧪 Authorization:', req.headers.authorization);
    console.log('🧪 Content-Type:', req.headers['content-type']);
    next();
  },
  authenticate,
  upload.array('images', 1),
  handleUploadErrors,
  (req, res) => {
    console.log('✅ 测试文件上传成功');
    res.json({
      success: true,
      message: '文件上传测试通过',
      user: {
        id: req.user.id,
        username: req.user.username
      },
      files: req.files ? req.files.map(f => ({
        name: f.originalname,
        size: f.size,
        type: f.mimetype
      })) : [],
      headers: {
        authorization: req.headers.authorization,
        contentType: req.headers['content-type']
      }
    });
  }
);

export default router;