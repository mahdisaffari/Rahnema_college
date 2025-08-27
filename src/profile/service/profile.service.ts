import { PrismaClient } from '@prisma/client';
import { ProfileUser } from '../../types/profile.types';
import { normEmail } from '../../utils/validators';
import bcrypt from 'bcryptjs';
import { cloudinary } from '../../config/cloudinary.config';

const prisma = new PrismaClient();

// ye user migire profile ro mide bedone pass
export async function getProfile(userId: string): Promise<ProfileUser | null> {
  return prisma.user.findUnique({ // faghad ye karbar ba in id bar migarde
    where: { id: userId },
    select: { // fild haro moshakhas mikonim
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


export async function updateProfile(
  userId: string,
  data: {
    firstname?: string;
    lastname?: string;
    bio?: string;
    avatar?: Express.Multer.File;
    email?: string;
    password?: string;
  }
): Promise<ProfileUser> {
  // ye obj misazm barye negah dari taghirat
  // inja ye taghir dare ke any nabashe
  const updateData: any = {
    firstname: data.firstname,
    lastname: data.lastname,
    bio: data.bio,
  };

  //agar email sakht 
  if (data.email) {
    const normalizedEmail = normEmail(data.email);
    if ( // tekrai nabashe
      (await prisma.user.findUnique({ where: { email: normalizedEmail } }))?.id !==
      userId
    )
      throw new Error('ایمیل تکراری است');
    updateData.email = normalizedEmail; // ok bod update kon
  }
   // agar pass jadid dad
  if (data.password)
    // hash mishe
    updateData.passwordHash = await bcrypt.hash(data.password, 10);

  // ax upload shod...
  if (data.avatar)
    updateData.avatar = await uploadAvatar(userId, data.avatar);

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
    },
  });
}