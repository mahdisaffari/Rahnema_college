import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { env } from "../config/env";
import type { SignOptions } from "jsonwebtoken";
import { AuthUser } from "../modules/auth/auth.types";

export type JwtPayload = { sub: string; username: string; email: string };

const isProd = env.NODE_ENV === "production";

export const accessCookieName = "access_token";
export const refreshCookieName = "refresh_token";

export const accessCookieOptions: import("express").CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 1000, // 1 ساعت
};

export const refreshCookieOptions: import("express").CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 روز (برای rememberMe: true)
};

export const refreshCookieShortOptions: import("express").CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 4 * 60 * 60 * 1000, // 4 ساعت (برای rememberMe: false)
};

function parseExpires(value: string): SignOptions["expiresIn"] {
  return value as SignOptions["expiresIn"];
}

export function signAccessToken(user: AuthUser) {
  const payload = { sub: user.id, username: user.username, email: user.email };
  const options: SignOptions = { expiresIn: parseExpires(env.JWT_ACCESS_EXPIRES || "1h") };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(user: AuthUser, rememberMe: boolean = false) {
  const payload = { sub: user.id, username: user.username, email: user.email };
  const expiresIn = rememberMe ? env.JWT_REFRESH_EXPIRES_LONG : env.JWT_REFRESH_EXPIRES_SHORT;
  const options: SignOptions = { expiresIn: parseExpires(expiresIn || "4h") };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function setAuthCookies(res: Response, access: string, refresh: string, rememberMe: boolean = false) {
  res.cookie(accessCookieName, access, accessCookieOptions);
  res.cookie(refreshCookieName, refresh, rememberMe ? refreshCookieOptions : refreshCookieShortOptions);
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(accessCookieName, { path: "/" });
  res.clearCookie(refreshCookieName, { path: "/" });
}