import { Router } from "express";
import { login, register, logout } from "../auth/controllers/auth.controller";
import { auth} from "../auth/middleware/auth";
import { getProfileHandler, updateProfileHandler } from "../profile/controller/profile.controller";
import { validateProfileUpdateMiddleware } from "../profile/middleware/profile.middleware";
import { upload } from "../config/multer.config";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", auth, getProfileHandler);
router.put("/profile", auth, upload.single("avatar"), validateProfileUpdateMiddleware, updateProfileHandler);

export default router;