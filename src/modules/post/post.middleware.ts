import { NextFunction, Response } from 'express';
import { validateAll } from './post.validator';
import { AuthRequest } from '../auth/auth.middleware';
import { validateGetUserPosts } from '../../utils/validators';

export async function validateAllMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const { caption } = req.body;
  const images = (req.files as Express.Multer.File[] | undefined) ?? undefined;
  const errors = await validateAll({ caption, images });
  if (errors.images || errors.caption || errors.mentions) {
    return res.status(400).json({ success: false, message: 'خطا در اعتبارسنجی', data: errors });
  }
  next();
}

export async function validateGetUserPostsMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const { username } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const errors = await validateGetUserPosts({ username, page, limit });
  if (errors.username || errors.page || errors.limit) {
    return res.status(400).json({ success: false, message: 'خطا در اعتبارسنجی', data: errors });
  }
  next();
}