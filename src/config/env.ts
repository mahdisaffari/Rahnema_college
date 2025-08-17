import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";
export const JWT_EXPIRES = process.env.JWT_EXPIRES ?? "15m";
export const PORT = Number(process.env.PORT || 3000);
