import { PrismaClient } from "@prisma/client";
import { ProfileUser } from "../../types/profile.types";
import { normEmail } from "../../utils/validators";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function getProfile(userId: string): Promise<ProfileUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      firstname: true,
      lastname: true,
      bio: true,
      avatar: true,
    },
  });
}

export async function updateProfile(userId: string, data: {
  firstname?: string;
  lastname?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  password?: string;
}): Promise<ProfileUser> {
  const updateData: any = {
    firstname: data.firstname,
    lastname: data.lastname,
    bio: data.bio,
    avatar: data.avatar,
  };
  
  if (data.email) {
    const normalizedEmail = normEmail(data.email);
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing && existing.id !== userId) throw new Error("ایمیل تکراری است");
    updateData.email = normalizedEmail;
  }

  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      firstname: true,
      lastname: true,
      bio: true,
      avatar: true,
    },
  });
}