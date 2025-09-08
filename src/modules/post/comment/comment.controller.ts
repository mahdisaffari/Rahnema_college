import { Response } from 'express';
import { AuthRequest } from '../../auth/auth.middleware';
import { CreateCommentApiResponse, LikeCommentResponse, GetPostCommentsResponse } from './comment.types';
import { createComment, createReply, likeComment, getPostComments } from './comment.service';
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

// handler baraye gereftan comment haye post
export async function getPostCommentsHandler(req: AuthRequest, res: Response<GetPostCommentsResponse>) {
  try {
    const postId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getPostComments(postId, page, limit);
    return res.status(200).json({
      success: true,
      message: 'کامنت‌ها با موفقیت دریافت شد',
      data: result,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در دریافت کامنت‌ها', 404);
  }
}