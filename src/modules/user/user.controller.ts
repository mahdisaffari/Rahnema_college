import { Request, Response } from 'express';
import { getProfile, updateProfile, getUserByUsername, togglePrivateProfile } from './user.service'; // اضافه کردن togglePrivateProfile
import { ProfileResponse, UserResponse, UserApiResponse, UserUpdateRequest, PrivateToggleResponse } from './user.types';
import { AuthRequest } from '../auth/auth.middleware';
import { handleError } from '../../utils/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProfileHandler(req: AuthRequest, res: Response<UserApiResponse<ProfileResponse>>) {
  try {
    if (!req.user?.id) throw new Error('کاربر احراز هویت نشده است');
    const user = await getProfile(req.user!.id); 
    if (!user) return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    return res.json({ success: true, message: 'پروفایل با موفقیت دریافت شد', data: user });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت پروفایل');
  }
}

export async function getUserHandler(req: AuthRequest, res: Response<UserApiResponse<UserResponse>>) {
  try {
    const username = req.params.username;
    const currentUserId = req.user?.id || ''; 
    const user = await getUserByUsername(username, currentUserId);
    if (!user) return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    return res.json({ success: true, message: 'اطلاعات کاربر با موفقیت دریافت شد', data: user });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت اطلاعات کاربر');
  }
}

export async function updateProfileHandler(req: AuthRequest, res: Response<UserApiResponse<ProfileResponse>>) {
  try {
    const userId = req.user!.id;
    const { firstname, lastname, bio, email, password }: UserUpdateRequest = req.body; 

    let avatar: Express.Multer.File | null | undefined = req.file;
    if (req.body.avatar === 'null' || req.body.avatar === null) {
      avatar = null; 
    } else if (req.body.avatar && !req.file) {
      avatar = undefined; 
    }

    const updatedUser = await updateProfile(userId, {
      firstname,
      lastname,
      bio,
      avatar,
      email,
      password,
    });

    return res.json({ success: true, message: 'پروفایل با موفقیت بروزرسانی شد', data: updatedUser });
  } catch (error) {
    return handleError(error, res, 'خطا در بروزرسانی پروفایل');
  }
}

export async function togglePrivateProfileHandler(req: AuthRequest, res: Response<PrivateToggleResponse>) {
  try {
    const userId = req.user!.id;
    const { isPrivate }: { isPrivate: boolean } = req.body;

    const updatedUser = await togglePrivateProfile(userId, isPrivate);
    return res.json({
      success: true,
      message: `پروفایل با موفقیت ${isPrivate ? 'خصوصی' : 'عمومی'} شد`,
      data: { isPrivate: updatedUser.isPrivate },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در تغییر وضعیت پروفایل');
  }
}

export async function addCloseFriendHandler(req: AuthRequest, res: Response) {
  try {
    const { username } = req.params;
    const userId = req.user!.id;
    const friend = await prisma.user.findUnique({ where: { username } });
    if (!friend) {
      return handleError(new Error('کاربر یافت نشد'), res, 'کاربر یافت نشد', 404);
    }
    if (friend.id === userId) {
      return handleError(new Error('نمی‌توانید خودتان را اضافه کنید'), res, 'نمی‌توانید خودتان را اضافه کنید', 400);
    }
    const existing = await prisma.closeFriend.findFirst({
      where: { userId, friendId: friend.id },
    });
    if (existing) {
      return handleError(new Error('کاربر قبلاً در لیست دوستان نزدیک است'), res, 'کاربر قبلاً در لیست دوستان نزدیک است', 400);
    }
    await prisma.closeFriend.create({
      data: { userId, friendId: friend.id },
    });
    return res.status(200).json({ success: true, message: 'کاربر به دوستان نزدیک اضافه شد' });
  } catch (error) {
    return handleError(error, res, 'خطا در افزودن دوست نزدیک');
  }
}

export async function removeCloseFriendHandler(req: AuthRequest, res: Response) {
  try {
    const { username } = req.params;
    const userId = req.user!.id;
    const friend = await prisma.user.findUnique({ where: { username } });
    if (!friend) {
      return handleError(new Error('کاربر یافت نشد'), res, 'کاربر یافت نشد', 404);
    }
    await prisma.closeFriend.deleteMany({
      where: { userId, friendId: friend.id },
    });
    return res.status(200).json({ success: true, message: 'کاربر از دوستان نزدیک حذف شد' });
  } catch (error) {
    return handleError(error, res, 'خطا در حذف دوست نزدیک');
  }
}