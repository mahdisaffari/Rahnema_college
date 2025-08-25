import { Response } from 'express';
import { AuthRequest } from '../../auth/middleware/auth';
import { CreatePostResponse } from '../../types/setupPost.types';
import { createPostWithImages } from '../service/setupPost.service';

export async function createSetupPostHandler(req: AuthRequest, res: Response<CreatePostResponse>) {
  try {
    const userId = req.user!.id;
    const caption = req.body?.caption as string | undefined;
    const images = (req.files as Express.Multer.File[]) ?? [];
    const post = await createPostWithImages(userId, caption, images);
    return res.status(201).json({ success: true, message: 'پست با موفقیت ایجاد شد', data: {
      id: post.id,
      caption: post.caption,
      images: post.images,
      createdAt: post.createdAt.toISOString(),
    } });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message ?? 'خطا در ایجاد پست' });
  }
}


