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
      
      // 检查 S3 配置
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
        ContentType: 'image/jpeg',
        ACL: 'private'
      };

      console.log('📤 上传参数:', {
        Bucket: uploadParams.Bucket,
        Key: uploadParams.Key,
        ContentType: uploadParams.ContentType,
        BodyLength: uploadParams.Body.length,
        ACL: uploadParams.ACL
      });

      console.log('🚀 开始上传到 S3...');
      const result = await s3.upload(uploadParams).promise();
      
      console.log('✅ S3 上传成功!');
      console.log('✅ 返回结果:', {
        Location: result.Location,
        Key: result.Key,
        ETag: result.ETag,
        Bucket: result.Bucket
      });
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
        credentials: s3.config.credentials ? '已设置' : '未设置'
      });
      
      if (error.code === 'AccessDenied') {
        console.error('❌ 访问被拒绝 - 检查 IAM 权限');
      } else if (error.code === 'NoSuchBucket') {
        console.error('❌ Bucket 不存在');
      } else if (error.code === 'InvalidAccessKeyId') {
        console.error('❌ Access Key 无效');
      } else if (error.code === 'SignatureDoesNotMatch') {
        console.error('❌ 签名不匹配');
      }
      
      console.error('❌ 完整错误堆栈:', error.stack);
      console.error('❌ =================================');
      throw new Error(`S3 上传失败: ${error.message} (${error.code})`);
    }
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
      return url;
    } catch (error) {
      console.error('❌ 生成预签名 URL 错误:', error);
      console.error('❌ 错误详情:', error.message, error.code);
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
      console.error('❌ S3 删除错误:', error);
      console.error('❌ 错误详情:', error.message, error.code);
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
      const uploadPromises = files.map(file => 
        this.uploadImage(file.buffer, file.originalname, folder)
      );
      
      const results = await Promise.all(uploadPromises);
      console.log('✅ 所有文件 S3 上传成功');
      console.log('📦 上传结果:', results.map(r => ({
        url: r.url,
        key: r.key,
        size: r.size
      })));
      console.log('📦 ========== S3 批量上传结束 ==========');
      return results;
    } catch (error) {
      console.error('❌ S3 批量上传失败:');
      console.error('❌ 错误:', error.message);
      console.error('❌ 代码:', error.code);
      throw error;
    }
  }
}