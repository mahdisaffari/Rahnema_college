
import { z } from "zod";
import { RegisterSchema, LoginSchema } from "../../utils/validators";
import { LoginRequest, RegisterRequest } from "./auth.types";

export const validateRegister = ({ username, email, password }: RegisterRequest): string | null => {
  try {
    const a = RegisterSchema.parse({ username, email, password });
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی";
  }
};

export const validateLogin = ({ identifier, password }: LoginRequest): string | null => {
  try {
    LoginSchema.parse({ identifier, password });
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی";
  }
};