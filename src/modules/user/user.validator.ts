import { z } from "zod";
import { ProfileUpdateSchema, RegisterSchema } from "../../utils/validators";

export const validateUsername = (username: string): string | null => {
  try {
    RegisterSchema.pick({ username: true }).parse({ username });
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی";
  }
};

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