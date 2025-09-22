import { Request, Response } from 'express';
import { getProfile, updateProfile, getUserByUsername, togglePrivateProfile } from './user.service'; // اضافه کردن togglePrivateProfile
import { ProfileResponse, UserResponse, UserApiResponse, UserUpdateRequest, PrivateToggleResponse } from './user.types';
import { AuthRequest } from '../auth/auth.middleware';
import { handleError } from '../../utils/errorHandler';

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