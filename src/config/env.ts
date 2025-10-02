import "dotenv/config";
import { z } from "zod";
import type { SignOptions } from "jsonwebtoken";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET الزامی است"),
  JWT_ACCESS_EXPIRES: z.string().optional().default("1h"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET الزامی است"),
  JWT_REFRESH_EXPIRES_LONG: z.string().optional().default("30d"), 
  JWT_REFRESH_EXPIRES_SHORT: z.string().optional().default("4h"), 
  EMAIL_USER: z.string().min(1, "EMAIL_USER الزامی است"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS الزامی است"),  
  APP_URL: z.string().url("APP_URL باید URL معتبر باشد").optional().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL الزامی است"),
  SHADOW_DATABASE_URL: z.string().min(1, "SHADOW_DATABASE_URL الزامی است"),
  MINIO_ENDPOINT: z.string().min(1).optional(),
  MINIO_PORT: z.coerce.number().optional(),
  MINIO_USE_SSL: z.coerce.boolean().optional(),
  MINIO_ACCESS_KEY: z.string().min(1).optional(),
  MINIO_SECRET_KEY: z.string().min(1).optional(),
  MINIO_BUCKET_NAME: z.string().min(1).default("rahnama"),
  CLIENT_ID: z.string().optional(),
  CLIENT_SECRET: z.string().optional(),
  REFRESH_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);