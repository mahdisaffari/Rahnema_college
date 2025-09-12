// post.middleware.ts
import { NextFunction, Response } from 'express';
import { validateAll } from './post.validator';
import { AuthRequest } from '../auth/auth.middleware';
import { validateGetUserPosts } from '../../utils/validators';

export async function validateAllMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  let { caption, mentions } = req.body;
  const images = req.files as Express.Multer.File[] | undefined;

 
  if (mentions && typeof mentions === 'string') {
    try {
      mentions = JSON.parse(mentions); 
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'خطا در پارسینگ منشن‌ها',
        data: { mentions: 'فرمت منشن‌ها باید آرایه JSON معتبر باشد' },
      });
    }
  }

  const errors = await validateAll({ caption, images, mentions: mentions || [] });
  if (errors.images || errors.caption || errors.mentions) {
    return res.status(400).json({ success: false, message: 'خطا در اعتبارسنجی', data: errors });
  }

 
  req.body.mentions = mentions || [];
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