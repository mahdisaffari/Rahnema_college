import { z } from "zod";
import { CreatePostSchema, extractMentions, validateMentions } from "../../utils/validators";

export const validateAll = async (data: { caption?: string; images?: Express.Multer.File[] })
: Promise<{ images?: string | null; caption?: string | null; mentions?: string | null }> => {
  const errors = {
    images: validateImages({ images: data.images }),
    caption: validateCaption({ caption: data.caption }),
    mentions: await validateMentionsFromInput(data.caption || ""),
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

async function validateMentionsFromInput(caption: string): Promise<string | null> {
  const mentions = extractMentions(caption || "");
  return await validateMentions(mentions);
}