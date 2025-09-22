import { Response } from 'express';
import { Request } from 'express';
import { getUserPosts, getPostsByUsername } from './postProfile.service';
import { getPostProfileApiResponse, PostResponseData } from './postProfile.types';
import { AuthRequest } from '../../auth/auth.middleware';
import { handleError } from '../../../utils/errorHandler';

// post haye karbare login shode
export async function getPostProfileHandler(req: AuthRequest, res: Response<getPostProfileApiResponse<PostResponseData[]>>) {
  try {
    const userId = req.user!.id; //id usero migirim
    const posts = await getUserPosts(userId); // tamam postash
    return res.json({
      success: true,
      message: posts.length ? 'پست‌ها دریافت شدند' : 'هیچ پستی یافت نشد',
      data: posts,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت پست‌ها');
  }
}

// baraye gereftan post haye har karbar ba username
export async function getPostsByUsernameHandler(req: Request, res: Response<getPostProfileApiResponse<PostResponseData[]>>) {
  try {
    const username = req.params.username; // url ke karbar darkhst dade
    const viewerId = (req as AuthRequest).user?.id; 
    const posts = await getPostsByUsername(username, viewerId);
    return res.json({
      success: true,
      message: posts.length ? 'پست‌ها دریافت شدند' : 'هیچ پستی یافت نشد',
      data: posts,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت پست‌ها');
  }
}