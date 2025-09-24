import { z } from "zod";
import { CreatePostSchema, extractHashtags, validateHashtags, validateMentions } from "../../utils/validators";

export const validateAll = async (data: { caption?: string; images?: Express.Multer.File[]; mentions?: string[]; isCloseFriendsOnly?: boolean }): Promise<{
  images?: string | null;
  caption?: string | null;
  mentions?: string | null;
  hashtags?: string | null;
  isCloseFriendsOnly?: string | null;
}> => {
  const errors = {
    images: validateImages({ images: data.images }),
    caption: validateCaption({ caption: data.caption }),
    mentions: data.mentions && data.mentions.length > 0 ? await validateMentions(data.mentions) : null, 
    hashtags: await validateHashtags(extractHashtags(data.caption || "")), 
    isCloseFriendsOnly: validateIsCloseFriendsOnly({ isCloseFriendsOnly: data.isCloseFriendsOnly }),
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

function validateIsCloseFriendsOnly(data: { isCloseFriendsOnly?: boolean }): string | null {
  try {
    CreatePostSchema.pick({ isCloseFriendsOnly: true }).parse(data);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی isCloseFriendsOnly";
  }
}