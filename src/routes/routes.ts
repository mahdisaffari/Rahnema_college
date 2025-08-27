import { Router } from "express";
import { login, register, logout } from "../auth/controllers/auth.controller";
import { auth} from "../auth/middleware/auth";
import { getProfileHandler, updateProfileHandler } from "../profile/controller/profile.controller";
import { validateProfileUpdateMiddleware } from "../profile/middleware/profile.middleware";
import { upload } from "../config/multer.config";
import { getPostProfileHandler } from "../profile/post_profile/controller/getPostProfile.controller";
import { createSetupPostHandler } from "../api_setupPost/controller/setupPost.controller";
import { validateSetupPostMiddleware } from "../api_setupPost/middleware/setupPost.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", auth, getProfileHandler);
router.put("/profile", auth, upload.single("avatar"), validateProfileUpdateMiddleware, updateProfileHandler);
router.get("/profile/posts", auth, getPostProfileHandler);
router.post("/posts", auth, upload.array("images", 10), validateSetupPostMiddleware, createSetupPostHandler);

export default router;

//Client → Middleware → Controller → Service → Database → Controller → Client