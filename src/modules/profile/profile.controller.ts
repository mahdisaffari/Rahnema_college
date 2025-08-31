import { Request, Response } from 'express';
import { getProfile, updateProfile } from './profile.service';
import { ProfileResponse, ProfileUpdateRequest } from './profile.types';
import { AuthRequest } from '../auth/auth.middleware';
import { handleError } from '../../utils/errorHandler';

// input haro be service midim

export async function getProfileHandler(req: AuthRequest, res: Response<ProfileResponse>) {
  try {
    //mire az service get profile estefade mikone
    const user = await getProfile(req.user!.id);
    //agar user peyda nashod
    if (!user) return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    // agar peyda shod
    return res.json({ success: true, message: 'پروفایل با موفقیت دریافت شد', data: user });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت پروفایل');
  }
}

//inja dade haye jadid ro migirim mifim be sevice 
export async function updateProfileHandler(req: AuthRequest, res: Response<ProfileResponse>) {
  try {
    const userId = req.user!.id;
    const { firstname, lastname, bio, email, password }: ProfileUpdateRequest = req.body;
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
  }  catch (error) {
    return handleError(error, res, 'خطا در بروزرسانی پروفایل');
  }
}