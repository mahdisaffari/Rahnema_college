import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { validateLogin, validateRegister } from "../validators/auth.validator";
import { LoginRequest, RegisterRequest, RegisterResponse, LoginResponse } from "../../types/auth.types";


/**
 * inja ertebat ba user va modiriat res/req 
 */

// entezar darim vorodi az noe RegisterRequest
export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response<RegisterResponse>) => {
  const error = validateRegister(req.body); 
  if (error) return res.status(400).json({ success: false, message: error });

  try { // vorodi valid bod user to db save mishe be kar bar migim
    await authService.register(req.body.username, req.body.email, req.body.password);
    return res.status(201).json({ success: true, message: "کاربر ثبت نام شده" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ success: false, message: e.message || "خطای داخلی" });
  }
};

// entezar darim vorodi az noe LoginRequest
export const login = async (req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) => {
  const error = validateLogin(req.body); 
  if (error) return res.status(400).json({ success: false, message: error });

  try { // vorodi valid bod token dade mishe
    const token = await authService.login(req.body.identifier, req.body.password);
    return res.json({ success: true, message: "ورود با موفقیت انجام شد", token });
  } catch (e: any) {
    return res.status(401).json({ success: false, message: e.message || "اعتبارنامه‌های نامعتبر" });
  }
};





// // baraye gereftan data user
// export const me = async (req: Request, res: Response) => {
//   return res.json({ success: true, user: (req as any).user });
// };