/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserWishlist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "CourseActivity" DROP CONSTRAINT "CourseActivity_courseId_fkey";

-- DropForeignKey
ALTER TABLE "_UserWishlist" DROP CONSTRAINT "_UserWishlist_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserWishlist" DROP CONSTRAINT "_UserWishlist_B_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "CourseActivity";

-- DropTable
DROP TABLE "_UserWishlist";
