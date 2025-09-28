import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { normEmail, RegisterSchema, LoginSchema } from "../../utils/validators";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../utils/email";
import { v4 as randomUUID } from 'uuid';
import { env } from "../../config/env";
import jwt from "jsonwebtoken";
import { AuthUser } from "./auth.types";

const prisma = new PrismaClient();

export const register = async (username: string, email: string, password: string) => {
  console.log('Register attempt:', { username, email });
  RegisterSchema.parse({ username, email, password });
  console.log('Validation passed');

  const [byUser, byEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username: username.trim() } }),
    prisma.user.findUnique({ where: { email: normEmail(email) } }),
  ]);
  if (byUser) throw new Error("نام کاربری وجود دارد");
  if (byEmail) throw new Error("ایمیل وجود دارد");
  console.log('No duplicate user/email');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username: username.trim(), email: normEmail(email), passwordHash, isVerified: false },
  });
  console.log('User created:', user.id);

  const token = randomUUID();
  await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
  await prisma.verificationToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });
  console.log('Verification token created:', token);

  sendVerificationEmail(normEmail(email), token)
    .then(() => console.log('Email sent to:', email))
    .catch(emailError => console.error('Failed to send verification email:', emailError));
};

export const login = async (identifier: string, password: string, rememberMe: boolean = false) => {
  LoginSchema.parse({ identifier, password });
  const user = identifier.includes("@")
    ? await prisma.user.findUnique({ where: { email: normEmail(identifier) } })
    : await prisma.user.findUnique({ where: { username: identifier.trim() } });
  if (!user) throw new Error("اعتبارنامه‌های نامعتبر");
  //if (!user.isVerified) throw new Error("ایمیل تأیید نشده");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("اعتبارنامه‌های نامعتبر");
  const access = signAccessToken({ id: user.id, username: user.username, email: user.email } as AuthUser);
  const refresh = signRefreshToken({ id: user.id, username: user.username, email: user.email } as AuthUser, rememberMe);
  return { access, refresh, username: user.username };
};

export const verifyEmail = async (token: string) => {
  const verification = await prisma.verificationToken.findUnique({ where: { token } });
  if (!verification || verification.expiresAt < new Date()) throw new Error('توکن نامعتبر یا منقضی');
  await prisma.user.update({ where: { id: verification.userId }, data: { isVerified: true } });
  await prisma.verificationToken.delete({ where: { token } });
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string; username: string; email: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) throw new Error("کاربر یافت نشد");
    return signAccessToken({ id: user.id, username: user.username, email: user.email } as AuthUser);
  } catch {
    throw new Error("رفرش توکن نامعتبر");
  }
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email: normEmail(email) } });
  if (!user) throw new Error("کاربر یافت نشد");
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });
  await sendPasswordResetEmail(normEmail(email), token);
};

export const resetPassword = async (token: string, newPassword: string) => {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new Error("توکن نامعتبر یا منقضی شده");
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.delete({ where: { token } });
};