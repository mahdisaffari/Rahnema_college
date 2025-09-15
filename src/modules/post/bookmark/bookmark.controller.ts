import { Request, Response } from 'express';
import { toggleBookmark } from './bookmark.service';
import { BookmarkResponse } from './bookmark.types';
import { AuthRequest } from '../../auth/auth.middleware';
import { handleError } from '../../../utils/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function bookmarkPostHandler(req: AuthRequest, res: Response<BookmarkResponse>) {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    const isBookmarked = await toggleBookmark(postId, userId);
    const action = isBookmarked ? 'بوکمارک شد' : 'آنبوکمارک شد';
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { bookmarkCount: true },
    });
    return res.json({
      success: true,
      message: `پست با موفقیت ${action}`,
      data: { postId, userId, bookmarkCount: post?.bookmarkCount || 0, bookmarked: isBookmarked },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در مدیریت بوکمارک');
  }
}