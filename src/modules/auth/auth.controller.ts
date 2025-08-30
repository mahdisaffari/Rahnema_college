import { Request, Response } from "express";
import * as authService from "./auth.service";
import { validateLogin, validateRegister } from "./auth.validator";
import { clearAuthCookies, setAuthCookies } from "../../utils/jwt";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "./auth.types";



export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response<RegisterResponse>) => {
  const error = validateRegister(req.body); 
  if (error) return res.status(400).json({ success: false, message: error });

  try {
    await authService.register(req.body.username, req.body.email, req.body.password);
    return res.status(201).json({ success: true, message: "کاربر ثبت نام شده" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ success: false, message: e.message || "خطای داخلی" });
  }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) => {
  const error = validateLogin(req.body); 
  if (error) return res.status(400).json({ success: false, message: error });

  try {
    const token = await authService.login(req.body.identifier, req.body.password);
    setAuthCookies(res, token); // ست کردن کوکی
    return res.json({ success: true, message: "ورود با موفقیت انجام شد", token });
  } catch (e: any) {
    return res.status(401).json({ success: false, message: e.message || "اعتبارنامه‌های نامعتبر" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  clearAuthCookies(res); // پاک کردن کوکی‌ها
  return res.json({ success: true, message: "خروج انجام شد" });
};