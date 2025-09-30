import { PrismaClient } from '@prisma/client';
import { PostResponseData } from './postProfile.types';
import { isBlocked } from '../../../utils/blockUtils';

const prisma = new PrismaClient();

export async function getUserPosts(userId: string, viewerId?: string): Promise<PostResponseData[]> {
  if (viewerId && userId !== viewerId && await isBlocked(viewerId, userId)) {
    return [];
  }

  if (viewerId && userId !== viewerId) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { isPrivate: true } });
    if (targetUser?.isPrivate) {
      const isFollower = await prisma.follow.findFirst({
        where: { followingId: userId, followerId: viewerId },
      });
      if (!isFollower) throw new Error('پروفایل خصوصی است و شما فالوور نیستید');
    }
  }

  const posts = await prisma.post.findMany({
    where: { userId },
    select: {
      id: true,
      caption: true,
      images: true,
      likeCount: true,
      bookmarkCount: true,
      isCloseFriendsOnly: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedPosts: PostResponseData[] = posts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  if (viewerId && userId !== viewerId) {
    const isCloseFriend = await prisma.closeFriend.findFirst({
      where: { userId, friendId: viewerId },
    });
    return formattedPosts.filter(post => !post.isCloseFriendsOnly || isCloseFriend);
  }

  return formattedPosts;
}

export async function getPostsByUsername(username: string, viewerId?: string): Promise<PostResponseData[]> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, isPrivate: true },
  });
  if (!user) throw new Error('کاربر یافت نشد');
  if (viewerId && await isBlocked(viewerId, user.id)) {
    return [];
  }
  if (viewerId && user.id !== viewerId && user.isPrivate) {
    const isFollower = await prisma.follow.findFirst({
      where: { followingId: user.id, followerId: viewerId },
    });
    if (!isFollower) throw new Error('پروفایل خصوصی است و شما فالوور نیستید');
  }
  return getUserPosts(user.id, viewerId);
}