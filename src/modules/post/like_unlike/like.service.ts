import { PrismaClient } from '@prisma/client';
import { isBlocked } from '../../../utils/blockUtils';

const prisma = new PrismaClient();

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (!post) throw new Error('پست یافت نشد');
    if (await isBlocked(userId, post.userId)) throw new Error('نمی‌توانید این پست را لایک کنید (بلاک شده)');

    const existingLike = await tx.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      await tx.like.delete({
        where: { userId_postId: { userId, postId } },
      });
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return false;
    } else {
      await tx.like.create({
        data: { userId, postId },
      });
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
      return true;
    }
  });
}

export async function getLikesCount(postId: string): Promise<number> {
  const post = await prisma.post.findUnique({ 
    where: { id: postId },
    select: { likeCount: true },
  });
  return post?.likeCount || 0;
}