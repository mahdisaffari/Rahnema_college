import { PrismaClient } from '@prisma/client';
import { SearchPostsQuery, SearchPostsResponse } from './searchByPost.types';
import { extractHashtags } from '../../../../utils/validators';

const prisma = new PrismaClient();

export class SearchByPostService {
    async searchPostsByHashtag({ q, page, limit }: SearchPostsQuery): Promise<SearchPostsResponse> {
        try {
            const hashtags = extractHashtags(q);
            if (!hashtags.length) {
                throw new Error('هشتگ معتبر نیست');
            }

            const skip = (page - 1) * limit;

            const [posts, total] = await Promise.all([
                prisma.post.findMany({
                    where: {
                        hashtags: {
                            some: {
                                hashtag: {
                                    name: { in: hashtags.map(h => h.toLowerCase()) },
                                },
                            },
                        },
                    },
                    select: {
                        id: true,
                        images: {
                            select: { url: true },
                        },
                        _count: {
                            select: {
                                likes: true,
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
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
                }),
                prisma.post.count({
                    where: {
                        hashtags: {
                            some: {
                                hashtag: {
                                    name: { in: hashtags.map(h => h.toLowerCase()) },
                                },
                            },
                        },
                    },
                }),
            ]);

            const formattedPosts = posts.map((post) => ({
                id: post.id,
                images: post.images.map((img) => img.url),
                likeCount: post._count.likes,
                user: post.user,
            }));

            return {
                success: true,
                data: {
                    posts: formattedPosts,
                    pagination: {
                        page,
                        limit,
                        total_records: total,
                        total_pages: Math.ceil(total / limit),
                    },
                },
                message: 'جستجو با موفقیت انجام شد',
            };
        } catch (error) {
            throw error;
        }
    }
}