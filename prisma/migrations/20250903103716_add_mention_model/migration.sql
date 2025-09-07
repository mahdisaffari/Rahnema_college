-- CreateTable
CREATE TABLE "public"."Mention" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mention_postId_idx" ON "public"."Mention"("postId");

-- CreateIndex
CREATE INDEX "Mention_userId_idx" ON "public"."Mention"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mention_postId_userId_key" ON "public"."Mention"("postId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Mention" ADD CONSTRAINT "Mention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mention" ADD CONSTRAINT "Mention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
