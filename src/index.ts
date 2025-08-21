import express from "express";
import { env } from "./config/env";
import authRoutes from "./routes/routes";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true,
}));

app.use(cookieParser());

app.use("/", authRoutes);

app.listen(env.PORT, () => console.log(`Server started at http://localhost:${env.PORT}`));