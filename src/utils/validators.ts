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

export function extractHashtags(caption: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = caption.match(hashtagRegex) || [];
  return matches.map((m) => m.slice(1).toLowerCase());
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

export async function validateHashtags(hashtags: string[]): Promise<string | null> {
  if (hashtags.length === 0) return null;
  try {
    const existingHashtags = await prisma.hashtag.findMany({
      where: { name: { in: hashtags } },
      select: { name: true },
    });
    const existingHashtagNames = existingHashtags.map((h) => h.name);
    const newHashtags = hashtags.filter((h) => !existingHashtagNames.includes(h));
    if (newHashtags.length > 0) {
      await prisma.hashtag.createMany({
        data: newHashtags.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }
    return null;
  } catch {
    return "خطا در اعتبارسنجی هشتگ‌ها";
  }
}

export const validateGetHomepage = (data: { page: number; limit: number }): { page?: string; limit?: string } => {
  try {
    const schema = z.object({
      page: z.number().int().min(1, "صفحه باید عدد مثبت باشد"),
      limit: z.number().int().min(1).max(50, "حداکثر ۵۰ پست در هر صفحه"),
    });
    schema.parse(data);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.reduce(
        (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
        {}
      );
    }
    return { page: "خطا در اعتبارسنجی" };
  }
};

// schema baraye comment
export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "محتوای کامنت الزامی است")
    .max(500, "محتوای کامنت باید کمتر از ۵۰۰ کاراکتر باشد"),
});

export async function validateCreateComment(data: { content: string }): Promise<{ content?: string | null }> {
  try {
    CreateCommentSchema.parse(data);
    return { content: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { content: error.issues[0].message };
    }
    return { content: "خطا در اعتبارسنجی کامنت" };
  }
}

// schema baraye reply
export const CreateReplySchema = z.object({
  content: z
    .string()
    .min(1, "محتوای ریپلای الزامی است")
    .max(500, "محتوای ریپلای باید کمتر از ۵۰۰ کاراکتر باشد"),
});

export async function validateCreateReply(data: { content: string; commentId: string }): Promise<{ content?: string | null; commentId?: string | null }> {
  try {
    CreateReplySchema.parse({ content: data.content });
    z.string().uuid("شناسه کامنت نامعتبر است").parse(data.commentId);
    const comment = await prisma.comment.findUnique({ where: { id: data.commentId } });
    if (!comment) return { commentId: "کامنت یافت نشد" };
    return { content: null, commentId: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.reduce(
        (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
        {}
      );
    }
    return { commentId: "خطا در اعتبارسنجی ریپلای" };
  }
}

export async function validateCommentId(data: { commentId: string }): Promise<{ commentId?: string | null }> {
  try {
    z.string().uuid("شناسه کامنت نامعتبر است").parse(data.commentId);
    const comment = await prisma.comment.findUnique({ where: { id: data.commentId } });
    if (!comment) return { commentId: "کامنت یافت نشد" };
    return { commentId: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { commentId: error.issues[0].message };
    }
    return { commentId: "خطا در اعتبارسنجی شناسه کامنت" };
  }
}

// validator baraye GET /posts/:id/comments
export async function validateGetPostComments(data: { postId: string; page: number; limit: number }): Promise<{ postId?: string | null; page?: string | null; limit?: string | null }> {
  const schema = z.object({
    postId: z.string().uuid("شناسه پست نامعتبر است"),
    page: z.number().int().min(1, "صفحه باید حداقل ۱ باشد"),
    limit: z.number().int().min(1, "حد باید حداقل ۱ باشد").max(50, "حد حداکثر ۵۰ است"),
  });

  try {
    schema.parse(data);
    const post = await prisma.post.findUnique({ where: { id: data.postId } });
    if (!post) return { postId: "پست یافت نشد" };
    return { postId: null, page: null, limit: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.reduce(
        (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
        {}
      );
    }
    return { postId: "خطا در اعتبارسنجی" };
  }
}

export async function validateGetUserPosts(data: {
  username: string;
  page: number;
  limit: number;
}): Promise<{ username?: string | null; page?: string | null; limit?: string | null }> {
  const schema = z.object({
    username: z.string().min(1, "نام کاربری الزامی است"),
    page: z.number().int().min(1, "صفحه باید حداقل ۱ باشد"),
    limit: z.number().int().min(1, "حد باید حداقل ۱ باشد").max(100, "حد حداکثر ۱۰۰ است"),
  });

  try {
    schema.parse(data);
    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (!user) {
      return { username: `کاربر با نام کاربری ${data.username} یافت نشد` };
    }

    return { username: null, page: null, limit: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.reduce(
        (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
        {}
      );
    }
    return { username: "خطا در اعتبارسنجی" };
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