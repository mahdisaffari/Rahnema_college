import { Request, Response } from 'express';
import { toggleFollow } from './follow.service';
import { FollowResponse } from './follow.types';
import { AuthRequest } from '../../auth/auth.middleware';
import { handleError } from '../../../utils/errorHandler';

export async function followUserHandler(req: AuthRequest, res: Response<FollowResponse>) {
  try {
    const followerId = req.user!.id;
    const followingUsername = req.params.username;
    const isFollowed = await toggleFollow(followerId, followingUsername);
    const action = isFollowed ? 'فالو شد' : 'انفالو شد';
    return res.json({
      success: true,
      message: `کاربر با موفقیت ${action}`,
      data: { followed: isFollowed },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در مدیریت فالو');
  }
}

