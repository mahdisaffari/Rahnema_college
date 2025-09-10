import { Request, Response } from 'express';
import * as authService from './auth.service';
import { validateLogin, validateRegister } from './auth.validator';
import { clearAuthCookies, setAuthCookies } from '../../utils/jwt';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './auth.types';
import { handleError } from '../../utils/errorHandler';

export async function register(req: Request<{}, {}, RegisterRequest>, res: Response<RegisterResponse>) {
  try {
    const error = validateRegister(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    await authService.register(req.body.username, req.body.email, req.body.password);
    return res.status(201).json({ success: true, message: 'کاربر ثبت نام شده' });
  } catch (error) {
    return handleError(error, res, 'خطای داخلی');
  }
}

export async function login(req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) {
  try {
    const error = validateLogin(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    const { token, username } = await authService.login(req.body.identifier, req.body.password);
    setAuthCookies(res, token);
    return res.json({ success: true, message: 'ورود با موفقیت انجام شد', token, username }); 
  } catch (error) {
    return handleError(error, res, 'اعتبارنامه‌های نامعتبر', 401);
  }
}

export async function logout(_req: Request, res: Response) {
  try {
    clearAuthCookies(res);
    return res.json({ success: true, message: 'خروج انجام شد' });
  } catch (error) {
    return handleError(error, res, 'خطا در خروج');
  }
}