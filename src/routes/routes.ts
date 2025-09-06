import { Router } from "express";
import { login, register, logout } from "../modules/auth/auth.controller";
import { auth } from "../modules/auth/auth.middleware";
import { upload } from "../config/multer.config";
import { getProfileHandler, updateProfileHandler, getUserHandler } from "../modules/user/user.controller";
import { validateProfileUpdateMiddleware, validateUsernameMiddleware } from "../modules/user/user.middleware";
import { validateAllMiddleware, validateGetUserPostsMiddleware } from "../modules/post/post.middleware";
import { createSetupPostHandler, getPostHandler, getUserPostsHandler } from "../modules/post/post.controller";
import { editPostHandler } from "../modules/post/editPost/editPost.controller"; 
import { bookmarkPostHandler } from "../modules/post/bookmark/bookmark.controller";
import { followUserHandler } from "../modules/user/follow_unfollow/follow.controller";
import { getPostProfileHandler } from "../modules/user/postProfile/postProfile.controller";
import { validateEditPostMiddleware } from "../modules/post/editPost/editPost.middleware";
import { getPostLikesCountHandler, likePostHandler } from "../modules/post/like_unlike/like.controller";
import { getFollowersHandler, getFollowingsHandler } from "../modules/user/followers_followings/followersFollowings.controller";

const router = Router();

// مسیرهای احراز هویت
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// مسیرهای پروفایل
router.get("/profile", auth, getProfileHandler);
router.put("/profile", auth, upload.single("avatar"), validateProfileUpdateMiddleware, updateProfileHandler);
router.get("/profile/posts", auth, getPostProfileHandler);

// مسیرهای کاربر
router.get("/users/:username", validateUsernameMiddleware, getUserHandler);

// مسیرهای پست
router.post("/posts", auth, upload.array("images", 5), validateAllMiddleware, createSetupPostHandler);
router.get("/posts/:id", auth, getPostHandler);
// ادیت پست
router.put("/posts/:id", auth, upload.array("images", 5), validateEditPostMiddleware, editPostHandler); 
router.get("/users/:username/posts", auth, validateGetUserPostsMiddleware, getUserPostsHandler); 
router.post("/posts/:id/bookmark", auth, bookmarkPostHandler);
router.post("/posts/:id/like", auth, likePostHandler);
//router.delete("/posts/:id/bookmark", auth, bookmarkPostHandler);
//router.delete("/posts/:id/like", auth, likePostHandler);
//router.get("/posts/:id/likes", auth, getPostLikesCountHandler);

// مسیرهای فالو/آنفالو
router.post("/users/:username/follow", auth, validateUsernameMiddleware, followUserHandler);
router.delete("/users/:username/follow", auth, validateUsernameMiddleware, followUserHandler);

// مسیرهای فالوورها و فالویینگ‌ها
router.get("/users/followers", auth, getFollowersHandler);
router.get("/users/followings", auth, getFollowingsHandler);

export default router;