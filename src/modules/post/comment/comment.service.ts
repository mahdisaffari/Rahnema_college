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

// sakht reply baraye comment
export async function createReply(
  userId: string,
  postId: string,
  commentId: string,
  content: string
): Promise<CommentResponse> {
  // baresi vojood post
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  if (!post) throw new Error('پست یافت نشد');

  // baresi vojood comment
  const parentComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!parentComment) throw new Error('کامنت یافت نشد');

  // ijad reply
  const reply = await prisma.comment.create({
    data: {
      content,
      userId,
      postId,
      parentId: commentId,
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
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt.toISOString(),
    user: reply.user,
    postId: reply.postId,
    likeCount: reply.likeCount,
  };
}

// like ya unlike kardan comment
export async function likeComment(
  userId: string,
  commentId: string
): Promise<{ likeCount: number; liked: boolean }> {
  // baresi vojood comment
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!comment) throw new Error('کامنت یافت نشد');

  // check kardan like ghabli
  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: { userId, commentId },
    },
  });

  if (existingLike) {
    // hazf like
    await prisma.commentLike.delete({
      where: {
        userId_commentId: { userId, commentId },
      },
    });
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { decrement: 1 } },
    });
    return { likeCount: updatedComment.likeCount, liked: false };
  } else {
    // ijad like
    await prisma.commentLike.create({
      data: {
        userId,
        commentId,
      },
    });
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } },
    });
    return { likeCount: updatedComment.likeCount, liked: true };
  }
}