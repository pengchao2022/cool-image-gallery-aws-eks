import { s3, S3_CONFIG } from '../config/aws.js';
import sharp from 'sharp';

export class S3Service {
  static async uploadImage(buffer, filename, folder = 'comics') {
    try {
      console.log('📤 ========== S3 上传开始 ==========');
      console.log('📤 文件名:', filename);
      console.log('📤 原始文件大小:', buffer.length, 'bytes');
      console.log('📤 S3 Bucket:', S3_CONFIG.bucket);
      console.log('📤 AWS Region:', s3.config.region);
      console.log('📤 文件夹:', folder);
      
      // 详细检查 S3 配置
      console.log('🔧 S3 配置详细检查:');
      console.log('🔧 Bucket:', S3_CONFIG.bucket);
      console.log('🔧 Region:', s3.config.region);
      console.log('🔧 Credentials:', s3.config.credentials ? '已设置' : '未设置 (使用 IAM Role)');
      console.log('🔧 MaxRetries:', s3.config.maxRetries);
      console.log('🔧 HttpOptions:', s3.config.httpOptions);
      
      if (!S3_CONFIG.bucket) {
        console.error('❌ S3 Bucket 未配置');
        throw new Error('S3 bucket not configured');
      }

      console.log('🖼️ 开始图片优化...');
      // Optimize image
      const optimizedImage = await sharp(buffer)
        .jpeg({ quality: 80, progressive: true })
        .resize(1200, 1200, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toBuffer();
      
      console.log('🖼️ 图片优化完成');
      console.log('🖼️ 优化后文件大小:', optimizedImage.length, 'bytes');

      const key = `${folder}/${Date.now()}-${filename}`;
      console.log('📤 生成 S3 Key:', key);
      
      const uploadParams = {
        Bucket: S3_CONFIG.bucket,
        Key: key,
        Body: optimizedImage,
        ContentType: 'image/jpeg'
        // 注意: 移除了 ACL 参数，因为存储桶禁用了 ACL
      };

      console.log('📤 上传参数:', {
        Bucket: uploadParams.Bucket,
        Key: uploadParams.Key,
        ContentType: uploadParams.ContentType,
        BodyLength: uploadParams.Body.length
        // 注意: 不再包含 ACL
      });

      console.log('🚀 开始上传到 S3...');
      
      // 添加上传重试机制
      const result = await this.uploadWithRetry(uploadParams);
      
      console.log('✅ S3 上传成功!');
      console.log('✅ 返回结果:', {
        Location: result.Location,
        Key: result.Key,
        ETag: result.ETag,
        Bucket: result.Bucket
      });
      
      // 验证上传结果
      if (!result.Location || !result.Location.includes('s3.amazonaws.com')) {
        console.warn('⚠️ 警告: 上传返回的URL可能不是有效的S3 URL');
        console.warn('⚠️ 实际返回的URL:', result.Location);
      }
      
      console.log('📤 ========== S3 上传结束 ==========');
      
      return {
        url: result.Location,
        key: result.Key,
        size: optimizedImage.length
      };
    } catch (error) {
      console.error('❌ ========== S3 上传错误 ==========');
      console.error('❌ 错误名称:', error.name);
      console.error('❌ 错误信息:', error.message);
      console.error('❌ 错误代码:', error.code);
      console.error('❌ 错误状态码:', error.statusCode);
      console.error('❌ 请求ID:', error.requestId);
      console.error('❌ 错误详情:', {
        region: s3.config.region,
        bucket: S3_CONFIG.bucket,
        credentials: s3.config.credentials ? '已设置' : '未设置 (使用 IAM Role)',
        time: error.time,
        hostname: error.hostname,
        retryable: error.retryable
      });
      
      // 详细的错误分类
      if (error.code === 'AccessDenied') {
        console.error('❌ 访问被拒绝 - 检查 IAM 权限或存储桶策略');
        console.error('❌ 可能的原因:');
        console.error('❌ 1. IAM Role 没有 s3:PutObject 权限');
        console.error('❌ 2. 存储桶策略阻止上传');
        console.error('❌ 3. 存储桶的公共访问阻止设置');
      } else if (error.code === 'NoSuchBucket') {
        console.error('❌ Bucket 不存在 - 检查存储桶名称');
      } else if (error.code === 'InvalidAccessKeyId') {
        console.error('❌ Access Key 无效');
      } else if (error.code === 'SignatureDoesNotMatch') {
        console.error('❌ 签名不匹配 - 检查 Secret Key');
      } else if (error.code === 'CredentialsError') {
        console.error('❌ 凭据错误 - 检查 AWS 凭据配置');
      } else if (error.code === 'NetworkingError') {
        console.error('❌ 网络错误 - 检查网络连接');
      } else if (error.code === 'TimeoutError') {
        console.error('❌ 超时错误 - 增加超时时间或重试');
      } else if (error.code === 'AccessControlListNotSupported') {
        console.error('❌ ACL 不被支持 - 存储桶禁用了 ACL');
        console.error('❌ 解决方案: 从上传参数中移除 ACL 设置');
      }
      
      console.error('❌ 完整错误堆栈:', error.stack);
      console.error('❌ =================================');
      throw new Error(`S3 上传失败: ${error.message} (${error.code})`);
    }
  }

  // 添加上传重试机制
  static async uploadWithRetry(uploadParams, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 上传尝试 ${attempt}/${maxRetries}`);
        const result = await s3.upload(uploadParams).promise();
        return result;
      } catch (error) {
        lastError = error;
        console.log(`❌ 上传尝试 ${attempt} 失败:`, error.code);
        
        if (attempt < maxRetries) {
          // 指数退避重试
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ 等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.log(`❌ 所有 ${maxRetries} 次上传尝试都失败了`);
    throw lastError;
  }

  static async generatePresignedUrl(key, expiresIn = 3600) {
    try {
      console.log('🔗 生成预签名 URL...');
      console.log('🔗 Key:', key);
      console.log('🔗 过期时间:', expiresIn, '秒');
      
      const params = {
        Bucket: S3_CONFIG.bucket,
        Key: key,
        Expires: expiresIn
      };

      const url = await s3.getSignedUrlPromise('getObject', params);
      console.log('✅ 预签名 URL 生成成功');
      console.log('✅ URL:', url);
      return url;
    } catch (error) {
      console.error('❌ 生成预签名 URL 错误:');
      console.error('❌ 错误信息:', error.message);
      console.error('❌ 错误代码:', error.code);
      console.error('❌ 错误详情:', {
        bucket: S3_CONFIG.bucket,
        key: key
      });
      throw new Error('Failed to generate download URL');
    }
  }

  static async deleteImage(key) {
    try {
      console.log('🗑️ 删除 S3 文件...');
      console.log('🗑️ Key:', key);
      
      const params = {
        Bucket: S3_CONFIG.bucket,
        Key: key
      };

      await s3.deleteObject(params).promise();
      console.log('✅ S3 文件删除成功');
      return true;
    } catch (error) {
      console.error('❌ S3 删除错误:');
      console.error('❌ 错误信息:', error.message);
      console.error('❌ 错误代码:', error.code);
      console.error('❌ 错误详情:', {
        bucket: S3_CONFIG.bucket,
        key: key
      });
      throw new Error('Failed to delete image');
    }
  }

  static async uploadMultipleImages(files, folder = 'comics') {
    console.log('📦 ========== S3 批量上传开始 ==========');
    console.log('📦 文件数量:', files.length);
    console.log('📦 文件列表:', files.map(f => ({
      name: f.originalname,
      size: f.size,
      type: f.mimetype
    })));
    console.log('📦 目标文件夹:', folder);
    
    try {
      const uploadPromises = files.map((file, index) => {
        console.log(`📤 准备上传文件 ${index + 1}/${files.length}: ${file.originalname}`);
        return this.uploadImage(file.buffer, file.originalname, folder);
      });
      
      const results = await Promise.all(uploadPromises);
      
      console.log('✅ 所有文件 S3 上传成功');
      console.log('📦 上传结果:', results.map(r => ({
        url: r.url,
        key: r.key,
        size: r.size
      })));
      
      // 验证所有 URL 都是有效的 S3 URL
      const invalidUrls = results.filter(r => !r.url.includes('s3.amazonaws.com'));
      if (invalidUrls.length > 0) {
        console.warn('⚠️ 警告: 部分上传返回了非 S3 URL');
        invalidUrls.forEach(invalid => {
          console.warn('⚠️ 无效 URL:', invalid.url);
        });
      }
      
      console.log('📦 ========== S3 批量上传结束 ==========');
      return results;
    } catch (error) {
      console.error('❌ S3 批量上传失败:');
      console.error('❌ 错误信息:', error.message);
      console.error('❌ 错误代码:', error.code);
      console.error('❌ 错误状态码:', error.statusCode);
      console.error('❌ 失败的文件数量:', files.length);
      
      // 如果是部分失败，记录哪些文件失败了
      if (error.errors) {
        console.error('❌ 详细错误:');
        error.errors.forEach((err, index) => {
          console.error(`❌ 文件 ${index + 1}:`, err.message);
        });
      }
      
      throw error;
    }
  }

  // 新增：测试 S3 连接
  static async testConnection() {
    try {
      console.log('🧪 测试 S3 连接...');
      console.log('🧪 Bucket:', S3_CONFIG.bucket);
      console.log('🧪 Region:', s3.config.region);
      
      const result = await s3.headBucket({ Bucket: S3_CONFIG.bucket }).promise();
      console.log('✅ S3 连接测试成功');
      console.log('✅ Bucket 可访问');
      return true;
    } catch (error) {
      console.error('❌ S3 连接测试失败:');
      console.error('❌ 错误信息:', error.message);
      console.error('❌ 错误代码:', error.code);
      console.error('❌ 错误状态码:', error.statusCode);
      return false;
    }
  }

  // 新增：列出存储桶内容（用于调试）
  static async listBucketContents(prefix = 'comics/', maxKeys = 10) {
    try {
      console.log('📋 列出存储桶内容...');
      console.log('📋 Prefix:', prefix);
      console.log('📋 MaxKeys:', maxKeys);
      
      const params = {
        Bucket: S3_CONFIG.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys
      };

      const result = await s3.listObjectsV2(params).promise();
      console.log('✅ 存储桶内容列表:');
      if (result.Contents && result.Contents.length > 0) {
        result.Contents.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.Key} (${item.Size} bytes)`);
        });
      } else {
        console.log('  📭 没有找到文件');
      }
      return result.Contents || [];
    } catch (error) {
      console.error('❌ 列出存储桶内容失败:');
      console.error('❌ 错误信息:', error.message);
      console.error('❌ 错误代码:', error.code);
      return [];
    }
  }
}

// 添加命名导出函数以兼容现有代码
export const uploadToS3 = async (file, folder, userId) => {
  const filename = `${userId}-${Date.now()}-${file.originalname}`;
  const result = await S3Service.uploadImage(file.buffer, filename, folder);
  return result.url;
};

export const deleteFromS3 = async (fileUrl) => {
  try {
    // 从URL中提取key
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // 移除开头的斜杠
    await S3Service.deleteImage(key);
  } catch (error) {
    console.error('删除S3文件失败:', error);
    throw error;
  }
};