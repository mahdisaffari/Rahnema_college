import { Response } from 'express';
import { CreatePostResponse, CreatePostRequest } from './post.types';
import { createPostWithImages } from './post.service';
import { AuthRequest } from '../auth/auth.middleware';
import { handleError } from '../../utils/errorHandler';

export async function validateImagesHandler(req: AuthRequest, res: Response) {
  try {
    return res.json({ success: true, message: 'تصاویر معتبر هستند' });
  } catch (error) {
    return handleError(error, res, 'خطا در اعتبارسنجی تصاویر', 400);
  }
}

export async function validateCaptionHandler(req: AuthRequest, res: Response) {
  try {
    return res.json({ success: true, message: 'کپشن معتبر است' });
  } catch (error) {
    return handleError(error, res, 'خطا در اعتبارسنجی کپشن', 400);
  }
}

export async function validateMentionsHandler(req: AuthRequest, res: Response) {
  try {
    return res.json({ success: true, message: 'منشن‌ها معتبر هستند' });
  } catch (error) {
    return handleError(error, res, 'خطا در اعتبارسنجی منشن‌ها', 400);
  }
}

export async function createSetupPostHandler(req: AuthRequest, res: Response<CreatePostResponse>) {
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