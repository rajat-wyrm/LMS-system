CREATE TYPE "UserStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');

CREATE TYPE "CourseStatus" AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'pending';

ALTER TABLE "Course"
ADD COLUMN IF NOT EXISTS "status" "CourseStatus" NOT NULL DEFAULT 'pending';

UPDATE "User"
SET "status" = 'pending'
WHERE "status" IS NULL
   OR "status" NOT IN ('pending', 'approved', 'rejected', 'suspended');

UPDATE "Course"
SET "status" = 'pending'
WHERE "status" IS NULL
   OR "status" NOT IN ('pending', 'approved', 'rejected');

ALTER TABLE "User"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "UserStatus" USING ("status"::"UserStatus"),
ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "Course"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "CourseStatus" USING ("status"::"CourseStatus"),
ALTER COLUMN "status" SET DEFAULT 'pending';
