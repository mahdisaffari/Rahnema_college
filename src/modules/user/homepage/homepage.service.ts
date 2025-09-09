import { PrismaClient } from '@prisma/client';
import { HomepageResponse, HomepagePostResponse } from './homepage.types';

const prisma = new PrismaClient();

export async function getHomepagePosts(
  userId: string,
  page: number = 1
): Promise<{ posts: HomepagePostResponse[]; total: number }> {
  const limit = 6;
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = following.map(f => f.followingId);

  if (followingIds.length === 0) {
    return { posts: [], total: 0 };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { userId: { in: followingIds } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { select: { id: true, url: true } },
        user: {
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true,
            avatar: true,
            followerCount: true,
          },
        },
        likes: { where: { userId }, select: { id: true } },
        bookmarks: { where: { userId }, select: { id: true } },
        mentions: { include: { user: { select: { id: true, username: true } } } },
        hashtags: { include: { hashtag: { select: { name: true } } } },
      },
    }),
    prisma.post.count({ where: { userId: { in: followingIds } } }),
  ]);

  const mappedPosts: HomepagePostResponse[] = posts.map(post => ({
    id: post.id,
    caption: post.caption,
    images: post.images,
    createdAt: post.createdAt.toISOString(),
    likeCount: post.likeCount,
    bookmarkCount: post.bookmarkCount,
    commentCount: post.commentCount,
    user: post.user,
    isOwner: post.user.id === userId,
    mentions: post.mentions.map(m => ({ userId: m.userId, username: m.user.username })),
    hashtags: post.hashtags.map(h => h.hashtag.name),
    isLiked: post.likes.length > 0,
    isBookmarked: post.bookmarks.length > 0,
  }));

  return { posts: mappedPosts, total };
}