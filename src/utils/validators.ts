import { z } from "zod";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const CreatePostSchema = z.object({
  caption: z
    .string()
    .max(300, "کپشن باید رشته معتبر با حداکثر ۳۰۰ کاراکتر باشد")
    .optional(),
  images: z
    .array(
      z.object({
        mimetype: z.string().refine((val) => val.startsWith("image/"), {
          message: "همه فایل‌ها باید تصویری باشند",
        }),
        size: z.number().max(5 * 1024 * 1024, "حجم هر تصویر باید کمتر از ۵ مگابایت باشد"),
      })
    )
    .max(5, "حداکثر ۵ تصویر مجاز است")
    .min(1, "ارسال حداقل یک تصویر الزامی است"),
});

export function extractMentions(caption: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = caption.match(mentionRegex) || [];
  return matches.map((m) => m.slice(1)); 
}

export async function validateMentions(usernames: string[]): Promise<string | null> {
  if (usernames.length === 0) return null; 
  try {
    const existingUsers = await prisma.user.findMany({
      where: { username: { in: usernames } },
      select: { username: true },
    });
    const existingUsernames = existingUsers.map((u) => u.username);
    const invalidMentions = usernames.filter((u) => !existingUsernames.includes(u));
    if (invalidMentions.length > 0) {
      return `چنین یوزری نداریم: ${invalidMentions.join(", ")}`;
    }
    return null;
  } catch {
    return "خطا در چک منشن‌ها";
  }
}

export const ProfileUpdateSchema = z.object({
  firstname: z
    .union([
      z.string()
        .max(50, "نام باید رشته غیرخالی باشد (حداکثر 50 کاراکتر)")
        .refine((val) => val.trim().length > 0, "نام باید رشته غیرخالی باشد"),
      z.null(),
    ])
    .optional(),
  lastname: z
    .union([
      z.string()
        .max(50, "نام خانوادگی باید رشته غیرخالی باشد (حداکثر 50 کاراکتر)")
        .refine((val) => val.trim().length > 0, "نام خانوادگی باید رشته غیرخالی باشد"),
      z.null(),
    ])
    .optional(),
  bio: z
    .union([
      z.string()
        .max(500, "بیوگرافی باید رشته غیرخالی باشد (حداکثر 500 کاراکتر)")
        .refine((val) => val.trim().length > 0, "بیوگرافی باید رشته غیرخالی باشد"),
      z.null(),
    ])
    .optional(),
  email: z
    .string()
    .email("ایمیل معتبر نیست")
    .refine((val) => val.trim().length > 0, "ایمیل معتبر نیست")
    .optional(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
      "پسورد ضعیف است"
    )
    .optional(),
  avatar: z
    .union([
      z.object({
        mimetype: z.string().refine((val) => val.startsWith("image/"), {
          message: "فقط فایل‌های تصویری مجاز هستند",
        }),
        size: z.number().max(5 * 1024 * 1024, "سایز فایل باید کمتر از ۵ مگابایت باشد"),
      }),
      z.null(),
    ])
    .optional(),
});

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(5, "نام کاربری الزامی است و باید حداقل ۵ کاراکتر باشد")
    .refine((val) => val.trim().length > 0, "نام کاربری الزامی است و باید حداقل ۵ کاراکتر باشد"),
  email: z
    .string()
    .email("ایمیل معتبر الزامی است")
    .refine((val) => val.trim().length > 0, "ایمیل معتبر الزامی است"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
      "رمز عبور ضعیف است"
    ),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1, "شناسه الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export const normEmail = (email: string) => email.trim().toLowerCase();