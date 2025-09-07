import { z } from "zod";
import { CreatePostSchema, extractHashtags, validateHashtags, validateMentions } from "../../utils/validators";

export const validateAll = async (data: { caption?: string; images?: Express.Multer.File[] }): Promise<{
  images?: string | null;
  caption?: string | null;
  mentions?: string | null;
  hashtags?: string | null;
}> => {
  const errors = {
    images: validateImages({ images: data.images }),
    caption: validateCaption({ caption: data.caption }),
    mentions: await validateMentions(extractHashtags(data.caption || "")),
    hashtags: await validateHashtags(extractHashtags(data.caption || "")),
  };
  return errors;
};

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