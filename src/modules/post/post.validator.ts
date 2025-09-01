import { z } from "zod";
import { CreatePostSchema, extractMentions, validateMentions } from "../../utils/validators";

export const validateImages = (data: { images?: Express.Multer.File[] }): string | null => {
  try {
   
    CreatePostSchema.pick({ images: true }).parse(data);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی تصاویر";
  }
};

export const validateCaption = (data: { caption?: string }): string | null => {
  try {
    CreatePostSchema.pick({ caption: true }).parse(data);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی کپشن";
  }
};

export async function validateMentionsFromInput(caption: string): Promise<string | null> {
  const mentions = extractMentions(caption || "");
  return await validateMentions(mentions);
}