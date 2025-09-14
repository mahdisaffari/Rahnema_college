import { Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { handleError } from '../../../utils/errorHandler';
import { getUserMentionedPosts } from './mentionedPost.service';
import { MentionedPostsResponseDto } from './mentionedPost.types';

export async function getUserMentionedPostsHandler(req: AuthRequest, res: Response<MentionedPostsResponseDto>) {
  try {
    const userId = req.user!.id;
    const pageParam = req.query.page as string | undefined;
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const { items, totalPages, totalCount, page: currentPage, pageSize } = await getUserMentionedPosts(userId, page);
    return res.json({ 
      success: true, 
      message: "لیست منشن‌ها با موفقیت دریافت شد",
      data: { 
        items, 
        pagination: {
          page: currentPage,
          limit: pageSize,
          total_records: totalCount,
          total_pages: totalPages
        }
      } 
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت لیست منشن‌ها');
  }
}


