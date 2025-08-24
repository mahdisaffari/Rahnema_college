import express from "express";
import { env } from "./config/env";
import authRoutes from "./routes/routes";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cors({
  origin: ["http://127.0.0.1:5173", "http://localhost:5173"], // frontend dev URLs
  credentials: true,
}));

app.use(cookieParser());

app.use("/", authRoutes);

app.listen(env.PORT, "0.0.0.0", () =>
  console.log(`Server started at http://0.0.0.0:${env.PORT}`)
);