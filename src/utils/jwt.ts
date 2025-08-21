import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { env } from "../config/env";
import { AuthUser } from "../types/auth.types";
import type { SignOptions } from "jsonwebtoken";

export type JwtPayload = { sub: string; username: string; email: string };

const isProd = env.NODE_ENV === "production";

export const accessCookieName = "access_token";

export const accessCookieOptions: import("express").CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("lax" as const) : ("lax" as const),
  path: "/",
  maxAge: 60 * 60 * 1000, 
};

export function signAccessToken(user: AuthUser) {
  const payload = { sub: user.id, username: user.username, email: user.email };
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function setAuthCookies(res: Response, access: string) {
  res.cookie(accessCookieName, access, accessCookieOptions);
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(accessCookieName, { path: "/" });
}