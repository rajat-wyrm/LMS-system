-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "instructorResponderId" TEXT,
ADD COLUMN     "instructorResponse" TEXT;

-- CreateIndex
CREATE INDEX "Review_instructorResponderId_idx" ON "Review"("instructorResponderId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_instructorResponderId_fkey" FOREIGN KEY ("instructorResponderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
