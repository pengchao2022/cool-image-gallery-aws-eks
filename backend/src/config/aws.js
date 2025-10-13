import AWS from 'aws-sdk';
import { config } from './constants.js';

// 生产环境使用 IAM Role，不需要设置 Access Key
AWS.config.update({
  region: config.AWS_REGION || 'us-east-1'
});

export const s3 = new AWS.S3();

export const S3_CONFIG = {
  bucket: config.S3_BUCKET_NAME,
  region: config.AWS_REGION,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ]
};