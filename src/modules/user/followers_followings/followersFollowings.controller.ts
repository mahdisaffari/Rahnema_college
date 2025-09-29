import { AuthRequest } from '../../auth/auth.middleware';
import { Response } from 'express';
import { getFollowers, getFollowings } from './followersFollowings.service';
import { FollowListApiResponse } from './followersFollowings.types';
import { handleError } from '../../../utils/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function getUserFollowersHandler(req: AuthRequest, res: Response<FollowListApiResponse>) {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    }
    const followers = await getFollowers(user.id);
    return res.json({
      success: true,
      message: 'لیست فالوورهای کاربر با موفقیت دریافت شد',
      data: followers,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت لیست فالوورهای کاربر');
  }
}

export async function getUserFollowingsHandler(req: AuthRequest, res: Response<FollowListApiResponse>) {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    }
    const followings = await getFollowings(user.id);
    return res.json({
      success: true,
      message: 'لیست فالووینگ‌های کاربر با موفقیت دریافت شد',
      data: followings,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت لیست فالووینگ‌های کاربر');
  }
}