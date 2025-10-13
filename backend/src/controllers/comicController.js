import Comic from '../models/Comic.js';  // 修改：改为默认导入
import { S3Service } from '../utils/s3.js';
import { config } from '../config/constants.js';

export const uploadComic = async (req, res) => {
  try {
    console.log('🎯 ========== uploadComic 控制器开始 ==========');
    console.log('🎯 用户信息:', req.user ? {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    } : '❌ 无用户信息 - 这可能说明认证中间件有问题');
    
    console.log('🎯 请求体内容:', {
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags
    });
    
    console.log('🎯 文件信息:', req.files ? {
      fileCount: req.files.length,
      fileNames: req.files.map(f => f.originalname),
      fileSizes: req.files.map(f => f.size),
      fileTypes: req.files.map(f => f.mimetype)
    } : '❌ 无文件信息');

    const { title, description, tags } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      console.log('❌ 没有接收到文件');
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    console.log('📁 接收到文件:', files.map(f => ({
      name: f.originalname,
      size: f.size,
      mimetype: f.mimetype
    })));

    let imageUrls;
    
    // 修改：使用 IAM Role 时只需要 Bucket Name，不需要 Access Key
    const hasS3Config = config.S3_BUCKET_NAME && config.S3_BUCKET_NAME !== '';
    
    console.log('🔧 S3 配置检查:', {
      AWS_ACCESS_KEY_ID: config.AWS_ACCESS_KEY_ID ? '已设置' : '未设置 (使用 IAM Role)',
      AWS_SECRET_ACCESS_KEY: config.AWS_SECRET_ACCESS_KEY ? '已设置' : '未设置 (使用 IAM Role)',
      S3_BUCKET_NAME: config.S3_BUCKET_NAME || '未设置',
      AWS_REGION: config.AWS_REGION || '未设置',
      '完整配置': hasS3Config ? '✅ 完整 (使用 IAM Role)' : '❌ 不完整'
    });
    
    if (hasS3Config) {
      try {
        console.log('🔧 开始 S3 上传...');
        console.log('🔧 S3 配置详情:', {
          bucket: config.S3_BUCKET_NAME,
          region: config.AWS_REGION || 'us-east-1',
          hasAccessKey: !!config.AWS_ACCESS_KEY_ID,
          hasSecretKey: !!config.AWS_SECRET_ACCESS_KEY,
          filesCount: files.length
        });
        
        const uploadedImages = await S3Service.uploadMultipleImages(files);
        imageUrls = uploadedImages.map(img => img.url);
        console.log('✅ S3 上传成功，生成URL:', imageUrls);
        
        // 验证URL是否有效
        imageUrls.forEach((url, index) => {
          if (url.includes('picsum.photos')) {
            console.log('⚠️ 警告: 生成的URL仍然是占位图片:', url);
          } else if (url.includes('s3.amazonaws.com')) {
            console.log('✅ 确认: 生成的是真实S3 URL:', url);
          }
        });
      } catch (s3Error) {
        console.log('❌ S3 上传失败:');
        console.log('❌ 错误信息:', s3Error.message);
        console.log('❌ 错误代码:', s3Error.code);
        console.log('❌ 状态码:', s3Error.statusCode);
        console.log('❌ 请求ID:', s3Error.requestId);
        console.log('❌ 区域:', s3Error.region);
        console.log('❌ 错误堆栈:', s3Error.stack);
        
        // 降级到备用方案
        console.log('🔄 降级到备用方案...');
        imageUrls = files.map((file, index) => {
          return `https://picsum.photos/800/1200?random=${Date.now()}-${index}`;
        });
        console.log('🔄 使用备用图片URL:', imageUrls);
      }
    } else {
      console.log('⚠️ S3 配置不完整，使用备用方案');
      console.log('⚠️ 缺失的配置:', {
        S3_BUCKET_NAME: config.S3_BUCKET_NAME || '未设置'
      });
      // 使用图片占位服务
      imageUrls = files.map((file, index) => {
        return `https://picsum.photos/800/1200?random=${Date.now()}-${index}`;
      });
      console.log('🔄 生成备用图片URL:', imageUrls);
    }

    console.log('💾 准备创建漫画记录到数据库...');
    console.log('💾 数据:', {
      title,
      description: description || '',
      tags: tags || '',
      user_id: req.user.id,
      image_urls: imageUrls,
      '使用真实图片': imageUrls.some(url => !url.includes('picsum.photos')) ? '✅ 是' : '❌ 否'
    });

    // Create comic record - 使用 Sequelize 的 create 方法
    const comic = await Comic.create({
      title,
      description: description || '',
      tags: tags || '',
      user_id: req.user.id,
      image_urls: imageUrls
    });

    console.log('✅ 漫画记录创建成功，ID:', comic.id);
    console.log('✅ 漫画标题:', comic.title);
    console.log('✅ 使用的图片URL:', comic.image_urls);
    console.log('✅ 是否使用真实S3图片:', comic.image_urls.some(url => !url.includes('picsum.photos')) ? '✅ 是' : '❌ 否');

    console.log('🎯 ========== uploadComic 控制器结束 ==========');
    
    res.status(201).json({
      success: true,
      message: hasS3Config ? 'Comic uploaded successfully' : 'Comic uploaded successfully (测试模式)',
      comic: {
        id: comic.id,
        title: comic.title,
        description: comic.description,
        image_urls: comic.image_urls,
        user_id: comic.user_id,
        created_at: comic.created_at
      }
    });
  } catch (error) {
    console.error('❌ Upload comic error:', error);
    console.error('❌ 错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Failed to upload comic: ' + error.message
    });
  }
};

