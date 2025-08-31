import { PrismaClient } from '@prisma/client';
import { PostResponseData } from './postProfile.types';

const prisma = new PrismaClient();

export async function getUserPosts(userId: string): Promise<PostResponseData[]> {
  return prisma.post.findMany({
    where: { userId },
    select: {
      id: true,
      caption: true,
      images: { select: { url: true } },
    },
  });
}