import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { validateGetHomepage } from '../../../utils/validators';

export async function validateHomepageMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const page = parseInt(req.query.page as string) || 1;
  let limit = parseInt(req.query.limit as string) || 6; 

  if (limit < 1) limit = 1;
  if (limit > 10) limit = 10;

  const errors = validateGetHomepage({ page, limit });
  if (errors.page || errors.limit) {
    return res.status(400).json({ success: false, message: 'خطا در اعتبارسنجی', data: errors });
  }
  req.query.page = page.toString();
  req.query.limit = limit.toString();
  next();
}