import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function toggleFollow(followerId: string, followingUsername: string): Promise<boolean> {
  const followingUser = await prisma.user.findUnique({
    where: { username: followingUsername },
    select: { id: true },
  });
  if (!followingUser) throw new Error('کاربر یافت نشد');
  const followingId = followingUser.id;
  if (followerId === followingId) throw new Error('نمی‌توانید خودتان را فالو کنید');

  const existingFollow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    await prisma.user.updateMany({
      where: { id: { in: [followerId, followingId] } },
      data: { followingCount: { decrement: 1 } },
    });
    await prisma.user.update({
      where: { id: followingId },
      data: { followerCount: { decrement: 1 } },
    });
    return false; // unfollowed
  } else {
    await prisma.follow.create({
      data: { followerId, followingId },
    });
    await prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } },
    });
    await prisma.user.update({
      where: { id: followingId },
      data: { followerCount: { increment: 1 } },
    });
    return true; // followed
  }
}