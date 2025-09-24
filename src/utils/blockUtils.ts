import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function isBlocked(userId: string, targetId: string): Promise<boolean> {
  if (!userId || !targetId || userId === targetId) return false;
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: targetId },
        { blockerId: targetId, blockedId: userId },
      ],
    },
  });
  return !!block;
}