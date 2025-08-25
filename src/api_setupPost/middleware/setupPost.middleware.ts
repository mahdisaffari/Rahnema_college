import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../auth/middleware/auth';
import { validateCreatePost } from '../validators/setupPost.validator';

export function validateSetupPostMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const caption = req.body?.caption as string | undefined;
  const images = (req.files as Express.Multer.File[] | undefined) ?? undefined;
  const error = validateCreatePost({ caption, images });
  if (error) return res.status(400).json({ success: false, message: error });
  next();
}


