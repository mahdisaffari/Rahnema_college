import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function blockUser(blockerId: string, targetUsername: string): Promise<{ blocked: boolean }> {
  const targetUser = await prisma.user.findUnique({ where: { username: targetUsername }, select: { id: true } });
  if (!targetUser) throw new Error("کاربر یافت نشد");
  const blockedId = targetUser.id;
  if (blockedId === blockerId) throw new Error("نمی‌توانید خودتان را بلاک کنید");

  const exists = await prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId, blockedId } } });
  if (exists) {
    // already blocked → treat as idempotent
    return { blocked: true };
  }

  await prisma.block.create({ data: { blockerId, blockedId } });

  // optional: clean relationships (follow, requests) between users
  await prisma.follow.deleteMany({ where: { OR: [ { followerId: blockerId, followingId: blockedId }, { followerId: blockedId, followingId: blockerId } ] } });
  await prisma.followRequest.deleteMany({ where: { OR: [ { requesterId: blockerId, targetId: blockedId }, { requesterId: blockedId, targetId: blockerId } ] } });

  return { blocked: true };
}

export async function unblockUser(blockerId: string, targetUsername: string): Promise<{ blocked: boolean }> {
  const targetUser = await prisma.user.findUnique({ where: { username: targetUsername }, select: { id: true } });
  if (!targetUser) throw new Error("کاربر یافت نشد");
  const blockedId = targetUser.id;

  const exists = await prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId, blockedId } } });
  if (!exists) {
    return { blocked: false };
  }

  await prisma.block.delete({ where: { blockerId_blockedId: { blockerId, blockedId } } });
  return { blocked: false };
}

export async function getBlockedUsers(blockerId: string): Promise<{ id: string; username: string; avatar: string | null }[]> {
  const blocks = await prisma.block.findMany({
    where: { blockerId },
    select: { blocked: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });

  return blocks.map(b => ({ id: b.blocked.id, username: b.blocked.username, avatar: b.blocked.avatar }));
}


