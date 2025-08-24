import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { normEmail } from "../../utils/validators";
import { signAccessToken } from "../../utils/jwt";
import { AuthUser } from "../../types/auth.types";

/**
 * manteghe asli ertebat db va logi/register
 */

// ye nemone az prisma sakhte mishe barye query zadan be db
const prisma = new PrismaClient();

export const register = async (username: string, email: string, password: string) => {
  const [byUser, byEmail] = await Promise.all([
    // user ba in username/email vojod dare?
    prisma.user.findUnique({ where: { username: username.trim() } }),
    prisma.user.findUnique({ where: { email: normEmail(email) } }),
  ]);

  //agar yekishon vojod dasht khat bede
  if (byUser) throw new Error("Username exists");
  if (byEmail) throw new Error("Email exists");

  // agar nadasht pass ro begir hash kon
  const passwordHash = await bcrypt.hash(password, 10);

  //dar nahayat user jadid dar db zakhire mishe
  await prisma.user.create({
    data: { username: username.trim(), email: normEmail(email), passwordHash },
  });
};

export const login = async (identifier: string, password: string) => {
  // inja dorst ni momkene username ham @ dashte bashe
  const isEmailLogin = identifier.includes("@");

  const user = isEmailLogin
    ? await prisma.user.findUnique({ where: { email: normEmail(identifier) } })
    : await prisma.user.findUnique({ where: { username: identifier.trim() } });

  if (!user) throw new Error("اعتبارنامه‌های نامعتبر");

  // ramz vared shoe ba hash zkhire shode moghayese mishe
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("اعتبارنامه‌های نامعتبر");
                              // Inja be ye dard na alaj khordam ye rahkar movaghate
  return signAccessToken({ id: user.id.toString(), username: user.username, email: user.email } as AuthUser);
};