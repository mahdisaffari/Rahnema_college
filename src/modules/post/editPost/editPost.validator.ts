import { z } from 'zod';
import { CreatePostSchema, extractHashtags, validateHashtags } from '../../../utils/validators';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const EditPostSchema = z.object({
  caption: CreatePostSchema.shape.caption.optional(),
  images: z
    .array(
      z.object({
        mimetype: z.string().refine((val) => val.startsWith("image/"), {
          message: "فقط تصویر مجاز است",
        }),
        size: z
          .number()
          .max(5 * 1024 * 1024, "حجم تصویر باید کمتر از ۵ مگابایت باشد"),
      })
    )
    .max(5, "حداکثر ۵ تصویر")
    .optional(),
  removeImageIds: z.array(z.string().uuid()).optional(),
  mentions: z.array(z.string()).optional(),
});

export const validateAll = async (data: { caption?: string; images?: Express.Multer.File[]; removeImageIds?: string[]; mentions?: string[] })
: Promise<{ images?: string | null; caption?: string | null; mentions?: string | null; removeImageIds?: string | null; hashtags?: string | null }> => {
  const errors = {
    images: validateImages({ images: data.images }),
    caption: validateCaption({ caption: data.caption }),
    mentions: await validateMentions(data.mentions || []),
    hashtags: await validateHashtags(extractHashtags(data.caption || "")),
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

async function validateMentions(mentions: string[]): Promise<string | null> {
  if (!mentions || mentions.length === 0) return null;
  try {
    const users = await prisma.user.findMany({
      where: { username: { in: mentions } },
      select: { username: true },
    });
    const foundUsernames = users.map(user => user.username);
    const invalidMentions = mentions.filter(mention => !foundUsernames.includes(mention));
    if (invalidMentions.length > 0) {
      return `کاربران زیر یافت نشدند: ${invalidMentions.join(', ')}`;
    }
    return null;
  } catch (error) {
    return "خطا در اعتبارسنجی منشن‌ها";
  }
}

function validateRemoveImageIds(data: { removeImageIds?: string[] }): string | null {
  try {
    z.array(z.string().uuid()).optional().parse(data.removeImageIds);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی ID تصاویر برای حذف";
  }
}