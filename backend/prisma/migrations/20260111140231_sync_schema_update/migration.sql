/*
  Warnings:

  - You are about to drop the column `image_url` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TradeStatus" ADD VALUE 'ESCROW_LOCKED';
ALTER TYPE "TradeStatus" ADD VALUE 'DELIVERED';
ALTER TYPE "TradeStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "TradeStatus" ADD VALUE 'DISPUTED';

-- DropIndex
DROP INDEX "Conversation_updated_at_idx";

-- DropIndex
DROP INDEX "Message_created_at_idx";

-- DropIndex
DROP INDEX "Message_is_read_idx";

-- DropIndex
DROP INDEX "Profile_role_idx";

-- DropIndex
DROP INDEX "Review_created_at_idx";

-- DropIndex
DROP INDEX "Review_rating_idx";

-- DropIndex
DROP INDEX "Session_scheduled_at_idx";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "image_url",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "price_bc" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "display_name" TEXT;
