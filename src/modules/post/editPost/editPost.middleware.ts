import { NextFunction, Response } from 'express';
import { validateAll } from './editPost.validator';
import { AuthRequest } from '../../auth/auth.middleware';

export async function validateEditPostMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const { caption, removeImageIds, mentions, isCloseFriendsOnly } = req.body;
  const images = (req.files as Express.Multer.File[] | undefined) ?? undefined;
  const errors = await validateAll({ caption, images, removeImageIds, mentions, isCloseFriendsOnly });
  if (errors.images || errors.caption || errors.mentions || errors.removeImageIds || errors.isCloseFriendsOnly) {
    return res.status(400).json({ success: false, message: 'خطا در اعتبارسنجی', data: errors });
  }
  next();
}