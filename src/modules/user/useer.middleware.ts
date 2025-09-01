import { Request, Response, NextFunction } from 'express';
import { validateProfileUpdate, validateUsername } from './user.validator';
import { UserApiResponse, ProfileResponse, UserResponse } from './user.types';
import { AuthRequest } from '../auth/auth.middleware';

export function validateProfileUpdateMiddleware(req: AuthRequest, res: Response<UserApiResponse<ProfileResponse>>, next: NextFunction) {
  const { firstname, lastname, bio, email, password } = req.body;
  const avatar = req.file;

  const error = validateProfileUpdate({ firstname, lastname, bio, avatar, email, password });
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  next();
}

export function validateUsernameMiddleware(req: Request, res: Response<UserApiResponse<UserResponse>>, next: NextFunction) {
  const { username } = req.params;
  const error = validateUsername(username);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }
  next();
}