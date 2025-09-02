import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function toggleBookmark(postId: string, userId: string): Promise<boolean> {
  const existingBookmark = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existingBookmark) {
    await prisma.bookmark.delete({
      where: { userId_postId: { userId, postId } },
    });
    await prisma.post.update({
      where: { id: postId },
      data: { bookmarkCount: { decrement: 1 } },
    });
    return false;
  } else {
    await prisma.bookmark.create({
      data: { userId, postId },
    });
    await prisma.post.update({
      where: { id: postId },
      data: { bookmarkCount: { increment: 1 } },
    });
    return true;
  }
}