import { AuthRequest } from '../../auth/auth.middleware';
import { Response } from 'express';
import { getFollowers, getFollowings } from './followersFollowings.service';
import { FollowListApiResponse } from './followersFollowings.types';
import { handleError } from '../../../utils/errorHandler';

export async function getFollowersHandler(req: AuthRequest, res: Response<FollowListApiResponse>) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "احراز هویت ناموفق" });
    }
    const followers = await getFollowers(req.user.id);
    return res.json({
      success: true,
      message: 'لیست فالوورها با موفقیت دریافت شد',
      data: followers,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت لیست فالوورها');
  }
}

export async function getFollowingsHandler(req: AuthRequest, res: Response<FollowListApiResponse>) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "احراز هویت ناموفق" });
    }
    const followings = await getFollowings(req.user.id);
    return res.json({
      success: true,
      message: 'لیست فالووینگ‌ها با موفقیت دریافت شد',
      data: followings,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت لیست فالووینگ‌ها');
  }
}