import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function toggleBookmark(postId: string, userId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
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