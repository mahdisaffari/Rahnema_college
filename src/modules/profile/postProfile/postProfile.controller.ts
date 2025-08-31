import { Response } from 'express';
import { getUserPosts } from './postProfile.service';
import { getPostProfileApiResponse, PostResponseData } from './postProfile.types';
import { AuthRequest } from '../../auth/auth.middleware';
import { handleError } from '../../../utils/errorHandler';

export async function getPostProfileHandler(req: AuthRequest,
   res: Response<getPostProfileApiResponse<PostResponseData[]>>) {
  try {
    const userId = req.user!.id;
    const posts = await getUserPosts(userId);
    return res.json({
      success: true,
      message: posts.length ? 'پست‌ها دریافت شدند' : 'هیچ پستی یافت نشد',
      data: posts,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت پست‌ها');
  }
}