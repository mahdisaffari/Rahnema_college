import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserBookmarkedPosts(
  userId: string,
  page: number,
  pageSize: number = 9
) {
  const skip = Math.max(0, (page - 1) * pageSize);
  const take = pageSize;

  const [bookmarks, totalCount] = await Promise.all([
    prisma.bookmark.findMany({
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
    prisma.bookmark.count({ where: { userId } }),
  ]);

  const items = bookmarks.map((b) => ({
    bookmarkId: b.id,
    createdAt: b.createdAt.toISOString(),
    post: {
      id: b.post.id,
      caption: b.post.caption ?? null,
      thumbnail: b.post.images[0]?.url ?? null,
      author: {
        id: b.post.user.id,
        username: b.post.user.username,
        avatar: b.post.user.avatar ?? null,
      },
    },
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return { items, totalPages, totalCount, page, pageSize };
}
