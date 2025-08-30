import { Router } from "express";
import { login, register, logout } from "../modules/auth/auth.controller";
import { auth} from "../modules/auth/auth.middleware";
import { upload } from "../config/multer.config";
import { validateProfileUpdateMiddleware } from "../modules/profile/profile.middleware";
import { getProfileHandler, updateProfileHandler } from "../modules/profile/profile.controller";
import { getPostProfileHandler } from "../modules/profile/postProfile/postProfile.controller";
import { validateSetupPostMiddleware } from "../modules/post/post.middleware";
import { createSetupPostHandler } from "../modules/post/post.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", auth, getProfileHandler);
router.put("/profile", auth, upload.single("avatar"), validateProfileUpdateMiddleware, updateProfileHandler);
router.get("/profile/posts", auth, getPostProfileHandler);
router.post("/posts", auth, upload.array("images", 5), validateSetupPostMiddleware, createSetupPostHandler);

export default router;
