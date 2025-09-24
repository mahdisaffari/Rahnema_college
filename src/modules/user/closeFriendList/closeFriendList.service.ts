import { PrismaClient } from '@prisma/client';
import { CloseFriend } from './closeFriendList.types';

const prisma = new PrismaClient();

export async function getCloseFriendList(userId: string): Promise<CloseFriend[]> {
    const closeFriends = await prisma.closeFriend.findMany({
        where: { userId },
        include: {
            friend: {
                select: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    avatar: true,
                },
            },
        },
    });

    return closeFriends.map((cf) => ({
        id: cf.friend.id,
        username: cf.friend.username,
        firstname: cf.friend.firstname,
        lastname: cf.friend.lastname,
        avatar: cf.friend.avatar,
    }));
}