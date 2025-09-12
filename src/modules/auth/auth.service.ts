import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { normEmail, RegisterSchema, LoginSchema } from "../../utils/validators";
import { signAccessToken } from "../../utils/jwt";
import { AuthUser } from "./auth.types";

const prisma = new PrismaClient();

export const register = async (username: string, email: string, password: string) => {
  RegisterSchema.parse({ username, email, password });

  const [byUser, byEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username: username.trim() } }),
    prisma.user.findUnique({ where: { email: normEmail(email) } }),
  ]);

  if (byUser) throw new Error("نام کاربری وجود دارد");
  if (byEmail) throw new Error("ایمیل وجود دارد");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username: username.trim(), email: normEmail(email), passwordHash },
  });
};

export const login = async (identifier: string, password: string) => {
  LoginSchema.parse({ identifier, password });

  const isEmailLogin = identifier.includes("@");
  const user = isEmailLogin
    ? await prisma.user.findUnique({ where: { email: normEmail(identifier) } })
    : await prisma.user.findUnique({ where: { username: identifier.trim() } });

  if (!user) throw new Error("اعتبارنامه‌های نامعتبر");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("اعتبارنامه‌های نامعتبر");

  const token = signAccessToken({ id: user.id, username: user.username, email: user.email } as AuthUser);
  return { token, username: user.username }; 
};