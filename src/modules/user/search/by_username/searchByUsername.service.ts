import { PrismaClient } from "@prisma/client";
import { UserResponse } from "../../user.types";
import { isBlocked } from "../../../../utils/blockUtils";

const prisma = new PrismaClient();

export async function searchByUsername(
  { username, page, limit }: { username: string; page: number; limit: number },
  currentUserId: string
): Promise<{ users: UserResponse[]; total: number }> {
  const skip = (page - 1) * limit;

  const [usersData, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        username: {
          startsWith: username, 
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        bio: true,
        avatar: true,
        postCount: true,
        followerCount: true,
        followingCount: true,
        isPrivate: true, 
        following: {
          select: { followerId: true },
          where: { followerId: currentUserId },
        },
        followers: {
          select: { followingId: true },
          where: { followingId: currentUserId },
        },
      },
      skip,
      take: limit,
      orderBy: { username: 'asc' }, 
    }),
    prisma.user.count({
      where: {
        username: {
          startsWith: username,
          mode: "insensitive",
        },
      },
    }),
  ]);

  const filteredUsersData = [];
  for (const user of usersData) {
    if (!(await isBlocked(currentUserId, user.id))) {
      filteredUsersData.push(user);
    }
  }

  const users: UserResponse[] = filteredUsersData.map(user => ({
    ...user,
    isFollowedByMe: user.following.length > 0,
    isFollowingMe: user.followers.length > 0,
  }));

  return { users, total: filteredUsersData.length }; 
}