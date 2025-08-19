import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env";
import { AuthUser } from "../../types/auth.types";

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

export function auth(req: Request, res: Response, next: NextFunction) {
  // age token toye header nabod yani user register nashode
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing Authorization header" });

  try { // ba jwt_secret token baresi mishe age valid bod sub
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; username: string; email: string };
    (req as AuthRequest).user = { id: decoded.sub, username: decoded.username, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}