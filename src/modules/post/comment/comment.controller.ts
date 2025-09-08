import { Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { CreateCommentApiResponse } from './comment.types';
import { createComment } from './comment.service';
import { handleError } from '../../../utils/errorHandler';

// handler baraye ijad comment
export async function createCommentHandler(req: AuthRequest, res: Response<CreateCommentApiResponse>) {
  try {
    const userId = req.user!.id;
    const postId = req.params.id;
    const { content } = req.body;

    const comment = await createComment(userId, postId, content);
    return res.status(201).json({
      success: true,
      message: 'کامنت با موفقیت ایجاد شد',
      data: comment,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در ایجاد کامنت', 400);
  }
}