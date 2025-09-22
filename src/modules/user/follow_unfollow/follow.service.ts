import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function sendFollowRequest(followerId: string, targetUsername: string): Promise<{ requestSent: boolean; status?: string }> {
  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername },
    select: { id: true, isPrivate: true },
  });
  if (!targetUser) throw new Error('کاربر یافت نشد');
  const targetId = targetUser.id;
  if (followerId === targetId) throw new Error('نمی‌توانید خودتان را فالو کنید');

  const isPrivate = targetUser.isPrivate;
  const existingFollow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: targetId } },
  });
  if (existingFollow) {
    await prisma.follow.delete({ where: { followerId_followingId: { followerId, followingId: targetId } } });
    await prisma.user.update({ where: { id: followerId }, data: { followingCount: { decrement: 1 } } });
    await prisma.user.update({ where: { id: targetId }, data: { followerCount: { decrement: 1 } } });
    return { requestSent: false, status: 'unfollowed' };
  }

  if (!isPrivate) {
    await prisma.follow.create({ data: { followerId, followingId: targetId } });
    await prisma.user.update({ where: { id: followerId }, data: { followingCount: { increment: 1 } } });
    await prisma.user.update({ where: { id: targetId }, data: { followerCount: { increment: 1 } } });
    return { requestSent: true, status: 'followed' };
  } else {
    // private: check existing request
    const existingRequest = await prisma.followRequest.findUnique({
      where: { requesterId_targetId: { requesterId: followerId, targetId } },
    });
    if (existingRequest) {
      if (existingRequest.status === 'pending') throw new Error('درخواست در حال بررسی است');
      if (existingRequest.status === 'accepted') {
        // convert to follow
        await prisma.follow.create({ data: { followerId, followingId: targetId } });
        await prisma.followRequest.delete({ where: { id: existingRequest.id } });
        // increment counts
        await prisma.user.update({ where: { id: followerId }, data: { followingCount: { increment: 1 } } });
        await prisma.user.update({ where: { id: targetId }, data: { followerCount: { increment: 1 } } });
        return { requestSent: true, status: 'accepted' };
      }
    }
    // create request
    await prisma.followRequest.create({
      data: { requesterId: followerId, targetId, status: 'pending' },
    });
    return { requestSent: true, status: 'pending' };
  }
}

export async function acceptFollowRequest(requestId: string, targetId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const request = await tx.followRequest.findUnique({ where: { id: requestId } });
    if (!request || request.targetId !== targetId || request.status !== 'pending') throw new Error('درخواست نامعتبر');

    await tx.followRequest.update({ where: { id: requestId }, data: { status: 'accepted' } });
    await tx.follow.create({ data: { followerId: request.requesterId, followingId: targetId } });
    await tx.user.update({ where: { id: request.requesterId }, data: { followingCount: { increment: 1 } } });
    await tx.user.update({ where: { id: targetId }, data: { followerCount: { increment: 1 } } });
  });
}

export async function rejectFollowRequest(requestId: string, targetId: string): Promise<void> {
  const request = await prisma.followRequest.findUnique({ where: { id: requestId } });
  if (!request || request.targetId !== targetId) throw new Error('درخواست نامعتبر');
  await prisma.followRequest.update({ where: { id: requestId }, data: { status: 'rejected' } });
}

export async function getPendingFollowRequests(targetId: string): Promise<{ id: string; requester: { id: string; username: string; avatar?: string | null } }[]> {
  return prisma.followRequest.findMany({
    where: { targetId, status: 'pending' },
    select: {
      id: true,
      requester: { select: { id: true, username: true, avatar: true } },
    },
  });
}