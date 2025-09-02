import { Router } from "express";
import { login, register, logout } from "../modules/auth/auth.controller";
import { auth } from "../modules/auth/auth.middleware";
import { upload } from "../config/multer.config";
import { getProfileHandler, updateProfileHandler, getUserHandler } from "../modules/user/user.controller";
import { validateCaptionMiddleware, validateImagesMiddleware, validateMentionsMiddleware,  } from "../modules/post/post.middleware";
import { createSetupPostHandler, validateCaptionHandler, validateImagesHandler, validateMentionsHandler, getPostHandler } from "../modules/post/post.controller";
import { validateProfileUpdateMiddleware, validateUsernameMiddleware } from "../modules/user/useer.middleware";
import { getPostProfileHandler, getPostsByUsernameHandler } from "../modules/user/postProfile/postProfile.controller";
import { bookmarkPostHandler } from "../modules/post/bookmark/bookmark.controller";
import { followUserHandler } from "../modules/user/follow_unfollow/follow.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", auth, getProfileHandler);
router.put("/profile", auth, upload.single("avatar"), validateProfileUpdateMiddleware, updateProfileHandler);
router.get("/profile/posts", auth, getPostProfileHandler);
router.get("/users/:username", validateUsernameMiddleware, getUserHandler);
router.get("/users/:username/posts", validateUsernameMiddleware, getPostsByUsernameHandler);

router.post("/posts/validate-images", auth, upload.array("images", 5), validateImagesMiddleware, validateImagesHandler);
router.post("/posts/validate-caption", auth, validateCaptionMiddleware, validateCaptionHandler);
router.post("/posts/validate-mentions", auth, validateMentionsMiddleware, validateMentionsHandler);
router.post("/posts", auth, upload.array("images", 5), validateImagesMiddleware, validateCaptionMiddleware, validateMentionsMiddleware, createSetupPostHandler);
router.get("/posts/:id", auth, validateCaptionMiddleware, getPostHandler);
router.post("/posts/:id/bookmark", auth, bookmarkPostHandler);
router.delete("/posts/:id/bookmark", auth, bookmarkPostHandler);

router.post("/users/:username/follow", auth, validateUsernameMiddleware, followUserHandler);
router.delete("/users/:username/follow", auth, validateUsernameMiddleware, followUserHandler);

export default router;