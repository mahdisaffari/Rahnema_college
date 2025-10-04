import { NextFunction, Response } from 'express';
import { validateAll } from './editPost.validator';
import { AuthRequest } from '../../auth/auth.middleware';

export async function validateEditPostMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const { caption, removeImageIds, mentions, isCloseFriendsOnly }: { caption?: string; removeImageIds?: string[]; mentions?: string | string[]; isCloseFriendsOnly?: string | boolean } = req.body;
  const images = (req.files as Express.Multer.File[] | undefined) ?? undefined;

  let cleanedMentions: string[] = [];
  if (mentions) {
    if (typeof mentions === 'string') {
      try {
        const parsedMentions = JSON.parse(mentions);
        cleanedMentions = Array.isArray(parsedMentions) ? parsedMentions : [parsedMentions];
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'خطا در پارسینگ منشن‌ها',
          data: { mentions: 'فرمت منشن‌ها باید آرایه JSON معتبر باشد' },
        });
      }
    } else if (Array.isArray(mentions)) {
      cleanedMentions = mentions;
    }
    cleanedMentions = cleanedMentions.map(m => m.replace('@', ''));
  }

  const parsedIsCloseFriendsOnly = typeof isCloseFriendsOnly === 'string' ? isCloseFriendsOnly === 'true' : !!isCloseFriendsOnly;

  const errors = await validateAll({
    caption,
    images,
    removeImageIds,
    mentions: cleanedMentions,
    isCloseFriendsOnly: parsedIsCloseFriendsOnly,
  });

  if (errors.images || errors.caption || errors.mentions || errors.removeImageIds || errors.hashtags || errors.isCloseFriendsOnly) {
    return res.status(400).json({ success: false, message: 'خطا در اعتبارسنجی', data: errors });
  }

  req.body.mentions = cleanedMentions;
  req.body.isCloseFriendsOnly = parsedIsCloseFriendsOnly;
  next();
}