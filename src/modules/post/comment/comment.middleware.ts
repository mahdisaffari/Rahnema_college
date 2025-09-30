import { Request, Response, NextFunction } from "express";
import {
  validateGetPostComments,
  validateGetReplies,
  validateCreateComment,
  validateCreateReply,
  validateCommentId,
} from "../../../utils/validators";

export const validateGetPostCommentsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const data = { postId: req.params.id, page, limit };

  try {
    const errors = await validateGetPostComments(data);
    if (Object.values(errors).some((err) => err !== null)) {
      return res.status(400).json({ success: false, errors });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "خطا در اعتبارسنجی" });
  }
};

export const validateGetRepliesMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const data = {
    postId: req.params.id,
    commentId: req.params.commentId,
    page,
    limit,
  };

  try {
    const errors = await validateGetReplies(data);
    if (Object.values(errors).some((err) => err !== null)) {
      return res.status(400).json({ success: false, errors });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "خطا در اعتبارسنجی" });
  }
};

export const validateCreateCommentMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { content: req.body.content };

  try {
    const errors = await validateCreateComment(data);
    if (Object.values(errors).some((err) => err !== null)) {
      return res.status(400).json({ success: false, errors });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "خطا در اعتبارسنجی" });
  }
};

export const validateCreateReplyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = {
    content: req.body.content,
    commentId: req.params.commentId,
    postId: req.params.id,
  };

  try {
    const errors = await validateCreateReply(data);
    if (Object.values(errors).some((err) => err !== null)) {
      return res.status(400).json({ success: false, errors });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "خطا در اعتبارسنجی" });
  }
};

export const validateCommentIdMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { commentId: req.params.commentId };

  try {
    const errors = await validateCommentId(data);
    if (Object.values(errors).some((err) => err !== null)) {
      return res.status(400).json({ success: false, errors });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "خطا در اعتبارسنجی" });
  }
};