import { PrismaClient } from '@prisma/client';
import { minioClient } from '../../../config/minio.config';
import { PostResponse } from '../post.types';
import { uploadBufferToMinIO } from '../post.service';
import { extractMentions } from '../../../utils/validators';

const prisma = new PrismaClient();
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "rahnama";

export async function editPost(
  postId: string,
  userId: string,
  caption: string | undefined,
  images: Express.Multer.File[] | undefined,
  removeImageIds: string[] | undefined
): Promise<PostResponse> {

    const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true, images: true },
  });
  if (!post || post.userId !== userId) throw new Error('پست یافت نشد یا مالک نیستید');

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

  interface PostImageInput { url: string }
  let newImages: PostImageInput[] = [];
  if (images && images.length > 0) {
    const uploadedUrls: string[] = await Promise.all(
      images.map((file) => uploadBufferToMinIO(file.buffer, file.originalname, 'posts'))
    );
    newImages = uploadedUrls.map((url) => ({ url }));
  }

  await prisma.mention.deleteMany({ where: { postId } });
  if (caption) {
    const mentions = extractMentions(caption);
    if (mentions.length > 0) {
      const users = await prisma.user.findMany({
        where: { username: { in: mentions } },
        select: { id: true },
      });
      await prisma.mention.createMany({
        data: users.map((user) => ({ postId, userId: user.id })),
      });
    }
  }


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
    },
  });

  return {
    id: updatedPost.id,
    caption: updatedPost.caption,
    images: updatedPost.images.map((img) => ({ id: img.id, url: img.url })),
    createdAt: updatedPost.createdAt.toISOString(),
    likeCount: updatedPost.likeCount,
    bookmarkCount: updatedPost.bookmarkCount,
    user: updatedPost.user,
    isOwner: true,
    mentions: updatedPost.mentions.map((m) => ({ userId: m.userId, username: m.user.username })),
  };
}