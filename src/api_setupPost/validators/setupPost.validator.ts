import { isNonEmptyString } from '../../utils/validators';

export const validateCreatePost = ({ caption, images }: { caption?: string; images?: Express.Multer.File[]; }): string | null => {
  if (caption && (!isNonEmptyString(caption) || caption.length > 300))
    return 'کپشن باید رشته معتبر با حداکثر ۳۰۰ کاراکتر باشد';
  if (images && images.length > 5)
    return 'حداکثر ۵ تصویر مجاز است';
  if (images) {
    for (const img of images) {
      if (!img.mimetype.startsWith('image/')) return 'همه فایل‌ها باید تصویری باشند';
      if (img.size > 5 * 1024 * 1024) return 'حجم هر تصویر باید کمتر از ۵ مگابایت باشد';
    }
  }
  if (!images || images.length === 0)
    return 'ارسال حداقل یک تصویر الزامی است';
  return null;
}


