import { Request, Response, NextFunction } from 'express';
import { validatePrivateToggle, validateProfileUpdate, validateUsername } from './user.validator';
import { UserApiResponse, ProfileResponse, UserResponse, PrivateToggleResponse } from './user.types';
import { AuthRequest } from '../auth/auth.middleware';
import { validateCloseFriend } from '../../utils/validators';

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

export function validatePrivateToggleMiddleware(req: AuthRequest, res: Response<PrivateToggleResponse>, next: NextFunction) {
  const { isPrivate } = req.body;
  const error = validatePrivateToggle(isPrivate);
  if (error) return res.status(400).json({
    success: false, message: error,
    data: {
      isPrivate: false
    }
  });
  next();
}

export async function validateCloseFriendMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const { username } = req.params;
  const errors = await validateCloseFriend({ username });
  if (errors.username) {
    return res.status(400).json({ success: false, message: errors.username });
  }
  next();
}