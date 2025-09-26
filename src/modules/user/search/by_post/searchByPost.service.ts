import { PrismaClient, Prisma } from '@prisma/client';
import { SearchPostsQuery, SearchPostsResponse } from './searchByPost.types';
import { extractHashtags } from '../../../../utils/validators';
import { isBlocked } from '../../../../utils/blockUtils';

type PostWithIncludes = Prisma.PostGetPayload<{
  include: {
    images: { select: { url: true } };
    user: { select: { id: true; username: true; avatar: true } };
    hashtags: { select: { hashtag: { select: { name: true } } } }; 
    _count: { select: { likes: true } };
  };
}>;

const prisma = new PrismaClient();

export class SearchByPostService {
    async searchPostsByHashtag({ q, page, limit, viewerId }: SearchPostsQuery & { viewerId?: string }): Promise<SearchPostsResponse> {
        try {
            const hashtags = extractHashtags(q);
            if (!hashtags.length) {
                throw new Error('هشتگ معتبر نیست');
            }

            const skip = (page - 1) * limit;

            const baseWhere: Prisma.PostWhereInput = {
                hashtags: {
                    some: {
                        hashtag: {
                            name: { startsWith: hashtags[0].toLowerCase() },
                        },
                    },
                },
            };

            const privacyOr: Prisma.PostWhereInput['OR'] = [
                { user: { isPrivate: false } },
                { userId: viewerId },
            ];
            if (viewerId) {
                privacyOr.push({
                    user: { 
                        followers: { 
                            some: { followerId: viewerId } 
                        } 
                    }
                });
            }
            baseWhere.OR = privacyOr;

            if (viewerId) {
                baseWhere.AND = {
                    OR: [
                        { isCloseFriendsOnly: false },
                        { 
                            AND: [
                                { isCloseFriendsOnly: true },
                                { userId: viewerId }
                            ]
                        },
                        { 
                            AND: [
                                { isCloseFriendsOnly: true },
                                { user: { closeFriendsSent: { some: { friendId: viewerId } } } }  
                            ]
                        },
                    ],
                };
            } else {
                baseWhere.isCloseFriendsOnly = false;
            }

            const [posts, total, suggestedHashtags] = await Promise.all([
                prisma.post.findMany({
                    where: baseWhere,
                    include: {
                        images: {
                            select: { url: true },
                        },
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            },
                        },
                        hashtags: {
                            select: {
                                hashtag: {
                                    select: { name: true },
                                },
                            },
                        },
                        _count: {
                            select: {
                                likes: true,
                            },
                        },
                    },
                    orderBy: {
                        likes: {
                            _count: 'desc',
                        },
                    },
                    skip,
                    take: limit,
                }) as Promise<PostWithIncludes[]>, 
                prisma.post.count({
                    where: baseWhere,
                }),
                prisma.hashtag.findMany({
                    where: {
                        name: { startsWith: hashtags[0].toLowerCase() },
                    },
                    select: { name: true },
                    take: 10,
                }),
            ]);

            const filteredPosts = [];
            for (const post of posts) {
              if (viewerId && !(await isBlocked(viewerId, post.user.id))) {
                filteredPosts.push(post);
              } else if (!viewerId) {
                filteredPosts.push(post);
              }
            }

            const formattedPosts = filteredPosts.map((post) => ({
                id: post.id,
                images: post.images.map((img: { url: string }) => img.url),  
                likeCount: post._count.likes,
                hashtags: post.hashtags.map((h) => `#${h.hashtag.name}`), 
                user: post.user,
            }));

            return {
                success: true,
                data: {
                    posts: formattedPosts,
                    pagination: {
                        page,
                        limit,
                        total_records: filteredPosts.length, 
                        total_pages: Math.ceil(filteredPosts.length / limit),
                    },
                    suggestedHashtags: suggestedHashtags.map(h => `#${h.name}`),
                },
                message: 'جستجو با موفقیت انجام شد',
            };
        } catch (error) {
            throw error;
        }
    }
}