import { z } from 'zod';
import { CreatePostSchema, extractMentions, validateMentions } from '../../../utils/validators';

export const EditPostSchema = CreatePostSchema.partial(); // فیلدها اختیاری

export const validateAll = async (data: { caption?: string; images?: Express.Multer.File[]; removeImageIds?: string[] })
: Promise<{ images?: string | null; caption?: string | null; mentions?: string | null; removeImageIds?: string | null }> => {
  const errors = {
    images: validateImages({ images: data.images }),
    caption: validateCaption({ caption: data.caption }),
    mentions: await validateMentionsFromInput(data.caption || ""),
    removeImageIds: validateRemoveImageIds({ removeImageIds: data.removeImageIds }),
  };
  return errors;
};

function validateImages(data: { images?: Express.Multer.File[] }): string | null {
  try {
    EditPostSchema.pick({ images: true }).parse(data);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی تصاویر";
  }
}

function validateCaption(data: { caption?: string }): string | null {
  try {
    EditPostSchema.pick({ caption: true }).parse(data);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی کپشن";
  }
}

async function validateMentionsFromInput(caption: string): Promise<string | null> {
  const mentions = extractMentions(caption || "");
  return await validateMentions(mentions);
}

function validateRemoveImageIds(data: { removeImageIds?: string[] }): string | null {
  try {
    z.array(z.string().uuid()).optional().parse(data.removeImageIds);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی ID تصاویر برای حذف";
  }
}