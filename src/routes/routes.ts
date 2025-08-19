import { Router } from "express";
import { login, me, register } from "../auth/controllers/auth.controller";
import { auth } from "../auth/middleware/auth";


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);

export default router;
