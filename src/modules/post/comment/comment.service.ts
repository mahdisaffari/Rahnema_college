import { PrismaClient, Prisma } from '@prisma/client';
import { CommentResponse } from './comment.types';
import { isBlocked } from '../../../utils/blockUtils';

const prisma = new PrismaClient();

type CommentWithRelations = Prisma.CommentGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        username: true;
        firstname: true;
        lastname: true;
        avatar: true;
      };
    };
    _count: { select: { replies: true } };
  };
}>;

export async function createComment(
  userId: string,
  postId: string,
  content: string
): Promise<CommentResponse> {
  return await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (!post) throw new Error('پست یافت نشد');
    if (await isBlocked(userId, post.userId)) throw new Error('نمی‌توانید روی پست این کاربر کامنت بگذارید (بلاک شده)');

    const comment = await tx.comment.create({
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
        _count: { select: { replies: true } },
      },
    });

    await tx.post.update({
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
      replyCount: comment._count.replies || 0,
      replies: [],
    };
  });
}

export async function createReply(
  userId: string,
  postId: string,
  commentId: string,
  content: string
): Promise<CommentResponse> {
  return await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (!post) throw new Error('پست یافت نشد');
    if (await isBlocked(userId, post.userId)) throw new Error('نمی‌توانید روی پست این کاربر ریپلای بگذارید (بلاک شده)');

    const parentComment = await tx.comment.findUnique({
      where: { id: commentId },
    });
    if (!parentComment) throw new Error('کامنت یافت نشد');

    const reply = await tx.comment.create({
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
        _count: { select: { replies: true } },
      },
    });

    return {
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      user: reply.user,
      postId: reply.postId,
      likeCount: reply.likeCount,
      replyCount: reply._count.replies || 0,
      replies: [],
    };
  });
}

export async function likeComment(userId: string, commentId: string): Promise<{ liked: boolean; likeCount: number }> {
  return await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.findUnique({
      where: { id: commentId },
      select: { post: { select: { userId: true } } },
    });
    if (!comment) throw new Error('کامنت یافت نشد');
    if (await isBlocked(userId, comment.post.userId)) throw new Error('نمی‌توانید کامنت این پست را لایک کنید (بلاک شده)');

    const existingLike = await tx.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existingLike) {
      await tx.commentLike.delete({
        where: { userId_commentId: { userId, commentId } },
      });
      await tx.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      });
      const updatedComment = await tx.comment.findUnique({ where: { id: commentId } });
      return { liked: false, likeCount: updatedComment!.likeCount };
    } else {
      await tx.commentLike.create({
        data: { userId, commentId },
      });
      await tx.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      });
      const updatedComment = await tx.comment.findUnique({ where: { id: commentId } });
      return { liked: true, likeCount: updatedComment!.likeCount };
    }
  });
}

export async function getPostComments(postId: string, page: number, limit: number, depth: number): Promise<{
  comments: CommentResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  const skip = (page - 1) * limit;

  async function fetchCommentsWithReplies(commentIds: string[], currentDepth: number): Promise<CommentResponse[]> {
    if (currentDepth <= 0) return [];

    const comments = await prisma.comment.findMany({
      where: { parentId: { in: commentIds } },
      orderBy: { createdAt: 'desc' },
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
        _count: { select: { replies: true } },
      },
    });

    if (comments.length === 0 || currentDepth === 1) {
      return comments.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        user: c.user,
        postId: c.postId,
        likeCount: c.likeCount,
        replyCount: c._count.replies || 0,
        replies: [],
      }));
    }

    const nestedReplies = await fetchCommentsWithReplies(comments.map(c => c.id), currentDepth - 1);
    const replyMap = new Map(nestedReplies.map(r => [r.id, r]));

    return comments.map(c => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
      postId: c.postId,
      likeCount: c.likeCount,
      replyCount: c._count.replies || 0,
      replies: replyMap.get(c.id)?.replies || [],
    }));
  }

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
        _count: { select: { replies: true } },
      },
    }),
    prisma.comment.count({ where: { postId, parentId: null } }),
  ]);

  const rootComments = comments.map(c => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    user: c.user,
    postId: c.postId,
    likeCount: c.likeCount,
    replyCount: c._count.replies || 0,
    replies: [],
  }));

  if (depth > 1) {
    const nestedReplies = await fetchCommentsWithReplies(comments.map(c => c.id), depth - 1);
    const replyMap = new Map(nestedReplies.map(r => [r.id, r]));
    return {
      comments: rootComments.map(c => ({
        ...c,
        replies: replyMap.get(c.id)?.replies || [],
      })),
      total,
      page,
      limit,
    };
  }

  return {
    comments: rootComments,
    total,
    page,
    limit,
  };
}

export async function getReplies(commentId: string, page: number, limit: number, depth: number): Promise<{
  replies: CommentResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  const skip = (page - 1) * limit;

  async function fetchRepliesWithReplies(replyIds: string[], currentDepth: number): Promise<CommentResponse[]> {
    if (currentDepth <= 0) return [];

    const replies = await prisma.comment.findMany({
      where: { parentId: { in: replyIds } },
      orderBy: { createdAt: 'desc' },
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
        _count: { select: { replies: true } },
      },
    });

    if (replies.length === 0 || currentDepth === 1) {
      return replies.map(r => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
        postId: r.postId,
        likeCount: r.likeCount,
        replyCount: r._count.replies || 0,
        replies: [],
      }));
    }

    const nestedReplies = await fetchRepliesWithReplies(replies.map(r => r.id), currentDepth - 1);
    const replyMap = new Map(nestedReplies.map(r => [r.id, r]));

    return replies.map(r => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
      postId: r.postId,
      likeCount: r.likeCount,
      replyCount: r._count.replies || 0,
      replies: replyMap.get(r.id)?.replies || [],
    }));
  }

  const [replies, total] = await Promise.all([
    prisma.comment.findMany({
      where: { parentId: commentId },
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
        _count: { select: { replies: true } },
      },
    }),
    prisma.comment.count({ where: { parentId: commentId } }),
  ]);

  const rootReplies = replies.map(r => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
    postId: r.postId,
    likeCount: r.likeCount,
    replyCount: r._count.replies || 0,
    replies: [],
  }));

  if (depth > 1) {
    const nestedReplies = await fetchRepliesWithReplies(replies.map(r => r.id), depth - 1);
    const replyMap = new Map(nestedReplies.map(r => [r.id, r]));
    return {
      replies: rootReplies.map(r => ({
        ...r,
        replies: replyMap.get(r.id)?.replies || [],
      })),
      total,
      page,
      limit,
    };
  }

  return {
    replies: rootReplies,
    total,
    page,
    limit,
  };
}