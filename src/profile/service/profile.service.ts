import { PrismaClient } from '@prisma/client';
import { ProfileUser } from '../../types/profile.types';
import { normEmail } from '../../utils/validators';
import bcrypt from 'bcryptjs';
import { cloudinary } from '../../config/cloudinary.config';

const prisma = new PrismaClient();

export async function getProfile(userId: string): Promise<ProfileUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, firstname: true, lastname: true, bio: true, avatar: true },
  });
}

export async function uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
  if (!file.buffer || file.buffer.length === 0) throw new Error('Empty file');
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { public_id: `${userId}-${Date.now()}`, folder: 'avatars' },
      (error, result) => (error ? reject(error) : resolve(result!.secure_url))
    ).end(file.buffer);
  });
}

export async function updateProfile(userId: string, data: { firstname?: string; lastname?: string; bio?: string; avatar?: Express.Multer.File; email?: string; password?: string }): Promise<ProfileUser> {
  const updateData: any = { firstname: data.firstname, lastname: data.lastname, bio: data.bio };
  if (data.email) { const normalizedEmail = normEmail(data.email); if ((await prisma.user.findUnique({ where: { email: normalizedEmail } }))?.id !== userId) throw new Error('ایمیل تکراری است'); updateData.email = normalizedEmail; }
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);
  if (data.avatar) updateData.avatar = await uploadAvatar(userId, data.avatar);
  return prisma.user.update({ where: { id: userId }, data: updateData, select: { id: true, username: true, email: true, firstname: true, lastname: true, bio: true, avatar: true } });
}