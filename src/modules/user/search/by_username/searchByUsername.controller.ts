import { Request, Response } from "express";
import { searchByUsernameSchema } from "./searchByUsername.validator";
import { searchByUsername } from "./searchByUsername.service";
import { SearchByUsernameResponse } from "./searchByUsername.types";
import { AuthRequest } from "../../../auth/auth.middleware";
import { handleError } from "../../../../utils/errorHandler";

export async function searchByUsernameController(req: AuthRequest, res: Response<SearchByUsernameResponse>) {
  try {
    const { username, page, limit } = searchByUsernameSchema.parse(req.query);
    const currentUserId = req.user!.id;

    const { users, total, suggestedUsernames } = await searchByUsername({ username, page, limit }, currentUserId);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total_records: total,
          total_pages: Math.ceil(total / limit),
        },
        suggestedUsernames, 
      },
      message: users.length ? `${users.length} کاربر یافت شد` : "کاربری یافت نشد",
    });
  } catch (error) {
    return handleError(error, res, "خطا در جستجوی کاربران");
  }
}