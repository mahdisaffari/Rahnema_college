import { PrismaClient } from '@prisma/client';
import { CommentResponse } from './comment.types';
import { isBlocked } from '../../../utils/blockUtils';

const prisma = new PrismaClient();

export async function createComment(
  userId: string,
  postId: string,
  content: string
): Promise<CommentResponse> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });
  if (!post) throw new Error('پست یافت نشد');
  if (await isBlocked(userId, post.userId)) throw new Error('نمی‌توانید روی پست این کاربر کامنت بگذارید (بلاک شده)');

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
    replies: [],
  };
}

export async function createReply(
  userId: string,
  postId: string,
  commentId: string,
  content: string
): Promise<CommentResponse> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });
  if (!post) throw new Error('پست یافت نشد');
  if (await isBlocked(userId, post.userId)) throw new Error('نمی‌توانید روی پست این کاربر ریپلای بگذارید (بلاک شده)');

  const parentComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!parentComment) throw new Error('کامنت یافت نشد');

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

  return {
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt.toISOString(),
    user: reply.user,
    postId: reply.postId,
    likeCount: reply.likeCount,
    replies: [],
  };
}

export async function likeComment(userId: string, commentId: string): Promise<{ liked: boolean; likeCount: number }> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { post: { select: { userId: true } } },
  });
  if (!comment) throw new Error('کامنت یافت نشد');
  if (await isBlocked(userId, comment.post.userId)) throw new Error('نمی‌توانید کامنت این پست را لایک کنید (بلاک شده)');

  const existingLike = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });

  if (existingLike) {
    await prisma.commentLike.delete({
      where: { userId_commentId: { userId, commentId } },
    });
    await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { decrement: 1 } },
    });
    return { liked: false, likeCount: (await prisma.comment.findUnique({ where: { id: commentId } }))!.likeCount };
  } else {
    await prisma.commentLike.create({
      data: { userId, commentId },
    });
    await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } },
    });
    return { liked: true, likeCount: (await prisma.comment.findUnique({ where: { id: commentId } }))!.likeCount };
  }
}

export async function getPostComments(postId: string, page: number, limit: number): Promise<{
  comments: CommentResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  const skip = (page - 1) * limit;
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
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
        replies: {
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
            replies: {
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
                replies: true,
              },
            },
          },
        },
      },
    }),
    prisma.comment.count({ where: { postId, parentId: null } }),
  ]);

  const formattedComments: CommentResponse[] = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    user: comment.user,
    postId: comment.postId,
    likeCount: comment.likeCount,
    replies: comment.replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      user: reply.user,
      postId: reply.postId,
      likeCount: reply.likeCount,
      replies: reply.replies.map((nestedReply) => ({
        id: nestedReply.id,
        content: nestedReply.content,
        createdAt: nestedReply.createdAt.toISOString(),
        user: nestedReply.user,
        postId: nestedReply.postId,
        likeCount: nestedReply.likeCount,
        replies: [],
      })),
    })),
  }));

  return {
    comments: formattedComments,
    total,
    page,
    limit,
  };
}