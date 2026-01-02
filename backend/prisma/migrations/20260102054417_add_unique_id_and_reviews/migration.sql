/*
  Warnings:

  - A unique constraint covering the columns `[uniqueId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "uniqueId" TEXT;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "trade_id" TEXT,
    "listing_id" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_author_id_idx" ON "Review"("author_id");

-- CreateIndex
CREATE INDEX "Review_target_user_id_idx" ON "Review"("target_user_id");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_created_at_idx" ON "Review"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_uniqueId_key" ON "Profile"("uniqueId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
