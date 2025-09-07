import { PrismaClient } from '@prisma/client';
import { ProfileResponse, UserResponse } from './user.types';
import { normEmail } from '../../utils/validators';
import bcrypt from 'bcryptjs';
import { cloudinary } from '../../config/cloudinary.config';

const prisma = new PrismaClient();

// ye user migire profile ro mide bedone pass
export async function getProfile(userId: string): Promise<ProfileResponse | null> {
  return prisma.user.findUnique({ // faghad ye karbar ba in id bar migarde
    where: { id: userId },
    select: {// fild haro moshakhas mikonim
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

export async function getUserByUsername(username: string): Promise<UserResponse | null> {
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
    },
  });
  if (!user) return null;
  return user;
}


export async function uploadAvatar(
  userId: string, // user id ro migire 
  file: Express.Multer.File // ye file ax migire
): Promise<string> {
  if (!file.buffer || file.buffer.length === 0) throw new Error('Empty file');
  return new Promise((resolve, reject) => {
    cloudinary.uploader // ax ro upload mikonim
      .upload_stream(
        { public_id: `${userId}-${Date.now()}`, folder: 'avatars' },
        (error, result) =>
          error ? reject(error) : resolve(result!.secure_url)
      )
      .end(file.buffer);
  });
}

//public id ro az yrl avatar mikeshan biron
function extractPublicIdFromUrl(url: string): string {
  const parts = url.split('/');
  const filename = parts[parts.length - 1].split('.')[0];
  return `avatars/${filename}`;
}
//hazfe avatar az Cloudinary
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
    // ye obj misazm barye negah dari taghirat
  const updateData: Partial<ProfileResponse & { passwordHash?: string }> = {};

  if (data.firstname !== undefined) updateData.firstname = data.firstname;
  if (data.lastname !== undefined) updateData.lastname = data.lastname;
  if (data.bio !== undefined) updateData.bio = data.bio;
  //agar email sakht
  if (data.email) {
    const normalizedEmail = normEmail(data.email);
    if (// tekrai nabashe
      (await prisma.user.findUnique({ where: { email: normalizedEmail } }))?.id !==
      userId
    )
      throw new Error('ایمیل تکراری است');
    updateData.email = normalizedEmail;  // ok bod update kon
  }
  // agar pass jadid dad
  if (data.password)
    // hash mishe
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  if (data.avatar !== undefined) {
    if (data.avatar === null) {
     //hazfe avatar ghabli az Cloudinary
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
  // zakhire taghirat dar db
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