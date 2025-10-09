import AWS from 'aws-sdk';
import { config } from './constants.js';

AWS.config.update({
  region: config.AWS_REGION,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
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