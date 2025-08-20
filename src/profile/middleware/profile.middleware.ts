import { Request, Response, NextFunction } from "express";
import { validateProfileUpdate } from "../validators/profile.validator";
import { AuthRequest } from "../../auth/middleware/auth";
import { ProfileUpdateRequest, ProfileResponse } from "../../types/profile.types";

export function validateProfileUpdateMiddleware(req: AuthRequest, res: Response<ProfileResponse>, next: NextFunction) {
  const { firstname, lastname, bio, avatar }: ProfileUpdateRequest = req.body;
  const error = validateProfileUpdate({ firstname, lastname, bio, avatar });
  if (error) return res.status(400).json({ success: false, message: error });
  next();
}