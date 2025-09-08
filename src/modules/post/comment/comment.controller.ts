import { Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { CreateCommentApiResponse, LikeCommentResponse } from './comment.types';
import { createComment, createReply, likeComment } from './comment.service';
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

// handler baraye ijad reply
export async function createReplyHandler(req: AuthRequest, res: Response<CreateCommentApiResponse>) {
  try {
    const userId = req.user!.id;
    const postId = req.params.id;
    const commentId = req.params.commentId;
    const { content } = req.body;

    const reply = await createReply(userId, postId, commentId, content);
    return res.status(201).json({
      success: true,
      message: 'ریپلای با موفقیت ایجاد شد',
      data: reply,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در ایجاد ریپلای', 400);
  }
}

// handler baraye like/unlike comment
export async function likeCommentHandler(req: AuthRequest, res: Response<LikeCommentResponse>) {
  try {
    const userId = req.user!.id;
    const commentId = req.params.commentId;

    const result = await likeComment(userId, commentId);
    return res.status(200).json({
      success: true,
      message: result.liked ? 'کامنت لایک شد' : 'لایک کامنت حذف شد',
      data: result,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در لایک/آنلایک کامنت', 400);
  }
}