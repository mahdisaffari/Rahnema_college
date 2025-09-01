import { PrismaClient } from '@prisma/client';
import { PostResponseData } from './postProfile.types';

const prisma = new PrismaClient();

export async function getUserPosts(userId: string): Promise<PostResponseData[]> {
  return prisma.post.findMany({
    where: { userId },
    select: {
      id: true,
      caption: true,
      images: { select: { url: true } },
      likeCount: true,
      bookmarkCount: true,
    },
  });
}

export async function getPostsByUsername(username: string): Promise<PostResponseData[]> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!user) throw new Error('کاربر یافت نشد');
  return getUserPosts(user.id);
}