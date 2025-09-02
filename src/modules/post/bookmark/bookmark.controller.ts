import { Request, Response } from 'express';
import { toggleBookmark } from './bookmark.service';
import { BookmarkResponse } from './bookmark.types';
import { AuthRequest } from '../../auth/auth.middleware';
import { handleError } from '../../../utils/errorHandler';

export async function bookmarkPostHandler(req: AuthRequest, res: Response<BookmarkResponse>) {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    const isBookmarked = await toggleBookmark(postId, userId);
    const action = isBookmarked ? 'بوکمارک شد' : 'انبوکمارک شد';
    return res.json({
      success: true,
      message: `پست با موفقیت ${action}`,
      data: { postId, userId },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در مدیریت بوکمارک');
  }
}