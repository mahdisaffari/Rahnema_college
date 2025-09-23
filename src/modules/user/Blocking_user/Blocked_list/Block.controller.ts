import { Response } from "express";
import { AuthRequest } from "../../../auth/auth.middleware";
import { handleError } from "../../../../utils/errorHandler";
import { blockUser, unblockUser, getBlockedUsers } from "./Block.service";
import { BlockActionResponse, BlockedUsersListResponse } from "./Block.type";

export async function blockUserHandler(req: AuthRequest, res: Response<BlockActionResponse>) {
  try {
    const { username } = req.params as { username: string };
    const result = await blockUser(req.user!.id, username);
    return res.json({ success: true, message: "کاربر بلاک شد", data: { blocked: result.blocked } });
  } catch (error) {
    return handleError(error, res, "خطا در بلاک کردن کاربر");
  }
}

export async function unblockUserHandler(req: AuthRequest, res: Response<BlockActionResponse>) {
  try {
    const { username } = req.params as { username: string };
    const result = await unblockUser(req.user!.id, username);
    return res.json({ success: true, message: "کاربر آنبلاک شد", data: { blocked: result.blocked } });
  } catch (error) {
    return handleError(error, res, "خطا در آنبلاک کردن کاربر");
  }
}

export async function getBlockedUsersHandler(req: AuthRequest, res: Response<BlockedUsersListResponse>) {
  try {
    const list = await getBlockedUsers(req.user!.id);
    if (!list.length) {
      return res.json({ success: true, message: "هیچ کاربری را بلاک نکرده‌اید", data: [] });
    }
    return res.json({ success: true, message: "فهرست کاربران بلاک‌شده", data: list });
  } catch (error) {
    return handleError(error, res, "خطا در دریافت فهرست بلاک");
  }
}


