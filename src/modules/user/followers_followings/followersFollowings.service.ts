import { PrismaClient } from '@prisma/client';
import { FollowerFollowingResponse } from './followersFollowings.types';
import { isBlocked } from '../../../utils/blockUtils';

const prisma = new PrismaClient();

export async function getFollowers(userId: string): Promise<FollowerFollowingResponse[]> {
    const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        select: {
            follower: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
            followerId: true,
        },
    });

    const filteredFollowers = [];
    for (const f of followers) {
      if (!(await isBlocked(userId, f.followerId))) {
        filteredFollowers.push(f.follower);
      }
    }
    return filteredFollowers;
}

export async function getFollowings(userId: string): Promise<FollowerFollowingResponse[]> {
    const followings = await prisma.follow.findMany({
        where: { followerId: userId },
        select: {
            following: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
            followingId: true,
        },
    });

    const filteredFollowings = [];
    for (const f of followings) {
      if (!(await isBlocked(userId, f.followingId))) {
        filteredFollowings.push(f.following);
      }
    }
    return filteredFollowings;
}