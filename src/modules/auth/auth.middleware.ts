import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { Request, Response, NextFunction } from "express";
import { AuthUser } from "./auth.types";

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
  if (!token) return res.status(401).json({ message: "هدر مجوز وجود ندارد" });

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; username: string; email: string };
    (req as AuthRequest).user = { id: decoded.sub, username: decoded.username, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "توکن نامعتبر یا منقضی شده" });
  }
}