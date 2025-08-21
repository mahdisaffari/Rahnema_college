import { Request, Response, NextFunction } from 'express';
import { validateProfileUpdate } from '../validators/profile.validator';
import { AuthRequest } from '../../auth/middleware/auth';
import { ProfileResponse } from '../../types/profile.types';

export function validateProfileUpdateMiddleware(req: AuthRequest, res: Response<ProfileResponse>, next: NextFunction) {
  const { firstname, lastname, bio, email, password } = req.body;
  const avatar = req.file; 

  const error = validateProfileUpdate({ firstname, lastname, bio, avatar, email, password });
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  next();
}