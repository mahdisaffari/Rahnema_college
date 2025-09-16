import { PrismaClient } from '@prisma/client';
import { ProfileResponse, UserResponse } from './user.types';
import { normEmail } from '../../utils/validators';
import bcrypt from 'bcryptjs';
import { cloudinary } from '../../config/cloudinary.config';

const prisma = new PrismaClient();

export async function getProfile(userId: string): Promise<ProfileResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      firstname: true,
      lastname: true,
      bio: true,
      avatar: true,
      postCount: true,
      followerCount: true,
      followingCount: true,
    },
  });

  if (!user) return null;

  return { ...user, isFollowedByMe: false }; // برای کاربر جاری، همیشه false
}

export async function getUserByUsername(username: string, currentUserId: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      firstname: true,
      lastname: true,
      bio: true,
      avatar: true,
      postCount: true,
      followerCount: true,
      followingCount: true,
      following: currentUserId ? {
        select: { followerId: true },
        where: { followerId: currentUserId },
      } : undefined,
      followers: currentUserId ? {
        select: { followingId: true },
        where: { followingId: currentUserId },
      } : undefined,
    },
  });

  if (!user) return null;

  return {
    ...user,
    isFollowedByMe: currentUserId && user.id !== currentUserId ? user.following.length > 0 : false,
    isFollowingMe: currentUserId && user.id !== currentUserId ? user.followers.length > 0 : false,
  };
}

// ... بقیه توابع (بدون تغییر)
export async function uploadAvatar(
  userId: string,
  file: Express.Multer.File
): Promise<string> {
  if (!file.buffer || file.buffer.length === 0) throw new Error('Empty file');
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { public_id: `${userId}-${Date.now()}`, folder: 'avatars' },
        (error, result) =>
          error ? reject(error) : resolve(result!.secure_url)
      )
      .end(file.buffer);
  });
}

function extractPublicIdFromUrl(url: string): string {
  const parts = url.split('/');
  const filename = parts[parts.length - 1].split('.')[0];
  return `avatars/${filename}`;
}

async function deleteAvatarFromCloudinary(publicId: string): Promise<void> {
  await new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(new Error('خطا در حذف اواتار از Cloudinary'));
      resolve(result);
    });
  });
}

export async function updateProfile(
  userId: string,
  data: {
    firstname?: string | null;
    lastname?: string | null;
    bio?: string | null;
    avatar?: Express.Multer.File | null;
    email?: string;
    password?: string;
  }
): Promise<ProfileResponse> {
  const updateData: Partial<ProfileResponse & { passwordHash?: string }> = {};

  if (data.firstname !== undefined) updateData.firstname = data.firstname;
  if (data.lastname !== undefined) updateData.lastname = data.lastname;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.email) {
    const normalizedEmail = normEmail(data.email);
    console.log("Checking email:", normalizedEmail, "for userId:", userId);
    const existingUser = await prisma.user.findFirst({ where: { email: normalizedEmail, NOT: { id: userId } } });
    console.log("Found user:", existingUser);
    if (existingUser) throw new Error('ایمیل تکراری است');
    updateData.email = normalizedEmail;
  }
  if (data.password)
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  if (data.avatar !== undefined) {
    if (data.avatar === null) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });
      if (currentUser?.avatar) {
        const publicId = extractPublicIdFromUrl(currentUser.avatar);
        await deleteAvatarFromCloudinary(publicId);
      }
      updateData.avatar = null;
    } else if (data.avatar) {
      updateData.avatar = await uploadAvatar(userId, data.avatar);
    }
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
      postCount: true,
      followerCount: true,
      followingCount: true,
    },
  });
}