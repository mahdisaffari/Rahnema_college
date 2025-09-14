import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserMentionedPosts(
  userId: string,
  page: number,
  pageSize: number = 9
) {
  const skip = Math.max(0, (page - 1) * pageSize);
  const take = pageSize;

  const [mentions, totalCount] = await Promise.all([
    prisma.mention.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            caption: true,
            images: { select: { url: true }, take: 1 },
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    }),
    prisma.mention.count({ where: { userId } }),
  ]);

  const items = mentions.map((m) => ({
    mentionId: m.id,
    createdAt: m.createdAt.toISOString(),
    post: {
      id: m.post.id,
      caption: m.post.caption ?? null,
      thumbnail: m.post.images[0]?.url ?? null,
      author: {
        id: m.post.user.id,
        username: m.post.user.username,
        avatar: m.post.user.avatar ?? null,
      },
    },
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return { items, totalPages, totalCount, page, pageSize };
}