export const getAllComics = async (req, res) => {
  try {
    console.log('📚 ========== getAllComics 控制器开始 ==========');
    console.log('📚 查询参数:', req.query);
    console.log('📚 用户信息:', req.user ? `用户ID: ${req.user.id}` : '匿名用户');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    console.log('📚 分页参数:', { page, limit });

    // 使用 Sequelize 的 findAll 方法
    const comics = await Comic.findAll({
      limit: limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']]
    });

    // 获取总数
    const total = await Comic.count();

    const realImageComicsCount = comics.filter(comic => 
      comic.image_urls && comic.image_urls.some(url => !url.includes('picsum.photos'))
    ).length;

    console.log('✅ 获取漫画成功:', {
      总数: total,
      当前页: page,
      总页数: Math.ceil(total / limit),
      漫画数量: comics?.length || 0,
      使用真实图片的漫画数量: realImageComicsCount,
      使用占位图片的漫画数量: comics.length - realImageComicsCount
    });

    res.json({
      success: true,
      comics,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get comics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comics'
    });
  }
};

export const getComic = async (req, res) => {
  try {
    console.log('📖 ========== getComic 控制器开始 ==========');
    const { id } = req.params;
    console.log('📖 请求的漫画ID:', id);
    console.log('📖 用户信息:', req.user ? `用户ID: ${req.user.id}` : '匿名用户');

    // 使用 Sequelize 的 findByPk 方法
    const comic = await Comic.findByPk(id);

    if (!comic) {
      console.log('❌ 漫画未找到，ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Comic not found'
      });
    }

    const usesRealImage = comic.image_urls && comic.image_urls.some(url => !url.includes('picsum.photos'));

    console.log('✅ 找到漫画:', {
      id: comic.id,
      title: comic.title,
      用户ID: comic.user_id,
      使用真实图片: usesRealImage ? '✅ 是' : '❌ 否',
      图片URL: comic.image_urls
    });

    res.json({
      success: true,
      comic
    });
  } catch (error) {
    console.error('❌ Get comic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comic'
    });
  }
};

export const getUserComics = async (req, res) => {
  try {
    console.log('👤 ========== getUserComics 控制器开始 ==========');
    console.log('👤 用户信息:', {
      id: req.user.id,
      username: req.user.username
    });
    console.log('👤 查询参数:', req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    console.log('👤 分页参数:', { page, limit });

    // 使用 Sequelize 的查询方法
    const comics = await Comic.findAll({
      where: { user_id: req.user.id },
      limit: limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']]
    });

    const total = await Comic.count({ where: { user_id: req.user.id } });

    const realImageComicsCount = comics.filter(comic => 
      comic.image_urls && comic.image_urls.some(url => !url.includes('picsum.photos'))
    ).length;

    console.log('✅ 获取用户漫画成功:', {
      用户ID: req.user.id,
      总数: total,
      当前页: page,
      总页数: Math.ceil(total / limit),
      漫画数量: comics?.length || 0,
      使用真实图片的漫画数量: realImageComicsCount,
      使用占位图片的漫画数量: comics.length - realImageComicsCount
    });

    res.json({
      success: true,
      comics,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get user comics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user comics'
    });
  }
};

export const deleteComic = async (req, res) => {
  try {
    console.log('🗑️ ========== deleteComic 控制器开始 ==========');
    const { id } = req.params;
    console.log('🗑️ 要删除的漫画ID:', id);
    console.log('🗑️ 用户信息:', {
      id: req.user.id,
      username: req.user.username
    });

    // 使用 Sequelize 的 destroy 方法
    const comic = await Comic.findByPk(id);
    
    if (!comic) {
      console.log('❌ 漫画未找到，漫画ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Comic not found'
      });
    }

    // 检查权限
    if (comic.user_id !== req.user.id) {
      console.log('❌ 无权删除，漫画用户ID:', comic.user_id, '当前用户ID:', req.user.id);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await comic.destroy();

    console.log('✅ 漫画删除成功:', {
      漫画ID: id,
      标题: comic.title
    });

    // TODO: Delete images from S3

    res.json({
      success: true,
      message: 'Comic deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete comic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comic'
    });
  }
};

export const searchComics = async (req, res) => {
  try {
    console.log('🔍 ========== searchComics 控制器开始 ==========');
    const { q } = req.query;
    console.log('🔍 搜索关键词:', q);
    console.log('🔍 用户信息:', req.user ? `用户ID: ${req.user.id}` : '匿名用户');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    if (!q) {
      console.log('❌ 搜索关键词为空');
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log('🔍 搜索参数:', { q, page, limit });

    // 使用 Sequelize 的搜索方法
    const { Op } = require('sequelize');
    const comics = await Comic.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { tags: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']]
    });

    const total = await Comic.count({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { tags: { [Op.iLike]: `%${q}%` } }
        ]
      }
    });

    const realImageComicsCount = comics.filter(comic => 
      comic.image_urls && comic.image_urls.some(url => !url.includes('picsum.photos'))
    ).length;

    console.log('✅ 搜索成功:', {
      关键词: q,
      总数: total,
      当前页: page,
      总页数: Math.ceil(total / limit),
      结果数量: comics?.length || 0,
      使用真实图片的结果数量: realImageComicsCount
    });

    res.json({
      success: true,
      comics,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Search comics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search comics'
    });
  }
};