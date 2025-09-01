import { Request, Response } from 'express';
import { getProfile, updateProfile, getUserByUsername } from './user.service';
import { ProfileResponse, UserResponse, UserApiResponse, UserUpdateRequest } from './user.types';
import { AuthRequest } from '../auth/auth.middleware';
import { handleError } from '../../utils/errorHandler';

// input haro be service midim

export async function getProfileHandler(req: AuthRequest, res: Response<UserApiResponse<ProfileResponse>>) {
  try {
    const user = await getProfile(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    return res.json({ success: true, message: 'پروفایل با موفقیت دریافت شد', data: user });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت پروفایل');
  }
}


export async function getUserHandler(req: Request, res: Response<UserApiResponse<UserResponse>>) {
  try {
    const username = req.params.username;
    const user = await getUserByUsername(username);
    if (!user) return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    return res.json({ success: true, message: 'اطلاعات کاربر با موفقیت دریافت شد', data: user });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت اطلاعات کاربر');
  }
}

//inja dade haye jadid ro migirim midim be sevice 
export async function updateProfileHandler(req: AuthRequest, res: Response<UserApiResponse<ProfileResponse>>) {
  try {
    const userId = req.user!.id;
    const { firstname, lastname, bio, email, password }: UserUpdateRequest = req.body;
    const avatar = req.file;

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