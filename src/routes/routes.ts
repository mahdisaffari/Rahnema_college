import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { isNonEmptyString, isEmail, isPassword, normEmail } from "../utils/validators";
import { signAccessToken } from "../utils/jwt";
import { auth } from "../middleware/auth";
const prisma = new PrismaClient();
const router = Router();

// Register
router.post("/register", async (req, res) => {
                                      /** inja darim obj khali 
                                       * ro hame toye sharta pass midim ke
                                       * dorost ni bayad taghiresh bedim */ 
  const { username, email,password } = req.body ?? {};
  
  if (username.length < 5) 
    return res.status(400).json({ success: false, message: "username is required" });
  if (!isNonEmptyString(email) || !isEmail(email))
    return res.status(400).json({ success: false, message: "valid email is required" });
  if (!isNonEmptyString(password) || !isPassword(password))
    return res.status(400).json({ success: false, message: "Weak password" });

  try {                             /*tamam meghdar haro ham zaman migirim
                                      ba Promise.all ke alan user va email hastesh*/
    const [byUser, byEmail] = await Promise.all([
      prisma.user.findUnique({ 
        where: { username: username.trim() } }), // username babin hast
      prisma.user.findUnique({
         where: { email: normEmail(email) } }), // email bebein hast
    ]);
    if (byUser) return res.status(400).json({ success: false, message: "username exists" });
    if (byEmail) return res.status(400).json({ success: false, message: "email exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username: username.trim(), email: normEmail(email), passwordHash } });

    return res.status(201).json({ success: true, message: "User registered" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ success: false, message: "internal error" });
  }
});
+
// Login
router.post("/login", async (req, res) => {
                                  /**
                                   * inja ham hamon moshkel takrar shode
                                   * onj khali be sharta dare pass dade mishe 
                                   */
  const { login, password } = req.body ?? {}; // req.body ?? {} = agar req.body null/undefind bod ye obj khali bargardon

  if (!isNonEmptyString(login) || !isNonEmptyString(password))
    return res.status(400).json({ success: false, message: "login and password are required" });

  const isEmailLogin = login.includes("@"); //sharte bara email 

  const user = isEmailLogin
    ? await prisma.user.findUnique({ where: { email: normEmail(login) } })
    : await prisma.user.findUnique({ where: { username: login.trim() } });

  
  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

  // passwordo begirim ba hamon tabe dobare hash konim bebinim motabeghat dare ya na
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const accessToken = signAccessToken({ id: user.id, username: user.username, email: user.email });
  return res.json({ success: true, message: "Login successful", accessToken });
});

// Protected route
router.get("/me", auth, (req, res) => {
  return res.json({ success: true, user: (req as any).user });
});

export default router;