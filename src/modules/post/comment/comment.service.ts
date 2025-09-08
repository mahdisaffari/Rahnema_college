import { PrismaClient } from '@prisma/client';
import { CommentResponse } from './comment.types';

const prisma = new PrismaClient();

// sakht comment baraye post
export async function createComment(
  userId: string,
  postId: string,
  content: string
): Promise<CommentResponse> {
  // baresi vojood post
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  if (!post) throw new Error('پست یافت نشد');

  // ijad comment
  const comment = await prisma.comment.create({
    data: {
      content,
      userId,
      postId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      },
    },
  });

  // afzayesh tedad comment haye post
  await prisma.post.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 } },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    user: comment.user,
    postId: comment.postId,
    likeCount: comment.likeCount,
  };
}