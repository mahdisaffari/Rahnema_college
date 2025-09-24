import { PrismaClient } from '@prisma/client';
import { minioClient } from '../../config/minio.config';
import { PostResponse, UserPostsResponse } from './post.types';
import { extractHashtags } from '../../utils/validators';

const prisma = new PrismaClient();

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "rahnama";

export async function uploadBufferToMinIO(
  buffer: Buffer,
  filename: string,
  folder: string = 'posts'
): Promise<string> {
  const objectName = `${folder}/${Date.now()}-${filename}`;
  try {
    await minioClient.putObject(BUCKET_NAME, objectName, buffer);
    const url = `${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${BUCKET_NAME}/${objectName}`;
    return url;
  } catch (error) {
    throw new Error(`Failed to upload file to MinIO: ${error}`);
  }
}

export async function createPostWithImages(
  userId: string,
  caption: string | undefined,
  images: Express.Multer.File[],
  mentions: string[] | undefined,
  isCloseFriendsOnly: boolean = false
): Promise<PostResponse> {
  if (!images || images.length === 0) throw new Error('No images provided');

  const uploadedUrls: string[] = await Promise.all(
    images.map((file) => uploadBufferToMinIO(file.buffer, file.originalname, 'posts'))
  );

  const hashtags = caption ? extractHashtags(caption) : [];

  const created = await prisma.post.create({
    data: {
      caption: caption ?? null,
      isCloseFriendsOnly,
      userId,
      images: {
        create: uploadedUrls.map((url) => ({ url })),
      },
    },
    include: {
      images: true,
      user: { select: { id: true, username: true, firstname: true, lastname: true, avatar: true } },
      mentions: { include: { user: { select: { id: true, username: true } } } },
      hashtags: { include: { hashtag: { select: { name: true } } } },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { postCount: { increment: 1 } },
  });

  if (mentions && mentions.length > 0) {
    const users = await prisma.user.findMany({
      where: { username: { in: mentions } },
      select: { id: true, username: true },
    });
    await prisma.mention.createMany({
      data: users.map((user) => ({ postId: created.id, userId: user.id })),
    });
  }

  if (hashtags.length > 0) {
    const hashtagRecords = await prisma.hashtag.findMany({
      where: { name: { in: hashtags } },
      select: { id: true, name: true },
    });
    const missingHashtags = hashtags.filter((h) => !hashtagRecords.some((hr) => hr.name === h));
    if (missingHashtags.length > 0) {
      await prisma.hashtag.createMany({
        data: missingHashtags.map((name) => ({ name })),
      });
    }
    const updatedHashtagRecords = await prisma.hashtag.findMany({
      where: { name: { in: hashtags } },
      select: { id: true, name: true },
    });
    await prisma.postHashtag.createMany({
      data: hashtags.map((hashtag) => ({
        postId: created.id,
        hashtagId: updatedHashtagRecords.find((h) => h.name === hashtag)!.id,
      })),
    });
  }

  const postWithDetails = await prisma.post.findUnique({
    where: { id: created.id },
    include: {
      images: true,
      user: { select: { id: true, username: true, firstname: true, lastname: true, avatar: true } },
      mentions: { include: { user: { select: { id: true, username: true } } } },
      hashtags: { include: { hashtag: { select: { name: true } } } },
      likes: { select: { id: true } },
      bookmarks: { select: { id: true } },
    },
  });

  return {
    id: postWithDetails!.id,
    caption: postWithDetails!.caption,
    images: postWithDetails!.images.map((img) => ({ id: img.id, url: img.url })),
    createdAt: postWithDetails!.createdAt.toISOString(),
    likeCount: postWithDetails!.likeCount,
    bookmarkCount: postWithDetails!.bookmarkCount,
    commentCount: postWithDetails!.commentCount,
    user: {
      id: postWithDetails!.user.id,
      username: postWithDetails!.user.username,
      firstname: postWithDetails!.user.firstname,
      lastname: postWithDetails!.user.lastname,
      avatar: postWithDetails!.user.avatar,
    },
    isOwner: true,
    isLiked: false,
    isBookmarked: false,
    mentions: postWithDetails!.mentions.map((m) => ({ userId: m.userId, username: m.user.username })),
    hashtags: postWithDetails!.hashtags.map((h) => h.hashtag.name),
    isCloseFriendsOnly: postWithDetails!.isCloseFriendsOnly,
  };
}

export async function getPostById(postId: string, currentUserId?: string): Promise<PostResponse | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      images: true,
      user: {
        select: { id: true, username: true, firstname: true, lastname: true, avatar: true },
      },
      mentions: {
        include: { user: { select: { id: true, username: true } } },
      },
      hashtags: {
        include: { hashtag: { select: { name: true } } },
      },
      likes: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { id: true },
          }
        : false,
      bookmarks: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { id: true },
          }
        : false,
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    caption: post.caption,
    images: post.images.map((img) => ({ id: img.id, url: img.url })),
    createdAt: post.createdAt.toISOString(),
    likeCount: post.likeCount,
    bookmarkCount: post.bookmarkCount,
    commentCount: post.commentCount,
    user: {
      id: post.user.id,
      username: post.user.username,
      firstname: post.user.firstname,
      lastname: post.user.lastname,
      avatar: post.user.avatar,
    },
    isOwner: currentUserId ? post.userId === currentUserId : false,
    isLiked: currentUserId ? post.likes.length > 0 : false,
    isBookmarked: currentUserId ? post.bookmarks.length > 0 : false,
    mentions: post.mentions.map((m) => ({ userId: m.userId, username: m.user.username })),
    hashtags: post.hashtags.map((h) => h.hashtag.name),
    isCloseFriendsOnly: post.isCloseFriendsOnly,
  };
}

export async function getUserPosts(
  username: string,
  currentUserId: string | undefined,
  page: number,
  limit: number
): Promise<UserPostsResponse['data'] | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      firstname: true,
      lastname: true,
      avatar: true,
      postCount: true,
      posts: {
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          caption: true,
          images: { select: { id: true, url: true } },
          createdAt: true,
          likeCount: true,
          bookmarkCount: true,
          commentCount: true,
          mentions: {
            include: { user: { select: { id: true, username: true } } },
          },
          hashtags: {
            include: { hashtag: { select: { name: true } } },
          },
          isCloseFriendsOnly: true,
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
          bookmarks: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
        },
      },
    },
  });

  if (!user) return null;

  return {
    user: {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      avatar: user.avatar,
    },
    posts: user.posts.map((post) => ({
      id: post.id,
      caption: post.caption,
      images: post.images,
      createdAt: post.createdAt.toISOString(),
      likeCount: post.likeCount,
      bookmarkCount: post.bookmarkCount,
      commentCount: post.commentCount,
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        avatar: user.avatar,
      },
      isOwner: currentUserId ? user.id === currentUserId : false,
      isLiked: currentUserId ? post.likes.length > 0 : false,
      isBookmarked: currentUserId ? post.bookmarks.length > 0 : false,
      mentions: post.mentions.map((m) => ({ userId: m.userId, username: m.user.username })),
      hashtags: post.hashtags.map((h: { hashtag: { name: string } }) => h.hashtag.name),
      isCloseFriendsOnly: post.isCloseFriendsOnly,
    })),
    total: user.postCount,
  };
}