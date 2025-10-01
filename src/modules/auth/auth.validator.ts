import { z } from "zod";
import { RegisterSchema, LoginSchema } from "../../utils/validators";
import { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from "./auth.types";

export const validateRegister = ({ username, email, password }: RegisterRequest): string | null => {
  try {
    RegisterSchema.parse({ username, email, password });
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی";
  }
};

export const validateLogin = ({ identifier, password, rememberMe }: LoginRequest): string | null => {
  try {
    LoginSchema.parse({ identifier, password });
    if (rememberMe !== undefined && typeof rememberMe !== 'boolean') {
      throw new Error("rememberMe باید بولین باشد");
    }
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی";
  }
};

export const validateForgotPassword = ({ identifier }: ForgotPasswordRequest): string | null => {
  try {
    z.object({
      identifier: z.string().min(1, "شناسه الزامی است").refine(val => val.includes('@') ? z.string().email().safeParse(val).success : true, "شناسه معتبر نیست"),
    }).parse({ identifier });
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی";
  }
};

export const validateResetPassword = ({ token, newPassword }: ResetPasswordRequest): string | null => {
  try {
    z.object({
      token: z.string().min(1, "توکن الزامی است"),
      newPassword: RegisterSchema.shape.password, 
    }).parse({ token, newPassword });
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0].message : "خطای اعتبارسنجی";
  }
};