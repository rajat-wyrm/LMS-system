-- AlterEnum
ALTER TYPE "ReviewStatus" ADD VALUE 'removed';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedById" TEXT,
ADD COLUMN     "moderationNote" TEXT;

-- CreateIndex
CREATE INDEX "Review_moderatedById_idx" ON "Review"("moderatedById");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
