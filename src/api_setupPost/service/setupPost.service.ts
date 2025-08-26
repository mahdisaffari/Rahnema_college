import { PrismaClient } from '@prisma/client';
import { uploadBufferToBucket } from '../../config/minio.config';

const prisma = new PrismaClient();

export async function createPostWithImages(
  userId: string,
  caption: string | undefined,
  images: Express.Multer.File[]
): Promise<{
  id: number;
  caption: string | null;
  images: { id: number; url: string }[];
  createdAt: Date;
}> {
  if (!images || images.length === 0) throw new Error('No images provided');

  const uploadedUrls: string[] = await Promise.all(
    images.map((file) => uploadBufferToBucket(file.buffer, file.originalname, 'posts'))
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


