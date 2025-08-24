import { LoginRequest, RegisterRequest } from "../../types/auth.types";
import { isEmail, isNonEmptyString, isPassword } from "../../utils/validators";

/**
 * baresi input haye user
 * ghable zakhire ya vorod
 */
export const validateRegister = ({ username, email, password }: RegisterRequest): string | null => {
  if (!username || username.length < 5) return "نام کاربری الزامی است و باید حداقل ۵ کاراکتر باشد";
  if (!isNonEmptyString(email) || !isEmail(email)) return "ایمیل معتبر الزامی است";
  if (!isNonEmptyString(password) || !isPassword(password)) return "رمز عبور ضعیف است";
  return null;
};

export const validateLogin = ({ identifier, password }: LoginRequest): string | null => {
  if (!isNonEmptyString(identifier)) return "شناسه الزامی است";
  if (!isNonEmptyString(password)) return "رمز عبور الزامی است";
  return null;
};
