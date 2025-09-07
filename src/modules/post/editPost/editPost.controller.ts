import { Response } from 'express';
import { EditPostResponse, EditPostRequest } from './editPost.types';
import { editPost } from './editPost.service';
import { AuthRequest } from '../../auth/auth.middleware';
import { handleError } from '../../../utils/errorHandler';

export async function editPostHandler(req: AuthRequest, res: Response<EditPostResponse>) {
  try {
    const userId = req.user!.id;
    const postId = req.params.id;
    const { caption, removeImageIds, mentions } = req.body as EditPostRequest;
    const images = (req.files as Express.Multer.File[]) || [];

    const updatedPost = await editPost(postId, userId, caption, images, removeImageIds, mentions);
    return res.json({
      success: true,
      message: 'پست با موفقیت ویرایش شد',
      data: updatedPost,
    });
  } catch (error) {
    return handleError(error, res, 'خطا در ویرایش پست', 400);
  }
}