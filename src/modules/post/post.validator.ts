import { z } from "zod";
import { CreatePostSchema } from "../../utils/validators";


export const validateCreatePost = (data: { caption?: string; images?: Express.Multer.File[] }): string | null => {
  try {
    CreatePostSchema.parse(data);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی";
  }
};
