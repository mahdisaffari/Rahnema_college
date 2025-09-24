import { PrismaClient } from '@prisma/client';
import { ProfileResponse, UserResponse, UserUpdateRequest } from './user.types';
import { normEmail } from '../../utils/validators';
import bcrypt from 'bcryptjs';
import { minioClient, bucketName } from '../../config/minio.config';
import { Readable } from 'stream';
import { env } from '../../config/env';
import { isBlocked } from '../../utils/blockUtils';

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

  return { ...user, isFollowedByMe: false };
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
      isPrivate: true,
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

  if (currentUserId && await isBlocked(currentUserId, user.id)) {
    return {
      id: user.id,
      username: user.username,
      firstname: null,
      lastname: null,
      bio: null,
      avatar: null,
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
      isPrivate: user.isPrivate,
      isFollowedByMe: false,
      isFollowingMe: false,
    };
  }

  if (user.isPrivate && currentUserId && user.id !== currentUserId) {
    const isFollower = await prisma.follow.findFirst({
      where: { followingId: user.id, followerId: currentUserId },
    });
    if (!isFollower) {
      user.postCount = 0;
    }
  }

  return {
    ...user,
    isFollowedByMe: currentUserId && user.id !== currentUserId ? user.following.length > 0 : false,
    isFollowingMe: currentUserId && user.id !== currentUserId ? user.followers.length > 0 : false,
  };
}

async function uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
  const objectName = `avatars/${userId}-${Date.now()}-${file.originalname}`;
  const stream = Readable.from(file.buffer);
  await minioClient.putObject(bucketName, objectName, stream, file.size, {
    'Content-Type': file.mimetype,
  });
  return `${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${bucketName}/${objectName}`;
}

async function deleteAvatarFromMinIO(objectName: string): Promise<void> {
  await minioClient.removeObject(bucketName, objectName);
}

export async function updateProfile(
  userId: string,
  data: UserUpdateRequest
): Promise<ProfileResponse> {
  const updateData: Partial<ProfileResponse & { passwordHash?: string }> = {};

  if (data.firstname !== undefined) updateData.firstname = data.firstname;
  if (data.lastname !== undefined) updateData.lastname = data.lastname;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.email) {
    const normalizedEmail = normEmail(data.email);
    const existingUser = await prisma.user.findFirst({ where: { email: normalizedEmail, NOT: { id: userId } } });
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
        const objectName = extractObjectNameFromUrl(currentUser.avatar);
        await deleteAvatarFromMinIO(objectName);
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

export async function togglePrivateProfile(userId: string, isPrivate: boolean): Promise<{ isPrivate: boolean }> {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isPrivate },
    select: { isPrivate: true },
  });
  return updatedUser;
}

function extractObjectNameFromUrl(url: string): string {
  const parts = url.split('/');
  return parts.slice(-2).join('/'); // e.g., "avatars/userId-timestamp.jpg"
}