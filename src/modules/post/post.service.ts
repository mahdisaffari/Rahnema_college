import { PrismaClient } from '@prisma/client';
import { minioClient } from '../../config/minio.config';
import { PostResponse } from './post.types';

const prisma = new PrismaClient();

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "rahnama";

export async function uploadBufferToMinIO(
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
  images: Express.Multer.File[],
  mentions: string[] | undefined 
): Promise<PostResponse> {
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
    include: { images: true, user: { select: { id: true, username: true, firstname: true, lastname: true, avatar: true } } },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { postCount: { increment: 1 } },
  });

  if (mentions && mentions.length > 0) {
    const users = await prisma.user.findMany({
      where: { username: { in: mentions } },
      select: { id: true },
    });
    await prisma.mention.createMany({
      data: users.map((user) => ({ postId: created.id, userId: user.id })),
    });
  }

  const mentionUsers = await prisma.mention.findMany({
    where: { postId: created.id },
    include: { user: { select: { id: true, username: true } } },
  });

  return {
    id: created.id,
    caption: created.caption,
    images: created.images.map((img) => ({ id: img.id, url: img.url })),
    createdAt: created.createdAt.toISOString(),
    likeCount: created.likeCount || 0,
    bookmarkCount: created.bookmarkCount || 0,
    user: created.user,
    isOwner: true,
    mentions: mentionUsers.map((m) => ({ userId: m.userId, username: m.user.username })),
  };
}

export async function getPostById(postId: string, currentUserId?: string): Promise<PostResponse | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      caption: true,
      images: { select: { id: true, url: true } },
      createdAt: true,
      likeCount: true,
      bookmarkCount: true,
      user: {
        select: {
          id: true,
          username: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      },
      mentions: {
        include: { user: { select: { id: true, username: true } } },
      },
    },
  });
  if (!post) return null;
  return {
    id: post.id,
    caption: post.caption,
    images: post.images,
    createdAt: post.createdAt.toISOString(),
    likeCount: post.likeCount,
    bookmarkCount: post.bookmarkCount,
    user: post.user,
    isOwner: currentUserId ? post.user.id === currentUserId : false,
    mentions: post.mentions.map((m) => ({ userId: m.userId, username: m.user.username })),
  };
}