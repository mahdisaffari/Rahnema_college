import { Request, Response } from 'express';
import * as authService from './auth.service';
import { validateLogin, validateRegister, validateForgotPassword, validateResetPassword } from './auth.validator';
import { clearAuthCookies, setAuthCookies, refreshCookieName } from '../../utils/jwt';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ForgotPasswordRequest, ResetPasswordRequest, ForgotPasswordResponse, ResetPasswordResponse } from './auth.types';
import { handleError } from '../../utils/errorHandler';

export async function register(req: Request<{}, {}, RegisterRequest>, res: Response<RegisterResponse>) {
  try {
    const error = validateRegister(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    await authService.register(req.body.username, req.body.email, req.body.password);
    return res.status(201).json({ success: true, message: 'کاربر ثبت نام شد. ایمیل تأیید ارسال شد.' });
  } catch (error) {
    return handleError(error, res, 'خطای داخلی');
  }
}

export async function login(req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) {
  try {
    const error = validateLogin(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    const { access, refresh, username } = await authService.login(req.body.identifier, req.body.password, req.body.rememberMe);
    setAuthCookies(res, access, refresh, req.body.rememberMe || false);
    return res.json({
      success: true,
      message: 'ورود موفق',
      token: access,
      refresh,
      username
    });
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

export async function verifyEmailHandler(req: Request, res: Response) {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') return res.status(400).json({ success: false, message: 'توکن الزامی است' });
    await authService.verifyEmail(token);
    return res.json({ success: true, message: 'ایمیل تأیید شد' });
  } catch (error) {
    return handleError(error, res, 'خطا در تأیید ایمیل');
  }
}

export async function refreshHandler(req: Request, res: Response) {
  try {
    const refresh = req.cookies?.[refreshCookieName] as string | undefined;
    if (!refresh) return res.status(401).json({ success: false, message: 'رفرش توکن الزامی' });
    const newAccess = await authService.refreshAccessToken(refresh);
    setAuthCookies(res, newAccess, refresh);
    return res.json({ success: true, message: 'توکن بروز شد', token: newAccess });
  } catch (error) {
    clearAuthCookies(res);
    return handleError(error, res, 'رفرش ناموفق', 401);
  }
}


export async function forgotPasswordHandler(req: Request<{}, {}, ForgotPasswordRequest>, res: Response<ForgotPasswordResponse>) {
  try {
    const error = validateForgotPassword(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    await authService.forgotPassword(req.body.email);
    return res.json({ success: true, message: 'ایمیل بازنشانی ارسال شد' });
  } catch (error) {
    return handleError(error, res, 'خطا در درخواست بازنشانی', 400);
  }
}


export async function resetPasswordHandler(req: Request<{}, {}, ResetPasswordRequest>, res: Response<ResetPasswordResponse>) {
  try {
    const error = validateResetPassword(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    await authService.resetPassword(req.body.token, req.body.newPassword);
    return res.json({ success: true, message: 'رمز عبور تغییر کرد' });
  } catch (error) {
    return handleError(error, res, 'خطا در تغییر رمز عبور', 400);
  }
}
