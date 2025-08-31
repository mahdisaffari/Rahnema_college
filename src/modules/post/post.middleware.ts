import { NextFunction, Response } from 'express';
import { validateCreatePost } from './post.validator';
import { AuthRequest } from '../auth/auth.middleware';
import { CreatePostRequest } from './post.types';

export function validateSetupPostMiddleware(
  req: AuthRequest & { body: CreatePostRequest }, 
  res: Response,
  next: NextFunction
) {
  const { caption } = req.body; 
  const images = (req.files as Express.Multer.File[] | undefined) ?? undefined;
  const error = validateCreatePost({ caption, images });
  if (error) return res.status(400).json({ success: false, message: error });
  next();
}