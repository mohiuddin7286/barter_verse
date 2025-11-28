-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE INDEX "Profile_role_idx" ON "Profile"("role");
