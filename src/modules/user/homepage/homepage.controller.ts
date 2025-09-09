import { Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { getHomepagePosts } from './homepage.service';
import { HomepageResponse } from './homepage.types';
import { handleError } from '../../../utils/errorHandler';

export async function getHomepageHandler(req: AuthRequest, res: Response<HomepageResponse>) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;

    const { posts, total } = await getHomepagePosts(userId, page);

    return res.json({
      success: true,
      message: posts.length ? 'پست‌های هوم‌پیج دریافت شدند' : 'هیچ پستی یافت نشد',
      data: { posts, total },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت پست‌های هوم‌پیج');
  }
}