import { Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { handleError } from '../../../utils/errorHandler';
import { getUserBookmarkedPosts } from './bookmarkedPost.service';
import { BookmarkedPostsResponseDto } from './bookmarkedPost.types';

export async function getUserBookmarkedPostsHandler(req: AuthRequest, res: Response<BookmarkedPostsResponseDto>) {
  try {
    const userId = req.user!.id;
    const pageParam = req.query.page as string | undefined;
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const { items, totalPages, totalCount, page: currentPage, pageSize } = await getUserBookmarkedPosts(userId, page);
    return res.json({ 
      success: true, 
      message: "لیست بوکمارک‌ها با موفقیت دریافت شد",
      data: { 
        items, 
        page: currentPage,
        limit: pageSize,
        total_records: totalCount,
        total_pages: totalPages
      } 
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت لیست بوکمارک‌ها');
  }
}


