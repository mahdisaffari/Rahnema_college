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
    likes: {
      select: { userId: true };
    };
    replies: {
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
        likes: {
          select: { userId: true };
        };
      };
    };
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
      isLiked: false, // Default, since no userId for like check here
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
      isLiked: false, // Default, since no userId for like check here
    };
  });
}

export async function likeComment(userId: string, commentId: string): Promise<{ liked: boolean; likeCount: number }> {
  return await prisma.$transaction(async (tx) => {
    const existingLike = await tx.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (existingLike) {
      await tx.commentLike.delete({
        where: {
          userId_commentId: { userId, commentId },
        },
      });
      const newLikeCount = await tx.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      });
      return { liked: false, likeCount: newLikeCount.likeCount };
    } else {
      await tx.commentLike.create({
        data: {
          userId,
          commentId,
        },
      });
      const newLikeCount = await tx.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      });
      return { liked: true, likeCount: newLikeCount.likeCount };
    }
  });
}

export async function getPostComments(postId: string, page: number, limit: number, depth: number, userId: string): Promise<{
  comments: CommentResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error('پست یافت نشد');

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, username: true, firstname: true, lastname: true, avatar: true } },
        _count: { select: { replies: true } },
        likes: {
          where: { userId },
          select: { userId: true },
        },
        replies: depth > 1 ? {
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, username: true, firstname: true, lastname: true, avatar: true } },
            _count: { select: { replies: true } },
            likes: {
              where: { userId },
              select: { userId: true },
            },
          },
        } : undefined,
      },
    }) as unknown as CommentWithRelations[],
    prisma.comment.count({ where: { postId, parentId: null } }),
  ]);

  const rootComments: CommentResponse[] = comments.map(c => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    user: {
      id: c.user.id,
      username: c.user.username,
      firstname: c.user.firstname,
      lastname: c.user.lastname,
      avatar: c.user.avatar,
    },
    postId: c.postId,
    likeCount: c.likeCount,
    replyCount: c._count.replies || 0,
    isLiked: c.likes.length > 0,
    replies: depth > 1 && c.replies ? c.replies.map(r => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      user: {
        id: r.user.id,
        username: r.user.username,
        firstname: r.user.firstname,
        lastname: r.user.lastname,
        avatar: r.user.avatar,
      },
      postId: r.postId,
      likeCount: r.likeCount,
      replyCount: r._count.replies || 0,
      isLiked: r.likes.length > 0,
      replies: [],
    })) : [],
  }));

  return { comments: rootComments, total, page, limit };
}

export async function getReplies(commentId: string, page: number, limit: number, depth: number, userId: string): Promise<{
  replies: CommentResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  const skip = (page - 1) * limit;

  const [replies, total] = await Promise.all([
    prisma.comment.findMany({
      where: { parentId: commentId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, username: true, firstname: true, lastname: true, avatar: true } },
        _count: { select: { replies: true } },
        likes: {
          where: { userId },
          select: { userId: true },
        },
        replies: depth > 1 ? {
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, username: true, firstname: true, lastname: true, avatar: true } },
            _count: { select: { replies: true } },
            likes: {
              where: { userId },
              select: { userId: true },
            },
          },
        } : undefined,
      },
    }) as unknown as CommentWithRelations[],
    prisma.comment.count({ where: { parentId: commentId } }),
  ]);

  const rootReplies: CommentResponse[] = replies.map(r => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    user: {
      id: r.user.id,
      username: r.user.username,
      firstname: r.user.firstname,
      lastname: r.user.lastname,
      avatar: r.user.avatar,
    },
    postId: r.postId,
    likeCount: r.likeCount,
    replyCount: r._count.replies || 0,
    isLiked: r.likes.length > 0,
    replies: depth > 1 && r.replies ? r.replies.map(n => ({
      id: n.id,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
      user: {
        id: n.user.id,
        username: n.user.username,
        firstname: n.user.firstname,
        lastname: n.user.lastname,
        avatar: n.user.avatar,
      },
      postId: n.postId,
      likeCount: n.likeCount,
      replyCount: n._count.replies || 0,
      isLiked: n.likes.length > 0,
      replies: [],
    })) : [],
  }));

  return {
    replies: rootReplies,
    total,
    page,
    limit,
  };
}