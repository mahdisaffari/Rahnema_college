import { LoginRequest, RegisterRequest } from "../../types/auth.types";
import { isEmail, isNonEmptyString, isPassword } from "../../utils/validators";

/**
 * baresi input haye user
 * ghable zakhire ya vorod
 */
export const validateRegister = ({ username, email, password }: RegisterRequest): string | null => {
  if (!username || username.length < 5) return "Username is required and must be at least 5 characters";
  if (!isNonEmptyString(email) || !isEmail(email)) return "Valid email is required";
  if (!isNonEmptyString(password) || !isPassword(password)) return "Weak password";
  return null;
};

export const validateLogin = ({ identifier, password }: LoginRequest): string | null => {
  if (!isNonEmptyString(identifier) || !isNonEmptyString(password))
    return "Identifier and password are required";
  return null;
};