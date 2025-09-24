import { PrismaClient } from '@prisma/client';
import { isBlocked } from '../../../utils/blockUtils';

const prisma = new PrismaClient();

export async function toggleBookmark(postId: string, userId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (!post) throw new Error('پست یافت نشد');
    if (await isBlocked(userId, post.userId)) throw new Error('نمی‌توانید این پست را بوکمارک کنید (بلاک شده)');

    const existingBookmark = await tx.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingBookmark) {
      await tx.bookmark.delete({
        where: { userId_postId: { userId, postId } },
      });
      await tx.post.update({
        where: { id: postId },
        data: { bookmarkCount: { decrement: 1 } },
      });
      return false;
    } else {
      await tx.bookmark.create({
        data: { userId, postId },
      });
      await tx.post.update({
        where: { id: postId },
        data: { bookmarkCount: { increment: 1 } },
      });
      return true;
    }
  });
}