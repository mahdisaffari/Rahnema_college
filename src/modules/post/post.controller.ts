// src/modules/post/post.controller.ts
import { Request, Response } from 'express';
import { CreatePostResponse, PostApiResponse, CreatePostRequest, UserPostsResponse } from './post.types';
import { createPostWithImages, getPostById, getUserPosts } from './post.service';
import { AuthRequest } from '../auth/auth.middleware';
import { handleError } from '../../utils/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createSetupPostHandler(req: AuthRequest, res: Response<CreatePostResponse>) {
  try {
    const userId = req.user!.id;
    const { caption, mentions, isCloseFriendsOnly } = req.body as CreatePostRequest & { isCloseFriendsOnly?: boolean };
    const images = (req.files as Express.Multer.File[]) || [];

    const post = await createPostWithImages(userId, caption, images, mentions, isCloseFriendsOnly);
    return res.status(201).json({
      success: true,
      message: 'پست با موفقیت ایجاد شد',
      data: {
        id: post.id,
        caption: post.caption,
        images: post.images,
        createdAt: post.createdAt,
        mentions: post.mentions,
        isCloseFriendsOnly: post.isCloseFriendsOnly,
      },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در ایجاد پست', 400);
  }
}

export async function getPostHandler(req: AuthRequest, res: Response<PostApiResponse>) {
  try {
    const postId = req.params.id;
    const currentUserId = req.user?.id;
    const post = await getPostById(postId, currentUserId);
    if (!post) return res.status(404).json({ success: false, message: 'پست یافت نشد' });

    if (post.isCloseFriendsOnly && post.user.id !== currentUserId) {
      const isCloseFriend = await prisma.closeFriend.findFirst({
        where: { userId: post.user.id, friendId: currentUserId },
      });
      if (!isCloseFriend) {
        return res.status(403).json({ success: false, message: 'دسترسی به این پست محدود است' });
      }
    }

    return res.json({
      success: true,
      message: 'پست با موفقیت دریافت شد',
      data: post,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت پست');
  }
}

export async function getUserPostsHandler(req: AuthRequest, res: Response<UserPostsResponse>) {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getUserPosts(username, currentUserId, page, limit);
    if (!result) return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });

    const isCloseFriend = await prisma.closeFriend.findFirst({
      where: {
        userId: result.user.id,
        friendId: currentUserId,
      },
    });

    const filteredPosts = result.posts.filter(post => {
      if (!post.isCloseFriendsOnly) return true;
      return result.user.id === currentUserId || isCloseFriend;
    });

    return res.json({
      success: true,
      message: 'پست‌های کاربر با موفقیت دریافت شد',
      data: { ...result, posts: filteredPosts },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت پست‌های کاربر');
  }
}