import Minio from 'minio';

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// bucket name باید تغییر کنه

export const BUCKET_NAME = 'rahnama';

import { cloudinary } from './cloudinary.config';

export async function uploadBufferToBucket(
  buffer: Buffer,
  filename: string,
  folder: string = BUCKET_NAME
): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}