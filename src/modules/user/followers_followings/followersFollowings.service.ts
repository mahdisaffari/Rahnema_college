import { PrismaClient } from '@prisma/client';
import { FollowerFollowingResponse } from './followersFollowings.types';

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
        },
    });
    return followers.map(f => f.follower);
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
        },
    });
    return followings.map(f => f.following);
}