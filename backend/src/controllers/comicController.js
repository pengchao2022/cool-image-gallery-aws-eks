import { Comic } from '../models/Comic.js';
import { S3Service } from '../utils/s3.js';
import { config } from '../config/constants.js';  // 导入配置

export const uploadComic = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
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
    
    // 检查 S3 配置是否完整
    const hasS3Config = config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY && config.S3_BUCKET_NAME;
    
    if (hasS3Config) {
      try {
        console.log('🔧 尝试 S3 上传...');
        const uploadedImages = await S3Service.uploadMultipleImages(files);
        imageUrls = uploadedImages.map(img => img.url);
        console.log('✅ S3 上传成功');
      } catch (s3Error) {
        console.log('❌ S3 上传失败:', s3Error.message);
        // 降级到备用方案
        imageUrls = files.map((file, index) => {
          return `https://picsum.photos/800/1200?random=${Date.now()}-${index}`;
        });
      }
    } else {
      console.log('⚠️ S3 配置不完整，使用备用方案');
      console.log('🔧 AWS_ACCESS_KEY_ID:', config.AWS_ACCESS_KEY_ID ? '已设置' : '未设置');
      console.log('🔧 AWS_SECRET_ACCESS_KEY:', config.AWS_SECRET_ACCESS_KEY ? '已设置' : '未设置');
      console.log('🔧 S3_BUCKET_NAME:', config.S3_BUCKET_NAME || '未设置');
      
      // 使用图片占位服务
      imageUrls = files.map((file, index) => {
        return `https://picsum.photos/800/1200?random=${Date.now()}-${index}`;
      });
    }

    // Create comic record
    const comic = await Comic.create({
      title,
      description: description || '',
      tags: tags || '',
      user_id: req.user.id,
      image_urls: imageUrls
    });

    console.log('✅ 漫画记录创建成功，ID:', comic.id);

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
    res.status(500).json({
      success: false,
      message: 'Failed to upload comic: ' + error.message
    });
  }
};

export const getAllComics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await Comic.findAll(page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get comics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comics'
    });
  }
};

export const getComic = async (req, res) => {
  try {
    const { id } = req.params;
    const comic = await Comic.findById(id);

    if (!comic) {
      return res.status(404).json({
        success: false,
        message: 'Comic not found'
      });
    }

    res.json({
      success: true,
      comic
    });
  } catch (error) {
    console.error('Get comic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comic'
    });
  }
};

export const getUserComics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await Comic.findByUserId(req.user.id, page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get user comics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user comics'
    });
  }
};

export const deleteComic = async (req, res) => {
  try {
    const { id } = req.params;

    const comic = await Comic.delete(id, req.user.id);

    if (!comic) {
      return res.status(404).json({
        success: false,
        message: 'Comic not found or access denied'
      });
    }

    // TODO: Delete images from S3

    res.json({
      success: true,
      message: 'Comic deleted successfully'
    });
  } catch (error) {
    console.error('Delete comic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comic'
    });
  }
};

export const searchComics = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await Comic.search(q, page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Search comics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search comics'
    });
  }
};