import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    // chek mikonim like bode ya na
    const existingLike = await tx.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    // agar like bode un like mikonim 
    if (existingLike) {
      await tx.like.delete({ // like ro az jadval like pak mikonim
        where: { userId_postId: { userId, postId } },
      });
      // tedad likeCount ro yeki kam mikonim 
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return false;
      // agar like nasode bashe like mikonim
    } else {
      await tx.like.create({
        data: { userId, postId },
      });
      // tedad likeCount ro yeki ziad mikonim
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
      return true;
    }
  });
}

// inja tedad kole like haye ye posto midim
export async function getLikesCount(postId: string): Promise<number> {
  // post morede nazar ro peyda mikomim
  const post = await prisma.post.findUnique({ 
    where: { id: postId },
    select: { likeCount: true }, // faghad soton likeCount ro bar migardonim
  });
  return post?.likeCount || 0; 
}