import { z } from "zod";
import { ProfileUpdateSchema } from "../../utils/validators";


export const validateProfileUpdate = (data: {
  firstname?: string;
  lastname?: string;
  bio?: string;
  avatar?: Express.Multer.File;
  email?: string;
  password?: string;
}): string | null => {
  try {
    ProfileUpdateSchema.parse(data);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی";
  }
};