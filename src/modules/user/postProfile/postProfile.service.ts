import { PrismaClient } from '@prisma/client';
import { PostResponseData } from './postProfile.types';

const prisma = new PrismaClient();

// tamam post haey yek user ro moshakhas mikonim
export async function getUserPosts(userId: string, viewerId?: string): Promise<PostResponseData[]> { 
  if (viewerId && userId !== viewerId) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { isPrivate: true } });
    if (targetUser?.isPrivate) {
      const isFollower = await prisma.follow.findFirst({
        where: { followingId: userId, followerId: viewerId },
      });
      if (!isFollower) throw new Error('پروفایل خصوصی است و شما فالوور نیستید');
    }
  }

  return prisma.post.findMany({
    where: { userId },
    select: {
      id: true,
      caption: true,
      images: true,
      likeCount: true,
      bookmarkCount: true,
    },
  });
}

// hamone vali ba username kar mikone vaghti peyda kard balayy ro seda mikone
export async function getPostsByUsername(username: string, viewerId?: string): Promise<PostResponseData[]> { 
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, isPrivate: true },
  });
  if (!user) throw new Error('کاربر یافت نشد');
  if (viewerId && user.id !== viewerId && user.isPrivate) {
    const isFollower = await prisma.follow.findFirst({
      where: { followingId: user.id, followerId: viewerId },
    });
    if (!isFollower) throw new Error('پروفایل خصوصی است و شما فالوور نیستید');
  }
  return getUserPosts(user.id, viewerId);
}