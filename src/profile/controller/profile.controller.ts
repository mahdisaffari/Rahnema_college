import { Request, Response } from "express";
import { getProfile, updateProfile } from "../service/profile.service";
import { AuthRequest } from "../../auth/middleware/auth";
import { ProfileResponse, ProfileUpdateRequest } from "../../types/profile.types";

export async function getProfileHandler(req: AuthRequest, res: Response<ProfileResponse>) {
  try {
    const userId = req.user!.id;
    const user = await getProfile(userId);
    if (!user) return res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    return res.json({ success: true, message: "پروفایل با موفقیت دریافت شد", data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "خطا در گرفتن پروفایل" });
  }
}

export async function updateProfileHandler(req: AuthRequest, res: Response<ProfileResponse>) {
  try {
    const userId = req.user!.id;
    const { firstname, lastname, bio, avatar, email, password }: ProfileUpdateRequest = req.body;

    const updatedUser = await updateProfile(userId, {
      firstname,
      lastname,
      bio,
      avatar,
      email,
      password,
    });

    return res.json({ success: true, message: "پروفایل با موفقیت بروزرسانی شد", data: updatedUser });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "خطا در بروزرسانی پروفایل" });
  }
}