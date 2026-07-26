CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
ALTER TABLE "Course" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve existing production data while making categories first-class records.
INSERT INTO "Category" ("id", "name", "updatedAt")
SELECT 'legacy_' || md5("category"), "category", CURRENT_TIMESTAMP
FROM "Course"
WHERE "category" IS NOT NULL AND "category" <> ''
ON CONFLICT ("name") DO NOTHING;

UPDATE "Course" AS course
SET "categoryId" = category."id"
FROM "Category" AS category
WHERE category."name" = course."category";
