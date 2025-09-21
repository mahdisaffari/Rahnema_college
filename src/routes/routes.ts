import { Router } from "express";
import { login, register, logout, verifyEmailHandler, refreshHandler } from "../modules/auth/auth.controller";
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
import { createCommentHandler, createReplyHandler, likeCommentHandler, getPostCommentsHandler } from "../modules/post/comment/comment.controller";
import { validateCreateComment, validateCreateReply, validateCommentId, validateGetPostComments } from "../utils/validators";
import { getHomepageHandler } from "../modules/user/homepage/homepage.controller";
import { validateHomepageMiddleware } from "../modules/user/homepage/homepage.middleware";
import { SearchByPostController } from "../modules/user/search/by_post/searchByPost.controller";
import { validateBookmarkedPostsMiddleware } from "../modules/user/Bookmarked_Post/bookmarkedPost.meddleware";
import { getUserBookmarkedPostsHandler } from "../modules/user/Bookmarked_Post/bookmarkedPost.controller";
import { getUserMentionedPostsHandler } from "../modules/user/Mentioned_Post/mentionedPost.controller";
import { searchByUsernameController } from "../modules/user/search/by_username/searchByUsername.controller";

const router = Router();
const searchByPostController = new SearchByPostController();

// مسیرهای احراز هویت
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-email", verifyEmailHandler);
router.post("/refresh", refreshHandler);

// مسیرهای پروفایل
router.get("/profile", auth, getProfileHandler);
router.put("/profile", auth, upload.single("avatar"), validateProfileUpdateMiddleware, updateProfileHandler);
router.get("/profile/posts", auth, getPostProfileHandler);

// مسیرهای کاربر
router.get("/users/:username", auth, validateUsernameMiddleware, getUserHandler);

// مسیرهای پست
router.post("/posts", auth, upload.array("images", 5), validateAllMiddleware, createSetupPostHandler);
router.get("/posts/:id", auth, getPostHandler);
router.put("/posts/:id", auth, upload.array("images", 5), validateEditPostMiddleware, editPostHandler);
router.get("/users/:username/posts", auth, validateGetUserPostsMiddleware, getUserPostsHandler); 
router.post("/posts/:id/bookmark", auth, bookmarkPostHandler);
router.post("/posts/:id/like", auth, likePostHandler);
router.post("/posts/:id/comments", auth, validateCreateComment, createCommentHandler);
router.post("/posts/:id/comments/:commentId/reply", auth, validateCreateReply, createReplyHandler);
router.post("/posts/:id/comments/:commentId/like", auth, validateCommentId, likeCommentHandler);
router.get("/posts/:id/comments", auth, validateGetPostComments, getPostCommentsHandler);
//router.delete("/posts/:id/bookmark", auth, bookmarkPostHandler);
//router.delete("/posts/:id/like", auth, likePostHandler);
//router.get("/posts/:id/likes", auth, getPostLikesCountHandler);

// مسیرهای فالو/آنفالو
router.post("/users/:username/follow", auth, validateUsernameMiddleware, followUserHandler);
//router.delete("/users/:username/follow", auth, validateUsernameMiddleware, followUserHandler);

// مسیرهای فالوورها و فالویینگ‌ها
router.get("/users/followers", auth, getFollowersHandler);
router.get("/users/followings", auth, getFollowingsHandler);

// مسیر بوکمارک‌ها و منشن‌ها
router.get("/bookmarks", auth, validateBookmarkedPostsMiddleware, getUserBookmarkedPostsHandler);
router.get("/mentions", auth, validateGetUserPostsMiddleware, getUserMentionedPostsHandler);

// مسیر هوم‌پیج
router.get("/homepage", auth, validateHomepageMiddleware, getHomepageHandler);

// مسیر های سرچ
router.get("/search/users", auth, searchByUsernameController);
router.get("/search/posts", auth, searchByPostController.getPostsByHashtag.bind(searchByPostController));




export default router;