import { PrismaClient } from '@prisma/client';
import { ProfileUser } from '../../types/profile.types';
import { normEmail } from '../../utils/validators';
import bcrypt from 'bcryptjs';
import Minio from 'minio';

const prisma = new PrismaClient();

// MinIO configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = 'rahnama';

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
  
  const objectName = `avatars/${userId}-${Date.now()}-${file.originalname}`;
  
  try {
    await minioClient.putObject(BUCKET_NAME, objectName, file.buffer);
    const url = `${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${BUCKET_NAME}/${objectName}`;
    return url;
  } catch (error) {
    throw new Error(`Failed to upload avatar to MinIO: ${error}`);
  }
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
