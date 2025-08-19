import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES } from "../config/env";
import { AuthUser } from "../types/auth.types";
import type { SignOptions } from "jsonwebtoken";

export function signAccessToken(user: AuthUser) {
  const payload = { sub: user.id, username: user.username, email: user.email };
  const options: SignOptions = { expiresIn: JWT_EXPIRES as SignOptions["expiresIn"] };
  return jwt.sign(payload, JWT_SECRET, options);
}