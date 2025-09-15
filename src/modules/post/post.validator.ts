// post.validator.ts
import { z } from "zod";
import { CreatePostSchema, validateMentions } from "../../utils/validators";

export const validateAll = async (data: { caption?: string; images?: Express.Multer.File[]; mentions?: string[] }) => ({
  images: validateImages({ images: data.images }),
  caption: validateCaption({ caption: data.caption }),
  mentions: await validateMentions(data.mentions || []), 
});

function validateImages(data: { images?: Express.Multer.File[] }): string | null {
  try {
    CreatePostSchema.pick({ images: true }).parse(data);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی تصاویر";
  }
}

function validateCaption(data: { caption?: string }): string | null {
  try {
    CreatePostSchema.pick({ caption: true }).parse(data);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی کپشن";
  }
}