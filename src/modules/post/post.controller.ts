import { Response } from 'express';
import { CreatePostResponse, CreatePostRequest } from './post.types';
import { createPostWithImages } from './post.service';
import { AuthRequest } from '../auth/auth.middleware';
import { handleError } from '../../utils/errorHandler';

export async function createSetupPostHandler(
  req: AuthRequest,
  res: Response<CreatePostResponse>
) {
  try {
    const userId = req.user!.id;
    const { caption } = req.body as CreatePostRequest; 
    const images = (req.files as Express.Multer.File[]) || [];

    const post = await createPostWithImages(userId, caption, images);
    return res.status(201).json({
      success: true,
      message: 'پست با موفقیت ایجاد شد',
      data: {
        id: post.id,
        caption: post.caption,
        images: post.images,
        createdAt: post.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return handleError(error, res, 'خطا در ایجاد پست', 400);
  }
}