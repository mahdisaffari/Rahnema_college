import { PrismaClient } from '@prisma/client';
import { minioClient } from '../../../config/minio.config';
import { PostResponse } from '../post.types';
import { uploadBufferToMinIO } from '../post.service';
import { extractHashtags } from '../../../utils/validators';

const prisma = new PrismaClient();
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "rahnama";

// virayesh post
export async function editPost(
  postId: string,
  userId: string,
  caption: string | undefined,
  images: Express.Multer.File[] | undefined,
  removeImageIds: string[] | undefined,
  mentions: string[] | undefined
): Promise<PostResponse> {
  // baresi vojood post va malekiyat
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true, images: true },
  });
  if (!post || post.userId !== userId) throw new Error('پست یافت نشد یا مالک نیستید');

  // hazf tasavir entekhab shode
  if (removeImageIds && removeImageIds.length > 0) {
    const imagesToDelete = await prisma.postImage.findMany({
      where: { id: { in: removeImageIds }, postId },
    });
    for (const img of imagesToDelete) {
      const objectName = img.url.split(`${BUCKET_NAME}/`)[1];
      await minioClient.removeObject(BUCKET_NAME, objectName).catch((err) => {
        throw new Error(`خطا در حذف تصویر از MinIO: ${err.message}`);
      });
    }
    await prisma.postImage.deleteMany({
      where: { id: { in: removeImageIds }, postId },
    });
  }

  // upload tasavir jadid
  interface PostImageInput { url: string }
  let newImages: PostImageInput[] = [];
  if (images && images.length > 0) {
    const uploadedUrls: string[] = await Promise.all(
      images.map((file) => uploadBufferToMinIO(file.buffer, file.originalname, 'posts'))
    );
    newImages = uploadedUrls.map((url) => ({ url }));
  }

  // hazf mention haye ghabli
  await prisma.mention.deleteMany({ where: { postId } });
  if (mentions && mentions.length > 0) {
    const users = await prisma.user.findMany({
      where: { username: { in: mentions } },
      select: { id: true },
    });
    await prisma.mention.createMany({
      data: users.map((user) => ({ postId, userId: user.id })),
    });
  }

  // hazf hashtag haye ghabli va ijad hashtag haye jadid
  const hashtags = caption ? extractHashtags(caption) : [];
  await prisma.postHashtag.deleteMany({ where: { postId } });
  if (hashtags.length > 0) {
    const hashtagRecords = await prisma.hashtag.findMany({
      where: { name: { in: hashtags } },
      select: { id: true, name: true },
    });
    await prisma.postHashtag.createMany({
      data: hashtags.map((hashtag) => ({
        postId,
        hashtagId: hashtagRecords.find((h) => h.name === hashtag)!.id,
      })),
    });
  }

  // update post
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      caption: caption ?? post.caption,
      images: { create: newImages },
    },
    include: {
      images: true,
      user: {
        select: {
          id: true,
          username: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      },
      mentions: {
        include: { user: { select: { id: true, username: true } } },
      },
      hashtags: {
        include: { hashtag: { select: { name: true } } },
      },
    },
  });

  return {
    id: updatedPost.id,
    caption: updatedPost.caption,
    images: updatedPost.images.map((img) => ({ id: img.id, url: img.url })),
    createdAt: updatedPost.createdAt.toISOString(),
    likeCount: updatedPost.likeCount,
    bookmarkCount: updatedPost.bookmarkCount,
    commentCount: updatedPost.commentCount, // afzodan commentCount be response
    user: updatedPost.user,
    isOwner: true,
    mentions: updatedPost.mentions.map((m) => ({ userId: m.userId, username: m.user.username })),
    hashtags: updatedPost.hashtags.map((h) => h.hashtag.name),
  };
}