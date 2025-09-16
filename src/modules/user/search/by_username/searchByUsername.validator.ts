import { z } from "zod";

export const searchByUsernameSchema = z.object({
  username: z.string().min(3, "نام کاربری حداقل باید ۳ کاراکتر باشد"),
  page: z.string().optional().transform(val => parseInt(val ?? "1")).refine(val => val > 0, "صفحه باید بزرگ‌تر از ۰ باشد"),
  limit: z.string().optional().transform(val => parseInt(val ?? "10")).refine(val => val > 0 && val <= 50, "لیمیت باید بین ۱ تا ۵۰ باشد"),
});

export type SearchByUsernameInput = z.infer<typeof searchByUsernameSchema>;