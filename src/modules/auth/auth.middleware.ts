import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { Request, Response, NextFunction } from "express";
import { AuthUser } from "./auth.types";
import rateLimit from "express-rate-limit";

/**
 * baresi token jwt dar har dakhst(login) agar jwt valide 
 * data user be req dade mishe
 * 
 * che komaki mikone in = bedon in har bar bekhay befahmi user kie
 * bayad khode dasti tokeno decode koni
 */

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const ACCESS_COOKIE_NAME = "access_token";

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE_NAME] as string | undefined;
  if (!token) {
    (req as AuthRequest).user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; username: string; email: string };
    (req as AuthRequest).user = { id: decoded.sub, username: decoded.username, email: decoded.email };
    next();
  } catch (error) {
    (req as AuthRequest).user = undefined;
    next();
  }
}

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  message: { success: false, message: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید." },
});