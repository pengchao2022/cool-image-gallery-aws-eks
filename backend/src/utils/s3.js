import { s3, S3_CONFIG } from '../config/aws.js';
import sharp from 'sharp';

export class S3Service {
  static async uploadImage(buffer, filename, folder = 'comics') {
    try {
      // Optimize image
      const optimizedImage = await sharp(buffer)
        .jpeg({ quality: 80, progressive: true })
        .resize(1200, 1200, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toBuffer();

      const key = `${folder}/${Date.now()}-${filename}`;
      
      const uploadParams = {
        Bucket: S3_CONFIG.bucket,
        Key: key,
        Body: optimizedImage,
        ContentType: 'image/jpeg',
        ACL: 'private'
      };

      const result = await s3.upload(uploadParams).promise();
      
      return {
        url: result.Location,
        key: result.Key,
        size: optimizedImage.length
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  static async generatePresignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: S3_CONFIG.bucket,
        Key: key,
        Expires: expiresIn
      };

      return await s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  static async deleteImage(key) {
    try {
      const params = {
        Bucket: S3_CONFIG.bucket,
        Key: key
      };

      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete image');
    }
  }

  static async uploadMultipleImages(files, folder = 'comics') {
    const uploadPromises = files.map(file => 
      this.uploadImage(file.buffer, file.originalname, folder)
    );
    
    return await Promise.all(uploadPromises);
  }
}