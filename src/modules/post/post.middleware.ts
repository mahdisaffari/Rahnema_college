// modules/post/post.middleware.ts
import { NextFunction, Response } from 'express';
import { validateImages, validateCaption, validateMentionsFromInput } from './post.validator';
import { AuthRequest } from '../auth/auth.middleware';

export function validateImagesMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const images = (req.files as Express.Multer.File[] | undefined) ?? undefined;
  const error = validateImages({ images });
  if (error) return res.status(400).json({ success: false, message: error });
  next();
}

export function validateCaptionMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const { caption } = req.body;
  const error = validateCaption({ caption });
  if (error) return res.status(400).json({ success: false, message: error });
  next();
}

export async function validateMentionsMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const { caption } = req.body;
  const error = await validateMentionsFromInput(caption || "");
  if (error) return res.status(400).json({ success: false, message: error });
  next();
}