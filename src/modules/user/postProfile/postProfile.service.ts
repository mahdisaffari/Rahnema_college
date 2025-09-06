import { PrismaClient } from '@prisma/client';
import { PostResponseData } from './postProfile.types';

const prisma = new PrismaClient();

// tamam post haey yek user ro moshakhas mikonim
export async function getUserPosts(userId: string): Promise<PostResponseData[]> {
  return prisma.post.findMany({ // hame post haye marbot be userId ro bede
    where: { userId },
    select: {
      id: true,
      caption: true,
      images: { select: { url: true } },
      likeCount: true,
      bookmarkCount: true,
    },
  });
}

// hamone vali ba username kar mikone vaghti peyda kard balayy ro seda mikone
export async function getPostsByUsername(username: string): Promise<PostResponseData[]> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!user) throw new Error('کاربر یافت نشد');
  return getUserPosts(user.id);
}