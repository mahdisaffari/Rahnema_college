import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function parseExpires(value: string): SignOptions["expiresIn"] {
  return value as SignOptions["expiresIn"];
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  JWT_ACCESS_SECRET: req("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES: parseExpires(process.env.JWT_ACCESS_EXPIRES ?? "15m"),
};