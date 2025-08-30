import { PrismaClient } from '@prisma/client';
import { minioClient } from '../../config/minio.config';

const prisma = new PrismaClient();


const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "rahnama";

async function uploadBufferToMinIO(
  buffer: Buffer,
  filename: string,
  folder: string = 'posts'
): Promise<string> {
  const objectName = `${folder}/${Date.now()}-${filename}`;
  
  try {
    await minioClient.putObject(BUCKET_NAME, objectName, buffer);
    const url = `${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${BUCKET_NAME}/${objectName}`;
    return url;
  } catch (error) {
    throw new Error(`Failed to upload file to MinIO: ${error}`);
  }
}

export async function createPostWithImages(
  userId: string,
  caption: string | undefined,
  images: Express.Multer.File[]
): Promise<{
  id: string;
  caption: string | null;
  images: { id: string; url: string }[];
  createdAt: Date;
}> {
  if (!images || images.length === 0) throw new Error('No images provided');

  const uploadedUrls: string[] = await Promise.all(
    images.map((file) => uploadBufferToMinIO(file.buffer, file.originalname, 'posts'))
  );

  const created = await prisma.post.create({
    data: {
      caption: caption ?? null,
      userId,
      images: {
        create: uploadedUrls.map((url) => ({ url })),
      },
    },
    include: { images: true },
  });

  return {
    id: created.id,
    caption: created.caption,
    images: created.images.map((img) => ({ id: img.id, url: img.url })),
    createdAt: created.createdAt,
  };
}