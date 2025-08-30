import { Response } from 'express';
import { getUserPosts } from './postProfile.service';
import {  getPostProfileApiResponse, PostResponseData } from './postProfile.types';
import { AuthRequest } from '../../auth/auth.middleware';


export async function getPostProfileHandler(req: AuthRequest, res: Response<getPostProfileApiResponse<PostResponseData[]>>) {
  try {
    const userId = req.user!.id;
    const posts = await getUserPosts(userId);
    if (posts.length === 0) {
      return res.json({ success: true, message: 'هیچ پستی یافت نشد', data: [] });
    }
    return res.json({ success: true, message: 'پست‌ها دریافت شدند', data: posts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'خطا در دریافت پست‌ها', data: [] });
  }
}