import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { Request, Response, NextFunction } from "express";
import { AuthUser } from "./auth.types";
import { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";

const prisma = new PrismaClient();
const ACCESS_COOKIE_NAME = "access_token";

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ success: false, message: "لطفاً وارد شوید" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; username: string; email: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) {
      return res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    }
    req.user = { id: decoded.sub, username: decoded.username, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "توکن نامعتبر است" });
  }
}

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  message: { success: false, message: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید." },
});