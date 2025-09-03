import { Request, Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { toggleLike, getLikesCount } from './like.service';
import { LikeResponse } from './like.type';
import { PrismaClient } from '@prisma/client';
import { handleError } from '../../../utils/errorHandler';

const prisma = new PrismaClient();

export async function likePostHandler(req: AuthRequest, res: Response<LikeResponse>) {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    const isLiked = await toggleLike(postId, userId);
    const action = isLiked ? 'لایک شد' : 'آنلایک شد';
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { likeCount: true },
    });
    return res.json({
      success: true,
      message: `پست با موفقیت ${action}`,
      data: { postId, userId, likeCount: post?.likeCount || 0 },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در مدیریت لایک');
  }
}

export async function getPostLikesCountHandler(req: Request, res: Response<LikeResponse>) {
  try {
    const postId = req.params.id;
    if (!postId)
      return res.status(400).json({ success: false, message: 'شناسه پست نامعتبر است' });

    const count = await getLikesCount(postId);
    return res.json({
      success: true,
      message: 'تعداد لایک‌ها با موفقیت دریافت شد',
      data: {
        likeCount: count,
        postId: '',
        userId: ''
      },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت تعداد لایک‌ها');
  }
}