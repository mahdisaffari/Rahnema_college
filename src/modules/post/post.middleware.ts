import { NextFunction, Response } from 'express';
import { validateAll } from './post.validator';
import { AuthRequest } from '../auth/auth.middleware';

export async function validateAllMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const { caption } = req.body;
  const images = (req.files as Express.Multer.File[] | undefined) ?? undefined;
  const errors = await validateAll({ caption, images });
  if (errors.images || errors.caption || errors.mentions) {
    return res.status(400).json({ success: false, message: 'خطا در اعتبارسنجی', data: errors });
  }
  next();
}