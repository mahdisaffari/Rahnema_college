import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { validateGetHomepage } from '../../../utils/validators';

export async function validateBookmarkedPostsMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 9;

  if (limit < 1 || limit > 10) {
    return res.status(400).json({ success: false, message: 'limit باید بین 1 و 10 باشد' });
  }

  const errors = validateGetHomepage({ page, limit });
  if (errors.page || errors.limit) {
    return res.status(400).json({ success: false, message: 'خطا در اعتبارسنجی', data: errors });
  }

  req.query.page = page.toString();
  req.query.limit = limit.toString();
  next();
}